"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MY_HABILITATION_CERTIFICATE } from "@/graphql/query/certificate.query";
import { routes } from "@/lib/routes";
import { HabilitationCertificate } from "@/types/certificate.type";
import { useLazyQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Download,
  FileText,
  Hash,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ErrorKind = "OVERDUE" | "INACTIVE" | "GENERIC";

const classifyError = (message: string): ErrorKind => {
  const m = message.toLowerCase();
  if (m.includes("cuota") && (m.includes("vencida") || m.includes("vencidas"))) {
    return "OVERDUE";
  }
  if (m.includes("no está activa") || m.includes("no esta activa")) {
    return "INACTIVE";
  }
  return "GENERIC";
};

const formatDate = (iso: string) => {
  try {
    return format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return iso;
  }
};

export default function HabilitationCertificatePageComponent() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fetchCertificate, { data, loading }] = useLazyQuery(
    MY_HABILITATION_CERTIFICATE,
    {
      fetchPolicy: "no-cache",
      onError: (err) => {
        setErrorMsg(err.message);
      },
      onCompleted: (res) => {
        const cert = get(res, "myHabilitationCertificate", null) as
          | HabilitationCertificate
          | null;
        if (cert?.url) {
          window.open(cert.url, "_blank", "noopener,noreferrer");
        }
      },
    },
  );

  const certificate = (get(data, "myHabilitationCertificate", null) ??
    null) as HabilitationCertificate | null;

  const expired = useMemo(() => {
    if (!certificate?.validUntil) return false;
    return new Date(certificate.validUntil).getTime() < Date.now();
  }, [certificate?.validUntil]);

  const errorKind = errorMsg ? classifyError(errorMsg) : null;

  const handleGenerate = () => {
    setErrorMsg(null);
    fetchCertificate();
  };

  // Clear inline error when a new request succeeds.
  useEffect(() => {
    if (data) setErrorMsg(null);
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">
              Constancia de habilitación
            </h1>
            <p className="text-sm text-gray-500">
              Genera y descarga tu constancia vigente como miembro habilitado.
            </p>
          </header>

          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="size-7 text-primary" />
              </span>
              <div className="space-y-1 max-w-md">
                <p className="text-base font-semibold text-primary">
                  {certificate
                    ? expired
                      ? "Tu constancia anterior venció"
                      : "Tu constancia está lista"
                    : "Solicita tu constancia"}
                </p>
                <p className="text-sm text-gray-500">
                  Si ya tienes una constancia vigente la reutilizamos; si no, se
                  emite en el momento. La vigencia es de 30 días.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
                className="bg-accent hover:bg-accent-hover text-white"
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Download className="mr-2 size-4" />
                )}
                {certificate && !expired
                  ? "Volver a descargar"
                  : expired
                    ? "Generar nueva constancia"
                    : "Generar / Descargar constancia"}
              </Button>
            </CardContent>
          </Card>

          {errorMsg && errorKind && (
            <ErrorPanel kind={errorKind} message={errorMsg} />
          )}

          {certificate && (
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-primary flex items-center gap-2">
                  <BadgeCheck className="size-4" />
                  Detalle del documento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row
                  icon={<Hash className="size-4 text-primary" />}
                  label="Folio"
                  value={certificate.code}
                />
                <Row
                  icon={<CalendarDays className="size-4 text-primary" />}
                  label="Fecha de emisión"
                  value={formatDate(certificate.issuedAt)}
                />
                <Row
                  icon={<CalendarDays className="size-4 text-primary" />}
                  label="Vigente hasta"
                  value={formatDate(certificate.validUntil)}
                  highlight={expired ? "expired" : "ok"}
                />

                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-2"
                >
                  <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 size-4" />
                    Abrir PDF
                  </a>
                </Button>

                <p className="text-xs text-gray-400 text-center pt-2">
                  La constancia puede verificarse públicamente por su folio.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: "ok" | "expired";
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 last:border-0">
      <span className="flex items-center gap-2 text-gray-500">
        {icon}
        {label}
      </span>
      <span
        className={
          highlight === "expired"
            ? "font-semibold text-red-600"
            : "font-semibold text-primary"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ErrorPanel({
  kind,
  message,
}: {
  kind: ErrorKind;
  message: string;
}) {
  if (kind === "OVERDUE") {
    return (
      <Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800">
                Tienes cuotas vencidas
              </p>
              <p className="text-sm text-amber-700">{message}</p>
            </div>
          </div>
          <Button asChild className="w-full bg-accent hover:bg-accent-hover">
            <Link href={routes.myPayments}>
              Ir a mis pagos
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (kind === "INACTIVE") {
    return (
      <Card className="rounded-2xl border-red-200 bg-red-50 shadow-sm">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-800">
                Tu cuenta no está activa
              </p>
              <p className="text-sm text-red-700">{message}</p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={routes.support.new}>
              Abrir un reclamo
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-red-200 bg-red-50 shadow-sm">
      <CardContent className="py-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-red-800">
              No pudimos emitir tu constancia
            </p>
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
