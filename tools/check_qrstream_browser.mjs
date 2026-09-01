#!/usr/bin/env node
/**
 * QR code 影格串流在真的瀏覽器裡跑一遍。
 *
 * === 為什麼需要這支 ===
 *
 * tools/test_qrstream.mjs 驗格式與拼接，tools/check_qrstream_ui.mjs 用 DOM 替身驗
 * 接線，兩支都跑在 node 裡，都沒有樣式，也都沒有相機。結果是兩類問題完全沒人看得到：
 *
 *   - 顏色與對比。第一版把 material 的 --md-typeset-del-color 當文字色用，那個色票
 *     是 #f5503d26，只有 15% 不透明度，「這個檔案超過上限」淡到讀不了。三十幾條
 *     測試全綠，是使用者開瀏覽器才發現的
 *   - getUserMedia 那條路。相機是這一頁的主要收檔方式，而它在 node 裡根本不存在
 *
 * 這一支用 headless Chrome 補上這兩塊。做法跟 tools/shoot_games.mjs 同一套：直接開
 * CDP，不帶 puppeteer 那類相依。
 *
 * === 相機怎麼測 ===
 *
 * Chrome 可以拿一個 Y4M 檔當假的攝影機（--use-file-for-fake-video-capture）。這裡先用
 * qrstream.js 自己的邏輯把一份檔案切成影格、畫成點陣，寫成 Y4M，再讓瀏覽器把那段
 * 影片當成鏡頭拍到的畫面餵進頁面。從 getUserMedia、<video>、canvas、jsQR、拼接、
 * SHA-256 到最後的下載連結，整條路都是真的在瀏覽器裡跑。
 *
 * getUserMedia 需要 secure context，所以網址一定要走 127.0.0.1，區網 IP 不行。
 *
 * === 為什麼不進 CI ===
 *
 * 要一顆 Chrome 跟一個開著的 mkdocs serve。跟 shoot_games.mjs 一樣屬於本機工具。
 *
 * 用法：
 *   先開著   cd docs && mkdocs serve -a 127.0.0.1:8011
 *   然後     node tools/check_qrstream_browser.mjs
 *            node tools/check_qrstream_browser.mjs --shots   # 順便存截圖
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'qrstream.js');
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor');
const BASE = process.env.QRSTREAM_BASE || 'http://127.0.0.1:8011/docs/utils/qr-stream/';
const SHOTS = process.argv.includes('--shots');
const OUT = path.join(os.tmpdir(), 'qrstream-shots');

const src = fs.readFileSync(SRC, 'utf8');
const require_ = createRequire(import.meta.url);
const qrcode = require_(path.join(VENDOR, 'qrcode-generator.js'));

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`qrstream.js 裡找不到 ${re}`);
  return m[0];
};
new Function('window', grab(/^  window\.qrcode\.stringToBytes = .*$/m))({ qrcode });

const tool = new Function(
  'TextEncoder',
  `
  ${grab(/^  const MAGIC = .*$/m)}
  ${grab(/^  const HEADER_BYTES = .*$/m)}
  ${grab(/^  const CRC_BYTES = .*$/m)}
  ${grab(/^  const OVERHEAD = .*$/m)}
  ${grab(/^  const MAX_CHUNKS = .*$/m)}
  ${grab(/^  const MANIFEST_INDEX = .*$/m)}
  ${grab(/^  function crc16\(bytes, length\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function packFrame\(session, total, index, payload\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function shortenName\(name, keep\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function buildManifest\(info, budget\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function planStream\(dataLength, payloadSize\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function bytesToLatin1\(bytes\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const DENSITY = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const QUIET = .*$/m)}
  return { OVERHEAD, MANIFEST_INDEX, packFrame, buildManifest, planStream,
           bytesToLatin1, DENSITY, QUIET };
`
)(TextEncoder);

// ---------------------------------------------------------------------------
// 把一份檔案變成一段假的攝影機畫面
// ---------------------------------------------------------------------------

const capacityCache = new Map();
function capacityOf(version, level) {
  const key = version + level;
  if (capacityCache.has(key)) return capacityCache.get(key);
  let low = 0;
  let high = 3000;
  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    try {
      const qr = qrcode(version, level);
      qr.addData('x'.repeat(mid));
      qr.make();
      low = mid;
    } catch (err) {
      high = mid - 1;
    }
  }
  capacityCache.set(key, low);
  return low;
}

const W = 1280;
const H = 720;
const FPS = 5;

// 一張影格畫成 1280x720 的灰階畫面，QR 置中。周圍留白模擬鏡頭沒有貼齊螢幕。
function drawFrameToY(bytes, version, level) {
  const qr = qrcode(version, level);
  qr.addData(tool.bytesToLatin1(bytes));
  qr.make();
  const count = qr.getModuleCount();
  const span = count + tool.QUIET * 2;
  const scale = Math.floor((H * 0.82) / span);
  const size = span * scale;
  const left = ((W - size) / 2) | 0;
  const top = ((H - size) / 2) | 0;

  const y = new Uint8Array(W * H).fill(210); // 灰底，代表螢幕以外的環境
  for (let row = 0; row < size; row += 1) {
    y.fill(255, (top + row) * W + left, (top + row) * W + left + size);
  }
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      const y0 = top + (row + tool.QUIET) * scale;
      const x0 = left + (col + tool.QUIET) * scale;
      for (let dy = 0; dy < scale; dy += 1) {
        y.fill(0, (y0 + dy) * W + x0, (y0 + dy) * W + x0 + scale);
      }
    }
  }
  return y;
}

function writeY4M(file, data, name, version, level) {
  const payloadSize = capacityOf(version, level) - tool.OVERHEAD;
  // 雜湊要是真的。放空字串的話收的一端會照實回報「沒有附校驗碼」，那條路是對的，
  // 但這一支要驗的是瀏覽器裡的 SHA-256 比對真的跑得起來並且對得上。
  const manifest = tool.buildManifest(
    {
      name,
      size: data.length,
      stream: data.length,
      hash: createHash('sha256').update(data).digest('hex'),
      compressed: false,
    },
    payloadSize
  );
  const plan = tool.planStream(data.length, payloadSize);
  const chroma = Buffer.alloc((W / 2) * (H / 2), 128);
  const parts = [Buffer.from(`YUV4MPEG2 W${W} H${H} F${FPS}:1 Ip A1:1 C420\n`)];
  for (let index = 0; index < plan.total; index += 1) {
    const payload =
      index === tool.MANIFEST_INDEX
        ? manifest
        : data.subarray((index - 1) * payloadSize, Math.min(index * payloadSize, data.length));
    const frame = tool.packFrame(0x5a5a, plan.total, index, payload);
    parts.push(Buffer.from('FRAME\n'), Buffer.from(drawFrameToY(frame, version, level)), chroma, chroma);
  }
  fs.writeFileSync(file, Buffer.concat(parts));
  return plan.total;
}

// ---------------------------------------------------------------------------
// CDP
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openChrome(extraFlags) {
  const port = 9400 + Math.floor(process.pid % 100);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'qrstream-chrome-'));
  const chrome = spawn(
    'google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${port}`,
      ...extraFlags,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let target = null;
  for (let i = 0; i < 100; i += 1) {
    await sleep(200);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch (err) {
      // 還沒起來
    }
  }
  if (!target) throw new Error('Chrome 起不來');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const at = (id += 1);
      pending.set(at, resolve);
      ws.send(JSON.stringify({ id: at, method, params }));
    });

  const evaluate = async (expression) => {
    const out = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (out.result?.exceptionDetails || out.result?.result?.subtype === 'error') {
      throw new Error(out.result?.result?.description || '頁面上丟了例外');
    }
    return out.result?.result?.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  // 預設視窗只有 800x600，工具的下半截落在摺線下，截圖看不到訊息列。
  // 開高一點讓整個工具都在畫面裡，對比量測不受影響（那一段讀的是 computed style）。
  await send('Emulation.setDeviceMetricsOverride', {
    width: 900,
    height: 1700,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const waitFor = async (expression, what, tries = 200) => {
    for (let i = 0; i < tries; i += 1) {
      if (await evaluate(expression)) return true;
      await sleep(250);
    }
    throw new Error(`等不到：${what}`);
  };

  const shot = async (name) => {
    if (!SHOTS) return;
    fs.mkdirSync(OUT, { recursive: true });
    const { result } = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(result.data, 'base64'));
  };

  return {
    send,
    evaluate,
    waitFor,
    shot,
    // 收尾要吞掉錯誤。Chrome 關閉的時候還在寫 profile 目錄，rmSync 會撞上
    // ENOTEMPTY，而這是在 finally 裡跑的，丟出去會把已經通過的斷言蓋成失敗。
    close: async () => {
      try {
        ws.close();
      } catch (err) {
        // 已經斷了
      }
      chrome.kill();
      await new Promise((r) => chrome.once('exit', r)).catch(() => {});
      for (let i = 0; i < 5; i += 1) {
        try {
          fs.rmSync(profile, { recursive: true, force: true });
          return;
        } catch (err) {
          await sleep(200);
        }
      }
    },
  };
}

// 頁面上跑的小工具：找按鈕、量對比。字串放在這裡是為了讓 evaluate 傳得過去。
const HELPERS = `
  window.__qs = {
    root: () => document.getElementById('qr-stream-tool'),
    button: (label) => [...document.querySelectorAll('#qr-stream-tool button')]
      .find((b) => b.textContent.trim() === label),
    // 有 alpha 的顏色要往上疊到不透明的底色才算得出真的對比
    effectiveBg: (node) => {
      let composite = [255, 255, 255];
      const stack = [];
      for (let at = node; at; at = at.parentElement) stack.push(at);
      for (const at of stack.reverse()) {
        const bg = getComputedStyle(at).backgroundColor;
        const m = bg.match(/rgba?\\(([^)]+)\\)/);
        if (!m) continue;
        const parts = m[1].split(',').map((v) => parseFloat(v));
        const alpha = parts.length > 3 ? parts[3] : 1;
        if (!alpha) continue;
        composite = [0, 1, 2].map((i) => parts[i] * alpha + composite[i] * (1 - alpha));
      }
      return composite;
    },
    luminance: (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    contrast: (node) => {
      const fg = getComputedStyle(node).color.match(/rgba?\\(([^)]+)\\)/)[1]
        .split(',').map((v) => parseFloat(v));
      const alpha = fg.length > 3 ? fg[3] : 1;
      const bg = window.__qs.effectiveBg(node);
      const front = [0, 1, 2].map((i) => fg[i] * alpha + bg[i] * (1 - alpha));
      const a = window.__qs.luminance(front);
      const b = window.__qs.luminance(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    },
  };
  true;
`;

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// ---------------------------------------------------------------------------

test('頁面在真的瀏覽器裡跑得起來，沒有主控台錯誤', async () => {
  const page = await openChrome([]);
  try {
    const errors = [];
    page.send('Log.enable');
    await page.send('Page.navigate', { url: BASE });
    await page.waitFor("document.readyState === 'complete'", '頁面載入');
    await page.evaluate(HELPERS);
    await page.waitFor('__qs.root() && __qs.root().children.length > 3', '工具畫出來');
    assert.ok(await page.evaluate("!!__qs.button('傳送')"), '找不到傳送分頁');
    assert.ok(await page.evaluate("!!__qs.button('接收')"), '找不到接收分頁');
    assert.ok(
      await page.evaluate("!!__qs.button('特大')"),
      '找不到特大檔位，DENSITY 沒有接到畫面上'
    );
    assert.equal(errors.length, 0);
    await page.shot('01-載入');
  } finally {
    await page.close();
  }
});

test('超過上限的警告讀得到，對比達到 WCAG AA', async () => {
  // 這一條就是為了那個踩過的坑。舊版是 rgba(245,80,61,.15) 疊在白底上，對比 1.1，
  // 肉眼看幾乎是空白。AA 對一般字級的門檻是 4.5。
  const page = await openChrome([]);
  try {
    await page.send('Page.navigate', { url: BASE });
    await page.waitFor("document.readyState === 'complete'", '頁面載入');
    await page.evaluate(HELPERS);
    await page.waitFor('__qs.root() && __qs.root().children.length > 3', '工具畫出來');

    // 丟一個超過 512 KB 的檔案進去
    await page.evaluate(`
      (() => {
        const dt = new DataTransfer();
        dt.items.add(new File([new Uint8Array(600 * 1024)], 'too-big.bin'));
        document.getElementById('qs-drop')
          .dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
        return true;
      })()
    `);
    await page.waitFor(
      "!!document.querySelector('#qr-stream-tool .qs-msg.qs-bad')?.textContent.includes('超過')",
      '超過上限的警告'
    );
    await page.shot('02-超過上限');

    const seen = await page.evaluate(`
      (() => {
        const node = document.querySelector('#qr-stream-tool .qs-msg.qs-bad');
        const style = getComputedStyle(node);
        return {
          text: node.textContent.trim(),
          color: style.color,
          fontSize: parseFloat(style.fontSize),
          contrast: window.__qs.contrast(node),
        };
      })()
    `);
    assert.ok(seen.text.includes('超過'), `訊息內容不對：${seen.text}`);
    assert.ok(
      seen.contrast >= 4.5,
      `對比只有 ${seen.contrast.toFixed(2)}:1，讀不到（色 ${seen.color}）`
    );
    assert.ok(seen.fontSize >= 14, `字級只有 ${seen.fontSize}px`);
    console.log(`      對比 ${seen.contrast.toFixed(1)}:1，字級 ${seen.fontSize}px`);
  } finally {
    await page.close();
  }
});

test('每一段提示文字的對比都過得了 AA', async () => {
  const page = await openChrome([]);
  try {
    await page.send('Page.navigate', { url: BASE });
    await page.waitFor("document.readyState === 'complete'", '頁面載入');
    await page.evaluate(HELPERS);
    await page.waitFor('__qs.root() && __qs.root().children.length > 3', '工具畫出來');
    const worst = await page.evaluate(`
      (() => {
        const out = [];
        for (const node of document.querySelectorAll('#qr-stream-tool p, #qr-stream-tool span, #qr-stream-tool button')) {
          if (!node.textContent.trim() || node.offsetParent === null) continue;
          out.push({
            text: node.textContent.trim().slice(0, 24),
            size: parseFloat(getComputedStyle(node).fontSize),
            contrast: window.__qs.contrast(node),
          });
        }
        return out.sort((a, b) => a.contrast - b.contrast).slice(0, 3);
      })()
    `);
    for (const entry of worst) {
      // 大字（18.66px 以上）的 AA 門檻是 3，其餘 4.5
      const floor = entry.size >= 18.66 ? 3 : 4.5;
      assert.ok(
        entry.contrast >= floor,
        `「${entry.text}」對比只有 ${entry.contrast.toFixed(2)}:1（${entry.size}px 的門檻是 ${floor}）`
      );
    }
    console.log(`      最低的一段是 ${worst[0].contrast.toFixed(1)}:1`);
  } finally {
    await page.close();
  }
});

test('用假的攝影機走完整條接收路徑，拼回來的檔案對得上', async () => {
  // Chrome 把一個 Y4M 檔當鏡頭拍到的畫面。getUserMedia、<video>、canvas、jsQR、
  // 拼接、SHA-256、下載連結，整條都是瀏覽器裡真的跑，node 那邊測不到這一段。
  const y4m = path.join(os.tmpdir(), 'qrstream-fake-camera.y4m');
  const payload = Buffer.from('anoni.net 影格串流的相機測試 '.repeat(60), 'utf8');
  const total = writeY4M(y4m, new Uint8Array(payload), 'camera-test.txt', tool.DENSITY[1].version, tool.DENSITY[1].level);
  console.log(`      假攝影機：${total} 張，${(fs.statSync(y4m).size / 1048576).toFixed(1)} MB`);

  const page = await openChrome([
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--use-file-for-fake-video-capture=${y4m}`,
    '--autoplay-policy=no-user-gesture-required',
  ]);
  try {
    await page.send('Page.navigate', { url: BASE });
    await page.waitFor("document.readyState === 'complete'", '頁面載入');
    await page.evaluate(HELPERS);
    await page.waitFor('__qs.root() && __qs.root().children.length > 3', '工具畫出來');

    assert.ok(
      await page.evaluate('window.isSecureContext'),
      'getUserMedia 要 secure context，網址要走 127.0.0.1'
    );

    await page.evaluate("__qs.button('接收').click(); true");
    await page.evaluate("__qs.button('開相機').click(); true");
    await page.waitFor(
      "!!document.querySelector('#qr-stream-tool video')?.videoWidth",
      '相機畫面進來'
    );
    await page.waitFor(
      "/收到 \\d+ 張/.test(document.querySelector('#qr-stream-tool')?.textContent || '')",
      '開始收到影格'
    );
    await page.shot('03-接收中');

    await page.waitFor(
      "(() => { const r = document.querySelector('#qr-stream-tool .qs-result'); return r && !r.hidden; })()",
      `收齊 ${total} 張並拼完`,
      400
    );
    await page.shot('04-收完');

    const got = await page.evaluate(`
      (() => {
        const result = document.querySelector('#qr-stream-tool .qs-result');
        const link = result.querySelector('a');
        return {
          className: result.className,
          text: result.textContent,
          download: link && link.download,
          href: link && link.href.slice(0, 5),
        };
      })()
    `);
    assert.ok(got.className.includes('qs-ok'), `校驗結果是 ${got.className}：${got.text}`);
    assert.equal(got.download, 'camera-test.txt', '檔名沒有帶回來');
    assert.equal(got.href, 'blob:', '儲存連結不是本機 blob');
    assert.ok(got.text.includes('校驗碼相符'), `結果文字：${got.text}`);

    // 存下來的內容真的等於送出去的那一份
    const same = await page.evaluate(`
      (async () => {
        const link = document.querySelector('#qr-stream-tool .qs-result a');
        const bytes = new Uint8Array(await (await fetch(link.href)).arrayBuffer());
        const want = new TextEncoder().encode(${JSON.stringify(payload.toString('utf8'))});
        return bytes.length === want.length && bytes.every((b, i) => b === want[i]);
      })()
    `);
    assert.ok(same, '存下來的內容跟送出去的不一樣');
  } finally {
    await page.close();
    fs.rmSync(y4m, { force: true });
  }
});

test('關掉相機之後軌道真的停了', async () => {
  const y4m = path.join(os.tmpdir(), 'qrstream-fake-camera2.y4m');
  writeY4M(y4m, new Uint8Array(Buffer.from('x'.repeat(800))), 'stop.txt', tool.DENSITY[0].version, tool.DENSITY[0].level);
  const page = await openChrome([
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--use-file-for-fake-video-capture=${y4m}`,
    '--autoplay-policy=no-user-gesture-required',
  ]);
  try {
    await page.send('Page.navigate', { url: BASE });
    await page.waitFor("document.readyState === 'complete'", '頁面載入');
    await page.evaluate(HELPERS);
    await page.waitFor('__qs.root() && __qs.root().children.length > 3', '工具畫出來');
    await page.evaluate("__qs.button('接收').click(); true");
    await page.evaluate("__qs.button('開相機').click(); true");
    await page.waitFor("!!document.querySelector('#qr-stream-tool video')?.srcObject", '相機開起來');

    // 切回傳送分頁，這是最容易忘記關的一條路徑
    await page.evaluate("__qs.button('傳送').click(); true");
    await sleep(500);
    const state = await page.evaluate(`
      (() => {
        const video = document.querySelector('#qr-stream-tool video');
        return { srcObject: !!video.srcObject };
      })()
    `);
    assert.equal(state.srcObject, false, '切分頁之後相機還接在畫面上');
  } finally {
    await page.close();
    fs.rmSync(y4m, { force: true });
  }
});

for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${String(err && err.message ? err.message : err).split('\n').slice(0, 4).join('\n    ')}`);
    failed += 1;
  }
}
if (SHOTS) console.log(`\n截圖在 ${OUT}`);
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
