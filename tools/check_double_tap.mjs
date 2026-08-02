#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」在 iOS Safari 上點兩下會不會觸發瀏覽器的放大。
 *
 * === 這個 bug 長什麼樣 ===
 *
 * 使用者在手機 Safari 上對著物件點兩下，整個頁面被瀏覽器放大，蓋掉這支自己的縮放。
 *
 * 原本擋雙擊的只有兩道，兩道都擋不到：
 *
 *   1. viewport 的 user-scalable=no / maximum-scale=1。iOS 10 起 Safari 直接忽略，
 *      理由是無障礙，這是不會回來的。
 *   2. dblclick 的 preventDefault。dblclick 是瀏覽器決定要縮放「之後」才發出來的，
 *      攔在那裡已經太晚。
 *
 * gesturestart / gesturechange / gestureend 那三個 WebKit 事件擋的是「捏合」，
 * 跟「點兩下放大」是兩套獨立機制，也擋不到。
 *
 * 真正管得到的是 touch-action: manipulation，它的定義就是「允許平移與捏合，
 * 但不要點兩下放大」。原本只有 canvas 設了 touch-action: none，面板、國家標籤、
 * 卡片、按鈕全都沒設，所以在那些元素上點兩下照樣會縮放。
 *
 * === 為什麼不去瀏覽器讀計算值 ===
 *
 * 試過用 CDP 讀 getComputedStyle(...).touchAction，讀出來的按鈕全是 auto，
 * 看起來像沒生效，其實是驗錯東西。touch-action 不是繼承屬性，計算值只反映元素
 * 自己有沒有寫。瀏覽器判定雙擊縮放時是沿著祖先鏈往上取交集到根節點，所以設在
 * html/body 上對底下所有元素都有效，但從計算值看不出來。這支改成驗規則本身有沒有
 * 寫在該寫的選擇器上，那是看得準的部分。
 *
 * 另外 headless 起不了 WebGPU，canvas 是 renderer 建出來的，頁面上根本沒有那個
 * 元素可以讀，也是不能靠瀏覽器驗的原因。
 *
 * JS 那半用重放驗。CSS 是主要手段，touchend 攔截是保險，舊版 Safari 有忽略
 * touch-action 的紀錄，兩個都要在。
 *
 * 用法：
 *   node tools/check_double_tap.mjs
 * 有問題時 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const atlas = fs.readFileSync(path.join(DIR, 'atlas.js'), 'utf8');

const fail = [];
const ok = [];

// --- CSS 那半 ---------------------------------------------------------------

/** 取出某個選擇器的規則內容。只找單一選擇器的規則，夠用且不會誤配到別條。 */
function ruleFor(sel) {
  const re = new RegExp(`(^|[{}\\n])\\s*${sel.replace(/[.#*+?^$()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  const m = html.match(re);
  return m ? m[2] : null;
}

// html/body 蓋住整份文件，是雙擊縮放沿祖先鏈往上取交集時一定會經過的節點。
// .panel 與 #labels 要另外寫：#top 是 overflow-y: auto 的捲動容器，平移手勢的
// 祖先鏈會停在它身上，寫明才不用去賭各家瀏覽器對捲動容器邊界的處理一致。
for (const [sel, want] of [['html, body', 'manipulation'], ['.panel', 'manipulation'], ['#labels', 'manipulation'], ['canvas', 'none']]) {
  const body = ruleFor(sel);
  if (body === null) { fail.push(`✗ index.html 找不到 ${sel} 的規則`); continue; }
  const m = body.match(/touch-action:\s*([a-z-]+)/);
  if (!m) fail.push(`✗ ${sel} 沒有設 touch-action，預期 ${want}`);
  else if (m[1] !== want) fail.push(`✗ ${sel} 的 touch-action 是 ${m[1]}，預期 ${want}`);
  else ok.push(`✓ ${sel} 的 touch-action: ${m[1]}`);
}

// 三塊面板都掛著 .panel 才吃得到上面那條規則
for (const id of ['top', 'cc-card', 'hint']) {
  const re = new RegExp(`id="${id}"[^>]*class="[^"]*\\bpanel\\b`);
  if (re.test(html)) ok.push(`✓ #${id} 掛著 .panel`);
  else fail.push(`✗ #${id} 沒掛 .panel，touch-action 規則吃不到它`);
}

