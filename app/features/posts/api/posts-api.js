export async function fetchPosts(fetchWithAuth, { cursor, limit = 10 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor != null) {
    params.append("cursor", String(cursor));
  }

  const res = await fetchWithAuth(`/posts?${params.toString()}`, {
    method: "GET",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "게시글을 불러오지 못했습니다.");
  }
  const posts = json?.data?.posts ?? [];
  const nextCursor = json?.data?.next_cursor ?? null;

  return { posts, nextCursor };
}
