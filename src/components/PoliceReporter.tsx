{/* Emergency Contacts */}
<div className="bg-white/5 rounded-xl p-6 mb-6">
  <h3 className="font-bold text-lg mb-4">{t.emergencyContacts}</h3>
  <div className="space-y-3">
    
      href="tel:1930"
      className="flex items-center gap-3 bg-red-600/20 border border-red-500/50 rounded-lg p-4 hover:bg-red-600/30 transition"
    >
      <Phone className="w-5 h-5 text-red-400" />
      <div>
        <div className="font-semibold">{t.cybercrimeHelpline}</div>
        <div className="text-sm text-gray-400">Call 1930 - National Cybercrime Helpline</div>
      </div>
    </a>

    
      href="https://cybercrime.gov.in"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between bg-blue-600/20 border border-blue-500/50 rounded-lg p-4 hover:bg-blue-600/30 transition"
    >
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-400" />
        <div>
          <div className="font-semibold">{t.cybercrimePortal}</div>
          <div className="text-sm text-gray-400">Report online at cybercrime.gov.in</div>
        </div>
      </div>
      <ExternalLink className="w-5 h-5" />
    </a>

    
      href="tel:100"
      className="flex items-center gap-3 bg-orange-600/20 border border-orange-500/50 rounded-lg p-4 hover:bg-orange-600/30 transition"
    >
      <AlertTriangle className="w-5 h-5 text-orange-400" />
      <div>
        <div className="font-semibold">{t.localPolice}</div>
        <div className="text-sm text-gray-400">Call 100 for immediate emergency</div>
      </div>
    </a>
    
    <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Mail className="w-5 h-5 text-yellow-400 mt-1" />
        <div>
          <div className="font-semibold text-yellow-400">Need Help Filing Report?</div>
          <div className="text-sm text-gray-300 mt-1">Contact QuantumShield Support</div>
          <a href="mailto:quantumshield4india@gmail.com" className="text-blue-400 hover:text-blue-300 text-sm">
            quantumshield4india@gmail.com
          </a>
        </div>
      </div>
    </div>
  </div>
</div>