import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { useAuth } from "../../lib/auth-context";
import { apiRequest } from "../../lib/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    enabled: user?.role === "admin",
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/products"] }),
  });

  if (user?.role !== "admin") {
    return <p className="mx-auto max-w-lg px-4 py-16 text-center text-neutral-600">Admin access required.</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin · Products</h1>
        <div className="flex gap-3">
          <Link href="/admin/orders" className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100">
            View orders
          </Link>
          <Link href="/admin/products/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
            + Add product
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-neutral-500">Loading products...</p>}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="flex items-center gap-3 px-4 py-3">
                  <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
                  {p.name}
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={p.active ? "text-green-600" : "text-neutral-400"}>{p.active ? "Active" : "Hidden"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="mr-3 text-brand-600 hover:underline">
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate(p.id);
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products?.length === 0 && <p className="p-6 text-center text-neutral-500">No products yet.</p>}
      </div>
    </div>
  );
}
