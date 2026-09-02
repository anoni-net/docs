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

  // JPEG 的 marker。留下來的這幾個屬於解碼或呈現需要的，不算 metadata。
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

  // 支援的格式。畫面上那張表、拖放區的說明、還有測試，全部從這一份讀，
  // 三個地方各寫一份的話遲早會對不起來，而文案宣稱支援、程式其實不支援是最糟的。
  const SUPPORTED = [
    { kind: "jpeg", ext: ".jpg", lossless: true },
    { kind: "png", ext: ".png", lossless: true },
    { kind: "webp", ext: ".webp", lossless: true },
    { kind: "gif", ext: ".gif", lossless: true },
    { kind: "mp4", ext: ".mp4 .mov .m4a", lossless: true },
    { kind: "mp3", ext: ".mp3", lossless: true },
    { kind: "wav", ext: ".wav", lossless: true },
    { kind: "ooxml", ext: ".docx .xlsx .pptx", lossless: true },
    { kind: "pdf", ext: ".pdf", lossless: false },
  ];

  // --- WebP ---
  //
  // RIFF 容器：檔頭之後是一連串 chunk，每個 chunk 是 4 個字母的代號、4 個位元組的
  // 長度、內容，長度是奇數的話後面補一個位元組。metadata 在 EXIF 與 XMP 這兩個
  // chunk 裡，整段拿掉就好。
  //
  // 有一個地方漏掉會讓檔案自相矛盾：VP8X 那個 chunk 的第一個位元組是一組旗標，
  // 記著這個檔案有沒有 EXIF、有沒有 XMP。chunk 拿掉了旗標卻還立著，解碼器會去找
  // 一個不存在的東西。
  const WEBP_DROP = { EXIF: "exif", "XMP ": "xmp" };

  function stripWebp(bytes) {
    if (bytes.length < 16) return { ok: false, reason: "broken" };
    const riffSize = readUint32LE(bytes, 4);
    if (riffSize + 8 > bytes.length) return { ok: false, reason: "broken" };

    const head = [bytes.subarray(0, 12)];
    const parts = [];
    const removed = [];
    let at = 12;
    let vp8xAt = -1;

    while (at + 8 <= bytes.length) {
      const fourcc = String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
      const size = readUint32LE(bytes, at + 4);
      const padded = size + (size & 1);
      if (at + 8 + padded > bytes.length) return { ok: false, reason: "broken" };
      if (WEBP_DROP[fourcc]) {
        removed.push({ label: WEBP_DROP[fourcc], marker: fourcc.trim(), bytes: 8 + padded });
      } else {
        if (fourcc === "VP8X") vp8xAt = 12 + parts.reduce((n, p) => n + p.length, 0);
        parts.push(bytes.subarray(at, at + 8 + padded));
      }
      at += 8 + padded;
    }
    if (!parts.length) return { ok: false, reason: "broken" };

    const body = concat(parts);
    const data = concat([head[0], body]);
    // RIFF 的長度欄位算的是它後面所有東西，也就是 "WEBP" 那四個字母加上全部 chunk
    writeUint32LE(data, 4, data.length - 8);

    // 旗標要跟實際的內容一致。EXIF 是第 3 位，XMP 是第 2 位。
    if (vp8xAt > 0 && removed.length) {
      const flagsAt = vp8xAt + 8;
      data[flagsAt] = data[flagsAt] & ~0x0c;
    }
    return { ok: true, data: data, removed: removed, kept: [] };
  }

  function readUint32LE(bytes, at) {
    return (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0;
  }

  function writeUint32LE(bytes, at, value) {
    bytes[at] = value & 0xff;
    bytes[at + 1] = (value >>> 8) & 0xff;
    bytes[at + 2] = (value >>> 16) & 0xff;
    bytes[at + 3] = (value >>> 24) & 0xff;
  }

  // --- GIF ---
  //
  // 一連串區塊：0x21 開頭的是擴充區塊，0x2C 是影像，0x3B 是結尾。metadata 住在
  // 註解擴充（0xFE）與應用程式擴充（0xFF）裡，XMP 也是用後者夾帶的。
  //
  // 應用程式擴充不能全部拿掉：NETSCAPE2.0 那一個記著動畫要循環幾次，拿掉之後
  // 動圖只會播一次。
  const GIF_KEEP_APPS = ["NETSCAPE2.0", "ANIMEXTS1.0"];

  function stripGif(bytes) {
    if (bytes.length < 13) return { ok: false, reason: "broken" };
    const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]);
    if (sig !== "GIF87a" && sig !== "GIF89a") return { ok: false, reason: "broken" };

    let at = 13;
    // 全域調色盤，大小記在 Logical Screen Descriptor 的旗標裡
    const packed = bytes[10];
    if (packed & 0x80) at += 3 * (1 << ((packed & 0x07) + 1));
    if (at > bytes.length) return { ok: false, reason: "broken" };

    const parts = [bytes.subarray(0, at)];
    const removed = [];

    // 資料子區塊：一個長度位元組加那麼多內容，長度 0 表示結束
    const skipSubBlocks = (from) => {
      let cursor = from;
      while (cursor < bytes.length) {
        const len = bytes[cursor];
        cursor += 1 + len;
        if (len === 0) return cursor;
      }
      return -1;
    };

    while (at < bytes.length) {
      const marker = bytes[at];
      if (marker === 0x3b) {
        parts.push(bytes.subarray(at, at + 1));
        at += 1;
        break;
      }
      if (marker === 0x21) {
        const label = bytes[at + 1];
        // 擴充區塊的第三個位元組就是第一個子區塊的長度，所有類型都從那裡開始走。
        // 應用程式擴充的第一個子區塊剛好是 11 個位元組的識別字串，一樣走得過去。
        const end = skipSubBlocks(at + 2);
        if (end < 0) return { ok: false, reason: "broken" };

        let drop = label === 0xfe || label === 0x01;
        if (label === 0xff) {
          let name = "";
          for (let i = 0; i < 11 && at + 3 + i < bytes.length; i += 1) {
            name += String.fromCharCode(bytes[at + 3 + i]);
          }
          drop = GIF_KEEP_APPS.indexOf(name) < 0;
        }
        if (drop) {
          removed.push({
            label: label === 0xfe ? "comment" : "application",
            marker: label === 0xfe ? "comment" : "app",
            bytes: end - at,
          });
        } else {
          parts.push(bytes.subarray(at, end));
        }
        at = end;
        continue;
      }
      if (marker === 0x2c) {
        // 影像描述子 10 個位元組，可能跟著區域調色盤，然後是 LZW 資料
        let cursor = at + 10;
        const localFlags = bytes[at + 9];
        if (localFlags & 0x80) cursor += 3 * (1 << ((localFlags & 0x07) + 1));
        cursor += 1; // LZW 最小碼長度
        const end = skipSubBlocks(cursor);
        if (end < 0) return { ok: false, reason: "broken" };
        parts.push(bytes.subarray(at, end));
        at = end;
        continue;
      }
      // 認不得的位元組，結構跟預期不同，不要硬猜
      return { ok: false, reason: "broken" };
    }

    return { ok: true, data: concat(parts), removed: removed, kept: [] };
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

  // --- MP3 ---
  //
  // 標籤住在檔頭（ID3v2）與檔尾（ID3v1 固定 128 位元組、APEv2）。中間是一連串 MPEG
  // 音框，一個位元都不動。編碼器（LAME、Xing）會把自己的資訊寫進第一個音框，那屬於
  // 聲音資料，跟影片的 compressorname 同一種情況，掃到就列在提醒裡。
  function asciiAt(bytes, at, length) {
    let text = "";
    for (let i = 0; i < length && at + i < bytes.length; i += 1) {
      text += String.fromCharCode(bytes[at + i]);
    }
    return text;
  }

  // ID3v2 標頭 10 個位元組，大小是 syncsafe 整數，旗標第 4 位表示後面還有 10 個
  // 位元組的 footer。回整個標籤的長度，不是 ID3v2 就回 0。
  function id3v2Size(bytes, at) {
    if (bytes.length < at + 10) return 0;
    if (asciiAt(bytes, at, 3) !== "ID3") return 0;
    const size = ((bytes[at + 6] & 0x7f) << 21) | ((bytes[at + 7] & 0x7f) << 14) |
      ((bytes[at + 8] & 0x7f) << 7) | (bytes[at + 9] & 0x7f);
    const footer = bytes[at + 5] & 0x10 ? 10 : 0;
    return 10 + size + footer;
  }

  // MPEG 音框的同步字。AAC 的 ADTS 也是 0xFFF 開頭，差在 layer 位元是保留值 00，
  // 這裡不會把它認成 MP3。
  function isMp3Frame(bytes, at) {
    if (at + 4 > bytes.length) return false;
    if (bytes[at] !== 0xff || (bytes[at + 1] & 0xe0) !== 0xe0) return false;
    const layer = (bytes[at + 1] >> 1) & 0x3;
    const bitrate = bytes[at + 2] >> 4;
    const rate = (bytes[at + 2] >> 2) & 0x3;
    return layer !== 0 && bitrate !== 0 && bitrate !== 15 && rate !== 3;
  }

  function stripMp3(bytes) {
    const removed = [];
    let start = 0;
    // 檔頭可能疊好幾個 ID3v2
    for (;;) {
      const size = id3v2Size(bytes, start);
      if (!size || start + size > bytes.length) break;
      removed.push({ label: "id3v2", marker: "ID3v2." + bytes[start + 3], bytes: size });
      start += size;
    }
    let end = bytes.length;
    if (end - start >= 128 && asciiAt(bytes, end - 128, 3) === "TAG") {
      removed.push({ label: "id3v1", marker: "ID3v1", bytes: 128 });
      end -= 128;
    }
    // APEv2 的 footer 32 個位元組，size 欄位含所有項目與 footer、不含 header，
    // header 有沒有看 flags 的最高位
    if (end - start >= 32 && asciiAt(bytes, end - 32, 8) === "APETAGEX") {
      const size = readUint32LE(bytes, end - 32 + 12);
      const flags = readUint32LE(bytes, end - 32 + 20);
      const total = size + (flags & 0x80000000 ? 32 : 0);
      if (total <= end - start) {
        removed.push({ label: "ape", marker: "APEv2", bytes: total });
        end -= total;
      }
    }
    // 標籤之後應該就是第一個音框。允許幾 KB 的填充，填充本身留著不動。
    let probe = start;
    let found = false;
    while (probe < Math.min(end, start + 4096)) {
      if (isMp3Frame(bytes, probe)) { found = true; break; }
      probe += 1;
    }
    if (!found) return { ok: false, reason: "broken" };

    const data = bytes.slice(start, end);
    const notes = [];
    const marks = encoderMarksInData(data, 0, data.length);
    if (marks.length) notes.push({ label: "encoderInData", detail: marks.join("、") });
    return { ok: true, data: data, removed: removed, kept: [], notes: notes };
  }

  // --- WAV ---
  //
  // RIFF 容器，跟 WebP 同一種結構。描述欄位在 LIST（INFO 型：演出者、軟體、日期、
  // 註解）、bext（廣播波形：製作者、日期、時間、編碼歷程）、iXML、_PMX（XMP）與
  // id3 這幾個 chunk。fmt 與 data 照抄，聲音資料一個位元都不動。LIST 的另一型 adtl
  // 是提示點的標籤，屬於內容，留著。
  const WAV_DROP = {
    "LIST": "wavInfo", "bext": "bext", "iXML": "ixml", "axml": "ixml",
    "_PMX": "wavXmp", "id3 ": "wavId3", "cart": "bext",
  };

  function stripWav(bytes) {
    if (bytes.length < 12) return { ok: false, reason: "broken" };
    const parts = [];
    const removed = [];
    let at = 12;
    let sawData = false;
    while (at + 8 <= bytes.length) {
      const fourcc = asciiAt(bytes, at, 4);
      const size = readUint32LE(bytes, at + 4);
      const padded = size + (size & 1);
      // 最後一個 chunk 的填充位元組有些程式會省略
      if (at + 8 + size > bytes.length) return { ok: false, reason: "broken" };
      const total = Math.min(8 + padded, bytes.length - at);
      const drop = WAV_DROP[fourcc] &&
        !(fourcc === "LIST" && asciiAt(bytes, at + 8, 4) !== "INFO");
      if (drop) {
        removed.push({ label: WAV_DROP[fourcc], marker: fourcc.trim(), bytes: total });
      } else {
        if (fourcc === "data") sawData = true;
        parts.push(bytes.subarray(at, at + total));
      }
      at += total;
    }
    if (!sawData) return { ok: false, reason: "broken" };
    const data = concat([bytes.subarray(0, 12), concat(parts)]);
    writeUint32LE(data, 4, data.length - 8);
    return { ok: true, data: data, removed: removed, kept: [], notes: [] };
  }

  // --- Office 文件（DOCX、XLSX、PPTX）---
  //
  // OOXML 是一個 zip，裡面是一堆 XML 部件。描述欄位住在 docProps/core.xml（作者、
  // 最後修改者、建立與修改時間、標題、修訂次數）、docProps/app.xml（製作軟體與版本、
  // 公司、範本、總編輯時間）與 docProps/custom.xml（自訂屬性），縮圖在
  // docProps/thumbnail.*。內文在 word/document.xml 這類部件裡，一個字都不動。
  //
  // 幾個做法上的決定：
  //
  // 部件是清空，不是刪掉。[Content_Types].xml 與 _rels/.rels 各記著一份部件清單，
  // 刪掉部件要同步改兩份，漏一份 Word 會說檔案損毀。把 core.xml 換成一個空的根元素，
  // 結構完全不變，所有欄位在 schema 裡本來就是選填。縮圖是例外，圖片沒有「空」的
  // 寫法，那一個真的刪，連同 .rels 與 [Content_Types].xml 裡指向它的那幾行。
  //
  // zip 的每個部件自己帶著修改時間。Word 寫的是 1980-01-01，LibreOffice 寫的是真的
  // 存檔時間，等於另一組時間戳記。全部改成 1980-01-01，extra 欄位（可能帶 unix 時間
  // 與 uid）整段丟掉。
  //
  // 夾在文件裡的圖片照樣帶 EXIF。從手機相簿拖進 Word 的照片，GPS 座標跟著進了
  // word/media/。這裡把每一張拿出來走一次上面 JPEG 與 PNG 的流程，清完再放回去。
  //
  // 留言、追蹤修訂與演講者備忘稿是內文的一部分，帶著作者與時間，但這一頁不動它們，
  // 掃到就列在提醒裡，讀者要在編輯軟體裡接受或刪除之後再存一次。
  //
  // 解壓縮與重新壓縮用瀏覽器內建的 DecompressionStream 與 CompressionStream
  // （deflate-raw），沒有 vendor 任何函式庫。這兩支是非同步的，所以 stripOoxml 跟
  // stripPdf 一樣不走同步的 strip()。
  const ZIP_LOCAL = 0x04034b50;
  const ZIP_CENTRAL = 0x02014b50;
  const ZIP_END = 0x06054b50;
  // 1980-01-01，DOS 日期的最小合法值。Word 自己寫的就是這個。
  const ZIP_EPOCH_DATE = 0x0021;

  let crcTable = null;
  function crc32(bytes) {
    if (!crcTable) {
      crcTable = new Int32Array(256);
      for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        crcTable[n] = c;
      }
    }
    let crc = -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
  }

  function readUint16LE(bytes, at) {
    return bytes[at] | (bytes[at + 1] << 8);
  }

  function writeUint16LE(bytes, at, value) {
    bytes[at] = value & 0xff;
    bytes[at + 1] = (value >>> 8) & 0xff;
  }

  const utf8Encode = (text) => new TextEncoder().encode(text);
  const utf8Decode = (bytes) => new TextDecoder("utf-8").decode(bytes);

  // 讀 zip 的中央目錄。每一項帶著壓縮資料的位置，內容等要用的時候才解。
  // 回 { entries, commentLen } 或 { error }。
  function parseZip(bytes) {
    // EOCD 在檔尾，後面可能跟著一段註解，最長 65535
    let end = -1;
    const from = Math.max(0, bytes.length - 22 - 65535);
    for (let at = bytes.length - 22; at >= from; at -= 1) {
      if (readUint32LE(bytes, at) === ZIP_END) { end = at; break; }
    }
    if (end < 0) return { error: "broken" };
    const count = readUint16LE(bytes, end + 10);
    const cdSize = readUint32LE(bytes, end + 12);
    const cdAt = readUint32LE(bytes, end + 16);
    const commentLen = readUint16LE(bytes, end + 20);
    if (count === 0xffff || cdSize === 0xffffffff || cdAt === 0xffffffff) return { error: "zip64" };
    if (cdAt + cdSize > end) return { error: "broken" };

    const entries = [];
    let at = cdAt;
    for (let i = 0; i < count; i += 1) {
      if (at + 46 > end || readUint32LE(bytes, at) !== ZIP_CENTRAL) return { error: "broken" };
      const flags = readUint16LE(bytes, at + 8);
      const method = readUint16LE(bytes, at + 10);
      const csize = readUint32LE(bytes, at + 20);
      const usize = readUint32LE(bytes, at + 24);
      const nameLen = readUint16LE(bytes, at + 28);
      const extraLen = readUint16LE(bytes, at + 30);
      const cmtLen = readUint16LE(bytes, at + 32);
      const offset = readUint32LE(bytes, at + 42);
      if (csize === 0xffffffff || usize === 0xffffffff || offset === 0xffffffff) return { error: "zip64" };
      if (flags & 0x1) return { error: "encrypted" };
      if (method !== 0 && method !== 8) return { error: "broken" };
      const name = utf8Decode(bytes.subarray(at + 46, at + 46 + nameLen));
      // 本地檔頭的名稱與 extra 長度可能跟中央目錄不同，要自己讀
      if (offset + 30 > bytes.length || readUint32LE(bytes, offset) !== ZIP_LOCAL) return { error: "broken" };
      const localExtraLen = readUint16LE(bytes, offset + 28);
      const dataAt = offset + 30 + readUint16LE(bytes, offset + 26) + localExtraLen;
      if (dataAt + csize > bytes.length) return { error: "broken" };
      entries.push({
        name: name, flags: flags, method: method,
        time: readUint16LE(bytes, at + 12), date: readUint16LE(bytes, at + 14),
        crc: readUint32LE(bytes, at + 16), csize: csize, usize: usize,
        madeBy: readUint16LE(bytes, at + 4), needed: readUint16LE(bytes, at + 6),
        internal: readUint16LE(bytes, at + 36), external: readUint32LE(bytes, at + 38),
        extraLen: extraLen + localExtraLen,
        data: bytes.subarray(dataAt, dataAt + csize),
      });
      at += 46 + nameLen + extraLen + cmtLen;
    }
    return { entries: entries, commentLen: commentLen };
  }

  // 先把讀取端接上再寫，不然大一點的部件寫進去會等讀取端消化，兩邊互等。
  async function throughStream(stream, bytes) {
    const done = new Response(stream.readable).arrayBuffer();
    const writer = stream.writable.getWriter();
    await writer.write(bytes);
    await writer.close();
    return new Uint8Array(await done);
  }

  const inflateRaw = (bytes) => throughStream(new DecompressionStream("deflate-raw"), bytes);
  const deflateRaw = (bytes) => throughStream(new CompressionStream("deflate-raw"), bytes);

  function entryContent(entry) {
    if (entry.method === 0) return Promise.resolve(entry.data);
    return inflateRaw(entry.data);
  }

  // 寫一個新的 zip。時間一律 1980-01-01，沒有 extra 也沒有註解，
  // 旗標只留 UTF-8 名稱那一位（資料描述子那一位不再需要，長度與 CRC 都寫在檔頭裡）。
  function buildZip(entries) {
    const parts = [];
    const central = [];
    let offset = 0;
    for (const entry of entries) {
      const name = utf8Encode(entry.name);
      const flags = entry.flags & 0x0800;
      const local = new Uint8Array(30 + name.length);
      writeUint32LE(local, 0, ZIP_LOCAL);
      writeUint16LE(local, 4, entry.needed || 20);
      writeUint16LE(local, 6, flags);
      writeUint16LE(local, 8, entry.method);
      writeUint16LE(local, 10, 0);
      writeUint16LE(local, 12, ZIP_EPOCH_DATE);
      writeUint32LE(local, 14, entry.crc);
      writeUint32LE(local, 18, entry.csize);
      writeUint32LE(local, 22, entry.usize);
      writeUint16LE(local, 26, name.length);
      writeUint16LE(local, 28, 0);
      local.set(name, 30);
      parts.push(local, entry.data);

      const cd = new Uint8Array(46 + name.length);
      writeUint32LE(cd, 0, ZIP_CENTRAL);
      writeUint16LE(cd, 4, entry.madeBy || 20);
      writeUint16LE(cd, 6, entry.needed || 20);
      writeUint16LE(cd, 8, flags);
      writeUint16LE(cd, 10, entry.method);
      writeUint16LE(cd, 12, 0);
      writeUint16LE(cd, 14, ZIP_EPOCH_DATE);
      writeUint32LE(cd, 16, entry.crc);
      writeUint32LE(cd, 20, entry.csize);
      writeUint32LE(cd, 24, entry.usize);
      writeUint16LE(cd, 28, name.length);
      writeUint16LE(cd, 30, 0);
      writeUint16LE(cd, 32, 0);
      writeUint16LE(cd, 34, 0);
      writeUint16LE(cd, 36, entry.internal || 0);
      writeUint32LE(cd, 38, entry.external || 0);
      writeUint32LE(cd, 42, offset);
      cd.set(name, 46);
      central.push(cd);
      offset += local.length + entry.data.length;
    }
    const cdBytes = concat(central);
    const end = new Uint8Array(22);
    writeUint32LE(end, 0, ZIP_END);
    writeUint16LE(end, 8, entries.length);
    writeUint16LE(end, 10, entries.length);
    writeUint32LE(end, 12, cdBytes.length);
    writeUint32LE(end, 16, offset);
    return concat(parts.concat([cdBytes, end]));
  }

  // 空的部件。所有欄位在 schema 裡都是選填，留著根元素結構就完整。
  const OOXML_EMPTY = {
    core: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>',
    app: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"/>',
    custom: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"/>',
  };

  // core.xml 與 app.xml 裡各個欄位歸到哪個標籤，畫面上照標籤列。最後一個捕捉群組是
  // 欄位內容，空的不算。
  const CORE_FIELDS = [
    ["coreCreator", /<dc:creator>([\s\S]*?)<\/dc:creator>/g],
    ["coreModifiedBy", /<cp:lastModifiedBy>([\s\S]*?)<\/cp:lastModifiedBy>/g],
    ["coreDates", /<(dcterms:created|dcterms:modified|cp:lastPrinted)\b[^>]*>([\s\S]*?)<\/\1>/g],
    ["coreTitle", /<(dc:title|dc:subject|dc:description|cp:keywords|cp:category|cp:contentStatus)\b[^>]*>([\s\S]*?)<\/\1>/g],
    ["coreRevision", /<cp:revision>([\s\S]*?)<\/cp:revision>/g],
  ];
  const APP_FIELDS = [
    ["appApplication", /<(Application|AppVersion)>([\s\S]*?)<\/\1>/g],
    ["appCompany", /<(Company|Manager)>([\s\S]*?)<\/\1>/g],
    ["appTemplate", /<Template>([\s\S]*?)<\/Template>/g],
    ["appTotalTime", /<TotalTime>([\s\S]*?)<\/TotalTime>/g],
    ["appOther", /<(Pages|Words|Characters|CharactersWithSpaces|Lines|Paragraphs|Slides|Notes|HiddenSlides|MMClips|HyperlinkBase|DocSecurity|ScaleCrop|LinksUpToDate|SharedDoc|HyperlinksChanged|TitlesOfParts|HeadingPairs|PresentationFormat)\b[^>]*>([\s\S]*?)<\/\1>/g],
  ];

  function fieldEntries(xml, fields, marker) {
    const out = [];
    for (const [label, re] of fields) {
      let bytes = 0;
      let hit = false;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(xml))) {
        const value = (m[m.length - 1] || "").trim();
        if (!value) continue;
        hit = true;
        bytes += value.length;
      }
      if (hit) out.push({ label: label, marker: marker, bytes: bytes });
    }
    return out;
  }

  const OOXML_MEDIA = /^(word|xl|ppt)\/media\//;
  const OOXML_COMMENTS = /^(word\/comments(Extended|Ids|Extensible)?\.xml|xl\/comments\d*\.xml|xl\/threadedComments\/|ppt\/comments\/)/;
  const OOXML_NOTES = /^ppt\/notesSlides\/notesSlide\d+\.xml$/;
  const OOXML_THUMB = /^docProps\/thumbnail\.[A-Za-z0-9]+$/;
  const OOXML_CHANGES = /<w:(ins|del|moveFrom|moveTo|rPrChange|pPrChange|tblPrChange|sectPrChange)\b/g;

  async function stripOoxml(bytes) {
    if (typeof DecompressionStream === "undefined" || typeof CompressionStream === "undefined") {
      return { ok: false, reason: "noStreams" };
    }
    const zip = parseZip(bytes);
    if (zip.error) return { ok: false, reason: zip.error };
    if (!zip.entries.some((entry) => entry.name === "[Content_Types].xml")) {
      return { ok: false, reason: "notOoxml" };
    }

    const removed = [];
    const notes = [];
    const out = [];
    let zipTimeBytes = 0;
    let mediaBytes = 0;
    let mediaFiles = 0;
    const dropThumb = zip.entries.some((entry) => OOXML_THUMB.test(entry.name));
    const note = (label, detail) => {
      if (!notes.some((item) => item.label === label)) notes.push({ label: label, detail: detail || "" });
    };

    for (const entry of zip.entries) {
      if (entry.time !== 0 || (entry.date !== 0 && entry.date !== ZIP_EPOCH_DATE) || entry.extraLen) {
        zipTimeBytes += 4 + entry.extraLen;
      }
      let replacement = null;
      if (entry.name === "docProps/core.xml") {
        removed.push(...fieldEntries(utf8Decode(await entryContent(entry)), CORE_FIELDS, "core.xml"));
        replacement = utf8Encode(OOXML_EMPTY.core);
      } else if (entry.name === "docProps/app.xml") {
        removed.push(...fieldEntries(utf8Decode(await entryContent(entry)), APP_FIELDS, "app.xml"));
        replacement = utf8Encode(OOXML_EMPTY.app);
      } else if (entry.name === "docProps/custom.xml") {
        const count = (utf8Decode(await entryContent(entry)).match(/<property\b/g) || []).length;
        if (count) removed.push({ label: "customProps", marker: "custom.xml", bytes: count });
        replacement = utf8Encode(OOXML_EMPTY.custom);
      } else if (OOXML_THUMB.test(entry.name)) {
        removed.push({ label: "thumbnail", marker: entry.name.slice(9), bytes: entry.usize });
        continue;
      } else if (dropThumb && entry.name === "_rels/.rels") {
        const xml = utf8Decode(await entryContent(entry));
        replacement = utf8Encode(
          xml.replace(/<Relationship\b[^>]*\/metadata\/thumbnail"[^>]*\/>\s*/g, "")
        );
      } else if (dropThumb && entry.name === "[Content_Types].xml") {
        const xml = utf8Decode(await entryContent(entry));
        replacement = utf8Encode(
          xml.replace(/<Override\b[^>]*PartName="\/docProps\/thumbnail\.[^"]*"[^>]*\/>\s*/g, "")
        );
      } else if (OOXML_MEDIA.test(entry.name)) {
        const content = await entryContent(entry);
        const kind = detect(content);
        if (kind === "jpeg" || kind === "png" || kind === "webp" || kind === "gif") {
          const inner = strip(content);
          if (inner.ok && inner.removed.length) {
            replacement = inner.data;
            mediaFiles += 1;
            for (const item of inner.removed) mediaBytes += item.bytes;
          }
        }
      } else if (OOXML_COMMENTS.test(entry.name)) {
        note("comments");
      } else if (OOXML_NOTES.test(entry.name)) {
        note("speakerNotes");
      } else if (entry.name === "word/document.xml") {
        const changes = (utf8Decode(await entryContent(entry)).match(OOXML_CHANGES) || []).length;
        if (changes) note("trackedChanges", String(changes));
      }

      if (replacement) {
        const data = await deflateRaw(replacement);
        out.push({
          name: entry.name, method: 8, flags: entry.flags, crc: crc32(replacement),
          csize: data.length, usize: replacement.length, data: data,
          madeBy: entry.madeBy, needed: entry.needed, internal: entry.internal, external: entry.external,
        });
      } else {
        out.push(entry);
      }
    }
    if (zipTimeBytes) removed.push({ label: "zipTime", marker: "zip", bytes: zipTimeBytes });
    if (zip.commentLen) removed.push({ label: "zipComment", marker: "zip", bytes: zip.commentLen });
    if (mediaFiles) removed.push({ label: "mediaMeta", marker: "media", bytes: mediaBytes });
    return { ok: true, data: buildZip(out), removed: removed, kept: [], notes: notes };
  }

  // 清完的 zip 要能整份讀回來：每個部件解開之後長度與 CRC 都要對得上。
  // 這是 Office 文件的驗證步驤，圖片與影片用瀏覽器實際載入，zip 沒有那種東西可用。
  async function verifyZip(bytes) {
    const zip = parseZip(bytes);
    if (zip.error) return false;
    for (const entry of zip.entries) {
      try {
        const content = await entryContent(entry);
        if (content.length !== entry.usize || crc32(content) !== entry.crc) return false;
      } catch (err) {
        return false;
      }
    }
    return true;
  }

  // 輸出的 MIME 從副檔名決定，三種 Office 文件的 zip 內容看起來都一樣
  const OOXML_TYPES = {
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  function ooxmlType(name) {
    const at = String(name || "").lastIndexOf(".");
    const ext = at >= 0 ? name.slice(at).toLowerCase() : "";
    return OOXML_TYPES[ext] || "application/zip";
  }

  // --- PDF ---
  //
  // PDF 跟前面幾種格式不一樣，不能直接把某一段剪掉。每個物件在交叉索引表裡都記著
  // 自己在檔案裡的位元組位置，拿掉一段之後後面全部位移，整張表要重算。PDF 1.5
  // 之後常見的物件流還會把好幾個物件壓進同一段壓縮資料，從外面根本看不到內容。
  //
  // 所以這裡交給 pdf-lib（vendor/pdf-lib.min.js，MIT）。它負責解析與重寫，這一段
  // 只決定拿掉哪些欄位。
  const PDF_FIELDS = [
    ["Title", "setTitle", "getTitle"],
    ["Author", "setAuthor", "getAuthor"],
    ["Subject", "setSubject", "getSubject"],
    ["Creator", "setCreator", "getCreator"],
    ["Producer", "setProducer", "getProducer"],
  ];

  // pdf-lib 有五百多 KB，是這一頁最大的一塊。放在頁面裡用 script 標籤載，等於每個
  // 打開這一頁的人都要先等它下載完，而六種格式裡只有 PDF 需要它。改成真的遇到
  // PDF 才去拿。
  //
  // 離線副本仍然包含它：那個檔案列在這一頁 frontmatter 的 offline_assets 裡，
  // 讀者存下這一頁的時候會一起存，斷網時這裡取到的是 service worker 的快取。
  let pdfLibLoading = null;

  function pdfLib() {
    return typeof window !== "undefined" ? window.PDFLib : null;
  }

  function loadPdfLib() {
    if (pdfLib()) return Promise.resolve(pdfLib());
    if (!pdfLibLoading) {
      pdfLibLoading = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = new URL("../vendor/pdf-lib.min.js", location.href).href;
        script.onload = () => resolve(pdfLib());
        script.onerror = () => {
          // 失敗就讓下一次重試，不要卡在一個永遠不會完成的 promise 上
          pdfLibLoading = null;
          resolve(null);
        };
        document.head.appendChild(script);
      });
    }
    return pdfLibLoading;
  }

  async function stripPdf(bytes) {
    const lib = await loadPdfLib();
    if (!lib) return { ok: false, reason: "pdfLibMissing" };
    let doc;
    try {
      doc = await lib.PDFDocument.load(bytes, {
        updateMetadata: false,
        ignoreEncryption: true,
      });
    } catch (err) {
      return { ok: false, reason: "broken" };
    }
    if (doc.isEncrypted) return { ok: false, reason: "encrypted" };

    const removed = [];
    for (const [label, setter, getter] of PDF_FIELDS) {
      try {
        const value = doc[getter] ? doc[getter]() : null;
        if (value) removed.push({ label: "pdf" + label, marker: label, bytes: String(value).length });
        doc[setter]("");
      } catch (err) {
        // 有些欄位型別怪異，讀不到就跳過，不要讓整份檔案處理不了
      }
    }
    try {
      if (doc.getKeywords && doc.getKeywords()) {
        removed.push({ label: "pdfKeywords", marker: "Keywords", bytes: 0 });
      }
      doc.setKeywords([]);
    } catch (err) { /* 同上 */ }

    const epoch = new Date(0);
    try {
      if (doc.getCreationDate()) removed.push({ label: "pdfDates", marker: "CreationDate", bytes: 0 });
      doc.setCreationDate(epoch);
      doc.setModificationDate(epoch);
    } catch (err) { /* 同上 */ }

    // XMP 是另一個地方。pdf-lib 的那幾個 setter 只動 Info，這一段要自己拆。
    //
    // 而且光把引用拿掉不夠：pdf-lib 儲存時會寫出所有註冊過的物件，那段 XMP 照樣
    // 留在檔案裡，只是沒有人指向它。實測過這個狀況，內容一字不差還在。要從
    // context 刪掉才算真的清除。
    const META = lib.PDFName.of("Metadata");
    const dropMeta = (holder) => {
      const ref = holder.get(META);
      if (!ref) return false;
      holder.delete(META);
      if (ref instanceof lib.PDFRef) doc.context.delete(ref);
      return true;
    };
    if (dropMeta(doc.catalog)) {
      removed.push({ label: "pdfXmp", marker: "XMP", bytes: 0 });
    }
    let pageMeta = 0;
    for (const page of doc.getPages()) {
      if (dropMeta(page.node)) pageMeta += 1;
    }
    if (pageMeta) {
      removed.push({ label: "pdfXmpPage", marker: "XMP", bytes: pageMeta });
    }

    let data;
    try {
      // 不用物件流。壓成流之後讀者拿文字搜尋工具自己核對就看不到東西了，
      // 而這一頁的立場是讓人驗得動。
      data = await doc.save({ useObjectStreams: false });
    } catch (err) {
      return { ok: false, reason: "broken" };
    }

    // 這一頁動不到的地方要說出來，不能讓讀者以為整份檔案都乾淨了
    const notes = [];
    if (doc.getPages().length) {
      const hints = [];
      for (const page of doc.getPages()) {
        const annots = page.node.get(lib.PDFName.of("Annots"));
        if (annots) { hints.push("annots"); break; }
      }
      const names = doc.catalog.get(lib.PDFName.of("Names"));
      if (names) hints.push("names");
      if (hints.length) notes.push({ label: "pdfLeftovers", detail: "" });
    }

    return { ok: true, data: data, removed: removed, kept: [], notes: notes };
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
    if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 &&
        bytes[3] === 0x46 && bytes[4] === 0x2d) return "pdf";
    if (bytes.length >= 12 && asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 4) === "WAVE") return "wav";
    if (id3v2Size(bytes, 0) || isMp3Frame(bytes, 0)) return "mp3";
    // zip 開頭。有 [Content_Types].xml 的才是 Office 文件，其餘的壓縮檔不處理。
    if (bytes.length >= 4 && readUint32LE(bytes, 0) === ZIP_LOCAL) {
      const zip = parseZip(bytes);
      if (zip.entries && zip.entries.some((entry) => entry.name === "[Content_Types].xml")) return "ooxml";
      return "zip";
    }
    return "unknown";
  }

  // PDF 的處理是非同步的（pdf-lib 的 API 如此），所以不走這一支。
  // 這一支保持同步，tools/test_stripmeta.mjs 原地抽出來測的就是它。
  function isSupported(kind) {
    for (const item of SUPPORTED) {
      if (item.kind === kind) return true;
    }
    return false;
  }

  function strip(bytes) {
    const kind = detect(bytes);
    if (kind === "jpeg") return Object.assign({ kind: kind }, stripJpeg(bytes));
    if (kind === "png") return Object.assign({ kind: kind }, stripPng(bytes));
    if (kind === "mp4") return Object.assign({ kind: kind }, stripMp4(bytes));
    if (kind === "webp") return Object.assign({ kind: kind }, stripWebp(bytes));
    if (kind === "gif") return Object.assign({ kind: kind }, stripGif(bytes));
    if (kind === "mp3") return Object.assign({ kind: kind }, stripMp3(bytes));
    if (kind === "wav") return Object.assign({ kind: kind }, stripWav(bytes));
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
    #stripmeta-tool .sm-loading {
      font-size: .78rem; line-height: 1.8; margin: .8rem 0 0;
      border-left: .15rem solid var(--md-primary-fg-color); padding-left: .6rem;
    }
    #stripmeta-tool .sm-formats {
      font-size: .72rem; opacity: .8; line-height: 2; margin: .6rem 0 0;
    }
    #stripmeta-tool .sm-note { font-size: .7rem; opacity: .75; line-height: 1.7; margin: .8rem 0 0; }
    @media (pointer: coarse) { #stripmeta-tool button, #stripmeta-tool a.sm-dl { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把圖片、影片、錄音或 Office 文件拖進來，或點一下選檔案。可以一次選多個，也可以直接貼上（Ctrl+V）。",
      dropOver: "放開就開始清",
      working: "處理中",
      clear: "清掉列表",
      download: "下載清乾淨的",
      removed: "拿掉了",
      kept: "留著沒動",
      sizeLine: "原始 {a}，清完 {b}",
      labels: {
        pdfTitle: "文件標題",
        pdfAuthor: "作者",
        pdfSubject: "主旨",
        pdfCreator: "製作這份文件的軟體，常含作業系統與版本",
        pdfProducer: "轉存成 PDF 的軟體",
        pdfKeywords: "關鍵字",
        pdfDates: "建立與修改時間",
        pdfXmp: "XMP 描述區：地點、作者、編輯歷史都可能記在這裡",
        pdfXmpPage: "分頁各自的 XMP 描述區",
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
        coreCreator: "作者：建立文件的帳號名稱",
        coreModifiedBy: "最後修改者",
        coreDates: "建立、修改與最後列印的時間",
        coreTitle: "標題、主旨、說明、關鍵字、分類",
        coreRevision: "修訂次數：這份文件被存過幾次",
        appApplication: "製作軟體與版本",
        appCompany: "公司與主管",
        appTemplate: "範本名稱：常帶著公司或個人的範本檔名",
        appTotalTime: "總編輯時間",
        appOther: "統計欄位：頁數、字數、投影片數等",
        customProps: "自訂屬性：組織自己加的欄位，例如文件編號或承辦人",
        thumbnail: "文件縮圖：第一頁的預覽圖，內容改過之後它可能還是舊的",
        zipTime: "壓縮檔內每個部件的時間戳記與額外欄位",
        zipComment: "壓縮檔註解",
        mediaMeta: "夾在文件裡的圖片的 EXIF 與描述欄位，走跟照片一樣的流程",
        id3v2: "ID3v2 標籤：標題、演出者、專輯、註解、封面圖、編碼軟體",
        id3v1: "ID3v1 標籤：檔尾固定 128 位元組的標題、演出者、年份、註解",
        ape: "APE 標籤",
        wavInfo: "INFO 清單：演出者、軟體、日期、註解",
        bext: "廣播波形描述：製作者、製作日期與時間、編碼歷程",
        ixml: "iXML 製作資訊：場記、錄音機型號、時間碼",
        wavXmp: "XMP 描述區",
        wavId3: "ID3 標籤",
      },
      notes: {
        comments: "文件裡還有留言，每一則都帶著作者名稱與時間。這一頁不動內文，要清掉請在編輯軟體裡刪除所有留言後再存一次，再清一遍。",
        trackedChanges: "文件裡還有追蹤修訂，每一筆都帶著修改者與時間。全部接受或拒絕之後再存一次，再清一遍。",
        speakerNotes: "投影片帶著演講者備忘稿，那是內容的一部分，這一頁不動它，分享前自己看過。",
        pdfLeftovers: "這份 PDF 裡還有註解或附件之類的東西，那些可能各自帶著作者與時間。這一頁只處理文件層級的描述欄位，沒有動它們。",
        encoderInData: "壓縮資料本身還帶著編碼器的版本字串，那一段屬於影音資料本身，不算 metadata。要清掉只能重新編碼，而重新編碼會損失畫質，也會換上新編碼器的痕跡。這一頁不做那件事。",
      },
      pdf: "這是 PDF。文件層級的描述欄位與 XMP 描述區會被拿掉，頁面內容不會重新排版。",
      mp4: "這是 MP4、MOV 或 M4A，處理的是容器裡的描述欄位。壓縮過的影音資料一個位元都不會動。",
      ooxml: "這是 Office 文件。處理的是文件屬性、部件的時間戳記與夾帶圖片的 metadata，內文一個字都不會動。",
      audio: "這是音訊檔，處理的是檔頭與檔尾的標籤區。聲音資料一個位元都不會動。",
      nothing: "這個檔案裡沒有找到可以拿掉的欄位，本來就是乾淨的。",
      errors: {
        noStreams: "這個瀏覽器沒有內建的解壓縮功能，處理 Office 文件需要它。換一個較新的瀏覽器再試。",
        zip64: "這份文件用了 ZIP64 格式，頁面還做不到。",
        zip: "這是一般的壓縮檔，不是 Office 文件。ODT、ODS 這類 OpenDocument 格式目前也不支援。",
        notOoxml: "這是一般的壓縮檔，不是 Office 文件。ODT、ODS 這類 OpenDocument 格式目前也不支援。",
        pdfLibMissing: "處理 PDF 需要的函式庫還沒載入完，稍等一下再試一次。",
        encrypted: "這份 PDF 有加密保護，要先解除才能處理。",
        heic: "這是 HEIC/HEIF。iPhone 預設拍出來就是這個格式，它的容器結構複雜得多，這一頁還做不到。在 iPhone 上可以到「設定 → 相機 → 格式」選「最相容」，之後拍的就是 JPEG。已經拍好的可以用 AirDrop 或郵件傳給自己，那個過程多半會轉成 JPEG。",
        unsupported: "認不出這個格式，或者工具還不處理它。支援的格式列在下面。",
        notImage: "這不是圖片檔。",
        broken: "這個檔案的結構讀不下去，可能已經損壞，或是副檔名跟實際格式對不上。",
        verify: "清完的檔案解不開，那是工具的問題。原始檔沒有被動到，請不要用清完的那一份，並且回報這個狀況。",
      },
      supports: "支援的格式：",
      loadingLib: "第一次處理 PDF 要先把解析用的程式抓回來，大約半 MB，抓完就會留在裝置上。",
      note: "檔案在你的瀏覽器裡改，沒有上傳到任何地方。斷網時照樣可以用。清完的是新的一份，原始檔不會被動到。",
    },
    zh: {
      drop: "把图片、视频、录音或 Office 文档拖进来，或点一下选文件。可以一次选多个，也可以直接粘贴（Ctrl+V）。",
      dropOver: "放开就开始清",
      working: "处理中",
      clear: "清掉列表",
      download: "下载清干净的",
      removed: "拿掉了",
      kept: "留着没动",
      sizeLine: "原始 {a}，清完 {b}",
      labels: {
        pdfTitle: "文档标题",
        pdfAuthor: "作者",
        pdfSubject: "主题",
        pdfCreator: "制作这份文档的软件，常含操作系统与版本",
        pdfProducer: "转存成 PDF 的软件",
        pdfKeywords: "关键词",
        pdfDates: "创建与修改时间",
        pdfXmp: "XMP 描述区：地点、作者、编辑历史都可能记在这里",
        pdfXmpPage: "分页各自的 XMP 描述区",
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
        coreCreator: "作者：创建文档的账号名称",
        coreModifiedBy: "最后修改者",
        coreDates: "创建、修改与最后打印的时间",
        coreTitle: "标题、主题、说明、关键字、分类",
        coreRevision: "修订次数：这份文档被保存过几次",
        appApplication: "制作软件与版本",
        appCompany: "公司与主管",
        appTemplate: "模板名称：常带着公司或个人的模板文件名",
        appTotalTime: "总编辑时间",
        appOther: "统计字段：页数、字数、幻灯片数等",
        customProps: "自定义属性：组织自己加的字段，例如文档编号或承办人",
        thumbnail: "文档缩略图：第一页的预览图，内容改过之后它可能还是旧的",
        zipTime: "压缩文件内每个部件的时间戳与额外字段",
        zipComment: "压缩文件注释",
        mediaMeta: "夹在文档里的图片的 EXIF 与描述字段，走跟照片一样的流程",
        id3v2: "ID3v2 标签：标题、演出者、专辑、注释、封面图、编码软件",
        id3v1: "ID3v1 标签：文件尾固定 128 字节的标题、演出者、年份、注释",
        ape: "APE 标签",
        wavInfo: "INFO 列表：演出者、软件、日期、注释",
        bext: "广播波形描述：制作者、制作日期与时间、编码历程",
        ixml: "iXML 制作信息：场记、录音机型号、时间码",
        wavXmp: "XMP 描述区",
        wavId3: "ID3 标签",
      },
      notes: {
        comments: "文档里还有批注，每一则都带着作者名称与时间。这一页不动正文，要清掉请在编辑软件里删除所有批注后再保存一次，再清一遍。",
        trackedChanges: "文档里还有修订记录，每一笔都带着修改者与时间。全部接受或拒绝之后再保存一次，再清一遍。",
        speakerNotes: "幻灯片带着演讲者备注，那是内容的一部分，这一页不动它，分享前自己看过。",
        pdfLeftovers: "这份 PDF 里还有注释或附件之类的东西，那些可能各自带着作者与时间。这一页只处理文档层级的描述字段，没有动它们。",
        encoderInData: "压缩数据本身还带着编码器的版本字符串，那一段属于音视频数据本身，不算 metadata。要清掉只能重新编码，而重新编码会损失画质，也会换上新编码器的痕迹。这一页不做那件事。",
      },
      pdf: "这是 PDF。文档层级的描述字段与 XMP 描述区会被拿掉，页面内容不会重新排版。",
      mp4: "这是 MP4、MOV 或 M4A，处理的是容器里的描述字段。压缩过的影音数据一个比特都不会动。",
      ooxml: "这是 Office 文档。处理的是文档属性、部件的时间戳与夹带图片的 metadata，正文一个字都不会动。",
      audio: "这是音频文件，处理的是文件头与文件尾的标签区。声音数据一个比特都不会动。",
      nothing: "这个文件里没有找到可以拿掉的字段，本来就是干净的。",
      errors: {
        noStreams: "这个浏览器没有内置的解压缩功能，处理 Office 文档需要它。换一个较新的浏览器再试。",
        zip64: "这份文档用了 ZIP64 格式，页面还做不到。",
        zip: "这是一般的压缩文件，不是 Office 文档。ODT、ODS 这类 OpenDocument 格式目前也不支持。",
        notOoxml: "这是一般的压缩文件，不是 Office 文档。ODT、ODS 这类 OpenDocument 格式目前也不支持。",
        pdfLibMissing: "处理 PDF 需要的函式库还没加载完，稍等一下再试一次。",
        encrypted: "这份 PDF 有加密保护，要先解除才能处理。",
        heic: "这是 HEIC/HEIF。iPhone 默认拍出来就是这个格式，它的容器结构复杂得多，这一页还做不到。在 iPhone 上可以到「设置 → 相机 → 格式」选「最兼容」，之后拍的就是 JPEG。已经拍好的可以用 AirDrop 或邮件传给自己，那个过程多半会转成 JPEG。",
        unsupported: "认不出这个格式，或者工具还不处理它。支持的格式列在下面。",
        notImage: "这不是图片文件。",
        broken: "这个文件的结构读不下去，可能已经损坏，或是扩展名跟实际格式对不上。",
        verify: "清完的文件解不开，那是工具的问题。原始文件没有被动到，请不要用清完的那一份，并且回报这个状况。",
      },
      supports: "支持的格式：",
      loadingLib: "第一次处理 PDF 要先把解析用的程序抓回来，大约半 MB，抓完就会留在设备上。",
      note: "文件在你的浏览器里改，没有上传到任何地方。断网时照样可以用。清完的是新的一份，原始文件不会被动到。",
    },
    en: {
      drop: "Drop images, videos, recordings or Office documents here, or click to choose files. Several at once is fine, and pasting works too (Ctrl+V).",
      dropOver: "Release to start",
      working: "Working",
      clear: "Clear the list",
      download: "Download the cleaned file",
      removed: "Removed",
      kept: "Kept as is",
      sizeLine: "{a} originally, {b} after cleaning",
      labels: {
        pdfTitle: "Document title",
        pdfAuthor: "Author",
        pdfSubject: "Subject",
        pdfCreator: "The software that produced the document, often including the operating system and version",
        pdfProducer: "The software that exported it to PDF",
        pdfKeywords: "Keywords",
        pdfDates: "Creation and modification times",
        pdfXmp: "The XMP block: location, author and editing history can all be recorded here",
        pdfXmpPage: "Per-page XMP blocks",
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
        coreCreator: "Author: the account name that created the document",
        coreModifiedBy: "Last modified by",
        coreDates: "Created, modified and last printed times",
        coreTitle: "Title, subject, description, keywords, category",
        coreRevision: "Revision count: how many times the document was saved",
        appApplication: "Authoring application and version",
        appCompany: "Company and manager",
        appTemplate: "Template name, often the file name of a company or personal template",
        appTotalTime: "Total editing time",
        appOther: "Statistics: pages, words, slides and the like",
        customProps: "Custom properties: fields an organisation adds itself, such as a file number or case officer",
        thumbnail: "Document thumbnail: a preview of the first page, possibly stale after edits",
        zipTime: "Per-part timestamps and extra fields inside the zip container",
        zipComment: "Zip archive comment",
        mediaMeta: "EXIF and descriptive fields of the images embedded in the document, handled like photos",
        id3v2: "ID3v2 tag: title, artist, album, comment, cover art, encoding software",
        id3v1: "ID3v1 tag: the fixed 128 bytes at the end with title, artist, year, comment",
        ape: "APE tag",
        wavInfo: "INFO list: artist, software, date, comment",
        bext: "Broadcast wave description: originator, date and time, coding history",
        ixml: "iXML production data: scene notes, recorder model, timecode",
        wavXmp: "XMP block",
        wavId3: "ID3 tag",
      },
      notes: {
        comments: "The document still contains comments, each with an author name and time. This page does not touch the body. Delete all comments in your editor, save again, and run it through once more.",
        trackedChanges: "The document still contains tracked changes, each with an author and time. Accept or reject them all, save again, and run it through once more.",
        speakerNotes: "The slides carry speaker notes. They are part of the content and this page leaves them alone. Read through them before sharing.",
        pdfLeftovers: "This PDF also contains annotations or attachments, which can carry their own authors and timestamps. This page only handles document-level descriptive fields and leaves those alone.",
        encoderInData: "The compressed data itself still carries the encoder's version string. That is not metadata; it is part of the audio and video data. Removing it means re-encoding, which costs quality and substitutes a new encoder's traces for the old ones. This page does not do that.",
      },
      pdf: "This is a PDF. Document-level descriptive fields and the XMP block come out. The page content is not re-laid out.",
      mp4: "This is an MP4, MOV or M4A. What gets handled is the descriptive fields in the container. Not one byte of the compressed audio or video is touched.",
      ooxml: "This is an Office document. What gets handled is the document properties, the per-part timestamps and the metadata of embedded images. Not one character of the body is touched.",
      audio: "This is an audio file. What gets handled is the tag blocks at the start and end. Not one byte of the sound data is touched.",
      nothing: "No removable fields were found in this file. It was already clean.",
      errors: {
        noStreams: "This browser has no built-in decompression support, which Office documents need. Try a newer browser.",
        zip64: "This document uses the ZIP64 format, which the page cannot handle yet.",
        zip: "This is an ordinary zip archive, not an Office document. OpenDocument formats such as ODT and ODS are not supported yet either.",
        notOoxml: "This is an ordinary zip archive, not an Office document. OpenDocument formats such as ODT and ODS are not supported yet either.",
        pdfLibMissing: "The library needed for PDFs has not finished loading. Wait a moment and try again.",
        encrypted: "This PDF is encrypted. Remove the protection before processing it.",
        heic: "This is HEIC/HEIF. It is what an iPhone shoots by default, and its container is considerably more involved than this page handles. On an iPhone, Settings → Camera → Formats → Most Compatible switches future photos to JPEG. For photos already taken, sending them to yourself over AirDrop or email usually converts them.",
        unsupported: "The format was not recognised, or this page does not handle it yet. The supported formats are listed below.",
        notImage: "That is not an image file.",
        broken: "The structure of this file could not be read. It may be damaged, or the extension may not match the actual format.",
        verify: "The cleaned file will not open. That is a fault in this page. Your original was not touched. Please do not use the cleaned copy, and report this.",
      },
      supports: "Handles:",
      loadingLib: "Handling a PDF for the first time fetches the parsing library, about half a megabyte. It stays on your device afterwards.",
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
  // 第一次遇到 PDF 要先把函式庫抓回來，那段時間畫面要說一聲
  let loadingLib = false;

  // 正在處理第幾個檔案。移除中繼資料要把整個檔案讀進來、重編一次、再解一次驗證，
  // 大一點的圖或影片在手機上是好幾秒，而畫面原本從按下到全部做完都不會動，讀者
  // 只能猜是不是當掉了。t.working 這個字串本來就在，之前沒有人用上。
  let working = null;

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

  const IMAGE_KINDS = ["jpeg", "png", "webp", "gif"];

  function renderFile(item) {
    const row = el("div", "sm-file " + (item.ok ? "sm-file--ok" : "sm-file--bad"));
    if (item.url && item.ok && IMAGE_KINDS.indexOf(item.kind) >= 0) {
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
    if (item.kind === "mp4" && item.audio) body.appendChild(el("p", "sm-size", t.audio));
    else if (item.kind === "mp4") body.appendChild(el("p", "sm-size", t.mp4));
    if (item.kind === "mp3" || item.kind === "wav") body.appendChild(el("p", "sm-size", t.audio));
    if (item.kind === "ooxml") body.appendChild(el("p", "sm-size", t.ooxml));
    if (item.kind === "pdf") body.appendChild(el("p", "sm-size", t.pdf));

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
    picker.accept = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,application/pdf,.docx,.xlsx,.pptx,.m4a";
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

    // 讀者選檔案之前就該知道這一頁吃什麼。清單從 SUPPORTED 讀，不另外寫一份。
    const formats = el("p", "sm-formats");
    formats.appendChild(document.createTextNode(t.supports + "　"));
    for (let i = 0; i < SUPPORTED.length; i += 1) {
      if (i) formats.appendChild(document.createTextNode("　"));
      formats.appendChild(el("code", "sm-tag", SUPPORTED[i].ext));
    }
    root.appendChild(formats);

    if (loadingLib) root.appendChild(el("p", "sm-loading", t.loadingLib));
    if (working) {
      const line = el("p", "sm-loading");
      // 轉圈用全站共用的那顆，樣式定義在 overrides/base.html
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      line.appendChild(spin);
      line.appendChild(document.createTextNode(
        working.total > 1
          ? t.working + "　" + working.done + " / " + working.total + "　" + working.name
          : t.working + "　" + working.name
      ));
      // 轉圈對讀螢幕的人沒有意義。aria-busy 說「這一塊還在做事」，aria-live 讓
      // 換到下一個檔案的時候把檔名唸出來，兩件事各自要一個屬性。
      line.setAttribute("aria-busy", "true");
      line.setAttribute("aria-live", "polite");
      root.appendChild(line);
    }
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
      if (kind === "pdf") {
        // PDF 沒辦法丟給 img 或 video，改成用同一個函式庫重新讀一次。
        // 結構被改壞的話這一步會丟例外。走到這裡函式庫一定已經載好了，
        // 因為前一步就是用它處理的。
        const lib = pdfLib();
        if (!lib) return resolve(url);
        blob.arrayBuffer()
          .then((buf) => lib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true }))
          .then((doc) => (doc.getPageCount() > 0 ? resolve(url) : fail()))
          .catch(fail);
        return;
      }
      if (kind === "ooxml") {
        // zip 沒有東西可以「載入」，改成整份讀回來，每個部件的長度與 CRC 都要對
        blob.arrayBuffer()
          .then((buf) => verifyZip(new Uint8Array(buf)))
          .then((ok) => (ok ? resolve(url) : fail()))
          .catch(fail);
        return;
      }
      if (kind === "mp3" || kind === "wav" || (kind === "mp4" && blob.type.indexOf("audio/") === 0)) {
        const audio = document.createElement("audio");
        audio.preload = "metadata";
        audio.onloadedmetadata = () => {
          const seconds = audio.duration;
          if (!seconds || !isFinite(seconds)) return fail();
          resolve(url);
        };
        audio.onerror = fail;
        audio.src = url;
        return;
      }
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
    const kind = detect(bytes);
    let result;
    if (kind === "pdf") result = Object.assign({ kind: kind }, await stripPdf(bytes));
    else if (kind === "ooxml") result = Object.assign({ kind: kind }, await stripOoxml(bytes));
    else result = strip(bytes);
    if (!result.ok) {
      // 送出格式代號，讓「該不該支援 HEIC」這種決定有依據可看。detect() 本來就分得出
      // heic，只是不支援，那個資訊過去直接被丟掉。認不出來的送 unknown。
      //
      // 只有代號，沒有檔名也沒有內容。揭露見 utils/leaks 的「我們送出的裝置與使用
      // 資訊」一節。
      if (result.reason === "unsupported" && window.anoniTrack) {
        window.anoniTrack("stripmeta-unsupported", { kind: result.kind || "unknown" });
      }
      return {
        ok: false, name: file.name,
        reason: result.kind && result.kind !== "unknown" && t.errors[result.kind]
          ? result.kind : result.reason,
      };
    }
    const TYPES = {
      png: "image/png", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif",
      mp4: "video/mp4", mp3: "audio/mpeg", wav: "audio/wav", pdf: "application/pdf",
    };
    // M4A 跟 MP4 是同一種容器，靠原檔的 MIME 分辨要用 audio 還是 video 元素驗
    const isAudioMp4 = result.kind === "mp4" && file.type.indexOf("audio/") === 0;
    const mime = result.kind === "ooxml" ? ooxmlType(file.name)
      : isAudioMp4 ? "audio/mp4" : TYPES[result.kind] || "application/octet-stream";
    const blob = new Blob([result.data], { type: mime });
    const url = await verify(blob, result.kind);
    if (!url) {
      // 清完的檔案打不開就是這一頁的 bug。預期量極低，每一筆都值得看，等於一個
      // 沒有摩擦的回報管道。
      if (window.anoniTrack) window.anoniTrack("stripmeta-verify-fail", { kind: result.kind });
      return { ok: false, name: file.name, reason: "verify" };
    }
    // 成功也要數。原本只送 stripmeta-unsupported 與 stripmeta-verify-fail，沒有分母，
    // 失敗次數就算不出失敗率，看到「這個月 30 筆 unsupported」也不知道那是多還是少。
    // 這一行原本重複了三次，同一個檔案被數成三筆。
    if (window.anoniTrack) window.anoniTrack("stripmeta-ok", { kind: result.kind });
    return {
      ok: true, name: file.name, cleanName: cleanName(file.name), audio: isAudioMp4,
      originalSize: bytes.length, cleanSize: result.data.length,
      kind: result.kind,
      removed: result.removed, kept: result.kept, notes: result.notes || [], url: url,
    };
  }

  async function handle(list) {
    if (!list || !list.length) return;
    release();
    // 第一次遇到 PDF 要先把函式庫抓回來，那要一點時間。先讓畫面說一聲，
    // 不然讀者只會看到一個沒有反應的頁面。
    for (const file of list) {
      if (file.type === "application/pdf" && !pdfLib()) {
        loadingLib = true;
        render();
        // 交還主執行緒，讓那行字先畫出來
        await new Promise((next) => setTimeout(next, 0));
        break;
      }
    }
    let index = 0;
    for (const file of list) {
      const okType = !file.type || file.type.indexOf("image/") === 0 ||
        file.type.indexOf("video/") === 0 || file.type.indexOf("audio/") === 0 ||
        file.type === "application/pdf" || file.type === "application/zip" ||
        file.type === "application/octet-stream" ||
        file.type.indexOf("application/vnd.openxmlformats-officedocument") === 0;
      if (!okType) {
        files.push({ ok: false, name: file.name, reason: "notImage" });
        continue;
      }
      index += 1;
      // 先讓畫面說一聲再開始做。handleOne 從頭到尾不回到事件迴圈，不先畫出來的話
      // 讀者看到的是一個凍住的頁面，而多檔案時他連做到第幾個都不知道。
      working = { done: index, total: list.length, name: file.name };
      render();
      // 交還主執行緒，讓那一行先畫出來
      await new Promise((next) => setTimeout(next, 0));
      files.push(await handleOne(file));
    }
    working = null;
    loadingLib = false;
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
