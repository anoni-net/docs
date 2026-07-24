// 洋蔥路由解謎 · 三語字串
// zh-TW 是 single source of truth，先填滿；en / zh-cn 目前沿用 zh-TW 當 placeholder，待同步。
// 遊戲名稱尚未定案，先用一個字串 gameTitle 集中管理，日後改名只動這裡。

const ZH_TW = {
  gameTitle: '路由任務（暫名）',
  tagline: '把訊息安全送到對岸',

  backendDetecting: '偵測繪圖後端…',
  backendWebGPU: 'WebGPU',
  backendWebGL: 'WebGL2（fallback）',
  backendError: '這個瀏覽器不支援 WebGPU 或 WebGL2',

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

  // 圖例
  legendTitle: '圖例',
  legendSource: '你（寄件端）',
  legendDest: '收件人',
  legendRelay: '一般中繼',
  legendSurveilled: '被監聽的中繼',
  legendBlocked: '被審查者封鎖',
  legendBridge: '橋接（Bridge）',
  legendRegion: '顏色代表所在 ASN／地區',

  // 驗證回饋
  failHopsCount: '一條 Tor 路徑固定是 3 跳，你目前選了 {n} 個。請補齊入口、中繼、出口各一個。',
  failSurveilled: '「{name}」正在被監聽，流量經過它就會被看光。換一個乾淨的中繼。',
  failBlocked: '「{name}」已被審查者封鎖，連不上去。這一關的直連入口都被擋住了，改從橋接進入。',
  failDiversity: '這 3 個中繼落在同一個 ASN／地區，對手只要盯住那個 ASN 就能同時看到入口與出口。把 3 跳分散到不同 ASN。',
  failNeedBridge: '直連入口都被封鎖了。第一跳（入口）要選一個橋接節點，才連得進 Tor 網路。',

  // 關卡名稱與目標
  nameL1: '三跳的基本',
  nameL2: '避開監聽',
  nameL3: '分散到不同 ASN',
  nameL4: '封鎖時走橋接',
  objL1: '任意選 3 個中繼，把訊息從你送到收件人。',
  objL2: '避開被監聽的紅色中繼，選一條乾淨的 3 跳路徑。',
  objL3: '3 跳要落在 3 個不同的 ASN／地區，不能擠在同一個。',
  objL4: '直連入口被封鎖了。第一跳改用橋接節點進入 Tor。',

  // 每關教學卡（成功後顯示）
  teachTitle: '你剛剛做了什麼',
  teachL1: '訊息經過 3 個中繼才到收件人。入口那台知道你是誰，卻不知道你要連去哪。出口那台知道目的地，卻不知道你是誰。3 跳把「你是誰」和「你要連哪」拆開，沒有任何一台同時掌握兩端。',
  teachL2: '其中幾台中繼正在被監聽，流量一經過就會被記錄。真正的 Tor 網路裡，中繼由世界各地的志工營運，多數可信，但你無法假設每一台都乾淨。分散信任、避開已知有問題的節點，本身就是路由選擇的一部分。',
  teachL3: '這一關的重點是 ASN（自治系統，網路上一群共同管理的 IP）。就算 3 台中繼分屬不同機房，只要都在同一個 ASN，盯住那個 ASN 的對手就能同時看到入口與出口。把 3 跳分散到不同 ASN，才真的拆開兩端。anoni.net 長期觀測台灣的 Tor 中繼落在哪些 ASN，就是為了看這種分散夠不夠。',
  teachL4: '審查者把已知的 Tor 中繼位址整批封鎖，你連第一跳都連不上。橋接（Bridge）是沒有公開在名單上的入口，像 Snowflake、obfs4、WebTunnel，把流量偽裝成一般連線，先帶你進 Tor 網路，之後的中繼與出口照常運作。',
  learnMoreTor: '延伸閱讀：什麼是 Tor',
  learnMoreAsn: '延伸閱讀：台灣 ASN 觀測涵蓋',
  learnMoreSnowflake: '延伸閱讀：Tor Snowflake 橋接',

  allClearTitle: '全部通關',
  allClearBody: '你走過了 Tor 路由的幾個核心取捨：三跳、分散 ASN、封鎖時改走橋接。這只是 Phase 1 的第一個關卡集，之後會再加。',
};

// en / zh-cn 待同步：先以 zh-TW 內容佔位，避免缺字串。翻譯時再逐句改寫。
const EN = { ...ZH_TW };
const ZH_CN = { ...ZH_TW };

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
