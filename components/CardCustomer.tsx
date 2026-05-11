/* eslint-disable @next/next/no-img-element */
import React from "react";

interface CardCustomerProps {
  media?: Media | null;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

interface Media {
  alt: string;
  title: string;
  src: string;
}

export default function CardCustomer({
  media,
  title,
  description,
  children,
}: CardCustomerProps) {
  return (
    <div className="rounded-3xl custom-lineal hover:text-white hover:bg-primary duration-150 ease-in-out overflow-hidden shadow-custom flex flex-col">
      {media && (
        <img
          src={media.src}
          alt={media.alt}
          className="w-full max-h-[210px] object-cover"
        />
      )}
      <div className="px-5 py-6 flex flex-col justify-between flex-1 gap-1">
        <div>
          <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
          {description && (
            <p className="line-clamp-2 text-base">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
