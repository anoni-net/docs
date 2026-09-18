// Tor 中繼地球儀 · 工作坊導覽
//
// === 為什麼有這個模式 ===
//
// 這顆地球儀整合了十幾份資料，每一份都要按對地方才看得到：亮度要切到共識權重才
// 看得出台數與流量的落差，使用者估計藏在一顆預設不顯示的按鈕後面，台灣那五層要
// 貼到四度涵蓋才浮出來。自己摸索找得到，站在台前對著一群人講的時候找不到。
//
// 工作坊與教學現場是這個作品實際被用到的場合，而那些場合的網路通常很差。地球儀
// 本身已經進了 sw.js 的預快取，斷網也開得起來，缺的是一條不必記操作順序就走得完
// 的路線。按一次空白鍵往下一站，七站講完整個故事。
//
// === 站點怎麼排 ===
//
// 供給端先講（有多少台、誰真的在扛），再講需求端（哪裡連不上、哪裡的人在用），
// 最後收在台灣（有幾台、連線靠哪些實體設施）。每一站只換一件事，換兩件以上的話
// 聽的人會不知道畫面上哪個變化才是重點。
//
// 相機取景寫成「要涵蓋多少度地表」而不是 zoom，因為 zoom 是相對於 fitDist 的倍率，
// 而 fitDist 隨畫面長寬比變動很大（桌機 15.4、手機直式 31.4）。同一個 zoom 在投影
// 機與手機上看到的範圍差好幾倍，寫死就會有一邊取景是壞的。140 度已經超過整顆球
// 入鏡所需，zoomForExtent 會收斂到 1，也就是進場時的距離。
//
// === 資料不齊的時候 ===
//
// 使用者估計那一站要有 torusers.json，台灣那兩站要有台電與縣市界那幾份。載入失敗
// 時對應的站會整站抽掉，站數跟著變，而不是留一站空畫面讓講者在台前解釋為什麼
// 什麼都沒有。抽掉的判斷由 atlas.js 那邊回報，這支只管照著過濾。

/** 七站的腳本。mode 與 cam 省略代表那一站不動那一項，畫面停在上一站的狀態。 */
export const STOPS = [
  { id: 'intro', t: 'tourIntroTitle', b: 'tourIntroBody', mode: 'all-count', cam: [30, -30, 140, 140] },
  { id: 'weight', t: 'tourWeightTitle', b: 'tourWeightBody', mode: 'all-weight' },
  // 轉到東半球再講受阻，那一側才看得到被標紅的國家。亮度切回台數，
  // 紅色是獨立的一層，留著共識權重的話畫面上同時有兩套顏色在變。
  { id: 'blocked', t: 'tourBlockedTitle', b: 'tourBlockedBody', mode: 'all-count', cam: [22, 62, 140, 140] },
  { id: 'users', t: 'tourUsersTitle', b: 'tourUsersBody', mode: 'users', need: 'users' },
  // 台灣用的取景跟「關注台灣」那顆按鈕同一組，本島填滿畫面、澎湖還在。
  { id: 'tw', t: 'tourTwTitle', b: 'tourTwBody', mode: 'all-count', cam: [23.75, 121.0, 4.6, 3.0] },
  // 再往西部貼一段。變電所、電廠與 345kV 骨幹都集中在那條走廊上。
  { id: 'infra', t: 'tourInfraTitle', b: 'tourInfraBody', cam: [23.6, 120.45, 2.6, 2.6], need: 'tw' },
  { id: 'end', t: 'tourEndTitle', b: 'tourEndBody', cam: [23.75, 121.0, 140, 140] },
];

/** 導覽列會蓋住畫面下緣，訊息串與國家標籤都要讓開，這是留給它們的呼吸空間。 */
const CLEAR_PAD = 14;

/**
 * 建一份導覽控制器。DOM 與相機的實際操作都由 api 提供，這支只負責站點的狀態機，
 * 所以測試可以塞一份假的 api 進來把七站走完。
 *
 * api 需要：
 *   $(id)            取元素
 *   S(key, vars)     i18n
 *   flyTo(lat, lon, spanLat, spanLon)
 *   setMode(mode)
 *   hideCountry()
 *   stats()          文案要插的數字
 *   available()      { users: bool, tw: bool }，哪幾份資料真的載到了
 *   onLayout()       導覽列顯示或收起之後重量一次 UI 遮蔽區（可省略）
 *   onStart() / onStop()  網址要不要跟著動，交給呼叫端決定（可省略）
 */
