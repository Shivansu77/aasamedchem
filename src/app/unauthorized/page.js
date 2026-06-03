import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-xl relative z-10 text-center space-y-6">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500 text-2xl font-bold">
          !
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">Access Denied</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Your account does not have the required permissions to view this dashboard. Please check your role or log in with a different user account.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/"
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-all border border-slate-200 text-center shadow-sm"
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-all text-center shadow-sm"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
