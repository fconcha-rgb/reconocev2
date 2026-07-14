import { initialsOf } from "@/lib/format";

// Avatares de iniciales, esquinas casi duras (eco de la banderola).
// tone "verde" destaca al protagonista (quien recibe el reconocimiento).
export function Avatar({
  name,
  size = "md",
  tone = "soft",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "soft" | "verde" | "ink";
}) {
  const sizes = { sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-xs", lg: "h-14 w-14 text-base" };
  const tones = {
    soft: "bg-line-soft text-graphite",
    verde: "bg-verde text-ink",
    ink: "bg-ink text-white",
  };
  return (
    <span
      aria-hidden
      className={`flex shrink-0 select-none items-center justify-center rounded font-ui font-bold ${sizes[size]} ${tones[tone]}`}
    >
      {initialsOf(name)}
    </span>
  );
}
