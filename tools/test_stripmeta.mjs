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
import zlib from 'node:zlib';
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
  return { strip, detect, cleanName, stripJpeg, stripPng, stripMp4, mp4Boxes, stripWebp, stripGif, stripMp3, stripWav, stripOoxml, parseZip, buildZip, crc32, verifyZip, ooxmlType, id3v2Size, isMp3Frame, SUPPORTED, isSupported, STRINGS, JPEG_KEEP, PNG_DROP, MP4_DROP, WAV_DROP };
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

test('PDF 認得出來，而且不會被當成別的格式', () => {
  assert.equal(tool.detect(u8('%PDF-1.7\n')), 'pdf');
  assert.equal(tool.detect(u8('%PDF-1.4\n%\xe2\xe3')), 'pdf');
  assert.equal(tool.detect(u8('%PDX-1.7\n')), 'unknown');
});

test('PDF 走非同步那條路，不從同步的 strip 出去', () => {
  // pdf-lib 的 API 是非同步的。同步那一支要明確不處理 PDF，否則會回一個
  // 看起來成功、實際上沒有資料的結果
  const result = tool.strip(u8('%PDF-1.7\n', new Uint8Array(64)));
  assert.equal(result.ok, false, '同步的 strip 不該處理 PDF');
  assert.equal(result.kind, 'pdf', '格式還是要認得出來');
});

test('拿掉 XMP 的引用之後，那個物件本身也要刪掉', () => {
  // 這是最容易做半套的地方。只 delete 引用的話，pdf-lib 儲存時照樣把那段 XMP
  // 寫進檔案，只是沒有人指向它，用文字搜尋工具打開還是找得到作者跟地點。
  const fn = code.slice(code.indexOf('const dropMeta ='));
  const body = fn.slice(0, fn.indexOf('let data;'));
  assert.ok(body.includes('holder.delete(META)'), '沒有拿掉引用');
  assert.ok(/context\.delete\(ref\)/.test(body), '沒有把物件本身從文件裡刪掉');
});

test('PDF 存檔不用物件流', () => {
  // 壓成物件流之後，讀者拿文字搜尋工具自己核對就看不到東西了。
  // 這一頁的立場是讓人驗得動。
  assert.ok(/useObjectStreams:\s*false/.test(code), '存檔時把內容壓進物件流了');
});

test('PDF 的驗證步驟不能用 img 或 video', () => {
  const verify = code.slice(code.indexOf('function verify(blob, kind)'));
  const body = verify.slice(0, verify.indexOf('async function handleOne'));
  const pdfPart = body.slice(body.indexOf('kind === "pdf"'), body.indexOf('kind === "mp4"'));
  assert.ok(pdfPart.includes('PDFDocument.load'), 'PDF 沒有用同一個函式庫重新讀一次');
  assert.ok(pdfPart.includes('getPageCount'), '沒有確認頁面還在');
});

test('加密的 PDF 要擋下來，不要產出一份殘缺的檔案', () => {
  assert.ok(/doc\.isEncrypted/.test(code), '沒有檢查加密');
  assert.ok(/reason: "encrypted"/.test(code), '沒有回報加密的情況');
});

test('每個 PDF 欄位三個語系都有說明', () => {
  const fields = ['pdfTitle', 'pdfAuthor', 'pdfSubject', 'pdfCreator', 'pdfProducer',
                  'pdfKeywords', 'pdfDates', 'pdfXmp', 'pdfXmpPage'];
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    for (const f of fields) assert.ok(strings.labels[f], `${lang} 少了「${f}」`);
    assert.ok(strings.notes.pdfLeftovers, `${lang} 少了註解與附件的提醒`);
    assert.ok(strings.errors.encrypted, `${lang} 少了加密的訊息`);
    assert.ok(strings.errors.pdfLibMissing, `${lang} 少了函式庫沒載入的訊息`);
    assert.ok(strings.pdf, `${lang} 少了 PDF 的格式說明`);
  }
});

test('vendor 裡的 pdf-lib 與授權都在', () => {
  const dir = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor');
  assert.ok(fs.existsSync(path.join(dir, 'pdf-lib.min.js')), 'pdf-lib.min.js 不見了');
  assert.ok(fs.existsSync(path.join(dir, 'pdf-lib-LICENSE.txt')), 'MIT 授權要求散布時附上副本');
  const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
  assert.ok(readme.includes('pdf-lib'), 'vendor 的 README 沒有登記這一份');
});

