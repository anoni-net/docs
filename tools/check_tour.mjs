#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」的工作坊導覽走得完，而且接線沒有斷。
 *
 * === 這是什麼 ===
 *
 * 導覽是給工作坊與教學現場用的：按一次空白鍵往下一站，七站講完整顆地球儀。使用的
 * 場合通常沒有網路，而且畫面正投在牆上，中途卡住沒有第二次機會。
 *
 * === 為什麼需要這支 ===
 *
 * 這個功能的失敗方式都很安靜：
 *
 *   DOM id 打錯       按鈕上沒有監聽器，按下去沒反應，主控台不會有任何訊息
 *   i18n 少一條        畫面上直接顯示 key 本身（tourTwBody），只有那個語系會遇到
 *   數字沒有插進去     文案留著 {total} 這種佔位符，投影出去很難看
 *   資料缺失沒有抽站   torusers.json 抓不到時停在一站空白畫面，講者要在台前解釋
 *   最後一站按不動     next 到底之後沒有收尾，等於困在導覽裡
 *
 * 前四種在有網路、資料齊全的本機一律看不出來。
 *
 * === 怎麼驗 ===
 *
 * tour.js 是為了這件事設計成純狀態機的：DOM 與相機的實際操作都由 api 傳進去，所以
 * 這裡塞一份假的 api 就能把七站走完，並且記下每一站到底叫了哪些操作。驗的是真程式碼。
 *
 * 模組用 data URL 載入，不靠 node 對副檔名的判斷。這個 repo 沒有 package.json，
 * .js 會不會被當成 ES module 隨 node 版本而異，data URL 一律當模組處理。
 *
 * 接線那半改用靜態比對：tour.js 取用的每個 id 在 index.html 裡都要有，atlas.js 要真的
 * 把 createTour 接起來，sw.js 的離線清單要收進 tour.js。這幾件事都是「漏了照樣建置成功」
 * 的類型。
 *
 * 用法：
 *   node tools/check_tour.mjs
 * 有問題時 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLAY = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play');
const read = (p) => fs.readFileSync(p, 'utf8');
const load = (p) => import('data:text/javascript;base64,' + Buffer.from(read(p)).toString('base64'));

const { STOPS, createTour } = await load(path.join(PLAY, 'tour.js'));
const { STR, t } = await load(path.join(PLAY, 'i18n.js'));
const html = read(path.join(PLAY, 'index.html'));
const atlas = read(path.join(PLAY, 'atlas.js'));
const sw = read(path.join(HERE, '..', 'docs', 'zh-TW', 'sw.js'));

const fail = [];
const ok = [];
const check = (cond, msg) => { (cond ? ok : fail).push(msg); };

// --- DOM 替身。目標是抓接線與狀態機的錯，不是重寫一個瀏覽器 ------------------

class El {
  constructor(id) {
    this.id = id;
    this.hidden = false;
    this.disabled = false;
    this._text = '';
    this._html = '';
    this.classes = new Set();
    this.listeners = {};
    this.focused = 0;
    this.height = 118; // 導覽列量得到的高度，桌機實測的量級
    this.classList = {
      add: (c) => this.classes.add(c),
      remove: (c) => this.classes.delete(c),
      contains: (c) => this.classes.has(c),
      toggle: (c, on) => (on ? this.classes.add(c) : this.classes.delete(c)),
    };
  }
  set textContent(v) { this._text = String(v); }
  get textContent() { return this._text; }
  set innerHTML(v) { this._html = String(v); }
  get innerHTML() { return this._html; }
  addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  click() { for (const fn of this.listeners.click || []) fn({ preventDefault() {}, stopPropagation() {} }); }
  focus() { this.focused++; dom.active = this; }
  getBoundingClientRect() { return { height: this.hidden ? 0 : this.height, width: 540 }; }
  closest(sel) { return sel === '#tour' && this.id.startsWith('tour') ? dom.byId.tour : null; }
}

const IDS = ['tour', 'tour-step', 'tour-title', 'tour-body', 'tour-next', 'tour-prev', 'tour-exit',
             'tour-keys', 'tour-note', 'btn-tour', 'btn-tour-hint', 'hint', 'info', 'cc-card'];

