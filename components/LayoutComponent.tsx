import React from "react";
import Footer from "./Footer";
import DropdownAvatar from "./DropdownAvatar";
import { cn } from "@/lib/utils";

export default function LayoutComponent({
  children,
  footer = true,
  header = true,
  contanier = "md:px-8 lg:px-10 max-w-screen-2xl mx-auto",
}: {
  children: React.ReactNode;
  footer?: boolean;
  header?: boolean;
  contanier?: string;
}) {
  return (
    <main className="grid grid-rows-layout-2 min-h-screen">
      <section className="relative w-full">
        <div className="absolute -z-10 inset-0 bg-[url(/assets/backbghome.png)] bg-cover"></div>
        <div className={cn("px-4 sm:px-6 w-full flex flex-col", contanier)}>
          {header && (
            <div className="flex pt-4 w-full md:pt-4 pb-3 justify-end items-center">
              <DropdownAvatar />
            </div>
          )}
          {children}
        </div>
      </section>
      {footer && <Footer />}
    </main>
  );
}
