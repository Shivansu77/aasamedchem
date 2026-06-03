import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Fetch some dummy counts or stats from the DB to show on the dashboard
  let stats = { users: 0, products: 0, orders: 0 };
  try {
    const userCount = await db.execute(sql`SELECT count(*) FROM users`);
    const productCount = await db.execute(sql`SELECT count(*) FROM products`);
    const orderCount = await db.execute(sql`SELECT count(*) FROM orders`);
    stats = {
      users: Number(userCount.rows[0]?.count || 0),
      products: Number(productCount.rows[0]?.count || 0),
      orders: Number(orderCount.rows[0]?.count || 0),
    };
  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      {/* Top navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-surface-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            A
          </div>
          <span className="text-lg font-semibold tracking-tight">
            aasa<span className="text-red-400">admin</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-white/50 block font-mono">Logged in as</span>
            <span className="text-sm font-medium text-white/80">{session?.user?.email}</span>
          </div>
          <LogoutButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-sm text-white/50 mt-1">
              Welcome back, <span className="text-red-400 font-semibold">{session?.user?.name || "Administrator"}</span>. You have full access to management tools.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              {session?.user?.role || "admin"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-50 border border-white/10 p-6 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Total Accounts</h3>
            <p className="text-4xl font-extrabold text-white">{stats.users}</p>
            <p className="text-xs text-white/30">Registered users in database</p>
          </div>

          <div className="bg-surface-50 border border-white/10 p-6 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Products Registered</h3>
            <p className="text-4xl font-extrabold text-white">{stats.products}</p>
            <p className="text-xs text-white/30">Pharma & compound SKUs</p>
          </div>

          <div className="bg-surface-50 border border-white/10 p-6 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Orders Processed</h3>
            <p className="text-4xl font-extrabold text-white">{stats.orders}</p>
            <p className="text-xs text-white/30">Total customer transactions</p>
          </div>
        </div>

        {/* System Settings & Actions Card */}
        <div className="bg-surface-50 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold">System Administration Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-semibold text-white/80">Database Health</h4>
              <p className="text-xs text-white/50">Run query cycles to ensure Neon database connection latency is optimized.</p>
              <a
                href="/api/health"
                target="_blank"
                className="inline-block mt-2 text-xs text-brand-400 font-semibold hover:underline"
              >
                Inspect DB Endpoint &rarr;
              </a>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
              <h4 className="font-semibold text-white/80">Seller View</h4>
              <p className="text-xs text-white/50">As an Admin, you are permitted to view and manage the sales catalog interface.</p>
              <a
                href="/seller"
                className="inline-block mt-2 text-xs text-brand-400 font-semibold hover:underline"
              >
                Go to Seller Dashboard &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
