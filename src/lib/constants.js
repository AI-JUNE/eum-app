// 운영 상수 — 가상 현재일 · 보험/인증/동의 정책 데이터
export const TODAY = '2027-07-15'; // 데모용 가상 현재 날짜

// ── 안전·신뢰 운영 데이터 (활성화) ───────────────────────────────────────────
// 돌봄 책임보험 — 1365 자원봉사보험 + 광주광역시 돌봄 특약 (활동 단위 자동 적용)
export const INSURANCE_POLICY = {
  insurer: '1365 자원봉사보험 + 광주광역시 돌봄 특약',
  policy_no: 'GJ-CARE-2027-0417',
  coverage_krw: 200000000,
  valid_from: '2027-04-01', valid_to: '2027-12-31',
  status: 'active',
};
// 공인 인증 발신 — 광주광역시 공식 알림톡 채널 (사칭·보이스피싱 차단)
export const CERTIFIED_SENDER = {
  channel: '광주광역시 공식 알림톡',
  sender_id: '@gwangju-eum',
  registered: true, status: 'active',
};
// 미성년 아동 보호자 동의 5종
export const CONSENT_DOCS = [
  { key: 'activity', label: '활동 참여 동의' },
  { key: 'privacy', label: '개인정보 수집·이용 동의' },
  { key: 'photo', label: '영상·사진 촬영 동의' },
  { key: 'emergency_medical', label: '응급의료 처치 동의' },
  { key: 'outdoor', label: '외부활동(공공공간) 동의' },
];
