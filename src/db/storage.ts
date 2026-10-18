import { 
  Course, 
  JobVacancy, 
  GigWorker, 
  BusinessTransaction, 
  InventoryItem, 
  CustomerCredit, 
  UserProfile, 
  JobApplication, 
  GigRequest, 
  Certificate,
  SyncQueueItem,
  CourseProgress,
  EmployerKYC,
  CVDetails
} from '../types';
import { 
  INITIAL_COURSES, 
  INITIAL_JOBS, 
  INITIAL_GIG_WORKERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_INVENTORY, 
  INITIAL_CUSTOMER_CREDITS, 
  DEFAULT_USER_PROFILE 
} from './initialData';
import {
  saveUserProfileToFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  fetchTransactionsFromFirestore,
  saveInventoryItemToFirestore,
  deleteInventoryItemFromFirestore,
  fetchInventoryFromFirestore,
  saveCustomerCreditToFirestore,
  deleteCustomerCreditFromFirestore,
  fetchCustomerCreditsFromFirestore,
  saveArtisanToFirestore,
  fetchArtisansFromFirestore,
  deleteArtisanFromFirestore,
  saveGigRequestToFirestore,
  fetchGigRequestsFromFirestore,
  saveJobToFirestore,
  deleteJobFromFirestore,
  fetchJobsFromFirestore,
  saveKYCApplicationToFirestore,
  fetchKYCApplicationsFromFirestore,
  updateKYCStatusInFirestore,
  ADMIN_EMAIL
} from '../firebase';

