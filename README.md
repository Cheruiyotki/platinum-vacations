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
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

2. Update `DATABASE_URL` in `server/.env` with your Neon connection string.

Example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@EP-XXXX-XXXX-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
PGSSLMODE=require
```

For M-Pesa STK Push, also configure these in `server/.env`:

```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_SHORTCODE=4619122
MPESA_PASSKEY=your_lipa_na_mpesa_online_passkey
MPESA_CALLBACK_URL=https://your-public-domain.com/api/payments/callback
MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline
```

`MPESA_CALLBACK_URL` must be a public HTTPS URL that Safaricom can reach.

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

PowerShell alternative:

```powershell
Copy-Item .env.example .env
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

- `client/public/assets/image_0.png` or `image_0.jpg`
- `client/public/assets/image_1.png` or `image_1.jpg`
- `client/public/assets/image_2.png` or `image_2.jpg`
- `client/public/assets/image_3.png` or `image_3.jpg`
- `client/public/assets/image_4.png` or `image_4.jpg`
- `client/public/assets/image_5.png` or `image_5.jpg`
- `client/public/assets/image_6.png` or `image_6.jpg` or `image_6.webp`

The UI is prewired to these asset paths and includes fallback imagery if files are missing.

## 6) Admin Section

Open the admin workspace at:

```text
http://localhost:5173/admin
```

Use the **Back To Website** button to return to the public site. The admin screen is organized with a left navigation on desktop and a **Menu** button on mobile.

The admin section works like this:

- **Dashboard** shows booking totals, pending balances, upcoming visible adventures, recent messages, and STK push health.
- **Adventures** creates, edits, hides, shows, and deletes travel packages. Visible adventures appear on the public packages section; hidden ones stay available in admin only.
- **Bookings** lists customer bookings created from payment activity, including the adventure, booking option, amount paid, balance, phone, and status.
- **Payments** tracks M-Pesa/STK records, payment references, success/pending/failed status, and remaining balances.
- **Customers** shows customer profiles, latest booked adventure, progress, phone, and notes.
- **Reviews** approves, unapproves, or removes submitted testimonials. Only approved reviews appear on the public website.
- **Gallery** previews homepage gallery images, hides or shows them, and moves them up or down in the public display order.
- **Messages / AI** summarizes recent assistant or customer message topics so admins can see common questions and unanswered requests.
- **Content** updates public website copy for the About section, contact phones, footer email, payment instructions, and footer links.
- **Announcements** creates admin-managed notices with Draft, Active, or Sold Out status.
- **Promo Codes** creates seasonal offer codes and marks them Active or Paused.
- **Reports** shows booking and payment-performance snapshots generated from current booking data.

Admin data is stored in PostgreSQL. Run the migration/seed before using the dashboard:

```bash
npm run db:migrate --prefix server
```

The admin UI calls these backend areas:

- `GET /api/admin/dashboard`
- `GET /api/packages/admin`
- `POST /api/packages`, `PUT /api/packages/:id`, `PATCH /api/packages/:id/visibility`, `DELETE /api/packages/:id`
- `GET /api/reviews/admin`, `PATCH /api/reviews/:id/approval`, `DELETE /api/reviews/:id`
- `PUT /api/admin/content`
- `POST /api/admin/announcements`
- `POST /api/admin/promos`
- `PATCH /api/admin/gallery/:id/visibility`
- `POST /api/admin/gallery/reorder`

The project currently exposes `/admin` and the admin API without a built-in login screen. Before deploying publicly, protect the admin route and admin API with your host, reverse proxy, or an authentication layer.

## 7) API Endpoints

- `GET /api/packages` -> returns seeded travel packages with includes/excludes JSON arrays and deposit requirements.
- `POST /api/payments/stk-push` -> sends a Safaricom STK Push prompt to the selected phone number.
- `GET /api/reviews` -> returns approved public reviews.
- `POST /api/reviews` -> submits a review for admin approval.
- `GET /api/site/gallery` -> returns visible public gallery items.
- `GET /api/site/content` -> returns public site copy managed from admin.
