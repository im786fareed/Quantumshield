'use client';
import { useState, useEffect } from 'react';
import {
  Shield, Phone, AlertTriangle, ExternalLink, Camera,
  CheckCircle, Download, FileText, User, CreditCard,
  Clock, Hash, Landmark, MessageSquare, ChevronDown
} from 'lucide-react';
import BackToHome from './BackToHome';

/* ── Legal sections by crime type ── */
const LEGAL_SECTIONS: Record<string, { section: string; desc: string }[]> = {
  'Digital Arrest': [
    { section: 'IT Act § 66D',  desc: 'Cheating by personation using computer resource' },
    { section: 'IT Act § 66C',  desc: 'Identity theft' },
    { section: 'IPC § 420',     desc: 'Cheating and dishonestly inducing delivery of property' },
    { section: 'IPC § 419',     desc: 'Cheating by personation' },
    { section: 'IPC § 384',     desc: 'Extortion' },
  ],
  'KYC / Bank Fraud': [
    { section: 'IT Act § 66C',  desc: 'Identity theft (use of Aadhaar/account details)' },
    { section: 'IT Act § 66D',  desc: 'Cheating by personation using computer resource' },
    { section: 'IPC § 420',     desc: 'Cheating' },
    { section: 'IPC § 468',     desc: 'Forgery for purpose of cheating' },
  ],
  'UPI / Payment Fraud': [
    { section: 'IT Act § 66C',  desc: 'Identity theft / UPI credential abuse' },
    { section: 'IT Act § 43',   desc: 'Unauthorised access to computer resource' },
    { section: 'IPC § 420',     desc: 'Cheating' },
    { section: 'Payment & Settlement Act § 25', desc: 'Dishonest UPI / NEFT transaction' },
  ],
  'Investment / Stock Scam': [
    { section: 'IPC § 420',     desc: 'Cheating' },
    { section: 'IPC § 120B',    desc: 'Criminal conspiracy' },
    { section: 'SEBI (FPM) Act',desc: 'Illegal investment solicitation' },
    { section: 'IT Act § 66D',  desc: 'Cheating by personation using computer resource' },
  ],
  'Sextortion / Honeytrap': [
    { section: 'IT Act § 67',   desc: 'Publishing obscene material electronically' },
    { section: 'IT Act § 67A',  desc: 'Publishing sexually explicit material' },
    { section: 'IPC § 384',     desc: 'Extortion' },
    { section: 'IPC § 354D',    desc: 'Stalking' },
  ],
  'Part-time Job / Task Scam': [
    { section: 'IPC § 420',     desc: 'Cheating' },
    { section: 'IT Act § 66D',  desc: 'Cheating by personation' },
    { section: 'IPC § 120B',    desc: 'Criminal conspiracy' },
  ],
  'OTP / SIM Swap Fraud': [
    { section: 'IT Act § 66C',  desc: 'Identity theft (SIM/OTP misuse)' },
    { section: 'IT Act § 43',   desc: 'Unauthorised access' },
    { section: 'IPC § 420',     desc: 'Cheating' },
    { section: 'Telecom Act § 42', desc: 'Fraudulent SIM acquisition' },
  ],
  'Loan / Courier Scam': [
    { section: 'IPC § 420',     desc: 'Cheating' },
    { section: 'IT Act § 66D',  desc: 'Cheating by personation' },
    { section: 'IPC § 384',     desc: 'Extortion (if threats made)' },
  ],
};

const FRAUD_TYPES = Object.keys(LEGAL_SECTIONS);
const PLATFORMS = ['WhatsApp', 'Telegram', 'Phone Call', 'Instagram', 'Facebook', 'Email', 'SMS', 'Truecaller', 'Other App / Website'];

