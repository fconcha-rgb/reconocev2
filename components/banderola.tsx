// La banderola: rectángulo duro verde con la "f" minúscula.
// Ley de marca: nunca lleva border-radius.
export function Banderola({ size = 28 }: { size?: number }) {
  const h = Math.round(size * 1.5);
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center bg-verde font-heading font-black text-ink"
      style={{ width: size, height: h, fontSize: size * 0.95, lineHeight: 1 }}
    >
      f
    </span>
  );
}
