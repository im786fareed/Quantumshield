/* =========================================================
   QuantumShield – Legal Intelligence Engine (real AI engine)
   Server-side only. Uses the Google Gemini API to turn a
   citizen's incident report into a structured, evidence-backed
   case file: rights affected, potentially relevant laws,
   reporting authorities, a complaint draft, and next steps.

   Requires the GEMINI_API_KEY environment variable.
   When the key is missing or the call fails, the caller returns
   a clear "engine unavailable" response — this engine has no
   rule-based fallback because legal reasoning must come from the
   model, never from fabricated/simulated output.
   ========================================================= */

export interface LegalTimelineEntry {
  when: string;
  event: string;
}

export interface LegalEvidenceItem {
  item: string;
  type: string;
  strength: "Strong" | "Moderate" | "Weak";
  note: string;
}

export interface LegalLaw {
  law: string;
  provision: string;
  relevance: string;
}

export interface LegalAuthority {
  authority: string;
  contact: string;
  whenToUse: string;
}

export interface LegalContact {
  name: string;
  number: string;
}

export interface LegalAnalysis {
  incidentSummary: string;
  timeline: LegalTimelineEntry[];
  partiesInvolved: string;
  evidenceInventory: LegalEvidenceItem[];
  missingEvidence: string[];
  rightsAffected: string[];
  legalIssues: string[];
  relevantLaws: LegalLaw[];
  reportingAuthorities: LegalAuthority[];
  emergencyContacts: LegalContact[];
  nextSteps: string[];
  complaintDraft: string;
  escalationPath: string[];
  citizenChecklist: string[];
  caseReadinessScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  evidenceConfidenceScore: number;
  recommendedAssistance: string;
  disclaimer: string;
}

// Pro model gives stronger legal reasoning; flash keeps cost/latency low.
// The legal engine benefits from the more capable model.
const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are the QuantumShield Legal Intelligence Engine — an AI-powered Citizen Rights, Incident Analysis, Evidence Management, and Reporting Assistant for users in India.

MISSION
Help citizens understand potential rights violations, organize facts and evidence, identify potentially relevant legal frameworks, determine appropriate authorities, generate a professional complaint draft, and provide reporting guidance.

CRITICAL DISCLAIMER RULES — you must obey these at all times:
- Never determine guilt or innocence.
- Never claim that any named person has committed a crime.
- Never provide definitive legal advice or guarantee that a provision applies.
- Always use hedged language: "Potentially relevant laws may include...", "Based on the information provided...", "Authorities will determine final applicability."
- Focus on facts, evidence, rights, procedures, reporting channels, and citizen guidance.

