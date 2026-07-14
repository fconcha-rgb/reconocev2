"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Banderola } from "@/components/banderola";
import { Avatar } from "@/components/avatar";
import { formatPoints } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/reconocer", label: "Reconocer" },
  { href: "/feed", label: "Feed" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/billetera", label: "Billetera" },
];

export function AppHeader({
  displayName,
  isAdmin,
  credits,
}: {
  displayName: string;
  isAdmin: boolean;
  credits: number | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-5 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Inicio">
          <Banderola size={22} />
          <span className="font-ui text-[15px] font-bold lowercase tracking-tight">
            sell in <span className="text-graphite">reconoce</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 font-ui text-[13px] font-semibold transition-colors ${
                  active ? "bg-ink text-white" : "text-graphite hover:bg-line-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {credits !== null && (
            <Link
              href="/reconocer"
              className="chip-points hidden sm:inline-flex"
              title="Créditos disponibles para reconocer este mes"
            >
              {formatPoints(credits)} <span className="font-medium text-white/70">créditos</span>
            </Link>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full p-1 pr-1.5 hover:bg-line-soft"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Menú de cuenta"
            >
              <Avatar name={displayName} size="sm" tone="ink" />
              <ChevronDown className="h-4 w-4 text-mist" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-pop"
              >
                <p className="border-b border-line-soft px-4 py-3 font-ui text-sm font-semibold">
                  {displayName}
                </p>
                <Link
                  href="/perfil"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 font-ui text-sm text-graphite hover:bg-soft hover:text-ink"
                >
                  <User className="h-4 w-4" /> Mi perfil
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/usuarios"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 font-ui text-sm text-graphite hover:bg-soft hover:text-ink"
                  >
                    <Settings className="h-4 w-4" /> Administración
                  </Link>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 border-t border-line-soft px-4 py-2.5 font-ui text-sm text-graphite hover:bg-soft hover:text-ink"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
