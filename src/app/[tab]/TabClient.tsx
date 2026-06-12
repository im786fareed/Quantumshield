'use client';

import React, { use } from 'react';
import dynamic from 'next/dynamic';
import PageWrapper from '../_shared/PageWrapper';

// Dynamically import components to optimize bundle size and prevent hydration mismatch
const APKGuardian = dynamic(() => import('@/components/APKGuardian'), { ssr: false });
const SMSGuardian = dynamic(() => import('@/components/SMSGuardian'), { ssr: false });
const DownloadScanner = dynamic(() => import('@/components/DownloadScanner'), { ssr: false });
const UrlChecker = dynamic(() => import('@/components/UrlChecker'), { ssr: false });
const SpamChecker = dynamic(() => import('@/components/SpamChecker'), { ssr: false });
const FileScanner = dynamic(() => import('@/components/FileScanner'), { ssr: false });
const DataBreachChecker = dynamic(() => import('@/components/DataBreachChecker'), { ssr: false });
const RansomwareDetector = dynamic(() => import('@/components/RansomwareDetector'), { ssr: false });

type Props = {
  params: Promise<{ tab: string }>;
};

export default function TabClient({ params }: Props) {
  const { tab } = use(params);

  let ComponentToRender = null;

  switch (tab.toLowerCase()) {
    case 'apk':
      ComponentToRender = <APKGuardian lang="en" />;
      break;
    case 'sms':
      ComponentToRender = <SMSGuardian lang="en" />;
      break;
    case 'downloads':
      ComponentToRender = <DownloadScanner lang="en" />;
      break;
    case 'url':
      ComponentToRender = <UrlChecker lang="en" />;
      break;
    case 'spam':
      ComponentToRender = <SpamChecker lang="en" />;
      break;
    case 'file':
      ComponentToRender = <FileScanner lang="en" />;
      break;
    case 'breach':
      ComponentToRender = <DataBreachChecker lang="en" />;
      break;
    case 'ransomware':
      ComponentToRender = <RansomwareDetector lang="en" />;
      break;
    default:
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
