import React from 'react';
import { AlertTriangle, ShieldCheck, FileCheck2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="pb-6 border-b border-slate-100">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Terms of Use & Legal Disclaimer
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Effective: January 2025 • Public Informational Directory Terms
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Crucial Candidate Advisory: </span>
              OpportunityHub India is an independent automated indexer. We do NOT administer examinations, issue admit cards, accept application fees, or influence selection in any capacity.
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">1. Verification Responsibility</h3>
            <p>
              While our Python collection system applies rigorous deterministic rules and document hashing to ensure high fidelity, recruitment boards may publish late amendments, corrigenda, or cancellations. Candidates are strictly advised to review the original PDF gazette linked under each job before submitting fees.
            </p>

            <h3 className="text-base font-bold text-slate-900">2. No Commercial Transaction</h3>
            <p>
              OpportunityHub India is 100% free for all students, freshers, and job seekers. If any individual or website asks for money while claiming association with OpportunityHub India, report it immediately to our contact desk.
            </p>

            <h3 className="text-base font-bold text-slate-900">3. Intellectual Property and Trademarks</h3>
            <p>
              All trademarks, logos, commission insignias (such as UPSC, SSC, IBPS, Railways, TCS, Infosys, etc.) belong to their respective statutory boards and corporate entities. They are referenced here strictly for factual nominative identification of recruitment notifications.
            </p>

            <h3 className="text-base font-bold text-slate-900">4. Automated Harvesting Notice</h3>
            <p>
              Our automated crawler adheres strictly to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">robots.txt</code> specifications, rate limits, and public disclosure terms. We do not bypass CAPTCHAs, paywalls, or protected user areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
