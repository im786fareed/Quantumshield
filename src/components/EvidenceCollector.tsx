'use client';
import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Video, Download, Trash2, FileText, AlertTriangle, CheckCircle, X, Smartphone } from 'lucide-react';

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

interface VideoRecording {
  id: string;
  blob: Blob;
  url: string;
  timestamp: string;
  duration: number;
}

export default function EvidenceCollector({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [videoRecordings, setVideoRecordings] = useState<VideoRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [videoRecordingDuration, setVideoRecordingDuration] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoMediaStreamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // File input refs for mobile fallback
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const content = {
    en: {
      title: '📸 Evidence Collector',
      subtitle: 'Collect legal evidence during scam calls - Screenshots, recordings, and documentation',
      
      screenshotSection: 'Camera/Screenshot',
      screenshotDesc: 'Capture photos or take screenshots',
      takeScreenshot: 'Take Photo/Screenshot',
      
      audioSection: 'Audio Recordings',
      audioDesc: 'Record scam calls legally',
      startRecording: 'Start Audio Recording',
      stopRecording: 'Stop Recording',
      recording: 'Recording',
      
      videoSection: 'Video Recording',
      videoDesc: 'Record video evidence with camera',
      startVideoRecording: 'Start Video Recording',
      stopVideoRecording: 'Stop Video Recording',
      videoRecording: 'Recording Video',
      switchCamera: 'Switch Camera',
      
      evidenceList: 'Collected Evidence',
      noEvidence: 'No evidence collected yet',
      screenshot: 'Photo/Screenshot',
      audioRecording: 'Audio Recording',
      videoRecordingItem: 'Video Recording',
      duration: 'Duration',
      timestamp: 'Timestamp',
      download: 'Download',
      delete: 'Delete',
      deleteAll: 'Delete All',
      exportAll: 'Export All Evidence',
      
      mobileMode: 'Mobile Mode Active',
      desktopMode: 'Desktop Mode',
      
      permissionHelp: 'Permission Help',
      permissionInstructions: 'To collect evidence on mobile:',
      permissionSteps: [
        '1. Allow camera permission when prompted',
        '2. Allow microphone permission for recordings',
        '3. If permissions denied, check browser settings',
        '4. Chrome: Settings > Site Settings > Camera/Microphone',
        '5. Try using "Take Photo" as fallback option'
      ],
      
      legalNotice: 'Legal Notice',
      legalText: 'This evidence can be used for police complaints. Keep originals safe.',
      
      howToUse: 'How to Use',
      steps: [
        'During a scam call, tap "Take Photo" to capture evidence',
        'Use "Start Audio Recording" for call recording',
        'Use "Start Video Recording" for video evidence',
        'Export all evidence and file complaint at cybercrime.gov.in or call 1930',
        'Keep original evidence files safe'
      ]
    },
    hi: {
      title: '📸 सबूत संग्राहक',
      subtitle: 'घोटाले की कॉल के दौरान कानूनी सबूत एकत्र करें',
      
      screenshotSection: 'कैमरा/स्क्रीनशॉट',
      screenshotDesc: 'फोटो या स्क्रीनशॉट लें',
      takeScreenshot: 'फोटो/स्क्रीनशॉट लें',
      
      audioSection: 'ऑडियो रिकॉर्डिंग',
      audioDesc: 'कॉल रिकॉर्ड करें',
      startRecording: 'ऑडियो रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग बंद करें',
      recording: 'रिकॉर्ड हो रहा है',
      
      videoSection: 'वीडियो रिकॉर्डिंग',
      videoDesc: 'कैमरे से वीडियो सबूत रिकॉर्ड करें',
      startVideoRecording: 'वीडियो रिकॉर्डिंग शुरू करें',
      stopVideoRecording: 'वीडियो रिकॉर्डिंग बंद करें',
      videoRecording: 'वीडियो रिकॉर्ड हो रहा है',
      switchCamera: 'कैमरा बदलें',
      
      evidenceList: 'एकत्रित सबूत',
      noEvidence: 'अभी तक कोई सबूत एकत्र नहीं',
      screenshot: 'फोटो/स्क्रीनशॉट',
      audioRecording: 'ऑडियो रिकॉर्डिंग',
      videoRecordingItem: 'वीडियो रिकॉर्डिंग',
      duration: 'अवधि',
      timestamp: 'समय',
      download: 'डाउनलोड',
      delete: 'हटाएं',
      deleteAll: 'सभी हटाएं',
      exportAll: 'सभी सबूत निर्यात करें',
      
      mobileMode: 'मोबाइल मोड सक्रिय',
      desktopMode: 'डेस्कटॉप मोड',
      
      permissionHelp: 'अनुमति सहायता',
      permissionInstructions: 'मोबाइल पर सबूत एकत्र करने के लिए:',
      permissionSteps: [
        '1. कैमरा अनुमति दें',
        '2. रिकॉर्डिंग के लिए माइक्रोफ़ोन अनुमति दें',
        '3. अनुमति अस्वीकार होने पर, ब्राउज़र सेटिंग्स जांचें',
        '4. Chrome: सेटिंग्स > साइट सेटिंग्स > कैमरा/माइक्रोफ़ोन',
        '5. "फोटो लें" विकल्प का उपयोग करें'
      ],
      
      legalNotice: 'कानूनी सूचना',
      legalText: 'यह सबूत पुलिस शिकायत के लिए उपयोग किया जा सकता है।',
      
      howToUse: 'उपयोग कैसे करें',
      steps: [
        'घोटाले की कॉल के दौरान, सबूत लेने के लिए "फोटो लें" पर टैप करें',
        'कॉल रिकॉर्डिंग के लिए "ऑडियो रिकॉर्डिंग" का उपयोग करें',
        'वीडियो सबूत के लिए "वीडियो रिकॉर्डिंग" का उपयोग करें',
        'सभी सबूत निर्यात करें और cybercrime.gov.in पर शिकायत दर्ज करें',
        'मूल सबूत फ़ाइलों को सुरक्षित रखें'
      ]
    }
  };

  const t = content[lang];

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

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
      if (videoMediaStreamRef.current) {
        videoMediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      recordings.forEach(r => URL.revokeObjectURL(r.url));
      videoRecordings.forEach(r => URL.revokeObjectURL(r.url));
    };
  }, []);

  // MOBILE-OPTIMIZED: Screenshot using camera or screen capture
  const takeScreenshot = async () => {
    try {
      setError('');
      
      if (isMobile) {
        // Mobile: Use camera input as fallback
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      } else {
        // Desktop: Use screen capture API
        try {
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
        } catch (err: any) {
          // Fallback to camera on desktop if screen capture fails
          if (cameraInputRef.current) {
            cameraInputRef.current.click();
          }
        }
      }
    } catch (err) {
      console.error('Screenshot error:', err);
      setError('Camera access denied. Please allow camera permission in settings.');
    }
  };

  // Handle camera input for mobile screenshots
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const screenshot: Screenshot = {
          id: Date.now().toString(),
          dataUrl,
          timestamp: new Date().toLocaleString()
        };
        setScreenshots(prev => [...prev, screenshot]);
        setSuccessMessage('Photo captured successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio recording with mobile optimization
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

      // Mobile-optimized codec selection
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
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

    } catch (err: any) {
      console.error('Audio recording error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in browser settings.');
      } else {
        setError('Microphone not available or permission denied.');
      }
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

  // MOBILE-OPTIMIZED: Video recording with camera
  const startVideoRecording = async () => {
    try {
      setError('');
      videoChunksRef.current = [];
      setVideoRecordingDuration(0);
      
      // Request camera and microphone for mobile
      const constraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoMediaStreamRef.current = stream;

      // Show preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      // Mobile-optimized codec selection
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: isMobile ? 1500000 : 2500000, // Lower bitrate for mobile
        audioBitsPerSecond: 128000
      });

      videoMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const recording: VideoRecording = {
          id: Date.now().toString(),
          blob,
          url,
          timestamp: new Date().toLocaleString(),
          duration: videoRecordingDuration
        };

        setVideoRecordings(prev => [...prev, recording]);
        
        if (videoMediaStreamRef.current) {
          videoMediaStreamRef.current.getTracks().forEach(track => track.stop());
          videoMediaStreamRef.current = null;
        }

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }

        setSuccessMessage('Video recording saved successfully!');
      };

      mediaRecorder.start(100);
      setIsVideoRecording(true);

      videoDurationIntervalRef.current = setInterval(() => {
        setVideoRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Video recording error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera/Microphone permission denied. Please allow access in browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('Camera not found. Please check if camera is available.');
      } else {
        setError('Failed to start video recording. Please check permissions.');
      }
    }
  };

  const stopVideoRecording = () => {
    if (videoMediaRecorderRef.current && isVideoRecording) {
      videoMediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      
      if (videoDurationIntervalRef.current) {
        clearInterval(videoDurationIntervalRef.current);
        videoDurationIntervalRef.current = null;
      }
    }
  };

  // Switch camera on mobile
  const switchCamera = () => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isVideoRecording) {
      stopVideoRecording();
      setTimeout(() => startVideoRecording(), 500);
    }
  };

  // Download functions
  const downloadScreenshot = (screenshot: Screenshot, index: number) => {
    const a = document.createElement('a');
    a.href = screenshot.dataUrl;
    a.download = `evidence-photo-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadRecording = (recording: Recording, index: number) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `evidence-audio-${index + 1}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadVideoRecording = (recording: VideoRecording, index: number) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `evidence-video-${index + 1}-${Date.now()}.webm`;
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

  const deleteVideoRecording = (id: string) => {
    const recording = videoRecordings.find(r => r.id === id);
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    setVideoRecordings(prev => prev.filter(r => r.id !== id));
  };

  const deleteAll = () => {
    if (confirm('Delete all evidence? This cannot be undone.')) {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
      videoRecordings.forEach(r => URL.revokeObjectURL(r.url));
      setScreenshots([]);
      setRecordings([]);
      setVideoRecordings([]);
      setSuccessMessage('All evidence deleted');
    }
  };

  // Export all evidence as ZIP
  const exportAll = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      screenshots.forEach((screenshot, index) => {
        const base64Data = screenshot.dataUrl.split(',')[1];
        zip.file(`photo-${index + 1}.png`, base64Data, { base64: true });
      });

      recordings.forEach((recording, index) => {
        zip.file(`audio-${index + 1}.webm`, recording.blob);
      });

      videoRecordings.forEach((recording, index) => {
        zip.file(`video-${index + 1}.webm`, recording.blob);
      });

      const report = `
EVIDENCE COLLECTION REPORT
Generated: ${new Date().toLocaleString()}
Device: ${isMobile ? 'Mobile' : 'Desktop'}
========================================

SUMMARY:
- Photos/Screenshots: ${screenshots.length}
- Audio Recordings: ${recordings.length}
- Video Recordings: ${videoRecordings.length}
- Total Evidence Items: ${totalEvidence}

PHOTOS/SCREENSHOTS:
${screenshots.map((s, i) => `${i + 1}. Captured at: ${s.timestamp}`).join('\n')}

AUDIO RECORDINGS:
${recordings.map((r, i) => `${i + 1}. Recorded at: ${r.timestamp}, Duration: ${formatDuration(r.duration)}`).join('\n')}

VIDEO RECORDINGS:
${videoRecordings.map((r, i) => `${i + 1}. Recorded at: ${r.timestamp}, Duration: ${formatDuration(r.duration)}`).join('\n')}

========================================
This evidence was collected using QuantumShield Evidence Collector
For filing complaints: cybercrime.gov.in or call 1930
Keep original files safe - do not edit or modify
      `;
      
      zip.file('EVIDENCE_REPORT.txt', report);

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

  const totalEvidence = screenshots.length + recordings.length + videoRecordings.length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Hidden camera input for mobile fallback */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-red-100 text-sm sm:text-base">{t.subtitle}</p>
        <div className="mt-3 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span className="text-xs sm:text-sm">
            {isMobile ? t.mobileMode : t.desktopMode}
          </span>
        </div>
        {totalEvidence > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 sm:px-4 py-2 inline-block">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">
              {totalEvidence} Evidence Item{totalEvidence !== 1 ? 's' : ''} Collected
            </span>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-green-200 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Legal Notice */}
      <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-400 mb-1 text-sm sm:text-base">{t.legalNotice}</h3>
            <p className="text-xs sm:text-sm text-gray-300">{t.legalText}</p>
          </div>
        </div>
      </div>

      {/* Collection Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Camera/Screenshots */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-blue-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h2 className="font-bold text-lg sm:text-xl">{t.screenshotSection}</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mb-4">{t.screenshotDesc}</p>
          <button
            onClick={takeScreenshot}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-105">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            {t.takeScreenshot}
          </button>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Total: {screenshots.length}</span>
            {screenshots.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* Audio Recording */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-red-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            <h2 className="font-bold text-lg sm:text-xl">{t.audioSection}</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mb-4">{t.audioDesc}</p>
          
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-105">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              {t.startRecording}
            </button>
          ) : (
            <div>
              <button
                onClick={stopRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all mb-3">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.stopRecording}
              </button>
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">{t.recording}: {formatDuration(recordingDuration)}</span>
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Total: {recordings.length}</span>
            {recordings.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* Video Recording */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-purple-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            <h2 className="font-bold text-lg sm:text-xl">{t.videoSection}</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mb-4">{t.videoDesc}</p>
          
          {!isVideoRecording ? (
            <button
              onClick={startVideoRecording}
              className="w-full bg-purple-600 hover:bg-purple-700 px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-105">
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              {t.startVideoRecording}
            </button>
          ) : (
            <div>
              <button
                onClick={stopVideoRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all mb-3">
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.stopVideoRecording}
              </button>
              <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">{t.videoRecording}: {formatDuration(videoRecordingDuration)}</span>
              </div>
              {isMobile && (
                <button
                  onClick={switchCamera}
                  className="w-full bg-blue-600/50 hover:bg-blue-600/70 px-3 py-2 rounded text-xs">
                  {t.switchCamera}
                </button>
              )}
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Total: {videoRecordings.length}</span>
            {videoRecordings.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
        </div>
      </div>

      {/* Video Preview (only when recording) */}
      {isVideoRecording && (
        <div className="mb-4 sm:mb-6 bg-black rounded-xl overflow-hidden">
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Evidence List */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold text-xl sm:text-2xl">{t.evidenceList}</h2>
          {totalEvidence > 0 && (
            <div className="flex gap-2">
              <button
                onClick={exportAll}
                className="bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                {t.exportAll}
              </button>
              <button
                onClick={deleteAll}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                {t.deleteAll}
              </button>
            </div>
          )}
        </div>

        {totalEvidence === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">{t.noEvidence}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Screenshots */}
            {screenshots.map((screenshot, index) => (
              <div key={screenshot.id} className="bg-black/50 rounded-lg p-3 sm:p-4 hover:bg-black/70 transition-all border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{t.screenshot} #{index + 1}</p>
                      <p className="text-xs text-gray-400">{t.timestamp}: {screenshot.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadScreenshot(screenshot, index)}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all hover:scale-110">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => deleteScreenshot(screenshot.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                <img src={screenshot.dataUrl} alt={`Screenshot ${index + 1}`} className="w-full rounded mt-2 max-h-64 object-contain" />
              </div>
            ))}

            {/* Audio Recordings */}
            {recordings.map((recording, index) => (
              <div key={recording.id} className="bg-black/50 rounded-lg p-3 sm:p-4 hover:bg-black/70 transition-all border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{t.audioRecording} #{index + 1}</p>
                      <p className="text-xs text-gray-400">
                        {t.timestamp}: {recording.timestamp} | {t.duration}: {formatDuration(recording.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadRecording(recording, index)}
                      className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-all hover:scale-110">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

            {/* Video Recordings */}
            {videoRecordings.map((recording, index) => (
              <div key={recording.id} className="bg-black/50 rounded-lg p-3 sm:p-4 hover:bg-black/70 transition-all border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{t.videoRecordingItem} #{index + 1}</p>
                      <p className="text-xs text-gray-400">
                        {t.timestamp}: {recording.timestamp} | {t.duration}: {formatDuration(recording.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadVideoRecording(recording, index)}
                      className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-all hover:scale-110">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => deleteVideoRecording(recording.id)}
                      className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 p-2 rounded-lg transition-all">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                <video 
                  src={recording.url} 
                  controls 
                  className="w-full rounded-lg bg-black mt-2"
                  style={{ maxHeight: '300px' }}
                  playsInline
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Permission Help */}
      {isMobile && (
        <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="font-bold text-lg sm:text-xl mb-3 text-blue-400">{t.permissionHelp}</h3>
          <p className="text-sm text-gray-300 mb-3">{t.permissionInstructions}</p>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
            {t.permissionSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {/* How to Use */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
        <h2 className="font-bold text-lg sm:text-xl mb-4">{t.howToUse}</h2>
        <ol className="space-y-3">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-xs sm:text-sm text-gray-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
