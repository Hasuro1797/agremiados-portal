export type InvoiceStatus =
  | "PENDIENTE"
  | "PAGADO"
  | "FACTURADO"
  | "EXPIRADO"
  | "CANCELADO"
  | "FALLIDO";

export type InvoiceItemType = "QUOTA" | "ACTIVITY_ATTENDEE" | "OTHER";

export type BillingDocumentType = "PDF" | "XML_SIGNED" | "CDR_ZIP";

export interface BillingDocument {
  type: BillingDocumentType;
  url: string;
}

export interface InvoiceDetail {
  description: string;
  quantity: number;
  price: number;
  itemType: InvoiceItemType;
}

export interface MyPayment {
  id: number;
  orderNumber: string;
  status: InvoiceStatus;
  sunatStatus?: string | null;
  series?: string | null;
  sequential?: string | null;
  total: number;
  currency: string;
  createdAt: string;
  details: InvoiceDetail[];
  billingDocuments: BillingDocument[];
}

export interface MyPaymentsResult {
  data: MyPayment[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}
