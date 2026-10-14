import React, { useState } from 'react';
import { LegalModal } from './LegalModal';

export const Footer: React.FC = () => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

  const openLegal = (tab: 'terms' | 'privacy') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <footer className="border-t border-slate-200 bg-white/80 py-8 px-4 text-center pb-28 sm:pb-24">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Links to Terms of Use & Privacy Policy */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button
            onClick={() => openLegal('terms')}
            className="hover:text-teal-700 transition underline underline-offset-4 decoration-slate-300"
          >
            Terms of Use
          </button>
          <span>·</span>
          <button
            onClick={() => openLegal('privacy')}
            className="hover:text-teal-700 transition underline underline-offset-4 decoration-slate-300"
          >
            Privacy Policy
          </button>
        </div>

        {/* Copyright notice as requested */}
        <p className="text-xs text-slate-600 font-medium">
          © 2026 Comfort Skills and Job Hub. All Rights Reserved.
        </p>

        {/* Developer brand message as requested */}
        <p className="text-xs text-slate-500 font-medium">
          Developed with ❤️ by Comfort Designs -+263772824132
        </p>
      </div>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        defaultTab={legalTab}
      />
    </footer>
  );
};
