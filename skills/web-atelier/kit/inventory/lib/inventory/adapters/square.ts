import { cachedFetch, env, InventoryAdapter, num, statusFrom } from "../types";

type CatalogObject = {
  id: string;
  item_data?: {
    name: string;
    variations?: { id: string; item_variation_data?: { sku?: string; price_money?: { amount: number; currency: string } } }[];
  };
};

/** Square POS: catalog items plus IN_STOCK counts summed over each item's variations.
 *  Token: Square Developer → app → Credentials → production access token (ITEMS_READ, INVENTORY_READ). */
export const square: InventoryAdapter = async () => {
  const base = process.env.SQUARE_ENV === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";
  const headers = {
    Authorization: `Bearer ${env("SQUARE_ACCESS_TOKEN")}`,
    "Square-Version": process.env.SQUARE_VERSION ?? "2025-01-23",
    "Content-Type": "application/json",
  };
  const catalog = (await (await cachedFetch(`${base}/v2/catalog/list?types=ITEM`, { headers })).json()) as {
    objects?: CatalogObject[];
  };
  const objects = catalog.objects ?? [];
  const variationIds = objects.flatMap((o) => o.item_data?.variations?.map((v) => v.id) ?? []);
  const qty = new Map<string, number>();
  if (variationIds.length) {
    const body = JSON.stringify({ catalog_object_ids: variationIds, states: ["IN_STOCK"], limit: 1000 });
    const counts = (await (await cachedFetch(`${base}/v2/inventory/counts/batch-retrieve`, { method: "POST", headers, body })).json()) as {
      counts?: { catalog_object_id: string; quantity: string }[];
    };
    for (const c of counts.counts ?? []) qty.set(c.catalog_object_id, (qty.get(c.catalog_object_id) ?? 0) + Number(c.quantity));
  }
  return objects.map((o) => {
    const variations = o.item_data?.variations ?? [];
    const tracked = variations.some((v) => qty.has(v.id));
    const quantity = tracked ? variations.reduce((sum, v) => sum + (qty.get(v.id) ?? 0), 0) : null;
    const money = variations[0]?.item_variation_data?.price_money;
    return {
      id: o.id,
      name: o.item_data?.name ?? "",
      sku: variations[0]?.item_variation_data?.sku,
      price: money ? num(money.amount / 100) : undefined,
      currency: money?.currency,
      quantity,
      status: statusFrom(quantity),
    };
  });
};
