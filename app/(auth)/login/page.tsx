"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DEV_AUTH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-primary">Sell In Reconoce</h1>
        <p className="mb-6 text-sm text-neutral-700">Ingresa para reconocer a tu equipo</p>

        {/* Producción: botón de Microsoft Entra ID. Requiere configuración
            real en Supabase Auth > Providers (ver docs/DEPLOYMENT_GUIDE.md).
            Se muestra siempre; si Entra ID no está configurado, informa al
            usuario en vez de fallar silenciosamente. */}
        <button
          type="button"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "azure",
              options: { redirectTo: `${window.location.origin}/dashboard` },
            })
          }
          className="mb-4 w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium hover:bg-neutral-100"
        >
          Ingresar con Microsoft
        </button>

        {DEV_AUTH_ENABLED && (
          <>
            <div className="my-4 flex items-center gap-2 text-xs text-neutral-700">
              <div className="h-px flex-1 bg-neutral-200" />
              solo desarrollo
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <form onSubmit={handleDevLogin} className="space-y-3">
              <input
                type="email"
                required
                placeholder="correo@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              />
              <input
                type="password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              />
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
