/**
 * steam-library.js
 * Fetches a user's Steam owned games and returns them sorted by playtime (backlog first).
 * Uses server-side API key to avoid CORS issues and keep keys secret.
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

  const steamApiKey = process.env.STEAM_API_KEY;
  const configuredSteamId = process.env.STEAM_ID;

  if (!steamApiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'STEAM_API_KEY environment variable is not set.' }),
    };
  }

  // Steam ID can come from env var (personal deployment) or query param (flexible use)
  const params = event.queryStringParameters || {};
  const steamId = params.steamId || configuredSteamId;

  if (!steamId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Steam ID is required. Set STEAM_ID env var or pass ?steamId=...' }),
    };
  }

  try {
    const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/');
    url.searchParams.set('key', steamApiKey);
    url.searchParams.set('steamid', steamId);
    url.searchParams.set('include_appinfo', 'true');
    url.searchParams.set('include_played_free_games', 'true');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Steam API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.response || !data.response.games) {
      // Profile is private or no games
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          games: [],
          warning: 'No games found. Make sure your Steam profile game details are set to Public.',
        }),
      };
    }

    const games = data.response.games
      .map((g) => ({
        appId:          g.appid,
        name:           g.name,
        playtimeMinutes: g.playtime_forever || 0,
        playtimeHours:  parseFloat(((g.playtime_forever || 0) / 60).toFixed(1)),
        coverUrl:       `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
        iconUrl:        g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : null,
      }))
      // Sort backlog (least played) first, then alphabetically
      .sort((a, b) => a.playtimeMinutes - b.playtimeMinutes || a.name.localeCompare(b.name));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ games, total: games.length }),
    };
  } catch (err) {
    console.error('steam-library error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch Steam library.', detail: err.message }),
    };
  }
};
