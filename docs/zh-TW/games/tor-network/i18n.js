// Tor 中繼地球儀 · 三語字串
// zh-TW 是 single source of truth。三份表的 key 必須一致，缺 key 時 t() 會退回 zh-TW。
// 語言用網址參數決定（?lang=en、?lang=zh-cn），跟另外兩個作品同一套做法。
//
// 這份表裡有一批句子的措辭是刻意調過的，翻譯時不能鬆掉：
//   ooniNote / creditOoni  anomaly 只代表「測試沒有照預期完成」，不等於審查。
//                          翻成 blocked / censored 就等於把整個作品在避免的誤導寫回去。
//   circTag / cableNote    走廊與三跳路徑都是示意，不是實測路由。
//   usersNote / cardNote   使用者數是估計值不是普查。
//   shutdownNote           武裝衝突類的關閉未必是政府主動下令。
// 動到這幾條之前先讀 tools/gen_ooni_snapshot.py 開頭那段說明。

const ZH_TW = {
  pageTitle: 'Tor 中繼地球儀',
  unitRelays: '台運作中的中繼',
  snapshotAt: '資料快照：',
  btnLive: '即時更新',
  liveNote: '畫面預設讀站上的靜態快照，不會對外連線。按下這個鍵會由你的瀏覽器直接連到 onionoo.anoni.net 取最新資料，那台伺服器就會看到你的 IP。',

  lblRoles: '角色分布（點一下只看這個角色，再點一次看全部）',
  lblBrightness: '陸地亮度：由低到高（非線性，中段差距已放大）',
  modeCount: '中繼台數',
  modeWeight: '共識權重',
  modeConc: '業者集中度',
  modeUsers: '使用者數',
  modeUsersTip: '陸地亮度改成各國估計有多少人在用 Tor，中繼點照樣顯示',
  rampLow: '無',
  rampHigh: '最多',

  lblMix: '各國中繼數與角色組成（30 台以上）',
  lblAsn: '托管商排行（全球）',
  lblAsia: '亞洲鄰近國家',
  lblUsers: '用的人最多的地方（Tor Metrics 估計）',
  lblOoni: 'Tor 連線受阻的地方（OONI 觀測）',
  lblShutdown: '網路被整個關掉的地方（Access Now 紀錄）',

  note: '陸地的亮度代表該國有多少台中繼，愈亮的國家托管的中繼愈多。角色分布那四個標籤點下去，地球會只留那一種角色，深淺一樣是數量。點國家標籤可以看那一國的細節。近萬台中繼看似遍布全球，實際高度集中在美國、德國、荷蘭這幾塊亮起來的地方，這個順序照台數排。換成頻寬排，前三名會變成德國、荷蘭、美國，美國的中繼台數最多，單台扛的流量比較小。Onionoo 只給到國別，沒有更精確的位置，地圖上呈現的是國家層級的數量。遠看時地球上只畫其中一部分的點，放大會逐步補齊到全部，要讀密度請看陸地亮度，那個一直是全部的台數。',

  creditTitle: '資料來源',
  creditOnionoo: '中繼資料來自 <a href="https://metrics.torproject.org/onionoo.html" rel="noopener">Onionoo</a>，經自架的 onionoo.anoni.net 取回。只取到國家層級的聚合，沒有個別中繼的識別資訊。',
  creditMetrics: '使用者估計與橋接統計來自 <a href="https://metrics.torproject.org/" rel="noopener">Tor Metrics</a>，授權 <a href="https://creativecommons.org/publicdomain/zero/1.0/" rel="noopener">CC0 1.0</a>。人數是用中繼收到的目錄請求反推的估計值，信心區間相當寬，不是普查。',
  creditOoni: 'Tor 連線觀測來自 <a href="https://ooni.org/" rel="noopener">OONI</a>（Open Observatory of Network Interference），授權 <a href="https://github.com/ooni/license/blob/master/data/LICENSE.md" rel="noopener">CC BY-NC-SA 4.0</a>。畫面呈現的是 tor 測試近 30 天各國沒有照預期完成的比率，OONI 稱為 anomaly，成因包含連線被擋、網路不穩與 ISP 故障。',
  creditAccessNow: '網路關閉事件來自 <a href="https://www.accessnow.org/keepiton-data-dashboard/" rel="noopener">Access Now #KeepItOn</a> 的 STOP 資料集，授權 <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>。每筆事件的成因由該聯盟人工查證後標註，更新是不定期的，不是即時狀態。',
  creditNaturalEarth: '國界輪廓來自 <a href="https://www.naturalearthdata.com/" rel="noopener">Natural Earth</a>（public domain，110m 比例尺）。',
  creditOsm: '海面上看得比較清楚的細線是海底電纜，來自 <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> 貢獻者（ODbL），收錄以歐洲、地中海與大西洋較完整。最淡的一層是主要跨洋走廊的示意，取兩端公開的登陸地點拉出大圓弧，只有走向可信，實際路由要看專門的海纜地圖。',

  circTag: '示意路徑　guard → middle → exit',
  ccClose: '關閉',
  loading: '載入中…',
  hintWide: '拖曳旋轉地球 · 滾輪或雙指放大會浮出更多國家標籤 · 放開後自動轉',
  hintNarrow: '拖曳旋轉 · 雙指放大浮出更多標籤',
  hintClose: '知道了',
  toggleOpen: '▾ 收合',
  toggleClosed: '▸ 詳情',

  backendDetecting: '偵測中…',
  backendWebGL: 'WebGL2（fallback）',
  backendSep: '：',
  blkForced: '網址帶了 backend=webgl',
  blkInsecure: '頁面不是 https 或 localhost',
  blkNoGpu: '這個瀏覽器沒有 WebGPU',
  blkNoAdapter: '系統沒有給出可用的 GPU',
  blkRejected: 'WebGPU 被擋下',
  fatalNoGpu: '這個瀏覽器無法啟用 WebGPU 或 WebGL2，地球儀畫不出來。',
  fatalRender: '顯示已中斷，重新整理頁面可以再試一次。',
  fatalLoad: '地球儀載入失敗，資料可能沒抓到。重新整理頁面可以再試一次。',
};

