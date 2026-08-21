#!/usr/bin/env node
/**
 * Metadata 清除器（docs/zh-TW/js/stripmeta.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具有兩種失敗方式，兩種都很糟：
 *
 * 一是漏清。讀者以為 GPS 已經拿掉了就把照片發出去，那比沒有這個工具更危險，
 * 因為它給了錯誤的安心感。所以每個測試都直接在輸出的位元組裡找敏感字串。
 *
 * 二是改壞。JPEG 的 metadata 與影像資料住在同一個檔案裡，切錯地方會讓圖打不開，
 * 或更糟，看起來能開但顏色跑掉。這裡的做法是造出帶 metadata 的真檔案，清完之後
 * 逐位元組比對 SOS 之後那一段，確認壓縮資料一個位元都沒動。
 *
 * 素材是測試自己組的，不放二進位檔進 repo。JPEG 的骨架用一段最小的合法檔案，
 * marker segment 照格式手工接上去。
 *
 * 用法：
 *   node tools/test_stripmeta.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'stripmeta.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`stripmeta.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  const JPEG_KEEP = \{[\s\S]*?\n  function cleanName\(name\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { strip, detect, cleanName, stripJpeg, stripPng, stripMp4, mp4Boxes, STRINGS, JPEG_KEEP, PNG_DROP, MP4_DROP };
`;
const tool = new Function(harness)();

// --- 造素材 ---

const u8 = (...parts) => {
  const flat = [];
  for (const p of parts) {
    if (typeof p === 'string') for (const ch of Buffer.from(p, 'latin1')) flat.push(ch);
    else for (const b of p) flat.push(b);
  }
  return new Uint8Array(flat);
};

const segment = (marker, payload) => {
  const body = typeof payload === 'string' ? Buffer.from(payload, 'latin1') : payload;
  return u8([0xff, marker, (body.length + 2) >> 8, (body.length + 2) & 0xff], body);
};

// 最小的合法 JPEG 骨架：SOI、量化表、frame header、霍夫曼表、SOS 加一小段資料、EOI
const JPEG_BODY = u8(
  segment(0xdb, u8([0x00], new Uint8Array(64).fill(0x10))),              // DQT
  segment(0xc0, [0x08, 0, 16, 0, 16, 1, 1, 0x11, 0]),                    // SOF0 16x16
  segment(0xc4, u8([0x00], new Uint8Array(16).fill(0), [0x00])),         // DHT
  [0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00],          // SOS
  [0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0x11, 0x22, 0x33],                      // 壓縮資料
  [0xff, 0xd9],                                                          // EOI
);

const makeJpeg = (segments) => u8([0xff, 0xd8], ...segments, JPEG_BODY);

const EXIF = segment(0xe1, 'Exif\x00\x00MM\x00*\x00\x00\x00\x08GPS:25.0330,121.5654 Make:SecretCam');
const ICC = segment(0xe2, 'ICC_PROFILE\x00\x01\x01sRGB IEC61966-2.1');
const ADOBE = segment(0xee, 'Adobe\x00d\x00\x00\x00\x00\x00');
const JFIF = segment(0xe0, 'JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00');
const COMMENT = segment(0xfe, 'internal draft do not share');
const IPTC = segment(0xed, 'Photoshop 3.0\x008BIM\x04\x04caption: source is Wang');
const XMP = segment(0xe1, 'http://ns.adobe.com/xap/1.0/\x00<x:xmpmeta>GPS 25.033</x:xmpmeta>');

const crc32 = (buf) => {
  let c, crc = 0xffffffff;
  for (const b of buf) {
    c = (crc ^ b) & 0xff;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, payload) => {
  const body = typeof payload === 'string' ? Buffer.from(payload, 'latin1') : Buffer.from(payload);
  const withType = Buffer.concat([Buffer.from(type, 'latin1'), body]);
  const len = body.length;
  const crc = crc32(withType);
  return u8([(len >>> 24) & 255, (len >>> 16) & 255, (len >>> 8) & 255, len & 255],
            withType, [(crc >>> 24) & 255, (crc >>> 16) & 255, (crc >>> 8) & 255, crc & 255]);
};

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const makePng = (extra) => u8(PNG_SIG,
  pngChunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]),
  ...extra,
  pngChunk('IDAT', [0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01]),
  pngChunk('IEND', []));

const asText = (bytes) => Buffer.from(bytes).toString('latin1');

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('JPEG 的 EXIF、GPS、相機型號都不見了', () => {
  const result = tool.strip(makeJpeg([EXIF]));
  assert.ok(result.ok, `清除失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['GPS:25.0330', 'SecretCam', 'Exif']) {
    assert.ok(!text.includes(needle), `${needle} 還留在輸出裡`);
  }
});

test('註解、IPTC、XMP 也一起清掉', () => {
  const result = tool.strip(makeJpeg([EXIF, XMP, IPTC, COMMENT]));
  assert.ok(result.ok);
  const text = asText(result.data);
  for (const needle of ['internal draft', 'source is Wang', 'xmpmeta', 'GPS 25.033']) {
    assert.ok(!text.includes(needle), `${needle} 還留在輸出裡`);
  }
  assert.equal(result.removed.length, 4, `應該拿掉四段，實際 ${result.removed.length} 段`);
});

test('影像資料一個位元都沒動，這是無損的關鍵', () => {
  // 重新編碼的工具做不到這件事，而且會留下自己的處理痕跡
  const original = makeJpeg([EXIF, ICC, COMMENT]);
  const result = tool.strip(original);
  const sosOf = (bytes) => {
    for (let i = 0; i < bytes.length - 1; i += 1) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xda) return bytes.subarray(i);
    }
    throw new Error('找不到 SOS');
  };
  assert.deepEqual(Array.from(sosOf(result.data)), Array.from(sosOf(original)),
                   'SOS 之後的壓縮資料被動到了');
});

test('色彩相關的段落留著，拿掉會讓圖變樣', () => {
  const result = tool.strip(makeJpeg([JFIF, EXIF, ICC, ADOBE]));
  assert.ok(result.ok);
  const text = asText(result.data);
  assert.ok(text.includes('ICC_PROFILE'), 'ICC 色彩描述檔被拿掉了，顏色會跑掉');
  assert.ok(text.includes('Adobe'), 'Adobe 標記被拿掉了，CMYK 的顏色會反過來');
  assert.ok(text.includes('JFIF'), 'JFIF 被拿掉了');
  const kept = result.kept.map((k) => k.label).sort();
  assert.deepEqual(kept, ['adobe', 'icc', 'jfif'], `kept 列的是 ${kept}`);
});

test('保留的段落也列出來，讀者要看得到留了什麼', () => {
  // 工具不替讀者決定這件事的細節，每一段的去留都要在畫面上
  const result = tool.strip(makeJpeg([JFIF, EXIF, ICC]));
  assert.ok(result.kept.length >= 2, '保留的段落沒有列出來');
  for (const entry of result.kept.concat(result.removed)) {
    assert.ok(entry.bytes > 0, '沒有記錄位元組數');
    assert.ok(entry.label, '沒有記錄是什麼');
  }
});

test('本來就乾淨的 JPEG 不會被改動', () => {
  const clean = makeJpeg([JFIF]);
  const result = tool.strip(clean);
  assert.ok(result.ok);
  assert.equal(result.removed.length, 0, '沒有東西可拿卻拿掉了什麼');
  assert.deepEqual(Array.from(result.data), Array.from(clean), '乾淨的檔案被動到了');
});

test('PNG 的文字欄位、時間與 eXIf 都清掉', () => {
  const png = makePng([
    pngChunk('tEXt', 'Author\x00Wang Ming'),
    pngChunk('iTXt', 'XML:com.adobe.xmp\x00\x00\x00\x00\x00<x:xmpmeta>GPS</x:xmpmeta>'),
    pngChunk('tIME', [0x07, 0xe8, 1, 1, 0, 0, 0]),
    pngChunk('eXIf', 'MM\x00*GPS:25.033'),
  ]);
  const result = tool.strip(png);
  assert.ok(result.ok, `清除失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['Wang Ming', 'xmpmeta', 'tEXt', 'iTXt', 'tIME', 'eXIf']) {
    assert.ok(!text.includes(needle), `${needle} 還留在輸出裡`);
  }
  assert.equal(result.removed.length, 4);
});

test('PNG 的影像相關 chunk 一個都不能少', () => {
  // 這些拿掉會讓圖解不開或變樣
  const png = makePng([
    pngChunk('gAMA', [0, 1, 0x86, 0xa0]),
    pngChunk('sRGB', [0]),
    pngChunk('tRNS', [0, 255]),
    pngChunk('tEXt', 'Author\x00Wang'),
  ]);
  const result = tool.strip(png);
  const text = asText(result.data);
  for (const needed of ['IHDR', 'gAMA', 'sRGB', 'tRNS', 'IDAT', 'IEND']) {
    assert.ok(text.includes(needed), `${needed} 被拿掉了`);
  }
  assert.ok(!text.includes('Author'));
});

test('PNG 的 CRC 不用重算，因為只刪整個 chunk', () => {
  const png = makePng([pngChunk('tEXt', 'Author\x00Wang')]);
  const result = tool.strip(png);
  // 逐一走過輸出的 chunk，驗 CRC 都還對得上
  let i = 8;
  let checked = 0;
  while (i + 8 <= result.data.length) {
    const len = (result.data[i] << 24 | result.data[i+1] << 16 |
                 result.data[i+2] << 8 | result.data[i+3]) >>> 0;
    const body = result.data.subarray(i + 4, i + 8 + len);
    const stored = (result.data[i+8+len] << 24 | result.data[i+9+len] << 16 |
                    result.data[i+10+len] << 8 | result.data[i+11+len]) >>> 0;
    assert.equal(crc32(body), stored, `第 ${checked + 1} 個 chunk 的 CRC 對不上`);
    checked += 1;
    i += 12 + len;
  }
  assert.ok(checked >= 3, `只驗到 ${checked} 個 chunk`);
});

test('格式認得出來，不支援的要說得比「這不是圖片」精確', () => {
  assert.equal(tool.detect(makeJpeg([])), 'jpeg');
  assert.equal(tool.detect(makePng([])), 'png');
  assert.equal(tool.detect(u8([0, 0, 0, 24], 'ftypheic')), 'heic');
  assert.equal(tool.detect(u8('RIFF', [0, 0, 0, 0], 'WEBP')), 'webp');
  assert.equal(tool.detect(u8('GIF89a')), 'gif');
  assert.equal(tool.detect(u8('hello world!!')), 'unknown');
});

test('HEIC 的訊息給得出實際做法，那是 iPhone 的預設格式', () => {
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    const msg = strings.errors.heic;
    assert.ok(msg.length > 60, `${lang} 的 HEIC 訊息只有 ${msg.length} 字`);
    assert.ok(/JPEG/.test(msg), `${lang} 的 HEIC 訊息沒有指出換成 JPEG`);
  }
});

test('壞掉的檔案回錯誤，不會丟例外也不會產出半個檔', () => {
  for (const bad of [
    u8([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff]),          // 長度超出檔案
    u8([0xff, 0xd8, 0x00, 0x11]),                       // 不是 marker
    u8(PNG_SIG, [0xff, 0xff, 0xff, 0xff], 'tEXt'),      // chunk 長度爆掉
    u8(PNG_SIG),                                        // 只有簽章沒有 chunk
  ]) {
    const result = tool.strip(bad);
    assert.equal(result.ok, false, '壞掉的檔案卻回成功');
    assert.ok(result.reason, '沒有說明為什麼失敗');
  }
});

test('空檔案與極短的輸入不會炸', () => {
  for (const bytes of [new Uint8Array(0), new Uint8Array([0xff]), new Uint8Array([0xff, 0xd8])]) {
    const result = tool.strip(bytes);
    assert.equal(result.ok, false);
  }
});

test('清完的檔名看得出是哪一份', () => {
  assert.equal(tool.cleanName('IMG_2024.jpg'), 'IMG_2024-clean.jpg');
  assert.equal(tool.cleanName('螢幕截圖 2026-08-21.png'), '螢幕截圖 2026-08-21-clean.png');
  assert.equal(tool.cleanName('noext'), 'noext-clean');
  assert.equal(tool.cleanName('.hidden'), '.hidden-clean');
});

test('三個語系的文案 key 完全一致', () => {
  const langs = Object.keys(tool.STRINGS);
  assert.equal(langs.length, 3);
  const keysOf = (obj) => Object.keys(obj).sort().join(',');
  const base = tool.STRINGS[langs[0]];
  for (const lang of langs.slice(1)) {
    assert.equal(keysOf(tool.STRINGS[lang]), keysOf(base), `${lang} 的頂層 key 對不上`);
    for (const group of ['labels', 'errors']) {
      assert.equal(keysOf(tool.STRINGS[lang][group]), keysOf(base[group]), `${lang} 的 ${group} 對不上`);
    }
  }
});

test('每一種會被列出來的段落，三個語系都有說明', () => {
  const labels = new Set();
  for (const marker of Object.values(tool.JPEG_KEEP)) labels.add(marker);
  for (const label of Object.values(tool.PNG_DROP)) labels.add(label);
  for (const label of ['exif', 'photoshop', 'comment', 'app']) labels.add(label);
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    for (const label of labels) {
      assert.ok(strings.labels[label], `${lang} 少了「${label}」的說明`);
    }
  }
});

test('沒有任何網路請求，檔案不上傳', () => {
  // 會需要清 metadata 的人，正是最不該把原始檔交出去的人
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket',
                        'localStorage', 'sessionStorage', 'indexedDB']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('清完之後會實際載入一次，確認沒有把檔案改壞', () => {
  assert.ok(/function verify\(blob, kind\)/.test(code), '沒有驗證步驟');
  assert.ok(/image\.onerror/.test(code), '圖片沒有處理載入失敗');
  assert.ok(/reason: "verify"/.test(code), '驗證失敗時沒有回報給讀者');
});

test('影片要用 video 元素驗，而且要看時間長度', () => {
  // 用 Image 驗影片永遠會失敗，用 video 但不看 duration 又會放過改壞的檔案。
  // 改壞影片最典型的症狀就是時間長度變成 0 或 NaN
  const verify = code.slice(code.indexOf('function verify(blob, kind)'));
  const body = verify.slice(0, verify.indexOf('async function handleOne'));
  assert.ok(body.includes('createElement("video")'), '影片沒有用 video 元素驗');
  assert.ok(body.includes('onloadedmetadata'), '沒有等到 metadata 讀出來');
  assert.ok(/isFinite\(seconds\)|isFinite\(video\.duration\)/.test(body),
            '沒有檢查時間長度是不是有效的數字');
});

// --- MP4 素材 ---
// box：size(4) type(4) payload。這裡手工組一個最小但結構完整的檔案。
const box = (type, ...payload) => {
  const body = u8(...payload);
  const out = new Uint8Array(8 + body.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, out.length);
  out.set(Buffer.from(type, 'latin1'), 4);
  out.set(body, 8);
  return out;
};
const u32 = (n) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n); return b; };

// stco 裡放一個 chunk offset，指向 mdat 的資料起點
const makeMp4 = ({ moovFirst = false, udta = true, chunkOffset = 0 } = {}) => {
  const stco = box('stco', [0,0,0,0], u32(1), u32(chunkOffset));
  const stbl = box('stbl', stco);
  const minf = box('minf', stbl);
  const hdlr = box('hdlr', [0,0,0,0], [0,0,0,0], 'vide', new Uint8Array(12), 'VideoHandler\x00');
  const mdia = box('mdia', hdlr, minf);
  const trak = box('trak', mdia);
  const parts = [box('mvhd', new Uint8Array(8)), trak];
  if (udta) parts.push(box('udta', box('meta', 'GPS:25.033 Wang Ming secret')));
  const moov = box('moov', ...parts);
  const mdat = box('mdat', 'PAYLOADPAYLOAD');
  const ftyp = box('ftyp', 'isomisom');
  return moovFirst ? u8(ftyp, moov, mdat) : u8(ftyp, mdat, moov);
};

test('MP4 的使用者資料區整段拿掉，敏感字串不留', () => {
  const result = tool.strip(makeMp4());
  assert.equal(result.kind, 'mp4');
  assert.ok(result.ok, `失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['GPS:25.033', 'Wang Ming', 'secret']) {
    assert.ok(!text.includes(needle), `${needle} 還留在輸出裡`);
  }
  assert.ok(result.removed.some((r) => r.marker === 'udta'), 'udta 沒有被記錄成拿掉的東西');
});

test('外層 box 的長度跟著改，不然檔案就壞了', () => {
  // 巢狀是 MP4 跟 JPEG 最大的不同：拿掉內層，外面每一層的長度都要減
  const result = tool.strip(makeMp4());
  const top = tool.mp4Boxes(result.data, 0, result.data.length);
  assert.ok(top, '輸出解析不了');
  const moov = top.find((b) => b.type === 'moov');
  assert.ok(moov, '找不到 moov');
  // moov 宣告的長度要跟它實際佔的位元組一致，逐層往下都要成立
  const walk = (start, end) => {
    const list = tool.mp4Boxes(result.data, start, end);
    assert.ok(list, `${start}-${end} 這一段解析不了，長度對不上`);
    let sum = 0;
    for (const b of list) {
      sum += b.size;
      if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(b.type)) walk(b.at + b.header, b.at + b.size);
    }
    assert.equal(sum, end - start, `${start}-${end} 的子 box 加起來是 ${sum}，應該是 ${end - start}`);
  };
  walk(0, result.data.length);
});

test('moov 排在前面時，影像資料的位置表要跟著改', () => {
  // 這是最容易漏掉的一步。漏了的話檔案資訊讀得出來、時間長度也對，播下去才碎掉
  const src = makeMp4({ moovFirst: true, chunkOffset: 1000 });
  const result = tool.strip(src);
  assert.ok(result.ok);
  const delta = src.length - result.data.length;
  assert.ok(delta > 0, '沒有拿掉任何東西，這個案例就驗不到位移');

  const findStco = (bytes, start, end) => {
    for (const b of tool.mp4Boxes(bytes, start, end) || []) {
      if (b.type === 'stco') return b;
      if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(b.type)) {
        const found = findStco(bytes, b.at + b.header, b.at + b.size);
        if (found) return found;
      }
    }
    return null;
  };
  const stco = findStco(result.data, 0, result.data.length);
  assert.ok(stco, '找不到 stco');
  const dv = new DataView(result.data.buffer, result.data.byteOffset, result.data.byteLength);
  assert.equal(dv.getUint32(stco.at + 16), 1000 - delta,
               `chunk offset 應該從 1000 減到 ${1000 - delta}`);
});

test('moov 排在後面時不要亂改位置表', () => {
  // 影像資料在前面，沒有被推動，改了反而是錯的
  const src = makeMp4({ moovFirst: false, chunkOffset: 40 });
  const result = tool.strip(src);
  const findStco = (bytes, start, end) => {
    for (const b of tool.mp4Boxes(bytes, start, end) || []) {
      if (b.type === 'stco') return b;
      if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(b.type)) {
        const found = findStco(bytes, b.at + b.header, b.at + b.size);
        if (found) return found;
      }
    }
    return null;
  };
  const stco = findStco(result.data, 0, result.data.length);
  const dv = new DataView(result.data.buffer, result.data.byteOffset, result.data.byteLength);
  assert.equal(dv.getUint32(stco.at + 16), 40, 'chunk offset 不該被動到');
});

test('軌道的處理器名稱清成空的，長度不變', () => {
  const src = makeMp4({ udta: false });
  const result = tool.strip(src);
  assert.ok(!asText(result.data).includes('VideoHandler'), '處理器名稱還在');
  assert.equal(result.data.length, src.length, '清名稱不該改變檔案長度');
});

test('壓縮資料裡的編碼器痕跡要如實回報，不能默默留著', () => {
  // 那一段不是 metadata 而是影音資料的一部分，清不掉。讀者以為清乾淨了才危險
  const withMark = u8(
    box('ftyp', 'isomisom'),
    box('mdat', 'xxxx Lavc60.31.102 xxxx'),
    box('moov', box('mvhd', new Uint8Array(8)), box('udta', box('meta', 'title'))),
  );
  const result = tool.strip(withMark);
  assert.ok(result.ok);
  assert.ok((result.notes || []).some((n) => n.label === 'encoderInData'),
            '沒有回報壓縮資料裡的編碼器痕跡');
  assert.ok(result.notes[0].detail.includes('Lavc'), '沒有指出是哪一個字串');
});

test('乾淨的 MP4 不會被亂改', () => {
  const clean = makeMp4({ udta: false });
  const result = tool.strip(clean);
  assert.ok(result.ok);
  // 只有處理器名稱被清空，長度必須一樣
  assert.equal(result.data.length, clean.length);
});

test('HEIC 跟 MP4 都是 ftyp 開頭，要分得出來', () => {
  // 分錯的話 iPhone 的照片會被當成影片去拆 box
  assert.equal(tool.detect(u8([0,0,0,24], 'ftypheic')), 'heic');
  assert.equal(tool.detect(u8([0,0,0,24], 'ftypmif1')), 'heic');
  assert.equal(tool.detect(u8([0,0,0,24], 'ftypisom')), 'mp4');
  assert.equal(tool.detect(u8([0,0,0,24], 'ftypqt  ')), 'mp4');
  assert.equal(tool.detect(u8([0,0,0,24], 'ftypmp42')), 'mp4');
});

test('壞掉的 MP4 回錯誤，不會產出半個檔', () => {
  for (const bad of [
    u8(box('ftyp', 'isomisom'), [0xff, 0xff, 0xff, 0xff], 'moov'),   // 長度爆掉
    u8(box('ftyp', 'isomisom')),                                      // 沒有 moov
    u8([0,0,0,24], 'ftypisom'),                                       // 只有頭
  ]) {
    const result = tool.strip(bad);
    assert.equal(result.ok, false, '壞掉的檔案卻回成功');
  }
});

test('原始資料不會被就地改掉', () => {
  // stco 那一段是原地寫入，動到呼叫端的 buffer 會很難查
  const src = makeMp4({ moovFirst: true, chunkOffset: 1000 });
  const before = Array.from(src);
  tool.strip(src);
  assert.deepEqual(Array.from(src), before, '呼叫端的資料被改了');
});

for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 4).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
