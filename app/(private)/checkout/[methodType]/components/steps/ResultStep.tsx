"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

export type ResultUiStatus =
  | "processing"
  | "success"
  | "canceled"
  | "failed"
  | "expired"
  | "pending"
  | "serverError";

interface ResultStepProps {
  status: ResultUiStatus;
  message?: string | null;
  orderNumber?: string;
  amount?: number;
  onRetry: () => void;
  onHome: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

const CONFIG: Record<
  ResultUiStatus,
  {
    icon: ReactNode;
    title: string;
    fallback: string;
    tone: string;
    canRetry: boolean;
  }
> = {
  processing: {
    icon: <Loader2 className="size-12 animate-spin text-accent" />,
    title: "Procesando tu pago",
    fallback: "Completa el pago en la ventana de Izipay.",
    tone: "text-primary",
    canRetry: false,
  },
  success: {
    icon: <CheckCircle2 className="size-12 text-green-600" />,
    title: "¡Pago realizado!",
    fallback: "Tu pago se procesó correctamente.",
    tone: "text-green-700",
    canRetry: false,
  },
  pending: {
    icon: <Clock className="size-12 text-amber-500" />,
    title: "Estamos confirmando tu pago…",
    fallback:
      "Tu pago está en verificación. Te enviaremos un correo cuando se confirme.",
    tone: "text-amber-700",
    canRetry: false,
  },
  canceled: {
    icon: <XCircle className="size-12 text-gray-400" />,
    title: "Pago cancelado",
    fallback: "Cancelaste el pago. Puedes intentarlo nuevamente.",
    tone: "text-gray-700",
    canRetry: true,
  },
  failed: {
    icon: <XCircle className="size-12 text-red-500" />,
    title: "El pago no se completó",
    fallback: "Ocurrió un problema con el pago. Inténtalo nuevamente.",
    tone: "text-red-700",
    canRetry: true,
  },
  expired: {
    icon: <Clock className="size-12 text-red-500" />,
    title: "La sesión de pago expiró",
    fallback: "El tiempo para pagar terminó. Genera un nuevo pago.",
    tone: "text-red-700",
    canRetry: true,
  },
  serverError: {
    icon: <XCircle className="size-12 text-red-500" />,
    title: "No pudimos confirmar el pago",
    fallback:
      "Si se realizó el cargo, lo confirmaremos automáticamente. Revisa tu correo en unos minutos.",
    tone: "text-red-700",
    canRetry: true,
  },
};

export default function ResultStep({
  status,
  message,
  orderNumber,
  amount,
  onRetry,
  onHome,
}: ResultStepProps) {
  const cfg = CONFIG[status];

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        {cfg.icon}
        <h2 className={`text-xl font-bold ${cfg.tone}`}>{cfg.title}</h2>
        <p className="max-w-md text-sm text-gray-600">
          {message || cfg.fallback}
        </p>

        {(amount !== undefined && amount > 0) || orderNumber ? (
          <div className="mt-2 w-full max-w-xs space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
            {amount !== undefined && amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Monto</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(amount)}
                </span>
              </div>
            )}
            {orderNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">Orden</span>
                <span className="font-medium text-gray-700">{orderNumber}</span>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {cfg.canRetry && (
            <Button
              onClick={onRetry}
              className="font-semibold bg-accent hover:bg-accent-hover"
            >
              <RotateCcw className="mr-2 size-4" />
              Reintentar pago
            </Button>
          )}
          <Button
            variant={cfg.canRetry ? "outline" : "default"}
            onClick={onHome}
            className={
              cfg.canRetry ? "" : "font-semibold bg-accent hover:bg-accent-hover"
            }
          >
            Volver al inicio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
