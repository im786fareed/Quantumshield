'use client';

import React from 'react';
import type { TabId } from '@/types/navigation';

export interface HomePageProps {
  lang: 'en' | 'hi';
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
}


export default function HomePage({
  lang,
  activeTab,
  onNavigate,
}: HomePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">
        {lang === 'en'
          ? "India's #1 AI Cyber Protection"
          : 'भारत की #1 AI साइबर सुरक्षा'}
      </h1>

      <p className="text-gray-300 mb-6">
        {lang === 'en'
          ? 'Protect yourself from scams, frauds, and cyber threats.'
          : 'घोटालों और साइबर खतरों से खुद को सुरक्षित रखें।'}
      </p>

      {onNavigate && (
        <button
          onClick={() => onNavigate('scanner')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          {lang === 'en' ? 'Start Protection' : 'सुरक्षा शुरू करें'}
        </button>
      )}
    </div>
  );
}
