import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Mail, Lock, User, UserPlus, ChevronLeft } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { DEV_MODE } from "../config/env";

interface RegisterViewProps {
  onNavigateToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigateToLogin,
}) => {
  const { signUp, isSupabaseConnected, signInWithGoogleToken } = useApp();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password) return;
    setLoading(true);
    try {
      await signUp(email, username, password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b12] px-4 py-8">
      <div
        className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden ${DEV_MODE ? "" : "select-none"}`}
      >
        {/* Neon styling */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/10 dark:bg-cyan-400/10 rounded-full blur-3xl -z-10" />

        {/* Back navigation */}
        <button
          id="register-back-to-login"
          onClick={onNavigateToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors mb-6 focus:outline-none"
        >
          <ChevronLeft size={16} />
          <span>Back to Login</span>
        </button>

        {/* Brand/Heading */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Register Host Room
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Create an organizer account to manage player live leaderboard wins.
          </p>
        </div>

        {/* Sandbox Indicator */}
        <div
          className={`mb-6 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            isSupabaseConnected
              ? "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400"
              : "bg-yellow-50/50 dark:bg-amber-950/20 border-yellow-100 dark:border-amber-900 text-amber-600 dark:text-amber-400"
          }`}
        >
          <div>
            <p className="font-bold">
              {isSupabaseConnected
                ? "⚡ Production Database"
                : "☁️ Sandbox Active"}
            </p>
            <p className="opacity-90 mt-0.5 font-normal">
              {isSupabaseConnected
                ? "Secure sign up directly in Supabase table"
                : "Local storage is active on the browser"}
            </p>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${isSupabaseConnected ? "bg-cyan-500" : "bg-amber-500"}`}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              TikTok ID
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                id="register-username"
                type="text"
                placeholder="e.g., gamer_host1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                id="register-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                minLength={6}
                required
              />
            </div>
          </div>

          {/* Action button */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading || !email || !username || !password}
            className="w-full mt-2 py-3.5 rounded-2xl font-semibold text-sm text-white tiktok-gradient-primary shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <UserPlus size={16} />
            <span>
              {loading ? "Creating Host Room..." : "Register as Official Host"}
            </span>
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
                  console.error("Google Sign up Error:", err);
                }
              }}
              onError={() => {
                console.error("Google Sign up Failed");
              }}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
        </form>

        {/* Footer info links */}
        <div className="mt-8 text-center bg-slate-50 dark:bg-slate-950/60 -mx-6 -mb-6 p-4 border-t border-slate-100 dark:border-slate-900 rounded-b-[2.5rem]">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <button
              id="register-go-to-login"
              onClick={onNavigateToLogin}
              className="text-rose-500 hover:text-rose-600 font-bold hover:underline focus:outline-none"
            >
              Sign In here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