const PUBLIC_STORAGE_KEYS = {
  COURSES: 'comfort_hub_courses_v5',
  JOBS: 'comfort_hub_jobs_v3',
  WORKERS: 'comfort_hub_workers_v4',
  GIG_REQUESTS: 'comfort_hub_gig_requests_v4',
  FORCE_OFFLINE: 'comfort_hub_force_offline_mode',
  CURRENCY: 'comfort_hub_preferred_currency',
  LANGUAGE: 'comfort_hub_preferred_lang',
  APP_INITIALIZED: 'comfort_hub_is_initialized_v4',
  ACTIVE_USER_ID: 'comfort_hub_active_user_id'
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

// In-memory active user reference
let currentUserId: string | null = null;

export const StorageEngine = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Set active authenticated user ID.
   * When null (logged out), personal data is cleared from the UI.
   * When string (logged in), the user's private data is restored.
   */
  setActiveUser(uid: string | null) {
    currentUserId = uid;
    if (uid) {
      localStorage.setItem(PUBLIC_STORAGE_KEYS.ACTIVE_USER_ID, uid);
      // Initialize user's private storage containers if first time
      this.initUserDataIfEmpty(uid);
      // Migrate any guest actions performed before logging in
      this.migrateGuestDataToUser(uid);
      // Perform background cloud synchronization
      this.syncUserDataWithCloud(uid);
      this.syncPublicDataWithCloud();
    } else {
      localStorage.removeItem(PUBLIC_STORAGE_KEYS.ACTIVE_USER_ID);
    }
    notifyListeners();
  },

  getActiveUserId(): string | null {
    if (currentUserId) return currentUserId;
    return localStorage.getItem(PUBLIC_STORAGE_KEYS.ACTIVE_USER_ID);
  },

  isUserLoggedIn(): boolean {
    return !!this.getActiveUserId();
  },

  getUserKey(suffix: string): string {
    const uid = this.getActiveUserId();
    if (!uid) return `comfort_hub_guest_${suffix}`;
    return `comfort_hub_user_${uid}_${suffix}`;
  },

  // ================= 100% OFFLINE AUTHENTICATION & SESSION CACHE =================
  getOfflineAccounts(): Record<string, { uid: string; identifier: string; passwordHash: string; profile: UserProfile }> {
    const raw = localStorage.getItem('comfort_hub_offline_auth_accounts_v1');
    return raw ? JSON.parse(raw) : {};
  },

  saveOfflineCredentials(identifier: string, password: string, uid: string, profile: UserProfile) {
    try {
      const accounts = this.getOfflineAccounts();
      const cleanId = identifier.trim().toLowerCase();
      const passwordHash = btoa(password);
      accounts[cleanId] = { uid, identifier: cleanId, passwordHash, profile };
      localStorage.setItem('comfort_hub_offline_auth_accounts_v1', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not cache offline credentials:', e);
    }
  },

  authenticateOffline(identifier: string, password: string): { success: boolean; profile?: UserProfile; uid?: string; error?: string } {
    const accounts = this.getOfflineAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const account = accounts[cleanId];
    if (!account) {
      return { 
        success: false, 
        error: 'No offline credentials cached on this device for this phone/email. Connect to the internet once to synchronize.' 
      };
    }
    if (account.passwordHash !== btoa(password)) {
      return { 
        success: false, 
        error: 'Incorrect offline password. Please verify your credentials.' 
      };
    }
    this.setActiveUser(account.uid);
    this.saveUserProfile(account.profile);
    return { success: true, profile: account.profile, uid: account.uid };
  },

  registerOffline(identifier: string, password: string, initialProfile: Partial<UserProfile>): { success: boolean; profile: UserProfile; uid: string } {
    const cleanId = identifier.trim().toLowerCase();
    const uid = `offline_user_${Date.now()}`;
    const newProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      ...initialProfile,
      id: uid,
      email: cleanId.includes('@') ? cleanId : (initialProfile.email || ''),
      phone: !cleanId.includes('@') ? identifier.trim() : (initialProfile.phone || '')
    };

    this.saveOfflineCredentials(cleanId, password, uid, newProfile);
    this.setActiveUser(uid);
    this.saveUserProfile(newProfile);

    // Queue sync for when network connection is detected
    this.addToSyncQueue({
      id: `sync-auth-${Date.now()}`,
      title: 'Offline Registered Account',
      entityType: 'application',
      payload: { uid, identifier: cleanId, profile: newProfile },
      createdAt: new Date().toISOString(),
      status: 'queued'
    });

    return { success: true, profile: newProfile, uid };
  },

  /**
   * Complete one-time purge of legacy development sample data so production app starts clean
   */
  purgeSampleData() {
    try {
      const isClean = localStorage.getItem('comfort_hub_clean_prod_v6_purged');
      if (isClean) return;

      // Clean old worker keys and filter out seeded names / IDs
      ['comfort_hub_workers', 'comfort_hub_workers_v1', 'comfort_hub_workers_v2', 'comfort_hub_workers_v3'].forEach((k) => localStorage.removeItem(k));
      ['comfort_hub_gig_requests', 'comfort_hub_gig_requests_v1', 'comfort_hub_gig_requests_v2', 'comfort_hub_gig_requests_v3'].forEach((k) => localStorage.removeItem(k));

      // Sanitize workers
      const rawWorkers = localStorage.getItem(PUBLIC_STORAGE_KEYS.WORKERS);
      if (rawWorkers) {
        try {
          const workers: GigWorker[] = JSON.parse(rawWorkers);
          const sanitized = workers.filter((w) => !w.id.startsWith('worker-') && !['Sipho Moyo', 'Tendai Chideme', 'Blessing Ncube', 'Farai Gumbo', 'Nomsa Dube', 'Tatenda Ndlovu'].includes(w.name));
          localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify(sanitized));
        } catch {
          localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify([]));
        }
      } else {
        localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify([]));
      }

      // Sanitize gig requests
      const rawGigs = localStorage.getItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS);
      if (rawGigs) {
        try {
          const gigs: GigRequest[] = JSON.parse(rawGigs);
          const sanitized = gigs.filter((g) => !g.id.startsWith('gig-1') && !g.id.startsWith('gig-2') && !g.id.startsWith('gig-3'));
          localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(sanitized));
        } catch {
          localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify([]));
        }
      } else {
        localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify([]));
      }

      // Sanitize jobs: remove all legacy seeded mock vacancies
      const rawJobs = localStorage.getItem(PUBLIC_STORAGE_KEYS.JOBS);
      if (rawJobs) {
        try {
          const jobs: JobVacancy[] = JSON.parse(rawJobs);
          const sanitized = jobs.filter((j) => !['job-1', 'job-2', 'job-3', 'job-4', 'job-5', 'job-6'].includes(j.id));
          localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(sanitized));
        } catch {
          localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify([]));
        }
      } else {
        localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify([]));
      }

      // Scan all localStorage keys for old mock transactions, inventory, credits
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('comfort_hub')) {
          if (key.endsWith('_transactions')) {
            try {
              const txs: BusinessTransaction[] = JSON.parse(localStorage.getItem(key) || '[]');
              const sanitized = txs.filter((t) => !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id));
              localStorage.setItem(key, JSON.stringify(sanitized));
            } catch {}
          } else if (key.endsWith('_inventory')) {
            try {
              const inv: InventoryItem[] = JSON.parse(localStorage.getItem(key) || '[]');
              const sanitized = inv.filter((item) => !['inv-1', 'inv-2', 'inv-3'].includes(item.id));
              localStorage.setItem(key, JSON.stringify(sanitized));
            } catch {}
          } else if (key.endsWith('_credits')) {
            try {
              const creds: CustomerCredit[] = JSON.parse(localStorage.getItem(key) || '[]');
              const sanitized = creds.filter((c) => !['cred-1'].includes(c.id));
              localStorage.setItem(key, JSON.stringify(sanitized));
            } catch {}
          }
        }
      }

      localStorage.setItem('comfort_hub_clean_prod_v8_purged', 'true');
    } catch (e) {
      console.warn('Sample data purge failed:', e);
    }
  },

  /**
   * Seamlessly migrate guest actions (transactions, inventory, credits) to user account upon login
   */
  migrateGuestDataToUser(uid: string) {
    try {
      const guestTxKey = 'comfort_hub_guest_transactions';
      const guestTxsRaw = localStorage.getItem(guestTxKey);
      if (guestTxsRaw) {
        const guestTxs: BusinessTransaction[] = JSON.parse(guestTxsRaw);
        if (guestTxs.length > 0) {
          const userKey = `comfort_hub_user_${uid}_transactions`;
          const userTxsRaw = localStorage.getItem(userKey);
          const userTxs: BusinessTransaction[] = userTxsRaw ? JSON.parse(userTxsRaw) : [];
          const merged = [...guestTxs.map((t) => ({ ...t, userId: uid })), ...userTxs];
          localStorage.setItem(userKey, JSON.stringify(merged));
          localStorage.removeItem(guestTxKey);
          guestTxs.forEach((tx) => saveTransactionToFirestore(uid, { ...tx, userId: uid }));
        }
      }

      const guestInvKey = 'comfort_hub_guest_inventory';
      const guestInvRaw = localStorage.getItem(guestInvKey);
      if (guestInvRaw) {
        const guestInv: InventoryItem[] = JSON.parse(guestInvRaw);
        if (guestInv.length > 0) {
          const userKey = `comfort_hub_user_${uid}_inventory`;
          const userInvRaw = localStorage.getItem(userKey);
          const userInv: InventoryItem[] = userInvRaw ? JSON.parse(userInvRaw) : [];
          const merged = [...guestInv.map((item) => ({ ...item, userId: uid })), ...userInv];
          localStorage.setItem(userKey, JSON.stringify(merged));
          localStorage.removeItem(guestInvKey);
          guestInv.forEach((item) => saveInventoryItemToFirestore(uid, { ...item, userId: uid }));
        }
      }

      const guestCredKey = 'comfort_hub_guest_credits';
      const guestCredRaw = localStorage.getItem(guestCredKey);
      if (guestCredRaw) {
        const guestCreds: CustomerCredit[] = JSON.parse(guestCredRaw);
        if (guestCreds.length > 0) {
          const userKey = `comfort_hub_user_${uid}_credits`;
          const userCredRaw = localStorage.getItem(userKey);
          const userCreds: CustomerCredit[] = userCredRaw ? JSON.parse(userCredRaw) : [];
          const merged = [...guestCreds.map((c) => ({ ...c, userId: uid })), ...userCreds];
          localStorage.setItem(userKey, JSON.stringify(merged));
          localStorage.removeItem(guestCredKey);
          guestCreds.forEach((cred) => saveCustomerCreditToFirestore(uid, { ...cred, userId: uid }));
        }
      }
    } catch (e) {
      console.warn('Guest migration error:', e);
    }
  },

  /**
   * Sync active user's private data with Firestore
   */
  async syncUserDataWithCloud(uid: string) {
    if (!this.isEffectivelyOnline()) return;
    try {
      const [remoteTxs, remoteInv, remoteCredits] = await Promise.all([
        fetchTransactionsFromFirestore(uid),
        fetchInventoryFromFirestore(uid),
        fetchCustomerCreditsFromFirestore(uid)
      ]);

      const cleanTxs = remoteTxs.filter((t) => !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id));
      if (cleanTxs.length > 0) {
        const localTxs = this.getTransactions();
        const txMap = new Map<string, BusinessTransaction>();
        cleanTxs.forEach((t) => txMap.set(t.id, t));
        localTxs.forEach((t) => txMap.set(t.id, t));
        localStorage.setItem(`comfort_hub_user_${uid}_transactions`, JSON.stringify(Array.from(txMap.values())));
      }

      const cleanInv = remoteInv.filter((item) => !['inv-1', 'inv-2', 'inv-3'].includes(item.id));
      if (cleanInv.length > 0) {
        const localInv = this.getInventory();
        const invMap = new Map<string, InventoryItem>();
        cleanInv.forEach((i) => invMap.set(i.id, i));
        localInv.forEach((i) => invMap.set(i.id, i));
        localStorage.setItem(`comfort_hub_user_${uid}_inventory`, JSON.stringify(Array.from(invMap.values())));
      }

      const cleanCredits = remoteCredits.filter((c) => !['cred-1'].includes(c.id));
      if (cleanCredits.length > 0) {
        const localCreds = this.getCustomerCredits();
        const credMap = new Map<string, CustomerCredit>();
        cleanCredits.forEach((c) => credMap.set(c.id, c));
        localCreds.forEach((c) => credMap.set(c.id, c));
        localStorage.setItem(`comfort_hub_user_${uid}_credits`, JSON.stringify(Array.from(credMap.values())));
      }

      notifyListeners();
    } catch (e) {
      console.warn('User cloud sync error:', e);
    }
  },

  /**
   * Sync public artisans, gigs, and global user-created job vacancies from Firestore
   */
  async syncPublicDataWithCloud() {
    if (!this.isEffectivelyOnline()) return;
    try {
      const [remoteArtisans, remoteGigs, remoteJobs] = await Promise.all([
        fetchArtisansFromFirestore(),
        fetchGigRequestsFromFirestore(),
        fetchJobsFromFirestore()
      ]);

      const sampleNames = ['Sipho Moyo', 'Tendai Chideme', 'Blessing Ncube', 'Farai Gumbo', 'Nomsa Dube', 'Tatenda Ndlovu'];
      const cleanArtisans = remoteArtisans.filter((w) => !w.id.startsWith('worker-') && !sampleNames.includes(w.name));
      if (cleanArtisans.length > 0) {
        const localArtisans = this.getWorkers();
        const workerMap = new Map<string, GigWorker>();
        cleanArtisans.forEach((w) => workerMap.set(w.id, w));
        localArtisans.forEach((w) => workerMap.set(w.id, w));
        localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify(Array.from(workerMap.values())));
      }

      const cleanGigs = remoteGigs.filter((g) => !g.id.startsWith('gig-1') && !g.id.startsWith('gig-2') && !g.id.startsWith('gig-3'));
      if (cleanGigs.length > 0) {
        const localGigs = this.getGigRequests();
        const gigMap = new Map<string, GigRequest>();
        cleanGigs.forEach((g) => gigMap.set(g.id, g));
        localGigs.forEach((g) => gigMap.set(g.id, g));
        localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(Array.from(gigMap.values())));
      }

      const cleanJobs = remoteJobs.filter((j) => !['job-1', 'job-2', 'job-3', 'job-4', 'job-5', 'job-6'].includes(j.id));
      if (cleanJobs.length > 0) {
        const localJobs = this.getJobs();
        const jobMap = new Map<string, JobVacancy>();
        cleanJobs.forEach((j) => jobMap.set(j.id, j));
        localJobs.forEach((j) => jobMap.set(j.id, j));
        localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(Array.from(jobMap.values())));
      }

      notifyListeners();
    } catch (e) {
      console.warn('Public cloud sync error:', e);
    }
  },

  /**
   * Non-blocking background sync daemon.
   * Performs zero HTTP calls on startup to enable instant offline launch.
   * Periodically and when connectivity returns, silently syncs fresh data in the background.
   */
  setupBackgroundSyncDaemon() {
    if (typeof window === 'undefined') return;

    const runSilentSync = async () => {
      if (!this.isEffectivelyOnline()) return;
      try {
        await this.synchronizeNow();
      } catch (err) {
        // Silent catch in background
      }
    };

    // When connection is restored, trigger background sync
    window.addEventListener('online', () => {
      setTimeout(runSilentSync, 1200);
    });

    // Low-overhead periodic background check every 30s when tab is active
    setInterval(() => {
      if (document.visibilityState === 'visible' && this.isEffectivelyOnline()) {
        runSilentSync();
      }
    }, 30000);
  },

  init() {
    // Purge any stale development mock data
    this.purgeSampleData();

    // Restore active user session if stored
    const storedUser = localStorage.getItem(PUBLIC_STORAGE_KEYS.ACTIVE_USER_ID);
    if (storedUser) {
      currentUserId = storedUser;
    }

    if (!localStorage.getItem(PUBLIC_STORAGE_KEYS.APP_INITIALIZED)) {
      localStorage.setItem(PUBLIC_STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
      localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify([]));
      // Production ready: Start with zero seeded artisans and zero seeded gigs
      localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify([]));
      localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify([]));
      localStorage.setItem(PUBLIC_STORAGE_KEYS.CURRENCY, 'USD');
      localStorage.setItem(PUBLIC_STORAGE_KEYS.LANGUAGE, 'en');
      localStorage.setItem(PUBLIC_STORAGE_KEYS.APP_INITIALIZED, 'true');
    }

    // Set up silent, non-blocking background connection sync daemon (zero startup handshake)
    this.setupBackgroundSyncDaemon();
  },

  // ================= EMPLOYER KYC & ADMIN VERIFICATION =================
  submitEmployerKYC(kycData: {
    fullName: string;
    idNumber: string;
    idPhotoUrl: string;
    companyName: string;
    companyRegNumber?: string;
    cr14PhotoUrl?: string;
  }): EmployerKYC {
    const uid = this.getActiveUserId() || 'guest-user';
    const profile = this.getUserProfile();
    const newKYC: EmployerKYC = {
      id: `kyc-${uid}`,
      userId: uid,
      userEmail: profile.email || '',
      fullName: kycData.fullName,
      idNumber: kycData.idNumber,
      idPhotoUrl: kycData.idPhotoUrl,
      companyName: kycData.companyName,
      companyRegNumber: kycData.companyRegNumber,
      cr14PhotoUrl: kycData.cr14PhotoUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    localStorage.setItem(`comfort_hub_kyc_${uid}`, JSON.stringify(newKYC));

    this.saveUserProfile({
      ...profile,
      fullName: profile.fullName || kycData.fullName,
      employerKYCStatus: 'pending',
      employerKYC: newKYC
    });

    saveKYCApplicationToFirestore(newKYC);
    notifyListeners();
    return newKYC;
  },

  getEmployerKYC(userId?: string): EmployerKYC | null {
    const uid = userId || this.getActiveUserId();
    if (!uid) return null;
    const raw = localStorage.getItem(`comfort_hub_kyc_${uid}`);
    return raw ? JSON.parse(raw) : null;
  },

  async getAllKYCApplications(): Promise<EmployerKYC[]> {
    try {
      const remote = await fetchKYCApplicationsFromFirestore();
      if (remote.length > 0) return remote;
    } catch {}
    const list: EmployerKYC[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('comfort_hub_kyc_')) {
        try {
          const item = JSON.parse(localStorage.getItem(k) || '');
          if (item) list.push(item);
        } catch {}
      }
    }
    return list;
  },

  async reviewEmployerKYC(
    userId: string,
    status: 'verified' | 'rejected',
    reviewerEmail: string,
    reason?: string
  ): Promise<void> {
    await updateKYCStatusInFirestore(userId, status, reviewerEmail, reason);

    const localRaw = localStorage.getItem(`comfort_hub_kyc_${userId}`);
    if (localRaw) {
      try {
        const item: EmployerKYC = JSON.parse(localRaw);
        item.status = status;
        item.reviewedBy = reviewerEmail;
        item.reviewedAt = new Date().toISOString();
        item.rejectionReason = reason;
        localStorage.setItem(`comfort_hub_kyc_${userId}`, JSON.stringify(item));
      } catch {}
    }

    if (this.getActiveUserId() === userId) {
      const profile = this.getUserProfile();
      const updatedRoles = status === 'verified' && !profile.roles.includes('employer')
        ? [...profile.roles, 'employer' as const]
        : profile.roles;
      this.saveUserProfile({
        ...profile,
        roles: updatedRoles,
        isEmployerVerified: status === 'verified',
        employerKYCStatus: status
      });
    }

    notifyListeners();
  },

  initUserDataIfEmpty(uid: string) {
    const profileKey = `comfort_hub_user_${uid}_profile`;
    if (!localStorage.getItem(profileKey)) {
      const initialProfile: UserProfile = {
        id: uid,
        fullName: 'Member',
        phone: '',
        email: '',
        suburb: 'Bulawayo CBD',
        city: 'Bulawayo',
        headline: 'Comfort Skills Hub Member',
        bio: 'Artisan & small business member in Bulawayo',
        education: '',
        workExperience: '',
        skills: ['Customer Service', 'Basic Trades'],
        references: '',
        roles: ['learner', 'jobseeker', 'worker', 'business_owner'],
        isWorkerProfileActive: false
      };
      localStorage.setItem(profileKey, JSON.stringify(initialProfile));
      localStorage.setItem(`comfort_hub_user_${uid}_transactions`, JSON.stringify([]));
      localStorage.setItem(`comfort_hub_user_${uid}_inventory`, JSON.stringify([]));
      localStorage.setItem(`comfort_hub_user_${uid}_credits`, JSON.stringify([]));
      localStorage.setItem(`comfort_hub_user_${uid}_certificates`, JSON.stringify([]));
      localStorage.setItem(`comfort_hub_user_${uid}_applications`, JSON.stringify([]));
      localStorage.setItem(`comfort_hub_user_${uid}_progress`, JSON.stringify({}));
      localStorage.setItem(`comfort_hub_user_${uid}_sync_queue`, JSON.stringify([]));
    }
  },

  // ================= PUBLIC DATA: COURSES =================
  getCourses(): Course[] {
    const raw = localStorage.getItem(PUBLIC_STORAGE_KEYS.COURSES);
    return raw ? JSON.parse(raw) : INITIAL_COURSES;
  },

  saveCourses(courses: Course[]) {
    localStorage.setItem(PUBLIC_STORAGE_KEYS.COURSES, JSON.stringify(courses));
    notifyListeners();
  },

  toggleDownloadCourse(courseId: string): boolean {
    const courses = this.getCourses();
    let newState = false;
    const updated = courses.map((c) => {
      if (c.id === courseId) {
        newState = !c.isDownloaded;
        return { ...c, isDownloaded: newState };
      }
      return c;
    });
    this.saveCourses(updated);
    return newState;
  },

  // ================= PERSONAL DATA: COURSE PROGRESS =================
  getCourseProgress(courseId: string): CourseProgress | null {
    if (!this.isUserLoggedIn()) return null;
    const raw = localStorage.getItem(this.getUserKey('progress'));
    const allProgress: Record<string, CourseProgress> = raw ? JSON.parse(raw) : {};
    return allProgress[courseId] || null;
  },

  recordQuizResult(courseId: string, lessonId: string, scorePercent: number): { isPass: boolean; cert?: Certificate } {
    if (!this.isUserLoggedIn()) {
      return { isPass: scorePercent > 70 };
    }

    const raw = localStorage.getItem(this.getUserKey('progress'));
    const allProgress: Record<string, CourseProgress> = raw ? JSON.parse(raw) : {};
    const existing = allProgress[courseId] || {
      courseId,
      completedLessonIds: [],
      quizScores: {},
      highestScore: 0,
      isCertified: false
    };

    if (!existing.completedLessonIds.includes(lessonId)) {
      existing.completedLessonIds.push(lessonId);
    }
    existing.quizScores[lessonId] = scorePercent;
    if (scorePercent > existing.highestScore) {
      existing.highestScore = scorePercent;
    }

    let awardedCert: Certificate | undefined = undefined;
    // Requirement: Pass is more than 70%
    if (scorePercent > 70) {
      existing.isCertified = true;
      existing.certifiedAt = new Date().toISOString().split('T')[0];

      const course = this.getCourses().find((c) => c.id === courseId);
      if (course) {
        awardedCert = this.awardCertificate({
          courseId,
          courseTitle: course.title,
          recipientName: this.getUserProfile().fullName || 'Comfort Member',
          scorePercent
        });
      }
    }

    allProgress[courseId] = existing;
    localStorage.setItem(this.getUserKey('progress'), JSON.stringify(allProgress));
    notifyListeners();

    return { isPass: scorePercent > 70, cert: awardedCert };
  },

  // ================= PERSONAL DATA: CERTIFICATES =================
  getCertificates(): Certificate[] {
    if (!this.isUserLoggedIn()) return [];
    const raw = localStorage.getItem(this.getUserKey('certificates'));
    return raw ? JSON.parse(raw) : [];
  },

  awardCertificate(cert: Omit<Certificate, 'id' | 'dateEarned' | 'verificationCode'>): Certificate {
    if (!this.isUserLoggedIn()) {
      return {
        ...cert,
        id: `cert-${Date.now()}`,
        dateEarned: new Date().toISOString().split('T')[0],
        verificationCode: `ZW-BYO-${Math.floor(100000 + Math.random() * 900000)}`
      };
    }

    const certs = this.getCertificates();
    const existing = certs.find((c) => c.courseId === cert.courseId);
    if (existing) {
      if (cert.scorePercent > existing.scorePercent) {
        existing.scorePercent = cert.scorePercent;
        localStorage.setItem(this.getUserKey('certificates'), JSON.stringify(certs));
        notifyListeners();
      }
      return existing;
    }

    const newCert: Certificate = {
      ...cert,
      id: `cert-${Date.now()}`,
      userId: this.getActiveUserId() || undefined,
      dateEarned: new Date().toISOString().split('T')[0],
      verificationCode: `ZW-BYO-${Math.floor(100000 + Math.random() * 900000)}`
    };
    certs.unshift(newCert);
    localStorage.setItem(this.getUserKey('certificates'), JSON.stringify(certs));

    // Also auto-add acquired skill to user's profile
    const profile = this.getUserProfile();
    if (!profile.skills.includes(cert.courseTitle)) {
      profile.skills.push(cert.courseTitle);
      this.saveUserProfile(profile);
    }

    try {
      const cv = this.getCVDetails();
      const certEntry = `${newCert.courseTitle} Certificate (Earned ${newCert.dateEarned}, Score: ${newCert.scorePercent}%)`;
      if (!cv.customCertifications) cv.customCertifications = [];
      if (!cv.customCertifications.includes(certEntry)) {
        cv.customCertifications.push(certEntry);
        this.saveCVDetails(cv);
      }
    } catch (e) {
      console.warn('Could not auto-add cert to CV:', e);
    }

    notifyListeners();
    return newCert;
  },

  // ================= PUBLIC DATA: JOBS =================
  getJobs(): JobVacancy[] {
    const raw = localStorage.getItem(PUBLIC_STORAGE_KEYS.JOBS);
    if (!raw) return [];
    try {
      const jobs: JobVacancy[] = JSON.parse(raw);
      return jobs.filter((j) => !['job-1', 'job-2', 'job-3', 'job-4', 'job-5', 'job-6'].includes(j.id));
    } catch {
      return [];
    }
  },

  saveJob(job: Omit<JobVacancy, 'id' | 'postedDate' | 'syncStatus'>): JobVacancy {
    const jobs = this.getJobs();
    const isOnline = this.isEffectivelyOnline();
    const uid = this.getActiveUserId();
    const profile = this.getUserProfile();
    const newJob: JobVacancy = {
      ...job,
      id: `job-${Date.now()}`,
      postedBy: uid || undefined,
      postedByEmail: profile.email || undefined,
      isVerifiedEmployer: profile.isEmployerVerified || profile.roles.includes('employer') || false,
      postedDate: 'Just now',
      syncStatus: isOnline ? 'synced' : 'queued'
    };
    jobs.unshift(newJob);
    localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    // Save globally to Firestore
    saveJobToFirestore(newJob);

    if (!isOnline) {
      this.addToSyncQueue({
        id: `sync-job-${newJob.id}`,
        title: `Publish vacancy: ${newJob.title}`,
        entityType: 'vacancy',
        payload: newJob,
        createdAt: new Date().toISOString(),
        status: 'queued'
      });
    }

    notifyListeners();
    return newJob;
  },

  deleteJob(id: string): void {
    const jobs = this.getJobs().filter((j) => j.id !== id);
    localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    deleteJobFromFirestore(id);
    notifyListeners();
  },

  // ================= PERSONAL DATA: JOB APPLICATIONS =================
  getApplications(): JobApplication[] {
    if (!this.isUserLoggedIn()) return [];
    const raw = localStorage.getItem(this.getUserKey('applications'));
    return raw ? JSON.parse(raw) : [];
  },

  submitApplication(app: Omit<JobApplication, 'id' | 'appliedDate' | 'syncStatus' | 'status'>): JobApplication {
    const isOnline = this.isEffectivelyOnline();
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
      userId: this.getActiveUserId() || undefined,
      appliedDate: new Date().toISOString().split('T')[0],
      status: isOnline ? 'submitted' : 'queued',
      syncStatus: isOnline ? 'synced' : 'queued'
    };

    if (this.isUserLoggedIn()) {
      const apps = this.getApplications();
      apps.unshift(newApp);
      localStorage.setItem(this.getUserKey('applications'), JSON.stringify(apps));
    }

    if (!isOnline) {
      this.addToSyncQueue({
        id: `sync-app-${newApp.id}`,
        title: `Application for ${newApp.jobTitle}`,
        entityType: 'application',
        payload: newApp,
        createdAt: new Date().toISOString(),
        status: 'queued'
      });
    }

    notifyListeners();
    return newApp;
  },

  // ================= PUBLIC DATA: GIG WORKERS & ARTISANS =================
  getWorkers(): GigWorker[] {
    const raw = localStorage.getItem(PUBLIC_STORAGE_KEYS.WORKERS);
    if (!raw) return [];
    try {
      const workers: GigWorker[] = JSON.parse(raw);
      return workers.filter((w) => !w.id.startsWith('worker-') && !['Sipho Moyo', 'Tendai Chideme', 'Blessing Ncube', 'Farai Gumbo', 'Nomsa Dube', 'Tatenda Ndlovu'].includes(w.name));
    } catch {
      return [];
    }
  },

  saveWorker(worker: GigWorker) {
    const workers = this.getWorkers();
    const index = workers.findIndex((w) => w.id === worker.id);
    if (index >= 0) {
      workers[index] = worker;
    } else {
      workers.unshift(worker);
    }
    localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    notifyListeners();
  },

  deleteArtisan(id: string) {
    const workers = this.getWorkers().filter((w) => w.id !== id);
    localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    deleteArtisanFromFirestore(id);
    notifyListeners();
  },

  /**
   * Allow users to create artisan profiles with avatar and work showcase photos
   */
  createArtisanProfile(params: {
    name: string;
    serviceCategory: string;
    suburb: string;
    city?: string;
    pricingType?: 'Fixed' | 'Hourly' | 'Daily' | 'Quotation';
    baseRateText: string;
    phone: string;
    skills: string[];
    about: string;
    avatarUrl?: string;
    sampleWorkPhotos?: string[];
  }): GigWorker {
    const newWorker: GigWorker = {
      id: `artisan-${Date.now()}`,
      userId: this.getActiveUserId() || undefined,
      name: params.name.trim(),
      avatarUrl: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      serviceCategory: params.serviceCategory,
      suburb: params.suburb.trim(),
      city: params.city || 'Bulawayo',
      rating: 5.0,
      reviewsCount: 1,
      pricingType: params.pricingType || 'Quotation',
      baseRateText: params.baseRateText.trim(),
      isAvailableToday: true,
      isVerified: true,
      completedJobsCount: 0,
      phone: params.phone.trim(),
      skills: params.skills.length > 0 ? params.skills : [params.serviceCategory],
      about: params.about.trim(),
      sampleWorkPhotos: params.sampleWorkPhotos || []
    };

    this.saveWorker(newWorker);

    // If logged in, update current user's profile to activate artisan mode
    if (this.isUserLoggedIn()) {
      const profile = this.getUserProfile();
      this.saveUserProfile({
        ...profile,
        fullName: profile.fullName || newWorker.name,
        phone: profile.phone || newWorker.phone,
        suburb: profile.suburb || newWorker.suburb,
        isWorkerProfileActive: true,
        workerTrade: newWorker.serviceCategory,
        workerRate: newWorker.baseRateText,
        roles: profile.roles.includes('worker') ? profile.roles : [...profile.roles, 'worker']
      });
    }

    this.saveWorker(newWorker);
    saveArtisanToFirestore(newWorker);

    // If logged in, update current user's profile to activate artisan mode
    if (this.isUserLoggedIn()) {
      const profile = this.getUserProfile();
      this.saveUserProfile({
        ...profile,
        fullName: profile.fullName || newWorker.name,
        phone: profile.phone || newWorker.phone,
        suburb: profile.suburb || newWorker.suburb,
        isWorkerProfileActive: true,
        workerTrade: newWorker.serviceCategory,
        workerRate: newWorker.baseRateText,
        roles: profile.roles.includes('worker') ? profile.roles : [...profile.roles, 'worker']
      });
    }

    return newWorker;
  },

  // ================= PUBLIC DATA: GIG REQUESTS =================
  getGigRequests(): GigRequest[] {
    const raw = localStorage.getItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS);
    if (!raw) return [];
    try {
      const gigs: GigRequest[] = JSON.parse(raw);
      return gigs.filter((g) => !g.id.startsWith('gig-1') && !g.id.startsWith('gig-2') && !g.id.startsWith('gig-3'));
    } catch {
      return [];
    }
  },

  createGigRequest(req: Omit<GigRequest, 'id' | 'createdAt' | 'status' | 'syncStatus'>): GigRequest {
    const reqs = this.getGigRequests();
    const isOnline = this.isEffectivelyOnline();
    const newReq: GigRequest = {
      ...req,
      id: `gig-req-${Date.now()}`,
      status: 'requested',
      createdAt: new Date().toISOString().split('T')[0],
      syncStatus: isOnline ? 'synced' : 'queued'
    };
    reqs.unshift(newReq);
    localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(reqs));

    // Sync to Firestore
    saveGigRequestToFirestore(newReq);

    if (!isOnline) {
      this.addToSyncQueue({
        id: `sync-gig-${newReq.id}`,
        title: `Gig request: ${newReq.title}`,
        entityType: 'gig_request',
        payload: newReq,
        createdAt: new Date().toISOString(),
        status: 'queued'
      });
    }

    notifyListeners();
    return newReq;
  },

  updateGigRequestStatus(id: string, status: GigRequest['status'], quotedAmount?: number, review?: GigRequest['review']) {
    const reqs = this.getGigRequests();
    const updated = reqs.map((r) => {
      if (r.id === id) {
        const item: GigRequest = {
          ...r,
          status,
          quotedAmount: quotedAmount !== undefined ? quotedAmount : r.quotedAmount,
          review: review || r.review
        };
        saveGigRequestToFirestore(item);
        return item;
      }
      return r;
    });
    localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(updated));
    notifyListeners();
  },

  // ================= PERSONAL DATA: BUSINESS TRANSACTIONS =================
  getTransactions(): BusinessTransaction[] {
    const raw = localStorage.getItem(this.getUserKey('transactions'));
    if (!raw) return [];
    try {
      const txs: BusinessTransaction[] = JSON.parse(raw);
      return txs.filter((t) => !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id));
    } catch {
      return [];
    }
  },

  addTransaction(tx: Omit<BusinessTransaction, 'id' | 'syncStatus'>): BusinessTransaction {
    const uid = this.getActiveUserId();
    const isOnline = this.isEffectivelyOnline();
    const newTx: BusinessTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      userId: uid || undefined,
      syncStatus: (uid && isOnline) ? 'synced' : 'saved_locally'
    };

    const key = this.getUserKey('transactions');
    const txs = this.getTransactions();
    txs.unshift(newTx);
    localStorage.setItem(key, JSON.stringify(txs));

    // If related inventory item exists and it's a sale, reduce quantity
    if (newTx.type === 'sale' && newTx.relatedInventoryId) {
      const inv = this.getInventory();
      const updatedInv = inv.map((item) => {
        if (item.id === newTx.relatedInventoryId && item.quantity > 0) {
          const updatedItem = { ...item, quantity: item.quantity - 1, lastUpdated: new Date().toISOString().split('T')[0] };
          if (uid) {
            saveInventoryItemToFirestore(uid, updatedItem);
          }
          return updatedItem;
        }
        return item;
      });
      localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(updatedInv));
    }

    // Persist immediately to cloud if user is authenticated
    if (uid) {
      saveTransactionToFirestore(uid, newTx);
    }

    notifyListeners();
    return newTx;
  },

  deleteTransaction(id: string) {
    const uid = this.getActiveUserId();
    const txs = this.getTransactions().filter((t) => t.id !== id);
    localStorage.setItem(this.getUserKey('transactions'), JSON.stringify(txs));
    if (uid) {
      deleteTransactionFromFirestore(uid, id);
    }
    notifyListeners();
  },

  getTransactionAnalytics() {
    const txs = this.getTransactions();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const calcStats = (list: BusinessTransaction[]) => {
      const sales = list.filter((t) => t.type === 'sale' || t.type === 'gig_payment').reduce((s, t) => s + t.amount, 0);
      const expenses = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        sales,
        expenses,
        profit: sales - expenses,
        count: list.length
      };
    };

    const todayTxs = txs.filter((t) => t.date === todayStr);
    const weekTxs = txs.filter((t) => t.date >= sevenDaysAgo);
    const monthTxs = txs.filter((t) => t.date >= thirtyDaysAgo);

    // Group all transactions by Date for historical log breakdown
    const dayMap = new Map<string, BusinessTransaction[]>();
    txs.forEach((t) => {
      const d = t.date || todayStr;
      if (!dayMap.has(d)) dayMap.set(d, []);
      dayMap.get(d)!.push(t);
    });

    const dailyLogs = Array.from(dayMap.entries())
      .map(([date, items]) => {
        const stats = calcStats(items);
        return {
          date,
          sales: stats.sales,
          expenses: stats.expenses,
          profit: stats.profit,
          count: stats.count,
          transactions: items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      today: calcStats(todayTxs),
      week: calcStats(weekTxs),
      month: calcStats(monthTxs),
      allTime: calcStats(txs),
      dailyLogs,
      totalCount: txs.length
    };
  },

  // ================= PERSONAL DATA: INVENTORY =================
  getInventory(): InventoryItem[] {
    const raw = localStorage.getItem(this.getUserKey('inventory'));
    if (!raw) return [];
    try {
      const items: InventoryItem[] = JSON.parse(raw);
      return items.filter((item) => !['inv-1', 'inv-2', 'inv-3'].includes(item.id));
    } catch {
      return [];
    }
  },

  saveInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'> & { id?: string }): InventoryItem {
    const uid = this.getActiveUserId();
    const items = this.getInventory();
    if (item.id) {
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        const updated: InventoryItem = {
          ...item,
          id: item.id,
          userId: uid || undefined,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        items[index] = updated;
        localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(items));
        if (uid) {
          saveInventoryItemToFirestore(uid, updated);
        }
        notifyListeners();
        return updated;
      }
    }

    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      userId: uid || undefined,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(items));
    if (uid) {
      saveInventoryItemToFirestore(uid, newItem);
    }
    notifyListeners();
    return newItem;
  },

  deleteInventoryItem(id: string) {
    const uid = this.getActiveUserId();
    const items = this.getInventory().filter((i) => i.id !== id);
    localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(items));
    if (uid) {
      deleteInventoryItemFromFirestore(uid, id);
    }
    notifyListeners();
  },

  // ================= PERSONAL DATA: CUSTOMER CREDITS =================
  getCustomerCredits(): CustomerCredit[] {
    const raw = localStorage.getItem(this.getUserKey('credits'));
    if (!raw) return [];
    try {
      const credits: CustomerCredit[] = JSON.parse(raw);
      return credits.filter((c) => !['cred-1'].includes(c.id));
    } catch {
      return [];
    }
  },

  saveCustomerCredit(credit: Omit<CustomerCredit, 'id' | 'lastPurchaseDate'> & { id?: string }): CustomerCredit {
    const uid = this.getActiveUserId();
    const credits = this.getCustomerCredits();
    if (credit.id) {
      const index = credits.findIndex((c) => c.id === credit.id);
      if (index >= 0) {
        const updated: CustomerCredit = {
          ...credit,
          id: credit.id,
          userId: uid || undefined,
          lastPurchaseDate: new Date().toISOString().split('T')[0]
        };
        credits[index] = updated;
        localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
        if (uid) {
          saveCustomerCreditToFirestore(uid, updated);
        }
        notifyListeners();
        return updated;
      }
    }

    const newCred: CustomerCredit = {
      ...credit,
      id: `cred-${Date.now()}`,
      userId: uid || undefined,
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    };
    credits.unshift(newCred);
    localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
    if (uid) {
      saveCustomerCreditToFirestore(uid, newCred);
    }
    notifyListeners();
    return newCred;
  },

  recordCustomerPayment(creditId: string, paymentAmount: number) {
    const credits = this.getCustomerCredits();
    const cred = credits.find((c) => c.id === creditId);
    if (!cred) return;

    const uid = this.getActiveUserId();
    const remaining = Math.max(0, cred.amountOwed - paymentAmount);
    cred.amountOwed = remaining;
    localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
    if (uid) {
      saveCustomerCreditToFirestore(uid, cred);
    }

    // Record as incoming sale transaction
    this.addTransaction({
      type: 'sale',
      amount: paymentAmount,
      currency: cred.currency,
      category: 'Credit Payment',
      description: `Debt settlement from ${cred.customerName}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      customerOrSupplier: cred.customerName
    });

    notifyListeners();
  },

  deleteCustomerCredit(id: string) {
    const uid = this.getActiveUserId();
    const credits = this.getCustomerCredits().filter((c) => c.id !== id);
    localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
    if (uid) {
      deleteCustomerCreditFromFirestore(uid, id);
    }
    notifyListeners();
  },

  // ================= PERSONAL DATA: USER PROFILE =================
  getUserProfile(): UserProfile {
    if (!this.isUserLoggedIn()) return DEFAULT_USER_PROFILE;
    const raw = localStorage.getItem(this.getUserKey('profile'));
    return raw ? JSON.parse(raw) : DEFAULT_USER_PROFILE;
  },

  saveUserProfile(profile: UserProfile) {
    if (!this.isUserLoggedIn()) return;
    // Persist profile while preserving existing cvDetails if not explicitly overwritten
    const existing = this.getUserProfile();
    const toSave: UserProfile = {
      ...profile,
      cvDetails: profile.cvDetails || existing.cvDetails
    };
    localStorage.setItem(this.getUserKey('profile'), JSON.stringify(toSave));
    notifyListeners();
  },

  // ================= SEPARATE PROFESSIONAL CV DETAILS =================
  getCVDetails(): CVDetails {
    const profile = this.getUserProfile();
    const certificates = this.getCertificates();
    const certLabels = certificates.map((c) => `${c.courseTitle} Certificate (Earned ${c.dateEarned || '2026'}, Score: ${c.scorePercent}%)`);

    if (profile.cvDetails) {
      // Ensure newly earned course certificates are included without altering custom CV entries
      const existingCerts = new Set(profile.cvDetails.customCertifications || []);
      certLabels.forEach((cl) => existingCerts.add(cl));
      return {
        ...profile.cvDetails,
        customCertifications: Array.from(existingCerts)
      };
    }

    // Default baseline CV seeded automatically from Profile info & earned course certificates
    const baselineCV: CVDetails = {
      fullName: profile.fullName || 'Vocational Professional',
      phone: profile.phone || '+263 77 123 4567',
      email: profile.email || 'artisan@comfortskills.com',
      suburb: profile.suburb || 'Bulawayo CBD',
      city: profile.city || 'Bulawayo',
      headline: profile.headline || 'Certified Vocational Specialist & Technician',
      summary: profile.bio || 'Skilled, trustworthy artisan with hands-on technical training and certified competence.',
      driverLicense: profile.driverLicense || 'Class 4 (Clean)',
      languages: profile.languages && profile.languages.length > 0 ? profile.languages : ['English', 'Ndebele', 'Shona'],
      skills: profile.skills && profile.skills.length > 0 ? profile.skills : ['Electrical Installation', 'Preventative Maintenance', 'Fault Diagnosis'],
      experiences: profile.structuredExperiences && profile.structuredExperiences.length > 0 ? profile.structuredExperiences : [
        {
          id: 'exp-1',
          jobTitle: 'Independent Vocational Artisan',
          company: 'Self-Employed / Freelance',
          location: 'Bulawayo, Zimbabwe',
          startDate: '2023-01',
          endDate: 'Present',
          isCurrent: true,
          responsibilities: 'Delivered guaranteed trade services, repairs, and installations for local residential and commercial clients.'
        }
      ],
      educations: profile.structuredEducations && profile.structuredEducations.length > 0 ? profile.structuredEducations : [
        {
          id: 'edu-1',
          qualification: 'Vocational Skills & Practical Trades Certification',
          institution: 'Comfort Skills & Jobs Hub',
          yearCompleted: '2026',
          gradeOrDistinction: 'Certified with Distinction'
        }
      ],
      references: profile.structuredReferences && profile.structuredReferences.length > 0 ? profile.structuredReferences : [
        {
          id: 'ref-1',
          name: 'Tendai Moyo',
          jobTitle: 'Senior Trade Supervisor',
          company: 'Bulawayo Trade Works',
          phone: '+263 77 987 6543',
          relationship: 'Former Mentor & Supervisor'
        }
      ],
      customCertifications: [
        ...certLabels,
        ...(profile.customCertifications || [])
      ],
      template: profile.cvTemplate || 'modern_teal',
      lastSyncedWithProfile: new Date().toISOString()
    };

    return baselineCV;
  },

  saveCVDetails(cv: CVDetails) {
    const profile = this.getUserProfile();
    const updatedProfile: UserProfile = {
      ...profile,
      cvDetails: cv,
      cvTemplate: cv.template // keep template synchronized
    };
    localStorage.setItem(this.getUserKey('profile'), JSON.stringify(updatedProfile));
    notifyListeners();
  },

  syncProfileToCV(): CVDetails {
    const profile = this.getUserProfile();
    const currentCV = this.getCVDetails();
    const certificates = this.getCertificates();
    const certLabels = certificates.map((c) => `${c.courseTitle} Certificate (Earned ${c.dateEarned || '2026'}, Score: ${c.scorePercent}%)`);
    const allCerts = new Set([...certLabels, ...(currentCV.customCertifications || [])]);

    const updatedCV: CVDetails = {
      ...currentCV,
      fullName: profile.fullName || currentCV.fullName,
      phone: profile.phone || currentCV.phone,
      email: profile.email || currentCV.email,
      suburb: profile.suburb || currentCV.suburb,
      city: profile.city || currentCV.city,
      customCertifications: Array.from(allCerts),
      lastSyncedWithProfile: new Date().toISOString()
    };
    this.saveCVDetails(updatedCV);
    return updatedCV;
  },

  // ================= SYNC QUEUE & OUTBOX =================
  getSyncQueue(): SyncQueueItem[] {
    if (!this.isUserLoggedIn()) return [];
    const raw = localStorage.getItem(this.getUserKey('sync_queue'));
    return raw ? JSON.parse(raw) : [];
  },

  addToSyncQueue(item: SyncQueueItem) {
    if (!this.isUserLoggedIn()) return;
    const queue = this.getSyncQueue();
    queue.push(item);
    localStorage.setItem(this.getUserKey('sync_queue'), JSON.stringify(queue));
    notifyListeners();
  },

  clearSyncQueue() {
    if (!this.isUserLoggedIn()) return;
    localStorage.setItem(this.getUserKey('sync_queue'), JSON.stringify([]));
    notifyListeners();
  },

  // ================= FLIGHT MODE & PREFERENCES =================
  getIsForceOffline(): boolean {
    return localStorage.getItem(PUBLIC_STORAGE_KEYS.FORCE_OFFLINE) === 'true';
  },

  setForceOffline(val: boolean) {
    localStorage.setItem(PUBLIC_STORAGE_KEYS.FORCE_OFFLINE, val ? 'true' : 'false');
    notifyListeners();
  },

  isEffectivelyOnline(): boolean {
    if (this.getIsForceOffline()) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  getPreferredCurrency(): 'USD' | 'ZiG' {
    return (localStorage.getItem(PUBLIC_STORAGE_KEYS.CURRENCY) as 'USD' | 'ZiG') || 'USD';
  },

  setPreferredCurrency(c: 'USD' | 'ZiG') {
    localStorage.setItem(PUBLIC_STORAGE_KEYS.CURRENCY, c);
    notifyListeners();
  },

  getPreferredLanguage(): 'en' | 'nd' | 'sn' {
    return (localStorage.getItem(PUBLIC_STORAGE_KEYS.LANGUAGE) as 'en' | 'nd' | 'sn') || 'en';
  },

  setPreferredLanguage(l: 'en' | 'nd' | 'sn') {
    localStorage.setItem(PUBLIC_STORAGE_KEYS.LANGUAGE, l);
    notifyListeners();
  },

  async synchronizeNow(): Promise<{ syncedCount: number; message: string }> {
    const queue = this.getSyncQueue();
    const count = queue.length;
    const uid = this.getActiveUserId();

    // 1. Sync public data with cloud
    await this.syncPublicDataWithCloud();

    // 2. If user is logged in, sync user private data with cloud
    if (uid) {
      // Push any locally saved transactions
      const localTxs = this.getTransactions();
      const unsyncedTxs = localTxs.filter((t) => t.syncStatus === 'saved_locally');
      for (const tx of unsyncedTxs) {
        await saveTransactionToFirestore(uid, { ...tx, syncStatus: 'synced' });
      }
      const updatedTxs = localTxs.map((t) => ({ ...t, syncStatus: 'synced' as const }));
      localStorage.setItem(this.getUserKey('transactions'), JSON.stringify(updatedTxs));

      // Push any inventory
      const localInv = this.getInventory();
      for (const item of localInv) {
        await saveInventoryItemToFirestore(uid, item);
      }

      // Push any credits
      const localCredits = this.getCustomerCredits();
      for (const cred of localCredits) {
        await saveCustomerCreditToFirestore(uid, cred);
      }

      // Pull fresh data from cloud
      await this.syncUserDataWithCloud(uid);

      this.clearSyncQueue();
    }

    notifyListeners();
    return {
      syncedCount: count,
      message: 'Cloud sync complete. Database and offline cache are fully synchronized.'
    };
  },

  calculateStorageUsage(): { totalKb: number; courseCount: number; txCount: number } {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('comfort_hub')) {
        const val = localStorage.getItem(key) || '';
        totalBytes += key.length + val.length;
      }
    }
    return {
      totalKb: Math.round(totalBytes / 1024),
      courseCount: this.getCourses().filter((c) => c.isDownloaded).length,
      txCount: this.getTransactions().length
    };
  },

  exportDatabaseJson(): string {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('comfort_hub')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    return JSON.stringify(backup, null, 2);
  },

  exportBackupJSON(): string {
    return this.exportDatabaseJson();
  },

  restoreDatabaseFromJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;
      Object.keys(data).forEach((key) => {
        if (key.startsWith('comfort_hub')) {
          const val = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
          localStorage.setItem(key, val);
        }
      });
      notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON:', e);
      return false;
    }
  },

  restoreBackupJSON(jsonString: string): boolean {
    return this.restoreDatabaseFromJson(jsonString);
  },

  /**
   * Reset / Wipe all user related data and transactions for complete user data control and integrity.
   * Cleans personal transactions, inventory items, customer credit ledgers, job applications,
   * course progress, certificates, and outbox sync queue.
   */
  async wipeUserData(): Promise<void> {
    const uid = this.getActiveUserId();

    // 1. Wipe local user and guest keys
    const prefixes = [
      'comfort_hub_guest_',
      uid ? `comfort_hub_user_${uid}_` : ''
    ].filter(Boolean);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && prefixes.some((p) => key.startsWith(p))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 2. Clear out in Firestore if logged in and online
    if (uid && this.isEffectivelyOnline()) {
      try {
        const [txs, inv, creds] = await Promise.all([
          fetchTransactionsFromFirestore(uid),
          fetchInventoryFromFirestore(uid),
          fetchCustomerCreditsFromFirestore(uid)
        ]);

        await Promise.all([
          ...txs.map((t) => deleteTransactionFromFirestore(uid, t.id)),
          ...inv.map((i) => deleteInventoryItemFromFirestore(uid, i.id)),
          ...creds.map((c) => deleteCustomerCreditFromFirestore(uid, c.id))
        ]);

        await saveUserProfileToFirestore(uid, {
          fullName: 'Member',
          phone: '',
          email: '',
          suburb: 'Bulawayo CBD',
          city: 'Bulawayo',
          headline: 'Comfort Skills Hub Member',
          bio: '',
          education: '',
          workExperience: '',
          skills: [],
          references: '',
          roles: ['learner', 'jobseeker', 'worker', 'business_owner'],
          isWorkerProfileActive: false,
          avatarUrl: '',
          cvTemplate: 'modern_teal',
          structuredExperiences: [],
          structuredEducations: [],
          structuredReferences: []
        });
      } catch (e) {
        console.warn('Remote wipe failed:', e);
      }
    }

    // 3. Re-initialize empty containers so views render pristine without error
    if (uid) {
      this.initUserDataIfEmpty(uid);
    }

    notifyListeners();
  },

  resetToDefault() {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('comfort_hub')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    this.init();
    notifyListeners();
  }
};

// Initialize default public tables immediately
StorageEngine.init();
