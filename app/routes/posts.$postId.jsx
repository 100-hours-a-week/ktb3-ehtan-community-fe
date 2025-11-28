import { AppLayout } from "../components/layout/AppLayout";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { CommunityBanner } from "../components/layout/CommunityBanner";
import { PostDetailPage } from "../features/posts/components/PostDetailPage";

export function meta({ params }) {
  return [
    { title: `게시글 ${params.postId} - 하루 조각` },
    { name: "description", content: "하루 조각 게시글 상세 페이지" },
  ];
}

export default function PostDetailRoute() {
  return (
    <AppLayout Header={Header} Banner={CommunityBanner} Sidebar={Sidebar}>
      <PostDetailPage />
    </AppLayout>
  );
}
