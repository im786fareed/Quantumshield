/* =========================================================
   QuantumLocate™ – AI caller-summary explainer (server-side)

   Wraps Google Gemini to write ONE explainable, natural-language
   assessment of a phone number — the PRD's "AI Summary" / "Explainable
   AI" layer. Crucially, the model is given ONLY the real signals our
   engine already derived and is forbidden from inventing a city, a
   carrier, or a spam-report count. When the key is missing or the call
   fails, callers fall back to the deterministic summary.
   ========================================================= */

const MODEL = 'gemini-2.5-flash';

export interface CallerFacts {
  input: string;
  country: string | null;
  numberType: string;
  origin: string;          // already-honest origin ("India" / "Origin Unknown" / "Chennai, Tamil Nadu")
  originLevel: string;
  carrier: string | null;  // original allocation (may be null)
  circle: string | null;   // geocoded circle/region (may be null)
  isVirtualLikely: boolean;
  riskScore: number;
  riskBand: string;
  whyScore: string[];      // the concrete signals we found
  scamCategories: string[];
}

const SYSTEM_PROMPT = `You are the caller-intelligence explainer for AdamasVault (QuantumLocate), a fraud-protection app for users in India.

You receive a JSON object of ALREADY-VERIFIED facts about a phone number and must write a short, calm, natural-language explanation a non-technical Indian user can trust.

ABSOLUTE HONESTY RULES — you will be audited:
- Use ONLY the facts provided. Never invent a city, state, carrier, spam-report count, or scam history.
- If "origin" is "Origin Unknown" or only a country, do NOT guess a finer location. Say the location cannot be confirmed.
- Indian mobile numbers are portable: if a carrier is given, describe it as the ORIGINAL allocated operator, which may differ today. Never state it as the current operator with certainty.
- Never claim to know the caller's live GPS location, exact address, or real-time position.
- Do not state a spam-report number. There is no spam-report data source.
- Ground every sentence in a provided fact. No filler, no fabricated reassurance.

Write for someone deciding whether to answer a ringing phone. Be concrete and brief.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },        // 2-4 sentence natural-language assessment
    whyPoints: { type: 'ARRAY', items: { type: 'STRING' } }, // explainable bullet reasons (max 6)
    confidenceNote: { type: 'STRING' },  // one sentence on how sure we are and why
  },
  required: ['summary', 'whyPoints', 'confidenceNote'],
};

export interface CallerExplanation {
  summary: string;
  whyPoints: string[];
  confidenceNote: string;
}

export function isExplainerAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function explainCaller(facts: CallerFacts): Promise<CallerExplanation | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{
            role: 'user',
            parts: [{ text: `Verified facts (JSON):\n${JSON.stringify(facts, null, 2)}\n\nWrite the assessment.` }],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
            // gemini-2.5-flash is a thinking model — a tight budget gets
            // consumed by reasoning and returns empty text. Keep it generous.
            maxOutputTokens: 2048,
            temperature: 0.4,
          },
        }),
      },
    );

    if (!res.ok) return null;
    const data = await res.json();
    const jsonText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) return null;

    const parsed = JSON.parse(jsonText) as CallerExplanation;
    parsed.whyPoints = (parsed.whyPoints ?? []).slice(0, 6);
    if (!parsed.summary) return null;
    return parsed;
  } catch {
    return null;
  }
}
