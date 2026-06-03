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

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Review your submitted price quotes.</p>
        </div>
        <Link 
          href="/seller/catalog" 
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Quote
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Quote #</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Date</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Items</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Total Amount</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <p className="text-slate-500 text-sm font-medium">No quotations found.</p>
                    <Link href="/seller/catalog" className="inline-block mt-2 text-brand-600 hover:text-brand-500 text-sm font-bold">
                      Start building a quote &rarr;
                    </Link>
                  </td>
                </tr>
              ) : (
                quotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-slate-700">{quote.quotation_number}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm font-medium">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {quote.item_count} items
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      ₹{Number(quote.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold border border-sky-100 capitalize">
                        {quote.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
