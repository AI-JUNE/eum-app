// ============================================================================
// 어르신(SeniorApp) 화면 — EumApp.jsx 단일파일 분해 3단계 (2026-08-03)
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만). 상태·리듀서는 EumApp에 유지.
// ============================================================================
import { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Wallet } from 'lucide-react';
import { C, SERIF_STACK, SHADOW } from '../theme.js';
import { TODAY, fmtDate, fmtRelativeDate, krw, uid } from '../utils.js';
import { Avatar } from '../avatar.jsx';
import { Badge, Button, Card, InsuranceBadge, OfficialSenderBadge } from '../ui.jsx';
import { HomeHub, Layout } from '../chrome.jsx';

// ============================================================================
// 10. SENIOR APP (큰 글씨, 단순 UI)
// ============================================================================

function SeniorApp({ state, user, dispatch, showToast }) {
  const [view, setView] = useState('dashboard');
  const match = state.matches.find((m) => m.senior_id === user.id);
  const youth = match ? state.participants.find((p) => p.id === match.youth_id) : null;
  const child = match ? state.participants.find((p) => p.id === match.child_id) : null;

  const myActivities = useMemo(() => {
    if (!match) return [];
    return state.activities.filter((a) => a.match_id === match.id).sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''));
  }, [state.activities, match]);
  const nextActivity = myActivities.find((a) => a.status === 'scheduled');
  const mySettlements = useMemo(() => state.settlements.filter((s) => s.participant_id === user.id), [state.settlements, user.id]);
  const totalEarned = mySettlements.filter((s) => s.status === 'paid').reduce((s, x) => s + x.amount_krw, 0);

  return (
    <Layout role="senior" view={view} setView={setView} user={user} dispatch={dispatch} state={state}>
      {view === 'dashboard' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1.22 }}>
              안녕하세요,<br />{user.name} 님
            </div>
            <div style={{ fontSize: 18, color: C.navMute, marginTop: 9, fontWeight: 500 }}>오늘은 {fmtDate(TODAY)} 입니다</div>
            <div style={{ marginTop: 14 }}>
              <OfficialSenderBadge size="lg" />
              <div style={{ fontSize: 14, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>
                이음의 모든 연락은 <strong style={{ color: C.blue }}>광주광역시 공식 알림톡 채널</strong>을 통해서만 발송됩니다. 모르는 번호의 전화·문자는 받지 마세요.
              </div>
            </div>
          </div>

          <HomeHub setView={setView} items={[{ id: 'schedule', label: '다음 만남', icon: Calendar, c: C.lavender }, { id: 'settlement', label: '받은 상품권', icon: Wallet, c: C.gold }]} />

          {/* 다음 만남 — 이 화면에서 가장 중요한 한 가지. 파스텔 위 파스텔을 걷어내고
              흰 패널 + 진한 헤더 스트립으로 대비를 확보한다(어르신 가독성). */}
          {nextActivity && youth && (
            <div style={{ marginBottom: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: SHADOW.sm, overflow: 'hidden' }}>
              <div style={{ background: C.lavender, padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <Calendar size={19} color="#fff" />
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>다음 만남</span>
              </div>
              <div style={{ padding: '24px 22px' }}>
                {/* 언제 — 가장 큰 활자 */}
                <div style={{ fontSize: 34, fontWeight: 800, color: C.headline, letterSpacing: '-0.035em', lineHeight: 1.15 }}>
                  {fmtRelativeDate(nextActivity.scheduled_at)}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.lavender, marginTop: 2, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {nextActivity.scheduled_at.split(' ')[1]}
                </div>

                {/* 어디서 · 무엇을 */}
                <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 19, color: C.ink, fontWeight: 600 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: C.lineSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin size={19} style={{ color: C.inkSoft }} /></span>
                    {nextActivity.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 19, color: C.ink, fontWeight: 600 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: C.lineSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Clock size={19} style={{ color: C.inkSoft }} /></span>
                    {nextActivity.type} · {nextActivity.duration_hours}시간
                  </div>
                </div>

                {/* 누구와 */}
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.lineSoft}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar type="youth" name={youth.name} color={C.sage} size={64} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.headline, letterSpacing: '-0.025em', lineHeight: 1.2 }}>{youth.name} 청년</div>
                    {child && <div style={{ fontSize: 17, color: C.inkSoft, marginTop: 4, fontWeight: 500 }}>그리고 <strong style={{ color: C.peach, fontWeight: 700 }}>{child.name}</strong> 아이</div>}
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <InsuranceBadge size="md" />
                </div>
              </div>
            </div>
          )}

          {/* 지금까지 받은 상품권 — 금액 하나만 크게. 나머지는 조용히. */}
          <div style={{ marginBottom: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: SHADOW.sm, padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: C.goldSoft, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={26} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.navMute, marginBottom: 5 }}>지금까지 받은 상품권</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {krw(totalEarned)}
              </div>
              <div style={{ fontSize: 15, color: C.mute, marginTop: 8, fontWeight: 500 }}>{mySettlements.length}회 정산 완료</div>
            </div>
          </div>

          {/* SOS 버튼 */}
          <SeniorSosCard user={user} dispatch={dispatch} showToast={showToast} match={match} />
        </>
      )}

      {view === 'schedule' && (
        <>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, marginBottom: 24, fontFamily: SERIF_STACK, letterSpacing: '-0.03em' }}>다음 만남</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myActivities.filter(a => a.status === 'scheduled').map((act) => (
              <Card key={act.id} padding={24}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 6, fontFamily: SERIF_STACK }}>{fmtRelativeDate(act.scheduled_at)}</div>
                <div style={{ fontSize: 18, color: C.inkSoft, marginBottom: 4 }}>{act.scheduled_at.split(' ')[1]} · {act.type}</div>
                <div style={{ fontSize: 17, color: C.mute, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {act.location}</div>
                <div style={{ marginTop: 12 }}><InsuranceBadge size="md" /></div>
              </Card>
            ))}
            {myActivities.filter(a => a.status === 'completed').slice(-3).reverse().map((act) => (
              <Card key={act.id} padding={20} style={{ background: C.cream }}>
                <Badge color={C.sage} soft={C.sageSoft} size="md">완료</Badge>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginTop: 6, fontFamily: SERIF_STACK }}>{fmtDate(act.scheduled_at)}</div>
                <div style={{ fontSize: 16, color: C.inkSoft, marginTop: 4 }}>{act.type}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {view === 'settlement' && (
        <>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.headline, marginBottom: 8, letterSpacing: '-0.04em' }}>받은 상품권</div>
          <div style={{ fontSize: 17, color: C.navMute, marginBottom: 24, fontWeight: 500 }}>광주상생카드는 동네 가맹점에서 사용하실 수 있습니다</div>
          <div style={{ marginBottom: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: SHADOW.sm, padding: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, background: C.goldSoft, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wallet size={28} /></span>
            <div>
              <div style={{ fontSize: 16, color: C.navMute, fontWeight: 600, marginBottom: 6 }}>누적 합계</div>
              <div style={{ fontSize: 46, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{krw(totalEarned)}</div>
            </div>
          </div>
          {mySettlements.map(s => (
            <Card key={s.id} padding={20} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK }}>{s.month.split('-')[0]}년 {s.month.split('-')[1]}월</div>
                  <div style={{ fontSize: 15, color: C.mute, marginTop: 4 }}>{fmtDate(s.issued_at)} 받음</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, fontFamily: SERIF_STACK }}>{krw(s.amount_krw)}</div>
              </div>
            </Card>
          ))}
        </>
      )}
    </Layout>
  );
}

