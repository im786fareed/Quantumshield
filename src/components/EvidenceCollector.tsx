'use client';
import { useState, useRef } from 'react';
import { Camera, Video, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface Evidence {
  type: 'screenshot' | 'recording' | 'notes';
  data: string;
  timestamp: number;
}

export default function EvidenceCollector({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [recording, setRecording] = useState(false);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [notes, setNotes] = useState('');

  const content = {
    en: {
      title: '📸 Evidence Collector',
      subtitle: 'Collect evidence safely and legally for police reports',
      screenshot: 'Take Screenshot',
      startRecording: 'Start Screen Recording',
      stopRecording: 'Stop Recording',
      addNotes: 'Add Notes/Details',
      notesPlaceholder: 'Describe what happened: caller name, threats made, money demanded, etc.',
      downloadAll: 'Download Evidence Package',
      evidenceList: 'Collected Evidence',
      noEvidence: 'No evidence collected yet',
      warning: '⚠️ Legal Notice',
      warningText: 'This tool records YOUR screen/data only. Never attempt to hack or access scammer\'s device.',
      howTo: 'How to Use',
      steps: [
        'Keep this tab open during suspicious call',
        'Click "Take Screenshot" to capture proof',
        'Use "Screen Recording" to record the entire call',
        'Add detailed notes about what happened',
        'Download evidence package for police report'
      ]
    },
    hi: {
      title: '📸 सबूत संग्रहकर्ता',
      subtitle: 'पुलिस रिपोर्ट के लिए सुरक्षित और कानूनी रूप से सबूत एकत्र करें',
      screenshot: 'स्क्रीनशॉट लें',
      startRecording: 'स्क्रीन रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग बंद करें',
      addNotes: 'नोट्स/विवरण जोड़ें',
      notesPlaceholder: 'क्या हुआ बताएं: कॉलर का नाम, धमकियां, मांगी गई रकम, आदि',
      downloadAll: 'सबूत पैकेज डाउनलोड करें',
      evidenceList: 'एकत्रित सबूत',
      noEvidence: 'अभी तक कोई सबूत एकत्र नहीं किया गया',
      warning: '⚠️ कानूनी सूचना',
      warningText: 'यह टूल केवल आपकी स्क्रीन/डेटा रिकॉर्ड करता है। कभी भी स्कैमर के डिवाइस को हैक करने का प्रयास न करें।',
      howTo: 'उपयोग कैसे करें',
      steps: [
        'संदिग्ध कॉल के दौरान इस टैब को खुला रखें',
        'सबूत कैप्चर करने के लिए "स्क्रीनशॉट लें" पर क्लिक करें',
        'पूरी कॉल रिकॉर्ड करने के लिए "स्क्रीन रिकॉर्डिंग" का उपयोग करें',
        'क्या हुआ इसके बारे में विस्तृत नोट्स जोड़ें',
        'पुलिस रिपोर्ट के लिए सबूत पैकेज डाउनलोड करें'
      ]
    }
  };

  const t = content[lang];

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      const screenshot = canvas.toDataURL('image/png');
      
      setEvidence(prev => [...prev, {
        type: 'screenshot',
        data: screenshot,
        timestamp: Date.now()
      }]);

      alert('✅ Screenshot captured!');
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('❌ Screenshot failed. Make sure you grant permission.');
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        setEvidence(prev => [...prev, {
          type: 'recording',
          data: url,
          timestamp: Date.now()
        }]);

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setRecording(true);

    } catch (error) {
      console.error('Recording failed:', error);
      alert('❌ Recording failed. Make sure you grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
      alert('✅ Recording saved!');
    }
  };

  const saveNotes = () => {
    if (!notes.trim()) {
      alert('Please write some notes first!');
      return;
    }

    setEvidence(prev => [...prev, {
      type: 'notes',
      data: notes,
      timestamp: Date.now()
    }]);

    setNotes('');
    alert('✅ Notes saved!');
  };

  const downloadEvidencePackage = () => {
    if (evidence.length === 0) {
      alert('No evidence to download yet!');
      return;
    }

    // Create evidence report
    const report = {
      generatedAt: new Date().toISOString(),
      totalEvidence: evidence.length,
      items: evidence.map((item, index) => ({
        id: index + 1,
        type: item.type,
        timestamp: new Date(item.timestamp).toISOString(),
        data: item.type === 'notes' ? item.data : '[Binary Data]'
      }))
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scam-evidence-${Date.now()}.json`;
    a.click();

    alert('✅ Evidence package downloaded! Submit this to police along with screenshots/recordings.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-blue-100">{t.subtitle}</p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-400 mb-1">{t.warning}</h3>
            <p className="text-sm text-yellow-200">{t.warningText}</p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">{t.howTo}</h3>
        <ol className="space-y-2">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={takeScreenshot}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
        >
          <Camera className="w-5 h-5" />
          {t.screenshot}
        </button>

        <button
          onClick={recording ? stopRecording : startScreenRecording}
          className={`${
            recording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition`}
        >
          <Video className="w-5 h-5" />
          {recording ? t.stopRecording : t.startRecording}
          {recording && <span className="animate-pulse">●</span>}
        </button>
      </div>

      {/* Notes Section */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <label className="block font-bold mb-2">{t.addNotes}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          className="w-full bg-black/50 border border-white/10 rounded-xl p-4 min-h-32 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={saveNotes}
          className="mt-3 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <FileText className="w-5 h-5" />
          Save Notes
        </button>
      </div>

      {/* Evidence List */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">{t.evidenceList}</h3>
        
        {evidence.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{t.noEvidence}</p>
        ) : (
          <div className="space-y-3">
            {evidence.map((item, index) => (
              <div key={index} className="bg-black/50 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.type === 'screenshot' && <Camera className="w-5 h-5 text-blue-400" />}
                  {item.type === 'recording' && <Video className="w-5 h-5 text-red-400" />}
                  {item.type === 'notes' && <FileText className="w-5 h-5 text-purple-400" />}
                  
                  <div>
                    <div className="font-semibold capitalize">{item.type}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Download Button */}
      {evidence.length > 0 && (
        <button
          onClick={downloadEvidencePackage}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition"
        >
          <Download className="w-6 h-6" />
          {t.downloadAll} ({evidence.length} items)
        </button>
      )}
    </div>
  );
}