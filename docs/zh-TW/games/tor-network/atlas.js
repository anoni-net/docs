// Tor 網路現況地球儀
// 讀取由 Onionoo 蒸餾出的靜態 snapshot.json，把全網 running 中繼隨機灑在所屬國家的國土範圍內。
// 顏色分 middle/guard/exit/both，大小分頻寬三桶。three.js WebGPURenderer + TSL bloom。
// 底圖用 countries.json（Natural Earth 110m）即時畫成貼圖：填海陸、描國界、依中繼數把國家調亮。
import * as THREE from 'three';
import { pass, texture } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const COL = {
  bg: 0x04060d,
  mid: 0x2fb6ff,   // 中繼（middle）
  guard: 0x57e39a, // guard
  exit: 0xffb64d,  // exit
  both: 0xff6b8a,  // guard+exit
  coast: 0x6fc0ee, // 海岸線
};
// 底圖貼圖用色（畫在 canvas 上，走 CSS 色字串）
const MAP = {
  sea: '#06182c',       // 海
  land: '#14304a',      // 沒有中繼的陸地
  landLo: '#1a3d5e',    // 有中繼，最少
  landHi: '#356690',    // 有中繼，最多。刻意壓低，底圖只是提示，主角是上面的中繼點
  border: 'rgba(4,16,28,.85)',
  grid: 'rgba(120,190,240,.10)',
  equator: 'rgba(120,190,240,.20)',
};
const ROLE_COL = [COL.mid, COL.guard, COL.exit, COL.both]; // index = roleCode

// ISO2 → [緯度, 經度] 手調的國家定位。優先於 countries.json 算出來的質心，
// 因為 Natural Earth 110m 沒有新加坡、香港這種小地方，挪威一類的質心也會飄到鄰國。
const CENTROID = {
  us:[39.8,-98.6], de:[51.2,10.4], nl:[52.2,5.3], se:[62,17.6], fr:[46.6,2.5], at:[47.6,14.1],
  gb:[54,-2.4], ca:[56,-106], ch:[46.8,8.2], fi:[64,26], ro:[45.9,24.9], lu:[49.8,6.1],
  it:[41.9,12.6], es:[40,-3.7], pl:[52,19], no:[61,9], sg:[1.35,103.8], cz:[49.8,15.5],
  hu:[47.2,19.5], jp:[36.2,138.3], ua:[48.4,31.2], au:[-25,134], md:[47.2,28.5], bg:[42.7,25.5],
  ru:[60,90], dk:[56,9.5], is:[64.9,-19], in:[22.6,79.6], za:[-29,24.6], br:[-10,-53],
  be:[50.6,4.6], ie:[53.2,-8], pt:[39.6,-8], gr:[39,22], tr:[39,35], hk:[22.35,114.1],
  tw:[23.7,120.9], kr:[36.4,127.9], cn:[35,104], mx:[23.6,-102.5], ar:[-38,-64], cl:[-35,-71],
  il:[31.4,35], nz:[-41.8,172.9], th:[15.1,101], id:[-2.5,118], my:[4.2,102], ph:[12.9,121.8],
  vn:[16.2,108], ee:[58.6,25], lv:[56.9,24.6], lt:[55.2,24], sk:[48.7,19.7], si:[46.1,14.8],
  hr:[45.1,15.2], rs:[44,20.9], ba:[44,18], mk:[41.6,21.7], ge:[42.3,43.4], am:[40.1,45],
  az:[40.1,47.6], kz:[48,67], by:[53.7,28], ae:[24,54], ma:[31.8,-7], ng:[9.1,8.7],
  cr:[9.7,-84], co:[4.6,-74], pe:[-9.2,-75], uy:[-32.5,-56], ec:[-1.8,-78], cy:[35,33],
  mt:[35.9,14.4], kg:[41.2,74.8], kn:[17.3,-62.7], bz:[17,-88.5], pr:[18.2,-66.5], ao:[-12,18],
  sc:[-4.7,55.5], eu:[50,10], xx:[0,-30], '??':[0,-30],
};
// Onionoo 少數中繼沒有明確國別（eu 泛指歐洲、?? 未知），硬標在某處只會誤導，地球上略過不畫
const NO_PLACE = new Set(['eu', 'xx', '??', '']);
const R = 5;

