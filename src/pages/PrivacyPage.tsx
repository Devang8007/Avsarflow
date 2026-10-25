import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="pb-6 border-b border-slate-100">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Last updated: January 2025 • OpportunityHub India Data Protection Guidelines
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">1. No Mandatory Candidate Registration</h3>
            <p>
              OpportunityHub India is an open public repository. Job seekers, graduates, and students are NOT required to create personal accounts, upload resumes, submit Aadhaar or PAN card numbers, or reveal identifying personal data simply to browse notifications or download official gazettes.
            </p>

            <h3 className="text-base font-bold text-slate-900">2. Free Email Alert Subscriptions</h3>
            <p>
              If you willingly subscribe to free recruitment alerts via email, your email address is used solely for dispatching new job notifications and material deadline changes matching your selected categories. We never sell, rent, or share candidate email lists with coaching institutes, marketers, or third-party recruiters.
            </p>

            <h3 className="text-base font-bold text-slate-900">3. Analytics and Cookies</h3>
            <p>
              We prioritize minimal tracking. Standard HTTP access logs (IP address, user-agent) may be recorded temporarily for security monitoring, DDOS prevention, and server-side request forgery (SSRF) mitigations.
            </p>

            <h3 className="text-base font-bold text-slate-900">4. Direct External Links</h3>
            <p>
              Our portal contains outbound links to official Union and State recruitment portals (e.g. upsc.gov.in, ssc.gov.in, ibps.in) and corporate employer portals. Once you leave OpportunityHub India, you are governed by the respective entity's privacy policy and terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