export function createTour(api) {
  const { $, S } = api;
  let stops = STOPS;
  let at = -1;           // -1 代表沒在導覽
  let hintHidden = false; // 導覽期間是不是由這支把提示條收起來的

  const can = () => (api.available ? api.available() : {});
  const pick = () => {
    const av = can();
    return STOPS.filter((s) => !s.need || av[s.need]);
  };

  const active = () => at >= 0;

  function apply(s) {
    // 卡片先收。上一站點開的國家卡片留著會蓋住新的取景，而且內容跟這一站無關。
    api.hideCountry();
    if (s.mode) api.setMode(s.mode);
    if (s.cam) api.flyTo(s.cam[0], s.cam[1], s.cam[2], s.cam[3]);
  }

  function render() {
    const s = stops[at];
    const v = api.stats ? api.stats() : {};
    const box = $('tour');
    if (!box || !s) return;
    const set = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
    set('tour-step', `${at + 1} / ${stops.length}`);
    set('tour-title', S(s.t));
    // 文案帶 <b> 與結語那段的連結，是這份 i18n 表自己的字串，不是外部輸入。
    // 插進去的數字全部由 stats() 算完才進來，同樣不是使用者可寫的內容。
    const body = $('tour-body');
    if (body) body.innerHTML = S(s.b, v);
    const last = at === stops.length - 1;
    const next = $('tour-next');
    if (next) next.textContent = last ? S('tourDone') : S('tourNext');
    const prev = $('tour-prev');
    if (prev) prev.disabled = at === 0;
    // 導覽列的高度隨文案長短變，訊息串要讓開的距離跟著算，不要寫死一個數字。
    measure();
  }

  /** 導覽列實際佔掉的高度寫進 CSS 變數，#feed 讀它往上讓。 */
  function measure() {
    const box = $('tour');
    if (!box || !box.getBoundingClientRect) return;
    const r = box.getBoundingClientRect();
    const h = Math.ceil(r.height || 0);
    if (document.documentElement && document.documentElement.style) {
      document.documentElement.style.setProperty('--tour-h', `${h + CLEAR_PAD}px`);
    }
    if (api.onLayout) api.onLayout();
  }

  function go(n) {
    if (!active()) return;
    at = Math.max(0, Math.min(stops.length - 1, n));
    apply(stops[at]);
    render();
  }

  function next() {
    if (!active()) return;
    // 最後一站的按鈕是「完成」，按下去就收工，不要卡在最後一站按了沒反應。
    if (at >= stops.length - 1) stop(); else go(at + 1);
  }

  function prev() { if (active()) go(at - 1); }

  function start() {
    stops = pick();
    if (!stops.length) return;
    at = 0;
    const box = $('tour');
    if (box) box.hidden = false;
    document.body && document.body.classList && document.body.classList.add('tour-on');
    // 提示條跟導覽列都在畫面下緣正中，同時出現會疊在一起。導覽期間先收起來，
    // 結束時放回去，但使用者自己按過「知道了」的話就維持關著。
    const hint = $('hint');
    if (hint && hint.classList && !hint.classList.contains('hidden')) {
      hint.classList.add('hidden');
      hintHidden = true;
    }
    // 窄螢幕上左側面板幾乎佔滿整個畫面，導覽列會被埋在底下。手機翻給人看的時候
    // 要的是地球，先收起來，需要細節的人自己展開。
    const info = $('info');
    if (info && info.open && isNarrow()) info.open = false;
    if (api.onStart) api.onStart();
    apply(stops[0]);
    render();
    // 焦點給「下一步」，空白鍵與 Enter 就直接作用在按鈕上，不必先用滑鼠點一下。
    const nx = $('tour-next');
    if (nx && nx.focus) nx.focus();
  }

  function stop() {
    if (!active()) return;
    at = -1;
    const box = $('tour');
    if (box) box.hidden = true;
    document.body && document.body.classList && document.body.classList.remove('tour-on');
    if (hintHidden) {
      const hint = $('hint');
      if (hint && hint.classList) hint.classList.remove('hidden');
      hintHidden = false;
    }
    if (document.documentElement && document.documentElement.style) {
      document.documentElement.style.removeProperty('--tour-h');
    }
    if (api.onLayout) api.onLayout();
    if (api.onStop) api.onStop();
    // 開始導覽那顆按鈕收回焦點，鍵盤使用者才知道自己回到哪裡。
    const btn = $('btn-tour');
    if (btn && btn.focus) btn.focus();
  }

  const isNarrow = () => typeof matchMedia === 'function' && matchMedia('(max-width: 680px)').matches;

  // 前一站與下一站是同一組鍵，按鈕與鍵盤共用同一條路徑。
  const bind = (id, fn) => { const el = $(id); if (el && el.addEventListener) el.addEventListener('click', fn); };
  bind('tour-next', next);
  bind('tour-prev', prev);
  bind('tour-exit', stop);
  bind('btn-tour', start);
  bind('btn-tour-hint', start);

  if (typeof addEventListener === 'function') {
    addEventListener('keydown', (e) => {
      if (!active()) return;
      const el = document.activeElement;
      const tag = (el && el.tagName) || '';
      // 打字中的欄位與收合鍵有自己的空白鍵行為，不搶
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SUMMARY') return;
      if (e.key === 'Escape') {
        // 卡片開著的時候 Esc 先關卡片。atlas.js 那邊也掛了一個 Esc，
        // 這裡讓開一次，第二次才輪到結束導覽。
        const card = $('cc-card');
        if (card && !card.hidden) return;
        e.preventDefault();
        stop();
        return;
      }
      const fwd = e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowRight' || e.key === 'PageDown';
      const back = e.key === 'ArrowLeft' || e.key === 'PageUp';
      if (!fwd && !back) return;
      // 焦點已經在導覽列的按鈕上時，空白鍵由按鈕自己觸發 click，這裡再接一次會走兩步
      if (e.key === ' ' && el && el.closest && el.closest('#tour')) return;
      e.preventDefault();
      if (fwd) next(); else prev();
    });
    addEventListener('resize', () => { if (active()) measure(); });
  }

  return {
    start, stop, next, prev, go, measure,
    isActive: active,
    stopCount: () => stops.length,
    index: () => at,
    current: () => (active() ? stops[at] : null),
  };
}
