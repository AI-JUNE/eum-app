// 감사 로그(audit.js) 테스트 — 접근·운영 행위가 정확히, 그리고 "자유 텍스트 없이"
// 기록되는지 검증한다. 순수 모듈이라 DOM 없이 검증 가능.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIT_CAP, AUDIT_RULES, buildAuditEntry, recordAudit, auditFromAction,
  getAuditLog, clearAuditLog, auditCounts, auditToCsv,
  AUDIT_VIEWS, AUDIT_CATEGORY_LABEL, VIEW_DEDUPE_MS, VIEW_ACCESS_TYPE,
  buildViewAccessEntry, recordViewAccess,
} from '../src/eum/audit.js';

const COORD_STATE = { currentUserId: 'c1', currentRole: 'coordinator' };

test('감사 대상이 아닌 액션은 null — 기록되지 않는다', () => {
  clearAuditLog();
  assert.equal(buildAuditEntry({ type: 'MARK_NOTICE_READ', payload: { id: 'n1' } }, COORD_STATE), null);
  assert.equal(auditFromAction({ type: 'CHECK_IN', payload: { id: 'a1' } }, COORD_STATE), null);
  assert.equal(getAuditLog().length, 0);
});

test('LOGIN 은 payload 에서, 그 외에는 세션 사용자에서 행위자를 얻는다', () => {
  clearAuditLog();
  const login = auditFromAction({ type: 'LOGIN', payload: { userId: 'p9', role: 'youth' } }, {});
  assert.equal(login.actor_id, 'p9');
  assert.equal(login.actor_role, 'youth');
  const send = auditFromAction({ type: 'SEND_NOTICE', payload: { id: 'n1', title: '일정 안내', delivery: [{}, {}, {}] } }, COORD_STATE);
  assert.equal(send.actor_id, 'c1');
  assert.equal(send.actor_role, 'coordinator');
  assert.ok(send.target.includes('일정 안내'));
  assert.ok(send.target.includes('3명'));
});

test('자유 텍스트(이의 사유·처리 메모)는 항목 어디에도 남지 않는다', () => {
  clearAuditLog();
  const raise_ = auditFromAction(
    { type: 'RAISE_SETTLEMENT_DISPUTE', payload: { id: 's1', reason: '민감한사유텍스트', raised_by: 'p1' } },
    { currentUserId: 'p1', currentRole: 'youth' },
  );
  const resolve = auditFromAction(
    { type: 'RESOLVE_SETTLEMENT_DISPUTE', payload: { id: 's1', result: 'accepted', resolution: '민감한처리메모' } },
    COORD_STATE,
  );
  assert.ok(!JSON.stringify(raise_).includes('민감한사유텍스트'));
  assert.ok(!JSON.stringify(resolve).includes('민감한처리메모'));
  assert.ok(resolve.target.includes('승인'));
});

test('최신순 반환 + 링버퍼 상한(AUDIT_CAP) 준수', () => {
  clearAuditLog();
  for (let i = 0; i < AUDIT_CAP + 20; i += 1) {
    recordAudit(buildAuditEntry({ type: 'LOGOUT' }, COORD_STATE));
  }
  const log = getAuditLog();
  assert.equal(log.length, AUDIT_CAP);
  // 최신순 — 첫 항목의 seq 가 마지막 항목보다 크다.
  const seqOf = (e) => Number(e.id.split('_')[1]);
  assert.ok(seqOf(log[0]) > seqOf(log[log.length - 1]));
});

test('auditCounts — 분류별 건수 집계', () => {
  clearAuditLog();
  auditFromAction({ type: 'LOGIN', payload: { userId: 'c1', role: 'coordinator' } }, {});
  auditFromAction({ type: 'SEND_NOTICE', payload: { id: 'n1', title: 'A', delivery: [] } }, COORD_STATE);
  auditFromAction({ type: 'RESEND_UNDELIVERED', payload: { id: 'n1', results: { p1: 'delivered' } } }, COORD_STATE);
  const counts = auditCounts();
  assert.equal(counts.access, 1);
  assert.equal(counts.notice, 2);
});

test('auditToCsv — 헤더 + 쉼표·따옴표 이스케이프', () => {
  clearAuditLog();
  auditFromAction({ type: 'SEND_NOTICE', payload: { id: 'n1', title: 'A, "B"', delivery: [{}] } }, COORD_STATE);
  const csv = auditToCsv();
  const lines = csv.split('\n');
  assert.equal(lines[0], '시각,행위자,역할,행위,분류,대상');
  assert.equal(lines.length, 2);
  // 쉼표·따옴표가 든 대상 필드는 따옴표로 감싸고 내부 따옴표는 이중화된다.
  assert.ok(lines[1].includes('"'));
  assert.ok(lines[1].includes('""B""'));
});

