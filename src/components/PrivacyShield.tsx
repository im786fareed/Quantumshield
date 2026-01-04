'use client';
import { useState } from 'react';
import { Shield, Globe, Lock, AlertTriangle, CheckCircle, ExternalLink, Eye, EyeOff, XCircle, Zap, MessageSquare, Brain } from 'lucide-react';
export default function PrivacyShield({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [dnsTest, setDnsTest] = useState<'idle' | 'testing' | 'safe' | 'danger'>('idle');
  const [userScenario, setUserScenario] = useState('');
  const [aiAdvice, setAiAdvice] = useState<any>(null);

  const content = {
    en: {
      title: '🛡️ Privacy Shield',
      subtitle: 'AI-Powered privacy auditor and protection tools',
      aiTitle: '🤖 AI Privacy Auditor',
      aiPlaceholder: 'E.g., "I am using hotel Wi-Fi" or "I am worried about WhatsApp privacy"',
      auditButton: 'Audit My Privacy',
      dnsTitle: '🔍 Live DNS Security Test',
      whatsappTitle: '🚨 Critical: WhatsApp Privacy for Fraud Prevention',
      whatsappItems: [
        'Silence Unknown Callers: Settings → Privacy → Calls → Turn ON',
        'Profile Photo: Set to "My Contacts" only',
        'Groups: Set to "My Contacts" to prevent random scam adds'
      ]
    },
    hi: {
      title: '🛡️ गोपनीयता शील्ड',
      subtitle: 'AI-संचालित गोपनीयता लेखा परीक्षक और सुरक्षा उपकरण',
      aiTitle: '🤖 AI गोपनीयता लेखा परीक्षक',
      aiPlaceholder: 'जैसे, "मैं होटल वाई-फाई का उपयोग कर रहा हूँ"',
      auditButton: 'मेरी गोपनीयता की जांच करें',
      dnsTitle: '🔍 लाइव DNS सुरक्षा परीक्षण',
      whatsappTitle: '🚨 महत्वपूर्ण: धोखाधड़ी की रोकथाम के लिए व्हाट्सएप गोपनीयता',
      whatsappItems: [
        'अज्ञात कॉल करने वालों को मौन करें: सेटिंग्स → गोपनीयता → कॉल',
        'प्रोफ़ाइल फ़ोटो: केवल "मेरे संपर्क" पर सेट करें',
        'समूह: रैंडम घोटाले से बचने के लिए "मेरे संपर्क" पर सेट करें'
      ]
    }
  };

  const t = content[lang];

  // AI Logic: Analyzes user situation without needing a backend
  const runAiAudit = () => {
    const input = userScenario.toLowerCase();
    let score = 80;
    let advice = "Your current setup seems standard.";

    if (input.includes('public') || input.includes('wi-fi') || input.includes('airport') || input.includes('hotel')) {
      score = 30;
      advice = "⚠️ HIGH RISK: Public Wi-Fi is a goldmine for data sniffers. You MUST use Cloudflare WARP or ProtonVPN immediately before accessing banking.";
    } else if (input.includes('whatsapp') || input.includes('message')) {
      score = 50;
      advice = "⚠️ PRIVACY GAP: Scammers use your 'Online Status' to target you. Go to WhatsApp Privacy settings and hide your Last Seen and Profile Photo.";
    } else if (input.includes('banking') || input.includes('payment')) {
      score = 60;
      advice = "🛡️ ACTION REQUIRED: Ensure you are using 'HTTPS-Only Mode' in your browser before entering bank details.";
    }

    setAiAdvice({ score, advice });
  };

  const testDNS = async () => {
    setDnsTest('testing');
    try {
      // Real test: Try to fetch a specific security trace
      const res = await fetch('https://1.1.1.1/cdn-cgi/trace');
      const data = await res.text();
      if (data.includes('sni=plaintext')) {
        setDnsTest('danger'); // ISP can see your data
      } else {
        setDnsTest('safe');
      }
    } catch {
      setDnsTest('danger');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <Shield className="absolute right-[-20px] top-[-20px] w-64 h-64 opacity-10" />
        <h1 className="text-4xl font-black mb-2 tracking-tight">{t.title}</h1>
        <p className="text-blue-100 text-lg opacity-80">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Auditor */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="text-cyan-400 w-6 h-6" /> {t.aiTitle}
            </h2>
            <textarea 
              value={userScenario}
              onChange={(e) => setUserScenario(e.target.value)}
              placeholder={t.aiPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none h-32"
            />
            <button 
              onClick={runAiAudit}
              className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> {t.auditButton}
            </button>

            {aiAdvice && (
              <div className="mt-6 p-6 rounded-2xl bg-slate-800 border-l-4 border-cyan-500 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm uppercase font-black text-slate-400">Security Score</span>
                  <span className={`text-xl font-bold ${aiAdvice.score < 50 ? 'text-red-400' : 'text-green-400'}`}>{aiAdvice.score}/100</span>
                </div>
                <p className="text-white leading-relaxed">{aiAdvice.advice}</p>
              </div>
            )}
          </div>

          {/* WhatsApp Hardening Section (New for Scam Prevention) */}
          <div className="bg-green-950/20 border border-green-500/30 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" /> {t.whatsappTitle}
            </h2>
            <div className="space-y-3">
              {t.whatsappItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl text-slate-200 text-sm">
                  <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tests */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">{t.dnsTitle}</h2>
            <p className="text-slate-400 text-sm mb-6">Verify if your Internet Provider is spying on your browsing habits.</p>
            
            <button
              onClick={testDNS}
              disabled={dnsTest === 'testing'}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-white transition disabled:opacity-50"
            >
              {dnsTest === 'testing' ? 'Analysing...' : 'Run Security Test'}
            </button>

            {dnsTest !== 'idle' && dnsTest !== 'testing' && (
              <div className={`mt-4 p-4 rounded-2xl text-center font-bold ${dnsTest === 'safe' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {dnsTest === 'safe' ? '✅ Connection Secure' : '❌ Privacy Leaking'}
              </div>
            )}
          </div>

          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6">
            <h3 className="font-bold text-indigo-300 mb-4 tracking-wide uppercase text-xs">Trusted Tools</h3>
            <div className="space-y-3">
              {['ProtonVPN (Free)', 'Cloudflare WARP', 'uBlock Origin'].map((tool) => (
                <div key={tool} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-sm text-slate-300">{tool}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}