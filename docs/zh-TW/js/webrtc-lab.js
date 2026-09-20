/**
 * 實驗區：裝置之間直接傳檔（WebRTC DataChannel）。
 *
 * 對應 issue #553。要回答的是「兩台裝置在沒有網際網路的現場，能不能把幾 MB 的離線包
 * 傳過去，而且交換連線描述那一步不靠任何伺服器」。
 *
 * === 這一頁不送任何資料 ===
 *
 * 沒有 fetch、XMLHttpRequest、sendBeacon 與 WebSocket，也不載入外部資源。
 * RTCPeerConnection 的 iceServers 是空的，沒有 STUN 也沒有 TURN，連得上就是靠同一個
 * 區網裡的 host candidate，連不上就代表那個網路擋掉裝置之間的連線，而那正是要量的。
 *
 * 檔案內容只在兩台裝置之間流動，文件站這一側拿不到任何一個位元組。相機畫面在這一頁的
 * canvas 裡解碼，同樣不離開裝置。
 *
 * === 幾個設計決定 ===
 *
 * 只開 DataChannel 不要媒體軌，SDP 才會小。實機量到 587 B，gzip 後不到 400 B，一張靜態
 * QR code 就裝得下，所以交換描述不需要影格串流，兩邊各顯示一張、對方掃一次就過去。
 * 封包開頭有四個位元組的標記，掃到網址之類的其他 QR code 時認得出來。複製貼上保留當退路。
 * ICE 蒐集完成才把描述交出去，不做 trickle，因為 trickle 需要一條雙向且持續的通道，
 * 而手動貼上與 QR 都只能一次過一份。
 * 分塊 64 KB 並靠 bufferedAmount 做背壓，收的一端算 SHA-256 跟來源比對。
 *
 * 對應的回送檢查：tools/webrtc-lab/run-loopback.mjs
 */
