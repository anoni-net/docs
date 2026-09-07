/*
 * 我的準備清單（utils/checklist.md）。
 *
 * === 這是什麼 ===
 *
 * 站上的行動建議散在幾篇文章的小標題裡，讀者做了幾件、還剩哪些，沒有地方記。這一頁把
 * 那些小標題收成一份可勾的清單，勾選狀態用 passkey 加密存在讀者自己的裝置上
 * （docs/zh-TW/js/vault.js），站上什麼都不收，連讀者有沒有清單都不知道。
 *
 * 它也是 passkey 的第一個實際用途：建一把，之後每次進來按一次指紋就看得到自己的進度。
 *
 * === 幾個決定 ===
 *
 * 項目用語系無關的 id 當 key（daily.password-manager），三個語系各自帶標籤與連結。文章改
 * 標題、換錨點，讀者的勾選不會跟著作廢。要拿掉一個項目時把 id 移到 RETIRED，舊資料
 * 讀進來不會被當成垃圾清掉。
 *
 * 勾選的值是日期字串，不是 true。之後要做「一年一次的檢查」時，過期的項目才分得出來。
 *
 * 金鑰只活在這一頁。離開就要重新解鎖，所以每個項目的連結都開新分頁。
 *
 * 清單與加密暫存區共用同一份密文，這裡只動 checks 欄位，其他工具放的東西原樣保留。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 */
