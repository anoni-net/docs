#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」的大洋環流有沒有畫到陸地上。
 *
 * atlas.js 的 CURRENTS 是手繪座標。環流大多沿著大陸邊緣走（黑潮貼著台灣東岸、本格拉
 * 貼著納米比亞、秘魯寒流貼著智利），離岸一兩度就會壓進陸地，而畫面上的補點間距是
 * CUR_STEP_DEG，擦到岸的那幾度在螢幕上看不出來，只能靠這支抓。
 *
 * === 驗的是緞帶，不是中心線 ===
 *
 * 這支的第一版只沿著中心線取樣，那是錯的：畫出去的是一條寬 CUR_WIDTH_DEG 的緞帶，
 * 中心線在海上不代表緞帶在海上。當時 23 條裡有 8 條的緞帶邊緣其實壓在陸地上，
 * 東澳暖流在半寬 30% 處就切進雪梨北邊的海岸，放大看得一清二楚，但工具回報全數通過。
 *
 * 現在的做法是照 buildCurrents 的算法把緞帶的邊緣頂點重建出來（切線與法線外積得到
 * side 方向，往兩側各推 halfW），沿著半寬取若干比例逐一判斷。參數全部從 atlas.js 讀，
 * 不要在這裡另外寫死一份，改了渲染參數這支要跟著變嚴或變鬆。
 *
 * 做法：point-in-polygon 用射線法對 countries.json 的每個環判斷，跟 fix_trunk_land.mjs
 * 同一套。只報告不自動修，往哪邊推得看那條環流走在陸棚的哪一側，自動推很容易把黑潮
 * 推到台灣海峽那一側，方向就錯了。
 *
 * 用法（沒有相依，讀 atlas.js 現有的 CURRENTS 與參數）：
 *   node tools/check_currents_land.mjs
 *
 * 另外會檢查有沒有兩條的端點重合。重合處的緞帶三角形會疊出一塊比較亮的區域，
 * 而且弧長各自從 0 起算，亮紋的相位在那裡會重來一次。這個只警告不擋。
 *
 * 全部通過時 exit 0，有壓到陸地時 exit 1，可以直接掛進 CI。
 * 輸入本身不合理（countries.json 少得離譜、CURRENTS 解析不到）時 exit 2，
 * 這是為了避免上游壞掉時這支安靜地回報「全部通過」，那種綠燈比紅燈危險。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'docs/zh-TW/games/tor-network');

const src = fs.readFileSync(path.join(GAME, 'atlas.js'), 'utf8');

// 用括號配對切出整個陣列，不要用 /\n\];/ 這種樣式去猜結尾。樣式的版本依賴
// 「收尾中括號自成一行」這個手寫慣例，有人把它接到別的東西後面就會安靜地切錯，
// 而切錯的後果是這支檢查的東西不完整卻照樣回報通過。
function extractArray(text, marker) {
  const at = text.indexOf(marker);
  if (at < 0) return null;
  const start = text.indexOf('[', at);
  if (start < 0) return null;
  let depth = 0, inStr = null, inLine = false, inBlock = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; i++; } continue; }
    if (inStr) { if (c === '\\') i++; else if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inLine = true; i++; continue; }
    if (c === '/' && n === '*') { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

const literal = extractArray(src, 'const CURRENTS =');
if (!literal) { console.error('ERROR: atlas.js 裡找不到（或切不出）CURRENTS'); process.exit(2); }
const CURRENTS = eval(literal);

// 渲染參數一律從 atlas.js 讀，這支跟畫面用的是同一組數字
function num(re, label) {
  const g = src.match(re);
  if (!g) { console.error(`ERROR: atlas.js 裡找不到 ${label}`); process.exit(2); }
  return Number(g[1]);
}
const R = num(/^const R = ([\d.]+);/m, 'R');
const CUR_H = num(/const CUR_H = ([\d.]+);/, 'CUR_H');
const STEP_DEG = num(/const CUR_STEP_DEG = ([\d.]+);/, 'CUR_STEP_DEG');
const WIDTH_DEG = num(/const CUR_WIDTH_DEG = ([\d.]+);/, 'CUR_WIDTH_DEG');

const world = JSON.parse(fs.readFileSync(path.join(GAME, 'countries.json'), 'utf8'));

// 輸入合理性。上游壞掉時要紅燈，不能因為「找不到陸地」就回報全部通過。
if (!Array.isArray(world.c) || world.c.length < 100) {
  console.error(`ERROR: countries.json 只有 ${world.c ? world.c.length : 0} 個國家，不像完整的底圖`);
  process.exit(2);
}
if (CURRENTS.length < 15) {
  console.error(`ERROR: 只解析到 ${CURRENTS.length} 條環流，不像完整的 CURRENTS`);
  process.exit(2);
}

// 先算每國的外接框。沒有這一層的話，取樣點乘上所有國家的所有環會慢到不能用。
const boxes = world.c.map((c) => {
  let lo0 = 999, lo1 = -999, la0 = 999, la1 = -999;
  for (const r of c.p) for (let i = 0; i < r.length; i += 2) {
    if (r[i] < lo0) lo0 = r[i]; if (r[i] > lo1) lo1 = r[i];
    if (r[i + 1] < la0) la0 = r[i + 1]; if (r[i + 1] > la1) la1 = r[i + 1];
  }
  return { c, lo0, lo1, la0, la1 };
});

function inRing(lon, lat, r) {
  let ins = false;
  for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) ins = !ins;
  }
  return ins;
}
function landAt(lat, lon) {
  for (const b of boxes) {
    if (lon < b.lo0 || lon > b.lo1 || lat < b.la0 || lat > b.la1) continue;
    for (const r of b.c.p) if (inRing(lon, lat, r)) return b.c.k || '??';
  }
  return null;
}

