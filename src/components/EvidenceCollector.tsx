'use client';
import { useState, useRef, useEffect } from 'react';
import { Monitor, Download, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

// Fixed Prop interface to match your page.tsx call
interface Props {
  lang?: 'en' | 'hi';
}

interface VideoRecording {
  id: string;
  blob: Blob;
  url: string;
  timestamp: string;
  duration: number; // Used to override the 0:00 metadata bug
}

export default function EvidenceCollector({ lang = 'en' }: Props) {
  const [videoRecordings, setVideoRecordings] = useState<VideoRecording[]>([]);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  // FIX: use a ref to track duration — state closures inside recorder.onstop
  // always capture the initial value (0), causing the "0:00 duration" bug.
  const durationRef = useRef(0);

  // Cleanup URLs and streams when component unmounts
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      micStreamRef.current?.getTracks().forEach(track => track.stop());
      videoRecordings.forEach(rec => URL.revokeObjectURL(rec.url));
    };
  }, [videoRecordings]);

  const startRecording = async () => {
    try {
      setError('');
      chunksRef.current = [];
      durationRef.current = 0;
      setCurrentDuration(0);

      // Step 1: capture the screen (+ system audio when user checks "Share tab audio")
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true, // request system audio — Chrome shows "Also share system audio" checkbox
      });

      // Step 2: capture microphone separately
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      micStreamRef.current = micStream;

      // FIX: system-audio tracks first, then mic — wrong order causes audio sync issues
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...screenStream.getAudioTracks(), // system audio (may be empty if user declined)
        ...micStream.getAudioTracks(),    // microphone
      ]);

      streamRef.current = combinedStream;
      if (previewRef.current) {
        previewRef.current.srcObject = screenStream; // show screen preview, not mic
      }

      // FIX: Use VP8 codec for best cross-browser compatibility
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        const newEntry: VideoRecording = {
          id: Date.now().toString(),
          blob,
          url,
          timestamp: new Date().toLocaleString(),
          duration: durationRef.current, // FIX: read from ref, not stale state closure
        };

        setVideoRecordings(prev => [newEntry, ...prev]);
        combinedStream.getTracks().forEach(track => track.stop());
        screenStream.getTracks().forEach(track => track.stop());
        micStream.getTracks().forEach(track => track.stop());
      };

      // Handle user clicking "Stop sharing" in the browser's native UI
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (mediaRecorderRef.current?.state === 'recording') stopRecording();
      });

      recorder.start(1000);
      setIsVideoRecording(true);

      // Track duration with ref AND state: ref fixes the closure bug; state drives the UI
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setCurrentDuration(durationRef.current);
      }, 1000);

    } catch (err) {
      setError(
        lang === 'en'
          ? 'Screen capture denied. Allow screen sharing and microphone access, then retry.'
          : 'स्क्रीन कैप्चर अस्वीकृत। स्क्रीन शेयरिंग और माइक्रोफ़ोन अनुमति दें।'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      micStreamRef.current?.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen text-white">
      <div className="bg-gradient-to-r from-red-900 to-black p-6 rounded-2xl border border-red-500/30 mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <ShieldCheck className="text-red-500" /> EVIDENCE VAULT
        </h1>
        <p className="text-gray-400 text-sm">
          {lang === 'en' ? 'Securing local video proof for cyber-incidents.' : 'साइबर घटनाओं के लिए स्थानीय वीडियो सबूत सुरक्षित करना।'}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        {!isVideoRecording ? (
          <button
            onClick={startRecording}
            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Monitor size={20} /> {lang === 'en' ? 'START SCREEN RECORDING' : 'स्क्रीन रिकॉर्डिंग शुरू करें'}
          </button>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={stopRecording}
              className="w-full py-4 bg-gray-700 hover:bg-gray-800 rounded-xl font-bold transition-all"
            >
              {lang === 'en' ? 'STOP & SECURE' : 'रोकें और सुरक्षित करें'}
            </button>
            <div className="flex items-center justify-center gap-2 text-red-500 font-mono text-xl">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
              LIVE: {formatTime(currentDuration)}
            </div>
            {/* FIX: playsInline is required for mobile browser playback */}
            <video 
              ref={previewRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full rounded-xl bg-black border border-white/10 aspect-video object-cover" 
            />
          </div>
        )}
        {error && <p className="mt-4 text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16}/> {error}</p>}
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-bold px-2">
          {lang === 'en' ? `Collected Evidence (${videoRecordings.length})` : `एकत्रित सबूत (${videoRecordings.length})`}
        </h2>
        {videoRecordings.map((rec) => (
          <div key={rec.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-200">Video Evidence #{rec.id.slice(-4)}</h3>
                <p className="text-xs text-gray-500">{rec.timestamp}</p>
                <p className="text-xs font-mono text-red-400 mt-1">
                  Verified Duration: {formatTime(rec.duration)}
                </p>
              </div>
              <div className="flex gap-2">
                <a 
                  href={rec.url} 
                  download={`Evidence_${rec.id}.webm`}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Download size={18} />
                </a>
                <button 
                  onClick={() => setVideoRecordings(prev => prev.filter(v => v.id !== rec.id))}
                  className="p-2 bg-white/10 rounded-lg hover:bg-red-900/40"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {/* FIX: playsInline and preload="metadata" fix mobile display bugs */}
            <video 
              src={rec.url} 
              controls 
              playsInline 
              preload="metadata" 
              className="w-full rounded-xl bg-black shadow-2xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}