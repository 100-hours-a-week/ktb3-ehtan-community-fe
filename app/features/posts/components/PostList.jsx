import { useEffect, useRef } from "react";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import { useMasonryColumns } from "../hooks/useMasonryColumns";
import { PostCard } from "./PostCard";

export function PostList() {
  const scrollRootRef = useRef(null);
  const sentinelRef = useRef(null);
  const { posts, loadMore, hasMore, loading, error, isEmpty } = useInfinitePosts();
  const { containerRef, columns } = useMasonryColumns(posts);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      {
        root: scrollRootRef.current,
        rootMargin: "300px 0px",
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="posts-wrapper" ref={scrollRootRef}>
      <section id="posts-view" ref={containerRef}>
        {columns.map((column, columnIndex) => (
          <div className="posts-column" key={`column-${columnIndex}`}>
          {column.map((post, index) => (
              <PostCard
                key={post.id ?? `column-${columnIndex}-card-${index}`}
                post={post}
              />
            ))}
          </div>
        ))}
      </section>
      {error ? (
        <div className="posts-error">{error}</div>
      ) : null}
      {isEmpty && !loading ? (
        <div className="posts-empty">첫 번째 조각을 작성해보세요!</div>
      ) : null}
      <div id="sentinel" ref={sentinelRef}>
        {loading ? "조각을 불러오는 중..." : !hasMore ? "마지막 조각입니다." : ""}
      </div>
    </div>
  );
}
