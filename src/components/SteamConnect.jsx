import { useState } from 'react'

export default function SteamConnect({ onConnect, isLoading, error }) {
  const [steamId, setSteamId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (steamId.trim()) onConnect(steamId.trim())
  }

  return (
    <div className="page-enter max-w-md mx-auto px-4">
      <div className="card-glass p-8 text-center">
        {/* Steam icon decoration */}
        <div className="text-5xl mb-4 animate-float" aria-hidden="true">🎮</div>

        <h2 className="font-display text-2xl font-semibold text-slate-700 mb-2">
          Open the magical library
        </h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Enter your Steam 64-bit ID to enchant your backlog.<br />
          Find yours at{' '}
          <a
            href="https://steamid.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-wao-lav-deep underline decoration-dotted hover:text-wao-pink-deep transition-colors"
          >
            steamid.io
          </a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="input-magic text-center tracking-widest"
            type="text"
            placeholder="76561198000000000"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            pattern="\d{17}"
            title="Steam 64-bit ID (17 digits)"
            disabled={isLoading}
            aria-label="Steam 64-bit ID"
          />

          {error && (
            <div className="text-rose-500 text-sm bg-rose-50 border border-rose-200 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-magic text-base mt-1"
            disabled={isLoading || !steamId.trim()}
          >
            {isLoading
              ? <span className="inline-flex items-center gap-2"><LoadingDots /> Loading library…</span>
              : '✨ Open my library'}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-400 leading-relaxed">
          Make sure your Steam profile's{' '}
          <span className="font-semibold">Game Details</span> are set to{' '}
          <span className="font-semibold">Public</span> in your{' '}
          <a
            href="https://steamcommunity.com/my/edit/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-wao-lav-deep underline decoration-dotted"
          >
            privacy settings
          </a>.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="mt-6 flex justify-center gap-8 text-2xl opacity-50 select-none" aria-hidden="true">
        <span className="animate-sparkle" style={{ animationDelay: '0s' }}>✦</span>
        <span className="animate-sparkle" style={{ animationDelay: '0.7s' }}>✧</span>
        <span className="animate-sparkle" style={{ animationDelay: '1.4s' }}>⋆</span>
      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-soft"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  )
}
