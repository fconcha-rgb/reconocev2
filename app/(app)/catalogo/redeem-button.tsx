"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemCatalogItemAction } from "@/lib/actions/redemptions";

export function RedeemButton({ catalogItemId, disabled }: { catalogItemId: string; disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleClick() {
    if (loading || done) return; // protección adicional a la idempotencia del servidor
    setLoading(true);
    setError(null);
    const key = crypto.randomUUID();
    const result = await redeemCatalogItemAction({ catalogItemId }, key);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading || done}
        className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {done ? "Canjeado" : loading ? "Procesando..." : disabled ? "Puntos insuficientes" : "Canjear"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
