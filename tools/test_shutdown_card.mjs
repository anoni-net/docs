#!/usr/bin/env node
/**
 * 斷網應變卡產生器（docs/zh-TW/js/shutdown-card.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具收的是一張關係圖：誰是你聯絡不上會出事的人、用什麼管道找他、在哪裡碰
 * 面、怎麼確認電話那頭是本人。頁面對讀者的承諾有三層，三層都是看不見的東西：
 *
 * 1. 什麼都不送出去
 * 2. 暫存在哪裡由你決定，而且隨時清得掉
 * 3. 印在紙上的那一份，密度低到被撿到也拼不出關係圖
 *
 * 第三層是 2026-08-31 的調查之後才補上的。既有的專業範本（Rory Peck Trust 的
 * Communications Plan 與 Proof of Life 是兩份獨立文件）不把「這是誰」跟「怎麼證明
 * 是這個人」放在同一份會被搜到的物件上，二戰反抗組織的分艙做法也是同一個道理。
 * 所以欄位分成 card 與 plan 兩層，而「plan 那層不會流到卡片上」就變成一個必須有
 * 測試守著的安全屬性，不是版面偏好。
 *
 * 要測的是這幾種錯：
 *
 * 1. 使用者選了「關掉分頁就消失」，資料實際寫進 localStorage 留到下次開機
 * 2. 切換過模式，舊模式那一份沒被清掉，兩邊各留一份
 * 3. 按了清除，畫面回到空白，儲存裡還有殘留
 * 4. 驗證問題或行動步驟流到隨身卡上，而使用者以為那些只留在計畫裡
 * 5. 輸出漏欄，而要用卡片的那天通常已經沒有網路可以回來重填
 *
 * 這幾種在瀏覽器裡都不會報錯，受害的是填了資料的那個人。
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
  ${grab(/^  const MESH_CHANNELS = [\s\S]*?;$/m)}
  ${grab(/^  const BROADCAST_CHANNELS = [\s\S]*?;$/m)}
  ${grab(/^  const OFFLINE_CHANNELS = [\s\S]*?;$/m)}
  ${grab(/^  const FIELDS = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const CARD_MINIMUM = .*$/m)}
  ${grab(/^  const CARD_LINE_UNITS = .*$/m)}
  ${grab(/^  const CARD_MAX_LINES = .*$/m)}
  ${grab(/^  const clean = [\s\S]*?;$/m)}
  ${grab(/^  function emptyState\(\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function filledContacts\(state\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function storagePlan\(mode\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function drop\(store\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function saveDraft\(state, stores\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function loadDraft\(stores\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function clearAll\(stores\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function hasContent\(state\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function triggerHours\(state, id\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function warnings\(state\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function cardLines\(state, t\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function serializeCard\(state, t\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function visualWidth\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function cardHeight\(state, t\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function serializePlan\(state, t\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { STORAGE_KEY, MODES, TRIGGERS, FIELDS, CARD_MAX_LINES, emptyState, filledContacts,
           storagePlan, saveDraft, loadDraft, clearAll, hasContent, triggerHours, warnings,
           cardLines, cardHeight, visualWidth, serializeCard, serializePlan,
           CARD_LINE_UNITS, CARD_MINIMUM, STRINGS };
`;
const tool = new Function(harness)();
const t = tool.STRINGS['zh-TW'];
const contactSpec = tool.FIELDS.find((f) => f.id === 'contacts');

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

// 依 FIELDS 把每一欄填成獨一無二的哨兵字串。手寫一份範例資料的話，日後加欄位
// 不會有人記得回來補，漏掉就驗不到。
const SENTINEL = (parts) => 'ZZ' + parts.join('-') + 'ZZ';
function filledState() {
  const state = tool.emptyState();
  for (const field of tool.FIELDS) {
    if (field.kind === 'repeat') {
      state[field.id] = [];
      for (let i = 0; i < field.min; i += 1) {
        const row = {};
        for (const part of [...field.parts, ...(field.planParts || [])]) {
          row[part] = SENTINEL([field.id, i, part]);
        }
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
// 每個哨兵字串屬於哪一層，決定它該出現在哪一份輸出裡
function sentinelsByLayer() {
  const card = [];
  const plan = [];
  for (const field of tool.FIELDS) {
    const bucket = field.layer === 'card' ? card : plan;
    if (field.kind === 'repeat') {
      for (let i = 0; i < field.min; i += 1) {
        for (const part of field.parts) card.push(SENTINEL([field.id, i, part]));
        for (const part of field.planParts || []) plan.push(SENTINEL([field.id, i, part]));
      }
    } else if (field.kind === 'choice') {
      bucket.push(SENTINEL([field.custom]));
    } else {
      bucket.push(SENTINEL([field.id]));
    }
  }
  return { card, plan };
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
  state.verify = '我們一起去過的那家店叫什麼';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.session.keys(), [tool.STORAGE_KEY], 'sessionStorage 裡應該有草稿');
  assert.deepEqual(stores.local.keys(), [], 'localStorage 不該被寫到');
});

test('選了在這台裝置上保留草稿，才寫進 localStorage', () => {
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'device';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.local.keys(), [tool.STORAGE_KEY]);
  assert.deepEqual(stores.session.keys(), []);
});

test('選了完全不要暫存，兩種儲存都不寫', () => {
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'off';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.session.keys(), []);
  assert.deepEqual(stores.local.keys(), []);
});

test('切換模式時舊模式那一份要被清掉', () => {
  // 兩邊各留一份是最糟的結果：使用者以為切成關掉分頁就消失，
  // 而先前那一份還躺在 localStorage 裡，畫面上完全看不出來
  const stores = fakeStores();
  const state = tool.emptyState();
  state.mode = 'device';
  tool.saveDraft(state, stores);
  state.mode = 'session';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.local.keys(), [], '切回 session 之後 localStorage 應該空了');
  state.mode = 'off';
  tool.saveDraft(state, stores);
  assert.deepEqual(stores.session.keys(), [], '切成不暫存之後 sessionStorage 應該空了');
});

test('MODES 三態都有 storagePlan，寫入目標各自不同', () => {
  assert.deepEqual(tool.MODES, ['session', 'device', 'off']);
  assert.equal(tool.storagePlan('session').write, 'session');
  assert.equal(tool.storagePlan('device').write, 'local');
  assert.equal(tool.storagePlan('off').write, null);
  assert.equal(tool.storagePlan('whatever').write, null);
});

test('讀回草稿時 localStorage 優先，讀不到才看 sessionStorage', () => {
  const stores = fakeStores();
  stores.session.setItem(tool.STORAGE_KEY, JSON.stringify({ mode: 'session', label: 'A' }));
  stores.local.setItem(tool.STORAGE_KEY, JSON.stringify({ mode: 'device', label: 'B' }));
  assert.equal(tool.loadDraft(stores).label, 'B', '使用者主動留下的那一份優先');
});

test('壞掉的草稿不會讓整頁掛掉', () => {
  const stores = fakeStores();
  stores.session.setItem(tool.STORAGE_KEY, '{ 這不是 JSON');
  assert.equal(tool.loadDraft(stores), null);
});

test('儲存被瀏覽器擋掉時不丟例外', () => {
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

test('空白的表單不會留下草稿', () => {
  // 按了清除之後畫面重建，重建的最後一步會存一次。沒有這個判斷的話，
  // 儲存裡立刻又出現一份，使用者按了清除卻沒有真的清掉
  assert.equal(tool.hasContent(tool.emptyState()), false);
  const state = tool.emptyState();
  state.contacts[0].codename = '阿明';
  assert.equal(tool.hasContent(state), true);
  const onlyMode = tool.emptyState();
  onlyMode.mode = 'device';
  assert.equal(tool.hasContent(onlyMode), false, '只切過儲存模式不算有內容');
});

test('清除只動這個工具的 key', () => {
  const stores = fakeStores();
  stores.local.setItem('anoni-lang', 'zh-TW');
  stores.session.setItem('somethingelse', '1');
  tool.saveDraft(tool.emptyState(), stores);
  tool.clearAll(stores);
  assert.deepEqual(stores.local.keys(), ['anoni-lang']);
  assert.deepEqual(stores.session.keys(), ['somethingelse']);
});

// --- 第四組：分艙。計畫那一層不會流到卡片上 ---

test('每一個卡片層的欄位都出現在隨身卡上', () => {
  const out = tool.serializeCard(filledState(), t);
  for (const mark of sentinelsByLayer().card) {
    assert.ok(out.includes(mark), `隨身卡漏掉 ${mark}`);
  }
});

test('計畫層的欄位一個都不會出現在隨身卡上', () => {
  // 這是分艙本身。驗證問題跟聯絡人一起印在紙上的話，撿到卡片的人同時拿到了
  // 名單與通關方式，而那正是既有範本把兩者拆成兩份文件的理由
  const out = tool.serializeCard(filledState(), t);
  for (const mark of sentinelsByLayer().plan) {
    assert.ok(!out.includes(mark), `隨身卡上出現了只該留在計畫裡的 ${mark}`);
  }
});

test('完整計畫裡兩層都在', () => {
  const out = tool.serializePlan(filledState(), t);
  const marks = sentinelsByLayer();
  for (const mark of [...marks.card, ...marks.plan]) {
    assert.ok(out.includes(mark), `完整計畫漏掉 ${mark}`);
  }
});

test('驗證問題與行動步驟屬於計畫層', () => {
  // 這兩項如果被搬回卡片層，上面那條分艙測試就會失去意義，所以在這裡釘住
  for (const id of ['verify', 'steps']) {
    const field = tool.FIELDS.find((f) => f.id === id);
    assert.ok(field, `找不到欄位 ${id}`);
    assert.equal(field.layer, 'plan', `${id} 應該留在計畫層`);
  }
  for (const id of ['label', 'contacts', 'meet', 'triggerPrepare', 'triggerActivate']) {
    assert.equal(tool.FIELDS.find((f) => f.id === id).layer, 'card');
  }
});

test('聯絡人在卡片上只有代號，真名沒有欄位可以填', () => {
  assert.deepEqual(contactSpec.parts, ['codename', 'primary', 'backup']);
  assert.deepEqual(contactSpec.planParts, ['who']);
  assert.equal(contactSpec.min, 3);
  assert.equal(contactSpec.max, 5);
});

test('卡片層的首見欄位數壓在使用者一眼掃得完的量', () => {
  // 2026-09-01 的欄位審計把這一層從三十五個空格收到十來個。這條測試是那次審計的
  // 守門員：日後每加一個欄位都要先過這裡，不會不知不覺又長回一整面牆
  const card = tool.FIELDS.filter((f) => f.layer === 'card');
  const inputs = card.reduce((n, f) =>
    n + (f.kind === 'repeat' ? f.min * f.parts.length : 1), 0);
  assert.ok(inputs <= 14, `卡片層一打開就看得到 ${inputs} 個欄位`);
  assert.deepEqual(tool.CARD_MINIMUM, ['contacts', 'meet'],
    '最小可用的一張卡是三位聯絡人加一個會合點');
});

test('空白的區塊不會留下只有標題的空段落', () => {
  const state = tool.emptyState();
  state.label = '共同約定';
  const card = tool.serializeCard(state, t);
  assert.ok(card.includes('共同約定'));
  for (const key of Object.keys(t.blocks)) {
    assert.ok(!card.includes(t.blocks[key]),
      `沒填內容的「${t.blocks[key]}」區塊還是被印出來了`);
  }
  assert.ok(!/\n\n\n/.test(tool.serializePlan(state, t)), '輸出裡有連續空行');
});

test('輸出裡沒有網址與工具出處', () => {
  // 卡片會被印出來放進皮夾。上面多一行來源網址，等於替撿到的人指出這是什麼
  for (const out of [tool.serializeCard(filledState(), t), tool.serializePlan(filledState(), t)]) {
    assert.ok(!/https?:\/\//.test(out), '輸出裡出現網址');
    assert.ok(!/anoni/i.test(out), '輸出裡出現站名');
  }
});

test('選了預設的啟動條件時輸出的是那個選項的文字', () => {
  const state = tool.emptyState();
  const preset = tool.TRIGGERS.find((x) => x.id !== 'custom');
  state.triggerActivate = preset.id;
  assert.ok(tool.serializeCard(state, t).includes(t.triggers[preset.id]));
});

// --- 第五組：提醒 ---

test('備援管道跟主要管道填一樣會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { codename: 'A', primary: 'Signal', backup: 'signal ', who: '' };
  const hit = tool.warnings(state).find((w) => w.id === 'backup-same');
  assert.ok(hit, '主要與備援相同應該要提醒');
  assert.equal(hit.index, 0, '要指出是第幾筆');
});

test('主要與備援都是網路服務時會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { codename: 'A', primary: 'Signal', backup: 'Telegram', who: '' };
  assert.ok(tool.warnings(state).some((w) => w.id === 'backup-online'));
});

test('備援填 mesh 類的工具會被指出來', () => {
  // 藍牙 mesh 單跳約一百公尺，靠人群密度接力，聯絡分散在各處的人不適用。
  // 這幾個名字以前落在「不經網路」那一類，等於工具在替使用者背書
  for (const backup of ['Bridgefy', 'Briar', 'Meshtastic', '用藍牙傳']) {
    const state = tool.emptyState();
    state.contacts[0] = { codename: 'A', primary: 'Signal', backup, who: '' };
    assert.ok(tool.warnings(state).some((w) => w.id === 'backup-mesh'),
      `備援填「${backup}」應該要提醒`);
  }
});

test('備援填廣播類會被指出來', () => {
  // 收得到廣播跟聯絡得到那個人是兩件事
  for (const backup of ['短波收音機', '聽廣播']) {
    const state = tool.emptyState();
    state.contacts[0] = { codename: 'A', primary: 'Signal', backup, who: '' };
    assert.ok(tool.warnings(state).some((w) => w.id === 'backup-broadcast'),
      `備援填「${backup}」應該要提醒`);
  }
});

test('備援寫了不經過網路的方式就不再提醒', () => {
  for (const backup of ['到住處樓下按門鈴', '市話 02-1234-5678', '衛星電話']) {
    const state = tool.emptyState();
    state.contacts[0] = { codename: 'A', primary: 'Signal', backup, who: '' };
    const ids = tool.warnings(state).map((w) => w.id);
    for (const bad of ['backup-online', 'backup-mesh', 'backup-broadcast', 'backup-same']) {
      assert.ok(!ids.includes(bad), `備援填「${backup}」不該報 ${bad}`);
    }
  }
});

test('兩段式時間的順序反了會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { codename: 'A', primary: 'Signal', backup: '面交', who: '' };
  state.triggerPrepare = 'd1';
  state.triggerActivate = 'h6';
  assert.ok(tool.warnings(state).some((w) => w.id === 'trigger-order'),
    '準備的時間比啟動晚就沒有作用了');
  state.triggerPrepare = 'h6';
  state.triggerActivate = 'd1';
  assert.ok(!tool.warnings(state).some((w) => w.id === 'trigger-order'));
});

test('自訂的時間也看得懂，看不懂就不猜', () => {
  const state = tool.emptyState();
  state.triggerPrepare = 'custom';
  state.triggerPrepareCustom = '8 小時';
  assert.equal(tool.triggerHours(state, 'triggerPrepare'), 8);
  state.triggerPrepareCustom = '兩個工作天';
  assert.equal(tool.triggerHours(state, 'triggerPrepare'), null, '看不懂就回 null，不要亂猜');
  state.triggerPrepareCustom = '3 days';
  assert.equal(tool.triggerHours(state, 'triggerPrepare'), 72);
});

test('會合點、兩段時間與行動步驟沒填都會被指出來', () => {
  const state = tool.emptyState();
  state.contacts[0] = { codename: 'A', primary: 'Signal', backup: '面交', who: '' };
  const ids = tool.warnings(state).map((w) => w.id);
  assert.ok(ids.includes('no-meet'));
  assert.ok(ids.includes('no-trigger'));
  assert.ok(ids.includes('no-steps'));
});

test('驗證問題填了就提醒再確認沒有把答案寫進去', () => {
  const state = tool.emptyState();
  assert.ok(!tool.warnings(state).some((w) => w.id === 'verify-filled'));
  state.verify = '上次一起去的那家店叫什麼';
  assert.ok(tool.warnings(state).some((w) => w.id === 'verify-filled'));
});

test('卡片內容超過一張卡放得下的量會被指出來', () => {
  // 印出來才發現最後幾行被裁掉，而那時通常已經是需要卡片的時候
  const state = tool.emptyState();
  state.label = '編輯部共同約定 2026-10-04';
  state.meet = '某某公園東側入口，每日 18:00 到 19:00';
  state.triggerPrepare = 'h6';
  state.triggerActivate = 'd1';
  state.contacts = [];
  for (let i = 0; i < 5; i += 1) {
    state.contacts.push({
      codename: '代號' + i,
      primary: '平常用的通訊軟體',
      // 備援寫成兩三句話是真實會發生的填法，五位都這樣寫就會超出一張卡
      backup: '到住處樓下按門鈴，門牌是三樓之二，晚上七點以後通常在家。'
        + '不在的話問一樓的鄰居，他知道我大概什麼時候回來，也可以留話給他。'
        + '真的找不到人就留紙條在信箱，我每天回家都會看一次。',
      who: '',
    });
  }
  assert.ok(tool.cardHeight(state, t) > tool.CARD_MAX_LINES,
    `這份內容應該要超過一張卡的容量，估出來是 ${tool.cardHeight(state, t)} 行`);
  assert.ok(tool.warnings(state).some((w) => w.id === 'card-too-long'));

  state.contacts = state.contacts.slice(0, 3);
  assert.ok(!tool.warnings(state).some((w) => w.id === 'card-too-long'),
    '三位聯絡人應該放得下');
});

test('每一種提醒在三個語系都有文案', () => {
  const ids = ['too-few-contacts', 'backup-same', 'backup-online', 'backup-mesh',
    'backup-broadcast', 'no-meet', 'no-trigger', 'trigger-order', 'no-steps',
    'verify-filled', 'card-too-long'];
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

test('每個欄位、選項與分層都有三語系的文案', () => {
  for (const lang of Object.keys(tool.STRINGS)) {
    const s = tool.STRINGS[lang];
    for (const field of tool.FIELDS) {
      assert.ok(s.fields[field.id], `${lang} 少了欄位 ${field.id} 的標籤`);
      assert.ok(s.hints[field.id], `${lang} 少了欄位 ${field.id} 的說明`);
      for (const part of [...(field.parts || []), ...(field.planParts || [])]) {
        assert.ok(s.parts[part], `${lang} 少了 ${part} 的標籤`);
      }
    }
    for (const trigger of tool.TRIGGERS) {
      assert.ok(s.triggers[trigger.id], `${lang} 少了 ${trigger.id} 的文案`);
    }
    for (const mode of tool.MODES) {
      assert.ok(s.modes[mode] && s.modeNotes[mode] && s.status[mode], `${lang} 少了 ${mode} 的說明`);
    }
    for (const key of ['card', 'plan']) {
      assert.ok(s.layers[key].title && s.layers[key].note, `${lang} 少了 ${key} 層的說明`);
    }
    assert.ok(s.threatTitle && s.threatBody, `${lang} 少了威脅模型的說明`);
    assert.ok(s.planInvite && s.planInviteNote, `${lang} 少了計畫層的邀請文案`);
    assert.ok(s.avoidNote, `${lang} 少了不要在卡上管道談的提醒`);
  }
});

test('狀態列說得出 sessionStorage 會被瀏覽器還原', () => {
  // MDN 寫的是 sessionStorage「survives over page reloads and restores」。
  // 畫面上只寫「關掉分頁就消失」的話，對開著還原分頁的使用者就是一個做不到的承諾
  for (const lang of Object.keys(tool.STRINGS)) {
    const text = tool.STRINGS[lang].status.session;
    assert.ok(/還原|还原|restore/i.test(text), `${lang} 的狀態列沒有提到還原這個例外`);
  }
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
