import React, { useState } from 'react';
import { X, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import type { SnoozeReason } from '../../types';
import { SNOOZE_LABELS } from '../../core/estimateAnalytics';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';

export const SnoozeModal: React.FC = () => {
  const { isSnoozeModalOpen, snoozeTask, closeSnoozeModal } = useUIStore();
  const { snoozeTask: executeSnooze } = useTaskStore();

  const [selectedReason, setSelectedReason] = useState<SnoozeReason>('not_in_mood');
  const [rescheduleDays, setRescheduleDays] = useState<number>(1);
  const [notes, setNotes] = useState('');

  if (!isSnoozeModalOpen || !snoozeTask) return null;

  const handleConfirmSnooze = async () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const rescheduleTimestamp =
      rescheduleDays > 0 ? Date.now() + rescheduleDays * dayMs : undefined;

    await executeSnooze(snoozeTask.id, selectedReason, notes.trim() || undefined, rescheduleTimestamp);
  };

  const reasonList: Array<{ id: SnoozeReason; label: string; icon: string; desc: string }> = [
    { id: 'too_big', label: 'Too big', icon: '🐘', desc: 'Overwhelming scope or cognitive resistance' },
    { id: 'not_in_mood', label: 'Not in the mood', icon: '🥱', desc: 'Low energy or motivation mismatch' },
    { id: 'waiting_on_someone', label: 'Waiting on someone', icon: '⏳', desc: 'Blocked on external reply or asset' },
    { id: 'forgot', label: 'Forgot about it', icon: '💭', desc: 'Buried in the backlog noise' },
    { id: 'not_important', label: 'Not really important', icon: '🍂', desc: 'Questioning if this truly matters' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Snooze with a Reason
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Intentional delay builds self-awareness
              </p>
            </div>
          </div>
          <button
            onClick={closeSnoozeModal}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)]">Postponing: </span>
            <strong className="text-[var(--text-primary)]">{snoozeTask.title}</strong>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
              Why are you postponing this? *
            </label>
            <div className="space-y-1.5">
              {reasonList.map((item) => {
                const isSelected = selectedReason === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedReason(item.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-[var(--text-primary)] ring-1 ring-amber-500/30'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Postpone Duration */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
              Reschedule For:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { days: 1, label: 'Tomorrow' },
                { days: 2, label: 'In 2 days' },
                { days: 7, label: 'Next week' },
                { days: 0, label: 'Backlog' }
              ].map((slot) => (
                <button
                  key={slot.days}
                  type="button"
                  onClick={() => setRescheduleDays(slot.days)}
                  className={`py-2 rounded-xl text-xs font-medium border text-center transition ${
                    rescheduleDays === slot.days
                      ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Brief note or reminder (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Waiting on Alice to reply..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeSnoozeModal}
              className="px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSnooze}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition"
            >
              Postpone & Log Reason
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
