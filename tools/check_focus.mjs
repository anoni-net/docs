#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」網址上的關注區域（#tw 這種 hash）解析得對。
 *
 * === 這是什麼 ===
 *
 * 網址帶 #tw 或 #focus=tw 就會在載入時飛到台灣，分享連結時可以指定對方一開啟先看
 * 哪一塊。key 是 ISO 3166-1 alpha-2 小寫，跟 countries.json 的國碼同一套。
 *
 * FOCUS 裡有手調取景的優先用手調的，目前只有台灣。沒有的照國界自己算，所以今天
 * #jp、#cn 就已經能用。這支驗的重點就是那條自動路徑，因為那是「未來其他國家用同樣
 * 途徑」時真正會走到的程式碼。
 *
 * === 為什麼不直接取 bounding box ===
 *
 * 原始 bounding box 對三個國家會算出 360 度的經度跨幅：俄羅斯、斐濟、南極，因為它們
 * 的國界跨過換日線，經度從 -180 跳到 180。斐濟其實只有三度寬，照 bounding box 走會
 * 變成「整顆地球」。
 *
 * 而且像美國、法國那種有遠方屬地的，bounding box 的中心跟標籤點差很遠，框出來的
 * 不是國土而是一片海。所以改成以標籤點為中心量最遠的國界點，經度差繞回 [-180, 180]。
 *
 * 驗的是真東西：focusTarget、focusKey、goFocus、clearFocus 都從 atlas.js 原地抽出來，
 * ANCHOR 照 atlas.js 的方式從 countries.json 建。
 *
 * === 接線那半為什麼用重放 ===
 *
 * 「按下關注台灣會把 #tw 寫回網址」「拖曳之後會清掉」這兩件事的程式碼在 bindControls
 * 裡。試過開瀏覽器驗，這個環境沒有 WebGPU，退到 SwiftShader 的 WebGL 之後整個場景
 * 建不完，兩百秒還停在載入中，bindControls 根本沒被呼叫到，按鈕上自然沒有監聽器。
 * 所以改成把 bindControls 抽出來注入假的相依再重放事件，驗的是接線本身。
 *
 * 用法：
 *   node tools/check_focus.mjs
 * 有問題時 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network');
const atlas = fs.readFileSync(path.join(DIR, 'atlas.js'), 'utf8');
const world = JSON.parse(fs.readFileSync(path.join(DIR, 'countries.json'), 'utf8'));

function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`atlas.js 裡找不到 ${header}`);
  let depth = 0, started = false;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { depth++; started = true; }
    else if (src[j] === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error(`${header} 的大括號沒有配對成功`);
}

