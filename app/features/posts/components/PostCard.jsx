import { useNavigate } from "react-router";

function formatCount(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  if (num >= 1000) return `${Math.floor(num / 100) / 10}k`;
  return num;
}

function resolvePopularity(viewCount) {
  const views = Number(viewCount) || 0;
  if (views >= 50) return "popularity3";
  if (views >= 30) return "popularity2";
  if (views >= 10) return "popularity1";
  return "";
}

export function PostCard({ post }) {
  const navigate = useNavigate();
  const imageUrl =
    typeof post.thumbnail_image_url === "string" &&
    post.thumbnail_image_url.trim().length > 0
      ? post.thumbnail_image_url
      : null;
  const classNames = `post-card ${resolvePopularity(post.view_count)}`;
  const nickname = post.author_nickname || "익명";
  const content =
    typeof post.content === "string" ? post.content : post.body || "";
  const title = typeof post.title === "string" ? post.title : "제목 없는 조각";

  const handleClick = () => {
    if (post?.id == null) return;
    navigate(`/posts/${post.id}`);
  };

  return (
    <article className={classNames} data-post-id={post.id} onClick={handleClick}>
      {imageUrl ? (
        <div
          className="post-card__image"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
      ) : null}
      <div className="post-card__title">{title}</div>
      <div className="post-card__content">{content}</div>
      <div className="post-card-meta-field">
        <div className="post-card__author">
          <span className="post-card__author-name">{nickname}</span>
        </div>
        <div className="post-card-count-field">
          <span className="likeCount">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 21s-6.4-4.2-9-9.2C1 8 2.4 4.5 6 4.5c2 0 3.4 1.4 4 2.4.6-1 2-2.4 4-2.4 3.6 0 5 3.5 3 7.3-2.6 5-9 9.2-9 9.2Z" />
            </svg>
            <span>{formatCount(post.like_count)}</span>
          </span>
          <span className="commentCount">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 5h16v10H7l-3 3V5Z" />
            </svg>
            <span>{formatCount(post.comment_count)}</span>
          </span>
          <span className="viewCount">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
            </svg>
            <span>{formatCount(post.view_count)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
