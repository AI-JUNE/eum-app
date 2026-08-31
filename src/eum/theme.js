// ============================================================================
// 디자인 토큰 — EumApp 단일파일에서 분리 (1단계 · 값 100% 동일)
// 색상(C) · 페르소나(PERSONA) · 폰트 스택
// ※ src/lib/theme.js 는 구버전 App.jsx 계열 팔레트(#C75D3C)라 별도 유지.
//    라이브 엔트리(src/EumApp.jsx)는 이 파일(확정 시안 #BE5535 테라코타 계열)을 사용한다.
// ============================================================================

export const C = {
  // 확정 시안 팔레트 — 웜 크림 배경 + 브랜드 테라코타(#BE5535) 포인트 (에디토리얼 금융형)
  brand: '#BE5535',
  brandDark: '#9E4329',
  brandSoft: '#F4E7E0',
  brandBg: '#FAF3EF',
  // 뉴트럴 램프 — 확정 시안(ink #241d17 · sub #5f564d · mut #9b9186)에 맞춘 웜 그레이.
  // ※ 종전 Zinc 계열(쿨) 값에서 명도(L)는 유지하고 색상(hue)만 웜으로 이동 → 대비비 보존.
  ink: '#1E1A15',
  inkSoft: '#4A453E',
  mute: '#78716A',
  muteLight: '#A8A29A',
  cream: '#FBF8F5',
  cardWarm: '#FCFAF7',
  bg: '#F5F4F2',
  card: '#FFFFFF',
  border: '#EBE9E4',
  borderSoft: '#F3F1ED',
  sage: '#5C7C4F',
  sageSoft: '#E7EEE0',
  lavender: '#766B94',
  lavenderSoft: '#EBE7F0',
  peach: '#CE885B',
  peachSoft: '#F6E8D9',
  gold: '#AC8040',
  goldSoft: '#F0E6D2',
  red: '#BD4747',
  redSoft: '#F6E2E2',
  blue: '#456A9E',
  blueSoft: '#E2E9F1',
  amber: '#CB9836',
  amberSoft: '#F5ECD1',
  success: '#5C7C4F',
  successSoft: '#E7EEE0',
  muteSoft: '#EDE9DF',

  // ── 콘솔·앱 내부 화면 전용 뉴트럴 ──────────────────────────────────────
  // 랜딩(웜 크림 톤)과 같은 색 온도를 쓰되, 채도만 더 낮춰 차분한 프로덕트 뉴트럴을 만든다.
  // (종전 값은 Zinc/Slate 계열 쿨 그레이라 랜딩·브랜드와 색 온도가 어긋났다 → 명도 유지·웜 이동)
  appBg: '#F6F4F1',
  panel: '#FFFFFF',
  line: '#E9E4DD',
  lineSoft: '#F2EFEA',
  hover: '#F7F4F0',
  navMute: '#837B71',
  headline: '#191510',
  // 경계·아이콘 보조 단계 — 하드코딩 잔재를 대체하는 토큰(가드레일: 색은 C.* 로만)
  lineStrong: '#DED8CF',   // hover/active 경계, 스크롤바 썸
  muteFaint: '#CFC8BD',    // 장식용 셰브런·구분점(정보 없음)

  // ── 다크 서피스 (히어로·사이드바) — 웜 에스프레소 톤 ─────────────────────
  // ※ 키 이름(navy*)은 호환 유지용 레거시. 값은 확정 시안의 웜 다크(#241d17 계열).
  navy: '#241D17',            // 최심부(사이드바 배경)
  navy2: '#332A22',           // 히어로 그라데이션 중간
  navy3: '#43382D',           // 다크 카드/보더 톤
  navyLine: 'rgba(255,255,255,0.10)',
  navyText: '#F5EFE8',        // 다크 위 본문
  navyMute: '#B6A89C',        // 다크 위 보조
  navyActive: 'rgba(190,85,53,0.22)', // 다크 사이드바 활성 배경(테라코타)
};

// 내부 화면 공통 그림자 — 얕고 정밀하게(프로덕트 콘솔 문법)
// 그림자 색은 웜 에스프레소(#241D17 = navy 토큰)로. 크림/화이트 위에 쿨 그림자를 얹으면
// 카드 가장자리가 푸르스름하게 식어 보인다 — 알파는 그대로, 색상만 웜으로 이동.
export const SHADOW = {
  xs: '0 1px 2px rgba(36,29,23,0.04)',
  sm: '0 1px 3px rgba(36,29,23,0.06), 0 1px 2px rgba(36,29,23,0.04)',
  md: '0 8px 24px -12px rgba(36,29,23,0.16)',
  lg: '0 20px 48px -24px rgba(36,29,23,0.24)',
};

export const PERSONA = {
  teen: { label: '청소년', color: C.blue, soft: C.blueSoft, ring: 'rgba(74,111,165,0.25)' },
  youth: { label: '청년', color: C.sage, soft: C.sageSoft, ring: 'rgba(95,133,86,0.25)' },
  adult: { label: '중년·서포터', color: C.gold, soft: C.goldSoft, ring: 'rgba(184,136,74,0.25)' },
  senior: { label: '어르신', color: C.lavender, soft: C.lavenderSoft, ring: 'rgba(127,111,160,0.25)' },
  parent: { label: '양육가정', color: C.peach, soft: C.peachSoft, ring: 'rgba(206,136,91,0.25)' },
  child: { label: '아동', color: C.peach, soft: C.peachSoft, ring: 'rgba(206,136,91,0.25)' },
  coordinator: { label: '코디네이터', color: C.ink, soft: '#EDEAE5', ring: 'rgba(26,24,20,0.15)' },
};

export const FONT_STACK = `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;
// 디스플레이도 Pretendard 산세리프(굵게) — 토스·카카오 계열 상용 일관성
export const SERIF_STACK = FONT_STACK;
