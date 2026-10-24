# OpportunityHub India — Centralized Recruitment & Internship Portal

> **National Public-Interest Directory:** Automated discovery, deterministic extraction, cryptographic verification, and scheduled publishing for Government Recruitment (Sarkari), Private IT/Core Careers, National Internships, and Fresher Openings across India.

---

## 1. Project Objective & Core Philosophy

OpportunityHub India eliminates the chaos, paywalls, fabricated metrics, and coaching lead-generation traps typical of traditional Indian job boards.

- **Zero AI Hallucination:** Normal discovery and extraction workflows **do not use** Gemini, OpenAI, Claude, or any paid generative LLMs. Information is parsed using **deterministic Python rules, HTML DOM traversal, PDF text extraction (PyMuPDF), and document hashing (SHA-256)**.
- **Real Database Counts Only:** The portal displays actual counts directly queried from the database. It **never displays fake statistics** (such as "Millions of users" or "50,000+ jobs").
- **No Mandatory Candidate Accounts:** Students and job seekers browse, search, filter, and inspect verified notices without logging in or submitting personal data.
- **Direct Official Links:** Candidate application links point directly to authentic government gazettes or employer portals (`upsconline.nic.in`, `ssc.gov.in`, `ibpsonline.ibps.in`, etc.), clearly distinguished from third-party links.

---

## 2. Technology Stack

### Frontend (Lovable & Vite Compatible)
- **Framework:** React 19 with TypeScript
- **Bundler:** Vite 6 / Vite 8
- **Styling:** Tailwind CSS v4 with custom deep-navy & warm saffron tokens
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Database Client:** `@supabase/supabase-js` (with seamless offline fallback dataset)

### Backend & Database
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Migrations:** SQL migrations located under `supabase/migrations/`
- **Seed Data:** High-fidelity Indian opportunities located under `supabase/seed.sql`

### Automation & Crawler
- **Runtime:** Python 3.12+
- **HTTP Engine:** `requests` & `httpx` with SSRF guards and exponential backoff
- **HTML Parsing:** `beautifulsoup4`
- **PDF Extraction:** `PyMuPDF` (`fitz`) with SHA-256 document hashing
- **Testing:** `pytest` unit test suite covering extraction, SSRF, and deduplication
- **Scheduled Worker:** GitHub Actions workflow running on cron `0 */6 * * *`

---

## 3. Key Pages & Routes

| Route | Page Description |
|---|---|
| `/` | **Homepage:** Hero search, real database statistics, category cards, closing-soon alerts, recent corrigenda ticker, qualification & state shortcuts. |
| `/government-jobs` | **Government Recruitment:** UPSC, SSC, RRB, Banking, Defense, and State PSC notifications. |
| `/private-jobs` | **Private Sector Openings:** Direct careers from Tata Consultancy Services, Infosys, Accenture, Wipro, etc. |
| `/internships` | **National Internships:** NITI Aayog, RBI Summer Scheme, DRDO, Infosys Springboard, research trainees. |
| `/fresher-jobs` | **Fresher Openings:** Entry-level openings with zero experience required. |
| `/jobs/:slug` | **Individual Job Details:** Detailed eligibility, age limits, pay levels, vacancies, PDF notice link, official apply link, provenance hash, and corrigendum history. |
| `/latest` | **Chronological Feed:** Live stream of newly discovered notices. |
| `/about` | Platform mission, deterministic extraction standard, and architecture. |
| `/contact` | Contact desk & candidate recruitment correction reporting form. |
| `/privacy` | Privacy policy and student data protection charter. |
| `/terms` | Legal disclaimer and terms of use. |
| `/admin/login` | Administrator authentication (Supabase Auth + one-click demo login). |
| `/admin` | Protected dashboard with KPI cards, job listing controls, quarantine queue, audit logs, and Universal Website Source Manager. |

---

## 4. Universal Website Source Manager

The built-in **Universal Website Source Manager** allows administrators to add, configure, test, and manage any job or recruitment website dynamically through the web interface **without modifying source code**.

### How to Add Any Website Dynamically:
1. Navigate to `/admin` and click the **Website Source Manager** tab.
2. Click **"Add New Website"**.
3. Enter the Target Website URL (e.g., `https://hssc.gov.in`).
4. Click **"Discover Website"**:
   - **Layer 1:** Scans the URL and its accessible links.
   - **Layer 2:** Inspects `robots.txt` and locates `sitemap.xml`.
   - **Layer 3:** Discovers internal recruitment listing pages (`/careers`, `/notices`, `/vacancies`).
   - **Layer 4:** Identifies downloadable PDF notices and application links.
   - **Layer 5:** Proposes CSS selectors (`item_selector`, `title_selector`, `link_selector`, `date_selector`).
   - **SSRF Guard:** Automatically verifies that destination IP is not a private/restricted network or cloud metadata address.
5. Click **"Test Source & Preview Jobs"**:
   - The engine performs a dry-run extraction.
   - Displays extracted sample job titles, detected deadlines, vacancies, qualifications, confidence scores, and duplicate warnings in an interactive modal.
6. Adjust custom CSS selectors or regex rules if desired.
7. Click **"Confirm & Enable Source"**. The source is saved to the database and monitored by the 6-hour scheduler!

---

## 5. Initial Source Inventory & Status

