# 하루 조각 커뮤니티 (React 마이그레이션)

레거시 바닐라 JS 기반의 하루 조각 커뮤니티 화면을 React Router + Vite 환경으로 전면 재구성했습니다. 기존 CSS/UX 자산을 재사용하면서도, 실무에서 쓰이는 **기능(Feature) 단위 폴더 구성 + Provider/Service 레이어** 패턴을 적용해 초보자도 쉽게 따라올 수 있도록 정리했습니다.

## 실행 방법

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # SSR 빌드
```

> API 서버(`http://localhost:8080`)가 함께 실행 중이어야 게시글/로그인/댓글 등이 정상 동작합니다.

## 주요 기능

- 게시글 피드: Masonry 레이아웃 + IntersectionObserver 기반 무한 스크롤
- 게시글 상세: 좋아요 토글, 댓글 CRUD, 본문 이미지
- 게시글 작성/수정: 제목 검증, 이미지 업로드(`/upload/post`)
- 인증: 로그인(In-memory access token), 회원가입, RequireAuth 라우트 가드
- 마이페이지: 닉네임 수정, 비밀번호 변경, 회원 탈퇴
- 전역 스타일: 레거시 CSS를 그대로 import 해 기존 UI를 유지

## 폴더 구조 & 디자인 패턴

```
app/
  components/          # 공통 UI (Header, Sidebar, RequireAuth 등)
  features/            # 도메인별 UI + API + hooks
    auth/
    posts/
    profile/
  providers/           # 전역 상태 공급자 (AuthProvider)
  routes/              # React Router 파일 기반 라우트
  services/            # fetch wrapper, CSRF util, authStorage
  styles/legacy/       # 바닐라 CSS 그대로 재사용
  utils/               # 포맷/검증 헬퍼
```

- **Feature 기반 구조**: 게시글/인증/프로필처럼 실제 화면 단위로 폴더를 나눠, 컴포넌트·API·훅을 한곳에 묶었습니다. 복잡한 DDD 용어 없이 “기능별 디렉터리”라는 직관적인 규칙을 유지합니다.
- **Provider/Service 레이어**: 전역에서 공유해야 하는 로직(인증, API 설정)은 `providers/`와 `services/`로 분리해 여러 기능에서 재사용합니다. React 초보자도 “Provider에서 context를 만들고, Service에서 fetch 로직을 다룬다” 정도만 이해하면 됩니다.

## 전역 상태 & 인증 설계

- `AuthProvider`는 access token을 **인메모리**에만 보관하고, 사용자 정보는 세션 스토리지에 저장해 새로고침 후에도 UI가 유지되도록 했습니다.
- 모든 API 요청은 `fetchWithAuth`를 통해 토큰/CSRF 헤더가 자동으로 붙고, 401이 발생하면 `/auth/refresh`로 재발급을 시도한 뒤 한 번 더 재요청합니다.
- `RequireAuth` 라우트 가드는 로그인 상태를 확인한 뒤, 미인증 사용자는 로그인 페이지로 돌려보냅니다.
- 전역 컨텍스트가 제공하는 메서드
  - `login(payload)` / `logout()`
  - `fetchWithAuth(path, options)` – 전역 API 클라이언트
  - `setUser(user)` – 마이페이지/프로필 수정 후 사용자 정보 즉시 반영

## 스타일 전략

`app/app.css`에서 `styles/legacy/index.css`를 한 번만 import 해 전체 레거시 CSS를 그대로 가져왔습니다. 새로운 컴포넌트(예: 로그인 폼)만 최소한의 utility 스타일을 추가했고, 게시글/댓글 등 주요 UI는 기존 클래스명을 그대로 사용해 손쉽게 마이그레이션 했습니다.

## 마이그레이션 체크리스트

- [x] 레거시 분석 및 설계 (`docs/migration-plan.md`)
- [x] JS 기반 React 프로젝트 구성 + `.gitignore`
- [x] AuthProvider / API / CSRF 공통 레이어 구현
- [x] 게시글/댓글/작성/인증/프로필 화면 React 포팅
- [ ] 추가 QA & 고도화 (테스트, 접근성 등)

추가 개선이 필요하면 Issue/PR 혹은 새로운 TODO로 이어나갈 수 있습니다.
