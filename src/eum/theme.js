// ============================================================================
// 디자인 토큰 — EumApp 단일파일에서 분리 (1단계 · 값 100% 동일)
// 색상(C) · 페르소나(PERSONA) · 폰트 스택
// ※ src/lib/theme.js 는 구버전 App.jsx 계열 팔레트(#C75D3C)라 별도 유지.
//    라이브 엔트리(src/EumApp.jsx)는 이 파일(#E15A33 계열)을 사용한다.
// ============================================================================

export const C = {
  // D-ARS 계열 상용 팔레트 — 딥 네이비 + 로열 블루 액센트 + 쿨 라이트(씨크래프 TOBE 시안 반영)
  brand: '#2E6BF0',
  brandDark: '#1D50D0',
  brandSoft: '#E1EAFE',
  brandBg: '#EEF3FE',
  ink: '#15181F',
  inkSoft: '#404652',
  mute: '#6B7280',
  muteLight: '#9AA1AD',
  cream: '#F6F8FC',
  cardWarm: '#FAFBFE',
  bg: '#F4F6FB',
  card: '#FFFFFF',
  border: '#E6E9EF',
  borderSoft: '#F0F2F6',
  sage: '#2FA37A',
  sageSoft: '#DDF3EC',
  lavender: '#6C5CE7',
  lavenderSoft: '#E9E6FB',
  peach: '#E08A4B',
  peachSoft: '#FBEBDA',
  gold: '#C79A3A',
  goldSoft: '#F5ECD3',
  red: '#E1524B',
  redSoft: '#FBE4E3',
  blue: '#2E6BF0',
  blueSoft: '#E1EAFE',
  amber: '#E0A32E',
  amberSoft: '#FAEFD4',
  success: '#2FA37A',
  successSoft: '#DDF3EC',
  muteSoft: '#EAEDF2',

  // ── 콘솔·앱 내부 화면 전용 뉴트럴 (D-ARS 쿨 톤) ──────────────────────────
  appBg: '#F4F6FB',
  panel: '#FFFFFF',
  line: '#E6E9EF',
  lineSoft: '#F0F2F6',
  hover: '#F3F6FC',
  navMute: '#79808D',
  headline: '#111827',

  // ── 다크 네이비 (히어로·사이드바 등 D-ARS 프리미엄 다크 서피스) ──────────
  navy: '#0E1A30',            // 최심부(사이드바 배경)
  navy2: '#15294A',           // 히어로 그라데이션 중간
  navy3: '#1E355C',           // 다크 카드/보더 톤
  navyLine: 'rgba(255,255,255,0.09)',
  navyText: '#EAF0FA',        // 다크 위 본문
  navyMute: '#93A2BC',        // 다크 위 보조
  navyActive: 'rgba(46,107,240,0.18)', // 다크 사이드바 활성 배경
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
