import Link from "next/link";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const metadata = {
  title: "Users | Admin",
};

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminUsersPage() {
  let users = [];

  try {
    const result = await db.execute(sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.phone,
        u.created_at,
        COUNT(DISTINCT q.id) AS quotation_count,
        COALESCE(SUM(q.total_amount), 0) AS quotation_total,
        MAX(q.created_at) AS last_quotation_at
      FROM users u
      LEFT JOIN quotations q ON q.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    users = result.rows;
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Users</h1>
        <p className="text-sm text-slate-500 mt-1">
          View registered accounts and open a user to inspect their quotation history.
        </p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-500 text-sm font-medium">No users are registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">User</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Role</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Quotations</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500">Last Activity</th>
                  <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`/admin/users/${user.id}`} className="block">
                        <div className="font-bold text-slate-800">{user.name || "Unnamed user"}</div>
                        <div className="text-xs text-slate-500 mt-1">{user.email}</div>
                        {user.phone && <div className="text-xs text-slate-400 mt-1">{user.phone}</div>}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold border border-brand-100 uppercase">
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{formatDate(user.created_at)}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700">{Number(user.quotation_count || 0)}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{formatDate(user.last_quotation_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/admin/users/${user.id}`} className="text-sm font-bold text-brand-600 hover:text-brand-700">
                        View details
                      </Link>
                    </td>
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
