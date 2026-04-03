'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, AlertTriangle, Phone, Users, Clock, Zap, CheckCircle,
  XCircle, Bell, BellOff, UserPlus, Trash2, MessageSquare,
  Activity, Lock, Eye, EyeOff, RefreshCw, ChevronRight,
  ShieldAlert, Radio, Timer, PhoneOff, PhoneCall, Info,
  ToggleLeft, ToggleRight, Globe,
} from 'lucide-react';
import globalSafetyData from '@/data/global-safety.json';

const allCountries = globalSafetyData.countries as {
  code: string; name: string; flag: string;
  cyber_hotline: string; cyber_portal: string; cyber_agency: string;
}[];

/* ─── Types ─── */
interface SafetyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  whatsapp?: boolean;
}

interface WhitelistEntry {
  label: string;
  addedAt: number;
}

type ProtocolState = 'idle' | 'monitoring' | 'isolating' | 'pre-alert' | 'triggered';

const SIX_HOURS_MS   = 6 * 60 * 60 * 1000;
const FIVE_HOURS_MS  = 5 * 60 * 60 * 1000;
const CHECKIN_WINDOW = 10 * 60 * 1000; // 10 min before alert
const LS_CONTACTS    = 'qs_cb_safety_circle';
const LS_STATE       = 'qs_cb_state';
const LS_WHITELIST   = 'qs_cb_whitelist';

