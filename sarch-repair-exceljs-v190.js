/* S:ARCH canonical repair-cost XLSX export, v190.
 * Uses pinned ExcelJS 4.4.0 (local/offline), never handcrafted SpreadsheetML.
 * Keeps the previous ZIP builder in the repository for legacy reference only.
 */
(function(root){'use strict';
 const VERSION='191';
 const TEXT_LIMIT=32000;
 const safeText=v=>Array.from(String(v??'')).filter(ch=>{
  const p=ch.codePointAt(0);
  return p===9||p===10||p===13||(p>=32&&p<=0xD7FF)||(p>=0xE000&&p<=0xFFFD)||(p>=0x10000&&p<=0x10FFFF);
 }).join('').slice(0,TEXT_LIMIT);
 const numeric=v=>typeof v==='number'&&Number.isFinite(v);
 const shade={navy:'12304B',dark:'173E63',pale:'F0F6FB',cream:'FFF2DB',white:'FFFFFF',border:'D4E0EA'};
 const fmt='#,##0.000';
 const headerLabels=['층/도면','결함번호','구분','손상명','적용공법','보수물량(㎡)','단위','단가(천원/㎡)','공사비(천원)','우선순위','사진','단가 산정 근거'];
 const widths=[22,13,13,24,30,18,9,20,19,13,12,74];
 const summaryWidths=[24,12,18,22,28,18,32,12,18,22,28,4];
 // Keep the original damage type in the detail sheet; group equivalent
 // structural/nonstructural names in the summary. Composite types are one row
 // so the sum cannot double-count a single defect.
 function damageKey(type){
  const parts=safeText(type||'미지정').split('/').map(v=>v.trim().replace(/^(?:비구조체|구조체)\s+/,'')).filter(Boolean);
  return [...new Set(parts)].sort((a,b)=>a.localeCompare(b,'ko')).join(' / ')||'미지정';
 }
 const exactCriteria=v=>'"='+v.replace(/~/g,'~~').replace(/\*/g,'~*').replace(/\?/g,'~?').replace(/"/g,'""')+'"';
 let loading;
 function ensureLibrary(){
  if(root.ExcelJS?.Workbook)return Promise.resolve(root.ExcelJS);
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   if(typeof document==='undefined'){reject(new Error('ExcelJS 라이브러리가 없습니다.'));return}
   const node=document.createElement('script');
   node.src='./vendor/exceljs.min.js?v=190';
   node.async=true;node.onload=()=>{
    if(root.ExcelJS?.Workbook)resolve(root.ExcelJS);
    else reject(new Error('ExcelJS가 정상 등록되지 않았습니다.'));
   };
   node.onerror=()=>reject(new Error('오프라인 엑셀 작성기를 불러오지 못했습니다. 온라인에서 한 번 실행하세요.'));
   document.head.appendChild(node);
  }).catch(err=>{loading=null;throw err});
  return loading;
 }
 const color=h=>({argb:'FF'+h});
 function style(cell,{background=shade.white,white=false,bold=false,size=10,wrap=true,align='center',number=false}={}){
  cell.font={name:'Malgun Gothic',size,bold,color:color(white?shade.white:'222222')};
  cell.fill={type:'pattern',pattern:'solid',fgColor:color(background)};
  cell.alignment={vertical:'middle',horizontal:align,wrapText:wrap};
  cell.border={top:{style:'thin',color:color(shade.border)},bottom:{style:'thin',color:color(shade.border)},
               left:{style:'thin',color:color(shade.border)},right:{style:'thin',color:color(shade.border)}};
  if(number)cell.numFmt=fmt;
 }
 function section(ws,range,text,line,fill=shade.navy){
  ws.mergeCells(range);
  const ref=range.split(':')[0],c=ws.getCell(ref);c.value=safeText(text);
  style(c,{background:fill,white:true,bold:true,size:line===1?18:10,align:line===1?'left':'center'});
  ws.getRow(line).height=line===1?45:line===2?30:29;
 }
 function formatHeader(ws,row,start=1,end=12){
  ws.getRow(row).height=35;
  for(let c=start;c<=end;c++)style(ws.getRow(row).getCell(c),{background:shade.dark,white:true,bold:true});
 }
 function asEntries(payload){
  const input=Array.isArray(payload.rows)?payload.rows:[];
  return input.map(v=>({...v,
   page:safeText(v.page||'도면'),
   group:safeText(v.group||'-'),
   type:safeText(v.type||'-'),
   method:safeText(v.method||'-'),
   source:safeText(v.source||''),
   qty:numeric(v.qty)?v.qty:null,
   rate:numeric(v.rate)?v.rate:null,
   priority:Number(v.priority)||3
  })).sort((a,b)=>a.page.localeCompare(b.page,'ko',{numeric:true})||Number(a.number)-Number(b.number));
 }
 async function build(payload){
  const ExcelJS=await ensureLibrary();
  const workbook=new ExcelJS.Workbook();
  workbook.creator='S:Arch';workbook.lastModifiedBy='S:Arch';
  workbook.created=new Date();workbook.calcProperties.fullCalcOnLoad=true;
  const site=safeText(payload.site||'현장'),overhead=Number(payload.overhead)||0;
  const data=asEntries(payload),priced=data.filter(d=>numeric(d.qty)&&numeric(d.rate));
  const subtotal=priced.reduce((sum,d)=>sum+d.qty*d.rate,0);
  const summary=workbook.addWorksheet('개략공사비_요약',{views:[{state:'frozen',ySplit:3}]});
  const detail=workbook.addWorksheet('층별_결함별',{views:[{state:'frozen',ySplit:4}]});
  [summary,detail].forEach(ws=>{ws.columns=widths.map(w=>({width:w}));ws.properties.defaultRowHeight=21;ws.pageSetup={paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0}});
  summary.columns=summaryWidths.map(w=>({width:w}));
  // Detail: one lossless row per input record, same column meanings as v189.
  section(detail,'A1:L1','보수물량 및 개략공사비 · 층별/결함별',1);
  section(detail,'A2:L2',site+' | S:Arch 공식노임/유사공법 추정 및 사용자 단가 · 단위 천원',2,shade.dark);
  detail.mergeCells('A3:L3');detail.getCell('A3').value='공식 단가와 유사공법 가정값은 행별 산정 근거에서 구분하세요. 참고견적이며 완성공사비가 아닙니다.';
  style(detail.getCell('A3'),{background:shade.cream,align:'left'});
  detail.getRow(3).height=29;
  detail.getRow(4).values=headerLabels;formatHeader(detail,4);
  for(let i=0;i<data.length;i++){
   const d=data[i],n=i+5,amount=numeric(d.qty)&&numeric(d.rate)?d.qty*d.rate:null;
   const row=detail.getRow(n);
   row.values=[d.page,d.number,d.group,d.type,d.method,d.qty,'㎡',d.rate,null,d.priority+'순위',(d.photoCount?d.photoCount+'장':'없음'),d.source];
   row.height=Math.min(62,Math.max(32,28+Math.ceil(d.source.length/74)*7));
   for(let j=1;j<=12;j++)style(row.getCell(j),{background:i%2===0?shade.pale:shade.white,number:[6,8,9].includes(j),align:[6,8,9].includes(j)?'right':'center'});
   if(amount!==null){
    row.getCell(9).value={formula:'IF(OR(F'+n+'="",H'+n+'=""),"",F'+n+'*H'+n+')',result:amount};
   }else{
    // Blank until both the amount and rate are known; no invalid empty <v/>.
    row.getCell(9).value=null;
   }
  }
  if(data.length)detail.autoFilter={from:'A4',to:'L'+(data.length+4)};
  // Summary.
  section(summary,'A1:L1','보수물량 · 개략공사비 요약',1);
  section(summary,'A2:L2',site+' | S:Arch 현장조사 · 노무·재료·장비 개략 참고 (행별 단가근거 확인)',2,shade.dark);
  summary.mergeCells('A3:L3');
  summary.getCell('A3').value='공식 노무비, 유사공법 추정, 사용자 입력비를 포함한 참고액입니다. 현장 조건, VAT 등을 별도로 검토하세요.';
  style(summary.getCell('A3'),{background:shade.cream,align:'left'});
  summary.getRow(3).height=29;
  const put=(ref,value,kind='text')=>{
   const cell=summary.getCell(ref);cell.value=value;
   style(cell,{background:kind==='head'?shade.navy:kind==='value'?shade.pale:shade.white,
    white:kind==='head',bold:kind==='head',number:kind==='value'});
   return cell;
  };
  put('A5','전체 결함','head');put('B5',data.length,'value');
  put('C5','산정 가능','head');put('D5',priced.length,'value');
  put('E5','단가/수량 확인','head');put('F5',data.length-priced.length,'value');
  put('A7','참고 소계(천원)','head');
  put('B7', {formula:"SUM('층별_결함별'!I5:I"+Math.max(5,data.length+4)+")",result:subtotal},'value');
  put('C7','제경비 가정(%)','head');put('D7',overhead,'value');
  put('E7','참고합계(천원)','head');put('F7',{formula:'B7*(1+D7/100)',result:subtotal*(1+overhead/100)},'value');
  summary.mergeCells('A9:E9');put('A9','층/도면별 참고금액','head');
  ['층/도면','결함수','보수물량(㎡)','참고 소계(천원)','제경비 포함 참고액(천원)'].forEach((h,i)=>put('ABCDE'[i]+'10',h,'head'));
  const floors=[...new Set(data.map(d=>d.page))],methods=[...new Set(data.map(d=>d.method))];
  const last=data.length+4;
  let r=11;
  for(const floor of floors){
   const members=data.filter(d=>d.page===floor),estimated=members.filter(d=>numeric(d.qty)&&numeric(d.rate));
   const sum=estimated.reduce((a,d)=>a+d.qty*d.rate,0);
   const q=members.reduce((a,d)=>a+(numeric(d.qty)?d.qty:0),0);
   const quoted=floor.replace(/"/g,'""'),criteria='"'+quoted+'"';
   const range="'층별_결함별'!$A$5:$A$"+last;
   put('A'+r,floor);
   put('B'+r,{formula:'COUNTIF('+range+','+criteria+')',result:members.length},'value');
   put('C'+r,{formula:'SUMIF('+range+','+criteria+",'층별_결함별'!$F$5:$F$"+last+')',result:q},'value');
   put('D'+r,{formula:'SUMIF('+range+','+criteria+",'층별_결함별'!$I$5:$I$"+last+')',result:sum},'value');
   put('E'+r,{formula:'D'+r+'*(1+$D$7/100)',result:sum*(1+overhead/100)},'value');
   r++;
  }
  // Two independent summary tables share row 9/10. The method table begins
  // beneath the taller one so a large number of damage types never overlaps it.
  summary.mergeCells('G9:K9');put('G9','결함별 참고금액','head');
  ['손상명','결함수','보수물량(㎡)','참고 소계(천원)','제경비 포함 참고액(천원)'].forEach((h,i)=>put('GHIJK'[i]+'10',h,'head'));
  summary.getRow(10).height=32;
  const damageGroups=new Map();
  for(const d of data){
   const name=damageKey(d.type);
   if(!damageGroups.has(name))damageGroups.set(name,[]);
   damageGroups.get(name).push(d);
  }
  let dr=11;
  const damageRange="'층별_결함별'!$D$5:$D$"+Math.max(5,last);
  const qtyRange="'층별_결함별'!$F$5:$F$"+Math.max(5,last);
  const costRange="'층별_결함별'!$I$5:$I$"+Math.max(5,last);
  for(const [name,members] of damageGroups){
   const raw=[...new Set(members.map(d=>d.type))],criteria=raw.map(exactCriteria);
   const qty=members.reduce((a,d)=>a+(numeric(d.qty)?d.qty:0),0);
   const sum=members.reduce((a,d)=>a+(numeric(d.qty)&&numeric(d.rate)?d.qty*d.rate:0),0);
   // Exact raw type criteria ensure composite records are counted once,
   // without adding hidden helper data or altering the detail sheet.
   const countFormula=criteria.map(c=>'COUNTIF('+damageRange+','+c+')').join('+');
   const sumFormula=range=>criteria.map(c=>'SUMIF('+damageRange+','+c+','+range+')').join('+');
   put('G'+dr,name);
   const countCell=put('H'+dr,{formula:countFormula,result:members.length},'value');countCell.numFmt='0';
   put('I'+dr,{formula:sumFormula(qtyRange),result:qty},'value');
   put('J'+dr,{formula:sumFormula(costRange),result:sum},'value');
   put('K'+dr,{formula:'J'+dr+'*(1+$D$7/100)',result:sum*(1+overhead/100)},'value');
   summary.getRow(dr).height=Math.max(summary.getRow(dr).height||21,27,Math.min(62,18+Math.ceil(name.length/16)*12));
   dr++;
  }
  // The same integer format is applied to the floor counts.
  for(let i=11;i<r;i++)summary.getCell('B'+i).numFmt='0';
  ['B5','D5','F5'].forEach(ref=>summary.getCell(ref).numFmt='0');
  r=Math.max(r,dr)+2;summary.mergeCells('A'+r+':E'+r);put('A'+r,'공법별 참고금액','head');r++;
  put('A'+r,'적용공법','head');put('B'+r,'결함수','head');put('C'+r,'참고 소계(천원)','head');r++;
  for(const method of methods){
   const matched=data.filter(d=>d.method===method),sum=matched.filter(d=>numeric(d.qty)&&numeric(d.rate)).reduce((a,d)=>a+d.qty*d.rate,0);
   const criterion='"'+method.replace(/"/g,'""')+'"';
   put('A'+r,method);
   put('B'+r,{formula:"COUNTIF('층별_결함별'!$E$5:$E$"+last+','+criterion+')',result:matched.length},'value').numFmt='0';
   put('C'+r,{formula:"SUMIF('층별_결함별'!$E$5:$E$"+last+','+criterion+",'층별_결함별'!$I$5:$I$"+last+')',result:sum},'value');
   r++;
  }
  r+=2;
  for(const [key,value] of [
   ['공식 노임 출처','https://www.cak.or.kr/lay1/bbs/S1T41C42/A/14/list.do'],
   ['2026 표준품셈','https://www.kosca.or.kr/bbs/list.do?bbsId=BBS000430&menuId=MENU001141'],
   ['산정 유의사항','유사공법 자재비·장비비는 확정 단가가 아니며 현장 여건·VAT 별도 검토 필요']]){
   put('A'+r,key,'head');summary.mergeCells('B'+r+':L'+r);put('B'+r,value);summary.getRow(r).height=36;r++;
  }
  return {workbook,info:{count:data.length,priced:priced.length,format:'ExcelJS 4.4.0',version:VERSION},data};
 }
 async function download(payload){
  const {workbook,info}=await build(payload);
  const bytes=await workbook.xlsx.writeBuffer();
  // Re-open the binary file with ExcelJS itself: catches invalid relationship parts,
  // deleted sheet data, corrupt ZIP entries and formula/style serialization mistakes.
  const verify=new root.ExcelJS.Workbook();
  await verify.xlsx.load(bytes);
  const sheet=verify.getWorksheet('층별_결함별');
  if(!sheet||sheet.getRow(4).getCell(1).value!=='층/도면')
   throw new Error('개략공사비 엑셀 검증 실패: 상세 시트 제목이 없습니다.');
  if((sheet.actualRowCount||0)!==4+info.count)
   throw new Error('개략공사비 엑셀 검증 실패: 상세 데이터 행 누락 '+(sheet.actualRowCount||0)+'/'+(4+info.count));
  const blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const name=safeText(payload.site||'현장').replace(/[\\/:*?"<>|]/g,'_')+'_보수물량_개략공사비.v191.xlsx';
  const link=document.createElement('a'),url=URL.createObjectURL(blob);
  link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),20000);
  return info;
 }
 root.SARCHRepairExcelJSV190={build,download,ensureLibrary,version:VERSION};
})(typeof window!=='undefined'?window:self);
