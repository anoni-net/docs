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
const EMIT_DUR = 0.4;        // 一波送出流量的持續時間（短＝緊湊封包，一顆引導頭從頭領到尾）
const TRAVEL = 1.9;          // （保留參考）粒子從起點流到會合點約幾秒
const WORLD_SPEED = 15;      // 世界等速 units/sec：速度與路徑長度無關，長路徑就多花時間
const TAIL_WORLD = 6.5;      // 回程彗星尾巴世界長度（units），加長讓「回應回來」更顯眼
const TRAIL_SEG = 16, TRAIL_RADIAL = 6, TRAIL_RADIUS = 0.13; // 尾巴 tube 參數（加粗、稍多分段）
const SPAWN_MIN_GAP = 0.1;   // 補新連線的最小間隔（錯開避免同步）
const T_EST = 0.55;          // onion：電路細線畫到 RP 的時間（建立電路）
const T_EXCH = 0.6;          // onion：兩股都抵達 RP 後，在 RP 交換資訊的停頓
const LINE_OP = 0.15;        // onion：電路細線不透明度（additive，淡）
const PARTICLE_GAIN = 1.8;   // 流量粒子色彩增益（推進 HDR → 更亮、bloom 更明顯）
const FIELD = new THREE.Vector3(20, 11.5, 1); // 平面：x/y 橢圓半徑，z 微幅厚度（物件仍 3D）
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
  post.outputNode = afterImage(glow, 0.45); // 尾巴由 tube 提供，殘影僅留一點流動感

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
  const uFlash = uniform(new THREE.Color(0, 0, 0)); // 會合閃白光（加在 emissive 上）
  const mat = new THREE.MeshStandardNodeMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
  mat.emissiveNode = uCol.mul(uEmis).add(uFlash);
  const mesh = new THREE.Mesh(geo || new THREE.SphereGeometry(radius, 16, 12), mat);
  // life：淡入淡出；bad：有害節點；flashT：會合閃光 1→0
  mesh.userData = { uEmis, uCol, uFlash, baseEmis, goodEmis: baseEmis, boost: 0, phase: Math.random() * 6.28, bad: false, life: 0, dying: false, flashT: 0 };
  return mesh;
}

