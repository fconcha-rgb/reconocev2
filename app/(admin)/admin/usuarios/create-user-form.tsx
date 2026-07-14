"use client";

import { useState, useTransition } from "react";
import { Copy, RefreshCw, UserPlus } from "lucide-react";
import { createUserAction } from "./actions";

// Contraseñas legibles y sin caracteres ambiguos (0/O, 1/l/I).
function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  jobTitle: "",
  area: "",
  role: "collaborator" as "collaborator" | "admin",
};

export function CreateUserForm() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{ email: string; password: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createUserAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLastCreated({ email: form.email, password: form.password });
      setForm(EMPTY);
    });
  }

  async function copyCredentials() {
    if (!lastCreated) return;
    await navigator.clipboard.writeText(
      `Acceso a Sell In Reconoce\nCorreo: ${lastCreated.email}\nContraseña temporal: ${lastCreated.password}\n\nAl entrar, puedes cambiarla en Mi perfil.`
    );
  }

  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-heading text-base font-extrabold">
        <UserPlus className="h-4 w-4" /> Crear usuario
      </h2>
      <p className="mt-1 font-ui text-xs text-graphite">
        La cuenta queda activa al instante, sin correos de por medio: tú le entregas
        la contraseña a la persona por el canal que prefieras.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cu-first" className="label">Nombre</label>
          <input id="cu-first" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="cu-last" className="label">Apellido</label>
          <input id="cu-last" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cu-email" className="label">Correo</label>
          <input id="cu-email" type="email" required placeholder="nombre@falabella.cl" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cu-pass" className="label">Contraseña temporal</label>
          <div className="flex gap-2">
            <input
              id="cu-pass"
              type="text"
              required
              minLength={8}
              autoComplete="off"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="input font-mono"
            />
            <button type="button" onClick={() => set("password", generatePassword())} className="btn-secondary shrink-0 px-4" title="Generar contraseña">
              <RefreshCw className="h-4 w-4" /> Generar
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="cu-job" className="label">Cargo <span className="normal-case text-mist">(opcional)</span></label>
          <input id="cu-job" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="cu-area" className="label">Área <span className="normal-case text-mist">(opcional)</span></label>
          <input id="cu-area" value={form.area} onChange={(e) => set("area", e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="cu-role" className="label">Rol</label>
          <select id="cu-role" value={form.role} onChange={(e) => set("role", e.target.value as any)} className="input">
            <option value="collaborator">Colaborador</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 font-ui text-sm font-medium text-danger sm:col-span-2">
            {error}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>

      {lastCreated && (
        <div role="status" className="mt-4 rounded-lg border border-success/40 bg-success/10 p-4">
          <p className="font-ui text-sm font-semibold text-ink">
            Usuario creado: {lastCreated.email}
          </p>
          <p className="mt-1 font-ui text-xs text-graphite">
            Contraseña temporal: <code className="rounded bg-white px-1.5 py-0.5 font-mono">{lastCreated.password}</code>
            {" — "}entrégasela por un canal seguro y sugiérele cambiarla en “Mi perfil”.
          </p>
          <button type="button" onClick={copyCredentials} className="btn-ghost mt-2 -ml-2">
            <Copy className="h-3.5 w-3.5" /> Copiar credenciales
          </button>
        </div>
      )}
    </section>
  );
}
