// ============================================================================
// AVATAR PRIMITIVES — src/EumApp.jsx 에서 분리 (단일파일 분해: UI 프리미티브 1단계)
//   값·마크업 100% 동일. 세대 글리프 + 아바타.
// ============================================================================
import { C, FONT_STACK } from './theme.js';

// 세대·성별을 반영한 생성형 얼굴 아이콘 (이름 해시로 결정 → 같은 사람은 항상 같은 얼굴)
// ── 세대 글리프 (3차 개편) ──────────────────────────────────────────────
// 카툰 얼굴을 걷어낸 뒤, 세대(아동·청년·어르신 등)를 미니멀 실루엣 아이콘으로 다시 그린다.
// 원칙: 단색 실루엣 + 단일 굵기 · 32px에서도 또렷하게 읽히는 최소 형태 · 세대별 1개 식별 신호만.
//   아동   = 큰 머리 + 작은 몸(비율로 아이임을 표현) + 정수리 뿔머리
//   청년   = 표준 인물 실루엣
//   어르신 = 인물 + 지팡이(가장 또렷한 세대 신호)
//   양육가정 = 어른+아이 2인 실루엣
//   청소년 = 청년 실루엣(백팩 끈 1개)
// viewBox 0 0 40 40, 색상은 currentColor.
export function PersonaGlyph({ type, size = 40 }) {
  const s = { width: size, height: size, display: 'block' };
  const common = { fill: 'currentColor' };
  switch (type) {
    case 'child':
      return (
        <svg viewBox="0 0 40 40" style={s} aria-hidden="true">
          <path {...common} d="M20 5.4c1.2 0 2.1.6 2.7 1.6.5-.2 1-.1 1.3.3.3.4.2 1-.2 1.4A7 7 0 1 1 14 15.6c-.5-.3-.7-.9-.4-1.4.3-.5.8-.6 1.3-.4A6.9 6.9 0 0 1 20 5.4Z" />
          <path {...common} d="M20 24.2c5.7 0 9.4 3.1 9.4 8.1 0 1.3-.9 2.1-2.3 2.1H12.9c-1.4 0-2.3-.8-2.3-2.1 0-5 3.7-8.1 9.4-8.1Z" />
        </svg>
      );
    case 'senior':
      return (
        <svg viewBox="0 0 40 40" style={s} aria-hidden="true">
          <circle {...common} cx="18.5" cy="13.2" r="6.1" />
          <path {...common} d="M18.5 21.6c5.7 0 9.2 3.2 9.2 8.3 0 1.3-.9 2.1-2.3 2.1H11.6c-1.4 0-2.3-.8-2.3-2.1 0-5.1 3.5-8.3 9.2-8.3Z" />
          {/* 지팡이 — 세대 식별 신호 */}
          <path d="M30.2 15.2a2 2 0 0 1 2 2v14.6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      );
    case 'parent':
      return (
        <svg viewBox="0 0 40 40" style={s} aria-hidden="true">
          <circle {...common} cx="15.5" cy="12.6" r="5.4" />
          <path {...common} d="M15.5 19.9c5.1 0 8.3 2.9 8.3 7.4 0 1.2-.8 1.9-2 1.9H9.2c-1.2 0-2-.7-2-1.9 0-4.5 3.2-7.4 8.3-7.4Z" />
          <circle {...common} cx="28.4" cy="19.2" r="3.9" />
          <path {...common} d="M28.4 24.4c3.7 0 6 2.1 6 5.3 0 .9-.6 1.4-1.5 1.4h-9c-.9 0-1.5-.5-1.5-1.4 0-3.2 2.3-5.3 6-5.3Z" />
        </svg>
      );
    case 'teen':
      return (
        <svg viewBox="0 0 40 40" style={s} aria-hidden="true">
          <circle {...common} cx="20" cy="12.8" r="6" />
          <path {...common} d="M20 21c5.8 0 9.4 3.2 9.4 8.3 0 1.3-.9 2.1-2.3 2.1H12.9c-1.4 0-2.3-.8-2.3-2.1 0-5.1 3.6-8.3 9.4-8.3Z" />
          {/* 백팩 끈 */}
          <path d="M25.6 22.4v7.5" fill="none" stroke="var(--eum-panel,#fff)" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        </svg>
      );
    default: // youth / adult
      return (
        <svg viewBox="0 0 40 40" style={s} aria-hidden="true">
          <circle {...common} cx="20" cy="13" r="6.3" />
          <path {...common} d="M20 21.4c6 0 9.7 3.3 9.7 8.5 0 1.4-.9 2.2-2.4 2.2H12.7c-1.5 0-2.4-.8-2.4-2.2 0-5.2 3.7-8.5 9.7-8.5Z" />
        </svg>
      );
  }
}

// ── 아바타 (3차 개편) ────────────────────────────────────────────────────
// 세대 타입이 있으면 세대 글리프를, 없으면(코디네이터 등 개인 식별 대상) 이름 모노그램을 쓴다.
// 세대 구분은 '글리프 형태 + 페르소나 색'으로 이중 표현한다.
const GLYPH_TYPES = new Set(['child', 'senior', 'parent', 'teen', 'youth', 'adult']);
export function Avatar({ name, color = C.brand, size = 40, ring = false, type }) {
  const label = String(name || '').trim();
  const useGlyph = GLYPH_TYPES.has(type);
  const initial = label ? label.slice(-2) : '?'; // 한글 이름은 끝 두 글자가 식별력이 높다
  const fs = size <= 28 ? size * 0.36 : size <= 40 ? size * 0.34 : size * 0.32;

  return (
    <div
      aria-label={label}
      title={label}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        background: `${color}16`,
        color,
        // 안쪽 1px 링 — 흰 배경 위에서 형태가 흐려지지 않게 잡아준다
        boxShadow: ring
          ? `inset 0 0 0 1px ${color}2e, 0 0 0 3px ${C.panel}, 0 0 0 5px ${color}33`
          : `inset 0 0 0 1px ${color}2e`,
        fontSize: fs, fontWeight: 700, letterSpacing: '-0.03em',
        fontFamily: FONT_STACK, userSelect: 'none', lineHeight: 1,
      }}
    >
      {useGlyph ? <PersonaGlyph type={type} size={Math.round(size * 0.72)} /> : initial}
    </div>
  );
}
