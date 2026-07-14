import { describe, it, expect } from "vitest";
import { recognitionSchema, redemptionSchema } from "@/lib/validations";

describe("recognitionSchema", () => {
  it("rechaza mensaje vacío", () => {
    const result = recognitionSchema.safeParse({
      receiverId: crypto.randomUUID(),
      pillarId: crypto.randomUUID(),
      amount: 100,
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza monto negativo", () => {
    const result = recognitionSchema.safeParse({
      receiverId: crypto.randomUUID(),
      pillarId: crypto.randomUUID(),
      amount: -50,
      message: "buen trabajo",
    });
    expect(result.success).toBe(false);
  });

  it("acepta un input válido", () => {
    const result = recognitionSchema.safeParse({
      receiverId: crypto.randomUUID(),
      pillarId: crypto.randomUUID(),
      amount: 150,
      message: "Excelente trabajo en el cierre de mes",
    });
    expect(result.success).toBe(true);
  });
});

describe("redemptionSchema", () => {
  it("rechaza id inválido", () => {
    const result = redemptionSchema.safeParse({ catalogItemId: "no-es-uuid" });
    expect(result.success).toBe(false);
  });
});
