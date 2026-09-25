#!/usr/bin/env node
/**
 * 用 CDP 開幾個分頁，讓實驗台自己跟自己連，走完配對、互相介紹與傳輸。
 *
 * 這一支不是實驗本身。實驗的數字要在實體裝置上量（見 issue #553 的測試矩陣），
 * 這裡量的是同一台機器上的回送，用途是確認頁面邏輯沒壞，以及先看一眼 SDP 的大小。
 *
 * 走三種情況，描述都用複製貼上那條路交換（__lab.apply）：
 *
 *   1. A 跟 B 互貼，C 再跟 B 互貼。A 與 C 沒有直接交換過描述，要靠 B 介紹連上。
 *   2. D 與 E 同時回應對方的發起描述，兩條連線都可能開通，最後每一邊只能留一條。
 *   3. G 與 H 回應同一張 F 的發起描述。F 套上 G 的回應之後，H 的回應要被認出來是
 *      晚了一步；H 改回應 F 換上的新描述之後照樣連得上，G 與 H 再經由 F 互相介紹。
 *   另外在第 1 種情況裡確認預設參數，再換三組傳輸參數送檔（最多 12 條連線），確認多條通道、多條連線照位置組回來。
 *   4. I 套上一份連不到的回應（候選換成 TEST-NET 位址，產生它的分頁已經關掉），
 *      15 秒後要判定連不上並收掉那一條，而不是一直停在建立中。
 *
 * 回送量到的兩件事可以信：SDP 的位元組數，以及 SHA-256 比對有沒有一致。回送量到的
 * 吞吐量不能信，那是本機記憶體之間的複製，跟 Wi-Fi 上的數字沒有關係。握手耗時也不能信，
 * 它含了這支腳本自己的等待。
 *
 * 前置條件跟 repo 裡其他 check_*.mjs 一樣，要先建置再自己開好兩樣東西：
 *
 *   cd docs && SOCIAL_CARDS=false PRIVACY_ASSETS=false bash run.sh
 *   python3 -m http.server 8790 --bind 127.0.0.1 --directory docs/output
 *   google-chrome --headless=new --remote-debugging-port=9223 \
 *     --user-data-dir=/tmp/chrome-lab-profile about:blank
 *
 * 用法：
 *   node tools/webrtc-lab/run-loopback.mjs
 *   LAB_URL=http://127.0.0.1:8790/lab/webrtc-transfer/ node tools/webrtc-lab/run-loopback.mjs
 */
