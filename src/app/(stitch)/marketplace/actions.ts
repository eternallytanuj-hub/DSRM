'use server';

import { SatellitePass, DEFAULT_REAL_PASSES } from './types';

export async function searchMarketplaceWithGroq(query: string, candidates: SatellitePass[] = DEFAULT_REAL_PASSES): Promise<SatellitePass[]> {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

  // Try backend AI endpoint first
  const backendSearchUrl = process.env.NEXT_PUBLIC_SATELLITE_API_URL?.replace('/satellites', '/marketplace/search') 
    || 'https://dsrmbackend-production.up.railway.app/api/v1/marketplace/search';

  try {
    const backendRes = await fetch(backendSearchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (Array.isArray(data.passes) && data.passes.length > 0) {
        return data.passes;
      }
    }
  } catch {
    // Fallback to direct Groq API call below
  }

  if (!apiKey) {
    console.warn("GROQ_API_KEY not configured. Falling back to semantic keyword filtering.");
    const q = query.toLowerCase();
    return candidates.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.operator.toLowerCase().includes(q) ||
      (p.cat && p.cat.toLowerCase().includes(q)) ||
      p.speed.toLowerCase().includes(q)
    );
  }

  const systemPrompt = `You are DSRM's AI Orbital Matchmaker. Analyze user natural language query and recommend the most suitable satellites from the candidate list.
Criteria to match:
- Geographic coverage / inclination
- Service type (broadband internet, earth observation, IoT/M2M messaging, navigation/timing, weather)
- Bandwidth & latency
Return ONLY a valid JSON array of objects with keys: 'id' (the candidate id) and 'reason' (a crisp 1-sentence technical explanation of why this satellite from Space-Track fits the user's mission). Example: [{"id":"STARLINK-32573","reason":"LEO 483km Ku/Ka-band provides high-bandwidth low-latency connectivity over the requested region."}]`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User query: "${query}"\n\nCandidate Satellites:\n${JSON.stringify(candidates, null, 2)}` }
        ],
        temperature: 0.1
      })
    });

    if (!res.ok) {
      console.error("Groq API response error:", res.status, await res.text());
      return candidates;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed: Array<{ id: string; reason?: string }> = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const results: SatellitePass[] = [];
        for (const item of parsed) {
          const pass = candidates.find(p => p.id === item.id || p.name === item.id);
          if (pass) {
            results.push({
              ...pass,
              reason: item.reason
            });
          }
        }
        if (results.length > 0) {
          return results;
        }
      }
    }
  } catch (e) {
    console.error("Error calling Groq API:", e);
  }

  return candidates;
}

// Backwards compatibility alias
export const searchMarketplaceWithGrok = searchMarketplaceWithGroq;
