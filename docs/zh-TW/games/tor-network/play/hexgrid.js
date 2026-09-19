// 球面六角格的幾何。
//
// === 這一層是什麼 ===
//
// 把地球表面切成大小一致的六角格，當作地圖的最小呈現單位。資料點疊在格子上面，
// 格子自己只負責「這塊地表屬於哪個國家、要上什麼顏色」。
//
// 因為是底圖，它必須一直在。放大之後格子會脹大，處理方式是換更細的一級，
// 讓格子在螢幕上的大小維持在同一個量級，跟地圖圖磚的做法一樣。
//
// === 球面鋪不滿六角形 ===
//
// 歐拉公式的結果：只用六邊形鋪不滿球面，一定要有 12 個五邊形。這裡走 Goldberg
// 多面體，正二十面體細分之後取對偶，12 個五邊形就落在原本二十面體的 12 個頂點上。
// 它們是球面拓撲的硬性結果，消不掉，只能挑位置。細分等級 n 的格數是 10 * 4^n + 2：
//
//   level 5   10,242 格   邊長 138 km
//   level 6   40,962 格   邊長  69 km
//   level 7  163,842 格   邊長  35 km
//   level 8  655,362 格   邊長  17 km
//
// === 為什麼全部用 typed array ===
//
// 第一版的頂點是 [[x,y,z], ...]，面是 [[a,b,c], ...]。level 7 還撐得住，到 level 8
// 就是 655,362 個小陣列加 1,310,720 個小陣列，量出來吃掉 293 MB，手機上直接出局。
// 換成 Float64Array 與 Uint32Array 之後同一份資料是 32 MB。
//
// 每格的鄰接面用 CSR 存（ringOff 指出範圍、ringIdx 放內容），同樣是為了避開
// 「一格一個小陣列」那筆開銷。
//
// === 幾何不放進資料檔 ===
//
// hexgrid-<level>.json 裡只有每一格的國碼，沒有任何座標。幾何是純函式算得出來的
// 東西，存進檔案等於把幾百萬個座標一起傳。代價是兩邊的頂點順序必須一模一樣，
// 所以細分的寫法跟 tools/gen_hexgrid.py 是逐行對照的：同一組二十面體座標、
// 同一個面的繞向、邊的中點照 (a,b)、(b,c)、(c,a) 的順序插入、新頂點一律 append
// 在尾端。動其中一邊就要動另一邊，資料檔的 probe 欄位是這件事的保險。

const PHI = (1 + Math.sqrt(5)) / 2;
// 這兩組必須跟 gen_hexgrid.py 的 ICO_V、ICO_F 逐字一致
const ICO_V = [-1, PHI, 0, 1, PHI, 0, -1, -PHI, 0, 1, -PHI, 0,
               0, -1, PHI, 0, 1, PHI, 0, -1, -PHI, 0, 1, -PHI,
               PHI, 0, -1, PHI, 0, 1, -PHI, 0, -1, -PHI, 0, 1];
const ICO_F = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
               1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
               3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
               4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];

