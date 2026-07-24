// Tor 網路現況地球儀（spike）
// 讀取由 Onionoo 蒸餾出的靜態 snapshot.json，把全網 running 中繼依「國家質心＋抖動」標在地球上。
// 顏色分 middle/guard/exit/both，大小分頻寬三桶。three.js WebGPURenderer + TSL bloom。
import * as THREE from 'three';
import { pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const COL = {
  bg: 0x04060d,
  mid: 0x2fb6ff,   // 中繼（middle）
  guard: 0x57e39a, // guard
  exit: 0xffb64d,  // exit
  both: 0xff6b8a,  // guard+exit
  earth: 0x0a1626,
  grid: 0x14364e,
  atmo: 0x0b5cff,
};
const ROLE_COL = [COL.mid, COL.guard, COL.exit, COL.both]; // index = roleCode
const ROLE_NAME = ['中繼', 'guard 入口', 'exit 出口', 'guard＋exit'];

// ISO2 → [緯度, 經度] 國家質心（近似，spike 用）
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
const R = 5;

let renderer, scene, camera, post, globe;
const view = { dist: 14, rx: 0, ry: 0, spin: true };
const tmp = new THREE.Vector3();

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
  scene.add(new THREE.HemisphereLight(0x33507a, 0x05070d, 1.1));

  globe = new THREE.Group();
  globe.rotation.y = -2.1; // 開場先轉到歐美一帶（中繼最多）
  scene.add(globe);
  buildEarth();
  return true;
}

function buildEarth() {
  // 地球本體（不透光，遮住背面的點）
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(R, 48, 32),
    new THREE.MeshStandardNodeMaterial({ color: COL.earth, roughness: 1, metalness: 0 })
  );
  globe.add(earth);
  // 經緯線網格
  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.002, 24, 16),
    new THREE.MeshBasicNodeMaterial({ color: COL.grid, wireframe: true, transparent: true, opacity: 0.5 })
  );
  globe.add(grid);
  // 大氣層輝光
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.14, 40, 28),
    new THREE.MeshBasicNodeMaterial({ color: COL.atmo, side: THREE.BackSide, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scene.add(atmo);
}

async function loadRelays() {
  const snap = await fetch('./snapshot.json').then((r) => r.json());
  // 依頻寬分三桶，每桶一個 Points（避開此版 three.js 無法逐點設 size 的限制）
  const BUCKETS = [
    { max: 2000, size: 0.05 },
    { max: 30000, size: 0.09 },
    { max: Infinity, size: 0.16 },
  ];
  const pos = [[], [], []], col = [[], [], []];
  const c = new THREE.Color();
  for (let i = 0; i < snap.relays.length; i++) {
    const [country, role, w] = snap.relays[i];
    const ll = CENTROID[country] || CENTROID.xx;
    // 抖動：同國中繼散成一團（近似高斯，讓大國成為明顯聚落）
    const j = 6.5;
    const jlat = (Math.random() + Math.random() - 1) * j;
    const jlon = (Math.random() + Math.random() - 1) * j / Math.max(0.35, Math.cos(ll[0] * Math.PI / 180));
    llToVec(ll[0] + jlat, ll[1] + jlon, R * 1.012, tmp);
    const b = w < BUCKETS[0].max ? 0 : w < BUCKETS[1].max ? 1 : 2;
    pos[b].push(tmp.x, tmp.y, tmp.z);
    c.set(ROLE_COL[role]).multiplyScalar(1.7);
    col[b].push(c.r, c.g, c.b);
  }
  for (let b = 0; b < 3; b++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos[b]), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col[b]), 3));
    const m = new THREE.PointsNodeMaterial({ size: BUCKETS[b].size, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    globe.add(pts);
  }
  fillPanel(snap);
}

function fillPanel(snap) {
  $('stat-total').textContent = snap.total.toLocaleString();
  $('stat-pub').textContent = (snap.published || '').replace(' ', ' · ') + ' UTC';
  const br = snap.byRole || {};
  const rn = { 0: '中繼', 1: 'guard', 2: 'exit', 3: 'guard＋exit' };
  $('stat-role').innerHTML = [1, 3, 2, 0].map((k) =>
    `<span class="chip" style="--c:#${ROLE_COL[k].toString(16).padStart(6, '0')}">${rn[k]} ${(br[k] || 0).toLocaleString()}</span>`
  ).join('');
  $('stat-country').innerHTML = (snap.topCountries || []).slice(0, 8)
    .map(([cc, n]) => `<span class="chip">${cc.toUpperCase()} ${n}</span>`).join('');
}

// ---- 控制：拖曳旋轉、滾輪縮放、閒置自轉 ----
const pointers = new Map();
let dragging = false, last = null, pinchStart = 0, distStart = 0;
function bindControls(dom) {
  dom.addEventListener('pointerdown', (e) => {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragging = true; view.spin = false; last = { x: e.clientX, y: e.clientY };
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
  const up = (e) => { pointers.delete(e.pointerId); if (pointers.size === 0) { dragging = false; last = null; } if (pointers.size < 2) pinchStart = 0; };
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
  try {
    await post.renderAsync();
  } catch (e) {
    console.error(e); $('backend').textContent = '渲染中斷'; $('backend').className = 'err'; renderer.setAnimationLoop(null);
  }
}

async function main() {
  const ok = await initRenderer();
  if (!ok) return;
  await loadRelays();
  post = new THREE.PostProcessing(renderer);
  const sp = pass(scene, camera);
  const c = sp.getTextureNode('output');
  post.outputNode = c.add(bloom(c, 0.85, 0.5, 0.55));
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  bindControls(renderer.domElement);
  $('hint-close') && $('hint-close').addEventListener('click', () => $('hint').classList.add('hidden'));
  renderer.setAnimationLoop(animate);
  // 閒置一段時間後恢復自轉
  addEventListener('pointerup', () => { setTimeout(() => { if (pointers.size === 0) view.spin = true; }, 3500); });
}
main().catch((e) => { $('backend').textContent = '啟動失敗'; $('backend').className = 'err'; console.error(e); });
