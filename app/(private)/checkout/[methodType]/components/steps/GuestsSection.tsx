"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentType, Guest } from "@/types/payment.type";
import { Plus, Trash2, UserPlus } from "lucide-react";

interface GuestsSectionProps {
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
  maxGuests: number;
  priceInvitee: number;
}

const emptyGuest = (): Guest => ({
  documentType: DocumentType.DNI,
  documentNumber: "",
  name: "",
  lastname: "",
  email: "",
  phone: "",
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

export const isGuestValid = (g: Guest): boolean =>
  g.documentNumber.trim().length >= 8 &&
  g.name.trim().length > 0 &&
  g.lastname.trim().length > 0;

export default function GuestsSection({
  guests,
  onChange,
  maxGuests,
  priceInvitee,
}: GuestsSectionProps) {
  const updateGuest = (index: number, patch: Partial<Guest>) =>
    onChange(guests.map((g, i) => (i === index ? { ...g, ...patch } : g)));

  const addGuest = () => {
    if (guests.length >= maxGuests) return;
    onChange([...guests, emptyGuest()]);
  };

  const removeGuest = (index: number) =>
    onChange(guests.filter((_, i) => i !== index));

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
          <UserPlus className="size-4" />
          Invitados
        </CardTitle>
        <span className="text-xs text-gray-500">
          {guests.length}/{maxGuests} · {formatCurrency(priceInvitee)} c/u
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {guests.length === 0 && (
          <p className="text-sm text-gray-500">
            Puedes agregar hasta {maxGuests}{" "}
            {maxGuests === 1 ? "invitado" : "invitados"}. Cada invitado tiene un
            costo de {formatCurrency(priceInvitee)}.
          </p>
        )}

        {guests.map((guest, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-gray-100 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">
                Invitado {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuest(index)}
                className="h-8 px-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Documento</Label>
                <Select
                  value={guest.documentType}
                  onValueChange={(value) =>
                    updateGuest(index, {
                      documentType: value as DocumentType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DocumentType.DNI}>DNI</SelectItem>
                    <SelectItem value={DocumentType.CE}>CE</SelectItem>
                    <SelectItem value={DocumentType.PASAPORTE}>
                      Pasaporte
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-gray-600">N° de documento</Label>
                <Input
                  inputMode="numeric"
                  value={guest.documentNumber}
                  onChange={(e) =>
                    updateGuest(index, {
                      documentNumber: e.target.value.replace(/\s/g, ""),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Nombres</Label>
                <Input
                  value={guest.name}
                  onChange={(e) => updateGuest(index, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Apellidos</Label>
                <Input
                  value={guest.lastname}
                  onChange={(e) =>
                    updateGuest(index, { lastname: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">
                  Teléfono{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  inputMode="tel"
                  value={guest.phone}
                  onChange={(e) => updateGuest(index, { phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-3">
                <Label className="text-xs text-gray-600">
                  Email{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  type="email"
                  value={guest.email}
                  onChange={(e) => updateGuest(index, { email: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addGuest}
          disabled={guests.length >= maxGuests}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 size-4" />
          Agregar invitado
        </Button>
      </CardContent>
    </Card>
  );
}
