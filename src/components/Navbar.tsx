import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Table2, 
  Columns3, 
  Plus 
} from 'lucide-react';

export type NavView = 'dashboard' | 'candidates' | 'pipeline';

interface NavbarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  onOpenAddModal: () => void;
  totalCandidates: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenAddModal,
  totalCandidates,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Title */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Candidate Hiring Tracker
              </h1>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              <button
                id="nav-dashboard-btn"
                type="button"
                onClick={() => onViewChange('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-candidates-btn"
                type="button"
                onClick={() => onViewChange('candidates')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'candidates'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Table2 className="w-4 h-4 text-slate-500" />
                <span>Candidates</span>
                {totalCandidates > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                    {totalCandidates}
                  </span>
                )}
              </button>

              <button
                id="nav-pipeline-btn"
                type="button"
                onClick={() => onViewChange('pipeline')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'pipeline'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Columns3 className="w-4 h-4 text-slate-500" />
                <span>Pipeline</span>
              </button>
            </nav>
          </div>

          {/* Right Action: Add Candidate */}
          <div className="flex items-center gap-3">
            <button
              id="nav-add-candidate-btn"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-98 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>

        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden py-2 border-t border-slate-100 gap-1" aria-label="Mobile Navigation">
          <button
            id="mobile-nav-dashboard-btn"
            type="button"
            onClick={() => onViewChange('dashboard')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </button>
          <button
            id="mobile-nav-candidates-btn"
            type="button"
            onClick={() => onViewChange('candidates')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
              currentView === 'candidates'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Candidates ({totalCandidates})
          </button>
          <button
            id="mobile-nav-pipeline-btn"
            type="button"
            onClick={() => onViewChange('pipeline')}
            className={`flex-1 py-1.5 text-center text-xs font-medium rounded ${
              currentView === 'pipeline'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pipeline
          </button>
        </div>

      </div>
    </header>
  );
};
