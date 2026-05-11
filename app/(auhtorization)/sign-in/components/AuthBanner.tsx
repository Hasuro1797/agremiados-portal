/* eslint-disable @next/next/no-img-element */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/providers/organization-provider";
import { useState } from "react";

const DEFAULT_BANNER = "/assets/dashboard_ilustrator.jpg";

export function AuthBanner() {
  const { organization, loading } = useOrganization();
  const [imgLoaded, setImgLoaded] = useState(false);

  // Wait until query resolves to decide the final src
  const resolved = !loading || !!organization;
  const bannerSrc = resolved ? organization?.bannerUrl || DEFAULT_BANNER : null;
  console.log("AuthBanner render", { resolved, bannerSrc });

  return (
    <div className="absolute inset-0 bg-muted overflow-hidden">
      {/* Skeleton while query is in flight */}
      {!resolved && <Skeleton className="absolute inset-0 w-full h-full" />}

      {bannerSrc && (
        <img
          src={bannerSrc}
          alt="Background"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith(DEFAULT_BANNER)) {
              target.src = DEFAULT_BANNER;
            }
            setImgLoaded(true);
          }}
        />
      )}
      <div className="absolute inset-0 bg-blue-300/20 mix-blend-overlay dark:bg-blue-900/10" />
    </div>
  );
}
