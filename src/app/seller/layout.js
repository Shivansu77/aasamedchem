import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { CartProvider } from "@/components/seller/CartContext";
import QuotationCart from "@/components/seller/QuotationCart";
import ProfileLinkButton from "@/components/ProfileLinkButton";

export const metadata = {
  title: "Seller Panel | AASA Medchem",
  description: "Seller panel for AASA Medchem — manage product catalog and quotations.",
};

export default async function SellerLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
        <SellerSidebar />
        <div className="flex-1 flex flex-col min-h-0 md:h-screen overflow-hidden relative min-w-0">
          {/* Top bar */}
          <header className="border-b border-slate-200 px-4 py-3 sm:px-8 sm:py-4 flex items-center justify-end bg-white shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <div className="text-right min-w-0">
                <span className="text-xs text-slate-500 block font-medium">Logged in as</span>
                <span className="text-sm font-semibold text-slate-800 break-all">{session?.user?.email}</span>
              </div>
              <span className="px-3 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {session?.user?.role || "seller"}
              </span>
              <ProfileLinkButton name={session?.user?.name} email={session?.user?.email} />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          
          {/* Global Cart Sidebar */}
          <QuotationCart />
        </div>
      </div>
    </CartProvider>
  );
}