/** 細分 level 次的測地線球。頂點就是每一格的中心。 */
export function geodesic(level) {
  const nv = 10 * 4 ** level + 2;
  const nf = 20 * 4 ** level;
  const verts = new Float64Array(nv * 3);
  let faces = new Uint32Array(60);
  faces.set(ICO_F);
  let vn = 12;
  for (let i = 0; i < 36; i += 3) {
    const L = Math.hypot(ICO_V[i], ICO_V[i + 1], ICO_V[i + 2]);
    verts[i] = ICO_V[i] / L; verts[i + 1] = ICO_V[i + 1] / L; verts[i + 2] = ICO_V[i + 2] / L;
  }
  for (let it = 0; it < level; it++) {
    // 邊的 key 用數字不用字串。乘數要大過目前的頂點數，2^22 撐得到 level 9，
    // 而 655,362 * 2^22 仍在安全整數內。
    const mid = new Map();
    const fn = faces.length / 3;
    const next = new Uint32Array(fn * 4 * 3);
    let np = 0;
    const middle = (a, b) => {
      const key = a < b ? a * 4194304 + b : b * 4194304 + a;
      const got = mid.get(key);
      if (got !== undefined) return got;
      const ai = a * 3, bi = b * 3;
      const x = (verts[ai] + verts[bi]) / 2;
      const y = (verts[ai + 1] + verts[bi + 1]) / 2;
      const z = (verts[ai + 2] + verts[bi + 2]) / 2;
      const L = Math.hypot(x, y, z);
      const vi = vn++;
      verts[vi * 3] = x / L; verts[vi * 3 + 1] = y / L; verts[vi * 3 + 2] = z / L;
      mid.set(key, vi);
      return vi;
    };
    for (let f = 0; f < fn; f++) {
      const a = faces[f * 3], b = faces[f * 3 + 1], c = faces[f * 3 + 2];
      const ab = middle(a, b), bc = middle(b, c), ca = middle(c, a);
      next[np++] = a; next[np++] = ab; next[np++] = ca;
      next[np++] = b; next[np++] = bc; next[np++] = ab;
      next[np++] = c; next[np++] = ca; next[np++] = bc;
      next[np++] = ab; next[np++] = bc; next[np++] = ca;
    }
    faces = next;
  }
  if (vn !== nv) throw new Error(`細分產出 ${vn} 個頂點，公式說應該是 ${nv}`);
  return { verts, faces, nv, nf };
}

/**
 * 取對偶：每個頂點周圍那幾個三角形的中心，繞著頂點排成一圈，就是那一格的多邊形。
 *
 * 排序不能省。相鄰面在 faces 裡的先後是細分留下的順序，直接連起來會畫成自交的
 * 星形，而格數、邊數、probe 全部照樣通過，畫面上則是一半的三角形朝內被剔除。
 */
export function dualCells(level) {
  const { verts, faces, nv, nf } = geodesic(level);
  // 每個頂點最多 6 個相鄰面（五邊形那 12 個是 5 個），先數再填
  const cnt = new Uint8Array(nv);
  for (let i = 0; i < nf * 3; i++) cnt[faces[i]]++;
  const ringOff = new Uint32Array(nv + 1);
  for (let i = 0; i < nv; i++) ringOff[i + 1] = ringOff[i] + cnt[i];
  const ringIdx = new Uint32Array(ringOff[nv]);
  const fill = new Uint8Array(nv);
  // 這一份是三者裡最大的，level 8 用 Float64 要 30 MB。單位球上 Float32 的相對
  // 誤差是 1e-7，換算成角度遠小於 probe 的 1e-4 度容差，省一半記憶體不影響任何判斷。
  const faceCenters = new Float32Array(nf * 3);
  for (let f = 0; f < nf; f++) {
    const a = faces[f * 3] * 3, b = faces[f * 3 + 1] * 3, c = faces[f * 3 + 2] * 3;
    const x = (verts[a] + verts[b] + verts[c]) / 3;
    const y = (verts[a + 1] + verts[b + 1] + verts[c + 1]) / 3;
    const z = (verts[a + 2] + verts[b + 2] + verts[c + 2]) / 3;
    const L = Math.hypot(x, y, z);
    faceCenters[f * 3] = x / L; faceCenters[f * 3 + 1] = y / L; faceCenters[f * 3 + 2] = z / L;
    for (let k = 0; k < 3; k++) {
      const v = faces[f * 3 + k];
      ringIdx[ringOff[v] + fill[v]++] = f;
    }
  }
  // 繞著格心排一圈。切平面上建一組基底，用 atan2 量角度。
  const ang = new Float64Array(6);
  const tmp = new Uint32Array(6);
  for (let v = 0; v < nv; v++) {
    const s = ringOff[v], e = ringOff[v + 1], n = e - s;
    const nx = verts[v * 3], ny = verts[v * 3 + 1], nz = verts[v * 3 + 2];
    const f0 = ringIdx[s] * 3;
    let ux = faceCenters[f0] - nx, uy = faceCenters[f0 + 1] - ny, uz = faceCenters[f0 + 2] - nz;
    const d = ux * nx + uy * ny + uz * nz;
    ux -= d * nx; uy -= d * ny; uz -= d * nz;
    const uL = Math.hypot(ux, uy, uz);
    ux /= uL; uy /= uL; uz /= uL;
    const wx = ny * uz - nz * uy, wy = nz * ux - nx * uz, wz = nx * uy - ny * ux;
    for (let i = 0; i < n; i++) {
      const j = ringIdx[s + i] * 3;
      const dx = faceCenters[j] - nx, dy = faceCenters[j + 1] - ny, dz = faceCenters[j + 2] - nz;
      ang[i] = Math.atan2(dx * wx + dy * wy + dz * wz, dx * ux + dy * uy + dz * uz);
      tmp[i] = ringIdx[s + i];
    }
    // n 最多 6，插入排序比建物件再 sort 快得多，也不產生垃圾
    for (let i = 1; i < n; i++) {
      const a = ang[i], t = tmp[i];
      let j = i - 1;
      while (j >= 0 && ang[j] > a) { ang[j + 1] = ang[j]; tmp[j + 1] = tmp[j]; j--; }
      ang[j + 1] = a; tmp[j + 1] = t;
    }
    for (let i = 0; i < n; i++) ringIdx[s + i] = tmp[i];
  }
  return { centers: verts, nc: nv, ringOff, ringIdx, faceCenters, level };
}

