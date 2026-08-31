// tests/validate.test.mjs — 입력검증 표준 유틸 (공통 P0)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIMITS, sanitizeText, validateText,
  validateDisputeReason, validateResolutionMemo, validateRevisionNote, validateIncidentDescription, validateNotice, validateNoticeFields,
  throttleAction, _resetThrottle,
} from '../src/eum/validate.js';

test('sanitizeText: 제어문자 제거·trim, 개행은 multiline만 보존', () => {
  assert.equal(sanitizeText('  안녕\u0000하세요\u001B  '), '안녕하세요');
  assert.equal(sanitizeText('줄1\r\n줄2', { multiline: true }), '줄1\n줄2');
  assert.equal(sanitizeText('줄1\n줄2'), '줄1 줄2'); // 단일행 필드는 개행 → 공백
  assert.equal(sanitizeText(null), '');
  assert.equal(sanitizeText(12345), '12345');
});

test('validateText: 빈 값·길이 상한 — 표준 결과 포맷', () => {
  const empty = validateText('   ', { label: '메모' });
  assert.equal(empty.ok, false);
  assert.match(empty.message, /입력해주세요/);

  const long = validateText('가'.repeat(11), { label: '메모', max: 10 });
  assert.equal(long.ok, false);
  assert.match(long.message, /10자 이내/);
  assert.ok(!long.message.includes('가'.repeat(11)), '실패 메시지에 입력값을 되돌리지 않는다');

  const ok = validateText('  정상 입력  ');
  assert.deepEqual(ok, { ok: true, value: '정상 입력' });
});

test('validateDisputeReason / validateResolutionMemo: 상한 500자', () => {
  assert.equal(validateDisputeReason('금액이 다릅니다').ok, true);
  assert.equal(validateDisputeReason('가'.repeat(LIMITS.disputeReason + 1)).ok, false);
  assert.equal(validateResolutionMemo('').ok, false);
  assert.equal(validateResolutionMemo('확인 후 재정산 처리').ok, true);
});

test('validateNotice: 제목 80자·본문 2000자, 둘 다 유효해야 ok', () => {
  const bad = validateNotice('', '본문');
  assert.equal(bad.ok, false);
  const badBody = validateNotice('제목', '가'.repeat(LIMITS.noticeBody + 1));
  assert.equal(badBody.ok, false);
  const ok = validateNotice(' 8월 일정 안내 ', '줄1\n줄2');
  assert.deepEqual(ok.value, { title: '8월 일정 안내', body: '줄1\n줄2' });
});

test('throttleAction: 같은 key 연타 차단, 다른 key·시간 경과 후 허용', () => {
  _resetThrottle();
  assert.equal(throttleAction('a', 1000).ok, true);
  assert.equal(throttleAction('a', 1000).ok, false); // 연타 차단
  assert.equal(throttleAction('b', 1000).ok, true);  // 다른 key는 독립
  _resetThrottle();
  assert.equal(throttleAction('a', 1000).ok, true);  // 초기화 후 허용
});

test('validateNoticeFields: 실패 시 어느 칸(title|body)인지 함께 반환', () => {
  const noTitle = validateNoticeFields('  ', '본문');
  assert.equal(noTitle.ok, false);
  assert.equal(noTitle.field, 'title');
  const longBody = validateNoticeFields('제목', '가'.repeat(LIMITS.noticeBody + 1));
  assert.equal(longBody.ok, false);
  assert.equal(longBody.field, 'body');
  const ok = validateNoticeFields(' 8월 안내 ', '줄1\n줄2');
  assert.equal(ok.ok, true);
  assert.equal(ok.value.title, '8월 안내');
  assert.equal(ok.value.body, '줄1\n줄2');
});

test('validateRevisionNote: 빈 값 거부·상한은 처리 메모와 동일·제어문자 제거', () => {
  const empty = validateRevisionNote('   ');
  assert.equal(empty.ok, false);
  assert.ok(empty.message.length > 0);
  assert.equal(validateRevisionNote('가'.repeat(LIMITS.resolutionMemo)).ok, true);
  assert.equal(validateRevisionNote('가'.repeat(LIMITS.resolutionMemo + 1)).ok, false);
  const ok = validateRevisionNote('  시간을\u0000 다시 확인해 주세요.\n감사합니다.  ');
  assert.equal(ok.ok, true);
  assert.equal(ok.value, '시간을 다시 확인해 주세요.\n감사합니다.');
});

test('validateIncidentDescription: 빈 값 거부·500자 상한·제어문자 제거', () => {
  const empty = validateIncidentDescription('  ');
  assert.equal(empty.ok, false);
  assert.ok(empty.message.length > 0);
  assert.equal(LIMITS.incidentDescription, 500);
  assert.equal(validateIncidentDescription('가'.repeat(LIMITS.incidentDescription)).ok, true);
  assert.equal(validateIncidentDescription('가'.repeat(LIMITS.incidentDescription + 1)).ok, false);
  const ok = validateIncidentDescription('  어지럼증을\u0000 호소하셨습니다.\n휴식 후 귀가.  ');
  assert.equal(ok.ok, true);
  assert.equal(ok.value, '어지럼증을 호소하셨습니다.\n휴식 후 귀가.');
});
