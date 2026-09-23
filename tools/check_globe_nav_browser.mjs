#!/usr/bin/env node
/**
 * 地球儀的拖曳、縮放、捏合與滑行，在真的頁面上驗一次。
 *
 * tools/check_globe_nav.mjs 驗的是算法：解算器、時間常數、滑行速度的估計，配的是
 * 一個自己寫的相機替身。那支驗不到接線，而這次最容易壞的就是接線：錨點要在相機
 * 這一幀定位之後才解，camera.matrixWorld 要先更新，updateFov 換鏡頭之後才解，順序
 * 錯了算法照樣全對，畫面上那一點卻會慢一幀或偏一截。
 *
 * 所以這支開 headless Chrome 把作品載起來，用 ?debug 掛上的 window.__atlas 取螢幕位置
 * 底下的那一點地表，送真的滑鼠與觸控事件，再把那一點投影回螢幕量它離游標多遠。
 *
 *   滾輪以游標為中心      遠看與貼近各一次，放大四格
 *   拖曳 1:1              抓住的那一點留在游標底下
 *   停住再放開不滑         最後一次移動之後停 1.5 秒
 *   甩開有滑行             時間戳照 60 Hz 給，方向跟拖曳一致
 *   雙指捏合               倍率精確、兩指中點底下那一點不動、放開不殘留滑行
 *
 * 先按一下太空背景停掉開場的自轉。沒停的話，取點與滾輪之間地球又轉了一段，量到的
 * 那一點跟滾輪真正抓的那一點不同，差距還會隨放大倍率等比放大，看起來像錨點漂了。
 * 按的位置要避開左側面板，面板上的事件被 onUI 排除，按了等於沒按。
 *
 * 事件的時間戳：軟體 GPU 一幀要幾百毫秒，CDP 每送一個事件都要等主執行緒處理完才
 * 回應，不指定時間戳的話事件之間的間隔會被拉長到幾百毫秒，量到的是這台測試機而
 * 不是手勢，甩開那一項會被判成「停住之後才放開」。所以那一項明確帶 timestamp。
 *
 * 沒有 google-chrome 或 WebGPU 起不來就跳過並回 0，理由跟 check_layers_toggle.mjs 相同。
 *
 * 用法：node tools/check_globe_nav_browser.mjs
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', 'docs', 'zh-TW');
const PAGE = '/games/tor-network/play/';

try { execSync('command -v google-chrome', { stdio: 'ignore' }); }
catch { console.log('  找不到 google-chrome，跳過地球儀手感的真機檢查'); process.exit(0); }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
};
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end();
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;

const prof = fs.mkdtempSync('/tmp/globe-nav-');
// WebGPU 在沒有顯示卡的機器上仍然初始化得起來，畫面是空的但場景圖與 GPU 資源
// 照樣建，這支要驗的就是那一層，不需要真的看到像素。
// 除錯埠讓 Chrome 自己挑。寫死一個號碼的話，同一台機器上兩個實例會撞在一起，
// 第二個連到第一個的頁面，檢查讀到的是別人的畫面而且看起來完全正常。
// 實際用的號碼在 profile 目錄的 DevToolsActivePort，第一行就是。
const chrome = spawn('google-chrome', ['--headless=new', '--remote-debugging-port=0',
  `--user-data-dir=${prof}`, '--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-webgpu',
  '--enable-features=Vulkan', '--use-angle=vulkan',
  // 沒有顯示卡的機器靠 SwiftShader 走軟體路徑。CI 的 runner 就是那種，少了這個
  // WebGPU 起不來，整支只能跳過。
  '--enable-unsafe-swiftshader', '--use-webgpu-adapter=swiftshader',
  '--window-size=1280,900', 'about:blank'],
  { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const bye = (code) => { try { ws && ws.close(); } catch {} chrome.kill(); srv.close(); process.exit(code); };

const portFile = path.join(prof, 'DevToolsActivePort');
let cdp = 0, wsUrl;
for (let i = 0; i < 60 && !cdp; i++) {
  await sleep(250);
  try { cdp = parseInt(fs.readFileSync(portFile, 'utf8').split('\n')[0], 10) || 0; } catch {}
}
for (let i = 0; i < 60 && cdp && !wsUrl; i++) {
  await sleep(250);
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${cdp}/json/list`)).json())
      .find((x) => x.type === 'page')?.webSocketDebuggerUrl;
  } catch {}
}
if (!wsUrl) { console.error('Chrome 沒起來'); bye(1); }

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pend = new Map();
const errs = [];
// 收尾時的雜訊。SwiftShader 那條路上，Chrome 要關的時候 WebGPU 的 device 會被
// 回收，接著噴一批 device lost 與 popErrorScope。跑在有顯示卡的機器上看不到，
// 在 CI 上整批出現，把 102 項全過的那一輪判成紅燈。
const NOISE = /WebGPU Device Lost|Instance dropped in popErrorScope/;
let collecting = true;
const note = (line) => { if (collecting && !NOISE.test(line)) errs.push(line); };
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
    note(d.params.args.map((a) => a.value || a.description || '').join(' '));
  }
  if (d.method === 'Runtime.exceptionThrown') {
    const x = d.params.exceptionDetails;
    note('未捕捉例外: ' + (x.exception?.description || x.text));
  }
});
const send = (method, params = {}) => new Promise((r) => {
  const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params }));
});
const ev = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;

await send('Runtime.enable');
await send('Page.enable');

/**
 * 導頁並等作品載完。
 *
 * 先清成空白頁再導過去。Page.navigate 本身不等頁面換掉，接著問 #loading.done
 * 問到的是上一輪那個頁面，而它的答案是 true，於是後面整串檢查都在讀舊畫面。
 * 第一次寫成直接導，網址參數那兩項就是這樣假性失敗的。
 */
