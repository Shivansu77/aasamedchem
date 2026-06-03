"use client";

import { useCart } from "./CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Decimal from "decimal.js";

export default function QuotationCart() {
  const { cartItems, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isCartOpen) {
    return (
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 bg-brand-500 hover:bg-brand-600 text-white p-4 rounded-full shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.length}
            </span>
          )}
        </div>
      </button>
    );
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum.plus(item.subtotal),
    new Decimal(0)
  );

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/seller/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            unit_id: item.unit_id,
            quantity: item.quantity,
          })),
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit quotation");
      }

      clearCart();
      setNotes("");
      setIsCartOpen(false);
      router.push("/seller/quotations");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error submitting quotation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50">
      <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Current Quotation</h2>
        <button
          type="button"
          aria-label="Close quotation cart"
          onClick={() => setIsCartOpen(false)}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 font-medium">
            Your quotation cart is empty.
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative shadow-sm">
              <button 
                onClick={() => removeFromCart(index)}
                type="button"
                aria-label={`Remove ${item.product_name} from quotation`}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="font-bold text-slate-800 pr-6">{item.product_name}</h3>
              <div className="text-xs text-slate-500 mb-2 font-mono">SKU: {item.sku}</div>
              <div className="flex justify-between text-sm mt-3">
                <span className="text-slate-600">
                  {item.quantity} {item.unit_abbr} × ₹{new Decimal(item.unit_price).toFixed(2)}
                </span>
                <span className="font-bold text-slate-800">₹{new Decimal(item.subtotal).toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <div className="mb-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes..."
            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-400 shadow-sm"
            rows={2}
          ></textarea>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-600 font-medium">Total Amount:</span>
          <span className="text-2xl font-extrabold text-slate-800">₹{totalAmount.toFixed(2)}</span>
        </div>
        <button
          onClick={handleSubmit}
          type="button"
          disabled={cartItems.length === 0 || loading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Quotation"}
        </button>
      </div>
    </div>
  );
}
