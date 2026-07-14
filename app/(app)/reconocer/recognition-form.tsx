"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import { createRecognitionAction } from "@/lib/actions/recognitions";
import { Avatar } from "@/components/avatar";
import { PointsChip } from "@/components/points-chip";
import { formatPoints } from "@/lib/format";

type Colleague = { id: string; display_name: string; job_title: string | null; area: string | null };
type Pillar = { id: string; name: string; description: string | null };

const MESSAGE_MAX = 500;

export function RecognitionForm({
  colleagues,
  pillars,
  balance,
  minAmount,
}: {
  colleagues: Colleague[];
  pillars: Pillar[];
  balance: number;
  minAmount: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [pillarId, setPillarId] = useState("");
  const [amount, setAmount] = useState(minAmount);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "preview">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Idempotency key fija por intento de envío: protege contra doble clic,
  // reintentos de red y dos pestañas enviando el mismo formulario. Se
  // regenera a propósito al cambiar de paso (cada preview = intento nuevo).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [step]);

  const receiver = colleagues.find((c) => c.id === receiverId);
  const pillar = pillars.find((p) => p.id === pillarId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter(
      (c) =>
        c.display_name.toLowerCase().includes(q) ||
        (c.job_title ?? "").toLowerCase().includes(q) ||
        (c.area ?? "").toLowerCase().includes(q)
    );
  }, [search, colleagues]);

  const presets = useMemo(() => {
    const base = [minAmount, minAmount * 2, minAmount * 3, minAmount * 5];
    return Array.from(new Set(base)).filter((v) => v <= balance);
  }, [minAmount, balance]);

  const amountValid = amount >= minAmount && amount <= balance;
  const formValid = !!receiverId && !!pillarId && amountValid && message.trim().length > 0;
  const remaining = balance - amount;

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

  // ── Paso 2: vista previa (se ve igual que la tarjeta del feed) ──
  if (step === "preview") {
    return (
      <div className="mt-6 space-y-4">
        <p className="overline">Así se verá en el feed</p>
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Avatar name="Tú" size="sm" />
            <span className="font-ui text-lg leading-none text-mist">→</span>
            <Avatar name={receiver?.display_name ?? "?"} size="sm" tone="verde" />
            <p className="ml-1 font-ui text-sm text-graphite">
              Tú reconoces a <strong className="text-ink">{receiver?.display_name}</strong>
            </p>
          </div>
          <p className="mt-3 whitespace-pre-line font-ui text-[15px] leading-relaxed">{message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="tag-pillar">{pillar?.name}</span>
            <PointsChip amount={amount} signed />
          </div>
        </div>

        <p className="font-ui text-xs text-mist">
          Se descontarán {formatPoints(amount)} créditos — te quedarán {formatPoints(remaining)} este mes.
        </p>

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 font-ui text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => setStep("form")} className="btn-secondary">
            Editar
          </button>
          <button type="button" onClick={handleConfirm} disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Enviando…" : "Confirmar y enviar"}
          </button>
        </div>
      </div>
    );
  }

  // ── Paso 1: formulario ──
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (formValid) setStep("preview");
      }}
      className="mt-6 space-y-6"
    >
      {/* 1 · Persona */}
      <section className="card p-5">
        <label htmlFor="search" className="label">1 · ¿A quién reconoces?</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            id="search"
            type="search"
            placeholder="Busca por nombre, cargo o área"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto" role="listbox" aria-label="Colaboradores">
          {filtered.length === 0 && (
            <li className="px-2 py-3 font-ui text-sm text-mist">Sin resultados para “{search}”.</li>
          )}
          {filtered.map((c) => {
            const selected = c.id === receiverId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setReceiverId(selected ? "" : c.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    selected ? "bg-ink text-white" : "hover:bg-soft"
                  }`}
                >
                  <Avatar name={c.display_name} size="sm" tone={selected ? "verde" : "soft"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-ui text-sm font-semibold">{c.display_name}</span>
                    <span className={`block truncate font-ui text-xs ${selected ? "text-white/60" : "text-mist"}`}>
                      {[c.job_title, c.area].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-neon" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2 · Pilar */}
      <section className="card p-5">
        <p className="label">2 · ¿Qué pilar representa?</p>
        <div className="flex flex-wrap gap-2">
          {pillars.map((p) => {
            const selected = p.id === pillarId;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPillarId(p.id)}
                title={p.description ?? undefined}
                className={`rounded-sm px-3 py-1.5 font-ui text-sm font-semibold transition-colors ${
                  selected ? "bg-verde text-ink ring-2 ring-ink" : "border border-line bg-white text-graphite hover:border-ink"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
        {pillar?.description && (
          <p className="mt-2.5 font-ui text-xs text-mist">{pillar.description}</p>
        )}
      </section>

      {/* 3 · Monto */}
      <section className="card p-5">
        <div className="flex items-baseline justify-between">
          <p className="label mb-0">3 · ¿Cuántos créditos?</p>
          <span className="font-ui text-xs text-mist">
            Tienes <strong className="text-ink">{formatPoints(balance)}</strong>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {presets.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className={`rounded-full px-4 py-2 font-ui text-sm font-bold transition-colors ${
                amount === v ? "bg-ink text-neon" : "border border-line bg-white text-ink hover:border-ink"
              }`}
            >
              {formatPoints(v)}
            </button>
          ))}
          <input
            type="number"
            min={minAmount}
            max={balance}
            step={10}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Monto personalizado"
            className="input w-28"
          />
        </div>
        <p className={`mt-2 font-ui text-xs ${amountValid ? "text-mist" : "text-danger"}`}>
          {amount > balance
            ? "No te alcanzan los créditos de este mes para ese monto."
            : amount < minAmount
              ? `El mínimo por reconocimiento es ${formatPoints(minAmount)}.`
              : `Después de enviar te quedarán ${formatPoints(remaining)} créditos.`}
        </p>
      </section>

      {/* 4 · Mensaje */}
      <section className="card p-5">
        <label htmlFor="message" className="label">4 · ¿Por qué? Cuéntale al equipo</label>
        <textarea
          id="message"
          required
          maxLength={MESSAGE_MAX}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Qué hizo, qué impacto tuvo y por qué vale la pena contarlo…"
          className="input resize-y"
        />
        <p className="mt-1.5 text-right font-ui text-xs text-mist">
          {message.length}/{MESSAGE_MAX}
        </p>
      </section>

      <button type="submit" disabled={!formValid} className="btn-primary w-full py-3">
        Ver cómo quedará
      </button>
    </form>
  );
}
