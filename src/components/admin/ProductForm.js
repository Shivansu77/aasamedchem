"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { areConvertible, getUnitPrice } from "@/lib/units";

export default function ProductForm({ initialData = null }) {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    cas_number: initialData?.cas_number || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    unit_id: initialData?.unit_id || "",
    price: initialData?.price || "",
    stock_qty: initialData?.stock_qty || "",
    is_active: initialData?.is_active ?? true,
    available_units: initialData?.available_units || [],
    image_url: initialData?.image_url || "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const selectedBaseUnit = units.find((unit) => unit.id === Number(formData.unit_id));
  const canonicalBaseUnits = units.filter((unit) => ["g", "mL", "unit"].includes(unit.abbreviation));
  const compatibleOrderUnits = selectedBaseUnit
    ? units.filter((unit) => {
        try {
          return areConvertible(unit.abbreviation, selectedBaseUnit.abbreviation);
        } catch {
          return false;
        }
      })
    : [];

  useEffect(() => {
    fetch("/api/admin/units")
      .then((res) => res.json())
      .then((data) => setUnits(data.units || []))
      .catch((err) => console.error("Failed to load units:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAvailableUnit = (unit_id) => {
    if (!unit_id) return;
    const uid = parseInt(unit_id);
    if (formData.available_units.find((u) => u.unit_id === uid)) return;
    setFormData((prev) => ({
      ...prev,
      available_units: [...prev.available_units, { unit_id: uid, price: "0" }],
    }));
  };

  const handleRemoveAvailableUnit = (unit_id) => {
    setFormData((prev) => ({
      ...prev,
      available_units: prev.available_units.filter((u) => u.unit_id !== unit_id),
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    
    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setFormData(prev => ({ ...prev, image_url: data.url }));
      setImagePreview(data.url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unit_id: parseInt(formData.unit_id) || null,
          price: formData.price || "0",
          stock_qty: formData.stock_qty || "0",
          available_units: formData.available_units.map(u => ({
            ...u,
            price: "0"
          }))
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all placeholder-slate-400 shadow-sm";
  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-8">
        {initialData ? "Edit Product" : "New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2">
            <label className={labelClass}>Product Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} 
              className={inputClass} placeholder="e.g. Sodium Chloride" />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label className={labelClass}>SKU</label>
            <input required type="text" name="sku" value={formData.sku} onChange={handleChange} 
              className={inputClass} placeholder="e.g. NACL-100" />
          </div>

          {/* CAS Number */}
          <div className="space-y-2">
            <label className={labelClass}>CAS Number</label>
            <input type="text" name="cas_number" value={formData.cas_number} onChange={handleChange} 
              className={inputClass} placeholder="e.g. 7647-14-5" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className={labelClass}>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} 
              className={inputClass} placeholder="e.g. Reagents" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={labelClass}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
            className={inputClass} placeholder="Product details..."></textarea>
        </div>

        {/* Product Image */}
        <div className="space-y-2">
          <label className={labelClass}>Product Image</label>
          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 cursor-pointer" />
              <p className="text-xs text-slate-500">Square aspect ratio (1:1) recommended. Auto-cropped.</p>
              {uploadingImage && <p className="text-xs text-brand-600 animate-pulse font-semibold">Uploading...</p>}
            </div>
          </div>
        </div>

        <hr className="border-slate-200 my-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base Unit */}
          <div className="space-y-2">
            <label className={labelClass}>Base Unit</label>
            <select required name="unit_id" value={formData.unit_id} onChange={handleChange}
              className={inputClass + " appearance-none"}>
              <option value="" className="text-slate-400">Select Unit</option>
              {canonicalBaseUnits.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
            </select>
          </div>

          {/* Base Price */}
          <div className="space-y-2">
            <label className={labelClass}>Base Price (INR per base unit)</label>
            <input required type="number" step="any" name="price" value={formData.price} onChange={handleChange} 
              className={inputClass} placeholder="0.00" />
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <label className={labelClass}>Stock Quantity</label>
            <input required type="number" step="any" name="stock_qty" value={formData.stock_qty} onChange={handleChange} 
              className={inputClass} placeholder="0" />
          </div>
        </div>

        {/* Available Units Configuration */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Available Order Units</h3>
          <p className="text-sm text-slate-500 mb-4">Select compatible units this product can be ordered in. Prices are derived from the base price.</p>
          
          <div className="flex gap-4">
            <select id="newAvailableUnit" className={inputClass + " appearance-none flex-1"}>
              <option value="">-- Add an available unit --</option>
              {compatibleOrderUnits.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
            </select>
            <button type="button" onClick={() => {
              const select = document.getElementById("newAvailableUnit");
              handleAddAvailableUnit(select.value);
              select.value = "";
            }} className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors shadow-sm">
              Add Unit
            </button>
          </div>

          {formData.available_units.length > 0 && (
            <div className="mt-4 space-y-3">
              {formData.available_units.map((au) => {
                const unitObj = units.find(u => u.id === au.unit_id);
                return (
                  <div key={au.unit_id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-800 font-semibold min-w-[120px]">
                      {unitObj ? `${unitObj.name} (${unitObj.abbreviation})` : `Unit #${au.unit_id}`}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-slate-500 text-sm font-medium">
                        {unitObj && selectedBaseUnit && formData.price
                          ? `Derived price: ₹${getUnitPrice(formData.price, unitObj.abbreviation, selectedBaseUnit.abbreviation).toFixed(2)} / ${unitObj.abbreviation}`
                          : "Derived from base price"}
                      </span>
                    </div>
                    <button type="button" onClick={() => handleRemoveAvailableUnit(au.unit_id)} className="text-red-600 hover:text-red-500 px-3 py-1.5 bg-red-50 rounded-lg transition-colors font-semibold text-sm border border-red-100">
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3 py-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            <span className="ml-3 text-sm font-semibold text-slate-700">Active / Visible</span>
          </label>
        </div>

        <div className="pt-6 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold shadow-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50">
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
