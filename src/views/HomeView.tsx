import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  GraduationCap, 
  Briefcase, 
  Handshake, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Star,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';

export const HomeView: React.FC = () => {
  const { 
    setActiveTab, 
    setWorkSubTab, 
    setSelectedCourseId, 
    setSelectedJobId,
    searchQuery, 
    setSearchQuery,
    currency,
    translate,
    greetingText,
    currentUser,
    setShowAuthModal
  } = useApp();

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    return StorageEngine.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
  }, []);

  const courses = useMemo(() => StorageEngine.getCourses(), [dataVersion]);
  const jobs = useMemo(() => StorageEngine.getJobs().slice(0, 3), [dataVersion]);
  const workers = useMemo(() => StorageEngine.getWorkers().slice(0, 3), [dataVersion]);
  const transactions = useMemo(() => StorageEngine.getTransactions(), [dataVersion, currentUser]);

  // Quick business stats
  const totalSales = transactions
    .filter((t) => t.type === 'sale' || t.type === 'gig_payment')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to work or learn based on query
    if (searchQuery.toLowerCase().includes('learn') || searchQuery.toLowerCase().includes('course') || searchQuery.toLowerCase().includes('skill')) {
      setActiveTab('learn');
    } else {
      setActiveTab('work');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Dynamic Time-of-Day Personalized Greeting Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-teal-300 block mb-1">
            Comfort Skills &amp; Jobs Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {greetingText}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            {translate('what_to_achieve')}
          </p>
        </div>
        {!currentUser && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="self-start sm:self-auto px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap"
          >
            Sign In / Join Free
          </button>
        )}
      </div>
      {/* Search Bar Card - Matching Screenshot 6 */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center gap-3 hover:border-teal-400 transition cursor-pointer">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={translate('search_placeholder')}
              className="w-full text-sm font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Bulawayo · Harare · Gweru · Mutare · All provinces
            </p>
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Hero Feature Banner - Zimbabwean Artisan with Sewing Machine (Matching Screenshot 4) */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-md">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full max-h-72">
          <img
            src="/images/hero_home.jpg"
            alt="Young Zimbabwean artisan smiling in Bulawayo workshop"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback if asset fails
              e.currentTarget.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-teal-300">
              Bulawayo First · Offline-First PWA
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Comfort Skills &amp; Jobs Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
              One unified platform to learn a practical trade, find verified jobs, take local gigs, and manage your small business profits without high data costs.
            </p>
          </div>
        </div>
      </div>

      {/* 2x2 Primary Action Grid - Strictly Matching Screenshot 4 & 6 */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Four Connected Systems
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Offline Skills Academy */}
          <button
            onClick={() => setActiveTab('learn')}
            className="text-left bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {translate('learn_skills')}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
              Learn practical, income-generating skills without constant internet.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 mt-3">
              Explore Courses <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* 2. Local Jobs Marketplace */}
          <button
            onClick={() => {
              setActiveTab('work');
              setWorkSubTab('jobs');
            }}
            className="text-left bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {translate('find_jobs')}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
              Discover verified job opportunities across Zimbabwe.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 mt-3">
              View Vacancies <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* 3. Gig Worker Matching */}
          <button
            onClick={() => {
              setActiveTab('work');
              setWorkSubTab('gigs');
            }}
            className="text-left bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Handshake className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {translate('find_gigs')}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
              Connect customers with people available to do paid work.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 mt-3">
              Hire Artisans <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* 4. Small Business Tools */}
          <button
            onClick={() => setActiveTab('business')}
            className="text-left bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {translate('my_business')}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
              Track sales, expenses, stock, customers, and profit.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 mt-3">
              Open Cashbook <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>

      {/* 7. How the Four Modules Work Together - Strictly Matching Screenshot 3 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="mb-4">
          <span className="text-[11px] font-extrabold text-teal-600 uppercase tracking-wider">
            Connected Lifecycle
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            From Learning to Earning: The Complete Journey
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How a learner in Bulawayo studies phone repair, takes gigs, and manages business profits:
          </p>
        </div>

        {/* Step-by-Step Flow matching Screenshot 3 */}
        <div className="space-y-3">
          {/* Step 1: Learn */}
          <div 
            onClick={() => {
              setSelectedCourseId('course-phone-repair');
              setActiveTab('learn');
            }}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Learn</h4>
                <span className="text-[10px] text-teal-700 font-semibold">Try module →</span>
              </div>
              <p className="text-xs text-slate-600">Complete a practical course offline without high data costs.</p>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          {/* Step 2: Qualify */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Qualify</h4>
                <span className="text-[10px] text-teal-700 font-semibold">View CV →</span>
              </div>
              <p className="text-xs text-slate-600">Add acquired skills to your worker profile and CV automatically.</p>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          {/* Step 3: Find Work */}
          <div 
            onClick={() => {
              setActiveTab('work');
              setWorkSubTab('jobs');
            }}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Find Work</h4>
                <span className="text-[10px] text-teal-700 font-semibold">View jobs →</span>
              </div>
              <p className="text-xs text-slate-600">Apply for a verified local job or accept local gig requests.</p>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          {/* Step 4: Earn */}
          <div 
            onClick={() => setActiveTab('business')}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              4
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Earn</h4>
                <span className="text-[10px] text-teal-700 font-semibold">Record sale →</span>
              </div>
              <p className="text-xs text-slate-600">Record customer payments and parts expenses in a few taps.</p>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">↓</div>

          {/* Step 5: Grow */}
          <div 
            onClick={() => setActiveTab('business')}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-100 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              5
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Grow</h4>
                <span className="text-[10px] text-teal-700 font-semibold">Track profits →</span>
              </div>
              <p className="text-xs text-slate-600">Track profits in USD / ZiG and choose your next skill to master.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Verified Jobs in Bulawayo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Verified Vacancies</h3>
            <p className="text-xs text-slate-500">No recruitment fees allowed · Apply offline</p>
          </div>
          <button
            onClick={() => {
              setActiveTab('work');
              setWorkSubTab('jobs');
            }}
            className="text-xs font-bold text-teal-700 hover:text-teal-800"
          >
            View all ({jobs.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                setSelectedJobId(job.id);
                setActiveTab('work');
                setWorkSubTab('jobs');
              }}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {job.type}
                  </span>
                  {job.isVerifiedEmployer && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{job.title}</h4>
                <p className="text-xs text-slate-500">{job.companyName}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 tabular-nums">{job.salaryText}</span>
                <span className="text-[11px] text-teal-700 font-semibold">Details</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Gig Workers in Bulawayo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Local Verified Artisans</h3>
            <p className="text-xs text-slate-500">Available today for on-demand local gigs</p>
          </div>
          <button
            onClick={() => {
              setActiveTab('work');
              setWorkSubTab('gigs');
            }}
            className="text-xs font-bold text-teal-700 hover:text-teal-800"
          >
            Browse all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {workers.map((worker) => (
            <div
              key={worker.id}
              onClick={() => {
                setActiveTab('work');
                setWorkSubTab('gigs');
              }}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 transition cursor-pointer flex items-center gap-3"
            >
              <img
                src={worker.avatarUrl}
                alt={worker.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{worker.name}</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 truncate">{worker.serviceCategory}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="flex items-center text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                    {worker.rating}
                  </span>
                  <span>· {worker.completedJobsCount} gigs done</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Quick Ledger Card */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-teal-400 tracking-wider">
              Quick Cashbook
            </span>
            <h3 className="text-base font-bold text-white">Your Business Ledger</h3>
          </div>
          <button
            onClick={() => setActiveTab('business')}
            className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Income</p>
            <p className="text-base font-bold text-emerald-400 tabular-nums">
              ${totalSales.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Expenses</p>
            <p className="text-base font-bold text-rose-400 tabular-nums">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Net Profit</p>
            <p className="text-base font-bold text-teal-300 tabular-nums">
              ${netProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
