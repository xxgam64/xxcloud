/**
 * Google Drive API v3 Service
 * Calls official Google Drive v3 REST endpoints with OAuth Bearer access tokens
 */

import { DriveAccount, DriveFile, DriveQuota, FileCategory } from '../types/drive';

export function mapMimeTypeToCategory(mimeType: string, fileName = ''): FileCategory {
  if (fileName.endsWith('.omnienc') || fileName.endsWith('.enc')) return 'encrypted';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || fileName.endsWith('.pptx')) return 'presentation';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text/plain') || fileName.endsWith('.docx') || fileName.endsWith('.md')) return 'document';
  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed') || fileName.endsWith('.zip')) return 'archive';
  return 'other';
}

export async function fetchDriveAbout(accessToken: string): Promise<{
  displayName: string;
  emailAddress: string;
  photoLink: string;
  storageQuota: DriveQuota;
}> {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress,photoLink),storageQuota',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const quota = data.storageQuota || {};
  return {
    displayName: data.user?.displayName || 'Google User',
    emailAddress: data.user?.emailAddress || 'user@gmail.com',
    photoLink: data.user?.photoLink || '',
    storageQuota: {
      total: Number(quota.limit) || 15 * 1024 * 1024 * 1024, // 15 GB default for Google accounts
      used: Number(quota.usage) || 0,
      usedInDrive: Number(quota.usageInDrive) || 0,
      usedInTrash: Number(quota.usageInDriveTrash) || 0,
    },
  };
}

export async function fetchDriveFiles(
  accessToken: string,
  account: DriveAccount
): Promise<DriveFile[]> {
  const fields =
    'nextPageToken,files(id,name,mimeType,size,modifiedTime,createdTime,shared,webViewLink,webContentLink,starred,trashed,description,properties)';
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=100&q=trashed%3Dfalse&fields=${encodeURIComponent(
      fields
    )}&orderBy=modifiedTime%20desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive files list failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const items = data.files || [];

  return items.map((f: any) => {
    const isEncrypted =
      f.name.endsWith('.omnienc') ||
      f.properties?.isEncrypted === 'true' ||
      f.description?.includes('[OMNI_E2EE]');

    let encryptionMeta;
    if (f.description && f.description.includes('{') && f.description.includes('AES-256-GCM')) {
      try {
        const parsed = JSON.parse(f.description);
        if (parsed.algorithm === 'AES-256-GCM') {
          encryptionMeta = parsed;
        }
      } catch {
        // ignore JSON parse error
      }
    }

    return {
      id: f.id,
      accountId: account.id,
      accountEmail: account.email,
      accountName: account.name,
      name: f.name,
      mimeType: f.mimeType,
      category: isEncrypted ? 'encrypted' : mapMimeTypeToCategory(f.mimeType, f.name),
      size: Number(f.size) || 0,
      modifiedTime: f.modifiedTime || new Date().toISOString(),
      createdTime: f.createdTime || new Date().toISOString(),
      isEncrypted: isEncrypted,
      encryptionMeta,
      shared: Boolean(f.shared),
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
      starred: Boolean(f.starred),
      trashed: Boolean(f.trashed),
    };
  });
}

/**
 * Delete a file from Google Drive (Mandatory user confirmation handled in UI)
 */
export async function deleteDriveFileApi(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204 && res.status !== 404) {
    const errorText = await res.text();
    throw new Error(`Failed to delete file from Google Drive: ${errorText}`);
  }
  return true;
}

/**
 * Upload a new file (Regular or Encrypted E2EE) to Google Drive
 */
export async function uploadDriveFileApi(
  accessToken: string,
  fileName: string,
  content: string | Blob,
  mimeType: string,
  description?: string
): Promise<any> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: description || '',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', typeof content === 'string' ? new Blob([content], { type: mimeType }) : content);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}