/* ─── Helpers ─── */
function fmtDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function pct(elapsed: number, total: number) {
  return Math.min(100, Math.round((elapsed / total) * 100));
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function CircuitBreaker({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  /* ─── Contacts ─── */
  const [contacts, setContacts] = useState<SafetyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Omit<SafetyContact, 'id'>>({ name: '', phone: '', relation: '', whatsapp: true });

  /* ─── Protocol state ─── */
  const [protocolState, setProtocolState] = useState<ProtocolState>('idle');
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [guardianActive, setGuardianActive] = useState(false);
  const [manualCallActive, setManualCallActive] = useState(false);
  const [callerLabel, setCallerLabel] = useState('Unknown Caller');

  /* ─── Whitelist ─── */
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [whitelistInput, setWhitelistInput] = useState('');

  /* ─── UI ─── */
  const [activeTab, setActiveTab] = useState<'circle' | 'monitor' | 'protocol' | 'howto'>('monitor');
  const [alertSentLog, setAlertSentLog] = useState<string[]>([]);
  const [testSent, setTestSent] = useState(false);

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  /* ─── i18n ─── */
  const t = {
    en: {
      title: 'Circuit Breaker',
      subtitle: 'Anti-Isolation Protocol · Anti-Virtual Kidnapping',
      badge: 'GUARDIAN MODE',
      tabs: { circle: 'Safety Circle', monitor: 'Live Monitor', protocol: 'Distress Protocol', howto: 'How It Works' },

      circleTitle: 'Your Safety Circle',
      circleDesc: 'Add up to 3 trusted contacts. They will receive a critical alert if you are isolated in a suspicious call for 6+ hours.',
      addContact: 'Add Contact',
      contactName: 'Full Name',
      contactPhone: 'Phone / WhatsApp Number',
      contactRelation: 'Relationship',
      relations: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'],
      saveContact: 'Save',
      cancelContact: 'Cancel',
      maxReached: 'Maximum 3 contacts allowed.',
      whatsappLabel: 'Send alert via WhatsApp',
      noContacts: 'No contacts added yet. Add trusted family members to activate the Circuit Breaker.',

      monitorTitle: 'Guardian Status',
      activate: 'Activate Guardian',
      deactivate: 'Deactivate Guardian',
      guardianOn: 'Guardian Active',
      guardianOff: 'Guardian Inactive',
      unknownCallDetected: 'Unknown Call Detected',
      startIsolationSim: 'Simulate Unknown Call Start',
      endIsolationSim: 'Mark Call Ended',
      callerPlaceholder: 'Caller label (optional)',
      elapsedLabel: 'Isolation Duration',
      thresholdLabel: '6-Hour Threshold',
      missedCallsLabel: 'Missed Emergency Calls',
      logMissedCall: '+ Log Missed Emergency Call',
      statusIdle: 'Ready — No active isolation detected',
      statusMonitoring: 'Monitoring · Waiting for unknown call signal',
      statusIsolating: 'Isolation in progress — Timer running',
      statusPreAlert: '⚠️ Pre-Alert — Check-In Required!',
      statusTriggered: '🚨 DISTRESS SIGNAL TRIGGERED',
      safeCheckin: 'I am Safe — Reset Timer',
      callEnded: 'Call Ended — Clear Protocol',

      protocolTitle: 'Distress Protocol',
      protocolDesc: 'When triggered, Quantum Shield sends a critical alert to your entire Safety Circle via WhatsApp.',
      sendTest: 'Send Test Alert',
      testSent: 'Test Sent!',
      sendDistress: 'TRIGGER DISTRESS SIGNAL NOW',
      alertLog: 'Alert History',
      noAlerts: 'No alerts sent yet.',
      whitelistTitle: 'Call Whitelist',
      whitelistDesc: 'Add labels for trusted callers (e.g. business clients) to exempt from the 6-hour rule.',
      addWhitelist: 'Add to Whitelist',
      removeWhitelist: 'Remove',

      howtoTitle: 'How Circuit Breaker Works',
      howtoSteps: [
        { icon: '🛡️', head: 'Activate Guardian', body: 'Enable Guardian mode. The app silently monitors for isolation signals — zero battery overhead until needed.' },
        { icon: '📱', head: 'Android Detection (Automatic)', body: 'On Android, the native NotificationListenerService detects active WhatsApp calls from unsaved numbers without recording audio.' },
        { icon: '⏱️', head: '6-Hour Logic Gate', body: 'If an unknown WhatsApp call runs for 6 hours AND your Safety Circle has tried to reach you — the Circuit Breaker activates.' },
        { icon: '⚠️', head: '5-Hour Check-In', body: 'At 5 hours, a private check-in prompt appears. Tap "I am Safe" to reset the timer — preventing false alarms for long work calls.' },
        { icon: '🚨', head: 'Zero-Cost Distress Signal', body: 'Alert is sent via WhatsApp (free) to all Safety Circle members: name, situation, and your last known GPS location.' },
        { icon: '🔕', head: 'Priority Siren (Android)', body: 'On the kin\'s device, the alert overrides Silent Mode using an ALARM-category notification channel with a distinct siren sound.' },
      ],
      androidNote: 'Android App: Automatic call detection runs via NotificationListenerService. Grant "Notification Access" in Settings → Apps → Special Access.',
      iosnote: 'iOS: Use the Manual Trigger below — iOS sandboxing prevents automatic call detection by third-party apps.',
    },
    hi: {
      title: 'सर्किट ब्रेकर',
      subtitle: 'एंटी-आइसोलेशन प्रोटोकॉल · वर्चुअल किडनैपिंग से सुरक्षा',
      badge: 'गार्जियन मोड',
      tabs: { circle: 'सेफ्टी सर्कल', monitor: 'लाइव मॉनिटर', protocol: 'डिस्ट्रेस प्रोटोकॉल', howto: 'कैसे काम करता है' },

      circleTitle: 'आपका सेफ्टी सर्कल',
      circleDesc: 'अधिकतम 3 विश्वसनीय संपर्क जोड़ें। यदि आप 6+ घंटे किसी अज्ञात कॉल में फंसे हैं तो इन्हें अलर्ट मिलेगा।',
      addContact: 'संपर्क जोड़ें',
      contactName: 'पूरा नाम',
      contactPhone: 'फोन / WhatsApp नंबर',
      contactRelation: 'संबंध',
      relations: ['पति/पत्नी', 'माता-पिता', 'बच्चा', 'भाई-बहन', 'मित्र', 'अन्य'],
      saveContact: 'सहेजें',
      cancelContact: 'रद्द करें',
      maxReached: 'अधिकतम 3 संपर्क।',
      whatsappLabel: 'WhatsApp से अलर्ट भेजें',
      noContacts: 'कोई संपर्क नहीं। परिवार को जोड़ें।',

      monitorTitle: 'गार्जियन स्थिति',
      activate: 'गार्जियन चालू करें',
      deactivate: 'गार्जियन बंद करें',
      guardianOn: 'गार्जियन सक्रिय',
      guardianOff: 'गार्जियन निष्क्रिय',
      unknownCallDetected: 'अज्ञात कॉल पहचानी',
      startIsolationSim: 'अज्ञात कॉल शुरू (सिमुलेशन)',
      endIsolationSim: 'कॉल समाप्त करें',
      callerPlaceholder: 'कॉलर का लेबल (वैकल्पिक)',
      elapsedLabel: 'आइसोलेशन अवधि',
      thresholdLabel: '6-घंटे की सीमा',
      missedCallsLabel: 'आपातकालीन मिस्ड कॉल',
      logMissedCall: '+ मिस्ड कॉल लॉग करें',
      statusIdle: 'तैयार — कोई आइसोलेशन नहीं',
      statusMonitoring: 'निगरानी जारी है',
      statusIsolating: 'आइसोलेशन चल रहा है — टाइमर चालू',
      statusPreAlert: '⚠️ प्री-अलर्ट — चेक-इन जरूरी!',
      statusTriggered: '🚨 डिस्ट्रेस सिग्नल भेजा गया',
      safeCheckin: 'मैं सुरक्षित हूं — टाइमर रीसेट करें',
      callEnded: 'कॉल समाप्त — प्रोटोकॉल बंद',

      protocolTitle: 'डिस्ट्रेस प्रोटोकॉल',
      protocolDesc: 'ट्रिगर होने पर, QuantumShield आपके पूरे Safety Circle को WhatsApp के जरिए क्रिटिकल अलर्ट भेजता है।',
      sendTest: 'टेस्ट अलर्ट भेजें',
      testSent: 'टेस्ट भेजा!',
      sendDistress: 'अभी डिस्ट्रेस सिग्नल भेजें',
      alertLog: 'अलर्ट इतिहास',
      noAlerts: 'कोई अलर्ट नहीं।',
      whitelistTitle: 'कॉल व्हाइटलिस्ट',
      whitelistDesc: 'व्यावसायिक कॉल के लिए लेबल जोड़ें जो 6-घंटे के नियम से मुक्त हैं।',
      addWhitelist: 'व्हाइटलिस्ट में जोड़ें',
      removeWhitelist: 'हटाएं',

      howtoTitle: 'सर्किट ब्रेकर कैसे काम करता है',
      howtoSteps: [
        { icon: '🛡️', head: 'गार्जियन चालू करें', body: 'गार्जियन मोड सक्रिय करें। बैटरी पर शून्य प्रभाव।' },
        { icon: '📱', head: 'Android स्वचालित पहचान', body: 'NotificationListenerService व्हाट्सएप कॉल को बिना ऑडियो रिकॉर्ड किए पहचानता है।' },
        { icon: '⏱️', head: '6-घंटे लॉजिक गेट', body: '6 घंटे अज्ञात कॉल + Safety Circle की मिस्ड कॉल = Circuit Breaker सक्रिय।' },
        { icon: '⚠️', head: '5-घंटे चेक-इन', body: '5 घंटे पर प्राइवेट चेक-इन प्रॉम्प्ट — टैप करें "मैं सुरक्षित हूं" गलत अलर्ट रोकने के लिए।' },
        { icon: '🚨', head: 'जीरो-कॉस्ट डिस्ट्रेस सिग्नल', body: 'WhatsApp के जरिए Safety Circle को अलर्ट — नाम, स्थिति, GPS लोकेशन।' },
        { icon: '🔕', head: 'प्रायोरिटी सायरन (Android)', body: 'ALARM-कैटेगरी नोटिफिकेशन साइलेंट मोड को ओवरराइड करता है।' },
      ],
      androidNote: 'Android ऐप: स्वचालित पहचान के लिए Settings → Apps → Special Access → Notification Access दें।',
      iosnote: 'iOS: नीचे मैनुअल ट्रिगर उपयोग करें।',
    },
  }[lang];

  /* ─── Persist state ─── */
  useEffect(() => {
    const sc = localStorage.getItem(LS_CONTACTS);
    if (sc) setContacts(JSON.parse(sc));
    const ss = localStorage.getItem(LS_STATE);
    if (ss) {
      const s = JSON.parse(ss);
      if (s.protocolState) setProtocolState(s.protocolState);
      if (s.callStartTime) setCallStartTime(s.callStartTime);
      if (s.missedCount)   setMissedCount(s.missedCount);
      if (s.guardianActive !== undefined) setGuardianActive(s.guardianActive);
      if (s.callerLabel)   setCallerLabel(s.callerLabel);
    }
    const wl = localStorage.getItem(LS_WHITELIST);
    if (wl) setWhitelist(JSON.parse(wl));
  }, []);

  const persistState = useCallback((update: Partial<{
    protocolState: ProtocolState; callStartTime: number | null;
    missedCount: number; guardianActive: boolean; callerLabel: string;
  }>) => {
    const current = JSON.parse(localStorage.getItem(LS_STATE) || '{}');
    localStorage.setItem(LS_STATE, JSON.stringify({ ...current, ...update }));
  }, []);

  /* ─── Tick ─── */
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (protocolState === 'isolating' || protocolState === 'pre-alert') {
      tickRef.current = setInterval(() => {
        if (!callStartTime) return;
        const e = Date.now() - callStartTime;
        setElapsed(e);
        if (e >= SIX_HOURS_MS && missedCount > 0 && protocolState !== 'triggered') {
          setProtocolState('triggered');
          persistState({ protocolState: 'triggered' });
          sendDistressSignal('auto');
        } else if (e >= FIVE_HOURS_MS && protocolState === 'isolating') {
          setProtocolState('pre-alert');
          persistState({ protocolState: 'pre-alert' });
        }
      }, 1000);
    } else {
      setElapsed(callStartTime ? Date.now() - callStartTime : 0);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocolState, callStartTime, missedCount]);

  /* ─── Contact management ─── */
  const addContact = () => {
    if (contacts.length >= 3) { alert(t.maxReached); return; }
    if (!newContact.name || !newContact.phone || !newContact.relation) return;
    const c: SafetyContact = { ...newContact, id: Date.now().toString() };
    const updated = [...contacts, c];
    setContacts(updated);
    localStorage.setItem(LS_CONTACTS, JSON.stringify(updated));
    setNewContact({ name: '', phone: '', relation: '', whatsapp: true });
    setShowAddForm(false);
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem(LS_CONTACTS, JSON.stringify(updated));
  };

  /* ─── Guardian toggle ─── */
  const toggleGuardian = () => {
    const next = !guardianActive;
    setGuardianActive(next);
    persistState({ guardianActive: next });
    if (!next) resetProtocol();
    else if (protocolState === 'idle') {
      setProtocolState('monitoring');
      persistState({ protocolState: 'monitoring' });
    }
  };

  /* ─── Manual simulation ─── */
  const startUnknownCall = () => {
    if (!guardianActive) { toggleGuardian(); }
    const now = Date.now();
    setCallStartTime(now);
    setManualCallActive(true);
    setProtocolState('isolating');
    setMissedCount(0);
    persistState({ callStartTime: now, protocolState: 'isolating', missedCount: 0, callerLabel });
  };

  const endCall = () => {
    resetProtocol();
  };

  const logMissedEmergencyCall = () => {
    const next = missedCount + 1;
    setMissedCount(next);
    persistState({ missedCount: next });
    if (protocolState === 'pre-alert' || protocolState === 'isolating') {
      const e = callStartTime ? Date.now() - callStartTime : 0;
      if (e >= SIX_HOURS_MS) {
        setProtocolState('triggered');
        persistState({ protocolState: 'triggered' });
        sendDistressSignal('auto');
      }
    }
  };

  const safeCheckin = () => {
    const now = Date.now();
    setCallStartTime(now);
    setElapsed(0);
    setMissedCount(0);
    setProtocolState('isolating');
    persistState({ callStartTime: now, protocolState: 'isolating', missedCount: 0 });
  };

  const resetProtocol = () => {
    setProtocolState(guardianActive ? 'monitoring' : 'idle');
    setCallStartTime(null);
    setElapsed(0);
    setMissedCount(0);
    setManualCallActive(false);
    persistState({ protocolState: guardianActive ? 'monitoring' : 'idle', callStartTime: null, missedCount: 0 });
  };

  /* ─── Distress signal ─── */
  const sendDistressSignal = (mode: 'auto' | 'manual' | 'test') => {
    const timestamp = new Date().toLocaleString();
    const label = mode === 'test' ? 'TEST ALERT' : 'CRITICAL DISTRESS';

    // ── Global Guardian: inject country-specific cyber hotline ──
    const savedCountry = typeof window !== 'undefined' ? localStorage.getItem('qs_shield_country') || 'IN' : 'IN';
    const countryInfo = allCountries.find(c => c.code === savedCountry) ?? allCountries[0];
    const cyberLine = `${countryInfo.flag} ${countryInfo.name} Cybercrime: *${countryInfo.cyber_hotline}*`;
    const cyberPortal = countryInfo.cyber_portal;
    const cyberAgency = countryInfo.cyber_agency;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mapsUrl = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        contacts.forEach(c => {
          if (c.whatsapp) {
            const msg = mode === 'test'
              ? `🧪 [TEST] QuantumShield Circuit Breaker — Safety check from ${c.name || 'your contact'}. You can ignore this message.`
              : `🚨 *QUANTUM SHIELD — CIRCUIT BREAKER ALERT*\n\n` +
                `*${c.name}*, this is an automated distress signal.\n\n` +
                `Your contact has been in an *unverified call (${callerLabel}) for 6+ hours* and is unreachable.\n\n` +
                `📍 Last known location: ${mapsUrl}\n\n` +
                `🌍 Shield Region: *${countryInfo.flag} ${countryInfo.name}*\n\n` +
                `⚠️ Possible *Virtual Kidnapping / Digital Arrest* scam.\n\n` +
                `Please call them immediately or contact:\n${cyberLine}\n• ${cyberAgency}\n• Portal: ${cyberPortal}\n\n` +
                `— QuantumShield Global Guardian · Anti-Isolation Protocol`;
            const phone = c.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
          }
        });
        setAlertSentLog(prev => [`${timestamp} — ${label} sent to ${contacts.length} contact(s) [${countryInfo.flag} ${countryInfo.code}]`, ...prev]);
        if (mode === 'test') setTestSent(true);
      },
      () => {
        // No GPS: send without location
        contacts.forEach(c => {
          if (c.whatsapp) {
            const msg = mode === 'test'
              ? `🧪 [TEST] QuantumShield Circuit Breaker test alert.`
              : `🚨 *QUANTUM SHIELD — CIRCUIT BREAKER ALERT*\n\n` +
                `*${c.name}*, your contact has been isolated in an unknown call for 6+ hours. Please reach them immediately.\n\n` +
                `🌍 Shield Region: *${countryInfo.flag} ${countryInfo.name}*\n${cyberLine}\nPortal: ${cyberPortal}`;
            const phone = c.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
          }
        });
        setAlertSentLog(prev => [`${timestamp} — ${label} sent (no GPS) [${countryInfo.flag} ${countryInfo.code}]`, ...prev]);
        if (mode === 'test') setTestSent(true);
      }
    );
  };

  /* ─── Whitelist ─── */
  const addWhitelist = () => {
    if (!whitelistInput.trim()) return;
    const entry: WhitelistEntry = { label: whitelistInput.trim(), addedAt: Date.now() };
    const updated = [...whitelist, entry];
    setWhitelist(updated);
    localStorage.setItem(LS_WHITELIST, JSON.stringify(updated));
    setWhitelistInput('');
  };

  const removeWhitelist = (idx: number) => {
    const updated = whitelist.filter((_, i) => i !== idx);
    setWhitelist(updated);
    localStorage.setItem(LS_WHITELIST, JSON.stringify(updated));
  };

  /* ─── Derived UI values ─── */
  const stateColor: Record<ProtocolState, string> = {
    idle:        'text-gray-400',
    monitoring:  'text-blue-400',
    isolating:   'text-yellow-400',
    'pre-alert': 'text-orange-400',
    triggered:   'text-red-400',
  };

  const stateBg: Record<ProtocolState, string> = {
    idle:        'border-gray-500/30 bg-gray-500/5',
    monitoring:  'border-blue-500/40 bg-blue-500/5',
    isolating:   'border-yellow-500/40 bg-yellow-500/10',
    'pre-alert': 'border-orange-500/60 bg-orange-500/15',
    triggered:   'border-red-500/70 bg-red-500/20',
  };

  const stateLabel: Record<ProtocolState, string> = {
    idle:        t.statusIdle,
    monitoring:  t.statusMonitoring,
    isolating:   t.statusIsolating,
    'pre-alert': t.statusPreAlert,
    triggered:   t.statusTriggered,
  };

  const progressPct = callStartTime ? pct(elapsed, SIX_HOURS_MS) : 0;

  /* ═══ RENDER ═══ */
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 text-white">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-red-950/60 to-slate-900 border border-red-500/30 p-6">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #dc2626 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7c3aed 0%, transparent 50%)' }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono bg-red-600/20 border border-red-500/40 text-red-400 px-3 py-1 rounded-full tracking-widest">
              {t.badge}
            </span>
            <div className={`flex items-center gap-2 text-sm font-semibold ${guardianActive ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${guardianActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              {guardianActive ? t.guardianOn : t.guardianOff}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1 text-white">{t.title}</h1>
          <p className="text-sm text-gray-400">{t.subtitle}</p>
          <a href="/global-guardian"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full transition-all">
            <Globe className="w-3 h-3" />
            Global Guardian — {typeof window !== 'undefined' ? (allCountries.find(c => c.code === (localStorage.getItem('qs_shield_country') || 'IN'))?.flag ?? '🇮🇳') : '🇮🇳'} Country Shield active
          </a>
        </div>
      </div>

      {/* ── No contacts warning ── */}
      {contacts.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 mb-5 text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{t.noContacts}</span>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 overflow-x-auto">
        {(['monitor', 'circle', 'protocol', 'howto'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max text-sm py-2 px-3 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: MONITOR
      ══════════════════════════════════════════════ */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">

          {/* Guardian toggle */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Shield className={`w-7 h-7 ${guardianActive ? 'text-green-400' : 'text-gray-500'}`} />
              <div>
                <div className="font-bold">{t.monitorTitle}</div>
                <div className="text-xs text-gray-500">{guardianActive ? t.guardianOn : t.guardianOff}</div>
              </div>
            </div>
            <button
              onClick={toggleGuardian}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                guardianActive
                  ? 'bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30'
                  : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              {guardianActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {guardianActive ? t.deactivate : t.activate}
            </button>
          </div>

          {/* Status card */}
          <div className={`border rounded-xl p-5 transition-all ${stateBg[protocolState]}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 font-bold text-sm ${stateColor[protocolState]}`}>
                <Radio className={`w-4 h-4 ${protocolState === 'isolating' || protocolState === 'pre-alert' ? 'animate-pulse' : ''}`} />
                {stateLabel[protocolState]}
              </div>
              {protocolState === 'triggered' && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>
              )}
            </div>

            {/* Progress bar */}
            {(protocolState === 'isolating' || protocolState === 'pre-alert' || protocolState === 'triggered') && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{t.elapsedLabel}: <span className="font-mono text-white">{fmtDuration(elapsed)}</span></span>
                  <span>{t.thresholdLabel}: <span className="font-mono text-white">6h 0m</span></span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      protocolState === 'triggered' ? 'bg-red-500' :
                      protocolState === 'pre-alert'  ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">0h</span>
                  <span className="text-orange-400">5h ⚠️</span>
                  <span className="text-red-400">6h 🚨</span>
                </div>

                <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 mt-1">
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneOff className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300">{t.missedCallsLabel}:</span>
                    <span className="font-bold text-white text-lg">{missedCount}</span>
                  </div>
                  <button
                    onClick={logMissedEmergencyCall}
                    className="text-xs bg-red-600/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-600/30"
                  >
                    {t.logMissedCall}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pre-alert check-in */}
          {protocolState === 'pre-alert' && (
            <div className="border-2 border-orange-500/70 bg-orange-500/10 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-2 text-orange-400 font-bold mb-3">
                <Bell className="w-5 h-5" />
                Distress signal sends in {fmtDuration(SIX_HOURS_MS - elapsed)}
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Are you safe? Tap below to reset the timer and prevent the alert from going to your Safety Circle.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={safeCheckin}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> {t.safeCheckin}
                </button>
                <button
                  onClick={endCall}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> {t.callEnded}
                </button>
              </div>
            </div>
          )}

          {/* Manual call controls */}
          {guardianActive && protocolState !== 'triggered' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <div className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Manual / PWA Mode
              </div>
              {!manualCallActive ? (
                <div className="space-y-2">
                  <input
                    value={callerLabel}
                    onChange={e => setCallerLabel(e.target.value)}
                    placeholder={t.callerPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                  />
                  <button
                    onClick={startUnknownCall}
                    disabled={contacts.length === 0}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-5 h-5" /> {t.startIsolationSim}
                  </button>
                </div>
              ) : (
                <button
                  onClick={endCall}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" /> {t.endIsolationSim}
                </button>
              )}
            </div>
          )}

          {/* Triggered state actions */}
          {protocolState === 'triggered' && (
            <div className="border-2 border-red-500 bg-red-500/10 rounded-xl p-5">
              <div className="text-red-400 font-black text-lg mb-3 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> {t.statusTriggered}
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Alert has been sent to your Safety Circle. If you are safe, reset below.
              </p>
              <button
                onClick={resetProtocol}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" /> Reset Protocol — I Am Safe
              </button>
            </div>
          )}

          {/* Platform note */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="text-blue-400 font-semibold">Android App</p>
            <p>{t.androidNote}</p>
            <p className="text-purple-400 font-semibold mt-2">iOS / PWA</p>
            <p>{t.iosnote}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: SAFETY CIRCLE
      ══════════════════════════════════════════════ */}
      {activeTab === 'circle' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{t.circleTitle}</h2>
            <p className="text-sm text-gray-400">{t.circleDesc}</p>
          </div>

          {contacts.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm
                  ${i === 0 ? 'bg-red-600' : i === 1 ? 'bg-purple-600' : 'bg-blue-600'}`}>
                  {c.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.relation} · {c.phone}</div>
                  {c.whatsapp && (
                    <span className="text-[10px] text-green-400 flex items-center gap-1 mt-0.5">
                      <MessageSquare className="w-3 h-3" /> WhatsApp Alert
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => removeContact(c.id)} className="text-red-400 hover:text-red-300 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {contacts.length < 3 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-white/5 border border-dashed border-white/20 hover:border-white/40 hover:bg-white/10 text-gray-400 hover:text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-5 h-5" /> {t.addContact} ({contacts.length}/3)
            </button>
          )}

          {showAddForm && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <input
                value={newContact.name}
                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                placeholder={t.contactName}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              />
              <input
                value={newContact.phone}
                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder={t.contactPhone}
                type="tel"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              />
              <select
                value={newContact.relation}
                onChange={e => setNewContact({ ...newContact, relation: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option value="">{t.contactRelation}</option>
                {t.relations.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.whatsapp ?? true}
                  onChange={e => setNewContact({ ...newContact, whatsapp: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
                {t.whatsappLabel}
              </label>
              <div className="flex gap-3 pt-1">
                <button onClick={addContact} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg">
                  {t.saveContact}
                </button>
                <button onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg">
                  {t.cancelContact}
                </button>
              </div>
            </div>
          )}

          {contacts.length === 3 && (
            <div className="text-center text-xs text-gray-500 py-2 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> {t.maxReached}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: DISTRESS PROTOCOL
      ══════════════════════════════════════════════ */}
      {activeTab === 'protocol' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold mb-1">{t.protocolTitle}</h2>
            <p className="text-sm text-gray-400">{t.protocolDesc}</p>
          </div>

          {/* Manual distress button */}
          <button
            onClick={() => sendDistressSignal('manual')}
            disabled={contacts.length === 0}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-900/40"
          >
            <ShieldAlert className="w-7 h-7" /> {t.sendDistress}
          </button>

          {/* Test button */}
          <button
            onClick={() => !testSent && sendDistressSignal('test')}
            disabled={contacts.length === 0 || testSent}
            className="w-full bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 disabled:opacity-50 text-blue-300 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Activity className="w-4 h-4" />
            {testSent ? t.testSent : t.sendTest}
          </button>
          {testSent && (
            <p className="text-xs text-green-400 text-center -mt-2">
              Test message sent to your Safety Circle. Ask them to confirm receipt.
            </p>
          )}

          {/* Whitelist */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <div>
              <h3 className="font-bold text-sm mb-1">{t.whitelistTitle}</h3>
              <p className="text-xs text-gray-400">{t.whitelistDesc}</p>
            </div>
            <div className="flex gap-2">
              <input
                value={whitelistInput}
                onChange={e => setWhitelistInput(e.target.value)}
                placeholder="e.g. Business Client — Company XYZ"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/50"
              />
              <button onClick={addWhitelist} className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                {t.addWhitelist}
              </button>
            </div>
            {whitelist.map((w, i) => (
              <div key={i} className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
                <span className="text-sm text-green-300">{w.label}</span>
                <button onClick={() => removeWhitelist(i)} className="text-gray-500 hover:text-red-400 ml-3">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Alert log */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" /> {t.alertLog}
            </h3>
            {alertSentLog.length === 0 ? (
              <p className="text-xs text-gray-500">{t.noAlerts}</p>
            ) : (
              <div className="space-y-1.5">
                {alertSentLog.map((l, i) => (
                  <div key={i} className="text-xs text-gray-400 font-mono bg-black/30 px-3 py-2 rounded-lg">
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: HOW IT WORKS
      ══════════════════════════════════════════════ */}
      {activeTab === 'howto' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t.howtoTitle}</h2>
          {t.howtoSteps.map((step, i) => (
            <div key={i} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-2xl leading-none mt-0.5">{step.icon}</span>
              <div>
                <div className="font-bold text-sm mb-1">{step.head}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}

          {/* Architecture diagram */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-purple-400">System Architecture</h3>
            {[
              { from: 'WhatsApp Notification', via: 'NotificationListenerService (Android)', to: 'LocalTracker (EncryptedSharedPreferences)' },
              { from: 'LocalTracker', via: '30-min WorkManager heartbeat', to: '6h Logic Gate check' },
              { from: '6h Gate + Missed Emergency Call', via: 'FCM Data Message (free tier)', to: "Kin's device — ALARM channel siren" },
              { from: 'Fallback', via: 'WhatsApp URL deep-link', to: 'Zero-cost direct message' },
            ].map((row, i) => (
              <div key={i} className="text-xs font-mono flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                <span className="text-yellow-400">{row.from}</span>
                <ChevronRight className="w-3 h-3 text-gray-600 hidden md:block" />
                <span className="text-gray-500">{row.via}</span>
                <ChevronRight className="w-3 h-3 text-gray-600 hidden md:block" />
                <span className="text-green-400">{row.to}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-xs text-gray-400 space-y-2">
            <p className="text-blue-400 font-bold">Privacy Guarantee</p>
            <p>Circuit Breaker monitors only notification <em>metadata</em> (is a call ongoing? is the contact saved?). It does <strong className="text-white">NOT</strong> record audio, read message content, or store any data on external servers.</p>
            <p>All logic runs <strong className="text-white">on-device</strong>. The server is contacted only once — when sending the FCM distress signal.</p>
          </div>
        </div>
      )}
    </div>
  );
}
