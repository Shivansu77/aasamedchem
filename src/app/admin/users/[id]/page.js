import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `User ${id} | Admin`,
  };
}

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  let user = null;
  let quotations = [];

  try {
    const userResult = await db.execute(sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.phone,
        u.created_at,
        COUNT(DISTINCT q.id) AS quotation_count,
        COALESCE(SUM(q.total_amount), 0) AS quotation_total
      FROM users u
      LEFT JOIN quotations q ON q.user_id = u.id
      WHERE u.id = ${userId}
      GROUP BY u.id
      LIMIT 1
    `);

    user = userResult.rows[0] || null;

    if (user) {
      const quotationResult = await db.execute(sql`
        SELECT
          q.id,
          q.quotation_number,
          q.status,
          q.total_amount,
          q.notes,
          q.created_at,
          COUNT(qi.id) AS item_count,
          STRING_AGG(p.name, ', ' ORDER BY p.name) AS products_list
        FROM quotations q
        LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
        LEFT JOIN products p ON p.id = qi.product_id
        WHERE q.user_id = ${userId}
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `);

      quotations = quotationResult.rows;
    }
  } catch (error) {
    console.error("Failed to fetch admin user detail:", error);
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/users" className="text-sm font-bold text-brand-600 hover:text-brand-700">
            Back to users
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mt-3">{user.name || "Unnamed user"}</h1>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>
        <span className="self-start px-3 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
          {user.role || "user"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</p>
          <p className="text-xl font-extrabold text-slate-800 mt-2">{user.phone || "Not provided"}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Joined</p>
          <p className="text-xl font-extrabold text-slate-800 mt-2">{formatDate(user.created_at)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quotation Value</p>
          <p className="text-xl font-extrabold text-slate-800 mt-2">{formatINR(user.quotation_total)}</p>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-extrabold text-slate-800">Quotation History</h2>
          <p className="text-sm text-slate-500 mt-1">{Number(user.quotation_count || 0)} quotations submitted by this user.</p>
        </div>

        {quotations.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-500 text-sm font-medium">This user has not submitted quotations yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Quotation</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Products</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Status</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Created</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{quotation.quotation_number}</div>
                      <div className="text-xs text-slate-500 mt-1">{Number(quotation.item_count || 0)} items</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 max-w-md">
                      {quotation.products_list || "No products"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold border border-sky-100 capitalize">
                        {quotation.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{formatDate(quotation.created_at)}</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-800">{formatINR(quotation.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
