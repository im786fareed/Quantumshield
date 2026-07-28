import EvidenceCollector from '@/components/EvidenceCollector';
import BackToHome from '@/components/BackToHome';

export default function EvidencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-900 to-black">
      <BackToHome />
      <EvidenceCollector lang="en" />
    </div>
  );
}