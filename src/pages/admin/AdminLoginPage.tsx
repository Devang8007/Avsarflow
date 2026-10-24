import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If Supabase is configured with Auth
    if (isSupabaseConfigured) {
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        localStorage.setItem('opportunityhub_admin_logged_in', 'true');
        navigate('/admin');
        return;
      } catch (err: any) {
        console.warn('Supabase auth failed', err);
      }
    }

    // Local admin access fallback (for development / Lovable preview)
    if (
      (email === 'admin@opportunityhub.in' && password === 'admin123') ||
      (email === 'admin' && password === 'admin')
    ) {
      localStorage.setItem('opportunityhub_admin_logged_in', 'true');
      localStorage.setItem('opportunityhub_admin_email', email);
      navigate('/admin');
    } else {
      setError('Invalid administrator credentials. (Hint for demo: admin@opportunityhub.in / admin123)');
    }
    setLoading(false);
  };

  const handleQuickDemoLogin = () => {
    localStorage.setItem('opportunityhub_admin_logged_in', 'true');
    localStorage.setItem('opportunityhub_admin_email', 'admin@opportunityhub.in');
    navigate('/admin');
  };

  return (
    <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-2xl text-white space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-900 border border-blue-700 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            OpportunityHub Admin Console
          </h1>
          <p className="text-xs text-slate-400">
            Protected management portal for sources, jobs, and crawler runs
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@opportunityhub.in"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-3">
          <p className="text-[11px] text-slate-500">
            Testing / Development Environment Access:
          </p>
          <button
            onClick={handleQuickDemoLogin}
            type="button"
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>One-Click Demo Admin Sign-In</span>
          </button>

          <Link to="/" className="text-xs text-blue-400 hover:underline block pt-2">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
