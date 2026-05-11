"use client";
import DropdownAvatar from "@/components/DropdownAvatar";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/organization-provider";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeNavbar() {
  const { organization } = useOrganization();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Inicio", href: routes.home, show: true },
    { label: "Calendario", href: routes.schedule, show: true },
    {
      label: "Actividades",
      href: routes.activities.home,
      show: !!organization?.moduleEvents,
    },
    {
      label: "Comunicados",
      href: routes.communications.home,
      show: !!organization?.modulePosts,
    },
    {
      label: "Convenios",
      href: routes.agreements,
      show: !!organization?.moduleAgreements,
    },
    {
      label: "Encuestas",
      href: routes.surveys.home,
      show: !!organization?.moduleSurveys,
    },
    {
      label: "Espacios",
      href: routes.spaces.home,
      show: !!organization?.moduleReservations,
    },
  ].filter((item) => item.show);

  return (
    <>
      <header
        className={cn(
          "bg-white sticky top-0 z-40 transition-all duration-200 border-b border-gray-100",
          scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.07)]" : "shadow-sm",
        )}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo + name */}
            <Link
              href={routes.home}
              className="flex items-center gap-3 shrink-0"
            >
              <Logo width={36} height={36} />
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-bold text-primary">
                  {organization?.name ?? "Portal del Agremiado"}
                </p>
                <p className="text-[10px] text-gray-400">
                  Portal del Agremiado
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-gray-500 hover:text-primary hover:bg-gray-50",
                    )}
                  >
                    {item.label}
                    {/* Animated underline indicator */}
                    <span
                      className={cn(
                        "absolute bottom-0 h-0.5 rounded-full bg-primary transition-all duration-300",
                        isActive
                          ? "left-2 right-2 opacity-100"
                          : "left-1/2 right-1/2 opacity-0",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              <NotificationBell />
              <DropdownAvatar isEditable />
              <button
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menú"
              >
                {mobileOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 border-l-2",
                        isActive
                          ? "text-primary bg-primary/5 font-semibold border-primary"
                          : "text-gray-600 hover:text-primary hover:bg-gray-50 border-transparent",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
