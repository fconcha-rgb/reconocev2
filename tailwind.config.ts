import type { Config } from "tailwindcss";

// Design tokens oficiales — Falabella "Neon" 2024 (Brandbook).
// Fuente: Falabella_Design_System/colors_and_type.css
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        verde: "#ADD500",   // Verde Falabella (banderola) — marca, nunca botón
        neon: "#00F400",    // Verde Neón — acentos, "Lo último"
        ink: "#0A0A0A",     // texto principal / botones
        "ink-soft": "#1F2024",
        graphite: "#454A51", // texto secundario
        mist: "#6E7479",     // texto terciario / meta
        line: "#E2E5E7",
        "line-soft": "#EEF0F1",
        soft: "#F5F6F7",     // fondos suaves
        danger: "#FF004D",   // rojo corporativo
        success: "#44BF00",
        warning: "#F2B600",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Helvetica Neue", "Arial", "sans-serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 6px rgba(10,10,10,0.08), 0 2px 4px rgba(10,10,10,0.04)",
        pop: "0 8px 24px rgba(10,10,10,0.10), 0 4px 8px rgba(10,10,10,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
