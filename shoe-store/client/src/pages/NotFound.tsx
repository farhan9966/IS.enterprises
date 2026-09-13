import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-neutral-600">Page not found.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700">
        Go home
      </Link>
    </div>
  );
}
