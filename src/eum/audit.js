// ============================================================================
// audit.js — 접근·감사 로그 (런치 공통 P0) · additive (2026-08-13)
//   목적: "누가·언제·무엇을" 했는지 세션 내에서 기록하고 코디네이터가 조회한다.
//   상태: 로컬(메모리) 기록만 — 서버 영구 보관·원격 전송은 [승인 필요] 트랙.
//         (telemetry.js와 동일한 build-now-activate-on-approval 원칙)
//   개인정보 원칙: 자유 텍스트(이의 사유·공지 본문·처리 메모)는 저장하지 않는다.
//   기록 대상은 식별자·상태값·제목·건수 수준의 기술 메타로 한정한다.
// ============================================================================

// 링버퍼 상한 — 초과 시 오래된 항목부터 버린다.
export const AUDIT_CAP = 300;

// 감사 대상 액션과 표시 어휘 — 리듀서 액션 타입과 1:1. 여기 없는 타입은 기록하지 않는다.
// (MARK_NOTICE_READ·CHECK_IN 등 고빈도 저위험 액션은 소음 방지를 위해 제외)
export const AUDIT_RULES = {
  LOGIN: { label: '로그인', category: 'access' },
  LOGOUT: { label: '로그아웃', category: 'access' },
  RAISE_SETTLEMENT_DISPUTE: { label: '정산 이의 신청', category: 'settlement' },
  RESOLVE_SETTLEMENT_DISPUTE: { label: '정산 이의 처리', category: 'settlement' },
  ADD_SETTLEMENT: { label: '정산 생성', category: 'settlement' },
  SEND_NOTICE: { label: '공지 발송', category: 'notice' },
  RESEND_UNDELIVERED: { label: '공지 미전달 재발송', category: 'notice' },
  ADD_INCIDENT: { label: '안전 이슈 등록', category: 'safety' },
  RESOLVE_INCIDENT: { label: '안전 이슈 처리', category: 'safety' },
  APPROVE_LOG: { label: '활동기록 승인', category: 'activity' },
  REJECT_LOG: { label: '활동기록 보완 요청', category: 'activity' },
  UPDATE_APPLICATION: { label: '신청서 상태 변경', category: 'data' },
  UPDATE_PARTICIPANT: { label: '참여자 정보 수정', category: 'data' },
  UPDATE_VERIFICATION: { label: '검증 상태 변경', category: 'data' },
  ADD_MATCH: { label: '매칭 생성', category: 'matching' },
  UPDATE_MATCH: { label: '매칭 변경', category: 'matching' },
  RESET_DATA: { label: '데모 데이터 초기화', category: 'data' },
};

export const AUDIT_CATEGORY_LABEL = {
  access: '접근', settlement: '정산', notice: '공지', safety: '안전',
  matching: '매칭', activity: '활동', data: '데이터',
};

const ring = [];
let seq = 0;

// 행위자 식별 — LOGIN은 payload에서, 그 외에는 현재 세션 사용자에서 얻는다.
function actorOf(action, state) {
  if (action.type === 'LOGIN') {
    return { id: (action.payload && action.payload.userId) || null, role: (action.payload && action.payload.role) || null };
  }
  return { id: (state && state.currentUserId) || null, role: (state && state.currentRole) || null };
}

// 대상 요약 — 자유 텍스트(사유·본문·메모)는 절대 포함하지 않는다.
function targetOf(action) {
  const p = action.payload || {};
  switch (action.type) {
    case 'LOGIN':
    case 'LOGOUT': return '';
    case 'RAISE_SETTLEMENT_DISPUTE': return `정산 ${p.id}`;
    case 'RESOLVE_SETTLEMENT_DISPUTE': return `정산 ${p.id} · ${p.result === 'accepted' ? '승인' : '반려'}`;
    case 'ADD_SETTLEMENT': return `정산 ${p.id || ''}`.trim();
    case 'SEND_NOTICE': return `공지 「${p.title || ''}」 · 수신 ${(p.delivery || []).length}명`;
    case 'RESEND_UNDELIVERED': return `공지 ${p.id} · 재발송 ${Object.keys(p.results || {}).length}명`;
    case 'ADD_INCIDENT': return `이슈 ${p.id || ''} ${p.type ? `· ${p.type}` : ''}`.trim();
    case 'RESOLVE_INCIDENT': return `이슈 ${p.id} 처리`;
    case 'APPROVE_LOG': return `활동기록 ${p.id} 승인`;
    // 보완 요청 사유(자유 텍스트)는 기록하지 않는다 — 식별자·상태값만.
    case 'REJECT_LOG': return `활동기록 ${p.id} 보완 요청`;
    case 'UPDATE_APPLICATION': return `신청서 ${p.id}${p.status ? ` · ${p.status}` : ''}`;
    case 'UPDATE_PARTICIPANT': return `참여자 ${p.id}`;
    case 'UPDATE_VERIFICATION': return `신청서 ${p.application_id} · ${p.step || ''} → ${p.status || ''}`;
    case 'ADD_MATCH': return `매칭 ${p.id || ''}`.trim();
    case 'UPDATE_MATCH': return `매칭 ${p.id}${p.status ? ` · ${p.status}` : ''}`;
    case 'RESET_DATA': return 'SEED 초기화';
    default: return '';
  }
}

/** 액션 → 감사 항목. 감사 대상이 아니면 null. 순수 함수(기록하지 않음). */
export function buildAuditEntry(action, state, now = new Date()) {
  const rule = action && AUDIT_RULES[action.type];
  if (!rule) return null;
  const actor = actorOf(action, state);
  return {
    id: `aud_${++seq}`,
    ts: now.toISOString(),
    actor_id: actor.id,
    actor_role: actor.role,
    type: action.type,
    label: rule.label,
    category: rule.category,
    target: targetOf(action),
  };
}

/** 항목을 링버퍼에 기록. null 은 무시. */
export function recordAudit(entry) {
  if (!entry) return null;
  ring.push(entry);
  if (ring.length > AUDIT_CAP) ring.splice(0, ring.length - AUDIT_CAP);
  return entry;
}

/** dispatch 훅 진입점 — 액션이 감사 대상이면 기록하고 항목을 반환. */
export function auditFromAction(action, state) {
  return recordAudit(buildAuditEntry(action, state));
}

/** 최신순 스냅샷(얕은 복사). */
export function getAuditLog() {
  return ring.slice().reverse();
}

/** 링버퍼 비우기(테스트·수동 초기화용). */
export function clearAuditLog() {
  ring.length = 0;
  seq = 0;
}

/** 분류별 건수 집계(순수). */
export function auditCounts(list = getAuditLog()) {
  return list.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {});
}

/** CSV 직렬화(순수) — 리포트 CSV와 동일하게 클라이언트 Blob 다운로드에 쓴다. */
export function auditToCsv(list = getAuditLog()) {
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['시각', '행위자', '역할', '행위', '분류', '대상'];
  const rows = list.map((e) => [e.ts, e.actor_id || '-', e.actor_role || '-', e.label, AUDIT_CATEGORY_LABEL[e.category] || e.category, e.target]);
  return [head, ...rows].map((r) => r.map(esc).join(',')).join('\n');
}
