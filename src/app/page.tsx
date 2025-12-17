'use client';

import { Scan, Link as LinkIcon, MessageSquare, FileSearch, Smartphone, TrendingUp, GraduationCap, Brain, Menu, X, Globe, Shield, Lock, Database, AlertTriangle, Download, Home as HomeIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import HomePage from '@/components/HomePage';
import Scanner from '@/components/Scanner';
import UrlChecker from '@/components/UrlChecker';
import SpamChecker from '@/components/SpamChecker';
import FileScanner from '@/components/FileScanner';
import DeviceCheck from '@/components/DeviceCheck';
import LatestNews from '@/components/LatestNews';
import Education from '@/components/Education';
import AboutAI from '@/components/AboutAI';
import APKGuardian from '@/components/APKGuardian';
import FileEncryption from '@/components/FileEncryption';
import DataBreachChecker from '@/components/DataBreachChecker';
import RansomwareDetector from '@/components/RansomwareDetector';
import ThreatIntelligence from '@/components/ThreatIntelligence';
import SMSGuardian from '@/components/SMSGuardian';
import DownloadScanner from '@/components/DownloadScanner';

type Language = 'en' | 'hi';
type TabId = 'home' | 'scanner' | 'apk' | 'url' | 'spam' | 'file' | 'encryption' | 'breach' | 'ransomware' | 'device' | 'news' | 'education' | 'aboutai' | 'threats' | 'sms' | 'downloads';

const NAV_ITEMS = {
  en: [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'threats', label: 'Threat Intel', icon: TrendingUp },
    { id: 'apk', label: 'APK Guardian', icon: Shield },
    { id: 'sms', label: 'SMS Guardian', icon: MessageSquare },
    { id: 'downloads', label: 'Download Scanner', icon: Download },
    { id: 'url', label: 'URL Check', icon: LinkIcon },
    { id: 'spam', label: 'Spam AI', icon: MessageSquare },
    { id: 'file', label: 'File Scan', icon: FileSearch },
    { id: 'encryption', label: 'File Encryption', icon: Lock },
    { id: 'breach', label: 'Breach Check', icon: Database },
    { id: 'ransomware', label: 'Ransomware Detect', icon: AlertTriangle },
    { id: 'device', label: 'Device Check', icon: Smartphone },
    { id: 'news', label: 'Latest Threats', icon: TrendingUp },
    { id: 'education', label: 'Learn Safety', icon: GraduationCap },
    { id: 'aboutai', label: 'AI Tech', icon: Brain }
  ],
  hi: [
    { id: 'home', label: 'होम', icon: HomeIcon },
    { id: 'scanner', label: 'AI स्कैनर', icon: Scan },
    { id: 'threats', label: 'खतरा इंटेल', icon: TrendingUp },
    { id: 'apk', label: 'APK गार्डियन', icon: Shield },
    { id: 'sms', label: 'SMS गार्डियन', icon: MessageSquare },
    { id: 'downloads', label: 'डाउनलोड स्कैनर', icon: Download },
    { id: 'url', label: 'URL जांच', icon: LinkIcon },
    { id: 'spam', label: 'स्पैम AI', icon: MessageSquare },
    { id: 'file', label: 'फ़ाइल स्कैन', icon: FileSearch },
    { id: 'encryption', label: 'फ़ाइल एन्क्रिप्शन', icon: Lock },
    { id: 'breach', label: 'ब्रीच जांच', icon: Database },
    { id: 'ransomware', label: 'रैंसमवेयर पहचान', icon: AlertTriangle },
    { id: 'device', label: 'डिवाइस जांच', icon: Smartphone },
    { id: 'news', label: 'नवीनतम खतरे', icon: TrendingUp },
    { id: 'education', label: 'सुरक्षा सीखें', icon: GraduationCap },
    { id: 'aboutai', label: 'AI तकनीक', icon: Brain }
  ]
};

