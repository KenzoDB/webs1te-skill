import { cachedFetch, env, InventoryAdapter, num, statusFrom } from "../types";

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  totalInventory: number | null;
  productType: string;
  onlineStoreUrl: string | null;
  featuredImage: { url: string } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

/** Shopify Storefront API. The token needs unauthenticated_read_product_listings
 *  (and unauthenticated_read_product_inventory for quantities; without it only in/out is known). */
export const shopify: InventoryAdapter = async () => {
  const domain = env("SHOPIFY_STORE_DOMAIN");
  const version = process.env.SHOPIFY_API_VERSION ?? "2025-01";
  const query = `{ products(first: 250) { nodes { id title handle availableForSale totalInventory productType
    onlineStoreUrl featuredImage { url } priceRange { minVariantPrice { amount currencyCode } } } } }`;
  const res = await cachedFetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": env("SHOPIFY_STOREFRONT_TOKEN") },
    body: JSON.stringify({ query }),
  });
  const { data } = (await res.json()) as { data: { products: { nodes: ProductNode[] } } };
  return data.products.nodes.map((p) => ({
    id: p.id,
    name: p.title,
    price: num(p.priceRange.minVariantPrice.amount),
    currency: p.priceRange.minVariantPrice.currencyCode,
    quantity: p.totalInventory,
    status: p.totalInventory === null ? statusFrom(null, p.availableForSale) : statusFrom(p.totalInventory),
    category: p.productType || undefined,
    image: p.featuredImage?.url,
    url: p.onlineStoreUrl ?? `https://${domain}/products/${p.handle}`,
  }));
};
