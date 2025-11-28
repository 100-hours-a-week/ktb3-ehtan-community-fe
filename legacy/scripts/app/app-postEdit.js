import { cacheElements, initFormHandlers, applyModeToUI, hydratePostForEdit, updateSubmitState, getState } from "../postEdit.js";
import { isLoggedIn } from '../auth.js';
import { initCommonLayout } from '../common.js';


document.addEventListener("DOMContentLoaded", async () => {

    
    if (!isLoggedIn()) {
        alert("수정 권한이 없습니다.")
        window.location.replace("/index.hmtl");
        return;
    }

    initCommonLayout();
    cacheElements();
    initFormHandlers();
    const state = getState();

    state.postId = new URLSearchParams(window.location.search).get("postId");
    state.mode = state.postId ? "edit" : "create";
    applyModeToUI();

    if (state.mode === "edit") {
        await hydratePostForEdit();
    }

    updateSubmitState();
});