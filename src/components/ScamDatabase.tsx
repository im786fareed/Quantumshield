'use client';
import { useState, useEffect } from 'react';
import { Phone, AlertTriangle, Search, TrendingUp, Users, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ScamReport {
  id: string;
  phoneNumber: string;
  scamType: string;
  reportedBy: string;
  timestamp: number;
  description: string;
  verified: boolean;
  reportCount: number;
}

interface ScamStats {
  totalReports: number;
  verifiedScams: number;
  topScamType: string;
  recentReports: number;
}

export default function ScamDatabase({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [searchNumber, setSearchNumber] = useState('');
  const [searchResult, setSearchResult] = useState<ScamReport | null>(null);
  const [recentReports, setRecentReports] = useState<ScamReport[]>([]);
  const [stats, setStats] = useState<ScamStats>({
    totalReports: 0,
    verifiedScams: 0,
    topScamType: 'digital_arrest',
    recentReports: 0
  });
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    phoneNumber: '',
    scamType: 'digital_arrest',
    description: '',
    reportedBy: ''
  });

  const content = {
    en: {
      title: '📊 Scam Number Database',
      subtitle: 'Community-powered scam number reporting and verification',
      searchPlaceholder: 'Enter phone number to check',
      searchButton: 'Check Number',
      reportNumber: 'Report a Scam Number',
      stats: {
        totalReports: 'Total Reports',
        verifiedScams: 'Verified Scams',
        topScamType: 'Top Scam Type',
        recentReports: '24hr Reports'
      },
      scamTypes: {
        digital_arrest: 'Digital Arrest',
        fake_kyc: 'Fake KYC',
        upi_fraud: 'UPI Fraud',
        lottery: 'Lottery Scam',
        job: 'Fake Job',
        investment: 'Investment Fraud',
        loan: 'Loan Scam',
        other: 'Other'
      },
      resultSafe: '✅ No Reports Found',
      resultSafeDesc: 'This number has not been reported as a scam',
      resultDanger: '⚠️ SCAM ALERT!',
      resultDangerDesc: 'This number has been reported multiple times',
      reportCount: 'reports',
      verified: 'Verified by Community',
      unverified: 'Pending Verification',
      lastReported: 'Last Reported',
      scamType: 'Scam Type',
      description: 'Description',
      recentReportsTitle: 'Recent Scam Reports',
      noReports: 'No recent reports',
      reportForm: {
        title: 'Report Scam Number',
        phoneNumber: 'Scammer Phone Number',
        scamType: 'Type of Scam',
        description: 'What Happened?',
        descriptionPlaceholder: 'Describe how they contacted you and what they tried to do...',
        yourName: 'Your Name (Optional)',
        yourNamePlaceholder: 'Anonymous',
        submit: 'Submit Report',
        cancel: 'Cancel'
      },
      successMessage: '✅ Report submitted! Thank you for helping the community.',
      warningMessage: '⚠️ False reports can lead to legal action. Only report genuine scams.'
    },
    hi: {
      title: '📊 घोटाला नंबर डेटाबेस',
      subtitle: 'समुदाय-संचालित घोटाला नंबर रिपोर्टिंग और सत्यापन',
      searchPlaceholder: 'जांच के लिए फोन नंबर दर्ज करें',
      searchButton: 'नंबर जांचें',
      reportNumber: 'घोटाला नंबर रिपोर्ट करें',
      stats: {
        totalReports: 'कुल रिपोर्ट',
        verifiedScams: 'सत्यापित घोटाले',
        topScamType: 'शीर्ष घोटाला प्रकार',
        recentReports: '24 घंटे की रिपोर्ट'
      },
      scamTypes: {
        digital_arrest: 'डिजिटल अरेस्ट',
        fake_kyc: 'फर्जी KYC',
        upi_fraud: 'UPI धोखाधड़ी',
        lottery: 'लॉटरी घोटाला',
        job: 'नकली नौकरी',
        investment: 'निवेश धोखाधड़ी',
        loan: 'लोन घोटाला',
        other: 'अन्य'
      },
      resultSafe: '✅ कोई रिपोर्ट नहीं मिली',
      resultSafeDesc: 'यह नंबर घोटाले के रूप में रिपोर्ट नहीं किया गया है',
      resultDanger: '⚠️ घोटाला अलर्ट!',
      resultDangerDesc: 'यह नंबर कई बार रिपोर्ट किया गया है',
      reportCount: 'रिपोर्ट',
      verified: 'समुदाय द्वारा सत्यापित',
      unverified: 'सत्यापन लंबित',
      lastReported: 'अंतिम रिपोर्ट',
      scamType: 'घोटाले का प्रकार',
      description: 'विवरण',
      recentReportsTitle: 'हाल की घोटाला रिपोर्ट',
      noReports: 'कोई हालिया रिपोर्ट नहीं',
      reportForm: {
        title: 'घोटाला नंबर रिपोर्ट करें',
        phoneNumber: 'स्कैमर का फोन नंबर',
        scamType: 'घोटाले का प्रकार',
        description: 'क्या हुआ?',
        descriptionPlaceholder: 'बताएं कि उन्होंने आपसे कैसे संपर्क किया और क्या करने की कोशिश की...',
        yourName: 'आपका नाम (वैकल्पिक)',
        yourNamePlaceholder: 'गुमनाम',
        submit: 'रिपोर्ट जमा करें',
        cancel: 'रद्द करें'
      },
      successMessage: '✅ रिपोर्ट जमा हो गई! समुदाय की मदद के लिए धन्यवाद।',
      warningMessage: '⚠️ झूठी रिपोर्ट कानूनी कार्रवाई का कारण बन सकती है। केवल वास्तविक घोटालों की रिपोर्ट करें।'
    }
  };

  const t = content[lang];

  // Load data from localStorage on mount
  useEffect(() => {
    loadReportsFromStorage();
    updateStats();
  }, []);

  const loadReportsFromStorage = () => {
    const storedReports = localStorage.getItem('scam-reports');
    if (storedReports) {
      const reports = JSON.parse(storedReports);
      setRecentReports(reports.slice(0, 10)); // Show last 10
    }
  };

  const updateStats = () => {
    const storedReports = localStorage.getItem('scam-reports');
    if (storedReports) {
      const reports: ScamReport[] = JSON.parse(storedReports);
      
      // Calculate stats
      const now = Date.now();
      const last24h = reports.filter(r => now - r.timestamp < 24 * 60 * 60 * 1000).length;
      const verified = reports.filter(r => r.verified).length;
      
      // Find top scam type
      const scamTypeCounts = reports.reduce((acc, r) => {
        acc[r.scamType] = (acc[r.scamType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topScamType = Object.entries(scamTypeCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'digital_arrest';

      setStats({
        totalReports: reports.length,
        verifiedScams: verified,
        topScamType,
        recentReports: last24h
      });
    }
  };

  const searchScamNumber = () => {
    if (!searchNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    // Clean number (remove spaces, +, etc.)
    const cleanNumber = searchNumber.replace(/\D/g, '');

    // Search in localStorage
    const storedReports = localStorage.getItem('scam-reports');
    if (storedReports) {
      const reports: ScamReport[] = JSON.parse(storedReports);
      const found = reports.find(r => r.phoneNumber.replace(/\D/g, '') === cleanNumber);
      
      if (found) {
        setSearchResult(found);
      } else {
        setSearchResult({
          id: 'not-found',
          phoneNumber: searchNumber,
          scamType: '',
          reportedBy: '',
          timestamp: 0,
          description: '',
          verified: false,
          reportCount: 0
        });
      }
    } else {
      setSearchResult({
        id: 'not-found',
        phoneNumber: searchNumber,
        scamType: '',
        reportedBy: '',
        timestamp: 0,
        description: '',
        verified: false,
        reportCount: 0
      });
    }
  };

  const submitReport = () => {
    if (!reportData.phoneNumber.trim() || !reportData.description.trim()) {
      alert('Please fill in phone number and description');
      return;
    }

    const newReport: ScamReport = {
      id: `SCAM-${Date.now()}`,
      phoneNumber: reportData.phoneNumber,
      scamType: reportData.scamType,
      reportedBy: reportData.reportedBy || 'Anonymous',
      timestamp: Date.now(),
      description: reportData.description,
      verified: false,
      reportCount: 1
    };

    // Load existing reports
    const storedReports = localStorage.getItem('scam-reports');
    let reports: ScamReport[] = storedReports ? JSON.parse(storedReports) : [];

    // Check if number already reported
    const existingIndex = reports.findIndex(
      r => r.phoneNumber.replace(/\D/g, '') === reportData.phoneNumber.replace(/\D/g, '')
    );

    if (existingIndex >= 0) {
      // Update existing report
      reports[existingIndex].reportCount += 1;
      reports[existingIndex].timestamp = Date.now();
      
      // Verify if 3+ reports
      if (reports[existingIndex].reportCount >= 3) {
        reports[existingIndex].verified = true;
      }
    } else {
      // Add new report
      reports.unshift(newReport);
    }

    // Save to localStorage
    localStorage.setItem('scam-reports', JSON.stringify(reports));

    // Reset form
    setReportData({
      phoneNumber: '',
      scamType: 'digital_arrest',
      description: '',
      reportedBy: ''
    });
    setShowReportForm(false);

    // Reload data
    loadReportsFromStorage();
    updateStats();

    alert(t.successMessage);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-purple-100">{t.subtitle}</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">{t.stats.totalReports}</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalReports}</div>
        </div>

        <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">{t.stats.verifiedScams}</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.verifiedScams}</div>
        </div>

        <div className="bg-orange-600/20 border border-orange-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">{t.stats.topScamType}</span>
          </div>
          <div className="text-sm font-bold text-orange-400">
            {t.scamTypes[stats.topScamType as keyof typeof t.scamTypes]}
          </div>
        </div>

        <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">{t.stats.recentReports}</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.recentReports}</div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchScamNumber()}
              placeholder={t.searchPlaceholder}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={searchScamNumber}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Search className="w-5 h-5" />
            {t.searchButton}
          </button>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className={`mt-4 ${
            searchResult.reportCount > 0 
              ? 'bg-red-600/20 border-red-500/50' 
              : 'bg-green-600/20 border-green-500/50'
          } border rounded-xl p-6`}>
            {searchResult.reportCount === 0 ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-bold text-green-400">{t.resultSafe}</h3>
                </div>
                <p className="text-gray-300">{t.resultSafeDesc}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <div>
                    <h3 className="text-xl font-bold text-red-400">{t.resultDanger}</h3>
                    <p className="text-gray-300">{t.resultDangerDesc}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">{t.scamType}</div>
                    <div className="font-semibold">
                      {t.scamTypes[searchResult.scamType as keyof typeof t.scamTypes]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">{t.reportCount}</div>
                    <div className="font-semibold text-red-400">{searchResult.reportCount}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">{t.description}</div>
                  <div className="text-gray-300">{searchResult.description}</div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {searchResult.verified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">{t.verified}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">{t.unverified}</span>
                      </>
                    )}
                  </div>
                  <div className="text-gray-400">
                    {t.lastReported}: {new Date(searchResult.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Report Button */}
      {!showReportForm && (
        <button
          onClick={() => setShowReportForm(true)}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-6"
        >
          <AlertTriangle className="w-6 h-6" />
          {t.reportNumber}
        </button>
      )}

      {/* Report Form */}
      {showReportForm && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-xl mb-4">{t.reportForm.title}</h3>
          
          <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-200">{t.warningMessage}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">{t.reportForm.phoneNumber} *</label>
              <input
                type="tel"
                value={reportData.phoneNumber}
                onChange={(e) => setReportData({...reportData, phoneNumber: e.target.value})}
                placeholder="+91 98765 43210"
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2">{t.reportForm.scamType} *</label>
              <select
                value={reportData.scamType}
                onChange={(e) => setReportData({...reportData, scamType: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              >
                {Object.entries(t.scamTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">{t.reportForm.description} *</label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                placeholder={t.reportForm.descriptionPlaceholder}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 min-h-32 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2">{t.reportForm.yourName}</label>
              <input
                type="text"
                value={reportData.reportedBy}
                onChange={(e) => setReportData({...reportData, reportedBy: e.target.value})}
                placeholder={t.reportForm.yourNamePlaceholder}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitReport}
                className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                {t.reportForm.submit}
              </button>
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                {t.reportForm.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4">{t.recentReportsTitle}</h3>
        
        {recentReports.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{t.noReports}</p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-black/50 border border-white/10 rounded-lg p-4 hover:bg-black/70 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-bold">{report.phoneNumber}</div>
                      <div className="text-sm text-gray-400">
                        {t.scamTypes[report.scamType as keyof typeof t.scamTypes]}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-400">
                      {report.reportCount} {t.reportCount}
                    </div>
                    {report.verified && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        {t.verified}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{report.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(report.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}