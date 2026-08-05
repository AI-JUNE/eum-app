// ============================================================================
// 스토리지 — EumApp 단일파일에서 분리 (1단계 · 로직 100% 동일)
// Supabase REST 읽기(익명키) → 실패 시 localStorage → 실패 시 시드 폴백
// 상태 정규화(normalizeState)는 순수 함수.
//
// ⚠️ 보안 점검 필요(사람 승인 필요): dbList 는 Supabase anon key 로 전 테이블을
//    select=* 한다. participants 에는 전화번호·주소·비상연락처(개인정보)가 있으므로
//    Supabase 프로젝트에서 RLS 활성화 + 익명 select 정책 제한이 필수다.
//    (콘솔 설정은 되돌리기 어려운 보안 변경이라 코드에서 수행하지 않음 → 다음 회차 점검 항목)
// ============================================================================

import { authHeaders } from './auth.js';

// --- Supabase 인라인 연결 (외부 패키지·파일 불필요, REST fetch) ---
const SUPA_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || '';
const SUPA_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || '';

export const HAS_SUPABASE = !!(SUPA_URL && SUPA_KEY);

export async function dbList(table) {
  // 인증 활성화(AUTH_ENABLED=true) 시 사용자 토큰으로 호출 → RLS 정책 적용.
  // 플래그 OFF(기본)면 authHeaders 가 기존과 동일한 anon 헤더를 반환한다(동작 불변).
  const res = await fetch(SUPA_URL + '/rest/v1/' + table + '?select=*', {
    headers: authHeaders(SUPA_KEY),
  });
  if (!res.ok) throw new Error('Supabase ' + table + ' ' + res.status);
  return await res.json();
}

export const STORAGE_KEY = 'eum:appdata:v1';

// 시드/스키마 불일치 보정: 활동 date/time, 로그 date, 자녀 guardian_id 채우기
export function normalizeState(s) {
  if (!s) return s;
  const activities = (s.activities || []).map(a => ({
    ...a,
    date: a.date || (a.scheduled_at || '').slice(0, 10),
    time: a.time || (a.scheduled_at || '').slice(11, 16),
  }));
  const actById = {};
  activities.forEach(a => { actById[a.id] = a; });
  const activity_logs = (s.activity_logs || []).map(l => ({
    ...l,
    date: l.date || l.approved_at || (actById[l.activity_id]?.scheduled_at || '').slice(0, 10) || '',
    created_at: l.created_at || l.approved_at || (actById[l.activity_id]?.scheduled_at || '') || '',
  }));
  const participants = (s.participants || []).map(p =>
    p.type === 'child' ? { ...p, guardian_id: p.guardian_id || p.parent_id } : p
  );
  const settlements = (s.settlements || []).map(st => ({
    ...st,
    period: st.period || st.month,
    amount: (st.amount != null ? st.amount : st.amount_krw),
    hours: (st.hours != null ? st.hours : st.total_hours),
  }));
  // 신청자 관리 정합: 참여자별 application + 단계 검증(application_id 기반) 합성
  const PT = new Set(['parent', 'teen']);
  const stepsFor = (t) => PT.has(t) ? ['interview', 'guardian_consent', 'document'] : ['interview', 'criminal_record', 'abuse_record', 'reference'];
  const appStatusFor = (ps) => ps === 'active' ? 'completed' : (ps === 'pending' ? 'screening' : ps === 'rejected' ? 'rejected' : 'verified');
  const exApp = {}; (s.applications || []).forEach(a => { exApp[a.participant_id] = a; });
  const baseVerifs = (s.verifications || []).filter(v => !(v.id && String(v.id).startsWith('vf_')));
  const appKeyed = new Set(baseVerifs.filter(v => v.application_id).map(v => v.application_id));
  const synthApps = []; const stepVerifs = [];
  (participants || []).filter(p => p.type !== 'child').forEach(p => {
    const ex = exApp[p.id] || {};
    const appStatus = ex.status || appStatusFor(p.status);
    const appId = ex.id || ('app_' + p.id);
    const applied_at = ex.applied_at || ex.submitted_at || p.joined_at || p.created_at || '2027-04-01';
    synthApps.push({
      ...ex, id: appId, participant_id: p.id, type: p.type, status: appStatus, applied_at,
      consent_data: ex.consent_data !== undefined ? ex.consent_data : true,
      consent_photo: ex.consent_photo !== undefined ? ex.consent_photo : true,
      consent_criminal_check: !PT.has(p.type),
      consent_guardian: PT.has(p.type),
    });
    if (!appKeyed.has(appId)) {
      stepsFor(p.type).forEach((step, i) => {
        let st = 'passed';
        if (appStatus === 'screening') st = 'pending';
        else if (p.status === 'verifying') st = i === 0 ? 'passed' : (i === 1 ? 'in_progress' : 'pending');
        stepVerifs.push({ id: 'vf_' + appId + '_' + step, application_id: appId, step, status: st, verified_by: st === 'passed' ? '코디 한가은' : null, verified_at: st === 'passed' ? applied_at : null, note: st === 'passed' ? '확인 완료' : (st === 'in_progress' ? '진행 중' : '') });
      });
    }
  });
  const mergedVerifs = [...baseVerifs, ...stepVerifs];
  return { ...s, activities, activity_logs, participants, settlements, applications: synthApps, verifications: mergedVerifs, notices: s.notices || [] };
}

export async function loadState() {
  // Supabase 연결 시: 실 DB에서 전체 테이블을 읽어 상태 구성 (키 없으면 자동 폴백)
  if (HAS_SUPABASE) {
    try {
      const tables = ['participants', 'applications', 'verifications', 'matches', 'activities', 'activity_logs', 'settlements', 'safety_incidents', 'surveys'];
      const out = {}; let hasAny = false;
      for (const t of tables) { const rows = await dbList(t); out[t] = rows || []; if (rows && rows.length) hasAny = true; }
      if (hasAny) return out;
    } catch (e) { console.warn('Supabase load failed, falling back to local/seed', e); }
  }
  try {
    const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Schema validation: ensure all required collections exist
    const required = ['participants', 'applications', 'verifications', 'matches', 'activities', 'activity_logs', 'settlements', 'safety_incidents', 'surveys'];
    for (const k of required) {
      if (!Array.isArray(parsed[k])) return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveState(state) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return true;
  } catch (e) {
    console.warn('Storage save failed:', e);
    return false;
  }
}
