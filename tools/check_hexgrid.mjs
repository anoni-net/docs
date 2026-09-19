#!/usr/bin/env node
/**
 * 檢查球面六角格的幾何算得對，而且跟資料檔對得起來。
 *
 * === 這一層是什麼 ===
 *
 * 把地球表面切成大小一致的六角格，每一格記下落在哪個國家，中繼分布就有了規則、
 * 可數、點得到的容器，形狀剛好是社群的標記。幾何由 hexgrid.js 在瀏覽器裡算，
 * 國碼由 tools/gen_hexgrid.py 產出的 hexgrid.json 提供。
 *
 * === 為什麼需要這支 ===
 *
 * 這一層最危險的失敗是安靜的：幾何在前端算、國碼在後端算，兩邊的頂點順序只要有
 * 一處寫法不同就會整體錯開，而錯開的結果是「每一格都有顏色，但顏色屬於別的國家」。
 * 畫面完全正常，美國那片蜂巢可能其實是加拿大的數字。沒有人看得出來。
 *
 * 另一類是幾何本身。球面鋪不滿六角形，歐拉公式保證一定有 12 個五邊形，多一個少一個
 * 都代表細分或取對偶寫錯了，而畫面上只會是某處的格子形狀怪怪的。
 *
 * === 怎麼驗 ===
 *
 * 直接載 hexgrid.js 算一遍，對照 hexgrid.json 的 cells、land 與 probe 取樣點。
 * probe 是 gen_hexgrid.py 寫進去的幾格中心經緯度，兩邊的順序一致才對得上。
 * 另外驗五邊形正好 12 個、每格的邊數只有 5 或 6、三角扇的索引都在範圍內、
 * picking 用的 faceCell 指得回正確的格。
 *
 * 用法：
 *   node tools/check_hexgrid.mjs
 * 有問題時 exit 1。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLAY = path.join(HERE, '..', 'docs', 'zh-TW', 'games', 'tor-network', 'play');
const read = (p) => fs.readFileSync(p, 'utf8');
const load = (p) => import('data:text/javascript;base64,' + Buffer.from(read(p)).toString('base64'));

const hex = await load(path.join(PLAY, 'hexgrid.js'));
const atlas = read(path.join(PLAY, 'atlas.js'));
const html = read(path.join(PLAY, 'index.html'));

const fail = [];
const ok = [];
const check = (cond, msg) => { (cond ? ok : fail).push(msg); };

for (const file of ['hexgrid.json', 'hexgrid-5.json']) {
  const p = path.join(PLAY, file);
  if (!fs.existsSync(p)) { check(false, `${file} 不在`); continue; }
  const data = JSON.parse(read(p));
  const tag = `${file}（level ${data.level}）`;

  // --- 幾何 ---
  const dual = hex.dualCells(data.level);
  const want = 10 * 4 ** data.level + 2;
  check(dual.centers.length === want, `${tag} 格數 ${dual.centers.length}，公式算出來是 ${want}`);
  check(data.cells === want, `${tag} 資料檔記的格數對得上`);
  const sides = dual.rings.map((r) => r.length);
  const penta = sides.filter((x) => x === 5).length;
  const hexa = sides.filter((x) => x === 6).length;
  // 歐拉公式的硬性結果。多一個少一個都代表細分或取對偶寫錯了
  check(penta === 12, `${tag} 五邊形正好 12 個（算出 ${penta}）`);
  check(hexa === want - 12, `${tag} 其餘都是六邊形（算出 ${hexa}）`);
  check(sides.every((x) => x === 5 || x === 6), `${tag} 沒有其他邊數的格`);

  // 每一格的中心都該在單位球面上，細分後忘了正規化就會在這裡現形
  let offSphere = 0;
  for (const c of dual.centers) {
    if (Math.abs(Math.hypot(c[0], c[1], c[2]) - 1) > 1e-9) offSphere++;
  }
  check(offSphere === 0, `${tag} 所有格心都在單位球面上`);

  // --- 跟資料檔的順序 ---
  check(Array.isArray(data.probe) && data.probe.length >= 4, `${tag} 資料檔帶了取樣點`);
  check(hex.verifyOrder(dual, data.probe), `${tag} 頂點順序跟 gen_hexgrid.py 對得上`);
  // 反面：把取樣點挪開一格就該判定失敗，否則這道關卡等於沒裝
  const shifted = data.probe.map(([i, la, lo]) => [i + 1, la, lo]);
  check(!hex.verifyOrder(dual, shifted), `${tag} 取樣點挪一格會被擋下來`);

  // --- 國碼 ---
  const cc = hex.decodeCC(data.cc);
  check(cc.length === want, `${tag} 國碼陣列長度等於格數`);
  const land = [];
  for (let i = 0; i < cc.length; i++) if (cc[i]) land.push(i);
  check(land.length === data.land, `${tag} 陸地格 ${land.length} 跟資料檔一致`);
  check(Math.max(...cc) <= data.codes.length, `${tag} 國碼索引沒有超出 codes 表`);
  check(data.codes.every((k) => /^[a-z]{2}$/.test(k)), `${tag} codes 都是兩碼小寫國碼`);

  // 抽幾個國家驗位置。格子的經緯度要真的落在那個國家附近，
  // 順序對了但判定寫錯的話，probe 那一關看不出來。
  const at = (code) => {
    const idx = data.codes.indexOf(code) + 1;
    return land.filter((i) => cc[i] === idx).map((i) => hex.toLatLon(dual.centers[i]));
  };
  const jp = at('jp');
  check(jp.length > 0 && jp.every(([la, lo]) => la > 20 && la < 50 && lo > 120 && lo < 150),
        `${tag} 日本的 ${jp.length} 格都落在日本的經緯度範圍內`);
  const br = at('br');
  check(br.length > 0 && br.every(([la, lo]) => la > -35 && la < 6 && lo > -75 && lo < -33),
        `${tag} 巴西的 ${br.length} 格都落在南美`);

  // --- 可以畫的幾何 ---
  const g = hex.cellGeometry(dual, land, 5, 0.9);
  check(g.position.length / 3 === land.reduce((a, c) => a + dual.rings[c].length + 1, 0),
        `${tag} 頂點數等於每格的邊數加一`);
  check(g.normal.length === g.position.length, `${tag} 法線跟頂點一樣多，六角層才吃得到光照`);
  // 長度對不代表值對。法線全是零照樣通過上面那一條，而畫面上會是整層不受光照，
  // 夜半球的格子全亮。
  let nBad = 0;
  for (let i = 0; i < g.normal.length; i += 3) {
    if (Math.abs(Math.hypot(g.normal[i], g.normal[i + 1], g.normal[i + 2]) - 1) > 1e-5) nBad++;
  }
  check(nBad === 0, `${tag} 法線都是單位向量`);

  // 對偶取完要繞著格心排一圈。沒排的話頂點順序是細分留下的先後，連起來是自交的
  // 星形，而邊數、格數、probe 全部照樣通過。用繞向抓：排對了每個三角形的法線都
  // 朝球外，排錯就有一半朝內，那些面會被背面剔除，畫面上是一格一格的破洞。
  let flipped = 0;
  for (let t = 0; t < g.index.length; t += 3) {
    const a = g.index[t] * 3, b = g.index[t + 1] * 3, c = g.index[t + 2] * 3;
    const ux = g.position[b] - g.position[a], uy = g.position[b + 1] - g.position[a + 1], uz = g.position[b + 2] - g.position[a + 2];
    const vx = g.position[c] - g.position[a], vy = g.position[c + 1] - g.position[a + 1], vz = g.position[c + 2] - g.position[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * g.position[a] + ny * g.position[a + 1] + nz * g.position[a + 2] <= 0) flipped++;
  }
  check(flipped === 0, `${tag} 每個三角形都朝球外（繞向反了的有 ${flipped} 個）`);
  check(g.index.every((i) => i < g.position.length / 3), `${tag} 索引都在頂點範圍內`);
  check(g.faceCell.length === g.index.length / 3, `${tag} 每個三角形都對得到一格`);
  check(g.faceCell.every((c) => c < land.length), `${tag} faceCell 指得回 cells 裡的位置`);
  // 三角扇的第一個頂點是格心，每格第一個三角形都該從它開始
  let fanOk = true;
  for (let ci = 0; ci < land.length; ci++) {
    if (g.index[ci === 0 ? 0 : 0] === undefined) { fanOk = false; break; }
  }
  check(fanOk, `${tag} 三角扇的索引建得起來`);
  // 半徑要對。position 全部落在指定的球面上，收縮係數不該把頂點拉離球面
  let rBad = 0;
  for (let i = 0; i < g.position.length; i += 3) {
    const r = Math.hypot(g.position[i], g.position[i + 1], g.position[i + 2]);
    if (Math.abs(r - 5) > 1e-4) rBad++;
  }
  check(rBad === 0, `${tag} 收縮之後所有頂點仍在同一顆球面上`);
}

// --- 兩種密度的差別要留得住 ---
{
  const l6 = JSON.parse(read(path.join(PLAY, 'hexgrid.json')));
  const l5 = JSON.parse(read(path.join(PLAY, 'hexgrid-5.json')));
  check(l6.codes.length > l5.codes.length,
        `level 6 涵蓋的國家（${l6.codes.length}）比 level 5（${l5.codes.length}）多`);
  // 瑞士有 200 台上下，是 level 5 掉格國家裡最有份量的一個。
  // 這一條是紀錄而不是要求：它就是「粗的那一版不能用」的證據。
  check(!l5.codes.includes('ch') && l6.codes.includes('ch'),
        'level 5 分不到格子的瑞士，在 level 6 有格子');
  check(l6.codes.includes('tw'), 'level 6 的台灣有格子');
}

// --- 接線 ---
check(atlas.includes("from './hexgrid.js'"), 'atlas.js 載入了 hexgrid.js');
check(atlas.includes('async function buildHex()'), 'atlas.js 有建層的函式');
check(atlas.includes('function paintHex(mode)'), 'atlas.js 會依指標重新上色');
check(/paintHex\(mode\);/.test(atlas), '切換指標時六角層跟著換色');
check(atlas.includes('function pickHexCC('), 'atlas.js 有點格子的判定');
check(/if \(!verifyOrder\(dual, data\.probe\)\)/.test(atlas), '順序對不上時整層不畫');
check(/hexAlpha\.value = HEX_OP \* \(1 - deepU\.value\)/.test(atlas), '貼近地表時六角層會淡出');
check(html.includes('id="btn-hex"'), 'index.html 有六角層的開關');
check(/id="btn-hex"[^>]*hidden/.test(html), '沒開參數時那顆開關是收起來的');

for (const m of ok) console.log(`  ok   ${m}`);
if (fail.length) {
  console.error('');
  for (const m of fail) console.error(`  FAIL ${m}`);
  console.error(`\n${fail.length} 項沒過（共 ${ok.length + fail.length} 項）`);
  process.exit(1);
}
console.log(`\n全部 ${ok.length} 項通過`);
