import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";

// Tipografías de marca: Mont → Montserrat (sustituto oficial del design
// system), Poppins para UI, Bebas Neue para el momento display.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-heading",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Sell In Reconoce",
  description: "Plataforma de reconocimiento del equipo Falabella Sell In",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${poppins.variable} ${bebas.variable}`}>
      <body className="font-ui">{children}</body>
    </html>
  );
}
