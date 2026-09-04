/*
 * anoni.net Docs PWA service worker
 *
 * 策略：
 * - 預快取：app shell（theme CSS/JS）+ 讀者當下語系的核心章節 + offline fallback 頁
 * - HTML（navigation）：network-first，離線時回快取，再不行回該語系 offline 頁
 * - 靜態資產：stale-while-revalidate，runtime 快取設上限避免膨脹。裝置上沒有副本
 *   時等網路有上限，逾時給 504 讓頁面繼續渲染
 * - 跨域請求（含 aa.anoni.net 分析）一律放行不快取
 *
 * __BUILD_VERSION__ 由 build_docs_anoni.sh 於部署時替換，
 * 換版後 activate 階段會清除舊快取。
 *
 * manifest 的 id：docs/zh-TW/manifest.webmanifest 由 run.sh 建到 /docs/，裡面的 id
 * 寫成 "/docs/"。規格上 id 相對 origin 解析，結果是 https://anoni.net/docs/。
 * en 與 zh-cn 各自有獨立的 manifest 與 id。
 *
 * manifest 的 scope：zh-TW 寫 "."（解析成 /docs/），en 與 zh-cn 寫 ".."（退一層，同樣
 * 是 /docs/）。JSON 沒地方寫註解，理由記在這裡：三件互動作品只建置一份在根路徑
 * /docs/games/，en 與 zh-cn 用 ?lang= 連過去共用同一份。那兩份 scope 若寫 "."，就只
 * 涵蓋自己的語系前綴（/docs/en/），讀者在已安裝的 app 裡點進作品會離開 scope，
 * Android Chrome 會掛出網址列，看起來像掉出 app。用相對值而不是寫死 "/docs/"，
 * 本地 mkdocs serve 在 "/" 底下跑的時候一樣解析得出有效的 scope。
 *
 * 注意：theme 資產的 hash 檔名需與 overrides/base.html 同步，
 * 升級 mkdocs-material 時要一併更新。
 */

const VERSION = "__BUILD_VERSION__";
const PRECACHE = "anoni-docs-precache-" + VERSION;
// runtime 拆兩個。原本導覽頁與圖片、字型共用同一個 200 筆上限，
// 圖多的頁面逛幾輪就會把讀者想留著離線看的頁面擠掉。
//
// 這兩個名稱刻意不帶 VERSION。VERSION 是分鐘級時間戳，每次部署必定改變，而
// activate 會刪掉所有不在保留名單裡的快取，等於讀者累積的離線頁面每次部署都
// 被清空一次，接著又要把整份預快取重下載一遍。頁面的新鮮度由 network-first
// 維持，不需要靠換快取名稱來換版。PRECACHE 保留版本後綴，那批是 hash 檔名的
// app shell，換版後舊的確實該整批丟掉。
// 這兩個快取只在「自動存下內容」開著的時候寫。原本是無條件寫的，結果是讀者按了
// 「清除所有離線內容」之後，每讀一頁就又被存回裝置一頁，上限 120 頁加 200 個資產，
// 而管理頁上的說明只講會補回 0.7 MB。按那顆按鈕的人多半是因為裝置可能被檢查，
// 說了不留就不該留。
const RUNTIME_PAGES = "anoni-docs-pages";
const RUNTIME_ASSETS = "anoni-docs-assets";
const PAGES_MAX_ENTRIES = 120;
const ASSETS_MAX_ENTRIES = 200;

// 讀者在離線內容管理頁自己勾選留下的頁面。跟 runtime 快取分開放，才不會被那邊的
// 筆數上限擠掉，也不跟著 PRECACHE 的版本走。讀者刻意留的東西不該因為網站換版就
// 消失，內容的新鮮度由管理頁的「更新」按鈕與 network-first 負責。
const LIBRARY = "anoni-docs-library";

// 讀者勾的那些頁面自己引用的圖與程式。跟頁面分開放，libraryEntries 才數得出
// 「你自己選存的 N 頁」，不會把幾十張圖也算成頁數。哪些資產屬於哪一頁由
// offline-index.json 說了算，管理頁送過來之前已經去重。
const LIBRARY_ASSETS = "anoni-docs-library-assets";

// 設定值。目前只有一項：要不要自動預快取。
//
// 存在 Cache Storage 而不是 localStorage，因為 install 階段的 SW 讀不到 localStorage，
// 而「讀者清空過離線內容」這件事必須在下一次部署的 install 也記得，否則清完隔天
// 就被自動下載回來，等於沒清。
const SETTINGS = "anoni-docs-settings";
const AUTO_PRECACHE_URL = "/__anoni-settings/auto-precache";

// 核心章節的內文圖要不要一起存。預設不存：那批圖有七 MB，會讓自動下載的量從
// 十一 MB 變成十八 MB，而多數讀者在行動網路上。想要完整離線閱讀的人自己打開。
const PRECACHE_IMAGES_URL = "/__anoni-settings/precache-images";

// 這個 SW 發出去的每一個請求都要繞過瀏覽器自己的 HTTP 快取。
//
// 沒帶 cache 選項的 fetch 會先問裝置上的 HTTP 快取，命中就直接回，網路那條根本
// 不出門。network-first 於是看起來問過網路，實際上問的是自己，而那份舊回應還會
// 被寫回 RUNTIME_PAGES，讓舊內容更久留在裝置上。
//
// 2026-08-28 就是這樣：Cloudflare 上一條 browser_ttl 為 override_origin 的 Cache
// Rule 把送給讀者的 HTML 一律設成 max-age=14400，新發布的內容有四小時進不了
// PWA。分頁裡的 Safari 讀者感覺不到，從網址列進站或下拉重新整理的 cache mode 是
// reload，本來就繞過 HTTP 快取。standalone 的 PWA 冷啟動與站內點連結都是
// default，加上 iOS 的 home screen app 有獨立的 storage 分區，Safari 那邊抓到
// 新內容也傳不過來，於是只有 PWA 一直卡在舊版。
//
// 同一天收尾成兩層。m6 的 nginx 對 /docs/ 的頁面與兩份索引送 no-cache（見
// anoninet.conf 的 map $docs_cache_control），Cloudflare 那條規則的 browser_ttl
// 改成 respect origin 讓它傳下來，edge 照樣快取 24 小時，由 cf_purge.py 清。
//
// 這裡照樣帶著 no-cache，兩層各自獨立。上游的設定會被人改，改的人未必知道 SW
// 靠它吃飯，而症狀是讀者拿不到剛發布的內容，在瀏覽器上點來點去看不出來。
//
// no-cache 這個名字容易誤會，它的意思是每次都跟伺服器確認一次，內容沒變時回
// 304，成本是一個往返。快取照樣留著。
const NO_HTTP_CACHE = { credentials: "same-origin", cache: "no-cache" };

// SW scope 在正式站是 /docs/，本地開發（mkdocs serve）是 /
const SCOPE_PATH = new URL(self.registration.scope).pathname;

// 各語系 build 的根路徑前綴（相對於 scope）。網站跑三次 mkdocs build（run.sh、
// run_zh-cn.sh、run_en.sh），預設語系 zh-TW 由 run.sh 建在根路徑，另兩語各有前綴。
//
// 執行期一次只預快取其中一個（見 precacheUrlsFor）。這份清單是語系有哪些的單一
// 來源，langPrefixOf 與 tools/check_precache.mjs 都讀它。
const LANG_PREFIXES = ["", "zh-cn/", "en/"];

// 每個語系各一份的資產：theme app shell（hash 檔名與 overrides/base.html 同步），
// 加上離線內容管理頁要用的兩份。管理頁本身在 CORE_PAGES 裡，但它離線打開時還需要
// 自己的程式與那份頁面索引，少了索引就只剩「清除全部」可以按。
//
// 這份清單只放 bootstrap：帶雜湊檔名的 theme 資產，加上索引本身。站台自己那批每頁
// 都載入的樣式與腳本（stylesheets/extra.css、js/analytics.js 之類）寫在索引的 shell
// 欄位，由 shellAssetsFor 讀出來，頁面改了引用什麼不必回來改這裡。
//
// 2026-09-04 之前那批沒有人負責：建置端把每頁都出現的資產從個別頁面移除，這裡又
// 沒有收，於是讀者按了「全部存到裝置」，227 頁的 HTML 一頁不缺，離線打開是白的。
// 三語系位元組完全相同的資產落在哪些目錄底下。
//
// 三次 mkdocs build 產出的內容一模一樣，只有路徑前綴不同，所以讀者切過語言之後，
// 裝置上會存兩三份同樣的東西，也重新下載了兩三次。預快取這些一律用根路徑那一份，
// 離線比對時把帶語系前綴的網址退回根路徑。目前省下約 0.3 MB。
//
// 這裡列的是目錄，不是「檔名相同就共用」。反例是 assets/javascripts/bundle.*.js 與
// stylesheets/extra.css：檔名一樣（bundle 連雜湊都一樣），內容各語系不同，privacy
// plugin 把第三方資源在地化之後，嵌進去的絕對網址帶著語系前綴。
//
// check_precache.mjs 驗這件事，落在這些前綴底下而三語系位元組不同的會紅燈。theme
// 升級讓某一個開始分語系時擋得下來。
const CROSS_LANG_PREFIXES = [
  "assets/external/",
  "assets/images/",
  "assets/stylesheets/",
  "assets/javascripts/workers/",
  "js/",
];