/** 第 i 格的中心經緯度。必須是 atlas.js 那支 llToVec 的反函數。 */
export function cellLatLon(dual, i) {
  const c = dual.centers;
  const x = c[i * 3], y = c[i * 3 + 1], z = c[i * 3 + 2];
  return [Math.asin(Math.max(-1, Math.min(1, y))) * 180 / Math.PI,
          Math.atan2(-z, x) * 180 / Math.PI];
}

/**
 * 球面座標換經緯度。必須是 atlas.js 那支 llToVec 的反函數。
 *
 * llToVec 用的是 phi = 90 - lat、theta = lon + 180，展開之後
 * x = cos(lat)cos(lon)、y = sin(lat)、z = -cos(lat)sin(lon)，所以經度是 atan2(-z, x)。
 *
 * 第一版寫成 atan2(x, z)，那個式子算出來的經度整整多 90 度。兩邊的細分順序、格數、
 * 五邊形數量、probe 取樣點全部照樣對得上，因為產生器與這裡用的是同一個錯式子，
 * 自洽。畫面上的結果是每一格都有顏色，但顏色屬於東邊 90 度那個國家，而台灣本島
 * 所在的那一格被判成海。要抓它只能拿 llToVec 來回跑一次。
 */
export function toLatLon(p) {
  return [Math.asin(Math.max(-1, Math.min(1, p[1]))) * 180 / Math.PI,
          Math.atan2(-p[2], p[0]) * 180 / Math.PI];
}

/**
 * 只算某一小塊的高解析網格。
 *
 * 台灣那一帶要細到公里級，而全球的 level 11 是 4,190 萬格，瀏覽器算不動也裝不下。
 * 這支在細分的時候就把離中心太遠的面丟掉，格數降到範圍佔比那麼多，level 11 的
 * 台灣一帶只剩八千格。
 *
 * 兩件事會讓結果錯掉：
 *
 * 剔除的半徑要跟著每一級的三角形大小縮。正二十面體的邊長是 63.4 度，細分一次減半，
 * 前幾級的三角形比整個台灣還大，拿最終半徑去砍會一刀砍光，回傳空的。
 *
 * 取對偶需要一格周圍的面都在。邊界上的格子少了面會缺角，所以保留的範圍要比實際
 * 要用的多一圈，最後只收周圍面數是 5 或 6 的格。
 *
 * 回傳的形狀跟 dualCells 一樣，所以 cellGeometry 兩邊通用。
 */
