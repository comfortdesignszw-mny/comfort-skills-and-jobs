import React, { useRef, useState } from 'react';
import { 
  X, 
  RefreshCw, 
  Download, 
  Upload, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RotateCcw 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';

export const SyncManagerModal: React.FC = () => {
  const { 
    showSyncModal, 
    setShowSyncModal, 
    isEffectivelyOnline, 
    syncQueue, 
    runSync, 
    isSyncing, 
    storageStats, 
    showToast 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  if (!showSyncModal) return null;

  const handleExportBackup = () => {
    const jsonStr = StorageEngine.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comfort_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Device backup downloaded successfully.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = StorageEngine.restoreBackupJSON(text);
        if (success) {
          setRestoreStatus('Backup restored successfully!');
          showToast('Data restored successfully.');
        } else {
          setRestoreStatus('Invalid backup file structure.');
        }
      } catch {
        setRestoreStatus('Failed to read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Synchronization & Storage
              </h2>
              <p className="text-xs text-slate-500">
                Local-first engine for Zimbabwe offline connectivity
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSyncModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isEffectivelyOnline 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            {isEffectivelyOnline ? (
              <Wifi className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold text-sm">
                {isEffectivelyOnline ? 'Online Sync Active' : 'Offline Mode Active'}
              </p>
              <p className="mt-0.5 text-slate-600">
                {isEffectivelyOnline 
                  ? 'All local sales, job applications, and gig updates can be uploaded to the central server.' 
                  : 'New entries are stored in your phone local database and will queue until connectivity is restored.'}
              </p>
            </div>
          </div>

          {/* Sync Outbox Queue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Local Outbox Queue ({syncQueue.length} items pending)
              </h3>
              <button
                onClick={runSync}
                disabled={isSyncing || !isEffectivelyOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {syncQueue.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 bg-slate-50/50">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <span>All local records are synchronized. No pending items in outbox.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {syncQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Queued at {new Date(item.createdAt).toLocaleTimeString()} · Type: {item.entityType}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      Queued
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Storage Stats */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Local Phone Storage Consumption
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <p className="text-base font-black text-slate-900">{storageStats.totalKb} KB</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Database Space</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <p className="text-base font-black text-teal-600">{storageStats.courseCount}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Saved Courses</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <p className="text-base font-black text-slate-900">{storageStats.txCount}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Transactions</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 italic">
              Designed for budget Android phones with limited memory. Operates with zero cloud data charges after initial asset caching.
            </p>
          </div>

          {/* Backup & Restore Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Offline Backup & Restore
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-4 h-4 text-teal-600" />
                <span>Export Device Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
              >
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Restore From File</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            {restoreStatus && (
              <p className="text-xs text-center font-medium text-teal-700">{restoreStatus}</p>
            )}
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Reset local database back to default initial Bulawayo demo dataset?')) {
                  StorageEngine.resetToDefault();
                  showToast('Database reset to initial demo state.');
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 py-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default demonstration records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
