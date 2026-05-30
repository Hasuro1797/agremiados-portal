"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentPreview } from "@/types/payment.type";
import { BadgePercent } from "lucide-react";

interface PaymentBreakdownProps {
  preview: PaymentPreview | null;
  loading: boolean;
  /** Optional fallback total shown while the preview hasn't loaded yet. */
  fallbackSubtotal?: number;
  /** Render the per-line breakdown (set false when the parent already shows it). */
  showLines?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function PaymentBreakdown({
  preview,
  loading,
  fallbackSubtotal,
  showLines = false,
}: PaymentBreakdownProps) {
  if (loading && !preview) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="space-y-1">
        {fallbackSubtotal !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(fallbackSubtotal)}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-400">
          El monto final con descuentos se calcula al generar el pago.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLines &&
        preview.lines.map((line, i) => (
          <div
            key={`${line.label}-${i}`}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-600">
              {line.label}
              {line.quantity > 1 && (
                <span className="text-gray-400">
                  {" "}
                  ({line.quantity} × {formatCurrency(line.unitAmount)})
                </span>
              )}
            </span>
            <span className="font-medium text-primary">
              {formatCurrency(line.amount)}
            </span>
          </div>
        ))}

      {showLines && <Separator />}

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-primary">
          {formatCurrency(preview.subtotal)}
        </span>
      </div>

      {preview.discount && preview.discount.amount > 0 && (
        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-1.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <BadgePercent className="size-3.5" />
            {preview.discount.name} ({preview.discount.percentage}%)
          </span>
          <span className="text-sm font-semibold text-green-700">
            -{formatCurrency(preview.discount.amount)}
          </span>
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">Total a pagar</span>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(preview.total)}
        </span>
      </div>

      {preview.igv && preview.igv.amount > 0 && (
        <p className="text-right text-xs text-gray-400">
          Incluye IGV ({Math.round(preview.igv.rate * 100)}%):{" "}
          {formatCurrency(preview.igv.amount)}
        </p>
      )}

      {loading && (
        <p className="text-right text-[10px] text-gray-400">Actualizando…</p>
      )}
    </div>
  );
}
