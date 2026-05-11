"use client";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/organization-provider";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  Handshake,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

interface QuickItem {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  iconClass: string;
  bgClass: string;
  accentClass: string;
  show: boolean;
}

export default function QuickAccessGrid() {
  const { organization } = useOrganization();

  const items: QuickItem[] = [
    {
      label: "Calendario",
      description: "Consulta actividades y próximos eventos",
      icon: CalendarDays,
      href: routes.schedule,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
      accentClass: "group-hover:bg-blue-100 group-hover:border-blue-200",
      show: true,
    },
    {
      label: "Pagar Cuota",
      description: "Mantén tus pagos al día de forma rápida",
      icon: CreditCard,
      href: `${routes.checkout}/quotes`,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
      accentClass: "group-hover:bg-amber-50/50 group-hover:border-amber-200",
      show: !!organization?.moduleQuotes,
    },
    {
      label: "Convenios",
      description: "Descuentos y beneficios exclusivos",
      icon: Handshake,
      href: routes.agreements,
      iconClass: "text-violet-600",
      bgClass: "bg-violet-50",
      accentClass: "group-hover:bg-violet-50/50 group-hover:border-violet-200",
      show: !!organization?.moduleAgreements,
    },
    {
      label: "Encuestas",
      description: "Participa y comparte tu opinión",
      icon: BarChart3,
      href: routes.surveys.home,
      iconClass: "text-teal-600",
      bgClass: "bg-teal-50",
      accentClass: "group-hover:bg-teal-50/50 group-hover:border-teal-200",
      show: !!organization?.moduleSurveys,
    },
    {
      label: "Reservas",
      description: "Reserva espacios y servicios del colegio",
      icon: Building2,
      href: routes.spaces.home,
      iconClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
      accentClass: "group-hover:bg-indigo-50/50 group-hover:border-indigo-200",
      show: !!organization?.moduleReservations,
    },
    {
      label: "Comunicados",
      description: "Mantente informado con las últimas noticias",
      icon: Megaphone,
      href: routes.communications.home,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50",
      accentClass: "group-hover:bg-rose-50/50 group-hover:border-rose-200",
      show: !!organization?.modulePosts,
    },
  ].filter((item) => item.show);

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Accesos Rápidos
      </h3>

      {/* Mobile: 2-col compact grid — md+: 3-col rich cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ animationDelay: `${index * 70}ms` }}
            className={cn(
              "group relative bg-white rounded-2xl border border-gray-100 shadow-sm",
              "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
              "animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards",
              item.accentClass,
            )}
          >
            {/* Mobile layout: horizontal */}
            <div className="flex md:hidden items-center gap-3 p-3.5">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
                  item.bgClass,
                )}
              >
                <item.icon className={cn("size-5", item.iconClass)} />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors leading-tight">
                {item.label}
              </span>
            </div>

            {/* Desktop layout: vertical with description */}
            <div className="hidden md:flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "size-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
                    item.bgClass,
                  )}
                >
                  <item.icon className={cn("size-5", item.iconClass)} />
                </div>
                <ArrowRight
                  className={cn(
                    "size-4 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary mt-1",
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-primary leading-tight">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
