import type { Metadata } from 'next';
import CircuitBreaker from '@/components/CircuitBreaker';

export const metadata: Metadata = {
  title: 'Circuit Breaker — Anti-Isolation Protocol | AdamasVault',
  description:
    'Detects virtual kidnapping & digital arrest scams. If you are isolated in an unknown WhatsApp call for 6+ hours and unreachable, AdamasVault automatically alerts your Safety Circle.',
  openGraph: {
    title: 'Circuit Breaker — Anti-Isolation Protocol | AdamasVault',
    description:
      'Automated distress signal when you are isolated in a suspicious call for 6+ hours. Zero-cost, on-device, privacy-first.',
    url: 'https://AdamasVault.in/circuit-breaker',
    siteName: 'AdamasVault',
    type: 'website',
  },
  keywords: [
    'digital arrest protection',
    'virtual kidnapping alert',
    'anti-isolation protocol',
    'WhatsApp call scam',
    'distress signal',
    'circuit breaker',
    'AdamasVault',
  ],
};

export default function Page() {
  return <CircuitBreaker lang="en" />;
}
