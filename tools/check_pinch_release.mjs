#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」在手機上捏合縮放之後放開一根手指，地球會不會彈開。
 *
 * === 這個 bug 長什麼樣 ===
 *
 * bindControls 的 pointermove 在 pointers.size === 2 的時候會提早 return，
 * 所以整段捏合期間 last 都停在「第二根手指按下去」的那個位置，沒有更新過。
 *
 * 放開一根之後如果不把 last 重新對齊到剩下的那一根，下一個 pointermove 算出來的
 * 位移會是「剩下這根的現在位置」減「另一根當初按下的位置」，那是捏合張開的距離，
 * 手機上通常一兩百像素。結果是手指只動了幾像素，地球卻整個轉走。
 *
 * 更麻煩的是同一個值會被寫進 spin 當成放開後的滑行速度，以 0.92 每幀衰減，
 * 所以不只是跳一下，是放開之後還會繼續飛四十幾幀。使用者描述成「彈開」。
 *
 * === 為什麼用重放而不是開瀏覽器測 ===
 *
 * 試過用 CDP 的 Input.dispatchTouchEvent 模擬雙指，headless 環境下 Chrome 只送得出
 * 第一個 pointerdown，第二個觸點進不來，測出來的東西沒有意義。改成把 bindControls
 * 的原始碼從 atlas.js 抽出來，注入假的相依之後重放事件序列，驗的是這支自己的
 * 狀態機，那正是會壞掉的地方。
 *
 * dragRate 在這裡固定成常數，因為要驗的是事件流程，不是縮放對靈敏度的補償。
 *
 * 用法：
 *   node tools/check_pinch_release.mjs
 * 有問題時 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ATLAS = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'atlas.js');

const DRAG_K = 0.006;   // 跟 atlas.js 的 DRAG_K 一致，換算「幾像素等於幾弧度」用
const NUDGE = 5;        // 放開一根之後，剩下那根微幅移動幾像素
// 微移 NUDGE 像素的合理轉動量。留兩倍餘裕，真的彈開時差距是好幾十倍，不會誤判。
const MAX_JUMP = DRAG_K * NUDGE * 2;
const MAX_GLIDE = DRAG_K * NUDGE * 2;

/** 從 atlas.js 取出 bindControls 的完整原始碼，靠大括號配對而不是正則 */
function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`atlas.js 裡找不到 ${header}`);
  let depth = 0, started = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') { depth++; started = true; }
    else if (c === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error(`${header} 的大括號沒有配對成功`);
}

const src = fs.readFileSync(ATLAS, 'utf8');
const body = extractFn(src, 'function bindControls(dom)');

// 注入相依，讓 bindControls 在這裡跑得起來。這些名字要跟 atlas.js 的模組層變數一致。
const harness = `
  const view = { zoom: 1, rx: 0.45, ry: 2.28, spin: true };
  const pointers = new Map();
  const spin = { rx: 0, ry: 0 };
  let last = null, pinchStart = 0, zoomStart = 1;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ZOOM_MIN = 0.42, ZOOM_MAX = 1.6;
  const dragRate = () => ${DRAG_K};
  const stopSpin = () => {};
  const pauseSpin = () => {};
  ${body}
  const H = {};
  const dom = {
    addEventListener: (t, f) => { (H[t] = H[t] || []).push(f); },
    setPointerCapture: () => {},
  };
  globalThis.document = { addEventListener: () => {} };
  bindControls(dom);
  return {
    fire: (t, e) => (H[t] || []).forEach((f) => f(e)),
    peek: () => ({ ry: view.ry, rx: view.rx, zoom: view.zoom, sry: spin.ry, srx: spin.rx, n: pointers.size }),
  };
`;
const ctl = new Function(harness)();

const P = (id, x, y) => ({ pointerId: id, clientX: x, clientY: y });
const fail = [];
const ok = [];

function scenario(name, run) {
  // 每個情境用一份乾淨的狀態
  const c = new Function(harness)();
  const r = run(c);
  const label = `${name}：微移 ${NUDGE}px 轉了 ${r.jump.toFixed(5)} rad，殘留滑行 ${r.glide.toFixed(5)}`;
  if (r.jump > MAX_JUMP || r.glide > MAX_GLIDE) {
    fail.push(`✗ ${label}（上限 ${MAX_JUMP.toFixed(5)}）`);
  } else {
    ok.push(`✓ ${label}`);
  }
}

/** 雙指捏合放大，然後放開其中一根，剩下那根微幅移動 */
function pinchThenLift(c, liftFirst) {
  const A = 1, B = 2;
  c.fire('pointerdown', P(A, 120, 430));
  c.fire('pointerdown', P(B, 270, 430));
  // 往外撐開，各走 60px
  for (let i = 1; i <= 6; i++) {
    c.fire('pointermove', P(A, 120 - i * 10, 430));
    c.fire('pointermove', P(B, 270 + i * 10, 430));
  }
  const ax = 60, bx = 330;
  const stay = liftFirst === B ? A : B;
  const stayX = stay === A ? ax : bx;
  c.fire('pointerup', P(liftFirst, liftFirst === A ? ax : bx, 430));
  const before = c.peek();
  c.fire('pointermove', P(stay, stayX + NUDGE, 430));
  const after = c.peek();
  return { jump: Math.abs(after.ry - before.ry), glide: Math.abs(after.sry) };
}

scenario('放開第二根、留第一根', (c) => pinchThenLift(c, 2));
scenario('放開第一根、留第二根', (c) => pinchThenLift(c, 1));

// 捏合本身要真的有縮放，否則上面兩個情境是空跑
{
  const c = new Function(harness)();
  c.fire('pointerdown', P(1, 120, 430));
  c.fire('pointerdown', P(2, 270, 430));
  const z0 = c.peek().zoom;
  for (let i = 1; i <= 6; i++) {
    c.fire('pointermove', P(1, 120 - i * 10, 430));
    c.fire('pointermove', P(2, 270 + i * 10, 430));
  }
  const z1 = c.peek().zoom;
  if (!(z1 < z0)) fail.push(`✗ 捏合沒有產生縮放（${z0} → ${z1}），前面兩個情境等於沒測到東西`);
  else ok.push(`✓ 捏合有縮放：zoom ${z0.toFixed(3)} → ${z1.toFixed(3)}`);
}

// 單指拖曳照舊要能動，別為了修 bug 把正常的拖曳擋掉
{
  const c = new Function(harness)();
  c.fire('pointerdown', P(1, 200, 430));
  c.fire('pointermove', P(1, 260, 430));
  const d = Math.abs(c.peek().ry - 2.28);
  const want = DRAG_K * 60;
  if (Math.abs(d - want) > 1e-9) fail.push(`✗ 單指拖曳 60px 轉了 ${d}，應該是 ${want}`);
  else ok.push(`✓ 單指拖曳 60px 轉了 ${d.toFixed(5)} rad，符合預期`);
}

ok.forEach((l) => console.log('  ' + l));
if (fail.length) {
  console.error('\n' + fail.join('\n'));
  console.error('\n捏合放開之後 last 沒有重新對齊到剩下的那根手指，看 bindControls 的 up。');
  process.exit(1);
}
console.log('\n捏合放開沒有彈開問題。');