const dom = { byId: {}, active: null, keys: [], props: {} };
function resetDom() {
  dom.byId = {};
  for (const id of IDS) dom.byId[id] = new El(id);
  dom.byId.tour.hidden = true;
  dom.byId['cc-card'].hidden = true;
  dom.byId.info.open = true;
  dom.active = null;
  dom.keys = [];
  dom.props = {};
  globalThis.document = {
    body: { classList: dom.byId.tour.classList && new El('body').classList },
    documentElement: {
      style: {
        setProperty: (k, v) => { dom.props[k] = v; },
        removeProperty: (k) => { delete dom.props[k]; },
      },
    },
    get activeElement() { return dom.active; },
  };
  // body 的 class 要獨立一份，不能跟導覽列共用
  const bodyEl = new El('body');
  globalThis.document.body = bodyEl;
  globalThis.matchMedia = () => ({ matches: false });
  globalThis.addEventListener = (ev, fn) => { if (ev === 'keydown') dom.keys.push(fn); };
}

function makeApi(over = {}) {
  const log = { mode: [], fly: [], hide: 0, layout: 0, start: 0, stop: 0 };
  const api = {
    $: (id) => dom.byId[id] || null,
    S: (k, v) => t('zh-TW', k, v),
    setMode: (m) => log.mode.push(m),
    flyTo: (...a) => log.fly.push(a),
    hideCountry: () => { log.hide++; },
    stats: () => ({ total: '9,903', countries: 78, usN: '3,247', usPct: '15.1',
                    deN: '1,723', dePct: '26.2', twN: 11, twRank: 48, twPct: '<0.1',
                    blockedN: 7 }),
    available: () => ({ users: true, tw: true }),
    onLayout: () => { log.layout++; },
    onStart: () => { log.start++; },
    onStop: () => { log.stop++; },
    ...over,
  };
  return { api, log };
}

const press = (key, target) => {
  dom.active = target || null;
  let prevented = 0;
  for (const fn of dom.keys) fn({ key, preventDefault: () => { prevented++; } });
  return prevented;
};

// --- 站點腳本本身 ------------------------------------------------------------

check(STOPS.length === 7, `腳本有 ${STOPS.length} 站`);
check(STOPS.every((s) => s.id && s.t && s.b), '每一站都有 id 與兩條 i18n key');
check(new Set(STOPS.map((s) => s.id)).size === STOPS.length, '站的 id 沒有重複');
for (const s of STOPS) {
  if (!s.cam) continue;
  const [lat, lon, spanLat, spanLon] = s.cam;
  check(Math.abs(lat) <= 90 && Math.abs(lon) <= 180, `${s.id} 的取景座標在範圍內`);
  // 跨幅是「畫面要涵蓋多少度地表」，零或負數會讓 zoomForExtent 解出貼在地心的距離
  check(spanLat > 0 && spanLon > 0, `${s.id} 的取景跨幅是正數`);
}
check(STOPS[0].cam && STOPS[0].mode, '第一站同時定了取景與亮度，進場畫面才是確定的');

// --- 三個語系的文案都要齊 ----------------------------------------------------

const keys = [];
for (const s of STOPS) keys.push(s.t, s.b);
keys.push('btnTour', 'btnTourLong', 'tourNote', 'tourNext', 'tourPrev', 'tourDone', 'tourExit', 'tourKeys');
for (const lang of ['zh-TW', 'en', 'zh-cn']) {
  const miss = keys.filter((k) => STR[lang][k] == null);
  check(miss.length === 0, `${lang} 的導覽文案齊全${miss.length ? '：缺 ' + miss.join('、') : ''}`);
}
// 佔位符兩邊要對得上，某個語系少寫一個 {twN} 就是那個語系的數字不見了。
// 缺 key 的情況上面那一輪已經報過，這裡跳過，免得整支卡在例外上只剩一行堆疊。
const holes = (v) => [...new Set((String(v == null ? '' : v).match(/\{\w+\}/g) || []))].sort().join();
for (const s of STOPS) {
  const want = holes(STR['zh-TW'][s.b]);
  for (const lang of ['en', 'zh-cn']) {
    if (STR[lang][s.b] == null) continue;
    check(want === holes(STR[lang][s.b]), `${s.id} 的 ${lang} 佔位符跟 zh-TW 一致`);
  }
}

// --- 走完一輪 ----------------------------------------------------------------