function crossLangAsset(asset) {
  return CROSS_LANG_PREFIXES.some((prefix) => asset.startsWith(prefix));
}

// 預快取一個資產時該用哪個網址。三語系共用的走根路徑，其餘跟著語系前綴。
function assetUrlFor(prefix, asset) {
  return SCOPE_PATH + (crossLangAsset(asset) ? "" : prefix) + asset;
}

const SHELL_ASSETS = [
  "assets/stylesheets/main.ec1eaa64.min.css",
  "assets/stylesheets/palette.ab4e12ef.min.css",
  "assets/javascripts/bundle.d7400e89.min.js",
  "assets/javascripts/workers/search.2c215733.min.js",
  "assets/images/logo-white.svg",
  "assets/images/favicon.svg",
  "assets/images/icon-192.png",
  // 離線內容管理頁（hooks/offline_index.py 產生索引，js 是三語系共用的 symlink）
  "offline-index.json",
  "js/offline-library.js",
];

// zh 版（zh-TW 根、/zh-cn/）章節結構一致，預快取完整指南集 + 緊急頁。
// 個別語系若缺某頁（如 zh-CN 暫無 what-is-cryptpad），install 時 404 由 allSettled 容忍。
const CORE_PAGES_ZH = [
  "",
  "offline/",
  "guides/",
  "help/",
  // basics（概念，全部）
  "basics/",
  "basics/internet-freedom/",
  "basics/anonymity-vs-privacy/",
  "basics/threat-model/",
  "basics/metadata/",
  "basics/payments-anonymity/",
  // tools(工具，全部)
  "tools/",
  "tools/what-is-anonymity-network/",
  "tools/what-is-tor/",
  "tools/what-is-tails/",
  "tools/what-is-ooni/",
  "tools/what-is-cryptpad/",
  "tools/tor-browser-advanced/",
  "tools/tor-snowflake/",
  "tools/onionshare/",
  "tools/ooni-run-v2/",
  "tools/tails-vs-whonix-vs-qubes/",
  "tools/messaging-comparison/",
  "tools/password-manager/",
  "tools/crypto-privacy-spectrum/",
  "tools/encrypted-dns/",
  // scenarios（場景）
  //
  // 預快取是在讀者只開過首頁、沒點進去、也沒安裝 PWA 的情況下就發生的。
  // 有些頁面一旦躺在裝置的 Cache Storage 裡，本身就是指向性證據，會顯示
  // 「這台裝置下載過某某族群的保護指南全文」。這些文章自己就在教讀者清
  // 瀏覽器痕跡、提防裝置被檢查，網站不該一邊這樣教、一邊把文章推進讀者裝置。
  //
  // 判準（新增頁面時照這個問，不要只看它放在哪個資料夾）：
  //   這頁是不是用第二人稱或隱含第二人稱，指導「唯一一種身分的人」在採取
  //   某個具體行動前後該做什麼準備？
  //
  // 是的話就不要放進 CORE_PAGES。讀者主動點開時 runtime 快取仍會存下來離線
  // 可讀，那是他自己的選擇，不是網站替他決定的。
  //
  // 依這個判準，這次移除了 scenarios 的 journalist、activist、lgbtq，以及
  // taiwan/whistleblower-law（它放在法規資料夾，但整篇是揭弊者本人的行動準備
  // 清單，性質跟 journalist 一樣，按資料夾掃會漏掉）。
  // domestic-violence、election-observer 等頁本來就不在清單裡，同樣不要加。
  //
  // 旅行類保留：讀者是「任何出國的人」，不指向特定受威脅身分。
  // 工具與概念頁保留：那是說明書，讀者拿去做什麼是開放的，不鎖定身分。
  "scenarios/",
  "scenarios/asia-travel/",
  "scenarios/travel-ai-briefing/",
  // 斷網情境頁。收進來的理由跟旅行類同一個判準：讀者是「任何可能遇到中斷的人」，
  // 不是用第二人稱指導單一受威脅身分的準備清單。而且這一頁的使用時機就是網路已經
  // 斷了，靠執行期快取的話讀者要在斷網前剛好打開過才用得到
  "scenarios/shutdown/",
  // advanced（進階，全部）
  "advanced/",
  "advanced/e2ee/",
  "advanced/post-quantum/",
  "advanced/dweb-ipfs-onion/",
  "advanced/zk-identity-payments/",
  "advanced/mistaken-for-anonymity/",
  // taiwan（在地。whistleblower-law 依上面的判準排除，不是漏掉。
  // ooni-asn-coverage 與 tor-relay-watcher 的 vega 圖表離線不渲染，文字仍可讀）
  "taiwan/",
  "taiwan/ooni-checklist/",
  "taiwan/pdpa-2025/",
  "taiwan/vasp-2026/",
  "taiwan/ooni-asn-coverage/",
  "taiwan/tor-relay-watcher/",
  // community（社群，選錄離線可讀的工具頁）
  "community/onionoo-mcp/",
  // 互動與呈現的索引頁。作品本體不在這裡，見下面的 GAME_APPS。
  "games/",
];

// en 是策展型原創軌道，章節名稱與 zh 版不同（在地脈絡叫 regional/ 不叫 taiwan/），
// 但 2026-08 補齊後兩邊的覆蓋範圍已經接近，所以選錄邏輯跟 CORE_PAGES_ZH 一致：
// 完整指南集加緊急頁，身分敏感的頁面排除。
//
// 身分敏感度的判準與理由見 CORE_PAGES_ZH 上方那段長註解，新增頁面時照那個問，
// 不要只看它放在哪個資料夾。依那條判準，這裡排除了 scenarios 的 journalist、
// activist、lgbtq、domestic-violence、election-observer、mainland-speech、
// singapore-malaysia-speech、nonprofit-anonymous-donation，以及
// regional/taiwan-whistleblower-law（它放在法規資料夾，但整篇是揭弊者本人的
// 行動準備清單，按資料夾掃會漏掉，跟 zh 版排除 taiwan/whistleblower-law 同一個理由）。
const CORE_PAGES_EN = [
  "",
  "offline/",
  "about/",
  "guides/",
  "help/",
  // basics（概念，全部）
  "basics/",
  "basics/internet-freedom/",
  "basics/anonymity-vs-privacy/",
  "basics/threat-model/",
  "basics/metadata/",
  "basics/payments-anonymity/",
  "basics/platform-tracking/",
  "basics/surveillance-capability/",
  "basics/multiple-identities/",
  // tools（工具，全部）
  "tools/",
  "tools/what-is-anonymity-network/",
  "tools/what-is-tor/",
  "tools/what-is-tails/",
  "tools/what-is-ooni/",
  "tools/what-is-cryptpad/",
  "tools/tor-browser-advanced/",
  "tools/tor-snowflake/",
  "tools/onionshare/",
  "tools/grapheneos/",
  "tools/ooni-run-v2/",
  "tools/tails-vs-whonix-vs-qubes/",
  "tools/messaging-comparison/",
  "tools/password-manager/",
  "tools/asian-diceware/",
  "tools/crypto-privacy-spectrum/",
  "tools/encrypted-dns/",
  "tools/vpn-guide/",
  "tools/ai-privacy/",
  // scenarios（場景，只留不指向特定受威脅身分的）
  "scenarios/",
  "scenarios/asia-travel/",
  "scenarios/travel-ai-briefing/",
  // 斷網情境頁。收進來的理由跟旅行類同一個判準：讀者是「任何可能遇到中斷的人」，
  // 不是用第二人稱指導單一受威脅身分的準備清單。而且這一頁的使用時機就是網路已經
  // 斷了，靠執行期快取的話讀者要在斷網前剛好打開過才用得到
  "scenarios/shutdown/",
  // advanced（進階，全部）
  "advanced/",
  "advanced/e2ee/",
  "advanced/post-quantum/",
  "advanced/dweb-ipfs-onion/",
  "advanced/zk-identity-payments/",
  "advanced/mistaken-for-anonymity/",
  // regional（在地脈絡。taiwan-whistleblower-law 依上面的判準排除，不是漏掉。
  // ooni-asn-coverage 與 tor-relay-watcher 的 vega 圖表離線不渲染，文字仍可讀）
  "regional/",
  "regional/ooni-checklist/",
  "regional/taiwan-pdpa-2025/",
  "regional/taiwan-vasp-2026/",
  "regional/ooni-asn-coverage/",
  "regional/tor-relay-watcher/",
  // community（社群，選錄離線可讀的工具頁）
  "community/onionoo-mcp/",
  // 互動與呈現的索引頁。作品本體不在這裡，見下面的 GAME_APPS。
  "games/",
];

