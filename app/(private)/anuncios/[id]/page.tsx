import PostDetailComponent from "../../comunicados/[id]/components/PostDetailComponent";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  return <PostDetailComponent postId={params.id} type="news" />;
}
