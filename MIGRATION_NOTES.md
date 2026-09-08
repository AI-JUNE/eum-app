# MIGRATION_NOTES — eum-app-live → eum-mvp 이식 후보 목록

> 이 저장소(eum-app-live, Vite+React)는 **랜딩·디자인 자산 보관/유지보수** 역할이다.
> 2R MVP 본체는 별도 저장소 **eum-mvp**(Next.js)다. 아래는 그쪽으로 옮길 가치가 있는 자산의 목록이다.
> 신규 기능은 이 저장소에 만들지 않는다.
>
> 최종 갱신: 2026-09-08 (자동 유지보수 실행)

## 난이도 기준

| 등급 | 의미 |
|---|---|
| **A (그대로 복사)** | 순수 JS/JSX, 브라우저 API 미사용 → Next.js Server/Client 어디서든 동작. 파일 복사 + import 경로만 수정 |
| **B (약간 수정)** | React 훅 사용 또는 브라우저 API 소량 → 파일 상단 `'use client'` 추가 정도 |
| **C (구조 수정 필요)** | 브라우저 API 다수·인라인 스타일 대량·Vite 전용 자산 참조 → SSR 가드/자산 재배치 필요 |

---

## 1. 디자인 토큰 (최우선 · 난이도 A)

| 파일 | 용도 | 난이도 | 비고 |
|---|---|---|---|
| `src/eum/theme.js` (91줄) | **확정 시안 팔레트.** `C`(브랜드 테라코타 #BE5535 + 웜 뉴트럴 램프 + 다크 서피스), `SHADOW`(xs~lg), `PERSONA`(역할별 색·라벨), `FONT_STACK`/`SERIF_STACK` | **A** | 의존성 0. **가장 먼저 옮길 것.** 아래 컴포넌트 전부가 이 파일에 의존한다 |
| `src/lib/theme.js` (49줄) | 구버전 App.jsx 계열 팔레트(#C75D3C) | — | **이식 대상 아님.** 레거시. `src/eum/theme.js` 와 혼동 주의 |

> **주의:** 팔레트가 두 개 존재한다. 라이브 엔트리(`src/EumApp.jsx`)가 쓰는 것은 `src/eum/theme.js` 쪽이다.
> Next 로 옮길 때는 `C` 를 CSS 변수(`--eum-brand` 등)로 한 번 더 승격시키면 Tailwind/CSS Modules 와도 붙는다.

## 2. 순수 로직 (난이도 A)

| 파일 | 용도 | 난이도 |
|---|---|---|
| `packages/matching/index.js` (151줄) | 2R §5 매칭 엔진 본체. 가중 점수·하드 필터·규칙 기반 추천사유 | **A** — 이미 packages 로 분리됨. 워크스페이스째 이동 가능 |
| `packages/db/schema.sql` | 2R §4 DB 스키마 13테이블 + RLS | **A** |
| `packages/db/seed.js` | 시드 데이터 단일 출처 | **A** |
| `src/eum/matchingEngine.js` (215줄) | 위 packages/matching 의 앱측 어댑터 | **A** |
| `src/eum/legal.js` (102줄) | 약관·개인정보처리방침 본문(`TERMS_SECTIONS`, `PRIVACY_SECTIONS`, `LEGAL_META`) | **A** — 텍스트 상수뿐 |
| `src/eum/validate.js` (141줄) | 입력 검증(길이 상한·제어문자 제거 등). 테스트 커버 있음 | **A** |
| `src/eum/utils.js` (39줄) | `krw()` 등 포매터 | **A** |
| `src/lib/format.js`, `src/lib/settlement.js`, `src/lib/constants.js` | 소형 유틸·정산 계산 | **A** — 단, `src/eum/*` 와 중복 여부 확인 후 하나만 채택 |

## 3. UI 컴포넌트 라이브러리 (난이도 B)

| 파일 | 용도 | 난이도 |
|---|---|---|
| `src/eum/avatar.jsx` (96줄) | `Avatar` — 이름 이니셜 + 페르소나 색 | **A** — 브라우저 API 0 |
| `src/eum/ui.jsx` (923줄) | **디자인 시스템 본체.** Badge / Button / Card / Input / Textarea / Select / Checkbox / Modal / Toast / StatCard / KpiStrip / CountUp / Ring / AnimatedBar / Reveal / TrustBadge / SearchBar / Tabs / Empty / Skeleton / EumLogo / PageHeader / Panel / Field / ChipSelect | **B** — 브라우저 API 15곳(`prefersReducedMotion`, `useIsMobile`, IntersectionObserver). 파일 상단 `'use client'` + `matchMedia` SSR 가드면 충분 |

> 이식 순서 권장: `theme.js` → `avatar.jsx` → `ui.jsx` → 그 위에 화면.
> `ui.jsx` 는 한 파일에 24개 컴포넌트가 들어 있다. eum-mvp 에서는 `components/ui/` 하위로 쪼개는 편이 좋다.

## 4. 랜딩 섹션 (난이도 B~C · 선별 이식)

`src/eum/landing.jsx` (1169줄) — `RLLanding` 하나에 아래 섹션 컴포넌트가 모두 들어 있다.
**통째 이식보다 섹션 단위 발췌를 권한다.**

| 섹션 컴포넌트 | 용도 | 이식 가치 | 난이도 |
|---|---|---|---|
| `RLHeroScene` | 히어로 | 높음 | **C** — `public/hero-3gen.jpg` 동반 이동 필요 |
| `RLSectionHead` / `RLEyebrow` / `RLRule` | 섹션 헤더 프리미티브 | 높음 | **A** |
| `RLCountUp` / `RLRing` | 숫자 카운트업·도넛 게이지 | 중간 | **B** — `ui.jsx` 의 `CountUp`/`Ring` 과 **중복**. MVP 에서는 하나로 통합할 것 |
| `RLLoopInfographic` | 3세대 순환 구조 인포그래픽 | **높음** — 서비스 핵심 설명 | **B** |
| `RLStepsBand` | 가입~매칭 단계 안내 | 높음 | **B** |
| `RLSafetyBand` | 안전장치 설명 | 높음 | **C** — `public/safety-3gen.jpg` 동반 |
| `RLKakaoBand` | 카카오채널 진입 안내 | 중간 | **C** — `public/kakao-main.png` 동반 |
| `RLFaqBand` | FAQ 아코디언 | 중간 | **B** |
| `RLPartnerStrip` | 파트너 로고 스트립 | 중간 | **B** — `public/logos/` 동반 |
| `RLDeviceBrowser` / `RLCoordMock` / `RLPhoneMock` | 제품 목업 프레임 | 중간 | **B** |
| `LegalModal` | 약관 모달 | 높음 | **B** |
| `RLImpactBand` / `RLBenchmarkBand` / `RLMoatBand` / `RLRevenueModelBand` | 성과·벤치마크·해자·수익모델 | **낮음 — 재검토 필요** | — 투자용 서술. **2R §8 가짜 수치 금지 규칙에 걸릴 소지**가 있으니 이식 전 수치 출처 확인 |
| `RLTestimonialBand` | 이용자 후기 | **낮음** | — 실제 후기 확보 전에는 이식 금지 |
| `RLPricingBand` | B2C 구독 | — | **이식 대상 아님.** 이미 `return null` (요청으로 제외됨) |

**`landing.jsx` 내부 인라인 HTML 상수** — `TOBE_CSS`, `AX_ROWS_HTML`, `PROD_HTML`, `KAKAO_PHONE_HTML` 은
`dangerouslySetInnerHTML` 로 주입된다. Next 이식 시 CSS Modules / 실제 JSX 로 바꾸는 편이 안전하다. (난이도 **C**)

## 5. 앱 셸 (난이도 C · 이식 가치 중간)

| 파일 | 용도 | 난이도 |
|---|---|---|
| `src/eum/chrome.jsx` (677줄) | `Sidebar`, `Layout`, `ConsumerLayout`, `NotificationBell`, `CheckInOutCard`, `TrustRow`, `HomeHub`, `ViewAnnouncer` | **C** — 브라우저 API 10곳 + Vite 식 상태 전달(`state`/`dispatch` prop drilling). Next App Router 는 라우팅·레이아웃이 파일시스템 기반이라 `Sidebar`/`TrustRow` 의 **마크업만** 발췌하고 라우팅 로직은 새로 쓰는 편이 빠르다 |

## 6. 정적 자산 (난이도 A · 단순 복사)

| 경로 | 용도 | 비고 |
|---|---|---|
| `public/favicon.svg` | 파비콘 | 그대로 |
| `public/icons.svg` (5KB) | 스프라이트 아이콘 | 실사용처 확인 후 이동 — lucide-react 로 대체됐을 가능성 |
| `public/ieum_icon_1024.png` | 앱 아이콘 원본 | PWA/OG 이미지용 |
| `public/hero-3gen.jpg` (237KB) | 히어로 이미지 | `.png`(1.2MB) 말고 **jpg 쪽**을 쓸 것 |
| `public/safety-3gen.jpg` (207KB) | 안전 섹션 이미지 | 위와 동일 |
| `public/kakao-main.png` (432KB) | 카카오채널 목업 | Next `<Image>` 로 옮기면서 최적화 권장 |
| `public/logos/` | 파트너 로고 | 디렉터리째 |
| `public/robots.txt`, `public/sitemap.xml` | SEO | Next 는 `app/robots.ts`·`app/sitemap.ts` 로 대체 권장 |
| `DESIGN_SYSTEM.md` | 디자인 시스템 문서 | 문서로 동반 이동 |

## 7. 이식 대상 아님 (남겨둘 것)

- `src/old/` — 구버전 전체
- `src/App.jsx` — 구버전 단일파일 앱
- `src/EumApp.jsx` (240KB) — 레거시 단일파일. 빌드 검증용으로만 유지
- `src/lib/theme.js` — 구 팔레트
- `이음_디자인시안_v2~v4.html`, `_디자인시안/` — 시안 아카이브
- `src/Thumbs.db`, `.eumcheck_tmp.js`, `_mountcheck*.txt`, `_wtest_5` — 잔재 파일

## 8. 권장 이식 순서

1. `src/eum/theme.js` (토큰)
2. `packages/matching`, `packages/db` (로직·스키마)
3. `src/eum/{utils,validate,legal}.js` (순수 유틸)
4. `src/eum/avatar.jsx` → `src/eum/ui.jsx` (컴포넌트 기반)
5. `public/` 이미지 자산
6. `landing.jsx` 섹션 선별 발췌 (§4 표의 "이식 가치 높음"부터)
7. `chrome.jsx` 는 마크업만 참조, 라우팅은 Next 방식으로 신규 작성

## 9. 이식 시 주의

- **가짜 수치 금지 (2R §8).** 랜딩의 성과·벤치마크·후기 섹션은 수치 출처가 확인된 것만 옮긴다.
- **「AI 학습」 류 표현 금지.** 매칭 엔진은 가중 점수 + 하드 필터 + 규칙 기반 문장 생성이며 스스로 학습하지 않는다. `CoordinatorApp.jsx:319` 의 고지 문구를 그대로 가져갈 것.
  (도메인 용어 `학습멘토`는 서비스 활동 유형 이름이므로 무관하다.)
- **인라인 스타일.** 이 저장소는 전부 인라인 `style={{}}` 이다. eum-mvp 의 스타일 전략(Tailwind/CSS Modules)에 맞춰 변환 정책을 먼저 정하고 시작할 것.
- **재수출 구문.** Next(SWC+webpack)는 `import` 후 bare `export` 를 재수출로 연결하지 못한다. 반드시 `export { … } from '…'` 형태를 유지한다. (커밋 `0af606f` 참조)