// 三件互動作品的本體。
//
// 跟核心章節不同，這一批只放一份，不跟著 LANG_PREFIXES 複製。三個語系的 games
// 索引頁各自存在，但作品本身只由 run.sh 建置到根路徑 /docs/games/<slug>/play/，其他語系是用
// ?lang= 連過去共用同一份程式。跟著前綴複製的話，另外兩個語系會抓到 404，白繞一圈。
//
// 為什麼值得預快取：這是站上唯一「已經做好、有人在用，卻沒被離線策略蓋到」的東西。
// 實際會用到的離線情境是工作坊沒有 wifi、教學現場網路很差，而那些場合正是要把畫面
// 翻給人看的時候。網頁載得出來但地球儀空白，比整頁打不開更難解釋。
//
// 成本：28 個檔案、2.33 MB。加進來之前整份預快取是 14.74 MB，所以這是 +15.8%。
// 拆開來看：
//
//   three.js vendor 1.05 MB（三件共用）
//   地球儀的資料檔   0.86 MB
//   地球儀的程式     0.30 MB
//   另外兩件         0.12 MB
//
// bathymetry.json 那 426 KB 刻意不放。它是海底等深線畫出來的深淺底色，是整批裡最大
// 的一份，而 atlas.js 抓它時帶 .catch(() => null)，最深那階的顏色又刻意等於海面的
// 單色，所以離線時少了它畫面跟以前一模一樣，不會看起來像壞掉。用最大的檔案換一層
// 純裝飾的質感，這個交換划算。
//
// 再往下砍就沒有這麼乾淨了。tw-admin（215 KB）與 countries（136 KB）是次大的兩份，
// 但前者拿掉就沒有縣市界、放大台灣只剩空白，後者是必要的，缺了整顆球都畫不出來。
// 那時畫面看起來像壞掉而不像少了東西，比整個不快取更糟。
//
// 數字用 tools/check_precache.mjs 量的，那支讀的是 apparent size，也就是實際要傳輸的
// 位元組。不要用 du 量，這台的檔案系統會共用 extent，du report 出來只有一半。
//
// 上面那組數字是作品加進來當時量的。2026-08 重量一次，整份預快取已經到 25.05 MB，
// 三件作品的 2.33 MB 佔比降到 9.3%。變大的原因是三個語系各存一份完整章節，而 en
// 那份在 2026-08 補齊之後跟 zh 差不多厚了。要縮的話該從「只預快取讀者當下的語系」
// 著手，砍作品這一批省不到多少。
//
// 身分敏感度：照 CORE_PAGES_ZH 那條判準（讀者是不是特定受威脅身分）檢查過。這三件
// 是教學性質的視覺化，跟已經在預快取裡的 tools/what-is-tor/ 同一類，不指向特定身分，
// 所以可以放。
//
// 維護：新增作品或地球儀多一份資料檔時要補進這裡，漏了的話那一份會在離線時抓不到。
// seacable.json 刻意不在清單裡，那份沒有落地到 repo。
const GAME_APPS = [
  "games/onion-routing/play/index.html",
  "games/onion-routing/play/game.js",
  "games/onion-routing/play/i18n.js",
  "games/onion-routing/play/levels.js",
  "games/onion-rendezvous/play/index.html",
  "games/onion-rendezvous/play/scene.js",
  "games/onion-rendezvous/play/i18n.js",
  "games/tor-network/play/index.html",
  "games/tor-network/play/atlas.js",
  "games/tor-network/play/i18n.js",
  "games/tor-network/play/cables.json",
  "games/tor-network/play/continents.json",
  "games/tor-network/play/countries.json",
  "games/tor-network/play/netusers.json",
  "games/tor-network/play/ooni.json",
  "games/tor-network/play/shutdowns.json",
  "games/tor-network/play/snapshot.json",
  "games/tor-network/play/torusers.json",
  "games/tor-network/play/tw-admin.json",
  "games/tor-network/play/tw-energy.json",
  "games/tor-network/play/tw-grid.json",
  "games/tor-network/play/tw-landing.json",
  "games/tor-network/play/tw-power.json",
  // three.js 是本地 vendor 的，三件共用。core 沒有寫在 importmap 裡，
  // 是被 webgpu 那份 import 進去的，少了它三件都起不來。
  "games/vendor/three.webgpu.min.js",
  "games/vendor/three.core.min.js",
  "games/vendor/three.tsl.min.js",
  "games/vendor/jsm/tsl/display/BloomNode.js",
  "games/vendor/jsm/tsl/display/AfterImageNode.js",
];

// 各語系前綴對應的核心章節清單
const CORE_PAGES_BY_PREFIX = {
  "": CORE_PAGES_ZH,
  "zh-cn/": CORE_PAGES_ZH,
  "en/": CORE_PAGES_EN,
};

// 單一語系要預快取的網址。
//
// 原本三個語系全下，2026-08 實測 25.05 MB，而讀者一次只讀一種語言，另外兩份純粹
// 佔裝置空間與行動網路流量。改成只下當下這個語系，讀者切語系時由 client 送
// PRECACHE_LANG 過來補。app shell 的 CSS 與 JS 三次 build 產出的內容一模一樣，只是
// 路徑前綴不同，所以原本連同一批位元組也下了三遍。
function precacheUrlsFor(prefix) {
  const urls = [];
  const pages = CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH;
  for (const page of pages) {
    urls.push(SCOPE_PATH + prefix + page);
  }
  for (const asset of SHELL_ASSETS) {
    urls.push(assetUrlFor(prefix, asset));
  }
  // 作品本體只建置一份在根路徑 /docs/games/，跟語系無關，三個語系共用
  for (const asset of GAME_APPS) {
    urls.push(SCOPE_PATH + asset);
  }
  return urls;
}

// 核心章節那幾頁自己的內文圖。
//
// 預快取原本只抓 HTML，所以網站自動存的那四十幾頁離線打開全部缺圖。像「什麼是
// Tor？」那種以圖解為主的頁面，少了圖等於沒有存。
//
// 清單來自 offline-index.json，那是唯一知道哪一頁引用哪些圖的地方（hooks/
// offline_index.py 建置時算出來，並且已經濾掉每頁都載入的全站腳本）。這裡不重複
// 一份寫死的清單，圖換了、頁面改了都不必回來改 sw.js。
//
// 讀者自己勾的頁面走的是另一條，由管理頁把資產一起送進 LIBRARY_ASSETS。
async function corePageAssets(prefix, index) {
  const data = index === undefined ? await loadOfflineIndex(prefix) : index;
  if (!data) return [];
  const core = new Set(CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH);
  const assets = new Set();
  for (const section of data.sections || []) {
    for (const page of section.pages || []) {
      if (!core.has(page.url)) continue;
      for (const asset of page.assets || []) assets.add(asset);
    }
  }
  return [...assets].map((asset) => SCOPE_PATH + prefix + asset);
}

// 每一頁都會載入的那批樣式、腳本與 manifest。
//
// 清單由建置算出來（hooks/offline_index.py 的 shared），寫在索引的 shell 欄位。
// 它們跟頁面內容無關，讀者勾一頁不該揹一份，可是離線打開任何一頁都需要它們，
// 所以由預快取統一存一份，兩條路（完整章節與底線那批）都要。
//
// 索引抓不到就回空陣列。那一輪頁面照樣存得下來，樣式等下一次補。
async function shellAssetsFor(prefix, index) {
  const data = index === undefined ? await loadOfflineIndex(prefix) : index;
  if (!data) return [];
  return (data.shell || []).map((asset) => assetUrlFor(prefix, asset));
}

