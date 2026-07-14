import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { pillar?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Number(searchParams.page ?? "1");
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("recognitions")
    .select(
      "id, amount, message, created_at, sender:sender_id(display_name, job_title), receiver:receiver_id(display_name, job_title), pillar:pillar_id(name, icon)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.pillar) {
    query = query.eq("pillar_id", searchParams.pillar);
  }

  const { data: recognitions, error, count } = await query;
  const { data: pillars } = await supabase.from("pillars").select("id, name").eq("is_active", true);

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Feed de reconocimientos</h1>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <a href="/feed" className="rounded-full border border-neutral-200 px-3 py-1 hover:bg-neutral-100">Todos</a>
        {pillars?.map((p) => (
          <a key={p.id} href={`/feed?pillar=${p.id}`} className="rounded-full border border-neutral-200 px-3 py-1 hover:bg-neutral-100">
            {p.name}
          </a>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">No se pudo cargar el feed. Intenta de nuevo.</p>}

      {!error && recognitions?.length === 0 && (
        <p className="text-sm text-neutral-700">Todavía no hay reconocimientos para mostrar.</p>
      )}

      <ul className="space-y-3">
        {recognitions?.map((r: any) => (
          <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-700">
              <strong>{r.sender?.display_name}</strong> reconoció a{" "}
              <strong>{r.receiver?.display_name}</strong> · {r.pillar?.name} · {r.amount} pts
            </p>
            <p className="mt-2 text-neutral-900">{r.message}</p>
            <time className="mt-2 block text-xs text-neutral-700">
              {new Date(r.created_at).toLocaleString("es-CL")}
            </time>
          </li>
        ))}
      </ul>

      {count !== null && count > pageSize && (
        <div className="mt-4 flex justify-between text-sm">
          {page > 1 && <a href={`/feed?page=${page - 1}`} className="underline">Anterior</a>}
          {from + pageSize < (count ?? 0) && <a href={`/feed?page=${page + 1}`} className="underline">Siguiente</a>}
        </div>
      )}
    </main>
  );
}
