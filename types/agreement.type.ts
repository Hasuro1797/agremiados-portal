import { AgreementCategory, AgreementStatus } from "@/utils/enum";

export interface IAgreementMeta {
  page: number;
  total: number;
  totalPages: number;
}

export interface IAgreementContactInfo {
  name?: string;
  email?: string;
  phone?: string;
}

/** Campos devueltos por getAgreementsFromWebsite (listado paginado) */
export interface IAgreement {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  coverImage: string | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerWebsite: string | null;
  benefitSummary: string | null;
  category: AgreementCategory;
  validFrom: string | null;
  validUntil: string | null;
  tags: string[] | null;
  publishedAt: string | null;
}

/** Campos devueltos por findOneAgreementForWebsite (detalle completo) */
export interface IAgreementDetail extends IAgreement {
  content: Record<string, unknown> | null; // JSON TipTap
  contentHtml: string | null;
  href: string | null;
  status: AgreementStatus;
  contactInfo: IAgreementContactInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAgreementsResponse {
  agreements: IAgreement[];
  meta: IAgreementMeta;
}
