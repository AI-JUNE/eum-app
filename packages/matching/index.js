/**
 * 이음 매칭 엔진 — 2R 가이드 §5 명세 구현 (설명 가능한 규칙 기반 추천)
 *
 * score_total = Σ w_i × s_i
 *   w 기본값: 근접도 .30 / 일정 .25 / 관심 .20 / 안전 .15 / 보완 .10
 *
 * 순수 함수. DB·프레임워크 의존 없음. Postgres 함수/Edge Function으로 1:1 이식 가능.
 * "딥러닝이냐" → "설명 가능한 규칙 기반이고 가중치는 운영 데이터로 조정한다."
 */

export const WEIGHTS_VERSION = 'v1.0-2R';
export const DEFAULT_WEIGHTS = Object.freeze({
  proximity: 0.30, schedule: 0.25, interest: 0.20, safety: 0.15, complement: 0.10,
});

/** 세대·역량 보완 규칙 — 참여자 역량 ↔ 어르신 필요 */
export const COMPLEMENT_RULES = Object.freeze([
  { need: '스마트폰 도움', skills: ['디지털코칭', '스마트폰', 'IT'] },
  { need: '말벗', skills: ['대화', '경청', '상담'] },
  { need: '장보기', skills: ['장보기', '이동지원', '운전'] },
  { need: '산책', skills: ['산책', '운동', '건강'] },
  { need: '병원 동행', skills: ['병원동행', '이동지원', '간호'] },
  { need: '집안일', skills: ['가사', '정리', '청소'] },
]);

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const uniq = (a) => [...new Set((a || []).filter(Boolean))];
const intersect = (a, b) => uniq(a).filter((x) => uniq(b).includes(x));

/** 근접도: 1.0 같은 행정동 | 0.6 인접동 | 0.2 같은 구 | 0 */
export function scoreProximity(participant, senior, adjacency = {}) {
  const pd = participant.dongs || [];
  const sd = senior.dong;
  if (!sd) return 0;
  if (pd.includes(sd)) return 1.0;
  const adj = adjacency[sd] || [];
  if (pd.some((d) => adj.includes(d))) return 0.6;
  const gu = (d) => (d || '').split(' ')[0];
  if (pd.some((d) => gu(d) && gu(d) === gu(sd))) return 0.2;
  return 0;
}

/** 일정: |참여자 슬롯 ∩ 어르신 희망 슬롯| / |어르신 희망 슬롯| */
export function scoreSchedule(participant, senior) {
  const want = uniq(senior.preferred_slots);
  if (want.length === 0) return 0;
  return clamp01(intersect(participant.time_slots, want).length / want.length);
}

/** 관심: |참여자 관심 ∩ 어르신 needs| / |어르신 needs| */
export function scoreInterest(participant, senior) {
  const needs = uniq(senior.needs);
  if (needs.length === 0) return 0;
  return clamp01(intersect(participant.interests, needs).length / needs.length);
}

/** 안전: 1.0 검증완료+신고0 | 0.5 검증완료+경미 | 0 미검증(하드 필터) */
export function scoreSafety(participant) {
  if (!participant.verified_at) return 0;
  const reports = participant.report_count || 0;
  const severe = !!participant.has_severe_report;
  if (severe) return 0;
  return reports === 0 ? 1.0 : 0.5;
}

/** 보완: 1.0 규칙 매칭 | 0.5 부분 | 0 */
export function scoreComplement(participant, senior) {
  const needs = uniq(senior.needs);
  const skills = uniq([...(participant.skills || []), ...(participant.interests || [])]);
  if (needs.length === 0) return 0;
  let matched = 0;
  for (const rule of COMPLEMENT_RULES) {
    if (needs.includes(rule.need) && rule.skills.some((s) => skills.includes(s))) matched += 1;
  }
  if (matched === 0) return 0;
  return matched >= needs.length ? 1.0 : 0.5;
}

const FACTOR_LABEL = { proximity: '근접도', schedule: '일정', interest: '관심', safety: '안전', complement: '보완' };

/** 추천 사유: 상위 2개 요소만, 점수 0.5 이상만 문장화 */
export function buildReason(scores, participant, senior) {
  const ranked = Object.entries(scores)
    .filter(([k, v]) => k !== 'safety' && v >= 0.5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const parts = ranked.map(([k, v]) => {
    switch (k) {
      case 'proximity':
        return v >= 1 ? `${senior.dong} 같은 동네에 살고(근접도)` : v >= 0.6 ? `인접한 동네에 살고(근접도)` : `같은 구에 살고(근접도)`;
      case 'schedule': {
        const ov = intersect(participant.time_slots, senior.preferred_slots);
        return `${ov.slice(0, 2).join('·')} 시간이 겹칩니다(일정)`;
      }
      case 'interest': {
        const ov = intersect(participant.interests, senior.needs);
        return `'${ov.slice(0, 2).join(', ')}' 관심이 맞습니다(관심)`;
      }
      case 'complement':
        return `필요한 도움을 줄 수 있는 역량이 있습니다(보완)`;
      default:
        return `${FACTOR_LABEL[k]} 적합`;
    }
  });
  const done = participant.completed_activities || 0;
  const history = done > 0 ? ` 이전 활동 ${done}회 모두 정상 완료.` : '';
  if (parts.length === 0) return `기본 조건을 충족합니다.${history}`;
  return `${parts.join(', ')}.${history}`;
}

/**
 * 후보 산출. 상위 topN(기본 3). 동점이면 이전 활동 완료 수 우선.
 * 반환 각 항목에 score_json(요소별)·reason_text·감사 메타 포함 → match_candidates 로 그대로 저장.
 */
export function rankCandidates(senior, participants, opts = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...(opts.weights || {}) };
  const adjacency = opts.adjacency || {};
  const topN = opts.topN ?? 3;
  const now = opts.now || new Date().toISOString();

  const scored = [];
  for (const p of participants) {
    const safety = scoreSafety(p);
    if (safety === 0) continue; // 하드 필터
    const s = {
      proximity: scoreProximity(p, senior, adjacency),
      schedule: scoreSchedule(p, senior),
      interest: scoreInterest(p, senior),
      safety,
      complement: scoreComplement(p, senior),
    };
    const total = Object.keys(weights).reduce((acc, k) => acc + weights[k] * (s[k] || 0), 0);
    scored.push({
      participant_id: p.user_id,
      score_total: Math.round(total * 1000) / 1000,
      score_json: s,
      reason_text: buildReason(s, p, senior),
      _done: p.completed_activities || 0,
    });
  }
  scored.sort((a, b) => b.score_total - a.score_total || b._done - a._done);
  return scored.slice(0, topN).map((c, i) => ({
    ...c,
    rank: i + 1,
    generated_at: now,
    weights_version: WEIGHTS_VERSION,
    weights_used: weights,
    input_snapshot: { senior_id: senior.user_id, needs: senior.needs, preferred_slots: senior.preferred_slots, dong: senior.dong },
    _done: undefined,
  }));
}
