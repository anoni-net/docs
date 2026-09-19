#!/usr/bin/env node
/**
 * 檢查球面六角格的幾何算得對，而且跟資料檔對得起來。
 *
 * === 這一層是什麼 ===
 *
 * 把地球表面切成大小一致的六角格，當作地圖的最小呈現單位，資料點疊在上面。
 * 放大之後換更細的一級，讓格子在螢幕上維持三十幾個像素。幾何由 hexgrid.js 在
 * 瀏覽器裡算，國碼由 tools/gen_hexgrid.py 產出的 hexgrid-<level>.json 提供。
 *
 * === 為什麼需要這支 ===
 *
 * 這一層最危險的失敗是安靜的：幾何在前端算、國碼在後端算，兩邊的頂點順序只要有
 * 一處寫法不同就會整體錯開，而錯開的結果是「每一格都有顏色，但顏色屬於別的國家」。
 * 畫面完全正常，美國那片蜂巢可能其實是加拿大的數字。沒有人看得出來。
 *
 * 實際發生過一次：toLatLon 的經度寫成 atan2(x, z)，正確的是 atan2(-z, x)，算出來
 * 整整多 90 度。產生器與前端共用同一個錯式子，所以格數、五邊形數量、probe 取樣點
 * 全部自洽地通過，台灣本島所在的那一格卻被判成海。自己跟自己比對不出座標慣例的錯，
 * 一定要拿 atlas.js 的 llToVec 來回跑一次。
 *
 * 另一類是幾何本身。球面鋪不滿六角形，歐拉公式保證一定有 12 個五邊形，多一個少
 * 一個都代表細分或取對偶寫錯了，而畫面上只會是某處的格子形狀怪怪的。
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

/** 從 atlas.js 原地抽一支函式出來，免得這裡自己抄一份然後跟本體漂走 */
function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`atlas.js 裡找不到 ${header}`);
  let depth = 0, started = false;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { depth++; started = true; }
    else if (src[j] === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1); }
  }
  throw new Error(`${header} 的大括號沒有配對成功`);
}
// 地球上每一個東西的位置都是這支算出來的：中繼點、國家標籤、海纜、電廠。
// 六角格要跟它們對得起來，唯一的判準就是 cellLatLon 是它的反函數。
const llToVecRaw = new Function(`${extractFn(atlas, 'function llToVec(')}; return llToVec;`)();
const llToVec = (lat, lon, r = 1) => {
  const out = { set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } };
  llToVecRaw(lat, lon, r, out);
  return [out.x, out.y, out.z];
};

const fail = [];
const ok = [];
const check = (cond, msg) => { (cond ? ok : fail).push(msg); };

const LEVELS = [5, 6, 7, 8];
const loaded = new Map();

