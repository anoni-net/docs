#!/usr/bin/env node
/**
 * 密語與密碼產生器（docs/zh-TW/js/passphrase.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這幾支函式錯了不會壞掉，會照常吐出一串看起來很隨機的字，而讀者拿去當主密碼。
 * 取樣有偏差、熵算錯、字元集組錯，三者都是「畫面上完全正常」的錯誤，只有算過才
 * 知道。密碼工具的錯誤沒有回報者，因為受害的人不會知道自己受害。
 *
 * 最容易寫錯的是取樣。`crypto.getRandomValues()[0] % 7776` 看起來沒問題，但 2^32
 * 不是 7776 的倍數，前 2560 個字被抽中的機率比其他字高一點點。這支測試特地構造
 * 一組輸入，讓「直接取模」與「拒絕重抽」給出不同答案，寫回去就會紅。
 *
 * === 怎麼驗 ===
 *
 * 跟 test_sw_offline.mjs 同一套：把函式從原始碼原地抽出來執行，不重寫一份邏輯。
 * 隨機來源由測試提供，所以每一項都是確定性的，沒有「跑十次紅一次」那種東西。
 * 另外拿真的 crypto 跑一輪分布檢查，守的是「有接上真的亂數源」。
 *
 * 用法：
 *   node tools/test_passphrase.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'passphrase.js');
const src = fs.readFileSync(SRC, 'utf8');
// 剝掉註解再掃，不然註解裡提到的東西會被當成程式碼
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const WORDLIST = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'asian-diceware-7776.txt');

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`passphrase.js 裡找不到 ${re}`);
  return m[0];
};

const harness = `
  ${grab(/^  function randomBelow\(limit, randomUint32\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function pickWords\(words, count, randomUint32\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function makePassword\(charset, length, randomUint32\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function entropyBits\(poolSize, count\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const CHARSETS = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  function buildCharset\(picked\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function strengthOf\(bits\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const DICE = 5;[\s\S]*?\n  function diceTableText\(words\) \{[\s\S]*?\n  \}/m)}
  return { randomBelow, pickWords, makePassword, entropyBits, CHARSETS, buildCharset, strengthOf,
           DICE, FACES, diceToIndex, indexToDice, wordForDice, diceTableText };
`;
const pp = new Function(harness)();

// 照順序吐出指定的值，用完就丟例外。測試要能斷言「消耗了幾個」。
const feed = (values) => {
  let i = 0;
  const fn = () => {
    if (i >= values.length) throw new Error('隨機值被要求得比預期多');
    return values[i++];
  };
  fn.used = () => i;
  return fn;
};

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('取樣把不能整除的尾巴丟掉重抽，不是直接取模', () => {
  // 2^32 % 7776 = 2560，所以 [2^32-2560, 2^32) 這 2560 個值要丟掉。
  // 直接取模的話，4294964736 會變成 0，讓前 2560 個字多一次機會。
  const boundary = 4294964736; // 2^32 - 2560
  assert.equal(boundary % 7776, 0, '前提：這個值直接取模會落在第 0 個字');

  const random = feed([boundary, 5]);
  assert.equal(pp.randomBelow(7776, random), 5, '應該丟掉重抽，拿第二個值');
  assert.equal(random.used(), 2, '應該消耗兩個隨機值');
});

test('沒有超出範圍的值就不重抽', () => {
  const random = feed([boundaryMinusOne()]);
  assert.equal(pp.randomBelow(7776, random), 4294964735 % 7776);
  assert.equal(random.used(), 1);
  function boundaryMinusOne() {
    return 4294964735;
  }
});

test('連續好幾個都超出範圍就一直重抽', () => {
  const random = feed([4294967295, 4294967000, 4294964736, 12]);
  assert.equal(pp.randomBelow(7776, random), 12);
  assert.equal(random.used(), 4);
});

test('limit 是 2 的冪時不會有任何值被丟掉', () => {
  // 2^32 % 256 === 0，整除，所有值都可以用
  const random = feed([4294967295]);
  assert.equal(pp.randomBelow(256, random), 255);
  assert.equal(random.used(), 1);
});

test('抽出來的字允許重複', () => {
  // Diceware 每一次都是獨立的擲骰。排除重複會讓後面幾個字的可選範圍變小，
  // 實際熵比宣稱的低，那比重複本身糟糕。
  const words = ['a', 'b', 'c'];
  const random = feed([0, 0, 0]);
  assert.deepEqual(pp.pickWords(words, 3, random), ['a', 'a', 'a']);
});

test('抽的次數與位置都對得上', () => {
  const words = ['zero', 'one', 'two', 'three'];
  const random = feed([3, 1, 0]);
  assert.deepEqual(pp.pickWords(words, 3, random), ['three', 'one', 'zero']);
});

test('密碼只用給定的字元集', () => {
  const random = feed([0, 1, 2]);
  assert.equal(pp.makePassword('xyz', 3, random), 'xyz');
});

test('熵是每次抽取的獨立累加', () => {
  // EFF 對 Diceware 的說法：7776 字抽六次約 77.5 bits
  assert.equal(Math.round(pp.entropyBits(7776, 6) * 10) / 10, 77.5);
  assert.equal(pp.entropyBits(2, 8), 8);
  assert.equal(pp.entropyBits(94, 20).toFixed(1), '131.1');
  // 沒得選就沒有熵
  assert.equal(pp.entropyBits(1, 10), 0);
  assert.equal(pp.entropyBits(7776, 0), 0);
});

test('字元集照勾選組合，順序固定', () => {
  assert.equal(pp.buildCharset({ lower: true }), pp.CHARSETS.lower);
  assert.equal(
    pp.buildCharset({ lower: true, digit: true }),
    pp.CHARSETS.lower + pp.CHARSETS.digit
  );
  assert.equal(pp.buildCharset({}), '');
  // 四種全開是 26+26+10+14
  assert.equal(
    pp.buildCharset({ lower: true, upper: true, digit: true, symbol: true }).length,
    76
  );
});

test('字元集裡沒有重複的字元', () => {
  // 重複會讓實際熵比 length × log2(charset.length) 低
  for (const [name, chars] of Object.entries(pp.CHARSETS)) {
    assert.equal(new Set(chars).size, chars.length, `${name} 有重複字元`);
  }
  const all = pp.buildCharset({ lower: true, upper: true, digit: true, symbol: true });
  assert.equal(new Set(all).size, all.length, '四種合起來有重複字元');
});

test('強度分級的邊界', () => {
  assert.equal(pp.strengthOf(49), 'weak');
  assert.equal(pp.strengthOf(50), 'fair');
  assert.equal(pp.strengthOf(69), 'fair');
  assert.equal(pp.strengthOf(70), 'good');
  assert.equal(pp.strengthOf(89), 'good');
  assert.equal(pp.strengthOf(90), 'strong');
  // 預設的六個字（77.5 bits）要落在「夠強」
  assert.equal(pp.strengthOf(pp.entropyBits(7776, 6)), 'good');
});

test('詞表本身是乾淨的', () => {
  // 詞表由 anoni-net/asian-diceware 產生，這裡守的是「複製過來的這一份沒有壞掉」
  const words = fs.readFileSync(WORDLIST, 'utf8').split('\n').map((w) => w.trim()).filter(Boolean);
  assert.equal(words.length, 7776, 'Diceware 要剛好 6^5 個字');
  assert.equal(new Set(words).size, 7776, '有重複的字會讓實際熵比宣稱的低');
  assert.ok(words.every((w) => /^[a-z]+$/.test(w)), '有非小寫英文字母的字');
  assert.ok(words.every((w) => w.length >= 3), '有太短的字');
});

test('接的是真的亂數源，而且分布沒有明顯偏斜', () => {
  // 上面那些用的是測試餵的值，這一項確認 randomBelow 配上真的 crypto 也正常。
  // 門檻放得很寬，這裡要抓的是「常數」「只吐幾個值」那種錯，不是統計檢定。
  const randomUint32 = () => {
    const buf = new Uint32Array(1);
    webcrypto.getRandomValues(buf);
    return buf[0];
  };
  const buckets = new Array(16).fill(0);
  const rounds = 16000;
  for (let i = 0; i < rounds; i += 1) buckets[pp.randomBelow(16, randomUint32)] += 1;

  const expected = rounds / 16;
  for (const [i, n] of buckets.entries()) {
    assert.ok(
      Math.abs(n - expected) < expected * 0.25,
      `第 ${i} 格出現 ${n} 次，離期望值 ${expected} 太遠`
    );
  }
});

test('選中的模式按鈕不會被 hover 規則蓋掉文字色', () => {
  // 通用 hover 把文字色換成 accent，特異性又比填色那條高。選中之後滑鼠停在上面，
  // 字就跟藍底融在一起。觸控裝置點完會停在 hover 狀態，所以手機上是按一下就消失。
  assert.ok(
    src.includes('button:hover:not(:disabled):not([aria-pressed="true"])'),
    'hover 規則要排除選中的按鈕'
  );
  assert.ok(src.includes('button[aria-pressed="true"]:hover'), '選中的按鈕要有自己的 hover 回饋');
});

test('骰子編碼就是詞表的順序，11111 是第一個、66666 是最後一個', () => {
  // Diceware 的詞表順序本身就是編碼，這個對應錯了讀者查到的字全部是錯的
  assert.equal(pp.diceToIndex([1, 1, 1, 1, 1]), 0);
  assert.equal(pp.diceToIndex([6, 6, 6, 6, 6]), 7775);
  assert.equal(pp.indexToDice(0).join(''), '11111');
  assert.equal(pp.indexToDice(7775).join(''), '66666');
});

test('六進位的位權沒有算錯，第一顆骰子是最高位', () => {
  // 位權顛倒的話往返測試照樣會過，所以要單獨釘住幾個點
  assert.equal(pp.diceToIndex([2, 1, 1, 1, 1]), 1296);
  assert.equal(pp.diceToIndex([1, 2, 1, 1, 1]), 216);
  assert.equal(pp.diceToIndex([1, 1, 2, 1, 1]), 36);
  assert.equal(pp.diceToIndex([1, 1, 1, 2, 1]), 6);
  assert.equal(pp.diceToIndex([1, 1, 1, 1, 2]), 1);
});

test('7776 個位置往返都一致', () => {
  for (let i = 0; i < 7776; i += 1) {
    const dice = pp.indexToDice(i);
    assert.ok(dice, `index ${i} 轉不出骰子`);
    assert.equal(dice.length, 5);
    assert.equal(pp.diceToIndex(dice), i, `index ${i} 轉回來對不上`);
  }
});

test('不合法的點數與長度回 -1，不會查到別的字', () => {
  for (const bad of [[0, 1, 1, 1, 1], [7, 1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [], null]) {
    assert.equal(pp.diceToIndex(bad), -1, `${JSON.stringify(bad)} 應該被擋下來`);
  }
});

test('查表查得到詞，超出範圍回 null 而不是 undefined', () => {
  const words = ['a', 'b', 'c'];
  assert.equal(pp.wordForDice(words, [1, 1, 1, 1, 1]), 'a');
  assert.equal(pp.wordForDice(words, [1, 1, 1, 1, 3]), 'c');
  assert.equal(pp.wordForDice(words, [6, 6, 6, 6, 6]), null, '超出詞表要回 null');
  assert.equal(pp.wordForDice(words, [0, 1, 1, 1, 1]), null);
  assert.equal(pp.wordForDice(null, [1, 1, 1, 1, 1]), null);
});

test('實體骰子與程式抽取的熵完全相同', () => {
  // 五顆六面骰是 log2(6^5)，7776 個字抽一次是 log2(7776)，兩個必須是同一個數字，
  // 否則畫面上兩個模式會給出不一致的強度
  assert.equal(Math.log2(Math.pow(6, 5)), Math.log2(7776));
  assert.equal(pp.entropyBits(7776, 6).toFixed(3), (6 * Math.log2(Math.pow(6, 5))).toFixed(3));
});

test('對照表每一行都是「五位編碼 tab 詞」，行數等於詞數', () => {
  const words = Array.from({ length: 7776 }, (_, i) => 'w' + i);
  const lines = pp.diceTableText(words).trim().split('\n');
  assert.equal(lines.length, 7776);
  assert.equal(lines[0], '11111\tw0');
  assert.equal(lines[7775], '66666\tw7775');
  for (const line of [lines[0], lines[3000], lines[7775]]) {
    assert.match(line, /^[1-6]{5}\t\S+$/, `這一行格式不對：${line}`);
  }
});

test('對照表跟真的詞表對得起來', () => {
  // 讀者下載這份表來離線核對，它跟這一頁查出來的必須一致
  const file = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'asian-diceware-7776.txt');
  const words = fs.readFileSync(file, 'utf8').split('\n').map((w) => w.trim()).filter(Boolean);
  assert.equal(words.length, 7776, `詞表有 ${words.length} 個字`);
  const lines = pp.diceTableText(words).trim().split('\n');
  for (const i of [0, 1, 1295, 4000, 7775]) {
    const [code, word] = lines[i].split('\t');
    assert.equal(word, words[i], `第 ${i} 行的字對不上`);
    assert.equal(pp.wordForDice(words, code.split('').map(Number)), words[i],
                 `編碼 ${code} 查出來的字跟表上的不同`);
  }
});

test('三個模式的控制項各自分開，不會互相漏出來', () => {
  // 原本 password 那一段是 else，骰子模式就把長度滑桿與字元集勾選框一起帶出來了。
  // 這是畫面上的事，單元測試看不到，只能盯著分支條件。
  assert.match(code, /if \(state\.mode === "phrase"\) \{[\s\S]*?\} else if \(state\.mode === "password"\) \{/,
               'password 那一段用的還是 else，骰子模式會落進去');
});

test('骰子模式沒有「重新產生」按鈕', () => {
  // 值是讀者擲出來的，程式沒有立場重抽一次
  const actions = code.slice(code.indexOf('const actions = el("div", "pp-row")'));
  const guard = actions.slice(0, actions.indexOf('const copy'));
  assert.match(guard, /if \(state\.mode !== "dice"\)/, '重新產生沒有排除骰子模式');
});

test('骰子模式不碰亂數源', () => {
  // 整個模式的意義就在這裡：隨機性來自讀者的手
  // 錨在介面那一段。generate() 裡也有同名的分支，從那裡切會把另外兩個模式的
  // 抽取邏輯一起框進來
  const start = code.indexOf('const box = el("div", "pp-dice")');
  assert.ok(start > 0, '找不到骰子模式的介面區塊');
  const block = code.slice(start, code.indexOf('const out = el("div", "pp-out")', start));
  for (const needle of ['randomUint32', 'getRandomValues', 'Math.random', 'pickWords']) {
    assert.ok(!block.includes(needle), `骰子模式的介面用到了 ${needle}`);
  }
});

for (const [name, fn] of tests) {
  try {
    fn();
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
