import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { ProductCard } from "../components/ProductCard";
import { STORE_NAME } from "../config";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Step into {STORE_NAME}</h1>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Comfortable, stylish shoes for every step of your day. Shop sneakers, formal wear, and more.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Featured shoes</h2>
        {isLoading && <p className="text-neutral-500">Loading products...</p>}
        {!isLoading && products?.length === 0 && (
          <p className="text-neutral-500">No products yet. Check back soon!</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products?.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
