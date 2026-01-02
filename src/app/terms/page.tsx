import BackToHome from '@/components/BackToHome';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <BackToHome />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Acceptance of Terms</h2>
            <p>By using QuantumShield, you agree to these terms. If you don't agree, please don't use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Service Description</h2>
            <p>QuantumShield provides AI-powered cybersecurity tools to help users identify and protect against online threats, scams, and fraud.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the service for lawful purposes only</li>
              <li>Do not attempt to bypass security features</li>
              <li>Do not submit malicious content intentionally</li>
              <li>Report suspected scams to authorities (1930)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Disclaimer</h2>
            <p>While we strive for accuracy, QuantumShield's threat analysis is provided "as is" without warranties. Always verify critical information independently.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Limitation of Liability</h2>
            <p>QuantumShield is not liable for damages resulting from use of the service. We are a security assistance tool, not a guarantee against all threats.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Changes to Terms</h2>
            <p>We may update these terms. Continued use after changes constitutes acceptance of new terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
            <p>Questions: <a href="mailto:quantumshield4india@gmail.com" className="text-blue-400 hover:text-blue-300">quantumshield4india@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}