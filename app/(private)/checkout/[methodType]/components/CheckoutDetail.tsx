"use client";
import { Button } from "@/components/ui/button";
import {
  CREATE_INVOICE,
  UPDATE_INVOICE,
} from "@/graphql/mutation/invoice.mutation";
import { setIziConfig } from "@/lib/izipay";
import { routes } from "@/lib/routes";
import { METHOD_CONFIG } from "@/lib/utils";
import {
  AmountForQuote,
  EventDiscount,
  OrderPayment,
} from "@/types/orders.type";
import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import { get } from "lodash";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckoutLayout } from "./checkout/CheckoutLayout";
import { ProgressBar } from "./checkout/ProgressBar";
import StepBillingInfo from "./checkout/StepBillingInfo";
import StepPaymentConfig from "./checkout/stepPaymentConfig";
import { GET_ACADEMIC_ACTIVITY_BY_ID } from "@/graphql/query/acedemic.query";
import { GET_SOCIAL_ACTIVITY_BY_ID } from "@/graphql/query/social.query";
import StepPaymentResult from "./checkout/stepPaymentResult";
import { GET_RESERVATION_BY_ID } from "@/graphql/query/agreement.query";
import StepReservationConfig from "./checkout/StepReservationConfig";
import { useUserStore } from "@/providers/user-provider";

interface CheckoutDetailProps {
  methodType: string;
}

export interface BillingData {
  zipCode: string;
  socialReason: string;
}

export interface VoucherConfiguration {
  typeOfVoucher: "01" | "03";
  cardOrigin: "L" | "F";
}

export interface Event {
  date: string;
  id: number;
  title: string;
  price: number;
  description?: string;
  href?: string;
  stock: number;
  hasPrice: boolean;
  status_stock: number;
  hasInvitees?: boolean;
  InviteStock?: number;
  priceInvitee?: number;
  discounts?: EventDiscount[];
}

export interface OptionForm {
  idProduct: string;
  type: "SINGLE" | "RANGE";
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface Options extends OptionForm {
  hours: number;
  status: "LIBRE" | "OCUPADO";
}

export interface ReservationData {
  title: string;
  stock: number;
  price: number;
  id: number;
  productIdSelected?: string;
  hours?: number;
  dates: Options[];
}

export type MethodType =
  | "quotes"
  | "reservation"
  | "academicEvents"
  | "socialEvents";
export type PaymentStatus =
  | "processing"
  | "success"
  | "canceled"
  | "izipayError"
  | "serverError";

const COUNTRY_ISO_MAP: Record<string, string> = {
  PERÚ: "PE",
  PERU: "PE",
  PAIS: "PE",
  BELGICA: "BE",
  ESPAÑA: "ES",
  CHILE: "CL",
  ITALIA: "IT",
  CHINA: "CN",
  "ESTADOS UNIDOS": "US",
};

export default function CheckoutDetail({ methodType }: CheckoutDetailProps) {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const { id: lawyerId } = useUserStore((state) => state);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("processing");
  const [transactionId, setTransactionId] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paidTotal, setPaidTotal] = useState(0);
  const [eventData, setEventData] = useState<Event>({
    date: "",
    id: 0,
    title: "",
    price: 0,
    stock: 0,
    hasPrice: false,
    status_stock: 0,
  });
  const [billingData, setBillingData] = useState<BillingData>({
    zipCode: "",
    socialReason: "",
  });

  const [voucherConfiguration, setVoucherConfiguration] =
    useState<VoucherConfiguration>({
      typeOfVoucher: "03",
      cardOrigin: "L",
    });

  const [paymentData, setPaymentData] = useState<AmountForQuote>({
    socialAmount: {
      total: 0,
      percentageDiscount: 0,
      totalWithDiscount: 0,
    },
    mutualAmount: {
      total: 0,
      percentageDiscount: 0,
      totalWithDiscount: 0,
    },
    periodFrom: "",
    quantityInstallments: 0,
  });

  const [reservationData, setReservationData] = useState<ReservationData>({
    title: "",
    stock: 0,
    price: 0,
    id: 0,
    productIdSelected: "",
    hours: 0,
    dates: [],
  });

  const [academicEvents, { loading: academicLoading, error: academicError }] =
    useLazyQuery(GET_ACADEMIC_ACTIVITY_BY_ID, {
      fetchPolicy: "no-cache",
    });
  const [socialEvents, { loading: socialLoading, error: socialError }] =
    useLazyQuery(GET_SOCIAL_ACTIVITY_BY_ID, {
      fetchPolicy: "no-cache",
    });

