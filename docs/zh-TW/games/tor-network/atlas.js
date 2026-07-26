// Tor 網路現況地球儀
// 讀取由 Onionoo 蒸餾出的靜態 snapshot.json，把全網 running 中繼依國別聚成一團一團畫在地球上。
// 顏色分 middle/guard/exit/both，大小依 consensus weight 連續縮放。three.js WebGPURenderer + TSL bloom。
// 底圖用 countries.json（Natural Earth 110m）即時畫成貼圖：填海陸、描國界、依中繼數把國家調亮。
import * as THREE from 'three';
import { pass, texture } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const COL = {
  bg: 0x04060d,
  // 四色刻意排成一條亮度階梯（暗→亮：middle、guard、exit、both）。
  // 只靠色相的話，第二型色盲下 guard、exit、both 會收斂成同一種黃棕色。
  mid: 0x2a9fe0,   // 中繼（middle）
  guard: 0x4fd58f, // guard
  exit: 0xffb347,  // exit
  both: 0xff9ec7,  // guard+exit
  coast: 0x6fc0ee, // 海岸線
  cable: 0x2f7fa8, // 海底電纜。壓得比海岸線還低，只是讓海面不要一片空白
  blocked: 0xff5a6e, // OONI 觀測到 Tor 連線大量失敗的國家。紅色系跟四個角色色都拉開
};
// 底圖貼圖用色（畫在 canvas 上，走 CSS 色字串）
const MAP = {
  sea: '#06182c',       // 海
  land: '#16334e',      // 陸地本色，各國一致
  glowLo: '#0d2c46',    // 有中繼，最少
  glowHi: '#3d87bd',    // 有中繼，最多。壓著上限走，底圖只是提示，主角是上面的中繼點
  border: 'rgba(4,16,28,.85)',
  grid: 'rgba(120,190,240,.10)',
  equator: 'rgba(120,190,240,.20)',
};
const ROLE_COL = [COL.mid, COL.guard, COL.exit, COL.both]; // index = roleCode

// 地圖模式：全部，或單看某一種角色。發光層依模式換色階，深淺代表該國的數量。
// lo 是「有一台」的顏色，hi 是「最多的那個國家」，中間走 glowColor 的冪次曲線。
const MODES = {
  all:    { lbl: '全部',        lo: '#0d2c46', hi: '#3d87bd' },
  guard:  { lbl: 'guard',       lo: '#0c2b1e', hi: '#4fd58f' },
  exit:   { lbl: 'exit',        lo: '#2b1d09', hi: '#ffb347' },
  both:   { lbl: 'guard＋exit', lo: '#2a1220', hi: '#ff9ec7' },
  middle: { lbl: 'middle',      lo: '#08262e', hi: '#35c6e8' }, // 青色系，避開陸地本身的藍
  conc:   { lbl: '單一業者集中度', lo: '#2b1030', hi: '#c47ad8' }, // 紫，跟四個角色色都拉開
  // 使用者估計是需求端，跟其他模式的供給端不是同一件事，色相挑剩下沒人用的黃。
  // 這個模式下中繼點照樣全部顯示，「陸地亮度是用的人、點是架的機器」那個落差就是重點。
  users:  { lbl: '使用者估計',   lo: '#2a2410', hi: '#e8d24a' },
};
const CONC_MIN = 10; // 台數太少的國家，集中度沒有意義（一台就是 100%）
const MODE_ROLE = { guard: 1, exit: 2, both: 3, middle: 0 };
const ROLE_NAME = { 0: 'middle', 1: 'guard', 2: 'exit', 3: 'guard＋exit' };
const roleHex = (k) => '#' + ROLE_COL[k].toString(16).padStart(6, '0');
// 個別中繼點。國別資料撐不出空間分布，歐洲十幾國的團怎麼排都會擠在一起，
// 所以預設只畫國家色塊。想把點畫回來就改成 true。
const SHOW_DOTS = true;

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
// zoom 是「相對於剛好完整入鏡的倍率」，不是絕對距離。畫面比例一變（手機轉向、視窗縮放），
// 貼合距離跟著重算，地球就不會被裁掉，使用者原本放大到哪一級也保留得住。
const view = { zoom: 1, rx: 0.45, ry: -0.9, spin: true }; // 開場看北大西洋兩岸，稍微低頭讓北半球（中繼幾乎都在那）置中
const ZOOM_MIN = 0.42, ZOOM_MAX = 1.4;

// 整顆地球完整入鏡所需的距離。直式手機的水平視野比垂直窄很多，固定距離會把地球裁掉大半。
function fitDist() {
  const vFov = camera.fov * Math.PI / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  return R * 1.18 / Math.sin(Math.min(vFov, hFov) / 2);
}
function targetDist() { return fitDist() * view.zoom; }
const tmp = new THREE.Vector3();
const pointMats = []; // relay 點的材質，載入時淡入
const relayMeshes = []; // 依角色分開的中繼點，切到單一角色時只留那一組
let pointsIn = 0;
const ANCHOR = new Map(); // ISO2 → { ll: [緯度, 經度], jlat, jlon, rings, bb }，沒有國界資料時才用 ll 加 jlat/jlon 抖動

function llToVec(lat, lon, r, out) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  out.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  return out;
}

// 出事時要讓人看得到。徽章在面板裡，而手機預設把面板收起來，只寫徽章等於沒說。
function fatal(msg) {
  const box = $('fatal');
  if (box) { box.textContent = msg; box.hidden = false; }
  const badge = $('backend');
  if (badge) { badge.textContent = msg; badge.className = 'err'; }
}

// fetch 對 404、500 不會 reject，錯誤頁會一路餵進 json() 才炸開，這裡先攔下來
async function getJSON(url, opt) {
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

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
  const forceWebGL = new URLSearchParams(location.search).get('backend') === 'webgl';
  renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.appendChild(renderer.domElement);
  try { await renderer.init(); } catch (e) { console.error(e); fatal('這個瀏覽器無法啟用 WebGPU 或 WebGL2，地球儀畫不出來。'); return false; }
  const isGPU = !!(renderer.backend && renderer.backend.isWebGPUBackend);
  $('backend').className = isGPU ? 'gpu' : 'gl';
  $('backend').textContent = isGPU ? 'WebGPU' : 'WebGL2（fallback）';
  if (!isGPU) webgpuBlocker().then((why) => { if (why) $('backend').textContent = `WebGL2（fallback：${why}）`; });

  scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, targetDist());
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

function glowColor(n, max, ramp) {
  const t = Math.pow(n / max, 0.35); // 開根號式色階，少量中繼的國家也拉得開，又不會全部擠在最亮端
  const a = (ramp && ramp.lo) || MAP.glowLo, b = (ramp && ramp.hi) || MAP.glowHi;
  const mix = (i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t);
  return `rgb(${mix(1)},${mix(3)},${mix(5)})`;
}

// 畫兩張貼圖。base 是海陸與國界，吃日夜光照；glow 只放各國中繼數的等值色，走自體發光。
// 分開的原因：陸地亮度若併在 base 裡，會被 dot(N,L) 的明暗蓋過去，色階就讀不出來了。
const COUNTRY_PATH = new Map(); // ISO2 → Path2D（貼圖座標），重畫發光層時直接沿用
let GLOW = null;          // { canvas, tex }：發光層，切換指標時重畫
let MODE = 'all-count';   // 目前的地圖模式

// 發光層：各國依指標值上色。切換「台數、共識權重」時只重畫這一張。
function paintGlow(values, canvas, ramp) {
  const gg = canvas.getContext('2d');
  gg.fillStyle = '#000';
  gg.fillRect(0, 0, TEX_W, TEX_H);
  let max = 1;
  for (const v of values.values()) if (v > max) max = v;
  for (const [cc, path] of COUNTRY_PATH) {
    const n = values.get(cc) || 0;
    if (!n) continue;
    gg.fillStyle = glowColor(n, max, ramp);
    gg.fill(path);
  }
}

