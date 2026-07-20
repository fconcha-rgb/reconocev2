// Notifica un reconocimiento al canal de Teams, vía el flujo de Power
// Automate creado con la plantilla "Post to a channel when a webhook
// request is received".
//
// Esa plantilla espera un mensaje con un "attachment" de tipo Adaptive
// Card (no un JSON libre) — por eso el body tiene esta forma específica.
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

function buildAdaptiveCardMessage(payload: TeamsRecognitionPayload) {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          type: "AdaptiveCard",
          $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: "🏆 Nuevo reconocimiento",
              weight: "Bolder",
              size: "Medium",
              wrap: true,
            },
            {
              type: "FactSet",
              facts: [
                { title: "De:", value: payload.emisor },
                { title: "Para:", value: payload.receptor },
                { title: "Pilar:", value: payload.pilar },
                { title: "Puntos:", value: String(payload.puntos) },
              ],
            },
            {
              type: "TextBlock",
              text: payload.mensaje,
              wrap: true,
              isSubtle: true,
            },
          ],
        },
      },
    ],
  };
}

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
      body: JSON.stringify(buildAdaptiveCardMessage(payload)),
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
