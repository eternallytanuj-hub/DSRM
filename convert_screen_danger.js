const fs = require('fs');
const inputHTML = process.argv[2];
const outputJSX = process.argv[3];
const componentName = process.argv[4];

const html = fs.readFileSync(inputHTML, 'utf8');

// extract the main content
let mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

let mainContent = '';
if (!mainMatch) {
  console.warn("No <main> tag found, falling back to <body>");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    console.error("No body found either");
    process.exit(1);
  }
  mainContent = bodyMatch[1];
} else {
  // We want to keep the `<main>` tag itself, because it might have classes like `flex-1 p-margin-desktop overflow-auto`
  // Actually, we can just extract the whole `<main>` element:
  mainContent = mainMatch[0];
}

mainContent = mainContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');

const tsx = `'use client';
export default function ${componentName}() {
  return (
    <div 
      className="select-none h-full w-full"
      dangerouslySetInnerHTML={{ __html: \`${mainContent}\` }} 
    />
  );
}
`;

fs.mkdirSync(outputJSX.substring(0, outputJSX.lastIndexOf('/')), { recursive: true });
fs.writeFileSync(outputJSX, tsx);
console.log(`${componentName} converted using dangerouslySetInnerHTML`);
