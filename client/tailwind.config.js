/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ED1C24",
        secondary: "#010101",
        accent: "#FFFFFF",
        success: "#1ED760",
        neutral: "#E5E7EB"
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 45px -24px rgba(1, 1, 1, 0.35)"
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(115deg, rgba(1,1,1,0.84) 0%, rgba(1,1,1,0.56) 45%, rgba(1,1,1,0.22) 100%)",
        "section-glow":
          "radial-gradient(circle at 10% 5%, rgba(237,28,36,0.12), transparent 60%)"
      }
    }
  },
  plugins: []
};
