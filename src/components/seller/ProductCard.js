"use client";

import { useState, useMemo } from "react";
import { useCart } from "./CartContext";
import Decimal from "decimal.js";
import { areConvertible, calcPrice, getUnitPrice } from "@/lib/units";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  const allUnits = useMemo(() => {
    const units = [
      { 
        id: product.unit_id, 
        name: product.base_unit_name, 
        abbr: product.base_unit_abbr, 
        price: product.price,
        isBase: true
      }
    ];
    
    if (product.available_units) {
      product.available_units.forEach(au => {
        if (au.unit_id !== product.unit_id) {
          units.push({
            id: au.unit_id,
            name: au.name,
            abbr: au.abbreviation,
            price: au.price,
            isBase: false
          });
        }
      });
    }
    return units;
  }, [product]);

  const [selectedUnitId, setSelectedUnitId] = useState(allUnits[0].id);
  const [quantity, setQuantity] = useState("1");

  const selectedUnit = useMemo(() => allUnits.find(u => u.id == selectedUnitId), [selectedUnitId, allUnits]);

  const computedTotal = useMemo(() => {
    if (!selectedUnit) return new Decimal(0);

    try {
      const orderedQuantity = new Decimal(quantity || 0);
      if (orderedQuantity.lte(0)) return new Decimal(0);

      if (areConvertible(selectedUnit.abbr, product.base_unit_abbr)) {
        return calcPrice(product.price, orderedQuantity, selectedUnit.abbr, product.base_unit_abbr);
      }
    } catch (e) {
      console.warn(e);
    }
    
    return new Decimal(0);
  }, [quantity, selectedUnit, product]);

  const handleAddToCart = () => {
    const orderedQuantity = new Decimal(quantity || 0);
    if (orderedQuantity.lte(0)) return;
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all flex flex-col group h-full shadow-sm">
      
      {/* Product Image */}
      <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="text-slate-300 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">No Image</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {Number(product.stock_qty) > 0 ? (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200 shrink-0 ml-2">In Stock</span>
          ) : (
            <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold uppercase rounded-full border border-red-200 shrink-0 ml-2">Out</span>
          )}
        </div>
        
        <div className="text-xs text-slate-500 font-mono mb-4">
          SKU: {product.sku} {product.cas_number && `| CAS: ${product.cas_number}`}
        </div>
        
        <div className="mt-auto pt-3 space-y-3">
          <div className="text-sm font-bold text-slate-500 mb-1 border-b border-slate-100 pb-2">Pricing Available:</div>
          <div className="space-y-1 mb-4">
            {allUnits.map(u => {
              let displayPrice = new Decimal(0);
              try {
                if (areConvertible(u.abbr, product.base_unit_abbr)) {
                  displayPrice = getUnitPrice(product.price, u.abbr, product.base_unit_abbr);
                }
              } catch(e) {}
              
              return (
                <div key={u.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{u.abbr}</span>
                  <span className="text-slate-800 font-bold">₹{displayPrice.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input 
              type="number" 
              min="0.000000000001" 
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-400 text-sm shadow-sm"
            />
            <select 
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-400 text-sm appearance-none shadow-sm"
            >
              {allUnits.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.abbr})</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-between items-end pt-2">
            <div>
              <div className="text-xs text-slate-500 font-medium">Total</div>
              <div className="text-xl font-extrabold text-slate-800">₹{computedTotal.toFixed(2)}</div>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={Number(product.stock_qty) <= 0 || computedTotal.lte(0)}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              Add to Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
