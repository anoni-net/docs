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
  website: 0x7dffb0,       // 明網網站（clearnet）
  clientStream: 0x2fb6ff,  // 請求（去程）— 飽和 cyan，避免 additive 疊成白
  serviceStream: 0x9a5cff, // 飽和 violet
  respStream: 0x2bef86,    // 明網回應（回程，原路走回）— 飽和 green
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
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches; // 減少動態偏好

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
  post.outputNode = afterImage(glow, 0.6); // 短殘影：微尾巴＋流動感，又不會糊成一團

  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  return true;
}

// ---- 節點雲（可即時重建）----
const group = new THREE.Group();
let relays = [], goodRelays = [];
let clientNode, serviceNode, websiteNode;

function makeNode(colorHex, radius, baseEmis, geo) {
  const uEmis = uniform(baseEmis);
  const uCol = uniform(new THREE.Color(colorHex)); // 可變色（good ↔ bad 就地轉換）
  const mat = new THREE.MeshStandardNodeMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
  mat.emissiveNode = uCol.mul(uEmis);
  const mesh = new THREE.Mesh(geo || new THREE.SphereGeometry(radius, 16, 12), mat);
  // life：新增從 0 淡入、移除淡出到 0；bad：是否有害節點
  mesh.userData = { uEmis, uCol, baseEmis, goodEmis: baseEmis, boost: 0, phase: Math.random() * 6.28, bad: false, life: 0, dying: false };
  return mesh;
}

function addRelay() {
  const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
  const m = makeNode(COL.relay, 0.34 + Math.random() * 0.12, 0.35 + Math.random() * 0.25);
  m.position.set(Math.cos(a) * FIELD.x * r, Math.sin(a) * FIELD.y * r, (Math.random() - 0.5) * 2 * FIELD.z);
  m.userData.life = 0; // 從 0 慢慢長出來
  group.add(m); relays.push(m);
  return m;
}

function setBad(node, bad) {           // good ↔ bad 就地轉換，不動位置
  node.userData.bad = bad;
  const hex = bad ? COL.bad : COL.relay;
  node.userData.uCol.value.set(hex);
  node.material.color.set(hex);
  node.userData.baseEmis = bad ? 0.75 : node.userData.goodEmis;
  node.userData.boost = Math.max(node.userData.boost, 0.8); // 轉換時閃一下
}

// 增量調整：既有節點不動位置，數量變化用生命動畫（淡入 / 淡出）漸變
function reconcile() {
  let live = relays.filter((n) => !n.userData.dying);
  // 1. 節點總數：不足長新的（淡入），過多標記淡出（優先淡出乾淨節點以保留壞節點）
  while (live.length < params.relays) live.push(addRelay());
  if (live.length > params.relays) {
    const order = live.filter((n) => !n.userData.bad).concat(live.filter((n) => n.userData.bad));
    let kill = live.length - params.relays;
    for (const n of order) { if (kill <= 0) break; n.userData.dying = true; kill--; }
    live = relays.filter((n) => !n.userData.dying);
  }
  // 2. 有害節點數：就地變色，不動位置
  let liveBad = live.filter((n) => n.userData.bad);
  let liveGood = live.filter((n) => !n.userData.bad);
  while (liveBad.length < params.bad && liveGood.length > 0) { const n = liveGood.pop(); setBad(n, true); liveBad.push(n); }
  while (liveBad.length > params.bad) { const n = liveBad.pop(); setBad(n, false); }
  // 3. 會合點與 3 跳只從乾淨、未淡出的節點挑
  goodRelays = relays.filter((n) => !n.userData.bad && !n.userData.dying);
}

