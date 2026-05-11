"use client";
import React, { useEffect } from "react";
import {marked} from "marked"
import { markDowmContent } from "@/utils/terms";

interface ScrollAreaTermsProps {
  setCanAccept: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ScrollAreaTerms({
  setCanAccept,
}: ScrollAreaTermsProps) {
  const termsRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (termsRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setCanAccept(true);
        }
      }
    };

    const currentRef = termsRef.current;
    currentRef?.addEventListener("scroll", handleScroll);

    
    return () => {
      currentRef?.removeEventListener("scroll", handleScroll);
    };
  }, [setCanAccept]);

  //terms content in markdown
  const htmlContent = marked(markDowmContent);

  return (
    <div className="h-[250px] w-full p-4 overflow-auto" ref={termsRef}>
      <p className="text-base prose-h1:text-lg prose-h1:font-bold prose-h1:mb-4 prose-p:text-sm prose-p:font-normal prose-p:my-3 prose-p:text-justify prose-h2:text-base prose-h2:font-bold prose-h2:mt-4 prose-ul:my-4 prose-ul:list-disc prose-ul:text-sm prose-ul:pl-6 prose-ol:list-disc prose-ol:pl-6 prose-ol:text-sm prose-ol:my-4 prose-ul:space-y-2 prose-ol:space-y-2"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      >
      </p>
    </div>
  );
}
