// Tor 網路現況地球儀
// 讀取由 Onionoo 蒸餾出的靜態 snapshot.json，把全網 running 中繼依國別聚成一團一團畫在地球上。
// 顏色分 middle/guard/exit/both，大小依 consensus weight 連續縮放。three.js WebGPURenderer + TSL bloom。
// 底圖用 countries.json（Natural Earth 110m）即時畫成貼圖：填海陸、描國界、依中繼數把國家調亮。
import * as THREE from 'three';
import { pass, texture, vec3, dot, oneMinus, saturate, normalWorld, positionWorld, cameraPosition,
         float, mix, hash, uniform, instanceIndex,
         uv, smoothstep, mx_fractal_noise_float, attribute, fract } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { pickLang, t, langLinksHTML } from './i18n.js';

const $ = (id) => document.getElementById(id);
const LANG = pickLang();
const S = (k, v) => t(LANG, k, v);
// html 的 lang 要跟著換，螢幕閱讀器與瀏覽器的自動翻譯都靠它判斷這頁是什麼語言
document.documentElement.lang = LANG === 'zh-TW' ? 'zh-Hant' : (LANG === 'zh-cn' ? 'zh-Hans' : 'en');

// 把收合鍵的寬度釘住。
//
// 它在展開與收合兩種狀態下的文字不一樣（收合／詳情、Hide／Details），寬度會跟著變，
// 英文實測 35.4 與 49.3，切換狀態時整排會跳一下。取兩者較寬的當 min-width 就不動了。
//
// 收合鍵是 .title-row::after 的偽元素，JS 量不到也設不了它的寬度，所以量一個離屏探針再把
// 結果寫進 CSS 變數。字重用 800，跟偽元素一致。
//
// 即時更新鍵不吃這個值，讓它依自己的內容撐開就好。
function sizeToggle() {
  const title = document.querySelector('.title-row');
  if (!title) return;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:11px;font-weight:800;';
  title.appendChild(probe);
  let w = 0;
  for (const k of ['toggleOpen', 'toggleClosed']) {
    probe.textContent = S(k);
    w = Math.max(w, probe.getBoundingClientRect().width);
  }
  probe.remove();
  // 左右內距 9px 加各 1px 框線，box-sizing 是 border-box 所以要含進去
  document.documentElement.style.setProperty('--toggle-w', `${Math.ceil(w) + 20}px`);
}

// 把畫面上的靜態文字換成目前語言。HTML 裡留繁中當 fallback，載入前不會空白。
function applyI18n() {
  const lb = $('langs');
  if (lb) lb.innerHTML = langLinksHTML(LANG);
  // 返回列整段換掉，因為連結網址本身各語系不同，指向的是各自語系的文件。
  const bl = $('backlink');
  if (bl) bl.innerHTML = S('backlink');
  document.title = S('pageTitle') + ' · anoni.net';
  const set = (id, key, html) => {
    const el = $(id);
    if (!el) return;
    if (html) el.innerHTML = S(key); else el.textContent = S(key);
  };
  // 換的是標題那一段文字，不是整個 summary。summary 裡還有即時更新的按鈕，
  // 對 #title 下 textContent 會把按鈕一起洗掉。
  set('title-text', 'pageTitle');
  set('unit-relays', 'unitRelays');
  set('snapshot-at', 'snapshotAt');
  set('btn-live', 'btnLive');
  // 停用期間給個 title，滑過去看得出來是還沒好而不是壞了。放行時會清掉。
  const lb0 = $('btn-live');
  if (lb0 && lb0.disabled) lb0.title = S('loading');
  set('lbl-roles', 'lblRoles');
  set('lbl-brightness', 'lblBrightness');
  set('mode-count', 'modeCount');
  set('mode-weight', 'modeWeight');
  set('mode-conc', 'modeConc');
  set('ramp-lo', 'rampLow');
  set('ramp-hi', 'rampHigh');
  set('lbl-mix', 'lblMix');
  set('lbl-asn', 'lblAsn');
  set('lbl-asia', 'lblAsia');
  set('lbl-users', 'lblUsers');
  set('lbl-ooni', 'lblOoni');
  set('lbl-shutdown', 'lblShutdown');
  set('note', 'note');
  set('credit-title', 'creditTitle');
  set('credit-onionoo', 'creditOnionoo', true);
  set('credit-metrics', 'creditMetrics', true);
  set('credit-ooni', 'creditOoni', true);
  set('credit-accessnow', 'creditAccessNow', true);
  set('credit-ne', 'creditNaturalEarth', true);
  set('credit-osm', 'creditOsm', true);
  set('credit-netusers', 'creditNetUsers', true);
  set('credit-currents', 'creditCurrents', true);
  set('cc-close', 'ccClose');
  set('loading', 'loading');
  set('hint-wide', 'hintWide');
  set('hint-narrow', 'hintNarrow');
  set('hint-close', 'hintClose');
  set('backend', 'backendDetecting');
  const bu = $('btn-users');
  if (bu) { bu.textContent = S('modeUsers'); bu.title = S('modeUsersTip'); }
  // 收合鈕的文字在 CSS ::after 裡，只能透過自訂屬性換掉
  document.documentElement.style.setProperty('--toggle-open', `'${S('toggleOpen')}'`);
  document.documentElement.style.setProperty('--toggle-closed', `'${S('toggleClosed')}'`);
  sizeToggle();
}
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
  // 大洋環流。慣例上暖流畫紅、寒流畫藍，這裡不能照做：紅橙粉全被四個角色色與
  // blocked 的警示紅佔走了，海面上冒出一條暖色線會被讀成中繼或警示。改成都留在冷色系，
  // 暖流偏青綠、寒流偏藍紫，靠色相分。
  //
  // 兩個都刻意壓低彩度、壓暗。中繼點是小而飽和的點，環流是寬而柔的帶，退到環境層
  // 才不會跟資料層搶讀。也要跟 cable 的鋼藍拉開，那是這一層最容易被誤認的對象，
  // 所以寒流往紫走而不是留在藍。
  curWarm: 0x4c8f86, // 暖流
  curCold: 0x6a759f, // 寒流
  blocked: 0xff5a6e, // OONI 觀測到 Tor 連線大量失敗的國家。紅色系跟四個角色色都拉開
  border: 0x4f88b4,  // 國界。壓在海岸線之下一階，讓海陸交界仍然是最清楚的那條線
};
// 底圖貼圖用色（畫在 canvas 上，走 CSS 色字串）
const MAP = {
  sea: '#06182c',       // 海。深海的底色，等深線讀不到時整片海就是這個顏色
  // 海底地形的五階，由淺到深：大陸棚、200-1000、1000-3000、3000-5000、5000 以下。
  // 最深那階刻意等於 sea，這樣沒有 bathymetry.json 時畫面跟以前一模一樣，
  // 有的時候也只是把靠岸的那一圈提亮，大洋主體不動。
  //
  // 幅度壓得很克制。陸地亮度是資料（中繼數），海底地形是背景，海的階差要是拉得跟
  // 陸地的色階一樣明顯，讀者會以為海面上那幾階也在講什麼數字。
  seaRamp: ['#083350', '#082b44', '#07223a', '#061c31', '#06182c'],
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
  all:    { get lbl() { return S('modeAllLbl'); },   lo: '#0d2c46', hi: '#3d87bd' },
  guard:  { lbl: 'guard',       lo: '#0c2b1e', hi: '#4fd58f' },
  exit:   { lbl: 'exit',        lo: '#2b1d09', hi: '#ffb347' },
  both:   { lbl: 'guard＋exit', lo: '#2a1220', hi: '#ff9ec7' },
  middle: { lbl: 'middle',      lo: '#08262e', hi: '#35c6e8' }, // 青色系，避開陸地本身的藍
  conc:   { get lbl() { return S('modeConcLbl'); },  lo: '#2b1030', hi: '#c47ad8' }, // 紫，跟四個角色色都拉開
  // 使用者估計是需求端，跟其他模式的供給端不是同一件事，色相挑剩下沒人用的黃。
  // 這個模式下中繼點照樣全部顯示，「陸地亮度是用的人、點是架的機器」那個落差就是重點。
  users:  { get lbl() { return S('modeUsersLbl'); }, lo: '#2a2410', hi: '#e8d24a' },
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

let renderer, scene, camera, post, globe, sun;
// zoom 是「相對於剛好完整入鏡的倍率」，不是絕對距離。畫面比例一變（手機轉向、視窗縮放），
// 貼合距離跟著重算，地球就不會被裁掉，使用者原本放大到哪一級也保留得住。
// 開場正對日本，順著自轉往東亞、太平洋、美洲一路帶過去。rx 稍微低頭，讓北半球
// （中繼幾乎都在那）置中。
// ry 跟經度的換算：llToVec 的慣例下，要讓經度 L 面向鏡頭得設 ry = (-L - 90) 度。
// 2.28 rad 約當經度 141，日本本州正對畫面中心。
const view = { zoom: 1, rx: 0.45, ry: 2.28, spin: true };
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
// 動效共用的時鐘。TSL 有內建的 time node，但實測它在這個組合下不會前進（畫面完全靜止），
// 改用自己的 uniform 在 animate() 裡推，行為明確可控。呼吸與極光都吃這一個。
const clockT = uniform(0);
// 點的大小補償。放大時鏡頭靠近，同一顆點在螢幕上等比例變大，近看就糊成一片色塊。
// 這裡反向縮小幾何，讓點在螢幕上的大小大致固定，放大的效果落在「點彼此拉開」而不是
// 「每顆點變胖」，這樣才看得到個別的中繼。
//
// 縮放只能重算 instanceMatrix，另外兩條路都試過而且都會讓點整批消失：
//   mesh.scale       在 instanceMatrix 之外，會把 translation 一起縮，點縮進地心
//   mat.positionNode 覆寫掉 NodeMaterial 處理 instancing 的那段，instance 位置整個沒套用
// dotGroups 保存每顆點的原始位置與大小，重算時從這份原始值乘上係數，避免誤差累積。
const dotGroups = [];
const DOT_EXP = 0.85;   // 1 是完全補償螢幕大小。留點餘裕，放大時仍稍微變大，手感自然些
const DOT_STEP = 0.02;  // 縮放是連續的，變化小於這個比例就不重算 9,889 個矩陣
let lastDotK = 1;

// 遠看時只畫一部分的點。
//
// 那個距離下歐洲十幾國的點疊在幾十個像素裡，全部畫出來就是一片糊掉的色塊，而且
// 「哪一國多」這件事已經由陸地色階在講了，點在那裡只是質感。放大之後再逐步把其餘的
// 交出來，一顆一顆看得清楚。
//
// 靠 InstancedMesh.count 只畫前幾個 instance，成本是零，不必重建幾何。前提是 list
// 的順序要先打散：relays 是照國別排的，直接取前 N 個會變成「只顯示排在前面的國家」。
const SAMPLE_MIN = 0.2;   // 最遠時畫五分之一
// 比例不是照 lod 線性長，那樣預設距離會落在六成五。1.75 這個指數讓預設剛好是一半，
// 兩端不變（最遠仍是 SAMPLE_MIN，zoom 0.7 以內仍是全部）。改預設比例就調這個數字。
const SAMPLE_EXP = 1.75;
let lastCountF = -1;
const ANCHOR = new Map(); // ISO2 → { ll: [緯度, 經度], jlat, jlon, rings, bb }，沒有國界資料時才用 ll 加 jlat/jlon 抖動

// 太陽直射點。原本的太陽是寫死的固定向量（-8, 1.5, 2.5），純粹為了構圖讓明暗交界
// 落在正面，跟真實時間無關。改成由 UTC 時間算出直射的經緯度，日夜分界線就會跟著
// 真實時間走，四季的晝長差異也會自己對上。
//
// 用的是 NOAA 低精度太陽位置公式，這個尺度下精度遠超過需要。不打任何 API，
// 輸入只有 Date，所以靜態快照與即時模式一樣準，也不會多一個對外連線。
//
// 直射點經度取赤經減格林威治恆星時，比走「時間方程」那條路少一層近似。
// 驗算過：夏至赤緯 +23.44、冬至 -23.43、春分秋分約 0，12:00 UTC 經度 1.6
// （時間方程造成的偏移），06:00 UTC 在東經 91.6（該地正好中午）。
function subsolarPoint(date) {
  const rad = Math.PI / 180;
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0; // J2000 起算的天數
  const L = (280.460 + 0.9856474 * d) % 360;         // 平黃經
  const g = ((357.528 + 0.9856003 * d) % 360) * rad; // 平近點角
  const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad; // 真黃經
  const eps = (23.439 - 0.0000004 * d) * rad;        // 黃赤交角
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / rad;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) / rad;
  const gmst = 280.46061837 + 360.98564736629 * d;   // 格林威治恆星時
  return { lat: dec, lon: ((ra - gmst) % 360 + 540) % 360 - 180 };
}

const sunVec = new THREE.Vector3();
function updateSun(date) {
  if (!sun) return;
  const p = subsolarPoint(date || new Date());
  llToVec(p.lat, p.lon, 40, sunVec); // 距離只要遠到方向穩定就好，平行光不看距離衰減
  sun.position.copy(sunVec);
}

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

