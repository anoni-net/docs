/*
 * 截圖遮蔽的臉部掃描核心。三個地方共用這一份：
 *
 *   - docs/zh-TW/js/redact-worker.js（正常路徑，跑在 worker 裡）
 *   - docs/zh-TW/js/redact.js 的 detectInPage（worker 起不來時的退路）
 *   - tools/check_redact_detect.mjs（量召回與多框的檢查工具）
 *
 * 分成獨立一支是因為這三邊算出來的東西必須完全一樣。退路少掃一個角度，讀者會
 * 拿到一張少遮幾張臉的圖而完全不知情，那是這一頁最不能接受的失敗方式。
 *
 * === 為什麼要轉圖 ===
 *
 * pico 的 classify_region 照 tcodes 裡的固定偏移量取像素兩兩比大小，那些偏移量
 * 是軸對齊的，級聯也是拿直立的臉訓練的，沒有角度參數。要抓傾斜的臉只能把圖轉
 * 過去再掃一次，再把找到的位置轉回來。
 *
 * 理論上也可以改轉 tcodes，等於把偵測器轉過去，省掉旋轉那一步。但 tcodes 在級聯
 * 二進位檔裡，要改就得在 unpack_cascade 之前把檔案拆開重組，而 pico.js 與
 * facefinder 的 SHA-256 記在 utils/vendor/README.md，那兩個檔案的定位是跟上游
 * 逐位元組相同。為了一個效能優化去動那條線不划算。
 *
 * === 為什麼最後才分一次群 ===
 *
 * 每個角度的原始偵測先轉回原座標，全部接成一串，最後才跑一次 cluster_detections。
 * 它的分數是成員總和，同一張臉在兩個角度都被看到會加起來，等於多角度投票。
 * 各自分群再合併就拿不到這個效果。
 */
(function (root) {
  "use strict";

  // 把灰階緩衝區繞中心轉一個角度。雙線性取樣，最近鄰的鋸齒會直接影響 pico 的
  // 像素兩兩比大小。轉出畫面外的地方留 0，四角因此會被裁掉，那些位置在 0 度
  // 那一輪還是掃得到。
  //
  // 不放大畫布是刻意的。±25 度要完整包住得放大約 1.5 倍，掃描時間跟面積成正比，
  // 那等於再多付一半的代價去換四個角落。
  function rotateGray(gray, width, height, deg) {
    if (!deg) return gray;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const cx = (width - 1) / 2;
    const cy = (height - 1) / 2;
    const out = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) {
      const dy = y - cy;
      for (let x = 0; x < width; x += 1) {
        const dx = x - cx;
        const sx = cos * dx - sin * dy + cx;
        const sy = sin * dx + cos * dy + cy;
        if (sx < 0 || sy < 0 || sx >= width - 1 || sy >= height - 1) continue;
        const x0 = sx | 0;
        const y0 = sy | 0;
        const fx = sx - x0;
        const fy = sy - y0;
        const i = y0 * width + x0;
        const a = gray[i];
        const b = gray[i + 1];
        const c = gray[i + width];
        const d = gray[i + width + 1];
        out[y * width + x] = (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) | 0;
      }
    }
    return out;
  }

  // 轉過的圖上找到的框，中心點用同一個角度轉回原座標。rotateGray 的輸出取樣自
  // R(deg) 之後的來源位置，所以反推回去用的是同一個 R(deg)。偵測窗是正方形，
  // 旋轉不改變尺寸，size 與分數原封不動。
  function mapBack(det, deg, width, height) {
    if (!deg) return det;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const cx = (width - 1) / 2;
    const cy = (height - 1) / 2;
    const dx = det[1] - cx;
    const dy = det[0] - cy;
    return [sin * dx + cos * dy + cy, cos * dx - sin * dy + cx, det[2], det[3]];
  }

  function cluster(pico, dets, params) {
    return pico.cluster_detections(dets, params.iou).filter((det) => det[3] > params.minQuality);
  }

  // 逐個角度掃描，原始偵測全部轉回原座標之後才分一次群。
  //
  // hooks.onPartial 在第一個角度掃完時被呼叫一次，帶著只有那個角度的結果。
  // params.angles 的第一個一定是 0，所以那一批就是直立的臉，畫面可以先把框畫
  // 出來，剩下的角度繼續掃。
  //
  // hooks.pause 在每個角度之間被 await 一次。worker 裡不需要（那條執行緒本來
  // 就沒有畫面要更新），退回頁面裡做的時候靠它把一段長阻塞切成幾段，轉圈與
  // 秒數才有機會更新。
  async function scanAngles(pico, cascade, gray, width, height, params, hooks) {
    const onPartial = (hooks && hooks.onPartial) || null;
    const pause = (hooks && hooks.pause) || null;
    const angles = params.angles && params.angles.length ? params.angles : [0];
    const combined = [];
    for (let i = 0; i < angles.length; i += 1) {
      const deg = angles[i];
      if (i > 0 && pause) await pause();
      const pixels = rotateGray(gray, width, height, deg);
      const raw = pico.run_cascade(
        { pixels: pixels, nrows: height, ncols: width, ldim: width },
        cascade,
        {
          shiftfactor: params.shiftFactor,
          minsize: params.minSize,
          maxsize: Math.max(width, height),
          scalefactor: params.scaleFactor,
        }
      );
      for (const det of raw) combined.push(mapBack(det, deg, width, height));
      if (i === 0 && onPartial && angles.length > 1) onPartial(cluster(pico, combined, params));
    }
    return cluster(pico, combined, params);
  }

  root.redactDetect = {
    rotateGray: rotateGray,
    mapBack: mapBack,
    scanAngles: scanAngles,
  };
})(typeof self !== "undefined" ? self : this);
