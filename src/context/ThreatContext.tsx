'use client';
import React, { createContext, useContext, useState } from 'react';

export type ThreatState = {
  active: boolean;
  reason: string;
  keywords: string[];
};

const ThreatContext = createContext<{
  threat: ThreatState;
  setThreat: (t: ThreatState) => void;
} | null>(null);

export function ThreatProvider({ children }: { children: React.ReactNode }) {
  const [threat, setThreat] = useState<ThreatState>({
    active: false,
    reason: '',
    keywords: []
  });

  return (
    <ThreatContext.Provider value={{ threat, setThreat }}>
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreat() {
  const ctx = useContext(ThreatContext);
  if (!ctx) {
    throw new Error('useThreat must be used inside ThreatProvider');
  }
  return ctx;
}