// 讀這個語系的離線索引。預快取要從它知道兩件事：每頁都載入的 shell 資產有哪些，
// 以及核心章節那幾頁引用了哪些內文圖。抓不到就回 null，呼叫端各自退回原本的行為。
async function loadOfflineIndex(prefix) {
  const url = SCOPE_PATH + prefix + "offline-index.json";
  try {
    const response = await fetch(url, NO_HTTP_CACHE);
    if (!response.ok) return null;
    // 順手存進預快取。這一份本來就在 SHELL_ASSETS 裡（管理頁離線時要用），
    // 存下來之後 precacheFor 的迴圈就會跳過它，同一個網址不必走兩次網路。
    const cache = await caches.open(PRECACHE);
    await cache.put(url, response.clone());
    return await response.json();
  } catch (err) {
    return null;
  }
}

// 沒有網路時至少要有的那一小批：離線提示頁本身，加上撐得起它的 app shell。
//
// 為什麼不受「自動存下核心章節」的開關管：那一頁就是離線內容管理頁。讀者想清掉
// 裝置上的東西、或想知道自己還有哪些內容可讀，往往正好是連不上網的時候，那一頁
// 進不去的話整個功能等於不存在。少了它，沒快取過的網址在離線時會一路走到
// networkFirst 最後的 throw，讀者看到的是瀏覽器自己的網路錯誤畫面。
//
// 這一批約 0.97 MB（首頁、離線閱讀頁，加上索引 shell 欄位那批每頁共用的樣式與腳本），
// 相對於完整章節的十 MB 是可以接受的底線。三語系共用的資產只算一份，讀者用過第二個
// 語系時實際多下的是 0.64 MB。
// 底線那批裡的頁面。essentialUrlsFor 與 hadFullPrecache 共用這一份：後者要挑一個
// 「只有完整章節才會有」的頁面當探針，兩邊寫在一起才不會不同步。2026-09-04 首頁進了
// 底線那批之後，探針原本還指著首頁，只存過底線的裝置就被當成上一版有完整章節。
const ESSENTIAL_PAGES = ["", "offline/"];

function essentialUrlsFor(prefix) {
  // 首頁跟離線閱讀頁一起進來。首頁是 PWA 的 start_url，也是語言導向的落點：讀者的
  // PWA 是從 zh-TW 的首頁裝的，那一頁的 JS 讀到閱讀語言是 en 就 location.replace 到
  // en 的首頁。離線時那一跳的目標不在裝置上，讀者會先看到 zh-TW 一眼，接著停在空白，
  // 而他明明存著整套 en。
  //
  // 關掉自動存的讀者更需要它。那些人裝置上只有這一批，少了首頁，PWA 冷啟動的第一個
  // 網址就落在快取外面。
  const urls = ESSENTIAL_PAGES.map((page) => SCOPE_PATH + prefix + page);
  for (const asset of SHELL_ASSETS) {
    urls.push(assetUrlFor(prefix, asset));
  }
  return urls;
}

// 這個 SW 生命週期內已經補過的語系。每次導覽 client 都會送 PRECACHE_LANG 過來，
// 沒有這層就要對七十幾個網址各做一次 cache.match 才知道沒事可做。SW 被瀏覽器終止
// 後清空，下次重跑一輪也只是白查一次，不會抓重複的東西。
const precachedPrefixes = new Set();

// 讀者在某個語系底下導覽過幾次。存進 Cache Storage 的理由跟 AUTO_PRECACHE_URL 一樣：
// SW 讀不到 localStorage，而這個數字要跨 SW 重啟與跨部署留著。
const VISITS_URL = "/__anoni-settings/visits/";

async function noteVisit(prefix) {
  const cache = await caches.open(SETTINGS);
  const url = VISITS_URL + (prefix || "root");
  const hit = await cache.match(url);
  const count = hit ? parseInt(await hit.text(), 10) || 0 : 0;
  await cache.put(url, new Response(String(count + 1)));
  return count + 1;
}

// 這台裝置上一版有沒有存過這個語系的完整章節。
//
// 換版時用得到：讀者按下更新，activate 會清掉舊的 PRECACHE，如果新的 install 只抓了
// 底線那一批，讀者原本存著的四十幾頁會憑空消失一段時間。上一版有的，這一版照樣補齊。
async function hadFullPrecache(prefix) {
  const pages = CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH;
  // 挑一個不在底線那批裡的頁面當探針，有它就代表上一版下的是完整章節
  const probe =
    SCOPE_PATH + prefix + pages.find((page) => !ESSENTIAL_PAGES.includes(page));
  for (const name of await caches.keys()) {
    if (!name.startsWith("anoni-docs-precache-")) continue;
    if (await (await caches.open(name)).match(probe)) return true;
  }
  return false;
}

// 補齊某個語系的預快取。已經在快取裡的跳過，所以換語系時只會抓新的那一份，作品
// 本體與抓過的東西不重來。
//
// wantFull 由呼叫端決定要不要下完整章節，見 installPrecache 與 precacheOnNavigation。
// 這裡只再 AND 上一個條件：讀者關掉自動存或清空過內容時，一律只補底線那一批。
async function precacheFor(prefix, wantFull) {
  if (precachedPrefixes.has(prefix + " full")) return;
  const full = wantFull && (await autoPrecacheEnabled());
  const done = prefix + (full ? " full" : " essential");
  if (precachedPrefixes.has(done)) return;
  precachedPrefixes.add(done);
  const cache = await caches.open(PRECACHE);
  let urls = full ? precacheUrlsFor(prefix) : essentialUrlsFor(prefix);
  // 索引只讀一次，shell 與核心章節的內文圖都從同一份取。
  const index = await loadOfflineIndex(prefix);
  urls = urls.concat(await shellAssetsFor(prefix, index));
  if (full && (await precacheImagesEnabled())) {
    urls = urls.concat(await corePageAssets(prefix, index));
  }
  // 逐一快取並容忍個別失敗（本地開發只有單一語系，其他語系路徑會 404）
  await Promise.allSettled(
    urls.map(async (url) => {
      if (await cache.match(url)) return;
      const response = await fetch(url, NO_HTTP_CACHE);
      if (response.ok) await cache.put(url, response);
    })
  );
}

// 網址對到建置路徑的語系前綴。zh-TW 由 run.sh 建在根路徑，另外兩語各有前綴。
// 不在 scope 內時回 null。
//
// 路徑前綴優先於 query。前綴是網站建出來的，query 誰都能加。三件互動作品只建置
// 一份在根路徑，語系靠 ?lang= 傳，所以路徑上沒有前綴時才看 query。
function langPrefixOf(url) {
  if (!url.pathname.startsWith(SCOPE_PATH)) return null;
  const rel = url.pathname.slice(SCOPE_PATH.length);
  for (const prefix of LANG_PREFIXES) {
    if (prefix && rel.startsWith(prefix)) return prefix;
  }
  const lang = url.searchParams.get("lang");
  if (lang && LANG_PREFIXES.includes(lang + "/")) return lang + "/";
  return "";
}

// install 階段還沒有 client 送訊息過來，先從開著的分頁網址推一個語系。三個語系
// 共用同一個 registration（scope 都是 /docs/），SW 沒辦法從自己的 scope 判斷。
//
// 一個站內分頁都找不到時回 null，install 就先不抓章節，等頁面載入後 client 送
// PRECACHE_LANG 過來再抓。猜錯的代價是讀者白下一整個語系（約 9 MB），寧可晚個
// 幾百毫秒。回空字串是「確定是根路徑的 zh-TW」，跟 null 不同。
async function guessLangPrefix() {
  const windows = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  for (const client of windows) {
    const prefix = langPrefixOf(new URL(client.url));
    if (prefix !== null) return prefix;
  }
  return null;
}

