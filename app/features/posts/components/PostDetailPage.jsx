import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createComment,
  deleteComment,
  fetchPost,
  toggleLike,
  updateComment,
} from "../api/post-detail-api";
import { useAuth } from "../../../providers/auth-context";
import { formatDate } from "../../../utils/format";
import { useInfiniteComments } from "../hooks/useInfiniteComments";
import { PostEditorLink } from "./PostEditorLink";

export function PostDetailPage() {
  const { postId } = useParams();
  const { fetchWithAuth, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [postError, setPostError] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const {
    comments,
    hasMore,
    loadMore,
    error: commentError,
    reload,
    loading: commentsLoading,
  } = useInfiniteComments(postId);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!postId) return;
    setLoadingPost(true);
    fetchPost(fetchWithAuth, postId)
      .then((data) => {
        setPost(data);
      })
      .catch((error) => {
        setPostError(error.message);
      })
      .finally(() => setLoadingPost(false));
  }, [fetchWithAuth, postId]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleLike = async () => {
    if (!postId) return;
    try {
      const result = await toggleLike(fetchWithAuth, postId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              like_count: result?.likeCount ?? result?.like_count ?? prev.like_count,
              did_like: result?.didLike ?? result?.did_like ?? prev.did_like,
            }
          : prev
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!postId || !commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      if (editingCommentId) {
        await updateComment(fetchWithAuth, postId, editingCommentId, {
          content: commentInput,
        });
      } else {
        await createComment(fetchWithAuth, postId, { content: commentInput });
        setPost((prev) =>
          prev ? { ...prev, comment_count: Number(prev.comment_count || 0) + 1 } : prev
        );
      }
      reload();
      setCommentInput("");
      setEditingCommentId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const startEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setCommentInput(content);
  };

  const handleDeleteComment = async (commentId) => {
    if (!postId) return;
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    await deleteComment(fetchWithAuth, postId, commentId);
    reload();
    setPost((prev) =>
      prev
        ? { ...prev, comment_count: Math.max(0, Number(prev.comment_count || 0) - 1) }
        : prev
    );
  };

  const canEditPost = post && user?.id && Number(post.user_id) === Number(user.id);

  if (loadingPost) {
    return <div className="post-page">게시글을 불러오는 중입니다...</div>;
  }

  if (postError) {
    return <div className="post-page">{postError}</div>;
  }

  if (!post) {
    return <div className="post-page">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="post-page">
      <section id="post-summary" data-post-id={post.id}>
        <h1 id="post-title">{post.title}</h1>
        <div className="post-author-meta">
          <div className="author-meta-left">
            <div className="author-profile-image">
              <img src={post.author_image_url || "/images/profile_placeholder.svg"} alt="" />
            </div>
            <div className="authorNickname" id="post-author-nickname">
              {post.author_nickname || "익명"}
            </div>
            <div id="post-created-at">{formatDate(post.created_at)}</div>
          </div>
          <div className="post-detail-counts">
            <button
              id="post-like-btn"
              type="button"
              className={`icon-btn ${post.did_like ? "like-active" : ""}`}
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              <span>좋아요</span>
              <span id="post-like-count">{post.like_count}</span>
            </button>
            <div className="icon-meta">
              댓글 <span id="post-comment-count">{post.comment_count}</span>
            </div>
            <div className="icon-meta">
              조회수 <span id="post-view-count">{post.view_count}</span>
            </div>
          </div>
        </div>
        {canEditPost ? (
          <div className="post-controls">
            <PostEditorLink postId={post.id} />
          </div>
        ) : null}
      </section>
      <section id="post-content-wrapper">
        {post.thumbnail_image_url ? (
          <img
            id="post-content-image"
            className="post-content-img"
            src={post.thumbnail_image_url}
            alt=""
          />
        ) : null}
        <div id="post-content-text">{post.content}</div>
      </section>
      <section id="comment-write">
        <form onSubmit={handleCommentSubmit}>
          <div>
            <textarea
              id="inputComment"
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              placeholder={isAuthenticated ? "댓글을 입력하세요" : "로그인이 필요합니다"}
              disabled={!isAuthenticated}
            />
          </div>
          <div>
            <button
              id="submitComment"
              type="submit"
              className={`comment-submit-btn ${
                commentInput.trim() ? "comment-submit-enabled" : "comment-submit-disabled"
              }`}
              disabled={!commentInput.trim() || submittingComment || !isAuthenticated}
            >
              {editingCommentId ? "댓글 수정" : "댓글 입력"}
            </button>
          </div>
        </form>
      </section>
      <section id="comment-view">
        {comments.map((comment) => {
          const canEdit =
            user?.id && comment.user_id != null && Number(comment.user_id) === Number(user.id);
          return (
            <div className="comment-wrapper" key={comment.id}>
              <div>
                <div className="comment-meta-area">
                  <div className="profile-image-wrapper author-profile-image">
                    <img
                      className="profileImage"
                      src={comment.profile_image_url || "/images/profile_placeholder.svg"}
                      alt=""
                    />
                  </div>
                  <div className="authorNickname">{comment.nickname ?? "익명"}</div>
                  <div className="post-card-date-field">{formatDate(comment.create_at)}</div>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
              {canEdit ? (
                <div className="comment-write-area">
                  <button type="button" onClick={() => startEditComment(comment.id, comment.content)}>
                    수정
                  </button>
                  <button type="button" onClick={() => handleDeleteComment(comment.id)}>
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
        {commentError ? <div className="posts-error">{commentError}</div> : null}
        <div id="sentinel" ref={sentinelRef}>
          {commentsLoading ? "댓글을 불러오는 중..." : hasMore ? "" : "댓글을 모두 확인했습니다."}
        </div>
      </section>
      <button type="button" className="btn-login-guest" onClick={() => navigate("/")}>
        목록으로 돌아가기
      </button>
    </div>
  );
}
