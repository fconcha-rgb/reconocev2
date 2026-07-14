import type { Config } from "tailwindcss";

// Capa de design tokens REEMPLAZABLE.
// Cuando el equipo de Diseño de Falabella entregue el Design System oficial,
// reemplaza únicamente los valores de este bloque "brand" — no hay que tocar
// componentes ni páginas. Ver docs/HUMAN_ACTIONS.md.
const brand = {
  primary: {
    DEFAULT: "#2E2A6E", // placeholder sobrio — reemplazar por token oficial
    foreground: "#FFFFFF",
  },
  accent: {
    DEFAULT: "#F2C230", // placeholder sobrio — reemplazar por token oficial
    foreground: "#1A1A1A",
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F2F2F2",
    200: "#E5E5E5",
    700: "#404040",
    900: "#1A1A1A",
  },
};

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: brand,
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
    },
  },
  plugins: [],
};

export default config;
