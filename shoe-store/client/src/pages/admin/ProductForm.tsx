import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, ProductSizeStock } from "@shared/schema";
import { useAuth } from "../../lib/auth-context";
import { apiRequest } from "../../lib/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "sneakers",
  imageUrl: "",
  active: true,
};

export default function AdminProductForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const isEdit = id !== undefined;
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    enabled: isEdit && user?.role === "admin",
  });
  const existing = allProducts?.find((p) => p.id === Number(id));

  const [form, setForm] = useState(emptyForm);
  const [sizes, setSizes] = useState<ProductSizeStock[]>([{ size: "", stock: 0 }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description,
        price: String(existing.price),
        category: existing.category,
        imageUrl: existing.imageUrl,
        active: existing.active,
      });
      const parsed: ProductSizeStock[] = JSON.parse(existing.sizes || "[]");
      setSizes(parsed.length > 0 ? parsed : [{ size: "", stock: 0 }]);
    }
  }, [existing]);

  if (user?.role !== "admin") {
    return <p className="mx-auto max-w-lg px-4 py-16 text-center text-neutral-600">Admin access required.</p>;
  }

  function updateSize(index: number, field: "size" | "stock", value: string) {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: field === "stock" ? Number(value) || 0 : value } : s)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setError("Enter a valid price");
      return;
    }
    const cleanSizes = sizes.filter((s) => s.size.trim() !== "");

    const payload = {
      name: form.name,
      description: form.description,
      price,
      category: form.category,
      imageUrl: form.imageUrl,
      active: form.active,
      sizes: JSON.stringify(cleanSizes),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await apiRequest("PUT", `/api/admin/products/${id}`, payload);
      } else {
        await apiRequest("POST", "/api/admin/products", payload);
      }
      qc.invalidateQueries({ queryKey: ["/api/admin/products"] });
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Could not save product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? "Edit product" : "Add product"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Price (USD)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input
            required
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Sizes & stock</label>
          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Size (e.g. 42)"
                  value={s.size}
                  onChange={(e) => updateSize(i, "size", e.target.value)}
                  className="flex-1 rounded-md border border-neutral-300 px-3 py-2"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={s.stock}
                  onChange={(e) => updateSize(i, "stock", e.target.value)}
                  className="w-28 rounded-md border border-neutral-300 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => setSizes((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-md border border-neutral-300 px-3 text-red-500 hover:bg-neutral-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSizes((prev) => [...prev, { size: "", stock: 0 }])}
            className="mt-2 text-sm text-brand-600 hover:underline"
          >
            + Add size
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Visible in store
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded-lg border border-neutral-300 px-6 py-2.5 font-semibold hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
