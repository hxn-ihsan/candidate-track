import React from 'react';
import { 
  MapPin, 
  Eye, 
  Pencil, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { Candidate, HiringStage, HIRING_STAGES } from '../types';
import { getStageBadgeStyle } from '../utils/helpers';
import { RatingStars } from './RatingStars';

interface KanbanPipelineProps {
  candidates: Candidate[];
  onViewDetails: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  onUpdateStage: (candidateId: string, newStage: HiringStage) => void;
  onUpdateRating: (candidateId: string, rating: number) => void;
  onAddNewInStage: (stage: HiringStage) => void;
}

export const KanbanPipeline: React.FC<KanbanPipelineProps> = ({
  candidates,
  onViewDetails,
  onEditCandidate,
  onDeleteCandidate,
  onUpdateStage,
  onUpdateRating,
  onAddNewInStage,
}) => {
  return (
    <div
      id="kanban-board-container"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-6 items-start"
    >
      {HIRING_STAGES.map((stage) => {
        const stageCandidates = candidates.filter((c) => c.stage === stage);
        const style = getStageBadgeStyle(stage);

        return (
          <div
            key={stage}
            id={`kanban-column-${stage.toLowerCase()}`}
            className="flex flex-col bg-slate-100/70 rounded-xl border border-slate-200/90 p-3 min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                <h3 className="font-semibold text-xs text-slate-800 tracking-tight">
                  {stage}
                </h3>
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200 font-mono">
                  {stageCandidates.length}
                </span>
              </div>

              <button
                id={`add-in-${stage.toLowerCase()}-btn`}
                type="button"
                onClick={() => onAddNewInStage(stage)}
                title={`Add candidate to ${stage}`}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                aria-label={`Add candidate to ${stage}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Candidates Stack */}
            <div className="flex flex-col gap-2.5">
              {stageCandidates.length === 0 ? (
                <div className="h-28 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center p-3 text-slate-400 text-xs">
                  <span>No candidates</span>
                </div>
              ) : (
                stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    id={`candidate-card-${candidate.id}`}
                    className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                  >
                    {/* Header: Name and Action buttons */}
                    <div className="flex items-start justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(candidate)}
                        className="text-left font-semibold text-xs sm:text-sm text-slate-900 hover:text-blue-600 hover:underline leading-tight line-clamp-1"
                      >
                        {candidate.fullName}
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onViewDetails(candidate)}
                          className="p-1 hover:text-blue-600"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCandidate(candidate)}
                          className="p-1 hover:text-slate-800"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCandidate(candidate)}
                          className="p-1 hover:text-rose-600"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Position */}
                    <p className="text-xs font-medium text-slate-700 leading-tight">
                      {candidate.position}
                    </p>

                    {/* Location */}
                    {candidate.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{candidate.location}</span>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Rating
                      </span>
                      <RatingStars
                        rating={candidate.rating}
                        interactive
                        size="sm"
                        onChange={(newRating) => onUpdateRating(candidate.id, newRating)}
                        idPrefix={`pipeline-rating-${candidate.id}`}
                      />
                    </div>

                    {/* Short Note */}
                    {candidate.notes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-150 line-clamp-2 leading-relaxed">
                        {candidate.notes}
                      </div>
                    )}

                    {/* Stage Selector */}
                    <div className="pt-1.5 border-t border-slate-100">
                      <label htmlFor={`pipeline-stage-select-${candidate.id}`} className="sr-only">
                        Change stage for {candidate.fullName}
                      </label>
                      <select
                        id={`pipeline-stage-select-${candidate.id}`}
                        value={candidate.stage}
                        onChange={(e) => onUpdateStage(candidate.id, e.target.value as HiringStage)}
                        className="w-full text-xs font-medium py-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {HIRING_STAGES.map((st) => (
                          <option key={st} value={st}>
                            Stage: {st}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
