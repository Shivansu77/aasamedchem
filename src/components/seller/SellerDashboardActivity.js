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

export default function SellerDashboardActivity({ quotations }) {
  const [status, setStatus] = useState("all");

  const statuses = useMemo(() => {
    const unique = new Set(quotations.map((quote) => quote.status || "unknown"));
    return ["all", ...Array.from(unique)];
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    if (status === "all") return quotations;
    return quotations.filter((quote) => quote.status === status);
  }, [quotations, status]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Recent Quotations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter your latest quote requests by status before opening the full history.
          </p>
        </div>
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
      </div>

      <div className="mt-5 space-y-3">
        {filteredQuotations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-500">No quotations match this filter.</p>
            <Link href="/seller/catalog" className="mt-3 inline-block text-sm font-bold text-brand-600 hover:text-brand-700">
              Build a new quotation
            </Link>
          </div>
        ) : (
          filteredQuotations.map((quote) => (
            <Link
              key={quote.id}
              href={`/seller/quotations/${quote.id}`}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-brand-200 hover:bg-brand-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-mono text-sm font-bold text-slate-800">{quote.quotation_number}</div>
                <p className="mt-1 text-xs text-slate-500">
                  {quote.item_count} item{Number(quote.item_count) === 1 ? "" : "s"} ·{" "}
                  {new Date(quote.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <span className="text-sm font-extrabold text-slate-800">{formatINR(quote.total_amount)}</span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  quote.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                  quote.status === "submitted" ? "bg-sky-50 text-sky-600 border-sky-200" :
                  quote.status === "rejected" ? "bg-red-50 text-red-500 border-red-200" :
                  "bg-slate-50 text-slate-600 border-slate-200"
                }`}>
                  {quote.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
