/*
 * 離線內容管理頁（offline.md）的介面。
 *
 * 資料有兩個來源：offline-index.json 說這個語系有哪些頁面、多大，service worker 說
 * 哪些已經在裝置上。管理頁把兩邊疊起來，讀者勾選之後由 service worker 實際存取。
 *
 * 為什麼需要這一頁：sw.js 的預設下載清單刻意排除了指導單一受威脅身分的頁面，
 * 因為那些頁面躺在 Cache Storage 裡本身就是指向性證據。排除是對的，但排除之後
 * 想離線帶著走的人就沒有辦法了。這一頁讓那個選擇回到讀者手上，預設仍然不下載。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink，
 * 跟 overrides_en/base.html 同一個做法。介面文字依 document.documentElement.lang
 * 挑，zh-CN 版那個值是 "zh"（mkdocs_cn.yml 的 theme.language）。
 */
(function () {
  const root = document.getElementById("offline-library");
  if (!root) return;

  // 樣式跟著這支走。三個語系的 stylesheets/extra.css 是各自獨立的檔案，寫在那裡
  // 要維護三份，而這些規則只有這一頁用得到。
  //
  // 章節列表刻意不用 <details> 也不用 .md-button。mkdocs-material 把每個原生
  // <details> 當成 admonition 渲染：藍色外框、note 圖示、展開箭頭、font-size .64rem，
  // 而那個圖示是絕對定位在 left .6rem 的 ::before，蓋在標題文字上。十八個章節排下來
  // 就是十八個警告框。這裡改用 div 加 button 自己畫，跟 theme 的元件樣式脫鉤。
  const CSS = `
    #offline-library { margin: 1em 0; }
    #offline-library button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .3rem .7rem;
    }
    #offline-library button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #offline-library button:disabled { opacity: .5; cursor: default; }
    #offline-library .ol-status { line-height: 1.8; margin: .4rem 0; }
    #offline-library .ol-message {
      border-left: .15rem solid var(--md-accent-fg-color);
      margin: .8rem 0; padding: .1rem 0 .1rem .6rem;
    }
    #offline-library .ol-auto { display: block; cursor: pointer; margin: 1em 0 .2rem; }
    #offline-library .ol-hint {
      margin: 0 0 1em 1.4rem; opacity: .7; font-size: .7rem; line-height: 1.6;
    }
    #offline-library .ol-actions {
      display: flex; flex-wrap: wrap; gap: .4rem; margin: 0 0 1.2rem;
    }
    #offline-library .ol-section {
      border-bottom: .05rem solid var(--md-default-fg-color--lightest);
    }
    #offline-library .ol-toggle {
      display: flex; align-items: baseline; flex-wrap: nowrap; gap: .5rem;
      width: 100%; border: 0; border-radius: 0; padding: .45rem .2rem; text-align: left;
    }
    #offline-library .ol-toggle:hover:not(:disabled) {
      background: var(--md-default-fg-color--lightest); color: inherit;
    }
    #offline-library .ol-mark { flex: 0 0 .8rem; opacity: .55; }
    #offline-library .ol-name {
      flex: 1 1 auto; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #offline-library .ol-meta, #offline-library .ol-count,
    #offline-library .ol-size, #offline-library .ol-badge {
      flex: none; opacity: .6; font-size: .7rem;
    }
    #offline-library .ol-count { font-variant-numeric: tabular-nums; opacity: .85; }
    #offline-library .ol-body { padding: 0 0 .8rem 1.3rem; }
    #offline-library .ol-pages { list-style: none; margin: .5rem 0 0; padding: 0; }
    #offline-library .ol-pages li { margin: 0 0 .25rem; }
    #offline-library .ol-pages label {
      display: flex; align-items: baseline; gap: .4rem; cursor: pointer;
    }
    #offline-library .ol-pages input { flex: none; }
    #offline-library .ol-title {
      flex: 1 1 auto; min-width: 0;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #offline-library .ol-primary {
      border-color: var(--md-primary-fg-color);
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color);
    }
    @media screen and (max-width: 44.9375em) {
      #offline-library .ol-badge { display: none; }
      #offline-library .ol-body { padding-left: .6rem; }
    }
    #offline-library .ol-apply {
      position: sticky; bottom: 0; z-index: 1;
      display: flex; align-items: center; flex-wrap: wrap; gap: .6rem;
      background: var(--md-default-bg-color);
      border-top: .05rem solid var(--md-default-fg-color--lighter);
      margin: 0; padding: .7rem 0;
    }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      loading: "讀取中",
      noSupport:
        "這個瀏覽器沒有提供離線儲存，或者停用了 Service Worker（Tor Browser 屬於後者，onion 版本也不啟用）。這一頁其他段落的說明仍然適用。",
      noIndex: "讀不到頁面清單，可能是目前離線且這份清單還沒被存下來。恢復連線後重新整理即可。",
      savedCount: "你自己選存的 {n} 頁",
      autoCount: "站台自動存的 {n} 頁",
      usage: "本站在這台裝置上佔用 {used}",
      usageFree: "本站在這台裝置上佔用 {used}，可用空間還有 {free}",
      autoLabel: "自動存下目前語言的核心章節",
      autoHint: "關掉之後，站台不會再自動存任何東西，只保留你自己勾選的。",
      refresh: "更新已存的內容",
      refreshing: "更新中",
      clear: "清除所有離線內容",
      clearAgain: "再按一次就清除",
      clearing: "清除中",
      cleared: "已清除。瀏覽記錄、DNS 快取與你下載過的檔案不在清除範圍內，那些要在瀏覽器或系統裡處理。",
      apply: "套用變更",
      applying: "處理中",
      pending: "待新增 {add} 頁，待移除 {remove} 頁",
      done: "完成。存下 {ok} 頁。",
      doneFailed: "完成。存下 {ok} 頁，{failed} 頁失敗。",
      removed: "已移除 {n} 頁。",
      selectAll: "整章勾選",
      pages: "{n} 頁",
      badgeAuto: "站台已存",
      progress: "{done} / {total}",
    },
    zh: {
      loading: "读取中",
      noSupport:
        "这个浏览器没有提供离线存储，或者停用了 Service Worker（Tor Browser 属于后者，onion 版本也不启用）。这一页其他段落的说明仍然适用。",
      noIndex: "读不到页面清单，可能是当前离线且这份清单还没有被存下来。恢复连接后刷新即可。",
      savedCount: "你自己选存的 {n} 页",
      autoCount: "站台自动存的 {n} 页",
      usage: "本站在这台设备上占用 {used}",
      usageFree: "本站在这台设备上占用 {used}，可用空间还有 {free}",
      autoLabel: "自动存下当前语言的核心章节",
      autoHint: "关掉之后，站台不会再自动存任何东西，只保留你自己勾选的。",
      refresh: "更新已存的内容",
      refreshing: "更新中",
      clear: "清除所有离线内容",
      clearAgain: "再按一次就清除",
      clearing: "清除中",
      cleared: "已清除。浏览记录、DNS 缓存与你下载过的文件不在清除范围内，那些要在浏览器或系统里处理。",
      apply: "应用变更",
      applying: "处理中",
      pending: "待新增 {add} 页，待移除 {remove} 页",
      done: "完成。存下 {ok} 页。",
      doneFailed: "完成。存下 {ok} 页，{failed} 页失败。",
      removed: "已移除 {n} 页。",
      selectAll: "整章勾选",
      pages: "{n} 页",
      badgeAuto: "站台已存",
      progress: "{done} / {total}",
    },
    en: {
      loading: "Loading",
      noSupport:
        "This browser has no offline storage available, or Service Workers are disabled (Tor Browser is the latter case, and the onion version does not enable them either). The rest of this page still applies.",
      noIndex: "The page list could not be loaded. You may be offline and it has not been stored yet. Reload once you are back online.",
      savedCount: "{n} pages you chose to keep",
      autoCount: "{n} pages stored automatically",
      usage: "This site uses {used} on this device",
      usageFree: "This site uses {used} on this device, with {free} still available",
      autoLabel: "Automatically store the core chapters for the current language",
      autoHint: "Turn this off and the site stores nothing on its own. Only what you tick stays.",
      refresh: "Update what is stored",
      refreshing: "Updating",
      clear: "Clear all offline content",
      clearAgain: "Press again to clear",
      clearing: "Clearing",
      cleared: "Cleared. Browsing history, DNS cache and files you downloaded are not covered here. Handle those in your browser or system settings.",
      apply: "Apply changes",
      applying: "Working",
      pending: "{add} to add, {remove} to remove",
      done: "Done. {ok} pages stored.",
      doneFailed: "Done. {ok} pages stored, {failed} failed.",
      removed: "{n} pages removed.",
      selectAll: "Select whole section",
      pages: "{n} pages",
      badgeAuto: "stored by the site",
      progress: "{done} / {total}",
    },
  };

  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) =>
    Object.keys(vars || {}).reduce(
      (text, name) => text.split("{" + name + "}").join(vars[name]),
      t[key]
    );

  const size = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
    return Math.round(bytes / 1024) + " KB";
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function note(message) {
    root.textContent = "";
    root.appendChild(el("p", null, message));
  }

  if (!("serviceWorker" in navigator)) {
    note(t.noSupport);
    return;
  }

  // 一次請求一個 MessageChannel。下載類的指令會在同一個 port 上多次回報進度，
  // 最後一則不是 progress，那時才算結束。
  function ask(message, onProgress) {
    return navigator.serviceWorker.ready.then(
      (registration) =>
        new Promise((resolve, reject) => {
          const worker = registration.active;
          if (!worker) {
            reject(new Error("no-active-service-worker"));
            return;
          }
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => {
            const data = event.data || {};
            if (data.type === "progress") {
              if (onProgress) onProgress(data);
              return;
            }
            resolve(data);
          };
          worker.postMessage(message, [channel.port2]);
        })
    );
  }

  // 這一頁在 /docs/offline/、/docs/en/offline/ 或 /docs/zh-cn/offline/，
  // 索引檔在各自語系的根，所以往上一層就是。
  const indexUrl = new URL("../offline-index.json", location.href).href;

  const state = {
    index: null,
    saved: new Set(),
    precached: new Set(),
    autoPrecache: true,
    estimate: null,
    // 讀者這一輪勾選的變動，套用之前不動快取
    add: new Set(),
    remove: new Set(),
    // 展開中的章節。勾一個項目就整頁重畫，沒記著的話會全部收合回去
    open: new Set(),
  };

  function refreshStatus() {
    return ask({ type: "OFFLINE_STATUS", url: location.href }).then((data) => {
      if (data.type !== "status") throw new Error("bad-status");
      state.saved = new Set(data.saved || []);
      state.precached = new Set(data.precached || []);
      state.autoPrecache = data.autoPrecache !== false;
      state.estimate = data.estimate || null;
      state.add.clear();
      state.remove.clear();
    });
  }

  // 站台自動存的那批也算在裝置上，勾選框對它們沒有意義，顯示成已存並停用
  const isStored = (path) => state.saved.has(path) || state.precached.has(path);
  const willBeStored = (path) =>
    state.add.has(path) || (isStored(path) && !state.remove.has(path));

  function setWanted(path, wanted) {
    state.add.delete(path);
    state.remove.delete(path);
    if (wanted && !isStored(path)) state.add.add(path);
    if (!wanted && state.saved.has(path)) state.remove.add(path);
  }

  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function renderStatus() {
    const status = el("p", "ol-status");
    status.appendChild(
      document.createTextNode(fill("savedCount", { n: state.saved.size }))
    );
    status.appendChild(document.createTextNode("、"));
    status.appendChild(
      document.createTextNode(fill("autoCount", { n: state.precached.size }))
    );
    if (state.estimate && state.estimate.usage) {
      const quota = state.estimate.quota;
      const free = quota && quota > state.estimate.usage ? quota - state.estimate.usage : null;
      status.appendChild(document.createElement("br"));
      status.appendChild(
        document.createTextNode(
          free === null
            ? fill("usage", { used: size(state.estimate.usage) })
            : fill("usageFree", { used: size(state.estimate.usage), free: size(free) })
        )
      );
    }
    return status;
  }

  function renderSection(section) {
    const stored = section.pages.filter((page) => isStored(page.url)).length;
    const wrapper = el("div", "ol-section");
    const open = state.open.has(section.key);

    const toggle = button("", "ol-toggle", () => {
      if (open) state.open.delete(section.key);
      else state.open.add(section.key);
      render();
    });
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    // 展開指示自己畫。material 的箭頭是 summary::after，這裡沒有 summary 可用，
    // 而 ::before/::after 在 md-typeset 底下容易被 theme 的規則波及。
    toggle.appendChild(el("span", "ol-mark", open ? "▾" : "▸"));
    toggle.appendChild(el("span", "ol-name", section.title));
    toggle.appendChild(
      el("span", "ol-meta", fill("pages", { n: section.pages.length }) + "・" + size(section.bytes))
    );
    toggle.appendChild(el("span", "ol-count", stored + " / " + section.pages.length));
    wrapper.appendChild(toggle);

    if (!open) return wrapper;

    const body = el("div", "ol-body");
    body.appendChild(
      button(t.selectAll, null, () => {
        const wanted = section.pages.some((page) => !willBeStored(page.url));
        for (const page of section.pages) setWanted(page.url, wanted);
        render();
      })
    );

    const list = el("ul", "ol-pages");
    for (const page of section.pages) {
      const item = document.createElement("li");
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = willBeStored(page.url);
      // 站台自動存的那批由上面的開關統一管，個別勾選沒有意義
      box.disabled = state.precached.has(page.url);
      box.addEventListener("change", () => {
        setWanted(page.url, box.checked);
        render();
      });
      label.appendChild(box);
      label.appendChild(el("span", "ol-title", page.title));
      label.appendChild(el("span", "ol-size", size(page.bytes)));
      if (state.precached.has(page.url)) {
        label.appendChild(el("span", "ol-badge", t.badgeAuto));
      }
      item.appendChild(label);
      list.appendChild(item);
    }
    body.appendChild(list);
    wrapper.appendChild(body);
    return wrapper;
  }

  function renderApply() {
    const bar = el("p", "ol-apply");
    bar.appendChild(
      button(t.apply, "ol-primary", function () {
        const toAdd = Array.from(state.add);
        const toRemove = Array.from(state.remove);
        runTask(this, t.applying, (report) =>
          Promise.resolve()
            .then(() =>
              toRemove.length
                ? ask({ type: "OFFLINE_REMOVE", paths: toRemove })
                : { removed: 0 }
            )
            .then((removeResult) =>
              (toAdd.length
                ? ask({ type: "OFFLINE_ADD", paths: toAdd }, report)
                : Promise.resolve({ ok: 0, failed: 0 })
              ).then((addResult) => ({
                message:
                  (addResult.failed
                    ? fill("doneFailed", { ok: addResult.ok, failed: addResult.failed })
                    : fill("done", { ok: addResult.ok })) +
                  (removeResult.removed
                    ? " " + fill("removed", { n: removeResult.removed })
                    : ""),
              }))
            )
        );
      })
    );
    bar.appendChild(
      el("span", "ol-meta", fill("pending", { add: state.add.size, remove: state.remove.size }))
    );
    return bar;
  }

  function render(message) {
    root.textContent = "";
    root.appendChild(renderStatus());
    if (message) root.appendChild(el("p", "ol-message", message));

    const autoLabel = el("label", "ol-auto");
    const autoBox = document.createElement("input");
    autoBox.type = "checkbox";
    autoBox.checked = state.autoPrecache;
    autoBox.addEventListener("change", () => {
      ask({ type: "OFFLINE_AUTO", enabled: autoBox.checked })
        .then(refreshStatus)
        .then(() => render());
    });
    autoLabel.appendChild(autoBox);
    autoLabel.appendChild(document.createTextNode(" " + t.autoLabel));
    root.appendChild(autoLabel);
    root.appendChild(el("p", "ol-hint", t.autoHint));

    const actions = el("p", "ol-actions");
    actions.appendChild(
      button(t.refresh, null, function () {
        const paths = Array.from(state.saved);
        if (!paths.length) return;
        runTask(this, t.refreshing, (report) =>
          ask({ type: "OFFLINE_ADD", paths: paths, refresh: true }, report)
        );
      })
    );
    let armed = false;
    actions.appendChild(
      button(t.clear, null, function () {
        if (!armed) {
          armed = true;
          this.textContent = t.clearAgain;
          return;
        }
        runTask(this, t.clearing, () =>
          ask({ type: "OFFLINE_CLEAR" }).then(() => ({ message: t.cleared }))
        );
      })
    );
    root.appendChild(actions);

    if (!state.index) {
      root.appendChild(el("p", null, t.noIndex));
      return;
    }

    // 頁數多的排前面。讀者要找的多半是章節，零星的單頁擺後面不礙事。
    const sections = state.index.sections
      .slice()
      .sort((a, b) => b.pages.length - a.pages.length);
    for (const section of sections) root.appendChild(renderSection(section));

    if (state.add.size || state.remove.size) root.appendChild(renderApply());
  }

  // 動作跑起來之後停用按鈕、顯示進度，做完重讀狀態再整頁重畫
  function runTask(button, label, run) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = label;
    const report = (data) => {
      button.textContent =
        label + " " + fill("progress", { done: data.done, total: data.total });
    };
    return run(report)
      .then((result) => refreshStatus().then(() => render(result && result.message)))
      .catch(() => {
        button.disabled = false;
        button.textContent = original;
      });
  }

  note(t.loading);

  Promise.all([
    refreshStatus(),
    fetch(indexUrl, { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null),
  ])
    .then((results) => {
      state.index = results[1];
      render();
    })
    .catch(() => note(t.noSupport));
})();
