// ============================================================================
// 매칭 엔진 어댑터 — 2R 가이드 §5 규칙 기반 추천을 화면에 연결한다.
//
// packages/matching/index.js 가 「엔진」이다(순수 함수, DB·React 무관, Postgres 함수로 1:1 이식 가능).
// 이 파일은 어댑터다: 앱 상태(state.participants 등) → 엔진 입력 스키마로 변환하고,
// 엔진 출력(score_json·reason_text·감사 메타)을 화면이 쓰기 좋은 형태로 되돌려준다.
//
// 기존 matching.js(aiTrioScore·aiAutoTrios 3인 조합)는 그대로 둔다. 이 어댑터는
// §5 명세인 「어르신 ↔ 참여자 1:1 추천」을 담당하며 두 화면이 공존한다.
//
// AI 표현 주의(§8): 학습하는 모델이 아니다. 가중 점수 + 하드 필터 + 규칙 문장 생성이다.
// 가중치는 운영 데이터를 보고 담당자가 조정한다.
// ============================================================================
import {
  rankCandidates,
  DEFAULT_WEIGHTS,
  WEIGHTS_VERSION,
  COMPLEMENT_RULES,
} from '../../packages/matching/index.js';

export { DEFAULT_WEIGHTS, WEIGHTS_VERSION, COMPLEMENT_RULES };

export const FACTOR_LABEL = Object.freeze({
  proximity: '근접도',
  schedule: '일정',
  interest: '관심',
  safety: '안전·검증',
  complement: '세대·역량 보완',
});

export const FACTOR_DESC = Object.freeze({
  proximity: '같은 행정동 1.0 · 인접동 0.6 · 같은 구 0.2',
  schedule: '겹치는 시간대 ÷ 어르신 희망 시간대',
  interest: '참여자가 제공 가능한 도움 ∩ 어르신 필요 ÷ 어르신 필요',
  safety: '검증완료+신고0 → 1.0 · 미검증 → 후보 제외(하드 필터)',
  complement: '역량↔필요 보완 규칙 매칭',
});

/** 광산구 인접 행정동 (설정값 — 운영 중 조정 가능) */
export const DONG_ADJACENCY = Object.freeze({
  우산동: ['첨단동', '월곡동', '신가동', '운남동'],
  첨단동: ['우산동', '신가동'],
  월곡동: ['우산동', '운남동'],
  신가동: ['우산동', '첨단동', '운남동'],
  운남동: ['우산동', '월곡동', '신가동'],
  등촌동: [],
});

/** 주소 문자열에서 '○○동' 추출 */
export function dongOf(address) {
  const m = String(address || '').match(/([가-힣]{1,4}동)/);
  return m ? m[1] : '';
}

/** 주소에서 '○○구' 추출 (같은 구 0.2 판정용) */
export function guOf(address) {
  const m = String(address || '').match(/([가-힣]{1,5}구)/);
  return m ? m[1] : '';
}

/**
 * 참여자 역량·관심 → 「제공 가능한 도움 항목」으로 환산.
 * 어르신 needs 어휘(§5 COMPLEMENT_RULES)와 같은 축에 놓아야 s_interest 가 의미를 갖는다.
 */
export function offeredNeeds(participant) {
  const pool = [...(participant.skills || []), ...(participant.interests || [])];
  const out = [];
  for (const rule of COMPLEMENT_RULES) {
    if (rule.skills.some((s) => pool.includes(s))) out.push(rule.need);
  }
  return out;
}

/** 참여자의 검증 완료 시각 (verifications 조회 결과 — 하드코딩 아님) */
function verifiedAtOf(state, participantId) {
  const v = (state.verifications || []).find(
    (x) => x.participant_id === participantId && x.status === 'passed',
  );
  return v ? v.verified_at : null;
}

/** 참여자 관련 안전 신고 집계 */
function reportsOf(state, participantId) {
  const rows = (state.safety_incidents || []).filter((x) => {
    if (x.reported_by === participantId) return false; // 신고자는 대상이 아니다
    const m = (state.matches || []).find((mm) => mm.id === x.match_id);
    if (!m) return false;
    return m.youth_id === participantId || m.senior_id === participantId || m.child_id === participantId;
  });
  return {
    count: rows.length,
    severe: rows.some((r) => r.severity === 'high' || r.severity === 'severe'),
  };
}

