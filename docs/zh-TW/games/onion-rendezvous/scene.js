// .onion 會合流量視覺化
// 一片 Tor relay 節點雲鋪在平面上，client 與 .onion 服務在兩側。系統持續維持約 N 條連線：
// 每次隨機挑一個「乾淨」relay 當會合點（rendezvous point），client 與服務各建一條 3 跳電路
// 流向它。不畫電路線，改用細小發光粒子＋殘影（afterimage）表現流量方向，在會合點匯流閃光。
// 有害節點以紅色標示，電路一律避開。relay 數、電路數、有害節點數、流量皆可即時調控。
// three.js WebGPURenderer + TSL bloom + afterimage；不支援 WebGPU 時退回 WebGL2。
import * as THREE from 'three';
import { color, uniform, pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { afterImage } from 'three/addons/tsl/display/AfterImageNode.js';

const $ = (id) => document.getElementById(id);

const COL = {
  bg: 0x04060d,
  relay: 0x2f5876,
  bad: 0xff5a5a,
  client: 0x38d6ff,
  service: 0xb98cff,
  clientStream: 0xaaf0ff,
  serviceStream: 0xe6d4ff,
  rp: 0xffffff,
};

// 可即時調控的參數
const params = {
  relays: 24,     // relay 節點數
  circuits: 12,   // 同時維持的連線數（Tor 預設乾淨電路上限約 12）
  bad: 2,         // 有害節點數（電路避開）
  flow: 0.5,      // 流量 0..1（控制粒子密度）
};

const MAX_PARTICLES = 8000;
const EMIT_DUR = 1.1;        // 每次連線「送出流量」持續多久（一次性脈衝）
const TRAVEL = 1.9;          // 粒子從起點流到會合點約幾秒
const SPAWN_MIN_GAP = 0.1;   // 補新連線的最小間隔（錯開避免同步）
const FIELD = new THREE.Vector3(18, 10, 1); // 平面：x/y 橢圓半徑，z 微幅厚度（物件仍 3D）

function emitInterval() { return 0.05 - params.flow * 0.038; } // flow 越大越密（0.05→0.012）

// ---- three.js ----
let renderer, scene, camera, post;

async function initRenderer() {
  const hasGPU = !!navigator.gpu;
  const hasGL2 = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; } })();
  const forceWebGL = new URLSearchParams(location.search).get('backend') === 'webgl';
  if (!hasGL2 && (forceWebGL || !hasGPU)) { $('backend').textContent = '這個瀏覽器不支援 WebGPU／WebGL2'; $('backend').className = 'err'; return false; }

  renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.appendChild(renderer.domElement);
  try { await renderer.init(); } catch (e) { $('backend').textContent = '渲染器初始化失敗'; $('backend').className = 'err'; return false; }

  const isGPU = !!(renderer.backend && renderer.backend.isWebGPUBackend);
  $('backend').textContent = isGPU ? 'WebGPU' : 'WebGL2（fallback）';
  $('backend').className = isGPU ? 'gpu' : 'gl';

  scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.fog = new THREE.Fog(COL.bg, 60, 130);
  camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.5, 400);

  scene.add(new THREE.HemisphereLight(0x2a3f60, 0x0a0a12, 0.8));
  const key = new THREE.DirectionalLight(0xbfe6ff, 0.7);
  key.position.set(6, 10, 24); scene.add(key);

  // 後製：bloom 發光 → afterimage 殘影（粒子移動留拖影，取代電路線）
  post = new THREE.PostProcessing(renderer);
  const scenePass = pass(scene, camera);
  const col = scenePass.getTextureNode('output');
  const glow = col.add(bloom(col, 0.95, 0.6, 0.5));
  post.outputNode = afterImage(glow, 0.91); // 殘影：越大拖尾越長（流動感）

  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  return true;
}

// ---- 節點雲（可即時重建）----
const group = new THREE.Group();
let relays = [], goodRelays = [];
let clientNode, serviceNode;

