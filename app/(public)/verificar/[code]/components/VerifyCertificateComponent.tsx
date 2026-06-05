"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VERIFY_CERTIFICATE } from "@/graphql/query/certificate.query";
import { cn } from "@/lib/utils";
import {
  CertificateType,
  EffectiveCertificateStatus,
  VerifyCertificateResult,
} from "@/types/certificate.type";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

interface VerifyCertificateComponentProps {
  code: string;
}

const TYPE_LABELS: Record<CertificateType, string> = {
  HABILITACION: "Constancia de habilitación",
  COLEGIATURA: "Constancia de colegiatura",
  ASISTENCIA: "Constancia de asistencia",
  OTROS: "Constancia",
};

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "long",
  timeZone: "America/Lima",
});

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
};

interface StatusVisual {
  icon: React.ReactNode;
  title: string;
  className: string;
  badge: string;
}

const getStatusVisual = (
  status: EffectiveCertificateStatus,
  validUntil: string | null,
): StatusVisual => {
  switch (status) {
    case "VIGENTE":
      return {
        icon: <ShieldCheck className="size-14 text-green-600" />,
        title: "Constancia válida y vigente",
        className: "bg-green-50 border-green-200",
        badge: "bg-green-100 text-green-700 border-green-300",
      };
    case "VENCIDO":
      return {
        icon: <Clock className="size-14 text-amber-500" />,
        title: validUntil
          ? `Constancia vencida el ${formatDate(validUntil)}`
          : "Constancia vencida",
        className: "bg-amber-50 border-amber-200",
        badge: "bg-amber-100 text-amber-700 border-amber-300",
      };
    case "REVOCADO":
      return {
        icon: <ShieldX className="size-14 text-red-600" />,
        title: "Esta constancia fue revocada",
        className: "bg-red-50 border-red-200",
        badge: "bg-red-100 text-red-700 border-red-300",
      };
    case "NO_ENCONTRADO":
    default:
      return {
        icon: <ShieldAlert className="size-14 text-red-600" />,
        title: "No encontramos una constancia con ese folio",
        className: "bg-red-50 border-red-200",
        badge: "bg-red-100 text-red-700 border-red-300",
      };
  }
};

export default function VerifyCertificateComponent({
  code,
}: VerifyCertificateComponentProps) {
  const { data, loading, error, refetch } = useQuery(VERIFY_CERTIFICATE, {
    variables: { code },
    fetchPolicy: "network-only",
  });

  const result = get(data, "verifyCertificate", null) as
    | VerifyCertificateResult
    | null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="size-4 text-primary" />
          </span>
          <span className="text-sm font-bold text-primary">
            Verificación de constancia
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <NetworkErrorState onRetry={() => refetch()} />
          ) : result ? (
            <Result result={result} />
          ) : (
            <NetworkErrorState onRetry={() => refetch()} />
          )}
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-xl mx-auto px-4 py-3 text-center">
          <p className="text-[11px] text-gray-400">
            Esta verificación es pública. La constancia es auténtica si los
            datos coinciden con el documento que tienes a la vista.
          </p>
        </div>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center space-y-3 shadow-sm">
      <ShieldAlert className="size-10 text-gray-400 mx-auto" />
      <p className="text-sm font-semibold text-gray-700">
        No pudimos verificar la constancia en este momento.
      </p>
      <p className="text-xs text-gray-500">Intenta de nuevo.</p>
      <Button
        onClick={onRetry}
        className="bg-accent hover:bg-accent-hover text-white"
      >
        <RefreshCw className="mr-2 size-4" />
        Reintentar
      </Button>
    </div>
  );
}

function Result({ result }: { result: VerifyCertificateResult }) {
  const visual = getStatusVisual(result.status, result.validUntil);
  const notFound = result.status === "NO_ENCONTRADO";
  const typeLabel = result.type ? TYPE_LABELS[result.type] : "Constancia";

  return (
    <>
      {/* Status seal */}
      <div
        className={cn(
          "rounded-2xl border p-6 text-center shadow-sm space-y-3",
          visual.className,
        )}
      >
        {result.organizationName && (
          <p className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
            {result.organizationName}
          </p>
        )}
        <div className="flex justify-center pt-1">{visual.icon}</div>
        <h1 className="text-lg font-bold text-gray-900 leading-snug">
          {visual.title}
        </h1>
        <div className="flex justify-center">
          {result.status === "VIGENTE" && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
                visual.badge,
              )}
            >
              <CheckCircle2 className="size-3.5" />
              Documento auténtico
            </span>
          )}
          {result.status === "VENCIDO" && (
            <span
              className={cn(
                "inline-block rounded-full border px-3 py-1 text-[11px] font-semibold",
                visual.badge,
              )}
            >
              Vencida
            </span>
          )}
          {result.status === "REVOCADO" && (
            <span
              className={cn(
                "inline-block rounded-full border px-3 py-1 text-[11px] font-semibold",
                visual.badge,
              )}
            >
              Revocada
            </span>
          )}
        </div>
      </div>

      {/* Details card (hidden when NOT FOUND) */}
      {!notFound && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          <Row label="Folio" value={result.code} mono />
          <Row label="Tipo" value={typeLabel} />
          {result.holderName && (
            <Row label="Titular" value={result.holderName} />
          )}
          {result.holderMemberCode && (
            <Row
              label="Código colegial"
              value={result.holderMemberCode}
              mono
            />
          )}
          <Row label="Fecha de emisión" value={formatDate(result.issuedAt)} />
          <Row label="Vigencia hasta" value={formatDate(result.validUntil)} />
        </div>
      )}

      {notFound && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <p className="text-xs text-gray-500">
            Verifica que el folio sea correcto. Si llegaste por un QR del
            documento, vuelve a escanearlo desde el PDF original.
          </p>
        </div>
      )}
    </>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-xs uppercase tracking-wide font-semibold text-gray-400">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium text-gray-800 text-right",
          mono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
  );
}
