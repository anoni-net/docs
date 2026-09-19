// 球面六角格的幾何。
//
// === 為什麼幾何不放進資料檔 ===
//
// hexgrid.json 裡只有每一格的國碼，沒有任何座標。幾何是純函式算得出來的東西，
// 存進檔案等於把 40,962 格 × 6 個頂點的座標也一起傳，那是幾百 KB，而同一份東西
// 在瀏覽器裡算一次只要幾十毫秒。
//
// 代價是兩邊的頂點順序必須一模一樣，錯開一格整層的國碼就全錯。所以細分的寫法
// 跟 tools/gen_hexgrid.py 是逐行對照的：同一組二十面體座標、同一個面的繞向、
// 邊的中點照 (a,b)、(b,c)、(c,a) 的順序插入、新頂點一律 append 在尾端。
// 動其中一邊就要動另一邊，hexgrid.json 的 probe 欄位是這件事的保險，
// verifyOrder() 比對得上才畫。
//
// === 球面鋪不滿六角形 ===
//
// 歐拉公式的結果：只用六邊形鋪不滿球面，一定要有 12 個五邊形。這裡走 Goldberg
// 多面體，正二十面體細分之後取對偶，12 個五邊形就落在原本二十面體的 12 個頂點上。
// 它們是球面拓撲的硬性結果，消不掉，只能挑位置。細分等級 n 的格數是 10 * 4^n + 2。

const PHI = (1 + Math.sqrt(5)) / 2;
// 這兩組必須跟 gen_hexgrid.py 的 ICO_V、ICO_F 逐字一致
const ICO_V = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
               [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
               [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]];
