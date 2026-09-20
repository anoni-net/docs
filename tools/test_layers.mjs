#!/usr/bin/env node
/**
 * 地球儀圖層清單與其他四個地方對得上。
 *
 * === 為什麼需要這支 ===
 *
 * 一份新資料要進地球儀，得同時動四個地方：play/layers.js 加一筆宣告、atlas.js 補
 * 建幾何與填面板的掛鉤、i18n.js 三份表各補小標與來源說明、index.html 補面板節點。
 * 漏掉其中一處的症狀都很安靜：
 *
 *   i18n 少一條      那一區的小標在英文版與簡中版維持繁體，其餘部分都對
 *   index.html 少節點  side panel 少一塊，畫面其他地方完全正常
 *   檔案沒跟著發布    線上抓 404，那一層自己收掉，看起來像「本來就沒有這個功能」
 *
 * 三種都不會讓建置變紅，發現的人是讀者。這支把清單當基準，掃另外三邊。
 *
 * 用法：
 *   node tools/test_layers.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYERS, RO } from '../docs/zh-TW/games/tor-network/play/layers.js';
import { STR } from '../docs/zh-TW/games/tor-network/play/i18n.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLAY = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play');
const SW = path.join(HERE, '..', 'docs', 'zh-TW', 'sw.js');
const LANGS = ['zh-TW', 'zh-cn', 'en'];

const html = fs.readFileSync(path.join(PLAY, 'index.html'), 'utf8');
const atlas = fs.readFileSync(path.join(PLAY, 'atlas.js'), 'utf8');
const sw = fs.readFileSync(SW, 'utf8');

const fail = [];
const warn = [];
const hasNode = (id) => new RegExp(`id="${id}"`).test(html);

for (const l of LAYERS) {
  const at = `${l.id}`;

  // 來源檔案。跟文件站一起發布的那幾份一定要在，走 assets 的那幾份本機留一份當
  // 退路，seacable 是唯一沒有本機副本的，取不到就整區收掉，那是設計好的行為。
  const file = path.join(PLAY, l.file);
  if (!fs.existsSync(file)) {
    if (l.from === 'docs') fail.push(`${at}：來源檔案 ${l.file} 不在 play/`);
    else warn.push(`${at}：${l.file} 沒有本機副本，抓不到 assets 時這一層會缺席`);
  }

  // 三語字串
  for (const key of [l.label, l.credit].filter(Boolean)) {
    const miss = LANGS.filter((lang) => !STR[lang] || STR[lang][key] === undefined);
    if (miss.length) fail.push(`${at}：i18n 的 ${key} 缺 ${miss.join('、')}`);
  }

  // 面板節點。小標節點照慣例是面板節點換掉前綴，applyI18n 直接這樣推，
  // 命名破例的話那一區換語系就不會動，而畫面看起來正常。
  if (l.panel) {
    if (!hasNode(l.panel)) fail.push(`${at}：index.html 沒有面板節點 ${l.panel}`);
    if (!l.panel.startsWith('stat-')) fail.push(`${at}：面板節點 ${l.panel} 沒有照 stat- 開頭的慣例`);
    const lbl = l.panel.replace(/^stat-/, 'lbl-');
    if (l.label && !hasNode(lbl)) fail.push(`${at}：index.html 沒有小標節點 ${lbl}`);
  }
  if (l.label && !l.panel) fail.push(`${at}：宣告了 label 卻沒有 panel，小標會綁不到節點`);
  if (l.creditEl && !hasNode(l.creditEl)) fail.push(`${at}：index.html 沒有來源節點 ${l.creditEl}`);
  if (l.credit && !l.creditEl) fail.push(`${at}：宣告了 credit 卻沒有 creditEl`);

  // 離地高度只能有一個定義點。atlas.js 裡再出現同一個數字就是有人寫死了第二份，
  // 兩邊日後各走各的，點畫在一個高度、按得到的位置在另一個高度。
  if (l.lift) {
    const literal = new RegExp(`R \\* ${String(l.lift).replace('.', '\\.')}\\b`);
    if (literal.test(atlas)) fail.push(`${at}：atlas.js 裡還有寫死的 R * ${l.lift}，改成用清單的常數`);
  }
}

// ── 兩個決策釘在這裡 ──────────────────────────────────────────
//
// 清單是其他檢查的基準，所以清單自己寫錯的話那些檢查跟著錯，全部一起變綠。
// 這兩件事的代價夠高而且症狀安靜，值得在測試裡再寫一次當對照。
//
//   fresh     漏掉的話讀者看到的是十二小時前的數字，畫面完全正常
//   required  多標的話某一份外部資料掛掉就整顆地球打不開，少標的話少了國界
//             還硬畫下去，地球變成一片空白的球
//
// 這兩組要跟著清單一起改，改的時候正好被迫想一次為什麼。
const FRESH = ['relays', 'torusers'];          // assets 上天天重生，CDN 快取 12 小時
const REQUIRED = ['countries', 'relays'];      // 沒有它們畫不出東西

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const nowFresh = LAYERS.filter((l) => l.fresh).map((l) => l.id).sort();
const nowReq = LAYERS.filter((l) => l.required).map((l) => l.id).sort();
if (!eq(nowFresh, [...FRESH].sort())) {
  fail.push(`要驗新鮮度的層變成 ${nowFresh.join('、') || '（無）'}，測試裡記的是 ${FRESH.join('、')}`);
}
if (!eq(nowReq, [...REQUIRED].sort())) {
  fail.push(`必要的層變成 ${nowReq.join('、') || '（無）'}，測試裡記的是 ${REQUIRED.join('、')}`);
}
for (const l of LAYERS) {
  if (l.fresh && l.from !== 'assets') fail.push(`${l.id}：本機檔案不必驗新鮮度`);
}

// id 不重複，載入結果用 id 當 key，撞到會靜默蓋掉前一層
const ids = LAYERS.map((l) => l.id);
for (const id of new Set(ids)) {
  if (ids.filter((x) => x === id).length > 1) fail.push(`清單裡有兩筆 ${id}`);
}

// 疊放順序互異。相同的話那幾層退回比較物件 id，也就是誰先建出來誰先畫
const ro = Object.values(RO);
if (new Set(ro).size !== ro.length) fail.push(`RO 裡有重複的 renderOrder：${ro.join('、')}`);

// 清單這支模組自己也要進預快取。atlas.js 無條件 import 它，漏了的話離線開啟
// 整個作品停在載入中，而線上完全正常。
if (!sw.includes('games/tor-network/play/layers.js')) {
  fail.push('sw.js 的預快取清單沒有 layers.js，離線時整個作品打不開');
}

// 預快取。沒收進去的層在離線時抓不到，這裡只提醒，因為有幾份是刻意不收的
// （bathymetry 一份就 436 KB，離線讀者不需要為了海底地形付這個代價）。
for (const l of LAYERS) {
  if (l.from !== 'docs') continue;
  if (!sw.includes(`games/tor-network/play/${l.file}`)) {
    warn.push(`${l.id}：${l.file} 不在 sw.js 的預快取清單，離線時這一層會缺席`);
  }
}

// ── 載入路徑原地重放 ──────────────────────────────────────────
//
// 把 atlas.js 的 fetchLayer 與 loadLayers 抽出來注入假的取檔函式，看它實際發出
// 哪幾個請求。改寫之前這裡是一段寫死的 15 路 Promise.all，每一路的網址前綴與
// 快取策略都是手寫的，改成走清單之後要確認發出去的東西一模一樣。
//
// 驗的是真的那兩支函式，不是複製一份。有人改了取檔邏輯這裡就會知道。
{
  const grab = (re) => {
    const m = atlas.match(re);
    if (!m) { fail.push(`atlas.js 裡找不到 ${re}`); return 'return null;'; }
    return m[0];
  };
  const src = `
    ${grab(/^function fetchLayer\([\s\S]*?^}/m)}
    ${grab(/^async function loadLayers\([\s\S]*?^}/m)}
    return loadLayers;
  `;
  const calls = [];
  const rec = (kind) => (name, opt) => {
    calls.push({ kind, name, opt: opt ? JSON.stringify(opt) : null });
    return Promise.resolve({ ok: name });
  };
  const load = new Function('LAYERS', 'getJSON', 'getJSONAsset', src)(
    LAYERS, rec('docs'), rec('assets'));

  const got = await load();

  // 每一層都發了一次，一次而已
  if (calls.length !== LAYERS.length) {
    fail.push(`發出 ${calls.length} 個請求，清單上有 ${LAYERS.length} 層`);
  }
  for (const l of LAYERS) {
    const c = calls.find((x) => x.name === l.file || x.name === './' + l.file);
    if (!c) { fail.push(`${l.id}：沒有發出 ${l.file} 的請求`); continue; }
    // 走 assets 的傳檔名，走文件站的傳 ./ 開頭的相對路徑，兩者的呼叫端不同
    const wantName = l.from === 'assets' ? l.file : './' + l.file;
    if (c.name !== wantName) fail.push(`${l.id}：請求的是 ${c.name}，應該是 ${wantName}`);
    if (c.kind !== l.from) fail.push(`${l.id}：走的是 ${c.kind} 那條路，宣告的是 ${l.from}`);
    // 天天在變的那幾份要每次都向 server 驗新鮮度，其餘不必多付一個往返
    const wantOpt = l.fresh ? '{"cache":"no-cache"}' : null;
    if (c.opt !== wantOpt) fail.push(`${l.id}：快取策略是 ${c.opt}，應該是 ${wantOpt}`);
    if (!got[l.id]) fail.push(`${l.id}：載入結果裡沒有這個 id`);
  }

  // 失敗的分流。required 的往外丟，其餘收斂成 null
  const boom = () => Promise.reject(new Error('抓不到'));
  const only = (id) => LAYERS.filter((l) => l.id === id);
  const loadBoom = new Function('LAYERS', 'getJSON', 'getJSONAsset', src)(LAYERS, boom, boom);
  for (const l of LAYERS) {
    let threw = false, out = null;
    try { out = await loadBoom(only(l.id)); } catch (e) { threw = true; }
    if (l.required && !threw) fail.push(`${l.id}：必要的層抓不到卻沒有中止載入`);
    if (!l.required && threw) fail.push(`${l.id}：可選的層抓不到就讓整個載入失敗了`);
    if (!l.required && !threw && out[l.id] !== null) {
      fail.push(`${l.id}：抓不到的時候應該是 null`);
    }
  }
}

for (const line of warn) console.log(`  ! ${line}`);
if (fail.length) {
  console.log(`  ✗ ${fail.length} 項對不上：`);
  for (const line of fail) console.log(`    ${line}`);
  console.log(`\n0 通過，1 失敗`);
  process.exit(1);
}
console.log(`  ✓ ${LAYERS.length} 層的來源檔案、三語字串、面板節點、離地高度與載入路徑都對得上`);
console.log(`\n1 通過，0 失敗`);
