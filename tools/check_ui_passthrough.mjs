#!/usr/bin/env node
/**
 * 檢查游標壓在國家標籤上時，地球照樣轉得動、縮得了。
 *
 * === 踩過的坑 ===
 *
 * 畫布上面浮著一層 HTML：國家標籤。可見的那些是 .lb.on，CSS 給了
 * pointer-events: auto，因為要點得開國家卡片。代價是它們會把滑鼠事件整個吃掉。
 *
 * 而拖曳與滾輪原本掛在畫布上。標籤不是畫布的子元素，事件不會冒泡過去，所以游標
 * 只要壓在任何一個標籤上，滾輪就縮放不了、按下去也拖不動地球。畫面上隨時有幾十個
 * 標籤，等於地球上散布著幾十塊死掉的區域，而且是隨著轉動一直在換位置的死區。
 *
 * 回報的說法是「滑鼠剛好在字上面就不能放大」。
 *
 * 修法是把那幾個事件改掛在 window，再用一份選擇器把真正需要自己捲動與點擊的面板
 * 排除掉。這支驗的就是那條排除線：標籤上要通，面板上要擋。
 *
 * 用法：
 *   node tools/check_ui_passthrough.mjs
 * 有問題時 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play');
const atlas = fs.readFileSync(path.join(DIR, 'atlas.js'), 'utf8');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');

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
const decl = (re) => {
  const m = atlas.match(re);
  if (!m) throw new Error(`atlas.js 裡找不到 ${re}`);
  return m[0];
};

const fail = [];
const ok = [];
const check = (cond, msg) => { (cond ? ok : fail).push(msg); };

// 這個 bug 的前提：可見的標籤真的會吃掉事件。CSS 改掉的話這支就失去意義，先驗它。
check(/\.lb\.on\s*\{[^}]*pointer-events:\s*auto/.test(html),
      'CSS 裡可見的國家標籤仍然是 pointer-events: auto（會吃掉事件）');

const wire = `
  ${decl(/^const UI_SEL = [^;]+;/m)}
  ${decl(/^const onUI = [^;]+;/m)}
  const ZOOM_MIN = 0.004, ZOOM_MAX = 1.55;
  ${decl(/^const COVER_STEP_MAX = [^;]+;/m)}
  ${decl(/^const DRAG_K = [^;]+;/m)}
  ${decl(/^const DRAG_DEAD_PX = [^;]+;/m)}
  const R = 5;
  const view = { zoom: 1, rx: 0, ry: 0, spin: true };
  const spin = { rx: 0, ry: 0 };
  const pointers = new Map();
  let last = null, pinchStart = 0, zoomStart = 1, dragFrom = null, fly = null;
  let cleared = 0, spinStopped = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const coverDeg = () => 180;          // 飽和，滾輪那段就走原本的 zoom 步進
  const targetDist = () => 10;
  const fitDist = () => 15.4;
  const zoomForCover = () => 0.5;
  const dragRate = () => 0.006;
  const clearFocus = () => { cleared++; };
  const stopSpin = () => { spinStopped++; view.spin = false; };
  const pauseSpin = stopSpin;
  const $ = () => null;
  const H = {};
  const addEventListener = (t, f) => { (H[t] = H[t] || []).push(f); };
  const dom = { setPointerCapture: () => {}, releasePointerCapture: () => {} };
  const document = { addEventListener: () => {}, querySelectorAll: () => [] };
  ${extractFn(atlas, 'function bindControls(dom)')}
  bindControls(dom);
  return {
    fire: (t, e) => (H[t] || []).forEach((f) => f(e)),
    zoom: () => view.zoom,
    ry: () => view.ry,
    cleared: () => cleared,
    types: () => Object.keys(H),
  };
`;
const W = new Function(wire)();

// 事件的 target 替身。closest 回傳非 null 就代表落在那塊 UI 裡。
const onCanvas = { closest: () => null };                       // 畫布本身
const onLabel = { closest: () => null };                        // 國家標籤，不在 UI_SEL 裡
const inPanel = (sel) => ({ closest: (q) => (q.includes(sel) ? { id: sel } : null) });
const wheelEv = (target, dy) => ({ target, deltaY: dy, deltaMode: 0, preventDefault() {} });
const ptrEv = (target, id, x, y) => ({
  target, pointerId: id, clientX: x, clientY: y, isPrimary: true,
  preventDefault() {}, stopPropagation() {},
});

check(W.types().includes('wheel'), '滾輪掛在 window 上');
check(W.types().includes('pointerdown'), '按下掛在 window 上');

// --- 標籤上要通 ---
{
  const before = W.zoom();
  W.fire('wheel', wheelEv(onLabel, -120));
  check(W.zoom() < before, `游標壓在國家標籤上，滾輪縮放得動（${before} → ${W.zoom().toFixed(3)}）`);
}
{
  const before = W.ry();
  W.fire('pointerdown', ptrEv(onLabel, 1, 400, 300));
  W.fire('pointermove', ptrEv(onLabel, 1, 460, 300));
  W.fire('pointerup', ptrEv(onLabel, 1, 460, 300));
  check(W.ry() !== before, '從國家標籤上按下去，地球拖得動');
}
// --- 畫布上當然要通 ---
{
  const before = W.zoom();
  W.fire('wheel', wheelEv(onCanvas, -120));
  check(W.zoom() < before, '游標在地球上，滾輪照常縮放');
}
// --- 面板上要擋 ---
for (const sel of ['#top', '#cc-card', '#hint', '#tour']) {
  const before = W.zoom();
  W.fire('wheel', wheelEv(inPanel(sel), -120));
  check(W.zoom() === before, `游標在 ${sel} 上，滾輪留給面板自己捲動`);
}
{
  const before = W.ry();
  W.fire('pointerdown', ptrEv(inPanel('#top'), 2, 100, 300));
  W.fire('pointermove', ptrEv(inPanel('#top'), 2, 200, 300));
  W.fire('pointerup', ptrEv(inPanel('#top'), 2, 200, 300));
  check(W.ry() === before, '在左側面板上拖曳不會轉動地球');
}

// --- 拖曳的靈敏度 ---
//
// 螢幕上每一像素對應的世界距離是 2 · d · tan(fov/2) / 畫面高，所以拖曳一像素該轉
// 多少角度，除了距離還跟視角有關。原本只算了距離，而貼近地表時鏡頭從 45 度收到
// 18 度，tan 比是 2.62，漏掉那一項就是拖曳快了 2.62 倍，手指動一點點地球就甩過去。
{
  const src = `
    const R = 5;
    ${decl(/^const FOV_FAR = [^;]+;/m)}
    ${decl(/^const DRAG_K = [^;]+;/m)}
    ${decl(/^const DRAG_TAN_REF = [^;]+;/m)}
    let camera = { fov: 45, position: { z: 15.42 } };
    const fitDist = () => 15.42;
    ${extractFn(atlas, 'function dragRate()')}
    return { rate: (d, fov) => { camera = { fov, position: { z: d } }; return dragRate(); } };
  `;
  const D = new Function(src)();
  const base = D.rate(15.42, 45);
  check(Math.abs(base - 0.006) < 1e-9, `進場時的手感沒變（${base}）`);
  // 只有距離變、視角不變的話，靈敏度正比於離地距離
  const half = D.rate(5 + (15.42 - 5) / 2, 45);
  check(Math.abs(half / base - 0.5) < 1e-6, '距離減半，靈敏度也減半');
  // 同一個距離換成望遠鏡頭，靈敏度要照 tan 比往下收
  const near = D.rate(10, 45), tele = D.rate(10, 18);
  const want = Math.tan(18 * Math.PI / 360) / Math.tan(45 * Math.PI / 360);
  check(Math.abs(tele / near - want) < 1e-6,
        `同一個距離下 18 度鏡頭的靈敏度是 45 度的 ${(tele / near).toFixed(3)}（應為 ${want.toFixed(3)}）`);
  check(tele < near * 0.45, '換成望遠鏡頭之後拖曳明顯變慢，不會手指動一點點就甩過去');
}

// --- 點浮在地表上方多少 ---
//
// 點的大小有補償，貼近時世界尺寸會縮，浮空高度卻是寫死的倍率。遠看時 0.06 個
// 世界單位看不出來，貼到縣市尺度時相機離地只剩 0.156，那個高度就佔了 38%，
// 整片點看起來浮在地面上方一截。
{
  const src = `
    ${decl(/^const DOT_LIFT = [^;]+;/m)}
    ${decl(/^const liftAt = [^;]+;/m)}
    return { liftAt, DOT_LIFT };
  `;
  const L = new Function(src)();
  check(Math.abs(L.liftAt(L.DOT_LIFT, 1) - L.DOT_LIFT) < 1e-12, '遠看時高度維持原值，進場的樣子沒變');
  check(Math.abs(L.liftAt(L.DOT_LIFT, 0) - 1) < 1e-12, '貼到極限時高度收到貼著地表');
  // 高度與點半徑的比例要維持不變，點才會在任何距離下都像貼在地表上
  const ratio = (k) => (L.liftAt(L.DOT_LIFT, k) - 1) / k;
  check(Math.abs(ratio(1) - ratio(0.1)) < 1e-12, '高度與點半徑的比例不隨距離變');
  // 實際的量級：貼近時相機離地 0.156 個半徑，點不該佔掉三成
  const alt = 0.156, R = 5;
  const before = R * (L.DOT_LIFT - 1) / alt;
  const after = R * (L.liftAt(L.DOT_LIFT, Math.pow(0.05, 0.85)) - 1) / alt;
  check(before > 0.3 && after < 0.06,
        `zoom 0.05 時點的高度從離地高度的 ${(before * 100).toFixed(0)}% 降到 ${(after * 100).toFixed(0)}%`);
}

for (const m of ok) console.log(`  ok   ${m}`);
if (fail.length) {
  console.error('');
  for (const m of fail) console.error(`  FAIL ${m}`);
  console.error(`\n${fail.length} 項沒過（共 ${ok.length + fail.length} 項）`);
  process.exit(1);
}
console.log(`\n全部 ${ok.length} 項通過`);
