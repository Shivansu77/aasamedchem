import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);

  // Fetch some dummy counts or stats from the DB to show on the dashboard
  let stats = { products: 0, orders: 0 };
  try {
    const productCount = await db.execute(sql`SELECT count(*) FROM products`);
    const orderCount = await db.execute(sql`SELECT count(*) FROM orders`);
    stats = {
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
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight">
            aasa<span className="text-brand-400">seller</span>
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
            <h1 className="text-3xl font-bold tracking-tight text-white">Seller Catalog Dashboard</h1>
            <p className="text-sm text-white/50 mt-1">
              Welcome back, <span className="text-brand-400 font-semibold">{session?.user?.name || "Seller"}</span>. You can manage products and catalog entries here.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              {session?.user?.role || "seller"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface-50 border border-white/10 p-6 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Products in Catalog</h3>
            <p className="text-4xl font-extrabold text-white">{stats.products}</p>
            <p className="text-xs text-white/30">Total active compound SKUs</p>
          </div>

          <div className="bg-surface-50 border border-white/10 p-6 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">My Orders</h3>
            <p className="text-4xl font-extrabold text-white">{stats.orders}</p>
            <p className="text-xs text-white/30">Total customer requests logged</p>
          </div>
        </div>

        {/* Catalog Info Card */}
        <div className="bg-surface-50 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Catalog Management Features</h2>
          <p className="text-sm text-white/60 max-w-xl">
            Sellers have edit permissions on active products, stock inventory levels, and measuring units. To configure advanced database system configurations, contact your system administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
