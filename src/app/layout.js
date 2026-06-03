import "./globals.css";

export const metadata = {
  title: "aasamedchem — Pharmaceutical Order Management",
  description:
    "Manage products, orders, and inventory for pharmaceutical and medicinal chemistry operations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-surface-50 text-slate-800 font-sans">{children}</body>
    </html>
  );
}
