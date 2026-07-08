import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0B0D", surface: "#14161A", elevated: "#1C1F24", edge: "#2A2E35",
        accent: "#E8B341", violet: "#7C5CFF", ok: "#2FBF71", warn: "#F5A524",
        danger: "#E5484D", info: "#3B9EFF", ink: "#EDEEF0", muted: "#9BA1A6",
      },
      fontFamily: {
        sans: ["Inter","ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Helvetica","Arial","sans-serif"],
        mono: ["JetBrains Mono","ui-monospace","SFMono-Regular","Menlo","Consolas","monospace"],
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};
export default config;