const EN = {
  pageTitle: 'Tor Relay Globe',
  unitRelays: 'relays running',
  snapshotAt: 'Snapshot: ',
  btnLive: 'Update now',
  liveNote: 'By default this page reads a static snapshot hosted here and makes no outbound requests. Pressing this button has your browser connect directly to onionoo.anoni.net for the latest data, which means that server sees your IP.',

  lblRoles: 'Roles (click one to isolate it, click again for all)',
  lblBrightness: 'Land brightness: low to high (non-linear, mid-range spread out)',
  modeCount: 'Relay count',
  modeWeight: 'Consensus weight',
  modeConc: 'Provider concentration',
  modeUsers: 'Estimated users',
  modeUsersTip: 'Land brightness switches to the estimated number of Tor users per country. Relay dots stay as they are.',
  rampLow: 'none',
  rampHigh: 'most',

  lblMix: 'Relay count and role mix by country (30 or more)',
  lblAsn: 'Hosting providers (global)',
  lblAsia: 'Neighbouring Asia',
  lblUsers: 'Where the most people use it (Tor Metrics estimate)',
  lblOoni: 'Where Tor connections run into trouble (OONI)',
  lblShutdown: 'Where the network was shut down entirely (Access Now)',

  note: 'Land brightness shows how many relays a country hosts: the brighter it is, the more it holds. Click any of the four role chips and the globe keeps only that role, with the same brightness-equals-count rule. Click a country label for its details. Nearly ten thousand relays look spread across the world, but they are heavily concentrated in the United States, Germany and the Netherlands, the bright patches, ranked here by count. Rank by bandwidth instead and the top three become Germany, the Netherlands and the United States: the US has the most relays but each one carries less traffic. Onionoo only reports country, not a finer location, so what you see is a country-level count. Zoomed out, the globe draws only a fraction of the dots and fills in the rest as you zoom in. To read density, use the land brightness, which always reflects the full count.',

  creditTitle: 'Data sources',
  creditOnionoo: 'Relay data comes from <a href="https://metrics.torproject.org/onionoo.html" rel="noopener">Onionoo</a>, fetched through a self-hosted onionoo.anoni.net. Only country-level aggregates are kept, with no identifying information about individual relays.',
  creditMetrics: 'User estimates and bridge statistics come from <a href="https://metrics.torproject.org/" rel="noopener">Tor Metrics</a>, licensed <a href="https://creativecommons.org/publicdomain/zero/1.0/" rel="noopener">CC0 1.0</a>. The user counts are inferred from directory requests reaching relays. They are estimates with fairly wide confidence intervals, not a census.',
  creditOoni: 'Tor connection measurements come from <a href="https://ooni.org/" rel="noopener">OONI</a> (Open Observatory of Network Interference), licensed <a href="https://github.com/ooni/license/blob/master/data/LICENSE.md" rel="noopener">CC BY-NC-SA 4.0</a>. What is shown is the share of tor tests over the past 30 days that did not complete as expected, which OONI calls an anomaly. Causes include blocking, unstable networks and ISP faults.',
  creditAccessNow: 'Shutdown events come from the STOP dataset by <a href="https://www.accessnow.org/keepiton-data-dashboard/" rel="noopener">Access Now #KeepItOn</a>, licensed <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>. The cause of each event is verified and labelled by hand by that coalition. Updates are irregular and do not reflect live status.',
  creditNaturalEarth: 'Country outlines come from <a href="https://www.naturalearthdata.com/" rel="noopener">Natural Earth</a> (public domain, 110m scale).',
  creditOsm: 'The clearer thin lines over the sea are submarine cables from <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors (ODbL), with better coverage across Europe, the Mediterranean and the Atlantic. The faintest layer sketches the major transoceanic corridors as great-circle arcs between publicly known landing points: only the general direction is meaningful, and real routing needs a dedicated cable map.',

  circTag: 'Illustrative path　guard → middle → exit',
  ccClose: 'Close',
  loading: 'Loading…',
  hintWide: 'Drag to rotate · scroll or pinch to zoom and more country labels appear · rotation resumes when you let go',
  hintNarrow: 'Drag to rotate · pinch to reveal more labels',
  hintClose: 'Got it',
  toggleOpen: '▾ Hide',
  toggleClosed: '▸ Details',

  backendDetecting: 'Detecting…',
  backendWebGL: 'WebGL2 (fallback)',
  backendSep: ': ',
  blkForced: 'the URL asked for backend=webgl',
  blkInsecure: 'the page is not on https or localhost',
  blkNoGpu: 'this browser has no WebGPU',
  blkNoAdapter: 'the system offered no usable GPU',
  blkRejected: 'WebGPU was refused',
  fatalNoGpu: 'This browser can enable neither WebGPU nor WebGL2, so the globe cannot be drawn.',
  fatalRender: 'Rendering stopped. Reload the page to try again.',
  fatalLoad: 'The globe failed to load, possibly because the data did not arrive. Reload the page to try again.',
};

