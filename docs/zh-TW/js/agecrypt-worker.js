/*
 * 本機檔案加密（utils/age.md）的 scrypt 算在這個 worker 裡，主程式是 agecrypt.js。
 *
 * 2026-09-03 在 GrapheneOS 的 IronFox 上發現工具像當掉。IronFox 預設關閉 JavaScript 的 JIT，
 * Tor Browser 的「較安全」等級也關，純 JS 的 scrypt 一次 2^18 要 50 秒。在主執行緒上算的話
 * 轉圈畫不動、點什麼都沒反應。noble 的 scryptAsync 只用 microtask 讓步，畫面照樣進不來，
 * 所以搬到 worker，主執行緒只等訊息。
 *
 * 這是 module worker，直接用相對路徑載入 vendor 裡原封不動的 noble scrypt，它內部的 import
 * 全是相對路徑，不需要頁面的 import map。三個語系共用，en 與 zh-CN 底下是 symlink，
 * 那兩邊的 vendor/age 也是 symlink，所以同一個相對路徑都解得到。
 * 進度只在百分比變了才回報，一趟最多一百則訊息。
 */
import { scrypt } from "../utils/vendor/age/noble-hashes/scrypt.js";

self.onmessage = (event) => {
  const job = event.data;
  let shown = -1;
  try {
    const key = scrypt(job.passphrase, job.salt, {
      N: job.N, r: job.r, p: job.p, dkLen: job.dkLen,
      onProgress: (ratio) => {
        const percent = Math.floor(ratio * 100);
        if (percent === shown) return;
        shown = percent;
        self.postMessage({ id: job.id, progress: ratio });
      },
    });
    self.postMessage({ id: job.id, key: key });
  } catch (err) {
    self.postMessage({ id: job.id, error: String((err && err.message) || err) });
  }
};
