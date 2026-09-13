import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api";
import type { Product } from "@shared/schema";

export type CartItem = {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  product: Product;
};

const CART_KEY = "/api/cart";

export function useCart(enabled: boolean) {
  return useQuery<CartItem[]>({
    queryKey: [CART_KEY],
    enabled,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: number; size: string; quantity: number }) =>
      apiRequest("POST", "/api/cart", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_KEY] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; quantity: number }) => apiRequest("PUT", `/api/cart/${input.id}`, { quantity: input.quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_KEY] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cart/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_KEY] }),
  });
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
