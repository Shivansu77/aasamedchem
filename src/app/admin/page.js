import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  let stats = { users: 0, products: 0, orders: 0 };
  try {
    const userCount = await db.execute(sql`SELECT count(*) FROM users`);
    const productCount = await db.execute(sql`SELECT count(*) FROM products`);
    const orderCount = await db.execute(sql`SELECT count(*) FROM quotations`);
    stats = {
      users: Number(userCount.rows[0]?.count || 0),
      products: Number(productCount.rows[0]?.count || 0),
      orders: Number(orderCount.rows[0]?.count || 0),
    };
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

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/admin/products/new" className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-brand-50 hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600 font-bold text-lg">+</span>
              <h4 className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">Add New Product</h4>
            </div>
            <p className="text-sm text-slate-500">Create a new chemical or compound entry in the catalog.</p>
          </Link>

          <Link href="/admin/products" className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-brand-50 hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">Manage Products</h4>
            </div>
            <p className="text-sm text-slate-500">View, edit, and manage your product inventory and pricing.</p>
          </Link>

          <Link href="/seller" className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:bg-brand-50 hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">Seller Dashboard</h4>
            </div>
            <p className="text-sm text-slate-500">View and manage the sales catalog interface.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
