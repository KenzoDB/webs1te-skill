# Live stock — "is it in stock?" on the website

Kit: `kit/inventory` (installed by `scaffold.mjs --inventory`). Server-only module, cached fetch,
refresh every `INVENTORY_REVALIDATE` s (default 60) and instantly through a webhook. The page never
breaks: if the source fails, the list is empty and the error is logged.

```
src/lib/inventory/index.ts        getInventory(), findItems(q)   ← use in Server Components only
src/lib/inventory/types.ts        InventoryItem, StockStatus (in_stock | low | out | backorder | unknown)
src/lib/inventory/adapters/*      csv(sheets) · json · supabase · shopify · woocommerce · square · demo
src/app/api/inventory/revalidate  POST webhook → revalidateTag("inventory", { expire: 0 })
src/components/inventory/StockBadge.tsx   <StockBadge status quantity labels showQuantity />
src/content/inventory.demo.json   demo data used while INVENTORY_SOURCE=demo
.env.example                      every variable, commented
```

## When to add it

Add it if BRIEF.md shows any of: sells physical products, "sold out / back in stock" posts on
Instagram, customers asking "do you have X?" in reviews/comments, a shop/catalogue, ordering by phone.
Otherwise skip (no dead features).

## Choosing the source (decision order)

| Business already uses | INVENTORY_SOURCE | Effort for the owner |
| --- | --- | --- |
| Shopify | `shopify` | create a Storefront token (5 min) |
| WooCommerce | `woocommerce` | create a read-only REST key (5 min) |
| Square POS | `square` | create an access token (10 min) |
| Another POS/ERP with an export or API (e.g. bookstore systems, Holded, Odoo, Loyverse) | `json` if it has a JSON endpoint/API, else `csv` from its scheduled export | varies |
| Nothing / paper / Excel | `sheets` — a Google Sheet they edit from the phone | 10 min, zero cost |
| Wants a real database later | `supabase` | 20 min |

Default for small businesses: **`sheets`**. Sheet columns (first row, exact names, any order):
`id | name | category | price | currency | quantity | status | image | url`.
Either `quantity` (number) or `status` (in_stock, low, out, backorder, or Spanish: disponible, últimas,
agotado, bajo pedido) is enough.

## Building the UI (one sonnet agent, owns `src/components/sections/Stock*.tsx`)

- Server Component section calls `getInventory()` and renders the catalogue/highlights per DESIGN.md.
- Search/filter: a small client component receiving the items as props (no client fetch of secrets).
- Labels from `site.ts` (`site.stock.labels`), styled with `[data-stock="out"]` etc. using tokens.
- Out-of-stock items stay visible (greyed, "notify me / ask us" CTA to WhatsApp/email from BRIEF) —
  customers still learn the shop carries them.
- Show "Updated every minute" microcopy; never claim real-time unless the webhook is configured.
- Never expose quantities if the owner prefers not to: `showQuantity` false by default.

## Instant updates (optional webhook)

Set `INVENTORY_WEBHOOK_SECRET`, then point the source to
`https://<domain>/api/inventory/revalidate?secret=<secret>`:
- Shopify: Settings → Notifications → Webhooks → "Inventory level update" + "Product update".
- WooCommerce: Settings → Advanced → Webhooks → "Product updated".
- Square: Developer dashboard → Webhooks → `inventory.count.updated`.
- Google Sheets: Extensions → Apps Script → an `onEdit` installable trigger that `UrlFetchApp.fetch(url, {method:"post"})`.
- Supabase: Database → Webhooks → on UPDATE of the table.

## Security

All tokens are server-side env vars (never `NEXT_PUBLIC_`). Use read-only keys. The Google Sheet is
published as CSV, so it must contain only public data (no costs, suppliers, customer data).
