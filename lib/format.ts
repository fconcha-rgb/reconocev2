// Utilidades de formato en es-CL, sin dependencias externas.

const nf = new Intl.NumberFormat("es-CL");

export function formatPoints(n: number): string {
  return nf.format(n);
}

export function monthName(date = new Date()): string {
  return new Intl.DateTimeFormat("es-CL", { month: "long" }).format(date);
}

const rtf = new Intl.RelativeTimeFormat("es-CL", { numeric: "auto" });

/** "hace 5 min", "ayer", "hace 3 días" — para el feed. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return "recién";
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
