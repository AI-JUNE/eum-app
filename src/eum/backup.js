// ============================================================================
// 백업·복구 — 애플리케이션 상태 스냅샷 생성 / 검증 / 복원 (순수 로직, additive)
//
// 목적
//   1) 운영 중 데이터를 "언제든 되돌릴 수 있는 형태"로 내보낸다(스냅샷).
//   2) 받은 스냅샷이 손상·변조되지 않았는지 **체크섬·건수**로 검증한 뒤에만 복원한다.
//   3) 복구 리허설(runRestoreRehearsal)을 코드로 수행해 절차가 실제로 동작함을 남긴다.
//
// 설계 원칙
//   - 순수 함수. React·DOM·네트워크에 의존하지 않는다(테스트·CI에서 그대로 실행).
//   - 기존 SEED_DATA·리듀서·storage.js 동작은 건드리지 않는다(읽기만 한다).
//   - 원격 백업 저장소 전송·자동 스케줄은 **[승인 필요]**. 이 모듈은 로컬 산출물만 만든다.
//   - 스냅샷 원본에는 개인정보가 포함된다 → 반출·공유본은 redactSnapshot 을 거친다.
// ============================================================================

export const BACKUP_FORMAT = 'eum.backup';
export const BACKUP_VERSION = 1;

// 상태 스냅샷 대상 컬렉션(= storage.loadState 가 읽는 테이블 집합과 동일)
export const BACKUP_TABLES = Object.freeze([
  'participants', 'applications', 'verifications', 'matches',
  'activities', 'activity_logs', 'settlements', 'safety_incidents', 'surveys',
]);

// 없어도 복원은 가능한(선택) 컬렉션
export const OPTIONAL_TABLES = Object.freeze(['notices', 'consents']);

// 개인정보가 들어 있어 반출 시 마스킹이 필요한 필드
export const SENSITIVE_FIELDS = Object.freeze([
  'phone', 'address', 'emergency_contact', 'email', 'rrn', 'birth', 'account', 'account_no',
]);

// --- 결정적 직렬화 ------------------------------------------------------------
// 키 순서가 달라도 같은 체크섬이 나오도록 정렬 직렬화한다.
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value === undefined ? null : value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

// FNV-1a 32bit ×2(오프셋 다른 시드) → 16자리 hex. 외부 의존성 없이 충돌 확률을 낮춘다.
export function checksumOf(value) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 ^= c; h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + c) >>> 0; h2 = Math.imul(h2 ^ (h2 >>> 13), 0x85ebca6b) >>> 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

export function countTables(tables) {
  const out = {};
  Object.keys(tables || {}).forEach((k) => { out[k] = Array.isArray(tables[k]) ? tables[k].length : 0; });
  return out;
}

// --- 스냅샷 생성 --------------------------------------------------------------
export function createSnapshot(state, meta = {}) {
  const src = state || {};
  const tables = {};
  [...BACKUP_TABLES, ...OPTIONAL_TABLES].forEach((t) => {
    if (Array.isArray(src[t])) tables[t] = src[t];
    else if (BACKUP_TABLES.includes(t)) tables[t] = [];
  });
  const counts = countTables(tables);
  const snapshot = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    created_at: meta.now || new Date().toISOString(),
    source: meta.source || 'local',
    app_version: meta.appVersion || 'dev',
    redacted: false,
    counts,
    tables,
  };
  snapshot.checksum = checksumOf(tables);
  return snapshot;
}

export function serializeSnapshot(snapshot) { return JSON.stringify(snapshot, null, 2); }

export function parseSnapshot(text) {
  try { return JSON.parse(String(text)); }
  catch { return null; }
}

// 파일명: eum-backup-YYYYMMDD-HHMM(-redacted).json
export function snapshotFilename(snapshot) {
  const iso = String(snapshot?.created_at || new Date().toISOString());
  const stamp = iso.slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  return 'eum-backup-' + stamp + (snapshot?.redacted ? '-redacted' : '') + '.json';
}

