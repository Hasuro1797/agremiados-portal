"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateWithOutTime } from "@/lib/utils";
import {
  AmountForQuote,
  BillinInfo,
  EventDiscount,
  InviteeInfo,
  InvoiceConfig,
  Items,
  OrderPayment,
} from "@/types/orders.type";
import { PaymentType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { addMonths, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  BadgePercent,
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
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  BillingData,
  Event,
  MethodType,
  VoucherConfiguration,
} from "../CheckoutDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cardOrigins, typeOfVoucherPayment } from "@/utils/resources";
import { GET_PROFILE_MEMBER } from "@/graphql/query/member.query";

interface StepBillingInfoProps {
  billingData: BillingData;
  setBillingData: (data: BillingData) => void;
  setVoucherConfiguration: React.Dispatch<
    React.SetStateAction<VoucherConfiguration>
  >;
  onNext: (orderPayment: OrderPayment) => Promise<void>;
  onBack: () => void;
  paymentData?: AmountForQuote;
  eventData?: Event;
  methodType?: MethodType;
  loadingPay: boolean;
  loadingEvent?: boolean;
  errorEvent?: boolean;
  voucherConfiguration: VoucherConfiguration;
}

const COMMISSION_LOCAL = 0.0344;
const COMMISSION_FOREIGN = 0.0409;
const VIRTUAL_CHANNEL = 0.69 * 1.18;

export default function StepBillingInfo({
  billingData,
  setBillingData,
  onNext,
  onBack,
  loadingPay,
  paymentData,
  eventData,
  loadingEvent,
  errorEvent,
  methodType = "quotes",
  setVoucherConfiguration,
  voucherConfiguration,
}: StepBillingInfoProps) {
  const [codigoPostalError, setCodigoPostalError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Invitees state (social events only)
  const [invitees, setInvitees] = useState<InviteeInfo[]>([]);

  // Active event discount (auto-applied if exists)
  const [activeEventDiscount, setActiveEventDiscount] =
    useState<EventDiscount | null>(null);

  // Factura billing state
  const [invoiceDocType, setInvoiceDocType] = useState<"DNI" | "RUC">("DNI");
  const [invoiceSocialReason, setInvoiceSocialReason] = useState("");
  const [invoiceDocNumber, setInvoiceDocNumber] = useState("");
  const [invoiceBillingAddress, setInvoiceBillingAddress] = useState("");

  const {
    loading: profileLoading,
    data: profileData,
    error: profileError,
  } = useQuery(GET_PROFILE_MEMBER);

  // Initialize factura fields from profile (only once)
  const profileInitialized = useRef(false);
  useEffect(() => {
    if (profileData && !profileInitialized.current) {
      profileInitialized.current = true;
      const name = get(profileData, "getProfile.name", "");
      const paternal = get(profileData, "getProfile.paternal_surname", "");
      const maternal = get(profileData, "getProfile.maternal_surname", "");
      setInvoiceSocialReason(`${paternal} ${maternal}, ${name}`);
      setInvoiceDocNumber(get(profileData, "getProfile.dni", ""));
      setInvoiceBillingAddress(get(profileData, "getProfile.address", ""));
    }
  }, [profileData]);

  // Auto-apply first event discount if available
  useEffect(() => {
    if (eventData?.discounts && eventData.discounts.length > 0) {
      setActiveEventDiscount(eventData.discounts[0]);
    } else {
      setActiveEventDiscount(null);
    }
  }, [eventData]);

  const handleDocTypeChange = (value: "DNI" | "RUC") => {
    setInvoiceDocType(value);
    if (value === "RUC") {
      setInvoiceSocialReason("");
      setInvoiceDocNumber("");
      setInvoiceBillingAddress("");
    } else {
      const name = get(profileData, "getProfile.name", "");
      const paternal = get(profileData, "getProfile.paternal_surname", "");
      const maternal = get(profileData, "getProfile.maternal_surname", "");
      setInvoiceSocialReason(`${paternal} ${maternal}, ${name}`);
      setInvoiceDocNumber(get(profileData, "getProfile.dni", ""));
      setInvoiceBillingAddress(get(profileData, "getProfile.address", ""));
    }
  };

  // Reset factura doc type to DNI when switching back to boleta
  useEffect(() => {
    if (voucherConfiguration.typeOfVoucher === "03") {
      setInvoiceDocType("DNI");
    }
  }, [voucherConfiguration.typeOfVoucher]);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length > 10) return;
    setBillingData({ ...billingData, zipCode: value });
    if (value.length > 0 && value.length < 5) {
      setCodigoPostalError("El código postal debe tener entre 5 y 10 dígitos");
    } else {
      setCodigoPostalError("");
    }
  };

  const handleZipCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([8, 9, 27, 13, 46, 35, 36, 37, 39].includes(e.keyCode)) return;
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode))
      return;
    if (e.keyCode < 48 || e.keyCode > 57) e.preventDefault();
  };

  // Invitee helpers
  const addInvitee = () => {
    if (invitees.length < (eventData?.InviteStock || 0)) {
      setInvitees([...invitees, { name: "", lastname: "", dni: "" }]);
    }
  };

  const removeInvitee = (index: number) => {
    setInvitees(invitees.filter((_, i) => i !== index));
  };

  const updateInvitee = (
    index: number,
    field: keyof InviteeInfo,
    value: string,
  ) => {
    const updated = [...invitees];
    updated[index] = { ...updated[index], [field]: value };
    setInvitees(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateRange = (dateString: string) => {
    const date = parse(dateString, "yyyyMM", new Date());
    return format(date, "MMMM yyyy", { locale: es });
  };

  const getRangeUntil = () => {
    if (!paymentData?.periodFrom || !paymentData?.quantityInstallments)
      return "";
    const startDate = parse(paymentData.periodFrom, "yyyyMM", new Date());
    const endDate = addMonths(startDate, paymentData.quantityInstallments);
    return format(endDate, "MMMM yyyy", { locale: es });
  };

  const getRageTo = () => {
    if (!paymentData?.periodFrom || !paymentData?.quantityInstallments)
      return "";
    const startDate = parse(paymentData.periodFrom, "yyyyMM", new Date());
    const endDate = addMonths(startDate, paymentData.quantityInstallments);
    return format(endDate, "yyyyMM");
  };

  const getDiscountedEventPrice = () => {
    if (!eventData) return 0;
    if (activeEventDiscount) {
      return (
        Math.round(
          eventData.price * (1 - activeEventDiscount.percentage / 100) * 100,
        ) / 100
      );
    }
    return eventData.price;
  };

  const getInviteesTotal = () => {
    if (methodType !== "socialEvents" || !eventData?.hasInvitees) return 0;
    return invitees.length * (eventData.priceInvitee || 0);
  };

  const getTotal = () => {
    if (paymentData) {
      const social = paymentData.discountId
        ? paymentData.socialAmount.totalWithDiscount || 0
        : paymentData.socialAmount.total || 0;
      const mutual = paymentData.discountId
        ? paymentData.mutualAmount.totalWithDiscount || 0
        : paymentData.mutualAmount.total || 0;
      return social + mutual;
    }
    if (eventData) {
      return getDiscountedEventPrice() + getInviteesTotal();
    }
    return 0;
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
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 30)
      return num === 20
        ? "VEINTE"
        : "VEINTI" + numberOnWords(num % 10).toLowerCase();
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      return tens[ten] + (unit ? " Y " + numberOnWords(unit) : "");
    }
    if (num === 100) return "CIEN";
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      return hundreds[hundred] + (rest ? " " + numberOnWords(rest) : "");
    }
    if (num < 2000)
      return "MIL" + (num % 1000 ? " " + numberOnWords(num % 1000) : "");
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const rest = num % 1000;
      return (
        numberOnWords(thousands) +
        " MIL" +
        (rest ? " " + numberOnWords(rest) : "")
      );
    }
    if (num === 1000000) return "UN MILLÓN";
    if (num < 2000000)
      return (
        "UN MILLÓN" + (num % 1000000 ? " " + numberOnWords(num % 1000000) : "")
      );
    if (num < 1000000000000) {
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

  const getCommission = () => {
    if (voucherConfiguration.cardOrigin === "L") {
      return (
        Math.round(
          (getTotal() * COMMISSION_LOCAL * 1.18 + VIRTUAL_CHANNEL) * 100,
        ) / 100
      );
    }
    return (
      Math.round(
        (getTotal() * COMMISSION_FOREIGN * 1.18 + VIRTUAL_CHANNEL) * 100,
      ) / 100
    );
  };

  const buildInvoiceConfig = (): InvoiceConfig => {
    const name = get(profileData, "getProfile.name", "");
    const paternal = get(profileData, "getProfile.paternal_surname", "");
    const maternal = get(profileData, "getProfile.maternal_surname", "");
    const lawyerFullName = `${paternal} ${maternal}, ${name}`;
    const lawyerDni = get(profileData, "getProfile.dni", "");
    const lawyerAddress = get(profileData, "getProfile.address", "");

    if (voucherConfiguration.typeOfVoucher === "03") {
      return {
        idDocument: "03",
        clientName: lawyerFullName,
        documentType: "DNI",
        documentNumber: lawyerDni,
        billingAddress: lawyerAddress,
        saleCondition: "CONTADO",
      };
    }
    return {
      idDocument: "01",
      clientName: invoiceSocialReason || lawyerFullName,
      documentType: invoiceDocType,
      documentNumber: invoiceDocNumber || lawyerDni,
      billingAddress: invoiceBillingAddress || lawyerAddress,
      saleCondition: "CONTADO",
    };
  };

  const isInvoiceValid = () => {
    if (voucherConfiguration.typeOfVoucher === "03") return true;
    if (invoiceDocType === "RUC") {
      return (
        invoiceSocialReason.trim() !== "" &&
        invoiceDocNumber.trim().length === 11 &&
        invoiceBillingAddress.trim() !== ""
      );
    }
    // Factura DNI: pre-filled from profile, just validate length
    return invoiceDocNumber.trim().length === 8;
  };

  const isInviteesValid = () => {
    return invitees.every(
      (inv) =>
        inv.name.trim() !== "" &&
        inv.lastname.trim() !== "" &&
        inv.dni.trim().length === 8,
    );
  };

  const isFormComplete =
    billingData.zipCode.trim() !== "" &&
    billingData.zipCode.length >= 5 &&
    billingData.zipCode.length <= 10 &&
    codigoPostalError === "" &&
    isInvoiceValid() &&
    isInviteesValid();

  const handlePayment = async () => {
    const total = getTotal() + getCommission();
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

    if (methodType === "quotes") {
      const socialAmount = paymentData?.discountId
        ? paymentData?.socialAmount.totalWithDiscount || 0
        : paymentData?.socialAmount.total || 0;
      items.push({
        description: `Cuotas Social`,
        price: socialAmount,
        discount: paymentData?.socialAmount?.percentageDiscount,
        unitOfMeasure: "UND",
        quantity: paymentData?.quantityInstallments || 1,
        paymentType: PaymentType.QUOTE,
      });
      items.push({
        description: `Fondo Mutual`,
        price: paymentData?.mutualAmount.total || 0,
        quantity: paymentData?.quantityInstallments || 1,
        unitOfMeasure: "UND",
        paymentType: PaymentType.QUOTE,
      });
      items.push({
        description: `Comisión por Transacción`,
        price: getCommission(),
        quantity: 1,
        unitOfMeasure: "UND",
        paymentType: PaymentType.CURRENCY,
      });
    } else if (methodType === "academicEvents") {
      items.push({
        description: eventData?.title || "Evento Académico",
        price: getDiscountedEventPrice(),
        quantity: 1,
        paymentType: PaymentType.ACADEMIC,
        relatedId: eventData?.id,
        relatedType: "ACADEMIC",
        ...(activeEventDiscount
          ? { discount: activeEventDiscount.percentage }
          : {}),
      });
      items.push({
        description: `Comisión por Transacción`,
        price: getCommission(),
        quantity: 1,
        paymentType: PaymentType.CURRENCY,
      });
    } else if (methodType === "socialEvents") {
      items.push({
        description: eventData?.title || "Evento Social",
        price: getDiscountedEventPrice(),
        quantity: 1,
        paymentType: PaymentType.SOCIAL,
        relatedId: eventData?.id,
        relatedType: "SOCIAL",
        ...(activeEventDiscount
          ? { discount: activeEventDiscount.percentage }
          : {}),
      });
      if (invitees.length > 0 && eventData?.hasInvitees) {
        items.push({
          description: `Invitados - ${eventData?.title || "Evento Social"}`,
          price: eventData?.priceInvitee || 0,
          quantity: invitees.length,
          paymentType: PaymentType.SOCIAL,
          relatedId: eventData?.id,
          relatedType: "SOCIAL",
        });
      }
      items.push({
        description: `Comisión por Transacción`,
        price: getCommission(),
        quantity: 1,
        paymentType: PaymentType.CURRENCY,
      });
    }

    await onNext({
      total,
      billingData: billingInfo,
      items,
      withIGV: methodType === "quotes" ? false : true,
      invoiceConfig: buildInvoiceConfig(),
      ...(methodType === "quotes" &&
        paymentData && {
          quoteInfo: {
            periodFrom: paymentData?.periodFrom,
            periodTo: getRageTo(),
          },
        }),
      ...(methodType === "socialEvents" && invitees.length > 0 && { invitees }),
    });
  };

  const isFactura = voucherConfiguration.typeOfVoucher === "01";

  return (
    <section className="space-y-6">
      {profileLoading || loadingEvent ? (
        <div className="flex justify-center items-center w-full h-[calc(80vh_-_88px)]">
          <Loader
            strokeWidth={2}
            className="text-primary size-10 animate-spin repeat-infinite"
          />
        </div>
      ) : profileError || errorEvent ? (
        <div className="flex justify-center flex-col gap-4 items-center px-4 md:px-6 h-[calc(80vh_-_88px)]">
          <CircleX className="h-10 w-10 text-red-500" />
          <p className="text-primary text-center max-w-sm text-sm md:max-w-md lg:max-w-lg">
            Ocurrió un error al cargar la información para procesar el pago.
            Recargue la página o intente más tarde.
          </p>
        </div>
      ) : (
        <Fragment>
          {/* Tipo de Comprobante */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuración de Comprobante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Tipo de Comprobante
                  </Label>
                  <Select
                    value={voucherConfiguration.typeOfVoucher}
                    onValueChange={(value) => {
                      setVoucherConfiguration((prev) => ({
                        ...prev,
                        typeOfVoucher:
                          value as VoucherConfiguration["typeOfVoucher"],
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOfVoucherPayment.map((item) => (
                        <SelectItem key={item.id} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Origen de Tarjeta
                  </Label>
                  <Select
                    value={voucherConfiguration.cardOrigin}
                    onValueChange={(value) => {
                      setVoucherConfiguration((prev) => ({
                        ...prev,
                        cardOrigin: value as VoucherConfiguration["cardOrigin"],
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardOrigins.map((item) => (
                        <SelectItem key={item.id} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Nota: El origen de la tarjeta varía el porcentaje de comisión.
              </p>
            </CardContent>
          </Card>

          {/* Información del Cliente */}
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
                      {get(profileData, "getProfile.name")}
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
                      title={`${get(profileData, "getProfile.paternal_surname")} ${get(profileData, "getProfile.maternal_surname")}`}
                      className="font-semibold truncate"
                    >
                      {`${get(profileData, "getProfile.paternal_surname")} ${get(profileData, "getProfile.maternal_surname")}`}
                    </p>
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

          {/* Dirección / Datos de Facturación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address info from profile (always shown) */}
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

              {/* Código postal (always required for izipay) */}
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
                    className={`mt-1 ${codigoPostalError ? "border-red-500" : ""}`}
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
              </div>

              {/* Factura additional fields */}
              {isFactura && (
                <div className="space-y-4 pt-2">
                  <Separator />
                  <p className="text-sm font-medium text-primary">
                    Datos para Factura Electrónica
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tipo de documento */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Tipo de Documento
                      </Label>
                      <Select
                        value={invoiceDocType}
                        onValueChange={handleDocTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="RUC">RUC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Número de documento */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Número de Documento{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={invoiceDocNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setInvoiceDocNumber(
                            val.slice(0, invoiceDocType === "RUC" ? 11 : 8),
                          );
                        }}
                        placeholder={
                          invoiceDocType === "RUC" ? "11 dígitos" : "8 dígitos"
                        }
                        maxLength={invoiceDocType === "RUC" ? 11 : 8}
                      />
                      <p className="text-xs text-gray-500">
                        {invoiceDocType === "RUC"
                          ? "El RUC debe tener 11 dígitos"
                          : "El DNI debe tener 8 dígitos"}
                      </p>
                    </div>

                    {/* Razón Social */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Razón Social{" "}
                        {invoiceDocType === "RUC" && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Input
                        value={invoiceSocialReason}
                        onChange={(e) => setInvoiceSocialReason(e.target.value)}
                        placeholder={
                          invoiceDocType === "RUC"
                            ? "Razón social de la empresa"
                            : "Nombre completo o razón social"
                        }
                      />
                    </div>

                    {/* Dirección de facturación */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Dirección de Facturación{" "}
                        {invoiceDocType === "RUC" && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Input
                        value={invoiceBillingAddress}
                        onChange={(e) =>
                          setInvoiceBillingAddress(e.target.value)
                        }
                        placeholder="Av. / Jr. / Calle..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invitados — solo para eventos sociales con hasInvitees */}
          {methodType === "socialEvents" && eventData?.hasInvitees && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Invitados
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    (opcional — hasta {eventData.InviteStock}{" "}
                    {(eventData.InviteStock || 0) === 1
                      ? "persona"
                      : "personas"}
                    {eventData.priceInvitee
                      ? ` · ${formatCurrency(eventData.priceInvitee)} c/u`
                      : ""}
                    )
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invitees.map((invitee, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <Label className="text-xs font-medium text-gray-700">
                        Nombre
                      </Label>
                      <Input
                        value={invitee.name}
                        onChange={(e) =>
                          updateInvitee(index, "name", e.target.value)
                        }
                        placeholder="Nombre"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-700">
                        Apellido
                      </Label>
                      <Input
                        value={invitee.lastname}
                        onChange={(e) =>
                          updateInvitee(index, "lastname", e.target.value)
                        }
                        placeholder="Apellido"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-700">
                        DNI
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={invitee.dni}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 8);
                            updateInvitee(index, "dni", val);
                          }}
                          placeholder="12345678"
                          maxLength={8}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInvitee(index)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {invitees.length < (eventData.InviteStock || 0) && (
                  <Button
                    variant="outline"
                    onClick={addInvitee}
                    className="w-full border-dashed"
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Invitado
                    {eventData.priceInvitee
                      ? ` (${formatCurrency(eventData.priceInvitee)} c/u)`
                      : ""}
                  </Button>
                )}

                {invitees.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No ha agregado invitados. Puede agregar hasta{" "}
                    {eventData.InviteStock}{" "}
                    {(eventData.InviteStock || 0) === 1
                      ? "invitado"
                      : "invitados"}
                    .
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resumen de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5 shrink-0" />
                Resumen de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Cuotas Sociales
                        </h4>
                        <p className="text-sm text-gray-600">
                          {`${paymentData.quantityInstallments} ${paymentData.quantityInstallments === 1 ? "cuota" : "cuotas"}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base sm:text-lg text-primary">
                          {formatCurrency(
                            paymentData.discountId
                              ? paymentData.socialAmount.totalWithDiscount || 0
                              : paymentData.socialAmount.total || 0,
                          )}
                        </p>
                        <p className="text-xs text-gray-500">Subtotal</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Fondo Mutual
                        </h4>
                        <p className="text-sm text-gray-600">
                          {`${paymentData.quantityInstallments} ${paymentData.quantityInstallments === 1 ? "cuota" : "cuotas"}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base sm:text-lg text-primary">
                          {formatCurrency(
                            paymentData.discountId
                              ? paymentData.mutualAmount.totalWithDiscount || 0
                              : paymentData.mutualAmount.total || 0,
                          )}
                        </p>
                        <p className="text-xs text-gray-500">Subtotal</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Comisión por Transacción
                        </h4>
                        <p className="text-sm text-gray-600">
                          {voucherConfiguration.cardOrigin === "L"
                            ? "3.44%"
                            : "4.09%"}{" "}
                          + IGV inc.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base sm:text-lg text-primary">
                          {formatCurrency(getCommission())}
                        </p>
                        <p className="text-xs text-gray-500">inc. IGV</p>
                      </div>
                    </div>
                  </div>
                )}

                {eventData && (
                  <div className="space-y-3">
                    {/* Event main ticket */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {eventData.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(eventData.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activeEventDiscount ? (
                          <>
                            <p className="text-xs line-through text-gray-400">
                              {formatCurrency(eventData.price)}
                            </p>
                            <p className="font-bold text-lg text-green-700 flex items-center gap-1 justify-end">
                              {formatCurrency(getDiscountedEventPrice())}
                              <BadgePercent className="h-4 w-4" />
                            </p>
                            <p className="text-xs text-green-600">
                              {activeEventDiscount.name} -
                              {activeEventDiscount.percentage}%
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-lg text-primary">
                              {formatCurrency(eventData.price)}
                            </p>
                            <p className="text-xs text-gray-500">Inscripción</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Invitees summary */}
                    {invitees.length > 0 && eventData.hasInvitees && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Invitados
                            </h4>
                            <p className="text-sm text-gray-600">
                              {invitees.length}{" "}
                              {invitees.length === 1 ? "persona" : "personas"} ·{" "}
                              {formatCurrency(eventData.priceInvitee || 0)} c/u
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">
                            {formatCurrency(getInviteesTotal())}
                          </p>
                          <p className="text-xs text-gray-500">Subtotal</p>
                        </div>
                      </div>
                    )}

                    {/* Commission */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <BadgePercent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Comisión por Transacción
                          </h4>
                          <p className="text-sm text-gray-600">
                            {voucherConfiguration.cardOrigin === "L"
                              ? "3.44%"
                              : "4.09%"}{" "}
                            + IGV
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {formatCurrency(getCommission())}
                        </p>
                        <p className="text-xs text-gray-500">
                          (
                          {voucherConfiguration.cardOrigin === "L"
                            ? "3.44%"
                            : "4.09%"}{" "}
                          + IGV)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Desglose */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Desglose del Pago
                  </h4>

                  <div className="text-sm">
                    {paymentData && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                              {formatCurrency(getTotal())}
                            </span>
                          </div>
                          <div className="flex gap-2 justify-between">
                            <span className="text-gray-600">
                              Comisión (inc. IGV):
                            </span>
                            <span className="font-medium">
                              {formatCurrency(getCommission())}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 justify-between">
                            <span className="text-gray-600">Período: </span>
                            <span className="font-medium">
                              {formatDateRange(paymentData.periodFrom || "")} -{" "}
                              {getRangeUntil()}
                            </span>
                          </div>
                          <div className="flex gap-2 justify-between">
                            <span className="text-gray-600">Cuotas:</span>
                            <span className="font-medium">
                              {paymentData.quantityInstallments || "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {eventData &&
                      (() => {
                        const eventTotal = getTotal();
                        const eventSinIGV = eventTotal / 1.18;
                        const igvEvento = eventTotal - eventSinIGV;
                        const commission = getCommission();
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2 justify-between">
                                <span className="text-gray-600">
                                  Subtotal (sin IGV):
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(eventSinIGV)}
                                </span>
                              </div>
                              <div className="flex gap-2 justify-between">
                                <span className="text-gray-600">
                                  IGV (18%):
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(igvEvento)}
                                </span>
                              </div>
                              <div className="flex gap-2 justify-between">
                                <span className="text-gray-600">
                                  Comisión (inc. IGV):
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(commission)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2 justify-between">
                                <span className="text-gray-600">Fecha: </span>
                                <span className="font-medium">
                                  {formatDateWithOutTime(eventData.date || "")}
                                </span>
                              </div>
                              <div className="flex gap-2 justify-between">
                                <span className="text-gray-600">Tipo: </span>
                                <span className="font-medium">
                                  {methodType === "academicEvents"
                                    ? "Evento Académico"
                                    : "Evento Social"}
                                </span>
                              </div>
                              {activeEventDiscount && (
                                <div className="flex gap-2 justify-between text-green-700">
                                  <span>Descuento aplicado:</span>
                                  <span className="font-medium">
                                    {activeEventDiscount.name} -
                                    {activeEventDiscount.percentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      Total a Pagar:
                    </span>
                    <span className="text-base sm:text-2xl font-bold text-primary">
                      {formatCurrency(getTotal() + getCommission())}
                    </span>
                  </div>

                  <div className="text-center text-sm text-gray-600 mt-2">
                    <p className="font-medium">
                      Son:{" "}
                      {numberOnWords(Math.floor(getTotal() + getCommission()))}{" "}
                      con{" "}
                      {String(
                        (((getTotal() + getCommission()) % 1) * 100).toFixed(0),
                      ).padStart(2, "0")}
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
                      {voucherConfiguration.typeOfVoucher === "03"
                        ? "Boleta Electrónica"
                        : "Factura Electrónica"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            className={
              paymentData ? "flex justify-between" : "flex justify-end"
            }
          >
            {paymentData && (
              <Button variant="outline" onClick={onBack}>
                Atrás
              </Button>
            )}
            <Button
              disabled={!isFormComplete || loadingPay}
              onClick={() => setShowConfirmDialog(true)}
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
          {!isFormComplete && (
            <p className="text-sm text-red-600 text-center">
              * Complete los campos requeridos para continuar con el pago
            </p>
          )}

          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-primary">
                  Confirmar Pago
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>¿Está seguro que desea procesar el siguiente pago?</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(getTotal())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión:</span>
                        <span className="font-medium">
                          {formatCurrency(getCommission())}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold text-primary">
                        <span>Total a Pagar:</span>
                        <span>
                          {formatCurrency(getTotal() + getCommission())}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 pt-1">
                        <span>Comprobante:</span>
                        <span>
                          {voucherConfiguration.typeOfVoucher === "03"
                            ? "Boleta Electrónica"
                            : "Factura Electrónica"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Esta acción no se puede deshacer una vez iniciado el
                      proceso de pago.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlePayment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirmar Pago
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Fragment>
      )}
    </section>
  );
}
