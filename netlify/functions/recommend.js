/**
 * recommend.js
 * Takes the player's mood form + backlog game list, enriches games with RAWG,
 * then calls Claude to generate a ranked top-3 recommendation with magical blurbs.
 *
 * POST body: { mood: { time, energy, vibes, protag, freetext }, games: [...] }
 */

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const rawgKey       = process.env.RAWG_API_KEY;
  const anthropicKey  = process.env.ANTHROPIC_API_KEY;

  if (!rawgKey || !anthropicKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing RAWG_API_KEY or ANTHROPIC_API_KEY environment variables.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  const { mood, games } = body;

  if (!mood || !games || !Array.isArray(games)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing mood or games in request body.' }) };
  }

  // ── Step 1: Limit to backlog (≤ 5 hours) and cap at 60 for performance ──
  const backlog = games
    .filter((g) => g.playtimeHours <= 5)
    .slice(0, 60);

  if (backlog.length === 0) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendations: [],
        message: 'Your backlog is empty — you\'ve played everything! Try raising the playtime filter.',
      }),
    };
  }

  // ── Step 2: Enrich games with RAWG data (genre, rating, tags) ──
  const enriched = await enrichWithRawg(backlog, rawgKey);

  // ── Step 3: Ask Claude for the magical recommendations ──
  const recommendations = await askClaude(mood, enriched, anthropicKey);

  // ── Step 4: Attach cover images back to results ──
  const results = recommendations.map((rec) => {
    const matched = enriched.find(
      (g) => g.name.toLowerCase() === rec.name.toLowerCase()
    ) || enriched.find((g) =>
      g.name.toLowerCase().includes(rec.name.toLowerCase()) ||
      rec.name.toLowerCase().includes(g.name.toLowerCase())
    );
    return {
      ...rec,
      appId:        matched?.appId    || null,
      coverUrl:     matched?.coverUrl || null,
      playtimeHours: matched?.playtimeHours ?? null,
      genres:       matched?.genres   || [],
      rating:       matched?.rating   || null,
    };
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ recommendations: results }),
  };
};

// ─────────────────────────────────────────────────────────
//  RAWG enrichment
// ─────────────────────────────────────────────────────────
async function enrichWithRawg(games, rawgKey) {
  const enriched = [];

  // Process in batches of 8 to respect rate limits
  const batchSize = 8;
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((game) => fetchRawgGame(game, rawgKey))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') enriched.push(r.value);
    }
  }

  return enriched;
}

