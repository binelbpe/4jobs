module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      animation: {
        'spin-reverse': 'spin 3s linear infinite reverse',
        'spin-slow': 'spin 3s linear infinite',
        float: 'float 10s ease-in-out infinite',
        confetti: 'confetti 10s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, 10px) rotate(5deg)' },
          '50%': { transform: 'translate(0, 20px) rotate(0deg)' },
          '75%': { transform: 'translate(-10px, 10px) rotate(-5deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        confetti: {
          '0%': { transform: 'translateY(-10%) rotate(0)' },
          '100%': { transform: 'translateY(100%) rotate(360deg)' },
        },
      },
      backgroundImage: {
        'pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'confetti': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Ccircle cx='45' cy='45' r='5' fill='%23FF6B6B' /%3E%3Ccircle cx='60' cy='60' r='5' fill='%234ECDC4' /%3E%3Ccircle cx='75' cy='75' r='5' fill='%23FFA07A' /%3E%3Ccircle cx='15' cy='15' r='5' fill='%2345B7D1' /%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
