import BackToHome from '@/components/BackToHome';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <BackToHome />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">No Guarantee of Protection</h2>
            <p>QuantumShield provides security analysis tools to help identify potential threats. However, we cannot guarantee 100% protection against all cyber threats.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Educational Purpose</h2>
            <p>This platform is designed for educational and awareness purposes to help users recognize and avoid common cyber threats and scams.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Not a Substitute for Official Authorities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Always report cybercrimes to official authorities (Call 1930 in India)</li>
              <li>QuantumShield does not investigate crimes or take legal action</li>
              <li>We provide tools to assist you in protecting yourself</li>
              <li>For emergencies, contact local police (100) or cybercrime helpline (1930)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Third-Party Content</h2>
            <p>Educational videos and external links are provided for awareness. We do not own or control third-party content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">AI Analysis Limitations</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>AI analysis may produce false positives or negatives</li>
              <li>Results should be used as guidance, not absolute truth</li>
              <li>Always verify suspicious activity independently</li>
              <li>Trust your instincts and common sense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">No Legal or Financial Advice</h2>
            <p>Information provided is for general awareness only. Consult qualified professionals for legal, financial, or technical advice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">User Responsibility</h2>
            <p>Users are responsible for their own security practices. QuantumShield is a supplementary tool to assist your cybersecurity awareness.</p>
          </section>

          <section className="bg-red-500/10 border border-red-500/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-3">⚠️ Important</h2>
            <p className="text-white">If you are a victim of cybercrime:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li className="text-white">Call 1930 immediately (National Cybercrime Helpline)</li>
              <li className="text-white">Report online at <a href="https://cybercrime.gov.in" className="text-blue-400 hover:text-blue-300">cybercrime.gov.in</a></li>
              <li className="text-white">Contact your bank if money is involved</li>
              <li className="text-white">Preserve all evidence (screenshots, messages, call logs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
            <p>For support or questions: <a href="mailto:quantumshield4india@gmail.com" className="text-blue-400 hover:text-blue-300">quantumshield4india@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}