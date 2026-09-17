export type HiringStage =
  | 'Applied'
  | 'Interview'
  | 'Test'
  | 'Offer'
  | 'Accepted'
  | 'Rejected';

export const HIRING_STAGES: HiringStage[] = [
  'Applied',
  'Interview',
  'Test',
  'Offer',
  'Accepted',
  'Rejected',
];

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  resumeUrl: string;
  applicationDate: string; // YYYY-MM-DD
  stage: HiringStage;
  rating: number; // 1 to 5
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CandidateInput = Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>;

export interface CandidateFilter {
  search: string;
  stage: string;
  position: string;
  rating: string;
}

export interface DatabaseStatus {
  connected: boolean;
  type?: string;
  databaseName: string;
  collectionName?: string;
  totalCandidates?: number;
  uriConfigured?: boolean;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  total: number;
  applied: number;
  interview: number;
  test: number;
  offer: number;
  accepted: number;
  rejected: number;
  avgRating: number;
}
