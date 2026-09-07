// 2R §7-8 — 상태 전이 enum 이 schema.sql 의 check 제약과 일치하고,
// 허용되지 않는 전이를 거부하며, 화면 라벨이 enum 에서만 나오는지.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MATCH_REQUEST_STATUS, ACTIVITY_STATUS, TRANSITIONS, FLOW, LEGACY_ALIAS,
  normalizeStatus, statusValues, statusMeta, canTransition, nextStatuses,
  applyTransition, flowStep,
} from '../src/eum/status.js';

const SCHEMA = readFileSync(new URL('../packages/db/schema.sql', import.meta.url), 'utf-8');

/** schema.sql 에서 `status ... check (status in ('a','b'))` 의 값 목록을 뽑는다 */
function schemaEnum(tableName) {
  const tbl = SCHEMA.split(/create table if not exists /i).find((c) => c.startsWith(tableName));
  assert.ok(tbl, `${tableName} 테이블을 schema.sql 에서 찾지 못했습니다`);
  const m = tbl.match(/status[^\n]*check \(status in \(([^)]+)\)\)/i);
  assert.ok(m, `${tableName}.status check 제약을 찾지 못했습니다`);
  return m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, ''));
}

test('§7-8 activities.status enum 이 schema.sql 과 정확히 같다', () => {
  assert.deepEqual(statusValues('activity'), schemaEnum('activities'));
});

test('§7-8 match_requests.status enum 이 schema.sql 과 정확히 같다', () => {
  assert.deepEqual(statusValues('match_request'), schemaEnum('match_requests'));
});

test('§7-8 모든 enum 값에 화면 라벨이 있다 (화면과 DB 일치)', () => {
  for (const [k, v] of Object.entries(ACTIVITY_STATUS)) {
    assert.ok(v.label && v.label.length > 0, `${k} 라벨 누락`);
    assert.ok(v.tone && v.desc, `${k} 표기 메타 누락`);
  }
  for (const [k, v] of Object.entries(MATCH_REQUEST_STATUS)) {
    assert.ok(v.label && v.label.length > 0, `${k} 라벨 누락`);
  }
});

test('§7-8 전이표는 enum 안에서만 정의된다', () => {
  for (const [domain, table] of Object.entries(TRANSITIONS)) {
    const valid = statusValues(domain);
    for (const [from, tos] of Object.entries(table)) {
      assert.ok(valid.includes(from), `${domain}.${from} 은 enum 밖`);
      for (const to of tos) assert.ok(valid.includes(to), `${domain}.${from}→${to} 은 enum 밖`);
      assert.equal(tos.includes(from), false, `${domain}.${from} 자기 자신 전이 금지`);
    }
    // 모든 enum 값이 전이표에 등장해야 한다(누락 상태 없음)
    for (const v of valid) assert.ok(Object.hasOwn(table, v), `${domain}.${v} 전이 정의 누락`);
  }
});

test('§7-8 신청→확정→활동→완료가 허용되고 역행은 막힌다', () => {
  assert.equal(canTransition('match_request', 'open', 'matched'), true);
  assert.equal(canTransition('match_request', 'matched', 'open'), false);
  assert.equal(canTransition('activity', 'planned', 'done'), true);
  assert.equal(canTransition('activity', 'done', 'planned'), false);
  assert.equal(canTransition('activity', 'planned', 'nonsense'), false);
});

test('기존 화면 표기(scheduled/completed/active)는 enum 으로 정규화된다', () => {
  assert.equal(normalizeStatus('activity', 'scheduled'), 'planned');
  assert.equal(normalizeStatus('activity', 'completed'), 'done');
  assert.equal(normalizeStatus('activity', 'cancelled'), 'missed');
  assert.equal(normalizeStatus('match_request', 'active'), 'matched');
  assert.equal(normalizeStatus('activity', 'planned'), 'planned');
  assert.equal(normalizeStatus('activity', '없는값'), null);
  assert.equal(normalizeStatus('없는도메인', 'planned'), null);
  // 별칭은 반드시 실제 enum 값을 가리켜야 한다
  for (const [domain, map] of Object.entries(LEGACY_ALIAS)) {
    for (const [, target] of Object.entries(map)) {
      assert.ok(statusValues(domain).includes(target), `${domain} 별칭 대상 ${target} 이 enum 밖`);
    }
  }
});

test('statusMeta 는 모르는 값에도 던지지 않는다(§7-5 흰 화면 0건)', () => {
  const ok = statusMeta('activity', 'completed');
  assert.equal(ok.value, 'done');
  assert.equal(ok.label, '완료');
  assert.equal(ok.known, true);
  const bad = statusMeta('activity', 'zzz');
  assert.equal(bad.known, false);
  assert.equal(bad.tone, 'mute');
  assert.equal(bad.label, 'zzz');
  assert.doesNotThrow(() => statusMeta('activity', undefined));
});

test('applyTransition 은 감사 before/after 를 남기고 실패 시 사유를 준다', () => {
  const ok = applyTransition('activity', 'scheduled', 'done', { id: 'act001', at: '2027-05-09T00:00:00Z' });
  assert.equal(ok.ok, true);
  assert.equal(ok.status, 'done');
  assert.equal(ok.audit.target_table, 'activities');
  assert.deepEqual(ok.audit.before_json, { status: 'planned' });
  assert.deepEqual(ok.audit.after_json, { status: 'done' });
  assert.equal(ok.audit.target_id, 'act001');

  const bad = applyTransition('activity', 'done', 'planned');
  assert.equal(bad.ok, false);
  assert.ok(bad.error.includes('허용되지 않습니다'));
  assert.ok(bad.error.includes('예정') === false || bad.error.length > 0);

  assert.equal(applyTransition('activity', 'done', 'done').ok, false);
  assert.equal(applyTransition('activity', 'zzz', 'done').ok, false);
});

test('nextStatuses 로 버튼을 만들 수 있다', () => {
  const next = nextStatuses('activity', 'planned');
  assert.deepEqual(next.map((n) => n.value), ['done', 'missed', 'flagged']);
  assert.ok(next.every((n) => n.label));
  assert.deepEqual(nextStatuses('activity', 'zzz'), []);
});

test('§10 시연 흐름 5단계가 정의되어 있다', () => {
  assert.equal(FLOW.length, 5);
  assert.deepEqual(FLOW.map((f) => f.label), ['신청', '추천', '확정', '활동', '완료']);
  assert.equal(flowStep('activity', 'completed'), 4);
  assert.equal(flowStep('activity', 'zzz'), -1);
});
