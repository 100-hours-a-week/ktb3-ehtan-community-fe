import { isLoggedIn } from "../auth.js";
import { initPasswordChangePage } from '../passwordChange.js'
import { initCommonLayout } from '../common.js';

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        alert("로그인 후 이용바랍니다.")
        window.location.replace("/index.html");
        return;
    }
    initCommonLayout();
    initPasswordChangePage();
});
