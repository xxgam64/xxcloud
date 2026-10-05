import React, { useState, useRef, useEffect } from 'react';
import {
  HardDrive,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bell,
  RefreshCw,
  Plus,
  ChevronDown,
  LogOut,
  Layers,
  Search,
  Check,
  Crown,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ConnectAccountModal } from './ConnectAccountModal';
import { formatRelativeTime } from '../utils/format';

interface Props {
  onOpenVaultModal?: () => void;
  onOpenPremiumModal?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenVaultModal, onOpenPremiumModal }) => {
  const {
    user,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    isVaultConfigured,
    isVaultUnlocked,
    lockVault,
    isSyncing,
    lastGlobalSyncTime,
    triggerManualSync,
    unreadNotificationCount,
    loginPrimaryGoogle,
    logoutAll,
    searchQuery,
    setSearchQuery,
    setActiveView,
    isPremium,
    setIsPremiumModalOpen,
    isGuestMode,
  } = useDrive();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  XXCLOUD
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold tracking-wide">
                  E2EE HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Dasbor Multi Google Drive</p>
            </div>
          </div>

          {/* Quick Cross-Drive Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari file di semua akun Google Drive..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setActiveView('search');
                  }
                }}
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Sync Status Pill */}
            <button
              type="button"
              onClick={() => triggerManualSync()}
              disabled={isSyncing}
              title={`Sinkronisasi Real-Time: ${isSyncing ? 'Sedang sinkron...' : 'Klik untuk sinkronkan sekarang'}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 transition active:scale-95 disabled:opacity-70"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSyncing ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSyncing ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                ></span>
              </span>
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline text-[11px]">
                {isSyncing ? 'Menyinkronkan...' : `Sinkron: ${formatRelativeTime(lastGlobalSyncTime)}`}
              </span>
            </button>

            {/* XXCLOUD PRO / Unlimited Tier Badge or Trigger */}
            {isPremium ? (
              <button
                type="button"
                onClick={() => (onOpenPremiumModal ? onOpenPremiumModal() : setIsPremiumModalOpen(true))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm"
                title="Status XXCLOUD PRO: Kuota Unlimited Aktif"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">PRO UNLIMITED</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (onOpenPremiumModal ? onOpenPremiumModal() : setIsPremiumModalOpen(true))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-amber-500/30 hover:from-purple-600/50 hover:to-amber-500/50 border border-pink-500/40 text-pink-300 text-xs font-bold transition active:scale-95 shadow-sm"
                title="Follow Instagram untuk membuka akun Unlimited"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Buka Unlimited</span>
              </button>
            )}

            {/* E2EE Vault Status Indicator */}
            <button
              type="button"
              onClick={() => {
                if (isVaultUnlocked) {
                  lockVault();
                } else if (onOpenVaultModal) {
                  onOpenVaultModal();
                } else {
                  setActiveView('vault');
                }
              }}
              title={
                !isVaultConfigured
                  ? 'Konfigurasi Brankas Enkripsi E2EE'
                  : isVaultUnlocked
                  ? 'Brankas Terbuka (AES-256). Klik untuk mengunci.'
                  : 'Brankas Terkunci. Klik untuk membuka.'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition active:scale-95 ${
                !isVaultConfigured
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : isVaultUnlocked
                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {isVaultUnlocked ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline text-[11px]">Vault Aktif</span>
                </>
              ) : isVaultConfigured ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline text-[11px]">Vault Terkunci</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Atur E2EE</span>
                </>
              )}
            </button>

            {/* Multi-Account Selector Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition"
              >
                {selectedAccountId === 'all' ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Layers className="w-3 h-3" />
                    </div>
                    <span className="hidden sm:inline font-semibold">Semua Drive</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-700 text-[10px] text-slate-300">
                      {accounts.length}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 max-w-[130px] truncate">
                    <img
                      src={activeAccount?.avatar}
                      alt={activeAccount?.name}
                      className="w-5 h-5 rounded-full object-cover border border-blue-400/40"
                    />
                    <span className="truncate hidden sm:inline">{activeAccount?.name.split(' ')[0]}</span>
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-slate-100 animate-fadeIn">
                  <div className="p-2 border-b border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Pilih Filter Akun
                    </span>
                  </div>

                  <div className="py-1 space-y-1">
                    {/* View All */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAccountId('all');
                        setIsAccountMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                        selectedAccountId === 'all'
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>Semua Akun Terhubung ({accounts.length})</span>
                      </div>
                      {selectedAccountId === 'all' && <Check className="w-4 h-4" />}
                    </button>

                    {/* Individual Accounts */}
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccountId(acc.id);
                          setIsAccountMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                          selectedAccountId === acc.id
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="text-left truncate">
                            <p className="font-medium truncate">{acc.name}</p>
                            <p className="text-[10px] text-slate-400 truncate font-mono">{acc.email}</p>
                          </div>
                        </div>
                        {selectedAccountId === acc.id && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="p-1 border-t border-slate-800 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setIsConnectModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-500/20 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Hubungkan Akun Google Baru
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Notifikasi Aktivitas"
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
              {user ? (
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-blue-500/40"
                    title={`Login sebagai: ${user.email}`}
                  />
                  <button
                    type="button"
                    onClick={logoutAll}
                    title="Keluar dari akun utama"
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-slate-800/80 text-[10px] font-semibold text-slate-400 border border-slate-700/60">
                    Mode Demo
                  </span>
                  <button
                    type="button"
                    onClick={logoutAll}
                    title="Keluar ke Halaman Login"
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </>
  );
};
