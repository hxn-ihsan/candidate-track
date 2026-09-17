import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { HIRING_STAGES, CandidateFilter } from '../types';

interface FilterBarProps {
  filter: CandidateFilter;
  onFilterChange: (newFilter: Partial<CandidateFilter>) => void;
  onResetFilter: () => void;
  availablePositions: string[];
  totalResults: number;
  totalCandidates: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  availablePositions,
  totalResults,
  totalCandidates,
}) => {
  const isFiltered =
    Boolean(filter.search.trim()) ||
    filter.stage !== 'all' ||
    filter.position !== 'all' ||
    filter.rating !== 'all';

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="candidate-search-input"
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by name, email, or position..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {filter.search && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters and Reset Button */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Hiring Stage Filter */}
          <div className="flex items-center">
            <label htmlFor="filter-stage-select" className="sr-only">
              Hiring Stage
            </label>
            <select
              id="filter-stage-select"
              value={filter.stage}
              onChange={(e) => onFilterChange({ stage: e.target.value })}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              {HIRING_STAGES.map((s) => (
                <option key={s} value={s}>
                  Stage: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div className="flex items-center">
            <label htmlFor="filter-position-select" className="sr-only">
              Position
            </label>
            <select
              id="filter-position-select"
              value={filter.position}
              onChange={(e) => onFilterChange({ position: e.target.value })}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate"
            >
              <option value="all">All Positions</option>
              {availablePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center">
            <label htmlFor="filter-rating-select" className="sr-only">
              Rating
            </label>
            <select
              id="filter-rating-select"
              value={filter.rating}
              onChange={(e) => onFilterChange({ rating: e.target.value })}
              className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            id="reset-filters-btn"
            type="button"
            onClick={onResetFilter}
            disabled={!isFiltered}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              isFiltered
                ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 cursor-pointer'
                : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>

        </div>

      </div>

      {/* Result feedback */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span>
          Showing <strong className="text-slate-800">{totalResults}</strong> of{' '}
          <strong className="text-slate-800">{totalCandidates}</strong> candidate{totalCandidates === 1 ? '' : 's'}
        </span>
        {isFiltered && (
          <span className="text-blue-600 font-medium text-[11px]">
            Filters applied
          </span>
        )}
      </div>
    </div>
  );
};
