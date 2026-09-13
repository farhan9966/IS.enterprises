import { Link } from "wouter";
import type { Product } from "@shared/schema";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-neutral-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
        <h3 className="mt-1 font-semibold text-neutral-900">{product.name}</h3>
        <p className="mt-1 font-bold text-brand-600">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