async function goto(url, tries = 2) {
  for (let t = 0; t < tries; t++) {
    if (await once(url)) return true;
  }
  return false;
}

async function once(url) {
  await send('Page.navigate', { url: 'about:blank' });
  await sleep(400);
  await send('Page.navigate', { url });
  // 兩段分開等。網址還沒換過去就開始問 #loading.done 的話，問到的是空白頁，
  // 答案永遠是 false，六十秒之後才放棄並往下讀一張空畫面。
  const base = url.split('?')[0];
  let there = false;
  for (let i = 0; i < 80 && !there; i++) {
    await sleep(100);
    const href = await ev(`location.href`);
    there = !!href && href.startsWith(base);
  }
  if (!there) return false;
  // 導完了但作品沒跑起來的時候重試一次。同一顆 Chrome 連續導頁偶爾會讓其中一次
  // 卡在載入，重來一次就過，而卡住的那次畫面上什麼線索都沒有。
  for (let i = 0; i < 60; i++) {
    if (await ev(`!!document.querySelector('#loading.done')`)) return true;
    await sleep(500);
  }
  return false;
}


const url = (q) => `http://127.0.0.1:${port}${PAGE}?debug&layers=${q}`;
if (!(await goto(url('')))) { console.error('作品沒有載入完成'); bye(1); }
if (!(await ev(`!!window.__atlas`))) {
  console.log('  WebGPU 起不來，跳過地球儀手感的真機檢查');
  bye(0);
}

const ok = [], fail = [];
const check = (c, m) => (c ? ok : fail).push((c ? '✓ ' : '✗ ') + m);
const view = async () => JSON.parse(await ev('JSON.stringify(window.__atlas.view())'));
const grab = async (x, y) => JSON.parse(await ev(`JSON.stringify(window.__atlas.grab(${x}, ${y}))`));
const where = async (p) => JSON.parse(await ev(`JSON.stringify(window.__atlas.where(${JSON.stringify(p)}))`));
const off = async (p, x, y) => { const q = await where(p); return Math.hypot(q.x - x, q.y - y); };
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, ...extra });
/** 等視角停下來。開場飛行、滾輪動畫、滑行都以秒計，軟體 GPU 下要等好幾秒 */
const settle = async (max = 90) => {
  let prev = null;
  for (let i = 0; i < max; i++) { await sleep(700); const v = JSON.stringify(await view()); if (v === prev) return; prev = v; }
};
const stopSpin = async () => {
  await mouse('mousePressed', 1230, 40, { button: 'left', buttons: 1, clickCount: 1 });
  await mouse('mouseReleased', 1230, 40, { button: 'left', buttons: 0, clickCount: 1 });
  await settle();
};

