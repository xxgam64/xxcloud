import React, { useState } from 'react';
import {
  Crown,
  Instagram,
  CheckCircle2,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDrive,
  Users,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isPremium, unlockPremium, accounts, freeAccountLimit } = useDrive();
  const [handle, setHandle] = useState('');
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const targetInstagramHandle = 'xxgam64';
  const instagramUrl = `https://instagram.com/${targetInstagramHandle}`;

  const handleOpenInstagram = () => {
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
    setHasClickedFollow(true);
  };

  const handleConfirmFollow = () => {
    setIsVerifying(true);
    setTimeout(() => {
      unlockPremium(handle || targetInstagramHandle);
      setIsVerifying(false);
      setSuccessMessage(true);
      setTimeout(() => {
        onClose();
        setSuccessMessage(false);
      }, 1800);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col relative">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-pink-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  XXCLOUD PRO
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Unlimited
                </span>
              </div>
              <p className="text-xs text-slate-400">Buka kuota akun Google Drive tanpa batas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {successMessage ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-bold text-white">Selamat! XXCLOUD PRO Aktif 🎉</h4>
              <p className="text-xs text-slate-300">
                Akun Google Drive Anda sekarang tidak terbatas (Unlimited). Silakan hubungkan akun sebanyak yang Anda inginkan!
              </p>
            </div>
          ) : (
            <>
              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Kapasitas Akun Saat Ini:</span>
                  <span className="font-bold text-slate-200">
                    {accounts.length} / {isPremium ? '∞ (Unlimited)' : `${freeAccountLimit} Akun (Free)`}
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPremium
                        ? 'bg-gradient-to-r from-amber-400 to-purple-500 w-full'
                        : accounts.length >= freeAccountLimit
                        ? 'bg-amber-500 w-full'
                        : 'bg-blue-500'
                    }`}
                    style={!isPremium ? { width: `${(accounts.length / freeAccountLimit) * 100}%` } : {}}
                  ></div>
                </div>

                {!isPremium && accounts.length >= freeAccountLimit && (
                  <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    ⚠️ Anda telah mencapai batas maksimal 3 akun di paket gratis. Buka fitur Unlimited gratis sekarang dengan mengikuti Instagram kami!
                  </p>
                )}
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Unlimited Drive</strong>
                    <span className="text-[11px] text-slate-400">Hubungkan 10, 20, atau lebih akun Google</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Sinkron Kilat</strong>
                    <span className="text-[11px] text-slate-400">Prioritas bandwidth sinkronisasi real-time</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">E2EE Multi-Vault</strong>
                    <span className="text-[11px] text-slate-400">Proteksi Zero-Knowledge AES-256 tanpa batas</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Badge PRO Eksklusif</strong>
                    <span className="text-[11px] text-slate-400">Status akun premium permanen</span>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Unlock Flow */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/20 via-purple-950/20 to-slate-900 border border-pink-500/30 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Langkah Aktivasi Gratis via Instagram
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Follow akun Instagram pengembang untuk mengaktifkan fitur PRO:
                    </p>
                  </div>
                </div>

                {/* Step 1: Follow Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenInstagram}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-pink-900/30 transition active:scale-95"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Follow @{targetInstagramHandle} di Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 2: Verification */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <label className="text-[11px] text-slate-300 font-medium block">
                    Nama Akun Instagram Anda (Opsional):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">@</span>
                      <input
                        type="text"
                        placeholder="username_kamu"
                        value={handle}
                        onChange={e => setHandle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={handleConfirmFollow}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 whitespace-nowrap disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <span>Memverifikasi...</span>
                      ) : (
                        <span>Aktifkan PRO</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {hasClickedFollow
                      ? '✓ Anda telah membuka tautan Instagram. Klik tombol "Aktifkan PRO" untuk menerapkan paket Unlimited.'
                      : 'Tip: Klik tombol Follow di atas terlebih dahulu, kemudian klik "Aktifkan PRO".'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">XXCLOUD Enterprise Security Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
