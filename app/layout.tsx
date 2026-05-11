import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn, hexToHsl } from "@/lib/utils";
import Script from "next/script";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

const inter = Inter({
  preload: true,
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Portal del Agremiado",
  description:
    "Portal exclusivo para miembros. Acceda a recursos como constancias de habilitación, participar en actividades académicas, sociales entre otras.",
};

// ---------------------------------------------------------------------------
// Inline script: reads localStorage("org-theme") synchronously before paint
// to avoid FOUC when the Apollo query hasn't resolved yet.
// ---------------------------------------------------------------------------
const THEME_PRELOAD_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem('org-theme')||'{}');var s=document.documentElement.style;if(t.primary)s.setProperty('--primary',t.primary);if(t.primaryLight)s.setProperty('--primary-light',t.primaryLight);if(t.accent)s.setProperty('--accent',t.accent);if(t.accentHover)s.setProperty('--accent-hover',t.accentHover);}catch(e){}}())`;

interface OrgColors {
  primaryColor?: string;
  primaryLight?: string;
  accentColor?: string;
  accentHover?: string;
}

// Server-side color fetch with 5-min revalidation cache (zero FOUC on first visit).
async function fetchOrgColors(): Promise<OrgColors | null> {
  const base = process.env.NEXT_PUBLIC_URL_SERVER;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ getPublicOrganization { primaryColor primaryLight accentColor accentHover } }`,
      }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data?.getPublicOrganization as OrgColors) ?? null;
  } catch {
    return null;
  }
}

function buildColorStyle(colors: OrgColors): string {
  let vars = "";
  if (colors.primaryColor) {
    const [h, s, l] = hexToHsl(colors.primaryColor);
    vars += `--primary: ${h} ${s}% ${l}%;`;
  }
  if (colors.primaryLight) {
    const [h, s, l] = hexToHsl(colors.primaryLight);
    vars += `--primary-light: ${h} ${s}% ${l}%;`;
  }
  if (colors.accentColor) {
    const [h, s, l] = hexToHsl(colors.accentColor);
    vars += `--accent: ${h} ${s}% ${l}%;`;
  }
  if (colors.accentHover) {
    const [h, s, l] = hexToHsl(colors.accentHover);
    vars += `--accent-hover: ${h} ${s}% ${l}%;`;
  }
  return vars ? `:root{${vars}}` : "";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const colors = await fetchOrgColors();
  const colorStyle = colors ? buildColorStyle(colors) : "";

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Synchronous preload: apply cached theme before paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_PRELOAD_SCRIPT }} />
        {/* Server-fetched colors injected inline — zero FOUC on first visit */}
        {colorStyle && (
          <style dangerouslySetInnerHTML={{ __html: colorStyle }} />
        )}
      </head>
      <body className={cn("font-inter antialiased bg-body", inter.variable)}>
        <Script
          src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"
          strategy="beforeInteractive"
        />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
