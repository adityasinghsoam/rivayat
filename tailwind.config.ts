import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1C1715",
        ember: "#C95B2B",
        saffron: "#E7A92B",
        parchment: "#F8F1E3",
        moss: "#556B2F",
        clay: "#B4856B",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        aura:
          "radial-gradient(circle at top left, rgba(231,169,43,0.28), transparent 28%), radial-gradient(circle at 80% 20%, rgba(201,91,43,0.22), transparent 26%), linear-gradient(180deg, #fffaf2 0%, #f3e7d4 100%)",
      },
      boxShadow: {
        card: "0 20px 50px rgba(28, 23, 21, 0.08)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
