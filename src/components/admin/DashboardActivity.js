"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardActivity({ quotations }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const statuses = useMemo(() => {
    const unique = new Set(quotations.map((quote) => quote.status || "unknown"));
    return ["all", ...Array.from(unique)];
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return quotations
      .filter((quote) => {
        if (status !== "all" && quote.status !== status) return false;
        if (!normalizedQuery) return true;

        return [
          quote.buyer_name,
          quote.buyer_email,
          quote.quotation_number,
          quote.products_list,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sort === "amount") return Number(b.total_amount || 0) - Number(a.total_amount || 0);
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [query, quotations, sort, status]);

  const visibleTotal = filteredQuotations.reduce(
    (sum, quote) => sum + Number(quote.total_amount || 0),
    0
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Recent Quotation Activity</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredQuotations.length} of {quotations.length} quotations, worth {formatINR(visibleTotal)}.
          </p>
        </div>
        <Link href="/admin/orders" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
          View All &rarr;
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search buyer, quote number, or product..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All statuses" : item}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="newest">Newest first</option>
          <option value="amount">Highest value</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Buyer</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Quote #</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Products Included</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Date</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500">Total</th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                  No quotations match the current filters.
                </td>
              </tr>
            ) : (
              filteredQuotations.map((quote) => (
                <tr key={quote.quotation_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800">{quote.buyer_name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{quote.buyer_email || "No email"}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-slate-600">{quote.quotation_number}</td>
                  <td className="py-4 px-4 text-sm text-slate-600 truncate max-w-[220px]" title={quote.products_list || ""}>
                    {quote.products_list || "No products"}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{formatDate(quote.created_at)}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800 tabular-nums">
                    {formatINR(quote.total_amount)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      quote.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      quote.status === "submitted" ? "bg-sky-50 text-sky-600 border-sky-200" :
                      quote.status === "rejected" ? "bg-red-50 text-red-500 border-red-200" :
                      "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
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
  );
}
