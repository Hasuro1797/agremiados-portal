"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IZIPAY_CONTAINER_ID } from "@/lib/izipay";
import { cn } from "@/lib/utils";
import { ChevronLeft, Clock, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PaymentFormStepProps {
  amount?: number;
  orderNumber?: string;
  expiresAt?: string;
  onCancel: () => void;
  onExpire: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

const formatMMSS = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function PaymentFormStep({
  amount,
  orderNumber,
  expiresAt,
  onCancel,
  onExpire,
}: PaymentFormStepProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    expiredRef.current = false;

    const tick = () => {
      const secs = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const low = remaining !== null && remaining <= 60;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-bold text-primary">
            Completa tu pago
          </CardTitle>
          {amount !== undefined && amount > 0 && (
            <span className="text-base font-bold text-primary">
              {formatCurrency(amount)}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="size-4 text-green-600" />
              Pago seguro procesado por Izipay.
            </p>
            {remaining !== null && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  low
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                <Clock className="size-3.5" />
                {formatMMSS(remaining)}
              </span>
            )}
          </div>

          {/* Izipay Web-Core mounts the embedded card form inside this node. */}
          <div
            id={IZIPAY_CONTAINER_ID}
            className="min-h-[320px] w-full rounded-xl"
          />

          {orderNumber && (
            <p className="text-center text-[11px] text-gray-400">
              Orden {orderNumber}
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        onClick={onCancel}
        className="text-gray-600 hover:text-primary"
      >
        <ChevronLeft className="mr-1 size-4" />
        Cancelar y volver
      </Button>
    </div>
  );
}
