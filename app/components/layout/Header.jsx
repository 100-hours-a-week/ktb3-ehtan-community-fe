import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../providers/auth-context";
import { LoginModal } from "../../components/auth/LoginModal"

export function Header({ onToggleSidebar, sidebarCollapsed }) {
  const { isAuthenticated, user, logout, status } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (event) => {
      // 팝업창을 벗어난 클릭
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const profileImage = useMemo(
    () => user?.profileImageUrl ?? "/images/profile_placeholder.svg",
    [user?.profileImageUrl]
  );

  const handleSidebarToggle = useCallback(() => {
    onToggleSidebar?.();
  }, [onToggleSidebar]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const goToProfileEdit = () => {
    navigate("/profile");
    setMenuOpen(false);
  };
  const goToPasswordChange = () => {
    navigate("/password");
    setMenuOpen(false);
  };
  const HeaderLeftMemo = memo(HeaderLeft);
  const HeaderRightMemo = memo(HeaderRight);

  return (
    <div className="header-wrapper">
      <div className="header-left">
        <HeaderLeftMemo
          onToggleSidebar={handleSidebarToggle}
          sidebarCollapsed={sidebarCollapsed}
        />

        <div className="header-title">
          <a href="/">하루 조각</a>
        </div>
      </div>
      <HeaderRightMemo
        isAuthenticated={isAuthenticated}
        status={status}
        profileImage={profileImage}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
        menuRef={menuRef}
        goToProfileEdit={goToProfileEdit}
        goToPasswordChange={goToPasswordChange}
        onLogout={handleLogout}
      />
    </div>
  );
}

function HeaderLeft({ onToggleSidebar, sidebarCollapsed }) {
  return (
      <button
        type="button"
        className={`action-icon ${sidebarCollapsed ? "" : "icon-select"}`}
        id="sidebar-toggle"
        aria-pressed={!sidebarCollapsed}
        onClick={onToggleSidebar}
      >
        <svg
          className={sidebarCollapsed ? "" : "icon-select"}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
  );
}

const HeaderRight = ({
  isAuthenticated,
  status,
  profileImage,
  menuOpen,
  onToggleMenu,
  menuRef,
  goToProfileEdit,
  goToPasswordChange,
  onLogout,
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  return (
    <div className="header-right">
      {isAuthenticated &&
        <> 
          <img
            className="profile-image"
            src={profileImage}
            id="open-profile-settings"
            onClick={onToggleMenu}
          />
          <ProfileDropdown
            menuOpen={menuOpen}
            menuRef={menuRef}
            goToProfileEdit={goToProfileEdit}
            goToPasswordChange={goToPasswordChange}
            onLogout={onLogout}
          />
        </>
      }
      {!isAuthenticated && 
        <>
          <button
            type="button"
            className="btn-login-guest"
            onClick={openLoginModal}
            disabled={status === "checking"}>
          로그인
          </button>
          <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
        </>
      }
    </div>
  );
}


function ProfileDropdown({
  menuOpen,
  menuRef,
  goToProfileEdit,
  goToPasswordChange,
  onLogout,
}) {
  return (
    <div ref={menuRef} className={`profile-menu ${menuOpen ? "" : "hide"}`}>
      <div className="profile-card"></div>
      <button type="button" data-action="profile-edit" onClick={goToProfileEdit}>
        회원정보수정
      </button>
      <button type="button" data-action="password-change" onClick={goToPasswordChange}>
        비밀번호수정
      </button>
      <button type="button" data-action="logout" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}