// snapshot 與 torusers 由 tools/publish_games_data.sh 在正式機上定期重生，發布到 assets，
// 不隨文件站一起走版。其餘五份變動以季或年計，跟著站台發布就好，維持相對路徑。
//
// 先打 assets，任何原因失敗就退回站上那一份。assets 掛掉、CORS 沒設好、或使用者的網路
// 擋掉那個網域時，地球儀仍然畫得出來，只是資料是隨站發布的那一版，不會整顆球變空。
//
// 注意 assets.anoni.net 必須回 Access-Control-Allow-Origin，這是跨來源請求，
// 沒有這個 header 瀏覽器會直接擋掉，每次載入都會走到退回那條路。
const ASSETS = 'https://assets.anoni.net/games/';
async function getJSONAsset(name, opt) {
  try {
    return await getJSON(ASSETS + name, { ...opt, mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' });
  } catch (e) {
    return getJSON('./' + name, opt);
  }
}

// 沒走到 WebGPU 時，把卡在哪一關講出來。最常見的是頁面不是 https 或 localhost，
// WebGPU 要求 secure context，WebGL2 不要求，所以會安靜地退回去。
async function webgpuBlocker() {
  if (new URLSearchParams(location.search).get('backend') === 'webgl') return 'blkForced';
  if (!window.isSecureContext) return 'blkInsecure';
  if (!navigator.gpu) return 'blkNoGpu';
  try {
    if (!(await navigator.gpu.requestAdapter())) return 'blkNoAdapter';
  } catch (e) { return 'blkRejected'; }
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
  try { await renderer.init(); } catch (e) { console.error(e); fatal(S('fatalNoGpu')); return false; }
  const isGPU = !!(renderer.backend && renderer.backend.isWebGPUBackend);
  $('backend').className = isGPU ? 'gpu' : 'gl';
  $('backend').textContent = isGPU ? 'WebGPU' : S('backendWebGL');
  if (!isGPU) webgpuBlocker().then((why) => { if (why) $('backend').textContent = `${S('backendWebGL')}${S('backendSep')}${S(why)}`; });

  scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, targetDist());
  scene.add(new THREE.HemisphereLight(0x2a466e, 0x05070d, 0.5)); // 夜側留一點底光，國界與陸地仍讀得到
  globe = new THREE.Group();
  scene.add(globe);

  // 太陽掛在 globe 底下，位置每幀由 UTC 時間換算的直射點決定。
  // 掛在 globe 而不是 scene，是因為直射點是地理座標，要跟著地球一起轉，
  // 這樣被照亮的半球才會固定在正確的經度上，而不是跟著鏡頭跑。
  // target 預設在原點，globe 也在原點，所以光的方向就是直射點指向地心。
  sun = new THREE.DirectionalLight(0xcfe6ff, 2.2);
  globe.add(sun);
  updateSun();
  return true;
}

// ---- 底圖：把國界多邊形畫成等距圓柱投影的貼圖 ----
const TEX_W = 2048, TEX_H = 1024;
const texX = (lon) => (lon + 180) / 360 * TEX_W;
const texY = (lat) => (90 - lat) / 180 * TEX_H;

// 星空。原本背景是一片純色，地球像浮在漆黑裡的一顆球。
//
// 用 canvas 現畫成等距圓柱投影再丟給 scene.background，跟 paintEarth() 同一招，
// 不下載任何星圖。真實星表（HYG 之類）壓到只留亮星也是幾百 KB，而這裡的視角是使用者
// 隨手轉的假想天球，不是地球上某時某地的實際天空，科學準確度在這裡換不到東西。
//
// 亮度刻意壓在 bloom 的門檻（0.72，比的是線性 luminance）以下。最亮的星 alpha 約 0.47，
// 疊在黑底上換算成線性大約 0.27，不會被 bloom 抓出來糊成一片。
// scene.background 不是 mesh，不吃 draw call。
const SKY_STARS = 3200;
function buildSky() {
  const cv = document.createElement('canvas');
  cv.width = TEX_W; cv.height = TEX_H;
  const g = cv.getContext('2d');
  g.fillStyle = '#03050b';
  g.fillRect(0, 0, TEX_W, TEX_H);
  // 銀河帶：隨便挑一個大圓當帶狀中心，離它愈近星愈密。純粹是質感，不對應真實銀河位置。
  const band = new THREE.Vector3(0.3, 0.85, -0.4).normalize();
  const dir = new THREE.Vector3();
  let seed = 20260726;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < SKY_STARS; i++) {
    // 用 acos 取緯度，不然星星會在兩極擠成一團
    const lon = (rnd() - 0.5) * 360;
    const lat = 90 - Math.acos(2 * rnd() - 1) * 180 / Math.PI;
    llToVec(lat, lon, 1, dir);
    const near = Math.exp(-Math.pow(Math.acos(Math.min(1, Math.abs(dir.dot(band)))) * 4, 2));
    if (rnd() > 0.15 + near * 0.5) continue;
    const r = 0.9 + rnd() * (near > 0.3 ? 1.8 : 1.2);
    const a = (0.30 + rnd() * 0.45) * (0.55 + near * 0.55);
    g.fillStyle = rnd() < 0.15 ? `rgba(255,224,190,${a.toFixed(2)})` : `rgba(200,220,255,${a.toFixed(2)})`;
    g.beginPath();
    g.arc(texX(lon), texY(lat), r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  // 關掉 mipmap。星星只有一兩個像素寬，縮圖會把它們直接平均掉，畫面上就是一片黑。
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  scene.background = tex;
}

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

// 受阻國家的內側漸層。單靠邊界紅線的話，一個國家被鄰國的紅線包圍時看不出來是誰被標記，
// 線本身沒有內外之分。往國土內側鋪一層由邊界向中心衰減的紅，方向性就出來了。
//
// 用 canvas 的內發光做：clip 到國土範圍再描邊，shadowBlur 讓描邊往兩側糊開，
// 外側被 clip 切掉，只留內側那一半。分兩道疊，寬的那道給大範圍的暈染，
// 窄的那道把貼著邊界的地方提亮，衰減才有層次。
//
// 貼圖是等距長方投影，blur 半徑固定在貼圖像素上，換算到地表就是高緯度窄、低緯度寬。
// 目前受阻的幾國都落在中低緯（EG 27°N、MM 21°N、PK 30°N、CN 35°N），這個偏差看不出來。
// 哪天清單裡出現高緯度國家，這裡要改成依緯度縮放 blur。
// 內側漸層的深度，單位是貼圖像素。2048 寬在赤道約 19.6 公里/px，26px 約 510 公里。
// 埃及在貼圖上約 57px 寬，所以漸層會吃掉它接近一半，白俄羅斯、亞塞拜然這種小國則整片染紅，
// 大國（RU、CN）就只是一圈內鑲邊。這個差異是想要的：面積小的國家本來就該整塊讀得出來。
const BLOCK_INWARD = 26;
const BLOCK_PEAK = 0.6;  // 貼著邊界那一格的強度，往內線性衰減到 0
// 海的自發光係數。夜側 base 只乘 0.15，海的色階窄，乘完差距不到一階色。
// 這一層只有海，所以係數可以拉高而不影響陸地。0.55 之後陸棚在夜側讀得出來，
// 最深那階仍然接近黑，日夜的分界也還在。
const SEA_EMIT = 0.55;
const BLOCK_EMIT = 0.5;  // emissive 係數。紅色轉線性後 luminance 約 0.30，乘完約 0.15，
                         // 離 bloom 門檻 0.72 還有距離，不會把這幾國暈成白斑
function paintBlocked(canvas) {
  const gb = canvas.getContext('2d');
  gb.fillStyle = '#000';
  gb.fillRect(0, 0, TEX_W, TEX_H);
  const list = (OONI && OONI.blocked) || [];
  if (!list.length) return;
  const red = '#' + COL.blocked.toString(16).padStart(6, '0');
  for (const cc of list) {
    const path = COUNTRY_PATH.get(cc);
    if (!path) continue;
    gb.save();
    gb.clip(path);                            // 描邊有一半落在國土外，clip 把它切掉，只留內側
    gb.globalCompositeOperation = 'lighter';  // 疊加而不是覆蓋，這樣層數才會累積成漸層
    gb.strokeStyle = red;
    gb.lineJoin = 'round';
    gb.globalAlpha = BLOCK_PEAK / BLOCK_INWARD;
    // 描邊以路徑為中心，線寬 w 的那一道往內覆蓋 w/2。從寬畫到窄，每一道都用同樣的淡薄透明度，
    // 距離邊界 d 的地方會被「w/2 > d」的那幾道蓋到，層數隨 d 線性遞減，累加起來就是線性漸層。
    // 先前用 shadowBlur 做內發光，實測衰減只有 6px 就沒了，範圍不受控。
    for (let d = BLOCK_INWARD; d >= 1; d--) {
      gb.lineWidth = d * 2;
      gb.stroke(path);
    }
    gb.restore();
  }
}

// 海底地形。先鋪最淺的那階當底，再由淺到深一階一階疊上去，沒有被任何一階蓋到的
// 就是大陸棚。海纜幾乎都沿著陸棚鋪、避開深海盆，所以陸棚那圈亮起來之後，海纜層
// 的走向就有了解釋。抓不到資料時退回單色，跟以前一樣。
//
// 一階的所有環合成一個 Path2D 一次填。evenodd 是為了讓環裡的洞不被塗成深海，
// 洞代表「這一塊比周圍淺」，中洋脊就是那種形狀而且面積很大。實測大西洋中洋脊在
// 3000 公尺那層的穿越數是 2，巴倫支海在 200 公尺層也是 2，都靠 evenodd 判成外面。
// 同一階的外環之間不會重疊，所以 evenodd 不會誤消掉別的地方。
function paintSeaFloor(ctx) {
  ctx.fillStyle = BATHY && BATHY.levels ? MAP.seaRamp[0] : MAP.sea;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (!BATHY || !BATHY.levels) return;
  BATHY.levels.forEach((lv, i) => {
    const path = new Path2D();
    for (const ring of lv.p) {
      path.moveTo(texX(ring[0]), texY(ring[1]));
      for (let k = 2; k < ring.length; k += 2) path.lineTo(texX(ring[k]), texY(ring[k + 1]));
      path.closePath();
    }
    ctx.fillStyle = MAP.seaRamp[Math.min(i + 1, MAP.seaRamp.length - 1)];
    ctx.fill(path, 'evenodd');
  });
}

function paintEarth(world, counts) {
  const mk = () => { const cv = document.createElement('canvas'); cv.width = TEX_W; cv.height = TEX_H; return cv; };
  const base = mk(), glow = mk(), block = mk();
  // 夜側專用的海。base 的自發光只有 0.15，海的色階本來就窄，乘完之後差距不到一階色，
  // 實測夜側整片海是 (0,0,3)，等深線等於只在白天看得見。這一層只放海、陸地塗黑，
  // 用高一點的係數疊回去，海就整圈都保得住深淺，陸地的日夜對比完全不受影響。
  //
  // 解析度砍一半就夠。等深線是大尺度的形狀，不像國界那樣需要銳利的邊，而且再多一張
  // 全尺寸貼圖是多 8 MB 的顯存。
  const sea = document.createElement('canvas');
  sea.width = TEX_W >> 1; sea.height = TEX_H >> 1;
  const g = base.getContext('2d'), gg = glow.getContext('2d'), gsea = sea.getContext('2d');
  gsea.scale(0.5, 0.5); // 之後都用 TEX_W/TEX_H 的座標畫，跟其他幾張共用同一套 texX/texY
  paintSeaFloor(g);
  paintSeaFloor(gsea);
  gg.fillStyle = '#000';
  gg.fillRect(0, 0, TEX_W, TEX_H);

  g.lineJoin = 'round';
  g.strokeStyle = MAP.border;
  g.lineWidth = 1.6;
  g.fillStyle = MAP.land;
  gsea.fillStyle = '#000'; // 夜側那層的陸地
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
    gsea.fill(path); // 夜側那層把陸地塗黑，讓它只負責海，陸地的明暗仍然只由日照決定
    // 國界不在這裡描了。貼圖只有 2048×1024，放大之後邊界是鋸齒，改用 buildBorders
    // 畫成 3D 線段。這裡若同時描一次，兩條線會因為解析度不同而錯開。
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
  paintBlocked(block); // 要在上面填完 COUNTRY_PATH 之後才有國土路徑可以 clip
  return { base, glow, block, sea };
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
  const baseTex = toTex(painted.base), glowTex = toTex(painted.glow), blockTex = toTex(painted.block);
  const seaTex = toTex(painted.sea);
  GLOW = { canvas: painted.glow, tex: glowTex };
  const mat = new THREE.MeshStandardNodeMaterial({ map: baseTex, roughness: 1, metalness: 0 });
  // 底圖留一點自發光，夜側仍看得出海陸；中繼多的國家額外亮起來，轉到背光面也讀得到
  // 受阻漸層另存一層，切換「台數、共識權重」時 paintGlow 只重畫 glow，這一層不受影響
  mat.emissiveNode = texture(baseTex).mul(0.15)
    .add(texture(seaTex).mul(SEA_EMIT))
    .add(texture(glowTex).mul(0.5))
    .add(texture(blockTex).mul(BLOCK_EMIT));
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mat));
}

