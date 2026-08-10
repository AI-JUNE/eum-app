// ============================================================================
// 학부모(ParentApp) 화면 — EumApp.jsx 단일파일 분해 3단계 (2026-08-03)
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만). 상태·리듀서는 EumApp에 유지.
// ============================================================================
import { useCallback, useState } from 'react';
import { Activity, AlertTriangle, Calendar, Clock, Coffee, Heart, MapPin, PenLine, Phone, Send, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { C, FONT_STACK, PERSONA, SERIF_STACK, SHADOW } from '../theme.js';
import { TODAY, fmtDate, fmtRelativeDate, uid } from '../utils.js';
import { Avatar } from '../avatar.jsx';
import { BILLING_ENABLED, PLANS, formatKRW, isPaidPlan, requestSubscription } from '../billing.js';
import { Badge, Button, Card, Empty, Field, Modal, PageHeader, Panel, Select, Textarea, useIsMobile } from '../ui.jsx';
import { HomeHub, Layout, TrustRow, trustStatus } from '../chrome.jsx';
import { TrioMember } from './YouthApp.jsx';

// ============================================================================
// 9. PARENT (양육가정) APP
// ============================================================================

function ParentApp({ state, user, dispatch, showToast }) {
  const [view, setView] = useState('dashboard');

  const myChildren = state.participants.filter(p => p.type === 'child' && (p.guardian_id === user.id || p.parent_id === user.id || user.child_id === p.id));
  const myMatches = state.matches.filter(m => myChildren.some(c => c.id === m.child_id) && m.status === 'active');
  const childIds = myChildren.map(c => c.id);

  const todayActivities = state.activities.filter(a =>
    a.date === TODAY && myMatches.some(m => m.id === a.match_id)
  );
  const upcomingActivities = state.activities
    .filter(a => a.date >= TODAY && a.status === 'scheduled' && myMatches.some(m => m.id === a.match_id))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 5);

  const recentLogs = state.activity_logs
    .filter(l => state.activities.find(a => a.id === l.activity_id && myMatches.some(m => m.id === a.match_id)))
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 6);

  const myIncidents = state.safety_incidents.filter(i => myMatches.some(m => m.id === i.match_id));

  return (
    <Layout role="parent" view={view} setView={setView} user={user} dispatch={dispatch} state={state}>
      {view === 'dashboard' && (
        <ParentDashboard user={user} myChildren={myChildren} myMatches={myMatches}
          todayActivities={todayActivities} upcomingActivities={upcomingActivities}
          recentLogs={recentLogs} state={state} myIncidents={myIncidents} setView={setView} />
      )}
      {view === 'today' && (
        <ParentToday todayActivities={todayActivities} upcomingActivities={upcomingActivities}
          myMatches={myMatches} state={state} />
      )}
      {view === 'match' && (
        <ParentMatchInfo myMatches={myMatches} myChildren={myChildren} state={state} />
      )}
      {view === 'safety' && (
        <ParentSafety user={user} myMatches={myMatches} myIncidents={myIncidents}
          dispatch={dispatch} showToast={showToast} />
      )}
    </Layout>
  );
}

