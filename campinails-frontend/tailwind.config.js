/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'campi': {
          'pink': '#FDF2F8',
          'rose': '#FEE2E2',
          'purple': '#F3E8FF',
          'brown': '#8B4513',
          'mint': '#ECFDF5',
          'sky': '#EFF6FF',
          'amber': '#FFFBEB',
        }
      },
      fontFamily: {
        'sans': ['Outfit', 'Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Montserrat', 'Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'gradient-x': 'gradient-x 3s ease infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(236, 72, 153, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(236, 72, 153, 0.2)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'colored': '0 4px 14px 0 rgba(236, 72, 153, 0.2)',
      },
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
} 