// 大洋環流的主幹。
//
// 這一層跟其他六份不一樣，沒有對應的外部資料檔。各大環流的名稱、走向與冷暖分類是公開的
// 海洋學常識，座標是照著這些常識手繪的，沒有取用任何一家的流場資料，所以 NOTICE 不必
// 多一筆授權。口徑跟 TRUNK 一致：走向可信，位置是示意，寬度與流速完全沒有對應。
// 面板的 credit 要把這件事講出來，畫面上一條會動的線很容易被當成實測流場。
//
// 主幹是固定地理，灣流與黑潮的位置以世紀為單位變化，所以這份座標不需要定期重生，
// 也就不進 publish_games_data.sh。這是選它而不是接 RTOFS 即時流場的主要理由，
// 那條路要在正式機上解 GRIB2，會破掉「只依賴 python3 與 curl」這個現有的界線。
//
// 刻意不畫索馬利亞洋流。那條隨季風每年反向兩次，畫成單一方向有一半的時間是錯的。
//
// 座標寫成 [緯度, 經度]，跟 cables.json 的 [lon, lat] 相反，手寫時緯度在前好讀。
// w 是 1 暖流、0 寒流，陣列順序就是流向。
//
// 改座標或改 CUR_WIDTH_DEG 之後請重跑 tools/check_currents_land.mjs。那支驗的是
// 「緞帶」而不是中心線：畫出去的是一條有寬度的帶子，中心線在海上不代表帶子在海上。
// 這一點吃過虧，第一版的工具只驗中心線，結果 23 條裡有 8 條的緞帶邊緣壓在陸地上，
// 東澳暖流在半寬 30% 處就切進雪梨北邊的海岸，工具卻回報全數通過。
//
// 也因為這樣，緞帶寬度不是純粹的視覺參數。西方邊界流（東澳、厄加勒斯、黑潮）本來就
// 貼著岸走，寬度一拉大就得把座標往外推才不會壓到陸地，推過頭洋流的位置就失真了。
// 1.5 度時東澳暖流得往外推 2.4 度、離岸 250 公里，比真實的東澳暖流遠得多，所以收到
// 1.1 度。要再加寬的話，先看這支工具會不會紅，再看推完之後的位置還像不像那條洋流。
const CURRENTS = [
  // 北大西洋環流（順時針）
  // 灣流與北大西洋暖流合成一筆。物理上本來就是同一條連續的流，拆成兩筆會有兩個代價：
  // 接合點的兩段緞帶三角形重疊，additive 混合下那一小塊比別處亮；而且 aU 每條各自從 0
  // 累積，亮紋的相位會在接合處重來一次，看起來像流到一半斷掉又重新開始。
  // 要再拆開請確認這兩件事。check_currents_land.mjs 會抓端點重合並警告。
  { w: 1, p: [[26.02,-79.16],[28,-79.7],[30,-79.9],[32,-78.6],[34,-76.4],[35.5,-74.5],[37,-71.5],[38.5,-68],[40,-63],[41,-57],[42.5,-50],[44,-44],[47,-38],[50,-31],[53,-24],[56,-18],[58,-12],[60,-6],[62,0],[64,6],[67,11]] },  // 灣流接北大西洋暖流
  { w: 0, p: [[42,-11],[38,-11],[34,-11],[30,-13],[26,-16],[22,-19],[18,-19],[15,-19]] },  // 加那利寒流
  { w: 1, p: [[13,-20],[12,-28],[11,-36],[10,-44],[10,-52],[11,-58]] },  // 北赤道洋流（大西洋）
  { w: 0, p: [[63,-59],[60,-61],[57,-58.5],[54,-55],[51,-52.5],[48,-50],[45,-49],[43,-50]] },  // 拉布拉多寒流
  { w: 0, p: [[81,-2],[78,-6],[75,-11],[72,-15],[69,-20],[66,-30],[63,-38],[60.5,-42]] },  // 東格陵蘭寒流
  // 南大西洋環流（逆時針）
  { w: 1, p: [[-6,-34.3],[-8,-34.2],[-10.16,-34.94],[-14,-38],[-18,-38],[-22.14,-39.84],[-26,-46],[-31,-49.5],[-35,-52.5]] },  // 巴西暖流
  { w: 0, p: [[-35,18],[-32,16.5],[-29,15],[-26,13.5],[-23,12.5],[-20,11.3],[-17,10.5],[-14,10],[-11,10.5]] },  // 本格拉寒流
  { w: 1, p: [[-3,8],[-3,0],[-3,-10],[-3,-20],[-4,-28],[-5,-33]] },  // 南赤道洋流（大西洋）
  { w: 0, p: [[-40,-55],[-41,-45],[-42,-33],[-42,-20],[-41,-8],[-39,4],[-37,14]] },  // 南大西洋洋流
  // 印度洋
  { w: 1, p: [[-24.12,36.17],[-27.5,34.34],[-30.13,31.98],[-32.65,29.66],[-34.5,26.5],[-36,23],[-37.5,20.5],[-38,18]] },  // 厄加勒斯暖流
  { w: 0, p: [[-35,112],[-31,111],[-27,110],[-23,109],[-19,110],[-16,113]] },  // 西澳寒流
  { w: 1, p: [[-12,105],[-12,95],[-12,82],[-11,70],[-10,58],[-10,48]] },  // 南赤道洋流（印度洋）
  // 北太平洋環流（順時針）
  { w: 1, p: [[17.02,123.1],[19.5,122.5],[21.5,122],[23,122.3],[25.5,123],[27.5,126],[29.5,129],[30.8,132],[32.8,136.5],[34.3,140.3]] },  // 黑潮
  { w: 1, p: [[35,142],[36.5,148],[38,156],[39.5,165],[41,175],[42,-175],[43,-165],[44,-155],[45,-145],[45,-135]] },  // 北太平洋洋流
  { w: 0, p: [[47,-127],[43,-126],[39,-125],[35,-122.5],[31,-119],[27,-116],[24,-113.5]] },  // 加利福尼亞寒流
  { w: 1, p: [[13,-105],[12,-125],[11,-145],[11,-165],[12,175],[13,155],[14,138],[15,126]] },  // 北赤道洋流（太平洋）
  { w: 0, p: [[56,166],[53,162],[50,157],[47,153.5],[44,148.5],[42,145],[39,143.5]] },  // 親潮
  { w: 1, p: [[6,132],[6,150],[6,168],[6,-175],[6.5,-160],[7,-145],[7,-130],[6,-115]] },  // 赤道逆流（太平洋）
  // 南太平洋環流（逆時針）
  { w: 1, p: [[-17,148],[-21,152],[-25,154.5],[-29,154.5],[-33.17,153.06],[-37,151],[-40,150.5]] },  // 東澳暖流
  { w: 0, p: [[-44,-77],[-39,-75.5],[-34,-73.5],[-29,-72.5],[-24,-71.5],[-19,-72],[-14.06,-77.58],[-9,-80.5],[-5,-82.5],[-2,-83]] },  // 秘魯寒流
  { w: 1, p: [[-3,-88],[-3,-105],[-3,-125],[-3,-145],[-3,-165],[-3.5,-178],[-4,168]] },  // 南赤道洋流（太平洋）
  // 南冰洋。繞完一圈，從 -180 畫到 180 首尾就接上了
  { w: 0, p: [[-56,-180],[-58,-165],[-59,-150],[-58,-135],[-56,-120],[-55,-105],[-56,-90],[-58,-75],[-59,-62],[-57,-50],[-53,-38],[-52,-25],[-53,-12],[-55,0],[-57,12],[-58,25],[-57,40],[-55,55],[-55,68],[-55,82],[-54,95],[-55,110],[-57,127],[-58,143],[-57,160],[-56,175],[-56,180]] },  // 南極繞極流
];

// 畫法要跟海底電纜明顯分開。兩層都是海面上的細線、都在冷色系，畫成同樣的 1px 線段
// 會直接被讀成同一種東西。三個地方拉開：
//
//   形態  電纜是連續不斷的線，環流只有一節一節的流帶，節與節之間是真的空的。
//         所以這一層沒有底色，整條線的存在感完全來自跑動的亮紋。
//   寬度  GPU 的線寬鎖死在 1px，粗細做不出差異，所以改織成貼著球面的緞帶，
//         寬度給的是地表的度數。放大之後緞帶會跟著變寬，電纜永遠是髮絲線。
//   邊緣  緞帶橫向柔邊，中間亮兩側收掉。硬邊的寬線看起來只是比較粗的電纜。
//
// 緞帶的織法沿用極光那層：手工推頂點，不靠任何 fat line 的 addon（vendor 也沒有）。
const CUR_H = 1.0022;      // 離地高度。壓在海纜（1.003）之下
const CUR_STEP_DEG = 1.2;  // 沿線的補點間距。跟海纜同一個坑，跨得遠的直線會從地球內部穿過去
const CUR_WIDTH_DEG = 1.1; // 緞帶寬度，單位是地表的度。赤道上約 120 公里
const CUR_DENSITY = 6;     // 每弧度幾節亮紋。1/6 弧度約 9.5 度，在赤道約一千公里
const CUR_SPEED = 0.28;    // 相位速度。除以 DENSITY 才是紋路實際跑的角速度，一節約 3.6 秒
const CUR_TAIL = 4.5;      // 尾巴的衰減次方。愈大頭愈集中、尾巴拖愈長
const CUR_TAPER = 0.18;    // 尾端收剩幾成寬。頭尾同寬的話整節會讀成一根膠囊
const CUR_PEAK = 0.42;     // 亮紋強度。暖流色轉線性後 luminance 約 0.23，相乘後約 0.10，
                           // 離 bloom 的 0.72 門檻還很遠，這一層不會被暈成白帶
const CUR_STILL = 0.10;    // REDUCED 時的定值亮度

