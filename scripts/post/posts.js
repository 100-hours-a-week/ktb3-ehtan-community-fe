
import { __getFetch, __postFetch } from "../api.js";
import { isLoggedIn } from "../auth.js";
import { formatCountForCard } from '../util.js';
import { findDom } from "../util.js";


function createFixedMasonry(container, { columnWidth, gutter }) {
    const state = {
        items: [],
        columns: [],
        columnHeights: [],
        columnCount: 0,
        cardWidth: columnWidth,
    };

    const applyContainerStyle = () => {
        container.style.display = "flex";
        container.style.gap = `${gutter}px`;
        container.style.alignItems = "flex-start";
    };

    const computeLayoutMeta = () => {
        const containerWidth = container.clientWidth || columnWidth;
        const cardWidth = Math.min(columnWidth, containerWidth);
        const count = Math.max(1, Math.floor((containerWidth + gutter) / (cardWidth + gutter)));
        return { count, cardWidth };
    };

    const rebuildColumns = (count) => {
        const fragment = document.createDocumentFragment();
        const newColumns = [];
        for (let i = 0; i < count; i++) {
            const col = document.createElement("div");
            col.className = "posts-column";
            newColumns.push(col);
            fragment.appendChild(col);
        }
        container.innerHTML = "";
        container.appendChild(fragment);
        state.columns = newColumns;
        state.columnHeights = Array(count).fill(0);
        state.columnCount = count;
    };

    const ensureColumns = (count) => {
        if (state.columnCount !== count || state.columns.length !== count) {
            rebuildColumns(count);
            return;
        }
        state.columnHeights = Array(count).fill(0);
        state.columns.forEach(col => col.textContent = "");
    };

    const positionItem = (el) => {
        if (state.columnHeights.length === 0) ensureColumns(1);
        const minHeight = Math.min(...state.columnHeights);
        const colIndex = state.columnHeights.indexOf(minHeight);
        const targetCol = state.columns[colIndex];
        el.style.width = `${state.cardWidth}px`;
        targetCol.appendChild(el);
        state.columnHeights[colIndex] = minHeight + el.offsetHeight + gutter;
    };

    const layout = () => {
        applyContainerStyle();
        const { count, cardWidth } = computeLayoutMeta();
        state.cardWidth = cardWidth;

        ensureColumns(count);
        state.items.forEach(positionItem);
    };

    const append = (newItems) => {
        if (!newItems || newItems.length === 0) return;
        newItems.forEach(el => state.items.push(el));
        requestAnimationFrame(layout);
    };

    const handleResize = () => layout();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);

    const destroy = () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
        state.items = [];
        state.columnHeights = [];
        state.columns = [];
    };

    return { append, layout, destroy };
}


export async function initPostsPage() {
    // initPostWriteButton();
    // initSideProfileCard();
    await loadPostHandler();
}




function canScroll(rootEl) {
    return rootEl.scrollHeight > rootEl.clientHeight + 50; // 여유 50px
}

async function fillUntilScrollable(ctx, layout) {
    const root = ctx.$scrollRoot || document.documentElement;

    while (!canScroll(root) && ctx.cursor != null) {
        await loadMorePosts(ctx, layout);
    }
}


async function loadPostHandler() {
    const grid = document.getElementById("posts-view");
    const layout = createFixedMasonry(grid, { columnWidth: 330, gutter: 10 });

    const ctx = {
        $list: grid,
        $sentinel: document.getElementById("sentinel"),
        $scrollRoot: document.querySelector(".posts-wrapper"),
        loading: false,
        cursor: null,
        limit: 10,
        observer: null,
    };

    ctx.observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
            loadMorePosts(ctx, layout);
        }
    }, {
        rootMargin: "300px 0px",
        root: ctx.$scrollRoot || null
    });

    ctx.observer.observe(ctx.$sentinel);

    await loadMorePosts(ctx, layout);
    await fillUntilScrollable(ctx, layout);
}


