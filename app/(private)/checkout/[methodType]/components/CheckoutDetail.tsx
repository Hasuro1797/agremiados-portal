"use client";

import { Button } from "@/components/ui/button";
import {
  CONFIRM_PAYMENT,
  ENROLL_FREE_ACTIVITY,
  GENERATE_PAYMENT_TOKEN,
} from "@/graphql/mutation/payment.mutation";
import { GET_ACTIVITY_BY_ID } from "@/graphql/query/activity.query";
import { GET_PROFILE_MEMBER } from "@/graphql/query/member.query";
import { MY_QUOTA_PAYMENTS } from "@/graphql/query/payment.query";
import { buildIziConfig, getCountryISO } from "@/lib/izipay";
import { routes } from "@/lib/routes";
import { useUserStore } from "@/providers/user-provider";
import {
  ActivityForCheckout,
  BillingFormData,
  ConfirmPaymentResult,
  DocumentType,
  EnrollFreeActivityResult,
  GeneratePaymentTokenInput,
  Guest,
  PaymentTargetType,
  PaymentTokenResult,
  QuotaPayment,
} from "@/types/payment.type";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { get } from "lodash";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ActivityConfigStep from "./steps/ActivityConfigStep";
import PaymentFormStep from "./steps/PaymentFormStep";
import { ProgressBar } from "./steps/ProgressBar";
import QuotaConfigStep from "./steps/QuotaConfigStep";
import ResultStep, { ResultUiStatus } from "./steps/ResultStep";

type CheckoutMethodType = "quotes" | "academicEvents" | "socialEvents";
type FlowStep = "config" | "pay" | "result";

const CHECKOUT_CONFIG: Record<
  CheckoutMethodType,
  { title: string; stepLabels: string[] }
> = {
  quotes: {
    title: "Pago de Cuotas",
    stepLabels: ["Cuotas", "Pago", "Resultado"],
  },
  academicEvents: {
    title: "Evento Académico",
    stepLabels: ["Inscripción", "Pago", "Resultado"],
  },
  socialEvents: {
    title: "Evento Social",
    stepLabels: ["Inscripción", "Pago", "Resultado"],
  },
};

const DEFAULT_POSTAL_CODE = "15001";

const defaultBilling: BillingFormData = {
  needsInvoice: false,
  documentNumber: "",
  clientName: "",
  billingAddress: "",
};

const toErrorMessage = (message?: string) =>
  message || "Ocurrió un error. Por favor, inténtalo nuevamente.";

const statusToUi = (status: ConfirmPaymentResult["status"]): ResultUiStatus => {
  switch (status) {
    case "PAGADO":
      return "success";
    case "CANCELADO":
      return "canceled";
    case "FALLIDO":
      return "failed";
    case "EXPIRADO":
      return "expired";
    case "PENDIENTE":
    default:
      return "pending";
  }
};

const flowStepToNumber = (step: FlowStep): number =>
  step === "config" ? 1 : step === "pay" ? 2 : 3;

interface CheckoutDetailProps {
  methodType: string;
}

