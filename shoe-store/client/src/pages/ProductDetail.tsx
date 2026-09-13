import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Product, ProductSizeStock } from "@shared/schema";
import { useAuth } from "../lib/auth-context";
import { useAddToCart } from "../lib/cart";

export default function ProductDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: product, isLoading } = useQuery<Product>({ queryKey: [`/api/products/${id}`] });
  const addToCart = useAddToCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (isLoading) return <p className="mx-auto max-w-6xl px-4 py-10 text-neutral-500">Loading...</p>;
  if (!product) return <p className="mx-auto max-w-6xl px-4 py-10 text-neutral-500">Product not found.</p>;

  const sizes: ProductSizeStock[] = JSON.parse(product.sizes || "[]");

  async function handleAddToCart() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedSize) {
      setMessage("Please select a size first.");
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product!.id, size: selectedSize, quantity: 1 });
      setMessage("Added to cart!");
    } catch (err: any) {
      setMessage(err.message || "Could not add to cart");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold text-brand-600">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-neutral-600">{product.description}</p>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-neutral-700">Select size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s.size}
                  disabled={s.stock < 1}
                  onClick={() => setSelectedSize(s.size)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    s.stock < 1
                      ? "cursor-not-allowed border-neutral-100 text-neutral-300 line-through"
                      : selectedSize === s.size
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-neutral-300 hover:border-brand-600"
                  }`}
                >
                  {s.size}
                </button>
              ))}
              {sizes.length === 0 && <p className="text-sm text-neutral-400">No sizes available.</p>}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {addToCart.isPending ? "Adding..." : "Add to Cart"}
          </button>

          {message && <p className="mt-3 text-sm text-neutral-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