// --- 검증 --------------------------------------------------------------------
export function verifySnapshot(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, errors: ['스냅샷이 비어 있거나 형식이 아닙니다'] };
  if (snapshot.format !== BACKUP_FORMAT) errors.push('백업 파일 형식이 아닙니다');
  if (typeof snapshot.version !== 'number') errors.push('버전 정보가 없습니다');
  else if (snapshot.version > BACKUP_VERSION) errors.push('상위 버전 백업입니다(앱을 먼저 업데이트하세요)');
  const tables = snapshot.tables;
  if (!tables || typeof tables !== 'object') errors.push('테이블이 없습니다');
  else {
    BACKUP_TABLES.forEach((t) => { if (!Array.isArray(tables[t])) errors.push('필수 컬렉션 누락: ' + t); });
    const counts = countTables(tables);
    if (snapshot.counts) {
      Object.keys(snapshot.counts).forEach((k) => {
        if (counts[k] !== snapshot.counts[k]) errors.push('건수 불일치: ' + k + ' (기록 ' + snapshot.counts[k] + ' / 실제 ' + counts[k] + ')');
      });
    }
    if (snapshot.checksum && checksumOf(tables) !== snapshot.checksum) errors.push('체크섬 불일치 — 파일이 손상되었거나 변조되었습니다');
  }
  if (snapshot.redacted) errors.push('마스킹본(redacted)은 복원에 사용할 수 없습니다');
  return { ok: errors.length === 0, errors };
}

// --- 복원 --------------------------------------------------------------------
// 검증 실패 시 절대 상태를 바꾸지 않는다. 결과는 표준 모양 { ok, state|error }.
export function restoreState(snapshot, opts = {}) {
  const check = verifySnapshot(snapshot);
  if (!check.ok) return { ok: false, error: { code: 'VALIDATION_ERROR', message: check.errors[0], details: check.errors } };
  const base = opts.base && typeof opts.base === 'object' ? opts.base : {};
  let next = { ...base, ...snapshot.tables };
  if (typeof opts.normalize === 'function') next = opts.normalize(next);
  return { ok: true, state: next, restored: countTables(snapshot.tables), created_at: snapshot.created_at };
}

// --- 반출용 마스킹 ------------------------------------------------------------
function maskValue(v) {
  const s = String(v == null ? '' : v);
  if (!s) return s;
  if (s.length <= 2) return '**';
  return s.slice(0, 2) + '*'.repeat(Math.min(8, Math.max(2, s.length - 2)));
}

export function redactSnapshot(snapshot) {
  if (!snapshot || !snapshot.tables) return snapshot;
  const tables = {};
  Object.keys(snapshot.tables).forEach((t) => {
    tables[t] = (snapshot.tables[t] || []).map((row) => {
      if (!row || typeof row !== 'object') return row;
      const copy = { ...row };
      SENSITIVE_FIELDS.forEach((f) => { if (copy[f] != null && copy[f] !== '') copy[f] = maskValue(copy[f]); });
      if (copy.name) copy.name = maskValue(copy.name);
      return copy;
    });
  });
  return { ...snapshot, tables, counts: countTables(tables), checksum: checksumOf(tables), redacted: true };
}

