import { AppLayout } from "../components/layout/AppLayout";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { CommunityBanner } from "../components/layout/CommunityBanner";
import { PostEditorPage } from "../features/posts/components/PostEditorPage";
import { RequireAuth } from "../components/auth/RequireAuth";

export function meta({ params }) {
  return [
    { title: `게시글 수정 ${params.postId} - 하루 조각` },
    { name: "description", content: "게시글 수정 페이지" },
  ];
}

export default function PostEditRoute() {
  return (
    <RequireAuth>
      <AppLayout Header={Header} Banner={CommunityBanner} Sidebar={Sidebar}>
        <PostEditorPage mode="edit" />
      </AppLayout>
    </RequireAuth>
  );
}