function makeNode(colorHex, radius, baseEmis, geo) {
  const uEmis = uniform(baseEmis);
  const mat = new THREE.MeshStandardNodeMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
  mat.emissiveNode = color(colorHex).mul(uEmis);
  const mesh = new THREE.Mesh(geo || new THREE.SphereGeometry(radius, 16, 12), mat);
  mesh.userData = { uEmis, baseEmis, boost: 0, phase: Math.random() * 6.28, bad: false };
  return mesh;
}

function clearRelays() {
  for (const m of relays) { group.remove(m); m.geometry.dispose(); m.material.dispose(); }
  relays = []; goodRelays = [];
}

function buildField() {
  clearRelays();
  // 隨機挑 params.bad 個當有害節點
  const badSet = new Set();
  const pool = [...Array(params.relays).keys()];
  for (let i = 0; i < Math.min(params.bad, params.relays); i++) {
    badSet.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  for (let i = 0; i < params.relays; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
    const bad = badSet.has(i);
    const m = makeNode(bad ? COL.bad : COL.relay, bad ? 0.42 : 0.34 + Math.random() * 0.12, bad ? 0.75 : 0.35 + Math.random() * 0.25);
    m.position.set(Math.cos(a) * FIELD.x * r, Math.sin(a) * FIELD.y * r, (Math.random() - 0.5) * 2 * FIELD.z);
    m.userData.bad = bad;
    group.add(m); relays.push(m);
    if (!bad) goodRelays.push(m);
  }
  // client 與服務只建一次
  if (!clientNode) {
    clientNode = makeNode(COL.client, 1.05, 1.5, new THREE.IcosahedronGeometry(1.05, 1));
    clientNode.position.set(-FIELD.x - 7, 0, 0);
    serviceNode = makeNode(COL.service, 1.05, 1.5, new THREE.IcosahedronGeometry(1.05, 1));
    serviceNode.position.set(FIELD.x + 7, 0, 0);
    group.add(clientNode, serviceNode);
  }
  scene.add(group);
}

function rebuild() {
  connections = [];   // 舊連線引用了舊節點，一併清掉
  clearParticles();
  buildField();
}

// ---- 粒子池 ----
let pGeo, pPos, pCol, pMat, points;
const particles = new Array(MAX_PARTICLES);
const freeList = [];
const tmp = new THREE.Vector3();

function buildParticles() {
  pPos = new Float32Array(MAX_PARTICLES * 3);
  pCol = new Float32Array(MAX_PARTICLES * 3); // 0 = 隱形（additive 不貢獻）
  for (let i = MAX_PARTICLES - 1; i >= 0; i--) { particles[i] = { active: false, curve: null, t: 0, speed: 0 }; freeList.push(i); }
  pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pMat = new THREE.PointsNodeMaterial({ size: 0.22, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  scene.add(points);
}

function setCol(idx, hex) {
  const c = new THREE.Color(hex);
  pCol[idx * 3] = c.r; pCol[idx * 3 + 1] = c.g; pCol[idx * 3 + 2] = c.b;
}
function allocParticle(curve, hex) {
  const idx = freeList.pop();
  if (idx === undefined) return;
  const p = particles[idx];
  p.active = true; p.curve = curve; p.t = 0; p.speed = (1 / TRAVEL) * (0.85 + Math.random() * 0.3);
  setCol(idx, hex);
}
function freeParticle(idx) {
  particles[idx].active = false; particles[idx].curve = null;
  pCol[idx * 3] = pCol[idx * 3 + 1] = pCol[idx * 3 + 2] = 0;
  freeList.push(idx);
}
function clearParticles() {
  for (let i = 0; i < MAX_PARTICLES; i++) if (particles[i].active) freeParticle(i);
  if (pGeo) { pGeo.attributes.color.needsUpdate = true; pGeo.attributes.position.needsUpdate = true; }
}

// ---- 連線（會合，避開有害節點）----
let connections = [];
const flashes = [];

function pickDistinct(pool, n, exclude) {
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (c !== exclude && !out.includes(c)) out.push(c);
  }
  return out;
}

function spawnConnection() {
  if (goodRelays.length < 3) return;             // 乾淨節點不足就不發起
  const rp = goodRelays[Math.floor(Math.random() * goodRelays.length)];
  const cHops = pickDistinct(goodRelays, 2, rp);
  const sHops = pickDistinct(goodRelays, 2, rp);
  if (cHops.length < 2 || sHops.length < 2) return;
  const clientCurve = new THREE.CatmullRomCurve3([clientNode.position, cHops[0].position, cHops[1].position, rp.position], false, 'catmullrom', 0.4);
  const serviceCurve = new THREE.CatmullRomCurve3([serviceNode.position, sHops[0].position, sHops[1].position, rp.position], false, 'catmullrom', 0.4);
  connections.push({
    clientCurve, serviceCurve, rp, hops: [...cHops, ...sHops],
    age: 0, emit: 0, emitDur: EMIT_DUR * (0.7 + Math.random() * 0.8), flashed: false,
  });
}

function spawnFlash(pos) {
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14),
    new THREE.MeshBasicNodeMaterial({ color: COL.rp, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  shell.position.copy(pos); shell.userData.life = 0;
  group.add(shell); flashes.push(shell);
}

function updateConnections(dt) {
  const interval = emitInterval();
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i];
    conn.age += dt;
    const emitting = conn.age < conn.emitDur;
    const flowEnd = conn.emitDur + TRAVEL;
    // 節點高亮的強度：淡入 → 維持 → 流完淡掉
    let op;
    if (conn.age < 0.3) op = conn.age / 0.3;
    else if (conn.age < flowEnd) op = 1;
    else op = Math.max(0, 1 - (conn.age - flowEnd) / 0.6);

    if (emitting) {
      conn.emit -= dt;
      while (conn.emit <= 0) {
        allocParticle(conn.clientCurve, COL.clientStream);
        allocParticle(conn.serviceCurve, COL.serviceStream);
        conn.emit += interval;
      }
    }
    conn.rp.userData.boost = Math.max(conn.rp.userData.boost, 1.6 * op);
    for (const h of conn.hops) h.userData.boost = Math.max(h.userData.boost, 0.7 * op);
    if (!conn.flashed && conn.age > TRAVEL) { conn.flashed = true; spawnFlash(conn.rp.position); }
    if (conn.age > flowEnd + 0.7) connections.splice(i, 1);
  }
}

// ---- 相機固定正對平面（拖曳平移、滾輪／雙指縮放；點擊空白處加一條連線）----
const view = { cx: 0, cy: 0, dist: 40 };
const pointers = new Map();
let downPos = null, dragged = false, pinchStart = 0, distStart = 0;

function applyCamera() {
  camera.position.set(view.cx, view.cy, view.dist);
  camera.lookAt(view.cx, view.cy, 0);
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function bindControls(dom) {
  dom.addEventListener('pointerdown', (e) => {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { downPos = { x: e.clientX, y: e.clientY }; dragged = false; }
    if (pointers.size === 2) { const p = [...pointers.values()]; pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); distStart = view.dist; }
  });
  dom.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchStart > 0) view.dist = clamp(distStart * pinchStart / d, 22, 78);
      dragged = true; return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) dragged = true;
    const k = view.dist * 0.0016;
    view.cx = clamp(view.cx - dx * k, -26, 26);
    view.cy = clamp(view.cy + dy * k, -18, 18);
  });
  const up = (e) => {
    const wasClick = pointers.size === 1 && !dragged;
    pointers.delete(e.pointerId);
    if (wasClick) spawnConnection();
    if (pointers.size < 2) pinchStart = 0;
  };
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', up);
  dom.addEventListener('wheel', (e) => { e.preventDefault(); view.dist = clamp(view.dist * (1 + Math.sign(e.deltaY) * 0.08), 22, 78); }, { passive: false });
}