export default function CheckoutDetail({ methodType }: CheckoutDetailProps) {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const userId = useUserStore((state) => state.id);

  const isValidMethod = methodType in CHECKOUT_CONFIG;
  const method = methodType as CheckoutMethodType;
  const isQuotes = method === "quotes";

  const [flowStep, setFlowStep] = useState<FlowStep>("config");
  const [billing, setBilling] = useState<BillingFormData>(defaultBilling);
  const [selectedQuotaIds, setSelectedQuotaIds] = useState<number[]>([]);
  const [paying, setPaying] = useState(false);
  const [resultStatus, setResultStatus] =
    useState<ResultUiStatus>("processing");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [tokenResult, setTokenResult] = useState<PaymentTokenResult | null>(
    null,
  );
  const [activityId, setActivityId] = useState<number | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  // Guards the embedded-form load so it mounts exactly once per token.
  const formLoadedRef = useRef(false);

  useEffect(() => {
    if (!isValidMethod) {
      router.replace(routes.home);
    }
  }, [isValidMethod, router]);

  useEffect(() => {
    if (!isQuotes && typeof window !== "undefined") {
      const raw = window.localStorage.getItem("productId");
      setActivityId(raw ? Number(raw) : null);
    }
  }, [isQuotes]);

  // --- Data fetching ---
  const { data: profileData } = useQuery(GET_PROFILE_MEMBER, {
    fetchPolicy: "cache-first",
  });

  const {
    data: quotasData,
    loading: quotasLoading,
    error: quotasError,
  } = useQuery(MY_QUOTA_PAYMENTS, {
    variables: { status: "PENDIENTE" },
    fetchPolicy: "cache-and-network",
    skip: !isQuotes,
  });

  const {
    data: activityData,
    loading: activityLoading,
    error: activityError,
  } = useQuery(GET_ACTIVITY_BY_ID, {
    variables: { id: activityId },
    fetchPolicy: "cache-and-network",
    skip: isQuotes || activityId === null,
  });

  const quotas: QuotaPayment[] = useMemo(
    () => get(quotasData, "myQuotaPayments", []) as QuotaPayment[],
    [quotasData],
  );

  const activity: ActivityForCheckout | null = useMemo(() => {
    const raw = get(activityData, "findOneActivity", null);
    return raw ? (raw as ActivityForCheckout) : null;
  }, [activityData]);

  // Preselect every pending quota by default once loaded.
  useEffect(() => {
    if (isQuotes && quotas.length > 0) {
      setSelectedQuotaIds((prev) =>
        prev.length === 0 ? quotas.map((q) => q.id) : prev,
      );
    }
  }, [isQuotes, quotas]);

  const [generatePaymentToken] = useMutation(GENERATE_PAYMENT_TOKEN, {
    fetchPolicy: "no-cache",
  });
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT, {
    fetchPolicy: "no-cache",
  });
  const [enrollFreeActivity] = useMutation(ENROLL_FREE_ACTIVITY, {
    fetchPolicy: "no-cache",
  });

  const config = isValidMethod ? CHECKOUT_CONFIG[method] : null;

  const toggleQuota = (id: number) =>
    setSelectedQuotaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleAllQuotas = (checked: boolean) =>
    setSelectedQuotaIds(checked ? quotas.map((q) => q.id) : []);

  const refetchAfterSuccess = () => {
    apolloClient.refetchQueries({
      include: ["MyQuotaPayments", "GetStatusMember", "GetActivityById"],
    });
  };

  const buildBilling = () => {
    const p = profileData?.me;
    const fullStreet = `${get(p, "address", "")}, ${get(p, "district", "")}`
      .trim()
      .slice(0, 40);
    console.log("Profile data for billing", p);
    return {
      firstName: get(p, "name", "") as string,
      lastName:
        `${get(p, "paternalSurname", "")} ${get(p, "maternalSurname", "")}`.trim(),
      email: get(p, "email", "") as string,
      // Izipay requires a phone number
      phoneNumber: p.phone || "123456789",
      // street has a max length of 40 chars and 5 min in Izipay, so we build it with address + district and truncate if needed
      street: fullStreet.length >= 5 ? fullStreet : "Sin dirección",
      city: (get(p, "province", "") as string) || "Lima",
      state: (get(p, "department", "") as string) || "Lima",
      country: getCountryISO(get(p, "country", "") as string),
      postalCode: DEFAULT_POSTAL_CODE,
      document: (get(p, "dni", "") as string) || "",
      documentType: "DNI",
      companyName: billing.needsInvoice ? billing.clientName : undefined,
    };
  };

  const buildTokenInput = (): GeneratePaymentTokenInput => {
    const invoiceFields = billing.needsInvoice
      ? {
          documentType: DocumentType.RUC,
          documentNumber: billing.documentNumber,
          clientName: billing.clientName,
          ...(billing.billingAddress
            ? { billingAddress: billing.billingAddress }
            : {}),
        }
      : {};

    if (isQuotes) {
      return {
        target: PaymentTargetType.QUOTA,
        quotaPaymentIds: selectedQuotaIds,
        ...invoiceFields,
      };
    }
    return {
      target: PaymentTargetType.ACTIVITY,
      targetId: activityId ?? undefined,
      ...(guests.length > 0 ? { guests } : {}),
      ...invoiceFields,
    };
  };

  const handleCallback = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: any,
    transactionId: string,
  ) => {
    // User closed the Izipay form without completing the payment.
    if (response?.code === "P54") {
      setResultStatus("canceled");
      setResultMessage(null);
      setFlowStep("result");
      return;
    }

    setResultStatus("processing");
    setFlowStep("result");
    try {
      const { data } = await confirmPayment({
        variables: {
          input: {
            transactionId,
            // Izipay Web-Core returns the signed hash and the raw answer string
            // under these keys; forward them untouched (no re-serialization).
            signature:
              response?.["kr-hash"] ?? response?.signature ?? response?.hash,
            payloadHttp:
              response?.["kr-answer"] ??
              response?.payloadHttp ??
              response?.rawClientAnswer,
            answer: response,
          },
        },
      });
      const result = get(
        data,
        "confirmPayment",
        null,
      ) as ConfirmPaymentResult | null;
      if (!result) {
        setResultStatus("serverError");
        setResultMessage(null);
        return;
      }
      setResultStatus(statusToUi(result.status));
      setResultMessage(result.message);
      if (result.status === "PAGADO") {
        refetchAfterSuccess();
      }
    } catch (error) {
      console.error("[confirmPayment] error", error);
      setResultStatus("serverError");
      setResultMessage(null);
    }
  };

  const handlePay = async () => {
    if (!isValidMethod) return;
    if (!profileData?.me) {
      toast.error("No pudimos cargar tus datos de facturación", {
        description: "Por favor, recarga la página e inténtalo de nuevo.",
      });
      return;
    }
    if (!isQuotes && activityId === null) {
      toast.error("No se encontró la actividad a pagar", {
        description: "Vuelve a la actividad e inténtalo nuevamente.",
      });
      return;
    }

    setPaying(true);
    try {
      const { data } = await generatePaymentToken({
        variables: { input: buildTokenInput() },
      });
      const token = get(
        data,
        "generatePaymentToken",
        null,
      ) as PaymentTokenResult | null;
      if (!token?.token) {
        toast.error("No se pudo generar el pago", {
          description: "Por favor, inténtalo nuevamente.",
        });
        return;
      }
      formLoadedRef.current = false;
      setTokenResult(token);
      setResultMessage(null);
      setFlowStep("pay");
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(toErrorMessage(message), {
        description: "Por favor, inténtalo nuevamente.",
      });
      // Stock/quota errors should refresh availability.
      apolloClient.refetchQueries({
        include: ["MyQuotaPayments", "GetActivityById"],
      });
    } finally {
      setPaying(false);
    }
  };

  const handleEnrollFree = async () => {
    if (isQuotes || activityId === null) return;
    setEnrolling(true);
    try {
      const { data } = await enrollFreeActivity({
        variables: { activityId },
      });
      const result = get(
        data,
        "enrollFreeActivity",
        null,
      ) as EnrollFreeActivityResult | null;
      setResultStatus("success");
      setResultMessage(result?.message ?? "Tu inscripción fue confirmada.");
      setFlowStep("result");
      refetchAfterSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(toErrorMessage(message), {
        description: "Por favor, inténtalo nuevamente.",
      });
      apolloClient.refetchQueries({ include: ["GetActivityById"] });
    } finally {
      setEnrolling(false);
    }
  };

  // Mount the Izipay form once we reach the pay step and have a fresh token.
  useEffect(() => {
    if (flowStep !== "pay" || !tokenResult || formLoadedRef.current) return;
    formLoadedRef.current = true;
    try {
      const iziConfig = buildIziConfig({
        transactionId: tokenResult.transactionId,
        orderNumber: tokenResult.orderNumber,
        amountCents: tokenResult.amountCents,
        merchantBuyerId: userId,
        billing: buildBilling(),
      });
      console.log("Izipay config", iziConfig);
      const checkout = new Izipay({ config: iziConfig.config });
      checkout.LoadForm({
        authorization: tokenResult.token,
        keyRSA: "RSA",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callbackResponse: (response: any) =>
          handleCallback(response, tokenResult.transactionId),
      });
    } catch (error) {
      console.error("[Izipay] LoadForm error", error);
      formLoadedRef.current = false;
      toast.error("No se pudo cargar el formulario de pago", {
        description: "Por favor, inténtalo nuevamente.",
      });
      setFlowStep("config");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowStep, tokenResult]);

  const handleRetry = () => {
    setResultMessage(null);
    setResultStatus("processing");
    handlePay();
  };

  const handleCancelPay = () => {
    formLoadedRef.current = false;
    setTokenResult(null);
    setFlowStep("config");
  };

  const handleExpire = () => {
    formLoadedRef.current = false;
    setResultStatus("expired");
    setResultMessage(null);
    setFlowStep("result");
  };

  if (!isValidMethod || !config) return null;

  const renderStep = () => {
    if (flowStep === "result") {
      return (
        <ResultStep
          status={resultStatus}
          message={resultMessage}
          orderNumber={tokenResult?.orderNumber}
          amount={tokenResult?.amount}
          onRetry={handleRetry}
          onHome={() => router.push(routes.home)}
        />
      );
    }

    if (flowStep === "pay") {
      return (
        <PaymentFormStep
          amount={tokenResult?.amount}
          orderNumber={tokenResult?.orderNumber}
          expiresAt={tokenResult?.expiresAt}
          onCancel={handleCancelPay}
          onExpire={handleExpire}
        />
      );
    }

    if (isQuotes) {
      return (
        <QuotaConfigStep
          quotas={quotas}
          loading={quotasLoading && quotas.length === 0}
          error={Boolean(quotasError)}
          selectedIds={selectedQuotaIds}
          onToggle={toggleQuota}
          onToggleAll={toggleAllQuotas}
          billing={billing}
          onBillingChange={setBilling}
          onPay={handlePay}
          paying={paying}
        />
      );
    }

    return (
      <ActivityConfigStep
        activity={activity}
        loading={activityLoading && !activity}
        error={Boolean(activityError) || activityId === null}
        billing={billing}
        onBillingChange={setBilling}
        guests={guests}
        onGuestsChange={setGuests}
        onPay={handlePay}
        onEnrollFree={handleEnrollFree}
        paying={paying}
        enrolling={enrolling}
      />
    );
  };

  return (
    <div className="min-h-screen bg-body/40">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(routes.home)}
            className="text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 size-4" />
            Inicio
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-base font-semibold text-primary sm:text-lg">
            {config.title}
          </h1>
        </div>
      </div>

      {/* Progress */}
      <div className="sticky top-14 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <ProgressBar
            currentStep={flowStepToNumber(flowStep)}
            totalSteps={3}
            stepLabels={config.stepLabels}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">{renderStep()}</div>
    </div>
  );
}
