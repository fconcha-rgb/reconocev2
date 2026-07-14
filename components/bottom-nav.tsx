"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Award, Gift, Wallet } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/reconocer", label: "Reconocer", icon: Award, primary: true },
  { href: "/catalogo", label: "Catálogo", icon: Gift },
  { href: "/billetera", label: "Billetera", icon: Wallet },
];

// Barra inferior solo en móvil. La acción central (Reconocer) es el
// botón negro elevado: la acción principal de toda la plataforma.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname.startsWith(href);
          if (primary) {
            return (
              <Link key={href} href={href} className="relative flex items-center justify-center" aria-label={label}>
                <span
                  className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full shadow-pop transition-colors ${
                    active ? "bg-neon text-ink" : "bg-ink text-neon"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 font-ui text-[10px] font-semibold ${
                active ? "text-ink" : "text-mist"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              <span className={`h-0.5 w-5 rounded-full ${active ? "bg-neon" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
