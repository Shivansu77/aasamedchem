"use client";

import { useMemo, useState } from "react";
import Decimal from "decimal.js";
import Link from "next/link";
import { useCart } from "./CartContext";
import { areConvertible, calcPrice, getUnitPrice } from "@/lib/units";

export default function ProductDetail({ product }) {
  const { addToCart } = useCart();

  const allUnits = useMemo(() => {
    const units = [
      {
        id: product.unit_id,
        name: product.base_unit_name,
        abbr: product.base_unit_abbr,
        price: product.price,
        isBase: true,
      },
    ];

    if (product.available_units) {
      product.available_units.forEach((unit) => {
        if (unit.unit_id !== product.unit_id) {
          units.push({
            id: unit.unit_id,
            name: unit.name,
            abbr: unit.abbreviation,
            price: unit.price,
            isBase: false,
          });
        }
      });
    }

    return units;
  }, [product]);

  const [selectedUnitId, setSelectedUnitId] = useState(allUnits[0]?.id);
  const [quantity, setQuantity] = useState("1");

  const selectedUnit = useMemo(
    () => allUnits.find((unit) => unit.id == selectedUnitId),
    [selectedUnitId, allUnits]
  );

  const safeDecimal = (val) => {
    try {
      const v = typeof val === "string" ? val.trim() : val;
      if (v === "" || v === "." || v === "-" || v === "+") return new Decimal(0);
      return new Decimal(v || 0);
    } catch {
      return new Decimal(0);
    }
  };

  const computedTotal = useMemo(() => {
    if (!selectedUnit) return new Decimal(0);

    try {
      const orderedQuantity = safeDecimal(quantity);
      if (orderedQuantity.lte(0)) return new Decimal(0);

      if (areConvertible(selectedUnit.abbr, product.base_unit_abbr)) {
        return calcPrice(product.price, orderedQuantity, selectedUnit.abbr, product.base_unit_abbr);
      }
    } catch (error) {
      console.warn(error);
    }

    return new Decimal(0);
  }, [quantity, selectedUnit, product]);

  const handleAddToCart = () => {
    const orderedQuantity = safeDecimal(quantity);
    if (orderedQuantity.lte(0) || !selectedUnit) return;

    const unitPrice = computedTotal.dividedBy(orderedQuantity);
    addToCart(
      product,
      selectedUnit.id,
      orderedQuantity.toFixed(),
      unitPrice.toFixed(12),
      computedTotal.toFixed(12),
      selectedUnit.abbr
    );
  };

  const isInStock = Number(product.stock_qty) > 0;

  return (
    <div className="p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-6">
      <div>
        <Link href="/seller/catalog" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Back to catalog
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-300 flex flex-col items-center py-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-16 h-16 mb-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
                <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">No Image</span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{product.name}</h1>
                {isInStock ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                    In Stock
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold uppercase rounded-full border border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                SKU: {product.sku || "N/A"}
                {product.cas_number ? ` | CAS: ${product.cas_number}` : ""}
              </div>
              <div className="text-sm text-slate-500">
                Category: <span className="text-slate-700 font-semibold">{product.category || "Uncategorized"}</span>
              </div>
            </div>

            {product.description ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed">
                {product.description}
              </div>
            ) : (
              <div className="text-sm text-slate-400">No description provided for this product.</div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-bold text-slate-500 border-b border-slate-100 pb-2">
                Pricing Available:
              </div>
              <div className="space-y-1">
                {allUnits.map((unit) => {
                  let displayPrice = new Decimal(0);
                  try {
                    if (areConvertible(unit.abbr, product.base_unit_abbr)) {
                      displayPrice = getUnitPrice(product.price, unit.abbr, product.base_unit_abbr);
                    }
                  } catch (error) {
                    console.warn(error);
                  }

                  return (
                    <div key={unit.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{unit.abbr}</span>
                      <span className="text-slate-800 font-bold">₹{displayPrice.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  min="0.000000000001"
                  step="any"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="sm:w-32 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-400 text-sm shadow-sm"
                />
                <select
                  value={selectedUnitId}
                  onChange={(event) => setSelectedUnitId(event.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-400 text-sm appearance-none shadow-sm"
                >
                  {allUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Total</div>
                  <div className="text-2xl font-extrabold text-slate-800">₹{computedTotal.toFixed(2)}</div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock || computedTotal.lte(0)}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 text-white px-5 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  Add to Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
