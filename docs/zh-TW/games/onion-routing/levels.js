// 關卡定義。座標系：x 由 -16（寄件端）到 +16（收件人），y、z 約在 [-6, 6]。
// 相機預設看向原點，繞原點 orbit。節點顏色由所在地區（ASN）決定；被監聽（surveilled）、
// 被封鎖（blocked）、橋接（bridge）會覆蓋外觀。

// 地區 = 一個 ASN（自治系統）。color 用於區分不同 ASN，避開危險狀態用的紅／灰。
export const REGIONS = {
  TW: { asn: 'AS3462',  place: '台灣',   color: 0x00aeff },
  JP: { asn: 'AS2914',  place: '日本',   color: 0x8a7bff },
  DE: { asn: 'AS24940', place: '德國',   color: 0x35d0a0 },
  NL: { asn: 'AS16276', place: '荷蘭',   color: 0xffcf5c },
  US: { asn: 'AS7922',  place: '美國',   color: 0xff7ac2 },
  SE: { asn: 'AS31898', place: '瑞典',   color: 0x9ad24a },
};

// 端點座標三關共用（source 左、dest 右）。
const SRC = { x: -16, y: 0, z: 0 };
const DST = { x: 16, y: 0, z: 0 };

// r(id, region, x, y, z, extra) — 建立一個中繼節點。
function r(id, region, x, y, z, extra = {}) {
  return { id, region, x, y, z, ...extra };
}

export const LEVELS = [
  // L1 — 三跳的基本：任意 3 台都合法。
  {
    id: 'L1',
    nameKey: 'nameL1',
    objKey: 'objL1',
    teachKey: 'teachL1',
    learnMore: { labelKey: 'learnMoreTor', href: '../../tools/what-is-tor/' },
    rules: { hops: 3 },
    source: SRC,
    dest: DST,
    relays: [
      r('r1', 'TW', -7,  3, -4),
      r('r2', 'JP', -2, -3,  4),
      r('r3', 'DE',  3,  4,  2),
      r('r4', 'NL',  8, -2, -3),
      r('r5', 'US',  0,  5, -5),
    ],
  },

  // L2 — 避開監聽：有紅色被監聽節點，選乾淨路徑。
  {
    id: 'L2',
    nameKey: 'nameL2',
    objKey: 'objL2',
    teachKey: 'teachL2',
    learnMore: { labelKey: 'learnMoreTor', href: '../../tools/what-is-tor/' },
    rules: { hops: 3 },
    source: SRC,
    dest: DST,
    relays: [
      r('r1', 'TW', -8,  2, -3),
      r('r2', 'JP', -3, -4,  3, { surveilled: true }),
      r('r3', 'DE',  1,  4,  4),
      r('r4', 'NL',  4, -3, -4, { surveilled: true }),
      r('r5', 'US',  9,  2,  2),
      r('r6', 'SE',  6, -4,  1),
    ],
  },

  // L3 — 分散到不同 ASN：多台同 ASN，須挑 3 個不同 ASN。
  {
    id: 'L3',
    nameKey: 'nameL3',
    objKey: 'objL3',
    teachKey: 'teachL3',
    learnMore: { labelKey: 'learnMoreAsn', href: '../../taiwan/ooni-asn-coverage/' },
    rules: { hops: 3, requireDiversity: true },
    source: SRC,
    dest: DST,
    relays: [
      r('t1', 'TW', -9,  3, -3),
      r('t2', 'TW', -5, -4,  2),
      r('t3', 'TW', -1,  5,  3),
      r('j1', 'JP',  3, -3, -4),
      r('d1', 'DE',  8,  3,  2),
      r('u1', 'US', 12, -2,  3),
      r('s1', 'NL',  1, -5, -1, { surveilled: true }),
    ],
  },

  // L4 — 封鎖時走橋接：直連入口被封鎖，第一跳須為 bridge。
  {
    id: 'L4',
    nameKey: 'nameL4',
    objKey: 'objL4',
    teachKey: 'teachL4',
    learnMore: { labelKey: 'learnMoreSnowflake', href: '../../tools/tor-snowflake/' },
    rules: { hops: 3, requireBridge: true, censorActive: true },
    source: SRC,
    dest: DST,
    relays: [
      r('b1', 'TW', -14,  3,  2, { bridge: true, transport: 'Snowflake' }),
      r('b2', 'JP', -13, -4, -3, { bridge: true, transport: 'obfs4' }),
      r('x1', 'TW',  -6,  5, -4, { blocked: true }),
      r('x2', 'JP',  -5, -5,  3, { blocked: true }),
      r('m1', 'DE',   2,  3,  3),
      r('m2', 'NL',   6, -2, -4),
      r('e1', 'US',  11,  2,  2),
      r('e2', 'SE',   9, -4,  1),
    ],
  },
];
