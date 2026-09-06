#!/usr/bin/env node
/**
 * 三語系頁面裡的 <script src> 都要解析得到檔案。
 *
 * === 為什麼需要這支 ===
 *
 * docs/en/js/ 與 docs/zh-CN/js/ 是逐檔指向 zh-TW 的 symlink，新增一支 js 時要手動補兩個
 * 連結。漏了的話 zh-TW 正常、另兩個語系的頁面停在「程式沒有載入」，建置不報錯。
 * check_precache.mjs 把 js/ 當三語系共用資產只驗 zh-TW 那一份，也攔不到。
 * 2026-09-06 的 vault.js 就是這樣漏掉的。
 *
 * 這裡把每個語系的每個 .md 掃一遍，相對路徑的 script src 從那份 md 所在的目錄解析，
 * 檔案不在就紅。
 *
 * 用法：
 *   node tools/test_script_src.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const LANGS = ['zh-TW', 'zh-CN', 'en'];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield full;
  }
}

const missing = [];
let scanned = 0;
let refs = 0;
for (const lang of LANGS) {
  for (const md of walk(path.join(DOCS, lang))) {
    scanned += 1;
    const text = fs.readFileSync(md, 'utf8');
    for (const m of text.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) {
      const src = m[1];
      if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) continue; // 外部或絕對路徑不歸這裡管
      refs += 1;
      // 頁面建成 <dir>/<name>/index.html，相對路徑從那一層算，跟瀏覽器看到的一樣。
      // index.md 例外，它就是 <dir>/index.html，從 <dir> 算
      const name = path.basename(md, '.md');
      const pageDir = name === 'index' ? path.dirname(md) : path.join(path.dirname(md), name);
      const target = path.resolve(pageDir, src.split('?')[0]);
      if (!fs.existsSync(target)) missing.push(`${path.relative(DOCS, md)} → ${src}（${path.relative(DOCS, target)} 不存在）`);
    }
  }
}

if (missing.length) {
  console.log(`  ✗ ${missing.length} 個 script src 解析不到檔案：`);
  for (const line of missing) console.log(`    ${line}`);
  console.log(`\n0 通過，1 失敗`);
  process.exit(1);
}
console.log(`  ✓ ${LANGS.length} 個語系 ${scanned} 份 md 裡的 ${refs} 個 script src 都解析得到檔案`);
console.log(`\n1 通過，0 失敗`);
