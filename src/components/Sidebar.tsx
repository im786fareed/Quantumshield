'use client';

import React from 'react';
import {
  Home,
  Scan,
  TrendingUp,
  Shield,
  MessageSquare,
  Download,
  Link as LinkIcon,
  FileSearch,
  Lock,
  Database,
  AlertTriangle,
  Smartphone,
  GraduationCap,
  Brain,
  Camera,
  Phone,
  MessageCircle,
  Newspaper,
  Search,
} from 'lucide-react';

import { useNavigationStore } from '@/store/navigation';
import type { TabId } from '@/types/navigation';

type Language = 'en' | 'hi';

type NavItem = {
  id: TabId;
  label: string;
  icon: React.ElementType;
};

const NAV_ITEMS: Record<Language, NavItem[]> = {
  en: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'threats', label: 'Threat Intel', icon: TrendingUp },
    { id: 'apk', label: 'APK Guardian', icon: Shield },
    { id: 'sms', label: 'SMS Guardian', icon: MessageSquare },
    { id: 'downloads', label: 'Download Scanner', icon: Download },
    { id: 'url', label: 'URL Check', icon: LinkIcon },
    { id: 'spam', label: 'Spam AI', icon: MessageSquare },
    { id: 'file', label: 'File Scan', icon: FileSearch },
    { id: 'encryption', label: 'File Encryption', icon: Lock },
    { id: 'breach', label: 'Breach Check', icon: Database },
    { id: 'ransomware', label: 'Ransomware Detect', icon: AlertTriangle },
    { id: 'device', label: 'Device Check', icon: Smartphone },
    { id: 'news', label: 'Latest Threats', icon: TrendingUp },
    { id: 'education', label: 'Learn Safety', icon: GraduationCap },
    { id: 'aboutai', label: 'AI Tech', icon: Brain },
    { id: 'evidence', label: 'Evidence Collector', icon: Camera },
    { id: 'report', label: 'Police Report', icon: Shield },
    { id: 'scamdb', label: 'Scam Database', icon: Database },
    { id: 'aianalyzer', label: 'AI Call Analyzer', icon: Brain },
    { id: 'emergency', label: 'Emergency Contacts', icon: Phone },
    { id: 'simprotection', label: 'SIM Protection', icon: Smartphone },
    { id: 'devicescan', label: 'Device Scanner', icon: Search },
    { id: 'whatsapp', label: 'WhatsApp Safety', icon: MessageCircle },
    { id: 'awareness', label: 'Scam Alerts', icon: Newspaper },
    { id: 'privacy', label: 'Privacy Shield', icon: Lock },
  ],
  hi: [],
};

export default function Sidebar({ language = 'en' }: { language?: Language }) {
  const activeTab = useNavigationStore((s) => s.activeTab);
  const setTab = useNavigationStore((s) => s.setTab);

  return (
    <aside className="hidden lg:block w-64 h-full border-r border-white/10 bg-black/30 backdrop-blur">
      <nav className="p-4 space-y-1">
        {NAV_ITEMS[language].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }
              `}
            >
              <Icon
  className={`w-5 h-5 transition-transform duration-200 ${
    activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
  }`}
/>

              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
