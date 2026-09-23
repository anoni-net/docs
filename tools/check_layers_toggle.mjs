#!/usr/bin/env node
/**
 * 地球儀的圖層開得起來也關得掉。
 *
 * === 為什麼需要這支 ===
 *
 * 每一層被關掉的時候要收回三樣東西：掛在地球上的物件、模組層級那幾個材質與網格
 * 的參照、側欄裡那一區的文字。三樣的漏法各自安靜：
 *
 *   物件沒收      關掉之後那一層還畫在地球上，按鈕卻顯示關著
 *   參照沒歸零    每幀對著已經 dispose 的材質設透明度
 *   面板沒清      側欄留著上一次的數字，看起來像那一層還開著
 *
 * 反方向一樣要走得通。原本每一層的 fill 只有「資料缺就收起來」那一條路，因為
 * 載入只會發生一次，少了回頭那一半的症狀是關掉再打開，區塊不見了。
 *
 * 所以這支把每一層開一次關一次再開一次，每一輪都回頭數地球上的物件。數字沒回到
 * 原點就是有東西沒收乾淨。
 *
 * === 需要真的把作品跑起來 ===
 *
 * 開關會動到 three.js 的場景圖與 GPU 資源，抽出來注入假相依驗不到。所以開一顆
 * headless Chrome 把整個作品載起來，用 ?debug 那個掛鉤按下去。
 *
 * 沒有 google-chrome 就跳過並回 0。WebGPU 起不來也跳過，那是環境的事，
 * 不該在這裡變成紅燈。
 *
 * 用法：
 *   node tools/check_layers_toggle.mjs
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { LAYERS } from '../docs/zh-TW/games/tor-network/play/layers.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', 'docs', 'zh-TW');
const PAGE = '/games/tor-network/play/';

try { execSync('command -v google-chrome', { stdio: 'ignore' }); }
catch { console.log('  找不到 google-chrome，跳過圖層開關的檢查'); process.exit(0); }

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

const prof = fs.mkdtempSync('/tmp/ly-toggle-');
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

if (!(await goto(`http://127.0.0.1:${port}${PAGE}?debug`))) { console.error('作品沒有載入完成'); bye(1); }
if (!(await ev(`!!window.__atlas`))) {
  // initRenderer 失敗時 main 直接 return，掛鉤不會掛上去。那是環境沒有 WebGPU，
  // 不是這次改動的問題。把卡在哪一關印出來，免得哪天 CI 默默跳過而沒人發現。
  const why = await ev(`(async () => {
    if (!navigator.gpu) return 'navigator.gpu 不存在';
    try {
      const a = await navigator.gpu.requestAdapter();
      if (!a) return 'requestAdapter 回 null';
      return 'adapter 有了但 renderer.init 沒過：' + JSON.stringify(a.info || {});
    } catch (e) { return 'requestAdapter 丟出 ' + e.message; }
  })()`);
  console.log(`  WebGPU 起不來，跳過圖層開關的檢查（${why}）`);
  bye(0);
}
await sleep(600);

const ok = [], fail = [];
const check = (c, m) => (c ? ok : fail).push(m);
const panelLen = (el) => ev(`((document.getElementById('${el}')||{}).textContent||'').trim().length`);
const hidden = (el) => ev(`!!(document.getElementById('${el}')||{}).hidden`);
/** 等某一層開好或關好。走 assets 的那幾份要等外網回來，寫死的 sleep 不夠穩。 */
const waitOn = async (id, want = true) => {
  for (let i = 0; i < 60; i++) {
    if ((await ev(`window.__atlas.isOn('${id}')`)) === want) return true;
    await sleep(250);
  }
  return false;
};

// ── 開場的樣子 ──────────────────────────────────────────────
const chips = JSON.parse(await ev(
  `JSON.stringify([...document.querySelectorAll('[data-ly]')].map((b) => ({ id: b.dataset.ly, on: b.classList.contains('on'), fixed: b.disabled })))`));
