import React from "react";
import SurveyDetailComponent from "./components/SurveyDetailComponent";

export default function SurveyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="w-full">
      <SurveyDetailComponent surveyId={params.id} />
    </main>
  );
}