// --- WebP 與 GIF 素材 ---
const le32 = (n) => new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255]);
const riffChunk = (fourcc, payload) => {
  const body = typeof payload === 'string' ? Buffer.from(payload, 'latin1') : payload;
  const pad = body.length & 1 ? [0] : [];
  return u8(fourcc, le32(body.length), body, pad);
};
const makeWebp = ({ exif = true, xmp = true, vp8x = true } = {}) => {
  const chunks = [];
  if (vp8x) {
    const flags = (exif ? 0x08 : 0) | (xmp ? 0x04 : 0);
    chunks.push(riffChunk('VP8X', u8([flags, 0, 0, 0], [199, 0, 0], [149, 0, 0])));
  }
  chunks.push(riffChunk('VP8 ', 'IMAGEDATA'));
  if (exif) chunks.push(riffChunk('EXIF', 'Exif\x00\x00GPS:25.033 Wang Ming'));
  if (xmp) chunks.push(riffChunk('XMP ', '<x:xmpmeta>Taipei</x:xmpmeta>'));
  const body = u8(...chunks);
  return u8('RIFF', le32(4 + body.length), 'WEBP', body);
};

const gifExt = (label, ...blocks) => {
  const parts = [u8([0x21, label])];
  for (const b of blocks) {
    const body = typeof b === 'string' ? Buffer.from(b, 'latin1') : b;
    parts.push(u8([body.length], body));
  }
  parts.push(u8([0]));
  return u8(...parts);
};
const makeGif = ({ comment = true, netscape = true, xmpApp = true } = {}) => {
  const parts = [u8('GIF89a', [4, 0, 4, 0, 0x00, 0, 0])];   // 沒有全域調色盤
  if (netscape) parts.push(gifExt(0xff, 'NETSCAPE2.0', u8([1, 0, 0])));
  if (xmpApp) parts.push(gifExt(0xff, 'XMP DataXMP', 'Wang Ming Taipei'));
  if (comment) parts.push(gifExt(0xfe, 'internal draft do not share'));
  // 影像：描述子(10) + LZW 最小碼長度 + 子區塊
  parts.push(u8([0x2c, 0, 0, 0, 0, 4, 0, 4, 0, 0x00], [2], [3], 'ABC', [0]));
  parts.push(u8([0x3b]));
  return u8(...parts);
};

test('WebP 的 EXIF 與 XMP 整段拿掉', () => {
  const result = tool.strip(makeWebp());
  assert.equal(result.kind, 'webp');
  assert.ok(result.ok, `失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['GPS:25.033', 'Wang Ming', 'Taipei']) {
    assert.ok(!text.includes(needle), `${needle} 還留著`);
  }
  assert.ok(text.includes('IMAGEDATA'), '影像資料被動到了');
  assert.equal(result.removed.length, 2);
});

test('WebP 的 RIFF 長度欄位要跟著改', () => {
  // 長度沒改的話後面多出一段垃圾，有些解碼器會拒絕
  const result = tool.strip(makeWebp());
  const dv = new DataView(result.data.buffer, result.data.byteOffset, result.data.byteLength);
  assert.equal(dv.getUint32(4, true), result.data.length - 8,
               'RIFF 長度欄位跟實際檔案大小對不上');
});

test('WebP 的 VP8X 旗標要跟著清掉', () => {
  // 旗標說有 EXIF、chunk 卻不在，檔案自相矛盾
  const result = tool.strip(makeWebp());
  let at = 12;
  const dv = new DataView(result.data.buffer, result.data.byteOffset, result.data.byteLength);
  while (at + 8 <= result.data.length) {
    const fourcc = asText(result.data.subarray(at, at + 4));
    const size = dv.getUint32(at + 4, true);
    if (fourcc === 'VP8X') {
      const flags = result.data[at + 8];
      assert.equal(flags & 0x08, 0, 'EXIF 旗標還立著');
      assert.equal(flags & 0x04, 0, 'XMP 旗標還立著');
      return;
    }
    at += 8 + size + (size & 1);
  }
  assert.fail('找不到 VP8X');
});

test('本來就乾淨的 WebP 不會被動到', () => {
  const clean = makeWebp({ exif: false, xmp: false });
  const result = tool.strip(clean);
  assert.equal(result.removed.length, 0);
  assert.deepEqual(Array.from(result.data), Array.from(clean));
});

test('GIF 的註解與夾帶 XMP 的應用程式擴充都拿掉', () => {
  const result = tool.strip(makeGif());
  assert.equal(result.kind, 'gif');
  assert.ok(result.ok, `失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['internal draft', 'Wang Ming', 'Taipei', 'XMP DataXMP']) {
    assert.ok(!text.includes(needle), `${needle} 還留著`);
  }
});

test('GIF 的動畫循環設定不能拿掉', () => {
  // NETSCAPE2.0 記著要循環幾次，拿掉之後動圖只會播一次
  const result = tool.strip(makeGif());
  assert.ok(asText(result.data).includes('NETSCAPE2.0'), '循環設定被拿掉了');
  assert.ok(asText(result.data).includes('ABC'), '影像資料被動到了');
});

