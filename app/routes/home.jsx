import { AppLayout } from "../components/layout/AppLayout";
import { Header } from "../components/layout/Header";
import { CommunityBanner } from "../components/layout/CommunityBanner";
import { Sidebar } from "../components/layout/Sidebar";
import { PostsPage } from "../features/posts/components/PostsPage";

export function meta() {
  return [
    { title: "하루 조각" },
    { name: "description", content: "하루의 조각을 공유하는 커뮤니티" },
  ];
}

export default function Home() {
  return (
    <AppLayout Header={Header} Banner={CommunityBanner} Sidebar={Sidebar}>
      <PostsPage />
    </AppLayout>
  );
}