CONTEXT
- The user is typically a non-technical citizen. Write in clear, plain, reassuring language.
- A single incident may involve MULTIPLE distinct offences at once (the citizen may list several categories — e.g. sexual assault AND attempt to murder). Address EACH distinct offence separately: provide relevant laws/sections for every offence, and reflect all of them in legalIssues, rightsAffected, the reporting authorities, and the complaintDraft. Do not collapse several serious offences into one.
- The incident may be in English, Hindi, or Hinglish. If the user's description is in Hindi/Hinglish, write key user-facing text bilingually (English + Hindi).
- Indian helplines you may cite when relevant (these are real): National Cyber Crime 1930 and cybercrime.gov.in; Emergency 112; Women 181; Child 1098; Consumer 1915; Ambulance 108; Fire 101; Police 100. For corruption, banking (RBI Ombudsman / cms.rbi.org.in), insurance (IRDAI / Bima Bharosa), labour, and state matters, name the appropriate department, escalation authority, regulator, or ombudsman where applicable.
- ALWAYS give the citizen specific, named legal provisions — exact section numbers — for every relevant law. Concrete sections help the citizen understand what may apply and approach authorities with confidence. Do NOT hide behind vague phrasing like "exact sections will be determined by authorities"; instead name your best-fit sections AND keep the hedge that authorities decide final applicability.
- India replaced the old criminal codes on 1 July 2024. Cite the CURRENT law as the primary provision, and include the familiar OLD section in brackets so citizens recognise it:
  * Bharatiya Nyaya Sanhita (BNS), 2023 — replaced the Indian Penal Code (IPC). Verified common mappings (use these exact numbers): Murder = BNS §103 (old IPC §302); Culpable homicide not amounting to murder = BNS §105 (old IPC §304); Attempt to murder = BNS §109 (old IPC §307); Dowry death = BNS §80 (old IPC §304B); Voluntarily causing hurt = BNS §115 (old IPC §323); Voluntarily causing grievous hurt = BNS §117 (old IPC §325); Acid attack = BNS §124 (old IPC §326A); Rape = BNS §63, punishment BNS §64 (old IPC §375/§376); Gang rape = BNS §70 (old IPC §376D); Assault to outrage modesty = BNS §74 (old IPC §354); Stalking = BNS §78 (old IPC §354D); Sexual harassment = BNS §75 (old IPC §354A); Cruelty by husband/relatives = BNS §85/§86 (old IPC §498A); Kidnapping = BNS §137 (old IPC §363); Wrongful confinement = BNS §127 (old IPC §342); Cheating = BNS §318 (old IPC §420); Cheating by personation = BNS §319 (old IPC §419); Extortion = BNS §308 (old IPC §384); Criminal breach of trust = BNS §316 (old IPC §406); Forgery = BNS §336 (old IPC §465/468); Criminal intimidation = BNS §351 (old IPC §506); Defamation = BNS §356 (old IPC §499/500); Criminal conspiracy = BNS §61 (old IPC §120B).
  * Special laws (still in force, cite by their own section): IT Act 2000 §66C (identity theft), §66D (cheating by personation using computer), §67/§67A (obscene/sexually explicit material); Prevention of Corruption Act 1988 §7 (bribery by public servant); Consumer Protection Act 2019; Protection of Women from Domestic Violence Act 2005; SC/ST (Prevention of Atrocities) Act; etc.
- Format each provision as e.g. "BNS §318 — Cheating (formerly IPC §420)". State your best, specific section based on the facts. If a fact is ambiguous, still name the most likely section and note it depends on what the investigation establishes — never refuse to name a section. Do not invent section numbers that do not exist; rely on your knowledge of these codes.

SCORING
- caseReadinessScore (0-100): how ready this case is to be reported/filed, given the facts and evidence provided. Low when key facts/evidence are missing.
- evidenceConfidenceScore (0-100): how strong and verifiable the described evidence is overall.
- riskLevel: Low / Medium / High / Critical — urgency and severity for the citizen (e.g. ongoing threat, financial loss in progress, physical danger = Critical/High).

OUTPUT
Return ONLY a JSON object matching the provided schema. Every field must be filled. Keep each list item concise and plain-language.
- relevantLaws: include AT LEAST 3 entries when the facts support it. For each entry, "law" is the Act (e.g. "Bharatiya Nyaya Sanhita, 2023" or "IT Act, 2000"), "provision" is the exact section with its title and old equivalent (e.g. "§318 — Cheating (formerly IPC §420)"), and "relevance" is one plain sentence explaining why this section may apply to the citizen's facts. Reference these same sections inside the complaintDraft.
- The complaintDraft must be a complete, ready-to-submit complaint addressed to the appropriate authority, citing the specific sections above, and including a placeholder for the complainant's signature, name, and date.
- Always end the disclaimer field reminding the user this is informational guidance, not legal advice, and that authorities decide final applicability.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    incidentSummary: { type: "STRING" },
    timeline: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          when: { type: "STRING" },
          event: { type: "STRING" },
        },
        required: ["when", "event"],
      },
    },
    partiesInvolved: { type: "STRING" },
    evidenceInventory: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          item: { type: "STRING" },
          type: { type: "STRING" },
          strength: { type: "STRING", enum: ["Strong", "Moderate", "Weak"] },
          note: { type: "STRING" },
        },
        required: ["item", "type", "strength", "note"],
      },
    },
    missingEvidence: { type: "ARRAY", items: { type: "STRING" } },
    rightsAffected: { type: "ARRAY", items: { type: "STRING" } },
    legalIssues: { type: "ARRAY", items: { type: "STRING" } },
    relevantLaws: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          law: { type: "STRING" },
          provision: { type: "STRING" },
          relevance: { type: "STRING" },
        },
        required: ["law", "provision", "relevance"],
      },
    },
    reportingAuthorities: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          authority: { type: "STRING" },
          contact: { type: "STRING" },
          whenToUse: { type: "STRING" },
        },
        required: ["authority", "contact", "whenToUse"],
      },
    },
    emergencyContacts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          number: { type: "STRING" },
        },
        required: ["name", "number"],
      },
    },
    nextSteps: { type: "ARRAY", items: { type: "STRING" } },
    complaintDraft: { type: "STRING" },
    escalationPath: { type: "ARRAY", items: { type: "STRING" } },
    citizenChecklist: { type: "ARRAY", items: { type: "STRING" } },
    caseReadinessScore: { type: "INTEGER" },
    riskLevel: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
    evidenceConfidenceScore: { type: "INTEGER" },
    recommendedAssistance: { type: "STRING" },
    disclaimer: { type: "STRING" },
  },
  required: [
    "incidentSummary",
    "timeline",
    "partiesInvolved",
    "evidenceInventory",
    "missingEvidence",
    "rightsAffected",
    "legalIssues",
    "relevantLaws",
    "reportingAuthorities",
    "emergencyContacts",
    "nextSteps",
    "complaintDraft",
    "escalationPath",
    "citizenChecklist",
    "caseReadinessScore",
    "riskLevel",
    "evidenceConfidenceScore",
    "recommendedAssistance",
    "disclaimer",
  ],
};