test('GIF 的結尾標記還在，而且只有一個', () => {
  const result = tool.strip(makeGif());
  assert.equal(result.data[result.data.length - 1], 0x3b, '結尾標記不見了');
});

test('壞掉的 WebP 與 GIF 回錯誤', () => {
  for (const bad of [
    u8('RIFF', le32(999), 'WEBP'),                 // 長度超出檔案
    u8('RIFF', le32(4), 'XXXX'),                   // 不是 WEBP
    u8('GIF89a'),                                   // 只有簽章
    u8('GIF89a', [4, 0, 4, 0, 0, 0, 0], [0x99]),   // 認不得的區塊
  ]) {
    assert.equal(tool.strip(bad).ok, false, '壞掉的檔案卻回成功');
  }
});

test('支援清單跟程式實際處理的格式完全一致', () => {
  // 文案宣稱支援、程式其實不支援，那比不支援更糟。這一項把兩邊綁在一起。
  const samples = {
    jpeg: makeJpeg([EXIF]),
    png: makePng([pngChunk('tEXt', 'Author\x00X')]),
    webp: makeWebp(),
    gif: makeGif(),
    mp4: makeMp4(),
    mp3: makeMp3([ID3V2]),
    wav: makeWav([wavChunk('LIST', 'INFOIART' + le32s(4) + 'Wang')]),
  };
  for (const item of tool.SUPPORTED) {
    // PDF 與 Office 文件走非同步那條路，另外測
    if (item.kind === 'pdf' || item.kind === 'ooxml') continue;
    const sample = samples[item.kind];
    assert.ok(sample, `清單裡有 ${item.kind}，但測試沒有對應的樣本`);
    assert.equal(tool.detect(sample), item.kind, `${item.kind} 認不出來`);
    assert.equal(tool.strip(sample).ok, true, `清單說支援 ${item.kind}，實際上處理失敗`);
  }
  // 反過來：detect 認得的格式，除了明確不支援的那幾種，都要在清單裡
  assert.equal(tool.isSupported('heic'), false, 'HEIC 不該出現在支援清單裡');
  assert.equal(tool.isSupported('unknown'), false);
  for (const kind of ['jpeg', 'png', 'webp', 'gif', 'mp4', 'mp3', 'wav', 'ooxml', 'pdf']) {
    assert.equal(tool.isSupported(kind), true, `${kind} 不在支援清單裡`);
  }
  assert.equal(tool.isSupported('zip'), false, '一般壓縮檔不該在支援清單裡');
});

test('頁面上那張表列的格式跟程式一致', () => {
  // 表格是手寫的，程式改了表格沒改就會騙人
  const page = fs.readFileSync(path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'strip-metadata.md'), 'utf8');
  const table = page.slice(page.indexOf('## 支援哪些檔案'), page.indexOf('## 拿掉什麼'));
  for (const item of tool.SUPPORTED) {
    for (const ext of item.ext.split(' ')) {
      assert.ok(table.includes('`' + ext + '`'), `頁面的表格少了 ${ext}`);
    }
  }
  // 不支援的不該出現在表格裡
  for (const ext of ['.heic', '.tiff', '.mkv']) {
    assert.ok(!table.includes('`' + ext + '`'), `表格裡有 ${ext}，但程式不支援`);
  }
});

test('三個語系都有支援清單的說明文字', () => {
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    assert.ok(strings.supports, `${lang} 少了拖放區的格式說明`);
  }
});

test('pdf-lib 不放在頁面裡用 script 標籤載', () => {
  // 那一份有五百多 KB，是這一頁最大的一塊。放在頁面裡等於每個打開這一頁的人
  // 都要先等它下載完，而六種格式裡只有 PDF 需要它。
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const page = fs.readFileSync(path.join(HERE, '..', 'docs', lang, 'utils', 'strip-metadata.md'), 'utf8');
    assert.ok(!/<script[^>]*pdf-lib/.test(page), `${lang} 的頁面還在用 script 標籤載 pdf-lib`);
  }
  assert.ok(/function loadPdfLib\(\)/.test(code), '沒有動態載入的路徑');
  assert.ok(/createElement\("script"\)/.test(code), '沒有動態插入 script');
});

