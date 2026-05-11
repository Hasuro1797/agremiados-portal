"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_ALL_ACTIVITIES } from "@/graphql/query/activity.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/organization-provider";
import { IActivity } from "@/types/activities";
import { ActivityType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import { ChevronRight, GraduationCap, PartyPopper } from "lucide-react";
import Link from "next/link";

function ActivityRow({
  title,
  date,
  accent,
}: {
  title: string;
  date: string;
  accent?: boolean;
}) {
  let dateObj: Date;
  try {
    dateObj = new Date(date);
  } catch {
    return null;
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 -mx-1 px-1 rounded-lg hover:bg-gray-50/60 transition-colors cursor-default">
      <div
        className={cn(
          "shrink-0 flex flex-col items-center justify-center size-12 rounded-xl text-white",
          accent ? "bg-accent" : "bg-primary",
        )}
      >
        <span className="text-base font-bold leading-none">
          {format(dateObj, "dd")}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wide opacity-90 mt-0.5">
          {format(dateObj, "MMM", { locale: es })}
        </span>
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-semibold text-primary line-clamp-2 leading-snug">
          {title}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          {format(dateObj, "HH:mm 'hrs'", { locale: es })}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  viewAllHref,
  children,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  viewAllHref: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-8 rounded-lg flex items-center justify-center",
              accent ? "bg-accent/10" : "bg-primary/10",
            )}
          >
            <Icon
              className={cn("size-4", accent ? "text-accent" : "text-primary")}
            />
          </div>
          <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">
            {title}
          </h3>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors font-semibold"
        >
          Ver todo
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function ActivitiesSection() {
  const { organization } = useOrganization();

  const skip = !organization?.moduleEvents;

  const { data: academicData, loading: academicLoading } = useQuery(
    GET_ALL_ACTIVITIES,
    {
      variables: {
        page: 1,
        pageSize: 3,
        filters: {
          type: ActivityType.ACADEMIC,
        },
      },
      fetchPolicy: "cache-and-network",
      skip,
    },
  );
  const { data: socialData, loading: socialLoading } = useQuery(
    GET_ALL_ACTIVITIES,
    {
      variables: {
        page: 1,
        pageSize: 3,
        filters: {
          type: ActivityType.SOCIAL,
        },
      },
      fetchPolicy: "cache-and-network",
      skip,
    },
  );

  if (!organization?.moduleEvents) return null;

  const academic: IActivity[] = get(
    academicData,
    "getActivitiesFromWebsite.activities",
    [],
  );
  const social: IActivity[] = get(
    socialData,
    "getActivitiesFromWebsite.activities",
    [],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SectionCard
        title="Agenda Académica"
        icon={GraduationCap}
        viewAllHref={routes.activities.home}
      >
        {academicLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : academic.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No hay eventos académicos próximos
          </p>
        ) : (
          academic.map((a) => (
            <ActivityRow key={a.id} title={a.title} date={a.date} />
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Eventos Sociales"
        icon={PartyPopper}
        viewAllHref={routes.schedule}
        accent
      >
        {socialLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : social.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No hay eventos sociales próximos
          </p>
        ) : (
          social.map((a) => (
            <ActivityRow key={a.id} title={a.title} date={a.date} accent />
          ))
        )}
      </SectionCard>
    </div>
  );
}