// install 階段要抓的那一批。抽成具名函式是為了能在 Node 裡驗，事件回呼裡的
// 匿名 async 函式測不到，見 tools/test_sw_offline.mjs。
//
// 上一版已經有完整章節的裝置照樣補齊。那是換版，讀者按下更新之後 activate 會清掉
// 舊的 PRECACHE，只抓底線那批的話他存著的四十幾頁會憑空少掉一段時間，斷網就什麼
// 都沒有。沒有的就是首次安裝，先抓底線，等讀者確定要讀哪個語言再下整份。
async function installPrecache() {
  const prefix = await guessLangPrefix();
  // 讀者用過的每個語系都要留得住落腳頁。install 只補當下猜到的那一個的話，換版
  // 時 activate 清掉舊的預快取之後，另一個語系的 offline 頁與每頁共用的樣式就從
  // 裝置上消失了，而讀者可能正好是用那個語系在讀。
  //
  // 補的是底線那一批（約 0.7 MB），不是整份章節。完整章節仍然只跟著當下這一個
  // 語系走，讀者不會因為切過一次語言就在裝置上多出十 MB。
  for (const other of await visitedPrefixes()) {
    if (other !== prefix) await precacheFor(other, false);
  }
  if (prefix === null) return null;
  await precacheFor(prefix, await hadFullPrecache(prefix));
  return prefix;
}

// 一次導覽觸發的預快取。
//
// 完整那一批要等讀者確定了要讀哪個語言才下。首次造訪時 install 幾乎是立刻開跑，
// 而底部那張語言卡片要等 DOM 與 script 跑完才浮出來，讀者按下「English」的那幾秒，
// 網站已經在下 zh-TW 的四十幾頁了，接著又下一份 en，兩份並存到下次部署才清掉。
// 從搜尋引擎落在內頁的讀者更是從頭到尾沒被問過，十 MB 就這樣進了他的行動網路帳單。
//
// 兩個條件任一成立就算讀者確定了：client 說他選過閱讀語言，或者他在同一個語系底下
// 翻到了第二頁。看一頁就走的人只會用掉底線那 0.7 MB。
//
// 計數刻意不放在 precacheFor 裡。install 也會呼叫那一支，算進去的話首次造訪光是
// install 加上第一次導覽就湊滿兩次，門檻等於不存在。
async function precacheOnNavigation(prefix, settled) {
  // 計數一律先記。原本 settled 為真時會短路掉 noteVisit，省一次快取讀寫，代價是
  // 選過閱讀語言的讀者在這台裝置上從來不留下造訪紀錄，而 installPrecache 換版時
  // 要靠那份紀錄才知道「除了當下這一個，還有哪些語系該保住落腳頁」。
  const visits = await noteVisit(prefix);
  await precacheFor(prefix, settled || visits >= 2);
}

// 讀者在這台裝置上用過哪些語系，依 noteVisit 留下的紀錄。
async function visitedPrefixes() {
  const cache = await caches.open(SETTINGS);
  const found = [];
  for (const prefix of LANG_PREFIXES) {
    if (await cache.match(VISITS_URL + (prefix || "root"))) found.push(prefix);
  }
  return found;
}

self.addEventListener("install", (event) => {
  // 這裡刻意不呼叫 skipWaiting。原本一裝好就搶著接管，讀者正在讀的分頁會在毫無
  // 徵兆的情況下換掉腳下的 SW，而 activate 又會清掉不在保留名單裡的快取。改成
  // 停在 waiting，等讀者在換版提示上按下更新，收到 SKIP_WAITING 才接管。
  event.waitUntil(installPrecache());
});

// === 離線內容管理 ===
//
// 讀者在 offline 頁勾選要留在裝置上的頁面，這幾支負責實際存取。預設下載的那批由
// precacheFor 處理，兩者分開放在不同的 cache，讀者才分得清「網站幫我存的」與
// 「我自己選的」，清除時也能各自處理。

// 這個設定值 fetch handler 每一個請求都要問一次，每次都去讀 Cache Storage 太浪費，
// 所以在 SW 這一輪生命週期內記著。setAutoPrecache 會把它作廢，另一個分頁改了設定也
// 會走那一支，因為設定只能從管理頁改，而管理頁的指令由同一個 SW 處理。
let autoPrecacheMemo = null;

async function autoPrecacheEnabled() {
  if (autoPrecacheMemo !== null) return autoPrecacheMemo;
  const cache = await caches.open(SETTINGS);
  const hit = await cache.match(AUTO_PRECACHE_URL);
  // 沒設定過就是開著。只有讀者明確關掉或清空過內容才會有這筆。
  autoPrecacheMemo = hit ? (await hit.text()) !== "off" : true;
  return autoPrecacheMemo;
}

async function setAutoPrecache(enabled) {
  autoPrecacheMemo = enabled;
  const cache = await caches.open(SETTINGS);
  await cache.put(AUTO_PRECACHE_URL, new Response(enabled ? "on" : "off"));
}

async function precacheImagesEnabled() {
  const cache = await caches.open(SETTINGS);
  const hit = await cache.match(PRECACHE_IMAGES_URL);
  // 沒設定過就是關著，跟 autoPrecache 相反
  if (!hit) return false;
  return (await hit.text()) === "on";
}

async function setPrecacheImages(enabled) {
  const cache = await caches.open(SETTINGS);
  await cache.put(PRECACHE_IMAGES_URL, new Response(enabled ? "on" : "off"));
  // 這一輪已經補過的記錄要作廢，下一次導覽才會照新的設定重跑一遍
  precachedPrefixes.clear();
}

// 訊息裡帶的頁面網址落在哪個語系。
//
// 管理頁送過來的路徑取自 offline-index.json，那份索引的網址相對於各語系自己的建置
// 根目錄，en 版寫的是 `tools/` 而不是 `en/tools/`。三個語系共用同一個 SW scope
// （都是 /docs/），所以語系前綴要在這裡補回去，否則 en 與 zh-cn 的讀者勾一頁下來，
// 存進裝置的是 zh-TW 那一版。
//
// 舊版的管理頁只在 OFFLINE_STATUS 帶 url，其他指令沒有。收不到就退回根路徑，行為
// 跟補這段之前一樣，讀者按下更新換到新版的管理頁就會正確。
function messagePrefix(data) {
  if (typeof data.url !== "string") return "";
  return langPrefixOf(new URL(data.url)) || "";
}

// 讀者自己存下來的頁面，回相對於該語系建置根目錄的路徑，跟 offline-index.json 的
// url 對得上。別的語系存的不列進來，管理頁一次只呈現讀者當下讀的這一個語系。
async function libraryEntries(prefix) {
  const cache = await caches.open(LIBRARY);
  const keys = await cache.keys();
  const entries = [];
  for (const request of keys) {
    const url = new URL(request.url);
    if (langPrefixOf(url) !== prefix) continue;
    entries.push(url.pathname.slice(SCOPE_PATH.length + prefix.length));
  }
  return entries;
}

// 網站自動存的那批，實際在裝置上的有哪些。
//
// 原本直接回 CORE_PAGES_BY_PREFIX 那份硬編清單，那是「打算要下載的」而不是「已經
// 下載到的」。讀者關掉自動下載或按過清除之後，管理頁照樣顯示那幾十頁已存，而且
// 那些頁的勾選框是停用的，想自己補存也按不動。
async function precachedEntries(prefix) {
  const cache = await caches.open(PRECACHE);
  const stored = new Set(
    (await cache.keys()).map((request) => new URL(request.url).pathname)
  );
  const pages = CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH;
  return pages.filter((page) => stored.has(SCOPE_PATH + prefix + page));
}

// 存進 library。已經有的跳過，讓「更新」與「新增幾頁」走同一條路。
// refresh 為真時不管有沒有都重抓，那是管理頁的更新按鈕。
// 同時在飛的請求數。
//
// 管理頁上的「全部存到裝置」一次就是四百多個請求，循序跑光是往返就要一分多鐘，
// 而按下那顆的人多半正趕在上飛機或進到收不到訊號的地方之前。六條是折衷：站台在
// HTTP/2 上本來就會多工，再往上加只是跟同一條連線上的其他請求互搶，慢的網路上
// 反而更容易整批逾時。
const LIBRARY_CONCURRENCY = 6;

// 固定幾條 worker 輪流從同一個清單取工作，取完為止。用 worker 而不是把整份清單
// 切成 N 段，是因為每一項的大小差很多，切段會讓拿到大檔那一段的最後一條拖著整批。
async function runPool(items, worker) {
  let next = 0;
  const runners = [];
  for (let i = 0; i < Math.min(LIBRARY_CONCURRENCY, items.length); i += 1) {
    runners.push(
      (async () => {
        while (next < items.length) {
          await worker(items[next++]);
        }
      })()
    );
  }
  await Promise.all(runners);
}

