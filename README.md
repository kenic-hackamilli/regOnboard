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
2. Set `DATABASE_URL`
3. Run migrations

```bash
npm run db:migrate
```

4. Start the server

```bash
npm run dev
```

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