// --- JS 那半 ----------------------------------------------------------------

/** 從 atlas.js 取出 bindControls 的完整原始碼，靠大括號配對而不是正則 */
function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`atlas.js 裡找不到 ${header}`);
  let depth = 0, started = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') { depth++; started = true; }
    else if (c === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error(`${header} 的大括號沒有配對成功`);
}

const body = extractFn(atlas, 'function bindControls(dom)');

// 相依跟 check_pinch_release.mjs 同一套，名字要跟 atlas.js 的模組層變數一致。
// now 可控，才驗得動「兩次輕點間隔多久算雙擊」這條線。
const harness = `
  const view = { zoom: 1, rx: 0.45, ry: 2.28, spin: true };
  const pointers = new Map();
  const spin = { rx: 0, ry: 0 };
  let last = null, pinchStart = 0, zoomStart = 1;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ZOOM_MIN = 0.42, ZOOM_MAX = 1.6;
  const dragRate = () => 0.006;
  let spinOn = true;
  const btn = { hidden: true, addEventListener: () => {} };
  const $ = (id) => (id === 'btn-spin' ? btn : null);
  const REDUCED = false;
  const setSpin = (on) => { spinOn = on; btn.hidden = on; };
  const stopSpin = () => setSpin(false);
  const pauseSpin = () => setSpin(false);
  let NOW = 0;
  globalThis.performance = { now: () => NOW };
  ${body}
  const H = {};
  const dom = {
    addEventListener: (t, f) => { (H[t] = H[t] || []).push(f); },
    setPointerCapture: () => {},
  };
  globalThis.document = { addEventListener: () => {}, querySelectorAll: () => [] };
  bindControls(dom);
  return {
    // 回傳這一下有沒有被 preventDefault
    tap: (at, touches = 0) => {
      NOW = at;
      let stopped = false;
      const e = { touches: { length: touches }, preventDefault: () => { stopped = true; } };
      (H.touchend || []).forEach((f) => f(e));
      return stopped;
    },
    bound: () => (H.touchend || []).length,
  };
`;

const mk = () => new Function(harness)();

if (mk().bound() === 0) {
  fail.push('✗ bindControls 沒有掛 touchend，touch-action 之外沒有第二道保險');
} else {
  ok.push('✓ bindControls 有掛 touchend 攔截');

  // 兩次輕點靠得夠近 → 第二下要擋掉，那就是 Safari 會拿去放大的那一下
  {
    const c = mk();
    c.tap(1000);
    const second = c.tap(1200);
    if (second) ok.push('✓ 間隔 200ms 的第二次輕點被擋下');
    else fail.push('✗ 間隔 200ms 的第二次輕點沒擋下，Safari 會拿它放大');
  }

  // 第一下絕對不能擋，擋了會連帶取消相容滑鼠事件
  {
    const c = mk();
    if (!c.tap(1000)) ok.push('✓ 第一次輕點沒被擋');
    else fail.push('✗ 第一次輕點就被擋掉了，會連帶取消相容滑鼠事件');
  }

  // 慢慢點兩下是兩次獨立的點擊，不是雙擊，不能擋
  {
    const c = mk();
    c.tap(1000);
    if (!c.tap(2000)) ok.push('✓ 間隔 1000ms 的第二次輕點沒被擋');
    else fail.push('✗ 間隔 1000ms 的輕點被當成雙擊擋掉了');
  }

  // 捏合放開時 touchend 也會發，但還有手指在畫面上，那不是雙擊
  {
    const c = mk();
    c.tap(1000);
    if (!c.tap(1200, 1)) ok.push('✓ 還有手指留在畫面上時不擋，捏合放開不受影響');
    else fail.push('✗ 捏合放開一根手指時被誤判成雙擊');
  }
}

ok.forEach((l) => console.log('  ' + l));
if (fail.length) {
  console.error('\n' + fail.join('\n'));
  console.error('\niOS Safari 的點兩下放大只有 touch-action: manipulation 跟 touchend 攔得到，');
  console.error('viewport 的 user-scalable 與 dblclick 的 preventDefault 都沒有用。');
  process.exit(1);
}
console.log('\n雙擊放大該擋的都擋住了。');
