import { AppLayout } from "../components/layout/AppLayout";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { CommunityBanner } from "../components/layout/CommunityBanner";
import { PostEditorPage } from "../features/posts/components/PostEditorPage";
import { RequireAuth } from "../components/auth/RequireAuth";

export function meta() {
  return [
    { title: "게시글 작성 - 하루 조각" },
    { name: "description", content: "새 게시글 작성" },
  ];
}

export default function PostNewRoute() {
  return (
    <RequireAuth>
      <AppLayout Header={Header} Banner={CommunityBanner} Sidebar={Sidebar}>
        <PostEditorPage mode="create" />
      </AppLayout>
    </RequireAuth>
  );
}