const ZH_CN = {
  pageTitle: 'Tor 中继地球仪',
  unitRelays: '台运作中的中继',
  snapshotAt: '数据快照：',
  btnLive: '实时更新',
  liveNote: '画面预设读站上的静态快照，不会对外连线。按下这个键会由你的浏览器直接连到 onionoo.anoni.net 取最新数据，那台服务器就会看到你的 IP。',

  lblRoles: '角色分布（点一下只看这个角色，再点一次看全部）',
  lblBrightness: '陆地亮度：由低到高（非线性，中段差距已放大）',
  modeCount: '中继台数',
  modeWeight: '共识权重',
  modeConc: '业者集中度',
  modeUsers: '使用者数',
  modeUsersTip: '陆地亮度改成各国估计有多少人在用 Tor，中继点照样显示',
  rampLow: '无',
  rampHigh: '最多',

  lblMix: '各国中继数与角色组成（30 台以上）',
  lblAsn: '托管商排行（全球）',
  lblAsia: '亚洲邻近国家',
  lblUsers: '用的人最多的地方（Tor Metrics 估计）',
  lblOoni: 'Tor 连线受阻的地方（OONI 观测）',
  lblShutdown: '网络被整个关掉的地方（Access Now 记录）',

  note: '陆地的亮度代表该国有多少台中继，愈亮的国家托管的中继愈多。角色分布那四个标签点下去，地球会只留那一种角色，深浅一样是数量。点国家标签可以看那一国的细节。近万台中继看似遍布全球，实际高度集中在美国、德国、荷兰这几块亮起来的地方，这个顺序照台数排。换成带宽排，前三名会变成德国、荷兰、美国，美国的中继台数最多，单台扛的流量比较小。Onionoo 只给到国别，没有更精确的位置，地图上呈现的是国家层级的数量。远看时地球上只画其中一部分的点，放大会逐步补齐到全部，要读密度请看陆地亮度，那个一直是全部的台数。',

  creditTitle: '数据来源',
  creditOnionoo: '中继数据来自 <a href="https://metrics.torproject.org/onionoo.html" rel="noopener">Onionoo</a>，经自架的 onionoo.anoni.net 取回。只取到国家层级的聚合，没有个别中继的识别信息。',
  creditMetrics: '使用者估计与网桥统计来自 <a href="https://metrics.torproject.org/" rel="noopener">Tor Metrics</a>，授权 <a href="https://creativecommons.org/publicdomain/zero/1.0/" rel="noopener">CC0 1.0</a>。人数是用中继收到的目录请求反推的估计值，置信区间相当宽，不是普查。',
  creditOoni: 'Tor 连线观测来自 <a href="https://ooni.org/" rel="noopener">OONI</a>（Open Observatory of Network Interference），授权 <a href="https://github.com/ooni/license/blob/master/data/LICENSE.md" rel="noopener">CC BY-NC-SA 4.0</a>。画面呈现的是 tor 测试近 30 天各国没有照预期完成的比率，OONI 称为 anomaly，成因包含连线被挡、网络不稳与 ISP 故障。',
  creditAccessNow: '网络关闭事件来自 <a href="https://www.accessnow.org/keepiton-data-dashboard/" rel="noopener">Access Now #KeepItOn</a> 的 STOP 数据集，授权 <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>。每笔事件的成因由该联盟人工查证后标注，更新是不定期的，不是实时状态。',
  creditNaturalEarth: '国界轮廓来自 <a href="https://www.naturalearthdata.com/" rel="noopener">Natural Earth</a>（public domain，110m 比例尺）。',
  creditOsm: '海面上看得比较清楚的细线是海底电缆，来自 <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> 贡献者（ODbL），收录以欧洲、地中海与大西洋较完整。最淡的一层是主要跨洋走廊的示意，取两端公开的登陆地点拉出大圆弧，只有走向可信，实际路由要看专门的海缆地图。',

  circTag: '示意路径　guard → middle → exit',
  ccClose: '关闭',
  loading: '载入中…',
  hintWide: '拖曳旋转地球 · 滚轮或双指放大会浮出更多国家标签 · 放开后自动转',
  hintNarrow: '拖曳旋转 · 双指放大浮出更多标签',
  hintClose: '知道了',
  toggleOpen: '▾ 收合',
  toggleClosed: '▸ 详情',

  backendDetecting: '检测中…',
  backendWebGL: 'WebGL2（fallback）',
  backendSep: '：',
  blkForced: '网址带了 backend=webgl',
  blkInsecure: '页面不是 https 或 localhost',
  blkNoGpu: '这个浏览器没有 WebGPU',
  blkNoAdapter: '系统没有给出可用的 GPU',
  blkRejected: 'WebGPU 被挡下',
  fatalNoGpu: '这个浏览器无法启用 WebGPU 或 WebGL2，地球仪画不出来。',
  fatalRender: '显示已中断，刷新页面可以再试一次。',
  fatalLoad: '地球仪载入失败，数据可能没抓到。刷新页面可以再试一次。',
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
