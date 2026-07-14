import { z } from "zod";

export const recognitionSchema = z.object({
  receiverId: z.string().uuid(),
  pillarId: z.string().uuid(),
  amount: z.coerce.number().int().positive().max(50000),
  message: z.string().trim().min(1, "El mensaje es obligatorio").max(500),
});
export type RecognitionInput = z.infer<typeof recognitionSchema>;

export const redemptionSchema = z.object({
  catalogItemId: z.string().uuid(),
});
export type RedemptionInput = z.infer<typeof redemptionSchema>;

export const pillarSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
  icon: z.string().trim().max(50).optional(),
  colorToken: z.string().trim().max(50).default("primary"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const catalogItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  type: z.enum(["physical", "gift_card", "experience", "flexible_benefit", "day_off", "other"]),
  category: z.string().trim().max(80).optional(),
  pointsCost: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().nonnegative().nullable().optional(),
  isUnlimitedStock: z.boolean().default(false),
  validFrom: z.string().date().optional().nullable(),
  validUntil: z.string().date().optional().nullable(),
  requiresApproval: z.boolean().default(false),
  maxPerUserPerPeriod: z.coerce.number().int().positive().nullable().optional(),
});

export const periodConfigSchema = z.object({
  defaultCredits: z.coerce.number().int().nonnegative(),
  minRecognitionAmount: z.coerce.number().int().positive(),
});
