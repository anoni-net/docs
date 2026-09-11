/*
 * 截圖遮蔽的臉部偵測，跑在 worker 裡。呼叫端是 docs/zh-TW/js/redact.js 的 findFaces。
 *
 * === 為什麼要有這一支 ===
 *
 * pico 的 run_cascade 是同步的，留在主執行緒上就是整頁凍住。量過一張 4032x3024
 * 的照片（縮到工作尺寸 1920x1440），在六倍 CPU 節流下各段的耗時是
 *
 *   drawImage 縮圖      19ms   0.9%
 *   getImageData        65ms   3.0%
 *   灰階迴圈            55ms   2.6%
 *   run_cascade       2005ms  93.4%
 *   分群                 3ms   0.1%
 *
 * 掃描那一段佔了九成三，搬進 worker 之後主執行緒剩下不到 4%，轉圈會真的轉，
 * 頁面也還捲得動。canvas 只有主執行緒碰得到，前兩段搬不走，那 84ms 可以接受。
 *
 * 灰階迴圈放在這裡而不是留在呼叫端，是因為傳過來的 RGBA 是可轉移的緩衝區，
 * 轉移之後主執行緒那一份就失效了，順手在這邊轉成灰階不必多複製一次。
 *
 * 掃描本身在 redact-detect.js，退回頁面裡做的那一條共用同一份。三個角度各掃一次，
 * 第一個角度掃完就先回一批結果，那一批是直立的臉，畫面可以先把框畫出來。
 *
 * === 不做的事 ===
 *
 * 只有一個 fetch，網址由相對路徑組出來，指向本站 vendor 的級聯資料。沒有第二個
 * 參數就不可能帶 method 或 body。除了把偵測結果回傳給開啟它的頁面之外，這裡沒有
 * 任何送出或留存資料的手段，圖片的像素不會離開這個分頁。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * tools/test_redact.mjs 掃這一支的原始碼，出現任何送出或留存的手段就紅。
 */
"use strict";

// 位置是相對於這一支自己的網址（docs 的 js/ 底下），不是相對於頁面。
// redact-detect.js 是掃描核心，跟退回頁面裡做的那一條共用同一份實作。
importScripts("../utils/vendor/pico/pico.js", "redact-detect.js");

let cascade = null;
let loading = null;

function loadCascade() {
  if (cascade) return Promise.resolve(cascade);
  if (!loading) {
    loading = (async () => {
      try {
        const url = new URL("../utils/vendor/pico/facefinder", location.href).href;
        const response = await fetch(url);
        if (!response.ok) throw new Error("no cascade");
        cascade = pico.unpack_cascade(new Uint8Array(await response.arrayBuffer()));
        return cascade;
      } catch (err) {
        // 失敗就讓下一次重試，不要卡在一個永遠不會完成的 promise 上
        loading = null;
        return null;
      }
    })();
  }
  return loading;
}

self.onmessage = async (event) => {
  const job = event.data || {};
  const classify = await loadCascade();
  if (!classify) {
    self.postMessage({ id: job.id, ok: false });
    return;
  }
  try {
    const rgba = new Uint8ClampedArray(job.rgba);
    const gray = new Uint8Array(job.width * job.height);
    for (let i = 0; i < gray.length; i += 1) {
      const at = i * 4;
      gray[i] = (rgba[at] * 0.299 + rgba[at + 1] * 0.587 + rgba[at + 2] * 0.114) | 0;
    }
    // 第一個角度掃完先回一批，畫面可以把直立的臉先框出來，剩下的角度繼續掃。
    const dets = await self.redactDetect.scanAngles(
      pico, classify, gray, job.width, job.height, job,
      {
        onPartial: (partial) => {
          self.postMessage({ id: job.id, ok: true, partial: true, dets: partial });
        },
      }
    );
    self.postMessage({ id: job.id, ok: true, partial: false, dets: dets });
  } catch (err) {
    self.postMessage({ id: job.id, ok: false });
  }
};
