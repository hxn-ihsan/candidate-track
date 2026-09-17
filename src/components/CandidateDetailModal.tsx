import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Save, 
  Check, 
  Briefcase 
} from 'lucide-react';
import { Candidate, HiringStage, HIRING_STAGES } from '../types';
import { getStageBadgeStyle, formatDate } from '../utils/helpers';
import { RatingStars } from './RatingStars';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
  onUpdateStage: (candidateId: string, stage: HiringStage) => void;
  onUpdateRating: (candidateId: string, rating: number) => void;
  onUpdateNotes: (candidateId: string, notes: string) => Promise<void>;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStage,
  onUpdateRating,
  onUpdateNotes,
}) => {
  const [notesText, setNotesText] = useState(candidate?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  useEffect(() => {
    if (candidate) {
      setNotesText(candidate.notes || '');
      setNotesSavedSuccess(false);
    }
  }, [candidate?.id, candidate?.notes]);

  if (!isOpen || !candidate) return null;

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await onUpdateNotes(candidate.id, notesText);
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2500);
    } catch (err) {
      console.warn('Could not save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const badgeStyle = getStageBadgeStyle(candidate.stage);

  return (
    <div
      id="candidate-detail-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        id="candidate-detail-modal-content"
        className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {candidate.fullName}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                {candidate.stage}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-800">{candidate.position}</span>
              {candidate.location && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.location}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            id="close-detail-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Email */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Email
              </span>
              <a
                href={`mailto:${candidate.email}`}
                className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1.5 truncate"
              >
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </a>
            </div>

            {/* Phone */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Phone
              </span>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{candidate.phone || 'Not provided'}</span>
              </p>
            </div>

            {/* Application Date */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Application Date
              </span>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{formatDate(candidate.applicationDate)}</span>
              </p>
            </div>

            {/* Resume / CV Link */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Resume / CV
              </span>
              {candidate.resumeUrl ? (
                <a
                  id="detail-resume-link"
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">Open Resume / Link</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-slate-400">No link attached</p>
              )}
            </div>

          </div>

          {/* Hiring Stage & Rating Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Hiring Stage */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Hiring Stage
              </span>
              <label htmlFor="detail-modal-stage-select" className="sr-only">Hiring Stage</label>
              <select
                id="detail-modal-stage-select"
                value={candidate.stage}
                onChange={(e) => onUpdateStage(candidate.id, e.target.value as HiringStage)}
                className="w-full text-sm font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {HIRING_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Rating
              </span>
              <div className="flex items-center gap-3 pt-1">
                <RatingStars
                  rating={candidate.rating}
                  interactive
                  size="lg"
                  onChange={(newRating) => onUpdateRating(candidate.id, newRating)}
                  idPrefix="detail-modal-star"
                />
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {candidate.rating} / 5
                </span>
              </div>
            </div>

          </div>

          {/* Notes */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="candidate-notes-textarea"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Notes
              </label>
              {notesSavedSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Notes saved
                </span>
              )}
            </div>

            <textarea
              id="candidate-notes-textarea"
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Candidate interview notes, assessment feedback, or next steps..."
              className="w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end">
              <button
                id="save-notes-btn"
                type="button"
                disabled={isSavingNotes || notesText === candidate.notes}
                onClick={handleSaveNotes}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  notesText === candidate.notes
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-2xs'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-200 bg-slate-50/80">
          <button
            id="detail-delete-btn"
            type="button"
            onClick={() => {
              onClose();
              onDelete(candidate);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="detail-edit-btn"
              type="button"
              onClick={() => {
                onClose();
                onEdit(candidate);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="detail-close-footer-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
