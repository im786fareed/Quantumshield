'use client';
import { useState, useEffect } from 'react';
import {
  Zap, Cpu, HardDrive, Battery, Trash2, CheckCircle,
  Shield, BatteryCharging, MemoryStick, Moon, Wifi, Info,
  ChevronDown, ChevronUp, Smartphone,
} from 'lucide-react';
import BackToHome from './BackToHome';

interface TuneMetric {
  label: string;
  labelHi: string;
  value: number;
  unit: string;
  status: 'good' | 'warn' | 'critical';
  icon: any;
  color: string;
}

interface GuideStep {
  id: string;
  name: string;
  nameHi: string;
  why: string;
  whyHi: string;
  how: string[];
  howHi: string[];
  icon: any;
}

/* ── Real browser metric loader ──
   Uses Battery API, Storage API, and performance.memory where available.
   Falls back gracefully on unsupported browsers. Nothing is invented:
   if the browser can't measure it, we don't show it.
*/
async function loadRealMetrics(): Promise<TuneMetric[]> {
  const metrics: TuneMetric[] = [];
  const statusOf = (v: number, warnAt: number, critAt: number): 'good' | 'warn' | 'critical' =>
    v >= critAt ? 'critical' : v >= warnAt ? 'warn' : 'good';

  // Battery
  try {
    const bat = await (navigator as any).getBattery?.();
    if (bat) {
      const pct = Math.round(bat.level * 100);
      metrics.push({
        label: 'Battery', labelHi: 'बैटरी', value: pct, unit: '%',
        status: pct < 20 ? 'critical' : pct < 40 ? 'warn' : 'good',
        icon: Battery,
        color: pct < 20 ? 'text-red-400' : pct < 40 ? 'text-yellow-400' : 'text-green-400',
      });
    }
  } catch { /* not available */ }

  // Storage
  try {
    const est = await navigator.storage?.estimate?.();
    if (est?.quota && est?.usage) {
      const usedPct = Math.round((est.usage / est.quota) * 100);
      metrics.push({
        label: 'Storage Used', labelHi: 'स्टोरेज उपयोग', value: usedPct, unit: '%',
        status: statusOf(usedPct, 60, 85),
        icon: HardDrive,
        color: usedPct >= 85 ? 'text-red-400' : usedPct >= 60 ? 'text-orange-400' : 'text-green-400',
      });
    }
  } catch { /* not available */ }

  // JS Heap (Chrome only)
  try {
    const mem = (performance as any).memory;
    if (mem?.jsHeapSizeLimit && mem?.usedJSHeapSize) {
      const heapPct = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
      metrics.push({
        label: 'JS Heap', labelHi: 'JS हीप', value: heapPct, unit: '%',
        status: statusOf(heapPct, 50, 75),
        icon: Cpu,
        color: heapPct >= 75 ? 'text-red-400' : heapPct >= 50 ? 'text-yellow-400' : 'text-blue-400',
      });
    }
  } catch { /* not available */ }

  // Device memory (Chrome — total RAM, not usage)
  try {
    const devMem = (navigator as any).deviceMemory;
    if (devMem) {
      metrics.push({
        label: 'Device RAM', labelHi: 'डिवाइस RAM', value: devMem, unit: ' GB',
        status: devMem >= 4 ? 'good' : devMem >= 2 ? 'warn' : 'critical',
        icon: MemoryStick,
        color: devMem >= 4 ? 'text-green-400' : devMem >= 2 ? 'text-yellow-400' : 'text-red-400',
      });
    }
  } catch { /* not available */ }

  return metrics;
}

