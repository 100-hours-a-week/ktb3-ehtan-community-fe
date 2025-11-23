import { isLoggedIn } from "../auth.js";
import { initCommonLayout } from '../common.js';
import { initJoinPage, joinSubmitHandler } from '../join.js';

document.addEventListener("DOMContentLoaded", () => {
    if (isLoggedIn()) {
        alert("올바르지 않은 접근입니다.")
        window.location.replace("/index.html");
        return;
    }
    initCommonLayout();

    initJoinPage();
    joinSubmitHandler();
});
