/* =========================================================
   QuantumShield – Trust Search Verification Engine (real AI)
   Server-side only. Uses the Google Gemini API WITH Google
   Search grounding, so every verdict is backed by real,
   current web evidence (official sites, registries, app
   stores, security advisories) — never by invented data.

   Honesty rules baked in:
   • Contact details may ONLY come from grounded search
     evidence. Empty lists are the honest answer otherwise.
   • "Verified Official" status requires grounding sources;
     without evidence the engine downgrades to "Unverified".
   • No rule-based fallback — a trust verdict must come from
     real verification, never from a simulation.

   Requires the GEMINI_API_KEY environment variable.
   ========================================================= */

// Grounded search needs the tool-use capable model.
const MODEL = "gemini-2.5-flash";

export type TrustStatus =
  | "verified_official"
  | "unverified"
  | "suspicious"
  | "confirmed_scam";

export interface TrustEvidenceSource {
  title: string;
  url: string;
}

export interface TrustVerification {
  inputType: string;
  subjectName: string;
  status: TrustStatus;
  trustScore: number;
  summary: string;
  officialWebsite: string | null;
  officialPhones: { number: string; label: string }[];
  officialEmails: { email: string; label: string }[];
  officialApps: { name: string; store: string }[];
  verifiedSocial: { platform: string; handle: string }[];
  locations: { name: string; address: string }[];
  supportChannels: string[];
  knownScams: string[];
  riskIndicators: string[];
  howVerified: string[];
  recommendation: string;
  saferAlternative: string | null;
  assistantIntro: string;
}

export interface TrustResult {
  verification: TrustVerification;
  /** Real web pages the AI actually consulted (from Gemini grounding metadata). */
  sources: TrustEvidenceSource[];
  /** The real search queries the engine ran — shown to the user as method evidence. */
  searchQueries: string[];
}

const SYSTEM_PROMPT = `You are the Trust Search verification engine of QuantumShield, a cyber-fraud protection app. A user wants to know: "Can I trust this?" before they call a number, visit a website, pay, download an app, or contact support.

You have Google Search available. ALWAYS search before answering. Use authoritative sources: official organization websites, government/regulator records (RBI, TRAI, SEBI, I4C, official .gov/.gov.in domains), official app stores, verified business registries, and public phishing/scam intelligence.

THE INPUT can be anything: an organization name ("Canon support", "SBI customer care"), a phone number, a URL/domain, an email address, a UPI/payment ID, an app name, or a social profile. First decide what it is (inputType), then verify it.

ABSOLUTE HONESTY RULES — these override everything:
1. NEVER invent or guess official contact details. Every phone number, email, website, app, address or social handle you output MUST appear in your search evidence. If you cannot confirm a detail, omit it — an empty list is the correct answer.
2. Status "verified_official" is ONLY allowed when authoritative sources confirm the subject's official identity/details.
3. Use "unverified" when you simply cannot find reliable evidence either way. This is not an insult — say so plainly.
4. Use "suspicious" when there are real risk indicators (typosquatting, look-alike branding, complaints, unusual TLD, pressure tactics, unregistered entity) but no definitive proof.
5. Use "confirmed_scam" ONLY with credible evidence: security advisories, government warnings, scam databases, news reports, or clear technical proof.
6. For phone numbers: an official helpline must be confirmed on the organization's own website or a government source. Many scam numbers imitate real helplines — check whether the number is actually published officially.
7. Never rank by popularity or SEO. Only evidence matters.

TRUST SCORE (0-100, your evidence-based confidence that the subject is safe to trust):
- 85-100 only for verified_official with strong evidence
- 40-84 partial/unclear evidence (unverified range)
- 15-39 suspicious
- 0-14 confirmed_scam

FIELD RULES:
- "inputType": one of phone_number, website, email, upi_or_payment_id, app, organization, social_profile, qr_or_link, other.
- "subjectName": the official name of the organization/entity if identified, otherwise the input as given.
- "summary": 2-3 plain sentences a non-technical user instantly understands. State the verdict first.
- "officialPhones"/"officialEmails": label each one (e.g. "Customer care (India)", "Fraud reporting"). Only evidence-backed entries.
- "officialApps": name + store ("Google Play", "App Store"). Only apps published by the verified organization.
- "supportChannels": how to reach real support (e.g. "In-app chat", "support.canon.co.in contact form").
- "knownScams": common scams that impersonate this subject (fake support numbers, look-alike sites, fake apps). Real, documented patterns only.
- "riskIndicators": the specific red flags you found (empty if none).
- "howVerified": plain-language notes on HOW you checked (e.g. "Matched the number against the helpline published on sbi.co.in", "Domain registered 2 months ago — official site is 20+ years old").
- "recommendation": exactly what the user should do next. If scam/suspicious: do not engage, and report to the national cybercrime helpline 1930 / cybercrime.gov.in (for India) or the local authority.
- "saferAlternative": the verified official channel to use instead, when the input is risky and an official alternative exists; otherwise null.
- "assistantIntro": 2-4 conversational sentences opening the Trust Assistant chat: why this verdict, the single most important thing to know, and an invitation to ask follow-ups.
- If the user's language is Hindi, write all user-facing text fields in simple Hindi (keep names/URLs/numbers as-is).

OUTPUT: Return ONLY one JSON object with EXACTLY these keys:
{"inputType": string, "subjectName": string, "status": "verified_official"|"unverified"|"suspicious"|"confirmed_scam", "trustScore": number, "summary": string, "officialWebsite": string|null, "officialPhones": [{"number": string, "label": string}], "officialEmails": [{"email": string, "label": string}], "officialApps": [{"name": string, "store": string}], "verifiedSocial": [{"platform": string, "handle": string}], "locations": [{"name": string, "address": string}], "supportChannels": [string], "knownScams": [string], "riskIndicators": [string], "howVerified": [string], "recommendation": string, "saferAlternative": string|null, "assistantIntro": string}
No markdown, no code fences, no commentary — JSON only.`;

