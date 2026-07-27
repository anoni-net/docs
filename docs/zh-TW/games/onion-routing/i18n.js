// 洋蔥路由解謎 · 三語字串
// zh-TW 是 single source of truth。三份表的 key 必須一致，缺 key 時 t() 會退回 zh-TW。
// 遊戲名稱集中在 gameTitle，改名只動這裡（index.html 另有一份靜態 fallback，避免載入前空白）。

const ZH_TW = {
  gameTitle: 'Tor 路由解謎',
  tagline: '把訊息安全送到對岸',

  backendDetecting: '偵測繪圖後端…',
  backendWebGPU: 'WebGPU',
  backendWebGL: 'WebGL2（fallback）',
  backendError: '這個瀏覽器不支援 WebGPU 或 WebGL2',
  backendSep: '：',
  hintClose: '知道了',
  blkForced: '網址帶了 backend=webgl',
  blkInsecure: '頁面不是 https 或 localhost',
  blkNoGpu: '這個瀏覽器沒有 WebGPU',
  blkNoAdapter: '系統沒有給出可用的 GPU',
  blkRejected: 'WebGPU 被擋下',

  // HUD
  levelLabel: '關卡',
  objectiveTitle: '任務目標',
  hopGuard: '入口（Guard）',
  hopMiddle: '中繼（Middle）',
  hopExit: '出口（Exit）',
  hopEmpty: '尚未選擇',
  btnSend: '送出訊息',
  btnReset: '重選',
  btnNext: '下一關',
  btnReplay: '再玩一次',
  selectHint: '在畫面中依序點選 3 個中繼，組成一條路徑。再點一次可取消。',
  dragHint: '拖曳可旋轉視角，滾輪或雙指可縮放。',
  hintShort: '依序點 3 個中繼。再點一次可取消。拖曳可轉視角。',
  hintEndpoint: '這是你和收件人，位置固定在兩端。要選的是中間那些中繼。',
  hintFull: '已經選滿 {n} 個。再點一次已選的中繼可以取消那一跳，或按重選。',
  runtimeError: '畫面發生錯誤，重新整理頁面可以再試一次。',

  // 圖例
  legendTitle: '圖例',
  legendSource: '你（寄件端）',
  legendDest: '收件人',
  legendRelay: '一般中繼',
  legendSurveilled: '被監聽的中繼',
  legendBlocked: '被審查者封鎖',
  legendBridge: '橋接（Bridge）',
  legendRegion: '顏色代表所在的 ASN、地區',

  // 驗證回饋
  failHopsCount: '一條 Tor 路徑固定是 3 跳，你目前選了 {n} 個。請補齊入口、中繼、出口各一個。',
  failSurveilled: '「{name}」正在被監聽，流量經過它就會被看光。換一個乾淨的中繼。',
  failBlocked: '「{name}」已被審查者封鎖，連不上去。這一關的直連入口都被擋住了，改從橋接進入。',
  failDiversity: '這 3 跳沒有分散到 3 個不同的 ASN，其中有節點落在同一個 ASN。對手只要盯住那個 ASN，就能同時看到入口與出口。把 3 跳分到不同 ASN。',
  failNeedBridge: '直連入口都被封鎖了。第一跳（入口）要選一個橋接節點，才連得進 Tor 網路。',
  failBridgeOnlyEntry: '橋接只用在入口這一跳。中繼與出口要選一般中繼。',

  // 關卡名稱與目標
  nameL1: '三跳的基本',
  nameL2: '避開監聽',
  nameL3: '分散到不同 ASN',
  nameL4: '封鎖時走橋接',
  objL1: '任意選 3 個中繼，把訊息從你送到收件人。',
  objL2: '避開被監聽的紅色中繼，選一條乾淨的 3 跳路徑。',
  objL3: '3 跳要落在 3 個不同的 ASN。顏色相同代表同一個 ASN，這一關也還有被監聽的中繼。',
  objL4: '直連入口被封鎖了。第一跳改用橋接節點進入 Tor。',

  // 每關教學卡（成功後顯示）
  teachTitle: '你剛剛做了什麼',
  teachL1: '訊息經過 3 個中繼才到收件人。入口那台知道你是誰，卻不知道你要連去哪。出口那台知道目的地，卻不知道你是誰。3 跳把「你是誰」和「你要連哪」拆開，沒有任何一台同時掌握兩端。',
  teachL2: '其中幾台中繼正在被監聽，流量一經過就會被記錄。真正的 Tor 網路裡，中繼由世界各地的志工營運，多數可信，但你無法假設每一台都乾淨。分散信任、避開已知有問題的節點，本身就是路由選擇的一部分。',
  teachL3: 'ASN（自治系統，網路上一群共同管理的 IP）是這一關的重點。就算 3 台中繼分屬不同機房，只要都在同一個 ASN，盯住那個 ASN 的對手就能同時看到入口與出口。把 3 跳分散到不同 ASN，才真的拆開兩端。anoni.net 長期觀測台灣的 Tor 中繼落在哪些 ASN，就是為了看這種分散夠不夠。',
  teachL4: '審查者把已知的 Tor 中繼位址整批封鎖，你連第一跳都連不上。橋接（Bridge）是沒有公開在名單上的入口，像 Snowflake、obfs4、WebTunnel，把流量偽裝成一般連線，先帶你進 Tor 網路，之後的中繼與出口照常運作。',
  learnMoreTor: '延伸閱讀：什麼是 Tor',
  learnMoreAsn: '延伸閱讀：台灣 ASN 觀測涵蓋',
  learnMoreSnowflake: '延伸閱讀：Tor Snowflake 橋接',

  allClearTitle: '全部通關',
  allClearLink: '回互動與呈現看其他作品',
  allClearBody: '你走過了 Tor 路由的幾個核心取捨：三跳、分散 ASN、封鎖時改走橋接。這只是 Phase 1 的第一個關卡集，之後會再加。',
  regionTW: '台灣',
  regionJP: '日本',
  regionDE: '德國',
  regionNL: '荷蘭',
  regionUS: '美國',
  regionSE: '瑞典',
  sepBar: '｜',
  // 遊戲只有一份，永遠跑在 /docs/games/onion-routing/，所以 ../../ 是 /docs/。
  // en 站沒有 what-is-tor 與 ooni-asn-coverage，改指向英文站真的有、主題也對得上的頁。
  // tor-snowflake 原本也沒有，PR #153 合併時 main 上已經補上英文版，所以接回真正對題的那篇。
  // 總覽頁是靜態 mkdocs 頁，掛 ?lang= 沒有作用，要直接連到各語系自己那份。
  docOverview: '../index.html',
  docTor: '../../tools/what-is-tor/',
  docAsn: '../../taiwan/ooni-asn-coverage/',
  docSnowflake: '../../tools/tor-snowflake/',
};

