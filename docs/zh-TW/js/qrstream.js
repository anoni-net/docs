/*
 * QR code 影格串流（utils/qr-stream.md）。
 *
 * 把一個檔案切成一連串 QR code 輪流播放，對面用相機一直讀，讀滿了就拼回原檔。
 * 兩台裝置之間沒有任何連線：沒開藍牙、沒連同一個 Wi-Fi、沒有伺服器，中間只有光。
 * 硬體錢包的離線簽章用的是同一套做法。
 *
 * === 為什麼不做 Wi-Fi 或藍牙 ===
 *
 * 瀏覽器拿不到那些東西。Web Bluetooth 只有 GATT，做不了檔案傳輸用的 OBEX，而且
 * 網頁只能當 central 不能當 peripheral，兩個瀏覽器彼此看不見。Firefox 完全沒有
 * 實作它，Tor Browser 因此也沒有。Wi-Fi 那邊沒有對應的 API，唯一的區網通道是
 * WebRTC，而 Tor Browser 把 WebRTC 整個關掉，公共 Wi-Fi 又常擋 mDNS 與同網段互連。
 * 剩下唯一走得通的通道是螢幕跟鏡頭。
 *
 * === 框格式（版本 1）===
 *
 *   位元組 0      0xA1，標記與版本
 *   位元組 1-2    sessionId，隨機，用來認出「對面換了一個檔案」
 *   位元組 3-4    total，總張數，含編號 0 那一張
 *   位元組 5-6    index，這一張的編號
 *   位元組 7..    payload
 *   最後 2 個     CRC-16/CCITT，蓋住它前面的每一個位元組
 *
 * 編號 0 的 payload 是一段 JSON，記檔名、原始大小、SHA-256 與有沒有壓縮過。
 * 編號 1 之後是資料。全部走 QR 的 byte mode，所以任何檔案都能傳，不限文字。
 *
 * QR 本身有 Reed-Solomon，解錯的機率很低，CRC 仍然留著。少了它，一張解錯要等到
 * 全部收完比對 SHA-256 才發現，那時已經不知道是哪一張壞掉，只能整份重來。有了它，
 * 壞掉的那一張當場丟掉，下一輪再收一次就好。兩個位元組換掉這個失敗模式很划算。
 *
 * === 送的一端沒有回饋 ===
 *
 * 播放端不知道對面收到了哪幾張，只能照順序一直輪。這是 coupon collector：每一張
 * 的讀取成功率是 p 的話，收齊需要的輪數大約是 log(N) / -log(1-p)。實際上 p 高的
 * 時候一到兩輪就滿了，光線差或方格太密的時候會拖到三四輪。收的一端會把還缺哪幾張
 * 標出來，讓人知道該調整距離還是把每張資料量調小。
 *
 * 真正的解法是噴泉碼（LT/RaptorQ），任意 N(1+ε) 張就能還原，跟收到哪幾張無關。
 * 那需要度分布、種子化亂數與信念傳播解碼，格式也不再是人工看得懂的。先做輪播，
 * 格式簡單到可以自己驗，之後要換再說。
 *
 * === 誰的程式 ===
 *
 * 編碼 utils/vendor/qrcode-generator.js（MIT），解碼 utils/vendor/jsQR.js
 * （Apache-2.0），兩份都原封不動，跟產生器與讀取器那兩頁共用。
 *
 * 純邏輯的部分由 tools/test_qrstream.mjs 原地抽出來測，那支自己走一遍
 * 「切張、編碼、解碼、拼回」的完整往返，並且刻意漏張、亂序、竄改位元組。
 *
 * 三個語系共用這一份，docs/en/js/ 與 docs/zh-CN/js/ 底下是指向這裡的 symlink。
 */