resetDom();
{
  const { api, log } = makeApi();
  const tour = createTour(api);
  check(!tour.isActive(), '沒開始之前不算在導覽中');
  tour.start();
  check(tour.isActive() && tour.index() === 0, 'start 之後停在第一站');
  check(dom.byId.tour.hidden === false, '導覽列顯示出來了');
  check(document.body.classList.contains('tour-on'), 'body 掛上 tour-on，讓訊息串與卡片讓開');
  check(log.start === 1, '網址同步的回呼有被呼叫');
  check(dom.byId['tour-next'].focused > 0, '焦點落在下一步，空白鍵不必先點一下');
  check(dom.props['--tour-h'], `導覽列高度寫進 CSS 變數（${dom.props['--tour-h']}）`);

  const seen = [];
  for (let i = 0; i < 6; i++) { seen.push(tour.current().id); tour.next(); }
  seen.push(tour.current() && tour.current().id);
  check(seen.join(',') === STOPS.map((s) => s.id).join(','), `七站照腳本順序走完（${seen.join(' → ')}）`);
  check(tour.index() === 6, '停在最後一站');
  // 每一站都該把上一站點開的卡片收掉
  check(log.hide === 7, `每一站都收掉國家卡片（${log.hide} 次）`);
  // 換取景與換亮度的站數各自不同：有兩站只換亮度（權重、使用者估計），
  // 另有兩站只換取景（貼近西部、拉回全球），畫面一次只變一件事就是這麼排出來的
  const camStops = STOPS.filter((s) => s.cam).length;
  const modeStops = STOPS.filter((s) => s.mode).length;
  check(log.fly.length === camStops, `${camStops} 站換了取景（${log.fly.length} 次）`);
  check(log.mode.join(',') === STOPS.filter((s) => s.mode).map((s) => s.mode).join(','),
        `亮度照腳本切換（${log.mode.join(' → ')}）`);
  check(log.mode.length === modeStops, `${modeStops} 站換了亮度`);

  tour.next();
  check(!tour.isActive(), '最後一站再按一次就收工，不會卡住');
  check(dom.byId.tour.hidden === true, '導覽列收起來了');
  check(!document.body.classList.contains('tour-on'), 'tour-on 拿掉了');
  check(log.stop === 1, '收工時網址跟著還原');
  check(dom.props['--tour-h'] === undefined, '高度變數清掉了');
  check(dom.byId['btn-tour'].focused > 0, '焦點回到開始導覽那顆按鈕');
}

// --- 每一站的數字都要插進去 --------------------------------------------------

resetDom();
{
  const { api } = makeApi();
  const tour = createTour(api);
  tour.start();
  const left = [];
  for (let i = 0; i < 7; i++) {
    const body = dom.byId['tour-body'].innerHTML;
    if (/\{\w+\}/.test(body)) left.push(`${tour.current().id}: ${body.match(/\{\w+\}/)[0]}`);
    check(body.length > 20, `${tour.current().id} 的內文有填進去`);
    check(dom.byId['tour-title'].textContent.length > 1, `${tour.current().id} 的標題有填進去`);
    if (i < 6) tour.next();
  }
  check(left.length === 0, `沒有留下沒換掉的佔位符${left.length ? '：' + left.join('、') : ''}`);
  check(dom.byId['tour-step'].textContent === '7 / 7', `進度顯示正確（${dom.byId['tour-step'].textContent}）`);
  check(dom.byId['tour-next'].textContent === t('zh-TW', 'tourDone'), '最後一站的按鈕是「完成」');
}

// --- 邊界 --------------------------------------------------------------------

resetDom();
{
  const { api } = makeApi();
  const tour = createTour(api);
  tour.start();
  check(dom.byId['tour-prev'].disabled === true, '第一站的上一步是停用的');
  tour.prev();
  check(tour.index() === 0, '第一站再往回不會掉出腳本');
  tour.go(99);
  check(tour.index() === 6, 'go 超過最後一站會夾在最後一站');
  tour.go(-5);
  check(tour.index() === 0, 'go 小於零會夾在第一站');
  check(dom.byId['tour-prev'].disabled === true, '夾回第一站之後上一步又停用');
}

// --- 資料缺失時抽掉對應的站 --------------------------------------------------

resetDom();
{
  const { api, log } = makeApi({ available: () => ({ users: false, tw: false }) });
  const tour = createTour(api);
  tour.start();
  check(tour.stopCount() === 5, `兩份資料都缺時剩 ${tour.stopCount()} 站`);
  const ids = [];
  for (let i = 0; i < 5; i++) { ids.push(tour.current().id); if (i < 4) tour.next(); }
  check(!ids.includes('users') && !ids.includes('infra'), `抽掉了要資料的那幾站（${ids.join(' → ')}）`);
  check(dom.byId['tour-step'].textContent === '5 / 5', '站數跟著少，進度不會顯示成 7 站');
  check(log.mode.includes('users') === false, '被抽掉的站不會去切一個沒有資料的亮度');
}

resetDom();
{
  const { api } = makeApi({ available: () => ({ users: true, tw: false }) });
  const tour = createTour(api);
  tour.start();
  check(tour.stopCount() === 6, `只缺台灣那幾份時剩 ${tour.stopCount()} 站`);
  check(tour.current().id === 'intro', '抽站之後第一站還是開場');
}

