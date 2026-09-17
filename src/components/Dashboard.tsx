import React from 'react';
import { Candidate } from '../types';
import { DashboardStats } from './DashboardStats';
import { RatingStars } from './RatingStars';
import { getStageBadgeStyle, formatDate } from '../utils/helpers';
import { Eye, ArrowRight, UserPlus, Inbox } from 'lucide-react';

interface DashboardProps {
  candidates: Candidate[];
  onViewCandidate: (candidate: Candidate) => void;
  onGoToCandidates: () => void;
  onOpenAddModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  candidates,
  onViewCandidate,
  onGoToCandidates,
  onOpenAddModal,
}) => {
  // Sort by latest created/applied date for the "Recent Candidates" section
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <DashboardStats candidates={candidates} />

      {/* 2. Recent Candidates Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Recent Candidates
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of candidates currently in your recruitment pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="dashboard-view-all-btn"
              type="button"
              onClick={onGoToCandidates}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentCandidates.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">No candidates yet</p>
            <p className="text-xs text-slate-500 mb-4">
              Add your first candidate to start tracking your hiring pipeline.
            </p>
            <button
              id="dashboard-add-first-btn"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Application Date</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCandidates.map((c) => {
                  const badgeStyle = getStageBadgeStyle(c.stage);
                  return (
                    <tr
                      key={c.id}
                      id={`dashboard-row-${c.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onViewCandidate(c)}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-left block"
                        >
                          {c.fullName}
                        </button>
                        <span className="text-xs text-slate-500">{c.email}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {c.position}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {c.location || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {formatDate(c.applicationDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                          {c.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <RatingStars rating={c.rating} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          id={`dashboard-view-btn-${c.id}`}
                          type="button"
                          onClick={() => onViewCandidate(c)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
