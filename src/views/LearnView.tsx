import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Award, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  Briefcase, 
  ArrowRight, 
  ChevronLeft, 
  Volume2, 
  Check, 
  Share2, 
  AlertCircle,
  FileCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileText,
  Bookmark,
  Layers,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { Course, CourseLesson, Certificate, QuizQuestion } from '../types';

export const LearnView: React.FC = () => {
  const { 
    selectedCourseId, 
    setSelectedCourseId, 
    setActiveTab, 
    setWorkSubTab,
    setSelectedJobId,
    userProfile, 
    showToast,
    currentUser,
    setShowAuthModal
  } = useApp();

  const courses = StorageEngine.getCourses();
  const certificates = StorageEngine.getCertificates();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [lessonSubTab, setLessonSubTab] = useState<'notes' | 'diagrams' | 'resources' | 'quiz'>('notes');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [showingCertificate, setShowingCertificate] = useState<Certificate | null>(null);

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'digital') return c.category === 'digital';
    if (activeCategory === 'technical') return c.category === 'technical';
    if (activeCategory === 'construction') return c.category === 'construction';
    if (activeCategory === 'safety') return c.category === 'safety';
    if (activeCategory === 'finance') return c.category === 'finance';
    if (activeCategory === 'home') return c.category === 'home';
    return c.category === activeCategory;
  });

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || null;
  const currentLesson: CourseLesson | null = activeCourse ? activeCourse.lessons[selectedLessonIndex] || activeCourse.lessons[0] : null;

  const handleDownloadToggle = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowDownloaded = StorageEngine.toggleDownloadCourse(courseId);
    showToast(isNowDownloaded ? 'Course saved to phone storage. Ready for offline learning.' : 'Course removed from offline memory.');
  };

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleFinishQuiz = (lesson: CourseLesson) => {
    if (!lesson.quiz || lesson.quiz.length === 0) return;
    setQuizSubmitted(true);

    let correct = 0;
    lesson.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const percent = Math.round((correct / lesson.quiz.length) * 100);

    if (activeCourse) {
      const result = StorageEngine.recordQuizResult(activeCourse.id, lesson.id, percent);

      // Requirement: Pass is more than 70%
      if (percent > 70) {
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        const cert = result.cert || StorageEngine.awardCertificate({
          courseId: activeCourse.id,
          courseTitle: activeCourse.title,
          recipientName: userProfile.fullName || currentUser?.displayName || 'Comfort Member',
          scorePercent: percent
        });

        setShowingCertificate(cert);
        showToast(`Congratulations! You passed with ${percent}% and earned your verified certificate.`);
      } else {
        showToast(`Score: ${percent}%. Pass mark is > 70%. Review the study notes and retake the quiz.`);
      }
    }
  };

  // Helper to render SVG diagrams for vocational skills
  const renderVisualIllustration = (lesson: CourseLesson) => {
    const diag = lesson.visualDiagram;
    if (!diag) return null;

    return (
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {diag.title}
            </h4>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
            Technical Schematic
          </span>
        </div>

        {/* Visual Schematic Diagram Graphics */}
        <div className="py-2 px-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
          {diag.svgType === 'circuit' && (
            <div className="flex items-center justify-around py-4 text-teal-400 font-mono text-[11px] gap-2 overflow-x-auto">
              <div className="p-3 bg-slate-900 rounded-lg border border-teal-500/30 text-center min-w-[90px]">
                <div className="text-amber-400 text-xs font-bold mb-1">⚡ POWER</div>
                <span>Panel / DC In</span>
              </div>
              <span className="text-slate-500 text-base">➔</span>
              <div className="p-3 bg-slate-900 rounded-lg border border-teal-500/30 text-center min-w-[90px]">
                <div className="text-teal-300 text-xs font-bold mb-1">🔒 FUSE</div>
                <span>DC Breaker</span>
              </div>
              <span className="text-slate-500 text-base">➔</span>
              <div className="p-3 bg-slate-900 rounded-lg border border-teal-500/30 text-center min-w-[90px]">
                <div className="text-emerald-400 text-xs font-bold mb-1">⚙️ CONTROL</div>
                <span>Inverter / PCB</span>
              </div>
              <span className="text-slate-500 text-base">➔</span>
              <div className="p-3 bg-slate-900 rounded-lg border border-teal-500/30 text-center min-w-[90px]">
                <div className="text-cyan-400 text-xs font-bold mb-1">💡 LOAD</div>
                <span>Sub-DB Box</span>
              </div>
            </div>
          )}

          {diag.svgType === 'mechanics' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 text-center text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-teal-400 font-bold block">1. INTAKE</span>
                <span className="text-slate-300 text-[11px] mt-1 block">Valve Open ↓</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-amber-400 font-bold block">2. COMPRESS</span>
                <span className="text-slate-300 text-[11px] mt-1 block">Both Closed ↑</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-rose-400 font-bold block">3. POWER</span>
                <span className="text-slate-300 text-[11px] mt-1 block">Spark Fire 🔥</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold block">4. EXHAUST</span>
                <span className="text-slate-300 text-[11px] mt-1 block">Valve Open ↑</span>
              </div>
            </div>
          )}

          {diag.svgType === 'safety' && (
            <div className="flex flex-wrap items-center justify-center gap-2 py-3">
              {['D - Danger Scan', 'R - Check Response', 'A - Clear Airway', 'B - Check Breathing', 'C - 30 Compressions'].map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/70 border border-teal-600/40 text-teal-200 text-xs font-bold">
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {diag.svgType === 'diagram' && (
            <div className="space-y-2 py-2">
              {diag.steps?.map((st, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-teal-800 text-teal-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 italic">
          {diag.caption}
        </p>
      </div>
    );
  };

  // Certificate Modal View
  if (showingCertificate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Prominent Back Button */}
        <button
          onClick={() => setShowingCertificate(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Lesson
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-teal-600 shadow-xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-teal-100 rounded-full opacity-50 pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mx-auto flex items-center justify-center mb-4">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-extrabold tracking-widest uppercase text-teal-600">
            Comfort Skills Academy · Zimbabwe
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Certificate of Completion
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verified Practical Vocational Achievement
          </p>

          <div className="my-6 py-4 border-y border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              This is to certify that
            </p>
            <h3 className="text-xl font-bold text-teal-900 mt-1">
              {showingCertificate.recipientName}
            </h3>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
              has successfully completed all practical lessons, study materials, and passed the rigorous technical examination with a verified score of:
            </p>
            <div className="mt-3 inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 font-black text-sm rounded-full">
              Score: {showingCertificate.scorePercent}% (Passed &gt; 70%)
            </div>
            <p className="text-sm font-black text-slate-900 mt-3">
              {showingCertificate.courseTitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2">
            <div className="text-left">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Date Issued</span>
              <span className="font-semibold text-slate-800">{showingCertificate.dateEarned}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Verification ID</span>
              <span className="font-mono font-bold text-teal-700">{showingCertificate.verificationCode}</span>
            </div>
          </div>

          {/* Action buttons with Cancel/Return */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                showToast('Certificate saved to your profile credentials!');
                setShowingCertificate(null);
                setActiveTab('profile');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              View in My Profile &amp; CV
            </button>
            <button
              onClick={() => setShowingCertificate(null)}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Course Detail & Learning Mode
  if (activeCourse && currentLesson) {
    const isQuizMode = lessonSubTab === 'quiz';
    const totalQuizQuestions = currentLesson.quiz ? currentLesson.quiz.length : 0;
    const answeredCount = Object.keys(quizAnswers).length;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-5">
        {/* Navigation Breadcrumb & Back Buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setSelectedCourseId(null);
              handleResetQuiz();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Courses
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Home Dashboard
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              {activeCourse.categoryLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleDownloadToggle(activeCourse.id, e)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                  activeCourse.isDownloaded
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{activeCourse.isDownloaded ? 'Downloaded (Offline Ready)' : 'Download Course'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeCourse.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeCourse.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeCourse.durationHours} hours
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" /> {activeCourse.storageSizeMb} MB on phone
            </span>
            <span>·</span>
            <span className="text-teal-700 font-bold">
              Level: {activeCourse.difficulty}
            </span>
          </div>
        </div>

        {/* Lessons Selector Bar */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 overflow-x-auto no-scrollbar">
          {activeCourse.lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => {
                setSelectedLessonIndex(idx);
                handleResetQuiz();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedLessonIndex === idx
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Lesson {idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Lesson Sub-Tabs: Notes | Diagrams | Resources | Quiz */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold px-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setLessonSubTab('notes')}
            className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 ${
              lessonSubTab === 'notes'
                ? 'border-teal-600 text-teal-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Study Notes &amp; Steps
          </button>
          <button
            onClick={() => setLessonSubTab('diagrams')}
            className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 ${
              lessonSubTab === 'diagrams'
                ? 'border-teal-600 text-teal-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Visual Diagrams &amp; Schematics
          </button>
          <button
            onClick={() => setLessonSubTab('resources')}
            className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 ${
              lessonSubTab === 'resources'
                ? 'border-teal-600 text-teal-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Study Materials &amp; Cheatsheets
          </button>
          <button
            onClick={() => setLessonSubTab('quiz')}
            className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 ${
              lessonSubTab === 'quiz'
                ? 'border-teal-600 text-teal-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Examination Quiz ({totalQuizQuestions})
          </button>
        </div>

        {/* Tab 1: Detailed Notes & Step-by-Step Workshop Steps */}
        {lessonSubTab === 'notes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-slate-900">
                {currentLesson.title}
              </h3>

              {currentLesson.detailedNotes && (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-teal-950 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-teal-700 block">
                    Core Conceptual Overview
                  </span>
                  <p className="leading-relaxed">
                    {currentLesson.detailedNotes.overview}
                  </p>
                </div>
              )}

              {/* Step by step practical instructions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Practical Step-by-Step Workshop Guide
                </h4>
                <div className="space-y-2.5">
                  {currentLesson.content.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Principles & Safety Bulletins */}
              {currentLesson.detailedNotes && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Core Principles
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {currentLesson.detailedNotes.corePrinciples.map((cp, i) => (
                        <li key={i}>{cp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                    <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Safety Protocols
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-amber-800">
                      {currentLesson.detailedNotes.safetyProtocols?.map((sp, i) => (
                        <li key={i}>{sp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Practical Artisan Tip */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs">
                <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-bold block">Artisan Workshop Tip:</strong>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    {currentLesson.practicalTip}
                  </p>
                </div>
              </div>

              {/* Zimbabwe Context */}
              {currentLesson.detailedNotes?.zimbabweContext && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Bulawayo &amp; Zimbabwe Market Context:</strong>
                    <p className="mt-0.5 text-blue-800">
                      {currentLesson.detailedNotes.zimbabweContext}
                    </p>
                  </div>
                </div>
              )}

              {/* Prompt to take quiz */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Ready to test your knowledge? Pass &gt; 70% to get certified.
                </span>
                <button
                  onClick={() => setLessonSubTab('quiz')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  Take Examination Quiz <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Visual Diagrams & Schematics */}
        {lessonSubTab === 'diagrams' && (
          <div className="space-y-4">
            {renderVisualIllustration(currentLesson)}
          </div>
        )}

        {/* Tab 3: Study Resources & Materials */}
        {lessonSubTab === 'resources' && (
          <div className="space-y-3">
            {currentLesson.resources && currentLesson.resources.length > 0 ? (
              currentLesson.resources.map((res, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-teal-600" />
                      {res.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {res.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {res.description}
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Key Takeaways</span>
                    <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                      {res.keyPoints.map((kp, kIdx) => (
                        <li key={kIdx}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Detailed notes and visual diagrams are available in the other tabs for this lesson.
              </div>
            )}

            {/* Equipment & Startup Guide */}
            {activeCourse.startupGuide && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  Artisan Equipment &amp; Startup Kit
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Recommended Tools:</span>
                    <ul className="list-disc pl-4 text-slate-600 mt-1 space-y-0.5">
                      {activeCourse.startupGuide.equipmentNeeded.map((eq, eIdx) => (
                        <li key={eIdx}>{eq}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-1">
                    <span className="font-bold text-slate-700">Standard Service Pricing: </span>
                    <span className="text-slate-600">{activeCourse.startupGuide.suggestedPricing}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">First Customer Strategy: </span>
                    <span className="text-slate-600">{activeCourse.startupGuide.firstCustomerStrategy}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Examination Quiz */}
        {lessonSubTab === 'quiz' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                    Examination Quiz: {currentLesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Passing standard: More than 70% to qualify for local certificate.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLessonSubTab('notes')}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel / Back to Notes
                  </button>
                  {quizSubmitted && (
                    <button
                      onClick={handleResetQuiz}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retake
                    </button>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {currentLesson.quiz?.map((q, qIndex) => {
                  const selected = quizAnswers[q.id];
                  const isAnswered = selected !== undefined;
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div key={q.id} className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {qIndex + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          let buttonStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                          if (selected === optIdx) {
                            buttonStyle = 'border-teal-500 bg-teal-50 text-teal-900 font-semibold';
                          }

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (selected === optIdx && !isCorrect) {
                              buttonStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${buttonStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after submission */}
                      {quizSubmitted && (
                        <div className={`p-3 rounded-xl text-xs ${
                          isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                        }`}>
                          <strong className="block font-bold">
                            {isCorrect ? '✓ Correct!' : '✗ Explanation:'}
                          </strong>
                          <p className="mt-0.5">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Finish button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {quizSubmitted ? 'Assessment Finished' : `${answeredCount} of ${totalQuizQuestions} answered`}
                </span>
                {!quizSubmitted ? (
                  <button
                    disabled={answeredCount < totalQuizQuestions}
                    onClick={() => handleFinishQuiz(currentLesson)}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Submit Answers &amp; Check Score
                  </button>
                ) : (
                  <button
                    onClick={() => setLessonSubTab('notes')}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Return to Lesson Notes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Course Catalog Root View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Back to Home Quick Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Offline Vocational Academy
        </span>
      </div>

      {/* Header Banner with Vocational Repair image (Fixed for Cloudflare production build) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
            Module One · Offline Skills Academy
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Practical Income-Generating Trades
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Download step-by-step courses once over Wi-Fi or mobile data, then learn indefinitely offline. Study notes, visual schematics, comprehensive quizzes, and verified certification after passing (&gt; 70%).
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {courses.length} Comprehensive Courses
            </span>
            {certificates.length > 0 && (
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {certificates.length} Certificate(s) Earned
              </span>
            )}
          </div>
        </div>

        {/* Hero image with proper Cloudflare production path */}
        <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
          <img
            src="/images/hero_learn.jpg"
            alt="Bulawayo vocational students repairing electronics"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'digital', label: 'AI & Cyber Security' },
          { id: 'technical', label: 'Welding, Solar & Motors' },
          { id: 'construction', label: 'Bricklaying & Carpentry' },
          { id: 'safety', label: 'First Aid & Safety' },
          { id: 'finance', label: 'SME Bookkeeping' },
          { id: 'home', label: 'Tailoring & Crafts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeCategory === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => {
              setSelectedCourseId(course.id);
              setSelectedLessonIndex(0);
              setLessonSubTab('notes');
              handleResetQuiz();
            }}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {course.categoryLabel}
                </span>
                <button
                  onClick={(e) => handleDownloadToggle(course.id, e)}
                  className={`p-1.5 rounded-lg transition ${
                    course.isDownloaded
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-400 hover:text-slate-700 bg-slate-50'
                  }`}
                  title={course.isDownloaded ? 'Downloaded to phone' : 'Download for offline use'}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                {course.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.durationHours} hrs
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <HardDrive className="w-3 h-3 text-slate-400" /> {course.storageSizeMb} MB
                </span>
                <span className="text-[11px] font-bold text-teal-600">
                  {course.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
                  Open Course Notes <ArrowRight className="w-3.5 h-3.5" />
                </span>
                {course.isDownloaded && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Offline Ready
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
