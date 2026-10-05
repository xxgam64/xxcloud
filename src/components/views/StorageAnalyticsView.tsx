import React from 'react';
import {
  PieChart,
  HardDrive,
  AlertTriangle,
  FileText,
  Copy,
  Trash2,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { formatBytes } from '../../utils/format';

export const StorageAnalyticsView: React.FC = () => {
  const { analytics, accounts, files, deleteFile, setShareModalFile } = useDrive();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Analitik Penggunaan Penyimpanan Multi-Cloud</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
            {accounts.length} Akun Teragregasi
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pantau kapasitas total gabungan, distribusi berkas, dan deteksi berkas duplikat antar drive
        </p>
      </div>

      {/* Hero Pooled Storage Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" />
              Kapasitas Penyimpanan Terpadu (Pooled Quota)
            </span>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {formatBytes(analytics.totalUsed)}
              </h3>
              <span className="text-sm text-slate-400">
                dari total <strong className="text-slate-200">{formatBytes(analytics.totalCapacity)}</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-blue-400">{analytics.usagePercentage}%</span>
            <p className="text-xs text-slate-400">Tersedia: {formatBytes(analytics.totalFree)}</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all ${
              analytics.usagePercentage > 85
                ? 'bg-red-500'
                : analytics.usagePercentage > 70
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400'
            }`}
            style={{ width: `${analytics.usagePercentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Berkas</span>
            <span className="text-white font-bold text-base">{files.length} Item</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Drive Terkoneksi</span>
            <span className="text-white font-bold text-base">{accounts.length} Akun</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Brankas E2EE</span>
            <span className="text-teal-400 font-bold text-base">
              {files.filter(f => f.isEncrypted).length} File Aman
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Duplikat Terdeteksi</span>
            <span className="text-amber-400 font-bold text-base">
              {analytics.duplicateFilesDetected.length} File
            </span>
          </div>
        </div>
      </div>

      {/* Per-Account Storage Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Rincian Kuota Tiap Akun Google Drive</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.accountsBreakdown.map(({ account, usedPercentage, freeBytes }) => (
            <div
              key={account.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{account.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{account.email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-200">{usedPercentage}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usedPercentage > 85 ? 'bg-red-500' : usedPercentage > 70 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${usedPercentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Terpakai: <strong className="text-slate-200">{formatBytes(account.quota.used)}</strong></span>
                <span>Sisa: <strong className="text-slate-200">{formatBytes(freeBytes)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: File Type Distribution & Largest Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Type Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Distribusi Berdasarkan Format Berkas</h3>
            <span className="text-xs text-slate-400">Total {formatBytes(analytics.totalUsed)}</span>
          </div>

          <div className="space-y-3">
            {analytics.categoryBreakdown
              .filter(cat => cat.bytes > 0 || cat.count > 0)
              .map(cat => {
                const pct = analytics.totalUsed > 0 ? Math.round((cat.bytes / analytics.totalUsed) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        {cat.label} ({cat.count})
                      </span>
                      <span className="font-mono text-slate-400">
                        {formatBytes(cat.bytes)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Duplicate Files Detected Across Accounts */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-amber-400" />
                Deteksi File Duplikat Lintas Cloud
              </h3>
              <p className="text-xs text-slate-400">
                Hemat kapasitas dengan menyingkirkan file kembar antar akun
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold">
              {analytics.duplicateFilesDetected.length} file
            </span>
          </div>

          {analytics.duplicateFilesDetected.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
              Tidak ditemukan file duplikat antar akun Google Drive.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.duplicateFilesDetected.map(dup => (
                <div
                  key={dup.name}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[240px]">{dup.name}</span>
                    <span className="text-slate-400 font-mono">{formatBytes(dup.size)}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-amber-400">Ditemukan di {dup.instances.length} akun:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dup.instances.map(inst => (
                        <span
                          key={inst.fileId}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                        >
                          {inst.accountEmail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Daftar Berkas Terbesar di Seluruh Cloud</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Nama Berkas</th>
                <th className="py-2.5 px-3">Akun Drive</th>
                <th className="py-2.5 px-3">Ukuran</th>
                <th className="py-2.5 px-3">Keamanan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analytics.largestFiles.map(file => (
                <tr key={file.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-medium text-white truncate max-w-xs">{file.name}</td>
                  <td className="py-2.5 px-3 text-blue-400 font-mono">{file.accountName}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{formatBytes(file.size)}</td>
                  <td className="py-2.5 px-3">
                    {file.isEncrypted ? (
                      <span className="text-teal-400 font-semibold text-[11px]">E2EE AES-256</span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Standar</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Hapus untuk hemat kapasitas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
