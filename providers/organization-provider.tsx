"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { GET_PUBLIC_ORGANIZATION } from "@/graphql/query/organization.query";
import { hexToHsl } from "@/lib/utils";

export interface PublicOrganization {
  name: string | null;
  logo: string | null;
  description: string | null;
  favicon: string | null;
  bannerUrl: string | null;
  socialMedia: unknown;
  footerText: string | null;
  footerLinks: unknown;
  // Branding colors (HSL without wrapper, e.g. "230 42.6% 23.9%")
  primaryColor: string | null;
  primaryLight: string | null;
  accentColor: string | null;
  accentHover: string | null;
  // Contact
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  // Module feature flags
  moduleEvents: boolean;
  moduleReservations: boolean;
  moduleSurveys: boolean;
  moduleSupport: boolean;
  moduleAgreements: boolean;
  moduleQuotes: boolean;
  modulePosts: boolean;
  moraAutoBlock: boolean;
}

interface OrganizationContextValue {
  organization: PublicOrganization | null;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue>({
  organization: null,
  loading: true,
});

function applyTheme(org: PublicOrganization) {
  const s = document.documentElement.style;
  if (org.primaryColor) {
    const [h, s1, l] = hexToHsl(org.primaryColor);
    s.setProperty("--primary", `${h} ${s1}% ${l}%`);
  }
  if (org.primaryLight) {
    const [h, s1, l] = hexToHsl(org.primaryLight);
    s.setProperty("--primary-light", `${h} ${s1}% ${l}%`);
  }
  if (org.accentColor) {
    const [h, s1, l] = hexToHsl(org.accentColor);
    s.setProperty("--accent", `${h} ${s1}% ${l}%`);
  }
  if (org.accentHover) {
    const [h, s1, l] = hexToHsl(org.accentHover);
    s.setProperty("--accent-hover", `${h} ${s1}% ${l}%`);
  }

  // Persist for the localStorage preload script on next load
  try {
    localStorage.setItem(
      "org-theme",
      JSON.stringify({
        primary: org.primaryColor,
        primaryLight: org.primaryLight,
        accent: org.accentColor,
        accentHover: org.accentHover,
      }),
    );
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useQuery(GET_PUBLIC_ORGANIZATION, {
    fetchPolicy: "cache-and-network",
  });

  const organization: PublicOrganization | null =
    data?.getPublicOrganization ?? null;

  useEffect(() => {
    if (organization) applyTheme(organization);
  }, [organization]);

  return (
    <OrganizationContext.Provider value={{ organization, loading }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
