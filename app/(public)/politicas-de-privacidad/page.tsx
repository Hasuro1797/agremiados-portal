"use client";
import React, { useEffect, useState } from "react";
import { marked } from "marked";
import { markDowmContent } from "@/utils/terms";

export default function ProvacyPolitics() {
  const [htmlContent, setHtmlContent] = useState("");
  //terms content in markdown
  useEffect(() => {
    // Convertir Markdown a HTML solo cuando el componente se monta en el cliente
    const convertMarkdown = async () => {
      const html = await marked(markDowmContent);
      setHtmlContent(html);
    };
    convertMarkdown();
  }, []);
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 lg:px-10 py-6">
        <p
          className="text-base prose-h1:text-lg prose-h1:font-bold prose-h1:mb-4 prose-p:text-sm prose-p:font-normal prose-p:my-3 prose-p:text-justify prose-h2:text-base prose-h2:font-bold prose-h2:mt-4 prose-ul:my-4 prose-ul:list-disc prose-ul:text-sm prose-ul:pl-6 prose-ol:list-disc prose-ol:pl-6 prose-ol:text-sm prose-ol:my-4 prose-ul:space-y-2 prose-ol:space-y-2"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        ></p>
      </div>
    </div>
  );
}
