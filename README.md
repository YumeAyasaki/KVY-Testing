# KVY

A seller/admin document verification dashboard built with an Express backend, Prisma/Postgres data layer, and a Next.js frontend.

## What I built

### Working
- Backend Express API with JWT login and role-based auth.
- Seller flow: login, upload a document file, list documents for the current seller.
- Admin flow: login, view all documents, and update document status.
- Database schema with Prisma models for `User`, `Seller`, `Document`, and `VerificationAttempt`.
- Asynchronous verification worker using `pg-boss` that creates automated verification attempts and updates document status after upload.
- File uploads stored locally under `backend/src/public/uploads`.
- Separate backend and frontend packages for clean local development.

### Partially working / known issues
- Frontend auth token parsing is currently broken: `frontend/app/lib/auth.ts` decodes the JWT header instead of the payload. That means role-based routing and seller-id retrieval may fail in the browser.
- There is no frontend user registration or seeded admin/seller account flow; users must be created manually via the database interaction.
- The seller page only supports verification uploads and document status viewing; it does not implement any actual marketplace selling flow.
- The admin UI updates document status, but the verification attempts list is not surfaced in the frontend.

### Not built
- No public deployment or hosting configuration is included.
- No seeded login accounts are provided in the current repository.
- No registration/signup UI.
- No admin-level user management UI.
- No production-ready authentication hardening (passwords are stored as plaintext in the current backend).

## What I'd build next (2 hours)

1. Fix frontend auth parsing so `getPayload()` decodes the JWT payload correctly.
   - This is critical because the admin/seller pages depend on role and `sellerId` from the token.
2. Add a simple registration or seed script for a test `ADMIN` and `SELLER` user.
   - That makes the app demoable without manual DB work.
3. Improve the seller UI to show verification attempt history alongside documents.
   - That would close the loop between upload, worker verification, and admin review.

## How to run it

### Prerequisites
- Node.js 16+ installed.
- PostgreSQL running locally on `localhost:5432`.
- `npm` available.

### Start the database

From the repo root, run:

```bash
docker run --name kvy_db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=kvy_db -p 5432:5432 -d postgres
```

If you already have Postgres running, ensure the connection matches `backend/config/.env.development`:

```env
DATABASE_URL="postgresql://admin:admin123@localhost:5432/kvy_db?schema=public"
```

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend listens on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Notes
- The frontend uses `NEXT_PUBLIC_API_BASE_URL` if set; otherwise it calls `/api`.
- Backend dev mode is configured with `backend/config/.env.development`.

## API endpoints

- `POST /api/auth/login` — login with `{ username, password }`
- `GET /api/sellers/documents/all` — seller document list
- `POST /api/sellers/documents/add` — seller document upload (`multipart/form-data`)
- `GET /api/admin/documents/all` — admin document list
- `PUT /api/admin/documents/update` — admin update document status

## Test credentials

There are no seeded users in this repository yet. Create one manually by inserting into the `User` table.

Example manual SQL commands:

```sql
INSERT INTO "User" (id, username, password, "Role") VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'admin123', 'ADMIN');
INSERT INTO "User" (id, username, password, "Role") VALUES ('00000000-0000-0000-0000-000000000002', 'seller', 'seller123', 'SELLER');
```

To make a seller account useful, also create a corresponding `Seller` row:

```sql
INSERT INTO "Seller" (id, email, "companyName") VALUES ('00000000-0000-0000-0000-000000000010', 'seller@example.com', 'Demo Seller');
```

Then login with:
- Admin: `admin` / `admin123`
- Seller: `seller` / `seller123`

## Deployment

No production deployment URL is available from this repository at the moment.