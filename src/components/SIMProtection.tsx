'use client';
import { useState } from 'react';
import { Smartphone, PhoneForwarded, AlertTriangle, Shield, CheckCircle, XCircle, Copy, Phone } from 'lucide-react';

export default function SIMProtection({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [ussdCode, setUssdCode] = useState('');
  const [analysis, setAnalysis] = useState<{
    isDangerous: boolean;
    warning: string;
    action: string;
  } | null>(null);

  const content = {
    en: {
      title: '📱 SIM Swap & Call Forwarding Protection',
      subtitle: 'Protect yourself from SIM swap attacks and unauthorized call forwarding',
      
      whatIsSIMSwap: {
        title: '⚠️ What is SIM Swap Fraud?',
        description: 'Scammers get a duplicate SIM of your number by tricking telecom operators. They then receive ALL your calls and OTPs, giving them access to your bank accounts.',
        howItWorks: [
          'Scammer collects your Aadhaar/personal details (from data breaches)',
          'Visits telecom store with fake ID claiming "lost SIM"',
          'Gets duplicate SIM activated',
          'Your original SIM stops working',
          'They receive your banking OTPs',
          'Empty your bank account within minutes'
        ]
      },

      callForwarding: {
        title: '📞 Call Forwarding Scam (USSD Codes)',
        description: 'Scammers trick you into dialing USSD codes that forward your calls to them. They then intercept OTPs and verification calls.',
        dangerousCodes: [
          '*401*[number]# - Forwards all calls',
          '*404*[number]# - Forwards when unreachable',
          '*67*[number]# - Forwards when busy',
          '*62*[number]# - Forwards when no answer',
          '*21*[number]# - Unconditional forwarding'
        ],
        safeCodes: [
          '##002# - Cancel ALL call forwarding',
          '*#21# - Check current call forwarding status',
          '##21# - Deactivate call forwarding',
          '*#62# - Check if calls forwarded when unreachable'
        ]
      },

      ussdChecker: {
        title: '🔍 USSD Code Checker',
        placeholder: 'Enter the code someone asked you to dial (e.g., *401*9876543210#)',
        checkButton: 'Check Code Safety',
        safe: 'This code appears SAFE',
        dangerous: 'DANGER! This code is MALICIOUS',
        instructions: 'Never dial codes sent by strangers via SMS, WhatsApp, or calls'
      },

      protection: {
        title: '🛡️ How to Protect Yourself',
        steps: [
          'Enable SIM PIN lock on your phone (Settings → Security → SIM Lock)',
          'Register for UCC Portal at mnp.gov.in to track SIM changes',
          'Call your operator immediately if SIM shows "No Service" suddenly',
          'NEVER share Aadhaar OTP with anyone (even telecom staff)',
          'Set up email alerts for all banking transactions',
          'Enable 2FA on all accounts (not just SMS-based)',
          'Check call forwarding status regularly: Dial *#21#',
          'If someone asks you to dial ANY code - REFUSE and REPORT'
        ]
      },

      checkNow: {
        title: '✅ Check Your Phone NOW',
        checks: [
          {
            action: 'Check call forwarding status',
            code: '*#21#',
            instruction: 'Dial this and ensure "Voice call forwarding" shows as DISABLED'
          },
          {
            action: 'Disable all call forwarding',
            code: '##002#',
            instruction: 'Dial this to cancel any active call forwarding'
          },
          {
            action: 'Enable SIM PIN lock',
            code: 'Settings → Security',
            instruction: 'Requires PIN to use SIM even if moved to another phone'
          }
        ]
      },

      emergency: {
        title: '🚨 If You\'re Already Attacked',
        steps: [
          'Call your telecom operator immediately: Airtel 121, Jio 198, Vi 199, BSNL 1503',
          'Block your SIM and request new one',
          'Call your bank and freeze all accounts: Report unauthorized transactions',
          'File FIR at nearest cyber police station',
          'Call cybercrime helpline: 1930',
          'Check credit report for fraudulent loans'
        ]
      }
    },
    hi: {
      title: '📱 SIM स्वैप और कॉल फॉरवर्डिंग सुरक्षा',
      subtitle: 'SIM स्वैप हमलों और अनधिकृत कॉल फॉरवर्डिंग से खुद को बचाएं',
      
      whatIsSIMSwap: {
        title: '⚠️ SIM स्वैप धोखाधड़ी क्या है?',
        description: 'घोटालेबाज टेलीकॉम ऑपरेटरों को धोखा देकर आपके नंबर का डुप्लीकेट SIM प्राप्त करते हैं। फिर वे आपकी सभी कॉल और OTP प्राप्त करते हैं, जिससे उन्हें आपके बैंक खातों तक पहुंच मिल जाती है।',
        howItWorks: [
          'स्कैमर आपका आधार/व्यक्तिगत विवरण एकत्र करता है (डेटा उल्लंघन से)',
          'नकली ID के साथ टेलीकॉम स्टोर जाता है "खोया SIM" का दावा करते हुए',
          'डुप्लीकेट SIM सक्रिय कराता है',
          'आपका मूल SIM काम करना बंद कर देता है',
          'वे आपके बैंकिंग OTP प्राप्त करते हैं',
          'मिनटों में आपके बैंक खाते को खाली कर देते हैं'
        ]
      },

      callForwarding: {
        title: '📞 कॉल फॉरवर्डिंग घोटाला (USSD कोड)',
        description: 'घोटालेबाज आपको USSD कोड डायल करने के लिए धोखा देते हैं जो आपकी कॉल उन्हें फॉरवर्ड करते हैं। फिर वे OTP और सत्यापन कॉल को इंटरसेप्ट करते हैं।',
        dangerousCodes: [
          '*401*[नंबर]# - सभी कॉल फॉरवर्ड करता है',
          '*404*[नंबर]# - जब पहुंच से बाहर हो तो फॉरवर्ड करता है',
          '*67*[नंबर]# - जब व्यस्त हो तो फॉरवर्ड करता है',
          '*62*[नंबर]# - जब कोई जवाब न हो तो फॉरवर्ड करता है',
          '*21*[नंबर]# - बिना शर्त फॉरवर्डिंग'
        ],
        safeCodes: [
          '##002# - सभी कॉल फॉरवर्डिंग रद्द करें',
          '*#21# - वर्तमान कॉल फॉरवर्डिंग स्थिति जांचें',
          '##21# - कॉल फॉरवर्डिंग निष्क्रिय करें',
          '*#62# - जांचें कि क्या कॉल फॉरवर्ड हो रही हैं जब पहुंच से बाहर हो'
        ]
      },

      ussdChecker: {
        title: '🔍 USSD कोड जांचकर्ता',
        placeholder: 'वह कोड दर्ज करें जो किसी ने आपसे डायल करने के लिए कहा (उदा., *401*9876543210#)',
        checkButton: 'कोड सुरक्षा जांचें',
        safe: 'यह कोड सुरक्षित प्रतीत होता है',
        dangerous: 'खतरा! यह कोड दुर्भावनापूर्ण है',
        instructions: 'SMS, WhatsApp, या कॉल के माध्यम से अजनबियों द्वारा भेजे गए कोड कभी भी डायल न करें'
      },

      protection: {
        title: '🛡️ खुद को कैसे बचाएं',
        steps: [
          'अपने फोन पर SIM PIN लॉक सक्षम करें (सेटिंग्स → सुरक्षा → SIM लॉक)',
          'SIM परिवर्तन ट्रैक करने के लिए mnp.gov.in पर UCC पोर्टल के लिए पंजीकरण करें',
          'यदि SIM अचानक "कोई सेवा नहीं" दिखाए तो तुरंत अपने ऑपरेटर को कॉल करें',
          'किसी के साथ भी आधार OTP साझा न करें (यहां तक कि टेलीकॉम स्टाफ के साथ भी)',
          'सभी बैंकिंग लेनदेन के लिए ईमेल अलर्ट सेट करें',
          'सभी खातों पर 2FA सक्षम करें (केवल SMS-आधारित नहीं)',
          'नियमित रूप से कॉल फॉरवर्डिंग स्थिति जांचें: *#21# डायल करें',
          'यदि कोई आपसे कोई भी कोड डायल करने के लिए कहता है - मना करें और रिपोर्ट करें'
        ]
      },

      checkNow: {
        title: '✅ अभी अपने फोन की जांच करें',
        checks: [
          {
            action: 'कॉल फॉरवर्डिंग स्थिति जांचें',
            code: '*#21#',
            instruction: 'इसे डायल करें और सुनिश्चित करें कि "वॉयस कॉल फॉरवर्डिंग" अक्षम दिखाई दे'
          },
          {
            action: 'सभी कॉल फॉरवर्डिंग अक्षम करें',
            code: '##002#',
            instruction: 'किसी भी सक्रिय कॉल फॉरवर्डिंग को रद्द करने के लिए इसे डायल करें'
          },
          {
            action: 'SIM PIN लॉक सक्षम करें',
            code: 'सेटिंग्स → सुरक्षा',
            instruction: 'यहां तक कि अगर दूसरे फोन में ले जाया जाए तो भी SIM का उपयोग करने के लिए PIN की आवश्यकता होती है'
          }
        ]
      },

      emergency: {
        title: '🚨 यदि आप पहले से हमले का शिकार हैं',
        steps: [
          'तुरंत अपने टेलीकॉम ऑपरेटर को कॉल करें: Airtel 121, Jio 198, Vi 199, BSNL 1503',
          'अपना SIM ब्लॉक करें और नया मांगें',
          'अपने बैंक को कॉल करें और सभी खाते फ्रीज करें: अनधिकृत लेनदेन की रिपोर्ट करें',
          'निकटतम साइबर पुलिस स्टेशन में FIR दर्ज करें',
          'साइबर अपराध हेल्पलाइन पर कॉल करें: 1930',
          'धोखाधड़ी वाले ऋणों के लिए क्रेडिट रिपोर्ट जांचें'
        ]
      }
    }
  };

  const t = content[lang];

  // Dangerous USSD patterns
  const dangerousPatterns = [
    /\*401\*/i,  // Call forwarding unconditional
    /\*404\*/i,  // Call forwarding when unreachable
    /\*67\*/i,   // Call forwarding when busy
    /\*62\*/i,   // Call forwarding when no answer
    /\*21\*/i,   // Unconditional call forwarding
    /\*\*21\*/i, // Call forwarding
    /\*002\*/i   // Call forwarding setup
  ];

  const analyzeUSSD = () => {
    if (!ussdCode.trim()) {
      alert('Please enter a USSD code first');
      return;
    }

    const isDangerous = dangerousPatterns.some(pattern => pattern.test(ussdCode));

    if (isDangerous) {
      setAnalysis({
        isDangerous: true,
        warning: lang === 'en' 
          ? '⚠️ DANGER! This code will FORWARD your calls to another number. DO NOT DIAL IT!'
          : '⚠️ खतरा! यह कोड आपकी कॉल दूसरे नंबर पर फॉरवर्ड कर देगा। इसे डायल न करें!',
        action: lang === 'en'
          ? 'If someone asked you to dial this: 1) DO NOT dial it, 2) Block that number, 3) Report to 1930'
          : 'यदि किसी ने आपसे इसे डायल करने के लिए कहा: 1) इसे डायल न करें, 2) उस नंबर को ब्लॉक करें, 3) 1930 पर रिपोर्ट करें'
      });
    } else {
      setAnalysis({
        isDangerous: false,
        warning: lang === 'en'
          ? '✅ This code appears safe, but ONLY dial codes from official telecom sources.'
          : '✅ यह कोड सुरक्षित प्रतीत होता है, लेकिन केवल आधिकारिक टेलीकॉम स्रोतों से कोड डायल करें।',
        action: lang === 'en'
          ? 'Always verify codes from official telecom websites before dialing.'
          : 'डायल करने से पहले हमेशा आधिकारिक टेलीकॉम वेबसाइटों से कोड की पुष्टि करें।'
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-orange-100">{t.subtitle}</p>
      </div>

      {/* What is SIM Swap */}
      <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          {t.whatIsSIMSwap.title}
        </h2>
        <p className="text-gray-300 mb-4">{t.whatIsSIMSwap.description}</p>
        
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="font-bold mb-3">{lang === 'en' ? 'How the Attack Works:' : 'हमला कैसे काम करता है:'}</h3>
          <ol className="space-y-2">
            {t.whatIsSIMSwap.howItWorks.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Call Forwarding Scam */}
      <div className="bg-orange-600/20 border border-orange-500/50 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <PhoneForwarded className="w-6 h-6 text-orange-400" />
          {t.callForwarding.title}
        </h2>
        <p className="text-gray-300 mb-4">{t.callForwarding.description}</p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Dangerous Codes */}
          <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4">
            <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {lang === 'en' ? 'DANGEROUS Codes (NEVER dial):' : 'खतरनाक कोड (कभी डायल न करें):'}
            </h3>
            <ul className="space-y-2">
              {t.callForwarding.dangerousCodes.map((code, index) => (
                <li key={index} className="text-sm font-mono bg-black/30 p-2 rounded text-red-300">
                  {code}
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Codes */}
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
            <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {lang === 'en' ? 'SAFE Codes (Protection):' : 'सुरक्षित कोड (सुरक्षा):'}
            </h3>
            <ul className="space-y-2">
              {t.callForwarding.safeCodes.map((code, index) => (
                <li key={index} className="flex items-center justify-between bg-black/30 p-2 rounded">
                  <span className="text-sm font-mono text-green-300">{code}</span>
                  <button
                    onClick={() => copyCode(code.split(' - ')[0])}
                    className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded transition"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* USSD Code Checker */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{t.ussdChecker.title}</h2>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={ussdCode}
            onChange={(e) => setUssdCode(e.target.value)}
            placeholder={t.ussdChecker.placeholder}
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={analyzeUSSD}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            {t.ussdChecker.checkButton}
          </button>
        </div>

        {analysis && (
          <div className={`border rounded-lg p-4 ${
            analysis.isDangerous 
              ? 'bg-red-600/20 border-red-500/50'
              : 'bg-green-600/20 border-green-500/50'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              {analysis.isDangerous ? (
                <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
              )}
              <div>
                <h3 className={`font-bold text-lg mb-2 ${
                  analysis.isDangerous ? 'text-red-400' : 'text-green-400'
                }`}>
                  {analysis.warning}
                </h3>
                <p className="text-gray-300">{analysis.action}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-yellow-400 mt-4">
          ⚠️ {t.ussdChecker.instructions}
        </p>
      </div>

      {/* Check Now */}
      <div className="bg-emerald-600/20 border border-emerald-500/50 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{t.checkNow.title}</h2>
        
        <div className="space-y-4">
          {t.checkNow.checks.map((check, index) => (
            <div key={index} className="bg-black/30 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{check.action}</h3>
                  <p className="text-sm text-gray-400">{check.instruction}</p>
                </div>
<div className="flex gap-2">
                  <button
                    onClick={() => copyCode(check.code)}
                    className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  {check.code.startsWith('*') && (
         (
 		 <a           
                      href={`tel:${encodeURIComponent(check.code)}`}
                      className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Dial
                    </a>
	)
                  )}
                </div>
              </div>
              <div className="bg-emerald-600/20 px-3 py-2 rounded font-mono text-lg">
                {check.code}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protection Steps */}
      <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-400" />
          {t.protection.title}
        </h2>
        
        <ol className="space-y-3">
          {t.protection.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Emergency */}
      <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          {t.emergency.title}
        </h2>
        
        <ol className="space-y-3">
          {t.emergency.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}