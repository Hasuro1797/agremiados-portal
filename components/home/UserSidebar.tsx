"use client";
import CustomAvatar from "@/components/CustomAvatar";
import { Button } from "@/components/ui/button";
import { GET_PROFILE_MEMBER } from "@/graphql/query/member.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/organization-provider";
import { useUserStore } from "@/providers/user-provider";
import { UserStatus } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { CreditCard, FileText, ReceiptText } from "lucide-react";
import Link from "next/link";
import MiniCalendar from "./MiniCalendar";
import { get } from "lodash";
import { Skeleton } from "../ui/skeleton";
import { Fragment } from "react";

const STATUS_MAP: Record<
  UserStatus,
  { label: string; color: string; dot: string }
> = {
  [UserStatus.ACTIVE]: {
    label: "HABILITADO",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  [UserStatus.INACTIVE]: {
    label: "INACTIVO",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  [UserStatus.SUSPENDED]: {
    label: "SUSPENDIDO",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  [UserStatus.BLOCKED]: {
    label: "BLOQUEADO",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export default function UserSidebar() {
  const { name, paternalSurname, maternalSurname, avatar, status } =
    useUserStore((state) => state);
  const { organization } = useOrganization();
  const { data: profileData, loading } = useQuery(GET_PROFILE_MEMBER, {
    fetchPolicy: "cache-and-network",
  });

  const cip = get(profileData, "me.memberCode", null);
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP[UserStatus.INACTIVE];

  return (
    <aside className="flex flex-col gap-4">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent px-5 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          {loading ? (
            <Skeleton className="size-20 rounded-full" />
          ) : (
            <div className="relative">
              <CustomAvatar
                avatar={avatar}
                name={name}
                last_name={paternalSurname}
                styleAvatar="size-20 ring-2 ring-primary/30 ring-offset-2"
                styleFallback="bg-primary text-white text-xl font-semibold"
              />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-5 rounded-full border-2 border-white",
                  statusInfo.dot,
                )}
              />
            </div>
          )}

          {loading ? (
            <Fragment>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </Fragment>
          ) : (
            <div>
              <p className="font-bold text-primary text-sm leading-snug">
                Dr(a). {name} {paternalSurname}
              </p>
              {maternalSurname && (
                <p className="text-xs text-gray-400 mt-0.5">{maternalSurname}</p>
              )}
            </div>
          )}

          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border",
                statusInfo.color,
              )}
            >
              {statusInfo.label}
              {cip && (
                <span className="opacity-60 font-normal">• CAL: {cip}</span>
              )}
            </div>
          )}
        </div>

        {/* Lower section */}
        <div className="px-5 pb-5">
          <div className="border-t border-gray-100 mb-4" />

          <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
              Tipo de Socio
            </p>
            {loading ? (
              <Skeleton className="h-5 w-20 mt-2 mx-auto" />
            ) : (
              <p className="text-xs font-bold text-primary mt-0.5 capitalize">
                {get(profileData, "me.memberCategory", "—").toLowerCase()}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {organization?.moduleQuotes && (
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent-hover text-white h-10 text-sm font-semibold gap-2"
              >
                <Link href={`${routes.checkout}/quotes`}>
                  <CreditCard className="size-4" />
                  Pagar Cuota
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/5 h-10 text-sm gap-2"
            >
              <Link href={routes.myPayments}>
                <ReceiptText className="size-4" />
                Mis pagos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/5 h-10 text-sm gap-2"
            >
              <Link href={routes.privates.updateData}>
                <FileText className="size-4" />
                Ver Estado de Cuenta
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mini calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <MiniCalendar />
      </div>
    </aside>
  );
}
