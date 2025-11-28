export async function fetchPost(fetchWithAuth, postId) {
  const res = await fetchWithAuth(`/posts/${postId}`, { method: "GET" });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "게시글을 불러오지 못했습니다.");
  return json?.data ?? null;
}

export async function fetchComments(fetchWithAuth, postId, { cursor, limit = 20 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor != null) params.append("cursor", String(cursor));
  const res = await fetchWithAuth(`/posts/${postId}/comments?${params.toString()}`, {
    method: "GET",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "댓글을 불러오지 못했습니다.");
  return {
    comments: json?.data?.comments ?? [],
    nextCursor: json?.data?.next_cursor ?? null,
  };
}

export async function createComment(fetchWithAuth, postId, payload) {
  const res = await fetchWithAuth(`/posts/${postId}/comments`, {
    method: "POST",
    body: payload,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "댓글 작성에 실패했습니다.");
  return json?.data;
}

export async function updateComment(fetchWithAuth, postId, commentId, payload) {
  const res = await fetchWithAuth(`/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    body: payload,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "댓글 수정에 실패했습니다.");
  return json?.data;
}

export async function deleteComment(fetchWithAuth, postId, commentId) {
  const res = await fetchWithAuth(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message ?? "댓글 삭제에 실패했습니다.");
  }
}

export async function toggleLike(fetchWithAuth, postId) {
  const res = await fetchWithAuth(`/posts/${postId}/like`, {
    method: "PATCH",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "좋아요를 변경하지 못했습니다.");
  return json?.data;
}