async function addToLibrary(prefix, paths, assets, refresh, report) {
  const pageCache = await caches.open(LIBRARY);
  const assetCache = await caches.open(LIBRARY_ASSETS);
  const pageTargets = paths.map((path) => ({ path: path, cache: pageCache }));
  const assetTargets = (assets || []).map((path) => ({ path: path, cache: assetCache }));
  const total = pageTargets.length + assetTargets.length;
  let ok = 0;
  let failed = 0;
  let done = 0;

  const store = async (target) => {
    const url = SCOPE_PATH + prefix + target.path;
    try {
      if (!refresh && (await target.cache.match(url))) {
        ok += 1;
      } else {
        const response = await fetch(url, NO_HTTP_CACHE);
        if (response.ok) {
          await target.cache.put(url, response);
          ok += 1;
        } else {
          failed += 1;
        }
      }
    } catch (err) {
      failed += 1;
    }
    done += 1;
    // 逐項回報。整批下載可能要好幾分鐘，沒有進度的話讀者只會看到一個不動的按鈕。
    report({ type: "progress", done: done, total: total, ok: ok, failed: failed });
  };

  // 頁面先抓完再抓資產。中途斷線的話，讀者手上是幾頁完整的內容加幾頁缺圖的，
  // 比反過來（一堆圖但沒有半頁可讀）有用。並行只發生在各自那一批裡面。
  await runPool(pageTargets, store);
  await runPool(assetTargets, store);
  return { ok: ok, failed: failed };
}

async function removeFromLibrary(prefix, paths, assets) {
  const pageCache = await caches.open(LIBRARY);
  const assetCache = await caches.open(LIBRARY_ASSETS);
  let removed = 0;
  for (const path of paths) {
    if (await pageCache.delete(SCOPE_PATH + prefix + path)) removed += 1;
  }
  // 資產由管理頁挑過，別的已存頁面還用得到的不會出現在這份清單裡。
  // 回報的數字只算頁面，那才是讀者在畫面上勾掉的東西。
  for (const path of assets || []) {
    await assetCache.delete(SCOPE_PATH + prefix + path);
  }
  return { removed: removed };
}

// 這個站自己開的快取。名稱一律以此開頭，含帶版本後綴的 PRECACHE 與已經淘汰的
// 舊 runtime 快取。caches.keys() 回的是整個 origin 的，anoni.net 底下未來要是有
// 別的東西也用 Cache Storage，清除與計算容量都不該掃到它。
const OWN_CACHE_PREFIX = "anoni-docs-";

async function ownCacheNames() {
  return (await caches.keys()).filter((name) => name.startsWith(OWN_CACHE_PREFIX));
}

// 這個站在裝置上實際佔用多少 byte。
//
// 不用 navigator.storage.estimate() 的 usage，有兩個理由。它算的是整個 origin，
// 不只離線內容。更要命的是它跟 caches.delete() 之間有落差：實測清空之後那個數字
// 要四十幾秒才跟上，讀者按完「清除所有離線內容」看到的還是按之前的數字，會以為
// 沒清掉。管理頁報的是「本站佔用」，那就照著自己的快取算。
//
// 有 content-length 就用它。實測線上快取的一百多筆裡九成有這個標頭，而且跟 body
// 實際大小一個 byte 都不差。少數沒有的才把 body 讀出來量，那條路要真的讀磁碟。
async function cacheUsage() {
  let bytes = 0;
  for (const name of await ownCacheNames()) {
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      const response = await cache.match(request);
      if (!response) continue;
      const declared = response.headers && response.headers.get("content-length");
      if (declared !== null && declared !== undefined && declared !== "") {
        bytes += Number(declared);
      } else if (typeof response.blob === "function") {
        bytes += (await response.blob()).size;
      }
    }
  }
  return bytes;
}

// 清掉裝置上所有跟這個站有關的快取，包含網站自動存的那批。
//
// 清完把自動預快取關掉。讀者按這顆按鈕多半是因為裝置可能被檢查，如果下一次導覽
// 又把九 MB 自動下載回來，這顆按鈕等於沒有作用。要恢復得回管理頁自己打開。
async function clearAllOffline() {
  for (const key of await ownCacheNames()) {
    await caches.delete(key);
  }
  precachedPrefixes.clear();
  // 設定那個 cache 也在剛才刪掉的名單裡，這一行把它連同記憶體裡的值一起重建。
  await setAutoPrecache(false);
  await setPrecacheImages(false);
}

async function handleLibraryMessage(data, port) {
  const reply = (message) => port.postMessage(message);

  if (data.type === "OFFLINE_STATUS") {
    const prefix = messagePrefix(data);
    reply({
      type: "status",
      saved: await libraryEntries(prefix),
      // 網站預設存的那批，管理頁用它標出「已經在裝置上、不必再勾」的頁面。
      // 只回頁面，app shell 與作品本體不是讀者會勾的東西，混進去只會讓數字虛胖。
      precached: await precachedEntries(prefix),
      autoPrecache: await autoPrecacheEnabled(),
      precacheImages: await precacheImagesEnabled(),
      // 這台裝置上跑的是哪一版。讀者回報「離線打不開」時，第一個要分辨的就是他的
      // service worker 換到新版了沒，而那件事在裝置上原本沒有任何地方看得出來。
      version: VERSION,
      // 本站佔用自己算，見 cacheUsage。estimate 只拿來報「裝置還剩多少空間」，
      // 那是配額問題，本來就該問瀏覽器。
      usage: await cacheUsage(),
      estimate: navigator.storage && navigator.storage.estimate
        ? await navigator.storage.estimate()
        : null,
    });
    return;
  }

  if (data.type === "OFFLINE_ADD" && Array.isArray(data.paths)) {
    const result = await addToLibrary(
      messagePrefix(data), data.paths, data.assets, data.refresh === true, reply
    );
    reply({ type: "done", ok: result.ok, failed: result.failed });
    return;
  }

  if (data.type === "OFFLINE_REMOVE" && Array.isArray(data.paths)) {
    const result = await removeFromLibrary(messagePrefix(data), data.paths, data.assets);
    reply({ type: "done", removed: result.removed });
    return;
  }

  if (data.type === "OFFLINE_CLEAR") {
    await clearAllOffline();
    reply({ type: "done", cleared: true });
    return;
  }

  if (data.type === "OFFLINE_IMAGES" && typeof data.enabled === "boolean") {
    await setPrecacheImages(data.enabled);
    reply({ type: "done", precacheImages: data.enabled });
    return;
  }

  if (data.type === "OFFLINE_AUTO" && typeof data.enabled === "boolean") {
    await setAutoPrecache(data.enabled);
    reply({ type: "done", autoPrecache: data.enabled });
    return;
  }

  reply({ type: "error", reason: "unknown-command" });
}

// client 送過來的指令。唯一的來源是 overrides/base.html 裡的 PWA script。
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  // 頁面載入時 client 送自己的網址過來，SW 據此補齊那個語系的預快取。
  //
  // 傳網址而不是語系代碼，是因為 document.documentElement.lang 在 zh-CN 版是 "zh"
  // （mkdocs_cn.yml 的 theme.language），跟 zh-TW 的 "zh-TW" 對不出建置路徑，而網址
  // 直接對得到 /docs/zh-cn/。判斷邏輯也就只留在 langPrefixOf 一處。
  if (data.type === "PRECACHE_LANG" && typeof data.url === "string") {
    const prefix = langPrefixOf(new URL(data.url));
    if (prefix !== null) {
      // 已經下過整份就什麼都不用做，也不用再為了數次數寫一次 Cache Storage
      if (!precachedPrefixes.has(prefix + " full")) {
        event.waitUntil(precacheOnNavigation(prefix, data.settled === true));
      }
    }
    return;
  }

  // 離線內容管理頁的指令。回應走 MessageChannel 的 port，一次請求一個 port，
  // 下載類的指令會在同一個 port 上多次回報進度，最後一則帶 done。
  const port = event.ports && event.ports[0];
  if (!port) return;
  event.waitUntil(handleLibraryMessage(data, port));
});

