import React from 'react';
import { Trash2 } from 'lucide-react';
import { Candidate } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  candidate: Candidate | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  candidate,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div
      id="delete-confirm-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        id="delete-confirm-modal-content"
        className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Delete Candidate?
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{candidate.fullName}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            id="cancel-delete-candidate-btn"
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-candidate-btn"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-lg transition-colors shadow-2xs"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
