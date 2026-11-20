const fs = require('node:fs');
const path = require('node:path');
const { Resvg } = require('@resvg/resvg-js');
const root = path.join(__dirname,'www','SEOB');
const icon = fs.readFileSync(path.join(root,'sarch-icon.svg'),'utf8');
for (const size of [180,192,512,1024]) {
  const png = new Resvg(icon,{fitTo:{mode:'width',value:size}}).render().asPng();
  fs.writeFileSync(path.join(root,'smetric-icon-'+size+'.png'),png);
}
const mark = fs.readFileSync(path.join(root,'sarch-report-mark.svg'),'utf8');
fs.writeFileSync(path.join(root,'sarch-report-mark.png'),
  new Resvg(mark,{fitTo:{mode:'width',value:1200}}).render().asPng());
console.log('S:ARCH brand assets rendered.');