function paintEarth(world, counts) {
  const mk = () => { const cv = document.createElement('canvas'); cv.width = TEX_W; cv.height = TEX_H; return cv; };
  const base = mk(), glow = mk();
  const g = base.getContext('2d'), gg = glow.getContext('2d');
  g.fillStyle = MAP.sea;
  g.fillRect(0, 0, TEX_W, TEX_H);
  gg.fillStyle = '#000';
  gg.fillRect(0, 0, TEX_W, TEX_H);

  g.lineJoin = 'round';
  g.strokeStyle = MAP.border;
  g.lineWidth = 1.6;
  g.fillStyle = MAP.land;
  for (const c of world.c) {
    let lo0 = 999, lo1 = -999, la0 = 999, la1 = -999;
    const path = new Path2D();
    for (const ring of c.p) {
      path.moveTo(texX(ring[0]), texY(ring[1]));
      for (let i = 2; i < ring.length; i += 2) path.lineTo(texX(ring[i]), texY(ring[i + 1]));
      path.closePath();
      for (let i = 0; i < ring.length; i += 2) {
        if (ring[i] < lo0) lo0 = ring[i]; if (ring[i] > lo1) lo1 = ring[i];
        if (ring[i + 1] < la0) la0 = ring[i + 1]; if (ring[i + 1] > la1) la1 = ring[i + 1];
      }
    }
    g.fill(path);
    g.stroke(path);
    // 順手把國界留著，切換指標重畫發光層時不必再解析一次多邊形
    if (c.k) COUNTRY_PATH.set(c.k, path);
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
  paintGlow(counts, glow);
  return { base, glow };
}

function buildEarth(world, counts) {
  for (const k in CENTROID) ANCHOR.set(k, { ll: CENTROID[k], jlat: 1, jlon: 1.4 });
  const painted = paintEarth(world, counts);
  const toTex = (cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    if (renderer.getMaxAnisotropy) t.anisotropy = Math.min(8, renderer.getMaxAnisotropy());
    return t;
  };
  // 面板的漸層圖例直接吃這裡的色值，免得 CSS 與 JS 各留一份色碼、改了色階就對不上
  const ramp = document.querySelector('#ramp i');
  if (ramp) ramp.style.background = `linear-gradient(90deg, ${MAP.land} 0 14%, ${MAP.glowLo} 14%, ${MAP.glowHi})`;
  const baseTex = toTex(painted.base), glowTex = toTex(painted.glow);
  GLOW = { canvas: painted.glow, tex: glowTex };
  const mat = new THREE.MeshStandardNodeMaterial({ map: baseTex, roughness: 1, metalness: 0 });
  // 底圖留一點自發光，夜側仍看得出海陸；中繼多的國家額外亮起來，轉到背光面也讀得到
  mat.emissiveNode = texture(baseTex).mul(0.15).add(texture(glowTex).mul(0.5));
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mat));
}

