import { STORE_NAME } from "../config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500">
      <p>
        © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
      </p>
    </footer>
  );
}
