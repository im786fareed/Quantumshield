'use client';

import React, { use } from 'react';
import dynamic from 'next/dynamic';
import PageWrapper from '../_shared/PageWrapper';
import type { ScanTab } from '@/components/Scanner';

// The unified Scanner replaced the former APKGuardian, SMSGuardian,
// DownloadScanner, UrlChecker, SpamChecker, FileScanner and
// RansomwareDetector components. Legacy routes keep working — each one
// opens the Scanner with the matching tab preselected.
const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false });
const DataBreachChecker = dynamic(() => import('@/components/DataBreachChecker'), { ssr: false });

// Legacy tab → unified Scanner tab
const SCANNER_TABS: Record<string, ScanTab> = {
  url: 'link',
  file: 'file',
  downloads: 'file',
  ransomware: 'file',
  apk: 'apk',
  sms: 'message',
  spam: 'message',
};

type Props = {
  params: Promise<{ tab: string }>;
};

export default function TabClient({ params }: Props) {
  const { tab } = use(params);
  const key = tab.toLowerCase();

  let ComponentToRender = null;

  if (key in SCANNER_TABS) {
    ComponentToRender = <Scanner initialTab={SCANNER_TABS[key]} />;
  } else if (key === 'breach') {
    ComponentToRender = <DataBreachChecker lang="en" />;
  } else {
    ComponentToRender = (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-3xl font-black text-rose-500 tracking-tight">SECURITY ENDPOINT UNRESOLVED</h2>
        <p className="text-gray-400 max-w-md mx-auto text-base">
          The requested QuantumShield dynamic forensics component <code className="text-cyan-400 font-mono">/{tab}</code> does not exist or has been relocated.
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {ComponentToRender}
      </div>
    </PageWrapper>
  );
}
