// .onion 會合流量視覺化
// 一片 Tor relay 節點雲，client 與 .onion 服務在兩側。系統持續自動發起連線：
// 每次隨機挑一個 relay 當會合點（rendezvous point），client 與服務各建一條 3 跳電路
// 流向它，用細小發光粒子表現流量方向，在會合點匯流、閃光。純氛圍呈現，不標步驟名稱。
// three.js WebGPURenderer + TSL bloom；不支援 WebGPU 時退回 WebGL2。
import * as THREE from 'three';
import { color, uniform, pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

const $ = (id) => document.getElementById(id);

const COL = {
  bg: 0x04060d,
  relay: 0x2f5876,
  client: 0x38d6ff,
  service: 0xb98cff,
  clientStream: 0xaaf0ff,
  serviceStream: 0xe6d4ff,
  rp: 0xffffff,
};

const FIELD_N = 60;          // relay 節點數
const MAX_PARTICLES = 6000;
const EMIT_INTERVAL = 0.018; // 每條電路每隔多久噴一顆粒子（越小越密）
const TRAVEL = 2.6;          // 粒子從起點流到會合點約幾秒
const SPAWN_INTERVAL = 1.5;  // 自動發起連線的間隔
const MAX_CONNS = 6;

// ---- three.js ----
let renderer, scene, camera, post;
const TARGET = new THREE.Vector3(0, 0, 0);

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
  scene.fog = new THREE.Fog(COL.bg, 46, 120);
  camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.5, 400);

  scene.add(new THREE.HemisphereLight(0x2a3f60, 0x0a0a12, 0.8));
  const key = new THREE.DirectionalLight(0xbfe6ff, 0.7);
  key.position.set(10, 18, 20); scene.add(key);

  post = new THREE.PostProcessing(renderer);
  const scenePass = pass(scene, camera);
  const col = scenePass.getTextureNode('output');
  post.outputNode = col.add(bloom(col, 1.1, 0.7, 0.5));

  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  return true;
}

// ---- 節點雲 ----
const group = new THREE.Group();
let relays = [];        // 一般 relay 節點
let clientNode, serviceNode;
const FIELD = new THREE.Vector3(19, 11, 15); // 橢球半徑

function makeNode(colorHex, radius, baseEmis, geo) {
  const uEmis = uniform(baseEmis);
  const mat = new THREE.MeshStandardNodeMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
  mat.emissiveNode = color(colorHex).mul(uEmis);
  const mesh = new THREE.Mesh(geo || new THREE.SphereGeometry(radius, 16, 12), mat);
  mesh.userData = { uEmis, baseEmis, boost: 0, phase: Math.random() * 6.28 };
  return mesh;
}

function buildField() {
  // relay 散布在橢球內
  for (let i = 0; i < FIELD_N; i++) {
    const u = Math.random(), v = Math.random(), w = Math.random();
    const theta = u * Math.PI * 2, phi = Math.acos(2 * v - 1), r = Math.cbrt(w);
    const m = makeNode(COL.relay, 0.34 + Math.random() * 0.12, 0.35 + Math.random() * 0.25);
    m.position.set(
      Math.sin(phi) * Math.cos(theta) * FIELD.x * r,
      Math.cos(phi) * FIELD.y * r,
      Math.sin(phi) * Math.sin(theta) * FIELD.z * r,
    );
    group.add(m); relays.push(m);
  }
  // client 與 .onion 服務放兩側
  clientNode = makeNode(COL.client, 1.05, 1.5, new THREE.IcosahedronGeometry(1.05, 1));
  clientNode.position.set(-FIELD.x - 6, -3, 4);
  serviceNode = makeNode(COL.service, 1.05, 1.5, new THREE.IcosahedronGeometry(1.05, 1));
  serviceNode.position.set(FIELD.x + 6, 4, -4);
  group.add(clientNode, serviceNode);
  scene.add(group);
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

// ---- 連線（會合）----
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
  if (connections.length >= MAX_CONNS) { connections.shift(); }
  const rp = relays[Math.floor(Math.random() * relays.length)];
  const cHops = pickDistinct(relays, 2, rp);
  const sHops = pickDistinct(relays, 2, rp);
  if (cHops.length < 2 || sHops.length < 2) return;
  const clientCurve = new THREE.CatmullRomCurve3([clientNode.position, cHops[0].position, cHops[1].position, rp.position], false, 'catmullrom', 0.4);
  const serviceCurve = new THREE.CatmullRomCurve3([serviceNode.position, sHops[0].position, sHops[1].position, rp.position], false, 'catmullrom', 0.4);
  connections.push({
    clientCurve, serviceCurve, rp, hops: [...cHops, ...sHops],
    age: 0, ttl: 4 + Math.random() * 2.5, emit: 0, flashed: false,
    lineC: addFaintLine(clientCurve, COL.clientStream), lineS: addFaintLine(serviceCurve, COL.serviceStream),
  });
}