const EN = {
  gameTitle: 'Tor Routing Puzzle',
  tagline: 'Get the message safely to the other side',

  backendDetecting: 'Detecting graphics backend…',
  backendWebGPU: 'WebGPU',
  backendWebGL: 'WebGL2 (fallback)',
  backendError: 'This browser supports neither WebGPU nor WebGL2',
  backendSep: ': ',
  hintClose: 'Got it',
  blkForced: 'the URL asked for backend=webgl',
  blkInsecure: 'the page is not on https or localhost',
  blkNoGpu: 'this browser has no WebGPU',
  blkNoAdapter: 'the system offered no usable GPU',
  blkRejected: 'WebGPU was refused',

  // HUD
  levelLabel: 'Level',
  objectiveTitle: 'Objective',
  hopGuard: 'Entry (Guard)',
  hopMiddle: 'Relay (Middle)',
  hopExit: 'Exit',
  hopEmpty: 'Not selected',
  btnSend: 'Send message',
  btnReset: 'Clear',
  btnNext: 'Next level',
  btnReplay: 'Play again',
  selectHint: 'Click 3 relays in order to build a path. Click one again to deselect it.',
  dragHint: 'Drag to rotate the view, scroll or pinch to zoom.',
  hintShort: 'Pick 3 relays in order. Click again to deselect. Drag to rotate.',
  hintEndpoint: 'These are you and the recipient, fixed at each end. Pick from the relays in between.',
  hintFull: 'All {n} hops are chosen. Click a selected relay to drop that hop, or press Clear.',
  runtimeError: 'Something went wrong on screen. Reload the page to try again.',

  // 圖例
  legendTitle: 'Legend',
  legendSource: 'You (sender)',
  legendDest: 'Recipient',
  legendRelay: 'Ordinary relay',
  legendSurveilled: 'Relay under surveillance',
  legendBlocked: 'Blocked by the censor',
  legendBridge: 'Bridge',
  legendRegion: 'Colour shows the ASN or region',

  // 驗證回饋
  failHopsCount: 'A Tor path is always 3 hops. You have picked {n}. Fill in one entry, one middle and one exit.',
  failSurveilled: '"{name}" is under surveillance. Traffic passing through it is fully exposed. Pick a clean relay instead.',
  failBlocked: '"{name}" has been blocked by the censor and cannot be reached. Every direct entry in this level is blocked, so come in through a bridge.',
  failDiversity: 'These 3 hops do not sit in 3 different ASNs. Some of them share one. An adversary watching that single ASN can see both the entry and the exit at once. Spread the hops across different ASNs.',
  failNeedBridge: 'Every direct entry is blocked. The first hop has to be a bridge to get into the Tor network at all.',
  failBridgeOnlyEntry: 'Bridges are only used for the entry hop. The middle and exit have to be ordinary relays.',

  // 關卡名稱與目標
  nameL1: 'Three hops, the basics',
  nameL2: 'Avoiding surveillance',
  nameL3: 'Spreading across ASNs',
  nameL4: 'Bridges when blocked',
  objL1: 'Pick any 3 relays to carry the message from you to the recipient.',
  objL2: 'Avoid the red relays under surveillance and build a clean 3-hop path.',
  objL3: 'The 3 hops have to land in 3 different ASNs. Matching colours mean the same ASN, and some relays here are still under surveillance.',
  objL4: 'Direct entries are blocked. Use a bridge for the first hop to get into Tor.',

  // 每關教學卡（成功後顯示）
  teachTitle: 'What you just did',
  teachL1: 'The message passed through 3 relays before reaching the recipient. The entry relay knows who you are but not where you are going. The exit relay knows the destination but not who you are. Three hops split "who you are" from "where you are going", and no single relay holds both ends.',
  teachL2: 'Some of those relays were under surveillance, recording traffic as it passed. In the real Tor network relays are run by volunteers worldwide. Most are trustworthy, but you cannot assume every one of them is clean. Spreading trust and avoiding known bad nodes is itself part of choosing a route.',
  teachL3: 'ASNs (autonomous systems, groups of IP addresses under shared management) are the point of this level. Even if 3 relays sit in different data centres, an adversary watching a single ASN they all belong to can see both the entry and the exit. Spreading the hops across different ASNs is what actually keeps the two ends apart. anoni.net tracks which ASNs Taiwan\'s Tor relays land in for exactly this reason.',
  teachL4: 'The censor blocked every known Tor relay address at once, so you could not even reach the first hop. A bridge is an entry point that is not on any public list. Snowflake, obfs4 and WebTunnel disguise the traffic as an ordinary connection to get you into the Tor network, after which the middle and exit relays work as usual.',
  learnMoreTor: 'Further reading: anonymity vs privacy',
  learnMoreAsn: 'Further reading: watching the relay network',
  learnMoreSnowflake: 'Further reading: Tor Snowflake bridges',

  allClearTitle: 'All levels cleared',
  allClearLink: 'Back to Interactive for the other works',
  allClearBody: 'You have walked through several of the core trade-offs in Tor routing: three hops, spreading across ASNs, and switching to bridges when blocked. This is only the first set of levels from Phase 1, with more to come.',
  regionTW: 'Taiwan',
  regionJP: 'Japan',
  regionDE: 'Germany',
  regionNL: 'Netherlands',
  regionUS: 'United States',
  regionSE: 'Sweden',
  sepBar: ' | ',
  docOverview: '../../en/games/',
  docTor: '../../en/basics/anonymity-vs-privacy/',
  docAsn: '../../en/regional/tor-relay-watcher/',
  docSnowflake: '../../en/tools/tor-snowflake/',
};

