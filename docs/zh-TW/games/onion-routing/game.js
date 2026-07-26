// 洋蔥路由解謎 · 主程式
// three.js WebGPURenderer + TSL bloom；不支援 WebGPU 時自動退回 WebGL2。
// 玩法：依序點 3 個中繼組成 guard→middle→exit，送出後封包沿路徑流動並逐跳剝一層洋蔥。
import * as THREE from 'three';
import { color, uniform, pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { LEVELS, REGIONS } from './levels.js';
import { STR, t, pickLang } from './i18n.js';

const LANG = pickLang();
const S = (k, v) => t(LANG, k, v);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches; // 減少動態偏好

// ---- 顏色 / 尺寸 ----
const COL = {
  source: 0x7ffcff,
  dest: 0xffd27f,
  surveilled: 0xff3b3b,
  blocked: 0x59657a,
  blockedRing: 0xff3b3b,
  bridge: 0x00e5ff,
  path: 0x2fd4ff,
  packet: 0xffffff,
  shell: [0x00aeff, 0x33ccff, 0x99ecff],
};
const R_RELAY = 0.9, R_END = 1.4, R_BRIDGE = 1.0;

// ---- DOM ----
const $ = (id) => document.getElementById(id);
const el = {
  backend: $('backend'),
  levelName: $('level-name'),
  objective: $('objective'),
  slots: [$('slot-0'), $('slot-1'), $('slot-2')],
  send: $('btn-send'),
  reset: $('btn-reset'),
  tooltip: $('tooltip'),
  card: $('card'),
  cardTitle: $('card-title'),
  cardBody: $('card-body'),
  cardLink: $('card-link'),
  cardNext: $('btn-next'),
  feedback: $('feedback'),
  hint: $('hint'),
  legendToggle: $('legend-toggle'),
  legend: $('legend'),
};

function initStaticText() {
  document.title = S('gameTitle') + ' · anoni.net';
  $('brand-title').textContent = S('gameTitle');
  $('brand-tagline').textContent = S('tagline');
  el.send.textContent = S('btnSend');
  el.reset.textContent = S('btnReset');
  $('hop-label-0').textContent = S('hopGuard');
  $('hop-label-1').textContent = S('hopMiddle');
  $('hop-label-2').textContent = S('hopExit');
  // 窄螢幕用短版，長句在手機會擠成三行、把提示列撐高，反過來壓縮到場景
  $('hint-text').textContent = matchMedia('(max-width:560px)').matches ? S('hintShort') : (S('selectHint') + ' ' + S('dragHint'));
  el.legendToggle.textContent = S('legendTitle');
  const hex = (v) => '#' + v.toString(16).padStart(6, '0');
  const regionDots = Object.values(REGIONS)
    .map((r) => `<span class="lg-chip"><i class="lg-dot sm" style="background:${hex(r.color)}"></i>${r.place}</span>`).join('');
  $('legend-body').innerHTML = [
    ['#7ffcff', S('legendSource')],
    ['#ffd27f', S('legendDest')],
    ['#00e5ff', S('legendBridge')],
    ['#ff3b3b', S('legendSurveilled')],
    ['#59657a', S('legendBlocked')],
  ].map(([c, label]) => `<div class="lg-row"><span class="lg-dot" style="background:${c}"></span>${label}</div>`).join('')
    + `<div class="lg-note">${S('legendRegion')}</div><div class="lg-regions">${regionDots}</div>`
    + `<div class="lg-note">${S('selectHint')} ${S('dragHint')}</div>`;
}

function nodeLabel(n) {
  if (n.role === 'source') return S('legendSource');
  if (n.role === 'dest') return S('legendDest');
  if (n.bridge) return `${n.transport}｜${S('legendBridge')}`;
  const rg = REGIONS[n.region];
  let s = `${rg.place} ${rg.asn}`;
  if (n.surveilled) s += `（${S('legendSurveilled')}）`;
  if (n.blocked) s += `（${S('legendBlocked')}）`;
  return s;
}

// ---- three.js 起手 ----
let renderer, scene, camera, post;
const raycaster = new THREE.Raycaster();
const TARGET = new THREE.Vector3(0, 0, 0);

// 沒走到 WebGPU 時，把卡在哪一關講出來。最常見的是頁面不是 https 或 localhost，
// WebGPU 要求 secure context，WebGL2 不要求，所以會安靜地退回去。
async function webgpuBlocker() {
  if (new URLSearchParams(location.search).get('backend') === 'webgl') return '網址帶了 backend=webgl';
  if (!window.isSecureContext) return '頁面不是 https 或 localhost';
  if (!navigator.gpu) return '這個瀏覽器沒有 WebGPU';
  try {
    if (!(await navigator.gpu.requestAdapter())) return '系統沒有給出可用的 GPU';
  } catch (e) { return 'WebGPU 被擋下'; }
  return '';
}

async function initRenderer() {
  const hasGPU = !!navigator.gpu;
  const hasGL2 = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })();
  const forceWebGL = new URLSearchParams(location.search).get('backend') === 'webgl';
  if (!hasGL2 && (forceWebGL || !hasGPU)) { el.backend.textContent = S('backendError'); el.backend.className = 'err'; return false; }

  renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);
  try { await renderer.init(); } catch (e) { el.backend.textContent = S('backendError'); el.backend.className = 'err'; return false; }

  const isGPU = !!(renderer.backend && renderer.backend.isWebGPUBackend);
  el.backend.textContent = isGPU ? S('backendWebGPU') : S('backendWebGL');
  el.backend.className = isGPU ? 'gpu' : 'gl';
  if (!isGPU) webgpuBlocker().then((why) => { if (why) el.backend.textContent = `${S('backendWebGL')}：${why}`; });

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070e);
  scene.fog = new THREE.Fog(0x05070e, 42, 90);

  camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.5, 400);

  scene.add(new THREE.HemisphereLight(0x223355, 0x0a0a12, 0.9));
  const key = new THREE.DirectionalLight(0xbfe6ff, 1.1);
  key.position.set(12, 20, 18); scene.add(key);

  addStarfield();

  post = new THREE.PostProcessing(renderer);
  const scenePass = pass(scene, camera);
  const col = scenePass.getTextureNode('output');
  post.outputNode = col.add(bloom(col, 1.0, 0.6, 0.55));

  addEventListener('resize', onResize);
  return true;
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function addStarfield() {
  const N = 600, pos = new Float32Array(N * 3);
  // 以節點索引式分布避免隨機 API；用三角函數散布
  for (let i = 0; i < N; i++) {
    const a = i * 2.399963, r = 60 + (i % 37) * 3;
    const y = ((i * 13) % 120) - 60;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsNodeMaterial({ color: 0x6688aa, size: 0.5, sizeAttenuation: true, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(g, m));
}

// ---- 自訂 orbit（拖曳旋轉、滾輪、雙指縮放）+ 點擊選節點 ----
// zoom 是「相對於場景剛好入鏡的倍率」。距離寫死的話，直式手機的水平視野只涵蓋 ±7.7，
// 而寄件端與收件人在 ±16，兩端會整個掉到畫面外，關卡等於少了頭尾。
const orbit = { theta: Math.PI * 0.5, phi: Math.PI * 0.42, zoom: 1, idle: 0 };
const ZOOM_MIN = 0.5, ZOOM_MAX = 2;
const CONTENT_LONG = 17.5;  // 寄件端與收件人在 ±16，加上球半徑與留白
const CONTENT_SHORT = 7.5;  // 中繼的 y、z 大約在 ±6
const pointers = new Map();
let downPos = null, dragged = false, pinchStart = 0, zoomStart = 1;

function isPortrait() { return innerWidth < innerHeight; }

// 直式時上下都有面板壓在畫面上（標題在上、操作區在下），可用高度要先扣掉，
// 場景再往兩塊面板中間對齊，節點與端點才不會躲在面板後面點不到。
function uiInsets() {
  if (!isPortrait()) return { top: 0, bottom: 0 };
  const cap = innerHeight * 0.35; // 保底，面板再高也留得下中間那段
  let top = 0, bottom = 0;
  const t = $('top');
  if (t) { const r = t.getBoundingClientRect(); if (r.height) top = r.bottom; }
  for (const id of ['dock', 'hint']) {
    const el = $(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.height) bottom = Math.max(bottom, innerHeight - r.top);
  }
  return { top: Math.min(top, cap), bottom: Math.min(bottom, cap) };
}

function fitRadius() {
  const tanV = Math.tan(camera.fov * Math.PI / 360);
  const tanH = tanV * camera.aspect;
  const ins = uiInsets();
  const usable = 1 - (ins.top + ins.bottom) / innerHeight;
  const pad = isPortrait() ? 1.15 : 1.5; // 桌機留白多一點，維持原本的空曠取景
  const w = (isPortrait() ? CONTENT_SHORT : CONTENT_LONG) * pad;
  const h = (isPortrait() ? CONTENT_LONG : CONTENT_SHORT) * pad;
  return Math.max(h / (tanV * usable), w / tanH);
}

function applyCamera() {
  const { theta, phi } = orbit;
  const radius = fitRadius() * orbit.zoom;
  const ins = uiInsets();
  // 對齊到上下面板之間那段的中心（底部面板較高時，場景整個往上移）
  TARGET.y = (ins.top - ins.bottom) * 0.5 * (2 * radius * Math.tan(camera.fov * Math.PI / 360) / innerHeight);
  camera.position.set(
    TARGET.x + radius * Math.sin(phi) * Math.cos(theta),
    TARGET.y + radius * Math.cos(phi),
    TARGET.z + radius * Math.sin(phi) * Math.sin(theta),
  );
  camera.lookAt(TARGET);
  group.rotation.z = isPortrait() ? Math.PI / 2 : 0; // 直式把場景立起來，寄件端與收件人改走螢幕長邊
  // 霧的範圍跟著距離走，否則直式拉遠後整個場景會被霧吃掉
  if (scene.fog) { scene.fog.near = radius * 1.24; scene.fog.far = radius * 2.65; }
}

function bindControls(dom) {
  dom.addEventListener('pointerdown', (e) => {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { downPos = { x: e.clientX, y: e.clientY }; dragged = false; orbit.idle = 0; }
    if (pointers.size === 2) { const p = [...pointers.values()]; pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); zoomStart = orbit.zoom; }
  });
  dom.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    orbit.idle = 0;
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchStart > 0) orbit.zoom = clamp(zoomStart * pinchStart / d, ZOOM_MIN, ZOOM_MAX);
      dragged = true;
      return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) dragged = true;
    orbit.theta -= dx * 0.006;
    orbit.phi = clamp(orbit.phi - dy * 0.006, 0.2, Math.PI - 0.2);
  });
  const up = (e) => {
    const wasClick = pointers.size === 1 && !dragged;
    pointers.delete(e.pointerId);
    if (wasClick && downPos) onClick(downPos);
    if (pointers.size < 2) pinchStart = 0;
  };
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', up);
  dom.addEventListener('wheel', (e) => { e.preventDefault(); orbit.zoom = clamp(orbit.zoom * (1 + Math.sign(e.deltaY) * 0.08), ZOOM_MIN, ZOOM_MAX); orbit.idle = 0; }, { passive: false });
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ---- 關卡狀態 ----
let levelIdx = 0;
let nodes = [];          // 所有可視節點（含 source/dest）
let selectable = [];     // 可點選的中繼、橋接
// 索引就是跳位（0 入口、1 中繼、2 出口），沒選的留 null。
// 用緊湊陣列的話，取消中間那一跳會讓後面的往前遞補，玩家沒動到的節點被默默換了跳位。
let selected = [null, null, null];
const chosen = () => selected.filter(Boolean);
const hopCount = () => LEVELS[levelIdx].rules.hops;
let pathMesh = null;
let hovered = null;
let animating = false;
const group = new THREE.Group();

