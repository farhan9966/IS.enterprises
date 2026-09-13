import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrderWithItems } from "@shared/schema";
import { useAuth } from "../../lib/auth-context";
import { apiRequest } from "../../lib/api";

const STATUSES = ["pending_payment", "cod", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders"],
    enabled: user?.role === "admin",
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/orders"] }),
  });

  if (user?.role !== "admin") {
    return <p className="mx-auto max-w-lg px-4 py-16 text-center text-neutral-600">Admin access required.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Admin · Orders</h1>
      {isLoading && <p className="text-neutral-500">Loading orders...</p>}
      {!isLoading && orders?.length === 0 && <p className="text-neutral-500">No orders yet.</p>}

      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">
                Order #{order.id} · {order.shippingName}
              </p>
              <select
                value={order.status}
                onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                className="rounded-md border border-neutral-300 px-2 py-1 text-sm capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-neutral-500">
              {order.shippingAddress} · {order.shippingPhone}
            </p>
            <ul className="mt-2 text-sm text-neutral-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.productName} (size {item.size})
                </li>
              ))}
            </ul>
            <p className="mt-2 font-semibold text-brand-600">
              Total: ${order.total.toFixed(2)} · {order.paymentMethod === "stripe" ? "Card" : "Cash on Delivery"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