// --- 복구 리허설 --------------------------------------------------------------
// 스냅샷 → 직렬화 → 파싱 → 검증 → 복원 → 원본 대조까지 실제로 수행하고 결과를 남긴다.
// RUNBOOK 의 "복구 리허설" 절차를 코드로 재현한 것이라, 이 결과가 곧 리허설 기록이다.
export function runRestoreRehearsal(state, opts = {}) {
  const now = opts.now || new Date().toISOString();
  const steps = [];
  const fail = (step, detail) => { steps.push({ step, ok: false, detail }); return { ok: false, checked_at: now, steps, mismatches: [detail] }; };

  const snapshot = createSnapshot(state, { now, source: opts.source || 'rehearsal' });
  steps.push({ step: '스냅샷 생성', ok: true, detail: BACKUP_TABLES.length + '개 필수 컬렉션' });

  const text = serializeSnapshot(snapshot);
  steps.push({ step: '파일 직렬화', ok: true, detail: text.length + 'bytes' });

  const parsed = parseSnapshot(text);
  if (!parsed) return fail('파일 파싱', 'JSON 파싱 실패');
  steps.push({ step: '파일 파싱', ok: true, detail: 'OK' });

  const check = verifySnapshot(parsed);
  if (!check.ok) return fail('무결성 검증', check.errors.join('; '));
  steps.push({ step: '무결성 검증', ok: true, detail: '체크섬 ' + parsed.checksum });

  // 대조는 정규화 이전(원본 그대로)의 복원 결과로 한다.
  // normalizeState 는 표시용 파생 레코드를 합성하므로 건수 대조 기준으로 쓰면 안 된다.
  const restored = restoreState(parsed);
  if (!restored.ok) return fail('복원', restored.error.message);
  steps.push({ step: '복원', ok: true, detail: '완료' });

  const mismatches = [];
  BACKUP_TABLES.forEach((t) => {
    const before = Array.isArray(state?.[t]) ? state[t] : [];
    const after = Array.isArray(restored.state?.[t]) ? restored.state[t] : [];
    if (before.length !== after.length) mismatches.push(t + ': ' + before.length + ' → ' + after.length);
    else if (stableStringify(before) !== stableStringify(after)) mismatches.push(t + ': 내용 불일치');
  });
  steps.push({ step: '원본 대조', ok: mismatches.length === 0, detail: mismatches.length ? mismatches.join(', ') : '전 컬렉션 원본 일치' });

  // 화면이 쓰는 정규화 단계까지 실제로 통과하는지 확인한다(파생 레코드 건수는 대조 대상 아님).
  if (typeof opts.normalize === 'function') {
    try {
      const view = opts.normalize({ ...restored.state });
      const okView = BACKUP_TABLES.every((t) => Array.isArray(view?.[t]));
      steps.push({ step: '정규화 적용', ok: okView, detail: okView ? '화면 상태 구성 가능' : '정규화 결과 형식 오류' });
      if (!okView) mismatches.push('정규화 실패');
    } catch (e) {
      steps.push({ step: '정규화 적용', ok: false, detail: String(e && e.message || e) });
      mismatches.push('정규화 예외');
    }
  }

  // 변조 감지도 함께 확인한다(체크섬이 실제로 작동하는지).
  const tampered = JSON.parse(text);
  if (Array.isArray(tampered.tables.participants) && tampered.tables.participants.length) {
    tampered.tables.participants[0] = { ...tampered.tables.participants[0], name: '변조' };
    const detected = !verifySnapshot(tampered).ok;
    steps.push({ step: '변조 감지', ok: detected, detail: detected ? '체크섬으로 차단됨' : '감지 실패' });
    if (!detected) mismatches.push('변조 감지 실패');
  }

  return {
    ok: mismatches.length === 0,
    checked_at: now,
    checksum: parsed.checksum,
    counts: restored.restored,
    steps,
    mismatches,
  };
}

// 리허설 결과를 RUNBOOK 에 붙여넣을 수 있는 한 줄 요약으로 만든다.
export function rehearsalSummary(record) {
  if (!record) return '';
  const total = Object.values(record.counts || {}).reduce((a, b) => a + b, 0);
  return '[' + (record.ok ? 'PASS' : 'FAIL') + '] ' + String(record.checked_at).slice(0, 19)
    + ' · 레코드 ' + total + '건 · 체크섬 ' + (record.checksum || '-')
    + (record.mismatches && record.mismatches.length ? ' · 불일치: ' + record.mismatches.join(', ') : '');
}

export default {
  BACKUP_FORMAT, BACKUP_VERSION, BACKUP_TABLES, OPTIONAL_TABLES,
  createSnapshot, serializeSnapshot, parseSnapshot, snapshotFilename,
  verifySnapshot, restoreState, redactSnapshot, checksumOf, stableStringify,
  countTables, runRestoreRehearsal, rehearsalSummary,
};
