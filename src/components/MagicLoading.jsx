const MESSAGES = [
  'Consulting the stars…',
  'Asking the game fairy…',
  'Sorting through enchanted scrolls…',
  'Matching your energy to the cosmos…',
  'Weaving a spell of perfect fun…',
  'Polishing the crystal ball…',
]

export default function MagicLoading({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 page-enter">
      {/* Spinning sparkle */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-wao-lavender/30 animate-spin-slow"
          style={{ borderTopColor: '#C9A8E0', borderRightColor: '#FFB7C5' }}
        />
        <div
          className="absolute inset-3 rounded-full border border-wao-pink/20 animate-spin-slow"
          style={{ animationDirection: 'reverse', animationDuration: '5s' }}
        />
        <span className="text-4xl animate-pulse-soft" aria-hidden="true">✨</span>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="font-display text-xl text-slate-600 italic">
          {message || MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}
        </p>
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-wao-lavender animate-pulse-soft"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>

      {/* Decorative stars */}
      <div className="flex gap-6 text-xl opacity-40 select-none" aria-hidden="true">
        {['⋆', '✦', '✧', '⋆', '✦'].map((s, i) => (
          <span key={i} className="animate-sparkle" style={{ animationDelay: `${i * 0.35}s` }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
