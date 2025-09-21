# PDF Tools Monolith - Server

Run database migrations:
- Ensure a PostgreSQL database is available and set environment variables from .env.example
- Install deps: `npm install`
- Install server deps: `npm --prefix server install`
- Migrate: `npm run migrate`

Run server:
- `npm run start:server` (port 4000)

API base: `/api`

Auth:
- POST /api/auth/register { email, password }
- POST /api/auth/login { email, password } -> sets httpOnly cookie
- POST /api/auth/logout
- GET  /api/auth/me

PDF:
- POST /api/pdf/create { title, content, fontSize }
- POST /api/pdf/compress multipart: file, level
- POST /api/pdf/merge multipart: files[], order
- POST /api/pdf/split multipart: file, ranges
- GET  /api/pdf/download?token=...

History:
- GET /api/history (auth)

Logs:
- GET /api/logs (auth)

Privacy & Security:
- File links are signed and expire.
- Logs contain minimal info.
- Uploads restricted to PDFs; size limit via env.
