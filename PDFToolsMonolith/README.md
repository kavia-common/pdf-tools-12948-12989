# PDF Tools Monolith

A modern React + Node.js monolith for PDF manipulation with PostgreSQL storage.

## Features
- Create PDFs from text (with live preview)
- Compress PDFs (levels: low/medium/high)
- Merge multiple PDFs with reordering
- Split PDFs by pages/ranges
- Optional user authentication (email/password)
- File history per user with expiring download links
- Logs and basic monitoring
- Help/resources UI
- Privacy-first: signed download links, limited logging, periodic cleanup

## Quick Start

1) Configure environment
- Copy `.env.example` to `.env` and set values (PostgreSQL, JWT secret, etc.)
- Ensure PostgreSQL is running and database exists.

2) Install
- `npm install`
- This also installs server dependencies (postinstall hook).
- Run migrations: `npm run migrate`

3) Run
- Backend: `npm run start:server` (port 4000)
- Frontend: `npm start` (port 3000, proxy to server)

Or run both concurrently (requires DB already configured):
- `npm run dev`

4) Build client
- `npm run build`

## API
See SERVER_README.md for endpoint details.

## Security & Compliance
- httpOnly cookies for auth
- Server-side sessions with expiration
- File uploads restricted to PDFs and size-limited
- Download links signed and time-limited
- Logs stored in DB with minimal content
- Use environment variables; never commit secrets

## Premium Gating
The schema includes `is_premium`. Use it to gate advanced capabilities if desired.

