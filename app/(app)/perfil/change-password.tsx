"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Cambio de contraseña con la sesión activa — no requiere correos.
export function ChangePasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
      return;
    }
    setOk(true);
    setPassword("");
    setConfirm("");
  }

  return (
    <section className="card mt-4 p-5">
      <h2 className="font-heading text-base font-extrabold">Cambiar mi contraseña</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="new-password" className="label">Nueva contraseña</label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="label">Repite la contraseña</label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 font-ui text-sm font-medium text-danger">
            {error}
          </p>
        )}
        {ok && (
          <p role="status" className="rounded-lg bg-success/10 px-3 py-2 font-ui text-sm font-medium text-success">
            Contraseña actualizada. Úsala en tu próximo ingreso.
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-secondary">
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </section>
  );
}
