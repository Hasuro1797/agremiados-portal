const URL_SERVER_IPN = process.env.NEXT_PUBLIC_URL_SERVER_IPN;
const MERCHANT_CODE = process.env.NEXT_PUBLIC_IZIPAY_MERCHANT_CODE;

// Izipay calls the IPN from its own servers, so a localhost URL is unreachable.
// Only send urlIPN when it is a public address (e.g. a deployed backend or a
// tunnel like ngrok). Locally the payment is confirmed via confirmPayment.
const isPublicIpn =
  !!URL_SERVER_IPN && !/localhost|127\.0\.0\.1/.test(URL_SERVER_IPN);

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

export const getCountryISO = (countryName?: string): string => {
  if (!countryName) return "PE";
  return COUNTRY_ISO_MAP[countryName.toUpperCase()] || "PE";
};

export interface IziBilling {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  document: string;
  documentType: string;
  companyName?: string;
}

export type IziFormType = "embedded" | "pop-up";

/**
 * Where/how the Izipay Web-Core form is rendered.
 * "embedded" mounts the card form inside our themed checkout flow (recommended);
 * "pop-up" opens it as a modal. Switching is a one-line change here.
 */
export const IZIPAY_FORM_TYPE: IziFormType = "embedded";

/** CSS selector of the container that hosts the embedded form. */
export const IZIPAY_CONTAINER_ID = "izipay-checkout-form";

export interface BuildIziConfigParams {
  transactionId: string;
  orderNumber: string;
  /** Amount in céntimos as a string, exactly as returned by generatePaymentToken. */
  amountCents: string;
  merchantBuyerId: string;
  billing: IziBilling;
}

const getCurrentTransactionTime = () => (Date.now() * 1000).toString();

export const buildIziConfig = ({
  transactionId,
  orderNumber,
  amountCents,
  merchantBuyerId,
  billing,
}: BuildIziConfigParams) => {
  const render =
    IZIPAY_FORM_TYPE === "embedded"
      ? {
          typeForm: "embedded",
          container: `#${IZIPAY_CONTAINER_ID}`,
          showButtonProcessForm: true,
        }
      : { typeForm: "pop-up" };

  return {
    config: {
      transactionId,
      action: "pay",
      merchantCode: MERCHANT_CODE,
      order: {
        orderNumber,
        currency: "PEN",
        amount: amountCents,
        processType: "AT",
        merchantBuyerId,
        dateTimeTransaction: getCurrentTransactionTime(),
        payMethod: "CARD,YAPE_CODE,QR,PAGO_PUSH",
      },
      billing: {
        firstName: billing.firstName,
        lastName: billing.lastName,
        email: billing.email,
        phoneNumber: billing.phoneNumber,
        street: billing.street,
        city: billing.city,
        state: billing.state,
        country: billing.country,
        postalCode: billing.postalCode,
        document: billing.document,
        documentType: billing.documentType,
        ...(billing.companyName ? { companyName: billing.companyName } : {}),
      },
      render,
      ...(isPublicIpn ? { urlIPN: URL_SERVER_IPN } : {}),
      appearance: {
        theme: "blue",
      },
    },
  };
};
