import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../providers/auth-context";

export function RequireAuth({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return <div className="auth-form">인증 상태를 확인 중입니다...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}
