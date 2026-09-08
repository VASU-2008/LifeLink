import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { HeartPulse, Mail, Lock, LogIn, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardPath = (role: UserRole): string => {
    switch (role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'PATIENT':
        return '/patient/dashboard';
      case 'HOSPITAL':
        return '/hospital/dashboard';
      case 'BLOOD_BANK':
        return '/bloodbank/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Missing Credentials', 'Please provide both email and password', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      addToast('Welcome Back', `Logged in as ${user.name} (${user.role})`, 'success');
      navigate(getDashboardPath(user.role));
    } catch (err: any) {
      addToast('Login Failed', err.message || 'Invalid credentials', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const user = await loginAsDemo(role);
      addToast('Demo Mode', `Signed in as Demo ${role} (${user.name})`, 'success');
      navigate(getDashboardPath(role));
    } catch (err: any) {
      addToast('Demo Login Failed', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crimson-600/10 blur-[130px] pointer-events-none rounded-full"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-crimson-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-crimson-900/50 group-hover:scale-105 transition">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-white">LifeLink</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting Blood. Saving Lives.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl backdrop-blur-md">
          {/* Quick Demo Credentials Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1-Click Instant Demo Login:
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {(['DONOR', 'PATIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickDemo(role)}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[10px] font-bold transition flex items-center justify-center gap-1 truncate"
                >
                  <span>{role}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-crimson-400" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                <Link to="/forgot-password" className="text-crimson-400 hover:text-crimson-300 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-sm shadow-lg shadow-crimson-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-crimson-400 hover:text-crimson-300 font-bold">
              Register as Donor / Hospital
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
