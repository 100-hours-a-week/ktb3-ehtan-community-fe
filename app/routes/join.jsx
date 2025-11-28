import { JoinForm } from "../features/auth/components/JoinForm";

export function meta() {
  return [
    { title: "회원가입 - 하루 조각" },
    { name: "description", content: "하루 조각 커뮤니티 회원가입 페이지" },
  ];
}

export default function JoinRoute() {
  return <JoinForm />;
}