// 海底電纜。資料是 OpenStreetMap 的 communication=line + submarine=yes，覆蓋並不完整，
// 這一層的定位是海面的背景質感，不是完整的海纜清單。
function buildCables(data) {
  const lines = (data && data.lines) || [];
  if (!lines.length) return;
  const pos = [];
  const v = new THREE.Vector3();
  // 兩點之間畫直線，跨得遠就會從地球內部穿過去，中段被球體擋住看起來就是斷掉。
  // 資料裡最長的一段有 4600 公里，所以超過這個角距離就沿著經緯度補點貼回球面。
  const MAX_STEP_DEG = 1.5;
  for (const ln of lines) {
    for (let i = 0; i + 3 < ln.length; i += 2) {
      const lon1 = ln[i], lat1 = ln[i + 1], lat2 = ln[i + 3];
      let dlon = ln[i + 2] - lon1;
      if (dlon > 180) dlon -= 360; else if (dlon < -180) dlon += 360; // 跨換日線走短的那邊
      const dlat = lat2 - lat1;
      const cos = Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
      const steps = Math.max(1, Math.ceil(Math.hypot(dlat, dlon * cos) / MAX_STEP_DEG));
      let plat = lat1, plon = lon1;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const lat = lat1 + dlat * t, lon = lon1 + dlon * t;
        llToVec(plat, plon, R * 1.003, v);
        pos.push(v.x, v.y, v.z);
        llToVec(lat, lon, R * 1.003, v);
        pos.push(v.x, v.y, v.z);
        plat = lat; plon = lon;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  // 這一層是背景，主角是中繼點與陸地亮度。北海、地中海一帶疊了幾十條線，透明度再高一點
  // 就會連成一片蓋過等值色，0.3 已經看得出在跟 choropleth 搶注意力。
  const m = new THREE.LineBasicMaterial({ color: COL.cable, transparent: true, opacity: 0.22, depthWrite: false });
  globe.add(new THREE.LineSegments(g, m));
}

// 主要跨洋走廊的示意線。
//
// OSM 的海纜收錄在太平洋中段、印度洋與南大西洋很稀疏，那幾片海在地球儀上會整片空掉。
// 這一層補的是「這裡有纜經過」的走向，畫法是取兩端登陸地點，中間拉大圓弧。登陸地點
// 與哪些地方之間有纜都是公開的地理常識，弧線是這支程式自己算的，沒有取用任何一家的
// 路徑幾何。相對地，這些線也就只有走向可信，實際路由不是長這樣，畫面文案要照這個
// 口徑寫，不要讓人以為是實測資料。
//
// 座標寫成 [緯度, 經度]，跟 cables.json 的 [lon, lat] 相反。手寫時緯度在前好讀，
// 改這份清單時注意別把順序記混了。
// 中間那些點多半是為了繞開陸地（大圓弧會抄近路直接切過大陸），刪掉會看到線穿過陸塊。
const TRUNK = [
  // 跨太平洋
  [[35.05, 140.0], [45.2, -123.97]],                                  // 千倉 ↔ 美國俄勒岡
  [[34.3, 136.8], [35.12, -120.62]],                                  // 志摩 ↔ 美國加州
  [[24.86, 121.83], [35.05, 140.0]],                                  // 台灣頭城 ↔ 千倉
  [[13.76, 121.05], [12.5, 124.5], [13.5, 144.8], [21.35, -158.2], [33.86, -118.4]],
  [[22.36, 120.63], [16.0, 119.5], [13.76, 121.05]],                  // 台灣枋山 ↔ 菲律賓
  [[-33.95, 151.25], [-36.79, 174.77]],                               // 雪梨 ↔ 奧克蘭
  [[-33.95, 151.25], [-20.0, 165.0], [21.35, -158.2]],                // 雪梨 ↔ 夏威夷
  // 東亞沿岸。香港往上海、釜山往千倉的大圓都會切進陸地，靠中間點壓回海上
  [[1.32, 103.7], [10.0, 109.5], [22.3, 114.27], [24.0, 118.6], [30.9, 121.85],
   [33.5, 126.0], [35.1, 129.05], [33.5, 131.5], [32.5, 135.0], [35.05, 140.0]],
  [[22.3, 114.27], [22.36, 120.63]],                                  // 香港 ↔ 台灣枋山
  // 印度洋與紅海
  [[1.32, 103.7], [5.5, 95.0], [13.05, 80.28]],                       // 新加坡 ↔ 清奈
  [[13.05, 80.28], [7.0, 77.0], [19.08, 72.83]],                      // 清奈 ↔ 孟買（繞印度南端）
  [[19.08, 72.83], [11.6, 43.15]],                                    // 孟買 ↔ 吉布地
  [[1.32, 103.7], [-2.0, 105.0], [-6.5, 105.5], [-15.0, 112.0], [-31.95, 115.86]],
  [[11.6, 43.15], [20.0, 38.0], [29.97, 32.55], [31.2, 29.92], [35.0, 18.0], [43.3, 5.37]],
  // 大西洋
  [[39.6, -74.33], [50.83, -4.55]],                                   // 紐澤西 ↔ 英國
  [[39.6, -74.33], [48.73, -3.46]],                                   // 紐澤西 ↔ 法國
  [[25.77, -80.19], [18.0, -65.0], [-3.72, -38.54]],                  // 邁阿密 ↔ 福塔萊薩
  [[-3.72, -38.54], [38.44, -9.1]],                                   // 福塔萊薩 ↔ 葡萄牙
  [[-3.72, -38.54], [-20.0, -10.0], [-33.9, 18.42]],                  // 福塔萊薩 ↔ 開普敦
  [[-3.72, -38.54], [-23.0, -43.2], [-34.9, -56.2]],                  // 巴西東岸南下
  // 非洲環岸
  [[38.44, -9.1], [28.1, -15.4], [14.0, -19.0], [4.5, -6.0], [6.43, 3.42]],
  [[6.43, 3.42], [-6.0, 11.0], [-33.9, 18.42]],                       // 拉哥斯 ↔ 開普敦
  [[-33.9, 18.42], [-34.8, 25.0], [-29.87, 31.05], [-20.0, 36.5], [-6.8, 39.28],
   [-4.04, 39.66], [2.0, 45.5], [11.5, 51.5], [12.5, 45.0], [11.6, 43.15]],
  // 南美西岸
  [[-33.0, -71.6], [-12.0, -77.1], [9.0, -79.5]],
];

function buildTrunks() {
  const pos = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const v = new THREE.Vector3(), prev = new THREE.Vector3();
  const STEP_DEG = 2;
  for (const route of TRUNK) {
    for (let i = 0; i + 1 < route.length; i++) {
      llToVec(route[i][0], route[i][1], 1, a);
      llToVec(route[i + 1][0], route[i + 1][1], 1, b);
      const ang = a.angleTo(b);
      const sin = Math.sin(ang);
      const steps = Math.max(1, Math.ceil(ang * 180 / Math.PI / STEP_DEG));
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        // 球面線性插值。直接內插兩個向量再正規化，長弧的中段會被擠得比較密，
        // 這裡照 slerp 的權重算，弧上的點才會等距。
        if (sin < 1e-6) v.copy(a);
        else v.copy(a).multiplyScalar(Math.sin((1 - t) * ang) / sin)
              .addScaledVector(b, Math.sin(t * ang) / sin);
        v.normalize().multiplyScalar(R * 1.003);
        if (k > 0) pos.push(prev.x, prev.y, prev.z, v.x, v.y, v.z);
        prev.copy(v);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  // 這個值跟實測線那層只差 0.02，看起來像可以合併，實際上不行，兩層的密度差很多。
  // 實測線集中在北海、地中海那種疊了幾十條的地方，走廊線在太平洋往往是方圓幾千公里
  // 只有孤零零一條。同樣的 alpha 疊起來的視覺重量差一個量級，稀疏那邊要拉高才看得見。
  // 想調的話兩個數字要分開試，統一成同一個值會有一邊壞掉。
  const m = new THREE.LineBasicMaterial({ color: COL.cable, transparent: true, opacity: 0.20, depthWrite: false });
  globe.add(new THREE.LineSegments(g, m));
}

// OONI 觀測到 Tor 連線大量失敗的國家，沿著該國國界描一圈紅線。
//
// 早先的版本是在國家中心套一個固定半徑的圓環，那個做法在大國身上完全不成比例：
// 俄羅斯橫跨九千公里，半徑四百多公里的圓環既框不住也讀不出是哪一國。改描國界之後
// 範圍就是這一國真正的範圍，順帶也不必再挑圓環半徑這種每個國家都會錯的參數。
//
// 描邊不填色，是因為填色會蓋掉底下的陸地亮度（那是中繼數）。這幾國的共同點正好是
// 幾乎沒有中繼（PK、EG、MM 是 0 台，CN 1 台），框起來裡面是暗的，那個對比就是要講的事。
//
// 門檻在 gen_ooni_snapshot.py 決定，這裡不做二次篩選。中段的異常率是雜訊，
// 想放寬門檻請先讀那支程式開頭關於 anomaly 的說明。
//
// 這一層直接吃 countries.json 的國界，等於把那份資料的領土畫法照搬到畫面上。
// 現用的 Natural Earth 110m 把台灣列為獨立單位，cn 的邊界沒有一點落在台灣範圍內，
// 換底圖資料前請重新確認這件事。
function buildBlocked(world) {
  const list = (OONI && OONI.blocked) || [];
  if (!list.length || !world) return;
  const want = new Set(list);
  const pos = [];
  const v = new THREE.Vector3(), prev = new THREE.Vector3();
  // 國界的相鄰點最遠有 9 度（俄羅斯北岸），直線連過去會從地球內部穿過，
  // 中段被球體擋住就是一段一段的斷線，跟海纜那層是同一個坑。
  const MAX_STEP_DEG = 1.5;
  const HEIGHT = R * 1.014;
  const edge = (lon1, lat1, lon2, lat2) => {
    let dlon = lon2 - lon1;
    if (dlon > 180) dlon -= 360; else if (dlon < -180) dlon += 360;
    const dlat = lat2 - lat1;
    const cos = Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
    const steps = Math.max(1, Math.ceil(Math.hypot(dlat, dlon * cos) / MAX_STEP_DEG));
    let plat = lat1, plon = lon1;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const lat = lat1 + dlat * t, lon = lon1 + dlon * t;
      llToVec(plat, plon, HEIGHT, prev);
      pos.push(prev.x, prev.y, prev.z);
      llToVec(lat, lon, HEIGHT, v);
      pos.push(v.x, v.y, v.z);
      plat = lat; plon = lon;
    }
  };
  for (const c of world.c) {
    if (!c.k || !want.has(c.k)) continue;
    for (const ring of c.p) {
      if (ring.length < 6) continue;   // 少於三個點圍不成形狀
      for (let i = 0; i + 3 < ring.length; i += 2) edge(ring[i], ring[i + 1], ring[i + 2], ring[i + 3]);
      // 環要自己閉合，資料的最後一點不一定等於第一點
      edge(ring[ring.length - 2], ring[ring.length - 1], ring[0], ring[1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  const m = new THREE.LineBasicMaterial({ color: COL.blocked, transparent: true, opacity: 0.85, depthWrite: false });
  globe.add(new THREE.LineSegments(g, m));
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
  const m = new THREE.LineBasicMaterial({ color: COL.coast, transparent: true, opacity: 0.17, blending: THREE.AdditiveBlending, depthWrite: false });
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

// 散布半徑由中繼數決定，不再由國土面積決定。
// 原本在國界內隨機取樣，結果是加拿大 203 台灑滿整片國土（連北極圈都有點），瑞典 513 台
// 被細長國土拉成稀疏一條，看起來比只多 2.3 倍的荷蘭還少。點的疏密其實只是「面積 ÷ 台數」，
// 跟地理毫無關係，Onionoo 也只給到國別。改成一國一團，團的大小才對得起數量。
const CLUSTER_MIN_DEG = 0.26;  // 只有一台的國家也要看得到
const CLUSTER_K = 0.032;       // 乘上 sqrt(台數)：面積正比於數量，團內密度各國一致。
// 這組數字驗算過全部 2850 組國家對，只有荷比與德荷兩組會碰到（各超 0.5° 與 0.3°），
// 一般混色下就是邊緣暈染，看得出是兩團，不會糊成一片。
function clusterRadiusDeg(n) { return CLUSTER_MIN_DEG + CLUSTER_K * Math.sqrt(n); }

// 荷比盧德這種鄰國，團心本來就只隔 1.6 度，團會直接疊在一起。用排斥迭代把碰到的
// 輕輕推開，位移都在幾十公里等級。位置本來就只代表國別，推開不會失去任何資訊。
function relaxClusters(counts) {
  const items = [];
  for (const [cc, n] of counts) {
    const a = ANCHOR.get(cc);
    if (!a || NO_PLACE.has(cc)) continue;
    a.cl = [a.ll[0], a.ll[1]];
    items.push({ a, r: clusterRadiusDeg(n) });
  }
  const GAP = 0.42; // 團之間至少留這麼多度，光看得出是分開的兩團
  for (let iter = 0; iter < 120; iter++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const A = items[i].a.cl, B = items[j].a.cl;
        const cl = Math.max(0.15, Math.cos((A[0] + B[0]) / 2 * Math.PI / 180));
        const dy = B[0] - A[0], dx = (B[1] - A[1]) * cl;
        const d = Math.hypot(dx, dy) || 1e-6;
        const need = items[i].r + items[j].r + GAP;
        if (d >= need) continue;
        moved = true;
        const push = (need - d) * 0.25;
        const wa = items[j].r / (items[i].r + items[j].r), wb = 1 - wa; // 大團少讓，小團多讓
        A[0] -= dy / d * push * wa; A[1] -= dx / d * push * wa / cl;
        B[0] += dy / d * push * wb; B[1] += dx / d * push * wb / cl;
      }
    }
    if (!moved) break;
  }
}

// 在國土內隨機取一點。Natural Earth 沒有的小地方（新加坡、香港）退回錨點加小抖動。
// 色塊已經把「多少台」講清楚了，點在這裡負責的是質感與存在感，散在國土上比擠成一團自然。
function sampleIn(a, out) {
  if (a.rings) {
    for (let t = 0; t < 24; t++) {
      const lon = a.bb[0] + Math.random() * a.bb[2];
      const lat = a.bb[1] + Math.random() * a.bb[3];
      if (inRings(a.rings, lon, lat)) { out[0] = lat; out[1] = lon; return out; }
    }
  }
  out[0] = a.ll[0] + (Math.random() + Math.random() - 1) * (a.jlat || 1);
  out[1] = a.ll[1] + (Math.random() + Math.random() - 1) * (a.jlon || 1.4);
  return out;
}

// 群聚版留著備用：把散布半徑改成照台數算，一國一團。
function sampleCluster(a, n, out) {
  const c = a.cl || a.ll;
  const rad = clusterRadiusDeg(n);
  const ang = Math.random() * Math.PI * 2;
  const rr = Math.sqrt(Math.random()) * rad; // 開根號才會在圓內均勻分布，不會往中心擠
  const lonScale = 1 / Math.max(0.15, Math.cos(c[0] * Math.PI / 180)); // 高緯度的經度要放大補償
  out[0] = c[0] + rr * Math.sin(ang);
  out[1] = c[1] + rr * Math.cos(ang) * lonScale;
  return out;
}

// 每台中繼一個 instance。原本用 Points 分三桶，但這版 three.js 的 WebGL2 backend
// 會忽略 PointsNodeMaterial 的 size：實測把 size 從 0.045 一路開到 14 都沒有任何差別，
// 所有點一律畫成 1px，等於「大小分權重」這個編碼在 fallback 路徑上完全不存在。
// 改用 InstancedMesh 逐台縮放，尺寸就真的照 consensus weight 走，也不必再分桶。
// 螢幕直徑 ≈ s * 141（畫面高 900、fov 45、距離約 15.4 時）
const SIZE_MIN = 0.015;   // 約 2.1 px：權重最低的中繼
const SIZE_SPAN = 0.042;  // 加上去的部分，滿格約 8 px
const SIZE_REF = 80000;   // 到這個權重就吃滿，再高不再變大（前 3% 左右）
function relaySize(w) {
  const t = Math.min(1, Math.pow(Math.max(0, w) / SIZE_REF, 0.8)); // 0.8 次方讓大點集中在真正高權重的那些
  return SIZE_MIN + SIZE_SPAN * t;
}

function buildRelays(snap, counts) {
  if (!SHOW_DOTS) {
    let n = 0;
    for (const [cc] of snap.relays) if (ANCHOR.has(cc) && !NO_PLACE.has(cc)) n++;
    return n;
  }
  const groups = [[], [], [], []]; // 依角色分開，切到單一角色時只留那一組
  const ll = [0, 0];
  let total = 0;
  for (let i = 0; i < snap.relays.length; i++) {
    const [country, role, w] = snap.relays[i];
    const a = ANCHOR.get(country);
    if (!a || NO_PLACE.has(country)) continue;
    sampleIn(a, ll);
    llToVec(ll[0], ll[1], R * 1.012, tmp);
    groups[role].push({ x: tmp.x, y: tmp.y, z: tmp.z, s: relaySize(w) });
    total++;
  }
  if (!total) return 0;

  const geo = new THREE.OctahedronGeometry(1, 0); // 8 個三角形，小尺寸下配上光暈就是一顆圓點
  const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: true });
  mat.opacity = REDUCED ? 1 : 0; // 載入時從 0 淡入
  pointMats.push(mat);
  const m4 = new THREE.Matrix4();
  const c = new THREE.Color();
  for (let role = 0; role < 4; role++) {
    const list = groups[role];
    if (!list.length) continue;
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    mesh.frustumCulled = false;
    mesh.userData.role = role;
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      m4.makeScale(n.s, n.s, n.s);
      m4.setPosition(n.x, n.y, n.z);
      mesh.setMatrixAt(i, m4);
      c.set(ROLE_COL[role]).multiplyScalar(1.15);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    globe.add(mesh);
    relayMeshes.push(mesh);
  }
  return total;
}

// ---- 國家標籤：每個有中繼的國家都給一個，轉到背面淡出。
// 位置擠不下時讓中繼多的優先，放大地球後小國的標籤就會浮出來。
const labels = [];
// 這個站的讀者主要在台灣，「台灣有幾台」大概是最常被問的一題，但 TW 只有 12 台、
// 排名第 47，在重疊避讓裡優先權最低，畫面沒轉到剛好角度就看不到。給它插隊。
const LABEL_ALWAYS = ['tw'];

function buildLabels(snap) {
  const box = $('labels');
  if (!box) return;
  const list = snap.countries || snap.topCountries || [];
  list.forEach(([cc, n], rank) => {
    const a = ANCHOR.get(cc);
    if (!a || NO_PLACE.has(cc)) return;
    const el = document.createElement('div');
    el.className = rank < 10 || LABEL_ALWAYS.includes(cc) ? 'lb' : 'lb sm'; // 前段用亮字，長尾壓暗
    el.innerHTML = `${cc.toUpperCase()}<i>${n.toLocaleString()}</i>`;
    el.dataset.cc = cc;
    box.appendChild(el);
    const c = a.cl || a.ll;
    labels.push({ cc, el, v: llToVec(c[0], c[1], R * 1.03, new THREE.Vector3()), w: 44, h: 15, on: false });
  });
  // 排在前面的先卡位，白名單移到最前面才不會被大國擠掉
  labels.sort((x, y) => (LABEL_ALWAYS.includes(y.cc) ? 1 : 0) - (LABEL_ALWAYS.includes(x.cc) ? 1 : 0));
  measureLabels();
}

// 標籤尺寸要在字型載入完、以及字級隨畫面寬度改變後重量，否則邊界判斷會用到過時的寬度
function measureLabels() {
  requestAnimationFrame(() => { for (const l of labels) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; } });
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureLabels);

// 左上面板與底部提示列會蓋住標籤，壓在它們上面的國家就不標
let uiBoxes = [];
function refreshUIBoxes() {
  uiBoxes = [];
  for (const id of ['top', 'hint']) {
    const el = $(id);
    if (!el) continue;
    const r = el.getBoundingClientRect(); // 面板是 fixed，offsetParent 一律為 null，改看實際尺寸判斷有沒有顯示
    if (r.width && r.height) uiBoxes.push({ x0: r.left - 4, y0: r.top - 4, x1: r.right + 4, y1: r.bottom + 4 });
  }
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
      // 貼著畫面邊緣的標籤會被切一半，讀不出來就不如不標
      if (x - l.w / 2 < 4 || x + l.w / 2 > innerWidth - 4 || y - l.h / 2 < 4 || y + l.h / 2 > innerHeight - 4) show = false;
      for (const b of show ? uiBoxes : []) {
        if (x + l.w / 2 > b.x0 && x - l.w / 2 < b.x1 && y + l.h / 2 > b.y0 && y - l.h / 2 < b.y1) { show = false; break; }
      }
      for (const q of show ? placed : []) {
        if (Math.abs(x - q.x) < (l.w + q.w) / 2 + 7 && Math.abs(y - q.y) < (l.h + q.h) / 2 + 3) { show = false; break; }
      }
      if (show) {
        placed.push({ x, y, w: l.w, h: l.h });
        l.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
      }
    }
    if (show !== l.on) { l.on = show; l.el.style.opacity = show ? 1 : 0; l.el.classList.toggle('on', show); }
  }
}

// 各國角色組成。球面上四色點混在一起看不出「這個國家偏 guard 還是偏 exit」，
// 並排的長條才比得動。exit 段固定放最左邊，橫向掃一眼就能比長度。
const MIX_MIN = 30; // 台數太少的國家，一台 exit 就是 100%，比例沒有意義
function roleBreakdown(snap) {
  const m = new Map();
  for (const [cc, role] of snap.relays) {
    if (NO_PLACE.has(cc)) continue;
    if (!m.has(cc)) m.set(cc, [0, 0, 0, 0]);
    m.get(cc)[role]++;
  }
  return m;
}

function fillMix(snap) {
  const box = $('stat-mix');
  if (!box) return;
  const rows = [...roleBreakdown(snap).entries()]
    .map(([cc, r]) => ({ cc, r, t: r[0] + r[1] + r[2] + r[3] }))
    .filter((x) => x.t >= MIX_MIN);
  if (!rows.length) return;
  const hex = (v) => '#' + v.toString(16).padStart(6, '0');
  const exitPct = (x) => Math.round((x.r[2] + x.r[3]) / x.t * 100); // exit 與 guard+exit 都會跑出口流量
  box.innerHTML = [...rows].sort((a, b) => b.t - a.t).slice(0, 10).map(({ cc, r, t }) => {
    const seg = (i) => (r[i] ? `<span style="width:${(r[i] / t * 100).toFixed(1)}%;background:${hex(ROLE_COL[i])}"></span>` : '');
    return `<div class="mix-row"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${t.toLocaleString()}</span>`
      + `<span class="mix-bar">${[2, 3, 1, 0].map(seg).join('')}</span>`
      + `<span class="n">出口 ${exitPct({ r, t })}%</span></div>`;
  }).join('');
  const byExit = [...rows].sort((a, b) => exitPct(b) - exitPct(a));
  const fmt = (x) => `${x.cc.toUpperCase()} ${exitPct(x)}%`;
  const note = $('mix-note');
  if (note) {
    note.textContent = `出口流量比例最高：${byExit.slice(0, 3).map(fmt).join('、')}。`
      + `最低：${byExit.slice(-3).reverse().map(fmt).join('、')}。`
      + `出口要承受濫用投訴與法律風險，各國願不願意跑差很多。`;
  }
}

// ---- 點國家看細節 ----
// 球面上讀得到的只有國碼與台數，排名、權重佔比、角色組成這些都得點一下才給。
let CC_STATS = null;
let SNAP_ASN = null, SNAP_VER = null, SNAP_ASN_TOP = null;
// OONI 的觀測。這份資料的授權跟 Onionoo 那份不同（CC BY-NC-SA 4.0），所以分開存也分開讀，
// 畫面上的 credit 要各自標註。細節看 tools/gen_ooni_snapshot.py。
let OONI = null;
// Tor Metrics 的使用者面（CC0）與 Access Now 的斷網事件（CC BY 4.0）。
// 三份外部資料三種授權，所以三個檔案分開讀，credit 也各自標。
let TORUSERS = null, SHUTDOWNS = null;
let USERS_MAP = null; // ISO2 → 使用者數，給 users 模式的色階用，載入時建一次
function buildStats(snap) {
  SNAP_ASN = snap.asn || null;
  SNAP_VER = snap.version || null;
  SNAP_ASN_TOP = snap.asnTop || null;
  const mix = roleBreakdown(snap);
  const w = new Map();
  for (const [cc, , wt] of snap.relays) {
    if (NO_PLACE.has(cc)) continue;
    w.set(cc, (w.get(cc) || 0) + wt);
  }
  const totalN = [...mix.values()].reduce((a, r) => a + r[0] + r[1] + r[2] + r[3], 0);
  const totalW = [...w.values()].reduce((a, x) => a + x, 0);
  const byN = [...mix.entries()].map(([cc, r]) => [cc, r[0] + r[1] + r[2] + r[3]]).sort((a, b) => b[1] - a[1]);
  const byW = [...w.entries()].sort((a, b) => b[1] - a[1]);
  const rankN = new Map(byN.map(([cc], i) => [cc, i + 1]));
  const rankW = new Map(byW.map(([cc], i) => [cc, i + 1]));
  // 全網整體的出口比例：總出口台數 ÷ 總台數。不是各國比例的平均（那是 19%，
  // 因為小國拉低了），拿來跟單一國家對照時要講清楚是哪一種。
  // 各國最大托管商的佔比。這是比例不是台數，所以另外算一份。
  const conc = new Map(), asn = SNAP_ASN || {};
  const cntByCC = new Map(byN);
  for (const cc in asn) {
    const t = cntByCC.get(cc) || 0;
    const topN = (asn[cc].t && asn[cc].t[0] && asn[cc].t[0][2]) || 0;
    if (t >= CONC_MIN && topN) conc.set(cc, topN / t * 100);
  }
  let exitAll = 0;
  for (const r of mix.values()) exitAll += r[2] + r[3];
  CC_STATS = { mix, w, totalN, totalW, rankN, rankW, conc, cnt: cntByCC, exitShare: exitAll / totalN };
}

function showCountry(cc) {
  const card = $('cc-card');
  if (!card || !CC_STATS) return;
  const r = CC_STATS.mix.get(cc);
  if (!r) return;
  const t = r[0] + r[1] + r[2] + r[3];
  const wShare = (CC_STATS.w.get(cc) || 0) / CC_STATS.totalW * 100;
  const exitPct = (r[2] + r[3]) / t * 100;
  $('cc-code').textContent = cc.toUpperCase();
  $('cc-sub').textContent = `${t.toLocaleString()} 台，台數排名第 ${CC_STATS.rankN.get(cc)}`;
  $('cc-bar').innerHTML = [2, 3, 1, 0]
    .map((i) => (r[i] ? `<span style="width:${(r[i] / t * 100).toFixed(1)}%;background:${roleHex(i)}"></span>` : ''))
    .join('');
  const pct = (x) => (x < 1 ? x.toFixed(2) : x.toFixed(1));
  $('cc-body').innerHTML =
    `佔全網台數 <b>${pct(t / CC_STATS.totalN * 100)}%</b>，佔共識權重 <b>${pct(wShare)}%</b>（排名第 ${CC_STATS.rankW.get(cc)}）<br>`
    + `出口流量 <b>${Math.round(exitPct)}%</b>，全網整體 ${Math.round(CC_STATS.exitShare * 100)}%`
    + `<div class="cc-roles">`
    + [1, 3, 2, 0].map((k) => `<span class="chip" style="--c:${roleHex(k)}">${ROLE_NAME[k]} ${r[k].toLocaleString()}</span>`).join('')
    + `</div>`
    + usersLine(cc, t)
    + hostingLine(cc, t)
    + versionLine(cc)
    + ooniLine(cc)
    + bridgeLine(cc)
    + shutdownLine(cc)
    + radarLine(cc);
  card.hidden = false;
  stopSpin();
}

// 托管商：這一國的中繼實際上放在誰的機房。國界分散不等於機房分散。
function hostingLine(cc, total) {
  const a = SNAP_ASN && SNAP_ASN[cc];
  if (!a || !a.t || !a.t.length) return '';
  const [, name, n] = a.t[0];
  const pct = Math.round(n / total * 100);
  const rest = a.t.slice(1).map(([id, nm, k]) => `${nm || id} ${k}`).join('、');
  return `<div class="cc-sub2">托管商：<b>${name || a.t[0][0]}</b> ${n} 台（${pct}%），這一國共 ${a.n} 家`
    + (rest ? `<br><span class="dim">其次 ${rest}</span>` : '') + `</div>`;
}

function versionLine(cc) {
  const v = SNAP_VER && SNAP_VER[cc];
  if (!v || !v[0]) return '';
  return `<div class="cc-sub2 dim">跑官方建議版本 ${v[1]}/${v[0]}（${Math.round(v[1] / v[0] * 100)}%）</div>`;
}
// OONI 對這一國的觀測。措辭刻意停在「沒有照預期完成」，不寫成封鎖率。
// anomaly 的成因包含審查、網路不穩與 ISP 故障，單看比率沒辦法分辨是哪一種，
// 只有高到極端才敢指名（那幾國在 blocked 清單裡，另外給一句話）。
function ooniLine(cc) {
  if (!OONI || !OONI.cc) return '';
  const o = OONI.cc[cc];
  if (!o || !o[0]) return '';
  const [m, a] = o;
  const pct = a / m * 100;
  const blocked = (OONI.blocked || []).includes(cc);
  const val = pct < 10 ? pct.toFixed(1) : Math.round(pct);
  return `<div class="cc-sub2${blocked ? ' warn' : ' dim'}">OONI 觀測：近 ${OONI.days} 天 `
    + `${m.toLocaleString()} 次 Tor 連線測試，<b>${val}%</b> 沒有照預期完成`
    + (blocked ? `<br><span class="dim">高到這個程度通常表示連線被擋，OONI 的異常也可能來自網路不穩。</span>` : '')
    + `</div>`;
}

// 這一國有多少人在用。中繼數是供給端，這是需求端，兩個數字擺在一起才看得出落差。
// 措辭要留住「估計」兩個字，Tor Metrics 是用中繼收到的目錄請求反推的，信心區間很寬
// （台灣 10,585 人的區間是 3,722 到 21,578），寫成確定數字是騙人的。
function usersLine(cc, relays) {
  if (!TORUSERS || !TORUSERS.users) return '';
  const u = TORUSERS.users[cc];
  if (!u) return '';
  const [cur, avg] = u;
  // 每台中繼「服務」多少使用者。這不是真的負載，只是兩個數字的比值，用來凸顯落差。
  const per = relays ? Math.round(cur / relays) : 0;
  return `<div class="cc-sub2">估計 <b>${cur.toLocaleString()}</b> 人在用（${TORUSERS.days} 天平均 ${avg.toLocaleString()}）`
    + (per ? `<br><span class="dim">這一國每有 1 台中繼，就有約 ${per.toLocaleString()} 人在用</span>` : '')
    + `</div>`;
}

// 這一國的人用什麼方式繞過封鎖。跟 ooni.json 那層是一組的：OONI 說連不上，這裡說改用什麼。
const PT_NAME = { '<OR>': '一般橋接', obfs4: 'obfs4', obfs3: 'obfs3', snowflake: 'snowflake', webtunnel: 'webtunnel', meek: 'meek', conjure: 'conjure' };
function bridgeLine(cc) {
  if (!TORUSERS || !TORUSERS.bridge) return '';
  const b = TORUSERS.bridge[cc];
  if (!b || !b.length) return '';
  const list = b.map(([t, n]) => `<span class="chip2">${PT_NAME[t] || t} ${n.toLocaleString()}</span>`).join('');
  return `<div class="cc-sub2">透過橋接繞道<div class="cc-roles">${list}</div></div>`;
}

// 這一國被整個關掉過幾次，以及理由。
// Conflict 與 Communal violence 未必是政府主動決策（可能是戰事打壞基礎設施），
// 資料裡分開算過，這裡只把「資訊管制類」的件數單獨講出來，不把全部件數講成政府封鎖。
const CAUSE_ZH = {
  'Conflict': '武裝衝突', 'Protests': '抗議活動', 'Information control': '資訊管制',
  'Communal violence': '族群衝突', 'Exam cheating': '防止考試作弊',
  'Visits by government officials': '官員視察', 'Elections': '選舉',
  'Other': '其他', 'Unknown': '不明',
};
function shutdownLine(cc) {
  if (!SHUTDOWNS || !SHUTDOWNS.cc) return '';
  const s = SHUTDOWNS.cc[cc];
  if (!s) return '';
  const [n, ctl, year, causes] = s;
  const top = Object.entries(causes || {}).slice(0, 3)
    .map(([k, v]) => `${CAUSE_ZH[k] || k} ${v}`).join('、');
  const [y0] = SHUTDOWNS.years || [];
  return `<div class="cc-sub2 warn">${y0 ? y0 + ' 年以來' : ''}有 <b>${n}</b> 次網路關閉紀錄`
    + (year ? `，最近一次在 ${year} 年` : '')
    + (top ? `<br><span class="dim">主要成因：${top}</span>` : '')
    + (ctl ? `<br><span class="dim">其中 ${ctl} 次屬於資訊管制、抗議或選舉期間的管控</span>` : '')
    + `</div>`;
}

// 往外連到 Cloudflare Radar。只給連結，不取它的資料：Radar 的 API 要 Cloudflare 帳號的
// token，靜態站得把金鑰帶進產快照的流程，而連結不構成任何重製，也就沒有授權要處理。
//
// URL 格式是 radar.cloudflare.com/{國碼} 與 /as{編號}。開發環境的 DNS 擋掉了這個網域，
// 沒辦法在這裡自動驗證，格式集中在這兩個函式，真的變了就改這裡。
//
// 這是講隱私的站，點出去等於告訴 Cloudflare 有人在看哪一國、哪一家業者，所以連結
// 一律帶 noreferrer，也不自動預先載入。
const RADAR = 'https://radar.cloudflare.com/';
const extLink = (href, text, title) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer external"${title ? ` title="${title}"` : ''}>${text} ↗</a>`;

function radarLine(cc) {
  const asn = SNAP_ASN && SNAP_ASN[cc];
  const top = asn && asn.t && asn.t[0];
  // Onionoo 給的是 AS12345，Radar 的網址要小寫的 as12345
  const asLink = top && /^AS\d+$/i.test(top[0])
    ? extLink(RADAR + top[0].toLowerCase(), top[1] || top[0], '在 Cloudflare Radar 看這家業者的網路狀況')
    : '';
  return `<div class="cc-sub2 dim ext">延伸查詢：`
    + extLink(RADAR + cc, `${cc.toUpperCase()} 的網路狀況`, '在 Cloudflare Radar 看這一國的流量與中斷紀錄')
    + (asLink ? `、${asLink}` : '')
    + `<br><span class="tiny">連往 Cloudflare Radar，離開本站。</span></div>`;
}

function hideCountry() { const c = $('cc-card'); if (c) c.hidden = true; }

// 地圖模式：看全部，或單看某一種角色。陸地深淺就是該國在這個模式下的數量。
// 角色分布那四個 chip 直接當按鈕用，點下去地球就換成那個角色的色調。
function modeRamp(mode) { return MODES[(mode === 'all-weight' || mode === 'all-count') ? 'all' : mode]; }

function modeValues(mode) {
  if (mode === 'all-weight') return CC_STATS.w;
  if (mode === 'conc') return CC_STATS.conc;
  if (mode === 'users') return USERS_MAP || new Map();
  const role = MODE_ROLE[mode];
  const m = new Map();
  for (const [cc, r] of CC_STATS.mix) {
    const v = role === undefined ? r[0] + r[1] + r[2] + r[3] : r[role];
    if (v) m.set(cc, v);
  }
  return m;
}

function setMode(mode) {
  if (!CC_STATS || !GLOW || !MODES[mode === 'all-weight' || mode === 'all-count' ? 'all' : mode]) return;
  MODE = mode;
  const values = modeValues(mode);
  paintGlow(values, GLOW.canvas, modeRamp(mode));
  GLOW.tex.needsUpdate = true;
  for (const l of labels) {
    const v = values.get(l.cc) || 0;
    const pct = v / CC_STATS.totalW * 100;
    const txt = mode === 'all-weight'
      ? (pct < 0.05 ? '<0.1%' : pct.toFixed(1) + '%')
      : mode === 'conc' ? Math.round(v) + '%'
      : v.toLocaleString();
    l.el.innerHTML = `${l.cc.toUpperCase()}<i>${txt}</i>`;
    l.el.dataset.off = v ? '' : '1'; // 這個模式下沒有的國家就不標
  }
  measureLabels();
  const role = MODE_ROLE[mode];
  for (const m of relayMeshes) m.visible = role === undefined || m.userData.role === role;
  const r = modeRamp(mode);
  const ramp = document.querySelector('#ramp i');
  if (ramp) ramp.style.background = `linear-gradient(90deg, ${MAP.land} 0 14%, ${r.lo} 14%, ${r.hi})`;
  for (const el of document.querySelectorAll('[data-mode]')) {
    const on = el.dataset.mode === mode;
    el.classList.toggle('on', on);
    if (MODE_ROLE[el.dataset.mode] !== undefined) el.title = on ? '再點一次看全部' : '只看這個角色';
  }
}

// 托管商排行與亞洲對照。國界分散不代表機房分散，這兩塊把另一半講出來。
const ASIA = ['sg', 'jp', 'hk', 'kr', 'tw'];

function fillAsn(snap) {
  const box = $('stat-asn');
  if (!box || !snap.asnTop || !snap.asnTop.length) return;
  const tot = snap.sampled || snap.total || 1;
  const max = snap.asnTop[0][2] || 1;
  box.innerHTML = snap.asnTop.slice(0, 8).map(([id, nm, n]) =>
    `<div class="mix-row"><span class="as-nm" title="${id}">${nm || id}</span>`
    + `<span class="tot">${n.toLocaleString()}</span>`
    + `<span class="mix-bar"><span style="width:${(n / max * 100).toFixed(1)}%;background:#c47ad8"></span></span>`
    + `<span class="n">${(n / tot * 100).toFixed(1)}%</span></div>`).join('');
  const note = $('asn-note');
  const v = snap.versionAll;
  if (note) {
    const top3 = snap.asnTop.slice(0, 3).reduce((a, x) => a + x[2], 0);
    note.innerHTML = `這些是賣主機與雲端的公司，全球共 ${(snap.asnCount || '數百')} 家托管了這些中繼，`
      + `前三家就佔 ${(top3 / tot * 100).toFixed(1)}%。國界分散不代表機房分散，同一家的一個政策就能影響很大一塊。`
      + (v && v[0] ? `<br>另外，全網有 ${Math.round(v[1] / v[0] * 100)}% 的中繼跑在官方建議的版本上。` : '');
  }
}

function fillAsia(snap) {
  const box = $('stat-asia');
  if (!box) return;
  const cnt = new Map(snap.countries || []);
  const rows = ASIA.filter((cc) => cnt.has(cc)).sort((a, b) => cnt.get(b) - cnt.get(a));
  if (!rows.length) return;
  const max = cnt.get(rows[0]) || 1;
  box.innerHTML = rows.map((cc) => {
    const n = cnt.get(cc);
    const a = snap.asn && snap.asn[cc];
    const conc = a && a.t && a.t[0] ? Math.round(a.t[0][2] / n * 100) : null;
    const hi = cc === 'tw' ? ' hi' : '';
    return `<div class="mix-row${hi}"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${n.toLocaleString()}</span>`
      + `<span class="mix-bar"><span style="width:${(n / max * 100).toFixed(1)}%;background:#4fd58f"></span></span>`
      + `<span class="n">${a ? a.n + ' 家' : ''}${conc !== null ? `/最大 ${conc}%` : ''}</span></div>`;
  }).join('');
}

// OONI 觀測到 Tor 連線大量失敗的國家，一併把該國的中繼數擺出來。
// 這一塊的重點是兩個獨立來源撞在一起的那個結果：連不上 Tor 的地方，也幾乎沒有人在那裡跑中繼。
// 條的長度用異常率，數字給中繼數，讓「條很長、數字是 0」自己說話。
function fillOoni(snap) {
  const box = $('stat-ooni');
  if (!box || !OONI || !OONI.blocked || !OONI.blocked.length) return;
  const cnt = new Map(snap.countries || []);
  box.innerHTML = OONI.blocked.map((cc) => {
    const o = OONI.cc[cc];
    const pct = o[1] / o[0] * 100;
    const n = cnt.get(cc) || 0;
    return `<div class="mix-row"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${Math.round(pct)}%</span>`
      + `<span class="mix-bar"><span style="width:${pct.toFixed(1)}%;background:${'#' + COL.blocked.toString(16)}"></span></span>`
      + `<span class="n">中繼 ${n.toLocaleString()}</span></div>`;
  }).join('');
  const note = $('ooni-note');
  if (!note) return;
  const all = OONI.all || [0, 0];
  // 措辭要停在「沒有照預期完成」。這個比率沒辦法區分審查、網路不穩與 ISP 故障，
  // 寫成封鎖率就是拿雜訊指控特定國家。
  // 門檻寫死在文案裡，改了 gen_ooni_snapshot.py 的 BLOCK_PCT 就會對不上，所以讀資料裡的值
  note.innerHTML = `這幾國近 ${OONI.days} 天的 Tor 連線測試有 ${OONI.blockPct}% 以上沒有照預期完成，`
    + `同一期間全球平均是 ${(all[1] / all[0] * 100).toFixed(0)}%。`
    + `異常的成因包含連線被擋、網路不穩與 ISP 故障，單看比率分不出是哪一種，`
    + `所以這裡只列高到極端的那幾國，中段的數字沒有拿來上色。`
    + `對照左邊的中繼數會看到，連不上 Tor 的地方，也幾乎沒有人在那裡跑中繼。`;
}

// 使用者最多的國家，對照該國的中繼數。跟 fillOoni 那塊相反：那邊講「連不上的地方」，
// 這邊講「用的人最多的地方」，兩塊合起來才是完整的需求面。
function fillUsers(snap) {
  const box = $('stat-users');
  if (!box || !TORUSERS || !TORUSERS.users) return;
  const cnt = new Map(snap.countries || []);
  const rows = Object.entries(TORUSERS.users).sort((a, b) => b[1][0] - a[1][0]).slice(0, 8);
  if (!rows.length) return;
  const max = rows[0][1][0];
  box.innerHTML = rows.map(([cc, [cur]]) => {
    const hi = cc === 'tw' ? ' hi' : '';
    return `<div class="mix-row${hi}"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${cur.toLocaleString()}</span>`
      + `<span class="mix-bar"><span style="width:${(cur / max * 100).toFixed(1)}%;background:${MODES.users.hi}"></span></span>`
      + `<span class="n">中繼 ${(cnt.get(cc) || 0).toLocaleString()}</span></div>`;
  }).join('');
  const note = $('users-note');
  if (!note) return;
  const tw = TORUSERS.users.tw;
  note.innerHTML = `全球估計每天約 ${Math.round(TORUSERS.usersAll / 10000) / 100} 萬人在用，資料是 ${TORUSERS.date}。`
    + (tw ? `台灣估計 ${tw[0].toLocaleString()} 人，中繼 ${(cnt.get('tw') || 0)} 台。` : '')
    + `用的人在哪跟中繼架在哪是兩件事，中繼多的國家多半是機房便宜、法規友善，`
    + `跟那裡有多少人需要 Tor 沒有直接關係。`
    + `這些是用中繼收到的目錄請求反推的估計值，信心區間相當寬，看趨勢比看絕對數字可靠。`;
}

// 被整個關掉過的地方。這份資料的成因是人工查證後標註的，比測量類的異常率乾淨，
// 所以敢直接講「發生過什麼」。但件數多寡也反映了有沒有人在盯，沒人盯的地方不代表沒發生。
function fillShutdowns() {
  const box = $('stat-shutdown');
  if (!box || !SHUTDOWNS || !SHUTDOWNS.cc) return;
  const rows = Object.entries(SHUTDOWNS.cc).sort((a, b) => b[1][0] - a[1][0]).slice(0, 7);
  if (!rows.length) return;
  const max = rows[0][1][0];
  box.innerHTML = rows.map(([cc, [n, , year]]) => {
    return `<div class="mix-row"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${n} 次</span>`
      + `<span class="mix-bar"><span style="width:${(n / max * 100).toFixed(1)}%;background:#e0663a"></span></span>`
      + `<span class="n">最近 ${year || '—'}</span></div>`;
  }).join('');
  const note = $('shutdown-note');
  if (!note) return;
  const [y0, y1] = SHUTDOWNS.years || [];
  const c = SHUTDOWNS.causesAll || {};
  const pick = (k) => c[k] || 0;
  note.innerHTML = `${y0} 到 ${y1} 年間全球 ${SHUTDOWNS.total} 筆紀錄，由 Access Now 的 #KeepItOn 聯盟人工查證。`
    + `成因以武裝衝突 ${pick('Conflict')} 次最多，其次是抗議活動 ${pick('Protests')} 次與資訊管制 ${pick('Information control')} 次。`
    + `也有為了防止考試作弊 ${pick('Exam cheating')} 次與官員視察期間 ${pick('Visits by government officials')} 次而關閉的紀錄。`
    + `武裝衝突與族群衝突未必是政府主動下令，戰事打壞基礎設施也算在內，`
    + `所以國家卡片另外標出屬於資訊管制類的件數。`
    + `另外印度的紀錄多半是單一邦或單一地區的斷網，跟上面那些全國性受阻的情況性質不同。`;
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
  const modeOf = { 0: 'middle', 1: 'guard', 2: 'exit', 3: 'both' };
  $('stat-role').innerHTML = [1, 3, 2, 0].map((k) =>
    `<span class="chip act" role="button" tabindex="0" data-mode="${modeOf[k]}" style="--c:${roleHex(k)}">${ROLE_NAME[k]} ${(br[k] || 0).toLocaleString()}</span>`
  ).join('');
  // 地球上畫出來的台數少於總數時要講清楚，別讓人以為每一台都在畫面上
  const miss = snap.total - drawn;
  if (drawn && miss > 0) {
    $('gap').textContent = miss <= (snap.noPlace || 0) + 5
      ? `另有 ${miss} 台的國別是 eu 或未知，地球上沒有位置可放，略過不畫。`
      : `地球上畫出 ${drawn.toLocaleString()} 台，其餘 ${miss.toLocaleString()} 台缺明確國別或取回時未取得。`;
  }
}

// ---- 控制：拖曳旋轉、滾輪縮放、閒置自轉 ----
const pointers = new Map();
const spin = { rx: 0, ry: 0 }; // 放開拖曳後的滑行速度
let last = null, pinchStart = 0, zoomStart = 1;
function bindControls(dom) {
  dom.addEventListener('pointerdown', (e) => {
    dom.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stopSpin(); spin.rx = spin.ry = 0; last = { x: e.clientX, y: e.clientY };
    if (pointers.size === 2) { const p = [...pointers.values()]; pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); zoomStart = view.zoom; }
  });
  dom.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchStart > 0) view.zoom = clamp(zoomStart * pinchStart / d, ZOOM_MIN, ZOOM_MAX);
      return;
    }
    if (!last) return;
    const dry = (e.clientX - last.x) * 0.006, drx = (e.clientY - last.y) * 0.006;
    view.ry += dry;
    view.rx = clamp(view.rx + drx, -1.2, 1.2);
    spin.ry = dry; spin.rx = drx; // 記住最後一下的角速度，放開後滑行一段
    last = { x: e.clientX, y: e.clientY };
  });
  const up = (e) => { pointers.delete(e.pointerId); if (pointers.size === 0) { last = null; pauseSpin(); } if (pointers.size < 2) pinchStart = 0; };
  dom.addEventListener('pointerup', up); dom.addEventListener('pointercancel', up);
  dom.addEventListener('wheel', (e) => {
    e.preventDefault();
    // 依 deltaY 的量值縮放。只看正負號的話，觸控板的連續小事件每次都吃滿一格，會暴衝
    const unit = e.deltaMode === 1 ? 16 : 100; // DOM_DELTA_LINE 換算成大約的像素量
    const step = Math.sign(e.deltaY) * Math.min(1, Math.abs(e.deltaY) / unit) * 0.08;
    view.zoom = clamp(view.zoom * (1 + step), ZOOM_MIN, ZOOM_MAX);
    pauseSpin(); // 滾輪也要打斷自轉，否則對準的國家會一直跑掉
  }, { passive: false });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

