"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Banderola } from "@/components/banderola";

// Único método de acceso: correo + contraseña (Supabase Auth).
// Las cuentas las crea el administrador desde /admin/usuarios — no hay
// registro público ni correos de invitación.
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
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
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.1fr,1fr]">
      {/* Panel de marca */}
      <section className="relative flex flex-col justify-between bg-ink p-8 text-white lg:p-14">
        <div className="flex items-center gap-3">
          <Banderola size={30} />
          <span className="font-ui text-base font-bold lowercase tracking-tight">
            sell in <span className="text-white/60">reconoce</span>
          </span>
        </div>

        <div className="py-12 lg:py-0">
          <span className="inline-block bg-neon px-3 pb-0.5 pt-1.5 font-display text-5xl leading-none text-ink lg:text-7xl">
            Reconoce
          </span>
          <h1 className="mt-5 font-heading text-3xl font-black leading-tight lg:text-5xl">
            lo bueno se dice,
            <br />y se dice a tiempo.
          </h1>
          <p className="mt-4 max-w-sm font-ui text-sm text-white/70 lg:text-base">
            Reparte tus créditos del mes entre quienes lo hicieron bien. Cada
            reconocimiento suma puntos reales, canjeables en el catálogo.
          </p>
        </div>

        <p className="hidden font-ui text-xs text-white/40 lg:block">
          Equipo Sell In · Falabella Marketplace
        </p>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center p-6 lg:p-14">
        <div className="w-full max-w-sm">
          <h2 className="font-heading text-2xl font-extrabold">Ingresa a tu cuenta</h2>
          <p className="mt-1 font-ui text-sm text-graphite">
            Usa el correo y la contraseña que te entregó el administrador.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="label">Correo</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nombre@falabella.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 font-ui text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 font-ui text-xs text-mist">
            ¿Olvidaste tu contraseña o no tienes cuenta? Escríbele al
            administrador del programa para que te la restablezca o cree.
          </p>
        </div>
      </section>
    </main>
  );
}
