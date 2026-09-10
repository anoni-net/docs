#!/usr/bin/env node
/**
 * 截圖遮蔽的臉部偵測，在幾種合成場景上的召回與誤判。
 *
 * === 為什麼需要這支 ===
 *
 * tools/test_redact.mjs 守的是「參數有沒有被改掉」，那擋得住有人把數字調回去，
 * 擋不住「換了偵測器」或「改了縮放邏輯」之後召回悄悄變差。而偵測變差不會有任何
 * 徵兆：讀者按下去看到幾個框，不會知道少了幾個。
 *
 * 這一區放的是隱私工具。漏掉一張臉的代價是那張臉跟著圖送出去。
 *
 * 訂參數的時候踩過三次，每一次都是因為驗證用的樣張太順：
 *
 *   - 只用一張 480x360、四張大臉的樣張調參數，結果人多就漏一半
 *     （同一張人多的圖，改之前 32 處，改之後 64 處）
 *   - 沒有考慮戴眼鏡。實測細框讓分數掉一半，粗框與墨鏡直接崩掉
 *   - 沒有考慮街拍那種「同一張照片裡有近有遠」，遠的那些全部低於最小尺寸
 *
 * 所以這裡把三種真實照片的結構固定下來：人多且臉小、大小差很多、頭是歪的、
 * 背景雜亂、遠景模糊。都是合成的，不放任何真人照片進 repo。
 *
 * === 怎麼驗 ===
 *
 * 用專案自己 vendor 的 pico 與級聯檔，在 headless Chrome 裡跑站上那一套流程
 * （縮到 maxSide、灰階、run_cascade、分群、過門檻），參數從 redact.js 原地讀，
 * 不重寫一份。每個場景訂一個召回下限與一個誤判上限。
 *
 * 門檻訂得比實測值寬鬆一點，留給不同 Chrome 版本的浮點差異。真正要擋的是
 * 「掉一大截」，不是一兩個的波動。
 *
 * 用法：
 *   node tools/check_redact_detect.mjs
 * 需要一顆 Chrome。不需要建置產物。
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs', 'zh-TW');
const VENDOR = path.join(DOCS, 'utils', 'vendor', 'pico');
const SRC = path.join(DOCS, 'js', 'redact.js');

// 參數從 redact.js 原地讀，不在這裡抄一份
const src = fs.readFileSync(SRC, 'utf8');
const detectBlock = src.match(/const DETECT = \{[\s\S]*?\n {2}\};/);
if (!detectBlock) {
  console.error('redact.js 裡找不到 DETECT');
  process.exit(1);
}
const DETECT = new Function(`${detectBlock[0]}\n return DETECT;`)();

// 場景與它們的底線。truth 是放進去的張數。
//
// minRecall 訂在實測值往下留一點餘裕，maxExtra 是容許多框幾個。多框的代價是
// 讀者按一下刪掉，漏抓的代價是那張臉送出去，所以兩邊不對稱。
const SCENES = [
  { key: 'plain', label: '乾淨樣張', truth: 4, minRecall: 4, maxExtra: 0 },
  { key: 'crowd', label: '人多、臉小', truth: 64, minRecall: 58, maxExtra: 4 },
  { key: 'street', label: '街拍、大小差很多', truth: 21, minRecall: 18, maxExtra: 3 },
  { key: 'streetTilt', label: '街拍、頭傾斜', truth: 21, minRecall: 16, maxExtra: 3 },
  { key: 'streetBlur', label: '街拍、傾斜加遠景模糊', truth: 21, minRecall: 14, maxExtra: 3 },
];

const MIME = {
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.html': 'text/html',
  '': 'application/octet-stream',
};

// 樣張用 picojs 專案自己的範例圖。repo 裡不放它，執行時從本機快取或網路取得。
const SAMPLE = path.join(HERE, '..', '.cache', 'picojs-sample.jpg');
const SAMPLE_URL =
  'https://raw.githubusercontent.com/nenadmarkus/picojs/master/examples/img.jpg';

async function ensureSample() {
  if (fs.existsSync(SAMPLE)) return true;
  fs.mkdirSync(path.dirname(SAMPLE), { recursive: true });
  try {
    const response = await fetch(SAMPLE_URL);
    if (!response.ok) return false;
    fs.writeFileSync(SAMPLE, Buffer.from(await response.arrayBuffer()));
    return true;
  } catch (err) {
    return false;
  }
}

if (!(await ensureSample())) {
  // 沒有網路就跳過而不是紅燈。這一支驗的是偵測品質，拿不到樣張時它什麼都沒驗到，
  // 假裝通過跟報錯都不對，講清楚並以成功結束，CI 上網路是正常的。
  console.log('  拿不到樣張（picojs 的 examples/img.jpg），這一輪跳過');
  process.exit(0);
}

const files = {
  '/pico.js': fs.readFileSync(path.join(VENDOR, 'pico.js')),
  '/facefinder': fs.readFileSync(path.join(VENDOR, 'facefinder')),
  '/img.jpg': fs.readFileSync(SAMPLE),
  '/index.html': Buffer.from('<!doctype html><meta charset=utf-8><script src="/pico.js"></script>'),
};

const server = http.createServer((req, res) => {
  const requested = decodeURIComponent(req.url.split('?')[0]);
  // 副檔名要看實際送出去的那個檔案。根路徑沒有副檔名，照請求路徑判斷會變成
  // application/octet-stream，瀏覽器就下載而不是算繪，頁面裡的 script 也不會執行。
  const key = requested === '/' ? '/index.html' : requested;
  const body = files[key];
  if (!body) {
    res.writeHead(404);
    return res.end('404');
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(key)] || MIME[''] });
  res.end(body);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const port = 9200 + Math.floor(Math.random() * 300);
const profile = fs.mkdtempSync('/tmp/anoni-redact-check-');
const chrome = spawn(
  'google-chrome',
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);
const bye = () => {
  try { chrome.kill(); } catch (err) { /* 已經結束 */ }
  try { server.close(); } catch (err) { /* 已經關了 */ }
};
process.on('exit', bye);

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i += 1) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find((x) => x.type === 'page')?.webSocketDebuggerUrl;
  } catch (err) { /* 還沒起來 */ }
  if (!wsUrl) await new Promise((resolve) => setTimeout(resolve, 250));
}
if (!wsUrl) {
  console.error('Chrome 沒起來');
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (message) => {
  const data = JSON.parse(message.data);
  if (data.id && pending.has(data.id)) {
    pending.get(data.id)(data);
    pending.delete(data.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params }));
  });
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.result?.exceptionDetails) {
    throw new Error(JSON.stringify(result.result.exceptionDetails).slice(0, 300));
  }
  return result.result?.result?.value;
};

