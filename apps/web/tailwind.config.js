function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      scale: {
        '107': '1.07',
      },
      colors: {
        navy: {
          950: withOpacity('--color-navy-950'),
          900: withOpacity('--color-navy-900'),
          800: withOpacity('--color-navy-800'),
          700: withOpacity('--color-navy-700'),
        },
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          hover: withOpacity('--color-accent-hover'),
          light: withOpacity('--color-accent-light'),
          soft: withOpacity('--color-accent-soft'),
        },
        cream: {
          DEFAULT: withOpacity('--color-cream'),
          dark: withOpacity('--color-cream-dark'),
        },
        sage: {
          DEFAULT: withOpacity('--color-sage'),
          dark: withOpacity('--color-sage-dark'),
        },
        slate: {
          50: withOpacity('--color-slate-50'),
          100: withOpacity('--color-slate-100'),
          200: withOpacity('--color-slate-200'),
          300: withOpacity('--color-slate-300'),
          400: withOpacity('--color-slate-400'),
          500: withOpacity('--color-slate-500'),
          600: withOpacity('--color-slate-600'),
          700: withOpacity('--color-slate-700'),
          800: withOpacity('--color-slate-800'),
          900: withOpacity('--color-slate-900'),
          950: withOpacity('--color-slate-950'),
        },
      },
      fontFamily: {
        sans:    ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        brand: '0.22em',
        kicker: '0.28em',
      },
    },
  },
  plugins: [],
};
