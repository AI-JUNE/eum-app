import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users, UserCheck, Calendar, Award, AlertTriangle, Heart, ShieldCheck,
  Sparkles, ChevronRight, ChevronLeft, ChevronDown, Check, X, Plus, Search,
  Bell, MessageCircle, MapPin, Clock, FileText, Settings, LogOut, Home,
  BookOpen, Coffee, GraduationCap, Camera, Phone, Send, Edit3, Trash2,
  Filter, Download, ArrowRight, ArrowUpRight, Star, TrendingUp, Loader2,
  CheckCircle2, AlertCircle, Eye, EyeOff, Menu, Smile, ThumbsUp, Activity,
  ClipboardCheck, FileSignature, Wallet, ShieldAlert, Megaphone, Info,
  ChevronUp, UserPlus, PenLine, Upload, Hash, Mail, MapPinned, Cake, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

// ============================================================================
// 1. DESIGN TOKENS
// ============================================================================

const C = {
  brand: '#C75D3C',
  brandDark: '#A04826',
  brandSoft: '#F7E9E1',
  brandBg: '#FCF3EE',
  brandLight: '#E0936B',
  ink: '#1A1814',
  inkSoft: '#4A4540',
  mute: '#8A847A',
  muteSoft: '#EFEBE3',
  success: '#5F8556',
  successSoft: '#E8EFE3',
  cream: '#FAF7F2',
  bg: '#F6F2EB',
  card: '#FFFFFF',
  border: '#E8E2D6',
  borderSoft: '#F0EBE0',
  sage: '#5F8556',
  sageSoft: '#E8EFE3',
  lavender: '#7F6FA0',
  lavenderSoft: '#EDE9F2',
  peach: '#D89368',
  peachSoft: '#F8EBDD',
  gold: '#B8884A',
  goldSoft: '#F2E8D6',
  red: '#C74848',
  redSoft: '#F8E4E4',
  blue: '#4A6FA5',
  blueSoft: '#E4EBF3',
  amber: '#D9A441',
  amberSoft: '#F7EDD3',
};

const PERSONA = {
  youth: { label: '청년', color: C.sage, soft: C.sageSoft, ring: 'rgba(95,133,86,0.25)' },
  senior: { label: '어르신', color: C.lavender, soft: C.lavenderSoft, ring: 'rgba(127,111,160,0.25)' },
  parent: { label: '양육가정', color: C.peach, soft: C.peachSoft, ring: 'rgba(216,147,104,0.25)' },
  child: { label: '아동', color: C.peach, soft: C.peachSoft, ring: 'rgba(216,147,104,0.25)' },
  coordinator: { label: '코디네이터', color: C.ink, soft: '#EDEAE5', ring: 'rgba(26,24,20,0.15)' },
};

