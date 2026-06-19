'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Scale, Shield, AlertTriangle, Phone, FileText, Download, Hash,
  Gavel, BookOpen, ClipboardList, ShieldCheck, Landmark, Users,
  CheckCircle, Clock, ArrowRight, Loader2, ExternalLink, Sparkles,
  Mic, MicOff, ChevronDown, ChevronRight,
} from 'lucide-react';
import { apiUrl } from '@/lib/apiBase';
import type { LegalAnalysis } from '@/lib/ai/legalAnalyzer';

/* ── Intake option lists (from the QuantumShield Legal framework) ──
   Categories are multi-select AND grouped into collapsible sections, so the
   long list stays tidy. One incident can involve several offences at once
   (e.g. sexual assault AND attempt to murder), so the citizen can tick every
   reason that applies — across any group. The stored value is the full
   "Group — Subtype" string; the chip shows only the short subtype. ── */
const CATEGORY_GROUPS: { group: string; items: string[] }[] = [
  { group: 'Violent Crime', items: [
    'Violent Crime — Physical Assault / Hurt',
    'Violent Crime — Sexual Assault / Rape',
    'Violent Crime — Attempt to Murder',
    'Violent Crime — Murder / Death',
    'Violent Crime — Kidnapping / Abduction / Wrongful Confinement',
    'Violent Crime — Acid Attack',
  ]},
  { group: 'Cyber Crime', items: [
    'Cyber Crime — UPI / OTP / Phishing Fraud',
    'Cyber Crime — Investment / Job / Romance Scam',
    'Cyber Crime — Digital Arrest Scam',
    'Cyber Crime — Online Blackmail / Sextortion',
    'Cyber Crime — Identity Theft',
  ]},
  { group: 'Women Safety', items: [
    'Women Safety — Harassment / Stalking',
    'Women Safety — Workplace Harassment',
    'Women Safety — Online Abuse',
  ]},
  { group: 'Child Protection', items: [
    'Child Protection — Abuse / Exploitation / Neglect',
  ]},
  { group: 'Domestic & Family', items: [
    'Domestic & Family — Domestic Violence',
    'Domestic & Family — Dowry Harassment / Cruelty',
    'Domestic & Family — Threats / Harassment',
    'Domestic & Family — Property / Maintenance Dispute',
  ]},
  { group: 'Consumer Protection', items: [
    'Consumer Protection — Defect / Refund / Service',
    'Consumer Protection — False Advertising',
  ]},
  { group: 'Employment', items: [
    'Employment — Salary / Wrongful Termination',
    'Employment — Workplace Harassment / Contract',
  ]},
  { group: 'Property & Housing', items: [
    'Property & Housing — Tenant / Eviction Dispute',
    'Property & Housing — Land / Property Damage',
  ]},
  { group: 'Government & Public Servant', items: [
    'Government & Public Servant — Bribery / Misconduct',
    'Government & Public Servant — Delay in Public Service',
  ]},
  { group: 'Police Related', items: [
    'Police Related — Refusal to Register Complaint',
    'Police Related — Misconduct / Abuse of Power',
  ]},
  { group: 'Banking & Financial', items: [
    'Banking & Financial — Unauthorized Transaction',
    'Banking & Financial — Loan Recovery Harassment',
    'Banking & Financial — Insurance Claim Dispute',
  ]},
  { group: 'Other Matters', items: [
    'Road & Traffic — Accident / Vehicle Damage',
    'Health & Medical — Negligence / Billing Dispute',
    'Senior Citizen Protection — Abuse / Exploitation',
    'Caste / Community — Discrimination or Atrocity',
    'Defamation / False Accusation',
    'Other / Not Sure',
  ]},
];

const RELATIONSHIPS = [
  'Unknown Person', 'Online Scammer', 'Husband', 'Wife', 'Parent', 'Child',
  'Employer', 'Employee', 'Landlord', 'Tenant', 'Police Officer',
  'Government Officer', 'Public Servant', 'Politician', 'Neighbor',
  'Teacher', 'Student', 'Bank', 'Insurance Company', 'Business',
  'Service Provider', 'Healthcare Provider', 'Relative', 'Friend', 'Stranger',
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman & Nicobar', 'Other / Outside India',
];

