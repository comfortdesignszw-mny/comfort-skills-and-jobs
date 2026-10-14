import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Format user phone number to comfortskills.com email for seamless phone/password auth
 * e.g. "+263 77 234 5678" -> "+263772345678@comfortskills.com"
 */
export function formatPhoneToEmail(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+263' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return `${cleaned}@comfortskills.com`;
}

/**
 * Check if string looks like phone number
 */
export function isPhoneNumber(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 8 && !input.includes('@');
}

/**
 * Ensure user document exists in Firestore and persist user record
 */
export async function syncUserProfileWithFirestore(
  user: FirebaseUser, 
  extraData?: Partial<UserProfile>
): Promise<Partial<UserProfile>> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        fullName: data.fullName || user.displayName || 'Comfort Member',
        email: data.email || user.email || '',
        phone: data.phone || user.phoneNumber || '',
        suburb: data.suburb || 'Bulawayo CBD',
        city: data.city || 'Bulawayo',
        headline: data.headline || 'Comfort Skills Hub Member',
        bio: data.bio || '',
        skills: data.skills || ['Customer Service', 'Basic Trades'],
        roles: data.roles || ['learner', 'jobseeker', 'worker', 'business_owner']
      };
    } else {
      const newProfileData = {
        id: user.uid,
        fullName: user.displayName || extraData?.fullName || 'Comfort Member',
        email: user.email || '',
        phone: user.phoneNumber || extraData?.phone || '',
        photoURL: user.photoURL || '',
        suburb: extraData?.suburb || 'Bulawayo CBD',
        city: extraData?.city || 'Bulawayo',
        headline: extraData?.headline || 'Comfort Skills Hub Member',
        bio: extraData?.bio || 'Vocational worker and entrepreneur in Bulawayo',
        roles: extraData?.roles || ['learner', 'jobseeker', 'worker', 'business_owner'],
        skills: extraData?.skills || ['Customer Service', 'Basic Trades'],
        authProvider: user.providerData?.[0]?.providerId || 'google.com',
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, newProfileData);
      return newProfileData;
    }
  } catch (error) {
    console.warn('Firestore profile sync fallback to local storage:', error);
    // Return extraData or user fallback if network is offline
    return {
      fullName: user.displayName || extraData?.fullName || 'Comfort Member',
      email: user.email || '',
      phone: user.phoneNumber || extraData?.phone || ''
    };
  }
}

/**
 * Persist updated user profile to Firestore
 */
export async function saveUserProfileToFirestore(userId: string, data: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not save profile to remote Firestore (offline or rule error):', error);
  }
}

export type { FirebaseUser };
