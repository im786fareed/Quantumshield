import BackToHome from '@/components/BackToHome';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <BackToHome />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Data Collection</h2>
            <p>QuantumShield is committed to protecting your privacy. We collect minimal data necessary to provide our security services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">What We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>URLs, phone numbers, and files you voluntarily submit for scanning</li>
              <li>Usage analytics to improve our service (anonymous)</li>
              <li>No personal data is stored without your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">How We Use Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To analyze threats and provide security recommendations</li>
              <li>To improve our AI models for better protection</li>
              <li>All scans are processed securely and deleted after analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You can request data deletion at any time</li>
              <li>You control what information you share with us</li>
              <li>We never sell your data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Contact Us</h2>
            <p>For privacy concerns: <a href="mailto:quantumshield4india@gmail.com" className="text-blue-400 hover:text-blue-300">quantumshield4india@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}