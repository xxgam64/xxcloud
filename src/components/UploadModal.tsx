import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Shield,
  Lock,
  FileCheck,
  HardDrive,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useDrive } from '../context/DriveContext';
import { formatBytes } from '../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenVaultModal: () => void;
}

export const UploadModal: React.FC<Props> = ({ isOpen, onClose, onOpenVaultModal }) => {
  const {
    accounts,
    uploadNewFile,
    isVaultUnlocked,
    isVaultConfigured,
  } = useDrive();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [encryptWithVault, setEncryptWithVault] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (encryptWithVault && !isVaultUnlocked) {
      setUploadError('Buka brankas dengan sandi Anda terlebih dahulu untuk mengenkripsi file ini.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadNewFile(selectedAccountId, selectedFile, encryptWithVault);
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah berkas.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Unggah & Enkripsi Berkas</h3>
              <p className="text-xs text-slate-400">Simpan ke Google Drive pilihan dengan proteksi E2EE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpload} className="p-6 space-y-4 text-xs">
          {/* Account Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Akun Google Drive Tujuan:</label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-1">
                <FileCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-semibold text-white truncate max-w-xs mx-auto">
                  {selectedFile.name}
                </h4>
                <p className="text-slate-400 font-mono text-[11px]">{formatBytes(selectedFile.size)}</p>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  Klik untuk mengganti berkas
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-medium text-slate-300">
                  Tarik & letakkan berkas di sini, atau <span className="text-blue-400 underline">pilih dari perangkat</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Mendukung dokumen, PDF, spreadsheet, zip, media (hingga 100 MB per file)
                </p>
              </div>
            )}
          </div>

          {/* Encryption Option Toggle */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={encryptWithVault}
                  onChange={e => setEncryptWithVault(e.target.checked)}
                  className="rounded text-teal-600 bg-slate-900 border-slate-700 w-4 h-4 cursor-pointer"
                />
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Enkripsi End-to-End (AES-256-GCM)</span>
              </label>
              <span className="text-[10px] text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                Zero-Knowledge
              </span>
            </div>

            <p className="text-[11px] text-slate-400 pl-6">
              File akan dienkripsi di memori peramban Anda sebelum diunggah ke Google Drive. Pihak Google
              maupun siapapun tidak dapat melihat isinya tanpa kata sandi master Anda.
            </p>

            {encryptWithVault && !isVaultUnlocked && (
              <div className="pl-6 pt-1 flex items-center justify-between">
                <span className="text-amber-400 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Brankas terkunci
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVaultModal();
                  }}
                  className="text-xs text-teal-300 hover:underline font-semibold"
                >
                  Buka Sandi Brankas →
                </button>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {uploadError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-900/30 transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{encryptWithVault ? 'Mengenkrpsi & Mengunggah...' : 'Mengunggah...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah ke Drive</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
