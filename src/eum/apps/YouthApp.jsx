// ============================================================================
// 청년(YouthApp) 화면 — EumApp.jsx 단일파일 분해 3단계 (2026-08-03)
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만). 상태·리듀서는 EumApp에 유지.
// ============================================================================
import { useMemo, useState } from 'react';
import { Activity, ArrowRight, Award, BookOpen, Calendar, Camera, Check, CheckCircle2, Clock, Download, GraduationCap, MapPin, PenLine, Plus, Search, Send, ShieldCheck, Smile, Users, Wallet, X } from 'lucide-react';
import { C, FONT_STACK, SERIF_STACK, SHADOW } from '../theme.js';
import { TODAY, fmtDate, fmtRelativeDate, krw, uid } from '../utils.js';
import { Avatar } from '../avatar.jsx';
import { AnimatedBar, Badge, Button, Card, Checkbox, CountUp, Empty, Field, InsuranceBadge, KpiStrip, Modal, PageHeader, Panel, Reveal, Ring, Select, Tabs, Textarea } from '../ui.jsx';
import { CheckInOutCard, HomeHub, Layout, TrustRow, trustStatus } from '../chrome.jsx';
import { EUM_API } from '../eumApi.js';

// ============================================================================
// 9. YOUTH DASHBOARD
// ============================================================================

