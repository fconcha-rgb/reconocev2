"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveRedemptionAction } from "@/lib/actions/redemptions";

export function RedemptionActions({ redemptionId }: { redemptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resolve(status: "approved" | "rejected") {
    setLoading(true);
    await resolveRedemptionAction(redemptionId, status, status === "rejected" ? "Rechazado por admin" : "Aprobado");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => resolve("approved")}
        className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
      >
        Aprobar
      </button>
      <button
        disabled={loading}
        onClick={() => resolve("rejected")}
        className="rounded-lg border border-neutral-200 px-3 py-1 text-xs hover:bg-neutral-100"
      >
        Rechazar
      </button>
    </div>
  );
}
