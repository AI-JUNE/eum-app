// ============================================================================
// 상태 전이 — 2R 가이드 §7-8 「신청→추천→확정→활동→완료 상태가 DB enum. 화면과 일치」
//
// packages/db/schema.sql 의 check 제약과 이 파일의 enum 이 1:1 이다.
// 화면은 여기서 라벨·색·다음 상태를 가져간다. 문자열을 화면에 직접 쓰지 않는다.
//
// 기존 화면이 쓰던 표기(scheduled/completed 등)는 삭제하지 않고 LEGACY_ALIAS 로
// DB enum 에 매핑한다 — 점진 이관용 어댑터다.
// ============================================================================

/** 흐름 전체 — 심사 시연 §10 의 한 줄 */
export const FLOW = Object.freeze([
  { key: 'request', label: '신청', domain: 'match_request', value: 'open' },
  { key: 'recommend', label: '추천', domain: 'match_request', value: 'open' },
  { key: 'confirm', label: '확정', domain: 'match_request', value: 'matched' },
  { key: 'activity', label: '활동', domain: 'activity', value: 'planned' },
  { key: 'complete', label: '완료', domain: 'activity', value: 'done' },
]);

/** §4 match_requests.status */
export const MATCH_REQUEST_STATUS = Object.freeze({
  open: { label: '매칭 대기', tone: 'info', desc: '후보 추천을 받을 수 있는 상태' },
  matched: { label: '확정', tone: 'good', desc: '담당자가 참여자를 확정함' },
  closed: { label: '종료', tone: 'mute', desc: '더 이상 매칭하지 않음' },
});

/** §4 activities.status */
export const ACTIVITY_STATUS = Object.freeze({
  planned: { label: '예정', tone: 'info', desc: '일정이 잡혀 아직 시작 전' },
  done: { label: '완료', tone: 'good', desc: '시작·종료가 기록됨' },
  missed: { label: '미이행', tone: 'warn', desc: '예정일이 지났는데 기록 없음' },
  flagged: { label: '확인 필요', tone: 'bad', desc: '안전·이상 징후로 담당자 확인 대상' },
});

/** §4 users.role */
export const USER_ROLE = Object.freeze({
  admin: { label: '관리자' },
  staff: { label: '담당자' },
  participant: { label: '참여자' },
  senior: { label: '어르신' },
  guardian: { label: '보호자' },
});

/** §4 matches.decision */
export const MATCH_DECISION = Object.freeze({
  ai_accept: { label: '추천 수용', desc: '추천 1순위를 그대로 확정' },
  manual_assign: { label: '수동 배정', desc: '담당자가 다른 후보를 선택 — 사유 필수' },
});

/** 허용 전이. 여기 없는 전이는 거부한다. */
export const TRANSITIONS = Object.freeze({
  match_request: Object.freeze({
    open: ['matched', 'closed'],
    matched: ['closed'],
    closed: [],
  }),
  activity: Object.freeze({
    planned: ['done', 'missed', 'flagged'],
    done: ['flagged'],
    missed: ['planned', 'flagged'],
    flagged: ['done', 'missed'],
  }),
});

export const DOMAIN_ENUM = Object.freeze({
  match_request: MATCH_REQUEST_STATUS,
  activity: ACTIVITY_STATUS,
});

/** 기존 화면 표기 → DB enum (점진 이관용. 원본 데이터는 건드리지 않는다) */
export const LEGACY_ALIAS = Object.freeze({
  activity: Object.freeze({
    scheduled: 'planned',
    in_progress: 'planned',
    upcoming: 'planned',
    completed: 'done',
    complete: 'done',
    cancelled: 'missed',
    canceled: 'missed',
    no_show: 'missed',
  }),
  match_request: Object.freeze({
    active: 'matched',
    pending: 'open',
    waiting: 'open',
    ended: 'closed',
    done: 'closed',
  }),
});

/** 임의 문자열을 해당 도메인의 DB enum 값으로 정규화. 모르면 null. */
export function normalizeStatus(domain, value) {
  const table = DOMAIN_ENUM[domain];
  if (!table) return null;
  const v = String(value || '').trim();
  if (Object.prototype.hasOwnProperty.call(table, v)) return v;
  const alias = (LEGACY_ALIAS[domain] || {})[v];
  return alias && Object.prototype.hasOwnProperty.call(table, alias) ? alias : null;
}

/** 도메인의 유효 enum 값 목록 (schema.sql check 제약과 동일 순서) */
export function statusValues(domain) {
  return Object.keys(DOMAIN_ENUM[domain] || {});
}

/** 화면 표기 — 라벨·설명·톤. 알 수 없는 값이면 원문을 그대로 보여주되 tone 은 mute. */
export function statusMeta(domain, value) {
  const norm = normalizeStatus(domain, value);
  if (!norm) return { value: String(value || ''), label: String(value || '—'), tone: 'mute', desc: '', known: false };
  return { value: norm, ...DOMAIN_ENUM[domain][norm], known: true };
}

/** 전이 가능 여부 */
export function canTransition(domain, from, to) {
  const f = normalizeStatus(domain, from);
  const t = normalizeStatus(domain, to);
  if (!f || !t) return false;
  return (TRANSITIONS[domain] || {})[f]?.includes(t) || false;
}

/** 다음으로 갈 수 있는 상태 목록 (버튼 생성용) */
export function nextStatuses(domain, from) {
  const f = normalizeStatus(domain, from);
  if (!f) return [];
  return ((TRANSITIONS[domain] || {})[f] || []).map((v) => ({ value: v, ...DOMAIN_ENUM[domain][v] }));
}

/**
 * 전이 실행. 성공하면 {ok:true, status, audit}, 실패하면 {ok:false, error}.
 * 던지지 않는다(§7-5 흰 화면 0건). 감사 로그에 넣을 before/after 를 함께 돌려준다.
 */
export function applyTransition(domain, from, to, meta = {}) {
  const f = normalizeStatus(domain, from);
  const t = normalizeStatus(domain, to);
  if (!f) return { ok: false, error: `알 수 없는 현재 상태입니다: ${from}` };
  if (!t) return { ok: false, error: `알 수 없는 대상 상태입니다: ${to}` };
  if (f === t) return { ok: false, error: '이미 같은 상태입니다' };
  if (!canTransition(domain, f, t)) {
    const allowed = nextStatuses(domain, f).map((x) => x.label).join(', ') || '없음';
    return { ok: false, error: `${DOMAIN_ENUM[domain][f].label} → ${DOMAIN_ENUM[domain][t].label} 은(는) 허용되지 않습니다. 가능: ${allowed}` };
  }
  return {
    ok: true,
    status: t,
    audit: {
      action: `${domain}.status_change`,
      target_table: domain === 'activity' ? 'activities' : 'match_requests',
      target_id: meta.id || null,
      before_json: { status: f },
      after_json: { status: t },
      at: meta.at || new Date().toISOString(),
    },
  };
}

/** 시연 흐름(§10)에서 현재 몇 번째 단계인지 — 진행 표시줄용 */
export function flowStep(domain, value) {
  const norm = normalizeStatus(domain, value);
  if (!norm) return -1;
  return FLOW.findIndex((f) => f.domain === domain && f.value === norm);
}
