/* S:Arch 2026+ indicative maintenance cost engine.
 * Official: 2026H2 CAK wages. All materials, equipment and unmatched labor are
 * explicit proxy estimates, NOT public tender unit prices.
 */
(function(root){'use strict';
 const FALLBACK={
  schemaVersion:1,rateYear:2026,half:'H2',effectiveFrom:'2026-09-01',
  checkedAt:'2026-11-18',publisher:'대한건설협회',
  sourceUrl:'https://www.cak.or.kr/lay1/bbs/S1T41C42/A/14/view.do?article_seq=160598',
  wagesKRWPerDay:{normal:172698,special:228717,plaster:279102},status:'published'
 };
 let latest=FALLBACK;
 const now=()=>new Date();
 const money=v=>Math.round(v*1000)/1000;
 const valid=d=>!!(d&&Number.isInteger(d.rateYear)&&d.rateYear>=2026&&/^(H1|H2)$/.test(d.half)&&
   d.wagesKRWPerDay&&['normal','special','plaster'].every(k=>Number.isFinite(d.wagesKRWPerDay[k])&&d.wagesKRWPerDay[k]>70000&&d.wagesKRWPerDay[k]<1000000)&&
   /^\d{4}-\d{2}-\d{2}$/.test(String(d.effectiveFrom||''))&&String(d.sourceUrl||'').startsWith('https://'));
 const ordinal=d=>d.rateYear*2+(d.half==='H2'?1:0);
 function current(){
  const d=now(),yr=d.getFullYear(),isH2=d.getMonth()>=8;
  const currentOrdinal=yr*2+(isH2?1:0),delta=Math.max(0,currentOrdinal-ordinal(latest));
  // Provisional carry-forward: 1.5% per half-year, NOT the future year's published wage.
  const factor=Math.pow(1.015,delta),estimated=delta>0;
  return {year:yr,half:isH2?'H2':'H1',baseYear:latest.rateYear,baseHalf:latest.half,
   wages:{normal:latest.wagesKRWPerDay.normal*factor,special:latest.wagesKRWPerDay.special*factor,plaster:latest.wagesKRWPerDay.plaster*factor},
   factor,estimated,sourceUrl:latest.sourceUrl,checkedAt:latest.checkedAt,
   description:estimated?yr+'년 '+(isH2?'하반기':'상반기')+' 공식 노임 미확인: '+latest.rateYear+'년 '+latest.half+' 노임을 반기당 1.5% 가정 상향한 비공식 추정':'공표 노임 '+latest.rateYear+'년 '+latest.half+' 적용 기준'};
 }
 function propose(d,r,verifiedLabor){
  const w=current(),v=w.wages,t=String((d.types||[])[0]||''),group=r.group||'';
  const finish=(v.special*3+v.normal)/81/1000;
  const repair=(v.special*3+v.normal)/9/1000;
  const materialScale=Math.pow(1.03,Math.max(0,w.year-2026));
  let labor=Number.isFinite(verifiedLabor)&&verifiedLabor>=0?verifiedLabor:null;
  let material=0,equipment=0,proxy='',note='';
  if(/균열/.test(t)&&!/망상/.test(t)&&group==='구조체'){
   const span=Number(d.treatmentWidth)>0?Number(d.treatmentWidth):Number(d.width);
   const band=span>0?Math.max(.1,span)/1000:.0002;
   // Proxy 1.5–3.5 thousand KRW per *linear metre*, converted to m².
   const inject=Number(d.width)>=.3;
   if(labor===null){labor=(inject?(v.special*2+v.normal)/28/1000:v.plaster/110/1000)/band;note='균열 보수폭 가정 0.2mm';}
   material=(inject?3.5:1.5)/band*materialScale;
   equipment=(inject?2.0:1.0)/band*materialScale;
   proxy=inject?'균열주입 유사공법':'균열 표면처리 유사공법';
  }else if(/망상균열/.test(t)){
   if(labor===null)labor=finish;
   material=14*materialScale;equipment=5*materialScale;proxy='면적 표면처리 유사공법';
  }else if(/철근노출|구조체 부식|철근부식/.test(t)){
   if(labor===null)labor=repair;
   material=45*materialScale;equipment=21*materialScale;proxy='철근방청+단면복구 유사공법';
  }else if(/박락|박리|재료분리|파손/.test(t)&&group==='구조체'){
   if(labor===null)labor=repair;
   material=37*materialScale;equipment=18*materialScale;proxy='단면복구 유사공법(50mm 가정)';
  }else if(/누수|방수/.test(t)){
   if(labor===null)labor=finish*2.3;
   material=42*materialScale;equipment=18*materialScale;proxy='방수 보수+마감재 재시공 유사공법';
   note='누수 원인·방수공법·마감재 규격 미확정';
  }else if(/백태|백화/.test(t)){
   if(labor===null)labor=finish*.8;
   material=9*materialScale;equipment=5*materialScale;proxy='세척·표면처리 유사공법';
  }else if(/줄눈/.test(t)){
   if(labor===null)labor=finish*1.2;
   material=12*materialScale;equipment=6*materialScale;proxy='줄눈 실링 유사공법';
  }else if(/마감|비구조체 균열|비구조체 표면손상/.test(t)||group==='비구조체'){
   if(labor===null)labor=finish*1.4;
   material=23*materialScale;equipment=8*materialScale;proxy='마감재 보수·재시공 유사공법';
  }else if(/변형|처짐|침하|변위/.test(t)){
   if(labor===null)labor=repair*.75;
   material=38*materialScale;equipment=26*materialScale;proxy='응급조치 범위 가정';
   note='구조 안전성 검토와 실제 보수설계 비용은 포함하지 않음';
  }else{
   if(labor===null)labor=finish*1.5;
   material=24*materialScale;equipment=12*materialScale;proxy='보수범위 미확정 일반 보수 유사공법';
  }
  const unitRate=money(labor+material+equipment);
  return {rate:money(labor),materialRate:money(material),otherRate:money(equipment),
   automaticProxy:true,estimateStatus:w.estimated?'과거연도 기준 이월 추정':'유사공법 추정',
   source:'[노무] '+(verifiedLabor!==null&&!w.estimated?'2026 공표 품셈/노임 계산':'유사 공법/과거 공표 노임을 이용한 추정')+
          ' / [재료·장비] '+proxy+' 가정값(공식 조달청 자재단가 아님)'+(note?' / '+note:'')+
          ' / 기준 '+w.description+
          ' / 단위 천원/㎡, 소규모 공사 출동비·현장 조건·부가세 별도 / '+w.sourceUrl,
   unitRate,meta:w};
 }
 function accept(input){
  if(!valid(input)||ordinal(input)<ordinal(latest))return false;
  // Never apply publication whose effective date is in the future.
  if(new Date(input.effectiveFrom+'T00:00:00')>now())return false;
  latest=input;root.dispatchEvent?.(new Event('sarch-cost-update'));return true;
 }
 async function check(){
  try{
   const url='./cost-data.json?checked='+Math.floor(Date.now()/86400000);
   const response=await fetch(url,{cache:'no-store'});
   if(!response.ok)return false;
   return accept(await response.json());
  }catch(e){return false}
 }
 root.SARCHCostRates={current,propose,accept,check};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
})(window);
