import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Coins, 
  User, 
  LogIn, 
  LogOut 
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Offline Status Warning Bar when in Offline / Flight Mode */}
      {!isEffectivelyOnline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>Offline Mode Active · Operating safely from phone memory</span>
          </div>
          <button
            onClick={toggleForceOffline}
            className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition"
          >
            Turn Online
          </button>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Dynamic Time-Based Greeting matching Request 1 & 2 */}
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-600">
            COMFORT
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {greetingText}
            </h1>
          </div>
        </div>

        {/* Right: Controls & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install */}
          <div className="hidden xs:block">
            <PWAInstallButton />
          </div>

          {/* Currency Toggle (USD vs ZiG) */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
            title="Toggle between USD ($) and Zimbabwe Gold (ZiG)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{currency}</span>
          </button>

          {/* Language Selector (EN / ND / SN) */}
          <div className="relative flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-1 rounded-md transition ${language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('nd')}
              className={`px-1.5 py-1 rounded-md transition ${language === 'nd' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="isiNdebele"
            >
              ND
            </button>
            <button
              onClick={() => setLanguage('sn')}
              className={`px-1.5 py-1 rounded-md transition ${language === 'sn' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="chiShona"
            >
              SN
            </button>
          </div>

          {/* Flight / Offline Mode Simulator */}
          <button
            onClick={toggleForceOffline}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isEffectivelyOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
            title={isEffectivelyOnline ? 'Simulate Airplane/Offline Mode' : 'Restore Online Mode'}
          >
            {isEffectivelyOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </button>

          {/* Outbox Sync Trigger */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Database Outbox & Sync Status"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
            {syncQueue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {syncQueue.length}
              </span>
            )}
          </button>

          {/* Authentication & Profile Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center border border-teal-700 hover:ring-2 hover:ring-teal-400 transition"
                title={`${currentUser.displayName || currentUser.email} · View Profile`}
              >
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </button>
              <button
                onClick={signOutUser}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
