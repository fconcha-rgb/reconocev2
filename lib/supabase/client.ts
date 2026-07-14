import { createBrowserClient } from "@supabase/ssr";

// Cliente para usar dentro de Client Components ("use client"). Usa la anon
// key: nunca debe usarse la service role en el navegador.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
