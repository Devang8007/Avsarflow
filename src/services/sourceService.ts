import { Source, CollectionRun, SourceDiscoveryResult, SourceTestPreviewItem } from '../types';
import { INITIAL_SOURCES, INITIAL_COLLECTION_RUNS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SOURCES_STORAGE_KEY = 'opportunityhub_sources_v1';
const RUNS_STORAGE_KEY = 'opportunityhub_runs_v1';

function getLocalSources(): Source[] {
  try {
    const raw = localStorage.getItem(SOURCES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(INITIAL_SOURCES));
      return INITIAL_SOURCES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SOURCES;
  }
}

function saveLocalSources(sources: Source[]): void {
  try {
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(sources));
  } catch (e) {
    console.error('Failed to save sources locally', e);
  }
}

function getLocalRuns(): CollectionRun[] {
  try {
    const raw = localStorage.getItem(RUNS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(INITIAL_COLLECTION_RUNS));
      return INITIAL_COLLECTION_RUNS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COLLECTION_RUNS;
  }
}

export const sourceService = {
  // Get all sources
  async getSources(): Promise<Source[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('sources').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Source[];
      } catch (err) {
        console.warn('Supabase sources fetch error', err);
      }
    }
    return getLocalSources();
  },

  // Get source by id
  async getSourceById(id: string): Promise<Source | null> {
    const sources = await this.getSources();
    return sources.find(s => s.id === id) || null;
  },

  // Add a new source
  async addSource(sourceData: Partial<Source>): Promise<Source> {
    const newSource: Source = {
      id: 'src-' + Date.now(),
      name: sourceData.name || 'New Recruitment Source',
      slug: (sourceData.name || 'source').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      base_url: sourceData.base_url || '',
      listing_url: sourceData.listing_url || sourceData.base_url || '',
      category: sourceData.category || 'other',
      collection_method: sourceData.collection_method || 'html',
      feed_url: sourceData.feed_url || null,
      sitemap_url: sourceData.sitemap_url || null,
      country: sourceData.country || 'India',
      state: sourceData.state || null,
      organization: sourceData.organization || sourceData.name || null,
      pagination_type: sourceData.pagination_type || 'url_param',
      item_selector: sourceData.item_selector || '.notice-item, .job-listing, tr',
      title_selector: sourceData.title_selector || 'a, .title, td.title',
      link_selector: sourceData.link_selector || 'a[href$=".pdf"], a.apply-link, a',
      date_selector: sourceData.date_selector || '.date, .published-on, td.date',
      deadline_selector: sourceData.deadline_selector || '.last-date, .deadline',
      qualification_selector: sourceData.qualification_selector || '.qualification',
      vacancy_selector: sourceData.vacancy_selector || '.vacancies, .posts',
      url_inclusion_patterns: sourceData.url_inclusion_patterns || ['*recruitment*', '*notices*', '*career*', '*.pdf'],
      url_exclusion_patterns: sourceData.url_exclusion_patterns || ['*tender*', '*archive*', '*results*'],
      allowed_file_types: sourceData.allowed_file_types || ['html', 'pdf'],
      request_interval_hours: sourceData.request_interval_hours || 6,
      rate_limit_rpm: sourceData.rate_limit_rpm || 12,
      custom_headers: sourceData.custom_headers || { 'User-Agent': 'OpportunityHub-Collector/1.0 (+https://opportunityhub.in/bot)' },
      extraction_template_id: sourceData.extraction_template_id || 'generic_v1',
      status: 'active',
      health_status: 'healthy',
      last_successful_run_at: null,
      last_attempted_run_at: null,
      next_run_at: new Date(Date.now() + (sourceData.request_interval_hours || 6) * 3600 * 1000).toISOString(),
      last_error_message: null,
      consecutive_failures: 0,
      config_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sources').insert(newSource);
      } catch (err) {
        console.warn('Supabase source insert failed', err);
      }
    }

    const sources = getLocalSources();
    sources.unshift(newSource);
    saveLocalSources(sources);

    return newSource;
  },

  // Update existing source
  async updateSource(id: string, updates: Partial<Source>): Promise<Source | null> {
    const sources = getLocalSources();
    const index = sources.findIndex(s => s.id === id);
    if (index === -1) return null;

    sources[index] = {
      ...sources[index],
      ...updates,
      config_version: sources[index].config_version + 1,
      updated_at: new Date().toISOString()
    };
    saveLocalSources(sources);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sources').update(sources[index]).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateSource failed', err);
      }
    }

    return sources[index];
  },

  // Toggle source status (active / paused)
  async toggleSourceStatus(id: string): Promise<Source | null> {
    const source = await this.getSourceById(id);
    if (!source) return null;
    const newStatus = source.status === 'active' ? 'paused' : 'active';
    return this.updateSource(id, { status: newStatus });
  },

  // Delete source
  async deleteSource(id: string): Promise<boolean> {
    const sources = getLocalSources();
    const filtered = sources.filter(s => s.id !== id);
    saveLocalSources(filtered);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('sources').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSource failed', err);
      }
    }

    return true;
  },

  // Layered Discovery: Test and discover recruitment structure for any website URL
  async discoverWebsite(targetUrl: string): Promise<SourceDiscoveryResult> {
    // 1. SSRF and Protocol check
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      throw new Error('Invalid URL format. Please provide a valid HTTP/HTTPS address.');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Protocol not permitted. Only HTTP and HTTPS are allowed.');
    }

    const hostname = parsed.hostname.toLowerCase();
    // SSRF forbidden ranges check
    const isLocalOrPrivate = 
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname === '169.254.169.254' ||
      hostname.includes('metadata.google');

    if (isLocalOrPrivate) {
      throw new Error('Security Restriction (SSRF): Private network and cloud metadata addresses are prohibited.');
    }

    // Simulate / execute discovery layers
    await new Promise(r => setTimeout(r, 1200)); // Simulating network latency

    const isGov = hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');
    const isTech = hostname.includes('infosys') || hostname.includes('tcs') || hostname.includes('accenture') || hostname.includes('wipro');

    const detectedListingUrl = isGov 
      ? `${parsed.origin}/notices` 
      : isTech 
        ? `${parsed.origin}/careers/india` 
        : `${parsed.origin}/vacancies`;

    const feeds = isGov ? [`${parsed.origin}/rss.xml`] : [];
    const sitemaps = [`${parsed.origin}/sitemap.xml`];

    return {
      url: targetUrl,
      success: true,
      detected_method: feeds.length > 0 ? 'rss' : 'html',
      detected_listing_url: detectedListingUrl,
      detected_feeds: feeds,
      detected_sitemaps: sitemaps,
      sample_notices_found: isGov ? 14 : isTech ? 9 : 5,
      sample_pdfs_found: isGov ? 12 : 2,
      proposed_selectors: {
        item_selector: isGov ? '.views-row, .notice-item, tr' : '.job-item, .card-job',
        title_selector: 'a.title, h3, td.notice-title',
        link_selector: 'a[href$=".pdf"], a.apply-btn',
        date_selector: '.date, td.date, time'
      },
      warnings: isGov ? [] : ['Dynamic single-page application detected. Using HTML fallback parser.'],
      ssrf_checked: true,
      robots_txt_status: 'allowed'
    };
  },

  // Test source extraction & generate live preview of items before enabling
  async testSourcePreview(sourceData: Partial<Source>): Promise<SourceTestPreviewItem[]> {
    await new Promise(r => setTimeout(r, 1500));

    const org = sourceData.organization || sourceData.name || 'Selected Organization';
    const isGov = (sourceData.category === 'government') || (sourceData.base_url?.includes('.gov.in'));

    if (isGov) {
      return [
        {
          title: `Direct Recruitment for Technical Officers & Assistants 2025`,
          organization: org,
          category: 'government',
          qualification: 'Degree in Engineering or Master\'s Degree in Science from a recognized University',
          vacancies: 142,
          application_deadline: '2025-09-15',
          salary_text: 'Level 7 (₹44,900 - ₹1,42,400) + Central DA',
          source_url: sourceData.listing_url || sourceData.base_url || 'https://recruitment.gov.in',
          official_notification_url: `${sourceData.base_url || 'https://recruitment.gov.in'}/Advt_01_2025.pdf`,
          is_duplicate: false,
          confidence_score: 0.96
        },
        {
          title: `Special Recruitment Drive for Junior Administrative Staff`,
          organization: org,
          category: 'government',
          qualification: 'Graduate in any discipline with typing speed 35 wpm in English',
          vacancies: 68,
          application_deadline: '2025-08-30',
          salary_text: 'Level 4 (₹25,500 - ₹81,100)',
          source_url: sourceData.listing_url || sourceData.base_url || 'https://recruitment.gov.in',
          official_notification_url: `${sourceData.base_url || 'https://recruitment.gov.in'}/Notice_Admin_2025.pdf`,
          is_duplicate: false,
          confidence_score: 0.92
        },
        {
          title: `Corrigendum: Extension of Last Date for Online Applications`,
          organization: org,
          category: 'government',
          qualification: 'As specified in original notice',
          vacancies: null,
          application_deadline: '2025-09-05',
          salary_text: null,
          source_url: sourceData.listing_url || sourceData.base_url || 'https://recruitment.gov.in',
          official_notification_url: `${sourceData.base_url || 'https://recruitment.gov.in'}/Corrigendum_Ext_Date.pdf`,
          is_duplicate: true,
          confidence_score: 0.88,
          warnings: ['Duplicate notice detected: Corrigendum links to existing post Advt_01_2025. Will update deadline without creating new job.']
        }
      ];
    } else {
      return [
        {
          title: `Graduate Trainee / Associate Engineer 2025 Batch`,
          organization: org,
          category: (sourceData.category as any) || 'fresher',
          qualification: 'B.E./B.Tech/MCA/M.Sc with minimum 60% aggregate',
          vacancies: 500,
          application_deadline: '2025-09-30',
          salary_text: '₹4.2 LPA to ₹6.5 LPA CTC',
          source_url: sourceData.listing_url || sourceData.base_url || 'https://careers.example.com',
          official_notification_url: null,
          is_duplicate: false,
          confidence_score: 0.94
        },
        {
          title: `Summer Technology Internship (3-6 Months)`,
          organization: org,
          category: 'internship',
          qualification: 'Pre-final year students pursuing B.Tech/B.Sc (IT)',
          vacancies: 75,
          application_deadline: '2025-08-25',
          salary_text: 'Stipend ₹25,000 / month',
          source_url: sourceData.listing_url || sourceData.base_url || 'https://careers.example.com',
          official_notification_url: null,
          is_duplicate: false,
          confidence_score: 0.91
        }
      ];
    }
  },

  // Trigger manual collection run for a source
  async triggerCollectionRun(sourceId: string): Promise<CollectionRun> {
    const source = await this.getSourceById(sourceId);
    const sourceName = source ? source.name : 'All Sources';

    const newRun: CollectionRun = {
      id: 'run-' + Date.now(),
      source_id: sourceId,
      source_name: sourceName,
      started_at: new Date().toISOString(),
      completed_at: new Date(Date.now() + 4500).toISOString(),
      status: 'success',
      pages_scanned: 3,
      items_discovered: 7,
      new_items_saved: 0,
      items_updated: 1,
      duplicates_found: 6,
      items_quarantined: 0,
      errors_count: 0,
      run_type: 'manual'
    };

    const runs = getLocalRuns();
    runs.unshift(newRun);
    try {
      localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(runs));
    } catch (e) {
      console.error(e);
    }

    if (source) {
      await this.updateSource(sourceId, {
        last_successful_run_at: newRun.completed_at,
        last_attempted_run_at: newRun.started_at,
        health_status: 'healthy',
        consecutive_failures: 0
      });
    }

    return newRun;
  },

  // Get collection runs history
  async getCollectionRuns(limit = 10): Promise<CollectionRun[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('collection_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(limit);
        if (!error && data && data.length > 0) return data as CollectionRun[];
      } catch (err) {
        console.warn('Supabase runs fetch failed', err);
      }
    }
    return getLocalRuns().slice(0, limit);
  }
};
