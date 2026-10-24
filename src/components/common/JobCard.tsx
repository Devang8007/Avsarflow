import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { Calendar, MapPin, GraduationCap, Users, Banknote, ExternalLink, ArrowRight, ShieldCheck, FileText, BellRing } from 'lucide-react';

interface Props {
  job: Job;
  featured?: boolean;
}

export const JobCard: React.FC<Props> = ({ job, featured = false }) => {
  // Format deadline nicely
  const formatDeadline = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getDaysRemaining = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    try {
      const target = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((target - now) / (1000 * 3600 * 24));
      return diff;
    } catch {
      return null;
    }
  };

  const daysLeft = getDaysRemaining(job.application_deadline);

  return (
    <div className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
      featured 
        ? 'border-blue-400 ring-1 ring-blue-100 shadow-sm' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Top badges bar */}
      <div className="p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={job.category} />
            <StatusBadge status={job.status} />
            {job.is_verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100" title="Extracted from official gazette/portal">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Official Source
              </span>
            )}
          </div>
          
          {daysLeft !== null && daysLeft > 0 && daysLeft <= 10 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {daysLeft === 1 ? '1 day left!' : `${daysLeft} days left`}
            </span>
          )}
        </div>

        {/* Organization Name */}
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
          <span>{job.organization}</span>
          {job.department && <span className="text-slate-400 font-normal">| {job.department}</span>}
        </p>

        {/* Job Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
          <Link to={`/jobs/${job.slug || job.id}`} className="focus:outline-none focus:underline">
            {job.title}
          </Link>
        </h3>

        {/* Corrigendum notice */}
        {job.has_corrigendum && job.corrigendum_note && (
          <div className="mt-2.5 p-2 bg-amber-50/80 border border-amber-200/80 rounded text-xs text-amber-900 flex items-start gap-2">
            <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="line-clamp-1 font-medium">
              <span className="font-semibold">Update/Corrigendum:</span> {job.corrigendum_note}
            </p>
          </div>
        )}

        {/* Key Attributes Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          {/* Vacancies */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Vacancies</p>
              <p className="font-semibold text-slate-800">
                {job.vacancies ? job.vacancies.toLocaleString('en-IN') : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Qualification */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Qualification</p>
              <p className="font-medium text-slate-800 truncate" title={job.qualification}>
                {job.qualification}
              </p>
            </div>
          </div>

          {/* Salary / Stipend */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <Banknote className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-slate-400">
                {job.category === 'internship' ? 'Stipend' : 'Remuneration'}
              </p>
              <p className="font-medium text-slate-800 truncate" title={job.salary_text || job.stipend || 'As per norms'}>
                {job.stipend || job.salary_text || 'As per rules'}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-100 text-slate-700">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Location</p>
              <p className="font-medium text-slate-800 truncate" title={job.location}>
                {job.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer with Deadline & Actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Last Date: </span>
          <span className="font-semibold text-slate-800">
            {formatDeadline(job.application_deadline)}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {job.official_notification_url && (
            <a
              href={job.official_notification_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-1"
              title="Read official notification PDF"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF Notice</span>
            </a>
          )}

          {job.application_url && (
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-colors flex items-center gap-1 shadow-sm"
              title="Opens original official application portal directly"
            >
              <span>Apply Online</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <Link
            to={`/jobs/${job.slug || job.id}`}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-medium transition-colors flex items-center gap-1 ml-auto sm:ml-0"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};
