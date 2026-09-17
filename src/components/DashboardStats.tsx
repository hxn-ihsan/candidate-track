import React from 'react';
import { Candidate, HiringStage } from '../types';

interface DashboardStatsProps {
  candidates: Candidate[];
  onSelectStage?: (stage: string) => void;
  selectedStage?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  candidates,
  onSelectStage,
  selectedStage,
}) => {
  const total = candidates.length;

  const counts: Record<HiringStage, number> = {
    Applied: candidates.filter((c) => c.stage === 'Applied').length,
    Interview: candidates.filter((c) => c.stage === 'Interview').length,
    Test: candidates.filter((c) => c.stage === 'Test').length,
    Offer: candidates.filter((c) => c.stage === 'Offer').length,
    Accepted: candidates.filter((c) => c.stage === 'Accepted').length,
    Rejected: candidates.filter((c) => c.stage === 'Rejected').length,
  };

  const statItems = [
    {
      id: 'stat-total',
      label: 'Total Candidates',
      count: total,
      stageKey: 'all',
      accent: 'border-l-4 border-l-slate-800',
    },
    {
      id: 'stat-applied',
      label: 'Applied',
      count: counts.Applied,
      stageKey: 'Applied',
      accent: 'border-l-4 border-l-slate-400',
    },
    {
      id: 'stat-interview',
      label: 'Interview',
      count: counts.Interview,
      stageKey: 'Interview',
      accent: 'border-l-4 border-l-blue-500',
    },
    {
      id: 'stat-test',
      label: 'Test',
      count: counts.Test,
      stageKey: 'Test',
      accent: 'border-l-4 border-l-amber-500',
    },
    {
      id: 'stat-offer',
      label: 'Offer',
      count: counts.Offer,
      stageKey: 'Offer',
      accent: 'border-l-4 border-l-purple-500',
    },
    {
      id: 'stat-accepted',
      label: 'Accepted',
      count: counts.Accepted,
      stageKey: 'Accepted',
      accent: 'border-l-4 border-l-emerald-500',
    },
    {
      id: 'stat-rejected',
      label: 'Rejected',
      count: counts.Rejected,
      stageKey: 'Rejected',
      accent: 'border-l-4 border-l-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
      {statItems.map((item) => {
        const isClickable = Boolean(onSelectStage);
        const isSelected = selectedStage === item.stageKey;

        return (
          <div
            key={item.id}
            id={item.id}
            onClick={() => onSelectStage && onSelectStage(item.stageKey)}
            className={`bg-white rounded-lg border p-3.5 transition-all ${item.accent} ${
              isClickable ? 'cursor-pointer hover:border-slate-300 hover:shadow-2xs' : ''
            } ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : 'border-slate-200'
            }`}
          >
            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1.5">
              {item.count}
            </div>
            <div className="text-xs font-medium text-slate-600 truncate">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
