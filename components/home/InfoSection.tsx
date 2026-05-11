"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_ALL_POSTS_BANNER } from "@/graphql/query/post.query";
import { GET_ACTIVE_SURVEYS } from "@/graphql/query/survey.query";
import { routes } from "@/lib/routes";
import { useOrganization } from "@/providers/organization-provider";
import { IPost } from "@/types/activities";
import { PostType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Megaphone,
  Radio,
} from "lucide-react";
import Link from "next/link";

export default function InfoSection() {
  const { organization } = useOrganization();

  const showComms = !!organization?.modulePosts;
  const showSurveys = !!organization?.moduleSurveys;

  const { data: commsData, loading: commsLoading } = useQuery(
    GET_ALL_POSTS_BANNER,
    {
      variables: { type: PostType.COMMUNICATIONS },
      fetchPolicy: "cache-and-network",
      skip: !showComms,
    },
  );

  const { data: surveysData, loading: surveysLoading } = useQuery(
    GET_ACTIVE_SURVEYS,
    {
      fetchPolicy: "cache-and-network",
      skip: !showSurveys,
    },
  );

  if (!showComms && !showSurveys) return null;

  const communications: IPost[] = (
    get(commsData, "findPostsFromBanner", []) as IPost[]
  ).slice(0, 2);

  const activeSurveys: {
    id: number;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    _count?: number;
  }[] = (get(surveysData, "getActiveSurveys", []) as []).slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Communications */}
      {showComms && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <Megaphone className="size-4 text-rose-600" />
              </div>
              <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">
                Comunicados
              </h3>
            </div>
            <Link
              href={routes.communications.home}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors font-semibold"
            >
              Ver todos
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {commsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : communications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay comunicados recientes
            </p>
          ) : (
            <div className="space-y-1">
              {communications.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 -mx-1 px-1 rounded-lg hover:bg-gray-50/60 transition-colors"
                >
                  <div className="shrink-0 size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Radio className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`${routes.communications.home}/${post.id}`}
                      className="text-sm font-semibold text-primary line-clamp-1 hover:text-primary/80 transition-colors"
                      target={post.href ? "_blank" : undefined}
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Surveys / Participation */}
      {showSurveys && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <BarChart3 className="size-4 text-teal-600" />
              </div>
              <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">
                Encuestas Activas
              </h3>
            </div>
            <Link
              href={routes.surveys.home}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors font-semibold"
            >
              Ver todas
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {surveysLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : activeSurveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <ClipboardList className="size-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">
                No hay encuestas activas en este momento
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {activeSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 -mx-1 px-1 rounded-lg hover:bg-gray-50/60 transition-colors"
                >
                  <div className="shrink-0 size-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <ClipboardList className="size-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={routes.surveys.detail(survey.id)}
                      className="text-sm font-semibold text-primary line-clamp-1 hover:text-primary/80 transition-colors"
                    >
                      {survey.title}
                    </Link>
                    {survey.endDate && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Hasta el{" "}
                        {format(parseISO(survey.endDate), "dd 'de' MMMM", {
                          locale: es,
                        })}
                      </p>
                    )}
                  </div>
                  <Link
                    href={routes.surveys.detail(survey.id)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wide hover:bg-teal-100 transition-colors"
                  >
                    Participar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
