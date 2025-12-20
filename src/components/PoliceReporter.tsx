'use client';
import { useState } from 'react';
import { Shield, Phone, Mail, MapPin, Send, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface ReportData {
  scamType: string;
  callerNumber?: string;
  callerName?: string;
  amountDemanded?: string;
  description: string;
  victimName: string;
  victimPhone: string;
  victimEmail: string;
  victimCity: string;
  victimState: string;
  hasEvidence: boolean;
}

export default function PoliceReporter({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [formData, setFormData] = useState<ReportData>({
    scamType: 'digital_arrest',
    description: '',
    victimName: '',
    victimPhone: '',
    victimEmail: '',
    victimCity: '',
    victimState: '',
    hasEvidence: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      title: '🚨 Report to Police',
      subtitle: 'File official complaint to National Cybercrime Helpline',
      scamType: 'Type of Scam',
      scamTypes: {
        digital_arrest: 'Digital Arrest Scam',
        fake_kyc: 'Fake KYC Update',
        upi_fraud: 'UPI/Payment Fraud',
        lottery: 'Lottery/Prize Scam',
        job: 'Fake Job Offer',
        investment: 'Investment Fraud',
        other: 'Other'
      },
      scamDetails: 'Scam Details',
      callerNumber: "Scammer's Phone Number",
      callerName: "Scammer's Name (if known)",
      amountDemanded: 'Amount Demanded (₹)',
      description: 'What Happened? (Details)',
      descriptionPlaceholder: 'Describe the scam: what they said, what they threatened, what they asked for...',
      yourDetails: 'Your Details',
      yourName: 'Your Full Name',
      yourPhone: 'Your Phone Number',
      yourEmail: 'Your Email',
      yourCity: 'Your City',
      yourState: 'Your State',
      hasEvidence: 'I have collected evidence (screenshots/recordings)',
      submit: 'Submit Police Report',
      submitting: 'Submitting...',
      emergencyContacts: 'Emergency Contacts',
      cybercrimeHelpline: 'National Cybercrime Helpline',
      cybercrimePortal: 'Cybercrime Reporting Portal',
      localPolice: 'Local Police (Emergency)',
      successTitle: '✅ Report Submitted Successfully!',
      successMessage: 'Your complaint has been registered. You will receive a confirmation via SMS/Email.',
      nextSteps: 'Next Steps',
      steps: [
        'Save your complaint reference number',
        'Check your email for confirmation',
        'Upload evidence to the portal if you have any',
        'Follow up with local police station if needed',
        'Block the scammer\'s number immediately'
      ],
      referenceNumber: 'Reference Number',
      downloadReceipt: 'Download Receipt',
      reportAnother: 'Report Another Scam'
    },
    hi: {
      title: '🚨 पुलिस को रिपोर्ट करें',
      subtitle: 'राष्ट्रीय साइबर अपराध हेल्पलाइन पर आधिकारिक शिकायत दर्ज करें',
      scamType: 'घोटाले का प्रकार',
      scamTypes: {
        digital_arrest: 'डिजिटल अरेस्ट घोटाला',
        fake_kyc: 'फर्जी KYC अपडेट',
        upi_fraud: 'UPI/पेमेंट धोखाधड़ी',
        lottery: 'लॉटरी/इनाम घोटाला',
        job: 'नकली नौकरी का प्रस्ताव',
        investment: 'निवेश धोखाधड़ी',
        other: 'अन्य'
      },
      scamDetails: 'घोटाले का विवरण',
      callerNumber: 'स्कैमर का फोन नंबर',
      callerName: 'स्कैमर का नाम (यदि पता हो)',
      amountDemanded: 'मांगी गई रकम (₹)',
      description: 'क्या हुआ? (विवरण)',
      descriptionPlaceholder: 'घोटाले का वर्णन करें: उन्होंने क्या कहा, क्या धमकी दी, क्या मांगा...',
      yourDetails: 'आपका विवरण',
      yourName: 'आपका पूरा नाम',
      yourPhone: 'आपका फोन नंबर',
      yourEmail: 'आपका ईमेल',
      yourCity: 'आपका शहर',
      yourState: 'आपका राज्य',
      hasEvidence: 'मेरे पास सबूत हैं (स्क्रीनशॉट/रिकॉर्डिंग)',
      submit: 'पुलिस रिपोर्ट जमा करें',
      submitting: 'जमा हो रहा है...',
      emergencyContacts: 'आपातकालीन संपर्क',
      cybercrimeHelpline: 'राष्ट्रीय साइबर अपराध हेल्पलाइन',
      cybercrimePortal: 'साइबर अपराध रिपोर्टिंग पोर्टल',
      localPolice: 'स्थानीय पुलिस (आपातकाल)',
      successTitle: '✅ रिपोर्ट सफलतापूर्वक जमा हो गई!',
      successMessage: 'आपकी शिकायत दर्ज हो गई है। आपको SMS/Email के माध्यम से पुष्टि प्राप्त होगी।',
      nextSteps: 'अगले कदम',
      steps: [
        'अपना शिकायत संदर्भ नंबर सहेजें',
        'पुष्टि के लिए अपना ईमेल चेक करें',
        'यदि आपके पास कोई सबूत है तो पोर्टल पर अपलोड करें',
        'यदि आवश्यक हो तो स्थानीय पुलिस स्टेशन से संपर्क करें',
        'स्कैमर का नंबर तुरंत ब्लॉक करें'
      ],
      referenceNumber: 'संदर्भ संख्या',
      downloadReceipt: 'रसीद डाउनलोड करें',
      reportAnother: 'एक और घोटाला रिपोर्ट करें'
    }
  };

  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call (replace with actual cybercrime.gov.in API when available)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would call:
      // const response = await fetch('https://cybercrime.gov.in/api/report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // For now, generate a mock reference number
      const referenceNumber = `QS${Date.now().toString().slice(-8)}`;
      
      // Store in localStorage as backup
      const reportRecord = {
        ...formData,
        referenceNumber,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`scam-report-${referenceNumber}`, JSON.stringify(reportRecord));

      setSubmitted(true);
      setLoading(false);

      // Optional: Send email notification (backend needed)
      // await sendEmailNotification(formData.victimEmail, referenceNumber);

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed. Please try reporting directly at cybercrime.gov.in or call 1930.');
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    const receipt = {
      title: 'Scam Report Receipt',
      submittedAt: new Date().toISOString(),
      ...formData
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scam-report-receipt-${Date.now()}.json`;
    a.click();
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center mb-6">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t.successTitle}</h2>
          <p>{t.successMessage}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-400 mb-1">{t.referenceNumber}</div>
            <div className="text-3xl font-bold text-green-400">
              QS{Date.now().toString().slice(-8)}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">{t.nextSteps}</h3>
          <ol className="space-y-3">
            {t.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={downloadReceipt}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            {t.downloadReceipt}
          </button>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            {t.reportAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-red-100">{t.subtitle}</p>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">{t.emergencyContacts}</h3>
        
        <div className="space-y-3">
          
            href="tel:1930"
            className="flex items-center gap-3 bg-red-600/20 border border-red-500/50 rounded-lg p-4 hover:bg-red-600/30 transition"
          >
            <Phone className="w-5 h-5 text-red-400" />
            <div>
              <div className="font-semibold">{t.cybercrimeHelpline}</div>
              <div className="text-2xl font-bold text-red-400">1930</div>
            </div>
          </a>

          
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-blue-600/20 border border-blue-500/50 rounded-lg p-4 hover:bg-blue-600/30 transition"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-semibold">{t.cybercrimePortal}</div>
                <div className="text-sm text-gray-400">cybercrime.gov.in</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-blue-400" />
          </a>

          
            href="tel:100"
            className="flex items-center gap-3 bg-orange-600/20 border border-orange-500/50 rounded-lg p-4 hover:bg-orange-600/30 transition"
          >
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <div className="font-semibold">{t.localPolice}</div>
              <div className="text-2xl font-bold text-orange-400">100</div>
            </div>
          </a>
        </div>
      </div>

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scam Type */}
        <div className="bg-white/5 rounded-xl p-6">
          <label className="block font-bold mb-3">{t.scamType}</label>
          <select
            value={formData.scamType}
            onChange={(e) => setFormData({...formData, scamType: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            required
          >
            {Object.entries(t.scamTypes).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>

        {/* Scam Details */}
        <div className="bg-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-lg">{t.scamDetails}</h3>
          
          <div>
            <label className="block mb-2">{t.callerNumber}</label>
            <input
              type="tel"
              value={formData.callerNumber || ''}
              onChange={(e) => setFormData({...formData, callerNumber: e.target.value})}
              placeholder="+91 98765 43210"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2">{t.callerName}</label>
            <input
              type="text"
              value={formData.callerName || ''}
              onChange={(e) => setFormData({...formData, callerName: e.target.value})}
              placeholder="Officer Sharma, CBI, etc."
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2">{t.amountDemanded}</label>
            <input
              type="number"
              value={formData.amountDemanded || ''}
              onChange={(e) => setFormData({...formData, amountDemanded: e.target.value})}
              placeholder="50000"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2">{t.description} *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t.descriptionPlaceholder}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 min-h-32 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Your Details */}
        <div className="bg-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-lg">{t.yourDetails}</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">{t.yourName} *</label>
              <input
                type="text"
                value={formData.victimName}
                onChange={(e) => setFormData({...formData, victimName: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2">{t.yourPhone} *</label>
              <input
                type="tel"
                value={formData.victimPhone}
                onChange={(e) => setFormData({...formData, victimPhone: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">{t.yourEmail} *</label>
            <input
              type="email"
              value={formData.victimEmail}
              onChange={(e) => setFormData({...formData, victimEmail: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">{t.yourCity} *</label>
              <input
                type="text"
                value={formData.victimCity}
                onChange={(e) => setFormData({...formData, victimCity: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2">{t.yourState} *</label>
              <input
                type="text"
                value={formData.victimState}
                onChange={(e) => setFormData({...formData, victimState: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasEvidence}
              onChange={(e) => setFormData({...formData, hasEvidence: e.target.checked})}
              className="w-5 h-5"
            />
            <span>{t.hasEvidence}</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition"
        >
          <Send className="w-6 h-6" />
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}