export function localCells(level, centerLat, centerLon, radiusDeg, buffer = 2) {
  const cv = latLonToVec(centerLat, centerLon);
  const V = [];   // 扁平的頂點座標，細分途中會累積被丟掉那些面的頂點
  for (let i = 0; i < 36; i += 3) {
    const L = Math.hypot(ICO_V[i], ICO_V[i + 1], ICO_V[i + 2]);
    V.push(ICO_V[i] / L, ICO_V[i + 1] / L, ICO_V[i + 2] / L);
  }
  const far = (i, cos) => V[i * 3] * cv[0] + V[i * 3 + 1] * cv[1] + V[i * 3 + 2] * cv[2] < cos;
  let faces = ICO_F.slice();
  for (let it = 0; it < level; it++) {
    const mid = new Map();
    const middle = (a, b) => {
      const key = a < b ? a * 4194304 + b : b * 4194304 + a;
      const got = mid.get(key);
      if (got !== undefined) return got;
      const ai = a * 3, bi = b * 3;
      const x = (V[ai] + V[bi]) / 2, y = (V[ai + 1] + V[bi + 1]) / 2, z = (V[ai + 2] + V[bi + 2]) / 2;
      const L = Math.hypot(x, y, z);
      V.push(x / L, y / L, z / L);
      const vi = V.length / 3 - 1;
      mid.set(key, vi);
      return vi;
    };
    // 63.4 是正二十面體的邊長（度），細分一次減半
    const cos = Math.cos(Math.min(180, radiusDeg + buffer + 63.4 / 2 ** it) * Math.PI / 180);
    const next = [];
    for (let f = 0; f < faces.length; f += 3) {
      const a = faces[f], b = faces[f + 1], c = faces[f + 2];
      const ab = middle(a, b), bc = middle(b, c), ca = middle(c, a);
      const quad = [a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca];
      for (let q = 0; q < 12; q += 3) {
        // 三個頂點全都太遠才丟。留一個在範圍內就保住，邊界的格子才不會缺面。
        if (!far(quad[q], cos) || !far(quad[q + 1], cos) || !far(quad[q + 2], cos)) {
          next.push(quad[q], quad[q + 1], quad[q + 2]);
        }
      }
    }
    faces = next;
  }
  // 取對偶。只收周圍面數是 5 或 6 的頂點，其餘是被切掉的邊界。
  const around = new Map();
  const nf = faces.length / 3;
  const fc = new Float64Array(nf * 3);
  for (let f = 0; f < nf; f++) {
    const a = faces[f * 3] * 3, b = faces[f * 3 + 1] * 3, c = faces[f * 3 + 2] * 3;
    const x = (V[a] + V[b] + V[c]) / 3, y = (V[a + 1] + V[b + 1] + V[c + 1]) / 3, z = (V[a + 2] + V[b + 2] + V[c + 2]) / 3;
    const L = Math.hypot(x, y, z);
    fc[f * 3] = x / L; fc[f * 3 + 1] = y / L; fc[f * 3 + 2] = z / L;
    for (let k = 0; k < 3; k++) {
      const v = faces[f * 3 + k];
      let arr = around.get(v);
      if (!arr) { arr = []; around.set(v, arr); }
      arr.push(f);
    }
  }
  const keepCos = Math.cos(Math.min(180, radiusDeg) * Math.PI / 180);
  const pick = [];
  for (const [v, fs] of around) {
    if (fs.length !== 5 && fs.length !== 6) continue;
    if (V[v * 3] * cv[0] + V[v * 3 + 1] * cv[1] + V[v * 3 + 2] * cv[2] < keepCos) continue;
    pick.push(v);
  }
  pick.sort((a, b) => a - b);   // 順序穩定，重算兩次拿到的是同一份
  const nc = pick.length;
  const centers = new Float64Array(nc * 3);
  const ringOff = new Uint32Array(nc + 1);
  for (let i = 0; i < nc; i++) ringOff[i + 1] = ringOff[i] + around.get(pick[i]).length;
  const ringIdx = new Uint32Array(ringOff[nc]);
  const ang = new Float64Array(6), tmp = new Uint32Array(6);
  for (let i = 0; i < nc; i++) {
    const v = pick[i];
    const nx = V[v * 3], ny = V[v * 3 + 1], nz = V[v * 3 + 2];
    centers[i * 3] = nx; centers[i * 3 + 1] = ny; centers[i * 3 + 2] = nz;
    const fs = around.get(v);
    const f0 = fs[0] * 3;
    let ux = fc[f0] - nx, uy = fc[f0 + 1] - ny, uz = fc[f0 + 2] - nz;
    const d = ux * nx + uy * ny + uz * nz;
    ux -= d * nx; uy -= d * ny; uz -= d * nz;
    const uL = Math.hypot(ux, uy, uz);
    ux /= uL; uy /= uL; uz /= uL;
    const wx = ny * uz - nz * uy, wy = nz * ux - nx * uz, wz = nx * uy - ny * ux;
    for (let k = 0; k < fs.length; k++) {
      const j = fs[k] * 3;
      const dx = fc[j] - nx, dy = fc[j + 1] - ny, dz = fc[j + 2] - nz;
      ang[k] = Math.atan2(dx * wx + dy * wy + dz * wz, dx * ux + dy * uy + dz * uz);
      tmp[k] = fs[k];
    }
    for (let a = 1; a < fs.length; a++) {
      const av = ang[a], tv = tmp[a];
      let b = a - 1;
      while (b >= 0 && ang[b] > av) { ang[b + 1] = ang[b]; tmp[b + 1] = tmp[b]; b--; }
      ang[b + 1] = av; tmp[b + 1] = tv;
    }
    for (let k = 0; k < fs.length; k++) ringIdx[ringOff[i] + k] = tmp[k];
  }
  return { centers, nc, ringOff, ringIdx, faceCenters: fc, level, local: true };
}

