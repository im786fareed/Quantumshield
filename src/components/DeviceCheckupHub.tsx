'use client';
import { useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import BackToHome from './BackToHome';
import SystemTuneUp from './SystemTuneUp';
import DeviceSecurityScanner from './DeviceSecurityScanner';

type DeviceTab = 'health' | 'scan';

const TABS: { id: DeviceTab; label: string; labelHi: string; icon: any }[] = [
  { id: 'health', label: 'Health & Cleanup', labelHi: 'स्वास्थ्य और सफाई', icon: Activity },
  { id: 'scan', label: 'Security Scan', labelHi: 'सुरक्षा स्कैन', icon: ShieldCheck },
];

export default function DeviceCheckupHub({
  defaultTab = 'health',
  lang = 'en',
}: {
  defaultTab?: DeviceTab;
  lang?: 'en' | 'hi';
}) {
  const [tab, setTab] = useState<DeviceTab>(defaultTab);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <BackToHome />

        <div className="mb-2 mt-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            {lang === 'en' ? 'Device Checkup' : 'डिवाइस जांच'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {lang === 'en'
              ? 'Battery, storage, memory and a full security scan — all in one place.'
              : 'बैटरी, स्टोरेज, मेमोरी और पूरा सुरक्षा स्कैन — एक ही जगह।'}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 border-b border-white/10 mt-4">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition border-b-2 -mb-px ${
                  active
                    ? 'border-green-400 text-green-400'
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

      {/* Active panel — components render their own layout below the shared header */}
      <div className="pt-2">
        {tab === 'health' ? (
          <SystemTuneUp embedded />
        ) : (
          <DeviceSecurityScanner lang={lang} embedded />
        )}
      </div>
    </div>
  );
}
