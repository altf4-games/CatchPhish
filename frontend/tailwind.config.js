/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a1a4b",
        secondary: "#304ffe",
        accent: "#fdbc40",
        // Add other custom colors you're using
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 8s ease-in-out 1s infinite',
        'float-slow': 'float 10s ease-in-out 2s infinite',
        'scan': 'scan 4s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'shield': 'shield 4s ease-in-out infinite',
        'shimmer': 'shimmer 8s linear infinite',
        'slide-up': 'slideUp 1s forwards',
        'fade-in': 'fadeIn 1s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
    },
  },
  plugins: [],
}

}