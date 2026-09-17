import React, { useState, useEffect } from 'react';
import { X, UserPlus, Pencil, AlertCircle } from 'lucide-react';
import { Candidate, CandidateInput, HiringStage, HIRING_STAGES } from '../types';
import { isValidEmail } from '../utils/helpers';
import { RatingStars } from './RatingStars';

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateData: CandidateInput, isEdit: boolean, candidateId?: string) => Promise<void>;
  candidateToEdit?: Candidate | null;
  defaultStage?: HiringStage;
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateToEdit,
  defaultStage = 'Applied',
}) => {
  const isEdit = Boolean(candidateToEdit);

  const [formData, setFormData] = useState<CandidateInput>({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    resumeUrl: '',
    applicationDate: new Date().toISOString().split('T')[0],
    stage: defaultStage,
    rating: 3,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (candidateToEdit) {
      setFormData({
        fullName: candidateToEdit.fullName,
        email: candidateToEdit.email,
        phone: candidateToEdit.phone || '',
        position: candidateToEdit.position,
        location: candidateToEdit.location || '',
        resumeUrl: candidateToEdit.resumeUrl || '',
        applicationDate: candidateToEdit.applicationDate || new Date().toISOString().split('T')[0],
        stage: candidateToEdit.stage,
        rating: candidateToEdit.rating || 3,
        notes: candidateToEdit.notes || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        location: '',
        resumeUrl: '',
        applicationDate: new Date().toISOString().split('T')[0],
        stage: defaultStage,
        rating: 3,
        notes: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [candidateToEdit, defaultStage, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position applied for is required.';
    }

    if (!formData.applicationDate) {
      newErrors.applicationDate = 'Application date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData, isEdit, candidateToEdit?.id);
      onClose();
    } catch (err: any) {
      setServerError(err?.message || 'Failed to save candidate. Please check input and database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="candidate-form-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="candidate-form-modal-content"
        className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              {isEdit ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Candidate Profile' : 'Add New Job Candidate'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Update candidate information, stage, or notes'
                  : 'Enter applicant details to track in hiring pipeline'}
              </p>
            </div>
          </div>

          <button
            id="close-form-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Banner if any */}
        {serverError && (
          <div className="p-3.5 mx-6 mt-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block">Submission Error</strong>
              {serverError}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Full Name */}
          <div>
            <label htmlFor="form-candidate-fullName" className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="form-candidate-fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              placeholder="e.g. Jordan Miller"
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.fullName}</p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-candidate-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-candidate-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="jordan.miller@example.com"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="form-candidate-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="form-candidate-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Position Applied For & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-candidate-position" className="block text-xs font-semibold text-slate-700 mb-1">
                Position Applied For <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-candidate-position"
                type="text"
                required
                value={formData.position}
                onChange={(e) => {
                  setFormData({ ...formData, position: e.target.value });
                  if (errors.position) setErrors({ ...errors, position: '' });
                }}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.position ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                }`}
              />
              {errors.position && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.position}</p>
              )}
            </div>

            <div>
              <label htmlFor="form-candidate-location" className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                id="form-candidate-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (Remote)"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Hiring Stage & Application Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-candidate-stage" className="block text-xs font-semibold text-slate-700 mb-1">
                Hiring Stage <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-candidate-stage"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as HiringStage })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {HIRING_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="form-candidate-applicationDate" className="block text-xs font-semibold text-slate-700 mb-1">
                Application Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-candidate-applicationDate"
                type="date"
                required
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Resume/CV Link & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label htmlFor="form-candidate-resumeUrl" className="block text-xs font-semibold text-slate-700 mb-1">
                Resume / CV Link
              </label>
              <input
                id="form-candidate-resumeUrl"
                type="url"
                value={formData.resumeUrl}
                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                placeholder="https://example.com/resume.pdf"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="form-candidate-rating" className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Rating (1 - 5 Stars)
              </label>
              <div className="flex items-center gap-3 py-1">
                <RatingStars
                  rating={formData.rating}
                  interactive
                  size="md"
                  onChange={(newRating) => setFormData({ ...formData, rating: newRating })}
                  idPrefix="form-rating-star"
                />
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {formData.rating} Stars
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="form-candidate-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Recruiter Notes & Comments
            </label>
            <textarea
              id="form-candidate-notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Initial screening notes, interview impressions, key strengths..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              id="cancel-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-candidate-form-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-md shadow-xs transition-all"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Candidate'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
