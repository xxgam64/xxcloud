import React from 'react';
import {
  LayoutDashboard,
  FolderSync,
  Search,
  Shield,
  RefreshCw,
  Share2,
  PieChart,
  HardDrive,
  Plus,
  Lock,
  Crown,
  Instagram,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';
import { formatBytes } from '../utils/format';

interface Props {
  onOpenConnectModal: () => void;
  onOpenVaultModal: () => void;
  onOpenPremiumModal?: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenConnectModal, onOpenVaultModal, onOpenPremiumModal }) => {
  const {
    activeView,
    setActiveView,
    accounts,
    analytics,
    isVaultUnlocked,
    isVaultConfigured,
    files,
    isPremium,
    freeAccountLimit,
    setIsPremiumModalOpen,
  } = useDrive();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Ikhtisar Dasbor',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'files',
      label: 'Berkas Lintas Akun',
      icon: FolderSync,
      badge: files.length,
    },
    {
      id: 'search',
      label: 'Pencarian Terpadu',
      icon: Search,
      badge: null,
    },
    {
      id: 'vault',
      label: 'Brankas Enkripsi E2EE',
      icon: Shield,
      badge: isVaultUnlocked ? 'Aktif' : 'Terkunci',
      badgeColor: isVaultUnlocked ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'sync',
      label: 'Sinkronisasi Real-Time',
      icon: RefreshCw,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'sharing',
      label: 'Berbagi Dokumen',
      icon: Share2,
      badge: files.filter(f => f.shared).length || null,
    },
    {
      id: 'analytics',
      label: 'Analitik Penyimpanan',
      icon: PieChart,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 select-none">
      {/* Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Navigasi Utama
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Connected Google Accounts List */}
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Akun Google Terhubung</span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            {isPremium ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {accounts.length}/∞ PRO
              </span>
            ) : (
              <span>({accounts.length}/{freeAccountLimit} Free)</span>
            )}
          </span>
        </div>

        <div className="space-y-1.5">
          {accounts.map(acc => {
            const usedPct = acc.quota.total > 0 ? Math.round((acc.quota.used / acc.quota.total) * 100) : 0;
            return (
              <div
                key={acc.id}
                className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {acc.name.split(' ')[0]}
                    </span>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: acc.color || '#3B82F6' }}
                    title={`Akun: ${acc.email}`}
                  ></span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usedPct > 85 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${usedPct}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{formatBytes(acc.quota.used, 0)}</span>
                    <span>{usedPct}% dari {formatBytes(acc.quota.total, 0)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              if (!isPremium && accounts.length >= freeAccountLimit) {
                if (onOpenPremiumModal) onOpenPremiumModal();
                else setIsPremiumModalOpen(true);
              } else {
                onOpenConnectModal();
              }
            }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun Drive</span>
          </button>
        </div>

        {/* PRO Upgrade Card in Sidebar */}
        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-purple-600/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Crown className="w-3.5 h-3.5" />
            <span>{isPremium ? 'XXCLOUD PRO Aktif' : 'Buka Unlimited Akun'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {isPremium
              ? 'Status akun Unlimited telah aktif tanpa batas penambahan Google Drive.'
              : 'Dapatkan kapasitas akun Google Drive tanpa batas hanya dengan follow Instagram!'}
          </p>
          {!isPremium && (
            <button
              type="button"
              onClick={() => (onOpenPremiumModal ? onOpenPremiumModal() : setIsPremiumModalOpen(true))}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[11px] font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Instagram className="w-3 h-3" />
              <span>Follow & Buka PRO</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Gauge Bottom Widget */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            Total Gabungan
          </span>
          <span className="text-blue-400 font-semibold">{analytics.usagePercentage}%</span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              analytics.usagePercentage > 85
                ? 'bg-red-500'
                : analytics.usagePercentage > 70
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${analytics.usagePercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatBytes(analytics.totalUsed)} terpakai</span>
          <span>{formatBytes(analytics.totalCapacity)} total</span>
        </div>

        {/* E2EE Quick Unlock Button if locked */}
        {!isVaultUnlocked && (
          <button
            type="button"
            onClick={onOpenVaultModal}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[11px] font-medium transition"
          >
            <Lock className="w-3 h-3 text-teal-400" />
            {isVaultConfigured ? 'Buka Brankas Enkripsi' : 'Aktifkan Brankas E2EE'}
          </button>
        )}
      </div>
    </aside>
  );
};