function buildCurrents() {
  const pos = [], us = [], vs = [], ws = [], idx = [];
  const radial = new THREE.Vector3(), tan = new THREE.Vector3(), side = new THREE.Vector3();
  const halfW = R * (CUR_WIDTH_DEG / 2) * Math.PI / 180;
  for (const cur of CURRENTS) {
    // 先把整條補成密點再織緞帶。分兩步是為了讓弧長可以一路累積，而且算切線要看
    // 前後鄰點，邊補邊發射的寫法拿不到後面那一點。
    const pts = [];
    for (let i = 0; i + 1 < cur.p.length; i++) {
      const lat1 = cur.p[i][0], lon1 = cur.p[i][1];
      const dlat = cur.p[i + 1][0] - lat1;
      let dlon = cur.p[i + 1][1] - lon1;
      if (dlon > 180) dlon -= 360; else if (dlon < -180) dlon += 360; // 跨換日線走短的那邊
      const cos = Math.cos((lat1 + lat1 + dlat) / 2 * Math.PI / 180);
      const steps = Math.max(1, Math.ceil(Math.hypot(dlat, dlon * cos) / CUR_STEP_DEG));
      for (let k = (i ? 1 : 0); k <= steps; k++) { // 接續的段跳過第 0 點，免得跟上一段的尾巴重複
        const t = k / steps;
        pts.push(llToVec(lat1 + dlat * t, lon1 + dlon * t, R * CUR_H, new THREE.Vector3()));
      }
    }
    const base = pos.length / 3;
    // aU 存的是累積弧長（弧度），不是 0 到 1 的比例。用比例的話，南極繞極流那條
    // 三萬公里的線跟黑潮那條三千公里的線會被切成同樣的節數，紋路長度差一個量級。
    let u = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i) u += pts[i - 1].angleTo(pts[i]);
      // 切線取前後鄰點的差，端點退回單邊差分。side 是切線與法線的外積，也就是
      // 貼著球面、垂直於流向的那個方向，緞帶就往這兩邊各撐開半個寬度。
      tan.copy(pts[Math.min(i + 1, pts.length - 1)]).sub(pts[Math.max(i - 1, 0)]).normalize();
      radial.copy(pts[i]).normalize();
      side.crossVectors(tan, radial).normalize().multiplyScalar(halfW);
      pos.push(pts[i].x + side.x, pts[i].y + side.y, pts[i].z + side.z);
      pos.push(pts[i].x - side.x, pts[i].y - side.y, pts[i].z - side.z);
      us.push(u, u);
      vs.push(0, 1);
      ws.push(cur.w, cur.w);
      if (i) {
        const a = base + (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aU', new THREE.BufferAttribute(new Float32Array(us), 1));
  g.setAttribute('aV', new THREE.BufferAttribute(new Float32Array(vs), 1));
  g.setAttribute('aW', new THREE.BufferAttribute(new Float32Array(ws), 1));
  g.setIndex(idx);

  const mat = new THREE.MeshBasicNodeMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  // 顏色要先從 sRGB 轉到線性工作空間再交給 vec3。直接寫 vec3(0x3f/255, ...) 的話
  // 那組數字會被當成已經是線性值，顯示出來會比指定的色票淡一大截，飽和度掉光。
  // 這一層要的是低彩度的環境色，再被沖淡就跟白色沒兩樣了。
  const cw = new THREE.Color(COL.curWarm), cc = new THREE.Color(COL.curCold);
  mat.colorNode = mix(vec3(cc.r, cc.g, cc.b), vec3(cw.r, cw.g, cw.b), attribute('aW', 'float'));
  const across = attribute('aV', 'float').sub(0.5).abs().mul(2); // 0 在中線、1 在緞帶邊緣
  if (REDUCED) {
    // 極光在 REDUCED 時整層不建，那層沒有動畫就沒有內容。這層不一樣，環流的走向
    // 本身就是要講的東西，所以留下來，改成整條均勻的柔邊帶。連續的寬帶跟髮絲線
    // 還是分得出來，靜止時不必再靠亮紋去區隔。
    mat.opacityNode = oneMinus(smoothstep(0.35, 1.0, across)).mul(CUR_STILL);
  } else {
    // 相位隨弧長遞增、隨時間遞減，所以亮紋往 aU 變大的方向跑，也就是座標的排列順序。
    // 亮度取 phase 本身而不是 oneMinus(phase)：頭要在下游、尾巴拖在上游，
    // 反過來寫會變成尾巴在前面，看起來像水在倒流。
    const phase = fract(attribute('aU', 'float').mul(CUR_DENSITY).sub(clockT.mul(CUR_SPEED)));
    const bright = phase.pow(CUR_TAIL);
    // 尾巴要跟著變窄。只調亮度、寬度不動的話，一節會讀成一根等寬的膠囊，
    // 跟「一道流」差很遠。頭最寬，往尾端收到 CUR_TAPER，整節就成了梭形。
    const half = bright.mul(1 - CUR_TAPER).add(CUR_TAPER);
    const edge = oneMinus(smoothstep(half.mul(0.35), half, across));
    mat.opacityNode = bright.mul(CUR_PEAK).mul(edge);
  }
  const mesh = new THREE.Mesh(g, mat);
  // 這幾層同心透明物件的預設排序不穩定，明確指定。放在海纜與國界（都是 0）之後，
  // additive 只會加亮，疊在上面不會蓋掉底下那幾層的線。
  mesh.renderOrder = 10;
  globe.add(mesh);
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
// 座標寫成 [緯度, 經度]，跟 cables.json 的 [lon, lat] 相反。手寫時緯度在前好讀。
//
// 中間那些點是為了繞開陸地。大圓弧會抄近路直接切過大陸，沿岸走廊尤其嚴重，手工挑
// 中繼點挑不完（第一版 24 條有 18 條壓到陸地，非洲東岸那條有 73 個取樣點在內陸）。
// 現在的座標是 tools/fix_trunk_land.mjs 跑出來的：拿 countries.json 對弧線做
// point-in-polygon，壓到陸地就把該段中點往垂直方向推到海上，再遞迴檢查兩個子段。
// 改動端點之後請重跑那支工具，不要手工補點。
const TRUNK = [
  [[35.05,140],[37.61,144.4],[40.51,148.71],[45.76,158.51],[51.77,-176.72],[45.2,-123.97]],  // 千倉 ↔ 美國俄勒岡
  [[34.3,136.8],[34.78,139.88],[36.82,142.09],[39.64,147.41],[44.44,159.37],[48.22,-172.26],[35.12,-120.62]],  // 志摩 ↔ 美國加州
  [[24.86,121.83],[35.05,140]],  // 台灣頭城 ↔ 千倉
  [[13.76,121.05],[12.85,122.67],[12.5,124.5],[12.83,124.83],[12.56,125.22],[12.05,125.73],[12.19,127.04],[12.45,129.58],[12.9,134.64],[13.5,144.8],[21.35,-158.2],[33.86,-118.4]],
  [[22.36,120.63],[16,119.5],[14.71,120.02],[14.02,120.33],[13.61,120.59],[13.76,121.05]],  // 台灣枋山 ↔ 菲律賓
  [[-33.95,151.25],[-36.79,174.77]],  // 雪梨 ↔ 奧克蘭
  [[-33.95,151.25],[-27.35,158.8],[-23.9,162.24],[-22.13,163.9],[-21.2,164.74],[-20.74,164.36],[-20.22,163.9],[-19.91,164.25],[-20.2,164.61],[-20.73,165.5],[-20,165],[21.35,-158.2]],  // 雪梨 ↔ 夏威夷
  [[1.32,103.7],[1.09,104.12],[1.45,104.43],[2.07,104.82],[3.23,105.5],[5.5,106.83],[10,109.5],[22.3,114.27],[22.89,116.54],[24,118.6],[27.2,120.79],[27.87,121.65],[28.89,121.97],[29.91,122.26],[30.9,121.85],[33.5,126],[35.1,129.05],[34.05,130.09],[34.34,131.06],[33.95,129.99],[33.08,129.36],[33.71,129.59],[33.88,130.29],[34.55,131.22],[33.79,130.31],[34.52,131.16],[33.73,130.3],[34.5,131.1],[33.67,130.29],[34.48,131.05],[33.61,130.29],[33.5,131.5],[33.39,132.09],[32.84,132.18],[32.72,133.16],[32.5,135],[35.05,140]],
  [[22.3,114.27],[22.36,120.63]],  // 香港 ↔ 台灣枋山
  [[1.32,103.7],[1.12,103.03],[1.51,102.46],[2.25,101.45],[3.69,99.49],[5.43,97.59],[5.5,95],[13.05,80.28]],  // 新加坡 ↔ 清奈
  [[13.05,80.28],[11.3,80.01],[10.23,80.12],[9.74,79.16],[8.82,79],[8.19,78.31],[7,77],[12.95,74.68],[15.93,73.47],[19.08,72.83]],  // 清奈 ↔ 孟買（繞印度南端）
  [[19.08,72.83],[11.6,43.15]],  // 孟買 ↔ 吉布地
  [[1.32,103.7],[-2,105],[-2.79,106.1],[-4.15,106.15],[-5.41,106.12],[-6.5,105.5],[-7.24,105.38],[-7.83,105.84],[-8.89,106.72],[-10.95,108.46],[-15,112],[-23.55,113.49],[-24.65,113.12],[-25.77,113.4],[-26.92,113.36],[-27.92,113.98],[-30.07,114.59],[-31.95,115.86]],
  [[11.6,43.15],[12.27,43.39],[12.87,43.02],[13.93,42.3],[15.97,40.89],[20,38],[25.15,35.68],[27.73,34.43],[27.48,33.95],[27.83,33.55],[28.47,32.98],[29.97,32.55],[31.68,31.83],[31.73,30.79],[31.72,30.17],[31.2,29.92],[35,18],[37.55,15.46],[38.11,15.59],[38.41,15.04],[38.82,14.09],[39.57,12.27],[43.3,5.37]],
  [[39.6,-74.33],[42.51,-67.38],[45.53,-60.06],[46.56,-55.98],[47.59,-54.16],[46.99,-54.55],[46.45,-54.06],[46.41,-53.28],[46.93,-52.81],[48.03,-51.97],[50.49,-43.32],[50.83,-4.55]],  // 紐澤西 ↔ 英國
  [[39.6,-74.33],[42.51,-67.11],[45.5,-59.48],[46.35,-55.21],[46.24,-54.03],[46.72,-52.99],[47.63,-50.98],[49.67,-41.99],[48.73,-3.46]],  // 紐澤西 ↔ 法國
  [[25.77,-80.19],[24.42,-78.47],[23.84,-78.23],[23.72,-77.59],[23.56,-76.45],[21.79,-72.53],[18,-65],[-3.72,-38.54]],  // 邁阿密 ↔ 福塔萊薩
  [[-3.72,-38.54],[38.44,-9.1]],  // 福塔萊薩 ↔ 葡萄牙
  [[-3.72,-38.54],[-4.52,-36.66],[-4.94,-35.68],[-5.22,-35.13],[-5.83,-35.08],[-8.41,-31.94],[-12.49,-24.86],[-20,-10],[-33.9,18.42]],  // 福塔萊薩 ↔ 開普敦
  [[-3.72,-38.54],[-5.25,-35.28],[-6.99,-34.52],[-8.84,-34.97],[-13.86,-38.68],[-16.53,-38.76],[-19.11,-39.46],[-21.48,-40.84],[-22.28,-40.98],[-22.75,-41.66],[-23.22,-41.86],[-23.17,-42.38],[-23,-43.2],[-29.33,-49.09],[-31.09,-50.44],[-32.4,-52.32],[-33.58,-52.68],[-34.42,-53.65],[-34.96,-54.85],[-34.9,-56.2]],  // 巴西東岸南下
  [[38.44,-9.1],[28.1,-15.4],[14,-19],[8.1,-13.31],[6.57,-11.86],[5.51,-10.04],[4.71,-9.25],[4.43,-8.16],[4.17,-7.07],[4.5,-6],[4.41,-3.57],[4.36,-2.31],[4.9,-1.18],[5.38,1.21],[5.64,2.44],[6.43,3.42]],
  [[6.43,3.42],[-6,11],[-13.22,11.58],[-16.9,11.58],[-18.74,11.9],[-20.37,12.83],[-27.28,15.14],[-33.9,18.42]],  // 拉哥斯 ↔ 開普敦
  [[-33.9,18.42],[-34.44,18.37],[-34.64,18.92],[-34.89,19.85],[-34.69,21.64],[-34.8,25],[-32.84,28.56],[-31.55,30.09],[-29.87,31.05],[-28.96,32.26],[-27.66,32.93],[-25.1,34.17],[-24.2,35.48],[-23.47,35.89],[-22.68,35.65],[-20,36.5],[-17.16,38.86],[-16.73,39.79],[-15.85,40.3],[-14.96,40.78],[-14.42,41.02],[-13.96,40.64],[-10.27,40.55],[-8.43,40.2],[-6.8,39.28],[-4.04,39.66],[2,45.5],[2.75,46.75],[3.94,47.59],[4.94,48.66],[6.28,49.24],[8.77,50.64],[11.5,51.5],[12.03,51.4],[12.13,50.87],[12.21,49.98],[12.32,48.3],[12.5,45],[11.6,43.15]],
  [[-33,-71.6],[-12,-77.1],[-11.07,-78.19],[-9.77,-78.78],[-7.23,-79.91],[-6.33,-81.27],[-4.75,-81.63],[-1.81,-80.99],[9,-79.5]],
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
// 把國界多邊形轉成貼在球面上的線段。pick 決定要哪些國家，height 是離地高度。
// 國界的相鄰點最遠有 9 度（俄羅斯北岸），直線連過去會從地球內部穿過，中段被球體
// 擋住就是一段一段的斷線，跟海纜那層是同一個坑，所以超過門檻要沿經緯度補點貼回球面。
function ringSegments(world, pick, height) {
  const pos = [];
  const v = new THREE.Vector3(), prev = new THREE.Vector3();
  const MAX_STEP_DEG = 1.5;
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
      llToVec(plat, plon, height, prev);
      pos.push(prev.x, prev.y, prev.z);
      llToVec(lat, lon, height, v);
      pos.push(v.x, v.y, v.z);
      plat = lat; plon = lon;
    }
  };
  for (const c of world.c) {
    if (!pick(c)) continue;
    for (const ring of c.p) {
      if (ring.length < 6) continue;   // 少於三個點圍不成形狀
      for (let i = 0; i + 3 < ring.length; i += 2) edge(ring[i], ring[i + 1], ring[i + 2], ring[i + 3]);
      // 環要自己閉合，資料的最後一點不一定等於第一點
      edge(ring[ring.length - 2], ring[ring.length - 1], ring[0], ring[1]);
    }
  }
  return pos;
}

// 國界。原本只描在 2048×1024 的貼圖上，赤道處一個像素就是二十公里，放大之後邊界糊成
// 一片鋸齒。改成 3D 線段之後是向量的，放多大都還是一條線。
// 代價是 17,000 個線段，比海岸線那層的 5,000 多，但一樣是單一 draw call。
function buildBorders(world) {
  if (!world) return;
  // 高度壓在海岸線（1.004）之下。沿海國家的國界跟海岸線本來就重疊，讓海岸線畫在上面，
  // 重疊處看到的是比較亮的那條，海陸交界仍然是最清楚的線。
  const pos = ringSegments(world, (c) => !!c.k, R * 1.0036);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  // 試過把線抬到點的上方（1.016）好讓邊界不被遮住，結果是線浮起來跟地形明顯錯開，
  // 掠射角下尤其糟。改成貼著地面走，靠不透明度在點的縫隙間透出來。
  const m = new THREE.LineBasicMaterial({ color: COL.border, transparent: true, opacity: 0.72, depthWrite: false });
  globe.add(new THREE.LineSegments(g, m));
}

function buildBlocked(world) {
  const list = (OONI && OONI.blocked) || [];
  if (!list.length || !world) return;
  const want = new Set(list);
  // 貼著地面走。早先抬到 1.014 是想避開中繼點的遮擋，代價是線浮起來跟地形錯開，
  // 掠射角下會整條跑到地球輪廓外面。而且這幾國本來就幾乎沒有中繼（PK、EG、MM 是 0 台，
  // CN 1 台），沒有需要避開的東西，抬高純粹是白付視差的代價。
  // 比國界那層（1.0036）高一點點，兩條線重疊時紅色蓋在上面。
  const pos = ringSegments(world, (c) => !!c.k && want.has(c.k), R * 1.0045);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  const m = new THREE.LineBasicMaterial({ color: COL.blocked, transparent: true, opacity: 0.85, depthWrite: false });
  globe.add(new THREE.LineSegments(g, m));
}

// 大氣層邊緣輝光。地球邊緣原本是硬邊直接切到背景色，任何參考級的星球渲染都有這圈散射光。
//
// 用一顆略大的同心殼球，亮度取 Fresnel 項：正對鏡頭處 dot(N,V)≈1、輪廓邊緣 dot(N,V)≈0，
// 取 pow(1-dot, n) 就會只在邊緣亮起來。關鍵是這個衰減是幾何決定的，畫面中心那塊
// 「要讀國家亮度、讀中繼點」的區域拿到的疊加光趨近於零，不是靠調參數壓低。
//
// three/tsl 沒有現成的 fresnel node（翻過 export 列表，一次都沒出現），要自己兜。
//
// 亮度算過：藍色 luminance 約 0.53，乘上 intensity 0.6 約 0.32，低於 bloom 的門檻 0.72
// （bloom 比的是 tonemap 之前的線性 luminance），所以這層不會被 bloom 抓去糊成白斑。
const RIM_POWER = 5.5;   // 衰減要夠陡。3.2 時中心仍有可見疊加，被 bloom 一暈整顆球都蒙上藍霧
const RIM_INTENSITY = 0.32; // additive 是疊在陸地本身的亮度上，兩者相加才是 bloom 看到的值
function buildAtmosphere() {
  const mat = new THREE.MeshBasicNodeMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const viewDir = cameraPosition.sub(positionWorld).normalize();
  const rim = oneMinus(saturate(dot(normalWorld, viewDir))).pow(RIM_POWER);
  mat.colorNode = vec3(0x6f / 255, 0xc0 / 255, 0xee / 255); // 沿用海岸線的藍，跟現有冷色系一致
  mat.opacityNode = rim.mul(RIM_INTENSITY);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(R * 1.045, 48, 32), mat);
  // 這幾層透明物件都以地球球心為中心，包圍球中心到相機的距離幾乎打平，
  // 預設排序會不穩定（哪層蓋在哪層可能逐幀跳動），所以明確指定順序。
  mesh.renderOrder = 50;
  globe.add(mesh);
}

// 極光。兩極各一條環狀簾幕，貼著地表往外飄起。
//
// 緯度挑 68 度是有理由的：中繼最北的幾個國家質心都在這條線以南（挪威 61、芬蘭 64、
// 冰島 64.9），簾幕落在它們北邊，不會蓋到任何國家的陸地亮度。
//
// 條紋用純數學雜訊（mx_fractal_noise_float）算，不吃任何貼圖，飄動靠把時鐘加進取樣
// 座標。刻意不動頂點（沒用 positionNode），一來省成本，二來那條路徑在這個專案沒驗證過。
const AUR_LAT = 68;      // 簾幕所在緯度
const AUR_HEIGHT = 0.16; // 簾幕頂端離地高度，佔地球半徑的比例。真實極光約 2-5%，這裡誇大才看得見
const AUR_INTENSITY = 2.0;
function buildAurora() {
  const segU = 168, segV = 8;
  const pos = [], uvs = [], idx = [];
  const v = new THREE.Vector3();
  const band = (sign) => {
    const base = pos.length / 3;
    for (let iu = 0; iu <= segU; iu++) {
      const lon = -180 + 360 * iu / segU;
      for (let iv = 0; iv <= segV; iv++) {
        const t = iv / segV;                       // 0 貼地、1 頂端
        llToVec(sign * AUR_LAT, lon, R * (1.012 + AUR_HEIGHT * t * t), v);
        pos.push(v.x, v.y, v.z);
        // 南北兩條帶的 u 差一個大位移，雜訊相位才不會左右對稱
        uvs.push(iu / segU + (sign > 0 ? 0 : 37.5), t);
      }
    }
    const stride = segV + 1;
    for (let iu = 0; iu < segU; iu++) {
      for (let iv = 0; iv < segV; iv++) {
        const a = base + iu * stride + iv, b = a + stride;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  };
  band(1);
  band(-1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);

  const mat = new THREE.MeshBasicNodeMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const u = uv().x, vv = uv().y;
  const drift = clockT.mul(0.03);
  // 兩層雜訊：低頻給大塊的明暗起伏，高頻給直條紋理，兩者反向漂移才不像整片在平移
  const n1 = mx_fractal_noise_float(vec3(u.mul(5).add(drift), vv.mul(2), clockT.mul(0.02)), 3, 2.0, 0.55);
  const n2 = mx_fractal_noise_float(vec3(u.mul(17).sub(drift.mul(1.7)), vv.mul(5), 0), 2, 2.0, 0.5);
  const streak = smoothstep(0.18, 0.85, n1.mul(0.7).add(n2.mul(0.3)));
  const footFade = smoothstep(0.0, 0.22, vv);            // 貼地那端漸入，不要憑空冒出來
  const tipFade = oneMinus(smoothstep(0.5, 1.0, vv));    // 頂端散掉
  // 綠佔大部分，紫只在最頂端。從赤道視角看，簾幕底部被地球擋住，線性漸層會讓露出來的
  // 那截幾乎全是紫的，看起來不像極光。用次方讓綠色一路撐到高處。
  mat.colorNode = mix(vec3(0.10, 0.95, 0.55), vec3(0.55, 0.30, 0.95), vv.pow(2.6).clamp(0, 1));
  mat.opacityNode = streak.mul(footFade).mul(tipFade).mul(AUR_INTENSITY);
  const mesh = new THREE.Mesh(g, mat);
  mesh.renderOrder = 40; // 這幾層同心透明物件的預設排序不穩定，明確指定
  globe.add(mesh);
}

// 畫面右下的訊息串。新的一則從底下進來，把舊的往上頂。
//
// 這是通用的，任何想在畫面上講一句話的功能都可以呼叫，不限三跳路徑。所以這裡不碰
// 任何跟電路有關的東西，只管排版與生命週期。
//
// 上限壓在 FEED_MAX。三跳每一兩秒就生一條，不設限的話高樓會蓋到畫面外。滿了就把最舊
// 的那則（DOM 上的第一個）提前收掉。
const FEED_MAX = 4;
const FEED_TTL = 5200;   // 一則活多久（毫秒）。三跳一條的生命是 4.5 秒，留一點餘裕
const FEED_OUT = 450;    // 淡出動畫的長度，要跟 CSS 的 transition 對得上

function notify(html, ttl = FEED_TTL) {
  const box = $('feed');
  if (!box) return null;
  const el = document.createElement('div');
  el.className = 'feed-item';
  el.innerHTML = html;
  box.appendChild(el);
  // 先進 DOM 再加 class，讓瀏覽器有一幀的機會套用起始狀態，否則沒有過場直接就位
  requestAnimationFrame(() => el.classList.add('in'));
  const drop = () => {
    if (!el.isConnected) return;
    el.classList.remove('in');
    el.classList.add('out');
    setTimeout(() => el.remove(), FEED_OUT);
  };
  el._drop = drop;
  setTimeout(drop, ttl);
  // 超額的先收。drop 是延遲移除，收的當下 DOM 還在，所以要照索引取而不是反覆讀
  // firstElementChild，否則同一則會被拿到很多次。
  const kids = [...box.children];
  for (let i = 0; i < kids.length - FEED_MAX; i++) {
    if (kids[i]._drop) kids[i]._drop(); else kids[i].remove();
  }
  return el;
}

// Tor 的三跳路徑。偶爾畫一條從 guard 經 middle 到 exit 的弧線，讓「訊息被轉了三手」
// 這件事看得見。
//
// 端點是真實的中繼位置（直接從 dotGroups 挑），所以哪個國家常被選中會自然反映真實的
// 中繼分布。但三點的組合本身不是真實電路：Tor 選路徑要看子網、家族、頻寬權重，這裡
// 完全沒有模擬，飛行節奏也不對應真實電路約十分鐘的輪替。畫面上必須一直掛著「示意」
// 兩個字，不能只寫在面板裡，因為動畫短暫又吸睛，沒人會在那幾秒去翻長篇說明。
const CIRC_N = 3;          // 同時最多三條
const CIRC_FLY = 3.4;      // 一條飛完幾秒
const CIRC_FADE = 1.1;     // 飛完之後淡出
// 下一條的間隔，隨機取樣。固定週期會變成節拍器，所以取區間不取定值。
// 一條的生命是 FLY + FADE = 4.5 秒。照狀態機模擬三千秒的結果：
//   舊的 N=2、gap[3.5,8]   平均同時 0.88 條，三分之一的時間畫面上一條都沒有
//   現在 N=3、gap[0.9,2.8] 平均同時 2.0 條，三條同時佔 36%，空場 0%（瀏覽器實測）
// 再縮間隔就會變成連續不斷的流動，「偶爾轉了三手」那個語氣會消失。
const CIRC_GAP = [0.9, 2.8];
const CIRC_SEG = 96;       // 每條路徑的取樣點數
const circuits = [];

// 從某個角色的點裡隨機挑一個。guard 收 role 1 與 3，exit 收 2 與 3，both 兩邊都算。
function pickRelay(roles) {
  const pool = dotGroups.filter((g) => roles.includes(g.mesh.userData.role) && g.list.length);
  if (!pool.length) return null;
  const g = pool[(Math.random() * pool.length) | 0];
  return g.list[(Math.random() * g.list.length) | 0];
}

// 兩點之間的大圓弧，中段往外抬起來，看起來才像飛過去而不是貼著地面爬。
// 抬多高看兩點的角距離，繞半個地球的那種要抬得比鄰國之間的高。
function arcInto(a, b, out, from, count) {
  const va = new THREE.Vector3(a.x, a.y, a.z).normalize();
  const vb = new THREE.Vector3(b.x, b.y, b.z).normalize();
  const ang = Math.max(1e-4, va.angleTo(vb));
  const sin = Math.sin(ang);
  const lift = R * (0.04 + 0.16 * (ang / Math.PI));
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const w1 = Math.sin((1 - t) * ang) / sin, w2 = Math.sin(t * ang) / sin;
    v.copy(va).multiplyScalar(w1).addScaledVector(vb, w2).normalize()
      .multiplyScalar(R * 1.014 + lift * Math.sin(t * Math.PI));
    out[(from + i) * 3] = v.x;
    out[(from + i) * 3 + 1] = v.y;
    out[(from + i) * 3 + 2] = v.z;
  }
}

function buildCircuits() {
  for (let i = 0; i < CIRC_N; i++) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CIRC_SEG * 3), 3));
    const u = new Float32Array(CIRC_SEG);
    for (let k = 0; k < CIRC_SEG; k++) u[k] = k / (CIRC_SEG - 1);
    geo.setAttribute('aU', new THREE.BufferAttribute(u, 1));
    geo.setDrawRange(0, 0); // 閒置時不畫

    // 這是全新材質，opacityNode 沒有跟任何既有邏輯衝突（中繼點那邊不能碰是因為
    // animate() 每幀在寫 .opacity，這裡沒有那回事）。
    const mat = new THREE.LineBasicNodeMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const uHead = uniform(0), uAlpha = uniform(0);
    const au = attribute('aU', 'float');
    const TRAIL = 0.18;
    // d 是「頭部已經走過這一點多遠」。負的代表還沒掃到，要完全不畫。
    // 早先寫成 clamp(0,1) 是錯的：負值被夾成 0，反而算出最亮，整條弧會一起亮起來，
    // 看起來像一條靜態的線而不是跑動的光點。
    const d = uHead.sub(au);
    const head = smoothstep(-0.012, 0.0, d);              // 頭部前方乾淨切掉
    const tail = oneMinus(d.div(TRAIL).clamp(0, 1));      // 往後線性衰減
    const bright = head.mul(tail).pow(1.6);
    mat.colorNode = vec3(0.88, 0.97, 1.0); // 近白偏青。四個角色色與警示紅都不能借用
    mat.opacityNode = bright.mul(uAlpha);

    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    line.renderOrder = 45;
    globe.add(line);
    circuits.push({
      line, geo, uHead, uAlpha,
      state: 'wait', t: 0,
      // 開場錯開，免得三條同時起跑看起來像同一個動作。間隔縮短後這個錯開也要跟著縮，
      // 不然第三條要等太久才第一次出現。
      wait: CIRC_GAP[0] + Math.random() * (CIRC_GAP[1] - CIRC_GAP[0]) + i * 1.2,
    });
  }
}

