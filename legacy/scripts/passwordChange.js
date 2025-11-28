import { __patchFetch } from "./api.js";
import { __validateInputPassword, msg } from "./validation.js";


export function initPasswordChangePage() {
    const passwordInput = document.getElementById("inputPassword");
    const passwordCheckInput = document.getElementById("inputPasswordCheck");
    const hintPassword = document.getElementById("hintPassword");
    const hintPasswordCheck = document.getElementById("hintPasswordCheck");
    const submitBtn = document.querySelector(".password-change-button");
    const toast = document.querySelector(".password-change-success-toast-msg");

    if (!passwordInput || !passwordCheckInput || !submitBtn || !toast) return;

    const validator = () => {
        const pwResult = __validateInputPassword(passwordInput.value);
        hintPassword.textContent = pwResult.ok ? "" : pwResult.msg;

        const confirmResult = validatePasswordConfirm(passwordInput.value, passwordCheckInput.value);
        hintPasswordCheck.textContent = confirmResult.ok ? "" : confirmResult.msg;

        const ok = pwResult.ok && confirmResult.ok;
        submitBtn.disabled = !ok;
        submitBtn.classList.toggle("password-change-button-enabled", ok);
        submitBtn.classList.toggle("password-change-button-disabled", !ok);
    };

    passwordInput.addEventListener("input", validator);
    passwordCheckInput.addEventListener("input", validator);

    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        validator();
        if (submitBtn.disabled) return;

        const payload = {
            password: passwordInput.value,
            confirm_password: passwordCheckInput.value,
        };

        const res = await __patchFetch("/users/password", payload);
        if (res.ok) {
            showToast(toast);
            passwordInput.value = "";
            passwordCheckInput.value = "";
            validator();
        }
    });
}

function validatePasswordConfirm(password, confirm) {
    if (!confirm || confirm.trim() === "") {
        return { ok: false, msg: msg["required-password"] };
    }
    if (password !== confirm) {
        return { ok: false, msg: msg["password-confirm-mismatch"] };
    }
    return { ok: true, msg: "" };
}

function showToast(toast) {
    toast.classList.remove("hide");
    toast.classList.add("show");
    toast.style.animation = "toast-slide 2s ease forwards";
    setTimeout(() => {
        toast.classList.add("hide");
        toast.classList.remove("show");
    }, 2000);
}