// ---- 調控面板 ----
function flowLabel(v) { return v < 0.34 ? '低' : v < 0.67 ? '中' : '高'; }
function bindUI() {
  const num = (id) => Number($(id).value);
  params.relays = num('c-relays'); params.circuits = num('c-circuits');
  params.bad = num('c-bad'); params.flow = num('c-flow') / 100;
  $('v-relays').textContent = params.relays;
  $('v-circuits').textContent = params.circuits;
  $('v-bad').textContent = params.bad;
  $('v-flow').textContent = flowLabel(params.flow);

  $('c-relays').addEventListener('input', (e) => { params.relays = Number(e.target.value); if (params.bad > params.relays) { params.bad = params.relays; $('c-bad').value = params.bad; $('v-bad').textContent = params.bad; } $('v-relays').textContent = params.relays; rebuild(); });
  $('c-bad').addEventListener('input', (e) => { params.bad = Math.min(Number(e.target.value), params.relays); $('v-bad').textContent = params.bad; rebuild(); });
  $('c-circuits').addEventListener('input', (e) => { params.circuits = Number(e.target.value); $('v-circuits').textContent = params.circuits; });
  $('c-flow').addEventListener('input', (e) => { params.flow = Number(e.target.value) / 100; $('v-flow').textContent = flowLabel(params.flow); });
}