function addRelay() {
  const m = makeNode(COL.relay, 0.34 + Math.random() * 0.12, 0.35 + Math.random() * 0.25);
  // best-candidate 取樣：從多個候選點挑「離既有 relay 最遠」的，避免擠成一團
  let bx = 0, by = 0, bestD = -1;
  for (let k = 0; k < 22; k++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
    const px = Math.cos(a) * FIELD.x * r, py = Math.sin(a) * FIELD.y * r;
    let nd = Infinity;
    for (const n of relays) {
      if (n.userData.dying) continue;
      const dx = px - n.position.x, dy = py - n.position.y, d = dx * dx + dy * dy;
      if (d < nd) nd = d;
    }
    if (nd > bestD) { bestD = nd; bx = px; by = py; }
  }
  m.position.set(bx, by, (Math.random() - 0.5) * 2 * FIELD.z);
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
  clientNode = makeNode(COL.client, 1.15, 1.5, new THREE.IcosahedronGeometry(1.15, 4));
  clientNode.position.set(-FIELD.x - 7, 0, 0); clientNode.userData.life = 1; clientNode.userData.isEndpoint = true;
  serviceNode = makeNode(COL.service, 1.05, 1.5, new THREE.IcosahedronGeometry(1.05, 4));
  serviceNode.position.set(FIELD.x + 7, 8.5, 0); serviceNode.userData.life = 1; serviceNode.userData.isEndpoint = true;   // .onion 服務（右上）
  websiteNode = makeNode(COL.website, 1.05, 1.4, new THREE.IcosahedronGeometry(1.05, 4));
  websiteNode.position.set(FIELD.x + 7, -8.5, 0); websiteNode.userData.life = 1; websiteNode.userData.isEndpoint = true;  // 明網網站（右下）
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
  const c = new THREE.Color(hex).multiplyScalar(PARTICLE_GAIN); // 提亮，讓流動粒子更醒目
  pCol[idx * 3] = c.r; pCol[idx * 3 + 1] = c.g; pCol[idx * 3 + 2] = c.b;
}
function allocParticle(curve, hex, speed) {
  const idx = freeList.pop();
  if (idx === undefined) return;
  const p = particles[idx];
  // speed 未指定＝世界等速（WORLD_SPEED/長度）；指定＝固定時長（會合時兩股同時抵達 RP）
  const base = speed !== undefined ? speed : WORLD_SPEED / curve.getLength();
  p.active = true; p.curve = curve; p.t = 0; p.speed = base * (0.82 + Math.random() * 0.15); // 一律略慢於引導頭（1.0×），讓頭永遠領在最前、不被超車
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
const tracers = [];
const lines = []; // onion 電路細線（沿曲線的細管），生命與連線一致

// 電路細線：一條沿曲線的細管，用 drawRange 從端點漸畫到 RP（表現「電路接出去」）
function spawnLine(curve, hex) {
  const geo = new THREE.TubeGeometry(curve, 60, 0.02, 5, false); // 更細
  const mat = new THREE.MeshBasicNodeMaterial({ color: new THREE.Color(hex).multiplyScalar(0.55), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }); // 調暗，退成路徑底線、不搶粒子
  mat.opacity = 0;
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  m.userData = { idxCount: geo.index.count };
  geo.setDrawRange(0, 0);
  group.add(m); lines.push(m);
  return m;
}
function setLineDraw(m, p) { m.geometry.setDrawRange(0, Math.floor(m.userData.idxCount * p)); } // p:0→1 沿線漸露
function removeLine(m) {
  const k = lines.indexOf(m); if (k >= 0) lines.splice(k, 1);
  group.remove(m); m.geometry.dispose(); m.material.dispose();
}

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
  const c = new THREE.CatmullRomCurve3(nodes.map((n) => n.position), false, 'catmullrom', 0.4);
  c._glow = nodes.filter((n) => !n.userData.isEndpoint); // 這條路徑上會被粒子點亮的 relay（端點除外）
  return c;
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
    const clientRet = curveThrough([rp, cHops[1], cHops[0], clientNode]);   // 回程：RP → client
    const serviceRet = curveThrough([rp, sHops[1], sHops[0], serviceNode]); // 回程：RP → service
    const tHop = Math.max(clientCurve.getLength(), serviceCurve.getLength()) / WORLD_SPEED;
    connections.push({
      type: 'onion', age: 0, emit: 0, emitDur,
      tHop, fwdSpeed: 1 / tHop, // 去程兩股都用 tHop 走完 → 同時抵達 RP
      clientCurve, serviceCurve,
      clientRet, serviceRet,
      rp, hops: [...cHops, ...sHops],
      clientLine: spawnLine(clientCurve, COL.clientStream),   // 電路細線：client → RP
      serviceLine: spawnLine(serviceCurve, COL.serviceStream), // 電路細線：服務 → RP
      estDone: false, fwdStarted: false, flashed: false, retStarted: false,
    });
    // 曳光彈頭改在去程／回程開始時才發（見 updateConnections）
  } else {
    // 明網：client → guard → middle → exit → 網站，回應原路走回
    const hops = pickDistinct(goodRelays, 3, null);
    if (hops.length < 3) return;
    const exit = hops[2];
    const fwdCurve = curveThrough([clientNode, hops[0], hops[1], exit, websiteNode]);
    connections.push({
      type: 'clearnet', age: 0, emit: 0, emitDur, flashed: false,
      tHop: fwdCurve.getLength() / WORLD_SPEED,
      fwdCurve,
      retCurve: curveThrough([websiteNode, exit, hops[1], hops[0], clientNode]),
      exit, website: websiteNode, hops,
    });
    // 去程（從端點出發）不放彗星頭，只有粒子流；回程才有彗星頭
  }
}

// 曳光彈頭：每股流量發出時，一顆較大、該股亮色的球領在最前面，殘影拉成平滑尾巴（非串珠）
function spawnTracer(curve, hex, speed) {
  const mat = new THREE.MeshBasicNodeMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); // geometry 每幀依曲線重建
  m.frustumCulled = false;
  const len = curve.getLength();
  m.userData = { curve, t: 0, speed: speed !== undefined ? speed : WORLD_SPEED / len, len, color: new THREE.Color(hex).multiplyScalar(PARTICLE_GAIN * 1.35) }; // 頭比粒子更亮，從封包裡跳出來
  group.add(m); tracers.push(m);
}