export function isTrustEngineAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Strip code fences / stray text and parse the first JSON object found. */
function parseJsonLoose<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function asArray<T>(v: unknown, max: number): T[] {
  return Array.isArray(v) ? (v.slice(0, max) as T[]) : [];
}

/** Extract the real pages Gemini consulted from grounding metadata. */
function extractSources(candidate: any): {
  sources: TrustEvidenceSource[];
  searchQueries: string[];
} {
  const meta = candidate?.groundingMetadata;
  const chunks: any[] = meta?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: TrustEvidenceSource[] = [];
  for (const c of chunks) {
    const uri: string | undefined = c?.web?.uri;
    const title: string | undefined = c?.web?.title;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({ title: title || uri, url: uri });
    if (sources.length >= 10) break;
  }
  const searchQueries: string[] = Array.isArray(meta?.webSearchQueries)
    ? meta.webSearchQueries.slice(0, 6)
    : [];
  return { sources, searchQueries };
}

/**
 * Verify anything with grounded Gemini. Returns null when the API is
 * not configured or the call fails — callers must surface an honest
 * "engine unavailable" message (there is NO simulated fallback).
 *
 * `technicalSignals` lets the route inject real signals it already
 * computed (Google Safe Browsing verdicts, URL heuristics) so the AI
 * weighs them as evidence.
 */