check(chips.length === LAYERS.length,
      `清單上每一層都有一個格子（${chips.length} 對 ${LAYERS.length}）`);
const wantOn = LAYERS.filter((l) => l.on).map((l) => l.id).sort();
const gotOn = chips.filter((c) => c.on).map((c) => c.id).sort();
check(JSON.stringify(wantOn) === JSON.stringify(gotOn),
      `開場開著的是 ${gotOn.join('、')}`);
for (const l of LAYERS.filter((x) => x.core)) {
  check(chips.find((c) => c.id === l.id)?.fixed, `${l.id} 關不掉，格子是停用的`);
}

// ── 每一層開關一輪 ──────────────────────────────────────────
//
// 物件數回不到原點就是有東西沒收。這個數字涵蓋所有掛在地球上的東西，包含
// 星空以外那幾樣不屬於任何層的。
const base = await ev(`window.__atlas.objCount()`);
for (const c of chips.filter((x) => !x.fixed)) {
  const first = c.on ? 'off' : 'on', second = c.on ? 'on' : 'off';
  await ev(`(async () => { await window.__atlas.${first}('${c.id}'); })()`);
  await sleep(150);
  check((await ev(`window.__atlas.isOn('${c.id}')`)) === !c.on, `${c.id}：${first} 之後狀態翻過來`);
  // 資料來源那一段要跟著層走。沒有側欄區塊的那幾層（海底電纜、縣市界、上網人口）
  // 最容易漏掉，漏了的話讀者看到的來源清單裡有畫面上根本沒有的資料。
  const decl = LAYERS.find((l) => l.id === c.id);
  if (decl && decl.creditEl) {
    check((await ev(`!document.getElementById('${decl.creditEl}').hidden`)) === !c.on,
          `${c.id}：資料來源那一段跟著${c.on ? '收起來' : '露出來'}`);
  }
  await ev(`(async () => { await window.__atlas.${second}('${c.id}'); })()`);
  await sleep(150);
  check((await ev(`window.__atlas.isOn('${c.id}')`)) === c.on, `${c.id}：${second} 之後回到原狀`);
  const n = await ev(`window.__atlas.objCount()`);
  check(n === base, `${c.id}：一開一關之後地球上還是 ${base} 個物件（實際 ${n}）`);
  const left = await ev(`window.__atlas.layerObjs('${c.id}')`);
  check(c.on ? left >= 0 : left === 0, `${c.id}：記帳表沒有留下孤兒物件`);
}

// ── 側欄跟著層走 ────────────────────────────────────────────
await ev(`(async () => { await window.__atlas.on('tw-power'); })()`);
await sleep(500);
check((await panelLen('stat-power')) > 20, '打開變電所之後側欄那一區有內容');
check(!(await hidden('lbl-power')), '小標跟著露出來');
check(!(await hidden('credit-power')), '資料來源跟著露出來');
await ev(`window.__atlas.off('tw-power')`);
await sleep(200);
check((await panelLen('stat-power')) === 0, '關掉之後那一區清空');
check(await hidden('lbl-power'), '小標跟著收起來');
check(await hidden('credit-power'), '資料來源跟著收起來');

// ── 中繼那一層牽動的東西最多 ────────────────────────────────
await ev(`window.__atlas.off('relays')`);
await sleep(300);
check((await ev(`document.getElementById('stat-total').textContent`)) === '–', '關掉中繼之後總數歸位');
check((await panelLen('stat-mix')) === 0, '各國組成清空');
check(await hidden('lbl-asn'), '托管商排行收起來');
check((await ev(`document.querySelectorAll('#labels .lb').length`)) === 0, '國家標籤收乾淨');
await ev(`(async () => { await window.__atlas.on('relays'); })()`);
await sleep(700);
check((await ev(`document.getElementById('stat-total').textContent`)).includes(','), '再打開之後總數回來');
check((await panelLen('stat-mix')) > 20, '各國組成回來');
check((await ev(`document.querySelectorAll('#labels .lb').length`)) > 0, '國家標籤回來');

