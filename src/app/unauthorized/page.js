export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4 relative overflow-hidden">
      {/* Red light leak gradient representing warning/forbidden access */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full backdrop-blur-xl bg-surface-50/40 border border-red-500/10 p-8 rounded-2xl shadow-2xl relative z-10 text-center space-y-6">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 text-2xl font-bold animate-pulse">
          !
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Access Denied</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Your account does not have the required permissions to view this dashboard. Please check your role or log in with a different user account.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <a
            href="/"
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm transition-all border border-white/10 text-center"
          >
            Go to Home
          </a>
          <a
            href="/login"
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold rounded-xl text-sm transition-all text-center shadow-lg shadow-brand-500/15"
          >
            Switch Account
          </a>
        </div>
      </div>
    </div>
  );
}