const ICO_F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
               [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
               [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
               [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

/** 細分 level 次的測地線球。回傳頂點（每個頂點就是一格的中心）與三角面。 */
export function geodesic(level) {
  let verts = ICO_V.map((v) => {
    const L = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / L, v[1] / L, v[2] / L];
  });
  let faces = ICO_F.map((f) => f.slice());
  for (let it = 0; it < level; it++) {
    // 邊的 key 用數字不用字串。level 7 有 163,842 個頂點，乘 1e6 還在安全整數內，
    // 而字串 key 在這個量級下會多花掉三成以上的時間。
    const mid = new Map();
    const middle = (a, b) => {
      const key = a < b ? a * 1e6 + b : b * 1e6 + a;
      const got = mid.get(key);
      if (got !== undefined) return got;
      const p = verts[a], q = verts[b];
      const x = (p[0] + q[0]) / 2, y = (p[1] + q[1]) / 2, z = (p[2] + q[2]) / 2;
      const L = Math.hypot(x, y, z);
      verts.push([x / L, y / L, z / L]);
      mid.set(key, verts.length - 1);
      return verts.length - 1;
    };
    const next = new Array(faces.length * 4);
    let n = 0;
    for (const f of faces) {
      const a = f[0], b = f[1], c = f[2];
      const ab = middle(a, b), bc = middle(b, c), ca = middle(c, a);
      next[n++] = [a, ab, ca];
      next[n++] = [b, bc, ab];
      next[n++] = [c, ca, bc];
      next[n++] = [ab, bc, ca];
    }
    faces = next;
  }
  return { verts, faces };
}

/**
 * 球面座標換經緯度。必須是 atlas.js 那支 llToVec 的反函數。
 *
 * llToVec 用的是 phi = 90 - lat、theta = lon + 180，展開之後
 * x = cos(lat)cos(lon)、y = sin(lat)、z = -cos(lat)sin(lon)，
 * 所以經度要用 atan2(-z, x)。
 *
 * 第一版寫成 atan2(x, z)，那個式子算出來的經度整整多 90 度。兩邊的細分順序、
 * 格數、五邊形數量、probe 取樣點全部照樣對得上，因為產生器與這裡用的是同一個
 * 錯式子，自洽。畫面上的結果是每一格都有顏色，但顏色屬於東邊 90 度那個國家，
 * 而台灣本島所在的那一格被判成海。要抓它只能拿 llToVec 來回跑一次，
 * check_hexgrid.mjs 現在有這一條。
 */
export function toLatLon(p) {
  return [Math.asin(Math.max(-1, Math.min(1, p[1]))) * 180 / Math.PI,
          Math.atan2(-p[2], p[0]) * 180 / Math.PI];
}

/**
 * 取對偶：每個頂點周圍那幾個三角形的中心，繞著頂點排成一圈，就是那一格的多邊形。
 *
 * 排序不能省。相鄰面在 faces 裡的先後是細分留下的順序，直接拿來連線會畫成星形。
 * 這裡在頂點的切平面上建一組基底，用 atan2 量角度排一圈。
 */
export function dualCells(level) {
  const { verts, faces } = geodesic(level);
  const n = verts.length;
  // 每個頂點最多 6 個相鄰面（五邊形那 12 個是 5 個），先數再填，省掉一堆小陣列
  const cnt = new Uint8Array(n);
  for (const f of faces) { cnt[f[0]]++; cnt[f[1]]++; cnt[f[2]]++; }
  const off = new Uint32Array(n + 1);
  for (let i = 0; i < n; i++) off[i + 1] = off[i] + cnt[i];
  const around = new Uint32Array(off[n]);
  const fill = new Uint8Array(n);
  const fc = new Float64Array(faces.length * 3); // 面中心
  for (let i = 0; i < faces.length; i++) {
    const [a, b, c] = faces[i];
    const x = (verts[a][0] + verts[b][0] + verts[c][0]) / 3;
    const y = (verts[a][1] + verts[b][1] + verts[c][1]) / 3;
    const z = (verts[a][2] + verts[b][2] + verts[c][2]) / 3;
    const L = Math.hypot(x, y, z);
    fc[i * 3] = x / L; fc[i * 3 + 1] = y / L; fc[i * 3 + 2] = z / L;
    around[off[a] + fill[a]++] = i;
    around[off[b] + fill[b]++] = i;
    around[off[c] + fill[c]++] = i;
  }
  const order = [];
  const ang = [];
  for (let v = 0; v < n; v++) {
    const s = off[v], e = off[v + 1];
    const nx = verts[v][0], ny = verts[v][1], nz = verts[v][2];
    // 切平面的第一軸取第一個面中心投影下來的方向，第二軸用法向量叉積補齊
    const f0 = around[s] * 3;
    let ux = fc[f0] - nx, uy = fc[f0 + 1] - ny, uz = fc[f0 + 2] - nz;
    const d = ux * nx + uy * ny + uz * nz;
    ux -= d * nx; uy -= d * ny; uz -= d * nz;
    const uL = Math.hypot(ux, uy, uz);
    ux /= uL; uy /= uL; uz /= uL;
    const wx = ny * uz - nz * uy, wy = nz * ux - nx * uz, wz = nx * uy - ny * ux;
    ang.length = 0;
    for (let i = s; i < e; i++) {
      const j = around[i] * 3;
      const dx = fc[j] - nx, dy = fc[j + 1] - ny, dz = fc[j + 2] - nz;
      ang.push([Math.atan2(dx * wx + dy * wy + dz * wz, dx * ux + dy * uy + dz * uz), around[i]]);
    }
    ang.sort((a, b) => a[0] - b[0]);
    order.push(ang.map((x) => x[1]));
  }
  return { centers: verts, rings: order, faceCenters: fc };
}

/**
 * 把指定的那些格做成一份可以畫的幾何。
 *
 * 每格畫成三角扇：中心一個頂點，外圈 5 或 6 個。索引式，一格 7 個頂點換 18 個索引，
 * 比逐三角形攤平省三分之二的記憶體。
 *
 * @param cells  要畫的格索引（通常是陸地那些）
 * @param radius 球半徑
 * @param shrink 格子往中心收多少，留出格與格之間的縫。1 是完全貼合，0.9 大約是蜂巢那種線寬。
 * @returns position、normal、index、每個三角形屬於哪一格（picking 用）、每格在 position 裡的起點
 */
export function cellGeometry(dual, cells, radius, shrink = 0.92) {
  const { centers, rings, faceCenters } = dual;
  let verts = 0, tris = 0;
  for (const c of cells) { verts += rings[c].length + 1; tris += rings[c].length; }
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
    const ring = rings[c];
    const cx = centers[c][0], cy = centers[c][1], cz = centers[c][2];
    const base = vp / 3;
    vertStart[ci] = base;
    vertCount[ci] = ring.length + 1;
    normal[vp] = cx; normal[vp + 1] = cy; normal[vp + 2] = cz;
    position[vp++] = cx * radius; position[vp++] = cy * radius; position[vp++] = cz * radius;
    for (const f of ring) {
      const j = f * 3;
      // 往格心收一點。收的是球面上的方向，收完再推回同一顆球面上，
      // 縫隙的寬度在各個緯度才一致。
      let x = cx + (faceCenters[j] - cx) * shrink;
      let y = cy + (faceCenters[j + 1] - cy) * shrink;
      let z = cz + (faceCenters[j + 2] - cz) * shrink;
      const L = Math.hypot(x, y, z);
      normal[vp] = x / L; normal[vp + 1] = y / L; normal[vp + 2] = z / L;
      position[vp++] = x / L * radius; position[vp++] = y / L * radius; position[vp++] = z / L * radius;
    }
    for (let k = 0; k < ring.length; k++) {
      index[ip++] = base;
      index[ip++] = base + 1 + k;
      index[ip++] = base + 1 + ((k + 1) % ring.length);
      faceCell[tp++] = ci;   // 存的是 cells 裡的位置，不是全域格索引
    }
  }
  return { position, normal, index, faceCell, vertStart, vertCount };
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
    if (!dual.centers[i]) return false;
    const [a, b] = toLatLon(dual.centers[i]);
    if (Math.abs(a - lat) > tolDeg) return false;
    // 經度在極點附近沒有意義，緯度貼著 ±90 時只驗緯度
    if (Math.abs(a) < 89.999 && Math.abs(((b - lon + 540) % 360) - 180) > tolDeg) return false;
  }
  return true;
}
