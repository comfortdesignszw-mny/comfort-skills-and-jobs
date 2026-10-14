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
  SyncQueueItem 
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

const STORAGE_KEYS = {
  COURSES: 'comfort_hub_courses_v1',
  JOBS: 'comfort_hub_jobs_v1',
  APPLICATIONS: 'comfort_hub_applications_v1',
  WORKERS: 'comfort_hub_workers_v1',
  GIG_REQUESTS: 'comfort_hub_gig_requests_v1',
  TRANSACTIONS: 'comfort_hub_transactions_v1',
  INVENTORY: 'comfort_hub_inventory_v1',
  CREDITS: 'comfort_hub_credits_v1',
  USER_PROFILE: 'comfort_hub_user_profile_v1',
  CERTIFICATES: 'comfort_hub_certificates_v1',
  SYNC_QUEUE: 'comfort_hub_sync_queue_v1',
  FORCE_OFFLINE: 'comfort_hub_force_offline_mode',
  CURRENCY: 'comfort_hub_preferred_currency',
  LANGUAGE: 'comfort_hub_preferred_lang',
  APP_INITIALIZED: 'comfort_hub_is_initialized'
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export const StorageEngine = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.APP_INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify([
        {
          id: 'app-sample-1',
          jobId: 'job-2',
          jobTitle: 'Smartphone & Tablet Repair Technician',
          companyName: 'Bulawayo Digital Spares Hub',
          applicantName: 'Comfort Nyoni',
          phone: '+263 77 412 8901',
          email: 'comfort.nyoni@example.com',
          coverNote: 'I have 2 years of hands-on experience replacing Android screens and fixing charging ports. Completed Comfort Hub Phone Repair module.',
          appliedDate: '2026-10-13',
          status: 'submitted',
          syncStatus: 'synced'
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(INITIAL_GIG_WORKERS));
      localStorage.setItem(STORAGE_KEYS.GIG_REQUESTS, JSON.stringify([
        {
          id: 'req-sample-1',
          title: 'Fix tripping breaker and install solar inverter switch',
          category: 'Plumbing & electrical work',
          customerName: 'Gogo Sibanda',
          customerPhone: '+263 71 223 9988',
          suburb: 'Morningside, Bulawayo',
          budget: '$30 - $40',
          preferredDate: '2026-10-15',
          description: 'Our kitchen lights trip whenever the geyser switches on. Need an electrician to inspect circuit breaker.',
          status: 'accepted',
          assignedWorkerId: 'worker-1',
          assignedWorkerName: 'Sipho Moyo',
          quotedAmount: 35,
          quotedCurrency: 'USD',
          createdAt: '2026-10-13',
          syncStatus: 'synced'
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
      localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(INITIAL_CUSTOMER_CREDITS));
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CURRENCY, 'USD');
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'en');
      localStorage.setItem(STORAGE_KEYS.APP_INITIALIZED, 'true');
    }
  },

  // Courses
  getCourses(): Course[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    return raw ? JSON.parse(raw) : INITIAL_COURSES;
  },

  saveCourses(courses: Course[]) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
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

  // Certificates
  getCertificates(): Certificate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return raw ? JSON.parse(raw) : [];
  },

  awardCertificate(cert: Omit<Certificate, 'id' | 'dateEarned' | 'verificationCode'>): Certificate {
    const certs = this.getCertificates();
    const existing = certs.find((c) => c.courseId === cert.courseId);
    if (existing) {
      return existing;
    }
    const newCert: Certificate = {
      ...cert,
      id: `cert-${Date.now()}`,
      dateEarned: new Date().toISOString().split('T')[0],
      verificationCode: `ZW-BYO-${Math.floor(100000 + Math.random() * 900000)}`
    };
    certs.unshift(newCert);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
    
    // Also auto-add acquired skill to user's profile
    const profile = this.getUserProfile();
    if (!profile.skills.includes(cert.courseTitle)) {
      profile.skills.push(cert.courseTitle);
      this.saveUserProfile(profile);
    }

    notifyListeners();
    return newCert;
  },

  // Jobs
  getJobs(): JobVacancy[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
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
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));

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

  // Applications
  getApplications(): JobApplication[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return raw ? JSON.parse(raw) : [];
  },

  submitApplication(app: Omit<JobApplication, 'id' | 'appliedDate' | 'syncStatus' | 'status'>): JobApplication {
    const apps = this.getApplications();
    const isOnline = this.isEffectivelyOnline();
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: isOnline ? 'submitted' : 'queued',
      syncStatus: isOnline ? 'synced' : 'queued'
    };
    apps.unshift(newApp);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

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

  // Gig Workers
  getWorkers(): GigWorker[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKERS);
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
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    notifyListeners();
  },

  // Gig Requests
  getGigRequests(): GigRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GIG_REQUESTS);
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
    localStorage.setItem(STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(reqs));

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
    localStorage.setItem(STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(updated));
    notifyListeners();
  },

  // Business Transactions
  getTransactions(): BusinessTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
  },

  addTransaction(tx: Omit<BusinessTransaction, 'id' | 'syncStatus'>): BusinessTransaction {
    const txs = this.getTransactions();
    const isOnline = this.isEffectivelyOnline();
    const newTx: BusinessTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      syncStatus: isOnline ? 'synced' : 'saved_locally'
    };
    txs.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    // If related inventory item exists and it's a sale, reduce quantity
    if (newTx.type === 'sale' && newTx.relatedInventoryId) {
      const inv = this.getInventory();
      const updatedInv = inv.map((item) => {
        if (item.id === newTx.relatedInventoryId && item.quantity > 0) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(updatedInv));
    }

    notifyListeners();
    return newTx;
  },

  deleteTransaction(id: string) {
    const txs = this.getTransactions().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    notifyListeners();
  },

  // Inventory
  getInventory(): InventoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return raw ? JSON.parse(raw) : INITIAL_INVENTORY;
  },

  saveInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'> & { id?: string }): InventoryItem {
    const items = this.getInventory();
    if (item.id) {
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        const updated: InventoryItem = {
          ...item,
          id: item.id,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        items[index] = updated;
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
        notifyListeners();
        return updated;
      }
    }

    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    notifyListeners();
    return newItem;
  },

  deleteInventoryItem(id: string) {
    const items = this.getInventory().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    notifyListeners();
  },

  // Customer Credits
  getCustomerCredits(): CustomerCredit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDITS);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMER_CREDITS;
  },

  saveCustomerCredit(credit: Omit<CustomerCredit, 'id' | 'lastPurchaseDate'> & { id?: string }): CustomerCredit {
    const credits = this.getCustomerCredits();
    if (credit.id) {
      const index = credits.findIndex((c) => c.id === credit.id);
      if (index >= 0) {
        const updated: CustomerCredit = {
          ...credit,
          id: credit.id,
          lastPurchaseDate: new Date().toISOString().split('T')[0]
        };
        credits[index] = updated;
        localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits));
        notifyListeners();
        return updated;
      }
    }

    const newCred: CustomerCredit = {
      ...credit,
      id: `cred-${Date.now()}`,
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    };
    credits.unshift(newCred);
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits));
    notifyListeners();
    return newCred;
  },

  recordCustomerPayment(creditId: string, paymentAmount: number) {
    const credits = this.getCustomerCredits();
    const cred = credits.find((c) => c.id === creditId);
    if (!cred) return;

    const remaining = Math.max(0, cred.amountOwed - paymentAmount);
    if (remaining === 0) {
      // Clear credit or keep as 0
      cred.amountOwed = 0;
    } else {
      cred.amountOwed = remaining;
    }
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits));

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
    const credits = this.getCustomerCredits().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits));
    notifyListeners();
  },

  // User Profile
  getUserProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_USER_PROFILE;
  },

  saveUserProfile(profile: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    notifyListeners();
  },

  // Sync Queue & Outbox
  getSyncQueue(): SyncQueueItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },

  addToSyncQueue(item: SyncQueueItem) {
    const queue = this.getSyncQueue();
    queue.push(item);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    notifyListeners();
  },

  clearSyncQueue() {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    notifyListeners();
  },

  // Flight Mode / Offline Simulator
  getIsForceOffline(): boolean {
    return localStorage.getItem(STORAGE_KEYS.FORCE_OFFLINE) === 'true';
  },

  setForceOffline(val: boolean) {
    localStorage.setItem(STORAGE_KEYS.FORCE_OFFLINE, val ? 'true' : 'false');
    notifyListeners();
  },

  isEffectivelyOnline(): boolean {
    if (this.getIsForceOffline()) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  // Simulate Cloud Sync
  async synchronizeNow(): Promise<{ syncedCount: number; message: string }> {
    const queue = this.getSyncQueue();
    const count = queue.length;
    
    // Simulate brief network latency for realism
    await new Promise((r) => setTimeout(r, 600));

    // Mark queued items as synced
    const apps = this.getApplications().map((a) => (a.syncStatus === 'queued' ? { ...a, syncStatus: 'synced' as const, status: 'submitted' as const } : a));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    const gigs = this.getGigRequests().map((g) => (g.syncStatus === 'queued' ? { ...g, syncStatus: 'synced' as const } : g));
    localStorage.setItem(STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(gigs));

    const txs = this.getTransactions().map((t) => (t.syncStatus === 'saved_locally' ? { ...t, syncStatus: 'synced' as const } : t));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

    const jobs = this.getJobs().map((j) => (j.syncStatus === 'queued' ? { ...j, syncStatus: 'synced' as const } : j));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    this.clearSyncQueue();
    notifyListeners();

    return {
      syncedCount: count,
      message: count > 0 ? `Successfully synchronized ${count} offline updates with Zimbabwe server.` : 'Device database is already up to date.'
    };
  },

  // Currency & Language
  getPreferredCurrency(): 'USD' | 'ZiG' {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as 'USD' | 'ZiG') || 'USD';
  },

  setPreferredCurrency(curr: 'USD' | 'ZiG') {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    notifyListeners();
  },

  getPreferredLanguage(): 'en' | 'nd' | 'sn' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'en' | 'nd' | 'sn') || 'en';
  },

  setPreferredLanguage(lang: 'en' | 'nd' | 'sn') {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    notifyListeners();
  },

  // Storage Stats (in KB)
  calculateStorageUsage(): { totalKb: number; courseCount: number; txCount: number } {
    let totalChars = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const val = localStorage.getItem(key);
      if (val) totalChars += val.length;
    }
    const totalKb = Math.round((totalChars * 2) / 1024); // approx UTF-16
    return {
      totalKb: totalKb || 42,
      courseCount: this.getCourses().filter((c) => c.isDownloaded).length,
      txCount: this.getTransactions().length
    };
  },

  // Backup & Restore
  exportBackupJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'Comfort Skills & Jobs Hub',
      location: 'Bulawayo, Zimbabwe',
      data: {
        courses: this.getCourses(),
        jobs: this.getJobs(),
        applications: this.getApplications(),
        workers: this.getWorkers(),
        gigRequests: this.getGigRequests(),
        transactions: this.getTransactions(),
        inventory: this.getInventory(),
        customerCredits: this.getCustomerCredits(),
        userProfile: this.getUserProfile(),
        certificates: this.getCertificates()
      }
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) return false;

      if (parsed.data.courses) localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(parsed.data.courses));
      if (parsed.data.jobs) localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(parsed.data.jobs));
      if (parsed.data.applications) localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(parsed.data.applications));
      if (parsed.data.workers) localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(parsed.data.workers));
      if (parsed.data.gigRequests) localStorage.setItem(STORAGE_KEYS.GIG_REQUESTS, JSON.stringify(parsed.data.gigRequests));
      if (parsed.data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.data.transactions));
      if (parsed.data.inventory) localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(parsed.data.inventory));
      if (parsed.data.customerCredits) localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(parsed.data.customerCredits));
      if (parsed.data.userProfile) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(parsed.data.userProfile));
      if (parsed.data.certificates) localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(parsed.data.certificates));

      notifyListeners();
      return true;
    } catch {
      return false;
    }
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.APP_INITIALIZED);
    this.init();
    notifyListeners();
  }
};

// Initialize on load
StorageEngine.init();
