import React, { useState } from 'react';
import { X, FileDown, FileUp, Copy, Check, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { db } from '../../db';

export const ImportExportModal: React.FC = () => {
  const { isImportExportOpen, closeImportExport } = useUIStore();
  const { importData } = useTaskStore();

  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isImportExportOpen) return null;

  const handleExportJSON = async () => {
    const tasks = await db.tasks.toArray();
    const projects = await db.projects.toArray();
    const sessions = await db.focusSessions.toArray();
    const stats = await db.stats.get('current_user');

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
      focusSessions: sessions,
      stats
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `momentum_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async () => {
    const tasks = await db.tasks.toArray();
    const projects = await db.projects.toArray();
    const stats = await db.stats.get('current_user');
    const jsonString = JSON.stringify({ tasks, projects, stats }, null, 2);
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          throw new Error('Invalid JSON: missing tasks array');
        }

        await importData(parsed);
        setImportStatus(`Successfully restored ${parsed.tasks.length} tasks!`);
        setErrorMessage('');
      } catch (err: any) {
        setErrorMessage(`Import failed: ${err.message || 'Invalid format'}`);
        setImportStatus('');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Local Data Backup & Restore
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                100% Local-first JSON data portability
              </p>
            </div>
          </div>
          <button
            onClick={closeImportExport}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Export Backup
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Download your full database (tasks, focus sessions, stats) as a portable JSON file.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition"
              >
                <FileDown className="w-4 h-4" />
                <span>Download JSON Backup</span>
              </button>
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:border-emerald-500/50 transition"
                title="Copy raw JSON"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Restore from Backup
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Upload a previously exported Momentum JSON backup to restore your workspace.
            </p>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--border-strong)] hover:border-emerald-500 cursor-pointer bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] transition">
              <FileUp className="w-4 h-4 text-emerald-500" />
              <span>Select JSON File to Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
