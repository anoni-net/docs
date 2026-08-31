#!/usr/bin/env node
/**
 * 斷網應變卡產生器（docs/zh-TW/js/shutdown-card.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具收的是一張關係圖：誰是你聯絡不上會出事的人、用什麼管道找他、在哪裡碰
 * 面、怎麼確認電話那頭是本人。頁面對讀者的承諾有兩層，一層是「什麼都不送出去」，
 * 另一層是「暫存在哪裡由你決定，而且隨時清得掉」。兩層都是看不見的東西，畫面上
 * 正常運作跟實際上把資料留在裝置裡，讀者分不出來。
 *
 * 所以要測的不是表單畫得對不對，是這四種錯：
 *
 * 1. 使用者選了「關掉分頁就消失」，資料實際寫進 localStorage 留到下次開機
 * 2. 使用者切換過模式，舊模式那一份沒被清掉，兩邊各留一份
 * 3. 按了清除，畫面回到空白，儲存裡還有殘留
 * 4. 輸出漏掉一欄，而使用者要用這張卡的時候通常已經沒有網路可以回來重填
 *
 * 這四種在瀏覽器裡都不會報錯，受害的是填了資料的那個人。
 *
 * === 怎麼驗 ===
 *
 * 跟這個 repo 其他幾支一樣，把純邏輯從原始碼原地抽出來跑，不重寫一份。儲存那幾個
 * 函式收 stores 參數而不是直接抓全域的 sessionStorage，就是為了在這裡餵替身進去，
 * 看它到底寫到哪一個。DOM 的部分不在這裡測，那要有瀏覽器，由實機驗證負責。
 *
 * 用法：
 *   node tools/test_shutdown_card.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const SRC = path.join(DOCS, 'zh-TW', 'js', 'shutdown-card.js');
const src = fs.readFileSync(SRC, 'utf8');

// 掃描用的版本：剝掉註解。檔頭要說明「這裡不會出現哪些東西」，把那些名字寫出來
// 才講得清楚，而註解裡的字不該讓自我檢查失效。做法跟 test_leaks.mjs 一致。
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`shutdown-card.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  const STORAGE_KEY = [\s\S]*?;$/m)}
  ${grab(/^  const MODES = \[[\s\S]*?\];$/m)}
  ${grab(/^  const TRIGGERS = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const ONLINE_CHANNELS = [\s\S]*?;$/m)}
  ${grab(/^  const OFFLINE_CHANNELS = [\s\S]*?;$/m)}
  ${grab(/^  const FIELDS = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const clean = [\s\S]*?;$/m)}
  ${grab(/^  function drop\(store\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function emptyState\(\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function filledContacts\(state\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function storagePlan\(mode\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function saveDraft\(state, stores\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function loadDraft\(stores\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function clearAll\(stores\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function warnings\(state\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function serialize\(state, t\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { STORAGE_KEY, MODES, TRIGGERS, FIELDS, emptyState, filledContacts,
           storagePlan, saveDraft, loadDraft, clearAll, warnings, serialize, STRINGS };
`;
const tool = new Function(harness)();
const t = tool.STRINGS['zh-TW'];

// 儲存替身。真的 Storage 介面只用到這四個，換掉之後就看得到誰被寫進去。
const fakeStore = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    keys: () => [...data.keys()],
  };
};
const fakeStores = () => ({ session: fakeStore(), local: fakeStore() });

// 依 FIELDS 把每一欄填成獨一無二的哨兵字串，用來驗輸出有沒有漏欄。
// 手寫一份範例資料的話，日後加欄位不會有人記得回來補，漏掉就驗不到。
const SENTINEL = (parts) => 'ZZ' + parts.join('-') + 'ZZ';
function filledState() {
  const state = tool.emptyState();
  for (const field of tool.FIELDS) {
    if (field.kind === 'repeat') {
      state[field.id] = [];
      for (let i = 0; i < field.min; i += 1) {
        const row = {};
        for (const part of field.parts) row[part] = SENTINEL([field.id, i, part]);
        state[field.id].push(row);
      }
    } else if (field.kind === 'choice') {
      state[field.id] = 'custom';
      state[field.custom] = SENTINEL([field.custom]);
    } else {
      state[field.id] = SENTINEL([field.id]);
    }
  }
  return state;
}
// 這份哨兵資料裡的每一個字串，都必須出現在輸出裡
function sentinels() {
  const out = [];
  for (const field of tool.FIELDS) {
    if (field.kind === 'repeat') {
      for (let i = 0; i < field.min; i += 1) {
        for (const part of field.parts) out.push(SENTINEL([field.id, i, part]));
      }
    } else if (field.kind === 'choice') {
      out.push(SENTINEL([field.custom]));
    } else {
      out.push(SENTINEL([field.id]));
    }
  }
  return out;
}

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// --- 第一組：儲存模式真的生效 ---

test('預設模式是關掉分頁就消失，草稿只進 sessionStorage', () => {
  const stores = fakeStores();
  const state = tool.emptyState();
  assert.equal(state.mode, 'session', '預設模式應該是 session');
  state.verify = '共同認識的人的名字';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.session.keys(), [tool.STORAGE_KEY], 'sessionStorage 裡應該有草稿');
  assert.deepEqual(stores.local.keys(), [], 'localStorage 不該被寫到');
});

test('選了在這台裝置上保留草稿，才寫進 localStorage', () => {
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'device';
  state.verify = '共同認識的人的名字';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.local.keys(), [tool.STORAGE_KEY], 'localStorage 裡應該有草稿');
  assert.deepEqual(stores.session.keys(), [], 'sessionStorage 不該被寫到');
});

test('選了完全不要暫存，兩種儲存都不寫', () => {
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'off';
  state.verify = '共同認識的人的名字';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.session.keys(), [], 'sessionStorage 不該有東西');
  assert.deepEqual(stores.local.keys(), [], 'localStorage 不該有東西');
});

test('切換模式時舊模式那一份要被清掉', () => {
  // 兩邊各留一份是最糟的結果：使用者以為切成關掉分頁就消失，
  // 而先前那一份還躺在 localStorage 裡，畫面上完全看不出來
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'device';
  state.verify = '共同認識的人的名字';
  tool.saveDraft(state, stores);
  state.mode = 'session';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.local.keys(), [], '切回 session 之後 localStorage 應該空了');
  assert.deepEqual(stores.session.keys(), [tool.STORAGE_KEY]);

  state.mode = 'off';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.session.keys(), [], '切成不暫存之後 sessionStorage 應該空了');
  assert.deepEqual(stores.local.keys(), []);
});

test('MODES 三態都有 storagePlan，寫入目標各自不同', () => {
  assert.deepEqual(tool.MODES, ['session', 'device', 'off']);
  assert.equal(tool.storagePlan('session').write, 'session');
  assert.equal(tool.storagePlan('device').write, 'local');
  assert.equal(tool.storagePlan('off').write, null);
  // 認不得的模式一律當成不寫，壞掉的草稿不該讓資料落到別的地方
  assert.equal(tool.storagePlan('whatever').write, null);
});

test('讀回草稿時 localStorage 優先，讀不到才看 sessionStorage', () => {
  const stores = fakeStores();
  stores.session.setItem(tool.STORAGE_KEY, JSON.stringify({ mode: 'session', verify: 'A' }));
  stores.local.setItem(tool.STORAGE_KEY, JSON.stringify({ mode: 'device', verify: 'B' }));
  assert.equal(tool.loadDraft(stores).verify, 'B', '使用者主動留下的那一份優先');
  tool.clearAll(stores);
  stores.session.setItem(tool.STORAGE_KEY, JSON.stringify({ mode: 'session', verify: 'A' }));
  assert.equal(tool.loadDraft(stores).verify, 'A');
});

test('壞掉的草稿不會讓整頁掛掉', () => {
  const stores = fakeStores();
  stores.session.setItem(tool.STORAGE_KEY, '{ 這不是 JSON');
  assert.equal(tool.loadDraft(stores), null);
});

test('儲存被瀏覽器擋掉時不丟例外', () => {
  // Safari 私密瀏覽與部分企業設定會讓 setItem 直接丟 QuotaExceededError。
  // 這一頁的使用者本來就偏向把瀏覽器鎖緊，丟例外會讓整個表單停止回應
  const boom = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  const stores = { session: boom, local: boom };
  assert.equal(tool.saveDraft(tool.emptyState(), stores), false);
  assert.equal(tool.loadDraft(stores), null);
  assert.doesNotThrow(() => tool.clearAll(stores));
});

// --- 第二組：靜態掃描，沒有任何外送手段 ---

test('原始碼裡沒有任何把資料送出去的手段', () => {
  // 卡片上是一張關係圖。這一頁只要送出任何一個欄位，傷害就不是「洩漏偏好」等級的
  const forbidden = [
    ['fetch(', '送 HTTP 請求'],
    ['XMLHttpRequest', '送 HTTP 請求'],
    ['sendBeacon', '背景回報'],
    ['WebSocket', '長連線'],
    ['EventSource', '長連線'],
    ['navigator.clipboard.readText', '讀剪貼簿'],
    ['.src =', '用資源載入把資料帶出去'],
    ['new Image', '用資源載入把資料帶出去'],
    ['document.cookie', '寫 cookie'],
    ['indexedDB', '這一頁的儲存只用兩種 Storage'],
    ['<form', '表單送出'],
    ['action=', '表單送出'],
  ];
  for (const [needle, why] of forbidden) {
    assert.ok(!code.includes(needle), `原始碼出現 ${needle}（${why}）`);
  }
});

test('儲存只出現在儲存那幾個函式裡', () => {
  // 別處直接寫 localStorage 的話，模式開關就管不到它，而使用者以為管得到
  const lines = code.split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    if (/\b(localStorage|sessionStorage)\b/.test(line)) hits.push([i + 1, line.trim()]);
  });
  assert.ok(hits.length > 0, '完全沒有儲存，那模式開關在管什麼');
  for (const [line, textOfLine] of hits) {
    assert.ok(/^\s*(const stores|return \{ session|session:|local:)/.test(textOfLine)
      || /browserStores/.test(textOfLine),
      `第 ${line} 行在 browserStores 之外直接碰儲存：${textOfLine}`);
  }
});

// --- 第三組：清除真的清乾淨 ---

test('清除之後兩種儲存都沒有殘留', () => {
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'device';
  tool.saveDraft(state, stores);
  state.mode = 'session';
  tool.saveDraft(state, stores);
  tool.clearAll(stores);
  assert.deepEqual(stores.session.keys(), []);
  assert.deepEqual(stores.local.keys(), []);
  assert.equal(tool.loadDraft(stores), null);
});

test('清除只動這個工具的 key', () => {
  // 同一個網域底下還有離線內容管理頁與語言偏好，清這一頁不該掃到別人的東西
  const stores = fakeStores();
  stores.local.setItem('anoni-lang', 'zh-TW');
  stores.session.setItem('somethingelse', '1');
  tool.saveDraft(tool.emptyState(), stores);
  tool.clearAll(stores);
  assert.deepEqual(stores.local.keys(), ['anoni-lang']);
  assert.deepEqual(stores.session.keys(), ['somethingelse']);
});

// --- 第四組：輸出不靜默漏欄 ---

test('每一個填過的欄位都出現在純文字輸出裡', () => {
  const out = tool.serialize(filledState(), t);
  for (const mark of sentinels()) {
    assert.ok(out.includes(mark), `輸出漏掉 ${mark}`);
  }
});

test('空白的區塊不會留下只有標題的空段落', () => {
  const state = tool.emptyState();
  state.label = '共同約定';
  const out = tool.serialize(state, t);
  assert.ok(out.includes('共同約定'));
  for (const key of Object.keys(t.blocks)) {
    assert.ok(!out.includes(t.blocks[key]),
      `沒填內容的「${t.blocks[key]}」區塊還是被印出來了`);
  }
  assert.ok(!/\n\n\n/.test(out), '輸出裡有連續空行');
});

test('聯絡人只填了一部分時，另外幾筆不佔位置', () => {
  const state = tool.emptyState();
  state.contacts[0].name = '阿明';
  state.contacts[0].primary = 'Signal';
  const out = tool.serialize(state, t);
  assert.ok(out.includes('阿明'));
  assert.equal(out.split('\n').filter((line) => /^\s*\d+\./.test(line)).length, 1,
    '空白的聯絡人列不該出現在輸出裡');
});

test('選了預設的啟動條件時輸出的是那個選項的文字', () => {
  const state = tool.emptyState();
  const preset = tool.TRIGGERS.find((x) => x.id !== 'custom');
  state.trigger = preset.id;
  const out = tool.serialize(state, t);
  assert.ok(out.includes(t.triggers[preset.id]), '預設選項的文案沒有出現在輸出裡');
});

test('輸出裡沒有網址與工具出處', () => {
  // 卡片會被印出來放進皮夾。上面多一行來源網址，等於替撿到的人指出這是什麼
  const out = tool.serialize(filledState(), t);
  assert.ok(!/https?:\/\//.test(out), '輸出裡出現網址');
  assert.ok(!/anoni/i.test(out), '輸出裡出現站名');
});

// --- 第五組：提醒 ---

test('確認本人那一欄填了就會出現敏感提示', () => {
  const state = tool.emptyState();
  assert.ok(!tool.warnings(state).some((w) => w.id === 'verify-filled'));
  state.verify = '我們一起去過的那家店';
  assert.ok(tool.warnings(state).some((w) => w.id === 'verify-filled'),
    '這一欄外洩就等於驗證失效，提示一定要出現');
});

test('備援管道跟主要管道填一樣會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { name: '阿明', primary: 'Signal', backup: 'signal ' };
  const warns = tool.warnings(state);
  const hit = warns.find((w) => w.id === 'backup-same');
  assert.ok(hit, '主要與備援相同應該要提醒');
  assert.equal(hit.index, 0, '要指出是第幾筆');
});

test('主要與備援都是網路服務時會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { name: '阿明', primary: 'Signal', backup: 'Telegram' };
  assert.ok(tool.warnings(state).some((w) => w.id === 'backup-online'),
    '兩個管道在斷網時會一起失效，這正是這張卡要避免的');
});

test('備援寫了不經過網路的方式就不再提醒', () => {
  const state = tool.emptyState();
  state.contacts[0] = { name: '阿明', primary: 'Signal', backup: '到住處樓下按門鈴' };
  const warns = tool.warnings(state).map((w) => w.id);
  assert.ok(!warns.includes('backup-online'));
  assert.ok(!warns.includes('backup-same'));
});

test('會合點與啟動條件沒填會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { name: '阿明', primary: 'Signal', backup: '面交' };
  const warns = tool.warnings(state).map((w) => w.id);
  assert.ok(warns.includes('no-meet'));
  assert.ok(warns.includes('no-trigger'));
});

test('每一種提醒在三個語系都有文案', () => {
  const state = filledState();
  state.contacts[0].backup = state.contacts[0].primary;
  const ids = new Set([...tool.warnings(state).map((w) => w.id), 'no-meet', 'no-trigger',
    'backup-online', 'too-few-contacts']);
  for (const lang of Object.keys(tool.STRINGS)) {
    for (const id of ids) {
      assert.ok(tool.STRINGS[lang].warns[id], `${lang} 少了 ${id} 的文案`);
    }
  }
});

// --- 三語系文案 ---

test('三個語系的文案 key 完全一致', () => {
  const langs = Object.keys(tool.STRINGS);
  assert.deepEqual(langs.sort(), ['en', 'zh', 'zh-TW'], `語系是 ${langs}`);
  const shape = (obj, prefix = '') => {
    const out = [];
    for (const key of Object.keys(obj).sort()) {
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        out.push(...shape(value, prefix + key + '.'));
      } else {
        out.push(prefix + key);
      }
    }
    return out;
  };
  const base = shape(tool.STRINGS['zh-TW']);
  for (const lang of ['zh', 'en']) {
    assert.deepEqual(shape(tool.STRINGS[lang]), base, `${lang} 的 key 跟 zh-TW 對不上`);
  }
});

test('每個欄位與選項都有三語系的標籤', () => {
  for (const lang of Object.keys(tool.STRINGS)) {
    const s = tool.STRINGS[lang];
    for (const field of tool.FIELDS) {
      assert.ok(s.fields[field.id], `${lang} 少了欄位 ${field.id} 的標籤`);
      for (const part of field.parts || []) {
        assert.ok(s.parts[part], `${lang} 少了 ${part} 的標籤`);
      }
    }
    for (const trigger of tool.TRIGGERS) {
      assert.ok(s.triggers[trigger.id], `${lang} 少了 ${trigger.id} 的文案`);
    }
    for (const mode of tool.MODES) {
      assert.ok(s.modes[mode], `${lang} 少了 ${mode} 模式的說明`);
    }
  }
});

test('聯絡人的筆數限制跟 shutdown.md 寫的一致', () => {
  const contacts = tool.FIELDS.find((f) => f.id === 'contacts');
  assert.equal(contacts.min, 3, '情境頁寫的是三到五個');
  assert.equal(contacts.max, 5);
});

// await 是必要的，理由見 test_utils_index_order.mjs 檔尾那段註解
for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 5).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
