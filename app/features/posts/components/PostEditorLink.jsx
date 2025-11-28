import { useNavigate } from "react-router";

export function PostEditorLink({ postId }) {
  const navigate = useNavigate();
  const goToEdit = () => {
    if (!postId) return;
    navigate(`/posts/${postId}/edit`);
  };
  return (
    <button type="button" className="btn-login-guest" onClick={goToEdit}>
      게시글 수정
    </button>
  );
}
