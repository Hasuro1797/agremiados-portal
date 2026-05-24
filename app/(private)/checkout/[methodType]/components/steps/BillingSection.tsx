"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillingFormData } from "@/types/payment.type";
import { FileText, ReceiptText } from "lucide-react";

interface BillingSectionProps {
  value: BillingFormData;
  onChange: (data: BillingFormData) => void;
}

export default function BillingSection({ value, onChange }: BillingSectionProps) {
  const update = (patch: Partial<BillingFormData>) =>
    onChange({ ...value, ...patch });

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
          <ReceiptText className="size-4" />
          Comprobante de pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Por defecto emitimos una <span className="font-medium">boleta</span> con
          los datos de tu perfil. Marca la opción si necesitas factura con RUC.
        </p>

        <label className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 cursor-pointer">
          <Checkbox
            checked={value.needsInvoice}
            onCheckedChange={(checked) =>
              update({ needsInvoice: checked === true })
            }
            className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
          />
          <span className="space-y-0.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <FileText className="size-4" />
              Necesito factura
            </span>
            <span className="block text-xs text-gray-500">
              Se emitirá factura electrónica a nombre de la empresa indicada.
            </span>
          </span>
        </label>

        {value.needsInvoice && (
          <div className="space-y-4 rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">RUC</Label>
              <Input
                inputMode="numeric"
                maxLength={11}
                placeholder="11 dígitos"
                value={value.documentNumber}
                onChange={(e) =>
                  update({
                    documentNumber: e.target.value.replace(/\D/g, "").slice(0, 11),
                  })
                }
              />
              {value.documentNumber.length > 0 &&
                value.documentNumber.length !== 11 && (
                  <p className="text-xs text-red-500">
                    El RUC debe tener 11 dígitos.
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Razón social
              </Label>
              <Input
                placeholder="Nombre de la empresa"
                value={value.clientName}
                onChange={(e) => update({ clientName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Dirección fiscal{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                placeholder="Dirección de la empresa"
                value={value.billingAddress}
                onChange={(e) => update({ billingAddress: e.target.value })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const isBillingValid = (value: BillingFormData): boolean => {
  if (!value.needsInvoice) return true;
  return value.documentNumber.length === 11 && value.clientName.trim().length > 0;
};
