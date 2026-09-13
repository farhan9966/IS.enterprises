import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { STORE_NAME } from "../config";
import { useAuth } from "../lib/auth-context";
import { useCart, cartCount } from "../lib/cart";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: cart } = useCart(!!user);
  const count = cart ? cartCount(cart) : 0;

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand-600">
          {STORE_NAME}
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-neutral-700">
          <Link href="/products" className="hover:text-brand-600">
            Shop
          </Link>

          {user?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-1 hover:text-brand-600">
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}

          {user && (
            <Link href="/account" className="flex items-center gap-1 hover:text-brand-600">
              <User size={16} /> {user.name.split(" ")[0]}
            </Link>
          )}

          <Link href="/cart" className="relative flex items-center gap-1 hover:text-brand-600">
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="flex items-center gap-1 hover:text-brand-600"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <Link href="/login" className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