function makeNodeMesh(n) {
  let geo, base, emis, r = R_RELAY;
  if (n.role === 'source') { geo = new THREE.IcosahedronGeometry(R_END, 1); base = COL.source; emis = COL.source; r = R_END; }
  else if (n.role === 'dest') { geo = new THREE.IcosahedronGeometry(R_END, 1); base = COL.dest; emis = COL.dest; r = R_END; }
  else if (n.bridge) { geo = new THREE.OctahedronGeometry(R_BRIDGE, 0); base = COL.bridge; emis = COL.bridge; r = R_BRIDGE; }
  else if (n.blocked) { geo = new THREE.SphereGeometry(R_RELAY, 24, 16); base = COL.blocked; emis = COL.blocked; }
  else if (n.surveilled) { geo = new THREE.SphereGeometry(R_RELAY, 24, 16); base = COL.surveilled; emis = COL.surveilled; }
  else { geo = new THREE.SphereGeometry(R_RELAY, 24, 16); base = REGIONS[n.region].color; emis = REGIONS[n.region].color; }

  const uEmis = uniform(n.blocked ? 0.25 : 0.9);
  const mat = new THREE.MeshStandardNodeMaterial({ color: base, roughness: 0.35, metalness: 0.2 });
  mat.emissiveNode = color(emis).mul(uEmis);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(n.x, n.y, n.z);
  mesh.userData = { node: n, uEmis, r, baseEmis: n.blocked ? 0.25 : 0.9, phase: (n.x + n.z) * 0.7 };

  // 被封鎖：加一圈紅環
  if (n.blocked) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R_RELAY * 1.5, 0.07, 8, 32),
      new THREE.MeshBasicNodeMaterial({ color: COL.blockedRing, transparent: true, opacity: 0.9 }));
    mesh.add(ring);
    mesh.userData.ring = ring;
  }
  // 被監聽：加一圈斜置的環。第二關的玩法就是避開這種節點，只用紅色區分的話，
  // 紅綠色盲會分不出它跟德國、瑞典那些綠色系中繼。
  if (n.surveilled) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R_RELAY * 1.42, 0.055, 8, 32),
      new THREE.MeshBasicNodeMaterial({ color: COL.surveilled, transparent: true, opacity: 0.85 }));
    ring.rotation.x = Math.PI / 2.6;
    mesh.add(ring);
    mesh.userData.ring = ring;
  }
  return mesh;
}

