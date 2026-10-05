import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Clock,
  Lock,
  Eye,
  Edit3,
  MessageSquare,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { formatBytes, formatDateTime, formatRelativeTime } from '../../utils/format';
import { DriveFile } from '../../types/drive';

export const SharingView: React.FC = () => {
  const { files, setShareModalFile, revokeShare } = useDrive();

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sharedFiles = files.filter(f => f.shared || f.shareSettings);

  const filtered = sharedFiles.filter(file => {
    if (!file.shareSettings) return false;
    const isExpired =
      file.shareSettings.expiresAt &&
      new Date(file.shareSettings.expiresAt).getTime() < Date.now();

    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return file.shareSettings.status === 'active' && !isExpired;
    if (filterStatus === 'expired') return isExpired || file.shareSettings.status === 'expired';
    if (filterStatus === 'revoked') return file.shareSettings.status === 'revoked';
    return true;
  });

  const handleCopy = (file: DriveFile) => {
    const url =
      file.shareSettings?.shareUrl ||
      `https://xxcloud.internal/share/sh-${file.id.substring(0, 8)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pusat Berbagi Dokumen & Hak Akses</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              {sharedFiles.length} tautan aktif & terdaftar
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kontrol izin pembaca (baca/tulis), batas tanggal kedaluwarsa tautan, dan proteksi kata sandi
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'all', label: `Semua Tautan (${sharedFiles.length})` },
          { id: 'active', label: 'Tautan Aktif' },
          { id: 'expired', label: 'Kedaluwarsa (Expired)' },
          { id: 'revoked', label: 'Dicabut (Revoked)' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterStatus === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shared Files Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">Tidak ada dokumen di kategori ini</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buka menu 'Berkas Lintas Akun', pilih berkas apapun lalu klik tombol 'Bagikan' untuk mengatur izin akses.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen</th>
                  <th className="py-3 px-4">Akun Drive Pemilik</th>
                  <th className="py-3 px-4">Tingkat Hak Akses</th>
                  <th className="py-3 px-4">Masa Kedaluwarsa</th>
                  <th className="py-3 px-4">Proteksi Sandi</th>
                  <th className="py-3 px-4">Statistik Akses</th>
                  <th className="py-3 px-4 text-right">Aksi & Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(file => {
                  const share = file.shareSettings;
                  const isExpired =
                    share?.expiresAt && new Date(share.expiresAt).getTime() < Date.now();

                  return (
                    <tr key={file.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-xs">{file.name}</span>
                          {file.isEncrypted && (
                            <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                              E2EE
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        {file.accountName}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {share?.accessRole === 'editor' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold text-[11px]">
                            <Edit3 className="w-3 h-3" />
                            Editor (Baca & Tulis)
                          </span>
                        ) : share?.accessRole === 'commenter' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-[11px]">
                            <MessageSquare className="w-3 h-3" />
                            Komentator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]">
                            <Eye className="w-3 h-3" />
                            Viewer (Hanya Baca)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px]">
                            <Clock className="w-3 h-3" />
                            Kedaluwarsa ({formatDateTime(share.expiresAt!)})
                          </span>
                        ) : share?.expiresAt ? (
                          <span className="inline-flex items-center gap-1 text-slate-300 text-[11px]">
                            <Clock className="w-3 h-3 text-purple-400" />
                            Sampai {formatDateTime(share.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Selamanya (Tanpa Batas)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {share?.isPasswordProtected ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
                            <Lock className="w-3 h-3" />
                            Dilindungi Sandi
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Terbuka</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        <span className="font-mono">{share?.accessCount || 0}</span> kali dibuka
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(file)}
                            title="Salin Tautan Berbagi"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setShareModalFile(file)}
                            title="Ubah Pengaturan Izin & Kedaluwarsa"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {share?.status === 'active' && !isExpired && (
                            <button
                              type="button"
                              onClick={() => revokeShare(file.id)}
                              title="Cabut Akses Berbagi Sekarang"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
