// 백업·복구(backup.js) 테스트 — 스냅샷 무결성, 변조 차단, 복원 정합, 리허설 절차.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKUP_FORMAT, BACKUP_VERSION, BACKUP_TABLES,
  stableStringify, checksumOf, countTables,
  createSnapshot, serializeSnapshot, parseSnapshot, snapshotFilename,
  verifySnapshot, restoreState, redactSnapshot,
  runRestoreRehearsal, rehearsalSummary,
} from '../src/eum/backup.js';
import { SEED_DATA } from '../src/eum/seed.js';
import { normalizeState } from '../src/eum/storage.js';

const NOW = '2026-09-05T09:30:00.000Z';

test('stableStringify 는 키 순서가 달라도 같은 문자열을 만든다', () => {
  assert.equal(stableStringify({ a: 1, b: 2 }), stableStringify({ b: 2, a: 1 }));
  assert.equal(stableStringify([{ y: 1, x: 2 }]), '[{"x":2,"y":1}]');
  assert.equal(stableStringify(undefined), 'null');
});

test('checksumOf 는 16자리 hex 이고 한 글자만 바뀌어도 달라진다', () => {
  const a = checksumOf({ participants: [{ id: 'p1', name: '홍길동' }] });
  const b = checksumOf({ participants: [{ id: 'p1', name: '홍길순' }] });
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.notEqual(a, b);
  assert.equal(a, checksumOf({ participants: [{ name: '홍길동', id: 'p1' }] })); // 키 순서 무관
});

test('createSnapshot 은 필수 컬렉션을 빠짐없이 담고 체크섬·건수를 기록한다', () => {
  const snap = createSnapshot(SEED_DATA, { now: NOW, source: 'test' });
  assert.equal(snap.format, BACKUP_FORMAT);
  assert.equal(snap.version, BACKUP_VERSION);
  assert.equal(snap.created_at, NOW);
  assert.equal(snap.redacted, false);
  BACKUP_TABLES.forEach((t) => assert.ok(Array.isArray(snap.tables[t]), t + ' 누락'));
  assert.deepEqual(snap.counts, countTables(snap.tables));
  assert.equal(snap.checksum, checksumOf(snap.tables));
  assert.ok(snap.counts.participants > 0, '시드 참여자가 담겨야 한다');
});

test('상태에 없는 필수 컬렉션은 빈 배열로 채워 복원 가능한 형태를 유지한다', () => {
  const snap = createSnapshot({ participants: [{ id: 'p1' }] }, { now: NOW });
  BACKUP_TABLES.forEach((t) => assert.ok(Array.isArray(snap.tables[t])));
  assert.equal(snap.counts.surveys, 0);
  assert.equal(verifySnapshot(snap).ok, true);
});

test('직렬화 → 파싱 왕복이 무손실이다', () => {
  const snap = createSnapshot(SEED_DATA, { now: NOW });
  const back = parseSnapshot(serializeSnapshot(snap));
  assert.deepEqual(back, snap);
  assert.equal(parseSnapshot('{깨진 json'), null);
});

test('snapshotFilename 은 생성시각 기반이고 마스킹본은 표시된다', () => {
  const snap = createSnapshot(SEED_DATA, { now: NOW });
  assert.equal(snapshotFilename(snap), 'eum-backup-20260905-0930.json');
  assert.equal(snapshotFilename(redactSnapshot(snap)), 'eum-backup-20260905-0930-redacted.json');
});

test('verifySnapshot 은 형식·필수 컬렉션·건수·체크섬을 각각 잡아낸다', () => {
  assert.equal(verifySnapshot(null).ok, false);
  assert.equal(verifySnapshot({ format: 'other' }).ok, false);

  const snap = createSnapshot(SEED_DATA, { now: NOW });
  assert.equal(verifySnapshot(snap).ok, true);

  const upper = { ...snap, version: BACKUP_VERSION + 1 };
  assert.match(verifySnapshot(upper).errors.join(), /상위 버전/);

  const missing = JSON.parse(serializeSnapshot(snap));
  delete missing.tables.matches;
  assert.match(verifySnapshot(missing).errors.join(), /필수 컬렉션 누락: matches/);

  const badCount = JSON.parse(serializeSnapshot(snap));
  badCount.counts.participants = badCount.counts.participants + 1;
  assert.match(verifySnapshot(badCount).errors.join(), /건수 불일치/);
});

