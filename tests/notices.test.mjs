// 공지 수신함 유틸(notices.js) 테스트 — 참여자에게 "전달된 공지만" 보이고,
// 읽음 기록이 정확히 집계되는지 검증한다. 순수 함수라 DOM 없이 검증 가능.
import test from 'node:test';
import assert from 'node:assert/strict';
import { channelLabel, isNoticeRead, noticeDatePart, noticeTimePart, noticesForParticipant, unreadNoticeCount } from '../src/eum/notices.js';
import { SEED_DATA } from '../src/eum/seed.js';

const FIXTURE = [
  {
    id: 'x1', title: 'A', body: 'a', sent_at: '2027-07-01 10:00', sent_by: '코디',
    read_by: ['pA'],
    delivery: [
      { participant_id: 'pA', channel: 'kakao', status: 'delivered', at: '2027-07-01 10:00' },
      { participant_id: 'pB', channel: 'sms', status: 'failed', at: '2027-07-01 10:00' },
    ],
  },
  {
    id: 'x2', title: 'B', body: 'b', sent_at: '2027-07-28 09:30', sent_by: '코디',
    delivery: [
      { participant_id: 'pA', channel: 'sms', status: 'delivered', at: '2027-07-28 09:30', resent: true },
    ],
  },
];

test('noticesForParticipant: 전달된 공지만, 최신순으로 반환', () => {
  const mine = noticesForParticipant(FIXTURE, 'pA');
  assert.equal(mine.length, 2);
  assert.deepEqual(mine.map(n => n.id), ['x2', 'x1']); // 최신 발송이 위
  assert.equal(mine[0].myChannel, 'sms');
  assert.equal(mine[0].myResent, true);
});

test('noticesForParticipant: 미전달(failed) 수신자에게는 노출되지 않는다', () => {
  assert.equal(noticesForParticipant(FIXTURE, 'pB').length, 0);
  assert.equal(noticesForParticipant(FIXTURE, '없는사람').length, 0);
  assert.equal(noticesForParticipant(FIXTURE, null).length, 0);
  assert.equal(noticesForParticipant(undefined, 'pA').length, 0);
});

test('읽음 판정·미읽음 집계', () => {
  assert.equal(isNoticeRead(FIXTURE[0], 'pA'), true);
  assert.equal(isNoticeRead(FIXTURE[1], 'pA'), false); // read_by 필드 자체가 없어도 안전
  assert.equal(unreadNoticeCount(FIXTURE, 'pA'), 1);
  assert.equal(unreadNoticeCount(FIXTURE, 'pB'), 0); // 미전달자는 미읽음도 0
});

test('채널 라벨·발송시각 파싱', () => {
  assert.equal(channelLabel('kakao'), '카카오 알림톡');
  assert.equal(channelLabel('sms'), '문자');
  assert.equal(channelLabel('app'), '앱 알림');
  assert.equal(channelLabel('unknown'), '앱 알림'); // 미지의 채널도 앱 알림으로 안전 처리
  assert.equal(noticeDatePart('2027-07-01 10:00'), '2027-07-01');
  assert.equal(noticeTimePart('2027-07-01 10:00'), '10:00');
  assert.equal(noticeTimePart('2027-07-01'), '');
  assert.equal(noticeDatePart(null), '');
});

test('SEED 공지: 참여자 수신함이 실제로 채워진다(데모 무결성)', () => {
  assert.ok(SEED_DATA.notices.length >= 2);
  const senior = noticesForParticipant(SEED_DATA.notices, 'p101');
  assert.ok(senior.length >= 2, '어르신 p101은 공지 2건 이상 수신');
  // 전달된 수신자 id는 모두 실제 참여자여야 한다(끊긴 참조 방지)
  const ids = new Set(SEED_DATA.participants.map(p => p.id));
  for (const n of SEED_DATA.notices) {
    for (const d of n.delivery) assert.ok(ids.has(d.participant_id), `미확인 수신자 ${d.participant_id}`);
    for (const r of (n.read_by || [])) assert.ok(ids.has(r), `미확인 열람자 ${r}`);
  }
});