const ZH_CN = {
  gameTitle: 'Tor 路由解谜',
  tagline: '把消息安全送到对岸',

  backendDetecting: '检测绘图后端…',
  backendWebGPU: 'WebGPU',
  backendWebGL: 'WebGL2（fallback）',
  backendError: '这个浏览器不支持 WebGPU 或 WebGL2',
  backendSep: '：',
  hintClose: '知道了',
  blkForced: '网址带了 backend=webgl',
  blkInsecure: '页面不是 https 或 localhost',
  blkNoGpu: '这个浏览器没有 WebGPU',
  blkNoAdapter: '系统没有给出可用的 GPU',
  blkRejected: 'WebGPU 被挡下',

  // HUD
  levelLabel: '关卡',
  objectiveTitle: '任务目标',
  hopGuard: '入口（Guard）',
  hopMiddle: '中继（Middle）',
  hopExit: '出口（Exit）',
  hopEmpty: '尚未选择',
  btnSend: '发送消息',
  btnReset: '重选',
  btnNext: '下一关',
  btnReplay: '再玩一次',
  selectHint: '在画面中依序点选 3 个中继，组成一条路径。再点一次可取消。',
  dragHint: '拖曳可旋转视角，滚轮或双指可缩放。',
  hintShort: '依序点 3 个中继。再点一次可取消。拖曳可转视角。',
  hintEndpoint: '这是你和收件人，位置固定在两端。要选的是中间那些中继。',
  hintFull: '已经选满 {n} 个。再点一次已选的中继可以取消那一跳，或按重选。',
  runtimeError: '画面发生错误，刷新页面可以再试一次。',

  // 圖例
  legendTitle: '图例',
  legendSource: '你（发送端）',
  legendDest: '收件人',
  legendRelay: '一般中继',
  legendSurveilled: '被监听的中继',
  legendBlocked: '被审查者封锁',
  legendBridge: '网桥（Bridge）',
  legendRegion: '颜色代表所在的 ASN、地区',

  // 驗證回饋
  failHopsCount: '一条 Tor 路径固定是 3 跳，你目前选了 {n} 个。请补齐入口、中继、出口各一个。',
  failSurveilled: '「{name}」正在被监听，流量经过它就会被看光。换一个干净的中继。',
  failBlocked: '「{name}」已被审查者封锁，连不上去。这一关的直连入口都被挡住了，改从网桥进入。',
  failDiversity: '这 3 跳没有分散到 3 个不同的 ASN，其中有节点落在同一个 ASN。对手只要盯住那个 ASN，就能同时看到入口与出口。把 3 跳分到不同 ASN。',
  failNeedBridge: '直连入口都被封锁了。第一跳（入口）要选一个网桥节点，才连得进 Tor 网络。',
  failBridgeOnlyEntry: '网桥只用在入口这一跳。中继与出口要选一般中继。',

  // 關卡名稱與目標
  nameL1: '三跳的基本',
  nameL2: '避开监听',
  nameL3: '分散到不同 ASN',
  nameL4: '封锁时走网桥',
  objL1: '任意选 3 个中继，把消息从你送到收件人。',
  objL2: '避开被监听的红色中继，选一条干净的 3 跳路径。',
  objL3: '3 跳要落在 3 个不同的 ASN。颜色相同代表同一个 ASN，这一关也还有被监听的中继。',
  objL4: '直连入口被封锁了。第一跳改用网桥节点进入 Tor。',

  // 每關教學卡（成功後顯示）
  teachTitle: '你刚刚做了什么',
  teachL1: '消息经过 3 个中继才到收件人。入口那台知道你是谁，却不知道你要连去哪。出口那台知道目的地，却不知道你是谁。3 跳把「你是谁」和「你要连哪」拆开，没有任何一台同时掌握两端。',
  teachL2: '其中几台中继正在被监听，流量一经过就会被记录。真正的 Tor 网络里，中继由世界各地的志愿者运营，多数可信，但你无法假设每一台都干净。分散信任、避开已知有问题的节点，本身就是路由选择的一部分。',
  teachL3: 'ASN（自治系统，网络上一群共同管理的 IP）是这一关的重点。就算 3 台中继分属不同机房，只要都在同一个 ASN，盯住那个 ASN 的对手就能同时看到入口与出口。把 3 跳分散到不同 ASN，才真的拆开两端。anoni.net 长期观测台湾的 Tor 中继落在哪些 ASN，就是为了看这种分散够不够。',
  teachL4: '审查者把已知的 Tor 中继地址整批封锁，你连第一跳都连不上。网桥（Bridge）是没有公开在名单上的入口，像 Snowflake、obfs4、WebTunnel，把流量伪装成一般连线，先带你进 Tor 网络，之后的中继与出口照常运作。',
  learnMoreTor: '延伸阅读：什么是 Tor',
  learnMoreAsn: '延伸阅读：台湾 ASN 观测覆盖',
  learnMoreSnowflake: '延伸阅读：Tor Snowflake 网桥',

  allClearTitle: '全部通关',
  allClearLink: '回互动与呈现看其他作品',
  allClearBody: '你走过了 Tor 路由的几个核心取舍：三跳、分散 ASN、封锁时改走网桥。这只是 Phase 1 的第一个关卡集，之后会再加。',
  regionTW: '台湾',
  regionJP: '日本',
  regionDE: '德国',
  regionNL: '荷兰',
  regionUS: '美国',
  regionSE: '瑞典',
  sepBar: '｜',
  docOverview: '../../zh-cn/games/',
  docTor: '../../zh-cn/tools/what-is-tor/',
  docAsn: '../../zh-cn/taiwan/ooni-asn-coverage/',
  docSnowflake: '../../zh-cn/tools/tor-snowflake/',
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

// 語言切換。三個語系共用同一份程式，差別只在網址參數，所以原地換 query 就好。
// 語言名稱各自用自己的語言寫，不跟著介面翻譯，否則使用者落在看不懂的語言時找不到自己要哪一個。
// zh-TW 是預設不掛參數，維持乾淨的正規網址。
const LANG_NAMES = [['zh-TW', '正體中文'], ['zh-cn', '简体中文'], ['en', 'English']];

export function langLinksHTML(lang) {
  return LANG_NAMES.map(([code, name]) => {
    if (code === lang) return `<span class="on">${name}</span>`;
    const u = new URL(location.href);
    if (code === 'zh-TW') u.searchParams.delete('lang');
    else u.searchParams.set('lang', code);
    return `<a href="${u.pathname}${u.search}">${name}</a>`;
  }).join('<i>·</i>');
}
