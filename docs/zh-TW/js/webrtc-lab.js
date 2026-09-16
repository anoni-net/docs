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
 * 檔案內容只在兩台裝置之間流動，文件站這一側拿不到任何一個位元組。
 *
 * === 幾個設計決定 ===
 *
 * 只開 DataChannel 不要媒體軌，SDP 才會小，小到塞得進 QR code 才有下一階段。
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
      roleOfferer: "你是發起方。把下面那段描述交給對方，取得回覆之後貼進第三區。",
      roleAnswerer: "你是回應方。把對方給的描述貼進第三區按套用，再把產生的描述交回去。",
      roleAnswered: "回應描述好了，交回給對方。",
      localTitle: "二、你的描述",
      localHint: "等連線候選蒐集完才會出現，整段交給對方。",
      copy: "複製",
      copied: "已複製。",
      copyManual: "瀏覽器不給用剪貼簿，已經選起來，自己按複製。",
      remoteTitle: "三、對方的描述",
      remoteHint: "把對方交給你的整段貼進來。",
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
      roleOfferer: "你是发起方。把下面那段描述交给对方，取得回复之后贴进第三区。",
      roleAnswerer: "你是回应方。把对方给的描述贴进第三区按套用，再把产生的描述交回去。",
      roleAnswered: "回应描述好了，交回给对方。",
      localTitle: "二、你的描述",
      localHint: "等连线候选搜集完才会出现，整段交给对方。",
      copy: "复制",
      copied: "已复制。",
      copyManual: "浏览器不给用剪贴板，已经选起来，自己按复制。",
      remoteTitle: "三、对方的描述",
      remoteHint: "把对方交给你的整段贴进来。",
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
      roleOfferer: "You start. Hand the description below to the other device, then paste their reply into step 3.",
      roleAnswerer: "You reply. Paste their description into step 3, apply it, then hand your description back.",
      roleAnswered: "Your reply is ready. Hand it back to the other device.",
      localTitle: "2. Your description",
      localHint: "It appears once candidate gathering finishes. Hand over the whole block.",
      copy: "Copy",
      copied: "Copied.",
      copyManual: "The browser blocks clipboard access. The text is selected, copy it yourself.",
      remoteTitle: "3. Their description",
      remoteHint: "Paste the whole block they handed you.",
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
  const localBox = el("textarea");
  localBox.readOnly = true;
  localStep.appendChild(localBox);
  localStep.appendChild(button(t.copy, copyLocal));
  const sdpTable = table(localStep);

  const remoteStep = step(t.remoteTitle);
  remoteStep.appendChild(el("p", "wl-hint", t.remoteHint));
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
    log: function () { return log; },
  };
})();
