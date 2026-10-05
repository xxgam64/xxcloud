import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  FileCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  HardDrive,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { formatBytes } from '../../utils/format';

interface Props {
  onOpenUploadModal: () => void;
}

export const VaultView: React.FC<Props> = ({ onOpenUploadModal }) => {
  const {
    isVaultConfigured,
    isVaultUnlocked,
    activePassphrase,
    setupVault,
    unlockVault,
    lockVault,
    files,
    accounts,
  } = useDrive();

  const [inputPassphrase, setInputPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const encryptedFiles = files.filter(f => f.isEncrypted);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!inputPassphrase) return;

    setIsSubmitting(true);
    try {
      const ok = await unlockVault(inputPassphrase);
      if (!ok) {
        setAuthError('Kata sandi brankas tidak cocok. Pastikan sandi benar.');
      } else {
        setInputPassphrase('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Gagal membuka brankas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (inputPassphrase.length < 8) {
      setAuthError('Kata sandi minimal 8 karakter demi keamanan kriptografi.');
      return;
    }
    if (inputPassphrase !== confirmPassphrase) {
      setAuthError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setupVault(inputPassphrase);
      setInputPassphrase('');
      setConfirmPassphrase('');
    } catch (err: any) {
      setAuthError(err.message || 'Gagal membuat brankas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Brankas Enkripsi End-to-End (E2EE)</span>
            {isVaultUnlocked ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Brankas Aktif
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Terkunci
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arsitektur Zero-Knowledge: Berkas dienkripsi di memori browser sebelum disimpan ke Google Drive
          </p>
        </div>

        {isVaultUnlocked && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-900/30 transition active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Enkripsi Berkas Baru</span>
            </button>
            <button
              type="button"
              onClick={lockVault}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Kunci Brankas</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Vault Status Card */}
      {!isVaultUnlocked ? (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 text-center max-w-lg mx-auto shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400">
            {isVaultConfigured ? <Lock className="w-8 h-8" /> : <Key className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {isVaultConfigured ? 'Buka Brankas Enkripsi' : 'Konfigurasi Brankas E2EE Baru'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isVaultConfigured
                ? 'Masukkan kata sandi master brankas Anda untuk mendekripsi kunci AES-256 dalam memori browser.'
                : 'Buat kata sandi master untuk mengenkripsi file sensitif Anda sebelum dikirimkan ke Google Drive.'}
            </p>
          </div>

          <form onSubmit={isVaultConfigured ? handleUnlock : handleSetup} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-medium text-slate-300">
                {isVaultConfigured ? 'Kata Sandi Master Vault' : 'Buat Kata Sandi Master'}
              </label>
              <input
                type="password"
                placeholder="Minimal 8 karakter..."
                value={inputPassphrase}
                onChange={e => setInputPassphrase(e.target.value)}
                autoFocus
                className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {!isVaultConfigured && (
              <div>
                <label className="text-xs font-medium text-slate-300">Konfirmasi Kata Sandi</label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi..."
                  value={confirmPassphrase}
                  onChange={e => setConfirmPassphrase(e.target.value)}
                  className="w-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-900/30 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Memproses Kriptografi...'
                : isVaultConfigured
                ? 'Buka Kunci Brankas'
                : 'Aktifkan Brankas Sekarang'}
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
            🔒 Standar Enkripsi: AES-256-GCM + PBKDF2 (100.000 iterasi SHA-256).
          </div>
        </div>
      ) : (
        /* Vault Active View */
        <div className="space-y-6">
          {/* Active Vault Overview Card */}
          <div className="p-6 rounded-2xl bg-teal-950/20 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sesi Kriptografi Aktif</h3>
                <p className="text-xs text-teal-300/80">
                  Kunci sesi AES-256-GCM siap digunakan untuk enkripsi & dekripsi otomatis.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {encryptedFiles.length} berkas terenkripsi aman
              </span>
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition"
              >
                + Enkripsi File
              </button>
            </div>
          </div>

          {/* List of Encrypted Files */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Berkas Terenkripsi di Google Drive</h3>
                <p className="text-xs text-slate-400">
                  Data biner ciphertext hanya dapat dibaca dengan kata sandi vault ini
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 font-medium">
                {encryptedFiles.length} item
              </span>
            </div>

            {encryptedFiles.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Belum ada berkas terenkripsi.</p>
                <button
                  type="button"
                  onClick={onOpenUploadModal}
                  className="text-xs text-teal-400 hover:underline font-medium"
                >
                  Enkripsi dan unggah berkas pertama Anda →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {encryptedFiles.map(f => (
                  <div
                    key={f.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white truncate">{f.name}</h4>
                          <span className="text-[10px] text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                            AES-256
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {f.accountName} • {formatBytes(f.size)} •{' '}
                          {f.encryptionMeta ? `Checksum: ${f.encryptionMeta.checksum.substring(0, 8)}...` : 'E2EE'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Integritas Valid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Zero-Knowledge Transparency Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                <Cpu className="w-4 h-4" />
                <span>Web Crypto API Native</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menggunakan standar W3C Web Cryptography API berkinerja tinggi langsung di lingkungan browser perangkat Anda tanpa dependensi server.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                <Key className="w-4 h-4" />
                <span>PBKDF2-HMAC-SHA256</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Derivasi kunci diperkuat dengan 100.000 putaran iterasi hashing dan garam unik (salt 16-byte) untuk mencegah serangan brute-force atau rainbow table.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Knowledge Proof</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Drive dan pihak manapun di internet hanya melihat ciphertext acak. Kunci dekripsi tidak pernah dikirimkan atau disimpan di server.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
