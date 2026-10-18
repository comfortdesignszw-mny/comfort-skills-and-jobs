import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Download, 
  HardDrive, 
  RefreshCw, 
  ShieldCheck, 
  Coins, 
  Globe, 
  FileText,
  ChevronLeft,
  Lock,
  Camera,
  Trash2,
  Plus,
  Printer,
  Sparkles,
  Layout,
  Car,
  Languages,
  Check,
  Eye,
  AlertTriangle,
  Building2,
  X,
  ExternalLink,
  Clock,
  RotateCcw,
  GraduationCap,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { 
  UserProfile, 
  CVDetails, 
  CVTemplateId, 
  CVExperience, 
  CVEducation, 
  CVReference, 
  EmployerKYC, 
  Certificate 
} from '../types';
import { saveUserProfileToFirestore, ADMIN_EMAIL } from '../firebase';
import { compressImageFile } from '../utils/imageCompression';
import { CVRenderer } from '../components/CVRenderer';
import jsPDF from 'jspdf';

const TEMPLATE_OPTIONS: Array<{ id: CVTemplateId; label: string; description: string; badge: string; color: string }> = [
  {
    id: 'modern_teal',
    label: 'Modern Teal',
    description: 'Fresh 2-column layout with sidebar and prominent skill badges.',
    badge: 'Popular',
    color: 'from-teal-600 to-teal-800'
  },
  {
    id: 'executive_navy',
    label: 'Executive Navy',
    description: 'Corporate serif style ideal for supervisors, managers, and contractors.',
    badge: 'Formal',
    color: 'from-slate-800 to-slate-950'
  },
  {
    id: 'clean_minimal',
    label: 'Clean Minimal',
    description: 'High-whitespace design focusing purely on experience and clarity.',
    badge: 'Simple',
    color: 'from-slate-600 to-slate-800'
  },
  {
    id: 'technical_slate',
    label: 'Technical Slate',
    description: 'Engineering & trades design with safety and licensing blocks.',
    badge: 'Artisan',
    color: 'from-cyan-700 to-slate-900'
  },
  {
    id: 'bold_compact',
    label: 'Bold Compact',
    description: 'Single-page high-density emerald design for maximum impact.',
    badge: 'High Impact',
    color: 'from-emerald-700 to-emerald-950'
  }
];

