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
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  UserProfile, 
  BusinessTransaction, 
  InventoryItem, 
  CustomerCredit, 
  GigWorker, 
  GigRequest,
  JobVacancy,
  EmployerKYC
} from './types';

export const ADMIN_EMAIL = 'comfort.designszw@gmail.com';

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

// ================= FIRESTORE CLOUD OPERATIONS =================
export async function saveTransactionToFirestore(userId: string, tx: BusinessTransaction): Promise<void> {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, {
      ...tx,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync transaction to cloud:', error);
  }
}

export async function deleteTransactionFromFirestore(userId: string, txId: string): Promise<void> {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (error) {
    console.warn('Could not delete transaction from cloud:', error);
  }
}

export async function fetchTransactionsFromFirestore(userId: string): Promise<BusinessTransaction[]> {
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const snap = await getDocs(colRef);
    const results: BusinessTransaction[] = [];
    snap.forEach((d) => {
      const t = d.data() as BusinessTransaction;
      if (['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id)) {
        deleteDoc(d.ref).catch(() => {});
      } else {
        results.push(t);
      }
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch transactions from cloud:', error);
    return [];
  }
}

export async function saveInventoryItemToFirestore(userId: string, item: InventoryItem): Promise<void> {
  try {
    const itemRef = doc(db, 'users', userId, 'inventory', item.id);
    await setDoc(itemRef, {
      ...item,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync inventory item to cloud:', error);
  }
}

export async function deleteInventoryItemFromFirestore(userId: string, itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, 'users', userId, 'inventory', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.warn('Could not delete inventory item from cloud:', error);
  }
}

export async function fetchInventoryFromFirestore(userId: string): Promise<InventoryItem[]> {
  try {
    const colRef = collection(db, 'users', userId, 'inventory');
    const snap = await getDocs(colRef);
    const results: InventoryItem[] = [];
    snap.forEach((d) => {
      const item = d.data() as InventoryItem;
      if (['inv-1', 'inv-2', 'inv-3'].includes(item.id)) {
        deleteDoc(d.ref).catch(() => {});
      } else {
        results.push(item);
      }
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch inventory from cloud:', error);
    return [];
  }
}

export async function saveCustomerCreditToFirestore(userId: string, credit: CustomerCredit): Promise<void> {
  try {
    const creditRef = doc(db, 'users', userId, 'credits', credit.id);
    await setDoc(creditRef, {
      ...credit,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync customer credit to cloud:', error);
  }
}

export async function deleteCustomerCreditFromFirestore(userId: string, creditId: string): Promise<void> {
  try {
    const creditRef = doc(db, 'users', userId, 'credits', creditId);
    await deleteDoc(creditRef);
  } catch (error) {
    console.warn('Could not delete customer credit from cloud:', error);
  }
}

export async function fetchCustomerCreditsFromFirestore(userId: string): Promise<CustomerCredit[]> {
  try {
    const colRef = collection(db, 'users', userId, 'credits');
    const snap = await getDocs(colRef);
    const results: CustomerCredit[] = [];
    snap.forEach((d) => {
      const c = d.data() as CustomerCredit;
      if (['cred-1'].includes(c.id)) {
        deleteDoc(d.ref).catch(() => {});
      } else {
        results.push(c);
      }
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch customer credits from cloud:', error);
    return [];
  }
}

export async function saveArtisanToFirestore(worker: GigWorker): Promise<void> {
  try {
    const workerRef = doc(db, 'artisans', worker.id);
    await setDoc(workerRef, {
      ...worker,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync artisan to cloud:', error);
  }
}

export async function deleteArtisanFromFirestore(workerId: string): Promise<void> {
  try {
    const workerRef = doc(db, 'artisans', workerId);
    await deleteDoc(workerRef);
  } catch (error) {
    console.warn('Could not delete artisan from cloud:', error);
  }
}

export async function fetchArtisansFromFirestore(): Promise<GigWorker[]> {
  try {
    const colRef = collection(db, 'artisans');
    const snap = await getDocs(colRef);
    const results: GigWorker[] = [];
    const sampleNames = ['Sipho Moyo', 'Tendai Chideme', 'Blessing Ncube', 'Farai Gumbo', 'Nomsa Dube', 'Tatenda Ndlovu'];
    snap.forEach((d) => {
      const w = d.data() as GigWorker;
      if (w.id.startsWith('worker-') || sampleNames.includes(w.name)) {
        deleteDoc(d.ref).catch(() => {});
      } else {
        results.push(w);
      }
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch artisans from cloud:', error);
    return [];
  }
}

export async function saveGigRequestToFirestore(gig: GigRequest): Promise<void> {
  try {
    const gigRef = doc(db, 'gigs', gig.id);
    await setDoc(gigRef, {
      ...gig,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync gig request to cloud:', error);
  }
}

export async function fetchGigRequestsFromFirestore(): Promise<GigRequest[]> {
  try {
    const colRef = collection(db, 'gigs');
    const snap = await getDocs(colRef);
    const results: GigRequest[] = [];
    snap.forEach((d) => {
      const g = d.data() as GigRequest;
      if (g.id.startsWith('gig-1') || g.id.startsWith('gig-2') || g.id.startsWith('gig-3')) {
        deleteDoc(d.ref).catch(() => {});
      } else {
        results.push(g);
      }
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch gig requests from cloud:', error);
    return [];
  }
}

export async function saveJobToFirestore(job: JobVacancy): Promise<void> {
  try {
    const jobRef = doc(db, 'jobs', job.id);
    await setDoc(jobRef, {
      ...job,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not sync job vacancy to cloud:', error);
  }
}

export async function deleteJobFromFirestore(jobId: string): Promise<void> {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.warn('Could not delete job vacancy from cloud:', error);
  }
}

export async function fetchJobsFromFirestore(): Promise<JobVacancy[]> {
  try {
    const colRef = collection(db, 'jobs');
    const snap = await getDocs(colRef);
    const results: JobVacancy[] = [];
    snap.forEach((d) => {
      const j = d.data() as JobVacancy;
      if (['job-1', 'job-2', 'job-3', 'job-4', 'job-5', 'job-6'].includes(j.id)) {
        deleteDoc(d.ref).catch(() => {});
      } else {
        results.push(j);
      }
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch jobs from cloud:', error);
    return [];
  }
}

export async function saveKYCApplicationToFirestore(kyc: EmployerKYC): Promise<void> {
  try {
    const kycRef = doc(db, 'kyc_applications', kyc.userId);
    await setDoc(kycRef, {
      ...kyc,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not submit KYC to cloud:', error);
  }
}

export async function fetchKYCApplicationsFromFirestore(): Promise<EmployerKYC[]> {
  try {
    const colRef = collection(db, 'kyc_applications');
    const snap = await getDocs(colRef);
    const results: EmployerKYC[] = [];
    snap.forEach((d) => {
      results.push(d.data() as EmployerKYC);
    });
    return results;
  } catch (error) {
    console.warn('Could not fetch KYC applications from cloud:', error);
    return [];
  }
}

export async function updateKYCStatusInFirestore(
  userId: string,
  status: 'verified' | 'rejected',
  reviewerEmail: string,
  reason?: string
): Promise<void> {
  try {
    const kycRef = doc(db, 'kyc_applications', userId);
    await setDoc(kycRef, {
      status,
      reviewedBy: reviewerEmail,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason || ''
    }, { merge: true });

    // Also update the target user profile document
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      isEmployerVerified: status === 'verified',
      employerKYCStatus: status,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Could not update KYC status in cloud:', error);
  }
}

export type { FirebaseUser };
