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
    #checklist-tool .cl-file { font-size: 0.72rem; }
    @media (pointer: coarse) { #checklist-tool .cl-item input { width: 1.5rem; height: 1.5rem; } }
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
  ];
  // 已經下架的項目 id。留著是為了讀舊資料時不把它們當成垃圾清掉。
  const RETIRED = [];

  const STRINGS = {
    "zh-TW": {
      checking: "正在確認這個瀏覽器能不能用。",
      noWebAuthn: "這個瀏覽器沒有 passkey 功能，清單存不起來。Tor Browser 整個關閉了 WebAuthn。",
      noVault: "存清單用的程式沒有載入。第一次使用需要連線，之後留在裝置上。",
      introLocked: "清單存在這台裝置上，用 passkey 鎖著。",
      introEmpty: "這台裝置上還沒有清單。已經在鑰匙頁建過 anoni.net 的 passkey 就用它開，密碼管理器裡只會有一筆。還沒有的話直接建一把新的。",
      keyPage: "passkey 鑰匙頁",
      unlock: "用 passkey 解開",
      openExisting: "用我已有的鑰匙開",
      createNew: "建一把新的鑰匙",
      waiting: "等你在瀏覽器的提示裡完成",
      progress: "已完成 {done} / {total}",
      hintLinks: "項目的連結都開新分頁，這一頁留著就不用重新解鎖。勾了會自動存。",
      saved: "已存。",
      lock: "鎖上",
      exportBlob: "匯出",
      importBlob: "匯入",
      exported: "匯出的是標準 age 檔，另一台裝置匯進去之後用同一把 passkey 解開。",
      imported: "匯進來了。用 passkey 解開。",
      readMore: "看文章",
      groups: { daily: "平常就做", travel: "出門前" },
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
      },
      errors: {
        cancelled: "你取消了，或瀏覽器沒有完成。再按一次。",
        unsupported: "這個環境不允許用 passkey。要在正式站、https 網址，瀏覽器也沒有把功能關掉。",
        failed: "沒有成功。換一個瀏覽器或密碼管理器試試。",
        badFile: "檔案格式不對，要的是從清單匯出的 age 檔。",
      },
    },
    zh: {
      checking: "正在确认这个浏览器能不能用。",
      noWebAuthn: "这个浏览器没有 passkey 功能，清单存不起来。Tor Browser 整个关闭了 WebAuthn。",
      noVault: "存清单用的程序没有加载。第一次使用需要联网，之后留在设备上。",
      introLocked: "清单存在这台设备上，用 passkey 锁着。",
      introEmpty: "这台设备上还没有清单。已经在钥匙页创建过 anoni.net 的 passkey 就用它开，密码管理器里只会有一笔。还没有的话直接创建一把新的。",
      keyPage: "passkey 钥匙页",
      unlock: "用 passkey 解开",
      openExisting: "用我已有的钥匙开",
      createNew: "创建一把新的钥匙",
      waiting: "等你在浏览器的提示里完成",
      progress: "已完成 {done} / {total}",
      hintLinks: "项目的链接都开新标签页，这一页留着就不用重新解锁。勾了会自动存。",
      saved: "已存。",
      lock: "锁上",
      exportBlob: "导出",
      importBlob: "导入",
      exported: "导出的是标准 age 文件，另一台设备导进去之后用同一把 passkey 解开。",
      imported: "导进来了。用 passkey 解开。",
      readMore: "看文章",
      groups: { daily: "平常就做", travel: "出门前" },
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
      },
      errors: {
        cancelled: "你取消了，或浏览器没有完成。再按一次。",
        unsupported: "这个环境不允许用 passkey。要在正式站、https 网址，浏览器也没有把功能关掉。",
        failed: "没有成功。换一个浏览器或密码管理器试试。",
        badFile: "文件格式不对，要的是从清单导出的 age 文件。",
      },
    },
    en: {
      checking: "Checking whether this browser can be used.",
      noWebAuthn: "This browser has no passkey support, so the list cannot be stored. Tor Browser turns WebAuthn off entirely.",
      noVault: "The code that stores the list has not loaded. The first use needs a connection; after that it stays on the device.",
      introLocked: "Your list is on this device, locked with your passkey.",
      introEmpty: "There is no list on this device yet. If you already created an anoni.net passkey on the key page, open with it and your password manager keeps a single entry. Otherwise create a new one here.",
      keyPage: "passkey key page",
      unlock: "Unlock with passkey",
      openExisting: "Open with my existing key",
      createNew: "Create a new key",
      waiting: "Finish the prompt in your browser",
      progress: "{done} / {total} done",
      hintLinks: "Every link opens in a new tab, so this page stays unlocked. Ticks are saved automatically.",
      saved: "Saved.",
      lock: "Lock",
      exportBlob: "Export",
      importBlob: "Import",
      exported: "The export is a standard age file. Import it on another device and unlock with the same passkey.",
      imported: "Imported. Unlock with your passkey.",
      readMore: "Read",
      groups: { daily: "Everyday", travel: "Before you travel" },
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
      },
      errors: {
        cancelled: "You cancelled, or the browser did not finish. Press again.",
        unsupported: "This environment does not allow passkeys. It needs the production site, an https address, and a browser that has not turned the feature off.",
        failed: "It did not work. Try another browser or password manager.",
        badFile: "That file is not an age file exported from here.",
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
    node.addEventListener("click", onClick);
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
    if (err && err.message === "badFile") return "badFile";
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
    busy: null, // "unlock" | "open" | "create" | "import" | "export"
    data: null, // 解開後整份資料，checks 只是其中一欄
    error: null,
    message: "",
  };
  const boxes = new Map(); // id → { input, date, item }

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

  const lock = () =>
    guard("lock", async () => {
      await saveNow();
      vault().lock();
      state.unlocked = false;
      state.data = null;
      boxes.clear();
      list.textContent = "";
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

  const importBlob = (file) =>
    guard("import", async () => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (bytes.length < 16 || new TextDecoder().decode(bytes.subarray(0, 11)) !== "age-encrypt") throw new Error("badFile");
      await vault().importBlob(bytes);
      state.unlocked = false;
      state.data = null;
      boxes.clear();
      list.textContent = "";
      await refresh();
      state.message = t.imported;
    });

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
    entry.item.classList.toggle("cl-item--done", !!when);
    entry.date.textContent = when || "";
  }
  function buildList() {
    list.textContent = "";
    boxes.clear();
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
        const link = el("a", null, t.readMore);
        link.href = text.href;
        link.target = "_blank";
        link.rel = "noopener";
        li.appendChild(input);
        li.appendChild(label);
        li.appendChild(link);
        ul.appendChild(li);
        boxes.set(id, { input: input, date: date, item: li });
        paint(id);
      }
      box.appendChild(ul);
      list.appendChild(box);
    }
  }
  function doneCount() {
    return ALL_IDS.filter((id) => !!state.data.checks[id]).length;
  }

  // --- 畫面 ---
  let progressNode = null;
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
    }
    head.appendChild(row);
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
    head.appendChild(el("p", "cl-hint", t.hintLinks));
    const row = el("div", "cl-row");
    if (state.busy) row.appendChild(busyButton(t.waiting));
    else {
      row.appendChild(button(t.lock, "cl-primary", lock));
      row.appendChild(button(t.exportBlob, null, exportBlob));
    }
    head.appendChild(row);
  }
  function render() {
    head.textContent = "";
    progressNode = null;
    if (!state.support) head.appendChild(el("p", "cl-hint", t.checking));
    else if (state.unlocked) renderUnlocked();
    else renderLocked();
    list.hidden = !state.unlocked;
    renderFoot();
  }

  render();
  refresh().then(render, render);
})();
