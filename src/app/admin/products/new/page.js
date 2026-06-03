import ProductForm from "@/components/admin/ProductForm";

export const metadata = {
  title: "New Product | Admin",
};

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-white tracking-wide">Add New Product</h1>
        <p className="text-slate-400 mt-2">Create a new chemical or pharmaceutical product in the catalog.</p>
      </div>
      <ProductForm />
    </div>
  );
}
