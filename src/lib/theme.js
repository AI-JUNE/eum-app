// 디자인 토큰 — 색상(C) · 페르소나 · 폰트 스택
export const C = {
  brand: '#C75D3C',
  brandDark: '#A04826',
  brandSoft: '#F7E9E1',
  brandBg: '#FCF3EE',
  ink: '#16140F',
  inkSoft: '#514E47',
  mute: '#8E8A7F',
  muteLight: '#A7A398',
  cream: '#FAF7F2',
  bg: '#F4F2EC',
  card: '#FFFFFF',
  cardWarm: '#FBFAF6',
  border: '#E7E3D8',
  borderSoft: '#F0EBE0',
  sage: '#5F8556',
  sageSoft: '#E8EFE3',
  lavender: '#7F6FA0',
  lavenderSoft: '#EDE9F2',
  peach: '#D89368',
  peachSoft: '#F8EBDD',
  gold: '#B8884A',
  goldSoft: '#F2E8D6',
  red: '#C74848',
  redSoft: '#F8E4E4',
  blue: '#4A6FA5',
  blueSoft: '#E4EBF3',
  amber: '#D9A441',
  amberSoft: '#F7EDD3',
  success: '#5F8556',
  successSoft: '#E8EFE3',
  muteSoft: '#EFEBE3',
  brandLight: '#E0936B',
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
// 폰트 단일화 — Pretendard 하나로 통일 (상용 서비스 일관성). 디스플레이도 Pretendard.
export const SERIF_STACK = `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;
