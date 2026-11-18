/* S:ARCH v157: offline XLSX defect register.
   Rule-based causes are provisional; no automatic photo-vision inference. */
(function(root){
"use strict";
function txt(v){return String(v==null?"":v).trim()}
function xml(v){return txt(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"")}
function building(s){var m=txt(s).match(/(\d{1,4})\s*동(?!\w)/);return m?m[1]+"동":""}
function estimate(d){
 if(txt(d.causeEstimate))return txt(d.causeEstimate);
 var s=(d.types||[]).join(" ")+ " "+txt(d.memo),location=txt(d.location);
 if(/백태|백화/.test(s))return "우수 또는 수분 유입에 따른 시멘트 성분 용출 및 표면 석출 추정";
 if(/누수|습윤/.test(s))return /외벽|옥상|지붕|옥탑|외부/.test(location)?"방수층 열화 또는 접합부 취약부를 통한 우수 유입 추정":"상부·인접부위 방수층 또는 배관 결함에 따른 수분 유입 가능성";
 if(/철근노출|철근부식|녹물/.test(s))return "피복두께 부족 또는 노후화·중성화, 수분 유입에 따른 철근부식 가능성";
 if(/망상균열/.test(s))return "건조수축 및 표면 열화에 따른 미세 균열 발생 추정";
 if(/균열/.test(s))return "건조수축·온도변화에 따른 변형 구속 및 국부 응력집중 가능성";
 if(/박리|박락|파손|탈락|표면손상|들뜸/.test(s))return "경과년수에 따른 재료 열화 및 부착력 저하, 외부 충격 가능성";
 if(/체결불량|볼트/.test(s))return "시공 상태 또는 반복하중·진동에 따른 체결력 저하 가능성";
 if(/부식/.test(s))return "우수·습기 노출 및 표면 보호층 열화에 따른 부식 추정";
 if(/변형|처짐|변위|침하/.test(s))return "장기하중·지반조건 변화 또는 국부 응력집중 등의 영향 가능성";
 return "경과년수에 따른 재료 노후화 및 환경 영향 가능성";
}
/* v176: the HWPX album numbers each PHOTO, in active page order then original
   defect order. The XLSX register mirrors that sequence without changing state. */
function groups(state){
 var pages=Array.isArray(state.pages)?state.pages:[],ds=Array.isArray(state.defects)?state.defects:[],m=new Map(),site=txt(state.project)||"현장";
 var known=pages.map(p=>building(p&&p.name)).filter(Boolean);
 function ensure(name){name=name||known[0]||building(site)||"현장";if(!m.has(name))m.set(name,[]);return m.get(name)}
 known.forEach(ensure);
 var ordered=pages.flatMap((p,i)=>ds.filter(d=>Number(d.pageId)===i));
 // Keep malformed/orphaned historical records in the report, not in the album.
 var seen=new Set(ordered);
 var orphan=ds.filter(d=>!seen.has(d));
 var photoNo=0,unshotNo=0;
 ordered.concat(orphan).forEach(d=>{
  var p=pages[Number(d.pageId)]||{},key=building(d.location)||building(p.name)||building(site)||(known.length===1?known[0]:"현장");
  var page=txt(p.name)||"도면",group=ensure(key),photos=Array.isArray(d.photos)?d.photos:[];
  if(photos.length){
   // A defect with 2 photos gets two rows, to align Photo 8 / Row 8 exactly.
   photos.forEach((_,i)=>group.push({d:d,page:page,cause:estimate(d),number:++photoNo,photoIndex:i,hasPhoto:true}));
  }else{
   var local=ordered.filter(x=>Number(x.pageId)===Number(d.pageId)).findIndex(x=>x===d)+1;
   group.push({d:d,page:page,cause:estimate(d),number:"미촬영 "+(local>0?local+"번":++unshotNo+"건"),hasPhoto:false});
  }
 });
 if(!m.size)ensure("");
 // HWPX contains all photographed items first; unphotographed defects are
 // still included, at the end of each building sheet, without consuming a photo number.
 return Array.from(m.entries()).map(([key,items])=>[key,
  items.filter(x=>x.hasPhoto).sort((a,b)=>a.number-b.number).concat(items.filter(x=>!x.hasPhoto))])
  .sort((a,b)=>{var x=parseInt(a[0],10),y=parseInt(b[0],10);return isFinite(x)&&isFinite(y)?x-y:a[0].localeCompare(b[0],"ko")});
}
function member(d){var match=txt(d.location).match(/기둥|벽체|보|슬래브|바닥|천장|계단|난간|창호|문|옥상|지붕|외벽|내벽/);return match?match[0]:"-"}
function areaLabel(d,page){
 var loc=txt(d.location),part=member(d);
 if(part!=="-")loc=loc.replace(new RegExp("(?:\\s|^)"+part+"$"),"").trim();
 page=txt(page)||"도면";
 if(!loc||loc===page)return page;
 if(loc===page||loc.startsWith(page+" "))return loc;
 // Avoid duplicate text such as '외부 외부 정면' or '지상1층 지상1층 복도'.
 var core=loc.replace(/^(외부|내부|지하\\d+층|지상\\d+층)\\s*/,(_,prefix)=>page===prefix?"":prefix+" ");
 if(core!==loc&&page===loc.split(/\\s+/)[0])loc=core.trim();
 return [page,loc].filter(Boolean).join(" ");
}
function types(d){return Array.from(new Set((d.types||[]).filter(Boolean).map(v=>txt(v).replace(/^(구조체|비구조체)\s*/,"")))).join(", ")||"미지정"}
/* v186: the field editor stores original dimensions in millimetres.
   Convert units only in the exported defect register; never mutate site data. */
function dimensions(d){
 var direct=txt(d.manualSpec).replace(/×/g,"X").replace(/\s+/g,"");
 var width=txt(d.width),length=txt(d.length),count=Number(d.count);
 var explicitEA=d.countEAExplicit===true;
 function numericPart(part){
  var m=txt(part).match(/^((?:\d+(?:\.\d*)?|\.\d+))(mm|m)?$/i);
  if(!m)return null;
  var n=Number(m[1]);
  return Number.isFinite(n)&&n>=0?{value:n,unit:(m[2]||'mm').toLowerCase()}:null;
 }
 var rawSize=direct.match(/^((?:\d+(?:\.\d*)?|\.\d+)(?:mm|m)?)X((?:\d+(?:\.\d*)?|\.\d+)(?:mm|m)?)(?:X(\d+)EA)?$/i);
 var eaOnly=direct.match(/^(\d+)EA$/i);
 if(rawSize){width=rawSize[1];length=rawSize[2];if(rawSize[3]){count=Number(rawSize[3]);explicitEA=true}}
 else if(eaOnly){width='';length='';count=Number(eaOnly[1]);explicitEA=true}
 else if(/\d+EA/i.test(direct)){
  // Unsupported free-form dimensions are not guessed; count remains independently readable.
  var n=direct.match(/(?:^|X)(\d+)EA\b/i);
  if(n){count=Number(n[1]);explicitEA=true}
 }
 // The editor's 1EA default is not a user-entered count. 2EA+ is necessarily explicit.
 if(Number.isInteger(count)&&count>1)explicitEA=true;
 var crack=(d.types||[]).some(t=>/균열/.test(txt(t)));
 function formatted(part,asMetres){
  var n=numericPart(part);if(!n)return '-';
  var value=asMetres?(n.unit==='mm'?n.value/1000:n.value):(n.unit==='m'?n.value*1000:n.value);
  if(!Number.isFinite(value))return '-';
  var rounded=Math.round((value+Number.EPSILON)*1000000)/1000000;
  // Show 1.0–9.0 for whole-number metre values, preserving tenths or smaller fractions.
  return Number.isInteger(rounded)?rounded.toFixed(1):String(rounded);
 }
 return {
  width:formatted(width,!crack),
  length:formatted(length,true),
  count:explicitEA&&Number.isInteger(count)&&count>=1?String(count):'-',
  crack:crack
 };
}
function remedy(d){var t=(d.types||[]).join(" ");return /누수|백태/.test(t)?"수분 유입 원인 확인 및 방수·배수상태 점검 후 보수 검토":/균열/.test(t)?"진행 여부 주기적 관찰 및 필요 시 보수 검토":/철근노출|박락|파손/.test(t)?"손상 범위 확인 후 단면복구·재발방지 검토":"유지관리계획에 따른 주의관찰 및 보수 검토"}
var header=["번호","층/도면","부재(부위)","결함 종류","폭","길이","개수","손상원인추정","조치 필요사항"];
function sheetXml(state,key,items){
 var rows=[],merge=["A1:I1","A2:I2"];
 function cell(value,r,i,style){return '<c r="'+String.fromCharCode(65+i)+r+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xml(value)+'</t></is></c>'}
 function row(n,values,style,height){rows.push('<row r="'+n+'" ht="'+height+'" customHeight="1">'+values.map((v,i)=>cell(v,n,i,style)).join("")+"</row>")}
 row(1,["결함 현황표"],1,42);
 row(2,[(txt(state.project)||"현장")+" | "+key+" | 결함 "+new Set(items.map(it=>it.d)).size+"건 · 사진 "+items.filter(it=>it.hasPhoto).length+"장 · 미촬영 "+items.filter(it=>!it.hasPhoto).length+"건 · 폭: 균열 mm / 기타 m · 길이: m"],2,30);
 row(3,header,2,30);
 if(!items.length)row(4,["-","-","-","등록된 결함 없음","-","-","-","-","-"],3,40);
 items.forEach((it,i)=>{var d=it.d,cause=it.cause;
  var size=dimensions(d);
  row(i+4,[it.number,areaLabel(d,it.page),member(d),types(d),size.width,size.length,size.count,cause,remedy(d)],3,Math.max(47,Math.min(92,36+Math.ceil(cause.length/34)*14)));
 });
 var cols=[9,22,16,22,9,12,8,64,53].map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join("");
 var end=Math.max(4,items.length+3);
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
  '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'+
  '<dimension ref="A1:I'+end+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
  '<sheetFormatPr defaultRowHeight="18"/><cols>'+cols+'</cols><sheetData>'+rows.join("")+'</sheetData>'+
  '<mergeCells count="2">'+merge.map(v=>'<mergeCell ref="'+v+'"/>').join("")+'</mergeCells>'+
  '<printOptions horizontalCentered="1"/><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>'+
  '<pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/></worksheet>';
}
var styleXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
'<fonts count="3"><font><sz val="10"/><name val="Malgun Gothic"/></font><font><b/><sz val="19"/><color rgb="FFFFFFFF"/><name val="Malgun Gothic"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Malgun Gothic"/></font></fonts>'+
'<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF183751"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF2F8"/><bgColor indexed="64"/></patternFill></fill></fills>'+
'<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFBDD0DE"/></left><right style="thin"><color rgb="FFBDD0DE"/></right><top style="thin"><color rgb="FFBDD0DE"/></top><bottom style="thin"><color rgb="FFBDD0DE"/></bottom><diagonal/></border></borders>'+
'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
'<cellXfs count="5"><xf fontId="0" fillId="0" borderId="0" xfId="0"/><xf fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf><xf fontId="2" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf fontId="0" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1" indent="1"/></xf></cellXfs>'+
'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
function build(zip,state){
 var g=groups(state),names=[],used=new Set();
 g.forEach((entry,i)=>{var name=txt(entry[0]).replace(/[\\\/\?\*\[\]:]/g,"_").slice(0,27)||("현장"+(i+1)),base=name,n=2;while(used.has(name)){name=base.slice(0,24)+"_"+n++;}used.add(name);names.push(name)});
 var sheets=names.map((v,i)=>'<sheet name="'+xml(v)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join("");
 var rels=names.map((v,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join("");
 zip.file("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+names.map((v,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("")+'</Types>');
 zip.file("_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 zip.file("xl/workbook.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>'+sheets+'</sheets></workbook>');
 zip.file("xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels+'<Relationship Id="rId'+(names.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
 zip.file("xl/styles.xml",styleXml);
 g.forEach((entry,i)=>zip.file("xl/worksheets/sheet"+(i+1)+".xml",sheetXml(state,entry[0],entry[1])));
 return {count:names.length,names:names,defects:g.reduce((n,e)=>n+e[1].length,0)};
}
async function download(state){
 if(typeof JSZip!=="function")throw Error("엑셀 출력 모듈(JSZip)을 불러오지 못했습니다.");
 var zip=new JSZip(),info=build(zip,state);
 var data=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:5}});
 var url=URL.createObjectURL(data),a=document.createElement("a");a.href=url;
 a.download=(txt(state.project)||"현장").replace(/[\\/:*?"<>|]/g,"_")+"_결함현황표.xlsx";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 return info;
}
root.SARCHDefectStatusV157={download:download,groups:groups,estimate:estimate,build:build,dimensions:dimensions};
})(typeof window!=="undefined"?window:self);
