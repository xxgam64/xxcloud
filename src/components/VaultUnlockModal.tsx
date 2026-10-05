import React, { useState } from 'react';
import { Shield, Lock, Key, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDrive } from '../context/DriveContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultUnlockModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    isVaultConfigured,
    isVaultUnlocked,
    setupVault,
    unlockVault,
    lockVault,
  } = useDrive();

  const [passphrase, setPassphrase] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isVaultConfigured) {
      if (passphrase.length < 8) {
        setError('Kata sandi harus minimal 8 karakter.');
        return;
      }
      if (passphrase !== confirmPass) {
        setError('Konfirmasi kata sandi tidak cocok.');
        return;
      }

      setIsSubmitting(true);
      try {
        await setupVault(passphrase);
        setPassphrase('');
        setConfirmPass('');
        onClose();
      } catch (err: any) {
        setError(err.message || 'Gagal menyiapkan brankas.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const ok = await unlockVault(passphrase);
        if (!ok) {
          setError('Kata sandi master salah.');
        } else {
          setPassphrase('');
          onClose();
        }
      } catch (err: any) {
        setError(err.message || 'Gagal membuka brankas.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isVaultUnlocked
                  ? 'Status Brankas E2EE'
                  : isVaultConfigured
                  ? 'Buka Brankas Enkripsi'
                  : 'Siapkan Brankas E2EE Baru'}
              </h3>
              <p className="text-xs text-slate-400">Zero-Knowledge AES-256-GCM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isVaultUnlocked ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300">
              Brankas enkripsi saat ini <strong>terbuka</strong> dan aktif dalam memori browser. Anda dapat
              mengenkripsi berkas baru atau mendekripsi berkas vault kapan saja.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  lockVault();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition"
              >
                Kunci Brankas Sekarang
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              {isVaultConfigured
                ? 'Ketik kata sandi master brankas Anda untuk mendekripsi kunci kriptografi sesi ini:'
                : 'Buat kata sandi master untuk mengenkripsi berkas pribadi Anda dengan keamanan tingkat militer:'}
            </p>

            <div>
              <label className="font-semibold text-slate-300">Kata Sandi Master:</label>
              <input
                type="password"
                placeholder="Masukkan kata sandi..."
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                autoFocus
                required
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {!isVaultConfigured && (
              <div>
                <label className="font-semibold text-slate-300">Konfirmasi Kata Sandi:</label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi..."
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  required
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md transition disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Verifikasi...'
                  : isVaultConfigured
                  ? 'Buka Brankas'
                  : 'Aktifkan Brankas'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
