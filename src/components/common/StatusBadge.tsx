import React from 'react';
import { JobStatus } from '../../types';
import { Clock, CheckCircle2, XCircle, HelpCircle, AlertOctagon } from 'lucide-react';

interface Props {
  status: JobStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '', showIcon = true }) => {
  switch (status) {
    case 'open':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Applications Open
        </span>
      );
    case 'closing_soon':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          Closing Soon
        </span>
      );
    case 'upcoming':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600" />}
          Upcoming
        </span>
      );
    case 'closed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
          {showIcon && <XCircle className="w-3.5 h-3.5 text-slate-400" />}
          Closed
        </span>
      );
    case 'withdrawn':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}>
          {showIcon && <AlertOctagon className="w-3.5 h-3.5 text-red-600" />}
          Withdrawn / Cancelled
        </span>
      );
    case 'needs_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-purple-600" />}
          Needs Review
        </span>
      );
    default:
      return null;
  }
};