// 從整顆地球一路滾進去。鏡頭從 45 度換到 18 度那一段最容易出事：原本鏡頭依目標瞬間
// 換、距離慢慢追，每一格都是先猛然拉近再往回退，離地高度從 5.4 爬回 7.5。這裡逐幀記錄
// 畫面實際涵蓋度與離地高度，放大過程中兩者都不能反向。
{
  await settle(); await stopSpin();
  await ev(`(() => { window.__rec = []; const f = () => { const v = window.__atlas.view();
    window.__rec.push([v.cover, v.alt, v.fov]); if (window.__rec.length < 3000) requestAnimationFrame(f); }; requestAnimationFrame(f); })()`);
  for (let i = 0; i < 20; i++) { await mouse('mouseWheel', 640, 400, { deltaX: 0, deltaY: -100 }); await sleep(900); }
  await settle();
  const rec = JSON.parse(await ev('JSON.stringify(window.__rec)'));
  let up = 0, altUp = 0, worst = 0;
  for (let i = 1; i < rec.length; i++) {
    if (rec[i][0] > rec[i - 1][0] + 1e-6 && rec[i][0] < 179) { up++; worst = Math.max(worst, rec[i][0] - rec[i - 1][0]); }
    if (rec[i][1] > rec[i - 1][1] + 1e-6) altUp++;
  }
  const last = rec[rec.length - 1];
  check(up === 0 && altUp === 0 && last[2] < 45,
        `連續滾 20 格（${rec.length} 幀，最後 fov ${last[2].toFixed(1)}°），畫面反向變大 ${up} 幀（最多 ${worst.toFixed(2)}°）、離地反向升高 ${altUp} 幀`);
  // 方向對還不夠。鏡頭若依目標瞬間換，換鏡頭那一段距離不動，畫面會在一幀之內把整格
  // 放大走完，方向照樣單調，看起來卻是一次頓挫。一格約縮 10%，平滑的話要分好幾幀走完。
  // 只看 62 度以內，那是換鏡頭的區間，外面的飽和區一格本來就可以掉到兩成。
  let step = 0;
  for (let i = 1; i < rec.length; i++) {
    if (rec[i - 1][0] < 62 && rec[i][0] < rec[i - 1][0]) step = Math.max(step, rec[i - 1][0] / rec[i][0] - 1);
  }
  check(step < 0.06, `換鏡頭區間裡單一幀的放大最多 ${(step * 100).toFixed(1)}%（一格約 10%，要分幾幀走完才不頓）`);
}

for (const [hash, label] of [['', '遠看'], ['#tw', '貼近台灣']]) {
  if (!(await goto(url(hash)))) { fail.push(`✗ ${label} 載入失敗`); continue; }
  await settle(); await stopSpin();
  const v0 = await view(); await sleep(1200); const v1 = await view();
  check(v0.ry === v1.ry, `${label}：開場的自轉停住了（量測前提）`);

  const [cx, cy] = [900, 520];
  const p = await grab(cx, cy);
  // 動畫進行中也要量。只在收斂之後量的話，「解錨點時用的是上一幀的相機」這類接線錯
  // 抓不到：每一幀慢一拍，停下來之後又對上了。每一次 evaluate 都排在一幀渲染完之後，
  // 讀到的正好是畫面上那一刻的狀態。
  let midWorst = 0;
  for (let i = 0; i < 4; i++) {
    await mouse('mouseWheel', cx, cy, { deltaX: 0, deltaY: -100 });
    for (let k = 0; k < 3; k++) { await sleep(60); midWorst = Math.max(midWorst, await off(p, cx, cy)); }
  }
  for (let k = 0; k < 8; k++) { await sleep(60); midWorst = Math.max(midWorst, await off(p, cx, cy)); }
  await settle();
  const z1 = (await view()).zoom, d1 = await off(p, cx, cy);
  check(z1 < v1.zoom * 0.8 && d1 < 1, `${label}：滾輪放大四格（zoom ${v1.zoom.toFixed(4)} → ${z1.toFixed(4)}），停下之後游標底下那一點偏 ${d1.toFixed(2)} 像素`);
  check(midWorst < 1, `${label}：縮放動畫進行中，那一點最多偏 ${midWorst.toFixed(2)} 像素`);

  const [ax, ay] = [620, 380];
  const q = await grab(ax, ay);
  await mouse('mousePressed', ax, ay, { button: 'left', buttons: 1, clickCount: 1 });
  let x = ax, y = ay;
  for (let i = 1; i <= 30; i++) { x += 9; y += 4; await mouse('mouseMoved', x, y, { button: 'left', buttons: 1 }); }
  await sleep(1500);
  const d2 = await off(q, x, y);
  check(d2 < 1, `${label}：拖曳 ${Math.round(Math.hypot(x - ax, y - ay))} 像素，抓住的那一點離游標 ${d2.toFixed(2)} 像素`);
  const b = await view();
  await mouse('mouseReleased', x, y, { button: 'left', buttons: 0, clickCount: 1 });
  await sleep(2500);
  const a = await view();
  const turned = Math.hypot(a.rx - b.rx, a.ry - b.ry) * 180 / Math.PI;
  check(turned < 1e-6, `${label}：停住 1.5 秒再放開，之後轉了 ${turned.toFixed(6)} 度`);
}

