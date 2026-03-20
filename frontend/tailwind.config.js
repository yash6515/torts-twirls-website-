/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        sand: '#E8DDD0',
        taupe: '#C4B5A0',
        blush: '#F2E4DC',
        sage: '#B8C9B5',
        'warm-gray': '#8B8078',
        'deep-brown': '#4A3728',
        'light-beige': '#F5F0E8',
        'rose-mist': '#E8D5D0',
        'gold': '#C9A96E',
        'gold-light': '#E8D5A8',
        'charcoal': '#2C2420',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'fade-in-slow': 'fadeIn 1s ease-out both',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up-delay': 'slideUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up-delay2': 'slideUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up-delay3': 'slideUp 0.6s 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s 2s ease-in-out infinite',
        'shimmer': 'shimmerMove 2.5s ease-in-out infinite',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'counter': 'counterAnim 1.5s ease-out both',
        'blob': 'blob 8s ease-in-out infinite',
        'blob-delay': 'blob 8s 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(2deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-1deg)' }
        },
        shimmerMove: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        reveal: {
          '0%': { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '100%': { clipPath: 'inset(0 0% 0 0)', opacity: '1' }
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
        },
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(74,55,40,0.06)',
        'medium': '0 6px 30px rgba(74,55,40,0.1)',
        'lifted': '0 12px 50px rgba(74,55,40,0.14)',
        'glow': '0 0 40px rgba(201,169,110,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.6)',
        'card': '0 1px 3px rgba(74,55,40,0.04), 0 8px 24px rgba(74,55,40,0.08)',
        'card-hover': '0 4px 12px rgba(74,55,40,0.06), 0 20px 60px rgba(74,55,40,0.14)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      }
    },
  },
  plugins: [],
};
