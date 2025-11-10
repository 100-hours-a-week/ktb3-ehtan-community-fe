import { isLoggedIn } from "./auth.js";
import { __getFetch, __patchFetch, __postFetch } from "./api.js";
import { __validatePostTitle } from "./validation.js";

const state = {
    postId: null,
    mode: "create",
};

const els = {
    title: null,
    content: null,
    image: null,
    submit: null,
    hintTitle: null,
    header: null,
    form: null,
};

document.addEventListener("DOMContentLoaded", async () => {
    if (!isLoggedIn()) {
        window.location.replace("/page/login.html");
        return;
    }

    cacheElements();
    initFormHandlers();

    state.postId = new URLSearchParams(window.location.search).get("postId");
    state.mode = state.postId ? "edit" : "create";
    applyModeToUI();

    if (state.mode === "edit") {
        await hydratePostForEdit();
    }

    updateSubmitState();
});

function cacheElements() {
    els.title = document.getElementById("inputPostEditTitle");
    els.content = document.getElementById("inputPostEditContent");
    els.image = document.getElementById("inputPostEditImage");
    els.submit = document.getElementById("inputPostEditSubmit");
    els.hintTitle = document.getElementById("hintTitle");
    els.header = document.getElementById("post-edit");
    els.form = document.getElementById("post-edit-form");
}

function initFormHandlers() {
    if (!els.form) return;
    els.title?.addEventListener("input", () => updateSubmitState());
    els.content?.addEventListener("input", () => updateSubmitState());
    els.form.addEventListener("submit", handleSubmit);
}

function applyModeToUI() {
    if (!els.header || !els.submit) return;
    if (state.mode === "edit") {
        els.header.textContent = "게시글 수정";
        els.submit.textContent = "수정하기";
    } else {
        els.header.textContent = "게시글 작성";
        els.submit.textContent = "완료";
    }
}

async function hydratePostForEdit() {
    if (!state.postId) return;
    const res = await __getFetch(`/posts/${state.postId}`);
    if (!res?.ok) return;
    const json = await res.json().catch(() => null);
    if (!json?.data) return;

    els.title.value = json.data.title ?? "";
    els.content.value = json.data.content ?? "";

    updateSubmitState();
}

function updateSubmitState() {
    if (!els.submit || !els.title || !els.content) return;
    const titleValue = els.title.value ?? "";
    const contentValue = (els.content.value ?? "").trim();

    const titleValidation = __validatePostTitle(titleValue);
    if (!titleValue.trim()) {
        setTitleHint("");
    } else if (!titleValidation.ok) {
        setTitleHint(titleValidation.msg);
    } else {
        setTitleHint("");
    }

    const isValid = titleValidation.ok && !!contentValue;

    els.submit.disabled = !isValid;
    els.submit.classList.toggle("post-edit-submit-enabled", isValid);
    els.submit.classList.toggle("post-edit-submit-disabled", !isValid);
}

function setTitleHint(message) {
    if (!els.hintTitle) return;
    els.hintTitle.textContent = message ?? "";
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!els.title || !els.content || !els.submit) return;

    const title = els.title.value.trim();
    const content = els.content.value.trim();
    const titleValidation = __validatePostTitle(title);
    if (!titleValidation.ok || !content) {
        updateSubmitState();
        return;
    }

    const payload = { title, content };
    els.submit.disabled = true;

    try {
        let res;
        if (state.mode === "edit" && state.postId) {
            res = await __patchFetch(`/posts/${state.postId}`, payload);
        } else {
            res = await __postFetch("/posts", payload);
        }

        if (!res?.ok) return;
        if (state.mode === "edit") {
            window.location.replace(`/page/post.html?postId=${state.postId}`);
            return;
        }
        window.location.replace("/index.html");
    } finally {
        els.submit.disabled = false;
        updateSubmitState();
    }
}
