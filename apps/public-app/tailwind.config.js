/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          Default: "#32936f",
          100: "#389e78",
          200: "#63ad8a",
          300: "#b7d7b3",
        },
        Secondary: {
          Default: "#deedc8",
          100: "#ddfcad",
        },
        dark: {
          Default: "#603d29",
          100: "#603d2950",
        },
        light: "#f7f5f3",
        normal: "#5D576B",
        green: "#b2f58a",
        orange: "#f5d08a",
      },
      fontFamily: {
        plight: ["RHD-light", "sans-serif"],
        pMedium: ["RHD-Medium", "sans-serif"],
        pSemiBold: ["RHD-SemiBold", "sans-serif"],
        pBold: ["RHD-Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
