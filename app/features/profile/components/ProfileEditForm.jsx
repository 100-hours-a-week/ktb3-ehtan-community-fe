import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../providers/auth-context";
import { fetchUserDetail, updateProfile, deleteAccount } from "../api/profile-api";
import { validateNickname } from "../../../utils/validation";

export function ProfileEditForm() {
  const { fetchWithAuth, user, logout, setUser } = useAuth();
  const [form, setForm] = useState({ nickname: "" });
  const [hint, setHint] = useState("");
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    fetchUserDetail(fetchWithAuth, user.id)
      .then((data) => {
        setForm({ nickname: data?.nickname ?? "" });
      })
      .catch((err) => setHint(err.message));
  }, [fetchWithAuth, user?.id]);

  const handleChange = (event) => {
    const { value } = event.target;
    setForm({ nickname: value });
    const result = validateNickname(value);
    setHint(result.ok ? "" : result.msg);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateNickname(form.nickname);
    if (!result.ok) {
      setHint(result.msg);
      return;
    }
    setStatus("saving");
    try {
      await updateProfile(fetchWithAuth, { nickname: form.nickname });
      setUser({ ...(user ?? {}), nickname: form.nickname });
      alert("프로필 수정 완료");
    } catch (error) {
      setHint(error instanceof Error ? error.message : "프로필 수정 실패");
    } finally {
      setStatus("idle");
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;
    await deleteAccount(fetchWithAuth);
    await logout();
    navigate("/login");
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      <h1>회원정보 수정</h1>
      <label>
        닉네임
        <input type="text" value={form.nickname} onChange={handleChange} maxLength={10} />
      </label>
      {hint ? <p className="auth-error">{hint}</p> : null}
      <div className="profile-edit-actions">
        <button
          type="submit"
          className="profile-edit-button"
          disabled={status === "saving" || !form.nickname.trim()}
        >
          {status === "saving" ? "저장 중..." : "수정"}
        </button>
        <button type="button" className="withdraw-button" onClick={handleWithdraw}>
          회원탈퇴
        </button>
      </div>
    </form>
  );
}