const EVIDENCE_TYPES = [
  'Screenshots', 'WhatsApp / SMS chats', 'Call recordings', 'Photos', 'Videos',
  'CCTV footage', 'Bank statements / transaction proof', 'Emails',
  'Medical reports', 'Bills / receipts', 'Contracts / documents',
  'Witness statements', 'FIR / complaint copy', 'Legal notices',
];

/* ── Always-on national helplines (real numbers) shown immediately ── */
const QUICK_HELPLINES = [
  { name: 'Cyber Crime', number: '1930', tel: '1930' },
  { name: 'Emergency', number: '112', tel: '112' },
  { name: 'Women', number: '181', tel: '181' },
  { name: 'Child', number: '1098', tel: '1098' },
  { name: 'Consumer', number: '1915', tel: '1915' },
  { name: 'Senior Citizen', number: '14567', tel: '14567' },
];

function genCaseId() {
  const d = new Date();
  return `QS-LR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

const riskStyle = (r: string) =>
  r === 'Critical' ? 'bg-red-500/15 border-red-500/50 text-red-300' :
  r === 'High'     ? 'bg-orange-500/15 border-orange-500/50 text-orange-300' :
  r === 'Medium'   ? 'bg-yellow-500/15 border-yellow-500/50 text-yellow-300' :
                     'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';

const strengthStyle = (s: string) =>
  s === 'Strong'   ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' :
  s === 'Moderate' ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40' :
                     'bg-red-500/15 text-red-300 border-red-500/40';

export default function LegalRightsHome() {
  const [caseId, setCaseId] = useState('');
  useEffect(() => { setCaseId(genCaseId()); }, []);

  /* ── Intake form state ── */
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [incidentDate, setIncidentDate] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [accusedName, setAccusedName] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<LegalAnalysis | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  /* ── Voice dictation (Web Speech API) for "What Happened" ── */
  const [dictLang, setDictLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);   // read inside event handlers
  const baseTextRef = useRef('');        // text already in the box when dictation started
  const finalRef = useRef('');           // finalised speech this session

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SR));
    return () => { try { recognitionRef.current?.abort(); } catch {} };
  }, []);

  const stopDictation = () => {
    listeningRef.current = false;
    setListening(false);
    try { recognitionRef.current?.stop(); } catch {}
  };

  const startDictation = (langOverride?: 'en-IN' | 'hi-IN') => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }
    const r: SpeechRecognition = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = langOverride ?? dictLang;

    baseTextRef.current = description ? description.replace(/\s+$/, '') + ' ' : '';
    finalRef.current = '';

    r.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += res[0].transcript + ' ';
        else interim += res[0].transcript;
      }
      setDescription((baseTextRef.current + finalRef.current + interim).replace(/\s{2,}/g, ' '));
    };
    r.onerror = (ev: SpeechRecognitionErrorEvent) => {
      // "no-speech"/"aborted" are benign; just stop quietly.
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        setError('Microphone permission is needed for voice typing. Please allow it and try again.');
      }
      stopDictation();
    };
    r.onend = () => {
      // The API stops after pauses; keep going until the user taps stop.
      if (listeningRef.current) {
        try { r.start(); } catch {}
      }
    };

    recognitionRef.current = r;
    listeningRef.current = true;
    setListening(true);
    try { r.start(); } catch { stopDictation(); }
  };

  const toggleDictation = () => (listening ? stopDictation() : startDictation());

  // Switching language restarts recognition so the new language takes effect.
  const switchDictLang = (lang: 'en-IN' | 'hi-IN') => {
    const wasListening = listeningRef.current;
    setDictLang(lang);
    if (wasListening) {
      stopDictation();
      setTimeout(() => startDictation(lang), 200);
    }
  };

  const toggleEvidence = (e: string) =>
    setEvidence(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const toggleCategory = (c: string) =>
    setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const toggleGroup = (g: string) =>
    setOpenGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const buildReport = () => `
INCIDENT TITLE: ${title || '(not provided)'}
CATEGORIES (all that apply): ${categories.length ? categories.join('; ') : '(not specified — infer from the description below)'}
DATE / TIME: ${incidentDate || '(not provided)'}
LOCATION: ${[district, state].filter(Boolean).join(', ') || '(not provided)'}, India
RELATIONSHIP TO OTHER PARTY: ${relationship}
OTHER PARTY (as known): ${accusedName || '(not provided)'}
EVIDENCE THE CITIZEN HAS: ${evidence.length ? evidence.join(', ') : '(none specified)'}

WHAT HAPPENED (in the citizen's words):
${description}
`.trim();

  const analyze = async () => {
    if (listeningRef.current) stopDictation();
    if (description.trim().length < 20) {
      setError('Please describe what happened in a little more detail (at least a sentence or two).');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl('/api/legal-analysis'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: buildReport() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setResult(data.analysis as LegalAnalysis);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch {
      setError('Could not reach the Legal Intelligence Engine. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCaseFile = () => {
    if (!result) return;
    const r = result;
    const line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const txt = `
╔══════════════════════════════════════════════════════════════╗
║       QUANTUMSHIELD — MY LEGAL RIGHTS · CASE FILE              ║
╚══════════════════════════════════════════════════════════════╝
Case ID      : ${caseId}
Generated    : ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Risk Level   : ${r.riskLevel}
Case Readiness: ${r.caseReadinessScore}/100   Evidence Confidence: ${r.evidenceConfidenceScore}/100

${line}
1. INCIDENT SUMMARY
${line}
${r.incidentSummary}

${line}
2. TIMELINE OF EVENTS
${line}
${r.timeline.map(t => `• ${t.when}: ${t.event}`).join('\n')}

${line}
3. PARTIES INVOLVED
${line}
${r.partiesInvolved}

${line}
4. EVIDENCE INVENTORY & STRENGTH
${line}
${r.evidenceInventory.map(e => `• [${e.strength}] ${e.item} (${e.type}) — ${e.note}`).join('\n')}

${line}
5. MISSING EVIDENCE CHECKLIST
${line}
${r.missingEvidence.map(m => `□ ${m}`).join('\n')}

${line}
6. POTENTIAL RIGHTS AFFECTED
${line}
${r.rightsAffected.map(x => `• ${x}`).join('\n')}

${line}
7. POTENTIAL LEGAL ISSUES
${line}
${r.legalIssues.map(x => `• ${x}`).join('\n')}

${line}
8. POTENTIALLY RELEVANT LAWS
${line}
${r.relevantLaws.map(l => `• ${l.law} — ${l.provision}\n    ${l.relevance}`).join('\n')}

${line}
9. REPORTING AUTHORITIES
${line}
${r.reportingAuthorities.map(a => `• ${a.authority} — ${a.contact}\n    ${a.whenToUse}`).join('\n')}

${line}
10. EMERGENCY CONTACTS
${line}
${r.emergencyContacts.map(c => `• ${c.name}: ${c.number}`).join('\n')}

${line}
11. RECOMMENDED NEXT STEPS
${line}
${r.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${line}
12. COMPLAINT DRAFT
${line}
${r.complaintDraft}

${line}
13. ESCALATION PATH
${line}
${r.escalationPath.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${line}
14. CITIZEN ACTION CHECKLIST
${line}
${r.citizenChecklist.map(c => `□ ${c}`).join('\n')}

${line}
15. RECOMMENDED PROFESSIONAL ASSISTANCE
${line}
${r.recommendedAssistance}

${line}
DISCLAIMER
${line}
${r.disclaimer}

Generated by QuantumShield · My Legal Rights (quantumshield.in)
Ref: ${caseId}
`.trim();

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalRights_CaseFile_${caseId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition';
  const labelCls = 'text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 pb-20">

        {/* ── Hero ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/40 mb-5">
            <Scale className="w-9 h-9 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight">
            My Legal Rights
          </h1>
          <p className="text-lg md:text-2xl font-bold text-gray-100 leading-snug max-w-2xl mx-auto">
            Know your rights. Understand your options.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Build a report-ready case file in minutes.
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            AI-powered Citizen Rights, Incident Analysis &amp; Reporting Assistant · India
          </p>
        </div>

        {/* ── Disclaimer banner ── */}
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl px-5 py-4 mb-7">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-300">Important: </span>
            This tool provides general information and guidance, <span className="font-bold">not legal advice</span>.
            It never decides guilt or innocence. Potentially relevant laws are suggestions only —
            authorities and qualified lawyers determine what actually applies. In an emergency, call <a href="tel:112" className="underline font-bold">112</a>.
          </p>
        </div>

        {/* ── Quick helplines ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-9">
          {QUICK_HELPLINES.map(h => (
            <a key={h.tel} href={`tel:${h.tel}`}
              className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl py-3 hover:border-indigo-400/60 hover:bg-white/10 transition">
              <span className="text-lg font-black text-indigo-300">{h.number}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">{h.name}</span>
            </a>
          ))}
        </div>

        {/* ── Intake form ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Hash className="w-3.5 h-3.5" />
            <span>Case ID: {caseId || '…'}</span>
          </div>

          {/* Incident details */}
          <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> 1. Incident Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Incident Title</label>
                <input className={inputCls} placeholder="e.g. Fake CBI officer demanded money over WhatsApp"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>
                  Category <span className="text-slate-500 normal-case font-normal tracking-normal">— tap a group, then tick every reason that applies (you can pick more than one, from any group)</span>
                </label>
                <div className="space-y-2">
                  {CATEGORY_GROUPS.map(g => {
                    const open = openGroups.includes(g.group);
                    const selCount = g.items.filter(i => categories.includes(i)).length;
                    return (
                      <div key={g.group} className="border border-slate-700 rounded-xl overflow-hidden">
                        <button type="button" onClick={() => toggleGroup(g.group)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950 hover:bg-slate-900 transition">
                          <span className="text-sm font-medium text-slate-200">{g.group}</span>
                          <span className="flex items-center gap-2">
                            {selCount > 0 && (
                              <span className="text-[10px] font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 rounded-full px-2 py-0.5">
                                {selCount} selected
                              </span>
                            )}
                            {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </span>
                        </button>
                        {open && (
                          <div className="flex flex-wrap gap-2 p-3 bg-slate-900/40 border-t border-slate-800">
                            {g.items.map(c => {
                              const short = c.startsWith(g.group + ' — ') ? c.slice(g.group.length + 3) : c;
                              const sel = categories.includes(c);
                              return (
                                <button key={c} type="button" onClick={() => toggleCategory(c)}
                                  className={`text-xs px-3 py-2 rounded-lg border transition text-left ${
                                    sel ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                                  }`}>
                                  {sel ? '✓ ' : ''}{short}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {categories.length > 0 && (
                  <p className="text-[11px] text-indigo-300/80 mt-2">
                    {categories.length === 1
                      ? '1 category selected'
                      : `${categories.length} categories selected — the AI will consider every offence together.`}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Date &amp; Time of Incident</label>
                <input type="datetime-local" className={inputCls} value={incidentDate} onChange={e => setIncidentDate(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select className={inputCls} value={state} onChange={e => setState(e.target.value)}>
                  <option value="">Select state…</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>District / City</label>
                <input className={inputCls} placeholder="e.g. Hyderabad" value={district} onChange={e => setDistrict(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Other party */}
          <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" /> 2. Other Party (if known)
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Their Relationship to You</label>
                <select className={inputCls} value={relationship} onChange={e => setRelationship(e.target.value)}>
                  {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Name / Designation / Org (optional)</label>
                <input className={inputCls} placeholder="e.g. unknown caller, ABC Bank, a neighbour" value={accusedName} onChange={e => setAccusedName(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. Evidence You Have
            </h2>
            <p className="text-slate-500 text-xs mb-4">Tick everything you can show. More evidence = a stronger case.</p>
            <div className="flex flex-wrap gap-2">
              {EVIDENCE_TYPES.map(e => (
                <button key={e} type="button" onClick={() => toggleEvidence(e)}
                  className={`text-xs px-3 py-2 rounded-lg border transition ${
                    evidence.includes(e)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}>
                  {evidence.includes(e) ? '✓ ' : ''}{e}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" /> 4. What Happened
              </h2>

              {/* Voice typing */}
              {speechSupported && (
                <div className="flex items-center gap-2">
                  {/* Language picker */}
                  <div className="flex rounded-lg border border-slate-700 overflow-hidden text-[11px] font-bold">
                    {(['en-IN', 'hi-IN'] as const).map(l => (
                      <button key={l} type="button" onClick={() => switchDictLang(l)}
                        className={`px-2.5 py-1.5 transition ${
                          dictLang === l ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}>
                        {l === 'en-IN' ? 'EN' : 'हिं'}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={toggleDictation}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      listening
                        ? 'bg-red-600 border-red-500 text-white animate-pulse'
                        : 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 hover:bg-indigo-600/30'
                    }`}>
                    {listening ? <><MicOff className="w-4 h-4" /> Stop</> : <><Mic className="w-4 h-4" /> Speak</>}
                  </button>
                </div>
              )}
            </div>

            <textarea rows={6} className={`${inputCls} resize-y`}
              placeholder="Tell the story in your own words — what happened, when, who was involved, what they said or did, and what you have lost or are afraid of. You can type, or tap “Speak” to dictate in English or Hindi."
              value={description} onChange={e => setDescription(e.target.value)} />

            {listening && (
              <p className="text-[11px] text-red-300 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                Listening in {dictLang === 'en-IN' ? 'English' : 'Hindi'}… speak now. Tap “Stop” when done.
              </p>
            )}
            {!speechSupported && (
              <p className="text-[11px] text-slate-500 mt-2">
                Voice typing isn’t supported in this browser — please type instead. (Works best in Chrome.)
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/40 rounded-2xl px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <button onClick={analyze} disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition text-lg">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your case…</>
              : <><Sparkles className="w-5 h-5" /> Analyze My Case &amp; Build Report</>}
          </button>
          <p className="text-center text-[11px] text-gray-600">
            Powered by the QuantumShield Legal Intelligence Engine (AI). Analysis may take up to a minute.
          </p>
        </div>

        {/* ── Results ── */}
        {result && (
          <div ref={resultRef} className="mt-12 space-y-5">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-2xl border p-4 text-center ${riskStyle(result.riskLevel)}`}>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Risk Level</div>
                <div className="text-2xl font-black mt-1">{result.riskLevel}</div>
              </div>
              <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-center">
                <div className="text-[10px] uppercase tracking-widest text-indigo-300/80">Case Readiness</div>
                <div className="text-2xl font-black mt-1 text-indigo-300">{result.caseReadinessScore}<span className="text-sm text-indigo-400/70">/100</span></div>
              </div>
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
                <div className="text-[10px] uppercase tracking-widest text-emerald-300/80">Evidence Confidence</div>
                <div className="text-2xl font-black mt-1 text-emerald-300">{result.evidenceConfidenceScore}<span className="text-sm text-emerald-400/70">/100</span></div>
              </div>
            </div>

            <Section icon={FileText} color="text-indigo-400" title="Incident Summary">
              <p className="text-sm text-slate-300 leading-relaxed">{result.incidentSummary}</p>
            </Section>

            {result.timeline.length > 0 && (
              <Section icon={Clock} color="text-blue-400" title="Timeline of Events">
                <ol className="space-y-2">
                  {result.timeline.map((t, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-blue-300 font-mono shrink-0 min-w-[7rem]">{t.when}</span>
                      <span className="text-slate-300">{t.event}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <Section icon={Users} color="text-violet-400" title="Parties Involved">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{result.partiesInvolved}</p>
            </Section>

            {result.evidenceInventory.length > 0 && (
              <Section icon={ShieldCheck} color="text-emerald-400" title="Evidence Inventory & Strength">
                <div className="space-y-2">
                  {result.evidenceInventory.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${strengthStyle(e.strength)}`}>{e.strength}</span>
                      <div>
                        <span className="text-slate-200 font-medium">{e.item}</span>
                        <span className="text-slate-500"> · {e.type}</span>
                        <p className="text-slate-400 text-xs mt-0.5">{e.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.missingEvidence.length > 0 && (
              <Section icon={ClipboardList} color="text-amber-400" title="Missing Evidence — Try to Collect">
                <ul className="space-y-1.5">
                  {result.missingEvidence.map((m, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-amber-400">□</span>{m}</li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {result.rightsAffected.length > 0 && (
                <Section icon={Shield} color="text-indigo-400" title="Potential Rights Affected">
                  <ul className="space-y-1.5">
                    {result.rightsAffected.map((x, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-indigo-400 mt-0.5">•</span>{x}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {result.legalIssues.length > 0 && (
                <Section icon={Gavel} color="text-fuchsia-400" title="Potential Legal Issues">
                  <ul className="space-y-1.5">
                    {result.legalIssues.map((x, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-fuchsia-400 mt-0.5">•</span>{x}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {result.relevantLaws.length > 0 && (
              <Section icon={Landmark} color="text-purple-400" title="Potentially Relevant Laws">
                <p className="text-xs text-slate-500 mb-3">These are possibilities only — authorities decide what actually applies.</p>
                <div className="space-y-3">
                  {result.relevantLaws.map((l, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-bold text-purple-300">{l.law} <span className="font-mono text-purple-400">{l.provision}</span></div>
                      <p className="text-slate-400 text-xs mt-0.5">{l.relevance}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.reportingAuthorities.length > 0 && (
              <Section icon={Phone} color="text-green-400" title="Where to Report">
                <div className="space-y-3">
                  {result.reportingAuthorities.map((a, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-bold text-green-300">{a.authority}</div>
                      <div className="text-slate-300">{a.contact}</div>
                      <p className="text-slate-500 text-xs mt-0.5">{a.whenToUse}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.nextSteps.length > 0 && (
              <Section icon={ArrowRight} color="text-cyan-400" title="Recommended Next Steps">
                <ol className="space-y-2 list-decimal list-inside">
                  {result.nextSteps.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300">{s}</li>
                  ))}
                </ol>
              </Section>
            )}

            <Section icon={FileText} color="text-orange-400" title="Complaint Draft">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-950 border border-slate-800 rounded-xl p-4">{result.complaintDraft}</pre>
            </Section>

            {result.escalationPath.length > 0 && (
              <Section icon={ArrowRight} color="text-rose-400" title="Escalation Path">
                <ol className="space-y-2 list-decimal list-inside">
                  {result.escalationPath.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300">{s}</li>
                  ))}
                </ol>
              </Section>
            )}

            {result.citizenChecklist.length > 0 && (
              <Section icon={CheckCircle} color="text-emerald-400" title="Citizen Action Checklist">
                <ul className="space-y-1.5">
                  {result.citizenChecklist.map((c, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-400">□</span>{c}</li>
                  ))}
                </ul>
              </Section>
            )}

            <Section icon={Scale} color="text-indigo-400" title="Recommended Professional Assistance">
              <p className="text-sm text-slate-300 leading-relaxed">{result.recommendedAssistance}</p>
            </Section>

            <div className="flex items-start gap-3 bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">{result.disclaimer}</p>
            </div>

            <button onClick={downloadCaseFile}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition">
              <Download className="w-5 h-5" /> Download Full Case File (.txt)
            </button>

            <div className="grid sm:grid-cols-2 gap-3">
              <a href="tel:1930" className="flex items-center justify-between bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 rounded-2xl px-5 py-4 transition">
                <div>
                  <div className="text-red-300 font-black text-xl">1930</div>
                  <div className="text-slate-400 text-xs">Cyber Crime Helpline (24×7)</div>
                </div>
                <Phone className="w-6 h-6 text-red-400" />
              </a>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 rounded-2xl px-5 py-4 transition">
                <div>
                  <div className="text-indigo-300 font-bold">cybercrime.gov.in</div>
                  <div className="text-slate-400 text-xs">National Cyber Crime Portal</div>
                </div>
                <ExternalLink className="w-5 h-5 text-indigo-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, color, title, children }: {
  icon: any; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6">
      <h2 className="font-bold mb-4 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} /> {title}
      </h2>
      {children}
    </div>
  );
}