test('離線副本仍然包含 pdf-lib', () => {
  // 頁面裡沒有 script 標籤之後，offline_index 的資產掃描就看不到它了。
  // 漏掉的話，存下這一頁的人在斷網時處理不了 PDF，而且不會有任何錯誤訊息。
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const page = fs.readFileSync(path.join(HERE, '..', 'docs', lang, 'utils', 'strip-metadata.md'), 'utf8');
    const front = page.slice(0, page.indexOf('\n---', 4));
    assert.ok(front.includes('offline_assets'), `${lang} 沒有宣告 offline_assets`);
    assert.ok(front.includes('utils/vendor/pdf-lib.min.js'), `${lang} 的 offline_assets 少了 pdf-lib`);
  }
});

test('載入函式庫的時候畫面要說一聲', () => {
  // 半 MB 在慢一點的網路上要等好幾秒，沒有回饋的話讀者會以為卡住了
  assert.ok(/loadingLib = true/.test(code), '沒有進入載入狀態');
  assert.ok(/sm-loading/.test(code), '沒有把載入狀態畫出來');
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    assert.ok(strings.loadingLib, `${lang} 少了載入中的文字`);
  }
  // 設了旗標之後要讓出主執行緒，那行字才畫得出來
  const handle = code.slice(code.indexOf('async function handle(list)'));
  const guard = handle.slice(0, handle.indexOf('files.push'));
  assert.ok(/loadingLib = true[\s\S]*?render\(\)[\s\S]*?setTimeout/.test(guard),
            '設了載入狀態卻沒有讓畫面有機會更新');
});

test('函式庫載入失敗時不會卡在一個永遠不完成的等待上', () => {
  const fn = code.slice(code.indexOf('function loadPdfLib()'));
  const body = fn.slice(0, fn.indexOf('async function stripPdf'));
  assert.ok(/onerror[\s\S]*?pdfLibLoading = null/.test(body),
            '載入失敗沒有把 promise 清掉，下一次會直接拿到失敗的結果');
});


// ---------------------------------------------------------------------------
// MP3
// ---------------------------------------------------------------------------

const le32s = (n) => String.fromCharCode(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255);
const syncsafe = (n) => [(n >>> 21) & 0x7f, (n >>> 14) & 0x7f, (n >>> 7) & 0x7f, n & 0x7f];
const id3v2 = (payload) => u8('ID3', [3, 0, 0], syncsafe(payload.length), payload);
const ID3V2 = id3v2(u8('TIT2', [0, 0, 0, 13, 0, 0], [0], 'Secret Title', 'TSSE', [0, 0, 0, 9, 0, 0], [0], 'Lavf60.3'));
// 兩個 MPEG-1 Layer III 的音框：同步字 0xFFFB，128 kbps，44.1 kHz
const MP3_FRAMES = u8([0xff, 0xfb, 0x90, 0x00], new Uint8Array(40).fill(0x5a),
                      [0xff, 0xfb, 0x90, 0x00], new Uint8Array(40).fill(0xa5));
const ID3V1 = u8('TAG', 'Secret Title'.padEnd(30, '\0'), 'Wang'.padEnd(30, '\0'), ''.padEnd(65, '\0'));
const apeTag = () => {
  const value = Buffer.from('Wang', 'latin1');
  const item = u8(le32s(value.length), le32s(0), 'Artist\0', value);
  const size = item.length + 32;
  const block = (flags) => u8('APETAGEX', le32s(2000), le32s(size), le32s(1), le32s(flags), '\0'.repeat(8));
  return u8(block(0xa0000000 >>> 0), item, block(0x80000000 >>> 0));
};
const makeMp3 = (head, tail = []) => u8(...head, MP3_FRAMES, ...tail);

test('MP3 認得出來，AAC 的 ADTS 不會被誤認', () => {
  assert.equal(tool.detect(makeMp3([ID3V2])), 'mp3');
  assert.equal(tool.detect(MP3_FRAMES), 'mp3');
  // ADTS：0xFFF1，layer 位元是保留值
  assert.equal(tool.detect(u8([0xff, 0xf1, 0x50, 0x80, 0, 0x1f, 0xfc])), 'unknown');
});

