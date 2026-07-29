/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0D12",
        panel: "#131822",
        "panel-raised": "#1B212C",
        line: "#2A3241",
        cyan: {
          DEFAULT: "#00E5C7",
          dim: "#0A8F80",
        },
        amber: {
          DEFAULT: "#FFB020",
          dim: "#B8791A",
        },
        orange: {
          DEFAULT: "#FF6A1A",
          soft: "#FF9552",
          deep: "#C2410C",
          glow: "#FF8A3D",
        },
        danger: "#FF4D4D",
        success: "#3DDC84",
        ink: {
          DEFAULT: "#E8ECF2",
          muted: "#7C8798",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      clipPath: {
        panel: "polygon(0 0, 100% 0, 100% 100%, 4% 100%)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 229, 199, 0.25)",
        "glow-amber": "0 0 20px rgba(255, 176, 32, 0.25)",
        "glow-orange": "0 0 28px rgba(255, 106, 26, 0.35)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-border": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        scanline: "scanline 1.8s ease-in-out infinite",
        "pulse-border": "pulse-border 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
