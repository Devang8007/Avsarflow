import React from 'react';
import { JobCategory } from '../../types';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  category: JobCategory | 'all';
  onCategoryChange: (cat: JobCategory | 'all') => void;
  qualification: string;
  onQualificationChange: (qual: string) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  sortBy: 'deadline_asc' | 'published_desc' | 'vacancies_desc';
  onSortByChange: (sort: 'deadline_asc' | 'published_desc' | 'vacancies_desc') => void;
  onReset: () => void;
  totalResults: number;
}

export const SearchFilters: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  qualification,
  onQualificationChange,
  location,
  onLocationChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  onReset,
  totalResults
}) => {
  const isFiltered = searchQuery || category !== 'all' || qualification !== 'all' || location !== 'all' || status !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
      {/* Top Search Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by recruitment title, department, exam, or organization..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Openings' },
            { id: 'government', label: 'Govt (Sarkari)' },
            { id: 'private', label: 'Private IT/Core' },
            { id: 'internship', label: 'Internships' },
            { id: 'fresher', label: 'Fresher Only' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                category === tab.id
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
        {/* Qualification Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Qualification
          </label>
          <select
            value={qualification}
            onChange={(e) => onQualificationChange(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-800 focus:outline-none"
          >
            <option value="all">Any Qualification</option>
            <option value="10th">10th / Matriculation</option>
            <option value="12th">12th / Intermediate</option>
            <option value="diploma">Diploma in Engineering</option>
            <option value="graduate">Any Graduate Degree</option>
            <option value="b.tech">B.E. / B.Tech / Engineering</option>
            <option value="post graduate">Post Graduate / M.Tech / MBA</option>
          </select>
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Location / State
          </label>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-800 focus:outline-none"
          >
            <option value="all">All India / Any Location</option>
            <option value="all india">All India Postings</option>
            <option value="delhi">Delhi NCR</option>
            <option value="karnataka">Karnataka / Bengaluru</option>
            <option value="maharashtra">Maharashtra / Mumbai / Pune</option>
            <option value="tamil nadu">Tamil Nadu / Chennai</option>
            <option value="telangana">Telangana / Hyderabad</option>
            <option value="uttar pradesh">Uttar Pradesh</option>
            <option value="remote">Remote / Virtual</option>
          </select>
        </div>

        {/* Application Status Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Application Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-800 focus:outline-none"
          >
            <option value="all">All Active Statuses</option>
            <option value="open">Applications Open</option>
            <option value="closing_soon">Closing Soon (Urgent)</option>
            <option value="upcoming">Upcoming Releases</option>
            <option value="closed">Past / Closed</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Sort Order
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-800 focus:outline-none appearance-none"
            >
              <option value="published_desc">Recently Published First</option>
              <option value="deadline_asc">Deadline: Ending Soonest</option>
              <option value="vacancies_desc">Most Vacancies First</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter status strip */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-900">{totalResults}</span> actual matching opportunities in database
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-medium text-blue-900 hover:text-blue-700"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
