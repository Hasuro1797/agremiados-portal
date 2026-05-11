"use client";
import React from "react";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { useLazyQuery } from "@apollo/client";
import { DOWNLOAD_CERTIFICATE_MUTATION } from "@/graphql/mutation/lawyer.mutation";
import { toast } from "sonner";
import { useUserStore } from "@/providers/user-provider";

export default function DownloadCertificate() {
  const { hasAvailable } = useUserStore((state) => state);
  const [downloadCertificate, { loading }] = useLazyQuery(
    DOWNLOAD_CERTIFICATE_MUTATION,
    {
      fetchPolicy: "no-cache",
    },
  );

  const handleDownload = async () => {
    if (!hasAvailable) {
      toast.error("No es posible descargar la constancia", {
        description:
          "Por favor regulariza tus pagos para acceder a este beneficio",
        classNames: {
          icon: "text-red-500",
          title: "text-primary",
          description: "text-primary",
          toast: "bg-secondary",
        },
      });
      return;
    }
    try {
      const { data } = await downloadCertificate();
      const pdfBlob = new Blob(
        [
          new Uint8Array(
            atob(data.generatedAvailabilityCertificate)
              .split("")
              .map((char) => char.charCodeAt(0)),
          ),
        ],
        { type: "application/pdf" },
      );
      const fileName = `Constancia_de_habilitacion_${new Date().toISOString()}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // Usamos el nombre del archivo dinámico
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Error al descargar la constancia", {
        description: "Por favor intenta nuevamente",
        classNames: {
          icon: "text-red-500",
          title: "text-primary",
          description: "text-primary",
          toast: "bg-secondary",
        },
      });
    }
  };
  return (
    <div className="max-w-48 h-16 size-full">
      <Button
        variant="outline"
        className="hover:bg-[#006FFD] text-primary hover:text-blue-100 ease-out duration-300 border-[3px] border-[#006FFD] shadow-xl rounded-lg size-full flex items-center gap-2 px-4 py-2"
        onClick={handleDownload}
        disabled={loading || !hasAvailable}
      >
        {loading && (
          <LoaderCircle
            strokeWidth={2}
            className="!size-6 animate-spin repeat-infinite"
          />
        )}

        <p className="text-center font-medium text-wrap text-lg">Constancia</p>
      </Button>
    </div>
  );
}
