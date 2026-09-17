'use server';

export async function searchMarketplaceWithGrok(query: string, passes: any[]) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    console.warn("GROK_API_KEY is not set. Returning all passes as fallback.");
    return passes; // Fallback
  }

  const systemPrompt = `You are a satellite booking assistant.
Based on the user's natural language request, return a JSON array containing the IDs of the passes that best match their criteria, ranked by relevance.
Only return the raw JSON array of strings (e.g., ["SAT-07", "SAT-14"]) and no other text or markdown formatting.
Available passes:
${JSON.stringify(passes)}`;

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1
      })
    });
    
    if (!res.ok) {
      console.error("Grok API response error:", res.status, await res.text());
      return passes;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const ids = JSON.parse(match[0]);
      if (Array.isArray(ids)) {
        return passes.filter(p => ids.includes(p.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      }
    }
  } catch (e) {
    console.error("Error calling Grok API:", e);
  }
  
  return passes;
}
