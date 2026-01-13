'use client';
import { useState, useRef } from 'react';
import { Camera, Mic, Video, Download, Trash2, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Screenshot {
  id: string;
  dataUrl: string;
  timestamp: string;
}

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  timestamp: string;
  duration: number;
}

export default function EvidenceCollector({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const content = {
    en: {
      title: '📸 Evidence Collector',
      subtitle: 'Collect legal evidence during scam calls - Screenshots, recordings, and documentation',
      
      screenshotSection: 'Screenshots',
      screenshotDesc: 'Capture screenshots of scam messages, caller IDs, or suspicious content',
      takeScreenshot: 'Take Screenshot',
      
      audioSection: 'Audio Recordings',
      audioDesc: 'Record scam calls legally (ensure you inform the caller you\'re recording)',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      recording: 'Recording',
      
      evidenceList: 'Collected Evidence',
      noEvidence: 'No evidence collected yet',
      screenshot: 'Screenshot',
      audioRecording: 'Audio Recording',
      duration: 'Duration',
      timestamp: 'Timestamp',
      download: 'Download',
      delete: 'Delete',
      deleteAll: 'Delete All',
      exportAll: 'Export All Evidence',
      
      legalNotice: 'Legal Notice',
      legalText: 'This evidence can be used for police complaints. Keep originals safe. Recording calls may require informing the other party depending on your state laws.',
      
      howToUse: 'How to Use',
      steps: [
        'During a scam call, take screenshots of caller ID, messages, or payment requests',
        'Start audio recording (inform caller if legally required)',
        'Capture all relevant evidence before hanging up',
        'Export all evidence and file a complaint at cybercrime.gov.in or call 1930',
        'Keep original evidence files safe - do not edit or modify them'
      ],
      
      tips: 'Evidence Collection Tips',
      tipsList: [
        'Capture caller ID and phone number clearly',
        'Screenshot any messages, links, or payment requests',
        'Record full conversation if possible',
        'Note date, time, and what was said',
        'Save evidence in multiple locations'
      ]
    },
    hi: {
      title: '📸 सबूत संग्राहक',
      subtitle: 'घोटाले की कॉल के दौरान कानूनी सबूत एकत्र करें - स्क्रीनशॉट, रिकॉर्डिंग, और दस्तावेज़ीकरण',
      
      screenshotSection: 'स्क्रीनशॉट',
      screenshotDesc: 'घोटाले के संदेश, कॉलर आईडी, या संदिग्ध सामग्री के स्क्रीनशॉट लें',
      takeScreenshot: 'स्क्रीनशॉट लें',
      
      audioSection: 'ऑडियो रिकॉर्डिंग',
      audioDesc: 'घोटाले की कॉल को कानूनी रूप से रिकॉर्ड करें (सुनिश्चित करें कि आप कॉलर को सूचित करें)',
      startRecording: 'रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग बंद करें',
      recording: 'रिकॉर्ड हो रहा है',
      
      evidenceList: 'एकत्रित सबूत',
      noEvidence: 'अभी तक कोई सबूत एकत्र नहीं किया गया',
      screenshot: 'स्क्रीनशॉट',
      audioRecording: 'ऑडियो रिकॉर्डिंग',
      duration: 'अवधि',
      timestamp: 'समय',
      download: 'डाउनलोड',
      delete: 'हटाएं',
      deleteAll: 'सभी हटाएं',
      exportAll: 'सभी सबूत निर्यात करें',
      
      legalNotice: 'कानूनी सूचना',
      legalText: 'यह सबूत पुलिस शिकायत के लिए उपयोग किया जा सकता है। मूल को सुरक्षित रखें।',
      
      howToUse: 'उपयोग कैसे करें',
      steps: [
        'घोटाले की कॉल के दौरान, कॉलर आईडी, संदेश या भुगतान अनुरोध के स्क्रीनशॉट लें',
        'ऑडियो रिकॉर्डिंग शुरू करें (यदि कानूनी रूप से आवश्यक हो तो कॉलर को सूचित करें)',
        'फोन काटने से पहले सभी प्रासंगिक सबूत एकत्र करें',
        'सभी सबूत निर्यात करें और cybercrime.gov.in पर शिकायत दर्ज करें या 1930 पर कॉल करें',
        'मूल सबूत फ़ाइलों को सुरक्षित रखें - उन्हें संपादित या संशोधित न करें'
      ]
    }
  };

  const t = content[lang];

  // Screenshot functionality
  const takeScreenshot = async () => {
    try {
      setError('');
      
      // Request screen capture
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true
});

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Save screenshot
      const screenshot: Screenshot = {
        id: Date.now().toString(),
        dataUrl,
        timestamp: new Date().toLocaleString()
      };

      setScreenshots(prev => [...prev, screenshot]);
    } catch (err) {
      console.error('Screenshot error:', err);
      setError('Screenshot permission denied or not supported in this browser');
    }
  };

  // Audio recording functionality
  const startRecording = async () => {
    try {
      setError('');
      chunksRef.current = [];
      
      // Request audio with high quality settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 1
        }
      });

      mediaStreamRef.current = stream;

      // Create MediaRecorder with best available format
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        const recording: Recording = {
          id: Date.now().toString(),
          blob,
          url,
          timestamp: new Date().toLocaleString(),
          duration: recordingDuration
        };

        setRecordings(prev => [...prev, recording]);
        
        // Cleanup
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      setError('Microphone permission denied or not supported');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  // Download functions
  const downloadScreenshot = (screenshot: Screenshot, index: number) => {
    const link = document.createElement('a');
    link.href = screenshot.dataUrl;
    link.download = `scam-evidence-screenshot-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRecording = (recording: Recording, index: number) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `scam-evidence-recording-${Date.now()}-${index + 1}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAll = () => {
    // Create text report
    let report = `SCAM EVIDENCE REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Screenshots: ${screenshots.length}\n`;
    report += `Total Recordings: ${recordings.length}\n\n`;
    
    report += `SCREENSHOTS:\n`;
    screenshots.forEach((s, i) => {
      report += `${i + 1}. Captured at: ${s.timestamp}\n`;
    });
    
    report += `\nAUDIO RECORDINGS:\n`;
    recordings.forEach((r, i) => {
      report += `${i + 1}. Recorded at: ${r.timestamp}, Duration: ${formatDuration(r.duration)}\n`;
    });
    
    report += `\nNEXT STEPS:\n`;
    report += `1. File complaint at https://cybercrime.gov.in\n`;
    report += `2. Call National Cybercrime Helpline: 1930\n`;
    report += `3. Keep all original evidence files safe\n`;

    // Download report
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scam-evidence-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Download all screenshots
    screenshots.forEach((s, i) => downloadScreenshot(s, i));
    
    // Download all recordings
    recordings.forEach((r, i) => downloadRecording(r, i));
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const deleteRecording = (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const deleteAll = () => {
    if (confirm('Delete all evidence? This cannot be undone.')) {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
      setScreenshots([]);
      setRecordings([]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalEvidence = screenshots.length + recordings.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-red-100">{t.subtitle}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Legal Notice */}
      <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-400 mb-1">{t.legalNotice}</h3>
            <p className="text-sm text-gray-300">{t.legalText}</p>
          </div>
        </div>
      </div>

      {/* Collection Tools */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Screenshots */}
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-6 h-6 text-blue-400" />
            <h2 className="font-bold text-xl">{t.screenshotSection}</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">{t.screenshotDesc}</p>
          <button
            onClick={takeScreenshot}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <Camera className="w-5 h-5" />
            {t.takeScreenshot}
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Total Screenshots: {screenshots.length}
          </p>
        </div>

        {/* Audio Recording */}
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-6 h-6 text-red-400" />
            <h2 className="font-bold text-xl">{t.audioSection}</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">{t.audioDesc}</p>
          
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
              <Mic className="w-5 h-5" />
              {t.startRecording}
            </button>
          ) : (
            <div>
              <button
                onClick={stopRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition mb-3">
                <Mic className="w-5 h-5" />
                {t.stopRecording}
              </button>
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold">{t.recording}: {formatDuration(recordingDuration)}</span>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-3">
            Total Recordings: {recordings.length}
          </p>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-2xl">{t.evidenceList}</h2>
          {totalEvidence > 0 && (
            <div className="flex gap-2">
              <button
                onClick={exportAll}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t.exportAll}
              </button>
              <button
                onClick={deleteAll}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t.deleteAll}
              </button>
            </div>
          )}
        </div>

        {totalEvidence === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p>{t.noEvidence}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Screenshots */}
            {screenshots.map((screenshot, index) => (
              <div key={screenshot.id} className="bg-black/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="font-semibold">{t.screenshot} #{index + 1}</p>
                    <p className="text-xs text-gray-400">{t.timestamp}: {screenshot.timestamp}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadScreenshot(screenshot, index)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteScreenshot(screenshot.id)}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Recordings */}
            {recordings.map((recording, index) => (
              <div key={recording.id} className="bg-black/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="font-semibold">{t.audioRecording} #{index + 1}</p>
                    <p className="text-xs text-gray-400">
                      {t.timestamp}: {recording.timestamp} | {t.duration}: {formatDuration(recording.duration)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadRecording(recording, index)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to Use */}
      <div className="bg-white/5 rounded-xl p-6">
        <h2 className="font-bold text-xl mb-4">{t.howToUse}</h2>
        <ol className="space-y-3">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}