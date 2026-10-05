/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DriveProvider, useDrive } from './context/DriveContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { FilesView } from './components/views/FilesView';
import { SearchView } from './components/views/SearchView';
import { VaultView } from './components/views/VaultView';
import { SyncView } from './components/views/SyncView';
import { SharingView } from './components/views/SharingView';
import { StorageAnalyticsView } from './components/views/StorageAnalyticsView';
import { SharingModal } from './components/SharingModal';
import { DestructiveConfirmModal } from './components/DestructiveConfirmModal';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { UploadModal } from './components/UploadModal';
import { VaultUnlockModal } from './components/VaultUnlockModal';
import { PremiumModal } from './components/PremiumModal';
import { LoginPage } from './components/LoginPage';

const AppContent: React.FC = () => {
  const {
    activeView,
    isAuthenticated,
    isPremiumModalOpen,
    setIsPremiumModalOpen,
  } = useDrive();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // If user is not authenticated, show the login gateway
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onOpenPremiumModal={() => setIsPremiumModalOpen(true)} />
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header Navbar */}
      <Navbar
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
      />

      {/* Main Body with Sidebar + View Content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <Sidebar
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          onOpenVaultModal={() => setIsVaultModalOpen(true)}
          onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenVaultModal={() => setIsVaultModalOpen(true)}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
            />
          )}

          {activeView === 'files' && (
            <FilesView
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenVaultModal={() => setIsVaultModalOpen(true)}
            />
          )}

          {activeView === 'search' && (
            <SearchView onOpenVaultModal={() => setIsVaultModalOpen(true)} />
          )}

          {activeView === 'vault' && (
            <VaultView onOpenUploadModal={() => setIsUploadModalOpen(true)} />
          )}

          {activeView === 'sync' && <SyncView />}

          {activeView === 'sharing' && <SharingView />}

          {activeView === 'analytics' && <StorageAnalyticsView />}
        </main>
      </div>

      {/* Global Modals */}
      <SharingModal />
      <DestructiveConfirmModal />
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
      />
      <VaultUnlockModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DriveProvider>
      <AppContent />
    </DriveProvider>
  );
}
