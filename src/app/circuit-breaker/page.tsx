import type { Metadata } from 'next';
import CircuitBreaker from '@/components/CircuitBreaker';

export const metadata: Metadata = {
  title: 'Circuit Breaker — Anti-Isolation Protocol | QuantumShield',
  description:
    'Detects virtual kidnapping & digital arrest scams. If you are isolated in an unknown WhatsApp call for 6+ hours and unreachable, QuantumShield automatically alerts your Safety Circle.',
  openGraph: {
    title: 'Circuit Breaker — Anti-Isolation Protocol | QuantumShield',
    description:
      'Automated distress signal when you are isolated in a suspicious call for 6+ hours. Zero-cost, on-device, privacy-first.',
    url: 'https://quantumshield.in/circuit-breaker',
    siteName: 'QuantumShield',
    type: 'website',
  },
  keywords: [
    'digital arrest protection',
    'virtual kidnapping alert',
    'anti-isolation protocol',
    'WhatsApp call scam',
    'distress signal',
    'circuit breaker',
    'QuantumShield',
  ],
};

export default function Page() {
  return <CircuitBreaker lang="en" />;
}