let renderer, scene, camera, post, globe;
const view = { dist: 14, rx: 0.45, ry: -0.9, spin: true }; // 開場看北大西洋兩岸，稍微低頭讓北半球（中繼幾乎都在那）置中
const tmp = new THREE.Vector3();
const pointMats = []; // relay 點的材質，載入時淡入
let pointsIn = 0;
const ANCHOR = new Map(); // ISO2 → { ll: [緯度, 經度], jlat, jlon, rings, bb }，沒有國界資料時才用 ll 加 jlat/jlon 抖動

function llToVec(lat, lon, r, out) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  out.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  return out;
}

async function initRenderer() {
  const forceWebGL = new URLSearchParams(location.search).get('backend') === 'webgl';
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
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, view.dist);
  scene.add(new THREE.HemisphereLight(0x2a466e, 0x05070d, 0.5)); // 夜側留一點底光，國界與陸地仍讀得到
  const sun = new THREE.DirectionalLight(0xcfe6ff, 2.2); // 太陽從左側來，明暗交界落在正面
  sun.position.set(-8, 1.5, 2.5);
  scene.add(sun);

  globe = new THREE.Group();
  scene.add(globe);
  return true;
}

// ---- 底圖：把國界多邊形畫成等距圓柱投影的貼圖 ----
const TEX_W = 2048, TEX_H = 1024;
const texX = (lon) => (lon + 180) / 360 * TEX_W;
const texY = (lat) => (90 - lat) / 180 * TEX_H;

function landColor(n, max) {
  if (!n) return MAP.land;
  const t = Math.pow(n / max, 0.35); // 開根號式色階，少量中繼的國家也拉得開，又不會全部擠在最亮端
  const a = MAP.landLo, b = MAP.landHi;
  const mix = (i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t);
  return `rgb(${mix(1)},${mix(3)},${mix(5)})`;
}

function paintEarth(world, counts) {
  const cv = document.createElement('canvas');
  cv.width = TEX_W; cv.height = TEX_H;
  const g = cv.getContext('2d');
  g.fillStyle = MAP.sea;
  g.fillRect(0, 0, TEX_W, TEX_H);

  let max = 1;
  for (const v of counts.values()) if (v > max) max = v;
  g.lineJoin = 'round';
  g.strokeStyle = MAP.border;
  g.lineWidth = 1.6;
  for (const c of world.c) {
    let lo0 = 999, lo1 = -999, la0 = 999, la1 = -999;
    g.beginPath();
    for (const ring of c.p) {
      g.moveTo(texX(ring[0]), texY(ring[1]));
      for (let i = 2; i < ring.length; i += 2) g.lineTo(texX(ring[i]), texY(ring[i + 1]));
      g.closePath();
      for (let i = 0; i < ring.length; i += 2) {
        if (ring[i] < lo0) lo0 = ring[i]; if (ring[i] > lo1) lo1 = ring[i];
        if (ring[i + 1] < la0) la0 = ring[i + 1]; if (ring[i + 1] > la1) la1 = ring[i + 1];
      }
    }
    g.fillStyle = landColor(counts.get(c.k) || 0, max);
    g.fill();
    g.stroke();
    // 順手把國界留給中繼點取樣用，點才會落在國土內而不是質心附近一團
    if (!c.k) continue;
    if (!ANCHOR.has(c.k)) ANCHOR.set(c.k, { ll: [c.m[1], c.m[0]], jlat: 1, jlon: 1.4 });
    const a = ANCHOR.get(c.k);
    a.rings = c.p;
    a.bb = [lo0, la0, lo1 - lo0, la1 - la0];
  }

  // 經緯線每 30 度，赤道稍亮
  g.lineWidth = 1;
  g.strokeStyle = MAP.grid;
  for (let lon = -180; lon <= 180; lon += 30) { g.beginPath(); g.moveTo(texX(lon), 0); g.lineTo(texX(lon), TEX_H); g.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); g.moveTo(0, texY(lat)); g.lineTo(TEX_W, texY(lat)); g.stroke(); }
  g.strokeStyle = MAP.equator;
  g.beginPath(); g.moveTo(0, texY(0)); g.lineTo(TEX_W, texY(0)); g.stroke();
  return cv;
}

