#!/usr/bin/env node
/**
 * PDF 頁面整理（docs/zh-TW/js/pdfpages.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 這個工具的失敗方式跟遮蔽工具一樣，畫面上看不出來：
 *
 *   - 頁碼算錯一位。使用者打 1-3 拿到第 2 到第 4 頁，而輸出看起來完全正常，
 *     只有真的去對照原檔的人才會發現。0 起算與 1 起算的邊界是這裡的地雷
 *   - 頁碼字串解析得太寬鬆。"1-3" 打成全形或夾了空白很常見，收不到就算了，
 *     更糟的是收成錯的範圍
 *   - 方向欄位餵了 PDF 不認得的角度，整份輸出失敗，或更糟，靜靜地轉錯方向
 *   - 有人日後加上「送到伺服器處理大檔」之類的捷徑。這一頁的整個立論建立在
 *     檔案不離開裝置上，所以直接掃原始碼，出現送出或留存的手段就紅
 *
 * === 怎麼驗 ===
 *
 * 純邏輯那一段原地抽出來執行，不重寫一份。真的組出 PDF 需要 pdf-lib 與瀏覽器，
 * 那一段由頁面自己在交付前做（重新載入輸出、逐頁比對計畫），這裡驗的是那個
 * 比對函式本身在各種不一致下會不會漏掉。
 *
 * 用法：
 *   node tools/test_pdfpages.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'pdfpages.js');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const start = src.indexOf('// --- 純邏輯');
const end = src.indexOf('// --- 介面');
assert.ok(start > 0 && end > start, 'pdfpages.js 裡找不到純邏輯與介面的分界註解');
const logic = src.slice(start, end);
const tool = new Function(
  `${logic}\n return { OUTPUT_NAME, MAX_FILES, MAX_PAGES, ROTATIONS, parsePageRange, normalizeRotation, describeSize, buildPlan, verifyPlan, moveFile, compactRange, allPages, humanSize };`
)();

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const range = (text, total) => tool.parsePageRange(text, total);

test('留空就是整份，那是合併時最常用的情況', () => {
  assert.deepEqual(range('', 3), { pages: [0, 1, 2], error: null });
  assert.deepEqual(range('   ', 3), { pages: [0, 1, 2], error: null });
  assert.deepEqual(range(null, 2), { pages: [0, 1], error: null });
  assert.deepEqual(range(undefined, 2), { pages: [0, 1], error: null });
});

test('頁碼是 1 起算，回傳的頁次是 0 起算', () => {
  // 這一條就是「差一位」那個地雷。1-3 是第 1、2、3 頁，也就是索引 0、1、2
  assert.deepEqual(range('1', 5).pages, [0]);
  assert.deepEqual(range('1-3', 5).pages, [0, 1, 2]);
  assert.deepEqual(range('5', 5).pages, [4]);
});

test('逗號分隔、多個區間、單頁混著寫', () => {
  assert.deepEqual(range('1-3, 5, 8-10', 10).pages, [0, 1, 2, 4, 7, 8, 9]);
  assert.deepEqual(range('2,4,6', 6).pages, [1, 3, 5]);
});

test('全形逗號、頓號、全形數字與各種破折號都收', () => {
  // 中文輸入法底下打出全形是常態，收不到只會讓人以為工具壞了
  assert.deepEqual(range('１-３，５', 6).pages, [0, 1, 2, 4]);
  assert.deepEqual(range('1-3、5', 6).pages, [0, 1, 2, 4]);
  assert.deepEqual(range('1–3', 6).pages, [0, 1, 2]);
  assert.deepEqual(range('1～3', 6).pages, [0, 1, 2]);
  assert.deepEqual(range(' 1 - 3 ', 6).pages, [0, 1, 2]);
});

test('開放區間：8- 到最後一頁，-3 從第一頁開始', () => {
  assert.deepEqual(range('8-', 10).pages, [7, 8, 9]);
  assert.deepEqual(range('-3', 10).pages, [0, 1, 2]);
});

test('反著寫的區間當成正著寫', () => {
  // 使用者要的是那個區間，不是要報錯
  assert.deepEqual(range('7-3', 10).pages, [2, 3, 4, 5, 6]);
});

test('重複的頁碼只留一次，順序照第一次出現', () => {
  assert.deepEqual(range('3,1-3,1', 5).pages, [2, 0, 1]);
});

test('超出範圍與看不懂的字串分開報，錯誤時不回半套結果', () => {
  assert.deepEqual(range('0', 5), { pages: [], error: 'outOfRange' });
  assert.deepEqual(range('6', 5), { pages: [], error: 'outOfRange' });
  assert.deepEqual(range('1-6', 5), { pages: [], error: 'outOfRange' });
  assert.deepEqual(range('abc', 5), { pages: [], error: 'badRange' });
  assert.deepEqual(range('1..3', 5), { pages: [], error: 'badRange' });
  assert.deepEqual(range('-', 5), { pages: [0, 1, 2, 3, 4], error: null });
  // 前面已經收了幾頁，後面那一段出錯就整串作廢，不要交出一半的選擇
  assert.deepEqual(range('1-2, 99', 5), { pages: [], error: 'outOfRange' });
});

test('沒有頁面的文件不會炸開', () => {
  assert.deepEqual(range('1-3', 0), { pages: [], error: null });
});

test('方向收斂成 PDF 認得的四個角度', () => {
  const n = tool.normalizeRotation;
  assert.equal(n(0, 90), 90);
  assert.equal(n(270, 90), 0);
  assert.equal(n(0, -90), 270);
  assert.equal(n(90, -180), 270);
  // 來源檔案裡出現過的怪值
  assert.equal(n(450, 0), 90);
  assert.equal(n(-90, 0), 270);
  assert.equal(n(undefined, 0), 0);
  assert.equal(n(NaN, 90), 90);
  // 不是 90 倍數的取最近的一個，不要把整份擋下來
  assert.equal(n(45, 0), 90);
  assert.equal(n(44, 0), 0);
  assert.equal(n(350, 0), 0);
  for (const value of [0, 90, 180, 270]) {
    assert.ok(tool.ROTATIONS.includes(n(value, 0)));
  }
});

test('連轉四次回到原點', () => {
  let angle = 0;
  for (let i = 0; i < 4; i += 1) angle = tool.normalizeRotation(angle, 90);
  assert.equal(angle, 0);
});

test('尺寸描述認得常見紙張，轉過方向之後長寬對調', () => {
  const a4 = tool.describeSize(595, 842, 0);
  assert.equal(a4.name, 'A4');
  assert.equal(a4.orientation, 'portrait');

  const turned = tool.describeSize(595, 842, 90);
  assert.equal(turned.name, 'A4');
  assert.equal(turned.orientation, 'landscape');
  assert.equal(turned.w, 842);
  assert.equal(turned.h, 595);

  // 掃描與轉檔常有零頭，容許幾個點
  assert.equal(tool.describeSize(596, 841, 0).name, 'A4');
  // 認不出來的尺寸不硬掰名字
  assert.equal(tool.describeSize(300, 300, 0).name, '');
  assert.equal(tool.describeSize(0, 0, 0), '');
});

test('計畫照檔案順序與各自選的頁次組出來，並帶上轉過的方向', () => {
  const files = [
    {
      id: 1,
      selection: [2, 0],
      pages: [
        { width: 595, height: 842, rotation: 0, turn: 90 },
        { width: 595, height: 842, rotation: 0, turn: 0 },
        { width: 612, height: 792, rotation: 90, turn: 90 },
      ],
    },
    {
      id: 2,
      selection: [0],
      pages: [{ width: 595, height: 842, rotation: 270, turn: 0 }],
    },
  ];
  const plan = tool.buildPlan(files);
  assert.equal(plan.length, 3);
  // 第一項是檔案 1 的第 3 頁（索引 2），原本 90 度再轉 90 度
  assert.deepEqual(plan[0], { fileId: 1, index: 2, rotation: 180, width: 612, height: 792 });
  assert.deepEqual(plan[1], { fileId: 1, index: 0, rotation: 90, width: 595, height: 842 });
  assert.deepEqual(plan[2], { fileId: 2, index: 0, rotation: 270, width: 595, height: 842 });
});

test('沒選任何一頁的檔案不進計畫', () => {
  const plan = tool.buildPlan([
    { id: 1, selection: [], pages: [{ width: 1, height: 1, rotation: 0 }] },
    { id: 2, selection: [0], pages: [{ width: 595, height: 842, rotation: 0 }] },
  ]);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].fileId, 2);
});

test('驗證抓得到頁數、方向與尺寸的不一致', () => {
  const plan = [
    { fileId: 1, index: 0, rotation: 0, width: 595, height: 842 },
    { fileId: 1, index: 1, rotation: 90, width: 595, height: 842 },
  ];
  const good = [
    { width: 595, height: 842, rotation: 0 },
    { width: 595, height: 842, rotation: 90 },
  ];
  assert.equal(tool.verifyPlan(plan, good), null);

  // 少一頁
  assert.equal(tool.verifyPlan(plan, good.slice(0, 1)).reason, 'count');
  // 多一頁
  assert.equal(tool.verifyPlan(plan, good.concat(good[0])).reason, 'count');
  // 方向錯了
  assert.equal(
    tool.verifyPlan(plan, [good[0], { width: 595, height: 842, rotation: 180 }]).reason,
    'rotation'
  );
  // 尺寸錯了
  assert.equal(
    tool.verifyPlan(plan, [{ width: 612, height: 792, rotation: 0 }, good[1]]).reason,
    'size'
  );
  // 根本不是陣列
  assert.equal(tool.verifyPlan(plan, null).reason, 'shape');
});

test('驗證容許浮點數的零頭，但不容許真的改了尺寸', () => {
  const plan = [{ fileId: 1, index: 0, rotation: 0, width: 595.276, height: 841.89 }];
  assert.equal(tool.verifyPlan(plan, [{ width: 595.28, height: 841.9, rotation: 0 }]), null);
  assert.equal(
    tool.verifyPlan(plan, [{ width: 598, height: 841.89, rotation: 0 }]).reason,
    'size'
  );
});

test('驗證把來源的怪角度收斂之後再比，不會假警報', () => {
  const plan = [{ fileId: 1, index: 0, rotation: 270, width: 595, height: 842 }];
  assert.equal(tool.verifyPlan(plan, [{ width: 595, height: 842, rotation: -90 }]), null);
});

test('檔案順序前後移動，到邊界就不動', () => {
  const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assert.deepEqual(tool.moveFile(list, 2, -1).map((x) => x.id), [2, 1, 3]);
  assert.deepEqual(tool.moveFile(list, 2, 1).map((x) => x.id), [1, 3, 2]);
  assert.deepEqual(tool.moveFile(list, 1, -1).map((x) => x.id), [1, 2, 3]);
  assert.deepEqual(tool.moveFile(list, 3, 1).map((x) => x.id), [1, 2, 3]);
  assert.deepEqual(tool.moveFile(list, 99, 1).map((x) => x.id), [1, 2, 3]);
  // 原陣列不能被改掉，畫面還在用它
  assert.deepEqual(list.map((x) => x.id), [1, 2, 3]);
});

test('頁次寫回字串再解析回來，結果一樣', () => {
  // 點頁碼與打頁碼是同一件事的兩條路，兩邊必須收斂到同一個結果
  for (const pages of [[0], [0, 1, 2], [0, 2, 4], [0, 1, 2, 5, 7, 8, 9], [4]]) {
    const text = tool.compactRange(pages);
    assert.deepEqual(range(text, 10).pages, pages, `${text} 解回來不一樣`);
  }
  assert.equal(tool.compactRange([]), '');
  assert.equal(tool.compactRange([0, 1, 2]), '1-3');
  assert.equal(tool.compactRange([0, 2]), '1, 3');
});

test('輸出檔名固定，不帶原檔名', () => {
  // 原檔名常帶承辦人姓名、案號與日期
  assert.equal(tool.OUTPUT_NAME, 'pages.pdf');
  assert.ok(/download\s*=\s*OUTPUT_NAME/.test(code), '下載連結沒有用固定檔名');
  assert.ok(!/download\s*=\s*[^;]*\bfile\.name\b/.test(code), '下載檔名不能取自來源檔名');
});

test('建檔與讀檔都關掉 updateMetadata，不然清空的欄位會被寫回去', () => {
  // 實機測出來的：pdf-lib 開著 updateMetadata 的時候，存檔會把 Producer 蓋成
  // 自己的名字、把修改時間改成當下，前面 setProducer("") 清掉的東西就白清了。
  // 這個選項只有 create() 與 load() 認得，寫在 save() 上完全沒有作用。
  assert.ok(
    /PDFDocument\.create\(\s*\{[^}]*updateMetadata\s*:\s*false/.test(code),
    'create() 沒有帶 updateMetadata: false'
  );
  for (const m of code.matchAll(/PDFDocument\.load\(([^;]*?)\)/g)) {
    assert.ok(/updateMetadata\s*:\s*false/.test(m[1]), 'load() 沒有帶 updateMetadata: false');
  }
  assert.ok(!/\.save\(\s*\{[^}]*updateMetadata/.test(code), 'save() 不認得 updateMetadata，寫了會誤導');
});

test('文件層的欄位在建檔時就清空', () => {
  for (const setter of ['setTitle', 'setAuthor', 'setSubject', 'setProducer', 'setCreator']) {
    assert.ok(new RegExp(setter + '\\(""\\)').test(code), '沒有清空 ' + setter);
  }
  assert.ok(/setCreationDate\(epoch\)/.test(code), '沒有把建立時間歸零');
  assert.ok(/setModificationDate\(epoch\)/.test(code), '沒有把修改時間歸零');
});

test('原始碼裡沒有任何送出或留存資料的手段', () => {
  // 這一頁的整個立論建立在檔案不離開裝置上，承諾寫在文案裡誰都會寫
  const banned = [
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /navigator\.sendBeacon/,
    /new\s+WebSocket/,
    /new\s+EventSource/,
    /localStorage/,
    /sessionStorage/,
    /indexedDB/,
    /document\.cookie/,
    /navigator\.clipboard\.read/,
    /new\s+Worker\s*\(\s*['"`]https?:/,
    /\bimport\s*\(/,
  ];
  for (const re of banned) {
    assert.ok(!re.test(code), `pdfpages.js 出現了 ${re}`);
  }
});

test('只從同一個站台載入 pdf-lib，網址是相對路徑', () => {
  // 從別的網域拿等於把「這個人在整理 PDF」告訴那個網域
  const m = code.match(/script\.src\s*=\s*new URL\(\s*(['"])([^'"]+)\1/);
  assert.ok(m, '找不到 pdf-lib 的載入位置');
  assert.equal(m[2], '../vendor/pdf-lib.min.js');
  assert.ok(!/https?:\/\//.test(code.replace(/^\s*\*.*$/gm, '')), '原始碼裡不該有絕對網址');
});

test('三個語系的字串表結構一致', () => {
  const langs = ['zh-TW', 'zh-CN', 'en'];
  const blocks = {};
  for (const lang of langs) {
    const key = lang === 'en' ? 'en' : `"${lang}"`;
    const at = src.indexOf(`${key}: {`);
    assert.ok(at > 0, `找不到 ${lang} 的字串表`);
    blocks[lang] = at;
  }
  // 每個語系都要有同一組 key，漏一個就是畫面上某一行變成 undefined
  // 上界要停在 STRINGS 物件的結尾，不然最後一個語系會一路吃到檔案末尾，
  // 把介面那一段同樣縮排的東西也當成字串表的 key
  const objStart = src.indexOf('const STRINGS = {');
  const objEnd = src.indexOf('\n  };', objStart);
  assert.ok(objStart > 0 && objEnd > objStart, '找不到 STRINGS 物件的範圍');
  const keysOf = (lang) => {
    const at = blocks[lang];
    const next = Object.values(blocks).filter((x) => x > at).sort((a, b) => a - b)[0] || objEnd;
    const body = src.slice(at, next);
    return new Set([...body.matchAll(/^\s{6}(\w+):/gm)].map((m) => m[1]));
  };
  const base = keysOf('zh-TW');
  assert.ok(base.size >= 20, `zh-TW 只抓到 ${base.size} 個 key，抽取方式可能壞了`);
  for (const lang of ['zh-CN', 'en']) {
    const other = keysOf(lang);
    const missing = [...base].filter((k) => !other.has(k));
    const extra = [...other].filter((k) => !base.has(k));
    assert.deepEqual(missing, [], `${lang} 少了 ${missing.join('、')}`);
    assert.deepEqual(extra, [], `${lang} 多了 ${extra.join('、')}`);
  }
});

test('三個語系的錯誤訊息也要成套', () => {
  const errorBlocks = [...src.matchAll(/errors:\s*\{([\s\S]*?)\n\s{6}\},/g)].map((m) =>
    new Set([...m[1].matchAll(/^\s{8}(\w+):/gm)].map((x) => x[1]))
  );
  assert.equal(errorBlocks.length, 3, `抓到 ${errorBlocks.length} 組錯誤訊息，應該是 3 組`);
  const [base, ...rest] = errorBlocks;
  assert.ok(base.size >= 8, `錯誤訊息只抓到 ${base.size} 個`);
  for (const other of rest) {
    assert.deepEqual([...base].filter((k) => !other.has(k)), []);
    assert.deepEqual([...other].filter((k) => !base.has(k)), []);
  }
});

test('三個語系的頁面都存在，en 與 zh-CN 的 js 是 symlink', () => {
  const DOCS = path.join(HERE, '..', 'docs');
  for (const lang of ['zh-TW', 'zh-CN', 'en']) {
    const page = path.join(DOCS, lang, 'utils', 'pdf-pages.md');
    assert.ok(fs.existsSync(page), `${lang} 缺 utils/pdf-pages.md`);
    const text = fs.readFileSync(page, 'utf8');
    assert.ok(text.includes('<div id="pdfpages-tool"></div>'), `${lang} 的頁面沒有容器`);
    assert.ok(text.includes('js/pdfpages.js'), `${lang} 的頁面沒有載入 pdfpages.js`);
    // pdf-lib 是動態載入的，頁面裡沒有 script 標籤，離線副本要靠 offline_assets
    assert.ok(
      /offline_assets:[\s\S]*utils\/vendor\/pdf-lib\.min\.js/.test(text),
      `${lang} 的 frontmatter 沒有把 pdf-lib 列進 offline_assets`
    );
  }
  for (const lang of ['en', 'zh-CN']) {
    const link = path.join(DOCS, lang, 'js', 'pdfpages.js');
    assert.ok(
      fs.lstatSync(link).isSymbolicLink() && fs.realpathSync(link) === fs.realpathSync(SRC),
      `${lang} 的 pdfpages.js 不是指向 zh-TW 的 symlink`
    );
  }
});

// await 是必要的，理由見 tools/test_utils_index_order.mjs 底部的註解
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
