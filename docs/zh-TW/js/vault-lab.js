/*
 * 加密暫存區的介面。實驗階段，先驗整條路走不走得通。
 *
 * 邏輯全在 vault.js（window.anoniVault），這裡只有畫面與狀態。內容暫時是一個文字欄位
 * 當試驗品，之後要接的是 checklist 那類讀者主動打開才看的東西。
 *
 * 金鑰從頭到尾不出現在畫面上，也不進剪貼簿。備援私鑰只在剛產生時顯示一次，那是讀者
 * 唯一要自己收好的東西。
 */
(function () {
  const root = document.getElementById("vault-lab");
  if (!root) return;

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (label, cls, onClick) => {
    const node = el("button", "vl-btn" + (cls ? " " + cls : ""), label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  };

  const state = {
    exists: false,
    unlocked: false,
    readOnly: false,   // 用備援私鑰進來的，改不了也存不回去
    data: null,
    backupRecipient: "",
    shownSecret: null,
    message: "",
    busy: false,
  };

  const vault = () => window.anoniVault;

  function say(text) {
    state.message = text;
    render();
  }

  async function guard(run) {
    if (state.busy) return;
    state.busy = true;
    render();
    try {
      await run();
    } catch (err) {
      const name = err && err.name === "NotAllowedError" ? "你取消了，或者驗證沒有完成。" : null;
      say(name || "沒有成功：" + (err && err.message ? err.message : String(err)));
    }
    state.busy = false;
    render();
  }

  async function refresh() {
    state.exists = await vault().exists();
  }

  const create = () =>
    guard(async () => {
      await vault().create(state.backupRecipient || null);
      state.unlocked = true;
      state.readOnly = false;
      state.data = {};
      await refresh();
      say("建好了。這台裝置之後按一次指紋就能進來。");
    });

  const unlock = () =>
    guard(async () => {
      await vault().unlock();
      state.data = await vault().read();
      state.unlocked = true;
      state.readOnly = false;
      say("");
    });

  const unlockBackup = (secret) =>
    guard(async () => {
      state.data = await vault().unlockWithBackup(secret);
      state.unlocked = true;
      state.readOnly = true;
      say("用備援私鑰進來的，看得到也匯得出去，改不了。要改回到有 passkey 的裝置。");
    });

  const save = (text) =>
    guard(async () => {
      state.data = Object.assign({}, state.data, { note: text });
      await vault().save(state.data, state.backupRecipient || null);
      say("存好了。");
    });

  const makeBackup = () =>
    guard(async () => {
      const age = await import("age-encryption");
      const identity = await age.generateX25519Identity();
      state.backupRecipient = await age.identityToRecipient(identity);
      state.shownSecret = identity;
      say("備援私鑰只顯示這一次，存進密碼管理器。");
    });

  const exportBlob = () =>
    guard(async () => {
      const bytes = await vault().exportBlob();
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "anoni-vault.age";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      say("匯出的是標準 age 檔，另一台裝置可以匯進去。");
    });

  const importBlob = (file) =>
    guard(async () => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await vault().importBlob(bytes);
      state.unlocked = false;
      state.data = null;
      await refresh();
      say("匯進來了。用 passkey 或備援私鑰解開。");
    });

  const clear = () =>
    guard(async () => {
      await vault().clear();
      state.unlocked = false;
      state.data = null;
      state.shownSecret = null;
      await refresh();
      say("清掉了。密碼管理器裡那把 passkey 要自己刪。");
    });

  function renderLocked() {
    if (!state.exists) {
      root.appendChild(
        el("p", "vl-hint", "這台裝置上還沒有暫存區。建立時會產生一把 passkey，之後每次進來按一次指紋就好，不必記密語。")
      );
      const label = el("label", "vl-label", "備援金鑰（公鑰，age1 開頭，可留空）");
      const row = el("div", "vl-row");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "vl-backup";
      input.placeholder = "age1…";
      input.value = state.backupRecipient;
      input.addEventListener("input", () => {
        state.backupRecipient = input.value;
      });
      row.appendChild(input);
      row.appendChild(button("產生一把", null, makeBackup));
      label.appendChild(row);
      root.appendChild(label);
      root.appendChild(
        el("p", "vl-hint", "沒有 WebAuthn 的環境（例如 Tor Browser）只剩備援私鑰這條路，passkey 全丟了也一樣。留空就沒有那條退路。")
      );
      if (state.shownSecret) {
        root.appendChild(el("p", "vl-secret", state.shownSecret));
        root.appendChild(el("p", "vl-hint", "備援私鑰，只顯示這一次。存進密碼管理器，放在跟這台裝置不同的地方。"));
      }
      root.appendChild(button("建立暫存區", "vl-primary", create));
      return;
    }

    root.appendChild(el("p", "vl-hint", "這台裝置上有一份鎖著的暫存區。"));
    const actions = el("div", "vl-actions");
    actions.appendChild(button("用 passkey 解開", "vl-primary", unlock));
    root.appendChild(actions);

    const label = el("label", "vl-label", "或者貼備援私鑰（AGE-SECRET-KEY-1 開頭）");
    const input = document.createElement("input");
    input.type = "password";
    input.className = "vl-secret-in";
    input.placeholder = "AGE-SECRET-KEY-1…";
    label.appendChild(input);
    root.appendChild(label);
    root.appendChild(button("用備援私鑰解開", null, () => unlockBackup(input.value)));
  }

  function renderUnlocked() {
    root.appendChild(
      el("p", "vl-hint", state.readOnly ? "唯讀。" : "解開了。關掉這個分頁就會重新鎖上。")
    );

    const label = el("label", "vl-label", "隨手記（試驗用的內容）");
    const box = document.createElement("textarea");
    box.className = "vl-note";
    box.rows = 6;
    box.value = (state.data && state.data.note) || "";
    box.disabled = state.readOnly;
    label.appendChild(box);
    root.appendChild(label);

    const actions = el("div", "vl-actions");
    if (!state.readOnly) actions.appendChild(button("儲存", "vl-primary", () => save(box.value)));
    actions.appendChild(button("匯出", null, exportBlob));
    actions.appendChild(
      button("鎖上", null, () => {
        vault().lock();
        state.unlocked = false;
        state.data = null;
        say("鎖上了。");
      })
    );
    root.appendChild(actions);
  }

  function render() {
    root.textContent = "";

    if (!vault() || !vault().available()) {
      root.appendChild(el("p", "vl-hint", "這個瀏覽器用不了，它需要 WebAuthn 與 IndexedDB。"));
      return;
    }

    if (state.busy) {
      const busy = el("p", "vl-hint");
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      busy.appendChild(spin);
      busy.appendChild(document.createTextNode(" 等你在瀏覽器的提示裡完成"));
      busy.setAttribute("aria-busy", "true");
      root.appendChild(busy);
      return;
    }

    if (state.unlocked) renderUnlocked();
    else renderLocked();

    if (state.message) root.appendChild(el("p", "vl-msg", state.message));

    if (state.exists) {
      const danger = el("div", "vl-actions");
      danger.appendChild(button("清除這台裝置上的暫存區", null, clear));
      const file = document.createElement("input");
      file.type = "file";
      file.className = "vl-file";
      file.accept = ".age";
      file.addEventListener("change", () => {
        if (file.files && file.files[0]) importBlob(file.files[0]);
      });
      danger.appendChild(file);
      root.appendChild(danger);
    }
  }

  refresh().then(render, render);
})();
