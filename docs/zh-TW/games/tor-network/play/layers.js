// Tor 中繼地球儀 · 圖層清單
//
// 每一份外部資料在這裡佔一筆。atlas.js 依這份清單決定載入順序、失敗時的退路、
// 三語字串綁在哪個節點，以及幾何要抬到地表上方多少。tools/test_layers.mjs 讀
// 同一份，驗來源檔案、面板節點與三語 key 四邊對得上。
//
// 加一份新資料要動四個地方：這份清單加一筆、atlas.js 的 REGISTRY 補上建幾何與
// 填面板的掛鉤、i18n.js 三份表各補 label 與 credit、index.html 補面板節點。
// 漏了其中一處 test_layers.mjs 會指出來，不必等畫面上發現少一塊。
//
// 這份檔案只放宣告，不 import 任何東西。node 的檢查腳本要讀得動它，而那邊沒有
// three.js 也沒有 DOM。
//
// 欄位說明：
//   id        層的識別字，REGISTRY 與網址參數都用它
//   file      檔名。from 決定它相對於哪裡
//   from      docs 是跟文件站一起發布，assets 是 assets.anoni.net 上定期重生的那幾份
//   fresh     每次載入都向 server 驗證新鮮度。只有天天在變的那幾份需要
//   required  抓不到就沒有東西可畫，整個作品中止。其餘的失敗只是少一層
//   group     base 是地理底圖，global 是全球資料，tw 是台灣那一區
//   on        開場就載。其餘的層等讀者在側欄勾了才去抓那一份
//   core      關不掉。沒有它畫不出地球，所以它在圖層清單上是停用的狀態
//   label     側欄小標的 i18n key，純面板層沒有幾何也要有它
//   credit    資料來源區塊的 i18n key，授權說明寫在那裡
//   panel     側欄內容節點的 DOM id。小標節點照慣例是同名的 lbl- 開頭，由 test_layers.mjs 守
//   creditEl  資料來源區塊的 DOM id。這一組沒有命名慣例可推，逐筆寫出來
//   lift      幾何抬離地表多少，單位是地球半徑的倍數
//   order     renderOrder。同心的透明物件預設排序不穩定，要明確指定

// 台灣那幾層的疊放順序。數字本身沒有意義，相對大小才有：變電所在最底下，
// 登陸點在最上面，中繼點又在登陸點之上。
export const RO = { sub: 11, renew: 12, plant: 13, landing: 14 };

