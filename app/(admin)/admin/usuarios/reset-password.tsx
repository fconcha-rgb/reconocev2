"use client";

import { useState, useTransition } from "react";
import { KeyRound, RefreshCw } from "lucide-react";
import { adminSetPasswordAction } from "./actions";

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function ResetPassword({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await adminSetPasswordAction({ userId, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOk(true);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setOk(false);
          setPassword(generatePassword());
        }}
        className="btn-ghost"
        title={`Restablecer contraseña de ${userName}`}
      >
        <KeyRound className="h-3.5 w-3.5" /> Contraseña
      </button>
    );
  }

  if (ok) {
    return (
      <span className="font-ui text-xs">
        <span className="font-bold text-success">Lista ✓</span>{" "}
        <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono">{password}</code>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost ml-1">Cerrar</button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        type="text"
        value={password}
        minLength={8}
        onChange={(e) => setPassword(e.target.value)}
        aria-label={`Nueva contraseña para ${userName}`}
        className="input w-32 px-2 py-1 font-mono text-xs"
      />
      <button type="button" onClick={() => setPassword(generatePassword())} className="btn-ghost px-2" title="Generar otra">
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={submit} disabled={pending || password.length < 8} className="btn-primary px-3 py-1.5 text-xs">
        {pending ? "…" : "Guardar"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-2">✕</button>
      {error && <span role="alert" className="font-ui text-[11px] text-danger">{error}</span>}
    </span>
  );
}
