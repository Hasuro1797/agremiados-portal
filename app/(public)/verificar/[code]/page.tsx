import type { Metadata } from "next";
import VerifyCertificateComponent from "./components/VerifyCertificateComponent";

export const metadata: Metadata = {
  title: "Verificación de constancia",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function VerifyCertificatePage({
  params,
}: {
  params: { code: string };
}) {
  return <VerifyCertificateComponent code={decodeURIComponent(params.code)} />;
}