export const ProfileView: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    currency, 
    toggleCurrency, 
    language, 
    setLanguage, 
    storageStats, 
    showToast,
    currentUser,
    setShowAuthModal,
    setActiveTab
  } = useApp();

  const certificates = StorageEngine.getCertificates();
  const applications = StorageEngine.getApplications();

  // Primary top-level separation: Profile vs CV
  const [topTab, setTopTab] = useState<'profile' | 'cv'>('profile');

  // Profile-specific editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: userProfile.fullName || '',
    phone: userProfile.phone || '',
    email: userProfile.email || '',
    suburb: userProfile.suburb || 'Bulawayo CBD',
    city: userProfile.city || 'Bulawayo',
    headline: userProfile.headline || '',
    bio: userProfile.bio || '',
    avatarUrl: userProfile.avatarUrl || ''
  });

  // CV Details & state
  const [cvData, setCvData] = useState<CVDetails>(() => StorageEngine.getCVDetails());
  const [activeCVSubTab, setActiveCVSubTab] = useState<'preview' | 'templates' | 'editor'>('preview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Sub-items forms in CV Editor
  const [newCvSkill, setNewCvSkill] = useState('');
  const [newCvLang, setNewCvLang] = useState('');
  const [newCustomCert, setNewCustomCert] = useState('');

  // Experience sub-form
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('Bulawayo');
  const [expStart, setExpStart] = useState('2023');
  const [expEnd, setExpEnd] = useState('Present');
  const [expCurrent, setExpCurrent] = useState(true);
  const [expResp, setExpResp] = useState('');

  // Education sub-form
  const [eduQual, setEduQual] = useState('');
  const [eduInst, setEduInst] = useState('');
  const [eduYear, setEduYear] = useState('2024');

  // Reference sub-form
  const [refName, setRefName] = useState('');
  const [refTitle, setRefTitle] = useState('');
  const [refCompany, setRefCompany] = useState('');
  const [refPhone, setRefPhone] = useState('+263 7');

  // Admin and KYC states
  const isAdmin = Boolean(currentUser?.email && (currentUser.email === ADMIN_EMAIL || currentUser.email.startsWith('admin@')));
  const isEmployerVerified = userProfile.isEmployerVerified || userProfile.employerKYCStatus === 'verified' || isAdmin;

  const [showKYCSubmitModal, setShowKYCSubmitModal] = useState(false);
  const [showKYCStatusModal, setShowKYCStatusModal] = useState(false);
  const [kycFullName, setKycFullName] = useState(userProfile.fullName || currentUser?.displayName || '');
  const [kycIdNumber, setKycIdNumber] = useState(userProfile.employerKYC?.idNumber || '');
  const [kycCompanyName, setKycCompanyName] = useState(userProfile.employerKYC?.companyName || '');
  const [kycCompanyReg, setKycCompanyReg] = useState(userProfile.employerKYC?.companyRegNumber || '');
  const [kycIdPhoto, setKycIdPhoto] = useState(userProfile.employerKYC?.idPhotoUrl || '');
  const [kycCr14Photo, setKycCr14Photo] = useState(userProfile.employerKYC?.cr14PhotoUrl || '');

  // Admin KYC queue
  const [adminKYCList, setAdminKYCList] = useState<EmployerKYC[]>([]);
  const [adminLoadingKYC, setAdminLoadingKYC] = useState(false);

  // Sync profile data into state on change
  useEffect(() => {
    setProfileFormData({
      fullName: userProfile.fullName || '',
      phone: userProfile.phone || '',
      email: userProfile.email || '',
      suburb: userProfile.suburb || 'Bulawayo CBD',
      city: userProfile.city || 'Bulawayo',
      headline: userProfile.headline || '',
      bio: userProfile.bio || '',
      avatarUrl: userProfile.avatarUrl || ''
    });
  }, [userProfile]);

  // Load CV details reactive to certificates or profile changes
  useEffect(() => {
    setCvData(StorageEngine.getCVDetails());
  }, [userProfile, certificates.length]);

  const loadAdminKYCData = async () => {
    if (!isAdmin) return;
    setAdminLoadingKYC(true);
    try {
      const list = await StorageEngine.getAllKYCApplications();
      setAdminKYCList(list);
    } catch (e) {
      console.warn('Could not load KYC applications:', e);
    } finally {
      setAdminLoadingKYC(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminKYCData();
    }
  }, [isAdmin]);

  // ================= SAVE PROFILE (DOES NOT TOUCH CUSTOM CV) =================
  const handleSaveProfileOnly = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      fullName: profileFormData.fullName.trim() || userProfile.fullName,
      phone: profileFormData.phone.trim(),
      email: profileFormData.email.trim(),
      suburb: profileFormData.suburb.trim(),
      city: profileFormData.city.trim(),
      headline: profileFormData.headline.trim(),
      bio: profileFormData.bio.trim(),
      avatarUrl: profileFormData.avatarUrl
      // Note: cvDetails is explicitly preserved as-is inside StorageEngine.saveUserProfile
    };

    updateUserProfile(updated);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, updated);
    }
    setIsEditingProfile(false);
    showToast('Account Profile updated without altering CV details.');
  };

  // Explicit sync from profile to CV when requested by user
  const handleSyncProfileToCV = () => {
    const updatedCV = StorageEngine.syncProfileToCV();
    setCvData(updatedCV);
    showToast('Basic contact info from your profile synchronized to your CV.');
  };

  // ================= SAVE CV DETAILS (INDEPENDENT FROM PROFILE) =================
  const handleSaveCVDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    StorageEngine.saveCVDetails(cvData);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, {
        ...userProfile,
        cvDetails: cvData,
        cvTemplate: cvData.template
      });
    }
    setActiveCVSubTab('preview');
    showToast('Professional CV saved successfully!');
  };

  const handleSelectTemplate = (templateId: CVTemplateId) => {
    const updatedCV: CVDetails = {
      ...cvData,
      template: templateId
    };
    setCvData(updatedCV);
    StorageEngine.saveCVDetails(updatedCV);
    showToast(`Template changed to ${TEMPLATE_OPTIONS.find((t) => t.id === templateId)?.label}.`);
  };

  // ================= SUB-LIST EDITING IN CV BUILDER =================
  const handleAddExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) {
      showToast('Please enter both job title and employer name.');
      return;
    }
    const newExp: CVExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: expTitle.trim(),
      company: expCompany.trim(),
      location: expLocation.trim(),
      startDate: expStart.trim(),
      endDate: expCurrent ? 'Present' : expEnd.trim(),
      isCurrent: expCurrent,
      responsibilities: expResp.trim() || 'General vocational duties, quality delivery, and customer service.'
    };
    const updated = {
      ...cvData,
      experiences: [newExp, ...(cvData.experiences || [])]
    };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
    setExpTitle('');
    setExpCompany('');
    setExpResp('');
    showToast('Work experience entry added to CV.');
  };

  const handleRemoveExperience = (id: string) => {
    const updated = {
      ...cvData,
      experiences: (cvData.experiences || []).filter((e) => e.id !== id)
    };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
    showToast('Experience entry removed.');
  };

  const handleAddEducation = () => {
    if (!eduQual.trim() || !eduInst.trim()) {
      showToast('Please enter both qualification and institution name.');
      return;
    }
    const newEdu: CVEducation = {
      id: `edu-${Date.now()}`,
      qualification: eduQual.trim(),
      institution: eduInst.trim(),
      yearCompleted: eduYear.trim()
    };
    const updated = {
      ...cvData,
      educations: [newEdu, ...(cvData.educations || [])]
    };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
    setEduQual('');
    setEduInst('');
    showToast('Education entry added to CV.');
  };

  const handleRemoveEducation = (id: string) => {
    const updated = {
      ...cvData,
      educations: (cvData.educations || []).filter((e) => e.id !== id)
    };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
    showToast('Education entry removed.');
  };

  const handleAddReference = () => {
    if (!refName.trim() || !refCompany.trim()) {
      showToast('Please enter both reference contact name and company.');
      return;
    }
    const newRef: CVReference = {
      id: `ref-${Date.now()}`,
      name: refName.trim(),
      jobTitle: refTitle.trim() || 'Supervisor',
      company: refCompany.trim(),
      phone: refPhone.trim(),
      relationship: 'Professional Referee'
    };
    const updated = {
      ...cvData,
      references: [newRef, ...(cvData.references || [])]
    };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
    setRefName('');
    setRefCompany('');
    showToast('Professional reference added.');
  };

  const handleRemoveReference = (id: string) => {
    const updated = {
      ...cvData,
      references: (cvData.references || []).filter((r) => r.id !== id)
    };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
    showToast('Reference removed.');
  };

  const handleAddSkill = () => {
    if (!newCvSkill.trim()) return;
    const current = cvData.skills || [];
    if (!current.includes(newCvSkill.trim())) {
      const updated = { ...cvData, skills: [...current, newCvSkill.trim()] };
      setCvData(updated);
      StorageEngine.saveCVDetails(updated);
      setNewCvSkill('');
      showToast('Skill added to CV.');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = { ...cvData, skills: (cvData.skills || []).filter((s) => s !== skill) };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
  };

  const handleAddCustomCert = () => {
    if (!newCustomCert.trim()) return;
    const current = cvData.customCertifications || [];
    if (!current.includes(newCustomCert.trim())) {
      const updated = { ...cvData, customCertifications: [...current, newCustomCert.trim()] };
      setCvData(updated);
      StorageEngine.saveCVDetails(updated);
      setNewCustomCert('');
      showToast('Certification added to CV.');
    }
  };

  const handleRemoveCustomCert = (cert: string) => {
    const updated = { ...cvData, customCertifications: (cvData.customCertifications || []).filter((c) => c !== cert) };
    setCvData(updated);
    StorageEngine.saveCVDetails(updated);
  };

  // Toggle role capabilities
  const toggleRole = (role: 'learner' | 'jobseeker' | 'worker' | 'employer' | 'business_owner') => {
    if (role === 'employer' && !isEmployerVerified) {
      if (userProfile.employerKYCStatus === 'pending') {
        setShowKYCStatusModal(true);
      } else {
        setShowKYCSubmitModal(true);
      }
      return;
    }

    const currentRoles = userProfile.roles || [];
    const hasRole = currentRoles.includes(role);
    let newRoles: typeof currentRoles;

    if (hasRole) {
      if (currentRoles.length === 1) {
        showToast('You must maintain at least one active role.');
        return;
      }
      newRoles = currentRoles.filter((r) => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }

    const updated = { ...userProfile, roles: newRoles };
    updateUserProfile(updated);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, updated);
    }
    showToast(`Updated role capabilities.`);
  };

  // Admin KYC handlers
  const handleAdminReviewKYC = async (userId: string, status: 'verified' | 'rejected', reason?: string) => {
    try {
      const reviewer = currentUser?.email || 'admin@comfortskills.com';
      await StorageEngine.reviewEmployerKYC(userId, status, reviewer, reason);
      showToast(`Applicant ${status === 'verified' ? 'approved as Verified Employer.' : 'marked as rejected.'}`);
      await loadAdminKYCData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update KYC status.');
    }
  };

  // Direct, safe, high-speed PDF export using pure jsPDF (0 CORS, 0 cssRules errors, 100% offline)
  const handleExportPDF = () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Generating official vector CV PDF...');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 14;
      let y = 18;

      // Header Accent Block
      doc.setFillColor(13, 148, 136); // Teal 600
      doc.rect(margin, y - 4, 182, 22, 'F');

      // Full Name
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text((cvData.fullName || userProfile.fullName || 'Professional CV').toUpperCase(), margin + 5, y + 5);

      // Headline
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(cvData.headline || userProfile.headline || 'Vocational Technician & Specialist', margin + 5, y + 12);

      y += 24;

      // Contact Info Line
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      const contactElements = [
        cvData.phone || userProfile.phone || '',
        cvData.email || userProfile.email || '',
        `${cvData.suburb || userProfile.suburb || 'Bulawayo CBD'}, ${cvData.city || userProfile.city || 'Bulawayo'}`,
        cvData.driverLicense ? `Lic: ${cvData.driverLicense}` : ''
      ].filter(Boolean);
      doc.text(contactElements.join('   |   '), margin, y);

      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, margin + 182, y);
      y += 6;

      // Professional Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const summaryText = cvData.summary || userProfile.bio || 'Dedicated, certified vocational artisan committed to precision workmanship, safety compliance, and high quality deliverables.';
      const summaryLines = doc.splitTextToSize(summaryText, 182);
      doc.text(summaryLines, margin, y);
      y += (summaryLines.length * 4.5) + 5;

      // Core Skills & Languages
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('CORE SKILLS & LANGUAGES', margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const skillsStr = (cvData.skills && cvData.skills.length > 0) ? cvData.skills.join(', ') : 'Vocational Trades, Quality Assurance, Customer Service';
      const langStr = (cvData.languages && cvData.languages.length > 0) ? cvData.languages.join(', ') : 'English, isiNdebele, chiShona';
      const skillsLines = doc.splitTextToSize(`Technical Skills: ${skillsStr}`, 182);
      doc.text(skillsLines, margin, y);
      y += (skillsLines.length * 4.2);
      doc.text(`Languages: ${langStr}`, margin, y);
      y += 7;

      // Work Experience
      const experiences = cvData.experiences || [];
      if (experiences.length > 0) {
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('WORK & TRADE EXPERIENCE', margin, y);
        y += 5;

        experiences.forEach((exp) => {
          if (y > 260) {
            doc.addPage();
            y = 18;
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(exp.jobTitle, margin, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`${exp.company}  |  ${exp.startDate} - ${exp.endDate || 'Present'} (${exp.location})`, margin + 65, y);
          y += 4.2;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const respLines = doc.splitTextToSize(exp.responsibilities, 182);
          doc.text(respLines, margin, y);
          y += (respLines.length * 4) + 3.5;
        });
      }

      // Education & Training
      const educations = cvData.educations || [];
      if (educations.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 18;
        }
        y += 2;
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('EDUCATION & QUALIFICATIONS', margin, y);
        y += 5;

        educations.forEach((edu) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(edu.qualification, margin, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`${edu.institution} (${edu.yearCompleted})`, margin + 85, y);
          y += 4.5;
        });
      }

      // Locally Earned Certificates in Comfort Hub
      const allCerts = [
        ...certificates.map((c) => `${c.courseTitle} Certificate (Earned: ${c.dateEarned}, Score: ${c.scorePercent}%, ID: ${c.verificationCode})`),
        ...(cvData.customCertifications || [])
      ];

      if (allCerts.length > 0) {
        if (y > 250) {
          doc.addPage();
          y = 18;
        }
        y += 2;
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('VERIFIED ACCREDITATIONS & COURSE CERTIFICATES', margin, y);
        y += 5;

        allCerts.forEach((c) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(13, 148, 136); // Teal
          doc.text(`* ${c}`, margin, y);
          y += 4.2;
        });
      }

      // References
      const references = cvData.references || [];
      if (references.length > 0) {
        if (y > 255) {
          doc.addPage();
          y = 18;
        }
        y += 2;
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('PROFESSIONAL REFERENCES', margin, y);
        y += 5;

        references.forEach((ref) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`${ref.name} - ${ref.jobTitle}, ${ref.company}`, margin, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(`Phone: ${ref.phone}`, margin + 115, y);
          y += 4.2;
        });
      }

      const cleanFilename = (cvData.fullName || userProfile.fullName || 'Professional_CV').replace(/\s+/g, '_');
      doc.save(`${cleanFilename}_CV.pdf`);
      showToast('CV PDF generated and downloaded!');
    } catch (e) {
      console.warn('PDF export fallback:', e);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-5">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition"
        >
          <ChevronLeft className="w-4 h-4" /> Home Dashboard
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Account &amp; Professional Profile
        </span>
      </div>

      {/* PRIMARY TWO-TAB CONTROLLER: PROFILE vs CV */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
        <button
          onClick={() => setTopTab('profile')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            topTab === 'profile'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-teal-600" />
          <span>My Account &amp; Profile</span>
        </button>
        <button
          onClick={() => setTopTab('cv')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            topTab === 'cv'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Professional CV &amp; Resume</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MY ACCOUNT & PROFILE                                           */}
      {/* ========================================================================= */}
      {topTab === 'profile' && (
        <div className="space-y-5">
          {/* Account Profile Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative group">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.fullName}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-sm">
                      {userProfile.fullName ? userProfile.fullName.charAt(0) : 'M'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      {userProfile.fullName || 'Member'}
                    </h2>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {userProfile.headline || 'Comfort Skills Hub Member'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {userProfile.suburb || 'Bulawayo CBD'}, {userProfile.city || 'Bulawayo'}
                    </span>
                    {userProfile.phone && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {userProfile.phone}
                        </span>
                      </>
                    )}
                    {userProfile.email && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {userProfile.email}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={() => setIsEditingProfile((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-2xs transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Close Editor' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>

            {/* Platform Roles */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Platform Roles
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-700" />
                    Verified Admin
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'learner', label: 'Learner' },
                  { id: 'jobseeker', label: 'Job Seeker' },
                  { id: 'worker', label: 'Gig Worker' },
                  { id: 'business_owner', label: 'Business Owner' },
                  { 
                    id: 'employer', 
                    label: isEmployerVerified
                      ? 'Employer (Verified)'
                      : userProfile.employerKYCStatus === 'pending'
                      ? 'Employer (Pending KYC)'
                      : 'Employer (Apply for KYC)'
                  }
                ].map((role) => {
                  const active = userProfile.roles.includes(role.id as any);
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>

              {!isAdmin && userProfile.employerKYCStatus === 'pending' && (
                <div className="mt-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 block">Employer KYC In Review</span>
                      <span className="text-[11px] text-amber-700">
                        Awaiting administrator review and verification.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowKYCStatusModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition"
                  >
                    View Status
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* EDIT PROFILE FORM */}
          {isEditingProfile && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Account Profile Details</h3>
                  <p className="text-xs text-slate-500">
                    Changes here update your personal account without altering your customized CV experience or resume layout.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveProfileOnly} className="space-y-4 text-xs">
                {/* Photo Upload */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                  {profileFormData.avatarUrl ? (
                    <img
                      src={profileFormData.avatarUrl}
                      alt="Avatar preview"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                      {profileFormData.fullName ? profileFormData.fullName.charAt(0) : 'M'}
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-slate-800 block">Profile Avatar</span>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer font-bold text-xs shadow-2xs">
                        <Camera className="w-3.5 h-3.5 text-teal-600" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const compressed = await compressImageFile(file, { maxWidth: 500, maxHeight: 500, quality: 0.8 });
                              setProfileFormData((prev) => ({ ...prev, avatarUrl: compressed }));
                              showToast('Profile photo ready.');
                            } catch {
                              showToast('Image processing failed.');
                            }
                          }}
                        />
                      </label>
                      {profileFormData.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                          className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileFormData.fullName}
                      onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Sindi Moyo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Headline / Trade Title</label>
                    <input
                      type="text"
                      value={profileFormData.headline}
                      onChange={(e) => setProfileFormData({ ...profileFormData, headline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Solar Technician & Welder"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileFormData.phone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileFormData.email}
                      onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="member@comfortskills.com"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Suburb / Township</label>
                    <input
                      type="text"
                      value={profileFormData.suburb}
                      onChange={(e) => setProfileFormData({ ...profileFormData, suburb: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Nkulumane, Belmont"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={profileFormData.city}
                      onChange={(e) => setProfileFormData({ ...profileFormData, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="Bulawayo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bio / Personal Description</label>
                  <textarea
                    rows={3}
                    value={profileFormData.bio}
                    onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    placeholder="Short bio about your practical experience, trade background, or business..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSyncProfileToCV}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Copy contact details to CV</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ADMIN VERIFICATION DESK (SECURED, NO PERSONAL EMAILS EXPOSED) */}
          {isAdmin && (
            <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Admin Verification Desk</span>
                      <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                        Employer KYC
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review submitted employer identity and company registration documents.
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadAdminKYCData}
                  disabled={adminLoadingKYC}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminLoadingKYC ? 'animate-spin text-teal-600' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {adminKYCList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  No employer KYC submissions currently in the queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {adminKYCList.map((kyc) => (
                    <div
                      key={kyc.id}
                      className={`p-4 rounded-2xl border text-xs space-y-3 transition ${
                        kyc.status === 'verified'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : kyc.status === 'rejected'
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{kyc.fullName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              kyc.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : kyc.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {kyc.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            Applicant ID: {kyc.userId ? `${kyc.userId.slice(0, 8)}...` : 'N/A'}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">National ID</span>
                          <span className="font-bold text-slate-800 font-mono">{kyc.idNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Company Name</span>
                          <span className="font-bold text-slate-800">{kyc.companyName}</span>
                        </div>
                      </div>

                      {/* Document Links */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {kyc.idPhotoUrl && (
                          <a
                            href={kyc.idPhotoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-teal-700 font-bold text-[11px] hover:bg-teal-50"
                          >
                            <Eye className="w-3.5 h-3.5" /> View National ID
                          </a>
                        )}
                        {kyc.cr14PhotoUrl && (
                          <a
                            href={kyc.cr14PhotoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-teal-700 font-bold text-[11px] hover:bg-teal-50"
                          >
                            <Eye className="w-3.5 h-3.5" /> View CR14 Document
                          </a>
                        )}
                      </div>

                      {/* Approval Actions */}
                      {kyc.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                          <button
                            onClick={() => handleAdminReviewKYC(kyc.userId, 'verified')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Approve as Verified Employer
                          </button>
                          <button
                            onClick={() => handleAdminReviewKYC(kyc.userId, 'rejected', 'Documentation unclear or incomplete')}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                          >
                            Reject Application
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* System Preferences & Offline Storage Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-600" />
              <span>Offline System &amp; Data Controls</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Currency</span>
                <button
                  onClick={toggleCurrency}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <span>{currency === 'USD' ? 'USD ($)' : 'ZiG (ZWG)'}</span>
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Language</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  {(['en', 'nd', 'sn'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`flex-1 py-1 rounded-lg transition uppercase ${
                        language === l ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Offline Storage</span>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{storageStats.totalKb} KB used</span>
                  <span className="text-[10px] text-teal-700 font-semibold">{storageStats.courseCount} courses saved</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const json = StorageEngine.exportBackupJSON();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `comfort_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    showToast('Database exported as backup JSON.');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                >
                  Export Backup
                </button>
              </div>

              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to wipe local test data and reset to defaults?')) {
                    await StorageEngine.wipeUserData();
                    showToast('Personal test records reset.');
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold"
              >
                Reset Local Storage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: PROFESSIONAL CV & RESUME                                      */}
      {/* ========================================================================= */}
      {topTab === 'cv' && (
        <div className="space-y-5">
          {/* Sub Navigation Bar for CV */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCVSubTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCVSubTab === 'preview'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview &amp; Export</span>
              </button>
              <button
                onClick={() => setActiveCVSubTab('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCVSubTab === 'editor'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit CV Details</span>
              </button>
              <button
                onClick={() => setActiveCVSubTab('templates')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeCVSubTab === 'templates'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Templates</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncProfileToCV}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                title="Update CV name, contact, address from Profile"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Sync from Profile</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                title="Print or Save as PDF via Browser"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: CV PREVIEW */}
          {activeCVSubTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Template: <strong className="text-slate-900">{TEMPLATE_OPTIONS.find((t) => t.id === cvData.template)?.label}</strong></span>
                <button
                  onClick={() => setActiveCVSubTab('editor')}
                  className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit tailored CV details
                </button>
              </div>

              {/* High Fidelity CV Render Component */}
              <div className="overflow-x-auto bg-slate-100 p-2 sm:p-6 rounded-3xl border border-slate-200 shadow-inner">
                <CVRenderer
                  profile={{
                    ...userProfile,
                    cvDetails: cvData
                  }}
                  certificates={certificates}
                  template={cvData.template || 'modern_teal'}
                />
              </div>
            </div>
          )}

          {/* SUB-TAB 2: TEMPLATE SELECTION */}
          {activeCVSubTab === 'templates' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Choose Professional Layout Template</h3>
                <p className="text-xs text-slate-500">
                  Select the template that best represents your trade, experience level, and industry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {TEMPLATE_OPTIONS.map((tmpl) => {
                  const isSelected = cvData.template === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`h-3 w-8 rounded-full bg-gradient-to-r ${tmpl.color}`}></span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {tmpl.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{tmpl.label}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{tmpl.description}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-700">
                          {isSelected ? 'Active Template ✓' : 'Select Template'}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setActiveCVSubTab('preview')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  Preview with Chosen Template
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DEDICATED CV EDITOR */}
          {activeCVSubTab === 'editor' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Customized CV &amp; Resume Details</h3>
                  <p className="text-xs text-slate-500">
                    Edit your resume summary, employment records, qualifications, and references independently.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCVSubTab('preview')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    View Preview
                  </button>
                  <button
                    onClick={handleSaveCVDetails}
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save CV</span>
                  </button>
                </div>
              </div>

              {/* 1. CV Header Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>CV Contact Header</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name on CV</label>
                    <input
                      type="text"
                      value={cvData.fullName}
                      onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Sindi Moyo"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Professional Title / Headline</label>
                    <input
                      type="text"
                      value={cvData.headline}
                      onChange={(e) => setCvData({ ...cvData, headline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Certified Electrician & Solar Installer"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CV Contact Phone</label>
                    <input
                      type="text"
                      value={cvData.phone}
                      onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="+263 77 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CV Contact Email</label>
                    <input
                      type="email"
                      value={cvData.email}
                      onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="artisan@comfortskills.com"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Suburb / Township</label>
                    <input
                      type="text"
                      value={cvData.suburb}
                      onChange={(e) => setCvData({ ...cvData, suburb: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Kelvin, Bulawayo CBD"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Driver's License (Optional)</label>
                    <input
                      type="text"
                      value={cvData.driverLicense || ''}
                      onChange={(e) => setCvData({ ...cvData, driverLicense: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      placeholder="e.g. Class 4 (Clean) or Class 2"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Professional Summary */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Professional CV Summary</span>
                </h4>
                <textarea
                  rows={3}
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="Tailored resume summary highlighting technical competence, reliability, and work achievements..."
                />
              </div>

              {/* 3. Core Skills & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Technical Trade Skills
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCvSkill}
                      onChange={(e) => setNewCvSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Add trade skill..."
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(cvData.skills || []).map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200"
                      >
                        {sk}
                        <button type="button" onClick={() => handleRemoveSkill(sk)} className="text-teal-600 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Spoken Languages
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCvLang}
                      onChange={(e) => setNewCvLang(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newCvLang.trim()) {
                            const cur = cvData.languages || [];
                            if (!cur.includes(newCvLang.trim())) {
                              const updated = { ...cvData, languages: [...cur, newCvLang.trim()] };
                              setCvData(updated);
                              StorageEngine.saveCVDetails(updated);
                              setNewCvLang('');
                            }
                          }
                        }
                      }}
                      placeholder="e.g. English (Fluent)..."
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCvLang.trim()) {
                          const cur = cvData.languages || [];
                          if (!cur.includes(newCvLang.trim())) {
                            const updated = { ...cvData, languages: [...cur, newCvLang.trim()] };
                            setCvData(updated);
                            StorageEngine.saveCVDetails(updated);
                            setNewCvLang('');
                          }
                        }
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(cvData.languages || []).map((lg) => (
                      <span
                        key={lg}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px]"
                      >
                        {lg}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...cvData, languages: (cvData.languages || []).filter((l) => l !== lg) };
                            setCvData(updated);
                            StorageEngine.saveCVDetails(updated);
                          }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Work Experience Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                  <span>Work &amp; Trade Experience</span>
                </h4>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block text-xs">Add Employment Record</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="Job Title (e.g. Welder)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      placeholder="Company / Workshop"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={expLocation}
                      onChange={(e) => setExpLocation(e.target.value)}
                      placeholder="Location (e.g. Bulawayo)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={expStart}
                      onChange={(e) => setExpStart(e.target.value)}
                      placeholder="Start Year / Month (e.g. 2022-03)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={expEnd}
                      onChange={(e) => setExpEnd(e.target.value)}
                      placeholder="End Year or 'Present'"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={expResp}
                    onChange={(e) => setExpResp(e.target.value)}
                    placeholder="Key responsibilities and achievements..."
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                  >
                    Add Experience Entry
                  </button>
                </div>

                {/* Experience List */}
                <div className="space-y-2">
                  {(cvData.experiences || []).map((exp) => (
                    <div key={exp.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{exp.jobTitle} · {exp.company}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{exp.startDate} - {exp.endDate} ({exp.location})</span>
                        <p className="text-slate-600 mt-1">{exp.responsibilities}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Education & Qualifications Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                  <span>Education &amp; Qualifications</span>
                </h4>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block text-xs">Add Qualification</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={eduQual}
                      onChange={(e) => setEduQual(e.target.value)}
                      placeholder="Qualification (e.g. National Certificate in Motor Mechanics)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={eduInst}
                      onChange={(e) => setEduInst(e.target.value)}
                      placeholder="Institution (e.g. Bulawayo Polytechnic)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={eduYear}
                      onChange={(e) => setEduYear(e.target.value)}
                      placeholder="Year Completed (e.g. 2024)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                  >
                    Add Education Entry
                  </button>
                </div>

                <div className="space-y-2">
                  {(cvData.educations || []).map((edu) => (
                    <div key={edu.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{edu.qualification}</span>
                        <span className="text-[11px] text-slate-500 block">{edu.institution} ({edu.yearCompleted})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Course Certificates (Automatically populated from app achievements) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-600" />
                    <span>Locally Awarded Course Certificates &amp; Accreditations</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Auto-Included on CV
                  </span>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-slate-400 italic text-xs">
                    No course certificates earned yet. Pass courses in the Learn section with &gt; 70% to automatically award verified certificates to your CV.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start gap-2.5">
                        <Award className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-teal-950 block text-xs">{cert.courseTitle}</span>
                          <span className="text-[10px] text-teal-700 block font-mono">
                            Earned: {cert.dateEarned} · Score: {cert.scorePercent}% · Code: {cert.verificationCode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Custom External Certifications */}
                <div className="pt-2 space-y-2">
                  <span className="font-bold text-slate-700 text-xs block">Additional External Certifications</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCustomCert}
                      onChange={(e) => setNewCustomCert(e.target.value)}
                      placeholder="e.g. City & Guilds Trade Test Certificate..."
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCert}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    {(cvData.customCertifications || []).map((c) => (
                      <div key={c} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-800">{c}</span>
                        <button type="button" onClick={() => handleRemoveCustomCert(c)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. References Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>Professional References</span>
                </h4>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block text-xs">Add Professional Referee</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={refName}
                      onChange={(e) => setRefName(e.target.value)}
                      placeholder="Referee Name (e.g. Mr. T. Ndlovu)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={refTitle}
                      onChange={(e) => setRefTitle(e.target.value)}
                      placeholder="Job Title (e.g. Senior Trade Supervisor)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={refCompany}
                      onChange={(e) => setRefCompany(e.target.value)}
                      placeholder="Company / Workshop Name"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={refPhone}
                      onChange={(e) => setRefPhone(e.target.value)}
                      placeholder="Contact Phone (+263 77...)"
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                  >
                    Add Reference
                  </button>
                </div>

                <div className="space-y-2">
                  {(cvData.references || []).map((ref) => (
                    <div key={ref.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{ref.name} - {ref.jobTitle}</span>
                        <span className="text-[11px] text-slate-500 block">{ref.company} · Phone: {ref.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReference(ref.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final CV Save Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveCVSubTab('preview')}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel &amp; Preview
                </button>
                <button
                  type="button"
                  onClick={handleSaveCVDetails}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All CV Changes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KYC SUBMIT MODAL */}
      {showKYCSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Apply for Verified Employer Status</span>
              </h3>
              <button onClick={() => setShowKYCSubmitModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!kycFullName.trim() || !kycIdNumber.trim() || !kycCompanyName.trim()) {
                  showToast('Please fill out all required fields.');
                  return;
                }
                StorageEngine.submitEmployerKYC({
                  fullName: kycFullName.trim(),
                  idNumber: kycIdNumber.trim(),
                  companyName: kycCompanyName.trim(),
                  companyRegNumber: kycCompanyReg.trim(),
                  idPhotoUrl: kycIdPhoto,
                  cr14PhotoUrl: kycCr14Photo
                });
                setShowKYCSubmitModal(false);
                showToast('Employer KYC submitted for admin verification.');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID Number</label>
                <input
                  type="text"
                  value={kycIdNumber}
                  onChange={(e) => setKycIdNumber(e.target.value)}
                  placeholder="e.g. 08-1234567X08"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Company / Business Name</label>
                <input
                  type="text"
                  value={kycCompanyName}
                  onChange={(e) => setKycCompanyName(e.target.value)}
                  placeholder="e.g. Matabeleland Trades Ltd"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Reg / CR14 Number (Optional)</label>
                <input
                  type="text"
                  value={kycCompanyReg}
                  onChange={(e) => setKycCompanyReg(e.target.value)}
                  placeholder="e.g. CR 1234/2023"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKYCSubmitModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC STATUS MODAL */}
      {showKYCStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <Clock className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-900">Employer KYC Under Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your company registration and identity details are currently in the queue for administrator review.
              Once approved, you will be able to post official vacancies and search verified candidates.
            </p>
            <button
              onClick={() => setShowKYCStatusModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
