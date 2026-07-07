# Fatistic Ventures — Implementation Plan (approved)

## Information Gathered

- Repo currently has: `package.json`, `next.config.ts` (Cloudinary remote images domain `res.cloudinary.com`), `tailwind.config.ts` (custom luxury palette + glass shadows/radius), `src/lib/db.ts` (MongoDB connection cache).
- Attempted searches for existing models/components/routes via tool listing: only `src/lib/db.ts` exists under `src/`.
- Therefore we will scaffold the rest of the project structure from scratch to satisfy requirements.

## Plan (detailed, file level)

### Phase A — Core backend/data

1. Create `/src/models`:
    - `Product.js`
    - `AdminUser.js`
    - `AnalyticsEvent.js`
2. Update `/src/lib/db.js` if needed for consistent exports (keep `connectDB`).

### Phase B — UI primitives & Tailwind conventions

3. Create `/src/components/ui/` primitives:
    - `GlassPanel.js`, `GlassCard.js`, `GlassButton.js`, `GlassInput.js`, `GlassModal.js`
    - A shared `cn` helper in `/src/lib/cn.js`

4. Ensure global styles/fonts:
    - Create `/src/app/layout.js` (App Router) and `/src/app/globals.css` with Tailwind directives.
    - Load luxury fonts via `next/font/google` (e.g. Playfair Display for headings + Inter for UI).

### Phase C — Cloudinary + Upload API

5. Create `/src/lib/cloudinary.js` (server-side Cloudinary SDK init via env vars).
6. Create `/src/app/api/upload/route.js`:
    - Accept multipart form-data image
    - Upload to Cloudinary
    - Return `{ url, publicId }`

### Phase D — Product APIs

7. Create `/src/app/api/products/route.js`:
    - GET: list products (optionally filters)
    - POST: create product
8. Create `/src/app/api/products/[id]/route.js`:
    - GET single product
    - PUT update product + manage image updates
    - DELETE delete product and remove Cloudinary images by `publicId`

### Phase E — Analytics APIs

9. Create `/src/lib/analytics.js` helper:
    - track event (page_view/product_view/whatsapp_click)
10. Create `/src/app/api/analytics/track/route.js` and `/src/app/api/analytics/summary/route.js`.

### Phase F — WhatsApp integration

11. Create `/src/lib/whatsapp.js` for dynamic `wa.me` links.
12. Update storefront product detail to:

- Fire `whatsapp_click` when user clicks order button.

### Phase G — Storefront pages

13. Create App Router pages:

- `/src/app/page.js` Home
- `/src/app/shop/page.js` Catalog with filters/search
- `/src/app/shop/[id]/page.js` Product detail with gallery + WhatsApp order
- `/src/app/about/page.js`
- `/src/app/contact/page.js`

### Phase H — Admin auth + dashboard

14. Create admin auth:

- `/src/lib/auth.js` (JWT helpers)
- `/src/app/api/auth/login/route.js`
- `/src/app/api/auth/me/route.js` (optional)

15. Create protected `/src/app/admin/page.js` and admin subroutes:

- `/src/app/admin/products/*` (list/create/edit/delete)
- `/src/app/admin/analytics/page.js`

16. Analytics charts via Recharts.

### Phase I — Seed script

17. Create `/src/scripts/seed.js` (or `.ts` avoided; must be JS):

- ConnectDB
- Insert sample products with placeholder images (or skip images if none).

### Non-functional

- JavaScript only (no TS): ensure no `*.ts` files created.
- Use env vars for secrets.
- Glassmorphism via Tailwind utilities.

## Dependent Files to be edited

- New files only (since currently repo has minimal code besides DB/Tailwind).

## Followup steps (after coding)

- Install deps (if missing) and run `npm run dev`.
- Run seed `npm run seed`.
- Validate image upload to Cloudinary with `/api/upload`.
- Validate product CRUD + deletion cleans Cloudinary.
- Validate analytics track + admin summary.
