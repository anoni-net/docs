#!/usr/bin/env node
/**
 * 全站隱形字元掃描。規則取自 docs/zh-TW/js/invisible.js。
 *
 * === 為什麼需要這支 ===
 *
 * 站上有一頁教讀者怎麼找出文字裡看不見的字元（docs/zh-TW/utils/invisible.md），
 * 而這個 repo 自己的內容一直沒有任何東西擋這類字元進來。2026-08 掃過一次，三處有：
 *
 *   - docs/zh-TW/blog/posts/2025to2026.md 兩個段落的行尾各有兩個不斷行空白。
 *     原本想寫的應該是 Markdown 硬換行的兩個半形空格，貼進來的卻是 U+00A0，
 *     <br> 不會產生，HTML 裡反而留下兩個不可斷行的空白
 *   - docs/zh-TW/games/tor-network/play/tw-energy.json 的地址欄位有一個零寬空格，
 *     從政府開放資料的 CSV 直接帶進來，而 str.strip() 不把它當空白
 *   - tools/test_invisible.mjs 自己的常數放的是裸字元，跟同一個檔案寫的紀律相反
 *
 * 三處都是肉眼看不出來、code review 也看不出來的。零寬字元組合是文件外流追蹤的
 * 實際手法，方向控制字元讓人看到的順序跟編譯器讀到的不一樣（Trojan Source）。
 * 這類字元出現在 repo 裡，最好的情況是雜訊，最壞的情況是有人放進來的。
 *
 * === 怎麼判斷 ===
 *
 * 把 invisible.js 的 scan() 原地抽出來執行，判斷跟站上工具一模一樣，不重寫一份。
 * 誤判的處理也就一併繼承：emoji 家族中間的 ZWJ 是組字元件，變體選擇器接在 emoji
 * 後面是正常的，RTL 標記在有 RTL 文字的段落裡本來就該有。
 *
 * 同形字（西里爾文的 а 冒充拉丁文的 a）不報。那是看得見的字元，而 utils/invisible.md
 * 三個語系都拿 аpple.com 當釣魚示範，報下去這支會變成狼來了。
 *
 * 不斷行空白（U+00A0）只在 Markdown 檢查。drawio 匯出的 SVG 與 JS 字串裡有正當用途，
 * 出現在 Markdown 正文則一律是貼上帶進來的。
 *
 * 分兩級。suspect 擋 CI，context 只提醒：後者是「要看前後才知道」的那些，
 * 例如整段有 RTL 文字時的方向標記，改法要看語境，機器不宜代勞。
 *
 * 要在原始碼裡表示這些字元時，一律用跳脫寫法（'\u200B'）。直接放字元的話，任何一次
 * 複製貼上或編輯器清理都可能把它們吃掉，而吃掉之後那段程式看起來完全正常。
 *
 * 用法：
 *   node tools/check_invisible_chars.mjs                    掃全站
 *   node tools/check_invisible_chars.mjs docs/zh-TW         只掃指定路徑
 *   node tools/check_invisible_chars.mjs --format github    輸出 CI annotation
 * 找到 suspect 級就 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const SRC = path.join(ROOT, 'docs', 'zh-TW', 'js', 'invisible.js');

// 偵測邏輯原地抽出，跟 tools/test_invisible.mjs 同一個做法。HOMOGLYPHS 用不到結果，
// 但 scan 會參照它，少了就是 ReferenceError。
const src = fs.readFileSync(SRC, 'utf8');
const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`invisible.js 裡找不到 ${re}`);
  return m[0];
};
const { scan } = new Function(`
  ${grab(/^  const HIDDEN = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const BIDI = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  const HOMOGLYPHS = \{[\s\S]*?\n  \};/m)}
  ${grab(/^  function isEmojiLike\(code\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  function scan\(text\) \{[\s\S]*?\n  \}/m)}
  return { scan };
`)();

const NBSP = '\u00A0';

// site 與 output 是從 source 建出來的，source 乾淨就夠。其餘是第三方相依與快取。
const SKIP_DIR = new Set(['.git', 'node_modules', '.venv', '__pycache__',
                          'site', 'output', 'anoni-net-docs-ipfs']);
const EXT = new Set(['.md', '.markdown', '.txt', '.js', '.mjs', '.json', '.yml', '.yaml',
                     '.html', '.css', '.py', '.sh', '.toml', '.csv', '.svg']);

// 便宜的預篩，絕大多數檔案在這裡就跳過。命中的才交給 scan 做語境判斷。
const MAYBE = /[\u00AD\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFE00-\uFE0F\uFEFF]|[\u{E0000}-\u{E007F}]/u;

const KIND_ZH = {
  zwsp: '零寬空格', zwnj: '零寬不連字', zwj: '零寬連字', wordjoiner: '單字連接符',
  bom: 'BOM', softhyphen: '軟連字號', mvs: '蒙古母音分隔符', invisibletimes: '隱形乘號',
  invisibleseparator: '隱形分隔符', invisibleplus: '隱形加號',
  lre: '左至右嵌入', rle: '右至左嵌入', pdf: '方向格式終止', lro: '左至右覆寫',
  rlo: '右至左覆寫', lri: '左至右隔離', rli: '右至左隔離', fsi: '首字方向隔離',
  pdi: '方向隔離終止', lrm: '左至右標記', rlm: '右至左標記',
  variation: '變體選擇器', tag: '標籤字元', nbsp: '不斷行空白',
};

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    // pulse/data 這類讀不到的目錄不該讓整支掛掉
    if (err.code === 'EACCES' || err.code === 'EPERM') return out;
    throw err;
  }
  for (const e of entries) {
    // 三個語系的 js 與 utils 資產是指回 zh-TW 的 symlink，掃一次就好
    if (e.isSymbolicLink()) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIR.has(e.name)) walk(p, out);
    } else if (EXT.has(path.extname(e.name))) {
      out.push(p);
    }
  }
  return out;
}

// code point 序的索引換算成行與欄。用 Array.from 的元素數，報出來的位置對得上
// 讀者在編輯器裡看到的字，一個 emoji 不會被算成兩格。
function positions(chars) {
  const at = [];
  let line = 1;
  let col = 1;
  for (const ch of chars) {
    at.push([line, col]);
    if (ch === '\n') {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return at;
}

const argv = process.argv.slice(2);
let format = 'text';
const targets = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--format') {
    format = argv[i + 1] || 'text';
    i += 1;
    continue;
  }
  targets.push(argv[i]);
}

const files = [];
for (const t of (targets.length ? targets : [ROOT])) {
  const abs = path.resolve(t);
  if (fs.statSync(abs).isDirectory()) walk(abs, files);
  else files.push(abs);
}

const findings = [];
let scanned = 0;

for (const file of files) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  scanned += 1;
  const isMarkdown = path.extname(file) === '.md' || path.extname(file) === '.markdown';
  if (!MAYBE.test(text) && !(isMarkdown && text.includes(NBSP))) continue;

  const chars = Array.from(text);
  const at = positions(chars);
  const rel = path.relative(ROOT, file);

  for (const f of scan(text)) {
    if (f.kind === 'homoglyph') continue;
    const [line, col] = at[f.index];
    findings.push({ rel, line, col, kind: f.kind, level: f.level });
  }
  if (isMarkdown) {
    for (let i = 0; i < chars.length; i += 1) {
      if (chars[i] !== NBSP) continue;
      const [line, col] = at[i];
      findings.push({ rel, line, col, kind: 'nbsp', level: 'suspect' });
    }
  }
}

findings.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line || a.col - b.col);
const suspect = findings.filter((f) => f.level === 'suspect');
const context = findings.filter((f) => f.level === 'context');
const label = (f) => `${KIND_ZH[f.kind] || f.kind}（${f.kind}）`;

if (format === 'github') {
  for (const f of suspect) {
    console.log(`::error file=${f.rel},line=${f.line},col=${f.col}::${label(f)}。`
      + '原始碼裡要表示這個字元請改用跳脫寫法，內容與資料裡請直接清掉。');
  }
  for (const f of context) {
    console.log(`::warning file=${f.rel},line=${f.line},col=${f.col}::${label(f)}。`
      + '這個要看前後才知道正不正常，人工確認一下。');
  }
}

if (context.length) {
  console.log(`\n${context.length} 處要看語境（不擋）：`);
  for (const f of context.slice(0, 20)) {
    console.log(`  ${f.rel}:${f.line}:${f.col}  ${label(f)}`);
  }
  if (context.length > 20) console.log(`  ⋯ 另有 ${context.length - 20} 處`);
}

if (!suspect.length) {
  console.log(`\n掃描 ${scanned} 個檔案，沒有可疑的隱形字元。`);
  process.exit(0);
}

console.error(`\n✗ ${suspect.length} 處隱形字元：`);
for (const f of suspect.slice(0, 40)) {
  console.error(`  ${f.rel}:${f.line}:${f.col}  ${label(f)}`);
}
if (suspect.length > 40) console.error(`  ⋯ 另有 ${suspect.length - 40} 處`);
console.error('\n這些字元在編輯器與 code review 裡都看不出來。零寬字元組合是文件外流追蹤的');
console.error('實際手法，方向控制字元會讓人看到的順序跟程式讀到的不一樣。');
console.error('原始碼裡要表示這些字元請改用跳脫寫法，內容與資料裡請直接清掉。');
process.exit(1);