// 一次性遷移：把帶版本後綴的舊 runtime 快取搬進不帶版本的新快取。
//
// 這次改動之前每次部署都換快取名稱，activate 會把讀者累積的離線頁面整批刪掉。修法
// 如果照舊直接刪，等於在升級的當下再清空一次，所以先搬過來。頁面與資產都要搬：舊頁面
// 引用的是舊 hash 的 CSS 與 JS，只搬頁面的話離線開起來會沒有樣式。
//
// 讀者都升過一輪之後（大約兩三次部署）這段就不會再命中任何東西，可以移除。
async function migrateLegacyRuntime() {
  const keys = await caches.keys();
  for (const [legacyPrefix, target] of [
    ["anoni-docs-pages-", RUNTIME_PAGES],
    ["anoni-docs-assets-", RUNTIME_ASSETS],
  ]) {
    const legacyKeys = keys.filter((key) => key.startsWith(legacyPrefix));
    if (!legacyKeys.length) continue;
    const cache = await caches.open(target);
    for (const key of legacyKeys) {
      const legacy = await caches.open(key);
      for (const request of await legacy.keys()) {
        // 新快取已經有的就不覆蓋，那份比較新
        if (await cache.match(request)) continue;
        const response = await legacy.match(request);
        if (response) await cache.put(request, response);
      }
      await caches.delete(key);
    }
  }
  await trimCache(RUNTIME_PAGES, PAGES_MAX_ENTRIES);
  await trimCache(RUNTIME_ASSETS, ASSETS_MAX_ENTRIES);
}

// 換版後清掉用不到的快取。
//
// LIBRARY、LIBRARY_ASSETS 與 SETTINGS 都不帶版本，換版時要留著。前兩個是讀者自己
// 勾選存下來的頁面與那些頁面引用的圖與程式，後者記著他有沒有把自動存下內容關掉。
// 任何一個被清掉，讀者的選擇就作廢。少了 LIBRARY_ASSETS 更難查：頁面還在，離線
// 打開卻沒有樣式也沒有圖，而下一次部署又會再發生一次。
//
// 抽成具名函式是為了能在 Node 裡驗，事件回呼裡的匿名 async 函式測不到，
// 見 tools/test_sw_offline.mjs。
async function purgeStaleCaches() {
  const keep = [
    PRECACHE, RUNTIME_PAGES, RUNTIME_ASSETS, LIBRARY, LIBRARY_ASSETS, SETTINGS,
  ];
  const keys = await ownCacheNames();
  await Promise.all(
    keys.filter((key) => keep.indexOf(key) === -1).map((key) => caches.delete(key))
  );
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await migrateLegacyRuntime();
      await purgeStaleCaches();
      await self.clients.claim();
    })()
  );
});

// 同一份 HTML 會被連成不同形狀的網址。互動作品的索引頁，zh-TW 連的是
// games/x/play/，en 與 zh-cn 連的是 games/x/play/index.html?lang=en，指的是同一個
// 檔案。Cache Storage 比對的是完整網址字串，形狀差一點就 miss，而預快取一份頁面
// 只能存一種形狀。離線時依序試這幾種，讓三個語系都命中同一份。
function cacheKeyCandidates(pathname) {
  if (pathname.endsWith("/index.html")) {
    return [pathname, pathname.slice(0, -"index.html".length)];
  }
  if (pathname.endsWith("/")) {
    return [pathname, pathname + "index.html"];
  }
  return [pathname];
}

// 離線時替一個導覽請求找出對應的快取。ignoreSearch 讓帶 ?lang= 或分享參數的網址
// 也命中，站上的 query 一律只由 client 端 JS 讀取，同一個路徑回傳的 HTML 是同一份。
async function matchCachedPage(request) {
  const url = new URL(request.url);
  // 先走精確比對。ignoreSearch 會讓 Cache Storage 放棄索引、線性掃過每一筆，而
  // 按下「全部存到裝置」之後那是四百多筆，每翻一頁掃兩輪，在手機上是看得出來的
  // 延遲。站上絕大多數導覽的網址沒有 query，這一條就結束了。
  for (const pathname of cacheKeyCandidates(url.pathname)) {
    const hit = await caches.match(url.origin + pathname);
    if (hit) return hit;
  }
  // 精確那輪沒中才退回線性掃描。會走到這裡的是快取裡存著帶 query 的 key，例如讀者
  // 從 /docs/x/?utm=... 進來，RUNTIME_PAGES 就存下了那個形狀。ignoreSearch 讓它跟
  // 純路徑對得上，站上的 query 一律只由 client 端 JS 讀取，同一個路徑回傳的 HTML
  // 是同一份。
  for (const pathname of cacheKeyCandidates(url.pathname)) {
    const hit = await caches.match(url.origin + pathname, { ignoreSearch: true });
    if (hit) return hit;
  }
  return undefined;
}

// zh-TW 的 offline 頁在根路徑，另外兩語各在自己的前綴底下。langPrefixOf 回 null
// （scope 外）時落到 zh-TW，那種請求本來也走不到這裡。
function offlinePathFor(url) {
  return SCOPE_PATH + (langPrefixOf(url) || "") + "offline/";
}

// 離線時的落腳頁。先找這個語系自己那一份，沒有就給別的語系。
//
// 「沒有」是真的會發生的狀態：install 只補讀者用過的語系，而換版時 activate 會清掉
// 舊的預快取，所以讀者昨天讀 en、今天在 zh-TW 分頁上按下更新，en 的落腳頁可能就不在
// 裝置上了。
//
// 用轉址而不是把內容直接回給原本的網址。直接回傳的話，頁面的 location 還是讀者要開
// 的那一個（例如 /docs/en/basics/threat-model/），而管理頁靠 location 算出索引與各頁
// 的網址，算出來全是 404，整份清單畫不出來。讀者看到的是一頁靜態說明，而那一頁存在
// 的理由正是告訴他「裝置上還有哪些讀得到」。轉址之後網址列也對得上，他知道自己被帶
// 到哪裡，而 302 不留在 history，按上一頁不會回到那個打不開的網址。
//
// 退到別的語系時網址帶上 from。那一頁會用讀者要的語言說明發生了什麼事，不然畫面上
// 就是莫名其妙跳出一個看不懂的語言。
//
// 目標跟當前網址一樣就跳過，自己轉自己會轉不完。
async function offlineFallback(url) {
  const own = offlinePathFor(url);
  const paths = [own];
  for (const prefix of LANG_PREFIXES) {
    const path = SCOPE_PATH + prefix + "offline/";
    if (paths.indexOf(path) === -1) paths.push(path);
  }
  for (const path of paths) {
    if (path === url.pathname) continue;
    if (!(await caches.match(url.origin + path))) continue;
    const target = new URL(url.origin + path);
    if (path !== own) target.searchParams.set("from", langCodeOf(url));
    return Response.redirect(target.href, 302);
  }
  return undefined;
}

// 網址屬於哪個語系，回的是網址上看得到的那個代號（zh-tw、zh-cn、en）。落腳頁靠它
// 知道讀者本來要的是哪一種語言。
function langCodeOf(url) {
  const prefix = langPrefixOf(url);
  return prefix ? prefix.replace(/\/$/, "") : "zh-tw";
}

// event 可能不存在（例如未來從別處呼叫），沒有就退回 fire-and-forget
function keepAlive(event, promise) {
  if (event && typeof event.waitUntil === "function") event.waitUntil(promise);
  return promise;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
}

// 導覽請求等網路多久，超過就先給裝置上那一份。
//
// 完全斷線時 fetch 立刻就失敗，這個值用不到。它是為了「連得上但很慢」與「連線被
// 干擾」那種狀態：讀者手上明明有離線副本，卻要陪著瀏覽器一路等到它自己放棄，
// 而那種網路正是這個網站的讀者比別人更常遇到的。
//
// 2026-08-29 從三秒降下來。三秒是「網路慢的時候還願意等一下」的估計，實際遇到的
// 是飛航模式底下 Wi-Fi 還開著，每翻一頁停三秒，而裝置上四百多頁一頁不缺。手上有
// 副本可讀的時候，晚一輪拿到新內容比每一頁都卡住好。
const NAVIGATE_TIMEOUT_MS = 1200;

// 網路最近一次讓導覽等到逾時或直接失敗的時間。
//
// navigator.onLine 只有回 false 的時候可信，而讀者實際卡住的狀態正好是它回 true
// 的那些：飛航模式底下 Wi-Fi 還開著、機上 Wi-Fi 沒買方案、公共熱點把流量攔在
// 登入頁。那時候每翻一頁都要陪著等滿逾時，裝置上明明有一份讀得到的。
//
// 記下來之後的一分鐘內，有快取就直接給。網路那條照樣發出去在背景更新，它成功了
// 就把這個狀態清掉，所以讀者接回網路之後不必自己按什麼，下一次導覽就恢復正常。
const NETWORK_DOWN_TTL_MS = 60000;
let networkDownSince = 0;

