import { PostDetail } from "@/components/post-detail";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PostDetail slug={slug} />;
}
