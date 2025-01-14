module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {},
      colors: {
        "brand-bg": "#101010",
        "builderz-green": "#EF5323",
        "builderz-blue": "#EF5323",
        "brand-main": "#EF5323",
        "brand-secondary": "#6EC7FD",
        "brand-first": "#492BFF",
      },
      animation: {},
      screens: {},
      backgroundImage: {
        "brand-image": "url('/background.webp')",
        "texture-bg": "url('/texture-bg.svg')",
        "card-bg": "linear-gradient(to top, #090A0D, #090A0D)",
        "card-bgModal": "linear-gradient(to top, #101010, transparent)",
        "apy-gradient": "linear-gradient(to right, #3B42FF, #6557FF)",
      },
      backgroundColor: {
        mesh: "#0a0924",
        "light-mesh": "#e6e6f0",
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/forms")],
};
