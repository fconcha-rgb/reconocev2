import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sell In Reconoce",
  description: "Plataforma de reconocimiento entre colaboradores de Falabella Sell In",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
