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
  CourseProgress 
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
  saveGigRequestToFirestore,
  fetchGigRequestsFromFirestore
} from '../firebase';

const PUBLIC_STORAGE_KEYS = {
  COURSES: 'comfort_hub_courses_v3',
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

      localStorage.setItem('comfort_hub_clean_prod_v6_purged', 'true');
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

      if (remoteTxs.length > 0) {
        const localTxs = this.getTransactions();
        const txMap = new Map<string, BusinessTransaction>();
        remoteTxs.forEach((t) => txMap.set(t.id, t));
        localTxs.forEach((t) => txMap.set(t.id, t));
        localStorage.setItem(`comfort_hub_user_${uid}_transactions`, JSON.stringify(Array.from(txMap.values())));
      }

      if (remoteInv.length > 0) {
        const localInv = this.getInventory();
        const invMap = new Map<string, InventoryItem>();
        remoteInv.forEach((i) => invMap.set(i.id, i));
        localInv.forEach((i) => invMap.set(i.id, i));
        localStorage.setItem(`comfort_hub_user_${uid}_inventory`, JSON.stringify(Array.from(invMap.values())));
      }

      if (remoteCredits.length > 0) {
        const localCreds = this.getCustomerCredits();
        const credMap = new Map<string, CustomerCredit>();
        remoteCredits.forEach((c) => credMap.set(c.id, c));
        localCreds.forEach((c) => credMap.set(c.id, c));
        localStorage.setItem(`comfort_hub_user_${uid}_credits`, JSON.stringify(Array.from(credMap.values())));
      }

      notifyListeners();
    } catch (e) {
      console.warn('User cloud sync error:', e);
    }
  },

  /**
   * Sync public artisans and gigs from Firestore
   */
  async syncPublicDataWithCloud() {
    if (!this.isEffectivelyOnline()) return;
    try {
      const [remoteArtisans, remoteGigs] = await Promise.all([
        fetchArtisansFromFirestore(),
        fetchGigRequestsFromFirestore()
      ]);

      if (remoteArtisans.length > 0) {
        const localArtisans = this.getWorkers();
        const workerMap = new Map<string, GigWorker>();
        remoteArtisans.forEach((w) => workerMap.set(w.id, w));
        localArtisans.forEach((w) => workerMap.set(w.id, w));
        localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify(Array.from(workerMap.values())));
      }

      if (remoteGigs.length > 0) {
        const localGigs = this.getGigRequests();
        const gigMap = new Map<string, GigRequest>();
        remoteGigs.forEach((g) => gigMap.set(g.id, g));
        localGigs.forEach((g) => gigMap.set(g.id, g));
        localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(Array.from(gigMap.values())));
      }

      notifyListeners();
    } catch (e) {
      console.warn('Public cloud sync error:', e);
    }
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
      localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
      // Production ready: Start with zero seeded artisans and zero seeded gigs
      localStorage.setItem(PUBLIC_STORAGE_KEYS.WORKERS, JSON.stringify([]));
      localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify([]));
      localStorage.setItem(PUBLIC_STORAGE_KEYS.CURRENCY, 'USD');
      localStorage.setItem(PUBLIC_STORAGE_KEYS.LANGUAGE, 'en');
      localStorage.setItem(PUBLIC_STORAGE_KEYS.APP_INITIALIZED, 'true');
    }

    // Trigger cloud synchronization of public data in background
    this.syncPublicDataWithCloud();
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

    notifyListeners();
    return newCert;
  },

  // ================= PUBLIC DATA: JOBS =================
  getJobs(): JobVacancy[] {
    const raw = localStorage.getItem(PUBLIC_STORAGE_KEYS.JOBS);
    return raw ? JSON.parse(raw) : INITIAL_JOBS;
  },

  saveJob(job: Omit<JobVacancy, 'id' | 'postedDate' | 'syncStatus'>): JobVacancy {
    const jobs = this.getJobs();
    const isOnline = this.isEffectivelyOnline();
    const newJob: JobVacancy = {
      ...job,
      id: `job-${Date.now()}`,
      postedDate: 'Just now',
      syncStatus: isOnline ? 'synced' : 'queued'
    };
    jobs.unshift(newJob);
    localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(jobs));

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
    localStorage.setItem(this.getUserKey('profile'), JSON.stringify(profile));
    notifyListeners();
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
