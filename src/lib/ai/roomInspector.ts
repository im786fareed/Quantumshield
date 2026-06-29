/* =========================================================
   QuantumShield Sentinel – AI Room Inspector (real vision AI)
   Server-side only. Sends a user-supplied photo of a room or
   object to Google Gemini (multimodal) and asks it to identify
   everyday objects and flag anything that could conceal a
   hidden camera, microphone or tracker — WITH evidence and a
   plain-language explanation for every conclusion.

   Requires the GEMINI_API_KEY environment variable.
   When the key is missing or the call fails, the API route
   returns an honest "vision AI not configured" response — it
   never fabricates a detection.
   ========================================================= */

export type Concern = "none" | "low" | "medium" | "high";
export type InspectionLevel = "safe" | "low" | "medium" | "high" | "critical";

export interface InspectedObject {
  /** Plain name of the object, e.g. "Smoke detector". */
  name: string;
  /** Where it is in the photo, e.g. "Ceiling, above the bed". */
  location: string;
  /** How worth-a-closer-look this object is. */
  concern: Concern;
  /** Why it was flagged (or why it looks normal). Evidence-based. */
  reason: string;
  /** What the user should physically do to check it. */
  recommendation: string;
}

export interface RoomInspection {
  summary: string;
  riskScore: number; // 0-100
  riskLevel: InspectionLevel;
  objects: InspectedObject[];
  recommendations: string[];
  language: string;
}

// Same fast multimodal model the rest of the app uses.
const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are the AI Room Inspector inside QuantumShield Sentinel, a privacy-protection app used in India by travellers, women, journalists, lawyers and ordinary people who worry about hidden cameras, microphones or trackers in hotels, rentals, changing rooms, offices and vehicles.

You are shown ONE photo of a room or an object. Your job:
1. Identify the everyday objects you can actually see (e.g. smoke detector, clock, wall charger, USB adapter, TV box, Wi-Fi router, mirror, lamp, photo frame, fan, ceiling light, air purifier, fire alarm, power/extension board, decor).
2. For each notable object, judge whether it is in a position or condition that COULD be used to conceal a covert camera/mic/tracker, and explain the visual evidence.

ABSOLUTE RULES — this is for a security app, trust is everything:
- You CANNOT confirm a hidden camera from a photo. Never say a device "is" a spy camera. Only say an object is "worth a closer look" and explain why.
- Base every judgement on what is actually visible (a pinhole, a lens-like glint, an unusual wire, a device aimed at a bed/changing area, a mirror that could be two-way, a smoke detector placed oddly). If nothing looks unusual, say so plainly and set concern "none".
- Never invent objects that are not in the photo. If the photo is too dark/blurry to judge, say that and lower confidence (keep riskScore low).
- Be calm and non-alarmist. The goal is to guide a careful manual check, not to scare the user.

Scoring guide for "riskScore" (0-100), reflecting how much manual inspection this scene warrants:
- 0-19 safe: ordinary scene, nothing notable
- 20-39 low: a couple of common devices worth a routine glance
- 40-59 medium: one or more objects positioned or shaped in a way that genuinely warrants a closer manual check
- 60-79 high: clear visual reasons to physically inspect specific objects now
- 80-100 critical: strong visible indicators (e.g. a visible pinhole/lens aimed at a private area)

"riskLevel" must match the band. "summary" is 1-2 calm sentences a non-technical user understands; if the user's note is in Hindi/Hinglish, write it bilingually (English + Hindi). "objects" lists what you saw (max 8), each with concern + evidence-based reason + a concrete physical check. "recommendations" are the overall next steps (max 5), always including the option to use a flashlight to look for lens glints and to use the EMF scan, and for serious cases to preserve evidence and contact authorities. "language" is the language of your reply.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    riskScore: { type: "INTEGER" },
    riskLevel: { type: "STRING", enum: ["safe", "low", "medium", "high", "critical"] },
    objects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          location: { type: "STRING" },
          concern: { type: "STRING", enum: ["none", "low", "medium", "high"] },
          reason: { type: "STRING" },
          recommendation: { type: "STRING" },
        },
        required: ["name", "location", "concern", "reason", "recommendation"],
      },
    },
    recommendations: { type: "ARRAY", items: { type: "STRING" } },
    language: { type: "STRING" },
  },
  required: ["summary", "riskScore", "riskLevel", "objects", "recommendations", "language"],
};

export function isVisionAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Inspect a room/object photo with Gemini vision.
 * @param imageBase64 raw base64 (no data: prefix)
 * @param mimeType    e.g. "image/jpeg" | "image/png"
 * @param note        optional user note ("inspect the smoke detector")
 * Returns null when the API is not configured or the call fails —
 * the caller surfaces an honest message rather than faking a result.
 */
export async function inspectRoom(
  imageBase64: string,
  mimeType: string,
  note?: string
): Promise<RoomInspection | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const userText = note?.trim()
    ? `Inspect this scene for privacy/surveillance concerns. User note: ${note.trim().slice(0, 500)}`
    : `Inspect this scene for privacy/surveillance concerns and list the objects you can see.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        // Hard cap so the scan never hangs the UI.
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: userText },
                { inlineData: { mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const jsonText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) return null;

    const parsed = JSON.parse(jsonText) as RoomInspection;

    // Clamp / sanity-check so the UI never receives garbage.
    parsed.riskScore = Math.max(0, Math.min(100, Math.round(parsed.riskScore || 0)));
    parsed.objects = (parsed.objects ?? []).slice(0, 8);
    parsed.recommendations = (parsed.recommendations ?? []).slice(0, 5);
    return parsed;
  } catch {
    // Any failure (rate limit, network, bad JSON) → honest fallback.
    return null;
  }
}
