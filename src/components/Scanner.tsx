'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { triggerEmergency } from '@/lib/emergencyTrigger';

import {
  Activity,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Share2,
} from 'lucide-react';

interface Props {
  lang: 'en' | 'hi';
}

interface ScanResult {
  verdict: 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'DANGER';
  riskScore: number;
  message: string;
  explanation?: string;
  indicators?: any;
  actions?: string[];
}

const CONTENT = {
  en: {
    title: 'AI Scam Detection',
    subtitle: 'Advanced machine learning algorithms detect cyber threats',
    textTab: 'Text Message',
    imageTab: 'Image',
    textPlaceholder: 'Paste suspicious message here...',
    imagePlaceholder: 'Upload image for AI analysis',
    scanButton: 'AI Scan Now',
    scanning: 'AI analyzing...',
    result: 'AI Analysis Result',
    riskScore: 'Threat Level',
    whatToDo: 'Recommended Actions',
    shareResult: 'Share Result',
    scanAnother: 'Scan Another',
    disclaimer:
      'Powered by AI algorithms trained on millions of cyber fraud patterns. Always verify through official channels.',
  },
  hi: {
    title: 'AI स्कैम पहचान',
    subtitle: 'उन्नत मशीन लर्निंग एल्गोरिदम साइबर खतरों का पता लगाते हैं',
    textTab: 'टेक्स्ट संदेश',
    imageTab: 'छवि',
    textPlaceholder: 'संदिग्ध संदेश यहां पेस्ट करें',
    imagePlaceholder: 'AI विश्लेषण के लिए छवि अपलोड करें',
    scanButton: 'AI स्कैन करें',
    scanning: 'AI विश्लेषण हो रहा है',
    result: 'AI विश्लेषण परिणाम',
    riskScore: 'खतरे का स्तर',
    whatToDo: 'अनुशंसित कार्रवाई',
    shareResult: 'परिणाम साझा करें',
    scanAnother: 'फिर स्कैन करें',
    disclaimer:
      'यह AI आधारित सिस्टम है — महत्वपूर्ण मामलों में आधिकारिक स्रोतों से पुष्टि करें।',
  },
};

export default function Scanner({ lang }: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState('');
  const [imageData, setImageData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const content = CONTENT[lang];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => setImageData(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    setIsScanning(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          data: activeTab === 'text' ? textInput : imageData,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data: ScanResult = await res.json();
      setResult(data);

      if (data.verdict === 'SAFE') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      /** 🔴 AUTO-TRIGGER EMERGENCY MODE */
      if (data.verdict === 'SCAM' || data.verdict === 'DANGER') {
        triggerEmergency((tab) => {
          router.push(`/${tab}`);
        });
      }
    } catch (err) {
      setResult({
        verdict: 'SUSPICIOUS',
        riskScore: 50,
        message: 'Scan temporarily unavailable.',
        explanation:
          err instanceof Error ? err.message : 'Unexpected error occurred',
        actions: [
          'Refresh and try again',
          'Check your internet connection',
          'Contact support if issue persists',
        ],
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getVerdictColor = (v: string) =>
    v === 'SAFE'
      ? 'text-green-400 bg-green-500/20 border-green-500/50'
      : v === 'SUSPICIOUS'
      ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      : 'text-red-400 bg-red-500/20 border-red-500/50';

  const getVerdictIcon = (v: string) =>
    v === 'SAFE' ? (
      <CheckCircle className="w-12 h-12 text-green-400" />
    ) : v === 'SUSPICIOUS' ? (
      <AlertTriangle className="w-12 h-12 text-yellow-400" />
    ) : (
      <XCircle className="w-12 h-12 text-red-400" />
    );

  const reset = () => {
    setResult(null);
    setTextInput('');
    setImageData('');
  };

  const shareResult = () => {
    const msg = `QuantumShield Result: ${result?.verdict} (${result?.riskScore}%)`;
    if (navigator.share) navigator.share({ text: msg });
    else navigator.clipboard.writeText(msg);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-cyan-500/20 rounded-2xl mb-4">
          <Activity className="w-12 h-12 text-cyan-400" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{content.title}</h2>
        <p className="text-gray-400">{content.subtitle}</p>
      </div>

      {/* INPUT CARD */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 rounded-xl font-bold ${
              activeTab === 'text'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {content.textTab}
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-3 rounded-xl font-bold ${
              activeTab === 'image'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {content.imageTab}
          </button>
        </div>

        {activeTab === 'text' ? (
          <textarea
            className="w-full h-40 bg-black/40 rounded-xl p-4 border border-white/10"
            placeholder={content.textPlaceholder}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        ) : (
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <input
              type="file"
              accept="image/*"
              hidden
              id="upload"
              onChange={handleImageUpload}
            />
            <label
              htmlFor="upload"
              className="cursor-pointer bg-cyan-500 px-6 py-3 rounded-xl font-bold inline-block"
            >
              {content.imagePlaceholder}
            </label>
            {imageData && (
              <img src={imageData} className="mt-4 max-h-40 mx-auto rounded" />
            )}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isScanning || (!textInput && activeTab === 'text')}
          className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold"
        >
          {isScanning ? content.scanning : content.scanButton}
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className={`border-2 rounded-2xl p-6 ${getVerdictColor(result.verdict)}`}>
            <div className="flex gap-4 items-center mb-4">
              {getVerdictIcon(result.verdict)}
              <div>
                <h3 className="text-3xl font-bold">{result.verdict}</h3>
                <p>{content.riskScore}: {result.riskScore}%</p>
              </div>
            </div>

            <p className="mb-2">{result.message}</p>
            {result.explanation && <p className="text-gray-300">{result.explanation}</p>}
          </div>

          {result.actions && (
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="text-xl font-bold mb-3">{content.whatToDo}</h4>
              <ul className="space-y-2">
                {result.actions.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-cyan-400 font-bold">{i + 1}.</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={shareResult}
              className="flex-1 bg-green-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {content.shareResult}
            </button>

            <button
              onClick={reset}
              className="flex-1 bg-white/10 py-3 rounded-xl font-bold"
            >
              {content.scanAnother}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
