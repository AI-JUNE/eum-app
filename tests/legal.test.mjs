// 법적 고지 초안(legal.js) 무결성 테스트 — 동의 UI가 참조하는 전문이 항상 유효해야 한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGAL_META, TERMS_SECTIONS, PRIVACY_SECTIONS } from '../src/eum/legal.js';

test('LEGAL_META: 필수 필드와 draft 상태(정식 게시는 승인 필요)', () => {
  assert.equal(LEGAL_META.service, '이음');
  assert.ok(LEGAL_META.operator.includes('고원'));
  assert.match(LEGAL_META.contactEmail, /@/);
  assert.match(LEGAL_META.effectiveDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(LEGAL_META.status, 'draft'); // published 전환은 법무 검토 후 사람 승인
});

test('이용약관: 조문 구조 유효(제목·본문 비어있지 않음)', () => {
  assert.ok(TERMS_SECTIONS.length >= 8);
  for (const s of TERMS_SECTIONS) {
    assert.ok(s.h && s.h.trim().length > 0);
    assert.ok(s.body && s.body.trim().length >= 20);
  }
  assert.ok(TERMS_SECTIONS[0].h.includes('목적'));
});

test('처리방침: 법정 필수 항목 포함(수집항목·목적·보유기간·제3자·권리·책임자)', () => {
  const all = PRIVACY_SECTIONS.map(s => s.h + s.body).join('\n');
  for (const kw of ['수집하는 개인정보', '목적', '보유 및 이용 기간', '제3자 제공', '권리', '보호책임자']) {
    assert.ok(all.includes(kw), '누락: ' + kw);
  }
  for (const s of PRIVACY_SECTIONS) {
    assert.ok(s.h && s.body && s.body.trim().length >= 20);
  }
});
