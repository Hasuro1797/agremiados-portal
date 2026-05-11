import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        "card-gradient":
          "linear-gradient(to bottom, #FDFDFD, #FBFBFF, #EBEBEB, #FDFDFF)",
      },
      boxShadow: {
        custom: "0px 4px 4px rgba(0, 0, 0, 0.25)",
      },
      fontFamily: {
        inter: ["var(--font-inter)", ...fontFamily.sans],
      },
      colors: {
        primary: "hsl(var(--primary))",
        "primary-light": "hsl(var(--primary-light))",
        accent: "hsl(var(--accent))",
        "accent-hover": "hsl(var(--accent-hover))",
        foreground: "hsl(var(--foreground))",
        secondary: "hsl(var(--bg-body))",
        body: "hsl(var(--bg-body))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "header-gradient":
          "linear-gradient(90deg, rgb(46, 114, 214) 0%, rgba(29, 48, 143, 0.930) 46%)",
      },
      gridTemplateRows: {
        layout: "auto 1fr auto",
        "layout-2": "1fr auto",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
