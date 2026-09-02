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
 * === 不做的事 ===
 *
 * 不做臉部偵測，哪些東西該遮取決於讀者的處境，而模型漏掉一張臉的代價由讀者承擔。
 * 不做模糊與馬賽克。不處理影片。
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
      hint: "在要遮的地方按住拖出方框，放開就填成黑色，可以拖好幾個。填的是實心色塊，馬賽克與模糊都可能被還原。",
      canvasLabel: "遮蔽用的畫布，在上面按住拖出方框",
      count: "已遮 {n} 處",
      none: "還沒有遮任何地方",
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
      },
      types: { "image/png": "PNG", "image/jpeg": "JPEG" },
    },
    zh: {
      drop: "把截图或照片拖进来，或点一下选文件。也可以直接粘贴（Ctrl+V）。",
      dropOver: "松开就加载",
      loading: "加载中",
      hint: "在要遮的地方按住拖出方框，松开就填成黑色，可以拖好几个。填的是实心色块，马赛克与模糊都可能被还原。",
      canvasLabel: "遮蔽用的画布，在上面按住拖出方框",
      count: "已遮 {n} 处",
      none: "还没有遮任何地方",
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
      },
      types: { "image/png": "PNG", "image/jpeg": "JPEG" },
    },
    en: {
      drop: "Drop a screenshot or photo here, or click to choose a file. Pasting (Ctrl+V) works too.",
      dropOver: "Release to load",
      loading: "Loading",
      hint: "Press and drag over anything that must not leave the picture. Release to fill it with solid black. Draw as many boxes as you need. Solid fill only: pixelation and blur can be reversed.",
      canvasLabel: "Redaction canvas. Press and drag to draw a box.",
      count: "{n} areas covered",
      none: "Nothing covered yet",
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

  // 狀態。source 是解開的圖與它的尺寸，boxes 是影像座標上的方框，result 是產生
  // 好且驗過的輸出。三者都只活在記憶體裡，換一張或關掉分頁就沒了。
  let source = null;
  let boxes = [];
  let dragging = null;
  let result = null;
  let working = false;
  let error = null;
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

  // 整張重畫：底圖、已定的方框、正在拖的那一個。正在拖的也用實心填，讀者放開之前
  // 看到的就是最後會得到的東西，外框只是讓邊界在深色畫面上也看得見。
  function draw() {
    if (!canvas || !source) return;
    ctx.drawImage(source.bitmap, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = FILL;
    for (const box of boxes) ctx.fillRect(box.x, box.y, box.w, box.h);
    if (dragging) {
      const left = Math.min(dragging.x1, dragging.x2);
      const top = Math.min(dragging.y1, dragging.y2);
      const w = Math.abs(dragging.x2 - dragging.x1);
      const h = Math.abs(dragging.y2 - dragging.y1);
      ctx.fillRect(left, top, w, h);
      ctx.strokeStyle = "#00aeff";
      ctx.lineWidth = Math.max(2, Math.round(canvas.width / 400));
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

  async function exportImage() {
    if (!source || !boxes.length || working) return;
    releaseResult();
    working = true;
    error = null;
    render();
    await new Promise((next) => setTimeout(next, 0));
    try {
      dragging = null;
      draw();
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
      if (!source || working) return;
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
      dragging = null;
      if (box) {
        boxes.push(box);
        // 已經產生的輸出跟畫面不一致了，收掉，要下載得重新產生一次
        releaseResult();
        error = null;
        render();
      } else {
        scheduleDraw();
      }
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
    make.disabled = working || !boxes.length;
    actions.appendChild(make);

    const undo = button(t.undo, null, () => {
      boxes.pop();
      releaseResult();
      error = null;
      render();
    });
    undo.disabled = working || !boxes.length;
    actions.appendChild(undo);

    const reset = button(t.reset, null, () => {
      boxes = [];
      releaseResult();
      error = null;
      render();
    });
    reset.disabled = working || !boxes.length;
    actions.appendChild(reset);

    const another = button(t.another, null, () => {
      releaseResult();
      releaseSource();
      boxes = [];
      error = null;
      render();
    });
    another.disabled = working;
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
    if (!source || working || !boxes.length) return;
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