// 挑三個端點，把兩段弧接成一條連續的線。挑不到就這輪跳過。
// 三跳的國碼依角色上色，沿用中繼點那組色。這樣一行字同時講了走哪三國與誰是哪一跳，
// 不必再多寫一行解釋。「示意」兩個字要留著，這條路徑不是真實電路。
function hopsHTML(g, m, e) {
  const cell = (n, col) => `<span class="hop" style="color:${roleHex(col)}">${(n.cc || '??').toUpperCase()}</span>`;
  const sep = '<span class="sep">→</span>';
  return `${S('circTag')}　${cell(g, 1)}${sep}${cell(m, 0)}${sep}${cell(e, 2)}`;
}

function spawnCircuit(c) {
  const g = pickRelay([1, 3]);   // guard
  const m = pickRelay([0]);      // middle
  const e = pickRelay([2, 3]);   // exit
  if (!g || !m || !e) return false;
  // 訊息跟著這條弧線活。ttl 只當保險絲，真正的收場是弧線飛完時由 updateCircuits 收掉。
  // 用 setTimeout 的真實時間去對弧線的模擬時間會對不齊，慢的裝置上訊息會先消失。
  c.msg = notify(hopsHTML(g, m, e), 30000);
  const pos = c.geo.attributes.position.array;
  const half = CIRC_SEG >> 1;
  arcInto(g, m, pos, 0, half);
  arcInto(m, e, pos, half, CIRC_SEG - half);
  c.geo.attributes.position.needsUpdate = true;
  c.geo.setDrawRange(0, CIRC_SEG);
  return true;
}

