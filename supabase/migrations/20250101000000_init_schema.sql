-- OpportunityHub India Database Schema
-- Version: 1.0.0
-- Compatible with Supabase PostgreSQL & Lovable deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    base_url TEXT NOT NULL,
    listing_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('government', 'private', 'internship', 'employment_portal', 'psu', 'other')),
    collection_method TEXT NOT NULL DEFAULT 'html' CHECK (collection_method IN ('html', 'rss', 'sitemap', 'pdf_directory', 'json_feed')),
    feed_url TEXT,
    sitemap_url TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT,
    organization TEXT,
    pagination_type TEXT DEFAULT 'url_param',
    pagination_selector TEXT,
    item_selector TEXT,
    title_selector TEXT,
    link_selector TEXT,
    date_selector TEXT,
    deadline_selector TEXT,
    qualification_selector TEXT,
    vacancy_selector TEXT,
    url_inclusion_patterns TEXT[],
    url_exclusion_patterns TEXT[],
    allowed_file_types TEXT[] DEFAULT ARRAY['html', 'pdf'],
    request_interval_hours INTEGER NOT NULL DEFAULT 6,
    rate_limit_rpm INTEGER NOT NULL DEFAULT 15,
    custom_headers JSONB,
    extraction_template_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'unconfigured')),
    health_status TEXT NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'failing', 'unknown')),
    last_successful_run_at TIMESTAMPTZ,
    last_attempted_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_error_message TEXT,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    config_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    organization TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('government', 'private', 'internship', 'fresher')),
    department TEXT,
    location TEXT NOT NULL DEFAULT 'All India',
    employment_type TEXT NOT NULL DEFAULT 'Full-time',
    qualification TEXT NOT NULL,
    eligibility_details TEXT,
    skills TEXT[],
    experience_required TEXT,
    age_min INTEGER,
    age_max INTEGER,
    age_relaxation TEXT,
    vacancies INTEGER,
    vacancy_breakdown JSONB,
    salary_min NUMERIC,
    salary_max NUMERIC,
    salary_text TEXT,
    stipend TEXT,
    application_fee TEXT,
    selection_process TEXT,
    application_open_date DATE,
    application_deadline DATE,
    application_deadline_text TEXT,
    exam_date TEXT,
    publication_date DATE NOT NULL,
    description TEXT NOT NULL,
    application_url TEXT NOT NULL,
    official_notification_url TEXT,
    source_id TEXT REFERENCES public.sources(id) ON DELETE SET NULL,
    source_name TEXT,
    source_url TEXT NOT NULL,
    source_document_hash TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'upcoming', 'closing_soon', 'closed', 'withdrawn', 'needs_review')),
    extraction_status TEXT NOT NULL DEFAULT 'extracted' CHECK (extraction_status IN ('extracted', 'partial', 'quarantined', 'verified', 'manual_override')),
    extraction_confidence NUMERIC DEFAULT 0.95,
    raw_extracted_data JSONB,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    has_corrigendum BOOLEAN NOT NULL DEFAULT FALSE,
    corrigendum_note TEXT,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search, filtering, and deduplication
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON public.jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_publication_date ON public.jobs(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_source_id ON public.jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_jobs_source_document_hash ON public.jobs(source_document_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_organization ON public.jobs(organization);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON public.jobs USING gin (to_tsvector('english', title || ' ' || organization || ' ' || qualification));

-- ============================================================================
-- 3. COLLECTION RUNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.collection_runs (
    id TEXT PRIMARY KEY,
    source_id TEXT REFERENCES public.sources(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
    pages_scanned INTEGER NOT NULL DEFAULT 0,
    items_discovered INTEGER NOT NULL DEFAULT 0,
    new_items_saved INTEGER NOT NULL DEFAULT 0,
    items_updated INTEGER NOT NULL DEFAULT 0,
    duplicates_found INTEGER NOT NULL DEFAULT 0,
    items_quarantined INTEGER NOT NULL DEFAULT 0,
    errors_count INTEGER NOT NULL DEFAULT 0,
    error_log TEXT[],
    run_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (run_type IN ('scheduled', 'manual', 'test'))
);

CREATE INDEX IF NOT EXISTS idx_runs_source_id ON public.collection_runs(source_id);
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON public.collection_runs(started_at DESC);

-- ============================================================================
-- 4. JOB CHANGES & CORRIGENDA HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_changes (
    id TEXT PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    changed_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL CHECK (change_type IN ('deadline_extension', 'fee_change', 'vacancy_update', 'corrigendum', 'status_change', 'withdrawn')),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_document_url TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_changes_job_id ON public.job_changes(job_id);
CREATE INDEX IF NOT EXISTS idx_changes_detected_at ON public.job_changes(detected_at DESC);

-- ============================================================================
-- 5. ADMIN AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    admin_id TEXT,
    admin_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. NOTIFICATION SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    category_preferences TEXT[] NOT NULL DEFAULT ARRAY['government', 'private', 'internship', 'fresher'],
    notify_new_jobs BOOLEAN NOT NULL DEFAULT TRUE,
    notify_deadline_changes BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
    unsubscribe_token TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- JOBS POLICIES:
-- 1. Public can view active published jobs
CREATE POLICY "Public can view published jobs" ON public.jobs
    FOR SELECT
    USING (status IN ('open', 'closing_soon', 'upcoming', 'closed'));

-- 2. Authenticated administrators have full access
CREATE POLICY "Admins have full access to jobs" ON public.jobs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- SOURCES POLICIES:
-- 1. Public can view active sources
CREATE POLICY "Public can view active sources" ON public.sources
    FOR SELECT
    USING (status = 'active');

-- 2. Admins can manage all sources
CREATE POLICY "Admins have full access to sources" ON public.sources
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- COLLECTION RUNS POLICIES:
CREATE POLICY "Admins have full access to collection runs" ON public.collection_runs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can view recent runs" ON public.collection_runs
    FOR SELECT
    USING (true);

-- JOB CHANGES POLICIES:
CREATE POLICY "Public can view job changes" ON public.job_changes
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage changes" ON public.job_changes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- NOTIFICATION SUBSCRIPTIONS POLICIES:
-- 1. Anyone can insert a subscription
CREATE POLICY "Anyone can subscribe to notifications" ON public.notification_subscriptions
    FOR INSERT
    WITH CHECK (true);

-- 2. Users can update/unsubscribe via token
CREATE POLICY "Admins have full access to subscriptions" ON public.notification_subscriptions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 8. AUTOMATIC STATUS AND DEADLINE UPDATER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_update_job_deadline_statuses()
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER := 0;
BEGIN
    -- Mark closing_soon if deadline is within 3 days and currently open
    UPDATE public.jobs
    SET status = 'closing_soon',
        updated_at = NOW()
    WHERE status = 'open'
      AND application_deadline IS NOT NULL
      AND application_deadline >= CURRENT_DATE
      AND application_deadline <= (CURRENT_DATE + INTERVAL '3 days');
      
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    -- Mark closed if deadline has passed
    UPDATE public.jobs
    SET status = 'closed',
        updated_at = NOW()
    WHERE status IN ('open', 'closing_soon')
      AND application_deadline IS NOT NULL
      AND application_deadline < CURRENT_DATE;

    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
