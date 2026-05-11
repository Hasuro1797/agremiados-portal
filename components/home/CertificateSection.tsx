"use client";
import { Button } from "@/components/ui/button";
import { DOWNLOAD_CERTIFICATE_MUTATION } from "@/graphql/mutation/lawyer.mutation";
import { routes } from "@/lib/routes";
import { useUserStore } from "@/providers/user-provider";
import { UserStatus } from "@/utils/enum";
import { useLazyQuery } from "@apollo/client";
import { ChevronRight, Download, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CertificateSection() {
  const { status } = useUserStore((state) => state);
  const isActive = status === UserStatus.ACTIVE;

  const [downloadCertificate, { loading }] = useLazyQuery(
    DOWNLOAD_CERTIFICATE_MUTATION,
    { fetchPolicy: "no-cache" },
  );

  const handleDownload = async () => {
    if (!isActive) {
      toast.error("No es posible descargar la constancia", {
        description:
          "Por favor regulariza tus pagos para acceder a este beneficio",
      });
      return;
    }
    try {
      const { data } = await downloadCertificate();
      const bytes = atob(data.generatedAvailabilityCertificate)
        .split("")
        .map((c) => c.charCodeAt(0));
      const pdfBlob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Constancia_habilitacion_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Error al descargar la constancia. Intente nuevamente.");
    }
  };

  return (
    <div className="bg-primary rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="size-4 text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
            Certificados
          </span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight mb-1.5">
          Documentos Oficiales al Instante
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          Obtén tus documentos oficiales de manera inmediata y segura a través
          de nuestra plataforma digital.
        </p>
        <Link
          href={routes.privates.downloadCertificate}
          className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white/80 mt-3 transition-colors"
        >
          Ver otros trámites
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Right card */}
      <div className="w-full md:w-[280px] shrink-0 bg-white/10 rounded-xl border border-white/20 p-4">
        <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">
          Certificado Destacado
        </p>
        <p className="text-white font-semibold text-sm mb-4 leading-snug">
          Constancia de Habilitación Digital
        </p>
        <Button
          onClick={handleDownload}
          disabled={loading || !isActive}
          className="w-full bg-accent hover:bg-accent-hover text-white h-10 font-semibold gap-2 text-sm disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Descargar PDF
        </Button>
        {!isActive && (
          <p className="text-white/40 text-[11px] text-center mt-2 leading-snug">
            Regulariza tus pagos para habilitar la descarga
          </p>
        )}
      </div>
    </div>
  );
}
