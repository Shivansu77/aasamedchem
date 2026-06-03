export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="text-lg font-semibold tracking-tight">
            aasa<span className="text-brand-400">medchem</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 font-mono">v0.1.0</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Pharmaceutical
              <br />
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                Order Management
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-lg">
              Manage products, track orders, and control inventory — built for
              medicinal chemistry operations.
            </p>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatusCard
              label="Database"
              value="Pending"
              hint="Set DATABASE_URL"
              color="amber"
            />
            <StatusCard label="API Routes" value="1 active" hint="/api/health" color="green" />
            <StatusCard label="Tables" value="5 defined" hint="schema.sql" color="green" />
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/health"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Health Check
            </a>
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-white/80 text-sm font-medium border border-white/10 transition-colors"
            >
              Neon Dashboard ↗
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/30">
        aasamedchem &middot; Phase 1 — DB Schema + Project Setup
      </footer>
    </div>
  );
}

function StatusCard({ label, value, hint, color }) {
  const dotColor =
    color === "green" ? "bg-emerald-400" : "bg-amber-400";

  return (
    <div className="rounded-xl bg-surface-50 border border-white/10 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-white/40 font-mono">{hint}</p>
    </div>
  );
}
