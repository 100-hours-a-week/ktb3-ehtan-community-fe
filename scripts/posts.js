
import { __getFetch } from "./api.js";
import { isLoggedIn } from "./auth.js";
import { formatDateForCard, formatCountForCard } from './util.js';


document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.replace("/page/login.html");
    }
    await initPostsPage();
});


async function initPostsPage() {
    myProfileHandler();
    initPostWriteButton();
    await loadPostHandler();
}

function myProfileHandler() {
    const $myProfileImage = document.getElementById('myProfileImage');
    const url = localStorage.getItem('profile_image_url');

    if (url && url.trim() !== "" && url !== "dummy link") {
        $myProfileImage.src = url;
    }
}

function initPostWriteButton() {
    const btn = document.getElementById("post-write-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
        window.location.href = "/page/postEdit.html";
    });
}


async function loadPostHandler() {
    const ctx = {
        $list: document.getElementById("posts-view"),
        $sentinel: document.getElementById("sentinel"),
        loading: false,
        cursor: null,
        limit: 10,
        observer: null,
    };

    ctx.observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) loadMore(ctx);
    }, { rootMargin: "300px 0px" });

    ctx.observer.observe(ctx.$sentinel);

    await loadMore(ctx);
}

async function loadMore(ctx) {
    if (ctx.loading) return;
    ctx.loading = true;

    try {
        const params = new URLSearchParams({limit: ctx.limit});
        if (ctx.cursor != null) params.append("cursor", ctx.cursor);

        const res = await __getFetch(`/posts?${params.toString()}`);
        if (!res.ok) return;

        const json = await res.json();
        const posts = json.data?.posts ?? [];
        const frag = document.createDocumentFragment();

        posts.forEach(p => {
            const wrap = document.createElement("div");

            wrap.innerHTML = renderPostCard(p);
            const card = wrap.firstElementChild;
            card.addEventListener("click", () => {
                window.location.href = `/page/post.html?postId=${p.id}`;
            });
            frag.appendChild(card);
        });

        ctx.$list.appendChild(frag);

        const nextCursor = normalizeCursor(json.data?.next_cursor);
        ctx.cursor = nextCursor;
        if (ctx.cursor == null) ctx.observer.unobserve(ctx.$sentinel);
    } finally {
        ctx.loading = false;
    }
}




function normalizeCursor(value) {
    if (value == null) return null;
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
}

function renderPostCard(p) {
    const img = p.profile_image_url || "./images/default_profile_image.png";
    const createdAt = formatDateForCard(p.created_at);
    const nickname = p.author_nickname ?? "익명";
    const likeCount = formatCountForCard(p.like_count);
    const commentCount = formatCountForCard(p.comment_count);
    const viewCount = formatCountForCard(p.view_count);
    return `
        <article class="post-card" post-id="${p.id}">
            <div class="post-meta-area">
                <div class="post-card-title">
                    ${p.title}
                </div>
                <div class="post-card-meta-field">
                    <div class="post-card-count-field">
                        <span class="likeCount">좋아요 <span>${likeCount}</span></span>
                        <span class="commentCount">댓글 <span>${commentCount}</span></span>
                        <span class="viewCount">조회수 <span>${viewCount}</span></span>
                    </div>
                    <div class="post-card-date-field">
                        ${createdAt}
                    </div>
                </div>
            </div>
            <div class="author-meta-area">
                <div class="profile-image-wrapper author-profile-image">
                    <img class="profileImage" src="${img}" alt="">
                </div>
                <div class="authorNickname">
                    ${nickname}
                </div>
            </div>
        </article>
    `;
}