(function () {
  "use strict";

  const root = document.getElementById("checklist-tool");
  if (!root) return;

  const CSS = `
    #checklist-tool { margin: 1rem 0; }
    #checklist-tool [hidden] { display: none !important; } /* .cl-item 與 .cl-stale 自己設了 display，UA 的 [hidden] 會被壓過 */
    #checklist-tool .cl-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin: 0.8rem 0; }
    #checklist-tool button {
      min-height: 2.75rem;
      padding: 0.55rem 1.1rem;
      font-size: 0.75rem;
      line-height: 1.4;
      border: 1px solid var(--md-default-fg-color--lighter);
      border-radius: 0.4rem;
      background: var(--md-default-bg-color);
      color: var(--md-default-fg-color);
      cursor: pointer;
    }
    #checklist-tool .cl-primary {
      border-color: var(--md-primary-fg-color);
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color);
      font-weight: 600;
    }
    #checklist-tool button:hover:not(:disabled):not(.cl-primary) { border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color); }
    #checklist-tool button:disabled { opacity: 0.5; cursor: default; }
    #checklist-tool .cl-hint { font-size: 0.72rem; opacity: 0.85; }
    #checklist-tool .cl-progress { font-weight: 600; margin: 0.4rem 0; }
    #checklist-tool .cl-msg { font-weight: 600; margin: 0.4rem 0; }
    #checklist-tool .cl-error { font-weight: 600; margin: 0.4rem 0; }
    #checklist-tool .cl-group { margin: 1.2rem 0; }
    #checklist-tool .cl-group-title { font-weight: 600; margin: 0 0 0.2rem; }
    #checklist-tool ul.cl-items { list-style: none; margin: 0; padding: 0; }
    #checklist-tool .cl-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.55rem 0;
      border-top: 1px solid var(--md-default-fg-color--lightest);
    }
    #checklist-tool .cl-item input { width: 1.25rem; height: 1.25rem; margin: 0.15rem 0 0; flex: 0 0 auto; cursor: pointer; }
    #checklist-tool .cl-item label { flex: 1 1 auto; cursor: pointer; }
    #checklist-tool .cl-item a { flex: 0 0 auto; font-size: 0.72rem; white-space: nowrap; margin-top: 0.2rem; }
    #checklist-tool .cl-date { display: block; font-size: 0.7rem; opacity: 0.75; }
    #checklist-tool .cl-item--done label { opacity: 0.7; }
    #checklist-tool .cl-item--stale label { opacity: 1; }
    #checklist-tool .cl-stale {
      display: inline-block; margin-left: 0.4rem; padding: 0 0.35rem;
      font-size: 0.65rem; line-height: 1.5; border-radius: 0.3rem;
      border: 1px solid #ef6c00; color: #ef6c00; vertical-align: middle;
    }
    #checklist-tool .cl-confirm { min-height: 1.9rem; padding: 0.2rem 0.6rem; font-size: 0.7rem; margin-top: 0.3rem; }
    #checklist-tool .cl-filter { display: flex; gap: 0.5rem; align-items: center; font-size: 0.75rem; margin: 0.6rem 0; cursor: pointer; }
    #checklist-tool .cl-filter input { width: 1.1rem; height: 1.1rem; margin: 0; }
    #checklist-tool .cl-file { font-size: 0.72rem; }
    #checklist-tool .cl-panel { border: 1px dashed var(--md-default-fg-color--lighter); border-radius: 0.4rem; padding: 0.6rem 0.8rem; margin: 0.8rem 0; }
    #checklist-tool .cl-warn { font-weight: 600; border-left: 0.15rem solid #ef6c00; padding-left: 0.6rem; margin: 0.4rem 0; }
    #checklist-tool .cl-secret {
      font-family: var(--md-code-font-family, monospace); font-size: 0.72rem; word-break: break-all; user-select: all;
      padding: 0.5rem; border-radius: 0.3rem; background: var(--md-code-bg-color);
    }
    #checklist-tool .cl-qr { display: block; width: 12rem; max-width: 100%; height: auto; image-rendering: pixelated; background: #fff; margin: 0.6rem 0; }
    #checklist-tool .cl-label { display: block; margin: 0.6rem 0 0.3rem; font-size: 0.75rem; font-weight: 600; }
    #checklist-tool .cl-key {
      /* iOS Safari 在輸入框字級小於 16px 時一聚焦就放大整頁，處理同 qrcode.js */
      width: 100%; padding: 0.5rem; font-family: var(--md-code-font-family, monospace); font-size: max(16px, 0.72rem);
      border: 1px solid var(--md-default-fg-color--lighter); border-radius: 0.4rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color);
    }
    @media (pointer: coarse) {
      #checklist-tool .cl-item input { width: 1.5rem; height: 1.5rem; }
      /* 原生的檔案選擇器只有 22px 高，其他工具把它藏起來走拖放區，這裡是露在外面的 */
      #checklist-tool .cl-file { min-height: 2.2rem; }
    }
  `;

  // 清單的骨架。id 進了讀者的密文就不能改，改標籤與連結去 STRINGS。
  const GROUPS = [
    {
      id: "daily",
      items: [
        "password-manager",
        "two-factor",
        "updates",
        "verify-urgent",
        "phone-permissions",
        "disk-encryption",
        "e2e-messaging",
        "backup",
        "account-inventory",
      ],
    },
    {
      id: "travel",
      items: [
        "minimal-device",
        "tools-tested",
        "two-connections",
        "e2e-messaging-checked",
        "account-separation",
        "sim",
        "encrypt-and-power-off",
        "offline-backup-contacts",
      ],
    },
    {
      id: "yearly",
      items: [
        "reused-passwords",
        "sms-2fa",
        "backup-codes",
        "dormant-accounts",
        "logged-in-devices",
        "location-sharing",
        "app-permissions",
        "restore-test",
        "assumptions",
      ],
    },
  ];
  // 已經下架的項目 id。留著是為了讀舊資料時不把它們當成垃圾清掉。
  const RETIRED = [];

  // 一年沒動的判斷。日期是本地的 YYYY-MM-DD，兩邊都當 UTC 午夜算天數，避開時區與夏令時間。
  const STALE_DAYS = 365;
  function daysBetween(from, to) {
    const parse = (text) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || "");
      return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
    };
    return Math.floor((parse(to) - parse(from)) / 86400000);
  }
  // 勾過但超過一年，或「每年重看」那組從來沒勾過，都算該重看
  function isStale(groupId, date, today) {
    if (!date) return groupId === "yearly";
    const days = daysBetween(date, today);
    return Number.isFinite(days) && days >= STALE_DAYS;
  }

  const STRINGS = {
    "zh-TW": {
      checking: "正在確認這個瀏覽器能不能用。",
      noWebAuthn: "這個瀏覽器沒有 passkey 功能，清單存不起來。Tor Browser 整個關閉了 WebAuthn。",
      noVault: "存清單用的程式沒有載入。第一次使用需要連線，之後留在裝置上。",
      introLocked: "清單存在這台裝置上，用 passkey 鎖著。",
      introEmpty: "這台裝置上還沒有清單。已經在鑰匙頁建過 anoni.net 的 passkey 就用它開，密碼管理器裡只會有一筆。還沒有的話直接建一把新的，密碼管理器裡會多一筆叫 anoni.net 的 passkey。",
      keyPage: "passkey 鑰匙頁",
      unlock: "用 passkey 解開",
      openExisting: "用我已有的鑰匙開",
      createNew: "建一把新的鑰匙",
      waiting: "等你在瀏覽器的提示裡完成",
      progress: "已完成 {done} / {total}",
      hintLinks: "項目的連結都開新分頁，這一頁留著就不用重新解鎖。勾了會自動存。閒置 5 分鐘會自動鎖上。",
      autoLocked: "閒置 5 分鐘，已經鎖上。勾過的都存好了。",
      saved: "已存。",
      lock: "鎖上",
      exportBlob: "匯出",
      importBlob: "匯入",
      exported: "匯出的是標準 age 檔，另一台裝置匯進去之後用同一把 passkey 解開。",
      clearDevice: "清除這台裝置的暫存區",
      clearHint: "會刪掉這台裝置上的密文，其他裝置與密碼管理器裡的 passkey 不受影響。沒有匯出的話，勾選、威脅模型存檔與收件人簿都會沒。",
      clearConfirm: "確定清除",
      clearCancel: "取消",
      cleared: "清掉了。密碼管理器裡那把 passkey 要自己刪：iPhone 在設定的「密碼」裡搜 anoni.net，Android 在 Google 密碼管理員，Bitwarden 與 1Password 在它們的項目裡，其他密碼管理器在它們的項目裡搜 anoni.net。",
      deviceRisk: "這裡的加密強度等於保管 passkey 的地方，知道你解鎖密碼或密碼管理器主密碼的人一樣開得了。",
      deviceRiskGate: "要防的人是同住的伴侶、執法單位或國家級時，別在這台裝置上建鑰匙或存清單。這一頁沒有只看不存的模式，項目在情境文章裡都讀得到。怎麼判斷見",
      threatPage: "威脅模型清單的「答案預設不存」",
      threatHref: "../threat-model/#答案預設不存",
      gateEnd: "。",
      enrollShow: "登錄另一台裝置",
      enrollWarn: "下面這串就是資料金鑰本身。拍到的人可以永遠打開你的暫存區，只在你自己的兩台裝置之間用。一分鐘後自動關掉，這一頁不留它。",
      enrollSteps: "另一台打開我的準備清單，按「用另一台的鑰匙登錄這台」，拍下 QR code 或貼上字串。登錄完再用「傳到另一台」把資料搬過去。",
      enrollCountdown: "還剩 {n} 秒",
      enrollClose: "關掉",
      enrollHere: "用另一台的鑰匙登錄這台",
      enrollHereHint: "passkey 沒有同步到這台時用。另一台解開之後按「登錄另一台裝置」，把那邊顯示的字串貼進來，或拍那邊的 QR code。這台會建一把用同一份鑰匙的 passkey，資料再用那邊的「傳到另一台」搬。",
      enrollInputLabel: "另一台顯示的字串（AGE-SECRET-KEY-1 開頭）",
      enrollPhoto: "或拍另一台的 QR code",
      enrollGo: "登錄這台裝置",
      enrollBack: "返回",
      enrollDone: "這台登錄好了，用的是跟另一台同一份鑰匙。資料還在另一台，用那邊的「傳到另一台」搬過來，或直接開始用。",
      imported: "匯進來了。用 passkey 解開。",
      transfer: "傳到另一台（QR）",
      transferHint: "開了一個新分頁在播 QR code。另一台打開 QR 影格串流的接收端對著掃，收齊之後按「匯入我的準備清單」，再用同一把 passkey 解開。兩台不需要共用網路。",
      importedFromQr: "從 QR 影格串流收到的密文匯進來了。用 passkey 解開。",
      readMore: "看文章",
      staleTag: "一年以上",
      confirm: "今天確認過",
      filterLabel: "只看超過一年沒動的",
      filterEmpty: "沒有超過一年沒動的項目。",
      yearlyHint: "每年重看那一組勾了記日期，超過一年會標出來。其他組勾過超過一年也一樣。",
      groups: { daily: "平常就做", travel: "出門前", yearly: "每年重看" },
      items: {
        "password-manager": { label: "密碼管理器，每個網站不同密碼", href: "../../scenarios/everyday-baseline/#密碼管理器每個網站不同密碼" },
        "two-factor": { label: "兩步驟驗證，能用強的就用強的", href: "../../scenarios/everyday-baseline/#兩步驟驗證能用強的就用強的" },
        updates: { label: "系統與瀏覽器保持更新", href: "../../scenarios/everyday-baseline/#系統與瀏覽器保持更新" },
        "verify-urgent": { label: "對急著要你處理的訊息，換一個管道確認", href: "../../scenarios/everyday-baseline/#對急著要你處理的訊息換一個管道確認" },
        "phone-permissions": { label: "手機權限與廣告識別碼", href: "../../scenarios/everyday-baseline/#手機權限與廣告識別碼" },
        "disk-encryption": { label: "全碟加密與開機密碼", href: "../../scenarios/everyday-baseline/#全碟加密與開機密碼" },
        "e2e-messaging": { label: "日常通訊改用端對端加密", href: "../../scenarios/everyday-baseline/#日常通訊改用端對端加密" },
        backup: { label: "備份", href: "../../scenarios/everyday-baseline/#備份" },
        "account-inventory": { label: "帳號盤點", href: "../../scenarios/everyday-baseline/#帳號盤點" },
        "minimal-device": { label: "帶最簡化的裝置", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "tools-tested": { label: "出發前裝好並測試規避工具", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "two-connections": { label: "準備兩種以上的連線方式", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "e2e-messaging-checked": { label: "敏感通訊改用端對端加密工具，出發前確認目的地連得上", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "account-separation": { label: "帳號分流", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        sim: { label: "SIM 用漫遊或純數據 eSIM", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "encrypt-and-power-off": { label: "開啟全碟加密、設好開機密碼，過境時關機", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "offline-backup-contacts": { label: "留好離線備份與緊急聯絡方式", href: "../../scenarios/asia-travel/#出發前的通用準備每個地點都適用" },
        "reused-passwords": { label: "密碼管理器裡有沒有重複使用的密碼？工具多半內建檢查功能", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "sms-2fa": { label: "兩步驟驗證還停在簡訊的重要帳號，有沒有可以升級的？", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "backup-codes": { label: "備援碼還找得到嗎？換過手機之後尤其要確認", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "dormant-accounts": { label: "一年沒登入的帳號，刪掉", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "logged-in-devices": { label: "LINE 與社群帳號的登入中裝置，有沒有你不認得的？", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "location-sharing": { label: "誰還看得到你的位置分享？家庭共享、行事曆、相簿都算", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "app-permissions": { label: "手機權限清單，新裝的 app 要了什麼？", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "restore-test": { label: "備份還原得回來嗎？沒有試過還原的備份不算備份", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
        "assumptions": { label: "換工作、換伴侶、換城市之後，上面的假設還成立嗎？", href: "../../scenarios/everyday-baseline/#一年一次的檢查" },
      },
      errors: {
        cancelled: "你取消了，或瀏覽器沒有完成。再按一次。",
        unsupported: "這個環境不允許用 passkey。要在正式站、https 網址，瀏覽器也沒有把功能關掉。",
        failed: "沒有成功。換一個瀏覽器或密碼管理器試試。",
        badFile: "檔案格式不對，要的是從清單匯出的 age 檔。",
        badImport: "帶過來的內容不是暫存區的密文。",
        badKey: "這串不是暫存區的鑰匙，要 AGE-SECRET-KEY-1 開頭的 74 個字元。",
        noQr: "照片裡找不到 QR code，靠近一點、對正再拍一次。",
      },
    },
    zh: {
      checking: "正在确认这个浏览器能不能用。",
      noWebAuthn: "这个浏览器没有 passkey 功能，清单存不起来。Tor Browser 整个关闭了 WebAuthn。",
      noVault: "存清单用的程序没有加载。第一次使用需要联网，之后留在设备上。",
      introLocked: "清单存在这台设备上，用 passkey 锁着。",
      introEmpty: "这台设备上还没有清单。已经在钥匙页创建过 anoni.net 的 passkey 就用它开，密码管理器里只会有一笔。还没有的话直接创建一把新的，密码管理器里会多一笔叫 anoni.net 的 passkey。",
      keyPage: "passkey 钥匙页",
      unlock: "用 passkey 解开",
      openExisting: "用我已有的钥匙开",
      createNew: "创建一把新的钥匙",
      waiting: "等你在浏览器的提示里完成",
      progress: "已完成 {done} / {total}",
      hintLinks: "项目的链接都开新标签页，这一页留着就不用重新解锁。勾了会自动存。闲置 5 分钟会自动锁上。",
      autoLocked: "闲置 5 分钟，已经锁上。勾过的都存好了。",
      saved: "已存。",
      lock: "锁上",
      exportBlob: "导出",
      importBlob: "导入",
      exported: "导出的是标准 age 文件，另一台设备导进去之后用同一把 passkey 解开。",
      clearDevice: "清除这台设备的暂存区",
      clearHint: "会删掉这台设备上的密文，其他设备与密码管理器里的 passkey 不受影响。没有导出的话，勾选、威胁模型存档与收件人簿都会没。",
      clearConfirm: "确定清除",
      clearCancel: "取消",
      cleared: "清掉了。密码管理器里那把 passkey 要自己删：iPhone 在设置的「密码」里搜 anoni.net，Android 在 Google 密码管理器，Bitwarden 与 1Password 在它们的项目里，其他密码管理器在它们的项目里搜 anoni.net。",
      deviceRisk: "这里的加密强度等于保管 passkey 的地方，知道你解锁密码或密码管理器主密码的人一样开得了。",
      deviceRiskGate: "要防的人是同住的伴侣、执法单位或国家级时，别在这台设备上创建钥匙或存清单。这一页没有只看不存的模式，项目在情境文章里都读得到。怎么判断见",
      threatPage: "威胁模型清单的「答案预设不存」",
      threatHref: "../threat-model/#答案预设不存",
      gateEnd: "。",
      enrollShow: "登录另一台设备",
      enrollWarn: "下面这串就是数据密钥本身。拍到的人可以永远打开你的暂存区，只在你自己的两台设备之间用。一分钟后自动关掉，这一页不留它。",
      enrollSteps: "另一台打开我的准备清单，按「用另一台的钥匙登录这台」，拍下 QR code 或贴上字串。登录完再用「传到另一台」把数据搬过去。",
      enrollCountdown: "还剩 {n} 秒",
      enrollClose: "关掉",
      enrollHere: "用另一台的钥匙登录这台",
      enrollHereHint: "passkey 没有同步到这台时用。另一台解开之后按「登录另一台设备」，把那边显示的字串贴进来，或拍那边的 QR code。这台会创建一把用同一份钥匙的 passkey，数据再用那边的「传到另一台」搬。",
      enrollInputLabel: "另一台显示的字串（AGE-SECRET-KEY-1 开头）",
      enrollPhoto: "或拍另一台的 QR code",
      enrollGo: "登录这台设备",
      enrollBack: "返回",
      enrollDone: "这台登录好了，用的是跟另一台同一份钥匙。数据还在另一台，用那边的「传到另一台」搬过来，或直接开始用。",
      imported: "导进来了。用 passkey 解开。",
      transfer: "传到另一台（QR）",
      transferHint: "开了一个新标签页在播 QR code。另一台打开 QR 影格串流的接收端对着扫，收齐之后按「导入我的准备清单」，再用同一把 passkey 解开。两台不需要共用网络。",
      importedFromQr: "从 QR 影格串流收到的密文导进来了。用 passkey 解开。",
      readMore: "看文章",
      staleTag: "一年以上",
      confirm: "今天确认过",
      filterLabel: "只看超过一年没动的",
      filterEmpty: "没有超过一年没动的项目。",
      yearlyHint: "每年重看那一组勾了记日期，超过一年会标出来。其他组勾过超过一年也一样。",
      groups: { daily: "平常就做", travel: "出门前", yearly: "每年重看" },
      items: {
        "password-manager": { label: "密码管理器，每个网站不同密码", href: "../../scenarios/everyday-baseline/#密码管理器每个网站不同密码" },
        "two-factor": { label: "两步验证，能用强的就用强的", href: "../../scenarios/everyday-baseline/#两步验证能用强的就用强的" },
        updates: { label: "系统与浏览器保持更新", href: "../../scenarios/everyday-baseline/#系统与浏览器保持更新" },
        "verify-urgent": { label: "对急着要你处理的消息，换一个管道确认", href: "../../scenarios/everyday-baseline/#对急着要你处理的消息换一个管道确认" },
        "phone-permissions": { label: "手机权限与广告标识符", href: "../../scenarios/everyday-baseline/#手机权限与广告标识符" },
        "disk-encryption": { label: "全盘加密与开机密码", href: "../../scenarios/everyday-baseline/#全盘加密与开机密码" },
        "e2e-messaging": { label: "日常通讯改用端对端加密", href: "../../scenarios/everyday-baseline/#日常通讯改用端对端加密" },
        backup: { label: "备份", href: "../../scenarios/everyday-baseline/#备份" },
        "account-inventory": { label: "账号盘点", href: "../../scenarios/everyday-baseline/#账号盘点" },
        "minimal-device": { label: "带最简化的装置", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "tools-tested": { label: "出发前装好并测试规避工具", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "two-connections": { label: "准备两种以上的连线方式", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "e2e-messaging-checked": { label: "敏感通讯改用端对端加密工具，出发前确认目的地连得上", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "account-separation": { label: "账号分流", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        sim: { label: "SIM 用漫游或纯数据 eSIM", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "encrypt-and-power-off": { label: "开启全盘加密、设好开机密码，过境时关机", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "offline-backup-contacts": { label: "留好离线备份与紧急联络方式", href: "../../scenarios/asia-travel/#出发前的通用准备每个地点都适用" },
        "reused-passwords": { label: "密码管理器里有没有重复使用的密码？工具多半内建检查功能", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "sms-2fa": { label: "两步验证还停在短信的重要账号，有没有可以升级的？", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "backup-codes": { label: "备援码还找得到吗？换过手机之后尤其要确认", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "dormant-accounts": { label: "一年没登录的账号，删掉", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "logged-in-devices": { label: "通讯 app 与社群账号的登录中设备，有没有你不认得的？", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "location-sharing": { label: "谁还看得到你的位置分享？家庭共享、日历、相册都算", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "app-permissions": { label: "手机权限清单，新装的 app 要了什么？", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "restore-test": { label: "备份还原得回来吗？没有试过还原的备份不算备份", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
        "assumptions": { label: "换工作、换伴侣、换城市之后，上面的假设还成立吗？", href: "../../scenarios/everyday-baseline/#一年一次的检查" },
      },
      errors: {
        cancelled: "你取消了，或浏览器没有完成。再按一次。",
        unsupported: "这个环境不允许用 passkey。要在正式站、https 网址，浏览器也没有把功能关掉。",
        failed: "没有成功。换一个浏览器或密码管理器试试。",
        badFile: "文件格式不对，要的是从清单导出的 age 文件。",
        badImport: "带过来的内容不是暂存区的密文。",
        badKey: "这串不是暂存区的钥匙，要 AGE-SECRET-KEY-1 开头的 74 个字符。",
        noQr: "照片里找不到 QR code，靠近一点、对正再拍一次。",
      },
    },
    en: {
      checking: "Checking whether this browser can be used.",
      noWebAuthn: "This browser has no passkey support, so the list cannot be stored. Tor Browser turns WebAuthn off entirely.",
      noVault: "The code that stores the list has not loaded. The first use needs a connection; after that it stays on the device.",
      introLocked: "Your list is on this device, locked with your passkey.",
      introEmpty: "There is no list on this device yet. If you already created an anoni.net passkey on the key page, open with it and your password manager keeps a single entry. Otherwise create a new one here; your password manager will gain an entry named anoni.net.",
      keyPage: "passkey key page",
      unlock: "Unlock with passkey",
      openExisting: "Open with my existing key",
      createNew: "Create a new key",
      waiting: "Finish the prompt in your browser",
      progress: "{done} / {total} done",
      hintLinks: "Every link opens in a new tab, so this page stays unlocked. Ticks are saved automatically. After 5 idle minutes it locks by itself.",
      autoLocked: "Locked after 5 idle minutes. Everything you ticked is saved.",
      saved: "Saved.",
      lock: "Lock",
      exportBlob: "Export",
      importBlob: "Import",
      exported: "The export is a standard age file. Import it on another device and unlock with the same passkey.",
      clearDevice: "Clear the stash on this device",
      clearHint: "Deletes the ciphertext on this device only; other devices and the passkey in your password manager are untouched. Without an export, the ticks, the saved threat model answers and the address book are gone.",
      clearConfirm: "Yes, clear it",
      clearCancel: "Cancel",
      cleared: "Cleared. The passkey in your password manager is yours to delete: on iPhone search for anoni.net under Settings, Passwords; on Android, Google Password Manager; in Bitwarden or 1Password, its own item; in any other password manager, search its items for anoni.net.",
      deviceRisk: "The encryption here is only as strong as the place that keeps the passkey. Anyone who knows your unlock code or your password manager's master password can open it too.",
      deviceRiskGate: "If the person you guard against is a partner you live with, law enforcement or a state, do not create a key or save the list on this device. There is no view-only mode here; the items are all in the scenario articles. How to tell: ",
      threatPage: "Nothing is saved by default, on the threat model checklist",
      threatHref: "../threat-model/#Nothing-is-saved-by-default",
      gateEnd: ".",
      enrollShow: "Enrol another device",
      enrollWarn: "The string below is the data key itself. Anyone who photographs it can open your stash forever, so use it only between your own two devices. It closes by itself after a minute and this page keeps no copy.",
      enrollSteps: "On the other device, open my preparation checklist, press Enrol this device with a key from another, then photograph this QR code or paste the string. Once enrolled, use Send to another device to move the data across.",
      enrollCountdown: "{n} seconds left",
      enrollClose: "Close",
      enrollHere: "Enrol this device with a key from another",
      enrollHereHint: "For when the passkey did not sync to this device. Unlock on the other device, press Enrol another device, then paste the string shown there or photograph its QR code. This device gets a passkey with the same key; move the data afterwards with Send to another device over there.",
      enrollInputLabel: "The string shown on the other device (starts with AGE-SECRET-KEY-1)",
      enrollPhoto: "or photograph the other device's QR code",
      enrollGo: "Enrol this device",
      enrollBack: "Back",
      enrollDone: "This device is enrolled with the same key as the other one. The data is still over there: use Send to another device on that side, or just start here.",
      imported: "Imported. Unlock with your passkey.",
      transfer: "Send to another device (QR)",
      transferHint: "A new tab is playing QR codes. On the other device, open the QR frame stream receiver and point it at the screen. Once complete, press Import into my preparation checklist and unlock with the same passkey. The two devices do not need a shared network.",
      importedFromQr: "The ciphertext received over the QR frame stream is imported. Unlock with your passkey.",
      readMore: "Read",
      staleTag: "over a year",
      confirm: "Checked today",
      filterLabel: "Only what has sat for over a year",
      filterEmpty: "Nothing has sat for over a year.",
      yearlyHint: "Ticks in the yearly group carry a date and get flagged after a year. So does anything in the other groups ticked more than a year ago.",
      groups: { daily: "Everyday", travel: "Before you travel", yearly: "Yearly review" },
      items: {
        "password-manager": { label: "A password manager with a different password per site", href: "../../scenarios/everyday-baseline/#A-password-manager-with-a-different-password-per-site" },
        "two-factor": { label: "Two-factor authentication as strong as the site allows", href: "../../scenarios/everyday-baseline/#Two-factor-authentication-as-strong-as-the-site-allows" },
        updates: { label: "Keep the operating system and browser updated", href: "../../scenarios/everyday-baseline/#Keep-the-operating-system-and-browser-updated" },
        "verify-urgent": { label: "Verify anything urgent through a second channel", href: "../../scenarios/everyday-baseline/#Verify-anything-urgent-through-a-second-channel" },
        "phone-permissions": { label: "Phone permissions and the advertising identifier", href: "../../scenarios/everyday-baseline/#Phone-permissions-and-the-advertising-identifier" },
        "disk-encryption": { label: "Full-disk encryption and a boot password", href: "../../scenarios/everyday-baseline/#Full-disk-encryption-and-a-boot-password" },
        "e2e-messaging": { label: "Move everyday messaging to end-to-end encryption", href: "../../scenarios/everyday-baseline/#Move-everyday-messaging-to-end-to-end-encryption" },
        backup: { label: "Backups", href: "../../scenarios/everyday-baseline/#Backups" },
        "account-inventory": { label: "Take inventory of your accounts", href: "../../scenarios/everyday-baseline/#Take-inventory-of-your-accounts" },
        "minimal-device": { label: "Travel with a minimal device", href: "../../scenarios/asia-travel/#The-clean-device-strategy" },
        "tools-tested": { label: "Install and test circumvention tools before leaving", href: "../../scenarios/asia-travel/" },
        "two-connections": { label: "Prepare two or more ways to connect", href: "../../scenarios/asia-travel/" },
        "e2e-messaging-checked": { label: "Move sensitive messaging to an end-to-end encrypted app, and confirm it works at the destination", href: "../../scenarios/asia-travel/" },
        "account-separation": { label: "Separate accounts for the trip, work and personal life", href: "../../scenarios/asia-travel/" },
        sim: { label: "Roam on your home SIM or use a data-only eSIM", href: "../../scenarios/asia-travel/#SIM-eSIM-and-the-history-that-travels-with-you" },
        "encrypt-and-power-off": { label: "Full-disk encryption on, strong boot password, powered off at the border", href: "../../scenarios/asia-travel/#At-the-border-conduct-and-device-state" },
        "offline-backup-contacts": { label: "Offline backup and emergency contacts", href: "../../scenarios/asia-travel/#Back-up-before-you-go-and-watch-the-cloud-double-edge" },
        "reused-passwords": { label: "Any reused passwords left in the manager? Most tools check this for you", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "sms-2fa": { label: "Any important accounts still on SMS that now support something stronger?", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "backup-codes": { label: "Can you still find your recovery codes, especially after changing phones?", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "dormant-accounts": { label: "Delete anything you have not signed into in a year", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "logged-in-devices": { label: "Any devices you do not recognize in the active-session list of your messaging and social accounts?", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "location-sharing": { label: "Who can still see your location sharing? Family sharing, calendars, and shared albums all count", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "app-permissions": { label: "Review the phone permission list, especially for recently installed apps", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "restore-test": { label: "Can you actually restore from your backup? An untested backup is not a backup", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
        "assumptions": { label: "After a job change, a relationship change, or a move: do the assumptions above still hold?", href: "../../scenarios/everyday-baseline/#A-yearly-review" },
      },
      errors: {
        cancelled: "You cancelled, or the browser did not finish. Press again.",
        unsupported: "This environment does not allow passkeys. It needs the production site, an https address, and a browser that has not turned the feature off.",
        failed: "It did not work. Try another browser or password manager.",
        badFile: "That file is not an age file exported from here.",
        badImport: "What was handed over is not stash ciphertext.",
        badKey: "That is not a stash key. It should be 74 characters starting with AGE-SECRET-KEY-1.",
        noQr: "No QR code found in the photo. Get closer, line it up and try again.",
      },
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", (event) => {
      event.preventDefault(); // 放在 <label> 裡的按鈕，不讓點擊順便切到 checkbox
      onClick(event);
    });
    return node;
  }
  function busyButton(label) {
    const node = button("", "cl-primary", () => {});
    const spin = el("span", "anoni-spinner");
    spin.setAttribute("aria-hidden", "true");
    node.appendChild(spin);
    node.appendChild(document.createTextNode(label));
    node.setAttribute("aria-busy", "true");
    node.disabled = true;
    return node;
  }
  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, (m, key) => (key in values ? String(values[key]) : m));
  }
  function classifyError(err) {
    const name = err && err.name;
    if (name === "NotAllowedError" || name === "AbortError") return "cancelled";
    if (name === "NotSupportedError" || name === "SecurityError") return "unsupported";
    if (err && err.message && t.errors[err.message]) return err.message; // 自己丟的錯誤碼原樣回
    return "failed";
  }
  // 本地日期，不是 UTC。讀者看到的日期要跟自己的日曆對得上。
  function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  const vault = () => window.anoniVault;
  const ALL_IDS = GROUPS.flatMap((g) => g.items.map((item) => g.id + "." + item));

  // 三塊固定的容器。清單本體在解開時建一次，之後只改勾選旁的日期與進度，
  // 不整段重建，讀者連按兩下不會按到剛被換掉的元素。
  const head = el("div", "cl-head");
  const list = el("div", "cl-list");
  const foot = el("div", "cl-foot");
  root.appendChild(head);
  root.appendChild(list);
  root.appendChild(foot);

  const state = {
    support: null, // null 還在查，之後是 { webauthn, vault }
    exists: false,
    unlocked: false,
    onlyStale: false, // 只看超過一年沒動的
    enroll: { showing: false, identity: "", until: 0, timer: null, here: false, input: "" }, // 登錄另一台
    clearing: false, // 清除這台裝置：按了第一下，等確認
    busy: null, // "unlock" | "open" | "create" | "import" | "export"
    data: null, // 解開後整份資料，checks 只是其中一欄
    error: null,
    message: "",
  };
  const boxes = new Map(); // id → { input, date, item, tag, confirm, group }
  const groupBoxes = new Map(); // group id → 容器，篩選時整組藏起來

  async function refresh() {
    const v = vault();
    state.support = {
      webauthn: !!(window.PublicKeyCredential && navigator.credentials),
      vault: !!(v && v.available()),
    };
    state.exists = state.support.vault ? await v.exists() : false;
  }

  async function guard(action, work) {
    state.error = null;
    state.message = "";
    state.busy = action;
    render();
    try {
      await work();
    } catch (err) {
      state.error = classifyError(err);
    }
    state.busy = null;
    render();
  }

  async function opened() {
    const data = (await vault().read()) || {};
    if (!data.checks || typeof data.checks !== "object") data.checks = {};
    state.data = data;
    state.unlocked = true;
    state.exists = true;
    buildList();
    touch();
    armIdle();
  }

  const unlock = () => guard("unlock", async () => { await vault().unlock(); await opened(); });
  const openExisting = () => guard("open", async () => { await vault().openWithExisting(null); await opened(); });
  const createNew = () => guard("create", async () => { await vault().create(null); await opened(); });

  // --- 自動儲存 ---
  let saveTimer = null;
  let saving = false;
  let pending = false;
  function scheduleSave() {
    pending = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 600);
  }
  async function saveNow() {
    clearTimeout(saveTimer);
    if (!state.unlocked || !pending) return;
    if (saving) return; // 進行中的那一次結束後會再跑一次
    pending = false;
    saving = true;
    try {
      await vault().save(state.data);
      state.message = t.saved;
      state.error = null;
    } catch (err) {
      state.error = classifyError(err);
    }
    saving = false;
    renderFoot();
    if (pending) await saveNow();
  }

  // 鎖上之前先把還沒寫進去的勾選存掉，自動鎖上也走這裡
  async function doLock() {
    await saveNow();
    closeEnrollSilently();
    clearTimeout(idleTimer);
    idleTimer = null;
    vault().lock();
    state.unlocked = false;
    state.data = null;
    state.clearing = false;
    boxes.clear();
    list.textContent = "";
  }
  const lock = () => guard("lock", doLock);

  // --- 閒置自動鎖上 ---
  //
  // 解開後放著不動 5 分鐘就鎖，讀者走開時畫面不會一直攤著明文。計時器在背景分頁會被
  // 瀏覽器拖慢，所以切回來時再看一次最後一次動作是多久以前，超過就立刻鎖。
  const AUTO_LOCK_MS = 5 * 60 * 1000;
  const IDLE_POLL_MS = 30 * 1000;
  let lastActivity = Date.now();
  let idleTimer = null;
  function touch() {
    lastActivity = Date.now();
  }
  function armIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(checkIdle, IDLE_POLL_MS);
  }
  function checkIdle() {
    idleTimer = null;
    if (!state.unlocked) return;
    if (Date.now() - lastActivity >= AUTO_LOCK_MS) {
      guard("lock", async () => {
        await doLock();
        state.message = t.autoLocked;
      });
      return;
    }
    armIdle();
  }
  for (const type of ["pointerdown", "keydown", "input", "scroll"]) {
    document.addEventListener(type, touch, { passive: true, capture: true });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkIdle();
  });

  const exportBlob = () =>
    guard("export", async () => {
      await saveNow();
      const bytes = await vault().exportBlob();
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "anoni-vault.age";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      state.message = t.exported;
    });

  const isAgeBlob = (bytes) => bytes.length >= 16 && new TextDecoder().decode(bytes.subarray(0, 11)) === "age-encrypt";
  async function importBytes(bytes, message, badCode) {
    if (!isAgeBlob(bytes)) throw new Error(badCode);
    await vault().importBlob(bytes);
    state.unlocked = false;
    state.data = null;
    boxes.clear();
    list.textContent = "";
    await refresh();
    state.message = message;
  }
  const importBlob = (file) =>
    guard("import", async () => {
      await importBytes(new Uint8Array(await file.arrayBuffer()), t.imported, "badFile");
    });

  // --- 傳到另一台 ---
  //
  // 密文放進 QR 影格串流頁的網址片段 #send=<base64url>，那一頁載入就當作要傳的檔案。
  // 接收端拼完帶著 #import=<base64url> 回來，這裡讀到就匯入。片段不會送到伺服器，
  // 內容也只是密文，讀完就把片段清掉。
  function toBase64Url(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromBase64Url(text) {
    const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }
  const transfer = () =>
    guard("export", async () => {
      await saveNow();
      const bytes = await vault().exportBlob();
      const url = new URL("../qr-stream/", window.location.href);
      url.hash = "send=" + toBase64Url(bytes);
      window.open(url.href, "_blank", "noopener");
      state.message = t.transferHint;
    });
  // 進頁面時看有沒有帶密文回來。壞掉的片段一樣清掉，不留在網址列
  function takeIncoming() {
    const loc = window.location;
    if (!loc || typeof loc.hash !== "string" || loc.hash.indexOf("#import=") !== 0) return null;
    let bytes = null;
    try {
      bytes = fromBase64Url(loc.hash.slice("#import=".length));
    } catch (err) {
      bytes = new Uint8Array(0);
    }
    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", loc.pathname + loc.search);
    }
    return bytes;
  }


  // --- 清除這台裝置 ---
  //
  // 刪的是這台裝置上的密文，兩段式，第二下才真的刪。原本這功能只在實驗頁，清單是正式
  // 工具，退場的路要在這裡。
  const clearDevice = () =>
    guard("clear", async () => {
      closeEnrollSilently();
      await vault().clear();
      state.clearing = false;
      state.unlocked = false;
      state.data = null;
      boxes.clear();
      list.textContent = "";
      await refresh();
      state.message = t.cleared;
    });

  // --- 登錄另一台裝置 ---
  //
  // passkey 不會同步過去的第二台（例如手機用 iCloud 鑰匙圈、電腦用 Windows Hello）要能開同一份暫存區，得把那
  // 32 個位元組帶過去一次。A 解開後把鑰匙用 age 私鑰的編碼顯示成 QR code 與文字，限時
  // 一分鐘；B 拍照或貼上，用同一個 user.id 建一把新的 passkey。那串就是資料金鑰本身，
  // 顯示前先警告，關掉或鎖上就從記憶體拿掉，這一頁不留。
  const ENROLL_MS = 60 * 1000;
  const looksLikeKey = (text) => /^AGE-SECRET-KEY-1[02-9AC-HJ-NP-Z]{58}$/i.test(String(text || "").trim());
  let countdownNode = null;
  function stopEnrollTimer() {
    if (state.enroll.timer) clearInterval(state.enroll.timer);
    state.enroll.timer = null;
  }
  function closeEnrollSilently() {
    stopEnrollTimer();
    state.enroll.showing = false;
    state.enroll.identity = "";
    state.enroll.until = 0;
  }
  function closeEnroll() {
    closeEnrollSilently();
    render();
  }
  function tickEnroll() {
    const left = Math.ceil((state.enroll.until - Date.now()) / 1000);
    if (left <= 0) {
      closeEnroll();
      return;
    }
    if (countdownNode) countdownNode.textContent = fill(t.enrollCountdown, { n: left });
  }
  const showEnroll = () =>
    guard("enroll", async () => {
      state.enroll.identity = await vault().exportIdentity();
      state.enroll.until = Date.now() + ENROLL_MS;
      state.enroll.showing = true;
      stopEnrollTimer();
      state.enroll.timer = setInterval(tickEnroll, 1000);
    });
  // QR code 交給 vendor 的 qrcode-generator，畫在 canvas 上，沒有它就只顯示文字
  function drawQr(text) {
    if (typeof window.qrcode !== "function") return null;
    const qr = window.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const scale = 4;
    const margin = 4 * scale;
    const canvas = document.createElement("canvas");
    canvas.className = "cl-qr";
    canvas.width = count * scale + margin * 2;
    canvas.height = canvas.width;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) ctx.fillRect(margin + col * scale, margin + row * scale, scale, scale);
      }
    }
    return canvas;
  }
  function enrollShowPanel() {
    const box = el("div", "cl-panel cl-enroll-show");
    box.appendChild(el("p", "cl-warn", t.enrollWarn));
    const canvas = drawQr(state.enroll.identity);
    if (canvas) box.appendChild(canvas);
    box.appendChild(el("p", "cl-secret", state.enroll.identity));
    box.appendChild(el("p", "cl-hint", t.enrollSteps));
    countdownNode = el("p", "cl-hint cl-countdown", fill(t.enrollCountdown, { n: Math.max(0, Math.ceil((state.enroll.until - Date.now()) / 1000)) }));
    box.appendChild(countdownNode);
    const row = el("div", "cl-row");
    row.appendChild(button(t.enrollClose, "cl-primary", closeEnroll));
    box.appendChild(row);
    return box;
  }
  // B 這端：拍另一台螢幕的照片交給 vendor 的 jsQR 解，不開即時相機
  async function decodeQrPhoto(file) {
    if (typeof window.jsQR !== "function" || typeof createImageBitmap !== "function") throw new Error("noQr");
    const bitmap = await createImageBitmap(file);
    try {
      const cap = 1400;
      const ratio = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * ratio));
      const height = Math.max(1, Math.round(bitmap.height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, width, height);
      const pixels = ctx.getImageData(0, 0, width, height);
      const found = window.jsQR(pixels.data, width, height);
      if (!found || !looksLikeKey(found.data)) throw new Error("noQr");
      return found.data.trim();
    } finally {
      if (bitmap.close) bitmap.close();
    }
  }
  function readQrPhoto(file) {
    state.error = null;
    decodeQrPhoto(file).then(
      (text) => {
        state.enroll.input = text;
        render();
      },
      () => {
        state.error = "noQr";
        render();
      }
    );
  }
  function syncEnrollGo() {
    const go = root.querySelector(".cl-enroll-go");
    if (go) go.disabled = !looksLikeKey(state.enroll.input);
  }
  const enrollHere = () =>
    guard("enroll", async () => {
      const bytes = await vault().keyFromIdentity(state.enroll.input);
      await vault().enrollDevice(bytes);
      state.enroll.here = false;
      state.enroll.input = "";
      await opened();
      state.message = t.enrollDone;
    });
  function enrollHerePanel() {
    const box = el("div", "cl-panel cl-enroll-here");
    box.appendChild(el("p", "cl-hint", t.enrollHereHint));
    const label = el("label", "cl-label", t.enrollInputLabel);
    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = "cl-key";
    input.value = state.enroll.input;
    input.addEventListener("input", () => {
      state.enroll.input = input.value;
      syncEnrollGo();
    });
    label.appendChild(input);
    box.appendChild(label);
    const photoRow = el("div", "cl-row");
    photoRow.appendChild(el("span", "cl-hint", t.enrollPhoto));
    const photo = document.createElement("input");
    photo.type = "file";
    photo.accept = "image/*";
    photo.setAttribute("capture", "environment");
    photo.className = "cl-file cl-photo";
    photo.setAttribute("aria-label", t.enrollPhoto);
    photo.addEventListener("change", () => {
      if (photo.files && photo.files[0]) readQrPhoto(photo.files[0]);
    });
    photoRow.appendChild(photo);
    box.appendChild(photoRow);
    const row = el("div", "cl-row");
    const go = button(t.enrollGo, "cl-primary cl-enroll-go", enrollHere);
    go.disabled = !looksLikeKey(state.enroll.input);
    row.appendChild(go);
    row.appendChild(button(t.enrollBack, null, () => {
      state.enroll.here = false;
      render();
    }));
    box.appendChild(row);
    return box;
  }
  window.addEventListener("pagehide", closeEnrollSilently);

  // --- 清單本體 ---
  function onToggle(id) {
    const entry = boxes.get(id);
    if (!entry || !state.data) return;
    if (entry.input.checked) state.data.checks[id] = today();
    else delete state.data.checks[id];
    paint(id);
    renderProgress();
    scheduleSave();
  }
  function paint(id) {
    const entry = boxes.get(id);
    const when = state.data.checks[id];
    const stale = isStale(entry.group, when, today());
    entry.item.classList.toggle("cl-item--done", !!when);
    entry.item.classList.toggle("cl-item--stale", stale);
    entry.date.textContent = when || "";
    entry.tag.hidden = !stale;
    entry.confirm.hidden = !(stale && when); // 沒勾過的直接勾，勾過太久的按確認換日期
  }
  function onConfirm(id) {
    if (!state.data) return;
    state.data.checks[id] = today();
    paint(id);
    applyFilter();
    renderProgress();
    scheduleSave();
  }
  function staleCount() {
    return ALL_IDS.filter((id) => boxes.has(id) && isStale(boxes.get(id).group, state.data.checks[id], today())).length;
  }
  // 篩選只改 hidden，不重建清單
  function applyFilter() {
    let shown = 0;
    for (const [gid, box] of groupBoxes) {
      let inGroup = 0;
      for (const [id, entry] of boxes) {
        if (entry.group !== gid) continue;
        const show = !state.onlyStale || isStale(gid, state.data.checks[id], today());
        entry.item.hidden = !show;
        if (show) inGroup += 1;
      }
      box.hidden = inGroup === 0;
      shown += inGroup;
    }
    if (filterEmptyNode) filterEmptyNode.hidden = !(state.onlyStale && shown === 0);
    if (filterCountNode) filterCountNode.textContent = t.filterLabel + "（" + staleCount() + "）";
  }
  function buildList() {
    list.textContent = "";
    boxes.clear();
    groupBoxes.clear();
    for (const group of GROUPS) {
      const box = el("div", "cl-group");
      box.appendChild(el("p", "cl-group-title", t.groups[group.id]));
      const ul = el("ul", "cl-items");
      for (const item of group.items) {
        const id = group.id + "." + item;
        const text = t.items[item];
        const li = el("li", "cl-item");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = "cl-" + id.replace(/\./g, "-");
        input.checked = !!state.data.checks[id];
        input.addEventListener("change", () => onToggle(id));
        const label = el("label", null, text.label);
        label.htmlFor = input.id;
        const date = el("span", "cl-date");
        label.appendChild(date);
        const tag = el("span", "cl-stale", t.staleTag);
        label.insertBefore(tag, date);
        const confirm = button(t.confirm, "cl-confirm", () => onConfirm(id));
        label.appendChild(confirm);
        const link = el("a", null, t.readMore);
        link.href = text.href;
        link.target = "_blank";
        link.rel = "noopener";
        li.appendChild(input);
        li.appendChild(label);
        li.appendChild(link);
        ul.appendChild(li);
        boxes.set(id, { input: input, date: date, item: li, tag: tag, confirm: confirm, group: group.id });
        paint(id);
      }
      box.appendChild(ul);
      list.appendChild(box);
      groupBoxes.set(group.id, box);
    }
    filterEmptyNode = el("p", "cl-hint", t.filterEmpty);
    list.appendChild(filterEmptyNode);
    applyFilter();
  }
  function doneCount() {
    return ALL_IDS.filter((id) => !!state.data.checks[id]).length;
  }

  // --- 畫面 ---
  let progressNode = null;
  let filterEmptyNode = null;
  let filterCountNode = null;
  function renderProgress() {
    if (progressNode && state.data) progressNode.textContent = fill(t.progress, { done: doneCount(), total: ALL_IDS.length });
  }
  function renderFoot() {
    foot.textContent = "";
    if (state.error) foot.appendChild(el("p", "cl-error", t.errors[state.error] || t.errors.failed));
    if (state.message) foot.appendChild(el("p", "cl-msg", state.message));
  }
  function renderLocked() {
    if (!state.support.webauthn) {
      head.appendChild(el("p", "cl-error", t.noWebAuthn));
      return;
    }
    if (!state.support.vault) {
      head.appendChild(el("p", "cl-error", t.noVault));
      return;
    }
    const row = el("div", "cl-row");
    if (state.busy) {
      row.appendChild(busyButton(t.waiting));
      head.appendChild(row);
      return;
    }
    if (state.exists) {
      head.appendChild(el("p", "cl-hint", t.introLocked));
      row.appendChild(button(t.unlock, "cl-primary", unlock));
    } else {
      const hint = el("p", "cl-hint", t.introEmpty + " ");
      const link = el("a", null, t.keyPage);
      link.href = "../passkey/";
      hint.appendChild(link);
      head.appendChild(hint);
      row.appendChild(button(t.openExisting, "cl-primary", openExisting));
      row.appendChild(button(t.createNew, null, createNew));
      row.appendChild(button(t.enrollHere, null, () => {
        state.enroll.here = !state.enroll.here;
        render();
      }));
    }
    head.appendChild(el("p", "cl-hint", t.deviceRisk));
    const gate = el("p", "cl-hint", t.deviceRiskGate);
    const gateLink = el("a", null, t.threatPage);
    gateLink.href = t.threatHref;
    gate.appendChild(gateLink);
    gate.appendChild(document.createTextNode(t.gateEnd));
    head.appendChild(gate);
    head.appendChild(row);
    if (!state.exists && state.enroll.here) head.appendChild(enrollHerePanel());
    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".age,application/octet-stream";
    file.className = "cl-file";
    file.setAttribute("aria-label", t.importBlob);
    file.addEventListener("change", () => {
      if (file.files && file.files[0]) importBlob(file.files[0]);
    });
    head.appendChild(file);
  }
  function renderUnlocked() {
    progressNode = el("p", "cl-progress");
    head.appendChild(progressNode);
    renderProgress();
    head.appendChild(el("p", "cl-hint", t.hintLinks + (/[。.]$/.test(t.hintLinks) && !/\.$/.test(t.hintLinks) ? "" : " ") + t.yearlyHint));
    const filter = el("label", "cl-filter");
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = state.onlyStale;
    toggle.addEventListener("change", () => {
      state.onlyStale = toggle.checked;
      applyFilter();
    });
    filter.appendChild(toggle);
    filterCountNode = el("span", null, "");
    filter.appendChild(filterCountNode);
    head.appendChild(filter);
    const row = el("div", "cl-row");
    if (state.busy) row.appendChild(busyButton(t.waiting));
    else {
      row.appendChild(button(t.lock, "cl-primary", lock));
      row.appendChild(button(t.exportBlob, null, exportBlob));
      row.appendChild(button(t.transfer, null, transfer));
      row.appendChild(button(t.enrollShow, null, showEnroll));
      if (state.clearing) {
        row.appendChild(button(t.clearConfirm, null, clearDevice));
        row.appendChild(button(t.clearCancel, null, () => {
          state.clearing = false;
          render();
        }));
      } else {
        row.appendChild(button(t.clearDevice, null, () => {
          state.clearing = true;
          render();
        }));
      }
    }
    head.appendChild(row);
    if (state.clearing && !state.busy) head.appendChild(el("p", "cl-warn", t.clearHint));
    if (state.enroll.showing && !state.busy) head.appendChild(enrollShowPanel());
  }
  function render() {
    head.textContent = "";
    progressNode = null;
    filterCountNode = null;
    countdownNode = null;
    if (!state.support) head.appendChild(el("p", "cl-hint", t.checking));
    else if (state.unlocked) renderUnlocked();
    else renderLocked();
    list.hidden = !state.unlocked;
    if (state.unlocked && state.data) applyFilter();
    renderFoot();
  }

  const incoming = takeIncoming();
  render();
  refresh().then(() => {
    if (incoming && state.support && state.support.vault) {
      return guard("import", () => importBytes(incoming, t.importedFromQr, "badImport"));
    }
    render();
  }, render);
})();
