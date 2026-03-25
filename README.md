# Onboard Backend

Standalone registrar onboarding backend for dotKE.

## What it includes

- Public applicant draft flow with resume tokens
- PostgreSQL-backed application storage
- PostgreSQL-backed document blob storage
- Admin review API
- Simple themed portal and admin pages
- SQL migration for all required tables

## Run locally

1. Copy `.env.example` to `.env`
2. Keep `DATABASE_URL` pointed at the local Postgres instance or set it to your managed database
3. Start the backend

```bash
npm run dev
```

`npm run dev` and `npm start` now bootstrap the local Postgres cluster automatically when:

- `DATABASE_URL` points to `localhost` or `127.0.0.1`
- `LOCAL_DB_AUTO_START=true`

On first boot, the app will initialize the local cluster if needed, start PostgreSQL, create the `onboard` database, and apply any pending migrations.

## Database commands

```bash
npm run db:status
npm run db:start
npm run db:stop
npm run db:migrate
```

## Production notes

- `LOCAL_DB_AUTO_START` defaults to `false` when `NODE_ENV=production`
- `AUTO_RUN_MIGRATIONS` defaults to `false` when `NODE_ENV=production`
- In production, point `DATABASE_URL` at an external managed Postgres instance and run `npm run db:migrate` as part of deployment
- If `DATABASE_URL` still points to `localhost`, the app will only bootstrap its own local cluster when PostgreSQL tools such as `initdb` and `pg_ctl` are installed. Otherwise set `LOCAL_DB_AUTO_START=false` and use an already running PostgreSQL service.

## Key routes

- `GET /health`
- `GET /portal`
- `GET /admin`
- `POST /onboard/v1/public/applications`
- `PATCH /onboard/v1/public/applications/:id/sections/:sectionCode`
- `PUT /onboard/v1/public/applications/:id/form`
- `POST /onboard/v1/public/applications/:id/documents`
- `POST /onboard/v1/public/applications/:id/submit`
- `GET /onboard/v1/admin/applications`

## Notes

- Applicant access is controlled with draft and resume tokens.
- The portal keeps in-progress edits in browser storage and only persists the full form to PostgreSQL when the applicant explicitly saves or submits.
- Admin access is controlled with `ADMIN_API_TOKEN`.
- Documents are stored inside PostgreSQL in a dedicated blob table.
- `GET /health` returns live database connectivity details and responds with `503` if PostgreSQL is unavailable.
