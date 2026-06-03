import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Panel | AASA Medchem",
  description: "Administration panel for AASA Medchem — manage products, orders, and users.",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="border-b border-slate-200 px-8 py-4 flex items-center justify-end bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 block font-medium">Logged in as</span>
              <span className="text-sm font-semibold text-slate-800">{session?.user?.email}</span>
            </div>
            <span className="px-3 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {session?.user?.role || "admin"}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
