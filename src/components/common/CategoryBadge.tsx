import React from 'react';
import { JobCategory } from '../../types';
import { Landmark, Building2, GraduationCap, Sparkles } from 'lucide-react';

interface Props {
  category: JobCategory;
  className?: string;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<Props> = ({ category, className = '', showIcon = true }) => {
  switch (category) {
    case 'government':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900 text-blue-50 border border-blue-800 ${className}`}>
          {showIcon && <Landmark className="w-3.5 h-3.5 text-amber-400" />}
          Government Recruitment
        </span>
      );
    case 'private':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          {showIcon && <Building2 className="w-3.5 h-3.5 text-indigo-500" />}
          Private Sector
        </span>
      );
    case 'internship':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 ${className}`}>
          {showIcon && <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />}
          Internship
        </span>
      );
    case 'fresher':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${className}`}>
          {showIcon && <Sparkles className="w-3.5 h-3.5 text-teal-600" />}
          Fresher Opening
        </span>
      );
    default:
      return null;
  }
};
