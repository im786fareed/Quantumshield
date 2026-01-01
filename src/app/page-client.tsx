'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import type { TabId } from '@/types/navigation';
import { useNavigationStore } from '@/store/navigation';

import CommandPalette from '@/components/CommandPalette';
import InstallPrompt from '@/components/InstallPrompt';

/* ================= PAGE COMPONENTS ================= */

import HomePage from '@/components/HomePage';
import Scanner from '@/components/Scanner';
import ThreatIntelligence from '@/components/ThreatIntelligence';
import APKGuardian from '@/components/APKGuardian';
import SMSGuardian from '@/components/SMSGuardian';
import DownloadScanner from '@/components/DownloadScanner';
import UrlChecker from '@/components/UrlChecker';
import SpamChecker from '@/components/SpamChecker';
import FileScanner from '@/components/FileScanner';
import FileEncryption from '@/components/FileEncryption';
import DataBreachChecker from '@/components/DataBreachChecker';
import RansomwareDetector from '@/components/RansomwareDetector';
import DeviceCheck from '@/components/DeviceCheck';
import LatestNews from '@/components/LatestNews';
import Education from '@/components/Education';
import AboutAI from '@/components/AboutAI';

import EvidenceCollector from '@/components/EvidenceCollector';
import PoliceReporter from '@/components/PoliceReporter';
import ScamDatabase from '@/components/ScamDatabase';
import AICallAnalyzer from '@/components/AICallAnalyzer';
import EmergencyContact from '@/components/EmergencyContact';
import SIMProtection from '@/components/SIMProtection';
import DeviceSecurityScanner from '@/components/DeviceSecurityScanner';
import WhatsAppGhostPairing from '@/components/WhatsAppGhostPairing';
import ScamAwarenessCenter from '@/components/ScamAwarenessCenter';
import PrivacyShield from '@/components/PrivacyShield';

/* ================= TYPES ================= */

type Language = 'en' | 'hi';

type PageRenderer = (props: {
  lang: Language;
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
}) => React.ReactNode;

/* ================= ROUTE REGISTRY ================= */

const PAGES: Record<TabId, PageRenderer> = {
  home: ({ lang, activeTab, onNavigate }) => (
    <HomePage lang={lang} activeTab={activeTab} onNavigate={onNavigate} />
  ),

  scanner: ({ lang }) => <Scanner lang={lang} />,
  threats: ({ lang }) => <ThreatIntelligence lang={lang} />,
  apk: ({ lang }) => <APKGuardian lang={lang} />,
  sms: ({ lang }) => <SMSGuardian lang={lang} />,
  downloads: ({ lang }) => <DownloadScanner lang={lang} />,
  url: ({ lang }) => <UrlChecker lang={lang} />,
  spam: ({ lang }) => <SpamChecker lang={lang} />,
  file: ({ lang }) => <FileScanner lang={lang} />,
  encryption: ({ lang }) => <FileEncryption lang={lang} />,
  breach: ({ lang }) => <DataBreachChecker lang={lang} />,
  ransomware: ({ lang }) => <RansomwareDetector lang={lang} />,
  device: ({ lang }) => <DeviceCheck lang={lang} />,
  news: ({ lang }) => <LatestNews lang={lang} />,
  education: ({ lang }) => <Education lang={lang} />,
  aboutai: ({ lang }) => <AboutAI lang={lang} />,

  evidence: ({ lang }) => <EvidenceCollector lang={lang} />,
  report: ({ lang }) => <PoliceReporter lang={lang} />,
  scamdb: ({ lang }) => <ScamDatabase lang={lang} />,
  aianalyzer: ({ lang }) => <AICallAnalyzer lang={lang} />,
  emergency: ({ lang }) => <EmergencyContact lang={lang} />,
  simprotection: ({ lang }) => <SIMProtection lang={lang} />,
  devicescan: ({ lang }) => <DeviceSecurityScanner lang={lang} />,
  whatsapp: ({ lang }) => <WhatsAppGhostPairing lang={lang} />,
  awareness: ({ lang }) => <ScamAwarenessCenter lang={lang} />,
  privacy: ({ lang }) => <PrivacyShield lang={lang} />,
};

/* ================= MAIN CLIENT PAGE ================= */

export default function PageClient({
  initialTab,
}: {
  initialTab?: string;
}) {
  const router = useRouter();

  const activeTab = useNavigationStore((s) => s.activeTab);
  const setTab = useNavigationStore((s) => s.setTab);
  const moveNext = useNavigationStore((s) => s.moveNext);
  const movePrev = useNavigationStore((s) => s.movePrev);

  const language: Language = 'en';

  /* Sync URL → store on first load */
  useEffect(() => {
    if (initialTab) {
      setTab(initialTab as TabId);
    }
  }, [initialTab, setTab]);

  /* Sync store → URL */
  useEffect(() => {
    router.replace(`/${activeTab}`, { scroll: false });
  }, [activeTab, router]);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveNext();
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        movePrev();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [moveNext, movePrev]);

  const Page = PAGES[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <InstallPrompt />
      <CommandPalette />

      <main className="min-h-screen">
        {Page({
          lang: language,
          activeTab,
          onNavigate: setTab,
        })}
      </main>
    </div>
  );
}