export function isLegalEngineAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// HTTP statuses worth retrying — Gemini returns 503 when "experiencing high
// demand", 429 on rate limits, and 5xx on transient server faults. These
// usually clear within a second or two, so a short backoff recovers silently.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;

type AttemptResult =
  | { ok: true; value: LegalAnalysis }
  | { ok: false; retryable: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function attemptOnce(key: string, report: string): Promise<AttemptResult> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        // Legal reasoning is heavier than scam scoring — allow more time.
        signal: AbortSignal.timeout(40_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Analyze this citizen incident report and produce the structured case file:\n\n${report.slice(0, 12000)}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
            maxOutputTokens: 8000,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("[legalAnalyzer] Gemini HTTP error", res.status, await res.text().catch(() => ""));
      return { ok: false, retryable: RETRYABLE_STATUS.has(res.status) };
    }

    const data = await res.json();
    const finishReason = data?.candidates?.[0]?.finishReason;
    const jsonText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      console.error("[legalAnalyzer] No text in Gemini response. finishReason:", finishReason, "promptFeedback:", JSON.stringify(data?.promptFeedback));
      // A truncated/blocked response won't improve on identical retry.
      return { ok: false, retryable: false };
    }

    let parsed: LegalAnalysis;
    try {
      parsed = JSON.parse(jsonText) as LegalAnalysis;
    } catch {
      console.error("[legalAnalyzer] JSON parse failed. finishReason:", finishReason, "textLength:", jsonText.length);
      return { ok: false, retryable: false };
    }

    // Clamp scores so the UI never receives out-of-range values.
    parsed.caseReadinessScore = Math.max(0, Math.min(100, Math.round(parsed.caseReadinessScore)));
    parsed.evidenceConfidenceScore = Math.max(0, Math.min(100, Math.round(parsed.evidenceConfidenceScore)));
    return { ok: true, value: parsed };
  } catch (err) {
    // Network error or timeout (AbortSignal) — worth one more try.
    console.error("[legalAnalyzer] request failed:", err instanceof Error ? `${err.name}: ${err.message}` : err);
    return { ok: false, retryable: true };
  }
}

/**
 * Analyze a citizen incident report with Gemini. Retries automatically on
 * transient upstream failures (model overload / rate limit / network blips).
 * Returns null when the API is not configured or all attempts fail — the
 * caller surfaces a clear "engine unavailable" message rather than any
 * fabricated analysis.
 */
export async function analyzeLegalCase(report: string): Promise<LegalAnalysis | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await attemptOnce(key, report);
    if (result.ok) return result.value;
    if (!result.retryable || attempt === MAX_ATTEMPTS) return null;
    // Exponential-ish backoff with jitter: ~1s, ~2.5s.
    const backoff = attempt * 1000 + Math.floor(Math.random() * 700);
    console.warn(`[legalAnalyzer] retrying after transient failure (attempt ${attempt}/${MAX_ATTEMPTS}) in ${backoff}ms`);
    await sleep(backoff);
  }
  return null;
}
