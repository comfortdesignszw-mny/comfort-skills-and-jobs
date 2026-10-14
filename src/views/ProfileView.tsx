import React, { useState } from 'react';
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
  FileText 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { UserProfile } from '../types';
import { saveUserProfileToFirestore } from '../firebase';

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
    signOutUser
  } = useApp();

  const certificates = StorageEngine.getCertificates();
  const applications = StorageEngine.getApplications();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(userProfile);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    if (currentUser) {
      saveUserProfileToFirestore(currentUser.uid, formData);
    }
    setIsEditing(false);
  };

  const toggleRole = (role: 'learner' | 'jobseeker' | 'worker' | 'employer' | 'business_owner') => {
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
  };

  const handleAddSkill = (skill: string) => {
    if (!skill.trim() || formData.skills.includes(skill.trim())) return;
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-sm">
              {userProfile.fullName ? userProfile.fullName.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {userProfile.fullName || 'Comfort Nyoni'}
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {userProfile.headline || 'Vocational Technician & SME Trader'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile.suburb}, {userProfile.city}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile.phone}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) {
                updateUserProfile(formData);
                setIsEditing(false);
              } else {
                setFormData(userProfile);
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition self-start"
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5 text-teal-600" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit CV Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Online Firebase Account Status */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Online Cloud Synchronization
            </span>
            {currentUser ? (
              <p className="font-semibold text-slate-800 mt-0.5">
                Connected: <span className="text-teal-700">{currentUser.email || currentUser.displayName}</span>
              </p>
            ) : (
              <p className="text-slate-600 mt-0.5">
                Operating locally. Sign in to sync across devices with Google, Phone or Email.
              </p>
            )}
          </div>
          {currentUser ? (
            <button
              onClick={signOutUser}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition self-start sm:self-auto"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition self-start sm:self-auto shadow-2xs"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Roles Badges (Multi-role support per brief) */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Active Multi-Role Permissions (Tap to toggle)
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'learner', label: '🎓 Learner' },
              { id: 'jobseeker', label: '💼 Job Seeker' },
              { id: 'worker', label: '🤝 Gig Worker' },
              { id: 'business_owner', label: '🏪 Business Owner' },
              { id: 'employer', label: '🏢 Employer' }
            ].map((role) => {
              const active = formData.roles.includes(role.id as any);
              return (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Form or Read-Only CV Profile */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Update CV &amp; Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp / EcoCash)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Suburb</label>
              <input
                type="text"
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bio &amp; Objective</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Education &amp; Training</label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Work Experience</label>
            <textarea
              rows={2}
              value={formData.workExperience}
              onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Traceable References</label>
            <input
              type="text"
              value={formData.references}
              onChange={(e) => setFormData({ ...formData, references: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
            >
              Save CV Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Curriculum Vitae (CV) &amp; Professional Summary
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-teal-700 font-bold hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print / Save CV PDF</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Professional Bio
              </span>
              <p className="text-slate-700 mt-1 leading-relaxed">
                {userProfile.bio || 'Vocational artisan and small business owner operating in Bulawayo.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Acquired Skills &amp; Competencies
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {userProfile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold border border-teal-100 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Education
              </span>
              <p className="text-slate-800 font-medium mt-1">
                {userProfile.education}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Work Experience
              </span>
              <p className="text-slate-700 mt-1 leading-relaxed">
                {userProfile.workExperience}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Traceable References
              </span>
              <p className="text-slate-700 mt-1">
                {userProfile.references}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Earned Certificates from Skills Academy */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Locally Issued Certificates ({certificates.length})
            </h3>
            <p className="text-xs text-slate-500">
              Verified records stored in your phone memory
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
    </div>
  );
};
