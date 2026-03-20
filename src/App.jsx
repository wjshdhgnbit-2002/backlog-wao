import { useState, useCallback } from 'react'
import SparkleBackground from './components/SparkleBackground'
import Header            from './components/Header'
import SteamConnect      from './components/SteamConnect'
import LibraryView       from './components/LibraryView'
import MoodForm          from './components/MoodForm'
import MagicLoading      from './components/MagicLoading'
import ResultsView       from './components/ResultsView'

// ── App states ────────────────────────────────────────────
// CONNECT → LOADING_LIBRARY → LIBRARY → RECOMMENDING → RESULTS
// (MOOD_FORM is an overlay over LIBRARY)

export default function App() {
  const [view,            setView]            = useState('CONNECT')
  const [games,           setGames]           = useState([])
  const [excludedIds,     setExcludedIds]     = useState(new Set())
  const [showMoodForm,    setShowMoodForm]    = useState(false)
  const [loadingMessage,  setLoadingMessage]  = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [connectError,    setConnectError]    = useState(null)
  const [recommendError,  setRecommendError]  = useState(null)

  // ── Load Steam library ────────────────────────────────
  const handleConnect = useCallback(async (steamId) => {
    setView('LOADING_LIBRARY')
    setLoadingMessage('Opening your magical library…')
    setConnectError(null)

    try {
      const url = new URL('/.netlify/functions/steam-library', window.location.origin)
      if (steamId) url.searchParams.set('steamId', steamId)

      const res = await fetch(url.toString())
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setGames(data.games || [])
      setView('LIBRARY')
    } catch (err) {
      setConnectError(err.message || 'Failed to load your Steam library. Please try again.')
      setView('CONNECT')
    }
  }, [])

  // ── Toggle exclude ─────────────────────────────────
  const handleToggleExclude = useCallback((appId) => {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      next.has(appId) ? next.delete(appId) : next.add(appId)
      return next
    })
  }, [])

  // ── Mood form submit → recommendations ────────────
  const handleMoodSubmit = useCallback(async (mood) => {
    setShowMoodForm(false)
    setView('RECOMMENDING')
    setLoadingMessage('Asking the magical fairy for your perfect game…')
    setRecommendError(null)

    // Send only backlog games that aren't excluded (≤ 5 hours by default)
    const backlogGames = games.filter(
      (g) => g.playtimeHours <= 5 && !excludedIds.has(g.appId)
    )

    try {
      const res = await fetch('/.netlify/functions/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, games: backlogGames }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setRecommendations(data.recommendations || [])
      setView('RESULTS')
    } catch (err) {
      setRecommendError(err.message || 'The spell fizzled! Please try again.')
      setView('LIBRARY')
      setShowMoodForm(false)
    }
  }, [games, excludedIds])

  // ── Render ─────────────────────────────────────────
  return (
    <div className="relative min-h-screen">
      {/* Always-present sparkle background */}
      <SparkleBackground count={24} />

      {/* Header — shown on all screens */}
      <Header
        gameCount={view === 'LIBRARY' || view === 'RESULTS' ? games.length : null}
        onSwitch={view === 'LIBRARY' || view === 'RESULTS' ? () => { setView('CONNECT'); setGames([]); setRecommendations([]) } : null}
      />

      {/* ── Main content ── */}
      <main>

        {/* CONNECT screen */}
        {view === 'CONNECT' && (
          <SteamConnect
            onConnect={handleConnect}
            isLoading={false}
            error={connectError}
          />
        )}

        {/* LOADING_LIBRARY screen */}
        {view === 'LOADING_LIBRARY' && (
          <MagicLoading message={loadingMessage} />
        )}

        {/* LIBRARY screen */}
        {view === 'LIBRARY' && (
          <>
            {recommendError && (
              <div className="relative z-10 max-w-xl mx-auto px-4 mb-4">
                <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 text-sm text-center">
                  {recommendError}
                  <button
                    className="ml-2 underline"
                    onClick={() => setRecommendError(null)}
                  >
                    dismiss
                  </button>
                </div>
              </div>
            )}
            <LibraryView
              games={games}
              excludedIds={excludedIds}
              onToggleExclude={handleToggleExclude}
              onOpenMoodForm={() => setShowMoodForm(true)}
            />
          </>
        )}

        {/* RECOMMENDING screen */}
        {view === 'RECOMMENDING' && (
          <MagicLoading message={loadingMessage} />
        )}

        {/* RESULTS screen */}
        {view === 'RESULTS' && (
          <ResultsView
            recommendations={recommendations}
            onReset={() => setView('LIBRARY')}
            onNewSpell={() => { setView('LIBRARY'); setShowMoodForm(true) }}
          />
        )}
      </main>

      {/* Mood form modal — overlays LIBRARY */}
      {showMoodForm && view === 'LIBRARY' && (
        <MoodForm
          onSubmit={handleMoodSubmit}
          onClose={() => setShowMoodForm(false)}
          isLoading={false}
        />
      )}
    </div>
  )
}
