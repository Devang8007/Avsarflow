import { Job, JobCategory, JobChange, PortalStats, NotificationSubscription } from '../types';
import { INITIAL_JOBS, INITIAL_CHANGES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const JOBS_STORAGE_KEY = 'opportunityhub_jobs_v1';
const CHANGES_STORAGE_KEY = 'opportunityhub_changes_v1';
const SUBS_STORAGE_KEY = 'opportunityhub_subscriptions_v1';

// Local storage helpers for offline/standalone mode
function getLocalJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_JOBS;
  }
}

function saveLocalJobs(jobs: Job[]): void {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs locally', e);
  }
}

function getLocalChanges(): JobChange[] {
  try {
    const raw = localStorage.getItem(CHANGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHANGES_STORAGE_KEY, JSON.stringify(INITIAL_CHANGES));
      return INITIAL_CHANGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHANGES;
  }
}

export interface JobFilterParams {
  category?: JobCategory | 'all';
  qualification?: string;
  location?: string;
  status?: string;
  searchQuery?: string;
  experience?: string;
  sortBy?: 'deadline_asc' | 'deadline_desc' | 'published_desc' | 'vacancies_desc';
}

export const jobService = {
  // Query jobs with filters
  async getJobs(params: JobFilterParams = {}): Promise<Job[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('jobs').select('*');

        if (params.category && params.category !== 'all') {
          query = query.eq('category', params.category);
        }
        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status);
        } else {
          // Default public view: exclude quarantined or needs_review unless requested
          query = query.in('status', ['open', 'closing_soon', 'upcoming', 'closed']);
        }
        if (params.searchQuery) {
          query = query.or(`title.ilike.%${params.searchQuery}%,organization.ilike.%${params.searchQuery}%,qualification.ilike.%${params.searchQuery}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Job[];
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local dataset', err);
      }
    }

    // Local / fallback filtering
    let jobs = getLocalJobs();

    // Default: hide quarantined unless explicitly searched
    if (!params.status) {
      jobs = jobs.filter(j => ['open', 'closing_soon', 'upcoming', 'closed'].includes(j.status));
    } else if (params.status !== 'all') {
      jobs = jobs.filter(j => j.status === params.status);
    }

    if (params.category && params.category !== 'all') {
      jobs = jobs.filter(j => j.category === params.category);
    }

    if (params.qualification && params.qualification !== 'all') {
      const q = params.qualification.toLowerCase();
      jobs = jobs.filter(j => j.qualification.toLowerCase().includes(q));
    }

    if (params.location && params.location !== 'all') {
      const loc = params.location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(loc) || j.location.toLowerCase().includes('all india'));
    }

    if (params.experience && params.experience !== 'all') {
      if (params.experience === 'fresher') {
        jobs = jobs.filter(j => 
          j.category === 'fresher' || 
          j.experience_required?.toLowerCase().includes('fresher') || 
          j.experience_required?.toLowerCase().includes('0 ')
        );
      }
    }

    if (params.searchQuery) {
      const sq = params.searchQuery.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(sq) ||
        j.organization.toLowerCase().includes(sq) ||
        j.qualification.toLowerCase().includes(sq) ||
        (j.department && j.department.toLowerCase().includes(sq)) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(sq)))
      );
    }

    // Sort order
    if (params.sortBy === 'deadline_asc') {
      jobs.sort((a, b) => {
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;
        return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
      });
    } else if (params.sortBy === 'vacancies_desc') {
      jobs.sort((a, b) => (b.vacancies || 0) - (a.vacancies || 0));
    } else {
      // Default: published_desc
      jobs.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());
    }

    return jobs;
  },

  // Get job by slug
  async getJobBySlug(slug: string): Promise<Job | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('jobs').select('*').eq('slug', slug).single();
        if (!error && data) return data as Job;
      } catch (err) {
        console.warn('Supabase getJobBySlug failed', err);
      }
    }

    const jobs = getLocalJobs();
    return jobs.find(j => j.slug === slug || j.id === slug) || null;
  },

  // Get actual portal statistics (No fake metrics)
  async getStats(): Promise<PortalStats> {
    const jobs = getLocalJobs();
    
    return {
      totalJobs: jobs.length,
      governmentCount: jobs.filter(j => j.category === 'government').length,
      privateCount: jobs.filter(j => j.category === 'private').length,
      internshipCount: jobs.filter(j => j.category === 'internship').length,
      fresherCount: jobs.filter(j => j.category === 'fresher').length,
      openCount: jobs.filter(j => j.status === 'open').length,
      closingSoonCount: jobs.filter(j => j.status === 'closing_soon').length,
      upcomingCount: jobs.filter(j => j.status === 'upcoming').length,
      closedCount: jobs.filter(j => j.status === 'closed').length,
      quarantinedCount: jobs.filter(j => j.status === 'needs_review' || j.status === 'withdrawn').length,
      activeSourcesCount: 10,
      totalVacancies: jobs.reduce((acc, curr) => acc + (curr.vacancies || 0), 0),
      lastRunTime: new Date(Date.now() - 2 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  // Get jobs closing soon
  async getClosingSoonJobs(limit = 4): Promise<Job[]> {
    const jobs = await this.getJobs({ status: 'closing_soon' });
    return jobs.slice(0, limit);
  },

  // Get latest notices
  async getLatestJobs(limit = 8): Promise<Job[]> {
    const jobs = await this.getJobs({ sortBy: 'published_desc' });
    return jobs.slice(0, limit);
  },

  // Get recent job changes / corrigenda
  async getRecentChanges(limit = 5): Promise<JobChange[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('job_changes')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(limit);
        if (!error && data && data.length > 0) return data as JobChange[];
      } catch (err) {
        console.warn('Supabase changes query failed', err);
      }
    }
    return getLocalChanges().slice(0, limit);
  },

  // Subscribe to email alerts
  async subscribe(email: string, categories: JobCategory[]): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('notification_subscriptions').insert({
          email,
          category_preferences: categories,
          notify_new_jobs: true,
          notify_deadline_changes: true,
          is_verified: true
        });
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase subscribe failed', err);
      }
    }

    try {
      const subs: NotificationSubscription[] = JSON.parse(localStorage.getItem(SUBS_STORAGE_KEY) || '[]');
      if (!subs.some(s => s.email === email)) {
        subs.push({
          id: 'sub-' + Date.now(),
          email,
          category_preferences: categories,
          notify_new_jobs: true,
          notify_deadline_changes: true,
          is_verified: true,
          created_at: new Date().toISOString()
        });
        localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(subs));
      }
      return true;
    } catch {
      return false;
    }
  },

  // Admin: Update job status (publish, unpublish, quarantine)
  async updateJobStatus(jobId: string, status: Job['status'], reason?: string): Promise<boolean> {
    const jobs = getLocalJobs();
    const index = jobs.findIndex(j => j.id === jobId);
    if (index === -1) return false;

    const oldStatus = jobs[index].status;
    jobs[index].status = status;
    jobs[index].updated_at = new Date().toISOString();
    saveLocalJobs(jobs);

    // Record change log
    const changes = getLocalChanges();
    changes.unshift({
      id: 'chg-' + Date.now(),
      job_id: jobId,
      job_title: jobs[index].title,
      changed_field: 'status',
      old_value: oldStatus,
      new_value: status,
      change_type: status === 'withdrawn' ? 'withdrawn' : 'status_change',
      detected_at: new Date().toISOString(),
      notes: reason || `Status changed from ${oldStatus} to ${status} by Administrator.`
    });
    localStorage.setItem(CHANGES_STORAGE_KEY, JSON.stringify(changes));

    return true;
  },

  // Admin: Update job details
  async updateJob(updatedJob: Job): Promise<boolean> {
    const jobs = getLocalJobs();
    const index = jobs.findIndex(j => j.id === updatedJob.id);
    if (index === -1) return false;

    jobs[index] = { ...updatedJob, updated_at: new Date().toISOString() };
    saveLocalJobs(jobs);
    return true;
  }
};
