import { RequireAuth } from "../components/auth/RequireAuth";
import { PasswordChangeForm } from "../features/profile/components/PasswordChangeForm";

export function meta() {
  return [
    { title: "비밀번호 변경 - 하루 조각" },
    { name: "description", content: "비밀번호 변경" },
  ];
}

export default function PasswordRoute() {
  return (
    <RequireAuth>
      <PasswordChangeForm />
    </RequireAuth>
  );
}
