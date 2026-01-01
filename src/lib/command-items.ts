import type { TabId } from '@/types/navigation';

export type CommandItem = {
  id: TabId;
  label: string;
  keywords?: string;
};

export const COMMAND_ITEMS: CommandItem[] = [
  { id: 'home', label: 'Home', keywords: 'dashboard main' },
  { id: 'scanner', label: 'AI Scanner', keywords: 'scan detect' },
  { id: 'threats', label: 'Threat Intelligence', keywords: 'intel threat' },
  { id: 'apk', label: 'APK Guardian', keywords: 'apk malware' },
  { id: 'sms', label: 'SMS Guardian', keywords: 'sms fraud' },
  { id: 'downloads', label: 'Download Scanner', keywords: 'file scan' },
  { id: 'url', label: 'URL Checker', keywords: 'link phishing' },
  { id: 'spam', label: 'Spam Detection', keywords: 'spam ai' },
  { id: 'file', label: 'File Scanner', keywords: 'virus' },
  { id: 'encryption', label: 'File Encryption', keywords: 'encrypt security' },
  { id: 'breach', label: 'Breach Checker', keywords: 'leak password' },
  { id: 'ransomware', label: 'Ransomware Detector', keywords: 'ransomware' },
  { id: 'device', label: 'Device Check', keywords: 'phone security' },
  { id: 'news', label: 'Latest Threats', keywords: 'news alerts' },
  { id: 'education', label: 'Learn Cyber Safety', keywords: 'learn' },
  { id: 'aboutai', label: 'About AI', keywords: 'about' },
  { id: 'evidence', label: 'Evidence Collector', keywords: 'proof capture' },
  { id: 'report', label: 'Police Report', keywords: 'complaint' },
  { id: 'scamdb', label: 'Scam Database', keywords: 'scam list' },
  { id: 'aianalyzer', label: 'AI Call Analyzer', keywords: 'call fraud' },
  { id: 'emergency', label: 'Emergency Contacts', keywords: 'help sos' },
  { id: 'simprotection', label: 'SIM Protection', keywords: 'sim hijack' },
  { id: 'devicescan', label: 'Device Scanner', keywords: 'scan device' },
  { id: 'whatsapp', label: 'WhatsApp Safety', keywords: 'whatsapp' },
  { id: 'awareness', label: 'Scam Alerts', keywords: 'alerts' },
  { id: 'privacy', label: 'Privacy Shield', keywords: 'privacy' },
];
