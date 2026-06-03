import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import DashboardCharts from "@/components/admin/DashboardCharts";
import DashboardActivity from "@/components/admin/DashboardActivity";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  let stats = { users: 0, products: 0, orders: 0 };
  let categoryData = [];
  let trendData = [];
  let recentQuotations = [];

  try {
    const userCount = await db.execute(sql`SELECT count(*) FROM users`);
    const productCount = await db.execute(sql`SELECT count(*) FROM products`);
    const orderCount = await db.execute(sql`SELECT count(*) FROM quotations`);
    stats = {
      users: Number(userCount.rows[0]?.count || 0),
      products: Number(productCount.rows[0]?.count || 0),
      orders: Number(orderCount.rows[0]?.count || 0),
    };

    // Category Distribution Data
    const catResult = await db.execute(sql`
      SELECT category as name, count(*) as value 
      FROM products 
      WHERE is_active = true AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY value DESC
    `);
    categoryData = catResult.rows.map(r => ({ name: r.name, value: Number(r.value) }));

    // Trend Data (Last 30 days)
    const trendResult = await db.execute(sql`
      SELECT DATE(created_at) as date, count(*) as count 
      FROM quotations 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `);
    trendData = trendResult.rows.map(r => ({ date: r.date, count: Number(r.count) }));

    // Recent Quotations Data (Who bought what)
    const recentResult = await db.execute(sql`
      SELECT 
        q.id as quotation_id, 
        q.quotation_number, 
        q.total_amount, 
        q.created_at, 
        q.status,
        u.name as buyer_name, 
        u.email as buyer_email,
        STRING_AGG(p.name, ', ') as products_list
      FROM quotations q
      LEFT JOIN users u ON u.id = q.user_id
      LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
      LEFT JOIN products p ON p.id = qi.product_id
      GROUP BY q.id, u.name, u.email
      ORDER BY q.created_at DESC
      LIMIT 10
    `);
    recentQuotations = recentResult.rows.map((quote) => ({
      ...quote,
      created_at: quote.created_at ? new Date(quote.created_at).toISOString() : null,
      total_amount: quote.total_amount || "0",
    }));

  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="text-brand-600 font-semibold">{session?.user?.name || "Administrator"}</span>. You have full access to management tools.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/admin" className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Accounts</h3>
          <p className="text-4xl font-extrabold text-slate-800">{stats.users}</p>
          <p className="text-xs text-slate-400">Registered users in database</p>
        </Link>

        <Link href="/admin/products" className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
           <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
           </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Products Registered</h3>
          <p className="text-4xl font-extrabold text-slate-800">{stats.products}</p>
          <p className="text-xs text-slate-400">Pharma & compound SKUs</p>
        </Link>

        <Link href="/admin/orders" className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quotations Submitted</h3>
          <p className="text-4xl font-extrabold text-slate-800">{stats.orders}</p>
          <p className="text-xs text-slate-400">Incoming seller quotation requests</p>
        </Link>
      </div>

      {/* Charts Section */}
      <DashboardCharts categoryData={categoryData} trendData={trendData} />

      <DashboardActivity quotations={recentQuotations} />
      
    </div>
  );
}
