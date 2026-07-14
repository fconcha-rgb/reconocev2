"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/recognitions";

// ── Acciones simples (usan la sesión del admin: RLS las autoriza) ──

export async function toggleUserStatusAction(formData: FormData) {
  const supabase = createClient();
  const userId = String(formData.get("userId"));
  const status = String(formData.get("status"));
  await supabase.from("profiles").update({ status }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

export async function changeUserRoleAction(formData: FormData) {
  const supabase = createClient();
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

// ── Creación manual de usuarios (service role — sin correos) ──
// El admin define correo y contraseña aquí mismo; email_confirm: true deja
// la cuenta lista para ingresar de inmediato. Supabase nunca envía nada.

const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  lastName: z.string().trim().min(1, "El apellido es obligatorio").max(60),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(72),
  jobTitle: z.string().trim().max(120).optional(),
  area: z.string().trim().max(120).optional(),
  role: z.enum(["collaborator", "admin"]).default("collaborator"),
});

export async function createUserAction(input: unknown): Promise<ActionResult<{ email: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { firstName, lastName, email, password, jobTitle, area, role } = parsed.data;
  const displayName = `${firstName} ${lastName}`.trim();

  const service = createServiceRoleClient();

  // 1) Usuario de Auth, confirmado al instante (no se envía ningún correo).
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, display_name: displayName },
  });

  if (createError || !created?.user) {
    const msg = createError?.message ?? "";
    if (msg.toLowerCase().includes("already")) {
      return { ok: false, error: "Ya existe un usuario con ese correo." };
    }
    return { ok: false, error: "No se pudo crear el usuario. Revisa el correo e intenta de nuevo." };
  }
  const newId = created.user.id;

  // 2) Perfil completo (el trigger ya creó uno básico; aquí lo completamos).
  const { error: profileError } = await service.from("profiles").upsert(
    {
      id: newId,
      organization_id: guard.ctx.organizationId,
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      email,
      job_title: jobTitle || null,
      area: area || null,
      role,
      status: "active",
    },
    { onConflict: "id" }
  );
  if (profileError) {
    return {
      ok: false,
      error: "El usuario de Auth se creó, pero falló su perfil. Reintenta o revisa la tabla profiles.",
    };
  }

  // 3) Créditos del mes en curso (mismo mecanismo idempotente del job mensual),
  //    para que la persona pueda reconocer desde su primer ingreso.
  const now = new Date();
  const { data: period } = await service
    .from("periods")
    .select("id, default_credits")
    .eq("organization_id", guard.ctx.organizationId)
    .eq("year", now.getFullYear())
    .eq("month", now.getMonth() + 1)
    .eq("status", "open")
    .maybeSingle();

  if (period) {
    await service.from("giving_credit_balances").upsert(
      {
        period_id: period.id,
        profile_id: newId,
        allocated: period.default_credits,
        balance: period.default_credits,
      },
      { onConflict: "period_id,profile_id", ignoreDuplicates: true }
    );
    await service.from("giving_ledger").upsert(
      {
        period_id: period.id,
        profile_id: newId,
        amount: period.default_credits,
        reason: "allocation",
        idempotency_key: `alloc:${period.id}:${newId}`,
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true }
    );
  }

  revalidatePath("/admin/usuarios");
  return { ok: true, data: { email } };
}

// ── Restablecer contraseña (service role — tampoco envía correos) ──

const resetSchema = z.object({
  userId: z.string().uuid(),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

export async function adminSetPasswordAction(input: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const service = createServiceRoleClient();
  const { error } = await service.auth.admin.updateUserById(parsed.data.userId, {
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: "No se pudo actualizar la contraseña." };

  return { ok: true, data: undefined };
}
