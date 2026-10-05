import React from 'react';
import {
  Search,
  Filter,
  Shield,
  Share2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Layers,
  ArrowRightLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { FileCategory } from '../../types/drive';
import { formatBytes, formatRelativeTime } from '../../utils/format';

interface Props {
  onOpenVaultModal: () => void;
}

export const SearchView: React.FC<Props> = ({ onOpenVaultModal }) => {
  const {
    filteredFiles,
    searchQuery,
    setSearchQuery,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    selectedCategory,
    setSelectedCategory,
    filterEncryptedOnly,
    setFilterEncryptedOnly,
    dateFilter,
    setDateFilter,
    setShareModalFile,
    deleteFile,
  } = useDrive();

  const categories: { id: FileCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'document', label: 'Dokumen' },
    { id: 'spreadsheet', label: 'Spreadsheet' },
    { id: 'presentation', label: 'Slide' },
    { id: 'pdf', label: 'PDF' },
    { id: 'encrypted', label: '🔒 E2EE Brankas' },
    { id: 'archive', label: 'Arsip & Dataset' },
    { id: 'image', label: 'Foto/Gambar' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Pencarian Berkas Lintas Akun Terintegrasi</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
            {filteredFiles.length} hasil ditemukan
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Temukan file secara instan di seluruh drive kantor, pribadi, maupun akademik dalam satu kueri
        </p>
      </div>

      {/* Main Big Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
        <input
          type="text"
          placeholder="Ketik kata kunci nama file, tag, atau direktori (misal: 'Keuangan', 'Laporan', 'omnienc')..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-lg transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Advanced Filter Box */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Filter Lintas Cloud</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Filter 1: Target Account */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium">Akun Google Drive:</label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Akun ({accounts.length})</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium">Format / Tipe Berkas:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium">Waktu Perubahan Terakhir:</label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Kapan Saja</option>
              <option value="today">24 Jam Terakhir</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
            </select>
          </div>

          {/* Filter 4: Encrypted Only Toggle */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setFilterEncryptedOnly(!filterEncryptedOnly)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                filterEncryptedOnly
                  ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{filterEncryptedOnly ? 'Hanya File Terenkripsi' : 'Semua Enkripsi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-2">
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">Tidak ada file yang cocok</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Periksa ejaan kueri Anda atau pastikan akun Google Drive tujuan sudah terhubung.
            </p>
          </div>
        ) : (
          filteredFiles.map(file => (
            <div
              key={file.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    file.isEncrypted
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {file.isEncrypted ? <Shield className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-semibold text-white truncate">{file.name}</h4>
                    {file.isEncrypted && (
                      <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                        E2EE
                      </span>
                    )}
                    {file.shared && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
                        Berbagi Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                    <span className="text-blue-400 font-medium">{file.accountName}</span>
                    <span>•</span>
                    <span className="font-mono">{file.accountEmail}</span>
                    <span>•</span>
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(file.modifiedTime)}</span>
                    {file.path && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">{file.path}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setShareModalFile(file)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteFile(file.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Hapus berkas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
