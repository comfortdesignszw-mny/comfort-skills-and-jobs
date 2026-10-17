import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already running as an installed PWA, do not render redundant label
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop direct install prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 active:scale-95 transition"
        title="Install Comfort Hub App"
        aria-label="Install Comfort Hub App"
      >
        <Download className="w-3.5 h-3.5" />
      </button>
    );
  }

  // Fallback for browsers without direct prompt (like iOS or already saved)
  return (
    <>
      <button
        onClick={() => (isIOS ? setShowIOSGuide(true) : setShowAndroidGuide(true))}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-teal-200 bg-teal-50/70 text-teal-700 hover:bg-teal-100 transition"
        title="Install to home screen for offline use"
        aria-label="Install to home screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-teal-600" />
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Install on iPhone / iPad</h3>
              <button 
                onClick={() => setShowIOSGuide(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">1</span>
                <span>Tap the <strong className="text-slate-900">Share</strong> icon at the bottom of Safari toolbar.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">2</span>
                <span>Scroll down and select <strong className="text-slate-900">Add to Home Screen</strong>.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">3</span>
                <span>Tap <strong className="text-teal-700">Add</strong>. Comfort Hub is now available offline without data!</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Install Comfort Hub on Android</h3>
              <button 
                onClick={() => setShowAndroidGuide(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">1</span>
                <span>Tap the three dots menu (<strong className="text-slate-900">⋮</strong>) in Chrome browser.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">2</span>
                <span>Choose <strong className="text-slate-900">Install app</strong> or <strong className="text-slate-900">Add to Home screen</strong>.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">3</span>
                <span>Launch anytime from your Android home screen, even with zero data or in airplane mode!</span>
              </p>
            </div>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
