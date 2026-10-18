import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Handshake, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Search, 
  Plus, 
  Send, 
  Star, 
  Filter, 
  Phone, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  X,
  FileText,
  UserPlus,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { JobVacancy, JobApplication, GigWorker, GigRequest } from '../types';
import { compressImageFile } from '../utils/imageCompression';

export const WorkView: React.FC = () => {
  const { 
    workSubTab, 
    setWorkSubTab, 
    selectedJobId, 
    setSelectedJobId,
    setActiveTab,
    userProfile, 
    isEffectivelyOnline, 
    currency,
    showToast,
    currentUser,
    setShowAuthModal
  } = useApp();

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    return StorageEngine.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
  }, []);

  const jobs = useMemo(() => StorageEngine.getJobs(), [dataVersion]);
  const applications = useMemo(() => StorageEngine.getApplications(), [dataVersion, currentUser]);
  const workers = useMemo(() => StorageEngine.getWorkers(), [dataVersion]);
  const gigRequests = useMemo(() => StorageEngine.getGigRequests(), [dataVersion]);

  // Filters & State
  const [jobSearch, setJobSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedTradeCategory, setSelectedTradeCategory] = useState('All');
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showRoleRestrictionModal, setShowRoleRestrictionModal] = useState(false);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [showCreateArtisanModal, setShowCreateArtisanModal] = useState(false);
  const [selectedWorkerForRequest, setSelectedWorkerForRequest] = useState<GigWorker | null>(null);

  const isEmployerOrBusinessOwner = 
    userProfile.roles.includes('employer') || 
    userProfile.roles.includes('business_owner');

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState<JobVacancy | null>(null);
  const [coverNote, setCoverNote] = useState('I am applying for this role with strong vocational experience and verified credentials from Comfort Skills Hub.');

  // New Vacancy Form state
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Belmont, Bulawayo');
  const [newJobType, setNewJobType] = useState<'Full-time' | 'Contract' | 'Casual'>('Full-time');
  const [newJobSalary, setNewJobSalary] = useState('$250 - $350 / month');
  const [newJobDesc, setNewJobDesc] = useState('');

  // New Gig Task Request state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Plumbing & electrical work');
  const [taskSuburb, setTaskSuburb] = useState('Bulawayo CBD');
  const [taskBudget, setTaskBudget] = useState('$20 - $30');
  const [taskDate, setTaskDate] = useState('Tomorrow');
  const [taskDesc, setTaskDesc] = useState('');

  // Create Artisan Profile Form State (Requirement 3)
  const [artisanName, setArtisanName] = useState(currentUser?.displayName || userProfile.fullName || '');
  const [artisanCategory, setArtisanCategory] = useState('Plumbing & electrical work');
  const [artisanSuburb, setArtisanSuburb] = useState(userProfile.suburb || 'Bulawayo CBD');
  const [artisanRate, setArtisanRate] = useState('$15 / visit + quotation');
  const [artisanPhone, setArtisanPhone] = useState(userProfile.phone || '+263 ');
  const [artisanSkills, setArtisanSkills] = useState('Solar Setup, Fault Finding, DB Rewiring');
  const [artisanAbout, setArtisanAbout] = useState('Certified vocational artisan providing reliable, guaranteed workmanship across Bulawayo.');

  // Active Job for detail view
  const activeJob = jobs.find((j) => j.id === selectedJobId) || null;

  // Filtered Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) || 
                          j.companyName.toLowerCase().includes(jobSearch.toLowerCase()) || 
                          j.location.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesCity = selectedCity === 'All' || j.city === selectedCity;
    const matchesType = selectedJobType === 'All' || j.type === selectedJobType;
    return matchesSearch && matchesCity && matchesType;
  });

  // Filtered Workers
  const filteredWorkers = workers.filter((w) => {
    if (selectedTradeCategory === 'All') return true;
    return w.serviceCategory.toLowerCase().includes(selectedTradeCategory.toLowerCase());
  });

  const handleApplyToJob = (job: JobVacancy) => {
    const existing = applications.find((a) => a.jobId === job.id);
    if (existing) {
      showToast(`You have already applied for this role (Status: ${existing.status}).`);
      return;
    }

    StorageEngine.submitApplication({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      applicantName: userProfile.fullName || currentUser?.displayName || 'Comfort Member',
      phone: userProfile.phone || '+263 77 412 8901',
      email: userProfile.email || currentUser?.email || 'applicant@comforthub.zw',
      coverNote: coverNote
    });

    setApplyingJob(null);
    showToast(isEffectivelyOnline 
      ? 'Application submitted successfully to employer!' 
      : 'Application saved locally and queued in outbox for synchronization.');
  };

  const handlePublishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobCompany.trim()) return;

    if (!isEmployerOrBusinessOwner) {
      showToast('Only verified Employers or Business Owners can post vacancies.');
      setShowRoleRestrictionModal(true);
      return;
    }

    StorageEngine.saveJob({
      title: newJobTitle,
      companyName: newJobCompany,
      location: newJobLocation,
      city: 'Bulawayo',
      type: newJobType,
      industry: 'General Trades & Services',
      salaryText: newJobSalary,
      description: newJobDesc || 'Job opening published via Comfort Skills & Jobs Hub employer desk.',
      responsibilities: ['Standard duties as agreed in employment terms.', 'Punctuality and dedication.'],
      isVerifiedEmployer: userProfile.isEmployerVerified || userProfile.roles.includes('employer'),
      closingDate: 'In 14 days',
      contactMethod: 'In-app application'
    });

    setShowPostJobModal(false);
    setNewJobTitle('');
    setNewJobCompany('');
    showToast(isEffectivelyOnline ? 'Job vacancy published online!' : 'Vacancy saved locally and queued in outbox.');
  };

  const handleCreateGigTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    StorageEngine.createGigRequest({
      title: taskTitle,
      category: taskCategory,
      customerName: userProfile.fullName || currentUser?.displayName || 'Bulawayo Resident',
      customerPhone: userProfile.phone || '+263 77 000 0000',
      suburb: taskSuburb,
      budget: taskBudget,
      preferredDate: taskDate,
      description: taskDesc || 'Customer requested task via Comfort Gig matching.',
      assignedWorkerId: selectedWorkerForRequest ? selectedWorkerForRequest.id : undefined,
      assignedWorkerName: selectedWorkerForRequest ? selectedWorkerForRequest.name : undefined
    });

    setShowPostGigModal(false);
    setSelectedWorkerForRequest(null);
    setTaskTitle('');
    setTaskDesc('');
    showToast(isEffectivelyOnline 
      ? 'Gig task posted! Local artisans will be notified.' 
      : 'Gig task saved locally and queued in outbox.');
  };

  const [artisanAvatar, setArtisanAvatar] = useState(userProfile.avatarUrl || '');
  const [artisanWorkPhotos, setArtisanWorkPhotos] = useState<string[]>([]);
  const [selectedWorkImagePreview, setSelectedWorkImagePreview] = useState<string | null>(null);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
  const [isCompressingWorkPhotos, setIsCompressingWorkPhotos] = useState(false);

  const handleArtisanAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingAvatar(true);
      const compressed = await compressImageFile(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
      setArtisanAvatar(compressed);
      showToast('Profile photo uploaded and optimized.');
    } catch (err) {
      console.error(err);
      showToast('Could not optimize photo.');
    } finally {
      setIsCompressingAvatar(false);
    }
  };

  const handleArtisanWorkPhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsCompressingWorkPhotos(true);
      const newImgs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i], { maxWidth: 800, maxHeight: 800, quality: 0.78 });
        newImgs.push(compressed);
      }
      setArtisanWorkPhotos((prev) => [...prev, ...newImgs].slice(0, 6));
      showToast(`Added ${newImgs.length} previous work photo(s).`);
    } catch (err) {
      console.error(err);
      showToast('Could not process work photos.');
    } finally {
      setIsCompressingWorkPhotos(false);
    }
  };

  const handleRemoveArtisanWorkPhoto = (idx: number) => {
    setArtisanWorkPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Requirement 3: Handler to create artisan profile
  const handleCreateArtisan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanName.trim() || !artisanPhone.trim()) {
      showToast('Please enter your name and phone number.');
      return;
    }

    const skillsArray = artisanSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    StorageEngine.createArtisanProfile({
      name: artisanName,
      serviceCategory: artisanCategory,
      suburb: artisanSuburb,
      city: 'Bulawayo',
      pricingType: 'Quotation',
      baseRateText: artisanRate || '$15 / visit + quotation',
      phone: artisanPhone,
      skills: skillsArray.length > 0 ? skillsArray : [artisanCategory],
      about: artisanAbout || `Experienced ${artisanCategory} professional providing quality work in ${artisanSuburb}.`,
      avatarUrl: artisanAvatar || undefined,
      sampleWorkPhotos: artisanWorkPhotos.length > 0 ? artisanWorkPhotos : undefined
    });

    setShowCreateArtisanModal(false);
    showToast(`Congratulations ${artisanName}! Your artisan profile is now active and listed in Bulawayo gigs.`);
  };

  const handleCompleteGigAndRecordSale = (gig: GigRequest) => {
    const amount = gig.quotedAmount || 30;
    StorageEngine.updateGigRequestStatus(gig.id, 'completed');

    StorageEngine.addTransaction({
      type: 'gig_payment',
      amount: amount,
      currency: gig.quotedCurrency || 'USD',
      category: gig.category,
      description: `Completed gig: ${gig.title}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      customerOrSupplier: gig.customerName
    });

    showToast(`Gig marked complete! $${amount} automatically logged into your Business Cashbook.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Top Navigation & Back to Home */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (activeJob) {
              setSelectedJobId(null);
            } else {
              setActiveTab('home');
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> {activeJob ? 'Back to Vacancies' : 'Back to Home'}
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Zimbabwe Verified Opportunities
        </span>
      </div>

      {/* Hero Banner with Tradespeople & Artisans (Fixed for Cloudflare production build) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
            Modules Two &amp; Three · Employment &amp; Gig Matching
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Verified Jobs &amp; Local Artisans
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Discover verified employer vacancies across Bulawayo and Zimbabwe, or hire trusted local artisans and post gigs directly without commission cuts.
          </p>
        </div>

        <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
          <img
            src="/images/hero_work.jpg"
            alt="Skilled Zimbabwean tradespeople and artisans"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      </div>

      {/* Work Sub Tabs: Local Jobs vs Gig Workers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setWorkSubTab('jobs');
              setSelectedJobId(null);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 active:scale-95 ${
              workSubTab === 'jobs'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Jobs<span className="hidden xs:inline"> Marketplace</span></span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setWorkSubTab('gigs');
              setSelectedJobId(null);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 active:scale-95 ${
              workSubTab === 'gigs'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Handshake className="w-4 h-4 shrink-0" />
            <span>Gig Workers<span className="hidden xs:inline"> Matching</span></span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {workers.length}
            </span>
          </button>
        </div>

        {/* Action Buttons for Jobs / Gigs (Requirement 3: Create Artisan Profile button) */}
        {workSubTab === 'jobs' ? (
          <button
            onClick={() => {
              if (!isEmployerOrBusinessOwner) {
                setShowRoleRestrictionModal(true);
              } else {
                setShowPostJobModal(true);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition self-stretch sm:self-auto shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Vacancy</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {/* Requirement 3: Button to allow users to create artisan profiles */}
            <button
              onClick={() => setShowCreateArtisanModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition shadow-2xs whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Create Artisan Profile</span>
            </button>
            <button
              onClick={() => setShowPostGigModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request a Gig</span>
            </button>
          </div>
        )}
      </div>

      {/* Trust & Safety Warning Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block">No Recruitment Fees Guarantee</span>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Comfort Hub enforces zero recruitment fees. Never pay an employer for an interview, registration, or medical test. Report suspicious listings immediately.
          </p>
        </div>
      </div>

      {/* ================= SECTION 1: LOCAL JOBS MARKETPLACE ================= */}
      {workSubTab === 'jobs' && (
        <div className="space-y-5">
          {/* Detailed Job View */}
          {activeJob ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <button
                onClick={() => setSelectedJobId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-100 px-3 py-1.5 rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Vacancies
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded">
                      {activeJob.type}
                    </span>
                    {activeJob.isVerifiedEmployer && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Employer in Bulawayo
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {activeJob.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {activeJob.companyName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeJob.location} · {activeJob.industry}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Estimated Pay</span>
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    {activeJob.salaryText}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Closes: {activeJob.closingDate}
                  </p>
                </div>
              </div>

              {/* Responsibilities & Requirements */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Job Description
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeJob.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activeJob.responsibilities.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Qualifications &amp; Requirements
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activeJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Owner Management Bar */}
              {Boolean(currentUser && (activeJob.postedBy === currentUser.uid || (activeJob.postedByEmail && activeJob.postedByEmail === currentUser.email))) && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-rose-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      Vacancy Owner Privileges
                    </span>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      You published this listing. Only you (or the Admin) hold the privileges to close or delete it.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently delete this job vacancy?')) {
                        StorageEngine.deleteJob(activeJob.id);
                        setSelectedJobId(null);
                        showToast('Job vacancy removed from marketplace.');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-2xs self-stretch sm:self-auto justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Vacancy</span>
                  </button>
                </div>
              )}

              {/* Apply Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Contact method: {activeJob.contactMethod}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedJobId(null)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel / Back
                  </button>
                  <button
                    onClick={() => setApplyingJob(activeJob)}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    1-Click Fast Apply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Filter by job role, skill, or suburb..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  >
                    <option value="All">All Cities</option>
                    <option value="Bulawayo">Bulawayo</option>
                    <option value="Harare">Harare</option>
                  </select>

                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>
              </div>

              {/* My Application Tracker Strip if user has submitted any applications */}
              {applications.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      My Applications Tracker ({applications.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Syncs automatically with server
                    </span>
                  </div>
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{app.jobTitle}</p>
                          <p className="text-[11px] text-slate-500">{app.companyName} · Applied {app.appliedDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            app.syncStatus === 'queued'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {app.syncStatus === 'queued' ? 'Queued (Offline)' : 'Submitted'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vacancies List */}
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {job.type}
                        </span>
                        {job.isVerifiedEmployer && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Employer
                          </span>
                        )}
                        {Boolean(currentUser && (job.postedBy === currentUser.uid || (job.postedByEmail && job.postedByEmail === currentUser.email))) && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            My Job
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">· {job.postedDate}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">{job.companyName}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {job.location}
                        </span>
                        <span>·</span>
                        <span>{job.industry}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {job.salaryText}
                      </span>
                      <button className="text-xs font-bold text-teal-700 hover:text-teal-800 mt-1">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= SECTION 2: GIG WORKER MATCHING ================= */}
      {workSubTab === 'gigs' && (
        <div className="space-y-5">
          {/* Trade Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'All', label: 'All Artisans' },
              { id: 'Plumbing', label: 'Plumbing & Electrical' },
              { id: 'Phone', label: 'Phone & Tech Repairs' },
              { id: 'Tailoring', label: 'Tailoring & Carpentry' },
              { id: 'Welding', label: 'Welding & Steel' },
              { id: 'Cleaning', label: 'Cleaning & Domestic' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedTradeCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTradeCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Gig Requests Tracker */}
          {gigRequests.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Active Gig Tasks &amp; Quotations ({gigRequests.length})
                </span>
                <span className="text-[11px] text-slate-500">Local Service Tracker</span>
              </div>

              <div className="space-y-2">
                {gigRequests.map((gig) => (
                  <div
                    key={gig.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{gig.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                          {gig.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {gig.suburb} · Assigned: {gig.assignedWorkerName || 'Open to all workers'} · Budget: {gig.budget}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {gig.status === 'requested' && (
                        <button
                          onClick={() => {
                            StorageEngine.updateGigRequestStatus(gig.id, 'quoted', 30);
                            showToast('Quotation sent to customer.');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-xs"
                        >
                          Send Quote ($30)
                        </button>
                      )}
                      {gig.status === 'quoted' && (
                        <button
                          onClick={() => {
                            StorageEngine.updateGigRequestStatus(gig.id, 'accepted');
                            showToast('Quotation accepted! Work is scheduled.');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          Accept Quote (${gig.quotedAmount})
                        </button>
                      )}
                      {gig.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteGigAndRecordSale(gig)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs"
                        >
                          Mark Done &amp; Log Sale
                        </button>
                      )}
                      {gig.status === 'completed' && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gig Worker Cards Grid */}
          {filteredWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-dashed border-slate-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-8 h-8 text-teal-600" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedTradeCategory === 'All' ? 'No Artisans Registered Yet' : `No Artisans under ${selectedTradeCategory}`}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The directory is ready for production. Be among the first verified Zimbabwean artisans to list your trade, set your pricing, and receive direct customer requests.
                </p>
              </div>
              <button
                onClick={() => setShowCreateArtisanModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register as First Artisan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={worker.avatarUrl}
                        alt={worker.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {worker.name}
                          </h3>
                          {worker.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {Boolean(currentUser && worker.userId === currentUser.uid) && (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded shrink-0">
                              My Profile
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{worker.serviceCategory}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="flex items-center text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />
                            {worker.rating} ({worker.reviewsCount})
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-medium">
                            {worker.completedJobsCount} gigs done
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{worker.suburb}</span>
                      </div>

                      <p className="text-slate-600 leading-relaxed line-clamp-2">
                        {worker.about}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {worker.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Artisan Portfolio & Work Photos */}
                      {worker.sampleWorkPhotos && worker.sampleWorkPhotos.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Recent Work ({worker.sampleWorkPhotos.length} photos)
                          </span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            {worker.sampleWorkPhotos.map((photo, pIdx) => (
                              <img
                                key={pIdx}
                                src={photo}
                                alt={`Work sample ${pIdx + 1}`}
                                onClick={() => setSelectedWorkImagePreview(photo)}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-teal-500 transition"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Starting Rate</span>
                      <span className="text-xs font-bold text-slate-900">{worker.baseRateText}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {Boolean(currentUser && worker.userId === currentUser.uid) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete your artisan profile (${worker.name})?`)) {
                              StorageEngine.deleteArtisan(worker.id);
                              showToast('Artisan profile deleted.');
                            }
                          }}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete My Artisan Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a
                        href={`tel:${worker.phone}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Direct Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          setSelectedWorkerForRequest(worker);
                          setTaskCategory(worker.serviceCategory);
                          setShowPostGigModal(true);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Hire Artisan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= CREATE ARTISAN PROFILE MODAL (Requirement 3) ================= */}
      {showCreateArtisanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateArtisan} className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  Register as an Artisan / Gig Worker
                </h3>
                <p className="text-xs text-slate-500">
                  List your skills and start receiving local job requests across Zimbabwe
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateArtisanModal(false)} 
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Profile Photo Uploader */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative shrink-0">
                  {artisanAvatar ? (
                    <img
                      src={artisanAvatar}
                      alt="Artisan Profile"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg border border-teal-200">
                      {artisanName.charAt(0) || 'A'}
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleArtisanAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-800 text-xs block">Artisan Profile Photo</span>
                  <p className="text-[11px] text-slate-500">
                    {isCompressingAvatar ? 'Optimizing photo...' : 'Upload a clear headshot or business logo to build customer trust.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name / Trade Name *</label>
                  <input
                    type="text"
                    required
                    value={artisanName}
                    onChange={(e) => setArtisanName(e.target.value)}
                    placeholder="e.g. Tendai Moyo / Moyo Electricals"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={artisanPhone}
                    onChange={(e) => setArtisanPhone(e.target.value)}
                    placeholder="e.g. +263 77 123 4567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trade / Service Category *</label>
                  <select
                    value={artisanCategory}
                    onChange={(e) => setArtisanCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Plumbing & electrical work">Plumbing &amp; Electrical</option>
                    <option value="Welding & steel fabrication">Welding &amp; Steel Fabrication</option>
                    <option value="Phone & electronics repair">Phone &amp; Electronics Repair</option>
                    <option value="Bricklaying & masonry construction">Bricklaying &amp; Masonry</option>
                    <option value="Carpentry, roofing & woodwork">Carpentry &amp; Woodwork</option>
                    <option value="Motor mechanics & servicing">General Motor Mechanics</option>
                    <option value="Solar PV installation">Solar PV Installation</option>
                    <option value="Tailoring & fashion design">Tailoring &amp; Fashion</option>
                    <option value="Domestic cleaning & painting">Cleaning &amp; Domestic Work</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Suburb / City *</label>
                  <input
                    type="text"
                    required
                    value={artisanSuburb}
                    onChange={(e) => setArtisanSuburb(e.target.value)}
                    placeholder="e.g. Nkulumane, Bulawayo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Starting / Base Rate Text *</label>
                <input
                  type="text"
                  required
                  value={artisanRate}
                  onChange={(e) => setArtisanRate(e.target.value)}
                  placeholder="e.g. $15 / visit + quotation or $25 / day"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specific Skills (comma-separated)</label>
                <input
                  type="text"
                  value={artisanSkills}
                  onChange={(e) => setArtisanSkills(e.target.value)}
                  placeholder="e.g. Inverter Wiring, Geyser Repair, Solar Panels, DB Troubleshooting"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">About Your Services &amp; Experience</label>
                <textarea
                  rows={2}
                  value={artisanAbout}
                  onChange={(e) => setArtisanAbout(e.target.value)}
                  placeholder="Describe your practical background, tools you carry, and warranty on work..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Sample Work Photos / Portfolio */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Portfolio Work Photos (Up to 6)</span>
                    <p className="text-[11px] text-slate-500">
                      Showcase past installations, repairs, or finished projects.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-teal-700 font-bold text-xs cursor-pointer shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCompressingWorkPhotos ? 'Optimizing...' : 'Add Photos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleArtisanWorkPhotosChange}
                    />
                  </label>
                </div>

                {artisanWorkPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {artisanWorkPhotos.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white">
                        <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveArtisanWorkPhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg opacity-90 transition"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px]">
                <strong>Offline-First Guarantee: </strong> Your artisan profile will be saved on your device and synchronized to the Zimbabwe local network once connectivity is active.
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateArtisanModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                Publish Artisan Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= APPLY TO JOB MODAL ================= */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">1-Click Job Application</h3>
                <p className="text-xs text-slate-500">{applyingJob.title} · {applyingJob.companyName}</p>
              </div>
              <button onClick={() => setApplyingJob(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Intro Note / Application Message
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px]">
                {isEffectivelyOnline 
                  ? 'Your profile, verified skills, and phone number will be delivered directly to the employer.'
                  : 'You are currently offline. Your application will be saved locally on your phone and sent automatically when connectivity returns.'}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setApplyingJob(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel / Back
              </button>
              <button
                onClick={() => handleApplyToJob(applyingJob)}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Confirm Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POST VACANCY MODAL ================= */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handlePublishJob} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Post a Job Vacancy</h3>
                <p className="text-xs text-slate-500">Reach verified skilled workers in Bulawayo</p>
              </div>
              <button type="button" onClick={() => setShowPostJobModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Phone Technician, Welder, Retail Assistant"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Workshop Name</label>
                <input
                  type="text"
                  required
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  placeholder="e.g. Kelvin Metal Works, Siyaphambili Hardware"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Suburb</label>
                  <input
                    type="text"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Salary / Compensation</label>
                <input
                  type="text"
                  value={newJobSalary}
                  onChange={(e) => setNewJobSalary(e.target.value)}
                  placeholder="e.g. $250 - $350 / month"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsibilities &amp; Requirements</label>
                <textarea
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief description of duties..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPostJobModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Publish Listing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= POST GIG / REQUEST TASK MODAL ================= */}
      {showPostGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateGigTask} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Local Paid Work</h3>
                <p className="text-xs text-slate-500">
                  {selectedWorkerForRequest ? `Direct request to ${selectedWorkerForRequest.name}` : 'Post to local artisans'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowPostGigModal(false);
                  setSelectedWorkerForRequest(null);
                }} 
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">What work needs to be done?</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Replace Samsung screen, fix solar inverter, sew curtains"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Suburb / Location</label>
                  <input
                    type="text"
                    value={taskSuburb}
                    onChange={(e) => setTaskSuburb(e.target.value)}
                    placeholder="e.g. Bradfield, Bulawayo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Budget</label>
                  <input
                    type="text"
                    value={taskBudget}
                    onChange={(e) => setTaskBudget(e.target.value)}
                    placeholder="e.g. $20 - $35"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Details / Symptoms</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={2}
                  placeholder="Explain any details, parts needed, or urgency..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPostGigModal(false);
                  setSelectedWorkerForRequest(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox for previewing artisan work portfolio photos */}
      {selectedWorkImagePreview && (
        <div 
          onClick={() => setSelectedWorkImagePreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-transparent" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedWorkImagePreview}
              alt="Artisan work preview"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setSelectedWorkImagePreview(null)}
              className="absolute -top-3 -right-3 p-2 bg-white text-slate-800 rounded-full shadow-lg hover:bg-slate-100"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Role Restriction Modal for Non-Employers / Non-Business Owners */}
      {showRoleRestrictionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Employer or Business Owner Role Required
                </h3>
                <p className="text-xs text-teal-700 font-semibold">
                  Zero recruitment fees guarantee
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              To safeguard job seekers across Bulawayo from unverified recruitment listings and fees, only users with an active <strong>Employer</strong> (verified with KYC) or <strong>Business Owner</strong> role permission on their Profile are allowed to create job vacancies.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRoleRestrictionModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRoleRestrictionModal(false);
                  setActiveTab('profile');
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Go to Profile &amp; KYC</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
