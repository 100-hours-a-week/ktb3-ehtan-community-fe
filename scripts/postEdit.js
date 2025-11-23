import { __getFetch, __patchFetch, __postFetch, __uploadFile } from "./api.js";
import { __validatePostTitle } from "./validation.js";

const state = {
    postId: null,
    mode: "create",
    thumbnailImageUrl: null,
    uploadingImage: false,
};

const els = {
    title: null,
    content: null,
    image: null,
    submit: null,
    hintTitle: null,
    hintImage: null,
    header: null,
    form: null,
};



export function cacheElements() {
    els.title = document.getElementById("inputPostEditTitle");
    els.content = document.getElementById("inputPostEditContent");
    els.image = document.getElementById("inputPostEditImage");
    els.submit = document.getElementById("inputPostEditSubmit");
    els.hintTitle = document.getElementById("hintTitle");
    els.hintImage = document.getElementById("hintImage");
    els.header = document.getElementById("post-edit");
    els.form = document.getElementById("post-edit-form");
}

export function getState() {
    return state;
}

export function initFormHandlers() {
    if (!els.form) return;
    els.title?.addEventListener("input", () => updateSubmitState());
    els.content?.addEventListener("input", () => updateSubmitState());
    els.image?.addEventListener("change", handleImageInputChange);
    els.form.addEventListener("submit", handleSubmit);
}

export function applyModeToUI() {
    if (!els.header || !els.submit) return;
    if (state.mode === "edit") {
        els.header.textContent = "게시글 수정";
        els.submit.textContent = "수정하기";
    } else {
        els.header.textContent = "게시글 작성";
        els.submit.textContent = "완료";
    }
}

export async function hydratePostForEdit() {
    if (!state.postId) return;
    const res = await __getFetch(`/posts/${state.postId}`);
    if (!res?.ok) return;
    const json = await res.json().catch(() => null);
    if (!json?.data) return;

    els.title.value = json.data.title ?? "";
    els.content.value = json.data.content ?? "";
    state.thumbnailImageUrl = extractImageUrl(json.data);
    if (state.thumbnailImageUrl) {
        setImageHint("기존 이미지를 유지합니다.");
    } else {
        setImageHint("");
    }

    updateSubmitState();
}

export function updateSubmitState() {
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

    const canSubmit = isValid && !state.uploadingImage;
    els.submit.disabled = !canSubmit;
    els.submit.classList.toggle("post-edit-submit-enabled", canSubmit);
    els.submit.classList.toggle("post-edit-submit-disabled", !canSubmit);
}

function setTitleHint(message) {
    if (!els.hintTitle) return;
    els.hintTitle.textContent = message ?? "";
}

function setImageHint(message) {
    if (!els.hintImage) return;
    els.hintImage.textContent = message ?? "";
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!els.title || !els.content || !els.submit) return;
    if (state.uploadingImage) return;

    const title = els.title.value.trim();
    const content = els.content.value.trim();
    const titleValidation = __validatePostTitle(title);
    if (!titleValidation.ok || !content) {
        updateSubmitState();
        return;
    }

    const payload = {
        title,
        content,
        thumbnail_image_url: state.thumbnailImageUrl ?? null,
    };
    console.log(payload.thumbnail_image_url);
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

async function handleImageInputChange(event) {
    const file = event.target?.files?.[0];
    if (!file) {
        if (!state.thumbnailImageUrl) {
            setImageHint("");
        }
        updateSubmitState();
        return;
    }

    const previousUrl = state.thumbnailImageUrl;
    state.uploadingImage = true;
    setImageHint("이미지를 업로드 중입니다...");
    updateSubmitState();

    try {
        const res = await __uploadFile("/upload/post", file, "image");
        if (!res?.ok) throw new Error("이미지 업로드 실패");
        const json = await res.json().catch(() => null);
        const uploadedUrl = extractImageUrl(json?.data);
        if (!uploadedUrl) throw new Error("업로드 결과에 이미지 경로가 없습니다.");
        state.thumbnailImageUrl = uploadedUrl;
        setImageHint("이미지가 업로드되었습니다.");
    } catch (error) {
        console.error(error);
        state.thumbnailImageUrl = previousUrl ?? null;
        setImageHint("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
        if (els.image) {
            els.image.value = "";
        }
    } finally {
        state.uploadingImage = false;
        updateSubmitState();
    }
}

function extractImageUrl(data) {
    if (!data || typeof data !== "object") return null;
    const candidates = [
        "thumbnailImageUrl",
        "thumbnail_image_url",
        "thumbnailImage",
        "thumbnail_image",
        "imageUrl",
        "image_url",
        "image",
        "profileImage",
        "profile_image",
        "url",
    ];

    for (const key of candidates) {
        const value = data[key];
        if (typeof value === "string" && value.trim()) {
            return value;
        }
    }
    return null;
}
