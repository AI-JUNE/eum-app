// AI 매칭·복지추천 순수 로직(matching.js) 회귀 테스트.
// 목적: 점수 가중치·중복 배제·복지 추천 조건이 화면 변경과 무관하게 유지되는지 고정한다.
// 주의: 개인정보가 아닌 합성 데이터만 사용한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { aiDong, aiTrioScore, aiAutoTrios, aiWelfare } from '../src/eum/matching.js';

// --- 합성 픽스처(실데이터 아님) ---
const Y = { id: 'y1', type: 'youth', status: 'active', address: '광주 광산구 수완동 1', availability: ['월오후', '수오후'], skills: ['코딩교육'], interests: ['등산'], occupation: '개발자' };
const S = { id: 's1', type: 'senior', status: 'active', address: '광주 광산구 수완동 2', availability: ['월오후', '수오후'], skills: ['독서지도'], interests: ['등산'], occupation: '전직 교사' };
const C = { id: 'c1', type: 'child', status: 'active', address: '광주 광산구 수완동 3', interests: ['책'] };

test('aiDong: 주소에서 생활권(동) 추출, 없으면 빈 문자열', () => {
  assert.equal(aiDong('광주 광산구 수완동 123'), '수완동');
  assert.equal(aiDong('광주 광산구 하남동'), '하남동');
  assert.equal(aiDong('광주 광산구'), '');
  assert.equal(aiDong(null), '');
  assert.equal(aiDong(undefined), '');
});

test('aiTrioScore: 인원이 비면 0점·빈 배열(방어)', () => {
  for (const args of [[null, S, C], [Y, null, C], [Y, S, null]]) {
    const r = aiTrioScore(...args);
    assert.equal(r.total, 0);
    assert.deepEqual(r.parts, []);
    assert.deepEqual(r.tags, []);
  }
});

test('aiTrioScore: 반환 구조 — total 0~100 정수, parts 5항목 가중치 고정', () => {
  const r = aiTrioScore(Y, S, C);
  assert.ok(Number.isInteger(r.total) && r.total >= 0 && r.total <= 100);
  assert.equal(r.parts.length, 5);
  assert.deepEqual(r.parts.map(p => p.k), ['proximity', 'schedule', 'synergy', 'safety', 'complement']);
  assert.deepEqual(r.parts.map(p => p.w), [24, 20, 30, 16, 10]);
  for (const p of r.parts) {
    assert.ok(p.label && p.label.length > 0);
    assert.ok(Number.isInteger(p.v) && p.v >= 0 && p.v <= 100);
  }
});

test('aiTrioScore: 같은 동 3인이면 근접도 만점, 멀어지면 낮아진다', () => {
  const same = aiTrioScore(Y, S, C);
  assert.equal(same.parts.find(p => p.k === 'proximity').v, 100);
  assert.ok(same.tags.some(t => t[0] === '근접도' && t[1].includes('수완동')));

  // 어르신·아이만 같은 동
  const farY = aiTrioScore({ ...Y, address: '광주 북구 운암동 5' }, S, C);
  assert.equal(farY.parts.find(p => p.k === 'proximity').v, 78);

  // 청년·어르신만 같은 구(구 단위 매칭)
  const gu = aiTrioScore(Y, { ...S, address: '광주 광산구 하남동 9' }, { ...C, address: '광주 북구 운암동 3' });
  assert.equal(gu.parts.find(p => p.k === 'proximity').v, 50);

  // 아무 접점 없음
  const none = aiTrioScore({ ...Y, address: '서울 강남구' }, { ...S, address: '부산 해운대구' }, { ...C, address: '대전 유성구' });
  assert.equal(none.parts.find(p => p.k === 'proximity').v, 30);
});

test('aiTrioScore: 시간 겹침 2개↑ 만점 / 1개 / 0개 단계', () => {
  const two = aiTrioScore(Y, S, C).parts.find(p => p.k === 'schedule').v;
  const one = aiTrioScore(Y, { ...S, availability: ['월오후'] }, C).parts.find(p => p.k === 'schedule').v;
  const zero = aiTrioScore(Y, { ...S, availability: ['금오전'] }, C).parts.find(p => p.k === 'schedule').v;
  assert.equal(two, 100);
  assert.equal(one, 72);
  assert.equal(zero, 34);
  assert.ok(two > one && one > zero);
});

test('aiTrioScore: 아이 관심사와 멘토 역량이 이어지면 시너지가 오른다', () => {
  const withSyn = aiTrioScore(Y, S, C); // 아이 '책' ↔ 어르신 '독서지도'
  const noSyn = aiTrioScore(Y, { ...S, skills: ['목공'], interests: [] }, { ...C, interests: ['축구'] });
  assert.ok(withSyn.parts.find(p => p.k === 'synergy').v > noSyn.parts.find(p => p.k === 'synergy').v);
  assert.ok(withSyn.tags.some(t => t[0] === '시너지' && t[1].includes('책')));
});

