# ✨ Backlog Wao

**Your magical mood-based Steam backlog recommender.**

Connects to your Steam library, enriches games with genre/rating data from RAWG, then uses Claude AI to recommend the perfect 3 games for your exact mood right now — with enchanting AI-written blurbs explaining why each one fits.

---

## 🌸 Features

- **Steam library sync** — pulls all your games and playtime via Steam Web API
- **RAWG enrichment** — adds genres, ratings, and tags for each game
- **Mood-based recommendations** — answer 5 quick questions (time, energy, vibe, protagonist preference) and get 3 picks
- **AI-written blurbs** — Claude explains personally why each game fits your current mood
- **Magical girl aesthetic** — soft pastel pink/lavender, sparkles, dreamy and light UI
- **Deployable to Netlify** — with serverless functions keeping all API keys secret

---

## 🚀 Deploy to Netlify (5 minutes)

### 1. Get your API keys

| Key | Where to get it |
|-----|----------------|
| `STEAM_API_KEY` | [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) |
| `STEAM_ID` | Your 17-digit Steam 64-bit ID — find at [steamid.io](https://steamid.io) |
| `RAWG_API_KEY` | [rawg.io/apidocs](https://rawg.io/apidocs) — free tier works |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "✨ Initial Backlog Wao"
git remote add origin https://github.com/YOUR_USERNAME/backlog-wao.git
git push -u origin main
```

### 3. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Select your repository
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Go to **Site Settings → Environment Variables** and add all 4 keys above
5. Trigger a redeploy — done! ✨

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Install Netlify CLI (run once)
npm install -g netlify-cli

# Copy env vars
cp .env.example .env.local
# Edit .env.local with your real keys

# Run locally with Netlify Dev (serves both Vite frontend + functions)
netlify dev
```

Visit `http://localhost:8888`

---

## 🎮 How It Works

```
Steam API          RAWG API            Claude API
    │                  │                    │
    ▼                  ▼                    ▼
Your games  →  Enrich with genres  →  Rank by mood
(in browser)   (server-side)          & write blurbs
```

1. **steam-library function** — fetches your game library server-side (avoids CORS, hides API key)
2. **recommend function** — when you submit the mood form:
   - Takes your backlog (≤5h playtime, adjustable)
   - Enriches up to 60 games with RAWG genre/tag data
   - Sends to Claude with your mood preferences
   - Returns top 3 picks with personalized blurbs
3. **Frontend** — React + Tailwind with magical-girl aesthetic, fully responsive

---

## 🔒 Privacy & Security

- All API keys live in Netlify environment variables — never exposed to the browser
- Your Steam ID is only used to fetch your library; no data is stored
- The app only reads your library (no Steam account access required)

---

## ✦ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Framer Motion
- **Backend**: Netlify Serverless Functions (Node 20)
- **APIs**: Steam Web API, RAWG Video Games Database, Anthropic Claude

---

*Built with ✨ magic for the Edelweiss AI Hackathon 2026*
