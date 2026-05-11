/* eslint-disable @next/next/no-img-element */
"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GET_ALL_AGREEMENTS } from "@/graphql/query/agreement.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { IAgreement } from "@/types/agreement.type";
import { AgreementCategory } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Building2, CalendarCheck, CircleAlert, Handshake } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CATEGORY_LABELS: Record<AgreementCategory, string> = {
  [AgreementCategory.EDUCATION]: "Educación",
  [AgreementCategory.HEALTH]: "Salud",
  [AgreementCategory.COMMERCIAL]: "Comercial",
  [AgreementCategory.FINANCIAL]: "Financiero",
  [AgreementCategory.GOVERNMENT]: "Gobierno",
  [AgreementCategory.OTHER]: "Otros",
};

const CATEGORY_COLORS: Record<AgreementCategory, string> = {
  [AgreementCategory.EDUCATION]: "bg-blue-100 text-blue-700",
  [AgreementCategory.HEALTH]: "bg-emerald-100 text-emerald-700",
  [AgreementCategory.COMMERCIAL]: "bg-orange-100 text-orange-700",
  [AgreementCategory.FINANCIAL]: "bg-violet-100 text-violet-700",
  [AgreementCategory.GOVERNMENT]: "bg-red-100 text-red-700",
  [AgreementCategory.OTHER]: "bg-gray-100 text-gray-700",
};

const PAGE_SIZE = 9;

function AgreementCard({ agreement }: { agreement: IAgreement }) {
  const cat = agreement.category as AgreementCategory;
  const categoryLabel = CATEGORY_LABELS[cat] ?? agreement.category;
  const categoryColor = CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-700";
  const validUntilStr = agreement.validUntil
    ? `Hasta ${format(parseISO(agreement.validUntil), "dd MMM yyyy", { locale: es })}`
    : "Vigente indefinidamente";

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
        {agreement.coverImage ? (
          <img
            src={agreement.coverImage}
            alt={agreement.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : agreement.partnerLogo ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 px-8">
            <img
              src={agreement.partnerLogo}
              alt={agreement.partnerName ?? ""}
              className="max-h-[80px] max-w-[180px] object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Handshake className="size-12 text-primary/30" />
          </div>
        )}
        <span
          className={cn(
            "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide",
            categoryColor,
          )}
        >
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {agreement.title}
          </h3>
          {agreement.partnerName && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <Building2 className="size-3.5 shrink-0" />
              {agreement.partnerName}
            </p>
          )}
        </div>

        {agreement.benefitSummary && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {agreement.benefitSummary}
          </p>
        )}

        {agreement.tags && agreement.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {agreement.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-600"
              >
                {tag}
              </span>
            ))}
            {agreement.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-500">
                +{agreement.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
            <CalendarCheck className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{validUntilStr}</span>
          </span>
          <Link
            href={`${routes.agreements}/${agreement.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shrink-0"
          >
            Ver convenio
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="aspect-video w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="flex justify-between pt-2 border-t border-gray-50 mt-2">
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  { label: "Todas las categorías", value: "__all__" },
  ...Object.values(AgreementCategory).map((cat) => ({
    label: CATEGORY_LABELS[cat],
    value: cat,
  })),
];

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  )
    pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function AgreementPageComponent() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("__all__");

  const { data, loading, error } = useQuery(GET_ALL_AGREEMENTS, {
    variables: { page, pageSize: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const agreements: IAgreement[] =
    data?.getAgreementsFromWebsite?.agreements ?? [];
  const meta = data?.getAgreementsFromWebsite?.meta;

  const filtered =
    categoryFilter === "__all__"
      ? agreements
      : agreements.filter((a) => a.category === categoryFilter);

  const pageNumbers = getPageNumbers(page, meta?.totalPages ?? 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link
              href={routes.home}
              className="hover:text-gray-600 transition-colors"
            >
              Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Convenios</span>
          </nav>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Handshake className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Convenios
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Descubre los beneficios exclusivos que tenemos para ti a través
                de nuestros convenios institucionales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
              Categoría
            </p>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-56 border-gray-200 rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!loading && meta?.total != null && (
              <span className="text-xs text-gray-400 ml-auto">
                {meta.total} convenio{meta.total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 items-center justify-center py-20">
            <CircleAlert className="text-primary/60 size-10" />
            <p className="text-gray-500 text-sm">
              No se pudieron cargar los convenios.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 py-20">
            <div className="rounded-2xl bg-gray-50 p-5">
              <Handshake className="size-9 text-gray-300" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-600">
                No hay convenios disponibles
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Intenta con otra categoría.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            {filtered.map((agreement) => (
              <AgreementCard key={agreement.id} agreement={agreement} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-10">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-gray-400 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    "size-8 rounded-lg text-sm font-medium transition-colors",
                    page === p
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
