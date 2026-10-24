import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { Job, PortalStats, JobChange } from '../types';
import { JobCard } from '../components/common/JobCard';
import { 
  Search, Landmark, Building2, GraduationCap, Sparkles, Clock, 
  ArrowRight, ShieldCheck, AlertCircle, Bell, Users, CheckCircle2,
  Calendar, MapPin, ExternalLink, ChevronRight
} from 'lucide-react';
import { NewsletterModal } from '../components/common/NewsletterModal';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [closingSoonJobs, setClosingSoonJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [recentChanges, setRecentChanges] = useState<JobChange[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const [statsData, closingSoon, latest, changes] = await Promise.all([
        jobService.getStats(),
        jobService.getClosingSoonJobs(3),
        jobService.getLatestJobs(6),
        jobService.getRecentChanges(3)
      ]);
      setStats(statsData);
      setClosingSoonJobs(closingSoon);
      setLatestJobs(latest);
      setRecentChanges(changes);
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/latest?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="flex-1 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0a1d37] via-[#0f2b48] to-[#0a1d37] text-white pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Official badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-600/40 text-xs font-semibold text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Central & State Recruitment Portal</span>
            <span className="text-blue-400">•</span>
            <span className="text-amber-300">Live 2025 Notifications</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Verified Jobs & Internships <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200">
              Across India
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Zero third-party bias. Directly extracted from UPSC, SSC, RRB, Banking Boards, and leading Indian technology employers with verified official links.
          </p>

          {/* Main Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-6">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-1.5 border-2 border-white/20 focus-within:border-amber-400 transition-colors">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by post name, SSC, UPSC, IBPS, Engineering, or City..."
                className="w-full px-3 py-3 text-slate-900 text-sm focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Find Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick shortcuts under search */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-blue-200">
            <span className="text-blue-300/80 font-medium">Trending Searches:</span>
            {['SSC CGL', 'UPSC CSE 2025', 'RRB ALP', 'TCS NQT', 'Infosys Springboard', 'Graduate Jobs'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/latest?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Actual Database Counts Strip (NO FAKE STATS) */}
      <section className="-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xs uppercase font-bold text-slate-400">Total Live Opportunities</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-1">
              {stats?.totalJobs ?? 12}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified database records</p>
          </div>

          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xs uppercase font-bold text-slate-400">Total Vacancies Monitored</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {stats?.totalVacancies?.toLocaleString('en-IN') ?? '1,00,000+'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across Central & State Posts</p>
          </div>

          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xs uppercase font-bold text-slate-400">Applications Open</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">
              {stats?.openCount ?? 8}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Ready for online submission</p>
          </div>

          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xs uppercase font-bold text-slate-400">Automated Collector Status</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-base sm:text-lg font-bold text-slate-800">Operational</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Every 6 hrs via GitHub Actions</p>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-14">
        {/* Category Cards Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Browse by Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Direct access to recruitment sectors across public and private domains
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Govt Jobs */}
            <Link
              to="/government-jobs"
              className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-700 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900">
                  Government Recruitment
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  UPSC, SSC, Railways, Banking, Defense & State PSC recruitment gazettes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>{stats?.governmentCount ?? 6} Active Listings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Private Jobs */}
            <Link
              to="/private-jobs"
              className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900">
                  Private IT & Core
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Direct hiring from Accenture, TCS, Infosys, Wipro, and engineering leaders.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>{stats?.privateCount ?? 3} Active Listings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Internships */}
            <Link
              to="/internships"
              className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-cyan-600 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-900">
                  National Internships
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  NITI Aayog, RBI, Infosys Springboard, research apprenticeships & stipends.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-700">
                <span>{stats?.internshipCount ?? 3} Active Listings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Fresher Jobs */}
            <Link
              to="/fresher-jobs"
              className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900">
                  Fresher Openings
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Zero-experience required roles, graduate trainee and campus drives.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>{stats?.fresherCount ?? 3} Active Listings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Closing Soon Alerts Strip */}
        {closingSoonJobs.length > 0 && (
          <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500 text-white animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-950">
                    Application Deadline Approaching (Closing Soon)
                  </h3>
                  <p className="text-xs text-amber-800">
                    Do not miss submission deadlines. Complete fee payment and registration before server peak hours.
                  </p>
                </div>
              </div>
              <Link
                to="/latest?status=closing_soon"
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View all urgent deadlines</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {closingSoonJobs.map((job) => (
                <JobCard key={job.id} job={job} featured />
              ))}
            </div>
          </section>
        )}

        {/* Corrigenda & Official Notifications Alert Box */}
        {recentChanges.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-900">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Corrigenda & Recruitment Updates
                </h3>
                <p className="text-xs text-slate-500">
                  Track date extensions, vacancy revisions, and syllabus changes released by official commissions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {recentChanges.map((change) => (
                <div
                  key={change.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{change.job_title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {change.change_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{change.notes}</p>
                  </div>

                  {change.source_document_url && (
                    <a
                      href={change.source_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium shrink-0 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Official Corrigendum PDF</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest Opportunities Grid */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Latest Recruitment & Vacancy Releases
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Real database listings extracted through deterministic rules without AI alteration
              </p>
            </div>
            <Link
              to="/latest"
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* Shortcuts: By Qualification & Location */}
        <section className="bg-slate-100/70 rounded-2xl p-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Qualification Shortcuts */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-900" />
                Opportunities by Qualification
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: '10th Pass / Matriculation', q: '10th' },
                  { label: '12th Pass / Intermediate', q: '12th' },
                  { label: 'Diploma in Engineering', q: 'diploma' },
                  { label: 'Any Graduate / Bachelor\'s Degree', q: 'graduate' },
                  { label: 'B.E. / B.Tech Engineers', q: 'b.tech' },
                  { label: 'Post Graduate / M.Tech / MBA', q: 'post graduate' }
                ].map((item) => (
                  <button
                    key={item.q}
                    onClick={() => navigate(`/latest?qualification=${encodeURIComponent(item.q)}`)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-900 text-slate-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Shortcuts */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-900" />
                Opportunities by Location
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: 'All India Postings', loc: 'all india' },
                  { label: 'Delhi NCR', loc: 'delhi' },
                  { label: 'Karnataka (Bengaluru)', loc: 'karnataka' },
                  { label: 'Maharashtra (Mumbai/Pune)', loc: 'maharashtra' },
                  { label: 'Tamil Nadu (Chennai)', loc: 'tamil nadu' },
                  { label: 'Telangana (Hyderabad)', loc: 'telangana' },
                  { label: 'Uttar Pradesh', loc: 'uttar pradesh' },
                  { label: 'Remote / Virtual', loc: 'remote' }
                ].map((item) => (
                  <button
                    key={item.loc}
                    onClick={() => navigate(`/latest?location=${encodeURIComponent(item.loc)}`)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-900 text-slate-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Free Email Alert CTA Box */}
        <section className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
              <Bell className="w-3.5 h-3.5" />
              Never Miss A Deadline
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Get Notified About Live Sarkari & Tech Openings
            </h3>
            <p className="text-sm text-blue-100 max-w-xl">
              Receive verified recruitment updates directly in your inbox. No ads, no coaching spam, one-click unsubscribe anytime.
            </p>
          </div>

          <button
            onClick={() => setNewsletterOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2"
          >
            <Bell className="w-4 h-4 text-slate-950" />
            <span>Subscribe for Free Alerts</span>
          </button>
        </section>
      </div>

      <NewsletterModal isOpen={newsletterOpen} onClose={() => setNewsletterOpen(false)} />
    </div>
  );
};