async function loadMorePosts(ctx, layout) {
    if (ctx.loading) return;
    ctx.loading = true;

    try {
        const params = new URLSearchParams({ limit: ctx.limit });
        if (ctx.cursor != null) params.append("cursor", ctx.cursor);

        const res = await __getFetch(`/posts?${params.toString()}`);
        if (!res.ok) return;

        const json = await res.json();
        const posts = json.data?.posts ?? [];

        const newItems = [];
        const grid = ctx.$list;

        posts.forEach(post => {
            const wrap = document.createElement("div");
            wrap.innerHTML = renderPostCard(post);
            const card = wrap.firstElementChild;

            card.addEventListener("click", () => {
                window.location.href = `/page/post.html?postId=${post.id}`;
            });

            newItems.push(card);
        });

        if (newItems.length > 0) {
            layout.append(newItems);
        }

        const prevCursor = ctx.cursor;
        const nextCursor = normalizeCursor(json.data?.next_cursor);

        if (posts.length === 0) {
            ctx.cursor = null;
            if (ctx.observer && ctx.$sentinel) {
                ctx.observer.unobserve(ctx.$sentinel);
            }
            return;
        }

        if (nextCursor === prevCursor) {
            ctx.cursor = null;
            if (ctx.observer && ctx.$sentinel) {
                ctx.observer.unobserve(ctx.$sentinel);
            }
            return;
        }

        ctx.cursor = nextCursor;

        if (ctx.cursor == null && ctx.observer && ctx.$sentinel) {
            ctx.observer.unobserve(ctx.$sentinel);
        }
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

function renderPostCard(post) {
    const imageUrl = (post.thumbnail_image_url && post.thumbnail_image_url.trim()) ? post.thumbnail_image_url : "";
    const likeCount = formatCountForCard(post.like_count);
    const commentCount = formatCountForCard(post.comment_count);
    const viewCount = formatCountForCard(post.view_count);
    const extraClass = resolveExtraClass(post.view_count);
    const authorMeta = renderAuthorMeta(post);
    const cardImage = imageUrl ? `<div class="post-card__image" style="background-image:url('${imageUrl}')"></div>` : "";
    return `
        <article class="post-card ${extraClass}" post-id="${post.id}">
            ${cardImage}
            <div class="post-card__title">${post.title}</div>
            <div class="post-card__content">${post.content}</div>
            <div class="post-card-meta-field">
                ${authorMeta}
                <div class="post-card-count-field">
                    <span class="likeCount"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s-6.4-4.2-9-9.2C1 8 2.4 4.5 6 4.5c2 0 3.4 1.4 4 2.4.6-1 2-2.4 4-2.4 3.6 0 5 3.5 3 7.3-2.6 5-9 9.2-9 9.2Z"/></svg><span>${likeCount}</span></span>
                    <span class="commentCount"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5h16v10H7l-3 3V5Z"/></svg><span>${commentCount}</span></span>
                    <span class="viewCount"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></svg><span>${viewCount}</span></span>
                </div>
            </div>
        </article>
    `;
}

function resolveExtraClass(viewCountRaw) {
    const views = Number(viewCountRaw) || 0;
    if (views >= 50) return "popularity3";
    if (views >= 30) return "popularity2";
    if (views >= 10) return "popularity1";
    return "";
}

function renderAuthorMeta(post) {
    const views = Number(post.view_count) || 0;
    const nickname = post.author_nickname || "익명";
    if (views >= 30) {
        const img = (post.profile_image_url && post.profile_image_url.trim()) ? post.profile_image_url : "/images/profile_placeholder.svg";
        return `
            <div class="post-card__author">
                <img src="${img}" alt="작성자 프로필">
                <span class="post-card__author-name">${nickname}</span>
            </div>
        `;
    }
    if (views >= 10) {
        return `<div class="post-card__author"><span class="post-card__author-name">${nickname}</span></div>`;
    }
    return `<div class="post-card__author empty-author" aria-hidden="true"></div>`;
}

function renderContentSnippet(p) {
    const raw = p.content || p.body || "";
    const text = (raw || "").toString().trim();
    if (!text) return "";
    const maxLen = 130;
    const snippet = text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
    return snippet.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}







