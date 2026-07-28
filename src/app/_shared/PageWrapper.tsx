'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

/**
 * Shared page shell for inner tool pages. Matte-black ground with a soft
 * emerald ambient glow, matching the AdamasVault command-center identity.
 * Pages that set their own full-height background render on top unaffected.
 */
export default function PageWrapper({ children }: Props) {
  return (
    <div className="relative min-h-screen bg-[#05080a] text-[#eaf3ee]">
      {/* ambient emerald glow — decorative, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(60%_42%_at_50%_0%,rgba(16,185,129,0.09),transparent_70%)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
