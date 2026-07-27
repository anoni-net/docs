// Tor 連線流量 · 三語字串
// zh-TW 是 single source of truth。三份表的 key 必須一致，缺 key 時 t() 會退回 zh-TW。
// 語言用網址參數決定（?lang=en、?lang=zh-cn），跟 onion-routing 同一套做法。

const ZH_TW = {
  pageTitle: 'Tor 連線流量',
  toggleOpen: '▾ 收合',
  toggleClosed: '▸ 說明',
  caption: '兩種流量都走 3 跳中繼。連 .onion 服務時，你和服務各自建一條 3 跳電路，在隨機挑出的會合點相遇（全程共 6 跳）。連明網網站則是你走 3 跳到出口，直達網站後原路傳回。',

  lgRelay: 'relay 節點（乾淨中繼）',
  lgClient: '你（client）的電路',
  lgOnion: '.onion 服務的電路',
  lgClear: '明網網站（原路往返）',
  lgRendez: '會合點（雙方在此交換）',
  lgBad: '有害節點（已標記，電路避開）',

  noteMain: '會合點只負責轉送，看不到你和服務交換的內容，雙方也都不知道對方的真實位置。回程帶亮頭的彗星代表回應正在傳回。',
  noteMore: '跟真實 Tor 的差別',
  noteSm0: '實際上服務會先把介紹點清單發布出去，你連線前要先查到這份清單，再挑好會合點，透過介紹點悄悄告知服務。為了畫面簡潔，這裡省略介紹點與查詢的過程。',
  noteSm1: '畫面上每條連線的 3 跳都重新抽選，方便同時呈現很多條。實際使用時，你的入口節點（Guard）會固定用上數週才換，只有中間與出口常常變動。',
  noteSm2: '畫面上的有害節點代表已經被標記出問題的中繼。真實的 Tor 選路徑只排除已經被標記的節點，還沒被抓到的惡意中繼一樣可能被選中。Tor 的安全靠的是把路徑拆開，讓任何一方都無法同時看到你是誰與你在連什麼。',

  ctrlTitle: '調控',
  lblRelays: 'relay 節點',
  lblCircuits: '電路數',
  lblBad: '有害節點',
  lblFlow: '流量',
  flowLow: '低',
  flowMid: '中',
  flowHigh: '高',

  hintText: '點擊畫面加一條連線 · 拖曳可平移 · 滾輪或雙指縮放',
  hintClose: '知道了',

  backendDetecting: '偵測中…',
  backendWebGL: 'WebGL2（fallback）',
  backendSep: '：',
  backendNoSupport: '這個瀏覽器不支援 WebGPU 或 WebGL2',
  backendInitFail: '渲染器初始化失敗',
  backendRuntime: '畫面發生錯誤，重新整理可以再試一次',
  backendBootFail: '啟動失敗',
  blkForced: '網址帶了 backend=webgl',
  blkInsecure: '頁面不是 https 或 localhost',
  blkNoGpu: '這個瀏覽器沒有 WebGPU',
  blkNoAdapter: '系統沒有給出可用的 GPU',
  blkRejected: 'WebGPU 被擋下',
};

const EN = {
  pageTitle: 'Tor Traffic Flow',
  toggleOpen: '▾ Hide',
  toggleClosed: '▸ About',
  caption: 'Both kinds of traffic run through 3 relays. For a .onion service, you and the service each build a 3-hop circuit and meet at a randomly chosen rendezvous point (6 hops end to end). For a clear web site, you go 3 hops to an exit, reach the site directly, and the response returns the same way.',

  lgRelay: 'Relay node (clean)',
  lgClient: 'Your circuit (client)',
  lgOnion: 'Circuit of the .onion service',
  lgClear: 'Clear web site (same path back)',
  lgRendez: 'Rendezvous point (where the two meet)',
  lgBad: 'Hostile node (flagged, circuits avoid it)',

  noteMain: 'The rendezvous point only forwards. It cannot see what you and the service exchange, and neither side learns the other\'s real location. The bright-headed comets on the return leg are responses travelling back.',
  noteMore: 'How this differs from real Tor',
  noteSm0: 'In practice a service first publishes a list of introduction points. Before connecting you look that list up, choose a rendezvous point, and quietly tell the service through an introduction point. Introduction points and the lookup are left out here to keep the picture readable.',
  noteSm1: 'Every connection on screen redraws its 3 hops each time, which makes it easier to show many at once. In real use your entry node (Guard) stays the same for weeks, and only the middle and exit change often.',
  noteSm2: 'The hostile nodes here stand for relays already flagged as problematic. Real Tor path selection only excludes nodes that have been flagged, so a malicious relay nobody has caught yet can still be picked. Tor\'s safety comes from splitting the path so that no single party sees both who you are and what you are connecting to.',

  ctrlTitle: 'Controls',
  lblRelays: 'Relay nodes',
  lblCircuits: 'Circuits',
  lblBad: 'Hostile nodes',
  lblFlow: 'Traffic',
  flowLow: 'Low',
  flowMid: 'Medium',
  flowHigh: 'High',

  hintText: 'Click to add a connection · drag to pan · scroll or pinch to zoom',
  hintClose: 'Got it',

  backendDetecting: 'Detecting…',
  backendWebGL: 'WebGL2 (fallback)',
  backendSep: ': ',
  backendNoSupport: 'This browser supports neither WebGPU nor WebGL2',
  backendInitFail: 'Renderer failed to initialise',
  backendRuntime: 'Something went wrong on screen. Reload to try again',
  backendBootFail: 'Failed to start',
  blkForced: 'the URL asked for backend=webgl',
  blkInsecure: 'the page is not on https or localhost',
  blkNoGpu: 'this browser has no WebGPU',
  blkNoAdapter: 'the system offered no usable GPU',
  blkRejected: 'WebGPU was refused',
};