// --- 鍵盤 --------------------------------------------------------------------

resetDom();
{
  const { api } = makeApi();
  const tour = createTour(api);
  tour.start();
  press(' ');
  check(tour.index() === 1, '空白鍵前進一站');
  press('ArrowRight');
  check(tour.index() === 2, '右方向鍵前進一站');
  press('ArrowLeft');
  check(tour.index() === 1, '左方向鍵退一站');
  // 焦點在導覽列的按鈕上時，空白鍵由按鈕自己觸發 click，攔了會一次走兩站
  const before = tour.index();
  press(' ', dom.byId['tour-next']);
  check(tour.index() === before, '焦點在按鈕上時不搶空白鍵，避免一次走兩站');
  dom.byId['tour-next'].click();
  check(tour.index() === before + 1, '按鈕自己那條路徑照樣前進');
  // 卡片開著的時候第一次 Esc 讓給卡片
  dom.byId['cc-card'].hidden = false;
  press('Escape');
  check(tour.isActive(), '卡片開著時 Esc 先關卡片，不結束導覽');
  dom.byId['cc-card'].hidden = true;
  press('Escape');
  check(!tour.isActive(), '卡片關了之後 Esc 結束導覽');
  press(' ');
  check(!tour.isActive(), '結束之後鍵盤不再有作用');
}

// --- 提示條與面板 ------------------------------------------------------------

resetDom();
{
  const { api } = makeApi();
  const tour = createTour(api);
  tour.start();
  check(dom.byId.hint.classList.contains('hidden'), '導覽期間提示條收起來，兩條不會疊在同一處');
  tour.stop();
  check(!dom.byId.hint.classList.contains('hidden'), '結束後提示條放回去');
}
resetDom();
{
  // 使用者自己按過「知道了」的話，結束導覽不該把它變回來
  dom.byId.hint.classList.add('hidden');
  const { api } = makeApi();
  const tour = createTour(api);
  tour.start();
  tour.stop();
  check(dom.byId.hint.classList.contains('hidden'), '使用者關掉的提示條不會被導覽放回來');
}
resetDom();
{
  // 窄螢幕上左側面板幾乎佔滿畫面，導覽列會被埋住，所以先收合
  globalThis.matchMedia = () => ({ matches: true });
  const { api } = makeApi();
  const tour = createTour(api);
  tour.start();
  check(dom.byId.info.open === false, '窄螢幕啟動導覽時收合左側面板');
}

// --- 接線（漏了照樣建置成功的那一類）----------------------------------------

const wantIds = ['tour', 'tour-step', 'tour-title', 'tour-body', 'tour-next', 'tour-prev',
                 'tour-exit', 'tour-keys', 'tour-note', 'btn-tour', 'btn-tour-hint'];
for (const id of wantIds) {
  check(html.includes(`id="${id}"`), `index.html 有 #${id}`);
}
check(/#tour\b[^{]*\{/.test(html), 'index.html 有導覽列的樣式');
check(html.includes('body.tour-on #feed'), '訊息串會讓開導覽列');
check(html.includes('body.tour-on #cc-card'), '國家卡片會讓開導覽列');
check(/id="btn-tour"[^>]*disabled/.test(html), '資料還沒齊時開始導覽是停用的');
check(atlas.includes("import { createTour } from './tour.js'"), 'atlas.js 載入了 tour.js');
check(/createTour\(\{/.test(atlas), 'atlas.js 真的把導覽建起來');
check(/for \(const id of \['top', 'hint', 'tour'\]\)/.test(atlas), '國家標籤會避開導覽列');
check(atlas.includes('function tourStats()'), 'atlas.js 提供導覽要插的數字');
check(atlas.includes('function tourAvailable()'), 'atlas.js 回報哪幾份資料載到了');
check(/focusKey\(\)\.toLowerCase\(\) === 'tour'/.test(atlas), '網址帶 #tour 會直接開講');
for (const k of ['btn-tour', 'btn-tour-hint', 'tour-note', 'tour-exit', 'tour-prev', 'tour-next', 'tour-keys']) {
  check(atlas.includes(`set('${k}'`), `applyI18n 換掉 #${k} 的文字`);
}
check(sw.includes('games/tor-network/play/tour.js'), '離線清單收了 tour.js');

// --- 結果 --------------------------------------------------------------------

for (const m of ok) console.log(`  ok   ${m}`);
if (fail.length) {
  console.error('');
  for (const m of fail) console.error(`  FAIL ${m}`);
  console.error(`\n${fail.length} 項沒過（共 ${ok.length + fail.length} 項）`);
  process.exit(1);
}
console.log(`\n全部 ${ok.length} 項通過`);
