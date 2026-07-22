// ============================================================================
// billing.test.mjs — 구독결제·법적고지 스캐폴딩 회귀 가드 (의존성 없음: node --test)
//   실행: node --test tests/  (또는 npm test)
//   목적: 결제 스캐폴딩 순수 헬퍼의 동작 고정 + "승인 전 비활성" 가드레일 검증.
//         돈·법무 관련 로직이 승인 없이 활성화되면 테스트가 실패하도록 설계.
// ============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PLANS, BILLING_ENABLED,
  getPlan, isPaidPlan, formatKRW, buildOrderDraft, requestSubscription,
} from '../src/eum/billing.js';
import { TERMS_SECTIONS, PRIVACY_SECTIONS, LEGAL_META } from '../src/eum/legal.js';

// ── 가드레일: 승인 전 실결제/실게시 비활성 ─────────────────────────────────
test('[가드] 결제는 기본 비활성(BILLING_ENABLED=false) — 승인 전 실결제 금지', () => {
  assert.equal(BILLING_ENABLED, false);
});

test('[가드] 법적고지는 기본 draft — 법무 검토 전 published 금지', () => {
  assert.equal(LEGAL_META.status, 'draft');
});

// ── PLANS 무결성 ───────────────────────────────────────────────────────────
test('PLANS: 3단계(free/basic/premium)·금액 음수 없음·유료는 월간', () => {
  assert.equal(PLANS.length, 3);
  assert.deepEqual(PLANS.map(p => p.id), ['free', 'basic', 'premium']);
  for (const p of PLANS) {
    assert.ok(Number.isFinite(p.amount) && p.amount >= 0, `${p.id} 금액 유효`);
    if (p.amount > 0) assert.equal(p.interval, 'month', `${p.id} 유료는 월간`);
  }
});

// ── getPlan / isPaidPlan ────────────────────────────────────────────────────
test('getPlan: 유효 id 반환·미지 id는 null', () => {
  assert.equal(getPlan('basic').id, 'basic');
  assert.equal(getPlan('nope'), null);
  assert.equal(getPlan(undefined), null);
});

test('isPaidPlan: free=false, basic/premium=true, 미지=false', () => {
  assert.equal(isPaidPlan('free'), false);
  assert.equal(isPaidPlan('basic'), true);
  assert.equal(isPaidPlan('premium'), true);
  assert.equal(isPaidPlan('nope'), false);
});

// ── formatKRW (방어 포매터) ─────────────────────────────────────────────────
test('formatKRW: null/NaN=-, 0=무료, 정수=₩천단위', () => {
  assert.equal(formatKRW(null), '-');
  assert.equal(formatKRW(undefined), '-');
  assert.equal(formatKRW(NaN), '-');
  assert.equal(formatKRW('abc'), '-');
  assert.equal(formatKRW(0), '무료');
  assert.equal(formatKRW(19900), '₩19,900');
  assert.equal(formatKRW(39900), '₩39,900');
});

// ── buildOrderDraft (서버서명 전 프리페이로드) ──────────────────────────────
test('buildOrderDraft: 미지=unknown_plan, free=free_plan_no_payment', () => {
  assert.deepEqual(buildOrderDraft('nope'), { ok: false, error: 'unknown_plan' });
  assert.deepEqual(buildOrderDraft('free'), { ok: false, error: 'free_plan_no_payment' });
});

test('buildOrderDraft: 유료 플랜은 서버서명 요구 오더 초안 생성', () => {
  const r = buildOrderDraft('basic', { userRef: 'u1' });
  assert.equal(r.ok, true);
  assert.equal(r.order.planId, 'basic');
  assert.equal(r.order.amount, 19900);
  assert.equal(r.order.currency, 'KRW');
  assert.equal(r.order.userRef, 'u1');
  assert.equal(r.order._requiresServerSignature, true);
  assert.ok(typeof r.order.orderName === 'string' && r.order.orderName.length > 0);
});

// ── requestSubscription (승인 전 가드) ──────────────────────────────────────
test('requestSubscription: 잘못된/무료 플랜은 invalid로 차단', async () => {
  assert.equal((await requestSubscription('nope')).status, 'invalid');
  assert.equal((await requestSubscription('free')).status, 'invalid');
});

test('requestSubscription: 유료 플랜도 승인 전에는 disabled로 차단(실결제 없음)', async () => {
  const r = await requestSubscription('basic');
  assert.equal(r.ok, false);
  assert.equal(r.status, 'disabled');
  assert.match(r.message, /승인 필요/); // [승인 필요]
  assert.equal(r.order.amount, 19900);
});

// ── 법적고지 초안 구조 ──────────────────────────────────────────────────────
test('LEGAL: 약관·처리방침 섹션이 비어있지 않고 h/body 형식', () => {
  assert.ok(Array.isArray(TERMS_SECTIONS) && TERMS_SECTIONS.length > 0);
  assert.ok(Array.isArray(PRIVACY_SECTIONS) && PRIVACY_SECTIONS.length > 0);
  for (const s of [...TERMS_SECTIONS, ...PRIVACY_SECTIONS]) {
    assert.ok(s.h && typeof s.h === 'string', '제목 존재');
    assert.ok(s.body && typeof s.body === 'string', '본문 존재');
  }
  assert.ok(LEGAL_META.service && LEGAL_META.operator && LEGAL_META.contactEmail);
});
