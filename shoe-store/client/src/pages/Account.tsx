import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { OrderWithItems } from "@shared/schema";
import { useAuth } from "../lib/auth-context";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  cod: "Placed (Cash on Delivery)",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function Account() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-neutral-600">Please log in to view your account.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">My Account</h1>
      <p className="mb-6 text-neutral-600">
        {user.name} · {user.email}
      </p>

      <h2 className="mb-4 text-lg font-semibold">Order history</h2>
      {isLoading && <p className="text-neutral-500">Loading orders...</p>}
      {!isLoading && orders?.length === 0 && <p className="text-neutral-500">You haven't placed any orders yet.</p>}

      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">Order #{order.id}</p>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <ul className="mb-2 text-sm text-neutral-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.productName} (size {item.size}) — ${item.price.toFixed(2)} each
                </li>
              ))}
            </ul>
            <p className="font-semibold text-brand-600">Total: ${order.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
