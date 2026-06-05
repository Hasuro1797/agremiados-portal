export interface HabilitationCertificate {
  url: string;
  code: string;
  issuedAt: string;
  validUntil: string;
}

export type EffectiveCertificateStatus =
  | "VIGENTE"
  | "VENCIDO"
  | "REVOCADO"
  | "NO_ENCONTRADO";

export type CertificateType =
  | "HABILITACION"
  | "COLEGIATURA"
  | "ASISTENCIA"
  | "OTROS";

export interface VerifyCertificateResult {
  valid: boolean;
  status: EffectiveCertificateStatus;
  code: string;
  type: CertificateType | null;
  holderName: string | null;
  holderMemberCode: string | null;
  organizationName: string | null;
  issuedAt: string | null;
  validUntil: string | null;
}
