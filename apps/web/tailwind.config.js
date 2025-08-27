/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // True JARVIS HUD Colors - Cyan/Blue Based
        jarvis: {
          primary: '#00d4ff',     // Bright cyan (main JARVIS blue)
          secondary: '#0099cc',   // Darker cyan
          tertiary: '#66e5ff',    // Light cyan
          glow: '#00ffff',        // Bright cyan glow
          dark: '#001a33',        // Deep dark blue
          darker: '#000d1a',      // Even darker
        },
        hud: {
          blue: '#00d4ff',        // HUD blue
          cyan: '#00ffff',        // Bright cyan
          electric: '#0080ff',    // Electric blue
          pulse: '#4dd2ff',       // Pulse blue
          grid: '#003d66',        // Grid lines
          panel: 'rgba(0, 212, 255, 0.1)',  // Panel background
          border: 'rgba(0, 212, 255, 0.3)', // Panel borders
        },
        // Glass Morphism Colors - Updated for HUD
        glass: {
          light: 'rgba(0, 212, 255, 0.05)',
          dark: 'rgba(0, 212, 255, 0.1)',
          border: 'rgba(0, 212, 255, 0.3)',
          glow: 'rgba(0, 255, 255, 0.2)',
        },
        // Background gradients - Deep space theme
        bg: {
          dark: '#000811',        // Very deep space blue
          'dark-secondary': '#001122',
          space: '#000d1a',       // Space black with blue tint
          light: '#f0f8ff',       // Light mode fallback
          'light-secondary': '#e6f3ff',
        }
      },
      backgroundImage: {
        'jarvis-hud': 'radial-gradient(ellipse at center, #001122 0%, #000811 50%, #000d1a 100%)',
        'jarvis-light': 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
        'hud-panel': 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.1) 100%)',
        'hud-glow': 'radial-gradient(circle at center, rgba(0, 255, 255, 0.3) 0%, transparent 70%)',
        'data-flow': 'linear-gradient(90deg, transparent 0%, rgb(34 211 238 / 0.5) 50%, transparent 100%)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'hud-glow': '0 0 20px rgba(0, 212, 255, 0.5)',
        'hud-pulse': '0 0 30px rgba(0, 255, 255, 0.8)',
        'hud-panel': 'inset 0 1px 0 rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2)',
        'data-grid': '0 0 10px rgba(0, 212, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'hud-glow': 'hudGlow 2s ease-in-out infinite alternate',
        'hud-pulse': 'hudPulse 1.5s ease-in-out infinite',
        'rotate-slow': 'rotate 20s linear infinite',
        'data-flow': 'dataFlow 3s ease-in-out infinite',
        'grid-pulse': 'gridPulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        hudGlow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 255, 255, 0.8)' },
        },
        hudPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}