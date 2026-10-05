import React from 'react';
import { X, Plus, Shield, CheckCircle2, HardDrive, RefreshCw, Crown, Instagram } from 'lucide-react';
import { useDrive } from '../context/DriveContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPremiumModal?: () => void;
}

export const ConnectAccountModal: React.FC<Props> = ({ isOpen, onClose, onOpenPremiumModal }) => {
  const {
    connectNewGoogleAccount,
    addDemoAccount,
    accounts,
    isConnectingAccount,
    isPremium,
    freeAccountLimit,
    setIsPremiumModalOpen,
  } = useDrive();

  if (!isOpen) return null;

  const isLimitReached = !isPremium && accounts.length >= freeAccountLimit;

  const handleOpenPremium = () => {
    onClose();
    if (onOpenPremiumModal) {
      onOpenPremiumModal();
    } else {
      setIsPremiumModalOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Hubungkan Akun Google Drive</h3>
              <p className="text-xs text-slate-400">Gabungkan beberapa akun ke dalam satu dasbor terpadu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Limit Notice if Reached */}
          {isLimitReached && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border border-amber-500/40 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Batas Paket Gratis ({accounts.length}/{freeAccountLimit} Akun)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Untuk menambah akun ke-4 dan seterusnya tanpa batas (Unlimited), aktifkan fitur <strong>XXCLOUD PRO</strong> gratis dengan follow Instagram kami!
              </p>
              <button
                type="button"
                onClick={handleOpenPremium}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Follow Instagram & Buka Unlimited</span>
              </button>
            </div>
          )}

          {/* Main Google OAuth Button */}
          <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-2xl text-center space-y-3">
            <p className="text-xs text-slate-300">
              Gunakan pemilih akun Google untuk memberikan izin akses file Drive pada akun tambahan Anda.
            </p>
            <button
              type="button"
              disabled={isConnectingAccount}
              onClick={async () => {
                if (isLimitReached) {
                  handleOpenPremium();
                  return;
                }
                await connectNewGoogleAccount();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg shadow-blue-900/20 transition active:scale-95 disabled:opacity-50"
            >
              {isConnectingAccount ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Pilih & Hubungkan Akun Google</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Otorisasi aman melalui Google OAuth 2.0 API</span>
            </div>
          </div>

          {/* Quick Preset Accounts (Useful for multi-cloud preview) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Preset Akun Simulasi Cepat
              </span>
              <span className="text-[11px] text-slate-500">Uji coba multi-cloud instan</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'work',
                  name: 'Google Drive Bisnis / Kantor',
                  email: 'alex.corporate@company.com',
                  desc: '30 GB Kapasitas • Dokumen Keuangan & Strategi',
                  color: 'border-blue-500/30 hover:border-blue-500/60',
                },
                {
                  id: 'personal',
                  name: 'Google Drive Pribadi & Vault',
                  email: 'alex.pratama.dev@gmail.com',
                  desc: '15 GB Kapasitas • Brankas Terenkripsi E2EE',
                  color: 'border-emerald-500/30 hover:border-emerald-500/60',
                },
                {
                  id: 'research',
                  name: 'Drive Lab Riset & Akademik',
                  email: 'research.lab@university.ac.id',
                  desc: '100 GB Kapasitas • Dataset Besar & Publikasi',
                  color: 'border-purple-500/30 hover:border-purple-500/60',
                },
              ].map(preset => {
                const isAlreadyAdded = accounts.some(a => a.email === preset.email);
                return (
                  <div
                    key={preset.id}
                    className={`flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border ${preset.color} transition`}
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{preset.name}</h4>
                      <p className="text-[11px] text-blue-400 font-mono">{preset.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</p>
                    </div>

                    {isAlreadyAdded ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terhubung
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isLimitReached) {
                            handleOpenPremium();
                            return;
                          }
                          addDemoAccount(preset.id as any);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-white px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Hubungkan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
