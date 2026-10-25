import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      {/* Top Banner / Public Notice */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Public Verification Standard: 100% Deterministic Extraction from Official Gazettes & Portals</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Automated Collector Active: Every 6 Hours</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: About Platform */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white font-bold text-sm">
                OH
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Opportunity<span className="text-amber-400">Hub</span> India
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's transparent, AI-free recruitment and internship directory. Automatically tracking official employment notifications, corrigenda, and application deadlines across Central and State boards.
            </p>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real DB metrics only. No fabricated statistics.</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Explore Opportunities
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/government-jobs" className="hover:text-white transition-colors">
                  Government Recruitment (Sarkari)
                </Link>
              </li>
              <li>
                <Link to="/private-jobs" className="hover:text-white transition-colors">
                  Private IT & Core Engineering
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-white transition-colors">
                  Central & Corporate Internships
                </Link>
              </li>
              <li>
                <Link to="/fresher-jobs" className="hover:text-white transition-colors">
                  Fresher & Off-Campus Hiring
                </Link>
              </li>
              <li>
                <Link to="/latest" className="hover:text-white transition-colors">
                  Recently Published Notices
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Recruitment Bodies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Monitored Official Sources
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Union Public Service Commission (UPSC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Staff Selection Commission (SSC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <a href="https://www.ibps.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Institute of Banking Personnel (IBPS)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <a href="https://www.rrbcdg.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Railway Recruitment Boards (RRB)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <a href="https://www.ncs.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>National Career Service (NCS)</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Platform & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About OpportunityHub India
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Report Correction
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Use & Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 font-semibold text-slate-300 transition-colors">
                  Admin Console & Source Manager
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-400 mb-8">
          <p className="font-semibold text-slate-300 mb-1">Important Candidate Disclaimer:</p>
          OpportunityHub India is an independent public-interest data indexer. This portal does NOT represent any government ministry, recruitment board, or corporate hiring department. We never charge money, sell application forms, or process candidate applications. Candidates MUST always verify eligibility, fee structures, and notifications on the respective official government gazettes or employer websites before applying.
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} OpportunityHub India. Open Recruitment Transparency Initiative.</p>
          <div className="flex items-center gap-4">
            <span>Built for Indian Students & Job Seekers</span>
            <span>•</span>
            <span>Deployed with Supabase & Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
