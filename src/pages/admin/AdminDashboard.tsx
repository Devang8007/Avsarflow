import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { sourceService } from '../../services/sourceService';
import { Job, Source, CollectionRun, JobChange, PortalStats } from '../../types';
import { SourceManager } from './SourceManager';
import {
  LayoutDashboard, Globe, Briefcase, AlertOctagon, History,
  LogOut, CheckCircle2, XCircle, AlertTriangle, Play, RefreshCw,
  Edit, Eye, EyeOff, ShieldAlert, ArrowUpRight, Search, Filter,
  Users, Banknote, Calendar
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'jobs' | 'quarantine' | 'runs' | 'changes'>('overview');

  const [stats, setStats] = useState<PortalStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [runs, setRuns] = useState<CollectionRun[]>([]);
  const [changes, setChanges] = useState<JobChange[]>([]);
  const [loading, setLoading] = useState(true);

  // Job search & edit state
  const [jobSearch, setJobSearch] = useState('');
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Check auth
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('opportunityhub_admin_logged_in');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, allJobs, allSources, allRuns, allChanges] = await Promise.all([
        jobService.getStats(),
        jobService.getJobs({ status: 'all' }),
        sourceService.getSources(),
        sourceService.getCollectionRuns(15),
        jobService.getRecentChanges(20)
      ]);
      setStats(statsData);
      setJobs(allJobs);
      setSources(allSources);
      setRuns(allRuns);
      setChanges(allChanges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('opportunityhub_admin_logged_in');
    navigate('/admin/login');
  };

  const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
    await jobService.updateJobStatus(jobId, newStatus);
    loadDashboardData();
  };

  const handleSaveJobEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    await jobService.updateJob(editingJob);
    setEditingJob(null);
    loadDashboardData();
  };

  const quarantinedJobs = jobs.filter((j) => j.status === 'needs_review' || j.status === 'withdrawn');

  return (
    <div className="flex-1 bg-slate-100 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center font-bold text-xs text-amber-400">
            OH
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight">OpportunityHub Admin Portal</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              Secured RLS Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            Logged in as <strong className="text-white">admin@opportunityhub.in</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation Strip */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
            { id: 'sources', label: 'Website Source Manager', icon: Globe, count: sources.length },
            { id: 'jobs', label: 'All Job Listings', icon: Briefcase, count: jobs.length },
            { id: 'quarantine', label: 'Quarantined / Review', icon: AlertOctagon, count: quarantinedJobs.length, badgeColor: 'bg-red-100 text-red-800' },
            { id: 'runs', label: 'Collection Run History', icon: History, count: runs.length },
            { id: 'changes', label: 'Audit & Corrigenda Log', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : (tab.badgeColor || 'bg-slate-200 text-slate-700')
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin View Container */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1">
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Listings</span>
                <p className="text-2xl font-extrabold text-blue-950 mt-1">{stats?.totalJobs ?? 0}</p>
                <span className="text-[10px] text-slate-500">Real DB records</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Government</span>
                <p className="text-2xl font-extrabold text-blue-900 mt-1">{stats?.governmentCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Sarkari notifications</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Private Tech</span>
                <p className="text-2xl font-extrabold text-indigo-700 mt-1">{stats?.privateCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Corporate portals</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Internships</span>
                <p className="text-2xl font-extrabold text-cyan-700 mt-1">{stats?.internshipCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">National schemes</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Fresher Drives</span>
                <p className="text-2xl font-extrabold text-teal-700 mt-1">{stats?.fresherCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">0-yr experience</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Closing Soon</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.closingSoonCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">&lt; 7 days left</span>
              </div>
            </div>

            {/* Status Breakdown & Source Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Publication Pipeline Status
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Applications Open (Live on Portal)
                    </span>
                    <span className="font-bold">{stats?.openCount ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Closing Soon (Urgent Deadline Warnings)
                    </span>
                    <span className="font-bold">{stats?.closingSoonCount ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 text-blue-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Upcoming (Advance Notice Released)
                    </span>
                    <span className="font-bold">{stats?.upcomingCount ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 text-slate-700">
                    <span className="font-semibold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      Closed / Expired Deadlines
                    </span>
                    <span className="font-bold">{stats?.closedCount ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      Quarantined / Under Review / Withdrawn
                    </span>
                    <span className="font-bold">{stats?.quarantinedCount ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Collector & Source Health */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Sources & Crawler Health
                  </h3>
                  <button
                    onClick={() => setActiveTab('sources')}
                    className="text-xs font-bold text-blue-900 hover:underline"
                  >
                    Manage Sources →
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">GitHub Actions 6-Hour Scheduled Worker</p>
                      <p className="text-[11px] text-slate-500">Cron: 0 */6 * * * • Last run 2 hrs ago</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Healthy
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Configured Recruitment Portals</p>
                      <p className="text-[11px] text-slate-500">{sources.length} sources enabled dynamically</p>
                    </div>
                    <span className="font-bold text-slate-900">{sources.filter(s => s.status === 'active').length} Active</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Total Monitored Vacancies</p>
                      <p className="text-[11px] text-slate-500">Aggregated across all official notifications</p>
                    </div>
                    <span className="font-bold text-emerald-700 text-sm">
                      {stats?.totalVacancies?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNIVERSAL WEBSITE SOURCE MANAGER */}
        {activeTab === 'sources' && <SourceManager />}

        {/* TAB 3: ALL JOB LISTINGS MANAGEMENT */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Job Listings Repository</h3>
                <p className="text-xs text-slate-500">Audit, edit, unpublish, or republish listings.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Filter listings by title or org..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Title & Organization</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Vacancies</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs
                    .filter((j) => {
                      if (!jobSearch) return true;
                      const q = jobSearch.toLowerCase();
                      return j.title.toLowerCase().includes(q) || j.organization.toLowerCase().includes(q);
                    })
                    .map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{job.title}</p>
                          <p className="text-[11px] text-slate-500">{job.organization}</p>
                        </td>
                        <td className="py-3 px-3 capitalize">{job.category}</td>
                        <td className="py-3 px-3 font-semibold">{job.vacancies ? job.vacancies.toLocaleString('en-IN') : 'Not specified'}</td>
                        <td className="py-3 px-3 font-medium">{job.application_deadline || 'Not found'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            job.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800'
                              : job.status === 'closing_soon'
                              ? 'bg-amber-100 text-amber-800'
                              : job.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingJob(job)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600"
                              title="Edit listing details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {job.status === 'open' ? (
                              <button
                                onClick={() => handleStatusChange(job.id, 'closed')}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                                title="Unpublish / mark closed"
                              >
                                Mark Closed
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(job.id, 'open')}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold"
                                title="Republish"
                              >
                                Republish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: QUARANTINED & NEEDS REVIEW */}
        {activeTab === 'quarantine' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Quarantined Recruitment Notices</h3>
              <p className="text-xs text-slate-500">
                Notices with extraction ambiguity, conflicting dates, or unverified secondary sources are held here before publication.
              </p>
            </div>

            {quarantinedJobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Zero Quarantined Notices</p>
                <p>All automated extraction pipelines passed validation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quarantinedJobs.map((qJob) => (
                  <div key={qJob.id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">{qJob.title}</span>
                      <p className="text-slate-600">{qJob.organization}</p>
                      <p className="text-[11px] text-red-700 font-semibold">
                        Quarantine Reason: Extraction confidence below threshold or conflicting application deadline text.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStatusChange(qJob.id, 'open')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-600"
                      >
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleStatusChange(qJob.id, 'withdrawn')}
                        className="px-3 py-1.5 rounded-lg bg-red-700 text-white font-bold text-[11px] hover:bg-red-600"
                      >
                        Reject & Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COLLECTION RUNS */}
        {activeTab === 'runs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Collector Run History</h3>
              <p className="text-xs text-slate-500">Audit trail of automated and manual crawler executions.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Source Name</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Pages</th>
                    <th className="py-2.5 px-3">Discovered</th>
                    <th className="py-2.5 px-3">Saved / Updated</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{r.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.source_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{new Date(r.started_at).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">{r.pages_scanned}</td>
                      <td className="py-2.5 px-3 font-bold">{r.items_discovered}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">{r.new_items_saved} saved / {r.items_updated} updated</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: JOB CHANGES & AUDIT TRAIL */}
        {activeTab === 'changes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Corrigenda & Audit Log</h3>
              <p className="text-xs text-slate-500">Historical record of all date changes, vacancy updates, and amendments.</p>
            </div>

            <div className="space-y-3">
              {changes.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.job_title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(c.detected_at).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      {c.change_type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-600">Field: <code>{c.changed_field}</code></span>
                  </div>
                  <p className="text-slate-700 font-medium">{c.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Edit Opportunity Details</h3>
            <form onSubmit={handleSaveJobEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vacancies</label>
                <input
                  type="number"
                  value={editingJob.vacancies || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, vacancies: e.target.value ? Number(e.target.value) : null })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Application Deadline (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editingJob.application_deadline || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, application_deadline: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corrigendum / Revision Note (Optional)</label>
                <input
                  type="text"
                  value={editingJob.corrigendum_note || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, corrigendum_note: e.target.value, has_corrigendum: Boolean(e.target.value) })}
                  placeholder="e.g. Last date extended to 28th Aug"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 border rounded font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white font-bold rounded hover:bg-blue-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
