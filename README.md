# Apparel (Vite + Serverless API)

Deployment (Vercel)

> This app requires an external MySQL-compatible database. Vercel does not host a MySQL database for this project.

1. In Vercel create a new project and connect the repository: https://github.com/cyybridtech/apparrel
2. Application Preset: **Vite**
3. Root Directory: project root (leave blank)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — MySQL connection string (required)
   - `DATABASE_SSL_CA` — optional TLS certificate PEM if your provider requires it
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

Render database hosting

This app currently uses MySQL. Render does not provide a built-in managed MySQL product, so you have two options:

- Use Render to run a MySQL instance inside a Docker service and expose its connection URL.
- Or continue using Railway/PlanetScale for MySQL and host the app on Vercel.

If you want to use Render for the database with MySQL:

1. Create a new Render service.
2. Choose Docker and deploy a MySQL Docker image (for example `mysql:8`).
3. Set service environment variables for MySQL:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
4. Use Render service internal DNS or hostname to build `DATABASE_URL`:
   - `mysql://root:password@<render-service-host>:3306/<database>`
5. Add `DATABASE_URL` to Vercel settings.

TiDB Cloud hosting

TiDB Cloud is MySQL-compatible, but you must target a dedicated application database, not the built-in `sys` database.

1. Create a TiDB Cloud cluster.
2. Create a dedicated database for the app, for example: `footwear`.
3. Create a database user and password.
4. Copy the MySQL-compatible connection string.
5. In Vercel Project Settings → Environment Variables, add:
   - `DATABASE_URL` — the MySQL connection string, for example:
     `mysql://<user>:<password>@<host>:<port>/<database>?ssl=true`
   - `DATABASE_SSL_CA` — the full TLS CA certificate text from TiDB Cloud if TLS is required.
     - On Vercel, paste the PEM contents directly into the env var.
     - Locally, you can also set this to a certificate file path if you prefer.
6. Deploy the frontend and functions after the DB connection is configured.

If your URL currently ends with `/sys`, change it to the dedicated database name and rerun:

```bash
npm run migrate
npm run reseed
```

Once the database is reachable, run locally:

```bash
npm install
npm run migrate
npm run reseed
```

If the database is empty, `npm run migrate` will create the tables and then apply schema updates.

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