// 以下三個跟 atlas.js 的 llToVec 與 buildCurrents 對應，改那邊要改這裡
const V = (x, y, z) => ({ x, y, z });
const sub = (a, b) => V(a.x - b.x, a.y - b.y, a.z - b.z);
const cross = (a, b) => V(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const norm = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return V(a.x / l, a.y / l, a.z / l); };
function llToVec(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
function vecToLL(v) {
  const r = Math.hypot(v.x, v.y, v.z);
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, v.y / r))) * 180 / Math.PI;
  let lon = Math.atan2(v.z, -v.x) * 180 / Math.PI - 180;
  while (lon < -180) lon += 360;
  while (lon > 180) lon -= 360;
  return [lat, lon];
}

const halfW = R * (WIDTH_DEG / 2) * Math.PI / 180;
// 沿半寬取這幾個比例。中心線是 0，緞帶邊緣是 1。取樣點愈密愈慢，這個密度足以抓到
// 前面漏掉的那幾條（最嚴重的東澳暖流是在 30% 處撞到）。
const FRACS = [0.25, 0.4, 0.55, 0.7, 0.85, 1.0];

console.log(`緞帶寬 ${WIDTH_DEG}°（半寬 ${(WIDTH_DEG / 2).toFixed(2)}°）｜補點間距 ${STEP_DEG}°｜${CURRENTS.length} 條`);

// 端點重合的兩條會在接合處疊出一塊比較亮的三角形，而且 aU 各自從 0 起算，
// 亮紋的相位會在那裡重來一次。物理上連續的流請合成一筆。
const endpoints = new Map();
CURRENTS.forEach((cur, ci) => {
  for (const [label, q] of [['起', cur.p[0]], ['迄', cur.p[cur.p.length - 1]]]) {
    const k = q.join(',');
    if (!endpoints.has(k)) endpoints.set(k, []);
    endpoints.get(k).push(`CURRENTS[${ci}] ${label}`);
  }
});
let joins = 0;
for (const [k, who] of endpoints) {
  if (who.length > 1) {
    joins++;
    console.log(`⚠ 端點重合於 (${k})：${who.join(' / ')}　合成一筆可以避免接合處疊亮與相位重來`);
  }
}

let bad = 0;
CURRENTS.forEach((cur, ci) => {
  const pts = [];
  for (let i = 0; i + 1 < cur.p.length; i++) {
    const lat1 = cur.p[i][0], lon1 = cur.p[i][1];
    const dlat = cur.p[i + 1][0] - lat1;
    let dlon = cur.p[i + 1][1] - lon1;
    if (dlon > 180) dlon -= 360; else if (dlon < -180) dlon += 360; // 跨換日線走短的那邊
    const cs = Math.cos((lat1 + lat1 + dlat) / 2 * Math.PI / 180);
    const steps = Math.max(1, Math.ceil(Math.hypot(dlat, dlon * cs) / STEP_DEG));
    for (let k = (i ? 1 : 0); k <= steps; k++) {
      const t = k / steps;
      pts.push(llToVec(lat1 + dlat * t, lon1 + dlon * t, R * CUR_H));
    }
  }
  let worst = null, hits = 0, who = null, where = null;
  for (let i = 0; i < pts.length; i++) {
    // 切線取前後鄰點的差，端點退回單邊差分，跟 buildCurrents 一致
    const tan = norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]));
    const side = norm(cross(tan, norm(pts[i])));
    for (const f of FRACS) {
      for (const sgn of [1, -1]) {
        const d = halfW * f * sgn;
        const [la, lo] = vecToLL(V(pts[i].x + side.x * d, pts[i].y + side.y * d, pts[i].z + side.z * d));
        const k = landAt(la, lo);
        if (k) {
          hits++;
          if (worst === null || f < worst) { worst = f; who = k; where = [la, lo]; }
        }
      }
    }
  }
  if (worst !== null) {
    bad++;
    console.log(`✗ CURRENTS[${ci}]  ${hits} 個取樣點在陸上，最深處在半寬的 ${Math.round(worst * 100)}% 落在 ${who}`
      + `（${where[0].toFixed(1)},${where[1].toFixed(1)}）`);
  }
});

if (bad) {
  console.log(`\n${bad}/${CURRENTS.length} 條需要修。座標在 atlas.js 的 CURRENTS，註解寫著各條的名字。`);
  console.log('把該段的控制點往海側推，或把 CUR_WIDTH_DEG 調細。位移大到會改變地理位置時，寧可調細緞帶。');
  process.exit(1);
}
console.log(`全部 ${CURRENTS.length} 條的緞帶都在海上${joins ? `（另有 ${joins} 處端點重合，見上方警告）` : ''}`);
