"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemCatalogItemAction } from "@/lib/actions/redemptions";

export function RedeemButton({
  catalogItemId,
  itemName,
  disabled,
  disabledReason,
}: {
  catalogItemId: string;
  itemName: string;
  disabled: boolean;
  disabledReason: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleRedeem() {
    if (loading || done) return; // protección extra a la idempotencia del servidor
    setLoading(true);
    setError(null);
    const key = crypto.randomUUID();
    const result = await redeemCatalogItemAction({ catalogItemId }, key);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setConfirming(false);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return <span className="font-ui text-xs font-bold text-success">Canjeado ✓</span>;
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <button type="button" onClick={() => setConfirming(false)} className="btn-ghost" disabled={loading}>
          No
        </button>
        <button type="button" onClick={handleRedeem} disabled={loading} className="btn-primary px-4 py-1.5 text-xs">
          {loading ? "…" : "Sí, canjear"}
        </button>
        {error && <span role="alert" className="sr-only">{error}</span>}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        title={disabled ? disabledReason : `Canjear ${itemName}`}
        className="btn-secondary px-4 py-1.5 text-xs"
      >
        {disabled ? disabledReason : "Canjear"}
      </button>
      {error && (
        <span role="alert" className="font-ui text-[11px] text-danger">{error}</span>
      )}
    </span>
  );
}
