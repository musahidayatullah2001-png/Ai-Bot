import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Calendar, CheckCircle2, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'primary' | 'success';
  affectedItemName?: string;
  affectedItemDetails?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  type = 'primary',
  affectedItemName,
  affectedItemDetails,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  type === 'danger'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                    : type === 'success'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400'
                }`}
              >
                {type === 'danger' ? (
                  <Trash2 className="w-6 h-6" />
                ) : type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Calendar className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Google Workspace Confirmation
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {description}
          </p>

          {/* Affected Item Details Card */}
          {affectedItemName && (
            <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {affectedItemName}
              </div>
              {affectedItemDetails && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {affectedItemDetails}
                </div>
              )}
            </div>
          )}

          {type === 'danger' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                type === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
              }`}
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
