/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        wao: {
          pink:          '#FFB7C5',
          'pink-light':  '#FFE4EC',
          'pink-deep':   '#F472B6',
          lavender:      '#C9A8E0',
          'lav-light':   '#EDE0F8',
          'lav-deep':    '#A78BFA',
          cream:         '#FFF5FB',
          petal:         '#FDF0FF',
          gold:          '#F9C74F',
          'soft-white':  '#FAFAFA',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Nunito"', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'glow-pink':     '0 0 24px rgba(255,183,197,0.55)',
        'glow-lav':      '0 0 24px rgba(201,168,224,0.55)',
        'card':          '0 4px 24px rgba(167,139,250,0.10)',
        'card-hover':    '0 10px 36px rgba(167,139,250,0.22)',
        'result':        '0 8px 40px rgba(201,168,224,0.30)',
      },
      backgroundImage: {
        'magical-gradient': 'linear-gradient(135deg, #FFF5FB 0%, #F5EEFF 50%, #FFF0FA 100%)',
        'card-shimmer':     'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)',
        'button-magic':     'linear-gradient(135deg, #C9A8E0 0%, #FFB7C5 100%)',
        'button-magic-hover':'linear-gradient(135deg, #B894D4 0%, #F490A8 100%)',
      },
      animation: {
        'sparkle':  'sparkle 2s ease-in-out infinite',
        'float':    'float 4s ease-in-out infinite',
        'shimmer':  'shimmer 2.5s linear infinite',
        'fade-up':  'fadeUp 0.6s ease-out forwards',
        'spin-slow':'spin 8s linear infinite',
        'pulse-soft':'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        sparkle: {
          '0%,100%': { opacity:'1', transform:'scale(1) rotate(0deg)' },
          '50%':     { opacity:'0.4', transform:'scale(0.75) rotate(15deg)' },
        },
        float: {
          '0%,100%': { transform:'translateY(0px)' },
          '50%':     { transform:'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition:'-200% center' },
          '100%': { backgroundPosition:'200% center' },
        },
        fadeUp: {
          '0%':   { opacity:'0', transform:'translateY(20px)' },
          '100%': { opacity:'1', transform:'translateY(0)' },
        },
        pulseSoft: {
          '0%,100%': { opacity:'0.7' },
          '50%':     { opacity:'1' },
        },
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.5rem',
      }
    }
  },
  plugins: [],
}
