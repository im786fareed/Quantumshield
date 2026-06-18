import type { Metadata } from 'next';
import LegalRightsHome from '@/components/LegalRightsHome';
import BackToHome from '@/components/BackToHome';

export const metadata: Metadata = {
  title: 'My Legal Rights – QuantumShield Legal Intelligence',
  description:
    'AI-powered Citizen Rights, Incident Analysis, Evidence Management and Reporting Assistant for India. Understand your rights, find the right authority, and build a report-ready case file.',
  keywords: [
    'legal rights India', 'file complaint', 'cyber crime complaint', 'FIR help',
    'consumer complaint', 'know your rights', 'citizen rights', 'legal aid India',
  ],
};

export default function LegalRightsPage() {
  return (
    <>
      <BackToHome />
      <LegalRightsHome />
    </>
  );
}
