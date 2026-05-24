"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BillingFormData, QuotaPayment } from "@/types/payment.type";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CircleX, Loader2, ReceiptText, TriangleAlert } from "lucide-react";
import BillingSection, { isBillingValid } from "./BillingSection";

interface QuotaConfigStepProps {
  quotas: QuotaPayment[];
  loading: boolean;
  error: boolean;
  selectedIds: number[];
  onToggle: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  billing: BillingFormData;
  onBillingChange: (data: BillingFormData) => void;
  onPay: () => void;
  paying: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

const formatPeriod = (year: number, month: number) => {
  const date = parse(`${year}-${String(month).padStart(2, "0")}`, "yyyy-MM", new Date());
  return format(date, "MMMM yyyy", { locale: es });
};

export default function QuotaConfigStep({
  quotas,
  loading,
  error,
  selectedIds,
  onToggle,
  onToggleAll,
  billing,
  onBillingChange,
  onPay,
  paying,
}: QuotaConfigStepProps) {
  const subtotal = quotas
    .filter((q) => selectedIds.includes(q.id))
    .reduce((acc, q) => acc + q.period.amount, 0);

  const allSelected = quotas.length > 0 && selectedIds.length === quotas.length;
  const canPay = selectedIds.length > 0 && isBillingValid(billing) && !paying;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <CircleX className="size-10 text-red-500" />
        <p className="max-w-md text-sm text-primary">
          Ocurrió un error al cargar tus cuotas. Inténtalo de nuevo más tarde o
          comunícate con soporte.
        </p>
      </div>
    );
  }

  if (quotas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ReceiptText className="size-10 text-primary/40" />
        <p className="text-base font-semibold text-primary">
          Estás al día con tus cuotas
        </p>
        <p className="max-w-sm text-sm text-gray-500">
          No tienes cuotas pendientes de pago en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-bold text-primary">
            Cuotas pendientes
          </CardTitle>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onToggleAll(checked === true)}
              className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
            />
            Seleccionar todas
          </label>
        </CardHeader>
        <CardContent className="space-y-2">
          {quotas.map((quota) => {
            const checked = selectedIds.includes(quota.id);
            return (
              <label
                key={quota.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-gray-100 hover:border-gray-200",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(quota.id)}
                  className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary capitalize">
                    {formatPeriod(quota.period.year, quota.period.month)}
                  </p>
                  {quota.isOverdue && (
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <TriangleAlert className="size-3" />
                      Vencida
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {formatCurrency(quota.period.amount)}
                </span>
              </label>
            );
          })}

          <Separator className="my-2" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Subtotal ({selectedIds.length}{" "}
              {selectedIds.length === 1 ? "cuota" : "cuotas"})
            </span>
            <span className="text-base font-bold text-primary">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Los descuentos aplicables se calculan al confirmar el pago.
          </p>
        </CardContent>
      </Card>

      <BillingSection value={billing} onChange={onBillingChange} />

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!canPay}
          onClick={onPay}
          className="font-semibold bg-accent hover:bg-accent-hover"
        >
          {paying && <Loader2 className="mr-2 size-4 animate-spin" />}
          Pagar
        </Button>
      </div>
    </div>
  );
}
