"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full backdrop-blur-xl bg-surface-50/40 border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10 space-y-8">
      {/* Branding header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-lg shadow-brand-500/20">
          A
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="text-sm text-white/55">
          Sign in to access your Medchem workspace
        </p>
      </div>

      {/* Demo credentials hint */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-xs space-y-2">
        <p className="font-semibold text-brand-400">Test Credentials:</p>
        <div className="grid grid-cols-2 gap-2 text-white/60">
          <div>
            <span className="text-white/45 block">Admin Access:</span>
            <span className="font-medium">admin@aasamedchem.com</span>
            <span className="block font-mono text-white/35 text-[10px]">pass: admin123</span>
          </div>
          <div>
            <span className="text-white/45 block">Seller Access:</span>
            <span className="font-medium">seller@aasamedchem.com</span>
            <span className="block font-mono text-white/35 text-[10px]">pass: seller123</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-surface-100 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all text-white placeholder-white/20 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-surface-100 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all text-white placeholder-white/20 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold rounded-xl text-sm transition-all focus:outline-none shadow-lg shadow-brand-500/15 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="max-w-md w-full backdrop-blur-xl bg-surface-50/40 border border-white/10 p-8 rounded-2xl text-center text-white/50">
          Loading login form...
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
