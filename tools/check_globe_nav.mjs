#!/usr/bin/env node
/**
 * 地球儀的拖曳、縮放與滑行，對齊地圖 App 的那幾條手感。
 *
 * Google Maps 與 Apple Maps 順的原因是同一件事：手指或游標底下那一點地表，從按下到
 * 放開都留在原位。拖曳、滾輪、雙指捏合都是。另外所有動畫都以秒計，跟螢幕更新率無關。
 *
 * 這支用真的 bindControls 與從 atlas.js 抽出來的函式，配一個跟 three.js 同慣例的相機
 * （在 (0,0,z) 看原點，地球的旋轉是 Euler XYZ），逐項驗：
 *
 *   一、解算器精確、連續，不在兩組解之間跳
 *   二、拖曳 400 像素，一開始抓住的那一點仍在手指底下，高緯度也一樣
 *   三、滾輪以游標為中心，縮放動畫的每一幀那一點都不動
 *   四、捏合以兩指中點為中心，中點移動就平移
 *   五、同一個動作在 30、60、120、144 Hz 下花的時間一樣
 *   六、放開後的滑行速度看手速不看事件頻率，停住再放開不滑
 *   七、滾輪放大縮小互為倒數，觸控板捏合的量級對得上地圖 App
 *   八、中繼點大小的補償用比例門檻，貼近時不會一段一段跳
 *   九、從整顆地球放到最近，涵蓋度、離地高度、視角三者都單調，鏡頭接縫處連續
 *
 * 用法：node tools/check_globe_nav.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ATLAS = path.join(ROOT, 'docs/zh-TW/games/tor-network/play/atlas.js');
const atlas = fs.readFileSync(ATLAS, 'utf8');

function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`atlas.js 裡找不到 ${header}`);
  // 從參數列收尾之後才開始數大括號。camFor(z, out = {}) 這種預設參數裡的那一對
  // 大括號會被當成函式本體，抽出來的只剩函式頭
  let depth = 0, started = false;
  for (let j = i + header.length; j < src.length; j++) {
    if (src[j] === '{') { depth++; started = true; }
    else if (src[j] === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error(`${header} 的大括號沒有收尾`);
}
const decl = (re) => {
  const m = atlas.match(re);
  if (!m) throw new Error(`atlas.js 裡找不到 ${re}`);
  return m[0];
};
function grabKit() {
  const a = atlas.indexOf('// ---- 抓住地表的一點 ----');
  const b = atlas.indexOf('// 一格滾輪最多讓涵蓋的地表變動幾成。');
  if (a < 0 || b < a) throw new Error('atlas.js 裡找不到抓取工具那一段');
  return atlas.slice(a, b);
}

// 滾輪錨點的收斂門檻。下面的 frame() 照抄 animate 那幾行，門檻從原始碼抽，兩邊才不會漂開
const SETTLE = (() => {
  const m = atlas.match(/Math\.log\(zoomCam \/ view\.zoom\)\) < ([0-9.e-]+);/);
  if (!m) throw new Error('atlas.js 裡找不到滾輪錨點的收斂門檻');
  return m[1];
})();

const pass = [], fail = [];
const check = (ok, msg) => (ok ? pass : fail).push((ok ? '✓ ' : '✗ ') + msg);

// ---- 相機與地球的替身，慣例跟 three.js 一致 ----
const W = 1280, H = 800;
const harness = `
  const THREE = { Vector3: class { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } } };
  const R = 5, W = ${W}, H = ${H}, ASPECT = W / H;
  const cam = { z: 12, fov: 45 };
  const view = { zoom: 1, rx: 0, ry: 0, spin: false };
  const spin = { rx: 0, ry: 0, v0: 0 };
  const pointers = new Map();
  let last = null, pinchStart = 0, zoomStart = 1, dragFrom = null, fly = null;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  ${decl(/^const ZOOM_MIN = [^;]+;/m)}
  ${decl(/^const DRAG_DEAD_PX = [^;]+;/m)}
  ${decl(/^const COVER_STEP_MAX = [^;]+;/m)}
  ${decl(/^const WHEEL_K = [^;]+;/m)}
  ${decl(/^const WHEEL_K_PINCH = [^;]+;/m)}
  ${decl(/^const WHEEL_PX_MAX = [^;]+;/m)}
  const DRAG_GRAB = true;
  const REDUCED = false;
  // 真的 sphereAt 走 THREE.Raycaster，這裡用同一條射線的閉式解
  function sphereAt(sx, sy, out) {
    const t = Math.tan(cam.fov * Math.PI / 360);
    let dx = (sx / W * 2 - 1) * t * ASPECT, dy = -(sy / H * 2 - 1) * t, dz = -1;
    const L = Math.hypot(dx, dy, dz); dx /= L; dy /= L; dz /= L;
    const b = cam.z * dz, c = cam.z * cam.z - R * R, disc = b * b - c;
    if (disc < 0) return null;
    const s = -b - Math.sqrt(disc);
    const px = dx * s, py = dy * s, pz = cam.z + dz * s;
    return out.set(px / R, py / R, pz / R);
  }
  // 單位球上、地球本身座標的一點，照目前的旋轉投影回螢幕
  function project(p) {
    const x1 = Math.cos(view.ry) * p.x + Math.sin(view.ry) * p.z, z1 = -Math.sin(view.ry) * p.x + Math.cos(view.ry) * p.z;
    const wy = Math.cos(view.rx) * p.y - Math.sin(view.rx) * z1, wz = Math.sin(view.rx) * p.y + Math.cos(view.rx) * z1;
    const t = Math.tan(cam.fov * Math.PI / 360), dz = cam.z - wz * R;
    return [(x1 * R / dz / (t * ASPECT) + 1) / 2 * W, (1 - wy * R / dz / t) / 2 * H];
  }
  const fitDist = () => { const v = cam.fov * Math.PI / 180, h = 2 * Math.atan(Math.tan(v / 2) * ASPECT);
    return R * 1.18 / Math.sin(Math.min(v, h) / 2); };
  const targetDist = () => R + (fitDist() - R) * view.zoom;
  const coverDeg = () => 90;           // 滾輪那段的涵蓋度上限在這裡不驗，給一個不會觸發的值
  const coverOfZoom = () => 90;
  const zoomForCover = () => view.zoom;
  const dragRate = () => 0.006 * Math.max(0.05, cam.z - R) / (fitDist() - R);
  const clearFocus = () => {}, stopSpin = () => {}, pauseSpin = () => {};
  const $ = () => null;
  const H_ = {};
  const addEventListener = (t, f) => { (H_[t] = H_[t] || []).push(f); };
  const dom = { setPointerCapture() {}, hasPointerCapture() { return true; } };
  const document = { addEventListener() {}, querySelectorAll: () => [] };
  const onUI = () => false;
  ${grabKit()}
  ${extractFn(atlas, 'function bindControls(dom)')}
  bindControls(dom);

  // animate 裡跟縮放與錨點有關的那幾行，順序照 atlas.js：相機距離 → 錨點 → 滑行在前
  function frame(dt) {
    if (pointers.size === 0 && (spin.ry || spin.rx)) {
      view.ry += spin.ry * dt; view.rx = clamp(view.rx + spin.rx * dt, -RX_MAX, RX_MAX);
      const k = Math.exp(-dt / FLING_TAU); spin.ry *= k; spin.rx *= k;
      if (Math.hypot(spin.rx, spin.ry) < (spin.v0 || 0) * 0.01) spin.rx = spin.ry = 0;
    }
    const alt = cam.z - R, altT = targetDist() - R;
    cam.z = R + (alt > 0 && altT > 0 ? altT * Math.pow(alt / altT, 1 - ease(dt, zoomTau)) : altT);
    if (anchor) {
      const ok = holdAnchor();
      if (anchor.kind === 'wheel') {
        const settled = Math.abs(Math.log((cam.z - R) / (targetDist() - R))) < ${SETTLE};
        if (!ok || settled) anchor = null;
      }
    }
  }
  return {
    fire: (t, e) => (H_[t] || []).forEach((f) => f(e)),
    frame, project, sphereAt, solveGrab, toGlobeLocal, ease,
    V: THREE.Vector3,
    view, spin, cam, targetDist,
    anchor: () => anchor,
    consts: { ZOOM_TAU, ZOOM_TAU_FAST, FLY_TAU, FLING_TAU, RX_MAX, WHEEL_K, WHEEL_K_PINCH },
    settle: () => { cam.z = targetDist(); },
    grabLocal: (sx, sy) => { const w = sphereAt(sx, sy, new THREE.Vector3()); return w && toGlobeLocal(w, new THREE.Vector3()); },
  };
`;
const mk = () => new Function(harness)();
const P = (id, x, y, t) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: t, target: null, preventDefault() {} });
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ── 一、解算器 ──
{
  const G = mk();
  const rnd = (a, b) => a + Math.random() * (b - a);
  const unit = () => { const z = rnd(-1, 1), t = rnd(0, Math.PI * 2), r = Math.sqrt(1 - z * z); return new G.V(r * Math.cos(t), z, r * Math.sin(t)); };
  let worst = 0, n = 0;
  for (let i = 0; i < 5000; i++) {
    G.view.rx = rnd(-1.2, 1.2); G.view.ry = rnd(-8, 8);
    const w0 = unit(); if (w0.z < 0.2) continue;
    const p = G.toGlobeLocal(w0, new G.V());
    const w = unit(); if (w.z < 0.2) continue;
    const r = G.solveGrab(p, w, G.view.rx, G.view.ry);
    if (!r || Math.abs(r.rx) >= G.consts.RX_MAX - 1e-9) continue;
    G.view.rx = r.rx; G.view.ry = r.ry;
    const x1 = Math.cos(r.ry) * p.x + Math.sin(r.ry) * p.z, z1 = -Math.sin(r.ry) * p.x + Math.cos(r.ry) * p.z;
    const q = [x1, Math.cos(r.rx) * p.y - Math.sin(r.rx) * z1, Math.sin(r.rx) * p.y + Math.cos(r.rx) * z1];
    worst = Math.max(worst, Math.hypot(q[0] - w.x, q[1] - w.y, q[2] - w.z)); n++;
  }
  check(n > 300 && worst < 1e-9, `解算器 ${n} 組隨機測試，落點誤差最大 ${worst.toExponential(1)}`);

  // 連續性：手指一小步一小步移動時，兩組解不能互換。換了就是地球突然翻到另一邊
  G.view.rx = 0.6; G.view.ry = 1.0;
  const p = G.toGlobeLocal(new G.V(0.1, 0.2, Math.sqrt(0.95)), new G.V());
  let rx, ry, jumps = 0, steps = 0;
  for (let k = 0; k <= 400; k++) {
    const a = -0.4 + 0.8 * k / 400;
    const w = new G.V(Math.sin(a) * 0.9, 0.2 + 0.3 * Math.sin(k / 40), 0);
    w.z = Math.sqrt(Math.max(0, 1 - w.x * w.x - w.y * w.y));
    const r = G.solveGrab(p, w, rx ?? G.view.rx, ry ?? G.view.ry);
    if (!r) continue;
    if (rx !== undefined && (Math.abs(r.rx - rx) > 0.1 || Math.abs(r.ry - ry) > 0.1)) jumps++;
    rx = r.rx; ry = r.ry; steps++;
  }
  check(steps > 300 && jumps === 0, `連續移動 ${steps} 步，解在兩組之間跳了 ${jumps} 次`);
}

// ── 二、拖曳 ──
for (const [rx0, zoom, fov, label, old] of [[0, 0.6, 45, '赤道正面 遠看', 11], [0.62, 0.6, 45, '北緯 35 度 遠看', 77],
                                             [0.62, 0.05, 18, '北緯 35 度 貼近', 75], [1.0, 0.05, 18, '北緯 57 度 貼近', 185]]) {
  const G = mk();
  G.view.rx = rx0; G.view.ry = 0.3; G.view.zoom = zoom; G.cam.fov = fov; G.settle();
  let x = W / 2 - 100, y = H / 2 - 40;
  const pL = G.grabLocal(x, y);
  G.fire('pointerdown', P(1, x, y, 0));
  let worst = 0;
  for (let i = 1; i <= 40; i++) {
    x += 10; y += 3;
    G.fire('pointermove', P(1, x, y, i * 16));
    G.frame(1 / 60);
    worst = Math.max(worst, dist(G.project(pL), [x, y]));
  }
  G.fire('pointerup', P(1, x, y, 40 * 16 + 200));
  check(worst < 0.5, `拖曳 400 像素，${label}，抓住的那一點離手指最遠 ${worst.toFixed(3)} 像素（舊寫法 ${old}）`);
}

// ── 三、滾輪以游標為中心 ──
for (const [zoom, fov, label] of [[0.5, 45, '遠看'], [0.05, 18, '貼近'], [0.01, 18, '縣市級']]) {
  const G = mk();
  G.view.rx = 0.4; G.view.ry = 1.0; G.view.zoom = zoom; G.cam.fov = fov; G.settle();
  const cx = W / 2 + 300, cy = H / 2 + 150;
  const pL = G.grabLocal(cx, cy);
  let worst = 0;
  for (let n = 0; n < 4; n++) {
    G.fire('wheel', { deltaY: -100, deltaMode: 0, clientX: cx, clientY: cy, target: null, preventDefault() {} });
    for (let f = 0; f < 3; f++) { G.frame(1 / 60); worst = Math.max(worst, dist(G.project(pL), [cx, cy])); }
  }
  for (let f = 0; f < 120; f++) { G.frame(1 / 60); worst = Math.max(worst, dist(G.project(pL), [cx, cy])); }
  check(worst < 0.5 && G.view.zoom < zoom * 0.75,
        `滾輪放大四格，${label}，游標底下那一點在整段動畫裡最多偏 ${worst.toFixed(3)} 像素（舊寫法跑到 120 像素外）`);
  check(G.anchor() === null, `滾輪動畫收斂之後放開錨點，${label}`);
}
{
  // 游標在球外沒有東西可抓，照舊朝畫面中央縮，而且不會出錯
  const G = mk(); G.view.zoom = 1; G.settle();
  G.fire('wheel', { deltaY: -100, deltaMode: 0, clientX: 5, clientY: 5, target: null, preventDefault() {} });
  const ry0 = G.view.ry; for (let f = 0; f < 60; f++) G.frame(1 / 60);
  check(G.anchor() === null && G.view.ry === ry0 && G.view.zoom < 1, '游標在球外滾輪，朝畫面中央縮、不轉動');
}

// ── 四、捏合 ──
{
  const G = mk();
  G.view.rx = 0.5; G.view.ry = 0.8; G.view.zoom = 0.1; G.cam.fov = 18; G.settle();
  const a = [560, 380], b = [760, 420];
  const mid = () => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const pL = G.grabLocal(...mid());
  G.fire('pointerdown', P(1, ...a, 0)); G.fire('pointerdown', P(2, ...b, 0));
  let worst = 0;
  for (let i = 1; i <= 30; i++) {
    a[0] -= 4; b[0] += 4; a[1] += 2; b[1] += 2;       // 張開，同時整體往下平移
    G.fire('pointermove', P(1, ...a, i * 16)); G.fire('pointermove', P(2, ...b, i * 16));
    G.frame(1 / 60);
  }
  for (let f = 0; f < 30; f++) { G.frame(1 / 60); worst = Math.max(worst, dist(G.project(pL), mid())); }
  check(worst < 0.5 && G.view.zoom < 0.1, `雙指張開同時平移，兩指中點底下那一點偏 ${worst.toFixed(3)} 像素`);
  // 捏合期間的延遲：手指停住之後 100 毫秒內，畫面要追到九成九
  const G2 = mk(); G2.view.zoom = 0.3; G2.settle();
  G2.fire('pointerdown', P(1, 600, 400, 0)); G2.fire('pointerdown', P(2, 700, 400, 0));
  G2.fire('pointermove', P(2, 800, 400, 16));
  const want = G2.targetDist() - 5, start = G2.cam.z - 5;
  for (let f = 0; f < 6; f++) G2.frame(1 / 60);
  const done = Math.log((G2.cam.z - 5) / start) / Math.log(want / start);
  check(done > 0.99, `捏合跟手：手指停下 100 毫秒內畫面追到 ${(done * 100).toFixed(1)}%（舊寫法約 54%）`);
}

// ── 五、幀率無關 ──
{
  const times = [];
  for (const hz of [30, 60, 120, 144]) {
    const G = mk(); G.view.zoom = 0.5; G.settle();
    const start = G.cam.z - 5;
    G.fire('wheel', { deltaY: -100, deltaMode: 0, clientX: 1, clientY: 1, target: null, preventDefault() {} });
    const want = G.targetDist() - 5;
    let t = 0;
    while (Math.abs(Math.log((G.cam.z - 5) / want)) > 0.05 * Math.abs(Math.log(start / want))) { G.frame(1 / hz); t += 1 / hz; }
    times.push([hz, t * 1000]);
  }
  const spread = Math.max(...times.map((x) => x[1])) - Math.min(...times.map((x) => x[1]));
  check(spread < 34, `滾輪一格到位的時間 ${times.map(([h, t]) => `${h} Hz ${t.toFixed(0)} ms`).join('、')}，差距在一幀以內（舊寫法 800 到 167 ms）`);
}

// ── 六、滑行 ──
const flingRun = (evHz, fps, pauseMs) => {
  const G = mk(); G.view.zoom = 0.6; G.settle();
  let x = 400, t = 0;
  G.fire('pointerdown', P(1, x, 400, t));
  const dt = 1000 / evHz;
  for (let i = 0; i < evHz / 4; i++) { x += 1200 / evHz; t += dt; G.fire('pointermove', P(1, x, 400, t)); }
  const ry0 = G.view.ry;
  G.fire('pointerup', P(1, x, 400, t + pauseMs));
  const v = G.spin.ry;
  for (let f = 0; f < fps * 3; f++) G.frame(1 / fps);
  return { v, slid: G.view.ry - ry0 };
};
{
  const a = flingRun(60, 60, 0), b = flingRun(120, 120, 0), c = flingRun(60, 120, 0), d = flingRun(120, 60, 0);
  const vs = [a, b, c, d].map((r) => r.slid);
  const spread = (Math.max(...vs) - Math.min(...vs)) / Math.max(...vs);
  check(a.v > 0 && spread < 0.05, `同樣 1200 px/s 放開，事件 60 或 120 Hz、畫面 60 或 120 Hz，滑行距離差 ${(spread * 100).toFixed(1)}%（舊寫法差一倍）`);
  const e = flingRun(60, 60, 300);
  check(e.v === 0 && Math.abs(e.slid) < 1e-12, '拖到定點停住 300 毫秒再放開，不滑（舊寫法最後一步 5 像素就會滑 62 像素）');
}

// ── 七、滾輪 ──
{
  const G = mk(); G.view.zoom = 0.3; G.settle();
  const z0 = G.view.zoom;
  const wheel = (dy, ctrl = false) => G.fire('wheel', { deltaY: dy, deltaMode: 0, ctrlKey: ctrl, clientX: 1, clientY: 1, target: null, preventDefault() {} });
  for (let i = 0; i < 10; i++) wheel(-100);
  for (let i = 0; i < 10; i++) wheel(100);
  check(Math.abs(G.view.zoom / z0 - 1) < 1e-9, `放大十格再縮小十格回到原點（${(G.view.zoom / z0).toFixed(6)}，舊寫法停在 0.938）`);
  const z1 = G.view.zoom; wheel(-100);
  check(Math.abs(z1 / G.view.zoom - 1 / 0.92) < 1e-9, '滑鼠一格仍然是 8%，手感沒變');
  const z2 = G.view.zoom; wheel(5, true);
  const pct = (G.view.zoom / z2 - 1) * 100;
  check(pct > 4.5 && pct < 5.5, `觸控板捏合 deltaY 5 縮放 ${pct.toFixed(2)}%（舊寫法 0.40%，Google Maps 約 5%）`);
  const z3 = G.view.zoom; wheel(-900);
  check(Math.abs(Math.log(z3 / G.view.zoom) - Math.log(1 / 0.92)) < 1e-9, '一個事件送 900 像素也只算一格');
}

// ── 八、點的大小 ──
{
  const uses = (atlas.match(/Math\.abs\(k \/ last\w+K - 1\) < DOT_STEP/g) || []).length;
  const abs = (atlas.match(/Math\.abs\(k - last\w+K\) < DOT_STEP/g) || []).length;
  check(uses === 5 && abs === 0, `五個點層的大小補償都用比例門檻（比例 ${uses} 處、差值 ${abs} 處）`);
  const exp = parseFloat(decl(/^const DOT_EXP = [^;]+;/m).split('=')[1]);
  const step = parseFloat(decl(/^const DOT_STEP = [^;]+;/m).split('=')[1]);
  let last = Math.pow(0.02, exp), n = 0, jump = 1;
  for (let i = 1; i <= 400; i++) {
    const k = Math.pow(0.02 * Math.pow(0.4, i / 400), exp);
    if (Math.abs(k / last - 1) >= step) { jump = Math.max(jump, last / k); last = k; n++; }
  }
  check(n > 20 && jump < 1.03, `zoom 0.02 放到 0.008，點的大小重算 ${n} 次、單次跳 ${((jump - 1) * 100).toFixed(1)}%（舊寫法 0 次）`);
}

// ── 接線順序：錨點要在相機定位之後、寫進地球旋轉之前解 ──
{
  const body = extractFn(atlas, 'async function animate()');
  const iCam = body.indexOf('camFor(zoomCam'), iHold = body.indexOf('holdAnchor()'), iRot = body.indexOf('globe.rotation.y = view.ry');
  check(iCam > 0 && iHold > iCam && iRot > iHold, 'animate 裡的順序是 camFor 定鏡頭與距離 → holdAnchor → 寫入地球旋轉');
  check(!/\*\s*0\.12;|\*\s*0\.09;|\*=\s*0\.92/.test(body), 'animate 裡沒有剩下綁幀率的每幀比例');
}

// ── 九、鏡頭與距離由同一個 zoom 推出，全程單調 ──
//
// 原本鏡頭依目標瞬間換、距離慢慢追，62 度以內每滾一格都是「猛然拉近再往回退」，
// 離地高度從 5.4 爬回 7.5。這裡把 camFor 那一組原樣抽出來，從 ZOOM_MAX 掃到 ZOOM_MIN。
for (const [aw, ah, label] of [[1280, 800, '桌機'], [390, 844, '直式手機']]) {
  const src = `
    const R = 5;
    const camera = { aspect: ${aw} / ${ah}, fov: 45 };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    ${decl(/^const ZOOM_MIN = [^;]+;/m)}
    ${decl(/^const FOV_FAR = [^;]+;/m)}
    const FOV_NEAR = 18;
    ${decl(/^const FOV_HI_COVER = [^;]+;/m)}
    ${extractFn(atlas, 'function fitDistAt(fovDeg)')}
    ${extractFn(atlas, 'function coverDeg(dist, fovDeg)')}
    ${extractFn(atlas, 'function fitDistFar()')}
    ${extractFn(atlas, 'function coverOfZoom(z)')}
    ${extractFn(atlas, 'function fovForCoverAt(cover, d)')}
    ${extractFn(atlas, 'function distForCover(cover, fovDeg)')}
    ${extractFn(atlas, 'function camFor(z, out = {})')}
    ${extractFn(atlas, 'function zoomForCover(deg)')}
    return { camFor, coverDeg, coverOfZoom, zoomForCover, ZOOM_MIN, ZOOM_MAX, set: (f) => { camera.fov = f; } };
  `;
  const L = new Function(src)();
  let prev = null, bad = { cover: 0, alt: 0, fov: 0 }, jump = 0, worstInv = 0, n = 0;
  for (let i = 0; i <= 4000; i++) {
    const z = L.ZOOM_MAX * Math.pow(L.ZOOM_MIN / L.ZOOM_MAX, i / 4000);
    const c = L.camFor(z);
    L.set(c.fov);
    const cov = L.coverDeg(c.dist, c.fov);
    // camFor 給的鏡頭與距離，實際看到的涵蓋度要等於 zoom 宣稱的涵蓋度
    const want = L.coverOfZoom(z);
    if (want < 179) worstInv = Math.max(worstInv, Math.abs(cov - want));
    if (prev) {
      if (cov > prev.cov + 1e-9) bad.cover++;
      if (c.dist > prev.dist + 1e-9) bad.alt++;
      if (c.fov > prev.fov + 1e-9) bad.fov++;
      jump = Math.max(jump, Math.abs(c.fov - prev.fov), Math.abs(c.dist - prev.dist) / prev.dist * 45);
    }
    prev = { cov, dist: c.dist, fov: c.fov }; n++;
  }
  check(bad.cover + bad.alt + bad.fov === 0,
        `${label}：zoom 從 ${L.ZOOM_MAX} 掃到 ${L.ZOOM_MIN}（${n} 點），涵蓋度、離地高度、視角反向 ${bad.cover}、${bad.alt}、${bad.fov} 次（舊寫法離地從 5.4 爬回 7.5）`);
  check(jump < 0.2, `${label}：相鄰兩點之間視角最多變 ${jump.toFixed(3)} 度，三段的接縫處連續`);
  check(worstInv < 1e-6, `${label}：camFor 推出的鏡頭與距離，實際涵蓋度跟 zoom 宣稱的差 ${worstInv.toExponential(1)} 度`);
  let inv = 0;
  for (const deg of [120, 80, 62, 40, 26, 20, 10, 2, 0.6]) {
    const z = L.zoomForCover(deg); if (z > L.ZOOM_MIN * 1.001) inv = Math.max(inv, Math.abs(L.coverOfZoom(z) - deg));
  }
  check(inv < 1e-3, `${label}：zoomForCover 與 coverOfZoom 互為反函數（誤差 ${inv.toExponential(1)} 度）`);
}

console.log(pass.join('\n'));
if (fail.length) {
  console.log(fail.join('\n'));
  console.log(`\n${fail.length} 項沒過。`);
  process.exit(1);
}
console.log(`\n全部 ${pass.length} 項通過。`);
