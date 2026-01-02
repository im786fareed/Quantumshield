import LearningCenter from '@/components/LearningCenter';
import BackToHome from '@/components/BackToHome';

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <BackToHome />
      <LearningCenter lang="en" />
    </div>
  );
}