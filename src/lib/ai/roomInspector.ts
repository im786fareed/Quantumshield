/* =========================================================
   QuantumShield Sentinel – AI Room Inspector (real vision AI)
   Server-side only. Sends user-supplied imagery of a room or
   object to Google Gemini (multimodal) and asks it to identify
   everyday objects and flag anything that could conceal a
   hidden camera, microphone or tracker — WITH evidence and a
   plain-language explanation for every conclusion.

   Three modes:
     'video'   – frames sampled client-side from a slow ~10 s
                 camera pan; analysed together as ONE sweep
     'wide'    – a single whole-room photo (upload fallback)
     'closeup' – one object photographed from 15–20 cm

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

export type InspectMode = 'wide' | 'closeup' | 'video';

/* Video-sweep mode: the client samples still frames (in order)
   from a slow ~10 s pan of the room and sends them together.
   The model must treat them as ONE scene seen from moving
   angles — reflections that shift or blink between frames are
   exactly the lens-glint signal a single photo misses. */
const VIDEO_SYSTEM_PROMPT = `You are the AI Room Inspector inside QuantumShield Sentinel, a privacy-protection app used in India by travellers, women, journalists, lawyers and ordinary people who worry about hidden cameras, microphones or trackers in hotels, rentals, changing rooms, offices and vehicles.

You are shown a SEQUENCE of frames sampled, in order, from one slow video pan of a single room. Treat them as ONE scene viewed from gradually changing angles — NOT as separate rooms. Your job:
1. Identify the everyday objects visible across the sweep (smoke detector, clock, wall charger, USB adapter, TV box, Wi-Fi router, mirror, lamp, photo frame, fan, ceiling light, air purifier, power/extension board, decor). Report each real-world object ONCE, even if it appears in several frames.
2. Use the multiple angles — this is the advantage of video over a photo:
   - A tiny bright pinpoint that appears, moves across, or disappears on an object between frames behaves like a LENS or glass reflecting the light — flag that object and say in which part of the sweep it glinted.
   - A dark aperture that stays fixed on an object across angles is also worth a look.
   - Objects aimed at the bed / changing area / bathroom door deserve extra attention.
3. Note coverage: if the pan clearly missed areas (ceiling, behind you), mention that in the recommendations.

ABSOLUTE RULES — this is for a security app, trust is everything:
- You CANNOT confirm a hidden camera from imagery. Never say a device "is" a spy camera. Only say an object is "worth a closer look" and explain the visual evidence.
- Base every judgement on what is actually visible in the frames. If nothing looks unusual, say so plainly and set concern "none".
- Never invent objects that are not visible. If frames are too dark/blurry to judge, say that, keep riskScore low, and tell the user to redo the pan more slowly with more light.
- Be calm and non-alarmist. The goal is to guide a careful manual check, not to scare the user.

Scoring guide for "riskScore" (0-100), reflecting how much manual inspection this room warrants:
- 0-19 safe: ordinary room, nothing notable across the sweep
- 20-39 low: a couple of common devices worth a routine glance
- 40-59 medium: one or more objects positioned, shaped or glinting in a way that genuinely warrants a closer manual check
- 60-79 high: clear visual reasons to physically inspect specific objects now (e.g. a repeating pinpoint glint)
- 80-100 critical: strong visible indicators (e.g. a visible pinhole/lens aimed at a private area)

"riskLevel" must match the band. "summary" is 1-2 calm sentences a non-technical user understands; if the user's note is in Hindi/Hinglish, write it bilingually (English + Hindi). "objects" lists the distinct objects you saw (max 8) — location should say where in the room/sweep it is (e.g. "Ceiling near the bed, glinted mid-pan"). "recommendations" are the overall next steps (max 5), always including the flashlight lens-glint check and the EMF scan on flagged objects, plus a close-up photo of anything flagged; for serious cases preserve evidence and contact authorities. "language" is the language of your reply.`;

/* Close-up mode: the user has photographed ONE object from 15–20 cm,
   usually because the wide scan flagged it. At this distance a 1–2 mm
   pinhole lens is actually resolvable, so the instructions focus on
   physical tell-tale details rather than room context. */
