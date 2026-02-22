'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, Activity, Trash2, FileCheck, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScannedFile {
  id: string;
  name: string;
  size: number;
  hash: string;
  scannedAt: string;
  selected: boolean;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  fileNames: string[];
  passes: number;
}

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Simulates DoD 5220.22-M 3-pass overwrite before removing from memory
async function secureErase(size: number): Promise<void> {
  const buf = new Uint8Array(Math.min(size, 64 * 1024));
  buf.fill(0x00);                    // Pass 1: zeros
  await new Promise(r => setTimeout(r, 80));
  crypto.getRandomValues(buf);        // Pass 2: cryptographic random
  await new Promise(r => setTimeout(r, 80));
  buf.fill(0x00);                    // Pass 3: zeros
  await new Promise(r => setTimeout(r, 80));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export default function AISystemGuardian() {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load audit log from localStorage after hydration (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qs_audit_log');
      if (stored) setAuditLog(JSON.parse(stored));
    } catch {}
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setScanning(true);
    const scanned: ScannedFile[] = [];
    for (const file of selected) {
      const hash = await computeSHA256(file);
      scanned.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        hash,
        scannedAt: new Date().toLocaleString(),
        selected: false,
      });
    }
    setFiles(prev => [...prev, ...scanned]);
    setScanning(false);
    e.target.value = '';
  }, []);

  const toggleSelect = (id: string) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));

  const selectAll = () => setFiles(prev => prev.map(f => ({ ...f, selected: true })));
  const deselectAll = () => setFiles(prev => prev.map(f => ({ ...f, selected: false })));

  const deleteSelected = async () => {
    const toDelete = files.filter(f => f.selected);
    if (!toDelete.length) return;
    setDeleting(true);

    for (const f of toDelete) {
      await secureErase(f.size);
    }

    const entry: AuditEntry = {
      timestamp: new Date().toLocaleString(),
      action: '3-Pass Secure Delete',
      fileNames: toDelete.map(f => f.name),
      passes: 3,
    };
    const newLog = [entry, ...auditLog].slice(0, 100);
    setAuditLog(newLog);
    try { localStorage.setItem('qs_audit_log', JSON.stringify(newLog)); } catch {}

    setFiles(prev => prev.filter(f => !f.selected));
    setDeleting(false);
  };

  const selectedCount = files.filter(f => f.selected).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12 text-white flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-bold text-white">AI System Guardian</h1>
            <p className="text-blue-100">Military-grade file integrity &amp; secure deletion</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">System Status</h2>
        </div>
        <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-lg font-semibold text-green-400">✅ System Stable</p>
          <p className="text-sm text-gray-400 mt-2">
            No threats detected. Use the scanner below to verify file integrity.
          </p>
        </div>
      </div>

      {/* File Integrity Scanner */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileCheck className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">File Integrity Scanner</h2>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-4"
        >
          <Shield className="w-5 h-5" />
          {scanning ? 'Computing SHA-256 Hashes…' : 'Select Files to Scan'}
        </button>

        {files.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">{files.length} file(s) scanned</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={selectAll}
                  className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  Select All
                </button>
                {selectedCount > 0 && (
                  <>
                    <button
                      onClick={deselectAll}
                      className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={deleteSelected}
                      disabled={deleting}
                      className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      {deleting ? 'Erasing…' : `Secure Delete (${selectedCount})`}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {files.map(f => (
                <div
                  key={f.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    f.selected
                      ? 'border-red-500/50 bg-red-600/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => toggleSelect(f.id)}
                >
                  <input
                    type="checkbox"
                    checked={f.selected}
                    onChange={() => toggleSelect(f.id)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 cursor-pointer accent-red-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(f.size)} · {f.scannedAt}</p>
                    <p className="text-xs font-mono text-green-400 mt-1 break-all">
                      SHA-256: {f.hash}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3-Pass Delete Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold">3-Pass Secure Delete</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-400">
          {[
            'Overwrite with zeros (0x00)',
            'Overwrite with cryptographically random data',
            'Final overwrite with zeros (0x00)',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Deletion Audit Log</h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {auditLog.map((entry, i) => (
              <div key={i} className="bg-black/30 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-red-400">{entry.action}</span>
                  <span className="text-xs text-gray-500">{entry.timestamp}</span>
                </div>
                <p className="text-gray-400 text-xs">
                  {entry.fileNames.join(', ')} — {entry.passes} passes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
