import SupportDetailPageComponent from "../components/SupportDetailPageComponent";

export default function SupportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <SupportDetailPageComponent id={Number(params.id)} />;
}
