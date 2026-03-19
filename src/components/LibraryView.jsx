import { useState, useMemo } from 'react'
import GameCard from './GameCard'

export default function LibraryView({ games, excludedIds, onToggleExclude, onOpenMoodForm }) {
  const [maxHours,  setMaxHours]  = useState(5)
  const [search,    setSearch]    = useState('')
  const [showAll,   setShowAll]   = useState(false)

  const PAGE_SIZE = 48

  const filtered = useMemo(() =>
    games.filter((g) =>
      g.playtimeHours <= maxHours &&
      (!search || g.name.toLowerCase().includes(search.toLowerCase()))
    ),
  [games, maxHours, search])

  const displayed = showAll ? filtered : filtered.slice(0, PAGE_SIZE)
  const hasMore   = filtered.length > PAGE_SIZE && !showAll

  const activeCount = filtered.filter((g) => !excludedIds.has(g.appId)).length

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 pb-32 page-enter">

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        {/* Search */}
        <input
          type="search"
          className="input-magic max-w-xs"
          placeholder="🔍  Search games…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search games"
        />

        {/* Hours slider */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label className="text-sm text-slate-600 whitespace-nowrap shrink-0">
            Backlog filter:
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={maxHours}
            onChange={(e) => setMaxHours(Number(e.target.value))}
            className="flex-1 accent-wao-lavender cursor-pointer"
            aria-label="Maximum hours played"
          />
          <span className="text-sm font-semibold text-wao-lav-deep whitespace-nowrap w-16 text-right">
            ≤ {maxHours}h
          </span>
        </div>

        {/* Count */}
        <div className="shrink-0 text-sm text-slate-500">
          <span className="font-semibold text-wao-lav-deep">{filtered.length}</span> games
          {excludedIds.size > 0 && (
            <span className="ml-1 text-slate-400">
              ({excludedIds.size} excluded)
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4" aria-hidden="true">🔭</div>
          <p className="font-display text-xl text-slate-500">No games found</p>
          <p className="text-sm mt-1">Try adjusting the filter or search term.</p>
        </div>
      )}

      {/* Game grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayed.map((game) => (
          <GameCard
            key={game.appId}
            game={game}
            isExcluded={excludedIds.has(game.appId)}
            onToggleExclude={onToggleExclude}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            className="btn-ghost"
            onClick={() => setShowAll(true)}
          >
            Show all {filtered.length} games
          </button>
        </div>
      )}

      {/* Floating recommend button */}
      {activeCount > 0 && (
        <button
          className="fab-recommend"
          onClick={onOpenMoodForm}
          aria-label="Find my perfect game"
        >
          <span className="text-xl" aria-hidden="true">🔮</span>
          <span>What should I play?</span>
        </button>
      )}
    </div>
  )
}
