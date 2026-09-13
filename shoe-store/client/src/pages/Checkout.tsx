import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useAuth } from "../lib/auth-context";
import { useCart, cartTotal } from "../lib/cart";
import { apiRequest } from "../lib/api";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type ShippingInfo = {
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
};

function StripePaymentStep({ orderId, onDone }: { orderId: number; onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (result.error) {
      setError(result.error.message || "Payment failed");
      setSubmitting(false);
      return;
    }

    try {
      await apiRequest("POST", `/api/orders/${orderId}/confirm-payment`);
      onDone();
    } catch (err: any) {
      setError(err.message || "Could not confirm payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: cart } = useCart(!!user);
  const { data: config } = useQuery<{ stripeEnabled: boolean }>({ queryKey: ["/api/config"] });
  const qc = useQueryClient();

  const [shipping, setShipping] = useState<ShippingInfo>({ shippingName: "", shippingAddress: "", shippingPhone: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [placed, setPlaced] = useState(false);

  const stripeAvailable = !!config?.stripeEnabled && !!stripePromise;

  if (!user) {
    navigate("/login");
    return null;
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-600">Order placed!</h1>
        <p className="mt-2 text-neutral-600">Thank you for your order. You can track it from your account page.</p>
        <button
          onClick={() => navigate("/account")}
          className="mt-6 rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700"
        >
          View my orders
        </button>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return <p className="mx-auto max-w-2xl px-4 py-16 text-center text-neutral-600">Your cart is empty.</p>;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/checkout", { ...shipping, paymentMethod });
      if (paymentMethod === "cod") {
        qc.invalidateQueries({ queryKey: ["/api/cart"] });
        setPlaced(true);
      } else {
        setOrderId(res.order.id);
        setClientSecret(res.stripeClientSecret);
        qc.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    } catch (err: any) {
      setError(err.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <p className="mb-6 font-semibold">Total: ${cartTotal(cart).toFixed(2)}</p>

      {!clientSecret && (
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input
              required
              value={shipping.shippingName}
              onChange={(e) => setShipping({ ...shipping, shippingName: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Shipping address</label>
            <textarea
              required
              value={shipping.shippingAddress}
              onChange={(e) => setShipping({ ...shipping, shippingAddress: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <input
              required
              value={shipping.shippingPhone}
              onChange={(e) => setShipping({ ...shipping, shippingPhone: e.target.value })}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Payment method</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex-1 rounded-md border px-4 py-2 text-sm ${
                  paymentMethod === "cod" ? "border-brand-600 bg-brand-50" : "border-neutral-300"
                }`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                disabled={!stripeAvailable}
                onClick={() => setPaymentMethod("stripe")}
                className={`flex-1 rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  paymentMethod === "stripe" ? "border-brand-600 bg-brand-50" : "border-neutral-300"
                }`}
              >
                Card {stripeAvailable ? "" : "(not configured)"}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : paymentMethod === "cod" ? "Place order" : "Continue to payment"}
          </button>
        </form>
      )}

      {clientSecret && orderId && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentStep orderId={orderId} onDone={() => setPlaced(true)} />
        </Elements>
      )}
    </div>
  );
}
