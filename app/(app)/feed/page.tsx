import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { PointsChip } from "@/components/points-chip";
import { relativeTime } from "@/lib/format";

export const revalidate = 0;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { pillar?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("recognitions")
    .select(
      "id, amount, message, created_at, sender:sender_id(display_name, job_title), receiver:receiver_id(display_name, job_title), pillar:pillar_id(id, name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.pillar) query = query.eq("pillar_id", searchParams.pillar);

  const [{ data: recognitions, error, count }, { data: pillars }] = await Promise.all([
    query,
    supabase.from("pillars").select("id, name").eq("is_active", true).order("sort_order"),
  ]);

  const filterHref = (pillarId?: string) => (pillarId ? `/feed?pillar=${pillarId}` : "/feed");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Feed de reconocimientos</h1>
      <p className="mt-1 font-ui text-sm text-graphite">Lo bueno que está pasando en el equipo.</p>

      {/* Filtro por pilar */}
      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link
          href={filterHref()}
          className={`shrink-0 rounded-full px-3.5 py-1.5 font-ui text-xs font-semibold ${
            !searchParams.pillar ? "bg-ink text-white" : "border border-line bg-white text-graphite"
          }`}
        >
          Todos
        </Link>
        {pillars?.map((p) => (
          <Link
            key={p.id}
            href={filterHref(p.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-ui text-xs font-semibold ${
              searchParams.pillar === p.id
                ? "bg-ink text-white"
                : "border border-line bg-white text-graphite"
            }`}
          >
            {p.name}
          </Link>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3 py-2 font-ui text-sm text-danger">
          No se pudo cargar el feed. Recarga la página para intentarlo de nuevo.
        </p>
      )}

      {!error && recognitions?.length === 0 && (
        <div className="card mt-4 p-8 text-center">
          <p className="font-ui text-sm text-graphite">Todavía no hay reconocimientos aquí.</p>
          <Link href="/reconocer" className="btn-primary mt-4">
            Reconocer a alguien
          </Link>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {recognitions?.map((r: any) => (
          <li key={r.id} className="card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Avatar name={r.sender?.display_name ?? "?"} size="sm" />
              <span className="font-ui text-lg leading-none text-mist">→</span>
              <Avatar name={r.receiver?.display_name ?? "?"} size="sm" tone="verde" />
              <div className="ml-1 min-w-0">
                <p className="truncate font-ui text-sm text-graphite">
                  <strong className="text-ink">{r.sender?.display_name}</strong> reconoció a{" "}
                  <strong className="text-ink">{r.receiver?.display_name}</strong>
                </p>
                <p className="font-ui text-xs text-mist">{relativeTime(r.created_at)}</p>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-line font-ui text-[15px] leading-relaxed text-ink">
              {r.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {r.pillar?.name && <span className="tag-pillar">{r.pillar.name}</span>}
              <PointsChip amount={r.amount} signed />
            </div>
          </li>
        ))}
      </ul>

      {count !== null && count > pageSize && (
        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <Link href={`/feed?page=${page - 1}${searchParams.pillar ? `&pillar=${searchParams.pillar}` : ""}`} className="btn-secondary">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          {from + pageSize < (count ?? 0) && (
            <Link href={`/feed?page=${page + 1}${searchParams.pillar ? `&pillar=${searchParams.pillar}` : ""}`} className="btn-secondary">
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
