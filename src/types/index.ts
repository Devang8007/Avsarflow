export type JobCategory = 'government' | 'private' | 'internship' | 'fresher';

export type JobStatus = 
  | 'open' 
  | 'upcoming' 
  | 'closing_soon' 
  | 'closed' 
  | 'withdrawn' 
  | 'needs_review';

export type ExtractionStatus = 
  | 'extracted' 
  | 'partial' 
  | 'quarantined' 
  | 'verified' 
  | 'manual_override';

export type SourceCategory = 
  | 'government' 
  | 'private' 
  | 'internship' 
  | 'employment_portal' 
  | 'psu' 
  | 'other';

export type CollectionMethod = 
  | 'html' 
  | 'rss' 
  | 'sitemap' 
  | 'pdf_directory' 
  | 'json_feed';

export type SourceStatus = 'active' | 'paused' | 'error' | 'unconfigured';
export type HealthStatus = 'healthy' | 'warning' | 'failing' | 'unknown';

export interface Job {
  id: string;
  title: string;
  slug: string;
  organization: string;
  category: JobCategory;
  department?: string | null;
  location: string;
  employment_type: string; // Full-time, Internship, Contract, Trainee
  qualification: string; // e.g. "Graduate in any discipline", "B.Tech/B.E.", "10th Pass"
  eligibility_details?: string | null;
  skills?: string[] | null;
  experience_required?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  age_relaxation?: string | null;
  vacancies?: number | null;
  vacancy_breakdown?: Record<string, number> | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_text?: string | null; // e.g. "Level 7 (₹44,900 - ₹1,42,400)"
  stipend?: string | null; // e.g. "₹25,000 / month"
  application_fee?: string | null; // e.g. "General/OBC: ₹100, SC/ST/Female: Nil"
  selection_process?: string | null; // e.g. "Prelims, Mains, Interview"
  application_open_date?: string | null; // ISO Date YYYY-MM-DD
  application_deadline: string | null; // ISO Date YYYY-MM-DD
  application_deadline_text?: string | null; // Original raw extracted string
  exam_date?: string | null;
  publication_date: string; // ISO Date YYYY-MM-DD
  description: string;
  application_url: string; // Direct link to official application portal
  official_notification_url?: string | null; // Link to official PDF or gazette
  source_id?: string | null;
  source_name?: string | null;
  source_url: string;
  source_document_hash?: string | null;
  status: JobStatus;
  extraction_status: ExtractionStatus;
  extraction_confidence?: number | null; // 0.0 to 1.0
  first_seen_at: string;
  last_checked_at: string;
  published_at?: string | null;
  updated_at: string;
  is_verified: boolean;
  has_corrigendum?: boolean;
  corrigendum_note?: string | null;
  raw_extracted_data?: Record<string, unknown> | null;
}

export interface Source {
  id: string;
  name: string;
  slug: string;
  base_url: string;
  listing_url: string;
  category: SourceCategory;
  collection_method: CollectionMethod;
  feed_url?: string | null;
  sitemap_url?: string | null;
  country: string;
  state?: string | null;
  organization?: string | null;
  pagination_type?: 'url_param' | 'next_button' | 'scroll' | 'none';
  pagination_selector?: string | null;
  item_selector?: string | null;
  title_selector?: string | null;
  link_selector?: string | null;
  date_selector?: string | null;
  deadline_selector?: string | null;
  qualification_selector?: string | null;
  vacancy_selector?: string | null;
  url_inclusion_patterns?: string[] | null;
  url_exclusion_patterns?: string[] | null;
  allowed_file_types?: string[] | null;
  request_interval_hours: number;
  rate_limit_rpm: number;
  custom_headers?: Record<string, string> | null;
  extraction_template_id?: string | null;
  status: SourceStatus;
  health_status: HealthStatus;
  last_successful_run_at?: string | null;
  last_attempted_run_at?: string | null;
  next_run_at?: string | null;
  last_error_message?: string | null;
  consecutive_failures: number;
  config_version: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionRun {
  id: string;
  source_id: string;
  source_name: string;
  started_at: string;
  completed_at?: string | null;
  status: 'running' | 'success' | 'partial' | 'failed';
  pages_scanned: number;
  items_discovered: number;
  new_items_saved: number;
  items_updated: number;
  duplicates_found: number;
  items_quarantined: number;
  errors_count: number;
  error_log?: string[] | null;
  run_type: 'scheduled' | 'manual' | 'test';
}

export interface JobChange {
  id: string;
  job_id: string;
  job_title: string;
  changed_field: string;
  old_value?: string | null;
  new_value?: string | null;
  change_type: 'deadline_extension' | 'fee_change' | 'vacancy_update' | 'corrigendum' | 'status_change' | 'withdrawn';
  detected_at: string;
  source_document_url?: string | null;
  notes?: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationSubscription {
  id: string;
  email: string;
  category_preferences: JobCategory[];
  notify_new_jobs: boolean;
  notify_deadline_changes: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface SourceDiscoveryResult {
  url: string;
  success: boolean;
  detected_method: CollectionMethod;
  detected_listing_url?: string;
  detected_feeds?: string[];
  detected_sitemaps?: string[];
  sample_notices_found: number;
  sample_pdfs_found: number;
  proposed_selectors?: {
    item_selector?: string;
    title_selector?: string;
    link_selector?: string;
    date_selector?: string;
  };
  warnings?: string[];
  ssrf_checked: boolean;
  robots_txt_status: 'allowed' | 'disallowed' | 'not_found';
}

export interface SourceTestPreviewItem {
  title: string;
  organization: string;
  category: JobCategory;
  qualification: string;
  vacancies?: number | null;
  application_deadline?: string | null;
  salary_text?: string | null;
  source_url: string;
  official_notification_url?: string | null;
  is_duplicate: boolean;
  confidence_score: number;
  warnings?: string[];
}

export interface PortalStats {
  totalJobs: number;
  governmentCount: number;
  privateCount: number;
  internshipCount: number;
  fresherCount: number;
  openCount: number;
  closingSoonCount: number;
  upcomingCount: number;
  closedCount: number;
  quarantinedCount: number;
  activeSourcesCount: number;
  totalVacancies: number;
  lastRunTime?: string;
}