const end = await ev(`window.__atlas.objCount()`);
check(end === base, `全部走完之後仍是 ${base} 個物件（實際 ${end}）`);

// ── 托管商排行與亞洲對照要對稱地收放 ────────────────────────
//
// 那兩區跟著中繼那一層走，但它們不是中繼層的 panel 欄位，收放由 fillAsn 與
// fillAsia 自己管。只寫了收沒寫放的話，關掉再打開會變成一塊沒有標題的排行榜，
// 而內容是對的，看起來只像版面壞了一點點。
await ev(`window.__atlas.off('relays')`);
await sleep(300);
check(await hidden('lbl-asn'), '關掉中繼之後托管商排行的小標收起來');
check((await panelLen('stat-asn')) === 0, '排行的內容也清掉');
await ev(`(async () => { await window.__atlas.on('relays'); })()`);
await waitOn('relays');
await sleep(500);
check(!(await hidden('lbl-asn')), '再打開之後小標跟著回來');
check((await panelLen('stat-asn')) > 20, '排行的內容也回來');
check(!(await hidden('lbl-asia')), '亞洲對照那一區同樣回得來');

// ── 換一份新快照之後記帳表要跟得上 ──────────────────────────
//
// 即時更新那顆按鈕走的是 applySnapshot。它如果自己 remove 物件而不經過
// dropLayer，舊的點會留在記帳表裡、新的點沒被記到，於是按過更新之後關掉這一層，
// 畫面上的點不會消失而按鈕顯示關著。外網連不上的機器按不到那顆按鈕，改從掛鉤
// 餵一份改過的快照進去，走的是同一條路。
{
  const before = await ev(`window.__atlas.objCount()`);
  await ev(`(() => { const d = window.__atlas.snap(); d.total = 12345; window.__atlas.apply(d); })()`);
  await sleep(600);
  check((await ev(`document.getElementById('stat-total').textContent`)) === '12,345', '新快照的數字上得去');
  check((await ev(`window.__atlas.objCount()`)) === before, `換完快照物件數不變（${before}）`);
  await ev(`window.__atlas.off('relays')`);
  await sleep(400);
  check((await ev(`window.__atlas.layerObjs('relays')`)) === 0, '換過快照之後關掉那一層，記帳表清得乾淨');
  await ev(`(async () => { await window.__atlas.on('relays'); })()`);
  await waitOn('relays');
  await sleep(500);
}

// ── 陸地亮度的指標跟著層增減 ────────────────────────────────
//
// 指標由層供應。供應它的那一層關掉時按鈕要跟著消失，不然按下去是一片全暗的陸地
// 而圖例還寫著那個指標的名字。停在上面的那個被關掉時還要自動換一個。
const modes = () => ev(`JSON.stringify([...document.querySelectorAll('#metric-sw button')].map((b) => b.dataset.mode))`);
const onMode = () => ev(`(document.querySelector('#metric-sw button.on')||{ dataset: {} }).dataset.mode`);

check(JSON.parse(await modes()).join() === 'all-count,all-weight,conc', '開場的三個指標都來自中繼那一層');
check((await onMode()) === 'all-count', '開場停在中繼台數');

await ev(`(async () => { await window.__atlas.on('torusers'); })()`);
await waitOn('torusers');
await sleep(200);
check(JSON.parse(await modes()).includes('users'), '打開使用者估計之後多一個指標');
await ev(`document.querySelector('[data-mode="users"]').click()`);
await sleep(300);
check((await onMode()) === 'users', '按下去換到使用者數');

await ev(`window.__atlas.off('torusers')`);
await sleep(300);
check(!JSON.parse(await modes()).includes('users'), '關掉之後那個指標跟著消失');
check((await onMode()) === 'all-count', '停在被關掉的指標上會自動換回預設');

