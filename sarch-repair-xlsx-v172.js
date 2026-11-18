/* S:ARCH v172: two-sheet, styled offline XLSX for repair quantities and indicative costs.
   Verified labor and user-entered material/other direct costs are combined only when supplied. No external requests or photo AI inference. */
(function(root){'use strict';
 // XML 1.0 forbids C0 controls (except tab/LF/CR), lone UTF-16 surrogates
 // and U+FFFE/U+FFFF. Raw user data previously flowed directly to sheet2.xml.
 const xmlSafe=v=>Array.from(String(v??'')).filter(ch=>{
  const cp=ch.codePointAt(0);
  return cp===9||cp===10||cp===13||(cp>=32&&cp<=0xD7FF)||(cp>=0xE000&&cp<=0xFFFD)||(cp>=0x10000&&cp<=0x10FFFF);
 }).join('');
 const esc=v=>xmlSafe(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
 const alpha=i=>String.fromCharCode(65+i);
 const num=v=>typeof v==='number'&&Number.isFinite(v);
 function c(row,col,value,style=3,formula=null){
  const ref=alpha(col)+row;
  // Excel can reject formula cells carrying an empty <v></v> cached result.
  // For unknown results, omit the cache so Excel recalculates the formula.
  if(formula)return '<c r="'+ref+'" s="'+style+'"><f>'+esc(formula)+'</f>'+(num(value)?'<v>'+value+'</v>':'')+'</c>';
  if(num(value))return '<c r="'+ref+'" s="'+style+'"><v>'+value+'</v></c>';
  if(value===null||value===undefined||value==='')return '<c r="'+ref+'" s="'+style+'"/>';
  return '<c r="'+ref+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+esc(value)+'</t></is></c>';
 }
 function row(n,entries,height=23){
  return '<row r="'+n+'" ht="'+height+'" customHeight="1">'+entries.map((v,i)=>Array.isArray(v)?c(n,i,v[0],v[1],v[2]):c(n,i,v)).join('')+'</row>';
 }
 function layout(rows,colWidths,last,merge,freeze,filter){
  const columns=colWidths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('');
  const merges=merge.map(v=>'<mergeCell ref="'+v+'"/>').join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
    '<dimension ref="A1:L'+last+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="'+freeze+'" topLeftCell="A'+(freeze+1)+'" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
    '<sheetFormatPr defaultRowHeight="21"/><cols>'+columns+'</cols><sheetData>'+rows.join('')+'</sheetData>'+
    // SpreadsheetML CT_Worksheet mandates autoFilter BEFORE mergeCells.
    // Excel rejects sheet2.xml when these nodes are reversed, even though the XML parses.
    (filter?'<autoFilter ref="'+filter+'"/>':'')+
    '<mergeCells count="'+merge.length+'">'+merges+'</mergeCells>'+
    '<pageMargins left="0.25" right="0.25" top="0.45" bottom="0.45" header="0.2" footer="0.2"/><pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/></worksheet>';
 }
 const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
  '<numFmts count="2"><numFmt numFmtId="165" formatCode="#,##0.000"/><numFmt numFmtId="166" formatCode="#,##0.0"/></numFmts>'+
  '<fonts count="3"><font><sz val="10"/><name val="Malgun Gothic"/></font><font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Malgun Gothic"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Malgun Gothic"/></font></fonts>'+
  '<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'+
  '<fill><patternFill patternType="solid"><fgColor rgb="FF12304B"/></patternFill></fill>'+
  '<fill><patternFill patternType="solid"><fgColor rgb="FF173E63"/></patternFill></fill>'+
  '<fill><patternFill patternType="solid"><fgColor rgb="FFF0F6FB"/></patternFill></fill>'+
  '<fill><patternFill patternType="solid"><fgColor rgb="FFFFF2DB"/></patternFill></fill></fills>'+
  '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'+
  '<border><left style="thin"><color rgb="FFD4E0EA"/></left><right style="thin"><color rgb="FFD4E0EA"/></right><top style="thin"><color rgb="FFD4E0EA"/></top><bottom style="thin"><color rgb="FFD4E0EA"/></bottom><diagonal/></border></borders>'+
  '<cellStyleXfs count="1"><xf fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
  '<cellXfs count="9">'+
  '<xf fontId="0" fillId="0" borderId="0" xfId="0"/>'+
  '<xf fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf>'+
  '<xf fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'+
  '<xf fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'+
  '<xf fontId="0" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'+
  '<xf fontId="0" fillId="4" borderId="1" xfId="0" numFmtId="165" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
  '<xf fontId="0" fillId="0" borderId="1" xfId="0" numFmtId="165" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
  '<xf fontId="0" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'+
  '<xf fontId="0" fillId="5" borderId="1" xfId="0" numFmtId="165" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'+
  '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
 const headers=['층/도면','결함번호','구분','손상명','적용공법','보수물량(㎡)','단위','단가(천원/㎡)','공사비(천원)','우선순위','사진','단가 산정 근거'];
 const widths=[22,13,13,24,30,18,9,20,19,13,12,74];
 function build(zip,payload){
  const site=String(payload.site||'현장'),overhead=Number(payload.overhead)||0;
  const input=Array.isArray(payload.rows)?payload.rows:[];
  const entries=input.map(it=>({...it,page:String(it.page||'도면'),qty:num(it.qty)?it.qty:null,rate:num(it.rate)?it.rate:null,priority:Number(it.priority)||3}));
  entries.sort((a,b)=>a.page.localeCompare(b.page,'ko',{numeric:true})||Number(a.number)-Number(b.number));
  const detailRows=[
   row(1,[['보수물량 및 개략공사비 · 층별/결함별',1]],42),
   row(2,[[site+' | 자동 노무비 + 사용자 입력/추정 직접비 · 적용연도는 행별 단가근거 확인 · 금액단위 천원',2]],29),
   row(3,[['확인 노무비/연도 이월 추정 및 유사공법 재료·장비 추정은 행의 산정근거에 별도 명시 · 부가세 별도',7]],28),
   row(4,headers.map(v=>[v,2]),35)
  ];
  entries.forEach((x,i)=>{
   const n=i+5,base=i%2?3:4;
   const cost=num(x.qty)&&num(x.rate)?x.qty*x.rate:null;
   const formula='IF(OR(F'+n+'="",H'+n+'=""),"",F'+n+'*H'+n+')';
   detailRows.push(row(n,[
    [x.page,base],[x.number,base],[x.group||'-',base],[x.type||'-',base],[x.method||'-',base],
    [x.qty,num(x.qty)?(i%2?6:5):7],[x.unit||'㎡',base],[x.rate,num(x.rate)?8:7],[cost,6,formula],
    [x.priority+'순위',base],[x.photoCount?x.photoCount+'장':'없음',base],[x.source||'',base]
   ],Math.max(33,Math.min(58,28+Math.ceil(String(x.source||'').length/70)*7))));
  });
  const end=Math.max(5,entries.length+4);
  zip.file('xl/worksheets/sheet2.xml',layout(detailRows,widths,end,['A1:L1','A2:L2','A3:L3'],4,'A4:L'+end));
  const floors=[...new Set(entries.map(x=>x.page))],groups=[...new Set(entries.map(x=>String(x.method||'-')))]; 
  const verified=entries.filter(x=>num(x.qty)&&num(x.rate));
  const sumCost=list=>list.reduce((total,x)=>total+x.qty*x.rate,0);
  const subTotal=sumCost(verified);

  const sumRows=[
   row(1,[['보수물량 · 개략공사비 요약',1]],45),
   row(2,[[site+' | S:ARCH 현장조사 · 노무·재료·장비 개략 참고 (연도·공법은 행별 근거 확인)',2]],30),
   row(3,[['공식 노무비·가정 상승률 및 유사공법 추정치와 직접 입력비를 포함한 개략 참고액입니다. 미입력 비용은 합계에 포함되지 않으며 완성공사비가 아닙니다.',7]],29),
   row(5,[['전체 결함',2],[entries.length,5],['산정 가능',2],[entries.filter(x=>num(x.qty)&&num(x.rate)).length,5],['단가/수량 확인',2],[entries.filter(x=>!num(x.qty)||!num(x.rate)).length,5]],27),
   row(7,[['참고 소계(천원)',2],[subTotal,5, "SUM('층별_결함별'!I5:I"+end+")"],['제경비 가정(%)',2],[overhead,5],['참고합계(천원)',2],[subTotal*(1+overhead/100),5,'B7*(1+D7/100)']],28),
   row(9,[['층/도면별 참고금액',2]],29),
   row(10,['층/도면','결함수','보수물량(㎡)','참고 소계(천원)','제경비 포함 참고액(천원)'].map(v=>[v,2]),31)
  ];
  let n=11;
  for(const floor of floors){
   const q=JSON.stringify(floor).slice(1,-1).replace(/&/g,'&amp;');
   const escapeExcel=floor.replace(/"/g,'""');
   const criteria='"'+escapeExcel+'"';
   const range="'층별_결함별'!$A$5:$A$"+end;
   const count='COUNTIF('+range+','+criteria+')',qty='SUMIF('+range+','+criteria+",'층별_결함별'!$F$5:$F$"+end+')';
   const cost='SUMIF('+range+','+criteria+",'층별_결함별'!$I$5:$I$"+end+')';
   const members=entries.filter(x=>x.page===floor);
   const countValue=members.length;
   const qtyValue=members.reduce((total,x)=>total+(num(x.qty)?x.qty:0),0);
   const costValue=sumCost(members.filter(x=>num(x.qty)&&num(x.rate)));
   sumRows.push(row(n,[[floor,3],[countValue,3,count],[qtyValue,5,qty],[costValue,5,cost],[costValue*(1+overhead/100),5,'D'+n+'*(1+$D$7/100)']],27));n++;
  }
  n+=2;
  sumRows.push(row(n,[['공법별 참고금액',2]],29));n++;
  sumRows.push(row(n,['적용공법','결함수','참고 소계(천원)'].map(v=>[v,2]),28));n++;
  for(const method of groups){
   const range="'층별_결함별'!$E$5:$E$"+end,term='"'+method.replace(/"/g,'""')+'"';
   const matches=entries.filter(x=>String(x.method||'-')===method);
   const methodCost=sumCost(matches.filter(x=>num(x.qty)&&num(x.rate)));
   sumRows.push(row(n,[[method,3],[matches.length,3,'COUNTIF('+range+','+term+')'],[methodCost,5,'SUMIF('+range+','+term+",'층별_결함별'!$I$5:$I$"+end+')']],27));n++;
  }
  n+=2;
  sumRows.push(row(n,[['기준 출처(노무비)',2],['https://www.cak.or.kr/lay1/bbs/S1T41C42/A/14/list.do',3]],36));n++;
  sumRows.push(row(n,[['2026 표준품셈',2],['https://www.kosca.or.kr/bbs/list.do?bbsId=BBS000430&menuId=MENU001141',3]],40));n++;
  sumRows.push(row(n,[['산정 유의사항',2],['노무비·품셈 기준의 참고액입니다. 철근 방청, 재료비, 장비비, 현장 접근, 폐기물, VAT 등은 별도 산정 필요',7]],40));
  const merge=['A1:L1','A2:L2','A3:L3','A9:E9',['A'+(11+floors.length+2)+':E'+(11+floors.length+2)].join(''),'B'+(n-2)+':L'+(n-2),'B'+(n-1)+':L'+(n-1),'B'+n+':L'+n];
  zip.file('xl/worksheets/sheet1.xml',layout(sumRows,widths,n,merge,3,''));
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="개략공사비_요약" sheetId="1" r:id="rId1"/><sheet name="층별_결함별" sheetId="2" r:id="rId2"/></sheets><calcPr fullCalcOnLoad="1" calcId="191029"/></workbook>');
  zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('xl/styles.xml',styles);
  return {count:entries.length,priced:entries.filter(x=>num(x.qty)&&num(x.rate)).length};
 }
 async function download(payload){
  if(typeof root.JSZip!=='function')throw Error('엑셀 파일을 만드는 JSZip을 불러오지 못했습니다.');
  const zip=new root.JSZip(),info=build(zip,payload);
  // Fail closed: do not let a malformed workbook be downloaded and silently
  // repaired by Excel (which otherwise can discard the complete detail sheet).
  if(typeof DOMParser==='function'){
   const parser=new DOMParser();
   for(const name of ['[Content_Types].xml','xl/workbook.xml','xl/styles.xml',
    'xl/worksheets/sheet1.xml','xl/worksheets/sheet2.xml']){
    const source=await zip.file(name)?.async('string');
    if(!source)throw Error('엑셀 구성 파일이 없습니다: '+name);
    const doc=parser.parseFromString(source,'application/xml');
    if(doc.getElementsByTagName('parsererror').length)throw Error('잘못된 엑셀 XML: '+name);
    // XML being well-formed alone is insufficient: enforce schema child sequence.
    if(name.startsWith('xl/worksheets/')){
     const direct=Array.from(doc.documentElement.children).map(el=>el.localName);
     const schema=['sheetPr','dimension','sheetViews','sheetFormatPr','cols','sheetData',
      'sheetCalcPr','sheetProtection','protectedRanges','scenarios','autoFilter',
      'sortState','dataConsolidate','customSheetViews','mergeCells','phoneticPr',
      'conditionalFormatting','dataValidations','hyperlinks','printOptions',
      'pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','customProperties',
      'cellWatches','ignoredErrors','smartTags','drawing','drawingHF','picture',
      'oleObjects','controls','webPublishItems','tableParts','extLst'];
     let order=-1;
     for(const child of direct){
      const ix=schema.indexOf(child);
      if(ix<0||ix<order)throw Error('Excel 시트 구조 순서 오류: '+name+' / '+child);
      order=ix;
     }
     if(name.endsWith('sheet2.xml')){
      const rows=doc.getElementsByTagNameNS('*','row');
      if(rows.length<5)throw Error('층별_결함별 시트의 행 데이터가 없습니다.');
      const filter=doc.getElementsByTagNameNS('*','autoFilter')[0];
      const merge=doc.getElementsByTagNameNS('*','mergeCells')[0];
      if(filter&&merge&&! (direct.indexOf('autoFilter')<direct.indexOf('mergeCells')))
       throw Error('Excel 시트 병합·필터 순서가 잘못되었습니다.');
     }
    }
   }
  }
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});
  const name=xmlSafe(String(payload.site||'현장')).replace(/[\\/:*?"<>|]/g,'_')+'_보수물량_개략공사비.xlsx';
  const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
  return info;
 }
 root.SARCHRepairXLSXV172={build,download};
})(typeof window!=='undefined'?window:self);
