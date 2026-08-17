#!/usr/bin/env node
/**
 * 把「互動與呈現」三件作品截成說明頁要用的圖。
 *
 * === 為什麼需要一支腳本 ===
 *
 * 三件作品都是 three.js 的 WebGPU 場景，畫面隨資料變。地球儀的中繼快照每小時換一次，
 * 手動截的圖幾個月後就跟站上對不起來。做成腳本才有辦法在資料換季或改版之後整批重截，
 * 一次十二張，不用一張一張對著螢幕按。
 *
 * === headless 要走硬體 Vulkan，不然 canvas 是黑的 ===
 *
 * 預設起 headless Chrome 只拿得到 SwiftShader，WebGPU 的 swapchain 建不出來，
 * 錯誤是 SharedImageBackingFactory 找不到，畫面上 HTML 介面正常但 canvas 整片黑。
 * 加上 CHROME_FLAGS 那一組才會走到 Mesa 的 intel_icd，也就是真正的顯示卡。
 * 這台機器要能讀 /dev/dri/renderD128，通常靠 ACL 給的權限，不在 render 群組也可以。
 *
 * CI 沒有顯示卡，所以這支不進 CI，是本機工具。tools/check_focus.mjs 的註解記過同一件事。
 *
 * === 不能用 --screenshot 配 --virtual-time-budget ===
 *
 * 那個組合會把時鐘快轉，地球儀的 JSON 還沒抓完就被截走，圖上停在「載入中…」。
 * 所以改用 CDP：導頁、輪詢 ready 判斷式、跑完 actions、等 settle、才 captureScreenshot。
 *
 * 用法：
 *   node tools/shoot_games.mjs                 # 全部重截
 *   node tools/shoot_games.mjs tor-network     # 只截名稱含這段字的
 *   node tools/shoot_games.mjs --no-webp       # 只留 PNG
 *
 * 產物在 tools/.shots/，PNG 與 WebP 各一份。確認過畫面才發布：
 *   rsync -av tools/.shots/*.webp m6_tailscale:/srv/images-anoni-net/games/
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', 'docs', 'zh-TW');   // 作品本體只有這一棵樹有
const OUT = path.join(HERE, '.shots');
const PORT_CDP = 9455;
const SCALE = 2;                                        // 輸出兩倍圖，站上再縮
const W = 1280, H = 720;                                // 16:9，縮圖與 OG 都好排

const args = process.argv.slice(2);
const NO_WEBP = args.includes('--no-webp');
const ONLY = args.filter((a) => !a.startsWith('--'));

/**
 * 一張圖的規格。
 *   ready    輪詢到回 true 才往下走。地球儀要等資料載完，其餘作品開場即可
 *   reduced  模擬 prefers-reduced-motion。onion-routing 閒置 6 秒會自轉，
 *            開了才不會每次截到不同角度。另外兩件靠它撐畫面，不能開
 *   actions  ['sel', 選擇器] 點 DOM、['xy', x, y] 點畫布、['eval', 程式碼]、['wait', 毫秒]
 *   settle   動作跑完再等幾毫秒，讓動畫走到好看的狀態
 */
// 送出訊息之後電路動畫跑 3.2 秒，再 0.45 秒才彈出教學卡，等 5 秒穩妥
const SEND_NEXT = [['sel', '#btn-send'], ['wait', 5000], ['sel', '#btn-next'], ['wait', 1500]];
const PASS_L1 = [['xy', 485, 274], ['xy', 586, 466], ['xy', 816, 385], ...SEND_NEXT];
const PASS_L2 = [['xy', 459, 300], ['xy', 669, 276], ['xy', 879, 322], ...SEND_NEXT];
const PASS_L3 = [['xy', 435, 276], ['xy', 854, 295], ['xy', 958, 432], ...SEND_NEXT];

const GAME = '/games/onion-routing/play/index.html';
const GLOBE = '/games/tor-network/play/index.html';
const GLOBE_READY = `!!document.querySelector('#loading.done')`;

const SHOTS = [
  // ── Tor 路由解謎 ──
  // 節點座標寫死在 levels.js，相機初始角度固定，所以畫布上的位置每次都一樣。
  // 這裡的 xy 是量出來的，關卡定義改了要重量。閒置 6 秒會自轉，所以要開 reduced。
  {
    nm: 'onion-routing-board', url: GAME, reduced: true,
    actions: [['sel', '#hint-close']], settle: 2500,
  },
  {
    nm: 'onion-routing-path', url: GAME, reduced: true,
    actions: [['sel', '#hint-close'],
              ['xy', 485, 274],    // TW AS3462
              ['xy', 586, 466],    // JP AS2914
              ['xy', 816, 385],    // NL AS16276
              ['wait', 800]],
    settle: 2500,
  },
  {
    // 三跳全挑台灣那三台，送出時會擋下來。validate 不過就不播動畫，訊息直接進 #feedback
    nm: 'onion-routing-asn', url: GAME, reduced: true,
    actions: [['sel', '#hint-close'], ...PASS_L1, ...PASS_L2,
              ['xy', 435, 276], ['xy', 514, 470], ['xy', 612, 244],
              ['sel', '#btn-send'], ['wait', 1200]],
    settle: 1500,
  },
  {
    nm: 'onion-routing-bridge', url: GAME, reduced: true,
    actions: [['sel', '#hint-close'], ...PASS_L1, ...PASS_L2, ...PASS_L3],
    settle: 2500,
  },

  // ── Tor 連線流量 ──
  // 粒子與殘影是這件作品的主體，不能開 reduced，等久一點讓電路鋪滿畫面
  {
    nm: 'onion-rendezvous-flow', url: '/games/onion-rendezvous/play/index.html',
    actions: [['sel', '#hint-close']], settle: 12000,
  },

  // ── Tor 中繼地球儀 ──
  {
    nm: 'tor-network-globe', url: GLOBE, ready: GLOBE_READY,
    actions: [['sel', '#hint-close']], settle: 9000,
  },
  {
    // 陸地亮度換成共識權重，台數多與實際扛流量多是兩件事
    nm: 'tor-network-weight', url: GLOBE, ready: GLOBE_READY,
    actions: [['sel', '#hint-close'], ['wait', 6000], ['sel', '#mode-weight']], settle: 4000,
  },
  {
    // 國家卡。標籤是 #labels 裡的 div，帶 data-cc，不用點球面
    nm: 'tor-network-country', url: GLOBE, ready: GLOBE_READY,
    actions: [['sel', '#hint-close'], ['wait', 6000], ['sel', '#labels [data-cc="de"]']], settle: 3000,
  },
  {
    nm: 'tor-network-taiwan', url: GLOBE + '#tw', ready: GLOBE_READY,
    actions: [['sel', '#hint-close']], settle: 13000,
  },
  {
    // 用電切成工業用電佔比，新竹會跳到第一。那個切換改的是左欄的長條，
    // 不是地圖，所以要把面板捲到台灣那一區再截
    nm: 'tor-network-industry', url: GLOBE + '#tw', ready: GLOBE_READY,
    actions: [['sel', '#hint-close'], ['wait', 10000], ['sel', '#use-ind'],
              ['eval', `document.getElementById('lbl-energy').scrollIntoView({ block: 'center' })`]],
    settle: 3000,
  },
];

