'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * Reusable voice-typing control (Web Speech API) for any text field.
 *
 * Renders an EN / हिं language toggle and a Speak/Stop button. While
 * listening it appends transcribed speech to the field's current text via
 * onChange. Uses the same recognition setup as the AI Call Analyzer
 * (en-IN / hi-IN, continuous, interim results). Renders nothing when the
 * browser has no Speech Recognition support, so callers can drop it in
 * safely (Chrome/Edge/Android Chrome support it; Firefox does not).
 */
export default function VoiceDictationButton({
  value,
  onChange,
  idleLabel = 'Speak',
  onListeningChange,
}: {
  value: string;
  onChange: (next: string) => void;
  idleLabel?: string;
  onListeningChange?: (listening: boolean, lang: 'en-IN' | 'hi-IN') => void;
}) {
  const [dictLang, setDictLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const baseTextRef = useRef('');   // text already in the box when dictation started
  const finalRef = useRef('');      // finalised speech this session
  const valueRef = useRef(value);   // latest field value, read when (re)starting
  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(Boolean(SR));
    return () => { try { recognitionRef.current?.abort(); } catch {} };
  }, []);

  const setListeningState = (v: boolean, lang: 'en-IN' | 'hi-IN') => {
    setListening(v);
    onListeningChange?.(v, lang);
  };

  const stop = () => {
    listeningRef.current = false;
    setListeningState(false, dictLang);
    try { recognitionRef.current?.stop(); } catch {}
  };

  const start = (langOverride?: 'en-IN' | 'hi-IN') => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const lang = langOverride ?? dictLang;
    const r: SpeechRecognition = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;

    baseTextRef.current = valueRef.current ? valueRef.current.replace(/\s+$/, '') + ' ' : '';
    finalRef.current = '';

    r.onresult = (e: SpeechRecognitionEvent) => {
      // Rebuild this session's text from the full results list every event.
      // Appending incrementally double-counts on Android Chrome, which
      // re-reports earlier results after each pause/auto-restart.
      let sessionFinal = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) sessionFinal += res[0].transcript + ' ';
        else interim += res[0].transcript;
      }
      finalRef.current = sessionFinal;
      onChange((baseTextRef.current + sessionFinal + interim).replace(/\s{2,}/g, ' '));
    };
    r.onerror = () => stop();
    r.onend = () => {
      // The API stops after a pause; lock in what was said this session,
      // then start a fresh session so its result list begins empty.
      baseTextRef.current = (baseTextRef.current + finalRef.current).replace(/\s{2,}/g, ' ');
      finalRef.current = '';
      if (listeningRef.current) { try { r.start(); } catch {} }
    };

    recognitionRef.current = r;
    listeningRef.current = true;
    setListeningState(true, lang);
    try { r.start(); } catch { stop(); }
  };

  const toggle = () => (listening ? stop() : start());

  const switchLang = (lang: 'en-IN' | 'hi-IN') => {
    const wasListening = listeningRef.current;
    setDictLang(lang);
    if (wasListening) {
      stop();
      setTimeout(() => start(lang), 200);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-slate-700 overflow-hidden text-[11px] font-bold">
        {(['en-IN', 'hi-IN'] as const).map(l => (
          <button key={l} type="button" onClick={() => switchLang(l)}
            className={`px-2.5 py-1.5 transition ${
              dictLang === l ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}>
            {l === 'en-IN' ? 'EN' : 'हिं'}
          </button>
        ))}
      </div>
      <button type="button" onClick={toggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
          listening
            ? 'bg-red-600 border-red-500 text-white animate-pulse'
            : 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 hover:bg-indigo-600/30'
        }`}>
        {listening ? <><MicOff className="w-4 h-4" /> Stop</> : <><Mic className="w-4 h-4" /> {idleLabel}</>}
      </button>
    </div>
  );
}
