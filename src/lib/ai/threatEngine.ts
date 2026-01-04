// Unified Threat Engine for QuantumShield
// Handles: Data Loss Prevention, Digital Arrest Detection, and Financial Scams

export const SCAM_DATABASE = {
  // Patterns that suggest someone is trying to wipe your phone or access it
  dataLoss: [
    'reset', 'format', 'factory settings', 'delete all', 'erase data', 
    'anydesk', 'teamviewer', 'rustdesk', 'remote control', 'screen share'
  ],
  // Patterns for Digital Arrest scams (CBI, Police, Customs)
  digitalArrest: [
    'digital arrest', 'cbi', 'narcotics', 'customs', 'money laundering', 
    'illegal parcel', 'skype call', 'whatsapp video', 'police station',
    'arrest warrant', 'supreme court', 'central bureau'
  ],
  // General financial fraud
  financial: [
    'otp', 'password', 'transaction limit', 'beneficiary', 'kyc update',
    'account blocked', 'unauthorized transaction'
  ]
};

export const analyzeThreat = (text: string) => {
  const lowerText = text.toLowerCase();
  
  // 1. Check for Emergency Data Loss (Highest Priority)
  const dataLossMatch = SCAM_DATABASE.dataLoss.find(word => lowerText.includes(word));
  if (dataLossMatch) {
    return {
      type: 'EMERGENCY_DATA_LOSS',
      riskScore: 100,
      riskLevel: 'dangerous',
      message: "🚨 EMERGENCY: Caller is trying to wipe your data or access your device remotely! DO NOT follow instructions. Disconnect and turn off internet now."
    };
  }

  // 2. Check for Digital Arrest Fraud
  const isWhatsAppPolice = lowerText.includes('whatsapp') && (lowerText.includes('police') || lowerText.includes('arrest'));
  const arrestMatch = SCAM_DATABASE.digitalArrest.find(word => lowerText.includes(word));
  
  if (isWhatsAppPolice || arrestMatch) {
    return {
      type: 'CYBER_FRAUD_DIGITAL_ARREST',
      riskScore: 98,
      riskLevel: 'dangerous',
      message: "🚨 SCAM DETECTED: Indian Authorities NEVER conduct 'Digital Arrests' over WhatsApp Video calls. This is a scam. HANG UP IMMEDIATELY and report to 1930."
    };
  }

  // 3. Check for Financial Scams
  const financialMatch = SCAM_DATABASE.financial.find(word => lowerText.includes(word));
  if (financialMatch) {
    return {
      type: 'FINANCIAL_SCAM',
      riskScore: 85,
      riskLevel: 'suspicious',
      message: "⚠️ SUSPICIOUS: This call mentions sensitive banking details. Do not share OTPs or passwords."
    };
  }

  return { 
    type: 'SAFE', 
    riskScore: 10, 
    riskLevel: 'safe', 
    message: "No immediate scam patterns detected. Stay alert." 
  };
};