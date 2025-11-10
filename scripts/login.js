import { msg, __validateInputPassword } from './validation.js';
import { __postFetch } from './api.js';
import { isLoggedIn } from "./auth.js";


document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        window.location.replace("/index.html");
    }
    initLoginPage();
});

function initLoginPage() {
    validateLoginInput();
    loginSubmitHandler();
}

function validateLoginInput() {
    const $pw = document.getElementById('inputPassword');
    const $loginBtn = document.getElementById('login-button');

    const $hintPassword = document.getElementById('hintPassword');
    let valid = false;
    
    $pw.addEventListener('input', () => {

        const validate = __validateInputPassword($pw.value);
        if (validate.ok) {
            valid = true;
            $loginBtn.classList.add("login-valid");
            $loginBtn.disabled = false;
            $hintPassword.textContent = "";
        } else {
            $hintPassword.textContent = validate.msg;
            valid = false;
            /*
            입력한 비밀번호가 유효하지 않다면, 계속 설정을 시도할것임.
            상태변수를 하나 더 만들어서 스타일 설정을 시도할 정도의 가치가 있을까?
            */
            $loginBtn.classList.remove("login-valid");
            $loginBtn.disabled = true;
        }
    });
}

function loginSubmitHandler() {
    const $form = document.getElementById('login-form');
    $form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const res = await __postFetch("/users/auth/token", { 
            email: $form.inputEmail.value, 
            password: $form.inputPassword.value, 
        });


        if (!res.ok) {
            if (res.status === 401 || res.status === 404) {
                document.getElementById('hintPassword').textContent = msg["wrong-login-info"];
                return;
            }
        }

        const json = await res.json();
        localStorage.setItem("user_id", json.data.user_id);
        localStorage.setItem("nickname", json.data.nickname);
        localStorage.setItem("access_token", json.data.access_token);
        localStorage.setItem("profile_image_url", json.data.profile_image_url);

        window.location.href = "/index.html";
    });
}
