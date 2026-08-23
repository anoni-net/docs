#!/usr/bin/env node
/**
 * 「你的瀏覽器透露了什麼」示範頁（docs/zh-TW/js/leaks.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這一頁刻意做成一個指紋收集器，讀者第一個問題一定是「那你們有沒有在收」。答案寫在
 * 頁面上，而這支測試是那個答案的憑據：掃過原始碼，出現任何送資料出去或寫進儲存的
 * 手段就紅。承諾寫在文案裡誰都會寫，有測試守著才算數。
 *
 * 另一半是文案完整性。少一項 Tor Browser 的處理說明，那一項就只是在嚇人而沒有指向
 * 解法；少一項翻譯，簡體或英文讀者會看到正體中文。這兩種漏掉都不會讓程式壞掉。
 *
 * === 怎麼驗 ===
 *
 * 跟這個 repo 其他幾支一樣，把資料與純函式從原始碼原地抽出來，不重寫一份。實際讀
 * 瀏覽器 API 的那些 read() 不在這裡測，那要有瀏覽器，由實機驗證負責。
 *
 * 用法：
 *   node tools/test_leaks.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'leaks.js');
const src = fs.readFileSync(SRC, 'utf8');

// 掃描用的版本：剝掉註解。檔頭本來就在說明「不會出現哪些東西」，把那些名字寫出來
// 才講得清楚，而註解裡的字不該讓自我檢查失效。這個檔案的字串裡沒有 // 或 /*，
// 所以這個剝法夠用。
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`leaks.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  function shortHash\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function fontDetected\(widths, baselines\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function digestOf\(entries\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function combinations\(counts\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const PROBES = \[[\s\S]*?\n  \];/m)}
  ${grab(/^  const FMT_ZH_TW = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const FMT_ZH = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const FMT_EN = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { shortHash, fontDetected, digestOf, combinations, PROBES, STRINGS };
`;
const load = (opts = {}) => {
  // displayMode 的 read 要用 matchMedia、navigator.standalone 與 document.referrer。
  // 替身讓每種情況都測得到：matched 是「哪一個 display-mode 會回 true」。
  const windowStub = {
    matchMedia: (q) => ({ matches: !!opts.matched && q.includes("display-mode: " + opts.matched) }),
    navigator: { standalone: opts.iosStandalone === true },
  };
  const documentStub = { referrer: opts.referrer || "" };
  return new Function("window", "document", harness)(windowStub, documentStub);
};
const mod = load();

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('原始碼裡沒有任何把資料送出去的手段', () => {
  // 這一頁的整個立論建立在「什麼都不送」上。加了分析、加了回報、加了「幫你查一下
  // 這個指紋有多獨特」的功能，這一頁就變成它自己在警告的東西。
  const forbidden = [
    ['fetch(', '送 HTTP 請求'],
    ['XMLHttpRequest', '送 HTTP 請求'],
    ['sendBeacon', '背景回報'],
    ['WebSocket', '長連線'],
    ['EventSource', '長連線'],
    ['navigator.connection', '連線資訊'],
    ['<img', '用圖片網址夾帶資料'],
    ['new Image', '用圖片網址夾帶資料'],
  ];
  for (const [needle, why] of forbidden) {
    assert.ok(!code.includes(needle), `出現了 ${needle}（${why}）`);
  }
});

test('原始碼裡沒有任何把資料留下來的手段', () => {
  // 留在裝置上的那份檔案本身就是一份完整指紋，跟 GPS 軌跡是同一個判準
  for (const needle of ['localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'caches.open']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('沒有匯出或下載的路徑', () => {
  for (const needle of ['createObjectURL', 'download', 'clipboard']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('短碼可以整段選取，剩下的複製動作留給讀者', () => {
  // 頁面寫著「點一下短碼會整段選取」，靠的是 CSS 而不是 clipboard API。拿掉
  // user-select 之後那句話就變成假的，而改用 clipboard 會踩到上面那條線。
  assert.ok(
    /\.lk-code\s*\{[^}]*user-select:\s*all/s.test(code),
    '.lk-code 少了 user-select: all，短碼會變回要逐字抄'
  );
});

test('只有地理位置需要授權', () => {
  const gated = mod.PROBES.filter((p) => p.needsPermission).map((p) => p.key);
  assert.deepEqual(gated, ['location']);
  // 其餘每一項都必須是不問就拿得到的，那正是這一頁要示範的事
  assert.ok(mod.PROBES.length >= 10, `只有 ${mod.PROBES.length} 項，太少沒有說服力`);
});

test('每一項都有名稱、為什麼、Tor Browser 怎麼處理', () => {
  // 少了 tor 那一句，這一項就只是在嚇人而沒有指向解法
  for (const lang of ['zh-TW', 'zh', 'en']) {
    const t = mod.STRINGS[lang];
    for (const probe of mod.PROBES) {
      assert.ok(t.names[probe.key], `${lang} 少了 ${probe.key} 的名稱`);
      assert.ok(t.why[probe.key], `${lang} 少了 ${probe.key} 的說明`);
      assert.ok(t.tor[probe.key], `${lang} 少了 ${probe.key} 的 Tor Browser 處理`);
    }
  }
});

test('三個語系的字串表結構一致，沒有漏翻譯', () => {
  const shape = (t) => ({
    keys: Object.keys(t).sort(),
    names: Object.keys(t.names).sort(),
    why: Object.keys(t.why).sort(),
    tor: Object.keys(t.tor).sort(),
    prefs: Object.keys(t.prefs).sort(),
    fmt: Object.keys(t.fmt).sort(),
  });
  const base = shape(mod.STRINGS['zh-TW']);
  assert.deepEqual(shape(mod.STRINGS.zh), base, 'zh 的結構跟 zh-TW 不一樣');
  assert.deepEqual(shape(mod.STRINGS.en), base, 'en 的結構跟 zh-TW 不一樣');
});

test('三個語系是各自的文案，不是同一份', () => {
  // 偷懶寫成 STRINGS.zh = STRINGS['zh-TW'] 的話，簡體讀者會看到正體中文
  const tw = mod.STRINGS['zh-TW'];
  const cn = mod.STRINGS.zh;
  const en = mod.STRINGS.en;
  assert.notEqual(tw.note, cn.note, '簡體那份跟正體一模一樣');
  assert.notEqual(tw.note, en.note, '英文那份跟正體一模一樣');
  assert.notEqual(tw.names.screen, en.names.screen);
  // 畫面上會出現的數值也要走各自的模板
  assert.notEqual(tw.fmt.devices(1, 2, 3), en.fmt.devices(1, 2, 3));
  assert.ok(en.fmt.devices(1, 2, 3).includes('cameras'), en.fmt.devices(1, 2, 3));
  assert.ok(cn.fmt.hardware(4, 8, 0).includes('内存'), cn.fmt.hardware(4, 8, 0));
});

test('沒有記憶體資訊時不留下空欄位', () => {
  const withMemory = mod.STRINGS['zh-TW'].fmt.hardware(8, 16, 5);
  const without = mod.STRINGS['zh-TW'].fmt.hardware(8, null, 5);
  assert.ok(withMemory.includes('16 GB'));
  assert.ok(!without.includes('GB'), without);
  assert.ok(!without.includes('，，'), without);
});

test('摘要碼只收穩定的項目', () => {
  // 換瀏覽器比對摘要碼是這一頁的主要用法。混進會漂移的值，同一個瀏覽器每次開都
  // 給出不同的碼，比對就失去意義。
  const base = [
    { key: 'timezone', stable: true, value: 'Asia/Taipei' },
    { key: 'storage', stable: false, value: '10.0 GB' },
  ];
  const drifted = [
    { key: 'timezone', stable: true, value: 'Asia/Taipei' },
    { key: 'storage', stable: false, value: '7.4 GB' },
  ];
  assert.equal(mod.digestOf(base), mod.digestOf(drifted));
});

test('穩定的值變了摘要碼就跟著變', () => {
  const a = mod.digestOf([{ key: 'timezone', stable: true, value: 'Asia/Taipei' }]);
  const b = mod.digestOf([{ key: 'timezone', stable: true, value: 'UTC' }]);
  assert.notEqual(a, b, '換到 Tor Browser 之後這個碼要看得出不一樣');
});

test('摘要碼跟項目回來的先後無關', () => {
  // 有幾項是 async，完成順序每次都可能不同
  const one = [
    { key: 'timezone', stable: true, value: 'UTC' },
    { key: 'canvas', stable: true, value: 'abc123' },
  ];
  assert.equal(mod.digestOf(one), mod.digestOf([...one].reverse()));
});

test('會漂移的項目沒有被標成穩定', () => {
  for (const key of ['storage', 'devices', 'location']) {
    const probe = mod.PROBES.find((p) => p.key === key);
    assert.ok(probe, `找不到 ${key}`);
    assert.ok(!probe.stable, `${key} 會變，不該進摘要碼`);
  }
});

test('視窗尺寸不進摘要碼，只取螢幕本身', () => {
  // 讀者拉一下視窗，畫面上的值就變了，但那不代表換了瀏覽器
  const screen = mod.PROBES.find((p) => p.key === 'screen');
  assert.ok(screen.stable);
  assert.ok(screen.digest, 'screen 要另外給一個只含螢幕的版本');
});

test('每一項都標了讀者自己做得到什麼', () => {
  // 不標的話這一頁看起來像「照著關一關就沒事了」，而十五項裡真正關得掉的只有三項
  const levels = new Set(['permission', 'browser', 'system', 'none']);
  for (const probe of mod.PROBES) {
    assert.ok(levels.has(probe.control), `${probe.key} 的 control 是 ${probe.control}`);
  }
  for (const lang of ['zh-TW', 'zh', 'en']) {
    const t = mod.STRINGS[lang];
    assert.ok(t.controlLabel, `${lang} 少了「你能做什麼」的標題`);
    for (const level of levels) {
      assert.ok(t.controls[level], `${lang} 少了 ${level} 的說明`);
    }
  }
});

test('關得掉與關不掉的分類沒有寫反', () => {
  const of = (key) => mod.PROBES.find((p) => p.key === key).control;
  // 位置是唯一會跳授權視窗的，也是唯一能整個關掉的
  assert.equal(of('location'), 'permission');
  // 這兩項在瀏覽器設定裡改得到
  assert.equal(of('language'), 'browser');
  assert.equal(of('donottrack'), 'browser');
  // 這兩項要動系統設定，會影響其他 App
  assert.equal(of('timezone'), 'system');
  assert.equal(of('preferences'), 'system');
  // 其餘在一般瀏覽器上沒有開關，這件事要誠實標出來
  for (const key of ['screen', 'hardware', 'webgl', 'canvas', 'fonts', 'clientHints', 'clientRects', 'audio']) {
    assert.equal(of(key), 'none', `${key} 標錯了，一般瀏覽器關不掉`);
  }
});

test('關不掉的項目佔多數，文案不該說得像關一關就好', () => {
  const none = mod.PROBES.filter((p) => p.control === 'none').length;
  assert.ok(none > mod.PROBES.length / 2, `只有 ${none} 項標成關不掉，跟實情不符`);
});

test('每一項都有對照值可以比，不只是說明', () => {
  // 原本只寫「Tor Browser 會統一掉」，讀者換瀏覽器得自己記十幾個值
  for (const lang of ['zh-TW', 'zh', 'en']) {
    assert.ok(mod.STRINGS[lang].torLabel, `${lang} 少了對照值的標題`);
    assert.ok(mod.STRINGS[lang].summary, `${lang} 少了摘要碼的說明`);
  }
});

test('雜湊穩定、同輸入同輸出、不同輸入不同輸出', () => {
  assert.equal(mod.shortHash('anoni'), mod.shortHash('anoni'));
  assert.notEqual(mod.shortHash('anoni'), mod.shortHash('anoni.net'));
  assert.equal(mod.shortHash('anoni').length, 8);
  assert.match(mod.shortHash('anoni'), /^[0-9a-f]{8}$/);
  // 差一個字元就要換一個值，不然 canvas 那一項分不出瀏覽器
  const a = mod.shortHash('data:image/png;base64,AAAA');
  const b = mod.shortHash('data:image/png;base64,AAAB');
  assert.notEqual(a, b);
});

test('字型偵測用寬鬆比對，但不到誤判的程度', () => {
  const baselines = [100, 120, 140];
  // 三種備援都量到一樣的寬度，代表系統沒有這個字型
  assert.equal(mod.fontDetected([100, 120, 140], baselines), false);
  // 任何一種備援組合量出不同寬度就算裝了
  assert.equal(mod.fontDetected([100, 125, 140], baselines), true);
  // 差距在半個像素以內當成同一個，字型度量本來就是連續值
  assert.equal(mod.fontDetected([100.3, 120, 140], baselines), false);
  assert.equal(mod.fontDetected([100.6, 120, 140], baselines), true);
});

test('組合數是相乘不是相加', () => {
  assert.equal(mod.combinations([2, 3, 4]), 24);
  // 只有一種可能的項目不會把結果歸零
  assert.equal(mod.combinations([2, 0, 3]), 6);
  assert.equal(mod.combinations([]), 1);
});

// === 顯示模式 ===
//
// 站方自己的分析（aa.anoni.net）會送出一次這個值，用來決定離線閱讀與小工具的方向。
// 既然拿了就要跟其他項目並列在這一頁，不然「我們沒有在收集這些」那一節會說不過去。

test('顯示模式跟其他項目一樣，不需要授權就讀得到', () => {
  const probe = mod.PROBES.find((p) => p.key === 'displayMode');
  assert.ok(probe, 'PROBES 裡沒有 displayMode');
  assert.equal(probe.needsPermission, false);
});

test('六種顯示模式三個語系都有標籤', () => {
  const keys = ['browser', 'standalone', 'minimalUi', 'fullscreen', 'windowControlsOverlay', 'twa'];
  for (const lang of ['zh-TW', 'zh', 'en']) {
    for (const k of keys) {
      assert.ok(mod.STRINGS[lang].modes[k], `${lang} 少了 ${k} 的標籤`);
    }
  }
});

test('一般分頁回瀏覽器，裝成 app 回對應的模式', () => {
  const read = (opts) => {
    const m = load(opts);
    const probe = m.PROBES.find((p) => p.key === 'displayMode');
    return probe.read(m.STRINGS['zh-TW']);
  };
  const t = mod.STRINGS['zh-TW'];
  assert.equal(read({}), t.modes.browser, '沒有任何 display-mode 命中時該回瀏覽器分頁');
  assert.equal(read({ matched: 'standalone' }), t.modes.standalone);
  assert.equal(read({ matched: 'minimal-ui' }), t.modes.minimalUi);
  assert.equal(read({ matched: 'fullscreen' }), t.modes.fullscreen);
  assert.equal(read({ matched: 'window-controls-overlay' }), t.modes.windowControlsOverlay);
});

test('iOS 加到主畫面與 Android TWA 各有自己的判斷', () => {
  const read = (opts) => {
    const m = load(opts);
    return m.PROBES.find((p) => p.key === 'displayMode').read(m.STRINGS['zh-TW']);
  };
  const t = mod.STRINGS['zh-TW'];
  // 舊版 iOS Safari 不支援 display-mode 媒體查詢，只有 navigator.standalone
  assert.equal(read({ iosStandalone: true }), t.modes.standalone);
  // Android 的 TWA 從 referrer 認，而且要優先於其他判斷
  assert.equal(read({ referrer: 'android-app://net.anoni.docs/' }), t.modes.twa);
  assert.equal(read({ referrer: 'android-app://x/', matched: 'standalone' }), t.modes.twa);
});


for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 4).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