function buildEarth(world, counts) {
  for (const k in CENTROID) ANCHOR.set(k, { ll: CENTROID[k], jlat: 1, jlon: 1.4 });
  const tex = new THREE.CanvasTexture(paintEarth(world, counts));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  if (renderer.getMaxAnisotropy) tex.anisotropy = Math.min(8, renderer.getMaxAnisotropy());
  const mat = new THREE.MeshStandardNodeMaterial({ map: tex, roughness: 1, metalness: 0 });
  mat.emissiveNode = texture(tex).mul(0.26); // 夜側不全黑，轉到背光面仍看得出海陸與國家深淺
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mat));
}

function buildCoastline(coast) {
  const seg = coast.seg;
  const n = seg.length / 4;
  const pos = new Float32Array(n * 2 * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    llToVec(seg[i * 4 + 1], seg[i * 4], R * 1.004, v);
    pos[i * 6] = v.x; pos[i * 6 + 1] = v.y; pos[i * 6 + 2] = v.z;
    llToVec(seg[i * 4 + 3], seg[i * 4 + 2], R * 1.004, v);
    pos[i * 6 + 3] = v.x; pos[i * 6 + 4] = v.y; pos[i * 6 + 5] = v.z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.LineBasicMaterial({ color: COL.coast, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
  globe.add(new THREE.LineSegments(g, m));
}

// 射線法：點是否落在該國的任一個外環內
function inRings(rings, lon, lat) {
  let hit = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const yi = r[i + 1], yj = r[j + 1];
      if ((yi > lat) !== (yj > lat) && lon < (r[j] - r[i]) * (lat - yi) / (yj - yi) + r[i]) hit = !hit;
    }
  }
  return hit;
}

// 在國土內隨機取一點。Natural Earth 沒有的小地方（新加坡、香港）退回錨點加小抖動。
function sampleIn(a, out) {
  if (a.rings) {
    for (let t = 0; t < 24; t++) {
      const lon = a.bb[0] + Math.random() * a.bb[2];
      const lat = a.bb[1] + Math.random() * a.bb[3];
      if (inRings(a.rings, lon, lat)) { out[0] = lat; out[1] = lon; return out; }
    }
  }
  out[0] = a.ll[0] + (Math.random() + Math.random() - 1) * a.jlat;
  out[1] = a.ll[1] + (Math.random() + Math.random() - 1) * a.jlon;
  return out;
}

function buildRelays(snap) {
  // 依頻寬分三桶，每桶一個 Points（避開此版 three.js 無法逐點設 size 的限制）
  const BUCKETS = [
    { max: 2000, size: 0.045 },
    { max: 30000, size: 0.09 },
    { max: Infinity, size: 0.16 },
  ];
  const pos = [[], [], []], col = [[], [], []];
  const c = new THREE.Color();
  const ll = [0, 0];
  let drawn = 0;
  for (let i = 0; i < snap.relays.length; i++) {
    const [country, role, w] = snap.relays[i];
    const a = ANCHOR.get(country);
    if (!a || NO_PLACE.has(country)) continue;
    drawn++;
    sampleIn(a, ll);
    llToVec(ll[0], ll[1], R * 1.012, tmp);
    const b = w < BUCKETS[0].max ? 0 : w < BUCKETS[1].max ? 1 : 2;
    pos[b].push(tmp.x, tmp.y, tmp.z);
    c.set(ROLE_COL[role]).multiplyScalar(1.6);
    col[b].push(c.r, c.g, c.b);
  }
  for (let b = 0; b < 3; b++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos[b]), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col[b]), 3));
    const m = new THREE.PointsNodeMaterial({ size: BUCKETS[b].size, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    m.opacity = REDUCED ? 1 : 0; // 載入時從 0 淡入
    pointMats.push(m);
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    globe.add(pts);
  }
  return drawn;
}

