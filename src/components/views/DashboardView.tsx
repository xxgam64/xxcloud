import React, { useState } from 'react';
import {
  HardDrive,
  Users,
  Files,
  Shield,
  RefreshCw,
  Share2,
  Lock,
  Upload,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { formatBytes, formatRelativeTime } from '../../utils/format';

interface Props {
  onOpenUploadModal: () => void;
  onOpenVaultModal: () => void;
  onOpenConnectModal: () => void;
}

export const DashboardView: React.FC<Props> = ({
  onOpenUploadModal,
  onOpenVaultModal,
  onOpenConnectModal,
}) => {
  const {
    accounts,
    files,
    analytics,
    isVaultUnlocked,
    isVaultConfigured,
    isSyncing,
    lastGlobalSyncTime,
    triggerManualSync,
    setActiveView,
    setShareModalFile,
    setSelectedAccountId,
  } = useDrive();

  const recentFiles = files.slice(0, 5);
  const encryptedFiles = files.filter(f => f.isEncrypted);
  const sharedFiles = files.filter(f => f.shared);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Account Cloud Storage Orchestration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pusat Multi Google Drive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">XXCLOUD</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Akses dan kelola seluruh berkas dari {accounts.length} akun Google Drive Anda dalam satu dasbor
              terpadu dengan proteksi enkripsi End-to-End (E2EE), sinkronisasi real-time, dan kontrol berbagi fleksibel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/40 transition active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah / Enkripsi File</span>
            </button>
            <button
              type="button"
              onClick={() => triggerManualSync()}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
              <span>Sinkronkan Semua Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Storage */}
        <div
          onClick={() => setActiveView('analytics')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Kapasitas Cloud
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {formatBytes(analytics.totalUsed)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              dari {formatBytes(analytics.totalCapacity)} ({analytics.usagePercentage}% terpakai)
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${analytics.usagePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Connected Accounts */}
        <div
          onClick={onOpenConnectModal}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Akun Drive Terhubung
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {accounts.length} Akun
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Semua status tersambung & aktif
            </p>
          </div>
          <div className="mt-4 flex items-center -space-x-2">
            {accounts.map(acc => (
              <img
                key={acc.id}
                src={acc.avatar}
                alt={acc.name}
                className="w-6 h-6 rounded-full border-2 border-slate-900 object-cover"
                title={acc.name}
              />
            ))}
            <span className="text-[10px] text-slate-400 pl-3">Klik untuk tambah</span>
          </div>
        </div>

        {/* Card 3: Aggregated Files */}
        <div
          onClick={() => setActiveView('files')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Berkas Teragregasi
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {files.length} Berkas
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {sharedFiles.length} dibagikan ke publik
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-purple-400 font-medium">
            <span>Buka penjelajah file</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: E2EE Encrypted Vault */}
        <div
          onClick={() => {
            if (!isVaultUnlocked) {
              onOpenVaultModal();
            } else {
              setActiveView('vault');
            }
          }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Enkripsi End-to-End
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {encryptedFiles.length} Terenkripsi
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isVaultUnlocked ? 'Brankas aktif (AES-256-GCM)' : 'Brankas terkunci'}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-teal-300 font-medium">
            <span>{isVaultUnlocked ? 'Buka Brankas Vault' : 'Masukkan Sandi Vault'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Connected Drives Capacity vs Recent Files */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Per-Account Storage Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Distribusi Cloud Tiap Akun</h3>
              <p className="text-xs text-slate-400">Monitoring kuota real-time</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('analytics')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Detail
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {accounts.map(acc => {
              const usedPct = acc.quota.total > 0 ? Math.round((acc.quota.used / acc.quota.total) * 100) : 0;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    setActiveView('files');
                  }}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-white truncate">{acc.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-300">{usedPct}%</span>
                  </div>

                  <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usedPct > 85 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${usedPct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>Terpakai: {formatBytes(acc.quota.used)}</span>
                    <span>Sisa: {formatBytes(Math.max(0, acc.quota.total - acc.quota.used))}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenConnectModal}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 text-xs font-medium text-slate-400 hover:text-blue-400 transition text-center"
          >
            + Hubungkan Akun Google Drive Baru
          </button>
        </div>

        {/* Right 2 Cols: Recent Cross-Account Files & Quick Actions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Berkas Terkini Lintas Cloud</h3>
              <p className="text-xs text-slate-400">File terbaru dari semua akun yang terhubung</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('files')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Lihat Semua ({files.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentFiles.map(file => (
              <div
                key={file.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      file.isEncrypted
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : file.category === 'spreadsheet'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : file.category === 'presentation'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {file.isEncrypted ? <Shield className="w-4 h-4" /> : <Files className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-slate-100 truncate">{file.name}</h4>
                      {file.isEncrypted && (
                        <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                          E2EE
                        </span>
                      )}
                      {file.shared && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
                          Berbagi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-blue-400 font-medium">{file.accountName.split(' ')[0]}</span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(file.modifiedTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShareModalFile(file)}
                    title="Bagikan Dokumen"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('files')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Sync Banner */}
          <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Sinkronisasi Real-Time Aktif</h4>
                <p className="text-[11px] text-slate-400">
                  Pembaruan berkas otomatis terpantau di semua akun Google Drive.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('sync')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 whitespace-nowrap"
            >
              Atur Sinkronisasi
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
