import PoliceReporter from '@/components/PoliceReporter';
import BackToHome from '@/components/BackToHome';

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <BackToHome />
      <PoliceReporter lang="en" />
    </div>
  );
}