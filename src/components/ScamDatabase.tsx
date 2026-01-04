'use client';
import { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, Database, Phone, CreditCard, User } from 'lucide-react';

// Example of your "Huge Dataset" structure
// In a real scenario, this could be imported from a separate JSON file
const SCAM_REGISTRY = {
  phones: ['+919999999999', '+918888888888', '1930', '9876543210'],
  accounts: ['123456789012', '987654321098'],
  entities: ['CBI Mumbai Branch', 'Customs Department Delhi', 'DCP Cyber Cell']
};

export default function ScamDatabase({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ status: 'safe' | 'scam' | 'idle', message: string }>({ status: 'idle', message: '' });

  const performAISearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResult({ status: 'idle', message: '' });
      return;
    }

    const cleanQuery = searchTerm.toLowerCase().replace(/\s/g, '');
    
    // Fuzzy matching logic (Basic AI simulation for non-coders)
    const isPhoneScam = SCAM_REGISTRY.phones.some(p => p.includes(cleanQuery));
    const isAccountScam = SCAM_REGISTRY.accounts.some(a => a.includes(cleanQuery));
    const isNameScam = SCAM_REGISTRY.entities.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));

    if (isPhoneScam || isAccountScam || isNameScam) {
      setResult({
        status: 'scam',
        message: "🚨 MATCH FOUND: This information exists in our reported fraud database. Proceed with extreme caution and DO NOT share any details."
      });
    } else {
      setResult({
        status: 'safe',
        message: "✅ No direct match found in the current blacklist. However, always stay vigilant as scammers change details daily."
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-500/20 rounded-2xl">
          <Database className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Live Scam Registry</h2>
          <p className="text-slate-400 text-sm">Verify callers & accounts against known fraud patterns</p>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            performAISearch(e.target.value);
          }}
          placeholder="Enter Phone Number, Bank Account, or Official Name..."
          className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />
      </div>

      {/* Result Cards */}
      {result.status !== 'idle' && (
        <div className={`p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 ${
          result.status === 'scam' ? 'bg-red-500/10 border border-red-500/50' : 'bg-green-500/10 border border-green-500/50'
        }`}>
          {result.status === 'scam' ? (
            <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
          )}
          <p className={`text-sm font-medium ${result.status === 'scam' ? 'text-red-200' : 'text-green-200'}`}>
            {result.message}
          </p>
        </div>
      )}

      {/* Helpful Quick-Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-3">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300">Check Numbers</span>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300">Check Bank A/C</span>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-3">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300">Check Entities</span>
        </div>
      </div>
    </div>
  );
}