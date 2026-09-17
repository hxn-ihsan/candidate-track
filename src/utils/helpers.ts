import { HiringStage } from '../types';

export function getStageBadgeStyle(stage: HiringStage): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (stage) {
    case 'Applied':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
      };
    case 'Interview':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-600',
      };
    case 'Test':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'Offer':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-600',
      };
    case 'Accepted':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600',
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-600',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
