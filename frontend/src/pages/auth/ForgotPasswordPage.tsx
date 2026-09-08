import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useNotifications } from '../../context/NotificationContext';
import { HeartPulse, Mail, Lock, KeyRound, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP_RESET' | 'DONE'>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep('OTP_RESET');
      addToast('Reset Dispatched', 'Demo OTP verification simulation activated.', 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(otp, newPassword);
      setStep('DONE');
      addToast('Success', 'Password updated successfully. You can now login.', 'success');
    } catch (err: any) {
      addToast('Reset Failed', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crimson-600/10 blur-[130px] pointer-events-none rounded-full"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-crimson-600 flex items-center justify-center text-white shadow-xl shadow-crimson-900/50">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-white">LifeLink</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white">Reset Account Password</h2>
        <p className="text-xs text-slate-400 mt-1">OTP-verified password recovery architecture</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl backdrop-blur-md text-xs">
          {step === 'EMAIL' && (
            <form onSubmit={handleSendReset} className="space-y-4">
              <p className="text-slate-300">
                Enter the email address registered with your LifeLink account to receive a secure recovery code.
              </p>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-sm shadow-lg shadow-crimson-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {step === 'OTP_RESET' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                💡 Demo verification mode: Enter code <strong className="text-amber-300">123456</strong> or any 6-digit number.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white font-mono tracking-widest text-sm focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-sm shadow-lg shadow-crimson-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          )}

          {step === 'DONE' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-white">Password Reset Complete</h4>
              <p className="text-slate-400 text-xs">
                Your password has been securely updated. You can now login to your LifeLink dashboard.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold transition"
              >
                Proceed to Login
              </Link>
            </div>
          )}

          <div className="mt-6 text-center border-t border-slate-800 pt-4">
            <Link to="/login" className="text-slate-400 hover:text-white inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
