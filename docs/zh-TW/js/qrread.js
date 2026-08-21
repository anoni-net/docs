/*
 * QR code 讀取器（utils/qr-read.md）。
 *
 * 對方給你一張 QR code 的照片，你想知道裡面是什麼，但不想用一個會把圖片上傳的 App。
 * 這一頁在你的瀏覽器裡解，圖片不離開裝置。
 *
 * 解碼交給 utils/vendor/jsQR.js（Apache-2.0，原封不動）。那要處理定位、透視校正與
 * 糾錯，比編碼更大的工程，自己寫不切實際。
 *
 * 刻意不做的一件事：解出來是網址時不渲染成可點的連結，也不提供「開啟」按鈕。QR 是
 * 釣魚的常見載體，內容看起來像官網、主機卻是別的，一按就開等於幫忙完成攻擊。這一頁
 * 只顯示，並且把主機獨立標出來讓讀者自己看清楚。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 * 純邏輯由 tools/test_qrread.mjs 原地抽出來測，那支用 qrcode-generator 產生已知內容
 * 的碼再交給 jsQR 讀回來，兩個各自獨立的函式庫互相驗證。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_qrread.mjs 從這裡原地抽出來測）---

  // 畫進 canvas 時每個模組放多大、四周留幾格。太小的話 jsQR 對不到定位圖樣，
  // 留白不夠的話邊界找不到，兩者都會變成「讀不出來」而不是報錯。
  const SCALE = 6;
  const QUIET = 4;

  // 解出來的是什麼東西。分類決定要提醒什麼：網址要看主機、bridge 要提醒別貼到
  // 公開的地方、Wi-Fi 設定裡有密碼。
  function classify(text) {
    const trimmed = text.trim();

    if (/^WIFI:/i.test(trimmed)) return { kind: "wifi" };
    if (/^(obfs4|webtunnel|snowflake|meek_lite|obfs3|scramblesuit)\s/i.test(trimmed)) {
      return { kind: "bridge" };
    }

    let url = null;
    try {
      url = new URL(trimmed);
    } catch (err) {
      return { kind: "text" };
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return { kind: "text" };

    // hostname 已經是 punycode，同形字的主機會顯示成 xn-- 開頭，那正是要讓讀者看到的
    const host = url.hostname;
    if (/\.onion$/i.test(host)) return { kind: "onion", host: host };
    return { kind: "url", host: host };
  }

  // --- 介面 ---

  const root = document.getElementById("qrread-tool");
  if (!root) return;

  const CSS = `
    #qrread-tool { margin: 1em 0; }
    #qrread-tool .qd-drop {
      border: .1rem dashed var(--md-default-fg-color--lighter);
      border-radius: .2rem; padding: 1.6rem 1rem; text-align: center;
      font-size: .78rem; line-height: 1.8; cursor: pointer;
    }
    #qrread-tool .qd-drop--over {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #qrread-tool input[type="file"] { display: none; }
    #qrread-tool .qd-out {
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-left: .15rem solid #2e7d32;
      border-radius: .1rem; padding: .7rem; margin: .8rem 0 .4rem;
      font-family: var(--md-code-font-family, monospace);
      font-size: .74rem; line-height: 1.7; word-break: break-all; user-select: all;
    }
    #qrread-tool .qd-host {
      font-size: .78rem; margin: .6rem 0 .2rem; line-height: 1.7;
      border-left: .15rem solid #ef6c00; padding-left: .6rem;
    }
    #qrread-tool .qd-host code {
      font-family: var(--md-code-font-family, monospace);
      background: var(--md-default-fg-color--lightest); padding: 0 .2rem; border-radius: .1rem;
    }
    #qrread-tool .qd-kind { font-size: .72rem; opacity: .8; margin: .4rem 0 0; line-height: 1.7; }
    #qrread-tool .qd-error {
      border-left: .15rem solid var(--md-typeset-del-color, #f44336);
      padding: .1rem 0 .1rem .6rem; margin: .8rem 0;
    }
    #qrread-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem; margin: .4rem .4rem 0 0;
    }
    #qrread-tool button:hover:not(:disabled) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #qrread-tool button:disabled { opacity: .5; cursor: default; }
    #qrread-tool .qd-note { font-size: .7rem; opacity: .7; line-height: 1.6; margin: 1rem 0 0; }
    @media (pointer: coarse) { #qrread-tool button { min-height: 2.2rem; } }
  `;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const STRINGS = {
    "zh-TW": {
      drop: "把 QR code 的圖片拖進來，或點一下選檔案。也可以直接貼上（Ctrl+V）。",
      dropOver: "放開就開始解讀",
      reading: "解讀中",
      notFound: "這張圖裡找不到 QR code。試試裁掉周圍、或換一張更清楚的。",
      notImage: "那不是圖片檔。",
      copy: "複製內容",
      copied: "已複製",
      hostLabel: "這個網址會把你帶到",
      punycode: "主機名裡有非拉丁字母，顯示成 xn-- 開頭的形式。那多半是用長得像的字母冒充別的網域。",
      note: "圖片在你的瀏覽器裡解讀，沒有送到任何地方。斷網時照樣可以用。",
      kinds: {
        url: "解出來的是一個網址。QR code 是釣魚常用的載體，內容看起來像官網、主機卻是別的。上面那個主機名確認過再自己開，這一頁刻意不提供開啟按鈕。",
        onion: "解出來的是一個 onion 網址。要用 Tor Browser 才開得起來。",
        bridge: "解出來的是一行 Tor bridge。那是給你自己用的，貼到公開的地方等於讓它被封鎖。",
        wifi: "解出來的是一組 Wi-Fi 設定，裡面通常含密碼。",
        text: "解出來的是一段文字。",
      },
    },
    zh: {
      drop: "把 QR code 的图片拖进来，或点一下选文件。也可以直接粘贴（Ctrl+V）。",
      dropOver: "放开就开始解读",
      reading: "解读中",
      notFound: "这张图里找不到 QR code。试试裁掉周围、或换一张更清楚的。",
      notImage: "那不是图片文件。",
      copy: "复制内容",
      copied: "已复制",
      hostLabel: "这个网址会把你带到",
      punycode: "主机名里有非拉丁字母，显示成 xn-- 开头的形式。那多半是用长得像的字母冒充别的域名。",
      note: "图片在你的浏览器里解读，没有送到任何地方。断网时照样可以用。",
      kinds: {
        url: "解出来的是一个网址。QR code 是钓鱼常用的载体，内容看起来像官网、主机却是别的。上面那个主机名确认过再自己开，这一页刻意不提供打开按钮。",
        onion: "解出来的是一个 onion 网址。要用 Tor Browser 才打得开。",
        bridge: "解出来的是一行 Tor bridge。那是给你自己用的，贴到公开的地方等于让它被封锁。",
        wifi: "解出来的是一组 Wi-Fi 设置，里面通常含密码。",
        text: "解出来的是一段文字。",
      },
    },
    en: {
      drop: "Drop a QR code image here, or click to choose a file. Pasting works too (Ctrl+V).",
      dropOver: "Release to read it",
      reading: "Reading",
      notFound: "No QR code found in that image. Try cropping the surroundings, or use a sharper photo.",
      notImage: "That is not an image file.",
      copy: "Copy contents",
      copied: "Copied",
      hostLabel: "This URL would take you to",
      punycode: "The hostname contains non-Latin letters and is shown in its xn-- form. That usually means letters shaped like others are impersonating a different domain.",
      note: "The image is read inside your browser and is not sent anywhere. It works with the network off.",
      kinds: {
        url: "This is a URL. QR codes are a common phishing vector: the text looks like an official site while the host is something else. Check the hostname above and open it yourself. This page deliberately offers no open button.",
        onion: "This is an onion address. It needs Tor Browser to open.",
        bridge: "This is a Tor bridge line. It is for your own use; posting it publicly is how it gets blocked.",
        wifi: "This is a Wi-Fi configuration, which usually includes the password.",
        text: "This is plain text.",
      },
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const state = { status: "idle", text: "", info: null, copied: false };

  // 圖片畫進 canvas 取像素。大圖先縮到合理尺寸，不然手機拍的照片動輒四千萬像素，
  // 解起來會卡住整個分頁。
  function decode(source) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const max = 1600;
        const ratio = Math.min(1, max / Math.max(image.width, image.height));
        const w = Math.max(1, Math.round(image.width * ratio));
        const h = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, w, h);
        const pixels = ctx.getImageData(0, 0, w, h);
        URL.revokeObjectURL(image.src);
        resolve(window.jsQR ? window.jsQR(pixels.data, w, h) : null);
      };
      image.onerror = () => resolve(null);
      image.src = URL.createObjectURL(source);
    });
  }

  function handle(file) {
    if (!file || !/^image\//.test(file.type)) {
      state.status = "notImage";
      render();
      return;
    }
    state.status = "reading";
    render();
    decode(file).then((result) => {
      if (!result || !result.data) {
        state.status = "notFound";
        render();
        return;
      }
      state.status = "done";
      state.text = result.data;
      state.info = classify(result.data);
      state.copied = false;
      render();
    });
  }

  function render() {
    root.textContent = "";

    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.addEventListener("change", () => handle(picker.files && picker.files[0]));

    const drop = el("div", "qd-drop", state.status === "reading" ? t.reading : t.drop);
    drop.addEventListener("click", () => picker.click());
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("qd-drop--over");
      drop.textContent = t.dropOver;
    });
    drop.addEventListener("dragleave", () => {
      drop.classList.remove("qd-drop--over");
      drop.textContent = t.drop;
    });
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("qd-drop--over");
      const file = event.dataTransfer && event.dataTransfer.files[0];
      handle(file);
    });
    root.appendChild(picker);
    root.appendChild(drop);

    if (state.status === "notFound" || state.status === "notImage") {
      root.appendChild(el("p", "qd-error", t[state.status]));
    }

    if (state.status === "done") {
      // 只放文字節點。解出來的可能是釣魚網址，渲染成可點的連結等於幫忙完成攻擊。
      root.appendChild(el("div", "qd-out", state.text));

      const copy = el("button", null, state.copied ? t.copied : t.copy);
      copy.type = "button";
      copy.addEventListener("click", () => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(state.text).then(() => {
          state.copied = true;
          render();
        });
      });
      copy.disabled = !navigator.clipboard;
      root.appendChild(copy);

      if (state.info.host) {
        const line = el("p", "qd-host");
        line.appendChild(document.createTextNode(t.hostLabel + "　"));
        line.appendChild(el("code", null, state.info.host));
        root.appendChild(line);
        if (state.info.host.indexOf("xn--") === 0 || state.info.host.indexOf(".xn--") > 0) {
          root.appendChild(el("p", "qd-kind", t.punycode));
        }
      }
      root.appendChild(el("p", "qd-kind", t.kinds[state.info.kind]));
    }

    root.appendChild(el("p", "qd-note", t.note));
  }

  // 直接貼上圖片。手機截圖之後最快的路徑。
  document.addEventListener("paste", (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.indexOf("image/") === 0) {
        handle(item.getAsFile());
        event.preventDefault();
        return;
      }
    }
  });

  render();
})();
