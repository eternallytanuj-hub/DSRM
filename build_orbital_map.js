const fs = require('fs');
const html = fs.readFileSync('map_html.html', 'utf8');
const script = fs.readFileSync('map_script.js', 'utf8');

const componentCode = `'use client';
import { useEffect, useRef } from 'react';

export default function OrbitalMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.innerHTML.trim() !== '') return;
    
    // Render HTML
    containerRef.current.innerHTML = \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

    // Run the inline script globally
    const scriptEl = document.createElement('script');
    scriptEl.innerHTML = \`${script.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    document.body.appendChild(scriptEl);

    // Load Mapbox script
    const mapboxScript = document.createElement('script');
    mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js';
    mapboxScript.onload = () => {
      const viteScript = document.createElement('script');
      viteScript.type = 'module';
      viteScript.crossOrigin = 'anonymous';
      viteScript.src = './assets/index-Ce4AZ4p4.js';
      document.body.appendChild(viteScript);
    };
    document.head.appendChild(mapboxScript);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css" rel="stylesheet" />
      <link rel="stylesheet" crossOrigin="anonymous" href="./assets/index-BGrAeW3w.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />
    </>
  );
}
`;

fs.writeFileSync('src/components/OrbitalMap.tsx', componentCode);
