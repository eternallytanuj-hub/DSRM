const fs = require('fs');
const inputHTML = process.argv[2];
const outputJSX = process.argv[3];
const componentName = process.argv[4];

const html = fs.readFileSync(inputHTML, 'utf8');

// extract the body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error("No body found");
  process.exit(1);
}
let body = bodyMatch[1];

// replace class with className
body = body.replace(/class=/g, 'className=');
body = body.replace(/<!--[\s\S]*?-->/g, ''); // remove comments
body = body.replace(/for=/g, 'htmlFor=');

// Fix self-closing tags
body = body.replace(/<img([^>]*)>/g, '<img$1 />');
body = body.replace(/<input([^>]*)>/g, '<input$1 />');
body = body.replace(/<br([^>]*)>/g, '<br$1 />');
body = body.replace(/<hr([^>]*)>/g, '<hr$1 />');

// convert style string to object
body = body.replace(/style="([^"]*)"/g, (match, stylesStr) => {
  const obj = {};
  stylesStr.split(';').forEach(s => {
    const parts = s.split(':');
    if (parts.length === 2) {
      const key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      obj[key] = parts[1].trim();
    }
  });
  return 'style={' + JSON.stringify(obj) + '}';
});

// extract Tailwind config from the html head
const twMatch = html.match(/<script id="tailwind-config">([\s\S]*?)<\/script>/i);
const twScript = twMatch ? twMatch[1] : '';

const tsx = `'use client';
export default function ${componentName}() {
  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{ __html: \`${twScript.replace(/`/g, '\\`')}\` }}></script>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..900&display=swap" rel="stylesheet" />
      <div className="bg-canvas-base text-text-primary font-body-md text-body-md select-none">
        ${body}
      </div>
    </>
  );
}
`;

fs.mkdirSync(outputJSX.substring(0, outputJSX.lastIndexOf('/')), { recursive: true });
fs.writeFileSync(outputJSX, tsx);
console.log(`${componentName} converted`);