function YouthApp({ state, user, dispatch, showToast }) {
  const [view, setView] = useState('dashboard');
  const match = state.matches.find((m) => m.youth_id === user.id);
  const senior = match ? state.participants.find((p) => p.id === match.senior_id) : null;
  const child = match ? state.participants.find((p) => p.id === match.child_id) : null;
  const parent = child ? state.participants.find((p) => p.id === child.parent_id) : null;

  const myActivities = useMemo(() => {
    if (!match) return [];
    return state.activities.filter((a) => a.match_id === match.id).sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''));
  }, [state.activities, match]);

  const myLogs = useMemo(() => state.activity_logs.filter((l) => l.participant_id === user.id), [state.activity_logs, user.id]);
  const mySettlements = useMemo(() => state.settlements.filter((s) => s.participant_id === user.id), [state.settlements, user.id]);

  const monthHours = useMemo(() => {
    const month = TODAY.slice(0, 7);
    return state.activity_logs
      .filter((l) => l.participant_id === user.id && l.approved && (l.approved_at || '').startsWith(month))
      .reduce((s, l) => s + l.hours, 0);
  }, [state.activity_logs, user.id]);

  const nextActivity = myActivities.find((a) => a.status === 'scheduled');
  const totalHours = state.activity_logs.filter((l) => l.participant_id === user.id && l.approved).reduce((s, l) => s + l.hours, 0);
  const totalEarned = mySettlements.filter((s) => s.status === 'paid').reduce((s, x) => s + x.amount_krw, 0);

  return (
    <Layout role="youth" view={view} setView={setView} user={user} dispatch={dispatch} state={state}
      data={{ pendingLogs: state.activity_logs.filter(l => l.participant_id === user.id && !l.approved).length }}>
      {view === 'dashboard' && (
        <>
          <PageHeader title={`안녕하세요, ${user.name}님`} subtitle={`이번 주 활동을 함께 살펴보세요`} />
          <VolunteerHub user={user} totalHours={totalHours} setView={setView} showToast={showToast} />
          <HomeHub setView={setView} />
          <TrustRow />

          {/* Hero — 매칭 트리오. 흐린 그라데이션을 걷고 흰 카드 + 세대 컬러 도트 헤더로. */}
          {match && (
            <div style={{ marginBottom: 20, overflow: 'hidden', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.sm }}>
              <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '0.08em', marginBottom: 5 }}>우리 매칭 트리오</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em' }}>세 세대가 함께하고 있어요</div>
                    <div style={{ fontSize: 12.5, color: C.muteLight, marginTop: 4, fontWeight: 500 }}>매칭 시작 {fmtDate(match.started_at)} · {myActivities.filter(a => a.status === 'completed').length}회차 진행</div>
                  </div>
                  <Badge color={C.sage} soft={C.sageSoft} size="md">활동 중</Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <TrioMember person={senior} sub="멘토" color={C.lavender} trust={trustStatus(state, senior?.id)} />
                  <ArrowRight size={17} style={{ color: '#CBD0D8' }} />
                  <TrioMember person={user} sub="나" color={C.sage} highlight />
                  <ArrowRight size={17} style={{ color: '#CBD0D8' }} />
                  <TrioMember person={child} sub="멘티" color={C.peach} trust={trustStatus(state, child?.id)} />
                </div>

                {match.match_notes && (
                  <div style={{ marginTop: 20, padding: '12px 14px', background: C.lineSoft, borderRadius: 10, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.navMute, marginRight: 7 }}>코디 메모</span>
                    {match.match_notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 이번 달 목표 — 흰 카드 + 링. 파스텔 그라데이션 제거. */}
          <Reveal>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.xs, padding: 22 }}>
              <Ring value={monthHours} max={24} size={100} stroke={10} color={C.sage} track={C.lineSoft} label={`${Math.round(monthHours / 24 * 100)}%`} sublabel="달성" />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.navMute, marginBottom: 6 }}>이번 달 활동 목표</div>
                <div style={{ fontSize: 23, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                  <CountUp value={monthHours} suffix="시간" /> <span style={{ fontSize: 15, color: C.muteLight, fontWeight: 600 }}>/ 24시간</span>
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 7, lineHeight: 1.5 }}>
                  {monthHours >= 24 ? '이번 달 목표를 달성했어요!' : `목표까지 ${24 - monthHours}시간 남았어요. 꾸준히 잇고 있어요.`}
                </div>
                <div style={{ marginTop: 13 }}>
                  <AnimatedBar value={monthHours} max={24} color={C.sage} height={7} track={C.lineSoft} />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Stats Row */}
          <KpiStrip
            style={{ marginBottom: 20 }}
            items={[
              { label: '이번 달 활동시간', value: monthHours, unit: 'h', sub: `목표 24h 중 ${Math.round(monthHours/24*100)}%`, color: C.sage, icon: <Clock size={15} /> },
              { label: '누적 활동시간', value: totalHours, unit: 'h', sub: `${myLogs.filter(l => l.approved).length}건 승인`, color: C.brand, icon: <Activity size={15} /> },
              { label: '누적 정산액', value: krw(totalEarned), sub: '광주상생카드', color: C.gold, icon: <Wallet size={15} /> },
              { label: '다음 활동', value: nextActivity ? fmtRelativeDate(nextActivity.scheduled_at) : '—', sub: nextActivity ? nextActivity.type : '예정 없음', color: C.lavender, icon: <Calendar size={15} /> },
            ]}
          />

          {/* Activity Cards 4종 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em', marginBottom: 12 }}>활동 4종</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <ActivityTypeCard type="디지털코칭" icon={<Smile size={20} />} desc="어르신께 스마트폰·앱 알려드리기" color={C.lavender} count={myLogs.filter(l => l.approved && state.activities.find(a => a.id === l.activity_id)?.type === '디지털코칭').length} />
              <ActivityTypeCard type="학습멘토" icon={<BookOpen size={20} />} desc="아동 학습·독서 멘토" color={C.peach} count={myLogs.filter(l => l.approved && state.activities.find(a => a.id === l.activity_id)?.type === '학습멘토').length} />
              <ActivityTypeCard type="진로조언받기" icon={<GraduationCap size={20} />} desc="어르신께 인생·진로 조언 받기" color={C.brand} count={myLogs.filter(l => l.approved && state.activities.find(a => a.id === l.activity_id)?.type === '진로조언받기').length} />
              <ActivityTypeCard type="기억아카이브" icon={<Camera size={20} />} desc="동네 옛이야기 기록·정리" color={C.gold} count={myLogs.filter(l => l.approved && state.activities.find(a => a.id === l.activity_id)?.type === '기억아카이브').length} />
            </div>
          </div>

          {/* Recent Logs */}
          <Card padding={0}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>최근 활동 기록</div>
                <div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>코디 승인 후 정산에 반영됩니다</div>
              </div>
              <Button variant="primary" size="sm" icon={<PenLine size={14} />} onClick={() => setView('logs')}>새 기록 작성</Button>
            </div>
            <div style={{ padding: 8 }}>
              {myLogs.slice(0, 5).map((log) => {
                const act = state.activities.find((a) => a.id === log.activity_id);
                return (
                  <div key={log.id} style={{ padding: 14, borderRadius: 9, marginBottom: 4, transition: 'background 0.12s' }} onMouseEnter={(e) => e.currentTarget.style.background = C.cream} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Badge color={C.brand} soft={C.brandSoft}>{act?.type || '—'}</Badge>
                          <span style={{ fontSize: 12, color: C.mute }}>{act ? fmtDate(act.scheduled_at) : ''}</span>
                          <span style={{ fontSize: 12, color: C.mute }}>· {log.hours}시간</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{log.summary}</div>
                      </div>
                      {log.approved ? (
                        <Badge color={C.sage} soft={C.sageSoft}><Check size={11} /> 승인</Badge>
                      ) : (
                        <Badge color={C.amber} soft={C.amberSoft}><Clock size={11} /> 대기</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {view === 'discover' && <YouthDiscover user={user} totalHours={totalHours} showToast={showToast} setView={setView} />}
      {view === 'schedule' && <YouthSchedule match={match} activities={myActivities} state={state} user={user} dispatch={dispatch} showToast={showToast} />}
      {view === 'logs' && <YouthLogs state={state} user={user} match={match} myLogs={myLogs} myActivities={myActivities} dispatch={dispatch} showToast={showToast} />}
      {view === 'mentor' && <YouthMentor senior={senior} myLogs={myLogs} state={state} />}
      {view === 'archive' && <ArchiveView state={state} />}
      {view === 'settlement' && <SettlementView settlements={mySettlements} totalHours={totalHours} totalEarned={totalEarned} user={user} />}
    </Layout>
  );
}

function TrioMember({ person, sub, color, highlight, trust }) {
  if (!person) return null;
  return (
    <div style={{ textAlign: 'center', minWidth: 110 }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
        <Avatar type={person?.type} gender={person?.gender} name={person.name} color={color} size={highlight ? 64 : 56} ring={highlight} />
        {highlight && <div style={{ position: 'absolute', bottom: -3, right: -3, background: C.brand, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.card}` }}>
          <Check size={12} strokeWidth={3} />
        </div>}
        {trust === 'verified' && !highlight && <div style={{ position: 'absolute', bottom: -2, right: -2, background: C.sage, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.card}` }} title="검증 완료">
          <ShieldCheck size={11} strokeWidth={3} />
        </div>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{person.name}</div>
      <div style={{ fontSize: 11.5, color: C.muteLight, marginTop: 2, fontWeight: 500 }}>{sub} · {person.age}세</div>
    </div>
  );
}

function ActivityTypeCard({ type, icon, desc, color, count }) {
  return (
    <Card padding={16} hoverable style={{ borderColor: color + '30' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ padding: 8, borderRadius: 9, background: color + '20', color }}>{icon}</div>
        <span style={{ fontSize: 11, color, fontWeight: 700, background: color + '15', padding: '2px 7px', borderRadius: 6 }}>{count}회 완료</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{type}</div>
      <div style={{ fontSize: 12, color: C.mute, lineHeight: 1.5 }}>{desc}</div>
    </Card>
  );
}

function YouthSchedule({ match, activities, state, user, dispatch, showToast }) {
  const actionable = activities
    .filter(a => a.status === 'in_progress' || (a.status === 'scheduled' && (a.date || '') >= TODAY))
    .sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''))
    .slice(0, 3);
  return (
    <>
      <PageHeader title="활동 일정" subtitle="매칭 트리오와의 격주 활동 일정입니다" />
      <div style={{ marginBottom: 18, background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.success}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <InsuranceBadge size="md" />
        <span style={{ fontSize: 12.5, color: C.navMute, fontWeight: 500, lineHeight: 1.5 }}>모든 대면 활동은 1365 자원봉사 보험 및 지자체 돌봄 특약 책임보험으로 자동 보장됩니다.</span>
      </div>
      {actionable.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> 오늘 활동 — 체크인하세요</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actionable.map(act => (
              <CheckInOutCard key={act.id} activity={act} user={user} dispatch={dispatch} showToast={showToast} color={C.sage} />
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map((act) => {
          const isPast = act.status === 'completed';
          return (
            <div key={act.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, textAlign: 'center', padding: '7px 0',
                    background: isPast ? C.lineSoft : C.brandBg, borderRadius: 10,
                    border: `1px solid ${isPast ? C.line : C.brand + '33'}`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isPast ? C.muteLight : C.brand, letterSpacing: '0.03em' }}>{act.scheduled_at.split('-')[1]}월</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: isPast ? C.navMute : C.headline, letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{act.scheduled_at.split(' ')[0].split('-')[2]}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <Badge color={C.brand} soft={C.brandSoft} size="sm">{act.type}</Badge>
                      {isPast ? <Badge color={C.sage} soft={C.sageSoft} size="sm">완료</Badge> : <Badge color={C.amber} soft={C.amberSoft} size="sm">예정</Badge>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.headline, marginBottom: 3, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {act.scheduled_at.split(' ')[1]} · {act.duration_hours}시간
                    </div>
                    <div style={{ fontSize: 12, color: C.navMute, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                      <MapPin size={12} style={{ color: C.muteLight }} /> {act.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function YouthLogs({ state, user, match, myLogs, myActivities, dispatch, showToast }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all');
  const [form, setForm] = useState({ activity_id: '', summary: '', mood: 5, has_photo: false });
  const shownLogs = tab === 'approved' ? myLogs.filter(l => l.approved) : tab === 'pending' ? myLogs.filter(l => !l.approved) : myLogs;

  const writableActs = myActivities.filter(a => a.status === 'completed' || a.status === 'scheduled');
  const writableOptions = writableActs.map((a) => {
    const has = myLogs.find((l) => l.activity_id === a.id);
    return { value: a.id, label: `${fmtDate(a.scheduled_at)} · ${a.type}${has ? ' (작성됨)' : ''}` };
  });

  const submit = () => {
    if (!form.activity_id || !form.summary) {
      showToast({ type: 'error', message: '활동을 선택하고 기록을 작성해주세요' });
      return;
    }
    const act = state.activities.find(a => a.id === form.activity_id);
    const newLog = {
      id: uid('log'),
      activity_id: form.activity_id,
      participant_id: user.id,
      hours: act.duration_hours,
      summary: form.summary,
      approved: false,
      approved_at: null,
      approved_by: null,
      has_photo: form.has_photo,
      mood: form.mood,
    };
    dispatch({ type: 'ADD_LOG', payload: newLog });
    showToast({ type: 'success', message: '활동 기록이 제출되었습니다. 코디 승인 후 정산에 반영됩니다.' });
    setOpen(false);
    setForm({ activity_id: '', summary: '', mood: 5, has_photo: false });
  };

  return (
    <>
      <PageHeader title="활동 기록" subtitle="작성한 기록은 코디네이터 승인 후 정산에 반영됩니다"
        right={<Button variant="brand" icon={<Plus size={16} />} onClick={() => setOpen(true)}>새 기록 작성</Button>}
      />

      <div style={{ marginBottom: 14 }}>
        <Tabs ariaLabel="활동 기록 상태 필터" tabs={[
          { id: 'all', label: '전체', count: myLogs.length },
          { id: 'approved', label: '승인', count: myLogs.filter(l => l.approved).length },
          { id: 'pending', label: '대기', count: myLogs.filter(l => !l.approved).length },
        ]} active={tab} onChange={setTab} />
      </div>
      <Panel padding={shownLogs.length === 0 ? 8 : 0}>
        {shownLogs.length === 0 ? (
          <Empty icon={<PenLine size={42} />} title={tab === 'all' ? '아직 기록이 없습니다' : tab === 'approved' ? '승인된 기록이 없습니다' : '대기 중인 기록이 없습니다'} sub={tab === 'all' ? '활동 후 그날의 인상적이었던 순간을 적어주세요' : undefined} />
        ) : shownLogs.map((log, i) => {
          const act = state.activities.find(a => a.id === log.activity_id);
          return (
            <div key={log.id} style={{ padding: '15px 20px', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Badge color={C.brand} soft={C.brandSoft} size="sm">{act?.type}</Badge>
                  <span style={{ fontSize: 12, color: C.muteLight, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{act ? fmtDate(act.scheduled_at) : ''}</span>
                  <span style={{ fontSize: 12, color: C.muteLight, fontWeight: 500 }}>· {log.hours}시간</span>
                  {log.has_photo && <span style={{ fontSize: 11, color: C.muteLight, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Camera size={11} /> 사진</span>}
                </div>
                {log.approved ? (
                  <Badge color={C.sage} soft={C.sageSoft} size="sm"><Check size={11} /> 승인됨</Badge>
                ) : (
                  <Badge color={C.amber} soft={C.amberSoft} size="sm"><Clock size={11} /> 승인 대기</Badge>
                )}
              </div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65 }}>{log.summary}</div>
            </div>
          );
        })}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="새 활동 기록 작성"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>취소</Button>
          <Button variant="brand" onClick={submit} icon={<Send size={14} />}>제출</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="활동 선택" required>
            <Select value={form.activity_id} onChange={(v) => setForm(f => ({ ...f, activity_id: v }))} options={writableOptions} placeholder="활동을 선택하세요" />
          </Field>
          <Field label="활동 기록" required sub="인상적이었던 순간, 어르신·아동의 반응, 느낀 점을 자유롭게">
            <Textarea value={form.summary} onChange={(v) => setForm(f => ({ ...f, summary: v }))} placeholder="오늘 박순자 어르신과 키오스크 실습을 했다..." rows={5} maxLength={1000} showCount />
          </Field>
          <Field label="오늘 활동은 어땠나요?">
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, mood: n }))}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 9,
                    border: `1.5px solid ${form.mood === n ? C.brand : C.border}`,
                    background: form.mood === n ? C.brandSoft : C.card,
                    cursor: 'pointer', fontSize: 20, fontFamily: FONT_STACK,
                  }}>
                  {['😞','😐','🙂','😊','🤩'][n-1]}
                </button>
              ))}
            </div>
          </Field>
          <Checkbox checked={form.has_photo} onChange={(v) => setForm(f => ({ ...f, has_photo: v }))} label="사진 첨부 (예정)" sublabel="활동 사진은 아카이브에 활용될 수 있습니다 (당사자 동의 시)" />
        </div>
      </Modal>
    </>
  );
}

function YouthMentor({ senior, myLogs, state }) {
  const mentorLogs = state.activity_logs.filter(l => {
    const act = state.activities.find(a => a.id === l.activity_id);
    return act && act.type === '진로조언받기' && l.participant_id !== senior?.id;
  });

  return (
    <>
      <PageHeader title="진로 멘토" subtitle="어르신께 받은 인생·진로 조언" />
      {senior && (
        <div style={{ marginBottom: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.sm, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar type="senior" name={senior.name} color={C.lavender} size={64} ring />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: C.lavender, fontWeight: 700, marginBottom: 4 }}>나의 멘토</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em' }}>{senior.name} 어르신</div>
              <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4, fontWeight: 500 }}>{senior.occupation} · {senior.age}세</div>
              <div style={{ fontSize: 12.5, color: C.navMute, marginTop: 7, lineHeight: 1.55 }}>“{senior.bio}”</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em', marginBottom: 12 }}>받은 조언 기록</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mentorLogs.length === 0 ? (
          <Empty icon={<GraduationCap size={42} />} title="아직 멘토링 기록이 없습니다" sub="어르신의 인생 조언을 메모해두세요" />
        ) : mentorLogs.map((log) => {
          const act = state.activities.find(a => a.id === log.activity_id);
          return (
            <Card key={log.id} padding={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Badge color={C.brand} soft={C.brandSoft}>진로조언</Badge>
                <span style={{ fontSize: 12, color: C.mute }}>{act ? fmtDate(act.scheduled_at) : ''}</span>
              </div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.7, paddingLeft: 14, borderLeft: `3px solid ${C.lavender}` }}>{log.summary}</div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function ArchiveView({ state }) {
  const archiveLogs = state.activity_logs.filter(l => {
    const act = state.activities.find(a => a.id === l.activity_id);
    return act && act.type === '기억아카이브' && l.approved;
  });

  return (
    <>
      <PageHeader title="동네 기억 아카이브" subtitle="광주 우산동의 옛이야기를 어르신께 듣고 기록합니다" />
      <div style={{ marginBottom: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.xs, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.goldSoft, borderRadius: 14, flexShrink: 0 }}>
            <BookOpen size={26} color={C.gold} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em' }}>이 동네에도 이야기가 있습니다</div>
            <div style={{ fontSize: 13, color: C.navMute, marginTop: 5, lineHeight: 1.6, maxWidth: 480 }}>어르신의 기억은 동네의 역사입니다. 청년이 듣고 기록하면, 다음 세대에 전해집니다.</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em', marginBottom: 12 }}>수집된 이야기 {archiveLogs.length}편</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {archiveLogs.map((log) => {
          const act = state.activities.find(a => a.id === log.activity_id);
          const author = state.participants.find(p => p.id === log.participant_id);
          return (
            <Card key={log.id} padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar type={author?.type} gender={author?.gender} name={author?.name} color={author?.avatar_color || C.brand} size={32} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{author?.name}</div>
                    <div style={{ fontSize: 11, color: C.mute }}>{fmtDate(act?.scheduled_at)} 채록</div>
                  </div>
                </div>
                {log.has_photo && <Badge color={C.gold} soft={C.goldSoft}><Camera size={11} /> 사진</Badge>}
              </div>
              <div style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.75, fontFamily: SERIF_STACK, fontStyle: 'italic', paddingLeft: 16, borderLeft: `3px solid ${C.gold}` }}>"{log.summary}"</div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function SettlementView({ settlements, totalHours, totalEarned, user }) {
  return (
    <>
      <PageHeader title="정산 내역" subtitle="광주상생카드 (월 1회 일괄 발급)" />

      <KpiStrip
        style={{ marginBottom: 16 }}
        items={[
          { label: '누적 정산액', value: krw(totalEarned), sub: '광주상생카드', color: C.gold, icon: <Wallet size={15} /> },
          { label: '누적 활동시간', value: totalHours, unit: '시간', color: C.brand, icon: <Clock size={15} /> },
          { label: '발급 횟수', value: settlements.filter(s => s.status === 'paid').length, unit: '회', color: C.sage, icon: <Award size={15} /> },
        ]}
      />

      <Panel title="발급 내역" padding={0}>
        {settlements.length === 0 ? (
          <Empty icon={<Wallet size={42} />} title="정산 내역이 없습니다" sub="월 1일에 자동 발급됩니다" />
        ) : settlements.map((s, i) => (
          <div key={s.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.headline, marginBottom: 4, letterSpacing: '-0.02em' }}>{s.month.replace('-', '년 ')}월 활동분</div>
              <div style={{ fontSize: 11.5, color: C.muteLight, display: 'flex', gap: 8, flexWrap: 'wrap', fontWeight: 500 }}>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{s.total_hours}시간</span>
                <span>·</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDate(s.issued_at)} 발급</span>
                <span>·</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em' }}>{s.voucher_code}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{krw(s.amount_krw)}</div>
              <Badge color={s.status === 'paid' ? C.sage : C.amber} soft={s.status === 'paid' ? C.sageSoft : C.amberSoft} size="sm">
                {s.status === 'paid' ? '발급 완료' : '발급 예정'}
              </Badge>
            </div>
          </div>
        ))}
      </Panel>
    </>
  );
}

// ============================================================================
// 1365·케어닥 관점 모듈 (2026-06) — 아웃사이드인: 탐색 + 봉사실적 인증
//  1365 자원봉사포털: 봉사실적 인증·나이스(학생부) 연계·마일리지·모집공고 탐색
//  케어닥: 카테고리 탐색·신뢰배지·쉬운 신청
// ============================================================================

// 청년 홈 — 1365 봉사실적 인증 허브
function VolunteerHub({ user, totalHours, setView, showToast }) {
  const hrs = totalHours || 0;
  const miles = Math.round(hrs * 100); // 봉사 마일리지(가정)
  const [issuing, setIssuing] = useState(false); // 발급 진행 표시(순수 표현 상태)
  return (
    <div style={{ marginBottom: 18, overflow: 'hidden', border: `1px solid ${C.line}`, borderRadius: 16, background: C.panel, boxShadow: SHADOW.sm }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', background: C.brand, color: '#fff' }}>
        <Award size={17} />
        <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.01em' }}>1365 자원봉사 실적 연계</div>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, background: 'rgba(255,255,255,.22)', padding: '3px 9px', borderRadius: 7 }}>공식 인정</span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 14, marginBottom: 16 }}>
          <div><div style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600 }}>인정 봉사시간</div><div style={{ fontSize: 24, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{hrs}<span style={{ fontSize: 12.5, color: C.muteLight, fontWeight: 600 }}>시간</span></div></div>
          <div><div style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600 }}>봉사 마일리지</div><div style={{ fontSize: 24, fontWeight: 800, color: C.brand, letterSpacing: '-0.03em', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{miles.toLocaleString('ko-KR')}<span style={{ fontSize: 12.5, color: C.muteLight, fontWeight: 600 }}>P</span></div></div>
          <div><div style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600 }}>나이스(학생부) 연계</div><div style={{ fontSize: 14, fontWeight: 700, color: C.sage, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} /> 연계 가능</div></div>
        </div>
        <div style={{ fontSize: 12, color: C.navMute, lineHeight: 1.6, marginBottom: 14 }}>이음 활동은 <b style={{ color: C.inkSoft }}>1365 자원봉사 실적</b>으로 인정됩니다. 실적확인서를 발급해 대학·취업·학교생활기록부(나이스)에 활용하세요.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="brand" size="sm" icon={<Download size={14} />} loading={issuing} onClick={async()=>{ if (issuing) return; setIssuing(true); try { const r=await EUM_API.v1365.issueCertificate(user.id); showToast ? showToast({ type: 'success', message: '실적확인서 발급 완료 · '+r.certNo }) : setView('settlement'); } finally { setIssuing(false); } }}>실적확인서 발급</Button>
          <Button variant="secondary" size="sm" icon={<Search size={14} />} onClick={() => setView('discover')}>활동 찾기</Button>
        </div>
      </div>
    </div>
  );
}

// 청년 — 활동 찾기(탐색·모집공고) : 케어닥식 카드 + 1365식 모집/실적
const DISCOVER_CATS = ['전체', '디지털코칭', '학습멘토', '정서돌봄', '동네기억'];
// 모집 정원 도달(마감) 여부 — 카드 표시와 정렬(마감건은 뒤로)에 공통 사용
function discoverIsFull(x) {
  const [filled, total] = String(x.cap || '').split('/').map((n) => parseInt(n, 10));
  return Number.isFinite(filled) && Number.isFinite(total) && filled >= total;
}
const DISCOVER_LIST = [
  { t: '어르신 디지털 코칭', cat: '디지털코칭', org: '우산동 행복카페', when: '토 10:00', place: '우산동', reward: 30000, hrs: 3, cap: '2/3', hot: true },
  { t: '아동 학습 멘토', cat: '학습멘토', org: '우산도서관', when: '평일 16:00', place: '우산동', reward: 30000, hrs: 3, cap: '1/2', hot: true },
  { t: '세대 기억 아카이브', cat: '동네기억', org: '우산동 경로당', when: '토 14:00', place: '우산동', reward: 20000, hrs: 2, cap: '3/4', hot: false },
  { t: '정서 돌봄 말벗', cat: '정서돌봄', org: '우산동 복지관', when: '일 11:00', place: '우산동', reward: 20000, hrs: 2, cap: '0/2', hot: false },
  { t: '키오스크 동행 교육', cat: '디지털코칭', org: '광산구청 민원실', when: '수 14:00', place: '광산구', reward: 25000, hrs: 2, cap: '1/3', hot: false },
];
function YouthDiscover({ user, totalHours, showToast, setView }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('전체');
  const query = q.trim().toLowerCase();
  const list = DISCOVER_LIST
    .filter(x => (cat === '전체' || x.cat === cat) && (query === '' || [x.t, x.org, x.place, x.cat].some(v => String(v || '').toLowerCase().includes(query))))
    .sort((a, b) => (discoverIsFull(a) ? 1 : 0) - (discoverIsFull(b) ? 1 : 0)); // 마감건은 목록 뒤로(안정 정렬)
  return (
    <div>
      <PageHeader title="활동 찾기" subtitle="우리 동네 세대 돌봄 활동을 직접 찾아 신청하세요. 참여하면 보상과 함께 1365 봉사시간이 쌓입니다." right={<Badge color={'#FF6B35'} soft={'#FFE9DF'}>1365 봉사실적 인정</Badge>} />

      {/* 임팩트 통계 */}
      <KpiStrip
        style={{ marginBottom: 16 }}
        items={[
          { label: '내 누적 봉사시간', value: `${totalHours || 0}시간`, color: C.brand, icon: <Clock size={15} /> },
          { label: '이번 달 모집', value: `${DISCOVER_LIST.length}건`, color: C.sage, icon: <Search size={15} /> },
          { label: '우리동네 활동가', value: '128명', color: C.lavender, icon: <Users size={15} /> },
          { label: '상품권 환원', value: '지역경제 100%', color: C.gold, icon: <Award size={15} /> },
        ]}
      />

      {/* 검색 + 카테고리 칩 */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muteLight }} />
        <input type="search" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Escape' && q) { e.preventDefault(); setQ(''); } }} placeholder="활동·기관 검색" aria-label="활동·기관 검색" style={{ width: '100%', padding: '10px 38px 10px 38px', borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel, fontFamily: FONT_STACK, fontSize: 14, color: C.ink, outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}1f`; }}
          onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }} />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="검색어 지우기" style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.mute, display: 'flex', padding: 3, borderRadius: 6 }}
            onMouseEnter={e => { e.currentTarget.style.color = C.ink; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.mute; }}>
            <X size={15} />
          </button>
        )}
      </div>
      <div role="group" aria-label="카테고리 필터" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {DISCOVER_CATS.map(c => {
          const on = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)} aria-pressed={on} style={{ cursor: 'pointer', fontFamily: FONT_STACK, fontSize: 12.5, fontWeight: on ? 700 : 500, padding: '7px 13px', borderRadius: 9, border: `1px solid ${on ? 'transparent' : C.line}`, background: on ? C.headline : C.panel, color: on ? '#fff' : C.inkSoft, transition: 'background .14s ease, color .14s ease' }}>{c}</button>
          );
        })}
      </div>

      {/* 검색·필터 활성 시 결과 수 안내 */}
      {(query !== '' || cat !== '전체') && list.length > 0 && (
        <div aria-live="polite" style={{ fontSize: 12.5, fontWeight: 600, color: C.mute, marginBottom: 12 }}>
          검색 결과 <span style={{ color: C.brand, fontWeight: 800 }}>{list.length}건</span>
        </div>
      )}

      {/* 모집공고 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 13 }}>
        {list.map((x, i) => {
          const full = discoverIsFull(x);
          return (
          <Card key={i} hoverable>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge color={C.sage} soft={C.sageSoft} size="sm">{x.cat}</Badge>
              {full ? <Badge color={C.mute} soft={C.lineSoft} size="sm">모집 마감</Badge> : x.hot && <Badge color={C.brand} soft={C.brandSoft} size="sm">인기</Badge>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{x.t}</div>
            <div style={{ fontSize: 12, color: C.inkSoft, display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} style={{ color: C.mute }} />{x.org} · {x.place}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} style={{ color: C.mute }} />{x.when} · 모집 {x.cap}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.gold, background: C.goldSoft, padding: '4px 9px', borderRadius: 7 }}>상품권 {x.reward.toLocaleString('ko-KR')}원</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#FF6B35', background: '#FFE9DF', padding: '4px 9px', borderRadius: 7 }}>봉사 {x.hrs}시간 인정</span>
            </div>
            <Button variant="brand" size="sm" fullWidth disabled={full} onClick={() => showToast && showToast(`'${x.t}' 참여를 신청했습니다 · 코디 확인 후 확정`, 'success')}>{full ? '모집 마감' : '참여 신청'}</Button>
          </Card>
          );
        })}
      </div>
      {list.length === 0 && <Card><Empty icon={<Search size={28} />} title="조건에 맞는 활동이 없어요" sub="다른 검색어나 카테고리를 시도해 보세요" action={<Button variant="secondary" size="sm" onClick={() => { setQ(''); setCat('전체'); }}>필터 초기화</Button>} /></Card>}

      <Card style={{ marginTop: 16, background: '#FFF4EE', border: '1px solid #FFD9C7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Award size={16} style={{ color: '#FF6B35' }} /><div style={{ fontSize: 13, fontWeight: 800, color: '#D9531E' }}>참여하면 1365 봉사실적으로 인정</div></div>
        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>이음 활동시간은 <b>1365 자원봉사포털 실적</b>과 연계되어 실적확인서·나이스(학생부) 연계·봉사 마일리지로 쌓입니다. 단기 알바와 달리 <b>경력·스펙·보상</b>을 동시에.</div>
      </Card>
    </div>
  );
}


export { YouthApp, TrioMember, VolunteerHub, YouthDiscover };
