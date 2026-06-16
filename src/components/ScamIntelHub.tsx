'use client';
import { useState } from 'react';
import { Newspaper, Bell, TrendingUp } from 'lucide-react';
import BackToHome from './BackToHome';
import LatestNews from './LatestNews';
import ScamAwarenessCenter from './ScamAwarenessCenter';
import ThreatIntelligence from './ThreatIntelligence';

type IntelTab = 'news' | 'alerts' | 'map';

const TABS: { id: IntelTab; label: string; labelHi: string; icon: any }[] = [
  { id: 'news', label: 'Live News', labelHi: 'ताज़ा समाचार', icon: Newspaper },
  { id: 'alerts', label: 'Scam Alerts', labelHi: 'स्कैम अलर्ट', icon: Bell },
  { id: 'map', label: 'Threat Map', labelHi: 'खतरा मैप', icon: TrendingUp },
];

export default function ScamIntelHub({
  defaultTab = 'news',
  lang = 'en',
}: {
  defaultTab?: IntelTab;
  lang?: 'en' | 'hi';
}) {
  const [tab, setTab] = useState<IntelTab>(defaultTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <BackToHome />

        <div className="mb-2 mt-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {lang === 'en' ? 'Scam Intel' : 'स्कैम इंटेल'}
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            {lang === 'en'
              ? 'Latest fraud news, live scam alerts and the national threat map — one feed.'
              : 'ताज़ा धोखाधड़ी समाचार, लाइव स्कैम अलर्ट और राष्ट्रीय खतरा मैप — एक फ़ीड।'}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 border-b border-white/10 mt-4 overflow-x-auto">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition border-b-2 -mb-px ${
                  active
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {lang === 'en' ? tb.label : tb.labelHi}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        {tab === 'news' && <LatestNews lang={lang} />}
        {tab === 'alerts' && <ScamAwarenessCenter lang={lang} />}
        {tab === 'map' && <ThreatIntelligence lang={lang} />}
      </div>
    </div>
  );
}
