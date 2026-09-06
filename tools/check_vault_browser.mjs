#!/usr/bin/env node
/**
 * Passkey 鑰匙頁與加密暫存區在真的瀏覽器裡跑一遍。
 *
 * === 為什麼需要這支 ===
 *
 * tools/test_vault.mjs 與 tools/test_passkey.mjs 在 node 裡驗邏輯與字串表，沒有 WebAuthn、
 * 沒有 IndexedDB、也沒有樣式。暫存區上線後出過的問題全在這三塊：
 *
 *   - IndexedDB 在 request.onsuccess 就 resolve，iOS 上重新整理之後資料不見
 *   - 文字框每次重繪都被重建，輸入法組字到一半被打斷，內容跟著消失
 *   - 完全沒有樣式，按鈕貼在一起，讀者按到「匯出」以為按了「儲存」
 *
 * 前兩項 node 測不到，第三項 node 看不到。這一支用 headless Chrome 補上。做法跟
 * tools/check_qrstream_browser.mjs 同一套：直接開 CDP，不帶 puppeteer 那類相依。
 *
 * === passkey 怎麼測 ===
 *
 * CDP 有 WebAuthn.addVirtualAuthenticator，可以造一顆支援 resident key、UV 與 PRF 的
 * 假驗證器。從 navigator.credentials.create、userHandle 回來變成 age identity、PRF 算出
 * 檔案加密金鑰，到 IndexedDB 寫進讀出，整條路都是真的在瀏覽器裡跑。
 *
 * rpId 不能是 IP，網址一定要走 localhost，127.0.0.1 不行。
 *
 * === 為什麼不進 CI ===
 *
 * 要一顆 Chrome 跟一個開著的 server。跟 check_qrstream_browser.mjs 一樣屬於本機工具。
 *
 * 用法：
 *   先開著   cd docs && mkdocs serve -a localhost:8011
 *   然後     node tools/check_vault_browser.mjs
 *            node tools/check_vault_browser.mjs --shots   # 順便存 390x844 的截圖
 *
 *   建好的 output 用靜態 server 開起來也行：
 *            VAULT_BASE=http://localhost:8781/ node tools/check_vault_browser.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const BASE = process.env.VAULT_BASE || 'http://localhost:8011/docs/';
const PASSKEY_URL = new URL('utils/passkey/', BASE).href;
const VAULT_URL = new URL('community/vault-lab/', BASE).href;
const SHOTS = process.argv.includes('--shots');
const OUT = path.join(os.tmpdir(), 'vault-shots');

if (!/^http:\/\/localhost[:/]/.test(BASE)) {
  console.error(`VAULT_BASE 要走 localhost，WebAuthn 的 rpId 不收 IP：${BASE}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// CDP
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openChrome() {
  const port = 9500 + Math.floor(process.pid % 100);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-chrome-'));
  const chrome = spawn(
    'google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${port}`,
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
  await send('WebAuthn.enable');
  // 手機尺寸。按鈕貼在一起那次就是在這個寬度下發生的，桌機寬度看不出來。
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const { result: auth } = await send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      hasPrf: true,
      automaticPresenceSimulation: true,
    },
  });
  const authenticatorId = auth.authenticatorId;

  const waitFor = async (expression, what, tries = 200) => {
    for (let i = 0; i < tries; i += 1) {
      if (await evaluate(expression)) return true;
      await sleep(250);
    }
    throw new Error(`等不到：${what}`);
  };

  const goto = async (url) => {
    await send('Page.navigate', { url });
    await waitFor("document.readyState === 'complete'", `載入 ${url}`);
  };

  // 真的鍵盤事件，不直接設 value。文字框被重建那次就是 value 設得進去、打字打不進去。
  const type = async (text) => {
    for (const ch of text) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch });
      await send('Input.dispatchKeyEvent', { type: 'keyUp' });
    }
  };

  const credentials = async () => {
    const { result } = await send('WebAuthn.getCredentials', { authenticatorId });
    return result.credentials;
  };

  const shot = async (name) => {
    if (!SHOTS) return;
    fs.mkdirSync(OUT, { recursive: true });
    const { result } = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(result.data, 'base64'));
  };

  return {
    send,
    evaluate,
    waitFor,
    goto,
    type,
    credentials,
    shot,
    // 收尾要吞掉錯誤。Chrome 關閉的時候還在寫 profile 目錄，rmSync 會撞上
    close: async () => {
      try {
        ws.close();
      } catch (err) {
        // 沒差
      }
      chrome.kill();
      await new Promise((r) => chrome.once('exit', r)).catch(() => {});
      await sleep(300);
      try {
        fs.rmSync(profile, { recursive: true, force: true });
      } catch (err) {
        // 沒差
      }
    },
  };
}

// 頁面內的小幫手。兩頁的按鈕都是 <button>，文字就是標籤，用文字找最貼近讀者看到的東西。
const HELPERS = `
  window.__vl = {
    button(root, label) {
      return [...document.querySelectorAll(root + ' button')].find((b) => b.textContent.trim() === label) || null;
    },
    click(root, label) {
      const b = window.__vl.button(root, label);
      if (!b) throw new Error('沒有這個按鈕：' + label);
      b.click();
      return true;
    },
    text(root) {
      return (document.querySelector(root)?.innerText || '').replace(/\\s+/g, ' ');
    },
    box() {
      return document.querySelector('#vault-lab textarea');
    },
    boxVisible() {
      const t = window.__vl.box();
      return !!t && !t.disabled && t.getClientRects().length > 0;
    },
  };
  true
`;

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
let passed = 0;
let failed = 0;

// ---------------------------------------------------------------------------
// 測試
// ---------------------------------------------------------------------------

test('鑰匙頁建的 passkey 拿到暫存區直接能開，兩頁只留一筆 credential', async () => {
  const page = await openChrome();
  try {
    await page.goto(PASSKEY_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#passkey-tool', '建立 passkey')", '鑰匙頁畫出來');
    await page.evaluate("__vl.click('#passkey-tool', '建立 passkey')");
    await page.waitFor("/建好了。這一把同時能給/.test(__vl.text('#passkey-tool'))", '鑰匙頁說兩處都能用');
    assert.equal((await page.credentials()).length, 1, '建立之後驗證器裡應該只有一筆');

    // 同一把也要算得出檔案加密金鑰
    await page.evaluate("__vl.click('#passkey-tool', '試解鎖')");
    await page.waitFor("/解鎖成功，PRF 可用/.test(__vl.text('#passkey-tool'))", '試解鎖成功');
    assert.equal((await page.credentials()).length, 1, '試解鎖不該多出 credential');
    await page.shot('01-passkey-created');

    // 換到暫存區，用已有的鑰匙開，不能再建一把
    await page.goto(VAULT_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#vault-lab', '用我已有的鑰匙開')", '暫存區給出「用已有的鑰匙」');
    assert.ok(await page.evaluate("!!__vl.button('#vault-lab', '建一把新的鑰匙')"), '兩個選項要同時出現');
    await page.evaluate("__vl.click('#vault-lab', '用我已有的鑰匙開')");
    await page.waitFor('__vl.boxVisible()', '暫存區解開、文字框出現');
    assert.equal((await page.credentials()).length, 1, '用已有的鑰匙開不該多出 credential');
    await page.shot('02-vault-opened-with-existing');

    // 打字、等自動儲存、重新整理、再解開，內容要還在
    await page.evaluate('__vl.box().focus(); true');
    await page.type('abc123');
    assert.equal(await page.evaluate('__vl.box().value'), 'abc123', '打進去的字要在框裡');
    await sleep(1500);
    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '重新整理');
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#vault-lab', '用 passkey 解開')", '重新整理後回到鎖上狀態');
    await page.evaluate("__vl.click('#vault-lab', '用 passkey 解開')");
    await page.waitFor('__vl.boxVisible()', '再次解開');
    assert.equal(await page.evaluate('__vl.box().value'), 'abc123', '自動儲存的內容要留到下一次');
    assert.equal((await page.credentials()).length, 1, '解開不該多出 credential');
    await page.shot('03-vault-reopened');
  } finally {
    await page.close();
  }
});

test('打字中間畫面重繪，文字框不掉字也不失焦', async () => {
  const page = await openChrome();
  try {
    await page.goto(VAULT_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#vault-lab', '建一把新的鑰匙')", '暫存區畫出來');
    await page.evaluate("__vl.click('#vault-lab', '建一把新的鑰匙')");
    await page.waitFor('__vl.boxVisible()', '建好並解開');

    await page.evaluate('__vl.box().focus(); true');
    await page.type('abc');
    // 匯出會觸發一次重繪，文字框要撐過去
    await page.evaluate("__vl.click('#vault-lab', '匯出')");
    await sleep(800);
    assert.equal(await page.evaluate('__vl.box().value'), 'abc', '重繪後字不見了');
    // 按了別的按鈕焦點本來就會走，讀者點回文字框接著打，字要接在後面
    await page.evaluate('__vl.box().focus(); true');
    await page.type('XY');
    assert.equal(await page.evaluate('__vl.box().value'), 'abcXY', '接著打字要接在後面');
  } finally {
    await page.close();
  }
});

test('備援公鑰寫進封套，鎖上再解開還在，save 不用再帶一次', async () => {
  const page = await openChrome();
  try {
    await page.goto(VAULT_URL);
    await page.evaluate(HELPERS);
    await page.waitFor('!!window.anoniVault', 'vault.js 載入');
    const recipient = await page.evaluate(`
      (async () => {
        const age = await import('age-encryption');
        return age.identityToRecipient(await age.generateIdentity());
      })()
    `);
    assert.match(recipient, /^age1/, '產不出備援公鑰');

    await page.evaluate(`window.anoniVault.create(${JSON.stringify(recipient)}).then(() => true)`);
    await page.evaluate("window.anoniVault.save({ note: 'with backup' }).then(() => true)");
    await page.evaluate('window.anoniVault.lock(); true');
    await page.evaluate('window.anoniVault.unlock().then(() => true)');
    assert.equal(await page.evaluate('window.anoniVault.backupRecipient()'), recipient, '解開後備援公鑰要從封套讀回來');

    // 這一次 save 沒有 UI 帶著 backupRecipient，公鑰要自己留著
    await page.evaluate("window.anoniVault.save({ note: 'second session' }).then(() => true)");
    await page.evaluate('window.anoniVault.lock(); true');
    await page.evaluate('window.anoniVault.unlock().then(() => true)');
    assert.equal(await page.evaluate('window.anoniVault.backupRecipient()'), recipient, '第二次 save 把備援公鑰弄丟了');
    assert.deepEqual(await page.evaluate('window.anoniVault.read()'), { note: 'second session' });
  } finally {
    await page.close();
  }
});

test('手機寬度下按鈕有間距、夠高，不會誤按', async () => {
  const page = await openChrome();
  try {
    await page.goto(VAULT_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#vault-lab', '建一把新的鑰匙')", '暫存區畫出來');
    await page.evaluate("__vl.click('#vault-lab', '建一把新的鑰匙')");
    await page.waitFor('__vl.boxVisible()', '建好並解開');
    await page.shot('04-vault-mobile-actions');

    const rects = await page.evaluate(`
      [...document.querySelectorAll('#vault-lab button')]
        .filter((b) => b.getClientRects().length > 0)
        .map((b) => { const r = b.getBoundingClientRect(); return { label: b.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height }; })
    `);
    assert.ok(rects.length >= 3, `解開後至少要有儲存、匯出、鎖上：${rects.map((r) => r.label).join('、')}`);
    for (const r of rects) {
      assert.ok(r.h >= 40, `「${r.label}」只有 ${r.h}px 高，手指按不準`);
    }
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        assert.ok(!overlap, `「${a.label}」與「${b.label}」疊在一起`);
        const sameRow = Math.abs(a.y - b.y) < 4;
        if (sameRow) {
          const gap = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w));
          assert.ok(gap >= 8, `「${a.label}」與「${b.label}」只隔 ${gap}px`);
        }
      }
    }
  } finally {
    await page.close();
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
