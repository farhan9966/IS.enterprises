import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context";
import { useCart, useUpdateCartItem, useRemoveCartItem, cartTotal } from "../lib/cart";

export default function Cart() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: cart, isLoading } = useCart(!!user);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-neutral-600">Please log in to view your cart.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700">
          Log in
        </Link>
      </div>
    );
  }

  if (isLoading) return <p className="mx-auto max-w-6xl px-4 py-10 text-neutral-500">Loading cart...</p>;

  if (!cart || cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-neutral-600">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700">
          Shop shoes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4">
            <img src={item.product.imageUrl} alt={item.product.name} className="h-20 w-20 rounded-md object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{item.product.name}</p>
              <p className="text-sm text-neutral-500">Size {item.size}</p>
              <p className="font-bold text-brand-600">${item.product.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                className="h-8 w-8 rounded-md border border-neutral-300 hover:bg-neutral-100"
              >
                -
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                className="h-8 w-8 rounded-md border border-neutral-300 hover:bg-neutral-100"
              >
                +
              </button>
            </div>
            <button onClick={() => removeItem.mutate(item.id)} className="text-sm text-red-500 hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
        <p className="text-lg font-bold">Total: ${cartTotal(cart).toFixed(2)}</p>
        <button
          onClick={() => navigate("/checkout")}
          className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
