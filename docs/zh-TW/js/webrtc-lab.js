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
 *
 * QR 優先放只帶欄位的封包（格式版本 2），約 80 B，第 5 版就裝得下，完整描述 gzip 後要到
 * 第 17 版。描述裡每次真的會變的只有 ice-ufrag、ice-pwd、DTLS 指紋、候選與 setup 角色，
 * 其餘的行由接收端照固定樣板補回。編不出來（指紋不是 SHA-256、候選全被濾掉）就退回
 * 格式版本 1 的完整描述，所以這只是縮小，不會讓原本連得上的組合變得連不上。
 *
 * 候選只留 UDP 的 host，並丟掉 100.64.0.0/10 與 Tailscale 的 fd7a:115c:a1e0::/48。
 * 這一步只管交出去的候選，管不到瀏覽器從哪張網卡送連線檢查：有相機權限之後才建立的
 * 連線，每張網卡各有一個 socket，Tailscale 那一個照樣會送，對方收到後當成 prflx 候選。
 * 要完全避開 Tailscale，連線要在授權之前建立，見 issue #553 的第二階段規格草案。
 *
 * ICE 蒐集完成才把描述交出去，不做 trickle，因為 trickle 需要一條雙向且持續的通道，
 * 而手動貼上與 QR 都只能一次過一份。
 * 分塊 64 KB 並靠 bufferedAmount 做背壓，收的一端算 SHA-256 跟來源比對。
 *
 * === 減少掃描次數 ===
 *
 * 每一台都按同一個「開始」，不必先選角色。畫面放自己的發起描述，相機同時開著掃，誰先掃到
 * 對方的發起描述，誰就回應，畫面換成回應描述讓對方掃回去。回應描述帶兩個位元組的標記，
 * 指出它回應的是哪一張發起描述，同一張被兩台掃到時，後掃回來的那一張認得出來。
 *
 * 一頁可以同時連很多台。連上之後彼此交換手上連著哪些裝置，沒連上的兩台由中間那一台
 * 轉交描述，所以第三台以後只要跟其中任何一台互掃一次，其餘的連線自己補上。
 *
 * 按開始的當下先建好一批 RTCPeerConnection 備用。Chrome 在建立連線物件的時候就決定交出
 * 哪些候選，開相機之前建的只交出一個 mDNS 名稱，即使開相機之後才蒐集也一樣（2026-09-25
 * 在 Chrome 153 實測），之後新建的會交出每一張網卡的明碼位址。發起方畫面上的描述用這一批，
 * 相機一直開著也只放 mDNS 名稱。
 *
 * 回應方反過來用新建的連線，交出明碼的區網位址，讓每一對裝置至少有一邊不必靠 mDNS 解析。
 * 兩邊都只有 mDNS 名稱時，連不連得上取決於網路能不能解析 .local，同一天 Mac Brave 對 iPhone
 * 的實測就連不上。WebKit 則是在蒐集的時候才決定，預先建好的連線在 iPhone 上沒有作用。
 * 已經授權過相機的瀏覽器，頁面一載入就交出明碼位址，這一批也一樣。
 *
 * 這一頁的所有連線共用一張憑證，DTLS 指紋就是這台裝置在這一頁的代號。經由別台轉交描述
 * 建立的連線，開通之後比對代號，確認對方就是被介紹的那一台。
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
  // 只帶欄位的封包。版本 1 的第四個位元組是 gzip 旗標，這一版拿來放描述的旗標。
  const PACK_COMPACT = 2;

  // DataChannel 一次送多大的預設值。SCTP 的訊息上限各家實作不同，64 KB 是普遍安全的值。
  // 第五區可以改，送的時候再依兩邊協商出來的上限裁掉。
  const CHUNK = 64 * 1024;
  // bufferedAmount 超過上界就先停手，等它降到下界再送，否則記憶體會被塞爆。
  const BUFFER_HIGH = 4 * 1024 * 1024;
  const BUFFER_LOW = 1 * 1024 * 1024;

  // 按開始時先建好幾條連線備用，理由見開頭的「減少掃描次數」。每一張顯示過的發起描述、
  // 每一條經由介紹發起的連線都各用掉一條。一台連四、五台的情況用不完，
  // 用完了才現建，那一條會交出所有網卡，記一筆 pool-empty。回應方不從這裡拿，見 addPeer。
  const POOL_SIZE = 8;
  // 套上對方的回應之後等多久還沒開通，就判定連不上。協定本身在區網上不到一秒，
  // 超過這個時間多半是裝置隔離或 mDNS 解析不到，繼續等也不會通。issue #553 的 H3 要求 15 秒內說得出來。
  const CONNECT_TIMEOUT_MS = 15000;

  const STRINGS = {
    "zh-TW": {
      startTitle: "一、開始配對",
      start: "開始",
      startIdle: "每一台要連線的裝置都按一次開始。不必先約定誰發起，誰先用相機掃到對方都可以。",
      selfLabel: "這台裝置的代號：",
      roleOffer: "第二區是你的 QR code，讓還沒連上的裝置掃。",
      roleAnswer: "掃到了 {peer}，第二區換成回應用的 QR code，讓 {peer} 掃這一張就連上了。",
      localTitle: "二、你的 QR code",
      localHint: "按開始之後出現。讓對方的相機對準這張 QR code，掃不了的話整段複製交給對方。",
      qrHint: "螢幕亮度調高，QR code 佔對方畫面一半以上最好讀。",
      qrTooLarge: "這一次的描述太大，一張 QR code 裝不下，請改用複製貼上。",
      qrMissing: "QR code 元件沒有載入，請改用複製貼上。",
      copy: "複製",
      copied: "已複製。",
      copyManual: "瀏覽器不給用剪貼簿，已經選起來，自己按複製。",
      remoteTitle: "三、掃對方的 QR code",
      remoteHint: "按開始之後相機會自動打開，掃到就自動套用。已經連上的裝置會互相介紹，第三台以後只要跟其中任何一台互掃一次。相機不能用時，把對方交給你的整段貼進下面的框，按套用。",
      cameraLabel: "鏡頭",
      cameraBack: "後鏡頭，對準對方的螢幕",
      cameraFront: "前鏡頭，兩支手機螢幕對螢幕",
      scan: "開始掃描",
      scanStop: "停止掃描",
      scanning: "掃描中，對準對方螢幕上的 QR code。",
      scanForeign: "掃到的 QR code 不是這一頁產生的，繼續對準對方的那一張。",
      scanUnsupported: "這個瀏覽器拿不到相機，請改用複製貼上。",
      scanDenied: "相機權限被拒絕了。到瀏覽器設定允許這個網站使用相機，或改用複製貼上。",
      scanNoCamera: "找不到可用的相機，請改用複製貼上。",
      scanFailed: "相機開不起來，請改用複製貼上。",
      scanBadPayload: "QR code 讀到了但內容解不開，繼續對準對方的那一張，或改用複製貼上。",
      scanned: "掃到了，正在套用。",
      answerUsed: "這張回應用的 QR code 對應的那一張已經有別台用掉了。請對方重新掃你畫面上現在那一張。",
      answerUnknown: "這張回應用的 QR code 不是給這台裝置的。",
      scanAnswered: "掃到了 {peer}。第二區已經換成回應用的 QR code，讓 {peer} 的相機對準它就連上了。",
      scanApplied: "套上了 {peer} 的回應，正在建立連線。第四區的資料通道變成 open 就連上了。",
      scanKnown: "已經連著 {peer}，不必再掃。",
      connectedTo: "已經連上 {peer}。",
      connectTimeout: "{peer} 超過 15 秒還沒連上。這個網路可能擋掉裝置之間的連線，或解析不到對方的 .local 名稱。改用自己開的熱點再試，或兩台互換，由另一台先掃。",
      apply: "套用",
      badJson: "貼上的內容解不開，要整段貼，不要只貼中間幾行。",
      connTitle: "四、連線狀態",
      peersEmpty: "還沒有連上任何裝置。",
      peerDevice: "裝置",
      peerVia: "怎麼連上",
      viaQr: "掃 QR code",
      viaPaste: "複製貼上",
      viaRelay: "經由 {peer} 介紹",
      transferTitle: "五、傳一份東西過去",
      transferHint: "送給所有已經連上的裝置。選一個檔案，或用產生的測試資料。收到的一端會算 SHA-256 跟來源比對。",
      sendGenerated: "送出測試資料",
      sendFile: "送出這個檔案",
      notConnected: "還沒連上任何裝置。",
      noFile: "還沒選檔案。",
      paramsHint: "下面幾個參數用來比較吞吐量。每次只改一個，其餘維持預設，兩端的紀錄都會記下這一次用的參數。",
      chunkLabel: "每塊大小",
      channelsLabel: "每條連線的通道數",
      linksLabel: "並行連線數",
      paramsHead: "參數",
      paramsValue: "{chunk} KB · {channels} 通道 · {links} 連線",
      linkShort: "{peer} 額外的連線沒有開通，這一次只用 {n} 條。",
      prepLabel: "預先準備",
      prepNone: "不預先",
      prepOpen: "連上就開好連線",
      prepWarm: "開好連線並預熱",
      dropLinks: "收掉額外的連線",
      dropped: "已收掉 {n} 條額外的連線，下一次送出或預先準備會重新開。",
      logTitle: "六、紀錄",
      logHint: "紀錄存在這個分頁裡，重新整理後還在，關掉分頁或按清除紀錄才會清掉。匯出前會把 IP 與 mDNS 名稱遮掉。結果貼回 issue #553。",
      export: "匯出紀錄",
      clearLog: "清除紀錄",
      reset: "重來",
      sdpRaw: "原始大小",
      sdpTrimmed: "精簡後",
      sdpGzip: "gzip",
      sdpBase64: "gzip 加 base64",
      sdpFrames: "換算 QR 張數（中檔）",
      sdpSeconds: "播完一輪",
      sdpCandidates: "連線候選行數",
      sdpCompact: "QR 用的欄位封包",
      sdpCompactFallback: "編不出來，QR 改放完整描述",
      noCompression: "這個瀏覽器沒有 CompressionStream",
      role: "角色",
      roleValueOfferer: "發起方",
      roleValueAnswerer: "回應方",
      connection: "連線",
      channel: "資料通道",
      channelIdle: "尚未建立",
      negotiate: "協定耗時",
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
      startTitle: "一、开始配对",
      start: "开始",
      startIdle: "每一台要连线的设备都按一次开始。不必先约定谁发起，谁先用相机扫到对方都可以。",
      selfLabel: "这台设备的代号：",
      roleOffer: "第二区是你的 QR code，让还没连上的设备扫。",
      roleAnswer: "扫到了 {peer}，第二区换成回应用的 QR code，让 {peer} 扫这一张就连上了。",
      localTitle: "二、你的 QR code",
      localHint: "按开始之后出现。让对方的相机对准这张 QR code，扫不了的话整段复制交给对方。",
      qrHint: "屏幕亮度调高，QR code 占对方画面一半以上最好读。",
      qrTooLarge: "这一次的描述太大，一张 QR code 装不下，请改用复制粘贴。",
      qrMissing: "QR code 组件没有加载，请改用复制粘贴。",
      copy: "复制",
      copied: "已复制。",
      copyManual: "浏览器不给用剪贴板，已经选起来，自己按复制。",
      remoteTitle: "三、扫对方的 QR code",
      remoteHint: "按开始之后相机会自动打开，扫到就自动套用。已经连上的设备会互相介绍，第三台以后只要跟其中任何一台互扫一次。相机不能用时，把对方交给你的整段贴进下面的框，按套用。",
      cameraLabel: "镜头",
      cameraBack: "后镜头，对准对方的屏幕",
      cameraFront: "前镜头，两部手机屏幕对屏幕",
      scan: "开始扫描",
      scanStop: "停止扫描",
      scanning: "扫描中，对准对方屏幕上的 QR code。",
      scanForeign: "扫到的 QR code 不是这一页产生的，继续对准对方的那一张。",
      scanUnsupported: "这个浏览器拿不到相机，请改用复制粘贴。",
      scanDenied: "相机权限被拒绝了。到浏览器设置允许这个网站使用相机，或改用复制粘贴。",
      scanNoCamera: "找不到可用的相机，请改用复制粘贴。",
      scanFailed: "相机开不起来，请改用复制粘贴。",
      scanBadPayload: "QR code 读到了但内容解不开，继续对准对方的那一张，或改用复制粘贴。",
      scanned: "扫到了，正在套用。",
      answerUsed: "这张回应用的 QR code 对应的那一张已经有别台用掉了。请对方重新扫你画面上现在那一张。",
      answerUnknown: "这张回应用的 QR code 不是给这台设备的。",
      scanAnswered: "扫到了 {peer}。第二区已经换成回应用的 QR code，让 {peer} 的相机对准它就连上了。",
      scanApplied: "套上了 {peer} 的回应，正在建立连线。第四区的数据通道变成 open 就连上了。",
      scanKnown: "已经连着 {peer}，不必再扫。",
      connectedTo: "已经连上 {peer}。",
      connectTimeout: "{peer} 超过 15 秒还没连上。这个网络可能挡掉设备之间的连线，或解析不到对方的 .local 名称。改用自己开的热点再试，或两台互换，由另一台先扫。",
      apply: "套用",
      badJson: "贴上的内容解不开，要整段贴，不要只贴中间几行。",
      connTitle: "四、连线状态",
      peersEmpty: "还没有连上任何设备。",
      peerDevice: "设备",
      peerVia: "怎么连上",
      viaQr: "扫 QR code",
      viaPaste: "复制粘贴",
      viaRelay: "经由 {peer} 介绍",
      transferTitle: "五、传一份东西过去",
      transferHint: "送给所有已经连上的设备。选一个文件，或用产生的测试数据。收到的一端会算 SHA-256 跟来源比对。",
      sendGenerated: "送出测试数据",
      sendFile: "送出这个文件",
      notConnected: "还没连上任何设备。",
      noFile: "还没选文件。",
      paramsHint: "下面几个参数用来比较吞吐量。每次只改一个，其余维持默认，两端的记录都会记下这一次用的参数。",
      chunkLabel: "每块大小",
      channelsLabel: "每条连线的通道数",
      linksLabel: "并行连线数",
      paramsHead: "参数",
      paramsValue: "{chunk} KB · {channels} 通道 · {links} 连线",
      linkShort: "{peer} 额外的连线没有开通，这一次只用 {n} 条。",
      prepLabel: "预先准备",
      prepNone: "不预先",
      prepOpen: "连上就开好连线",
      prepWarm: "开好连线并预热",
      dropLinks: "收掉额外的连线",
      dropped: "已收掉 {n} 条额外的连线，下一次送出或预先准备会重新开。",
      logTitle: "六、记录",
      logHint: "记录存在这个分页里，刷新后还在，关掉分页或按清除记录才会清掉。导出前会把 IP 与 mDNS 名称遮掉。结果贴回 issue #553。",
      export: "导出记录",
      clearLog: "清除记录",
      reset: "重来",
      sdpRaw: "原始大小",
      sdpTrimmed: "精简后",
      sdpGzip: "gzip",
      sdpBase64: "gzip 加 base64",
      sdpFrames: "换算 QR 张数（中档）",
      sdpSeconds: "播完一轮",
      sdpCandidates: "连线候选行数",
      sdpCompact: "QR 用的字段封包",
      sdpCompactFallback: "编不出来，QR 改放完整描述",
      noCompression: "这个浏览器没有 CompressionStream",
      role: "角色",
      roleValueOfferer: "发起方",
      roleValueAnswerer: "回应方",
      connection: "连线",
      channel: "数据通道",
      channelIdle: "尚未建立",
      negotiate: "协议耗时",
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
      startTitle: "1. Pair up",
      start: "Start",
      startIdle: "Press Start on every device that should join. Nobody has to go first; whichever device scans the other one first replies.",
      selfLabel: "This device's code: ",
      roleOffer: "Step 2 shows your QR code. Let any device that is not connected yet scan it.",
      roleAnswer: "Scanned {peer}. Step 2 now shows your reply code, and once {peer} scans it you are connected.",
      localTitle: "2. Your QR code",
      localHint: "It appears after you press Start. Point the other camera at this QR code, or copy the whole block across if scanning fails.",
      qrHint: "Turn the screen brightness up. The code reads best when it fills half of the other camera view.",
      qrTooLarge: "This description is too large for a single QR code. Use copy and paste this time.",
      qrMissing: "The QR code library did not load. Use copy and paste.",
      copy: "Copy",
      copied: "Copied.",
      copyManual: "The browser blocks clipboard access. The text is selected, copy it yourself.",
      remoteTitle: "3. Scan theirs",
      remoteHint: "The camera opens when you press Start and applies whatever it reads. Connected devices introduce each other, so from the third device on, one mutual scan with any member is enough. Without a camera, paste the block they handed you below and press Apply.",
      cameraLabel: "Camera",
      cameraBack: "Rear camera, aimed at their screen",
      cameraFront: "Front camera, two phones screen to screen",
      scan: "Start scanning",
      scanStop: "Stop scanning",
      scanning: "Scanning. Point the camera at the QR code on their screen.",
      scanForeign: "That QR code did not come from this page. Keep pointing at theirs.",
      scanUnsupported: "This browser cannot reach a camera. Use copy and paste.",
      scanDenied: "Camera permission was denied. Allow it for this site in the browser settings, or use copy and paste.",
      scanNoCamera: "No usable camera was found. Use copy and paste.",
      scanFailed: "The camera would not start. Use copy and paste.",
      scanBadPayload: "The QR code was read but would not decode. Keep pointing at theirs, or use copy and paste.",
      scanned: "Got it, applying.",
      answerUsed: "The code this reply answers was already used by another device. Ask them to scan the code on your screen now.",
      answerUnknown: "This reply code is meant for a different device.",
      scanAnswered: "Scanned {peer}. Step 2 now shows your reply code. Point the camera of {peer} at it to connect.",
      scanApplied: "Applied the reply from {peer}, connecting now. You are connected once the data channel in step 4 reads open.",
      scanKnown: "Already connected to {peer}, no need to scan again.",
      connectedTo: "Connected to {peer}.",
      connectTimeout: "{peer} has not connected after 15 seconds. This network may block traffic between devices, or the .local name of the other device does not resolve. Try again on a hotspot you run yourself, or swap roles and let the other device scan first.",
      apply: "Apply",
      badJson: "That text does not parse. Paste the whole block, not a few lines of it.",
      connTitle: "4. Connections",
      peersEmpty: "No devices connected yet.",
      peerDevice: "Device",
      peerVia: "Joined by",
      viaQr: "QR code",
      viaPaste: "Copy and paste",
      viaRelay: "Introduced by {peer}",
      transferTitle: "5. Send something across",
      transferHint: "Sends to every connected device. Pick a file, or use generated test data. Each receiving side checks SHA-256 against the source.",
      sendGenerated: "Send test data",
      sendFile: "Send this file",
      notConnected: "No devices connected yet.",
      noFile: "No file picked yet.",
      paramsHint: "The settings below are for comparing throughput. Change one at a time and leave the others at their defaults. Both sides log the settings used for each run.",
      chunkLabel: "Chunk size",
      channelsLabel: "Channels per connection",
      linksLabel: "Parallel connections",
      paramsHead: "Settings",
      paramsValue: "{chunk} KB · {channels} ch · {links} conn",
      linkShort: "The extra connections to {peer} did not open, this run uses {n}.",
      prepLabel: "Prepare",
      prepNone: "Nothing ahead",
      prepOpen: "Open connections on connect",
      prepWarm: "Open and warm up",
      dropLinks: "Drop extra connections",
      dropped: "Dropped {n} extra connections. The next send or prepare opens new ones.",
      logTitle: "6. Log",
      logHint: "The log is kept in this tab and survives a reload. Closing the tab or pressing Clear log removes it. IP addresses and mDNS names are masked on export. Post results back to issue #553.",
      export: "Export log",
      clearLog: "Clear log",
      reset: "Start over",
      sdpRaw: "Raw size",
      sdpTrimmed: "After trimming",
      sdpGzip: "gzip",
      sdpBase64: "gzip then base64",
      sdpFrames: "QR frames (medium)",
      sdpSeconds: "One full pass",
      sdpCandidates: "Candidate lines",
      sdpCompact: "Compact packet for the QR code",
      sdpCompactFallback: "Could not encode, the QR code carries the full description",
      noCompression: "This browser has no CompressionStream",
      role: "Side",
      roleValueOfferer: "Starter",
      roleValueAnswerer: "Responder",
      connection: "Connection",
      channel: "Data channel",
      channelIdle: "Not created",
      negotiate: "Negotiation",
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
    #webrtc-lab .wl-camera { font-size: 0.75rem; margin: 0.2rem 0.4rem 0.2rem 0; }
    #webrtc-lab .wl-param { display: inline-block; font-size: 0.72rem; margin: 0 0.8rem 0.4rem 0; }
    #webrtc-lab .wl-scroll { overflow-x: auto; }
    /* .md-button 與 .wl-video 自帶 display，會蓋過 hidden 屬性，按鈕與黑色的影像框就一直露著 */
    #webrtc-lab [hidden] { display: none !important; }
    #webrtc-lab .wl-scroll th, #webrtc-lab .wl-scroll td { text-align: left; white-space: nowrap; }
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

  // 多欄的表，第一列是欄名。每一台裝置一列。
  function grid(target, head, body) {
    target.innerHTML = "";
    if (head.length) {
      const tr = el("tr");
      head.forEach(function (text) { tr.appendChild(el("th", null, text)); });
      target.appendChild(tr);
    }
    body.forEach(function (cells) {
      const tr = el("tr");
      cells.forEach(function (text) { tr.appendChild(el("td", null, text)); });
      target.appendChild(tr);
    });
  }

  const style = el("style");
  style.textContent = CSS;
  root.appendChild(style);

  const startStep = step(t.startTitle);
  startStep.appendChild(el("p", "wl-hint", t.startIdle));
  const btnStart = button(t.start, function () { start(); });
  startStep.appendChild(btnStart);
  const selfState = el("p", "wl-state");
  selfState.hidden = true;
  startStep.appendChild(selfState);
  const roleState = el("p", "wl-state");
  startStep.appendChild(roleState);

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
  // 前鏡頭讓兩支手機螢幕對螢幕同時互掃，一來一回縮成一個動作。能不能對焦、多近讀得到，
  // 要在實機上量，所以做成選項並記在紀錄裡。筆電的鏡頭本來就在螢幕這一面，選哪個都一樣。
  const cameraBox = el("select", "wl-camera");
  cameraBox.setAttribute("aria-label", t.cameraLabel);
  [["environment", t.cameraBack], ["user", t.cameraFront]].forEach(function (pair) {
    const option = el("option", null, pair[1]);
    option.value = pair[0];
    cameraBox.appendChild(option);
  });
  cameraBox.addEventListener("change", function () {
    if (scan.stream) startScan();
  });
  remoteStep.appendChild(cameraBox);
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
  remoteStep.appendChild(button(t.apply, function () { handleRemote(remoteBox.value, "paste"); }));

  const connStep = step(t.connTitle);
  const connWrap = el("div", "wl-scroll");
  connStep.appendChild(connWrap);
  const connTable = table(connWrap);

  const sendStep = step(t.transferTitle);
  sendStep.appendChild(el("p", "wl-hint", t.transferHint));
  // 哪一種網路、哪幾台裝置，只有測的人知道，而測試矩陣要靠這一欄才填得起來。
  // 寫進 log 與匯出的檔案，回報時不必另外在 issue 補一段描述。
  const envBox = el("input");
  envBox.type = "text";
  envBox.className = "wl-env";
  envBox.placeholder = t.envPlaceholder;
  envBox.setAttribute("aria-label", t.envLabel);
  // 跟紀錄一樣存在分頁裡，重新整理後不必再填一次
  try {
    envBox.value = sessionStorage.getItem("webrtc-lab-env") || "";
  } catch (err) {
    // 分頁的儲存空間被停用
  }
  envBox.addEventListener("input", function () {
    try {
      sessionStorage.setItem("webrtc-lab-env", envBox.value);
    } catch (err) {
      // 同上
    }
  });
  sendStep.appendChild(envBox);
  // 傳輸參數，用來找吞吐量卡在哪裡。每次只改一個，數字才比得出差別。放在兩個送出按鈕前面，兩種送法都套用。
  sendStep.appendChild(el("p", "wl-hint", t.paramsHint));
  const paramsWrap = el("div", "wl-params");
  sendStep.appendChild(paramsWrap);
  function paramSelect(label, values, fallback, format) {
    const wrap = el("label", "wl-param", label + " ");
    const box = el("select");
    values.forEach(function (value) {
      const option = el("option", null, format(value));
      option.value = String(value);
      if (value === fallback) option.selected = true;
      box.appendChild(option);
    });
    wrap.appendChild(box);
    paramsWrap.appendChild(wrap);
    return box;
  }
  const kb = function (v) { return v / 1024 + " KB"; };
  const same = function (v) { return String(v); };
  const chunkBox = paramSelect(t.chunkLabel, [16384, 65536, 262144], CHUNK, kb);
  const channelsBox = paramSelect(t.channelsLabel, [1, 2, 4], 1, same);
  // 並行連線數預設 8 條。2026-09-25 iPhone 15 Pro 對 Mac Chrome 154，在家用 Wi-Fi 6（5 GHz）上
  // 實測：iPhone 送出時 3 條每秒約 18 MB、6 條約 30 MB、8 條約 37 MB、12 條約 41 MB，每條連線
  // 分到的越來越少，在每秒 40 MB 上下到頂。Mac 送出從 3 條起就停在每秒 48 到 55 MB，是網路的上限。
  // 12 條只比 8 條快一成，剛開好時的第一次傳輸卻慢最多，所以停在 8 條。
  const linksBox = paramSelect(t.linksLabel, [1, 2, 3, 4, 6, 8, 12], 8, same);
  // 剛開好額外連線後的第一次傳輸明顯偏慢（12 條時 100 MB 從 2 秒變 9 秒）。這個選項用來找原因：
  // 只是連線還沒開好，還是新連線要先有資料流過。
  const prepBox = paramSelect(t.prepLabel, ["none", "open", "warm"], "none", function (v) {
    return { none: t.prepNone, open: t.prepOpen, warm: t.prepWarm }[v];
  });
  [prepBox, linksBox, channelsBox].forEach(function (box) {
    box.addEventListener("change", function () { prepAll(); });
  });
  // 換一種預先準備的模式再量「剛開好的連線」，不必重新整理、也不必重新配對
  const dropWrap = el("div");
  dropWrap.appendChild(button(t.dropLinks, function () { dropAllLinks(); }));
  sendStep.appendChild(dropWrap);
  const sizeBox = el("select");
  [
    ["102400", "100 KB"],
    ["1048576", "1 MB"],
    ["5242880", "5 MB"],
    ["20971520", "20 MB"],
    ["104857600", "100 MB"],
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
  const sendNote = el("p", "wl-state");
  sendStep.appendChild(sendNote);
  const sendWrap = el("div", "wl-scroll");
  sendStep.appendChild(sendWrap);
  const sendTable = table(sendWrap);

  const logStep = step(t.logTitle);
  logStep.appendChild(el("p", "wl-hint", t.logHint));
  logStep.appendChild(button(t.export, exportLog));
  logStep.appendChild(button(t.clearLog, clearLog));
  logStep.appendChild(button(t.reset, function () { location.reload(); }));
  const logBox = el("pre", "wl-log");
  logStep.appendChild(logBox);

  // ---------------------------------------------------------------- 狀態

  // 紀錄存在這個分頁的 sessionStorage，重新整理不會消失，關掉分頁或按「清除紀錄」才清掉。
  // 只存在這台裝置上，裡面的位址只有類別，候選與描述的明碼位址不進紀錄。
  const LOG_KEY = "webrtc-lab-log";
  const log = loadLog();
  // 每一條連線一筆。兩台同時掃到對方時，同一台對方裝置會短暫有兩筆，開通後只留一筆。
  const peers = [];
  const pool = [];
  let starting = null;
  let startedAt = 0;
  let cert = null;
  // 這台裝置的代號，也就是共用憑證的 SHA-256 指紋（64 個十六進位字元）。
  // 瀏覽器不給產生憑證時改用亂數，那樣就無法跟 DTLS 指紋互相比對。
  let selfId = null;
  // 第二區顯示的是哪一條連線的描述。有人在等回應時放回應描述，否則放自己的發起描述。
  let shownOffer = null;
  let shownAnswer = null;
  let displayed = null;
  // 傳輸結果，每一台一列
  const results = new Map();

  function loadLog() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(LOG_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (err) {
      return [];
    }
  }

  function saveLog() {
    try {
      sessionStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch (err) {
      // 分頁的儲存空間滿了或被停用，紀錄照樣留在記憶體裡，只是重新整理會不見
    }
  }

  function renderLog() {
    logBox.textContent = log.map(function (row) { return JSON.stringify(row); }).join("\n");
  }

  function record(event, data) {
    log.push(Object.assign({ at: new Date().toISOString(), event: event }, data || {}));
    saveLog();
    renderLog();
  }

  function clearLog() {
    log.length = 0;
    saveLog();
    renderLog();
  }

  function fill(text, vars) {
    return text.replace(/\{(\w+)\}/g, function (all, key) {
      return vars[key] === undefined ? all : vars[key];
    });
  }

  // 畫面與紀錄只用前四個字元，夠在同一個現場分辨幾台裝置，也不把完整指紋寫進匯出檔
  function short(id) {
    return id ? id.slice(0, 4).toUpperCase() : "?";
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

  async function showSdpStats(desc, context) {
    const sdp = desc.sdp;
    const raw = new TextEncoder().encode(sdp).length;
    const trimmed = new TextEncoder().encode(trimSdp(sdp)).length;
    const packed = await gzipSize(trimSdp(sdp));
    const forQr = packed ? packed.base64 : trimmed;
    const frames = Math.ceil(forQr / QR_PAYLOAD_MEDIUM) + 1;
    const secs = (frames / QR_FRAMES_PER_SECOND).toFixed(1);
    const candidates = (sdp.match(/^a=candidate/gm) || []).length;
    // mDNS 名稱與明碼位址各幾個。預先建好的連線應該只有前者，後者出現代表那一條是開相機之後才建的
    const mdns = (sdp.match(/^a=candidate:\S+ \d+ \S+ \d+ \S+\.local /gm) || []).length;
    const compact = encodeCompact(desc);
    rows(sdpTable, [
      [t.sdpRaw, raw + " B"],
      [t.sdpTrimmed, trimmed + " B"],
      [t.sdpGzip, packed ? packed.gzip + " B" : t.noCompression],
      [t.sdpBase64, packed ? packed.base64 + " B" : "n/a"],
      [t.sdpFrames, frames + " " + t.frames],
      [t.sdpSeconds, secs + " " + t.seconds],
      [t.sdpCandidates, String(candidates)],
      [t.sdpCompact, compact.bytes ? compact.bytes.length + " B" : t.sdpCompactFallback],
    ]);
    // 被濾掉的候選只記原因與個數，不記位址
    record("sdp-stats", Object.assign({
      raw: raw,
      trimmed: trimmed,
      gzip: packed ? packed.gzip : null,
      base64: packed ? packed.base64 : null,
      qrFrames: frames,
      qrSeconds: Number(secs),
      candidates: candidates,
      mdns: mdns,
      compact: compact.bytes ? compact.bytes.length : null,
      compactError: compact.error || null,
      compactKept: compact.kept,
      compactDropped: compact.dropped,
    }, context || {}));
  }

  // 匯出前把位址遮掉。候選那幾行帶著本機 IP 或 mDNS 名稱，兩者都指得回裝置。
  function maskSdp(sdp) {
    return sdp
      .replace(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.local/gi, "<mdns>.local")
      .replace(/\b\d{1,3}(\.\d{1,3}){3}\b/g, "<ipv4>")
      .replace(/\b(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}\b/gi, "<ipv6>");
  }

  // ---------------------------------------------------------------- 連線

  function createPc() {
    // iceServers 留空是刻意的。這個實驗只處理同一個區網，連得上就是靠 host candidate，
    // 連不上就代表那個網路擋掉裝置之間的連線，而那正是要量的東西。
    const config = { iceServers: [] };
    if (cert) config.certificates = [cert];
    return new RTCPeerConnection(config);
  }

  function takePc() {
    if (pool.length) return pool.shift();
    record("pool-empty", {});
    return createPc();
  }

  function fingerprintOf(sdp) {
    const found = /^a=fingerprint:sha-256 ([0-9a-f:]+)\s*$/im.exec(sdp || "");
    return found ? found[1].replace(/:/g, "").toLowerCase() : null;
  }

  function randomId() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.prototype.map.call(bytes, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function plain(desc) {
    return { type: desc.type, sdp: desc.sdp };
  }

  function relayDesc(desc) {
    return { type: desc.type, sdp: filterCandidates(desc.sdp) };
  }

  // fp 是這條連線對方描述裡的 DTLS 指紋，id 是對方開通後自己報的代號，expect 是經由介紹
  // 建立時預期的代號。三者在共用憑證的裝置上是同一個值。
  // 回應方用新建的連線，不從預先建好的那一批拿。回應方剛用相機掃到對方，新建的連線會交出
  // 明碼的區網位址，每一對裝置就至少有一邊帶明碼位址。兩邊都只有 mDNS 名稱時，連不連得上
  // 取決於這個網路能不能解析 .local，2026-09-25 Mac Brave 對 iPhone 的實測就卡在這裡。
  // 交出去的候選仍然濾掉 Tailscale 與 TCP。相機打不開的裝置，新建的連線一樣只有 mDNS 名稱。
  function addPeer(role, via) {
    const peer = {
      pc: role === "answerer" ? createPc() : takePc(),
      channel: null,
      role: role,
      via: via,
      relay: null,
      fp: null,
      id: null,
      expect: null,
      tag: null,
      answerFor: null,
      remoteUfrag: null,
      createdAt: performance.now(),
      appliedAt: 0,
      openedAt: 0,
      pair: null,
      closed: false,
      bound: false,
      // 傳輸用的通道與額外的連線，見「傳輸參數」
      bulk: [],
      links: [],
      linksIn: [],
      waiters: new Map(),
      // 同一台的開連線與傳輸排隊進行。接收端一次只收一份，兩份交錯會互相蓋掉
      queue: Promise.resolve(),
      laneLock: Promise.resolve(),
      incoming: null,
    };
    peer.pc.addEventListener("connectionstatechange", function () {
      const state = peer.pc.connectionState;
      if (state === "failed" || state === "closed") closePeer(peer, state);
      renderPeers();
    });
    peer.pc.addEventListener("datachannel", function (event) {
      if (event.channel.label === "bulk") {
        wireBulk(peer, event.channel);
        return;
      }
      peer.channel = event.channel;
      wireChannel(peer);
    });
    peers.push(peer);
    return peer;
  }

  function isOpen(peer) {
    return !peer.closed && !!peer.channel && peer.channel.readyState === "open";
  }

  function peerKey(peer) {
    return peer.id || peer.fp || peer.expect;
  }

  function wireChannel(peer) {
    const channel = peer.channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = BUFFER_LOW;
    channel.addEventListener("open", function () { onOpen(peer); });
    channel.addEventListener("close", function () { closePeer(peer, "channel-close"); });
    channel.addEventListener("message", function (event) { onMessage(peer, event); });
  }

  function onOpen(peer) {
    peer.openedAt = performance.now();
    // 握手耗時原本只有一個數字，而那個數字裡面裝著人類複製貼上的時間。實測有一筆
    // 記到 160 秒，協定本身其實不到一秒。拆成兩段才比對得了 issue #553 的門檻。
    //
    // 起點是這條連線開始被用到的時候：發起方是發起描述放上畫面，回應方是掃到對方。
    // negotiateMs 只有發起方那一側準確。回應方是把描述交回去之後，對方套用的那
    // 一刻才開通，中間同樣夾著人工。sinceStartMs 從按下開始算，一群裝置全部連上要多久看這個。
    record("datachannel-open", {
      peer: short(peerKey(peer)),
      role: peer.role,
      via: peer.via,
      handshakeMs: Math.round(peer.openedAt - peer.createdAt),
      negotiateMs: peer.appliedAt ? Math.round(peer.openedAt - peer.appliedAt) : null,
      handoverMs: peer.appliedAt ? Math.round(peer.appliedAt - peer.createdAt) : null,
      sinceStartMs: Math.round(peer.openedAt - startedAt),
    });
    sendControl(peer, { kind: "hello", id: selfId, bound: !!cert });
    if (peer.via !== "relay") scanState.textContent = fill(t.connectedTo, { peer: short(peerKey(peer)) });
    if (peer === shownAnswer) {
      shownAnswer = null;
      refreshDisplay();
    }
    renderPeers();
    // 候選對在開通的當下不一定選好了，等一秒再記。host 或別的類型決定了這條路
    // 在真實網路裡是怎麼通的，經由介紹的連線也要看它是不是一樣走區網直連。
    setTimeout(async function () {
      peer.pair = await selectedPair(peer);
      if (peer.pair) record("candidate-pair", Object.assign({ peer: short(peerKey(peer)), via: peer.via }, peer.pair));
      renderPeers();
    }, 1000);
  }

  function closePeer(peer, reason) {
    if (peer.closed) return;
    peer.closed = true;
    if (peer.fp || peer.expect) record("peer-closed", { peer: short(peerKey(peer)), reason: reason });
    [peer.pc].concat(peer.links.map(function (l) { return l.pc; }), peer.linksIn).forEach(function (pc) {
      try {
        pc.close();
      } catch (err) {
        // 已經關掉了
      }
    });
    peer.waiters.forEach(function (resolve) { resolve(null); });
    // 關掉的那一台之後可能重新顯示同一張 QR code，要讓相機能再認一次
    scan.seen.clear();
    if (peer === shownAnswer) {
      shownAnswer = null;
      refreshDisplay();
    }
    if (peer === shownOffer) {
      shownOffer = null;
      showNextOffer();
    }
    renderPeers();
  }

  // 候選位址的類別。只回類別，位址本身不進紀錄。瀏覽器不給位址（遠端的 mDNS 候選常常是這樣）時回 unknown。
  function addressClass(candidate) {
    const addr = candidate && (candidate.address || candidate.ip);
    if (!addr) return "unknown";
    if (/\.local$/i.test(addr)) return "mdns";
    const v4 = parseIPv4(addr);
    if (v4) {
      if (v4[0] === 100 && (v4[1] & 0xc0) === 64) return "cgnat";
      if (v4[0] === 10 || (v4[0] === 172 && (v4[1] & 0xf0) === 16) || (v4[0] === 192 && v4[1] === 168)) return "lan";
      if (v4[0] === 169 && v4[1] === 254) return "link-local";
      if (v4[0] === 127) return "loopback";
      return "public";
    }
    const v6 = parseIPv6(addr);
    if (v6) {
      const reason = dropReason(CK_V6, v6);
      if (reason) return reason;
      if ((v6[0] & 0xfe) === 0xfc) return "ula";
      return "public";
    }
    return "unknown";
  }

  // 走的是同網段的 host 還是別的類型，決定了這條路在真實網路裡是怎麼通的。
  async function selectedPair(peer) {
    if (!peer.pc.getStats) return null;
    try {
      const stats = await peer.pc.getStats();
      let pair = null;
      stats.forEach(function (report) {
        if (report.type === "candidate-pair" && report.state === "succeeded" && report.nominated) {
          pair = report;
        }
      });
      if (!pair) return null;
      const local = stats.get(pair.localCandidateId);
      const remote = stats.get(pair.remoteCandidateId);
      // 往返時間拿來判斷吞吐量卡在哪裡。SCTP 一次能在路上的資料有上限，往返越久，每秒送得出去的越少。
      // 位址只記類別，用來確認流量走的是區網，而不是 Tailscale 之類的通道。
      return {
        local: local ? local.candidateType : "?",
        remote: remote ? remote.candidateType : "?",
        localNet: addressClass(local),
        remoteNet: addressClass(remote),
        localNetworkType: local && local.networkType ? local.networkType : null,
        rttMs: typeof pair.currentRoundTripTime === "number" ? Math.round(pair.currentRoundTripTime * 1000) : null,
      };
    } catch (err) {
      return null;
    }
  }

  function viaLabel(peer) {
    if (peer.via === "relay") return fill(t.viaRelay, { peer: short(peer.relay && peer.relay.id) });
    return peer.via === "paste" ? t.viaPaste : t.viaQr;
  }

  // 還沒有對象的發起描述（畫面上那一張）不列出來，列的是已經知道對方是誰的連線。
  // 手機上表格要橫向捲動，資料通道與連線狀態緊跟在裝置代號後面，不捲也看得到有沒有連上。
  function renderPeers() {
    const list = peers.filter(function (p) { return !p.closed && peerKey(p); });
    if (!list.length) {
      grid(connTable, [], [[t.peersEmpty]]);
      return;
    }
    grid(
      connTable,
      [t.peerDevice, t.channel, t.connection, t.peerVia, t.role, t.negotiate, t.pair],
      list.map(function (p) {
        return [
          short(peerKey(p)),
          p.channel ? p.channel.readyState : t.channelIdle,
          p.pc.connectionState,
          viaLabel(p),
          p.role === "offerer" ? t.roleValueOfferer : t.roleValueAnswerer,
          p.openedAt && p.appliedAt ? Math.round(p.openedAt - p.appliedAt) + " ms" : "",
          p.pair ? p.pair.local + " / " + p.pair.remote : t.pairIdle,
        ];
      })
    );
  }

  function sendControl(peer, msg) {
    if (isOpen(peer)) peer.channel.send(JSON.stringify(msg));
  }

  // ---------------------------------------------------------------- 互相介紹

  // 開通之後對方報上代號。共用憑證的裝置，代號就是 DTLS 指紋，對不上代表描述或介紹的
  // 過程出了問題，這一條不留。
  function onHello(peer, msg) {
    if (peer.closed) return;
    const id = typeof msg.id === "string" && /^[0-9a-f]{64}$/.test(msg.id) ? msg.id : null;
    const mismatch = !id || id === selfId || (msg.bound && peer.fp && id !== peer.fp) || (peer.expect && id !== peer.expect);
    if (mismatch) {
      record("hello-mismatch", { peer: short(peer.fp), via: peer.via });
      closePeer(peer, "mismatch");
      return;
    }
    peer.id = id;
    peer.bound = !!msg.bound;
    record("hello", { peer: short(id), bound: !!msg.bound, via: peer.via });
    settleTwins(id);
    if (!peer.closed) {
      broadcastPeers();
      prepPeer(peer);
    }
    renderPeers();
  }

  // 兩台同時掃到對方，會各自回應對方的發起描述，於是同一對裝置之間有兩條連線。兩邊照
  // 同一條規則挑：留下發起方代號比較小的那一條。規則在兩邊算出來指的是同一條，不必再協調。
  // 留下的那一條還沒開通時，另一條先用著，等它開通再換。
  function settleTwins(id) {
    const same = peers.filter(function (p) { return !p.closed && peerKey(p) === id; });
    if (same.length < 2) return;
    const canonical = same.find(function (p) { return p.openedAt && (p.role === "offerer") === (selfId < id); });
    const keep = canonical || same.find(function (p) { return p.openedAt; });
    if (!keep) return;
    same.forEach(function (p) {
      if (p !== keep && (p.openedAt || canonical)) closePeer(p, "duplicate");
    });
  }

  function openIds() {
    return peers.filter(function (p) { return isOpen(p) && p.id; }).map(function (p) { return p.id; });
  }

  // 每次確認了一條新連線的對方是誰，就把自己連著的裝置清單告訴每一台
  function broadcastPeers() {
    const ids = openIds();
    peers.forEach(function (p) {
      if (isOpen(p) && p.id) sendControl(p, { kind: "peers", peers: ids });
    });
  }

  function knows(id) {
    return peers.some(function (p) { return !p.closed && (p.id === id || p.fp === id || p.expect === id); });
  }

  // 清單裡還沒連上的裝置，由代號比較小的一方發起，描述交給送清單來的那一台轉過去。
  // 對方也從同一台收到含有自己的清單，所以兩邊都知道要連，只有一邊動手。
  function onPeers(from, msg) {
    if (!from.id || !Array.isArray(msg.peers)) return;
    msg.peers.forEach(function (id) {
      if (typeof id !== "string" || !/^[0-9a-f]{64}$/.test(id)) return;
      if (id === selfId || knows(id)) return;
      if (selfId < id) introduce(from, id);
    });
  }

  async function introduce(via, id) {
    const peer = addPeer("offerer", "relay");
    peer.expect = id;
    peer.relay = via;
    record("relay-offer", { peer: short(id), relay: short(via.id) });
    await makeOffer(peer);
    sendControl(via, { kind: "relay", to: id, from: selfId, desc: relayDesc(peer.pc.localDescription) });
    renderPeers();
  }

  // 轉交的描述走的是已經驗過指紋的 DataChannel，中間只經過介紹的那一台。
  // 只轉一手，介紹的那一台同時連著兩邊，而且只轉它自己的鄰居送來、署名是鄰居本人的描述。
  async function onRelay(from, msg) {
    if (!from.id || typeof msg.to !== "string" || typeof msg.from !== "string") return;
    const desc = msg.desc;
    if (!desc || typeof desc.sdp !== "string") return;
    if (msg.to !== selfId) {
      const next = peers.find(function (p) { return isOpen(p) && p.id === msg.to; });
      if (next && msg.from === from.id) sendControl(next, msg);
      return;
    }
    if (desc.type === "offer") {
      if (knows(msg.from)) return;
      const peer = addPeer("answerer", "relay");
      peer.expect = msg.from;
      peer.relay = from;
      peer.fp = fingerprintOf(desc.sdp);
      await peer.pc.setRemoteDescription(plain(desc));
      peer.appliedAt = performance.now();
      await peer.pc.setLocalDescription(await peer.pc.createAnswer());
      await waitForGathering(peer.pc);
      record("relay-answer", { peer: short(msg.from), relay: short(from.id) });
      sendControl(from, { kind: "relay", to: msg.from, from: selfId, desc: relayDesc(peer.pc.localDescription) });
    } else if (desc.type === "answer") {
      const peer = peers.find(function (p) {
        return !p.closed && p.via === "relay" && p.role === "offerer" && p.expect === msg.from && !p.pc.remoteDescription;
      });
      if (!peer) return;
      peer.fp = fingerprintOf(desc.sdp);
      await peer.pc.setRemoteDescription(plain(desc));
      peer.appliedAt = performance.now();
      watchConnect(peer);
    }
    renderPeers();
  }

  // 只在套上回應的那一邊計時。回應方交出描述之後，要等對方拿去套用，中間夾著人工，
  // 沒辦法判斷多久算太久。
  function watchConnect(peer) {
    setTimeout(function () {
      if (peer.closed || peer.openedAt) return;
      record("connect-timeout", {
        peer: short(peerKey(peer)),
        via: peer.via,
        ice: peer.pc.iceConnectionState,
        connection: peer.pc.connectionState,
      });
      if (peer.via !== "relay") scanState.textContent = fill(t.connectTimeout, { peer: short(peerKey(peer)) });
      closePeer(peer, "timeout");
    }, CONNECT_TIMEOUT_MS);
  }

  // 候選蒐集完成才把描述交出去。實驗階段不做 trickle，那需要一條雙向且持續的通道，
  // 而手動貼上與 QR 都只能一次過一份。經由介紹的連線走 DataChannel，本來可以 trickle，
  // 為了少一條程式路徑一樣等蒐集完成，預先建好的連線只有一個 mDNS 候選，很快就蒐集完。
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

  // ---------------------------------------------------------------- 只帶欄位的封包

  // compact-codec-begin。tools/webrtc-lab/test_compact.mjs 把這一段到 compact-codec-end
  // 原地抽出來測，改格式時兩邊一起看。
  //
  // 格式版本 2 接在 PACK_MAGIC 與版本號後面：
  //   1 byte   旗標：bit0 是 answer、bit1 是 setup:passive、bit2 帶 mid、bit3 帶 max-message-size、
  //            bit4 帶回應標記
  //   ice-ufrag 與 ice-pwd 各一段：1 byte 標頭加內容。標頭 bit7 表示用 base64 字母表壓過，
  //            低 7 bit 是字元數。沒壓的話內容就是原字串，低 7 bit 是位元組數
  //   32 bytes DTLS 指紋，SHA-256 的原始位元組
  //   mid              旗標 bit2 才有：1 byte 長度加字串
  //   max-message-size 旗標 bit3 才有：4 bytes
  //   回應標記          旗標 bit4 才有，只出現在 answer：2 bytes，見 iceTag
  //   1 byte   候選數。每個候選是 1 byte 種類、位址、2 bytes port。種類 0 是 mDNS 名稱
  //            （UUID 16 bytes），4 是 IPv4，6 是 IPv6，255 是其他主機名稱（1 byte 長度加字串）
  const CF_ANSWER = 1;
  const CF_PASSIVE = 2;
  const CF_MID = 4;
  const CF_MAXMSG = 8;
  const CF_TAG = 16;
  const CK_MDNS = 0;
  const CK_V4 = 4;
  const CK_V6 = 6;
  const CK_NAME = 255;
  const COMPACT_MID = "0";
  // 樣板寫的訊息上限。Chrome 宣告的就是這個值，Firefox 宣告 1073741823。對方的上限比較大時
  // 照這個值送只是保守一點，分塊是 64 KB 不受影響。比較小才需要帶上。
  const COMPACT_MAXMSG = 262144;
  const ICE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const MDNS_UUID = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\.local$/i;

  function parseIPv4(text) {
    const parts = text.split(".");
    if (parts.length !== 4) return null;
    const out = [];
    for (let i = 0; i < 4; i += 1) {
      if (!/^\d{1,3}$/.test(parts[i]) || Number(parts[i]) > 255) return null;
      out.push(Number(parts[i]));
    }
    return out;
  }

  // 內嵌 IPv4 的寫法與帶 zone 的位址不處理，當成主機名稱照原樣送
  function parseIPv6(text) {
    if (text.indexOf(":") < 0 || /[.%]/.test(text)) return null;
    const halves = text.split("::");
    if (halves.length > 2) return null;
    const head = halves[0] ? halves[0].split(":") : [];
    const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
    const fill = 8 - head.length - tail.length;
    if (halves.length === 1 ? fill !== 0 : fill < 1) return null;
    const groups = head.concat(new Array(halves.length === 2 ? fill : 0).fill("0"), tail);
    const out = [];
    for (let i = 0; i < groups.length; i += 1) {
      if (!/^[0-9a-f]{1,4}$/i.test(groups[i])) return null;
      const n = parseInt(groups[i], 16);
      out.push(n >> 8, n & 0xff);
    }
    return out;
  }

  function formatIPv6(bytes) {
    const groups = [];
    for (let i = 0; i < 16; i += 2) groups.push(((bytes[i] << 8) | bytes[i + 1]).toString(16));
    return groups.join(":");
  }

  // 離線現場用不到、而且會把流量引進 VPN 的位址，不交給對方。
  // 100.64.0.0/10 是 CGNAT，Tailscale 也用這一段。fd7a:115c:a1e0::/48 是 Tailscale 的 IPv6。
  function dropReason(kind, addr) {
    if (kind === CK_V4) {
      if (addr[0] === 100 && (addr[1] & 0xc0) === 64) return "cgnat";
      if (addr[0] === 127) return "loopback";
      if (addr[0] === 169 && addr[1] === 254) return "link-local";
    } else if (kind === CK_V6) {
      const tailscale = [0xfd, 0x7a, 0x11, 0x5c, 0xa1, 0xe0];
      if (tailscale.every(function (b, i) { return addr[i] === b; })) return "tailscale";
      if (addr[0] === 0xfe && (addr[1] & 0xc0) === 0x80) return "link-local";
      if (addr.slice(0, 15).every(function (b) { return b === 0; }) && addr[15] === 1) return "loopback";
    }
    return null;
  }

  // ice-char 的字元集正好是 base64 的字母表，長度是 4 的倍數時每 4 個字元無損壓成 3 個位元組。
  // Chrome 的 ufrag 4 字、pwd 24 字，Firefox 的 8 與 32 個十六進位字元都符合。
  function packIce(text) {
    if (text.length % 4 === 0 && /^[A-Za-z0-9+/]+$/.test(text)) {
      if (text.length > 124) return null;
      const out = [0x80 | text.length];
      for (let i = 0; i < text.length; i += 4) {
        const n = (ICE_ALPHABET.indexOf(text[i]) << 18) | (ICE_ALPHABET.indexOf(text[i + 1]) << 12) |
          (ICE_ALPHABET.indexOf(text[i + 2]) << 6) | ICE_ALPHABET.indexOf(text[i + 3]);
        out.push((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
      }
      return out;
    }
    const raw = Array.from(new TextEncoder().encode(text));
    return raw.length > 127 ? null : [raw.length].concat(raw);
  }

  // 回應描述對應的是哪一張發起描述。發起方可能有一張在畫面上、幾張已經被掃走，同一張也
  // 可能被兩台同時掃到，靠這兩個位元組分辨掃回來的回應是給哪一條連線的。取發起描述
  // ice-ufrag 的 FNV-1a 雜湊折成 16 位元。只用來分流，身分仍然靠 DTLS 指紋。
  function iceTag(ufrag) {
    let h = 0x811c9dc5;
    for (let i = 0; i < ufrag.length; i += 1) {
      h ^= ufrag.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return (h ^ (h >>> 16)) & 0xffff;
  }

  function sdpAttr(sdp, name) {
    const found = sdp.match(new RegExp("^a=" + name + ":(.*)$", "m"));
    return found ? found[1].trim() : null;
  }

  // 一行 a=candidate 拆成種類、位址與 port。不交給對方的候選帶 reason：
  // 不是 UDP、不是 host，或是 dropReason 列的那幾種位址。
  function parseCandidate(line) {
    const f = line.slice(12).split(" ");
    let reason = null;
    let kind = CK_NAME;
    let addr = null;
    if (f.length < 8 || f[1] !== "1") reason = "other";
    else if (f[2].toLowerCase() !== "udp") reason = f[2].toLowerCase();
    else if (f[7] !== "host") reason = f[7];
    else {
      const uuid = f[4].match(MDNS_UUID);
      if (uuid) {
        kind = CK_MDNS;
        addr = uuid.slice(1).join("").match(/../g).map(function (h) { return parseInt(h, 16); });
      } else if ((addr = parseIPv4(f[4]))) {
        kind = CK_V4;
      } else if ((addr = parseIPv6(f[4]))) {
        kind = CK_V6;
      } else {
        addr = Array.from(new TextEncoder().encode(f[4]));
        if (addr.length > 255) reason = "other";
      }
      reason = reason || dropReason(kind, addr);
    }
    return { reason: reason, kind: kind, addr: addr, port: Number(f[5]), priority: Number(f[3]) };
  }

  // 經由介紹轉交的完整描述也照 QR 的規則濾候選，不把 Tailscale 與 TCP 的位址交出去。
  // 全部被濾掉就原樣送，跟 encodeCompact 退回完整描述的道理相同。
  function filterCandidates(sdp) {
    const lines = sdp.split("\r\n");
    const kept = lines.filter(function (line) {
      return line.indexOf("a=candidate:") !== 0 || !parseCandidate(line).reason;
    });
    const any = kept.some(function (line) { return line.indexOf("a=candidate:") === 0; });
    return any ? kept.join("\r\n") : sdp;
  }

  // 編不出來時回 error，呼叫的一端退回格式版本 1。kept 與 dropped 只記個數與原因。
  // answer 帶著 for（iceTag 算出來的數字）時一起編進去，offer 帶了也不理。
  function encodeCompact(desc) {
    const dropped = {};
    let kept = 0;
    function fail(reason) { return { error: reason, kept: kept, dropped: dropped }; }
    const sdp = desc && desc.sdp ? desc.sdp : "";
    const media = sdp.match(/^m=.*$/gm) || [];
    if (media.length !== 1 || !/^m=application \d+ UDP\/DTLS\/SCTP webrtc-datachannel/.test(media[0])) {
      return fail("media");
    }
    const ufrag = sdpAttr(sdp, "ice-ufrag");
    const pwd = sdpAttr(sdp, "ice-pwd");
    const fingerprint = (sdpAttr(sdp, "fingerprint") || "").split(/\s+/);
    const setup = sdpAttr(sdp, "setup");
    const mid = sdpAttr(sdp, "mid") || COMPACT_MID;
    const maxmsg = Number(sdpAttr(sdp, "max-message-size") || COMPACT_MAXMSG);
    if (!ufrag || !pwd || !setup) return fail("field");
    if (fingerprint[0].toLowerCase() !== "sha-256" || !/^([0-9a-f]{2}:){31}[0-9a-f]{2}$/i.test(fingerprint[1] || "")) {
      return fail("fingerprint");
    }
    const ufragBytes = packIce(ufrag);
    const pwdBytes = packIce(pwd);
    if (!ufragBytes || !pwdBytes) return fail("ice");
    const midBytes = Array.from(new TextEncoder().encode(mid));
    if (midBytes.length > 255) return fail("mid");

    let flags = 0;
    if (desc.type === "answer") {
      flags |= CF_ANSWER;
      if (setup === "passive") flags |= CF_PASSIVE;
      else if (setup !== "active") return fail("setup");
    } else if (desc.type !== "offer" || setup !== "actpass") {
      return fail("setup");
    }
    if (mid !== COMPACT_MID) flags |= CF_MID;
    // 0 代表沒有上限，跟比樣板大一樣不必帶
    if (maxmsg > 0 && maxmsg < COMPACT_MAXMSG) flags |= CF_MAXMSG;
    const tag = desc.type === "answer" && Number.isInteger(desc.for) && desc.for >= 0 && desc.for <= 0xffff ? desc.for : null;
    if (tag !== null) flags |= CF_TAG;

    const out = [PACK_MAGIC[0], PACK_MAGIC[1], PACK_COMPACT, flags].concat(ufragBytes, pwdBytes);
    fingerprint[1].split(":").forEach(function (h) { out.push(parseInt(h, 16)); });
    if (flags & CF_MID) out.push.apply(out, [midBytes.length].concat(midBytes));
    if (flags & CF_MAXMSG) out.push((maxmsg >>> 24) & 0xff, (maxmsg >>> 16) & 0xff, (maxmsg >>> 8) & 0xff, maxmsg & 0xff);
    if (flags & CF_TAG) out.push(tag >> 8, tag & 0xff);

    // 只留 UDP 的 host，照原本的 priority 由高到低排，解碼端依順序重新給 priority
    const cands = [];
    sdp.split(/\r?\n/).forEach(function (line) {
      if (line.indexOf("a=candidate:") !== 0) return;
      const c = parseCandidate(line);
      if (c.reason) {
        dropped[c.reason] = (dropped[c.reason] || 0) + 1;
        return;
      }
      cands.push(c);
    });
    kept = cands.length;
    // 全部被濾掉就退回完整描述，照原本的候選交出去，至少不比格式版本 1 差
    if (kept === 0 || kept > 255) return fail("candidates");
    cands.sort(function (a, b) { return b.priority - a.priority; });
    out.push(kept);
    cands.forEach(function (c) {
      out.push(c.kind);
      if (c.kind === CK_NAME) out.push(c.addr.length);
      out.push.apply(out, c.addr);
      out.push((c.port >> 8) & 0xff, c.port & 0xff);
    });
    return { bytes: new Uint8Array(out), kept: kept, dropped: dropped };
  }

  // 解不開就丟出例外，由 unpackDescription 回報成 corrupt
  function decodeCompact(bytes) {
    let at = 4;
    function take(n) {
      if (at + n > bytes.length) throw new Error("truncated");
      const part = bytes.subarray(at, at + n);
      at += n;
      return part;
    }
    function hex(b) { return (b < 16 ? "0" : "") + b.toString(16); }
    function readIce() {
      const head = take(1)[0];
      const len = head & 0x7f;
      if (!(head & 0x80)) return new TextDecoder().decode(take(len));
      if (len % 4) throw new Error("ice length");
      const body = take((len / 4) * 3);
      let text = "";
      for (let i = 0; i < body.length; i += 3) {
        const n = (body[i] << 16) | (body[i + 1] << 8) | body[i + 2];
        text += ICE_ALPHABET[(n >> 18) & 63] + ICE_ALPHABET[(n >> 12) & 63] + ICE_ALPHABET[(n >> 6) & 63] + ICE_ALPHABET[n & 63];
      }
      return text;
    }
    const flags = bytes[3];
    if (flags & 0xe0) throw new Error("flags");
    if ((flags & CF_TAG) && !(flags & CF_ANSWER)) throw new Error("flags");
    const ufrag = readIce();
    const pwd = readIce();
    const fingerprint = Array.from(take(32)).map(function (b) { return hex(b).toUpperCase(); }).join(":");
    let mid = COMPACT_MID;
    if (flags & CF_MID) mid = new TextDecoder().decode(take(take(1)[0]));
    let maxmsg = COMPACT_MAXMSG;
    if (flags & CF_MAXMSG) {
      const b = take(4);
      maxmsg = b[0] * 16777216 + (b[1] << 16) + (b[2] << 8) + b[3];
    }
    let tag = null;
    if (flags & CF_TAG) {
      const b = take(2);
      tag = (b[0] << 8) | b[1];
    }
    const count = take(1)[0];
    const lines = [];
    for (let i = 0; i < count; i += 1) {
      const kind = take(1)[0];
      let address;
      if (kind === CK_MDNS) {
        const h = Array.from(take(16)).map(hex).join("");
        address = [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join("-") + ".local";
      } else if (kind === CK_V4) {
        address = Array.from(take(4)).join(".");
      } else if (kind === CK_V6) {
        address = formatIPv6(take(16));
      } else if (kind === CK_NAME) {
        address = new TextDecoder().decode(take(take(1)[0]));
      } else {
        throw new Error("candidate kind");
      }
      const port = take(2);
      // host 的 type preference 是 126，local preference 依原本的順序遞減
      const priority = 126 * 16777216 + (65535 - i) * 256 + 255;
      lines.push("a=candidate:" + (i + 1) + " 1 udp " + priority + " " + address + " " + ((port[0] << 8) | port[1]) + " typ host");
    }
    if (at !== bytes.length) throw new Error("trailing bytes");
    const answer = (flags & CF_ANSWER) !== 0;
    const setup = answer ? ((flags & CF_PASSIVE) ? "passive" : "active") : "actpass";
    // o= 那一行是假的。實測 Chrome 與 Firefox 都接受，之後在 DataChannel 上用完整描述
    // 重新協商（例如加音軌）也不受影響。
    const sdp = [
      "v=0",
      "o=- 0 1 IN IP4 127.0.0.1",
      "s=-",
      "t=0 0",
      "a=group:BUNDLE " + mid,
      "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
      "c=IN IP4 0.0.0.0",
    ].concat(lines, [
      "a=end-of-candidates",
      "a=ice-ufrag:" + ufrag,
      "a=ice-pwd:" + pwd,
      "a=fingerprint:sha-256 " + fingerprint,
      "a=setup:" + setup,
      "a=mid:" + mid,
      "a=sctp-port:5000",
      "a=max-message-size:" + maxmsg,
    ]).join("\r\n") + "\r\n";
    const desc = { type: answer ? "answer" : "offer", sdp: sdp };
    if (tag !== null) desc.for = tag;
    return desc;
  }

  // compact-codec-end

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

  // 解不開的原因分開回報。掃到別的 QR code 只記個數，內容壞掉要告訴使用者改用複製貼上。
  async function unpackDescription(bytes) {
    if (!bytes || bytes.length < 5 || bytes[0] !== PACK_MAGIC[0] || bytes[1] !== PACK_MAGIC[1]) {
      return { error: "foreign" };
    }
    if (bytes[2] === PACK_COMPACT) {
      try {
        return { json: JSON.stringify(decodeCompact(bytes)) };
      } catch (err) {
        return { error: "corrupt" };
      }
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
    // 先試只帶欄位的封包，編不出來才放格式版本 1 的完整描述。複製貼上那一格維持完整描述。
    const desc = JSON.parse(json);
    const compact = encodeCompact(desc);
    const bytes = compact.bytes || (await packDescription(json));
    const format = compact.bytes ? "compact" : "full";
    const built = buildQr(bytes);
    if (!built || !built.qr) {
      qrNote.textContent = t.qrTooLarge;
      record("qr-too-large", { bytes: bytes.length, format: format });
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
      type: desc.type,
      bytes: bytes.length,
      format: format,
      fallback: compact.error || null,
      gzip: format === "full" && bytes[3] === 1,
      version: built.version,
      level: built.level,
    });
  }

  // ---------------------------------------------------------------- 相機

  // seen 記著已經處理過的封包。相機一直開著，同一張 QR code 每一輪都會讀到，只處理第一次。
  const scan = { stream: null, timer: null, startedAt: 0, canvas: null, foreign: 0, seen: new Set() };

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
    const facing = cameraBox.value;
    try {
      scan.stream = await media.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
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
    scan.seen.clear();
    record("qr-scan-start", { facing: facing });
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

  // 掃到之後不停，相機一直開著，下一台靠過來就能接著掃。套用描述的那段時間暫停讀畫面，
  // 一次只處理一張。
  async function scanTick() {
    if (!scan.stream) return;
    const began = performance.now();
    const bytes = readFrame();
    if (bytes) {
      const key = bytesToLatin1(bytes);
      if (!scan.seen.has(key)) {
        scan.seen.add(key);
        const result = await unpackDescription(bytes);
        if (result.json) {
          const ms = Math.round(performance.now() - scan.startedAt);
          scanState.textContent = t.scanned;
          // 讀到的內容照樣放進下面的文字框。自動套用之後使用者仍然看得到掃到了什麼，
          // 連不上時也能整段複製出來比對。
          remoteBox.value = result.json;
          const outcome = await handleRemote(result.json, "qr");
          record("qr-scanned", { ms: ms, bytes: bytes.length, foreignSeen: scan.foreign, outcome: outcome });
        } else if (result.error === "foreign") {
          scan.foreign += 1;
          scanState.textContent = t.scanForeign;
        } else {
          record("qr-scan-error", { reason: result.error });
          scanState.textContent = t.scanBadPayload;
        }
      }
    }
    if (!scan.stream) return;
    const spent = performance.now() - began;
    scan.timer = setTimeout(scanTick, Math.max(0, SCAN_INTERVAL_MS - spent));
  }

  // ---------------------------------------------------------------- 配對流程

  function start() {
    if (!starting) starting = doStart();
    return starting;
  }

  async function doStart() {
    btnStart.hidden = true;
    startedAt = performance.now();
    // 所有連線共用一張憑證，指紋就是這台裝置在這一頁的代號
    try {
      cert = await RTCPeerConnection.generateCertificate({ name: "ECDSA", namedCurve: "P-256" });
    } catch (err) {
      cert = null;
    }
    // 開相機之前先把之後要用的連線建好，理由見開頭的「減少掃描次數」
    for (let i = 0; i < POOL_SIZE; i += 1) pool.push(createPc());
    await showNextOffer();
    selfId = (cert && fingerprintOf(shownOffer.pc.localDescription.sdp)) || randomId();
    selfState.textContent = t.selfLabel + short(selfId);
    selfState.hidden = false;
    record("start", { self: short(selfId), pool: POOL_SIZE, sharedCert: !!cert });
    renderPeers();
    startScan();
  }

  async function makeOffer(peer) {
    peer.channel = peer.pc.createDataChannel("bundle", { ordered: true });
    wireChannel(peer);
    await peer.pc.setLocalDescription(await peer.pc.createOffer());
    await waitForGathering(peer.pc);
    peer.tag = iceTag(sdpAttr(peer.pc.localDescription.sdp, "ice-ufrag") || "");
  }

  // 畫面上的發起描述被人回應之後就換一張新的，下一台才有得掃
  async function showNextOffer() {
    const peer = addPeer("offerer", "qr");
    await makeOffer(peer);
    peer.createdAt = performance.now();
    shownOffer = peer;
    await refreshDisplay();
  }

  // 有人在等回應時放回應描述，否則放自己的發起描述
  async function refreshDisplay() {
    const peer = shownAnswer && !shownAnswer.closed ? shownAnswer : shownOffer;
    if (!peer || !peer.pc.localDescription) return;
    const kind = peer === shownAnswer ? "answer" : "offer";
    if (displayed && displayed.peer === peer && displayed.kind === kind) return;
    displayed = { peer: peer, kind: kind };
    const desc = plain(peer.pc.localDescription);
    if (kind === "answer") desc.for = peer.answerFor;
    localBox.value = JSON.stringify(desc);
    roleState.textContent = kind === "answer" ? fill(t.roleAnswer, { peer: short(peer.fp) }) : t.roleOffer;
    await showSdpStats(desc, kind === "answer" ? { type: "answer", peer: short(peer.fp) } : { type: "offer" });
    await showQr(localBox.value);
  }

  // 掃到或貼上的描述。回傳處理結果，寫進 qr-scanned 那一筆：
  // answered 回應了對方，applied 套上了對方的回應，self 掃到自己，known 已經連著這一台，
  // used 對應的發起描述已經被別台用掉，unmatched 對不上任何一張，bad 內容解不開。
  async function handleRemote(text, source) {
    await start();
    let desc = null;
    try {
      desc = JSON.parse(String(text).trim());
    } catch (err) {
      desc = null;
    }
    if (!desc || typeof desc.sdp !== "string" || (desc.type !== "offer" && desc.type !== "answer")) {
      scanState.textContent = t.badJson;
      return "bad";
    }
    const outcome = desc.type === "offer" ? await acceptOffer(desc, source) : await acceptAnswer(desc, source);
    if (source === "paste") record("paste-applied", { type: desc.type, outcome: outcome });
    explain(outcome, short(fingerprintOf(desc.sdp)));
    return outcome;
  }

  // 相機在第三區，手機上看不到第一區的說明，所以每一次掃描或貼上的結果都寫在第三區，
  // 包含下一步該做什麼。
  function explain(outcome, peer) {
    // 套上回應到換好下一張發起描述之間，連線可能已經開通，這時不再說「正在建立連線」
    const opened = peers.some(function (p) { return isOpen(p) && short(peerKey(p)) === peer; });
    if (outcome === "applied" && opened) {
      scanState.textContent = fill(t.connectedTo, { peer: peer });
      return;
    }
    const text = {
      answered: t.scanAnswered,
      applied: t.scanApplied,
      known: t.scanKnown,
      used: t.answerUsed,
      unmatched: t.answerUnknown,
    }[outcome];
    if (text) scanState.textContent = fill(text, { peer: peer });
    else if (outcome !== "bad") scanState.textContent = scan.stream ? t.scanning : "";
    // 回應用的 QR code 在第二區，手機上捲到那裡才能給對方掃
    if (outcome === "answered") qrCanvas.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function acceptOffer(desc, source) {
    const fp = fingerprintOf(desc.sdp);
    if (fp && fp === selfId) return "self";
    const ufrag = sdpAttr(desc.sdp, "ice-ufrag");
    const same = fp ? peers.filter(function (p) { return !p.closed && (p.fp === fp || p.id === fp); }) : [];
    for (let i = 0; i < same.length; i += 1) {
      const p = same[i];
      // 對方換上了新的一張發起描述，代表先前掃到的那一張已經被別台用掉，改回應新的
      if (p.role === "answerer" && !p.openedAt && p.remoteUfrag !== ufrag) {
        closePeer(p, "superseded");
      } else {
        // 已經連著這一台。對方連上之後畫面換回發起描述，這邊的相機還開著會再掃到一次
        return "known";
      }
    }
    const peer = addPeer("answerer", source);
    peer.fp = fp;
    peer.remoteUfrag = ufrag;
    peer.answerFor = iceTag(ufrag || "");
    await peer.pc.setRemoteDescription(plain(desc));
    peer.appliedAt = performance.now();
    record("remote-description", { type: "offer", peer: short(fp), via: source });
    await peer.pc.setLocalDescription(await peer.pc.createAnswer());
    await waitForGathering(peer.pc);
    if (peer.closed) return "answered";
    shownAnswer = peer;
    await refreshDisplay();
    renderPeers();
    return "answered";
  }

  async function acceptAnswer(desc, source) {
    const tag = Number.isInteger(desc.for) ? desc.for : null;
    // 舊版頁面或手動貼上沒帶標記的，當成回應畫面上這一張
    const peer = tag === null
      ? shownOffer
      : peers.find(function (p) { return p.role === "offerer" && p.via !== "relay" && p.tag === tag; });
    if (!peer) return "unmatched";
    const fp = fingerprintOf(desc.sdp);
    if (peer.closed || peer.pc.remoteDescription) {
      // 同一張發起描述被兩台掃到，先掃回來的那一台已經用掉了。同一台的回應重複讀到就不理。
      return peer.fp === fp ? "known" : "used";
    }
    peer.fp = fp;
    peer.via = source;
    await peer.pc.setRemoteDescription(plain(desc));
    peer.appliedAt = performance.now();
    record("remote-description", { type: "answer", peer: short(fp), via: source });
    watchConnect(peer);
    if (peer === shownOffer) {
      shownOffer = null;
      await showNextOffer();
    }
    renderPeers();
    return "applied";
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

  // ---------------------------------------------------------------- 傳輸參數

  // 資料塊的開頭：4 bytes 傳輸編號加 8 bytes 位置（float64）。開多條通道或多條連線時，
  // 各塊到達的先後不一定，接收端照位置寫回預先配好的緩衝區，不靠到達順序。
  const HEADER = 12;

  function params() {
    return {
      chunk: Number(chunkBox.value),
      channels: Number(channelsBox.value),
      links: Number(linksBox.value),
    };
  }

  function paramsLabel(p) {
    return fill(t.paramsValue, { chunk: Math.round(p.chunk / 1024), channels: p.channels, links: p.links });
  }

  function waitOpen(channel, timeout) {
    if (channel.readyState === "open") return Promise.resolve(true);
    return new Promise(function (resolve) {
      const timer = setTimeout(function () { resolve(false); }, timeout);
      channel.addEventListener("open", function () { clearTimeout(timer); resolve(true); });
      channel.addEventListener("close", function () { clearTimeout(timer); resolve(false); });
    });
  }

  // 控制通道上的一問一答。ready、got、link-answer 三種回覆靠這個對上當初的請求。
  function expectReply(peer, key, timeout) {
    return new Promise(function (resolve) {
      const timer = setTimeout(function () {
        peer.waiters.delete(key);
        resolve(null);
      }, timeout);
      peer.waiters.set(key, function (msg) {
        clearTimeout(timer);
        peer.waiters.delete(key);
        resolve(msg);
      });
    });
  }

  function settleReply(peer, key, msg) {
    const waiter = peer.waiters.get(key);
    if (waiter) waiter(msg);
  }

  function prepBulk(channel) {
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = BUFFER_LOW;
    return channel;
  }

  async function openBulk(pc) {
    const channel = prepBulk(pc.createDataChannel("bulk", { ordered: true }));
    return (await waitOpen(channel, 10000)) ? channel : null;
  }

  // 同一對裝置之間多開一條 RTCPeerConnection。描述走已經驗過指紋的控制通道，
  // 對方的 DTLS 指紋要跟它的裝置代號一致。每條連線各有自己的 SCTP 傳送窗口，
  // 往返時間拉長時，窗口是吞吐量的上限，多開幾條就多幾個窗口。
  async function openLink(peer) {
    const pc = createPc();
    const channel = prepBulk(pc.createDataChannel("bulk", { ordered: true }));
    const link = Math.floor(Math.random() * 0xffffffff);
    await pc.setLocalDescription(await pc.createOffer());
    await waitForGathering(pc);
    const reply = expectReply(peer, "link-answer:" + link, 10000);
    sendControl(peer, { kind: "link-offer", link: link, desc: relayDesc(pc.localDescription) });
    const msg = await reply;
    const fp = msg && msg.desc ? fingerprintOf(msg.desc.sdp) : null;
    if (!msg || (peer.bound && fp !== peer.id)) {
      record("link-failed", { peer: short(peer.id), reason: msg ? "fingerprint" : "no-answer" });
      pc.close();
      return null;
    }
    await pc.setRemoteDescription(plain(msg.desc));
    if (!(await waitOpen(channel, 10000))) {
      record("link-failed", { peer: short(peer.id), reason: "timeout", ice: pc.iceConnectionState });
      pc.close();
      return null;
    }
    return { pc: pc, bulk: [channel], openedAt: performance.now() };
  }

  async function onLinkOffer(peer, msg) {
    if (!msg.desc || typeof msg.desc.sdp !== "string" || !Number.isInteger(msg.link)) return;
    if (peer.bound && fingerprintOf(msg.desc.sdp) !== peer.id) {
      record("link-failed", { peer: short(peer.id), reason: "fingerprint" });
      return;
    }
    const pc = createPc();
    pc.addEventListener("datachannel", function (event) { wireBulk(peer, event.channel); });
    peer.linksIn.push(pc);
    await pc.setRemoteDescription(plain(msg.desc));
    await pc.setLocalDescription(await pc.createAnswer());
    await waitForGathering(pc);
    sendControl(peer, { kind: "link-answer", link: msg.link, desc: relayDesc(pc.localDescription) });
  }

  // 湊齊要用的通道。連線與通道開過就留著，下一次同樣的參數不必重開。
  // 預先準備與按下送出可能同時要求，排隊進行，才不會同一個缺口開兩次。
  function ensureLanes(peer, want) {
    const run = peer.laneLock.then(function () { return ensureLanesNow(peer, want); });
    peer.laneLock = run.catch(function () {});
    return run;
  }

  async function ensureLanesNow(peer, want) {
    while (peer.links.length < want.links - 1) {
      const link = await openLink(peer);
      if (!link) break;
      peer.links.push(link);
    }
    const conns = [{ pc: peer.pc, bulk: peer.bulk }].concat(peer.links.slice(0, want.links - 1));
    for (let i = 0; i < conns.length; i += 1) {
      while (conns[i].bulk.length < want.channels) {
        const channel = await openBulk(conns[i].pc);
        if (!channel) break;
        conns[i].bulk.push(channel);
      }
    }
    const lanes = [];
    conns.forEach(function (conn) {
      conn.bulk.slice(0, want.channels).forEach(function (channel) {
        if (channel.readyState === "open") lanes.push({ channel: channel, pc: conn.pc });
      });
    });
    // 最年輕的那一條額外連線開通多久了。第一次傳輸偏慢跟連線剛開好有沒有關係，看這個數字
    const ages = peer.links.slice(0, want.links - 1).map(function (link) { return performance.now() - link.openedAt; });
    return { lanes: lanes, links: conns.length, youngestLinkMs: ages.length ? Math.round(Math.min.apply(null, ages)) : null };
  }

  function enqueue(peer, task) {
    const run = peer.queue.then(task);
    peer.queue = run.catch(function () {});
    return run;
  }

  const WARM_PER_LANE = 1024 * 1024;

  // 預先準備：open 只把額外的連線開好，warm 開好之後再送一小段資料（每條通道 1 MB）。
  // 預熱的資料不列進第五區的結果，紀錄裡記成 prep-open 與 warm-done。
  function prepPeer(peer) {
    const mode = prepBox.value;
    if (mode === "none" || !isOpen(peer) || !peer.id) return;
    enqueue(peer, async function () {
      const want = params();
      const began = performance.now();
      const set = await ensureLanes(peer, want);
      record("prep-open", {
        peer: short(peer.id),
        mode: mode,
        links: set.links,
        lanes: set.lanes.length,
        setupMs: Math.round(performance.now() - began),
      });
      if (mode !== "warm" || !set.lanes.length) return;
      const bytes = new Uint8Array(WARM_PER_LANE * set.lanes.length);
      for (let at = 0; at < bytes.length; at += 65536) {
        crypto.getRandomValues(bytes.subarray(at, Math.min(at + 65536, bytes.length)));
      }
      await sendTo(peer, bytes, await sha256Hex(bytes), "warm-up", want, function () {}, { warm: true });
    });
  }

  function prepAll() {
    peers.forEach(function (peer) { prepPeer(peer); });
  }

  // 兩個方向的額外連線都收掉：自己開出去的（links）與對方開過來的（linksIn），並請對方也照做。
  // 排進佇列，傳到一半不會被拆掉。收完如果選了預先準備，馬上重開一批。
  function dropLinks(peer, by) {
    return enqueue(peer, function () {
      const count = peer.links.length + peer.linksIn.length;
      peer.links.map(function (l) { return l.pc; }).concat(peer.linksIn).forEach(function (pc) {
        try {
          pc.close();
        } catch (err) {
          // 已經關掉了
        }
      });
      peer.links = [];
      peer.linksIn = [];
      record("links-dropped", { peer: short(peer.id), count: count, by: by });
      if (by === "local") sendControl(peer, { kind: "drop-links" });
    }).then(function () { prepPeer(peer); });
  }

  async function dropAllLinks() {
    const targets = peers.filter(function (p) { return isOpen(p) && p.id; });
    if (!targets.length) {
      sendNote.textContent = t.notConnected;
      return;
    }
    const before = targets.reduce(function (n, p) { return n + p.links.length + p.linksIn.length; }, 0);
    await Promise.all(targets.map(function (peer) { return dropLinks(peer, "local"); }));
    sendNote.textContent = fill(t.dropped, { n: before });
  }

  // 挑緩衝區最空的那一條送。全部都塞滿時，等任何一條降到下界。
  async function pickLane(lanes) {
    for (;;) {
      let best = null;
      lanes.forEach(function (lane) {
        if (lane.channel.readyState !== "open") return;
        if (!best || lane.channel.bufferedAmount < best.channel.bufferedAmount) best = lane;
      });
      if (!best) return null;
      if (best.channel.bufferedAmount <= BUFFER_HIGH) return best;
      await new Promise(function (resolve) {
        const done = function () {
          lanes.forEach(function (lane) {
            lane.channel.removeEventListener("bufferedamountlow", done);
            lane.channel.removeEventListener("close", done);
          });
          resolve();
        };
        lanes.forEach(function (lane) {
          lane.channel.addEventListener("bufferedamountlow", done);
          lane.channel.addEventListener("close", done);
        });
      });
    }
  }

  function wireBulk(peer, channel) {
    prepBulk(channel);
    channel.addEventListener("message", function (event) { onBulk(peer, event.data); });
  }

  // ---------------------------------------------------------------- 傳輸

  async function sha256Hex(buffer) {
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.prototype.map
      .call(new Uint8Array(digest), function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  function renderResults() {
    const list = Array.from(results.values());
    grid(
      sendTable,
      list.length ? [t.peerDevice, t.direction, t.size, t.elapsed, t.throughput, t.hashMatch, t.paramsHead] : [],
      list
    );
  }

  // 同時送給每一台已經連上的裝置。各台的吞吐分開記，同一個 Wi-Fi 頻道被幾台分著用，
  // 加總起來才是這個網路實際撐得住的量。
  async function sendBytes(bytes, name) {
    const targets = peers.filter(function (p) { return isOpen(p) && p.id; });
    if (!targets.length) {
      sendNote.textContent = t.notConnected;
      return;
    }
    sendNote.textContent = "";
    const hash = await sha256Hex(bytes);
    const want = params();
    const total = bytes.length * targets.length;
    let done = 0;
    progress.value = 0;
    await Promise.all(targets.map(function (peer) {
      return enqueue(peer, function () {
        return sendTo(peer, bytes, hash, name, want, function (n) {
          done += n;
          progress.value = (done / total) * 100;
        });
      });
    }));
  }

  // 計時從對方回 ready 開始，到對方回 got（收齊最後一個位元組）為止。以前是等自己的緩衝區
  // 排空，那只代表資料交給了 SCTP，對方不一定收到了。
  async function sendTo(peer, bytes, hash, name, want, onChunk, opts) {
    const warm = !!(opts && opts.warm);
    const who = short(peer.id);
    const setupBegan = performance.now();
    const set = await ensureLanes(peer, want);
    const setupMs = Math.round(performance.now() - setupBegan);
    if (!set.lanes.length) {
      sendNote.textContent = t.notConnected;
      return;
    }
    const used = { chunk: want.chunk, channels: want.channels, links: set.links, prep: prepBox.value };
    if (set.links < want.links) sendNote.textContent = fill(t.linkShort, { peer: who, n: set.links });
    // 每一則訊息不能超過兩邊協商出來的上限，Chrome 是 256 KB，扣掉開頭的 12 bytes
    const limit = set.lanes.reduce(function (min, lane) {
      const max = lane.pc.sctp && lane.pc.sctp.maxMessageSize ? lane.pc.sctp.maxMessageSize : 65536;
      return Math.min(min, max);
    }, Infinity);
    const payload = Math.max(1024, Math.min(want.chunk, limit - HEADER));
    const xfer = Math.floor(Math.random() * 0xffffffff);
    const ready = expectReply(peer, "ready:" + xfer, 10000);
    sendControl(peer, { kind: "start", xfer: xfer, name: name, size: bytes.length, hash: hash, chunk: payload, channels: used.channels, links: used.links, prep: used.prep, warm: warm });
    if (!warm) {
      record("send-start", Object.assign({
        peer: who,
        size: bytes.length,
        lanes: set.lanes.length,
        setupMs: setupMs,
        youngestLinkMs: set.youngestLinkMs,
        environment: envBox.value || null,
      }, used, { chunk: payload }));
    }
    if (!(await ready)) {
      record("send-failed", { peer: who, reason: "no-ready", warm: warm });
      return;
    }
    if (!warm) {
      results.set(peer, [who, t.sending, bytes.length.toLocaleString() + " B", t.flushing, "", "", paramsLabel(used)]);
      renderResults();
    }

    const began = performance.now();
    const got = expectReply(peer, "got:" + xfer, 600000);
    let sent = 0;
    while (sent < bytes.length) {
      const lane = await pickLane(set.lanes);
      if (!lane) break;
      const end = Math.min(sent + payload, bytes.length);
      const msg = new Uint8Array(HEADER + end - sent);
      const view = new DataView(msg.buffer);
      view.setUint32(0, xfer);
      view.setFloat64(4, sent);
      msg.set(bytes.subarray(sent, end), HEADER);
      lane.channel.send(msg);
      onChunk(end - sent);
      sent = end;
    }
    const ack = await got;

    const secs = Math.max((performance.now() - began) / 1000, 0.001);
    const rate = (bytes.length / 1024 / 1024 / secs).toFixed(2);
    if (warm) {
      record("warm-done", { peer: who, size: bytes.length, seconds: Number(secs.toFixed(2)), mbps: Number(rate), acked: !!ack, lanes: set.lanes.length });
      return;
    }
    results.set(peer, [who, t.sending, bytes.length.toLocaleString() + " B", secs.toFixed(2) + " " + t.seconds, rate + " MB/s", "", paramsLabel(used)]);
    renderResults();
    const pair = await selectedPair(peer);
    record("send-done", Object.assign({
      peer: who,
      rttMs: pair ? pair.rttMs : null,
      size: bytes.length,
      sent: sent,
      seconds: Number(secs.toFixed(2)),
      mbps: Number(rate),
      acked: !!ack,
      lanes: set.lanes.length,
    }, used, { chunk: payload }));
  }

  function onStart(peer, msg) {
    const who = short(peerKey(peer));
    if (!Number.isInteger(msg.xfer) || !Number.isInteger(msg.size) || msg.size < 0) return;
    peer.incoming = {
      xfer: msg.xfer,
      buf: new Uint8Array(msg.size),
      got: 0,
      expect: msg,
      startedAt: performance.now(),
    };
    const used = { chunk: msg.chunk, channels: msg.channels, links: msg.links, prep: msg.prep || null };
    if (!msg.warm) {
      record("recv-start", Object.assign({ peer: who, size: msg.size, environment: envBox.value || null }, used));
      results.set(peer, [who, t.receiving, msg.size.toLocaleString() + " B", "", "", "", paramsLabel(used)]);
      renderResults();
    }
    sendControl(peer, { kind: "ready", xfer: msg.xfer });
    if (msg.size === 0) finishIncoming(peer);
  }

  function onBulk(peer, data) {
    const incoming = peer.incoming;
    if (!incoming || !(data instanceof ArrayBuffer) || data.byteLength < HEADER) return;
    const view = new DataView(data);
    if (view.getUint32(0) !== incoming.xfer) return;
    const at = view.getFloat64(4);
    const body = new Uint8Array(data, HEADER);
    if (at < 0 || at + body.length > incoming.buf.length) return;
    incoming.buf.set(body, at);
    incoming.got += body.length;
    progress.value = (incoming.got / incoming.buf.length) * 100;
    if (incoming.got >= incoming.buf.length) finishIncoming(peer);
  }

  // 收齊就先回 got，再算 SHA-256。雜湊的時間不算進吞吐量。
  async function finishIncoming(peer) {
    const incoming = peer.incoming;
    peer.incoming = null;
    const secs = Math.max((performance.now() - incoming.startedAt) / 1000, 0.001);
    sendControl(peer, { kind: "got", xfer: incoming.xfer });
    const who = short(peerKey(peer));
    const hash = await sha256Hex(incoming.buf);
    const rate = (incoming.buf.length / 1024 / 1024 / secs).toFixed(2);
    const ok = hash === incoming.expect.hash;
    const used = { chunk: incoming.expect.chunk, channels: incoming.expect.channels, links: incoming.expect.links, prep: incoming.expect.prep || null };
    if (incoming.expect.warm) {
      record("warm-recv", { peer: who, size: incoming.buf.length, seconds: Number(secs.toFixed(2)), mbps: Number(rate), match: ok });
      return;
    }
    record("recv-done", Object.assign({
      peer: who,
      size: incoming.buf.length,
      seconds: Number(secs.toFixed(2)),
      mbps: Number(rate),
      match: ok,
    }, used));
    results.set(peer, [
      who,
      t.received,
      incoming.buf.length.toLocaleString() + " B",
      secs.toFixed(2) + " " + t.seconds,
      rate + " MB/s",
      ok ? t.hashOk : t.hashBad,
      paramsLabel(used),
    ]);
    renderResults();
  }

  function onMessage(peer, event) {
    if (typeof event.data !== "string") return;
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      return;
    }
    if (!msg || typeof msg !== "object") return;
    if (msg.kind === "hello") onHello(peer, msg);
    else if (msg.kind === "peers") onPeers(peer, msg);
    else if (msg.kind === "relay") onRelay(peer, msg);
    else if (msg.kind === "start") onStart(peer, msg);
    else if (msg.kind === "ready" || msg.kind === "got") settleReply(peer, msg.kind + ":" + msg.xfer, msg);
    else if (msg.kind === "link-offer") onLinkOffer(peer, msg);
    else if (msg.kind === "link-answer") settleReply(peer, "link-answer:" + msg.link, msg);
    else if (msg.kind === "drop-links") dropLinks(peer, "remote");
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
    if (!file) {
      sendNote.textContent = t.noFile;
      return;
    }
    await sendBytes(new Uint8Array(await file.arrayBuffer()), file.name);
  }

  function exportLog() {
    const payload = {
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      self: short(selfId),
      environment: envBox.value || null,
      peers: peers.filter(function (p) { return peerKey(p); }).map(function (p) {
        return { peer: short(peerKey(p)), role: p.role, via: p.via, closed: p.closed, opened: !!p.openedAt };
      }),
      localSdp: localBox.value ? maskSdp(JSON.parse(localBox.value).sdp) : null,
      log: log,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = el("a");
    link.href = URL.createObjectURL(blob);
    link.download = "webrtc-lab-" + Date.now() + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  renderLog();
  record("page-load", { restored: log.length });

  // 給檢查腳本用的把手，見 tools/webrtc-lab/。人不會用到這幾個。
  window.__lab = {
    start: start,
    apply: function (text) { return handleRemote(text, "paste"); },
    localSdp: function () { return localBox.value; },
    remoteText: function () { return remoteBox.value; },
    scanNote: function () { return scanState.textContent; },
    state: function () {
      return {
        self: short(selfId),
        peers: peers.filter(function (p) { return !p.closed && peerKey(p); }).map(function (p) {
          return {
            peer: short(peerKey(p)),
            role: p.role,
            via: p.via === "relay" ? "relay:" + short(p.relay && p.relay.id) : p.via,
            connection: p.pc.connectionState,
            channel: p.channel ? p.channel.readyState : null,
          };
        }),
      };
    },
    send: function (size, opts) {
      sizeBox.value = String(size);
      if (opts && opts.chunk) chunkBox.value = String(opts.chunk);
      if (opts && opts.channels) channelsBox.value = String(opts.channels);
      if (opts && opts.links) linksBox.value = String(opts.links);
      return sendGenerated();
    },
    prep: function (mode) {
      prepBox.value = mode;
      prepAll();
    },
    dropLinks: dropAllLinks,
    clearLog: clearLog,
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
