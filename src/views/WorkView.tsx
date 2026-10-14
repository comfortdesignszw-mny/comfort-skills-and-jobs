import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { JobVacancy, JobApplication, GigWorker, GigRequest } from '../types';

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
    showToast 
  } = useApp();

  const jobs = StorageEngine.getJobs();
  const applications = StorageEngine.getApplications();
  const workers = StorageEngine.getWorkers();
  const gigRequests = StorageEngine.getGigRequests();

  // Filters & State
  const [jobSearch, setJobSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedTradeCategory, setSelectedTradeCategory] = useState('All');
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [selectedWorkerForRequest, setSelectedWorkerForRequest] = useState<GigWorker | null>(null);

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

    const app = StorageEngine.submitApplication({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      applicantName: userProfile.fullName || 'Comfort Nyoni',
      phone: userProfile.phone || '+263 77 412 8901',
      email: userProfile.email || 'applicant@comforthub.zw',
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
      requirements: ['Basic skills in relevant trade.', 'Traceable references.'],
      isVerifiedEmployer: true,
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
      customerName: userProfile.fullName || 'Comfort Nyoni',
      customerPhone: userProfile.phone || '+263 77 412 8901',
      suburb: taskSuburb,
      budget: taskBudget,
      preferredDate: taskDate,
      description: taskDesc || 'Task posted by local customer.',
      assignedWorkerId: selectedWorkerForRequest?.id,
      assignedWorkerName: selectedWorkerForRequest?.name,
      quotedAmount: selectedWorkerForRequest ? 25 : undefined,
      quotedCurrency: 'USD'
    });

    setShowPostGigModal(false);
    setSelectedWorkerForRequest(null);
    setTaskTitle('');
    setTaskDesc('');
    showToast('Gig task requested! Local workers will review and send quotes.');
  };

  const handleCompleteGigAndRecordSale = (gig: GigRequest) => {
    StorageEngine.updateGigRequestStatus(gig.id, 'completed');
    
    // Automatically offer to record as Business Sale!
    const amount = gig.quotedAmount || 25;
    StorageEngine.addTransaction({
      type: 'gig_payment',
      amount: amount,
      currency: gig.quotedCurrency || 'USD',
      category: gig.category,
      description: `Payment for gig: ${gig.title}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      customerOrSupplier: gig.customerName
    });

    showToast(`Gig marked complete! $${amount} automatically logged into your Business Cashbook.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Work Sub Tabs: Local Jobs vs Gig Workers */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setWorkSubTab('jobs');
              setSelectedJobId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              workSubTab === 'jobs'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Local Jobs Marketplace</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setWorkSubTab('gigs');
              setSelectedJobId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              workSubTab === 'gigs'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>Gig Worker Matching</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {workers.length}
            </span>
          </button>
        </div>

        {/* Action Button */}
        {workSubTab === 'jobs' ? (
          <button
            onClick={() => setShowPostJobModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Post Vacancy</span>
          </button>
        ) : (
          <button
            onClick={() => setShowPostGigModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Request a Gig</span>
          </button>
        )}
      </div>

      {/* Trust & Safety Warning Banner strictly per specification */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Zimbabwe Trust &amp; Safety Rule: </span>
          <span>
            Legitimate employers and contractors never charge job applicants upfront recruitment, registration, or interview fees. Report any suspicious fee requests immediately.
          </span>
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
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
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
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Application CTA Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-800">
                    Applying as: {userProfile.fullName || 'Comfort Nyoni'} ({userProfile.phone})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Works offline: Drafts are saved to your phone and sent when connected.
                  </p>
                </div>

                <button
                  onClick={() => setApplyingJob(activeJob)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>1-Click Apply with My Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search & Location Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search by job title, company, or suburb..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-teal-500"
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
                    <option value="Gweru">Gweru</option>
                    <option value="Mutare">Mutare</option>
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
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'All', label: 'All Artisans' },
              { id: 'Plumbing', label: 'Plumbing & Electrical' },
              { id: 'Phone', label: 'Phone & Tech Repairs' },
              { id: 'Tailoring', label: 'Tailoring & Carpentry' },
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
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {worker.name}
                        </h3>
                        {worker.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
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
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Rate</span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {worker.baseRateText}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedWorkerForRequest(worker);
                      setTaskCategory(worker.serviceCategory);
                      setShowPostGigModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= APPLY MODAL ================= */}
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
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p><strong className="text-slate-800">Applicant: </strong>{userProfile.fullName || 'Comfort Nyoni'}</p>
                <p><strong className="text-slate-800">Contact: </strong>{userProfile.phone} · {userProfile.email}</p>
                <p><strong className="text-slate-800">Location: </strong>{userProfile.suburb}, {userProfile.city}</p>
                <p><strong className="text-slate-800">Verified Skills: </strong>{userProfile.skills.slice(0, 3).join(', ')}</p>
              </div>

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
                Cancel
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
                Cancel
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
                Cancel
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
    </div>
  );
};