export async function verifyTrust(
  query: string,
  lang: "en" | "hi" = "en",
  technicalSignals: string[] = []
): Promise<TrustResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const userParts = [
    `User language: ${lang === "hi" ? "Hindi" : "English"}`,
    technicalSignals.length
      ? `Real technical signals already computed by QuantumShield (treat as evidence):\n- ${technicalSignals.join("\n- ")}`
      : "",
    `Verify this and tell the user whether they can trust it:\n\n${query.slice(0, 500)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        // Grounded search is slower than plain generation.
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userParts }] }],
          // Google Search grounding — structured-output mode cannot be
          // combined with tools, so the prompt enforces JSON instead.
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 4000, temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const text: string | undefined = candidate?.content?.parts
      ?.map((p: any) => p?.text ?? "")
      .join("");
    if (!text) return null;

    const parsed = parseJsonLoose<TrustVerification>(text);
    if (!parsed || !parsed.status || !parsed.summary) return null;

    const { sources, searchQueries } = extractSources(candidate);

    // Sanitize + clamp so the UI never receives garbage.
    const v: TrustVerification = {
      inputType: String(parsed.inputType || "other"),
      subjectName: String(parsed.subjectName || query).slice(0, 200),
      status: (
        ["verified_official", "unverified", "suspicious", "confirmed_scam"] as const
      ).includes(parsed.status)
        ? parsed.status
        : "unverified",
      trustScore: Math.max(0, Math.min(100, Math.round(Number(parsed.trustScore) || 0))),
      summary: String(parsed.summary).slice(0, 1000),
      officialWebsite: parsed.officialWebsite ? String(parsed.officialWebsite).slice(0, 300) : null,
      officialPhones: asArray<{ number: string; label: string }>(parsed.officialPhones, 8),
      officialEmails: asArray<{ email: string; label: string }>(parsed.officialEmails, 8),
      officialApps: asArray<{ name: string; store: string }>(parsed.officialApps, 6),
      verifiedSocial: asArray<{ platform: string; handle: string }>(parsed.verifiedSocial, 6),
      locations: asArray<{ name: string; address: string }>(parsed.locations, 5),
      supportChannels: asArray<string>(parsed.supportChannels, 6),
      knownScams: asArray<string>(parsed.knownScams, 8),
      riskIndicators: asArray<string>(parsed.riskIndicators, 8),
      howVerified: asArray<string>(parsed.howVerified, 8),
      recommendation: String(parsed.recommendation || "").slice(0, 1000),
      saferAlternative: parsed.saferAlternative
        ? String(parsed.saferAlternative).slice(0, 500)
        : null,
      assistantIntro: String(parsed.assistantIntro || parsed.summary).slice(0, 1500),
    };

    // Honesty enforcement: a "Verified Official" badge without real
    // grounding evidence is not allowed — downgrade to Unverified.
    if (v.status === "verified_official" && sources.length === 0) {
      v.status = "unverified";
      v.trustScore = Math.min(v.trustScore, 60);
      v.howVerified = [
        ...v.howVerified,
        lang === "hi"
          ? "पर्याप्त प्रमाण स्रोत नहीं मिले, इसलिए स्थिति 'असत्यापित' रखी गई है।"
          : "Not enough evidence sources were returned, so the status was kept at Unverified.",
      ];
    }

    return { verification: v, sources, searchQueries };
  } catch {
    return null; // caller shows the honest "engine unavailable" state
  }
}

/* ── Trust Assistant follow-up chat (also grounded) ── */

export interface AssistTurn {
  role: "user" | "assistant";
  text: string;
}

const ASSIST_PROMPT = `You are the QuantumShield Trust Assistant — a friendly fraud-prevention expert chatting with a non-technical user about a verification result they are looking at. You have Google Search available; search when the user asks something you need current facts for.

Rules:
- Ground every factual claim in search evidence or the verification context provided. If you don't know, say you don't know — NEVER invent contact details, numbers, or URLs.
- Educate: explain WHY something is safe or risky, common scam patterns involving this subject, and what to do next.
- For India, the real reporting channels are: cybercrime helpline 1930 and cybercrime.gov.in. Mention them when the user may be dealing with fraud.
- Keep answers short: 2-6 sentences or a few short bullet lines. Plain language, no jargon.
- If the user writes in Hindi, answer in simple Hindi.
- Plain text only (simple "-" bullets allowed). No markdown headings, no code fences.`;

export async function trustAssist(
  question: string,
  context: string,
  history: AssistTurn[],
  lang: "en" | "hi" = "en"
): Promise<{ answer: string; sources: TrustEvidenceSource[] } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Verification result the user is looking at (JSON):\n${context.slice(0, 6000)}\n\nUser language: ${lang === "hi" ? "Hindi" : "English"}`,
        },
      ],
    },
    {
      role: "model",
      parts: [{ text: "Understood. I'll answer follow-up questions about this verification honestly, without inventing details." }],
    },
    ...history.slice(-8).map((t) => ({
      role: t.role === "user" ? "user" : "model",
      parts: [{ text: t.text.slice(0, 1500) }],
    })),
    { role: "user", parts: [{ text: question.slice(0, 1500) }] },
  ];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        signal: AbortSignal.timeout(35_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ASSIST_PROMPT }] },
          contents,
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.4 },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const text: string | undefined = candidate?.content?.parts
      ?.map((p: any) => p?.text ?? "")
      .join("");
    if (!text || !text.trim()) return null;

    const { sources } = extractSources(candidate);
    return { answer: text.trim().slice(0, 4000), sources };
  } catch {
    return null;
  }
}
