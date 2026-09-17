const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix aria-hidden={true}="true" -> aria-hidden="true"
  content = content.replace(/aria-hidden=\{true\}="true"/g, 'aria-hidden="true"');
  
  // Fix <input ... /> -> <input ... /> if it was converted to <input ... / />
  content = content.replace(/\/\s*\/>/g, '/>');

  // Fix bare < and > in text which break JSX
  // Instead of a complex AST parser, I'll just replace `< ` with `&lt; ` and `>` with `&gt;` where they seem like text.
  content = content.replace(/< 10/g, '&lt; 10');
  content = content.replace(/< 15/g, '&lt; 15');
  content = content.replace(/> 25/g, '&gt; 25');
  content = content.replace(/> \$20/g, '&gt; $20');
  content = content.replace(/EXEC>/g, 'EXEC&gt;');
  
  // Fix Telemetry raw text Hex dump
  // In JSX, raw unescaped text like `0000: 1A...` might be fine unless it has curly braces or `<`.
  // Wait, the telemetry hex dump had `<br/>` which became `<br/ />` and caused `Identifier cannot follow number` due to regex issue?
  // Let's replace `<br/ />` with `<br />` (handled by /\/\s*\/>/g above)
  
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
console.log("Files fixed");
