// ============================================================================
// 공용 크롬(레이아웃·사이드바·알림·체크인) — EumApp.jsx 단일파일 분해 3단계 (2026-08-03)
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만). 상태·리듀서는 EumApp에 유지.
// ============================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Award, Bell, BellOff, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, Clock, FileText, GraduationCap, Heart, Home, LogOut, MapPin, Menu, PenLine, Search, Send, ShieldAlert, ShieldCheck, Sparkles, Star, TrendingUp, UserCheck, UserPlus, Users, Wallet } from 'lucide-react';
import { C, FONT_STACK, PERSONA, SERIF_STACK, SHADOW } from './theme.js';
import { TODAY, fmtRelativeDate, uid } from './utils.js';
import { Avatar } from './avatar.jsx';
import { Badge, Button, Card, EumLogo, Textarea, useBodyScrollLock, useFocusTrap, useIsMobile } from './ui.jsx';
import { unreadNoticeCount } from './notices.js';

// 참가자 신뢰 상태 계산 (시드 participant 검증 + 신청서 단계 검증 종합)
function trustStatus(state, participantId) {
  if (!state || !participantId) return 'none';
  const pv = (state.verifications || []).find(v => v.participant_id === participantId);
  if (pv) return pv.status === 'passed' ? 'verified' : 'pending';
  const app = (state.applications || []).find(a => a.participant_id === participantId);
  if (app) {
    const vs = (state.verifications || []).filter(v => v.application_id === app.id);
    if (vs.length && vs.every(v => v.status === 'passed')) return 'verified';
    if (vs.length) return 'pending';
  }
  return 'none';
}

// ── 상용 기능: 모바일 감지 · 검색 · 알림 · 체크인아웃 ────────────────────────


// 상태에서 역할별 알림 도출
function buildNotifications(state, role, user) {
  const out = [];
  if (role === 'coordinator') {
    const pendingApps = state.applications.filter(a => a.status === 'screening' || a.status === 'verified');
    if (pendingApps.length) out.push({ id: 'n-apps', icon: UserPlus, color: C.brand, title: `검토 대기 신청서 ${pendingApps.length}건`, desc: '서류 검토가 필요합니다', view: 'applicants' });
    const pendingLogs = state.activity_logs.filter(l => !l.approved);
    if (pendingLogs.length) out.push({ id: 'n-logs', icon: ClipboardCheck, color: C.sage, title: `승인 대기 활동기록 ${pendingLogs.length}건`, desc: '정산 전 승인이 필요합니다', view: 'activities' });
    const openInc = state.safety_incidents.filter(i => i.status === 'open' || i.status === 'in_progress');
    if (openInc.length) out.push({ id: 'n-inc', icon: ShieldAlert, color: C.red, title: `미처리 안전 이슈 ${openInc.length}건`, desc: '즉시 확인이 필요합니다', view: 'safety', urgent: true });
  } else if (user) {
    const myMatch = state.matches.find(m => [m.youth_id, m.senior_id, m.child_id].includes(user.id) && m.status === 'active')
      || state.matches.find(m => state.participants.some(c => c.parent_id === user.id && c.id === m.child_id) && m.status === 'active');
    if (myMatch) {
      const next = state.activities
        .filter(a => a.match_id === myMatch.id && a.status === 'scheduled' && (a.date || '') >= TODAY)
        .sort((x, y) => (x.scheduled_at || '').localeCompare(y.scheduled_at || ''))[0];
      if (next) out.push({ id: 'n-next', icon: Calendar, color: C.lavender, title: '다음 활동 일정', desc: `${fmtRelativeDate(next.scheduled_at)} ${(next.time || '')} · ${next.type || ''}`, view: 'schedule' });
    }
    const approved = state.activity_logs.filter(l => l.participant_id === user.id && l.approved).length;
    if (approved) out.push({ id: 'n-appr', icon: CheckCircle2, color: C.sage, title: `승인된 활동 ${approved}건`, desc: '정산에 반영되었습니다', view: 'settlement' });
    // 코디가 보낸 공지 중 아직 읽지 않은 건(additive) — 공지 수신함으로 이동
    const unreadNotices = unreadNoticeCount(state.notices, user.id);
    if (unreadNotices) out.push({ id: 'n-notice', icon: Bell, color: C.brand, title: `읽지 않은 공지 ${unreadNotices}건`, desc: '코디네이터가 보낸 안내입니다', view: 'notices' });
  }
  return out;
}