// 會合特效：讓會合點 relay 球體瞬間閃白光（明顯亮一下，0.5 秒衰減）
function flashNode(node) {
  node.userData.flashT = 1;
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
      const A = T_EST + conn.emitDur + conn.tHop; // 去程全部抵達 RP 的時刻
      const retStart = A + T_EXCH;                 // 交換後、回程開始
      const retEnd = retStart + conn.emitDur;
      const flowEnd = retEnd + conn.tHop;

      // 0) 建立電路：兩條細線從端點漸畫到同一台 RP
      if (!conn.estDone) {
        if (conn.age < T_EST) {
          const p = conn.age / T_EST;
          setLineDraw(conn.clientLine, p); conn.clientLine.material.opacity = LINE_OP * p;
          setLineDraw(conn.serviceLine, p); conn.serviceLine.material.opacity = LINE_OP * p;
        } else {
          conn.estDone = true;
          setLineDraw(conn.clientLine, 1); conn.clientLine.material.opacity = LINE_OP;
          setLineDraw(conn.serviceLine, 1); conn.serviceLine.material.opacity = LINE_OP;
        }
      }

      // 1) 去程：線畫好後，兩股同時往 RP 跑（fwdSpeed → 同時抵達）；去向不放彗星頭，只有粒子流
      if (conn.age >= T_EST) {
        if (!conn.fwdStarted) { conn.fwdStarted = true; conn.emit = 0; }
        if (conn.age < T_EST + conn.emitDur) {
          conn.emit -= dt;
          while (conn.emit <= 0) {
            allocParticle(conn.clientCurve, COL.clientStream, conn.fwdSpeed);
            allocParticle(conn.serviceCurve, COL.serviceStream, conn.fwdSpeed);
            conn.emit += interval;
          }
        }
      }

      // 2) 全部抵達 RP → 在此交換資訊：白閃一下並持續發亮（這段沒有流量移動）
      if (!conn.flashed && conn.age >= A) { conn.flashed = true; flashNode(conn.rp); }
      if (conn.age >= A && conn.age < retStart) conn.rp.userData.boost = Math.max(conn.rp.userData.boost, 4);

      // 3) 交換後：從 RP 同時發出回程，各自原路走回（世界等速）；一顆引導頭領這一波封包
      if (conn.age >= retStart) {
        if (!conn.retStarted) {
          conn.retStarted = true; conn.emit = 0;
          spawnTracer(conn.clientRet, COL.clientStream);
          spawnTracer(conn.serviceRet, COL.serviceStream);
        }
        if (conn.age < retEnd) {
          conn.emit -= dt;
          while (conn.emit <= 0) {
            allocParticle(conn.clientRet, COL.clientStream);
            allocParticle(conn.serviceRet, COL.serviceStream);
            conn.emit += interval;
          }
        }
      }

      // 4) 收尾：電路線淡出後移除連線
      if (conn.age > flowEnd) {
        const fo = Math.max(0, 1 - (conn.age - flowEnd) / 0.6);
        conn.clientLine.material.opacity = fo * LINE_OP;
        conn.serviceLine.material.opacity = fo * LINE_OP;
      }
      if (conn.age > flowEnd + 0.8) { removeLine(conn.clientLine); removeLine(conn.serviceLine); connections.splice(i, 1); }

    } else { // clearnet：去程 client → 網站，回程原路走回
      const retStart = conn.tHop;
      const retEnd = retStart + conn.emitDur;
      const flowEnd = retEnd + conn.tHop;
      if (conn.age < conn.emitDur) { // 去程
        conn.emit -= dt;
        while (conn.emit <= 0) { allocParticle(conn.fwdCurve, COL.clientStream); conn.emit += interval; }
      }
      // 去程抵達網站 → 網站柔和發光、開始回程（一顆引導頭領回程這一波）
      if (!conn.flashed && conn.age > conn.tHop) { conn.flashed = true; conn.emit = 0; spawnTracer(conn.retCurve, COL.respStream); }
      if (conn.age >= retStart && conn.age < retEnd) { // 回程（原路）
        conn.emit -= dt;
        while (conn.emit <= 0) { allocParticle(conn.retCurve, COL.respStream); conn.emit += interval; }
      }
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
  if (spawnTimer <= 0 && connections.length < params.circuits) { spawnConnection(); spawnTimer = SPAWN_MIN_GAP + Math.random() * 0.3; } // 隨機錯開，避免同步齊發

  updateConnections(dt);

  // 推進粒子
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particles[i];
    if (!p.active) continue;
    p.t += p.speed * dt;
    if (p.t >= 1) { freeParticle(i); continue; }
    p.curve.getPointAt(p.t, tmp); // 依弧長 → 等速
    pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y; pPos[i * 3 + 2] = tmp.z;
    // 粒子實際經過 relay 球體時，給它能量（發亮）；離開後由衰減慢慢暗回閒置
    const glow = p.curve._glow;
    if (glow) for (let g = 0; g < glow.length; g++) {
      const r = glow[g], dx = tmp.x - r.position.x, dy = tmp.y - r.position.y, dz = tmp.z - r.position.z;
      if (dx * dx + dy * dy + dz * dz < 0.8) r.userData.boost = Math.min(r.userData.boost + 8 * dt, 6);
    }
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;

  // 曳光彈頭沿路徑前進，跑完即移除
  for (let i = tracers.length - 1; i >= 0; i--) {
    const T = tracers[i], u = T.userData;
    u.t += u.speed * dt;
    if (u.t >= 1) { group.remove(T); T.geometry.dispose(); tracers.splice(i, 1); continue; }
    if (u.t < 0.01) continue; // 太短先不畫，避免退化曲線
    // 取曲線上 [t-尾長, t] 這一段當尾巴 → tube 必定順著軌跡彎（不是剛體整個轉）
    const t1 = Math.max(0, u.t - TAIL_WORLD / u.len);
    const pts = [];
    for (let s = 0; s <= TRAIL_SEG; s++) {
      const uu = t1 + (u.t - t1) * (s / TRAIL_SEG);
      pts.push(u.curve.getPointAt(uu).clone());
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), TRAIL_SEG, TRAIL_RADIUS, TRAIL_RADIAL, false);
    // 頂點色：尾端暗（additive 下不可見）→ 頭端亮，做出曳光彈頭亮尾淡
    const radN = TRAIL_RADIAL + 1, n = geo.attributes.position.count, col = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) {
      const b = Math.floor(v / radN) / TRAIL_SEG; // 0 尾 → 1 頭
      const bb = b * b; // 偏向頭端更亮
      col[v * 3] = u.color.r * bb; col[v * 3 + 1] = u.color.g * bb; col[v * 3 + 2] = u.color.b * bb;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    T.geometry.dispose(); T.geometry = geo;
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


  await post.renderAsync();
}