function updateCircuits(dt) {
  if (!circuits.length) return;
  for (const c of circuits) {
    c.t += dt;
    if (c.state === 'wait') {
      if (c.t >= c.wait) {
        c.t = 0;
        c.state = spawnCircuit(c) ? 'fly' : 'wait';
        if (c.state === 'wait') c.wait = 2;
      }
    } else if (c.state === 'fly') {
      const p = c.t / CIRC_FLY;
      c.uHead.value = p;
      c.uAlpha.value = Math.min(1, c.t / 0.35); // 起手淡入，不要憑空出現
      if (p >= 1) { c.state = 'fade'; c.t = 0; }
    } else {
      // 淡出時讓頭部繼續往前跑一小段，尾巴才會自己收掉，不是整條一起消失
      c.uHead.value = 1 + c.t / CIRC_FADE * 0.2;
      c.uAlpha.value = Math.max(0, 1 - c.t / CIRC_FADE);
      if (c.t >= CIRC_FADE) {
        c.state = 'wait'; c.t = 0;
        c.uAlpha.value = 0;
        c.geo.setDrawRange(0, 0);
        if (c.msg && c.msg._drop) c.msg._drop();
        c.msg = null;
        c.wait = CIRC_GAP[0] + Math.random() * (CIRC_GAP[1] - CIRC_GAP[0]);
      }
    }
  }
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
// 點位取樣用的亂數。刻意不是 Math.random：每次重新整理都換一組位置的話，同一個國家的
// 點會整片跳動，而且畫面完全無法比對（先前想量呼吸效果時，同一時間截兩次就有三成像素
// 不同，全是這裡造成的）。固定種子之後每次載入都畫在一樣的位置。
let dotSeed = 20260726;
const dotRnd = () => (dotSeed = (dotSeed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

function sampleIn(a, out) {
  if (a.rings) {
    for (let t = 0; t < 24; t++) {
      const lon = a.bb[0] + dotRnd() * a.bb[2];
      const lat = a.bb[1] + dotRnd() * a.bb[3];
      if (inRings(a.rings, lon, lat)) { out[0] = lat; out[1] = lon; return out; }
    }
  }
  out[0] = a.ll[0] + (dotRnd() + dotRnd() - 1) * (a.jlat || 1);
  out[1] = a.ll[1] + (dotRnd() + dotRnd() - 1) * (a.jlon || 1.4);
  return out;
}

// 群聚版留著備用：把散布半徑改成照台數算，一國一團。
function sampleCluster(a, n, out) {
  const c = a.cl || a.ll;
  const rad = clusterRadiusDeg(n);
  const ang = dotRnd() * Math.PI * 2;
  const rr = Math.sqrt(dotRnd()) * rad; // 開根號才會在圓內均勻分布，不會往中心擠
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
    // cc 帶著走，訊息串要拿它顯示三跳落在哪幾國
    groups[role].push({ x: tmp.x, y: tmp.y, z: tmp.z, s: relaySize(w), cc: country });
    total++;
  }
  if (!total) return 0;
  // 打散每一組的順序。遠看時只畫前面一段，順序照國別排的話會變成整個國家消失，
  // 打散之後前面一段就是全球各地的均勻抽樣。用固定種子，每次載入的樣本一致。
  for (const list of groups) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = (dotRnd() * (i + 1)) | 0;
      const t = list[i]; list[i] = list[j]; list[j] = t;
    }
  }

  // 8 面的八面體在遠看時還過得去，放大之後就是一顆一顆的菱形方塊，稜線清清楚楚。
  // 細分一階變 32 面，配上光暈看起來就是圓的了。9,889 個 instance 共用一份幾何，
  // 面數從 8 變 32 是 30 萬個三角形，仍在單一 draw call 裡，代價可以接受。
  const geo = new THREE.OctahedronGeometry(1, 1);
  const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: true });
  mat.opacity = REDUCED ? 1 : 0; // 載入時從 0 淡入
  // 每顆點以自己的節奏緩慢明暗，像遠處的城市燈火，不是整批一起閃。
  //
  // 走 colorNode 是刻意的：NodeMaterial 的 colorNode 跟 instanceColor 是相乘，角色色相
  // 不受影響。反過來 opacityNode 會整個蓋掉 .opacity（是互斥的 if/else 不是相乘），
  // 而 animate() 每幀都在寫 m.opacity 做淡入與 LOD，碰了那個屬性這兩件事會靜靜失效。
  //
  // 振幅只往暗處走，上限就是今天的基準值。這樣單顆點的峰值亮度不會超過已經調過、
  // 已知不過曝的水準，等於用數學把 bloom 過曝的風險直接排除，不必賭實測。
  if (!REDUCED) {
    const seed = hash(instanceIndex);
    // rate 是角速度不是頻率，週期等於 2π/rate。第一版寫 0.10 以為是 0.1 Hz，
    // 實際上是 63 秒才一個循環，看起來就是完全不動。0.6 到 1.1 對應 6 到 10 秒。
    const rate = float(0.6).add(seed.mul(0.5));
    const wave = clockT.mul(rate).add(seed.mul(6.283)).sin().mul(0.5).add(0.5);
    // 振幅開到 0.3。點只有幾個像素寬、相位又各自不同，振幅小於一半在畫面上等於沒做
    // （第一版 0.78 到 1.0 完全看不出來）。上限仍鎖在 1.0，不會比現在更亮。
    const amt = mix(float(0.3), float(1.0), wave);
    mat.colorNode = vec3(amt, amt, amt);
  }
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
    dotGroups.push({ mesh, list });
  }
  return total;
}

// 依鏡頭距離重算每顆點的大小。位置照原樣寫回去，只有 scale 跟著係數變。
function rescaleDots(k) {
  if (!dotGroups.length || Math.abs(k - lastDotK) < DOT_STEP) return;
  lastDotK = k;
  const m4 = new THREE.Matrix4();
  for (const g of dotGroups) {
    for (let i = 0; i < g.list.length; i++) {
      const n = g.list[i];
      const s = n.s * k;
      m4.makeScale(s, s, s);
      m4.setPosition(n.x, n.y, n.z);
      g.mesh.setMatrixAt(i, m4);
    }
    g.mesh.instanceMatrix.needsUpdate = true;
  }
}

// 依鏡頭距離決定畫幾個點。f 是比例，1 代表全部畫出來。
function setDotCount(f) {
  if (!dotGroups.length || Math.abs(f - lastCountF) < 0.01) return;
  lastCountF = f;
  for (const g of dotGroups) {
    // 至少留一個，不然只有一兩台中繼的國家會在遠看時整個不見
    g.mesh.count = Math.max(Math.min(g.list.length, 1), Math.ceil(g.list.length * f));
  }
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
      + `<span class="n">${S('rowExit', { pct: exitPct({ r, t }) })}</span></div>`;
  }).join('');
  const byExit = [...rows].sort((a, b) => exitPct(b) - exitPct(a));
  const fmt = (x) => `${x.cc.toUpperCase()} ${exitPct(x)}%`;
  const note = $('mix-note');
  if (note) {
    note.textContent = S('noteMix', {
      hi: byExit.slice(0, 3).map(fmt).join(S('listSep')),
      lo: byExit.slice(-3).reverse().map(fmt).join(S('listSep')),
    });
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
let TORUSERS = null, SHUTDOWNS = null, NETUSERS = null, BATHY = null;
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
  $('cc-sub').textContent = S('cardSub', { n: t.toLocaleString(), rank: CC_STATS.rankN.get(cc) });
  $('cc-bar').innerHTML = [2, 3, 1, 0]
    .map((i) => (r[i] ? `<span style="width:${(r[i] / t * 100).toFixed(1)}%;background:${roleHex(i)}"></span>` : ''))
    .join('');
  const pct = (x) => (x < 1 ? x.toFixed(2) : x.toFixed(1));
  $('cc-body').innerHTML =
    // 卡片會長到十幾行，能併一行的就別換行。三段各自很短，接起來還在一行內
    S('cardShare', {
      share: pct(t / CC_STATS.totalN * 100), w: pct(wShare), wrank: CC_STATS.rankW.get(cc),
      exit: Math.round(exitPct), all: Math.round(CC_STATS.exitShare * 100),
    })
    + versionPart(cc)
    + `<div class="cc-roles">`
    + [1, 3, 2, 0].map((k) => `<span class="chip" style="--c:${roleHex(k)}">${ROLE_NAME[k]} ${r[k].toLocaleString()}</span>`).join('')
    + `</div>`
    + usersLine(cc, t)
    + hostingLine(cc, t)
    + ooniLine(cc)
    + bridgeLine(cc)
    + shutdownLine(cc)
    + radarLine(cc)
    + cardNote(cc);
  card.hidden = false;
  stopSpin();
}

// 托管商：這一國的中繼實際上放在誰的機房。國界分散不等於機房分散。
function hostingLine(cc, total) {
  const a = SNAP_ASN && SNAP_ASN[cc];
  if (!a || !a.t || !a.t.length) return '';
  const [, name, n] = a.t[0];
  const pct = Math.round(n / total * 100);
  // 次要業者接在同一句裡。手機沒有 hover，藏進 title 等於藏起來
  const rest = a.t.slice(1).map(([id, nm, k]) => `${nm || id} ${k}`).join(S('listSep'));
  return `<div class="cc-sub2">` + S('cardHosting', { name: name || a.t[0][0], n, pct })
    + (rest ? S('cardHostingRest', { rest }) : '') + S('cardHostingAll', { n: a.n }) + `</div>`;
}

// 跑官方建議版本的台數。這是維運品質，跟佔比、權重同屬「這一國中繼的數字」，
// 短短一句自己佔一行太浪費，接在第一行結尾。
// 分數要附百分比，3037/3252 這種數字沒人心算得出來。
function versionPart(cc) {
  const v = SNAP_VER && SNAP_VER[cc];
  if (!v || !v[0]) return '';
  return S('cardVersion', { ok: v[1], tot: v[0], pct: Math.round(v[1] / v[0] * 100) });
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
  // 成因的免責統一收在卡片末尾那行，不逐項重複
  return `<div class="cc-sub2${blocked ? ' warn' : ' dim'}">`
    + S('cardOoni', { days: OONI.days, n: m.toLocaleString(), pct: val })
    + (blocked ? S('cardOoniBlocked') : '') + `</div>`;
}

// 這一國有多少人在用。中繼數是供給端，這是需求端，兩個數字擺在一起才看得出落差。
// 這一國有多少人上網。用途是給上面那個 Tor 使用者數當脈絡：兩國的 Tor 人數差很多時，
// 先看得出來是不是單純因為一邊上網的人本來就少。
//
// 刻意只呈現比例，不換算成「每十萬上網人口有幾人用 Tor」。Tor 的人數本身是估計值，
// 信心區間寬到上下差好幾倍，除以人口之後不確定性一點都沒少，卻會長得像一個精確的比值。
// 分子分母各自呈現，讓讀的人自己拿捏，比端出一個假精確的數字誠實。
//
// 回傳 [片語, 是否來自替代來源]。台灣走的是 alt 那條，World Bank 沒有收錄台灣。
function netPctLine(cc) {
  if (!NETUSERS) return null;
  const main = NETUSERS.pct && NETUSERS.pct[cc];
  if (main) return [S('cardNetPct', { pct: main[0], year: main[1] }), false];
  const alt = NETUSERS.alt && NETUSERS.alt.pct && NETUSERS.alt.pct[cc];
  // 機關名走 i18n，不要直接內插 NETUSERS.alt.source。那個欄位是資料檔裡寫死的繁中，
  // 內插進去英文版會變成一句英文中間夾一段繁體中文的機關名。
  if (alt) return [S('cardNetPctAlt', { pct: alt[0], year: alt[1], src: S('netAltSource') }), true];
  return null;
}

// 措辭要留住「估計」兩個字，Tor Metrics 是用中繼收到的目錄請求反推的，信心區間很寬
// （台灣 10,585 人的區間是 3,722 到 21,578），寫成確定數字是騙人的。
function usersLine(cc, relays) {
  if (!TORUSERS || !TORUSERS.users) return '';
  const u = TORUSERS.users[cc];
  if (!u) return '';
  const [cur, avg] = u;
  // 每台中繼「服務」多少使用者。這不是真的負載，只是兩個數字的比值，用來凸顯落差。
  const per = relays ? Math.round(cur / relays) : 0;
  const net = netPctLine(cc);
  return `<div class="cc-sub2">`
    + S('cardUsers', { n: cur.toLocaleString(), days: TORUSERS.days, avg: avg.toLocaleString() })
    + (per ? S('cardUsersPer', { n: per.toLocaleString() }) : '')
    + (net ? net[0] : '') + `</div>`;
}

