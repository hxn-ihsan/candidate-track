import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Candidate, 
  CandidateInput, 
  CandidateFilter, 
  HiringStage, 
  DatabaseStatus 
} from './types';
import { Navbar, NavView } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FilterBar } from './components/FilterBar';
import { CandidateTable } from './components/CandidateTable';
import { KanbanPipeline } from './components/KanbanPipeline';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateFormModal } from './components/CandidateFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Navigation: 'dashboard' | 'candidates' | 'pipeline'
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // Search and Filters
  const [filter, setFilter] = useState<CandidateFilter>({
    search: '',
    stage: 'all',
    position: 'all',
    rating: 'all',
  });

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);
  const [defaultStageForAdd, setDefaultStageForAdd] = useState<HiringStage>('Applied');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Database Connection Info
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Candidates from API
  const fetchCandidates = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch('/api/candidates');
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        const errorText = json.error || json.message || 'Unable to connect to the database.';
        console.warn('Database connection status:', errorText);
        setLoadError(errorText);
        return;
      }
      if (Array.isArray(json.data)) {
        setCandidates(json.data);
      } else {
        setLoadError('Invalid response format received from server.');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Unable to connect to the database.';
      console.warn('Database fetch warning:', errMsg);
      setLoadError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Database Status
  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDbStatus(json.data);
        }
      }
    } catch (err) {
      console.warn('Could not retrieve DB status:', err);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
    fetchDbStatus();
  }, [fetchCandidates, fetchDbStatus]);

  // Available positions for filter dropdown
  const availablePositions = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      if (c.position && c.position.trim()) {
        set.add(c.position.trim());
      }
    });
    return Array.from(set).sort();
  }, [candidates]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Stage
      if (filter.stage !== 'all' && c.stage.toLowerCase() !== filter.stage.toLowerCase()) {
        return false;
      }
      // Position
      if (filter.position !== 'all' && c.position.toLowerCase() !== filter.position.toLowerCase()) {
        return false;
      }
      // Rating
      if (filter.rating !== 'all' && c.rating !== Number(filter.rating)) {
        return false;
      }
      // Search term (Name, Email, Position)
      if (filter.search.trim()) {
        const term = filter.search.trim().toLowerCase();
        const matchesName = c.fullName.toLowerCase().includes(term);
        const matchesEmail = c.email.toLowerCase().includes(term);
        const matchesPosition = c.position.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesPosition) {
          return false;
        }
      }
      return true;
    });
  }, [candidates, filter]);

  // Handlers for Filters
  const handleFilterChange = (newFilter: Partial<CandidateFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleResetFilter = () => {
    setFilter({
      search: '',
      stage: 'all',
      position: 'all',
      rating: 'all',
    });
  };

  // Add / Edit Candidate Submit
  const handleFormSubmit = async (
    candidateData: CandidateInput,
    isEdit: boolean,
    candidateId?: string
  ) => {
    if (isEdit && candidateId) {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to save candidate.');
      }
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? data.data : c))
      );
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(data.data);
      }
      addToast('success', 'Candidate updated successfully.');
    } else {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to save candidate.');
      }
      setCandidates((prev) => [data.data, ...prev]);
      addToast('success', 'Candidate added successfully.');
    }
    fetchDbStatus();
  };

  // Update Stage
  const handleUpdateStage = async (candidateId: string, newStage: HiringStage) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c))
    );
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      const res = await fetch(`/api/candidates/${candidateId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to update stage.');
      }
      addToast('success', `Moved to ${newStage}.`);
      fetchDbStatus();
    } catch (err: any) {
      addToast('error', 'Unable to update stage.', err?.message);
      fetchCandidates();
    }
  };

  // Update Rating
  const handleUpdateRating = async (candidateId: string, newRating: number) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, rating: newRating, updatedAt: new Date().toISOString() } : c))
    );
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, rating: newRating } : null));
    }

    try {
      const res = await fetch(`/api/candidates/${candidateId}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to save rating.');
      }
      addToast('success', 'Rating updated successfully.');
    } catch (err: any) {
      addToast('error', 'Unable to save rating.', err?.message);
      fetchCandidates();
    }
  };

  // Update Notes
  const handleUpdateNotes = async (candidateId: string, notes: string) => {
    const res = await fetch(`/api/candidates/${candidateId}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Unable to save notes.');
    }
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, notes, updatedAt: new Date().toISOString() } : c))
    );
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, notes } : null));
    }
    addToast('success', 'Notes saved successfully.');
  };

  // Delete Candidate
  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/candidates/${candidateToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to delete candidate.');
      }
      setCandidates((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
      if (selectedCandidate?.id === candidateToDelete.id) {
        setIsDetailModalOpen(false);
        setSelectedCandidate(null);
      }
      setIsDeleteModalOpen(false);
      addToast('success', 'Candidate deleted successfully.');
      fetchDbStatus();
    } catch (err: any) {
      addToast('error', 'Unable to delete candidate.', err?.message);
    } finally {
      setIsDeleting(false);
      setCandidateToDelete(null);
    }
  };

  // Modal Openers
  const openAddCandidateModal = (stage: HiringStage = 'Applied') => {
    setCandidateToEdit(null);
    setDefaultStageForAdd(stage);
    setIsFormModalOpen(true);
  };

  const openEditCandidateModal = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setIsFormModalOpen(true);
  };

  const openViewCandidateModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const openDeleteCandidateModal = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAddModal={() => openAddCandidateModal('Applied')}
        totalCandidates={candidates.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium">Loading candidate hiring tracker...</p>
          </div>
        ) : loadError ? (
          /* Error State */
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 sm:p-8 text-center max-w-xl mx-auto my-12 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              Unable to connect to the database.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 max-w-md mx-auto">
              {loadError}
            </p>

            <div className="text-left bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-700 mb-6 space-y-2.5">
              <p className="font-bold text-slate-900">Required MongoDB Configuration:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                <li>Create a cluster on <strong>MongoDB Atlas</strong> or start a local MongoDB instance.</li>
                <li>Add your database user & configure Network Access (allow IP <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">0.0.0.0/0</code> for cloud access).</li>
                <li>Set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">MONGODB_URI</code> in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.</li>
                <li>Set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">MONGODB_DB=candidate_hiring_tracker</code>.</li>
                <li>Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">npm run seed</code> to populate sample candidates.</li>
              </ol>
            </div>

            <button
              id="retry-fetch-btn"
              type="button"
              onClick={() => {
                fetchCandidates();
                fetchDbStatus();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg transition-all shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <>
            {/* VIEW 1: DASHBOARD */}
            {currentView === 'dashboard' && (
              <Dashboard
                candidates={candidates}
                onViewCandidate={openViewCandidateModal}
                onGoToCandidates={() => setCurrentView('candidates')}
                onOpenAddModal={() => openAddCandidateModal('Applied')}
              />
            )}

            {/* VIEW 2: CANDIDATES */}
            {currentView === 'candidates' && (
              <>
                <FilterBar
                  filter={filter}
                  onFilterChange={handleFilterChange}
                  onResetFilter={handleResetFilter}
                  availablePositions={availablePositions}
                  totalResults={filteredCandidates.length}
                  totalCandidates={candidates.length}
                />
                <CandidateTable
                  candidates={filteredCandidates}
                  onViewDetails={openViewCandidateModal}
                  onEditCandidate={openEditCandidateModal}
                  onDeleteCandidate={openDeleteCandidateModal}
                  onUpdateStage={handleUpdateStage}
                  onUpdateRating={handleUpdateRating}
                  onResetFilters={handleResetFilter}
                  onOpenAddModal={() => openAddCandidateModal('Applied')}
                />
              </>
            )}

            {/* VIEW 3: PIPELINE */}
            {currentView === 'pipeline' && (
              <>
                <FilterBar
                  filter={filter}
                  onFilterChange={handleFilterChange}
                  onResetFilter={handleResetFilter}
                  availablePositions={availablePositions}
                  totalResults={filteredCandidates.length}
                  totalCandidates={candidates.length}
                />
                <KanbanPipeline
                  candidates={filteredCandidates}
                  onViewDetails={openViewCandidateModal}
                  onEditCandidate={openEditCandidateModal}
                  onDeleteCandidate={openDeleteCandidateModal}
                  onUpdateStage={handleUpdateStage}
                  onUpdateRating={handleUpdateRating}
                  onAddNewInStage={(stage) => openAddCandidateModal(stage)}
                />
              </>
            )}
          </>
        )}

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Candidate Hiring Tracker
          </span>
          <span className="text-[11px]">
            {dbStatus?.connected ? (
              <span className="text-emerald-600 font-medium inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected to MongoDB ({dbStatus.databaseName})
              </span>
            ) : (
              <span className="text-amber-600 font-medium inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Database Disconnected (MONGODB_URI required)
              </span>
            )}
          </span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCandidate(null);
        }}
        onEdit={openEditCandidateModal}
        onDelete={openDeleteCandidateModal}
        onUpdateStage={handleUpdateStage}
        onUpdateRating={handleUpdateRating}
        onUpdateNotes={handleUpdateNotes}
      />

      <CandidateFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCandidateToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        candidateToEdit={candidateToEdit}
        defaultStage={defaultStageForAdd}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        candidate={candidateToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCandidateToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
