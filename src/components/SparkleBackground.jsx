import { useMemo } from 'react'

const SYMBOLS = ['✦', '✧', '⋆', '✨', '✩', '★', '✫', '✬', '✭', '⭑', '◈', '❋']
const COLORS  = ['#C9A8E0', '#FFB7C5', '#A78BFA', '#F9C74F', '#FFD6E8', '#E0CFFF']

export default function SparkleBackground({ count = 28 }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id:     i,
      symbol: SYMBOLS[i % SYMBOLS.length],
      color:  COLORS[i % COLORS.length],
      top:    `${(i * 37 + 5) % 97}%`,
      left:   `${(i * 53 + 11) % 97}%`,
      size:   `${10 + (i % 5) * 5}px`,
      dur:    `${3 + (i % 4)}s`,
      delay:  `${(i * 0.4) % 4}s`,
    }))
  }, [count])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            top:    s.top,
            left:   s.left,
            '--size':  s.size,
            '--dur':   s.dur,
            '--delay': s.delay,
            '--color': s.color,
          }}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  )
}
