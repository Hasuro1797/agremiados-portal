/* eslint-disable @next/next/no-img-element */
"use client";

import { useOrganization } from "@/providers/organization-provider";
import { useEffect, useRef } from "react";
import { Skeleton } from "./ui/skeleton";

interface Props {
  width: number | string;
  height: number | string;
  className?: string;
}

const DEFAULT_LOGO = "/assets/logo_admin.png";

export default function Logo({ className, width, height }: Props) {
  const { organization, loading } = useOrganization();
  const prevSrc = useRef<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const resolved = !loading || !!organization;
  const logoSrc = resolved ? organization?.logo || DEFAULT_LOGO : null;

  // Reset fade-in when the logo URL changes (e.g. after config update)
  useEffect(() => {
    if (logoSrc && logoSrc !== prevSrc.current) {
      prevSrc.current = logoSrc;
    }
  }, [logoSrc]);

  // Skeleton while the query is in flight
  if (!resolved) {
    return (
      <Skeleton
        style={{ width: Number(width), height: Number(height) }}
        className={`${className ?? ""}`}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      key={logoSrc}
      width={Number(width)}
      height={Number(height)}
      className={`${className ?? ""}`}
      src={logoSrc!}
      alt={organization?.name ?? "Logo"}
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.endsWith(DEFAULT_LOGO)) {
          target.src = DEFAULT_LOGO;
        }
      }}
    />
  );
}
