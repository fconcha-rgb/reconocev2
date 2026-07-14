import { test, expect } from "@playwright/test";

// Smoke test crítico: login dev -> reconocer -> ver en feed.
// Requiere NEXT_PUBLIC_ENABLE_DEV_AUTH=true y seed de desarrollo aplicado.
test("flujo de reconocimiento end-to-end", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("correo@example.com").fill("carla.munoz@example.com");
  await page.getByPlaceholder("Contraseña").fill(process.env.SEED_TEST_PASSWORD ?? "");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.goto("/reconocer");
  await page.selectOption("#receiver", { label: /Diego Rojas/ });
  await page.selectOption("#pillar", { label: /Ownership/ });
  await page.fill("#amount", "150");
  await page.fill("#message", "Excelente cierre de mes, gracias por el apoyo.");
  await page.getByRole("button", { name: "Ver vista previa" }).click();
  await page.getByRole("button", { name: "Confirmar reconocimiento" }).click();

  await expect(page).toHaveURL(/\/feed/);
  await expect(page.getByText("Diego Rojas")).toBeVisible();
});

test("canje sin saldo suficiente muestra error", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("correo@example.com").fill("nicolas.espinoza@example.com");
  await page.getByPlaceholder("Contraseña").fill(process.env.SEED_TEST_PASSWORD ?? "");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.goto("/catalogo");
  const disabledButton = page.getByRole("button", { name: /Puntos insuficientes/ }).first();
  await expect(disabledButton).toBeDisabled();
});
