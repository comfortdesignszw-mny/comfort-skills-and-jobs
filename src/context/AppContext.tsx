import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CurrencyType, LanguageType, UserProfile, SyncQueueItem } from '../types';
import { StorageEngine } from '../db/storage';
import { t } from '../utils/i18n';
import { getTimeGreeting } from '../utils/greeting';
import { auth, FirebaseUser, syncUserProfileWithFirestore } from '../firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';

export type NavTab = 'home' | 'learn' | 'work' | 'business' | 'profile';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  workSubTab: 'jobs' | 'gigs';
  setWorkSubTab: (sub: 'jobs' | 'gigs') => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  isEffectivelyOnline: boolean;
  forceOffline: boolean;
  toggleForceOffline: () => void;
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  toggleCurrency: () => void;
  language: LanguageType;
  setLanguage: (l: LanguageType) => void;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  runSync: () => Promise<string>;
  userProfile: UserProfile;
  updateUserProfile: (p: UserProfile) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSyncModal: boolean;
  setShowSyncModal: (v: boolean) => void;
  storageStats: { totalKb: number; courseCount: number; txCount: number };
  toastMessage: string | null;
  showToast: (msg: string) => void;
  translate: (key: string) => string;
  // Auth additions
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  signOutUser: () => Promise<void>;
  // Dynamic Greeting
  greetingText: string;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [workSubTab, setWorkSubTab] = useState<'jobs' | 'gigs'>('jobs');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Time state for live greeting updates
  const [currentTime, setCurrentTime] = useState(new Date());

  // Storage derived state
  const [tick, setTick] = useState(0);
  useEffect(() => {
    return StorageEngine.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  // Monitor Firebase Auth state & enforce account-isolated privacy
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        StorageEngine.setActiveUser(user.uid);
        // Silent non-blocking profile synchronization in background
        syncUserProfileWithFirestore(user).then((synced) => {
          const currentProfile = StorageEngine.getUserProfile();
          const isAdmin = user.email === 'comfort.designszw@gmail.com';
          StorageEngine.saveUserProfile({
            ...currentProfile,
            ...synced,
            fullName: synced.fullName || user.displayName || currentProfile.fullName || 'Member',
            email: user.email || currentProfile.email,
            isEmployerVerified: isAdmin ? true : currentProfile.isEmployerVerified,
            employerKYCStatus: isAdmin ? 'verified' : (currentProfile.employerKYCStatus || 'none')
          });
        }).catch((e) => {
          console.warn('Silent offline startup - profile loaded from local storage cache:', e);
        });
      } else {
        StorageEngine.setActiveUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update time every minute to keep greeting fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const [nativeOnline, setNativeOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setNativeOnline(true);
    const handleOffline = () => setNativeOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const forceOffline = StorageEngine.getIsForceOffline();
  const isEffectivelyOnline = !forceOffline && nativeOnline;
  const currency = StorageEngine.getPreferredCurrency();
  const language = StorageEngine.getPreferredLanguage();
  const userProfile = StorageEngine.getUserProfile();
  const syncQueue = StorageEngine.getSyncQueue();
  const storageStats = StorageEngine.calculateStorageUsage();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const toggleForceOffline = () => {
    const next = !forceOffline;
    StorageEngine.setForceOffline(next);
    showToast(next ? 'Airplane / Offline Mode activated. All data saves to phone storage.' : 'Online Mode restored. Ready to synchronize.');
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'ZiG' : 'USD';
    StorageEngine.setPreferredCurrency(next);
    showToast(`Currency switched to ${next}`);
  };

  const setCurrency = (c: CurrencyType) => {
    StorageEngine.setPreferredCurrency(c);
  };

  const setLanguage = (l: LanguageType) => {
    StorageEngine.setPreferredLanguage(l);
    showToast(`Language set to ${l === 'nd' ? 'isiNdebele' : l === 'sn' ? 'chiShona' : 'English'}`);
  };

  const updateUserProfile = (p: UserProfile) => {
    StorageEngine.saveUserProfile(p);
    showToast('Profile updated locally');
  };

  const signOutUser = async () => {
    try {
      await fbSignOut(auth);
      StorageEngine.setActiveUser(null);
      showToast('Signed out. Personal data and business records secured and cleared from screen.');
    } catch (err: any) {
      showToast('Failed to sign out.');
    }
  };

  const runSync = async () => {
    if (!isEffectivelyOnline) {
      showToast('Cannot sync while Offline / Flight mode is active.');
      return 'Offline';
    }
    setIsSyncing(true);
    try {
      const res = await StorageEngine.synchronizeNow();
      showToast(res.message);
      return res.message;
    } finally {
      setIsSyncing(false);
    }
  };

  const translate = (key: string) => t(key, language);

  // Dynamic greeting using device local time and current logged in name
  const greetingText = useMemo(() => {
    let activeName: string | null = null;
    if (currentUser) {
      if (currentUser.displayName && currentUser.displayName.trim()) {
        activeName = currentUser.displayName.trim();
      } else if (
        userProfile.fullName && 
        userProfile.fullName.trim() && 
        userProfile.fullName !== 'Comfort Member' && 
        userProfile.fullName !== 'Comfort Nyoni'
      ) {
        activeName = userProfile.fullName.trim();
      } else if (currentUser.email) {
        if (currentUser.email.endsWith('@comfortskills.com')) {
          activeName = currentUser.email.replace('@comfortskills.com', '');
        } else {
          activeName = currentUser.email.split('@')[0];
        }
      }
    }
    return getTimeGreeting(language, activeName);
  }, [currentTime, language, currentUser, userProfile.fullName]);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      workSubTab,
      setWorkSubTab,
      selectedCourseId,
      setSelectedCourseId,
      selectedJobId,
      setSelectedJobId,
      isEffectivelyOnline,
      forceOffline,
      toggleForceOffline,
      currency,
      setCurrency,
      toggleCurrency,
      language,
      setLanguage,
      syncQueue,
      isSyncing,
      runSync,
      userProfile,
      updateUserProfile,
      searchQuery,
      setSearchQuery,
      showSyncModal,
      setShowSyncModal,
      storageStats,
      toastMessage,
      showToast,
      translate,
      currentUser,
      authLoading,
      showAuthModal,
      setShowAuthModal,
      signOutUser,
      greetingText
    }),
    [
      activeTab,
      workSubTab,
      selectedCourseId,
      selectedJobId,
      isEffectivelyOnline,
      forceOffline,
      currency,
      language,
      userProfile,
      syncQueue,
      isSyncing,
      searchQuery,
      showSyncModal,
      storageStats,
      toastMessage,
      currentUser,
      authLoading,
      showAuthModal,
      greetingText,
      tick
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
