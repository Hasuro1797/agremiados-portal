"use client";
import ActivitiesSection from "@/components/home/ActivitiesSection";
// import CertificateSection from "@/components/home/CertificateSection";
import HeroBanner from "@/components/home/HeroBanner";
import HomeNavbar from "@/components/home/HomeNavbar";
import InfoSection from "@/components/home/InfoSection";
import QuickAccessGrid from "@/components/home/QuickAccessGrid";
import UserSidebar from "@/components/home/UserSidebar";
import Footer from "@/components/Footer";
import { useUserStore } from "@/providers/user-provider";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function WelcomeGreeting() {
  const { name, paternalSurname } = useUserStore((s) => s);
  return (
    <div className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <p className="text-xs font-medium text-gray-400">{getGreeting()},</p>
        <h1 className="text-xl font-bold text-primary leading-tight">
          {name} {paternalSurname}
        </h1>
      </div>
      <p
        className="text-xs text-gray-400 hidden sm:block text-right shrink-0 capitalize"
        suppressHydrationWarning
      >
        {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <div className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-24">
              <UserSidebar />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Mobile: compact user status strip */}
            <div className="lg:hidden">
              <UserSidebar />
            </div>

            <WelcomeGreeting />
            <HeroBanner />
            <QuickAccessGrid />
            <ActivitiesSection />
            <InfoSection />
            {/* <CertificateSection /> */}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
