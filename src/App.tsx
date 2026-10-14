/**
 * Comfort Skills & Jobs Hub
 * Unified offline-first platform for Bulawayo and Zimbabwe
 * Learn. Work. Earn. Grow.
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { SyncManagerModal } from './components/SyncManagerModal';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { WorkView } from './views/WorkView';
import { BusinessView } from './views/BusinessView';
import { ProfileView } from './views/ProfileView';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage, showAuthModal, setShowAuthModal } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      <Header />

      <main className="flex-1 w-full">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'learn' && <LearnView />}
        {activeTab === 'work' && <WorkView />}
        {activeTab === 'business' && <BusinessView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Minimalist Footer with legal links & developer attribution */}
      <Footer />

      {/* Firebase Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Sync and Outbox Modal */}
      <SyncManagerModal />

      {/* Non-intrusive Toast Notification above bottom navigation */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium text-center border border-slate-700 backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Tactile Bottom Navigation Bar matching Screenshot 6 */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