/**
 * 挑出視野附近的格子。
 *
 * 換級之後 level 8 有 655,362 格，全部建成幾何是 1,132,107 個三角形、63 MB。
 * 但相機貼近的時候畫面上只看得到球面的一小塊：涵蓋 12 度時那塊只佔全球的 0.27%，
 * 也就是不到三千格。只建看得到的那些，記憶體與繪製量都回到可接受的範圍。
 *
 * @param dirX,dirY,dirZ 視野中心的單位向量（球面上正對相機的那一點）
 * @param radiusDeg 要收多遠，通常是畫面涵蓋度的一半再加一點餘裕
 * @param keep 可選，回傳 true 才收（拿來過濾掉海的格子）
 */
export function cellsNear(dual, dirX, dirY, dirZ, radiusDeg, keep) {
  const cos = Math.cos(Math.min(180, radiusDeg) * Math.PI / 180);
  const c = dual.centers;
  const out = [];
  for (let i = 0; i < dual.nc; i++) {
    if (c[i * 3] * dirX + c[i * 3 + 1] * dirY + c[i * 3 + 2] * dirZ < cos) continue;
    if (keep && !keep(i)) continue;
    out.push(i);
  }
  return out;
}

/**
 * 把指定的那些格做成一份可以畫的幾何。
 *
 * 每格畫成三角扇：中心一個頂點，外圈 5 或 6 個。索引式，一格 7 個頂點換 18 個索引，
 * 比逐三角形攤平省三分之二的記憶體。
 *
 * @param cells  要畫的格索引
 * @param radius 球半徑
 * @param shrink 格子往中心收多少，留出格與格之間的縫。1 是完全貼合。
 * @returns position、normal、index、每個三角形屬於哪一格（picking 用）、每格的頂點範圍
 */
export function cellGeometry(dual, cells, radius, shrink = 0.92) {
  const { centers, ringOff, ringIdx, faceCenters } = dual;
  let verts = 0, tris = 0;
  for (const c of cells) {
    const n = ringOff[c + 1] - ringOff[c];
    verts += n + 1; tris += n;
  }
  const position = new Float32Array(verts * 3);
  // 法線就是球心到該點的方向。六角層跟陸地一樣吃光照，少了這一份，夜半球的格子
  // 會全亮，日夜分界那條線在格子上就消失了。
  const normal = new Float32Array(verts * 3);
  const index = new Uint32Array(tris * 3);
  const faceCell = new Uint32Array(tris);
  const vertStart = new Uint32Array(cells.length);
  const vertCount = new Uint8Array(cells.length);
  let vp = 0, ip = 0, tp = 0;
  for (let ci = 0; ci < cells.length; ci++) {
    const c = cells[ci];
    const s = ringOff[c], n = ringOff[c + 1] - s;
    const cx = centers[c * 3], cy = centers[c * 3 + 1], cz = centers[c * 3 + 2];
    const base = vp / 3;
    vertStart[ci] = base;
    vertCount[ci] = n + 1;
    normal[vp] = cx; normal[vp + 1] = cy; normal[vp + 2] = cz;
    position[vp++] = cx * radius; position[vp++] = cy * radius; position[vp++] = cz * radius;
    for (let k = 0; k < n; k++) {
      const j = ringIdx[s + k] * 3;
      // 往格心收一點。收的是球面上的方向，收完再推回同一顆球面上，
      // 縫隙的寬度在各個緯度才一致。
      let x = cx + (faceCenters[j] - cx) * shrink;
      let y = cy + (faceCenters[j + 1] - cy) * shrink;
      let z = cz + (faceCenters[j + 2] - cz) * shrink;
      const L = Math.hypot(x, y, z);
      normal[vp] = x / L; normal[vp + 1] = y / L; normal[vp + 2] = z / L;
      position[vp++] = x / L * radius; position[vp++] = y / L * radius; position[vp++] = z / L * radius;
    }
    for (let k = 0; k < n; k++) {
      index[ip++] = base;
      index[ip++] = base + 1 + k;
      index[ip++] = base + 1 + ((k + 1) % n);
      faceCell[tp++] = ci;   // 存的是 cells 裡的位置，不是全域格索引
    }
  }
  return { position, normal, index, faceCell, vertStart, vertCount };
}

