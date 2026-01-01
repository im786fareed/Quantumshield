'use client';

import React from 'react';

type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
}

const LEVEL_CONFIG: Record<RiskLevel, { color: string; label: string }> = {
  safe: {
    color: 'bg-green-500',
    label: 'Safe',
  },
  low: {
    color: 'bg-blue-500',
    label: 'Low Risk',
  },
  medium: {
    color: 'bg-yellow-500',
    label: 'Medium Risk',
  },
  high: {
    color: 'bg-orange-500',
    label: 'High Risk',
  },
  critical: {
    color: 'bg-red-600',
    label: 'CRITICAL',
  },
};

export default function RiskMeter({ score, level }: RiskMeterProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Risk Level</span>
        <span className={`font-bold ${config.color.replace('bg-', 'text-')}`}>
          {config.label}
        </span>
      </div>

      <div className="w-full h-3 bg-gray-700 rounded overflow-hidden">
        <div
          className={`${config.color} h-full transition-all duration-700`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      <div className="text-sm text-gray-300">
        Confidence Score: <span className="font-semibold">{score}%</span>
      </div>
    </div>
  );
}