test('MP3 的 ID3v2、ID3v1 與 APE 標籤都拿掉，音框一個位元都沒動', () => {
  const result = tool.strip(makeMp3([ID3V2], [apeTag(), ID3V1]));
  assert.ok(result.ok, `清除失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['Secret Title', 'Wang', 'ID3', 'TAG', 'APETAGEX', 'Lavf']) {
    assert.ok(!text.includes(needle), `${needle} 還留在輸出裡`);
  }
  assert.deepEqual(Array.from(result.data), Array.from(MP3_FRAMES), '音框被動到了');
  assert.deepEqual(result.removed.map((r) => r.label).sort(), ['ape', 'id3v1', 'id3v2']);
  assert.equal(result.removed.find((r) => r.label === 'id3v1').bytes, 128);
});

test('MP3 沒有標籤時原樣交回，不多不少', () => {
  const result = tool.strip(MP3_FRAMES);
  assert.ok(result.ok);
  assert.equal(result.removed.length, 0);
  assert.deepEqual(Array.from(result.data), Array.from(MP3_FRAMES));
});

test('MP3 音框裡的編碼器字串清不掉，要列在提醒裡', () => {
  const frames = u8([0xff, 0xfb, 0x90, 0x00], 'LAME3.100'.padEnd(40, '\0'));
  const result = tool.strip(u8(ID3V2, frames));
  assert.ok(result.ok);
  assert.ok(result.notes.some((n) => n.label === 'encoderInData' && n.detail.includes('LAME')),
            '編碼器痕跡沒有列出來');
});

test('ID3 之後找不到音框就當成壞檔，不硬猜', () => {
  const result = tool.strip(u8(ID3V2, 'this is not audio at all'.repeat(3)));
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'broken');
});

// ---------------------------------------------------------------------------
// WAV
// ---------------------------------------------------------------------------

const wavChunk = (id, payload) => {
  const body = typeof payload === 'string' ? Buffer.from(payload, 'latin1') : Buffer.from(payload);
  return u8(id, le32(body.length), body, body.length & 1 ? [0] : []);
};
const WAV_FMT = wavChunk('fmt ', [1, 0, 1, 0, 0x44, 0xac, 0, 0, 0x88, 0x58, 1, 0, 2, 0, 16, 0]);
const WAV_DATA = wavChunk('data', [1, 2, 3, 4, 5, 6, 7]);   // 奇數長度，後面要補一個位元組
const makeWav = (extra) => {
  const inner = u8('WAVE', WAV_FMT, ...extra, WAV_DATA);
  return u8('RIFF', le32(inner.length), inner);
};

test('WAV 認得出來', () => {
  assert.equal(tool.detect(makeWav([])), 'wav');
  assert.equal(tool.detect(u8('RIFF', le32(4), 'AVI ')), 'unknown');
});

test('WAV 的 INFO、bext、iXML 都拿掉，fmt 與 data 照抄，RIFF 長度跟著改', () => {
  const src = makeWav([
    wavChunk('LIST', 'INFO' + 'IART' + le32s(9) + 'Wang Ming' + '\0' + 'ISFT' + le32s(8) + 'Audacity'),
    wavChunk('bext', 'Interview with source'.padEnd(256, '\0') + 'SecretCorp'.padEnd(32, '\0')),
    wavChunk('iXML', '<BWFXML><SCENE>safehouse</SCENE></BWFXML>'),
  ]);
  const result = tool.strip(src);
  assert.ok(result.ok, `清除失敗：${result.reason}`);
  const text = asText(result.data);
  for (const needle of ['Wang Ming', 'Audacity', 'SecretCorp', 'safehouse', 'LIST', 'bext', 'iXML']) {
    assert.ok(!text.includes(needle), `${needle} 還留在輸出裡`);
  }
  assert.deepEqual(Array.from(result.data), Array.from(makeWav([])), 'fmt 或 data 被動到了，或 RIFF 長度沒改');
  assert.deepEqual(result.removed.map((r) => r.label).sort(), ['bext', 'ixml', 'wavInfo']);
});

test('WAV 的提示點標籤（LIST adtl）是內容，留著', () => {
  const adtl = wavChunk('LIST', 'adtl' + 'labl' + le32s(8) + le32s(1) + 'Q1\0\0');
  const result = tool.strip(makeWav([adtl]));
  assert.ok(result.ok);
  assert.equal(result.removed.length, 0);
  assert.ok(asText(result.data).includes('adtl'));
});

test('WAV 沒有 data 區塊就當成壞檔', () => {
  const inner = u8('WAVE', WAV_FMT);
  assert.equal(tool.strip(u8('RIFF', le32(inner.length), inner)).ok, false);
});

// ---------------------------------------------------------------------------
// Office 文件（OOXML）
// ---------------------------------------------------------------------------
//
// 用測試自己寫的 zip 產生器造檔案，跟工具裡的 buildZip 是兩份獨立的實作，互相驗證。

const zipDate = { time: 0x8c40, date: 0x5921 };   // 2024-09-01 17:34，LibreOffice 那種真實時間

function makeZip(files, { comment = '', epoch = false } = {}) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8');
    const raw = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    const stored = file.stored === true;
    const data = stored ? raw : zlib.deflateRawSync(raw);
    const crc = zlib.crc32(raw);
    const extra = file.extra ? Buffer.from(file.extra) : Buffer.alloc(0);
    const time = epoch ? 0 : zipDate.time;
    const date = epoch ? 0x21 : zipDate.date;
    const local = Buffer.alloc(30 + name.length + extra.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(stored ? 0 : 8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(extra.length, 28);
    name.copy(local, 30);
    extra.copy(local, 30 + name.length);
    locals.push(local, data);
    const central = Buffer.alloc(46 + name.length + extra.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x031e, 4);   // unix
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(stored ? 0 : 8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(extra.length, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0x81a40000, 38);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    extra.copy(central, 46 + name.length);
    centrals.push(central);
    offset += local.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const cmt = Buffer.from(comment, 'utf8');
  const end = Buffer.alloc(22 + cmt.length);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(cmt.length, 20);
  cmt.copy(end, 22);
  return new Uint8Array(Buffer.concat([...locals, cd, end]));
}

// 讀回工具的輸出：每個部件解開成字串或 bytes，順便驗 CRC 與長度
function readZip(bytes) {
  const zip = tool.parseZip(bytes);
  assert.ok(!zip.error, `輸出的 zip 讀不回來：${zip.error}`);
  const out = {};
  for (const entry of zip.entries) {
    const raw = entry.method === 0 ? Buffer.from(entry.data) : zlib.inflateRawSync(Buffer.from(entry.data));
    assert.equal(raw.length, entry.usize, `${entry.name} 的長度跟檔頭對不上`);
    assert.equal(zlib.crc32(raw), entry.crc, `${entry.name} 的 CRC 對不上`);
    out[entry.name] = { entry, raw };
  }
  return out;
}

const DOC_BODY = '<?xml version="1.0"?><w:document xmlns:w="w"><w:body><w:p><w:r><w:t>Hello Body</w:t></w:r>' +
  '<w:ins w:id="1" w:author="Wang Ming" w:date="2024-09-01T09:00:00Z"><w:r><w:t>added</w:t></w:r></w:ins>' +
  '<w:del w:id="2" w:author="Wang Ming" w:date="2024-09-01T09:00:00Z"><w:r><w:delText>gone</w:delText></w:r></w:del>' +
  '</w:p></w:body></w:document>';

const DOCX_FILES = [
  { name: '[Content_Types].xml', content: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/docProps/thumbnail.jpeg" ContentType="image/jpeg"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
  { name: '_rels/.rels', content: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail" Target="docProps/thumbnail.jpeg"/>' +
    '</Relationships>' },
  { name: 'docProps/core.xml', content: '<?xml version="1.0"?><cp:coreProperties xmlns:cp="cp" xmlns:dc="dc" xmlns:dcterms="dcterms" xmlns:xsi="xsi">' +
    '<dc:title>Secret memo</dc:title><dc:creator>Wang Ming</dc:creator><cp:lastModifiedBy>Wang Ming</cp:lastModifiedBy>' +
    '<cp:revision>7</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2024-08-30T02:11:00Z</dcterms:created>' +
    '<dcterms:modified xsi:type="dcterms:W3CDTF">2024-09-01T09:34:00Z</dcterms:modified></cp:coreProperties>',
    extra: [0x55, 0x54, 0x05, 0x00, 0x03, 0x11, 0x22, 0x33, 0x44] },   // 0x5455 extended timestamp
  { name: 'docProps/app.xml', content: '<?xml version="1.0"?><Properties xmlns="ep"><Application>Microsoft Office Word</Application>' +
    '<AppVersion>16.0000</AppVersion><Company>SecretCorp</Company><Template>Normal.dotm</Template><TotalTime>42</TotalTime><Pages>3</Pages><Words>0</Words></Properties>' },
  { name: 'docProps/custom.xml', content: '<?xml version="1.0"?><Properties xmlns="cp" xmlns:vt="vt"><property fmtid="{D5CDD505}" pid="2" name="CaseOfficer"><vt:lpwstr>Wang</vt:lpwstr></property>' +
    '<property fmtid="{D5CDD505}" pid="3" name="FileNo"><vt:lpwstr>2024-0917</vt:lpwstr></property></Properties>' },
  { name: 'docProps/thumbnail.jpeg', content: Buffer.from(makeJpeg([JFIF])), stored: true },
  { name: 'word/document.xml', content: DOC_BODY },
  { name: 'word/comments.xml', content: '<?xml version="1.0"?><w:comments xmlns:w="w"><w:comment w:id="0" w:author="Wang Ming" w:date="2024-09-01T09:00:00Z"><w:p><w:r><w:t>check this</w:t></w:r></w:p></w:comment></w:comments>' },
  { name: 'word/media/image1.jpeg', content: Buffer.from(makeJpeg([EXIF])), stored: true },
  { name: 'word/settings.xml', content: '<?xml version="1.0"?><w:settings xmlns:w="w"/>', stored: true },
];

test('Office 文件認得出來，一般壓縮檔不算', () => {
  assert.equal(tool.detect(makeZip(DOCX_FILES)), 'ooxml');
  assert.equal(tool.detect(makeZip([{ name: 'readme.txt', content: 'hi' }])), 'zip');
  assert.equal(tool.isSupported('ooxml'), true);
  assert.equal(tool.ooxmlType('memo.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.equal(tool.ooxmlType('DECK.PPTX'), 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  assert.equal(tool.ooxmlType('noext'), 'application/zip');
});

test('DOCX 的作者、公司、時間、修訂次數、自訂屬性都清空，內文一個字都沒動', async () => {
  const result = await tool.stripOoxml(makeZip(DOCX_FILES));
  assert.ok(result.ok, `清除失敗：${result.reason}`);
  const files = readZip(result.data);

  const core = files['docProps/core.xml'].raw.toString('utf8');
  const app = files['docProps/app.xml'].raw.toString('utf8');
  const custom = files['docProps/custom.xml'].raw.toString('utf8');
  for (const needle of ['Wang', 'Secret memo', '2024-08-30', 'SecretCorp', 'Normal.dotm', 'CaseOfficer', '2024-0917']) {
    assert.ok(!core.includes(needle) && !app.includes(needle) && !custom.includes(needle), `${needle} 還留在文件屬性裡`);
  }
  // 部件還在，根元素還在，結構沒變
  assert.ok(core.includes('<cp:coreProperties'), 'core.xml 不見了或根元素被拿掉');
  assert.ok(app.includes('<Properties'), 'app.xml 不見了或根元素被拿掉');
  assert.ok(custom.includes('<Properties'), 'custom.xml 不見了或根元素被拿掉');

  assert.equal(files['word/document.xml'].raw.toString('utf8'), DOC_BODY, '內文被動到了');
  assert.equal(files['word/settings.xml'].entry.method, 0, '原本 stored 的部件被改成壓縮');

  const labels = result.removed.map((r) => r.label);
  for (const label of ['coreCreator', 'coreModifiedBy', 'coreDates', 'coreTitle', 'coreRevision',
                       'appApplication', 'appCompany', 'appTemplate', 'appTotalTime', 'appOther', 'customProps']) {
    assert.ok(labels.includes(label), `removed 少了 ${label}`);
  }
});

test('DOCX 的縮圖真的刪掉，.rels 與 [Content_Types].xml 裡指向它的那幾行一起拿掉', async () => {
  const result = await tool.stripOoxml(makeZip(DOCX_FILES));
  const files = readZip(result.data);
  assert.equal(files['docProps/thumbnail.jpeg'], undefined, '縮圖還在');
  const rels = files['_rels/.rels'].raw.toString('utf8');
  assert.ok(!rels.includes('thumbnail'), '.rels 還指著縮圖，Word 會說檔案損毀');
  assert.ok(rels.includes('core-properties'), '.rels 裡其他關係被誤刪');
  const types = files['[Content_Types].xml'].raw.toString('utf8');
  assert.ok(!types.includes('thumbnail'), '[Content_Types].xml 還有縮圖的 Override');
  assert.ok(types.includes('Extension="jpeg"'), 'Default 那一行被誤刪，其他 jpeg 會壞');
  assert.ok(result.removed.some((r) => r.label === 'thumbnail'));
});

test('DOCX 裡夾帶的照片一起清 EXIF，影像資料一個位元都沒動', async () => {
  const result = await tool.stripOoxml(makeZip(DOCX_FILES));
  const files = readZip(result.data);
  const image = files['word/media/image1.jpeg'].raw;
  const text = image.toString('latin1');
  assert.ok(!text.includes('GPS:25.0330') && !text.includes('SecretCam'), '夾帶照片的 GPS 還在');
  const sosOf = (bytes) => { for (let i = 0; i < bytes.length - 1; i += 1) if (bytes[i] === 0xff && bytes[i + 1] === 0xda) return Array.from(bytes.subarray(i)); throw new Error('no SOS'); };
  assert.deepEqual(sosOf(image), sosOf(makeJpeg([EXIF])), '夾帶照片的壓縮資料被動到了');
  assert.ok(result.removed.some((r) => r.label === 'mediaMeta'));
});

test('DOCX 每個部件的時間戳記改成 1980-01-01，extra 欄位丟掉，壓縮檔註解拿掉', async () => {
  const result = await tool.stripOoxml(makeZip(DOCX_FILES, { comment: 'exported by Wang' }));
  assert.ok(!asText(result.data).includes('exported by Wang'), '壓縮檔註解還在');
  const zip = tool.parseZip(result.data);
  for (const entry of zip.entries) {
    assert.equal(entry.time, 0, `${entry.name} 的時間沒有清`);
    assert.equal(entry.date, 0x21, `${entry.name} 的日期沒有清`);
    assert.equal(entry.extraLen, 0, `${entry.name} 還帶著 extra 欄位`);
  }
  assert.equal(zip.commentLen, 0);
  const labels = result.removed.map((r) => r.label);
  assert.ok(labels.includes('zipTime') && labels.includes('zipComment'));
});

test('DOCX 的留言與追蹤修訂清不掉，要列在提醒裡', async () => {
  const result = await tool.stripOoxml(makeZip(DOCX_FILES));
  const labels = result.notes.map((n) => n.label);
  assert.ok(labels.includes('comments'), '留言沒有提醒');
  const changes = result.notes.find((n) => n.label === 'trackedChanges');
  assert.ok(changes, '追蹤修訂沒有提醒');
  assert.equal(changes.detail, '2');
});

test('清過的 DOCX 再清一次沒有東西可拿，而且整份驗得過', async () => {
  const first = await tool.stripOoxml(makeZip(DOCX_FILES));
  assert.equal(await tool.verifyZip(first.data), true, '輸出的 zip 驗不過');
  const second = await tool.stripOoxml(first.data);
  assert.ok(second.ok);
  assert.equal(second.removed.length, 0, `第二次還拿掉了 ${second.removed.map((r) => r.label)}`);
});

test('PPTX 的演講者備忘稿與留言列在提醒裡，時間本來就是 1980 的不算拿掉', async () => {
  const pptx = makeZip([
    { name: '[Content_Types].xml', content: '<Types/>' },
    { name: 'ppt/presentation.xml', content: '<p:presentation/>' },
    { name: 'ppt/notesSlides/notesSlide1.xml', content: '<p:notes>remember to skip slide 4</p:notes>' },
    { name: 'ppt/comments/comment1.xml', content: '<p:cmLst/>' },
    { name: 'docProps/core.xml', content: '<cp:coreProperties/>' },
  ], { epoch: true });
  const result = await tool.stripOoxml(pptx);
  assert.ok(result.ok);
  const labels = result.notes.map((n) => n.label).sort();
  assert.deepEqual(labels, ['comments', 'speakerNotes']);
  assert.ok(!result.removed.some((r) => r.label === 'zipTime'), '時間本來就是 1980 卻說拿掉了時間');
  assert.ok(!result.removed.some((r) => r.label === 'coreCreator'), '空的欄位不該列成拿掉');
});

test('zip 的解析拒絕 ZIP64、加密與不認得的壓縮法', async () => {
  const plain = makeZip([{ name: '[Content_Types].xml', content: '<Types/>' }]);
  const zip64 = new Uint8Array(plain);
  const end = zip64.length - 22;
  zip64[end + 10] = 0xff; zip64[end + 11] = 0xff;   // 筆數 0xFFFF
  assert.equal((await tool.stripOoxml(zip64)).reason, 'zip64');

  const encrypted = new Uint8Array(plain);
  const cdAt = Buffer.from(plain).readUInt32LE(end + 16);
  encrypted[cdAt + 8] |= 0x01;
  assert.equal((await tool.stripOoxml(encrypted)).reason, 'encrypted');

  const bzip = new Uint8Array(plain);
  bzip[cdAt + 10] = 12;
  assert.equal((await tool.stripOoxml(bzip)).reason, 'broken');

  assert.equal((await tool.stripOoxml(makeZip([{ name: 'a.txt', content: 'x' }]))).reason, 'notOoxml');
});

test('工具自己的 zip 寫入器與 CRC 跟 Node 的算法一致', () => {
  const sample = Buffer.from('the quick brown fox 台灣', 'utf8');
  assert.equal(tool.crc32(new Uint8Array(sample)), zlib.crc32(sample));
  const compressed = zlib.deflateRawSync(sample);
  const built = tool.buildZip([{ name: 'x/y.xml', method: 8, flags: 0x0800, crc: zlib.crc32(sample), csize: compressed.length, usize: sample.length, data: new Uint8Array(compressed) }]);
  const back = tool.parseZip(built);
  assert.ok(!back.error);
  assert.equal(back.entries[0].name, 'x/y.xml');
  assert.equal(zlib.inflateRawSync(Buffer.from(back.entries[0].data)).toString('utf8'), sample.toString('utf8'));
});

// await 是必要的。原本寫 fn()，非同步的測試函式回一個 promise 就被當成通過，斷言
// 失敗變成 unhandled rejection，整支測試照樣印綠色。這個檔案是 ESM，頂層 await 可以
// 直接用。2026-08 在 test_qrread.mjs 先踩到一次，這裡是把同一個缺陷補齊。
for (const [name, fn] of tests) {
  try {
    await fn();
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
