import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeTab === 'terms' ? 'Terms of Use' : 'Privacy Policy'}
              </h2>
              <p className="text-xs text-slate-500">
                Comfort Skills &amp; Jobs Hub · Effective Date: October 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-white">
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'terms'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms of Use
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'privacy'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'terms' ? (
            <>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 font-medium">
                <strong>Core Community Standard: </strong> Comfort Skills &amp; Jobs Hub exists to uplift job seekers, artisans, and small business owners in Bulawayo and throughout Zimbabwe. By accessing our platform, you agree to these Terms.
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">1. Acceptance &amp; Eligibility</h3>
                <p>
                  By creating an account or using Comfort Skills &amp; Jobs Hub via web or installable PWA, you agree to comply with all applicable Zimbabwean laws. You must provide truthful details when creating CVs, service provider listings, and employer vacancies.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">2. Zero Tolerance for Recruitment Fees</h3>
                <p>
                  No employer, agency, or contractor registered on Comfort Hub is permitted to solicit upfront interview fees, registration fees, or medical test charges from job seekers. Any listing demanding upfront payment will be banned immediately.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">3. Gig Worker &amp; Customer Agreement</h3>
                <p>
                  Comfort Hub acts as a discovery and matching utility. All contracts for services (plumbing, electrical, phone repair, tailoring, cleaning) are agreed directly between the customer and the artisan. We do not hold customer funds in escrow unless explicitly stated. Both parties are encouraged to verify scope, materials, and quotations before commencement.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">4. Small Business &amp; Offline Data Independence</h3>
                <p>
                  Your small business sales, expense ledgers, customer debtor books (zvikwereti), and inventory counts are your private commercial property. They are saved directly to your local device memory and remain accessible offline without requiring paid subscription lockouts.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">5. Learning Certifications</h3>
                <p>
                  Locally issued completion certificates certify completion of practical lesson modules and diagnostic quizzes within the Skills Academy. They represent skill readiness and do not constitute government-chartered academic degrees.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-medium">
                <strong>Privacy Commitment: </strong> We respect the privacy of informal traders, artisans, and job seekers in accordance with the Zimbabwe Cyber and Data Protection Act [Chapter 12:07].
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">1. Information We Collect</h3>
                <p>
                  We only collect data necessary to enable employment, gig discovery, and user authentication:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Account Identity:</strong> Email address, verified Google credentials, or authenticated telephone numbers mapped to login tokens.</li>
                  <li><strong>Profile &amp; CV:</strong> Full name, suburb/city (e.g. Bulawayo), trade skills, work history, and contact details for employers.</li>
                  <li><strong>Local Ledger Data:</strong> Business sales and expenses remain on your personal device memory unless explicitly backed up or synchronized.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">2. How Your Data Is Used</h3>
                <p>
                  Information is used exclusively to connect job seekers to employers, match customers with local artisans, issue certificates, and sync your account state across devices. We will never sell your personal data or phone number to third-party telemarketers.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">3. Security &amp; Firebase Cloud Storage</h3>
                <p>
                  Online account profiles and authentication tokens are secured via Google Firebase Cloud Infrastructure with encrypted transmission (TLS/SSL). Sensitive credentials and passwords are never visible in plain text.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">4. Offline Data Protection &amp; Backup</h3>
                <p>
                  Users maintain full ownership over their local database. You can export a full device backup JSON file at any time and store it securely on your memory card or drive.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">5. Contact &amp; Data Rights</h3>
                <p>
                  To request account deletion or data correction, contact the platform team at +263772824132 or email support@comfortskills.com.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Comfort Skills &amp; Jobs Hub · Bulawayo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