// ---- 每幀 ----
let prevNow = performance.now();
let spawnTimer = 0;

async function animate() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - prevNow) / 1000); prevNow = now;
  const tsec = now / 1000;

  applyCamera();

  // 維持約 params.circuits 條連線：不足就補，錯開避免同步
  spawnTimer -= dt;
  if (spawnTimer <= 0 && connections.length < params.circuits) { spawnConnection(); spawnTimer = SPAWN_MIN_GAP; }

  updateConnections(dt);

  // 推進粒子
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particles[i];
    if (!p.active) continue;
    p.t += p.speed * dt;
    if (p.t >= 1) { freeParticle(i); continue; }
    p.curve.getPoint(p.t, tmp);
    pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y; pPos[i * 3 + 2] = tmp.z;
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;

  // 節點脈動 + boost 衰減
  for (const m of relays) updateNode(m, tsec, dt);
  updateNode(clientNode, tsec, dt); updateNode(serviceNode, tsec, dt);

  // 會合閃光漣漪
  for (let i = flashes.length - 1; i >= 0; i--) {
    const sh = flashes[i]; sh.userData.life += dt;
    const k = sh.userData.life / 0.7;
    sh.scale.setScalar(1 + k * 4.5);
    sh.material.opacity = Math.max(0, 0.85 * (1 - k));
    if (k >= 1) { group.remove(sh); sh.geometry.dispose(); flashes.splice(i, 1); }
  }

  await post.renderAsync();
}

function updateNode(m, tsec, dt) {
  const ud = m.userData;
  let e = ud.baseEmis * (1 + 0.2 * Math.sin(tsec * 1.6 + ud.phase));
  if (ud.boost > 0) { e += ud.boost; ud.boost = Math.max(0, ud.boost - dt * 2.2); }
  ud.uEmis.value = e;
  m.scale.setScalar(1 + (ud.boost > 0 ? ud.boost * 0.14 : 0));
}

// ---- 啟動 ----
async function main() {
  const ok = await initRenderer();
  if (!ok) return;
  bindUI();
  buildField();
  buildParticles();
  bindControls(renderer.domElement);
  $('hint-close').addEventListener('click', () => $('hint').classList.add('hidden'));
  for (let i = 0; i < 8; i++) spawnConnection(); // 開場先鋪幾條
  renderer.setAnimationLoop(animate);
}

main().catch((e) => { $('backend').textContent = '啟動失敗'; $('backend').className = 'err'; console.error(e); });