function NotificationBell({ state, role, user, onNavigate, dark }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => buildNotifications(state, role, user), [state, role, user]);
  const ref = useRef();
  const btnRef = useRef();
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  // Esc로 알림 목록을 닫고 포커스를 벨 버튼으로 되돌린다(키보드·스크린리더).
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); if (btnRef.current) btnRef.current.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const urgent = items.some(i => i.urgent);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button ref={btnRef} onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open} aria-label={items.length > 0 ? `알림, 읽지 않은 알림 ${items.length}건` : '알림, 새 알림 없음'} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : C.line}`, background: dark ? 'rgba(255,255,255,0.06)' : C.panel, color: dark ? '#fff' : C.inkSoft, cursor: 'pointer', transition: 'background .14s ease' }}
        onMouseEnter={(e) => { if (!dark) e.currentTarget.style.background = C.hover; }}
        onMouseLeave={(e) => { if (!dark) e.currentTarget.style.background = C.panel; }}>
        <Bell size={18} />
        {items.length > 0 && (
          <span aria-hidden="true" style={{ position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 9, background: urgent ? C.red : C.brand, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${dark ? '#1A1814' : C.panel}`, fontVariantNumeric: 'tabular-nums' }}>{items.length}</span>
        )}
      </button>
      {open && (
        <div role="region" aria-label="알림 목록" style={{ position: 'absolute', top: 46, right: 0, width: 330, maxWidth: '86vw', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: SHADOW.lg, zIndex: 200, overflow: 'hidden', animation: 'slideUp 0.18s ease', textAlign: 'left' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>알림 {items.length > 0 && <span style={{ color: C.muteLight, fontWeight: 600 }}>{items.length}</span>}</div>
          {items.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: C.mute }}>
              <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 13, background: C.lineSoft, border: `1px solid ${C.line}`, color: C.muteLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><BellOff size={20} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navMute }}>새로운 알림이 없습니다</div>
            </div>
          ) : items.map(it => {
            const Icon = it.icon;
            return (
              <button key={it.id} onClick={() => { setOpen(false); onNavigate && onNavigate(it.view); }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 16px', border: 'none', borderBottom: `1px solid ${C.lineSoft}`, background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT_STACK, transition: 'background .13s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: it.color + '14', color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: C.navMute, marginTop: 2, lineHeight: 1.4 }}>{it.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 활동 체크인/아웃 + 후기 (Papa식)
function CheckInOutCard({ activity, user, dispatch, showToast, color = C.sage }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mood, setMood] = useState(5);
  const [summary, setSummary] = useState('');
  const [computedHours, setComputedHours] = useState(0);
  const [, force] = useState(0);
  useBodyScrollLock(feedbackOpen);
  const feedbackRef = useRef(null);
  useFocusTrap(feedbackOpen, feedbackRef);
  useEffect(() => {
    if (!feedbackOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setFeedbackOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feedbackOpen]);
  useEffect(() => {
    if (!feedbackOpen) return undefined;
    const t = setTimeout(() => { if (feedbackRef.current) feedbackRef.current.focus(); }, 0);
    return () => clearTimeout(t);
  }, [feedbackOpen]);

  // 진행 중이면 1초마다 경과시간 갱신
  useEffect(() => {
    if (activity.status !== 'in_progress') return;
    const id = setInterval(() => force(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [activity.status]);

  const checkIn = () => {
    dispatch({ type: 'CHECK_IN', payload: { id: activity.id, at: new Date().toISOString() } });
    showToast && showToast({ type: 'success', title: '체크인 완료', message: '활동이 시작되었습니다. 끝나면 체크아웃해 주세요.' });
  };
  const checkOut = () => {
    const start = activity.checkin_at ? new Date(activity.checkin_at) : new Date();
    const hrs = Math.max(0.5, Math.round((Date.now() - start.getTime()) / 360000) / 10);
    setComputedHours(hrs);
    dispatch({ type: 'CHECK_OUT', payload: { id: activity.id, at: new Date().toISOString(), hours: hrs } });
    setFeedbackOpen(true);
  };
  const submitFeedback = () => {
    dispatch({ type: 'ADD_LOG', payload: { id: uid('log'), activity_id: activity.id, participant_id: user.id, hours: computedHours || activity.actual_hours || activity.duration_hours || 1, summary: summary || '활동을 완료했습니다.', approved: false, has_photo: false, mood } });
    setFeedbackOpen(false);
    showToast && showToast({ type: 'success', title: '후기 제출 완료', message: '코디 승인 후 정산에 반영됩니다.' });
  };

  const elapsed = activity.checkin_at ? Math.max(0, Date.now() - new Date(activity.checkin_at).getTime()) : 0;
  const mm = Math.floor(elapsed / 60000);
  const elapsedStr = `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;

  return (
    <>
      <Card padding={18} style={{ borderColor: activity.status === 'in_progress' ? color + '66' : C.line, background: activity.status === 'in_progress' ? color + '0A' : C.panel }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <Badge color={color} soft={color + '18'} size="sm">{activity.type || '활동'}</Badge>
              <span style={{ fontSize: 12, color: C.muteLight, fontWeight: 500 }}>{fmtRelativeDate(activity.scheduled_at)} {activity.time || ''}</span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{activity.title || activity.type || '오늘의 활동'}</div>
            <div style={{ fontSize: 12.5, color: C.navMute, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}><MapPin size={12} /> {activity.location || '장소 미정'}</div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {activity.status === 'scheduled' && (
              <Button variant="brand" icon={<Clock size={15} />} onClick={checkIn}>체크인</Button>
            )}
            {activity.status === 'in_progress' && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: SERIF_STACK, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{elapsedStr}</div>
                <div style={{ fontSize: 10, color: C.mute, marginBottom: 8 }}>진행 중</div>
                <Button variant="primary" size="sm" icon={<Check size={14} />} onClick={checkOut}>체크아웃</Button>
              </div>
            )}
            {activity.status === 'completed' && (
              <Badge color={C.sage} soft={C.sageSoft}><Check size={11} /> 완료</Badge>
            )}
          </div>
        </div>
      </Card>

      {feedbackOpen && (
        <div className="eum-modal-overlay" onClick={() => setFeedbackOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div ref={feedbackRef} className="eum-modal-panel" tabIndex={-1} role="dialog" aria-modal="true" aria-label="활동 후기 작성" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 440, width: '100%', padding: 28, boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease', textAlign: 'left', outline: 'none' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, marginBottom: 4 }}>활동 후기</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 18 }}>약 <strong style={{ color }}>{computedHours}시간</strong> 활동했어요. 오늘 어땠는지 남겨주세요.</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mute, marginBottom: 8 }}>오늘 만족도</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setMood(n)} aria-label={`${n}점`} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${mood >= n ? C.gold : C.border}`, background: mood >= n ? C.goldSoft : C.card, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                  <Star size={20} color={mood >= n ? C.gold : C.mute} fill={mood >= n ? C.gold : 'none'} />
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mute, marginBottom: 8 }}>활동 내용</div>
            <Textarea value={summary} onChange={setSummary} placeholder="무엇을 함께 했는지, 기억에 남는 순간을 적어주세요." rows={3} maxLength={600} showCount />
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <Button variant="secondary" onClick={() => setFeedbackOpen(false)} fullWidth>나중에</Button>
              <Button variant="brand" icon={<Send size={15} />} onClick={submitFeedback} fullWidth>후기 제출</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



// 스켈레톤 — 로딩 시 콘텐츠 형태를 미리 보여주는 회색 블록(디자인 시스템: 스켈레톤 우선, 스피너 보조)


// ============================================================================
// 6. LAYOUT — SIDEBAR + HEADER
// ============================================================================

// 이음 공식 로고 마크 (브랜드 가이드) — 세 세대가 손을 잇는 형상


function Sidebar({ role, currentView, onNavigate, onLogout, userName, dataCount }) {
  const navByRole = {
    coordinator: [
      { id: 'overview', label: '대시보드', icon: <Home size={17} />, group: '운영' },
      { id: 'applicants', label: '신청자 관리', icon: <UserPlus size={17} />, count: dataCount?.applicants, group: '운영' },
      { id: 'matching', label: '매칭 보드', icon: <Heart size={17} />, count: dataCount?.matches, group: '운영' },
      { id: 'activities', label: '활동 승인', icon: <ClipboardCheck size={17} />, count: dataCount?.pendingLogs, group: '운영' },
      { id: 'settlements', label: '정산', icon: <Wallet size={17} />, group: '운영' },
      { id: 'safety', label: '안전 이슈', icon: <ShieldAlert size={17} />, count: dataCount?.openIncidents, danger: dataCount?.openIncidents > 0, group: '운영' },
      { id: 'notices', label: '공지 발송', icon: <Send size={17} />, group: '운영' },
      { id: 'reports', label: '리포트', icon: <FileText size={17} />, group: '성과·납품' },
      { id: 'b2g', label: '공공 성과·납품', icon: <TrendingUp size={17} />, group: '성과·납품' },
      { id: 'b2b', label: '기업·기관 복지', icon: <Award size={17} />, group: '성과·납품' },
      { id: 'ai-advisor', label: '복지 어드바이저', icon: <Sparkles size={17} />, group: 'AI 어시스트' },
      { id: 'ai-match', label: 'AI 자동·선택 매칭', icon: <Users size={17} />, group: 'AI 어시스트' },
      { id: 'ai-copilot', label: 'AI 코파일럿', icon: <ClipboardCheck size={17} />, group: 'AI 어시스트' },
      { id: 'ai-chaperone', label: 'AI 안전 채퍼론', icon: <ShieldCheck size={17} />, group: 'AI 어시스트' },
      { id: 'roadmap', label: '서비스 로드맵', icon: <Sparkles size={17} />, group: 'AI 어시스트' },
    ],
    youth: [
      { id: 'dashboard', label: '홈', icon: <Home size={18} /> },
      { id: 'discover', label: '활동 찾기', icon: <Search size={18} /> },
      { id: 'schedule', label: '활동 일정', icon: <Calendar size={18} /> },
      { id: 'logs', label: '활동 기록', icon: <PenLine size={18} /> },
      { id: 'mentor', label: '진로 멘토', icon: <GraduationCap size={18} /> },
      { id: 'archive', label: '동네 기억', icon: <BookOpen size={18} /> },
      { id: 'settlement', label: '정산', icon: <Wallet size={18} /> },
    ],
    senior: [
      { id: 'dashboard', label: '홈', icon: <Home size={22} /> },
      { id: 'schedule', label: '다음 만남', icon: <Calendar size={22} /> },
      { id: 'settlement', label: '받은 상품권', icon: <Wallet size={22} /> },
    ],
    parent: [
      { id: 'dashboard', label: '홈', icon: <Home size={18} /> },
      { id: 'today', label: '오늘 활동', icon: <Activity size={18} /> },
      { id: 'match', label: '매칭 정보', icon: <Users size={18} /> },
      { id: 'safety', label: '안전', icon: <ShieldCheck size={18} /> },
    ],
  };

  const items = navByRole[role] || [];
  const persona = PERSONA[role];
  const isSenior = role === 'senior';

  // 그룹 라벨이 있는 항목만 섹션으로 묶는다(코디네이터). 그 외 역할은 단일 목록.
  const groups = [];
  items.forEach((it) => {
    const g = it.group || '';
    const last = groups[groups.length - 1];
    if (last && last.name === g) last.items.push(it);
    else groups.push({ name: g, items: [it] });
  });

  return (
    <div className="eum-noprint" style={{
      width: isSenior ? 244 : 248, height: '100vh', background: C.navy,
      borderRight: `1px solid ${C.navyLine}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0,
    }}>
      {/* 브랜드 */}
      <div style={{ height: 64, padding: '0 18px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.navyLine}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }} onClick={() => onNavigate('overview')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('overview'); } }} role="button" tabIndex={0} aria-label="대시보드로">
          <EumLogo size={28} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: C.navyText, letterSpacing: '-0.04em', lineHeight: 1 }}>이음</span>
            <span style={{ fontSize: 11, color: C.navyMute, fontWeight: 600, letterSpacing: '-0.01em' }}>{persona.label}</span>
          </div>
        </div>
      </div>

      {/* 내비게이션 */}
      <nav className="eum-scroll eum-scroll-dark" role="navigation" aria-label={`${persona.label} 메뉴`} style={{ flex: 1, padding: '12px 10px 8px', overflowY: 'auto' }}>
        {groups.map((g, gi) => (
          <div key={g.name || gi} style={{ marginBottom: 6 }}>
            {g.name && (
              <div style={{ fontSize: 10.5, color: C.navyMute, fontWeight: 700, letterSpacing: '0.09em', padding: gi === 0 ? '2px 12px 7px' : '14px 12px 7px', textTransform: 'uppercase', opacity: 0.75 }}>
                {g.name}
              </div>
            )}
            {g.items.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: isSenior ? '13px 12px' : '9px 12px', marginBottom: 1,
                    background: active ? C.brand : 'transparent',
                    color: active ? '#fff' : C.navyMute,
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontWeight: active ? 700 : 500,
                    fontSize: isSenior ? 16 : 13.5, textAlign: 'left',
                    letterSpacing: '-0.015em',
                    fontFamily: FONT_STACK,
                    boxShadow: active ? '0 6px 16px -6px rgba(46,107,240,0.6)' : 'none',
                    transition: 'background 0.14s ease, color 0.14s ease',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.navyText; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.navyMute; } }}
                >
                  <span style={{ color: active ? '#fff' : C.navyMute, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span aria-label={`${item.danger ? '미처리 ' : ''}${item.count}건`} style={{
                      fontSize: 11, fontWeight: 700,
                      background: item.danger ? C.red : (active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'),
                      color: '#fff',
                      padding: '1px 6px', borderRadius: 6,
                      minWidth: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums',
                    }}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 계정 */}
      <div style={{ padding: 10, borderTop: `1px solid ${C.navyLine}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10 }}>
          <Avatar type={role} name={userName} color={persona.color} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navyText, letterSpacing: '-0.02em' }}>{userName}</div>
            <div style={{ fontSize: 11, color: C.navyMute, fontWeight: 500 }}>{persona.label}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', color: C.navyMute, padding: 6, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
            aria-label="로그아웃"
            title="로그아웃"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.navyText; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.navyMute; }}
          >
            <LogOut size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.navyLine}` }}>
          <span style={{ fontSize: 9.5, color: C.navyMute, fontWeight: 600 }}>운영</span>
          <img src="/logos/gowon.png" alt="고원 GOWON" loading="lazy" decoding="async" style={{ height: 14, objectFit: 'contain', opacity: 0.55, filter: 'brightness(0) invert(1)' }} onError={(e) => { e.currentTarget.style.display = 'none'; const n = e.currentTarget.nextElementSibling; if (n) n.style.display = 'inline'; }} />
          <span style={{ display: 'none', fontSize: 9.5, color: C.navyMute, fontWeight: 700 }}>고원(GOWON)</span>
        </div>
      </div>
    </div>
  );
}


// 섹션 패널 — 콘솔 화면의 기본 구획 단위(헤더 + 본문). 카드 남용을 줄이고 위계를 만든다.

// ============================================================================
// 8. LAYOUT WRAPPER
// ============================================================================

// 참여자(소비자) 하단 탭 네비
const PARTICIPANT_NAV = {
  youth: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'schedule', label: '일정', icon: Calendar },
    { id: 'discover', label: '찾기', icon: Search }, { id: 'logs', label: '기록', icon: PenLine }, { id: 'mentor', label: '멘토', icon: GraduationCap },
    { id: 'archive', label: '기억', icon: BookOpen }, { id: 'settlement', label: '정산', icon: Wallet },
    { id: 'notices', label: '공지', icon: Bell },
  ],
  senior: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'schedule', label: '다음 만남', icon: Calendar },
    { id: 'settlement', label: '상품권', icon: Wallet }, { id: 'notices', label: '공지', icon: Bell },
  ],
  parent: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'today', label: '오늘', icon: Activity },
    { id: 'match', label: '매칭', icon: Users }, { id: 'safety', label: '안전', icon: ShieldCheck },
    { id: 'notices', label: '공지', icon: Bell },
  ],
};

// 소비자(참여자) 셸 — 상단 앱바 + 하단 탭, 따뜻한 캔버스 (관리자 콘솔과 구분)
// 화면 전환 스크린리더 안내 — SPA는 화면(view)이 바뀌어도 브라우저 내비게이션 이벤트가
// 없어 스크린리더가 침묵한다. 시각적으로 숨긴 aria-live(polite) 영역이 새 화면 이름을
// 읽어 주어 "지금 어느 화면인지"를 비시각 사용자에게도 전달한다. 최초 진입은 침묵
// (불필요한 소음 방지), 이후 전환만 안내. 순수 표현 — 리듀서/SEED/로직 무관.
function ViewAnnouncer({ label }) {
  const [msg, setMsg] = useState('');
  const firstRef = useRef(true);
  useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; }
    if (label) setMsg(label + ' 화면');
  }, [label]);
  return (
    <div aria-live="polite" role="status" style={{ position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}>
      {msg}
    </div>
  );
}

function ConsumerLayout({ role, view, setView, user, dispatch, state, children }) {
  const persona = PERSONA[role] || PERSONA.youth;
  const isSenior = role === 'senior';
  const items = PARTICIPANT_NAV[role] || [];
  const handleLogout = () => dispatch({ type: 'LOGOUT' });
  const isNarrow = useIsMobile(760);
  // 화면(탭) 전환 시 상단으로 복귀 — 코디네이터 Layout과 동일한 문법. 이전 화면의 스크롤
  // 위치가 남아 새 화면이 "중간부터" 보이는 문제 방지(참여자 앱 3종 공통).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);
  const surface = isNarrow ? {} : {
    border: `1px solid ${C.line}`, borderRadius: 24,
    boxShadow: '0 32px 80px -40px rgba(16,24,40,0.28), 0 4px 16px -8px rgba(16,24,40,0.08)',
    overflow: 'hidden', margin: '28px 0 36px', minHeight: 'calc(100vh - 64px)',
  };
  return (
    <div style={{
      minHeight: '100vh', fontFamily: FONT_STACK, color: C.ink,
      display: 'flex', justifyContent: 'center',
      background: C.appBg,
      backgroundImage: `radial-gradient(1100px 420px at 50% -8%, ${persona.soft} 0%, rgba(0,0,0,0) 70%)`,
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        width: '100%', maxWidth: isSenior ? 860 : 720,
        display: 'flex', flexDirection: 'column',
        background: C.panel, position: 'relative',
        ...surface,
        ...(isNarrow ? { minHeight: '100vh' } : {}),
      }}>
        <ViewAnnouncer label={(items.find((it) => it.id === view) || {}).label} />
        {/* 상단 앱바 — 정체(누구로 접속했는지)와 이탈(나가기)만 남긴다 */}
        <div className="eum-noprint" style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isSenior ? '14px 22px' : '12px 18px',
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: `1px solid ${C.lineSoft}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setView(items[0]?.id || 'dashboard')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView(items[0]?.id || 'dashboard'); } }} role="button" tabIndex={0} aria-label="홈으로">
            <EumLogo size={isSenior ? 32 : 27} />
            <div>
              <div style={{ fontSize: isSenior ? 17 : 15, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1.15 }}>이음</div>
              <div style={{ fontSize: isSenior ? 13 : 11, color: C.navMute, fontWeight: 600, marginTop: 1 }}>
                <span style={{ color: persona.color, fontWeight: 700 }}>{persona.label}</span> · {user?.name}님
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationBell state={state} role={role} user={user} onNavigate={setView} />
            <button onClick={handleLogout} aria-label="로그아웃" style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.line}`, background: C.panel, color: C.inkSoft, borderRadius: 10, padding: isSenior ? '9px 14px' : '7px 10px', fontSize: isSenior ? 14 : 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_STACK }}>
              <LogOut size={isSenior ? 18 : 15} />{isSenior && ' 나가기'}
            </button>
          </div>
        </div>

        {/* 본문 (탭 전환 시 부드러운 진입) */}
        <div key={view} id="eum-main" role="main" tabIndex={-1} style={{ flex: 1, padding: isSenior ? '24px 22px 116px' : '20px 18px 104px', overflowX: 'hidden', outline: 'none', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)', background: C.appBg }}>
          {children}
        </div>

        {/* 하단 탭 — 플로팅 아일랜드 + 활성 필. 손가락이 닿는 곳을 명확히 한다. */}
        {/* paddingBottom은 padding 뒤에 선언 — env() 미지원 브라우저에선 무시되어 숏핸드 값이 유지된다 */}
        <div className="eum-noprint" style={{ position: 'sticky', bottom: 0, zIndex: 50, padding: isSenior ? '10px 16px 16px' : '8px 14px 14px', paddingBottom: isSenior ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : 'calc(14px + env(safe-area-inset-bottom, 0px))', background: `linear-gradient(180deg, rgba(244,245,247,0) 0%, ${C.appBg} 55%)` }}>
          <div role="navigation" aria-label="주요 메뉴" style={{
            display: 'flex', gap: 4, padding: 6,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)',
            border: `1px solid ${C.line}`, borderRadius: 18,
            boxShadow: '0 12px 32px -14px rgba(16,24,40,0.22)',
          }}>
            {items.map((it) => {
              const active = view === it.id;
              const Icon = it.icon;
              return (
                <button key={it.id} onClick={() => setView(it.id)} aria-current={active ? 'page' : undefined} style={{
                  position: 'relative', flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: isSenior ? 5 : 4,
                  padding: isSenior ? '11px 2px' : '8px 2px',
                  minHeight: isSenior ? 62 : 52,
                  border: 'none', borderRadius: 13,
                  background: active ? persona.soft : 'transparent',
                  cursor: 'pointer', color: active ? persona.color : C.navMute,
                  fontFamily: FONT_STACK, transition: 'color 0.16s ease, background 0.16s ease',
                }}>
                  <Icon size={isSenior ? 25 : 20} strokeWidth={active ? 2.4 : 1.9} />
                  <span style={{ fontSize: isSenior ? 12.5 : 10.5, fontWeight: active ? 700 : 600, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout({ role, view, setView, user, dispatch, children, state }) {
  if (role !== 'coordinator') {
    return <ConsumerLayout role={role} view={view} setView={setView} user={user} dispatch={dispatch} state={state}>{children}</ConsumerLayout>;
  }
  const dataCount = {
      applicants: state?.applications?.filter(a => a.status === 'screening' || a.status === 'verified').length || 0,
      matches: state?.matches?.filter(m => m.status === 'active').length || 0,
      pendingLogs: state?.activity_logs?.filter(l => !l.approved).length || 0,
      openIncidents: state?.safety_incidents?.filter(i => i.status === 'open' || i.status === 'in_progress').length || 0,
    };

  const handleLogout = () => dispatch({ type: 'LOGOUT' });
  const isMobile = useIsMobile(900);
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef(null);
  useBodyScrollLock(drawer);
  useFocusTrap(drawer, drawerRef);
  // 화면 전환 시 상단으로 복귀 — 이전 화면의 스크롤 위치가 남아 "중간부터 시작"하는 문제 방지
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => { if (drawerRef.current) drawerRef.current.focus(); }, 0);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [drawer]);

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, color: C.ink }}>
        <ViewAnnouncer label={COORD_VIEW_LABEL[view]} />
        {/* 모바일 상단바 */}
        <div className="eum-noprint" style={{ position: 'sticky', top: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDrawer(true)} aria-label="메뉴" style={{ display: 'flex', border: `1px solid ${C.border}`, background: C.card, borderRadius: 10, padding: 8, cursor: 'pointer', color: C.ink }}><Menu size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setView('overview')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView('overview'); } }} role="button" tabIndex={0} aria-label="대시보드로">
              <EumLogo size={26} />
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: SERIF_STACK, color: C.ink }}>이음 <span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>관리자</span></span>
            </div>
          </div>
          <NotificationBell state={state} role="coordinator" user={user} onNavigate={setView} />
        </div>
        {/* 드로어 */}
        {drawer && (
          <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.45)', zIndex: 70, animation: 'fadeIn 0.15s ease' }}>
            <div ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="메뉴" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, outline: 'none', animation: 'slideInLeft 0.22s ease' }}>
              <Sidebar role={role} currentView={view} onNavigate={(v) => { setView(v); setDrawer(false); }} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
            </div>
          </div>
        )}
        {/* 본문 (화면 전환 시 부드러운 진입 — 소비자 앱과 동일한 모션 언어) */}
        <div key={view} id="eum-main" role="main" tabIndex={-1} style={{ padding: '18px 16px 40px', overflowX: 'hidden', outline: 'none', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)' }}>{children}</div>
      </div>
    );
  }

  const crumb = COORD_VIEW_LABEL[view] || '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.appBg, fontFamily: FONT_STACK, color: C.ink }}>
      <ViewAnnouncer label={crumb} />
      <Sidebar role={role} currentView={view} onNavigate={setView} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* 상단바 — 브레드크럼 + 알림. 사이드바와 같은 64px 높이로 시각적 기준선을 맞춘다. */}
        <div className="eum-noprint" style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: 64, flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 32px',
          background: 'rgba(255,255,255,0.86)', backdropFilter: 'saturate(180%) blur(12px)',
          borderBottom: `1px solid ${C.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, minWidth: 0 }}>
            <span style={{ color: C.muteLight, fontWeight: 500 }}>코디네이터 콘솔</span>
            {crumb && <><span style={{ color: '#D4D7DD' }}>/</span><span style={{ color: C.headline, fontWeight: 700, letterSpacing: '-0.02em' }}>{crumb}</span></>}
          </div>
          <NotificationBell state={state} role="coordinator" user={user} onNavigate={setView} />
        </div>
        <div style={{ flex: 1, padding: '28px 32px 56px' }}>
          {/* 화면 전환 시 부드러운 진입 — 관리자 콘솔도 동일 모션 언어 */}
          <div key={view} id="eum-main" role="main" tabIndex={-1} style={{ maxWidth: 1280, margin: '0 auto', outline: 'none', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const COORD_VIEW_LABEL = {
  overview: '대시보드', applicants: '신청자 관리', matching: '매칭 보드', activities: '활동 승인',
  settlements: '정산', safety: '안전 이슈', reports: '리포트', b2g: '공공 성과·납품', b2b: '기업·기관 복지',
  'ai-advisor': '복지 어드바이저', 'ai-match': 'AI 자동·선택 매칭', 'ai-copilot': 'AI 코파일럿',
  'ai-chaperone': 'AI 안전 채퍼론', roadmap: '서비스 로드맵',
};

// 케어닥식 신뢰배지
function TrustRow() {
  const items = [
    { ic: <ShieldCheck size={15} />, t: '4단계 안전검증' },
    { ic: <UserCheck size={15} />, t: '범죄경력·아동학대 조회' },
    { ic: <Heart size={15} />, t: '돌봄 책임보험' },
    { ic: <Award size={15} />, t: '지자체 공인 인증발신' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 18px' }}>
      {items.map((x, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: C.sage, background: C.sageSoft, border: `1px solid ${C.sage}33`, padding: '6px 11px', borderRadius: 999 }}>{x.ic}{x.t}</div>
      ))}
    </div>
  );
}

// 어르신 접근성 — 큰 글씨 토글(전역 zoom)
// 케어닥식 홈 허브 — 큰 아이콘 빠른탐색 (A: UX 통일)
function HomeHub({ setView, items }) {
  const def = [
    { id: 'discover', label: '활동 찾기', icon: Search, c: C.brand },
    { id: 'schedule', label: '활동 일정', icon: Calendar, c: C.blue },
    { id: 'mentor', label: '진로 멘토', icon: GraduationCap, c: C.sage },
    { id: 'logs', label: '활동 기록', icon: PenLine, c: C.lavender },
    { id: 'archive', label: '동네 기억', icon: BookOpen, c: C.gold },
    { id: 'settlement', label: '정산·실적', icon: Wallet, c: C.peach },
  ];
  const list = items || def;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 10 }}>무엇을 도와드릴까요?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 10 }}>
        {list.map((it) => {
          const Ic = it.icon;
          return (
            <button key={it.id} onClick={() => setView(it.id)} style={{ cursor: 'pointer', fontFamily: FONT_STACK, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(26,24,20,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, background: it.c + '1A', color: it.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic size={24} /></span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


export { trustStatus, buildNotifications, NotificationBell, CheckInOutCard, Sidebar, ConsumerLayout, Layout, TrustRow, HomeHub };