function loadLevel(idx) {
  // 清場
  selected = [null, null, null]; hovered = null; animating = false;
  if (pathMesh) { group.remove(pathMesh); pathMesh.geometry.dispose(); pathMesh = null; }
  while (group.children.length) group.remove(group.children[0]);
  nodes = []; selectable = [];

  const lv = LEVELS[idx];
  el.levelName.textContent = `${S('levelLabel')} ${idx + 1}/${LEVELS.length}｜${S(lv.nameKey)}`;
  el.objective.textContent = S(lv.objKey);

  const src = { ...lv.source, role: 'source', id: '__src' };
  const dst = { ...lv.dest, role: 'dest', id: '__dst' };
  nodes.push(src, dst, ...lv.relays);
  for (const n of nodes) {
    const mesh = makeNodeMesh(n);
    n._mesh = mesh;
    group.add(mesh);
    if (n.role !== 'source' && n.role !== 'dest') selectable.push(n);
  }
  scene.add(group);
  updateSlots();
  updatePath();
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';
  hideCard();
}

// ---- 選取與路徑 ----
function onClick(screen) {
  if (animating) return;
  const ndc = new THREE.Vector2((screen.x / innerWidth) * 2 - 1, -(screen.y / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const meshes = selectable.map((n) => n._mesh);
  const hit = raycaster.intersectObjects(meshes, false)[0];
  if (!hit) {
    // 兩顆端點又大又亮卻不能選，手機沒有 hover 提示，點下去毫無反應會像畫面壞掉
    const ends = nodes.filter((n) => n.role === 'source' || n.role === 'dest').map((n) => n._mesh).filter(Boolean);
    if (ends.length && raycaster.intersectObjects(ends, false)[0]) say(S('hintEndpoint'));
    return;
  }
  const n = hit.object.userData.node;
  const at = selected.indexOf(n);
  if (at >= 0) {
    selected[at] = null; // 只清掉這一跳，其他跳位待在原地
  } else {
    const slot = selected.slice(0, hopCount()).indexOf(null);
    if (slot < 0) { say(S('hintFull', { n: hopCount() })); return; }
    selected[slot] = n;
  }
  clearSay();
  updateSlots();
  updatePath();
}

// 提示列共用：說一句話、或把話收回去
function say(msg) { el.feedback.textContent = msg; el.feedback.className = 'feedback show'; }
function clearSay() { el.feedback.textContent = ''; el.feedback.className = 'feedback'; }

function updateSlots() {
  const hops = LEVELS[levelIdx].rules.hops;
  for (let i = 0; i < 3; i++) {
    if (i >= hops) { el.slots[i].parentElement.style.display = 'none'; continue; }
    el.slots[i].parentElement.style.display = '';
    const n = selected[i];
    el.slots[i].textContent = n ? nodeLabel(n) : S('hopEmpty');
    el.slots[i].className = 'slot-val' + (n ? ' filled' : '');
  }
  el.send.disabled = false;
}

function updatePath() {
  if (pathMesh) { group.remove(pathMesh); pathMesh.geometry.dispose(); pathMesh = null; }
  const pts = pathPoints();
  if (pts.length < 2) return;
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
  const geo = new THREE.TubeGeometry(curve, 80, 0.11, 8, false);
  const mat = new THREE.MeshBasicNodeMaterial({ color: COL.path, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  pathMesh = new THREE.Mesh(geo, mat);
  group.add(pathMesh);
}

function pathPoints() {
  const lv = LEVELS[levelIdx];
  const src = nodes.find((n) => n.role === 'source');
  const dst = nodes.find((n) => n.role === 'dest');
  const pts = [new THREE.Vector3(src.x, src.y, src.z)];
  const sel = chosen();
  for (const n of sel) pts.push(new THREE.Vector3(n.x, n.y, n.z));
  if (sel.length === lv.rules.hops) pts.push(new THREE.Vector3(dst.x, dst.y, dst.z));
  return pts;
}

// ---- 驗證 ----
function validate() {
  const lv = LEVELS[levelIdx], r = lv.rules;
  const sel = chosen();
  if (sel.length !== r.hops) return { ok: false, msg: S('failHopsCount', { n: sel.length }) };
  for (const n of sel) if (n.blocked) return { ok: false, msg: S('failBlocked', { name: nodeLabel(n) }) };
  for (const n of sel) if (n.surveilled) return { ok: false, msg: S('failSurveilled', { name: nodeLabel(n) }) };
  if (r.requireBridge) {
    if (!selected[0] || !selected[0].bridge) return { ok: false, msg: S('failNeedBridge') };
    // 橋接是進 Tor 的入口，真實網路裡不會拿來當中繼或出口用
    if (sel.slice(1).some((n) => n.bridge)) return { ok: false, msg: S('failBridgeOnlyEntry') };
  }
  if (r.requireDiversity) {
    const regions = new Set(sel.map((n) => n.region));
    if (regions.size < r.hops) return { ok: false, msg: S('failDiversity') };
  }
  return { ok: true };
}

function onSend() {
  if (animating) return;
  const res = validate();
  if (!res.ok) {
    el.feedback.textContent = res.msg;
    el.feedback.className = 'feedback show fail';
    return;
  }
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';
  runPacket();
}

// ---- 封包動畫 + 剝洋蔥 ----
let packet = null, shells = [], peels = [], anim = null;

function runPacket() {
  animating = true;
  el.send.disabled = true;
  const pts = pathPoints();
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);

  packet = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshBasicNodeMaterial({ color: COL.packet }));
  packet.add(core);
  shells = COL.shell.map((c, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.55 - i * 0.13, 20, 14),
      new THREE.MeshBasicNodeMaterial({ color: c, transparent: true, opacity: 0.4 - i * 0.06, blending: THREE.AdditiveBlending, depthWrite: false }));
    packet.add(m); return m;
  });
  group.add(packet);

  const sel = chosen();
  const hops = sel.length;              // 3
  const thresholds = [];                // 各跳在 curve 上的參數 u
  for (let i = 1; i <= hops; i++) thresholds.push(i / (pts.length - 1));
  let peeled = 0;
  const DURATION = 3.2;
  anim = { curve, t0: null, dur: DURATION, thresholds, peeled, hops, hopNodes: sel };
}