const CDP_PORT = process.env.CDP_PORT || "9223";
const LAB_URL = process.env.LAB_URL || "http://127.0.0.1:8790/lab/webrtc-transfer/";
const SIZES = [1048576, 5242880];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openTab(label) {
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
  // 新版 Chrome 的 /json/new 不一定照網址載入，停在 about:blank，明確導過去一次
  await send("Page.enable");
  await send("Page.navigate", { url: LAB_URL });
  const evaluate = async (expression, awaitPromise = false) => {
    const reply = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise });
    const failed = reply.result && reply.result.exceptionDetails;
    if (failed) throw new Error(String(failed.exception && failed.exception.description).slice(0, 300));
    return reply.result && reply.result.result ? reply.result.result.value : undefined;
  };
  // 分頁要真的關掉。只關 WebSocket 的話分頁留著，每一頁有八條備用連線，重跑幾次就累積上百條
  const close = async () => {
    ws.close();
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${target.id}`).catch(() => {});
  };
  const tab = { label, evaluate, close };
  await until(
    () => evaluate("typeof __lab === 'object' && document.readyState === 'complete'"),
    `${label} 頁面載入`
  );
  return tab;
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

const state = async (tab) => JSON.parse(await tab.evaluate("JSON.stringify(__lab.state())"));
const events = async (tab, name) =>
  JSON.parse(await tab.evaluate(`JSON.stringify(__lab.log().filter((r) => r.event === ${JSON.stringify(name)}))`));
const openPeers = async (tab) => (await state(tab)).peers.filter((p) => p.channel === "open");

// 第二區現在放的描述，型別對得上才回傳。畫面換描述要等候選蒐集，所以用輪詢。
async function shown(tab, type, not = null) {
  return until(async () => {
    const text = await tab.evaluate("__lab.localSdp()");
    if (!text || text === not) return null;
    return JSON.parse(text).type === type ? text : null;
  }, `${tab.label} 顯示 ${type}`);
}

const apply = (tab, text) => tab.evaluate(`__lab.apply(${JSON.stringify(text)})`, true);

async function connected(tab, count) {
  return until(async () => ((await openPeers(tab)).length === count ? true : null), `${tab.label} 連上 ${count} 台`);
}

let failed = false;
function check(ok, message) {
  console.log(`  ${ok ? "✓" : "✗"} ${message}`);
  if (!ok) failed = true;
}

const tabs = [];
try {
  // ------------------------------------------------------------ 1. 經由介紹
  console.log("三台：A 與 B 互貼、C 與 B 互貼，A 與 C 由 B 介紹");
  const [a, b, c] = await Promise.all(["A", "B", "C"].map(openTab));
  tabs.push(a, b, c);
  for (const tab of [a, b, c]) await tab.evaluate("__lab.start()", true);

  const offerA = await shown(a, "offer");
  check((await apply(b, offerA)) === "answered", "B 回應 A 的發起描述");
  const answerB = await shown(b, "answer");
  check((await apply(a, answerB)) === "applied", "A 套上 B 的回應");
  await connected(a, 1);
  await connected(b, 1);

  // B 連上之後畫面換回自己的發起描述，C 掃的是那一張
  const offerB = await shown(b, "offer");
  check((await apply(c, offerB)) === "answered", "C 回應 B 的發起描述");
  const answerC = await shown(c, "answer");
  check((await apply(b, answerC)) === "applied", "B 套上 C 的回應");

  await connected(a, 2);
  await connected(c, 2);
  await connected(b, 2);
  const viaA = (await state(a)).peers.find((p) => p.via.startsWith("relay"));
  const viaC = (await state(c)).peers.find((p) => p.via.startsWith("relay"));
  check(!!viaA && !!viaC, `A 與 C 經由介紹連上（A 看到 ${viaA && viaA.via}，C 看到 ${viaC && viaC.via}）`);
  const pairs = await until(async () => {
    const list = (await events(a, "candidate-pair")).filter((r) => r.via === "relay");
    return list.length ? list : null;
  }, "A 記下經由介紹那一條的候選對");
  check(pairs[0].local === "host" || pairs[0].local === "prflx", `經由介紹的連線走區網直連（${pairs[0].local} / ${pairs[0].remote}）`);
  check(typeof pairs[0].localNet === "string" && typeof pairs[0].remoteNet === "string",
    `候選對記下位址類別（${pairs[0].localNet} / ${pairs[0].remoteNet}），沒有記位址`);
  const stats = (await events(a, "sdp-stats"))[0];
  console.log(`  SDP：原始 ${stats.raw} B，QR 用的欄位封包 ${stats.compact} B，mDNS 候選 ${stats.mdns} 個`);
  check(stats.mdns >= 1, "沒有相機權限時，預先建好的連線只交出 mDNS 名稱");

  for (const size of SIZES) {
    await a.evaluate(`__lab.send(${size})`, true);
    for (const tab of [b, c]) {
      const done = await until(async () => {
        const rows = await events(tab, "recv-done");
        const last = rows[rows.length - 1];
        return last && last.size === size && rows.length >= SIZES.indexOf(size) + 1 ? last : null;
      }, `${tab.label} 收完 ${size} 位元組`, 120000);
      check(done.match, `A 同時送 ${(size / 1048576).toFixed(0)} MB，${tab.label} 收到的 SHA-256 一致`);
    }
  }

  const defaults = (await events(a, "send-done")).slice(-2);
  check(defaults.every((r) => r.links === 6 && r.channels === 1 && r.chunk === 65536),
    `預設參數是 64 KB · 1 通道 · 6 連線（實際 ${defaults.map((r) => `${r.chunk / 1024} KB · ${r.channels} · ${r.links}`).join("、")}）`);

  // 傳輸參數：多條通道、多條連線、較大的塊，資料照位置組回來，兩台都要一致
  for (const opts of [{ chunk: 262144, channels: 4, links: 3 }, { chunk: 16384, channels: 1, links: 1 }, { chunk: 65536, channels: 1, links: 12 }]) {
    const before = { b: (await events(b, "recv-done")).length, c: (await events(c, "recv-done")).length };
    await a.evaluate(`__lab.send(5242880, ${JSON.stringify(opts)})`, true);
    for (const [tab, key] of [[b, "b"], [c, "c"]]) {
      const done = await until(async () => {
        const rows = await events(tab, "recv-done");
        return rows.length > before[key] ? rows[rows.length - 1] : null;
      }, `${tab.label} 收完`, 120000);
      check(done.match && done.links === opts.links && done.channels === opts.channels,
        `${opts.chunk / 1024} KB · ${opts.channels} 通道 · ${opts.links} 連線，${tab.label} 收到的 SHA-256 一致`);
    }
    const sent = (await events(a, "send-done")).slice(-2);
    const lanes = opts.channels * opts.links;
    check(sent.every((r) => r.acked && r.lanes === lanes && r.chunk <= opts.chunk),
      `送出端開了 ${sent.map((r) => r.lanes).join("、")} 條通道，每塊 ${sent[0].chunk} B，都收到對方的確認`);
  }

  // ------------------------------------------------------------ 2. 同時互掃
  console.log("兩台同時回應對方");
  const [d, e] = await Promise.all(["D", "E"].map(openTab));
  tabs.push(d, e);
  await Promise.all([d.evaluate("__lab.start()", true), e.evaluate("__lab.start()", true)]);
  const [offerD, offerE] = await Promise.all([shown(d, "offer"), shown(e, "offer")]);
  await Promise.all([apply(d, offerE), apply(e, offerD)]);
  const [answerD, answerE] = await Promise.all([shown(d, "answer"), shown(e, "answer")]);
  await Promise.all([apply(d, answerE), apply(e, answerD)]);
  await connected(d, 1);
  await connected(e, 1);
  await wait(3000);
  const openD = await openPeers(d);
  const openE = await openPeers(e);
  check(openD.length === 1 && openE.length === 1, `兩邊各留一條（D ${openD.length}、E ${openE.length}）`);
  const closedDup = (await events(d, "peer-closed")).filter((r) => r.reason === "duplicate").length +
    (await events(e, "peer-closed")).filter((r) => r.reason === "duplicate").length;
  console.log(`  多出來的那一條：關掉 ${closedDup} 次（兩邊都開通過才會是 2，只有一邊來得及開通時是 0 或 1）`);
  check(openD[0].role !== openE[0].role, "留下的是同一條，一邊發起、一邊回應");

  // ------------------------------------------------------------ 3. 同一張被兩台掃到
  console.log("同一張發起描述被兩台掃到");
  const [f, g, h] = await Promise.all(["F", "G", "H"].map(openTab));
  tabs.push(f, g, h);
  for (const tab of [f, g, h]) await tab.evaluate("__lab.start()", true);
  const offerF = await shown(f, "offer");
  await Promise.all([apply(g, offerF), apply(h, offerF)]);
  const [answerG, answerH] = await Promise.all([shown(g, "answer"), shown(h, "answer")]);
  check((await apply(f, answerG)) === "applied", "F 套上先掃回來的 G");
  check((await apply(f, answerH)) === "used", "H 的回應認得出是晚了一步");
  const offerF2 = await shown(f, "offer", offerF);
  check((await apply(h, offerF2)) === "answered", "H 改回應 F 的新描述");
  const answerH2 = await shown(h, "answer", answerH);
  check((await apply(f, answerH2)) === "applied", "F 套上 H 的新回應");
  await connected(f, 2);
  await connected(g, 2);
  await connected(h, 2);
  const superseded = (await events(h, "peer-closed")).filter((r) => r.reason === "superseded").length;
  check(superseded === 1, "H 收掉回應舊描述的那一條");
  // ------------------------------------------------------------ 4. 連不上要說得出來
  console.log("連不到的回應");
  const [i, j] = await Promise.all(["I", "J"].map(openTab));
  tabs.push(i);
  for (const tab of [i, j]) await tab.evaluate("__lab.start()", true);
  await apply(j, await shown(i, "offer"));
  const deadAnswer = JSON.parse(await shown(j, "answer"));
  // 候選換成到不了的位址，ice-ufrag 與 ice-pwd 也換掉。J 的分頁關閉要一點時間，這段期間
  // 它照樣會送連線檢查過來，帳密對不上，I 就不會把它當成對方。
  await j.close();
  deadAnswer.sdp = deadAnswer.sdp
    .replace(/^a=candidate:(\S+) 1 udp (\d+) \S+ (\d+) typ host.*$/gm, "a=candidate:$1 1 udp $2 192.0.2.1 $3 typ host")
    .replace(/^a=ice-ufrag:.*$/m, "a=ice-ufrag:dead")
    .replace(/^a=ice-pwd:.*$/m, "a=ice-pwd:deaddeaddeaddeaddeaddead");
  const began = Date.now();
  check((await apply(i, JSON.stringify(deadAnswer))) === "applied", "I 套上連不到的回應");
  const timeout = await until(async () => (await events(i, "connect-timeout"))[0], "I 判定連不上", 25000);
  const secs = (Date.now() - began) / 1000;
  check(secs >= 14 && secs < 20, `${secs.toFixed(1)} 秒後判定連不上（ICE ${timeout.ice}）`);
  const closed = (await events(i, "peer-closed")).some((r) => r.reason === "timeout");
  check(closed && (await state(i)).peers.length === 0, "那一條已經收掉，第四區不再列出");
} catch (err) {
  console.error(String(err && err.message));
  failed = true;
  // 失敗時把各分頁跟配對有關的紀錄印出來，多半一眼就看得出卡在哪一步
  const keep = ["start", "remote-description", "datachannel-open", "hello", "hello-mismatch", "relay-offer", "relay-answer", "peer-closed", "pool-empty", "connect-timeout"];
  for (const tab of tabs) {
    const log = JSON.parse(await tab.evaluate("JSON.stringify(__lab.log())"));
    console.error(`--- ${tab.label}`);
    for (const row of log.filter((r) => keep.includes(r.event))) {
      const { at, event, ...rest } = row;
      console.error(`  ${at.slice(11, 23)} ${event} ${JSON.stringify(rest)}`);
    }
  }
} finally {
  for (const tab of tabs) await tab.close();
}

console.log(failed ? "\n有步驟失敗，頁面邏輯要查" : "\n回送流程走完，配對、介紹與傳輸都對");
process.exit(failed ? 1 : 0);
