import type { TabId } from '@/types/navigation';

export type CommandItem = {
  id: TabId;
  label: string;
  keywords?: string;
};

export const COMMAND_ITEMS: CommandItem[] = [
  { id: 'home', label: 'Home', keywords: 'dashboard main' },
  { id: 'scanner', label: 'AI Scanner', keywords: 'scan detect' },
  { id: 'apk', label: 'APK Guardian', keywords: 'apk malware' },
  { id: 'sms', label: 'SMS Guardian', keywords: 'sms fraud' },
  { id: 'downloads', label: 'Download Scanner', keywords: 'file scan' },
  { id: 'url', label: 'URL Checker', keywords: 'link phishing' },
  { id: 'spam', label: 'Spam Detection', keywords: 'spam ai' },
  { id: 'file', label: 'File Scanner', keywords: 'virus' },
  { id: 'encryption', label: 'File Encryption', keywords: 'encrypt security' },
  { id: 'breach', label: 'Breach Checker', keywords: 'leak password' },
  { id: 'ransomware', label: 'Ransomware Detector', keywords: 'ransomware' },
  { id: 'device', label: 'Device Checkup', keywords: 'phone security health battery storage scan tuneup' },
  { id: 'phoneguard', label: 'Phone Number Guard', keywords: 'call spam trai voip spoof' },
  { id: 'scamdb', label: 'Scam Number Lookup', keywords: 'scam list number database' },
  { id: 'simprotection', label: 'SIM Protection', keywords: 'sim hijack swap' },
  { id: 'privacy', label: 'Privacy Shield', keywords: 'privacy permissions' },
  { id: 'whatsapp', label: 'WhatsApp Safety', keywords: 'whatsapp ghost pairing' },
  { id: 'news', label: 'Scam Intel', keywords: 'news alerts threat map intelligence awareness' },
  { id: 'education', label: 'Learn Cyber Safety', keywords: 'learn' },
  { id: 'evidence', label: 'Evidence Collector', keywords: 'proof capture' },
  { id: 'report', label: 'Police Report', keywords: 'complaint' },
  { id: 'aianalyzer', label: 'AI Call Analyzer', keywords: 'call fraud deepfake' },
  { id: 'emergency', label: 'Emergency Contacts', keywords: 'help sos' },
  { id: 'aboutai', label: 'About AI', keywords: 'about' },
  { id: 'legal-rights', label: 'My Legal Rights', keywords: 'legal rights complaint law fir authority report incident lawyer' },
  { id: 'sentinel', label: 'Sentinel: Privacy Sweep', keywords: 'hidden camera microphone tracker spy surveillance emf magnetometer lens privacy sweep room inspect' },
  { id: 'trust-search', label: 'Trust Search', keywords: 'verify trust official customer care support number website email upi scam check authentic' },
];
