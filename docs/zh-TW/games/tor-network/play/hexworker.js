// 六角格幾何的背景執行緒。
//
// === 為什麼需要它 ===
//
// 放大的時候每換一級就要重算一次幾何，而那是同步的純運算。實測兩段都很重：
//
//   全球 level 8   細分 176 ms 加上取對偶 181 ms
//   局部 level 11  判 41,086 格的國碼要 620 ms
//
// 在主執行緒上做就是滾輪滾到那幾段時畫面整個停住。搬進來之後主執行緒只剩裁切、
// 建 BufferGeometry 與上色，實測每次換級 1 到 10 毫秒。
//
// 算出來的東西全部是 typed array，transfer 給主執行緒不必複製。
//
// === 國碼為什麼分兩種來源 ===
//
// 全球那幾級（5 到 8）的國碼是 hexgrid-<level>.json 依全球的頂點索引存好的，
// 主執行緒自己解得開，這裡只算幾何。
//
// 台灣那三級（9 到 11）是局部細分算出來的，索引跟全球對不上，所以國碼也在這裡判。
// 國界與縣市界由這支自己抓，走的是瀏覽器快取，主執行緒那邊已經有一份不影響。
import { dualCells, localCells, judgeIndex, judgeCells } from './hexgrid.js';

let judgePromise = null;

/** 判國碼要用的多邊形。抓一次就留著。 */
function ensureJudge() {
  if (judgePromise) return judgePromise;
  judgePromise = Promise.all([
    fetch('./countries.json').then((r) => r.json()),
    // 縣市界抓不到的話台灣就退回用國界判，金門與馬祖會變成海，但不會整個壞掉
    fetch('./tw-admin.json').then((r) => r.json()).catch(() => null),
  ]).then(([world, adm]) => judgeIndex(world, adm));
  return judgePromise;
}

self.onmessage = async (e) => {
  const { id, kind, level, lat, lon, radius } = e.data || {};
  try {
    if (kind === 'local') {
      const idx = await ensureJudge();
      const d = localCells(level, lat, lon, radius);
      const { cc, codes } = judgeCells(d, idx);
      self.postMessage({
        id, ok: true, level, local: true, nc: d.nc, cc, codes,
        centers: d.centers, ringOff: d.ringOff, ringIdx: d.ringIdx, faceCenters: d.faceCenters,
      }, [d.centers.buffer, d.ringOff.buffer, d.ringIdx.buffer, d.faceCenters.buffer, cc.buffer]);
      return;
    }
    const d = dualCells(level);
    self.postMessage({
      id, ok: true, level, local: false, nc: d.nc,
      centers: d.centers, ringOff: d.ringOff, ringIdx: d.ringIdx, faceCenters: d.faceCenters,
    }, [d.centers.buffer, d.ringOff.buffer, d.ringIdx.buffer, d.faceCenters.buffer]);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err && err.message ? err.message : err) });
  }
};
