"use client";

import Link from "next/link";
import Decimal from "decimal.js";
import { useState, useRef } from "react";

const STATUS_MAP = {
  draft:      { label: "Draft",      bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200", dot: "bg-slate-400" },
  submitted:  { label: "Submitted",  bg: "bg-sky-50",      text: "text-sky-600",     border: "border-sky-200",   dot: "bg-sky-500" },
  reviewing:  { label: "Reviewing",  bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-200", dot: "bg-amber-500" },
  approved:   { label: "Approved",   bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
  rejected:   { label: "Rejected",   bg: "bg-red-50",      text: "text-red-500",     border: "border-red-200",   dot: "bg-red-500" },
  expired:    { label: "Expired",    bg: "bg-gray-50",     text: "text-gray-500",    border: "border-gray-200",  dot: "bg-gray-400" },
};

function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.bg} ${config.text} ${config.border} border rounded-full text-xs font-bold uppercase tracking-wider`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function QuotationDetail({ quotation }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef(null);

  const totalAmount = new Decimal(quotation.total_amount || 0);
  const createdAt = new Date(quotation.created_at);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm print:hidden">
        <Link href="/seller/quotations" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          ← My Quotations
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 font-medium">{quotation.quotation_number}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" ref={printRef}>
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 sm:px-8 py-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  {quotation.quotation_number}
                </h1>
                <StatusBadge status={quotation.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  {createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  {quotation.items?.length || 0} item{(quotation.items?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="px-6 sm:px-8 py-4 bg-amber-50/50 border-b border-amber-100">
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-500 mt-0.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              <p className="text-sm text-amber-800 font-medium">{quotation.notes}</p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3.5 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-500 w-12">#</th>
                <th className="py-3.5 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-500">Product</th>
                <th className="py-3.5 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Quantity</th>
                <th className="py-3.5 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-500">Unit</th>
                <th className="py-3.5 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Unit Price</th>
                <th className="py-3.5 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!quotation.items || quotation.items.length === 0) ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    No items in this quotation.
                  </td>
                </tr>
              ) : (
                quotation.items.map((item, idx) => {
                  const unitPrice = new Decimal(item.unit_price || 0);
                  const subtotal = new Decimal(item.subtotal || 0);
                  const qty = new Decimal(item.quantity || 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 text-sm text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.product_image_url ? (
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-slate-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/seller/catalog/${item.product_id}`}
                              className="font-bold text-slate-800 hover:text-brand-600 transition-colors text-sm"
                            >
                              {item.product_name}
                            </Link>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {item.product_sku}
                              {item.product_cas ? ` · CAS ${item.product_cas}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-700 font-semibold text-right tabular-nums">
                        {qty.toFixed(qty.decimalPlaces() > 2 ? qty.decimalPlaces() : 2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-semibold border border-slate-200">
                          {item.unit_abbreviation}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 text-right tabular-nums">
                        ₹{unitPrice.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right tabular-nums">
                        ₹{subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        {quotation.items && quotation.items.length > 0 && (
          <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200">
            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Amount</div>
                <div className="text-3xl font-extrabold text-slate-800 tabular-nums">
                  ₹{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [data-print-area], [data-print-area] * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
