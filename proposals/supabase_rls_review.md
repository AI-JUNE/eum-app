# 이음(EUM) · Supabase 인증·RLS 점검 리포트 (2026-07-21)

> **상태: 제안 · 사람 승인 필요.** 이 회차에서 운영 DB/콘솔에는 어떤 변경도 실행하지 않았다.
> 코드 파일도 **live 데이터 경로(storage.js)는 수정하지 않았다.** 아래는 점검 결과와 적용 제안이다.

## 1. 점검 대상과 방법
- 대상: `eum-app-live` (Vite + React 19 + Supabase)
- 확인 파일: `src/eum/storage.js`, `src/EumApp.jsx`(import 구조), `src/main.jsx`
- 방법: 정적 코드 점검(빌드 샌드박스가 이번 회차 사용 불가 → 코드 리딩 기반)

## 2. 발견 (Findings)

### F-1 (High) · 익명키로 PII 전체 조회 가능
`storage.js`의 `dbList(table)`가 anon key로 모든 테이블을 `select=*` 한다.

```js
fetch(SUPA_URL + '/rest/v1/' + table + '?select=*',
  { headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY } })
```

- anon key는 프런트 번들에 그대로 노출된다(설계상 공개 키).
- 따라서 **Supabase에서 RLS가 꺼져 있으면**, 누구나 anon key만으로
  `participants`의 `phone`·`address`·`emergency_contact`(개인정보)를 전량 내려받을 수 있다.
- `activity_logs`·`surveys`(상담/활동 서술), `settlements`(상품권 코드·금액),
  `safety_incidents`(안전사고 서술)도 민감 데이터다.
- 이 위험은 storage.js 상단 주석에 이미 "다음 회차 점검 항목"으로 기재되어 있었고, 이번에 처리한다.

### F-2 (Medium) · 인증 계층 부재
현재 앱은 역할(코디/청년/어르신/양육가정)을 **프런트 상태로만** 구분하고,
Supabase Auth 로그인/세션이 없다. 데이터 접근이 서버 측 신원에 묶여 있지 않다.

### F-3 (Low) · anon 스키마 권한
RLS와 별개로 `anon` 역할의 테이블 `SELECT` 권한 자체가 열려 있을 가능성. 이중 방어로 회수 권장.

## 3. 제안 (Proposal) — `supabase_rls.sql` 참조

권장 적용 순서(운영자 직접 수행):

1. **스테이징 프로젝트**에서 `supabase_rls.sql`의 **(A) 권장안**을 실행
   → 전 테이블 RLS 활성화 + `authenticated`만 접근 + `anon` 권한 회수.
2. 코디네이터용 **Supabase Auth 로그인** 도입(이메일/비밀번호 또는 매직링크).
   프런트는 로그인 세션 토큰으로 `dbList`를 호출하도록 변경(별도 회차·빌드 검증 후).
3. 익명 데모 열람을 유지해야 하면 **(B) 안전 뷰**(`participants_public`, PII 제외)만 공개하고,
   `storage.js`가 base 테이블 대신 이 뷰를 읽도록 변경.
4. 장기적으로 **(C)** 참여자 본인/보호자 행 단위 접근(`auth.uid()` 매칭) 도입.

### storage.js에 대한 (미적용) 코드 개선 제안
아래는 이번 회차에 **적용하지 않은** 개선안이다(빌드 검증 불가 + 런타임 동작 변경이라 승인 후 별도 회차 처리).

- 익명 읽기 경로에서 `participants`는 `select=*` 대신 **비-PII 컬럼만** 지정하거나
  `participants_public` 뷰를 사용.
- `dbList`에 **테이블 화이트리스트** 가드 추가(임의 테이블 접근 방지, 방어적).

## 4. 안전 규칙 준수
- 운영 DB/콘솔 변경, 마이그레이션 실행, git 커밋/푸시/배포: **하지 않음.**
- RLS/인증은 되돌리기 어려운 보안 변경 → **코드/문서 제안까지만.** 적용은 사람이 검토 후 수행.
- `supabase_rls.sql`은 **(A) 적용 시 익명 직접 읽기가 차단**되어 앱이 시드/로컬 폴백으로
  동작함에 유의(F-1 해소의 정상 결과). 익명 열람 유지가 필요하면 (B)를 함께 적용.

## 5. 사람이 확인/결정해야 할 것
- (결정) 익명 데모 열람을 계속 열어둘지 → 열면 (B) 안전 뷰 경로, 닫으면 (A)만.
- (실행) 스테이징에서 `supabase_rls.sql` 검증 후 운영 적용.
- (후속) Supabase Auth 도입 및 `storage.js` 인증 헤더 연동(별도 회차).