let spinTimer = 0;
function stopSpin() { view.spin = false; clearTimeout(spinTimer); }
function pauseSpin() { stopSpin(); spinTimer = setTimeout(() => { if (pointers.size === 0) view.spin = true; }, 3500); }

let prevNow = performance.now();
async function animate() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - prevNow) / 1000); prevNow = now;
  if (view.spin && !REDUCED) view.ry += dt * 0.06;
  else if (!REDUCED && pointers.size === 0 && (Math.abs(spin.ry) > 2e-4 || Math.abs(spin.rx) > 2e-4)) {
    view.ry += spin.ry;
    view.rx = clamp(view.rx + spin.rx, -1.2, 1.2);
    spin.ry *= 0.92; spin.rx *= 0.92; // 放開後滑行一小段再停
  }
  globe.rotation.y = view.ry;
  globe.rotation.x = view.rx;
  camera.position.z += (targetDist() - camera.position.z) * 0.12;
  camera.lookAt(0, 0, 0);
  if (pointsIn < 1) pointsIn = Math.min(1, pointsIn + dt / 1.2); // 點層淡入
  // 遠看時歐洲十幾個國家團擠在很小的螢幕範圍內，怎麼排都糊。讓點隨距離退成底噪，
  // 陸地色階與國家標籤接手講「集中在哪」，放大之後再把個別中繼交出來。
  // 只動透明度。instance 的位置烘在矩陣裡，改 mesh.scale 會把位置一起縮，點會縮進地球中心不見。
  const lod = clamp((ZOOM_MAX - view.zoom) / (ZOOM_MAX - 0.7), 0, 1);
  const wantOp = pointsIn * (0.5 + 0.5 * lod);
  for (const m of pointMats) m.opacity = wantOp;
  updateLabels();
  try {
    await post.renderAsync();
  } catch (e) {
    console.error(e); fatal('顯示已中斷，重新整理頁面可以再試一次。'); renderer.setAnimationLoop(null);
  }
}

