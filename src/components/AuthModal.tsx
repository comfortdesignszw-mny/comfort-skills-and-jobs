import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  formatPhoneToEmail, 
  isPhoneNumber,
  syncUserProfileWithFirestore
} from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { LegalModal } from './LegalModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const { updateUserProfile, userProfile, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [identifier, setIdentifier] = useState(''); // phone or email
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [suburb, setSuburb] = useState('Bulawayo CBD');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Legal modal inside auth
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

  if (!isOpen) return null;

  const getEffectiveEmail = (input: string): string => {
    const trimmed = input.trim();
    if (isPhoneNumber(trimmed)) {
      return formatPhoneToEmail(trimmed);
    }
    return trimmed;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Persist / retrieve profile from Firestore
      const firestoreProfile = await syncUserProfileWithFirestore(user, {
        fullName: user.displayName || userProfile.fullName,
        email: user.email || userProfile.email
      });

      // Update local profile state
      updateUserProfile({
        ...userProfile,
        ...firestoreProfile,
        fullName: firestoreProfile.fullName || user.displayName || userProfile.fullName || 'Member',
        email: user.email || userProfile.email,
        phone: user.phoneNumber || userProfile.phone
      });

      showToast(`Welcome, ${user.displayName || 'signed in'}! Account synced with cloud.`);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your phone/email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const effectiveEmail = getEffectiveEmail(identifier);
    // Check if offline or flight mode is active
    const isOffline = !navigator.onLine || StorageEngine.getIsForceOffline();

    if (isOffline) {
      if (mode === 'signup') {
        const isPhoneUsed = isPhoneNumber(identifier);
        const res = StorageEngine.registerOffline(identifier, password, {
          fullName: fullName.trim() || userProfile.fullName || 'Member',
          email: isPhoneUsed ? userProfile.email : effectiveEmail,
          phone: isPhoneUsed ? identifier.trim() : userProfile.phone,
          suburb: suburb || userProfile.suburb
        });
        updateUserProfile(res.profile);
        showToast(`Account created offline! Full access enabled. Will sync when reconnected.`);
        setIsLoading(false);
        onClose();
        return;
      } else {
        const offRes = StorageEngine.authenticateOffline(identifier, password);
        if (offRes.success && offRes.profile) {
          updateUserProfile(offRes.profile);
          showToast(`Logged in offline! Welcome back, ${offRes.profile.fullName || 'Member'}.`);
          setIsLoading(false);
          onClose();
          return;
        } else {
          setErrorMessage(offRes.error || 'Offline credentials not found. Connect to internet or register.');
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      if (mode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, effectiveEmail, password);
        if (fullName.trim()) {
          await updateProfile(userCred.user, { displayName: fullName.trim() });
        }

        const isPhoneUsed = isPhoneNumber(identifier);
        const newProfileData = {
          fullName: fullName.trim() || userProfile.fullName,
          email: isPhoneUsed ? userProfile.email : effectiveEmail,
          phone: isPhoneUsed ? identifier.trim() : userProfile.phone,
          suburb: suburb || userProfile.suburb
        };

        // Persist new user document in Firestore database
        const firestoreProfile = await syncUserProfileWithFirestore(userCred.user, newProfileData);
        const merged = {
          ...userProfile,
          ...newProfileData,
          ...firestoreProfile
        };

        updateUserProfile(merged);
        // Cache credentials locally so user can authenticate 100% offline next time
        StorageEngine.saveOfflineCredentials(identifier, password, userCred.user.uid, merged);

        showToast(`Account created and saved to database! Welcome, ${fullName || 'to Comfort Hub'}.`);
        onClose();
      } else {
        const userCred = await signInWithEmailAndPassword(auth, effectiveEmail, password);
        
        // Retrieve and sync existing profile from Firestore database
        const firestoreProfile = await syncUserProfileWithFirestore(userCred.user);
        
        const isPhoneUsed = isPhoneNumber(identifier);
        const merged = {
          ...userProfile,
          ...firestoreProfile,
          fullName: firestoreProfile.fullName || userCred.user.displayName || userProfile.fullName,
          phone: isPhoneUsed ? identifier.trim() : (firestoreProfile.phone || userProfile.phone)
        };
        updateUserProfile(merged);

        // Cache credentials locally for future offline logins
        StorageEngine.saveOfflineCredentials(identifier, password, userCred.user.uid, merged);

        const displayName = firestoreProfile.fullName || userCred.user.displayName || userProfile.fullName;
        showToast(`Welcome back, ${displayName}! Account loaded from cloud.`);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed') {
        // Network handshake failed - fallback to offline authentication cache
        const offRes = StorageEngine.authenticateOffline(identifier, password);
        if (offRes.success && offRes.profile) {
          updateUserProfile(offRes.profile);
          showToast(`Network unavailable: Authenticated locally via offline storage!`);
          onClose();
          return;
        }
      }

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid phone number/email or incorrect password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this phone number or email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication error. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600 block">
            Comfort Skills &amp; Jobs Hub
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'login' 
              ? 'Access saved courses, job applications, and small business records' 
              : 'Join artisans, job seekers, and small traders in Bulawayo'}
          </p>

          {/* Toggle Tab */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-2 text-slate-300">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Or with phone or email
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sipho Moyo"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Suburb</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      placeholder="e.g. Nkulumane, Bulawayo"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. +263 77 234 5678 or name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms of Use & Privacy Policy links on the login screen as requested */}
            <p className="text-[11px] text-slate-500 leading-normal pt-1">
              By continuing, you agree to our{' '}
              <button
                type="button"
                onClick={() => {
                  setLegalTab('terms');
                  setLegalModalOpen(true);
                }}
                className="text-teal-700 font-bold underline underline-offset-2"
              >
                Terms of Use
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => {
                  setLegalTab('privacy');
                  setLegalModalOpen(true);
                }}
                className="text-teal-700 font-bold underline underline-offset-2"
              >
                Privacy Policy
              </button>
              .
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Embedded Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        defaultTab={legalTab}
      />
    </div>
  );
};
