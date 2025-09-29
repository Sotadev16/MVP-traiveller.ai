import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Homepage/Dark theme colors (from index.html)
        'dark-bg': '#0b0f1a',
        'dark-fg': '#e9eef7',
        'dark-muted': '#a9b7cd',
        'dark-card': '#0f172a',
        'cta': '#facc15',
        'cta-hover': '#eab308',
        'cta-active': '#ca8a04',

        // Results page light theme colors (from resultaten.html)
        'light-fg': '#111',
        'light-bg': '#f6f7fb',
        'light-muted': '#516079',
        'light-brand': '#facc15',
        'light-line': '#e8edf5',
        'light-card': '#ffffff',
        'light-meta': '#5e6b85',
        'light-chip': '#2c3b52',
        'light-score': '#2f855a',

        // Additional colors for forms and other elements
        'form-border': '#1e293b',
        'form-input': '#1e293b',
        'error': '#ef4444',
        'success': '#10b981',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        // From index.html: --shadow: 0 12px 40px rgba(0,0,0,.35);
        'dark': '0 12px 40px rgba(0,0,0,.35)',
        'dark-heavy': '0 25px 60px rgba(0,0,0,.5)',
        'cta': '0 8px 25px rgba(250,204,21,.3)',
        'cta-heavy': '0 12px 35px rgba(250,204,21,.4)',
        // From resultaten.html: box-shadow:0 12px 28px rgba(0,0,0,.06);
        'light': '0 12px 28px rgba(0,0,0,.06)',
        'light-hover': '0 20px 40px rgba(0,0,0,.15)',
      },
      animation: {
        'slide-in-up': 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-card': 'cardFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'rotate-slow': 'rotateSlow 8s linear infinite',
      },
      keyframes: {
        slideInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        cardFadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': {
            boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 40px rgba(250, 204, 21, 0.8)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        scaleIn: {
          from: {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        slideInRight: {
          from: {
            opacity: '0',
            transform: 'translateX(50px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInLeft: {
          from: {
            opacity: '0',
            transform: 'translateX(-50px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        rotateSlow: {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
      backdropBlur: {
        'brand': '6px',
        'heavy': '20px',
        'ultra': '40px',
      },
      textShadow: {
        'sm': '0 1px 2px rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 2px 4px rgb(0 0 0 / 0.1)',
        'lg': '0 2px 16px rgb(0 0 0 / 0.35)',
      },
    },
  },
  plugins: [
    function({ matchUtilities, theme }: { matchUtilities: any, theme: any }) {
      matchUtilities(
        {
          'text-shadow': (value: string) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
};

export default config;