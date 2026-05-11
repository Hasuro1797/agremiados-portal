import { PaymentType } from "@/utils/enum";
import { LawyerProfile } from "./lawyer.type";

export type EventDiscount = {
  id: number;
  name: string;
  percentage: number;
};

export type InvoiceConfig = {
  idDocument: "01" | "03";
  clientName: string;
  documentType: "DNI" | "RUC";
  documentNumber: string;
  billingAddress: string;
  saleCondition: "CONTADO";
};

export type AmountForQuote = {
  socialAmount: {
    total: number;
    percentageDiscount: number;
    totalWithDiscount: number;
  };
  mutualAmount: {
    total: number;
    percentageDiscount: number;
    totalWithDiscount: number;
  };
  periodFrom: string;
  quantityInstallments: number;
  discountId?: number;
};

export type QuoteInfo = {
  periodFrom: string;
  periodTo: string;
};

export type InviteeInfo = {
  name: string;
  lastname: string;
  dni: string;
};

export type Discount = {
  id: number;
  name: string;
  percentage: number;
  quotesNumber: number;
};

export type LawyerLastQuote = {
  periodFrom: string;
  totalQuotes: number;
  discounts: {
    available: boolean;
    data: Discount[];
  };
};

export interface BillinInfo extends LawyerProfile {
  zipCode: string;
  socialReason: string;
}

export type Items = {
  description: string;
  quantity: number;
  price: number;
  discount?: number;
  unitOfMeasure?: string;
  paymentType: PaymentType;
  relatedId?: number;
  relatedType?: string;
  reservationId?: string;
};
export interface OrderPayment {
  total: number;
  billingData: BillinInfo;
  withIGV: boolean;
  quoteInfo?: QuoteInfo;
  invitees?: InviteeInfo[];
  items: Items[];
  invoiceConfig: InvoiceConfig;
}
