import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Profile | AASA Medchem",
};

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  let profile = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    phone: null,
    created_at: null,
  };
  let stats = {
    quotations: 0,
    quotationTotal: 0,
    products: 0,
    activeProducts: 0,
  };

  try {
    const userResult = await db.execute(sql`
      SELECT id, name, email, role, phone, created_at
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `);

    if (userResult.rows[0]) {
      profile = userResult.rows[0];
    }

    const quotationStats = profile.role === "admin"
      ? await db.execute(sql`
          SELECT count(*) AS count, COALESCE(sum(total_amount), 0) AS total
          FROM quotations
        `)
      : await db.execute(sql`
          SELECT count(*) AS count, COALESCE(sum(total_amount), 0) AS total
          FROM quotations
          WHERE user_id = ${session.user.id}
        `);
    const productStats = await db.execute(sql`
      SELECT count(*) AS products, count(*) FILTER (WHERE is_active = true) AS active_products
      FROM products
    `);

    stats = {
      quotations: Number(quotationStats.rows[0]?.count || 0),
      quotationTotal: Number(quotationStats.rows[0]?.total || 0),
      products: Number(productStats.rows[0]?.products || 0),
      activeProducts: Number(productStats.rows[0]?.active_products || 0),
    };
  } catch (error) {
    console.error("Failed to fetch profile data:", error);
  }

  const isAdmin = profile.role === "admin";
  const dashboardHref = isAdmin ? "/admin" : "/seller";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={dashboardHref} className="text-sm font-bold text-brand-600 hover:text-brand-700">
              &larr; Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your account, role, and workspace activity.
            </p>
          </div>
          <LogoutButton className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 sm:w-auto" />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 border-b border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500 text-3xl font-extrabold text-white shadow-sm">
              {(profile.name || profile.email || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="break-words text-2xl font-extrabold text-slate-800">{profile.name || "AASA User"}</h2>
                <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
                  {profile.role || "seller"}
                </span>
              </div>
              <p className="mt-1 break-all text-sm font-medium text-slate-500">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            <ProfileField label="Phone" value={profile.phone || "Not added"} />
            <ProfileField label="Joined" value={formatDate(profile.created_at)} />
            <ProfileField label="Default Workspace" value={isAdmin ? "Admin Panel" : "Seller Panel"} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricCard
            label={isAdmin ? "Products Managed" : "Active Products"}
            value={isAdmin ? stats.products : stats.activeProducts}
            caption={isAdmin ? `${stats.activeProducts} currently active` : "Available in seller catalog"}
          />
          <MetricCard
            label={isAdmin ? "Platform Quotations" : "My Quotations"}
            value={stats.quotations}
            caption={isAdmin ? "Submitted across sellers" : "Submitted from this account"}
          />
          <MetricCard
            label="Quotation Value"
            value={formatINR(stats.quotationTotal)}
            caption={isAdmin ? "Submitted across the platform" : "Total value requested"}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionLink href={dashboardHref} title="Open dashboard" desc="Return to your role-based workspace." />
            <ActionLink
              href={isAdmin ? "/admin/products" : "/seller/catalog"}
              title={isAdmin ? "Manage products" : "Browse catalog"}
              desc={isAdmin ? "Edit inventory, units, stock, and pricing." : "Search products and build a quotation."}
            />
            <ActionLink
              href={isAdmin ? "/admin/orders" : "/seller/quotations"}
              title={isAdmin ? "Review orders" : "View quotations"}
              desc={isAdmin ? "Check seller requests and conversion details." : "Track submitted quotation history."}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, caption }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-800">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{caption}</p>
    </div>
  );
}

function ActionLink({ href, title, desc }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-brand-200 hover:bg-brand-50">
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
    </Link>
  );
}