// 這一國的人用什麼方式繞過封鎖。跟 ooni.json 那層是一組的：OONI 說連不上，這裡說改用什麼。
const PT_NAME = { '<OR>': null, obfs4: 'obfs4', obfs3: 'obfs3', snowflake: 'snowflake', webtunnel: 'webtunnel', meek: 'meek', conjure: 'conjure' };
function bridgeLine(cc) {
  if (!TORUSERS || !TORUSERS.bridge) return '';
  const b = TORUSERS.bridge[cc];
  if (!b || !b.length) return '';
  const list = b.map(([t, n]) =>
    `<span class="chip2">${(t === '<OR>' ? S('ptPlain') : (PT_NAME[t] || t))} ${n.toLocaleString()}</span>`).join('');
  return `<div class="cc-sub2 bridges">${S('cardBridge')}${list}</div>`;
}

// 這一國被整個關掉過幾次，以及理由。
// Conflict 與 Communal violence 未必是政府主動決策（可能是戰事打壞基礎設施），
// 資料裡分開算過，這裡只把「資訊管制類」的件數單獨講出來，不把全部件數講成政府封鎖。
// 成因的中譯。值是 i18n 的 key，實際字串由語言表決定。
const CAUSE_KEY = {
  'Conflict': 'causeConflict', 'Protests': 'causeProtests', 'Information control': 'causeInfo',
  'Communal violence': 'causeCommunal', 'Exam cheating': 'causeExam',
  'Visits by government officials': 'causeVisit', 'Elections': 'causeElection',
  'Other': 'causeOther', 'Unknown': 'causeUnknown',
};
function shutdownLine(cc) {
  if (!SHUTDOWNS || !SHUTDOWNS.cc) return '';
  const s = SHUTDOWNS.cc[cc];
  if (!s) return '';
  const [n, ctl, year, causes] = s;
  const top = Object.entries(causes || {}).slice(0, 3)
    .map(([k, v]) => `${(CAUSE_KEY[k] ? S(CAUSE_KEY[k]) : k)} ${v}`).join(S('listSep'));
  const [y0] = SHUTDOWNS.years || [];
  return `<div class="cc-sub2 warn">`
    + (y0 ? S('cardShutdownHead', { y0 }) : '') + `<b>${n}</b>` + S('cardShutdownN')
    + (year ? S('cardShutdownYear', { y: year }) : '')
    + (ctl ? S('cardShutdownCtl', { n: ctl }) : '')
    + (top ? S('cardShutdownTop', { top }) : '') + `</div>`;
}

// 三份資料各自的但書收成一行。逐項標註會讓每一類都多佔一行，卡片就是這樣長起來的。
// 這些話不能省：人數是估計值、OONI 的異常不等於審查、武裝衝突類的關閉未必是政府下令。
function cardNote(cc) {
  const bits = [];
  if (TORUSERS && TORUSERS.users && TORUSERS.users[cc]) bits.push(S('cardNoteUsers'));
  // 上網比例走替代來源的那幾筆（目前只有台灣）要講一句，方法論跟其他國家不同。
  const net = netPctLine(cc);
  if (net && net[1] && TORUSERS && TORUSERS.users && TORUSERS.users[cc]) bits.push(S('cardNoteNetAlt'));
  if (OONI && OONI.cc && OONI.cc[cc]) bits.push(S('cardNoteOoni'));
  if (SHUTDOWNS && SHUTDOWNS.cc && SHUTDOWNS.cc[cc]) bits.push(S('cardNoteShutdown'));
  return bits.length ? `<div class="cc-sub2 tiny dim">${bits.join('。')}。</div>` : '';
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
    ? extLink(RADAR + top[0].toLowerCase(), top[1] || top[0], S('cardRadarTipAs'))
    : '';
  return `<div class="cc-sub2 dim ext">${S('cardRadar')}<span class="tiny">${S('cardRadarOff')}</span>${S('backendSep')}`
    + extLink(RADAR + cc, cc.toUpperCase(), S('cardRadarTipCc'))
    + (asLink ? `、${asLink}` : '') + `</div>`;
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
    if (MODE_ROLE[el.dataset.mode] !== undefined) el.title = on ? S('roleTipAll') : S('roleTipOne');
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
    note.innerHTML = S('noteAsn', { n: snap.asnCount || '?', pct: (top3 / tot * 100).toFixed(1) })
      + (v && v[0] ? S('noteAsnVer', { pct: Math.round(v[1] / v[0] * 100) }) : '');
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
      + `<span class="n">${a ? S('rowProviders', { n: a.n }) : ''}${conc !== null ? S('rowTopShare', { pct: conc }) : ''}</span></div>`;
  }).join('');
}

// OONI 觀測到 Tor 連線大量失敗的國家，一併把該國的中繼數擺出來。
// 這一塊的重點是兩個獨立來源撞在一起的那個結果：連不上 Tor 的地方，也幾乎沒有人在那裡跑中繼。
// 條的長度用異常率，數字給中繼數，讓「條很長、數字是 0」自己說話。
function fillOoni(snap) {
  const box = $('stat-ooni');
  if (!box || !OONI || !OONI.blocked || !OONI.blocked.length) {
    const t = $('lbl-ooni');
    if (t) t.hidden = true;   // 資料缺就連標題一起收掉，不要留空區塊
    return;
  }
  const cnt = new Map(snap.countries || []);
  box.innerHTML = OONI.blocked.map((cc) => {
    const o = OONI.cc[cc];
    const pct = o[1] / o[0] * 100;
    const n = cnt.get(cc) || 0;
    return `<div class="mix-row"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${Math.round(pct)}%</span>`
      + `<span class="mix-bar"><span style="width:${pct.toFixed(1)}%;background:${'#' + COL.blocked.toString(16)}"></span></span>`
      + `<span class="n">${S('rowRelays', { n: n.toLocaleString() })}</span></div>`;
  }).join('');
  const note = $('ooni-note');
  if (!note) return;
  const all = OONI.all || [0, 0];
  // 措辭要停在「沒有照預期完成」。這個比率沒辦法區分審查、網路不穩與 ISP 故障，
  // 寫成封鎖率就是拿雜訊指控特定國家。
  // 門檻寫死在文案裡，改了 gen_ooni_snapshot.py 的 BLOCK_PCT 就會對不上，所以讀資料裡的值
  note.innerHTML = S('noteOoni', {
    days: OONI.days, thr: OONI.blockPct, avg: (all[1] / all[0] * 100).toFixed(0),
  });
}

// 使用者最多的國家，對照該國的中繼數。跟 fillOoni 那塊相反：那邊講「連不上的地方」，
// 這邊講「用的人最多的地方」，兩塊合起來才是完整的需求面。
function fillUsers(snap) {
  const box = $('stat-users');
  if (!box || !TORUSERS || !TORUSERS.users) {
    const t = $('lbl-users');
    if (t) t.hidden = true;   // 資料缺就連標題一起收掉，不要留空區塊
    return;
  }
  const cnt = new Map(snap.countries || []);
  const rows = Object.entries(TORUSERS.users).sort((a, b) => b[1][0] - a[1][0]).slice(0, 8);
  if (!rows.length) return;
  const max = rows[0][1][0];
  box.innerHTML = rows.map(([cc, [cur]]) => {
    const hi = cc === 'tw' ? ' hi' : '';
    return `<div class="mix-row${hi}"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${cur.toLocaleString()}</span>`
      + `<span class="mix-bar"><span style="width:${(cur / max * 100).toFixed(1)}%;background:${MODES.users.hi}"></span></span>`
      + `<span class="n">${S('rowRelays', { n: (cnt.get(cc) || 0).toLocaleString() })}</span></div>`;
  }).join('');
  const note = $('users-note');
  if (!note) return;
  const tw = TORUSERS.users.tw;
  // 中文用「萬」、英文用 million，兩個單位都傳進去讓各語言的句型自己挑。
  // 早先只傳一個 wan 而且多除了一次 100，畫面上把 308 萬寫成 3.08 萬，差一百倍。
  note.innerHTML = S('noteUsers', {
    wan: Math.round(TORUSERS.usersAll / 10000),
    mil: (TORUSERS.usersAll / 1e6).toFixed(1),
    date: TORUSERS.date,
  })
    + (tw ? S('noteUsersTw', { n: tw[0].toLocaleString(), relays: cnt.get('tw') || 0 }) : '')
    + S('noteUsersTail');
}

// 被整個關掉過的地方。這份資料的成因是人工查證後標註的，比測量類的異常率乾淨，
// 所以敢直接講「發生過什麼」。但件數多寡也反映了有沒有人在盯，沒人盯的地方不代表沒發生。
function fillShutdowns() {
  const box = $('stat-shutdown');
  if (!box || !SHUTDOWNS || !SHUTDOWNS.cc) {
    const t = $('lbl-shutdown');
    if (t) t.hidden = true;   // 資料缺就連標題一起收掉，不要留空區塊
    return;
  }
  const rows = Object.entries(SHUTDOWNS.cc).sort((a, b) => b[1][0] - a[1][0]).slice(0, 7);
  if (!rows.length) return;
  const max = rows[0][1][0];
  box.innerHTML = rows.map(([cc, [n, , year]]) => {
    return `<div class="mix-row"><span class="cc">${cc.toUpperCase()}</span>`
      + `<span class="tot">${S('rowTimes', { n })}</span>`
      + `<span class="mix-bar"><span style="width:${(n / max * 100).toFixed(1)}%;background:#e0663a"></span></span>`
      + `<span class="n">${S('rowLatest', { y: year || '—' })}</span></div>`;
  }).join('');
  const note = $('shutdown-note');
  if (!note) return;
  const [y0, y1] = SHUTDOWNS.years || [];
  const c = SHUTDOWNS.causesAll || {};
  const pick = (k) => c[k] || 0;
  note.innerHTML = S('noteShutdown', {
    y0, y1, total: SHUTDOWNS.total,
    conflict: pick('Conflict'), protest: pick('Protests'), info: pick('Information control'),
    exam: pick('Exam cheating'), visit: pick('Visits by government officials'),
  });
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
  $('stat-pub').textContent = (snap.published || '').replace(' ', ' · ') + ' UTC'
    + (snap.live ? S('liveTag') : '');
  const br = snap.byRole || {};
  const modeOf = { 0: 'middle', 1: 'guard', 2: 'exit', 3: 'both' };
  $('stat-role').innerHTML = [1, 3, 2, 0].map((k) =>
    `<span class="chip act" role="button" tabindex="0" data-mode="${modeOf[k]}" style="--c:${roleHex(k)}">${ROLE_NAME[k]} ${(br[k] || 0).toLocaleString()}</span>`
  ).join('');
  // 地球上畫出來的台數少於總數時要講清楚，別讓人以為每一台都在畫面上
  const miss = snap.total - drawn;
  if (drawn && miss > 0) {
    $('gap').textContent = miss <= (snap.noPlace || 0) + 5
      ? S('gapNoPlace', { n: miss })
      : S('gapPartial', { drawn: drawn.toLocaleString(), miss: miss.toLocaleString() });
  }
}

// ---- 即時更新 ----
//
// 預設讀站上的靜態快照，完全不對外連線。這個功能要使用者自己按下去才會動，因為按下去
// 等於把他的 IP 送到 onionoo.anoni.net，在一個講隱私的站上，這件事要他自己決定，
// 按鈕旁邊也直接寫明會連到哪裡。
//
// 只做中繼這一份。海纜、國界是幾乎不動的資料，OONI 是 30 天滾動視窗、使用者估計是
// 每日更新，即時抓都沒有意義，而且 api.ooni.org 沒有回 Access-Control-Allow-Origin，
// 前端本來就打不到。
const LIVE_API = 'https://onionoo.anoni.net/v1/details';
const LIVE_FIELDS = 'country,flags,consensus_weight,as,as_name,recommended_version';
// 這三個要跟 tools/gen_tor_snapshot.py 的同名常數一致，不然即時跟靜態兩份會長得不一樣
const AS_TOP_PER_COUNTRY = 3, AS_TOP_GLOBAL = 15, AS_NAME_MAX = 26;

