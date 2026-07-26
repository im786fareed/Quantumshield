import type { Metadata } from 'next';
import GlobalGuardian from '@/components/GlobalGuardian';

export const metadata: Metadata = {
  title: 'Global Guardian — World Cyber Safety Directory | AdamasVault',
  description:
    'Cybercrime hotlines, fraud reporting portals and emergency numbers for 50+ countries. Auto-detects your location. Offline-first — no API needed.',
  openGraph: {
    title: 'Global Guardian — World Cyber Safety Directory | AdamasVault',
    description:
      'Instant access to cyber fraud helplines for 50+ countries. Safety Passport, geo-specific threat alerts, and one-click incident reports.',
    url: 'https://AdamasVault.in/global-guardian',
    siteName: 'AdamasVault',
    type: 'website',
  },
  keywords: [
    'global cybercrime helpline', 'cyber fraud reporting', 'international cyber safety',
    'country cyber hotline', 'digital arrest protection', 'AdamasVault',
    'IC3', 'Action Fraud', 'cybercrime.gov.in', 'global security directory',
  ],
};

export default function Page() {
  return <GlobalGuardian lang="en" />;
}
