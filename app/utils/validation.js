import { validationMessages } from "./msg.js";

export const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,20}$/;

const ok = (msg = "") => ({ ok: true, msg });
const fail = (msg) => ({ ok: false, msg });

export function validateEmail(value) {
  const email = value ?? "";
  if (!email.trim()) return fail(validationMessages.REQUIRED_EMAIL);
  if (!emailRegExp.test(email)) return fail(validationMessages.INVALID_EMAIL);
  return ok();
}

export function validatePassword(value) {
  const password = value ?? "";
  if (!password.trim()) return fail(validationMessages.REQUIRED_PASSWORD);
  if (!passwordRegExp.test(password))
    return fail(validationMessages.INVALID_PASSWORD);
  return ok();
}

export function validateNickname(value) {
  const nickname = value ?? "";
  if (!nickname.trim()) return fail(validationMessages.REQUIRED_NICKNAME);
  if (/\s/.test(nickname)) return fail(validationMessages.NO_WHITESPACE_NICKNAME);
  if (nickname.length > 10) return fail(validationMessages.MAX_LENGTH_NICKNAME);
  return ok();
}

export function validatePostTitle(value) {
  const title = value?.trim() ?? "";
  if (!title) return fail(validationMessages.REQUIRED_TITLE);
  if (title.length > 26) return fail(validationMessages.MAX_LENGTH_TITLE);
  return ok();
}

export function validatePasswordConfirm(password, confirm) {
  if (!confirm?.trim()) return fail(validationMessages.REQUIRED_PASSWORD);
  if (password !== confirm) return fail(validationMessages.PASSWORD_CONFIRM_MISMATCH);
  return ok();
}
