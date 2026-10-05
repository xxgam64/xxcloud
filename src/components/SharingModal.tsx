import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Calendar,
  Lock,
  Eye,
  Edit3,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';
import { formatDateTime } from '../utils/format';

export const SharingModal: React.FC = () => {
  const { shareModalFile, setShareModalFile, saveShareSettings, revokeShare } = useDrive();

  const file = shareModalFile;
  const existing = file?.shareSettings;

  const [role, setRole] = useState<'viewer' | 'commenter' | 'editor'>(
    existing?.accessRole || 'viewer'
  );
  const [expiryOption, setExpiryOption] = useState<string>(
    existing?.expiresAt ? 'custom' : '7days'
  );
  const [customExpiry, setCustomExpiry] = useState<string>(
    existing?.expiresAt
      ? new Date(existing.expiresAt).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)
  );
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(
    existing?.isPasswordProtected || false
  );
  const [password, setPassword] = useState<string>('');
  const [allowDownload, setAllowDownload] = useState<boolean>(
    existing?.allowDownload ?? true
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!file) return null;

  const handleCopyLink = () => {
    const url = existing?.shareUrl || `https://xxcloud.internal/share/sh-${file.id.substring(0, 8)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    let expiresAt: string | null = null;
    const now = Date.now();
    if (expiryOption === '24hours') {
      expiresAt = new Date(now + 86400000).toISOString();
    } else if (expiryOption === '7days') {
      expiresAt = new Date(now + 7 * 86400000).toISOString();
    } else if (expiryOption === '30days') {
      expiresAt = new Date(now + 30 * 86400000).toISOString();
    } else if (expiryOption === 'custom' && customExpiry) {
      expiresAt = new Date(customExpiry).toISOString();
    } else if (expiryOption === 'never') {
      expiresAt = null;
    }

    saveShareSettings(file.id, {
      accessRole: role,
      expiresAt,
      isPasswordProtected,
      passwordHash: password ? btoa(password) : undefined,
      allowDownload,
    });
    setShareModalFile(null);
  };

  const isExpired =
    existing?.expiresAt && new Date(existing.expiresAt).getTime() < Date.now();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Kontrol Berbagi Dokumen</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{file.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShareModalFile(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* File & Source Account Tag */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Akun Sumber:</span>
              <span className="font-medium text-blue-400">{file.accountName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {file.isEncrypted && (
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
                  E2EE Protected
                </span>
              )}
              {existing?.status === 'active' && !isExpired && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                  Tautan Aktif
                </span>
              )}
              {isExpired && (
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[11px] font-semibold border border-red-500/30">
                  Kedaluwarsa
                </span>
              )}
            </div>
          </div>

          {/* Role / Access Rights */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hak Akses Penerima (Permissions)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('viewer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  role === 'viewer'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-900/20'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Eye className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Viewer (Baca)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Hanya melihat</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('commenter')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  role === 'commenter'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-900/20'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-400 hover:border-slate-600'
                }`}
              >
                <MessageSquare className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Komentator</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Catatan & saran</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('editor')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  role === 'editor'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-900/20'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Edit3 className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Editor (Tulis)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Ubah & sunting</span>
              </button>
            </div>
          </div>

          {/* Expiration Date Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Tanggal Kedaluwarsa Tautan (Expiry)
              </label>
              {existing?.expiresAt && (
                <span className="text-[11px] text-slate-400">
                  Saat ini: {formatDateTime(existing.expiresAt)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: '24hours', label: '24 Jam' },
                { id: '7days', label: '7 Hari' },
                { id: '30days', label: '30 Hari' },
                { id: 'custom', label: 'Kustom' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExpiryOption(opt.id)}
                  className={`py-2 px-3 rounded-lg border font-medium transition ${
                    expiryOption === opt.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {expiryOption === 'custom' && (
              <div className="pt-2">
                <input
                  type="datetime-local"
                  value={customExpiry}
                  onChange={e => setCustomExpiry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}
          </div>

          {/* Password Protection */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={e => setIsPasswordProtected(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4 cursor-pointer"
                />
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Proteksi Kata Sandi Tambahan
              </label>
              <span className="text-[11px] text-slate-500">Opsional</span>
            </div>

            {isPasswordProtected && (
              <div>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi pembuka tautan..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Penerima harus memasukkan kata sandi ini sebelum dokumen terbuka.
                </p>
              </div>
            )}
          </div>

          {/* Allow Download */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-300">Izinkan Unduhan Berkas Asli</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={e => setAllowDownload(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Share Link Preview & Copy */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tautan Berbagi Aman
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  existing?.shareUrl ||
                  `https://xxcloud.internal/share/sh-${file.id.substring(0, 8)}`
                }
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            {existing && (
              <p className="text-[11px] text-slate-400">
                Telah diakses sebanyak <span className="text-white font-medium">{existing.accessCount} kali</span>.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          <div>
            {existing?.status === 'active' && (
              <button
                type="button"
                onClick={() => {
                  revokeShare(file.id);
                  setShareModalFile(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cabut Tautan
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShareModalFile(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-900/30 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              Simpan & Terapkan Izin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
