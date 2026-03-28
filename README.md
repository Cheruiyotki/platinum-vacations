# Platinum Vacations PERN SPA

Production-style single-page web application for Platinum Vacations (Kenya), built with:

- PostgreSQL
- Express
- React
- Node.js
- Tailwind CSS

## 1) Project Structure

```text
travel/
  client/
  server/
  package.json
```

## 2) Backend Setup

1. Create and configure environment file:

```bash
cd server
copy .env.example .env
```

2. Update `DATABASE_URL` in `server/.env` with your Neon connection string.

Example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@EP-XXXX-XXXX-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
PGSSLMODE=require
```

3. Install backend dependencies and run schema + seed directly against Neon:

```bash
npm install
npm run db:migrate
```

4. Start backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

## 3) Frontend Setup

1. Create environment file:

```bash
cd client
cp .env.example .env
```

2. Install and run:

```bash
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## 4) Root Workspace Commands

From project root:

```bash
npm install
npm run install:all
npm run dev
```

If you already configured `server/.env` with Neon, seed DB once with:

```bash
npm run db:migrate --prefix server
```

## 5) Brand Assets

Place provided source images inside:

- `client/public/assets/image_0.png`
- `client/public/assets/image_1.png`
- `client/public/assets/image_2.png`
- `client/public/assets/image_3.png`
- `client/public/assets/image_4.png`
- `client/public/assets/image_5.png`
- `client/public/assets/image_6.png`

The UI is prewired to these asset paths and includes fallback imagery if files are missing.

## 6) API Endpoint

- `GET /api/packages` -> returns seeded travel packages with includes/excludes JSON arrays and deposit requirements.
