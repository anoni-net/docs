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
  const CSS = `
    #offline-library details { margin: .5rem 0; }
    #offline-library summary { cursor: pointer; padding: .2rem 0; }
    #offline-library .offline-library__pages {
      list-style: none; margin: .3rem 0 .6rem 1.2rem; padding: 0;
    }
    #offline-library .offline-library__pages li { margin: .15rem 0; }
    #offline-library .offline-library__size,
    #offline-library .offline-library__badge { opacity: .6; font-size: .78em; }
    #offline-library .offline-library__hint {
      opacity: .75; font-size: .85em; margin-top: -.5rem;
    }
    #offline-library .offline-library__auto { cursor: pointer; }
    #offline-library .offline-library__message {
      border-left: .2rem solid var(--md-accent-fg-color); padding-left: .6rem;
    }
    #offline-library .md-button { margin: .2rem .4rem .2rem 0; padding: .3rem .8rem; }
    #offline-library .offline-library__all {
      font-size: .75em; margin-left: 1.2rem; padding: .1rem .6rem;
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

  const mb = (bytes) => {
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

  function toggle(path, wanted) {
    state.add.delete(path);
    state.remove.delete(path);
    if (wanted && !isStored(path)) state.add.add(path);
    if (!wanted && state.saved.has(path)) state.remove.add(path);
  }

  function render(message) {
    root.textContent = "";

    // --- 狀態 ---
    const status = el("p");
    status.appendChild(
      document.createTextNode(fill("savedCount", { n: state.saved.size }))
    );
    status.appendChild(document.createTextNode("、"));
    status.appendChild(
      document.createTextNode(fill("autoCount", { n: state.precached.size }))
    );
    if (state.estimate && state.estimate.usage) {
      const free =
        state.estimate.quota && state.estimate.quota > state.estimate.usage
          ? state.estimate.quota - state.estimate.usage
          : null;
      status.appendChild(document.createElement("br"));
      status.appendChild(
        document.createTextNode(
          free === null
            ? fill("usage", { used: mb(state.estimate.usage) })
            : fill("usageFree", { used: mb(state.estimate.usage), free: mb(free) })
        )
      );
    }
    root.appendChild(status);

    if (message) {
      const line = el("p", "offline-library__message", message);
      root.appendChild(line);
    }

    // --- 自動下載開關 ---
    const autoLabel = el("label", "offline-library__auto");
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
    root.appendChild(el("p", "offline-library__hint", t.autoHint));

    // --- 整體動作 ---
    const actions = el("p", "offline-library__actions");
    const refreshButton = el("button", "md-button", t.refresh);
    refreshButton.type = "button";
    refreshButton.addEventListener("click", () => {
      const paths = Array.from(state.saved);
      if (!paths.length) return;
      runTask(refreshButton, t.refreshing, (report) =>
        ask({ type: "OFFLINE_ADD", paths: paths, refresh: true }, report)
      );
    });
    actions.appendChild(refreshButton);

    const clearButton = el("button", "md-button", t.clear);
    clearButton.type = "button";
    let armed = false;
    clearButton.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        clearButton.textContent = t.clearAgain;
        return;
      }
      runTask(clearButton, t.clearing, () =>
        ask({ type: "OFFLINE_CLEAR" }).then(() => ({ message: t.cleared }))
      );
    });
    actions.appendChild(clearButton);
    root.appendChild(actions);

    if (!state.index) {
      root.appendChild(el("p", null, t.noIndex));
      return;
    }

    // --- 章節 ---
    const sections = state.index.sections
      .slice()
      .sort((a, b) => b.pages.length - a.pages.length);

    for (const section of sections) {
      const stored = section.pages.filter((page) => isStored(page.url)).length;
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.appendChild(
        document.createTextNode(
          section.title +
            "　" +
            fill("pages", { n: section.pages.length }) +
            "・" +
            mb(section.bytes) +
            "　" +
            stored +
            " / " +
            section.pages.length
        )
      );
      details.appendChild(summary);

      const selectAll = el("button", "md-button offline-library__all", t.selectAll);
      selectAll.type = "button";
      selectAll.addEventListener("click", () => {
        const wanted = section.pages.some((page) => !willBeStored(page.url));
        for (const page of section.pages) toggle(page.url, wanted);
        render();
      });
      details.appendChild(selectAll);

      const list = el("ul", "offline-library__pages");
      for (const page of section.pages) {
        const item = document.createElement("li");
        const label = document.createElement("label");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = willBeStored(page.url);
        // 站台自動存的那批由上面的開關統一管，個別勾選沒有意義
        box.disabled = state.precached.has(page.url);
        box.addEventListener("change", () => {
          toggle(page.url, box.checked);
          render();
        });
        label.appendChild(box);
        label.appendChild(document.createTextNode(" " + page.title + " "));
        const size = el("span", "offline-library__size", mb(page.bytes));
        label.appendChild(size);
        if (state.precached.has(page.url)) {
          label.appendChild(
            el("span", "offline-library__badge", "（" + t.badgeAuto + "）")
          );
        }
        item.appendChild(label);
        list.appendChild(item);
      }
      details.appendChild(list);
      root.appendChild(details);
    }

    // --- 套用 ---
    if (state.add.size || state.remove.size) {
      const applyBar = el("p", "offline-library__apply");
      const applyButton = el("button", "md-button md-button--primary", t.apply);
      applyButton.type = "button";
      applyButton.addEventListener("click", () => {
        const toAdd = Array.from(state.add);
        const toRemove = Array.from(state.remove);
        runTask(applyButton, t.applying, (report) =>
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
      });
      applyBar.appendChild(applyButton);
      applyBar.appendChild(
        document.createTextNode(
          "　" + fill("pending", { add: state.add.size, remove: state.remove.size })
        )
      );
      root.appendChild(applyBar);
    }
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