function spawnPeel(posVec, colorHex) {
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 14),
    new THREE.MeshBasicNodeMaterial({ color: colorHex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  shell.position.copy(posVec);
  shell.userData.life = 0;
  group.add(shell);
  peels.push(shell);
}

function tickPacket(now) {
  if (!anim) return;
  if (anim.t0 == null) anim.t0 = now;
  const u = clamp((now - anim.t0) / anim.dur, 0, 1);
  const p = anim.curve.getPointAt(u);
  packet.position.copy(p);

  // 到達某一跳 → 剝一層洋蔥
  while (anim.peeled < anim.hops && u >= anim.thresholds[anim.peeled]) {
    const hopNode = anim.hopNodes[anim.peeled];
    if (shells[anim.peeled]) shells[anim.peeled].visible = false;
    spawnPeel(new THREE.Vector3(hopNode.x, hopNode.y, hopNode.z), COL.shell[anim.peeled] || COL.path);
    // 節點閃一下
    if (hopNode._mesh) hopNode._mesh.userData.flash = 1.6;
    anim.peeled++;
  }

  if (u >= 1) {
    // 抵達收件人
    const dst = nodes.find((n) => n.role === 'dest');
    if (dst._mesh) dst._mesh.userData.flash = 2.0;
    group.remove(packet); packet = null; shells = [];
    anim = null;
    setTimeout(showTeach, 450);
  }
}

// ---- 教學卡 / 過關 ----
function showTeach() {
  const lv = LEVELS[levelIdx];
  el.cardTitle.textContent = S('teachTitle');
  el.cardBody.textContent = S(lv.teachKey);
  el.cardLink.textContent = S(lv.learnMore.labelKey);
  el.cardLink.href = lv.learnMore.href;
  el.cardLink.style.display = '';
  if (levelIdx < LEVELS.length - 1) el.cardNext.textContent = S('btnNext');
  else el.cardNext.textContent = S('btnReplay');
  el.card.classList.add('show');
}

function hideCard() { el.card.classList.remove('show'); }

function onNext() {
  hideCard();
  if (levelIdx < LEVELS.length - 1) { levelIdx++; loadLevel(levelIdx); }
  else {
    // 全部通關 → 顯示總結卡
    el.cardTitle.textContent = S('allClearTitle');
    el.cardBody.textContent = S('allClearBody');
    el.cardLink.textContent = S('allClearLink');
    el.cardLink.href = '../index.html';
    el.cardLink.style.display = '';
    el.cardNext.textContent = S('btnReplay');
    el.card.classList.add('show');
    levelIdx = -1; // 下次按 → 從頭
  }
}

function onNextClickRouter() {
  if (levelIdx === -1) { levelIdx = 0; hideCard(); loadLevel(0); return; }
  onNext();
}

// ---- 每幀 ----
let lastMouse = null;
addEventListener('mousemove', (e) => { lastMouse = { x: e.clientX, y: e.clientY }; });

function hoverTick() {
  if (animating || !lastMouse || !camera) { el.tooltip.style.display = 'none'; hovered = null; return; }
  const ndc = new THREE.Vector2((lastMouse.x / innerWidth) * 2 - 1, -(lastMouse.y / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(nodes.map((n) => n._mesh), false)[0];
  if (hit) {
    hovered = hit.object.userData.node;
    el.tooltip.textContent = nodeLabel(hovered);
    el.tooltip.style.display = 'block';
    el.tooltip.style.left = (lastMouse.x + 14) + 'px';
    el.tooltip.style.top = (lastMouse.y + 14) + 'px';
    document.body.style.cursor = (hovered.role === 'source' || hovered.role === 'dest') ? 'default' : 'pointer';
  } else {
    hovered = null; el.tooltip.style.display = 'none'; document.body.style.cursor = 'default';
  }
}

let prevNow = performance.now();
async function animate() {
  try {
    await frame();
  } catch (e) {
    console.error(e);
    say(S('runtimeError'));
    renderer.setAnimationLoop(null); // 停下來，免得每幀重複拋錯
  }
}

async function frame() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - prevNow) / 1000); prevNow = now;
  const tsec = now / 1000;

  orbit.idle += dt;
  // 還沒開始選取時，閒置緩慢 attract 旋轉；一旦選了節點就固定視角，方便瞄準
  if (orbit.idle > 6 && pointers.size === 0 && chosen().length === 0 && !REDUCED) orbit.theta += dt * 0.05;
  applyCamera();

  // 節點脈動 / 選取強調 / 閃光
  for (const n of nodes) {
    const m = n._mesh; if (!m) continue;
    const ud = m.userData;
    let e = ud.baseEmis * (1 + (REDUCED ? 0 : 0.18) * Math.sin(tsec * 2 + ud.phase));
    const sel = selected.indexOf(n);
    if (sel >= 0) e += 0.9;
    if (hovered === n) e += 0.5;
    if (ud.flash > 0) { e += ud.flash; ud.flash = Math.max(0, ud.flash - dt * 3); }
    ud.uEmis.value = e;
    const s = 1 + (sel >= 0 ? 0.18 : 0) + (ud.flash > 0 ? ud.flash * 0.12 : 0);
    m.scale.setScalar(s);
    if (ud.ring) ud.ring.rotation.z += dt * 1.2;
  }

  // 剝洋蔥漣漪
  for (let i = peels.length - 1; i >= 0; i--) {
    const sh = peels[i]; sh.userData.life += dt;
    const k = sh.userData.life / 0.7;
    sh.scale.setScalar(1 + k * 4);
    sh.material.opacity = Math.max(0, 0.7 * (1 - k));
    if (k >= 1) { group.remove(sh); sh.geometry.dispose(); peels.splice(i, 1); }
  }

  if (anim) tickPacket(now);
  hoverTick();

  await post.renderAsync();
}

