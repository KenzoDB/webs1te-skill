export type StockStatus = "in_stock" | "low" | "out" | "backorder" | "unknown";

export type InventoryItem = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  currency?: string;
  /** null when the source only says available / not available */
  quantity: number | null;
  status: StockStatus;
  category?: string;
  image?: string;
  url?: string;
};

export type InventoryAdapter = () => Promise<InventoryItem[]>;

export const LOW_STOCK = Number(process.env.INVENTORY_LOW_STOCK ?? 3);

/** Cached fetch: refreshed every INVENTORY_REVALIDATE seconds and on the "inventory" tag webhook. */
export async function cachedFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    next: { revalidate: Number(process.env.INVENTORY_REVALIDATE ?? 60), tags: ["inventory"] },
  });
  if (!res.ok) throw new Error(`inventory: ${res.status} ${res.statusText} from ${new URL(url).host}`);
  return res;
}

export function statusFrom(quantity: number | null, available?: boolean): StockStatus {
  if (quantity === null) return available === undefined ? "unknown" : available ? "in_stock" : "out";
  if (quantity <= 0) return "out";
  return quantity <= LOW_STOCK ? "low" : "in_stock";
}

export function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`inventory: missing env ${name}`);
  return v;
}
