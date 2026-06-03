import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "My Quotations | Seller Panel",
};

export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  draft:      { label: "Draft",      bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200", dot: "bg-slate-400" },
  submitted:  { label: "Submitted",  bg: "bg-sky-50",      text: "text-sky-600",     border: "border-sky-200",   dot: "bg-sky-500" },
  reviewing:  { label: "Reviewing",  bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-200", dot: "bg-amber-500" },
  approved:   { label: "Approved",   bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
  rejected:   { label: "Rejected",   bg: "bg-red-50",      text: "text-red-500",     border: "border-red-200",   dot: "bg-red-500" },
  expired:    { label: "Expired",    bg: "bg-gray-50",     text: "text-gray-500",    border: "border-gray-200",  dot: "bg-gray-400" },
};

export default async function SellerQuotationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const quotationsResult = await db.execute(sql`
    SELECT q.*, 
      (SELECT count(*) FROM quotation_items qi WHERE qi.quotation_id = q.id) as item_count
    FROM quotations q
    WHERE q.user_id = ${session.user.id}
    ORDER BY q.created_at DESC
  `);
  
  const quotations = quotationsResult.rows;

  // Stats
  const total = quotations.length;
  const submitted = quotations.filter(q => q.status === "submitted").length;
  const approved = quotations.filter(q => q.status === "approved").length;

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Review and track your submitted price quotes.</p>
        </div>
        <Link 
          href="/seller/catalog" 
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Quote
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Quotes</div>
          <div className="text-2xl font-extrabold text-slate-800">{total}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pending Review</div>
          <div className="text-2xl font-extrabold text-sky-600">{submitted}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Approved</div>
          <div className="text-2xl font-extrabold text-emerald-600">{approved}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Quote #</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Date</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Items</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Total Amount</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">No quotations yet.</p>
                      <Link href="/seller/catalog" className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-500 text-sm font-bold transition-colors">
                        Start building a quote
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                quotations.map(quote => {
                  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
                  const date = new Date(quote.created_at);

                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <Link href={`/seller/quotations/${quote.id}`} className="font-mono font-bold text-brand-600 hover:text-brand-700 transition-colors text-sm">
                          {quote.quotation_number}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-700 font-medium">
                          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600 font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                          </svg>
                          {quote.item_count} item{Number(quote.item_count) !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-slate-800 tabular-nums">₹{Number(quote.total_amount).toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border rounded-full text-[11px] font-bold uppercase tracking-wider`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/seller/quotations/${quote.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          View
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
