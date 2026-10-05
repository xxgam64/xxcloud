import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useDrive } from '../context/DriveContext';

export const DestructiveConfirmModal: React.FC = () => {
  const { destructiveModal, closeDestructiveModal } = useDrive();

  if (!destructiveModal || !destructiveModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Konfirmasi Tindakan</h3>
              <p className="text-xs text-red-400 font-medium">Perubahan Permanen pada Google Drive</p>
            </div>
          </div>
          <button
            onClick={closeDestructiveModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <h4 className="text-base font-medium text-slate-100">{destructiveModal.title}</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            {destructiveModal.description}
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <span className="font-bold">Perhatian:</span> Tindakan ini akan dieksekusi langsung pada API Google Workspace dengan izin akun Anda.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={closeDestructiveModal}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={async () => {
              await destructiveModal.onConfirm();
              closeDestructiveModal();
            }}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-900/40 transition active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            {destructiveModal.actionLabel || 'Konfirmasi Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};