const CLEANUP_GUIDE: GuideStep[] = [
  {
    id: 'cache',
    name: 'Clear app caches',
    nameHi: 'ऐप कैश साफ करें',
    why: 'Cached files pile up over months and quietly eat storage. Clearing them is safe — apps rebuild what they need.',
    whyHi: 'कैश फाइलें महीनों में जमा होकर स्टोरेज भरती हैं। इन्हें साफ करना सुरक्षित है — ऐप्स जरूरी डेटा फिर बना लेते हैं।',
    how: ['Open Settings → Storage', 'Tap "Apps" and sort by size', 'Open the biggest apps → tap "Clear cache" (NOT "Clear data")'],
    howHi: ['सेटिंग्स → स्टोरेज खोलें', '"ऐप्स" चुनें और आकार के अनुसार क्रमबद्ध करें', 'सबसे बड़े ऐप्स खोलें → "कैश साफ करें" दबाएं ("डेटा साफ करें" नहीं)'],
    icon: Trash2,
  },
  {
    id: 'unused',
    name: 'Remove unused apps',
    nameHi: 'अनुपयोगी ऐप्स हटाएं',
    why: 'Every installed app can run in the background, drain battery, and request permissions. Fewer apps = faster, safer phone.',
    whyHi: 'हर इंस्टॉल ऐप बैकग्राउंड में चल सकता है, बैटरी खा सकता है और अनुमतियां मांग सकता है। कम ऐप्स = तेज़, सुरक्षित फोन।',
    how: ['Open Play Store → Profile → "Manage apps & device"', 'Tap "Unused apps" or sort by "Least used"', 'Uninstall anything you haven\'t opened in 3 months'],
    howHi: ['प्ले स्टोर → प्रोफाइल → "ऐप्स और डिवाइस प्रबंधित करें"', '"अनुपयोगी ऐप्स" चुनें', '3 महीने से न खोले गए ऐप्स अनइंस्टॉल करें'],
    icon: Smartphone,
  },
  {
    id: 'permissions',
    name: 'Review app permissions',
    nameHi: 'ऐप अनुमतियां जांचें',
    why: 'Apps with SMS, microphone, or accessibility access can spy on you. This is the single most important security cleanup.',
    whyHi: 'SMS, माइक्रोफोन या एक्सेसिबिलिटी एक्सेस वाले ऐप्स आपकी जासूसी कर सकते हैं। यह सबसे महत्वपूर्ण सुरक्षा सफाई है।',
    how: ['Open Settings → Privacy → Permission manager', 'Check SMS, Microphone, Camera, and Accessibility', 'Revoke access for any app that doesn\'t clearly need it'],
    howHi: ['सेटिंग्स → गोपनीयता → अनुमति प्रबंधक खोलें', 'SMS, माइक्रोफोन, कैमरा और एक्सेसिबिलिटी जांचें', 'जिन ऐप्स को जरूरत नहीं, उनकी अनुमति हटाएं'],
    icon: Shield,
  },
  {
    id: 'updates',
    name: 'Install pending updates',
    nameHi: 'अपडेट इंस्टॉल करें',
    why: 'Security patches close holes that scammers and malware actively exploit. An outdated phone is an easy target.',
    whyHi: 'सुरक्षा पैच उन कमजोरियों को बंद करते हैं जिनका स्कैमर फायदा उठाते हैं। पुराना फोन आसान निशाना है।',
    how: ['Open Settings → System → System update', 'Also update apps: Play Store → "Manage apps" → "Update all"'],
    howHi: ['सेटिंग्स → सिस्टम → सिस्टम अपडेट खोलें', 'ऐप्स भी अपडेट करें: प्ले स्टोर → "सभी अपडेट करें"'],
    icon: CheckCircle,
  },
];

