"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveRedemptionAction } from "@/lib/actions/redemptions";

export function RedemptionActions({ redemptionId }: { redemptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resolve(status: "approved" | "rejected") {
    setLoading(true);
    await resolveRedemptionAction(
      redemptionId,
      status,
      status === "rejected" ? "Rechazado por admin" : "Aprobado"
    );
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={loading}
        onClick={() => resolve("rejected")}
        className="btn-ghost text-danger hover:bg-danger/10 hover:text-danger"
      >
        Rechazar
      </button>
      <button disabled={loading} onClick={() => resolve("approved")} className="btn-primary px-4 py-2 text-xs">
        {loading ? "…" : "Aprobar"}
      </button>
    </div>
  );
}
