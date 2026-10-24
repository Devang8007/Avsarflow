import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { Job, JobCategory } from '../types';
import { JobCard } from '../components/common/JobCard';
import { SearchFilters } from '../components/common/SearchFilters';
import { Landmark, Building2, GraduationCap, Sparkles, Flame, Briefcase } from 'lucide-react';

interface Props {
  defaultCategory?: JobCategory | 'all';
  title?: string;
  subtitle?: string;
}

export const CategoryPage: React.FC<Props> = ({ defaultCategory = 'all', title, subtitle }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<JobCategory | 'all'>(
    defaultCategory !== 'all' ? defaultCategory : (searchParams.get('cat') as any) || 'all'
  );
  const [qualification, setQualification] = useState(searchParams.get('qualification') || 'all');
  const [jobLocation, setJobLocation] = useState(searchParams.get('location') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState<'deadline_asc' | 'published_desc' | 'vacancies_desc'>('published_desc');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync category prop if route changes
  useEffect(() => {
    if (defaultCategory !== 'all') {
      setCategory(defaultCategory);
    }
  }, [defaultCategory, location.pathname]);

  // Sync search param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const qual = searchParams.get('qualification');
    if (qual !== null) setQualification(qual);
    const loc = searchParams.get('location');
    if (loc !== null) setJobLocation(loc);
    const stat = searchParams.get('status');
    if (stat !== null) setStatus(stat);
  }, [searchParams]);

  useEffect(() => {
    async function fetchFilteredJobs() {
      setLoading(true);
      try {
        const results = await jobService.getJobs({
          category: category !== 'all' ? category : undefined,
          qualification: qualification !== 'all' ? qualification : undefined,
          location: jobLocation !== 'all' ? jobLocation : undefined,
          status: status !== 'all' ? status : undefined,
          searchQuery: searchQuery || undefined,
          sortBy
        });
        setJobs(results);
      } catch (err) {
        console.error('Error fetching filtered jobs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredJobs();
  }, [category, qualification, jobLocation, status, searchQuery, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    if (defaultCategory === 'all') setCategory('all');
    setQualification('all');
    setJobLocation('all');
    setStatus('all');
    setSortBy('published_desc');
    setSearchParams({});
  };

  const getPageHeading = () => {
    if (title) return title;
    switch (category) {
      case 'government':
        return 'Government Recruitment (Sarkari Naukri)';
      case 'private':
        return 'Private-Sector Tech & Core Engineering Openings';
      case 'internship':
        return 'National & Corporate Internship Programs';
      case 'fresher':
        return 'Fresher & Entry-Level Job Openings';
      default:
        return 'Latest Recruitment & Internship Notifications';
    }
  };

  const getPageIcon = () => {
    switch (category) {
      case 'government':
        return <Landmark className="w-6 h-6 text-amber-400" />;
      case 'private':
        return <Building2 className="w-6 h-6 text-indigo-400" />;
      case 'internship':
        return <GraduationCap className="w-6 h-6 text-cyan-400" />;
      case 'fresher':
        return <Sparkles className="w-6 h-6 text-teal-400" />;
      default:
        return <Flame className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner */}
        <div className="mb-6 p-6 rounded-2xl bg-[#0a1d37] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 shrink-0">
              {getPageIcon()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {getPageHeading()}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                {subtitle || 'Verified notifications extracted directly from primary recruitment gazettes and official boards.'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs uppercase font-bold text-blue-300">Live Database Matches</span>
            <p className="text-2xl font-extrabold text-amber-400">{jobs.length}</p>
          </div>
        </div>

        {/* Search & Filter Component */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          category={category}
          onCategoryChange={setCategory}
          qualification={qualification}
          onQualificationChange={setQualification}
          location={jobLocation}
          onLocationChange={setJobLocation}
          status={status}
          onStatusChange={setStatus}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onReset={handleReset}
          totalResults={jobs.length}
        />

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching opportunities found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              We couldn't find any job or notification matching your specific filter parameters. Try loosening your filters or resetting the search.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
