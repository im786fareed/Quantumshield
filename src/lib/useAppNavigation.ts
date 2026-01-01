'use client';

import { useRouter } from 'next/navigation';

export function useAppNavigation() {
  const router = useRouter();

  return {
    goHome: () => router.push('/'),
    goScanner: () => router.push('/scanner'),
    goThreats: () => router.push('/threats'),
    goApk: () => router.push('/apk'),
    goSms: () => router.push('/sms'),
    goDownloads: () => router.push('/downloads'),
    goUrl: () => router.push('/url'),
    goSpam: () => router.push('/spam'),
    goFile: () => router.push('/file'),
    goEncryption: () => router.push('/encryption'),
    goBreach: () => router.push('/breach'),
    goRansomware: () => router.push('/ransomware'),
    goDevice: () => router.push('/device'),
    goNews: () => router.push('/news'),
    goEducation: () => router.push('/education'),
    goAboutAI: () => router.push('/aboutai'),

    goEvidence: () => router.push('/evidence'),
    goReport: () => router.push('/report'),
    goScamDB: () => router.push('/scamdb'),
    goAIAnalyzer: () => router.push('/aianalyzer'),
    goEmergency: () => router.push('/emergency'),
    goSimProtection: () => router.push('/simprotection'),
    goDeviceScan: () => router.push('/devicescan'),
    goWhatsapp: () => router.push('/whatsapp'),
    goAwareness: () => router.push('/awareness'),
    goPrivacy: () => router.push('/privacy'),
  };
}
