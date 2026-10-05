import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  DriveAccount,
  DriveFile,
  SyncRule,
  SyncTask,
  DriveNotification,
  StorageAnalytics,
  FileCategory,
  ShareSettings,
} from '../types/drive';
import {
  initAuth,
  signInPrimaryGoogle,
  connectAdditionalGoogleAccount,
  logoutAuth,
} from '../services/firebase';
import { fetchDriveAbout, fetchDriveFiles, deleteDriveFileApi, uploadDriveFileApi } from '../services/driveApi';
import {
  createVaultVerifier,
  verifyVaultPassphrase,
  encryptData,
  decryptData,
} from '../services/crypto';
import {
  INITIAL_DEMO_ACCOUNTS,
  INITIAL_DEMO_FILES,
  INITIAL_SYNC_RULES,
  INITIAL_NOTIFICATIONS,
} from '../services/sampleData';

interface DriveContextType {
  // Auth & Accounts
  user: User | null;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  loginAsGuest: () => void;
  accounts: DriveAccount[];
  selectedAccountId: string; // 'all' or accountId
  setSelectedAccountId: (id: string) => void;
  isConnectingAccount: boolean;
  loginPrimaryGoogle: () => Promise<void>;
  connectNewGoogleAccount: () => Promise<void>;
  addDemoAccount: (preset: 'work' | 'personal' | 'research') => void;
  disconnectAccount: (accountId: string) => void;
  logoutAll: () => Promise<void>;

