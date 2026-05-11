"use client";
import React, { Dispatch, Fragment, useState } from "react";
import { BillingData, MethodType, ReservationData } from "../CheckoutDetail";
import { BillinInfo, Items, OrderPayment } from "@/types/orders.type";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  CircleX,
  CreditCard,
  FileText,
  Globe,
  IdCard,
  Loader,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { get } from "lodash";
import { useQuery } from "@apollo/client";
import { GET_PROFILE_LAWYER } from "@/graphql/query/member.query";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaymentType } from "@/utils/enum";

interface StepReservationConfigProps {
  reservationData: ReservationData;
  setReservationData: Dispatch<React.SetStateAction<ReservationData>>;
  onNext: (orderPayment: OrderPayment) => Promise<void>;
  loadingReservation: boolean;
  errorEvent: boolean;
  loadingPay: boolean;
  methodType?: MethodType;
  billingData: BillingData;
  setBillingData: (data: BillingData) => void;
}

export default function StepReservationConfig({
  billingData,
  setBillingData,
  reservationData,
  setReservationData,
  onNext,
  loadingReservation,
  errorEvent,
  loadingPay,
}: StepReservationConfigProps) {
  const [codigoPostalError, setCodigoPostalError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const {
    loading: profileLoading,
    data: profileData,
    error: profileError,
  } = useQuery(GET_PROFILE_LAWYER);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: es });
  };

  const handleSlotChange = (slotId: string) => {
    const slot = get(reservationData, "dates", []).find(
      (s) => s.idProduct === slotId,
    );
    if (slot) {
      setSelectedSlot(slotId);
      setReservationData({
        ...reservationData,
        productIdSelected: slotId,
        hours: slot.hours,
      });
    }
  };

  const numberOnWords = (num: number): string => {
    if (num === 0) return "CERO";
    if (num < 0) return "MENOS " + numberOnWords(-num);

    const units = [
      "",
      "UNO",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const teens = [
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISÉIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ];
    const tens = [
      "",
      "DIEZ",
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const hundreds = [
      "",
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    // Unidades simples
    if (num < 10) return units[num];
    // 10-19
    if (num < 20) return teens[num - 10];
    // 20-29 (caso especial "veintiuno")
    if (num < 30)
      return num === 20
        ? "VEINTE"
        : "VEINTI" + numberOnWords(num % 10).toLowerCase();
    // 30-99
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      return tens[ten] + (unit ? " Y " + numberOnWords(unit) : "");
    }
    // 100
    if (num === 100) return "CIEN";
    // 101-999
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      return hundreds[hundred] + (rest ? " " + numberOnWords(rest) : "");
    }
    // 1,000 - 1,999
    if (num < 2000) {
      return "MIL" + (num % 1000 ? " " + numberOnWords(num % 1000) : "");
    }
    // 2,000 - 999,999
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const rest = num % 1000;
      return (
        numberOnWords(thousands) +
        " MIL" +
        (rest ? " " + numberOnWords(rest) : "")
      );
    }
    // 1,000,000 exacto
    if (num === 1000000) return "UN MILLÓN";
    // Más de 1,000,000
    if (num < 2000000) {
      // de 1,000,001 a 1,999,999
      return (
        "UN MILLÓN" + (num % 1000000 ? " " + numberOnWords(num % 1000000) : "")
      );
    }
    // 2,000,000 en adelante
    if (num < 1000000000000) {
      // Hasta un billón por si acaso
      const millions = Math.floor(num / 1000000);
      const rest = num % 1000000;
      return (
        numberOnWords(millions) +
        " MILLONES" +
        (rest ? " " + numberOnWords(rest) : "")
      );
    }
    return "Número fuera de rango";
  };

  const getSelectedSlotInfo = () => {
    return get(reservationData, "dates", []).find(
      (s) => s.idProduct === selectedSlot,
    );
  };

  const formatHour = (time: string) => {
    return format(parse(time, "HH:mm", new Date()), "hh:mm a", { locale: es });
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) {
      return;
    }

    if (value.length > 10) {
      return;
    }

    setBillingData({ ...billingData, zipCode: value });

    if (value.length > 0 && value.length < 5) {
      setCodigoPostalError("El código postal debe tener entre 5 y 10 dígitos");
    } else {
      setCodigoPostalError("");
    }
  };

  const handleZipCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([8, 9, 27, 13, 46, 35, 36, 37, 39].includes(e.keyCode)) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }

    if (e.keyCode < 48 || e.keyCode > 57) {
      e.preventDefault();
    }
  };

  const getTotal = () => {
    return get(getSelectedSlotInfo(), "hours", 10) * reservationData.price;
  };

  const isFormValid = () => {
    return (
      selectedSlot &&
      billingData.zipCode.trim() !== "" &&
      billingData.zipCode.length >= 5 &&
      billingData.zipCode.length <= 10 &&
      codigoPostalError === ""
    );
  };

  const handlePayment = async () => {
    const total = getTotal();
    const billingInfo: BillinInfo = {
      address: get(profileData, "getProfile.address", ""),
      department: get(profileData, "getProfile.department", ""),
      district: get(profileData, "getProfile.district", ""),
      country: get(profileData, "getProfile.country", ""),
      dni: get(profileData, "getProfile.dni", ""),
      email: get(profileData, "getProfile.email", ""),
      name: get(profileData, "getProfile.name", ""),
      maternal_surname: get(profileData, "getProfile.maternal_surname", ""),
      paternal_surname: get(profileData, "getProfile.paternal_surname", ""),
      cip: get(profileData, "getProfile.cip", ""),
      phone: get(profileData, "getProfile.phone", ""),
      zipCode: billingData.zipCode,
      province: get(profileData, "getProfile.province", ""),
      socialReason: billingData.socialReason || "",
    };

    const items: Items[] = [];

    items.push({
      description: reservationData.title,
      quantity: getSelectedSlotInfo()?.hours || 1,
      price: reservationData.price,
      paymentType: PaymentType.RESERVATION,
      relatedId: reservationData.id,
      relatedType: "RESERVATION",
      reservationId: getSelectedSlotInfo()?.idProduct || "",
    });

    await onNext({
      total,
      idProduct: getSelectedSlotInfo()?.idProduct,
      billingData: billingInfo,
      items,
    });
  };

  return (
    <div className="space-y-6">
      {profileLoading || loadingReservation ? (
        <div className="flex justify-center items-center w-full h-[calc(80vh_-_88px)]">
          <Loader
            strokeWidth={2}
            className="text-primary size-10 animate-spin repeat-infinite"
          />
        </div>
      ) : profileError || errorEvent ? (
        <div className="flex justify-center flex-col gap-4 items-center px-4 md:px-6 h-[calc(80vh_-_88px)]">
          <CircleX className="h-10 w-10 text-red-500" />
          <p className="text-primary text-center max-w-sm text-sm md:max-w-md lg:max-w-lg ">
            Ocurrio un error al cargar la información de la reserva o del perfil
            del cliente. Por favor, inténtelo de nuevo más tarde.
          </p>
        </div>
      ) : (
        <Fragment>
          {/* Información del Espacio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información del Espacio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Espacio
                    </p>
                    <p
                      title={reservationData.title}
                      className="font-semibold text-gray-900 line-clamp-2"
                    >
                      {reservationData.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      Capacidad
                    </p>
                    <p className="font-semibold text-gray-900">
                      {reservationData.stock} personas
                    </p>
                    <p className="text-sm text-gray-600">Aforo máximo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de Fecha y Horario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seleccione Fecha y Horario *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="slot"
                  className="text-sm font-medium text-gray-700"
                >
                  Opciones Disponibles
                </Label>
                <Select value={selectedSlot} onValueChange={handleSlotChange}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Seleccione fecha y horario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {get(reservationData, "dates", []).map((slot, index) => (
                      <SelectItem
                        key={index}
                        value={slot.idProduct}
                        disabled={slot.status === "OCUPADO"}
                        className="w-full"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center justify-between gap-3 w-full">
                            <div className="text-left">
                              <div className="font-medium">
                                {`${formatDate(slot.startDate)}${
                                  slot.type === "RANGE"
                                    ? " • " + formatDate(slot.endDate)
                                    : ""
                                }`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatHour(slot.startTime)} -{" "}
                                {formatHour(slot.endTime)}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="font-bold text-primary">
                              {formatCurrency(
                                slot.hours * reservationData.price,
                              )}
                            </span>
                            {slot.status === "OCUPADO" && (
                              <span className="text-xs block text-red-600 font-medium">
                                Ocupado
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Detalles del slot seleccionado */}
              {selectedSlot && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="hidden w-10 h-10 bg-green-600 rounded-lg sm:flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">
                          Reserva Confirmada
                        </h4>
                        <p className="text-sm text-gray-600">
                          {`${formatDate(
                            getSelectedSlotInfo()?.startDate || "",
                          )} ${
                            getSelectedSlotInfo()?.type === "RANGE"
                              ? " - " +
                                formatDate(getSelectedSlotInfo()?.endDate || "")
                              : ""
                          }`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatHour(getSelectedSlotInfo()?.startTime || "")} -{" "}
                          {formatHour(getSelectedSlotInfo()?.endTime || "")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-green-900">
                        {formatCurrency(getTotal())}
                      </div>
                      <p className="text-xs text-gray-500">Costo total</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Nombres
                    </p>
                    <p
                      title={get(profileData, "getProfile.name")}
                      className="font-semibold truncate"
                    >
                      {`${get(profileData, "getProfile.name")}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Apellidos
                    </p>
                    <p
                      title={
                        get(profileData, "getProfile.paternal_surname") +
                        " " +
                        get(profileData, "getProfile.maternal_surname")
                      }
                      className="font-semibold truncate"
                    >{`${get(profileData, "getProfile.paternal_surname")} ${get(
                      profileData,
                      "getProfile.maternal_surname",
                    )}`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Correo Electrónico
                    </p>
                    <p
                      title={get(profileData, "getProfile.email")}
                      className="font-semibold truncate"
                    >
                      {get(profileData, "getProfile.email")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Teléfono
                    </p>
                    <p
                      title={get(profileData, "getProfile.phone")}
                      className="font-semibold truncate"
                    >
                      {get(profileData, "getProfile.phone")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Dirección
                      </p>
                      <p
                        title={get(profileData, "getProfile.address")}
                        className="font-semibold truncate"
                      >
                        {get(profileData, "getProfile.address")}
                      </p>
                      <p
                        title={get(profileData, "getProfile.district")}
                        className="text-sm text-gray-600 truncate"
                      >
                        {get(profileData, "getProfile.district")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <IdCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      DNI
                    </p>
                    <p
                      title={get(profileData, "getProfile.dni")}
                      className="font-semibold truncate"
                    >
                      {get(profileData, "getProfile.dni")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Provincia
                    </p>
                    <p
                      title={get(profileData, "getProfile.province")}
                      className="font-semibold truncate"
                    >
                      {get(profileData, "getProfile.province")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Departamento
                    </p>
                    <p
                      title={get(profileData, "getProfile.department")}
                      className="font-semibold truncate"
                    >
                      {get(profileData, "getProfile.department")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      País
                    </p>
                    <p
                      title={get(profileData, "getProfile.country")}
                      className="font-semibold truncate"
                    >
                      {get(profileData, "getProfile.country")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="zipCode"
                    className="text-sm font-medium text-primary"
                  >
                    Código Postal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zipCode"
                    value={billingData.zipCode}
                    onChange={handleZipCodeChange}
                    onKeyDown={handleZipCodeKeyDown}
                    placeholder="04001"
                    className={`mt-1 ${
                      codigoPostalError ? "border-red-500" : ""
                    }`}
                    maxLength={10}
                    minLength={5}
                    required
                  />
                  {codigoPostalError && (
                    <p className="text-xs text-red-600 mt-1">
                      {codigoPostalError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Solo números, entre 5 y 10 dígitos
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="razonSocial"
                    className="text-sm font-medium text-gray-700"
                  >
                    Razón Social o Nombre de la Compañía (Opcional)
                  </Label>
                  <Input
                    id="razonSocial"
                    value={billingData.socialReason}
                    onChange={(e) =>
                      setBillingData({
                        ...billingData,
                        socialReason: e.target.value,
                      })
                    }
                    placeholder="Nombre de la empresa (opcional)"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Pago */}
          {selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5 shrink-0" />
                  Resumen de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-1 items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="hidden w-10 h-10 bg-blue-600 rounded-full sm:flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 line-clamp-2">
                          {reservationData.title}
                        </h4>
                        <div className="text-left">
                          <p className="font-medium">
                            {`${formatDate(
                              getSelectedSlotInfo()?.startDate || "",
                            )} ${
                              getSelectedSlotInfo()?.type === "RANGE"
                                ? " • " +
                                  formatDate(
                                    getSelectedSlotInfo()?.endDate || "",
                                  )
                                : ""
                            }`}
                          </p>
                          <div className="text-sm text-gray-500">
                            {formatHour(getSelectedSlotInfo()?.startTime || "")}{" "}
                            - {formatHour(getSelectedSlotInfo()?.endTime || "")}{" "}
                            • {getSelectedSlotInfo()?.hours || 0} horas
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        {formatCurrency(getTotal())}
                      </p>
                      <p className="text-xs text-gray-500">Subtotal</p>
                    </div>
                  </div>
                  <Separator />
                  {/* Resumen de totales */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Desglose del Pago
                    </h4>

                    <Separator />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        Total a Pagar:
                      </span>
                      <span className="text-base sm:text-2xl font-bold text-primary">
                        {formatCurrency(getTotal())}
                      </span>
                    </div>

                    <div className="text-center text-sm text-gray-600 mt-2">
                      <p className="font-medium">
                        Son: {numberOnWords(Math.floor(getTotal()))} con{" "}
                        {String(((getTotal() % 1) * 100).toFixed(0)).padStart(
                          2,
                          "0",
                        )}
                        /100 Soles
                      </p>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Fecha de Emisión
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(), "dd/MM/yyyy")}
                      </p>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Tipo de Pago
                      </p>
                      <p className="text-xs text-gray-600">Contado</p>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Comprobante
                      </p>
                      <p className="text-xs text-gray-600">
                        Boleta Electrónica
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              disabled={!isFormValid() || loadingPay}
              onClick={handlePayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loadingPay ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Procesar Pago
            </Button>
          </div>

          {!isFormValid() && (
            <p className="text-sm text-red-600 text-center">
              * Seleccione una fecha/horario y complete el código postal para
              continuar
            </p>
          )}
        </Fragment>
      )}
    </div>
  );
}
