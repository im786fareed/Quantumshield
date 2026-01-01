'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigationStore } from '@/store/navigation';
import type { TabId } from '@/types/navigation';
import { TAB_IDS } from '@/types/navigation';
import { Search, X } from 'lucide-react';

type CommandItem = {
  id: TabId;
  label: string;
};

const LABELS: Record<TabId, string> = {
  home: 'Home',
  scanner: 'AI Scanner',
  threats: 'Threat Intelligence',
  apk: 'APK Guardian',
  sms: 'SMS Guardian',
  downloads: 'Download Scanner',
  url: 'URL Checker',
  spam: 'Spam Detector',
  file: 'File Scanner',
  encryption: 'File Encryption',
  breach: 'Data Breach Check',
  ransomware: 'Ransomware Detector',
  device: 'Device Check',
  news: 'Latest News',
  education: 'Learn Cyber Safety',
  aboutai: 'About AI',
  evidence: 'Evidence Collector',
  report: 'Police Report',
  scamdb: 'Scam Database',
  aianalyzer: 'AI Call Analyzer',
  emergency: 'Emergency Contacts',
  simprotection: 'SIM Protection',
  devicescan: 'Device Scanner',
  whatsapp: 'WhatsApp Safety',
  awareness: 'Scam Awareness',
  privacy: 'Privacy Shield',
};

export default function CommandPalette() {
  const setTab = useNavigationStore((s) => s.setTab);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  const items: CommandItem[] = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        label: LABELS[id] ?? id,
      })),
    []
  );

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  /* Keyboard shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }

      if (!open) return;

      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown')
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      if (e.key === 'ArrowUp')
        setHighlight((h) => Math.max(h - 1, 0));

      if (e.key === 'Enter') {
        const selected = filtered[highlight];
        if (selected) {
          setTab(selected.id);
          setOpen(false);
          setQuery('');
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, highlight, open, setTab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32">
      <div className="w-full max-w-xl bg-neutral-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            placeholder="Search tools…"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
          />
          <button onClick={() => setOpen(false)}>
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-4 text-gray-400 text-sm">
              No results found
            </div>
          )}

          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setOpen(false);
                setQuery('');
              }}
              className={`w-full text-left px-4 py-3 text-sm transition ${
                idx === highlight
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 text-xs text-gray-500 border-t border-white/10">
          Press <kbd className="px-1 border rounded">Esc</kbd> to close • ↑ ↓ to
          navigate • Enter to open
        </div>
      </div>
    </div>
  );
}