(function () {
  "use strict";

  const root = document.getElementById("webrtc-lab");
  if (!root) return;

  // QR 影格串流「中」檔位一張裝得下的位元組。qrstream.js 的 DENSITY 是 version 15
  // 配容錯度 M，扣掉標頭與 CRC 之後大約這個數字。中速是每秒 5 張。
  const QR_PAYLOAD_MEDIUM = 402;
  const QR_FRAMES_PER_SECOND = 5;

  // 一張 QR code 最高用到幾版。版本越高方格越小，手機螢幕對手機鏡頭超過這個版本就開始
  // 難讀。實機量到的描述 gzip 後不到 400 B，落在十版上下，離這個上限很遠。超過的時候
  // 退回複製貼上並記一筆，那本身也是量測：有多少裝置的描述大到一張放不下。
  const MAX_QR_VERSION = 25;
  // 掃描一輪的目標間隔與畫面縮到多寬再解碼。手機上 jsQR 解一張 1920 寬的畫面要上百毫秒，
  // 縮到 960 寬對一張佔半個畫面的碼綽綽有餘。
  const SCAN_INTERVAL_MS = 150;
  const SCAN_WIDTH = 960;
  // 描述封包的開頭。掃到別的 QR code（網址、Wi-Fi 設定）時靠這四個位元組認出來，
  // 而不是把一段網址當成描述去套用。第三個是格式版本，第四個標示有沒有 gzip。
  const PACK_MAGIC = [0x57, 0x4c];
  const PACK_VERSION = 1;

  // DataChannel 一次送多大。SCTP 的訊息上限各家實作不同，64 KB 是普遍安全的值。
  const CHUNK = 64 * 1024;
  // bufferedAmount 超過上界就先停手，等它降到下界再送，否則記憶體會被塞爆。
  const BUFFER_HIGH = 4 * 1024 * 1024;
  const BUFFER_LOW = 1 * 1024 * 1024;

  const STRINGS = {
    "zh-TW": {
      roleTitle: "一、決定誰先開始",
      offer: "我先開始，產生描述",
      answer: "對方先開始，我來回應",
      roleIdle: "還沒選。兩台裝置各挑一邊，誰先開始都可以。",
      roleOfferer: "你是發起方。讓對方掃第二區的 QR code，再到第三區掃對方回給你的那一張。",
      roleAnswerer: "你是回應方。到第三區掃對方的 QR code，掃完之後讓對方掃第二區出現的那一張。",
      roleAnswered: "回應描述好了，讓對方掃第二區的 QR code。",
      localTitle: "二、你的描述",
      localHint: "等連線候選蒐集完才會出現。讓對方的相機對準這張 QR code，掃不了的話整段複製交給對方。",
      qrHint: "螢幕亮度調高，QR code 佔對方畫面一半以上最好讀。",
      qrTooLarge: "這一次的描述太大，一張 QR code 裝不下，請改用複製貼上。",
      qrMissing: "QR code 元件沒有載入，請改用複製貼上。",
      copy: "複製",
      copied: "已複製。",
      copyManual: "瀏覽器不給用剪貼簿，已經選起來，自己按複製。",
      remoteTitle: "三、對方的描述",
      remoteHint: "用相機掃對方螢幕上的 QR code，或者把對方交給你的整段貼進來。",
      scan: "用相機掃對方的 QR code",
      scanStop: "停止掃描",
      scanning: "掃描中，對準對方螢幕上的 QR code。",
      scanForeign: "掃到的 QR code 不是這一頁產生的，繼續對準對方的那一張。",
      scanUnsupported: "這個瀏覽器拿不到相機，請改用複製貼上。",
      scanDenied: "相機權限被拒絕了。到瀏覽器設定允許這個網站使用相機，或改用複製貼上。",
      scanNoCamera: "找不到可用的相機，請改用複製貼上。",
      scanFailed: "相機開不起來，請改用複製貼上。",
      scanBadPayload: "QR code 讀到了但內容解不開，請改用複製貼上。",
      scanned: "掃到了，正在套用。",
      apply: "套用",
      badJson: "貼上的內容解不開，要整段貼，不要只貼中間幾行。",
      pickRoleFirst: "先選上面的角色。",
      connTitle: "四、連線狀態",
      transferTitle: "五、傳一份東西過去",
      transferHint: "選一個檔案，或用產生的測試資料。收到的一端會算 SHA-256 跟來源比對。",
      sendGenerated: "送出測試資料",
      sendFile: "送出這個檔案",
      notConnected: "還沒連上，先完成前面三步。",
      noFile: "還沒選檔案。",
      logTitle: "六、紀錄",
      logHint: "匯出前會把 IP 與 mDNS 名稱遮掉。結果貼回 issue #553。",
      export: "匯出紀錄",
      reset: "重來",
      sdpRaw: "原始大小",
      sdpTrimmed: "精簡後",
      sdpGzip: "gzip",
      sdpBase64: "gzip 加 base64",
      sdpFrames: "換算 QR 張數（中檔）",
      sdpSeconds: "播完一輪",
      sdpCandidates: "連線候選行數",
      noCompression: "這個瀏覽器沒有 CompressionStream",
      role: "角色",
      roleValueOfferer: "發起方",
      roleValueAnswerer: "回應方",
      roleValueNone: "未選",
      connection: "連線",
      iceConnection: "ICE 連線",
      iceGathering: "候選蒐集",
      channel: "資料通道",
      channelIdle: "尚未建立",
      handshake: "握手耗時（含人工）",
      negotiate: "協定耗時",
      handover: "描述交換（人工）",
      handshakeIdle: "未完成",
      envLabel: "這次的環境",
      envPlaceholder: "例：自架熱點，Mac Chrome 對 iPhone Safari",
      flushing: "等送出真的完成",
      pair: "選中的候選",
      pairIdle: "尚未選定",
      direction: "方向",
      sending: "送出",
      receiving: "接收中",
      received: "接收",
      size: "大小",
      elapsed: "耗時",
      throughput: "吞吐",
      hashMatch: "SHA-256 比對",
      hashOk: "一致",
      hashBad: "不一致，這一次不算數",
      seconds: "秒",
      frames: "張",
    },
    "zh-CN": {
      roleTitle: "一、决定谁先开始",
      offer: "我先开始，产生描述",
      answer: "对方先开始，我来回应",
      roleIdle: "还没选。两台设备各挑一边，谁先开始都可以。",
      roleOfferer: "你是发起方。让对方扫第二区的 QR code，再到第三区扫对方回给你的那一张。",
      roleAnswerer: "你是回应方。到第三区扫对方的 QR code，扫完之后让对方扫第二区出现的那一张。",
      roleAnswered: "回应描述好了，让对方扫第二区的 QR code。",
      localTitle: "二、你的描述",
      localHint: "等连线候选搜集完才会出现。让对方的相机对准这张 QR code，扫不了的话整段复制交给对方。",
      qrHint: "屏幕亮度调高，QR code 占对方画面一半以上最好读。",
      qrTooLarge: "这一次的描述太大，一张 QR code 装不下，请改用复制粘贴。",
      qrMissing: "QR code 组件没有加载，请改用复制粘贴。",
      copy: "复制",
      copied: "已复制。",
      copyManual: "浏览器不给用剪贴板，已经选起来，自己按复制。",
      remoteTitle: "三、对方的描述",
      remoteHint: "用相机扫对方屏幕上的 QR code，或者把对方交给你的整段贴进来。",
      scan: "用相机扫对方的 QR code",
      scanStop: "停止扫描",
      scanning: "扫描中，对准对方屏幕上的 QR code。",
      scanForeign: "扫到的 QR code 不是这一页产生的，继续对准对方的那一张。",
      scanUnsupported: "这个浏览器拿不到相机，请改用复制粘贴。",
      scanDenied: "相机权限被拒绝了。到浏览器设置允许这个网站使用相机，或改用复制粘贴。",
      scanNoCamera: "找不到可用的相机，请改用复制粘贴。",
      scanFailed: "相机开不起来，请改用复制粘贴。",
      scanBadPayload: "QR code 读到了但内容解不开，请改用复制粘贴。",
      scanned: "扫到了，正在套用。",
      apply: "套用",
      badJson: "贴上的内容解不开，要整段贴，不要只贴中间几行。",
      pickRoleFirst: "先选上面的角色。",
      connTitle: "四、连线状态",
      transferTitle: "五、传一份东西过去",
      transferHint: "选一个文件，或用产生的测试数据。收到的一端会算 SHA-256 跟来源比对。",
      sendGenerated: "送出测试数据",
      sendFile: "送出这个文件",
      notConnected: "还没连上，先完成前面三步。",
      noFile: "还没选文件。",
      logTitle: "六、记录",
      logHint: "导出前会把 IP 与 mDNS 名称遮掉。结果贴回 issue #553。",
      export: "导出记录",
      reset: "重来",
      sdpRaw: "原始大小",
      sdpTrimmed: "精简后",
      sdpGzip: "gzip",
      sdpBase64: "gzip 加 base64",
      sdpFrames: "换算 QR 张数（中档）",
      sdpSeconds: "播完一轮",
      sdpCandidates: "连线候选行数",
      noCompression: "这个浏览器没有 CompressionStream",
      role: "角色",
      roleValueOfferer: "发起方",
      roleValueAnswerer: "回应方",
      roleValueNone: "未选",
      connection: "连线",
      iceConnection: "ICE 连线",
      iceGathering: "候选搜集",
      channel: "数据通道",
      channelIdle: "尚未建立",
      handshake: "握手耗时（含人工）",
      negotiate: "协议耗时",
      handover: "描述交换（人工）",
      handshakeIdle: "未完成",
      envLabel: "这次的环境",
      envPlaceholder: "例：自架热点，Mac Chrome 对 iPhone Safari",
      flushing: "等送出真的完成",
      pair: "选中的候选",
      pairIdle: "尚未选定",
      direction: "方向",
      sending: "送出",
      receiving: "接收中",
      received: "接收",
      size: "大小",
      elapsed: "耗时",
      throughput: "吞吐",
      hashMatch: "SHA-256 比对",
      hashOk: "一致",
      hashBad: "不一致，这一次不算数",
      seconds: "秒",
      frames: "张",
    },
    en: {
      roleTitle: "1. Decide who starts",
      offer: "I start, create my description",
      answer: "The other side starts, I reply",
      roleIdle: "Nothing picked yet. Each device takes one side, either order works.",
      roleOfferer: "You start. Let the other device scan the QR code in step 2, then scan their reply in step 3.",
      roleAnswerer: "You reply. Scan their QR code in step 3, then let them scan the one that appears in step 2.",
      roleAnswered: "Your reply is ready. Let the other device scan the QR code in step 2.",
      localTitle: "2. Your description",
      localHint: "It appears once candidate gathering finishes. Point the other camera at this QR code, or copy the whole block across if scanning fails.",
      qrHint: "Turn the screen brightness up. The code reads best when it fills half of the other camera view.",
      qrTooLarge: "This description is too large for a single QR code. Use copy and paste this time.",
      qrMissing: "The QR code library did not load. Use copy and paste.",
      copy: "Copy",
      copied: "Copied.",
      copyManual: "The browser blocks clipboard access. The text is selected, copy it yourself.",
      remoteTitle: "3. Their description",
      remoteHint: "Scan the QR code on their screen, or paste the whole block they handed you.",
      scan: "Scan their QR code",
      scanStop: "Stop scanning",
      scanning: "Scanning. Point the camera at the QR code on their screen.",
      scanForeign: "That QR code did not come from this page. Keep pointing at theirs.",
      scanUnsupported: "This browser cannot reach a camera. Use copy and paste.",
      scanDenied: "Camera permission was denied. Allow it for this site in the browser settings, or use copy and paste.",
      scanNoCamera: "No usable camera was found. Use copy and paste.",
      scanFailed: "The camera would not start. Use copy and paste.",
      scanBadPayload: "The QR code was read but its content would not decode. Use copy and paste.",
      scanned: "Got it, applying.",
      apply: "Apply",
      badJson: "That text does not parse. Paste the whole block, not a few lines of it.",
      pickRoleFirst: "Pick a side above first.",
      connTitle: "4. Connection",
      transferTitle: "5. Send something across",
      transferHint: "Pick a file, or use generated test data. The receiving side checks SHA-256 against the source.",
      sendGenerated: "Send test data",
      sendFile: "Send this file",
      notConnected: "Not connected yet, finish the first three steps.",
      noFile: "No file picked yet.",
      logTitle: "6. Log",
      logHint: "IP addresses and mDNS names are masked on export. Post results back to issue #553.",
      export: "Export log",
      reset: "Start over",
      sdpRaw: "Raw size",
      sdpTrimmed: "After trimming",
      sdpGzip: "gzip",
      sdpBase64: "gzip then base64",
      sdpFrames: "QR frames (medium)",
      sdpSeconds: "One full pass",
      sdpCandidates: "Candidate lines",
      noCompression: "This browser has no CompressionStream",
      role: "Side",
      roleValueOfferer: "Starter",
      roleValueAnswerer: "Responder",
      roleValueNone: "None",
      connection: "Connection",
      iceConnection: "ICE connection",
      iceGathering: "Candidate gathering",
      channel: "Data channel",
      channelIdle: "Not created",
      handshake: "Handshake (incl. by hand)",
      negotiate: "Negotiation",
      handover: "Handover (by hand)",
      handshakeIdle: "Not finished",
      envLabel: "This run",
      envPlaceholder: "e.g. own hotspot, Mac Chrome to iPhone Safari",
      flushing: "Waiting for the send to finish",
      pair: "Selected candidates",
      pairIdle: "None yet",
      direction: "Direction",
      sending: "Sending",
      receiving: "Receiving",
      received: "Received",
      size: "Size",
      elapsed: "Elapsed",
      throughput: "Throughput",
      hashMatch: "SHA-256 check",
      hashOk: "matches",
      hashBad: "does not match, this run does not count",
      seconds: "s",
      frames: "frames",
    },
  };

  function normalizeLang(lang) {
    if (!lang) return "zh-TW";
    if (lang === "zh") return "zh-CN";
    if (lang === "zh-TW" || lang === "zh-CN") return lang;
    if (lang.slice(0, 2) === "en") return "en";
    return "zh-TW";
  }

  const t = STRINGS[normalizeLang(document.documentElement.lang)] || STRINGS["zh-TW"];

  // ---------------------------------------------------------------- 版面

  const CSS = `
    #webrtc-lab .wl-step { margin: 1.4rem 0 0; }
    #webrtc-lab h3 { font-size: 0.85rem; margin: 0 0 0.3rem; }
    #webrtc-lab textarea {
      box-sizing: border-box;
      font-family: var(--md-code-font-family, monospace);
      font-size: 0.62rem;
      min-height: 6rem;
      width: 100%;
    }
    #webrtc-lab .wl-hint { font-size: 0.7rem; margin: 0 0 0.4rem; opacity: 0.8; }
    #webrtc-lab .wl-state { font-size: 0.72rem; margin: 0.4rem 0 0; }
    #webrtc-lab table { font-size: 0.7rem; width: 100%; }
    #webrtc-lab td:last-child, #webrtc-lab th:last-child { text-align: right; }
    #webrtc-lab progress { width: 100%; }
    #webrtc-lab .wl-log {
      font-size: 0.6rem;
      max-height: 12rem;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    #webrtc-lab .md-button { margin: 0.2rem 0.4rem 0.2rem 0; padding: 0.3rem 0.8rem; }
    #webrtc-lab .wl-qr {
      background: #fff;
      display: block;
      image-rendering: pixelated;
      margin: 0.4rem 0;
      max-width: 22rem;
      width: 100%;
    }
    #webrtc-lab .wl-video { background: #000; display: block; margin: 0.4rem 0; max-width: 22rem; width: 100%; }
    #webrtc-lab .wl-env { box-sizing: border-box; font-size: 0.75rem; margin: 0 0 0.4rem; padding: 0.3rem; width: 100%; }
  `;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, onClick) {
    const node = el("button", "md-button", label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function step(title) {
    const wrap = el("div", "wl-step");
    wrap.appendChild(el("h3", null, title));
    root.appendChild(wrap);
    return wrap;
  }

  function table(wrap) {
    const node = el("table");
    const body = el("tbody");
    node.appendChild(body);
    wrap.appendChild(node);
    return body;
  }

  function rows(target, pairs) {
    target.innerHTML = "";
    for (let i = 0; i < pairs.length; i += 1) {
      const tr = el("tr");
      tr.appendChild(el("th", null, pairs[i][0]));
      tr.appendChild(el("td", null, pairs[i][1]));
      target.appendChild(tr);
    }
  }

  const style = el("style");
  style.textContent = CSS;
  root.appendChild(style);

  const roleStep = step(t.roleTitle);
  const roleState = el("p", "wl-state", t.roleIdle);
  const btnOffer = button(t.offer, startOffer);
  const btnAnswer = button(t.answer, startAnswer);
  roleStep.appendChild(btnOffer);
  roleStep.appendChild(btnAnswer);
  roleStep.appendChild(roleState);

  const localStep = step(t.localTitle);
  localStep.appendChild(el("p", "wl-hint", t.localHint));
  // QR code 放在文字框前面。掃碼是主要的交換方式，文字框留給相機不能用的時候。
  const qrCanvas = el("canvas", "wl-qr");
  qrCanvas.hidden = true;
  localStep.appendChild(qrCanvas);
  const qrNote = el("p", "wl-hint");
  qrNote.hidden = true;
  localStep.appendChild(qrNote);
  const localBox = el("textarea");
  localBox.readOnly = true;
  localStep.appendChild(localBox);
  localStep.appendChild(button(t.copy, copyLocal));
  const sdpTable = table(localStep);

  const remoteStep = step(t.remoteTitle);
  remoteStep.appendChild(el("p", "wl-hint", t.remoteHint));
  const btnScan = button(t.scan, startScan);
  const btnScanStop = button(t.scanStop, function () { stopScan("cancel"); });
  btnScanStop.hidden = true;
  remoteStep.appendChild(btnScan);
  remoteStep.appendChild(btnScanStop);
  const video = el("video", "wl-video");
  video.hidden = true;
  // muted 與 playsinline 少一個，iOS Safari 就不肯自動播，畫面會停在第一張
  video.muted = true;
  video.setAttribute("playsinline", "");
  remoteStep.appendChild(video);
  const scanState = el("p", "wl-state");
  remoteStep.appendChild(scanState);
  const remoteBox = el("textarea");
  remoteStep.appendChild(remoteBox);
  remoteStep.appendChild(button(t.apply, applyRemote));

  const connStep = step(t.connTitle);
  const connTable = table(connStep);

  const sendStep = step(t.transferTitle);
  sendStep.appendChild(el("p", "wl-hint", t.transferHint));
  // 哪一種網路、哪兩台裝置，只有測的人知道，而測試矩陣要靠這一欄才填得起來。
  // 寫進 log 與匯出的檔案，回報時不必另外在 issue 補一段描述。
  const envBox = el("input");
  envBox.type = "text";
  envBox.className = "wl-env";
  envBox.placeholder = t.envPlaceholder;
  envBox.setAttribute("aria-label", t.envLabel);
  sendStep.appendChild(envBox);
  const sizeBox = el("select");
  [
    ["102400", "100 KB"],
    ["1048576", "1 MB"],
    ["5242880", "5 MB"],
    ["20971520", "20 MB"],
  ].forEach(function (pair) {
    const option = el("option", null, pair[1]);
    option.value = pair[0];
    if (pair[0] === "1048576") option.selected = true;
    sizeBox.appendChild(option);
  });
  sendStep.appendChild(sizeBox);
  sendStep.appendChild(button(t.sendGenerated, sendGenerated));
  const fileBox = el("input");
  fileBox.type = "file";
  sendStep.appendChild(fileBox);
  sendStep.appendChild(button(t.sendFile, sendPickedFile));
  const progress = el("progress");
  progress.max = 100;
  progress.value = 0;
  sendStep.appendChild(progress);
  const sendTable = table(sendStep);

  const logStep = step(t.logTitle);
  logStep.appendChild(el("p", "wl-hint", t.logHint));
  logStep.appendChild(button(t.export, exportLog));
  logStep.appendChild(button(t.reset, function () { location.reload(); }));
  const logBox = el("pre", "wl-log");
  logStep.appendChild(logBox);

  // ---------------------------------------------------------------- 狀態

  const log = [];
  let pc = null;
  let channel = null;
  let role = null;
  let startedAt = 0;
  let appliedAt = 0;
  let openedAt = 0;
  const incoming = { chunks: [], size: 0, expect: null, startedAt: 0 };

  function record(event, data) {
    log.push(Object.assign({ at: new Date().toISOString(), event: event }, data || {}));
    logBox.textContent = log.map(function (row) { return JSON.stringify(row); }).join("\n");
  }

  // ---------------------------------------------------------------- SDP 量測

  // 只開 DataChannel 的描述裡有幾行對這個用途沒有作用。量精簡後的大小是為了知道
  // 真的要塞進 QR 的時候能壓到多小，實際交換的仍然是原始描述。
  function trimSdp(sdp) {
    const drop = /^(a=msid-semantic|a=group:BUNDLE|a=extmap|a=rtcp-mux|a=ice-options)/;
    return sdp
      .split(/\r?\n/)
      .filter(function (line) { return line.length > 0 && !drop.test(line); })
      .join("\n");
  }

  async function gzipSize(text) {
    if (typeof CompressionStream !== "function") return null;
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
    const buffer = await new Response(stream).arrayBuffer();
    // QR 走的是文字，壓完還要 base64，換算成 4/3
    return { gzip: buffer.byteLength, base64: Math.ceil(buffer.byteLength / 3) * 4 };
  }

  async function showSdpStats(sdp) {
    const raw = new TextEncoder().encode(sdp).length;
    const trimmed = new TextEncoder().encode(trimSdp(sdp)).length;
    const packed = await gzipSize(trimSdp(sdp));
    const forQr = packed ? packed.base64 : trimmed;
    const frames = Math.ceil(forQr / QR_PAYLOAD_MEDIUM) + 1;
    const secs = (frames / QR_FRAMES_PER_SECOND).toFixed(1);
    const candidates = (sdp.match(/^a=candidate/gm) || []).length;
    rows(sdpTable, [
      [t.sdpRaw, raw + " B"],
      [t.sdpTrimmed, trimmed + " B"],
      [t.sdpGzip, packed ? packed.gzip + " B" : t.noCompression],
      [t.sdpBase64, packed ? packed.base64 + " B" : "n/a"],
      [t.sdpFrames, frames + " " + t.frames],
      [t.sdpSeconds, secs + " " + t.seconds],
      [t.sdpCandidates, String(candidates)],
    ]);
    record("sdp-stats", {
      raw: raw,
      trimmed: trimmed,
      gzip: packed ? packed.gzip : null,
      base64: packed ? packed.base64 : null,
      qrFrames: frames,
      qrSeconds: Number(secs),
      candidates: candidates,
    });
  }

  // 匯出前把位址遮掉。候選那幾行帶著本機 IP 或 mDNS 名稱，兩者都指得回裝置。
  function maskSdp(sdp) {
    return sdp
      .replace(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.local/gi, "<mdns>.local")
      .replace(/\b\d{1,3}(\.\d{1,3}){3}\b/g, "<ipv4>")
      .replace(/\b(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}\b/gi, "<ipv6>");
  }

  // ---------------------------------------------------------------- 連線

  function newConnection() {
    // iceServers 留空是刻意的。這個實驗只處理同一個區網，連得上就是靠 host candidate，
    // 連不上就代表那個網路擋掉裝置之間的連線，而那正是要量的東西。
    const conn = new RTCPeerConnection({ iceServers: [] });
    conn.addEventListener("connectionstatechange", updateState);
    conn.addEventListener("iceconnectionstatechange", updateState);
    conn.addEventListener("icegatheringstatechange", updateState);
    conn.addEventListener("datachannel", function (event) {
      channel = event.channel;
      wireChannel();
    });
    return conn;
  }

  function wireChannel() {
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = BUFFER_LOW;
    channel.addEventListener("open", function () {
      openedAt = performance.now();
      // 握手耗時原本只有一個數字，而那個數字裡面裝著人類複製貼上的時間。實測有一筆
      // 記到 160 秒，協定本身其實不到一秒。拆成兩段才比對得了 issue #553 的門檻。
      //
      // negotiateMs 只有發起方那一側準確。回應方是把描述交回去之後，對方套用的那
      // 一刻才開通，中間同樣夾著人工。
      record("datachannel-open", {
        handshakeMs: Math.round(openedAt - startedAt),
        negotiateMs: appliedAt ? Math.round(openedAt - appliedAt) : null,
        handoverMs: appliedAt ? Math.round(appliedAt - startedAt) : null,
      });
      updateState();
      // 候選對在開通的當下不一定選好了，等一秒再記。host 或別的類型決定了這條路
      // 在真實網路裡是怎麼通的。
      setTimeout(async function () {
        const pair = await selectedPair();
        if (pair) record("candidate-pair", pair);
      }, 1000);
    });
    channel.addEventListener("close", function () {
      record("datachannel-close", {});
      updateState();
    });
    channel.addEventListener("message", onMessage);
  }

  // 走的是同網段的 host 還是別的類型，決定了這條路在真實網路裡是怎麼通的。
  async function selectedPair() {
    if (!pc || !pc.getStats) return null;
    try {
      const stats = await pc.getStats();
      let pair = null;
      stats.forEach(function (report) {
        if (report.type === "candidate-pair" && report.state === "succeeded" && report.nominated) {
          pair = report;
        }
      });
      if (!pair) return null;
      const local = stats.get(pair.localCandidateId);
      const remote = stats.get(pair.remoteCandidateId);
      return {
        local: local ? local.candidateType : "?",
        remote: remote ? remote.candidateType : "?",
      };
    } catch (err) {
      return null;
    }
  }

  async function updateState() {
    if (!pc) return;
    const pair = await selectedPair();
    const roleLabel = role === "offerer"
      ? t.roleValueOfferer
      : role === "answerer" ? t.roleValueAnswerer : t.roleValueNone;
    rows(connTable, [
      [t.role, roleLabel],
      [t.connection, pc.connectionState],
      [t.iceConnection, pc.iceConnectionState],
      [t.iceGathering, pc.iceGatheringState],
      [t.channel, channel ? channel.readyState : t.channelIdle],
      [t.negotiate, openedAt && appliedAt ? Math.round(openedAt - appliedAt) + " ms" : t.handshakeIdle],
      [t.handover, appliedAt ? Math.round(appliedAt - startedAt) + " ms" : t.handshakeIdle],
      [t.handshake, openedAt ? Math.round(openedAt - startedAt) + " ms" : t.handshakeIdle],
      [t.pair, pair ? pair.local + " / " + pair.remote : t.pairIdle],
    ]);
  }

  // 候選蒐集完成才把描述交出去。實驗階段不做 trickle，那需要一條雙向且持續的通道，
  // 而手動貼上與 QR 都只能一次過一份。
  function waitForGathering(conn) {
    if (conn.iceGatheringState === "complete") return Promise.resolve();
    return new Promise(function (resolve) {
      const check = function () {
        if (conn.iceGatheringState === "complete") {
          conn.removeEventListener("icegatheringstatechange", check);
          resolve();
        }
      };
      conn.addEventListener("icegatheringstatechange", check);
      // 有些環境的 complete 不會來，給一個上限，拿到手上的候選就先走
      setTimeout(resolve, 5000);
    });
  }

  // ---------------------------------------------------------------- QR code

  // 位元組陣列轉成每個字元一個位元組的字串，餵給 qrcode-generator 的 byte mode。
  function bytesToLatin1(bytes) {
    let out = "";
    for (let at = 0; at < bytes.length; at += 4096) {
      out += String.fromCharCode.apply(null, bytes.subarray(at, at + 4096));
    }
    return out;
  }

  async function streamBytes(bytes, transform) {
    const stream = new Blob([bytes]).stream().pipeThrough(transform);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // 描述封成 QR 要裝的位元組。gzip 之後比原文小才用，壓了反而變大就送原文。
  async function packDescription(json) {
    const raw = new TextEncoder().encode(json);
    let body = raw;
    let gzipped = 0;
    if (typeof CompressionStream === "function") {
      const packed = await streamBytes(raw, new CompressionStream("gzip"));
      if (packed.length < raw.length) {
        body = packed;
        gzipped = 1;
      }
    }
    const out = new Uint8Array(4 + body.length);
    out.set([PACK_MAGIC[0], PACK_MAGIC[1], PACK_VERSION, gzipped]);
    out.set(body, 4);
    return out;
  }

  // 解不開的原因分開回報，掃到別的 QR code 要繼續掃，內容壞掉就要停下來說清楚。
  async function unpackDescription(bytes) {
    if (!bytes || bytes.length < 5 || bytes[0] !== PACK_MAGIC[0] || bytes[1] !== PACK_MAGIC[1]) {
      return { error: "foreign" };
    }
    if (bytes[2] !== PACK_VERSION || bytes[3] > 1) return { error: "version" };
    let body = bytes.subarray(4);
    try {
      if (bytes[3] === 1) {
        if (typeof DecompressionStream !== "function") return { error: "nodecompress" };
        body = await streamBytes(body, new DecompressionStream("gzip"));
      }
      const json = new TextDecoder().decode(body);
      JSON.parse(json);
      return { json: json };
    } catch (err) {
      return { error: "corrupt" };
    }
  }

  // 先試容錯度 M，版本超過上限再退到 L。M 撐得住螢幕反光遮掉的一小塊，能用就用 M。
  function buildQr(bytes) {
    if (!window.qrcode) return null;
    // 這一頁送的是原始位元組，編碼用函式庫預設的那一份（每個字元取低八位）
    window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["default"];
    const text = bytesToLatin1(bytes);
    const levels = ["M", "L"];
    for (let i = 0; i < levels.length; i += 1) {
      try {
        const qr = window.qrcode(0, levels[i]);
        qr.addData(text, "Byte");
        qr.make();
        const version = (qr.getModuleCount() - 17) / 4;
        if (version <= MAX_QR_VERSION) return { qr: qr, version: version, level: levels[i] };
      } catch (err) {
        // 這個容錯度下連第 40 版都裝不下，換下一個
      }
    }
    return { qr: null };
  }

  let shownQr = null;

  async function showQr(json) {
    qrCanvas.hidden = true;
    qrNote.hidden = false;
    shownQr = null;
    if (!window.qrcode) {
      qrNote.textContent = t.qrMissing;
      record("qr-missing", {});
      return;
    }
    const bytes = await packDescription(json);
    const built = buildQr(bytes);
    if (!built || !built.qr) {
      qrNote.textContent = t.qrTooLarge;
      record("qr-too-large", { bytes: bytes.length });
      return;
    }
    // 畫在 canvas 上，每個方格整數倍放大，外圍留四格空白。CSS 再縮到版面寬度，
    // image-rendering: pixelated 讓縮放後的邊界維持銳利。
    const quiet = 4;
    const count = built.qr.getModuleCount();
    const scale = Math.max(4, Math.floor(640 / (count + quiet * 2)));
    const size = (count + quiet * 2) * scale;
    qrCanvas.width = size;
    qrCanvas.height = size;
    const ctx = qrCanvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000";
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (built.qr.isDark(row, col)) {
          ctx.fillRect((col + quiet) * scale, (row + quiet) * scale, scale, scale);
        }
      }
    }
    qrCanvas.hidden = false;
    qrNote.textContent = t.qrHint;
    shownQr = built;
    record("qr-shown", {
      bytes: bytes.length,
      gzip: bytes[3] === 1,
      version: built.version,
      level: built.level,
    });
  }

  // ---------------------------------------------------------------- 相機

  const scan = { stream: null, timer: null, startedAt: 0, canvas: null, foreign: 0 };

  function scanError(reason, message) {
    stopScan(reason);
    scanState.textContent = message;
    record("qr-scan-error", { reason: reason });
  }

  async function startScan() {
    stopScan("restart");
    if (!window.jsQR) {
      scanError("missing", t.qrMissing);
      return;
    }
    const media = navigator.mediaDevices;
    if (!media || !media.getUserMedia) {
      // 不安全的連線（http 的區網位址）也會落到這裡，瀏覽器在那種頁面上不提供 mediaDevices
      scanError("unsupported", t.scanUnsupported);
      return;
    }
    try {
      scan.stream = await media.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (err) {
      const name = err && err.name;
      if (name === "NotAllowedError" || name === "SecurityError") scanError("denied", t.scanDenied);
      else if (name === "NotFoundError" || name === "OverconstrainedError") scanError("nocamera", t.scanNoCamera);
      else scanError("failed", t.scanFailed);
      return;
    }
    // 先把畫面露出來再播。display:none 的 video 在部分瀏覽器不會解出畫面，
    // 結果是相機指示燈亮著，而掃描迴圈永遠讀到空白。
    video.hidden = false;
    video.srcObject = scan.stream;
    try {
      await video.play();
    } catch (err) {
      // 播不起來多半是還沒有互動紀錄，下面的迴圈會等到 readyState 就位
    }
    btnScan.hidden = true;
    btnScanStop.hidden = false;
    scanState.textContent = t.scanning;
    scan.startedAt = performance.now();
    scan.foreign = 0;
    record("qr-scan-start", {});
    scanTick();
  }

  function stopScan(reason) {
    if (scan.timer) {
      clearTimeout(scan.timer);
      scan.timer = null;
    }
    if (scan.stream) {
      scan.stream.getTracks().forEach(function (track) { track.stop(); });
      scan.stream = null;
      if (reason === "cancel") record("qr-scan-cancel", { ms: Math.round(performance.now() - scan.startedAt) });
    }
    video.srcObject = null;
    video.hidden = true;
    btnScan.hidden = false;
    btnScanStop.hidden = true;
    if (reason === "cancel") scanState.textContent = "";
  }

  function readFrame() {
    if (video.readyState < 2 || !video.videoWidth) return null;
    const width = Math.min(video.videoWidth, SCAN_WIDTH);
    const height = Math.round((video.videoHeight * width) / video.videoWidth);
    if (!scan.canvas) scan.canvas = document.createElement("canvas");
    scan.canvas.width = width;
    scan.canvas.height = height;
    const ctx = scan.canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height);
    // 螢幕上的 QR 是正常的深色方格，不必試反相，關掉那一輪解碼成本砍一半
    const found = window.jsQR(pixels.data, width, height, { inversionAttempts: "dontInvert" });
    return found && found.binaryData ? Uint8Array.from(found.binaryData) : null;
  }

  async function scanTick() {
    if (!scan.stream) return;
    const began = performance.now();
    const bytes = readFrame();
    if (bytes) {
      const result = await unpackDescription(bytes);
      if (result.json) {
        const ms = Math.round(performance.now() - scan.startedAt);
        stopScan("done");
        scanState.textContent = t.scanned;
        record("qr-scanned", { ms: ms, bytes: bytes.length, foreignSeen: scan.foreign });
        remoteBox.value = result.json;
        await applyRemote();
        return;
      }
      if (result.error === "foreign") {
        scan.foreign += 1;
        scanState.textContent = t.scanForeign;
      } else {
        scanError(result.error, t.scanBadPayload);
        return;
      }
    }
    const spent = performance.now() - began;
    scan.timer = setTimeout(scanTick, Math.max(0, SCAN_INTERVAL_MS - spent));
  }

  async function startOffer() {
    role = "offerer";
    startedAt = performance.now();
    pc = newConnection();
    channel = pc.createDataChannel("bundle", { ordered: true });
    wireChannel();
    await pc.setLocalDescription(await pc.createOffer());
    await waitForGathering(pc);
    localBox.value = JSON.stringify(pc.localDescription);
    await showSdpStats(pc.localDescription.sdp);
    await showQr(localBox.value);
    roleState.textContent = t.roleOfferer;
    updateState();
  }

  function startAnswer() {
    role = "answerer";
    startedAt = performance.now();
    pc = newConnection();
    roleState.textContent = t.roleAnswerer;
    updateState();
  }

  async function applyRemote() {
    if (!pc) { roleState.textContent = t.pickRoleFirst; return; }
    let desc;
    try {
      desc = JSON.parse(remoteBox.value.trim());
    } catch (err) {
      roleState.textContent = t.badJson;
      return;
    }
    await pc.setRemoteDescription(desc);
    appliedAt = performance.now();
    record("remote-description", { type: desc.type });
    if (role === "answerer") {
      await pc.setLocalDescription(await pc.createAnswer());
      await waitForGathering(pc);
      localBox.value = JSON.stringify(pc.localDescription);
      await showSdpStats(pc.localDescription.sdp);
      await showQr(localBox.value);
      roleState.textContent = t.roleAnswered;
    }
    updateState();
  }

  async function copyLocal() {
    try {
      await navigator.clipboard.writeText(localBox.value);
      roleState.textContent = t.copied;
    } catch (err) {
      localBox.select();
      roleState.textContent = t.copyManual;
    }
  }

  // ---------------------------------------------------------------- 傳輸

  async function sha256Hex(buffer) {
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.prototype.map
      .call(new Uint8Array(digest), function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  // send() 只把資料塞進緩衝區就返回，迴圈跑完的時候東西還在排隊。實測 1 MB 的送出端
  // 寫著 0 秒、每秒一萬 MB，同一筆在接收端是 0.27 秒。等緩衝區排空才是真的送完。
  function drain(timeout) {
    const limit = timeout || 180000;
    return new Promise(function (resolve) {
      const began = performance.now();
      const tick = function () {
        const stuck = performance.now() - began > limit;
        if (!channel || channel.readyState !== "open" || channel.bufferedAmount === 0 || stuck) {
          resolve(stuck);
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  async function sendBytes(bytes, name) {
    if (!channel || channel.readyState !== "open") {
      rows(sendTable, [[t.direction, t.notConnected]]);
      return;
    }
    const slice = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const hash = await sha256Hex(slice);
    channel.send(JSON.stringify({ kind: "start", name: name, size: bytes.length, hash: hash }));
    record("send-start", { size: bytes.length, environment: envBox.value || null });

    const began = performance.now();
    let sent = 0;
    while (sent < bytes.length) {
      if (channel.bufferedAmount > BUFFER_HIGH) {
        await new Promise(function (resolve) {
          const once = function () {
            channel.removeEventListener("bufferedamountlow", once);
            resolve();
          };
          channel.addEventListener("bufferedamountlow", once);
        });
      }
      const end = Math.min(sent + CHUNK, bytes.length);
      channel.send(bytes.subarray(sent, end));
      sent = end;
      progress.value = (sent / bytes.length) * 100;
    }
    channel.send(JSON.stringify({ kind: "end" }));

    rows(sendTable, [
      [t.direction, t.sending],
      [t.size, bytes.length.toLocaleString() + " B"],
      [t.elapsed, t.flushing],
    ]);
    const stuck = await drain();

    const secs = Math.max((performance.now() - began) / 1000, 0.001);
    const rate = (bytes.length / 1024 / 1024 / secs).toFixed(2);
    rows(sendTable, [
      [t.direction, t.sending],
      [t.size, bytes.length.toLocaleString() + " B"],
      [t.elapsed, secs.toFixed(2) + " " + t.seconds],
      [t.throughput, rate + " MB/s"],
    ]);
    record("send-done", {
      size: bytes.length,
      seconds: Number(secs.toFixed(2)),
      mbps: Number(rate),
      drainTimedOut: stuck || false,
    });
  }

  async function onMessage(event) {
    if (typeof event.data === "string") {
      const msg = JSON.parse(event.data);
      if (msg.kind === "start") {
        incoming.chunks = [];
        incoming.size = 0;
        incoming.expect = msg;
        incoming.startedAt = performance.now();
        record("recv-start", { size: msg.size, environment: envBox.value || null });
        rows(sendTable, [[t.direction, t.receiving], [t.size, msg.size.toLocaleString() + " B"]]);
        return;
      }
      if (msg.kind === "end") {
        const buffer = await new Blob(incoming.chunks).arrayBuffer();
        const hash = await sha256Hex(buffer);
        const secs = (performance.now() - incoming.startedAt) / 1000;
        const rate = (incoming.size / 1024 / 1024 / secs).toFixed(2);
        const ok = hash === incoming.expect.hash && incoming.size === incoming.expect.size;
        record("recv-done", {
          size: incoming.size,
          seconds: Number(secs.toFixed(2)),
          mbps: Number(rate),
          match: ok,
        });
        rows(sendTable, [
          [t.direction, t.received],
          [t.size, incoming.size.toLocaleString() + " B"],
          [t.elapsed, secs.toFixed(2) + " " + t.seconds],
          [t.throughput, rate + " MB/s"],
          [t.hashMatch, ok ? t.hashOk : t.hashBad],
        ]);
      }
      return;
    }
    incoming.chunks.push(event.data);
    incoming.size += event.data.byteLength || event.data.size || 0;
    if (incoming.expect) progress.value = (incoming.size / incoming.expect.size) * 100;
  }

  async function sendGenerated() {
    const size = Number(sizeBox.value);
    // 用亂數填。內容重複的話中間任何一層的壓縮都會讓吞吐量失真
    const bytes = new Uint8Array(size);
    for (let at = 0; at < size; at += 65536) {
      crypto.getRandomValues(bytes.subarray(at, Math.min(at + 65536, size)));
    }
    await sendBytes(bytes, "generated-" + size);
  }

  async function sendPickedFile() {
    const file = fileBox.files[0];
    if (!file) { rows(sendTable, [[t.direction, t.noFile]]); return; }
    await sendBytes(new Uint8Array(await file.arrayBuffer()), file.name);
  }

  function exportLog() {
    const payload = {
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      role: role,
      environment: envBox.value || null,
      localSdp: pc && pc.localDescription ? maskSdp(pc.localDescription.sdp) : null,
      log: log,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = el("a");
    link.href = URL.createObjectURL(blob);
    link.download = "webrtc-lab-" + Date.now() + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  updateState();

  // 給回送檢查用的把手，見 tools/webrtc-lab/run-loopback.mjs。人不會用到這幾個。
  window.__lab = {
    offer: startOffer,
    answer: startAnswer,
    apply: function (text) { remoteBox.value = text; applyRemote(); },
    localSdp: function () { return localBox.value; },
    state: function () {
      return {
        connection: pc ? pc.connectionState : null,
        channel: channel ? channel.readyState : null,
        handshakeMs: openedAt ? Math.round(openedAt - startedAt) : null,
      };
    },
    send: function (size) { sizeBox.value = String(size); sendGenerated(); },
    environment: function (text) { envBox.value = text; },
    // 把現在顯示的 QR 方格矩陣交出去，檢查腳本拿去寫成假攝影機的 Y4M 畫面
    qrMatrix: function () {
      if (!shownQr || !shownQr.qr) return null;
      const count = shownQr.qr.getModuleCount();
      const out = [];
      for (let row = 0; row < count; row += 1) {
        let line = "";
        for (let col = 0; col < count; col += 1) line += shownQr.qr.isDark(row, col) ? "1" : "0";
        out.push(line);
      }
      return { version: shownQr.version, level: shownQr.level, rows: out };
    },
    scan: startScan,
    stopScan: function () { stopScan("cancel"); },
    scanStatus: function () { return { scanning: !!scan.stream, foreign: scan.foreign }; },
    log: function () { return log; },
  };
})();
