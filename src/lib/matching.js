// 매칭 적합도 엔진 — 온디바이스 규칙기반 가중 스코어 (순수 함수, 외부 의존 없음)
// ============================================================================
// 4.5 매칭 적합도 엔진 (온디바이스 · 규칙기반 가중 스코어 · 외부 API 미사용)
//   5개 요인을 0~1로 정규화 후 가중합 → 0~100 적합도.
//   요인: 근접도(거리)·시간적합·관심/역량 시너지·안전검증·세대보완
// ============================================================================
const MATCH_WEIGHTS = { proximity: 24, schedule: 20, synergy: 30, safety: 16, complement: 10 };
const MATCH_FACTOR_LABELS = {
  proximity: '근접도', schedule: '시간 적합', synergy: '관심·역량 시너지', safety: '안전·검증', complement: '세대 보완',
};
const SYNERGY_THESAURUS = {
  '책': ['독서지도', '학습멘토', '글쓰기', '동화구연', '이야기', '한자'],
  '그림': ['예술교육', '사진', '디자인'],
  '공룡': ['역사이야기', '이야기', '동화구연'],
  '노래': ['동화구연', '이야기'],
  '로봇': ['코딩교육', '수학교육', '디지털코칭'],
  '레고': ['수학교육', '코딩교육', '예술교육'],
  '축구': ['건강관리', '돌봄', '응급처치'],
  '강아지': ['돌봄', '건강관리'],
};
function dongOf(addr) {
  const m = String(addr || '').match(/([가-힣]{1,4}동)/);
  return m ? m[1] : '';
}
function overlapList(a, b) {
  const B = new Set(b || []);
  return [...new Set((a || []).filter((x) => B.has(x)))];
}
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

export function computeTrioScore(youth, senior, child) {
  const parts = {};
  const tags = [];
  if (!youth || !senior || !child) {
    return { total: 0, parts: [], tags: [] };
  }
  const dY = dongOf(youth.address), dS = dongOf(senior.address), dC = dongOf(child.address);
  if (dY && dY === dS && dS === dC) { parts.proximity = 1; tags.push({ key: 'proximity', icon: 'map', text: `같은 ${dY} · 도보 생활권` }); }
  else if (dS === dC && dS) { parts.proximity = 0.78; tags.push({ key: 'proximity', icon: 'map', text: `어르신·아이 같은 ${dS}` }); }
  else if (String(youth.address).includes('광산구') && String(senior.address).includes('광산구')) { parts.proximity = 0.5; tags.push({ key: 'proximity', icon: 'map', text: '광산구 내 이동 거리' }); }
  else { parts.proximity = 0.3; }

  const ov = overlapList(youth.availability, senior.availability);
  if (ov.length >= 2) { parts.schedule = 1; }
  else if (ov.length === 1) { parts.schedule = 0.72; }
  else { parts.schedule = 0.34; }
  if (ov.length) tags.push({ key: 'schedule', icon: 'clock', text: `활동 시간대 일치: ${ov.join(', ')}` });

  const peer = overlapList(youth.interests, senior.interests);
  const cInts = child.interests || [];
  const mentorPool = [...(youth.skills || []), ...(senior.skills || []), ...(senior.interests || [])];
  const synergyMatches = [];
  cInts.forEach((ci) => {
    const fillers = SYNERGY_THESAURUS[ci] || [];
    const hit = mentorPool.find((sk) => fillers.includes(sk) || sk === ci);
    if (hit) synergyMatches.push({ interest: ci, skill: hit });
  });
  let synergyRaw = synergyMatches.length * 0.34 + peer.length * 0.18;
  parts.synergy = clamp01(0.2 + synergyRaw);
  synergyMatches.slice(0, 2).forEach((m) => tags.push({ key: 'synergy', icon: 'heart', text: `${m.skill} → 아이의 '${m.interest}' 관심` }));
  if (peer.length) tags.push({ key: 'synergy', icon: 'heart', text: `청년·어르신 공통 관심 ${peer.slice(0, 2).join('·')}` });

  const statusScore = (p) => (p.status === 'active' ? 1 : p.status === 'pending_match' ? 0.8 : p.status === 'verifying' ? 0.5 : 0.4);
  parts.safety = clamp01((statusScore(youth) + statusScore(senior) + 1) / 3);
  if (youth.status === 'active' && senior.status === 'active') tags.push({ key: 'safety', icon: 'shield', text: '세 사람 모두 4단계 안전검증 완료' });
  else tags.push({ key: 'safety', icon: 'shield', text: '안전검증 진행 중 — 활성화 전 완료 필요' });

  let comp = 0;
  const occS = senior.occupation || '';
  if (/교사|교직/.test(occS) && cInts.includes('책')) { comp += 0.5; tags.push({ key: 'complement', icon: 'star', text: '前 교사 어르신 ↔ 책 좋아하는 아이' }); }
  if (/식당|요리|봉제/.test(occS)) { comp += 0.3; }
  if (/개발|디자이너|회계|간호/.test(youth.occupation || '')) comp += 0.3;
  parts.complement = clamp01(0.25 + comp);

  let total = 0, wsum = 0;
  Object.keys(MATCH_WEIGHTS).forEach((k) => { total += (parts[k] || 0) * MATCH_WEIGHTS[k]; wsum += MATCH_WEIGHTS[k]; });
  total = Math.round(clamp01(total / wsum) * 100);
  const partsArr = Object.keys(MATCH_WEIGHTS).map((k) => ({
    key: k, label: MATCH_FACTOR_LABELS[k], weight: MATCH_WEIGHTS[k], score: Math.round((parts[k] || 0) * 100),
  }));
  const seen = new Set();
  const uniqTags = tags.filter((t) => { const id = t.text; if (seen.has(id)) return false; seen.add(id); return true; });
  return { total, parts: partsArr, tags: uniqTags };
}

export function recommendTrios(youths, seniors, children, max = 3) {
  const combos = [];
  (youths || []).forEach((y) => (seniors || []).forEach((s) => (children || []).forEach((c) => {
    const sc = computeTrioScore(y, s, c);
    combos.push({ youth_id: y.id, senior_id: s.id, child_id: c.id, score: sc.total, parts: sc.parts, tags: sc.tags });
  })));
  combos.sort((a, b) => b.score - a.score);
  const usedY = new Set(), usedS = new Set(), usedC = new Set();
  const picked = [];
  for (const cb of combos) {
    if (picked.length >= max) break;
    if (usedY.has(cb.youth_id) || usedS.has(cb.senior_id) || usedC.has(cb.child_id)) continue;
    usedY.add(cb.youth_id); usedS.add(cb.senior_id); usedC.add(cb.child_id);
    picked.push(cb);
  }
  return picked;
}
