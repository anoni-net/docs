#!/usr/bin/env node
/**
 * 檢查「Tor 中繼地球儀」的大洋環流主幹有沒有壓到陸地。
 *
 * atlas.js 的 CURRENTS 是手繪座標。環流大多沿著大陸邊緣走（黑潮貼著台灣東岸、本格拉
 * 貼著納米比亞、秘魯寒流貼著智利），離岸一兩度就會壓進陸地，而畫面上的補點間距是
 * 1.2 度，擦到岸的那幾度在螢幕上看不出來，只能靠這支抓。
 *
 * 做法：照 atlas.js 的畫法把每條線依經緯度線性內插到 0.4 度一點（比渲染細三倍），
 * 對 countries.json 的每個環做射線法 point-in-polygon。跟 fix_trunk_land.mjs 同一套。
 *
 * 跟 fix_trunk_land.mjs 的差別是這支只報告不修改。走廊線是大圓弧，中點往垂直方向推
 * 就會回到海上；環流是手繪的，要往哪邊推得看那條環流真正走在陸棚的哪一側，
 * 自動推很容易把黑潮推到台灣海峽那一側，方向就錯了。所以這支只告訴你哪一段有問題。
 *
 * 用法（沒有相依，讀 atlas.js 現有的 CURRENTS）：
 *   node tools/check_currents_land.mjs
 *
 * 全部通過時 exit 0，有壓到陸地時 exit 1，可以直接掛進 CI。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'docs/zh-TW/games/tor-network');

const src = fs.readFileSync(path.join(GAME, 'atlas.js'), 'utf8');
const m = src.match(/const CURRENTS = \[([\s\S]*?)\n\];/);
if (!m) { console.error('ERROR: atlas.js 裡找不到 CURRENTS'); process.exit(2); }
// 收尾的中括號要自己一行。CURRENTS 最後一筆後面跟著行註解，接在同一行會被註解吃掉。
const CURRENTS = eval('[' + m[1] + '\n]');

const world = JSON.parse(fs.readFileSync(path.join(GAME, 'countries.json'), 'utf8'));
// 先算每國的外接框。沒有這一層的話，兩萬個取樣點乘上所有國家的所有環會慢到不能用。
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

const STEP = 0.4;
let bad = 0;
CURRENTS.forEach((cur, ci) => {
  const hits = [];
  for (let i = 0; i + 1 < cur.p.length; i++) {
    const lat1 = cur.p[i][0], lon1 = cur.p[i][1];
    const dlat = cur.p[i + 1][0] - lat1;
    let dlon = cur.p[i + 1][1] - lon1;
    if (dlon > 180) dlon -= 360; else if (dlon < -180) dlon += 360;
    const cos = Math.cos((lat1 + lat1 + dlat) / 2 * Math.PI / 180);
    const steps = Math.max(1, Math.ceil(Math.hypot(dlat, dlon * cos) / STEP));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const lat = lat1 + dlat * t;
      let lon = lon1 + dlon * t;
      if (lon > 180) lon -= 360; else if (lon < -180) lon += 360;
      const cc = landAt(lat, lon);
      if (cc) hits.push(`第 ${i} 段 ${lat.toFixed(1)},${lon.toFixed(1)} 落在 ${cc}`);
    }
  }
  if (hits.length) {
    bad++;
    console.log(`✗ CURRENTS[${ci}]  ${hits.length} 個取樣點在陸上`);
    for (const h of hits.slice(0, 6)) console.log(`   ${h}`);
    if (hits.length > 6) console.log(`   …另外 ${hits.length - 6} 個`);
  }
});

if (bad) {
  console.log(`\n${bad}/${CURRENTS.length} 條需要修。座標在 atlas.js 的 CURRENTS，註解寫著各條的名字。`);
  process.exit(1);
}
console.log(`全部 ${CURRENTS.length} 條都在海上`);