export const LAYERS = [
  // ── 地理底圖 ────────────────────────────────────────────────
  {
    id: 'countries',
    file: 'countries.json',
    from: 'docs',
    required: true,
    core: true,
    on: true,
    group: 'base',
    credit: 'creditNaturalEarth', creditEl: 'credit-ne',
    lift: 1.0036,
    note: '國界輪廓與陸地形狀。陸地貼圖、國界線、受阻漸層、國家錨點都從這一份長出來，抓不到就沒有地球可看。國界壓在海岸線之下，沿海國家兩條線本來就重疊，重疊處看到的是比較亮的海岸線。',
  },
  {
    id: 'continents',
    file: 'continents.json',
    from: 'docs',
    on: true,
    group: 'base',
    lift: 1.004,
    note: '海岸線。疊在國界之上，海陸交界是這張圖上最清楚的一條線。',
  },
  {
    id: 'bathymetry',
    file: 'bathymetry.json',
    from: 'docs',
    on: true,
    group: 'base',
    note: '海底地形。要在 buildEarth 之前備好，海面的深淺是那時候畫進貼圖的。抓不到就退回單色海面。',
  },

  // ── 全球資料 ────────────────────────────────────────────────
  {
    id: 'relays',
    file: 'snapshot.json',
    from: 'assets',
    fresh: true,
    required: true,
    on: true,
    group: 'global',
    label: 'lblMix',
    credit: 'creditOnionoo', creditEl: 'credit-onionoo',
    panel: 'stat-mix',
    lift: 1.012,
    note: 'Onionoo 的中繼快照。每小時都在變，定期重生，所以每次載入都向 server 驗證新鮮度。',
  },
  {
    id: 'ooni',
    file: 'ooni.json',
    from: 'docs',
    group: 'global',
    label: 'lblOoni',
    credit: 'creditOoni', creditEl: 'credit-ooni',
    panel: 'stat-ooni',
    lift: 1.0045,
    note: 'Tor 連線受阻的觀測。陸地上那層紅色漸層吃這一份。那條線比國界高一點點，兩條重疊時紅色蓋在上面。',
  },
  {
    id: 'torusers',
    file: 'torusers.json',
    from: 'assets',
    fresh: true,
    group: 'global',
    label: 'lblUsers',
    credit: 'creditMetrics', creditEl: 'credit-metrics',
    panel: 'stat-users',
    note: '使用者估計與橋接統計。跟 snapshot 一樣帶 no-cache。assets 回的是 max-age=43200，瀏覽器會把這份快取十二小時，但它每天更新，不驗證的話使用者會看到過期的數字。代價是每次載入多一個 304 往返。',
  },
  {
    id: 'shutdowns',
    file: 'shutdowns.json',
    from: 'docs',
    group: 'global',
    label: 'lblShutdown',
    credit: 'creditAccessNow', creditEl: 'credit-accessnow',
    panel: 'stat-shutdown',
    note: 'Access Now 的網路關閉事件。更新不定期，跟文件站一起發布。',
  },
  {
    id: 'netusers',
    file: 'netusers.json',
    from: 'docs',
    group: 'global',
    credit: 'creditNetUsers', creditEl: 'credit-netusers',
    note: '各國上網人口比例。只出現在國家卡片裡，沒有自己的側欄區塊。一年才動一次，跟文件站一起發布。',
  },
  {
    id: 'cables',
    file: 'cables.json',
    from: 'docs',
    group: 'global',
    credit: 'creditOsm', creditEl: 'credit-osm',
    note: '海底電纜。這一層的定位是海面的背景質感，不是完整的海纜清單。',
  },

  // ── 台灣 ────────────────────────────────────────────────────
  {
    id: 'tw-admin',
    file: 'tw-admin.json',
    from: 'docs',
    group: 'tw',
    credit: 'creditTwAdmin', creditEl: 'credit-twadmin',
    lift: 1.005,
    note: '縣市界線，同時也是台灣的海岸線。全球那份海岸線的比例尺在縣市尺度下不夠用。人工跑產生器更新，跟文件站一起發布。',
  },
  {
    id: 'tw-grid',
    file: 'tw-grid.json',
    from: 'docs',
    group: 'tw',
    label: 'lblGrid',
    credit: 'creditGrid', creditEl: 'credit-grid',
    panel: 'stat-grid',
    lift: 1.010,
    order: RO.plant,
    note: '發電廠與 345kV 電網骨幹。含即時發電量的快照，時間戳在 stamp 欄位。輸電線自己抬到 1.007。',
  },
  {
    id: 'tw-energy',
    file: 'tw-energy.json',
    from: 'docs',
    group: 'tw',
    label: 'lblEnergy',
    credit: 'creditEnergy', creditEl: 'credit-energy',
    panel: 'stat-energy',
    lift: 1.0095,
    order: RO.renew,
    note: '再生能源場址、各縣市用電量、每日備轉容量率，三份都是台電的。',
  },
  {
    id: 'tw-power',
    file: 'tw-power.json',
    from: 'docs',
    group: 'tw',
    label: 'lblPower',
    credit: 'creditPower', creditEl: 'credit-power',
    panel: 'stat-power',
    lift: 1.009,
    order: RO.sub,
    note: '變電所的容量與負載。人工跑產生器更新，跟文件站一起發布。',
  },
  {
    id: 'tw-landing',
    file: 'tw-landing.json',
    from: 'docs',
    group: 'tw',
    label: 'lblLanding',
    credit: 'creditLanding', creditEl: 'credit-landing',
    panel: 'stat-landing',
    lift: 1.011,
    order: RO.landing,
    note: '海纜登陸點。自建資料，跟文件站一起發布而不是走 assets，因為它是人工維護的，改動頻率是「查到新來源才動」，沒有定期重生的必要。',
  },
  {
    id: 'seacable',
    file: 'seacable.json',
    from: 'assets',
    group: 'tw',
    label: 'lblSeacable',
    credit: 'creditSeacable', creditEl: 'credit-seacable',
    panel: 'stat-seacable',
    note: '連到台灣的海纜障礙。由 publish_games_data.sh 定期重生並發布到 assets，更新不必等文件站重建。障礙的存續期是月為單位，assets 的 12 小時快取夠新鮮，不必額外帶 no-cache。取不到的時候整個區塊會收掉，畫面跟沒有這個功能時一模一樣。',
  },
];

/** id → 那一筆宣告。 */
export const LAYER = Object.fromEntries(LAYERS.map((l) => [l.id, l]));

/** 開場預設開著的層。網址帶 layers 的時候由它覆蓋，見 atlas.js 的 wantOn。 */
export const DEFAULT_ON = LAYERS.filter((l) => l.on).map((l) => l.id);

/** 幾何抬離地表多少。沒宣告 lift 的層代表它沒有自己的幾何。 */
export function lift(id) {
  const l = LAYER[id];
  return l && l.lift ? l.lift : 1;
}
