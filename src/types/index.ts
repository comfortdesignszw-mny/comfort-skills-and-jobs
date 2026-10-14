/**
 * Data models for Comfort Skills & Jobs Hub
 * Offline-first architecture for Zimbabwe & Bulawayo
 */

export type CurrencyType = 'USD' | 'ZiG';
export type LanguageType = 'en' | 'nd' | 'sn'; // English, isiNdebele, chiShona

export type SyncState = 'saved_locally' | 'queued' | 'synced' | 'failed';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  storageMb: number;
  content: string[]; // Step by step practical instructions
  practicalTip: string;
  audioSummary?: string;
  quiz?: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  category: 'digital' | 'technical' | 'home' | 'entrepreneurship' | 'digital_work' | 'finance' | 'agriculture';
  categoryLabel: string;
  description: string;
  durationHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  storageSizeMb: number;
  isDownloaded: boolean;
  lessons: CourseLesson[];
  careerPathway: {
    recommendedJobTitle: string;
    recommendedGigCategory: string;
    potentialIncomeRange: string;
  };
  startupGuide?: {
    equipmentNeeded: string[];
    suggestedPricing: string;
    firstCustomerStrategy: string;
  };
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  recipientName: string;
  dateEarned: string;
  scorePercent: number;
  verificationCode: string;
}

export interface JobVacancy {
  id: string;
  title: string;
  companyName: string;
  location: string; // e.g. "Belmont, Bulawayo"
  city: string; // "Bulawayo", "Harare", etc.
  type: 'Full-time' | 'Contract' | 'Casual' | 'Apprenticeship' | 'Internship';
  industry: string;
  salaryText: string; // e.g. "$250 - $350 / month" or "Negotiable"
  description: string;
  responsibilities: string[];
  requirements: string[];
  isVerifiedEmployer: boolean;
  postedDate: string;
  closingDate: string;
  contactMethod: string;
  syncStatus: SyncState;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  phone: string;
  email: string;
  coverNote: string;
  appliedDate: string;
  status: 'draft' | 'queued' | 'submitted' | 'shortlisted' | 'rejected' | 'hired';
  syncStatus: SyncState;
}

export interface GigWorker {
  id: string;
  name: string;
  avatarUrl: string;
  serviceCategory: string;
  suburb: string; // e.g. "Nkulumane, Bulawayo"
  city: string;
  rating: number;
  reviewsCount: number;
  pricingType: 'Fixed' | 'Hourly' | 'Daily' | 'Quotation';
  baseRateText: string; // e.g. "$15 / visit"
  isAvailableToday: boolean;
  isVerified: boolean;
  completedJobsCount: number;
  phone: string;
  skills: string[];
  about: string;
  sampleWorkPhotos: string[];
}

export interface GigRequest {
  id: string;
  title: string;
  category: string;
  customerName: string;
  customerPhone: string;
  suburb: string;
  budget: string;
  preferredDate: string;
  description: string;
  status: 'requested' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  quotedAmount?: number;
  quotedCurrency?: CurrencyType;
  createdAt: string;
  syncStatus: SyncState;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface BusinessTransaction {
  id: string;
  type: 'sale' | 'expense' | 'gig_payment';
  amount: number;
  currency: CurrencyType;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: 'cash' | 'ecocash' | 'innbucks' | 'bank_transfer';
  customerOrSupplier?: string;
  relatedInventoryId?: string;
  syncStatus: SyncState;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  currency: CurrencyType;
  lowStockAlert: number;
  lastUpdated: string;
}

export interface CustomerCredit {
  id: string;
  customerName: string;
  phone: string;
  amountOwed: number;
  currency: CurrencyType;
  lastPurchaseDate: string;
  notes: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  suburb: string;
  city: string;
  headline: string;
  bio: string;
  education: string;
  workExperience: string;
  skills: string[];
  references: string;
  roles: Array<'learner' | 'jobseeker' | 'worker' | 'employer' | 'business_owner'>;
  isWorkerProfileActive: boolean;
  workerTrade?: string;
  workerRate?: string;
}

export interface SyncQueueItem {
  id: string;
  title: string;
  entityType: 'application' | 'gig_request' | 'vacancy' | 'transaction';
  payload: any;
  createdAt: string;
  status: 'queued' | 'synced' | 'failed';
}
