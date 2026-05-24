export enum PaymentTargetType {
  QUOTA = "QUOTA",
  ACTIVITY = "ACTIVITY",
}

export enum DocumentType {
  DNI = "DNI",
  RUC = "RUC",
  CE = "CE",
  PASAPORTE = "PASAPORTE",
  OTROS = "OTROS",
}

export enum ActivityAudience {
  MEMBERS_ONLY = "MEMBERS_ONLY",
  MEMBERS_AND_GUESTS = "MEMBERS_AND_GUESTS",
  OPEN = "OPEN",
}

export interface Guest {
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
}

export type PaymentResultStatus =
  | "PAGADO"
  | "CANCELADO"
  | "FALLIDO"
  | "EXPIRADO"
  | "PENDIENTE";

export interface GeneratePaymentTokenInput {
  target: PaymentTargetType;
  targetId?: number;
  quotaPaymentIds?: number[];
  guests?: Guest[];
  documentType?: DocumentType;
  documentNumber?: string;
  clientName?: string;
  billingAddress?: string;
}

export interface EnrollFreeActivityResult {
  attendeeId: number;
  activityId: number;
  status: string;
  message: string;
}

export interface PaymentTokenResult {
  token: string;
  transactionId: string;
  orderNumber: string;
  invoiceId: number;
  amount: number;
  amountCents: string;
  expiresAt: string;
  reused: boolean;
  raw?: string;
}

export interface ConfirmPaymentInput {
  transactionId: string;
  signature?: string;
  payloadHttp?: string;
  answer?: Record<string, unknown>;
}

export interface ConfirmPaymentResult {
  status: PaymentResultStatus;
  orderNumber: string;
  approved: boolean;
  message: string;
}

export interface QuotaPeriod {
  id: number;
  year: number;
  month: number;
  amount: number;
  dueDate: string;
}

export interface QuotaPayment {
  id: number;
  status: string;
  paidAt?: string | null;
  invoiceId?: number | null;
  isOverdue: boolean;
  period: QuotaPeriod;
}

export interface ActivityForCheckout {
  id: number;
  title: string;
  type: string;
  date: string;
  price: number;
  priceInvitee?: number;
  priceExternal?: number;
  hasPrice: boolean;
  stock: number;
  stockUsed: number;
  guestStock?: number;
  audience?: string;
  status?: string;
}

export interface BillingFormData {
  needsInvoice: boolean;
  documentNumber: string;
  clientName: string;
  billingAddress: string;
}

export type CheckoutMethodType = "quotes" | "academicEvents" | "socialEvents";
