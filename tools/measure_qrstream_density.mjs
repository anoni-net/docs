#!/usr/bin/env node
/**
 * 影格串流的每張容量該訂多少：把它量出來，不要用猜的。
 *
 * === 為什麼需要這支 ===
 *
 * QR 規格的上限是版本 40、L 等級 2953 個位元組，而這個工具最大只用到 988。差了三倍，
 * 「為什麼不用大一點的」是任何人看到都會問的第一個問題，而 docs/zh-TW/js/qrstream.js
 * 的 DENSITY 只是三個數字，看不出它們是怎麼來的。
 *
 * 這一支把兩個限制各自量出來，讓那幾個常數有依據，也讓之後想調的人有東西可以對照。
 *
 * === 兩個限制，各自量 ===
 *
 * 一、解析度。相機拍螢幕，一個方格在拍到的畫面裡佔不到幾個像素就解不出來。這裡固定
 * 取景（QR 橫跨畫面裡 K 個像素），掃過各個版本，看解碼率在哪裡崩掉。
 *
 * 二、局部反光。天花板的燈映在螢幕上是一塊全白的斑，那一塊的碼就沒了，靠的是 QR 的
 * Reed-Solomon 修回來。容錯度就是在買這個。這裡用硬邊的全白圓斑蓋掉固定比例的碼面，
 * 看每個等級撐到哪裡。
 *
 * 模擬鏈：高解析度畫出矩陣（當成螢幕）、高斯模糊（鏡頭失焦）、面積平均降取樣（相機
 * 取樣）、加雜訊、必要時蓋上光斑，最後交給 vendor 的 jsQR 解，跟收的一端同一支程式、
 * 同一組參數（dontInvert）。
 *
 * 沒有模擬的：摩爾紋、透視變形、捲簾快門、手震。所以量出來的是樂觀值，實際條件更差，
 * 這也是預設值要留餘裕的理由。
 *
 * === 量出來的結論（2026-09，見 docs 的說明）===
 *
 *   - 崩潰點在每個方格 4.5 到 5 個相機像素之間，跟版本無關，跟容錯度也無關
 *   - L 與 M 在解析度不足時表現一樣。失敗模式是「整片認不出來」，不是「局部壞掉」
 *   - 局部反光才是容錯度真正在保護的：L 撐到遮掉 5%，M 撐到 10%，Q 撐到 15% 到 20%
 *   - 所以 M 不是白付的。螢幕反光蓋掉一成碼面很常見，那正好是 L 死掉、M 還活著的區間
 *
 * 用法：
 *   node tools/measure_qrstream_density.mjs            # 兩組都跑
 *   node tools/measure_qrstream_density.mjs --span     # 只跑解析度那組
 *   node tools/measure_qrstream_density.mjs --glare    # 只跑反光那組
 * 不需要建置產物，也沒有外部相依。跑一輪約兩分鐘。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor');
const require_ = createRequire(import.meta.url);
const qrcode = require_(path.join(VENDOR, 'qrcode-generator.js'));
const jsQR = require_(path.join(VENDOR, 'jsQR.js'));
qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

// 框頭加 CRC，跟 qrstream.js 的 OVERHEAD 同一個數
const OVERHEAD = 9;
// 規範要求的四個方格留白
const QUIET = 4;
// 螢幕端畫出來的倍率。夠高才不會讓降取樣的相位差變成假訊號，v35 在倍率 6 的時候
// 就出現過一格明顯偏低的假結果
const SCREEN_PPM = 12;

const capacityCache = new Map();
function capacityOf(version, level) {
  const key = version + level;
  if (capacityCache.has(key)) return capacityCache.get(key);
  let low = 0;
  let high = 4000;
  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    try {
      const qr = qrcode(version, level);
      qr.addData('x'.repeat(mid));
      qr.make();
      low = mid;
    } catch (err) {
      high = mid - 1;
    }
  }
  capacityCache.set(key, low);
  return low;
}

// 固定種子，兩次跑出來的數字要一樣，不然沒辦法拿來比較改動前後
let seed = 20260901;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

// 螢幕：把模組矩陣畫成灰階圖
function drawScreen(text, version, level) {
  const qr = qrcode(version, level);
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const size = Math.round((count + QUIET * 2) * SCREEN_PPM);
  const img = new Float32Array(size * size).fill(255);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      const y0 = Math.round((row + QUIET) * SCREEN_PPM);
      const y1 = Math.round((row + QUIET + 1) * SCREEN_PPM);
      const x0 = Math.round((col + QUIET) * SCREEN_PPM);
      const x1 = Math.round((col + QUIET + 1) * SCREEN_PPM);
      for (let y = y0; y < y1; y += 1) img.fill(0, y * size + x0, y * size + x1);
    }
  }
  return { img, size };
}

// 鏡頭失焦：可分離的高斯模糊
function blur(img, size, sigma) {
  if (sigma <= 0) return img;
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const kernel = [];
  let sum = 0;
  for (let i = -radius; i <= radius; i += 1) {
    const w = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(w);
    sum += w;
  }
  for (let i = 0; i < kernel.length; i += 1) kernel[i] /= sum;
  const pass = (input) => {
    const out = new Float32Array(size * size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        let acc = 0;
        for (let i = -radius; i <= radius; i += 1) {
          const xx = Math.min(size - 1, Math.max(0, x + i));
          acc += input[y * size + xx] * kernel[i + radius];
        }
        out[y * size + x] = acc;
      }
    }
    return out;
  };
  const horizontal = pass(img);
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let acc = 0;
      for (let i = -radius; i <= radius; i += 1) {
        const yy = Math.min(size - 1, Math.max(0, y + i));
        acc += horizontal[yy * size + x] * kernel[i + radius];
      }
      out[y * size + x] = acc;
    }
  }
  return out;
}

// 相機取樣：面積平均降到目標寬度
function downsample(img, size, target) {
  const out = new Float32Array(target * target);
  const step = size / target;
  for (let y = 0; y < target; y += 1) {
    for (let x = 0; x < target; x += 1) {
      const y0 = Math.floor(y * step);
      const y1 = Math.max(y0 + 1, Math.floor((y + 1) * step));
      const x0 = Math.floor(x * step);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * step));
      let acc = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy += 1) {
        for (let xx = x0; xx < x1; xx += 1) {
          acc += img[yy * size + xx];
          n += 1;
        }
      }
      out[y * target + x] = acc / n;
    }
  }
  return out;
}

// 局部反光：硬邊的全白圓斑。用高斯邊緣的話實際毀掉的面積遠小於標稱值，
// 量出來每個等級都撐得住，那個結果是假的。
function addGlare(buf, K, fraction) {
  const radius = Math.sqrt(fraction / Math.PI) * K;
  const cx = (0.35 + rnd() * 0.3) * K;
  const cy = (0.35 + rnd() * 0.3) * K;
  for (let y = 0; y < K; y += 1) {
    for (let x = 0; x < K; x += 1) {
      if (Math.hypot(x - cx, y - cy) < radius) buf[y * K + x] = 255;
    }
  }
  return buf;
}

function toRGBA(img, K, noise) {
  const data = new Uint8ClampedArray(K * K * 4);
  for (let i = 0; i < K * K; i += 1) {
    const v = img[i] + (rnd() * 2 - 1) * noise;
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  return data;
}

// K 是 QR 在相機畫面裡橫跨幾個像素。固定它等於固定「取景加相機解析度」，
// 這樣不同版本之間比較的才是同一件事。
function decodeRate(version, level, K, sigma, noise, glareFraction, trials) {
  const payload = capacityOf(version, level) - OVERHEAD;
  let ok = 0;
  for (let t = 0; t < trials; t += 1) {
    let text = '';
    for (let i = 0; i < payload; i += 1) text += String.fromCharCode(Math.floor(rnd() * 256));
    const screen = drawScreen(text, version, level);
    // 模糊量以相機像素計，所以先換算回螢幕端的尺度
    const softened = blur(screen.img, screen.size, sigma * (screen.size / K));
    let camera = downsample(softened, screen.size, K);
    if (glareFraction > 0) camera = addGlare(camera, K, glareFraction);
    const found = jsQR(toRGBA(camera, K, noise), K, K, { inversionAttempts: 'dontInvert' });
    if (found && found.binaryData && found.binaryData.length === payload) ok += 1;
  }
  return ok / trials;
}

const only = process.argv.find((a) => a.startsWith('--'));
const VERSIONS = [15, 20, 25, 30, 35, 40];
// K 是 QR 在相機畫面裡橫跨幾個像素。預設這一組對應解碼取到 1280 寬的情況，
// 用 --k=1152,1344 之類可以量更高的拍攝解析度。
const SPAN_K = (process.argv.find((a) => a.startsWith('--k=')) || '--k=896,768,640,512')
  .slice(4)
  .split(',')
  .map(Number);
const pct = (v) => `${(v * 100).toFixed(0).padStart(4)}%`;

if (!only || only === '--span') {
  console.log('一、解析度：QR 在相機畫面裡橫跨 K 個像素，鏡頭模糊 sigma=1.5px，雜訊 ±8\n');
  console.log('              ' + SPAN_K.map((k) => ('K=' + k).padEnd(12)).join(''));
  console.log('版本 方格 容錯  每格px 解碼  每格px 解碼  每格px 解碼  每格px 解碼');
  for (const version of VERSIONS) {
    const modules = 21 + 4 * (version - 1);
    const span = modules + QUIET * 2;
    for (const level of ['L', 'M']) {
      const cells = SPAN_K
        .map((K) => `${(K / span).toFixed(1).padStart(6)} ${pct(decodeRate(version, level, K, 1.5, 8, 0, 20))}`)
        .join(' ');
      console.log(`${String(version).padStart(3)} ${String(modules).padStart(4)}  ${level}  ${cells}`);
    }
  }
  console.log('\n崩潰點在每格 4.5 到 5 個相機像素之間，L 與 M 沒有差別。');
  console.log('解析度不足的失敗是整片認不出來，容錯度救不了那個。\n');
}

if (!only || only === '--glare') {
  console.log('二、局部反光：硬邊全白光斑蓋掉碼面的一部分（K=768，每組 25 次）\n');
  console.log('版本  容錯  payload   無反光   遮 5%  遮 10%  遮 15%  遮 20%  遮 25%');
  for (const version of [20, 25]) {
    for (const level of ['L', 'M', 'Q']) {
      const payload = capacityOf(version, level) - OVERHEAD;
      const cells = [0, 0.05, 0.1, 0.15, 0.2, 0.25]
        .map((f) => pct(decodeRate(version, level, 768, 1.2, 6, f, 25)))
        .join('  ');
      console.log(`${String(version).padStart(3)}    ${level}   ${String(payload).padStart(5)}   ${cells}`);
    }
  }
  console.log('\n對得上規格：L 修 7%、M 修 15%、Q 修 25% 的碼字。');
  console.log('螢幕反光蓋掉一成碼面很常見，那正好是 L 死掉、M 還活著的區間。\n');
}
