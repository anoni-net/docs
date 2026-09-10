#!/usr/bin/env node
/**
 * 截圖遮蔽（docs/zh-TW/js/redact.js）在真的瀏覽器裡走完一遍。
 *
 * === 為什麼需要這支 ===
 *
 * tools/test_redact.mjs 掃的是原始碼與字串，擋得住「有人把候選框改回直接填黑」，
 * 擋不住「畫面上根本沒畫出來」或「點擊接到別的元素」。這一頁最壞的失敗是讀者看
 * 著一張自以為遮好的圖按下下載，而那種失敗在單元測試裡是全綠的。
 *
 * 這一輪修的東西正好全部落在單元測試碰不到的地方：偵測完是空心框還是實心黑、
 * 點一下有沒有移掉那一個、候選框還在的時候產生按鈕是不是真的按不下去、按下
 * 「全部遮起來」之後畫布上還有沒有藍線。所以要真的開一個瀏覽器來看像素。
 *
 * === 怎麼驗 ===
 *
 * 建置好的 zh-TW 站台用本機 http 伺服器端出來，headless Chrome 開到 utils/redact，
 * 用手機尺寸（390x844，dpr 2）。把樣張塞進 file input，然後照讀者的順序按下去，
 * 每一步都直接讀 canvas 的像素，不看文案就下結論：
 *
 *   - 按下自動找出人臉之後，臉的位置不可以是純黑，而畫面上要有藍色的線
 *   - 產生遮好的圖要是停用的
 *   - 點一下某一張臉，狀態要從四個變三個
 *   - 按下全部遮起來，藍色像素要歸零，留下的臉要變成純黑，被點掉的那一張不可以黑
 *   - 產生出來的結果要說 3 處，也就是點掉的那一張真的沒有被算進去
 *
 * 需要建置產物（docs/output）與 .cache 裡的樣張，兩者缺一就跳過，所以沒有進 CI。
 * 改過 redact.js 的介面之後在本機跑一次。
 *
 * 用法：
 *   cd docs && source .venv/bin/activate && bash run.sh   # 先建置
 *   node tools/check_redact_ui.mjs
 * 需要一顆 Chrome。
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'docs', 'output');
const SAMPLE = path.join(HERE, '..', '.cache', 'picojs-sample.jpg');
const PAGE = path.join(OUT, 'utils', 'redact', 'index.html');

if (!fs.existsSync(PAGE)) {
  console.log('  沒有建置產物（docs/output），這一輪跳過');
  console.log('  先執行：cd docs && source .venv/bin/activate && bash run.sh');
  process.exit(0);
}
if (!fs.existsSync(SAMPLE)) {
  console.log('  拿不到樣張（.cache/picojs-sample.jpg），這一輪跳過');
  console.log('  先執行一次 node tools/check_redact_detect.mjs 把它抓下來');
  process.exit(0);
}

// 樣張上四張臉的座標，check_redact_detect 量出來的。圖是 480x360，小於處理上限，
// 所以影像座標與畫布座標一比一。
const FACE_TAP = { x: 295, y: 191 };
const FACE_KEEP = { x: 168, y: 150 };

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
};
const port = 9700 + Math.floor(Math.random() * 200);
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(OUT, rel);
  if (!file.startsWith(OUT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  // MIME 從解出來的檔案算，不要從請求路徑算：目錄請求的副檔名是空的，
  // 猜成 octet-stream 的話瀏覽器會把頁面下載掉而不是算繪出來
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const profile = fs.mkdtempSync(path.join('/tmp', 'redact-ui-'));
const chrome = spawn('google-chrome', [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });
let wsUrl = null;
await new Promise((resolve) => {
  chrome.stderr.on('data', (chunk) => {
    const found = String(chunk).match(/ws:\/\/[^\s]+/);
    if (found && !wsUrl) {
      wsUrl = found[0];
      resolve();
    }
  });
  setTimeout(resolve, 15000);
});
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
const call = (method, params = {}, sessionId) =>
  new Promise((resolve) => {
    const next = ++id;
    pending.set(next, resolve);
    ws.send(JSON.stringify({ id: next, method, params, sessionId }));
  });

const target = await call('Target.createTarget', { url: 'about:blank' });
const attached = await call('Target.attachToTarget', {
  targetId: target.result.targetId, flatten: true,
});
const sessionId = attached.result.sessionId;
const send = (method, params) => call(method, params, sessionId);
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  });
  if (result.result?.exceptionDetails) {
    throw new Error(JSON.stringify(result.result.exceptionDetails).slice(0, 400));
  }
  return result.result?.result?.value;
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await send('Runtime.enable');
await send('Page.enable');
await send('DOM.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
});
await send('Page.navigate', { url: `http://127.0.0.1:${port}/utils/redact/` });
await wait(2500);

const doc = await send('DOM.getDocument');
const input = await send('DOM.querySelector', {
  nodeId: doc.result.root.nodeId, selector: '#redact-tool input[type="file"]',
});
await send('DOM.setFileInputFiles', { files: [SAMPLE], nodeId: input.result.nodeId });
await wait(1500);

// var 而不是 const：每個 Runtime.evaluate 共用同一個全域環境，const 會重複宣告。
// statusOf 也不叫 status，那個名字在 window 上已經被佔走了。
const helpers = `
  var btn = (re) => [...document.querySelectorAll('#redact-tool button')]
    .find((node) => re.test(node.textContent));
  var cv = document.querySelector('#redact-tool canvas');
  var px = (x, y) => {
    const data = cv.getContext('2d').getImageData(x, y, 1, 1).data;
    return [data[0], data[1], data[2]].join();
  };
  var bluePixels = () => {
    const data = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 110 && data[i + 1] > 120 && data[i + 2] > 200) n += 1;
    }
    return n;
  };
  var statusOf = () => [...document.querySelectorAll('#redact-tool .rd-status, #redact-tool .rd-note')]
    .map((node) => node.textContent).join(' | ');
`;

let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed += 1;
};

check(await evaluate(`${helpers} !!cv`), '圖載進來，畫布出現');

await evaluate(`${helpers} btn(/自動找出人臉|自动找出人脸|Find faces/).click(); true`);
await wait(4000);
const found = await evaluate(`${helpers} ({
  blue: bluePixels(),
  face: px(${FACE_TAP.x}, ${FACE_TAP.y}),
  status: statusOf(),
  makeDisabled: btn(/產生遮好的圖/).disabled,
  hasCover: !!btn(/全部遮起來/),
})`);
check(found.blue > 0, '偵測完畫面上有藍色的空心框');
check(found.face !== '0,0,0', '偵測完臉還沒有被塗黑');
check(/還沒有遮住/.test(found.status), '狀態講明還沒有遮住任何東西');
check(found.makeDisabled === true, '候選框還在的時候產生遮好的圖是停用的');
check(found.hasCover === true, '出現全部遮起來這顆按鈕');

const afterTap = await evaluate(`${helpers}
  (() => {
    const rect = cv.getBoundingClientRect();
    const clientX = rect.left + ${FACE_TAP.x} * rect.width / cv.width;
    const clientY = rect.top + ${FACE_TAP.y} * rect.height / cv.height;
    for (const type of ['pointerdown', 'pointerup']) {
      cv.dispatchEvent(new PointerEvent(type, {
        pointerId: 7, clientX, clientY, bubbles: true, cancelable: true,
      }));
    }
    return statusOf();
  })()`);
await wait(400);
check(/還有 3 個藍框沒有決定/.test(afterTap), '點一下移掉一個候選框，四個剩三個');

// 少了這顆按鈕代表偵測又變回直接塗黑。上面幾條已經紅了，這裡收乾淨就好，
// 不要用堆疊追蹤把真正的失敗蓋掉。
if (!found.hasCover) {
  console.log('\n  沒有全部遮起來這顆按鈕，後面幾步跳過');
  console.log(`\n${failed} 項沒過`);
  chrome.kill();
  server.close();
  process.exit(1);
}

await evaluate(`${helpers} btn(/全部遮起來/).click(); true`);
await wait(600);
const covered = await evaluate(`${helpers} ({
  blue: bluePixels(),
  keep: px(${FACE_KEEP.x}, ${FACE_KEEP.y}),
  tapped: px(${FACE_TAP.x}, ${FACE_TAP.y}),
  makeDisabled: btn(/產生遮好的圖/).disabled,
})`);
check(covered.blue === 0, '遮完畫布上一個藍色像素都不剩');
check(covered.keep === '0,0,0', '留下的候選框變成純黑');
check(covered.tapped !== '0,0,0', '點掉的那一張沒有被遮');
check(covered.makeDisabled === false, '候選框清空之後產生遮好的圖可以按');

await evaluate(`${helpers} btn(/產生遮好的圖/).click(); true`);
await wait(5000);
const done = await evaluate(`(() => {
  const link = document.querySelector('#redact-tool a.rd-dl');
  const result = document.querySelector('#redact-tool .rd-result');
  return { name: link && link.download, text: result ? result.textContent : '' };
})()`);
check(done.name === 'redacted.jpg' || done.name === 'redacted.png', '輸出檔名固定，不帶原檔名');
check(/3 處都是純黑/.test(done.text), '驗證訊息說 3 處，點掉的那一張沒有被算進去');

console.log(failed ? `\n${failed} 項沒過` : '\n每一步都對');
chrome.kill();
server.close();
process.exit(failed ? 1 : 0);
