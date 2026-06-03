import { db } from "@/db";
import { sql } from "drizzle-orm";
import ProductCard from "@/components/seller/ProductCard";

export const metadata = {
  title: "Product Catalog | Seller Panel",
};

export const dynamic = "force-dynamic";

export default async function SellerCatalogPage(props) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const category = searchParams?.category || "";

  const categoriesResult = await db.execute(sql`SELECT DISTINCT category FROM products WHERE is_active = true AND category IS NOT NULL`);
  const categories = categoriesResult.rows.map(r => r.category);

  const searchCondition = search ? sql`(p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})` : sql`1=1`;
  const categoryCondition = category ? sql`p.category = ${category}` : sql`1=1`;

  const productsResult = await db.execute(sql`
    SELECT p.*, u.abbreviation as base_unit_abbr, u.name as base_unit_name
    FROM products p
    LEFT JOIN units u ON p.unit_id = u.id
    WHERE p.is_active = true 
    AND ${searchCondition}
    AND ${categoryCondition}
    ORDER BY p.name ASC
  `);
  
  const products = productsResult.rows;

  if (products.length > 0) {
    const productIds = products.map(p => p.id);
    const productIdsList = sql.raw(productIds.join(', '));
    const unitsResult = await db.execute(sql`
      SELECT pau.*, u.abbreviation, u.name
      FROM product_available_units pau
      JOIN units u ON pau.unit_id = u.id
      WHERE pau.product_id IN (${productIdsList})
    `);
    
    const availableUnitsByProduct = {};
    for (const row of unitsResult.rows) {
      if (!availableUnitsByProduct[row.product_id]) {
        availableUnitsByProduct[row.product_id] = [];
      }
      availableUnitsByProduct[row.product_id].push(row);
    }
    
    for (const p of products) {
      p.available_units = availableUnitsByProduct[p.id] || [];
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Product Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">Search compounds and add them to a quotation.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <form method="GET" action="/seller/catalog" className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
              type="text" 
              name="search" 
              defaultValue={search} 
              placeholder="Search by name, SKU..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 shadow-sm placeholder-slate-400"
            />
          </div>
          
          <select 
            name="category"
            defaultValue={category}
            className="sm:w-48 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none shadow-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <button type="submit" className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors shadow-sm">
            Search
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium">No products match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
