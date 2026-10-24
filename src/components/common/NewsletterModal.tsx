import React, { useState } from 'react';
import { JobCategory } from '../../types';
import { jobService } from '../../services/jobService';
import { Bell, Check, X, ShieldCheck, Mail } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState<JobCategory[]>([
    'government',
    'private',
    'internship',
    'fresher'
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (cat: JobCategory) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter((c) => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await jobService.subscribe(email, categories);
      setSubmitted(true);
    } catch {
      setError('Failed to record subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-white/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Free Recruitment Alerts</h3>
          </div>
          <p className="text-xs text-blue-100">
            Get instant alerts when new Sarkari notifications, Tech off-campus drives, or Summer Internships are verified.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Alerts Activated!</h4>
              <p className="text-xs text-slate-600 mb-4">
                We've added <span className="font-semibold">{email}</span>. You will receive notifications matching your selected categories.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Your Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Select Opportunity Types
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'government', label: 'Government (Sarkari)' },
                    { id: 'private', label: 'Private IT / Core' },
                    { id: 'internship', label: 'Internships' },
                    { id: 'fresher', label: 'Fresher Off-Campus' }
                  ].map((cat) => {
                    const isChecked = categories.includes(cat.id as JobCategory);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id as JobCategory)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked
                              ? 'bg-blue-900 border-blue-900 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-[11px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Subscribing...' : 'Subscribe to Free Alerts'}
              </button>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam. One-click unsubscribe link in every email.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
