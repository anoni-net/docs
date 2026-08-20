/*
 * anoni.net Docs PWA service worker
 *
 * 策略：
 * - 預快取：app shell（theme CSS/JS）+ 讀者當下語系的核心章節 + offline fallback 頁
 * - HTML（navigation）：network-first，離線時回快取，再不行回該語系 offline 頁
 * - 靜態資產：stale-while-revalidate，runtime 快取設上限避免膨脹
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
const SHELL_ASSETS = [
  "assets/stylesheets/main.484c7ddc.min.css",
  "assets/stylesheets/palette.ab4e12ef.min.css",
  "assets/javascripts/bundle.79ae519e.min.js",
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
    urls.push(SCOPE_PATH + prefix + asset);
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
async function corePageAssets(prefix) {
  try {
    const response = await fetch(SCOPE_PATH + prefix + "offline-index.json", {
      credentials: "same-origin",
    });
    if (!response.ok) return [];
    const index = await response.json();
    const core = new Set(CORE_PAGES_BY_PREFIX[prefix] || CORE_PAGES_ZH);
    const assets = new Set();
    for (const section of index.sections || []) {
      for (const page of section.pages || []) {
        if (!core.has(page.url)) continue;
        for (const asset of page.assets || []) assets.add(asset);
      }
    }
    return [...assets].map((asset) => SCOPE_PATH + prefix + asset);
  } catch (err) {
    // 索引抓不到就只是這一輪沒補圖，頁面本身照樣存得下來
    return [];
  }
}

// 沒有網路時至少要有的那一小批：離線提示頁本身，加上撐得起它的 app shell。
//
// 為什麼不受「自動存下核心章節」的開關管：那一頁就是離線內容管理頁。讀者想清掉
// 裝置上的東西、或想知道自己還有哪些內容可讀，往往正好是連不上網的時候，那一頁
// 進不去的話整個功能等於不存在。少了它，沒快取過的網址在離線時會一路走到
// networkFirst 最後的 throw，讀者看到的是瀏覽器自己的網路錯誤畫面。
//
// 這一批約 0.5 MB，相對於完整章節的十 MB 是可以接受的底線。
function essentialUrlsFor(prefix) {
  const urls = [SCOPE_PATH + prefix + "offline/"];
  for (const asset of SHELL_ASSETS) {
    urls.push(SCOPE_PATH + prefix + asset);
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
  const probe = SCOPE_PATH + prefix + pages.find((page) => page !== "offline/");
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
  if (full && (await precacheImagesEnabled())) {
    urls = urls.concat(await corePageAssets(prefix));
  }
  // 逐一快取並容忍個別失敗（本地開發只有單一語系，其他語系路徑會 404）
  await Promise.allSettled(
    urls.map(async (url) => {
      if (await cache.match(url)) return;
      const response = await fetch(url, { credentials: "same-origin" });
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
// 翻到了第二頁。看一頁就走的人只會用掉底線那 0.5 MB。
//
// 計數刻意不放在 precacheFor 裡。install 也會呼叫那一支，算進去的話首次造訪光是
// install 加上第一次導覽就湊滿兩次，門檻等於不存在。
async function precacheOnNavigation(prefix, settled) {
  await precacheFor(prefix, settled || (await noteVisit(prefix)) >= 2);
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

async function autoPrecacheEnabled() {
  const cache = await caches.open(SETTINGS);
  const hit = await cache.match(AUTO_PRECACHE_URL);
  // 沒設定過就是開著。只有讀者明確關掉或清空過內容才會有這筆。
  if (!hit) return true;
  return (await hit.text()) !== "off";
}

async function setAutoPrecache(enabled) {
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
async function addToLibrary(prefix, paths, assets, refresh, report) {
  const pageCache = await caches.open(LIBRARY);
  const assetCache = await caches.open(LIBRARY_ASSETS);
  // 頁面先抓完再抓資產。中途斷線的話，讀者手上是幾頁完整的內容加幾頁缺圖的，
  // 比反過來（一堆圖但沒有半頁可讀）有用。
  const targets = paths
    .map((path) => ({ path: path, cache: pageCache }))
    .concat((assets || []).map((path) => ({ path: path, cache: assetCache })));
  let ok = 0;
  let failed = 0;
  let done = 0;
  for (const target of targets) {
    const url = SCOPE_PATH + prefix + target.path;
    try {
      if (!refresh && (await target.cache.match(url))) {
        ok += 1;
      } else {
        const response = await fetch(url, { credentials: "same-origin" });
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
    report({ type: "progress", done: done, total: targets.length, ok: ok, failed: failed });
  }
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

// 清掉裝置上所有跟這個站有關的快取，包含網站自動存的那批。
//
// 清完把自動預快取關掉。讀者按這顆按鈕多半是因為裝置可能被檢查，如果下一次導覽
// 又把九 MB 自動下載回來，這顆按鈕等於沒有作用。要恢復得回管理頁自己打開。
async function clearAllOffline() {
  for (const key of await caches.keys()) {
    await caches.delete(key);
  }
  precachedPrefixes.clear();
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

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await migrateLegacyRuntime();
      // LIBRARY 與 SETTINGS 都不帶版本，換版時要留著。前者是讀者自己勾選存下來的
      // 頁面，後者記著他有沒有把自動預快取關掉。任何一個被清掉，讀者的選擇就作廢。
      const keep = [PRECACHE, RUNTIME_PAGES, RUNTIME_ASSETS, LIBRARY, SETTINGS];
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => keep.indexOf(key) === -1).map((key) => caches.delete(key))
      );
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
const NAVIGATE_TIMEOUT_MS = 3000;

async function networkFirst(request, event) {
  // 先把網路那條發出去，不管後面走哪一條，它拿到的東西都要寫進快取
  const network = fetch(request).then(async (response) => {
    if (response.ok) {
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
    // 裝置上沒有這一頁，等網路是唯一的選擇，慢也要等
    try {
      return await network;
    } catch (err) {
      const offline = await caches.match(offlinePathFor(new URL(request.url)));
      if (offline) return offline;
      throw err;
    }
  }

  // 有副本就跟網路賽跑。網路先到就用網路的，讀者拿到的是最新內容。
  const raced = await Promise.race([
    network.catch(() => null),
    new Promise((resolve) => setTimeout(() => resolve(null), NAVIGATE_TIMEOUT_MS)),
  ]);
  if (raced) return raced;

  // 網路太慢或失敗，先給讀者看得到的那一份。網路那邊還在跑，回來時照樣寫進快取，
  // 下一次導覽拿到的就是新的。SW 要活到那時候，所以掛在 waitUntil 上。
  keepAlive(event, network.catch(() => {}));
  return cached;
}

async function staleWhileRevalidate(request, event) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(RUNTIME_ASSETS);
        await cache.put(request, response.clone());
        keepAlive(event, trimCache(RUNTIME_ASSETS, ASSETS_MAX_ENTRIES));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
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