(function () {
  "use strict";

  // --- 純邏輯（tools/test_qrstream.mjs 從這裡原地抽出來測）---

  // 框頭第一個位元組。之後改格式就換這個值，舊版收到新版的框會直接當雜訊丟掉，
  // 不會拼出一個壞檔案還說成功。
  const MAGIC = 0xa1;
  const HEADER_BYTES = 7;
  const CRC_BYTES = 2;
  const OVERHEAD = HEADER_BYTES + CRC_BYTES;

  // total 與 index 各兩個位元組，張數的上限就在這裡。
  const MAX_CHUNKS = 0xffff;

  // 編號 0 固定放檔案資訊，資料從編號 1 開始。
  const MANIFEST_INDEX = 0;

  // CRC-16/CCITT-FALSE：poly 0x1021、初值 0xFFFF、不反轉、不做 xorout。
  // 選這一組是因為它最好對照，任何一份 CRC 工具都算得出同樣的值，別人要驗這個
  // 格式不必先讀我們的程式。
  function crc16(bytes, length) {
    let crc = 0xffff;
    for (let i = 0; i < length; i += 1) {
      crc ^= bytes[i] << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return crc;
  }

  // 組一張。CRC 放在最後而不是框頭裡，這樣它蓋住的範圍是「從頭到自己前面」，
  // 一個連續區間，兩端算法都不會有跳過某幾個位元組的錯誤。
  function packFrame(session, total, index, payload) {
    const frame = new Uint8Array(OVERHEAD + payload.length);
    frame[0] = MAGIC;
    frame[1] = (session >> 8) & 0xff;
    frame[2] = session & 0xff;
    frame[3] = (total >> 8) & 0xff;
    frame[4] = total & 0xff;
    frame[5] = (index >> 8) & 0xff;
    frame[6] = index & 0xff;
    frame.set(payload, HEADER_BYTES);
    const crc = crc16(frame, HEADER_BYTES + payload.length);
    frame[frame.length - 2] = (crc >> 8) & 0xff;
    frame[frame.length - 1] = crc & 0xff;
    return frame;
  }

  // 拆一張。相機會讀到路過的別張 QR code、上一次傳到一半的殘影、以及純粹的雜訊，
  // 所以這裡對每一項都存疑：標記不對、CRC 對不上、序號超出總數，一律回 null 當作
  // 沒看到。收的一端只認這個函式回傳非 null 的東西。
  function parseFrame(bytes) {
    if (!bytes || bytes.length < OVERHEAD) return null;
    if (bytes[0] !== MAGIC) return null;
    const bodyLength = bytes.length - CRC_BYTES;
    const want = (bytes[bodyLength] << 8) | bytes[bodyLength + 1];
    if (crc16(bytes, bodyLength) !== want) return null;
    const total = (bytes[3] << 8) | bytes[4];
    const index = (bytes[5] << 8) | bytes[6];
    if (total < 2 || index >= total) return null;
    return {
      session: (bytes[1] << 8) | bytes[2],
      total: total,
      index: index,
      payload: bytes.slice(HEADER_BYTES, bodyLength),
    };
  }

  // 檔名兩端都要洗過，重點在收的那一端：那是別人給的字串，直接拿去當下載檔名等於
  // 讓對方決定寫成什麼。斜線與反斜線換掉，開頭的點拿掉，免得變成路徑或隱藏檔。
  //
  // 第二條 replace 清的是方向控制與零寬字元。用方向覆寫可以讓一個執行檔在檔案總管
  // 裡顯示成圖片，副檔名被反著畫出來，跟[隱形字元偵測]那一頁講的是同一種手法。
  function safeName(raw) {
    const cleaned = String(raw == null ? "" : raw)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, "")
      .replace(/[\\/]/g, "_")
      .replace(/^\.+/, "")
      .trim();
    return shortenName(cleaned, 80) || "received.bin";
  }

  // 砍檔名要留副檔名。從尾巴直接切會把 `.asc` 切掉，存下來的檔案認不出是什麼。
  function shortenName(name, keep) {
    if (name.length <= keep) return name;
    const dot = name.lastIndexOf(".");
    const ext = dot > 0 && name.length - dot <= 8 ? name.slice(dot) : "";
    const stem = ext ? name.slice(0, dot) : name;
    return stem.slice(0, Math.max(1, keep - ext.length)) + ext;
  }

  // 編號 0 的內容。欄位名用單一字母，因為這一張的預算跟資料那幾張一樣大，檔名能多
  // 留幾個字比可讀性重要。收的一端只認得這五個欄位，多的忽略。
  //
  //   n 檔名   s 原始大小   c 實際送出的位元組數   h 原始檔的 SHA-256   z 壓縮旗標
  //
  // s 與 c 在沒壓縮的時候是同一個數，所以 z 為 0 時不寫 c，收的一端自己補上。
  // 壓縮過的時候兩個都要有：c 用來把最後一張的填充切掉，s 用來驗解壓的結果對不對。
  //
  // 檔名長度不受控，塞不下就一路砍短再試，砍到剩一個字元還塞不下才放棄。
  function buildManifest(info, budget) {
    const encoder = new TextEncoder();
    let keep = 80;
    for (;;) {
      const body = {
        n: shortenName(info.name, keep),
        s: info.size,
        h: info.hash || "",
        z: info.compressed ? 1 : 0,
      };
      if (info.compressed) body.c = info.stream;
      const bytes = encoder.encode(JSON.stringify(body));
      if (bytes.length <= budget) return bytes;
      if (keep <= 1) return null;
      keep = Math.max(1, keep - 8);
    }
  }

  // 拆編號 0。同樣把每一個欄位當成不可信：大小要是非負整數，雜湊要是 64 個十六
  // 進位字元，對不上就當作沒有雜湊，後面會照實說「這一份沒有校驗碼」。
  function parseManifest(payload) {
    let info;
    try {
      info = JSON.parse(new TextDecoder().decode(payload));
    } catch (err) {
      return null;
    }
    if (!info || typeof info !== "object") return null;
    const size = Number(info.s);
    if (!Number.isInteger(size) || size < 0) return null;
    const compressed = info.z === 1;
    const stream = compressed ? Number(info.c) : size;
    if (!Number.isInteger(stream) || stream < 0) return null;
    const hash = typeof info.h === "string" && /^[0-9a-f]{64}$/.test(info.h) ? info.h : "";
    return {
      name: safeName(info.n),
      size: size,
      stream: stream,
      hash: hash,
      compressed: compressed,
    };
  }

  // 一個檔案要切成幾張。編號 0 放檔案資訊，資料從編號 1 開始，所以總數是資料張數加一。
  function planStream(dataLength, payloadSize) {
    if (payloadSize <= 0) return null;
    const dataChunks = Math.max(1, Math.ceil(dataLength / payloadSize));
    const total = dataChunks + 1;
    if (total > MAX_CHUNKS) return null;
    return { total: total, dataChunks: dataChunks, payloadSize: payloadSize };
  }

  // 收到的影格拼回一份完整的位元組陣列。少任何一張就回 null，寧可說沒收完，
  // 也不要拼出一個中間有洞的檔案讓人以為成功了。
  function assemble(chunks, total, size) {
    const parts = [];
    let length = 0;
    for (let index = 1; index < total; index += 1) {
      const part = chunks.get(index);
      if (!part) return null;
      parts.push(part);
      length += part.length;
    }
    const out = new Uint8Array(length);
    let at = 0;
    for (const part of parts) {
      out.set(part, at);
      at += part.length;
    }
    // QR 的 byte mode 帶長度欄位，每一張解回來的長度都是精確的，填充留在碼字層，
    // 不會混進 payload。這一刀是防呆：manifest 記的長度跟實際拼出來的對不上時，
    // 寧可照 manifest 切，也不要多送幾個位元組出去。
    return size <= out.length ? out.slice(0, size) : out;
  }

  // 收下一張，並且回報這一張對狀態做了什麼：
  //   restarted  sessionId 或總張數換了，進度圖要重畫
  //   discarded  換的時候手上已經有東西，那些被丟掉了，要跟讀者說一聲
  //   added      這一張是新的，收下了
  //
  // 換檔案的偵測放在這裡而不是留在介面層，因為它是這個工具最容易出錯的一段。
  // 兩份檔案的影格混在一起會拼出一個誰都沒送過的檔案，而對面如果沒附校驗碼，
  // 收的人不會發現。
  function collect(state, frame) {
    const step = { restarted: false, discarded: false, added: false };
    if (state.session !== frame.session || state.total !== frame.total) {
      step.restarted = true;
      step.discarded = state.have.size > 0;
      state.session = frame.session;
      state.total = frame.total;
      state.manifest = null;
      state.chunks.clear();
      state.have.clear();
    }
    if (state.have.has(frame.index)) return step;
    if (frame.index === MANIFEST_INDEX) {
      const manifest = parseManifest(frame.payload);
      // 編號 0 那一張解得出來但內容不成形，就當作沒收到，下一輪再讀一次。標成收到
      // 的話這一份永遠拼不出來，畫面上卻會顯示已經收滿。
      if (!manifest) return step;
      state.manifest = manifest;
    }
    state.chunks.set(frame.index, frame.payload);
    state.have.add(frame.index);
    step.added = true;
    return step;
  }

  // 還缺哪幾張。幾十張以上逐一列出就是一長串數字，摺成區間之後多半只剩兩三段，
  // 一眼就看得出是「頭尾漏一點」還是「中間整段沒進來」。
  function missingSummary(have, total, limit) {
    const runs = [];
    let start = -1;
    for (let index = 0; index <= total; index += 1) {
      const gap = index < total && !have.has(index);
      if (gap && start < 0) start = index;
      if (!gap && start >= 0) {
        runs.push(start === index - 1 ? String(start) : start + "-" + (index - 1));
        start = -1;
      }
    }
    if (runs.length > limit) return runs.slice(0, limit).join("、") + "…";
    return runs.join("、");
  }

  // 位元組陣列轉成每個字元一個位元組的字串，餵給 qrcode-generator 的 byte mode。
  // 一次 apply 幾十萬個引數會爆堆疊，所以分段接。
  function bytesToLatin1(bytes) {
    let out = "";
    const step = 4096;
    for (let at = 0; at < bytes.length; at += step) {
      out += String.fromCharCode.apply(null, bytes.subarray(at, at + step));
    }
    return out;
  }

  function toHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let out = "";
    for (let i = 0; i < bytes.length; i += 1) {
      out += bytes[i].toString(16).padStart(2, "0");
    }
    return out;
  }

  // 檔案大小寫給人看。跟語系無關，三個語系共用同一組單位。
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  // 一輪要多久。這個數字比什麼說明都有用，讀者看到「一輪四分鐘」自己就會換小一點
  // 的檔案，不需要我們在頁面上勸。
  function formatDuration(seconds) {
    const whole = Math.round(seconds);
    if (whole < 60) return whole + "s";
    return Math.floor(whole / 60) + "m" + String(whole % 60).padStart(2, "0") + "s";
  }

  // --- 介面 ---

  const root = document.getElementById("qr-stream-tool");
  if (!root) return;

  // 每張資料量的三檔直接對應 QR 版本。全篇兩個名詞分開用：一「張」是一個 QR code，
  // 一張裡面的黑白小方塊叫「方格」。版本越高一張裝越多資料，但同樣大小的螢幕上
  // 每個方格越小，相機就越難對到。
  //   版本 10 = 57 × 57 方格，版本 15 = 77 × 77 方格，版本 20 = 97 × 97 方格
  const DENSITY = [
    { key: "small", version: 10, level: "M" },
    { key: "medium", version: 15, level: "M" },
    { key: "large", version: 20, level: "L" },
    { key: "huge", version: 25, level: "L" },
  ];

  // 容錯度為什麼低兩檔用 M、高兩檔用 L：
  //
  // tools/measure_qrstream_density.mjs 量出兩件事。一、解析度不夠的時候 L 跟 M 的
  // 解碼率一模一樣，失敗是整片認不出來，容錯度救不了那個。二、容錯度真正在保護的是
  // 局部破壞，也就是燈映在螢幕上那塊全白的斑：L 撐到遮掉 5%，M 撐到 10%。
  //
  // 同一個版本從 M 換成 L，方格數一個都沒變，payload 多兩成八。以解析度來說完全免費，
  // 付的是反光的餘裕。
  //
  // 所以高兩檔用 L：按到那裡的人是在要速度，而且條件本來就要夠好才用得起來。
  // 低兩檔留 M：那兩檔是「怎麼樣都讀不到」時退回來的地方，退路本身不該是脆弱的。
  // 室內反光蓋掉一成碼面很常見，那正好是 L 死掉而 M 還活著的區間。

  // 為什麼最高只到版本 25，而規格開到 40（L 等級 2953 個位元組）：
  //
  // 限制不在 QR 規格，在「一個方格在對方相機裡佔幾個像素」。解碼器要三個像素才勉強
  // 分得出一個方格，四到五個才穩。相機這一端解碼取到 1280 寬，QR 佔畫面六成的話是
  // 768 像素，除以版本 25 的 125 格（含留白）還有 6.1 個像素，很夠。版本 40 是 185
  // 格，只剩 4.1 個，而且那是「對得剛剛好」的情況。
  //
  // 真正先撞牆的是送的那一端的螢幕。畫布最寬 34rem（680 px），版本 40 攤進去每個
  // 方格只有 3.7 px，在 1 倍解析度的筆電上等於邊界落在像素之間，畫出來是灰的。
  // 手機的高解析度螢幕撐得住，筆電撐不住，而這個工具兩種都要能當發送端。
  //
  // 版本 25 是實測還留有餘裕的位置。要再往上就得先解決螢幕那一端，不是調這個常數。

  // 播放速度。快不一定好：一張停留的時間短於相機的曝光加對焦，讀到的就是兩張疊在
  // 一起的殘影，一張都拿不到。慢的那一檔是給舊手機與昏暗場地用的。
  const SPEED = [
    { key: "slow", fps: 2 },
    { key: "medium", fps: 5 },
    { key: "fast", fps: 10 },
  ];

  // 規範要求的四個方格留白。少了它有些掃描器對不到邊界。
  const QUIET = 4;

  // 檔案大小上限。這不是技術限制，是誠實：1 MB 在中檔密度下是兩千多張，一輪要七
  // 分鐘，而且要收齊通常不只一輪。與其讓人試完才失望，不如一開始就講。
  const MAX_INPUT_BYTES = 512 * 1024;

  // 兩次掃描之間的目標間隔，注意是「間隔」而不是「解完之後再等多久」。
  //
  // 原本寫的是後者：解完固定等 90 毫秒。實測 jsQR 在 1280 寬的畫面上一次要 32 毫秒，
  // 所以實際掃描率是 1/(0.090+0.032)，每秒 8.2 次，而播放端最快是每秒 10 張。收的
  // 比播的慢，每一輪都會結構性漏掉一批，而且慢的裝置漏得更兇，因為固定的等待疊在
  // 更久的解碼上面。方向剛好反了。
  //
  // 改成目標間隔之後，解得快的裝置補上等待、解得慢的裝置立刻接下一次，兩邊都變成
  // 「盡量貼近每秒 16 次」。播放端最快每秒 10 張，1.6 倍的取樣讓每一張至少被看到
  // 一次，收齊需要的輪數因此少很多。
  //
  // 沒有再往上調到解碼上限（這台機器是每秒 31 次），因為那是把電池燒在對面根本
  // 還沒換頁的畫面上。
  const SCAN_TARGET_MS = 60;

  // 掃影片檔時每秒取樣幾張。取樣率要高過播放端的速度才不會整張跳過。
  const VIDEO_SAMPLE_FPS = 15;

  const STRINGS = {
    "zh-TW": {
      tabSend: "傳送",
      tabReceive: "接收",
      stepPick: "選一個檔案",
      pickNote: "畫面上的 QR code 沒有加密，拍得到的人都讀得到。敏感的東西先自己加密再傳。",
      pickNoteLink: "怎麼判斷、怎麼加密",
      pickNoteHref: "#傳過去的東西是攤在螢幕上的",
      stepTune: "調整（不動也可以）",
      stepPlay: "開始播放，把螢幕舉著不要動",
      stepCamera: "打開相機",
      stepAim: "把鏡頭對準對方的畫面",
      stepSave: "收齊之後存下來",
      or: "或",
      speedHint: "一張停留太短，相機還沒對好焦就換掉了，拍到的是兩張疊在一起的殘影。舊手機或光線不好就往慢的調。",
      pick: "選檔案",
      dropHint: "或把檔案拖進這一塊",
      tooBig: "這個檔案 {size}，超過 {max} 的上限。這個通道一秒只有幾百個位元組，大的東西請用別的方式傳。",
      emptyFile: "這個檔案是空的，沒有東西可以傳。",
      reading: "處理中…",
      density: "每張資料量",
      densitySmall: "小",
      densityMedium: "中",
      densityLarge: "大",
      densityHuge: "特大",
      densityHint: "對面讀不到就往小調。每張裝的資料變少，畫面上的黑白方格跟著變大，相機容易對到。代價是張數變多，播一輪比較久。",
      speed: "播放速度",
      speedSlow: "慢",
      speedMedium: "中",
      speedFast: "快",
      play: "開始播放",
      pause: "暫停",
      change: "換一個檔案",
      plan: "{name}，{size}，切成 {total} 張，每張 {payload} 個位元組。一輪 {duration}。",
      planZip: "{name}，{size}（壓成 {stream}），切成 {total} 張，每張 {payload} 個位元組。一輪 {duration}。",
      longWarn: "一輪就要 {duration}，而收齊通常不只一輪。換小一點的檔案，或把每張資料量調大。",
      frameNow: "編號 {index}，共 {total} 張。第 {loop} 輪。",
      sendHint: "讓對面把鏡頭對準這個畫面，一直對著不要移開，直到那一端說收滿為止。這一端不知道對面收到多少，收完之前不要停。",
      camera: "開相機",
      cameraStop: "關掉相機",
      fromFile: "改讀影片或照片",
      cameraMissing: "這個瀏覽器沒有提供相機，改用「讀影片或照片」：拿手機的相機 App 把對面的畫面錄一段，再把影片檔丟進來。",
      cameraDenied: "沒有取得相機權限。可以在網址列旁邊改掉，或改用「讀影片或照片」。",
      waiting: "把鏡頭對準對面的畫面，整個 QR code 都要在框裡，佔畫面一半以上最好讀。",
      progress: "收到 {have} 張，共 {total} 張。",
      missing: "還缺編號 {list}",
      switched: "對面換了一個檔案，之前收到的已經清掉，重新開始。",
      scanFile: "讀取中 {percent}%",
      scanCancel: "停止讀取",
      scanNothing: "這幾個檔案裡沒有找到這個工具產生的影格。確認錄到的是對面播放的畫面，而且 QR code 在畫面裡夠大。",
      resultOk: "收齊了。校驗碼相符，內容跟對面送出的一模一樣。",
      resultNoHash: "收齊了。對面沒有附校驗碼，內容沒辦法驗證，來源不確定的話先不要打開。",
      resultBad: "收齊了，但是拼回來的內容跟校驗碼對不上。不要用這個檔案，請對面重送一次。",
      resultLine: "{name}，{size}",
      needUnzip: "對面送的是壓縮過的資料，這個瀏覽器沒有解壓的功能。換一個新一點的瀏覽器再收一次。",
      save: "儲存檔案",
      reset: "清掉重收",
      note: "兩台裝置之間沒有任何連線，中間只有螢幕跟鏡頭。畫面上的 QR code 是明文，拍得到的人都讀得到，敏感的東西先自己加密再傳。全部在你的瀏覽器裡處理，斷網時照樣可以用。",
    },
    "zh-CN": {
      tabSend: "发送",
      tabReceive: "接收",
      stepPick: "选一个文件",
      pickNote: "画面上的 QR code 没有加密，拍得到的人都读得到。敏感的东西先自己加密再传。",
      pickNoteLink: "怎么判断、怎么加密",
      pickNoteHref: "#传过去的东西是摊在屏幕上的",
      stepTune: "调整（不动也可以）",
      stepPlay: "开始播放，把屏幕举着不要动",
      stepCamera: "打开相机",
      stepAim: "把镜头对准对方的画面",
      stepSave: "收齐之后存下来",
      or: "或",
      speedHint: "一张停留太短，摄像头还没对好焦就换掉了，拍到的是两张叠在一起的残影。旧手机或光线不好就往慢的调。",
      pick: "选文件",
      dropHint: "或把文件拖进这一块",
      tooBig: "这个文件 {size}，超过 {max} 的上限。这个通道一秒只有几百个字节，大的东西请用别的方式传。",
      emptyFile: "这个文件是空的，没有东西可以传。",
      reading: "处理中…",
      density: "每张数据量",
      densitySmall: "小",
      densityMedium: "中",
      densityLarge: "大",
      densityHuge: "特大",
      densityHint: "对面读不到就往小调。每张装的数据变少，画面上的黑白方格跟着变大，相机容易对到。代价是张数变多，播一轮比较久。",
      speed: "播放速度",
      speedSlow: "慢",
      speedMedium: "中",
      speedFast: "快",
      play: "开始播放",
      pause: "暂停",
      change: "换一个文件",
      plan: "{name}，{size}，切成 {total} 张，每张 {payload} 个字节。一轮 {duration}。",
      planZip: "{name}，{size}（压成 {stream}），切成 {total} 张，每张 {payload} 个字节。一轮 {duration}。",
      longWarn: "一轮就要 {duration}，而收齐通常不只一轮。换小一点的文件，或把每张数据量调大。",
      frameNow: "编号 {index}，共 {total} 张。第 {loop} 轮。",
      sendHint: "让对面把镜头对准这个画面，一直对着不要移开，直到那一端说收满为止。这一端不知道对面收到多少，收完之前不要停。",
      camera: "开相机",
      cameraStop: "关掉相机",
      fromFile: "改读视频或照片",
      cameraMissing: "这个浏览器没有提供相机，改用「读视频或照片」：拿手机的相机 App 把对面的画面录一段，再把视频文件丢进来。",
      cameraDenied: "没有取得相机权限。可以在地址栏旁边改掉，或改用「读视频或照片」。",
      waiting: "把镜头对准对面的画面，整个 QR code 都要在框里，占画面一半以上最好读。",
      progress: "收到 {have} 张，共 {total} 张。",
      missing: "还缺编号 {list}",
      switched: "对面换了一个文件，之前收到的已经清掉，重新开始。",
      scanFile: "读取中 {percent}%",
      scanCancel: "停止读取",
      scanNothing: "这几个文件里没有找到这个工具生成的影格。确认录到的是对面播放的画面，而且 QR code 在画面里够大。",
      resultOk: "收齐了。校验码相符，内容跟对面发出的一模一样。",
      resultNoHash: "收齐了。对面没有附校验码，内容没办法验证，来源不确定的话先不要打开。",
      resultBad: "收齐了，但是拼回来的内容跟校验码对不上。不要用这个文件，请对面重发一次。",
      resultLine: "{name}，{size}",
      needUnzip: "对面发的是压缩过的数据，这个浏览器没有解压的功能。换一个新一点的浏览器再收一次。",
      save: "保存文件",
      reset: "清掉重收",
      note: "两台设备之间没有任何连接，中间只有屏幕跟镜头。画面上的 QR code 是明文，拍得到的人都读得到，敏感的东西先自己加密再传。全部在你的浏览器里处理，断网时照样可以用。",
    },
    en: {
      tabSend: "Send",
      tabReceive: "Receive",
      stepPick: "Choose a file",
      pickNote: "QR codes on screen are not encrypted, so anyone who photographs them can read them. Encrypt anything sensitive before sending it.",
      pickNoteLink: "how to judge that, and how to encrypt",
      pickNoteHref: "#What-you-send-is-sitting-in-the-open",
      stepTune: "Adjust (the defaults are fine)",
      stepPlay: "Start playing and hold the screen still",
      stepCamera: "Turn on the camera",
      stepAim: "Point it at the other screen",
      stepSave: "Save once the set is complete",
      or: "or",
      speedHint: "If a frame is up for less time than the camera needs to focus, what it captures is two frames smeared together. Older phones and poor light want the slow setting.",
      pick: "Choose a file",
      dropHint: "or drop a file into this area",
      tooBig: "That file is {size}, over the {max} limit. This channel carries a few hundred bytes a second, so send anything larger another way.",
      emptyFile: "That file is empty, so there is nothing to send.",
      reading: "Working…",
      density: "Data per frame",
      densitySmall: "Small",
      densityMedium: "Medium",
      densityLarge: "Large",
      densityHuge: "Extra large",
      densityHint: "Turn it down if the other side cannot read the codes. Each frame carries less, so its modules get larger and a camera locks on more easily. The cost is more frames and a longer pass.",
      speed: "Playback speed",
      speedSlow: "Slow",
      speedMedium: "Medium",
      speedFast: "Fast",
      play: "Start playing",
      pause: "Pause",
      change: "Pick another file",
      plan: "{name}, {size}, split into {total} frames of {payload} bytes each. One pass takes {duration}.",
      planZip: "{name}, {size} (compressed to {stream}), split into {total} frames of {payload} bytes each. One pass takes {duration}.",
      longWarn: "One pass alone takes {duration}, and collecting every frame usually takes more than one. Send a smaller file, or raise the data per frame.",
      frameNow: "Frame {index}, {total} in total. Pass {loop}.",
      sendHint: "Have the other device point its camera at this screen and hold it there until that side reports a full set. This side has no way to know how much has arrived, so do not stop early.",
      camera: "Turn on the camera",
      cameraStop: "Turn off the camera",
      fromFile: "Read a video or photos instead",
      cameraMissing: "This browser offers no camera. Use \"read a video or photos\" instead: record the other screen with your phone's camera app, then drop the video in here.",
      cameraDenied: "Camera permission was not granted. Change it next to the address bar, or read a video or photos instead.",
      waiting: "Point the camera at the other screen. Keep the whole QR code in frame, filling half the view or more.",
      progress: "{have} of {total} frames received.",
      missing: "Still missing frames {list}",
      switched: "The other side switched to a different file. What had been collected was cleared and collection restarted.",
      scanFile: "Reading {percent}%",
      scanCancel: "Stop reading",
      scanNothing: "No frames from this tool were found in those files. Check that you recorded the other side playing, and that the QR code is large enough in the picture.",
      resultOk: "Complete. The checksum matches, so the contents are exactly what the other side sent.",
      resultNoHash: "Complete. The other side attached no checksum, so the contents cannot be verified. Leave it unopened if you are unsure of the source.",
      resultBad: "Complete, but the reassembled contents do not match the checksum. Do not use this file. Ask the other side to send it again.",
      resultLine: "{name}, {size}",
      needUnzip: "The other side sent compressed data and this browser cannot decompress it. Receive it again on a newer browser.",
      save: "Save the file",
      reset: "Clear and start over",
      note: "There is no connection between the two devices, only a screen and a camera. The QR codes on screen are in the clear and anyone who photographs them can read them, so encrypt anything sensitive before sending it. Everything runs in your browser and works with the network off.",
    },
  };
  const t = STRINGS[document.documentElement.lang] || STRINGS["zh-TW"];
  const fill = (key, vars) =>
    t[key].replace(/\{(\w+)\}/g, (_, name) => String(vars[name]));

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // 這一支要送的是原始位元組，所以編碼用函式庫預設的那一份（每個字元取低八位）。
  // qrcode.js 那一頁把它換成 UTF-8 版是為了中文，兩頁不會同時載入，換過來是安全的。
  // 順序很重要：容量探測靠這個設定才算得準，所以在任何 addData 之前先設好。
  window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["default"];

  // 每個版本在 M 等級裝得下多少個位元組。vendor 這一版沒有 getRawLength，用二分搜
  // 尋問它「塞得下嗎」問出來，問到的結果存起來，一個版本只算一次。
  const capacityCache = new Map();
  function capacityOf(version, level) {
    const key = version + level;
    if (capacityCache.has(key)) return capacityCache.get(key);
    let low = 0;
    let high = 3000;
    while (low < high) {
      const mid = Math.ceil((low + high + 1) / 2);
      try {
        const qr = window.qrcode(version, level);
        qr.addData("x".repeat(mid));
        qr.make();
        low = mid;
      } catch (err) {
        high = mid - 1;
      }
    }
    capacityCache.set(key, low);
    return low;
  }

  // 裝得下這麼多位元組的最小版本。小檔案不該用高版本畫，方格大一點對面好讀很多。
  function smallestVersionFor(bytes, ceiling, level) {
    for (let version = 1; version <= ceiling; version += 1) {
      if (capacityOf(version, level) >= bytes) return version;
    }
    return ceiling;
  }

  const subtle = window.crypto && window.crypto.subtle;
  const canZip = typeof window.CompressionStream === "function";
  const canUnzip = typeof window.DecompressionStream === "function";

  async function sha256Hex(bytes) {
    if (!subtle) return "";
    try {
      return toHex(await subtle.digest("SHA-256", bytes));
    } catch (err) {
      return "";
    }
  }

  // deflate-raw 走一遍。文字類的東西（PGP 公鑰、bridge 設定、設定檔）壓完常常
  // 少三到五成，張數跟著少，一輪的時間直接砍半。壓不小就照原樣送。
  async function squeeze(bytes, mode) {
    const Stream = mode === "in" ? window.CompressionStream : window.DecompressionStream;
    const stream = new Response(bytes).body.pipeThrough(new Stream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // === 傳送端 ===

  const send = {
    name: "",
    size: 0,
    hash: "",
    data: null,
    manifest: null,
    session: 0,
    total: 0,
    version: 0,
    level: "M",
    payloadSize: 0,
    compressed: false,
    frames: new Map(),
    index: 0,
    loop: 1,
    playing: false,
    timer: null,
    density: 1,
    speed: 1,
    busy: false,
    error: null,
  };

  function resetSend() {
    stopPlaying();
    send.name = "";
    send.size = 0;
    send.hash = "";
    send.data = null;
    send.manifest = null;
    send.total = 0;
    send.frames.clear();
    send.index = 0;
    send.loop = 1;
    send.error = null;
  }

  async function prepare(file) {
    resetSend();
    send.busy = true;
    renderSend();
    try {
      if (file.size > MAX_INPUT_BYTES) {
        send.error = fill("tooBig", {
          size: formatSize(file.size),
          max: formatSize(MAX_INPUT_BYTES),
        });
        return;
      }
      const raw = new Uint8Array(await file.arrayBuffer());
      if (!raw.length) {
        send.error = t.emptyFile;
        return;
      }

      let data = raw;
      let compressed = false;
      if (canZip) {
        try {
          const packed = await squeeze(raw, "in");
          // 壓不到九成大小就不值得。壓縮旗標會讓收的一端多一個必須支援的功能，
          // 省不了幾張的話沒必要把那個相依性加上去。
          if (packed.length < raw.length * 0.9) {
            data = packed;
            compressed = true;
          }
        } catch (err) {
          data = raw;
          compressed = false;
        }
      }

      const preset = DENSITY[send.density].version;
      const level = DENSITY[send.density].level;
      const hash = await sha256Hex(raw);
      const manifest = buildManifest(
        {
          name: safeName(file.name),
          size: raw.length,
          stream: data.length,
          hash: hash,
          compressed: compressed,
        },
        capacityOf(preset, level) - OVERHEAD
      );
      if (!manifest) {
        send.error = t.emptyFile;
        return;
      }

      // 版本先照設定值算，然後看看縮得縮不縮得下去。只有一張資料的時候，整份東西
      // 可能塞得進小很多的碼，那時候用大版本只是讓方格變密、對面更難讀。
      let version = preset;
      let payloadSize = capacityOf(version, level) - OVERHEAD;
      let plan = planStream(data.length, payloadSize);
      if (plan && plan.dataChunks === 1) {
        const need = Math.max(manifest.length, data.length);
        const smaller = smallestVersionFor(need + OVERHEAD, preset, level);
        if (smaller < version) {
          version = smaller;
          payloadSize = capacityOf(version, level) - OVERHEAD;
          plan = planStream(data.length, payloadSize);
        }
      }
      if (!plan) {
        send.error = fill("tooBig", {
          size: formatSize(file.size),
          max: formatSize(MAX_INPUT_BYTES),
        });
        return;
      }

      send.name = safeName(file.name);
      send.size = raw.length;
      send.hash = hash;
      send.data = data;
      send.compressed = compressed;
      send.manifest = manifest;
      send.version = version;
      send.level = level;
      send.payloadSize = payloadSize;
      send.total = plan.total;
      // sessionId 只是用來讓收的一端認出「換檔案了」，不需要不可預測，取亂數是
      // 因為連續兩次傳不同的檔案時，固定值會讓對面以為還是同一份。
      send.session = window.crypto.getRandomValues(new Uint16Array(1))[0];
    } catch (err) {
      send.error = String(err && err.message ? err.message : err);
    } finally {
      send.busy = false;
      renderSend();
    }
  }

  function payloadFor(index) {
    if (index === MANIFEST_INDEX) return send.manifest;
    const from = (index - 1) * send.payloadSize;
    return send.data.subarray(from, Math.min(from + send.payloadSize, send.data.length));
  }

  // 一張的方格矩陣。算過的留著，第二輪之後就不必再編碼一次。版本固定，短的那幾張
  // 由函式庫自己補填充，所以每一張畫出來一樣大，相機不必一直重新對焦。
  function matrixFor(index) {
    const cached = send.frames.get(index);
    if (cached) return cached;
    const frame = packFrame(send.session, send.total, index, payloadFor(index));
    const qr = window.qrcode(send.version, send.level);
    qr.addData(bytesToLatin1(frame));
    qr.make();
    const count = qr.getModuleCount();
    const modules = [];
    for (let row = 0; row < count; row += 1) {
      const line = [];
      for (let col = 0; col < count; col += 1) line.push(qr.isDark(row, col));
      modules.push(line);
    }
    send.frames.set(index, modules);
    return modules;
  }

  // 固定黑白，不跟著深色模式走。反相的 QR 有些掃描器讀得到有些讀不到，而這一頁
  // 的重點就是對面讀得到。
  function drawMatrix(canvas, modules) {
    const count = modules.length;
    const span = count + QUIET * 2;
    const ratio = window.devicePixelRatio || 1;
    const cssSize = canvas.clientWidth || 320;
    const scale = Math.max(1, Math.floor((cssSize * ratio) / span));
    const px = span * scale;
    if (canvas.width !== px) {
      canvas.width = px;
      canvas.height = px;
    }
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = "#000000";
    for (let row = 0; row < count; row += 1) {
      let start = -1;
      for (let col = 0; col <= count; col += 1) {
        const dark = col < count && modules[row][col];
        if (dark && start < 0) start = col;
        if (!dark && start >= 0) {
          ctx.fillRect((start + QUIET) * scale, (row + QUIET) * scale, (col - start) * scale, scale);
          start = -1;
        }
      }
    }
  }

  function tick() {
    if (!send.playing || !send.total) return;
    drawMatrix(dom.canvas, matrixFor(send.index));
    dom.frameNow.textContent = fill("frameNow", {
      index: send.index,
      total: send.total,
      loop: send.loop,
    });
    send.index += 1;
    if (send.index >= send.total) {
      send.index = 0;
      send.loop += 1;
    }
    send.timer = window.setTimeout(tick, 1000 / SPEED[send.speed].fps);
  }

  function startPlaying() {
    if (!send.total || send.playing) return;
    send.playing = true;
    renderSend();
    tick();
  }

  function stopPlaying() {
    send.playing = false;
    if (send.timer) {
      window.clearTimeout(send.timer);
      send.timer = null;
    }
  }

  // === 接收端 ===

  const recv = {
    source: "idle",
    stream: null,
    timer: null,
    session: null,
    total: 0,
    manifest: null,
    chunks: new Map(),
    have: new Set(),
    result: null,
    url: null,
    note: null,
    error: null,
    scanning: null,
  };

  function resetCollection() {
    recv.session = null;
    recv.total = 0;
    recv.manifest = null;
    recv.chunks.clear();
    recv.have.clear();
    dropResult();
  }

  function dropResult() {
    if (recv.url) {
      URL.revokeObjectURL(recv.url);
      recv.url = null;
    }
    recv.result = null;
  }

  // 收下一張。回傳 true 代表畫面要更新。狀態怎麼變由純邏輯的 collect 決定，
  // 這裡只做畫面上的事。
  function ingest(bytes) {
    const frame = parseFrame(bytes);
    if (!frame) return false;
    const step = collect(recv, frame);
    if (step.restarted) {
      dropResult();
      recv.note = step.discarded ? t.switched : null;
      buildGrid();
    }
    if (!step.added) return step.restarted;
    markCell(frame.index);
    if (recv.have.size === recv.total) finish();
    return true;
  }

  async function finish() {
    const manifest = recv.manifest;
    if (!manifest) return;
    const stream = assemble(recv.chunks, recv.total, manifest.stream);
    if (!stream) return;

    let data = stream;
    if (manifest.compressed) {
      if (!canUnzip) {
        recv.error = t.needUnzip;
        renderReceive();
        return;
      }
      try {
        data = await squeeze(stream, "out");
      } catch (err) {
        recv.result = { name: manifest.name, size: 0, verdict: "bad" };
        renderReceive();
        return;
      }
    }

    // 三種結果分開講。有校驗碼且相符是唯一可以安心的一種，另外兩種各自要讀者做
    // 不同的事，混成一句「完成」等於把判斷丟回去給讀者猜。
    let verdict = "nohash";
    if (manifest.hash) {
      const got = await sha256Hex(data);
      verdict = got && got === manifest.hash ? "ok" : "bad";
    }
    if (data.length !== manifest.size) verdict = "bad";

    dropResult();
    recv.url = URL.createObjectURL(new Blob([data]));
    recv.result = { name: manifest.name, size: data.length, verdict: verdict };
    renderReceive();
  }

  // 掃描用的畫布只開一個，重複用。每一張都新開一個 canvas 會讓記憶體一路長上去。
  let scanCanvas = null;
  function readPixels(source, width, height) {
    if (!scanCanvas) scanCanvas = document.createElement("canvas");
    if (scanCanvas.width !== width || scanCanvas.height !== height) {
      scanCanvas.width = width;
      scanCanvas.height = height;
    }
    const ctx = scanCanvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  }

  // 螢幕上的 QR 是正常的黑底白字，不必試反相。關掉那一輪等於把每一次解碼的成本
  // 砍一半，在手機上差別很明顯。
  function decodeFrom(source, width, height) {
    if (!window.jsQR || !width || !height) return null;
    const pixels = readPixels(source, width, height);
    const found = window.jsQR(pixels.data, width, height, { inversionAttempts: "dontInvert" });
    return found && found.binaryData ? Uint8Array.from(found.binaryData) : null;
  }

  function scaledSize(width, height, cap) {
    if (width <= cap) return { w: width, h: height };
    return { w: cap, h: Math.round((height * cap) / width) };
  }

  async function startCamera() {
    stopScanning();
    recv.error = null;
    const media = navigator.mediaDevices;
    if (!media || !media.getUserMedia) {
      recv.error = t.cameraMissing;
      renderReceive();
      return;
    }
    try {
      recv.stream = await media.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (err) {
      recv.error = t.cameraDenied;
      renderReceive();
      return;
    }
    recv.source = "camera";
    // 先把畫面露出來再播。display:none 的 <video> 在部分瀏覽器不會解出畫面張數，
    // 結果是相機開著、指示燈亮著，而掃描迴圈永遠讀到空白。
    dom.video.hidden = false;
    dom.video.srcObject = recv.stream;
    // muted 與 playsinline 少一個，iOS Safari 就不肯自動播，畫面會停在第一張。
    dom.video.muted = true;
    dom.video.setAttribute("playsinline", "");
    try {
      await dom.video.play();
    } catch (err) {
      // 播不起來多半是頁面還沒有互動紀錄，下面的迴圈照樣會等到 readyState 就位。
    }
    renderReceive();
    cameraTick();
  }

  function cameraTick() {
    if (recv.source !== "camera") return;
    const started = performance.now();
    const video = dom.video;
    if (video.readyState >= 2 && video.videoWidth) {
      const size = scaledSize(video.videoWidth, video.videoHeight, 1280);
      const bytes = decodeFrom(video, size.w, size.h);
      if (bytes && ingest(bytes)) renderReceive();
    }
    // 扣掉這一次解碼花掉的時間再等，讓掃描率貼近目標而不是被解碼時間往下拖
    const spent = performance.now() - started;
    recv.timer = window.setTimeout(cameraTick, Math.max(0, SCAN_TARGET_MS - spent));
  }

  function stopScanning() {
    if (recv.timer) {
      window.clearTimeout(recv.timer);
      recv.timer = null;
    }
    if (recv.stream) {
      recv.stream.getTracks().forEach((track) => track.stop());
      recv.stream = null;
    }
    if (dom.video) dom.video.srcObject = null;
    if (recv.scanning) recv.scanning.cancelled = true;
    recv.scanning = null;
    recv.source = "idle";
  }

  // 影片檔用逐張跳點讀，不用播放。requestVideoFrameCallback 在 Firefox 系的瀏覽器
  // 上不一定有，跳 currentTime 等 seeked 是每一家都吃的做法，而且取樣率由我們決定，
  // 不受影片本身的張數影響。
  async function scanVideo(file, job) {
    const video = document.createElement("video");
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.preload = "auto";
    const url = URL.createObjectURL(file);
    video.src = url;
    try {
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error("video"));
      });
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) return;
      const size = scaledSize(video.videoWidth, video.videoHeight, 1280);
      const step = 1 / VIDEO_SAMPLE_FPS;
      for (let at = 0; at < duration; at += step) {
        if (job.cancelled) return;
        video.currentTime = at;
        await new Promise((resolve) => {
          video.onseeked = resolve;
          video.onerror = resolve;
        });
        const bytes = decodeFrom(video, size.w, size.h);
        if (bytes) ingest(bytes);
        job.done = at / duration;
        renderReceive();
      }
    } finally {
      video.src = "";
      URL.revokeObjectURL(url);
    }
  }

  async function scanImage(file, job) {
    let bitmap = null;
    try {
      bitmap = await createImageBitmap(file);
    } catch (err) {
      return;
    }
    if (job.cancelled) return;
    const size = scaledSize(bitmap.width, bitmap.height, 2000);
    const bytes = decodeFrom(bitmap, size.w, size.h);
    if (bytes) ingest(bytes);
    if (bitmap.close) bitmap.close();
  }

  async function scanFiles(files) {
    stopScanning();
    recv.error = null;
    recv.source = "file";
    const job = { cancelled: false, done: 0, at: 0, count: files.length };
    recv.scanning = job;
    const before = recv.have.size;
    renderReceive();
    for (let i = 0; i < files.length; i += 1) {
      if (job.cancelled) break;
      job.at = i;
      const file = files[i];
      if (file.type.startsWith("video/")) await scanVideo(file, job);
      else await scanImage(file, job);
    }
    // 收尾只在這個 job 還是現行的那一個時才做。掃到一半改按開相機的話，
    // stopScanning 已經把這個 job 取消並且換上了相機那一套，這裡再收一次尾會把
    // source 蓋回 idle，結果是相機開著、指示燈亮著，而掃描迴圈早就停了。
    if (recv.scanning !== job) return;
    if (recv.have.size === before) recv.error = t.scanNothing;
    recv.scanning = null;
    recv.source = "idle";
    renderReceive();
  }

  // === 版面 ===

  const CSS = `
    #qr-stream-tool { margin: 1em 0; }
    #qr-stream-tool .qs-row {
      display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; margin: .8rem 0;
    }
    #qr-stream-tool .qs-label { color: var(--md-default-fg-color--light); font-size: .75rem; }
    #qr-stream-tool button {
      font: inherit; color: inherit; cursor: pointer; background: none;
      border: .05rem solid var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: .35rem .8rem;
    }
    #qr-stream-tool button:hover:not(:disabled):not([aria-checked="true"]):not([aria-selected="true"]) {
      border-color: var(--md-accent-fg-color); color: var(--md-accent-fg-color);
    }
    #qr-stream-tool button:disabled { opacity: .5; cursor: default; }
    #qr-stream-tool button[aria-checked="true"],
    #qr-stream-tool button[aria-selected="true"] {
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color);
    }
    #qr-stream-tool button[aria-checked="true"]:hover:not(:disabled),
    #qr-stream-tool button[aria-selected="true"]:hover:not(:disabled) { filter: brightness(1.1); }

    /* 分段控制：四個選項連成一條，中間不留空隙。
       原本每顆按鈕各自獨立、彼此隔開 .5rem，看起來就是四顆可以各按各的按鈕，
       實際上是四選一。使用者的回報是「有些看起來是單選不能多選，介面混亂」。
       連在一起是這件事的標準畫法，加上 role=radiogroup 讓讀螢幕的人也拿到同一個訊息。 */
    #qr-stream-tool .qs-seg {
      display: inline-flex; border-radius: .1rem; overflow: hidden;
      border: .05rem solid var(--md-default-fg-color--lighter);
    }
    #qr-stream-tool .qs-seg button {
      border: 0; border-radius: 0; padding: .35rem .9rem;
      border-right: .05rem solid var(--md-default-fg-color--lighter);
    }
    #qr-stream-tool .qs-seg button:last-child { border-right: 0; }
    #qr-stream-tool .qs-seg button:hover:not(:disabled):not([aria-checked="true"]) {
      background: var(--md-default-fg-color--lightest); color: inherit;
    }

    /* 編號步驟。沒輪到的步驟淡出並且擋掉點擊，讓畫面一次只有一個地方要動。 */
    #qr-stream-tool .qs-step {
      border-left: .1rem solid var(--md-default-fg-color--lightest);
      padding: .2rem 0 .2rem 1rem; margin: 1.4rem 0;
    }
    /* 0.4 會淡到看不出下一步是什麼。0.55 讓人還讀得到標題，知道等一下要做什麼，
       但一眼就分得出現在不該動它。 */
    #qr-stream-tool .qs-step[data-state="off"] { opacity: .55; pointer-events: none; }
    #qr-stream-tool .qs-step[data-state="now"] {
      border-left-color: var(--md-primary-fg-color); border-left-width: .15rem;
    }
    #qr-stream-tool .qs-step-head {
      display: flex; align-items: center; gap: .5rem; margin: 0 0 .6rem;
      font-weight: 700; font-size: .8rem;
    }
    #qr-stream-tool .qs-step-no {
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.5rem; height: 1.5rem; flex: none; border-radius: 50%;
      font-size: .7rem; font-weight: 700;
      background: var(--md-default-fg-color--lightest); color: var(--md-default-fg-color);
    }
    /* 現在這一步跟做完的都填色。原本只有 done 填，結果「現在該動哪裡」跟
       「還沒輪到」的圓圈長得一樣，編號就白編了。 */
    #qr-stream-tool .qs-step[data-state="now"] .qs-step-no,
    #qr-stream-tool .qs-step[data-state="done"] .qs-step-no {
      background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
    }
    #qr-stream-tool .qs-tabs {
      display: inline-flex; border-radius: .1rem; overflow: hidden; margin-bottom: 1.2rem;
      border: .05rem solid var(--md-default-fg-color--lighter);
    }
    #qr-stream-tool .qs-tabs button {
      border: 0; border-radius: 0; padding: .4rem 1.2rem;
      border-right: .05rem solid var(--md-default-fg-color--lighter);
    }
    #qr-stream-tool .qs-tabs button:last-child { border-right: 0; }
    /* 常駐的加密提醒。用左邊一條槓標出來，文字維持正常對比，不套 .qs-hint 的淡灰，
       這一句是操作前要讀進去的東西。 */
    #qr-stream-tool .qs-note-warn {
      font-size: .75rem; margin: .6rem 0 0;
      border-left: .15rem solid var(--md-typeset-mark-color, #ffd54f);
      padding: .4rem .6rem .4rem .8rem;
    }
    #qr-stream-tool .qs-or {
      color: var(--md-default-fg-color--light); font-size: .75rem; margin: 0 .2rem;
    }
    #qs-drop {
      border: .05rem dashed var(--md-default-fg-color--lighter);
      border-radius: .1rem; padding: 1rem; text-align: center;
    }
    #qs-drop.qs-over { border-color: var(--md-accent-fg-color); }
    #qr-stream-tool .qs-hint { color: var(--md-default-fg-color--light); font-size: .75rem; margin: .3rem 0 0; }
    #qr-stream-tool .qs-msg { font-size: .75rem; margin: .6rem 0 0; }
    /* 出錯的訊息用左邊那條紅槓標出來，文字本身維持正常對比。
       這裡原本把 --md-typeset-del-color 當成文字色用，那個色票是 #f5503d26，
       只有 15% 不透明度，material 拿它當 <del> 的底色。當底色或邊框剛好，
       當文字色會淡到讀不了，而讀不了的正好是「這個檔案太大，傳不了」這種
       非讀不可的句子。站上其他工具都只把它用在 border-left，這裡跟上。 */
    #qr-stream-tool .qs-msg.qs-bad {
      color: var(--md-default-fg-color);
      font-size: .8rem;
      border-left: .15rem solid var(--md-typeset-del-color, #f44336);
      background: var(--md-typeset-del-color, transparent);
      padding: .5rem .6rem .5rem .8rem;
      border-radius: 0 .1rem .1rem 0;
    }
    #qr-stream-tool .qs-stage {
      display: flex; justify-content: center; margin: 1rem 0 .4rem;
    }
    /* QR 固定畫成白底黑方格，容器也給白底，深色模式下四周才不會沒有留白 */
    #qr-stream-tool canvas.qs-code {
      /* 34rem 而不是 20rem。QR 在對方相機裡佔的像素跟它在螢幕上的實際大小成正比，
         畫小了等於自己把可用的版本上限壓低。手機上內容欄本來就比 20rem 窄，這一條
         在手機上沒有作用，改的是拿筆電或平板當發送端的情況。 */
      width: 100%; max-width: 34rem; height: auto; background: #fff;
      border: .05rem solid var(--md-default-fg-color--lightest); border-radius: .1rem;
      image-rendering: pixelated;
    }
    #qr-stream-tool video.qs-view {
      width: 100%; max-width: 24rem; border-radius: .1rem; background: #000;
    }
    #qr-stream-tool .qs-grid {
      display: flex; flex-wrap: wrap; gap: 2px; margin: .6rem 0;
    }
    #qr-stream-tool .qs-cell {
      width: 8px; height: 8px; border-radius: 1px;
      background: var(--md-default-fg-color--lightest);
    }
    #qr-stream-tool .qs-cell.qs-got { background: var(--md-primary-fg-color); }
    #qr-stream-tool .qs-result {
      border-left: .15rem solid var(--md-default-fg-color--lighter);
      padding: .1rem 0 .1rem .8rem; margin: .8rem 0;
    }
    /* 中間色調，淺色與深色主題下都看得見。深色主題上 #c62828 那種深紅會糊掉。 */
    #qr-stream-tool .qs-result.qs-ok { border-color: #4caf50; }
    #qr-stream-tool .qs-result.qs-bad { border-color: #ef5350; }
    /* 判定那一句是讀者要據以行動的話（「不要用這個檔案」），不套 .qs-hint 的淡灰 */
    #qr-stream-tool .qs-verdict { font-size: .8rem; margin: .3rem 0 .5rem; }
    #qr-stream-tool .qs-note {
      color: var(--md-default-fg-color--light); font-size: .7rem; margin-top: 1.2rem;
    }
    #qr-stream-tool[hidden] { display: none; }
  `;

  const dom = {};

  // 等待中的那一行要看得出在跑。這一頁有兩處會等：選了檔案之後要讀進來、算雜湊、
  // 壓一次，還有掃影片檔時一張一張跳過去。兩處都可能是好幾秒，而一行不會動的字
  // 讀者分不出是在做事還是卡住了，合理的反應是再按一次。
  //
  // 轉圈用全站共用的 .anoni-spinner（樣式在 overrides/base.html，不要各自再寫一份
  // keyframes），狀態另外用 aria-busy 講一次，轉圈的圖案對讀螢幕的人沒有意義。
  function setBusyText(node, busy, text) {
    node.textContent = "";
    if (busy) {
      const spin = el("span", "anoni-spinner");
      spin.setAttribute("aria-hidden", "true");
      node.appendChild(spin);
      node.setAttribute("aria-busy", "true");
    } else {
      node.removeAttribute("aria-busy");
    }
    node.appendChild(document.createTextNode(text));
  }

  // 四選一的群組。畫成連在一起的分段控制，語意上是 radiogroup。
  //
  // 原本用的是 aria-pressed，那是「切換按鈕」的語意，表示這一顆可以各自開關，
  // 跟實際行為相反。radio 加 aria-checked 才是「這一組裡挑一個」。
  function group(label, options, current, onPick) {
    const row = el("div", "qs-row");
    row.appendChild(el("span", "qs-label", label));
    const seg = el("div", "qs-seg");
    seg.setAttribute("role", "radiogroup");
    seg.setAttribute("aria-label", label);
    const buttons = options.map((option, at) => {
      const button = el("button", null, t[option.label]);
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(at === current()));
      button.addEventListener("click", () => {
        onPick(at);
        buttons.forEach((other, index) =>
          other.setAttribute("aria-checked", String(index === current()))
        );
      });
      seg.appendChild(button);
      return button;
    });
    row.appendChild(seg);
    return row;
  }

  // 一個編號步驟。回傳的 body 是要往裡面塞內容的容器。
  function step(number, title) {
    const section = el("section", "qs-step");
    section.dataset.state = "off";
    const head = el("p", "qs-step-head");
    head.appendChild(el("span", "qs-step-no", String(number)));
    head.appendChild(el("span", null, title));
    section.appendChild(head);
    const body = el("div");
    section.appendChild(body);
    section.body = body;
    return section;
  }

  // off 是還沒輪到（淡出並擋掉點擊），now 是現在要動的，done 是做完了。
  function setStep(section, state) {
    if (section) section.dataset.state = state;
  }

  function build() {
    const style = document.createElement("style");
    style.textContent = CSS;
    root.appendChild(style);

    const tabs = el("div", "qs-tabs");
    tabs.setAttribute("role", "tablist");
    dom.tabSend = el("button", null, t.tabSend);
    dom.tabRecv = el("button", null, t.tabReceive);
    for (const tab of [dom.tabSend, dom.tabRecv]) {
      tab.type = "button";
      tab.setAttribute("role", "tab");
    }
    tabs.appendChild(dom.tabSend);
    tabs.appendChild(dom.tabRecv);
    root.appendChild(tabs);

    // --- 傳送：選檔案、調整、播放 ---
    dom.sendPanel = el("div", "qs-panel");

    dom.stepPick = step(1, t.stepPick);
    dom.stepTune = step(2, t.stepTune);
    dom.stepPlay = step(3, t.stepPlay);

    const drop = el("div", null);
    drop.id = "qs-drop";
    dom.fileInput = document.createElement("input");
    dom.fileInput.type = "file";
    dom.fileInput.hidden = true;
    dom.pick = el("button", null, t.pick);
    dom.pick.type = "button";
    dom.pick.addEventListener("click", () => dom.fileInput.click());
    dom.fileInput.addEventListener("change", () => {
      if (dom.fileInput.files && dom.fileInput.files[0]) prepare(dom.fileInput.files[0]);
    });
    drop.appendChild(dom.fileInput);
    drop.appendChild(dom.pick);
    drop.appendChild(el("p", "qs-hint", t.dropHint));
    // 拖放整塊都吃，不只按鈕
    drop.addEventListener("dragover", (event) => {
      event.preventDefault();
      drop.classList.add("qs-over");
    });
    drop.addEventListener("dragleave", () => drop.classList.remove("qs-over"));
    drop.addEventListener("drop", (event) => {
      event.preventDefault();
      drop.classList.remove("qs-over");
      const file = event.dataTransfer && event.dataTransfer.files[0];
      if (file) prepare(file);
    });
    dom.stepPick.body.appendChild(drop);

    // 加密提醒長在第一步裡，不放在文章。工具的 div 在頁面最上面，在所有文字之前，
    // 打開頁面第一眼看到的就是可以直接按的「傳送」分頁。只把警告寫進文章，等於
    // 只保護了會從頭讀到尾的人，而真正需要它的是急著在現場操作、根本不讀文字的人。
    const note = el("p", "qs-note-warn");
    note.appendChild(document.createTextNode(t.pickNote + " "));
    const noteLink = el("a", null, t.pickNoteLink);
    noteLink.href = t.pickNoteHref;
    note.appendChild(noteLink);
    dom.stepPick.body.appendChild(note);

    dom.plan = el("p", "qs-hint", "");
    dom.stepPick.body.appendChild(dom.plan);
    dom.sendPanel.appendChild(dom.stepPick);

    dom.stepTune.body.appendChild(
      group(
        t.density,
        [
          { label: "densitySmall" },
          { label: "densityMedium" },
          { label: "densityLarge" },
          { label: "densityHuge" },
        ],
        () => send.density,
        (at) => {
          send.density = at;
          // 密度換了，切法整個變了，已經編好的影格作廢。
          if (send.data) reslice();
          else renderSend();
        }
      )
    );
    dom.stepTune.body.appendChild(el("p", "qs-hint", t.densityHint));

    dom.stepTune.body.appendChild(
      group(
        t.speed,
        [{ label: "speedSlow" }, { label: "speedMedium" }, { label: "speedFast" }],
        () => send.speed,
        (at) => {
          send.speed = at;
          renderSend();
        }
      )
    );

    dom.stepTune.body.appendChild(el("p", "qs-hint", t.speedHint));
    dom.sendPanel.appendChild(dom.stepTune);

    const playRow = el("div", "qs-row");
    dom.play = el("button", null, t.play);
    dom.play.type = "button";
    dom.play.addEventListener("click", () => {
      if (send.playing) {
        stopPlaying();
        renderSend();
      } else {
        startPlaying();
      }
    });
    playRow.appendChild(dom.play);
    dom.stepPlay.body.appendChild(playRow);

    const stage = el("div", "qs-stage");
    dom.canvas = el("canvas", "qs-code");
    dom.canvas.setAttribute("role", "img");
    dom.canvas.setAttribute("aria-label", "QR code");
    stage.appendChild(dom.canvas);
    dom.stepPlay.body.appendChild(stage);
    dom.frameNow = el("p", "qs-hint", "");
    dom.stepPlay.body.appendChild(dom.frameNow);
    dom.sendPanel.appendChild(dom.stepPlay);

    // 訊息列留在步驟外面。出錯的時候步驟可能還是 off 狀態，訊息不該跟著淡掉。
    dom.sendMsg = el("p", "qs-msg", "");
    dom.sendPanel.appendChild(dom.sendMsg);
    root.appendChild(dom.sendPanel);

    // --- 接收：開相機、對準、存檔 ---
    dom.recvPanel = el("div", "qs-panel");
    dom.stepCamera = step(1, t.stepCamera);
    dom.stepAim = step(2, t.stepAim);
    dom.stepSave = step(3, t.stepSave);
    const recvRow = el("div", "qs-row");
    dom.camera = el("button", null, t.camera);
    dom.camera.type = "button";
    dom.camera.addEventListener("click", () => {
      if (recv.source === "camera") {
        stopScanning();
        renderReceive();
      } else {
        startCamera();
      }
    });
    dom.mediaInput = document.createElement("input");
    dom.mediaInput.type = "file";
    dom.mediaInput.accept = "video/*,image/*";
    dom.mediaInput.multiple = true;
    dom.mediaInput.hidden = true;
    dom.mediaInput.addEventListener("change", () => {
      const files = Array.from(dom.mediaInput.files || []);
      if (files.length) scanFiles(files);
    });
    dom.fromFile = el("button", null, t.fromFile);
    dom.fromFile.type = "button";
    dom.fromFile.addEventListener("click", () => {
      if (recv.scanning) {
        recv.scanning.cancelled = true;
        return;
      }
      dom.mediaInput.click();
    });
    recvRow.appendChild(dom.camera);
    // 兩顆是兩條路，不是兩個選項。中間放一個「或」，免得看起來像要兩個都按。
    recvRow.appendChild(el("span", "qs-or", t.or));
    recvRow.appendChild(dom.fromFile);
    recvRow.appendChild(dom.mediaInput);
    dom.stepCamera.body.appendChild(recvRow);
    dom.recvPanel.appendChild(dom.stepCamera);

    const view = el("div", "qs-stage");
    dom.video = el("video", "qs-view");
    dom.video.setAttribute("playsinline", "");
    dom.video.muted = true;
    view.appendChild(dom.video);
    dom.stepAim.body.appendChild(view);

    dom.progress = el("p", "qs-hint", t.waiting);
    dom.stepAim.body.appendChild(dom.progress);
    dom.grid = el("div", "qs-grid");
    dom.stepAim.body.appendChild(dom.grid);
    dom.missing = el("p", "qs-hint", "");
    dom.stepAim.body.appendChild(dom.missing);
    dom.recvPanel.appendChild(dom.stepAim);

    dom.result = el("div", "qs-result");
    dom.result.hidden = true;
    dom.stepSave.body.appendChild(dom.result);

    const resetRow = el("div", "qs-row");
    dom.reset = el("button", null, t.reset);
    dom.reset.type = "button";
    dom.reset.addEventListener("click", () => {
      resetCollection();
      recv.note = null;
      recv.error = null;
      buildGrid();
      renderReceive();
    });
    resetRow.appendChild(dom.reset);
    dom.stepSave.body.appendChild(resetRow);
    dom.recvPanel.appendChild(dom.stepSave);

    dom.recvMsg = el("p", "qs-msg", "");
    dom.recvPanel.appendChild(dom.recvMsg);
    root.appendChild(dom.recvPanel);

    root.appendChild(el("p", "qs-note", t.note));

    dom.tabSend.addEventListener("click", () => setTab("send"));
    dom.tabRecv.addEventListener("click", () => setTab("recv"));
    setTab("send");
  }

  // 切分頁的時候一定要把另一邊停掉。相機留著轉是最糟的一種殘留，讀者以為換頁就
  // 關了，實際上指示燈還亮著。
  function setTab(which) {
    dom.tab = which;
    if (which === "send") stopScanning();
    else stopPlaying();
    dom.tabSend.setAttribute("aria-selected", String(which === "send"));
    dom.tabRecv.setAttribute("aria-selected", String(which === "recv"));
    dom.sendPanel.hidden = which !== "send";
    dom.recvPanel.hidden = which !== "recv";
    renderSend();
    renderReceive();
  }

  // 換密度之後重新切一次。原始檔案已經在 send.data 裡，不必再讀一次磁碟。
  function reslice() {
    const data = send.data;
    const name = send.name;
    const size = send.size;
    const compressed = send.compressed;
    const hash = send.hash || "";
    stopPlaying();
    send.frames.clear();
    send.index = 0;
    send.loop = 1;
    const preset = DENSITY[send.density].version;
    const level = DENSITY[send.density].level;
    const manifest = buildManifest(
      { name: name, size: size, stream: data.length, hash: hash, compressed: compressed },
      capacityOf(preset, level) - OVERHEAD
    );
    let version = preset;
    let payloadSize = capacityOf(version, level) - OVERHEAD;
    let plan = planStream(data.length, payloadSize);
    if (manifest && plan && plan.dataChunks === 1) {
      const smaller = smallestVersionFor(
        Math.max(manifest.length, data.length) + OVERHEAD,
        preset,
        level
      );
      if (smaller < version) {
        version = smaller;
        payloadSize = capacityOf(version, level) - OVERHEAD;
        plan = planStream(data.length, payloadSize);
      }
    }
    if (!manifest || !plan) {
      send.error = t.emptyFile;
      renderSend();
      return;
    }
    send.manifest = manifest;
    send.version = version;
    send.level = level;
    send.payloadSize = payloadSize;
    send.total = plan.total;
    send.session = window.crypto.getRandomValues(new Uint16Array(1))[0];
    renderSend();
  }

  function renderSend() {
    if (!dom.sendPanel || dom.tab !== "send") return;

    // 三個步驟的狀態。挑好檔案之前後面兩步是淡的而且點不動，畫面一次只有一個
    // 地方要動，不會像原本那樣一整片按鈕攤開來讓人不知道從哪裡開始。
    const ready = send.total > 0;
    setStep(dom.stepPick, ready ? "done" : "now");
    setStep(dom.stepTune, ready ? "now" : "off");
    setStep(dom.stepPlay, send.playing ? "done" : ready ? "now" : "off");

    dom.pick.textContent = send.data ? t.change : t.pick;
    dom.play.disabled = !send.total;
    dom.play.textContent = send.playing ? t.pause : t.play;
    dom.canvas.hidden = !send.total;
    dom.sendMsg.classList.toggle("qs-bad", Boolean(send.error));

    if (send.busy) {
      setBusyText(dom.plan, true, t.reading);
    } else if (send.error) {
      setBusyText(dom.plan, false, "");
    } else if (send.total) {
      const seconds = send.total / SPEED[send.speed].fps;
      setBusyText(
        dom.plan,
        false,
        fill(send.compressed ? "planZip" : "plan", {
          name: send.name,
          size: formatSize(send.size),
          stream: formatSize(send.data.length),
          total: send.total,
          payload: send.payloadSize,
          duration: formatDuration(seconds),
        })
      );
      dom.sendMsg.textContent = send.playing
        ? t.sendHint
        : seconds > 120
          ? fill("longWarn", { duration: formatDuration(seconds) })
          : "";
    } else {
      setBusyText(dom.plan, false, "");
      dom.sendMsg.textContent = "";
    }
    if (send.error) dom.sendMsg.textContent = send.error;
    if (!send.total) dom.frameNow.textContent = "";
    if (send.total && !send.playing) drawMatrix(dom.canvas, matrixFor(send.index));
  }

  // 每一張在進度圖上佔一小塊。收到的變實心，一眼就看得出是零星漏還是整段沒進來，
  // 比一行「還缺 12 張」有用得多。
  function buildGrid() {
    if (!dom.grid) return;
    dom.grid.textContent = "";
    dom.cells = [];
    for (let index = 0; index < recv.total; index += 1) {
      const cell = el("div", "qs-cell");
      dom.grid.appendChild(cell);
      dom.cells.push(cell);
    }
  }

  function markCell(index) {
    if (dom.cells && dom.cells[index]) dom.cells[index].classList.add("qs-got");
  }

  function renderReceive() {
    if (!dom.recvPanel || dom.tab !== "recv") return;

    const looking = recv.source !== "idle" || Boolean(recv.scanning);
    const collecting = recv.have.size > 0;
    setStep(dom.stepCamera, looking || collecting ? "done" : "now");
    setStep(dom.stepAim, recv.result ? "done" : looking || collecting ? "now" : "off");
    setStep(dom.stepSave, recv.result ? "now" : "off");

    dom.camera.textContent = recv.source === "camera" ? t.cameraStop : t.camera;
    dom.fromFile.textContent = recv.scanning ? t.scanCancel : t.fromFile;
    dom.video.hidden = recv.source !== "camera";
    dom.reset.disabled = recv.have.size === 0 && !recv.result;

    if (recv.scanning) {
      const share = (recv.scanning.at + recv.scanning.done) / recv.scanning.count;
      setBusyText(dom.progress, true, fill("scanFile", { percent: Math.round(share * 100) }));
    } else if (recv.total) {
      setBusyText(
        dom.progress,
        false,
        fill("progress", { have: recv.have.size, total: recv.total })
      );
    } else {
      setBusyText(dom.progress, false, t.waiting);
    }

    const gaps = recv.total && recv.have.size < recv.total
      ? missingSummary(recv.have, recv.total, 8)
      : "";
    dom.missing.textContent = gaps ? fill("missing", { list: gaps }) : "";

    dom.recvMsg.classList.toggle("qs-bad", Boolean(recv.error));
    dom.recvMsg.textContent = recv.error || recv.note || "";

    dom.result.hidden = !recv.result;
    if (recv.result) {
      const verdict = recv.result.verdict;
      dom.result.textContent = "";
      dom.result.className = "qs-result " + (verdict === "ok" ? "qs-ok" : verdict === "bad" ? "qs-bad" : "");
      dom.result.appendChild(
        el(
          "p",
          null,
          fill("resultLine", {
            name: recv.result.name,
            size: formatSize(recv.result.size),
          })
        )
      );
      dom.result.appendChild(
        el("p", "qs-verdict", verdict === "ok" ? t.resultOk : verdict === "bad" ? t.resultBad : t.resultNoHash)
      );
      const link = el("a", null, t.save);
      link.href = recv.url;
      link.download = recv.result.name;
      dom.result.appendChild(link);
    }
  }

  // 離開頁面就把相機關掉。切分頁那條路徑已經有處理，這一條補的是直接關掉分頁、
  // 上一頁、或手機把瀏覽器切到背景的情況。
  window.addEventListener("pagehide", stopScanning);

  build();
})();
