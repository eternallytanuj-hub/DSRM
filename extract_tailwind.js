const fs = require('fs');

const html = fs.readFileSync('c:\\DSRM\\telemetry.html', 'utf8');
const match = html.match(/tailwind\.config=({[\s\S]+?})<\/script>/);

if (match && match[1]) {
  const config = match[1];
  const content = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  ...${config}
};

export default config;`;

  fs.writeFileSync('c:\\DSRM\\tailwind.config.ts', content);
  console.log("Created tailwind.config.ts!");
} else {
  console.log("Could not find tailwind config in html.");
}
