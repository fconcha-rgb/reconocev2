import { formatPoints } from "@/lib/format";

// Los puntos siempre se muestran así: neón sobre negro (eco del tag CMR).
export function PointsChip({ amount, signed = false }: { amount: number; signed?: boolean }) {
  const prefix = signed && amount > 0 ? "+" : "";
  return (
    <span className="chip-points">
      {prefix}
      {formatPoints(amount)} <span className="font-medium text-white/70">pts</span>
    </span>
  );
}
