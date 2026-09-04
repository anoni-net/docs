/*
 * passkey userHandle 實驗頁
 *
 * 要驗的是一件很具體的事：建立 passkey 時放進 user.id 的那 32 個位元組，之後在別的
 * 裝置上驗證時拿不拿得回來，而且一個位元組都不差。
 *
 * 為什麼要驗：站上想做一個「只驗證、不必記密語」的加密儲存。WebAuthn 的 PRF 擴充是
 * 正規做法，可是 Apple 不把擴充的資料交給 iCloud 鑰匙圈以外的 provider，iPhone 配
 * Bitwarden 就拿不到。user.id 是核心欄位而不是擴充，規格上每次驗證都會原樣回傳，
 * 所以它可能是那條繞得過去的路。規格說可以跟實作真的給是兩回事，先在真機上量。
 *
 * 這一頁不寫入任何儲存空間。建立時產生的那串值只留在畫面上，重新整理就沒了，要跨
 * 裝置比對就自己複製過去。
 */
(function () {
  const root = document.getElementById("passkey-lab");
  if (!root) return;

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const hex = (bytes) =>
    [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const line = (label, value) => {
    const p = el("p", "pl-line");
    p.appendChild(el("strong", null, label + "："));
    p.appendChild(el("code", "pl-code", value));
    return p;
  };

  const state = { created: null, log: [] };

  function say(text, kind) {
    state.log.unshift({ text: text, kind: kind || "" });
    render();
  }

  async function create() {
    // 這 32 個位元組就是實驗的主角。真的要做的話，它會是一把資料金鑰。
    const raw = crypto.getRandomValues(new Uint8Array(32));
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          rp: { name: "anoni.net", id: location.hostname },
          user: {
            id: raw,
            // 這兩個字串會顯示在讀者的密碼管理器裡，寫清楚它可以刪
            name: "userhandle-lab（測試用，可刪）",
            displayName: "anoni.net userHandle 實驗",
          },
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          pubKeyCredParams: [
            { type: "public-key", alg: -8 },
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          // discoverable 才會在驗證時回傳 userHandle，這是整個實驗的前提
          authenticatorSelection: { residentKey: "required", userVerification: "required" },
          timeout: 120000,
        },
      });
      state.created = hex(raw);
      say("建立成功。credential ID " + hex(cred.rawId).slice(0, 16) + "…", "ok");
    } catch (err) {
      say("建立失敗：" + (err && err.name ? err.name + " " + err.message : String(err)), "bad");
    }
    render();
  }

  async function verify() {
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          // 空的 allowCredentials 讓讀者自己從清單裡挑，也才走得到 discoverable 那條路
          allowCredentials: [],
          userVerification: "required",
          timeout: 120000,
        },
      });
      const handle = assertion.response.userHandle;
      if (!handle) {
        say("驗證成功，可是沒有回傳 userHandle。這條路在這個環境走不通。", "bad");
        render();
        return;
      }
      const got = hex(handle);
      const expected = (root.querySelector(".pl-expect") || {}).value || state.created;
      let verdict = "拿回 " + got.length / 2 + " 個位元組";
      let kind = "ok";
      if (expected) {
        const same = expected.trim().toLowerCase() === got;
        verdict = same ? "跟原本那串完全一致" : "跟原本那串不一樣";
        kind = same ? "ok" : "bad";
      }
      say(verdict + "：" + got, kind);
    } catch (err) {
      say("驗證失敗：" + (err && err.name ? err.name + " " + err.message : String(err)), "bad");
    }
    render();
  }

  function render() {
    root.textContent = "";

    const env = el("div", "pl-env");
    env.appendChild(
      line("WebAuthn", window.PublicKeyCredential ? "可用" : "這個瀏覽器沒有，實驗做不了")
    );
    env.appendChild(line("網域（RP ID）", location.hostname));
    root.appendChild(env);

    if (!window.PublicKeyCredential) return;

    const actions = el("div", "pl-actions");
    const mk = el("button", "pl-btn", "建立測試 passkey");
    mk.type = "button";
    mk.addEventListener("click", create);
    actions.appendChild(mk);
    const go = el("button", "pl-btn", "驗證並取回 userHandle");
    go.type = "button";
    go.addEventListener("click", verify);
    actions.appendChild(go);
    root.appendChild(actions);

    if (state.created) {
      root.appendChild(line("剛才放進去的", state.created));
      root.appendChild(
        el("p", "pl-hint", "換一台裝置驗證的話，把上面那串複製過去貼進下面的欄位再按驗證。")
      );
    }

    const label = el("label", "pl-label", "原本那串（跨裝置比對時貼這裡）");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "pl-expect";
    input.placeholder = "64 個十六進位字元";
    input.value = state.created || "";
    label.appendChild(input);
    root.appendChild(label);

    for (const item of state.log) {
      root.appendChild(el("p", "pl-log pl-" + item.kind, item.text));
    }
  }

  render();
})();