// 讓提示列固定在底部操作區上緣、保留固定間距（依 dock 實際高度動態定位，任何螢幕尺寸都不會壓到）
function positionHint() {
  const d = $('dock');
  if (!d || !el.hint) return;
  el.hint.style.bottom = (window.innerHeight - d.getBoundingClientRect().top + 18) + 'px';
}

// ---- 啟動 ----
async function main() {
  initStaticText();
  positionHint();
  if (window.ResizeObserver) new ResizeObserver(positionHint).observe($('dock'));
  addEventListener('resize', positionHint);
  const ok = await initRenderer();
  if (!ok) return;
  bindControls(renderer.domElement);
  el.send.addEventListener('click', onSend);
  el.reset.addEventListener('click', () => { if (animating) return; selected = [null, null, null]; clearSay(); updateSlots(); updatePath(); });
  el.cardNext.addEventListener('click', onNextClickRouter);
  const onActivate = (node, fn) => {
    if (!node) return;
    node.addEventListener('click', fn);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  };
  onActivate(el.legendToggle, () => el.legend.classList.toggle('open'));
  onActivate($('hint-close'), () => el.hint.classList.add('hidden'));
  loadLevel(0);
  renderer.setAnimationLoop(animate);
}

main().catch((e) => { el.backend.textContent = S('backendError'); el.backend.className = 'err'; console.error(e); });
