import RecommendationCard from './RecommendationCard'

export default function ResultsView({ recommendations, onReset, onNewSpell }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 text-center page-enter">
        <div className="text-5xl mb-4" aria-hidden="true">🌙</div>
        <h2 className="font-display text-2xl text-slate-600 mb-3">
          The stars couldn't find a match…
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Try adjusting your backlog filter to include more games, or tweak your mood preferences.
        </p>
        <button className="btn-magic" onClick={onReset}>← Back to library</button>
      </div>
    )
  }

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 pb-16 page-enter">

      {/* Header */}
      <div className="text-center py-10">
        <div className="text-4xl mb-3 animate-float" aria-hidden="true">✨</div>
        <h2 className="font-display text-3xl font-semibold text-slate-700 mb-2">
          Your magical picks
        </h2>
        <p className="text-slate-500 text-sm italic">
          The fairy has spoken — here are your perfect games for right now
        </p>
        <div className="mt-4 flex justify-center gap-3 text-lg text-wao-lavender select-none" aria-hidden="true">
          {['⋆', '✦', '✧', '⋆'].map((s, i) => (
            <span key={i} className="animate-sparkle" style={{ animationDelay: `${i * 0.4}s` }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="flex flex-col gap-5">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.name + i} rec={rec} rank={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <button className="btn-magic text-base" onClick={onNewSpell}>
          🔮 Cast another spell
        </button>
        <button className="btn-ghost" onClick={onReset}>
          ← Back to library
        </button>
      </div>

      {/* Footer sparkles */}
      <div className="text-center mt-10 text-wao-lavender/60 text-sm select-none" aria-hidden="true">
        ✦ ⋆ ✧ made with magic ✧ ⋆ ✦
      </div>
    </div>
  )
}
