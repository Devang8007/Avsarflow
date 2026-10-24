import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Building2, GraduationCap, Sparkles, Bell, Shield, Menu, X, ArrowUpRight, Flame } from 'lucide-react';
import { NewsletterModal } from '../common/NewsletterModal';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/government-jobs', label: 'Govt Jobs', icon: Landmark, badge: 'Sarkari' },
    { to: '/private-jobs', label: 'Private Jobs', icon: Building2 },
    { to: '/internships', label: 'Internships', icon: GraduationCap },
    { to: '/fresher-jobs', label: 'Fresher Openings', icon: Sparkles },
    { to: '/latest', label: 'Latest Updates', icon: Flame, badge: 'Live' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a1d37] text-white shadow-md border-b border-blue-950">
        {/* Tricolor top indicator line */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    Opportunity<span className="text-amber-400">Hub</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-800 text-blue-200 border border-blue-700">
                    India
                  </span>
                </div>
                <p className="text-[11px] text-blue-300 font-medium tracking-wide hidden sm:block">
                  Verified Central & State Recruitment Portal
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      active
                        ? 'bg-blue-800/80 text-white shadow-sm ring-1 ring-blue-700'
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        link.badge === 'Live' 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-amber-400 text-slate-900'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={() => setNewsletterOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 border border-white/10"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Job Alerts</span>
              </button>

              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-xs font-semibold text-blue-200 hover:text-white hover:bg-blue-800/50 transition-colors flex items-center gap-1 border border-blue-800"
                title="Administrator Console"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Mobile menu hamburger button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setNewsletterOpen(true)}
                className="p-2 rounded-lg bg-white/10 text-amber-400 hover:bg-white/20"
                title="Job Alerts"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-900 bg-[#061426] px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active ? 'bg-blue-800 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 text-amber-400" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-400 text-slate-900">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-blue-900 flex flex-col gap-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-blue-950 border border-blue-800 rounded-lg text-blue-200"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Admin Login & Source Manager</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Newsletter Alert Subscription Modal */}
      <NewsletterModal isOpen={newsletterOpen} onClose={() => setNewsletterOpen(false)} />
    </>
  );
};
