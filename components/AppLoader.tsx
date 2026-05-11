"use client";

import { useOrganization } from "@/providers/organization-provider";
import Logo from "@/components/Logo";
import { useEffect, useState } from "react";

export function AppLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useOrganization();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <>
      {children}
      {visible && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-secondary transition-opacity duration-500 ${
            !loading ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="animate-pulse">
              <Logo width={80} height={80} />
            </div>

            <div className="w-48 h-1 rounded-full bg-primary/20 overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[slide_1.4s_ease-in-out_infinite]" />
            </div>

            <p className="text-sm text-primary/60 font-medium tracking-widest uppercase">
              Cargando
            </p>
          </div>
        </div>
      )}
    </>
  );
}
