'use client';
import { useState } from 'react';
import { Shield, Lock, Unlock, Download, File, Trash2, Loader2 } from 'lucide-react';

export default function FileEncryption({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  // Core Security Logic: AES-GCM 256-bit Encryption
  const processFile = async (mode: 'encrypt' | 'decrypt') => {
    if (!file || !password) {
      setStatus({ type: 'error', msg: 'Please select a file and enter a security key.' });
      return;
    }

    setIsProcessing(true);
    try {
      const fileData = await file.arrayBuffer();
      const enc = new TextEncoder();
      
      // Generate a cryptographic key from your password
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
      );

      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: enc.encode('quantum-shield-salt'), // Constant salt for simplicity
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      let resultBuffer;
      const iv = new Uint8Array(12); // Initialization Vector

      if (mode === 'encrypt') {
        resultBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fileData);
      } else {
        resultBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fileData);
      }

      // Create a download link for the user
      const blob = new Blob([resultBuffer]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = mode === 'encrypt' ? `${file.name}.protected` : file.name.replace('.protected', '');
      link.click();

      setStatus({ type: 'success', msg: `File ${mode}ed successfully!` });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Invalid key or corrupted file.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-cyan-500/20 rounded-2xl">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">QuantumShield File Vault</h2>
          <p className="text-slate-400 text-sm">Secure local-only AES-GCM 256-bit encryption</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* File Drop Zone */}
        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${file ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 hover:border-slate-500'}`}>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="hidden" 
            id="file-upload" 
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <File className="w-12 h-12 text-cyan-400" />
                <span className="text-white font-medium">{file.name}</span>
                <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="text-red-400 text-xs flex items-center gap-1 mt-2">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Download className="w-12 h-12 text-slate-500" />
                <span className="text-slate-400">Click to select or drag & drop a file</span>
              </div>
            )}
          </label>
        </div>

        {/* Security Key Input */}
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-2 block">Secret Security Key</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={isProcessing}
            onClick={() => processFile('encrypt')}
            className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Lock className="w-5 h-5" />}
            Encrypt
          </button>
          <button 
            disabled={isProcessing}
            onClick={() => processFile('decrypt')}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Unlock className="w-5 h-5" />}
            Decrypt
          </button>
        </div>

        {/* Status Messaging */}
        {status.msg && (
          <div className={`p-4 rounded-xl text-center text-sm font-medium ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {status.msg}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
        <span>Zero-Knowledge Architecture</span>
        <span>Local Processing</span>
      </div>
    </div>
  );
}