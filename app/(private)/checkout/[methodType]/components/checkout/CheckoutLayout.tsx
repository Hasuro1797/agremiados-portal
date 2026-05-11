import type { ReactNode } from "react";

interface CheckoutLayoutProps {
  children: ReactNode;
}

export function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return <div className="min-h-screen">{children}</div>;
}
