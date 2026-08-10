// ============================================================================
// 참여자 공지 수신함(NoticeInbox) — additive (2026-08-10)
//   백로그 #2(채널별 공지 발송 + 전달 결과)의 "받는 쪽"을 완성한다.
//   코디가 보낸 공지를 청년·어르신·학부모가 앱에서 확인하고, 읽음이 기록된다.
//   기존 SEED·리듀서·코디 로직 변경 없음. 신규 액션 MARK_NOTICE_READ만 추가.
// ============================================================================
import { useMemo, useState } from 'react';
import { Bell, BellOff, Check, CheckCircle2, MessageSquare, Smartphone } from 'lucide-react';
import { C, FONT_STACK, SHADOW } from '../theme.js';
import { fmtDate } from '../utils.js';
import { Badge, Button, Empty, PageHeader } from '../ui.jsx';
import { channelLabel, isNoticeRead, noticeDatePart, noticeTimePart, noticesForParticipant } from '../notices.js';

const CHANNEL_ICON = { kakao: MessageSquare, sms: Smartphone, app: Bell };

function NoticeInbox({ state, user, dispatch, senior = false }) {
  const list = useMemo(() => noticesForParticipant(state.notices, user.id), [state.notices, user.id]);
  const unread = list.filter((n) => !isNoticeRead(n, user.id));
  const [openId, setOpenId] = useState(null);

  const markRead = (n) => {
    if (isNoticeRead(n, user.id)) return;
    dispatch({ type: 'MARK_NOTICE_READ', payload: { id: n.id, participant_id: user.id } });
  };
  const toggle = (n) => {
    setOpenId((prev) => (prev === n.id ? null : n.id));
    markRead(n);
  };
  const markAll = () => unread.forEach(markRead);

  // 어르신 화면은 한 단계 큰 활자(디자인 원칙: 큰 글씨).
  const t = senior
    ? { title: 21, body: 18, meta: 15, pad: '20px 22px' }
    : { title: 15.5, body: 14, meta: 12.5, pad: '16px 18px' };

  return (
    <div>
      <PageHeader
        title="공지사항"
        subtitle={senior ? '이음에서 보내 드린 안내입니다' : '코디네이터가 보낸 안내를 여기서 다시 볼 수 있습니다'}
        right={unread.length > 0 ? (
          <Button variant="ghost" size="sm" icon={<Check size={15} />} onClick={markAll}>모두 읽음</Button>
        ) : null}
      />

      {/* 읽지 않은 공지 수 — 스크린리더에도 그대로 전달된다. */}
      <div style={{ margin: '2px 0 14px', fontSize: t.meta, color: C.navMute, fontWeight: 600 }}>
        전체 {list.length}건{unread.length > 0 ? ` · 읽지 않음 ${unread.length}건` : ' · 모두 읽음'}
      </div>

      {list.length === 0 ? (
        <Empty icon={<BellOff size={28} />} title="받은 공지가 없습니다" sub="새로운 안내가 오면 이곳에 표시됩니다." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((n) => {
            const read = isNoticeRead(n, user.id);
            const open = openId === n.id;
            const Icon = CHANNEL_ICON[n.myChannel] || Bell;
            const time = noticeTimePart(n.myAt);
            return (
              <div key={n.id} style={{
                background: C.panel,
                border: `1px solid ${read ? C.line : C.brand + '4D'}`,
                borderRadius: 18, boxShadow: SHADOW.sm, overflow: 'hidden',
              }}>
                <button
                  onClick={() => toggle(n)}
                  aria-expanded={open}
                  aria-controls={`notice-body-${n.id}`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: t.pad, border: 'none', background: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: FONT_STACK, transition: 'background .13s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  <span aria-hidden="true" style={{
                    width: senior ? 46 : 38, height: senior ? 46 : 38, borderRadius: 12, flexShrink: 0,
                    background: read ? C.lineSoft : C.brand + '14', color: read ? C.muteLight : C.brand,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon size={senior ? 22 : 18} /></span>

                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: t.title, fontWeight: 800, color: C.headline, letterSpacing: '-0.025em', lineHeight: 1.35 }}>{n.title}</span>
                      {!read && <Badge color={C.brand} soft={C.brand + '14'}>새 공지</Badge>}
                    </span>
                    <span style={{ display: 'block', fontSize: t.meta, color: C.navMute, marginTop: 5, fontWeight: 600 }}>
                      {fmtDate(noticeDatePart(n.myAt))}{time ? ` ${time}` : ''} · {channelLabel(n.myChannel)}{n.myResent ? ' · 재발송' : ''}
                    </span>
                    {!open && (
                      <span style={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        fontSize: t.body, color: C.inkSoft, marginTop: 7, lineHeight: 1.6,
                      }}>{n.body}</span>
                    )}
                  </span>

                  <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 3, color: read ? C.muteLight : C.brand }}>
                    {read ? <CheckCircle2 size={senior ? 20 : 16} /> : <span style={{ display: 'block', width: 9, height: 9, borderRadius: 5, background: C.brand }} />}
                  </span>
                </button>

                {open && (
                  <div id={`notice-body-${n.id}`} style={{
                    padding: senior ? '0 22px 22px 80px' : '0 18px 18px 68px',
                    fontSize: t.body, color: C.ink, lineHeight: 1.75, whiteSpace: 'pre-line',
                  }}>
                    {n.body}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.lineSoft}`, fontSize: t.meta, color: C.navMute, fontWeight: 600 }}>
                      보낸 사람 · {n.sent_by || '이음 코디네이터'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { NoticeInbox };
