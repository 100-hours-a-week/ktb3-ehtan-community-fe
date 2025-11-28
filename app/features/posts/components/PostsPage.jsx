import { PostList } from "./PostList";

export function PostsPage() {
  return (
    <main className="page posts-page">
      <div className="posts-title">
        <div>안녕하세요,</div>
        <div>하루 조각 게시판 입니다.</div>
      </div>
      <PostList />
    </main>
  );
}
