// ============================================================================
// SEED 어댑터 — 2R 가이드 §6-4 「하드코딩 페르소나 → 시드 스크립트 이관」
//
// 실데이터는 이제 packages/db/seed.js 한 곳에만 있다. 이 파일은 어댑터다.
//   · 기존 `import { SEED_DATA } from './eum/seed.js'` 호출부를 깨지 않는다.
//   · 아바타 색 토큰(C.sage/lavender/peach)을 시드 모듈에 주입한다.
//   · 모든 레코드에 is_demo:true 가 붙어 실데이터와 구분된다.
//
// 새 코드는 가급적 packages/db/seed.js 를 직접 쓰고, 통계 집계에는 excludeDemo() 를 쓴다.
// ============================================================================
import { C } from './theme.js';
import {
  buildSeed,
  SEED_META,
  DEMO_FLAG,
  isDemoRecord,
  excludeDemo,
  onlyDemo,
  seedTableNames,
  seedRecordCount,
} from '../../packages/db/seed.js';

/** 디자인 토큰을 주입해 시드를 생성한다(값·구조는 이관 전과 동일 + is_demo). */
export const SEED_PALETTE = { sage: C.sage, lavender: C.lavender, peach: C.peach };

export const SEED_DATA = buildSeed(SEED_PALETTE);

/** 「데모 데이터」 배지에 쓸 요약 — 건수는 항상 계산값(하드코딩 금지, §1 원칙 4) */
export function seedBadgeInfo(state) {
  const src = state || SEED_DATA;
  const rows = Object.values(src).filter(Array.isArray).flat();
  const demo = onlyDemo(rows).length;
  const real = rows.length - demo;
  return {
    label: SEED_META.badge,
    notice: SEED_META.notice,
    version: SEED_META.version,
    demoCount: demo,
    realCount: real,
    total: rows.length,
  };
}

/** 시드를 처음 상태로 다시 만든다(§7-14 데모 초기화). */
export function freshSeed() {
  return buildSeed(SEED_PALETTE);
}

export {
  buildSeed,
  SEED_META,
  DEMO_FLAG,
  isDemoRecord,
  excludeDemo,
  onlyDemo,
  seedTableNames,
  seedRecordCount,
};
