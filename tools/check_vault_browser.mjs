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
 *            node tools/check_vault_browser.mjs --only=清單  # 只跑名稱含這幾個字的
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
const CHECKLIST_URL = new URL('utils/checklist/', BASE).href;
const THREAT_URL = new URL('utils/threat-model/', BASE).href;
const AGE_URL = new URL('utils/age/', BASE).href;
const SHOTS = process.argv.includes('--shots');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice('--only='.length);
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
      const d = out.result?.exceptionDetails;
      throw new Error(
        out.result?.result?.description || d?.exception?.description || d?.text || '頁面上丟了例外'
      );
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
  // 模擬換到另一台：把驗證器裡的 credential 全部拿掉
  const clearCredentials = async () => {
    await send('WebAuthn.clearCredentials', { authenticatorId });
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
    clearCredentials,
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
    await page.waitFor("/建好了。這一把兩種用法都做得到/.test(__vl.text('#passkey-tool'))", '鑰匙頁說兩種用法都能用');
    const made = await page.credentials();
    assert.equal(made.length, 1, '建立之後驗證器裡應該只有一筆');
    assert.match(made[0].userName || '', /^anoni\.net \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, `密碼管理器裡的名字要帶日期與時分：${made[0].userName}`);
    assert.ok((await page.evaluate("__vl.text('#passkey-tool')")).includes(made[0].userName), '建好之後要把名字念出來');

    // 同一把也要算得出檔案加密金鑰
    await page.evaluate("__vl.click('#passkey-tool', '試解鎖')");
    await page.waitFor("/解鎖成功，這個環境算得出檔案加密的金鑰/.test(__vl.text('#passkey-tool'))", '試解鎖成功');
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

test('清單頁用鑰匙頁建的 passkey 開，勾兩項重新整理後還在', async () => {
  const page = await openChrome();
  try {
    await page.goto(PASSKEY_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#passkey-tool', '建立 passkey')", '鑰匙頁畫出來');
    await page.evaluate("__vl.click('#passkey-tool', '建立 passkey')");
    await page.waitFor("/建好了/.test(__vl.text('#passkey-tool'))", '鑰匙建好');

    await page.goto(CHECKLIST_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#checklist-tool', '用我已有的鑰匙開')", '清單頁給出「用已有的鑰匙」');
    await page.evaluate("__vl.click('#checklist-tool', '用我已有的鑰匙開')");
    await page.waitFor("document.querySelectorAll('#checklist-tool input[type=checkbox]').length > 0", '清單畫出來');
    assert.equal((await page.credentials()).length, 1, '用已有的鑰匙開不該多出 credential');

    const total = await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length");
    const links = await page.evaluate(`
      [...document.querySelectorAll('#checklist-tool .cl-item a')]
        .map((a) => ({ blank: a.target === '_blank', noopener: /noopener/.test(a.rel), href: a.getAttribute('href') }))
    `);
    assert.equal(links.length, total, '每個項目都要有連結');
    for (const l of links) assert.ok(l.blank && l.noopener, `連結沒有開新分頁：${l.href}`);

    await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')[0].click(); true");
    await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')[1].click(); true");
    await page.waitFor("/已存/.test(__vl.text('#checklist-tool'))", '自動存');
    assert.match(await page.evaluate("document.querySelector('#checklist-tool .cl-progress').textContent"), new RegExp(`2 / ${total}`));
    await page.shot('05-checklist-ticked');

    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '重新整理');
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#checklist-tool', '用 passkey 解開')", '重新整理後回到鎖上狀態');
    await page.evaluate("__vl.click('#checklist-tool', '用 passkey 解開')");
    await page.waitFor("document.querySelectorAll('#checklist-tool input[type=checkbox]').length > 0", '再次解開');
    const checked = await page.evaluate("[...document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')].filter((i) => i.checked).length");
    assert.equal(checked, 2, '勾的兩項要留到下一次');
    const dates = await page.evaluate("[...document.querySelectorAll('#checklist-tool .cl-date')].map((d) => d.textContent).filter(Boolean)");
    assert.equal(dates.length, 2, '勾的項目要顯示日期');
    for (const d of dates) assert.match(d, /^\d{4}-\d{2}-\d{2}$/, `日期格式不對：${d}`);
    assert.equal((await page.credentials()).length, 1, '解開不該多出 credential');

    // 清除這台裝置：第一下只出現確認，取消回原狀，確認才真的清
    await page.evaluate("__vl.click('#checklist-tool', '清除這台裝置的暫存區')");
    await page.waitFor("!!__vl.button('#checklist-tool', '確定清除')", '第一下要出現確認');
    await page.evaluate("__vl.click('#checklist-tool', '取消')");
    assert.ok(await page.evaluate("!__vl.button('#checklist-tool', '確定清除') && document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length > 0"), '取消要回到原狀');
    await page.evaluate("__vl.click('#checklist-tool', '清除這台裝置的暫存區')");
    await page.evaluate("__vl.click('#checklist-tool', '確定清除')");
    await page.waitFor("/清掉了/.test(__vl.text('#checklist-tool'))", '清掉');
    assert.ok(await page.evaluate("!!__vl.button('#checklist-tool', '建一把新的鑰匙')"), '清掉之後這台沒有暫存區了');
  } finally {
    await page.close();
  }
});

test('威脅模型答案存進暫存區，重新整理後填回來，對手選親密關係就沒有存的按鈕', async () => {
  const page = await openChrome();
  try {
    await page.goto(THREAT_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("document.querySelectorAll('#threatmodel-tool input').length > 0", '工具畫出來');
    // 頂端不該有「填回上次」：這台裝置還沒有暫存區
    assert.equal(await page.evaluate("!!__vl.button('#threatmodel-tool', '用 passkey 填回上次的答案')"), false, '沒有暫存區卻出現填回按鈕');

    const pick = async (name, index) => page.evaluate(`
      (() => { const list = [...document.querySelectorAll('#threatmodel-tool fieldset')][${index}].querySelectorAll('input');
        const i = [...list].find((x) => x.nextSibling && x.nextSibling.textContent.startsWith('${name}'));
        if (!i) throw new Error('沒有選項 ${name}'); i.click(); return true; })()
    `);
    await pick('內容相關', 0);
    await pick('隨意路人', 1);
    await pick('低', 2);
    await page.evaluate("__vl.click('#threatmodel-tool', '產生摘要')");
    await page.waitFor("!!document.querySelector('#threatmodel-tool .tm-out')", '摘要出現');
    assert.ok(await page.evaluate("!!__vl.button('#threatmodel-tool', '存進我的暫存區')"), '隨意路人為對手時要有存的按鈕');

    await page.evaluate("__vl.click('#threatmodel-tool', '存進我的暫存區')");
    await page.waitFor("!!__vl.button('#threatmodel-tool', '建一把新的鑰匙')", '沒有暫存區時給兩個選項');
    await page.evaluate("__vl.click('#threatmodel-tool', '建一把新的鑰匙')");
    await page.waitFor("/已存，\\d{4}-\\d{2}-\\d{2}/.test(__vl.text('#threatmodel-tool'))", '存好並顯示日期');
    assert.equal((await page.credentials()).length, 1, '建鑰匙之後驗證器裡應該只有一筆');
    assert.ok(await page.evaluate("__vl.button('#threatmodel-tool', '更新存檔').disabled"), '剛存完、沒改答案，更新要是灰的');
    await page.evaluate("document.querySelector('#threatmodel-tool .tm-store').scrollIntoView(); true");
    await page.shot('06-threat-model-saved');

    // 改答案會讓摘要失效，暫存區那段跟摘要一起收起來，按「重新產生」才回來。
    // 選親密關係 → 存的按鈕消失、只剩刪與鎖
    await pick('親密關係', 1);
    assert.ok(await page.evaluate("!document.querySelector('#threatmodel-tool .tm-out')"), '改答案之後舊摘要還在');
    await page.evaluate("__vl.click('#threatmodel-tool', '產生摘要')");
    await page.waitFor("!!document.querySelector('#threatmodel-tool .tm-out')", '重新產生');
    assert.ok(await page.evaluate("!__vl.button('#threatmodel-tool', '更新存檔') && !__vl.button('#threatmodel-tool', '存進我的暫存區')"), '選了親密關係還有存的按鈕');
    assert.ok(await page.evaluate("/不提供存檔/.test(__vl.text('#threatmodel-tool'))"), '選了親密關係要說明為什麼不提供');
    assert.ok(await page.evaluate("!!__vl.button('#threatmodel-tool', '刪掉存檔')"), '解開狀態下要能刪掉舊存檔');
    await pick('親密關係', 1); // 取消
    await page.evaluate("__vl.click('#threatmodel-tool', '產生摘要')");
    await page.waitFor("!!__vl.button('#threatmodel-tool', '更新存檔')", '取消親密關係之後更新回來');
    assert.ok(await page.evaluate("!__vl.button('#threatmodel-tool', '更新存檔').disabled"), '改過答案，更新要能按');

    // 重新整理 → 頂端問要不要填回 → 填回後三題與摘要都在
    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '重新整理');
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#threatmodel-tool', '用 passkey 填回上次的答案')", '重新整理後頂端問要不要填回');
    await page.evaluate("__vl.click('#threatmodel-tool', '用 passkey 填回上次的答案')");
    await page.waitFor("!!document.querySelector('#threatmodel-tool .tm-out')", '填回後摘要直接出現');
    const checked = await page.evaluate("[...document.querySelectorAll('#threatmodel-tool input:checked')].map((i) => i.nextSibling.textContent.slice(0, 4))");
    assert.deepEqual(checked, ['內容相關', '隨意路人', '低：不想'], `填回來的答案不對：${checked.join('、')}`);
    assert.equal((await page.credentials()).length, 1, '填回不該多出 credential');

    // 刪掉存檔 → 重新整理後頂端不再有填回（暫存區還在，但沒有威脅模型）
    await page.evaluate("__vl.click('#threatmodel-tool', '刪掉存檔')");
    await page.waitFor("/刪掉了/.test(__vl.text('#threatmodel-tool'))", '刪掉');
    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '再重新整理');
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#threatmodel-tool', '用 passkey 填回上次的答案')", '暫存區還在，頂端照樣問');
    await page.evaluate("__vl.click('#threatmodel-tool', '用 passkey 填回上次的答案')");
    await page.waitFor("/沒有存過威脅模型/.test(__vl.text('#threatmodel-tool'))", '刪掉之後填回要說沒有');
  } finally {
    await page.close();
  }
});

test('清單超過一年沒動的會標出來、篩得出來，按今天確認過就換日期', async () => {
  const page = await openChrome();
  try {
    await page.goto(CHECKLIST_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#checklist-tool', '建一把新的鑰匙')", '清單頁畫出來');
    await page.evaluate("__vl.click('#checklist-tool', '建一把新的鑰匙')");
    await page.waitFor("document.querySelectorAll('#checklist-tool input[type=checkbox]').length > 0", '清單畫出來');
    const visible = () => page.evaluate("[...document.querySelectorAll('#checklist-tool .cl-item')].filter((li) => li.getClientRects().length > 0).length");
    const total = await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item').length");
    const yearly = await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item--stale').length");
    assert.equal(yearly, 9, '每年重看那組九題一開始都該標成該看');

    // 直接把一個平常的項目寫成兩年前勾的，模擬放了很久
    await page.evaluate(`
      window.anoniVault.read().then((data) => {
        data.checks = data.checks || {}; // 還沒勾過任何東西時密文裡沒有這一欄
        data.checks['daily.backup'] = '2024-01-15';
        return window.anoniVault.save(data);
      }).then(() => true)
    `);
    await page.evaluate("__vl.click('#checklist-tool', '鎖上')");
    await page.waitFor("!!__vl.button('#checklist-tool', '用 passkey 解開')", '鎖上');
    await page.evaluate("__vl.click('#checklist-tool', '用 passkey 解開')");
    await page.waitFor("document.querySelectorAll('#checklist-tool input[type=checkbox]').length > 0", '再解開');
    const backup = "document.querySelector('#checklist-tool #cl-daily-backup').closest('.cl-item')";
    assert.ok(await page.evaluate(`${backup}.classList.contains('cl-item--stale')`), '兩年前勾的沒有標成超過一年');
    assert.ok(await page.evaluate(`${backup}.querySelector('.cl-stale').getClientRects().length > 0`), '超過一年的標籤沒顯示');
    assert.ok(await page.evaluate(`${backup}.querySelector('.cl-confirm').getClientRects().length > 0`), '超過一年的沒有確認按鈕');
    assert.match(await page.evaluate("document.querySelector('#checklist-tool .cl-filter').textContent"), /（10）/, '篩選旁的數字要是 9 題加 1 項');
    const tagsShown = await page.evaluate("[...document.querySelectorAll('#checklist-tool .cl-stale')].filter((x) => x.getClientRects().length > 0).length");
    assert.equal(tagsShown, 10, '只有超過一年的項目該顯示標籤');

    await page.evaluate("document.querySelector('#checklist-tool .cl-filter input').click(); true");
    assert.equal(await visible(), 10, '篩選後只該剩該重看的');
    await page.shot('07-checklist-stale-filter');

    await page.evaluate(`${backup}.querySelector('.cl-confirm').click(); true`);
    assert.ok(await page.evaluate(`${backup}.querySelector('input').checked`), '按確認不該把勾拿掉');
    assert.match(await page.evaluate(`${backup}.querySelector('.cl-date').textContent`), /^\d{4}-\d{2}-\d{2}$/);
    assert.notEqual(await page.evaluate(`${backup}.querySelector('.cl-date').textContent`), '2024-01-15', '日期沒換成今天');
    assert.equal(await visible(), 9, '確認過的要從篩選裡消失');
    await page.waitFor("/已存/.test(__vl.text('#checklist-tool'))", '自動存');

    await page.evaluate("document.querySelector('#checklist-tool .cl-filter input').click(); true");
    assert.equal(await visible(), total, '關掉篩選要全部回來');
  } finally {
    await page.close();
  }
});

test('本機檔案加密的收件人簿：存一把備援公鑰，重新整理後打開簿子填回欄位', async () => {
  const page = await openChrome();
  const toPasskeyMode = async () => {
    await page.waitFor("!!document.querySelector('#age-tool textarea')", '工具畫出來');
    await page.evaluate("const ta = document.querySelector('#age-tool textarea'); ta.value = 'hello book'; ta.dispatchEvent(new Event('input', { bubbles: true })); true");
    await page.evaluate("__vl.click('#age-tool', '用這段文字')");
    await page.waitFor("!!document.querySelector('#age-tool input[name=ag-keymode][value=passkey]') && !document.querySelector('#age-tool input[name=ag-keymode][value=passkey]').disabled", 'passkey 模式可選');
    await page.evaluate("document.querySelector('#age-tool input[name=ag-keymode][value=passkey]').click(); true");
    await page.waitFor("!!document.querySelector('#age-tool input[placeholder=\"age1…\"]')", '備援金鑰欄位出現');
  };
  const field = "document.querySelector('#age-tool input[placeholder=\"age1…\"]')";
  try {
    await page.goto(AGE_URL);
    await page.evaluate(HELPERS);
    await toPasskeyMode();
    await page.waitFor("!!__vl.button('#age-tool', '存進收件人簿')", '收件人簿區塊出現');
    assert.ok(await page.evaluate("__vl.button('#age-tool', '存進收件人簿').disabled"), '欄位還是空的，存的按鈕要是灰的');

    await page.evaluate("__vl.click('#age-tool', '產生備援金鑰')");
    await page.waitFor(`${field}.value.startsWith('age1')`, '備援公鑰填進欄位');
    const recipient = await page.evaluate(`${field}.value`);
    await page.waitFor("!__vl.button('#age-tool', '存進收件人簿').disabled", '有了公鑰，存的按鈕要能按');
    await page.evaluate("__vl.click('#age-tool', '存進收件人簿')");
    await page.waitFor("!!__vl.button('#age-tool', '建一把新的鑰匙')", '沒有暫存區時給兩個選項');
    await page.evaluate("__vl.click('#age-tool', '建一把新的鑰匙')");
    await page.waitFor("/存好了/.test(__vl.text('#age-tool'))", '存進簿子');
    assert.equal((await page.credentials()).length, 1, '建鑰匙之後驗證器裡應該只有一筆');
    assert.equal(await page.evaluate("document.querySelectorAll('#age-tool .ag-book-row').length"), 1, '簿子裡該有一筆');
    await page.evaluate("document.querySelector('#age-tool .ag-book').scrollIntoView(); true");
    await page.shot('08-age-address-book');

    // 重新整理：欄位空了，打開簿子、填入，公鑰要一樣
    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '重新整理');
    await page.evaluate(HELPERS);
    await toPasskeyMode();
    assert.equal(await page.evaluate(`${field}.value`), '', '重新整理後欄位該是空的');
    await page.waitFor("!!__vl.button('#age-tool', '用 passkey 打開收件人簿')", '有暫存區時給打開的按鈕');
    await page.evaluate("__vl.click('#age-tool', '用 passkey 打開收件人簿')");
    await page.waitFor("document.querySelectorAll('#age-tool .ag-book-row').length === 1", '簿子打開有一筆');
    await page.evaluate("__vl.click('#age-tool', '填入')");
    await page.waitFor(`${field}.value === ${JSON.stringify(recipient)}`, '填回來的公鑰要跟存的一樣');
    assert.ok(await page.evaluate("__vl.button('#age-tool', '存進收件人簿').disabled"), '已經在簿子裡的公鑰不該再能存');
    assert.equal((await page.credentials()).length, 1, '打開簿子不該多出 credential');

    // 刪掉之後簿子空了，欄位的值還在
    await page.evaluate("__vl.click('#age-tool', '刪')");
    // 刪除進行中畫面只剩「等你完成」，那時 .ag-book-row 已經是 0，要等空的那句出現才算完成
    await page.waitFor("/還是空的/.test(__vl.text('#age-tool'))", '刪掉之後簿子空了要說');
    assert.equal(await page.evaluate("document.querySelectorAll('#age-tool .ag-book-row').length"), 0, '刪掉之後不該還有列');
    assert.equal(await page.evaluate(`${field}.value`), recipient, '刪掉簿子裡的那筆不該動到欄位');
  } finally {
    await page.close();
  }
});

test('公鑰模式：產生金鑰、加密給兩位收件人、重新整理後用私鑰與 key.txt 解回來', async () => {
  const page = await openChrome();
  const pasteAnd = async (text) => {
    await page.waitFor("!!document.querySelector('#age-tool textarea')", '工具畫出來');
    // Runtime.evaluate 的頂層 const 會留在全域，第二次宣告會撞，所以包成 IIFE
    await page.evaluate(`(() => { const ta = document.querySelector('#age-tool textarea'); ta.value = ${JSON.stringify(text)}; ta.dispatchEvent(new Event('input', { bubbles: true })); })(); true`);
    await page.evaluate("__vl.click('#age-tool', '用這段文字')");
    await page.waitFor("!!document.querySelector('#age-tool .ag-name')", '檔案載入');
  };
  const secretField = "document.querySelector('#age-tool input[placeholder=\"AGE-SECRET-KEY-1…\"]')";
  try {
    await page.goto(AGE_URL);
    await page.evaluate(HELPERS);
    await pasteAnd('公鑰模式的一段話');
    await page.evaluate("document.querySelector('#age-tool input[name=ag-keymode][value=recipients]').click(); true");
    await page.waitFor("!!__vl.button('#age-tool', '產生金鑰')", '公鑰模式畫出來');
    assert.ok(await page.evaluate("__vl.button('#age-tool', '加密並下載').disabled"), '沒有收件人時不能加密');

    // 一位是頁面產生的，一位是外面來的（用頁面上的 typage 另外產一把，模擬夥伴的公鑰）
    const other = await page.evaluate(`
      import('age-encryption').then(async (age) => { const id = await age.generateIdentity(); return { identity: id, recipient: await age.identityToRecipient(id) }; })
    `);
    await page.evaluate("__vl.click('#age-tool', '產生金鑰')");
    await page.waitFor("!!document.querySelector('#age-tool a[download=\"key.txt\"]')", 'key.txt 的下載連結出現');
    const keyText = await page.evaluate("fetch(document.querySelector('#age-tool a[download=\"key.txt\"]').href).then((r) => r.text())");
    assert.match(keyText, /^# created: .+\n# public key: age1[a-z0-9]{58}\nAGE-SECRET-KEY-1[A-Z0-9]{58}\n$/, 'key.txt 的格式要跟 age-keygen 一樣');
    const mine = keyText.split('\n')[2];
    const minePub = keyText.split('\n')[1].replace('# public key: ', '');
    const area = await page.evaluate("document.querySelector('#age-tool .ag-recipients').value");
    assert.ok(area.includes(minePub), '產生的公鑰要加進收件人');
    assert.ok(!(await page.evaluate("__vl.text('#age-tool')")).includes(mine), '私鑰不能出現在畫面上');
    await page.evaluate(`(() => { const ta = document.querySelector('#age-tool .ag-recipients'); ta.value = ta.value + ${JSON.stringify(other.recipient)} + '\\n'; ta.dispatchEvent(new Event('input', { bubbles: true })); })(); true`);
    await page.waitFor("!__vl.button('#age-tool', '加密並下載').disabled", '有收件人了要能加密');
    await page.evaluate("__vl.click('#age-tool', '加密並下載')");
    await page.waitFor("/2 位收件人/.test(__vl.text('#age-tool'))", '加密完成且檔頭有兩位');
    assert.ok(await page.evaluate("/解回來比對，跟原檔一致/.test(__vl.text('#age-tool'))"), '剛產生的那把在收件人裡，要有解回比對');
    const armored = await page.evaluate("[...document.querySelectorAll('#age-tool .ag-out')].map((o) => o.value).find((v) => v.startsWith('-----BEGIN AGE'))");
    assert.ok(armored, '文字輸入的輸出要是 armor');
    await page.shot('09-age-recipients');

    // 重新整理，貼密文，用貼的私鑰解
    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '重新整理');
    await page.evaluate(HELPERS);
    await pasteAnd(armored);
    await page.waitFor("!!__vl.button('#age-tool', '用私鑰解開')", '檔頭只有公鑰段落，要私鑰');
    assert.ok(await page.evaluate("__vl.button('#age-tool', '用私鑰解開').disabled"), '還沒貼私鑰不能解');
    await page.evaluate(`${secretField}.value = ${JSON.stringify(other.identity)}; ${secretField}.dispatchEvent(new Event('input', { bubbles: true })); true`);
    await page.waitFor("!__vl.button('#age-tool', '用私鑰解開').disabled", '貼了私鑰要能解');
    await page.evaluate("__vl.click('#age-tool', '用私鑰解開')");
    await page.waitFor("/解開了/.test(__vl.text('#age-tool'))", '另一位用自己的私鑰解開');
    assert.equal(await page.evaluate("document.querySelector('#age-tool .ag-out').value"), '公鑰模式的一段話', '解出來的文字要跟原本一樣');

    // 再來一次，改用 key.txt 檔案
    await page.send('Page.reload');
    await page.waitFor("document.readyState === 'complete'", '重新整理');
    await page.evaluate(HELPERS);
    await pasteAnd(armored);
    await page.waitFor("!!document.querySelector('#age-tool input.ag-keyfile')", 'key.txt 的選檔出現');
    const keyPath = path.join(os.tmpdir(), `anoni-key-${process.pid}.txt`);
    fs.writeFileSync(keyPath, keyText);
    const { result: doc } = await page.send('DOM.getDocument', { depth: 1 });
    const { result: node } = await page.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#age-tool input.ag-keyfile' });
    await page.send('DOM.setFileInputFiles', { nodeId: node.nodeId, files: [keyPath] });
    await page.waitFor("/讀進 .*私鑰了/.test(__vl.text('#age-tool'))", '從 key.txt 讀進私鑰');
    await page.evaluate("__vl.click('#age-tool', '用私鑰解開')");
    await page.waitFor("/解開了/.test(__vl.text('#age-tool'))", '用 key.txt 解開');
    assert.equal(await page.evaluate("document.querySelector('#age-tool .ag-out').value"), '公鑰模式的一段話');
    fs.rmSync(keyPath, { force: true });
  } finally {
    await page.close();
  }
});

test('清單傳到另一台：密文經 #send= 進 QR 串流頁載入，經 #import= 回清單頁匯入', async () => {
  const page = await openChrome();
  const QR_URL = new URL('utils/qr-stream/', BASE).href;
  try {
    await page.goto(CHECKLIST_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#checklist-tool', '建一把新的鑰匙')", '清單頁畫出來');
    await page.evaluate("__vl.click('#checklist-tool', '建一把新的鑰匙')");
    await page.waitFor("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length > 0", '清單畫出來');
    await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')[0].click(); true");
    await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')[3].click(); true");
    await page.waitFor("/已存/.test(__vl.text('#checklist-tool'))", '自動存');

    // 「傳到另一台」會開新分頁，這裡把 window.open 換掉，抓它要開的網址
    await page.evaluate("window.open = (u) => { window.__opened = u; return null; }; true");
    await page.evaluate("__vl.click('#checklist-tool', '傳到另一台（QR）')");
    await page.waitFor("!!window.__opened", '要開新分頁');
    const opened = await page.evaluate("window.__opened");
    assert.ok(opened.startsWith(QR_URL + '#send='), `開的網址不對：${opened.slice(0, 80)}`);
    assert.ok(await page.evaluate("/開了一個新分頁/.test(__vl.text('#checklist-tool'))"), '要告訴讀者接下來另一台怎麼做');
    const payload = opened.slice((QR_URL + '#send=').length);
    assert.ok(payload.length > 100 && /^[A-Za-z0-9_-]+$/.test(payload), '片段要是 base64url');

    // 串流頁：載入密文、片段清掉、切在傳送分頁、檔名對
    await page.goto(opened);
    await page.evaluate(HELPERS);
    await page.waitFor("/從我的準備清單帶過來/.test(__vl.text('#qr-stream-tool'))", '串流頁說密文載入了');
    await page.waitFor("/anoni-vault\\.age/.test(__vl.text('#qr-stream-tool'))", '要傳的檔名是暫存區的密文');
    assert.equal(await page.evaluate('location.hash'), '', '讀完片段要清掉');
    assert.equal(await page.evaluate("document.querySelector('#qr-stream-tool [aria-selected=\"true\"]').textContent.trim()"), '傳送', '要停在傳送分頁');
    await page.shot('10-qr-handoff');

    // 模擬另一台：清掉這台的暫存區，帶著 #import= 回清單頁
    await page.goto(CHECKLIST_URL);
    await page.evaluate(HELPERS);
    await page.waitFor('!!window.anoniVault', 'vault.js 載入');
    await page.evaluate('window.anoniVault.clear().then(() => true)');
    // 同一頁只換片段不會重新載入，先離開再帶片段進來
    await page.goto('about:blank');
    await page.goto(CHECKLIST_URL + '#import=' + payload);
    await page.evaluate(HELPERS);
    await page.waitFor("/從 QR 影格串流收到的密文匯進來了/.test(__vl.text('#checklist-tool'))", '帶回來的密文要匯入');
    assert.equal(await page.evaluate('location.hash'), '', '匯入之後片段要清掉');
    await page.waitFor("!!__vl.button('#checklist-tool', '用 passkey 解開')", '匯入後是鎖上狀態');
    await page.evaluate("__vl.click('#checklist-tool', '用 passkey 解開')");
    await page.waitFor("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length > 0", '解開');
    const checked = await page.evaluate("[...document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')].filter((i) => i.checked).length");
    assert.equal(checked, 2, '搬過來的勾選要還在');

    // 壞掉的片段：不匯入、片段照樣清掉、暫存區不動
    await page.goto('about:blank');
    await page.goto(CHECKLIST_URL + '#import=not-base64!!');
    await page.evaluate(HELPERS);
    await page.waitFor("/不是暫存區的密文/.test(__vl.text('#checklist-tool'))", '壞片段要說');
    assert.equal(await page.evaluate('location.hash'), '');
    assert.ok(await page.evaluate("!!__vl.button('#checklist-tool', '用 passkey 解開')"), '原本的暫存區要還在');
  } finally {
    await page.close();
  }
});

test('登錄另一台：A 顯示鑰匙的 QR code，B 拍照登錄後用同一份鑰匙解開搬過來的資料', async () => {
  const page = await openChrome();
  try {
    await page.goto(CHECKLIST_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#checklist-tool', '建一把新的鑰匙')", '清單頁畫出來');
    await page.evaluate("__vl.click('#checklist-tool', '建一把新的鑰匙')");
    await page.waitFor("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length > 0", '清單畫出來');
    await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')[1].click(); true");
    await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')[2].click(); true");
    await page.waitFor("/已存/.test(__vl.text('#checklist-tool'))", '自動存');
    const exported = await page.evaluate("window.anoniVault.exportBlob().then((bytes) => Array.from(bytes))");
    const blobPath = path.join(os.tmpdir(), `anoni-enroll-${process.pid}.age`);
    fs.writeFileSync(blobPath, Buffer.from(exported));

    // A：顯示鑰匙
    await page.evaluate("__vl.click('#checklist-tool', '登錄另一台裝置')");
    await page.waitFor("!!document.querySelector('#checklist-tool .cl-secret')", '鑰匙顯示出來');
    const identity = await page.evaluate("document.querySelector('#checklist-tool .cl-secret').textContent");
    assert.match(identity, /^AGE-SECRET-KEY-1[0-9A-Z]{58}$/, '顯示的要是 age 私鑰編碼');
    assert.ok(await page.evaluate("!!document.querySelector('#checklist-tool canvas.cl-qr')"), '要有 QR code');
    assert.ok(await page.evaluate("/資料金鑰本身/.test(__vl.text('#checklist-tool'))"), '要先警告');
    assert.match(await page.evaluate("document.querySelector('#checklist-tool .cl-countdown').textContent"), /還剩 (60|59|58) 秒/, '倒數要從一分鐘開始');
    await page.evaluate("document.querySelector('#checklist-tool .cl-enroll-show').scrollIntoView(); true");
    await page.shot('11-enroll-show');
    const png = await page.evaluate("document.querySelector('#checklist-tool canvas.cl-qr').toDataURL('image/png').split(',')[1]");
    const photoPath = path.join(os.tmpdir(), `anoni-enroll-${process.pid}.png`);
    fs.writeFileSync(photoPath, Buffer.from(png, 'base64'));

    // 關掉之後畫面上不能再有鑰匙；鎖上也一樣
    await page.evaluate("__vl.click('#checklist-tool', '關掉')");
    assert.ok(!(await page.evaluate("__vl.text('#checklist-tool')")).includes(identity), '關掉之後鑰匙還在畫面上');
    await page.evaluate("__vl.click('#checklist-tool', '登錄另一台裝置')");
    await page.waitFor("!!document.querySelector('#checklist-tool .cl-secret')", '再顯示一次');
    await page.evaluate("__vl.click('#checklist-tool', '鎖上')");
    await page.waitFor("!!__vl.button('#checklist-tool', '用 passkey 解開')", '鎖上');
    assert.ok(!(await page.evaluate("__vl.text('#checklist-tool')")).includes(identity), '鎖上之後鑰匙還在畫面上');

    // B：這台沒有 passkey 也沒有暫存區，拍 A 的 QR code 登錄
    await page.clearCredentials();
    await page.evaluate('window.anoniVault.clear().then(() => true)');
    await page.goto('about:blank');
    await page.goto(CHECKLIST_URL);
    await page.evaluate(HELPERS);
    await page.waitFor("!!__vl.button('#checklist-tool', '用另一台的鑰匙登錄這台')", 'B 端給登錄的入口');
    await page.evaluate("__vl.click('#checklist-tool', '用另一台的鑰匙登錄這台')");
    await page.waitFor("!!document.querySelector('#checklist-tool input.cl-photo')", '登錄面板出現');
    assert.ok(await page.evaluate("__vl.button('#checklist-tool', '登錄這台裝置').disabled"), '還沒有鑰匙不能登錄');
    const { result: doc } = await page.send('DOM.getDocument', { depth: 1 });
    const { result: node } = await page.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#checklist-tool input.cl-photo' });
    await page.send('DOM.setFileInputFiles', { nodeId: node.nodeId, files: [photoPath] });
    await page.waitFor(`document.querySelector('#checklist-tool input.cl-key') && document.querySelector('#checklist-tool input.cl-key').value === ${JSON.stringify(identity)}`, '照片解出鑰匙填進欄位');
    await page.waitFor("!__vl.button('#checklist-tool', '登錄這台裝置').disabled", '有鑰匙了要能登錄');
    await page.evaluate("__vl.click('#checklist-tool', '登錄這台裝置')");
    await page.waitFor("/這台登錄好了/.test(__vl.text('#checklist-tool'))", '登錄完成');
    assert.equal((await page.credentials()).length, 1, 'B 端要建出一筆新的 credential');
    assert.ok(await page.evaluate("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length > 0"), '登錄完直接是解開的');

    // 把 A 匯出的密文用檔案匯進來，用 B 這把新的 passkey 解開
    await page.evaluate("__vl.click('#checklist-tool', '鎖上')");
    await page.waitFor("!!document.querySelector('#checklist-tool input.cl-file')", '鎖上後有匯入的選檔');
    const { result: doc2 } = await page.send('DOM.getDocument', { depth: 1 });
    const { result: fileNode } = await page.send('DOM.querySelector', { nodeId: doc2.root.nodeId, selector: '#checklist-tool input.cl-file' });
    await page.send('DOM.setFileInputFiles', { nodeId: fileNode.nodeId, files: [blobPath] });
    await page.waitFor("/匯進來了/.test(__vl.text('#checklist-tool'))", '搬過來');
    await page.evaluate("__vl.click('#checklist-tool', '用 passkey 解開')");
    await page.waitFor("document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]').length > 0", '用新的 passkey 解開');
    const checked = await page.evaluate("[...document.querySelectorAll('#checklist-tool .cl-item input[type=checkbox]')].filter((i) => i.checked).length");
    assert.equal(checked, 2, 'A 勾的兩項要在 B 解得出來');
    fs.rmSync(photoPath, { force: true });
    fs.rmSync(blobPath, { force: true });
  } finally {
    await page.close();
  }
});

for (const [name, fn] of tests) {
  if (ONLY && !name.includes(ONLY)) continue;
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