const FONT_STACK = `-apple-system, BlinkMacSystemFont, "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;
const SERIF_STACK = `"Source Serif Pro", "Noto Serif KR", Georgia, serif`;

// ============================================================================
// 2. SEED DATA
// ============================================================================

const TODAY = '2027-07-15'; // 데모용 가상 현재 날짜

// 신청별 검증 단계 생성기 (코디 관제실 schema)
const VERIF_STEPS = {
  youth: ['interview', 'criminal_record', 'abuse_record', 'reference'],
  senior: ['interview', 'criminal_record', 'abuse_record', 'reference'],
  parent: ['interview', 'guardian_consent', 'document'],
};
const STEP_NOTE = {
  interview: '대면 면접·오리엔테이션 완료', criminal_record: '경찰청 범죄경력 회보 확인',
  abuse_record: '아동학대 전력 조회 확인', reference: '추천인 통화 완료',
  guardian_consent: '보호자 동의서 5종 수령', document: '재직·신분 서류 확인',
};
let _vfSeq = 0;
function buildVerifs(appId, type, statusMap) {
  return (VERIF_STEPS[type] || []).map((step) => {
    const status = statusMap[step] || 'pending';
    _vfSeq += 1;
    return {
      id: `vf${String(_vfSeq).padStart(3, '0')}`, application_id: appId, step, status,
      verified_by: status === 'passed' ? '코디 한가은' : null,
      verified_at: status === 'passed' ? '2027-04-10' : null,
      note: status === 'passed' ? STEP_NOTE[step] : status === 'in_progress' ? '진행 중 (회신 대기)' : status === 'failed' ? '결격 사유 확인' : '대기',
    };
  });
}
const ALL_PASS = (type) => Object.fromEntries((VERIF_STEPS[type] || []).map((s) => [s, 'passed']));

const SEED_DATA = {
  participants: [
    // 청년 5명
    { id: 'p001', name: '김민준', type: 'youth', age: 27, phone: '010-1234-5678', address: '강서구 우장산동', emergency_contact: '010-9876-5432 (부친)', occupation: '스타트업 개발자', skills: ['디지털코칭', '학습멘토', '코딩교육'], interests: ['IT', '진로상담', '여행'], availability: ['평일저녁', '토요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-15', bio: '마곡 스타트업 2년차 개발자. 어르신께 IT를, 아이들에게 코딩을 가르쳐드리고 싶어요.' },
    { id: 'p002', name: '이지원', type: 'youth', age: 25, phone: '010-2345-6789', address: '강서구 우장산동', emergency_contact: '010-1111-2222 (모친)', occupation: '대학원생', skills: ['학습멘토', '글쓰기', '독서지도'], interests: ['교육', '문학', '심리'], availability: ['평일저녁', '주말'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-18', bio: '교육학 석사과정. 아이들과 책 읽고 글쓰기를 함께하고 싶어요.' },
    { id: 'p003', name: '박서준', type: 'youth', age: 29, phone: '010-3456-7890', address: '강서구 화곡동', emergency_contact: '010-3333-4444 (형)', occupation: '디자이너', skills: ['디지털코칭', '예술교육', '사진'], interests: ['디자인', '사진', '카페'], availability: ['토요일', '일요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-20', bio: 'UX 디자이너. 어르신께 스마트폰 사진을, 아이들에게 그림을 가르쳐요.' },
    { id: 'p004', name: '최예린', type: 'youth', age: 26, phone: '010-4567-8901', address: '강서구 우장산동', emergency_contact: '010-5555-6666 (모친)', occupation: '간호사', skills: ['건강관리', '응급처치', '돌봄'], interests: ['건강', '운동', '요리'], availability: ['평일저녁'], status: 'pending_match', avatar_color: C.sage, joined_at: '2027-04-01', bio: '대학병원 간호사. 어르신 건강 케어와 아이 안전에 강점이 있어요.' },
    { id: 'p005', name: '정태윤', type: 'youth', age: 28, phone: '010-5678-9012', address: '강서구 등촌동', emergency_contact: '010-7777-8888 (모친)', occupation: '회계사', skills: ['학습멘토', '수학교육'], interests: ['경제', '독서', '러닝'], availability: ['평일저녁', '토요일'], status: 'verifying', avatar_color: C.sage, joined_at: '2027-05-12', bio: '회계사. 아이들에게 수학과 경제 개념을 쉽게 알려주고 싶어요.' },
    { id: 'p006', name: '강도현', type: 'youth', age: 24, phone: '010-6789-0123', address: '강서구 우장산동', emergency_contact: '010-9090-1212 (부친)', occupation: '대학생 (체육교육)', skills: ['체육지도', '학습멘토', '돌봄'], interests: ['운동', '축구', '게임'], availability: ['주말', '평일저녁'], status: 'verifying', avatar_color: C.sage, joined_at: '2027-05-20', bio: '체육교육과 4학년. 아이들과 몸으로 노는 활동, 어르신 가벼운 운동 코칭에 자신 있어요.' },

    // 어르신 5명
    { id: 'p101', name: '박순자', type: 'senior', age: 73, phone: '010-1111-1111', address: '강서구 우장산동 (42년 거주)', emergency_contact: '010-2222-3333 (딸)', occupation: '前 초등학교 교사', skills: ['독서지도', '서예', '동화구연'], interests: ['손주', '드라마', '꽃'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-16', bio: '40년 교직 생활. 손주 같은 아이에게 옛이야기 들려주고 싶어요.' },
    { id: 'p102', name: '김복례', type: 'senior', age: 78, phone: '010-2222-2222', address: '강서구 우장산동 (30년 거주)', emergency_contact: '010-4444-5555 (아들)', occupation: '前 봉제공장 운영', skills: ['바느질', '뜨개질', '요리'], interests: ['요리', '드라마', '산책'], availability: ['평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-22', bio: '평생 봉제일. 아이들에게 손바느질을 가르쳐주고 싶어요.' },
    { id: 'p103', name: '이병호', type: 'senior', age: 71, phone: '010-3333-3333', address: '강서구 우장산동', emergency_contact: '010-6666-7777 (딸)', occupation: '前 공무원', skills: ['역사이야기', '바둑', '서예'], interests: ['역사', '바둑', '등산'], availability: ['평일오전', '토요일'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-25', bio: '공무원 40년 정년퇴직. 청년들에게 인생 조언을, 아이들에게 역사 이야기를 들려주고 싶어요.' },
    { id: 'p104', name: '정금자', type: 'senior', age: 75, phone: '010-4444-4444', address: '강서구 우장산동', emergency_contact: '010-8888-9999 (며느리)', occupation: '前 동네 식당 운영', skills: ['요리', '한식', '이야기'], interests: ['요리', '드라마', '꽃밭'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-28', bio: '평생 식당. 아이들에게 손맛 김치 담그기를 가르쳐주고 싶어요.' },
    { id: 'p105', name: '윤석철', type: 'senior', age: 70, phone: '010-5555-5555', address: '강서구 우장산동', emergency_contact: '010-0000-1111 (아들)', occupation: '前 자영업', skills: ['장기', '한자', '경험담'], interests: ['장기', '뉴스', '걷기'], availability: ['평일오전'], status: 'pending_match', avatar_color: C.lavender, joined_at: '2027-04-05', bio: '동네 토박이. 청년에게 사업 경험을 나누고 아이와 장기 두고 싶어요.' },
    { id: 'p106', name: '서말순', type: 'senior', age: 76, phone: '010-6666-1212', address: '강서구 우장산동 (50년 거주)', emergency_contact: '010-3434-5656 (딸)', occupation: '前 한복집 운영', skills: ['한복', '바느질', '옛이야기'], interests: ['드라마', '화초', '손주'], availability: ['평일오전', '평일오후'], status: 'verifying', avatar_color: C.lavender, joined_at: '2027-05-18', bio: '한복 짓는 일을 50년 했어요. 아이들에게 우리 옷의 아름다움을 알려주고 싶어요.' },

    // 양육가정 3가구
    { id: 'p201', name: '이서영', type: 'parent', age: 38, phone: '010-6666-7777', address: '강서구 우장산동', emergency_contact: '010-1010-2020 (배우자)', occupation: 'IT기업 PM (마곡)', skills: [], interests: [], availability: ['평일 저녁 7시 이후 픽업 가능'], status: 'active', avatar_color: C.peach, joined_at: '2027-03-19', child_id: 'p301', bio: '맞벌이라 퇴근 후 아이 돌봄 공백이 늘 걱정이에요.' },
    { id: 'p202', name: '한지영', type: 'parent', age: 35, phone: '010-7777-8888', address: '강서구 우장산동', emergency_contact: '010-3030-4040 (시어머니)', occupation: '간호사', skills: [], interests: [], availability: ['교대근무'], status: 'active', avatar_color: C.peach, joined_at: '2027-03-26', child_id: 'p302', bio: '교대근무라 정해진 픽업 시간이 어려워요. 안전한 공간에서 다양한 어른과 만나길 바라요.' },
    { id: 'p203', name: '김혜진', type: 'parent', age: 40, phone: '010-8888-9999', address: '강서구 우장산동', emergency_contact: '010-5050-6060 (배우자)', occupation: '교사', skills: [], interests: [], availability: ['주중 하원 후 ~ 저녁 6시'], status: 'active', avatar_color: C.peach, joined_at: '2027-04-02', child_id: 'p303', bio: '아이가 외동이라 다양한 세대와의 교류가 절실해요.' },

    // 아동 3명
    { id: 'p301', name: '김유진', type: 'child', age: 8, phone: '', address: '강서구 우장산동', emergency_contact: '010-6666-7777 (모친 이서영)', occupation: '초2', skills: [], interests: ['그림', '책', '강아지'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-03-19', parent_id: 'p201', bio: '책 읽기를 좋아하고 그림 그리는 걸 즐겨요.' },
    { id: 'p302', name: '한도윤', type: 'child', age: 9, phone: '', address: '강서구 우장산동', emergency_contact: '010-7777-8888 (모친 한지영)', occupation: '초3', skills: [], interests: ['로봇', '레고', '축구'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-03-26', parent_id: 'p202', bio: '레고와 로봇을 좋아하고 축구를 잘해요.' },
    { id: 'p303', name: '김지안', type: 'child', age: 7, phone: '', address: '강서구 우장산동', emergency_contact: '010-8888-9999 (모친 김혜진)', occupation: '초1', skills: [], interests: ['공룡', '책', '노래'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-04-02', parent_id: 'p203', bio: '공룡에 푹 빠져 있고 노래 부르기를 좋아해요.' },

    // 코디네이터 1명
    { id: 'cdn001', name: '한가은', type: 'coordinator', age: 34, phone: '010-2345-6789', address: '강서구 우장산동', emergency_contact: '010-1212-3434 (배우자)', occupation: '우장산동 운영 코디네이터', skills: ['운영', '상담', '안전관리'], interests: [], availability: ['평일 9~21시', '주말 10~18시'], status: 'active', avatar_color: C.ink, joined_at: '2027-02-20', bio: '사회복지사 출신 코디네이터. 신청·검증·매칭·정산·안전을 한 손에 챙깁니다.' },
  ],

  applications: [
    // 활동 시작 (completed)
    { id: 'a001', participant_id: 'p001', type: 'youth', status: 'completed', applied_at: '2027-03-14', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a002', participant_id: 'p002', type: 'youth', status: 'completed', applied_at: '2027-03-18', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a003', participant_id: 'p003', type: 'youth', status: 'completed', applied_at: '2027-03-20', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a004', participant_id: 'p101', type: 'senior', status: 'completed', applied_at: '2027-03-15', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a005', participant_id: 'p102', type: 'senior', status: 'completed', applied_at: '2027-03-22', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a006', participant_id: 'p103', type: 'senior', status: 'completed', applied_at: '2027-03-25', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a007', participant_id: 'p201', type: 'parent', status: 'completed', applied_at: '2027-03-19', consent_data: true, consent_photo: true, consent_criminal: false, consent_guardian: true },
    { id: 'a008', participant_id: 'p202', type: 'parent', status: 'completed', applied_at: '2027-03-26', consent_data: true, consent_photo: true, consent_criminal: false, consent_guardian: true },
    { id: 'a009', participant_id: 'p203', type: 'parent', status: 'completed', applied_at: '2027-04-02', consent_data: true, consent_photo: true, consent_criminal: false, consent_guardian: true },
    // 검증 완료 · 매칭 대기 (verified)
    { id: 'a010', participant_id: 'p004', type: 'youth', status: 'verified', applied_at: '2027-03-31', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a011', participant_id: 'p105', type: 'senior', status: 'verified', applied_at: '2027-04-05', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    // 서류 검토 중 (screening)
    { id: 'a012', participant_id: 'p005', type: 'youth', status: 'screening', applied_at: '2027-05-11', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a013', participant_id: 'p006', type: 'youth', status: 'screening', applied_at: '2027-05-20', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
    { id: 'a014', participant_id: 'p106', type: 'senior', status: 'screening', applied_at: '2027-05-18', consent_data: true, consent_photo: true, consent_criminal: true, consent_guardian: false },
  ],

  verifications: [
    ...buildVerifs('a001', 'youth', ALL_PASS('youth')),
    ...buildVerifs('a002', 'youth', ALL_PASS('youth')),
    ...buildVerifs('a003', 'youth', ALL_PASS('youth')),
    ...buildVerifs('a004', 'senior', ALL_PASS('senior')),
    ...buildVerifs('a005', 'senior', ALL_PASS('senior')),
    ...buildVerifs('a006', 'senior', ALL_PASS('senior')),
    ...buildVerifs('a007', 'parent', ALL_PASS('parent')),
    ...buildVerifs('a008', 'parent', ALL_PASS('parent')),
    ...buildVerifs('a009', 'parent', ALL_PASS('parent')),
    ...buildVerifs('a010', 'youth', ALL_PASS('youth')),
    ...buildVerifs('a011', 'senior', ALL_PASS('senior')),
    ...buildVerifs('a012', 'youth', { interview: 'passed', criminal_record: 'in_progress', abuse_record: 'in_progress', reference: 'pending' }),
    ...buildVerifs('a013', 'youth', { interview: 'passed', criminal_record: 'pending', abuse_record: 'pending', reference: 'pending' }),
    ...buildVerifs('a014', 'senior', { interview: 'in_progress', criminal_record: 'pending', abuse_record: 'pending', reference: 'pending' }),
  ],

  matches: [
    { id: 'm001', youth_id: 'p001', senior_id: 'p101', child_id: 'p301', match_notes: '청년-어르신 모두 우장산동 거주. 어르신은 교사 출신, 청년은 IT — 디지털 코칭 시너지. 아동은 책·그림 좋아함.', coordinator_note: '청년-어르신 모두 우장산동 거주. 어르신은 교사 출신, 청년은 IT — 디지털 코칭 시너지. 아동은 책·그림 좋아함. 활발하게 진행 중이며 별 이슈 없음.', score: 92, status: 'active', started_at: '2027-05-01', ended_at: null },
    { id: 'm002', youth_id: 'p002', senior_id: 'p102', child_id: 'p302', match_notes: '대학원생 청년-어르신 모두 손글씨/바느질 관심. 아동은 만들기 좋아함.', coordinator_note: '대학원생 청년-어르신 모두 손글씨/바느질 관심. 아동은 만들기 좋아함. 도윤이 학습 성취가 눈에 띄게 향상.', score: 88, status: 'active', started_at: '2027-05-01', ended_at: null },
    { id: 'm003', youth_id: 'p003', senior_id: 'p103', child_id: 'p303', match_notes: '디자이너 청년-역사 좋아하는 어르신. 아동은 공룡, 호기심 많음.', coordinator_note: '디자이너 청년-역사 좋아하는 어르신. 아동은 공룡, 호기심 많음. 어르신의 역사 이야기와 아이 호기심이 잘 맞음.', score: 85, status: 'active', started_at: '2027-05-08', ended_at: null },
  ],

  activities: [
    // m001 매칭의 활동들
    { id: 'act001', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-05-08 14:00', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act002', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-05-08 15:30', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act003', match_id: 'm001', type: '진로조언받기', scheduled_at: '2027-05-22 14:00', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act004', match_id: 'm001', type: '기억아카이브', scheduled_at: '2027-05-22 15:30', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act005', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-06-05 14:00', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act006', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-06-05 15:30', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act007', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-06-19 14:00', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act008', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-06-19 15:30', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act009', match_id: 'm001', type: '진로조언받기', scheduled_at: '2027-07-03 14:00', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act010', match_id: 'm001', type: '기억아카이브', scheduled_at: '2027-07-03 15:30', duration_hours: 1.5, location: '우장산도서관 2층', status: 'completed' },
    { id: 'act011', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-07-17 14:00', duration_hours: 1.5, location: '우장산도서관 2층', status: 'scheduled' },
    { id: 'act012', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-07-17 15:30', duration_hours: 1.5, location: '우장산도서관 2층', status: 'scheduled' },

    { id: 'act101', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-05-09 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act102', match_id: 'm002', type: '학습멘토', scheduled_at: '2027-05-09 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act103', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-05-23 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act104', match_id: 'm002', type: '학습멘토', scheduled_at: '2027-05-23 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act105', match_id: 'm002', type: '진로조언받기', scheduled_at: '2027-06-06 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act106', match_id: 'm002', type: '기억아카이브', scheduled_at: '2027-06-06 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act107', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-07-04 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act108', match_id: 'm002', type: '학습멘토', scheduled_at: '2027-07-04 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act109', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-07-18 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'scheduled' },

    { id: 'act201', match_id: 'm003', type: '디지털코칭', scheduled_at: '2027-05-15 13:00', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act202', match_id: 'm003', type: '학습멘토', scheduled_at: '2027-05-15 14:30', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act203', match_id: 'm003', type: '진로조언받기', scheduled_at: '2027-05-29 13:00', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act204', match_id: 'm003', type: '기억아카이브', scheduled_at: '2027-05-29 14:30', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act205', match_id: 'm003', type: '디지털코칭', scheduled_at: '2027-06-12 13:00', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act206', match_id: 'm003', type: '학습멘토', scheduled_at: '2027-06-12 14:30', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act207', match_id: 'm003', type: '디지털코칭', scheduled_at: '2027-07-10 13:00', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
    { id: 'act208', match_id: 'm003', type: '학습멘토', scheduled_at: '2027-07-10 14:30', duration_hours: 1.5, location: '우장산도서관 1층', status: 'completed' },
  ],

  activity_logs: [
    { id: 'log001', activity_id: 'act001', participant_id: 'p001', hours: 1.5, summary: '박순자 어르신과 카카오톡 이모티콘·송금 기능 익히기. 처음엔 화면이 너무 작아 답답해하셨는데, 글자 크기 키우는 법 알려드리니 환하게 웃으셨다. "이제 손녀랑 톡 할 수 있겠다"고 하심.', approved: true, approved_at: '2027-05-09', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log002', activity_id: 'act001', participant_id: 'p101', hours: 1.5, summary: '민준 청년이 친절히 알려줘서 너무 고맙다. 손녀에게 자랑할 수 있어 행복하다.', approved: true, approved_at: '2027-05-09', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log003', activity_id: 'act002', participant_id: 'p001', hours: 1.5, summary: '유진이와 그림책 함께 읽기. 어려운 한자어가 나와서 박순자 어르신께 여쭤보니 옛이야기 풀어주셨다. 아이가 눈을 반짝이며 듣는 모습이 인상적.', approved: true, approved_at: '2027-05-09', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log004', activity_id: 'act003', participant_id: 'p001', hours: 1.5, summary: '박순자 어르신께 진로 고민(이직 vs 잔류) 상담. "사람은 자기를 알아주는 곳에 머무는 거야"는 말씀이 가슴에 박혔다. 평생 교직 경험에서 우러난 조언이 깊었다.', approved: true, approved_at: '2027-05-23', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log005', activity_id: 'act004', participant_id: 'p101', hours: 1.5, summary: '40년 전 우장산동 얘기 — 도로가 비포장이었던 시절, 공항 가는 길이 논밭이었다는 얘기. 민준이가 녹음하고 정리해주겠다고 함.', approved: true, approved_at: '2027-05-23', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log006', activity_id: 'act005', participant_id: 'p001', hours: 1.5, summary: '키오스크 실전 연습 — 우장산역 앞 빵집에서 직접 주문. 어르신이 처음으로 혼자 결제 성공! 박수쳐드렸더니 "내가 다 했어!" 하며 웃으심.', approved: true, approved_at: '2027-06-06', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log007', activity_id: 'act007', participant_id: 'p001', hours: 1.5, summary: '병원 앱 예약, 약국 처방조회 앱 설치. 어르신이 본인 진료 일정을 직접 관리하실 수 있게 됨.', approved: true, approved_at: '2027-06-20', approved_by: '코디 한가은', has_photo: false, mood: 4 },
    { id: 'log008', activity_id: 'act008', participant_id: 'p001', hours: 1.5, summary: '유진이 수학 — 분수 개념. 박순자 어르신이 떡 자르며 설명해주신 게 압권. 아이가 "할머니 짱이야"라고 함.', approved: true, approved_at: '2027-06-20', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log009', activity_id: 'act009', participant_id: 'p001', hours: 1.5, summary: '이직 결정 보고. 어르신이 본인 일처럼 기뻐해주심. "사람 인연이 진짜 자산이다" 말씀하심.', approved: true, approved_at: '2027-07-04', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log010', activity_id: 'act010', participant_id: 'p101', hours: 1.5, summary: '우장산동 옛 시장 이야기. 민준이가 사진을 보여주며 지금과 비교해줌. 동네 변화가 한눈에 보임.', approved: true, approved_at: '2027-07-04', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log011', activity_id: 'act011', participant_id: 'p001', hours: 1.5, summary: '오늘은 어르신 폰에 음성인식 받아쓰기 설정. 손주에게 보낼 긴 문자를 말로 쉽게 적게 되심.', approved: false, approved_at: null, approved_by: null, has_photo: true, mood: 5 },

    { id: 'log101', activity_id: 'act101', participant_id: 'p002', hours: 1.5, summary: '김복례 어르신께 스마트폰 사진 정리법. 손주 사진 폴더를 만들어드리니 너무 좋아하심.', approved: true, approved_at: '2027-05-10', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log102', activity_id: 'act102', participant_id: 'p002', hours: 1.5, summary: '도윤이와 글쓰기 — 일기 한 편. 처음엔 한 줄도 못 쓰던 아이가 그림 곁들여 일기를 쓰게 됨.', approved: true, approved_at: '2027-05-10', approved_by: '코디 한가은', has_photo: true, mood: 4 },
    { id: 'log103', activity_id: 'act103', participant_id: 'p002', hours: 1.5, summary: '바이폰 결제 연습. 어르신이 시장에서 직접 결제 성공!', approved: true, approved_at: '2027-05-24', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log104', activity_id: 'act104', participant_id: 'p002', hours: 1.5, summary: '도윤이와 함께 그림책 읽고 독후감 쓰기.', approved: true, approved_at: '2027-05-24', approved_by: '코디 한가은', has_photo: true, mood: 4 },
    { id: 'log105', activity_id: 'act105', participant_id: 'p002', hours: 1.5, summary: '대학원 진학 상담. 어르신 경험으로 "한 우물 파라"는 말씀 들음.', approved: true, approved_at: '2027-06-07', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log106', activity_id: 'act106', participant_id: 'p102', hours: 1.5, summary: '내가 평생 한 바느질 이야기. 도윤이가 손바느질 직접 해보겠다고 함.', approved: true, approved_at: '2027-06-07', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log107', activity_id: 'act107', participant_id: 'p002', hours: 1.5, summary: '어르신께 유튜브 채널 구독·알림설정. 좋아하시는 트로트 채널을 즐겨찾기에.', approved: true, approved_at: '2027-07-05', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log108', activity_id: 'act108', participant_id: 'p002', hours: 1.5, summary: '도윤이 받아쓰기 — 80점에서 95점으로!', approved: false, approved_at: null, approved_by: null, has_photo: false, mood: 5 },

    { id: 'log201', activity_id: 'act201', participant_id: 'p003', hours: 1.5, summary: '이병호 어르신께 사진앱 사용법. 등산 사진을 잘 정리해드림.', approved: true, approved_at: '2027-05-16', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log202', activity_id: 'act202', participant_id: 'p003', hours: 1.5, summary: '지안이와 공룡 그림 그리기. 어르신께서 옛날 옛적 이야기 같은 톤으로 공룡 이야기 들려주심.', approved: true, approved_at: '2027-05-16', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log203', activity_id: 'act203', participant_id: 'p003', hours: 1.5, summary: '디자이너 진로 — 40년 공무원 어르신의 시각. "꾸준함이 재능을 이긴다" 말씀이 큰 울림.', approved: true, approved_at: '2027-05-30', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log204', activity_id: 'act204', participant_id: 'p103', hours: 1.5, summary: '강서구 옛 모습 — 김포공항 너머 들판이었던 시절. 지안이가 흥미진진하게 들음.', approved: true, approved_at: '2027-05-30', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log205', activity_id: 'act205', participant_id: 'p003', hours: 1.5, summary: '바둑 앱 설치하고 어르신께 알려드림. 어르신이 도리어 나에게 바둑 한 수 가르쳐주심.', approved: true, approved_at: '2027-06-13', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log206', activity_id: 'act206', participant_id: 'p003', hours: 1.5, summary: '지안이 한글 받침 — 어르신이 한자 어원으로 설명해주시니 아이가 쏙쏙 흡수.', approved: true, approved_at: '2027-06-13', approved_by: '코디 한가은', has_photo: true, mood: 4 },
    { id: 'log207', activity_id: 'act207', participant_id: 'p003', hours: 1.5, summary: '어르신과 유튜브 다큐 시청 후 토론. 디지털을 함께 즐기는 단계.', approved: false, approved_at: null, approved_by: null, has_photo: false, mood: 5 },
    { id: 'log208', activity_id: 'act208', participant_id: 'p003', hours: 1.5, summary: '지안이 책 읽기 — 공룡 다큐 책을 함께. 어휘력이 부쩍 늘었다.', approved: false, approved_at: null, approved_by: null, has_photo: true, mood: 5 },
  ],

  settlements: [
    { id: 's001', participant_id: 'p001', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A001', issued_at: '2027-06-01', status: 'paid' },
    { id: 's002', participant_id: 'p001', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A001', issued_at: '2027-07-01', status: 'paid' },
    { id: 's003', participant_id: 'p101', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A002', issued_at: '2027-06-01', status: 'paid' },
    { id: 's004', participant_id: 'p101', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A002', issued_at: '2027-07-01', status: 'paid' },
    { id: 's005', participant_id: 'p002', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A003', issued_at: '2027-06-01', status: 'paid' },
    { id: 's006', participant_id: 'p002', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A003', issued_at: '2027-07-01', status: 'paid' },
    { id: 's007', participant_id: 'p102', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A004', issued_at: '2027-06-01', status: 'paid' },
    { id: 's008', participant_id: 'p102', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A004', issued_at: '2027-07-01', status: 'paid' },
    { id: 's009', participant_id: 'p003', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A005', issued_at: '2027-06-01', status: 'paid' },
    { id: 's010', participant_id: 'p003', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A005', issued_at: '2027-07-01', status: 'paid' },
    { id: 's011', participant_id: 'p103', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A006', issued_at: '2027-06-01', status: 'paid' },
    { id: 's012', participant_id: 'p103', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A006', issued_at: '2027-07-01', status: 'paid' },
  ],

  safety_incidents: [
    { id: 'si001', match_id: 'm002', activity_id: 'act102', reported_by: 'p002', severity: 'low', category: '경미한 안전이슈', description: '아동이 의자에서 미끄러질 뻔. 다행히 부상은 없음. 의자 안전 점검 요청.', status: 'resolved', resolved_at: '2027-05-11', resolved_by: '코디 한가은', resolution: '돌봄센터에 안전의자 교체 요청 완료. 활동공간 점검 SOP에 의자 점검 추가.', reported_at: '2027-05-09 14:30' },
    { id: 'si002', match_id: 'm001', activity_id: null, reported_by: 'p201', severity: 'low', category: '소통이슈', description: '아이 픽업 시간이 약속보다 늦어 보호자가 걱정. 코디 즉시 연결 요청.', status: 'resolved', resolved_at: '2027-06-19', resolved_by: '코디 한가은', resolution: '활동 전날 픽업시간 카카오 알림 자동 발송 추가. 1시간 전 한 번 더 리마인드.', reported_at: '2027-06-19 18:45' },
  ],

  surveys: [
    { id: 'sv001', participant_id: 'p001', month: '2027-06', satisfaction: 5, would_continue: true, comment: '어르신께 받는 진로 조언이 진짜 도움 돼요. 단순 봉사가 아니라 제가 더 배우는 느낌.' },
    { id: 'sv002', participant_id: 'p101', month: '2027-06', satisfaction: 5, would_continue: true, comment: '손녀처럼 따뜻한 청년을 만나서 매번 기다려져요.' },
    { id: 'sv003', participant_id: 'p201', month: '2027-06', satisfaction: 5, would_continue: true, comment: '학원만 다니던 아이가 박순자 할머니 얘기 자주 해요. 아이 정서에 큰 영향.' },
    { id: 'sv004', participant_id: 'p002', month: '2027-06', satisfaction: 4, would_continue: true, comment: '활동 시간이 좀 더 길었으면 좋겠어요.' },
    { id: 'sv005', participant_id: 'p102', month: '2027-06', satisfaction: 5, would_continue: true, comment: '집에만 있던 내가 매주 외출하니 활기가 생겼어요.' },
    { id: 'sv006', participant_id: 'p202', month: '2027-06', satisfaction: 5, would_continue: true, comment: '교대근무에도 안심하고 맡길 수 있어 마음이 가벼워요.' },
  ],
};

// ============================================================================
// 3. STORAGE
// ============================================================================

const STORAGE_KEY = 'eum:appdata:v1';

async function loadState() {
  try {
    const v = (typeof window !== 'undefined' && window.localStorage)
      ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!v) return null;
    const parsed = JSON.parse(v);
    // Schema validation: ensure all required collections exist
    const required = ['participants', 'applications', 'verifications', 'matches', 'activities', 'activity_logs', 'settlements', 'safety_incidents', 'surveys'];
    for (const k of required) {
      if (!Array.isArray(parsed[k])) return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

async function saveState(state) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return true;
  } catch (e) {
    console.warn('Storage save failed:', e);
    return false;
  }
}

// ============================================================================
// 4. UTILS
// ============================================================================

const krw = (n) => '₩' + (n || 0).toLocaleString('ko-KR');
const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};
const fmtDateTime = (s) => {
  if (!s) return '—';
  const d = new Date(s.replace(' ', 'T'));
  if (isNaN(d)) return s;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const fmtRelativeDate = (s) => {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T'));
  const now = new Date(TODAY);
  const diff = Math.floor((d - now) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  if (diff > 0 && diff < 7) return `${diff}일 후`;
  if (diff < 0 && diff > -7) return `${-diff}일 전`;
  return fmtDate(s);
};
const initials = (name) => (name || '?').slice(0, 1);
const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// --- Schema derivation helpers (single source of truth = SEED schema) ---
const dateOf = (s) => (s || '').split(' ')[0];               // 'YYYY-MM-DD HH:MM' -> 'YYYY-MM-DD'
const timeOf = (s) => (s || '').split(' ')[1] || '';          // -> 'HH:MM'
const actDate = (a) => (a ? dateOf(a.scheduled_at) : '');
const actTime = (a) => (a ? timeOf(a.scheduled_at) : '');
const findAct = (state, log) => state.activities.find((a) => a.id === log.activity_id);
const logDate = (state, log) => { const a = findAct(state, log); return a ? actDate(a) : (log.approved_at || ''); };
const logMonth = (state, log) => (logDate(state, log) || '').slice(0, 7);
const RATE_PER_HOUR = 11460; // 월 275,000원 / 24시간 ≈ 시급 (플레이북 9.1 산출근거)

// ============================================================================
// 5. UI PRIMITIVES
// ============================================================================

function Avatar({ name, color = C.brand, size = 40, ring = false }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: size * 0.42, flexShrink: 0,
        boxShadow: ring ? `0 0 0 3px ${C.card}, 0 0 0 5px ${color}40` : 'none',
        fontFamily: FONT_STACK,
      }}
    >
      {initials(name)}
    </div>
  );
}

function Badge({ children, color = C.mute, soft = C.muteSoft, size = 'sm' }) {
  const pad = size === 'sm' ? '3px 8px' : '5px 10px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: soft, color, padding: pad, borderRadius: 6,
      fontSize: fs, fontWeight: 600, letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Button({ children, onClick, variant = 'primary', size = 'md', disabled, icon, iconRight, fullWidth, type = 'button', style = {} }) {
  const variants = {
    primary: { bg: C.ink, fg: '#fff', border: C.ink, hoverBg: '#000' },
    brand: { bg: C.brand, fg: '#fff', border: C.brand, hoverBg: C.brandDark },
    secondary: { bg: C.card, fg: C.ink, border: C.border, hoverBg: C.bg },
    ghost: { bg: 'transparent', fg: C.ink, border: 'transparent', hoverBg: C.bg },
    danger: { bg: C.red, fg: '#fff', border: C.red, hoverBg: '#A03838' },
    success: { bg: C.sage, fg: '#fff', border: C.sage, hoverBg: '#4D6B45' },
  };
  const v = variants[variant];
  const sizes = {
    sm: { pad: '6px 12px', fs: 13, h: 32 },
    md: { pad: '9px 16px', fs: 14, h: 38 },
    lg: { pad: '12px 22px', fs: 15, h: 46 },
  };
  const s = sizes[size];
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: hover && !disabled ? v.hoverBg : v.bg,
        color: v.fg, border: `1px solid ${v.border}`,
        padding: s.pad, fontSize: s.fs, fontWeight: 600,
        borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.12s ease',
        height: s.h, width: fullWidth ? '100%' : 'auto',
        fontFamily: FONT_STACK, letterSpacing: '-0.01em',
        ...style
      }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

function Card({ children, padding = 20, style = {}, onClick, hoverable }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        boxShadow: hover ? '0 4px 16px rgba(26,24,20,0.06)' : 'none',
        transform: hover ? 'translateY(-1px)' : 'none',
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', icon, style = {}, disabled }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mute, display: 'flex' }}>{icon}</div>}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', padding: icon ? '10px 12px 10px 38px' : '10px 12px',
          border: `1px solid ${C.border}`, borderRadius: 8,
          fontSize: 14, fontFamily: FONT_STACK, color: C.ink,
          background: disabled ? C.bg : C.card, outline: 'none',
          transition: 'border 0.15s',
          ...style,
        }}
        onFocus={(e) => e.target.style.borderColor = C.ink}
        onBlur={(e) => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, style = {} }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '10px 12px',
        border: `1px solid ${C.border}`, borderRadius: 8,
        fontSize: 14, fontFamily: FONT_STACK, color: C.ink,
        background: C.card, outline: 'none', resize: 'vertical',
        lineHeight: 1.6,
        ...style
      }}
      onFocus={(e) => e.target.style.borderColor = C.ink}
      onBlur={(e) => e.target.style.borderColor = C.border}
    />
  );
}

function Select({ value, onChange, options, placeholder, style = {} }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 12px',
        border: `1px solid ${C.border}`, borderRadius: 8,
        fontSize: 14, fontFamily: FONT_STACK, color: C.ink,
        background: C.card, outline: 'none', cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A847A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        paddingRight: 32,
        ...style
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Checkbox({ checked, onChange, label, sublabel, required }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: 10, borderRadius: 8, border: `1px solid ${C.borderSoft}`, background: checked ? C.brandBg : C.card, transition: 'all 0.15s' }}>
      <div
        style={{
          flexShrink: 0, marginTop: 1,
          width: 20, height: 20, borderRadius: 5,
          border: `1.5px solid ${checked ? C.brand : C.border}`,
          background: checked ? C.brand : C.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
      </div>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)} style={{ display: 'none' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>
          {label}
          {required && <span style={{ color: C.red, marginLeft: 4 }}>*</span>}
        </div>
        {sublabel && <div style={{ fontSize: 12, color: C.mute, marginTop: 3, lineHeight: 1.5 }}>{sublabel}</div>}
      </div>
    </label>
  );
}

function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  const widths = { sm: 420, md: 560, lg: 720, xl: 920 };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.15s ease',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: 16, maxWidth: widths[size], width: '100%',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s ease',
        }}
      >
        {title && (
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>{title}</div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 4, display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8, background: C.cream, borderRadius: '0 0 16px 16px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const t = setTimeout(onClose, toast.duration || 3000);
      return () => clearTimeout(t);
    }
  }, [toast, onClose]);
  if (!toast) return null;
  const colors = {
    success: { bg: '#1F2A1B', icon: <CheckCircle2 size={18} color={C.sage} /> },
    error: { bg: '#2A1B1B', icon: <AlertCircle size={18} color={C.red} /> },
    info: { bg: C.ink, icon: <Info size={18} color="#fff" /> },
  };
  const c = colors[toast.type || 'info'];
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      background: c.bg, color: '#fff', padding: '12px 16px',
      borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)', maxWidth: 360,
      fontSize: 14, fontWeight: 500, animation: 'slideInRight 0.2s ease',
      fontFamily: FONT_STACK,
    }}>
      {c.icon}
      {toast.message}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.ink, icon, trend }) {
  return (
    <Card padding={18}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: C.mute, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</div>
        {icon && <div style={{ background: C.bg, padding: 6, borderRadius: 8, display: 'flex' }}>{icon}</div>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: SERIF_STACK }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: trend === 'up' ? C.sage : trend === 'down' ? C.red : C.mute, marginTop: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
          {trend === 'up' && <TrendingUp size={12} />}
          {sub}
        </div>
      )}
    </Card>
  );
}

function Tabs({ tabs, active, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, ...style }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '10px 14px', background: 'transparent',
            border: 'none', borderBottom: `2px solid ${active === t.id ? C.ink : 'transparent'}`,
            color: active === t.id ? C.ink : C.mute,
            fontWeight: active === t.id ? 700 : 500,
            fontSize: 14, cursor: 'pointer', marginBottom: -1,
            fontFamily: FONT_STACK, transition: 'all 0.12s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {t.label}
          {t.count !== undefined && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: active === t.id ? C.ink : C.muteSoft,
              color: active === t.id ? '#fff' : C.mute,
              padding: '1px 7px', borderRadius: 8,
            }}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function Empty({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.mute }}>
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center', color: C.border }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginBottom: 16 }}>{sub}</div>}
      {action}
    </div>
  );
}


// ============================================================================
// 6. LAYOUT — SIDEBAR + HEADER
// ============================================================================

function Sidebar({ role, currentView, onNavigate, onLogout, userName, dataCount }) {
  const navByRole = {
    coordinator: [
      { id: 'overview', label: '대시보드', icon: <Home size={18} /> },
      { id: 'applicants', label: '신청자 관리', icon: <UserPlus size={18} />, count: dataCount?.applicants },
      { id: 'matching', label: '매칭 보드', icon: <Heart size={18} />, count: dataCount?.matches },
      { id: 'activities', label: '활동 승인', icon: <ClipboardCheck size={18} />, count: dataCount?.pendingLogs },
      { id: 'settlements', label: '정산', icon: <Wallet size={18} /> },
      { id: 'safety', label: '안전 이슈', icon: <ShieldAlert size={18} />, count: dataCount?.openIncidents, danger: dataCount?.openIncidents > 0 },
      { id: 'reports', label: '리포트', icon: <FileText size={18} /> },
    ],
    youth: [
      { id: 'dashboard', label: '홈', icon: <Home size={18} /> },
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
  const homeView = items[0]?.id || 'dashboard';

  return (
    <div style={{
      width: isSenior ? 240 : 232, height: '100vh', background: C.card,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0,
    }}>
      <button
        onClick={() => onNavigate(homeView)}
        title="홈으로 이동"
        style={{
          padding: '22px 20px 18px', borderBottom: `1px solid ${C.borderSoft}`,
          background: 'transparent', border: 'none', borderBottomLeftRadius: 0,
          cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.12s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = C.cream}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.brand} 0%, ${C.peach} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 17,
            fontFamily: SERIF_STACK, letterSpacing: '-0.02em',
            boxShadow: `0 2px 8px ${C.brand}40`,
          }}>이</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', fontFamily: SERIF_STACK, lineHeight: 1 }}>이음</div>
            <div style={{ fontSize: 10, color: C.mute, letterSpacing: '0.08em', fontWeight: 600, marginTop: 2 }}>EUM · 세대를 잇다</div>
          </div>
        </div>
      </button>

      <div style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: C.mute, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 10px 8px' }}>
          {persona.label.toUpperCase()}
        </div>
        {items.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: isSenior ? '13px 12px' : '10px 12px', marginBottom: 2,
                background: active ? C.bg : 'transparent', color: active ? C.ink : C.inkSoft,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: active ? 700 : 500,
                fontSize: isSenior ? 16 : 14, textAlign: 'left',
                fontFamily: FONT_STACK,
                transition: 'all 0.12s', position: 'relative',
              }}
              onMouseEnter={(e) => !active && (e.currentTarget.style.background = C.cream)}
              onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: active ? persona.color : C.mute, display: 'flex' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: item.danger ? C.red : (active ? persona.color : C.muteSoft),
                  color: item.danger || active ? '#fff' : C.mute,
                  padding: '1px 7px', borderRadius: 9,
                  minWidth: 18, textAlign: 'center',
                }}>{item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${C.borderSoft}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 10, borderRadius: 9,
        }}>
          <Avatar name={userName} color={persona.color} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{userName}</div>
            <div style={{ fontSize: 11, color: C.mute }}>{persona.label}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', color: C.mute, padding: 6, borderRadius: 6, cursor: 'pointer', display: 'flex' }}
            title="로그아웃"
            onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.035em', margin: 0, fontFamily: SERIF_STACK, lineHeight: 1.15 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 14, color: C.mute, marginTop: 5 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ============================================================================
// 7. ROLE SELECT (랜딩 페이지)
// ============================================================================

function RoleSelect({ state, onSelectRole, onShowApplication }) {
  // 시드된 페르소나 fixed assignments
  const personas = [
    { role: 'youth', id: 'p001', name: '김민준', subtitle: '27세 · 스타트업 개발자', desc: '어르신께 디지털을 알려드리고, 진로 조언을 받습니다.', color: C.sage, soft: C.sageSoft, gradient: 'linear-gradient(135deg, #6B8E5A 0%, #8FB47E 100%)' },
    { role: 'senior', id: 'p101', name: '박순자', subtitle: '73세 · 前 교사', desc: '청년과 디지털을 익히고, 아이에게 옛이야기를 들려드려요.', color: C.lavender, soft: C.lavenderSoft, gradient: 'linear-gradient(135deg, #7F6FA0 0%, #A797C0 100%)' },
    { role: 'parent', id: 'p201', name: '이서영', subtitle: '38세 · IT기업 PM (유진 8세 보호자)', desc: '아이가 어르신·청년과 만나는 안전한 공간을 신뢰해요.', color: C.peach, soft: C.peachSoft, gradient: 'linear-gradient(135deg, #D89368 0%, #E8B58F 100%)' },
    { role: 'coordinator', id: 'cdn001', name: '한가은', subtitle: '코디네이터 · 우장산동', desc: '신청·검증·매칭·정산을 한눈에 관리합니다.', color: C.ink, soft: '#EDEAE5', gradient: 'linear-gradient(135deg, #1A1814 0%, #3A352F 100%)' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK,
      padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      backgroundImage: `radial-gradient(circle at 20% 0%, ${C.brandSoft} 0%, transparent 40%), radial-gradient(circle at 80% 30%, ${C.peachSoft} 0%, transparent 50%)`,
    }}>
      <div style={{ maxWidth: 1080, width: '100%' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 14,
              background: `linear-gradient(135deg, ${C.brand} 0%, ${C.peach} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 28, fontWeight: 800, fontFamily: SERIF_STACK,
              boxShadow: `0 8px 24px ${C.brand}40`,
              letterSpacing: '-0.02em',
            }}>이</div>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: C.ink, letterSpacing: '-0.04em', margin: '0 0 10px', fontFamily: SERIF_STACK, lineHeight: 1.1 }}>
            세대를 잇다, <span style={{ color: C.brand, fontStyle: 'italic' }}>이음</span>
          </h1>
          <p style={{ fontSize: 16, color: C.inkSoft, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            청년·어르신·아동 세 세대가 서로 돕고 모두 보상받는<br />
            <span style={{ color: C.ink, fontWeight: 600 }}>강서구형 3세대 상생 품앗이 플랫폼</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            <Badge color={C.sage} soft={C.sageSoft} size="md">청년</Badge>
            <span style={{ color: C.border }}>×</span>
            <Badge color={C.lavender} soft={C.lavenderSoft} size="md">어르신</Badge>
            <span style={{ color: C.border }}>×</span>
            <Badge color={C.peach} soft={C.peachSoft} size="md">양육가정·아동</Badge>
          </div>
        </div>

        {/* 데모 로그인 안내 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ background: C.amberSoft, padding: 9, borderRadius: 10, display: 'flex' }}>
            <Sparkles size={20} color={C.amber} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>2027년 우장산동 파일럿 · 데모 모드</div>
            <div style={{ fontSize: 13, color: C.mute }}>실제 운영 중인 15쌍의 데이터가 시드되어 있습니다. 역할 선택 후 모든 기능을 체험할 수 있어요.</div>
          </div>
        </div>

        {/* 페르소나 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 36 }}>
          {personas.map((p) => (
            <Card key={p.role} padding={0} hoverable onClick={() => onSelectRole(p.role, p.id)} style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ background: p.gradient, height: 70, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                <Avatar name={p.name} color="#fff" size={56} ring={false} />
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', opacity: 0.85, background: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: 6, backdropFilter: 'blur(8px)' }}>
                  {PERSONA[p.role].label.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.mute, marginBottom: 10, marginTop: 2 }}>{p.subtitle}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55, minHeight: 60 }}>{p.desc}</div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: p.color, fontWeight: 700 }}>입장하기</span>
                  <ArrowRight size={16} color={p.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 신청 페이지 진입 */}
        <Card padding={22} style={{ background: C.cream }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 4 }}>처음 오셨나요?</div>
              <div style={{ fontSize: 13, color: C.mute, lineHeight: 1.55 }}>강서구 우장산동에 거주하시는 청년·어르신·양육가정이면 신청 가능합니다. 약 5분 소요.</div>
            </div>
            <Button variant="brand" icon={<UserPlus size={16} />} onClick={onShowApplication} size="lg">
              참여 신청하기
            </Button>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 36, color: C.mute, fontSize: 12 }}>
          이음 MVP · 강서구청 주민참여예산 시범사업 · 2027 우장산동 파일럿
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. PUBLIC APPLICATION FORM
// ============================================================================

