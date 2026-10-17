import { revalidateTag } from "next/cache";

/** Webhook for instant stock updates:
 *  POST /api/inventory/revalidate?secret=<INVENTORY_WEBHOOK_SECRET>  (or header x-webhook-secret)
 *  Callers: Shopify / WooCommerce / Square webhooks, a Google Apps Script onEdit trigger, a Supabase database webhook. */
export async function POST(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret") ?? req.headers.get("x-webhook-secret");
  if (!process.env.INVENTORY_WEBHOOK_SECRET || secret !== process.env.INVENTORY_WEBHOOK_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag("inventory", { expire: 0 }); // stock must never be served stale
  return Response.json({ ok: true, revalidated: "inventory" });
}