function ParentDashboard({ user, myChildren, myMatches, todayActivities, upcomingActivities, recentLogs, state, myIncidents, setView }) {
  const child = myChildren[0];
  const match = myMatches[0];
  const youth = match ? state.participants.find(p => p.id === match.youth_id) : null;
  const senior = match ? state.participants.find(p => p.id === match.senior_id) : null;
  const openIssues = myIncidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
  const totalHoursThisMonth = state.activity_logs
    .filter(l => l.approved && (l.date || '').startsWith(TODAY.slice(0, 7)) &&
      state.activities.find(a => a.id === l.activity_id && myMatches.some(m => m.id === a.match_id)))
    .reduce((sum, l) => sum + l.hours, 0);

  return (
    <>
      <PageHeader title={`안녕하세요, ${user.name}님`} subtitle="아이의 오늘 활동과 트리오 소식을 확인하세요" />
      <HomeHub setView={setView} items={[{ id: 'today', label: '오늘 활동', icon: Activity, c: C.peach }, { id: 'match', label: '매칭 정보', icon: Users, c: C.lavender }, { id: 'safety', label: '안전', icon: ShieldCheck, c: C.sage }]} />

      {/* 트리오 카드 */}
      {match && (
        <div style={{ marginBottom: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.sm, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Heart size={16} style={{ color: C.brand }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>우리 아이의 트리오</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <TrioMember person={child} sub="자녀" color={C.peach} trust={trustStatus(state, child?.id)} />
            <TrioMember person={youth} sub={`청년 멘토 · ${youth?.skills?.[0] || '활동'}`} color={C.sage} trust={trustStatus(state, youth?.id)} />
            <TrioMember person={senior} sub={`동네 어르신 · ${senior?.skills?.[0] || ''}`} color={C.lavender} trust={trustStatus(state, senior?.id)} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.lineSoft}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.navMute, fontWeight: 600, marginBottom: 5 }}>이번 달 활동시간</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{totalHoursThisMonth}시간</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.navMute, fontWeight: 600, marginBottom: 5 }}>매칭 시작</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{fmtDate(match.started_at)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 오늘 활동 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 20 }}>
        <Card padding={22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>오늘의 활동</div>
            <Badge color={C.brand} soft={C.brandSoft}>{todayActivities.length}건</Badge>
          </div>
          {todayActivities.length === 0 ? (
            <Empty icon={<Coffee size={28} />} title="오늘은 예정된 활동이 없습니다" sub="여유로운 하루예요. 다음 일정을 확인해보세요" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayActivities.map(act => {
                const m = state.matches.find(mm => mm.id === act.match_id);
                const y = state.participants.find(p => p.id === m?.youth_id);
                return (
                  <div key={act.id} style={{ padding: 14, background: C.lineSoft, borderRadius: 10, border: `1px solid ${C.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{act.title}</div>
                      <Badge color={C.sage} soft={C.sageSoft}>{act.type}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 13, color: C.inkSoft }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {act.time || ''}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {act.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {y?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card padding={22} style={{ background: openIssues > 0 ? `${C.redSoft}` : C.card, border: openIssues > 0 ? `1px solid ${C.red}40` : `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={18} style={{ color: openIssues > 0 ? C.red : C.success }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: openIssues > 0 ? C.red : C.ink }}>안전 상태</div>
          </div>
          {openIssues > 0 ? (
            <>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.red, fontFamily: SERIF_STACK }}>{openIssues}건</div>
              <div style={{ fontSize: 13, color: C.red, marginTop: 4 }}>처리 중인 안전 이슈가 있습니다.</div>
              <Button variant="secondary" size="sm" fullWidth style={{ marginTop: 14 }} onClick={() => setView('safety')}>자세히 보기</Button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.success, fontFamily: SERIF_STACK }}>안전</div>
              <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>모든 활동이 정상 진행 중입니다.</div>
              <Button variant="ghost" size="sm" fullWidth style={{ marginTop: 14 }} onClick={() => setView('safety')} icon={<Phone size={14} />}>긴급 연락처</Button>
            </>
          )}
        </Card>
      </div>

      {/* 다가오는 활동 */}
      <Card padding={22} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: C.ink }}>다가오는 활동</div>
        {upcomingActivities.length === 0 ? (
          <Empty icon={<Calendar size={28} />} title="예정된 활동이 없습니다" sub="새 일정이 잡히면 여기에서 가장 먼저 알려드려요" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingActivities.map(act => {
              const m = state.matches.find(mm => mm.id === act.match_id);
              const y = state.participants.find(p => p.id === m?.youth_id);
              return (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 8, background: C.bg }}>
                  <div style={{ minWidth: 72, textAlign: 'center', padding: '6px 8px', background: C.card, borderRadius: 6, border: `1px solid ${C.borderSoft}` }}>
                    <div style={{ fontSize: 12.5, color: C.mute, fontWeight: 600 }}>{fmtRelativeDate(act.date)}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 1 }}>{(act.time || '').slice(0, 5)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{act.title}</div>
                    <div style={{ fontSize: 13, color: C.inkSoft }}>{act.location} · {y?.name}</div>
                  </div>
                  <Badge color={C.sage} soft={C.sageSoft} size="sm">{act.type}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 최근 활동 기록 */}
      <Card padding={22}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: C.ink }}>최근 활동 기록</div>
        {recentLogs.length === 0 ? (
          <Empty icon={<PenLine size={28} />} title="아직 기록이 없습니다" sub="활동이 끝나면 코디네이터가 그날의 기록을 남겨드려요" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentLogs.map(log => {
              const act = state.activities.find(a => a.id === log.activity_id);
              const author = state.participants.find(p => p.id === log.participant_id);
              return (
                <div key={log.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                  <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={36} color={PERSONA[author?.type]?.color || C.brand} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{author?.name}</span>
                      <span style={{ fontSize: 12.5, color: C.mute }}>· {fmtDate(log.date)} · {act?.title}</span>
                      {log.approved && <Badge color={C.success} soft={C.successSoft} size="sm">승인</Badge>}
                    </div>
                    <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{log.summary}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <TrustRow />
      <ConsumerPricing />
    </>
  );
}

function ParentToday({ todayActivities, upcomingActivities, myMatches, state }) {
  return (
    <>
      <PageHeader title="오늘의 활동" subtitle={fmtDate(TODAY)} />
      <Panel title="오늘" right={<Badge color={C.brand} soft={C.brandSoft}>{todayActivities.length}건</Badge>} style={{ marginBottom: 16 }}>
        {todayActivities.length === 0 ? (
          <Empty icon={<Coffee size={28} />} title="오늘은 활동이 없습니다" sub="다음 활동을 확인해보세요" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {todayActivities.map(act => <ActivityCard key={act.id} activity={act} state={state} />)}
          </div>
        )}
      </Panel>
      <Panel title="다가오는 활동">
        {upcomingActivities.length === 0 ? <Empty icon={<Calendar size={28} />} title="예정된 활동이 없습니다" sub="새 일정이 잡히면 여기에서 가장 먼저 알려드려요" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingActivities.map(act => <ActivityCard key={act.id} activity={act} state={state} />)}
          </div>
        )}
      </Panel>
    </>
  );
}

function ActivityCard({ activity, state }) {
  const m = state.matches.find(mm => mm.id === activity.match_id);
  const y = state.participants.find(p => p.id === m?.youth_id);
  const s = state.participants.find(p => p.id === m?.senior_id);
  const c = state.participants.find(p => p.id === m?.child_id);
  return (
    <div style={{ padding: 15, borderRadius: 12, border: `1px solid ${C.line}`, background: C.panel }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9, gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.headline, letterSpacing: '-0.02em' }}>{activity.title}</div>
        <Badge color={C.sage} soft={C.sageSoft} size="sm">{activity.type}</Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: C.navMute, marginBottom: 12, fontWeight: 500 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} style={{ color: C.muteLight }} /> {fmtRelativeDate(activity.date)} {(activity.time || '').slice(0, 5)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} style={{ color: C.muteLight }} /> {activity.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} style={{ color: C.muteLight }} /> {activity.duration_hours}시간</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[y, s, c].filter(Boolean).map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 5px', background: C.lineSoft, borderRadius: 999, fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
            <Avatar type={p?.type} gender={p?.gender} name={p.name} size={18} color={PERSONA[p.type]?.color || C.brand} />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentMatchInfo({ myMatches, myChildren, state }) {
  return (
    <>
      <PageHeader title="매칭 정보" subtitle="아이와 함께하는 트리오 구성원" />
      {myMatches.length === 0 ? <Empty icon={<Heart size={32} />} title="아직 매칭이 진행되지 않았습니다" sub="코디네이터가 적합한 트리오를 구성 중입니다" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myMatches.map(match => {
            const child = state.participants.find(p => p.id === match.child_id);
            const youth = state.participants.find(p => p.id === match.youth_id);
            const senior = state.participants.find(p => p.id === match.senior_id);
            return (
              <Card key={match.id} padding={24}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muteLight, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>매칭 #{match.id.toUpperCase()}</div>
                  <Badge color={C.success} soft={C.successSoft} size="sm">{match.status === 'active' ? '활동 중' : match.status}</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { p: child, label: '자녀', color: C.peach },
                    { p: youth, label: '청년 멘토', color: C.sage },
                    { p: senior, label: '동네 어르신', color: C.lavender },
                  ].map(({ p, label, color }) => p && (
                    <div key={p.id} style={{ padding: 16, borderRadius: 12, background: C.lineSoft, border: `1px solid ${C.line}` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
                        <Avatar type={p?.type} gender={p?.gender} name={p.name} size={60} color={color} ring />
                        <div style={{ fontSize: 15.5, fontWeight: 800, color: C.headline, marginTop: 10, letterSpacing: '-0.02em' }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: color, fontWeight: 700, marginTop: 3 }}>{label}</div>
                      </div>
                      <div style={{ fontSize: 13, color: C.navMute, lineHeight: 1.6, padding: '10px 0 0', borderTop: `1px solid ${C.line}` }}>
                        {p.bio || (p.type === 'child' ? `${p.age}세 · ${p.school || ''}` : '')}
                      </div>
                      {p.skills?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {p.skills.slice(0, 3).map((s, i) => (
                            <span key={i} style={{ fontSize: 12.5, padding: '2px 8px', background: C.panel, borderRadius: 7, color: C.navMute, border: `1px solid ${C.line}`, fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, padding: '14px 16px', background: C.brandBg, borderRadius: 12, borderLeft: `3px solid ${C.brand}` }}>
                  <div style={{ fontSize: 13, color: C.brand, fontWeight: 700, marginBottom: 6 }}>코디네이터 메모</div>
                  <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{match.coordinator_note || '활발하게 활동 중입니다. 별다른 이슈 없이 진행 중이니 안심하셔도 됩니다.'}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function ParentSafety({ user, myMatches, myIncidents, dispatch, showToast }) {
  const [reporting, setReporting] = useState(false);
  const [form, setForm] = useState({ category: '', severity: 'medium', description: '' });
  // 연락 카드 2열 그리드는 좁은 화면에서 글줄이 부러져 읽기 어렵다 → 640px 이하 한 열 스택
  const isMobile = useIsMobile(640);

  const submitReport = () => {
    if (!form.category || !form.description) {
      showToast({ type: 'error', message: '항목과 설명을 모두 입력해주세요.' });
      return;
    }
    dispatch({
      type: 'ADD_INCIDENT',
      payload: {
        id: uid('inc'),
        match_id: myMatches[0]?.id || null,
        activity_id: null,
        reported_by: user.id,
        severity: form.severity,
        category: form.category,
        description: form.description,
        status: 'open',
        reported_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
        resolved_at: null,
        resolved_by: null,
        resolution: null,
      }
    });
    showToast({ type: 'success', message: '신고가 접수되었습니다. 코디네이터가 곧 연락드립니다.' });
    setReporting(false);
    setForm({ category: '', severity: 'medium', description: '' });
  };

  return (
    <>
      <PageHeader title="안전" subtitle="아이의 안전이 최우선입니다" right={<Button variant="brand" icon={<AlertTriangle size={16} />} onClick={() => setReporting(true)}>안전 신고</Button>} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.success}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Phone size={16} style={{ color: C.success }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline }}>코디네이터 직통</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em' }}>한가은</div>
          {/* 모바일 원탭 통화 — 긴급 상황에서 번호를 옮겨 적지 않고 바로 전화 (데스크톱에서도 무해) */}
          <a href="tel:010-2345-6789" aria-label="코디네이터 한가은에게 전화 걸기, 010-2345-6789" style={{ display: 'inline-block', fontSize: 13.5, color: C.brand, marginTop: 5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textDecoration: 'underline', textUnderlineOffset: 3 }}>010-2345-6789</a>
          <div style={{ fontSize: 13, color: C.muteLight, marginTop: 8, fontWeight: 500 }}>평일 9시~21시 / 주말 10시~18시 응답</div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.red}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldAlert size={16} style={{ color: C.red }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline }}>긴급 시</div>
          </div>
          <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.7 }}>
            아이의 안전이 위협받는 위험 상황에서는 <a href="tel:112" aria-label="112에 전화 걸기" style={{ color: C.red, fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: 2 }}>112</a> 또는 <a href="tel:119" aria-label="119에 전화 걸기" style={{ color: C.red, fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: 2 }}>119</a>에 먼저 신고 후 코디네이터에게 알려주세요.
          </div>
        </div>
      </div>

      <Panel title="안전 이슈 이력" padding={myIncidents.length === 0 ? 8 : 16}>
        {myIncidents.length === 0 ? (
          <Empty icon={<ShieldCheck size={28} />} title="안전 이슈가 없습니다" sub="안전하게 활동 중입니다" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myIncidents.map(inc => (
              <div key={inc.id} style={{ padding: 14, borderRadius: 12, border: `1px solid ${C.line}`, borderLeft: `3px solid ${inc.severity === 'high' ? C.red : C.amber}`, background: C.panel }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                  <Badge color={inc.severity === 'high' ? C.red : C.amber} soft={inc.severity === 'high' ? C.redSoft : C.amberSoft} size="sm">{inc.severity === 'high' ? '높음' : inc.severity === 'medium' ? '중간' : '낮음'}</Badge>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{inc.category}</span>
                  <Badge color={inc.status === 'resolved' ? C.success : C.amber} soft={inc.status === 'resolved' ? C.successSoft : C.amberSoft} size="sm">{inc.status === 'resolved' ? '해결됨' : '처리 중'}</Badge>
                </div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 7, lineHeight: 1.55 }}>{inc.description}</div>
                <div style={{ fontSize: 12.5, color: C.muteLight, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>접수 {inc.reported_at}{inc.resolved_at && ` · 해결 ${inc.resolved_at}`}</div>
                {inc.resolution && <div style={{ fontSize: 12, color: C.success, marginTop: 8, padding: '8px 10px', background: C.successSoft, borderRadius: 8 }}>처리 내용: {inc.resolution}</div>}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal open={reporting} onClose={() => setReporting(false)} title="안전 신고" size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setReporting(false)}>취소</Button>
          <Button variant="brand" onClick={submitReport} icon={<Send size={16} />}>신고 접수</Button>
        </>}>
        <Field label="항목" required>
          <Select value={form.category} onChange={v => setForm({ ...form, category: v })}
            placeholder="문제 항목을 선택해주세요"
            options={[
              { value: '아이 부상', label: '아이 부상' },
              { value: '부적절한 언행', label: '부적절한 언행' },
              { value: '약속 불이행', label: '약속 불이행' },
              { value: '활동 환경 문제', label: '활동 환경 문제' },
              { value: '기타', label: '기타' },
            ]} />
        </Field>
        <Field label="심각도" required>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ k: 'low', l: '낮음', c: C.success }, { k: 'medium', l: '중간', c: C.amber }, { k: 'high', l: '높음', c: C.red }].map(opt => (
              <button key={opt.k} onClick={() => setForm({ ...form, severity: opt.k })}
                style={{ flex: 1, padding: '13px 10px', minHeight: 48, borderRadius: 10, border: form.severity === opt.k ? `2px solid ${opt.c}` : `1px solid ${C.border}`,
                  background: form.severity === opt.k ? `${opt.c}15` : C.card, color: form.severity === opt.k ? opt.c : C.inkSoft,
                  fontWeight: form.severity === opt.k ? 700 : 500, cursor: 'pointer', fontFamily: FONT_STACK, fontSize: 14 }}>{opt.l}</button>
            ))}
          </div>
        </Field>
        <Field label="상세 내용" required>
          <Textarea value={form.description} onChange={v => setForm({ ...form, description: v })}
            placeholder="언제, 어디서, 어떤 일이 있었는지 구체적으로 적어주세요." rows={5} />
        </Field>
      </Modal>
    </>
  );
}

// ───────── 소비자 B2C 구독 (약화 · 맨 아래) ─────────
// 요금제 정본은 src/eum/billing.js 의 PLANS. 표시색은 여기서 매핑(무료→mute·베이직→brand(hot)·프리미엄→lavender).
function ConsumerPricing() {
  const STYLE = {
    free:    { c: C.mute,     hot: false },
    basic:   { c: C.brand,    hot: true  },
    premium: { c: C.lavender, hot: false },
  };
  const [notice, setNotice] = useState(null); // 구독 CTA 결과 안내(승인 전엔 [승인 필요])

  // [승인 필요] 결제는 BILLING_ENABLED=false 로 가드됨 — requestSubscription 이 실결제 호출 없이 안내만 반환.
  const onSubscribe = useCallback(async (planId) => {
    try {
      const r = await requestSubscription(planId);
      setNotice(r?.message || (r?.ok ? '결제 준비 완료' : '결제를 진행할 수 없습니다.'));
    } catch (e) {
      setNotice('[승인 필요] 결제 스캐폴딩 오류: ' + (e?.message || 'unknown'));
    }
  }, []);

  return (
    <Card padding={18} style={{ marginTop: 18, background: C.cream, border: `1px dashed ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: C.inkSoft }}>참여는 무료, 더 깊은 안심은 선택</div>
        <Badge color={C.mute} soft={C.borderSoft} size="sm">선택 · 베타 예정</Badge>
      </div>
      <div style={{ fontSize: 13, color: C.mute, marginBottom: 12 }}>기본 활동은 누구나 무료입니다. 공공·기업 지원 시 구독도 무료로 제공돼요.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(176px,1fr))', gap: 9, opacity: 0.92 }}>
        {PLANS.map(t => {
          const st = STYLE[t.id] || { c: C.mute, hot: false };
          const paid = isPaidPlan(t.id);
          return (
            <div key={t.id} style={{ border: `1px solid ${st.hot ? C.brand + '66' : C.border}`, borderRadius: 11, padding: '12px 13px', background: C.card }}>
              <div style={{ fontSize: 12.5, color: C.mute, fontWeight: 700 }}>{t.sub}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: st.c, marginTop: 2 }}>{t.name}</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: C.ink, margin: '4px 0 8px' }}>{formatKRW(t.amount)}<span style={{ fontSize: 12.5, color: C.mute, fontWeight: 600 }}>{paid ? ' /월' : ''}</span></div>
              {t.feats.map((f, i) => <div key={i} style={{ fontSize: 13, color: C.inkSoft, marginBottom: 4 }}>· {f}</div>)}
              {paid && (
                <button
                  type="button"
                  onClick={() => onSubscribe(t.id)}
                  title={BILLING_ENABLED ? '구독 신청' : '[승인 필요] 결제 비활성 — 승인 후 활성화'}
                  style={{ marginTop: 8, width: '100%', padding: '11px 0', minHeight: 44, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    color: st.hot ? '#fff' : st.c, background: st.hot ? C.brand : 'transparent',
                    border: `1px solid ${st.hot ? C.brand : C.border}`, borderRadius: 8 }}
                >
                  {BILLING_ENABLED ? '구독하기' : '구독 신청(준비중)'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {notice && (
        <div role="status" style={{ marginTop: 10, padding: '8px 10px', fontSize: 13, lineHeight: 1.5, color: C.inkSoft, background: C.borderSoft, border: `1px solid ${C.border}`, borderRadius: 8 }}>{notice}</div>
      )}
      <div style={{ fontSize: 12.5, color: C.mute, marginTop: 10 }}>구독료는 우산동 파일럿 가정 기준 예시이며, 시장조사상 개인 구독은 장기 옵션입니다(B2G·B2B 우선).</div>
    </Card>
  );
}


export { ParentApp, ConsumerPricing };
