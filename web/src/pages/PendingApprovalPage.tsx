import React from 'react';
import type { PharmacyProfile } from '../types/pharmacy';

interface PendingApprovalPageProps {
  profile: PharmacyProfile;
  onLogout: () => void;
}

export const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({ profile, onLogout }) => {
  const isRejected = profile.verificationStatus === 'rejected';

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">መ</div>
          <div>
            <span className="font-bold text-primary text-lg">MedhaNet AI</span>
            <p className="text-xs text-secondary">Pharmacy Verification Portal</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error/10 border border-error/20 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </header>

      {/* Main Body */}
      <main className="max-w-lg w-full mx-auto my-12 bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-outline-variant/30 space-y-6 text-center">
        {isRejected ? (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-red-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                cancel
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Application Rejected</h2>
              <p className="text-sm text-secondary mt-1">
                Your registration application for <strong>{profile.name}</strong> was reviewed and could not be approved at this time.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-1">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Reason for Rejection</p>
              <p className="text-xs text-red-700 font-medium">
                {profile.rejectionReason || 'TIN verification failed or mismatch with official Ministry of Trade records. Please verify your TIN number and re-submit.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('Redirecting to re-submission form...')}
                className="w-full bg-primary text-on-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md"
              >
                Update Application & Re-submit
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto animate-pulse">
              <span className="material-symbols-outlined text-amber-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                hourglass_top
              </span>
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                Verification Pending
              </span>
              <h2 className="text-2xl font-bold text-on-surface mt-3">Account Under Review</h2>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                Thank you for registering <strong>{profile.name}</strong> (TIN: {profile.tinNumber || '0049281734'}). Your application has been sent to the <strong>MedhaNet Admin Portal</strong> for official license & TIN verification.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-left bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Registration Status Checklist</p>
              
              <div className="flex items-center gap-3 text-xs font-medium text-on-surface">
                <span className="material-symbols-outlined text-emerald-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Account & Password Created
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-on-surface">
                <span className="material-symbols-outlined text-emerald-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                TIN Number Submitted ({profile.tinNumber || 'Verified Form'})
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base animate-spin">sync</span>
                  Admin Verification in Progress
                </div>
                <span className="text-[10px] font-bold">1–3 Days</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-secondary/60">
                <span className="material-symbols-outlined text-base">radio_button_unchecked</span>
                Patient Network Activation
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-secondary leading-relaxed text-left">
              💡 <strong>Note:</strong> Once an administrator approves your pharmacy in the Admin Dashboard, your status will automatically change to <strong>Active</strong> and you will gain full access to patient reservations, inventory management, and prescription requests.
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-secondary border-t border-outline-variant/20">
        Need assistance? Contact MedhaNet AI Support at <a href="mailto:support@medhanet.ai" className="text-primary font-semibold underline">support@medhanet.ai</a> or call +251 11 600 0000.
      </footer>
    </div>
  );
};
