'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function PageWrapper({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {children}
    </div>
  );
}