const BATTERY_GUIDE: GuideStep[] = [
  {
    id: 'adaptive',
    name: 'Turn on Adaptive Battery',
    nameHi: 'अडैप्टिव बैटरी चालू करें',
    why: 'Android learns which apps you actually use and limits battery for the rest. This is the real, built-in version of what "booster" apps falsely promise.',
    whyHi: 'Android सीखता है कि आप कौन से ऐप्स उपयोग करते हैं और बाकी की बैटरी सीमित करता है। यही असली, बिल्ट-इन बैटरी बचत है।',
    how: ['Open Settings → Battery', 'Tap "Adaptive Battery" (or "Battery optimization")', 'Turn it on'],
    howHi: ['सेटिंग्स → बैटरी खोलें', '"अडैप्टिव बैटरी" चुनें', 'इसे चालू करें'],
    icon: BatteryCharging,
  },
  {
    id: 'background',
    name: 'Restrict background-heavy apps',
    nameHi: 'बैकग्राउंड ऐप्स सीमित करें',
    why: 'A few apps usually cause most hidden battery drain by waking the phone constantly.',
    whyHi: 'कुछ ऐप्स फोन को लगातार जगाकर सबसे ज्यादा छुपी बैटरी ड्रेन करते हैं।',
    how: ['Open Settings → Battery → Battery usage', 'Find apps high on the list that you rarely use', 'Tap them → "Restricted" background usage'],
    howHi: ['सेटिंग्स → बैटरी → बैटरी उपयोग खोलें', 'सूची में ऊपर के कम-उपयोगी ऐप्स खोजें', 'उन्हें "प्रतिबंधित" बैकग्राउंड पर सेट करें'],
    icon: Zap,
  },
  {
    id: 'dark',
    name: 'Use dark theme (OLED screens)',
    nameHi: 'डार्क थीम उपयोग करें',
    why: 'On OLED/AMOLED screens (most Indian phones above ₹12,000), black pixels are literally switched off — a real, measurable battery saving.',
    whyHi: 'OLED/AMOLED स्क्रीन पर काले पिक्सेल बंद रहते हैं — यह वास्तविक बैटरी बचत है।',
    how: ['Open Settings → Display', 'Turn on "Dark theme"'],
    howHi: ['सेटिंग्स → डिस्प्ले खोलें', '"डार्क थीम" चालू करें'],
    icon: Moon,
  },
  {
    id: 'radios',
    name: 'Switch off unused radios',
    nameHi: 'अनुपयोगी रेडियो बंद करें',
    why: 'Bluetooth, hotspot, and GPS scanning drain battery even when idle — and open Bluetooth is also a security risk in public places.',
    whyHi: 'ब्लूटूथ, हॉटस्पॉट और GPS निष्क्रिय रहते हुए भी बैटरी खाते हैं — सार्वजनिक जगहों पर खुला ब्लूटूथ सुरक्षा जोखिम भी है।',
    how: ['Swipe down for Quick Settings', 'Turn off Bluetooth and Hotspot when not in use', 'Settings → Location → turn off "Wi-Fi/Bluetooth scanning"'],
    howHi: ['क्विक सेटिंग्स के लिए नीचे स्वाइप करें', 'उपयोग में न होने पर ब्लूटूथ और हॉटस्पॉट बंद करें', 'सेटिंग्स → लोकेशन → "स्कैनिंग" बंद करें'],
    icon: Wifi,
  },
];

