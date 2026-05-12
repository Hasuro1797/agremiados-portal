/* eslint-disable @next/next/no-img-element */
"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { GET_AGREEMENT_BY_ID } from "@/graphql/query/agreement.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { IAgreementDetail } from "@/types/agreement.type";
import { AgreementCategory } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarX2,
  ExternalLink,
  Globe,
  Handshake,
  Mail,
  Phone,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";

const CATEGORY_LABELS: Record<AgreementCategory, string> = {
  [AgreementCategory.EDUCATION]: "Educación",
  [AgreementCategory.HEALTH]: "Salud",
  [AgreementCategory.COMMERCIAL]: "Comercial",
  [AgreementCategory.FINANCIAL]: "Financiero",
  [AgreementCategory.GOVERNMENT]: "Gobierno",
  [AgreementCategory.OTHER]: "Otros",
};

const CATEGORY_COLORS: Record<AgreementCategory, string> = {
  [AgreementCategory.EDUCATION]: "bg-blue-500/90",
  [AgreementCategory.HEALTH]: "bg-emerald-500/90",
  [AgreementCategory.COMMERCIAL]: "bg-orange-500/90",
  [AgreementCategory.FINANCIAL]: "bg-violet-500/90",
  [AgreementCategory.GOVERNMENT]: "bg-red-500/90",
  [AgreementCategory.OTHER]: "bg-gray-500/90",
};

const formatDate = (date: string | null) =>
  date ? format(parseISO(date), "dd 'de' MMMM yyyy", { locale: es }) : null;

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-72 bg-gray-200 w-full" />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgreementDetailComponent({
  agreementId,
}: {
  agreementId: string;
}) {
  const { data, loading, error } = useQuery(GET_AGREEMENT_BY_ID, {
    variables: { id: +agreementId },
  });

  const agreement: IAgreementDetail | undefined =
    data?.findOneAgreementForWebsite;
  const cat = agreement?.category as AgreementCategory | undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {loading && <SkeletonDetail />}

      {(error || (!loading && !agreement)) && (
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <Handshake className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar el convenio.
            </p>
            <Link
              href={routes.agreements.home}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" /> Volver a Convenios
            </Link>
          </div>
        </div>
      )}

      {!loading && agreement && (
        <>
          {/* ── Hero Banner ── */}
          <div className="relative w-full min-h-64 sm:min-h-80 bg-gray-900 overflow-hidden">
            {agreement.coverImage ? (
              <img
                src={agreement.coverImage}
                alt={agreement.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />

            <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-end h-full min-h-64 sm:min-h-80">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
                <Link
                  href={routes.home}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </Link>
                <span>/</span>
                <Link
                  href={routes.agreements.home}
                  className="hover:text-white transition-colors"
                >
                  Convenios
                </Link>
                <span>/</span>
                <span className="text-white/90 font-medium line-clamp-1 max-w-[200px]">
                  {agreement.title}
                </span>
              </nav>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {cat && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm",
                      CATEGORY_COLORS[cat] ?? "bg-gray-500/90",
                    )}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                )}
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm",
                    agreement.validUntil
                      ? "bg-emerald-500/90 text-white"
                      : "bg-blue-500/90 text-white",
                  )}
                >
                  {agreement.validUntil
                    ? `Vigente hasta ${formatDate(agreement.validUntil)}`
                    : "Vigente indefinidamente"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 max-w-3xl">
                {agreement.title}
              </h1>

              {agreement.description && (
                <p className="text-white/70 text-sm max-w-2xl line-clamp-2">
                  {agreement.description}
                </p>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* ── LEFT COLUMN ── */}
              <div className="lg:col-span-2 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {/* Rich content */}
                {agreement.contentHtml && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                      <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Handshake className="size-4 text-primary" />
                      </span>
                      Detalles del Convenio
                    </h2>
                    <div
                      className="prose prose-sm prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-li:text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: agreement.contentHtml,
                      }}
                    />
                    {agreement.href && (
                      <a
                        href={agreement.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                      >
                        Ver más información{" "}
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </section>
                )}

                {/* Benefit summary */}
                {agreement.benefitSummary && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                      <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="size-4 text-primary" />
                      </span>
                      Resumen de Beneficios
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {agreement.benefitSummary}
                    </p>
                  </section>
                )}

                {/* Tags */}
                {agreement.tags && agreement.tags.length > 0 && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-gray-700 mb-3">
                      Etiquetas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {agreement.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
                {/* Partner card */}
                {(agreement.partnerName || agreement.partnerLogo) && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
                    {agreement.partnerLogo && (
                      <img
                        src={agreement.partnerLogo}
                        alt={agreement.partnerName ?? "Logo"}
                        className="max-h-[64px] max-w-[160px] object-contain"
                      />
                    )}
                    {agreement.partnerName && (
                      <p className="font-semibold text-gray-900 text-center text-sm">
                        {agreement.partnerName}
                      </p>
                    )}
                    {agreement.partnerWebsite && (
                      <a
                        href={agreement.partnerWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                      >
                        <Globe className="size-3.5" /> Sitio web
                      </a>
                    )}
                  </div>
                )}

                {/* Validity card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-700">Vigencia</h3>
                  {agreement.validFrom && (
                    <div className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CalendarCheck className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Inicio
                        </p>
                        <p>{formatDate(agreement.validFrom)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CalendarX2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Vencimiento
                      </p>
                      <p>
                        {agreement.validUntil
                          ? formatDate(agreement.validUntil)
                          : "Sin fecha de vencimiento"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact card */}
                {agreement.contactInfo &&
                  (agreement.contactInfo.name ||
                    agreement.contactInfo.email ||
                    agreement.contactInfo.phone) && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                      <h3 className="text-sm font-bold text-gray-700">
                        Contacto
                      </h3>
                      {agreement.contactInfo.name && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                          <User className="size-4 text-primary shrink-0" />
                          {agreement.contactInfo.name}
                        </div>
                      )}
                      {agreement.contactInfo.email && (
                        <a
                          href={`mailto:${agreement.contactInfo.email}`}
                          className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          <Mail className="size-4 text-primary shrink-0" />
                          {agreement.contactInfo.email}
                        </a>
                      )}
                      {agreement.contactInfo.phone && (
                        <a
                          href={`tel:${agreement.contactInfo.phone}`}
                          className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          <Phone className="size-4 text-primary shrink-0" />
                          {agreement.contactInfo.phone}
                        </a>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