function addFaintLine(curve, hex) {
  const geo = new THREE.TubeGeometry(curve, 60, 0.03, 6, false);
  const mat = new THREE.MeshBasicNodeMaterial({ color: hex, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  return mesh;
}

function spawnFlash(pos) {
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14),
    new THREE.MeshBasicNodeMaterial({ color: COL.rp, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  shell.position.copy(pos); shell.userData.life = 0;
  group.add(shell); flashes.push(shell);
}

function updateConnections(dt) {
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i];
    conn.age += dt;
    const alive = conn.age < conn.ttl;
    // 電路淡入淡出（faint line）
    const fade = alive ? Math.min(1, conn.age / 0.6) : Math.max(0, 1 - (conn.age - conn.ttl) / 0.8);
    conn.lineC.material.opacity = 0.11 * fade;
    conn.lineS.material.opacity = 0.11 * fade;

    if (alive) {
      conn.emit -= dt;
      while (conn.emit <= 0) {
        allocParticle(conn.clientCurve, COL.clientStream);
        allocParticle(conn.serviceCurve, COL.serviceStream);
        conn.emit += EMIT_INTERVAL;
      }
      conn.rp.userData.boost = Math.max(conn.rp.userData.boost, 1.6);
      for (const h of conn.hops) h.userData.boost = Math.max(h.userData.boost, 0.7);
      // 兩股流大約在 TRAVEL 秒後抵達會合點 → 閃一下「接上了」
      if (!conn.flashed && conn.age > TRAVEL) { conn.flashed = true; spawnFlash(conn.rp.position); }
    }
    // 收尾：停止噴粒子後，等殘餘粒子跑完再移除
    if (conn.age > conn.ttl + TRAVEL + 0.5) {
      group.remove(conn.lineC); conn.lineC.geometry.dispose();
      group.remove(conn.lineS); conn.lineS.geometry.dispose();
      connections.splice(i, 1);
    }
  }
}

// ---- 相機 orbit（緩慢自轉 + 拖曳 + 縮放；點擊空白處加一條連線）----
const orbit = { theta: 0.5, phi: 1.15, radius: 52 };
const pointers = new Map();
let downPos = null, dragged = false, pinchStart = 0, radiusStart = 0;

function applyCamera() {
  camera.position.set(
    TARGET.x + orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta),
    TARGET.y + orbit.radius * Math.cos(orbit.phi),
    TARGET.z + orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
  );
  camera.lookAt(TARGET);
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function bindControls(dom) {
  dom.addEventListener('pointerdown', (e) => {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { downPos = { x: e.clientX, y: e.clientY }; dragged = false; }
    if (pointers.size === 2) { const p = [...pointers.values()]; pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); radiusStart = orbit.radius; }
  });
  dom.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchStart > 0) orbit.radius = clamp(radiusStart * pinchStart / d, 26, 95);
      dragged = true; return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) dragged = true;
    orbit.theta -= dx * 0.005;
    orbit.phi = clamp(orbit.phi - dy * 0.005, 0.25, Math.PI - 0.25);
  });
  const up = (e) => {
    const wasClick = pointers.size === 1 && !dragged;
    pointers.delete(e.pointerId);
    if (wasClick) spawnConnection();
    if (pointers.size < 2) pinchStart = 0;
  };
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', up);
  dom.addEventListener('wheel', (e) => { e.preventDefault(); orbit.radius = clamp(orbit.radius * (1 + Math.sign(e.deltaY) * 0.08), 26, 95); }, { passive: false });
}

// ---- 每幀 ----
let prevNow = performance.now();
let spawnTimer = 0;

async function animate() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - prevNow) / 1000); prevNow = now;
  const tsec = now / 1000;

  if (pointers.size === 0) orbit.theta += dt * 0.04; // 緩慢自轉
  applyCamera();

  // 自動發起連線
  spawnTimer -= dt;
  if (spawnTimer <= 0) { spawnConnection(); spawnTimer = SPAWN_INTERVAL; }

  updateConnections(dt);

  // 推進粒子
  let posDirty = false;
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particles[i];
    if (!p.active) continue;
    p.t += p.speed * dt;
    if (p.t >= 1) { freeParticle(i); continue; }
    p.curve.getPoint(p.t, tmp);
    pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y; pPos[i * 3 + 2] = tmp.z;
    posDirty = true;
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;

  // 節點脈動 + boost 衰減
  for (const m of [...relays, clientNode, serviceNode]) {
    const ud = m.userData;
    let e = ud.baseEmis * (1 + 0.2 * Math.sin(tsec * 1.6 + ud.phase));
    if (ud.boost > 0) { e += ud.boost; ud.boost = Math.max(0, ud.boost - dt * 2.2); }
    ud.uEmis.value = e;
    const s = 1 + (ud.boost > 0 ? ud.boost * 0.14 : 0);
    m.scale.setScalar(s);
  }

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

// ---- 啟動 ----
async function main() {
  const ok = await initRenderer();
  if (!ok) return;
  buildField();
  buildParticles();
  bindControls(renderer.domElement);
  $('hint-close').addEventListener('click', () => $('hint').classList.add('hidden'));
  // 開場先鋪幾條，畫面一開始就有流量
  for (let i = 0; i < 3; i++) spawnConnection();
  renderer.setAnimationLoop(animate);
}

main().catch((e) => { $('backend').textContent = '啟動失敗'; $('backend').className = 'err'; console.error(e); });
