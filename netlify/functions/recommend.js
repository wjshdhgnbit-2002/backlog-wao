/**
 * recommend.js
 * Takes the player's mood form + backlog game list, enriches games with RAWG,
 * then uses a built-in scoring engine to rank and return the top 3 picks.
 * No external AI API required!
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

  const rawgKey = process.env.RAWG_API_KEY;

  if (!rawgKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing RAWG_API_KEY environment variable.' }),
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

  // ── Step 1: Limit to backlog (≤ 5 hours) ──────────────
  const backlog = games
    .filter((g) => g.playtimeHours <= 5)
    .slice(0, 60);

  if (backlog.length === 0) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendations: [],
        message: "Your backlog is empty — you've played everything!",
      }),
    };
  }

  // ── Step 2: Enrich with RAWG ───────────────────────────
  const enriched = await enrichWithRawg(backlog, rawgKey);

  // ── Step 3: Score and rank games ──────────────────────
  const scored = enriched
    .map((game) => ({ game, score: scoreGame(game, mood) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ── Step 4: Build recommendations with blurbs ─────────
  const recommendations = scored.map(({ game, score }) => ({
    name:          game.name,
    blurb:         buildBlurb(game, mood),
    match_emoji:   pickEmoji(game, mood),
    match_label:   pickLabel(game, mood),
    appId:         game.appId,
    coverUrl:      game.coverUrl,
    playtimeHours: game.playtimeHours,
    genres:        game.genres || [],
    rating:        game.rating || null,
    _score:        score,
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ recommendations }),
  };
};

// ─────────────────────────────────────────────────────────
//  Scoring engine
// ─────────────────────────────────────────────────────────

// Genre/tag groups for matching
const GENRE_MAP = {
  story:       ['rpg', 'adventure', 'visual novel', 'story', 'narrative', 'walking simulator', 'point-and-click', 'interactive fiction'],
  action:      ['action', 'shooter', 'fighting', 'hack and slash', "beat 'em up", 'fps', 'third-person shooter', 'action-adventure'],
  puzzle:      ['puzzle', 'strategy', 'turn-based', 'tower defense', 'management', 'city builder', 'simulation', 'logic'],
  casual:      ['casual', 'relaxing', 'farming', 'life simulation', 'cozy', 'wholesome', 'cute', 'colorful', 'walking simulator', 'peaceful', 'family friendly'],
  mystery:     ['mystery', 'detective', 'noir', 'investigation', 'crime', 'whodunit', 'thriller', 'hidden object', 'point-and-click'],
  horror:      ['horror', 'survival horror', 'psychological horror', 'dark', 'thriller', 'gore', 'scary'],
  multiplayer: ['multiplayer', 'co-op', 'mmo', 'online', 'battle royale', 'party', 'local multiplayer'],
  indie:       ['indie', 'pixel art', 'retro', 'atmospheric', 'artsy', 'experimental', 'hand-drawn'],
  platformer:  ['platformer', 'platform', 'metroidvania', 'side-scroller', 'run and gun', '2d platformer'],
};

// Tags that are INCOMPATIBLE with chill/cozy moods — used for penalizing
const DARK_TAGS = ['horror', 'psychological horror', 'survival horror', 'gore', 'dark', 'violent', 'disturbing', 'mature', 'blood', 'scary', 'psychological', 'dark humor', 'murder'];

// Tags that are INCOMPATIBLE with high-energy moods
const CHILL_TAGS = ['relaxing', 'casual', 'cozy', 'wholesome', 'peaceful', 'cute', 'farming', 'life simulation'];

// Energy → preferred genres
const ENERGY_GENRES = {
  exhausted: ['casual', 'relaxing', 'cozy', 'farming', 'life simulation', 'walking simulator', 'puzzle', 'wholesome', 'peaceful', 'cute'],
  low:       ['casual', 'indie', 'puzzle', 'adventure', 'story', 'visual novel', 'relaxing', 'mystery'],
  medium:    ['adventure', 'rpg', 'platformer', 'strategy', 'simulation', 'puzzle', 'mystery'],
  high:      ['action', 'rpg', 'adventure', 'platformer', 'shooter', 'fighting', 'action-adventure'],
  hyped:     ['action', 'shooter', 'fighting', 'fps', 'hack and slash', 'battle royale', 'horror'],
};

// Time → playtime length preference (hours)
const TIME_RANGE = {
  quick:    [0, 2],
  short:    [0, 5],
  medium:   [0, 15],
  long:     [5, 50],
  marathon: [10, 999],
};

function scoreGame(game, mood) {
  let score = 0;
  const genres = (game.genres || []).map((g) => g.toLowerCase());
  const tags   = (game.tags   || []).map((t) => t.toLowerCase());
  const all    = [...genres, ...tags];
  const vibes  = Array.isArray(mood.vibes) ? mood.vibes : [];

  // ── Vibe matching (up to 40 pts) ──
  for (const vibe of vibes) {
    const keywords = GENRE_MAP[vibe] || [];
    for (const kw of keywords) {
      if (all.some((t) => t.includes(kw))) {
        score += 10;
        break;
      }
    }
  }

  // ── Hard penalties for vibe mismatches ──
  // Cozy/casual requested but game is dark/horror → big penalty
  const wantsChill = vibes.includes('casual') || mood.energy === 'exhausted' || mood.energy === 'low';
  const wantsHorror = vibes.includes('horror');
  if (wantsChill && !wantsHorror) {
    const hasDarkTags = DARK_TAGS.some((dt) => all.some((t) => t.includes(dt)));
    if (hasDarkTags) score -= 40;
  }

  // High energy / hyped but game is ultra-chill → penalty
  const wantsIntense = mood.energy === 'hyped' || mood.energy === 'high';
  if (wantsIntense && !vibes.includes('casual')) {
    const isTooChill = CHILL_TAGS.some((ct) => all.some((t) => t.includes(ct)));
    if (isTooChill) score -= 20;
  }

  // Mystery requested but game has horror dark tags and horror NOT also requested → mild penalty
  if (vibes.includes('mystery') && !wantsHorror) {
    const hasSurvivalHorror = all.some((t) => t.includes('survival horror') || t.includes('gore'));
    if (hasSurvivalHorror) score -= 20;
  }

  // ── Energy matching (up to 20 pts) ──
  const energyGenres = ENERGY_GENRES[mood.energy] || [];
  for (const eg of energyGenres) {
    if (all.some((t) => t.includes(eg))) {
      score += 10;
      break;
    }
  }

  // ── Time matching (up to 20 pts) ──
  const [minH, maxH] = TIME_RANGE[mood.time] || [0, 999];
  const avgPlaytime  = game.rawgPlaytime || null;
  if (avgPlaytime !== null) {
    if (avgPlaytime >= minH && avgPlaytime <= maxH) score += 20;
    else if (Math.abs(avgPlaytime - (minH + maxH) / 2) < 5) score += 10;
  } else {
    score += 10;
  }

  // ── Rating bonus (up to 10 pts) ──
  if (game.rating) {
    score += Math.round(game.rating * 2); // max 10 for a 5/5 game
  }

  // ── Unplayed bonus — prefer never-played games ──
  if (game.playtimeHours === 0) score += 5;

  // ── Freetext keyword matching (up to 10 pts) ──
  if (mood.freetext) {
    const ft = mood.freetext.toLowerCase();
    for (const t of all) {
      if (ft.includes(t) || t.includes(ft.split(' ')[0])) {
        score += 5;
        break;
      }
    }
  }

  // Add a small random tiebreaker so results feel fresh each time
  score += Math.random() * 2;

  return score;
}

// ─────────────────────────────────────────────────────────
//  Blurb templates
// ─────────────────────────────────────────────────────────

const TIME_PHRASES = {
  quick:    'a quick session',
  short:    'a short play session',
  medium:   'an evening of gaming',
  long:     'a long, satisfying session',
  marathon: 'a full day of gaming',
};

const ENERGY_PHRASES = {
  exhausted: "you're exhausted and need something easy",
  low:       "you're in a chill, low-energy mood",
  medium:    "you're ready for a proper play session",
  high:      "you're feeling energised and ready",
  hyped:     "you're totally hyped and ready to dive deep",
};

const BLURB_TEMPLATES = [
  (game, mood) => {
    const genre = game.genres?.[0] || 'game';
    const time  = TIME_PHRASES[mood.time] || 'a session';
    const energy = ENERGY_PHRASES[mood.energy] || "you're in the mood";
    return `${game.name} is a wonderful pick for ${time} — perfect for when ${energy}. ${genre ? `As a ${genre} experience, it` : 'It'} matches exactly the vibe you're after right now.${game.playtimeHours === 0 ? " You've never touched it before, so now's the perfect moment to start! ✨" : ''}`;
  },
  (game, mood) => {
    const topGenre = game.genres?.[0] || 'this gem';
    const energy   = ENERGY_PHRASES[mood.energy] || "you're in the mood";
    const time     = TIME_PHRASES[mood.time] || 'a play session';
    return `Since ${energy}, ${game.name} is calling your name. This ${topGenre.toLowerCase()} fits beautifully into ${time} and should leave you feeling satisfied.${game.rating ? ` Rated ${game.rating.toFixed(1)}/5 — players love it. ⭐` : ''}`;
  },
  (game, mood) => {
    const vibeWord = Array.isArray(mood.vibes) && mood.vibes.length > 0
      ? mood.vibes[0]
      : 'fun';
    const time = TIME_PHRASES[mood.time] || 'your session';
    return `You said you wanted ${vibeWord} vibes, and ${game.name} delivers exactly that. It's a great fit for ${time}${game.playtimeHours === 0 ? ' and it\'s been waiting patiently in your library for its moment — this is it! ✨' : ', and your past playtime means you can pick it right back up.'}`;
  },
];

function buildBlurb(game, mood) {
  // Pick a template based on the game's position to add variety
  const idx = Math.floor(Math.random() * BLURB_TEMPLATES.length);
  return BLURB_TEMPLATES[idx](game, mood);
}

function pickEmoji(game, mood) {
  const genres = (game.genres || []).map((g) => g.toLowerCase());
  const tags   = (game.tags   || []).map((t) => t.toLowerCase());
  const all    = [...genres, ...tags];
  if (all.some((g) => g.includes('horror')))                return '👻';
  if (all.some((g) => g.includes('mystery') || g.includes('detective') || g.includes('noir'))) return '🔍';
  if (all.some((g) => g.includes('rpg')))                   return '⚔️';
  if (all.some((g) => g.includes('puzzle')))                return '🧩';
  if (all.some((g) => g.includes('cozy') || g.includes('casual') || g.includes('wholesome'))) return '🌸';
  if (all.some((g) => g.includes('action')))                return '🔥';
  if (all.some((g) => g.includes('adventure')))             return '🗺️';
  if (all.some((g) => g.includes('strategy')))              return '🧠';
  if (all.some((g) => g.includes('simulation')))            return '🌿';
  if (mood.energy === 'exhausted' || mood.energy === 'low') return '🌙';
  if (mood.energy === 'hyped' || mood.energy === 'high')    return '⚡';
  return '✨';
}

function pickLabel(game, mood) {
  const energy = mood.energy;
  const time   = mood.time;
  if (energy === 'exhausted') return 'Easy on the brain';
  if (energy === 'low')       return 'Cozy and gentle';
  if (energy === 'hyped')     return 'Matches your hype';
  if (time   === 'quick')     return 'Quick to pick up';
  if (time   === 'marathon')  return 'Worth the long haul';
  const genre = game.genres?.[0];
  if (genre) return `Great ${genre.toLowerCase()}`;
  return 'Perfect for right now';
}

// ─────────────────────────────────────────────────────────
//  RAWG enrichment
// ─────────────────────────────────────────────────────────
async function enrichWithRawg(games, rawgKey) {
  const enriched = [];

  const results = await Promise.allSettled(
    games.map((game) => fetchRawgGame(game, rawgKey))
  );
  for (const r of results) {
    if (r.status === 'fulfilled') enriched.push(r.value);
  }

  return enriched;
}

async function fetchRawgGame(game, rawgKey) {
  try {
    const searchName = game.name
      .replace(/®|™|©/g, '')
      .replace(/\s*[-–]\s*(Complete|Definitive|Enhanced|Ultimate|GOTY|Gold|Deluxe|Standard|Premium)\s*(Edition|Pack|Collection)?/gi, '')
      .trim();

    const url = `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(searchName)}&page_size=3`;
    const res = await fetch(url);

    if (!res.ok) return { ...game, genres: [], tags: [], rating: null };

    const data    = await res.json();
    const results = data.results || [];

    const best = results.find((r) => normalize(r.name) === normalize(game.name))
      || results.find((r) =>
          normalize(r.name).includes(normalize(searchName)) ||
          normalize(searchName).includes(normalize(r.name))
        )
      || results[0];

    if (!best) return { ...game, genres: [], tags: [], rating: null };

    return {
      ...game,
      genres:        (best.genres || []).map((g) => g.name),
      tags:          (best.tags   || []).slice(0, 8).map((t) => t.name),
      rating:        best.rating        || null,
      rawgPlaytime:  best.playtime      || null,
      rawgCover:     best.background_image || null,
    };
  } catch {
    return { ...game, genres: [], tags: [], rating: null };
  }
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}
