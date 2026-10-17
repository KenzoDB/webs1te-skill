import type { StockStatus } from "@/lib/inventory/types";

const DEFAULT_LABELS: Record<StockStatus, string> = {
  in_stock: "In stock",
  low: "Last units",
  out: "Out of stock",
  backorder: "On order",
  unknown: "Ask us",
};

/** Presentational badge. Style it per DESIGN.md through [data-stock] selectors; pass labels from site.ts. */
export default function StockBadge({
  status,
  quantity,
  labels = DEFAULT_LABELS,
  showQuantity = false,
  className,
}: {
  status: StockStatus;
  quantity?: number | null;
  labels?: Record<StockStatus, string>;
  showQuantity?: boolean;
  className?: string;
}) {
  return (
    <span data-stock={status} className={className}>
      <span aria-hidden="true" data-stock-dot />
      {labels[status]}
      {showQuantity && status === "low" && quantity ? ` · ${quantity}` : null}
    </span>
  );
}
