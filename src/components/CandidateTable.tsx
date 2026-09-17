import React from 'react';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Inbox,
  ExternalLink
} from 'lucide-react';
import { Candidate, HiringStage, HIRING_STAGES } from '../types';
import { getStageBadgeStyle, formatDate } from '../utils/helpers';
import { RatingStars } from './RatingStars';

interface CandidateTableProps {
  candidates: Candidate[];
  onViewDetails: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  onUpdateStage: (candidateId: string, newStage: HiringStage) => void;
  onUpdateRating: (candidateId: string, rating: number) => void;
  onResetFilters: () => void;
  onOpenAddModal: () => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  onViewDetails,
  onEditCandidate,
  onDeleteCandidate,
  onUpdateStage,
  onUpdateRating,
  onResetFilters,
  onOpenAddModal,
}) => {
  if (candidates.length === 0) {
    return (
      <div
        id="empty-candidates-view"
        className="bg-white rounded-xl border border-slate-200 p-12 text-center my-4"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          No candidates found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
          Try clearing your search filters or add a new candidate to your tracker.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            id="table-reset-filters-btn"
            type="button"
            onClick={onResetFilters}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
          >
            Reset Filters
          </button>
          <button
            id="table-add-candidate-btn"
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Add Candidate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="candidates-desktop-table" className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((c) => {
                const badgeStyle = getStageBadgeStyle(c.stage);

                return (
                  <tr
                    key={c.id}
                    id={`table-row-${c.id}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <button
                        id={`table-name-${c.id}`}
                        type="button"
                        onClick={() => onViewDetails(c)}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline text-left block"
                      >
                        {c.fullName}
                      </button>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {c.email}
                        </span>
                        {c.phone && (
                          <span className="hidden lg:flex items-center gap-1 text-slate-400">
                            • <Phone className="w-3 h-3" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {c.position}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {c.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.location}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Application Date */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(c.applicationDate)}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                          {c.stage}
                        </span>
                        <label htmlFor={`table-stage-select-${c.id}`} className="sr-only">
                          Change stage for {c.fullName}
                        </label>
                        <select
                          id={`table-stage-select-${c.id}`}
                          value={c.stage}
                          onChange={(e) => onUpdateStage(c.id, e.target.value as HiringStage)}
                          title="Change stage"
                          className="text-[11px] py-0.5 px-1 bg-white border border-slate-200 rounded text-slate-600 hover:border-slate-300 focus:outline-none"
                        >
                          {HIRING_STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <RatingStars
                        rating={c.rating}
                        interactive
                        size="sm"
                        onChange={(newRating) => onUpdateRating(c.id, newRating)}
                        idPrefix={`table-rating-${c.id}`}
                      />
                    </td>

                    {/* Actions: View, Edit, Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`table-view-btn-${c.id}`}
                          type="button"
                          onClick={() => onViewDetails(c)}
                          title="View candidate details"
                          className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="View candidate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`table-edit-btn-${c.id}`}
                          type="button"
                          onClick={() => onEditCandidate(c)}
                          title="Edit candidate"
                          className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          aria-label="Edit candidate"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          id={`table-delete-btn-${c.id}`}
                          type="button"
                          onClick={() => onDeleteCandidate(c)}
                          title="Delete candidate"
                          className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          aria-label="Delete candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW */}
      <div className="block md:hidden space-y-3" id="candidates-mobile-cards">
        {candidates.map((c) => {
          const badgeStyle = getStageBadgeStyle(c.stage);

          return (
            <div
              key={c.id}
              id={`mobile-card-${c.id}`}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              {/* Header: Name and Actions */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onViewDetails(c)}
                    className="font-bold text-slate-900 hover:text-blue-600 text-left text-sm"
                  >
                    {c.fullName}
                  </button>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {c.position}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewDetails(c)}
                    className="p-1 text-slate-500 hover:text-blue-600"
                    aria-label="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditCandidate(c)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCandidate(c)}
                    className="p-1 text-slate-500 hover:text-rose-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{formatDate(c.applicationDate)}</span>
                </div>
                {c.location && (
                  <div className="flex items-center gap-1 col-span-2 text-slate-500 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>
                )}
              </div>

              {/* Stage & Rating Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                  >
                    {c.stage}
                  </span>
                  <select
                    value={c.stage}
                    onChange={(e) => onUpdateStage(c.id, e.target.value as HiringStage)}
                    className="text-xs py-1 px-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700"
                  >
                    {HIRING_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <RatingStars
                  rating={c.rating}
                  interactive
                  size="sm"
                  onChange={(newRating) => onUpdateRating(c.id, newRating)}
                  idPrefix={`mobile-rating-${c.id}`}
                />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
