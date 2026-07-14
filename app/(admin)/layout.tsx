import Link from "next/link";

const ADMIN_LINKS = [
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/pilares", label: "Pilares" },
  { href: "/admin/catalogo", label: "Catálogo y canjes" },
  { href: "/admin/periodos", label: "Período" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-neutral-200 bg-white">
        <nav className="mx-auto flex max-w-3xl flex-wrap gap-2 p-4 text-sm">
          <Link href="/dashboard" className="rounded-full border border-neutral-200 px-3 py-1 hover:bg-neutral-100">
            ← Volver
          </Link>
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-neutral-200 px-3 py-1 hover:bg-neutral-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
