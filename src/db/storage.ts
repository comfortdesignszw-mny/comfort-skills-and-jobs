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

const PUBLIC_STORAGE_KEYS = {
  COURSES: 'comfort_hub_courses_v3',
  JOBS: 'comfort_hub_jobs_v3',
  WORKERS: 'comfort_hub_workers_v3',
  GIG_REQUESTS: 'comfort_hub_gig_requests_v3',
  FORCE_OFFLINE: 'comfort_hub_force_offline_mode',
  CURRENCY: 'comfort_hub_preferred_currency',
  LANGUAGE: 'comfort_hub_preferred_lang',
  APP_INITIALIZED: 'comfort_hub_is_initialized_v3',
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

  init() {
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
    return raw ? JSON.parse(raw) : INITIAL_GIG_WORKERS;
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
   * Requirement 3: Allow users to create artisan profiles from Work >> Gigs
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
      sampleWorkPhotos: []
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

    return newWorker;
  },

  // ================= PUBLIC DATA: GIG REQUESTS =================
  getGigRequests(): GigRequest[] {
    const raw = localStorage.getItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS);
    return raw ? JSON.parse(raw) : [];
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
        return {
          ...r,
          status,
          quotedAmount: quotedAmount !== undefined ? quotedAmount : r.quotedAmount,
          review: review || r.review
        };
      }
      return r;
    });
    localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(updated));
    notifyListeners();
  },

  // ================= PERSONAL DATA: BUSINESS TRANSACTIONS =================
  getTransactions(): BusinessTransaction[] {
    if (!this.isUserLoggedIn()) return [];
    const raw = localStorage.getItem(this.getUserKey('transactions'));
    return raw ? JSON.parse(raw) : [];
  },

  addTransaction(tx: Omit<BusinessTransaction, 'id' | 'syncStatus'>): BusinessTransaction {
    const isOnline = this.isEffectivelyOnline();
    const newTx: BusinessTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      userId: this.getActiveUserId() || undefined,
      syncStatus: isOnline ? 'synced' : 'saved_locally'
    };

    if (this.isUserLoggedIn()) {
      const txs = this.getTransactions();
      txs.unshift(newTx);
      localStorage.setItem(this.getUserKey('transactions'), JSON.stringify(txs));

      // If related inventory item exists and it's a sale, reduce quantity
      if (newTx.type === 'sale' && newTx.relatedInventoryId) {
        const inv = this.getInventory();
        const updatedInv = inv.map((item) => {
          if (item.id === newTx.relatedInventoryId && item.quantity > 0) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });
        localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(updatedInv));
      }
    }

    notifyListeners();
    return newTx;
  },

  deleteTransaction(id: string) {
    if (!this.isUserLoggedIn()) return;
    const txs = this.getTransactions().filter((t) => t.id !== id);
    localStorage.setItem(this.getUserKey('transactions'), JSON.stringify(txs));
    notifyListeners();
  },

  // ================= PERSONAL DATA: INVENTORY =================
  getInventory(): InventoryItem[] {
    if (!this.isUserLoggedIn()) return [];
    const raw = localStorage.getItem(this.getUserKey('inventory'));
    return raw ? JSON.parse(raw) : [];
  },

  saveInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'> & { id?: string }): InventoryItem {
    if (!this.isUserLoggedIn()) {
      return {
        ...item,
        id: `inv-${Date.now()}`,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }

    const items = this.getInventory();
    if (item.id) {
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        const updated: InventoryItem = {
          ...item,
          id: item.id,
          userId: this.getActiveUserId() || undefined,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        items[index] = updated;
        localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(items));
        notifyListeners();
        return updated;
      }
    }

    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      userId: this.getActiveUserId() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(items));
    notifyListeners();
    return newItem;
  },

  deleteInventoryItem(id: string) {
    if (!this.isUserLoggedIn()) return;
    const items = this.getInventory().filter((i) => i.id !== id);
    localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(items));
    notifyListeners();
  },

  // ================= PERSONAL DATA: CUSTOMER CREDITS =================
  getCustomerCredits(): CustomerCredit[] {
    if (!this.isUserLoggedIn()) return [];
    const raw = localStorage.getItem(this.getUserKey('credits'));
    return raw ? JSON.parse(raw) : [];
  },

  saveCustomerCredit(credit: Omit<CustomerCredit, 'id' | 'lastPurchaseDate'> & { id?: string }): CustomerCredit {
    if (!this.isUserLoggedIn()) {
      return {
        ...credit,
        id: `cred-${Date.now()}`,
        lastPurchaseDate: new Date().toISOString().split('T')[0]
      };
    }

    const credits = this.getCustomerCredits();
    if (credit.id) {
      const index = credits.findIndex((c) => c.id === credit.id);
      if (index >= 0) {
        const updated: CustomerCredit = {
          ...credit,
          id: credit.id,
          userId: this.getActiveUserId() || undefined,
          lastPurchaseDate: new Date().toISOString().split('T')[0]
        };
        credits[index] = updated;
        localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
        notifyListeners();
        return updated;
      }
    }

    const newCred: CustomerCredit = {
      ...credit,
      id: `cred-${Date.now()}`,
      userId: this.getActiveUserId() || undefined,
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    };
    credits.unshift(newCred);
    localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
    notifyListeners();
    return newCred;
  },

  recordCustomerPayment(creditId: string, paymentAmount: number) {
    if (!this.isUserLoggedIn()) return;
    const credits = this.getCustomerCredits();
    const cred = credits.find((c) => c.id === creditId);
    if (!cred) return;

    const remaining = Math.max(0, cred.amountOwed - paymentAmount);
    cred.amountOwed = remaining;
    localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));

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
    if (!this.isUserLoggedIn()) return;
    const credits = this.getCustomerCredits().filter((c) => c.id !== id);
    localStorage.setItem(this.getUserKey('credits'), JSON.stringify(credits));
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
    await new Promise((r) => setTimeout(r, 600));

    if (this.isUserLoggedIn()) {
      const apps = this.getApplications().map((a) => (a.syncStatus === 'queued' ? { ...a, syncStatus: 'synced' as const, status: 'submitted' as const } : a));
      localStorage.setItem(this.getUserKey('applications'), JSON.stringify(apps));

      const txs = this.getTransactions().map((t) => (t.syncStatus === 'saved_locally' ? { ...t, syncStatus: 'synced' as const } : t));
      localStorage.setItem(this.getUserKey('transactions'), JSON.stringify(txs));

      this.clearSyncQueue();
    }

    const gigs = this.getGigRequests().map((g) => (g.syncStatus === 'queued' ? { ...g, syncStatus: 'synced' as const } : g));
    localStorage.setItem(PUBLIC_STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(gigs));

    const jobs = this.getJobs().map((j) => (j.syncStatus === 'queued' ? { ...j, syncStatus: 'synced' as const } : j));
    localStorage.setItem(PUBLIC_STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    notifyListeners();
    return {
      syncedCount: count,
      message: count > 0 ? `Successfully synchronized ${count} offline updates with Zimbabwe server.` : 'Device database is already up to date.'
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
