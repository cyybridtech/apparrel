# Apparel (Vite + Serverless API)

Deployment (Vercel)

1. In Vercel create a new project and connect the repository: https://github.com/cyybridtech/apparrel
2. Application Preset: **Vite**
3. Root Directory: project root (leave blank)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — MySQL connection string (required)
   - any other secrets used by your app
7. Vercel will build the frontend and deploy serverless functions from the `api/` directory.

Railway database hosting

1. Create a new project in Railway and add a MySQL plugin.
2. Copy the generated connection string from Railway.
3. In Vercel Project Settings → Environment Variables, add:
   - `DATABASE_URL` — the Railway MySQL connection string
4. Optionally run migrations or seed data locally before deploying:
   - `npm install`
   - `npm run migrate`
   - `npm run reseed`
5. Deploy the frontend and functions after the DB connection is configured.

Local testing

Install dependencies and run dev:

```bash
npm install
npm run dev
```

To test serverless functions locally with Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Notes

- I converted the core Express endpoints into serverless functions under `api/` (`health`, `products`, `products/[slug]`, `cart`, `orders`).
- Make sure to add `DATABASE_URL` in Vercel before deploying. If you prefer to host the backend elsewhere (e.g., Railway/Render), change the frontend to point to that URL instead of the local API.