await ev(`window.__atlas.off('relays')`);
await sleep(300);
check(JSON.parse(await modes()).length === 0, '中繼也關掉之後一個指標都不剩');
check(await ev(`document.getElementById('metric-sw').hidden`), '按鈕列整排收起來');
check(await ev(`document.getElementById('lbl-brightness').hidden`), '亮度那個小標跟著收');
await ev(`(async () => { await window.__atlas.on('relays'); })()`);
await waitOn('relays');
await sleep(400);
check(JSON.parse(await modes()).length === 3, '再打開之後三個指標回來');

// 角色 chip 是 fillMix 每次重建的，事件綁在節點上的話重開一次就點不動了，
// 而畫面看起來完全正常。
await ev(`document.querySelector('#stat-role [data-mode]').click()`);
await sleep(300);
check((await ev(`(document.querySelector('#stat-role [data-mode].on')||{ dataset: {} }).dataset.mode`)) === 'guard',
      '中繼重開之後角色 chip 還點得動');
await ev(`document.querySelector('#stat-role [data-mode]').click()`);
await sleep(300);

// ── 點面板不該停掉自轉 ──────────────────────────────────────
//
// 拖曳地球才是「使用者接手了，別再自己轉」。點側欄上的按鈕不是。
//
// pointerdown 落在面板上時控制那邊直接 return，那一根手指從來沒被記進 pointers，
// 而 pointerup 原本照樣 delete 再看 size，於是「點了一下面板」被當成「放開最後
// 一根手指」。收合鍵、圖層格子、指標按鈕、角色 chip 全中，症狀是點任何一顆按鈕
// 地球就停下來，而右上角冒出「繼續轉動」。
{
  const spinning = () => ev(`!!document.getElementById('btn-spin').hidden`);
  const tap = async (sel) => {
    const box = JSON.parse(await ev(`(() => {
      const el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return 'null';
      const r = el.getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
    })()`));
    if (!box) return false;
    for (const type of ['mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 });
      await sleep(80);
    }
    return true;
  };
  // 開場是轉著的。前面那串檢查沒有碰過畫布，所以到這裡應該還在轉。
  check(await spinning(), '前面那串檢查跑完，地球還在自轉');
  await tap('[data-ly="cables"]');
  await sleep(400);
  check(await spinning(), '點圖層格子之後照樣在轉');
  await tap('[data-mode="all-weight"]');
  await sleep(400);
  check(await spinning(), '點指標按鈕之後照樣在轉');
  await tap('.title-row');
  await sleep(300);
  check(await spinning(), '點收合鍵之後照樣在轉');
  // 反過來，拖曳畫布就該停。這一關證明上面那幾項不是因為自轉根本沒在跑。
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 900, y: 400, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 940, y: 420, button: 'left' });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 940, y: 420, button: 'left', clickCount: 1 });
  await sleep(300);
  check(!(await spinning()), '拖曳地球之後自轉停下來');
  // 收拾現場，後面還有導覽要走
  await ev(`document.getElementById('btn-spin').click()`);
  await ev(`(async () => { if (window.__atlas.isOn('cables')) window.__atlas.off('cables'); })()`);
  await sleep(300);
}

