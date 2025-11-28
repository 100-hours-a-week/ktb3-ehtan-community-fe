import { useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "../../../services/api-client";
import {
  validateEmail,
  validatePassword,
  validateNickname,
  validatePasswordConfirm,
  validationMessages,
} from "../../../utils/validation";
import { withCsrf } from "../../../services/csrf";

export function JoinForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validations = [
      validateEmail(form.email),
      validatePassword(form.password),
      validatePasswordConfirm(form.password, form.passwordConfirm),
      validateNickname(form.nickname),
    ];
    const firstError = validations.find((v) => !v.ok);
    if (firstError) {
      setError(firstError.msg);
      return;
    }

    setSubmitting(true);
    try {
      const options = await withCsrf(apiClient, "/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
        }),
      });

      const res = await apiClient.request("/auth/signup", options);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message ?? validationMessages["duplicate-email"]);
      }
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>회원가입</h1>
      <label>
        이메일
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@example.com"
        />
      </label>
      <label>
        비밀번호
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
      </label>
      <label>
        비밀번호 확인
        <input
          type="password"
          name="passwordConfirm"
          value={form.passwordConfirm}
          onChange={handleChange}
        />
      </label>
      <label>
        닉네임
        <input
          type="text"
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
          maxLength={10}
        />
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
      <button type="submit" disabled={submitting}>
        {submitting ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
