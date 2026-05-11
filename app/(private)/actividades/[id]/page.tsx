import ActivityDetailComponent from "./components/ActivityDetailComponent";

export default function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ActivityDetailComponent id={params.id} />;
}
