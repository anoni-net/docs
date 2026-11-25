#!/usr/bin/env node
/**
 * 「指南」分頁的概念、工具、場景三區，nav 的分組要跟各自索引頁的小標題一致。
 *
 * === 為什麼需要這支 ===
 *
 * 2026-11-25 起這三區的側邊欄都分了組。桌面版的側邊欄會把這一層常駐展開，分組之前
 * 概念 13 篇加場景 16 篇整排攤開，「指南」一欄超過一個螢幕高。分組名稱跟索引頁的小
 * 標題是同一組字，讀者從側邊欄與從索引頁看到同一套分法。
 *
 * 兩邊不一致的時候沒有任何錯誤訊息。新增一篇要改 nav（三個設定檔）跟索引頁（三個語
 * 系），六個地方各自插入，插錯組或漏掉一邊都建得起來。做法照 test_utils_index_order.mjs
 * 那一支，順序與組別以 nav 為準。
 *
 * === 比對規則 ===
 *
 * 索引頁裡底下直接有 `./slug.md` 清單項目或卡片的 `##`、`###` 小標題算一組。只有說
 * 明文字、沒有清單的小標題（例如工具頁的「日常隱私基本功」，底下再分四個 ###）跳過。
 *
 * nav 裡不屬於任何分組的頁面（場景的「一般人平常該做到什麼」、工具的「什麼是匿名網
 * 路」）對應索引頁的第一組，那一組只有一兩篇，做成單頁分組反而難掃。
 *
 * en 的工具區是另一套分法（見 mkdocs_en.yml 的註解），不在這支的範圍。
 *
 * 用法：
 *   node tools/test_guides_nav_groups.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(HERE, '..', 'docs');
const CONFIGS = { 'zh-TW': 'mkdocs.yml', 'zh-CN': 'mkdocs_cn.yml', en: 'mkdocs_en.yml' };
const SECTIONS = [
  { key: 'NAV_BASICS', dir: 'basics', langs: ['zh-TW', 'zh-CN', 'en'] },
  { key: 'NAV_TOOLS', dir: 'tools', langs: ['zh-TW', 'zh-CN'] },
  { key: 'NAV_SCENARIOS', dir: 'scenarios', langs: ['zh-TW', 'zh-CN', 'en'] },
];

// nav 裡某一區，回傳 { loose: [slug], groups: [{ name, slugs }] }。用縮排界定範圍。
function navSection(configFile, key, dir) {
  const lines = fs.readFileSync(path.join(DOCS, configFile), 'utf8').split('\n');
  const start = lines.findIndex((l) => l.includes(`!ENV [${key},`));
  assert.ok(start >= 0, `${configFile} 找不到 ${key}`);
  const baseIndent = lines[start].search(/\S/);
  const pageRe = new RegExp(`^\\s+- ${dir}/([a-z0-9-]+)\\.md\\s*$`);

  const loose = [];
  const groups = [];
  let current = null;
  for (const line of lines.slice(start + 1)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.search(/\S/);
    if (indent <= baseIndent) break;
    if (current && indent <= current.indent) current = null;

    const page = line.match(pageRe);
    if (page) {
      if (page[1] === 'index') continue;
      (current ? current.slugs : loose).push(page[1]);
      continue;
    }
    const group = line.match(/^\s+- "(.+)":\s*$/);
    assert.ok(group, `${configFile} 的 ${key} 有認不得的一行：${line.trim()}`);
    current = { name: group[1], slugs: [], indent };
    groups.push(current);
  }
  return { loose, groups: groups.map(({ name, slugs }) => ({ name, slugs })) };
}

// 索引頁的分組：底下直接有 ./slug.md 項目的 ## 或 ### 小標題
function indexGroups(lang, dir) {
  const text = fs.readFileSync(path.join(DOCS, lang, dir, 'index.md'), 'utf8');
  const groups = [];
  let current = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^#{2,3} (.+?)\s*$/);
    if (h) {
      const name = h[1].replace(/^:[a-z0-9-]+:\s*/, '').replace(/\s*\{[^}]*\}$/, '').trim();
      current = { name, slugs: [] };
      groups.push(current);
      continue;
    }
    const item = line.match(/^- .*?\]\(\.\/([a-z0-9-]+)\.md\)/);
    if (item && current) current.slugs.push(item[1]);
  }
  return groups.filter((g) => g.slugs.length);
}

let checked = 0;
for (const { key, dir, langs } of SECTIONS) {
  for (const lang of langs) {
    const where = `${lang} ${dir}`;
    const nav = navSection(CONFIGS[lang], key, dir);
    const index = indexGroups(lang, dir);
    assert.ok(nav.groups.length >= 2, `${where}：nav 沒有分組`);

    let rest = index;
    if (nav.loose.length) {
      assert.deepEqual(index[0].slugs, nav.loose,
        `${where}：nav 分組外的頁面要對應索引頁的第一組「${index[0].name}」`);
      rest = index.slice(1);
    }
    assert.deepEqual(rest.map((g) => g.name), nav.groups.map((g) => g.name),
      `${where}：索引頁的小標題要跟 nav 的組名一致`);
    for (const [i, g] of nav.groups.entries()) {
      assert.deepEqual(rest[i].slugs, g.slugs, `${where}「${g.name}」：成員或順序跟 nav 不一致`);
    }

    // 每一頁都要在 nav 裡，避免新文章只加了索引頁
    const files = fs.readdirSync(path.join(DOCS, lang, dir))
      .filter((f) => f.endsWith('.md') && f !== 'index.md')
      .map((f) => f.replace(/\.md$/, ''));
    const inNav = new Set([...nav.loose, ...nav.groups.flatMap((g) => g.slugs)]);
    const orphan = files.filter((f) => !inNav.has(f));
    assert.deepEqual(orphan, [], `${where}：這些頁面不在 nav 裡`);
    checked += 1;
  }
}
console.log(`ok：${checked} 組 nav 與索引頁的分組一致`);