test('aiTrioScore: 안전 — 미검증 상태면 점수·문구가 낮아진다', () => {
  const ok = aiTrioScore(Y, S, C);
  assert.ok(ok.tags.some(t => t[0] === '안전' && t[1].includes('완료')));
  const pending = aiTrioScore({ ...Y, status: 'verifying' }, { ...S, status: 'verifying' }, C);
  assert.ok(pending.parts.find(p => p.k === 'safety').v < ok.parts.find(p => p.k === 'safety').v);
  assert.ok(pending.tags.some(t => t[0] === '안전' && t[1].includes('진행 중')));
});

test('aiTrioScore: 세대보완 — 교사+책, 전문직 청년 가산', () => {
  const base = aiTrioScore({ ...Y, occupation: '무직' }, { ...S, occupation: '자영업' }, { ...C, interests: ['축구'] });
  const boosted = aiTrioScore(Y, S, C); // 개발자 + 전직 교사 + 책
  assert.ok(boosted.parts.find(p => p.k === 'complement').v > base.parts.find(p => p.k === 'complement').v);
});

test('aiTrioScore: 태그는 중복 문구 없이 유일하다', () => {
  const r = aiTrioScore(Y, { ...S, skills: ['독서지도', '학습멘토'] }, { ...C, interests: ['책', '책'] });
  const msgs = r.tags.map(t => t[1]);
  assert.equal(msgs.length, new Set(msgs).size);
});

test('aiAutoTrios: 상위 조합을 점수 내림차순으로, 인원 중복 없이 낸다', () => {
  const ys = [Y, { ...Y, id: 'y2', address: '서울 강남구', availability: ['금오전'], occupation: '무직' }];
  const ss = [S, { ...S, id: 's2', address: '부산 해운대구', availability: ['금오전'], skills: [], interests: [], occupation: '자영업' }];
  const cs = [C, { ...C, id: 'c2', address: '대전 유성구', interests: ['축구'] }];
  const out = aiAutoTrios(ys, ss, cs, 2);
  assert.equal(out.length, 2);
  assert.ok(out[0].total >= out[1].total);
  assert.equal(new Set(out.map(o => o.y.id)).size, 2);
  assert.equal(new Set(out.map(o => o.s.id)).size, 2);
  assert.equal(new Set(out.map(o => o.c.id)).size, 2);
  assert.equal(out[0].y.id, 'y1'); // 최고 점수 조합이 먼저
});

test('aiAutoTrios: max 기본 3, 후보 부족·빈 입력 방어', () => {
  const many = (n, base, pre) => Array.from({ length: n }, (_, i) => ({ ...base, id: pre + i }));
  const out = aiAutoTrios(many(5, Y, 'y'), many(5, S, 's'), many(5, C, 'c'));
  assert.equal(out.length, 3);
  assert.deepEqual(aiAutoTrios([], [], []), []);
  assert.deepEqual(aiAutoTrios(null, null, null), []);
  assert.deepEqual(aiAutoTrios([Y], [S], []), []);
});

test('aiWelfare: 65세 이상 기본 추천(노인맞춤돌봄·통합돌봄)', () => {
  const r = aiWelfare({ age: 72, gets: [], income: '일반' });
  const names = r.map(x => x.name);
  assert.ok(names.some(n => n.includes('노인맞춤돌봄')));
  assert.ok(names.some(n => n.includes('통합돌봄')));
  for (const x of r) {
    assert.ok(x.name && x.why && x.benefit && x.where);
    assert.equal(typeof x.gap, 'boolean');
  }
});

test('aiWelfare: 이미 받는 급여는 사각지대(gap)가 아니다', () => {
  const r = aiWelfare({ age: 72, gets: ['노인맞춤돌봄', '기초연금'], income: '저소득' });
  assert.equal(r.find(x => x.name.startsWith('노인맞춤돌봄')).gap, false);
  assert.equal(r.find(x => x.name === '기초연금').gap, false);
});

test('aiWelfare: 독거·저소득·디지털취약 조건별 추가 추천', () => {
  const alone = aiWelfare({ age: 80, alone: true, gets: [], income: '일반' });
  assert.ok(alone.some(x => x.name.includes('응급안전안심')));
  const low = aiWelfare({ age: 70, gets: [], income: '저소득' });
  assert.ok(low.some(x => x.name === '기초연금'));
  assert.ok(low.some(x => x.name.includes('생계·의료급여')));
  const digital = aiWelfare({ age: 70, gets: [], income: '일반', digitalWeak: true });
  assert.ok(digital.some(x => x.name.includes('디지털 배움터')));
});

test('aiWelfare: 65세 미만은 노인 대상 급여를 추천하지 않는다', () => {
  const r = aiWelfare({ age: 30, gets: [], income: '일반', careNeed: true, familyCareYouth: true });
  const names = r.map(x => x.name);
  assert.ok(!names.some(n => n.includes('노인맞춤돌봄')));
  assert.ok(!names.includes('기초연금'));
  assert.ok(names.some(n => n.includes('일상돌봄')));
  assert.ok(names.some(n => n.includes('가족돌봄청년')));
});

test('aiWelfare: 해당 조건이 없으면 빈 배열(허위 추천 없음)', () => {
  assert.deepEqual(aiWelfare({ age: 45, gets: [], income: '일반' }), []);
});