for (const lv of LEVELS) {
  const file = `hexgrid-${lv}.json`;
  const p = path.join(PLAY, file);
  if (!fs.existsSync(p)) { check(false, `${file} 不在`); continue; }
  const data = JSON.parse(read(p));
  const tag = `level ${lv}`;
  loaded.set(lv, data);

  // --- 幾何 ---
  const dual = hex.dualCells(lv);
  const want = 10 * 4 ** lv + 2;
  check(dual.nc === want, `${tag} 格數 ${dual.nc}，公式算出來是 ${want}`);
  check(data.cells === want, `${tag} 資料檔記的格數對得上`);
  let penta = 0, hexa = 0, other = 0;
  for (let i = 0; i < dual.nc; i++) {
    const n = dual.ringOff[i + 1] - dual.ringOff[i];
    if (n === 5) penta++; else if (n === 6) hexa++; else other++;
  }
  // 歐拉公式的硬性結果。多一個少一個都代表細分或取對偶寫錯了
  check(penta === 12, `${tag} 五邊形正好 12 個（算出 ${penta}）`);
  check(hexa === want - 12 && other === 0, `${tag} 其餘都是六邊形（算出 ${hexa}，其他邊數 ${other}）`);

  // 每一格的中心都該在單位球面上，細分後忘了正規化就會在這裡現形
  let offSphere = 0;
  for (let i = 0; i < dual.nc; i++) {
    const c = dual.centers;
    if (Math.abs(Math.hypot(c[i * 3], c[i * 3 + 1], c[i * 3 + 2]) - 1) > 1e-9) offSphere++;
  }
  check(offSphere === 0, `${tag} 所有格心都在單位球面上`);

  // --- 跟資料檔的順序 ---
  check(Array.isArray(data.probe) && data.probe.length >= 4, `${tag} 資料檔帶了取樣點`);
  check(hex.verifyOrder(dual, data.probe), `${tag} 頂點順序跟 gen_hexgrid.py 對得上`);
  // 反面：把取樣點挪開一格就該判定失敗，否則這道關卡等於沒裝
  check(!hex.verifyOrder(dual, data.probe.map(([i, la, lo]) => [i + 1, la, lo])),
        `${tag} 取樣點挪一格會被擋下來`);

  // --- 座標慣例 ---
  // 六角格畫在球上的位置是 centers 直接乘半徑，而球上其他東西全部由 llToVec 定位。
  // 兩套慣例必須互逆，這是唯一抓得到「兩邊共用同一個錯式子」的檢查。
  let rt = 0;
  const step = Math.max(1, Math.floor(dual.nc / 500));
  for (let i = 0; i < dual.nc; i += step) {
    const [la, lo] = hex.cellLatLon(dual, i);
    const back = llToVec(la, lo, 1);
    const c = dual.centers;
    if (Math.hypot(c[i * 3] - back[0], c[i * 3 + 1] - back[1], c[i * 3 + 2] - back[2]) > 1e-9) rt++;
  }
  check(rt === 0, `${tag} 格心的座標跟 atlas.js 的 llToVec 互逆（抽驗 500 格，不合的 ${rt} 個）`);

  // --- 國碼 ---
  const cc = hex.decodeCC(data.cc);
  check(cc.length === want, `${tag} 國碼陣列長度等於格數`);
  const land = [];
  for (let i = 0; i < cc.length; i++) if (cc[i]) land.push(i);
  check(land.length === data.land, `${tag} 陸地格 ${land.length} 跟資料檔一致`);
  // 不用 Math.max(...cc)。level 8 有 655,362 個元素，展開成參數會把呼叫堆疊撐爆。
  let maxCode = 0;
  for (const x of cc) if (x > maxCode) maxCode = x;
  check(maxCode <= data.codes.length, `${tag} 國碼索引沒有超出 codes 表`);
  check(data.codes.every((k) => /^[a-z]{2}$/.test(k)), `${tag} codes 都是兩碼小寫國碼`);

  // 拿真實地點反過來問：這個經緯度所在的那一格被判成哪一國。
  // 上面那一條保證兩套座標對得起來，這一條保證國界判定本身沒有錯位。
  const nearest = (lat, lon) => {
    const p = llToVec(lat, lon, 1);
    const c = dual.centers;
    let best = -1, bd = Infinity;
    for (let i = 0; i < dual.nc; i++) {
      const d = (c[i * 3] - p[0]) ** 2 + (c[i * 3 + 1] - p[1]) ** 2 + (c[i * 3 + 2] - p[2]) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return cc[best] ? data.codes[cc[best] - 1] : null;
  };
  // 挑的都是離海岸有一段距離的內陸點，免得格子壓在邊界上變成鄰國或海。
  // 台灣本島東西只有 120 公里，粗的那幾級指不回自己，那是密度不足的註腳不是錯。
  for (const [nm, lat, lon, want2, minLevel] of [
    ['台中', 24.15, 120.75, 'tw', 6],
    ['南投', 23.96, 120.97, 'tw', 7],
    ['東京', 35.68, 139.69, 'jp'],
    ['柏林', 52.52, 13.40, 'de'],
    ['堪薩斯', 38.50, -98.00, 'us'],
    ['聖保羅', -23.55, -46.63, 'br'],
    ['伯斯內陸', -30.00, 120.00, 'au'],
  ]) {
    if (minLevel && lv < minLevel) continue;
    const got = nearest(lat, lon);
    check(got === want2, `${tag} ${nm}（${lat}/${lon}）落在 ${want2} 的格子裡${got === want2 ? '' : `，實際判成 ${got || '海'}`}`);
  }

  // --- 視野裁切 ---
  // 貼近時只建看得到的格子，level 8 全建是 63 MB，裁切之後不到 1 MB。
  const dir = llToVec(23.75, 121.0, 1);
  const near = hex.cellsNear(dual, dir[0], dir[1], dir[2], 10);
  const cosR = Math.cos(10 * Math.PI / 180);
  let outside = 0;
  for (const i of near) {
    const c = dual.centers;
    if (c[i * 3] * dir[0] + c[i * 3 + 1] * dir[1] + c[i * 3 + 2] * dir[2] < cosR - 1e-12) outside++;
  }
  check(outside === 0, `${tag} 裁切出來的格子都在半徑內（${near.length} 格）`);
  // 半徑內的一格都不能漏，漏了畫面上就是開天窗
  let missed = 0;
  const set = new Set(near);
  for (let i = 0; i < dual.nc; i += step) {
    const c = dual.centers;
    const inside = c[i * 3] * dir[0] + c[i * 3 + 1] * dir[1] + c[i * 3 + 2] * dir[2] >= cosR;
    if (inside && !set.has(i)) missed++;
  }
  check(missed === 0, `${tag} 半徑內的格子沒有漏`);
  check(hex.cellsNear(dual, dir[0], dir[1], dir[2], 10, (i) => cc[i] !== 0).every((i) => cc[i] !== 0),
        `${tag} 過濾條件生效`);

  // --- 可以畫的幾何 ---
  const g = hex.cellGeometry(dual, near, 5, 0.9);
  let wantVerts = 0;
  for (const c of near) wantVerts += dual.ringOff[c + 1] - dual.ringOff[c] + 1;
  check(g.position.length / 3 === wantVerts, `${tag} 頂點數等於每格的邊數加一`);
  check(g.normal.length === g.position.length, `${tag} 法線跟頂點一樣多，六角層才吃得到光照`);
  let nBad = 0;
  for (let i = 0; i < g.normal.length; i += 3) {
    if (Math.abs(Math.hypot(g.normal[i], g.normal[i + 1], g.normal[i + 2]) - 1) > 1e-5) nBad++;
  }
  check(nBad === 0, `${tag} 法線都是單位向量`);
  check(g.index.every((i) => i < g.position.length / 3), `${tag} 索引都在頂點範圍內`);
  check(g.faceCell.length === g.index.length / 3, `${tag} 每個三角形都對得到一格`);
  check(g.faceCell.every((c) => c < near.length), `${tag} faceCell 指得回 cells 裡的位置`);

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

  let rBad = 0;
  for (let i = 0; i < g.position.length; i += 3) {
    if (Math.abs(Math.hypot(g.position[i], g.position[i + 1], g.position[i + 2]) - 5) > 1e-4) rBad++;
  }
  check(rBad === 0, `${tag} 收縮之後所有頂點仍在同一顆球面上`);
}

// --- 台灣的領土 ---
//
// Natural Earth 110m 把金門畫進中國的多邊形裡，馬祖、澎湖、綠島、蘭嶼那個比例尺
// 下整個沒有收錄。所以 gen_hexgrid.py 對台灣改用內政部的縣市界，而且比一格小的島
// 另外補一輪。這幾條盯的就是那個修正，回頭有人改判定順序會在這裡轉紅。
{
  const data = loaded.get(8);
  const cc = hex.decodeCC(data.cc);
  const dual = hex.dualCells(8);
  const at = (lat, lon) => {
    const p = llToVec(lat, lon, 1);
    const c = dual.centers;
    let best = -1, bd = Infinity;
    for (let i = 0; i < dual.nc; i++) {
      const d = (c[i * 3] - p[0]) ** 2 + (c[i * 3 + 1] - p[1]) ** 2 + (c[i * 3 + 2] - p[2]) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return cc[best] ? data.codes[cc[best] - 1] : '海';
  };
  for (const [nm, lat, lon, want] of [
    ['金門', 24.432, 118.317, 'tw'],
    ['馬祖南竿', 26.156, 119.929, 'tw'],
    ['馬祖東引', 26.366, 120.492, 'tw'],
    ['澎湖', 23.566, 119.566, 'tw'],
    ['綠島', 22.659, 121.492, 'tw'],
    ['蘭嶼', 22.043, 121.545, 'tw'],
    ['小琉球', 22.343, 120.373, 'tw'],
    // 對岸三個點要維持中國，補格補過頭會在這裡現形
    ['廈門', 24.479, 118.089, 'cn'],
    ['福州', 26.074, 119.296, 'cn'],
    ['平潭', 25.503, 119.791, 'cn'],
  ]) {
    const got = at(lat, lon);
    // 平潭島比一格小，110m 沒收錄，那一格是海也算對，只要別變成台灣
    const pass = nm === '平潭' ? (got === 'cn' || got === '海') : got === want;
    check(pass, `level 8 的 ${nm} 判成 ${got}${pass ? '' : `，應該是 ${want}`}`);
  }
}

// --- 台灣的局部高解析網格 ---
//
// 那一塊的三級（9 到 11）是在瀏覽器裡局部細分算出來的，沒有對應的資料檔：全球的
// level 11 是 4,190 萬格，只為了台灣那三千格不划算。國碼也在前端判，國界與縣市界
// 本來就載進來了。
{
  const inRings = new Function(`${extractFn(atlas, 'function inRings(')}; return inRings;`)();
  const adm = JSON.parse(read(path.join(PLAY, 'tw-admin.json')));
  const twRings = [];
  for (const c of adm.c) for (const r of c.p) twRings.push(r);
  check(adm.c.length === 22, `縣市界有 22 個縣市（${adm.c.length}）`);
  check(adm.c.some((c) => c.zh === '金門縣') && adm.c.some((c) => c.zh === '連江縣'),
        '金門縣與連江縣都在縣市界那份裡');

  for (const lv of [9, 10, 11]) {
    const t0 = Date.now();
    const d = hex.localCells(lv, 23.7, 121.0, 3.6);
    const ms = Date.now() - t0;
    const tag = `局部 level ${lv}`;
    check(d.nc > 0, `${tag} 算出 ${d.nc} 格，${ms} ms`);
    check(ms < 3000, `${tag} 在 ${ms} ms 內算完`);
    let bad = 0;
    for (let i = 0; i < d.nc; i++) {
      const n = d.ringOff[i + 1] - d.ringOff[i];
      if (n !== 5 && n !== 6) bad++;
    }
    check(bad === 0, `${tag} 每一格都是五邊形或六邊形`);
    // 格心與 atlas.js 的 llToVec 互逆，局部那幾級同樣吃這一條
    let rt = 0;
    const step = Math.max(1, Math.floor(d.nc / 300));
    for (let i = 0; i < d.nc; i += step) {
      const [la, lo] = hex.cellLatLon(d, i);
      const b = llToVec(la, lo, 1);
      if (Math.hypot(d.centers[i * 3] - b[0], d.centers[i * 3 + 1] - b[1], d.centers[i * 3 + 2] - b[2]) > 1e-9) rt++;
    }
    check(rt === 0, `${tag} 格心跟 llToVec 互逆`);
    // 繞向
    const g = hex.cellGeometry(d, [...Array(d.nc).keys()], 5, 0.9);
    let flip = 0;
    for (let t = 0; t < g.index.length; t += 3) {
      const a = g.index[t] * 3, b = g.index[t + 1] * 3, c = g.index[t + 2] * 3;
      const ux = g.position[b] - g.position[a], uy = g.position[b + 1] - g.position[a + 1], uz = g.position[b + 2] - g.position[a + 2];
      const vx = g.position[c] - g.position[a], vy = g.position[c + 1] - g.position[a + 1], vz = g.position[c + 2] - g.position[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (nx * g.position[a] + ny * g.position[a + 1] + nz * g.position[a + 2] <= 0) flip++;
    }
    check(flip === 0, `${tag} 三角形都朝球外`);

    // 離島在這幾級要畫得出來。問的是「這座島附近有沒有格子被判成台灣」，
    // 不是「離島中心最近的那一格」：島比一格大的時候，最近的格心很可能落在旁邊的海上。
    const twNear = (lat, lon, radDeg) => {
      const p = llToVec(lat, lon, 1);
      const cos = Math.cos(radDeg * Math.PI / 180);
      let n = 0;
      for (let i = 0; i < d.nc; i++) {
        if (d.centers[i * 3] * p[0] + d.centers[i * 3 + 1] * p[1] + d.centers[i * 3 + 2] * p[2] < cos) continue;
        const [la, lo] = hex.cellLatLon(d, i);
        if (inRings(twRings, lo, la)) n++;
      }
      return n;
    };
    // 島愈小愈需要細的格子才畫得出來。南竿只有 5.6 × 4.2 公里、綠島 4 公里，
    // 粗的那幾級收不到是離散化的必然，所以只要求最細那一級。
    //
    // 搜尋半徑取 0.1 度（11 公里）。島的座標是大致位置，而海灣與岬角讓「島中心」
    // 不一定在多邊形裡，範圍開太小會問到旁邊的海。
    if (lv === 11) {
      for (const [nm, lat, lon] of [['金門', 24.432, 118.317], ['澎湖', 23.566, 119.566],
                                    ['馬祖南竿', 26.152, 119.949], ['蘭嶼', 22.043, 121.545],
                                    ['綠島', 22.659, 121.492]]) {
        const n = twNear(lat, lon, 0.1);
        check(n > 0, `${tag} 的 ${nm} 有 ${n} 格算在台灣`);
      }
    }
    // 對岸不能被算進台灣。廈門、福州離金門馬祖都在二十公里內，補過頭會在這裡現形。
    for (const [nm, lat, lon] of [['廈門', 24.479, 118.089], ['福州', 26.074, 119.296]]) {
      check(twNear(lat, lon, 0.02) === 0, `${tag} 的 ${nm} 一格都沒被算成台灣`);
    }
  }
  // 一級比一級細，格數大約四倍
  const n = (lv) => hex.localCells(lv, 23.7, 121.0, 3.6).nc;
  const a = n(9), b = n(10);
  check(b / a > 3.5 && b / a < 4.5, `局部網格一級比一級細四倍（${a} → ${b}）`);
}

// --- 四級之間的關係 ---
{
  const n = (lv) => {
    const d = loaded.get(lv);
    if (!d) return 0;
    const cc = hex.decodeCC(d.cc);
    const tw = d.codes.indexOf('tw') + 1;
    let k = 0;
    for (const x of cc) if (x === tw) k++;
    return k;
  };
  check(n(5) < n(6) && n(6) < n(7) && n(7) < n(8),
        `台灣的格數隨等級遞增：${n(5)} → ${n(6)} → ${n(7)} → ${n(8)}`);
  check(n(8) >= 40, `level 8 的台灣有 ${n(8)} 格，島的形狀出得來`);
  const codes = (lv) => (loaded.get(lv) ? loaded.get(lv).codes : []);
  check(codes(8).length >= codes(7).length && codes(7).length >= codes(6).length,
        `涵蓋的國家隨等級遞增：${codes(5).length} → ${codes(6).length} → ${codes(7).length} → ${codes(8).length}`);
  // 盧森堡 2,586 km²，粗的那幾級整國分不到格子
  check(!codes(6).includes('lu') && codes(7).includes('lu'),
        'level 6 分不到格子的盧森堡（120 台），在 level 7 有格子');
}

// --- 接線 ---
check(atlas.includes("from './hexgrid.js'"), 'atlas.js 載入了 hexgrid.js');
check(atlas.includes('async function hexRefresh()'), 'atlas.js 有依距離換級的入口');
check(atlas.includes('function hexPickLevel('), 'atlas.js 會依涵蓋度挑等級');
check(atlas.includes('function hexPaint(mode)'), 'atlas.js 會依指標重新上色');
check(/hexPaint\(mode\);/.test(atlas), '切換指標時六角層跟著換色');
check(atlas.includes('function pickHexCC('), 'atlas.js 有點格子的判定');
check(/if \(!verifyOrder\(dual, data\.probe\)\)/.test(atlas), '順序對不上時那一級不畫');
check(/const HEX_LEVELS = \[5, 6, 7, 8\]/.test(atlas), '四級都在換級的名單裡');
check(/HEX_MIN_PX = 14, HEX_MAX_PX = 64/.test(atlas), '格子在螢幕上超出 14 到 64 px 才換級');
check(/mesh\.renderOrder = -1/.test(atlas), '六角層最先畫，國界與設施疊在它上面');
check(/const HEX_LIFT = 1\.0015/.test(atlas), '六角層的高度壓在所有線層之下');
check(atlas.includes('cellsNear('), '只建看得到的那些格子');
check(atlas.includes('function hexNearLocal('), '視野在台灣那一塊時局部那幾級才進候選');
check(atlas.includes('function hexBuildLocal('), 'atlas.js 會現場算局部網格');
check(atlas.includes('function hexJudge('), '局部網格的國碼在前端判');
check(/HEX_LOCAL_LEVELS/.test(atlas), '局部那邊也會換級');
check(atlas.includes('function hexShowScale('), '面板會顯示這一級代表多大');
check(/HEX_KM = \{ 5: 277, 6: 139, 7: 69, 8: 35, 9: 17, 10: 8\.7, 11: 4\.3, 12: 2\.2 \}/.test(atlas),
      '八級的尺度都有對應的公里數');
check(html.includes('id="hex-scale"'), 'index.html 有尺度說明那一行');
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
