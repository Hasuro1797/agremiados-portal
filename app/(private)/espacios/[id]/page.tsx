import React from "react";
import SpaceDetailPage from "./components/SpaceDetailPage";

export default function SpaceDetail({ params }: { params: { id: string } }) {
  return <SpaceDetailPage id={parseInt(params.id)} />;
}