test('내용이 변조되면 체크섬으로 차단된다', () => {
  const snap = createSnapshot(SEED_DATA, { now: NOW });
  const tampered = JSON.parse(serializeSnapshot(snap));
  tampered.tables.participants[0] = { ...tampered.tables.participants[0], status: '__tampered__' };
  const r = verifySnapshot(tampered);
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /체크섬 불일치/);
});

test('마스킹본은 복원에 쓸 수 없다', () => {
  const red = redactSnapshot(createSnapshot(SEED_DATA, { now: NOW }));
  assert.equal(verifySnapshot(red).ok, false);
  assert.equal(restoreState(red).ok, false);
});

test('redactSnapshot 은 개인정보를 가리되 구조·건수는 유지한다', () => {
  const snap = createSnapshot(SEED_DATA, { now: NOW });
  const red = redactSnapshot(snap);
  assert.equal(red.redacted, true);
  assert.deepEqual(red.counts, snap.counts);
  const before = snap.tables.participants.find((p) => p.phone);
  const after = red.tables.participants.find((p) => p.id === before.id);
  assert.notEqual(after.phone, before.phone);
  assert.match(after.phone, /\*/);
  assert.notEqual(after.name, before.name);
  assert.equal(after.id, before.id); // 식별자·관계는 보존
  assert.equal(after.type, before.type);
});

test('restoreState 는 검증 실패 시 표준 에러를 돌려주고 상태를 만들지 않는다', () => {
  const r = restoreState({ format: 'nope' });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'VALIDATION_ERROR');
  assert.equal(r.state, undefined);
});

test('restoreState 는 base 를 보존하고 normalize 를 적용한다', () => {
  const snap = createSnapshot(SEED_DATA, { now: NOW });
  const r = restoreState(snap, { base: { currentRole: 'coordinator', notices: [] }, normalize: normalizeState });
  assert.equal(r.ok, true);
  assert.equal(r.state.currentRole, 'coordinator'); // 세션값 유지
  assert.equal(r.state.participants.length, SEED_DATA.participants.length);
  assert.ok(r.state.activities.every((a) => typeof a.date === 'string')); // normalize 통과
  assert.equal(r.created_at, NOW);
});

test('복구 리허설이 전 단계 통과하고 원본과 건수가 일치한다', () => {
  const rec = runRestoreRehearsal(SEED_DATA, { now: NOW, normalize: normalizeState });
  assert.equal(rec.ok, true, JSON.stringify(rec.mismatches));
  assert.deepEqual(rec.mismatches, []);
  const names = rec.steps.map((s) => s.step);
  ['스냅샷 생성', '파일 직렬화', '파일 파싱', '무결성 검증', '복원', '원본 대조', '정규화 적용', '변조 감지'].forEach((s) => {
    assert.ok(names.includes(s), s + ' 단계 누락');
  });
  assert.ok(rec.steps.every((s) => s.ok), '실패 단계 존재');
  BACKUP_TABLES.forEach((t) => {
    assert.equal(rec.counts[t], (SEED_DATA[t] || []).length, t + ' 건수 불일치');
  });
});

test('rehearsalSummary 는 RUNBOOK 에 남길 한 줄을 만든다', () => {
  const rec = runRestoreRehearsal(SEED_DATA, { now: NOW, normalize: normalizeState });
  const line = rehearsalSummary(rec);
  assert.match(line, /^\[PASS\] 2026-09-05T09:30:00/);
  assert.match(line, /레코드 \d+건/);
  assert.match(line, new RegExp(rec.checksum));
});