// .onion 與 IPFS 版本不給這個按鈕。onion 上打 clearnet 端點會脫離 onion 的保護範圍，
// IPFS 版本的定位是離線也能看，對外連線跟那個定位相衝。
function liveAllowed() {
  const h = location.hostname || '';
  if (h.endsWith('.onion')) return false;
  if (/(^|\.)ipfs\.|(^|\.)ipns\.|\.eth\.(link|limo)$/.test(h)) return false;
  if (/^\/(ipfs|ipns)\//.test(location.pathname)) return false; // 公開網關的路徑式位址
  return true;
}

// AS 的註冊名稱不一定是公司。個人申請的 AS 登記的就是持有人本名，把它印在畫面上等於
// 公告「這個人在這個國家跑中繼」。判斷刻意設成「預設當個人」：找不到機構線索又長得像
// 人名就不用名稱，退回顯示 AS 號碼。這份規則要跟 tools/gen_tor_snapshot.py 保持一致，
// 那邊是靜態快照的入口，這邊是「即時更新」的入口，漏掉任何一邊名字都會回到畫面上。
const ORG_HINT = /(\b(gmbh|ltd|llc|inc|corp|co|company|limited|holding|group|ag|a\/s|as|ab|oy|oyj|ehf|b\.?v|n\.?v|s\.?a|s\.?r\.?l|s\.?r\.?o|sas|sarl|sia|ou|kft|zrt|spa|srl|se|plc|lp|llp|pty|pte|sdn|bhd|pt|kk|gk|shpk|d\.?o\.?o|tic|san|doo|aps)\b|network|net|hosting|host|server|cloud|data|internet|telecom|telekom|comm|system|solution|technolog|service|digital|media|computer|broadband|cyber|online|infra|colo|datacenter|carrier|isp|exchange|vpn|proxy|web|domain|register|telefon|mobile|wireless|fiber|fibre|satellite|transit|peering|telephone|distance|global|connectivity|bilisim|servicos|platform|foundation|forening|stiftung|association|society|club|universit|institut|research|academ|school|college|library|museum|church|ministry|government|council|agency|bureau|authority|federation|union|alliance|coalition|cooperative|collective|project|initiative|lab|team|community|nonprofit|ngo|trust|fund|amendment|liberty|freedom|privacy|rights|frihet|digitala|\d)/i;
function isPersonName(name) {
  const s = (name || '').trim();
  if (!s) return false;
  if (s.toLowerCase().includes('trading as')) return true;
  if (ORG_HINT.test(s)) return false;
  // 不設詞數上限，理由同 gen_tor_snapshot.py：人名長度沒有上限
  const w = s.split(/\s+/);
  return w.length > 1 && w.every((x) => x && x[0] === x[0].toUpperCase());
}

// 把逐台資料聚合成跟 snapshot.json 同構的物件。欄位定義照 tools/gen_tor_snapshot.py，
// 那支腳本改了輸出格式，這裡要跟著改。
function aggregateLive(relays, published) {
  const out = [], rc = {};
  const cnt = new Map(), asByCC = new Map(), asGlobal = new Map();
  const asNames = new Map(), verByCC = new Map();
  for (const r of relays) {
    const cc = (r.country || '??').toLowerCase();
    cnt.set(cc, (cnt.get(cc) || 0) + 1);
    if (NO_PLACE.has(cc)) continue;   // 地球上沒有位置可放
    const fl = r.flags || [];
    const role = (fl.indexOf('Exit') >= 0 ? 2 : 0) + (fl.indexOf('Guard') >= 0 ? 1 : 0);
    out.push([cc, role, r.consensus_weight | 0]);
    rc[role] = (rc[role] || 0) + 1;
    const asn = r.as;
    if (asn) {
      let m = asByCC.get(cc);
      if (!m) asByCC.set(cc, m = new Map());
      m.set(asn, (m.get(asn) || 0) + 1);
      asGlobal.set(asn, (asGlobal.get(asn) || 0) + 1);
      if (r.as_name && !asNames.has(asn) && !isPersonName(r.as_name)) asNames.set(asn, String(r.as_name).slice(0, AS_NAME_MAX));
    }
    let v = verByCC.get(cc);
    if (!v) verByCC.set(cc, v = [0, 0]);
    v[0]++;
    if (r.recommended_version) v[1]++;
  }
  const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  const asn = {};
  for (const [cc, m] of asByCC) {
    asn[cc] = { t: top(m, AS_TOP_PER_COUNTRY).map(([a, n]) => [a, asNames.get(a) || '', n]), n: m.size };
  }
  const version = {};
  let vTotal = 0, vRec = 0;
  for (const [cc, v] of verByCC) { version[cc] = v; vTotal += v[0]; vRec += v[1]; }
  const countries = [...cnt.entries()].sort((a, b) => b[1] - a[1]);
  let noPlace = 0;
  for (const [cc, n] of countries) if (NO_PLACE.has(cc)) noPlace += n;
  return {
    published, source: 'onionoo.anoni.net', live: true,
    total: relays.length, sampled: out.length, noPlace,
    byRole: rc, topCountries: countries.slice(0, 20), countries,
    asn, asnTop: top(asGlobal, AS_TOP_GLOBAL).map(([a, n]) => [a, asNames.get(a) || '', n]),
    asnCount: asGlobal.size, version, versionAll: [vTotal, vRec], relays: out,
  };
}

// 用新的快照重畫。舊的中繼點與標籤要先清乾淨，不然會疊在上面愈積愈多。
function applySnapshot(snap) {
  // 材質一定要 dispose。只清 geometry 不夠：renderer 內部是把完整的 GPU 清除掛在
  // material 的 dispose 事件上，geometry 的 dispose 只會清掉快取的 attribute 參照，
  // pipeline 與 bindings 仍留著。這個函式每按一次「即時更新」就跑一遍，漏掉會累積。
  // 四個角色共用同一份 geometry 與 material，各自 dispose 一次就好。
  for (const m of relayMeshes) {
    globe.remove(m);
    m.dispose();                       // InstancedMesh 自己的 instanceMatrix / instanceColor
  }
  if (relayMeshes.length && relayMeshes[0].geometry) relayMeshes[0].geometry.dispose();
  for (const mat of pointMats) mat.dispose();
  relayMeshes.length = 0;
  pointMats.length = 0;
  dotGroups.length = 0;
  lastDotK = 1;
  lastCountF = -1;
  const box = $('labels');
  if (box) box.innerHTML = '';
  labels.length = 0;

  const counts = countryCounts(snap);
  // ANCHOR 不重建，國家位置本來就不會變。relaxClusters 也跳過，那是依台數推開團的位置，
  // 一次更新的台數變化推不動它，重跑只是白花時間。
  const drawn = buildRelays(snap, counts);
  for (const m of pointMats) m.opacity = 1; // 更新是使用者按出來的，不需要再淡入一次
  buildLabels(snap);
  buildStats(snap);
  fillPanel(snap, drawn);
  fillMix(snap);
  fillAsn(snap);
  fillAsia(snap);
  fillUsers(snap);
  setMode(MODE); // 色階、標籤數字、角色顯示都在這裡一起更新
}

async function fetchLive(btn) {
  const status = $('live-status');
  // live-box 只裝狀態文字，沒東西時不要先佔一段空白，第一次有狀態才露出來
  const say = (t, cls) => {
    if (!status) return;
    status.textContent = t;
    status.className = cls || '';
    const box = $('live-box');
    if (box) box.hidden = false;
  };
  btn.disabled = true;
  say(S('liveConnecting'));
  try {
    const url = `${LIVE_API}?running=true&limit=20000&fields=${encodeURIComponent(LIVE_FIELDS)}`;
    // 不送 cookie 也不送 referrer，這個請求只需要拿公開資料，沒有理由多給對方任何東西
    const r = await fetch(url, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!r.ok) throw new Error(S('liveHttp', { code: r.status }));
    const d = await r.json();
    const relays = d.relays || [];
    if (!relays.length) throw new Error(S('liveNoData'));
    applySnapshot(aggregateLive(relays, d.relays_published));
    say(S('liveOk', { n: relays.length.toLocaleString() }), 'ok');
  } catch (e) {
    console.error(e);
    // 被跨來源擋下時 fetch 丟的是 TypeError，訊息只有含糊的 Failed to fetch，
    // 直接把它翻成看得懂的說法，不要讓使用者對著一句英文乾瞪眼。
    const msg = /Failed to fetch|NetworkError|Load failed/i.test(e.message)
      ? S('liveFailNet') : e.message;
    say(S('liveFail', { msg }), 'err');
  } finally {
    btn.disabled = false;
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
  updateSun(); // 直射點每小時移 15 度，每幀重算的成本是幾個三角函數，不值得另外做節流
  camera.position.z += (targetDist() - camera.position.z) * 0.12;
  camera.lookAt(0, 0, 0);
  if (pointsIn < 1) pointsIn = Math.min(1, pointsIn + dt / 1.2); // 點層淡入
  // 遠看時歐洲十幾個國家團擠在很小的螢幕範圍內，怎麼排都糊。讓點隨距離退成底噪，
  // 陸地色階與國家標籤接手講「集中在哪」，放大之後再把個別中繼交出來。
  // 只動透明度。instance 的位置烘在矩陣裡，改 mesh.scale 會把位置一起縮，點會縮進地球中心不見。
  const lod = clamp((ZOOM_MAX - view.zoom) / (ZOOM_MAX - 0.7), 0, 1);
  const wantOp = pointsIn * (0.5 + 0.5 * lod);
  for (const m of pointMats) m.opacity = wantOp;
  rescaleDots(Math.pow(view.zoom, DOT_EXP)); // zoom 是相對於完整入鏡的倍率，愈小代表鏡頭愈近
  clockT.value += dt; // 呼吸與極光共用。REDUCED 時兩者都沒掛上去，推了也沒作用
  updateCircuits(dt);
  setDotCount(SAMPLE_MIN + (1 - SAMPLE_MIN) * Math.pow(lod, SAMPLE_EXP)); // 遠看抽樣，放大逐步補齊
  updateLabels();
  try {
    await post.renderAsync();
  } catch (e) {
    console.error(e); fatal(S('fatalRender')); renderer.setAnimationLoop(null);
  }
}

async function main() {
  applyI18n();
  const ok = await initRenderer();
  if (!ok) return;
  const [snap, world, coast, cables, ooni, torusers, shutdowns, netusers, bathy] = await Promise.all([
    getJSONAsset('snapshot.json', { cache: 'no-cache' }), // 定期重生，每次載入都向 server 驗證新鮮度
    getJSON('./countries.json'),
    getJSON('./continents.json').catch(() => null), // 海岸線可選，抓不到就略過
    getJSON('./cables.json').catch(() => null),     // 海底電纜可選
    getJSON('./ooni.json').catch(() => null),       // OONI 觀測可選
    // 跟 snapshot 一樣帶 no-cache。assets 回的是 max-age=43200，瀏覽器會把這份快取十二小時，
    // 但它每天更新，不驗證的話使用者會看到過期的數字。代價是每次載入多一個 304 往返。
    getJSONAsset('torusers.json', { cache: 'no-cache' }).catch(() => null), // 使用者面可選，定期重生
    getJSON('./shutdowns.json').catch(() => null),  // 斷網事件可選
    getJSON('./netusers.json').catch(() => null),   // 上網人口比例可選。一年才動一次，跟站台一起發布
    getJSON('./bathymetry.json').catch(() => null), // 海底地形可選，抓不到海面就退回單色
  ]);
  OONI = ooni;
  TORUSERS = torusers;
  SHUTDOWNS = shutdowns;
  NETUSERS = netusers;
  BATHY = bathy;   // 要在 buildEarth 之前設好，貼圖是那時候畫的
  if (TORUSERS && TORUSERS.users) {
    USERS_MAP = new Map(Object.entries(TORUSERS.users).map(([cc, v]) => [cc, v[0]]));
    const b = $('btn-users');
    if (b) b.hidden = false; // 沒抓到資料就不要露出一個按了會空白的按鈕
  }
  const counts = countryCounts(snap);
  buildSky();                      // 星空要先鋪，後面的東西才像在太空裡
  buildEarth(world, counts);
  buildCurrents();                 // 大洋環流。壓在海纜之下，海面的底層質感
  if (cables) buildCables(cables); // 先畫電纜，海岸線疊在上面
  buildTrunks();                   // 走廊示意線，補 OSM 在大洋中段的空白
  buildBorders(world);             // 國界要在海岸線之前畫，重疊處讓海岸線蓋在上面
  if (!REDUCED) buildAurora();     // 極光是純動態效果，靜止的簾幕沒有意義，REDUCED 時整個不建
  buildAtmosphere();               // 邊緣輝光。畫在最外層，renderOrder 已指定
  if (coast) buildCoastline(coast);
  if (SHOW_DOTS) relaxClusters(counts); // 不畫點就不用推開團，標籤留在國家中心比較準
  const drawn = buildRelays(snap, counts);
  buildLabels(snap);
  if (!REDUCED) buildCircuits(); // 要在 buildRelays 之後，端點是從 dotGroups 挑的
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
  // 即時更新的按鈕從一開始就在位子上，只是停用著，等這裡才放行。
  // 版面不會在載入完成的瞬間跳一下，使用者也一開始就知道有這個功能。
  // onion 與 IPFS 版本整顆收掉，那兩種情境下連出去會把 IP 交出去，違背使用者選它的理由。
  // 按鈕在 summary 裡跟收合鈕並排，狀態文字與隱私說明留在面板內文。
  const liveBtn = $('btn-live');
  if (liveBtn && liveAllowed()) {
    liveBtn.disabled = false;
    liveBtn.removeAttribute('title');
    liveBtn.addEventListener('click', (e) => {
      // summary 底下的點擊預設會開合 details，按這顆鍵不應該連帶把面板收起來
      e.preventDefault();
      e.stopPropagation();
      // 狀態文字（連線中、已更新、失敗原因）在面板內文裡，收合時看不到，
      // 按了會像沒反應。先展開再取資料。
      // 這裡不必自己叫 refreshUIBoxes，設 open 會觸發 toggle，那邊已經掛了。
      const info = $('info');
      if (info && !info.open) info.open = true;
      fetchLive(liveBtn);
    });
  } else if (liveBtn) {
    liveBtn.hidden = true;
  }
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
main().catch((e) => { const l = $('loading'); if (l) l.classList.add('done'); console.error(e); fatal(S('fatalLoad')); });