function SeniorSosCard({ user, dispatch, showToast, match }) {
  const [confirming, setConfirming] = useState(false);

  const sendSos = () => {
    const newIncident = {
      id: uid('si'),
      match_id: match?.id || null,
      activity_id: null,
      reported_by: user.id,
      severity: 'high',
      category: '어르신 SOS',
      description: '어르신이 SOS 버튼을 눌렀습니다. 즉시 확인 필요.',
      status: 'open',
      reported_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      resolved_at: null,
      resolved_by: null,
      resolution: null,
    };
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
    showToast({ type: 'success', message: '코디네이터에게 알림이 전송되었습니다. 곧 연락드리겠습니다.', duration: 4000 });
    setConfirming(false);
  };

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.red}`, borderRadius: 16, boxShadow: SHADOW.sm, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.red, marginBottom: 8 }}>도움이 필요하실 때</div>
      <div style={{ fontSize: 17, color: C.ink, marginBottom: 18, lineHeight: 1.55, fontWeight: 500 }}>
        활동 중 어떤 문제가 있으시면 아래 버튼을 누르세요.<br />코디네이터 한가은이 바로 연락드립니다.
      </div>
      {confirming ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="danger" size="lg" fullWidth onClick={sendSos} icon={<Phone size={18} />}>
            <span style={{ fontSize: 17 }}>네, 보내주세요</span>
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setConfirming(false)}>
            <span style={{ fontSize: 17 }}>취소</span>
          </Button>
        </div>
      ) : (
        <Button variant="danger" size="lg" fullWidth onClick={() => setConfirming(true)} icon={<Phone size={20} />} style={{ height: 60, fontSize: 18 }}>
          코디네이터 호출
        </Button>
      )}
    </div>
  );
}



export { SeniorApp, SeniorSosCard };
