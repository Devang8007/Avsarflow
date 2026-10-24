import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { Job, JobChange } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { CorrectionModal } from '../components/common/CorrectionModal';
import {
  Calendar, Clock, MapPin, Users, Banknote, GraduationCap,
  ExternalLink, FileText, ShieldCheck, AlertCircle, ArrowLeft,
  Share2, CheckCircle2, AlertTriangle, Hash, History, BookmarkCheck
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await jobService.getJobBySlug(slug);
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title || 'Recruitment Notification',
        text: `Check out ${job?.title} at ${job?.organization} on OpportunityHub India:`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Job Notification Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          The requested opportunity may have been unlisted, withdrawn, or has an invalid URL.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to OpportunityHub</span>
        </Link>
      </div>
    );
  }

  const formatFullDate = (dStr?: string | null) => {
    if (!dStr) return 'Not specified';
    try {
      return new Date(dStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={
              job.category === 'government'
                ? '/government-jobs'
                : job.category === 'private'
                ? '/private-jobs'
                : job.category === 'internship'
                ? '/internships'
                : '/fresher-jobs'
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {job.category.toUpperCase()} Openings</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => setCorrectionOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-amber-700 flex items-center gap-1.5 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Report Correction</span>
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <CategoryBadge category={job.category} />
            <StatusBadge status={job.status} />
            {job.is_verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Primary Notice
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
            {job.organization} {job.department ? `• ${job.department}` : ''}
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            {job.title}
          </h1>

          {/* Corrigendum alert if active */}
          {job.has_corrigendum && job.corrigendum_note && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Official Corrigendum / Amendment: </span>
                <span>{job.corrigendum_note}</span>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            {job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {job.official_notification_url && (
              <a
                href={job.official_notification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Download Official Gazette PDF</span>
              </a>
            )}

            <div className="ml-auto text-xs text-slate-400 hidden sm:block">
              Notice ID: <span className="font-mono text-slate-600 font-semibold">{job.id}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Summary Highlights */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Key Recruitment Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Total Vacancies</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {job.vacancies ? job.vacancies.toLocaleString('en-IN') : 'Not specified'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Remuneration / Pay Scale</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {job.stipend || job.salary_text || 'As per commission rules'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Age Limit</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {job.age_min ? `${job.age_min} to ${job.age_max || '32'} Years` : 'As per notification rules'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Job Location</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {job.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Educational Qualification & Eligibility */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-900" />
                Educational Qualification & Eligibility Criteria
              </h2>
              
              <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="font-semibold text-blue-950 mb-1">Essential Educational Qualification:</p>
                  <p>{job.qualification}</p>
                </div>

                {job.eligibility_details && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Detailed Eligibility Conditions:</h4>
                    <p className="text-slate-600">{job.eligibility_details}</p>
                  </div>
                )}

                {job.age_relaxation && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Age Relaxation Provisions:</h4>
                    <p className="text-slate-600">{job.age_relaxation}</p>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1.5">Relevant Knowledge / Skills:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Process & Application Fee */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-blue-900" />
                Selection Mode & Application Fee
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Selection Process:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {job.selection_process || 'Screening test followed by personal interview / document verification.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Application Fee Details:</h4>
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200">
                    {job.application_fee || 'Not specified in preliminary release'}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Official Notification Summary
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Right Sidebar: Timeline & Verification Evidence */}
          <div className="space-y-6">
            {/* Critical Dates Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-900" />
                Important Recruitment Dates
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Notification Published On</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {formatFullDate(job.publication_date)}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Application Window Opens</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {formatFullDate(job.application_open_date)}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-bold uppercase text-[10px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Application Closing Deadline
                  </span>
                  <p className="font-extrabold text-amber-950 text-base mt-1">
                    {formatFullDate(job.application_deadline)}
                  </p>
                  {job.application_deadline_text && (
                    <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                      Extracted: "{job.application_deadline_text}"
                    </p>
                  )}
                </div>

                {job.exam_date && (
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Tentative Exam Date</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {job.exam_date}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Official Link Distinction Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                <span>Direct Official Portal Link</span>
              </div>
              <p className="text-blue-900/80 leading-relaxed text-[11px]">
                OpportunityHub India directs you straight to the authentic recruitment board portal. We never redirect to third-party forms or paid intermediaries.
              </p>
              {job.application_url && (
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-center block transition-colors shadow-sm"
                >
                  Proceed to Official Portal
                </a>
              )}
            </div>

            {/* Verification & Extraction Evidence Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data Provenance & Audit Trail
              </h3>

              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Source Agency:</span>
                  <span className="font-medium text-slate-800 text-right">{job.source_name || job.organization}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Extraction Engine:</span>
                  <span className="font-medium text-slate-800">Deterministic Rule Parser</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Confidence Score:</span>
                  <span className="font-semibold text-emerald-600">
                    {job.extraction_confidence ? `${Math.round(job.extraction_confidence * 100)}%` : 'Verified'}
                  </span>
                </div>

                <div className="py-1 border-b border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Source Document Hash (SHA-256):</span>
                  <span className="font-mono text-[9px] text-slate-700 break-all block bg-slate-50 p-1.5 rounded">
                    {job.source_document_hash || 'SHA-256 Verified on Primary Document'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last Verified:</span>
                  <span className="text-slate-600 font-mono text-[10px]">
                    {new Date(job.last_checked_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CorrectionModal
        isOpen={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        job={job}
      />
    </div>
  );
};
