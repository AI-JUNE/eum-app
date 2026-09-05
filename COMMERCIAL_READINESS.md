# 상용 출시 잔여 과제 (COMMERCIAL READINESS)

작성 2026-09-01. **이 문서는 자동 개발의 최우선 백로그다.** 위에서부터 소진한다.

## 원칙
- `[ ]` 미완, `[x]` 완료. 완료 시 근거(파일·테스트)를 한 줄로 남긴다.
- **build now, activate on approval**: 코드는 끝까지 만들되 실인증·실결제·실개인정보·실발신 **활성화는 사람 승인**. 스위치는 환경변수로 분리하고 기본 OFF.
- 임의 성과·KPI 수치를 화면·문서에 넣지 않는다. 실측 전에는 기능 서술로 쓴다.
- 모든 변경은 테스트·빌드 검증 통과 후 커밋한다.

## 공통 상용 필수 (전 제품)
- [x] **에러 모니터링** — 전역 에러 캡처 + 알림 훅. DSN은 환경변수, 미설정 시 무해하게 no-op
  - 근거: `src/eum/telemetry.js`(scrub PII 마스킹·subscribe 알림 훅·VITE_SENTRY_DSN 별칭·미설정 시 no-op) + `src/main.jsx`·`EumApp.jsx` ErrorBoundary 연결, `tests/telemetry.test.mjs` 32건 통과
- [x] **구조화 로깅** — 요청 ID·소요시간·에러코드. PII 미기록
  - 근거: `src/eum/reqlog.js`(startRequest/withRequestLog·errorCode 정규화·scrub 경유 PII 미기록), `src/eum/api.js` callClaude 적용, `tests/reqlog.test.mjs` 17건 통과
- [x] **/health 확장** — 의존성(DB·외부API) 상태와 버전·커밋 해시 노출(민감정보 제외)
  - 근거: `src/eum/health.js`(describeDependencies/probeDependency·타임아웃·rollupStatus·resolveBuildInfo 커밋7자·브랜치·배포환경, URL/시크릿 미노출을 findSecretLeaks 로 강제) + `vite.config.js` health.json 에 dependencies 포함, `tests/health.test.mjs` 26건 통과
- [x] **표준 에러 응답** 전 API 통일 + 입력검증
  - 근거: `src/eum/apiError.js`(ERROR_CODES 11종·ApiError·`{ok,data}`/`{ok:false,error:{code,message,status,requestId}}` 단일 포맷·normalizeError 로 예외/문자열/HTTP 모두 수렴·validateInput 이 validate.js 규칙을 표준 실패로 환산·callApi 경계 래퍼는 예외를 던지지 않음) + `src/eum/api.js` `callClaudeSafe`, `src/eum/eumApi.js` `callEumApi`/`EUM_API_SAFE`(원본 EUM_API·callClaude 는 무변경), `tests/apiError.test.mjs` 16건 + `tests/eumApiStandard.test.mjs` 6건 통과
- [x] **rate limit** 공개 API 적용
  - 근거: `src/eum/rateLimit.js`(작업별 정책 RATE_LIMITS·접두 상속 policyFor·슬라이딩 윈도우 consume/peek·429 표준 에러·callApi validate 훅용 gate) 를 `callClaudeSafe`(AI 비용)와 `callEumApi`(알림톡·1365·상품권) 경계에 적용 — 초과분은 연동처로 나가지 않음, `tests/rateLimit.test.mjs` 10건 통과. **서버측 rate limit 대체 아님**(브라우저 메모리 한정) — BFF 신설 시 같은 정책 이관
- [x] **표준 판 호출부 이관** — 화면의 기존 try/catch 호출을 `callClaudeSafe`·`EUM_API_SAFE` 로 순차 교체
  - 근거: 코디네이터(AI 트리오 추천·월간 리포트 `callClaudeSafe`, 복지 알림톡 `EUM_API_SAFE.notify`)·청년(실적확인서 `EUM_API_SAFE.v1365`) 4개 호출부 이관, 폴백 문구는 표준 `error.message` 를 이어받아 429 한도초과 등 실제 사유를 노출. `tests/callSiteMigration.test.mjs` 7건(소스 수준 회귀 고정 + 응답 모양) 포함 155건 전체 통과, 빌드 EXIT 0
