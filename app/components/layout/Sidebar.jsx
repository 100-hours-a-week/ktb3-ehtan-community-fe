import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../providers/auth-context";
import { LoginModal } from "../auth/LoginModal";

export function Sidebar({ collapsed = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const goToJoin = () => navigate("/join");
  const goToWrite = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    navigate("/posts/new");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const nickname = user?.nickname ?? "사용자";
  const profileImage = user?.profileImageUrl ?? "/images/profile_placeholder.svg";

  return (
    <aside className={`side ${collapsed ? "collapsed" : ""}`}>
      <div className="side-card side-profile">
        {isAuthenticated ? (
          <div className="side-profile__member">
            <img
              className="profile-thumb"
              data-role="side-profile-image"
              src={profileImage}
              alt="profile"
            />
            <div className="side-profile__name" data-role="side-nickname">
              {nickname}
            </div>
            <div className="side-profile__hint">오늘도 새로운 조각을 부탁해요</div>
            <div className="side-profile__actions">
              <button type="button" data-action="write" onClick={goToWrite}>
                조각 쓰기
              </button>
              <button type="button" data-action="logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="side-profile__guest">
            <div className="side-profile__guest-title">
              로그인하고 다양한 기능을 이용해보세요!
            </div>
            <div className="side-profile__guest-actions">
              <button
                type="button"
                className="btn-login-guest"
                data-action="login"
                onClick={openLoginModal}
              >
                로그인
              </button>
              <button
                type="button"
                className="btn-join-guest"
                data-action="join"
                onClick={goToJoin}
              >
                회원가입
              </button>
            </div>
          </div>
        )}
      </div>
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
    </aside>
  );
}
