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

## Important current-backend observation

The schema contains `delivered`, but the current normal final-payment approval path changes
`waiting_final_payment` directly to `completed`. The two `delivered` seed orders therefore model
an Admin override, which the current Admin transition guard allows. This keeps UI coverage honest
without pretending that `delivered` is reached by the normal payment flow.
