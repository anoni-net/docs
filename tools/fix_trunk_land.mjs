#!/usr/bin/env node
/**
 * 把「Tor 中繼地球儀」的海纜走廊示意線推離陸地。
 *
 * atlas.js 的 TRUNK 是手寫的登陸地點清單，中間拉大圓弧。問題是大圓弧會抄近路直接
 * 切過大陸，沿岸走廊尤其嚴重。第一版 24 條裡有 18 條壓到陸地，非洲東岸那條有 73 個
 * 取樣點在內陸，靠肉眼補中繼點補不完。
 *
 * 做法：拿 countries.json 的國界對弧線每 0.4 度取樣做 point-in-polygon，某一段壓到
 * 陸地就把中點往垂直方向推到最近的海上，再遞迴檢查左右兩個子段。推出來的點只要求
 * 自己在海上，子段的問題交給下一層遞迴，這比要求一次到位容易收斂得多。
 *
 * 蘇伊士地峽豁免。真實海纜就是走陸上管道跨過去，那一小段畫在陸地上是對的。
 *
 * 用法（會讀 atlas.js 現有的 TRUNK，輸出修好的座標到 trunk_fixed2.json）：
 *   node tools/fix_trunk_land.mjs
 *
 * 產出的座標要自己貼回 atlas.js 的 TRUNK。改動走廊端點之後請重跑這支，不要手工補點。
 *
 * 已知殘留：修完仍有四條走廊各有一到四個取樣點擦到海岸線，都是貼著岸走的段，
 * 在畫面上看不出來（渲染時的補點間距是 1.5 度，比這裡的檢查粗）。
 */
import fs from 'fs';
const ROOT='/home/toomore/app/anoni-net-ws/anoni-net-docs/.claude/worktrees/games-phase1/docs/zh-TW/games/tor-network/';
const src=fs.readFileSync(ROOT+'atlas.js','utf8');
const TRUNK=eval('['+src.match(/const TRUNK = \[([\s\S]*?)\n\];/)[1]+']');
const world=JSON.parse(fs.readFileSync(ROOT+'countries.json','utf8'));
const boxes=world.c.map(c=>{let lo0=999,lo1=-999,la0=999,la1=-999;
  for(const r of c.p) for(let i=0;i<r.length;i+=2){
    if(r[i]<lo0)lo0=r[i]; if(r[i]>lo1)lo1=r[i];
    if(r[i+1]<la0)la0=r[i+1]; if(r[i+1]>la1)la1=r[i+1];}
  return {c,lo0,lo1,la0,la1};});
function inRing(lon,lat,r){let ins=false;
  for(let i=0,j=r.length-2;i<r.length;j=i,i+=2){const xi=r[i],yi=r[i+1],xj=r[j],yj=r[j+1];
    if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi)) ins=!ins;}
  return ins;}
// 蘇伊士地峽：真實海纜就是走陸上管道跨過去，這一小塊不算錯
const EXEMPT=(lat,lon)=> lat>29.2&&lat<31.6&&lon>31.8&&lon<32.9;
function isLand(lat,lon){
  if(EXEMPT(lat,lon)) return false;
  for(const b of boxes){ if(lon<b.lo0||lon>b.lo1||lat<b.la0||lat>b.la1) continue;
    for(const r of b.c.p) if(inRing(lon,lat,r)) return true; }
  return false;}
const toVec=(lat,lon)=>{const p=(90-lat)*Math.PI/180,t=(lon+180)*Math.PI/180;
  return [-Math.sin(p)*Math.cos(t),Math.cos(p),Math.sin(p)*Math.sin(t)];};
const toLL=v=>{const n=Math.hypot(...v);const lat=90-Math.acos(v[1]/n)*180/Math.PI;
  let lon=Math.atan2(v[2],-v[0])*180/Math.PI-180; if(lon<-180)lon+=360; return [lat,lon];};
function slerp(a,b,t){const A=toVec(...a),B=toVec(...b);
  const d=Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2]));
  const ang=Math.acos(d),s=Math.sin(ang);
  const w1=s<1e-6?1-t:Math.sin((1-t)*ang)/s,w2=s<1e-6?t:Math.sin(t*ang)/s;
  return toLL([A[0]*w1+B[0]*w2,A[1]*w1+B[1]*w2,A[2]*w1+B[2]*w2]);}
function angDeg(a,b){const A=toVec(...a),B=toVec(...b);
  return Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2])))*180/Math.PI;}
function segBad(a,b){const steps=Math.max(2,Math.ceil(angDeg(a,b)/0.4));
  for(let k=1;k<steps;k++){const p=slerp(a,b,k/steps); if(isLand(p[0],p[1])) return true;}
  return false;}
// 只要求推出的點本身在海上。子段的問題交給遞迴處理，原本要求兩邊都乾淨太嚴格，
// 沿岸走廊幾乎永遠找不到解。
function pushToSea(a,b){
  const mid=slerp(a,b,0.5);
  const brg=Math.atan2(b[1]-a[1],b[0]-a[0]);
  const cosLat=Math.max(0.25,Math.cos(mid[0]*Math.PI/180));
  let best=null;
  for(let d=0.3; d<=26; d+=0.3){
    for(const sgn of [1,-1]){
      const lat=mid[0]+Math.cos(brg+Math.PI/2)*d*sgn;
      const lon=mid[1]+Math.sin(brg+Math.PI/2)*d*sgn/cosLat;
      if(Math.abs(lat)>84) continue;
      if(!isLand(lat,lon)){ best=[+lat.toFixed(2),+((lon+540)%360-180).toFixed(2)]; break; }
    }
    if(best) break;
  }
  return best;}
function fix(a,b,depth){
  if(depth>11 || !segBad(a,b)) return [];
  const s=pushToSea(a,b);
  if(!s) return [];
  return [...fix(a,s,depth+1), s, ...fix(s,b,depth+1)];}

const out=[]; let added=0;
TRUNK.forEach((route,ri)=>{
  const nr=[route[0]];
  for(let i=0;i+1<route.length;i++){
    const ins=fix(route[i],route[i+1],0);
    added+=ins.length; nr.push(...ins, route[i+1]);
  }
  if(nr.length!==route.length) console.log(`  #${ri}  ${route.length} → ${nr.length} 點`);
  out.push(nr);
});
console.log(`\n  插入 ${added} 個繞行點`);
fs.writeFileSync('trunk_fixed2.json', JSON.stringify(out));
