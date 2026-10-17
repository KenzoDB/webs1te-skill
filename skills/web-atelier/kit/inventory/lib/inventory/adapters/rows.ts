import { InventoryItem, num, statusFrom, StockStatus } from "../types";

const STATUS: Record<string, StockStatus> = {
  in_stock: "in_stock", instock: "in_stock", yes: "in_stock", si: "in_stock", "sí": "in_stock",
  available: "in_stock", disponible: "in_stock", en_stock: "in_stock",
  low: "low", pocas: "low", last: "low", ultimas: "low", "últimas": "low",
  out: "out", outofstock: "out", out_of_stock: "out", no: "out", agotado: "out", sold_out: "out",
  backorder: "backorder", onbackorder: "backorder", encargo: "backorder", bajo_pedido: "backorder", preorder: "backorder",
};

/** Maps loose rows (CSV, JSON, Supabase) with columns
 *  id, name, sku, price, currency, quantity|stock, status, category, image, url (case-insensitive). */
export function fromRows(rows: Record<string, unknown>[]): InventoryItem[] {
  return rows
    .map((raw, i): InventoryItem => {
      const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.trim().toLowerCase(), v]));
      const quantity = num(r.quantity ?? r.stock ?? r.qty) ?? null;
      const declared = STATUS[String(r.status ?? "").trim().toLowerCase().replace(/\s+/g, "_")];
      return {
        id: String(r.id || r.sku || i),
        name: String(r.name ?? r.title ?? "").trim(),
        sku: r.sku ? String(r.sku) : undefined,
        price: num(r.price),
        currency: r.currency ? String(r.currency) : undefined,
        quantity,
        status: declared ?? statusFrom(quantity),
        category: r.category ? String(r.category) : undefined,
        image: r.image ? String(r.image) : undefined,
        url: r.url ? String(r.url) : undefined,
      };
    })
    .filter((item) => item.name);
}
