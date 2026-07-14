"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/pilares", label: "Pilares" },
  { href: "/admin/catalogo", label: "Catálogo y canjes" },
  { href: "/admin/periodos", label: "Período" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones de administración" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`shrink-0 rounded-full px-4 py-2 font-ui text-[13px] font-semibold transition-colors ${
              active ? "bg-ink text-white" : "border border-line bg-white text-graphite hover:border-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
