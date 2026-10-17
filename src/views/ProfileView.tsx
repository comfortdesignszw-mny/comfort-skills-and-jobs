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
  Upload,
  Trash2,
  Image as ImageIcon,
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
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { UserProfile, CVTemplateId, CVExperience, CVEducation, CVReference, EmployerKYC } from '../types';
import { saveUserProfileToFirestore } from '../firebase';
import { compressImageFile } from '../utils/imageCompression';
import { CVRenderer } from '../components/CVRenderer';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

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
    setShowSyncModal,
    showToast,
    currentUser,
    setShowAuthModal,
    signOutUser,
    setActiveTab
  } = useApp();

  const certificates = StorageEngine.getCertificates();
  const applications = StorageEngine.getApplications();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateId>(userProfile.cvTemplate || 'modern_teal');
  const [activeCVTab, setActiveCVTab] = useState<'preview' | 'templates' | 'builder'>('preview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // New Skill Input state
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newLanguageInput, setNewLanguageInput] = useState('');

  // Experience Sub-Form state
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('Bulawayo');
  const [expStart, setExpStart] = useState('2023');
  const [expEnd, setExpEnd] = useState('Present');
  const [expCurrent, setExpCurrent] = useState(true);
  const [expResp, setExpResp] = useState('');

  // Education Sub-Form state
  const [eduQual, setEduQual] = useState('');
  const [eduInst, setEduInst] = useState('');
  const [eduYear, setEduYear] = useState('2024');

  // Reference Sub-Form state
  const [refName, setRefName] = useState('');
  const [refTitle, setRefTitle] = useState('');
  const [refCompany, setRefCompany] = useState('');
  const [refPhone, setRefPhone] = useState('+263 7');

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: UserProfile = {
      ...formData,
      cvTemplate: selectedTemplate
    };
    updateUserProfile(updated);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, updated);
    }
    setIsEditing(false);
    showToast('Professional CV Profile successfully saved!');
  };

  const handleSelectTemplate = (templateId: CVTemplateId) => {
    setSelectedTemplate(templateId);
    setFormData((prev) => ({ ...prev, cvTemplate: templateId }));
    const updated = { ...userProfile, cvTemplate: templateId };
    updateUserProfile(updated);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, updated);
    }
    showToast(`Applied ${TEMPLATE_OPTIONS.find((t) => t.id === templateId)?.label} template.`);
  };

  const handleAddExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) {
      showToast('Please enter Job Title and Company.');
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
      responsibilities: expResp.trim()
    };
    const nextList = [...(formData.structuredExperiences || []), newExp];
    setFormData((prev) => ({ ...prev, structuredExperiences: nextList }));
    setExpTitle('');
    setExpCompany('');
    setExpResp('');
    showToast('Experience added to CV.');
  };

  const handleDeleteExperience = (id: string) => {
    const nextList = (formData.structuredExperiences || []).filter((e) => e.id !== id);
    setFormData((prev) => ({ ...prev, structuredExperiences: nextList }));
  };

  const handleAddEducation = () => {
    if (!eduQual.trim() || !eduInst.trim()) {
      showToast('Please enter Qualification and Institution.');
      return;
    }
    const newEdu: CVEducation = {
      id: `edu-${Date.now()}`,
      qualification: eduQual.trim(),
      institution: eduInst.trim(),
      yearCompleted: eduYear.trim()
    };
    const nextList = [...(formData.structuredEducations || []), newEdu];
    setFormData((prev) => ({ ...prev, structuredEducations: nextList }));
    setEduQual('');
    setEduInst('');
    showToast('Education record added.');
  };

  const handleDeleteEducation = (id: string) => {
    const nextList = (formData.structuredEducations || []).filter((e) => e.id !== id);
    setFormData((prev) => ({ ...prev, structuredEducations: nextList }));
  };

  const handleAddReference = () => {
    if (!refName.trim() || !refPhone.trim()) {
      showToast('Please enter Reference Name and Phone.');
      return;
    }
    const newRef: CVReference = {
      id: `ref-${Date.now()}`,
      name: refName.trim(),
      jobTitle: refTitle.trim() || 'Work Supervisor',
      company: refCompany.trim() || 'Verified Employer',
      phone: refPhone.trim(),
      relationship: 'Professional Contact'
    };
    const nextList = [...(formData.structuredReferences || []), newRef];
    setFormData((prev) => ({ ...prev, structuredReferences: nextList }));
    setRefName('');
    setRefTitle('');
    setRefCompany('');
    setRefPhone('+263 7');
    showToast('Reference added.');
  };

  const handleDeleteReference = (id: string) => {
    const nextList = (formData.structuredReferences || []).filter((r) => r.id !== id);
    setFormData((prev) => ({ ...prev, structuredReferences: nextList }));
  };

  const handleAddSkillTag = () => {
    if (!newSkillInput.trim() || formData.skills.includes(newSkillInput.trim())) return;
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleAddLanguageTag = () => {
    if (!newLanguageInput.trim()) return;
    const current = formData.languages || ['English', 'isiNdebele'];
    if (current.includes(newLanguageInput.trim())) return;
    setFormData((prev) => ({ ...prev, languages: [...current, newLanguageInput.trim()] }));
    setNewLanguageInput('');
  };

  const handleRemoveLanguage = (lang: string) => {
    const current = formData.languages || ['English', 'isiNdebele'];
    setFormData((prev) => ({ ...prev, languages: current.filter((l) => l !== lang) }));
  };

  /**
   * PDF Generation and Export
   * Uses html-to-image to render the selected template into high-res JPEG, then jsPDF to download.
   * Completely immune to Tailwind CSS v4 oklch() color issues.
   */
  const handleExportPDF = async () => {
    const docElement = document.getElementById('cv-print-document');
    if (!docElement) {
      window.print();
      return;
    }

    try {
      setIsGeneratingPdf(true);
      showToast('Rendering high-resolution CV PDF...');

      const imgData = await toJpeg(docElement, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true
      });

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load rasterized CV image.'));
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const cleanName = (userProfile.fullName || 'Professional_CV').replace(/\s+/g, '_');
      pdf.save(`${cleanName}_CV.pdf`);
      showToast('CV PDF successfully downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Opening print dialog to Save as PDF...');
      // Fallback to browser print dialog which supports Save as PDF
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isAdmin = currentUser?.email === 'comfort.designszw@gmail.com';
  const isEmployerVerified = userProfile.isEmployerVerified || userProfile.employerKYCStatus === 'verified' || isAdmin;

  // Employer KYC Modal & Application States
  const [showKYCSubmitModal, setShowKYCSubmitModal] = useState(false);
  const [showKYCStatusModal, setShowKYCStatusModal] = useState(false);
  const [kycFullName, setKycFullName] = useState(userProfile.fullName || currentUser?.displayName || '');
  const [kycIdNumber, setKycIdNumber] = useState(userProfile.employerKYC?.idNumber || '');
  const [kycIdPhoto, setKycIdPhoto] = useState(userProfile.employerKYC?.idPhotoUrl || '');
  const [kycCompanyName, setKycCompanyName] = useState(userProfile.employerKYC?.companyName || '');
  const [kycCompanyReg, setKycCompanyReg] = useState(userProfile.employerKYC?.companyRegNumber || '');
  const [kycCr14Photo, setKycCr14Photo] = useState(userProfile.employerKYC?.cr14PhotoUrl || '');
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [isCompressingKYCID, setIsCompressingKYCID] = useState(false);
  const [isCompressingKYCCR14, setIsCompressingKYCCR14] = useState(false);
  const [selectedKYCPreviewImage, setSelectedKYCPreviewImage] = useState<string | null>(null);

  // Admin Desk KYC state
  const [adminKYCList, setAdminKYCList] = useState<EmployerKYC[]>([]);
  const [adminLoadingKYC, setAdminLoadingKYC] = useState(false);

  const loadAdminKYCData = async () => {
    if (!isAdmin) return;
    setAdminLoadingKYC(true);
    try {
      const all = await StorageEngine.getAllKYCApplications();
      setAdminKYCList(all);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoadingKYC(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminKYCData();
    }
  }, [isAdmin]);

  const handleKYCIDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingKYCID(true);
      const compressed = await compressImageFile(file, { maxWidth: 900, maxHeight: 900, quality: 0.82 });
      setKycIdPhoto(compressed);
      showToast('National ID photo compressed and loaded.');
    } catch {
      showToast('Could not process ID image.');
    } finally {
      setIsCompressingKYCID(false);
    }
  };

  const handleKYCCR14Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingKYCCR14(true);
      const compressed = await compressImageFile(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
      setKycCr14Photo(compressed);
      showToast('Company CR14 document loaded.');
    } catch {
      showToast('Could not process CR14 document.');
    } finally {
      setIsCompressingKYCCR14(false);
    }
  };

  const handleSubmitEmployerKYC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName.trim() || !kycIdNumber.trim() || !kycCompanyName.trim()) {
      showToast('Please provide your Full Name, National ID Number, and Company Name.');
      return;
    }
    if (!kycIdPhoto) {
      showToast('Please upload a photo of your National ID.');
      return;
    }

    setIsSubmittingKYC(true);
    try {
      StorageEngine.submitEmployerKYC({
        fullName: kycFullName.trim(),
        idNumber: kycIdNumber.trim(),
        idPhotoUrl: kycIdPhoto,
        companyName: kycCompanyName.trim(),
        companyRegNumber: kycCompanyReg.trim() || undefined,
        cr14PhotoUrl: kycCr14Photo || undefined
      });

      setShowKYCSubmitModal(false);
      showToast('Employer KYC submitted! It will be reviewed by administration shortly.');
      if (isAdmin) {
        loadAdminKYCData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to submit KYC.');
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const handleAdminReviewKYC = async (userId: string, status: 'verified' | 'rejected', reason?: string) => {
    try {
      const reviewer = currentUser?.email || 'admin@comfortskills.com';
      await StorageEngine.reviewEmployerKYC(userId, status, reviewer, reason);
      showToast(`Applicant successfully ${status === 'verified' ? 'approved as Verified Employer!' : 'rejected.'}`);
      await loadAdminKYCData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update KYC status.');
    }
  };

  const toggleRole = (role: 'learner' | 'jobseeker' | 'worker' | 'employer' | 'business_owner') => {
    // If activating Employer role, require verified KYC
    if (role === 'employer' && !formData.roles.includes('employer')) {
      if (!isEmployerVerified) {
        if (userProfile.employerKYCStatus === 'pending') {
          showToast('Your Employer KYC application is currently pending administrator review.');
          setShowKYCStatusModal(true);
          return;
        }
        setShowKYCSubmitModal(true);
        return;
      }
    }

    let nextRoles = [...formData.roles];
    if (nextRoles.includes(role)) {
      if (nextRoles.length > 1) {
        nextRoles = nextRoles.filter((r) => r !== role);
      } else {
        showToast('You must keep at least one active role.');
        return;
      }
    } else {
      nextRoles.push(role);
    }
    setFormData((prev) => ({ ...prev, roles: nextRoles }));
    const updated = { ...userProfile, roles: nextRoles };
    updateUserProfile(updated);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, updated);
    }
  };

  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackupData = () => {
    try {
      const jsonStr = StorageEngine.exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `comfort_skills_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Database backup successfully exported as JSON file.');
    } catch (err) {
      console.error('Backup error:', err);
      showToast('Failed to export backup JSON.');
    }
  };

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const success = StorageEngine.restoreBackupJSON(content);
        if (success) {
          showToast('Data restored successfully! Refreshing view...');
          const updated = StorageEngine.getUserProfile();
          setFormData(updated);
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          showToast('Invalid JSON file format. Please upload a valid Comfort Hub backup.');
        }
      } catch (err) {
        console.error('Restore error:', err);
        showToast('Error reading backup file.');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmWipe = async () => {
    try {
      setIsWiping(true);
      await StorageEngine.wipeUserData();
      const cleanProfile = StorageEngine.getUserProfile();
      setFormData(cleanProfile);
      setShowWipeConfirm(false);
      showToast('All your user transactions and personal records have been completely wiped.');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error('Wipe error:', err);
      showToast('Failed to wipe user data.');
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Top Navigation & Back to Home */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Professional CV Studio &amp; Account
        </span>
      </div>

      {/* Privacy Notice when Logged Out */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 border border-teal-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
              <Lock className="w-3 h-3" /> Personal Credentials Protected
            </div>
            <h3 className="text-base font-bold text-white">
              Profile, CV &amp; Locally Awarded Certificates Secured
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              To protect your privacy across shared devices, all personal CV details, job applications, course progress, and verified certificates are saved to your personal account. Sign in to view and manage your credentials.
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition whitespace-nowrap self-start sm:self-auto"
          >
            Sign In / Access Profile
          </button>
        </div>
      )}

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
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
                  {userProfile.fullName ? userProfile.fullName.charAt(0) : 'C'}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {userProfile.fullName || 'Comfort Member'}
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {userProfile.headline || 'Vocational Technician & Tradesperson'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile.suburb || 'Bulawayo CBD'}, {userProfile.city || 'Bulawayo'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile.phone || '+263 77 234 5678'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setFormData(userProfile);
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-2xs transition"
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save CV Profile</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit CV Details</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition"
              title="Download PDF or Print"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Print / Save PDF'}</span>
            </button>
          </div>
        </div>

        {/* Roles Badges */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Active Multi-Role Permissions (Tap to toggle)
            </span>
            {isAdmin && (
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-700" />
                Verified Administrator
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'learner', label: '🎓 Learner' },
              { id: 'jobseeker', label: '💼 Job Seeker' },
              { id: 'worker', label: '🤝 Gig Worker' },
              { id: 'business_owner', label: '🏪 Business Owner' },
              { 
                id: 'employer', 
                label: isEmployerVerified
                  ? '🏢 Employer (Verified ✓)'
                  : userProfile.employerKYCStatus === 'pending'
                  ? '🏢 Employer (Pending KYC ⏳)'
                  : '🏢 Employer (Tap for KYC 🔒)'
              }
            ].map((role) => {
              const active = formData.roles.includes(role.id as any);
              return (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* User KYC pending notice */}
          {!isAdmin && userProfile.employerKYCStatus === 'pending' && (
            <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-amber-900 block">Employer KYC In Review</span>
                  <span className="text-[11px] text-amber-700">
                    Awaiting administrator review and verification
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

      {/* ================= ADMIN VERIFICATION DESK: EMPLOYER KYC ================= */}
      {isAdmin && (
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Admin Employer KYC Verification Desk</span>
                  <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Admin Portal
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Secure Administrator Workspace · Review and approve employer identities and CR14 company documents
                </p>
              </div>
            </div>

            <button
              onClick={loadAdminKYCData}
              disabled={adminLoadingKYC}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${adminLoadingKYC ? 'animate-spin text-teal-600' : ''}`} />
              <span>Refresh KYC Queue</span>
            </button>
          </div>

          {adminKYCList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No employer KYC submissions currently in the queue. When users apply for the Employer role, their National ID and company registration forms will appear here for verification.
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
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
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{kyc.userEmail || `User: ${kyc.userId}`}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company Name</span>
                      <span className="font-bold text-slate-800">{kyc.companyName}</span>
                      {kyc.companyRegNumber && (
                        <p className="text-[11px] text-slate-500">Reg #: {kyc.companyRegNumber}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">National ID Number</span>
                      <span className="font-mono font-bold text-slate-800">{kyc.idNumber}</span>
                    </div>
                  </div>

                  {/* Document Thumbnails */}
                  <div className="flex flex-wrap gap-4 items-center pt-1">
                    {kyc.idPhotoUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ID Photo</span>
                        <div 
                          onClick={() => setSelectedKYCPreviewImage(kyc.idPhotoUrl)}
                          className="w-20 h-14 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500 bg-slate-100"
                        >
                          <img src={kyc.idPhotoUrl} alt="National ID" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    {kyc.cr14PhotoUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CR14 Form</span>
                        <div 
                          onClick={() => setSelectedKYCPreviewImage(kyc.cr14PhotoUrl!)}
                          className="w-20 h-14 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500 bg-slate-100"
                        >
                          <img src={kyc.cr14PhotoUrl} alt="CR14 Form" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin Decision Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    {kyc.status !== 'verified' && (
                      <button
                        onClick={() => handleAdminReviewKYC(kyc.userId, 'verified')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve &amp; Verify Employer</span>
                      </button>
                    )}

                    {kyc.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Optional rejection reason (e.g. ID blurry, company unverified):') || 'Details could not be verified';
                          handleAdminReviewKYC(kyc.userId, 'rejected', reason);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= CV TEMPLATE & VIEW TABS ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCVTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCVTab === 'preview'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live CV Preview</span>
            </button>
            <button
              onClick={() => setActiveCVTab('templates')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCVTab === 'templates'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>5 Professional Templates</span>
            </button>
            <button
              onClick={() => {
                setActiveCVTab('builder');
                setIsEditing(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCVTab === 'builder' || isEditing
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Explicit CV Builder</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: 5 TEMPLATES SELECTION ================= */}
        {activeCVTab === 'templates' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Choose from 5 Industry-Standard CV Templates</h3>
              <p className="text-xs text-slate-500">
                Select your preferred visual structure. All your professional details, certificates, and work experiences adapt instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATE_OPTIONS.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
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
          </div>
        )}

        {/* ================= TAB 2: EXPLICIT CV BUILDER & FORM ================= */}
        {(activeCVTab === 'builder' || isEditing) && (
          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Standard Professional CV Fields</h3>
                <p className="text-xs text-slate-500">Add, edit, and organize all formal CV sections for Zimbabwean and regional employers.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setActiveCVTab('preview');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close Editor
              </button>
            </div>

            {/* Profile Photo / Compressed Upload */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl">
                    {formData.fullName ? formData.fullName.charAt(0) : 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="block font-bold text-slate-800 text-xs">Profile Photo / Passport Portrait</span>
                <p className="text-[11px] text-slate-500">
                  Auto-compressed to web standard (&lt;100KB) to conserve mobile data while syncing.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer font-bold text-xs shadow-2xs transition">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const compressed = await compressImageFile(file, { maxWidth: 500, maxHeight: 500, quality: 0.8 });
                          setFormData((prev) => ({ ...prev, avatarUrl: compressed }));
                          showToast('Profile image uploaded and compressed.');
                        } catch {
                          showToast('Could not process image.');
                        }
                      }}
                    />
                  </label>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Core Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name (As on ID)</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="e.g. Comfort Nyoni"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Professional Title / Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="e.g. Certified Electrician & Solar Installer"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp / Calls)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="+263 77 234 5678"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="name@comfortskills.com"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Suburb / Residential Area</label>
                <input
                  type="text"
                  value={formData.suburb}
                  onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="e.g. Nkulumane 12, Morningside"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="Bulawayo"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver’s License (Optional)</label>
                <input
                  type="text"
                  value={formData.driverLicense || ''}
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  placeholder="e.g. Class 2 & 4 (Clean)"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred CV Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleSelectTemplate(e.target.value as CVTemplateId)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label} ({t.badge})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Professional Summary / Bio */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Professional Summary / Career Objective</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed"
                placeholder="Write a concise 3-4 sentence overview of your vocational experience, punctuality, and work ethic."
              />
            </div>

            {/* Skills Tags Section */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">Technical &amp; Vocational Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkillTag();
                    }
                  }}
                  className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Add skill (e.g. Solar Inverter Setup, Arc Welding, QuickBooks)..."
                />
                <button
                  type="button"
                  onClick={handleAddSkillTag}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-xs font-semibold"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">Languages Spoken</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguageInput}
                  onChange={(e) => setNewLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguageTag();
                    }
                  }}
                  className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Add language (e.g. English - Fluent, isiNdebele - Native, chiShona - Conversational)..."
                />
                <button
                  type="button"
                  onClick={handleAddLanguageTag}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(formData.languages || ['English (Fluent)', 'isiNdebele (Fluent)', 'chiShona (Working)']).map((lang, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Work & Trade Experiences (Structured) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="block font-bold text-slate-900 text-xs">
                Work &amp; Trade Experience History
              </span>

              {/* Existing items list */}
              <div className="space-y-2">
                {(formData.structuredExperiences || []).map((exp) => (
                  <div key={exp.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{exp.jobTitle} · <span className="text-teal-700">{exp.company}</span></p>
                      <p className="text-[11px] text-slate-500">{exp.startDate} – {exp.endDate} · {exp.location}</p>
                      <p className="text-slate-600 mt-1 whitespace-pre-line text-[11px]">{exp.responsibilities}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Experience Subform */}
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">+ Add New Employment / Field Contract</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder="Job Title (e.g. Lead Welder, Maintenance Tech)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    placeholder="Company or Employer (e.g. Belmont Steel Works)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={expLocation}
                    onChange={(e) => setExpLocation(e.target.value)}
                    placeholder="Location (e.g. Bulawayo)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={expStart}
                      onChange={(e) => setExpStart(e.target.value)}
                      placeholder="Start (2022)"
                      className="w-1/2 p-2 rounded-lg border border-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      value={expCurrent ? 'Present' : expEnd}
                      disabled={expCurrent}
                      onChange={(e) => setExpEnd(e.target.value)}
                      placeholder="End (2024)"
                      className="w-1/2 p-2 rounded-lg border border-slate-200 text-xs disabled:bg-slate-100"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={expCurrent}
                    onChange={(e) => setExpCurrent(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>I currently work in this position</span>
                </label>
                <textarea
                  rows={2}
                  value={expResp}
                  onChange={(e) => setExpResp(e.target.value)}
                  placeholder="Key responsibilities and achievements (e.g. Installed over 40 solar geysers with zero fault reports)..."
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
                >
                  Add Experience Record
                </button>
              </div>
            </div>

            {/* Education & Vocational Qualifications (Structured) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="block font-bold text-slate-900 text-xs">
                Education &amp; Qualifications
              </span>

              <div className="space-y-2">
                {(formData.structuredEducations || []).map((edu) => (
                  <div key={edu.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{edu.qualification}</p>
                      <p className="text-[11px] text-slate-500">{edu.institution} · {edu.yearCompleted}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">+ Add Qualification / Certificate</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={eduQual}
                    onChange={(e) => setEduQual(e.target.value)}
                    placeholder="Qualification (e.g. National Certificate in Electrical)"
                    className="p-2 rounded-lg border border-slate-200 text-xs sm:col-span-1"
                  />
                  <input
                    type="text"
                    value={eduInst}
                    onChange={(e) => setEduInst(e.target.value)}
                    placeholder="Institution (e.g. Bulawayo Polytechnic)"
                    className="p-2 rounded-lg border border-slate-200 text-xs sm:col-span-1"
                  />
                  <input
                    type="text"
                    value={eduYear}
                    onChange={(e) => setEduYear(e.target.value)}
                    placeholder="Year (e.g. 2024)"
                    className="p-2 rounded-lg border border-slate-200 text-xs sm:col-span-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
                >
                  Add Education Record
                </button>
              </div>
            </div>

            {/* Traceable References (Structured) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="block font-bold text-slate-900 text-xs">
                Traceable References
              </span>

              <div className="space-y-2">
                {(formData.structuredReferences || []).map((ref) => (
                  <div key={ref.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{ref.name} – <span className="text-teal-700">{ref.jobTitle}</span></p>
                      <p className="text-[11px] text-slate-500">{ref.company} · {ref.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteReference(ref.id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">+ Add Reference Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={refName}
                    onChange={(e) => setRefName(e.target.value)}
                    placeholder="Contact Name (e.g. Eng. T. Moyo)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={refTitle}
                    onChange={(e) => setRefTitle(e.target.value)}
                    placeholder="Designation (e.g. Site Supervisor)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={refCompany}
                    onChange={(e) => setRefCompany(e.target.value)}
                    placeholder="Company (e.g. Kelvin Engineering)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={refPhone}
                    onChange={(e) => setRefPhone(e.target.value)}
                    placeholder="Phone Number (+263 77 111 2222)"
                    className="p-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddReference}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
                >
                  Add Reference Record
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setActiveCVTab('preview');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-2xs"
              >
                Save &amp; Update CV
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 3: LIVE PREVIEW & RENDERER ================= */}
        {activeCVTab === 'preview' && !isEditing && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-semibold text-slate-700">
                Template in use: <strong className="text-teal-700 uppercase">{TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate)?.label}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCVTab('templates')}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Change Template
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setActiveCVTab('builder');
                  }}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Edit Details
                </button>
              </div>
            </div>

            {/* The Live Rendered Document */}
            <div className="p-2 sm:p-4 bg-slate-100 rounded-3xl overflow-x-auto border border-slate-200">
              <CVRenderer
                profile={userProfile}
                certificates={certificates}
                template={selectedTemplate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Earned Certificates from Skills Academy */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Locally Issued Certificates ({certificates.length})
            </h3>
            <p className="text-xs text-slate-500">
              Verified records automatically embedded into your printed CV
            </p>
          </div>
          <Award className="w-5 h-5 text-teal-600" />
        </div>

        {certificates.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            You have not earned any certificates yet. Complete lessons and pass the diagnostic quiz in the Skills Academy!
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl border border-teal-200 bg-teal-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-teal-950">{cert.courseTitle}</h4>
                  <p className="text-[11px] text-teal-700">
                    Issued to {cert.recipientName} on {cert.dateEarned} · Score: {cert.scorePercent}%
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Code: {cert.verificationCode}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-teal-600 text-white font-bold text-[10px] uppercase">
                  Verified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline Storage & Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900">
          Device Storage &amp; Localization Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Active Currency
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-slate-800 text-sm">{currency}</span>
              <button
                onClick={toggleCurrency}
                className="text-[10px] font-bold text-teal-700 hover:underline"
              >
                Toggle
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Language
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-slate-800 text-sm">
                {language === 'en' ? 'English' : language === 'nd' ? 'isiNdebele' : 'chiShona'}
              </span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'nd' : language === 'nd' ? 'sn' : 'en')}
                className="text-[10px] font-bold text-teal-700 hover:underline"
              >
                Switch
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Offline Storage
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-slate-800 text-sm">{storageStats.totalKb} KB</span>
              <button
                onClick={() => setShowSyncModal(true)}
                className="text-[10px] font-bold text-teal-700 hover:underline"
              >
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= USER DATA CONTROL & INTEGRITY: BACKUP, RESTORE, WIPE ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Data Integrity &amp; User Total Control
            </h3>
            <p className="text-xs text-slate-500">
              Export complete JSON backups of your transactions, inventory, and credentials, or wipe your personal data at any time.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg shrink-0">
            Self-Sovereign Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Backup Button */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>Backup Data (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Save an offline, human-readable JSON snapshot containing all your cashbook sales, expenses, and credentials.
              </p>
            </div>
            <button
              onClick={handleBackupData}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-2xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Restore Button */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <Upload className="w-4 h-4" />
                <span>Restore Data (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Import and restore a previously saved JSON file. Existing items will be merged and synchronized.
              </p>
            </div>
            <label className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5 text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>{isRestoring ? 'Restoring...' : 'Upload & Restore'}</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleRestoreFileChange}
              />
            </label>
          </div>

          {/* Reset / Wipe User Data Button */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Trash2 className="w-4 h-4" />
                <span>Reset / Wipe User Data</span>
              </div>
              <p className="text-[11px] text-rose-600/80 mt-1 leading-relaxed">
                Permanently purge all user transactions, inventory items, credit ledgers, and profile details from device and cloud.
              </p>
            </div>
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-2xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe User Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wipe Confirmation Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Wipe All Personal Data?
                </h3>
                <p className="text-xs text-rose-600 font-medium">
                  This action is irreversible.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              This will permanently delete all your logged <strong>business transactions</strong>, <strong>stock/inventory records</strong>, <strong>debtor ledgers</strong>, and <strong>custom profile information</strong>. 
              Public courses and job board listings will remain intact.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeConfirm(false)}
                disabled={isWiping}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel / Keep Data
              </button>
              <button
                type="button"
                onClick={handleConfirmWipe}
                disabled={isWiping}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                {isWiping ? (
                  <span>Wiping Data...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Wipe Everything</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= EMPLOYER KYC APPLICATION SUBMISSION MODAL ================= */}
      {showKYCSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Employer KYC Verification Form
                  </h3>
                  <p className="text-xs text-slate-500">
                    Required to unlock vacancy posting privileges
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKYCSubmitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                Zero Recruitment Scam Policy
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                To protect Zimbabwean job seekers, all employers must verify their identity and company legitimacy. Submissions are reviewed by the platform compliance administration.
              </p>
            </div>

            <form onSubmit={handleSubmitEmployerKYC} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycFullName}
                    onChange={(e) => setKycFullName(e.target.value)}
                    placeholder="e.g. Comfort Nyoni"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    National ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycIdNumber}
                    onChange={(e) => setKycIdNumber(e.target.value)}
                    placeholder="e.g. 08-123456-X-08"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 font-medium font-mono"
                  />
                </div>
              </div>

              {/* ID Photo Upload with compression */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  National ID Photo * (Auto-compressed)
                </label>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl border border-slate-300 overflow-hidden shrink-0 bg-white flex items-center justify-center">
                    {kycIdPhoto ? (
                      <img src={kycIdPhoto} alt="ID preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCompressingKYCID ? 'Compressing...' : kycIdPhoto ? 'Change ID Photo' : 'Upload ID Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleKYCIDUpload}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Clear photo of metal/plastic Zimbabwean ID card
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company / Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycCompanyName}
                    onChange={(e) => setKycCompanyName(e.target.value)}
                    placeholder="e.g. Comfort Designs Zimbabwe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company Reg Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={kycCompanyReg}
                    onChange={(e) => setKycCompanyReg(e.target.value)}
                    placeholder="e.g. 1234/2023"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              {/* CR14 Document Form Upload (Optional) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  CR14 / Company Registration Document <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl border border-slate-300 overflow-hidden shrink-0 bg-white flex items-center justify-center">
                    {kycCr14Photo ? (
                      <img src={kycCr14Photo} alt="CR14 preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isCompressingKYCCR14 ? 'Compressing...' : kycCr14Photo ? 'Change CR14 Document' : 'Upload CR14 Form'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleKYCCR14Upload}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Scanned copy or photo of CR14 / Company Incorporation certificate
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKYCSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKYC || isCompressingKYCID || isCompressingKYCCR14}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isSubmittingKYC ? (
                    <span>Submitting KYC...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= KYC STATUS MODAL FOR APPLICANT ================= */}
      {showKYCStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Employer KYC Verification Status
                </h3>
              </div>
              <button
                onClick={() => setShowKYCStatusModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Verification in Progress</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px] uppercase">
                    Pending
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Your identity details and company registration are currently in the queue for administrator review.
                </p>
              </div>

              {userProfile.employerKYC && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Company:</span>
                    <span className="font-bold text-slate-800">{userProfile.employerKYC.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">National ID:</span>
                    <span className="font-mono font-bold text-slate-800">{userProfile.employerKYC.idNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Submitted on:</span>
                    <span className="text-slate-700">{new Date(userProfile.employerKYC.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowKYCStatusModal(false);
                  setShowKYCSubmitModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Update Details
              </button>
              <button
                onClick={() => setShowKYCStatusModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for previewing KYC documents (National ID & CR14) */}
      {selectedKYCPreviewImage && (
        <div 
          onClick={() => setSelectedKYCPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-transparent" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedKYCPreviewImage}
              alt="KYC Document Preview"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setSelectedKYCPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 bg-white text-slate-800 rounded-full shadow-lg hover:bg-slate-100"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