  const [
    reservation,
    { loading: reservationLoading, error: reservationError },
  ] = useLazyQuery(GET_RESERVATION_BY_ID, {
    fetchPolicy: "no-cache",
  });

  const [createInvoice, { loading: createInvoiceLoading }] = useMutation(
    CREATE_INVOICE,
    {
      onError(error) {
        toast.error(error.message || "Ocurrió un error en generar la orden", {
          description: "Por favor, intenta nuevamente",
          classNames: {
            icon: "text-red-500",
            title: "text-primary",
          },
        });
        console.error(error);
      },
      fetchPolicy: "no-cache",
    },
  );
  const [updateInvoice] = useMutation(UPDATE_INVOICE, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (methodType === "academicEvents") {
      const eventId = window.localStorage.getItem("productId");
      if (eventId) {
        academicEvents({
          variables: { ActivityId: +eventId },
        })
          .then((response) => {
            const { data } = response;
            setEventData({
              date: get(data, "findOneAcademicActivity.date", ""),
              id: get(data, "findOneAcademicActivity.id", 0),
              title: get(data, "findOneAcademicActivity.title", ""),
              price: get(data, "findOneAcademicActivity.price", 0),
              stock: get(data, "findOneAcademicActivity.stock", 0),
              hasPrice: get(data, "findOneAcademicActivity.hasPrice", false),
              status_stock: get(
                data,
                "findOneAcademicActivity.status_stock",
                0,
              ),
              discounts: get(data, "findOneAcademicActivity.discounts", []),
            });
          })
          .catch((error) => {
            console.error("Error fetching academic event:", error);
          });
      }
    } else if (methodType === "socialEvents") {
      const eventId = window.localStorage.getItem("productId");
      if (eventId) {
        socialEvents({
          variables: { ActivityId: +eventId },
        })
          .then((response) => {
            const { data } = response;
            setEventData({
              date: get(data, "findOneSocialActivity.date", ""),
              id: get(data, "findOneSocialActivity.id", 0),
              title: get(data, "findOneSocialActivity.title", ""),
              price: get(data, "findOneSocialActivity.price", 0),
              stock: get(data, "findOneSocialActivity.stock", 0),
              hasPrice: get(data, "findOneSocialActivity.hasPrice", false),
              status_stock: get(data, "findOneSocialActivity.status_stock", 0),
              hasInvitees: get(
                data,
                "findOneSocialActivity.hasInvitees",
                false,
              ),
              InviteStock: get(data, "findOneSocialActivity.InviteStock", 0),
              priceInvitee: get(data, "findOneSocialActivity.priceInvitee", 0),
              discounts: get(data, "findOneSocialActivity.discounts", []),
            });
          })
          .catch((error) => {
            console.error("Error fetching social event:", error);
          });
      }
    } else if (methodType === "reservation") {
      const reservationId = window.localStorage.getItem("productId");
      if (reservationId) {
        reservation({
          variables: { reservationId: +reservationId },
        })
          .then((response) => {
            const { data } = response;
            const reservationInfo = get(data, "finOneReservation", null);
            if (reservationInfo) {
              setReservationData({
                dates: reservationInfo.dates || [],
                title: reservationInfo.title || "",
                stock: reservationInfo.stock || 0,
                price: reservationInfo.price || 0,
                id: reservationInfo.id || 0,
              });
            } else {
              console.error("No reservation data found");
            }
          })
          .catch((error) => {
            console.error("Error fetching reservation data:", error);
          });
      }
    }
  }, [methodType, academicEvents, socialEvents, reservation]);

  useEffect(() => {
    if (!METHOD_CONFIG[methodType as MethodType]) {
      router.replace(routes.home);
    }
  }, [methodType, router]);

  if (!METHOD_CONFIG[methodType as MethodType]) {
    return null;
  }

  const config = METHOD_CONFIG[methodType as MethodType];
  const totalSteps = config.steps;

  const getCountryISO = (countryName: string): string => {
    return COUNTRY_ISO_MAP[countryName] || "PE";
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // const getTotal = () => {
  //   if (methodType === "quotes") {
  //     const social = paymentData.discountId
  //       ? paymentData.socialAmount.totalWithDiscount
  //       : paymentData.socialAmount.total;
  //     return social + paymentData.mutualAmount.total;
  //   } else if (
  //     methodType === "academicEvents" ||
  //     methodType === "socialEvents"
  //   ) {
  //     return eventData?.price || 0;
  //   } else if (methodType === "reservation") {
  //     return reservationData.price * get(reservationData, "hours", 0);
  //   }
  //   return 0;
  // };

  const handlePayment = async (orderPayment: OrderPayment) => {
    const productId = window.localStorage.getItem("productId");
    if (methodType !== "quotes" && !productId) {
      toast.error("No se encontró el ID del producto", {
        description: "Por favor, inténtalo nuevamente.",
        classNames: {
          icon: "text-red-500",
          title: "text-primary",
        },
      });
      return;
    }
    const {
      total,
      items,
      billingData,
      withIGV,
      quoteInfo,
      invitees,
      invoiceConfig,
    } = orderPayment;
    console.log("Total a pagar:", orderPayment);
    setPaidTotal(total);
    try {
      console.log("Datos para crear la factura:", {
        total,
        items,
        billingData,
        withIGV,
        quoteInfo,
        invitees,
        methodType,
        productId,
      });
      const { data: createInvoiceData } = await createInvoice({
        variables: {
          createInvoiceInput: {
            infoInvoice: {
              amount: total,
              currency: "PEN",
              withIGV: withIGV,
              paramId: methodType,
              ...(methodType !== "quotes" &&
                productId !== null && { activityId: +productId }),
              idDocument: invoiceConfig.idDocument,
              clientName: invoiceConfig.clientName,
              documentType: invoiceConfig.documentType,
              documentNumber: invoiceConfig.documentNumber,
              billingAddress: invoiceConfig.billingAddress,
              saleCondition: invoiceConfig.saleCondition,
            },
            invoiceDetails: items,
            ...(methodType === "quotes" && { quoteInfo }),
            ...(methodType === "socialEvents" &&
              invitees &&
              invitees.length > 0 && { invitees }),
          },
          mode: "WEB",
        },
      });
      console.log("se genero esto de nuevo", createInvoiceData);
      if (createInvoiceData) {
        const token = get(createInvoiceData, "createInvoice.token", "");
        if (
          !token &&
          get(createInvoiceData, "createInvoice.mode", "") !== "WEB"
        ) {
          toast.error("No se pudo generar el token de pago", {
            description: "Por favor, inténtalo nuevamente.",
            classNames: {
              icon: "text-red-500",
              title: "text-primary",
            },
          });
          return;
        }
        setTransactionId(
          get(createInvoiceData, "createInvoice.transactionId", ""),
        );

        const iziconfig = setIziConfig(
          {
            orderNumber: get(
              createInvoiceData,
              "createInvoice.orderNumber",
              "",
            ),
            amount: get(createInvoiceData, "createInvoice.amount", 0)
              .toFixed(2)
              .toString(),
            transactionId: get(
              createInvoiceData,
              "createInvoice.transactionId",
              "",
            ),
            merchantCode: get(
              createInvoiceData,
              "createInvoice.merchantCode",
              "",
            ),
            idMerchantBuyer: lawyerId,
            publicKey: get(createInvoiceData, "createInvoice.publicKey", ""),
          },
          {
            firstName: billingData.name,
            lastName: `${billingData.paternal_surname} ${billingData.maternal_surname}`,
            email: billingData.email,
            phoneNumber: billingData.phone,
            street: `${billingData.address}, ${billingData.district}`.slice(
              0,
              40,
            ),
            city: billingData.province,
            state: billingData.department,
            country: getCountryISO(billingData.country) || "PE",
            postalCode: billingData.zipCode,
            document: invoiceConfig.documentNumber,
            companyName:
              invoiceConfig.idDocument === "01"
                ? invoiceConfig.clientName
                : undefined,
          },
          {
            action: "pay",
            processType: "AT",
            payMethod: {
              CARD: "CARD",
              YAPE: "YAPE_CODE",
              QR: "QR",
              PLIN: "PAGO_PUSH",
            },
            tyform: "pop-up",
            currency: "PEN",
            documentType: invoiceConfig.documentType,
          },
        );

        //callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const callbackResponsePayment = async (response: any) => {
          const localTransactionId = get(
            createInvoiceData,
            "createInvoice.transactionId",
            "",
          );
          const localOrderNumber = get(
            createInvoiceData,
            "createInvoice.orderNumber",
            "",
          );
          if (response.code !== "P54") {
            try {
              await updateInvoice({
                variables: {
                  updateInvoiceInput: {
                    rawData: JSON.stringify(response),
                    orderNumber: localOrderNumber,
                    transactionId: localTransactionId,
                    ...(methodType === "quotes" &&
                      quoteInfo && {
                        quoteInfo: {
                          periodTo: quoteInfo.periodTo,
                        },
                      }),
                  },
                  paramId: methodType,
                  ...(methodType !== "quotes" && {
                    activityId: productId ? +productId : undefined,
                  }),
                },
              });
              if (
                typeof response === "object" &&
                response !== null &&
                "code" in response
              ) {
                const code = (response as { code: string }).code;
                if (code === "00") {
                  setPaymentStatus("success");
                  apolloClient.refetchQueries({ include: ["GetLawyerStatus"] });
                } else if (code === "021" || code === "COMMUNICATION_ERROR") {
                  setPaymentStatus("canceled");
                } else {
                  setPaymentStatus("izipayError");
                  setOrderError(
                    typeof response === "object" &&
                      response !== null &&
                      "message" in response
                      ? (response as { message: string }).message ||
                          "Error desconocido"
                      : "Error desconocido",
                  );
                }
              } else {
                setPaymentStatus("izipayError");
                setOrderError("Respuesta de pago no válida");
              }
            } catch (error) {
              console.error(
                "[SERVER ERROR] Error al actualizar la orden de pago. Es posible que el cargo haya sido generado:",
                error,
              );
              setPaymentStatus("serverError");
            }
          } else {
            setPaymentStatus("izipayError");
            setOrderError(response.message || "Error en el servicio de pagos");
          }
        };

        const checkout = new Izipay({ config: iziconfig?.config });
        if (checkout) {
          checkout.LoadForm({
            authorization: token,
            keyRSA: "RSA",
            callbackResponse: callbackResponsePayment,
          });
        }
        setCurrentStep(totalSteps);
        setPaymentStatus("processing");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderStepContent = () => {
    if (methodType === "reservation") {
      switch (currentStep) {
        case 1:
          return (
            <StepReservationConfig
              billingData={billingData}
              setBillingData={setBillingData}
              reservationData={reservationData}
              setReservationData={setReservationData}
              onNext={handlePayment}
              loadingReservation={reservationLoading}
              errorEvent={Boolean(reservationError)}
              loadingPay={createInvoiceLoading}
              methodType={methodType}
            />
          );
        case 2:
          return (
            <StepPaymentResult
              paymentStatus={paymentStatus}
              transactionId={transactionId}
              total={paidTotal}
              orderError={orderError}
            />
          );
        default:
          return null;
      }
    }
    if (methodType === "academicEvents" || methodType === "socialEvents") {
      switch (currentStep) {
        case 1:
          return (
            <StepBillingInfo
              billingData={billingData}
              setBillingData={setBillingData}
              onNext={handlePayment}
              onBack={handleBack}
              eventData={eventData}
              loadingEvent={academicLoading || socialLoading}
              errorEvent={Boolean(academicError) || Boolean(socialError)}
              loadingPay={createInvoiceLoading}
              voucherConfiguration={voucherConfiguration}
              setVoucherConfiguration={setVoucherConfiguration}
              methodType={methodType}
              paymentData={undefined}
            />
          );
        case 2:
          return (
            <StepPaymentResult
              paymentStatus={paymentStatus}
              transactionId={transactionId}
              total={paidTotal}
              orderError={orderError}
            />
          );
        default:
          return null;
      }
    }

    switch (currentStep) {
      case 1:
        if (methodType === "quotes") {
          return (
            <StepPaymentConfig
              setPaymentData={setPaymentData}
              handleNext={handleNext}
            />
          );
        }
        return null;
      case 2:
        return (
          <StepBillingInfo
            loadingPay={createInvoiceLoading}
            billingData={billingData}
            setBillingData={setBillingData}
            onNext={handlePayment}
            onBack={handleBack}
            paymentData={methodType === "quotes" ? paymentData : undefined}
            eventData={
              methodType === "academicEvents" || methodType === "socialEvents"
                ? eventData
                : undefined
            }
            loadingEvent={academicLoading || socialLoading}
            errorEvent={Boolean(academicError) || Boolean(socialError)}
            voucherConfiguration={voucherConfiguration}
            setVoucherConfiguration={setVoucherConfiguration}
          />
        );
      case 3:
        return (
          <StepPaymentResult
            paymentStatus={paymentStatus}
            transactionId={transactionId}
            total={paidTotal}
            orderError={orderError}
          />
        );
      default:
        return null;
    }
  };
  return (
    <CheckoutLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(routes.home)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Inicio
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-base sm:text-lg font-semibold text-blue-900">
                  {config.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-14 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepLabels={config.stepLabels}
              paymentStatus={
                currentStep === totalSteps ? paymentStatus : undefined
              }
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderStepContent()}
        </div>
      </div>
    </CheckoutLayout>
  );
}