async function main() {
  const ok = await initRenderer();
  if (!ok) return;
  const [snap, world, coast, cables, ooni, torusers, shutdowns] = await Promise.all([
    getJSON('./snapshot.json', { cache: 'no-cache' }), // 快照由人工重新產生，每次載入都向 server 驗證新鮮度
    getJSON('./countries.json'),
    getJSON('./continents.json').catch(() => null), // 海岸線可選，抓不到就略過
    getJSON('./cables.json').catch(() => null),     // 海底電纜可選
    getJSON('./ooni.json').catch(() => null),       // OONI 觀測可選
    getJSON('./torusers.json').catch(() => null),   // 使用者面可選
    getJSON('./shutdowns.json').catch(() => null),  // 斷網事件可選
  ]);
  OONI = ooni;
  TORUSERS = torusers;
  SHUTDOWNS = shutdowns;
  if (TORUSERS && TORUSERS.users) {
    USERS_MAP = new Map(Object.entries(TORUSERS.users).map(([cc, v]) => [cc, v[0]]));
    const b = $('btn-users');
    if (b) b.hidden = false; // 沒抓到資料就不要露出一個按了會空白的按鈕
  }
  const counts = countryCounts(snap);
  buildEarth(world, counts);
  if (cables) buildCables(cables); // 先畫電纜，海岸線疊在上面
  buildTrunks();                   // 走廊示意線，補 OSM 在大洋中段的空白
  if (coast) buildCoastline(coast);
  if (SHOW_DOTS) relaxClusters(counts); // 不畫點就不用推開團，標籤留在國家中心比較準
  const drawn = buildRelays(snap, counts);
  buildLabels(snap);
  fillPanel(snap, drawn);
  fillMix(snap);
  fillAsn(snap);
  fillAsia(snap);
  buildBlocked(world);
  fillUsers(snap);
  fillOoni(snap);
  fillShutdowns();
  buildStats(snap);
  post = new THREE.PostProcessing(renderer);
  const sp = pass(scene, camera);
  const c = sp.getTextureNode('output');
  post.outputNode = c.add(bloom(c, 0.5, 0.5, 0.72)); // threshold 拉高，密集區才不會一路暈成白斑
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    refreshUIBoxes(); // 距離由 targetDist() 依新的畫面比例自動貼合，這裡不用另外算
    measureLabels();
  });
  bindControls(renderer.domElement);
  $('labels').addEventListener('click', (e) => {
    const el = e.target.closest('.lb');
    if (el && el.dataset.cc) showCountry(el.dataset.cc);
  });
  $('labels').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('.lb');
    if (el && el.dataset.cc) { e.preventDefault(); showCountry(el.dataset.cc); }
  });
  for (const el of document.querySelectorAll('[data-mode]')) {
    const isRole = MODE_ROLE[el.dataset.mode] !== undefined;
    // 角色 chip 再點一次就取消，回到看全部。沒有這個的話進得去出不來。
    const go = () => setMode(isRole && el.dataset.mode === MODE ? 'all-count' : el.dataset.mode);
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  }
  $('cc-close') && $('cc-close').addEventListener('click', hideCountry);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') hideCountry(); });
  renderer.domElement.addEventListener('pointerdown', hideCountry); // 轉動地球就把卡片收掉
  refreshUIBoxes();
  $('info') && $('info').addEventListener('toggle', refreshUIBoxes);
  $('hint-close') && $('hint-close').addEventListener('click', () => { $('hint').classList.add('hidden'); refreshUIBoxes(); });
  const load = $('loading');
  if (load) load.classList.add('done');
  renderer.setAnimationLoop(animate);
}
main().catch((e) => { const l = $('loading'); if (l) l.classList.add('done'); console.error(e); fatal('地球儀載入失敗，資料可能沒抓到。重新整理頁面可以再試一次。'); });
