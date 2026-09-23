#!/usr/bin/env node
/**
 * 地球儀各國一級行政區的資料檢查。
 *
 * 產生器是 tools/gen_admin1.py，這支驗它的產物。幾種漏法畫面上都不會報錯：
 *
 *   索引有、檔案沒有        貼近那一國什麼都沒出現，看起來像那一國沒有行政區
 *   預快取漏收              線上正常，離線的工作坊現場貼近那一國什麼都沒有
 *   爭議島嶼被畫進去        地球儀替主權爭議表態了，而且沒有人會察覺
 *   香港的海上界線沒裁掉    海面上多出幾十公里長的直線，看起來像海上國界
 *   正體欄位是簡體字        Natural Earth 的 name_zh 是簡體，拿錯欄位就混進正體介面
 *
 * 只畫內部界線這個設計讓孤立的爭議島嶼天然不會出現（見產生器檔頭），這裡把它釘住：
 * 那幾座島附近不能有任何一個界線的點。哪天有人改成畫整圈外框，這一項會先紅。
 *
 * 不需要瀏覽器，執行不到一秒。
 *
 * 用法：node tools/check_admin1.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYERS } from '../docs/zh-TW/games/tor-network/play/layers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAY = path.join(ROOT, 'docs/zh-TW/games/tor-network/play');
const SW = fs.readFileSync(path.join(ROOT, 'docs/zh-TW/sw.js'), 'utf8');
const ok = [], fail = [];
const check = (c, m) => (c ? ok : fail).push(m);

const index = JSON.parse(fs.readFileSync(path.join(PLAY, 'admin1/index.json'), 'utf8'));
check(Array.isArray(index.countries) && index.countries.length > 0, `索引列了 ${index.countries.length} 國`);
check(SW.includes('"games/tor-network/play/admin1/index.json"'), '索引在 sw.js 的預快取清單裡');

// 主權有爭議的孤立島嶼。這幾處附近 0.15 度內不能有任何界線的點
const DISPUTED = [
  ['竹島／獨島', 131.87, 37.24],
  ['釣魚台列嶼', 123.52, 25.75],
  ['擇捉島', 148.0, 45.0],
  ['國後島', 145.9, 44.05],
  ['齒舞群島', 146.0, 43.4],
  ['色丹島', 146.75, 43.8],
  // 南海。各國的一級行政區都沒有把它們跟本土接起來，內部界線不會經過這裡
  ['南沙太平島', 114.36, 10.38],
  ['西沙永興島', 112.34, 16.83],
  ['黃岩島', 117.76, 15.15],
];

// 香港的陸地輪廓，拿來驗海上的界線裁乾淨了沒有
const world = JSON.parse(fs.readFileSync(path.join(PLAY, 'countries.json'), 'utf8'));
const ringsOf = (k) => world.c.filter((c) => c.k === k).flatMap((c) => c.p);
const inside = (x, y, ring) => {
  let c = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const x1 = ring[i], y1 = ring[i + 1], x2 = ring[j], y2 = ring[j + 1];
    if ((y1 > y) !== (y2 > y) && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1) c = !c;
  }
  return c;
};

for (const c of index.countries) {
  // 指向另一層的那幾筆（台灣的縣市界）。那一份畫的是整圈外框，因為它同時是台灣的
  // 海岸線，所以不套下面「只有內部界線」的檢查，只驗接線：那一層存在、是自動層、
  // 資料檔在預快取裡，範圍沒有大到蓋住南海
  if (c.layer) {
    const l = LAYERS.find((x) => x.id === c.layer);
    check(!!l, `${c.cc}：索引指到 ${c.layer} 這一層，清單上有它`);
    if (!l) continue;
    check(l.auto === true, `${c.cc}：${c.layer} 是自動層，圖層清單上不給按鈕`);
    check(fs.existsSync(path.join(PLAY, l.file)) && SW.includes(`"games/tor-network/play/${l.file}"`),
          `${c.cc}：${l.file} 在，也在 sw.js 的預快取清單裡`);
    const [x0, y0, x1, y1] = c.bbox;
    check(x1 - x0 < 8 && y1 - y0 < 8, `${c.cc}：範圍 ${(x1 - x0).toFixed(1)}° × ${(y1 - y0).toFixed(1)}°，沒有把南海的島礁算進去`);
    continue;
  }
  const file = path.join(PLAY, c.file);
  if (!fs.existsSync(file)) { fail.push(`${c.cc}：索引指到 ${c.file}，檔案不存在`); continue; }
  check(SW.includes(`"games/tor-network/play/${c.file}"`), `${c.cc}：${c.file} 在 sw.js 的預快取清單裡`);
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  check(d.source && d.sourceUrl && d.license && d.licenseUrl, `${c.cc}：檔案自帶來源與授權`);
  check(d.regions.length === c.n, `${c.cc}：${d.regions.length} 個行政區，跟索引記的 ${c.n} 一致`);
  const pts = d.lines.flatMap((ln) => ln.map((v, i) => (i % 2 ? null : [v, ln[i + 1]])).filter(Boolean));
  check(d.lines.length > 0 && pts.length > 0, `${c.cc}：${d.lines.length} 條界線、${pts.length} 個點`);
  const [x0, y0, x1, y1] = c.bbox;
  const out = pts.filter(([x, y]) => x < x0 - 1e-3 || x > x1 + 1e-3 || y < y0 - 1e-3 || y > y1 + 1e-3);
  check(out.length === 0, `${c.cc}：每個點都落在索引記的範圍裡（範圍外 ${out.length} 點）`);
  check(c.r > 0 && c.r < 10, `${c.cc}：典型行政區 ${c.r} 度`);
  for (const [nm, lon, lat] of DISPUTED) {
    const near = pts.filter(([x, y]) => Math.hypot(x - lon, y - lat) < 0.15).length;
    if (near) fail.push(`${c.cc}：${nm}附近有 ${near} 個界線的點，爭議島嶼被畫進去了`);
  }
  // 正體欄位不能是簡體。挑幾個只會出現在簡體裡的字
  const simp = d.regions.filter((r) => /[县区东冈广庆冲钏岛兴]/.test(r.zh)).map((r) => r.zh);
  check(simp.length === 0, `${c.cc}：正體中文的區名沒有簡體字${simp.length ? `（${simp.slice(0, 4).join('、')}）` : ''}`);
}
{
  const nears = DISPUTED.map(([nm]) => nm).join('、');
  if (!fail.some((m) => m.includes('爭議島嶼'))) ok.push(`${nears}附近都沒有界線`);
}

// 香港的區界含海域，產生器裁到陸地上。抽每一段的中點，落在陸地外的比例要很低。
// 不要求零：裁切用的陸地輪廓簡化到約 330 公尺，貼著海岸的那幾段中點會稍微出界
{
  const hk = JSON.parse(fs.readFileSync(path.join(PLAY, 'admin1/hk.json'), 'utf8'));
  const land = ringsOf('hk');
  let n = 0, sea = 0, cross = 0;
  for (const ln of hk.lines) {
    for (let i = 0; i + 3 < ln.length; i += 2) {
      const mx = (ln[i] + ln[i + 2]) / 2, my = (ln[i + 1] + ln[i + 3]) / 2;
      n++;
      if (!land.some((r) => inside(mx, my, r))) sea++;
      // 長度不是判準：香港有幾條區界本來就是沿著緯線的直線，最長一段 4.4 公里，整段
      // 都在陸地上。要抓的是橫越海面的那種，一公里以上的段取 21 個點，過半在海上就算
      const km = Math.hypot(ln[i + 2] - ln[i], ln[i + 3] - ln[i + 1]) * 111;
      if (km > 1) {
        let wet = 0;
        for (let t = 0; t <= 20; t++) {
          const x = ln[i] + (ln[i + 2] - ln[i]) * t / 20, y = ln[i + 1] + (ln[i + 3] - ln[i + 1]) * t / 20;
          if (!land.some((r) => inside(x, y, r))) wet++;
        }
        if (wet > 10) cross++;
      }
    }
  }
  check(sea / n < 0.05, `香港：界線各段的中點落在海上的佔 ${(sea / n * 100).toFixed(1)}%（原資料含海域，沒裁的話是一大截）`);
  check(cross === 0, `香港：沒有橫越海面的長直線（一公里以上、過半在海上的段 ${cross} 條）`);
}

for (const m of ok) console.log(`  ok   ${m}`);
if (fail.length) {
  for (const m of fail) console.error(`  FAIL ${m}`);
  console.error(`\n${fail.length} 項沒過（共 ${ok.length + fail.length} 項）`);
  process.exit(1);
}
console.log(`\n全部 ${ok.length} 項通過`);
