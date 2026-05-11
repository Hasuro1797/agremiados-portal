import React from "react";
import AgreementDetailComponent from "../components/AgreementDetailComponent";

export default function AgreementDetail({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="w-full">
      <AgreementDetailComponent agreementId={params.id} />
    </main>
  );
}