/**
 * 經緯度換球面座標。必須跟 atlas.js 的 llToVec 一模一樣。
 *
 * 局部網格的幾何是經緯度存在資料檔裡的，要靠這支轉回 3D。全球那幾份不需要它，
 * 因為那邊的格心本來就是細分算出來的球面座標。check_hexgrid.mjs 會把 atlas.js
 * 那支抽出來跟這支比對，兩邊漂走的話局部網格會整塊錯位。
 */
export function latLonToVec(lat, lon) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return [-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
}

/**
 * 局部網格的幾何。
 *
 * 跟 cellGeometry 做的事情一樣，差別是格子的形狀直接從資料檔讀，不是從對偶算。
 * 台灣那一塊只有五百格，幾何存成經緯度才二十幾 KB，比讓瀏覽器去算 262 萬格的
 * 全球 level 9 划算太多。
 */
export function localGeometry(data, radius, shrink = 0.92) {
  const n = data.cells;
  const sides = decodeCC(data.sides);
  const ring = data.ring_ll, cen = data.center_ll;
  let verts = 0, tris = 0;
  for (let i = 0; i < n; i++) { verts += sides[i] + 1; tris += sides[i]; }
  const position = new Float32Array(verts * 3);
  const normal = new Float32Array(verts * 3);
  const index = new Uint32Array(tris * 3);
  const faceCell = new Uint32Array(tris);
  const vertStart = new Uint32Array(n);
  const vertCount = new Uint8Array(n);
  let vp = 0, ip = 0, tp = 0, rp = 0;
  for (let ci = 0; ci < n; ci++) {
    const c = latLonToVec(cen[ci * 2], cen[ci * 2 + 1]);
    const base = vp / 3;
    vertStart[ci] = base;
    vertCount[ci] = sides[ci] + 1;
    normal[vp] = c[0]; normal[vp + 1] = c[1]; normal[vp + 2] = c[2];
    position[vp++] = c[0] * radius; position[vp++] = c[1] * radius; position[vp++] = c[2] * radius;
    for (let k = 0; k < sides[ci]; k++) {
      const q = latLonToVec(ring[rp++], ring[rp++]);
      let x = c[0] + (q[0] - c[0]) * shrink;
      let y = c[1] + (q[1] - c[1]) * shrink;
      let z = c[2] + (q[2] - c[2]) * shrink;
      const L = Math.hypot(x, y, z);
      normal[vp] = x / L; normal[vp + 1] = y / L; normal[vp + 2] = z / L;
      position[vp++] = x / L * radius; position[vp++] = y / L * radius; position[vp++] = z / L * radius;
    }
    for (let k = 0; k < sides[ci]; k++) {
      index[ip++] = base;
      index[ip++] = base + 1 + k;
      index[ip++] = base + 1 + ((k + 1) % sides[ci]);
      faceCell[tp++] = ci;
    }
  }
  return { position, normal, index, faceCell, vertStart, vertCount };
}

/**
 * 射線法：這個經緯度在不在這組多邊形裡。
 *
 * 全部的 ring 一起算偶奇，所以內部的洞（例如南非包著賴索托）會自動被扣掉。
 * 放在這裡是因為三個地方要用同一份：畫中繼點時在國土內取樣、六角層判國碼、
 * 背景執行緒裡判局部網格的國碼。各寫一份遲早會漂走。
 */