await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url: base + '/' });
await new Promise((resolve) => setTimeout(resolve, 900));

const counts = await evaluate(`(async () => {
  const cascade = pico.unpack_cascade(new Uint8Array(await (await fetch('/facefinder')).arrayBuffer()));
  const img = new Image();
  img.src = '/img.jpg';
  await img.decode();
  const DETECT = ${JSON.stringify(DETECT)};

  const grayscale = (canvas) => {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const gray = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < gray.length; i += 1) {
      const at = i * 4;
      gray[i] = (data[at] * 0.299 + data[at + 1] * 0.587 + data[at + 2] * 0.114) | 0;
    }
    return { pixels: gray, nrows: canvas.height, ncols: canvas.width, ldim: canvas.width };
  };

  // 站上那一套流程：先縮到 maxSide，再偵測、分群、過門檻
  const detect = (canvas) => {
    const longest = Math.max(canvas.width, canvas.height);
    let work = canvas;
    if (longest > DETECT.maxSide) {
      const ratio = DETECT.maxSide / longest;
      work = document.createElement('canvas');
      work.width = Math.round(canvas.width * ratio);
      work.height = Math.round(canvas.height * ratio);
      work.getContext('2d').drawImage(canvas, 0, 0, work.width, work.height);
    }
    const raw = pico.run_cascade(grayscale(work), cascade, {
      shiftfactor: DETECT.shiftFactor,
      minsize: DETECT.minSize,
      maxsize: Math.max(work.width, work.height),
      scalefactor: DETECT.scaleFactor,
    });
    return pico.cluster_detections(raw, DETECT.iou).filter((d) => d[3] > DETECT.minQuality).length;
  };

  const plain = document.createElement('canvas');
  plain.width = img.naturalWidth;
  plain.height = img.naturalHeight;
  plain.getContext('2d').drawImage(img, 0, 0);

  // 樣張上的臉，當成拼場景的素材
  const faces = pico
    .cluster_detections(pico.run_cascade(grayscale(plain), cascade,
      { shiftfactor: 0.1, minsize: 40, maxsize: 1000, scalefactor: 1.1 }), 0.2)
    .filter((d) => d[3] > 40);

  const tile = (tiles, width) => {
    const canvas = document.createElement('canvas');
    const cell = Math.round(width / tiles);
    const cellH = Math.round(cell * img.naturalHeight / img.naturalWidth);
    canvas.width = cell * tiles;
    canvas.height = cellH * tiles;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < tiles; y += 1) {
      for (let x = 0; x < tiles; x += 1) ctx.drawImage(img, x * cell, y * cellH, cell, cellH);
    }
    return canvas;
  };

  // 街拍：雜亂背景，臉的大小從 44 到 260，可選傾斜與遠景模糊。
  // 亂數是固定種子的，同一次執行與下一次執行拼出來的是同一張圖。
  const street = ({ count, tilt, blur }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 2000;
    const ctx = canvas.getContext('2d');
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    ctx.fillStyle = '#8a8f96';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 400; i += 1) {
      ctx.fillStyle = 'rgba(' + (rnd() * 255 | 0) + ',' + (rnd() * 255 | 0) + ',' + (rnd() * 255 | 0) + ',0.35)';
      ctx.fillRect(rnd() * canvas.width, rnd() * canvas.height, 20 + rnd() * 180, 15 + rnd() * 140);
    }
    for (let i = 0; i < 120; i += 1) {
      ctx.strokeStyle = 'rgba(30,30,30,0.5)';
      ctx.lineWidth = 1 + rnd() * 3;
      ctx.beginPath();
      ctx.moveTo(rnd() * canvas.width, rnd() * canvas.height);
      ctx.lineTo(rnd() * canvas.width, rnd() * canvas.height);
      ctx.stroke();
    }
    const sizes = [260, 180, 120, 90, 70, 56, 44];
    for (let i = 0; i < count; i += 1) {
      const face = faces[i % faces.length];
      const size = face[2];
      const crop = document.createElement('canvas');
      crop.width = Math.round(size * 1.6);
      crop.height = Math.round(size * 1.6);
      crop.getContext('2d').drawImage(plain, face[1] - size * 0.8, face[0] - size * 0.8,
        size * 1.6, size * 1.6, 0, 0, crop.width, crop.height);
      const target = sizes[i % sizes.length];
      const deg = tilt ? (rnd() * 2 - 1) * tilt : 0;
      const x = 120 + rnd() * (canvas.width - 320);
      const y = 120 + rnd() * (canvas.height - 320);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(deg * Math.PI / 180);
      if (blur && target < 90) ctx.filter = 'blur(' + blur + 'px)';
      ctx.drawImage(crop, -target * 0.8, -target * 0.8, target * 1.6, target * 1.6);
      ctx.restore();
      ctx.filter = 'none';
    }
    return canvas;
  };

  return {
    plain: detect(plain),
    crowd: detect(tile(4, 3200)),
    street: detect(street({ count: 21, tilt: 0, blur: 0 })),
    streetTilt: detect(street({ count: 21, tilt: 25, blur: 0 })),
    streetBlur: detect(street({ count: 21, tilt: 25, blur: 2 })),
  };
})()`);

let failed = 0;
console.log(`  參數：maxSide ${DETECT.maxSide}、minSize ${DETECT.minSize}、minQuality ${DETECT.minQuality}\n`);
for (const scene of SCENES) {
  const got = counts[scene.key];
  const tooFew = got < scene.minRecall;
  const tooMany = got > scene.truth + scene.maxExtra;
  const ok = !tooFew && !tooMany;
  if (!ok) failed += 1;
  const why = tooFew ? `低於下限 ${scene.minRecall}` : tooMany ? `超出上限 ${scene.truth + scene.maxExtra}` : '';
  console.log(
    `  ${ok ? '✓' : '✗'} ${scene.label.padEnd(22)} 實際 ${String(scene.truth).padStart(2)} 張，` +
      `框出 ${String(got).padStart(2)} 個${why ? '  ← ' + why : ''}`
  );
}

console.log(failed ? `\n${failed} 個場景沒過` : '\n每個場景都在範圍內');
process.exit(failed ? 1 : 0);
