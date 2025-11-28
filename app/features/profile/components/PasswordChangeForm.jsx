import { useState } from "react";
import { useAuth } from "../../../providers/auth-context";
import { changePassword } from "../api/profile-api";
import { validatePassword, validatePasswordConfirm } from "../../../utils/validation";

export function PasswordChangeForm() {
  const { fetchWithAuth } = useAuth();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({ password: "", confirm: "" });
  const [status, setStatus] = useState("idle");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const passwordResult = validatePassword(form.password);
    const confirmResult = validatePasswordConfirm(form.password, form.confirmPassword);
    setErrors({
      password: passwordResult.ok ? "" : passwordResult.msg,
      confirm: confirmResult.ok ? "" : confirmResult.msg,
    });
    return passwordResult.ok && confirmResult.ok;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setStatus("saving");
    try {
      await changePassword(fetchWithAuth, {
        password: form.password,
        confirm_password: form.confirmPassword,
      });
      alert("비밀번호가 변경되었습니다.");
      setForm({ password: "", confirmPassword: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "비밀번호 변경 실패");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <form className="password-change-form" onSubmit={handleSubmit}>
      <h1>비밀번호 변경</h1>
      <label>
        새 비밀번호
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          onBlur={validateForm}
        />
        {errors.password ? <span className="auth-error">{errors.password}</span> : null}
      </label>
      <label>
        비밀번호 확인
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={validateForm}
        />
        {errors.confirm ? <span className="auth-error">{errors.confirm}</span> : null}
      </label>
      <button
        type="submit"
        className="password-change-button"
        disabled={status === "saving"}
      >
        {status === "saving" ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