function genRefId() {
  const d = new Date();
  return `QS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function PoliceReporter({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const en = lang !== 'hi';
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [refId] = useState(genRefId);
  const [generated, setGenerated] = useState(false);

  /* ── Form state ── */
  const [fraudType,  setFraudType]  = useState(FRAUD_TYPES[0]);
  const [platform,   setPlatform]   = useState(PLATFORMS[0]);
  const [incidentDate, setIncidentDate] = useState('');
  const [amount,     setAmount]     = useState('');
  const [txnRef,     setTxnRef]     = useState('');
  const [victimBank, setVictimBank] = useState('');
  const [accusedPhone, setAccusedPhone] = useState('');
  const [accusedUPI,   setAccusedUPI]   = useState('');
  const [accusedBank,  setAccusedBank]  = useState('');
  const [accusedEmail, setAccusedEmail] = useState('');
  const [description,  setDescription]  = useState('');
  const [victimCity,   setVictimCity]   = useState('');
  const [calledHelpline, setCalledHelpline] = useState(false);
  const [filedOnline,    setFiledOnline]    = useState(false);
  const [bankInformed,   setBankInformed]   = useState(false);

  useEffect(() => {
    const req = indexedDB.open('QuantumShieldVault', 1);
    req.onsuccess = (e: any) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains('evidence')) {
        const tx = db.transaction(['evidence'], 'readonly');
        const store = tx.objectStore('evidence');
        const countReq = store.count();
        countReq.onsuccess = () => setEvidenceCount(countReq.result);
      }
    };
  }, []);

  const sections = LEGAL_SECTIONS[fraudType] ?? LEGAL_SECTIONS['Digital Arrest'];

  const generateReport = () => {
    const now = new Date();
    const timeStr = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const accInfo = [
      accusedPhone && `Phone/WhatsApp: ${accusedPhone}`,
      accusedUPI   && `UPI ID: ${accusedUPI}`,
      accusedBank  && `Bank A/C / IFSC: ${accusedBank}`,
      accusedEmail && `Email: ${accusedEmail}`,
    ].filter(Boolean).join('\n  ') || 'Not provided (fill in from call logs / messages)';

    const actionsLog = [
      calledHelpline && `✓ Called 1930 helpline`,
      filedOnline    && `✓ Filed complaint at cybercrime.gov.in`,
      bankInformed   && `✓ Informed bank / requested freeze`,
      evidenceCount  && `✓ ${evidenceCount} screenshot(s) captured in Evidence Vault`,
    ].filter(Boolean).join('\n  ') || 'None taken yet — see IMMEDIATE ACTIONS below';

    const content = `
╔══════════════════════════════════════════════════════════════════╗
║        CYBERCRIME COMPLAINT — NATIONAL CYBER CRIME PORTAL       ║
║             (Format per I4C / MHA Guidelines)                    ║
╚══════════════════════════════════════════════════════════════════╝

Reference ID : ${refId}
Generated by : QuantumShield Cyber Protection App (quantumshield.in)
Generated on : ${timeStr}
Portal       : https://cybercrime.gov.in   |   Helpline: 1930

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1: NATURE OF OFFENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type of Cyber Fraud : ${fraudType}
Platform / Medium   : ${platform}
Incident Date/Time  : ${incidentDate || 'Please fill in'}
City of Victim      : ${victimCity   || 'Please fill in'}

SECTION 2: FINANCIAL LOSS
━━━━━━━━━━━━━━━━━━━━━━━━━
Amount Lost            : ₹${amount || '___________'}
Victim's Bank          : ${victimBank || '___________'}
Transaction Reference  : ${txnRef  || '___________'}
(UPI/NEFT/IMPS Ref No. — from your bank app or SMS)

SECTION 3: ACCUSED DETAILS (as known)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${accInfo}

NOTE: Forward these details to 1930 IMMEDIATELY for account freeze
      request under the Golden Hour Protocol.

SECTION 4: SEQUENCE OF EVENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${description || '(Describe step-by-step: first contact, what was said, what you did, how money was transferred)'}

SECTION 5: APPLICABLE LAWS
━━━━━━━━━━━━━━━━━━━━━━━━━━
The following sections apply to this offence:

${sections.map(s => `  • ${s.section.padEnd(28)} — ${s.desc}`).join('\n')}

SECTION 6: ACTIONS ALREADY TAKEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${actionsLog}

SECTION 7: EVIDENCE COLLECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • QuantumShield Evidence Vault screenshots : ${evidenceCount} file(s)
  • Call recordings                          : Attach if available
  • SMS / Chat screenshots                   : Attach if available
  • Bank transaction proof                   : Attach if available

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMMEDIATE ACTIONS — DO NOW (tick when done)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□  STEP 1 — Call 1930 NOW (24×7 cybercrime helpline)
   Give them the accused bank account / UPI ID above.
   Accounts can be frozen within the Golden Hour to prevent
   money being withdrawn by the fraudster.

□  STEP 2 — File online at cybercrime.gov.in
   Register, select "Report Cyber Crime", attach this document
   and your screenshots. You will receive an acknowledgement.

□  STEP 3 — Visit your local Cyber Cell
   Carry a printout of this document + evidence screenshots.
   Ask for a Complaint Registration Number (CRN).

□  STEP 4 — Inform your bank
   Call your bank's 24h helpline and quote the transaction
   reference. Request a chargeback / dispute if applicable.

□  STEP 5 — Preserve all evidence
   Do NOT delete chats, calls, or SMS from your device until
   the case is registered.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECLARATION
━━━━━━━━━━━
I, the complainant, declare that the information provided above
is true and correct to the best of my knowledge. I request the
authorities to investigate the matter and take appropriate action.

Signature: _______________________   Date: ___________________
Name:      _______________________   Phone: __________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISCLAIMER: This document was generated locally by QuantumShield.
No personal data was transmitted to any server. This is a
structured aid to help victims file complaints. For legal advice,
consult a cyber law attorney or call Cyber Dost (@CyberDost).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ref: ${refId}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `CyberComplaint_${refId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerated(true);
  };

  const inputCls = 'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-600 transition';
  const labelCls = 'text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block';

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <BackToHome />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-orange-600 rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
        <Shield className="absolute right-4 bottom-4 w-28 h-28 opacity-10" />
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-7 h-7" />
          <h1 className="text-2xl font-black tracking-tight">
            {en ? 'Cybercrime FIR Report Generator' : 'साइबर अपराध FIR रिपोर्ट जनरेटर'}
          </h1>
        </div>
        <p className="text-red-100 text-sm opacity-90">
          {en
            ? 'Generates a police-ready complaint in I4C / MHA format · 100% on-device · No data sent'
            : 'I4C/MHA प्रारूप में पुलिस-तैयार शिकायत · 100% ऑन-डिवाइस · कोई डेटा नहीं'}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-red-200">
          <Hash className="w-3 h-3" />
          {en ? `Reference: ${refId}` : `संदर्भ: ${refId}`}
        </div>
      </div>

      {/* Golden hour banner */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl px-5 py-4 mb-7">
        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          <span className="font-bold text-amber-300">{en ? 'Golden Hour: ' : 'गोल्डन ऑवर: '}</span>
          {en
            ? 'Reporting within 24 hours activates the Golden Hour Protocol — I4C can freeze the scammer\'s account before they withdraw. Call 1930 NOW even before filling this form.'
            : '24 घंटे में रिपोर्ट करने से I4C स्कैमर का खाता फ्रीज कर सकता है। फॉर्म भरने से पहले अभी 1930 कॉल करें।'}
        </div>
      </div>

      <div className="space-y-6">

        {/* Section 1: Incident */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            {en ? '1. Incident Details' : '1. घटना विवरण'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{en ? 'Type of Fraud' : 'धोखाधड़ी का प्रकार'}</label>
              <select value={fraudType} onChange={e => setFraudType(e.target.value)} className={inputCls}>
                {FRAUD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{en ? 'Platform / Where it happened' : 'प्लेटफ़ॉर्म / कहाँ हुआ'}</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} className={inputCls}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{en ? 'Date & Time of Incident' : 'घटना की तारीख और समय'}</label>
              <input type="datetime-local" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{en ? 'Your City / District' : 'आपका शहर / जिला'}</label>
              <input placeholder={en ? 'e.g. Hyderabad, Telangana' : 'जैसे हैदराबाद, तेलंगाना'} value={victimCity} onChange={e => setVictimCity(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 2: Financial */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-400" />
            {en ? '2. Financial Loss Details' : '2. वित्तीय नुकसान विवरण'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{en ? 'Amount Lost (₹)' : 'खोया गया पैसा (₹)'}</label>
              <input placeholder="e.g. 25000" type="number" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{en ? 'Your Bank Name' : 'आपका बैंक'}</label>
              <input placeholder={en ? 'e.g. SBI, HDFC, Paytm Bank' : 'जैसे SBI, HDFC, Paytm Bank'} value={victimBank} onChange={e => setVictimBank(e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{en ? 'Transaction Reference No. (from bank SMS / app)' : 'ट्रांजेक्शन रेफरेंस नंबर (बैंक SMS / ऐप से)'}</label>
              <input placeholder={en ? 'UPI Ref / NEFT Ref / IMPS UTR' : 'UPI रेफ / NEFT रेफ / IMPS UTR'} value={txnRef} onChange={e => setTxnRef(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 3: Accused */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-yellow-400" />
            {en ? '3. Scammer\'s Contact Details (fill whatever you have)' : '3. स्कैमर की संपर्क जानकारी (जो मिले वो भरें)'}
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            {en ? 'Even 1 phone number or UPI ID is enough for 1930 to initiate a freeze.' : '1930 के लिए एक फोन नंबर या UPI ID काफी है।'}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{en ? 'Phone / WhatsApp Number(s)' : 'फोन / WhatsApp नंबर'}</label>
              <input placeholder="+91 98765 43210" value={accusedPhone} onChange={e => setAccusedPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{en ? 'UPI ID Used by Scammer' : 'स्कैमर की UPI ID'}</label>
              <input placeholder="scammer@upi or 9xxxxxxxxx@paytm" value={accusedUPI} onChange={e => setAccusedUPI(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{en ? 'Bank Account + IFSC (where money was sent)' : 'बैंक खाता + IFSC (जहाँ पैसे गए)'}</label>
              <input placeholder="123456789012 / HDFC0001234" value={accusedBank} onChange={e => setAccusedBank(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{en ? 'Email ID (if known)' : 'ईमेल ID (यदि पता हो)'}</label>
              <input placeholder="scammer@gmail.com" value={accusedEmail} onChange={e => setAccusedEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Section 4: Description */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            {en ? '4. What Happened (step-by-step)' : '4. क्या हुआ (चरण-दर-चरण)'}
          </h2>
          <textarea
            rows={5}
            placeholder={en
              ? 'Example: On [date], I received a call from +91-XXXXXXXXXX claiming to be from CBI. They said my Aadhaar was linked to a drug parcel. They kept me on a WhatsApp video call for 3 hours threatening "digital arrest". They asked me to transfer ₹XX,XXX to "clear my name"...'
              : 'उदाहरण: [तारीख] को मुझे +91-XXXXXXXXXX से कॉल आया जिसने CBI से होने का दावा किया। उन्होंने कहा मेरा आधार ड्रग पार्सल से जुड़ा है...'}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`${inputCls} h-auto resize-y`}
          />
        </div>

        {/* Section 5: Legal sections preview */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-purple-400" />
            {en ? '5. Applicable Law Sections (auto-detected)' : '5. लागू कानून धाराएं (स्वतः पहचानी गई)'}
          </h2>
          <div className="space-y-2">
            {sections.map((s, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-purple-400 font-mono font-bold shrink-0 w-36">{s.section}</span>
                <span className="text-slate-300">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Actions taken */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {en ? '6. Actions Already Taken' : '6. अब तक की गई कार्रवाई'}
          </h2>
          <div className="space-y-3">
            {[
              [calledHelpline, setCalledHelpline, en ? 'Called 1930 cybercrime helpline' : '1930 साइबर अपराध हेल्पलाइन पर कॉल किया'],
              [filedOnline,    setFiledOnline,    en ? 'Filed complaint at cybercrime.gov.in' : 'cybercrime.gov.in पर शिकायत दर्ज की'],
              [bankInformed,   setBankInformed,   en ? 'Informed bank / requested account freeze' : 'बैंक को सूचित किया / खाता फ्रीज का अनुरोध किया'],
            ].map(([val, setter, label], i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={val as boolean}
                  onChange={e => (setter as (v: boolean) => void)(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <span className="text-slate-300 text-sm">{label as string}</span>
              </label>
            ))}
            {evidenceCount > 0 && (
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm">
                  {evidenceCount} {en ? 'screenshot(s) in Evidence Vault' : 'स्क्रीनशॉट Evidence Vault में'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generateReport}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 transition text-lg"
        >
          <Download className="w-5 h-5" />
          {en ? 'Download Police-Ready Report (.txt)' : 'पुलिस-तैयार रिपोर्ट डाउनलोड करें (.txt)'}
        </button>

        {generated && (
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl px-5 py-4">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-200">
              <span className="font-bold">{en ? 'Report downloaded. ' : 'रिपोर्ट डाउनलोड हुई। '}</span>
              {en
                ? 'Print it or send it to cybercrime.gov.in. Also share the accused phone/UPI details with 1930 immediately.'
                : 'इसे प्रिंट करें या cybercrime.gov.in पर भेजें। आरोपी का फोन/UPI तुरंत 1930 को दें।'}
            </div>
          </div>
        )}

        {/* Emergency buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <a href="tel:1930" className="flex items-center justify-between bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 rounded-2xl px-5 py-4 transition">
            <div>
              <div className="text-red-300 font-black text-2xl">1930</div>
              <div className="text-slate-400 text-xs">{en ? 'Cyber Crime Helpline (24×7)' : 'साइबर हेल्पलाइन (24×7)'}</div>
            </div>
            <Phone className="w-6 h-6 text-red-400" />
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 rounded-2xl px-5 py-4 transition"
          >
            <div>
              <div className="text-indigo-300 font-bold">cybercrime.gov.in</div>
              <div className="text-slate-400 text-xs">{en ? 'National Cyber Crime Portal' : 'राष्ट्रीय साइबर अपराध पोर्टल'}</div>
            </div>
            <ExternalLink className="w-5 h-5 text-indigo-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
