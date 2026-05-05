# Onboard Backend

Standalone registrar onboarding backend for dotKE.

## What it includes

- Public applicant draft flow with resume tokens
- PostgreSQL-backed application storage
- PostgreSQL-backed document blob storage
- Submission notification outbox with SMTP delivery retries
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

## Admin terminal

```bash
npm run admin
npm run admin -- status
npm run admin -- dashboard
```

The terminal admin console now shows an applications dashboard with totals, local vs international counts, and a workflow status breakdown alongside the portal status controls.

## Production notes

- `LOCAL_DB_AUTO_START` defaults to `false` when `NODE_ENV=production`
- `AUTO_RUN_MIGRATIONS` defaults to `false` when `NODE_ENV=production`
- In production, point `DATABASE_URL` at an external managed Postgres instance and run `npm run db:migrate` as part of deployment
- Set `PUBLIC_BASE_URL` to the exact deployed applicant portal origin, for example `https://apps.kenic.or.ke`
- Set `CORS_ORIGIN` to an explicit comma-separated allowlist if you need cross-origin browser access; otherwise the backend now defaults to the deployed portal origin instead of permissive wildcard browser access
- Set `ADMIN_SESSION_SECRET` to a long random secret and keep `ADMIN_API_TOKEN` only for initial admin sign-in or terminal/script access
- For document malware scanning, set `DOCUMENT_SCAN_COMMAND` to an installed scanner command such as `clamdscan --stdout --no-summary {file}`; the backend will also run built-in heuristic checks even when no external scanner is configured
- If you want uploads to fail closed when the external scanner is unavailable, set `BLOCK_UPLOADS_ON_SCAN_FAILURE=true`
- To enable application submission emails, set `MAIL_MAILER=smtp` plus `MAIL_HOST`, `MAIL_PORT`, `MAIL_ENCRYPTION`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, and optionally `MAIL_FROM_NAME`
- Set `NOTIFICATION_EMAIL` to the commercial-team mailbox that should receive new submission alerts. You can provide multiple recipients separated by commas or semicolons
- Submission emails are queued in PostgreSQL and dispatched by a background worker with retries, so a successful applicant submission does not depend on the SMTP round-trip finishing inside the request
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
- The portal only restores an in-progress application from an explicit resume link or the current browser tab session, and it clears submitted or closed applications instead of repopulating their fields into the form.
- The portal keeps application-linked in-progress edits in browser storage and only persists the full form to PostgreSQL when the applicant explicitly saves or submits.
- A successful submission queues two outbound communications when SMTP is enabled: a commercial-team alert with a PDF summary attachment, and an acknowledgement email to the applicant.
- Admin access is controlled with `ADMIN_API_TOKEN`.
- Documents are stored inside PostgreSQL in a dedicated blob table.
- `GET /health` returns live database connectivity details and responds with `503` if PostgreSQL is unavailable.


npm run db:migrate