const ZH_CN = {
  pageTitle: 'Tor 连线流量',
  toggleOpen: '▾ 收合',
  toggleClosed: '▸ 说明',
  caption: '两种流量都走 3 跳中继。连 .onion 服务时，你和服务各自建一条 3 跳电路，在随机挑出的会合点相遇（全程共 6 跳）。连明网网站则是你走 3 跳到出口，直达网站后原路传回。',

  lgRelay: 'relay 节点（干净中继）',
  lgClient: '你（client）的电路',
  lgOnion: '.onion 服务的电路',
  lgClear: '明网网站（原路往返）',
  lgRendez: '会合点（双方在此交换）',
  lgBad: '有害节点（已标记，电路避开）',

  noteMain: '会合点只负责转送，看不到你和服务交换的内容，双方也都不知道对方的真实位置。回程带亮头的彗星代表回应正在传回。',
  noteMore: '跟真实 Tor 的差别',
  noteSm0: '实际上服务会先把介绍点清单发布出去，你连线前要先查到这份清单，再挑好会合点，透过介绍点悄悄告知服务。为了画面简洁，这里省略介绍点与查询的过程。',
  noteSm1: '画面上每条连线的 3 跳都重新抽选，方便同时呈现很多条。实际使用时，你的入口节点（Guard）会固定用上数周才换，只有中间与出口常常变动。',
  noteSm2: '画面上的有害节点代表已经被标记出问题的中继。真实的 Tor 选路径只排除已经被标记的节点，还没被抓到的恶意中继一样可能被选中。Tor 的安全靠的是把路径拆开，让任何一方都无法同时看到你是谁与你在连什么。',

  ctrlTitle: '调控',
  lblRelays: 'relay 节点',
  lblCircuits: '电路数',
  lblBad: '有害节点',
  lblFlow: '流量',
  flowLow: '低',
  flowMid: '中',
  flowHigh: '高',

  hintText: '点击画面加一条连线 · 拖曳可平移 · 滚轮或双指缩放',
  hintClose: '知道了',

  backendDetecting: '检测中…',
  backendWebGL: 'WebGL2（fallback）',
  backendSep: '：',
  backendNoSupport: '这个浏览器不支持 WebGPU 或 WebGL2',
  backendInitFail: '渲染器初始化失败',
  backendRuntime: '画面发生错误，刷新可以再试一次',
  backendBootFail: '启动失败',
  blkForced: '网址带了 backend=webgl',
  blkInsecure: '页面不是 https 或 localhost',
  blkNoGpu: '这个浏览器没有 WebGPU',
  blkNoAdapter: '系统没有给出可用的 GPU',
  blkRejected: 'WebGPU 被挡下',
};

export const STR = { 'zh-TW': ZH_TW, 'en': EN, 'zh-cn': ZH_CN };

export function pickLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && STR[q]) return q;
  return 'zh-TW';
}

export function t(lang, key, vars) {
  const table = STR[lang] || STR['zh-TW'];
  let s = (table[key] != null) ? table[key] : (STR['zh-TW'][key] != null ? STR['zh-TW'][key] : key);
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', String(vars[k]));
  return s;
}
