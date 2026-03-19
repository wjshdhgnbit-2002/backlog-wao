import { useState } from 'react'

export default function GameCard({ game, isExcluded, onToggleExclude }) {
  const [imgError, setImgError] = useState(false)

  const hours = game.playtimeHours
  const isNew = hours < 0.5
  const hourLabel = isNew
    ? 'Never played'
    : hours < 1
    ? `${Math.round(hours * 60)}m played`
    : `${hours}h played`

  return (
    <div
      className={`card-glass group overflow-hidden flex flex-col ${
        isExcluded ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Cover image */}
      {!imgError ? (
        <img
          src={game.coverUrl}
          alt={`${game.name} cover`}
          className="game-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="game-cover-fallback">
          <span className="text-4xl select-none" aria-hidden="true">🎮</span>
        </div>
      )}

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Title */}
        <h3
          className="font-semibold text-sm text-slate-700 leading-tight line-clamp-2"
          title={game.name}
        >
          {game.name}
        </h3>

        {/* Playtime badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`chip ${
              isNew
                ? 'bg-wao-pink-light text-wao-pink-deep border-wao-pink/40'
                : 'bg-wao-lav-light text-wao-lav-deep border-wao-lavender/40'
            }`}
          >
            {isNew ? '✨ New' : '🕐'} {hourLabel}
          </span>
        </div>

        {/* Exclude toggle */}
        <button
          className="mt-auto self-start text-xs text-slate-400 hover:text-rose-400 transition-colors"
          onClick={() => onToggleExclude(game.appId)}
          title={isExcluded ? 'Include in recommendations' : 'Exclude from recommendations'}
        >
          {isExcluded ? '+ include' : '✕ exclude'}
        </button>
      </div>
    </div>
  )
}
