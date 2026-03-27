'use client';
import { useState } from 'react';
import {
  Newspaper, AlertTriangle, ExternalLink, TrendingUp,
  Shield, Search, X, Clock, Tag
} from 'lucide-react';
import BackToHome from './BackToHome';

// ─── Real verified news — sourced from MHA/I4C, Times of India, Business Standard,
//     The420.in, Telangana Today, CBI press releases — updated March 2026
const NEWS = [
  {
    id: '1',
    headline: 'CBI Arrests Mumbai Kingpin Behind Myanmar Cyber Scam Camps',
    headlineHi: 'CBI ने म्यांमार साइबर स्कैम कैंप के मुंबई किंगपिन को गिरफ्तार किया',
    summary: 'CBI arrested Sunil Nellathu Ramakrishnan who lured Indian job seekers to Thailand with fake offers, then trafficked them to Myanmar scam compounds. Victims were forced to run digital arrest scams, romance frauds, and crypto investment schemes. Incriminating digital evidence was seized.',
    summaryHi: 'CBI ने सुनील नेल्लथु रामकृष्णन को गिरफ्तार किया जो भारतीयों को नकली नौकरी का लालच देकर म्यांमार के स्कैम कैंप भेजता था। पीड़ितों को डिजिटल अरेस्ट और क्रिप्टो घोटाले चलाने पर मजबूर किया जाता था।',
    source: 'ANI / CBI Press Release',
    date: 'March 2026',
    url: 'https://aninews.in/news/national/general-news/cbi-arrests-kingpin-of-transnational-cyber-slavery-network-from-mumbai20260326225212/',
    category: 'Arrest / Bust',
    severity: 'critical' as const,
  },
  {
    id: '2',
    headline: 'Delhi Police Busts ₹10.6 Cr Multi-State Syndicate — Digital Arrest & Fake IPO',
    headlineHi: 'दिल्ली पुलिस ने ₹10.6 करोड़ के मल्टी-स्टेट सिंडिकेट का भंडाफोड़ किया',
    summary: 'Six suspects arrested across six states linked to 89 complaints totalling ₹10.6 crore in losses. Syndicate ran fake IPO platforms, digital arrest impersonation of TRAI/CBI officials, and fake stock trading apps. An elderly couple lost ₹20 lakh after being coerced for a week using fake warrants.',
    summaryHi: 'छह राज्यों में छह संदिग्धों को ₹10.6 करोड़ की 89 शिकायतों से जोड़कर गिरफ्तार किया गया। नकली IPO, TRAI/CBI अधिकारियों का रूप धारण और नकली ट्रेडिंग ऐप शामिल थे।',
    source: 'The420.in / Millennium Post',
    date: 'March 2026',
    url: 'https://the420.in/delhi-police-cyber-fraud-syndicate-fake-ipo-digital-arrest/',
    category: 'Digital Arrest',
    severity: 'critical' as const,
  },
  {
    id: '3',
    headline: 'Lucknow Retired Engineer Held Under "Digital Arrest" for 43 Days, Loses ₹1.18 Cr',
    headlineHi: 'लखनऊ के सेवानिवृत्त इंजीनियर 43 दिन "डिजिटल अरेस्ट" में, ₹1.18 करोड़ गंवाए',
    summary: 'A retired engineer was kept under continuous live-video psychological siege for 43 days by fraudsters impersonating CBI and TRAI officials. Using fake arrest warrants and round-the-clock video calls, scammers drained ₹1.18 crore. In a parallel Lucknow case, an LIC officer couple lost ₹12.9 lakh.',
    summaryHi: 'सेवानिवृत्त इंजीनियर को 43 दिनों तक CBI/TRAI अधिकारियों का रूप धारण करने वाले ठगों ने लाइव वीडियो पर रखा और ₹1.18 करोड़ लूट लिए।',
    source: 'The Logical Indian',
    date: 'March 2026',
    url: 'https://thelogicalindian.com/lucknow-digital-arrest-scam-victims-kept-on-live-video-duped-of-%E2%82%B91-31-crore-by-fake-officials/',
    category: 'Digital Arrest',
    severity: 'critical' as const,
  },
  {
    id: '4',
    headline: 'Deepfake Videos of Nirmala Sitharaman Used to Promote Crypto Fraud — ₹2.68 Cr Lost',
    headlineHi: 'निर्मला सीतारमण के डीपफेक वीडियो से क्रिप्टो धोखाधड़ी — ₹2.68 करोड़ का नुकसान',
    summary: 'AI-generated deepfake videos of Finance Minister Nirmala Sitharaman circulated on social media directing victims to fake crypto trading apps. One Telangana deputy manager lost ₹2.68 crore. Victims were funnelled from deepfake social media ads into WhatsApp groups before being trapped in fraudulent AI-branded trading platforms.',
    summaryHi: 'वित्त मंत्री निर्मला सीतारमण के डीपफेक वीडियो का इस्तेमाल कर लोगों को नकली क्रिप्टो ट्रेडिंग ऐप की ओर मोड़ा गया। एक तेलंगाना उपप्रबंधक ने ₹2.68 करोड़ गंवाए।',
    source: 'CryptoTimes / Telangana Police',
    date: 'March 2026',
    url: 'https://www.cryptotimes.io/2026/03/23/india-hit-by-inr-2-68-cr-crypto-fraud-as-deepfake-trading-apps-trap-victims/',
    category: 'Deepfake / AI Scam',
    severity: 'critical' as const,
  },
  {
    id: '5',
    headline: 'Hyderabad Cybercrime Police Bust ₹26 Cr Online Gaming & Betting Fraud',
    headlineHi: 'हैदराबाद साइबर पुलिस ने ₹26 करोड़ के ऑनलाइन गेमिंग फ्रॉड का भंडाफोड़ किया',
    summary: 'Four key suspects arrested in a ₹26 crore online gaming and betting fraud. Victims were lured via fake Instagram ads and WhatsApp links into platforms using mule accounts. A 24-year-old woman lost ₹30 lakh after being allowed small early withdrawals to build trust before being defrauded of everything.',
    summaryHi: 'चार संदिग्धों को ₹26 करोड़ के ऑनलाइन गेमिंग फ्रॉड में गिरफ्तार किया। नकली इंस्टाग्राम विज्ञापनों से WhatsApp लिंक तक पीड़ितों को फँसाया गया।',
    source: 'Telangana Today',
    date: 'March 2026',
    url: 'https://telanganatoday.com/cybercrime-police-bust-rs-26-crore-online-gaming-betting-fraud-in-hyderabad',
    category: 'Investment Fraud',
    severity: 'high' as const,
  },
  {
    id: '6',
    headline: 'Cyberabad Police Bust Fake AI Trading & Part-Time Job Scam — 6 Arrested, ₹1.33 Cr Recovered',
    headlineHi: 'साइबराबाद पुलिस ने नकली AI ट्रेडिंग स्कैम का भंडाफोड़ किया — 6 गिरफ्तार',
    summary: 'Six people arrested running two scam networks — a fake AI-based trading/IPO platform on WhatsApp/Telegram and a part-time job offer scam. Fraudsters used fabricated profit screenshots to build credibility before draining victims\' funds through mule bank accounts. ₹1.33 crore recovered.',
    summaryHi: 'छह लोगों को गिरफ्तार किया जो नकली AI ट्रेडिंग और पार्ट-टाइम जॉब स्कैम चला रहे थे। ₹1.33 करोड़ बरामद।',
    source: 'Newsmeter / Cyberabad Cyber Crime Police',
    date: 'March 2026',
    url: 'https://newsmeter.in/crime/cyberabad-cyber-crime-police-bust-133-cr-fake-online-trading-scam-6-held-765243',
    category: 'Investment Fraud',
    severity: 'high' as const,
  },
  {
    id: '7',
    headline: 'Supreme Court Directs CBI to Lead National Investigation into Digital Arrest Scams',
    headlineHi: 'सुप्रीम कोर्ट ने CBI को डिजिटल अरेस्ट स्कैम की राष्ट्रीय जांच सौंपी',
    summary: 'India\'s Supreme Court formally directed the CBI to take charge of a national investigation into digital arrest scam epidemic, calling it a matter requiring "immediate attention". CBI was also given authority to probe bank officials under the Prevention of Corruption Act for enabling mule accounts used by scam syndicates.',
    summaryHi: 'सुप्रीम कोर्ट ने CBI को डिजिटल अरेस्ट घोटाले की राष्ट्रीय जांच सौंपी और इसे "तत्काल ध्यान देने की बात" कहा।',
    source: 'The Week',
    date: 'December 2025',
    url: 'https://www.theweek.in/news/india/2025/12/01/digital-arrest-scams-require-immediate-attention-supreme-court-assigns-cbi-to-lead-the-charge-against-cyber-rackets.html',
    category: 'Digital Arrest',
    severity: 'critical' as const,
  },
  {
    id: '8',
    headline: 'I4C Report: India Lost ₹22,495 Crore to Cybercrime in 2025 — 28.15 Lakh Cases',
    headlineHi: 'I4C रिपोर्ट: 2025 में भारत में 28.15 लाख साइबर मामले, ₹22,495 करोड़ का नुकसान',
    summary: 'India\'s I4C reported 28.15 lakh cybercrime cases in 2025 — a 24% spike from 2024 — with total losses of ₹22,495 crore. Investment fraud, digital arrest scams, and UPI-linked phishing led the categories. Over six years, Indians have cumulatively lost ₹53,000 crore to cyber-enabled fraud.',
    summaryHi: '2025 में 28.15 लाख साइबर अपराध के मामले — 2024 से 24% अधिक — ₹22,495 करोड़ का नुकसान। 6 साल में कुल ₹53,000 करोड़ लुटे।',
    source: 'I4C / MHA Annual Report',
    date: 'February 2026',
    url: 'https://www.insightsonindia.com/2026/02/21/cybercrime-in-india/',
    category: 'Advisory / Report',
    severity: 'critical' as const,
  },
  {
    id: '9',
    headline: 'Mumbai Woman (86) Loses ₹20.25 Crore in Digital Arrest Scam — Aadhaar Misuse',
    headlineHi: 'मुंबई की 86 वर्षीय महिला ने डिजिटल अरेस्ट स्कैम में ₹20.25 करोड़ गंवाए',
    summary: 'An 86-year-old South Mumbai woman was defrauded of ₹20.25 crore between December 2024–March 2025. Callers posed as police claiming her Aadhaar was linked to money laundering. Arrested suspect was part of an international Telegram network sharing Indian bank details with 13 foreign nationals.',
    summaryHi: '86 वर्षीय मुंबई महिला से ₹20.25 करोड़ ठगे गए। ठगों ने पुलिस बनकर आधार को मनी लॉन्ड्रिंग से जोड़ने का दावा किया।',
    source: 'Business Standard',
    date: 'March 2025',
    url: 'https://www.business-standard.com/india-news/mumbai-digital-arrest-scam-woman-loses-20-crore-police-fraud-125031700779_1.html',
    category: 'Digital Arrest',
    severity: 'critical' as const,
  },
  {
    id: '10',
    headline: 'Delhi HC Grants Relief to Ankur Warikoo in India\'s First Deepfake Financial Fraud Case',
    headlineHi: 'दिल्ली HC ने अंकुर वारिकू के डीपफेक केस में राहत दी — भारत का पहला ऐसा मामला',
    summary: 'Delhi High Court granted interim relief to personal finance influencer Ankur Warikoo after AI-generated deepfake videos of him promoted fraudulent stock market WhatsApp groups. Court was critical of Meta for failing to remove content promptly. This is one of India\'s first deepfake-in-financial-fraud court rulings.',
    summaryHi: 'दिल्ली HC ने अंकुर वारिकू के डीपफेक वीडियो मामले में अंतरिम राहत दी। Meta की देरी पर कोर्ट ने नाराजगी जताई।',
    source: 'Delhi High Court / Media Reports',
    date: '2025',
    url: 'https://phobolytics.com/blog/voice-cloning-ai-india-deepfake-protection-2026',
    category: 'Deepfake / AI Scam',
    severity: 'high' as const,
  },
  {
    id: '11',
    headline: 'Noida Engineering Consultant Loses ₹12 Crore in WhatsApp Stock Trading Scam',
    headlineHi: 'नोएडा के इंजीनियरिंग सलाहकार ने WhatsApp स्टॉक ट्रेडिंग स्कैम में ₹12 करोड़ गंवाए',
    summary: 'A 50-year-old Noida engineering consultant was defrauded of ₹12 crore after receiving an unsolicited WhatsApp message from a woman posing as a stock market expert. Victim was added to a trading group, shown fabricated profits, and gradually convinced to transfer funds over several weeks.',
    summaryHi: 'नोएडा के 50 वर्षीय इंजीनियरिंग सलाहकार को WhatsApp पर नकली स्टॉक मार्केट विशेषज्ञ ने ₹12 करोड़ का चूना लगाया।',
    source: 'Techlusive',
    date: '2025',
    url: 'https://www.techlusive.in/news/whatsapp-stock-trading-scam-costs-noida-man-rs-12-crore-heres-how-to-stay-safe-1627193/',
    category: 'WhatsApp Scam',
    severity: 'critical' as const,
  },
  {
    id: '12',
    headline: 'CBI Arrests Kanpur Recruiter for Sending Indians to Cyber-Slavery Camps in Cambodia',
    headlineHi: 'CBI ने कानपुर के दलाल को गिरफ्तार किया जो भारतीयों को कंबोडिया भेजता था',
    summary: 'CBI arrested Krishna Kumar Lakhwani for luring young Indians with fake data-entry job offers abroad, charging $300–400 per placement, then funnelling them to cyber fraud compounds in Cambodia where they were forced to run online scams under threat and confinement.',
    summaryHi: 'CBI ने कानपुर के कृष्ण कुमार लखवानी को गिरफ्तार किया जो भारतीयों को कंबोडिया के साइबर फ्रॉड कैंप में भेजता था।',
    source: 'CBI / Madhyamam Online',
    date: '2025',
    url: 'https://madhyamamonline.com/india/cbi-arrests-recruiter-sending-indians-cyber-slavery-compounds-abroad-1503311',
    category: 'Job Scam',
    severity: 'critical' as const,
  },
  {
    id: '13',
    headline: 'MHA: ₹8,189 Crore Saved via CFCFRMS; 62 Banks, 83,668 WhatsApp Accounts Blocked',
    headlineHi: 'MHA: CFCFRMS से ₹8,189 करोड़ बचाए गए; 83,668 WhatsApp खातों पर प्रतिबंध',
    summary: 'Ministry of Home Affairs announced that 62 banks have been onboarded to India\'s I4C portal, saving over ₹8,189 crore. Additionally, 11.14 lakh SIM cards and 2.96 lakh IMEI numbers have been blocked, and 83,668 WhatsApp accounts linked to fraud have been taken down by authorities.',
    summaryHi: 'MHA ने बताया कि 62 बैंकों को I4C पोर्टल से जोड़ा गया, ₹8,189 करोड़ बचाए गए। 83,668 WhatsApp खाते बंद किए।',
    source: 'MHA / PIB / MediaNama',
    date: 'February 2026',
    url: 'https://www.medianama.com/2026/02/223-i4c-portal-banks-onboarded-amit-shah-mulehunter-ai/',
    category: 'Advisory / Report',
    severity: 'high' as const,
  },
  {
    id: '14',
    headline: 'Pune 85-Year-Old Loses ₹22 Crore in Fake Share Trading Scam — 8 Arrested',
    headlineHi: 'पुणे के 85 वर्षीय व्यक्ति ने नकली शेयर ट्रेडिंग स्कैम में ₹22 करोड़ गंवाए — 8 गिरफ्तार',
    summary: 'An 85-year-old Pune senior citizen lost ₹22.03 crore to a gang using WhatsApp investment groups, fake mobile apps, and fabricated profit screenshots posing as stock market experts. Eight accused arrested — one of the largest individual cyber fraud cases in Pune\'s history.',
    summaryHi: 'पुणे के 85 वर्षीय बुजुर्ग को WhatsApp इन्वेस्टमेंट ग्रुप और नकली ऐप से ₹22 करोड़ ठगे गए। 8 आरोपी गिरफ्तार।',
    source: 'The420.in',
    date: '2025',
    url: 'https://the420.in/pune-fake-share-trading-scam-22-crore-85-year-old-whatsapp-app-arrests/',
    category: 'Investment Fraud',
    severity: 'critical' as const,
  },
  {
    id: '15',
    headline: 'Delhi Police Busts Pan-India Stock Market Scam — 3 Arrested in Multi-State Raids',
    headlineHi: 'दिल्ली पुलिस ने देशव्यापी स्टॉक मार्केट स्कैम का भंडाफोड़ किया — 3 गिरफ्तार',
    summary: 'Delhi Police arrested three people linked to shell companies GTR Electronics and Udyam Women Empowerment Foundation for running fake stock trading platforms, fraudulent pre-IPO schemes, and forex trading traps across multiple states. Simultaneous raids in Haryana and Maharashtra.',
    summaryHi: 'दिल्ली पुलिस ने नकली स्टॉक ट्रेडिंग प्लेटफॉर्म और IPO घोटाले के लिए हरियाणा और महाराष्ट्र में छापे मारकर 3 गिरफ्तार किए।',
    source: 'Business Standard',
    date: 'November 2025',
    url: 'https://www.business-standard.com/india-news/delhi-police-busts-1-6-cr-stock-market-scam-3-held-for-running-fake-firms-125112400398_1.html',
    category: 'Investment Fraud',
    severity: 'high' as const,
  },
];

