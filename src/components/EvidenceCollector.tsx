'use client';
import { useState, useRef, useEffect } from 'react';
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

interface ScreenRecording {
  id: string;
  blob: Blob;
  url: string;
  timestamp: string;
  duration: number;
}

export default function EvidenceCollector({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [screenRecordings, setScreenRecordings] = useState<ScreenRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [screenRecordingDuration, setScreenRecordingDuration] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const screenMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenMediaStreamRef = useRef<MediaStream | null>(null);
  const screenChunksRef = useRef<Blob[]>([]);
  const screenDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      
      screenSection: 'Screen Recording',
      screenDesc: 'Record scammer\'s screen with audio (system + microphone)',
      startScreenRecording: 'Start Screen Recording',
      stopScreenRecording: 'Stop Screen Recording',
      screenRecording: 'Screen Recording',
      shareAudioWarning: '⚠️ Make sure to check "Share audio" when prompted!',
      
      evidenceList: 'Collected Evidence',
      noEvidence: 'No evidence collected yet',
      screenshot: 'Screenshot',
      audioRecording: 'Audio Recording',
      screenRecordingItem: 'Screen Recording',
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
        'Use screen recording to capture entire scam flow with audio',
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
      
      screenSection: 'स्क्रीन रिकॉर्डिंग',
      screenDesc: 'ऑडियो के साथ स्क्रीन रिकॉर्ड करें (सिस्टम + माइक्रोफ़ोन)',
      startScreenRecording: 'स्क्रीन रिकॉर्डिंग शुरू करें',
      stopScreenRecording: 'स्क्रीन रिकॉर्डिंग बंद करें',
      screenRecording: 'स्क्रीन रिकॉर्डिंग',
      shareAudioWarning: '⚠️ "ऑडियो शेयर करें" विकल्प को चेक करना सुनिश्चित करें!',
      
      evidenceList: 'एकत्रित सबूत',
      noEvidence: 'अभी तक कोई सबूत एकत्र नहीं किया गया',
      screenshot: 'स्क्रीनशॉट',
      audioRecording: 'ऑडियो रिकॉर्डिंग',
      screenRecordingItem: 'स्क्रीन रिकॉर्डिंग',
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
        'पूरे घोटाले के प्रवाह को ऑडियो के साथ कैप्चर करने के लिए स्क्रीन रिकॉर्डिंग का उपयोग करें',
        'फोन काटने से पहले सभी प्रासंगिक सबूत एकत्र करें',
        'सभी सबूत निर्यात करें और cybercrime.gov.in पर शिकायत दर्ज करें या 1930 पर कॉल करें',
        'मूल सबूत फ़ाइलों को सुरक्षित रखें - उन्हें संपादित या संशोधित न करें'
      ]
    }
  };

  const t = content[lang];

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenMediaStreamRef.current) {
        screenMediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      recordings.forEach(r => URL.revokeObjectURL(r.url));
      screenRecordings.forEach(r => URL.revokeObjectURL(r.url));
    };
  }, []);

  // Screenshot functionality
  const takeScreenshot = async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');

      stream.getTracks().forEach(track => track.stop());

      const screenshot: Screenshot = {
        id: Date.now().toString(),
        dataUrl,
        timestamp: new Date().toLocaleString()
      };

      setScreenshots(prev => [...prev, screenshot]);
      setSuccessMessage('Screenshot captured successfully!');
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
      setRecordingDuration(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2
        }
      });

      mediaStreamRef.current = stream;

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
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        setSuccessMessage('Audio recording saved successfully!');
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Audio recording error:', err);
      setError('Microphone permission denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  // Screen recording with audio functionality
  const startScreenRecording = async () => {
    try {
      setError('');
      screenChunksRef.current = [];
      setScreenRecordingDuration(0);
      
      // Request screen capture WITH audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      });

      // Also request microphone
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000
          }
        });
      } catch (micError) {
        console.warn('Microphone denied, continuing with screen audio only');
      }

      // Combine streams
      const combinedStream = new MediaStream();
      
      // Add video track
      displayStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      // Add screen audio (system audio)
      displayStream.getAudioTracks().forEach(track => {
        console.log('Adding screen audio:', track.label);
        combinedStream.addTrack(track);
      });

      // Add microphone audio if available
      if (micStream) {
        micStream.getAudioTracks().forEach(track => {
          console.log('Adding microphone:', track.label);
          combinedStream.addTrack(track);
        });
      }

      screenMediaStreamRef.current = combinedStream;

      // Create MediaRecorder with audio support
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      });

      screenMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          screenChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(screenChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const recording: ScreenRecording = {
          id: Date.now().toString(),
          blob,
          url,
          timestamp: new Date().toLocaleString(),
          duration: screenRecordingDuration
        };

        setScreenRecordings(prev => [...prev, recording]);
        
        // Cleanup
        if (screenMediaStreamRef.current) {
          screenMediaStreamRef.current.getTracks().forEach(track => track.stop());
          screenMediaStreamRef.current = null;
        }

        setSuccessMessage('Screen recording saved successfully!');
      };

      // Handle user stopping screen share manually
      combinedStream.getVideoTracks()[0].onended = () => {
        if (isScreenRecording) {
          stopScreenRecording();
        }
      };

      mediaRecorder.start(100);
      setIsScreenRecording(true);

      // Start duration counter
      screenDurationIntervalRef.current = setInterval(() => {
        setScreenRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Screen recording error:', err);
      setError('Screen recording permission denied. Make sure to check "Share audio" when prompted.');
    }
  };

  const stopScreenRecording = () => {
    if (screenMediaRecorderRef.current && isScreenRecording) {
      screenMediaRecorderRef.current.stop();
      setIsScreenRecording(false);
      
      if (screenDurationIntervalRef.current) {
        clearInterval(screenDurationIntervalRef.current);
        screenDurationIntervalRef.current = null;
      }
    }
  };

  // Download functions
  const downloadScreenshot = (screenshot: Screenshot, index: number) => {
    const a = document.createElement('a');
    a.href = screenshot.dataUrl;
    a.download = `screenshot-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadRecording = (recording: Recording, index: number) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `audio-${index + 1}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadScreenRecording = (recording: ScreenRecording, index: number) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `screen-evidence-${index + 1}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete functions
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

  const deleteScreenRecording = (id: string) => {
    const recording = screenRecordings.find(r => r.id === id);
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    setScreenRecordings(prev => prev.filter(r => r.id !== id));
  };

  const deleteAll = () => {
    if (confirm('Delete all evidence? This cannot be undone.')) {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
      screenRecordings.forEach(r => URL.revokeObjectURL(r.url));
      setScreenshots([]);
      setRecordings([]);
      setScreenRecordings([]);
      setSuccessMessage('All evidence deleted');
    }
  };

  // Export all evidence as ZIP
  const exportAll = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add screenshots
      screenshots.forEach((screenshot, index) => {
        const base64Data = screenshot.dataUrl.split(',')[1];
        zip.file(`screenshot-${index + 1}.png`, base64Data, { base64: true });
      });

      // Add audio recordings
      recordings.forEach((recording, index) => {
        zip.file(`audio-${index + 1}.webm`, recording.blob);
      });

      // Add screen recordings
      screenRecordings.forEach((recording, index) => {
        zip.file(`screen-recording-${index + 1}.webm`, recording.blob);
      });

      // Add evidence report
      const report = `
EVIDENCE COLLECTION REPORT
Generated: ${new Date().toLocaleString()}
========================================

SUMMARY:
- Screenshots: ${screenshots.length}
- Audio Recordings: ${recordings.length}
- Screen Recordings: ${screenRecordings.length}
- Total Evidence Items: ${totalEvidence}

SCREENSHOTS:
${screenshots.map((s, i) => `${i + 1}. Captured at: ${s.timestamp}`).join('\n')}

AUDIO RECORDINGS:
${recordings.map((r, i) => `${i + 1}. Recorded at: ${r.timestamp}, Duration: ${formatDuration(r.duration)}`).join('\n')}

SCREEN RECORDINGS:
${screenRecordings.map((r, i) => `${i + 1}. Recorded at: ${r.timestamp}, Duration: ${formatDuration(r.duration)}`).join('\n')}

========================================
This evidence was collected using QuantumShield Evidence Collector
For filing complaints: cybercrime.gov.in or call 1930
Keep original files safe - do not edit or modify
      `;
      
      zip.file('EVIDENCE_REPORT.txt', report);

      // Generate zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('All evidence exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export evidence. Please try downloading items individually.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalEvidence = screenshots.length + recordings.length + screenRecordings.length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-red-100">{t.subtitle}</p>
        {totalEvidence > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 inline-block">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{totalEvidence} Evidence Item{totalEvidence !== 1 ? 's' : ''} Collected</span>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-green-200 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3 animate-fade-in">
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
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Screenshots */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-6 h-6 text-blue-400" />
            <h2 className="font-bold text-xl">{t.screenshotSection}</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">{t.screenshotDesc}</p>
          <button
            onClick={takeScreenshot}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
            <Camera className="w-5 h-5" />
            {t.takeScreenshot}
          </button>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Total: {screenshots.length}</span>
            {screenshots.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* Audio Recording */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-red-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-6 h-6 text-red-400" />
            <h2 className="font-bold text-xl">{t.audioSection}</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">{t.audioDesc}</p>
          
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
              <Mic className="w-5 h-5" />
              {t.startRecording}
            </button>
          ) : (
            <div>
              <button
                onClick={stopRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mb-3">
                <Mic className="w-5 h-5" />
                {t.stopRecording}
              </button>
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold">{t.recording}: {formatDuration(recordingDuration)}</span>
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Total: {recordings.length}</span>
            {recordings.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* Screen Recording with Audio */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-6 h-6 text-purple-400" />
            <h2 className="font-bold text-xl">{t.screenSection}</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">{t.screenDesc}</p>
          
          {!isScreenRecording ? (
            <button
              onClick={startScreenRecording}
              className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
              <Video className="w-5 h-5" />
              {t.startScreenRecording}
            </button>
          ) : (
            <div>
              <button
                onClick={stopScreenRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mb-3">
                <Video className="w-5 h-5" />
                {t.stopScreenRecording}
              </button>
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="font-bold">{t.screenRecording}: {formatDuration(screenRecordingDuration)}</span>
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Total: {screenRecordings.length}</span>
            {screenRecordings.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
          <p className="text-xs text-yellow-400 mt-2">
            {t.shareAudioWarning}
          </p>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-2xl">{t.evidenceList}</h2>
          {totalEvidence > 0 && (
            <div className="flex gap-2">
              <button
                onClick={exportAll}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105">
                <Download className="w-4 h-4" />
                {t.exportAll}
              </button>
              <button
                onClick={deleteAll}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all">
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
              <div key={screenshot.id} className="bg-black/50 rounded-lg p-4 flex items-center justify-between hover:bg-black/70 transition-all border border-white/5">
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
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all hover:scale-110">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteScreenshot(screenshot.id)}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Recordings */}
            {recordings.map((recording, index) => (
              <div key={recording.id} className="bg-black/50 rounded-lg p-4 hover:bg-black/70 transition-all border border-white/5">
                <div className="flex items-center justify-between mb-3">
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
                      className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-all hover:scale-110">
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <audio 
                  src={recording.url} 
                  controls 
                  className="w-full mt-2"
                  style={{ height: '40px' }}
                />
              </div>
            ))}

            {/* Screen Recordings */}
            {screenRecordings.map((recording, index) => (
              <div key={recording.id} className="bg-black/50 rounded-lg p-4 hover:bg-black/70 transition-all border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Video className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="font-semibold">{t.screenRecordingItem} #{index + 1}</p>
                      <p className="text-xs text-gray-400">
                        {t.timestamp}: {recording.timestamp} | {t.duration}: {formatDuration(recording.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadScreenRecording(recording, index)}
                      className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-all hover:scale-110">
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteScreenRecording(recording.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <video 
                  src={recording.url} 
                  controls 
                  className="w-full rounded-lg bg-black mt-2"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to Use */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
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
