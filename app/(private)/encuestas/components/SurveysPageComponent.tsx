"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { GET_ACTIVE_SURVEYS } from "@/graphql/query/survey.query";
import { routes } from "@/lib/routes";
import { ISurvey } from "@/types/survey.type";
import { SurveyStatus } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, CircleAlert, ClipboardList, Users } from "lucide-react";
import Link from "next/link";

const formatDate = (date: string | null) =>
  date ? format(parseISO(date), "dd MMM yyyy", { locale: es }) : null;

function SurveyCard({ survey }: { survey: ISurvey }) {
  const datesStr =
    survey.startDate || survey.endDate
      ? survey.startDate && survey.endDate
        ? `${formatDate(survey.startDate)} – ${formatDate(survey.endDate)}`
        : survey.endDate
        ? `Hasta ${formatDate(survey.endDate)}`
        : `Desde ${formatDate(survey.startDate)}`
      : null;

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Card top band */}
      <div className="bg-primary/5 px-5 pt-5 pb-4 border-b border-primary/10">
        <div className="flex items-start justify-between gap-2">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {survey.isAnonymous && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gray-200 text-gray-600">
                Anónima
              </span>
            )}
            {survey.status === SurveyStatus.ACTIVE && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                Activa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {survey.title}
          </h3>
          {survey.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{survey.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {datesStr && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <CalendarClock className="size-3.5 shrink-0 text-primary" />
              {datesStr}
            </p>
          )}
          {survey._count != null && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Users className="size-3.5 shrink-0 text-primary" />
              {survey._count} {survey._count === 1 ? "respuesta" : "respuestas"}
            </p>
          )}
        </div>

        <div className="flex-1" />

        <div className="pt-3 border-t border-gray-100">
          <Link
            href={routes.surveys.detail(survey.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Responder encuesta
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-100 px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="h-9 w-9 rounded-xl bg-gray-200" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="pt-2 border-t border-gray-50 mt-2">
          <div className="h-8 bg-gray-200 rounded w-36" />
        </div>
      </div>
    </div>
  );
}

export default function SurveysPageComponent() {
  const { data, loading, error } = useQuery(GET_ACTIVE_SURVEYS, {
    fetchPolicy: "cache-and-network",
  });

  const surveys: ISurvey[] = data?.getActiveSurveys ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href={routes.home} className="hover:text-gray-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Encuestas</span>
          </nav>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <ClipboardList className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Encuestas</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Comparte tu opinión y ayúdanos a mejorar nuestros servicios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 items-center justify-center py-20">
            <CircleAlert className="text-primary/60 size-10" />
            <p className="text-gray-500 text-sm">No se pudieron cargar las encuestas.</p>
          </div>
        )}

        {!loading && !error && surveys.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 py-20">
            <div className="rounded-2xl bg-gray-50 p-5">
              <ClipboardList className="size-9 text-gray-300" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-600">No hay encuestas activas</h3>
              <p className="text-gray-400 text-xs mt-1">Vuelve más tarde para participar.</p>
            </div>
          </div>
        )}

        {!loading && !error && surveys.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            {surveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}