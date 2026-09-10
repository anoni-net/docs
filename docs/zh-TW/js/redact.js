/*
 * 截圖遮蔽（utils/redact.md）。
 *
 * activist、lgbtq、domestic-violence 三個場景頁都要讀者把對話或威脅的截圖交給社工、
 * 律師或平台。截圖裡除了對方，還有第三人的名字、頭像、電話，以及讀者自己的帳號。
 * 手機內建的塗鴉多半是模糊或馬賽克，兩種都保留了原內容的統計特徵，文字尤其容易
 * 還原。這一頁只做實心填色，並在交給讀者之前把輸出實際解開一次，逐像素檢查每個
 * 方框。
 *
 * === 為什麼一定重新編碼 ===
 *
 * strip-metadata 守的是無損，這一頁反過來：遮蔽本來就要改像素。重新編碼順便讓
 * 原檔的 EXIF、XMP、縮圖一個都帶不過去，canvas 匯出的檔案只有畫面本身。檔名也
 * 固定成 redacted.png 或 redacted.jpg，截圖的原始檔名常帶 app 名稱與精確到秒的
 * 時間，那本身就是一種洩漏。
 *
 * === 臉部偵測只提候選框 ===
 *
 * 2026-09 之前這裡寫的是「不做臉部偵測」，理由是模型無法替讀者判斷該遮什麼。
 * 那個理由現在仍然成立，改的是做法：偵測只把框畫出來，讀者看得到、刪得掉、
 * 補得上，按下產生的仍然是人。省掉的是重複勞動，不是判斷。
 *
 * 第一版把偵測到的框直接填成實心黑，跟上面這一段相反，也跟 utils/redact.md 的
 * 「不做的事」相反。現在偵測結果先當候選框，畫成空心的線，點一下移掉，按下
 * 「全部遮起來」才整批變成實心。候選框還在的時候不給產生輸出，免得有人以為
 * 框好就等於遮好。
 *
 * 用 pico.js（MIT，約兩百行）而不是 TensorFlow.js 那條路。後者要 tfjs-core
 * 加 tfjs-converter 加 backend 加模型權重，量到約 1.2 MB，pico 這條是 240 KB，
 * 純 JavaScript 不碰 WebGL，Tor Browser 只要 JS 開著就能執行。代價是它只抓得到
 * 正面、直立、夠大的臉，那個代價由「機器只提案」這個設計吸收。
 *
 * 偵測用的程式與資料按下按鈕才載入，只想手動拉框的人不會被迫下載。
 *
 * 掃描本身跑在 worker 裡（js/redact-worker.js）。run_cascade 是同步的，留在主
 * 執行緒上就是整頁凍住，量過一張手機拍的照片在六倍 CPU 節流下要兩秒多，而且
 * 那段時間連轉圈都不會轉。worker 起不來就退回頁面裡做，卡幾秒比功能消失好。
 *
 * === 不做的事 ===
 *
 * 不做全自動遮蔽，理由見上一段。不做模糊與馬賽克。不處理影片。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_redact.mjs 原地抽出來測，那支另外掃原始碼確認沒有任何送出
 * 或留存資料的手段，也沒有用到模糊。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_redact.mjs 從這裡原地抽出來測）---

  // 填色固定純黑。不給選色：多一個選項就多一個誤操作的機會，而黑色在任何底色上
  // 都看得出來是遮蔽，不會被誤認為畫面內容。
  const FILL = "#000000";
  const FILL_RGB = [0, 0, 0];

  // 候選框與正在拖的那一個用同一個藍。它只出現在畫面上，輸出前會重畫一次不帶它。
  const MARK = "#00aeff";

  // 影像座標上最短邊小於這個值的方框當成誤觸，不收。手指在螢幕上點一下常會有
  // 一兩個像素的位移，收進去會變成看不見卻算一處的遮蔽。
  const MIN_SIDE = 4;

  // 手機上的 canvas 撐不了太大的畫布，iOS Safari 的上限長期在一千六百萬像素左右。
  // 超過就先縮。遮蔽只跟位置有關，縮小不影響安全性。
  const MAX_PIXELS = 16000000;

  // 輸出解開之後每個方框要多乾淨。PNG 無損，一個像素都不能差。JPEG 在方框邊緣會
  // 有一兩個像素的壓縮雜訊，往內縮幾個像素再檢查，容許一點色偏。
  const VERIFY = {
    "image/png": { inset: 0, tolerance: 0 },
    "image/jpeg": { inset: 3, tolerance: 24 },
  };

  // 拖出來的兩個角落換成整數方框。任何方向拖都一樣，左上取 floor、右下取 ceil，
  // 被方框碰到一部分的像素整個算進去，邊緣不會留一條半遮的原內容。
  function normalizeBox(x1, y1, x2, y2, width, height) {
    const left = Math.max(0, Math.floor(Math.min(x1, x2)));
    const top = Math.max(0, Math.floor(Math.min(y1, y2)));
    const right = Math.min(width, Math.ceil(Math.max(x1, x2)));
    const bottom = Math.min(height, Math.ceil(Math.max(y1, y2)));
    const w = right - left;
    const h = bottom - top;
    if (w < MIN_SIDE || h < MIN_SIDE) return null;
    return { x: left, y: top, w: w, h: h };
  }

  // 畫面上的座標換成影像座標。canvas 用 CSS 縮到版面寬度，兩軸各自算比例。
  function toImagePoint(clientX, clientY, rect, width, height) {
    const sx = rect.width ? width / rect.width : 1;
    const sy = rect.height ? height / rect.height : 1;
    const x = (clientX - rect.left) * sx;
    const y = (clientY - rect.top) * sy;
    return {
      x: Math.min(width, Math.max(0, x)),
      y: Math.min(height, Math.max(0, y)),
    };
  }

  // 超過像素上限的圖等比縮到上限以內。
  function fitWithin(width, height, maxPixels) {
    const limit = maxPixels || MAX_PIXELS;
    if (width * height <= limit) return { w: width, h: height, scale: 1 };
    const scale = Math.sqrt(limit / (width * height));
    return {
      w: Math.max(1, Math.floor(width * scale)),
      h: Math.max(1, Math.floor(height * scale)),
      scale: scale,
    };
  }

  // 輸出格式跟著輸入走。JPEG 與 HEIC 進來的是照片，輸出 PNG 會大好幾倍，改用 JPEG。
  // 其他一律 PNG，截圖用無損格式不再損失畫質。
  function outputType(inputType) {
    const type = String(inputType || "").toLowerCase();
    if (type === "image/jpeg" || type === "image/heic" || type === "image/heif") {
      return "image/jpeg";
    }
    return "image/png";
  }

  // 檔名固定，不帶原檔名。
  function outputName(type) {
    return type === "image/jpeg" ? "redacted.jpg" : "redacted.png";
  }

  // 檢查輸出裡每個方框是不是純黑。pixels 是 RGBA，一列 width 個像素。
  // 回傳 { ok, bad }，bad 是沒過的方框索引。方框太小、inset 之後沒剩的，就縮小
  // inset 到還有東西可檢查為止。
  function verifyBoxes(pixels, width, boxes, options) {
    const inset = (options && options.inset) || 0;
    const tolerance = (options && options.tolerance) || 0;
    const bad = [];
    boxes.forEach((box, index) => {
      const pad = Math.max(
        0,
        Math.min(inset, Math.floor((box.w - 1) / 2), Math.floor((box.h - 1) / 2))
      );
      for (let y = box.y + pad; y < box.y + box.h - pad; y += 1) {
        for (let x = box.x + pad; x < box.x + box.w - pad; x += 1) {
          const i = (y * width + x) * 4;
          if (
            Math.abs(pixels[i] - FILL_RGB[0]) > tolerance ||
            Math.abs(pixels[i + 1] - FILL_RGB[1]) > tolerance ||
            Math.abs(pixels[i + 2] - FILL_RGB[2]) > tolerance ||
            pixels[i + 3] < 255 - tolerance
          ) {
            bad.push(index);
            return;
          }
        }
      }
    });
    return { ok: bad.length === 0, bad: bad };
  }


  // 偵測用的參數。這幾個值決定漏抓與多抓之間站在哪裡，而在這一頁漏抓比多抓貴，
  // 因為多抓的框讀者按一下就刪掉，漏抓的臉會跟著圖送出去。所以門檻取得偏低。
  const DETECT = {
    // pico 分群後的分數是成員分數的總和，反映「有多少個重疊偵測投票給這張臉」，
    // 不是單次的信心值。所以遮擋會讓分數整段掉下來，而不只是掉一點。
    //
    // 原本取 40。回報說戴眼鏡的比較難抓，做了對照實驗：同一張臉疊上合成鏡框，
    // 其餘條件不變，四張臉的分數變化是
    //
    //   沒有鏡框    338, 147, 74, 40
    //   細框透明    230,  97, 36, 14   ← 掉一半，後兩張跌破 40
    //   粗框透明     38,   7,  7, 沒偵測到
    //   墨鏡         13,   5, 沒偵測到, 0
    //
    // 細框只是跌破門檻，人還在。門檻降到 10 那四張全部收得回來，而乾淨樣張仍然
    // 是 4 張沒有多框。
    //
    // 後來又降到 6。原本停在 10 的理由是「降到 5 就開始誤判」，那個數字是用只數
    // 總數的方式量出來的，總數看不出「多框」與「找到」的差別。check_redact_detect
    // 改成把偵測結果對回放進去的臉之後重量一次，五個場景的召回與多框是
    //
    //   門檻   街拍正立   街拍傾斜   傾斜加模糊   合計找到   合計多框
    //    10     19/26      18/26      16/26         53         4
    //     6     19/26      18/26      18/26         55         4
    //     3     19/26      18/26      20/26         57         5
    //
    // 10 到 6 是純賺，召回多兩張而多框一個都沒有增加，乾淨樣張與人多的場景完全
    // 沒有動。再往下要拿多框換召回，而這裡的合成場景全部出自同一張原始照片，
    // 押到量測範圍的邊緣三次都出過事，所以停在 6。
    //
    // 粗框與墨鏡是另一回事，分數整個崩掉，不設門檻也救不回來，那要靠讀者自己補。
    minQuality: 6,
    // 掃描的最小臉，單位是縮小後工作影像上的像素。
    //
    // 原本 40。街拍那種「同一張照片裡有近有遠」的場景會漏掉遠的那些：3000px 寬
    // 的照片縮到 1920 之後是 0.64 倍，一張 44px 的臉只剩 28px。量過五個合成場景
    //（大小從 44 到 260px、背景雜亂、部分頭傾斜）：
    //
    //   場景（實際張數）    minSize 40   minSize 32   minSize 24
    //   乾淨樣張(4)             4            4            -
    //   人多拼貼(64)           64           64            -
    //   街拍正立(21)           17           21           25 ← 多框 4
    //   街拍傾斜(21)           15           19            -
    //
    // 32 在五個場景全面優於 40 而且完全不多框，街拍那張耗時從 174ms 到 239ms。
    // 24 開始把不是臉的地方框起來，所以停在 32。
    minSize: 32,
    // 每一輪放大多少、每一步移動多少。上游範例的預設值。
    scaleFactor: 1.1,
    shiftFactor: 0.1,
    // 分群時兩個框重疊多少算同一張臉
    iou: 0.2,
    // 偵測跑在縮小過的副本上，框的位置再按比例放回原尺寸。四千萬像素的照片直接
    // 掃要好幾秒，所以一定要縮，問題是縮到多小。
    //
    // 這個值決定「多小的臉還抓得到」，因為 minSize 量的是縮完之後的像素。原本
    // 是 1280，回報說人多就抓不到，量過確實如此。拿樣張拼成不同密度的合成場景：
    //
    //   長邊上限   4 張大臉   36 張中等   64 張小臉
    //   1280          4          27          31
    //   1920          4          36          64
    //
    // 1920 三種密度都全中，而且大臉那一組沒有多抓（維持 4），耗時 352ms。再往上
    // 到 2048 反而掉到 63 而且更慢，往下壓 minSize 到 24 能到同樣的召回但慢一倍。
    // 所以動這一個就好，minSize 與分數門檻都不必改。
    //
    // 分群的 iou 完全不影響（0.1 到 0.5 都是同一個數字），鄰近的臉沒有被合併掉，
    // 那個方向不是問題。
    maxSide: 1920,
    // 偵測框只包到五官，頭髮跟下巴常常落在外面。往外推一點再遮。
    pad: 0.28,
  };

  // pico 回傳的是圓：中心的列、欄、直徑與分數。換成這一頁在用的整數方框，
  // 往外推 pad，再夾回影像範圍內。scale 是「偵測時縮小了多少」的倒數。
  function detectionToBox(det, scale, width, height) {
    const row = det[0] * scale;
    const col = det[1] * scale;
    const size = det[2] * scale * (1 + DETECT.pad);
    const half = size / 2;
    return normalizeBox(
      Math.max(0, col - half),
      Math.max(0, row - half),
      Math.min(width, col + half),
      Math.min(height, row + half),
      width,
      height
    );
  }

  // 偵測要縮到多少。長邊超過上限才縮，回傳 { width, height, scale }，
  // scale 是把偵測座標乘回原尺寸的倍率。
  function detectSize(width, height, maxSide) {
    const longest = Math.max(width, height);
    if (longest <= maxSide) return { width: width, height: height, scale: 1 };
    const ratio = maxSide / longest;
    return {
      width: Math.max(1, Math.round(width * ratio)),
      height: Math.max(1, Math.round(height * ratio)),
      scale: 1 / ratio,
    };
  }

  // 已經有框的地方不要再加一個。讀者自己拉過的框，偵測不該疊上去。
  // 判準是中心點落在既有的框裡面。
  function isCovered(box, existing) {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    for (const other of existing) {
      if (cx >= other.x && cx <= other.x + other.w && cy >= other.y && cy <= other.y + other.h) {
        return true;
      }
    }
    return false;
  }

  // 點一下要移掉哪一個框。後畫的疊在前面，所以從最後一個往前找。回傳索引，
  // 沒點到任何一個回傳 -1。逐個刪掉才有意義：偵測一次可能提出幾十個候選框，
  // 只靠「復原上一個」要退掉中間某一個得先把後面全部退掉。
  function hitBox(list, x, y) {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const box = list[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) return i;
    }
    return -1;
  }

  // --- 介面 ---

  const root = document.getElementById("redact-tool");
  if (!root) return;

  const CSS = `
    #redact-tool { margin: 1em 0; }
    #redact-tool .rd-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #redact-tool .rd-drop--over {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #redact-tool input[type="file"] { display: none; }
    #redact-tool .rd-hint { font-size: .74rem; line-height: 1.7; opacity: .85; margin: .6rem 0; }
    #redact-tool .rd-canvas {
      display: block; max-width: 100%; height: auto; cursor: crosshair; touch-action: none;
      border: .05rem solid var(--md-default-fg-color--lighter); border-radius: .1rem;
      background: var(--md-default-fg-color--lightest);
    }
    #redact-tool .rd-status { font-size: .74rem; margin: .6rem 0 .3rem; }
    #redact-tool .rd-actions { display: flex; flex-wrap: wrap; gap: .4rem; margin: 0 0 .8rem; }
    #redact-tool button, #redact-tool a.rd-dl {
      font: inherit; font-size: .74rem; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .3rem .7rem; display: inline-block; text-decoration: none;
    }
    /* 填了底色的按鈕不套通用 hover，不然文字會跟底色融在一起（offline-library 踩過） */
    #redact-tool button:hover:not(:disabled):not(.rd-primary), #redact-tool a.rd-dl:hover {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #redact-tool .rd-primary {
      background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
      border-color: var(--md-primary-fg-color);
    }
    #redact-tool .rd-primary:hover:not(:disabled) { filter: brightness(1.1); }
    #redact-tool button:disabled { opacity: .5; cursor: default; }
    #redact-tool .rd-result {
      border-left: .15rem solid #2e7d32; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #redact-tool .rd-result a.rd-dl { margin-top: .4rem; }
    #redact-tool .rd-error {
      border-left: .15rem solid #c62828; padding: .1rem 0 .1rem .6rem;
      margin: .8rem 0; font-size: .74rem; line-height: 1.7;
    }
    #redact-tool .rd-loading {
      font-size: .78rem; line-height: 1.8; margin: .8rem 0 0;
      border-left: .15rem solid var(--md-primary-fg-color); padding-left: .6rem;
    }
    #redact-tool .rd-note { font-size: .7rem; opacity: .75; line-height: 1.7; margin: .8rem 0 0; }
    @media (pointer: coarse) { #redact-tool button, #redact-tool a.rd-dl { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把截圖或照片拖進來，或點一下選檔案。也可以直接貼上（Ctrl+V）。",
      dropOver: "放開就載入",
      loading: "載入中",
      hint: "在要遮的地方按住拖出方框，放開就填成黑色，可以拖好幾個。拉錯的點一下就移掉。填的是實心色塊，馬賽克與模糊都可能被還原。",
      canvasLabel: "遮蔽用的畫布，在上面按住拖出方框",
      count: "已遮 {n} 處",
      none: "還沒有遮任何地方",
      beforeHint: "選好圖之後可以先按「自動找出人臉」框一輪，機器漏掉的自己補。",
      findFaces: "自動找出人臉",
      finding: "尋找中",
      elapsed: "（{s} 秒）",
      findingNote: "掃描整張照片，手機上通常兩到三秒，照片越大越久。這段時間頁面照常可以操作。",
      foundSome: "找到 {n} 張臉，用藍框標起來，還沒有遮住任何東西。不需要遮的點一下移掉，其餘的按「全部遮起來」。側臉、墨鏡、被遮住與太小的臉會漏掉，名牌、刺青、車牌這些也要自己補。",
      foundNone: "沒有找到正面、直立又夠大的臉。這一張要自己拉框。",
      markLeft: "還有 {n} 個藍框沒有決定。不需要遮的點一下移掉，其餘的按「全部遮起來」。",
      markNone: "藍框都移掉了。要遮的地方自己拉框。",
      coverAll: "全部遮起來",
      undo: "復原上一個",
      reset: "全部重來",
      another: "換一張",
      make: "產生遮好的圖",
      working: "處理中",
      download: "下載遮好的",
      verified: "已把輸出實際解開一次，{n} 處都是純黑。輸出重新編碼過，原檔的 metadata 與檔名都不會帶過去。",
      sizeLine: "原始 {a}，輸出 {b}，{type}",
      downscaled: "圖片超過處理上限，已縮到 {w}×{h}。遮蔽的位置不受影響。",
      note: "圖片不離開你的裝置，頁面沒有任何上傳，原始檔也不會被改動。",
      errors: {
        notImage: "選到的不是圖片檔。",
        decode: "無法解碼圖片。HEIC 目前只有 Safari 能解，可以先在手機上轉成 JPEG。",
        verifyFailed: "輸出檢查沒有通過，有一處不是純黑。請按「全部重來」再遮一次。",
        exportFailed: "產生輸出時失敗，可能是圖太大。換一張小一點的，或先縮圖。",
        detectMissing: "臉部偵測需要的檔案載入失敗，重試一次，或直接自己拉框。",
      },
      types: { "image/png": "PNG", "image/jpeg": "JPEG" },
    },
    zh: {
      drop: "把截图或照片拖进来，或点一下选文件。也可以直接粘贴（Ctrl+V）。",
      dropOver: "松开就加载",
      loading: "加载中",
      hint: "在要遮的地方按住拖出方框，松开就填成黑色，可以拖好几个。拉错的点一下就移掉。填的是实心色块，马赛克与模糊都可能被还原。",
      canvasLabel: "遮蔽用的画布，在上面按住拖出方框",
      count: "已遮 {n} 处",
      none: "还没有遮任何地方",
      beforeHint: "选好图之后可以先按「自动找出人脸」框一轮，机器漏掉的自己补。",
      findFaces: "自动找出人脸",
      finding: "寻找中",
      elapsed: "（{s} 秒）",
      findingNote: "扫描整张照片，手机上通常两到三秒，照片越大越久。这段时间页面照常可以操作。",
      foundSome: "找到 {n} 张脸，用蓝框标起来，还没有遮住任何东西。不需要遮的点一下移掉，其余的按「全部遮起来」。侧脸、墨镜、被遮住与太小的脸会漏掉，名牌、纹身、车牌这些也要自己补。",
      foundNone: "没有找到正面、直立又够大的脸。这一张要自己拉框。",
      markLeft: "还有 {n} 个蓝框没有决定。不需要遮的点一下移掉，其余的按「全部遮起来」。",
      markNone: "蓝框都移掉了。要遮的地方自己拉框。",
      coverAll: "全部遮起来",
      undo: "撤销上一个",
      reset: "全部重来",
      another: "换一张",
      make: "生成遮好的图",
      working: "处理中",
      download: "下载遮好的",
      verified: "已把输出实际解开一次，{n} 处都是纯黑。输出重新编码过，原文件的 metadata 与文件名都不会带过去。",
      sizeLine: "原始 {a}，输出 {b}，{type}",
      downscaled: "图片超过处理上限，已缩到 {w}×{h}。遮蔽的位置不受影响。",
      note: "图片不离开你的设备，页面没有任何上传，原始文件也不会被改动。",
      errors: {
        notImage: "选到的不是图片文件。",
        decode: "无法解码图片。HEIC 目前只有 Safari 能解，可以先在手机上转成 JPEG。",
        verifyFailed: "输出检查没有通过，有一处不是纯黑。请按「全部重来」再遮一次。",
        exportFailed: "生成输出时失败，可能是图太大。换一张小一点的，或先缩图。",
        detectMissing: "人脸检测需要的文件加载失败，重试一次，或直接自己拉框。",
      },
      types: { "image/png": "PNG", "image/jpeg": "JPEG" },
    },
    en: {
      drop: "Drop a screenshot or photo here, or click to choose a file. Pasting (Ctrl+V) works too.",
      dropOver: "Release to load",
      loading: "Loading",
      hint: "Press and drag over anything that must not leave the picture. Release to fill it with solid black. Draw as many boxes as you need, and tap one to take it away again. Solid fill only: pixelation and blur can be reversed.",
      canvasLabel: "Redaction canvas. Press and drag to draw a box.",
      count: "{n} areas covered",
      none: "Nothing covered yet",
      beforeHint: "Once an image is loaded you can press \"Find faces\" for a first pass, then add whatever it missed yourself.",
      findFaces: "Find faces",
      finding: "Looking",
      elapsed: " ({s}s)",
      findingNote: "Scanning the whole photo. On a phone this usually takes two to three seconds, longer for larger photos. The page stays usable meanwhile.",
      foundSome: "Found {n} faces and outlined them in blue. Nothing is covered yet. Tap any outline you do not need, then press \"Cover them all\". Profiles, dark glasses, covered and small faces get missed, and name badges, tattoos and licence plates are yours to add.",
      foundNone: "No front-facing, upright, large enough face found. Draw the boxes yourself on this one.",
      markLeft: "{n} outlines are still undecided. Tap the ones you do not need, then press \"Cover them all\".",
      markNone: "Every outline was taken away. Draw the boxes you need yourself.",
      coverAll: "Cover them all",
      undo: "Undo last box",
      reset: "Start over",
      another: "Another image",
      make: "Create the redacted image",
      working: "Working",
      download: "Download the redacted image",
      verified: "The output was decoded once more and all {n} areas are solid black. It was re-encoded, so none of the original file's metadata or its filename carries over.",
      sizeLine: "Original {a}, output {b}, {type}",
      downscaled: "This image is above the processing limit and was scaled to {w}×{h}. The covered areas are unaffected.",
      note: "The image never leaves your device. Nothing on this page uploads, and the original file is not modified.",
      errors: {
        notImage: "That is not an image file.",
        decode: "This image could not be decoded. HEIC currently decodes only in Safari; convert it to JPEG on your phone first.",
        verifyFailed: "The output check failed: one area is not solid black. Press “Start over” and cover it again.",
        exportFailed: "Creating the output failed, possibly because the image is too large. Try a smaller one, or downscale it first.",
        detectMissing: "The files needed for face detection failed to load. Try again, or just draw the boxes yourself.",
      },
      types: { "image/png": "PNG", "image/jpeg": "JPEG" },
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (text, vars) =>
    Object.keys(vars || {}).reduce(
      (out, name) => out.split("{" + name + "}").join(vars[name]),
      text
    );

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  // 狀態。source 是解開的圖與它的尺寸，boxes 是影像座標上已經遮住的方框，marks
  // 是偵測提出來還沒有決定的候選框，result 是產生好且驗過的輸出。都只活在記憶體
  // 裡，換一張或關掉分頁就沒了。
  //
  // boxes 與 marks 分開是這一頁的安全性所在：畫面上實心的才是會出現在輸出裡的，
  // 空心的線只是提案。verifyBoxes 也只驗 boxes。
  let source = null;
  let boxes = [];
  let marks = [];
  let dragging = null;
  let result = null;
  let working = false;
  let error = null;
  // 偵測跟輸出各自有自己的忙碌狀態，兩顆按鈕的轉圈才不會互相干擾
  let detecting = false;
  let detectNote = null;
  // 偵測開始的時間、每秒跳一次的計時器，以及按鈕上那個放秒數的文字節點
  let detectSince = 0;
  let detectTicker = null;
  let elapsedNode = null;
  let canvas = null;
  let ctx = null;
  let rafPending = false;

  function releaseResult() {
    if (result && result.url) URL.revokeObjectURL(result.url);
    result = null;
  }

  function releaseSource() {
    if (source && source.bitmap && typeof source.bitmap.close === "function") {
      source.bitmap.close();
    }
    source = null;
    canvas = null;
    ctx = null;
  }

  // 整張重畫：底圖、已經遮住的方框、候選框、正在拖的那一個。正在拖的也用實心填，
  // 讀者放開之前看到的就是最後會得到的東西，外框只是讓邊界在深色畫面上也看得見。
  //
  // options.marks 給 false 會跳過候選框。輸出前一定要這樣重畫一次，候選框是畫在
  // 同一張畫布上的線，不跳過就會被燒進交出去的圖裡。
  function draw(options) {
    if (!canvas || !source) return;
    const withMarks = !(options && options.marks === false);
    const line = Math.max(2, Math.round(canvas.width / 400));
    ctx.drawImage(source.bitmap, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = FILL;
    for (const box of boxes) ctx.fillRect(box.x, box.y, box.w, box.h);
    if (withMarks) {
      // 候選框只畫線不填色，白線墊底再疊藍線，淺色與深色的畫面上都看得見。
      for (const box of marks) {
        ctx.lineWidth = line + 2;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.lineWidth = line;
        ctx.strokeStyle = MARK;
        ctx.strokeRect(box.x, box.y, box.w, box.h);
      }
    }
    if (dragging) {
      const left = Math.min(dragging.x1, dragging.x2);
      const top = Math.min(dragging.y1, dragging.y2);
      const w = Math.abs(dragging.x2 - dragging.x1);
      const h = Math.abs(dragging.y2 - dragging.y1);
      ctx.fillRect(left, top, w, h);
      ctx.strokeStyle = MARK;
      ctx.lineWidth = line;
      ctx.strokeRect(left, top, w, h);
    }
  }

  function scheduleDraw() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      draw();
    });
  }

  // 把檔案解成可以畫的東西。createImageBitmap 會照 EXIF 的方向把圖轉正，輸出就
  // 不需要再帶方向欄位。不支援的環境退回 img 元素，現代瀏覽器的 img 預設也會轉正。
  function decode(blob) {
    const viaImage = () =>
      new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("decode"));
        };
        image.src = url;
      });
    if (typeof createImageBitmap !== "function") return viaImage();
    return createImageBitmap(blob, { imageOrientation: "from-image" }).catch(viaImage);
  }

  const sizeOf = (bitmap) => ({
    w: bitmap.width || bitmap.naturalWidth || 0,
    h: bitmap.height || bitmap.naturalHeight || 0,
  });

  async function load(file) {
    if (!file) return;
    if (file.type && file.type.indexOf("image/") !== 0) {
      error = "notImage";
      render();
      return;
    }
    releaseResult();
    releaseSource();
    boxes = [];
    detectNote = null;
    dragging = null;
    error = null;
    working = true;
    render();
    // 交還主執行緒，讓「載入中」先畫出來
    await new Promise((next) => setTimeout(next, 0));
    try {
      const bitmap = await decode(file);
      const size = sizeOf(bitmap);
      if (!size.w || !size.h) throw new Error("decode");
      const fit = fitWithin(size.w, size.h, MAX_PIXELS);
      source = {
        bitmap: bitmap,
        width: fit.w,
        height: fit.h,
        scaled: fit.scale < 1,
        type: file.type || "",
        size: file.size,
      };
    } catch (err) {
      error = "decode";
    }
    working = false;
    render();
  }

  function toBlob(target, type) {
    return new Promise((resolve, reject) => {
      target.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), type, 0.92);
    });
  }

  // 把輸出真的解開一次再檢查。看的是讀者會拿到的那個檔案，不是畫布上的狀態，
  // 編碼器要是把黑色壓成別的東西，這裡會攔下來。
  async function verifyBlob(blob, list) {
    const bitmap = await decode(blob);
    const size = sizeOf(bitmap);
    if (!canvas || size.w !== canvas.width || size.h !== canvas.height) {
      return { ok: false, bad: [] };
    }
    const check = document.createElement("canvas");
    check.width = size.w;
    check.height = size.h;
    const c2 = check.getContext("2d");
    c2.drawImage(bitmap, 0, 0);
    const pixels = c2.getImageData(0, 0, size.w, size.h).data;
    if (typeof bitmap.close === "function") bitmap.close();
    return verifyBoxes(pixels, size.w, list, VERIFY[blob.type] || VERIFY["image/png"]);
  }

  // 偵測用的程式與級聯資料按下按鈕才載入，合計約 240 KB。只想自己拉框的人不必
  // 為了這個等待，跟 stripmeta.js 把 pdf-lib 延後到遇到 PDF 才載是同一個做法。
  //
  // 離線副本要包含這兩個檔案，它們列在這一頁 frontmatter 的 offline_assets 裡。
  let picoLoading = null;
  let cascade = null;

  function picoLib() {
    return typeof window !== "undefined" ? window.pico : null;
  }

  function loadPico() {
    if (cascade) return Promise.resolve(cascade);
    if (!picoLoading) {
      picoLoading = (async () => {
        try {
          if (!picoLib()) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = new URL("../vendor/pico/pico.js", location.href).href;
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          const lib = picoLib();
          if (!lib) throw new Error("no pico");
          const url = new URL("../vendor/pico/facefinder", location.href).href;
          const response = await fetch(url);
          if (!response.ok) throw new Error("no cascade");
          cascade = lib.unpack_cascade(new Uint8Array(await response.arrayBuffer()));
          return cascade;
        } catch (err) {
          // 失敗就讓下一次重試，不要卡在一個永遠不會完成的 promise 上
          picoLoading = null;
          return null;
        }
      })();
    }
    return picoLoading;
  }

  // 把畫面上的底圖縮到工作尺寸再取出 RGBA。canvas 只有主執行緒碰得到，這一段
  // 搬不進 worker。量過 4032x3024 的照片縮到 1920x1440 是 84ms，佔整段不到 4%。
  function rgbaFrom(bitmap, width, height) {
    const work = document.createElement("canvas");
    work.width = width;
    work.height = height;
    const workCtx = work.getContext("2d", { willReadFrequently: true });
    workCtx.drawImage(bitmap, 0, 0, width, height);
    return workCtx.getImageData(0, 0, width, height).data;
  }

  // 灰階緩衝區，pico 吃的格式。worker 那條路自己在 worker 裡轉，這一份是給
  // 退回頁面裡做的時候用的。
  function grayscaleFrom(bitmap, width, height) {
    const rgba = rgbaFrom(bitmap, width, height);
    const gray = new Uint8Array(width * height);
    for (let i = 0; i < gray.length; i += 1) {
      const at = i * 4;
      gray[i] = (rgba[at] * 0.299 + rgba[at + 1] * 0.587 + rgba[at + 2] * 0.114) | 0;
    }
    return gray;
  }

  // 掃描搬到 worker 裡。起不來或中途死掉就記下來不再重試，退回頁面裡做。
  let worker = null;
  let workerDead = false;
  let workerJob = 0;

  function startWorker() {
    if (worker || workerDead) return worker;
    try {
      worker = new Worker(new URL("../../js/redact-worker.js", location.href).href);
    } catch (err) {
      workerDead = true;
      worker = null;
    }
    return worker;
  }

  // 把縮好的 RGBA 轉移給 worker。轉移之後主執行緒那一份就失效了，退回頁面裡做
  // 的時候會從底圖重新取一次，那只要 84ms。
  function detectInWorker(rgba, width, height) {
    const node = startWorker();
    if (!node) return Promise.resolve(null);
    const id = workerJob + 1;
    workerJob = id;
    return new Promise((resolve) => {
      const finish = (value) => {
        node.removeEventListener("message", onMessage);
        node.removeEventListener("error", onError);
        resolve(value);
      };
      const onMessage = (event) => {
        const data = event.data || {};
        if (data.id !== id) return;
        finish(data.ok ? data.dets : null);
      };
      const onError = () => {
        workerDead = true;
        node.terminate();
        worker = null;
        finish(null);
      };
      node.addEventListener("message", onMessage);
      node.addEventListener("error", onError);
      node.postMessage(
        {
          id: id,
          rgba: rgba.buffer,
          width: width,
          height: height,
          shiftFactor: DETECT.shiftFactor,
          minSize: DETECT.minSize,
          scaleFactor: DETECT.scaleFactor,
          iou: DETECT.iou,
          minQuality: DETECT.minQuality,
        },
        [rgba.buffer]
      );
    });
  }

  // 退回頁面裡做的那一條。worker 起不來的時候才走這裡，會卡住幾秒。
  async function detectInPage(plan) {
    const classify = await loadPico();
    if (!classify) return null;
    const lib = picoLib();
    try {
      const gray = grayscaleFrom(source.bitmap, plan.width, plan.height);
      const raw = lib.run_cascade(
        { pixels: gray, nrows: plan.height, ncols: plan.width, ldim: plan.width },
        classify,
        {
          shiftfactor: DETECT.shiftFactor,
          minsize: DETECT.minSize,
          maxsize: Math.max(plan.width, plan.height),
          scalefactor: DETECT.scaleFactor,
        }
      );
      return lib.cluster_detections(raw, DETECT.iou).filter((det) => det[3] > DETECT.minQuality);
    } catch (err) {
      return null;
    }
  }

  // 偵測中每秒把按鈕上的秒數換掉。不重畫整個介面，那會連底圖一起重畫，在手機
  // 上每秒多花十幾毫秒，而且要換的只有一個文字節點。
  function startElapsed() {
    detectSince = Date.now();
    stopElapsed();
    detectTicker = setInterval(() => {
      if (!detecting || !elapsedNode) return;
      const secs = Math.floor((Date.now() - detectSince) / 1000);
      elapsedNode.nodeValue = secs >= 1 ? fill(t.elapsed, { s: secs }) : "";
    }, 1000);
  }

  function stopElapsed() {
    if (detectTicker) clearInterval(detectTicker);
    detectTicker = null;
    elapsedNode = null;
  }

  async function findFaces() {
    if (!source || detecting || working) return;
    detecting = true;
    detectNote = null;
    error = null;
    render();
    // 先讓瀏覽器把「尋找中」畫出來再開始工作。少了這一步，第二次按的時候 pico
    // 已經在記憶體裡，await 只讓出一個 microtask，整段偵測會在同一個工作裡做完，
    // 按鈕從頭到尾沒有變過。量過六倍節流下是按下去之後 2.5 秒才有第一個畫面。
    //
    // 用 rAF 再接一個 timeout，不只是 setTimeout。單獨的 setTimeout 只保證換一個
    // 工作，不保證那之間畫過一次。掃描交給 worker 之後這一步影響不大，但 worker
    // 起不來退回頁面裡做的時候，主執行緒仍然會被擋住，那時就靠它。
    await new Promise((next) => requestAnimationFrame(() => setTimeout(next, 0)));
    startElapsed();

    const plan = detectSize(source.width, source.height, DETECT.maxSide);
    let dets = null;
    try {
      dets = await detectInWorker(
        rgbaFrom(source.bitmap, plan.width, plan.height), plan.width, plan.height
      );
    } catch (err) {
      dets = null;
    }
    if (!dets) dets = await detectInPage(plan);
    stopElapsed();

    if (!dets) {
      detecting = false;
      error = "detectMissing";
      render();
      return;
    }

    const found = dets
      .map((det) => detectionToBox(det, plan.scale, source.width, source.height))
      .filter((box) => box && !isCovered(box, boxes));

    // 直接指派而不是接在後面。重按一次偵測得到的是同一批，接上去會變成兩層。
    marks = found;
    detecting = false;
    detectNote = found.length ? fill(t.foundSome, { n: found.length }) : t.foundNone;
    releaseResult();
    render();
  }

  async function exportImage() {
    // 候選框還沒有決定就不給產生。放行等於交出一張「機器找到了但沒有遮」的圖，
    // 而畫面上那幾條藍線很容易被當成已經遮好。
    if (!source || !boxes.length || marks.length || working) return;
    releaseResult();
    working = true;
    error = null;
    render();
    // 跟 findFaces 同一個理由：單獨的 setTimeout 只保證換一個工作，不保證那之間
    // 畫過一次，而重新編碼再解開驗證這一段是同步的。
    await new Promise((next) => requestAnimationFrame(() => setTimeout(next, 0)));
    try {
      dragging = null;
      draw({ marks: false });
      let type = outputType(source.type);
      let blob = await toBlob(canvas, type);
      let check = await verifyBlob(blob, boxes);
      // JPEG 的邊緣雜訊超過容許值就改用 PNG 再來一次，寧可檔案大也不交出沒驗過的
      if (!check.ok && type === "image/jpeg") {
        type = "image/png";
        blob = await toBlob(canvas, type);
        check = await verifyBlob(blob, boxes);
      }
      if (!check.ok) {
        error = "verifyFailed";
      } else {
        result = {
          url: URL.createObjectURL(blob),
          type: type,
          name: outputName(type),
          size: blob.size,
          count: boxes.length,
        };
      }
    } catch (err) {
      error = "exportFailed";
    }
    working = false;
    render();
  }

  function bindPointer(target) {
    target.addEventListener("pointerdown", (event) => {
      // 偵測中不收拖曳。按鈕在那個狀態下全部停用，畫布也要一致，不然拖出來的框
      // 會排隊等到偵測結束才處理，讀者看不出那一下有沒有算數。
      if (!source || working || detecting) return;
      event.preventDefault();
      const p = toImagePoint(
        event.clientX, event.clientY, target.getBoundingClientRect(), target.width, target.height
      );
      dragging = { x1: p.x, y1: p.y, x2: p.x, y2: p.y, id: event.pointerId };
      try {
        target.setPointerCapture(event.pointerId);
      } catch (err) {
        // 不支援 capture 的環境，拖出畫布會少掉 up 事件，pointercancel 那條會收尾
      }
      scheduleDraw();
    });
    target.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== dragging.id) return;
      const p = toImagePoint(
        event.clientX, event.clientY, target.getBoundingClientRect(), target.width, target.height
      );
      dragging.x2 = p.x;
      dragging.y2 = p.y;
      scheduleDraw();
    });
    target.addEventListener("pointerup", (event) => {
      if (!dragging || event.pointerId !== dragging.id) return;
      const box = normalizeBox(
        dragging.x1, dragging.y1, dragging.x2, dragging.y2, target.width, target.height
      );
      const at = { x: dragging.x2, y: dragging.y2 };
      dragging = null;
      if (box) {
        boxes.push(box);
        // 已經產生的輸出跟畫面不一致了，收掉，要下載得重新產生一次
        releaseResult();
        error = null;
        render();
        return;
      }
      // 拖不出方框就是點了一下。點在候選框上移掉那一個，點在已經遮住的地方移掉
      // 那一處。候選框疊在上面，先問它。
      const onMark = hitBox(marks, at.x, at.y);
      if (onMark !== -1) {
        marks.splice(onMark, 1);
        detectNote = marks.length ? fill(t.markLeft, { n: marks.length }) : t.markNone;
        render();
        return;
      }
      const onBox = hitBox(boxes, at.x, at.y);
      if (onBox !== -1) {
        boxes.splice(onBox, 1);
        releaseResult();
        error = null;
        render();
        return;
      }
      scheduleDraw();
    });
    target.addEventListener("pointercancel", (event) => {
      if (!dragging || event.pointerId !== dragging.id) return;
      dragging = null;
      scheduleDraw();
    });
  }

  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function renderPicker() {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.addEventListener("change", () => load(picker.files && picker.files[0]));

    const drop = el("div", "rd-drop", t.drop);
    drop.addEventListener("click", () => picker.click());
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("rd-drop--over");
      drop.textContent = t.dropOver;
    });
    drop.addEventListener("dragleave", () => {
      drop.classList.remove("rd-drop--over");
      drop.textContent = t.drop;
    });
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("rd-drop--over");
      const files = event.dataTransfer && event.dataTransfer.files;
      load(files && files[0]);
    });
    root.appendChild(picker);
    root.appendChild(drop);
  }

  function renderWorking(label) {
    const line = el("p", "rd-loading");
    // 轉圈用全站共用的那顆，樣式定義在 overrides/base.html
    const spin = el("span", "anoni-spinner");
    spin.setAttribute("aria-hidden", "true");
    line.appendChild(spin);
    line.appendChild(document.createTextNode(label));
    line.setAttribute("aria-busy", "true");
    line.setAttribute("aria-live", "polite");
    root.appendChild(line);
  }

  function render() {
    root.textContent = "";

    if (!source) {
      renderPicker();
      if (working) renderWorking(t.loading);
      if (error) root.appendChild(el("p", "rd-error", t.errors[error] || t.errors.decode));
      // 按鈕全部要等圖片載進來才出現，所以在還沒選檔案的畫面先講一句。文章的
      // 步驟寫著「先按自動找出人臉」，而讀者停在第一步時畫面上沒有那顆按鈕，
      // 說明與畫面對不起來，實際回報過找不到。
      root.appendChild(el("p", "rd-note", t.beforeHint));
      root.appendChild(el("p", "rd-note", t.note));
      return;
    }

    root.appendChild(el("p", "rd-hint", t.hint));

    if (!canvas) {
      canvas = el("canvas", "rd-canvas");
      canvas.width = source.width;
      canvas.height = source.height;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", t.canvasLabel);
      ctx = canvas.getContext("2d");
      bindPointer(canvas);
    }
    root.appendChild(canvas);
    draw();

    if (source.scaled) {
      root.appendChild(el("p", "rd-note", fill(t.downscaled, { w: source.width, h: source.height })));
    }

    root.appendChild(el("p", "rd-status", boxes.length ? fill(t.count, { n: boxes.length }) : t.none));

    // 掃描要幾秒，按下去之後就講出來。轉圈只說明「在做事」，沒有說明「要多久」，
    // 而在手機上這一段有兩三秒，不給預期的話讀者會以為當掉了。
    if (detecting) {
      const busy = el("p", "rd-note", t.findingNote);
      busy.setAttribute("role", "status");
      busy.setAttribute("aria-live", "polite");
      root.appendChild(busy);
    }

    // 偵測的結果講在狀態列底下。找到幾張、以及它抓不到什麼，兩件事要一起說，
    // 只講找到幾張會讓人以為剩下的都乾淨了。
    if (detectNote) {
      const note = el("p", "rd-note", detectNote);
      note.setAttribute("role", "status");
      note.setAttribute("aria-live", "polite");
      root.appendChild(note);
    }

    const actions = el("div", "rd-actions");
    const make = button(working ? "" : t.make, "rd-primary", exportImage);
    if (working) {
      // 按下去之後把按鈕換成轉圈加狀態字。整張重新編碼再解開驗證，大圖在手機上
      // 要好幾秒，按鈕沒有變化的話讀者會以為沒按到而重複按。
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      make.appendChild(spin);
      make.appendChild(document.createTextNode(t.working));
      make.setAttribute("aria-busy", "true");
    }
    make.disabled = working || detecting || !boxes.length || marks.length > 0;
    actions.appendChild(make);

    // 候選框還在的時候才出現。預設是全部遮起來，要留下某一張臉得先點掉它，
    // 逐張決定要不要遮的負擔留給例外，不留給常態。
    if (marks.length) {
      const cover = button(t.coverAll, "rd-primary", () => {
        for (const box of marks) boxes.push(box);
        marks = [];
        detectNote = null;
        releaseResult();
        error = null;
        render();
      });
      cover.disabled = working || detecting;
      actions.appendChild(cover);
    }

    // 偵測排在產生後面、復原前面。它是可選的省力步驟，不是主要路徑，
    // 主要路徑仍然是自己拉框。
    const find = button(detecting ? "" : t.findFaces, null, findFaces);
    if (detecting) {
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      find.appendChild(spin);
      find.appendChild(document.createTextNode(t.finding));
      // 秒數單獨一個文字節點，計時器每秒只換它，不重畫整個介面
      elapsedNode = document.createTextNode("");
      find.appendChild(elapsedNode);
      find.setAttribute("aria-busy", "true");
    }
    find.disabled = working || detecting;
    actions.appendChild(find);

    const undo = button(t.undo, null, () => {
      boxes.pop();
      detectNote = null;
      releaseResult();
      error = null;
      render();
    });
    undo.disabled = working || detecting || !boxes.length;
    actions.appendChild(undo);

    const reset = button(t.reset, null, () => {
      boxes = [];
      marks = [];
      detectNote = null;
      releaseResult();
      error = null;
      render();
    });
    reset.disabled = working || detecting || (!boxes.length && !marks.length);
    actions.appendChild(reset);

    const another = button(t.another, null, () => {
      stopElapsed();
      releaseResult();
      releaseSource();
      boxes = [];
      marks = [];
      detectNote = null;
      error = null;
      render();
    });
    another.disabled = working || detecting;
    actions.appendChild(another);
    root.appendChild(actions);

    if (error) root.appendChild(el("p", "rd-error", t.errors[error] || t.errors.exportFailed));

    if (result) {
      const box = el("div", "rd-result");
      box.appendChild(el("p", null, fill(t.verified, { n: result.count })));
      box.appendChild(
        el("p", null, fill(t.sizeLine, {
          a: humanSize(source.size),
          b: humanSize(result.size),
          type: t.types[result.type] || result.type,
        }))
      );
      const link = el("a", "rd-dl", t.download);
      link.href = result.url;
      link.download = result.name;
      box.appendChild(link);
      root.appendChild(box);
    }

    root.appendChild(el("p", "rd-note", t.note));
  }

  // 直接貼上。手機截圖之後最快的路徑。
  document.addEventListener("paste", (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.indexOf("image/") === 0) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          load(file);
          return;
        }
      }
    }
  });

  // Ctrl+Z 復原上一個方框。只在有圖的時候接手，焦點在輸入欄位時不搶。
  document.addEventListener("keydown", (event) => {
    if (!source || working || detecting || !boxes.length) return;
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    event.preventDefault();
    boxes.pop();
    releaseResult();
    render();
  });

  render();
})();
