import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Coins, 
  User, 
  LogIn, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const { 
    isEffectivelyOnline, 
    forceOffline, 
    toggleForceOffline, 
    currency, 
    toggleCurrency, 
    language, 
    setLanguage, 
    syncQueue, 
    isSyncing, 
    setActiveTab,
    setShowSyncModal,
    greetingText,
    currentUser,
    setShowAuthModal,
    signOutUser
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Offline Status Warning Bar when in Offline / Flight Mode */}
      {!isEffectivelyOnline && (
        <div className="bg-amber-500 text-white px-3 sm:px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Offline Mode Active · Operating safely from phone memory</span>
          </div>
          <button
            onClick={toggleForceOffline}
            className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition shrink-0 ml-2"
          >
            Turn Online
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 space-y-2">
        {/* Tier 1: Brand & Greeting on Left | Profile Avatar or Sign In on Right (ALWAYS VISIBLE ON ALL SCREENS) */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Dynamic Time Greeting */}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-teal-600 block leading-none mb-1">
              COMFORT
            </span>
            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
              {greetingText}
            </h1>
          </div>

          {/* User Profile Avatar OR Sign In Button - ALWAYS PROMINENT ON MOBILE */}
          <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="h-9 w-9 min-h-[36px] min-w-[36px] rounded-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center border-2 border-teal-500 shadow-xs active:scale-95 transition overflow-hidden"
                  title={`${currentUser.displayName || currentUser.email} · My Profile`}
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : currentUser.displayName ? (
                    currentUser.displayName.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={signOutUser}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs active:scale-95 transition shrink-0 min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Responsive Utility Toolbar (Currency, Language, Flight Mode, Sync Outbox, PWA Install) */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Currency Toggle (USD vs ZiG) */}
            <button
              onClick={toggleCurrency}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition"
              title="Toggle between USD ($) and Zimbabwe Gold (ZiG)"
            >
              <Coins className="w-3 h-3 text-amber-600" />
              <span>{currency}</span>
            </button>

            {/* Language Selector (EN / ND / SN) */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded-md transition ${language === 'en' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('nd')}
                className={`px-1.5 py-0.5 rounded-md transition ${language === 'nd' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                title="isiNdebele"
              >
                ND
              </button>
              <button
                onClick={() => setLanguage('sn')}
                className={`px-1.5 py-0.5 rounded-md transition ${language === 'sn' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                title="chiShona"
              >
                SN
              </button>
            </div>

            {/* Flight / Offline Mode Simulator */}
            <button
              onClick={toggleForceOffline}
              className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition ${
                isEffectivelyOnline
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
              title={isEffectivelyOnline ? 'Simulate Airplane/Offline Mode' : 'Restore Online Mode'}
            >
              {isEffectivelyOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-semibold">Offline</span>
                </>
              )}
            </button>

            {/* Outbox Sync Trigger */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
              title="Database Outbox & Sync Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
              {syncQueue.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {syncQueue.length}
                </span>
              )}
            </button>
          </div>

          {/* In-App PWA Install Button (Always visible on mobile!) */}
          <div className="shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </header>
  );
};
