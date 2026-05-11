"use client";

import { useOrganization } from "@/providers/organization-provider";
import { useEffect } from "react";

const DEFAULT_TITLE = "Portal del Agremiado";
const DEFAULT_DESCRIPTION =
  "Portal exclusivo para miembros. Acceda a recursos como constancias de habilitación, participar en actividades académicas, sociales entre otras.";
const DEFAULT_FAVICON = "/favicon.ico";

export function DynamicHead() {
  const { organization } = useOrganization();

  useEffect(() => {
    const title = organization?.name
      ? `${organization.name} - Portal del Agremiado`
      : DEFAULT_TITLE;
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      organization?.description
        ? `Portal del Agremiado de ${organization.name}: ${organization.description}`
        : DEFAULT_DESCRIPTION,
    );

    // Favicon
    const faviconUrl = organization?.favicon || DEFAULT_FAVICON;
    let link: HTMLLinkElement | null =
      document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [organization]);

  return null;
}
