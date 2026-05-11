import Link from "next/link";
import React from "react";

export default function TitleHeader({
  subTitle = "Mas Cerca de ti",
}: {
  subTitle?: string;
}) {
  return (
    <div className="gap-8 flex justify items-center">
      <Link href={"/"}>
        <picture>
          <source
            srcSet="/assets/logos/logo-caa-hor.png"
            type="png"
            media="(min-width: 1024px)"
            width={300}
          />
          <img src="/assets/logos/logo-caa.png" alt="logo" className="w-36" />
        </picture>
      </Link>
      <div>
        <h1 className="text-[28px] font-bold text-balance">
          Tu Colegio Profesional
        </h1>
        <p className="text-xl text-[#71727A]">{subTitle}</p>
      </div>
    </div>
  );
}
