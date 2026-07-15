// Notifica un reconocimiento al canal de Teams configurado, vía el
// webhook de Power Automate (trigger HTTP "manual").
//
// Requiere la variable de entorno TEAMS_RECOGNITION_WEBHOOK_URL (server-only,
// SECRETA — no lleva prefijo NEXT_PUBLIC_). Se configura en Vercel:
// Settings → Environment Variables.
//
// Nunca lanza (throw): si falla o no está configurada, solo se registra
// en consola. Un problema con Teams jamás debe romper la creación del
// reconocimiento, que ya quedó guardada en la base de datos.

type TeamsRecognitionPayload = {
  emisor: string;
  receptor: string;
  pilar: string;
  puntos: number;
  mensaje: string;
};

export async function notifyTeamsRecognition(
  payload: TeamsRecognitionPayload
): Promise<void> {
  const webhookUrl = process.env.TEAMS_RECOGNITION_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "[teams-notify] TEAMS_RECOGNITION_WEBHOOK_URL no está configurada; se omite la notificación."
    );
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emisor: payload.emisor,
        receptor: payload.receptor,
        pilar: payload.pilar,
        puntos: payload.puntos,
        mensaje: payload.mensaje,
        fecha: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[teams-notify] Power Automate respondió ${res.status}`);
    }
  } catch (err) {
    console.error("[teams-notify] Error al notificar a Teams:", err);
  } finally {
    clearTimeout(timeout);
  }
}