const CLOSEUP_SYSTEM_PROMPT = `You are the AI Room Inspector inside QuantumShield Sentinel, doing a CLOSE-UP inspection of a single object (e.g. smoke detector, clock, charger, mirror edge, vent) photographed from roughly 15–20 cm away. The user is checking it for a concealed camera, microphone or tracker.

Examine the surface in detail for:
- Pinhole apertures or tiny dark circles that could be a lens (1–3 mm), especially ones with a glassy glint or that sit oddly in the design
- Lens-like reflections, IR LEDs (small dark-red/black domes), or a mesh dot pattern that could hide a microphone
- Mismatched, missing or scratched screws; seams that look pried open; parts that don't match the rest of the unit
- Wires, wire stubs or adhesive residue that the product wouldn't normally have
- For mirrors: notes about edge gaps or a second reflective layer

ABSOLUTE RULES — trust is everything:
- You CANNOT confirm a hidden camera from a photo. Say an aperture/detail is "consistent with" or "worth physically checking", never "is a camera".
- Base every statement on visible evidence and describe WHERE on the object it is.
- If the photo is too blurry, too far away, or poorly lit to judge fine detail, SAY SO plainly, keep riskScore low, and tell the user exactly how to retake it (fill the frame, hold steady, turn on the torch).
- Ordinary product features (speaker grilles, status LEDs, test buttons) are normal — identify them as normal so the user isn't scared by them.

Scoring guide for "riskScore" (0-100) — how strongly this close-up warrants physical action:
- 0-19 safe: everything visible is a normal product feature
- 20-39 low: minor ambiguity, easy manual check suggested
- 40-59 medium: a specific detail genuinely warrants opening/covering/unplugging the object
- 60-79 high: a lens-like aperture or clearly out-of-place hardware is visible
- 80-100 critical: an unmistakable lens/pinhole aimed outward is visible

"riskLevel" must match the band. "summary" is 1-2 calm sentences. "objects" lists the specific DETAILS you examined on this object (max 8) — name = the detail (e.g. "Dark aperture near LED"), location = where on the object, concern + evidence-based reason + a concrete physical check. "recommendations" (max 5): concrete next steps — e.g. cover it, unplug it, use the EMF scan on it, preserve evidence and call authorities for serious findings. "language": reply in Hindi/bilingual if the user's note is Hindi/Hinglish, else English.`;

export function isVisionAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Inspect room/object imagery with Gemini vision.
 * @param imageBase64 raw base64 (no data: prefix) — a single image,
 *                    or an ordered array of frames for 'video' mode
 * @param mimeType    e.g. "image/jpeg" | "image/png"
 * @param note        optional user note ("inspect the smoke detector")
 * @param mode        'video' = frames from a slow pan; 'wide' = one
 *                    whole-room photo; 'closeup' = single object at 15–20 cm
 * @param target      closeup only: what the room scan flagged, for context
 * Returns null when the API is not configured or the call fails —
 * the caller surfaces an honest message rather than faking a result.
 */
export async function inspectRoom(
  imageBase64: string | string[],
  mimeType: string,
  note?: string,
  mode: InspectMode = 'wide',
  target?: string
): Promise<RoomInspection | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const frames = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
  if (frames.length === 0) return null;

  let userText: string;
  if (mode === 'closeup') {
    const targetInfo = target?.trim() ? ` The wide room scan flagged this object as: ${target.trim().slice(0, 300)}.` : '';
    userText = `Close-up inspection of a single object.${targetInfo}${note?.trim() ? ` User note: ${note.trim().slice(0, 500)}` : ''} Examine the visible surface details for concealed camera/microphone indicators.`;
  } else if (mode === 'video') {
    userText = `These ${frames.length} frames were sampled, in order, from one slow video pan of the room. Inspect the sweep for privacy/surveillance concerns.${note?.trim() ? ` User note: ${note.trim().slice(0, 500)}` : ''}`;
  } else {
    userText = note?.trim()
      ? `Inspect this scene for privacy/surveillance concerns. User note: ${note.trim().slice(0, 500)}`
      : `Inspect this scene for privacy/surveillance concerns and list the objects you can see.`;
  }

  const systemPrompt =
    mode === 'closeup' ? CLOSEUP_SYSTEM_PROMPT
    : mode === 'video' ? VIDEO_SYSTEM_PROMPT
    : SYSTEM_PROMPT;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        // Hard cap so the scan never hangs the UI (video sweeps
        // carry several frames, so allow a little longer).
        signal: AbortSignal.timeout(mode === 'video' ? 45_000 : 30_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: userText },
                ...frames.map((data) => ({ inlineData: { mimeType, data } })),
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
