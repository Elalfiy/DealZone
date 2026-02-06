/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A73E8',
          dark: '#1557B0',
          light: '#4285F4',
        },
        secondary: {
          DEFAULT: '#F4F6F8',
          dark: '#E8EAED',
        },
        accent: {
          DEFAULT: '#00C853',
          dark: '#00A844',
        },
        text: {
          dark: '#111827',
          gray: '#6B7280',
          light: '#9CA3AF',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