// 甩開與捏合都在貼近台灣的視角做，讀者最常在這個尺度貼近操作
{
  const T0 = Date.now() / 1000;
  const s0 = await view();
  await mouse('mousePressed', 600, 400, { button: 'left', buttons: 1, clickCount: 1, timestamp: T0 });
  let x = 600;
  for (let i = 1; i <= 8; i++) { x += 25; await mouse('mouseMoved', x, 400, { button: 'left', buttons: 1, timestamp: T0 + i / 60 }); }
  await mouse('mouseReleased', x, 400, { button: 'left', buttons: 0, clickCount: 1, timestamp: T0 + 9 / 60 });
  const s1 = await view();
  await settle();
  const s2 = await view();
  const dragged = s1.ry - s0.ry, slid = s2.ry - s1.ry;
  check(s1.spin[1] !== 0 && Math.sign(slid) === Math.sign(dragged) && Math.abs(slid) > 1e-4,
        `甩開：放開瞬間 ${(s1.spin[1] * 180 / Math.PI).toFixed(2)} 度/秒，之後同方向又滑了 ${(slid * 180 / Math.PI).toFixed(3)} 度`);
}
{
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const m0 = [700, 420];
  const p = await grab(...m0);
  const z0 = (await view()).zoom;
  const pts = (d, dx, dy) => [{ x: m0[0] + dx - d, y: m0[1] + dy, id: 1 }, { x: m0[0] + dx + d, y: m0[1] + dy, id: 2 }];
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(60, 0, 0) });
  for (let i = 1; i <= 20; i++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(60 + i * 6, i * 3, i * 2) }); }
  await sleep(2500);
  const z1 = (await view()).zoom, d = await off(p, m0[0] + 60, m0[1] + 40);
  check(Math.abs(z1 / (z0 / 3) - 1) < 0.01 && d < 1,
        `捏合：兩指 120 → 360 像素並平移，zoom ${z0.toFixed(4)} → ${z1.toFixed(4)}（應為 ${(z0 / 3).toFixed(4)}），中點底下那一點偏 ${d.toFixed(2)} 像素`);
  const q1 = await where(p);
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(2000);
  const q2 = await where(p);
  check(Math.hypot(q2.x - q1.x, q2.y - q1.y) < 0.5, '捏合：放開之後不殘留滑行');
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
}

collecting = false;
check(errs.length === 0, errs.length ? `頁面有錯誤：${errs.slice(0, 3).join(' | ')}` : '整段沒有 JS 例外或 console.error');
console.log(ok.join('\n'));
if (fail.length) { console.log(fail.join('\n')); console.log(`\n${fail.length} 項沒過。`); bye(1); }
console.log(`\n全部 ${ok.length} 項通過。`);
bye(0);