function GuideCard({ step, lang, checked, onToggle }: {
  step: GuideStep; lang: 'en' | 'hi'; checked: boolean; onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = step.icon;
  return (
    <div className={`rounded-2xl border transition-all ${checked ? 'bg-green-500/10 border-green-500/40' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-4 p-5">
        <button
          onClick={onToggle}
          aria-label={checked ? 'Mark as not done' : 'Mark as done'}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition ${checked ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-green-400'}`}>
          {checked && <CheckCircle className="w-5 h-5 text-black" />}
        </button>
        <Icon className={`w-6 h-6 shrink-0 ${checked ? 'text-green-400' : 'text-teal-400'}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-bold ${checked ? 'text-green-300 line-through' : 'text-white'}`}>
            {lang === 'en' ? step.name : step.nameHi}
          </p>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-white p-1">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="px-5 pb-5 pt-0 ml-11">
          <p className="text-gray-400 text-sm mb-3">{lang === 'en' ? step.why : step.whyHi}</p>
          <ol className="space-y-2">
            {(lang === 'en' ? step.how : step.howHi).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                <span className="bg-teal-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function SystemTuneUp() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState<'tuneup' | 'battery'>('tuneup');
  const [metrics, setMetrics] = useState<TuneMetric[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadRealMetrics().then(real => setMetrics(real));
  }, []);

  const toggle = (id: string) => setDone(prev => ({ ...prev, [id]: !prev[id] }));

  const guide = activeTab === 'tuneup' ? CLEANUP_GUIDE : BATTERY_GUIDE;
  const doneCount = guide.filter(s => done[s.id]).length;

  const t = {
    en: {
      title: 'Device Health Check',
      subtitle: 'Real measurements + guided cleanup',
      tagline: 'No fake "boosting" — honest steps that actually work',
      metricsTitle: 'Live Device Metrics',
      metricsNote: 'Measured directly from your browser. If a value can\'t be measured on your device, it isn\'t shown.',
      metricsEmpty: 'Your browser doesn\'t expose device metrics. The guided checklist below still applies.',
      guideTitle: activeTab === 'tuneup' ? 'Guided Cleanup Checklist' : 'Real Battery Savings',
      progress: (d: number, total: number) => `${d} of ${total} steps done`,
      honestTitle: 'Why no "one-tap boost" button?',
      honestBody: 'No app can truly clear your phone\'s system cache or speed up the CPU — apps that claim a one-tap boost show fake numbers, and many are scams or adware. QuantumShield instead measures what is real and walks you through the cleanups that genuinely work.',
      tab1: 'Cleanup Guide',
      tab2: 'Battery Guide',
    },
    hi: {
      title: 'डिवाइस स्वास्थ्य जांच',
      subtitle: 'वास्तविक माप + निर्देशित सफाई',
      tagline: 'कोई नकली "बूस्टिंग" नहीं — ईमानदार कदम जो सच में काम करते हैं',
      metricsTitle: 'लाइव डिवाइस मेट्रिक्स',
      metricsNote: 'सीधे आपके ब्राउज़र से मापा गया। जो मापा नहीं जा सकता, वह दिखाया नहीं जाता।',
      metricsEmpty: 'आपका ब्राउज़र डिवाइस मेट्रिक्स नहीं देता। नीचे दी गई चेकलिस्ट फिर भी काम करती है।',
      guideTitle: activeTab === 'tuneup' ? 'निर्देशित सफाई चेकलिस्ट' : 'वास्तविक बैटरी बचत',
      progress: (d: number, total: number) => `${total} में से ${d} चरण पूर्ण`,
      honestTitle: '"वन-टैप बूस्ट" बटन क्यों नहीं?',
      honestBody: 'कोई भी ऐप वास्तव में आपके फोन का सिस्टम कैश साफ या CPU तेज़ नहीं कर सकता — "वन-टैप बूस्ट" का दावा करने वाले ऐप्स नकली आंकड़े दिखाते हैं, और कई स्कैम या एडवेयर होते हैं। QuantumShield वही मापता है जो असली है और आपको वे कदम बताता है जो सच में काम करते हैं।',
      tab1: 'सफाई गाइड',
      tab2: 'बैटरी गाइड',
    }
  }[lang];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <BackToHome />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/30 to-teal-500/30 border border-green-500/50 mb-6">
            <Zap className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-gray-300 font-bold mb-1">{t.subtitle}</p>
          <p className="text-gray-500">{t.tagline}</p>
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="mt-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition"
          >
            {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>
        </div>

        {/* Live Metrics — real values only */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-1">{t.metricsTitle}</h2>
          <p className="text-gray-500 text-sm mb-4">{t.metricsNote}</p>
          {metrics.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${m.color}`} />
                    <div className={`text-2xl font-black ${m.color}`}>{m.value}{m.unit}</div>
                    <div className="text-xs text-gray-400 mt-1">{lang === 'en' ? m.label : m.labelHi}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-gray-400 text-sm flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 text-blue-400" />
              {t.metricsEmpty}
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 bg-white/5 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveTab('tuneup')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tuneup' ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ {t.tab1}
          </button>
          <button
            onClick={() => setActiveTab('battery')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'battery' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            🔋 {t.tab2}
          </button>
        </div>

        {/* Guided checklist */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-lg">{t.guideTitle}</h2>
          <span className="text-sm text-gray-400">{t.progress(doneCount, guide.length)}</span>
        </div>
        <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-teal-400 transition-all duration-500"
            style={{ width: `${(doneCount / guide.length) * 100}%` }}
          />
        </div>
        <div className="space-y-3 mb-8">
          {guide.map((step) => (
            <GuideCard
              key={step.id}
              step={step}
              lang={lang}
              checked={Boolean(done[step.id])}
              onToggle={() => toggle(step.id)}
            />
          ))}
        </div>

        {/* Honesty note — turns the missing fake button into a trust + education moment */}
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" /> {t.honestTitle}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{t.honestBody}</p>
        </div>
      </div>
    </div>
  );
}
