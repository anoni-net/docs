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
    blobSize: 0,
    unlocked: false,
    readOnly: false,   // 用備援私鑰進來的，改不了也存不回去
    data: null,
    backupRecipient: "",
    shownSecret: null,
    message: "",
    busy: false,
  };

  const vault = () => window.anoniVault;

  // 畫面分成兩塊，文字框那一塊 render 永遠不碰。
  //
  // 前三次修這個問題都失敗，共同的原因是文字框會被重建或搬動。重建會中斷中文輸入法的
  // 組字，搬動會讓它短暫離開文件，兩者都可能讓讀者剛打的字消失，而畫面照樣說存好了。
  // 每修一次就多一層同步（先是讀 DOM，後來加 state.draft，再來重用節點），複雜度上去了
  // 問題還在。
  //
  // 這一次改成讓文字框從建立到清除都待在同一個位置，不移動、不重建、不同步。render 只
  // 重畫上面那一塊，文字框這一塊只切換顯示與 disabled。沒有搬動就沒有那一整類問題。
  // 三塊，順序就是讀者的閱讀順序：現在什麼狀態、內容、可以做什麼。
  // 文字框那一塊 render 永遠不碰，前後兩塊照舊清空重畫。
  const head = el("div", "vl-head");
  const noteArea = el("div", "vl-note-area");
  const foot = el("div", "vl-foot");
  root.appendChild(head);
  root.appendChild(noteArea);
  root.appendChild(foot);

  const noteLabel = el("label", "vl-label", "隨手記（試驗用的內容）");
  const noteBox = document.createElement("textarea");
  noteBox.className = "vl-note";
  noteBox.rows = 6;
  noteLabel.appendChild(noteBox);
  noteArea.appendChild(noteLabel);
  noteArea.hidden = true;

  // 打完字停一下就自動存。
  //
  // 「要記得按儲存」這件事本身就是一個會出錯的環節，而它出錯的樣子跟程式有 bug 一模
  // 一樣：讀者解開之後看到空的，分不出是自己忘了按還是東西掉了。拿掉那個環節，順便
  // 也拿掉按鈕與輸入框之間所有的時序問題。
  //
  // 手動那顆留著，想立刻確認存進去了的人有地方按。
  let saveTimer = null;
  noteBox.addEventListener("input", () => {
    if (!state.unlocked || state.readOnly) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autoSave, 800);
  });

  async function autoSave() {
    if (!state.unlocked || state.readOnly || state.busy) return;
    const note = noteBox.value;
    try {
      state.data = Object.assign({}, state.data, { note: note });
      await vault().save(state.data, state.backupRecipient || null);
      await refresh();
      say("已自動存下，內容 " + note.length + " 個字，密文 " + state.blobSize + " 個位元組。");
    } catch (err) {
      say("自動儲存沒成功：" + (err && err.message ? err.message : String(err)));
    }
  }

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
    state.blobSize = await vault().size();
    state.exists = state.blobSize > 0;
  }

  const create = () =>
    guard(async () => {
      const made = await vault().create(state.backupRecipient || null);
      state.unlocked = true;
      state.readOnly = false;
      state.data = {};
      noteBox.value = "";
      await refresh();
      // 這一把拿到了哪些能力要當場講。PRF 的秘密是建立當下產生的，換到別的裝置補不回來，
      // 讀者知道了才決定要不要換個地方重建一把。
      say(
        made && made.hasPrf
          ? "建好了，裡面還是空的。這一把同時能給本機檔案加密用，那邊選 passkey 模式時挑同一把就好。打字就會自動存下來。"
          : "建好了，裡面還是空的。這個環境算不出檔案加密要用的金鑰，所以這一把只給暫存區用，兩種都想要的話換到電腦上再建一把。打字就會自動存下來。"
      );
    });

  const unlock = () =>
    guard(async () => {
      await vault().unlock();
      state.data = await vault().read();
      noteBox.value = (state.data && state.data.note) || "";
      state.unlocked = true;
      state.readOnly = false;
      await refresh();
      const note = (state.data && state.data.note) || "";
      say(
        note.length
          ? "解開了，裡面有 " + note.length + " 個字。"
          : "解開了，裡面還沒有東西。打字就會自動存下來。"
      );
    });

  const unlockBackup = (secret) =>
    guard(async () => {
      state.data = await vault().unlockWithBackup(secret);
      noteBox.value = (state.data && state.data.note) || "";
      state.unlocked = true;
      state.readOnly = true;
      say("用備援私鑰進來的，看得到也匯得出去，改不了。要改回到有 passkey 的裝置。");
    });

  const save = () =>
    guard(async () => {
      // 文字框從頭到尾是同一個節點，直接讀它就是讀者看到的內容，沒有第二個真相來源。
      const note = noteBox.value;
      state.data = Object.assign({}, state.data, { note: note });
      await vault().save(state.data, state.backupRecipient || null);
      await refresh();
      // 字數寫出來，存進去的是不是空的一眼就看得到
      say(
        "存好了，內容 " + note.length + " 個字，密文 " + state.blobSize + " 個位元組。鎖上再解開就會看到同樣的內容。"
      );
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
      noteBox.value = "";
      await refresh();
      say("匯進來了。用 passkey 或備援私鑰解開。");
    });

  const clear = () =>
    guard(async () => {
      await vault().clear();
      state.unlocked = false;
      state.data = null;
      noteBox.value = "";
      state.shownSecret = null;
      await refresh();
      say("清掉了。密碼管理器裡那把 passkey 要自己刪。");
    });

  function renderLocked() {
    if (!state.exists) {
      head.appendChild(
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
      head.appendChild(label);
      head.appendChild(
        el("p", "vl-hint", "沒有 WebAuthn 的環境（例如 Tor Browser）只剩備援私鑰這條路，passkey 全丟了也一樣。留空就沒有那條退路。")
      );
      if (state.shownSecret) {
        head.appendChild(el("p", "vl-secret", state.shownSecret));
        head.appendChild(el("p", "vl-hint", "備援私鑰，只顯示這一次。存進密碼管理器，放在跟這台裝置不同的地方。"));
      }
      head.appendChild(button("建立暫存區", "vl-primary", create));
      return;
    }

    head.appendChild(
      el("p", "vl-hint", "這台裝置上有一份鎖著的暫存區，密文 " + state.blobSize + " 個位元組。")
    );
    const actions = el("div", "vl-actions");
    actions.appendChild(button("用 passkey 解開", "vl-primary", unlock));
    head.appendChild(actions);

    const label = el("label", "vl-label", "或者貼備援私鑰（AGE-SECRET-KEY-1 開頭）");
    const input = document.createElement("input");
    input.type = "password";
    input.className = "vl-secret-in";
    input.placeholder = "AGE-SECRET-KEY-1…";
    label.appendChild(input);
    head.appendChild(label);
    head.appendChild(button("用備援私鑰解開", null, () => unlockBackup(input.value)));
  }

  function renderUnlocked() {
    const note = (state.data && state.data.note) || "";
    head.appendChild(
      el(
        "p",
        "vl-hint",
        (state.readOnly
          ? "唯讀，看得到也匯得出去，改不了。"
          : "解開了，打字會自動存下來，關掉這個分頁就重新鎖上。") +
          (note.length ? "目前有 " + note.length + " 個字。" : "目前還是空的。")
      )
    );

    const actions = el("div", "vl-actions");
    if (!state.readOnly) actions.appendChild(button("儲存", "vl-primary", save));
    actions.appendChild(button("匯出", null, exportBlob));
    actions.appendChild(
      button("鎖上", null, () => {
        vault().lock();
        state.unlocked = false;
        state.data = null;
        noteBox.value = "";
        say("鎖上了。");
      })
    );
    foot.appendChild(actions);
  }

  function render() {
    // 只重畫上面那一塊。文字框在 noteArea 裡，從頭到尾不動它，正在打的字與輸入法的
    // 組字都不會被打斷。
    head.textContent = "";
    foot.textContent = "";
    noteArea.hidden = !(state.unlocked && vault() && vault().available() && !state.busy);
    noteBox.disabled = state.readOnly;

    if (!vault() || !vault().available()) {
      head.appendChild(el("p", "vl-hint", "這個瀏覽器用不了，它需要 WebAuthn 與 IndexedDB。"));
      return;
    }

    if (state.busy) {
      const busy = el("p", "vl-hint");
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      busy.appendChild(spin);
      busy.appendChild(document.createTextNode(" 等你在瀏覽器的提示裡完成"));
      busy.setAttribute("aria-busy", "true");
      foot.appendChild(busy);
      return;
    }

    if (state.unlocked) renderUnlocked();
    else renderLocked();

    if (state.message) foot.appendChild(el("p", "vl-msg", state.message));

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
      foot.appendChild(danger);
    }

  }

  refresh().then(render, render);
})();