/** 直接搬 atlas.js 的宣告，免得這支跟本體各寫一份數字會漂走 */
const decl = (re) => {
  const m = atlas.match(re);
  if (!m) throw new Error(`atlas.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  const NO_PLACE = new Set(['eu', 'xx', '??', '']);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  ${decl(/^const TW_LAT[^;]+;/m)}
  ${decl(/^const TW_SPAN_LAT[^;]+;/m)}
  ${decl(/^const FOCUS = new Map\(\[[\s\S]*?\]\);/m)}
  ${decl(/^const FOCUS_PAD = [^;]+;/m)}
  ${decl(/^const FOCUS_MIN = [^;]+;/m)}
  const ANCHOR = new Map();
  // 照 atlas.js 的 paintEarth：ll 取 c.m 的 [lat, lon]，rings 直接掛 c.p
  for (const c of ${JSON.stringify(world.c)}) {
    if (!c.k) continue;
    ANCHOR.set(c.k, { ll: [c.m[1], c.m[0]], rings: c.p });
  }
  ${extractFn(atlas, 'function focusTarget(key)')}
  ${extractFn(atlas, 'function focusKey()')}
  return { focusTarget, focusKey, FOCUS_MIN, ANCHOR,
           setHash: (h) => { globalThis.location = { hash: h }; } };
`;
const M = new Function(harness)();

const fail = [];
const ok = [];

// --- 手調的取景要贏過自動算的 -----------------------------------------------
{
  const t = M.focusTarget('tw');
  const auto = M.focusTarget('jp');   // 隨便找一個確定走自動路徑的，證明兩條路都通
  if (!t) fail.push('✗ tw 查不到取景參數');
  else if (Math.abs(t.spanLat - 4.6) > 1e-9 || Math.abs(t.spanLon - 3.0) > 1e-9) {
    fail.push(`✗ tw 沒有用手調的取景，拿到 ${t.spanLat} × ${t.spanLon}，應該是 4.6 × 3.0`);
  } else ok.push(`✓ tw 用手調的取景 ${t.spanLat}° × ${t.spanLon}°（自動算的會是 3.54 × 1.96，澎湖會被切掉）`);
  if (!auto) fail.push('✗ jp 走不到自動取景那條路');
  else ok.push(`✓ jp 自動取景 ${auto.spanLat.toFixed(1)}° × ${auto.spanLon.toFixed(1)}°`);
}

// --- 跨換日線的國家 ----------------------------------------------------------
// 斐濟橫跨 180 度但實際只有幾度寬。原始 bounding box 會算成 360 度，也就是整顆地球。
// 這一項就是在驗經度差有沒有繞回 [-180, 180]。
{
  const fj = M.focusTarget('fj');
  if (!fj) fail.push('✗ fj 查不到取景參數');
  else if (fj.spanLon > 20) {
    fail.push(`✗ fj 的經度跨幅 ${fj.spanLon.toFixed(1)}°，換日線沒有繞回去。斐濟只有幾度寬`);
  } else ok.push(`✓ fj 跨換日線但只框 ${fj.spanLon.toFixed(1)}°，經度差有繞回 [-180, 180]`);
}

// --- 全部國家都要給得出合理的取景 --------------------------------------------
{
  const bad = [];
  let n = 0;
  for (const cc of M.ANCHOR.keys()) {
    const t = M.focusTarget(cc);
    if (!t) { bad.push(`${cc} 回 null`); continue; }
    n++;
    if (!Number.isFinite(t.lat) || !Number.isFinite(t.lon)) bad.push(`${cc} 座標不是數字`);
    else if (Math.abs(t.lat) > 90 || Math.abs(t.lon) > 180) bad.push(`${cc} 座標超出範圍 ${t.lat},${t.lon}`);
    if (!(t.spanLat >= M.FOCUS_MIN) || !(t.spanLon >= M.FOCUS_MIN)) bad.push(`${cc} 跨幅小於下限`);
    // 超過 180 度沒有意義，那已經是整個看得到的半球。南極沒有上限的話會量出 449 度。
    if (t.spanLat > 180 || t.spanLon > 180) bad.push(`${cc} 跨幅超過 180 度：${t.spanLat.toFixed(0)} × ${t.spanLon.toFixed(0)}`);
  }
  if (bad.length) fail.push('✗ ' + bad.slice(0, 6).join('、') + (bad.length > 6 ? ` 等 ${bad.length} 項` : ''));
  else ok.push(`✓ ${n} 個國家都給得出座標與跨幅在合理範圍的取景`);
}

// --- 認不得的 key 不能讓畫面壞掉 ---------------------------------------------
{
  const junk = ['', ' ', 'zzzz', 'tw tw', '../../etc', 'eu', 'xx', '<script>', null, undefined, '%%%'];
  const wrong = junk.filter((k) => M.focusTarget(k) !== null);
  if (wrong.length) fail.push(`✗ 這些 key 不該有取景卻查得到：${wrong.map(String).join('、')}`);
  else ok.push(`✓ ${junk.length} 種認不得或不該有位置的 key 都回 null`);
}

// --- hash 解析 ---------------------------------------------------------------
{
  const cases = [
    ['#tw', 'tw'], ['#focus=tw', 'tw'], ['#TW', 'TW'], ['', ''], ['#', ''],
    ['#focus=', ''], ['#%74%77', 'tw'], ['#%', '%'],   // 壞掉的 escape 不能丟例外
  ];
  for (const [hash, want] of cases) {
    M.setHash(hash);
    let got;
    try { got = M.focusKey(); } catch (e) { fail.push(`✗ hash ${JSON.stringify(hash)} 讓 focusKey 丟例外：${e.message}`); continue; }
    if (got !== want) fail.push(`✗ hash ${JSON.stringify(hash)} 解出 ${JSON.stringify(got)}，應該是 ${JSON.stringify(want)}`);
  }
  // 大小寫要在 focusTarget 那層吸收掉，網址不該分大小寫
  M.setHash('#TW');
  if (!M.focusTarget(M.focusKey())) fail.push('✗ #TW 查不到台灣，大小寫沒有正規化');
  if (!fail.some((f) => f.includes('hash') || f.includes('#TW'))) {
    ok.push(`✓ ${cases.length} 種 hash 寫法都解得對，大小寫與壞掉的 escape 都不會出事`);
  }
}


// --- 接線：哪個事件會寫網址、哪個會清掉 --------------------------------------
{
  const wire = `
    const view = { zoom: 1, rx: 0.45, ry: 2.28, spin: true };
    const pointers = new Map();
    const spin = { rx: 0, ry: 0 };
    let last = null, pinchStart = 0, zoomStart = 1;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const ZOOM_MIN = 0.004, ZOOM_MAX = 1.55;
    const dragRate = () => 0.006;
    const REDUCED = false;
    const setSpin = () => {};
    const stopSpin = () => {};
    const pauseSpin = () => {};
    globalThis.performance = { now: () => 0 };
    // 網址的假身。goFocus 與 clearFocus 用的是真的那兩支，只有 history 與 location 是假的。
    let URL_ = { path: '/games/tor-network/', search: '?lang=en', hash: '' };
    globalThis.location = {
      get pathname() { return URL_.path; },
      get search() { return URL_.search; },
      get hash() { return URL_.hash; },
    };
    globalThis.history = { replaceState: (a, b, url) => {
      URL_.hash = String(url).startsWith('#') ? String(url) : '';
    } };
    // flyTo 這裡不驗相機，只驗有沒有被叫到
    let flew = null;
    function flyTo(lat, lon, sla, slo) { flew = { lat, lon, sla, slo }; }
    /*FOCUS_SRC*/
    const clicks = {};
    const mkBtn = (id) => ({ hidden: true, addEventListener: (t, f) => { if (t === 'click') clicks[id] = f; } });
    const btns = { 'btn-tw': mkBtn('btn-tw'), 'btn-spin': mkBtn('btn-spin') };
    const $ = (id) => btns[id] || null;
    /*BIND_SRC*/
    const H = {};
    const dom = { addEventListener: (t, f) => { (H[t] = H[t] || []).push(f); }, setPointerCapture: () => {} };
    globalThis.document = { addEventListener: () => {}, querySelectorAll: () => [] };
    bindControls(dom);
    return {
      fire: (t, e) => (H[t] || []).forEach((f) => f(e)),
      click: (id) => clicks[id] && clicks[id]({ stopPropagation: () => {}, preventDefault: () => {} }),
      hash: () => URL_.hash,
      flew: () => flew,
      setHash: (h) => { URL_.hash = h; },
      has: (id) => !!clicks[id],
    };
  `;
  const src = wire
    .replace('/*FOCUS_SRC*/', [
      decl(/^const TW_LAT[^;]+;/m), decl(/^const TW_SPAN_LAT[^;]+;/m),
      decl(/^const FOCUS = new Map\(\[[\s\S]*?\]\);/m),
      decl(/^const FOCUS_PAD = [^;]+;/m), decl(/^const FOCUS_MIN = [^;]+;/m),
      "const NO_PLACE = new Set(['eu', 'xx', '??', '']);",
      "const ANCHOR = new Map();",
      extractFn(atlas, 'function focusTarget(key)'),
      extractFn(atlas, 'function goFocus(key)'),
      extractFn(atlas, 'function clearFocus()'),
    ].join('\n'))
    .replace('/*BIND_SRC*/', extractFn(atlas, 'function bindControls(dom)'));

  const W = new Function(src)();

  if (!W.has('btn-tw')) fail.push('✗ btn-tw 上沒有掛 click，「關注台灣」按不動');
  else {
    W.click('btn-tw');
    if (W.hash() !== '#tw') fail.push(`✗ 按下「關注台灣」之後網址是 ${JSON.stringify(W.hash())}，應該是 "#tw"`);
    else if (!W.flew()) fail.push('✗ 按下「關注台灣」寫了網址卻沒有飛過去');
    else ok.push(`✓ 按下「關注台灣」會飛到 ${W.flew().lat},${W.flew().lon} 並把 #tw 寫回網址`);
  }

  // 視角真的動了才清網址。點一下開卡片不算，那時畫面沒動。
  const P = (id, x, y) => ({ pointerId: id, clientX: x, clientY: y });
  {
    W.setHash('#tw');
    W.fire('pointerdown', P(1, 400, 300));
    if (W.hash() !== '#tw') fail.push('✗ 只是按下去還沒移動就把網址清掉了，點一下開卡片也會誤清');
    else ok.push('✓ 按下去還沒移動時網址留著，點一下開卡片不會誤清');
    W.fire('pointermove', P(1, 460, 300));
    if (W.hash() !== '') fail.push(`✗ 拖曳之後網址還是 ${JSON.stringify(W.hash())}，應該清掉`);
    else ok.push('✓ 拖曳轉走之後網址清掉了');
  }
  {
    W.setHash('#tw');
    W.fire('wheel', { deltaY: 120, deltaMode: 0, preventDefault: () => {} });
    if (W.hash() !== '') fail.push('✗ 滾輪縮放之後網址沒清掉');
    else ok.push('✓ 滾輪縮放之後網址清掉了');
  }
  {
    W.setHash('#tw');
    W.fire('pointerdown', P(1, 300, 300));
    W.fire('pointerdown', P(2, 500, 300));
    W.fire('pointermove', P(2, 560, 300));
    if (W.hash() !== '') fail.push('✗ 捏合縮放之後網址沒清掉');
    else ok.push('✓ 捏合縮放之後網址清掉了');
  }
  if (W.has('btn-spin')) {
    W.setHash('#tw');
    W.click('btn-spin');
    if (W.hash() !== '') fail.push('✗ 按「繼續轉動」之後網址沒清掉，轉起來就不是那一塊了');
    else ok.push('✓ 按「繼續轉動」之後網址清掉了');
  }
}

// --- main 裡的兩個掛鉤 --------------------------------------------------------
// 這兩處在 main 裡，抽不出來重放，至少確認沒有被誤刪。
{
  if (!/\n  applyFocus\(\);/.test(atlas)) fail.push('✗ main 裡沒有呼叫 applyFocus，帶 hash 進來不會飛過去');
  else ok.push('✓ main 載入完會呼叫 applyFocus');
  if (!/addEventListener\('hashchange', applyFocus\)/.test(atlas)) fail.push('✗ 沒有掛 hashchange，網址改了不會反應');
  else ok.push('✓ 有掛 hashchange');
}

ok.forEach((l) => console.log('  ' + l));
if (fail.length) {
  console.error('\n' + fail.join('\n'));
  console.error('\n關注區域的自動取景是「未來其他國家用同樣途徑」會走到的那條路，');
  console.error('改 focusTarget 或 FOCUS 之後這支要重跑。');
  process.exit(1);
}
console.log('\n關注區域的網址解析與取景都沒問題。');
