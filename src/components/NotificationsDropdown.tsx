import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  FileText,
  Shield,
  RefreshCw,
  Share2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';
import { formatRelativeTime } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useDrive();

  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getIcon = (type: string, severity: string) => {
    if (type === 'security') return <Shield className="w-4 h-4 text-teal-400" />;
    if (type === 'sync') return <RefreshCw className="w-4 h-4 text-blue-400" />;
    if (type === 'share') return <Share2 className="w-4 h-4 text-purple-400" />;
    if (type === 'file_change') return <FileText className="w-4 h-4 text-amber-400" />;

    if (severity === 'success') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    if (severity === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-w-[92vw] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-blue-400" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white">Notifikasi Aktivitas Drive</h3>
          {unreadNotificationCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] font-semibold">
              {unreadNotificationCount} baru
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadNotificationCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              title="Tandai semua dibaca"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              title="Hapus riwayat notifikasi"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/30 border-b border-slate-800 overflow-x-auto text-[11px]">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'file_change', label: 'Perubahan File' },
          { id: 'sync', label: 'Sinkronisasi' },
          { id: 'security', label: 'Keamanan' },
          { id: 'share', label: 'Berbagi' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Tidak ada notifikasi aktivitas di kategori ini.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/50 transition cursor-pointer ${
                !notif.read ? 'bg-blue-950/20' : ''
              }`}
            >
              <div className="mt-0.5 p-2 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0">
                {getIcon(notif.type, notif.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-slate-100 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
                  {notif.message}
                </p>
                {notif.accountEmail && (
                  <span className="inline-block text-[10px] text-blue-400/90 font-mono mt-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                    {notif.accountEmail}
                  </span>
                )}
              </div>
              {!notif.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/70 text-center">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
        >
          Tutup Panel
        </button>
      </div>
    </div>
  );
};
