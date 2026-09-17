const fs = require('fs');
const html = fs.readFileSync('index_backup.html', 'utf8');

// extract the body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error("No body found");
  process.exit(1);
}
let body = bodyMatch[1];

// replace links
body = body.replace(/href="#marketplace"/g, 'href="/marketplace"');
body = body.replace(/href="#escrow"/g, 'href="/escrow"');
body = body.replace(/href="#telemetry"/g, 'href="/telemetry"');
body = body.replace(/href="#agent"/g, 'href="/api-engine"');
body = body.replace(/href="#about"/g, 'href="/registry"');

body = body.replace(/`/g, '\\`').replace(/\$/g, '\\$');

const tsx = `'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Load Mapbox script dynamically to ensure it runs on client
    const script1 = document.createElement('script');
    script1.src = 'https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js';
    script1.onload = () => {
        const script2 = document.createElement('script');
        script2.type = 'module';
        script2.crossOrigin = 'anonymous';
        script2.src = './assets/index-Ce4AZ4p4.js';
        document.body.appendChild(script2);
    };
    document.head.appendChild(script1);
  }, []);

  return (
    <>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css" rel="stylesheet" />
      <link rel="stylesheet" crossOrigin="anonymous" href="./assets/index-BGrAeW3w.css" />
      <main dangerouslySetInnerHTML={{ __html: \`${body}\` }} />
    </>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', tsx);
console.log("Home converted using dangerouslySetInnerHTML");
