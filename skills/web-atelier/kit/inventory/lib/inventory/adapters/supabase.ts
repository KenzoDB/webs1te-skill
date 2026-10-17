import { cachedFetch, env, InventoryAdapter } from "../types";
import { fromRows } from "./rows";

/** Supabase (PostgREST) table with the standard columns. Use the anon key plus a read-only RLS policy. */
export const supabase: InventoryAdapter = async () => {
  const key = env("SUPABASE_ANON_KEY");
  const table = process.env.INVENTORY_TABLE ?? "products";
  const res = await cachedFetch(`${env("SUPABASE_URL")}/rest/v1/${table}?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return fromRows(await res.json());
};