function networkLooksDown() {
  if (navigator.onLine === false) return true;
  return networkDownSince > 0 && Date.now() - networkDownSince < NETWORK_DOWN_TTL_MS;
}

// 裝置上沒有副本的資產，等網路等多久。
//
// 導覽那條的逾時可以壓到 1.2 秒，因為逾時之後還有裝置上的舊副本可以給，讀者拿到的
// 是完整內容，只是晚一輪才更新。資產這條逾時之後只能給失敗，畫面會少一塊，所以放
// 寬到八秒，慢的網路照樣等得到。真正接住離線讀者的是上面的 networkLooksDown。
//
// 2026-09-04 補上。原本沒有任何上限，連得上但沒有回應的網路（飛航模式底下 Wi-Fi
// 還開著、熱點把流量攔在登入頁）會讓請求一直掛著。render-blocking 的
// stylesheets/extra.css 掛住的話整頁就一直是白的，實測四十五秒還沒有任何內容。
const ASSET_TIMEOUT_MS = 8000;

// 裝置上沒有副本的導覽，等網路等多久。跟 ASSET_TIMEOUT_MS 同一個判斷：逾時之後
// 給得出來的東西都不是讀者要的那一頁，所以放寬到八秒，慢的網路照樣等得到。
const NO_CACHE_TIMEOUT_MS = 8000;

// 快取沒有、網路也拿不到時給的回應。
//
// 原本讓 respondWith 收到 undefined，規格上那是 network error，Gecko 還會在主控台
// 印一行「resolved with non-Response value」。回一個明確的 504，瀏覽器知道這個資源
// 結束了才會繼續把頁面畫完，而不是停在載入中。
function assetUnavailable() {
  return new Response("", { status: 504, statusText: "Offline" });
}

async function networkFirst(request, event) {
  // 先把網路那條發出去，不管後面走哪一條，它拿到的東西都要寫進快取。
  //
  // cache 選項的理由見 NO_HTTP_CACHE，這裡傳的是 Request，credentials 由它自己帶。
  // 帶 init 去複製一個 mode 為 navigate 的 Request，規格會把 mode 降成
  // same-origin。這裡的請求在 fetch handler 入口已經濾成同源，站內連結也都是
  // mkdocs 產出的完整目錄形狀，走不到跨站轉址那條路。
  const network = fetch(request, { cache: "no-cache" }).then(async (response) => {
    // 這條路通了。不看 response.ok，回 404 也代表網路本身是好的。
    networkDownSince = 0;
    if (response.ok && (await autoPrecacheEnabled())) {
      const cache = await caches.open(RUNTIME_PAGES);
      await cache.put(request, response.clone());
      // 用 waitUntil 而不是 await。純 fire-and-forget 的話 SW 可能在裁剪跑完前
      // 被瀏覽器終止，上限長期守不住；改成 await 又會讓每次導覽都等裁剪跑完才
      // 拿到回應。waitUntil 兩邊都要得到：SW 活到裁剪結束，回應不被卡住。
      keepAlive(event, trimCache(RUNTIME_PAGES, PAGES_MAX_ENTRIES));
    }
    return response;
  });

  const cached = await matchCachedPage(request);
  if (!cached) {
    // 裝置上沒有這一頁，等網路是唯一的選擇。等的時間要有上限：連得上但沒有回應的
    // 網路不會讓 fetch 失敗，它就是一直不回來，而這條路原本是 await network，
    // 讀者看到的是一直空白的畫面。
    //
    // 2026-09-04 遇到的是換語系那一種。讀者的裝置上有整套 zh-TW，en 一頁都沒有，
    // 在 en 底下離線冷啟動就落到這裡。zh-TW 好好的，en 卡住，看起來像語系有問題，
    // 實際上是「這一頁裝置上有沒有」的差別。
    if (networkLooksDown()) {
      keepAlive(event, network.catch(() => {}));
      const offline = await offlineFallback(new URL(request.url));
      if (offline) return offline;
    }
    const raced = await Promise.race([
      network.catch(() => null),
      new Promise((resolve) => setTimeout(() => resolve(null), NO_CACHE_TIMEOUT_MS)),
    ]);
    if (raced) return raced;
    networkDownSince = Date.now();
    keepAlive(event, network.catch(() => {}));
    const offline = await offlineFallback(new URL(request.url));
    if (offline) return offline;
    // 連落腳頁都沒有，讓瀏覽器顯示它自己的錯誤畫面。繼續 await network 的話就是
    // 停在空白，錯誤畫面至少講得出發生了什麼，讀者也按得到重新整理。
    return Response.error();
  }

  // 網路已經知道是斷的就不必再等一輪。直接給裝置上那一份，網路那條照樣在背景跑，
  // 它成功的話會清掉離線狀態，下一次導覽就恢復成正常的賽跑。
  if (networkLooksDown()) {
    keepAlive(event, network.catch(() => {}));
    return cached;
  }

  // 有副本就跟網路賽跑。網路先到就用網路的，讀者拿到的是最新內容。
  const raced = await Promise.race([
    network.catch(() => null),
    new Promise((resolve) => setTimeout(() => resolve(null), NAVIGATE_TIMEOUT_MS)),
  ]);
  if (raced) return raced;

  // 網路太慢或失敗，先給讀者看得到的那一份。網路那邊還在跑，回來時照樣寫進快取，
  // 下一次導覽拿到的就是新的。SW 要活到那時候，所以掛在 waitUntil 上。
  //
  // 同時記下這一次沒等到。接下來一分鐘內的導覽直接走上面那條，讀者不必每翻一頁
  // 都重新等一遍逾時。
  networkDownSince = Date.now();
  keepAlive(event, network.catch(() => {}));
  return cached;
}

// 離線時替一個資產請求找出對應的快取。三語系共用的那批只存根路徑那一份，而頁面
// 引用的是帶語系前綴的網址，所以精確比對沒中的時候要再退一次。
async function matchCachedAsset(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const url = new URL(request.url);
  const prefix = langPrefixOf(url);
  // 空字串是根路徑的 zh-TW，null 是 scope 外，兩種都沒有第二種形狀可以試
  if (!prefix) return undefined;
  const asset = url.pathname.slice(SCOPE_PATH.length + prefix.length);
  if (!crossLangAsset(asset)) return undefined;
  return caches.match(SCOPE_PATH + asset);
}

async function staleWhileRevalidate(request, event) {
  const cached = await matchCachedAsset(request);
  // 背景那條同樣繞過 HTTP 快取（見 NO_HTTP_CACHE）。theme 資產帶 hash 檔名不會
  // 變，會變的是自寫的 js 與圖，那些在 mkdocs 產出時沒有 hash。
  const network = fetch(request, { cache: "no-cache" }).then(async (response) => {
    // 這條路通了，離線狀態跟著清掉，跟 networkFirst 共用同一個旗標
    networkDownSince = 0;
    if (response.ok && (await autoPrecacheEnabled())) {
      const cache = await caches.open(RUNTIME_ASSETS);
      await cache.put(request, response.clone());
      keepAlive(event, trimCache(RUNTIME_ASSETS, ASSETS_MAX_ENTRIES));
    }
    return response;
  });

  // 裝置上有一份就直接給，revalidate 在背景跑，讀者感覺不到多出來的那個往返。
  if (cached) {
    keepAlive(event, network.catch(() => {}));
    return cached;
  }

  // 網路已經知道是斷的就不必再等。這一條是空白畫面與可讀畫面的分界：導覽那次的
  // 逾時已經替後面所有資產判斷過網路通不通，接下來一分鐘內快取沒有的東西直接
  // 收尾，不必一個一個等滿上限。
  if (networkLooksDown()) {
    keepAlive(event, network.catch(() => {}));
    return assetUnavailable();
  }

  const raced = await Promise.race([
    network.catch(() => null),
    new Promise((resolve) => setTimeout(() => resolve(null), ASSET_TIMEOUT_MS)),
  ]);
  if (raced) return raced;

  networkDownSince = Date.now();
  keepAlive(event, network.catch(() => {}));
  return assetUnavailable();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // 跨域（含 aa.anoni.net 分析）與 scope 外的請求一律放行
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE_PATH)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, event));
  } else {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
