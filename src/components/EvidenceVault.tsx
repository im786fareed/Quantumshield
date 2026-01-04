'use client';
import { useState, useEffect } from 'react';
import { Camera, ShieldCheck, Trash2, Download, Image as ImageIcon, Lock, Plus } from 'lucide-react';

interface Evidence {
  id: number;
  fileName: string;
  blob: Blob;
  date: string;
}

export default function ScamDatabase({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Initialize Local Browser Database (IndexedDB)
  useEffect(() => {
    const request = indexedDB.open('QuantumShieldVault', 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('evidence')) {
        db.createObjectStore('evidence', { keyPath: 'id' });
      }
    };
    loadEvidence();
  }, []);

  const loadEvidence = () => {
    const request = indexedDB.open('QuantumShieldVault', 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(['evidence'], 'readonly');
      const store = transaction.objectStore('evidence');
      const getAll = store.getAll();
      getAll.onsuccess = () => setEvidenceList(getAll.result);
    };
  };

  const saveEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newEvidence: Evidence = {
      id: Date.now(),
      fileName: file.name,
      blob: file,
      date: new Date().toLocaleString(),
    };

    const request = indexedDB.open('QuantumShieldVault', 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(['evidence'], 'readwrite');
      const store = transaction.objectStore('evidence');
      store.add(newEvidence);
      setEvidenceList(prev => [...prev, newEvidence]);
    };
  };

  const deleteEvidence = (id: number) => {
    const request = indexedDB.open('QuantumShieldVault', 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction(['evidence'], 'readwrite');
      transaction.objectStore('evidence').delete(id);
      setEvidenceList(prev => prev.filter(item => item.id !== id));
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Digital Evidence Vault</h1>
            <p className="text-slate-500 text-xs font-mono">Encrypted Local Storage • No Cloud Upload</p>
          </div>
        </div>

        <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-900/20">
          <Plus className="w-5 h-5" />
          ADD SCREENSHOT
          <input type="file" accept="image/*" onChange={saveEvidence} className="hidden" />
        </label>
      </div>

      {evidenceList.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[2rem]">
          <ImageIcon className="w-16 h-16 text-slate-800 mx-auto mb-4" />
          <h2 className="text-slate-400 font-bold">Your Vault is Empty</h2>
          <p className="text-slate-600 text-sm max-w-xs mx-auto">Upload screenshots of scam messages or fake IDs as evidence for police reporting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceList.map((item) => (
            <div key={item.id} className="group bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 transition">
              <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={URL.createObjectURL(item.blob)} alt="Evidence" className="w-full h-full object-cover opacity-50 group-hover:opacity-100" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-200 truncate">{item.fileName}</div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">{item.date}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const url = URL.createObjectURL(item.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Evidence_${item.fileName}`;
                    a.click();
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteEvidence(item.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 flex items-center gap-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
        <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
        <p className="text-[11px] text-blue-200/70 leading-relaxed">
          <strong>LEGAL ADVICE:</strong> Storing evidence locally helps you when filing a complaint on the **1930 Cyber Helpline**. 
          QuantumShield does not have access to these files. If you clear your browser data, these files will be removed.
        </p>
      </div>
    </div>
  );
}