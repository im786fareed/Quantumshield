import { NextRequest, NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { geocoder, carrier } from 'libphonenumber-geo-carrier';
import { rateLimit } from '@/lib/rateLimit';
import { analyseCaller } from '@/lib/security/callerIntel';
import { explainCaller, type CallerFacts } from '@/lib/ai/callerExplainer';

/**
 * QuantumLocate enrichment endpoint (OPTIONAL, explicitly user-triggered).
 *
 * The on-device engine already produces the full risk verdict without any
 * network call. This route adds only the two things that need server-side
 * resources:
 *   1. Original carrier + telecom-circle geocoding (offline metadata that is
 *      too heavy to ship to the browser).
 *   2. An optional Gemini-written natural-language explanation, grounded
 *      strictly in the signals we already derived.
 *
 * It never returns a fabricated city, carrier, or spam-report count. When
 * the geocoder/carrier data or the AI is unavailable, the field is null and
 * the client keeps its honest on-device result.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const number: unknown = body?.number;
    if (typeof number !== 'string' || number.trim().length < 3 || number.length > 32) {
      return NextResponse.json({ error: 'number required' }, { status: 400 });
    }

    const base = analyseCaller(number.trim());

    // Carrier + circle from offline metadata (best-effort).
    let carrierName: string | null = null;
    let circle: string | null = null;
    let origin = base.origin;
    let originHi = base.originHi;
    let originLevel = base.originLevel;
    let originConfidence = base.originConfidence;

    try {
      const pn = parsePhoneNumberFromString(number.trim(), 'IN');
      if (pn) {
        const [geo, car] = await Promise.all([
          geocoder(pn, 'en').catch(() => null),
          carrier(pn, 'en').catch(() => null),
        ]);
        if (car && car.trim()) carrierName = car.trim();
        if (geo && geo.trim() && geo.trim().toLowerCase() !== base.countryName.toLowerCase()) {
          circle = geo.trim();
          // A geocoded region is more specific than country → refine origin.
          origin = base.country === 'IN' ? `${circle} (India)` : `${circle}, ${base.countryName}`;
          originHi = base.country === 'IN' ? `${circle} (भारत)` : `${circle}, ${base.countryNameHi}`;
          originLevel = 'state';
          originConfidence = Math.max(originConfidence, base.valid ? 90 : 55);
        }
      }
    } catch {
      // metadata unavailable — leave carrier/circle null (honest gap)
    }

    // India numbers are portable: the carrier is the ORIGINAL allocation.
    const carrierNote = carrierName
      ? (base.country === 'IN'
          ? 'Original allocated operator — the number may have since been ported to another network.'
          : 'Carrier of record for this number range.')
      : null;
    const carrierNoteHi = carrierName
      ? (base.country === 'IN'
          ? 'मूल आवंटित ऑपरेटर — नंबर अब किसी अन्य नेटवर्क पर पोर्ट हो सकता है।'
          : 'इस नंबर रेंज का दर्ज ऑपरेटर।')
      : null;

    // Optional AI explanation, grounded in the real facts only.
    const facts: CallerFacts = {
      input: base.input,
      country: base.country,
      numberType: base.numberType,
      origin,
      originLevel,
      carrier: carrierName,
      circle,
      isVirtualLikely: base.isVirtualLikely,
      riskScore: base.riskScore,
      riskBand: base.riskBand,
      whyScore: base.whyScore,
      scamCategories: base.scamCategories,
    };
    const ai = await explainCaller(facts);

    return NextResponse.json({
      success: true,
      engine: ai ? 'ai' : 'rules',
      carrier: carrierName,
      carrierNote,
      carrierNoteHi,
      circle,
      origin,
      originHi,
      originLevel,
      originConfidence,
      aiSummary: ai?.summary ?? null,
      aiWhyPoints: ai?.whyPoints ?? [],
      aiConfidenceNote: ai?.confidenceNote ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
