import type { TabId } from '@/types/navigation';

export const BASE_URL = 'https://quantumshield.in';

export type SeoEntry = {
  title: string;
  description: string;
  path: string;
};

export const SEO_MAP: Partial<Record<TabId, SeoEntry>> = {
  home: {
    title: 'QuantumShield – AI Cyber Protection Platform',
    description:
      'Protect yourself from scams, fraud, and cyber threats using AI-powered tools.',
    path: '/',
  },

  scanner: {
    title: 'AI Scam Scanner – QuantumShield',
    description:
      'Scan messages, links, and content for scams using advanced AI detection.',
    path: '/scanner',
  },

  url: {
    title: 'URL Safety Checker – QuantumShield',
    description: 'Detect phishing and malicious URLs instantly.',
    path: '/url',
  },

  sms: {
    title: 'SMS Scam Detector – QuantumShield',
    description: 'Identify fake SMS, OTP fraud, and scam messages.',
    path: '/sms',
  },

  privacy: {
    title: 'Privacy Protection – QuantumShield',
    description: 'Protect your privacy and digital identity online.',
    path: '/privacy',
  },
};

/**
 * Safe resolver (never crashes build)
 */
export function getSeo(tab?: string) {
  const entry = SEO_MAP[tab as TabId];

  return (
    entry ?? {
      title: 'QuantumShield – AI Cyber Protection',
      description:
        'AI-powered protection against scams, fraud, phishing, and cyber threats.',
      path: '/',
    }
  );
}
