const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // page.tsx issues
  content = content.replace(/<\/Linkside>/g, '</aside>');
  content = content.replace(/<Linkside([^>]*)>/g, '<aside$1>'); // just in case
  
  // fix bare > which cause JSX errors
  content = content.replace(/> Awaiting/g, '&gt; Awaiting');
  content = content.replace(/>= /g, '&gt;= ');
  content = content.replace(/>> /g, '&gt;&gt; ');
  content = content.replace(/> 2 MIN/g, '&gt; 2 MIN');
  content = content.replace(/>120s/g, '&gt;120s');
  content = content.replace(/> 10%/g, '&gt; 10%');
  content = content.replace(/>= 95/g, '&gt;= 95');

  // fix telemetry JSON string in JSX
  // Replacing `{"tx"` with `&#123;"tx"` and `}` with `&#125;`
  content = content.replace(/{"tx":"2245.5","/g, '&#123;"tx":"2245.5","');
  content = content.replace(/escrow":"0x7f9a"}/g, 'escrow":"0x7f9a"&#125;');
  
  fs.writeFileSync(file, content);
}

const files = [
  'src/app/page.tsx',
  'src/app/marketplace/page.tsx',
  'src/app/escrow/page.tsx',
  'src/app/telemetry/page.tsx',
  'src/app/api-engine/page.tsx',
  'src/app/registry/page.tsx',
  'src/app/bookings/page.tsx'
];

files.forEach(fixFile);
console.log("JSX issues fixed part 2");