// ---- 國家標籤：每個有中繼的國家都給一個，轉到背面淡出。
// 位置擠不下時讓中繼多的優先，放大地球後小國的標籤就會浮出來。
const labels = [];
function buildLabels(snap) {
  const box = $('labels');
  if (!box) return;
  const list = snap.countries || snap.topCountries || [];
  list.forEach(([cc, n], rank) => {
    const a = ANCHOR.get(cc);
    if (!a || NO_PLACE.has(cc)) return;
    const el = document.createElement('div');
    el.className = rank < 10 ? 'lb' : 'lb sm'; // 前段用亮字，長尾壓暗，一眼看得出主次
    el.innerHTML = `${cc.toUpperCase()}<i>${n.toLocaleString()}</i>`;
    box.appendChild(el);
    labels.push({ el, v: llToVec(a.ll[0], a.ll[1], R * 1.03, new THREE.Vector3()), w: 44, h: 15, on: false });
  });
  requestAnimationFrame(() => { for (const l of labels) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; } });
}

const placed = [];
const proj = new THREE.Vector3();
function updateLabels() {
  if (!labels.length) return;
  globe.updateMatrixWorld();
  camera.updateMatrixWorld();
  placed.length = 0;
  const nearZ = R * R / camera.position.z; // 球面上朝向鏡頭那半邊的 z 門檻
  for (const l of labels) {
    proj.copy(l.v).applyMatrix4(globe.matrixWorld);
    let show = proj.z > nearZ + 0.06;
    if (show) {
      proj.project(camera);
      const x = (proj.x * 0.5 + 0.5) * innerWidth, y = (-proj.y * 0.5 + 0.5) * innerHeight;
      for (const q of placed) {
        if (Math.abs(x - q.x) < (l.w + q.w) / 2 + 7 && Math.abs(y - q.y) < (l.h + q.h) / 2 + 3) { show = false; break; }
      }
      if (show) {
        placed.push({ x, y, w: l.w, h: l.h });
        l.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
      }
    }
    if (show !== l.on) { l.on = show; l.el.style.opacity = show ? 1 : 0; }
  }
}

// snapshot 的 countries 是伺服器端聚合的準確值；舊快照沒這欄位就退回逐台樣本統計
function countryCounts(snap) {
  const m = new Map();
  for (const [cc, n] of snap.countries || snap.topCountries || []) m.set(cc, n);
  if (!m.size) for (const [cc] of snap.relays) m.set(cc, (m.get(cc) || 0) + 1);
  return m;
}

function fillPanel(snap, drawn) {
  $('stat-total').textContent = snap.total.toLocaleString();
  $('stat-pub').textContent = (snap.published || '').replace(' ', ' · ') + ' UTC';
  const br = snap.byRole || {};
  const rn = { 0: '中繼', 1: 'guard', 2: 'exit', 3: 'guard＋exit' };
  $('stat-role').innerHTML = [1, 3, 2, 0].map((k) =>
    `<span class="chip" style="--c:#${ROLE_COL[k].toString(16).padStart(6, '0')}">${rn[k]} ${(br[k] || 0).toLocaleString()}</span>`
  ).join('');
  $('stat-country').innerHTML = (snap.topCountries || []).slice(0, 8)
    .map(([cc, n]) => `<span class="chip">${cc.toUpperCase()} ${n}</span>`).join('');
  // 地球上畫出來的台數少於總數時要講清楚，別讓人以為每一台都在畫面上
  if (drawn && drawn < snap.total) {
    $('gap').textContent = `地球上目前畫出 ${drawn.toLocaleString()} 台，其餘受資料來源的分頁限制尚未取得。`;
  }
}