function updateNode(m, tsec, dt) {
  const ud = m.userData;
  // 生命動畫：新增從 0 長到 1（淡入），移除從 1 淡到 0
  if (ud.dying) ud.life = Math.max(0, ud.life - dt / 0.5);
  else if (ud.life < 1) ud.life = Math.min(1, ud.life + dt / 0.6);
  let e = ud.baseEmis * (1 + 0.2 * Math.sin(tsec * 1.6 + ud.phase));
  if (ud.boost > 0) { e += ud.boost; ud.boost = Math.max(0, ud.boost - dt * 1.6); } // 粒子離開後變暗消逝（閒置）
  ud.uEmis.value = e * ud.life;
  // 會合閃白光：flashT 1→0（0.5 秒），白光強度 = flashT² × 5，配 bloom 明顯亮一下
  if (ud.flashT > 0) ud.flashT = Math.max(0, ud.flashT - dt / 0.6); // 會合白閃約 0.6 秒
  ud.uFlash.value.setScalar(ud.flashT * ud.flashT * 5 * ud.life);   // 亮白 pop、快速衰減
  // 端點保留原本 boost 放大；relay 不放大
  m.scale.setScalar(ud.life * (1 + (ud.isEndpoint && ud.boost > 0 ? ud.boost * 0.14 : 0)));
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
  // 連線由 animate 的排程器依 params.circuits（預設 2）逐條錯開補齊，不在開場齊發
  renderer.setAnimationLoop(animate);
}

main().catch((e) => { $('backend').textContent = '啟動失敗'; $('backend').className = 'err'; console.error(e); });
