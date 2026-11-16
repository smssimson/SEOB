/* S:ARCH v156: genuine PDF carrier for JSON project transfer.
   Chromium permits PDFs in navigator.share but not .json/.zip; text/plain
   is often treated as shared TEXT rather than a saved file by Quick Share.
   The PDF below is syntactically valid and embeds the original JSON bytes
   as a standard PDF EmbeddedFile (without compression or data transformation).
   No network, login, uploads, or source-project changes. */
(function(scope){
"use strict";
const te=new TextEncoder(),td=new TextDecoder();
const marker="%SARCH-PROJECT-PDF-V156";
function pdfFromJson(file){
 if(!file||!/\.json$/i.test(file.name)||!file.size)throw Error("JSON 프로젝트 파일이 필요합니다.");
 const parts=[];const positions=[0];let size=0;
 function add(v){const part=typeof v==="string"?te.encode(v):v;parts.push(part);size+=part.size===undefined?part.byteLength:part.size}
 function obj(i,v){positions[i]=size;add(i+" 0 obj\n"+v+"\nendobj\n")}
 add("%PDF-1.4\n"+marker+"\n");
 obj(1,"<< /Type /Catalog /Pages 2 0 R /Names << /EmbeddedFiles << /Names [(SARCH_Project.json) 7 0 R] >> >> >>");
 obj(2,"<< /Type /Pages /Count 1 /Kids [3 0 R] >>");
 obj(3,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>");
 obj(4,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
 const content="BT /F1 20 Tf 58 760 Td (S:ARCH PROJECT TRANSFER) Tj ET\n"+
   "BT /F1 11 Tf 58 720 Td (This PDF contains an attached S:ARCH JSON project.) Tj ET\n"+
   "BT /F1 11 Tf 58 698 Td (In S:ARCH, select Received Site > Choose Project File.) Tj ET\n"+
   "BT /F1 11 Tf 58 676 Td (Select this PDF to add a new site without changing existing sites.) Tj ET\n";
 obj(5,"<< /Length "+te.encode(content).length+" >>\nstream\n"+content+"endstream");
 positions[6]=size;
 add("6 0 obj\n<< /Type /EmbeddedFile /Subtype /application#2Fjson /Length "+file.size+" >>\nstream\n");
 add(file);add("\nendstream\nendobj\n");
 obj(7,"<< /Type /Filespec /F (SARCH_Project.json) /EF << /F 6 0 R >> /Desc (SARCH JSON Project Backup) >>");
 obj(8,"<< /Producer (SARCH Project Transfer v156) /Title (SARCH Project Transfer) >>");
 const xref=size;
 add("xref\n0 9\n0000000000 65535 f \n");
 for(let i=1;i<=8;i++)add(String(positions[i]).padStart(10,"0")+" 00000 n \n");
 add("trailer\n<< /Size 9 /Root 1 0 R /Info 8 0 R >>\nstartxref\n"+xref+"\n%%EOF\n");
 const name=file.name.replace(/\.json$/i,"")+".sarch.pdf";
 return new File(parts,name,{type:"application/pdf",lastModified:file.lastModified||Date.now()});
}
function isCarrier(file){return !!file&&/\.sarch\.pdf$/i.test(file.name)}
async function jsonFromPdf(file){
 if(!file||!/\.pdf$/i.test(file.name))throw Error("S:ARCH PDF 파일이 아닙니다.");
 if(!file.size||file.size>305*1024*1024)throw Error("파일 크기가 허용 범위를 벗어났습니다.");
 const bytes=new Uint8Array(await file.arrayBuffer());
 const sample=td.decode(bytes.subarray(0,Math.min(bytes.length,8192)));
 if(!sample.startsWith("%PDF-1.4\n"+marker+"\n"))throw Error("S:ARCH 프로젝트가 포함된 PDF가 아닙니다.");
 const match=/6 0 obj\n<< \/Type \/EmbeddedFile \/Subtype \/application#2Fjson \/Length (\d+) >>\nstream\n/.exec(sample);
 if(!match)throw Error("첨부된 프로젝트 데이터를 찾을 수 없습니다.");
 const begin=match.index+match[0].length,len=Number(match[1]);
 if(!Number.isSafeInteger(len)||len<2||begin+len>bytes.length)throw Error("첨부 파일 크기가 올바르지 않습니다.");
 const payload=bytes.slice(begin,begin+len);
 try{JSON.parse(td.decode(payload))}catch(e){throw Error("첨부된 JSON 데이터가 올바르지 않습니다.");}
 const name=file.name.replace(/\.sarch\.pdf$/i,"")+".json";
 return new File([payload],name,{type:"application/json"});
}
scope.SARCHTransferV156={pdfFromJson,jsonFromPdf,isCarrier};
})(typeof window!=="undefined"?window:self);