const CONTENT = {
  en: {
    title: 'QuantumShield',
    subtitle: 'AI-Powered Cyber Fraud Prevention',
  },
  hi: {
    title: 'QuantumShield',
    subtitle: 'AI संचालित साइबर धोखाधड़ी रोकथाम',
  }
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    try {
      localStorage.setItem('language', newLang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as TabId);
    setShowMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = CONTENT[language];
  const navItems = NAV_ITEMS[language];

  const NavButton = ({ id, label, icon: Icon, isActive }: { id: TabId; label: string; icon: any; isActive: boolean }) => (
    <button
      onClick={() => handleNavigate(id)}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
          : 'bg-white/5 text-gray-300 hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} lang={language} />;
      case 'scanner':
        return <Scanner lang={language} />;
      case 'threats':
        return <ThreatIntelligence lang={language} />;
      case 'apk':
        return <APKGuardian lang={language} />;
      case 'sms':
        return <SMSGuardian lang={language} />;
      case 'downloads':
        return <DownloadScanner lang={language} />;
      case 'url':
        return <UrlChecker lang={language} />;
      case 'spam':
        return <SpamChecker lang={language} />;
      case 'file':
        return <FileScanner lang={language} />;
      case 'encryption':
        return <FileEncryption lang={language} />;
      case 'breach':
        return <DataBreachChecker lang={language} />;
      case 'ransomware':
        return <RansomwareDetector lang={language} />;
      case 'device':
        return <DeviceCheck lang={language} />;
      case 'news':
        return <LatestNews lang={language} />;
      case 'education':
        return <Education lang={language} />;
      case 'aboutai':
        return <AboutAI lang={language} />;
      default:
        return <HomePage onNavigate={handleNavigate} lang={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {content.title}
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">{content.subtitle}</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                aria-label={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">{language === 'en' ? 'हिंदी' : 'English'}</span>
              </button>

              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Toggle navigation menu"
                aria-expanded={showMenu}
                className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition"
              >
                {showMenu ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Navigation - Only show if not on home */}
          {activeTab !== 'home' && (
            <nav className="hidden lg:block w-64 flex-shrink-0" aria-label="Main navigation">
              <div className="sticky top-24 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {navItems.map((item) => (
                  <NavButton
                    key={item.id}
                    id={item.id as TabId}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTab === item.id}
                  />
                ))}
              </div>
            </nav>
          )}

          {/* Mobile Navigation */}
          {showMenu && (
            <nav className="lg:hidden fixed inset-0 top-[73px] bg-black/95 backdrop-blur z-40 overflow-y-auto" aria-label="Main navigation">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavButton
                    key={item.id}
                    id={item.id as TabId}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTab === item.id}
                  />
                ))}
              </div>
            </nav>
          )}

          {/* Main Content */}
          <main className={`flex-1 min-w-0 ${activeTab === 'home' ? 'max-w-full' : ''}`} role="main">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-white mb-3">About</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-cyan-400 transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-cyan-400 transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com/im786fareed/QuantumShield" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition"
                  >
                    Open Source Code
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-white mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => handleNavigate('education')} className="hover:text-cyan-400 transition">
                    Safety Videos
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('news')} className="hover:text-cyan-400 transition">
                    Latest Threats
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('threats')} className="hover:text-cyan-400 transition">
                    Threat Intelligence
                  </button>
                </li>
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-bold text-white mb-3">Protection Tools</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => handleNavigate('apk')} className="hover:text-cyan-400 transition">
                    APK Guardian
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('sms')} className="hover:text-cyan-400 transition">
                    SMS Guardian
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('url')} className="hover:text-cyan-400 transition">
                    URL Checker
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-white mb-3">Contact & Report</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:QuantumShield.india@gmail.com" className="hover:text-cyan-400 transition">
                    QuantumShield.india@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:1930" className="hover:text-cyan-400 transition">
                    Report Scams: 1930
                  </a>
                </li>
                <li>
                  <a 
                    href="https://cybercrime.gov.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition"
                  >
                    Cybercrime.gov.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Trust Notice */}
          <div className="bg-green-600/20 backdrop-blur rounded-xl border border-green-500/50 p-4 mb-6">
            <p className="text-sm text-green-200 text-center">
              <span className="font-bold">🔒 Privacy Guarantee:</span> We don't store your data. All analysis happens in your browser. 
              <Link href="/privacy" className="underline ml-1 hover:text-green-400">Read Privacy Policy</Link>
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-600/20 backdrop-blur rounded-xl border border-yellow-500/50 p-4 mb-6">
            <p className="text-sm text-yellow-200 text-center">
              <span className="font-bold">⚠️ Important:</span> QuantumShield is an educational tool, not a replacement for antivirus software. 
              Always report scams to official authorities at <strong>1930</strong> or <strong>cybercrime.gov.in</strong>
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-sm border-t border-white/10 pt-6">
            <p>© 2024 QuantumShield. {language === 'en' ? 'Free educational platform.' : 'मुफ्त शैक्षिक मंच।'}</p>
            <p className="mt-2">Not affiliated with any government agency. Built with ❤️ for India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}