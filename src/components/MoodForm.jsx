import { useState } from 'react'

// ── Option data ──────────────────────────────────────────
const TIME_OPTIONS = [
  { value: 'quick',    emoji: '⚡', label: '< 30 min',    desc: 'Just a quick session' },
  { value: 'short',   emoji: '☕', label: '30–60 min',   desc: 'Time for a cup of tea' },
  { value: 'medium',  emoji: '🌙', label: '1–2 hours',   desc: 'A proper evening' },
  { value: 'long',    emoji: '🌟', label: '2–4 hours',   desc: 'Deep dive' },
  { value: 'marathon',emoji: '🏰', label: 'All day',     desc: 'Total immersion' },
]

const ENERGY_OPTIONS = [
  { value: 'exhausted', emoji: '😴', label: 'Exhausted',  desc: 'Something super chill' },
  { value: 'low',       emoji: '🌸', label: 'Low energy', desc: 'Cozy and relaxing' },
  { value: 'medium',    emoji: '☀️', label: 'Medium',     desc: 'Normal play session' },
  { value: 'high',      emoji: '✨', label: 'High energy',desc: 'Fun and engaging' },
  { value: 'hyped',     emoji: '🔥', label: 'Hyped!',     desc: 'Intense / deep' },
]

const VIBE_OPTIONS = [
  { value: 'story',       emoji: '📖', label: 'Story / RPG' },
  { value: 'action',      emoji: '⚔️', label: 'Action' },
  { value: 'puzzle',      emoji: '🧩', label: 'Puzzle / Strategy' },
  { value: 'casual',      emoji: '🌿', label: 'Casual / Chill' },
  { value: 'mystery',     emoji: '🔍', label: 'Mystery' },
  { value: 'horror',      emoji: '👻', label: 'Horror' },
  { value: 'multiplayer', emoji: '👯', label: 'Multiplayer' },
  { value: 'indie',       emoji: '🎨', label: 'Indie / Artsy' },
  { value: 'platformer',  emoji: '🍄', label: 'Platformer' },
]

const PROTAG_OPTIONS = [
  { value: 'any',    emoji: '🌈', label: 'No preference' },
  { value: 'female', emoji: '👩', label: 'Female protag' },
  { value: 'male',   emoji: '👨', label: 'Male protag' },
  { value: 'custom', emoji: '✨', label: 'Non-binary / other' },
]

// ── Component ─────────────────────────────────────────────
export default function MoodForm({ onSubmit, onClose, isLoading }) {
  const [time,     setTime]     = useState('')
  const [energy,   setEnergy]   = useState('')
  const [vibes,    setVibes]    = useState([])
  const [protag,   setProtag]   = useState('')
  const [freetext, setFreetext] = useState('')

  const canSubmit = time && energy && !isLoading

  const toggleVibe = (v) =>
    setVibes((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ time, energy, vibes, protag, freetext })
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div
        className="relative card-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 page-enter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-form-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl transition-colors"
          aria-label="Close"
          disabled={isLoading}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-4xl mb-2 animate-float" aria-hidden="true">🔮</div>
          <h2 id="mood-form-title" className="font-display text-2xl font-semibold text-slate-700">
            Cast the Recommendation Spell
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Tell me how you're feeling and I'll find your perfect game ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">

          {/* ── Time ── */}
          <section>
            <Label required>How much time do you have?</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {TIME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`mood-option ${time === o.value ? 'selected' : ''}`}
                  onClick={() => setTime(o.value)}
                >
                  <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
                  <span className="font-semibold text-xs text-slate-700">{o.label}</span>
                  <span className="text-xs text-slate-400 hidden sm:block">{o.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Energy ── */}
          <section>
            <Label required>What's your energy level?</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {ENERGY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`mood-option ${energy === o.value ? 'selected' : ''}`}
                  onClick={() => setEnergy(o.value)}
                >
                  <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
                  <span className="font-semibold text-xs text-slate-700">{o.label}</span>
                  <span className="text-xs text-slate-400 hidden sm:block">{o.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Vibe ── */}
          <section>
            <Label>What vibe are you after? <span className="text-slate-400 font-normal">(pick any)</span></Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {VIBE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`mood-option ${vibes.includes(o.value) ? 'selected' : ''}`}
                  onClick={() => toggleVibe(o.value)}
                >
                  <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
                  <span className="text-xs font-medium text-slate-700">{o.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Protagonist ── */}
          <section>
            <Label>Protagonist preference?</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PROTAG_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`mood-option ${protag === o.value ? 'selected' : ''}`}
                  onClick={() => setProtag(o.value)}
                >
                  <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
                  <span className="text-xs font-medium text-slate-700">{o.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Freetext ── */}
          <section>
            <Label>Anything else you're in the mood for?</Label>
            <textarea
              className="input-magic resize-none mt-2"
              rows={2}
              placeholder="e.g. something cozy, want to feel like a hero, no jump scares please…"
              value={freetext}
              onChange={(e) => setFreetext(e.target.value)}
              maxLength={200}
              disabled={isLoading}
            />
          </section>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="btn-magic text-lg py-4"
            disabled={!canSubmit}
          >
            {isLoading
              ? <span className="inline-flex items-center gap-2">✨ Casting the spell…</span>
              : '✨ Find my perfect game'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Label({ children, required }) {
  return (
    <label className="block font-semibold text-slate-700 text-sm">
      {children}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
  )
}