function ApplicationForm({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: '', name: '', age: '', phone: '', address: '강서구 ', emergency_contact: '',
    occupation: '', bio: '', skills: [], interests: [], availability: [],
    child_name: '', child_age: '', child_interests: '',
    consent_data: false, consent_photo: false, consent_criminal: false, consent_guardian: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const SKILL_OPTIONS = ['디지털코칭', '학습멘토', '코딩교육', '예술교육', '건강관리', '독서지도', '글쓰기', '수학교육', '돌봄', '바느질', '뜨개질', '요리', '서예', '동화구연', '역사이야기', '바둑', '장기', '한자', '경험담', '응급처치'];
  const INTEREST_OPTIONS = ['IT', '진로상담', '여행', '교육', '문학', '심리', '디자인', '사진', '카페', '건강', '운동', '요리', '경제', '독서', '러닝', '손주', '드라마', '꽃', '산책', '역사', '등산', '뉴스', '걷기'];
  const TIME_OPTIONS = ['평일오전', '평일오후', '평일저녁', '토요일', '일요일'];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const canProceed = useMemo(() => {
    if (step === 1) return !!form.type;
    if (step === 2) return !!form.name && !!form.age && /^010-?\d{4}-?\d{4}$/.test(form.phone) && !!form.address && !!form.emergency_contact;
    if (step === 3) {
      if (form.type === 'parent') return !!form.child_name && !!form.child_age;
      return form.skills.length > 0 && form.availability.length > 0;
    }
    if (step === 4) {
      const baseOk = form.consent_data && form.consent_photo;
      if (form.type === 'parent') return baseOk && form.consent_guardian;
      return baseOk && form.consent_criminal;
    }
    return true;
  }, [step, form]);

  const submit = () => {
    onSubmit(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.sageSoft, color: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={36} strokeWidth={3} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 8px', letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>신청이 접수되었습니다</h2>
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, marginBottom: 24 }}>
          {form.type !== 'parent' && '범죄경력 조회는 모집과 동시에 진행됩니다. 평균 7~14일 소요.'}<br />
          코디네이터가 1~3일 내에 카카오톡으로 면접 일정을 안내드립니다.
        </div>
        <Button variant="primary" onClick={onClose}>확인</Button>
      </div>
    );
  }

  const TYPES = [
    { id: 'youth', label: '청년', age: '만 19~39세', color: C.sage, soft: C.sageSoft, desc: '월 27.5만 상품권 + 어르신 멘토 + 동네 정착' },
    { id: 'senior', label: '어르신', age: '만 65세 이상', color: C.lavender, soft: C.lavenderSoft, desc: '월 27.5만 상품권 + 디지털 자립 + 효능감 회복' },
    { id: 'parent', label: '양육가정', age: '만 14세 미만 자녀', color: C.peach, soft: C.peachSoft, desc: '안전한 공간 + 3세대 교류 + 무료 참여' },
  ];

  return (
    <div>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24, padding: '0 4px' }}>
        {['신청유형', '기본정보', form.type === 'parent' ? '자녀정보' : '경험·가능시간', '동의·제출'].map((label, i) => {
          const sNum = i + 1;
          const active = step === sNum;
          const done = step > sNum;
          return (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: done ? C.sage : active ? C.ink : C.muteSoft,
                  color: done || active ? '#fff' : C.mute,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{done ? <Check size={13} strokeWidth={3} /> : sNum}</div>
                <div style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.ink : C.mute, whiteSpace: 'nowrap' }}>{label}</div>
              </div>
              {i < 3 && <div style={{ flex: 0.3, height: 1, background: C.border }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 6, letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>어떤 자격으로 참여하시나요?</div>
          <div style={{ fontSize: 13, color: C.mute, marginBottom: 18 }}>유형에 따라 신청 절차가 다릅니다.</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {TYPES.map((t) => (
              <Card key={t.id} padding={16} onClick={() => set('type', t.id)} hoverable style={{ border: `2px solid ${form.type === t.id ? t.color : C.border}`, background: form.type === t.id ? t.soft : C.card }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: SERIF_STACK }}>
                    {t.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{t.label} <span style={{ fontSize: 12, color: C.mute, fontWeight: 500 }}>({t.age})</span></div>
                    <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{t.desc}</div>
                  </div>
                  {form.type === t.id && <Check size={20} color={t.color} strokeWidth={3} />}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Basic info */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="성함" required>
            <Input value={form.name} onChange={(v) => set('name', v)} placeholder="홍길동" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <Field label="나이" required>
              <Input value={form.age} onChange={(v) => set('age', v)} placeholder="27" type="number" />
            </Field>
            <Field label="연락처" required>
              <Input value={form.phone} onChange={(v) => set('phone', v)} placeholder="010-1234-5678" />
            </Field>
          </div>
          <Field label="거주지" required>
            <Input value={form.address} onChange={(v) => set('address', v)} placeholder="강서구 우장산동 ..." icon={<MapPin size={15} />} />
          </Field>
          <Field label="비상연락처" required sub="가족/지인 연락처와 관계 (예: 010-1234-5678 (모친))">
            <Input value={form.emergency_contact} onChange={(v) => set('emergency_contact', v)} placeholder="010-0000-0000 (관계)" icon={<Phone size={15} />} />
          </Field>
          {form.type !== 'parent' && (
            <Field label="직업/소속" sub="청년: 회사·학교 / 어르신: 前 직업">
              <Input value={form.occupation} onChange={(v) => set('occupation', v)} placeholder="ex. 스타트업 개발자 / 前 초등학교 교사" />
            </Field>
          )}
        </div>
      )}

      {/* Step 3: Skills or Child info */}
      {step === 3 && form.type !== 'parent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="줄 수 있는 것 (강점·기술)" required sub="3개까지 권장 — 매칭 시 활용됩니다">
            <ChipSelect options={SKILL_OPTIONS} selected={form.skills} onToggle={(v) => toggle('skills', v)} max={5} color={form.type === 'youth' ? C.sage : C.lavender} />
          </Field>
          <Field label="관심사" sub="어떤 어르신/청년과 잘 맞을지 판단합니다">
            <ChipSelect options={INTEREST_OPTIONS} selected={form.interests} onToggle={(v) => toggle('interests', v)} max={5} color={C.brand} />
          </Field>
          <Field label="활동 가능한 시간" required sub="격주 활동 (1회 6시간 분할)">
            <ChipSelect options={TIME_OPTIONS} selected={form.availability} onToggle={(v) => toggle('availability', v)} color={C.blue} />
          </Field>
          <Field label="자기소개" sub="간단한 한두 줄 — 매칭 추천 시 코디가 참고합니다">
            <Textarea value={form.bio} onChange={(v) => set('bio', v)} placeholder="어떤 사람인지, 왜 신청하셨는지" rows={3} />
          </Field>
        </div>
      )}
      {step === 3 && form.type === 'parent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.peachSoft, padding: 14, borderRadius: 10, fontSize: 13, color: C.ink, lineHeight: 1.6 }}>
            <strong>양육가정 안내</strong><br />
            아이는 청년·어르신과 격주로 1회(약 3시간) 만납니다. 보호자는 동의서 5종을 작성하고, 코디네이터가 매칭부터 활동 전 과정을 입회·확인합니다.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="자녀 성함" required>
              <Input value={form.child_name} onChange={(v) => set('child_name', v)} placeholder="자녀 이름" />
            </Field>
            <Field label="만 나이" required>
              <Input value={form.child_age} onChange={(v) => set('child_age', v)} placeholder="8" type="number" />
            </Field>
          </div>
          <Field label="자녀 관심사" sub="아이가 좋아하는 것 (책·그림·로봇·동물 등)">
            <Input value={form.child_interests} onChange={(v) => set('child_interests', v)} placeholder="ex. 책 읽기, 그림 그리기" />
          </Field>
          <Field label="가정 상황 / 매칭 시 참고사항" sub="아이 성격·돌봄 시간·특이사항 등">
            <Textarea value={form.bio} onChange={(v) => set('bio', v)} placeholder="ex. 맞벌이로 평일 7시 반 이후 픽업 가능합니다." rows={3} />
          </Field>
        </div>
      )}

      {/* Step 4: Consents */}
      {step === 4 && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>법적 동의 사항</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Checkbox checked={form.consent_data} onChange={(v) => set('consent_data', v)} label="개인정보 수집·이용 동의" sublabel="개인정보보호법에 따라 신청·매칭·정산 목적으로만 활용되며, 사업 종료 후 5년간 보관 후 파기됩니다." required />
            <Checkbox checked={form.consent_photo} onChange={(v) => set('consent_photo', v)} label="활동 사진·기록 동의" sublabel="활동 사진은 코디네이터 승인 후에만 동네 기억 아카이브에 활용됩니다. 본인 식별 가능한 사진은 사전 동의 후 게재." required />
            {form.type !== 'parent' && (
              <Checkbox checked={form.consent_criminal} onChange={(v) => set('consent_criminal', v)} label="범죄경력 조회 동의 (아동복지법)" sublabel="만 14세 미만 아동과의 활동을 위해 경찰청 범죄경력 조회가 필수입니다. 결과는 코디네이터만 열람 후 즉시 폐기됩니다." required />
            )}
            {form.type === 'parent' && (
              <Checkbox checked={form.consent_guardian} onChange={(v) => set('consent_guardian', v)} label="보호자 동의서 5종 작성 동의" sublabel="활동참여·개인정보·영상사진·응급의료·외부활동(공공공간 한정) 5종 동의서를 코디네이터를 통해 별도 작성합니다." required />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <Button variant="secondary" onClick={() => step === 1 ? onClose() : setStep(step - 1)} icon={<ChevronLeft size={16} />}>
          {step === 1 ? '취소' : '이전'}
        </Button>
        {step < 4 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed} iconRight={<ChevronRight size={16} />}>다음</Button>
        ) : (
          <Button variant="brand" onClick={submit} disabled={!canProceed} icon={<Send size={16} />}>신청서 제출</Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, sub, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}</label>
      </div>
      {sub && <div style={{ fontSize: 12, color: C.mute, marginBottom: 7, lineHeight: 1.5 }}>{sub}</div>}
      {children}
    </div>
  );
}

function ChipSelect({ options, selected, onToggle, max, color = C.ink }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const isSel = selected.includes(o);
        const disabled = !isSel && max && selected.length >= max;
        return (
          <button
            key={o}
            type="button"
            onClick={() => !disabled && onToggle(o)}
            disabled={disabled}
            style={{
              padding: '6px 12px', borderRadius: 16,
              border: `1.5px solid ${isSel ? color : C.border}`,
              background: isSel ? color : C.card,
              color: isSel ? '#fff' : C.ink,
              fontSize: 12.5, fontWeight: isSel ? 600 : 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: FONT_STACK,
              opacity: disabled ? 0.4 : 1,
              transition: 'all 0.12s',
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}


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
    return state.activities.filter((a) => a.match_id === match.id).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
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
    <Layout role="youth" view={view} setView={setView} user={user} dispatch={dispatch}
      data={{ pendingLogs: state.activity_logs.filter(l => l.participant_id === user.id && !l.approved).length }}>
      {view === 'dashboard' && (
        <>
          <PageHeader title={`안녕하세요, ${user.name}님`} subtitle={`이번 주 활동을 함께 살펴보세요`} />

          {/* Hero — 매칭 트리오 */}
          {match && (
            <Card padding={0} style={{ marginBottom: 20, overflow: 'hidden', background: `linear-gradient(135deg, ${C.cream} 0%, ${C.brandBg} 100%)`, border: `1px solid ${C.border}` }}>
              <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '0.1em', marginBottom: 4 }}>NOW MATCHED</div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>우리 매칭 트리오</div>
                    <div style={{ fontSize: 12, color: C.mute, marginTop: 3 }}>매칭 시작: {fmtDate(match.started_at)} · {myActivities.filter(a => a.status === 'completed').length}회차 진행</div>
                  </div>
                  <Badge color={C.sage} soft={C.sageSoft} size="md">활동 중</Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
                  <TrioMember person={senior} sub="멘토" color={C.lavender} />
                  <div style={{ display: 'flex', alignItems: 'center', color: C.brand, fontSize: 20 }}>↔</div>
                  <TrioMember person={user} sub="나" color={C.sage} highlight />
                  <div style={{ display: 'flex', alignItems: 'center', color: C.brand, fontSize: 20 }}>↔</div>
                  <TrioMember person={child} sub="멘티" color={C.peach} />
                </div>

                {match.match_notes && (
                  <div style={{ marginTop: 18, padding: 12, background: 'rgba(255,255,255,0.6)', borderRadius: 9, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: '0.05em', marginRight: 6 }}>코디 메모</span>
                    {match.match_notes}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard label="이번 달 활동시간" value={`${monthHours}h`} sub={`목표 24h 중 ${Math.round(monthHours/24*100)}%`} icon={<Clock size={16} color={C.sage} />} color={C.ink} />
            <StatCard label="누적 활동시간" value={`${totalHours}h`} sub={`${myLogs.filter(l => l.approved).length}건 승인`} icon={<Activity size={16} color={C.brand} />} />
            <StatCard label="누적 정산액" value={krw(totalEarned)} sub="강서사랑상품권" icon={<Wallet size={16} color={C.gold} />} color={C.gold} />
            <StatCard label="다음 활동" value={nextActivity ? fmtRelativeDate(nextActivity.scheduled_at) : '—'} sub={nextActivity ? nextActivity.type : '예정 없음'} icon={<Calendar size={16} color={C.lavender} />} />
          </div>

          {/* Activity Cards 4종 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.mute, letterSpacing: '0.05em', marginBottom: 12 }}>활동 4종</div>
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

      {view === 'schedule' && <YouthSchedule match={match} activities={myActivities} state={state} />}
      {view === 'logs' && <YouthLogs state={state} user={user} match={match} myLogs={myLogs} myActivities={myActivities} dispatch={dispatch} showToast={showToast} />}
      {view === 'mentor' && <YouthMentor senior={senior} myLogs={myLogs} state={state} />}
      {view === 'archive' && <ArchiveView state={state} />}
      {view === 'settlement' && <SettlementView settlements={mySettlements} totalHours={totalHours} totalEarned={totalEarned} user={user} />}
    </Layout>
  );
}

function TrioMember({ person, sub, color, highlight }) {
  if (!person) return null;
  return (
    <div style={{ textAlign: 'center', minWidth: 110 }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
        <Avatar name={person.name} color={color} size={highlight ? 64 : 56} ring={highlight} />
        {highlight && <div style={{ position: 'absolute', bottom: -3, right: -3, background: C.brand, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.card}` }}>
          <Check size={12} strokeWidth={3} />
        </div>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>{person.name}</div>
      <div style={{ fontSize: 11, color: C.mute, marginTop: 1 }}>{sub} · {person.age}세</div>
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

function YouthSchedule({ match, activities, state }) {
  return (
    <>
      <PageHeader title="활동 일정" subtitle="매칭 트리오와의 격주 활동 일정입니다" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map((act) => {
          const isPast = act.status === 'completed';
          return (
            <Card key={act.id} padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 54, textAlign: 'center', padding: '8px 0',
                    background: isPast ? C.muteSoft : C.brandBg, borderRadius: 10,
                    border: `1px solid ${isPast ? C.border : C.brand + '40'}`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isPast ? C.mute : C.brand, letterSpacing: '0.05em' }}>{act.scheduled_at.split('-')[1]}월</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: isPast ? C.inkSoft : C.ink, fontFamily: SERIF_STACK, lineHeight: 1 }}>{act.scheduled_at.split(' ')[0].split('-')[2]}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Badge color={C.brand} soft={C.brandSoft}>{act.type}</Badge>
                      {isPast ? <Badge color={C.sage} soft={C.sageSoft}>완료</Badge> : <Badge color={C.amber} soft={C.amberSoft}>예정</Badge>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
                      {act.scheduled_at.split(' ')[1]} · {act.duration_hours}시간
                    </div>
                    <div style={{ fontSize: 12, color: C.mute, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {act.location}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function YouthLogs({ state, user, match, myLogs, myActivities, dispatch, showToast }) {
  const [open, setOpen] = useState(false);
  const [logTab, setLogTab] = useState('all');
  const [form, setForm] = useState({ activity_id: '', summary: '', mood: 5, has_photo: false });

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

      <Card padding={0}>
        <Tabs tabs={[
          { id: 'all', label: '전체', count: myLogs.length },
          { id: 'approved', label: '승인', count: myLogs.filter(l => l.approved).length },
          { id: 'pending', label: '대기', count: myLogs.filter(l => !l.approved).length },
        ]} active={logTab} onChange={setLogTab} style={{ padding: '0 16px' }} />
        <div style={{ padding: 12 }}>
          {(() => {
            const shown = logTab === 'approved' ? myLogs.filter(l => l.approved)
              : logTab === 'pending' ? myLogs.filter(l => !l.approved) : myLogs;
            if (shown.length === 0) return (
              <Empty icon={<PenLine size={42} />} title={logTab === 'pending' ? '승인 대기 중인 기록이 없습니다' : logTab === 'approved' ? '승인된 기록이 없습니다' : '아직 기록이 없습니다'} sub="활동 후 그날의 인상적이었던 순간을 적어주세요" />
            );
            return shown.map((log) => {
            const act = state.activities.find(a => a.id === log.activity_id);
            return (
              <div key={log.id} style={{ padding: 16, borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Badge color={C.brand} soft={C.brandSoft}>{act?.type}</Badge>
                    <span style={{ fontSize: 12, color: C.mute }}>{act ? fmtDate(act.scheduled_at) : ''}</span>
                    <span style={{ fontSize: 12, color: C.mute }}>· {log.hours}시간</span>
                    {log.has_photo && <span style={{ fontSize: 11, color: C.mute, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Camera size={11} /> 사진</span>}
                  </div>
                  {log.approved ? (
                    <Badge color={C.sage} soft={C.sageSoft}><Check size={11} /> 승인됨</Badge>
                  ) : (
                    <Badge color={C.amber} soft={C.amberSoft}><Clock size={11} /> 승인 대기</Badge>
                  )}
                </div>
                <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65 }}>{log.summary}</div>
              </div>
            );
          });
          })()}
        </div>
      </Card>

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
            <Textarea value={form.summary} onChange={(v) => setForm(f => ({ ...f, summary: v }))} placeholder="오늘 박순자 어르신과 키오스크 실습을 했다..." rows={5} />
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
        <Card padding={20} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.lavenderSoft} 0%, ${C.cream} 100%)`, border: `1px solid ${C.lavender}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar name={senior.name} color={C.lavender} size={68} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.lavender, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>나의 멘토</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}>{senior.name} 어르신</div>
              <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{senior.occupation} · {senior.age}세</div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 6, lineHeight: 1.5, fontStyle: 'italic' }}>"{senior.bio}"</div>
            </div>
          </div>
        </Card>
      )}
      <div style={{ fontSize: 13, fontWeight: 700, color: C.mute, letterSpacing: '0.05em', marginBottom: 12 }}>받은 조언 기록</div>
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
      <PageHeader title="동네 기억 아카이브" subtitle="우장산동의 옛이야기를 어르신께 듣고 기록합니다" />
      <Card padding={22} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.goldSoft} 0%, ${C.cream} 100%)`, border: `1px solid ${C.gold}40` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: 12, background: C.gold + '30', borderRadius: 12 }}>
            <BookOpen size={28} color={C.gold} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}>이 동네에도 이야기가 있습니다</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4, lineHeight: 1.6, maxWidth: 480 }}>어르신의 기억은 동네의 역사입니다. 청년이 듣고 기록하면, 다음 세대에 전해집니다.</div>
          </div>
        </div>
      </Card>

      <div style={{ fontSize: 13, fontWeight: 700, color: C.mute, letterSpacing: '0.05em', marginBottom: 12 }}>수집된 이야기 {archiveLogs.length}편</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {archiveLogs.map((log) => {
          const act = state.activities.find(a => a.id === log.activity_id);
          const author = state.participants.find(p => p.id === log.participant_id);
          return (
            <Card key={log.id} padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={author?.name} color={author?.avatar_color || C.brand} size={32} />
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
      <PageHeader title="정산 내역" subtitle="강서사랑상품권 (월 1회 일괄 발급)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="누적 정산액" value={krw(totalEarned)} color={C.gold} icon={<Wallet size={16} color={C.gold} />} />
        <StatCard label="누적 활동시간" value={`${totalHours}h`} icon={<Clock size={16} color={C.brand} />} />
        <StatCard label="발급 횟수" value={`${settlements.filter(s => s.status === 'paid').length}회`} icon={<Award size={16} color={C.sage} />} />
      </div>

      <Card padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.ink }}>발급 내역</div>
        {settlements.length === 0 ? (
          <Empty icon={<Wallet size={42} />} title="정산 내역이 없습니다" sub="월 1일에 자동 발급됩니다" />
        ) : settlements.map((s) => (
          <div key={s.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.borderSoft}` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 3 }}>{s.month.replace('-', '년 ')}월 활동분</div>
              <div style={{ fontSize: 11, color: C.mute, display: 'flex', gap: 10 }}>
                <span>{s.total_hours}시간</span>
                <span>·</span>
                <span>{fmtDate(s.issued_at)} 발급</span>
                <span>·</span>
                <span style={{ fontFamily: 'monospace' }}>{s.voucher_code}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}>{krw(s.amount_krw)}</div>
              <Badge color={s.status === 'paid' ? C.sage : C.amber} soft={s.status === 'paid' ? C.sageSoft : C.amberSoft}>
                {s.status === 'paid' ? '발급완료' : '발급예정'}
              </Badge>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

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
    return state.activities.filter((a) => a.match_id === match.id).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }, [state.activities, match]);
  const nextActivity = myActivities.find((a) => a.status === 'scheduled');
  const mySettlements = useMemo(() => state.settlements.filter((s) => s.participant_id === user.id), [state.settlements, user.id]);
  const totalEarned = mySettlements.filter((s) => s.status === 'paid').reduce((s, x) => s + x.amount_krw, 0);

  return (
    <Layout role="senior" view={view} setView={setView} user={user} dispatch={dispatch}>
      {view === 'dashboard' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em', fontFamily: SERIF_STACK, lineHeight: 1.2 }}>
              안녕하세요,<br />{user.name} 님
            </div>
            <div style={{ fontSize: 18, color: C.mute, marginTop: 8 }}>오늘은 {fmtDate(TODAY)} 입니다</div>
          </div>

          {/* 다음 만남 — 크게 강조 */}
          {nextActivity && youth && (
            <Card padding={28} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.lavenderSoft} 0%, ${C.cream} 100%)`, border: `2px solid ${C.lavender}40` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.lavender, letterSpacing: '0.05em', marginBottom: 14 }}>다음 만남</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
                <Avatar name={youth.name} color={C.sage} size={86} />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', fontFamily: SERIF_STACK, lineHeight: 1.1 }}>
                    {youth.name} 청년
                  </div>
                  {child && <div style={{ fontSize: 20, color: C.inkSoft, marginTop: 6 }}>그리고 <strong style={{ color: C.peach }}>{child.name}</strong> 아이</div>}
                </div>
              </div>
              <div style={{ marginTop: 22, padding: 20, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}>
                  {fmtRelativeDate(nextActivity.scheduled_at)} · {nextActivity.scheduled_at.split(' ')[1]}
                </div>
                <div style={{ fontSize: 17, color: C.inkSoft, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} /> {nextActivity.location}
                </div>
                <div style={{ fontSize: 17, color: C.inkSoft, marginTop: 6 }}>{nextActivity.type} · {nextActivity.duration_hours}시간</div>
              </div>
            </Card>
          )}

          {/* 이번 달 받은 상품권 */}
          <Card padding={24} style={{ marginBottom: 20, background: C.goldSoft, border: `2px solid ${C.gold}40` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gold, letterSpacing: '0.05em', marginBottom: 8 }}>지금까지 받은 상품권</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em', fontFamily: SERIF_STACK, lineHeight: 1 }}>
              {krw(totalEarned)}
            </div>
            <div style={{ fontSize: 16, color: C.inkSoft, marginTop: 10 }}>{mySettlements.length}회 정산 완료</div>
          </Card>

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
          <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, marginBottom: 8, fontFamily: SERIF_STACK, letterSpacing: '-0.03em' }}>받은 상품권</div>
          <div style={{ fontSize: 17, color: C.mute, marginBottom: 24 }}>강서사랑상품권은 동네 가맹점에서 사용하실 수 있습니다</div>
          <Card padding={28} style={{ marginBottom: 20, background: C.goldSoft, border: `2px solid ${C.gold}40` }}>
            <div style={{ fontSize: 16, color: C.gold, fontWeight: 700, marginBottom: 8 }}>누적 합계</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.03em', lineHeight: 1 }}>{krw(totalEarned)}</div>
          </Card>
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
    <Card padding={24} style={{ border: `2px solid ${C.redSoft}`, background: C.card }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.red, letterSpacing: '0.05em', marginBottom: 6 }}>도움이 필요하실 때</div>
      <div style={{ fontSize: 17, color: C.inkSoft, marginBottom: 16 }}>
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
    </Card>
  );
}


// ============================================================================
// 8. LAYOUT WRAPPER
// ============================================================================

function Layout({ role, view, setView, user, dispatch, children, state }) {
  const dataCount = useMemo(() => {
    if (role !== 'coordinator') return {};
    return {
      applicants: state?.applications?.filter(a => a.status === 'screening' || a.status === 'verified').length || 0,
      matches: state?.matches?.filter(m => m.status === 'active').length || 0,
      pendingLogs: state?.activity_logs?.filter(l => !l.approved).length || 0,
      openIncidents: state?.safety_incidents?.filter(i => i.status === 'open' || i.status === 'in_progress').length || 0,
    };
  }, [role, state]);

  const handleLogout = () => dispatch({ type: 'LOGOUT' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, color: C.ink }}>
      <Sidebar role={role} currentView={view} onNavigate={setView} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
      <div style={{ flex: 1, minWidth: 0, padding: role === 'senior' ? '32px 40px' : '28px 36px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: role === 'senior' ? 880 : 1280, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9. PARENT (양육가정) APP
// ============================================================================

function ParentApp({ state, user, dispatch, showToast }) {
  const [view, setView] = useState('dashboard');

  const myChildren = state.participants.filter(p => p.type === 'child' && p.parent_id === user.id);
  const myMatches = state.matches.filter(m => myChildren.some(c => c.id === m.child_id) && m.status === 'active');
  const childIds = myChildren.map(c => c.id);

  const todayActivities = state.activities.filter(a =>
    actDate(a) === TODAY && myMatches.some(m => m.id === a.match_id)
  );
  const upcomingActivities = state.activities
    .filter(a => actDate(a) >= TODAY && a.status === 'scheduled' && myMatches.some(m => m.id === a.match_id))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    .slice(0, 5);

  const recentLogs = state.activity_logs
    .filter(l => state.activities.find(a => a.id === l.activity_id && myMatches.some(m => m.id === a.match_id)))
    .sort((a, b) => logDate(state, b).localeCompare(logDate(state, a)))
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
    .filter(l => l.approved && logMonth(state, l) === TODAY.slice(0, 7) &&
      state.activities.find(a => a.id === l.activity_id && myMatches.some(m => m.id === a.match_id)))
    .reduce((sum, l) => sum + l.hours, 0);

  return (
    <>
      <PageHeader title={`안녕하세요, ${user.name}님`} subtitle="아이의 오늘 활동과 트리오 소식을 확인하세요" />

      {/* 트리오 카드 */}
      {match && (
        <Card padding={24} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.peach}15 0%, ${C.brand}10 100%)`, border: `1px solid ${C.peach}50` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <Heart size={18} style={{ color: C.brand }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, letterSpacing: '0.08em' }}>우리 아이의 트리오</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <TrioMember person={child} sub="자녀" color={C.peach} />
            <TrioMember person={youth} sub={`청년 멘토 · ${youth?.skills?.[0] || '활동'}`} color={C.sage} />
            <TrioMember person={senior} sub={`동네 어르신 · ${senior?.skills?.[0] || ''}`} color={C.lavender} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.mute, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>이번 달 활동시간</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{totalHoursThisMonth}시간</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.mute, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>매칭 시작</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{fmtDate(match.started_at)}</div>
            </div>
          </div>
        </Card>
      )}

      {/* 오늘 활동 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 20 }}>
        <Card padding={22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>오늘의 활동</div>
            <Badge color={C.brand} soft={C.brandSoft}>{todayActivities.length}건</Badge>
          </div>
          {todayActivities.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: C.mute }}>
              <Coffee size={32} style={{ color: C.muteSoft, marginBottom: 10 }} />
              <div style={{ fontSize: 14 }}>오늘은 예정된 활동이 없습니다.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayActivities.map(act => {
                const m = state.matches.find(mm => mm.id === act.match_id);
                const y = state.participants.find(p => p.id === m?.youth_id);
                return (
                  <div key={act.id} style={{ padding: 14, background: C.bg, borderRadius: 10, border: `1px solid ${C.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{act.type}</div>
                      <Badge color={C.sage} soft={C.sageSoft}>{act.type}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: C.inkSoft }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {actTime(act)}</span>
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
              <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>처리 중인 안전 이슈가 있습니다.</div>
              <Button variant="secondary" size="sm" fullWidth style={{ marginTop: 14 }} onClick={() => setView('safety')}>자세히 보기</Button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.success, fontFamily: SERIF_STACK }}>안전</div>
              <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>모든 활동이 정상 진행 중입니다.</div>
              <Button variant="ghost" size="sm" fullWidth style={{ marginTop: 14 }} onClick={() => setView('safety')} icon={<Phone size={14} />}>긴급 연락처</Button>
            </>
          )}
        </Card>
      </div>

      {/* 다가오는 활동 */}
      <Card padding={22} style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: C.ink }}>다가오는 활동</div>
        {upcomingActivities.length === 0 ? (
          <Empty icon={<Calendar size={28} />} title="예정된 활동이 없습니다" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingActivities.map(act => {
              const m = state.matches.find(mm => mm.id === act.match_id);
              const y = state.participants.find(p => p.id === m?.youth_id);
              return (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 8, background: C.bg }}>
                  <div style={{ minWidth: 64, textAlign: 'center', padding: '6px 8px', background: C.card, borderRadius: 6, border: `1px solid ${C.borderSoft}` }}>
                    <div style={{ fontSize: 10, color: C.mute, fontWeight: 600 }}>{fmtRelativeDate(actDate(act))}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 1 }}>{actTime(act)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{act.type}</div>
                    <div style={{ fontSize: 11, color: C.inkSoft }}>{act.location} · {y?.name}</div>
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
          <Empty icon={<PenLine size={28} />} title="아직 기록이 없습니다" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentLogs.map(log => {
              const act = state.activities.find(a => a.id === log.activity_id);
              const author = state.participants.find(p => p.id === log.participant_id);
              return (
                <div key={log.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                  <Avatar name={author?.name} size={36} color={PERSONA[author?.type]?.color || C.brand} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{author?.name}</span>
                      <span style={{ fontSize: 11, color: C.mute }}>· {fmtDate(logDate(state, log))} · {act?.type}</span>
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
    </>
  );
}

function ParentToday({ todayActivities, upcomingActivities, myMatches, state }) {
  return (
    <>
      <PageHeader title="오늘의 활동" subtitle={fmtDate(TODAY)} />
      <Card padding={22} style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: C.ink }}>오늘 ({todayActivities.length}건)</div>
        {todayActivities.length === 0 ? (
          <Empty icon={<Coffee size={28} />} title="오늘은 활동이 없습니다" sub="다음 활동을 확인해보세요" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {todayActivities.map(act => <ActivityCard key={act.id} activity={act} state={state} />)}
          </div>
        )}
      </Card>
      <Card padding={22}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: C.ink }}>다가오는 활동</div>
        {upcomingActivities.length === 0 ? <Empty icon={<Calendar size={28} />} title="예정된 활동이 없습니다" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingActivities.map(act => <ActivityCard key={act.id} activity={act} state={state} />)}
          </div>
        )}
      </Card>
    </>
  );
}

function ActivityCard({ activity, state }) {
  const m = state.matches.find(mm => mm.id === activity.match_id);
  const y = state.participants.find(p => p.id === m?.youth_id);
  const s = state.participants.find(p => p.id === m?.senior_id);
  const c = state.participants.find(p => p.id === m?.child_id);
  return (
    <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: C.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{activity.type}</div>
        <Badge color={C.sage} soft={C.sageSoft}>{activity.status === 'completed' ? '완료' : '예정'}</Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: C.inkSoft, marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {fmtRelativeDate(actDate(activity))} {actTime(activity)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {activity.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {activity.duration_hours}시간</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[y, s, c].filter(Boolean).map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: C.card, borderRadius: 999, fontSize: 11, color: C.inkSoft }}>
            <Avatar name={p.name} size={18} color={PERSONA[p.type]?.color || C.brand} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <Heart size={16} style={{ color: C.brand }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, letterSpacing: '0.06em' }}>매칭 #{match.id.toUpperCase()}</div>
                  <Badge color={C.success} soft={C.successSoft}>{match.status === 'active' ? '활동 중' : match.status}</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  {[
                    { p: child, label: '자녀', color: C.peach },
                    { p: youth, label: '청년 멘토', color: C.sage },
                    { p: senior, label: '동네 어르신', color: C.lavender },
                  ].map(({ p, label, color }) => p && (
                    <div key={p.id} style={{ padding: 16, borderRadius: 12, background: C.bg, border: `1px solid ${C.borderSoft}` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
                        <Avatar name={p.name} size={64} color={color} />
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginTop: 10, fontFamily: SERIF_STACK }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: color, fontWeight: 700, letterSpacing: '0.06em', marginTop: 3 }}>{label}</div>
                      </div>
                      <div style={{ fontSize: 11, color: C.inkSoft, lineHeight: 1.6, padding: '10px 0', borderTop: `1px dashed ${C.borderSoft}` }}>
                        {p.bio || (p.type === 'child' ? `${p.age}세 · ${p.school || ''}` : '')}
                      </div>
                      {p.skills?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {p.skills.slice(0, 3).map((s, i) => (
                            <span key={i} style={{ fontSize: 10, padding: '2px 7px', background: C.card, borderRadius: 999, color: C.inkSoft, border: `1px solid ${C.borderSoft}` }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: 16, background: `${C.brand}08`, borderRadius: 10, border: `1px dashed ${C.brand}40` }}>
                  <div style={{ fontSize: 11, color: C.brand, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>코디네이터 메모</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <Card padding={20} style={{ background: `${C.success}08`, border: `1px solid ${C.success}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Phone size={18} style={{ color: C.success }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>코디네이터 직통</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>한가은</div>
          <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>010-2345-6789</div>
          <div style={{ fontSize: 11, color: C.mute, marginTop: 8 }}>평일 9시~21시 / 주말 10시~18시 응답</div>
        </Card>
        <Card padding={20} style={{ background: `${C.red}08`, border: `1px solid ${C.red}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <ShieldAlert size={18} style={{ color: C.red }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>긴급 시</div>
          </div>
          <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.7 }}>
            아이의 안전이 위협받는 즉시 위험 상황에서는 <strong style={{ color: C.red }}>112</strong> 또는 <strong style={{ color: C.red }}>119</strong>에 먼저 신고 후 코디네이터에게 알려주세요.
          </div>
        </Card>
      </div>

      <Card padding={22}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: C.ink }}>안전 이슈 이력</div>
        {myIncidents.length === 0 ? (
          <Empty icon={<ShieldCheck size={28} />} title="안전 이슈가 없습니다" sub="안전하게 활동 중입니다" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myIncidents.map(inc => (
              <div key={inc.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${C.borderSoft}`, background: C.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Badge color={inc.severity === 'high' ? C.red : C.amber} soft={inc.severity === 'high' ? C.redSoft : C.amberSoft}>{inc.severity === 'high' ? '높음' : inc.severity === 'medium' ? '중간' : '낮음'}</Badge>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{inc.category}</span>
                  <Badge color={inc.status === 'resolved' ? C.success : C.amber} soft={inc.status === 'resolved' ? C.successSoft : C.amberSoft}>{inc.status === 'resolved' ? '해결됨' : '처리 중'}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>{inc.description}</div>
                <div style={{ fontSize: 11, color: C.mute }}>접수: {inc.reported_at}{inc.resolved_at && ` · 해결: ${inc.resolved_at}`}</div>
                {inc.resolution && <div style={{ fontSize: 12, color: C.success, marginTop: 6, padding: 8, background: C.successSoft, borderRadius: 6 }}>처리 내용: {inc.resolution}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

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
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: form.severity === opt.k ? `2px solid ${opt.c}` : `1px solid ${C.border}`,
                  background: form.severity === opt.k ? `${opt.c}15` : C.card, color: form.severity === opt.k ? opt.c : C.inkSoft,
                  fontWeight: form.severity === opt.k ? 700 : 500, cursor: 'pointer', fontFamily: FONT_STACK, fontSize: 13 }}>{opt.l}</button>
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

// ============================================================================
// 10. OPENAI(GPT) API — 직접 키 입력 · 토큰 사용량 표시 · 최소 호출
// ============================================================================
// 보안 안내: 키를 브라우저에 저장하므로 네트워크 탭/소스에 노출될 수 있습니다.
// 데모·내부용에 적합하며, 외부 공개 서비스라면 서버(서버리스 함수)로 프록시하세요.

const AI_PROVIDER_LS = 'eum:ai_provider';
const AI_USAGE_LS = 'eum:ai_usage';

// 제공자별 설정 (키/모델 직접 입력)
const AI_PROVIDERS = {
  openai: {
    label: 'OpenAI (GPT)', keyLS: 'eum:openai_key', modelLS: 'eum:openai_model',
    defaultModel: 'gpt-4o-mini', keyHint: 'sk-...', keyUrl: 'platform.openai.com/api-keys',
    models: [
      { value: 'gpt-4o-mini', label: 'gpt-4o-mini (저렴·권장)' },
      { value: 'gpt-4o', label: 'gpt-4o (고품질)' },
      { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
    ],
  },
  gemini: {
    label: 'Google (Gemini)', keyLS: 'eum:gemini_key', modelLS: 'eum:gemini_model',
    defaultModel: 'gemini-2.0-flash', keyHint: 'AIza...', keyUrl: 'aistudio.google.com/apikey',
    models: [
      { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash (저렴·권장)' },
      { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
      { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (고품질)' },
    ],
  },
  anthropic: {
    label: 'Anthropic (Claude)', keyLS: 'eum:anthropic_key', modelLS: 'eum:anthropic_model',
    defaultModel: 'claude-3-5-haiku-latest', keyHint: 'sk-ant-...', keyUrl: 'console.anthropic.com/settings/keys',
    models: [
      { value: 'claude-3-5-haiku-latest', label: 'claude-3.5-haiku (저렴·권장)' },
      { value: 'claude-3-5-sonnet-latest', label: 'claude-3.5-sonnet (고품질)' },
      { value: 'claude-3-haiku-20240307', label: 'claude-3-haiku' },
    ],
  },
};
const PROVIDER_ORDER = ['openai', 'gemini', 'anthropic'];

const _ls = {
  get: (k, d = '') => { try { return (typeof window !== 'undefined' && window.localStorage) ? (window.localStorage.getItem(k) ?? d) : d; } catch { return d; } },
  set: (k, v) => { try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(k, v); } catch {} },
};
const fireAi = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('eum-ai')); };

const getProvider = () => { const p = _ls.get(AI_PROVIDER_LS, 'openai'); return AI_PROVIDERS[p] ? p : 'openai'; };
const setProviderLS = (p) => { _ls.set(AI_PROVIDER_LS, p); fireAi(); };
const getKeyFor = (prov) => _ls.get(AI_PROVIDERS[prov].keyLS, '');
const setKeyFor = (prov, k) => { _ls.set(AI_PROVIDERS[prov].keyLS, k); fireAi(); };
const getModelFor = (prov) => _ls.get(AI_PROVIDERS[prov].modelLS, '') || AI_PROVIDERS[prov].defaultModel;
const setModelFor = (prov, m) => { _ls.set(AI_PROVIDERS[prov].modelLS, m); fireAi(); };
// 현재 선택된 제공자 기준
const getApiKey = () => getKeyFor(getProvider());

const ZERO_USAGE = { calls: 0, prompt: 0, completion: 0, total: 0, last: null };
const getUsage = () => { try { return { ...ZERO_USAGE, ...(JSON.parse(_ls.get(AI_USAGE_LS, 'null')) || {}) }; } catch { return { ...ZERO_USAGE }; } };
const addUsage = (u, provider) => {
  const cur = getUsage();
  const last = { prompt: u?.prompt_tokens || 0, completion: u?.completion_tokens || 0, total: u?.total_tokens || 0, provider, at: new Date().toISOString().slice(0, 16).replace('T', ' ') };
  const next = { calls: cur.calls + 1, prompt: cur.prompt + last.prompt, completion: cur.completion + last.completion, total: cur.total + last.total, last };
  _ls.set(AI_USAGE_LS, JSON.stringify(next));
  fireAi();
  return next;
};
const resetUsage = () => { _ls.set(AI_USAGE_LS, JSON.stringify(ZERO_USAGE)); fireAi(); };

// AI 키/사용량 구독 훅 (localStorage + 커스텀 이벤트로 화면 동기화)
function useAiStore() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force(x => x + 1);
    window.addEventListener('eum-ai', h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener('eum-ai', h); window.removeEventListener('storage', h); };
  }, []);
  const provider = getProvider();
  return {
    provider, setProvider: setProviderLS,
    apiKey: getKeyFor(provider), model: getModelFor(provider),
    setKeyFor, getKeyFor, setModelFor, getModelFor,
    usage: getUsage(), resetUsage,
  };
}

// --- 제공자별 호출 (응답 → { text, usage:{prompt_tokens,completion_tokens,total_tokens} } 정규화) ---
async function callOpenAI({ apiKey, model, system, user, maxTokens }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.5, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  });
  if (!res.ok) { let d = ''; try { d = (await res.json())?.error?.message || ''; } catch {} throw new Error(`OpenAI ${res.status}${d ? ': ' + d : ''}`); }
  const data = await res.json();
  const u = data.usage || {};
  return { text: data.choices?.[0]?.message?.content || '', usage: { prompt_tokens: u.prompt_tokens || 0, completion_tokens: u.completion_tokens || 0, total_tokens: u.total_tokens || 0 } };
}
async function callGemini({ apiKey, model, system, user, maxTokens }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.5 },
    }),
  });
  if (!res.ok) { let d = ''; try { d = (await res.json())?.error?.message || ''; } catch {} throw new Error(`Gemini ${res.status}${d ? ': ' + d : ''}`); }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  const m = data.usageMetadata || {};
  return { text, usage: { prompt_tokens: m.promptTokenCount || 0, completion_tokens: m.candidatesTokenCount || 0, total_tokens: m.totalTokenCount || ((m.promptTokenCount || 0) + (m.candidatesTokenCount || 0)) } };
}
async function callAnthropic({ apiKey, model, system, user, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) { let d = ''; try { d = (await res.json())?.error?.message || ''; } catch {} throw new Error(`Claude ${res.status}${d ? ': ' + d : ''}`); }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  const u = data.usage || {};
  return { text, usage: { prompt_tokens: u.input_tokens || 0, completion_tokens: u.output_tokens || 0, total_tokens: (u.input_tokens || 0) + (u.output_tokens || 0) } };
}

// 통합 호출 — 선택된 제공자로 라우팅, usage 누적
async function callAI({ system, user, maxTokens = 1024 }) {
  const provider = getProvider();
  const apiKey = getKeyFor(provider);
  if (!apiKey) { const e = new Error('NO_API_KEY'); e.code = 'NO_API_KEY'; throw e; }
  const model = getModelFor(provider);
  const args = { apiKey, model, system, user, maxTokens };
  const fn = provider === 'gemini' ? callGemini : provider === 'anthropic' ? callAnthropic : callOpenAI;
  const out = await fn(args);
  if (out.usage) addUsage(out.usage, provider);
  return out;
}

// 토큰 단위 콤마 포맷
const tk = (n) => (n || 0).toLocaleString('ko-KR');

// AI 설정/사용량 바 — AI 기능 화면 상단 (제공자 선택 + 키 직접 입력 + 토큰 사용량)
function AiKeyBar({ lastCall }) {
  const { provider, setProvider, usage, getKeyFor, setKeyFor, getModelFor, setModelFor, resetUsage } = useAiStore();
  const apiKey = getKeyFor(provider);
  const model = getModelFor(provider);
  const cfg = AI_PROVIDERS[provider];
  const hasKey = !!apiKey;
  const [open, setOpen] = useState(!apiKey);
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(false);

  // 제공자 전환 시 입력칸을 해당 제공자의 저장된 키로 초기화
  useEffect(() => { setDraft(getKeyFor(provider)); }, [provider]);

  const connectedCount = PROVIDER_ORDER.filter(p => !!getKeyFor(p)).length;

  return (
    <Card padding={0} style={{ marginBottom: 16, border: `1px solid ${hasKey ? C.border : C.amber + '66'}`, background: hasKey ? C.card : C.amberSoft + '66' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 6, borderRadius: 8, background: hasKey ? C.sageSoft : C.amberSoft, display: 'flex' }}>
            <Sparkles size={16} color={hasKey ? C.sage : C.amber} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{cfg.label} {hasKey ? '연결됨' : '키 필요'}</div>
            <div style={{ fontSize: 11, color: C.mute }}>{hasKey ? `모델 ${model} · 연결된 제공자 ${connectedCount}/3` : 'AI 기능을 쓰려면 키를 입력하세요'}</div>
          </div>
        </div>

        {/* 토큰 사용량 표시 (제공자 공통 누적) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.mute, fontWeight: 700, letterSpacing: '0.04em' }}>누적 토큰</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{tk(usage.total)} <span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>({usage.calls}회)</span></div>
          </div>
          {(lastCall || usage.last) && (
            <div style={{ textAlign: 'right', paddingLeft: 14, borderLeft: `1px solid ${C.borderSoft}` }}>
              <div style={{ fontSize: 10, color: C.mute, fontWeight: 700, letterSpacing: '0.04em' }}>최근 호출</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, fontFamily: SERIF_STACK }}>
                {tk((lastCall || usage.last).total)} 토큰
                <span style={{ fontSize: 10, color: C.mute, fontWeight: 600, marginLeft: 4 }}>
                  (입력 {tk((lastCall || usage.last).prompt)} · 출력 {tk((lastCall || usage.last).completion)})
                </span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" icon={<Settings size={14} />} onClick={() => setOpen(o => !o)}>설정</Button>
        </div>
      </div>

      {open && (
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.borderSoft}`, background: C.cream, borderRadius: '0 0 14px 14px' }}>
          {/* 제공자 선택 탭 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {PROVIDER_ORDER.map(p => {
              const sel = p === provider;
              const connected = !!getKeyFor(p);
              return (
                <button key={p} onClick={() => setProvider(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10,
                    border: `1.5px solid ${sel ? C.brand : C.border}`, background: sel ? C.brandSoft : C.card,
                    color: sel ? C.brand : C.inkSoft, fontWeight: sel ? 700 : 500, fontSize: 13,
                    cursor: 'pointer', fontFamily: FONT_STACK, transition: 'all 0.12s',
                  }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: connected ? C.sage : C.border }} />
                  {AI_PROVIDERS[p].label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 280px', minWidth: 240 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{cfg.label} API 키 ({cfg.keyHint})</div>
              <div style={{ position: 'relative' }}>
                <Input value={draft} onChange={setDraft} placeholder={cfg.keyHint} type={show ? 'text' : 'password'} icon={<Hash size={14} />} style={{ paddingRight: 38 }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.mute, display: 'flex' }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div style={{ width: 220 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>모델</div>
              <Select value={model} onChange={(m) => setModelFor(provider, m)} options={cfg.models} />
            </div>
            <Button variant="brand" icon={<Check size={15} />} onClick={() => { setKeyFor(provider, draft.trim()); if (draft.trim()) setOpen(false); }}>저장</Button>
            {hasKey && <Button variant="secondary" onClick={() => { setKeyFor(provider, ''); setDraft(''); }}>키 삭제</Button>}
          </div>

          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, color: C.mute, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={13} color={C.amber} /> 키는 이 브라우저(localStorage)에만 저장됩니다. 발급: {cfg.keyUrl}
            </div>
            <button onClick={resetUsage} style={{ background: 'none', border: 'none', color: C.mute, fontSize: 11, cursor: 'pointer', textDecoration: 'underline', fontFamily: FONT_STACK }}>사용량 초기화</button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// 11. COORDINATOR (코디네이터 관제실) APP
// ============================================================================

function CoordinatorApp({ state, user, dispatch, showToast }) {
  const [view, setView] = useState('overview');

  return (
    <Layout role="coordinator" view={view} setView={setView} user={user} dispatch={dispatch} state={state}>
      {view === 'overview' && <CoordOverview state={state} setView={setView} />}
      {view === 'applicants' && <CoordApplicants state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'matching' && <CoordMatching state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'activities' && <CoordActivities state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'settlements' && <CoordSettlements state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'safety' && <CoordSafety state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'reports' && <CoordReports state={state} dispatch={dispatch} showToast={showToast} />}
    </Layout>
  );
}

// --- 11.1 Overview (KPI dashboard) ---

function CoordOverview({ state, setView }) {
  const kpis = useMemo(() => {
    const totalParticipants = state.participants.filter(p => p.type !== 'coordinator').length;
    const youthCount = state.participants.filter(p => p.type === 'youth' && p.status === 'active').length;
    const seniorCount = state.participants.filter(p => p.type === 'senior' && p.status === 'active').length;
    const parentCount = state.participants.filter(p => p.type === 'parent' && p.status === 'active').length;
    const childCount = state.participants.filter(p => p.type === 'child').length;
    const activeMatches = state.matches.filter(m => m.status === 'active').length;
    const totalHours = state.activity_logs.filter(l => l.approved).reduce((s, l) => s + l.hours, 0);
    const totalSettled = state.settlements.filter(s => s.status === 'paid').reduce((s, x) => s + x.amount_krw, 0);
    const pendingLogs = state.activity_logs.filter(l => !l.approved).length;
    const openIncidents = state.safety_incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    const pendingApps = state.applications.filter(a => a.status === 'screening' || a.status === 'verified').length;
    return { totalParticipants, youthCount, seniorCount, parentCount, childCount, activeMatches, totalHours, totalSettled, pendingLogs, openIncidents, pendingApps };
  }, [state]);

  // 월별 활동 차트 데이터
  const monthlyChart = useMemo(() => {
    const months = {};
    state.activity_logs.filter(l => l.approved).forEach(l => {
      const m = logMonth(state, l);
      if (!m) return;
      if (!months[m]) months[m] = { month: m, hours: 0, count: 0 };
      months[m].hours += l.hours;
      months[m].count += 1;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).map(x => ({
      month: x.month.slice(5) + '월', hours: x.hours, count: x.count,
    }));
  }, [state]);

  // 활동 타입 분포
  const typeChart = useMemo(() => {
    const types = {};
    state.activities.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
    const colors = { 디지털코칭: C.lavender, 학습멘토: C.peach, 진로조언받기: C.brand, 기억아카이브: C.gold };
    return Object.entries(types).map(([type, count]) => ({ name: type, value: count, color: colors[type] || C.mute }));
  }, [state]);

  return (
    <>
      <PageHeader title="대시보드" subtitle={`${fmtDate(TODAY)} · 우장산동 1차 파일럿`} />

      {/* 알림 영역 */}
      {(kpis.openIncidents > 0 || kpis.pendingApps > 0 || kpis.pendingLogs > 5) && (
        <Card padding={16} style={{ marginBottom: 18, background: C.amberSoft, border: `1px solid ${C.amber}50` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={18} style={{ color: C.amber }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>처리가 필요한 항목이 있습니다</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {kpis.openIncidents > 0 && <Button variant="ghost" size="sm" onClick={() => setView('safety')}>안전 이슈 {kpis.openIncidents}건</Button>}
              {kpis.pendingApps > 0 && <Button variant="ghost" size="sm" onClick={() => setView('applicants')}>검토 대기 {kpis.pendingApps}건</Button>}
              {kpis.pendingLogs > 0 && <Button variant="ghost" size="sm" onClick={() => setView('activities')}>승인 대기 {kpis.pendingLogs}건</Button>}
            </div>
          </div>
        </Card>
      )}

      {/* KPI 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard label="참여자" value={kpis.totalParticipants} sub={`청년 ${kpis.youthCount} / 어르신 ${kpis.seniorCount} / 양육 ${kpis.parentCount}`} color={C.brand} icon={<Users size={18} />} />
        <StatCard label="활성 매칭" value={kpis.activeMatches} sub={`목표 8건 중 ${kpis.activeMatches}건 진행`} color={C.sage} icon={<Heart size={18} />} trend={kpis.activeMatches >= 3 ? `+${kpis.activeMatches - 0}` : null} />
        <StatCard label="누적 활동시간" value={`${kpis.totalHours}h`} sub={`목표 1,440시간 중 ${Math.round(kpis.totalHours / 1440 * 100)}%`} color={C.lavender} icon={<Clock size={18} />} />
        <StatCard label="지급 정산" value={krw(kpis.totalSettled)} sub={`${state.settlements.filter(s => s.status === 'paid').length}건 발급 완료`} color={C.gold} icon={<Wallet size={18} />} />
      </div>

      {/* 차트 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card padding={22}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4 }}>월별 활동 추이</div>
          <div style={{ fontSize: 12, color: C.mute, marginBottom: 14 }}>승인된 활동 기록 기준</div>
          {monthlyChart.length === 0 ? <Empty icon={<TrendingUp size={28} />} title="활동 기록 없음" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.brand} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={C.brand} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} />
                <XAxis dataKey="month" stroke={C.mute} fontSize={11} fontFamily={FONT_STACK} />
                <YAxis stroke={C.mute} fontSize={11} fontFamily={FONT_STACK} />
                <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_STACK, fontSize: 12 }} />
                <Area type="monotone" dataKey="hours" stroke={C.brand} strokeWidth={2.5} fill="url(#hours)" name="활동시간" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card padding={22}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4 }}>활동 유형 분포</div>
          <div style={{ fontSize: 12, color: C.mute, marginBottom: 14 }}>전체 활동 기준</div>
          {typeChart.length === 0 ? <Empty icon={<Activity size={28} />} title="활동 없음" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={typeChart} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {typeChart.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_STACK, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontFamily: FONT_STACK, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* 최근 활동 + 미처리 항목 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Card padding={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>최근 활동 기록</div>
            <Button variant="ghost" size="sm" onClick={() => setView('activities')} iconRight={<ArrowRight size={12} />}>전체보기</Button>
          </div>
          {state.activity_logs.slice(-5).reverse().map(log => {
            const author = state.participants.find(p => p.id === log.participant_id);
            const act = state.activities.find(a => a.id === log.activity_id);
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                <Avatar name={author?.name} size={32} color={PERSONA[author?.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{author?.name} · {act?.type}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>{fmtDate(logDate(state, log))} · {log.hours}시간</div>
                </div>
                {log.approved ? <Badge color={C.success} soft={C.successSoft} size="sm">승인</Badge> : <Badge color={C.amber} soft={C.amberSoft} size="sm">대기</Badge>}
              </div>
            );
          })}
        </Card>
        <Card padding={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>오늘의 활동 일정</div>
            <Badge color={C.brand} soft={C.brandSoft}>{state.activities.filter(a => actDate(a) === TODAY).length}건</Badge>
          </div>
          {state.activities.filter(a => actDate(a) === TODAY).length === 0 ? (
            <Empty icon={<Calendar size={24} />} title="오늘은 예정된 활동이 없습니다" />
          ) : state.activities.filter(a => actDate(a) === TODAY).map(act => {
            const m = state.matches.find(mm => mm.id === act.match_id);
            const y = state.participants.find(p => p.id === m?.youth_id);
            return (
              <div key={act.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ minWidth: 50, fontSize: 13, fontWeight: 700, color: C.brand, fontFamily: SERIF_STACK }}>{actTime(act)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{act.type}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>{act.location} · {y?.name}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}

// --- 11.2 Applicants (신청자 관리) ---

function CoordApplicants({ state, dispatch, showToast, user }) {
  const [activeTab, setActiveTab] = useState('screening');
  const [selectedApp, setSelectedApp] = useState(null);

  const counts = useMemo(() => ({
    screening: state.applications.filter(a => a.status === 'screening').length,
    verified: state.applications.filter(a => a.status === 'verified').length,
    completed: state.applications.filter(a => a.status === 'completed').length,
    rejected: state.applications.filter(a => a.status === 'rejected').length,
  }), [state]);

  const filtered = state.applications.filter(a => a.status === activeTab);

  const updateVerif = (appId, stepKey, status) => {
    dispatch({ type: 'UPDATE_VERIFICATION', payload: { application_id: appId, step: stepKey, status, verified_by: user.id } });
    showToast({ type: 'success', message: `검증 단계가 업데이트되었습니다.` });
  };

  const advanceStatus = (appId, newStatus) => {
    dispatch({ type: 'UPDATE_APPLICATION', payload: { id: appId, status: newStatus } });
    if (newStatus === 'completed') {
      // 참여자 활성화
      const app = state.applications.find(a => a.id === appId);
      if (app) dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id: app.participant_id, status: 'active' } });
    }
    showToast({ type: 'success', message: `신청자 상태가 변경되었습니다.` });
    setSelectedApp(null);
  };

  return (
    <>
      <PageHeader title="신청자 관리" subtitle="신청서 검토 → 검증 → 활동 시작" />
      <Tabs
        tabs={[
          { id: 'screening', label: '서류 검토', count: counts.screening },
          { id: 'verified', label: '검증 중', count: counts.verified },
          { id: 'completed', label: '활동 시작', count: counts.completed },
          { id: 'rejected', label: '반려', count: counts.rejected },
        ]}
        active={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 18 }}
      />

      {filtered.length === 0 ? <Empty icon={<UserPlus size={32} />} title={`${activeTab === 'screening' ? '검토 대기' : activeTab === 'verified' ? '검증 중인' : activeTab === 'completed' ? '활동 중인' : '반려된'} 신청자가 없습니다`} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {filtered.map(app => {
            const p = state.participants.find(pp => pp.id === app.participant_id);
            const verifs = state.verifications.filter(v => v.application_id === app.id);
            const passedCount = verifs.filter(v => v.status === 'passed').length;
            const totalSteps = verifs.length;
            return (
              <Card key={app.id} padding={18} hoverable onClick={() => setSelectedApp(app)}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <Avatar name={p?.name} size={48} color={PERSONA[p?.type]?.color || C.brand} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{p?.name}</span>
                      <Badge color={PERSONA[p?.type]?.color || C.mute} soft={C.muteSoft} size="sm">{PERSONA[p?.type]?.label || p?.type}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: C.inkSoft }}>{p?.age}세 · {p?.phone}</div>
                    <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>신청 {fmtDate(app.applied_at)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: C.mute, fontWeight: 600 }}>검증 진행률</span>
                    <span style={{ color: C.ink, fontWeight: 700 }}>{passedCount}/{totalSteps}</span>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalSteps ? (passedCount / totalSteps) * 100 : 0}%`, background: passedCount === totalSteps ? C.success : C.brand, transition: 'width 0.4s' }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="신청자 상세" size="lg" footer={
        selectedApp && <>
          {selectedApp.status === 'screening' && (<>
            <Button variant="danger" onClick={() => advanceStatus(selectedApp.id, 'rejected')}>반려</Button>
            <Button variant="brand" onClick={() => advanceStatus(selectedApp.id, 'verified')}>검증 단계로</Button>
          </>)}
          {selectedApp.status === 'verified' && (
            <Button variant="brand" onClick={() => advanceStatus(selectedApp.id, 'completed')}
              disabled={state.verifications.filter(v => v.application_id === selectedApp.id).some(v => v.status !== 'passed')}
              icon={<CheckCircle2 size={16} />}>활동 승인</Button>
          )}
        </>
      }>
        {selectedApp && (() => {
          const p = state.participants.find(pp => pp.id === selectedApp.participant_id);
          const verifs = state.verifications.filter(v => v.application_id === selectedApp.id);
          return (
            <>
              <div style={{ display: 'flex', gap: 16, padding: 16, background: C.bg, borderRadius: 10, marginBottom: 20 }}>
                <Avatar name={p?.name} size={64} color={PERSONA[p?.type]?.color || C.brand} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{p?.name}</div>
                  <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>{PERSONA[p?.type]?.label} · {p?.age}세{p?.occupation ? ` · ${p.occupation}` : ''}</div>
                  <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{p?.phone} · {p?.address}</div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', marginBottom: 10 }}>지원 동기 · 소개</div>
              <div style={{ padding: 14, background: C.bg, borderRadius: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 16 }}>
                {p?.bio || '특별한 소개글이 없습니다.'}
              </div>

              {p?.skills?.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', marginBottom: 10 }}>잘하는 것</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {p.skills.map((s, i) => <span key={i} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, background: C.brandSoft, color: C.brand, fontWeight: 600 }}>{s}</span>)}
                  </div>
                </>
              )}

              <div style={{ fontSize: 12, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', marginBottom: 10 }}>검증 단계</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {verifs.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, border: `1px solid ${C.borderSoft}`, background: C.card }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: v.status === 'passed' ? C.successSoft : v.status === 'failed' ? C.redSoft : v.status === 'in_progress' ? C.amberSoft : C.bg,
                      color: v.status === 'passed' ? C.success : v.status === 'failed' ? C.red : v.status === 'in_progress' ? C.amber : C.mute }}>
                      {v.status === 'passed' ? <Check size={16} /> : v.status === 'failed' ? <X size={16} /> : v.status === 'in_progress' ? <Clock size={16} /> : <Hash size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{verifLabel(v.step)}</div>
                      <div style={{ fontSize: 11, color: C.mute }}>{v.note || '메모 없음'}</div>
                    </div>
                    {selectedApp.status === 'verified' && v.status !== 'passed' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="ghost" size="sm" onClick={() => updateVerif(selectedApp.id, v.step, 'in_progress')}>진행</Button>
                        <Button variant="success" size="sm" onClick={() => updateVerif(selectedApp.id, v.step, 'passed')}>통과</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </Modal>
    </>
  );
}

function verifLabel(step) {
  const m = {
    interview: '대면 면접',
    criminal_record: '범죄경력 회보',
    abuse_record: '아동학대 전력 회보',
    reference: '추천인 통화',
    guardian_consent: '보호자 동의서',
    document: '서류 제출',
  };
  return m[step] || step;
}

// --- 11.3 Matching (매칭 보드 + AI 추천) ---

function CoordMatching({ state, dispatch, showToast, user }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiLastCall, setAiLastCall] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const matches = state.matches;
  const activeMatches = matches.filter(m => m.status === 'active');
  const proposedMatches = matches.filter(m => m.status === 'proposed');

  // 매칭 가능한 활성 참여자
  const availableYouth = state.participants.filter(p => p.type === 'youth' && p.status === 'active' && !activeMatches.some(m => m.youth_id === p.id));
  const availableSenior = state.participants.filter(p => p.type === 'senior' && p.status === 'active' && !activeMatches.some(m => m.senior_id === p.id));
  const availableChild = state.participants.filter(p => p.type === 'child' && p.status === 'active' && !activeMatches.some(m => m.child_id === p.id));

  const runAiMatching = async () => {
    if (!getApiKey()) {
      showToast({ type: 'error', message: 'AI 매칭을 쓰려면 먼저 상단에서 API 키를 입력하세요.' });
      window.dispatchEvent(new Event('eum-ai'));
      return;
    }
    setAiOpen(true);
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setAiLastCall(null);

    const profileText = (p) => `${p.id} ${p.name}(${p.type}, ${p.age}세) · 잘하는것: ${(p.skills || []).join(', ')} · 관심: ${(p.interests || []).join(', ')} · 가능시간: ${(p.availability || []).join(', ')} · 소개: ${p.bio || ''}`;

    const userPrompt = `다음은 매칭 대기 중인 참여자들입니다.

[청년 (${availableYouth.length}명)]
${availableYouth.slice(0, 8).map(profileText).join('\n')}

[어르신 (${availableSenior.length}명)]
${availableSenior.slice(0, 8).map(profileText).join('\n')}

[아동/양육가정 (${availableChild.length}명)]
${availableChild.slice(0, 8).map(profileText).join('\n')}

이들 중 가장 적합한 청년-어르신-아동 3인 트리오 매칭 2~3개를 추천하고, 각각 추천 이유를 한국어로 2~3문장으로 설명해주세요.

JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{ "recommendations": [ { "youth_id": "...", "senior_id": "...", "child_id": "...", "score": 0~100, "reason": "..." } ] }`;

    try {
      const { text, usage } = await callAI({
        system: '당신은 세대 간 상생 매칭 코디네이터를 돕는 AI입니다. 활동 가능 시간, 잘하는 것/관심사의 보완성, 거주 지역, 안전 요소를 고려해 최적의 트리오를 추천합니다. 반드시 JSON 형식으로만 응답하세요.',
        user: userPrompt,
        maxTokens: 1500,
      });
      if (usage) setAiLastCall({ prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens });
      // JSON 추출
      const cleaned = (text || '').replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      setAiResult(parsed);
    } catch (e) {
      console.error(e);
      // Fallback: 룰 기반 추천 (네트워크/응답 오류 시)
      const fallback = [];
      for (let i = 0; i < Math.min(2, availableYouth.length, availableSenior.length, availableChild.length); i++) {
        const y = availableYouth[i];
        const s = availableSenior[i];
        const c = availableChild[i];
        const commonInterests = (y.interests || []).filter(int => (s.interests || []).includes(int));
        fallback.push({
          youth_id: y.id, senior_id: s.id, child_id: c.id,
          score: 70 + Math.floor(Math.random() * 20),
          reason: `${y.name} 청년의 ${(y.skills || [])[0] || '활동'}능력과 ${s.name} 어르신의 ${(s.skills || [])[0] || '경험'}이 ${c.name} 아동에게 도움이 될 수 있습니다.${commonInterests.length ? ` 공통 관심사: ${commonInterests.join(', ')}.` : ''}`
        });
      }
      setAiResult({ recommendations: fallback, fallback: true });
      setAiError(`GPT 호출 실패(${e.message}) — 룰 기반 추천으로 대체`);
    } finally {
      setAiLoading(false);
    }
  };

  const createMatch = (rec) => {
    const newMatch = {
      id: uid('m'),
      youth_id: rec.youth_id,
      senior_id: rec.senior_id,
      child_id: rec.child_id,
      status: 'proposed',
      started_at: TODAY,
      ended_at: null,
      score: rec.score || 70,
      coordinator_note: rec.reason || 'AI 추천 매칭',
      created_by: user.id,
    };
    dispatch({ type: 'ADD_MATCH', payload: newMatch });
    showToast({ type: 'success', message: '새로운 매칭이 제안되었습니다. 본인 동의 후 활성화하세요.' });
  };

  const activateMatch = (matchId) => {
    dispatch({ type: 'UPDATE_MATCH', payload: { id: matchId, status: 'active' } });
    showToast({ type: 'success', message: '매칭이 활성화되었습니다.' });
    setSelectedMatch(null);
  };

  const closeMatch = (matchId) => {
    dispatch({ type: 'UPDATE_MATCH', payload: { id: matchId, status: 'completed', ended_at: TODAY } });
    showToast({ type: 'success', message: '매칭이 종료되었습니다.' });
    setSelectedMatch(null);
  };

  return (
    <>
      <PageHeader title="매칭 보드" subtitle={`활동 중 ${activeMatches.length}건 · 제안 ${proposedMatches.length}건`}
        right={<Button variant="brand" icon={<Sparkles size={16} />} onClick={runAiMatching}>AI 매칭 추천</Button>} />

      <AiKeyBar lastCall={aiLastCall} />

      {proposedMatches.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', marginBottom: 10 }}>제안된 매칭 · 동의 대기 중</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14, marginBottom: 24 }}>
            {proposedMatches.map(match => <MatchCard key={match.id} match={match} state={state} onClick={() => setSelectedMatch(match)} accent={C.amber} />)}
          </div>
        </>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, color: C.success, letterSpacing: '0.08em', marginBottom: 10 }}>활동 중 매칭</div>
      {activeMatches.length === 0 ? <Empty icon={<Heart size={32} />} title="활성 매칭이 없습니다" sub="AI 추천을 받아 새 매칭을 시작해보세요" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
          {activeMatches.map(match => <MatchCard key={match.id} match={match} state={state} onClick={() => setSelectedMatch(match)} accent={C.success} />)}
        </div>
      )}

      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="AI 매칭 추천" size="lg">
        {aiLoading && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Loader2 size={36} style={{ color: C.brand, animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: 16, fontSize: 14, color: C.inkSoft }}>참여자 프로필을 분석하고 있습니다…</div>
            <div style={{ marginTop: 6, fontSize: 12, color: C.mute }}>잠시만 기다려주세요</div>
          </div>
        )}
        {aiResult && (
          <>
            {aiError && (
              <div style={{ padding: 12, background: C.amberSoft, borderRadius: 8, marginBottom: 16, fontSize: 12, color: C.amber, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={14} /> {aiError}
              </div>
            )}
            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>{aiResult.fallback ? '룰 기반 알고리즘으로 추천된 매칭입니다.' : `AI가 참여자 프로필을 분석해 ${aiResult.recommendations?.length || 0}건의 매칭을 추천했습니다.`}</span>
              {!aiResult.fallback && aiLastCall && <Badge color={C.brand} soft={C.brandSoft} size="sm">이번 호출 {tk(aiLastCall.total)} 토큰</Badge>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(aiResult.recommendations || []).map((rec, idx) => {
                const y = state.participants.find(p => p.id === rec.youth_id);
                const s = state.participants.find(p => p.id === rec.senior_id);
                const c = state.participants.find(p => p.id === rec.child_id);
                if (!y || !s || !c) return null;
                return (
                  <div key={idx} style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.brand}40`, background: `${C.brand}06` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} style={{ color: C.brand }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: '0.06em' }}>추천 #{idx + 1}</div>
                      </div>
                      <Badge color={C.brand} soft={C.brandSoft}>적합도 {rec.score || 75}</Badge>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                      {[{ p: y, label: '청년' }, { p: s, label: '어르신' }, { p: c, label: '아동' }].map(({ p, label }) => (
                        <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 10, background: C.card, borderRadius: 8 }}>
                          <Avatar name={p.name} size={44} color={PERSONA[p.type]?.color || C.brand} />
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 6 }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: C.mute, marginTop: 2 }}>{label} · {p.age}세</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6, marginBottom: 12, padding: '10px 12px', background: C.card, borderRadius: 6 }}>
                      <strong style={{ color: C.brand }}>추천 이유:</strong> {rec.reason}
                    </div>
                    <Button variant="brand" size="sm" fullWidth icon={<Heart size={14} />} onClick={() => { createMatch(rec); setAiOpen(false); }}>이 매칭으로 진행</Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!selectedMatch} onClose={() => setSelectedMatch(null)} title="매칭 상세" size="lg" footer={
        selectedMatch && <>
          {selectedMatch.status === 'proposed' && <Button variant="success" onClick={() => activateMatch(selectedMatch.id)} icon={<CheckCircle2 size={16} />}>활성화</Button>}
          {selectedMatch.status === 'active' && <Button variant="danger" onClick={() => closeMatch(selectedMatch.id)}>매칭 종료</Button>}
        </>
      }>
        {selectedMatch && (() => {
          const y = state.participants.find(p => p.id === selectedMatch.youth_id);
          const s = state.participants.find(p => p.id === selectedMatch.senior_id);
          const c = state.participants.find(p => p.id === selectedMatch.child_id);
          const acts = state.activities.filter(a => a.match_id === selectedMatch.id);
          const logs = state.activity_logs.filter(l => acts.some(a => a.id === l.activity_id));
          const hours = logs.filter(l => l.approved).reduce((sum, l) => sum + l.hours, 0);
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                {[{ p: y, label: '청년', color: C.sage }, { p: s, label: '어르신', color: C.lavender }, { p: c, label: '아동', color: C.peach }].map(({ p, label, color }) => p && (
                  <div key={p.id} style={{ padding: 14, background: C.bg, borderRadius: 10, textAlign: 'center' }}>
                    <Avatar name={p.name} size={56} color={color} />
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 8, fontFamily: SERIF_STACK }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: color, fontWeight: 700, marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
                <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>적합도</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{selectedMatch.score}</div>
                </div>
                <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>누적 활동</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{hours}h</div>
                </div>
                <div style={{ padding: 12, background: C.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>활동 횟수</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{logs.length}회</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.mute, letterSpacing: '0.06em', marginBottom: 8 }}>코디 메모</div>
              <div style={{ padding: 12, background: C.bg, borderRadius: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{selectedMatch.coordinator_note || '메모 없음'}</div>
            </>
          );
        })()}
      </Modal>
    </>
  );
}

function MatchCard({ match, state, onClick, accent }) {
  const y = state.participants.find(p => p.id === match.youth_id);
  const s = state.participants.find(p => p.id === match.senior_id);
  const c = state.participants.find(p => p.id === match.child_id);
  const acts = state.activities.filter(a => a.match_id === match.id);
  const logs = state.activity_logs.filter(l => acts.some(a => a.id === l.activity_id) && l.approved);
  const hours = logs.reduce((sum, l) => sum + l.hours, 0);

  return (
    <Card padding={18} hoverable onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.06em' }}>{match.id.toUpperCase()}</div>
        </div>
        <Badge color={accent} soft={`${accent}15`}>적합도 {match.score}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[{ p: y, color: C.sage }, { p: s, color: C.lavender }, { p: c, color: C.peach }].map(({ p, color }) => p && (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar name={p.name} size={36} color={color} />
            <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginTop: 4, textAlign: 'center', textOverflow: 'ellipsis', maxWidth: '100%', overflow: 'hidden' }}>{p.name}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}`, fontSize: 11, color: C.inkSoft }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {hours}h</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={11} /> {logs.length}회</span>
        <span style={{ marginLeft: 'auto' }}>{fmtDate(match.started_at)}</span>
      </div>
    </Card>
  );
}

// --- 11.4 Activities (활동 승인) ---

function CoordActivities({ state, dispatch, showToast, user }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(new Set());
  const [detailLog, setDetailLog] = useState(null);

  const pendingLogs = state.activity_logs.filter(l => !l.approved);
  const approvedLogs = state.activity_logs.filter(l => l.approved);

  const list = activeTab === 'pending' ? pendingLogs : approvedLogs;

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === list.length) setSelected(new Set());
    else setSelected(new Set(list.map(l => l.id)));
  };

  const approveSelected = () => {
    if (selected.size === 0) {
      showToast({ type: 'error', message: '승인할 기록을 선택해주세요.' });
      return;
    }
    selected.forEach(id => {
      dispatch({ type: 'APPROVE_LOG', payload: { id, approved_by: user.id } });
    });
    showToast({ type: 'success', message: `${selected.size}건의 활동 기록이 승인되었습니다.` });
    setSelected(new Set());
  };

  return (
    <>
      <PageHeader title="활동 승인"
        subtitle={`청년의 활동 기록을 승인하면 정산에 반영됩니다`}
        right={activeTab === 'pending' && selected.size > 0 && (
          <Button variant="success" icon={<CheckCircle2 size={16} />} onClick={approveSelected}>{selected.size}건 일괄 승인</Button>
        )} />

      <Tabs
        tabs={[
          { id: 'pending', label: '승인 대기', count: pendingLogs.length },
          { id: 'approved', label: '승인됨', count: approvedLogs.length },
        ]}
        active={activeTab}
        onChange={(t) => { setActiveTab(t); setSelected(new Set()); }}
        style={{ marginBottom: 16 }}
      />

      {list.length === 0 ? <Empty icon={<ClipboardCheck size={32} />} title={activeTab === 'pending' ? '승인 대기 중인 기록이 없습니다' : '승인된 기록이 없습니다'} /> : (
        <Card padding={0}>
          {activeTab === 'pending' && (
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', gap: 10, background: C.bg }}>
              <Checkbox checked={selected.size === list.length && list.length > 0} onChange={toggleAll} />
              <span style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>전체 선택 ({list.length}건)</span>
            </div>
          )}
          {list.map(log => {
            const author = state.participants.find(p => p.id === log.participant_id);
            const act = state.activities.find(a => a.id === log.activity_id);
            const match = act && state.matches.find(m => m.id === act.match_id);
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
                {activeTab === 'pending' && <Checkbox checked={selected.has(log.id)} onChange={() => toggleSelect(log.id)} />}
                <Avatar name={author?.name} size={40} color={PERSONA[author?.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{author?.name}</span>
                    <span style={{ fontSize: 11, color: C.mute }}>· {fmtDate(logDate(state, log))} · {act?.type}</span>
                    {log.has_photo && <Camera size={12} style={{ color: C.sage }} />}
                    {log.mood && <span style={{ fontSize: 12 }}>{moodEmoji(log.mood)}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{log.summary}</div>
                  <div style={{ fontSize: 11, color: C.mute, marginTop: 4 }}>{log.hours}시간 · 매칭 {match?.id?.toUpperCase()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" onClick={() => setDetailLog(log)}>상세</Button>
                  {activeTab === 'pending' && (
                    <Button variant="success" size="sm" icon={<Check size={14} />}
                      onClick={() => { dispatch({ type: 'APPROVE_LOG', payload: { id: log.id, approved_by: user.id } }); showToast({ type: 'success', message: '승인되었습니다.' }); }}>승인</Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Modal open={!!detailLog} onClose={() => setDetailLog(null)} title="활동 기록 상세" size="md">
        {detailLog && (() => {
          const author = state.participants.find(p => p.id === detailLog.participant_id);
          const act = state.activities.find(a => a.id === detailLog.activity_id);
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar name={author?.name} size={44} color={PERSONA[author?.type]?.color || C.brand} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{author?.name}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>{PERSONA[author?.type]?.label}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ padding: 10, background: C.bg, borderRadius: 6 }}><div style={{ fontSize: 11, color: C.mute }}>활동</div><div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2 }}>{act?.type}</div></div>
                <div style={{ padding: 10, background: C.bg, borderRadius: 6 }}><div style={{ fontSize: 11, color: C.mute }}>날짜·시간</div><div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2 }}>{fmtDate(logDate(state, detailLog))} · {detailLog.hours}h</div></div>
              </div>
              <div style={{ fontSize: 12, color: C.mute, fontWeight: 700, marginBottom: 6 }}>활동 내용</div>
              <div style={{ padding: 14, background: C.bg, borderRadius: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.7, marginBottom: 14 }}>{detailLog.summary}</div>
              {detailLog.mood && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: C.bg, borderRadius: 6 }}>
                  <span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>오늘 기분</span>
                  <span style={{ fontSize: 18 }}>{moodEmoji(detailLog.mood)}</span>
                  <span style={{ fontSize: 12, color: C.inkSoft }}>{detailLog.mood}/5</span>
                </div>
              )}
            </>
          );
        })()}
      </Modal>
    </>
  );
}

function moodEmoji(m) { return ['😟', '😐', '🙂', '😊', '🥰'][Math.max(0, Math.min(4, m - 1))]; }

// --- 11.5 Settlements (정산 처리) ---

function CoordSettlements({ state, dispatch, showToast, user }) {
  const [monthFilter, setMonthFilter] = useState(TODAY.slice(0, 7));
  const [generating, setGenerating] = useState(false);

  // 월별 정산 가능 항목 (승인된 로그 합산)
  const calculatedSettlements = useMemo(() => {
    const map = new Map();
    state.activity_logs.filter(l => l.approved && logMonth(state, l) === monthFilter).forEach(log => {
      const p = state.participants.find(pp => pp.id === log.participant_id);
      if (!p || (p.type !== 'youth' && p.type !== 'senior')) return;
      const key = `${log.participant_id}:${monthFilter}`;
      if (!map.has(key)) map.set(key, { participant: p, month: monthFilter, hours: 0, count: 0 });
      const item = map.get(key);
      item.hours += log.hours;
      item.count += 1;
    });
    return Array.from(map.values()).map(it => ({
      ...it,
      amount: Math.round(it.hours * RATE_PER_HOUR),
      existing: state.settlements.find(s => s.participant_id === it.participant.id && s.month === monthFilter),
    }));
  }, [state, monthFilter]);

  const issued = state.settlements.filter(s => s.month === monthFilter && s.status === 'paid');
  const pending = calculatedSettlements.filter(c => !c.existing);

  const issueOne = (calc) => {
    const seq = String(state.settlements.length + 1).padStart(3, '0');
    const newSettlement = {
      id: uid('st'),
      participant_id: calc.participant.id,
      month: calc.month,
      total_hours: calc.hours,
      amount_krw: calc.amount,
      voucher_code: `KSL-${calc.month.slice(2).replace('-', '')}-${seq}`,
      issued_at: new Date().toISOString().slice(0, 10),
      status: 'paid',
    };
    dispatch({ type: 'ADD_SETTLEMENT', payload: newSettlement });
  };

  const issueAll = async () => {
    if (pending.length === 0) { showToast({ type: 'error', message: '발급 대상이 없습니다.' }); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 800));
    pending.forEach(issueOne);
    setGenerating(false);
    showToast({ type: 'success', message: `${pending.length}건의 정산이 발급되었습니다.` });
  };

  const totalAmount = calculatedSettlements.reduce((sum, c) => sum + c.amount, 0);
  const issuedAmount = issued.reduce((sum, s) => sum + s.amount_krw, 0);

  return (
    <>
      <PageHeader title="정산"
        subtitle={`승인된 활동시간 × 시급 ${RATE_PER_HOUR.toLocaleString('ko-KR')}원 → 강서사랑상품권 자동 산정`}
        right={<Button variant="brand" icon={<Wallet size={16} />} onClick={issueAll} disabled={generating || pending.length === 0}>{generating ? '발급 중…' : `${pending.length}건 일괄 발급`}</Button>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="이번 달 산정액" value={krw(totalAmount)} sub={`${calculatedSettlements.length}명`} color={C.brand} icon={<Wallet size={18} />} />
        <StatCard label="발급 완료" value={krw(issuedAmount)} sub={`${issued.length}건`} color={C.success} icon={<CheckCircle2 size={18} />} />
        <StatCard label="발급 대기" value={krw(totalAmount - issuedAmount)} sub={`${pending.length}건`} color={C.amber} icon={<Clock size={18} />} />
        <StatCard label="누적 지급" value={krw(state.settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount_krw, 0))} sub={`${state.settlements.filter(s => s.status === 'paid').length}건`} color={C.gold} icon={<Award size={18} />} />
      </div>

      <Card padding={20} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: C.mute, fontWeight: 700 }}>정산 월</span>
          <Select value={monthFilter} onChange={setMonthFilter}
            options={['2027-05', '2027-06', '2027-07'].map(m => ({ value: m, label: m.slice(0, 4) + '년 ' + m.slice(5) + '월' }))}
            style={{ width: 180 }} />
        </div>
      </Card>

      <Card padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'grid', gridTemplateColumns: '1.4fr 80px 80px 120px 140px 90px', gap: 12, fontSize: 11, color: C.mute, fontWeight: 700, letterSpacing: '0.06em', background: C.bg }}>
          <div>참여자</div><div>활동</div><div>시간</div><div>상품권</div><div>상품권 번호</div><div style={{ textAlign: 'right' }}>상태</div>
        </div>
        {calculatedSettlements.length === 0 ? <Empty icon={<Wallet size={28} />} title="이번 달 산정 대상이 없습니다" sub="승인된 활동 기록이 쌓이면 자동으로 산정됩니다" /> : calculatedSettlements.map((calc) => (
          <div key={calc.participant.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'grid', gridTemplateColumns: '1.4fr 80px 80px 120px 140px 90px', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={calc.participant.name} size={32} color={PERSONA[calc.participant.type]?.color || C.brand} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{calc.participant.name}</div>
                <div style={{ fontSize: 11, color: C.mute }}>{PERSONA[calc.participant.type]?.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{calc.count}회</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK }}>{calc.hours}h</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: SERIF_STACK }}>{krw(calc.amount)}</div>
            <div style={{ fontSize: 11, color: C.inkSoft, fontFamily: 'monospace' }}>{calc.existing?.voucher_code || '—'}</div>
            <div style={{ textAlign: 'right' }}>
              {calc.existing?.status === 'paid' ? <Badge color={C.success} soft={C.successSoft} size="sm"><Check size={11} /> 발급</Badge> :
                <Button variant="brand" size="sm" onClick={() => { issueOne(calc); showToast({ type: 'success', message: `${calc.participant.name}님께 발급되었습니다.` }); }}>발급</Button>}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

// --- 11.6 Safety (안전 이슈) ---

function CoordSafety({ state, dispatch, showToast, user }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [resolveForm, setResolveForm] = useState({ resolution: '' });

  const filtered = filter === 'all' ? state.safety_incidents :
    filter === 'open' ? state.safety_incidents.filter(i => i.status === 'open' || i.status === 'in_progress') :
      state.safety_incidents.filter(i => i.status === 'resolved');

  const resolve = () => {
    if (!resolveForm.resolution.trim()) { showToast({ type: 'error', message: '처리 내용을 입력해주세요.' }); return; }
    dispatch({
      type: 'RESOLVE_INCIDENT',
      payload: {
        id: selected.id,
        resolution: resolveForm.resolution,
        resolved_by: user.id,
        resolved_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }
    });
    showToast({ type: 'success', message: '안전 이슈가 해결 처리되었습니다.' });
    setSelected(null); setResolveForm({ resolution: '' });
  };

  return (
    <>
      <PageHeader title="안전 이슈" subtitle="신고된 안전 이슈를 신속히 처리하세요" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="전체" value={state.safety_incidents.length} color={C.ink} icon={<ShieldAlert size={18} />} />
        <StatCard label="처리 중" value={state.safety_incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length} color={C.amber} icon={<AlertTriangle size={18} />} />
        <StatCard label="해결됨" value={state.safety_incidents.filter(i => i.status === 'resolved').length} color={C.success} icon={<CheckCircle2 size={18} />} />
        <StatCard label="높음 등급" value={state.safety_incidents.filter(i => i.severity === 'high').length} color={C.red} icon={<AlertCircle size={18} />} />
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: '전체', count: state.safety_incidents.length },
          { id: 'open', label: '처리 중', count: state.safety_incidents.filter(i => i.status !== 'resolved').length },
          { id: 'resolved', label: '해결됨', count: state.safety_incidents.filter(i => i.status === 'resolved').length },
        ]}
        active={filter}
        onChange={setFilter}
        style={{ marginBottom: 16 }}
      />

      {filtered.length === 0 ? <Empty icon={<ShieldCheck size={32} />} title="안전 이슈가 없습니다" sub="모든 활동이 안전하게 진행 중입니다" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(inc => {
            const reporter = state.participants.find(p => p.id === inc.reported_by);
            return (
              <Card key={inc.id} padding={16} hoverable onClick={() => setSelected(inc)}
                style={{ borderLeft: `3px solid ${inc.severity === 'high' ? C.red : inc.severity === 'medium' ? C.amber : C.success}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Badge color={inc.severity === 'high' ? C.red : inc.severity === 'medium' ? C.amber : C.success}
                    soft={inc.severity === 'high' ? C.redSoft : inc.severity === 'medium' ? C.amberSoft : C.successSoft}>
                    {inc.severity === 'high' ? '높음' : inc.severity === 'medium' ? '중간' : '낮음'}
                  </Badge>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{inc.category}</span>
                  <Badge color={inc.status === 'resolved' ? C.success : inc.status === 'in_progress' ? C.amber : C.red}
                    soft={inc.status === 'resolved' ? C.successSoft : inc.status === 'in_progress' ? C.amberSoft : C.redSoft}>
                    {inc.status === 'resolved' ? '해결됨' : inc.status === 'in_progress' ? '처리 중' : '접수'}
                  </Badge>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: C.mute }}>{inc.reported_at}</span>
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 6, lineHeight: 1.5 }}>{inc.description}</div>
                <div style={{ fontSize: 11, color: C.mute }}>신고자: {reporter?.name || '익명'} · 매칭: {inc.match_id?.toUpperCase() || '-'}</div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="안전 이슈 상세" size="md"
        footer={selected && selected.status !== 'resolved' && (
          <Button variant="success" icon={<CheckCircle2 size={16} />} onClick={resolve}>해결 처리</Button>
        )}>
        {selected && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <Badge color={selected.severity === 'high' ? C.red : C.amber} soft={selected.severity === 'high' ? C.redSoft : C.amberSoft}>
                {selected.severity === 'high' ? '높음' : '중간'}
              </Badge>
              <Badge color={selected.status === 'resolved' ? C.success : C.amber} soft={selected.status === 'resolved' ? C.successSoft : C.amberSoft}>
                {selected.status === 'resolved' ? '해결됨' : selected.status === 'in_progress' ? '처리 중' : '접수'}
              </Badge>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 8, fontFamily: SERIF_STACK }}>{selected.category}</div>
            <div style={{ padding: 14, background: C.bg, borderRadius: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 14 }}>{selected.description}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, fontSize: 12, color: C.inkSoft }}>
              <div><strong style={{ color: C.mute }}>신고자:</strong> {state.participants.find(p => p.id === selected.reported_by)?.name}</div>
              <div><strong style={{ color: C.mute }}>매칭:</strong> {selected.match_id?.toUpperCase()}</div>
              <div><strong style={{ color: C.mute }}>접수:</strong> {selected.reported_at}</div>
              {selected.resolved_at && <div><strong style={{ color: C.mute }}>해결:</strong> {selected.resolved_at}</div>}
            </div>
            {selected.status === 'resolved' && selected.resolution ? (
              <div style={{ padding: 14, background: C.successSoft, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.success, marginBottom: 6, letterSpacing: '0.06em' }}>처리 내용</div>
                <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{selected.resolution}</div>
              </div>
            ) : (
              <Field label="처리 내용" required>
                <Textarea value={resolveForm.resolution} onChange={v => setResolveForm({ resolution: v })}
                  placeholder="어떻게 해결했는지 구체적으로 적어주세요." rows={4} />
              </Field>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

// --- 11.7 Reports (월간 리포트 + AI 요약) ---

function CoordReports({ state, dispatch, showToast }) {
  const [period, setPeriod] = useState(TODAY.slice(0, 7));
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiLastCall, setAiLastCall] = useState(null);

  const stats = useMemo(() => {
    const monthLogs = state.activity_logs.filter(l => logMonth(state, l) === period);
    const approvedLogs = monthLogs.filter(l => l.approved);
    const activeMatches = state.matches.filter(m => m.status === 'active').length;
    const totalHours = approvedLogs.reduce((s, l) => s + l.hours, 0);
    const settlements = state.settlements.filter(s => s.month === period && s.status === 'paid');
    const settlementAmount = settlements.reduce((s, x) => s + x.amount_krw, 0);
    const incidents = state.safety_incidents.filter(i => (i.reported_at || '').startsWith(period));
    const surveys = state.surveys?.filter(sv => sv.month === period) || [];
    const avgScore = surveys.length ? (surveys.reduce((s, x) => s + (x.satisfaction || 0), 0) / surveys.length).toFixed(1) : 'N/A';
    const matchHours = {};
    approvedLogs.forEach(l => {
      const act = state.activities.find(a => a.id === l.activity_id);
      if (act) matchHours[act.match_id] = (matchHours[act.match_id] || 0) + l.hours;
    });
    return { monthLogs, approvedLogs, activeMatches, totalHours, settlements, settlementAmount, incidents, surveys, avgScore, matchHours };
  }, [state, period]);

  const generateAiSummary = async () => {
    if (!getApiKey()) {
      showToast({ type: 'error', message: 'AI 요약을 쓰려면 먼저 상단에서 API 키를 입력하세요.' });
      window.dispatchEvent(new Event('eum-ai'));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiSummary(null);
    setAiLastCall(null);

    const matchData = Object.entries(stats.matchHours).map(([mid, h]) => {
      const m = state.matches.find(mm => mm.id === mid);
      if (!m) return null;
      const y = state.participants.find(p => p.id === m.youth_id);
      const s = state.participants.find(p => p.id === m.senior_id);
      const c = state.participants.find(p => p.id === m.child_id);
      const logs = stats.approvedLogs.filter(l => state.activities.find(a => a.id === l.activity_id)?.match_id === mid);
      const sample = logs.slice(0, 4).map(l => l.summary).filter(Boolean).join(' / ');
      return `${mid.toUpperCase()} 트리오 (${y?.name}-${s?.name}-${c?.name}): ${h}시간, ${logs.length}회 활동. 주요 활동: ${sample}`;
    }).filter(Boolean).join('\n');

    try {
      const { text, usage } = await callAI({
        system: '당신은 강서구 3세대 상생 품앗이 프로그램 "이음"의 월간 리포트 작성을 돕는 AI입니다. 따뜻하지만 구조적이고 객관적인 한국어로 작성하며, 정량 지표와 정성적 변화를 균형 있게 다룹니다.',
        user: `${period}월 이음 프로그램 활동 데이터입니다.

[핵심 지표]
- 활성 매칭: ${stats.activeMatches}건
- 누적 활동시간: ${stats.totalHours}시간 (${stats.approvedLogs.length}회 승인)
- 정산 지급: ${krw(stats.settlementAmount)} (${stats.settlements.length}건)
- 안전 이슈: ${stats.incidents.length}건 (해결 ${stats.incidents.filter(i => i.status === 'resolved').length}건)
- 만족도 평균: ${stats.avgScore}점

[매칭별 활동]
${matchData}

다음 4가지 섹션으로 월간 리포트 본문을 작성해주세요. 각 섹션은 2~4문장으로:
1. 이달의 핵심 성과
2. 트리오별 주목할 만한 변화
3. 안전·정산 운영 현황
4. 다음 달 코디네이터 우선과제

JSON 형식으로만 답변:
{ "highlights": "...", "matches": "...", "operations": "...", "next_actions": "..." }`,
        maxTokens: 2000,
      });
      if (usage) setAiLastCall({ prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens });
      const cleaned = (text || '').replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      setAiSummary(parsed);
    } catch (e) {
      console.error(e);
      // Fallback summary
      setAiSummary({
        highlights: `${period}월 동안 ${stats.activeMatches}개 트리오에서 총 ${stats.totalHours}시간의 활동이 이루어졌습니다. ${stats.approvedLogs.length}회의 활동이 승인되었으며, 만족도 평균 ${stats.avgScore}점을 기록했습니다.`,
        matches: `각 트리오는 격주 단위로 안정적으로 만남을 이어가고 있으며, 청년의 디지털·학습 지원과 어르신의 돌봄 손길이 양육가정 자녀에게 함께 전달되고 있습니다.`,
        operations: `정산 ${krw(stats.settlementAmount)}이 지급 완료되었으며, ${stats.incidents.length}건의 안전 이슈 중 ${stats.incidents.filter(i => i.status === 'resolved').length}건이 해결되었습니다.`,
        next_actions: `검토 대기 중인 신청자 검증을 우선 처리하고, 매칭별 1차 6개월 평가를 준비할 시기입니다.`,
        fallback: true,
      });
      setAiError(`AI 호출 실패(${e.message}) — 기본 템플릿으로 대체`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="월간 리포트"
        subtitle="활동 데이터를 종합한 운영 리포트"
        right={<>
          <Select value={period} onChange={setPeriod}
            options={['2027-05', '2027-06', '2027-07'].map(m => ({ value: m, label: m + '월' }))}
            style={{ width: 140 }} />
          <Button variant="brand" icon={<Sparkles size={16} />} onClick={generateAiSummary} disabled={aiLoading}>{aiLoading ? '생성 중…' : 'AI 요약 생성'}</Button>
        </>} />

      <AiKeyBar lastCall={aiLastCall} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="활동시간" value={`${stats.totalHours}h`} sub={`${stats.approvedLogs.length}회 승인`} color={C.brand} icon={<Clock size={18} />} />
        <StatCard label="정산 지급" value={krw(stats.settlementAmount)} sub={`${stats.settlements.length}건`} color={C.gold} icon={<Wallet size={18} />} />
        <StatCard label="안전 이슈" value={stats.incidents.length} sub={`해결 ${stats.incidents.filter(i => i.status === 'resolved').length}건`} color={stats.incidents.length > 0 ? C.amber : C.success} icon={<ShieldCheck size={18} />} />
        <StatCard label="만족도" value={stats.avgScore} sub={`${stats.surveys.length}건 응답`} color={C.lavender} icon={<Smile size={18} />} />
      </div>

      {aiLoading && (
        <Card padding={32} style={{ marginBottom: 18, textAlign: 'center' }}>
          <Loader2 size={36} style={{ color: C.brand, animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 14, fontSize: 14, color: C.inkSoft }}>활동 데이터를 분석해 월간 리포트를 작성하고 있습니다…</div>
        </Card>
      )}

      {aiSummary && (
        <Card padding={28} style={{ marginBottom: 18, background: `linear-gradient(135deg, ${C.brand}06 0%, ${C.peach}06 100%)`, border: `1px solid ${C.brand}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Sparkles size={16} style={{ color: C.brand }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: '0.08em' }}>AI 월간 리포트 · {period}</div>
            {aiSummary.fallback && <Badge color={C.amber} soft={C.amberSoft} size="sm">기본 템플릿</Badge>}
            {!aiSummary.fallback && aiLastCall && <Badge color={C.brand} soft={C.brandSoft} size="sm">이번 호출 {tk(aiLastCall.total)} 토큰</Badge>}
          </div>
          {aiError && (
            <div style={{ padding: 8, background: C.amberSoft, borderRadius: 6, marginBottom: 14, fontSize: 12, color: C.amber }}>{aiError}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'highlights', label: '이달의 핵심 성과', icon: <Star size={14} /> },
              { key: 'matches', label: '트리오별 주목할 변화', icon: <Heart size={14} /> },
              { key: 'operations', label: '안전 · 정산 운영', icon: <ShieldCheck size={14} /> },
              { key: 'next_actions', label: '다음 달 우선과제', icon: <ArrowRight size={14} /> },
            ].map(({ key, label, icon }) => aiSummary[key] && (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: C.brand }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{label}</span>
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.75, paddingLeft: 22 }}>{aiSummary[key]}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding={22} style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 14 }}>매칭별 활동 현황</div>
        {Object.entries(stats.matchHours).length === 0 ? <Empty icon={<Activity size={28} />} title="이달의 활동이 없습니다" /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={Object.entries(stats.matchHours).map(([mid, h]) => {
              const m = state.matches.find(mm => mm.id === mid);
              const y = state.participants.find(p => p.id === m?.youth_id);
              return { name: y?.name || mid, hours: h };
            })} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} />
              <XAxis dataKey="name" stroke={C.mute} fontSize={11} fontFamily={FONT_STACK} />
              <YAxis stroke={C.mute} fontSize={11} fontFamily={FONT_STACK} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_STACK, fontSize: 12 }} />
              <Bar dataKey="hours" fill={C.brand} radius={[8, 8, 0, 0]} name="시간" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* 만족도 응답 */}
      {stats.surveys.length > 0 && (
        <Card padding={22}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 14 }}>이달의 만족도 응답</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {stats.surveys.slice(0, 6).map(sv => {
              const p = state.participants.find(pp => pp.id === sv.participant_id);
              return (
                <div key={sv.id} style={{ padding: 14, background: C.bg, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Avatar name={p?.name} size={28} color={PERSONA[p?.type]?.color || C.brand} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{p?.name}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(n => <Star key={n} size={11} fill={n <= sv.satisfaction ? C.gold : 'none'} color={n <= sv.satisfaction ? C.gold : C.muteSoft} />)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.5 }}>"{sv.comment}"</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

// ============================================================================
// 12. REDUCER (모든 dispatch 액션 처리)
// ============================================================================

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      return { ...state, currentUserId: action.payload.userId, currentRole: action.payload.role };
    }
    case 'LOGOUT': {
      return { ...state, currentUserId: null, currentRole: null };
    }
    case 'ADD_LOG': {
      return { ...state, activity_logs: [...state.activity_logs, { ...action.payload, created_at: new Date().toISOString().slice(0, 16).replace('T', ' ') }] };
    }
    case 'APPROVE_LOG': {
      return {
        ...state,
        activity_logs: state.activity_logs.map(l => l.id === action.payload.id
          ? { ...l, approved: true, approved_at: new Date().toISOString().slice(0, 10), approved_by: action.payload.approved_by }
          : l)
      };
    }
    case 'ADD_INCIDENT': {
      return { ...state, safety_incidents: [...state.safety_incidents, action.payload] };
    }
    case 'RESOLVE_INCIDENT': {
      return {
        ...state,
        safety_incidents: state.safety_incidents.map(i => i.id === action.payload.id
          ? { ...i, status: 'resolved', resolution: action.payload.resolution, resolved_by: action.payload.resolved_by, resolved_at: action.payload.resolved_at }
          : i)
      };
    }
    case 'ADD_APPLICATION': {
      const { participant, application, verifications } = action.payload;
      return {
        ...state,
        participants: [...state.participants, participant],
        applications: [...state.applications, application],
        verifications: [...state.verifications, ...verifications],
      };
    }
    case 'UPDATE_APPLICATION': {
      return { ...state, applications: state.applications.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) };
    }
    case 'UPDATE_PARTICIPANT': {
      return { ...state, participants: state.participants.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    }
    case 'UPDATE_VERIFICATION': {
      return {
        ...state,
        verifications: state.verifications.map(v =>
          v.application_id === action.payload.application_id && v.step === action.payload.step
            ? { ...v, status: action.payload.status, verified_by: action.payload.verified_by, verified_at: new Date().toISOString().slice(0, 10) }
            : v
        )
      };
    }
    case 'ADD_MATCH': {
      return { ...state, matches: [...state.matches, action.payload] };
    }
    case 'UPDATE_MATCH': {
      return { ...state, matches: state.matches.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) };
    }
    case 'ADD_SETTLEMENT': {
      return { ...state, settlements: [...state.settlements, action.payload] };
    }
    case 'RESET_DATA': {
      return { ...SEED_DATA, currentUserId: null, currentRole: null };
    }
    default:
      return state;
  }
}

// ============================================================================
// 12.5 LOGIN PAGE (로그인 → 역할 진입)
// ============================================================================

const DEMO_ACCOUNTS = [
  { username: 'admin', role: 'coordinator', id: 'cdn001', name: '한가은', subtitle: '코디네이터 · 우장산동', desc: '신청·검증·매칭·정산·안전을 한눈에 관리합니다.', color: C.ink, gradient: 'linear-gradient(135deg, #1A1814 0%, #3A352F 100%)' },
  { username: 'minjun', role: 'youth', id: 'p001', name: '김민준', subtitle: '27세 · 스타트업 개발자', desc: '어르신께 디지털을 알려드리고, 진로 조언을 받습니다.', color: C.sage, gradient: 'linear-gradient(135deg, #6B8E5A 0%, #8FB47E 100%)' },
  { username: 'soonja', role: 'senior', id: 'p101', name: '박순자', subtitle: '73세 · 前 교사', desc: '청년과 디지털을 익히고, 아이에게 옛이야기를 들려줘요.', color: C.lavender, gradient: 'linear-gradient(135deg, #7F6FA0 0%, #A797C0 100%)' },
  { username: 'seoyoung', role: 'parent', id: 'p201', name: '이서영', subtitle: '38세 · 유진(8세) 보호자', desc: '아이가 어르신·청년과 만나는 안전한 공간을 신뢰해요.', color: C.peach, gradient: 'linear-gradient(135deg, #D89368 0%, #E8B58F 100%)' },
];
const DEMO_PW = 'eum2027';

function LoginPage({ mode = 'user', onSelectRole, onShowApplication, go }) {
  const isAdmin = mode === 'admin';
  const accounts = DEMO_ACCOUNTS.filter(a => isAdmin ? a.role === 'coordinator' : a.role !== 'coordinator');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const doLogin = (acct) => {
    setLoadingId(acct.id);
    setTimeout(() => onSelectRole(acct.role, acct.id), 320);
  };

  const submit = () => {
    const u = username.trim().toLowerCase();
    const acct = accounts.find(a => a.username === u);
    if (!acct) {
      const other = DEMO_ACCOUNTS.find(a => a.username === u);
      if (other) { setError(isAdmin ? '참여자 계정입니다. ‘사용자 홈’에서 로그인하세요.' : '관리자 계정입니다. ‘관리자 콘솔’에서 로그인하세요.'); return; }
      setError('등록되지 않은 아이디입니다. 아래 체험 계정을 이용해 주세요.'); return;
    }
    if (password !== DEMO_PW) { setError('비밀번호가 올바르지 않습니다. (데모: eum2027)'); return; }
    setError('');
    doLogin(acct);
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, color: C.ink,
      display: 'flex', flexWrap: 'wrap',
      backgroundImage: isAdmin
        ? `radial-gradient(circle at 18% 0%, ${C.muteSoft} 0%, transparent 42%), radial-gradient(circle at 85% 90%, ${C.lavenderSoft} 0%, transparent 48%)`
        : `radial-gradient(circle at 18% 0%, ${C.brandSoft} 0%, transparent 42%), radial-gradient(circle at 85% 90%, ${C.peachSoft} 0%, transparent 48%)`,
    }}>
      {/* 좌측 브랜드 히어로 */}
      <div style={{ flex: '1 1 460px', minWidth: 320, padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${C.brand} 0%, ${C.peach} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 27, fontWeight: 800, fontFamily: SERIF_STACK, boxShadow: `0 8px 24px ${C.brand}40`, letterSpacing: '-0.02em' }}>이</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.03em', lineHeight: 1 }}>이음 <span style={{ fontSize: 12, color: C.mute, fontWeight: 600, letterSpacing: '0.08em' }}>EUM</span></div>
              <div style={{ fontSize: 11, color: C.mute, letterSpacing: '0.06em', fontWeight: 600, marginTop: 3 }}>강서구 3세대 상생 품앗이 플랫폼</div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Badge color={isAdmin ? C.ink : C.brand} soft={isAdmin ? C.muteSoft : C.brandSoft} size="md">
              {isAdmin ? <><ShieldCheck size={12} /> 운영자 콘솔 · ADMIN</> : <><Heart size={12} /> 참여자 공간</>}
            </Badge>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 4.2vw, 48px)', fontWeight: 700, color: C.ink, letterSpacing: '-0.04em', margin: '0 0 16px', fontFamily: SERIF_STACK, lineHeight: 1.08 }}>
            {isAdmin ? <>운영을 한 손에,<br /><span style={{ color: C.brand, fontStyle: 'italic' }}>코디네이터 콘솔</span></>
                     : <>세대를 잇다,<br /><span style={{ color: C.brand, fontStyle: 'italic' }}>서로의 곁이 되다</span></>}
          </h1>
          <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 460 }}>
            {isAdmin
              ? <>신청·검증·매칭·활동승인·정산·안전을 한 화면에서 운영합니다. <strong style={{ color: C.ink }}>관리자 전용 진입</strong>입니다.</>
              : <>청년·어르신·아동 세 세대가 서로 돕고 <strong style={{ color: C.ink }}>모두 보상받는</strong> 강서구형 품앗이. 일방적 봉사가 아닌 상호 가치 교환으로 지속 가능한 돌봄을 만듭니다.</>}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {isAdmin ? <>
              <Badge color={C.brand} soft={C.brandSoft} size="md">신청·검증</Badge>
              <Badge color={C.sage} soft={C.sageSoft} size="md">매칭·승인</Badge>
              <Badge color={C.gold} soft={C.goldSoft} size="md">정산</Badge>
              <Badge color={C.red} soft={C.redSoft} size="md">안전 이슈</Badge>
            </> : <>
              <Badge color={C.sage} soft={C.sageSoft} size="md">청년 멘토</Badge>
              <Badge color={C.lavender} soft={C.lavenderSoft} size="md">어르신 멘토</Badge>
              <Badge color={C.peach} soft={C.peachSoft} size="md">아동 돌봄</Badge>
              <Badge color={C.gold} soft={C.goldSoft} size="md">강서사랑상품권</Badge>
            </>}
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            {(isAdmin ? [['15쌍', '운영 중인 매칭'], ['7', '관제 메뉴'], ['실시간', 'KPI·안전 모니터링']] : [['3', '세대 매칭 트리오'], ['15쌍', '우장산동 파일럿'], ['월 27.5만', '활동 상품권']]).map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}>{v}</div>
                <div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측 로그인 카드 */}
      <div style={{ flex: '1 1 420px', minWidth: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 30, boxShadow: '0 20px 60px rgba(26,24,20,0.10)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em', marginBottom: 4 }}>{isAdmin ? '관리자 로그인' : '참여자 로그인'}</div>
          <div style={{ fontSize: 13, color: C.mute, marginBottom: 20 }}>{isAdmin ? '코디네이터 운영 콘솔에 접속합니다.' : '청년·어르신·양육가정 누구나 환영합니다.'}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>아이디</div>
              <Input value={username} onChange={(v) => { setUsername(v); setError(''); }} placeholder={isAdmin ? 'admin' : 'minjun'} icon={<Mail size={15} />} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>비밀번호</div>
              <div style={{ position: 'relative' }}>
                <Input value={password} onChange={(v) => { setPassword(v); setError(''); }} placeholder="eum2027" type={showPw ? 'text' : 'password'} icon={<ShieldCheck size={15} />} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.mute, display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ fontSize: 12, color: C.red, background: C.redSoft, padding: '8px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <Button variant="brand" size="lg" fullWidth onClick={submit} iconRight={<ArrowRight size={16} />} disabled={!!loadingId}>
              {loadingId ? '입장 중…' : '로그인'}
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>{isAdmin ? '운영자 체험 계정' : '체험 계정으로 바로 입장'}</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr' : '1fr 1fr', gap: 8 }}>
            {accounts.map((a) => (
              <button key={a.id} onClick={() => doLogin(a)} disabled={!!loadingId}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
                  border: `1px solid ${C.border}`, borderRadius: 11, background: C.card,
                  cursor: loadingId ? 'default' : 'pointer', textAlign: 'left', fontFamily: FONT_STACK,
                  opacity: loadingId && loadingId !== a.id ? 0.5 : 1, transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => !loadingId && (e.currentTarget.style.borderColor = a.color, e.currentTarget.style.background = C.cream)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border, e.currentTarget.style.background = C.card)}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: a.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: SERIF_STACK, flexShrink: 0 }}>{a.name.slice(0, 1)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{a.name} <span style={{ fontSize: 10.5, color: C.mute, fontWeight: 600 }}>{isAdmin ? `· ${a.subtitle}` : ''}</span></div>
                  <div style={{ fontSize: 10.5, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{PERSONA[a.role].label}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            {isAdmin ? (
              <button onClick={() => go && go('#/')} style={{ background: 'none', border: 'none', color: C.inkSoft, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT_STACK }}>
                <ChevronLeft size={14} /> 사용자 홈으로
              </button>
            ) : (
              <>
                <button onClick={onShowApplication} style={{ background: 'none', border: 'none', color: C.brand, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT_STACK }}>
                  <UserPlus size={14} /> 참여 신청하기
                </button>
                <button onClick={() => go && go('#/admin')} style={{ background: 'none', border: 'none', color: C.mute, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT_STACK }}>
                  <ShieldCheck size={13} /> 관리자 콘솔
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 14, width: '100%', textAlign: 'center', color: C.mute, fontSize: 11, pointerEvents: 'none' }}>
        이음 MVP · 강서구청 주민참여예산 시범사업 · 2027 우장산동 파일럿 · 데모 비밀번호 <strong>eum2027</strong>
      </div>
    </div>
  );
}

// ============================================================================
// 13. MAIN APP (인증 · 라우팅 · 영속화 · Toast)
// ============================================================================

function App() {
  const [state, setState] = useState(() => {
    return { ...SEED_DATA, currentUserId: null, currentRole: null };
  });
  const [loading, setLoading] = useState(true);
  const [showApplication, setShowApplication] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [route, setRoute] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  const stateRef = useRef(state);
  stateRef.current = state;

  // 해시 라우팅: #/admin → 관리자, 그 외 → 사용자
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const mode = route.startsWith('#/admin') ? 'admin' : 'user';
  const go = useCallback((hash) => {
    if (typeof window !== 'undefined') { window.location.hash = hash; setRoute(hash); }
  }, []);

  // 초기 데이터 로드 (Storage)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await loadState();
        if (mounted && stored) {
          setState(prev => ({ ...prev, ...stored, currentUserId: null, currentRole: null }));
        }
      } catch (e) {
        console.warn('Storage load failed, using seed data:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 상태 저장 (debounced)
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      const { currentUserId, currentRole, ...persist } = state;
      saveState(persist).catch(e => console.warn('Storage save failed:', e));
    }, 600);
    return () => clearTimeout(t);
  }, [state, loading]);

  const dispatch = useCallback((action) => {
    setState(prev => appReducer(prev, action));
  }, []);

  const showToast = useCallback((toast) => {
    const id = uid('toast');
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 3500);
  }, []);

  const handleSelectRole = (role, userId) => {
    // 진입 모드를 역할에 맞춰 URL 해시에 반영 (로그아웃 시 같은 진입 화면 유지)
    go(role === 'coordinator' ? '#/admin' : '#/');
    dispatch({ type: 'LOGIN', payload: { role, userId } });
  };

  const handleSubmitApplication = (data) => {
    const newParticipantId = uid('p');
    const applicationId = uid('app');
    const newParticipant = {
      id: newParticipantId,
      type: data.type,
      name: data.name,
      age: parseInt(data.age) || 0,
      gender: data.gender || 'F',
      phone: data.phone,
      address: data.address,
      emergency_contact: data.emergency_contact,
      occupation: data.occupation || '',
      bio: data.bio || '',
      skills: data.skills || [],
      interests: data.interests || [],
      availability: data.availability || [],
      status: 'pending',
      created_at: new Date().toISOString().slice(0, 10),
    };
    const application = {
      id: applicationId,
      participant_id: newParticipantId,
      type: data.type,
      status: 'screening',
      applied_at: new Date().toISOString().slice(0, 10),
      consent_data: data.consent_data,
      consent_photo: data.consent_photo,
      consent_criminal_check: data.consent_criminal_check || false,
      consent_guardian: data.consent_guardian || false,
    };
    const verifSteps = data.type === 'youth' || data.type === 'senior'
      ? ['interview', 'criminal_record', 'abuse_record', 'reference']
      : ['interview', 'guardian_consent', 'document'];
    const verifications = verifSteps.map(step => ({
      id: uid('vf'),
      application_id: applicationId,
      step,
      status: 'pending',
      verified_by: null,
      verified_at: null,
      note: '',
    }));

    dispatch({ type: 'ADD_APPLICATION', payload: { participant: newParticipant, application, verifications } });
    setShowApplication(false);
    showToast({ type: 'success', message: '신청이 접수되었습니다. 코디네이터가 검토 후 연락드립니다.', duration: 5000 });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: FONT_STACK }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `linear-gradient(135deg, ${C.brand} 0%, ${C.peach} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 28,
            fontFamily: SERIF_STACK, margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${C.brand}40`,
          }}>이</div>
          <div style={{ fontSize: 14, color: C.inkSoft }}>이음을 불러오고 있습니다…</div>
        </div>
      </div>
    );
  }

  const user = state.currentUserId ? state.participants.find(p => p.id === state.currentUserId) : null;
  const role = state.currentRole;

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: ${C.bg}; font-family: ${FONT_STACK}; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 2px solid ${C.brand}66; outline-offset: 2px;
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.borderSoft}; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.border}; }
      `}</style>

      {!role || !user ? (
        <>
          <LoginPage mode={mode} go={go} onSelectRole={handleSelectRole} onShowApplication={() => setShowApplication(true)} />
          {showApplication && (
            <Modal open={showApplication} onClose={() => setShowApplication(false)} title="이음 참여 신청" size="md">
              <ApplicationForm onClose={() => setShowApplication(false)} onSubmit={handleSubmitApplication} />
            </Modal>
          )}
        </>
      ) : (
        <>
          {role === 'youth' && <YouthApp state={state} user={user} dispatch={dispatch} showToast={showToast} />}
          {role === 'senior' && <SeniorApp state={state} user={user} dispatch={dispatch} showToast={showToast} />}
          {role === 'parent' && <ParentApp state={state} user={user} dispatch={dispatch} showToast={showToast} />}
          {role === 'coordinator' && <CoordinatorApp state={state} user={user} dispatch={dispatch} showToast={showToast} />}
        </>
      )}

      {/* Toast 컨테이너 */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
