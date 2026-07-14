"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createRecognitionAction } from "@/lib/actions/recognitions";

type Colleague = { id: string; display_name: string; job_title: string | null; area: string | null };
type Pillar = { id: string; name: string; icon: string | null };

export function RecognitionForm({ colleagues, pillars }: { colleagues: Colleague[]; pillars: Pillar[] }) {
  const router = useRouter();
  const [receiverId, setReceiverId] = useState("");
  const [pillarId, setPillarId] = useState("");
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "preview">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Idempotency key fija por intento de envío: protege contra doble clic,
  // reintentos de red y dos pestañas enviando el mismo formulario.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [step === "preview"]);

  const receiver = colleagues.find((c) => c.id === receiverId);
  const pillar = pillars.find((p) => p.id === pillarId);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    const result = await createRecognitionAction(
      { receiverId, pillarId, amount, message },
      idempotencyKey
    );
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  if (step === "preview") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-700">Vista previa</p>
        <p className="mt-2 text-lg">
          Vas a reconocer a <strong>{receiver?.display_name}</strong> con{" "}
          <strong>{amount} puntos</strong> por <strong>{pillar?.name}</strong>.
        </p>
        <p className="mt-3 rounded-xl bg-neutral-100 p-3 text-sm">{message}</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Confirmar reconocimiento"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStep("preview");
      }}
      className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5"
    >
      <div>
        <label htmlFor="receiver" className="mb-1 block text-sm font-medium">A quién</label>
        <select
          id="receiver"
          required
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">Selecciona un colaborador</option>
          {colleagues.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name} {c.job_title ? `— ${c.job_title}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pillar" className="mb-1 block text-sm font-medium">Pilar</label>
        <select
          id="pillar"
          required
          value={pillarId}
          onChange={(e) => setPillarId(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">Selecciona un pilar</option>
          {pillars.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium">Créditos (mínimo 100)</label>
        <input
          id="amount"
          type="number"
          min={100}
          step={10}
          required
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Mensaje</label>
        <textarea
          id="message"
          required
          maxLength={500}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¿Por qué estás reconociendo a esta persona?"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground"
      >
        Ver vista previa
      </button>
    </form>
  );
}
