import React, { useState } from 'react';
import { Job } from '../../types';
import { AlertCircle, Check, X, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export const CorrectionModal: React.FC<Props> = ({ isOpen, onClose, job }) => {
  const [issueType, setIssueType] = useState('date_extension');
  const [details, setDetails] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate recording report
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Report a Correction or Corrigendum</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Regarding Opportunity</p>
            <p className="text-sm font-bold text-slate-800 line-clamp-1">{job.title}</p>
            <p className="text-xs text-slate-500">{job.organization}</p>
          </div>

          {submitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Thank you for helping keep data accurate!</h4>
              <p className="text-xs text-slate-600 mb-4">
                Our verification team reviews candidate reports against the official gazette within 4 hours.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Correction Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-800 focus:outline-none"
                >
                  <option value="date_extension">Application Deadline Extended / Corrigendum</option>
                  <option value="vacancy_change">Vacancies Revised / Increased / Decreased</option>
                  <option value="broken_link">Broken Official Application Link</option>
                  <option value="eligibility_error">Eligibility / Qualification Clarification</option>
                  <option value="withdrawn">Notice Cancelled or Withdrawn by Authority</option>
                  <option value="other">Other Information Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Details of the Change / Correction
                </label>
                <textarea
                  rows={3}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. Official notification corrigendum dated 12th Aug extends last date to 28th Aug 2025."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Evidence / Corrigendum URL (Optional)
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://official-portal.gov.in/corrigendum.pdf"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Email (Optional, for verification credit)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Correction Report
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
