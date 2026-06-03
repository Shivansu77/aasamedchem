import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import SellerDashboardActivity from "@/components/seller/SellerDashboardActivity";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);

  let stats = { products: 0, quotations: 0 };
  let recentQuotations = [];
  try {
    const productCount = await db.execute(sql`SELECT count(*) FROM products WHERE is_active = true`);
    const quotationCount = await db.execute(sql`SELECT count(*) FROM quotations WHERE user_id = ${session.user.id || 0}`);
    const recentResult = await db.execute(sql`
      SELECT
        q.id,
        q.quotation_number,
        q.status,
        q.total_amount,
        q.created_at,
        (SELECT count(*) FROM quotation_items qi WHERE qi.quotation_id = q.id) AS item_count
      FROM quotations q
      WHERE q.user_id = ${session.user.id || 0}
      ORDER BY q.created_at DESC
      LIMIT 5
    `);
    stats = {
      products: Number(productCount.rows[0]?.count || 0),
      quotations: Number(quotationCount.rows[0]?.count || 0),
    };
    recentQuotations = recentResult.rows.map((quote) => ({
      ...quote,
      created_at: quote.created_at ? new Date(quote.created_at).toISOString() : null,
      total_amount: quote.total_amount || "0",
      item_count: Number(quote.item_count || 0),
    }));
  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Seller Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="text-brand-600 font-semibold">{session?.user?.name || "Seller"}</span>. Access the catalog and manage quotations.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/seller/catalog" className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Products in Catalog</h3>
          <p className="text-4xl font-extrabold text-slate-800">{stats.products}</p>
          <p className="text-xs text-slate-400">Total active compound SKUs</p>
        </Link>

        <Link href="/seller/quotations" className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">My Quotations</h3>
          <p className="text-4xl font-extrabold text-slate-800">{stats.quotations}</p>
          <p className="text-xs text-slate-400">Quotations drafted and submitted</p>
        </Link>
      </div>

      <SellerDashboardActivity quotations={recentQuotations} />

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/seller/catalog" className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-brand-50 hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">Browse Catalog</h4>
            </div>
            <p className="text-sm text-slate-500">Search for products and build a quotation for customers.</p>
          </Link>

          <Link href="/seller/quotations" className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-brand-50 hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">View Quotations</h4>
            </div>
            <p className="text-sm text-slate-500">Check the status of your previously submitted quotes.</p>
          </Link>

          <Link href="/profile" className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-brand-50 hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75A3 3 0 1 1 9 9.75a3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">Profile</h4>
            </div>
            <p className="text-sm text-slate-500">Review your account details and workspace activity.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
