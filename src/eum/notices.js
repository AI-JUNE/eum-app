// ============================================================================
// 공지 수신함 유틸 (참여자 관점) — additive, 순수 함수만
//   코디네이터가 발송한 state.notices(백로그 #2)를 "받는 사람" 관점으로 뒤집는다.
//   기존 리듀서/SEED/코디 로직은 건드리지 않는다. 신규 개인정보 수집 없음.
// ============================================================================

// 발송 채널 표기 — 코디 화면과 동일한 어휘를 참여자 화면에서도 쓴다.
export const CHANNEL_LABEL = { kakao: '카카오 알림톡', sms: '문자', app: '앱 알림' };

export function channelLabel(ch) {
  return CHANNEL_LABEL[ch] || '앱 알림';
}

// 참여자 본인에게 "실제로 전달된" 공지만 반환한다.
//   - delivery에 본인 항목이 있고 status === 'delivered' 인 것만 노출
//   - 미전달(failed)은 수신함에 뜨지 않는다(재발송으로 delivered가 되면 그때 노출)
//   - 최신 발송순 정렬. 원본 객체는 변형하지 않고 myChannel/myAt만 덧붙인다.
export function noticesForParticipant(notices, participantId) {
  if (!participantId) return [];
  const out = [];
  (notices || []).forEach((n) => {
    const mine = (n.delivery || []).find((d) => d.participant_id === participantId);
    if (!mine || mine.status !== 'delivered') return;
    out.push({ ...n, myChannel: mine.channel, myAt: mine.at || n.sent_at, myResent: !!mine.resent });
  });
  return out.sort((a, b) => String(b.myAt || '').localeCompare(String(a.myAt || '')));
}

// 읽음 여부 — read_by(참여자 id 배열)는 MARK_NOTICE_READ로만 늘어나는 추가 필드.
export function isNoticeRead(notice, participantId) {
  return !!notice && (notice.read_by || []).includes(participantId);
}

export function unreadNoticeCount(notices, participantId) {
  return noticesForParticipant(notices, participantId).filter((n) => !isNoticeRead(n, participantId)).length;
}

// '2027-07-01 10:00' → '2027-07-01' (fmtDate 입력용). 날짜만 있는 값도 그대로 통과.
export function noticeDatePart(at) {
  return String(at || '').split(' ')[0];
}

// '2027-07-01 10:00' → '10:00'. 시각이 없으면 빈 문자열.
export function noticeTimePart(at) {
  const parts = String(at || '').split(' ');
  return parts.length > 1 ? parts[1] : '';
}
