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
function groups(state){
 var pages=Array.isArray(state.pages)?state.pages:[],ds=Array.isArray(state.defects)?state.defects:[],m=new Map(),site=txt(state.project)||"현장";
 var known=pages.map(p=>building(p&&p.name)).filter(Boolean);
 function ensure(name){name=name||known[0]||building(site)||"현장";if(!m.has(name))m.set(name,[]);return m.get(name)}
 known.forEach(ensure);
 ds.forEach(d=>{var p=pages[Number(d.pageId)]||{},key=building(d.location)||building(p.name)||building(site)||(known.length===1?known[0]:"현장");ensure(key).push({d:d,page:txt(p.name)||"도면",cause:estimate(d)})});
 if(!m.size)ensure("");
 return Array.from(m.entries()).sort((a,b)=>{var x=parseInt(a[0],10),y=parseInt(b[0],10);return isFinite(x)&&isFinite(y)?x-y:a[0].localeCompare(b[0],"ko")});
}
function types(d){return Array.from(new Set((d.types||[]).filter(Boolean).map(v=>txt(v).replace(/^(구조체|비구조체)\s*/,"")))).join(", ")||"미지정"}
function spec(d){var direct=txt(d.manualSpec);if(direct)return direct.replace(/×/g,"X").replace(/(\d)\s*x\s*(?=\d)/gi,"$1X").replace(/(\d)\s*ea\b/gi,"$1EA");var p=[d.width,d.length].map(txt).filter(Boolean),base=p.join("X"),n=Number(d.count);n=Number.isInteger(n)&&n>1?n:1;return base?(n>1?base+"X"+n+"EA":base):n+"EA"}
function member(d){var match=txt(d.location).match(/기둥|벽체|보|슬래브|바닥|천장|계단|난간|창호|문|옥상|지붕|외벽|내벽/);return match?match[0]:"-"}
function remedy(d){var t=(d.types||[]).join(" ");return /누수|백태/.test(t)?"수분 유입 원인 확인 및 방수·배수상태 점검 후 보수 검토":/균열/.test(t)?"진행 여부 주기적 관찰 및 필요 시 보수 검토":/철근노출|박락|파손/.test(t)?"손상 범위 확인 후 단면복구·재발방지 검토":"유지관리계획에 따른 주의관찰 및 보수 검토"}
var header=["번호","층/도면","부재(부위)","결함 종류","결함 크기","손상원인추정","사진","조치 필요사항"];
function sheetXml(state,key,items){
 var rows=[],merge=["A1:H1","A2:H2","A3:H3"];
 function cell(value,r,i,style){return '<c r="'+String.fromCharCode(65+i)+r+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xml(value)+'</t></is></c>'}
 function row(n,values,style,height){rows.push('<row r="'+n+'" ht="'+height+'" customHeight="1">'+values.map((v,i)=>cell(v,n,i,style)).join("")+"</row>")}
 row(1,["결함 현황표"],1,42);
 row(2,[(txt(state.project)||"현장")+" | "+key+" | 조사 결함 "+items.length+"건"],2,30);
 row(3,["※ 손상원인추정은 결함 종류·기록에 따른 참고 초안입니다. 사진 AI 판독이 아니며 사진이 있는 경우 육안 검토 후 수정하세요."],4,33);
 row(4,header,2,30);
 if(!items.length)row(5,["-","-","-","등록된 결함 없음","-","-","-","-"],3,40);
 items.forEach((it,i)=>{var d=it.d,photos=Array.isArray(d.photos)?d.photos.length:0,cause=it.cause,manual=!!txt(d.causeEstimate);
  if(!manual)cause+=photos?" [사진 검토 필요]":" [일반적 추정]";
  row(i+5,[i+1,it.page,member(d),types(d),spec(d),cause,photos?photos+"장 · 미검토":"사진 없음",remedy(d)],3,Math.max(47,Math.min(92,36+Math.ceil(cause.length/34)*14)));
 });
 var cols=[9,22,16,22,18,64,16,53].map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join("");
 var end=Math.max(5,items.length+4);
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'+
 '<dimension ref="A1:H'+end+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
 '<sheetFormatPr defaultRowHeight="18"/><cols>'+cols+'</cols><sheetData>'+rows.join("")+'</sheetData>'+
 '<mergeCells count="3">'+merge.map(v=>'<mergeCell ref="'+v+'"/>').join("")+'</mergeCells>'+
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
root.SARCHDefectStatusV157={download:download,groups:groups,estimate:estimate,build:build};
})(typeof window!=="undefined"?window:self);
