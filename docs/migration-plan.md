# 하루조각 커뮤니티 FE 마이그레이션 계획 (Step 1)

## 1. 현재 프로젝트 구성 요약

- `app/`, `react-router.config.ts` : React Router 템플릿(SSR on) + Tailwind, TypeScript 세팅 → 아직 기본 Welcome 화면만 존재.
- `legacy/`: 실사용 중인 바닐라 JS 앱  
  - `page/*.html` : 라우팅/페이지 구성 (메인, 로그인·게시글·프로필 등)  
  - `scripts/` : 공통 레이아웃(`common.js`, `sidebar.js`), 인증(`auth.js`), API/CSRF(`api.js`), 게시글 목록/상세(`post/*.js`), 작성/수정/프로필/비밀번호 등  
  - `style/*.css`, `images/` : UI 전체 스타일과 아이콘  
- `node_modules/`, `package*.json`: React Router 템플릿 의존성 (React 19, react-router 7, tailwind 4 등)
- `.git` 존재하지만 `.gitignore` 부재 → `node_modules`가 추적되는 상태.

### 레거시 앱 주요 기능 흐름

| 기능 | 참고 파일 |
| --- | --- |
| 게시글 무한 스크롤 Masonry 목록, 조회수 기반 카드 크기 | `legacy/scripts/post/posts.js` |
| 게시글 상세 + 좋아요/댓글 CRUD, 삭제 모달 | `legacy/scripts/post/post.js` |
| 게시글 작성·수정, 이미지 업로드(FormData `/upload/post`) | `legacy/scripts/postEdit.js` |
| 로그인/회원가입/비밀번호/프로필 | `legacy/scripts/join.js`, `passwordChange.js`, `profileEdit.js` 등 |
| 전역 레이아웃/헤더/사이드바 & 토글 | `legacy/scripts/common.js`, `sidebar.js` |
| 인증/토큰 | `legacy/scripts/api.js`, `auth.js` : `localStorage`에 `access_token`, 쿠키 기반 CSRF, `/auth/refresh`로 재발급 |

UI 전반은 공통 헤더 + 사이드바, Masonry 카드, 댓글/모달, form validation 등으로 구성되어 있으며, 레거시 CSS를 그대로 가져오거나 모듈 단위로 분리할 필요가 있음.

## 2. React 마이그레이션 목표/설계

### 기술 스택 확정
- React Router 7 (이미 포함) + React 19
- TypeScript 비활성화 → `.js/.jsx` 베이스 (요구사항 4)
- 상태 관리: React Context + reducer 패턴(실무 패턴: Feature-based context)  
  - 전역 AuthContext: in-memory access token, 사용자 정보, refresh 진행 상태  
  - Query별 캐시는 React Query 대체 없이 자체 훅으로 시작 (필수 아님)  
- API 계층: `services/apiClient.js` (`fetch` wrapper) + `services/http/authHttp.js` (CSRF/refresh) → 레거시 `api.js` 대응
- 스타일: 레거시 CSS를 `src/styles/legacy/*.css`로 복사/분할 후 필요한 컴포넌트에 import. 필요 시 CSS Modules + BEM 유지.

### 폴더 구조 초안 (Feature 기반 + Provider/Service Layer)
```
app/
  components/          # 재사용 가능한 프레젠테이션 (Header, Sidebar, Masonry 등)
  features/
    auth/
    posts/
    profile/
  hooks/               # 공용 훅 (useIntersectionObserver 등)
  providers/
    AuthProvider.jsx
  routes/
    home.jsx
    posts/[id].jsx
    auth/login.jsx
  services/
    api-client.js
    csrf.js
  styles/
    legacy/            # 레거시 CSS 재배치
```
> 패턴: **Feature 기반 모듈 + Provider/Service Layer**. 리액트 초보자도 이해하기 쉽도록 “기능별 폴더”와 “전역 Provider/서비스”를 나누는 단순 구조에 집중합니다. 고급 DDD 용어 대신, “기능 단위로 컴포넌트·API·스타일을 묶고 필요 시 전역 Provider를 감싼다”라는 실무 패턴으로 설명/적용합니다.

### Auth/전역 상태 설계
- Access Token: 메모리 저장 (React state) + optional sessionStorage fallback (탭 새로고침 대비)  
- Refresh Token: HTTP only 쿠키 (백엔드 유지)  
- AuthContext 책임
  - 로그인/로그아웃/회원가입 핸들러
  - `fetchWithAuth` 제공 → 자동 헤더 주입, 401 시 refresh 재시도  
  - 사용자 프로필/닉네임/이미지 캐시
  - `AuthBoundary` 컴포넌트로 보호 라우트 구현
- 이유: 보안(토큰 노출 최소화), SSR 호환성, React Router loader/action에서 재사용 용이

### API/CSRF 처리
- `apiClient.js`: base URL, 공통 fetch wrapper, JSON 처리
- CSRF: POST/PATCH/DELETE 시 `ensureCsrf()` 호출 (`/csrf` POST 후 쿠키에서 `XSRF-TOKEN`)
- 401 흐름: `AUTH000/003` → refresh, `AUTH004` → 강제 로그아웃/리다이렉트
- 업로드: `uploadClient.js`에서 FormData 처리

### 핵심 화면 리빌드 우선순위
1. 홈/피드 (무한스크롤 Masonry) – 레거시 `posts.js`
2. 게시글 상세 + 좋아요/댓글 CRUD – `post.js`
3. 게시글 작성/수정 + 이미지 업로드 – `postEdit.js`
4. 로그인/회원가입, 프로필 수정, 비밀번호 변경
5. 공통 레이아웃·헤더·사이드바/프로필 드롭다운/모달

각 기능은 Feature 단위 라우트/컴포넌트/서비스를 갖고, 레거시와 동일한 UX를 유지하며 React 상태로 옮긴다.

### 체크리스트 진행 현황
- [x] Step 1 – 레거시 분석 및 마이그레이션 설계 (본 문서)
- [x] Step 2 – JS 기반 React 프로젝트 구성 재설계 + gitignore
- [x] Step 3 – 전역 상태/컨텍스트 & API 층 구현
- [x] Step 4 – 주요 화면 기능 마이그레이션
- [ ] Step 5 – README/문서화 및 마무리
