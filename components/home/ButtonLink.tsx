"use client";
import Link from "next/link";

export default function ButtonLink({
  title,
  link,
}: {
  title: string;
  link: string;
}) {
  return (
    <div className="max-w-48 h-16 size-full">
      <Link
        href={link}
        className="hover:bg-[#006FFD] flex text-primary hover:text-blue-100 ease-out duration-300 border-[3px] border-[#006FFD] shadow-xl rounded-lg size-full items-center gap-2 px-4 py-2"
      >
        <p className="text-center mx-auto font-medium text-wrap text-lg">
          {title}
        </p>
      </Link>
    </div>
  );
}
