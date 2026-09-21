#!/usr/bin/env node
/**
 * 實驗頁「只帶欄位的封包」（格式版本 2）的編解碼測試。
 *
 * === 為什麼需要這支 ===
 *
 * 解碼端是照固定樣板把 SDP 組回來，組錯一個欄位的症狀是「QR 掃得到、套用也沒報錯、
 * 就是連不上」，在現場分不出是網路擋掉還是封包壞了，而分辨這兩者正是 issue #553
 * 要量的東西。run-qr-camera.mjs 只走得到 Chrome 帶明碼 IPv4 的那一種描述，mDNS、
 * IPv6、Firefox 的寫法與各種退回的情況要靠這一支。
 *
 * === 怎麼驗 ===
 *
 * 把 webrtc-lab.js 裡 compact-codec-begin 到 compact-codec-end 那一段原地抽出來執行，
 * 不另外抄一份邏輯。每個能編的案例都驗一次「解回來再編一次，位元組完全相同」，
 * 再逐欄核對組回來的 SDP。描述用的是虛構的位址與指紋，格式照 Chrome 153 與
 * Firefox 157 實際產出的寫法。
 *
 * 用法：
 *   node tools/webrtc-lab/test_compact.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LAB = path.join(HERE, "..", "..", "docs", "zh-TW", "js", "webrtc-lab.js");
const src = fs.readFileSync(LAB, "utf8");

const begin = src.indexOf("// compact-codec-begin");
const end = src.indexOf("// compact-codec-end");
if (begin < 0 || end < 0) throw new Error("webrtc-lab.js 裡找不到 compact-codec-begin 與 compact-codec-end");
const consts = ["PACK_MAGIC", "PACK_COMPACT"].map((name) => {
  const m = src.match(new RegExp(`const ${name} = [^;]+;`));
  if (!m) throw new Error(`webrtc-lab.js 裡找不到 ${name}`);
  return m[0];
});
const { encodeCompact, decodeCompact } = new Function(
  `${consts.join("\n")}\n${src.slice(begin, end)}\nreturn { encodeCompact, decodeCompact };`
)();

// ---------------------------------------------------------------- 描述

const FP = Array.from({ length: 32 }, (_, i) => (i * 7 + 3).toString(16).padStart(2, "0").toUpperCase()).join(":");
const MDNS = "0c1d2e3f-4a5b-4c6d-8e7f-0123456789ab.local";

function chrome({ type = "offer", setup = "actpass", candidates, ufrag = "k5sj", pwd = "w1yaogIN/qEZnIX0sWaWb0I8", mid = "0", maxmsg = 262144, fp = `sha-256 ${FP}`, extraMedia = "" }) {
  return {
    type,
    sdp: [
      "v=0",
      "o=- 305063283692409627 2 IN IP4 127.0.0.1",
      "s=-",
      "t=0 0",
      `a=group:BUNDLE ${mid}`,
      "a=extmap-allow-mixed",
      "a=msid-semantic: WMS",
      extraMedia,
      "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
      "c=IN IP4 0.0.0.0",
      ...candidates,
      `a=ice-ufrag:${ufrag}`,
      `a=ice-pwd:${pwd}`,
      "a=ice-options:trickle",
      `a=fingerprint:${fp}`,
      `a=setup:${setup}`,
      `a=mid:${mid}`,
      "a=sctp-port:5000",
      `a=max-message-size:${maxmsg}`,
      "",
    ].filter((line, i, all) => line !== "" || i === all.length - 1).join("\r\n"),
  };
}

const CHROME_MDNS = chrome({
  candidates: [`a=candidate:982741770 1 udp 2113937151 ${MDNS} 58110 typ host generation 0 network-cost 999`],
});

// 有相機權限之後建立的連線：每張網卡都交出明碼位址，UDP 與 TCP 各一組
const CHROME_ALL = chrome({
  candidates: [
    "a=candidate:1 1 udp 2122260223 192.168.1.20 48338 typ host generation 0 network-id 1",
    "a=candidate:2 1 udp 2122194687 100.100.1.2 35439 typ host generation 0 network-id 2",
    "a=candidate:3 1 udp 2122129151 fd7a:115c:a1e0::1a01:3944 57848 typ host generation 0 network-id 3",
    "a=candidate:4 1 tcp 1518280447 192.168.1.20 9 typ host tcptype active generation 0 network-id 1",
    "a=candidate:5 1 tcp 1518214911 100.100.1.2 9 typ host tcptype active generation 0 network-id 2",
    "a=candidate:6 1 tcp 1518149375 fd7a:115c:a1e0::1a01:3944 9 typ host tcptype active generation 0 network-id 3",
  ],
});

// Firefox 的寫法：指紋在 session 層、transport 大寫、ufrag 與 pwd 是十六進位、訊息上限很大
const FIREFOX_ANSWER = {
  type: "answer",
  sdp: [
    "v=0",
    "o=mozilla...THIS_IS_SDPARTA-157.0 4612520411935385611 0 IN IP4 0.0.0.0",
    "s=-",
    "t=0 0",
    `a=fingerprint:sha-256 ${FP}`,
    "a=group:BUNDLE 0",
    "a=ice-options:trickle",
    "a=msid-semantic:WMS *",
    "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
    "c=IN IP4 0.0.0.0",
    "a=candidate:0 1 UDP 2122252543 192.168.1.30 60848 typ host",
    "a=candidate:1 1 TCP 2105524479 192.168.1.30 9 typ host tcptype active",
    "a=sendrecv",
    "a=end-of-candidates",
    "a=ice-pwd:81a8a3c32ebaa438a1ac8fb7bb9f7151",
    "a=ice-ufrag:fb4c22ad",
    "a=mid:0",
    "a=setup:active",
    "a=sctp-port:5000",
    "a=max-message-size:1073741823",
    "",
  ].join("\r\n"),
};

// ---------------------------------------------------------------- 工具

const attr = (sdp, name) => (sdp.match(new RegExp(`^a=${name}:(.*)$`, "m")) || [])[1];
const candidates = (sdp) =>
  sdp.split("\r\n").filter((l) => l.startsWith("a=candidate:")).map((l) => {
    const f = l.slice(12).split(" ");
    return { priority: Number(f[3]), address: f[4], port: Number(f[5]), transport: f[2], type: f[7] };
  });

// 編得出來，而且解回來再編一次位元組完全相同
function roundTrip(desc) {
  const packed = encodeCompact(desc);
  assert.ok(packed.bytes, `編不出來：${packed.error}`);
  const back = decodeCompact(packed.bytes);
  const again = encodeCompact(back);
  assert.ok(again.bytes, `解回來的描述編不出來：${again.error}`);
  assert.deepEqual(Array.from(again.bytes), Array.from(packed.bytes), "解回來再編一次，位元組不一樣");
  return { packed, back };
}

function sameIdentity(back, desc) {
  assert.equal(back.type, desc.type);
  assert.equal(attr(back.sdp, "ice-ufrag"), attr(desc.sdp, "ice-ufrag"));
  assert.equal(attr(back.sdp, "ice-pwd"), attr(desc.sdp, "ice-pwd"));
  assert.equal(attr(back.sdp, "fingerprint"), attr(desc.sdp, "fingerprint"));
  assert.equal(attr(back.sdp, "setup"), attr(desc.sdp, "setup"));
}

// ---------------------------------------------------------------- 案例

const tests = [
  ["Chrome 沒權限的 offer：mDNS 候選，79 B", () => {
    const { packed, back } = roundTrip(CHROME_MDNS);
    assert.equal(packed.bytes.length, 79);
    assert.deepEqual(Array.from(packed.bytes.subarray(0, 4)), [0x57, 0x4c, 2, 0]);
    sameIdentity(back, CHROME_MDNS);
    assert.deepEqual(candidates(back.sdp).map((c) => [c.address, c.port, c.transport, c.type]), [[MDNS, 58110, "udp", "host"]]);
    assert.equal(attr(back.sdp, "mid"), "0");
    assert.equal(attr(back.sdp, "max-message-size"), "262144");
    assert.match(back.sdp, /^a=group:BUNDLE 0$/m);
    assert.match(back.sdp, /^m=application 9 UDP\/DTLS\/SCTP webrtc-datachannel$/m);
    assert.match(back.sdp, /^a=end-of-candidates$/m);
  }],

  ["Chrome 有權限的 offer：只留區網的 UDP，Tailscale 與 TCP 濾掉，67 B", () => {
    const { packed, back } = roundTrip(CHROME_ALL);
    assert.equal(packed.bytes.length, 67);
    assert.equal(packed.kept, 1);
    assert.deepEqual(packed.dropped, { cgnat: 1, tailscale: 1, tcp: 3 });
    assert.deepEqual(candidates(back.sdp).map((c) => c.address), ["192.168.1.20"]);
  }],

  ["Firefox 的 answer：十六進位的 ICE 字串、大寫 UDP、session 層的指紋，76 B", () => {
    const { packed, back } = roundTrip(FIREFOX_ANSWER);
    assert.equal(packed.bytes.length, 76);
    sameIdentity(back, FIREFOX_ANSWER);
    assert.deepEqual(packed.dropped, { tcp: 1 });
    // 對方宣告的上限比樣板大，照樣板送就好，不佔位元組
    assert.equal(attr(back.sdp, "max-message-size"), "262144");
  }],

  ["answer 的 setup:passive 用旗標帶過去", () => {
    const desc = chrome({ type: "answer", setup: "passive", candidates: CHROME_MDNS.sdp.match(/^a=candidate:.*$/gm) });
    const { packed, back } = roundTrip(desc);
    assert.equal(packed.bytes[3], 1 | 2);
    assert.equal(attr(back.sdp, "setup"), "passive");
  }],

  ["IPv6：一般位址與 Tailscale 以外的 ULA 保留，link-local 濾掉", () => {
    const desc = chrome({
      candidates: [
        "a=candidate:1 1 udp 2122262783 2001:db8::1 50001 typ host generation 0",
        "a=candidate:2 1 udp 2122197247 fd00::5 50002 typ host generation 0",
        "a=candidate:3 1 udp 2122131711 fe80::1 50003 typ host generation 0",
      ],
    });
    const { packed, back } = roundTrip(desc);
    assert.deepEqual(packed.dropped, { "link-local": 1 });
    assert.deepEqual(candidates(back.sdp).map((c) => [c.address, c.port]), [["2001:db8:0:0:0:0:0:1", 50001], ["fd00:0:0:0:0:0:0:5", 50002]]);
  }],

  ["priority 的先後順序保留，解碼端依序重新給值", () => {
    const desc = chrome({
      candidates: [
        "a=candidate:1 1 udp 1000 192.168.1.21 40001 typ host",
        "a=candidate:2 1 udp 3000 192.168.1.22 40002 typ host",
        "a=candidate:3 1 udp 2000 192.168.1.23 40003 typ host",
      ],
    });
    const { back } = roundTrip(desc);
    const list = candidates(back.sdp);
    assert.deepEqual(list.map((c) => c.address), ["192.168.1.22", "192.168.1.23", "192.168.1.21"]);
    assert.ok(list[0].priority > list[1].priority && list[1].priority > list[2].priority);
    assert.ok(list.every((c) => c.priority < 2 ** 32));
  }],

  ["不是 UUID 的主機名稱照原樣帶過去", () => {
    const desc = chrome({ candidates: ["a=candidate:1 1 udp 2113937151 lab-device.local 40010 typ host"] });
    const { back } = roundTrip(desc);
    assert.deepEqual(candidates(back.sdp).map((c) => [c.address, c.port]), [["lab-device.local", 40010]]);
  }],

  ["ICE 字串長度不是 4 的倍數時不壓，照原字串帶", () => {
    const desc = chrome({ ufrag: "abcde", pwd: "0123456789abcdefghijklmn+", candidates: CHROME_MDNS.sdp.match(/^a=candidate:.*$/gm) });
    const { packed, back } = roundTrip(desc);
    assert.equal(packed.bytes[4], 5);
    sameIdentity(back, desc);
  }],

  ["mid 不是 0、訊息上限比樣板小，兩個都用旗標帶過去", () => {
    const desc = chrome({ mid: "data", maxmsg: 65536, candidates: CHROME_MDNS.sdp.match(/^a=candidate:.*$/gm) });
    const { packed, back } = roundTrip(desc);
    assert.equal(packed.bytes[3], 4 | 8);
    assert.equal(attr(back.sdp, "mid"), "data");
    assert.match(back.sdp, /^a=group:BUNDLE data$/m);
    assert.equal(attr(back.sdp, "max-message-size"), "65536");
  }],

  ["候選全被濾掉就退回完整描述", () => {
    const desc = chrome({
      candidates: [
        "a=candidate:1 1 udp 2122194687 100.100.1.2 35439 typ host",
        "a=candidate:2 1 udp 2122129151 fd7a:115c:a1e0::1 57848 typ host",
      ],
    });
    const packed = encodeCompact(desc);
    assert.equal(packed.bytes, undefined);
    assert.equal(packed.error, "candidates");
    assert.deepEqual(packed.dropped, { cgnat: 1, tailscale: 1 });
  }],

  ["指紋不是 SHA-256 就退回完整描述", () => {
    const desc = chrome({ fp: "sha-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33", candidates: CHROME_MDNS.sdp.match(/^a=candidate:.*$/gm) });
    assert.equal(encodeCompact(desc).error, "fingerprint");
  }],

  ["多了媒體軌就退回完整描述", () => {
    const audio = "m=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=mid:1";
    const desc = chrome({ extraMedia: audio, candidates: CHROME_MDNS.sdp.match(/^a=candidate:.*$/gm) });
    assert.equal(encodeCompact(desc).error, "media");
  }],

  ["offer 的 setup 不是 actpass 就退回完整描述", () => {
    const desc = chrome({ setup: "active", candidates: CHROME_MDNS.sdp.match(/^a=candidate:.*$/gm) });
    assert.equal(encodeCompact(desc).error, "setup");
  }],

  ["封包截斷、尾巴多一個位元組、不認得的旗標，解碼都丟例外", () => {
    const bytes = encodeCompact(CHROME_MDNS).bytes;
    assert.throws(() => decodeCompact(bytes.subarray(0, bytes.length - 1)), /truncated/);
    const longer = new Uint8Array(bytes.length + 1);
    longer.set(bytes);
    assert.throws(() => decodeCompact(longer), /trailing/);
    const flagged = Uint8Array.from(bytes);
    flagged[3] = 0x10;
    assert.throws(() => decodeCompact(flagged), /flags/);
    const kind = Uint8Array.from(bytes);
    kind[bytes.length - 19] = 9;
    assert.throws(() => decodeCompact(kind), /candidate kind/);
  }],
];

let passed = 0;
let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    passed++;
    console.log("  ✓ " + name);
  } catch (err) {
    failed++;
    console.error("  ✗ " + name);
    console.error("    " + String(err.message).split("\n").join("\n    "));
  }
}

console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