- [x] **접근·감사 로그** — 관리 기능 접근 이력
  - 근거: `src/eum/audit.js` 변경 이력(AUDIT_RULES 18종·자유 텍스트 미기록)에 **열람 이력**을 추가 — `AUDIT_VIEWS` 14개 관리 화면의 `recordViewAccess`(분류 `view`, 60초 중복 억제, 미로그인·저위험 화면 제외, 조회 조건·검색어 미기록)를 `src/eum/apps/CoordinatorApp.jsx` 화면 전환에 연결, 조회·CSV는 기존 감사 화면(`apps/AuditLog.jsx`)에서 그대로 제공. `tests/audit.test.mjs` 15건 포함 162건 전체 통과, 빌드 EXIT 0. **서버 영구 보관·원격 전송은 [승인 필요]** — 현재 세션 메모리 한정
- [x] **백업·복구 절차** RUNBOOK.md 문서화 + 복구 리허설 기록
  - 근거: `RUNBOOK.md`(저장소 위치·주기·장애 유형별 대응·복원 절차[승인 필요]·복원 이력표·미개방 항목) + `src/eum/backup.js`(스냅샷 createSnapshot/체크섬 checksumOf 키순서 무관·건수 대조 verifySnapshot·복원 restoreState 는 검증 실패 시 상태 미변경·반출용 redactSnapshot 은 복원 차단·runRestoreRehearsal) + `src/eum/apps/BackupPanel.jsx`(감사 로그 화면 하단, 백업 생성·마스킹본·무결성 확인 — **복원 버튼은 의도적으로 두지 않음**) + `scripts/rehearse-restore.mjs`(`npm run rehearse:restore`, 실패 시 exit 1). **초회 리허설 2026-09-05 PASS** — 8단계(직렬화→파싱→검증→복원→원본 대조→정규화→변조 감지) 전부 통과, 레코드 155건 원본 일치, 체크섬 4b4c5fad856e2e05. `tests/backup.test.mjs` 14건 포함 176건 전체 통과, 빌드 EXIT 0. **원격 백업 업로드·자동 스케줄·화면 복원 버튼은 [승인 필요]**
- [ ] **약관·개인정보 처리방침 확정본 반영** (현재 초안, 문안은 사람이 확정)
- [ ] **테스트** 핵심 로직 커버리지 확보, CI에서 실행
  - 진행: 순수 모듈 15종 176건 로컬 통과(`npm test`). 남은 것 — 미커버 모듈(`matching.js`·`storage.normalizeState`) 테스트, CI 워크플로 추가. ※ CI 파일(`.github/workflows/*`)은 푸시 토큰에 `workflow` 스코프가 없으면 AutoPush 전체가 막히므로, 스코프 확인 후 추가한다

## 이음 전용 (준비도 ~72%, B2G)
- [ ] Supabase 인증·RLS 정책 코드 완성. 활성화 스위치 분리 **[승인 후 ON]**
- [ ] 개인정보 수집 동의 흐름 완성 — 항목·목적·보유기간 고지, 동의 이력 저장 **[실수집은 승인]**
- [ ] 미성년 보호자 동의 처리
- [ ] 데이터 영속화 — 현재 데모 SEED 기반, 실데이터 저장소 연결 준비
- [ ] 지자체 제출용 실적 리포트 완성 (월·분기 집계, 인쇄·CSV)
- [ ] 운영자 매뉴얼 — 코디네이터 업무 흐름 문서

## 파트너 채널 (제이투모로우원 — 운영 대행 + 수익 배분)

계약·서비스 주체는 고원, 파트너는 영업·운영을 담당하고 수익을 배분한다.
**향후 리셀러(파트너 명의 계약)로 전환될 수 있으므로, 지금은 2계층으로 확장 가능한 형태로만 열어둔다.**

- [ ] **파트너(채널) 개념 도입** — 조직/계약에 `partner_id`(nullable) 추가. 없으면 직접 계약. 스키마만 준비하고 화면 노출은 최소
- [ ] **매출 귀속 근거** — 어떤 고객사가 어느 파트너를 통해 유입됐는지 기록(유입 경로·계약일·담당자). 정산 분쟁을 예방하는 핵심
- [ ] **파트너 역할 권한** — 파트너 담당자는 자기가 유치한 고객사만 조회. 기존 RBAC에 `partner_admin` 역할 추가(활성화는 승인)
- [ ] **정산 리포트** — 파트너별 계약·이용 실적·수수료 산출 근거를 조회·내보내기. 수수료율은 설정값으로 분리(하드코딩 금지)
- [ ] **2계층 확장 여지 확보** — 테넌트 조회 경로에 파트너 필터가 나중에 끼어들 수 있도록 쿼리 계층 정리. 지금 화이트라벨은 구현하지 않음

> 원칙: 파트너 관련 기능도 **코드는 만들되 활성화는 승인**. 실제 정산·청구는 계약서 확정 후.

