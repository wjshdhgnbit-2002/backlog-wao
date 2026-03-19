export default function Header({ gameCount = null, onSwitch = null }) {
  return (
    <header className="relative z-10 text-center py-12 px-4">
      {/* Top sparkle row */}
      <div className="flex justify-center gap-3 mb-4 text-lg select-none" aria-hidden="true">
        <span className="animate-sparkle" style={{ animationDelay: '0s' }}>✦</span>
        <span className="animate-sparkle" style={{ animationDelay: '0.4s' }}>✧</span>
        <span className="animate-sparkle" style={{ animationDelay: '0.8s' }}>⋆</span>
        <span className="animate-sparkle" style={{ animationDelay: '1.2s' }}>✦</span>
        <span className="animate-sparkle" style={{ animationDelay: '1.6s' }}>✧</span>
      </div>

      {/* Logo / Title */}
      <div className="animate-float">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-magical leading-tight mb-2">
          Backlog Wao
        </h1>
        <p className="text-2xl" aria-hidden="true">✨</p>
      </div>

      {/* Subtitle */}
      <p className="mt-3 text-wao-lav-deep font-body text-lg font-light tracking-wide italic">
        Your magical game discovery fairy
      </p>

      {/* Game count badge + switch button */}
      {gameCount !== null && (
        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-white/60 border border-wao-lavender/40 text-sm text-slate-600">
            <span className="text-wao-lav-deep">🎮</span>
            <span>
              <span className="font-semibold text-wao-lav-deep">{gameCount}</span> games in your library
            </span>
          </div>
          {onSwitch && (
            <button
              onClick={onSwitch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                         font-medium text-wao-lav-deep border border-wao-lavender/40
                         bg-white/60 hover:bg-wao-lav-light transition-all duration-200"
            >
              🔄 Switch library
            </button>
          )}
        </div>
      )}

      {/* Decorative divider */}
      <div className="mt-8 flex items-center justify-center gap-3 select-none" aria-hidden="true">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-wao-lavender/60" />
        <span className="text-wao-lavender text-lg">⋆</span>
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-wao-lavender/60" />
      </div>
    </header>
  )
}