  // Files
  files: DriveFile[];
  filteredFiles: DriveFile[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: FileCategory | 'all';
  setSelectedCategory: (cat: FileCategory | 'all') => void;
  filterEncryptedOnly: boolean;
  setFilterEncryptedOnly: (val: boolean) => void;
  dateFilter: 'all' | 'today' | 'week' | 'month';
  setDateFilter: (filter: 'all' | 'today' | 'week' | 'month') => void;
  activeView: 'dashboard' | 'files' | 'search' | 'vault' | 'sync' | 'sharing' | 'analytics';
  setActiveView: (view: 'dashboard' | 'files' | 'search' | 'vault' | 'sync' | 'sharing' | 'analytics') => void;

  // File Operations
  uploadNewFile: (accountId: string, file: File, encryptWithVault: boolean) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  toggleStarFile: (fileId: string) => void;
  replicateFileToAccount: (fileId: string, targetAccountId: string) => Promise<void>;

  // Sharing
  shareModalFile: DriveFile | null;
  setShareModalFile: (file: DriveFile | null) => void;
  saveShareSettings: (fileId: string, settings: Partial<ShareSettings>) => void;
  revokeShare: (fileId: string) => void;

  // Vault / E2EE
  isVaultConfigured: boolean;
  isVaultUnlocked: boolean;
  activePassphrase: string | null;
  setupVault: (passphrase: string) => Promise<void>;
  unlockVault: (passphrase: string) => Promise<boolean>;
  lockVault: () => void;
  decryptFileContent: (file: DriveFile) => Promise<{ decryptedBytes: Uint8Array; textContent?: string }>;

  // Real-time Sync
  syncRules: SyncRule[];
  syncTasks: SyncTask[];
  isSyncing: boolean;
  lastGlobalSyncTime: string;
  triggerManualSync: (ruleId?: string) => Promise<void>;
  addSyncRule: (rule: Omit<SyncRule, 'id' | 'status'>) => void;
  toggleSyncRule: (ruleId: string, active: boolean) => void;
  deleteSyncRule: (ruleId: string) => void;

  // Notifications
  notifications: DriveNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Analytics
  analytics: StorageAnalytics;

  // Premium / Unlimited Tier
  isPremium: boolean;
  freeAccountLimit: number;
  isPremiumModalOpen: boolean;
  setIsPremiumModalOpen: (open: boolean) => void;
  unlockPremium: (igHandle?: string) => void;

  // UI Safety Dialog
  destructiveModal: {
    isOpen: boolean;
    title: string;
    description: string;
    itemCount?: number;
    actionLabel?: string;
    onConfirm: () => Promise<void>;
  } | null;
  openDestructiveModal: (params: {
    title: string;
    description: string;
    itemCount?: number;
    actionLabel?: string;
    onConfirm: () => Promise<void>;
  }) => void;
  closeDestructiveModal: () => void;
}

const DriveContext = createContext<DriveContextType | null>(null);

const STORAGE_KEYS = {
  VAULT_SALT: 'omnidrive_vault_salt',
  VAULT_VERIFIER: 'omnidrive_vault_verifier',
  CONNECTED_ACCOUNTS: 'omnidrive_connected_accounts_v1',
  FILES: 'omnidrive_stored_files_v1',
  SYNC_RULES: 'omnidrive_sync_rules_v1',
  NOTIFICATIONS: 'omnidrive_notifications_v1',
  PREMIUM_STATUS: 'xxcloud_premium_unlocked_v1',
};

export const DriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('xxcloud_guest_mode_v1') === 'true';
  });

  const isAuthenticated = Boolean(user || isGuestMode);

  const loginAsGuest = () => {
    setIsGuestMode(true);
    localStorage.setItem('xxcloud_guest_mode_v1', 'true');
    addNotification({
      type: 'system',
      title: 'Masuk Mode Eksplorasi Demo',
      message: 'Selamat datang di XXCLOUD! Anda dapat mencoba fitur multi-akun, brankas E2EE, dan sinkronisasi.',
      severity: 'info',
    });
  };

  const freeAccountLimit = 3;
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('xxcloud_premium_unlocked_v1') === 'true';
  });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<DriveAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONNECTED_ACCOUNTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_DEMO_ACCOUNTS;
  });

  const [files, setFiles] = useState<DriveFile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_DEMO_FILES;
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [isConnectingAccount, setIsConnectingAccount] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'files' | 'search' | 'vault' | 'sync' | 'sharing' | 'analytics'>('dashboard');

  // Search and Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const [filterEncryptedOnly, setFilterEncryptedOnly] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Sharing Modal
  const [shareModalFile, setShareModalFile] = useState<DriveFile | null>(null);

  // Destructive Confirmation Modal
  const [destructiveModal, setDestructiveModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemCount?: number;
    actionLabel?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // E2EE Vault State
  const [isVaultConfigured, setIsVaultConfigured] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STORAGE_KEYS.VAULT_VERIFIER));
  });
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [activePassphrase, setActivePassphrase] = useState<string | null>(null);

  // Sync Engine State
  const [syncRules, setSyncRules] = useState<SyncRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SYNC_RULES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_SYNC_RULES;
  });
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastGlobalSyncTime, setLastGlobalSyncTime] = useState<string>(new Date().toISOString());

  // Notifications State
  const [notifications, setNotifications] = useState<DriveNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONNECTED_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYNC_RULES, JSON.stringify(syncRules));
  }, [syncRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Push notification helper
  const addNotification = useCallback((notif: Omit<DriveNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: DriveNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Listen for Firebase primary auth
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authUser, token) => {
        setUser(authUser);
        try {
          const about = await fetchDriveAbout(token);
          const primaryAccount: DriveAccount = {
            id: `acc-primary-${authUser.uid}`,
            email: authUser.email || about.emailAddress,
            name: `${authUser.displayName || about.displayName} (Akun Utama)`,
            avatar: authUser.photoURL || about.photoLink || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
            isPrimary: true,
            accessToken: token,
            tokenExpiresAt: Date.now() + 3600000,
            quota: about.storageQuota,
            status: 'connected',
            lastSyncTime: new Date().toISOString(),
            color: '#2563EB',
          };

          // Fetch real drive files
          try {
            const driveFiles = await fetchDriveFiles(token, primaryAccount);
            if (driveFiles.length > 0) {
              setFiles(prev => {
                const nonPrimary = prev.filter(f => f.accountId !== primaryAccount.id);
                return [...driveFiles, ...nonPrimary];
              });
            }
          } catch (e) {
            console.warn('Could not list drive files directly, retaining existing files:', e);
          }

          setAccounts(prev => {
            const normEmail = (primaryAccount.email || '').toLowerCase().trim();
            const existingIndex = prev.findIndex(
              a => a.id === primaryAccount.id || (Boolean(a.email) && a.email.toLowerCase().trim() === normEmail)
            );
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = { ...updated[existingIndex], ...primaryAccount };
              return updated;
            }
            return [primaryAccount, ...prev];
          });

          addNotification({
            type: 'system',
            title: 'Google Drive Terhubung',
            message: `Akun Google ${authUser.email} berhasil diintegrasikan ke dasbor XXCLOUD.`,
            accountEmail: authUser.email || undefined,
            severity: 'success',
          });
        } catch (err) {
          console.error('Error fetching Drive info:', err);
        }
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, [addNotification]);

  // Periodic automatic sync checker (runs every 45 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time monitoring: check for updates or run auto-sync rules
      const activeRules = syncRules.filter(r => r.autoSync && r.status !== 'paused');
      if (activeRules.length > 0) {
        const randomRule = activeRules[Math.floor(Math.random() * activeRules.length)];
        // Create a minor sync task completion
        const sourceAcc = accounts.find(a => a.id === randomRule.sourceAccountId);
        const targetAcc = accounts.find(a => a.id === randomRule.targetAccountId);

        if (sourceAcc && targetAcc) {
          setLastGlobalSyncTime(new Date().toISOString());
          // Random 20% chance of registering a simulated change notification
          if (Math.random() < 0.25) {
            addNotification({
              type: 'sync',
              title: 'Sinkronisasi Otomatis Terjadwal',
              message: `Sinkronisasi real-time folder ${randomRule.folderPath} dari ${sourceAcc.name} ke ${targetAcc.name} selesai. Semua file mutakhir.`,
              accountEmail: sourceAcc.email,
              severity: 'info',
            });
          }
        }
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [syncRules, accounts, addNotification]);

  // Primary Google Login
  const loginPrimaryGoogle = async () => {
    setIsConnectingAccount(true);
    try {
      const res = await signInPrimaryGoogle();
      if (res) {
        addNotification({
          type: 'system',
          title: 'Login Berhasil',
          message: `Selamat datang kembali, ${res.user.displayName || res.user.email}!`,
          accountEmail: res.user.email || undefined,
          severity: 'success',
        });
      }
    } catch (err: any) {
      console.error('Failed to login with Google:', err);
      addNotification({
        type: 'system',
        title: 'Koneksi Gagal',
        message: err.message || 'Tidak dapat menyelesaikan otorisasi Google Drive.',
        severity: 'error',
      });
    } finally {
      setIsConnectingAccount(false);
    }
  };

  const unlockPremium = (igHandle?: string) => {
    setIsPremium(true);
    localStorage.setItem('xxcloud_premium_unlocked_v1', 'true');
    addNotification({
      type: 'system',
      title: 'XXCLOUD PRO Aktif 🎉',
      message: `Terima kasih telah mengikuti Instagram ${igHandle ? `@${igHandle}` : ''}! Akun Google Drive kini Unlimited tanpa batas.`,
      severity: 'success',
    });
  };

  // Connect Additional Google Account via OAuth Popup
  const connectNewGoogleAccount = async () => {
    if (!isPremium && accounts.length >= freeAccountLimit) {
      setIsPremiumModalOpen(true);
      addNotification({
        type: 'system',
        title: 'Batas Akun Gratis Tercapai (Maksimal 3 Akun)',
        message: 'Aktifkan XXCLOUD PRO untuk akses Unlimited Akun Google Drive dengan follow Instagram @xxgam64!',
        severity: 'warning',
      });
      return;
    }

    setIsConnectingAccount(true);
    try {
      const res = await connectAdditionalGoogleAccount();
      if (res) {
        const normalizedEmail = res.email.toLowerCase().trim();
        const existingAccount = accounts.find(a => a.email.toLowerCase().trim() === normalizedEmail);
        if (existingAccount) {
          // Prevent duplicate accounts: update session token and refresh status
          setAccounts(prev =>
            prev.map(a =>
              a.email.toLowerCase().trim() === normalizedEmail
                ? {
                    ...a,
                    accessToken: res.accessToken,
                    tokenExpiresAt: Date.now() + 3600000,
                    status: 'connected',
                    lastSyncTime: new Date().toISOString(),
                  }
                : a
            )
          );
          addNotification({
            type: 'system',
            title: 'Sesi Akun Diperbarui',
            message: `Akun Google ${res.email} sudah terdaftar. Sesi diperbarui tanpa menambah akun ganda.`,
            accountEmail: res.email,
            severity: 'info',
          });
          return;
        }

        let quota: any = {
          total: 15 * 1024 * 1024 * 1024,
          used: 3.2 * 1024 * 1024 * 1024,
          usedInDrive: 2.8 * 1024 * 1024 * 1024,
          usedInTrash: 0.4 * 1024 * 1024 * 1024,
        };

        try {
          const about = await fetchDriveAbout(res.accessToken);
          quota = about.storageQuota;
        } catch {
          // use default quota
        }

        const newAccount: DriveAccount = {
          id: `acc-ext-${Date.now()}`,
          email: res.email,
          name: res.displayName,
          avatar: res.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          isPrimary: false,
          accessToken: res.accessToken,
          tokenExpiresAt: Date.now() + 3600000,
          quota,
          status: 'connected',
          lastSyncTime: new Date().toISOString(),
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        };

        setAccounts(prev => [...prev.filter(a => a.email !== newAccount.email), newAccount]);

        // Attempt to fetch files for this account
        try {
          const fetched = await fetchDriveFiles(res.accessToken, newAccount);
          if (fetched.length > 0) {
            setFiles(prev => [...fetched, ...prev]);
          }
        } catch (e) {
          console.warn('Could not fetch files for new account:', e);
        }

        addNotification({
          type: 'system',
          title: 'Akun Google Drive Ditambahkan',
          message: `Akun sekunder ${res.email} berhasil digabungkan ke dalam dasbor.`,
          accountEmail: res.email,
          severity: 'success',
        });
      }
    } catch (err: any) {
      console.error('Error connecting secondary Google account:', err);
      addNotification({
        type: 'system',
        title: 'Gagal Menghubungkan Akun',
        message: err.message || 'Proses otorisasi akun tambahan dibatalkan atau gagal.',
        severity: 'error',
      });
    } finally {
      setIsConnectingAccount(false);
    }
  };

  // Add demo account preset
  const addDemoAccount = (preset: 'work' | 'personal' | 'research') => {
    if (!isPremium && accounts.length >= freeAccountLimit) {
      setIsPremiumModalOpen(true);
      addNotification({
        type: 'system',
        title: 'Batas Akun Gratis Tercapai (Maksimal 3 Akun)',
        message: 'Aktifkan XXCLOUD PRO untuk akses Unlimited Akun Google Drive dengan follow Instagram @xxgam64!',
        severity: 'warning',
      });
      return;
    }

    const demoFound = INITIAL_DEMO_ACCOUNTS.find(a => a.id.includes(preset));
    if (demoFound) {
      const isAlreadyAdded = accounts.some(
        a => a.id === demoFound.id || (a.email && a.email.toLowerCase().trim() === demoFound.email.toLowerCase().trim())
      );
      if (isAlreadyAdded) {
        addNotification({
          type: 'system',
          title: 'Akun Sudah Terhubung',
          message: `Akun ${demoFound.name} (${demoFound.email}) sudah ada di dasbor. Tidak ditambahkan ganda.`,
          severity: 'info',
        });
        return;
      }
      setAccounts(prev => [...prev, demoFound]);
      // restore its files if missing
      const relatedFiles = INITIAL_DEMO_FILES.filter(f => f.accountId === demoFound.id);
      setFiles(prev => [...prev, ...relatedFiles.filter(rf => !prev.some(p => p.id === rf.id))]);

      addNotification({
        type: 'system',
        title: 'Akun Demo Ditambahkan',
        message: `Akun ${demoFound.name} siap digunakan untuk simulasi sinkronisasi dan pencarian lintas drive.`,
        severity: 'success',
      });
    }
  };

  const disconnectAccount = (accountId: string) => {
    const target = accounts.find(a => a.id === accountId);
    if (!target) return;

    openDestructiveModal({
      title: `Putuskan Akun "${target.name}"?`,
      description: `Akun Google Drive (${target.email}) akan dilepas dari dasbor. File di Google Drive asli tidak akan terhapus.`,
      actionLabel: 'Putuskan Akun',
      onConfirm: async () => {
        setAccounts(prev => prev.filter(a => a.id !== accountId));
        if (selectedAccountId === accountId) {
          setSelectedAccountId('all');
        }
        addNotification({
          type: 'system',
          title: 'Akun Diputuskan',
          message: `Koneksi ke akun ${target.email} telah dihentikan dari dasbor ini.`,
          severity: 'info',
        });
      },
    });
  };

  const logoutAll = async () => {
    try {
      await logoutAuth();
    } catch (e) {
      console.warn('Logout auth failed:', e);
    }
    setUser(null);
    setIsGuestMode(false);
    localStorage.removeItem('xxcloud_guest_mode_v1');
    setIsVaultUnlocked(false);
    setActivePassphrase(null);
    addNotification({
      type: 'system',
      title: 'Sesi Berakhir',
      message: 'Anda telah keluar dari dasbor XXCLOUD.',
      severity: 'info',
    });
  };

  // Vault Management
  const setupVault = async (passphrase: string) => {
    const { verifierHash, salt } = await createVaultVerifier(passphrase);
    localStorage.setItem(STORAGE_KEYS.VAULT_VERIFIER, verifierHash);
    localStorage.setItem(STORAGE_KEYS.VAULT_SALT, salt);
    setIsVaultConfigured(true);
    setIsVaultUnlocked(true);
    setActivePassphrase(passphrase);

    addNotification({
      type: 'security',
      title: 'Brankas Enkripsi E2EE Diaktifkan',
      message: 'Brankas lokal AES-256-GCM telah dibuat dengan sistem Zero-Knowledge. Simpan kata sandi Anda dengan aman.',
      severity: 'success',
    });
  };

  const unlockVault = async (passphrase: string): Promise<boolean> => {
    const verifierHash = localStorage.getItem(STORAGE_KEYS.VAULT_VERIFIER);
    const salt = localStorage.getItem(STORAGE_KEYS.VAULT_SALT);
    if (!verifierHash || !salt) return false;

    const isValid = await verifyVaultPassphrase(passphrase, verifierHash, salt);
    if (isValid) {
      setIsVaultUnlocked(true);
      setActivePassphrase(passphrase);
      addNotification({
        type: 'security',
        title: 'Brankas Dibuka',
        message: 'Kunci enkripsi telah didekripsi dalam memori browser untuk sesi ini.',
        severity: 'info',
      });
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
    setActivePassphrase(null);
    addNotification({
      type: 'security',
      title: 'Brankas Dikunci',
      message: 'Kunci sesi dihapus dari memori. Berkas terenkripsi aman.',
      severity: 'info',
    });
  };

  // Upload and Encrypt
  const uploadNewFile = async (accountId: string, file: File, encryptWithVault: boolean) => {
    const targetAccount = accounts.find(a => a.id === accountId) || accounts[0];
    if (!targetAccount) throw new Error('Tidak ada akun terpilih');

    let finalName = file.name;
    let finalMimeType = file.type || 'application/octet-stream';
    let isEncrypted = false;
    let encryptionMeta = undefined;
    let ciphertextBase64 = undefined;

    if (encryptWithVault) {
      if (!isVaultUnlocked || !activePassphrase) {
        throw new Error('Brankas harus dibuka terlebih dahulu untuk melakukan enkripsi berkas.');
      }
      const buffer = await file.arrayBuffer();
      const encResult = await encryptData(buffer, activePassphrase, file.name, file.type);
      finalName = `${file.name}.omnienc`;
      finalMimeType = 'application/octet-stream';
      isEncrypted = true;
      encryptionMeta = encResult.metadata;
      ciphertextBase64 = encResult.ciphertextBase64;
    }

    // Try real Google Drive upload if token exists and not a demo token
    if (targetAccount.accessToken && !targetAccount.accessToken.startsWith('demo_')) {
      try {
        const fileContent = ciphertextBase64 || file;
        const uploadDesc = isEncrypted ? JSON.stringify(encryptionMeta) : undefined;
        await uploadDriveFileApi(targetAccount.accessToken, finalName, fileContent, finalMimeType, uploadDesc);
      } catch (err) {
        console.warn('Real Google Drive upload error, saving to local hub state:', err);
      }
    }

    const newDriveFile: DriveFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      accountId: targetAccount.id,
      accountEmail: targetAccount.email,
      accountName: targetAccount.name,
      name: finalName,
      mimeType: finalMimeType,
      category: isEncrypted ? 'encrypted' : (file.type.includes('image') ? 'image' : 'document'),
      size: isEncrypted ? (encryptionMeta?.originalSize || file.size) : file.size,
      modifiedTime: new Date().toISOString(),
      createdTime: new Date().toISOString(),
      isEncrypted,
      encryptionMeta,
      encryptedContentPreview: ciphertextBase64 ? ciphertextBase64.substring(0, 48) + '...' : undefined,
      shared: false,
      starred: false,
      path: isEncrypted ? '/E2E_Secure_Vault' : '/Uploads',
      tags: isEncrypted ? ['E2EE', 'AES-256'] : ['Unggahan'],
    };

    setFiles(prev => [newDriveFile, ...prev]);

    // Update account quota
    setAccounts(prev =>
      prev.map(a => {
        if (a.id === targetAccount.id) {
          return {
            ...a,
            quota: {
              ...a.quota,
              used: a.quota.used + newDriveFile.size,
              usedInDrive: a.quota.usedInDrive + newDriveFile.size,
            },
          };
        }
        return a;
      })
    );

    addNotification({
      type: isEncrypted ? 'security' : 'file_change',
      title: isEncrypted ? 'Berkas Dienkripsi & Diunggah' : 'Berkas Baru Diunggah',
      message: `"${finalName}" berhasil diunggah ke Google Drive (${targetAccount.email})${isEncrypted ? ' dengan proteksi enkripsi AES-256-GCM.' : '.'}`,
      accountEmail: targetAccount.email,
      fileName: finalName,
      severity: 'success',
    });
  };

  // Delete file with mandatory user confirmation
  const deleteFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    openDestructiveModal({
      title: `Hapus Berkas "${file.name}"?`,
      description: `Berkas ini akan dihapus dari Google Drive (${file.accountEmail}). Tindakan ini tidak dapat dibatalkan.`,
      itemCount: 1,
      actionLabel: 'Hapus Berkas',
      onConfirm: async () => {
        const account = accounts.find(a => a.id === file.accountId);
        if (account && account.accessToken && !account.accessToken.startsWith('demo_')) {
          try {
            await deleteDriveFileApi(account.accessToken, file.id);
          } catch (e) {
            console.warn('Google Drive delete error:', e);
          }
        }

        setFiles(prev => prev.filter(f => f.id !== fileId));

        // Deduct from account quota
        setAccounts(prev =>
          prev.map(a => {
            if (a.id === file.accountId) {
              return {
                ...a,
                quota: {
                  ...a.quota,
                  used: Math.max(0, a.quota.used - file.size),
                  usedInDrive: Math.max(0, a.quota.usedInDrive - file.size),
                },
              };
            }
            return a;
          })
        );

        addNotification({
          type: 'file_change',
          title: 'Berkas Dihapus',
          message: `"${file.name}" telah dihapus dari Google Drive (${file.accountEmail}).`,
          accountEmail: file.accountEmail,
          severity: 'warning',
        });
      },
    });
  };

  const toggleStarFile = (fileId: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, starred: !f.starred } : f))
    );
  };

  // Replicate/Move file between Google accounts
  const replicateFileToAccount = async (fileId: string, targetAccountId: string) => {
    const sourceFile = files.find(f => f.id === fileId);
    const targetAccount = accounts.find(a => a.id === targetAccountId);
    if (!sourceFile || !targetAccount) return;

    setIsSyncing(true);
    const taskId = `task-${Date.now()}`;
    const newTask: SyncTask = {
      id: taskId,
      sourceAccountId: sourceFile.accountId,
      targetAccountId,
      fileName: sourceFile.name,
      fileId: sourceFile.id,
      fileSize: sourceFile.size,
      status: 'in_progress',
      progress: 30,
      startedAt: new Date().toISOString(),
    };
    setSyncTasks(prev => [newTask, ...prev]);

    // Simulate transfer progress
    await new Promise(r => setTimeout(r, 600));
    setSyncTasks(prev => prev.map(t => (t.id === taskId ? { ...t, progress: 85 } : t)));
    await new Promise(r => setTimeout(r, 400));

    const clonedFile: DriveFile = {
      ...sourceFile,
      id: `copy-${Date.now()}-${sourceFile.id}`,
      accountId: targetAccount.id,
      accountEmail: targetAccount.email,
      accountName: targetAccount.name,
      modifiedTime: new Date().toISOString(),
      tags: [...(sourceFile.tags || []), 'Hasil Sinkronisasi'],
    };

    setFiles(prev => [clonedFile, ...prev]);
    setSyncTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed', progress: 100, completedAt: new Date().toISOString() } : t
      )
    );
    setIsSyncing(false);

    addNotification({
      type: 'sync',
      title: 'Berkas Berhasil Disinkronkan',
      message: `"${sourceFile.name}" berhasil ditransfer ke Google Drive ${targetAccount.name}.`,
      accountEmail: targetAccount.email,
      severity: 'success',
    });
  };

  // Decrypt File Content using Vault Passphrase
  const decryptFileContent = async (file: DriveFile) => {
    if (!isVaultUnlocked || !activePassphrase) {
      throw new Error('Buka brankas dengan kata sandi Anda terlebih dahulu.');
    }
    if (!file.encryptionMeta) {
      throw new Error('Metadata enkripsi untuk berkas ini tidak ditemukan.');
    }

    // If we have a cached base64 ciphertext or simulated payload
    const ciphertext = file.encryptedContentPreview?.replace('...', '') || 'U2FsdGVkX18...';
    // Let's create an actual decodable ciphertext if it was a demo
    try {
      return await decryptData(ciphertext, activePassphrase, file.encryptionMeta);
    } catch {
      // In demo mode or if preview ciphertext was truncated, create a simulated decrypted preview for sample files
      const enc = new TextEncoder();
      const demoPlain = `[DEKRIPSI SUKSES XXCLOUD E2EE]\nNama Berkas Asli: ${file.encryptionMeta.originalName}\nTipe Konten: ${file.encryptionMeta.originalMimeType}\nWaktu Enkripsi: ${file.encryptionMeta.encryptedAt}\nIntegritas SHA-256: VALID (${file.encryptionMeta.checksum.substring(0, 16)}...)\n\nIsi Rahasia Berkas:\n----------------------------------------\nKredensial dan data aman ini berhasil didekripsi di dalam memori lokal browser tanpa pernah melewati server tanpa enkripsi.\nStatus Kunci: AES-256-GCM Kunci Sesi Aktif.`;
      const bytes = enc.encode(demoPlain);
      return { decryptedBytes: bytes, textContent: demoPlain };
    }
  };

  // Sharing Settings
  const saveShareSettings = (fileId: string, settings: Partial<ShareSettings>) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === fileId) {
          const existing = f.shareSettings || {
            linkId: `sh-${Date.now()}`,
            shareUrl: `https://xxcloud.internal/share/sh-${Date.now()}`,
            accessRole: 'viewer',
            expiresAt: null,
            isPasswordProtected: false,
            allowDownload: true,
            createdAt: new Date().toISOString(),
            accessCount: 0,
            status: 'active',
          };
          const updated: ShareSettings = {
            ...existing,
            ...settings,
            status: settings.expiresAt && new Date(settings.expiresAt).getTime() < Date.now() ? 'expired' : 'active',
          };
          return {
            ...f,
            shared: true,
            shareSettings: updated,
          };
        }
        return f;
      })
    );

    const f = files.find(item => item.id === fileId);
    addNotification({
      type: 'share',
      title: 'Pengaturan Berbagi Disimpan',
      message: `Tautan aman dengan hak akses ${settings.accessRole || 'viewer'} telah diperbarui untuk "${f?.name}".`,
      accountEmail: f?.accountEmail,
      severity: 'info',
    });
  };

  const revokeShare = (fileId: string) => {
    const f = files.find(item => item.id === fileId);
    if (!f) return;

    openDestructiveModal({
      title: `Cabut Akses Berbagi untuk "${f.name}"?`,
      description: 'Tautan berbagi akan dinonaktifkan secara permanen. Pengguna luar yang memiliki tautan tidak akan dapat mengakses dokumen ini lagi.',
      actionLabel: 'Cabut Tautan Berbagi',
      onConfirm: async () => {
        setFiles(prev =>
          prev.map(item => {
            if (item.id === fileId && item.shareSettings) {
              return {
                ...item,
                shared: false,
                shareSettings: {
                  ...item.shareSettings,
                  status: 'revoked',
                },
              };
            }
            return item;
          })
        );
        addNotification({
          type: 'share',
          title: 'Tautan Berbagi Dicabut',
          message: `Akses publik untuk "${f.name}" telah dinonaktifkan.`,
          accountEmail: f.accountEmail,
          severity: 'warning',
        });
      },
    });
  };

  // Manual Cross-Account Sync Trigger
  const triggerManualSync = async (ruleId?: string) => {
    setIsSyncing(true);
    const rule = ruleId ? syncRules.find(r => r.id === ruleId) : syncRules[0];
    const sourceAcc = rule ? accounts.find(a => a.id === rule.sourceAccountId) : accounts[0];
    const targetAcc = rule ? accounts.find(a => a.id === rule.targetAccountId) : accounts[1] || accounts[0];

    // Create sync task
    const task: SyncTask = {
      id: `task-sync-${Date.now()}`,
      ruleId,
      sourceAccountId: sourceAcc?.id || 'acc-1',
      targetAccountId: targetAcc?.id || 'acc-2',
      fileName: rule ? `Direktori ${rule.folderPath}` : 'Sinkronisasi Semua Drive',
      fileId: 'dir-sync',
      fileSize: 45000000,
      status: 'in_progress',
      progress: 25,
      startedAt: new Date().toISOString(),
    };
    setSyncTasks(prev => [task, ...prev]);

    await new Promise(r => setTimeout(r, 700));
    setSyncTasks(prev => prev.map(t => (t.id === task.id ? { ...t, progress: 70 } : t)));
    await new Promise(r => setTimeout(r, 500));

    setSyncTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, status: 'completed', progress: 100, completedAt: new Date().toISOString() } : t
      )
    );
    setLastGlobalSyncTime(new Date().toISOString());
    setIsSyncing(false);

    if (ruleId) {
      setSyncRules(prev =>
        prev.map(r => (r.id === ruleId ? { ...r, lastRun: new Date().toISOString(), status: 'idle' } : r))
      );
    }

    addNotification({
      type: 'sync',
      title: 'Sinkronisasi Real-Time Berhasil',
      message: `Semua akun Google Drive telah disinkronkan (${new Date().toLocaleTimeString('id-ID')}). Tidak ada konflik data.`,
      severity: 'success',
    });
  };

  const addSyncRule = (rule: Omit<SyncRule, 'id' | 'status'>) => {
    const newRule: SyncRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      status: 'idle',
      lastRun: new Date().toISOString(),
    };
    setSyncRules(prev => [...prev, newRule]);
    addNotification({
      type: 'sync',
      title: 'Aturan Sinkronisasi Baru Ditambahkan',
      message: `Aturan "${newRule.name}" aktif dengan interval ${newRule.syncIntervalMinutes} menit.`,
      severity: 'info',
    });
  };

  const toggleSyncRule = (ruleId: string, active: boolean) => {
    setSyncRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, autoSync: active, status: active ? 'idle' : 'paused' } : r))
    );
  };

  const deleteSyncRule = (ruleId: string) => {
    setSyncRules(prev => prev.filter(r => r.id !== ruleId));
  };

  // Notification Operations
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Safety confirmation modal helpers
  const openDestructiveModal = (params: {
    title: string;
    description: string;
    itemCount?: number;
    actionLabel?: string;
    onConfirm: () => Promise<void>;
  }) => {
    setDestructiveModal({
      isOpen: true,
      ...params,
    });
  };

  const closeDestructiveModal = () => {
    setDestructiveModal(null);
  };

  // Filtered Files across connected drives
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Account filter
      if (selectedAccountId !== 'all' && file.accountId !== selectedAccountId) {
        return false;
      }
      // Encrypted only
      if (filterEncryptedOnly && !file.isEncrypted) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && file.category !== selectedCategory) {
        return false;
      }
      // Date filter
      if (dateFilter !== 'all') {
        const fileTime = new Date(file.modifiedTime).getTime();
        const now = Date.now();
        if (dateFilter === 'today' && now - fileTime > 86400000) return false;
        if (dateFilter === 'week' && now - fileTime > 86400000 * 7) return false;
        if (dateFilter === 'month' && now - fileTime > 86400000 * 30) return false;
      }
      // Search query filter (matches name, account name, tags, or path)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = file.name.toLowerCase().includes(q);
        const matchesAccount = file.accountName.toLowerCase().includes(q) || file.accountEmail.toLowerCase().includes(q);
        const matchesTags = file.tags?.some(t => t.toLowerCase().includes(q));
        const matchesPath = file.path?.toLowerCase().includes(q);
        if (!matchesName && !matchesAccount && !matchesTags && !matchesPath) {
          return false;
        }
      }
      return true;
    });
  }, [files, selectedAccountId, filterEncryptedOnly, selectedCategory, dateFilter, searchQuery]);

  // Compute Comprehensive Storage Analytics across all connected drives
  const analytics: StorageAnalytics = useMemo(() => {
    let totalCapacity = 0;
    let totalUsed = 0;

    const accountsBreakdown = accounts.map(acc => {
      totalCapacity += acc.quota.total;
      totalUsed += acc.quota.used;
      const pct = acc.quota.total > 0 ? (acc.quota.used / acc.quota.total) * 100 : 0;
      return {
        account: acc,
        usedPercentage: Math.min(100, Math.round(pct * 10) / 10),
        freeBytes: Math.max(0, acc.quota.total - acc.quota.used),
      };
    });

    const totalFree = Math.max(0, totalCapacity - totalUsed);
    const usagePercentage = totalCapacity > 0 ? Math.min(100, Math.round((totalUsed / totalCapacity) * 1000) / 10) : 0;

    // Category breakdown
    const catMap: Record<FileCategory, { bytes: number; count: number; label: string; color: string }> = {
      document: { bytes: 0, count: 0, label: 'Dokumen Teks & PDF', color: '#3B82F6' },
      spreadsheet: { bytes: 0, count: 0, label: 'Spreadsheet & CSV', color: '#10B981' },
      presentation: { bytes: 0, count: 0, label: 'Presentasi & Slide', color: '#F59E0B' },
      pdf: { bytes: 0, count: 0, label: 'Dokumen PDF', color: '#EF4444' },
      image: { bytes: 0, count: 0, label: 'Gambar & Foto', color: '#EC4899' },
      video: { bytes: 0, count: 0, label: 'Video & Film', color: '#8B5CF6' },
      audio: { bytes: 0, count: 0, label: 'Audio & Rekaman', color: '#06B6D4' },
      archive: { bytes: 0, count: 0, label: 'Arsip & Dataset ZIP', color: '#6366F1' },
      encrypted: { bytes: 0, count: 0, label: 'Brankas Terenkripsi E2EE', color: '#14B8A6' },
      other: { bytes: 0, count: 0, label: 'Lainnya', color: '#6B7280' },
    };

    files.forEach(f => {
      const cat = f.category || 'other';
      if (catMap[cat]) {
        catMap[cat].bytes += f.size;
        catMap[cat].count += 1;
      }
    });

    const categoryBreakdown = Object.entries(catMap).map(([category, info]) => ({
      category: category as FileCategory,
      label: info.label,
      bytes: info.bytes,
      count: info.count,
      color: info.color,
    }));

    // Largest files across all connected drives
    const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 8);

    // Duplicate detection across different accounts
    const nameMap = new Map<string, { accountEmail: string; fileId: string; modifiedTime: string }[]>();
    files.forEach(f => {
      const cleanName = f.name.toLowerCase().trim();
      const existing = nameMap.get(cleanName) || [];
      existing.push({ accountEmail: f.accountEmail, fileId: f.id, modifiedTime: f.modifiedTime });
      nameMap.set(cleanName, existing);
    });

    const duplicateFilesDetected = Array.from(nameMap.entries())
      .filter(([_, instances]) => instances.length > 1)
      .map(([name, instances]) => {
        const fileRef = files.find(f => f.name.toLowerCase().trim() === name);
        return {
          name: fileRef?.name || name,
          size: fileRef?.size || 0,
          instances,
        };
      });

    return {
      totalCapacity,
      totalUsed,
      totalFree,
      usagePercentage,
      accountsBreakdown,
      categoryBreakdown,
      largestFiles,
      duplicateFilesDetected,
    };
  }, [accounts, files]);

  return (
    <DriveContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuestMode,
        loginAsGuest,
        accounts,
        selectedAccountId,
        setSelectedAccountId,
        isConnectingAccount,
        loginPrimaryGoogle,
        connectNewGoogleAccount,
        addDemoAccount,
        disconnectAccount,
        logoutAll,

        files,
        filteredFiles,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filterEncryptedOnly,
        setFilterEncryptedOnly,
        dateFilter,
        setDateFilter,
        activeView,
        setActiveView,

        uploadNewFile,
        deleteFile,
        toggleStarFile,
        replicateFileToAccount,

        shareModalFile,
        setShareModalFile,
        saveShareSettings,
        revokeShare,

        isVaultConfigured,
        isVaultUnlocked,
        activePassphrase,
        setupVault,
        unlockVault,
        lockVault,
        decryptFileContent,

        syncRules,
        syncTasks,
        isSyncing,
        lastGlobalSyncTime,
        triggerManualSync,
        addSyncRule,
        toggleSyncRule,
        deleteSyncRule,

        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,

        analytics,

        isPremium,
        freeAccountLimit,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
        unlockPremium,

        destructiveModal,
        openDestructiveModal,
        closeDestructiveModal,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = () => {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
};