const CATEGORIES = [
  'All News',
  'Digital Arrest',
  'Investment Fraud',
  'Deepfake / AI Scam',
  'WhatsApp Scam',
  'Job Scam',
  'Arrest / Bust',
  'Advisory / Report',
];

const SEV_STYLE = {
  critical: { bar: 'bg-red-600',    badge: 'bg-red-600/20 text-red-300 border-red-500/40',    label: 'CRITICAL' },
  high:     { bar: 'bg-orange-500', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', label: 'HIGH RISK' },
  medium:   { bar: 'bg-yellow-500', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', label: 'MEDIUM' },
};

export default function LatestNews() {
  const [lang, setLang]     = useState<'en' | 'hi'>('en');
  const [cat, setCat]       = useState('All News');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = NEWS.filter(n => {
    const matchCat    = cat === 'All News' || n.category === cat;
    const matchSearch = !search.trim() ||
      n.headline.toLowerCase().includes(search.toLowerCase()) ||
      n.headlineHi.includes(search) ||
      n.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <BackToHome />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/30 to-orange-600/30 border border-red-500/50 mb-4">
            <Newspaper className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            {lang === 'en' ? 'Cyber Fraud News' : 'साइबर फ्रॉड समाचार'}
          </h1>
          <p className="text-gray-400 text-sm">
            {lang === 'en'
              ? 'Real, verified stories — 2025 & 2026 · Sources: MHA, I4C, CBI, Business Standard, The420.in'
              : 'सत्यापित समाचार — 2025 और 2026 · स्रोत: MHA, I4C, CBI, Business Standard'}
          </p>
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="mt-3 text-xs bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition"
          >
            {lang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
          </button>
        </div>

        {/* National stats strip — real I4C 2025 figures */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { val: '28.15L', label: lang === 'en' ? 'Cases in 2025' : '2025 में मामले', color: 'text-red-400' },
            { val: '₹22,495Cr', label: lang === 'en' ? 'Lost in 2025' : '2025 में नुकसान', color: 'text-orange-400' },
            { val: '₹8,189Cr', label: lang === 'en' ? 'Saved by I4C' : 'I4C ने बचाए', color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 text-center mb-6 -mt-3">
          Source: I4C / MHA Annual Cybercrime Report, February 2026
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search news…' : 'समाचार खोजें…'}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm focus:border-red-500 focus:outline-none placeholder-gray-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-500 hover:text-white" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                cat === c
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {c}
              {c !== 'All News' && (
                <span className="ml-1 opacity-50">({NEWS.filter(n => n.category === c).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-gray-600 mb-4">
          {lang === 'en'
            ? `Showing ${filtered.length} of ${NEWS.length} verified stories`
            : `${NEWS.length} में से ${filtered.length} सत्यापित समाचार`}
        </p>

        {/* News cards */}
        <div className="space-y-4 mb-10">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>{lang === 'en' ? 'No stories match.' : 'कोई समाचार नहीं मिला।'}</p>
            </div>
          )}
          {filtered.map(news => {
            const sev   = SEV_STYLE[news.severity];
            const open  = expanded === news.id;
            return (
              <div
                key={news.id}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  news.severity === 'critical'
                    ? 'border-red-500/40 bg-red-500/5'
                    : news.severity === 'high'
                    ? 'border-orange-500/30 bg-orange-500/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {/* Severity bar */}
                <div className={`h-1 w-full ${sev.bar}`} />

                <div className="p-5">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sev.badge}`}>
                      {sev.label}
                    </span>
                    <span className="text-[10px] font-bold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {news.category}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-auto">
                      <Clock className="w-2.5 h-2.5" />
                      {news.date}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-black text-base leading-snug mb-2">
                    {lang === 'en' ? news.headline : news.headlineHi}
                  </h3>

                  {/* Summary — expandable */}
                  <p className={`text-sm text-gray-400 leading-relaxed ${open ? '' : 'line-clamp-2'}`}>
                    {lang === 'en' ? news.summary : news.summaryHi}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpanded(open ? null : news.id)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition"
                      >
                        {open
                          ? (lang === 'en' ? '▲ Show less' : '▲ कम दिखाएं')
                          : (lang === 'en' ? '▼ Read more' : '▼ अधिक पढ़ें')}
                      </button>
                      <span className="text-gray-700">·</span>
                      <span className="text-[11px] text-gray-600 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {news.source}
                      </span>
                    </div>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition"
                    >
                      Full story <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report CTA */}
        <div className="bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/30 rounded-2xl p-5 text-center mb-6">
          <h3 className="font-black text-lg mb-1">
            {lang === 'en' ? 'Been a victim? Report immediately.' : 'पीड़ित हुए? तुरंत रिपोर्ट करें।'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {lang === 'en'
              ? 'Every report helps authorities track and bust fraudsters faster.'
              : 'हर रिपोर्ट अधिकारियों को ठगों को पकड़ने में मदद करती है।'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="tel:1930" className="bg-red-600 hover:bg-red-500 font-black px-6 py-2.5 rounded-xl text-sm transition">
              📞 Call 1930
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
            >
              Report Online <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700">
          All stories sourced from verified public news outlets, government press releases and court records. QuantumShield does not claim ownership of any news content.
        </p>
      </div>
    </div>
  );
}
