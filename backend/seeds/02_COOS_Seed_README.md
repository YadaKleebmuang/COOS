# COOS Development Seed

Files in this package are for **development/UI/QA only**.

Do not run this seed against production data. The SQL uses fixed negative IDs,
test-only accounts, and local upload paths intended for repeatable QA.

## Verified backend contracts

- Password hashing: `bcrypt.hash(password, 10)`
- Login: `bcrypt.compare(...)`
- Default backend port: `3000`
- Static upload root: `/uploads` -> `backend/uploads`
- Seed image assets are local-only test assets and are intentionally not part of
  the database schema or business logic.
- Payment split: 30% deposit / 70% final
- Order price: base + urgent - gallery discount

## Seed data coverage

The seed is designed for backend QA and frontend UI testing. It creates:

- 16 test users: 2 admins, 4 editors, and 10 customers.
- 24 test orders covering all 9 order statuses.
- 27 payments covering `pending`, `approved`, and `rejected` states.
- Active and inactive gallery records.
- Order images for source uploads, generated outputs, and selected final images.
- Policies, work types, packages, tags, and workflow logs for dashboard and table coverage.

The records use fixed negative IDs so they are easy to identify and can be
re-seeded without mixing with normal positive AUTO_INCREMENT data.

## Image assets

The seed references real local test assets under these folders:

- `backend/uploads/profiles/*.png`
- `backend/uploads/gallery/*.png`
- `backend/uploads/sources/*.png`
- `backend/uploads/ai-generated/*.png`
- `backend/uploads/slips/*.jpeg`

Use the extensions exactly as referenced by the SQL. For example, slips use
`.jpeg`, not `.png`.

`backend/uploads` is ignored by Git in this project, so image files are not part
of this seed commit. Keep those files available locally, and copy them into the
Docker upload volume when running the backend through Docker Compose.

Some asset files are intentionally reused across multiple seed records. This
keeps order, payment, profile, and gallery scenarios covered without inventing
fake filenames.

## Install

1. Copy `backend/seeds/development_seed.sql` into your project.
2. Make sure the real test image files exist under `backend/uploads/`.
3. Copy the contents of `backend/uploads/` into your existing `backend/uploads/`.
4. If Docker Compose uses a named volume for `/app/uploads`, copy the assets into
   the running backend container volume before image smoke testing:

   ```bash
   docker compose cp backend/uploads/. backend:/app/uploads/
   ```

   This is a copy/merge operation. Do not delete existing upload files from the
   Docker volume.
5. Ensure `backend/database.sql` and migrations have already been applied.
6. If your backend is not `http://localhost:3000`, edit `@BACKEND_BASE_URL` near the top of the SQL.
7. Run `development_seed.sql` against the **development** `coosdb` database.

## Frontend UI testing

This seed supports Public, Customer, Editor, and Admin UI testing:

- Public pages can load gallery, work types, packages, policies, and image URLs.
- Customer pages can test dashboards, order lists, order detail states, payments,
  and empty-account scenarios.
- Editor pages can test assigned, active, and completed work lists.
- Admin pages can test dashboards, users, orders, payments, gallery, packages,
  work types, policies, reports, and settings surfaces.

Do not treat this data as business fixtures for production behavior. It is
test-only coverage for local development, QA, and regression review.

## Image 404 checklist

If seeded image URLs return 404:

1. Confirm the file exists on the host, for example `backend/uploads/gallery/seed-gallery-01.png`.
2. Confirm the file exists inside the backend container, for example
   `/app/uploads/gallery/seed-gallery-01.png`.
3. If `/app/uploads` is a Docker named volume, copy host assets into the volume:

   ```bash
   docker compose cp backend/uploads/. backend:/app/uploads/
   ```

4. Smoke test the URL and content type:

   ```bash
   curl -I http://localhost:3000/uploads/gallery/seed-gallery-01.png
   ```

   Expected result: HTTP 200 with an `image/*` content type.

## QA login

All seed accounts use:

`CoosTest123!`

Recommended accounts:

- `admin.main@seed.coos.test`
- `editor.busy@seed.coos.test`
- `editor.empty@seed.coos.test`
- `customer.full@seed.coos.test`
- `customer.empty@seed.coos.test`

## Safety notes

- Do not run this seed against production or any database containing real customer data.
- Do not commit `.env`, secrets, credentials, database runtime files, or Docker
  named-volume data.
- Do not commit `backend/uploads` unless the repository policy changes
  intentionally. It is currently ignored.
- Review `@BACKEND_BASE_URL` before running the SQL in a non-default local setup.

## Important current-backend observation

The schema contains `delivered`, but the current normal final-payment approval path changes
`waiting_final_payment` directly to `completed`. The two `delivered` seed orders therefore model
an Admin override, which the current Admin transition guard allows. This keeps UI coverage honest
without pretending that `delivered` is reached by the normal payment flow.
