import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  HardDrive,
  Settings,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { SyncRule } from '../../types/drive';
import { formatBytes, formatRelativeTime } from '../../utils/format';

export const SyncView: React.FC = () => {
  const {
    syncRules,
    syncTasks,
    isSyncing,
    lastGlobalSyncTime,
    triggerManualSync,
    addSyncRule,
    toggleSyncRule,
    deleteSyncRule,
    accounts,
  } = useDrive();

  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [sourceAccId, setSourceAccId] = useState(accounts[0]?.id || '');
  const [targetAccId, setTargetAccId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [folderPath, setFolderPath] = useState('/Dokumen_Krusial');
  const [direction, setDirection] = useState<'one_way' | 'two_way'>('one_way');
  const [intervalMin, setIntervalMin] = useState(15);
  const [conflictRes, setConflictRes] = useState<'keep_newer' | 'overwrite_target' | 'keep_both'>('keep_newer');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    addSyncRule({
      name: ruleName,
      sourceAccountId: sourceAccId,
      targetAccountId: targetAccId,
      folderPath,
      direction,
      autoSync: true,
      syncIntervalMinutes: Number(intervalMin),
      conflictResolution: conflictRes,
    });

    setIsNewRuleModalOpen(false);
    setRuleName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Sinkronisasi Real-Time Antar Akun Drive</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Mesin Aktif
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Otomatisasi replikasi dan transfer file antar drive tanpa unduh ulang manual
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewRuleModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-900/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aturan Sinkron</span>
          </button>
          <button
            type="button"
            onClick={() => triggerManualSync()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            <span>Jalankan Semua Sekarang</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Status Sinkronisasi Global</h3>
            <p className="text-xs text-slate-400">
              Terakhir diperbarui: <span className="text-slate-200">{formatRelativeTime(lastGlobalSyncTime)}</span> • {syncRules.length} aturan aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <span className="text-slate-400">Penyelesaian Konflik:</span>
            <p className="font-semibold text-white">Otomatis Versi Terbaru</p>
          </div>
          <span className="h-6 w-px bg-slate-800 hidden sm:block"></span>
          <div className="text-right">
            <span className="text-slate-400">Siklus Otomatis:</span>
            <p className="font-semibold text-emerald-400">Tiap 45 detik</p>
          </div>
        </div>
      </div>

      {/* Active Sync Rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Aturan Sinkronisasi Lintas Akun</h3>
          <span className="text-xs text-slate-400">{syncRules.length} aturan terdaftar</span>
        </div>

        <div className="space-y-3">
          {syncRules.map(rule => {
            const sourceAcc = accounts.find(a => a.id === rule.sourceAccountId);
            const targetAcc = accounts.find(a => a.id === rule.targetAccountId);

            return (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rule.autoSync
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.autoSync ? 'Aktif Otomatis' : 'Dijeda'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-mono">
                      {rule.folderPath}
                    </span>
                  </div>

                  {/* Flow from source to target */}
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-medium">{sourceAcc?.name || 'Akun Sumber'}</span>
                    </div>

                    {rule.direction === 'two_way' ? (
                      <ArrowLeftRight className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                    )}

                    <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">{targetAcc?.name || 'Akun Target'}</span>
                    </div>

                    <span className="text-slate-500 text-[11px] hidden sm:inline">
                      (Interval: {rule.syncIntervalMinutes} menit)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => triggerManualSync(rule.id)}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Jalankan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSyncRule(rule.id, !rule.autoSync)}
                    title={rule.autoSync ? 'Jeda aturan' : 'Aktifkan aturan'}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {rule.autoSync ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSyncRule(rule.id)}
                    title="Hapus aturan"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Transfer Queue / Activity Log */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Antrean & Riwayat Sinkronisasi Real-Time</h3>
            <p className="text-xs text-slate-400">Proses transfer file yang sedang berjalan dan baru selesai</p>
          </div>
          {syncTasks.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono">
              {syncTasks.length} tugas
            </span>
          )}
        </div>

        {syncTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
            <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <p>Tidak ada antrean sinkronisasi aktif saat ini. Semua akun Google Drive mutakhir.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncTasks.slice(0, 6).map(task => {
              const src = accounts.find(a => a.id === task.sourceAccountId);
              const tgt = accounts.find(a => a.id === task.targetAccountId);

              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-white truncate">{task.fileName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-blue-400 font-mono text-[11px] truncate">
                        {src?.name.split(' ')[0]} → {tgt?.name.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status === 'completed' ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selesai
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          {task.progress}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Sync Rule Modal */}
      {isNewRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Buat Aturan Sinkronisasi Baru</h3>
              <button
                onClick={() => setIsNewRuleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-300">Nama Aturan:</label>
                <input
                  type="text"
                  placeholder="Misal: Cermin Dokumen Bisnis ke Vault Pribadi"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  required
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-300">Akun Sumber (Source):</label>
                  <select
                    value={sourceAccId}
                    onChange={e => setSourceAccId(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-300">Akun Target (Destination):</label>
                  <select
                    value={targetAccId}
                    onChange={e => setTargetAccId(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-300">Arah Sinkronisasi:</label>
                  <select
                    value={direction}
                    onChange={e => setDirection(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="one_way">Satu Arah (Cermin Sumber → Target)</option>
                    <option value="two_way">Dua Arah (Sinkronisasi Timbal Balik)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-300">Resolusi Konflik:</label>
                  <select
                    value={conflictRes}
                    onChange={e => setConflictRes(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="keep_newer">Pertahankan Versi Terbaru (Keep Newer)</option>
                    <option value="keep_both">Simpan Keduanya (Keep Both)</option>
                    <option value="overwrite_target">Timpa Target (Overwrite)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-300">Jalur Direktori / Folder Drive:</label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={e => setFolderPath(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
