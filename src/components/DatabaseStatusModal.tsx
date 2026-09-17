import React from 'react';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { DatabaseStatus } from '../types';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DatabaseStatus | null;
  onRefresh: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const sampleUri =
    'mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority';

  const copySample = () => {
    navigator.clipboard.writeText(sampleUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="database-status-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="database-status-modal-content"
        className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                MongoDB Connection Status
              </h3>
              <p className="text-xs text-slate-500">
                Live MongoDB Atlas & Server Connection
              </p>
            </div>
          </div>
          <button
            id="close-db-status-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              status?.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {status?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <span className="font-bold block text-sm mb-0.5">
                {status?.connected ? 'Connected to MongoDB Live' : 'MongoDB Not Connected'}
              </span>
              <p className="leading-relaxed text-slate-600">
                {status?.connected
                  ? `Active MongoDB driver connection established to database: ${status.databaseName}`
                  : status?.error || 'Unable to connect to the database. MONGODB_URI is required.'}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Driver:</span>
              <strong className="text-slate-800">Official MongoDB Node.js Driver (mongodb)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Database Name:</span>
              <strong className="text-slate-800">{status?.databaseName || 'candidate_hiring_tracker'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Collection:</span>
              <strong className="text-slate-800">candidates</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Records in MongoDB:</span>
              <strong className="text-slate-800">{status?.totalCandidates ?? 0} candidates</strong>
            </div>
          </div>

          {/* Configuration instructions */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Atlas & Vercel Configuration
            </h4>
            <p className="text-xs text-slate-600 mb-2 leading-relaxed">
              Set your connection string in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">.env.local</code> (or Vercel project environment settings):
            </p>

            <div className="relative mb-2">
              <pre className="bg-slate-900 text-slate-100 p-2.5 rounded text-[11px] font-mono overflow-x-auto select-all">
                {`MONGODB_URI="${sampleUri}"\nMONGODB_DB="candidate_hiring_tracker"`}
              </pre>
              <button
                type="button"
                onClick={copySample}
                className="absolute top-1.5 right-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">npm run seed</code> to populate initial fictional records.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            id="refresh-db-status-btn"
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Refresh Status
          </button>
          <button
            id="close-db-modal-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
