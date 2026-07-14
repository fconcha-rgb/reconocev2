"use client";

import { useState, useTransition } from "react";
import { CalendarPlus } from "lucide-react";
import { openCurrentPeriodAction } from "./actions";

export function OpenPeriodButton({ monthLabel }: { monthLabel: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await openCurrentPeriodAction();
      if (!result.ok) setError(result.error ?? "Error desconocido.");
    });
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={pending} className="btn-primary">
        <CalendarPlus className="h-4 w-4" />
        {pending ? "Abriendo…" : `Abrir período de ${monthLabel}`}
      </button>
      {error && (
        <p role="alert" className="mt-2 font-ui text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
