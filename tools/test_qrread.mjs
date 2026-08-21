#!/usr/bin/env node
/**
 * QR code 讀取器（docs/zh-TW/js/qrread.js）的單元測試。
 *
 * === 為什麼需要這支 ===
 *
 * 解碼交給 vendor 的 jsQR，這裡要驗的是「我們呼叫的方式對不對」與「讀回來的內容
 * 怎麼呈現給讀者」。後者比想像中重要：解出來的可能是釣魚網址，工具不該讓讀者一按
 * 就開，也不該把它渲染成可點的連結。
 *
 * === 往返怎麼做 ===
 *
 * 用 qrcode-generator 產生已知內容的碼、把模組矩陣放大成像素、再交給 jsQR 讀回來比對。
 * 編碼與解碼是兩個各自獨立的函式庫，互相驗證比拿同一份程式碼驗自己有意義。這也順便
 * 守住一件事：qrcode.js 產生的碼，qrread.js 讀得回來。
 *
 * 用法：
 *   node tools/test_qrread.mjs
 * 不需要建置產物，也沒有外部相依。
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'docs', 'zh-TW', 'js', 'qrread.js');
const VENDOR = path.join(HERE, '..', 'docs', 'zh-TW', 'utils', 'vendor');
const src = fs.readFileSync(SRC, 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const require_ = createRequire(import.meta.url);
const qrcode = require_(path.join(VENDOR, 'qrcode-generator.js'));
const jsQR = require_(path.join(VENDOR, 'jsQR.js'));
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error(`qrread.js 裡找不到 ${re}`);
  return m[0];
};

// DANGEROUS 到 classify 結尾是一整段沒有 DOM 相依的純邏輯，整段抽出來比逐個
// 函式抽穩，新增一個 parseXxx 不用回頭改這裡。STRINGS 另外抽，用來驗三語系文案沒漏。
const harness = `
  ${grab(/^  const SCALE = .*$/m)}
  ${grab(/^  const QUIET = .*$/m)}
  ${grab(/^  const DANGEROUS = [\s\S]*?\n  function classify\(text\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const DOTS = [\s\S]*?\n  function maskRaw\(text, info\) \{[\s\S]*?\n  \}/m)}
  ${grab(/^  const STRINGS = \{[\s\S]*?\n  \};/m)}
  return { SCALE, QUIET, classify, maskRaw, STRINGS, SHORTENERS, TRACKERS };
`;
const tool = new Function(harness)();

// 依 key 取欄位，測試裡到處要用
const field = (info, key) => (info.fields || []).find((f) => f.key === key);
const values = (info) => (info.fields || []).map((f) => f.value).filter(Boolean).join(' ');

// 把 qrcode-generator 的矩陣放大成 RGBA 像素，模擬讀者上傳的圖片
function render(text, level = 'M', scale = 6, quiet = 4) {
  const qr = qrcode(0, level);
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const size = (count + quiet * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          const px = ((row + quiet) * scale + y) * size + (col + quiet) * scale + x;
          data[px * 4] = 0;
          data[px * 4 + 1] = 0;
          data[px * 4 + 2] = 0;
        }
      }
    }
  }
  return { data, width: size, height: size };
}

const roundTrip = (text, level) => {
  const img = render(text, level);
  const result = jsQR(img.data, img.width, img.height);
  return result ? result.data : null;
};

let passed = 0;
let failed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('產生的碼讀得回來，一字不差', () => {
  for (const text of [
    'hello',
    'https://anoni.net/docs/',
    'http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/',
    '匿名網路社群 anoni.net',
  ]) {
    assert.equal(roundTrip(text), text, `${text.slice(0, 20)} 對不上`);
  }
});

test('四種容錯度都讀得回來', () => {
  for (const level of ['L', 'M', 'Q', 'H']) {
    assert.equal(roundTrip('anoni.net', level), 'anoni.net', `${level} 級讀不回來`);
  }
});

test('長內容也讀得回來', () => {
  const bridge =
    'obfs4 192.0.2.1:9001 ABCDEF0123456789ABCDEF0123456789ABCDEF01 ' +
    'cert=aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789abcdefghijklmnopqrstuvwxyzAB iat-mode=0';
  assert.equal(roundTrip(bridge), bridge);
});

test('沒有 QR code 的圖回 null，不是丟例外', () => {
  const blank = new Uint8ClampedArray(100 * 100 * 4).fill(255);
  assert.equal(jsQR(blank, 100, 100), null);
});

test('內容分類：網址、onion、bridge、純文字', () => {
  assert.equal(tool.classify('https://anoni.net/').kind, 'url');
  assert.equal(tool.classify('http://example.onion/').kind, 'onion');
  assert.equal(tool.classify('obfs4 192.0.2.1:9001 ABCDEF cert=x iat-mode=0').kind, 'bridge');
  assert.equal(tool.classify('就是一段字').kind, 'text');
  assert.equal(tool.classify('WIFI:S:name;T:WPA;P:pass;;').kind, 'wifi');
});

test('網址分類會標出主機，讓讀者自己看清楚', () => {
  // 釣魚 QR 的重點就在這裡：內容看起來像官網，主機不是
  const info = tool.classify('https://аpple.com/login');
  assert.equal(info.kind, 'url');
  assert.equal(info.host, 'xn--pple-43d.com', '同形字主機要顯示成 punycode 才看得出問題');
});

test('不是網址的東西不會被誤判成網址', () => {
  for (const text of ['hello world', '這是一段中文', '12345', 'not a url at all']) {
    assert.equal(tool.classify(text).kind, 'text', `${text} 被誤判了`);
  }
});

test('放大倍率與留白留得夠，太小的話 jsQR 讀不到', () => {
  assert.ok(tool.SCALE >= 4, `SCALE 只有 ${tool.SCALE}`);
  assert.ok(tool.QUIET >= 4, `QUIET 只有 ${tool.QUIET}`);
});

test('沒有任何網路請求，圖片不上傳', () => {
  // 讀者掃的可能是他不想外流的東西
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket',
                        'localStorage', 'sessionStorage', 'indexedDB']) {
    assert.ok(!code.includes(needle), `出現了 ${needle}`);
  }
});

test('不把解出來的內容渲染成可點的連結', () => {
  // 解出來的可能是釣魚網址。顯示可以，一按就開不行。
  assert.ok(!/createElement\(["']a["']\)/.test(code), '出現了 createElement("a")');
  assert.ok(!code.includes('window.open'), '出現了 window.open');
  assert.ok(!code.includes('location.href ='), '出現了跳轉');
});

test('Wi-Fi 設定拆成欄位，密碼標成要遮起來的', () => {
  const info = tool.classify('WIFI:S:CafeNet;T:WPA;P:hunter2;H:true;;');
  assert.equal(info.kind, 'wifi');
  assert.equal(field(info, 'ssid').value, 'CafeNet');
  assert.equal(field(info, 'security').value, 'WPA');
  assert.equal(field(info, 'password').value, 'hunter2');
  assert.equal(field(info, 'password').secret, true, '密碼沒有標成 secret，畫面上就不會遮');
  assert.ok(field(info, 'hidden'), '隱藏網路沒有列出來');
});

test('Wi-Fi 的 SSID 與密碼裡有分號也切得對', () => {
  // 分號是格式的分隔符號，SSID 用得到它的時候要跳脫。直接 split(";") 會把名字切一半
  const info = tool.classify('WIFI:S:My\\;Net;T:WPA;P:pa\\;ss;;');
  assert.equal(field(info, 'ssid').value, 'My;Net');
  assert.equal(field(info, 'password').value, 'pa;ss');
});

test('沒有密碼的 Wi-Fi 會警告，WEP 也會', () => {
  const open = tool.classify('WIFI:S:FreeWiFi;T:nopass;;');
  assert.equal(field(open, 'security').token, 'wifiOpen');
  assert.ok(open.warns.includes('wifiOpen'), '開放網路沒有警告');

  const wep = tool.classify('WIFI:S:Old;T:WEP;P:1234567890;;');
  assert.ok(wep.warns.includes('wifiWep'), 'WEP 沒有警告');

  const wpa = tool.classify('WIFI:S:Home;T:WPA;P:secret;;');
  assert.deepEqual(wpa.warns, [], 'WPA 不該有警告');
});

test('省略了 T 的 Wi-Fi 不猜成 WPA', () => {
  // 格式定義裡 T 留空就是沒有密碼，但省略 T 卻給 P 的產生器實際存在。
  // 猜一個 WPA 出來會讓讀者以為連上去是安全的。
  const withPass = tool.classify('WIFI:S:Net;P:secret;;');
  assert.equal(field(withPass, 'security').token, 'wifiUnknown');
  assert.deepEqual(withPass.warns, [], '說不準的時候不要亂警告');

  const noPass = tool.classify('WIFI:S:Net;;');
  assert.equal(field(noPass, 'security').token, 'wifiOpen', '沒有 T 也沒有 P 就是開放網路');
});

test('otpauth 拆出發行者與帳號，密鑰不列進欄位', () => {
  const info = tool.classify(
    'otpauth://totp/GitHub:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub&digits=6');
  assert.equal(info.kind, 'otp');
  assert.equal(field(info, 'issuer').value, 'GitHub');
  assert.equal(field(info, 'account').value, 'alice@example.com');
  assert.equal(field(info, 'otpType').value, 'TOTP');
  assert.ok(info.warns.includes('otpSecret'), '沒有提醒裡面有密鑰');
});

test('otpauth 的密鑰不會出現在任何一個欄位的值裡', () => {
  // 欄位表是讀者的視線焦點。那一串等於第二因素本身，拿到的人可以自己算出驗證碼
  const secret = 'JBSWY3DPEHPK3PXP';
  const info = tool.classify(`otpauth://totp/Acme:bob?secret=${secret}&issuer=Acme`);
  assert.ok(!values(info).includes(secret), '密鑰漏進欄位了');
});

test('mailto 拆出收件人、主旨、內文，有內文就提醒', () => {
  const subject = encodeURIComponent('應徵');
  const body = encodeURIComponent('請收');
  const info = tool.classify(`mailto:hr@example.com?subject=${subject}&body=${body}`);
  assert.equal(info.kind, 'mail');
  assert.equal(field(info, 'to').value, 'hr@example.com');
  assert.equal(field(info, 'subject').value, '應徵');
  assert.equal(field(info, 'body').value, '請收');
  assert.ok(info.warns.includes('mailBody'), '信的內容已經寫好了卻沒提醒');

  const plain = tool.classify('mailto:hi@example.com');
  assert.deepEqual(plain.warns, [], '沒有預填內容就不用提醒');
});

test('電話與簡訊，兩種 smsto 寫法都拆得開', () => {
  assert.equal(field(tool.classify('tel:+886912345678'), 'number').value, '+886912345678');

  const sms = tool.classify('sms:+886912345678?body=OK');
  assert.equal(sms.kind, 'sms');
  assert.equal(field(sms, 'body').value, 'OK');

  // smsto:號碼:內文 是另一種常見寫法
  const smsto = tool.classify('smsto:0912345678:OK');
  assert.equal(field(smsto, 'number').value, '0912345678');
  assert.equal(field(smsto, 'body').value, 'OK');
  assert.ok(smsto.warns.includes('smsBody'));
});

test('座標拆出經緯度，並換算成看得懂的精度', () => {
  const info = tool.classify('geo:25.0330,121.5654');
  assert.equal(info.kind, 'geo');
  assert.equal(field(info, 'lat').value, '25.0330');
  assert.equal(field(info, 'lon').value, '121.5654');
  assert.ok(info.warns.includes('geoLeak'));

  // 小數第 4 位在緯度方向大約是 11 公尺，指得到一棟建築
  const p4 = field(tool.classify('geo:25.0330,121.5654'), 'precision');
  assert.equal(p4.value, '11');
  assert.equal(p4.unit, 'm');

  // 整數度只能指到一個區域
  const p0 = field(tool.classify('geo:25,121'), 'precision');
  assert.equal(p0.unit, 'km');
  assert.equal(p0.value, '111.3');

  // 小數第 5 位到公尺以內
  const p5 = field(tool.classify('geo:25.03300,121.56540'), 'precision');
  assert.equal(p5.value, '1.1');
  assert.equal(p5.unit, 'm');
});

test('geo: 後面不是座標就不硬解', () => {
  assert.equal(tool.classify('geo:not,coords').kind, 'text');
});

test('名片兩種格式都拆得開', () => {
  const vcard = tool.classify(
    'BEGIN:VCARD\nVERSION:3.0\nN:Wang;Ming\nFN:王小明\nORG:某某公司;\n' +
    'TEL;TYPE=CELL:0912345678\nEMAIL:a@example.com\nEND:VCARD');
  assert.equal(vcard.kind, 'contact');
  assert.equal(field(vcard, 'name').value, '王小明', 'FN 比 N 好讀，有 FN 要用它');
  assert.equal(field(vcard, 'org').value, '某某公司');
  assert.equal(field(vcard, 'number').value, '0912345678', 'TEL 後面掛參數也要認得');
  assert.equal(field(vcard, 'email').value, 'a@example.com');

  const mecard = tool.classify('MECARD:N:王,小明;TEL:0912345678;EMAIL:a@example.com;;');
  assert.equal(mecard.kind, 'contact');
  assert.equal(field(mecard, 'name').value, '王 小明', 'MECARD 的逗號是姓名分隔，不是內容');
});

test('會直接執行的協定標成危險', () => {
  for (const text of ['javascript:alert(1)', 'data:text/html,<h1>x</h1>', 'file:///etc/passwd']) {
    const info = tool.classify(text);
    assert.equal(info.kind, 'danger', `${text.slice(0, 16)} 沒有標成危險`);
    assert.ok(info.warns.includes('danger'));
  }
});

test('短網址認得出來，並說清楚目的地要連上去才知道', () => {
  for (const host of ['bit.ly', 'reurl.cc', 'pse.is', 'lihi2.cc']) {
    const info = tool.classify(`https://${host}/abc123`);
    assert.ok(info.warns.includes('shortener'), `${host} 沒有認出是短網址`);
  }
  // www. 開頭同樣要認得
  assert.ok(tool.classify('https://www.bit.ly/x').warns.includes('shortener'));
  // 一般網域不該被誤判
  assert.ok(!tool.classify('https://anoni.net/docs/').warns.includes('shortener'));
});

test('追蹤參數數得出來，並指去網址清理器', () => {
  const info = tool.classify('https://example.com/a?utm_source=fb&utm_medium=cpc&fbclid=xyz&id=42');
  assert.equal(field(info, 'tracking').value, '3', 'utm_source、utm_medium、fbclid 共三個');
  assert.ok(info.warns.includes('tracking'));

  const clean = tool.classify('https://example.com/a?id=42');
  assert.equal(field(clean, 'tracking'), undefined, '沒有追蹤參數就不要多一列');
  assert.deepEqual(clean.warns, []);
});

test('onion 網址不會被短網址或追蹤參數的判斷蓋掉', () => {
  const info = tool.classify(
    'http://docs.anoninetru5tflukgfaehun7q6khowgmymcff3gtk5oyesqazhmfxtyd.onion/?utm_source=x');
  assert.equal(info.kind, 'onion');
});

test('三個語系的文案 key 完全一致', () => {
  const langs = Object.keys(tool.STRINGS);
  assert.ok(langs.length >= 3, `只有 ${langs.length} 個語系`);
  const keysOf = (obj) => Object.keys(obj).sort().join(',');
  const base = tool.STRINGS[langs[0]];
  for (const lang of langs.slice(1)) {
    const other = tool.STRINGS[lang];
    assert.equal(keysOf(other), keysOf(base), `${lang} 的頂層 key 對不上`);
    for (const group of ['kinds', 'labels', 'tokens', 'units', 'warns']) {
      assert.equal(keysOf(other[group]), keysOf(base[group]), `${lang} 的 ${group} 對不上`);
    }
  }
});

test('classify 產得出來的每一個 kind、warn、label 三個語系都查得到', () => {
  // 漏翻一個 key 畫面上會出現 undefined，而且只在那個語系、那種內容才看得到
  const samples = [
    'https://anoni.net/', 'https://bit.ly/x', 'https://example.com/?utm_source=a&fbclid=b',
    'http://x.onion/', 'obfs4 192.0.2.1:9001 AB cert=x iat-mode=0', '一段文字',
    'WIFI:S:A;T:WPA;P:p;H:true;;', 'WIFI:S:A;T:nopass;;', 'WIFI:S:A;T:WEP;P:p;;', 'WIFI:S:A;P:p;;',
    'otpauth://totp/A:b?secret=JBSWY3DP&issuer=A', 'mailto:a@b.c?subject=S&body=B',
    'tel:+886912345678', 'smsto:0912:hi', 'geo:25.033,121.565', 'geo:25,121',
    'MECARD:N:王,小明;TEL:0912;EMAIL:a@b.c;URL:https://x.tw;;',
    'BEGIN:VCARD\nFN:A\nORG:B\nTEL:0912\nEMAIL:a@b.c\nURL:https://x.tw\nEND:VCARD',
    'javascript:alert(1)',
  ];
  const kinds = new Set();
  const labels = new Set();
  const tokens = new Set();
  const units = new Set();
  const warns = new Set();
  for (const text of samples) {
    const info = tool.classify(text);
    kinds.add(info.kind);
    for (const f of info.fields || []) {
      labels.add(f.key);
      if (f.token) tokens.add(f.token);
      if (f.unit) units.add(f.unit);
    }
    for (const w of info.warns || []) warns.add(w);
  }
  assert.ok(kinds.size >= 11, `樣本只涵蓋 ${kinds.size} 種 kind，太少了`);
  for (const [lang, strings] of Object.entries(tool.STRINGS)) {
    for (const k of kinds) assert.ok(strings.kinds[k], `${lang} 少了 kind「${k}」`);
    for (const k of labels) assert.ok(strings.labels[k], `${lang} 少了 label「${k}」`);
    for (const k of tokens) assert.ok(strings.tokens[k], `${lang} 少了 token「${k}」`);
    for (const k of units) assert.ok(k in strings.units, `${lang} 少了 unit「${k}」`);
    for (const k of warns) assert.ok(strings.warns[k], `${lang} 少了 warn「${k}」`);
  }
});

test('Wi-Fi 與名片的碼產生後讀得回來，欄位也還拆得對', () => {
  const text = 'WIFI:S:\u516C\u5171\u7db2\u8def;T:nopass;;';
  assert.equal(roundTrip(text), text, 'Wi-Fi 的碼讀不回來');
  const info = tool.classify(roundTrip(text));
  assert.equal(field(info, 'ssid').value, '\u516C\u5171\u7db2\u8def');
  assert.ok(info.warns.includes('wifiOpen'));
});

test('原始內容那一格預設遮掉密鑰與 Wi-Fi 密碼', () => {
  // 警告文字叫讀者小心，畫面卻把那一串攤開，兩件事對不起來
  const otp = 'otpauth://totp/GitHub:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';
  const maskedOtp = tool.maskRaw(otp, tool.classify(otp));
  assert.ok(!maskedOtp.includes('JBSWY3DPEHPK3PXP'), '密鑰沒有被遮掉');
  assert.ok(maskedOtp.includes('issuer=GitHub'), '把 secret 以外的東西也遮掉了');

  const wifi = 'WIFI:S:CafeNet;T:WPA;P:hunter2;;';
  const maskedWifi = tool.maskRaw(wifi, tool.classify(wifi));
  assert.ok(!maskedWifi.includes('hunter2'), 'Wi-Fi 密碼沒有被遮掉');
  assert.ok(maskedWifi.includes('S:CafeNet'), '把網路名也遮掉了');
});

test('密碼裡有跳脫過的分號也遮得掉', () => {
  // 欄位值是反跳脫後的 pa;ss，拿它去比對原文裡的 pa\;ss 會找不到
  const wifi = 'WIFI:S:Net;T:WPA;P:pa\\;ss;;';
  assert.ok(wifi.includes('pa\\;ss'), '測試輸入自己就沒跳脫，那什麼都驗不到');
  const masked = tool.maskRaw(wifi, tool.classify(wifi));
  assert.ok(!masked.includes('pa\\;ss'), '跳脫過的密碼漏在畫面上');
  assert.ok(!masked.includes('pa;ss'), '反跳脫後的密碼也不能出現');
});

test('沒有敏感內容的就原樣顯示，不要多此一舉', () => {
  for (const text of ['https://anoni.net/docs/', '一段文字', 'geo:25.033,121.565',
                      'mailto:a@b.c?subject=hi', 'WIFI:S:FreeWiFi;T:nopass;;']) {
    assert.equal(tool.maskRaw(text, tool.classify(text)), text, `${text.slice(0, 20)} 被動到了`);
  }
});

for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message.split('\n').slice(0, 4).join('\n    ')}`);
    failed += 1;
  }
}
console.log(`\n${passed} 通過，${failed} 失敗`);
process.exit(failed ? 1 : 0);
