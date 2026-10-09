# Accountable — Document Processing Platform

## Stack

- **Backend**: Node.js + Fastify + TypeScript + Prisma + MySQL
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Storage**: local disk (`apps/api/storage`, default) or MinIO/S3 (`STORAGE_DRIVER=minio`)
- **Auth**: JWT (httpOnly cookies) + bcrypt
- **State**: TanStack Query (server) + Zustand (client)
- **Monorepo**: pnpm workspaces

## Project Structure

```
apps/
  api/       — REST API (Fastify, Clean Architecture)
  client/    — Client area (React + Vite)
  admin/     — Admin area (React + Vite)
  landing/   — Landing page (React + Vite)

packages/
  types/     — Shared TypeScript types
  schemas/   — Shared Zod schemas
  ui/        — Shared UI components
  config/    — Shared configs (tsconfig, eslint)

docker/      — Docker Compose for local dev (MySQL + MinIO + MailHog)
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local services (MySQL + MinIO + MailHog)
docker compose -f docker/compose.yml up -d

# Run database migrations
pnpm --filter api db:migrate

# Seed database (roles + permissions)
pnpm --filter api db:seed

# Start all apps in development
pnpm dev
```

## System Dependencies

### OCR (optional)

The admin panel includes an OCR feature that extracts text from PDF documents.
It requires `pdftotext`, part of the **poppler-utils** package.

```bash
# Ubuntu / Debian
sudo apt-get install -y poppler-utils

# macOS (Homebrew)
brew install poppler
```

Without `pdftotext`, the OCR endpoint falls back to partial raw-text extraction
and logs a warning — no other functionality is affected.

## Environment Variables

Copy `.env.example` to `.env` in each app directory and fill in the values.

Real process environment variables always take precedence over `.env` files.

| Variable | Notes |
| --- | --- |
| `NODE_ENV` | Only `development`/`test` disable production safeguards. **Unset = production.** |
| `TRUST_PROXY` | `false` (default) \| `true` \| hop count \| comma-separated proxy IPs/CIDRs. Keep `false` if the API is exposed directly, otherwise client IPs can be spoofed. |
| `UPLOAD_TOKEN_ENCRYPTION_KEY` | ≥ 32 chars. Encrypts public upload-session tokens so admins can re-copy links. Required outside dev/test. |
| `STORAGE_DRIVER` | `local` (default: files in `LOCAL_STORAGE_PATH`, default `apps/api/storage`) or `minio`. |
| `STORAGE_SIGNING_SECRET` | ≥ 32 chars. Signs the 15-minute download links for locally stored files. Required outside dev/test when `STORAGE_DRIVER=local`. |
| `OTP_SECRET` | ≥ 32 chars. HMAC key for the 6-digit email codes (account activation, password reset, invitations). Required outside dev/test. |
| `UPLOAD_SESSION_TTL_DAYS` | Default validity of public upload links (default 30, max 365). |
| `RATE_LIMIT_GLOBAL_MAX` / `RATE_LIMIT_TOKEN_MAX` | Global and token-endpoint (verify/set/reset password, refresh) rate limits. |

In production the API refuses to start if JWT/cookie/encryption/OTP secrets or MinIO credentials are missing, default or too short.

The email server (Gmail or any SMTP) can also be configured in the admin panel (Definições → Servidor de Email);
when enabled there, it takes precedence over the `SMTP_*` variables. Passwords are stored encrypted.

## Tests

```bash
pnpm test:unit          # API unit tests (no external services)
pnpm test:integration   # API against real MySQL + MinIO + MailHog (starts its own API on :3101)
pnpm test:e2e           # Playwright: client, admin and landing (starts API + 3 frontends)
pnpm test:all           # typecheck + all of the above
```

Integration and E2E tests need MySQL and MailHog running (`docker compose -f docker/compose.yml up -d mysql mailhog`)
with migrations applied and the seed loaded. MinIO is only needed with `STORAGE_DRIVER=minio`
(then `TEST_MINIO_PORT` / `TEST_MINIO_ACCESS_KEY` / `TEST_MINIO_SECRET_KEY` can point the tests at it).

E2E starts its own API and frontends; if you already have `pnpm dev` running, use `E2E_REUSE_SERVERS=1 pnpm test:e2e`.

## Rules

- **ZERO `any`** in TypeScript — see `.agents/GEMINI.md`
- Clean Architecture enforced in `apps/api`
- File uploads go to the storage driver (local disk by default), never MySQL; downloads use signed, expiring links
- RBAC checked on every protected endpoint
- Audit log on every write operation
