import "server-only";
import type { InventoryAdapter, InventoryItem } from "./types";
import { csv } from "./adapters/csv";
import { json } from "./adapters/json";
import { fromRows } from "./adapters/rows";
import { shopify } from "./adapters/shopify";
import { square } from "./adapters/square";
import { supabase } from "./adapters/supabase";
import { woocommerce } from "./adapters/woocommerce";
import demo from "@/content/inventory.demo.json";

export type { InventoryItem, StockStatus } from "./types";

const adapters: Record<string, InventoryAdapter> = {
  csv,
  sheets: csv,
  json,
  supabase,
  shopify,
  woocommerce,
  square,
  demo: async () => fromRows(demo),
};

/** All items from INVENTORY_SOURCE (csv | sheets | json | supabase | shopify | woocommerce | square | demo).
 *  Never throws: on failure it logs and returns [] so the page still renders. */
export async function getInventory(): Promise<InventoryItem[]> {
  const source = (process.env.INVENTORY_SOURCE ?? "demo").toLowerCase();
  const adapter = adapters[source];
  if (!adapter) {
    console.error(`inventory: unknown INVENTORY_SOURCE "${source}"`);
    return [];
  }
  try {
    return await adapter();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function findItems(query: string): Promise<InventoryItem[]> {
  const q = query.trim().toLowerCase();
  const items = await getInventory();
  return q ? items.filter((i) => [i.name, i.sku, i.category].some((v) => v?.toLowerCase().includes(q))) : items;
}
