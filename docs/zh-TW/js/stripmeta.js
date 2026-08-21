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

  // --- MP4 與 MOV ---
  //
  // 這種檔案是一層包一層的 box：長度(4) 型別(4) 內容。metadata 住在 moov 底下的
  // udta 與 meta，拿掉它們不需要碰影像資料，跟 JPEG 剝 marker 是同一種操作。
  //
  // 跟 JPEG 不同的是巢狀。拿掉一個內層的 box，外層每一層的長度都要跟著減。
  //
  // 還有一個地方漏掉就會靜默損壞：stco 與 co64 記著每一段影像資料在檔案裡的位置，
  // 是從檔頭算起的絕對位移。moov 排在 mdat 前面的時候（網頁影片常見的 faststart
  // 佈局），前面少掉幾個位元組，後面每一段的位置就都不對了。那種壞法特別麻煩，
  // 檔案資訊讀得出來、時間長度也對，播下去才發現畫面碎掉。
  const MP4_DROP = { udta: "userdata", meta: "meta", skip: "padding", free: "padding" };
  const MP4_CONTAINERS = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts"]);

  function mp4Boxes(bytes, start, end) {
    const out = [];
    let at = start;
    while (at + 8 <= end) {
      let size = readUint32(bytes, at);
      let header = 8;
      const type = String.fromCharCode(bytes[at + 4], bytes[at + 5], bytes[at + 6], bytes[at + 7]);
      if (size === 0) size = end - at;
      if (size === 1) {
        // 64 位元長度。前 32 位是高位，超過 4 GB 的檔案才會用到。
        const high = readUint32(bytes, at + 8);
        const low = readUint32(bytes, at + 12);
        size = high * 4294967296 + low;
        header = 16;
      }
      if (size < header || at + size > end) return null;
      out.push({ type: type, at: at, size: size, header: header });
      at += size;
    }
    return out;
  }

  // 編碼器把自己的名字與版本寫在 compressorname，那是 32 個位元組的固定欄位，
  // 清成 0 之後長度一個位元組都沒變，所有位移照舊。
  function clearCompressorName(bytes, start, end) {
    let cleared = 0;
    const list = mp4Boxes(bytes, start, end);
    if (!list) return 0;
    for (const box of list) {
      if (box.type === "stsd") {
        // stsd 的內容前 8 個位元組是 version、flags 與筆數，之後才是各筆描述
        const entries = mp4Boxes(bytes, box.at + 16, box.at + box.size);
        for (const entry of entries || []) {
          const at = entry.at + 8 + 6 + 2 + 16 + 2 + 2 + 4 + 4 + 4 + 2;
          if (at + 32 > entry.at + entry.size) continue;
          if (bytes[at] === 0) continue;
          bytes.fill(0, at, at + 32);
          cleared += 1;
        }
      } else if (MP4_CONTAINERS.has(box.type)) {
        cleared += clearCompressorName(bytes, box.at + box.header, box.at + box.size);
      }
    }
    return cleared;
  }

  // 軌道的處理器名稱。ffmpeg 寫「VideoHandler」，iPhone 寫「Core Media Video」，
  // 其他裝置各有各的寫法，等於一個平台指紋。這個欄位是以 0 結尾的字串，第一個
  // 位元組填 0 就是空字串，後面留著不管，長度一個位元組都沒變。
  function clearHandlerNames(bytes, start, end) {
    let cleared = 0;
    const list = mp4Boxes(bytes, start, end);
    if (!list) return 0;
    for (const box of list) {
      if (box.type === "hdlr") {
        // version/flags(4) + pre_defined(4) + handler_type(4) + reserved(12)
        const at = box.at + box.header + 24;
        if (at < box.at + box.size && bytes[at] !== 0) {
          bytes.fill(0, at, box.at + box.size);
          cleared += 1;
        }
      } else if (MP4_CONTAINERS.has(box.type)) {
        cleared += clearHandlerNames(bytes, box.at + box.header, box.at + box.size);
      }
    }
    return cleared;
  }

  function rebuildMp4(bytes, start, end, depth, removed) {
    const list = mp4Boxes(bytes, start, end);
    if (!list) return null;
    const parts = [];
    for (const box of list) {
      if (MP4_DROP[box.type] && depth > 0) {
        removed.push({ label: MP4_DROP[box.type], marker: box.type, bytes: box.size });
        continue;
      }
      if (MP4_CONTAINERS.has(box.type)) {
        const inner = rebuildMp4(bytes, box.at + box.header, box.at + box.size, depth + 1, removed);
        if (!inner) return null;
        const head = new Uint8Array(box.header);
        writeUint32(head, 0, inner.length + box.header);
        head.set(bytes.subarray(box.at + 4, box.at + 8), 4);
        parts.push(head, inner);
      } else {
        parts.push(bytes.subarray(box.at, box.at + box.size));
      }
    }
    return concat(parts);
  }

  // 影像資料的位置全部往前移了 delta，記錄那些位置的表要一起改。
  function shiftChunkOffsets(bytes, start, end, delta) {
    let patched = 0;
    const list = mp4Boxes(bytes, start, end);
    if (!list) return 0;
    for (const box of list) {
      if (box.type === "stco") {
        const count = readUint32(bytes, box.at + 12);
        for (let i = 0; i < count; i += 1) {
          const at = box.at + 16 + i * 4;
          if (at + 4 > box.at + box.size) break;
          writeUint32(bytes, at, readUint32(bytes, at) - delta);
          patched += 1;
        }
      } else if (box.type === "co64") {
        const count = readUint32(bytes, box.at + 12);
        for (let i = 0; i < count; i += 1) {
          const at = box.at + 16 + i * 8;
          if (at + 8 > box.at + box.size) break;
          const high = readUint32(bytes, at);
          const low = readUint32(bytes, at + 4);
          const value = high * 4294967296 + low - delta;
          writeUint32(bytes, at, Math.floor(value / 4294967296));
          writeUint32(bytes, at + 4, value >>> 0);
          patched += 1;
        }
      } else if (MP4_CONTAINERS.has(box.type)) {
        patched += shiftChunkOffsets(bytes, box.at + box.header, box.at + box.size, delta);
      }
    }
    return patched;
  }

  // 有些編碼器把自己的版本寫進壓縮資料本身，那一段不是 metadata 而是影音資料的
  // 一部分。要清掉只能重新編碼，而重新編碼會損失畫質，還會留下新編碼器的痕跡，
  // 換一個指紋而已。這一頁不做那件事，但要把情況說出來，不能讓讀者以為清乾淨了。
  const ENCODER_MARKS = ["Lavc", "LAME", "libx264", "libvpx", "x264 - core", "Xing", "Info"];

  function encoderMarksInData(bytes, start, end) {
    // 只掃前後各 64 KB。整個 mdat 掃一遍在手機上會卡住，而編碼器的字串多半寫在頭尾
    const window = 65536;
    const found = [];
    const check = (from, to) => {
      let text = "";
      for (let i = from; i < to; i += 1) {
        const code = bytes[i];
        text += code >= 32 && code < 127 ? String.fromCharCode(code) : "\u0000";
      }
      for (const mark of ENCODER_MARKS) {
        if (text.indexOf(mark) >= 0 && found.indexOf(mark) < 0) found.push(mark);
      }
    };
    check(start, Math.min(end, start + window));
    if (end - start > window * 2) check(end - window, end);
    return found;
  }

  // 這支不會就地改動傳進來的資料。rebuildMp4 產出的是新的陣列，後面幾道原地寫入
  // （處理器名稱、編碼器名稱、位置表）都作用在那一份上。影片動輒上百 MB，先複製
  // 一份再改等於多佔一倍記憶體，沒有必要。
  function stripMp4(bytes) {
    const top = mp4Boxes(bytes, 0, bytes.length);
    if (!top || !top.length) return { ok: false, reason: "broken" };
    let moovAt = -1;
    let mdatAt = -1;
    for (const box of top) {
      if (box.type === "moov" && moovAt < 0) moovAt = box.at;
      if (box.type === "mdat" && mdatAt < 0) mdatAt = box.at;
    }
    if (moovAt < 0) return { ok: false, reason: "broken" };

    const removed = [];
    const data = rebuildMp4(bytes, 0, bytes.length, 0, removed);
    if (!data) return { ok: false, reason: "broken" };

    const cleared = clearCompressorName(data, 0, data.length);
    if (cleared) {
      removed.push({ label: "encoder", marker: "stsd", bytes: cleared * 32 });
    }
    const handlers = clearHandlerNames(data, 0, data.length);
    if (handlers) {
      removed.push({ label: "handler", marker: "hdlr", bytes: handlers });
    }

    // moov 在 mdat 之前才需要改。排在後面的話影像資料的位置沒有動到。
    const delta = bytes.length - data.length;
    if (delta && mdatAt > moovAt) shiftChunkOffsets(data, 0, data.length, delta);

    // 壓縮資料裡的編碼器痕跡清不掉，掃出來如實告訴讀者
    const notes = [];
    const top2 = mp4Boxes(data, 0, data.length) || [];
    for (const box of top2) {
      if (box.type !== "mdat") continue;
      const marks = encoderMarksInData(data, box.at + box.header, box.at + box.size);
      if (marks.length) notes.push({ label: "encoderInData", detail: marks.join("、") });
      break;
    }

    return { ok: true, data: data, removed: removed, kept: [], notes: notes };
  }

  function writeUint32(bytes, at, value) {
    bytes[at] = (value >>> 24) & 0xff;
    bytes[at + 1] = (value >>> 16) & 0xff;
    bytes[at + 2] = (value >>> 8) & 0xff;
    bytes[at + 3] = value & 0xff;
  }

  function detect(bytes) {
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
    if (bytes.length >= 8) {
      let png = true;
      for (let i = 0; i < 8; i += 1) if (bytes[i] !== PNG_SIGNATURE[i]) png = false;
      if (png) return "png";
    }
    // ftyp 開頭的是同一個容器家族，要看後面的 brand 才知道是照片還是影片
    if (bytes.length >= 12) {
      const brand = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (brand === "ftyp") {
        const sub = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
        if (sub === "heic" || sub === "heix" || sub === "hevc" || sub === "mif1") return "heic";
        return "mp4";
      }
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
    if (kind === "mp4") return Object.assign({ kind: kind }, stripMp4(bytes));
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
      drop: "把圖片或影片拖進來，或點一下選檔案。可以一次選多個，也可以直接貼上（Ctrl+V）。",
      dropOver: "放開就開始清",
      working: "處理中",
      clear: "清掉列表",
      download: "下載清乾淨的",
      removed: "拿掉了",
      kept: "留著沒動",
      sizeLine: "原始 {a}，清完 {b}",
      labels: {
        userdata: "影片的使用者資料區：標題、作者、拍攝地點座標、裝置型號都放在這裡",
        meta: "另一個放描述欄位的地方",
        padding: "空白填充，本來就沒有內容",
        encoder: "編碼器名稱與版本，那會指出你用什麼軟體或哪一款手機處理過",
        handler: "軌道的處理器名稱，不同平台寫法不同，等於一個平台指紋",
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
      notes: {
        encoderInData: "壓縮資料本身還帶著編碼器的版本字串，那不是 metadata，是影音資料的一部分。要清掉只能重新編碼，而重新編碼會損失畫質，也會換上新編碼器的痕跡。這一頁不做那件事。",
      },
      mp4: "這是 MP4 或 MOV，處理的是容器裡的描述欄位。壓縮過的影音資料一個位元都不會動。",
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
      drop: "把图片或视频拖进来，或点一下选文件。可以一次选多个，也可以直接粘贴（Ctrl+V）。",
      dropOver: "放开就开始清",
      working: "处理中",
      clear: "清掉列表",
      download: "下载清干净的",
      removed: "拿掉了",
      kept: "留着没动",
      sizeLine: "原始 {a}，清完 {b}",
      labels: {
        userdata: "视频的用户数据区：标题、作者、拍摄地点坐标、设备型号都放在这里",
        meta: "另一个放描述字段的地方",
        padding: "空白填充，本来就没有内容",
        encoder: "编码器名称与版本，那会指出你用什么软件或哪一款手机处理过",
        handler: "轨道的处理器名称，不同平台写法不同，等于一个平台指纹",
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
      notes: {
        encoderInData: "压缩数据本身还带着编码器的版本字符串，那不是 metadata，是影音数据的一部分。要清掉只能重新编码，而重新编码会损失画质，也会换上新编码器的痕迹。这一页不做那件事。",
      },
      mp4: "这是 MP4 或 MOV，处理的是容器里的描述字段。压缩过的影音数据一个比特都不会动。",
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
      drop: "Drop images or videos here, or click to choose files. Several at once is fine, and pasting works too (Ctrl+V).",
      dropOver: "Release to start",
      working: "Working",
      clear: "Clear the list",
      download: "Download the cleaned file",
      removed: "Removed",
      kept: "Kept as is",
      sizeLine: "{a} originally, {b} after cleaning",
      labels: {
        userdata: "The video's user data area: title, author, capture coordinates and device model all live here",
        meta: "Another place descriptive fields are kept",
        padding: "Blank padding, empty to begin with",
        encoder: "Encoder name and version, which points at the software or the phone model that processed the file",
        handler: "The track's handler name, written differently by each platform, which amounts to a platform fingerprint",
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
      notes: {
        encoderInData: "The compressed data itself still carries the encoder's version string. That is not metadata; it is part of the audio and video data. Removing it means re-encoding, which costs quality and substitutes a new encoder's traces for the old ones. This page does not do that.",
      },
      mp4: "This is an MP4 or MOV. What gets handled is the descriptive fields in the container. Not one byte of the compressed audio or video is touched.",
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
    if (item.url && item.ok && item.kind !== "mp4") {
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
    if (item.kind === "mp4") body.appendChild(el("p", "sm-size", t.mp4));

    if (item.removed.length) body.appendChild(listOf(t.removed, item.removed));
    else body.appendChild(el("p", "sm-size", t.nothing));
    if (item.kept.length) body.appendChild(listOf(t.kept, item.kept));

    // 清不掉的東西要講出來。讀者以為清乾淨了才是最危險的狀態。
    for (const note of item.notes || []) {
      const line = el("p", "sm-warn");
      line.appendChild(document.createTextNode(t.notes[note.label] || note.label));
      if (note.detail) {
        line.appendChild(document.createTextNode("（"));
        line.appendChild(el("code", "sm-tag", note.detail));
        line.appendChild(document.createTextNode("）"));
      }
      body.appendChild(line);
    }

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
    picker.accept = "image/jpeg,image/png,video/mp4,video/quicktime";
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
  // 打不開的檔案離開。原始檔全程沒有被動到。
  //
  // 影片要用 video 元素驗，而且要等到 metadata 讀出來為止。改壞影片最典型的症狀
  // 是時間長度變成 0 或 NaN，那正是 loadedmetadata 這個時間點看得出來的事。
  function verify(blob, kind) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const fail = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      if (kind === "mp4") {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.onloadedmetadata = () => {
          const seconds = video.duration;
          if (!seconds || !isFinite(seconds)) return fail();
          resolve(url);
        };
        video.onerror = fail;
        video.src = url;
        return;
      }
      const image = new Image();
      image.onload = () => resolve(url);
      image.onerror = fail;
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
    const TYPES = { png: "image/png", jpeg: "image/jpeg", mp4: "video/mp4" };
    const blob = new Blob([result.data], { type: TYPES[result.kind] || "application/octet-stream" });
    const url = await verify(blob, result.kind);
    if (!url) return { ok: false, name: file.name, reason: "verify" };
    return {
      ok: true, name: file.name, cleanName: cleanName(file.name),
      originalSize: bytes.length, cleanSize: result.data.length,
      kind: result.kind,
      removed: result.removed, kept: result.kept, notes: result.notes || [], url: url,
    };
  }

  async function handle(list) {
    if (!list || !list.length) return;
    release();
    for (const file of list) {
      if (file.type && file.type.indexOf("image/") !== 0 && file.type.indexOf("video/") !== 0) {
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
      if (item.type && (item.type.indexOf("image/") === 0 || item.type.indexOf("video/") === 0)) {
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
