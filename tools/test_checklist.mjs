#!/usr/bin/env node
/**
 * 我的準備清單（docs/zh-TW/js/checklist.js）的接線檢查。
 *
 * === 為什麼需要這支 ===
 *
 * 清單的項目 id 進了讀者的密文就不能改，標籤與連結卻是三個語系各自維護。這裡守的是
 * 三邊對得上：骨架裡每個 id 三語系都有字串、沒有多出來的字串、連結指到的文章存在，
 * 建置產物在的話連錨點也對一次。錨點在 mkdocs 裡是 INFO 等級，改壞了照樣建得起來。
 *
 * 另守三語系頁面、import map 與 nav 的接線，跟 test_passkey.mjs 同一套。
 *
 * 用法：
 *   node tools/test_checklist.mjs
 * 不需要建置產物，有的話多驗錨點。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const SRC = path.join(DOCS, 'zh-TW', 'js', 'checklist.js');
const OUTPUT = path.join(DOCS, 'output');
const src = fs.readFileSync(SRC, 'utf8');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`checklist.js 裡找不到 ${re}`);
  return m[0];
};
const GROUPS = new Function(`${grab(/^  const GROUPS = \[[\s\S]*?\n  \];/m)}\n return GROUPS;`)();
const RETIRED = new Function(`${grab(/^  const RETIRED = \[.*\];$/m)}\n return RETIRED;`)();
const STRINGS = new Function(`${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}\n return STRINGS;`)();
const { daysBetween, isStale, STALE_DAYS } = new Function(`${grab(/^  const STALE_DAYS = .*$/m)}\n${grab(/^  function daysBetween\(from, to\) \{[\s\S]*?\n  \}/m)}\n${grab(/^  function isStale\(groupId, date, today\) \{[\s\S]*?\n  \}/m)}\n return { daysBetween, isStale, STALE_DAYS };`)();

// STRINGS 的 key、磁碟資料夾、建置產物的資料夾
const LANGS = [
  ['zh-TW', 'zh-TW', ''],
  ['zh', 'zh-CN', 'zh-cn'],
  ['en', 'en', 'en'],
];

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
let passed = 0;
let failed = 0;

const shape = (obj) =>
  JSON.stringify(
    Object.keys(obj)
      .sort()
      .map((k) => [k, obj[k] && typeof obj[k] === 'object' ? shape(obj[k]) : typeof obj[k]])
  );

test('骨架裡的 id 不重複，也不跟下架的撞名', () => {
  const ids = GROUPS.flatMap((g) => g.items.map((item) => `${g.id}.${item}`));
  assert.equal(new Set(ids).size, ids.length, 'id 重複');
  for (const id of RETIRED) assert.ok(!ids.includes(id), `${id} 同時在骨架與 RETIRED`);
  assert.ok(ids.length >= 10, '清單太短，不像是完整的');
});

test('三個語系的字串表結構一致', () => {
  assert.equal(shape(STRINGS.zh), shape(STRINGS['zh-TW']));
  assert.equal(shape(STRINGS.en), shape(STRINGS['zh-TW']));
});

test('每個項目三語系都有標籤與連結，沒有多出來的', () => {
  const items = GROUPS.flatMap((g) => g.items);
  for (const [key] of LANGS) {
    const t = STRINGS[key];
    for (const item of items) {
      assert.ok(t.items[item], `${key} 少了 ${item}`);
      assert.ok(t.items[item].label.length > 0, `${key} 的 ${item} 沒有標籤`);
      assert.match(t.items[item].href, /^\.\.\/\.\.\//, `${key} 的 ${item} 連結要從 utils/checklist/ 往上兩層`);
    }
    for (const extra of Object.keys(t.items)) assert.ok(items.includes(extra), `${key} 多了 ${extra}，骨架裡沒有`);
    for (const g of GROUPS) assert.ok(t.groups[g.id], `${key} 少了群組 ${g.id} 的標題`);
  }
});

test('連結指到的文章存在，建置產物在的話錨點也對得上', () => {
  for (const [key, dir, outDir] of LANGS) {
    for (const [item, { href }] of Object.entries(STRINGS[key].items)) {
      const [pathPart, anchor] = href.replace(/^\.\.\/\.\.\//, '').split('#');
      const md = path.join(DOCS, dir, pathPart.replace(/\/$/, '') + '.md');
      assert.ok(fs.existsSync(md), `${key} 的 ${item} 連到 ${md}，檔案不存在`);
      if (!anchor) continue;
      const html = path.join(OUTPUT, outDir, pathPart, 'index.html');
      if (!fs.existsSync(html)) continue;
      const built = fs.readFileSync(html, 'utf8');
      assert.ok(built.includes(`id="${anchor}"`), `${key} 的 ${item} 錨點 #${anchor} 在 ${html} 裡找不到`);
    }
  }
});

test('三語系頁面都掛了工具、兩支腳本與 import map，offline_assets 跟鑰匙頁同一份', () => {
  const vendor = (file) => {
    const fm = fs.readFileSync(file, 'utf8').split('\n---')[0];
    return fm.split('\n').filter((l) => /^\s+- utils\/vendor\//.test(l)).map((l) => l.trim());
  };
  for (const [, dir] of LANGS) {
    const page = path.join(DOCS, dir, 'utils', 'checklist.md');
    assert.ok(fs.existsSync(page), `${page} 不存在`);
    const text = fs.readFileSync(page, 'utf8');
    assert.ok(text.includes('<div id="checklist-tool"></div>'), `${dir} 沒有掛點`);
    assert.ok(text.includes('<script src="../../js/vault.js"></script>'), `${dir} 沒載 vault.js`);
    assert.ok(text.includes('<script src="../../js/checklist.js"></script>'), `${dir} 沒載 checklist.js`);
    assert.ok(text.includes('<script type="importmap">'), `${dir} 沒有 import map`);
    assert.ok(text.includes('  - js/vault.js'), `${dir} 的 offline_assets 沒列 js/vault.js`);
    assert.ok(text.includes('  - js/checklist.js'), `${dir} 的 offline_assets 沒列 js/checklist.js`);
    assert.deepEqual(vendor(page).filter((l) => l.includes('vendor/age/')), vendor(path.join(DOCS, dir, 'utils', 'passkey.md')), `${dir} 的 age vendor 清單跟鑰匙頁不同`);
    for (const extra of ['utils/vendor/qrcode-generator.js', 'utils/vendor/jsQR.js']) assert.ok(text.includes(`  - ${extra}`), `${dir} 的 offline_assets 少了 ${extra}`);
    assert.ok(text.includes('<script src="../vendor/qrcode-generator.js"></script>') && text.includes('<script src="../vendor/jsQR.js"></script>'), `${dir} 沒載 QR 的 vendor`);
  }
});

test('三個 nav 與三個索引頁都收了清單', () => {
  for (const config of ['mkdocs.yml', 'mkdocs_en.yml', 'mkdocs_cn.yml']) {
    const text = fs.readFileSync(path.join(DOCS, config), 'utf8');
    assert.match(text, /^\s+- utils\/checklist\.md\s*$/m, `${config} 的 nav 沒有 utils/checklist.md`);
  }
  for (const [, dir] of LANGS) {
    const text = fs.readFileSync(path.join(DOCS, dir, 'utils', 'index.md'), 'utf8');
    assert.ok(text.includes('](checklist.md)'), `${dir}/utils/index.md 沒有清單的卡片`);
  }
});

test('三個語系的 js 目錄都拿得到 checklist.js', () => {
  for (const [, dir] of LANGS) {
    const file = path.join(DOCS, dir, 'js', 'checklist.js');
    assert.ok(fs.existsSync(file), `${file} 不存在`);
    assert.equal(fs.readFileSync(file, 'utf8'), src, `${dir}/js/checklist.js 內容跟 zh-TW 不同`);
  }
});

test('一年沒動的判斷：日期算天數、每年重看那組沒勾過也算', () => {
  assert.equal(STALE_DAYS, 365);
  assert.equal(daysBetween('2025-09-07', '2026-09-07'), 365);
  assert.equal(daysBetween('2026-09-07', '2026-09-08'), 1);
  assert.ok(Number.isNaN(daysBetween('bad', '2026-09-07')), '壞日期要是 NaN，不能算成 0 天');
  assert.equal(isStale('daily', '2025-09-07', '2026-09-07'), true, '滿一年要算');
  assert.equal(isStale('daily', '2025-09-08', '2026-09-07'), false, '差一天不算');
  assert.equal(isStale('daily', undefined, '2026-09-07'), false, '平常那組沒勾過是還沒做，不是沒動');
  assert.equal(isStale('yearly', undefined, '2026-09-07'), true, '每年重看那組沒勾過就是該看');
  assert.equal(isStale('daily', 'bad', '2026-09-07'), false, '壞日期不能被當成過期');
});

test('傳到另一台：密文走網址片段到 QR 串流頁，回來就匯入，片段讀完清掉', () => {
  assert.ok(/new URL\("\.\.\/qr-stream\/", window\.location\.href\)/.test(src), '傳到另一台沒有指到 qr-stream 頁');
  assert.ok(/url\.hash = "send=" \+ toBase64Url\(bytes\)/.test(src), '密文沒有放進 #send=');
  assert.ok(/window\.open\(url\.href, "_blank", "noopener"\)/.test(src), '要開新分頁而且 noopener，清單頁留著不用重新解鎖');
  assert.ok(/loc\.hash\.indexOf\("#import="\) !== 0/.test(src), '進頁面沒有看 #import=');
  assert.ok(/window\.history\.replaceState\(null, "", loc\.pathname \+ loc\.search\)/.test(src), '讀完片段沒有清掉');
  const incomingAt = src.indexOf('const incoming = takeIncoming()');
  assert.ok(incomingAt > 0 && incomingAt < src.indexOf('refresh().then'), '要在查暫存區之前就把片段拿走');
  assert.ok(/importBytes\(incoming, t\.importedFromQr, "badImport"\)/.test(src), '帶回來的密文沒有走匯入');
});

test('登錄另一台：鑰匙限時顯示、鎖上就收、B 端經 keyFromIdentity 與 enrollDevice', () => {
  assert.ok(/const ENROLL_MS = 60 \* 1000;/.test(src), '顯示鑰匙要限時一分鐘');
  assert.ok(/state\.enroll\.identity = await vault\(\)\.exportIdentity\(\)/.test(src), '顯示的字串要從 exportIdentity 來');
  assert.ok(/if \(left <= 0\) \{\s*closeEnroll\(\);/.test(src), '時間到要自己關掉');
  const lockAt = src.indexOf('const lock = () =>');
  assert.ok(src.slice(lockAt, lockAt + 300).includes('closeEnrollSilently();'), '鎖上時沒有把顯示中的鑰匙收掉');
  assert.ok(/window\.addEventListener\("pagehide", closeEnrollSilently\)/.test(src), '離開頁面沒有收掉');
  assert.ok(/const bytes = await vault\(\)\.keyFromIdentity\(state\.enroll\.input\);\s*await vault\(\)\.enrollDevice\(bytes\);/.test(src), 'B 端沒有經 keyFromIdentity 再 enrollDevice');
  assert.ok(/window\.qrcode\(0, "M"\)/.test(src) && /window\.jsQR\(pixels\.data, width, height\)/.test(src), 'QR 的產生與解碼要交給 vendor');
  assert.ok(!/new Image\(/.test(src) && /createImageBitmap\(file\)/.test(src), '照片用 createImageBitmap 解，不走 Image 與 object URL');
  assert.ok(!/setInterval\([^)]*save/i.test(src), '計時器不能拿來自動存');
});

test('清除這台裝置是兩段式，第二下才呼叫 vault().clear()', () => {
  assert.ok(/state\.clearing = true;/.test(src) && /button\(t\.clearConfirm, null, clearDevice\)/.test(src), '第一下只該把 clearing 打開，第二下才是 clearDevice');
  const at = src.indexOf('const clearDevice = () =>');
  assert.ok(at > 0 && src.slice(at, at + 400).includes('await vault().clear();'), 'clearDevice 沒有呼叫 vault().clear()');
  assert.ok(src.slice(at, at + 400).includes('closeEnrollSilently();'), '清除前要先把顯示中的鑰匙收掉');
});

test('原始碼沒有把勾選送出去或寫進 localStorage 的手段', () => {
  for (const bad of ['fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'localStorage', 'sessionStorage', 'document.cookie']) {
    assert.ok(!src.includes(bad), `checklist.js 出現 ${bad}`);
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
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
