import { db } from "@/db";
import { sql } from "drizzle-orm";

export const metadata = {
  title: "Orders & Quotations | Admin",
};

export const dynamic = "force-dynamic";

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDecimal(value) {
  const text = String(value ?? "0");
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}

export default async function AdminOrdersPage() {
  let quotations = [];

  try {
    const result = await db.execute(sql`
      SELECT
        q.id AS quotation_id,
        q.quotation_number,
        q.status,
        q.total_amount,
        q.notes,
        q.created_at,
        users.name AS seller_name,
        users.email AS seller_email,
        qi.id AS item_id,
        qi.quantity AS ordered_quantity,
        qi.base_quantity,
        qi.base_unit_abbr,
        qi.unit_price,
        qi.subtotal,
        products.name AS product_name,
        products.sku,
        products.cas_number,
        order_unit.abbreviation AS ordered_unit_abbr
      FROM quotations q
      LEFT JOIN users ON users.id = q.user_id
      LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
      LEFT JOIN products ON products.id = qi.product_id
      LEFT JOIN units order_unit ON order_unit.id = qi.unit_id
      ORDER BY q.created_at DESC, qi.id ASC
    `);

    const byQuotation = new Map();
    for (const row of result.rows) {
      if (!byQuotation.has(row.quotation_id)) {
        byQuotation.set(row.quotation_id, {
          id: row.quotation_id,
          quotationNumber: row.quotation_number,
          status: row.status,
          totalAmount: row.total_amount,
          notes: row.notes,
          createdAt: row.created_at,
          sellerName: row.seller_name,
          sellerEmail: row.seller_email,
          items: [],
        });
      }

      if (row.item_id) {
        byQuotation.get(row.quotation_id).items.push({
          id: row.item_id,
          productName: row.product_name,
          sku: row.sku,
          casNumber: row.cas_number,
          orderedQuantity: row.ordered_quantity,
          orderedUnitAbbr: row.ordered_unit_abbr,
          baseQuantity: row.base_quantity,
          baseUnitAbbr: row.base_unit_abbr,
          unitPrice: row.unit_price,
          subtotal: row.subtotal,
        });
      }
    }

    quotations = Array.from(byQuotation.values());
  } catch (error) {
    console.error("Failed to fetch admin quotations:", error);
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Orders & Quotations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review submitted quotations with ordered units, base-unit conversions, and INR totals.
        </p>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-slate-500 text-sm font-medium">No quotations have been submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {quotations.map((quotation) => (
            <section key={quotation.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-extrabold text-slate-800">{quotation.quotationNumber}</h2>
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold border border-sky-100 capitalize">
                      {quotation.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {quotation.sellerName || "Unknown seller"} · {quotation.sellerEmail || "No email"} ·{" "}
                    {new Date(quotation.createdAt).toLocaleString("en-IN")}
                  </p>
                  {quotation.notes && (
                    <p className="text-sm text-slate-600 mt-3 max-w-3xl">{quotation.notes}</p>
                  )}
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quotation Total</p>
                  <p className="text-2xl font-extrabold text-slate-800">{formatINR(quotation.totalAmount)}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Product</th>
                      <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Ordered</th>
                      <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Base Quantity</th>
                      <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Unit Price</th>
                      <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotation.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{item.productName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-1">
                            SKU: {item.sku || "N/A"} {item.casNumber ? `| CAS: ${item.casNumber}` : ""}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-semibold">
                          {formatDecimal(item.orderedQuantity)} {item.orderedUnitAbbr}
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-semibold">
                          {formatDecimal(item.baseQuantity)} {item.baseUnitAbbr}
                        </td>
                        <td className="py-4 px-6 text-slate-700">
                          {formatINR(item.unitPrice)} / {item.orderedUnitAbbr}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                          {formatINR(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
