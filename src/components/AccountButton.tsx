'use client';
/* Header account control: shows the signed-in user + Sign out.
   Renders nothing when auth isn't configured or nobody is signed in. */

import { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountButton() {
  const { configured, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured || !user) return null;

  const label = user.displayName || user.email || user.phoneNumber || 'Account';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 transition"
        title={label}
      >
        {user.photoURL
          ? <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
          : <UserIcon className="w-4 h-4 text-blue-300" />}
        <span className="hidden md:block text-xs font-bold max-w-[10rem] truncate">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-white/10 rounded-xl shadow-xl p-2 z-50">
          <div className="px-3 py-2 text-xs text-gray-400 truncate border-b border-white/10 mb-1">{label}</div>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 text-red-300"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