if (!fs.existsSync(ROOT)) { console.error(`找不到 ${ROOT}`); process.exit(1); }
try { execFileSync('bash', ['-c', 'command -v google-chrome'], { stdio: 'ignore' }); }
catch { console.error('找不到 google-chrome'); process.exit(1); }

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json',
               '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const f = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;

// GPU sandbox 要關掉，Vulkan 的 device 才起得來
const CHROME_FLAGS = ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
  '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=vulkan', '--enable-features=Vulkan',
  '--disable-gpu-sandbox', '--enable-unsafe-webgpu', '--hide-scrollbars'];

const prof = fs.mkdtempSync('/tmp/shoot-games-');
const chrome = spawn('google-chrome', [...CHROME_FLAGS, `--remote-debugging-port=${PORT_CDP}`,
  `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
// profile 目錄留給 /tmp 自己清。exit handler 是同步的，這時 Chrome 還在寫檔，
// rmSync 會撞 ENOTEMPTY 把整支腳本的離開碼蓋掉，得不償失。
const bye = () => { try { chrome.kill(); } catch {} try { srv.close(); } catch {} };
process.on('exit', bye);

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT_CDP}/json/list`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await new Promise((r) => setTimeout(r, 250));
}
if (!wsUrl) { console.error('Chrome 沒起來'); process.exit(1); }

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pend = new Map(); let errs = [];
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception?.description || '').slice(0, 160));
});
const send = (me, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: p })); });
const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Runtime.enable'); await send('Page.enable');
fs.mkdirSync(OUT, { recursive: true });

/** 點畫布。作品聽的是 pointerdown，CDP 的 mouse 事件會一併產生 pointer 事件 */
async function clickXY(x, y) {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 });
    await sleep(40);
  }
}

const todo = SHOTS.filter((s) => !ONLY.length || ONLY.some((o) => s.nm.includes(o)));
if (!todo.length) { console.error(`沒有符合 ${ONLY.join(', ')} 的項目`); process.exit(1); }

let bad = 0;
for (const s of todo) {
  const t0 = Date.now(); errs = [];
  await send('Emulation.setEmulatedMedia', s.reduced
    ? { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] } : { features: [] });
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false });
  // 同一個網址只有 hash 不同時 navigate 不會重載，先清掉再導
  await send('Page.navigate', { url: 'about:blank' });
  await sleep(200);
  await send('Page.navigate', { url: base + s.url });
  await sleep(1500);

  let ok = true;
  if (s.ready) {
    ok = false;
    for (let i = 0; i < 240 && !ok; i++) { ok = await ev(s.ready); if (!ok) await sleep(500); }
  }
  if (!ok) { console.log(`✗ ${s.nm}：等不到就緒`); bad++; continue; }

  for (const [kind, a, b] of (s.actions || [])) {
    if (kind === 'sel') await ev(`document.querySelector(${JSON.stringify(a)})?.click()`);
    else if (kind === 'eval') await ev(a);
    else if (kind === 'xy') await clickXY(a, b);
    else if (kind === 'wait') await sleep(a);
    await sleep(150);
  }
  await sleep(s.settle ?? 3000);

  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  const png = path.join(OUT, `${s.nm}.png`);
  fs.writeFileSync(png, Buffer.from(data, 'base64'));
  let note = `${(fs.statSync(png).size / 1024).toFixed(0)} KB`;
  if (!NO_WEBP) {
    const webp = png.replace(/\.png$/, '.webp');
    try {
      execFileSync('cwebp', ['-quiet', '-q', '82', png, '-o', webp]);
      note += ` → webp ${(fs.statSync(webp).size / 1024).toFixed(0)} KB`;
    } catch { note += '（cwebp 失敗，只留 PNG）'; }
  }
  console.log(`✓ ${s.nm.padEnd(26)} ${note}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (errs.length) console.log(`  ⚠ 頁面丟出例外：${errs[0]}`);
}

ws.close();
console.log(`\n產物在 ${path.relative(process.cwd(), OUT)}/，看過畫面再發布：`);
console.log('  rsync -av tools/.shots/*.webp m6_tailscale:/srv/images-anoni-net/games/');
process.exit(bad ? 1 : 0);
