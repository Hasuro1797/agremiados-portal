import PostDetailComponent from "./components/PostDetailComponent";

export default function CommunicadoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <PostDetailComponent postId={params.id} type="communications" />;
}
