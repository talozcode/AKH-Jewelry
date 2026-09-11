import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--admin-text)]">New product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
