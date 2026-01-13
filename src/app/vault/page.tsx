'use client';
import { useEffect, useState } from 'react';
import { Play, Trash2, MapPin, Calendar, Shield } from 'lucide-react';
import { getAllRecordings, deleteRecording } from '@/lib/vault';

export default function VaultPage() {
  const [recordings, setRecordings] = useState<any[]>([]);

  const loadRecordings = async () => {
    const data = await getAllRecordings();
    setRecordings(data.reverse()); // Newest first
  };

  useEffect(() => { loadRecordings(); }, []);

  const playAudio = (blob: Blob) => {
    // Creates a temporary local link to play the file
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Evidence <span className="text-indigo-500">Vault</span></h1>
        <p className="text-[10px] text-slate-500 uppercase font-mono mt-2 tracking-widest">Local Device Storage Only</p>
      </header>

      <div className="space-y-4">
        {recordings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem]">
            <Shield className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 uppercase text-xs font-bold">No evidence found in local storage.</p>
          </div>
        ) : (
          recordings.map((rec) => (
            <div key={rec.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/30 transition">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400">
                  <Calendar className="w-3 h-3" /> {new Date(rec.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-3 h-3 text-red-500" /> {rec.location}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => playAudio(rec.blob)}
                  className="p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition shadow-lg"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button 
                  onClick={async () => { await deleteRecording(rec.id); loadRecordings(); }}
                  className="p-4 bg-slate-800 rounded-2xl hover:bg-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}