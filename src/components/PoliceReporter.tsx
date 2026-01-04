'use client';
import { Shield, Phone, AlertTriangle, ExternalLink, Camera, MessageSquare, CheckCircle } from 'lucide-react';

export default function PoliceReporter({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const content = {
    en: {
      title: '🚨 How to Report Cybercrime',
      subtitle: 'Step-by-step guide to file official complaints with Government authorities',
      emergencyTitle: 'Report Immediately',
      step1Title: 'Step 1: Gather Evidence',
      step1Desc: 'Collect all proof before calling authorities',
      step2Title: 'Step 2: Contact Authorities',
      step2Desc: 'Call 1930 or visit cybercrime.gov.in to file official complaint',
      step3Title: 'Step 3: Follow Up',
      step3Desc: 'Save your complaint number and follow up with local police if needed',
      evidenceTitle: '📋 What Evidence to Collect',
      evidenceItems: [
        'Screenshots of suspicious messages, emails, or websites',
        'Call recordings (if available) - Note: Recording may require consent',
        'Phone numbers and caller IDs of scammers',
        'Transaction IDs, UPI references, or payment receipts',
        'Email addresses, social media profiles of scammers',
        'Date and time of all incidents',
        'Amount of money demanded or lost'
      ],
      cybercrimeHelpline: 'National Cybercrime Helpline',
      cybercrimePortal: 'Cybercrime Reporting Portal',
      localPolice: 'Local Police Emergency',
      reportingTips: '💡 Important Tips',
      tips: [
        'Never delay - Report immediately after detecting fraud',
        'Do NOT pay any money to scammers',
        'Block suspicious numbers and email addresses immediately',
        'Change passwords if you shared any credentials',
        'Inform your bank immediately if money was transferred',
        'Keep all evidence safe - do not delete anything',
        'Note down the complaint reference number for follow-up'
      ],
      whatToTell: '📞 What to Tell Authorities',
      tellItems: [
        'Type of scam (Digital Arrest, KYC fraud, UPI fraud, etc.)',
        'How you were contacted (call, SMS, email, social media)',
        'What the scammer said or demanded',
        'Any money lost or demanded',
        'Scammer phone number, name, or identifiers',
        'Your contact details for follow-up'
      ],
      disclaimer: '⚠️ Important Notice',
      disclaimerText: 'QuantumShield is an educational platform. We do NOT collect reports or investigate fraud. Always report directly to government authorities via 1930 or cybercrime.gov.in. Your safety is their responsibility.'
    },
    hi: {
      title: '🚨 साइबर अपराध की रिपोर्ट कैसे करें',
      subtitle: 'सरकारी अधिकारियों को शिकायत दर्ज करने के लिए चरण-दर-चरण मार्गदर्शिका',
      emergencyTitle: 'तुरंत रिपोर्ट करें',
      step1Title: 'चरण 1: सबूत इकट्ठा करें',
      step1Desc: 'अधिकारियों को कॉल करने से पहले सभी प्रमाण एकत्र करें',
      step2Title: 'चरण 2: अधिकारियों से संपर्क करें',
      step2Desc: 'आधिकारिक शिकायत दर्ज करने के लिए 1930 पर कॉल करें या cybercrime.gov.in पर जाएं',
      step3Title: 'चरण 3: फॉलो अप करें',
      step3Desc: 'अपना शिकायत नंबर सुरक्षित रखें और यदि आवश्यक हो तो स्थानीय पुलिस से फॉलो अप करें',
      evidenceTitle: '📋 कौन से सबूत इकट्ठा करें',
      evidenceItems: [
        'संदिग्ध संदेशों, ईमेल या वेबसाइटों के स्क्रीनशॉट',
        'कॉल रिकॉर्डिंग (यदि उपलब्ध हो)',
        'स्कैमर के फोन नंबर और कॉलर आईडी',
        'लेनदेन आईडी, UPI संदर्भ, या भुगतान रसीदें',
        'स्कैमर के ईमेल पते, सोशल मीडिया प्रोफाइल',
        'सभी घटनाओं की तारीख और समय',
        'मांगी गई या खोई हुई धनराशि'
      ],
      cybercrimeHelpline: 'राष्ट्रीय साइबर अपराध हेल्पलाइन',
      cybercrimePortal: 'साइबर अपराध रिपोर्टिंग पोर्टल',
      localPolice: 'स्थानीय पुलिस आपातकाल',
      reportingTips: '💡 महत्वपूर्ण सुझाव',
      tips: [
        'कभी देर न करें - धोखाधड़ी का पता लगने के तुरंत बाद रिपोर्ट करें',
        'स्कैमर को कोई पैसा न दें',
        'संदिग्ध नंबर और ईमेल पते तुरंत ब्लॉक करें',
        'यदि आपने कोई क्रेडेंशियल शेयर किया है तो पासवर्ड बदलें',
        'यदि पैसे ट्रांसफर हुए हैं तो तुरंत अपने बैंक को सूचित करें',
        'सभी सबूत सुरक्षित रखें - कुछ भी न हटाएं',
        'फॉलो-अप के लिए शिकायत संदर्भ संख्या नोट करें'
      ],
      whatToTell: '📞 अधिकारियों को क्या बताएं',
      tellItems: [
        'घोटाले का प्रकार (डिजिटल अरेस्ट, KYC धोखाधड़ी, UPI धोखाधड़ी, आदि)',
        'आपसे कैसे संपर्क किया गया (कॉल, SMS, ईमेल, सोशल मीडिया)',
        'स्कैमर ने क्या कहा या मांगा',
        'खोई गई या मांगी गई कोई राशि',
        'स्कैमर का फोन नंबर, नाम, या पहचानकर्ता',
        'फॉलो-अप के लिए आपका संपर्क विवरण'
      ],
      disclaimer: '⚠️ महत्वपूर्ण सूचना',
      disclaimerText: 'QuantumShield एक शैक्षिक मंच है। हम रिपोर्ट एकत्र नहीं करते या धोखाधड़ी की जांच नहीं करते। हमेशा 1930 या cybercrime.gov.in के माध्यम से सीधे सरकारी अधिकारियों को रिपोर्ट करें। आपकी सुरक्षा उनकी जिम्मेदारी है।'
    }
  };

  const t = content[lang];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8 mb-8 text-white text-center">
        <h1 className="text-4xl font-bold mb-3">{t.title}</h1>
        <p className="text-lg text-red-100">{t.subtitle}</p>
      </div>

      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-red-400" />
          {t.emergencyTitle}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="tel:1930" className="flex flex-col items-center gap-3 bg-red-600/30 border border-red-500/50 rounded-lg p-6 hover:bg-red-600/40 transition text-center">
            <Phone className="w-10 h-10 text-red-400" />
            <div>
              <div className="font-bold text-lg">{t.cybercrimeHelpline}</div>
              <div className="text-3xl font-bold text-red-400 my-2">1930</div>
              <div className="text-sm text-gray-400">Toll-Free 24/7</div>
            </div>
          </a>

          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 bg-blue-600/30 border border-blue-500/50 rounded-lg p-6 hover:bg-blue-600/40 transition text-center">
            <Shield className="w-10 h-10 text-blue-400" />
            <div>
              <div className="font-bold text-lg">{t.cybercrimePortal}</div>
              <div className="text-lg font-semibold text-blue-400 my-2">cybercrime.gov.in</div>
              <div className="text-sm text-gray-400 flex items-center gap-1 justify-center">
                Online Portal <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </a>

          <a href="tel:100" className="flex flex-col items-center gap-3 bg-orange-600/30 border border-orange-500/50 rounded-lg p-6 hover:bg-orange-600/40 transition text-center">
            <AlertTriangle className="w-10 h-10 text-orange-400" />
            <div>
              <div className="font-bold text-lg">{t.localPolice}</div>
              <div className="text-3xl font-bold text-orange-400 my-2">100</div>
              <div className="text-sm text-gray-400">Emergency</div>
            </div>
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
          <h3 className="text-xl font-bold mb-2">{t.step1Title}</h3>
          <p className="text-gray-400">{t.step1Desc}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
          <h3 className="text-xl font-bold mb-2">{t.step2Title}</h3>
          <p className="text-gray-400">{t.step2Desc}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
          <h3 className="text-xl font-bold mb-2">{t.step3Title}</h3>
          <p className="text-gray-400">{t.step3Desc}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-400" />
          {t.evidenceTitle}
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {t.evidenceItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3 bg-black/30 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          {t.whatToTell}
        </h2>
        <ul className="space-y-2">
          {t.tellItems.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-purple-400 font-bold mt-1">•</span>
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">{t.reportingTips}</h2>
        <div className="space-y-3">
          {t.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 bg-black/30 p-3 rounded-lg">
              <span className="text-yellow-400 text-xl shrink-0">💡</span>
              <span className="text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-600/10 border-2 border-red-500/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-3 text-red-400">{t.disclaimer}</h3>
        <p className="text-gray-300 leading-relaxed">{t.disclaimerText}</p>
      </div>
    </div>
  );
}