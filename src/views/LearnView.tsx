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
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { Course, CourseLesson, Certificate } from '../types';

export const LearnView: React.FC = () => {
  const { 
    selectedCourseId, 
    setSelectedCourseId, 
    setActiveTab, 
    setWorkSubTab,
    setSelectedJobId,
    userProfile, 
    showToast,
    isEffectivelyOnline 
  } = useApp();

  const courses = StorageEngine.getCourses();
  const certificates = StorageEngine.getCertificates();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [showingCertificate, setShowingCertificate] = useState<Certificate | null>(null);

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const handleDownloadToggle = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowDownloaded = StorageEngine.toggleDownloadCourse(courseId);
    showToast(isNowDownloaded ? 'Course saved to phone storage. Ready for offline learning.' : 'Course removed from offline memory.');
  };

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
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

    if (percent >= 70 && activeCourse) {
      // Award certificate!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      const cert = StorageEngine.awardCertificate({
        courseId: activeCourse.id,
        courseTitle: activeCourse.title,
        recipientName: userProfile.fullName || 'Comfort Nyoni',
        scorePercent: percent
      });

      setShowingCertificate(cert);
      showToast(`Congratulations! You passed with ${percent}% and earned your certificate.`);
    } else {
      showToast(`Score: ${percent}%. Review the explanations and retry to earn your certificate.`);
    }
  };

  // Certificate Modal View
  if (showingCertificate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <button
          onClick={() => setShowingCertificate(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-4"
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
              has successfully completed all practical lessons and passed the diagnostic assessment for
            </p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {showingCertificate.courseTitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Issue Date</span>
              <span className="font-semibold text-slate-800">{showingCertificate.dateEarned}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assessment Score</span>
              <span className="font-semibold text-teal-700">{showingCertificate.scorePercent}% Passed</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Code: {showingCertificate.verificationCode}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                Locally Verified
              </span>
            </div>
          </div>

          {/* Connected Action */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                setShowingCertificate(null);
                setActiveTab('work');
                setWorkSubTab('jobs');
              }}
              className="w-full py-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Apply for Jobs Matching This Skill</span>
            </button>
            <button
              onClick={() => {
                setShowingCertificate(null);
                setActiveTab('profile');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              View In My CV Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Course Player / Lesson View
  if (activeCourse) {
    const currentLesson = activeCourse.lessons[selectedLessonIndex] || activeCourse.lessons[0];

    return (
      <div className="max-w-4xl mx-auto px-4 py-4 pb-24 space-y-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedCourseId(null);
              setSelectedLessonIndex(0);
              setQuizSubmitted(false);
              setQuizAnswers({});
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" /> All Courses
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Lesson {selectedLessonIndex + 1} of {activeCourse.lessons.length}
          </span>
        </div>

        {/* Course Header Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
                {activeCourse.categoryLabel}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {activeCourse.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {activeCourse.durationHours} Hours Total
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  {activeCourse.storageSizeMb} MB on device
                </span>
                <span>·</span>
                <span className="text-teal-700 font-semibold">{activeCourse.difficulty}</span>
              </div>
            </div>

            <button
              onClick={(e) => handleDownloadToggle(activeCourse.id, e)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto ${
                activeCourse.isDownloaded
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {activeCourse.isDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Offline Stored</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download for Offline</span>
                </>
              )}
            </button>
          </div>

          {/* Lesson Selector Tabs */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
            {activeCourse.lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonIndex(idx);
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  selectedLessonIndex === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{lesson.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Lesson Content */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
              Step-by-Step Training
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              {currentLesson.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Duration: {currentLesson.durationMinutes} mins · Storage footprint: {currentLesson.storageMb} MB
            </p>
          </div>

          {/* Lightweight Audio / Read-Aloud Summary for Low-Literacy / Hands-busy */}
          {currentLesson.audioSummary && (
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-600 text-white rounded-xl">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-900">Audio Workshop Note (Bulawayo Vernacular)</p>
                  <p className="text-[11px] text-teal-700">{currentLesson.audioSummary}</p>
                </div>
              </div>
              <button
                onClick={() => showToast('Playing offline audio note: Disconnect battery first, organize screws.')}
                className="px-2.5 py-1 bg-white text-teal-800 text-xs font-bold rounded-lg border border-teal-200 hover:bg-teal-100"
              >
                Listen
              </button>
            </div>
          )}

          {/* Practical Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Practical Instructions
            </h4>
            <div className="space-y-2.5">
              {currentLesson.content.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Local Zimbabwe Practical Tip Box */}
          {currentLesson.practicalTip && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Zimbabwe Local Market Tip:</span>
                <p className="text-slate-700 mt-0.5">{currentLesson.practicalTip}</p>
              </div>
            </div>
          )}

          {/* Interactive Lesson Assessment / Quiz */}
          {currentLesson.quiz && currentLesson.quiz.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Quick Diagnostic Quiz ({currentLesson.quiz.length} questions)
                </h4>
              </div>

              <div className="space-y-4">
                {currentLesson.quiz.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <p className="text-xs font-bold text-slate-900">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = quizAnswers[q.id] === optIndex;
                        const isCorrect = q.correctIndex === optIndex;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                        if (quizSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-teal-50 border-teal-600 text-teal-900 font-bold';
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleSelectQuizOption(q.id, optIndex)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                        <strong className="text-slate-900">Explanation: </strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={() => handleFinishQuiz(currentLesson)}
                  disabled={Object.keys(quizAnswers).length < currentLesson.quiz.length}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold transition shadow-xs"
                >
                  Submit Answers &amp; Check Score
                </button>
              ) : (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Retry Quiz
                </button>
              )}
            </div>
          )}

          {/* Career Pathway Recommendation */}
          {activeCourse.careerPathway && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-teal-700 tracking-wider">
                  Recommended Career Pathway
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  Work as: {activeCourse.careerPathway.recommendedJobTitle}
                </p>
                <p className="text-[11px] text-slate-600">
                  Potential earnings: {activeCourse.careerPathway.potentialIncomeRange}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('work');
                  setWorkSubTab('jobs');
                }}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <span>Find Related Work</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Business Startup Guide */}
          {activeCourse.startupGuide && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-teal-300 tracking-wider">
                  Micro-Enterprise Startup Guide
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Start Earning with This Skill Immediately
                </h4>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p>
                  <strong className="text-teal-300">Basic Toolkit: </strong>
                  {activeCourse.startupGuide.equipmentNeeded.join(', ')}
                </p>
                <p>
                  <strong className="text-teal-300">Suggested Bulawayo Rates: </strong>
                  {activeCourse.startupGuide.suggestedPricing}
                </p>
                <p>
                  <strong className="text-teal-300">First Customer Strategy: </strong>
                  {activeCourse.startupGuide.firstCustomerStrategy}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('business')}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs transition"
              >
                Open Small Business Cashbook to Track Income
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Course Catalog Main View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Academy Header Banner with generated image */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
            Comfort Skills Academy
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Offline Practical Skills Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Download step-by-step courses once over Wi-Fi or mobile data, then learn indefinitely offline. Earn verified certificates recognized across Zimbabwe.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {courses.filter((c) => c.isDownloaded).length} Courses Stored Locally
            </span>
            {certificates.length > 0 && (
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {certificates.length} Certificate(s) Earned
              </span>
            )}
          </div>
        </div>

        <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
          <img
            src="/src/assets/images/skills_electronics_repair_1791981121034.jpg"
            alt="Bulawayo vocational students repairing electronics"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'technical', label: 'Technical Trades' },
          { id: 'finance', label: 'Business Finance' },
          { id: 'home', label: 'Home Services' },
          { id: 'agriculture', label: 'Agriculture' }
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {course.categoryLabel}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  course.isDownloaded
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {course.isDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Stored
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3 h-3 text-slate-400" />
                      {course.storageSizeMb} MB
                    </>
                  )}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3 line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {course.durationHours} hrs
                </span>
                <span>·</span>
                <span>{course.lessons.length} lessons</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">{course.difficulty}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                Start Learning <ArrowRight className="w-3 h-3" />
              </span>
              <button
                onClick={(e) => handleDownloadToggle(course.id, e)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition"
                title={course.isDownloaded ? 'Remove from device storage' : 'Download for offline use'}
              >
                <Download className={`w-4 h-4 ${course.isDownloaded ? 'text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
