import { cachedFetch, env, InventoryAdapter, num, statusFrom } from "../types";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: string;
  permalink: string;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  images: { src: string }[];
  categories: { name: string }[];
};

/** WooCommerce REST API v3 with a READ-only consumer key (WooCommerce → Settings → Advanced → REST API). */
export const woocommerce: InventoryAdapter = async () => {
  const auth = Buffer.from(`${env("WC_CONSUMER_KEY")}:${env("WC_CONSUMER_SECRET")}`).toString("base64");
  const res = await cachedFetch(`${env("WC_STORE_URL")}/wp-json/wc/v3/products?per_page=100&status=publish`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return ((await res.json()) as Product[]).map((p) => ({
    id: String(p.id),
    name: p.name,
    sku: p.sku || undefined,
    price: num(p.price),
    currency: process.env.INVENTORY_CURRENCY,
    quantity: p.stock_quantity,
    status:
      p.stock_status === "onbackorder"
        ? "backorder"
        : p.stock_quantity === null
          ? statusFrom(null, p.stock_status === "instock")
          : statusFrom(p.stock_quantity),
    category: p.categories[0]?.name,
    image: p.images[0]?.src,
    url: p.permalink,
  }));
};