export function inRings(rings, lon, lat) {
  let hit = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
      const yi = r[i + 1], yj = r[j + 1];
      if ((yi > lat) !== (yj > lat) && lon < (r[j] - r[i]) * (lat - yi) / (yj - yi) + r[i]) hit = !hit;
    }
  }
  return hit;
}

/**
 * 判國碼要用的外接框。逐格對 177 國做射線法太慢，用框先篩掉九成九。
 *
 * 台灣另外收一份而且排在最前面：Natural Earth 110m 把金門畫進中國的多邊形裡，
 * 馬祖、澎湖、綠島、蘭嶼那個比例尺下整個沒收錄。縣市界那份是內政部的，22 個縣市都在。
 */
export function judgeIndex(world, twAdmin) {
  const box = (rings) => {
    let lo0 = 1e9, la0 = 1e9, lo1 = -1e9, la1 = -1e9;
    for (const r of rings) {
      for (let i = 0; i < r.length; i += 2) {
        if (r[i] < lo0) lo0 = r[i];
        if (r[i] > lo1) lo1 = r[i];
        if (r[i + 1] < la0) la0 = r[i + 1];
        if (r[i + 1] > la1) la1 = r[i + 1];
      }
    }
    return [lo0, la0, lo1, la1];
  };
  const list = [];
  for (const c of (world && world.c) || []) {
    if (!c.k) continue;
    const b = box(c.p);
    list.push({ k: c.k, rings: c.p, lo0: b[0], la0: b[1], lo1: b[2], la1: b[3] });
  }
  const tw = [];
  for (const c of (twAdmin && twAdmin.c) || []) for (const r of c.p) tw.push(r);
  return { tw, twBox: tw.length ? box(tw) : [0, 0, 0, 0], list };
}

/** 一個座標落在哪一國。台灣優先，理由見 judgeIndex。 */
export function judgeAt(idx, lat, lon) {
  if (!idx) return null;
  const { tw, twBox, list } = idx;
  if (tw.length && lon >= twBox[0] && lon <= twBox[2] && lat >= twBox[1] && lat <= twBox[3]
      && inRings(tw, lon, lat)) return 'tw';
  for (const b of list) {
    if (lon < b.lo0 || lon > b.lo1 || lat < b.la0 || lat > b.la1) continue;
    if (inRings(b.rings, lon, lat)) return b.k;
  }
  return null;
}

/** 把一份局部網格的每一格判成國碼。回傳 1-based 的索引陣列與國碼表。 */
export function judgeCells(dual, idx) {
  const codes = [];
  const seen = new Map();
  const cc = new Uint8Array(dual.nc);
  for (let i = 0; i < dual.nc; i++) {
    const ll = cellLatLon(dual, i);
    const k = judgeAt(idx, ll[0], ll[1]);
    if (!k) continue;
    let id = seen.get(k);
    if (id === undefined) { codes.push(k); id = codes.length; seen.set(k, id); }
    cc[i] = id;
  }
  return { cc, codes };
}

/** base64 的國碼陣列解回 Uint8Array。 */
export function decodeCC(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * 比對資料檔記的取樣點跟這裡算出來的中心對不對得上。
 *
 * 這是整層最重要的一道關卡。兩邊的細分只要有一處寫法不同，頂點順序就會錯開，
 * 而錯開的結果是「每一格都有顏色，但顏色屬於別的國家」，畫面看起來完全正常。
 * 對不上就別畫，寧可少一層也不要給出一張錯的圖。
 */
export function verifyOrder(dual, probe, tolDeg = 1e-4) {
  for (const [i, lat, lon] of probe || []) {
    if (i >= dual.nc) return false;
    const [a, b] = cellLatLon(dual, i);
    if (Math.abs(a - lat) > tolDeg) return false;
    // 經度在極點附近沒有意義，緯度貼著 ±90 時只驗緯度
    if (Math.abs(a) < 89.999 && Math.abs(((b - lon + 540) % 360) - 180) > tolDeg) return false;
  }
  return true;
}
