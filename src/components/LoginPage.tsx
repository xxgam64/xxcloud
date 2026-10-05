import React, { useState } from 'react';
import {
  HardDrive,
  Shield,
  Sparkles,
  RefreshCw,
  Lock,
  FolderSync,
  Layers,
  Crown,
  Instagram,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';

interface Props {
  onOpenPremiumModal?: () => void;
}

export const LoginPage: React.FC<Props> = ({ onOpenPremiumModal }) => {
  const {
    loginPrimaryGoogle,
    loginAsGuest,
    loginWithCustomAccount,
    isConnectingAccount,
    isPremium,
    setIsPremiumModalOpen,
  } = useDrive();

  const [authError, setAuthError] = useState<string | null>(null);
  const [showCustomLogin, setShowCustomLogin] = useState<boolean>(false);
  const [customEmail, setCustomEmail] = useState<string>('xxgam64@gmail.com');
  const [customName, setCustomName] = useState<string>('Gam Menkeu');

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginPrimaryGoogle();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized domain') || msg.includes('auth/unauthorized-domain')) {
        setAuthError('Domain GitHub Pages (xxgam64.github.io) belum didaftarkan di Firebase Console Authorized Domains. Anda bisa langsung masuk menggunakan form di bawah tanpa hambatan!');
        setShowCustomLogin(true);
      } else if (code === 'auth/popup-blocked' || msg.includes('popup')) {
        setAuthError('Jendela popup Google diblokir browser. Harap izinkan popup di pengaturan URL browser, atau gunakan Masuk Langsung di bawah.');
      } else {
        setAuthError(msg || 'Gagal masuk dengan Google. Gunakan opsi Masuk Langsung di bawah.');
      }
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    loginWithCustomAccount(customEmail, customName);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Cyber Mesh Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  XXCLOUD
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold tracking-wide">
                  E2EE HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Pusat Multi Google Drive</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (onOpenPremiumModal ? onOpenPremiumModal() : setIsPremiumModalOpen(true))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPremium ? 'PRO Unlimited Aktif' : 'Buka Unlimited (Instagram)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Hero + Login Card */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 w-full">
        {/* Left Column: Value Proposition */}
        <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Anti-Duplikasi Akun & Kriptografi Zero-Knowledge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Satu Dasbor Aman untuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
              Semua Akun Google Drive
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Akses, sinkronkan antar akun, dan lindungi berkas Anda dengan enkripsi AES-256-GCM client-side. Sistem proteksi mencegah penambahan akun berulang secara otomatis.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-semibold text-white block">Multi-Akun Terpadu</strong>
                <span className="text-[11px] text-slate-400">Pribadi, kerja, dan kampus dalam 1 pohon berkas.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-semibold text-white block">Brankas E2EE Mandiri</strong>
                <span className="text-[11px] text-slate-400">File dienkripsi sebelum diunggah ke Drive.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <FolderSync className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-semibold text-white block">Anti Duplikasi Akun</strong>
                <span className="text-[11px] text-slate-400">Koneksi bersih tanpa penambahan berulang.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-semibold text-white block">Akses Unlimited</strong>
                <span className="text-[11px] text-slate-400">Hubungkan banyak akun via follow IG @xxgam64.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Login Card */}
        <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40 relative">
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 mx-auto shadow-lg shadow-blue-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-teal-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Masuk ke Dasbor XXCLOUD
              </h2>
              <p className="text-xs text-slate-400">
                Otorisasi akun Google Anda untuk membuka ruang penyimpanan
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <p className="leading-relaxed">{authError}</p>
                <button
                  type="button"
                  onClick={() => setShowCustomLogin(true)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Masuk Langsung dengan Akun Saya Sekarang →
                </button>
              </div>
            )}

            {showCustomLogin ? (
              <form onSubmit={handleCustomSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Masuk Langsung (Tanpa Hambatan Domain)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomLogin(false)}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Email Google Anda:</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Tampilan (Opsional):</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Gam Menkeu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
                >
                  Buka Dasbor XXCLOUD →
                </button>
              </form>
            ) : null}

            {/* Primary Login Option: Google OAuth */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isConnectingAccount}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl shadow-blue-900/20 transition active:scale-[0.98] disabled:opacity-50 group"
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
                    <span>Masuk dengan Akun Google</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition" />
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                  atau
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Direct Instant Access */}
              <button
                type="button"
                onClick={() => setShowCustomLogin(!showCustomLogin)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold text-xs transition"
              >
                <span>Masuk Langsung dengan Akun Anda (Bypass)</span>
              </button>

              {/* Secondary Option: Demo Simulation Mode */}
              <button
                type="button"
                onClick={loginAsGuest}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-semibold text-xs transition active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Eksplorasi Mode Demo (Multi-Drive)</span>
              </button>
            </div>

            {/* Privacy & Safety Note */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Keamanan & Privasi Terjamin:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10px]">
                <li>Otorisasi langsung via API resmi Google OAuth.</li>
                <li>Pemeriksaan otomatis mencegah akun yang sama ditambahkan berkali-kali.</li>
                <li>Kunci dekripsi tersimpan di memori peramban (client-side).</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>XXCLOUD • Enterprise Multi-Account Google Drive Platform</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onOpenPremiumModal ? onOpenPremiumModal() : setIsPremiumModalOpen(true))}
              className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <Instagram className="w-3 h-3" />
              Follow @xxgam64 untuk Akses Unlimited
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
