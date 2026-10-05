export interface DriveQuota {
  total: number; // in bytes
  used: number; // in bytes
  usedInDrive: number; // in bytes
  usedInTrash: number; // in bytes
}

export interface DriveAccount {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isPrimary: boolean;
  accessToken: string;
  tokenExpiresAt: number;
  quota: DriveQuota;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncTime: string;
  color: string;
}

export type FileCategory = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'encrypted' | 'other';

export interface EncryptionMetadata {
  algorithm: 'AES-256-GCM';
  iv: string; // base64
  salt: string; // base64
  originalMimeType: string;
  originalName: string;
  originalSize: number;
  checksum: string; // sha-256
  encryptedAt: string;
}

export interface ShareSettings {
  linkId: string;
  shareUrl: string;
  accessRole: 'viewer' | 'commenter' | 'editor';
  expiresAt: string | null; // ISO string
  isPasswordProtected: boolean;
  passwordHash?: string;
  allowDownload: boolean;
  createdAt: string;
  accessCount: number;
  status: 'active' | 'expired' | 'revoked';
}

export interface DriveFile {
  id: string;
  accountId: string;
  accountEmail: string;
  accountName: string;
  name: string;
  mimeType: string;
  category: FileCategory;
  size: number;
  modifiedTime: string;
  createdTime: string;
  isEncrypted: boolean;
  encryptionMeta?: EncryptionMetadata;
  encryptedContentPreview?: string;
  plainContentPreview?: string;
  shared: boolean;
  shareSettings?: ShareSettings;
  webViewLink?: string;
  webContentLink?: string;
  starred?: boolean;
  trashed?: boolean;
  path?: string;
  tags?: string[];
  version?: number;
}

export interface SyncRule {
  id: string;
  name: string;
  sourceAccountId: string;
  targetAccountId: string;
  folderPath: string;
  direction: 'one_way' | 'two_way';
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastRun?: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  conflictResolution: 'keep_newer' | 'overwrite_target' | 'keep_both';
}

export interface SyncTask {
  id: string;
  ruleId?: string;
  sourceAccountId: string;
  targetAccountId: string;
  fileName: string;
  fileId: string;
  fileSize: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface DriveNotification {
  id: string;
  type: 'file_change' | 'security' | 'sync' | 'share' | 'system';
  title: string;
  message: string;
  accountEmail?: string;
  fileId?: string;
  fileName?: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface StorageAnalytics {
  totalCapacity: number;
  totalUsed: number;
  totalFree: number;
  usagePercentage: number;
  accountsBreakdown: {
    account: DriveAccount;
    usedPercentage: number;
    freeBytes: number;
  }[];
  categoryBreakdown: {
    category: FileCategory;
    label: string;
    bytes: number;
    count: number;
    color: string;
  }[];
  largestFiles: DriveFile[];
  duplicateFilesDetected: {
    name: string;
    size: number;
    instances: { accountEmail: string; fileId: string; modifiedTime: string }[];
  }[];
}
