#!/usr/bin/env node
/**
 * 用兩顆 headless Chrome 各接一個假攝影機，讓實驗頁真的透過相機互掃 QR code 連上線。
 *
 * run-loopback.mjs 走的是複製貼上那條路，相機與 QR 完全沒碰到。這一支補那一段：
 * 產生 QR、getUserMedia、video、canvas、jsQR、解封包、自動套用，整條都在瀏覽器裡跑。
 *
 * 兩邊都只按開始，不選角色。B 的鏡頭先看到 A 的發起描述，B 自動回應並換上回應描述，
 * A 的鏡頭再看到它就連上。之後讓 A 的鏡頭看到 B 換回來的發起描述，確認 A 認得出已經
 * 連著這一台，不會再開第二條。
 *
 * 做法跟 tools/check_qrstream_browser.mjs 一樣，Chrome 可以拿一個 Y4M 檔當鏡頭拍到的
 * 畫面（--use-file-for-fake-video-capture）。兩顆 Chrome 各一個檔：A 的鏡頭看到 B 的
 * 螢幕，B 的鏡頭看到 A 的螢幕。檔案在呼叫 getUserMedia 的時候才被打開，所以等對面
 * 產生 QR 之後再寫就來得及。
 *
 * 兩顆 Chrome 是兩個獨立的行程，彼此解析不到對方的 mDNS 名稱，所以關掉
 * WebRtcHideLocalIpsWithMdns 讓候選直接帶 IP。真機上不會有這個問題。
 *
 * 前置條件：先建置，並且用 127.0.0.1 供裝（getUserMedia 需要安全上下文，
 * 127.0.0.1 算，區網 IP 不算）。
 *
 *   cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false bash run.sh && cd ..
 *   python3 -m http.server 8790 --bind 127.0.0.1 --directory docs/output
 *   node tools/webrtc-lab/run-qr-camera.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const LAB_URL = process.env.LAB_URL || "http://127.0.0.1:8790/lab/webrtc-transfer/";
const W = 1280;
const H = 720;
const FPS = 10;
const FRAMES = 10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 把方格矩陣畫成一張灰底白框的畫面，只有亮度平面，色度全填中間值。
function writeY4M(file, rows) {
  const y = new Uint8Array(W * H).fill(210);
  if (rows) {
    const count = rows.length;
    const quiet = 4;
    const span = count + quiet * 2;
    const scale = Math.floor((H * 0.85) / span);
    const size = span * scale;
    const left = ((W - size) / 2) | 0;
    const top = ((H - size) / 2) | 0;
    for (let row = 0; row < size; row += 1) {
      y.fill(255, (top + row) * W + left, (top + row) * W + left + size);
    }
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (rows[row][col] !== "1") continue;
        const y0 = top + (row + quiet) * scale;
        const x0 = left + (col + quiet) * scale;
        for (let dy = 0; dy < scale; dy += 1) {
          y.fill(0, (y0 + dy) * W + x0, (y0 + dy) * W + x0 + scale);
        }
      }
    }
  }
  const chroma = Buffer.alloc((W / 2) * (H / 2), 128);
  const parts = [Buffer.from(`YUV4MPEG2 W${W} H${H} F${FPS}:1 Ip A1:1 C420\n`)];
  for (let i = 0; i < FRAMES; i += 1) {
    parts.push(Buffer.from("FRAME\n"), Buffer.from(y), chroma, chroma);
  }
  fs.writeFileSync(file, Buffer.concat(parts));
}

async function launch(label, port, camera) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), `webrtc-lab-${label}-`));
  const proc = spawn(
    "google-chrome",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--no-first-run",
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${port}`,
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${camera}`,
      "--autoplay-policy=no-user-gesture-required",
      "--disable-features=WebRtcHideLocalIpsWithMdns",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let target = null;
  for (let i = 0; i < 100 && !target; i += 1) {
    await sleep(200);
    try {
      target = await (await fetch(`http://127.0.0.1:${port}/json/new?${LAB_URL}`, { method: "PUT" })).json();
    } catch (err) {
      // Chrome 還沒起來
    }
  }
  if (!target) throw new Error(`${label} 的 Chrome 沒有起來`);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let id = 0;
  await new Promise((resolve) => (ws.onopen = resolve));
  ws.onmessage = (message) => {
    const msg = JSON.parse(message.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const next = ++id;
      pending.set(next, resolve);
      ws.send(JSON.stringify({ id: next, method, params }));
    });
  await send("Runtime.enable");
  const evaluate = async (expression) => {
    const reply = await send("Runtime.evaluate", { expression, returnByValue: true });
    const failed = reply.result && reply.result.exceptionDetails;
    if (failed) throw new Error(String(failed.exception && failed.exception.description).slice(0, 300));
    return reply.result && reply.result.result ? reply.result.result.value : undefined;
  };
  // Chrome 被結束時還在寫 profile，馬上刪會遇到 ENOTEMPTY。等行程真的結束再刪，
  // 刪不掉也不讓它蓋掉真正的檢查結果。
  const close = async () => {
    ws.close();
    const exited = new Promise((resolve) => proc.once("exit", resolve));
    proc.kill();
    await Promise.race([exited, sleep(3000)]);
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch (err) {
      console.error(`暫存 profile 沒刪乾淨：${profile}`);
    }
  };
  return { evaluate, close };
}

async function until(fn, label, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await fn();
    if (value) return value;
    await sleep(200);
  }
  throw new Error(`逾時：${label}`);
}

const event = (page, name) =>
  page.evaluate(`JSON.stringify(__lab.log().filter((r) => r.event === ${JSON.stringify(name)}))`).then(JSON.parse);

const camA = path.join(os.tmpdir(), "webrtc-lab-cam-a.y4m");
const camB = path.join(os.tmpdir(), "webrtc-lab-cam-b.y4m");
writeY4M(camA, null);
writeY4M(camB, null);

const pages = [];
let failed = false;
try {
  const a = await launch("a", 9331, camA);
  pages.push(a);
  const b = await launch("b", 9332, camB);
  pages.push(b);
  await until(() => a.evaluate("typeof __lab === 'object' && document.readyState === 'complete'"), "A 頁面載入");
  await until(() => b.evaluate("typeof __lab === 'object' && document.readyState === 'complete'"), "B 頁面載入");
  if (!(await a.evaluate("window.isSecureContext"))) throw new Error("不是安全上下文，網址要用 127.0.0.1");

  // 兩邊都按開始，畫面放各自的發起描述，相機同時打開
  await a.evaluate("__lab.start()");
  const offerQr = await until(() => a.evaluate("__lab.qrMatrix()"), "A 顯示 QR");

  // 先讓 B 的鏡頭看到一個網址的 QR code。那不是這一頁產生的，要認得出來而且不能拿去
  // 套用，否則讀者掃到海報上的網址就會把連線弄壞。
  const foreignQr = await a.evaluate(`(() => {
    window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["default"];
    const qr = window.qrcode(0, "M");
    qr.addData("https://anoni.net/docs/", "Byte");
    qr.make();
    const n = qr.getModuleCount();
    const rows = [];
    for (let r = 0; r < n; r += 1) {
      let line = "";
      for (let c = 0; c < n; c += 1) line += qr.isDark(r, c) ? "1" : "0";
      rows.push(line);
    }
    return rows;
  })()`);
  writeY4M(camB, foreignQr);
  await b.evaluate("__lab.start()");
  const seen = await until(
    async () => {
      const status = await b.evaluate("__lab.scanStatus()");
      return status.foreign > 0 ? status : null;
    },
    "B 認出別的 QR code"
  );
  const applied = (await event(b, "remote-description")).length;
  console.log(`別的 QR code：認出 ${seen.foreign} 次，仍在掃描 ${seen.scanning}，誤套用 ${applied} 次`);
  if (!seen.scanning || applied > 0) failed = true;
  await b.evaluate("__lab.stopScan()");

  // B 的鏡頭換成 A 的發起描述。假攝影機的檔案在 getUserMedia 時才讀，所以重新開一次相機。
  // B 自動回應，畫面換成回應描述，A 的鏡頭看到它
  writeY4M(camB, offerQr.rows);
  await b.evaluate("__lab.scan()");
  await until(async () => (await event(b, "qr-shown")).some((r) => r.type === "answer"), "B 掃到並顯示回應 QR");
  const answerQr = await b.evaluate("__lab.qrMatrix()");
  writeY4M(camA, answerQr.rows);

  // A 掃 B，連上
  await a.evaluate("__lab.scan()");
  const isOpen = async (page) => (await page.evaluate("JSON.stringify(__lab.state())")).includes('"channel":"open"');
  await until(() => isOpen(a), "A 掃到回應並開通");
  await until(() => isOpen(b), "B 開通");

  // 自動套用之後，掃到的內容仍然要留在第三區的文字框，第三區的說明要寫出已經連上
  const remoteB = await b.evaluate("__lab.remoteText()");
  const typeB = remoteB ? JSON.parse(remoteB).type : null;
  const noteA = await until(async () => {
    const note = await a.evaluate("__lab.scanNote()");
    return note && !note.includes("正在") ? note : null;
  }, "A 的第三區說明更新");
  console.log(`B 的文字框：${typeB || "空的"}；A 的第三區：${noteA}`);
  if (typeB !== "offer" || !/已經連上/.test(noteA)) failed = true;

  const shownA = (await event(a, "qr-shown")).find((r) => r.type === "offer");
  const shownB = (await event(b, "qr-shown")).find((r) => r.type === "answer");
  const scannedB = (await event(b, "qr-scanned"))[0];
  // qr-scanned 在套用完、換上下一張發起描述之後才記，可能比開通晚一點
  const scannedA = await until(async () => (await event(a, "qr-scanned"))[0], "A 記下掃描結果");
  const openA = (await event(a, "datachannel-open"))[0];
  console.log("QR 內容");
  console.log(`  發起描述 ${shownA.bytes} B（${shownA.format}），第 ${shownA.version} 版，容錯 ${shownA.level}`);
  console.log(`  回應描述 ${shownB.bytes} B（${shownB.format}），第 ${shownB.version} 版，容錯 ${shownB.level}`);
  // 兩顆 Chrome 交出的是 SHA-256 指紋加明碼 IPv4，一定編得出只帶欄位的封包。
  // 退回完整描述照樣連得上，所以要在這裡攔，不然編碼壞掉也看不出來。
  for (const [who, shown] of [["發起", shownA], ["回應", shownB]]) {
    if (shown.format !== "compact") {
      console.log(`  ${who}描述退回完整描述：${shown.fallback}`);
      failed = true;
    }
  }
  console.log("相機掃描（假攝影機，耗時含開相機）");
  console.log(`  B 掃 A：${scannedB.ms} ms`);
  console.log(`  A 掃 B：${scannedA.ms} ms`);
  console.log(`連線：協定 ${openA.negotiateMs} ms`);
  // 相機權限在頁面載入時就有，統計資料才給得出本機位址，位址類別要在這裡驗
  const pairA = await until(async () => (await event(a, "candidate-pair"))[0], "A 記下候選對");
  console.log(`候選對：${pairA.local} / ${pairA.remote}，位址類別 ${pairA.localNet} / ${pairA.remoteNet}，RTT ${pairA.rttMs} ms`);
  if (pairA.localNet === "unknown" || pairA.localNet === "cgnat" || pairA.localNet === "tailscale") failed = true;
  if (scannedB.outcome !== "answered" || scannedA.outcome !== "applied") {
    console.log(`  掃描結果不對：B ${scannedB.outcome}、A ${scannedA.outcome}`);
    failed = true;
  }

  // B 連上之後畫面換回自己的發起描述。A 的相機還開著，掃到它要認得出已經連著 B
  await until(async () => (await event(b, "qr-shown")).filter((r) => r.type === "offer").length >= 2, "B 換回發起描述");
  writeY4M(camA, (await b.evaluate("__lab.qrMatrix()")).rows);
  await a.evaluate("__lab.scan()");
  const again = await until(async () => (await event(a, "qr-scanned"))[1], "A 再掃到 B");
  const peersA = JSON.parse(await a.evaluate("JSON.stringify(__lab.state())")).peers.length;
  console.log(`再掃到已連上的裝置：${again.outcome}，A 手上 ${peersA} 條連線`);
  if (again.outcome !== "known" || peersA !== 1) failed = true;

  await a.evaluate("__lab.stopScan()");
  await b.evaluate("__lab.stopScan()");
  await a.evaluate("__lab.send(1048576)");
  const recv = await until(async () => (await event(b, "recv-done"))[0], "B 收完 1 MB", 60000);
  console.log(`傳 1 MB：SHA-256 ${recv.match ? "一致" : "不一致"}`);
  if (!recv.match) failed = true;

} catch (err) {
  console.error(String(err && err.message));
  failed = true;
} finally {
  for (const page of pages) await page.close();
  fs.rmSync(camA, { force: true });
  fs.rmSync(camB, { force: true });
}

console.log(failed ? "\n有步驟失敗" : "\n相機互掃 QR 走完，連線與傳輸都對");
process.exit(failed ? 1 : 0);
