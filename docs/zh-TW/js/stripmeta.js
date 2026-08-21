/*
 * Metadata 清除器（utils/strip-metadata.md）。
 *
 * basics/metadata.md 建議「上傳照片前先去 EXIF」與「文件分享前用專門工具去除
 * metadata」。線上的那些工具幾乎都要先把檔案傳上去，而會需要清 metadata 的人，
 * 正是最不該把原始檔交出去的人。這一頁在瀏覽器裡改，檔案不離開裝置。
 *
 * === 為什麼不用 Wasm ===
 *
 * mat2 與 ImageMagick 編進 Wasm 是可行的，但那要拖進 Pyodide 或幾 MB 的執行環境，
 * 而這一區六個工具全都是零相依純 JS，預快取的總量也守在 check_precache.mjs 底下。
 *
 * 更關鍵的是無損。JPEG 的 metadata 全部住在 SOI 與 SOS 之間的 marker segment 裡，
 * 把那幾段拿掉、其餘照抄，壓縮資料一個位元都沒動。重新編碼的工具做不到這件事，
 * 而且會在輸出裡留下自己的處理痕跡，那本身又是一種可辨識的特徵。
 *
 * === 保留了什麼，為什麼 ===
 *
 * 有幾段不是 metadata 而是解碼與呈現需要的，拿掉會讓圖變樣：
 *
 *   APP0  JFIF 基本資訊，少了它有些看圖程式會抱怨
 *   APP2  ICC 色彩描述檔，拿掉照片顏色會偏掉
 *   APP14 Adobe 的色彩轉換標記，CMYK 的 JPEG 少了它顏色會反過來
 *
 * 這三段識別力低（多半是 sRGB 這種標準描述檔），留著換到的是「輸出跟原圖看起來
 * 一樣」。工具不替讀者決定這件事的細節，每一段的去留都列在畫面上，看得到才算數。
 *
 * PNG 那邊同理：影像相關的 chunk（IHDR、PLTE、IDAT、tRNS、gAMA、sRGB、iCCP 等）
 * 全留，文字與時間相關的（tEXt、zTXt、iTXt、tIME、eXIf）全拿掉。PNG 的 chunk
 * 各自帶 CRC，刪掉整個 chunk 不影響其他 chunk，不用重算。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_stripmeta.mjs 原地抽出來測，那支用實際造出來的檔案驗證
 * 敏感字串真的不見了、影像資料一個位元都沒動。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_stripmeta.mjs 從這裡原地抽出來測）---

  // JPEG 的 marker。留下來的這幾個不是 metadata，是解碼或呈現需要的。
  const JPEG_KEEP = {
    0xe0: "jfif",     // APP0：基本資訊
    0xe2: "icc",      // APP2：色彩描述檔，拿掉顏色會偏掉
    0xee: "adobe",    // APP14：Adobe 色彩轉換標記，CMYK 少了它顏色會反
  };

  // 這幾個 marker 沒有長度欄位，後面直接接資料。
  const JPEG_STANDALONE = new Set([0xd8, 0xd9, 0x01]);

  function markerLabel(marker) {
    if (marker === 0xe1) return "exif";
    if (marker === 0xed) return "photoshop";
    if (marker === 0xfe) return "comment";
    if (marker >= 0xe0 && marker <= 0xef) return "app";
    return "other";
  }

  // 回傳 { ok, data, removed, kept } 或 { ok: false, reason }。
  // removed 與 kept 是給畫面列出來的，每一項有 label、marker 與位元組數。
  function stripJpeg(bytes) {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      return { ok: false, reason: "notJpeg" };
    }
    const parts = [bytes.subarray(0, 2)];
    const removed = [];
    const kept = [];
    let i = 2;

    while (i < bytes.length - 1) {
      if (bytes[i] !== 0xff) return { ok: false, reason: "broken" };
      // 連續的 0xFF 是合法的填充
      let marker = bytes[i + 1];
      while (marker === 0xff && i + 2 < bytes.length) {
        i += 1;
        marker = bytes[i + 1];
      }
      if (JPEG_STANDALONE.has(marker)) {
        i += 2;
        continue;
      }
      // SOS 之後是壓縮過的影像資料，一路照抄到檔尾。這裡是無損的關鍵。
      if (marker === 0xda) {
        parts.push(bytes.subarray(i));
        i = bytes.length;
        break;
      }
      if (i + 4 > bytes.length) return { ok: false, reason: "broken" };
      const length = (bytes[i + 2] << 8) | bytes[i + 3];
      if (length < 2 || i + 2 + length > bytes.length) return { ok: false, reason: "broken" };
      const segment = bytes.subarray(i, i + 2 + length);
      const isApp = marker >= 0xe0 && marker <= 0xef;
      const isComment = marker === 0xfe;

      if ((isApp || isComment) && !JPEG_KEEP[marker]) {
        removed.push({ label: markerLabel(marker), marker: marker, bytes: segment.length });
      } else {
        if (JPEG_KEEP[marker]) {
          kept.push({ label: JPEG_KEEP[marker], marker: marker, bytes: segment.length });
        }
        parts.push(segment);
      }
      i += 2 + length;
    }

    if (!removed.length && !kept.length && parts.length < 2) {
      return { ok: false, reason: "broken" };
    }
    return { ok: true, data: concat(parts), removed: removed, kept: kept };
  }

  // PNG 的 chunk：長度(4) 型別(4) 資料 CRC(4)。影像相關的全留，
  // 文字與時間相關的全拿掉。刪掉整個 chunk 不影響其他 chunk 的 CRC。
  const PNG_DROP = {
    tEXt: "text", zTXt: "text", iTXt: "text",
    tIME: "time", eXIf: "exif",
  };

  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  function stripPng(bytes) {
    if (bytes.length < 8) return { ok: false, reason: "notPng" };
    for (let i = 0; i < 8; i += 1) {
      if (bytes[i] !== PNG_SIGNATURE[i]) return { ok: false, reason: "notPng" };
    }
    const parts = [bytes.subarray(0, 8)];
    const removed = [];
    let i = 8;
    let sawEnd = false;

    while (i + 8 <= bytes.length) {
      const length = readUint32(bytes, i);
      const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
      const total = 12 + length;
      if (length > bytes.length || i + total > bytes.length) return { ok: false, reason: "broken" };
      if (PNG_DROP[type]) {
        removed.push({ label: PNG_DROP[type], marker: type, bytes: total });
      } else {
        parts.push(bytes.subarray(i, i + total));
      }
      if (type === "IEND") {
        sawEnd = true;
        i += total;
        break;
      }
      i += total;
    }
    if (!sawEnd) return { ok: false, reason: "broken" };
    return { ok: true, data: concat(parts), removed: removed, kept: [] };
  }

  function readUint32(bytes, at) {
    return ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
  }

  function concat(parts) {
    let size = 0;
    for (const part of parts) size += part.length;
    const out = new Uint8Array(size);
    let at = 0;
    for (const part of parts) {
      out.set(part, at);
      at += part.length;
    }
    return out;
  }

  function detect(bytes) {
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
    if (bytes.length >= 8) {
      let png = true;
      for (let i = 0; i < 8; i += 1) if (bytes[i] !== PNG_SIGNATURE[i]) png = false;
      if (png) return "png";
    }
    // 認得出來但不支援的格式，訊息要說得比「這不是圖片」精確
    if (bytes.length >= 12) {
      const brand = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (brand === "ftyp") return "heic";
      const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
      const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (riff === "RIFF" && webp === "WEBP") return "webp";
    }
    if (bytes.length >= 3 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "gif";
    return "unknown";
  }

  function strip(bytes) {
    const kind = detect(bytes);
    if (kind === "jpeg") return Object.assign({ kind: kind }, stripJpeg(bytes));
    if (kind === "png") return Object.assign({ kind: kind }, stripPng(bytes));
    return { ok: false, kind: kind, reason: "unsupported" };
  }

  // 輸出檔名。原本叫 IMG_2024.jpg 的清完叫 IMG_2024-clean.jpg，兩份放在同一個
  // 資料夾不會互相蓋掉，也看得出哪一份是清過的。
  function cleanName(name) {
    const at = name.lastIndexOf(".");
    if (at <= 0) return name + "-clean";
    return name.slice(0, at) + "-clean" + name.slice(at);
  }

  // --- 介面 ---

  const root = document.getElementById("stripmeta-tool");
  if (!root) return;

  const CSS = `
    #stripmeta-tool { margin: 1em 0; }
    #stripmeta-tool .sm-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #stripmeta-tool .sm-drop--over {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #stripmeta-tool input[type="file"] { display: none; }
    #stripmeta-tool .sm-file {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: .8rem; margin: .8rem 0 0;
      display: flex; gap: .8rem; align-items: flex-start;
    }
    #stripmeta-tool .sm-file--bad { border-left: .15rem solid var(--md-typeset-del-color, #f44336); }
    #stripmeta-tool .sm-file--ok { border-left: .15rem solid #2e7d32; }
    #stripmeta-tool .sm-thumb {
      width: 4rem; height: 4rem; object-fit: cover; flex: none;
      border-radius: .1rem; background: var(--md-default-fg-color--lightest);
    }
    #stripmeta-tool .sm-body { flex: 1; min-width: 0; }
    #stripmeta-tool .sm-name {
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; word-break: break-all; margin: 0 0 .3rem;
    }
    #stripmeta-tool .sm-size { font-size: .72rem; opacity: .75; margin: 0 0 .4rem; }
    #stripmeta-tool .sm-list { list-style: none; margin: .3rem 0 0; padding: 0; font-size: .72rem; }
    #stripmeta-tool .sm-list li { margin: 0 0 .2rem; line-height: 1.6; }
    #stripmeta-tool .sm-tag {
      font-family: var(--md-code-font-family, monospace);
      background: var(--md-default-fg-color--lightest); padding: 0 .2rem;
      border-radius: .1rem; margin-right: .3rem;
    }
    #stripmeta-tool .sm-head { font-size: .7rem; opacity: .6; margin: .5rem 0 .1rem; }
    #stripmeta-tool .sm-error { font-size: .74rem; line-height: 1.7; margin: .2rem 0 0; }
    #stripmeta-tool button, #stripmeta-tool a.sm-dl {
      font: inherit; font-size: .74rem; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .3rem .7rem; display: inline-block;
      margin: .5rem .4rem 0 0; text-decoration: none;
    }
    #stripmeta-tool button:hover, #stripmeta-tool a.sm-dl:hover {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #stripmeta-tool .sm-note { font-size: .7rem; opacity: .75; line-height: 1.7; margin: .8rem 0 0; }
    @media (pointer: coarse) { #stripmeta-tool button, #stripmeta-tool a.sm-dl { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把圖片拖進來，或點一下選檔案。可以一次選多張，也可以直接貼上（Ctrl+V）。",
      dropOver: "放開就開始清",
      working: "處理中",
      clear: "清掉列表",
      download: "下載清乾淨的",
      removed: "拿掉了",
      kept: "留著沒動",
      sizeLine: "原始 {a}，清完 {b}",
      labels: {
        exif: "EXIF：拍攝時間、相機型號、GPS 座標，還有沒被裁切過的縮圖",
        photoshop: "Photoshop 與 IPTC 欄位：說明、作者、關鍵字",
        comment: "註解欄位：檔案裡夾帶的一段文字",
        app: "應用程式自訂欄位：各家軟體塞的東西",
        text: "文字欄位：作者、說明，XMP 也放在這裡",
        time: "修改時間",
        icc: "ICC 色彩描述檔：拿掉的話顏色會偏掉",
        adobe: "Adobe 色彩轉換標記：CMYK 的檔案少了它顏色會反過來",
        jfif: "JFIF 基本資訊：少了它有些看圖程式會抱怨",
      },
      nothing: "這個檔案裡沒有找到可以拿掉的欄位，本來就是乾淨的。",
      errors: {
        heic: "這是 HEIC/HEIF。iPhone 預設拍出來就是這個格式，它的容器結構複雜得多，這一頁還做不到。在 iPhone 上可以到「設定 → 相機 → 格式」選「最相容」，之後拍的就是 JPEG。已經拍好的可以用 AirDrop 或郵件傳給自己，那個過程多半會轉成 JPEG。",
        webp: "WebP 這一頁還不支援，目前只處理 JPEG 與 PNG。",
        gif: "GIF 這一頁還不支援，目前只處理 JPEG 與 PNG。",
        unsupported: "認不出這個格式。這一頁處理 JPEG 與 PNG。",
        notImage: "這不是圖片檔。",
        broken: "這個檔案的結構讀不下去，可能已經損壞，或是副檔名跟實際格式對不上。",
        verify: "清完的檔案解不開，這是這一頁的問題。原始檔沒有被動到，請不要用清完的那一份，並且回報這個狀況。",
      },
      note: "檔案在你的瀏覽器裡改，沒有上傳到任何地方。斷網時照樣可以用。清完的是新的一份，原始檔不會被動到。",
    },
    zh: {
      drop: "把图片拖进来，或点一下选文件。可以一次选多张，也可以直接粘贴（Ctrl+V）。",
      dropOver: "放开就开始清",
      working: "处理中",
      clear: "清掉列表",
      download: "下载清干净的",
      removed: "拿掉了",
      kept: "留着没动",
      sizeLine: "原始 {a}，清完 {b}",
      labels: {
        exif: "EXIF：拍摄时间、相机型号、GPS 坐标，还有没被裁切过的缩略图",
        photoshop: "Photoshop 与 IPTC 字段：说明、作者、关键词",
        comment: "注释字段：文件里夹带的一段文字",
        app: "应用程序自定义字段：各家软件塞的东西",
        text: "文字字段：作者、说明，XMP 也放在这里",
        time: "修改时间",
        icc: "ICC 色彩描述文件：拿掉的话颜色会偏掉",
        adobe: "Adobe 色彩转换标记：CMYK 的文件少了它颜色会反过来",
        jfif: "JFIF 基本信息：少了它有些看图程序会抱怨",
      },
      nothing: "这个文件里没有找到可以拿掉的字段，本来就是干净的。",
      errors: {
        heic: "这是 HEIC/HEIF。iPhone 默认拍出来就是这个格式，它的容器结构复杂得多，这一页还做不到。在 iPhone 上可以到「设置 → 相机 → 格式」选「最兼容」，之后拍的就是 JPEG。已经拍好的可以用 AirDrop 或邮件传给自己，那个过程多半会转成 JPEG。",
        webp: "WebP 这一页还不支持，目前只处理 JPEG 与 PNG。",
        gif: "GIF 这一页还不支持，目前只处理 JPEG 与 PNG。",
        unsupported: "认不出这个格式。这一页处理 JPEG 与 PNG。",
        notImage: "这不是图片文件。",
        broken: "这个文件的结构读不下去，可能已经损坏，或是扩展名跟实际格式对不上。",
        verify: "清完的文件解不开，这是这一页的问题。原始文件没有被动到，请不要用清完的那一份，并且回报这个状况。",
      },
      note: "文件在你的浏览器里改，没有上传到任何地方。断网时照样可以用。清完的是新的一份，原始文件不会被动到。",
    },
    en: {
      drop: "Drop images here, or click to choose files. Several at once is fine, and pasting works too (Ctrl+V).",
      dropOver: "Release to start",
      working: "Working",
      clear: "Clear the list",
      download: "Download the cleaned file",
      removed: "Removed",
      kept: "Kept as is",
      sizeLine: "{a} originally, {b} after cleaning",
      labels: {
        exif: "EXIF: capture time, camera model, GPS coordinates, and a thumbnail that may never have been cropped",
        photoshop: "Photoshop and IPTC fields: caption, author, keywords",
        comment: "Comment field: a piece of text carried inside the file",
        app: "Application-specific fields: whatever various software wrote in",
        text: "Text fields: author, description. XMP lives here too",
        time: "Modification time",
        icc: "ICC colour profile: removing it shifts the colours",
        adobe: "Adobe colour transform marker: without it, CMYK files come out inverted",
        jfif: "JFIF basics: some viewers complain without it",
      },
      nothing: "No removable fields were found in this file. It was already clean.",
      errors: {
        heic: "This is HEIC/HEIF. It is what an iPhone shoots by default, and its container is considerably more involved than this page handles. On an iPhone, Settings → Camera → Formats → Most Compatible switches future photos to JPEG. For photos already taken, sending them to yourself over AirDrop or email usually converts them.",
        webp: "WebP is not supported yet. This page handles JPEG and PNG.",
        gif: "GIF is not supported yet. This page handles JPEG and PNG.",
        unsupported: "The format was not recognised. This page handles JPEG and PNG.",
        notImage: "That is not an image file.",
        broken: "The structure of this file could not be read. It may be damaged, or the extension may not match the actual format.",
        verify: "The cleaned file will not open. That is a fault in this page. Your original was not touched. Please do not use the cleaned copy, and report this.",
      },
      note: "Files are modified in your browser and never uploaded. This works with the network off. The cleaned file is a new copy; your original is not touched.",
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

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

  // 每個處理過的檔案一列。物件 URL 留著給下載與縮圖用，換一批的時候一起收掉。
  const files = [];

  function release() {
    for (const item of files) {
      if (item.url) URL.revokeObjectURL(item.url);
    }
    files.length = 0;
  }

  function markerText(entry) {
    if (typeof entry.marker === "string") return entry.marker;
    return "0x" + entry.marker.toString(16).toUpperCase();
  }

  function listOf(title, entries) {
    const box = document.createDocumentFragment();
    box.appendChild(el("p", "sm-head", title));
    const list = el("ul", "sm-list");
    for (const entry of entries) {
      const li = el("li");
      li.appendChild(el("code", "sm-tag", markerText(entry)));
      li.appendChild(document.createTextNode(
        (t.labels[entry.label] || entry.label) + "（" + humanSize(entry.bytes) + "）"));
      list.appendChild(li);
    }
    box.appendChild(list);
    return box;
  }

  function renderFile(item) {
    const row = el("div", "sm-file " + (item.ok ? "sm-file--ok" : "sm-file--bad"));
    if (item.url && item.ok) {
      const thumb = el("img", "sm-thumb");
      thumb.src = item.url;
      thumb.alt = "";
      row.appendChild(thumb);
    }
    const body = el("div", "sm-body");
    body.appendChild(el("p", "sm-name", item.name));

    if (!item.ok) {
      body.appendChild(el("p", "sm-error", t.errors[item.reason] || t.errors.unsupported));
      row.appendChild(body);
      return row;
    }

    body.appendChild(el("p", "sm-size",
      t.sizeLine.replace("{a}", humanSize(item.originalSize)).replace("{b}", humanSize(item.cleanSize))));

    if (item.removed.length) body.appendChild(listOf(t.removed, item.removed));
    else body.appendChild(el("p", "sm-size", t.nothing));
    if (item.kept.length) body.appendChild(listOf(t.kept, item.kept));

    const link = el("a", "sm-dl", t.download);
    link.href = item.url;
    link.download = item.cleanName;
    body.appendChild(link);
    row.appendChild(body);
    return row;
  }

  function render() {
    root.textContent = "";

    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/jpeg,image/png";
    picker.multiple = true;
    picker.addEventListener("change", () => handle(picker.files));

    const drop = el("div", "sm-drop", t.drop);
    drop.addEventListener("click", () => picker.click());
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("sm-drop--over");
      drop.textContent = t.dropOver;
    });
    drop.addEventListener("dragleave", () => {
      drop.classList.remove("sm-drop--over");
      drop.textContent = t.drop;
    });
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("sm-drop--over");
      handle(event.dataTransfer && event.dataTransfer.files);
    });
    root.appendChild(picker);
    root.appendChild(drop);

    for (const item of files) root.appendChild(renderFile(item));

    if (files.length) {
      const clear = el("button", null, t.clear);
      clear.type = "button";
      clear.addEventListener("click", () => {
        release();
        render();
      });
      root.appendChild(clear);
    }

    root.appendChild(el("p", "sm-note", t.note));
  }

  // 清完之後真的載入一次。程式把檔案改壞了的話，這裡會攔下來，讀者才不會拿著一份
  // 打不開的照片去交差。原始檔全程沒有被動到。
  function verify(blob) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => resolve(url);
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      image.src = url;
    });
  }

  async function handleOne(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const result = strip(bytes);
    if (!result.ok) {
      return {
        ok: false, name: file.name,
        reason: result.kind && result.kind !== "unknown" && t.errors[result.kind]
          ? result.kind : result.reason,
      };
    }
    const type = result.kind === "png" ? "image/png" : "image/jpeg";
    const blob = new Blob([result.data], { type: type });
    const url = await verify(blob);
    if (!url) return { ok: false, name: file.name, reason: "verify" };
    return {
      ok: true, name: file.name, cleanName: cleanName(file.name),
      originalSize: bytes.length, cleanSize: result.data.length,
      removed: result.removed, kept: result.kept, url: url,
    };
  }

  async function handle(list) {
    if (!list || !list.length) return;
    release();
    for (const file of list) {
      if (file.type && file.type.indexOf("image/") !== 0) {
        files.push({ ok: false, name: file.name, reason: "notImage" });
        continue;
      }
      files.push(await handleOne(file));
    }
    render();
  }

  // 直接貼上。手機截圖之後最快的路徑。
  document.addEventListener("paste", (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;
    const picked = [];
    for (const item of items) {
      if (item.type && item.type.indexOf("image/") === 0) {
        const file = item.getAsFile();
        if (file) picked.push(file);
      }
    }
    if (picked.length) {
      event.preventDefault();
      handle(picked);
    }
  });

  render();
})();
