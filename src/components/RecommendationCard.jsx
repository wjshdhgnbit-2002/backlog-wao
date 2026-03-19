import { useState } from 'react'

const RANK_COLORS = [
  { bg: 'from-wao-lav-deep to-wao-lavender', glow: 'shadow-glow-lav' },
  { bg: 'from-wao-pink-deep to-wao-pink',    glow: 'shadow-glow-pink' },
  { bg: 'from-amber-400 to-wao-gold',        glow: 'shadow-[0_0_24px_rgba(249,199,79,0.5)]' },
]

const RANK_LABELS = ['⭐ Top Pick', '✨ Second Choice', '🌸 Third Pick']

export default function RecommendationCard({ rec, rank = 0 }) {
  const [imgError, setImgError] = useState(false)
  const colors = RANK_COLORS[rank] || RANK_COLORS[0]

  const hours = rec.playtimeHours
  const hourLabel = hours == null
    ? null
    : hours < 0.5
    ? 'Never played'
    : hours < 1
    ? `${Math.round(hours * 60)}m played`
    : `${hours}h played`

  const ratingStars = rec.rating
    ? Math.round(rec.rating)
    : null

  return (
    <div
      className={`result-card overflow-hidden flex flex-col md:flex-row gap-0 page-enter`}
      style={{ animationDelay: `${rank * 0.15}s` }}
    >
      {/* Rank badge */}
      <div
        className={`px-4 py-3 md:px-3 md:py-0 md:w-16 flex md:flex-col items-center justify-center gap-2
                    bg-gradient-to-br ${colors.bg} md:rounded-l-xl3`}
      >
        <span className="text-white font-display font-bold text-2xl md:text-3xl">
          {rank + 1}
        </span>
        <span className="text-white/80 text-xs text-center hidden md:block leading-tight">
          {RANK_LABELS[rank]?.replace(/[⭐✨🌸]\s/, '')}
        </span>
      </div>

      {/* Cover image */}
      {rec.coverUrl && !imgError ? (
        <div className="md:w-52 flex-shrink-0 overflow-hidden">
          <img
            src={rec.coverUrl}
            alt={`${rec.name} cover`}
            className="w-full h-full object-cover"
            style={{ minHeight: '120px', maxHeight: '160px' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className="md:w-52 flex-shrink-0 flex items-center justify-center bg-wao-lav-light"
          style={{ minHeight: '120px' }}
        >
          <span className="text-5xl" aria-hidden="true">🎮</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        {/* Game name + match label */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h3 className="font-display text-xl font-semibold text-slate-800 leading-tight">
            {rec.name}
          </h3>
          {rec.match_emoji && rec.match_label && (
            <span className="chip shrink-0">
              {rec.match_emoji} {rec.match_label}
            </span>
          )}
        </div>

        {/* Meta: playtime, genres, rating */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {hourLabel && (
            <span className="chip">{hourLabel === 'Never played' ? '✨ ' : '🕐 '}{hourLabel}</span>
          )}
          {rec.genres?.slice(0, 3).map((g) => (
            <span key={g} className="chip">{g}</span>
          ))}
          {ratingStars && (
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < ratingStars ? 'rating-star' : 'text-slate-200'}>
                  ★
                </span>
              ))}
              <span className="text-slate-400 ml-1">{rec.rating?.toFixed(1)}</span>
            </span>
          )}
        </div>

        {/* AI blurb */}
        <blockquote className="text-slate-600 text-sm leading-relaxed border-l-2 border-wao-lavender/50 pl-3 italic">
          {rec.blurb}
        </blockquote>

        {/* Steam link */}
        {rec.appId && (
          <a
            href={`https://store.steampowered.com/app/${rec.appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-xs text-wao-lav-deep underline decoration-dotted
                       hover:text-wao-pink-deep transition-colors"
          >
            View on Steam →
          </a>
        )}
      </div>
    </div>
  )
}