| Source Name | Portal Starting URL | Category | Collection Method | Initial Status |
|---|---|---|---|---|
| **Staff Selection Commission (SSC)** | `https://ssc.gov.in/` | Government | HTML / Notices | **Configured & Tested** |
| **Union Public Service Commission (UPSC)** | `https://upsc.gov.in/` | Government | HTML / RSS | **Configured & Tested** |
| **Institute of Banking Personnel (IBPS)** | `https://www.ibps.in/` | Government | HTML / CRP | **Configured & Tested** |
| **Railway Recruitment Boards (RRB)** | `https://www.rrbcdg.gov.in/` | Government | HTML / CEN | **Configured & Tested** |
| **National Career Service (NCS)** | `https://www.ncs.gov.in/` | Employment Portal | HTML | **Configured & Tested** |
| **India Post (Dept of Posts)** | `https://www.indiapost.gov.in/vacancies` | Government | HTML / GDS | **Configured & Tested** |
| **Tata Consultancy Services (TCS)** | `https://www.tcs.com/careers` | Private | HTML / Entry-Level | **Configured & Tested** |
| **Infosys Careers & Springboard** | `https://www.infosys.com/careers/` | Private | HTML / Internships | **Configured & Tested** |
| **Accenture India Careers** | `https://www.accenture.com/in-en/careers` | Private | HTML | **Configured & Tested** |
| **Wipro Careers & WILP** | `https://careers.wipro.com/` | Private | HTML / Campus | **Configured & Tested** |

*Note: In accordance with web scraping ethics and website terms, the crawler respects `robots.txt`, implements rate limiting (10-15 RPM), never bypasses CAPTCHAs or logins, and marks any restricted source as requiring authorization.*

---

## 6. Deterministic Extraction Engine Rules

The rule-based extraction engine (`collector/extractors/rule_extractor.py`) uses specialized regular expressions for Indian recruitment formats:

- **Deadlines:** Detects `"Last date for submission"`, `"Closing date"`, `"Applications must be submitted by"`, `"Extended upto"` in formats `DD-MM-YYYY`, `DD/MM/YYYY`, `DD Month YYYY`, and `Month DD, YYYY`.
- **Vacancies:** Extracts total vacancy counts from `"Total vacancies: 17,727"`, `"number of posts: 1,056"`, and validates numerical plausibility.
- **Age Limits:** Detects `"Age limit: 18 to 32 years as on crucial date"`, min/max age rules, and age relaxation text.
- **Educational Qualifications:** Identifies `10th Pass`, `12th Pass`, `Diploma in Engineering`, `Bachelor's Degree in any discipline`, `B.E. / B.Tech`, `Post Graduate`, `MBBS`, etc.
- **Pay Scale & Remuneration:** Parses `Pay Level 4 to Level 8 (7th CPC)`, `₹44,900 to ₹1,42,400`, `CTC 7.0 LPA`, and monthly stipends `₹25,000 / month`.
- **Corrigenda & Amendments:** Flags corrigenda, date extensions, and vacancy revisions, recording change logs (`job_changes` table) rather than creating duplicate listings.
- **Safety Rule:** Missing fields remain `null` or display `"Not specified"`. The engine **never invents data**.

---

## 7. Local Setup & Testing

### 1. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/opportunityhub-india.git
cd opportunityhub-india

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### 2. Python Collector Setup & Tests
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install collector dependencies
pip install -r collector/requirements.txt

# Run full test suite (SSRF guard, Rule extractor, Deduplication, Status updater)
python -m pytest collector/tests/ -v

# Run collector CLI dry run
python -m collector.main --test-url "https://ssc.gov.in"

# Run deadline status updater
python -m collector.main --update-statuses
```

---

## 8. Lovable Deployment Instructions

The React frontend has been engineered to be **100% compatible with Lovable and Vite-based hosting**:

1. **Connect Repository to Lovable:**
   - In Lovable, select **"Import from GitHub"** or create a new project from this repository.
2. **Configure Environment Variables in Lovable:**
   - In your Lovable project settings, add the following variables:
     - `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xyzcompany.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public/Anon API Key
3. **Database Initialization:**
   - Open your Supabase Dashboard -> **SQL Editor**.
   - Copy and execute `supabase/migrations/20250101000000_init_schema.sql`.
   - (Optional) Copy and execute `supabase/seed.sql` to populate initial verified opportunities.
4. **Deploy:**
   - Click **Deploy** in Lovable. The frontend will build and serve instantly.
   - *Note: If Supabase environment variables are omitted, the application runs seamlessly using its rich offline seed dataset so you never see a blank screen!*

---

## 9. GitHub Actions 6-Hour Scheduler Setup

The automated recruitment worker runs on GitHub Actions completely independently of the frontend:

1. In your GitHub repository, navigate to **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following **Repository Secrets**:
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase `service_role` secret key (this allows the collector to write to `jobs`, `sources`, and `collection_runs` while bypassing RLS).
3. The workflow file is located at `.github/workflows/collect-jobs.yml` and triggers automatically at `0 */6 * * *` (every 6 hours).
4. You can also trigger a manual collection anytime by opening the **Actions** tab in GitHub and clicking **"Run workflow"**.

> **Note on GitHub Actions Timers:** Scheduled GitHub Actions runs execute in UTC time and may experience queue latency of 5–15 minutes during peak GitHub platform traffic.

---

## 10. Security & Server-Side Request Forgery (SSRF) Guard

Because administrators can configure arbitrary URLs in the Source Manager:
- All URLs pass through `collector/ssrf_guard.py`.
- Destination hostnames are validated against loopbacks (`127.0.0.1`, `localhost`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local IPs, and cloud metadata endpoints (`169.254.169.254`).
- Supported schemes are strictly restricted to `http` and `https`.
- Maximum response size is capped (5MB for HTML, 15MB for PDF) to protect worker memory.
- `service_role` keys are strictly contained in GitHub Actions and **never exposed in client bundles**.

---

## License & Attribution

OpportunityHub India is released under the **MIT License**. All commission emblems and trademarks (UPSC, SSC, IBPS, RRB, TCS, Infosys, etc.) belong to their respective statutory and corporate owners and are used purely for factual nominative identification of recruitment notifications.
