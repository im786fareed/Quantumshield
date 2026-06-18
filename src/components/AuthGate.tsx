'use client';
/* Enforces required login — but only once Firebase is configured.
   Until then the app stays fully open so the live site never breaks. */

import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginScreen from './LoginScreen';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { configured, loading, user } = useAuth();

  // Firebase not set up yet → behave exactly like before (no login wall).
  if (!configured) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return <>{children}</>;
}