// ── 各國行政區：貼近那一國才抓 ────────────────────────────────
//
// admin1 開場就開，因為開著的只是一份 0.2 KB 的索引。各國的界線要等鏡頭貼近那一國
// 才去抓，這個前提一壞，讀者一打開頁面就把每一國的檔案全部抓下來，而畫面上看不出來。
// 抓回來的幾何是事後才掛上去的，也要記在這一層名下，關掉時才收得回去。
{
  if (!(await ev(`window.__atlas.isOn('admin1')`))) {
    await ev(`(async () => { await window.__atlas.on('admin1'); })()`);
    await waitOn('admin1');
  }
  await ev(`window.__atlas.flyTo(30, 120, 170)`);
  await sleep(3000);
  check((await ev(`JSON.stringify(window.__atlas.admin1())`)) === '{}', '遠看整顆地球時一國的行政區都沒抓');
  await ev(`window.__atlas.flyTo(36.5, 137.5, 14)`);
  let a = {};
  for (let i = 0; i < 160; i++) {
    a = JSON.parse(await ev(`JSON.stringify(window.__atlas.admin1())`));
    if (a.jp > 0.5) break;
    await sleep(250);
  }
  check(a.jp > 0.5, `貼近日本，都道府縣的界線抓回來並淡入（透明度 ${a.jp}）`);
  // 涵蓋 14 度的日本畫面裡看得到的只有日本與韓國。東南亞任何一國出現在這裡，就是
  // 「在不在畫面上」那條判斷放太寬，一飛就把半個亞洲的檔案都抓下來
  const extra = Object.keys(a).filter((k) => !['jp', 'kr'].includes(k));
  check(extra.length === 0, `貼近日本時只抓了畫面上看得到的國家（${Object.keys(a).join('、')}${extra.length ? `，多抓了 ${extra.join('、')}` : ''}）`);
  check((await ev(`window.__atlas.layerObjs('admin1')`)) > 0, '抓回來的界線記在 admin1 這一層名下');
  await ev(`window.__atlas.off('admin1')`);
  await waitOn('admin1', false);
  check((await ev(`window.__atlas.layerObjs('admin1')`)) === 0, '關掉 admin1，事後才掛上去的界線也收回了');
  await ev(`(async () => { await window.__atlas.on('admin1'); })()`);
  await waitOn('admin1');
}

// ── 導覽按下去要能走完七站 ──────────────────────────────────
//
// 七站各自依賴一份資料，而開場只載地理底圖與中繼。導覽開始前沒有把缺的補上的話，
// 第三站起會整站被抽掉，站數默默變少，而講者是站在台前才發現少講了三站。
// 先把讀者關得掉的層全部關掉，回到「只有地球」那個狀態，再按導覽。不重新導頁
// 是刻意的：同一顆 Chrome 每導一次頁就要重建一次 WebGPU 裝置，那條路上偶爾會
// 卡在 renderer.init 不回來，而卡住的時候畫面上什麼線索都沒有。
for (const c of chips.filter((x) => !x.fixed)) {
  if (await ev(`window.__atlas.isOn('${c.id}')`)) await ev(`window.__atlas.off('${c.id}')`);
}
await sleep(300);
// 看狀態不看格子的樣式。這裡是直接叫 off()，繞過了點擊那條路，而樣式是由點擊
// 處理器裡的 syncLayerUI 更新的。
const stillOn = [];
for (const c of chips) if (await ev(`window.__atlas.isOn('${c.id}')`)) stillOn.push(c.id);
check(stillOn.join() === 'countries', `關到只剩地球本身（還開著 ${stillOn.join('、')}）`);
await ev(`document.getElementById('btn-tour').click()`);
// 補載要抓四五份檔案，本機也要一點時間
for (let i = 0; i < 40; i++) {
  if (await ev(`window.__atlas.isOn('tw-grid')`)) break;
  await sleep(250);
}
for (const id of ['relays', 'ooni', 'torusers', 'tw-admin', 'tw-landing', 'tw-power', 'tw-grid']) {
  check(await ev(`window.__atlas.isOn('${id}')`), `按下導覽之後 ${id} 自己補載起來`);
}
check((await ev(`!document.getElementById('tour').hidden`)), '導覽列出現了');
check((await ev(`[...document.querySelectorAll('[data-ly].on')].length`)) >= 8, '圖層清單跟著標成開著');

// 檢查跑完了，之後發生的都是收尾
collecting = false;

for (const m of ok) console.log(`  ok   ${m}`);
if (errs.length) {
  console.error('');
  for (const e of errs.slice(0, 10)) console.error(`  主控台錯誤 ${e}`);
}
if (fail.length) {
  console.error('');
  for (const m of fail) console.error(`  FAIL ${m}`);
  console.error(`\n${fail.length} 項沒過（共 ${ok.length + fail.length} 項）`);
  bye(1);
}
if (errs.length) { console.error(`\n開關的過程中有 ${errs.length} 則主控台錯誤`); bye(1); }
console.log(`\n全部 ${ok.length} 項通過`);
bye(0);
