import { RequireAuth } from "../components/auth/RequireAuth";
import { ProfileEditForm } from "../features/profile/components/ProfileEditForm";

export function meta() {
  return [
    { title: "회원정보 수정 - 하루 조각" },
    { name: "description", content: "프로필 수정" },
  ];
}

export default function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfileEditForm />
    </RequireAuth>
  );
}