async function fetchRawgGame(game, rawgKey) {
  try {
    // Clean up Steam game names for better search results
    const searchName = game.name
      .replace(/®|™|©/g, '')
      .replace(/\s*[-–]\s*(Complete|Definitive|Enhanced|Ultimate|GOTY|Gold|Deluxe|Standard|Premium)\s*(Edition|Pack|Collection)?/gi, '')
      .replace(/\s*:\s*.*$/, '') // remove subtitles for shorter games
      .trim();

    const url = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(searchName)}&page_size=3`;
    const res = await fetch(url);

    if (!res.ok) return { ...game, genres: [], tags: [], rating: null };

    const data = await res.json();
    const results = data.results || [];

    // Find best match by normalized name comparison
    const best = results.find((r) =>
      normalize(r.name) === normalize(game.name)
    ) || results.find((r) =>
      normalize(r.name).includes(normalize(searchName)) ||
      normalize(searchName).includes(normalize(r.name))
    ) || results[0];

    if (!best) return { ...game, genres: [], tags: [], rating: null };

    return {
      ...game,
      rawgId:      best.id,
      genres:      (best.genres || []).map((g) => g.name),
      tags:        (best.tags || []).slice(0, 8).map((t) => t.name),
      rating:      best.rating || null,
      description: best.description_raw ? best.description_raw.slice(0, 200) : null,
      rawgCover:   best.background_image || null,
    };
  } catch {
    return { ...game, genres: [], tags: [], rating: null };
  }
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ─────────────────────────────────────────────────────────
//  Claude recommendation call
// ─────────────────────────────────────────────────────────
async function askClaude(mood, games, anthropicKey) {
  const timeLabel = {
    quick:    'less than 30 minutes',
    short:    '30–60 minutes',
    medium:   '1–2 hours',
    long:     '2–4 hours',
    marathon: 'all day / marathon session',
  }[mood.time] || mood.time;

  const energyLabel = {
    exhausted: 'completely exhausted — needs something easy and comforting',
    low:       'low energy — wants something chill and relaxing',
    medium:    'medium energy — up for a normal play session',
    high:      'high energy — wants something engaging and exciting',
    hyped:     'very hyped — wants intense action or deep immersion',
  }[mood.energy] || mood.energy;

  const gamesList = games
    .map((g) => {
      const genres = g.genres?.length ? `Genres: ${g.genres.join(', ')}` : '';
      const tags   = g.tags?.length   ? `Tags: ${g.tags.slice(0, 5).join(', ')}` : '';
      const rating = g.rating         ? `RAWG rating: ${g.rating}/5` : '';
      const hours  = `Played: ${g.playtimeHours}h`;
      const meta   = [genres, tags, rating, hours].filter(Boolean).join(' | ');
      return `• ${g.name}${meta ? ` — ${meta}` : ''}`;
    })
    .join('\n');

  const systemPrompt = `You are the magical recommendation fairy for "Backlog Wao" — a whimsical, cozy game discovery app with a soft magical-girl aesthetic.
Your personality is warm, encouraging, and gently whimsical — like a librarian in a magical game library. You speak directly to the player with care and charm.
Always respond with ONLY valid JSON, no markdown, no extra text.`;

  const userPrompt = `The player wants a game from their backlog. Here is their current mood:

🕐 Time available: ${timeLabel}
⚡ Energy level: ${energyLabel}
🎮 Vibe they're after: ${Array.isArray(mood.vibes) ? mood.vibes.join(', ') : mood.vibes || 'no preference'}
👤 Protagonist preference: ${mood.protag || 'no preference'}
💭 How they're feeling: ${mood.freetext || '(not specified)'}

Their backlog (games they haven't played much):
${gamesList}

Please recommend the 3 games that would bring them the most joy RIGHT NOW, given their mood.
For each game:
1. Write a warm, charming 2-3 sentence blurb speaking directly to the player, explaining why this specific game is perfect for their current mood and energy
2. The blurb should feel magical and personal — reference their mood, time, or energy level specifically
3. Pick one fitting emoji that represents why it's a good match

Return ONLY this JSON (no markdown code blocks):
{
  "recommendations": [
    {
      "name": "Exact Game Name from the list",
      "blurb": "...",
      "match_emoji": "✨",
      "match_label": "Perfect for a cozy evening"
    },
    {
      "name": "Exact Game Name from the list",
      "blurb": "...",
      "match_emoji": "🌸",
      "match_label": "Gentle and story-rich"
    },
    {
      "name": "Exact Game Name from the list",
      "blurb": "...",
      "match_emoji": "⭐",
      "match_label": "Just the right length"
    }
  ]
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-3-5-haiku-20241022',
      max_tokens: 1200,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${err}`);
  }

  const data    = await res.json();
  const content = data.content?.[0]?.text || '';

  // Safely parse JSON from Claude's response
  try {
    // Strip any accidental markdown fences
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed.recommendations || [];
  } catch (parseErr) {
    console.error('Failed to parse Claude response:', content);
    // Fallback: return first 3 games with a generic blurb
    return games.slice(0, 3).map((g) => ({
      name:        g.name,
      blurb:       `This looks like a great pick for your current mood! Give it a try — sometimes the best game is the one you least expect. ✨`,
      match_emoji: '✨',
      match_label: 'From your backlog',
    }));
  }
}
