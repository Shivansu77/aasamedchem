import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = {
  title: "Products | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products = [];
  try {
    const result = await db.execute(sql`
      SELECT p.*, u.abbreviation as base_unit_abbr
      FROM products p
      LEFT JOIN units u ON p.unit_id = u.id
      ORDER BY p.created_at DESC
    `);
    products = result.rows;
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage chemical inventory, pricing, and units.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 w-16">Image</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Name</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">SKU</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Category</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Stock</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Base Price</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">No products found.</p>
                      <Link href="/admin/products/new" className="inline-block text-brand-600 hover:text-brand-500 text-sm font-bold mt-2">
                        + Add your first product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm bg-white" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-800 font-bold">{product.name}</div>
                      {product.cas_number && <div className="text-xs text-slate-500 mt-0.5 font-mono">CAS: {product.cas_number}</div>}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-sm">{product.sku}</td>
                    <td className="py-4 px-6">
                      {product.category ? (
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">{product.category}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${Number(product.stock_qty) <= 0 ? 'text-red-500' : Number(product.stock_qty) < 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {product.stock_qty}
                      </span>
                      <span className="text-slate-500 text-xs ml-1 font-semibold">{product.base_unit_abbr}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <span className="font-bold">₹{product.price}</span>
                      <span className="text-xs text-slate-500 ml-1 font-semibold">/ {product.base_unit_abbr}</span>
                    </td>
                    <td className="py-4 px-6">
                      {product.is_active ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-200">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">Draft</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/products/${product.id}/edit`}
                          className="text-brand-600 hover:text-brand-500 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold border border-brand-100"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton id={product.id} productName={product.name} />
                      </div>
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
