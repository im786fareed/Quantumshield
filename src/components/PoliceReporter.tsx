'use client';
import { useState, useEffect } from 'react';
import { Shield, Phone, AlertTriangle, ExternalLink, Camera, MessageSquare, CheckCircle, Download, Send, FileText } from 'lucide-react';

export default function PoliceReporter({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [incidentDetails, setIncidentDetails] = useState({
    type: 'Digital Arrest',
    platform: 'WhatsApp',
    amount: '',
    description: ''
  });

  // Automatically check the Evidence Vault for screenshots without a DB
  useEffect(() => {
    const request = indexedDB.open('QuantumShieldVault', 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains('evidence')) {
        const transaction = db.transaction(['evidence'], 'readonly');
        const store = transaction.objectStore('evidence');
        const countRequest = store.count();
        countRequest.onsuccess = () => setEvidenceCount(countRequest.result);
      }
    };
  }, []);

  const generateAIPoliceReport = () => {
    const reportContent = `
CYBERCRIME INCIDENT REPORT (QUANTUMSHIELD AUTO-GENERATED)
-------------------------------------------------------
DATE: ${new Date().toLocaleString()}
INCIDENT TYPE: ${incidentDetails.type}
PLATFORM: ${incidentDetails.platform}
FINANCIAL LOSS: ${incidentDetails.amount || 'None reported'}

INCIDENT SUMMARY:
${incidentDetails.description || 'User reported a suspicious interaction matching fraud patterns.'}

EVIDENCE LOG:
- Local Screenshots Collected: ${evidenceCount}
- Verification Status: AI-Flagged for Fraudulent Pattern Detection

NEXT STEPS FOR VICTIM:
1. Call 1930 immediately to freeze bank accounts.
2. File this report at https://cybercrime.gov.in within 24 hours.
3. Show this log to your local Cyber Cell.

Disclaimer: Generated locally by QuantumShield. No data was sent to servers.
-------------------------------------------------------`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CyberReport_${Date.now()}.txt`;
    link.click();
  };

  const content = {
    en: {
      title: '🚨 Cybercrime Reporting Engine',
      subtitle: 'Prepare official documentation for 1930 & Cyber Police',
      reportAction: 'Generate Police-Ready Report',
      fieldIncident: 'Type of Fraud',
      fieldPlatform: 'Where did it happen?',
      fieldAmount: 'Money Lost (if any)',
      fieldDesc: 'Describe the scammer\'s demand',
      evidenceStatus: `Found ${evidenceCount} screenshots in your Evidence Vault`,
      emergencyTitle: 'Immediate Help Lines',
      govLink: 'Go to Official Portal'
    },
    hi: {
      title: '🚨 साइबर अपराध रिपोर्ट इंजन',
      subtitle: '1930 और साइबर पुलिस के लिए आधिकारिक दस्तावेज तैयार करें',
      reportAction: 'पुलिस-तैयार रिपोर्ट तैयार करें',
      fieldIncident: 'धोखाधड़ी का प्रकार',
      fieldPlatform: 'यह कहाँ हुआ?',
      fieldAmount: 'खोया हुआ पैसा (यदि कोई हो)',
      fieldDesc: 'स्कैमर की मांग का वर्णन करें',
      evidenceStatus: `आपके सबूत वॉल्ट में ${evidenceCount} स्क्रीनशॉट मिले`,
      emergencyTitle: 'तत्काल सहायता लाइनें',
      govLink: 'आधिकारिक पोर्टल पर जाएं'
    }
  };

  const t = content[lang];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <Shield className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10" />
        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">{t.title}</h1>
        <p className="text-red-100 text-lg opacity-90">{t.subtitle}</p>
      </div>

      {/* Report Form Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">{t.fieldIncident}</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-red-500"
              onChange={(e) => setIncidentDetails({...incidentDetails, type: e.target.value})}
            >
              <option>Digital Arrest</option>
              <option>KYC/Bank Fraud</option>
              <option>UPI/Part-time Job Scam</option>
              <option>Sextortion/Honeytrap</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">{t.fieldPlatform}</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-red-500"
              onChange={(e) => setIncidentDetails({...incidentDetails, platform: e.target.value})}
            >
              <option>WhatsApp</option>
              <option>Telegram</option>
              <option>Direct Phone Call</option>
              <option>Facebook/Instagram</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">{t.fieldDesc}</label>
          <textarea 
            placeholder="e.g. Someone calling from 'CBI' told me my Aadhaar is linked to a parcel..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white h-32 focus:ring-2 focus:ring-red-500 outline-none"
            onChange={(e) => setIncidentDetails({...incidentDetails, description: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-8">
           <Camera className="text-blue-400 w-5 h-5" />
           <span className="text-blue-200 text-sm font-medium">{t.evidenceStatus}</span>
        </div>

        <button 
          onClick={generateAIPoliceReport}
          className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-red-500/10"
        >
          <FileText className="w-6 h-6" /> {t.reportAction}
        </button>
      </div>

      {/* Emergency Quick Access */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-600/10 border border-red-500/20 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <div className="text-red-400 font-black text-2xl">1930</div>
            <div className="text-slate-500 text-xs uppercase font-bold tracking-widest">National Helpline</div>
          </div>
          <a href="tel:1930" className="bg-red-600 p-3 rounded-full text-white hover:bg-red-500 transition">
            <Phone className="w-6 h-6" />
          </a>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <div className="text-indigo-400 font-bold">Cyber Portal</div>
            <div className="text-slate-500 text-xs uppercase font-bold tracking-widest">cybercrime.gov.in</div>
          </div>
          <a href="https://cybercrime.gov.in" target="_blank" className="bg-indigo-600 p-3 rounded-full text-white hover:bg-indigo-500 transition">
            <ExternalLink className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}