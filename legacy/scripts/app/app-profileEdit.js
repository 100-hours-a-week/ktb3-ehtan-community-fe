import { isLoggedIn } from '../auth.js';
import { initCommonLayout } from '../common.js'
import { initProfilePage } from '../profileEdit.js';

document.addEventListener('DOMContentLoaded', async () => {

    if (!isLoggedIn()) {
        alert("로그인 후 이용바랍니다.")
        window.location.replace("/index.html");
        return;
    }
    initCommonLayout();
    initProfilePage();
});