test('모든 AUDIT_RULES 항목은 라벨·분류를 갖는다', () => {
  for (const [type, rule] of Object.entries(AUDIT_RULES)) {
    assert.ok(rule.label && rule.category, type);
  }
});

test('REJECT_LOG: 감사 대상이며 보완 요청 사유(자유 텍스트)는 기록하지 않는다', () => {
  const e = buildAuditEntry({ type: 'REJECT_LOG', payload: { id: 'log011', note: '시간이 일정과 다릅니다', requested_by: '코디 한가은' } }, COORD_STATE);
  assert.ok(e);
  assert.equal(e.category, 'activity');
  assert.ok(e.target.includes('log011'));
  assert.ok(!e.target.includes('시간이 일정과 다릅니다'));
  assert.ok(!JSON.stringify(e).includes('시간이 일정과 다릅니다'));
});

// --- 관리 기능 접근(열람) 이력 ---------------------------------------------

test('감사 대상 화면 열람은 view 분류로 기록된다', () => {
  clearAuditLog();
  const e = recordViewAccess('settlements', COORD_STATE);
  assert.ok(e);
  assert.equal(e.type, VIEW_ACCESS_TYPE);
  assert.equal(e.category, 'view');
  assert.equal(e.actor_id, 'c1');
  assert.equal(e.actor_role, 'coordinator');
  assert.equal(e.target, AUDIT_VIEWS.settlements);
  assert.equal(getAuditLog().length, 1);
  assert.ok(AUDIT_CATEGORY_LABEL.view);
});

test('저위험 화면(대시보드·로드맵)과 미로그인 렌더는 기록하지 않는다', () => {
  clearAuditLog();
  assert.equal(recordViewAccess('overview', COORD_STATE), null);
  assert.equal(recordViewAccess('roadmap', COORD_STATE), null);
  assert.equal(buildViewAccessEntry('safety', {}), null);
  assert.equal(buildViewAccessEntry('safety', null), null);
  assert.equal(getAuditLog().length, 0);
});

test('같은 화면 재방문은 중복 억제 창 안에서 건너뛰고, 창 밖이면 다시 남는다', () => {
  clearAuditLog();
  const t0 = new Date('2026-09-03T10:00:00.000Z');
  assert.ok(recordViewAccess('applicants', COORD_STATE, t0));
  // 창 안 재방문 — 건너뜀
  assert.equal(recordViewAccess('applicants', COORD_STATE, new Date(t0.getTime() + 1000)), null);
  // 다른 화면은 즉시 기록
  assert.ok(recordViewAccess('safety', COORD_STATE, new Date(t0.getTime() + 2000)));
  // 창 밖 재방문 — 다시 기록
  assert.ok(recordViewAccess('applicants', COORD_STATE, new Date(t0.getTime() + VIEW_DEDUPE_MS + 1)));
  assert.equal(getAuditLog().filter((x) => x.view === 'applicants').length, 2);
});

test('행위자가 다르면 같은 화면이라도 각각 기록된다', () => {
  clearAuditLog();
  const t0 = new Date('2026-09-03T10:00:00.000Z');
  assert.ok(recordViewAccess('reports', COORD_STATE, t0));
  assert.ok(recordViewAccess('reports', { currentUserId: 'c2', currentRole: 'coordinator' }, new Date(t0.getTime() + 500)));
  assert.equal(getAuditLog().length, 2);
});

test('열람 기록에는 조회 조건·검색어 같은 자유 텍스트가 없다', () => {
  clearAuditLog();
  const e = recordViewAccess('applicants', { ...COORD_STATE, search: '홍길동', filter: '주민번호' });
  assert.ok(!JSON.stringify(e).includes('홍길동'));
  assert.ok(!JSON.stringify(e).includes('주민번호'));
});

test('열람 기록은 집계·CSV 에 함께 반영된다', () => {
  clearAuditLog();
  recordViewAccess('settlements', COORD_STATE);
  auditFromAction({ type: 'LOGIN', payload: { userId: 'c1', role: 'coordinator' } }, {});
  const counts = auditCounts();
  assert.equal(counts.view, 1);
  assert.equal(counts.access, 1);
  const csv = auditToCsv();
  assert.equal(csv.split('\n').length, 3);
  assert.ok(csv.includes(AUDIT_CATEGORY_LABEL.view));
});

test('모든 AUDIT_VIEWS 항목은 비어있지 않은 라벨을 갖는다', () => {
  for (const [view, label] of Object.entries(AUDIT_VIEWS)) {
    assert.ok(typeof label === 'string' && label.length > 0, view);
  }
});
