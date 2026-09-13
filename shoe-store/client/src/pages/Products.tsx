import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { ProductCard } from "../components/ProductCard";

export default function Products() {
  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = (products || []).filter((p) => category === "all" || p.category === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">All Shoes</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              category === c ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-neutral-500">Loading products...</p>}
      {!isLoading && filtered.length === 0 && <p className="text-neutral-500">No shoes found in this category.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
