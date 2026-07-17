// ============================================================================
// 디자인 토큰 — EumApp 단일파일에서 분리 (1단계 · 값 100% 동일)
// 색상(C) · 페르소나(PERSONA) · 폰트 스택
// ※ src/lib/theme.js 는 구버전 App.jsx 계열 팔레트(#C75D3C)라 별도 유지.
//    라이브 엔트리(src/EumApp.jsx)는 이 파일(#E15A33 계열)을 사용한다.
// ============================================================================

export const C = {
  // 토스·카카오 계열 상용 팔레트 — 밝고 깨끗한 배경 + 선명한 테라코타 포인트
  brand: '#BE5535',
  brandDark: '#9E4329',
  brandSoft: '#F4E7E0',
  brandBg: '#FAF3EF',
  ink: '#1A1A1E',
  inkSoft: '#46464E',
  mute: '#71717A',
  muteLight: '#A2A2AB',
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

  // ── 콘솔·앱 내부 화면 전용 뉴트럴 (2차 개편) ──────────────────────────
  // 랜딩(웜 크림 톤)과 분리해, 내부 화면은 차갑고 정밀한 프로덕트 뉴트럴을 쓴다.
  appBg: '#F4F5F7',
  panel: '#FFFFFF',
  line: '#E7E9ED',
  lineSoft: '#F0F1F4',
  hover: '#F5F6F8',
  navMute: '#7C828C',
  headline: '#12141A',
};

// 내부 화면 공통 그림자 — 얕고 정밀하게(프로덕트 콘솔 문법)
export const SHADOW = {
  xs: '0 1px 2px rgba(16,24,40,0.04)',
  sm: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
  md: '0 8px 24px -12px rgba(16,24,40,0.16)',
  lg: '0 20px 48px -24px rgba(16,24,40,0.24)',
};

export const PERSONA = {
  teen: { label: '청소년', color: C.blue, soft: C.blueSoft, ring: 'rgba(74,111,165,0.25)' },
  youth: { label: '청년', color: C.sage, soft: C.sageSoft, ring: 'rgba(95,133,86,0.25)' },
  adult: { label: '중년·서포터', color: C.gold, soft: C.goldSoft, ring: 'rgba(184,136,74,0.25)' },
  senior: { label: '어르신', color: C.lavender, soft: C.lavenderSoft, ring: 'rgba(127,111,160,0.25)' },
  parent: { label: '양육가정', color: C.peach, soft: C.peachSoft, ring: 'rgba(216,147,104,0.25)' },
  child: { label: '아동', color: C.peach, soft: C.peachSoft, ring: 'rgba(216,147,104,0.25)' },
  coordinator: { label: '코디네이터', color: C.ink, soft: '#EDEAE5', ring: 'rgba(26,24,20,0.15)' },
};

export const FONT_STACK = `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;
// 디스플레이도 Pretendard 산세리프(굵게) — 토스·카카오 계열 상용 일관성
export const SERIF_STACK = FONT_STACK;
