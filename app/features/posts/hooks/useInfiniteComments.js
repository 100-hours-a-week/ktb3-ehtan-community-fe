import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchComments } from "../api/post-detail-api";
import { useAuth } from "../../../providers/auth-context";

export function useInfiniteComments(postId, limit = 20) {
  const { fetchWithAuth } = useAuth();
  const [comments, setComments] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const runLoad = useCallback(
    async ({ replace } = { replace: false }) => {
      if (!postId || loading) return;
      setLoading(true);
      setError(null);
      try {
        const currentCursor = replace ? null : cursor;
        const { comments: newComments, nextCursor } = await fetchComments(
          fetchWithAuth,
          postId,
          {
            cursor: currentCursor,
            limit,
          }
        );

        setComments((prev) => (replace ? newComments : [...prev, ...newComments]));

        if (!nextCursor || nextCursor === currentCursor || newComments.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setCursor(nextCursor ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "댓글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [cursor, fetchWithAuth, limit, loading, postId]
  );

  const loadMore = useCallback(() => {
    runLoad({ replace: false });
  }, [runLoad]);

  useEffect(() => {
    if (!postId) return;
    setComments([]);
    setCursor(null);
    setHasMore(true);
    runLoad({ replace: true });
  }, [postId, runLoad]);

  const reload = useCallback(() => {
    setComments([]);
    setCursor(null);
    setHasMore(true);
    runLoad({ replace: true });
  }, [runLoad]);

  return useMemo(
    () => ({
      comments,
      loading,
      error,
      hasMore,
      loadMore,
      reload,
    }),
    [comments, error, hasMore, loadMore, loading, reload]
  );
}
