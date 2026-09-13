# StepUp Shoes — Online Shoe Store

A full custom online shoe store: product catalog, cart, checkout (Cash on Delivery or card via Stripe), customer accounts, and an admin panel to manage products and orders.

This does not require a Shopify account — it's a standalone app you run yourself (locally or on any Node hosting).

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS + wouter + TanStack Query
- Backend: Express + TypeScript
- Database: SQLite via Drizzle ORM (single file, no external database service needed)
- Payments: Stripe (optional) with automatic Cash on Delivery fallback

## Getting started

```bash
cd shoe-store
npm install
cp .env.example .env      # edit ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET
npm run seed               # creates sample products + your admin account
npm run dev                # starts API on :3001 and the app on :5173
```

Open http://localhost:5173

Log in with the admin account printed by `npm run seed` (or the `ADMIN_EMAIL`/`ADMIN_PASSWORD` you set in `.env`) to reach `/admin` and manage products and orders.

## Enabling card payments (optional)

By default, checkout only offers Cash on Delivery. To accept cards:

1. Create a free Stripe account and grab your **test** API keys from https://dashboard.stripe.com/test/apikeys
2. In `.env`, set:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Restart `npm run dev`. The "Card" option will appear at checkout.

Switch to live keys (`sk_live_...` / `pk_live_...`) once you're ready to accept real payments.

## Deploying

```bash
npm run build
npm start
```

`npm start` serves both the built frontend and the API from a single Node process on `PORT` (default 3001). Point your domain at that process, and make sure `SESSION_SECRET`, `DATABASE_URL`, and (if used) the Stripe keys are set as environment variables on your host.
