// 2R §6-4 — 시드 이관 검증: packages/db/seed.js 가 단일 출처이고
// 모든 레코드에 is_demo 가 붙으며 통계에서 제외 가능한지.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSeed, SEED_META, DEMO_FLAG, DEFAULT_PALETTE,
  isDemoRecord, excludeDemo, onlyDemo, seedTableNames, seedRecordCount,
} from '../packages/db/seed.js';

test('§6-4 시드는 §4 테이블 이름으로 구성되고 비어 있지 않다', () => {
  const names = seedTableNames();
  assert.ok(names.includes('participants'));
  assert.ok(names.includes('activities'));
  assert.ok(names.includes('matches'));
  assert.ok(names.length >= 8, `테이블 ${names.length}개`);
});

test('§6-4 모든 시드 레코드에 is_demo:true 가 붙는다', () => {
  const seed = buildSeed();
  const rows = Object.values(seed).filter(Array.isArray).flat();
  assert.ok(rows.length > 0);
  const missing = rows.filter((r) => r[DEMO_FLAG] !== true);
  assert.equal(missing.length, 0, `플래그 누락 ${missing.length}건`);
  assert.ok(rows.every(isDemoRecord));
});

test('§6-4 통계에서 시드를 제외할 수 있다 (실데이터와 혼재 시)', () => {
  const seed = buildSeed();
  const real = [{ id: 'r1', name: '실참여자' }, { id: 'r2', name: '실참여자2' }];
  const mixed = [...seed.participants, ...real];
  assert.equal(excludeDemo(mixed).length, 2);
  assert.equal(onlyDemo(mixed).length, seed.participants.length);
  assert.equal(excludeDemo(mixed)[0].id, 'r1');
});

test('§6-4 아바타 색 팔레트는 주입되고, 미주입 시 기본값을 쓴다', () => {
  const injected = buildSeed({ sage: '#111111', lavender: '#222222', peach: '#333333' });
  const youth = injected.participants.find((p) => p.type === 'youth');
  const senior = injected.participants.find((p) => p.type === 'senior');
  assert.equal(youth.avatar_color, '#111111');
  assert.equal(senior.avatar_color, '#222222');
  const fallback = buildSeed();
  assert.equal(fallback.participants.find((p) => p.type === 'youth').avatar_color, DEFAULT_PALETTE.sage);
});

test('§1 원칙4 — 건수는 하드코딩이 아니라 계산값이다', () => {
  const seed = buildSeed();
  const manual = Object.values(seed).reduce((n, r) => n + (Array.isArray(r) ? r.length : 0), 0);
  assert.equal(seedRecordCount(seed), manual);
  assert.equal(seedRecordCount(), manual);
});

test('§7-4 데모 배지 메타가 제공된다', () => {
  assert.equal(SEED_META.badge, '데모 데이터');
  assert.ok(SEED_META.notice.includes('실제 이용자 정보가 아닙니다'));
  assert.ok(SEED_META.version.length > 0);
});

test('§7-14 buildSeed 는 매번 새 객체를 만든다(데모 초기화 가능)', () => {
  const a = buildSeed();
  const b = buildSeed();
  assert.notEqual(a.participants, b.participants);
  a.participants[0].name = '변조';
  assert.notEqual(b.participants[0].name, '변조');
});
