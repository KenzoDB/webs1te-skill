import { cachedFetch, env, InventoryAdapter } from "../types";
import { fromRows } from "./rows";

/** Any JSON endpoint returning an array (or { items | products: [...] }) of rows with the standard columns.
 *  Optional INVENTORY_JSON_TOKEN is sent as a Bearer token, server-side only. */
export const json: InventoryAdapter = async () => {
  const token = process.env.INVENTORY_JSON_TOKEN;
  const res = await cachedFetch(env("INVENTORY_JSON_URL"), token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const data = await res.json();
  return fromRows(Array.isArray(data) ? data : (data.items ?? data.products ?? []));
};