/** 승인된 활동기록 수 = 이전 활동 완료 수 (동점 시 우선순위) */
function completedOf(state, participantId) {
  return (state.activity_logs || []).filter(
    (l) => l.participant_id === participantId && l.approved,
  ).length;
}

/** 앱 참여자 레코드 → 엔진 참여자 스키마 */
export function toEngineParticipant(state, p) {
  const dong = dongOf(p.address);
  const gu = guOf(p.address);
  const rep = reportsOf(state, p.id);
  return {
    user_id: p.id,
    dongs: [dong, gu].filter(Boolean),
    time_slots: p.availability || [],
    interests: offeredNeeds(p),
    skills: p.skills || [],
    verified_at: verifiedAtOf(state, p.id),
    report_count: rep.count,
    has_severe_report: rep.severe,
    completed_activities: completedOf(state, p.id),
  };
}

/** 앱 어르신 레코드 → 엔진 어르신 스키마 */
export function toEngineSenior(state, s) {
  return {
    user_id: s.id,
    dong: dongOf(s.address),
    needs: s.needs || [],
    preferred_slots: s.availability || [],
  };
}

/**
 * 어르신 1명에 대한 추천 후보 산출.
 * 반환: 엔진 결과 + 화면용 participant 원본 + 요소별 라벨.
 * 후보 풀은 청년(youth)만 — 어르신·아동은 도움 제공자가 아니다.
 */
export function recommendForSenior(state, seniorId, opts = {}) {
  const parts = state.participants || [];
  const senior = parts.find((p) => p.id === seniorId);
  if (!senior) return { ok: false, error: '어르신을 찾을 수 없습니다', candidates: [], excluded: [] };

  const pool = parts.filter((p) => p.type === 'youth');
  const engineSenior = toEngineSenior(state, senior);
  const enginePool = pool.map((p) => toEngineParticipant(state, p));

  // 하드 필터로 빠진 사람을 화면에 사유와 함께 보여준다(§7-5 빈 상태 설명)
  const excluded = enginePool
    .filter((ep) => !ep.verified_at)
    .map((ep) => {
      const src = pool.find((p) => p.id === ep.user_id);
      return { participant: src, reason: '안전 검증 미완료 — 하드 필터로 제외(§5)' };
    });

  const ranked = rankCandidates(engineSenior, enginePool, {
    weights: opts.weights,
    adjacency: opts.adjacency || DONG_ADJACENCY,
    topN: opts.topN ?? 3,
    now: opts.now,
  });

  const candidates = ranked.map((c) => ({
    ...c,
    participant: pool.find((p) => p.id === c.participant_id) || null,
    factors: Object.entries(c.score_json).map(([k, v]) => ({
      key: k,
      label: FACTOR_LABEL[k],
      desc: FACTOR_DESC[k],
      score: v,
      weight: (c.weights_used || DEFAULT_WEIGHTS)[k],
      contribution: Math.round(v * (c.weights_used || DEFAULT_WEIGHTS)[k] * 1000) / 1000,
    })),
  }));

  return {
    ok: true,
    senior,
    engineSenior,
    candidates,
    excluded,
    poolSize: pool.length,
    evaluated: enginePool.length - excluded.length,
    weights: { ...DEFAULT_WEIGHTS, ...(opts.weights || {}) },
    weights_version: WEIGHTS_VERSION,
  };
}

/** 가중치 정규화 — 합이 1이 되도록. 관리자 조정 UI에서 사용 */
export function normalizeWeights(w) {
  const keys = Object.keys(DEFAULT_WEIGHTS);
  const sum = keys.reduce((a, k) => a + (Number(w[k]) || 0), 0);
  if (sum <= 0) return { ...DEFAULT_WEIGHTS };
  const out = {};
  for (const k of keys) out[k] = Math.round(((Number(w[k]) || 0) / sum) * 1000) / 1000;
  return out;
}

/** 감사 로그에 남길 후보 생성 스냅샷 (§5 「감사」) */
export function auditSnapshot(result) {
  if (!result || !result.ok) return null;
  return {
    senior_id: result.senior.id,
    weights_version: result.weights_version,
    weights_used: result.weights,
    pool_size: result.poolSize,
    evaluated: result.evaluated,
    excluded_count: result.excluded.length,
    candidates: result.candidates.map((c) => ({
      participant_id: c.participant_id,
      rank: c.rank,
      score_total: c.score_total,
      score_json: c.score_json,
      reason_text: c.reason_text,
    })),
    generated_at: result.candidates[0] ? result.candidates[0].generated_at : new Date().toISOString(),
  };
}
