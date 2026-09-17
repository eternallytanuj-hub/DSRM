import re
import os
import json

with open('index_backup.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    css_content = style_match.group(1)
    with open('src/app/globals.css', 'w', encoding='utf-8') as f:
        f.write(css_content)

# Extract Body content
body_match = re.search(r'<body>(.*?)</body>', html, re.DOTALL)
if not body_match:
    print("No body found")
    exit(1)

body_content = body_match.group(1)

# Extract scripts
scripts = re.findall(r'<script.*?</script>', body_content, re.DOTALL)
for s in scripts:
    body_content = body_content.replace(s, '')

# Convert HTML to JSX
jsx = body_content.replace('class=', 'className=')
def repl_style(m):
    styles = m.group(1).split(';')
    obj = {}
    for s in styles:
        s = s.strip()
        if not s: continue
        parts = s.split(':', 1)
        if len(parts) == 2:
            key = parts[0].strip()
            val = parts[1].strip()
            parts_k = key.split('-')
            key_camel = parts_k[0] + ''.join(x.title() for x in parts_k[1:])
            obj[key_camel] = val
    return 'style={' + json.dumps(obj) + '}'

jsx = re.sub(r'style="(.*?)"', repl_style, jsx)

jsx = jsx.replace('href="#marketplace"', 'href="/marketplace"')
jsx = jsx.replace('href="#escrow"', 'href="/escrow"')
jsx = jsx.replace('href="#telemetry"', 'href="/telemetry"')
jsx = jsx.replace('href="#agent"', 'href="/api-engine"')
jsx = jsx.replace('href="#about"', 'href="/registry"')

jsx = jsx.replace('for=', 'htmlFor=')
jsx = jsx.replace('hidden', 'hidden={true}')
jsx = jsx.replace('disabled', 'disabled={true}')
jsx = jsx.replace('autoplay', 'autoPlay={true}')
jsx = jsx.replace('crossorigin', 'crossOrigin="anonymous"')
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx)

jsx = re.sub(r'(<img[^>]+)(?<!/)>', r'\1 />', jsx)
jsx = re.sub(r'(<input[^>]+)(?<!/)>', r'\1 />', jsx)
jsx = re.sub(r'(<br[^>]*)(?<!/)>', r'\1 />', jsx)
jsx = re.sub(r'(<hr[^>]*)(?<!/)>', r'\1 />', jsx)

page_tsx = f"""'use client';
import {{ useEffect }} from 'react';
import Link from 'next/link';

export default function Home() {{
  useEffect(() => {{
    // Load Mapbox script dynamically to ensure it runs on client
    const script1 = document.createElement('script');
    script1.src = 'https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.js';
    script1.onload = () => {{
        const script2 = document.createElement('script');
        script2.type = 'module';
        script2.crossOrigin = 'anonymous';
        script2.src = './assets/index-Ce4AZ4p4.js';
        document.body.appendChild(script2);
    }};
    document.head.appendChild(script1);
    
  }}, []);

  return (
    <main>
      {jsx}
    </main>
  );
}}
"""

page_tsx = re.sub(r'<a([^>]*?href="\/[^"]*"[^>]*?)>', r'<Link\1>', page_tsx)
page_tsx = page_tsx.replace('</a', '</Link')
page_tsx = page_tsx.replace('</Link>', '</Link>') # fix if needed but simple replace is fine

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_tsx)

print("Conversion complete!")
