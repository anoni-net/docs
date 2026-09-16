#!/usr/bin/env node
/**
 * 用 CDP 開兩個分頁，讓實驗台自己跟自己連一次，走完握手與傳輸。
 *
 * 這一支不是實驗本身。實驗的數字要在兩台真的裝置上量（見 issue #553 的測試矩陣），
 * 這裡量的是同一台機器上的回送，用途是確認頁面邏輯沒壞，以及先看一眼 SDP 的大小。
 *
 * 回送量到的兩件事可以信：SDP 的位元組數與換算出來的 QR 張數（H1 的第一個數字），
 * 以及 SHA-256 比對有沒有一致。回送量到的吞吐量不能信，那是本機記憶體之間的複製，
 * 跟 Wi-Fi 上的數字沒有關係。握手耗時也不能信，它含了這支腳本自己的等待。
 *
 * 前置條件跟 repo 裡其他 check_*.mjs 一樣，要先建置再自己開好兩樣東西：
 *
 *   cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false bash run.sh
 *   python3 -m http.server 8790 --directory docs/output
 *   google-chrome --headless=new --remote-debugging-port=9223 \
 *     --user-data-dir=/tmp/chrome-lab-profile about:blank
 *
 * 用法：
 *   node tools/webrtc-lab/run-loopback.mjs
 *   LAB_URL=http://localhost:8790/lab/webrtc-transfer/ node tools/webrtc-lab/run-loopback.mjs
 */
const CDP_PORT = process.env.CDP_PORT || "9223";
const LAB_URL = process.env.LAB_URL || "http://localhost:8790/lab/webrtc-transfer/";
const SIZES = [1048576, 5242880];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openTab() {
  const target = await (
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${LAB_URL}`, { method: "PUT" })
  ).json();
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
  return { evaluate, close: () => ws.close() };
}

async function until(fn, label, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await fn();
    if (value) return value;
    await wait(200);
  }
  throw new Error(`逾時：${label}`);
}

const a = await openTab();
const b = await openTab();
// 固定等一段時間不可靠。頁面多載了 QR 的兩支函式庫之後，1.2 秒常常還沒跑到
// webrtc-lab.js，改成等把手真的出現。
const ready = "typeof __lab === 'object' && document.readyState === 'complete'";
await until(() => a.evaluate(ready), "發起方頁面載入");
await until(() => b.evaluate(ready), "回應方頁面載入");

await a.evaluate("__lab.offer()");
const offer = await until(() => a.evaluate("__lab.localSdp()"), "發起方產生描述");

await b.evaluate("__lab.answer()");
await b.evaluate(`__lab.apply(${JSON.stringify(offer)})`);
const answer = await until(() => b.evaluate("__lab.localSdp()"), "回應方產生描述");
await a.evaluate(`__lab.apply(${JSON.stringify(answer)})`);

await until(
  async () => (await a.evaluate("JSON.stringify(__lab.state())")).includes('"open"'),
  "DataChannel 開啟"
);

const sdp = JSON.parse(
  await a.evaluate('JSON.stringify(__lab.log().filter((r) => r.event === "sdp-stats")[0])')
);
console.log("SDP 量測（發起方）");
console.log(`  原始 ${sdp.raw} B，精簡後 ${sdp.trimmed} B，gzip 加 base64 ${sdp.base64} B`);
console.log(`  candidate ${sdp.candidates} 行，換算中檔 QR ${sdp.qrFrames} 張，播 ${sdp.qrSeconds} 秒`);

let failed = false;
for (const size of SIZES) {
  await a.evaluate(`__lab.send(${size})`);
  const done = await until(
    async () => {
      const rows = JSON.parse(
        await b.evaluate('JSON.stringify(__lab.log().filter((r) => r.event === "recv-done"))')
      );
      const last = rows[rows.length - 1];
      return last && last.size === size ? last : null;
    },
    `${size} 位元組傳完`,
    120000
  );
  const label = `${(size / 1048576).toFixed(0)} MB`;
  console.log(`傳 ${label}：SHA-256 ${done.match ? "一致" : "不一致"}，耗時 ${done.seconds} 秒`);
  if (!done.match) failed = true;
}

a.close();
b.close();
console.log(failed ? "\n有一次比對不一致，頁面邏輯要查" : "\n回送流程走完，收到的內容與來源一致");
process.exit(failed ? 1 : 0);