function buildField() {
  clientNode = makeNode(COL.client, 1.15, 1.5, new THREE.IcosahedronGeometry(1.15, 1));
  clientNode.position.set(-FIELD.x - 8, 0, 0); clientNode.userData.life = 1;
  serviceNode = makeNode(COL.service, 1.05, 1.5, new THREE.IcosahedronGeometry(1.05, 1));
  serviceNode.position.set(FIELD.x + 8, 6, 0); serviceNode.userData.life = 1;   // .onion 服務（右上）
  websiteNode = makeNode(COL.website, 1.05, 1.4, new THREE.IcosahedronGeometry(1.05, 1));
  websiteNode.position.set(FIELD.x + 8, -6, 0); websiteNode.userData.life = 1;  // 明網網站（右下）
  group.add(clientNode, serviceNode, websiteNode);
  scene.add(group);
  reconcile(); // 依 params 長出 relay 與有害節點
}

// ---- 粒子池 ----
let pGeo, pPos, pCol, pMat, points;
const particles = new Array(MAX_PARTICLES);
const freeList = [];
const tmp = new THREE.Vector3();
const dir = new THREE.Vector3();
const AXIS_Z = new THREE.Vector3(0, 0, 1);

function buildParticles() {
  pPos = new Float32Array(MAX_PARTICLES * 3);
  pCol = new Float32Array(MAX_PARTICLES * 3); // 0 = 隱形（additive 不貢獻）
  for (let i = MAX_PARTICLES - 1; i >= 0; i--) { particles[i] = { active: false, curve: null, t: 0, speed: 0 }; freeList.push(i); }
  pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pMat = new THREE.PointsNodeMaterial({ size: 0.26, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
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
  p.active = true; p.curve = curve; p.t = 0; p.speed = (1 / TRAVEL) * (0.9 + Math.random() * 0.15);
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
const tracers = [];

function pickDistinct(pool, n, exclude) {
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (c !== exclude && !out.includes(c)) out.push(c);
  }
  return out;
}

function curveThrough(nodes) {
  return new THREE.CatmullRomCurve3(nodes.map((n) => n.position), false, 'catmullrom', 0.4);
}

function spawnConnection(type) {
  if (goodRelays.length < 3) return;             // 乾淨節點不足就不發起
  type = type || (Math.random() < 0.5 ? 'onion' : 'clearnet');
  const emitDur = EMIT_DUR * (0.7 + Math.random() * 0.8);
  if (type === 'onion') {
    // .onion：client 與服務各建 3 跳電路，在隨機會合點相遇
    const rp = goodRelays[Math.floor(Math.random() * goodRelays.length)];
    const cHops = pickDistinct(goodRelays, 2, rp);
    const sHops = pickDistinct(goodRelays, 2, rp);
    if (cHops.length < 2 || sHops.length < 2) return;
    const clientCurve = curveThrough([clientNode, cHops[0], cHops[1], rp]);
    const serviceCurve = curveThrough([serviceNode, sHops[0], sHops[1], rp]);
    connections.push({
      type: 'onion', age: 0, emit: 0, emitDur, flashed: false, flashed2: false,
      clientCurve, serviceCurve,
      clientRet: curveThrough([rp, cHops[1], cHops[0], clientNode]),   // 回程：RP → client
      serviceRet: curveThrough([rp, sHops[1], sHops[0], serviceNode]), // 回程：RP → service
      rp, hops: [...cHops, ...sHops],
    });
    spawnTracer(clientCurve, COL.clientStream); spawnTracer(serviceCurve, COL.serviceStream); // 去程曳光彈頭
  } else {
    // 明網：client → guard → middle → exit → 網站，回應原路走回
    const hops = pickDistinct(goodRelays, 3, null);
    if (hops.length < 3) return;
    const exit = hops[2];
    const fwdCurve = curveThrough([clientNode, hops[0], hops[1], exit, websiteNode]);
    connections.push({
      type: 'clearnet', age: 0, emit: 0, emitDur, flashed: false, flashed2: false,
      fwdCurve,
      retCurve: curveThrough([websiteNode, exit, hops[1], hops[0], clientNode]),
      exit, website: websiteNode, hops,
    });
    spawnTracer(fwdCurve, COL.clientStream); // 去程曳光彈頭
  }
}

// 曳光彈頭：每股流量發出時，一顆較大、該股亮色的球領在最前面，殘影拉成平滑尾巴（非串珠）
function spawnTracer(curve, hex) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10),
    new THREE.MeshBasicNodeMaterial({ color: hex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.scale.set(0.16, 0.16, 0.62); // 沿行進方向拉長成 streak（曳光彈形狀，不靠殘影）
  m.userData = { curve, t: 0, speed: 1.05 / TRAVEL };
  group.add(m); tracers.push(m);
}

// 溫和的會合光暈：低不透明、緩起緩落（sin ease）；系統要求減少動態時完全不放
function spawnPulse(pos, hex) {
  if (REDUCED) return;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 14),
    new THREE.MeshBasicNodeMaterial({ color: hex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.position.copy(pos); m.userData.life = 0;
  group.add(m); flashes.push(m);
}


function envelope(age, flowEnd) { // 淡入 → 維持 → 流完淡掉
  if (age < 0.3) return age / 0.3;
  if (age < flowEnd) return 1;
  return Math.max(0, 1 - (age - flowEnd) / 0.6);
}

function updateConnections(dt) {
  const interval = emitInterval();
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i];
    conn.age += dt;

    if (conn.type === 'onion') {
      const retStart = TRAVEL;
      const retEnd = retStart + conn.emitDur;
      const flowEnd = retEnd + TRAVEL;
      const op = envelope(conn.age, flowEnd);
      // 去程：client → RP、service → RP
      if (conn.age < conn.emitDur) {
        conn.emit -= dt;
        while (conn.emit <= 0) {
          allocParticle(conn.clientCurve, COL.clientStream);
          allocParticle(conn.serviceCurve, COL.serviceStream);
          conn.emit += interval;
        }
      }
      // 會合 → RP 柔和發光、開始回程（回程也放引導頭）
      if (!conn.flashed && conn.age > TRAVEL) { conn.flashed = true; spawnPulse(conn.rp.position, 0xbfe6ff); conn.emit = 0; spawnTracer(conn.clientRet, COL.clientStream); spawnTracer(conn.serviceRet, COL.serviceStream); }
      // 回程：RP → client、RP → service（原路走回）
      if (conn.age >= retStart && conn.age < retEnd) {
        conn.emit -= dt;
        while (conn.emit <= 0) {
          allocParticle(conn.clientRet, COL.clientStream);
          allocParticle(conn.serviceRet, COL.serviceStream);
          conn.emit += interval;
        }
      }
      // 回程抵達 → client、service 柔和發光
      if (!conn.flashed2 && conn.age > retStart + TRAVEL) { conn.flashed2 = true; spawnPulse(clientNode.position, 0xbfe6ff); spawnPulse(serviceNode.position, 0xd9c2ff); }
      conn.rp.userData.boost = Math.max(conn.rp.userData.boost, 1.6 * op);
      for (const h of conn.hops) h.userData.boost = Math.max(h.userData.boost, 0.7 * op);
      if (conn.age > flowEnd + 0.7) connections.splice(i, 1);

    } else { // clearnet：去程 client → 網站，回程原路走回
      const retStart = TRAVEL;
      const retEnd = retStart + conn.emitDur;
      const flowEnd = retEnd + TRAVEL;
      const op = envelope(conn.age, flowEnd);
      if (conn.age < conn.emitDur) { // 去程
        conn.emit -= dt;
        while (conn.emit <= 0) { allocParticle(conn.fwdCurve, COL.clientStream); conn.emit += interval; }
      }
      // 去程抵達網站 → 網站柔和發光、開始回程（回程也放引導頭）
      if (!conn.flashed && conn.age > TRAVEL) { conn.flashed = true; spawnPulse(conn.website.position, COL.website); conn.emit = 0; spawnTracer(conn.retCurve, COL.respStream); }
      if (conn.age >= retStart && conn.age < retEnd) { // 回程（原路）
        conn.emit -= dt;
        while (conn.emit <= 0) { allocParticle(conn.retCurve, COL.respStream); conn.emit += interval; }
      }
      // 回程抵達 client → client 柔和發光
      if (!conn.flashed2 && conn.age > retStart + TRAVEL) { conn.flashed2 = true; spawnPulse(clientNode.position, 0xbfe6ff); }
      conn.website.userData.boost = Math.max(conn.website.userData.boost, 1.4 * op);
      clientNode.userData.boost = Math.max(clientNode.userData.boost, 0.6 * op);
      for (const h of conn.hops) h.userData.boost = Math.max(h.userData.boost, 0.7 * op);
      if (conn.age > flowEnd + 0.7) connections.splice(i, 1);
    }
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
  params.bad = Math.min(num('c-bad'), params.relays); params.flow = num('c-flow') / 100;
  $('c-bad').max = params.relays;              // 有害節點數上限 = relay 節點數
  $('c-bad').value = params.bad;
  $('v-relays').textContent = params.relays;
  $('v-circuits').textContent = params.circuits;
  $('v-bad').textContent = params.bad;
  $('v-flow').textContent = flowLabel(params.flow);

  $('c-relays').addEventListener('input', (e) => {
    params.relays = Number(e.target.value);
    $('v-relays').textContent = params.relays;
    $('c-bad').max = params.relays;            // bad 上限連動 relay
    if (params.bad > params.relays) { params.bad = params.relays; $('c-bad').value = params.bad; $('v-bad').textContent = params.bad; }
    reconcile();
  });
  $('c-bad').addEventListener('input', (e) => {
    params.bad = Math.min(Number(e.target.value), params.relays);
    $('c-bad').value = params.bad;             // 反映夾住後的值
    $('v-bad').textContent = params.bad;
    reconcile();
  });
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

  // 曳光彈頭沿路徑前進，跑完即移除
  for (let i = tracers.length - 1; i >= 0; i--) {
    const T = tracers[i], u = T.userData;
    u.t += u.speed * dt;
    if (u.t >= 1) { group.remove(T); T.geometry.dispose(); tracers.splice(i, 1); continue; }
    u.curve.getPoint(u.t, tmp); T.position.copy(tmp);
    u.curve.getTangent(u.t, dir); T.quaternion.setFromUnitVectors(AXIS_Z, dir); // 頭朝行進方向
  }

  // 節點脈動 + 生命動畫（淡入/淡出）+ boost 衰減
  for (const m of relays) updateNode(m, tsec, dt);
  updateNode(clientNode, tsec, dt); updateNode(serviceNode, tsec, dt); updateNode(websiteNode, tsec, dt);
  // 淡出完成的節點移除（既有節點不動位置，只有被移除的會消失）
  for (let i = relays.length - 1; i >= 0; i--) {
    const m = relays[i];
    if (m.userData.dying && m.userData.life <= 0) {
      group.remove(m); m.geometry.dispose(); m.material.dispose(); relays.splice(i, 1);
    }
  }

  // 會合光暈（溫和：低不透明、緩起緩落、放大幅度小）
  for (let i = flashes.length - 1; i >= 0; i--) {
    const sh = flashes[i]; sh.userData.life += dt;
    const k = sh.userData.life / 1.3;
    sh.scale.setScalar(1 + k * 1.3);
    sh.material.opacity = 0.3 * Math.sin(Math.min(1, k) * Math.PI);
    if (k >= 1) { group.remove(sh); sh.geometry.dispose(); flashes.splice(i, 1); }
  }

  await post.renderAsync();
}

function updateNode(m, tsec, dt) {
  const ud = m.userData;
  // 生命動畫：新增從 0 長到 1（淡入），移除從 1 淡到 0
  if (ud.dying) ud.life = Math.max(0, ud.life - dt / 0.5);
  else if (ud.life < 1) ud.life = Math.min(1, ud.life + dt / 0.6);
  let e = ud.baseEmis * (1 + 0.2 * Math.sin(tsec * 1.6 + ud.phase));
  if (ud.boost > 0) { e += ud.boost; ud.boost = Math.max(0, ud.boost - dt * 2.2); }
  ud.uEmis.value = e * ud.life;
  m.scale.setScalar(ud.life * (1 + (ud.boost > 0 ? ud.boost * 0.14 : 0)));
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
