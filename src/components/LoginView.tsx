import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, LogIn, ChevronRight, HelpCircle, Terminal, Cpu } from 'lucide-react';
import { DEV_MODE } from '../config/env';
import { GoogleLogin } from '@react-oauth/google';

interface LoginViewProps {
  onNavigateToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigateToRegister }) => {
  const { signIn, signInWithGoogle, isSupabaseConnected, enterDevMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  const [showRealForm, setShowRealForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      await enterDevMode();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b12] px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden select-none">
        
        {/* Neon style colored visual background blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/10 rounded-full blur-3xl -z-10" />

        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="tiktok-gradient-primary w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-rose-500/15">
              <span>H</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            HostBoard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Realtime Scoreboard & Leaderboard for Live Streams
          </p>
        </div>

        {/* DEV MODE DETECTOR & BANNER */}
        {DEV_MODE ? (
          <div className="mb-6 space-y-4">
            <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-950/50 bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <div className="flex items-start gap-2.5">
                <Terminal size={18} className="shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs">
                  <p className="font-bold tracking-tight uppercase">DEVELOPMENT MODE ACTIVE</p>
                  <p className="opacity-90 mt-0.5 font-medium leading-relaxed">
                    Authentication is bypassed. Tap below to launch under the simulated <strong className="underline">dev-user</strong> account.
                  </p>
                </div>
              </div>
            </div>

            {!showRealForm ? (
              <div className="space-y-4">
                <button
                  id="dev-mode-login-submit"
                  onClick={handleDevLogin}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-rose-500 to-amber-500 shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/45 text-center leading-none"
                >
                  <Cpu size={18} className="animate-spin" style={{ animationDuration: '3s' }} />
                  <span>{loading ? 'Entering Dev Room...' : 'Enter App (Dev Mode)'}</span>
                </button>

                <div className="text-center">
                  <button
                    id="dev-toggle-real-form"
                    onClick={() => setShowRealForm(true)}
                    className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    Or test standard production email login form
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Sandbox Indicator */
          <div className={`mb-6 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            isSupabaseConnected 
              ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400' 
              : 'bg-yellow-50/50 dark:bg-amber-950/20 border-yellow-100 dark:border-amber-900 text-amber-600 dark:text-amber-400'
          }`}>
            <div>
              <p className="font-bold">{isSupabaseConnected ? '⚡ Connected to Supabase' : '☁️ Local Sandbox Active'}</p>
              <p className="opacity-80 mt-0.5 font-normal">
                {isSupabaseConnected ? 'Production credentials loaded' : 'Data stored on your local browser'}
              </p>
            </div>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
          </div>
        )}

        {(!DEV_MODE || showRealForm) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="host@livesession.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  id="login-forgot-pwd"
                  type="button"
                  onClick={() => setShowForgotMsg(!showForgotMsg)}
                  className="text-xs font-semibold text-rose-500 hover:underline hover:text-rose-600 focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Forgot Message drawer */}
            {showForgotMsg && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
                <HelpCircle size={16} className="shrink-0 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Password Reset Guide</p>
                  <p className="opacity-90 mt-0.5">
                    If running in the <strong>Local Sandbox Mode</strong>, any sign-up works immediately without verification! Otherwise, ask your administrator to configure a custom redirect inside the Supabase Auth panel.
                  </p>
                </div>
              </div>
            )}

            {/* Login Action Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-3.5 rounded-2xl font-semibold text-sm text-white tiktok-gradient-primary shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <LogIn size={16} />
              <span>{loading ? 'Entering Stream Room...' : 'Sign In as TikTok Host'}</span>
            </button>

            {/* Optional social login button */}
            <div className="flex justify-center w-full overflow-hidden rounded-2xl">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    if (credentialResponse.credential) {
                      await signInWithGoogleToken(credentialResponse.credential);
                    }
                  } catch (err) {
                    console.error('Google Sign in Error:', err);
                  }
                }}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                theme="outline"
                size="large"
                width="100%"
              />
            </div>

            {DEV_MODE && (
              <div className="text-center mt-2.5">
                <button
                  id="dev-hide-real-form"
                  type="button"
                  onClick={() => setShowRealForm(false)}
                  className="text-xs font-bold text-rose-500 hover:underline hover:text-rose-600 focus:outline-none"
                >
                  Return to Quick Dev Bypass
                </button>
              </div>
            )}
          </form>
        )}

        {/* Footer Toggle Navigate link */}
        <div className="mt-8 text-center bg-slate-50 dark:bg-slate-950/60 -mx-6 -mb-6 p-4 border-t border-slate-100 dark:border-slate-900 rounded-b-[2.5rem]">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            New TikTok Host streamer?{' '}
            <button
              id="login-go-to-register"
              onClick={onNavigateToRegister}
              className="text-rose-500 hover:text-rose-600 font-bold hover:underline focus:outline-none flex items-center justify-center gap-0.5 mx-auto mt-1"
            >
              <span>Register Here</span>
              <ChevronRight size={14} />
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
