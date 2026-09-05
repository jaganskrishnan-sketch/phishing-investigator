/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: '#080c15',
          surface: '#0e1424',
          card: '#131b2e',
          cardElevated: '#18233c',
          border: '#212d45',
          borderLight: '#2d3b59',
          violet: '#8b5cf6',
          violetHover: '#7c3aed',
          violetGlow: 'rgba(139, 92, 246, 0.15)',
          cyan: '#06b6d4',
          cyanHover: '#0891b2',
          cyanGlow: 'rgba(6, 182, 212, 0.15)',
        },
        security: {
          safe: '#10b981',
          safeBg: 'rgba(16, 185, 129, 0.12)',
          safeBorder: 'rgba(16, 185, 129, 0.3)',
          suspicious: '#f59e0b',
          suspiciousBg: 'rgba(245, 158, 11, 0.12)',
          suspiciousBorder: 'rgba(245, 158, 11, 0.3)',
          highRisk: '#ef4444',
          highRiskBg: 'rgba(239, 68, 68, 0.12)',
          highRiskBorder: 'rgba(239, 68, 68, 0.3)',
          critical: '#e11d48',
          criticalBg: 'rgba(225, 29, 72, 0.15)',
          criticalBorder: 'rgba(225, 29, 72, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        aurora: '0 4px 24px -1px rgba(139, 92, 246, 0.12), 0 2px 8px -1px rgba(6, 182, 212, 0.08)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        cardHover: '0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 15px rgba(139, 92, 246, 0.1)',
      }
    },
  },
  plugins: [],
}
