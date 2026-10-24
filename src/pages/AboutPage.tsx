import React from 'react';
import { ShieldCheck, Cpu, Database, CheckCircle2, Award, Zap, AlertCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 pb-8 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Public Interest Initiative</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              About OpportunityHub India
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Democratizing access to genuine, verified Indian employment notices, corrigenda, and internships without paywalls or AI hallucinations.
            </p>
          </div>

          {/* Mission */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Our Objective</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every day, lakhs of Indian students and job seekers struggle through spam-ridden job portals filled with fabricated vacancies, outdated application forms, coaching institute lead-generation traps, and dead links. OpportunityHub India was engineered to solve this through automated discovery, deterministic rule extraction, and cryptographic source verification.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              We monitor recruitment gazettes from Central and State Public Service Commissions (UPSC, SSC, State PSCs), Banking Selection Boards (IBPS, SBI), Indian Railways (RRB), Public Sector Undertakings (ISRO, BEL, BHEL), and premier corporate campus hiring programs (TCS, Infosys, Accenture, Wipro).
            </p>
          </div>

          {/* Core Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Zero AI Hallucination</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We do not use paid generative AI or LLMs for routine data extraction. Every deadline, vacancy count, and qualification is extracted using deterministic Python regex rules, HTML selectors, and PyMuPDF gazette parsing. If a field is not found in the official notice, it remains marked as "Not specified".
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Real Database Metrics</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never display artificial marketing statistics like "10 Million Happy Users" or "50,000 Jobs Live". All counts displayed on the homepage reflect genuine records actively stored in our PostgreSQL database.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Direct Official Portal Links</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you click "Apply Online", you are directed straight to the recruiting agency's official government or corporate application portal. We never charge money, intercept applications, or ask for login credentials just to browse.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Cpu className="w-5 h-5 text-purple-600" />
                <span>Automated 6-Hour Scheduler</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Independent Python collectors run every six hours via GitHub Actions workflows to discover corrigenda, date extensions, and new vacancies—updating statuses before deadlines pass.
              </p>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="p-6 rounded-xl bg-blue-950 text-white space-y-3">
            <h3 className="text-base font-bold text-amber-400">Technical Foundation</h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              OpportunityHub India is built using React 19, TypeScript, Tailwind CSS, Vite, and Supabase PostgreSQL with Row Level Security. Automated data aggregation is handled by an open, modular Python 3.12 collection engine featuring SSRF protections, SHA-256 deduplication fingerprints, and PyMuPDF document extraction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