// ---- 控制：拖曳旋轉、滾輪縮放、閒置自轉 ----
const pointers = new Map();
let last = null, pinchStart = 0, distStart = 0;
function bindControls(dom) {
  dom.addEventListener('pointerdown', (e) => {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    view.spin = false; last = { x: e.clientX, y: e.clientY };
    if (pointers.size === 2) { const p = [...pointers.values()]; pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); distStart = view.dist; }
  });
  dom.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchStart > 0) view.dist = clamp(distStart * pinchStart / d, 7.5, 30);
      return;
    }
    if (!last) return;
    view.ry += (e.clientX - last.x) * 0.006;
    view.rx = clamp(view.rx + (e.clientY - last.y) * 0.006, -1.2, 1.2);
    last = { x: e.clientX, y: e.clientY };
  });
  const up = (e) => { pointers.delete(e.pointerId); if (pointers.size === 0) last = null; if (pointers.size < 2) pinchStart = 0; };
  dom.addEventListener('pointerup', up); dom.addEventListener('pointercancel', up);
  dom.addEventListener('wheel', (e) => { e.preventDefault(); view.dist = clamp(view.dist * (1 + Math.sign(e.deltaY) * 0.08), 7.5, 30); }, { passive: false });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

let prevNow = performance.now();
async function animate() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - prevNow) / 1000); prevNow = now;
  if (view.spin && !REDUCED) view.ry += dt * 0.06;
  globe.rotation.y = view.ry;
  globe.rotation.x = view.rx;
  camera.position.z += (view.dist - camera.position.z) * 0.12;
  camera.lookAt(0, 0, 0);
  if (pointsIn < 1) { pointsIn = Math.min(1, pointsIn + dt / 1.2); for (const m of pointMats) m.opacity = pointsIn; } // 點層淡入
  updateLabels();
  try {
    await post.renderAsync();
  } catch (e) {
    console.error(e); $('backend').textContent = '渲染中斷'; $('backend').className = 'err'; renderer.setAnimationLoop(null);
  }
}

async function main() {
  const ok = await initRenderer();
  if (!ok) return;
  const [snap, world, coast] = await Promise.all([
    fetch('./snapshot.json', { cache: 'no-cache' }).then((r) => r.json()), // 資料每小時更新，每次載入都向 server 驗證新鮮度
    fetch('./countries.json').then((r) => r.json()),
    fetch('./continents.json').then((r) => r.json()).catch(() => null), // 海岸線可選，抓不到就略過
  ]);
  buildEarth(world, countryCounts(snap));
  if (coast) buildCoastline(coast);
  const drawn = buildRelays(snap);
  buildLabels(snap);
  fillPanel(snap, drawn);
  post = new THREE.PostProcessing(renderer);
  const sp = pass(scene, camera);
  const c = sp.getTextureNode('output');
  post.outputNode = c.add(bloom(c, 0.6, 0.5, 0.7));
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  bindControls(renderer.domElement);
  $('hint-close') && $('hint-close').addEventListener('click', () => $('hint').classList.add('hidden'));
  renderer.setAnimationLoop(animate);
  // 閒置一段時間後恢復自轉
  addEventListener('pointerup', () => { setTimeout(() => { if (pointers.size === 0) view.spin = true; }, 3500); });
}
main().catch((e) => { $('backend').textContent = '啟動失敗'; $('backend').className = 'err'; console.error(e); });
