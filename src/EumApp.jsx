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
  ink: '#1A1814',
  inkSoft: '#4A4540',
  mute: '#8A847A',
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
  teen: { label: '청소년', color: C.blue, soft: C.blueSoft, ring: 'rgba(74,111,165,0.25)' },
  youth: { label: '청년', color: C.sage, soft: C.sageSoft, ring: 'rgba(95,133,86,0.25)' },
  adult: { label: '중년·서포터', color: C.gold, soft: C.goldSoft, ring: 'rgba(184,136,74,0.25)' },
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

const SEED_DATA = {
  participants: [
    // 청년 5명
    { id: 'p001', name: '김민준', gender: 'M', type: 'youth', age: 27, phone: '010-1234-5678', address: '광주광역시 광산구 우산동', emergency_contact: '010-9876-5432 (부친)', occupation: '스타트업 개발자', skills: ['디지털코칭', '학습멘토', '코딩교육'], interests: ['IT', '진로상담', '여행'], availability: ['평일저녁', '토요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-15', bio: '마곡 스타트업 2년차 개발자. 어르신께 IT를, 아이들에게 코딩을 가르쳐드리고 싶어요.' },
    { id: 'p002', name: '이지원', gender: 'F', type: 'youth', age: 25, phone: '010-2345-6789', address: '광주광역시 광산구 우산동', emergency_contact: '010-1111-2222 (모친)', occupation: '대학원생', skills: ['학습멘토', '글쓰기', '독서지도'], interests: ['교육', '문학', '심리'], availability: ['평일저녁', '주말'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-18', bio: '교육학 석사과정. 아이들과 책 읽고 글쓰기를 함께하고 싶어요.' },
    { id: 'p003', name: '박서준', gender: 'M', type: 'youth', age: 29, phone: '010-3456-7890', address: '광주광역시 광산구 첨단동', emergency_contact: '010-3333-4444 (형)', occupation: '디자이너', skills: ['디지털코칭', '예술교육', '사진'], interests: ['디자인', '사진', '카페'], availability: ['토요일', '일요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-20', bio: 'UX 디자이너. 어르신께 스마트폰 사진을, 아이들에게 그림을 가르쳐요.' },
    { id: 'p004', name: '최예린', gender: 'F', type: 'youth', age: 26, phone: '010-4567-8901', address: '광주광역시 광산구 우산동', emergency_contact: '010-5555-6666 (모친)', occupation: '간호사', skills: ['건강관리', '응급처치', '돌봄'], interests: ['건강', '운동', '요리'], availability: ['평일저녁'], status: 'pending_match', avatar_color: C.sage, joined_at: '2027-04-01', bio: '대학병원 간호사. 어르신 건강 케어와 아이 안전에 강점이 있어요.' },
    { id: 'p005', name: '정태윤', gender: 'M', type: 'youth', age: 28, phone: '010-5678-9012', address: '광산구 등촌동', emergency_contact: '010-7777-8888 (모친)', occupation: '회계사', skills: ['학습멘토', '수학교육'], interests: ['경제', '독서', '러닝'], availability: ['평일저녁', '토요일'], status: 'verifying', avatar_color: C.sage, joined_at: '2027-05-12', bio: '회계사. 아이들에게 수학과 경제 개념을 쉽게 알려주고 싶어요.' },

    // 어르신 5명
    { id: 'p101', name: '박순자', gender: 'F', type: 'senior', age: 73, phone: '010-1111-1111', address: '광주광역시 광산구 우산동 (42년 거주)', emergency_contact: '010-2222-3333 (딸)', occupation: '前 초등학교 교사', skills: ['독서지도', '서예', '동화구연'], interests: ['손주', '드라마', '꽃'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-16', bio: '40년 교직 생활. 손주 같은 아이에게 옛이야기 들려주고 싶어요.' },
    { id: 'p102', name: '김복례', gender: 'F', type: 'senior', age: 78, phone: '010-2222-2222', address: '광주광역시 광산구 우산동 (30년 거주)', emergency_contact: '010-4444-5555 (아들)', occupation: '前 봉제공장 운영', skills: ['바느질', '뜨개질', '요리'], interests: ['요리', '드라마', '산책'], availability: ['평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-22', bio: '평생 봉제일. 아이들에게 손바느질을 가르쳐주고 싶어요.' },
    { id: 'p103', name: '이병호', gender: 'M', type: 'senior', age: 71, phone: '010-3333-3333', address: '광주광역시 광산구 우산동', emergency_contact: '010-6666-7777 (딸)', occupation: '前 공무원', skills: ['역사이야기', '바둑', '서예'], interests: ['역사', '바둑', '등산'], availability: ['평일오전', '토요일'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-25', bio: '공무원 40년 정년퇴직. 청년들에게 인생 조언을, 아이들에게 역사 이야기를 들려주고 싶어요.' },
    { id: 'p104', name: '정금자', gender: 'F', type: 'senior', age: 75, phone: '010-4444-4444', address: '광주광역시 광산구 우산동', emergency_contact: '010-8888-9999 (며느리)', occupation: '前 동네 식당 운영', skills: ['요리', '한식', '이야기'], interests: ['요리', '드라마', '꽃밭'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-28', bio: '평생 식당. 아이들에게 손맛 김치 담그기를 가르쳐주고 싶어요.' },
    { id: 'p105', name: '윤석철', gender: 'M', type: 'senior', age: 70, phone: '010-5555-5555', address: '광주광역시 광산구 우산동', emergency_contact: '010-0000-1111 (아들)', occupation: '前 자영업', skills: ['장기', '한자', '경험담'], interests: ['장기', '뉴스', '걷기'], availability: ['평일오전'], status: 'pending_match', avatar_color: C.lavender, joined_at: '2027-04-05', bio: '동네 토박이. 청년에게 사업 경험을 나누고 아이와 장기 두고 싶어요.' },

    // 양육가정 3가구
    { id: 'p201', name: '이서영', gender: 'F', type: 'parent', age: 38, phone: '010-6666-7777', address: '광주광역시 광산구 우산동', emergency_contact: '010-1010-2020 (배우자)', occupation: 'IT기업 PM (마곡)', skills: [], interests: [], availability: ['평일 저녁 7시 이후 픽업 가능'], status: 'active', avatar_color: C.peach, joined_at: '2027-03-19', child_id: 'p301', bio: '맞벌이라 퇴근 후 아이 돌봄 공백이 늘 걱정이에요.' },
    { id: 'p202', name: '한지영', gender: 'F', type: 'parent', age: 35, phone: '010-7777-8888', address: '광주광역시 광산구 우산동', emergency_contact: '010-3030-4040 (시어머니)', occupation: '간호사', skills: [], interests: [], availability: ['교대근무'], status: 'active', avatar_color: C.peach, joined_at: '2027-03-26', child_id: 'p302', bio: '교대근무라 정해진 픽업 시간이 어려워요. 안전한 공간에서 다양한 어른과 만나길 바라요.' },
    { id: 'p203', name: '김혜진', gender: 'F', type: 'parent', age: 40, phone: '010-8888-9999', address: '광주광역시 광산구 우산동', emergency_contact: '010-5050-6060 (배우자)', occupation: '교사', skills: [], interests: [], availability: ['주중 하원 후 ~ 저녁 6시'], status: 'active', avatar_color: C.peach, joined_at: '2027-04-02', child_id: 'p303', bio: '아이가 외동이라 다양한 세대와의 교류가 절실해요.' },

    // 아동 3명
    { id: 'p301', name: '김유진', gender: 'F', type: 'child', age: 8, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-6666-7777 (모친 이서영)', occupation: '초2', skills: [], interests: ['그림', '책', '강아지'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-03-19', parent_id: 'p201', bio: '책 읽기를 좋아하고 그림 그리는 걸 즐겨요.' },
    { id: 'p302', name: '한도윤', gender: 'M', type: 'child', age: 9, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-7777-8888 (모친 한지영)', occupation: '초3', skills: [], interests: ['로봇', '레고', '축구'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-03-26', parent_id: 'p202', bio: '레고와 로봇을 좋아하고 축구를 잘해요.' },
    { id: 'p303', name: '김지안', gender: 'F', type: 'child', age: 7, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-8888-9999 (모친 김혜진)', occupation: '초1', skills: [], interests: ['공룡', '책', '노래'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-04-02', parent_id: 'p203', bio: '공룡에 푹 빠져 있고 노래 부르기를 좋아해요.' },
  ],

  applications: [
    { id: 'a001', participant_id: 'p001', submitted_at: '2027-03-14', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a002', participant_id: 'p101', submitted_at: '2027-03-15', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a003', participant_id: 'p201', submitted_at: '2027-03-18', consent_criminal: false, consent_guardian: true, consent_data: true, consent_photo: true },
    { id: 'a004', participant_id: 'p004', submitted_at: '2027-03-31', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a005', participant_id: 'p005', submitted_at: '2027-05-11', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
  ],

  verifications: [
    { id: 'v001', participant_id: 'p001', status: 'passed', verified_at: '2027-03-28', verified_by: '코디 한가은', notes: '범죄경력 없음. 면접·오리엔테이션 완료.' },
    { id: 'v002', participant_id: 'p002', status: 'passed', verified_at: '2027-03-29', verified_by: '코디 한가은', notes: '범죄경력 없음. 면접 우수.' },
    { id: 'v003', participant_id: 'p003', status: 'passed', verified_at: '2027-03-30', verified_by: '코디 한가은', notes: '범죄경력 없음.' },
    { id: 'v004', participant_id: 'p004', status: 'passed', verified_at: '2027-04-12', verified_by: '코디 한가은', notes: '범죄경력 없음. 병원 재직증명서 확인.' },
    { id: 'v005', participant_id: 'p005', status: 'in_progress', verified_at: null, verified_by: null, notes: '경찰청 회신 대기 중 (5/12 신청, 평균 7~14일 소요).' },
    { id: 'v101', participant_id: 'p101', status: 'passed', verified_at: '2027-03-28', verified_by: '코디 한가은', notes: '범죄경력 없음.' },
    { id: 'v102', participant_id: 'p102', status: 'passed', verified_at: '2027-04-01', verified_by: '코디 한가은', notes: '범죄경력 없음.' },
    { id: 'v103', participant_id: 'p103', status: 'passed', verified_at: '2027-04-02', verified_by: '코디 한가은', notes: '범죄경력 없음.' },
    { id: 'v104', participant_id: 'p104', status: 'passed', verified_at: '2027-04-03', verified_by: '코디 한가은', notes: '범죄경력 없음.' },
    { id: 'v105', participant_id: 'p105', status: 'in_progress', verified_at: null, verified_by: null, notes: '신청서 보완 요청 (비상연락처).' },
  ],

  matches: [
    { id: 'm001', youth_id: 'p001', senior_id: 'p101', child_id: 'p301', match_notes: '청년-어르신 모두 우산동 거주. 어르신은 교사 출신, 청년은 IT — 디지털 코칭 시너지. 아동은 책·그림 좋아함.', status: 'active', started_at: '2027-05-01' },
    { id: 'm002', youth_id: 'p002', senior_id: 'p102', child_id: 'p302', match_notes: '대학원생 청년-어르신 모두 손글씨/바느질 관심. 아동은 만들기 좋아함.', status: 'active', started_at: '2027-05-01' },
    { id: 'm003', youth_id: 'p003', senior_id: 'p103', child_id: 'p303', match_notes: '디자이너 청년-역사 좋아하는 어르신. 아동은 공룡, 호기심 많음.', status: 'active', started_at: '2027-05-08' },
  ],

  activities: [
    // m001 매칭의 활동들
    { id: 'act001', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-05-08 14:00', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act002', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-05-08 15:30', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act003', match_id: 'm001', type: '진로조언받기', scheduled_at: '2027-05-22 14:00', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act004', match_id: 'm001', type: '기억아카이브', scheduled_at: '2027-05-22 15:30', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act005', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-06-05 14:00', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act006', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-06-05 15:30', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act007', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-06-19 14:00', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act008', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-06-19 15:30', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act009', match_id: 'm001', type: '진로조언받기', scheduled_at: '2027-07-03 14:00', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act010', match_id: 'm001', type: '기억아카이브', scheduled_at: '2027-07-03 15:30', duration_hours: 1.5, location: '우산도서관 2층', status: 'completed' },
    { id: 'act011', match_id: 'm001', type: '디지털코칭', scheduled_at: '2027-07-17 14:00', duration_hours: 1.5, location: '우산도서관 2층', status: 'scheduled' },
    { id: 'act012', match_id: 'm001', type: '학습멘토', scheduled_at: '2027-07-17 15:30', duration_hours: 1.5, location: '우산도서관 2층', status: 'scheduled' },

    { id: 'act101', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-05-09 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act102', match_id: 'm002', type: '학습멘토', scheduled_at: '2027-05-09 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act103', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-05-23 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act104', match_id: 'm002', type: '학습멘토', scheduled_at: '2027-05-23 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act105', match_id: 'm002', type: '진로조언받기', scheduled_at: '2027-06-06 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act106', match_id: 'm002', type: '기억아카이브', scheduled_at: '2027-06-06 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act107', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-07-04 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act108', match_id: 'm002', type: '학습멘토', scheduled_at: '2027-07-04 11:30', duration_hours: 1.5, location: '다함께돌봄센터', status: 'completed' },
    { id: 'act109', match_id: 'm002', type: '디지털코칭', scheduled_at: '2027-07-18 10:00', duration_hours: 1.5, location: '다함께돌봄센터', status: 'scheduled' },

    { id: 'act201', match_id: 'm003', type: '디지털코칭', scheduled_at: '2027-05-15 13:00', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act202', match_id: 'm003', type: '학습멘토', scheduled_at: '2027-05-15 14:30', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act203', match_id: 'm003', type: '진로조언받기', scheduled_at: '2027-05-29 13:00', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act204', match_id: 'm003', type: '기억아카이브', scheduled_at: '2027-05-29 14:30', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act205', match_id: 'm003', type: '디지털코칭', scheduled_at: '2027-06-12 13:00', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act206', match_id: 'm003', type: '학습멘토', scheduled_at: '2027-06-12 14:30', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act207', match_id: 'm003', type: '디지털코칭', scheduled_at: '2027-07-10 13:00', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
    { id: 'act208', match_id: 'm003', type: '학습멘토', scheduled_at: '2027-07-10 14:30', duration_hours: 1.5, location: '우산도서관 1층', status: 'completed' },
  ],

  activity_logs: [
    { id: 'log001', activity_id: 'act001', participant_id: 'p001', hours: 1.5, summary: '박순자 어르신과 카카오톡 이모티콘·송금 기능 익히기. 처음엔 화면이 너무 작아 답답해하셨는데, 글자 크기 키우는 법 알려드리니 환하게 웃으셨다. "이제 손녀랑 톡 할 수 있겠다"고 하심.', approved: true, approved_at: '2027-05-09', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log002', activity_id: 'act001', participant_id: 'p101', hours: 1.5, summary: '민준 청년이 친절히 알려줘서 너무 고맙다. 손녀에게 자랑할 수 있어 행복하다.', approved: true, approved_at: '2027-05-09', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log003', activity_id: 'act002', participant_id: 'p001', hours: 1.5, summary: '유진이와 그림책 함께 읽기. 어려운 한자어가 나와서 박순자 어르신께 여쭤보니 옛이야기 풀어주셨다. 아이가 눈을 반짝이며 듣는 모습이 인상적.', approved: true, approved_at: '2027-05-09', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log004', activity_id: 'act003', participant_id: 'p001', hours: 1.5, summary: '박순자 어르신께 진로 고민(이직 vs 잔류) 상담. "사람은 자기를 알아주는 곳에 머무는 거야"는 말씀이 가슴에 박혔다. 평생 교직 경험에서 우러난 조언이 깊었다.', approved: true, approved_at: '2027-05-23', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log005', activity_id: 'act004', participant_id: 'p101', hours: 1.5, summary: '40년 전 우산동 얘기 — 도로가 비포장이었던 시절, 공항 가는 길이 논밭이었다는 얘기. 민준이가 녹음하고 정리해주겠다고 함.', approved: true, approved_at: '2027-05-23', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log006', activity_id: 'act005', participant_id: 'p001', hours: 1.5, summary: '키오스크 실전 연습 — 우산동 앞 빵집에서 직접 주문. 어르신이 처음으로 혼자 결제 성공! 박수쳐드렸더니 "내가 다 했어!" 하며 웃으심.', approved: true, approved_at: '2027-06-06', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log007', activity_id: 'act007', participant_id: 'p001', hours: 1.5, summary: '병원 앱 예약, 약국 처방조회 앱 설치. 어르신이 본인 진료 일정을 직접 관리하실 수 있게 됨.', approved: true, approved_at: '2027-06-20', approved_by: '코디 한가은', has_photo: false, mood: 4 },
    { id: 'log008', activity_id: 'act008', participant_id: 'p001', hours: 1.5, summary: '유진이 수학 — 분수 개념. 박순자 어르신이 떡 자르며 설명해주신 게 압권. 아이가 "할머니 짱이야"라고 함.', approved: true, approved_at: '2027-06-20', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log009', activity_id: 'act009', participant_id: 'p001', hours: 1.5, summary: '이직 결정 보고. 어르신이 본인 일처럼 기뻐해주심. "사람 인연이 진짜 자산이다" 말씀하심.', approved: true, approved_at: '2027-07-04', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log010', activity_id: 'act010', participant_id: 'p101', hours: 1.5, summary: '우산동 옛 시장 이야기. 민준이가 사진을 보여주며 지금과 비교해줌. 동네 변화가 한눈에 보임.', approved: true, approved_at: '2027-07-04', approved_by: '코디 한가은', has_photo: true, mood: 5 },
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
    { id: 'log204', activity_id: 'act204', participant_id: 'p103', hours: 1.5, summary: '광산구 옛 모습 — 김포공항 너머 들판이었던 시절. 지안이가 흥미진진하게 들음.', approved: true, approved_at: '2027-05-30', approved_by: '코디 한가은', has_photo: true, mood: 5 },
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

// 시드/스키마 불일치 보정: 활동 date/time, 로그 date, 자녀 guardian_id 채우기
function normalizeState(s) {
  if (!s) return s;
  const activities = (s.activities || []).map(a => ({
    ...a,
    date: a.date || (a.scheduled_at || '').slice(0, 10),
    time: a.time || (a.scheduled_at || '').slice(11, 16),
  }));
  const actById = {};
  activities.forEach(a => { actById[a.id] = a; });
  const activity_logs = (s.activity_logs || []).map(l => ({
    ...l,
    date: l.date || l.approved_at || (actById[l.activity_id]?.scheduled_at || '').slice(0, 10) || '',
    created_at: l.created_at || l.approved_at || (actById[l.activity_id]?.scheduled_at || '') || '',
  }));
  const participants = (s.participants || []).map(p =>
    p.type === 'child' ? { ...p, guardian_id: p.guardian_id || p.parent_id } : p
  );
  return { ...s, activities, activity_logs, participants };
}

async function loadState() {
  try {
    const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
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
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

// ============================================================================
// 5. UI PRIMITIVES
// ============================================================================

function hashStr(s) {
  let h = 5381;
  const str = s || '?';
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

const SKIN_TONES = ['#F3D6BC', '#EBC6A4', '#E0B188', '#CE9A6E'];
const HAIR_TONES = ['#2C2420', '#3E3026', '#52402F', '#6B4F39', '#1F1B17'];

// 세대·성별을 반영한 생성형 얼굴 아이콘 (이름 해시로 결정 → 같은 사람은 항상 같은 얼굴)
function Avatar({ name, color = C.brand, size = 40, ring = false, type, gender }) {
  const h = hashStr(name);
  const isSenior = type === 'senior';
  const isChild = type === 'child';
  const isTeen = type === 'teen';
  const female = gender === 'F' ? true : gender === 'M' ? false : (h % 2 === 0);
  const skin = SKIN_TONES[h % SKIN_TONES.length];
  const hair = isSenior ? (h % 2 === 0 ? '#C9C3B8' : '#D8D3C9') : HAIR_TONES[h % HAIR_TONES.length];
  const glasses = isSenior || (!isChild && !isTeen && h % 4 === 0);
  const shirt = [color, color, '#8A847A'][h % 3];

  // 좌표 기준 viewBox 0 0 100 100
  const faceCy = isChild ? 47 : 46;
  const faceR = isChild ? 19 : 21;
  const eyeY = faceCy + (isChild ? 1 : 2);
  const eyeR = isChild ? 3.0 : 2.4;
  const mouthY = faceCy + (isChild ? 11 : 13);

  return (
    <div
      aria-label={name}
      style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        boxShadow: ring ? `0 0 0 3px ${C.card}, 0 0 0 5px ${color}40` : 'none',
        background: color,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
        {/* 배경 (위쪽이 살짝 밝은 그라데이션) */}
        <defs>
          <linearGradient id={`bg-${h}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={color} />
        <rect width="100" height="100" fill={`url(#bg-${h})`} />

        {/* 어깨/옷 */}
        <path d="M50 72 C32 72 20 84 20 102 L80 102 C80 84 68 72 50 72 Z" fill={shirt} opacity="0.92" />
        <path d="M50 72 C32 72 20 84 20 102 L80 102 C80 84 68 72 50 72 Z" fill="#ffffff" opacity="0.14" />
        {/* 목 */}
        <rect x="43.5" y="60" width="13" height="14" rx="5" fill={skin} />

        {/* 여성 옆머리 (얼굴 뒤) */}
        {female && !isChild && (
          <>
            <ellipse cx={50 - faceR + 2} cy={faceCy + 6} rx="9" ry="20" fill={hair} />
            <ellipse cx={50 + faceR - 2} cy={faceCy + 6} rx="9" ry="20" fill={hair} />
          </>
        )}

        {/* 얼굴 */}
        <ellipse cx="50" cy={faceCy} rx={faceR} ry={faceR + 2} fill={skin} />
        {/* 귀 */}
        <circle cx={50 - faceR} cy={faceCy + 2} r="3.6" fill={skin} />
        <circle cx={50 + faceR} cy={faceCy + 2} r="3.6" fill={skin} />

        {/* 윗머리 */}
        {isSenior ? (
          // 어르신: 짧고 옅은 머리
          <path d={`M${50 - faceR - 1} ${faceCy - 4} C${50 - faceR - 1} ${faceCy - 24} ${50 + faceR + 1} ${faceCy - 24} ${50 + faceR + 1} ${faceCy - 4} C${50 + faceR + 1} ${faceCy - 14} ${50 + faceR - 8} ${faceCy - 15} 50 ${faceCy - 15} C${50 - faceR + 8} ${faceCy - 15} ${50 - faceR - 1} ${faceCy - 14} ${50 - faceR - 1} ${faceCy - 4} Z`} fill={hair} />
        ) : female ? (
          // 여성: 풍성한 윗머리
          <path d={`M${50 - faceR - 3} ${faceCy + 6} C${50 - faceR - 5} ${faceCy - 28} ${50 + faceR + 5} ${faceCy - 28} ${50 + faceR + 3} ${faceCy + 6} C${50 + faceR + 3} ${faceCy - 10} ${50 + faceR - 7} ${faceCy - 11} 50 ${faceCy - 11} C${50 - faceR + 7} ${faceCy - 11} ${50 - faceR - 3} ${faceCy - 10} ${50 - faceR - 3} ${faceCy + 6} Z`} fill={hair} />
        ) : (
          // 남성: 짧은 머리
          <path d={`M${50 - faceR - 1} ${faceCy - 2} C${50 - faceR - 1} ${faceCy - 26} ${50 + faceR + 1} ${faceCy - 26} ${50 + faceR + 1} ${faceCy - 2} C${50 + faceR + 1} ${faceCy - 13} ${50 + faceR - 7} ${faceCy - 12} 50 ${faceCy - 12} C${50 - faceR + 7} ${faceCy - 12} ${50 - faceR - 1} ${faceCy - 13} ${50 - faceR - 1} ${faceCy - 2} Z`} fill={hair} />
        )}

        {/* 어르신 여성: 쪽머리 */}
        {isSenior && female && <circle cx="50" cy={faceCy - 20} r="7" fill={hair} />}

        {/* 눈 */}
        <ellipse cx="42" cy={eyeY} rx={eyeR} ry={eyeR + 0.8} fill="#3A2E26" />
        <ellipse cx="58" cy={eyeY} rx={eyeR} ry={eyeR + 0.8} fill="#3A2E26" />

        {/* 안경 (어르신/일부) */}
        {glasses && (
          <g stroke="#544C42" strokeWidth="1.6" fill="none">
            <circle cx="42" cy={eyeY} r="6.5" />
            <circle cx="58" cy={eyeY} r="6.5" />
            <line x1="48.5" y1={eyeY} x2="51.5" y2={eyeY} />
          </g>
        )}

        {/* 볼터치 (아동) */}
        {isChild && (
          <>
            <circle cx="35" cy={eyeY + 7} r="3.6" fill="#E89486" opacity="0.45" />
            <circle cx="65" cy={eyeY + 7} r="3.6" fill="#E89486" opacity="0.45" />
          </>
        )}

        {/* 미소 */}
        <path d={`M44 ${mouthY} Q50 ${mouthY + 6} 56 ${mouthY}`} stroke="#9A5B45" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      </svg>
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

// 글로벌 벤치마크 — 일본 '후레아이 깃푸(Fureai Kippu)' 시간은행 모델
function TimeBankCard({ hours = 0, accent = C.brand }) {
  return (
    <Card padding={22} style={{ marginBottom: 20, background: 'linear-gradient(135deg, ' + C.brandBg + ' 0%, ' + C.cream + ' 100%)', border: '1px solid ' + C.brand + '22' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <Clock size={16} color={accent} />
        <div style={{ fontSize: 13, fontWeight: 800, color: accent }}>이음 타임뱅크</div>
        <Badge color={C.mute} soft={C.muteSoft} size="sm">일본 후레아이깃푸 모델</Badge>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{hours.toFixed(1)}<span style={{ fontSize: 16, fontWeight: 600, color: C.mute }}> 시간 적립</span></div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, lineHeight: 1.55 }}>이웃을 도운 시간이 차곡차곡 신뢰로 쌓여요. 모아둔 시간은 훗날 내가, 또는 우리 가족이 돌봄이 필요할 때 쓰거나 다른 분께 선물할 수 있어요.</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.card, borderRadius: 10, border: '1px solid ' + C.border }}>
          <div style={{ fontSize: 11, color: C.mute }}>이월 가능</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{hours.toFixed(1)}h</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.card, borderRadius: 10, border: '1px solid ' + C.border }}>
          <div style={{ fontSize: 11, color: C.mute }}>가족 선물</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>가능</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.card, borderRadius: 10, border: '1px solid ' + C.border }}>
          <div style={{ fontSize: 11, color: C.mute }}>신뢰 등급</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.success }}>우수</div>
        </div>
      </div>
    </Card>
  );
}

// 멘토 피드백① — 어르신 '첫 신뢰의 허들' 대응: 지자체 공인 인증 발신 표시
function OfficialSenderBadge({ size = 'sm', style = {} }) {
  const fs = size === 'lg' ? 13 : size === 'md' ? 12 : 11;
  const ic = size === 'lg' ? 15 : 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: C.blueSoft, color: C.blue,
      padding: size === 'lg' ? '6px 12px' : '4px 9px', borderRadius: 999,
      fontSize: fs, fontWeight: 700, whiteSpace: 'nowrap',
      border: `1px solid ${C.blue}33`, ...style,
    }}>
      <ShieldCheck size={ic} /> 광주광역시 인증 발신
      <span style={{ fontSize: fs - 1, fontWeight: 800, background: C.amber, color: '#fff', padding: '1px 6px', borderRadius: 999, marginLeft: 3 }}>예정</span>
    </span>
  );
}

// 멘토 피드백② — 오프라인 활동 안전: 지자체 돌봄 책임보험 자동적용 표시
function InsuranceBadge({ size = 'sm', style = {} }) {
  const fs = size === 'lg' ? 13 : size === 'md' ? 12 : 11;
  const ic = size === 'lg' ? 15 : 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: C.successSoft, color: C.success,
      padding: size === 'lg' ? '6px 12px' : '4px 9px', borderRadius: 999,
      fontSize: fs, fontWeight: 700, whiteSpace: 'nowrap',
      border: `1px solid ${C.success}33`, ...style,
    }}>
      <ShieldCheck size={ic} /> 활동 중 돌봄 책임보험 자동적용
      <span style={{ fontSize: fs - 1, fontWeight: 800, background: C.amber, color: '#fff', padding: '1px 6px', borderRadius: 999, marginLeft: 3 }}>예정</span>
    </span>
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
        {typeof value === 'number' ? <CountUp value={value} /> : value}
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

// ── 모션 · 인포그래픽 툴킷 ────────────────────────────────────────────────
function useCountUp(target, duration = 950) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, '')) || 0;
    let start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(num * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 950 }) {
  const v = useCountUp(value, duration);
  const n = (decimals > 0 ? v : Math.round(v)).toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <>{prefix}{n}{suffix}</>;
}

// 애니메이션 진행 도넛(링)
function Ring({ value, max = 100, size = 96, stroke = 9, color = C.brand, track = C.borderSoft, label, sublabel, duration = 1100 }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [draw, setDraw] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setDraw(pct)); return () => cancelAnimationFrame(id); }, [pct]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)}
          style={{ transition: `stroke-dashoffset ${duration}ms cubic-bezier(0.22,1,0.36,1)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {label != null && <div style={{ fontSize: Math.round(size * 0.27), fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em', lineHeight: 1 }}>{label}</div>}
        {sublabel && <div style={{ fontSize: Math.max(10, Math.round(size * 0.12)), color: C.mute, marginTop: 3, fontWeight: 600 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// 애니메이션 막대
function AnimatedBar({ value, max = 100, color = C.brand, height = 8, track = C.borderSoft, duration = 850, delay = 0 }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const [w, setW] = useState(0);
  useEffect(() => { const id = setTimeout(() => setW(pct), delay + 30); return () => clearTimeout(id); }, [pct, delay]);
  return (
    <div style={{ height, background: track, borderRadius: height, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${w * 100}%`, height: '100%', background: color, borderRadius: height, transition: `width ${duration}ms cubic-bezier(0.22,1,0.36,1)` }} />
    </div>
  );
}

// 진입 애니메이션 래퍼 (마운트 시 fade + slide)
function Reveal({ children, delay = 0, y = 10, style = {} }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = setTimeout(() => setShown(true), delay); return () => clearTimeout(id); }, [delay]);
  return (
    <div style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : `translateY(${y}px)`, transition: 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)', ...style }}>
      {children}
    </div>
  );
}

// 신뢰 배지 (Care.com식 검증 표시)
const TRUST_META = {
  verified: { c: C.sage, soft: C.sageSoft, icon: ShieldCheck, text: '검증 완료' },
  pending: { c: C.amber, soft: C.amberSoft, icon: Clock, text: '검증 중' },
  none: { c: C.mute, soft: C.muteSoft, icon: ShieldAlert, text: '미검증' },
};
function TrustBadge({ status = 'verified', label, size = 'sm' }) {
  const m = TRUST_META[status] || TRUST_META.none;
  const Icon = m.icon;
  const lg = size === 'lg';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: lg ? 6 : 4, background: m.soft, color: m.c, padding: lg ? '5px 11px' : '3px 8px', borderRadius: 999, fontSize: lg ? 13 : 11, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
      <Icon size={lg ? 15 : 12} strokeWidth={2.4} />
      {label || m.text}
    </span>
  );
}

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
function useIsMobile(bp = 880) {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const on = () => setM(window.innerWidth <= bp);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

function SearchBar({ value, onChange, placeholder = '검색…', style = {} }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mute, pointerEvents: 'none' }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, fontSize: 13.5, color: C.ink, fontFamily: FONT_STACK, outline: 'none', boxSizing: 'border-box' }}
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="지우기" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.mute, display: 'flex', padding: 2 }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

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
  }
  return out;
}

function NotificationBell({ state, role, user, onNavigate, dark }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => buildNotifications(state, role, user), [state, role, user]);
  const ref = useRef();
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const urgent = items.some(i => i.urgent);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="알림" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : C.border}`, background: dark ? 'rgba(255,255,255,0.06)' : C.card, color: dark ? '#fff' : C.inkSoft, cursor: 'pointer' }}>
        <Bell size={18} />
        {items.length > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 9, background: urgent ? C.red : C.brand, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${dark ? '#1A1814' : C.card}` }}>{items.length}</span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 46, right: 0, width: 320, maxWidth: '86vw', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 16px 48px rgba(26,24,20,0.18)', zIndex: 200, overflow: 'hidden', animation: 'slideUp 0.18s ease', textAlign: 'left' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.borderSoft}`, fontSize: 13, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>알림 {items.length > 0 && `(${items.length})`}</div>
          {items.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: C.mute, fontSize: 13 }}>새로운 알림이 없습니다</div>
          ) : items.map(it => {
            const Icon = it.icon;
            return (
              <button key={it.id} onClick={() => { setOpen(false); onNavigate && onNavigate(it.view); }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 16px', border: 'none', borderBottom: `1px solid ${C.borderSoft}`, background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT_STACK }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: it.color + '18', color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: C.mute, marginTop: 1 }}>{it.desc}</div>
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
      <Card padding={18} style={{ border: `1.5px solid ${activity.status === 'in_progress' ? color : C.border}`, background: activity.status === 'in_progress' ? color + '0C' : C.card }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Badge color={color} soft={color + '1A'}>{activity.type || '활동'}</Badge>
              <span style={{ fontSize: 12, color: C.mute }}>{fmtRelativeDate(activity.scheduled_at)} {activity.time || ''}</span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{activity.title || activity.type || '오늘의 활동'}</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {activity.location || '장소 미정'}</div>
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
        <div onClick={() => setFeedbackOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 440, width: '100%', padding: 28, boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease', textAlign: 'left' }}>
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
            <Textarea value={summary} onChange={setSummary} placeholder="무엇을 함께 했는지, 기억에 남는 순간을 적어주세요." rows={3} />
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

// 이음 로고 — 세대가 이어지는 두 인물(큰=어른, 작은=청년·아이)
function EumLogo({ size = 32, variant = 'badge' }) {
  const badge = variant === 'badge';
  const gid = `eumGrad-${size}-${variant}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', flexShrink: 0 }} role="img" aria-label="이음 로고">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.brand} />
          <stop offset="100%" stopColor={C.peach} />
        </linearGradient>
      </defs>
      {badge && <rect width="100" height="100" rx="26" fill={`url(#${gid})`} />}
      <g fill="none" stroke={badge ? '#fff' : `url(#${gid})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="34" cy="36" r="12.5" />
        <circle cx="68" cy="40" r="9" />
        <path d="M18 78 C18 61 26 53 34 53 C41 53 45 59 50 60 C54 60.8 58 56 68 56 C75 56 82 62 82 78" />
      </g>
    </svg>
  );
}

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
      { id: 'roadmap', label: '서비스 로드맵', icon: <Sparkles size={18} /> },
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

  return (
    <div style={{
      width: isSenior ? 240 : 232, height: '100vh', background: C.card,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }} onClick={() => onLogout()} role="button" aria-label="처음으로">
          <div style={{ borderRadius: 9, boxShadow: `0 2px 8px ${C.brand}40`, display: 'flex' }}>
            <EumLogo size={32} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', fontFamily: SERIF_STACK, lineHeight: 1 }}>이음</div>
            <div style={{ fontSize: 10, color: C.mute, letterSpacing: '0.08em', fontWeight: 600, marginTop: 2 }}>EUM · 세대를 잇다</div>
          </div>
        </div>
      </div>

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
          <Avatar type={role} name={userName} color={persona.color} size={36} />
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

// 3세대 선순환 — 회전 애니메이션 인포그래픽
function LoopInfographic() {
  const nodes = [
    { label: '청년', sub: '재능·디지털', color: C.sage, soft: C.sageSoft, pos: { top: 0, left: '50%', marginLeft: -43 }, delay: '0s' },
    { label: '어르신', sub: '지혜·돌봄', color: C.lavender, soft: C.lavenderSoft, pos: { bottom: 4, right: 2 }, delay: '1.4s' },
    { label: '아이', sub: '활력·웃음', color: C.peach, soft: C.peachSoft, pos: { bottom: 4, left: 2 }, delay: '2.8s' },
  ];
  return (
    <div style={{ position: 'relative', width: 300, height: 268, margin: '0 auto', animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1)' }}>
      <style>{`
        @keyframes eumFloaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes eumPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.62; } }
        @keyframes eumSpinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ position: 'absolute', inset: 24, borderRadius: '50%', border: '2px dashed ' + C.brand + '40', animation: 'eumSpinSlow 28s linear infinite' }} />
      <div style={{ position: 'absolute', inset: 50, borderRadius: '50%', border: '1px solid ' + C.borderSoft }} />
      <svg viewBox="0 0 300 268" width="300" height="268" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <marker id="eumArrow" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 Z" fill={C.brand} opacity="0.5" />
          </marker>
        </defs>
        <path d="M192.3,43.4 A100,100 0 0,1 249.6,142.7" fill="none" stroke={C.brand} strokeWidth="2" strokeOpacity="0.45" markerEnd="url(#eumArrow)" />
        <path d="M207.4,215.9 A100,100 0 0,1 92.6,215.9" fill="none" stroke={C.brand} strokeWidth="2" strokeOpacity="0.45" markerEnd="url(#eumArrow)" />
        <path d="M50.4,142.7 A100,100 0 0,1 107.7,43.4" fill="none" stroke={C.brand} strokeWidth="2" strokeOpacity="0.45" markerEnd="url(#eumArrow)" />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', animation: 'eumPulse 3.4s ease-in-out infinite' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: '0.06em' }}>이음</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, lineHeight: 1.12 }}>3세대<br />선순환</div>
      </div>
      {nodes.map((n) => (
        <div key={n.label} style={{ position: 'absolute', width: 86, padding: '11px 10px', textAlign: 'center', background: n.soft, color: n.color, borderRadius: 18, border: '1px solid ' + n.color + '30', boxShadow: '0 8px 20px ' + n.color + '22', animation: 'eumFloaty 4.6s ease-in-out infinite', animationDelay: n.delay, ...n.pos }}>
          <div style={{ fontSize: 14.5, fontWeight: 800 }}>{n.label}</div>
          <div style={{ fontSize: 10.5, marginTop: 2, opacity: 0.82 }}>{n.sub}</div>
        </div>
      ))}
    </div>
  );
}

function RoleSelect({ state, onSelectRole, onShowApplication }) {
  // 시드된 페르소나 fixed assignments
  const personas = [
    { role: 'youth', id: 'p001', gender: 'M', name: '김민준', subtitle: '27세 · 스타트업 개발자', desc: '어르신께 디지털을 알려드리고, 진로 조언을 받습니다.', color: C.sage, soft: C.sageSoft, gradient: 'linear-gradient(135deg, #6B8E5A 0%, #8FB47E 100%)' },
    { role: 'senior', id: 'p101', gender: 'F', name: '박순자', subtitle: '73세 · 前 교사', desc: '청년과 디지털을 익히고, 아이에게 옛이야기를 들려드려요.', color: C.lavender, soft: C.lavenderSoft, gradient: 'linear-gradient(135deg, #7F6FA0 0%, #A797C0 100%)' },
    { role: 'parent', id: 'p201', gender: 'F', name: '이서영', subtitle: '38세 · IT기업 PM (유진 8세 보호자)', desc: '아이가 어르신·청년과 만나는 안전한 공간을 신뢰해요.', color: C.peach, soft: C.peachSoft, gradient: 'linear-gradient(135deg, #D89368 0%, #E8B58F 100%)' },
    { role: 'coordinator', id: 'cdn001', gender: 'F', name: '한가은', subtitle: '코디네이터 · 광주 광산구', desc: '신청·검증·매칭·정산을 한눈에 관리해요.', color: C.ink, soft: '#EDEAE5', gradient: 'linear-gradient(135deg, #1A1814 0%, #3A352F 100%)' },
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
            <div style={{ width: 54, height: 54, borderRadius: 14, boxShadow: `0 8px 24px ${C.brand}40`, display: 'flex' }}>
              <EumLogo size={54} />
            </div>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: C.ink, letterSpacing: '-0.04em', margin: '0 0 10px', fontFamily: SERIF_STACK, lineHeight: 1.1 }}>
            세대를 잇다, <span style={{ color: C.brand, fontStyle: 'italic' }}>이음</span>
          </h1>
          <p style={{ fontSize: 16, color: C.inkSoft, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            세 세대가 서로 돕고, 도운 만큼 모두에게 보상이 돌아가요<br />
            <span style={{ color: C.ink, fontWeight: 600 }}>우리동네 3세대 상생 품앗이 플랫폼</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            <Badge color={C.blue} soft={C.blueSoft} size="md">청소년</Badge>
            <Badge color={C.sage} soft={C.sageSoft} size="md">청년</Badge>
            <Badge color={C.gold} soft={C.goldSoft} size="md">중년·서포터</Badge>
            <Badge color={C.lavender} soft={C.lavenderSoft} size="md">어르신</Badge>
            <Badge color={C.peach} soft={C.peachSoft} size="md">양육가정·아동</Badge>
          </div>
        </div>

        {/* 3세대 선순환 — 애니메이션 인포그래픽 */}
        <div style={{ marginBottom: 30 }}>
          <LoopInfographic />
          <p style={{ textAlign: 'center', fontSize: 14.5, color: C.inkSoft, lineHeight: 1.7, maxWidth: 540, margin: '4px auto 18px' }}>
            청년의 재능이 어르신께 닿고, 어르신의 지혜가 아이에게,<br />
            아이의 웃음이 다시 청년에게 이어져요. 누구 하나 일방적으로 주기만 하지 않아요.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Badge color={C.blue} soft={C.blueSoft} size="md"><ShieldCheck size={13} /> 광주광역시 통합돌봄 연계</Badge>
            <Badge color={C.gold} soft={C.goldSoft} size="md"><Wallet size={13} /> 광주상생카드·봉사시간 보상</Badge>
            <Badge color={C.success} soft={C.successSoft} size="md"><UserCheck size={13} /> 4단계 안전 검증</Badge>
          </div>
        </div>

        {/* 데모 로그인 안내 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ background: C.amberSoft, padding: 9, borderRadius: 10, display: 'flex' }}>
            <Sparkles size={20} color={C.amber} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>2027 광주 광산구 우산동 파일럿 · 데모 모드</div>
            <div style={{ fontSize: 13, color: C.mute }}>지금 활동 중인 15쌍의 이야기를 그대로 담아뒀어요. 역할을 골라 들어가면 모든 기능을 직접 둘러볼 수 있어요.</div>
          </div>
        </div>

        {/* 페르소나 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 36 }}>
          {personas.map((p) => (
            <Card key={p.role} padding={0} hoverable onClick={() => onSelectRole(p.role, p.id)} style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ background: p.gradient, height: 70, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                <Avatar type={p.role} gender={p.gender} name={p.name} color="#fff" size={56} ring={false} />
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
              <div style={{ fontSize: 13, color: C.mute, lineHeight: 1.55 }}>광주 광산구 우산동에 사시는 분이면 <strong style={{ color: C.inkSoft }}>청소년부터 어르신까지 누구나</strong> 신청할 수 있어요. 5분이면 충분해요.</div>
            </div>
            <Button variant="brand" icon={<UserPlus size={16} />} onClick={onShowApplication} size="lg">
              참여 신청하기
            </Button>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 36, color: C.mute, fontSize: 12 }}>
          이음 MVP · 광산구청 주민참여예산 시범사업 · 2027 우산동 파일럿
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
    type: '', name: '', age: '', phone: '', address: '광산구 ', emergency_contact: '',
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
      if (form.type === 'parent' || form.type === 'teen') return baseOk && form.consent_guardian;
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 460, width: '100%', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease' }}>
          <div style={{ textAlign: 'center', padding: '44px 28px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.sageSoft, color: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={36} strokeWidth={3} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: '0 0 8px', letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>신청이 접수되었습니다</h2>
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, marginBottom: 24 }}>
          {(form.type === 'youth' || form.type === 'adult' || form.type === 'senior') && '범죄경력 조회는 모집과 동시에 진행됩니다. 평균 7~14일 소요.'}
          {form.type === 'teen' && '미성년자 활동을 위해 보호자 동의 절차를 함께 진행합니다.'}<br />
          코디네이터가 1~3일 내에 카카오톡으로 면접 일정을 안내드립니다.
        </div>
        <Button variant="primary" onClick={onClose}>확인</Button>
          </div>
        </div>
      </div>
    );
  }

  const TYPES = [
    { id: 'teen', label: '청소년', age: '만 15~18세', color: C.blue, soft: C.blueSoft, desc: '어르신·아동과 교류 + 봉사시간 인정 + 진로 탐색' },
    { id: 'youth', label: '청년', age: '만 19~39세', color: C.sage, soft: C.sageSoft, desc: '월 27.5만 상품권 + 어르신 멘토 + 동네 정착' },
    { id: 'adult', label: '중년·서포터', age: '만 40~64세', color: C.gold, soft: C.goldSoft, desc: '활동비 + 이웃 돌봄 참여 + 세대 잇기 서포터' },
    { id: 'senior', label: '어르신', age: '만 65세 이상', color: C.lavender, soft: C.lavenderSoft, desc: '월 27.5만 상품권 + 디지털 자립 + 효능감 회복' },
    { id: 'parent', label: '양육가정', age: '자녀와 함께', color: C.peach, soft: C.peachSoft, desc: '안전한 공간 + 3세대 교류 + 무료 참여' },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 600, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <EumLogo size={26} />
              <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>이음 참여 신청</div>
            </div>
            <button onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 4, display: 'flex', borderRadius: 8 }}><X size={20} /></button>
          </div>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 2px' }}>
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
        </div>
        {/* Scrollable body */}
        <div style={{ padding: '22px 24px 8px', overflowY: 'auto', flex: 1 }}>

      {/* Step 1: Type */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 6, letterSpacing: '-0.02em', fontFamily: SERIF_STACK }}>어떤 자격으로 참여하시나요?</div>
          <div style={{ fontSize: 13, color: C.mute, marginBottom: 18 }}>광산구에 거주하시면 <strong style={{ color: C.inkSoft }}>청소년부터 어르신까지 누구나</strong> 신청할 수 있어요. 연령 구간은 안내용 가이드이며, 유형에 따라 절차가 조금씩 다릅니다.</div>
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
            <Input value={form.address} onChange={(v) => set('address', v)} placeholder="광주광역시 광산구 우산동 ..." icon={<MapPin size={15} />} />
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
            <ChipSelect options={SKILL_OPTIONS} selected={form.skills} onToggle={(v) => toggle('skills', v)} max={5} color={(PERSONA[form.type] && PERSONA[form.type].color) || C.sage} />
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
            {(form.type === 'youth' || form.type === 'adult' || form.type === 'senior') && (
              <Checkbox checked={form.consent_criminal} onChange={(v) => set('consent_criminal', v)} label="범죄경력 조회 동의 (아동복지법)" sublabel="만 14세 미만 아동과의 활동을 위해 경찰청 범죄경력 조회가 필수입니다. 결과는 코디네이터만 열람 후 즉시 폐기됩니다." required />
            )}
            {form.type === 'teen' && (
              <Checkbox checked={form.consent_guardian} onChange={(v) => set('consent_guardian', v)} label="보호자 동의 (미성년자 참여)" sublabel="만 18세 이하 청소년은 보호자(법정대리인)의 활동 동의가 필요합니다. 코디네이터가 보호자에게 별도 동의서를 안내합니다." required />
            )}
            {form.type === 'parent' && (
              <Checkbox checked={form.consent_guardian} onChange={(v) => set('consent_guardian', v)} label="보호자 동의서 5종 작성 동의" sublabel="활동참여·개인정보·영상사진·응급의료·외부활동(공공공간 한정) 5종 동의서를 코디네이터를 통해 별도 작성합니다." required />
            )}
          </div>
        </div>
      )}

        </div>
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: `1px solid ${C.border}`, background: C.cream, flexShrink: 0 }}>
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

// 글로벌 벤치마크 — 매칭 추천 알고리즘 설명 (적합도 스코어)
function MatchReasonCard({ user, senior, child }) {
  const shared = (user?.interests || []).filter((x) => (senior?.interests || []).includes(x));
  const score = Math.min(98, 80 + shared.length * 4 + 6);
  const reasons = [
    { icon: MapPin, text: '같은 우산동 · 도보 10분 거리' },
    { icon: Heart, text: shared.length ? ('공통 관심사 ' + shared.slice(0, 2).join('·')) : '생활 리듬·관심사가 서로 보완돼요' },
    { icon: Clock, text: '활동 가능 시간대가 잘 맞아요' },
    { icon: ShieldCheck, text: '세 사람 모두 4단계 안전검증 완료' },
  ];
  return (
    <Card padding={20} style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Sparkles size={17} color={C.brand} />
        <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>이 트리오를 추천한 이유</div>
        <Badge color={C.mute} soft={C.muteSoft} size="sm">AI 매칭 추천</Badge>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: C.mute }}>적합도</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.success, fontFamily: SERIF_STACK }}>{score}%</div>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: C.muteSoft, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ width: score + '%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, ' + C.sage + ', ' + C.success + ')' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
        {reasons.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: C.bg, borderRadius: 9 }}>
              <Icon size={14} color={C.brand} />
              <span style={{ fontSize: 12.5, color: C.inkSoft }}>{r.text}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// 글로벌 벤치마크 — 영국 GoodGym의 미션형(일회성) 봉사
function MissionBoardCard() {
  const [accepted, setAccepted] = useState([]);
  const missions = [
    { id: 'ms1', icon: Coffee, title: '무거운 장보기 짐 옮겨드리기', who: '독거 어르신 댁', dist: '도보 8분', mins: 30, reward: '봉사 0.5h', color: C.peach, soft: C.peachSoft },
    { id: 'ms2', icon: Smile, title: '스마트폰 사진 정리 도와드리기', who: '김복례 어르신', dist: '도보 5분', mins: 40, reward: '봉사 0.7h', color: C.lavender, soft: C.lavenderSoft },
    { id: 'ms3', icon: BookOpen, title: '도서관에서 아이들에게 책 읽어주기', who: '우산동 작은도서관', dist: '도보 12분', mins: 50, reward: '봉사 1.0h', color: C.gold, soft: C.goldSoft },
  ];
  const toggle = (id) => setAccepted((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);
  return (
    <Card padding={20} style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <Activity size={17} color={C.brand} />
        <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>동네 미션</div>
        <Badge color={C.mute} soft={C.muteSoft} size="sm">영국 GoodGym 모델</Badge>
      </div>
      <div style={{ fontSize: 12.5, color: C.mute, marginBottom: 14 }}>오가는 길에 잠깐, 짧게 돕는 일회성 미션이에요. 정기 매칭이 없는 날에도 봉사시간을 쌓을 수 있어요.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {missions.map((m) => {
          const Icon = m.icon;
          const on = accepted.includes(m.id);
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 11, border: '1px solid ' + (on ? C.success : C.borderSoft), background: on ? C.successSoft : C.card }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: m.soft, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{m.title}</div>
                <div style={{ fontSize: 11.5, color: C.mute, marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span>{m.who}</span><span>· {m.dist}</span><span>· 약 {m.mins}분</span><span style={{ color: C.gold, fontWeight: 700 }}>{m.reward}</span>
                </div>
              </div>
              <button onClick={() => toggle(m.id)} style={{ flexShrink: 0, border: '1px solid ' + (on ? C.success : C.border), background: on ? C.success : C.card, color: on ? '#fff' : C.ink, borderRadius: 9, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT_STACK }}>
                {on ? '신청 완료' : '참여하기'}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

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
                  <TrioMember person={senior} sub="멘토" color={C.lavender} trust={trustStatus(state, senior?.id)} />
                  <div style={{ display: 'flex', alignItems: 'center', color: C.brand, fontSize: 20 }}>↔</div>
                  <TrioMember person={user} sub="나" color={C.sage} highlight />
                  <div style={{ display: 'flex', alignItems: 'center', color: C.brand, fontSize: 20 }}>↔</div>
                  <TrioMember person={child} sub="멘티" color={C.peach} trust={trustStatus(state, child?.id)} />
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

          {match && <MatchReasonCard user={user} senior={senior} child={child} />}

          {/* 이번 달 목표 — 움직이는 도넛 인포그래픽 */}
          <Reveal>
            <Card padding={20} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 22, background: `linear-gradient(135deg, ${C.cream} 0%, ${C.sageSoft} 140%)`, flexWrap: 'wrap' }}>
              <Ring value={monthHours} max={24} size={104} stroke={11} color={C.sage} label={`${Math.round(monthHours / 24 * 100)}%`} sublabel="달성" />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.sage, letterSpacing: '0.08em', marginBottom: 6 }}>이번 달 활동 목표</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  <CountUp value={monthHours} suffix="시간" /> <span style={{ fontSize: 15, color: C.mute, fontWeight: 600 }}>/ 24시간</span>
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
                  {monthHours >= 24 ? '이번 달 목표를 달성했어요! 🎉' : `목표까지 ${24 - monthHours}시간 남았어요. 꾸준히 잇고 있어요.`}
                </div>
                <div style={{ marginTop: 12 }}>
                  <AnimatedBar value={monthHours} max={24} color={C.sage} height={8} />
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard label="이번 달 활동시간" value={`${monthHours}h`} sub={`목표 24h 중 ${Math.round(monthHours/24*100)}%`} icon={<Clock size={16} color={C.sage} />} color={C.ink} />
            <StatCard label="누적 활동시간" value={`${totalHours}h`} sub={`${myLogs.filter(l => l.approved).length}건 승인`} icon={<Activity size={16} color={C.brand} />} />
            <StatCard label="누적 정산액" value={krw(totalEarned)} sub="광주상생카드" icon={<Wallet size={16} color={C.gold} />} color={C.gold} />
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

          <MissionBoardCard />

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

function YouthSchedule({ match, activities, state, user, dispatch, showToast }) {
  const actionable = activities
    .filter(a => a.status === 'in_progress' || (a.status === 'scheduled' && (a.date || '') >= TODAY))
    .sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''))
    .slice(0, 3);
  return (
    <>
      <PageHeader title="활동 일정" subtitle="매칭 트리오와 격주로 만나는 일정이에요" />
      <Card padding={14} style={{ marginBottom: 18, background: C.successSoft, border: `1px solid ${C.success}33`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <InsuranceBadge size="md" />
        <span style={{ fontSize: 12.5, color: C.inkSoft }}>직접 만나는 활동은 1365 자원봉사 보험과 지자체 돌봄 특약으로 자동 보장돼요.</span>
      </Card>
      {actionable.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> 오늘 활동 — 체크인하세요</div>
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
      <PageHeader title="활동 기록" subtitle="작성한 기록은 코디가 승인하면 정산에 반영돼요"
        right={<Button variant="brand" icon={<Plus size={16} />} onClick={() => setOpen(true)}>새 기록 작성</Button>}
      />

      <Card padding={0}>
        <Tabs tabs={[
          { id: 'all', label: '전체', count: myLogs.length },
          { id: 'approved', label: '승인', count: myLogs.filter(l => l.approved).length },
          { id: 'pending', label: '대기', count: myLogs.filter(l => !l.approved).length },
        ]} active="all" onChange={() => {}} style={{ padding: '0 16px' }} />
        <div style={{ padding: 12 }}>
          {myLogs.length === 0 ? (
            <Empty icon={<PenLine size={42} />} title="아직 기록이 없습니다" sub="활동 후 그날의 인상적이었던 순간을 적어주세요" />
          ) : myLogs.map((log) => {
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
          })}
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
            <Avatar type="senior" name={senior.name} color={C.lavender} size={68} />
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
      <PageHeader title="동네 기억 아카이브" subtitle="광주 우산동의 옛이야기를 어르신께 듣고 기록해요" />
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
            <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em', fontFamily: SERIF_STACK, lineHeight: 1.2 }}>
              안녕하세요,<br />{user.name} 님
            </div>
            <div style={{ fontSize: 18, color: C.mute, marginTop: 8 }}>오늘은 {fmtDate(TODAY)} 입니다</div>
            <div style={{ marginTop: 14 }}>
              <OfficialSenderBadge size="lg" />
              <div style={{ fontSize: 14, color: C.mute, marginTop: 8, lineHeight: 1.5 }}>
                이음에서 드리는 연락은 <strong style={{ color: C.blue }}>광주광역시 공식 알림톡</strong>으로만 가요. 모르는 번호로 오는 전화나 문자는 받지 않으셔도 괜찮아요.
              </div>
            </div>
          </div>

          {/* 다음 만남 — 크게 강조 */}
          {nextActivity && youth && (
            <Card padding={28} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.lavenderSoft} 0%, ${C.cream} 100%)`, border: `2px solid ${C.lavender}40` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.lavender, letterSpacing: '0.05em', marginBottom: 14 }}>다음 만남</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
                <Avatar type="youth" name={youth.name} color={C.sage} size={86} />
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
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${C.border}` }}>
                  <InsuranceBadge size="md" />
                </div>
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

          <TimeBankCard hours={myActivities.filter(a => a.status === 'completed').reduce((s, a) => s + (a.duration_hours || 0), 0)} accent={C.lavender} />

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
          <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, marginBottom: 8, fontFamily: SERIF_STACK, letterSpacing: '-0.03em' }}>받은 상품권</div>
          <div style={{ fontSize: 17, color: C.mute, marginBottom: 24 }}>광주상생카드은 동네 가맹점에서 사용하실 수 있습니다</div>
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
        활동하시다 불편한 일이 있으면 아래 버튼만 눌러 주세요.<br />코디네이터 한가은이 바로 연락드릴게요.
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

// 참여자(소비자) 하단 탭 네비
const PARTICIPANT_NAV = {
  youth: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'schedule', label: '일정', icon: Calendar },
    { id: 'logs', label: '기록', icon: PenLine }, { id: 'mentor', label: '멘토', icon: GraduationCap },
    { id: 'archive', label: '기억', icon: BookOpen }, { id: 'settlement', label: '정산', icon: Wallet },
  ],
  senior: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'schedule', label: '다음 만남', icon: Calendar },
    { id: 'settlement', label: '상품권', icon: Wallet },
  ],
  parent: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'today', label: '오늘', icon: Activity },
    { id: 'match', label: '매칭', icon: Users }, { id: 'safety', label: '안전', icon: ShieldCheck },
  ],
};

// 소비자(참여자) 셸 — 상단 앱바 + 하단 탭, 따뜻한 캔버스 (관리자 콘솔과 구분)
function ConsumerLayout({ role, view, setView, user, dispatch, state, children }) {
  const persona = PERSONA[role] || PERSONA.youth;
  const isSenior = role === 'senior';
  const items = PARTICIPANT_NAV[role] || [];
  const handleLogout = () => dispatch({ type: 'LOGOUT' });
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${persona.soft} 0%, ${C.bg} 240px)`, fontFamily: FONT_STACK, color: C.ink, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: isSenior ? 840 : 700, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative' }}>
        {/* 상단 앱바 */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isSenior ? '15px 22px' : '12px 18px', background: 'rgba(250,247,242,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }} onClick={() => dispatch({ type: 'LOGOUT' })} role="button" aria-label="처음으로">
            <div style={{ display: 'flex', borderRadius: 8, boxShadow: `0 2px 8px ${C.brand}33` }}><EumLogo size={isSenior ? 34 : 28} /></div>
            <div>
              <div style={{ fontSize: isSenior ? 17 : 15, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em', lineHeight: 1.1 }}>이음</div>
              <div style={{ fontSize: isSenior ? 12.5 : 10.5, color: persona.color, fontWeight: 700, letterSpacing: '0.01em', marginTop: 1 }}>{persona.label} · {user?.name}님</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationBell state={state} role={role} user={user} onNavigate={setView} />
            <button onClick={handleLogout} aria-label="로그아웃" style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}`, background: C.card, color: C.inkSoft, borderRadius: 11, padding: isSenior ? '9px 15px' : '7px 11px', fontSize: isSenior ? 14 : 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_STACK }}>
              <LogOut size={isSenior ? 18 : 15} />{isSenior && ' 나가기'}
            </button>
          </div>
        </div>
        {/* 본문 (탭 전환 시 부드러운 진입) */}
        <div key={view} style={{ flex: 1, padding: isSenior ? '22px 22px 100px' : '20px 18px 92px', overflowX: 'hidden', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)' }}>
          {children}
        </div>
        {/* 하단 탭 네비 */}
        <div style={{ position: 'sticky', bottom: 0, zIndex: 50, display: 'flex', background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}`, padding: isSenior ? '8px 6px' : '6px 4px' }}>
          {items.map((it) => {
            const active = view === it.id;
            const Icon = it.icon;
            return (
              <button key={it.id} onClick={() => setView(it.id)} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isSenior ? 5 : 3, padding: isSenior ? '9px 2px' : '7px 2px', border: 'none', background: 'none', cursor: 'pointer', color: active ? persona.color : C.mute, fontFamily: FONT_STACK, transition: 'color 0.15s' }}>
                <div style={{ display: 'flex', transform: active ? 'translateY(-1px) scale(1.06)' : 'none', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  <Icon size={isSenior ? 26 : 21} strokeWidth={active ? 2.5 : 1.9} />
                </div>
                <span style={{ fontSize: isSenior ? 12.5 : 10.5, fontWeight: active ? 700 : 600, whiteSpace: 'nowrap' }}>{it.label}</span>
                <div style={{ width: active ? (isSenior ? 18 : 15) : 0, height: 3, borderRadius: 3, background: persona.color, transition: 'width 0.28s cubic-bezier(0.22,1,0.36,1)' }} />
              </button>
            );
          })}
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

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, color: C.ink }}>
        {/* 모바일 상단바 */}
        <div style={{ position: 'sticky', top: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDrawer(true)} aria-label="메뉴" style={{ display: 'flex', border: `1px solid ${C.border}`, background: C.card, borderRadius: 10, padding: 8, cursor: 'pointer', color: C.ink }}><Menu size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => handleLogout()}>
              <EumLogo size={26} />
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: SERIF_STACK, color: C.ink }}>이음 <span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>관리자</span></span>
            </div>
          </div>
          <NotificationBell state={state} role="coordinator" user={user} onNavigate={setView} />
        </div>
        {/* 드로어 */}
        {drawer && (
          <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.45)', zIndex: 70, animation: 'fadeIn 0.15s ease' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, animation: 'slideInLeft 0.22s ease' }}>
              <Sidebar role={role} currentView={view} onNavigate={(v) => { setView(v); setDrawer(false); }} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
            </div>
          </div>
        )}
        <div style={{ padding: '18px 16px 40px', overflowX: 'hidden' }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, color: C.ink }}>
      <Sidebar role={role} currentView={view} onNavigate={setView} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* 데스크톱 상단바 (알림) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px 36px 0' }}>
          <NotificationBell state={state} role="coordinator" user={user} onNavigate={setView} />
        </div>
        <div style={{ flex: 1, padding: '16px 36px 36px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9. PARENT (양육가정) APP
// ============================================================================

// 글로벌 벤치마크 — 미국 Papa의 방문 안전 체크인 모델
function SafetyCheckinCard({ child, youth, activity }) {
  const active = !!activity;
  return (
    <Card padding={20} style={{ marginBottom: 20, border: '1px solid ' + (active ? C.success : C.border), background: active ? C.successSoft : C.card }}>
      <style>{`@keyframes eumBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <ShieldCheck size={17} color={active ? C.success : C.mute} />
        <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>안심 체크인</div>
        <Badge color={C.mute} soft={C.muteSoft} size="sm">미국 Papa 모델</Badge>
        {active && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.success }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: C.success, animation: 'eumBlink 1.4s ease-in-out infinite' }} /> 실시간 공유 중
          </span>
        )}
      </div>
      {active ? (
        <>
          <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 14 }}>
            <strong style={{ color: C.ink }}>{child?.name || '아이'}</strong>가 지금 <strong style={{ color: C.ink }}>{youth?.name || '청년 멘토'}</strong>와 함께 활동하고 있어요. 시작·종료 시각과 위치가 보호자에게 자동으로 공유돼요.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.card, borderRadius: 10, border: '1px solid ' + C.border }}>
              <div style={{ fontSize: 11, color: C.mute }}>체크인</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.success }}>{activity.time || '완료'}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.card, borderRadius: 10, border: '1px solid ' + C.border }}>
              <div style={{ fontSize: 11, color: C.mute }}>장소</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{activity.location || '확인 중'}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: C.card, borderRadius: 10, border: '1px solid ' + C.border }}>
              <div style={{ fontSize: 11, color: C.mute }}>안전 상태</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.success }}>이상 없음</div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
          오늘은 예정된 활동이 없어요. 활동이 시작되면 청년 멘토의 체크인과 함께 아이의 위치·안전 상태가 실시간으로 보호자에게 공유돼요.
        </div>
      )}
    </Card>
  );
}

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

      {/* 트리오 카드 */}
      {match && (
        <Card padding={24} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.peach}15 0%, ${C.brand}10 100%)`, border: `1px solid ${C.peach}50` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <Heart size={18} style={{ color: C.brand }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.brand, letterSpacing: '0.08em' }}>우리 아이의 트리오</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <TrioMember person={child} sub="자녀" color={C.peach} trust={trustStatus(state, child?.id)} />
            <TrioMember person={youth} sub={`청년 멘토 · ${youth?.skills?.[0] || '활동'}`} color={C.sage} trust={trustStatus(state, youth?.id)} />
            <TrioMember person={senior} sub={`동네 어르신 · ${senior?.skills?.[0] || ''}`} color={C.lavender} trust={trustStatus(state, senior?.id)} />
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

      <SafetyCheckinCard child={child} youth={youth} activity={todayActivities[0]} />

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
              <div style={{ fontSize: 14 }}>오늘은 예정된 활동이 없어요.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayActivities.map(act => {
                const m = state.matches.find(mm => mm.id === act.match_id);
                const y = state.participants.find(p => p.id === m?.youth_id);
                return (
                  <div key={act.id} style={{ padding: 14, background: C.bg, borderRadius: 10, border: `1px solid ${C.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{act.title}</div>
                      <Badge color={C.sage} soft={C.sageSoft}>{act.type}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: C.inkSoft }}>
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
                    <div style={{ fontSize: 10, color: C.mute, fontWeight: 600 }}>{fmtRelativeDate(act.date)}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 1 }}>{(act.time || '').slice(0, 5)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{act.title}</div>
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
                  <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={36} color={PERSONA[author?.type]?.color || C.brand} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{author?.name}</span>
                      <span style={{ fontSize: 11, color: C.mute }}>· {fmtDate(log.date)} · {act?.title}</span>
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
        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{activity.title}</div>
        <Badge color={C.sage} soft={C.sageSoft}>{activity.type}</Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: C.inkSoft, marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {fmtRelativeDate(activity.date)} {(activity.time || '').slice(0, 5)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {activity.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {activity.duration_hours}시간</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[y, s, c].filter(Boolean).map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: C.card, borderRadius: 999, fontSize: 11, color: C.inkSoft }}>
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
                        <Avatar type={p?.type} gender={p?.gender} name={p.name} size={64} color={color} />
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
// 10. CLAUDE API HELPER (AI 매칭 추천 & 월간 리포트 요약)
// ============================================================================

async function callClaude({ system, user, maxTokens = 1024 }) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return text;
  } catch (e) {
    console.error('Claude API error:', e);
    throw e;
  }
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
      {view === 'roadmap' && <CoordRoadmap />}
    </Layout>
  );
}

// --- 11.1 Overview (KPI dashboard) ---

function CoordOverview({ state, setView }) {
  const kpis = useMemo(() => {
    const totalParticipants = state.participants.length;
    const youthCount = state.participants.filter(p => p.type === 'youth' && p.status === 'active').length;
    const seniorCount = state.participants.filter(p => p.type === 'senior' && p.status === 'active').length;
    const parentCount = state.participants.filter(p => p.type === 'parent' && p.status === 'active').length;
    const childCount = state.participants.filter(p => p.type === 'child').length;
    const activeMatches = state.matches.filter(m => m.status === 'active').length;
    const totalHours = state.activity_logs.filter(l => l.approved).reduce((s, l) => s + l.hours, 0);
    const totalSettled = state.settlements.filter(s => s.status === 'paid' || s.status === 'issued').reduce((s, x) => s + (x.amount_krw || x.amount || 0), 0);
    const pendingLogs = state.activity_logs.filter(l => !l.approved).length;
    const openIncidents = state.safety_incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length;
    const pendingApps = state.applications.filter(a => a.status === 'screening' || a.status === 'verified').length;
    const surveyCount = state.surveys.length;
    const avgSatisfaction = surveyCount ? state.surveys.reduce((s, x) => s + (x.satisfaction || 0), 0) / surveyCount : 0;
    const continueRate = surveyCount ? Math.round(state.surveys.filter(x => x.would_continue).length / surveyCount * 100) : 0;
    return { totalParticipants, youthCount, seniorCount, parentCount, childCount, activeMatches, totalHours, totalSettled, pendingLogs, openIncidents, pendingApps, surveyCount, avgSatisfaction, continueRate };
  }, [state]);

  // 월별 활동 차트 데이터
  const monthlyChart = useMemo(() => {
    const months = {};
    state.activity_logs.filter(l => l.approved).forEach(l => {
      const m = (l.date || '').slice(0, 7);
      if (!months[m]) months[m] = { month: m, hours: 0, count: 0 };
      months[m].hours += l.hours;
      months[m].count += 1;
    });
    let running = 0;
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).map(x => {
      running += x.hours;
      return { month: x.month.slice(5) + '월', hours: x.hours, count: x.count, cumulative: running };
    });
  }, [state]);

  // 활동 타입 분포
  const typeChart = useMemo(() => {
    const types = {};
    state.activities.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
    const colors = { 돌봄: C.peach, 학습: C.sage, 동행: C.lavender, 생활: C.brand, 디지털: C.brandLight };
    return Object.entries(types).map(([type, count]) => ({ name: type, value: count, color: colors[type] || C.mute }));
  }, [state]);

  return (
    <>
      <PageHeader title="대시보드" subtitle={`${fmtDate(TODAY)} · 광주 광산구 우산동 1차 파일럿`} />

      {/* 알림 영역 */}
      {(kpis.openIncidents > 0 || kpis.pendingApps > 0 || kpis.pendingLogs > 5) && (
        <Card padding={16} style={{ marginBottom: 18, background: C.amberSoft, border: `1px solid ${C.amber}50` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={18} style={{ color: C.amber }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>처리할 항목이 있어요</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {kpis.openIncidents > 0 && <Button variant="ghost" size="sm" onClick={() => setView('safety')}>안전 이슈 {kpis.openIncidents}건</Button>}
              {kpis.pendingApps > 0 && <Button variant="ghost" size="sm" onClick={() => setView('applicants')}>검토 대기 {kpis.pendingApps}건</Button>}
              {kpis.pendingLogs > 0 && <Button variant="ghost" size="sm" onClick={() => setView('activities')}>승인 대기 {kpis.pendingLogs}건</Button>}
            </div>
          </div>
        </Card>
      )}

      {/* KPI 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="참여자" value={kpis.totalParticipants} sub={`청년 ${kpis.youthCount} / 어르신 ${kpis.seniorCount} / 양육 ${kpis.parentCount}`} color={C.brand} icon={<Users size={18} />} />
        <StatCard label="활성 매칭" value={kpis.activeMatches} sub={`목표 8건 중 ${kpis.activeMatches}건 진행`} color={C.sage} icon={<Heart size={18} />} trend={kpis.activeMatches >= 3 ? `+${kpis.activeMatches - 0}` : null} />
        <StatCard label="누적 활동시간" value={`${kpis.totalHours}h`} sub={`목표 1,440시간 중 ${Math.round(kpis.totalHours / 1440 * 100)}%`} color={C.lavender} icon={<Clock size={18} />} />
        <StatCard label="지급 정산" value={krw(kpis.totalSettled)} sub={`${state.settlements.filter(s => s.status === 'issued').length}건 발급 완료`} color={C.gold} icon={<Wallet size={18} />} />
      </div>

      {/* 움직이는 인포그래픽 밴드 */}
      <Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14, marginBottom: 18 }}>
          <Card padding={20} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Ring value={kpis.activeMatches} max={8} size={92} stroke={10} color={C.sage} label={kpis.activeMatches} sublabel="/ 8쌍" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.sage, letterSpacing: '0.06em', marginBottom: 4 }}>매칭 목표</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}><CountUp value={Math.round(kpis.activeMatches / 8 * 100)} suffix="%" /> 달성</div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>활성 트리오 {kpis.activeMatches}쌍 운영 중</div>
            </div>
          </Card>
          <Card padding={20} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Ring value={kpis.totalHours} max={1440} size={92} stroke={10} color={C.brand} label={`${Math.round(kpis.totalHours / 1440 * 100)}%`} sublabel="연 목표" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: '0.06em', marginBottom: 4 }}>누적 활동시간</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}><CountUp value={kpis.totalHours} suffix="시간" /></div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>연 목표 1,440시간</div>
            </div>
          </Card>
          <Card padding={20}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.lavender, letterSpacing: '0.06em', marginBottom: 12 }}>세대 구성</div>
            {[['청년', kpis.youthCount, C.sage], ['어르신', kpis.seniorCount, C.lavender], ['양육가정', kpis.parentCount, C.peach], ['아동', kpis.childCount, C.gold]].map(([lab, val, col], i) => (
              <div key={lab} style={{ marginBottom: i < 3 ? 9 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: C.inkSoft, fontWeight: 600 }}>{lab}</span>
                  <span style={{ color: col, fontWeight: 800 }}><CountUp value={val} />명</span>
                </div>
                <AnimatedBar value={val} max={Math.max(kpis.youthCount, kpis.seniorCount, kpis.parentCount, kpis.childCount, 1)} color={col} height={7} delay={i * 110} />
              </div>
            ))}
          </Card>
          <Card padding={20} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Ring value={kpis.avgSatisfaction} max={5} size={92} stroke={10} color={C.gold} label={kpis.avgSatisfaction.toFixed(1)} sublabel="/ 5.0" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: '0.06em', marginBottom: 4 }}>프로그램 만족도</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em' }}>지속의향 <CountUp value={kpis.continueRate} suffix="%" /></div>
              <div style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>설문 {kpis.surveyCount}건 기준</div>
            </div>
          </Card>
        </div>
      </Reveal>

      {/* 멘토 피드백 반영 — 신뢰·안전 관제 */}
      <Card padding={20} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldCheck size={18} style={{ color: C.brand }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>신뢰·안전 관제</div>
          <Badge color={C.amber} soft={C.amberSoft} size="md">멘토 제안 반영 · 도입 예정</Badge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <div style={{ padding: 14, borderRadius: 10, background: C.blueSoft, border: `1px solid ${C.blue}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: C.blue, marginBottom: 6 }}><ShieldCheck size={14} /> 공인 인증 발신 시스템 · 도입 예정</div>
            <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.5 }}>광주광역시 공식 알림톡 채널 연동. 모든 발신에 지자체 인증 표시가 적용되어 어르신 대상 보이스피싱·사칭을 차단합니다.</div>
          </div>
          <div style={{ padding: 14, borderRadius: 10, background: C.successSoft, border: `1px solid ${C.success}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: C.success, marginBottom: 6 }}><ShieldCheck size={14} /> 돌봄 책임보험 연동 · 도입 예정</div>
            <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.5 }}>1365 자원봉사 보험 + 지자체 돌봄 특약 자동 가입. 활성 매칭 {kpis.activeMatches}건 전건 보장, 미가입 0건.</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginBottom: 18 }}>
        <Card padding={22}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4 }}>누적 활동시간 추이</div>
          <div style={{ fontSize: 12, color: C.mute, marginBottom: 14 }}>승인된 활동 누적 기준 · 꾸준히 우상향</div>
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
                <Area type="monotone" dataKey="cumulative" stroke={C.brand} strokeWidth={2.5} fill="url(#hours)" name="누적 활동시간" />
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
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
                <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={32} color={PERSONA[author?.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{author?.name} · {act?.title}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>{fmtDate(log.date)} · {log.hours}시간</div>
                </div>
                {log.approved ? <Badge color={C.success} soft={C.successSoft} size="sm">승인</Badge> : <Badge color={C.amber} soft={C.amberSoft} size="sm">대기</Badge>}
              </div>
            );
          })}
        </Card>
        <Card padding={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>오늘의 활동 일정</div>
            <Badge color={C.brand} soft={C.brandSoft}>{state.activities.filter(a => a.date === TODAY).length}건</Badge>
          </div>
          {state.activities.filter(a => a.date === TODAY).length === 0 ? (
            <Empty icon={<Calendar size={24} />} title="오늘은 예정된 활동이 없습니다" />
          ) : state.activities.filter(a => a.date === TODAY).map(act => {
            const m = state.matches.find(mm => mm.id === act.match_id);
            const y = state.participants.find(p => p.id === m?.youth_id);
            return (
              <div key={act.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ minWidth: 50, fontSize: 13, fontWeight: 700, color: C.brand, fontFamily: SERIF_STACK }}>{(act.time || '').slice(0, 5)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{act.title}</div>
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
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const counts = useMemo(() => ({
    screening: state.applications.filter(a => a.status === 'screening').length,
    verified: state.applications.filter(a => a.status === 'verified').length,
    completed: state.applications.filter(a => a.status === 'completed').length,
    rejected: state.applications.filter(a => a.status === 'rejected').length,
  }), [state]);

  const pById = useMemo(() => {
    const m = {}; state.participants.forEach(p => { m[p.id] = p; }); return m;
  }, [state.participants]);

  const filtered = state.applications.filter(a => {
    if (a.status !== activeTab) return false;
    const p = pById[a.participant_id];
    if (typeFilter !== 'all' && p?.type !== typeFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${p?.name || ''} ${p?.phone || ''} ${p?.address || ''} ${(p?.skills || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

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
        style={{ marginBottom: 14 }}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={query} onChange={setQuery} placeholder="이름·연락처·동·강점 검색" style={{ flex: 1, minWidth: 220 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['all', '전체'], ['teen', '청소년'], ['youth', '청년'], ['adult', '중년'], ['senior', '어르신'], ['parent', '양육가정']].map(([id, lab]) => (
            <button key={id} onClick={() => setTypeFilter(id)} style={{ padding: '7px 13px', borderRadius: 999, border: `1.5px solid ${typeFilter === id ? (PERSONA[id]?.color || C.ink) : C.border}`, background: typeFilter === id ? (PERSONA[id]?.soft || C.bg) : C.card, color: typeFilter === id ? (PERSONA[id]?.color || C.ink) : C.inkSoft, fontSize: 12.5, fontWeight: typeFilter === id ? 700 : 500, cursor: 'pointer', fontFamily: FONT_STACK }}>{lab}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? <Empty icon={<UserPlus size={32} />} title={query || typeFilter !== 'all' ? '조건에 맞는 신청자가 없습니다' : `${activeTab === 'screening' ? '검토 대기' : activeTab === 'verified' ? '검증 중인' : activeTab === 'completed' ? '활동 중인' : '반려된'} 신청자가 없습니다`} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {filtered.map(app => {
            const p = state.participants.find(pp => pp.id === app.participant_id);
            const verifs = state.verifications.filter(v => v.application_id === app.id);
            const passedCount = verifs.filter(v => v.status === 'passed').length;
            const totalSteps = verifs.length;
            return (
              <Card key={app.id} padding={18} hoverable onClick={() => setSelectedApp(app)}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <Avatar type={p?.type} gender={p?.gender} name={p?.name} size={48} color={PERSONA[p?.type]?.color || C.brand} />
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
                <Avatar type={p?.type} gender={p?.gender} name={p?.name} size={64} color={PERSONA[p?.type]?.color || C.brand} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK }}>{p?.name}</div>
                    <TrustBadge status={trustStatus(state, p?.id)} />
                  </div>
                  <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>{PERSONA[p?.type]?.label} · {p?.age}세 · {p?.gender === 'M' ? '남성' : '여성'}</div>
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
  const [selectedMatch, setSelectedMatch] = useState(null);

  const matches = state.matches;
  const activeMatches = matches.filter(m => m.status === 'active');
  const proposedMatches = matches.filter(m => m.status === 'proposed');

  // 매칭 가능한 활성 참여자
  const availableYouth = state.participants.filter(p => p.type === 'youth' && p.status === 'active' && !activeMatches.some(m => m.youth_id === p.id));
  const availableSenior = state.participants.filter(p => p.type === 'senior' && p.status === 'active' && !activeMatches.some(m => m.senior_id === p.id));
  const availableChild = state.participants.filter(p => p.type === 'child' && p.status === 'active' && !activeMatches.some(m => m.child_id === p.id));

  const runAiMatching = async () => {
    setAiOpen(true);
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

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
      const text = await callClaude({
        system: '당신은 세대 간 상생 매칭 코디네이터를 돕는 AI입니다. 활동 가능 시간, 잘하는 것/관심사의 보완성, 거주 지역, 안전 요소를 고려해 최적의 트리오를 추천합니다. 반드시 JSON 형식으로만 응답하세요.',
        user: userPrompt,
        maxTokens: 1500,
      });
      // JSON 추출
      const cleaned = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      setAiResult(parsed);
    } catch (e) {
      console.error(e);
      // Fallback: 룰 기반 추천
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
      setAiError('AI 서비스 연결 실패 - 룰 기반 추천으로 대체');
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
            <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 16 }}>
              {aiResult.fallback ? '룰 기반 알고리즘으로 추천된 매칭입니다.' : `Claude AI가 참여자 프로필을 분석해 다음 ${aiResult.recommendations?.length || 0}건의 매칭을 추천했습니다.`}
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
                          <Avatar type={p?.type} gender={p?.gender} name={p.name} size={44} color={PERSONA[p.type]?.color || C.brand} />
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
                    <Avatar type={p?.type} gender={p?.gender} name={p.name} size={56} color={color} />
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
            <Avatar type={p?.type} gender={p?.gender} name={p.name} size={36} color={color} />
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
        subtitle={`청년의 활동 기록을 승인하면 정산에 반영돼요`}
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
                <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={40} color={PERSONA[author?.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{author?.name}</span>
                    <span style={{ fontSize: 11, color: C.mute }}>· {fmtDate(log.date)} · {act?.title}</span>
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
                <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={44} color={PERSONA[author?.type]?.color || C.brand} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{author?.name}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>{PERSONA[author?.type]?.label}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ padding: 10, background: C.bg, borderRadius: 6 }}><div style={{ fontSize: 11, color: C.mute }}>활동</div><div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2 }}>{act?.title}</div></div>
                <div style={{ padding: 10, background: C.bg, borderRadius: 6 }}><div style={{ fontSize: 11, color: C.mute }}>날짜·시간</div><div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2 }}>{fmtDate(detailLog.date)} · {detailLog.hours}h</div></div>
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
    const RATE_YOUTH = 12500;
    const RATE_SENIOR = 12500;
    const map = new Map();
    state.activity_logs.filter(l => l.approved && (l.date || '').startsWith(monthFilter)).forEach(log => {
      const p = state.participants.find(pp => pp.id === log.participant_id);
      if (!p || (p.type !== 'youth' && p.type !== 'senior')) return;
      const key = `${log.participant_id}:${monthFilter}`;
      if (!map.has(key)) map.set(key, { participant: p, period: monthFilter, hours: 0, count: 0 });
      const item = map.get(key);
      item.hours += log.hours;
      item.count += 1;
    });
    // 매칭당 어르신은 매칭 단위로 처리되지만 단순화: 참여자별 합산
    const arr = Array.from(map.values()).map(it => ({
      ...it,
      amount: it.hours * (it.participant.type === 'youth' ? RATE_YOUTH : RATE_SENIOR),
      existing: state.settlements.find(s => s.participant_id === it.participant.id && s.period === monthFilter),
    }));
    return arr;
  }, [state, monthFilter]);

  const issued = state.settlements.filter(s => s.period === monthFilter && s.status === 'issued');
  const pending = calculatedSettlements.filter(c => !c.existing || c.existing.status === 'pending');

  const issueOne = (calc) => {
    const newSettlement = {
      id: uid('st'),
      participant_id: calc.participant.id,
      match_id: null,
      period: calc.period,
      type: calc.participant.type === 'youth' ? 'youth_stipend' : 'senior_voucher',
      amount: calc.amount,
      hours: calc.hours,
      status: 'issued',
      method: calc.participant.type === 'youth' ? 'bank' : 'voucher',
      issued_at: new Date().toISOString().slice(0, 10),
      issued_by: user.id,
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
  const issuedAmount = issued.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <PageHeader title="정산"
        subtitle={`청년 활동급여 · 어르신 상품권 자동 산정 (시급 12,500원)`}
        right={<Button variant="brand" icon={<Wallet size={16} />} onClick={issueAll} disabled={generating || pending.length === 0}>{generating ? '발급 중…' : `${pending.length}건 일괄 발급`}</Button>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="이번 달 산정액" value={krw(totalAmount)} sub={`${calculatedSettlements.length}명`} color={C.brand} icon={<Wallet size={18} />} />
        <StatCard label="발급 완료" value={krw(issuedAmount)} sub={`${issued.length}건`} color={C.success} icon={<CheckCircle2 size={18} />} />
        <StatCard label="발급 대기" value={krw(totalAmount - issuedAmount)} sub={`${pending.length}건`} color={C.amber} icon={<Clock size={18} />} />
        <StatCard label="누적 지급" value={krw(state.settlements.filter(s => s.status === 'issued').reduce((sum, s) => sum + s.amount, 0))} sub={`${state.settlements.filter(s => s.status === 'issued').length}건`} color={C.gold} icon={<Award size={18} />} />
      </div>

      <Card padding={20} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: C.mute, fontWeight: 700 }}>정산 월</span>
          <Select value={monthFilter} onChange={setMonthFilter}
            options={['2027-05', '2027-06', '2027-07'].map(m => ({ value: m, label: m + '월' }))}
            style={{ width: 160 }} />
        </div>
      </Card>

      <Card padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px 130px 100px', gap: 12, fontSize: 11, color: C.mute, fontWeight: 700, letterSpacing: '0.06em', background: C.bg }}>
          <div>참여자</div><div>활동</div><div>시간</div><div>금액</div><div>방법</div><div style={{ textAlign: 'right' }}>상태</div>
        </div>
        {calculatedSettlements.length === 0 ? <Empty icon={<Wallet size={28} />} title="이번 달 산정 대상이 없습니다" /> : calculatedSettlements.map((calc) => (
          <div key={calc.participant.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px 130px 100px', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar type={calc.participant?.type} gender={calc.participant?.gender} name={calc.participant.name} size={32} color={PERSONA[calc.participant.type]?.color || C.brand} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{calc.participant.name}</div>
                <div style={{ fontSize: 11, color: C.mute }}>{PERSONA[calc.participant.type]?.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{calc.count}회</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: SERIF_STACK }}>{calc.hours}h</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: SERIF_STACK }}>{krw(calc.amount)}</div>
            <div style={{ fontSize: 12, color: C.inkSoft }}>{calc.participant.type === 'youth' ? '계좌이체' : '온누리상품권'}</div>
            <div style={{ textAlign: 'right' }}>
              {calc.existing?.status === 'issued' ? <Badge color={C.success} soft={C.successSoft} size="sm">발급</Badge> :
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

function CoordRoadmap() {
  const items = [
    { icon: ShieldCheck, color: C.blue, soft: C.blueSoft, title: '공인 인증 발신 시스템', status: '멘토 제안 · 정식 연동 예정', mentor: true,
      desc: '광주광역시 공식 알림톡 채널과 연동해 모든 발신에 지자체 인증을 표시합니다. 어르신 대상 보이스피싱·사칭을 차단해 첫 신뢰의 허들을 넘습니다. (현재 MVP에 인증 배지 UI 적용 완료)' },
    { icon: ShieldCheck, color: C.success, soft: C.successSoft, title: '돌봄 특약 책임보험 자동가입', status: '멘토 제안 · 도입 예정', mentor: true,
      desc: '광주광역시 통합돌봄 사업과 연계해 오프라인 활동 시 1365 자원봉사 보험과 지자체 돌봄 특약 책임보험을 자동 적용합니다. 안전사고 리스크를 백엔드 설계에 반영합니다.' },
    { icon: Phone, color: C.brand, soft: C.brandSoft, title: 'AI 안부 음성통화 자동화', status: '개발 예정', mentor: false,
      desc: '창업자의 15년 AICC(AI 컨택센터) 역량을 활용해, 매칭 전후 어르신께 AI 음성으로 안부를 확인하고 이상 징후를 코디네이터에게 자동으로 알립니다.' },
    { icon: GraduationCap, color: C.lavender, soft: C.lavenderSoft, title: '세대별 디지털 리터러시 코스', status: '기획 중', mentor: false,
      desc: '청년이 어르신께 제공하는 디지털 교육을 단계별 커리큘럼으로 표준화하고, 수료 시 활동시간과 보상에 연계합니다.' },
    { icon: FileText, color: C.gold, soft: C.goldSoft, title: '활동 임팩트 리포트 자동화', status: '부분 구현 · 고도화 예정', mentor: false,
      desc: '월별 활동과 만족도 데이터를 광주광역시 제출용 임팩트 리포트로 자동 생성합니다. (코디 리포트 기능 일부 구현됨)' },
  ];
  return (
    <>
      <PageHeader title="서비스 로드맵" subtitle="멘토 피드백을 반영한 향후 도입 예정 기능입니다" />
      <Card padding={18} style={{ marginBottom: 18, background: C.brandBg, border: '1px solid ' + C.brand + '30' }}>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
          광주창조경제혁신센터 <strong>이복은 멘토</strong>님이 제안한 <strong>공인 인증 발신</strong>과 <strong>돌봄 책임보험</strong>을 핵심 로드맵에 반영했습니다. 아래 항목은 광주광역시 통합돌봄 인프라와 연계해 단계적으로 도입할 예정입니다.
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <Card key={i} padding={18}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: it.soft, color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{it.title}</span>
                    {it.mentor && <Badge color={C.brand} soft={C.brandSoft} size="sm">멘토 제안</Badge>}
                    <Badge color={it.color} soft={it.soft} size="sm">{it.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>{it.desc}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function CoordReports({ state, dispatch, showToast }) {
  const [period, setPeriod] = useState(TODAY.slice(0, 7));
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const stats = useMemo(() => {
    const monthLogs = state.activity_logs.filter(l => (l.date || '').startsWith(period));
    const approvedLogs = monthLogs.filter(l => l.approved);
    const activeMatches = state.matches.filter(m => m.status === 'active').length;
    const totalHours = approvedLogs.reduce((s, l) => s + l.hours, 0);
    const settlements = state.settlements.filter(s => s.period === period && s.status === 'issued');
    const settlementAmount = settlements.reduce((s, x) => s + x.amount, 0);
    const incidents = state.safety_incidents.filter(i => i.reported_at?.startsWith(period));
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
    setAiLoading(true);
    setAiError(null);
    setAiSummary(null);

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
      const text = await callClaude({
        system: '당신은 광산구 3세대 상생 품앗이 프로그램 "이음"의 월간 리포트 작성을 돕는 AI입니다. 따뜻하지만 구조적이고 객관적인 한국어로 작성하며, 정량 지표와 정성적 변화를 균형 있게 다룹니다.',
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
      const cleaned = text.replace(/```json|```/g, '').trim();
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
      setAiError('AI 서비스 연결 실패 - 기본 템플릿으로 대체');
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
                    <Avatar type={p?.type} gender={p?.gender} name={p?.name} size={28} color={PERSONA[p?.type]?.color || C.brand} />
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
    case 'CHECK_IN': {
      return {
        ...state,
        activities: state.activities.map(a => a.id === action.payload.id
          ? { ...a, status: 'in_progress', checkin_at: action.payload.at }
          : a)
      };
    }
    case 'CHECK_OUT': {
      return {
        ...state,
        activities: state.activities.map(a => a.id === action.payload.id
          ? { ...a, status: 'completed', checkout_at: action.payload.at, actual_hours: action.payload.hours }
          : a)
      };
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
// 13. MAIN APP (인증 · 라우팅 · 영속화 · Toast)
// ============================================================================

function App() {
  const [state, setState] = useState(() => {
    return normalizeState({ ...SEED_DATA, currentUserId: null, currentRole: null });
  });
  const [loading, setLoading] = useState(true);
  const [showApplication, setShowApplication] = useState(false);
  const [toasts, setToasts] = useState([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 초기 데이터 로드 (Storage)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await loadState();
        if (mounted && stored) {
          setState(prev => normalizeState({ ...prev, ...stored, currentUserId: null, currentRole: null }));
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

  // 브라우저 뒤로가기 시 사이트 밖으로 나가지 않도록 트랩 (앱 내부 → 역할 선택으로)
  useEffect(() => {
    try { window.history.pushState({ eum: true }, ''); } catch (e) {}
    const onPop = () => {
      const cur = stateRef.current;
      if (cur.currentRole) {
        dispatch({ type: 'LOGOUT' });
      }
      try { window.history.pushState({ eum: true }, ''); } catch (e) {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [dispatch]);

  const showToast = useCallback((toast) => {
    const id = uid('toast');
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 3500);
  }, []);

  const handleSelectRole = (role, userId) => {
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
      consent_criminal_check: data.consent_criminal || data.consent_criminal_check || false,
      consent_guardian: data.consent_guardian || false,
    };
    const adultHelper = data.type === 'youth' || data.type === 'adult' || data.type === 'senior';
    const verifSteps = adultHelper
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
          <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px', boxShadow: `0 8px 24px ${C.brand}40`, display: 'flex', animation: 'slideUp 0.4s ease' }}>
            <EumLogo size={56} />
          </div>
          <div style={{ fontSize: 14, color: C.inkSoft }}>이음을 불러오고 있습니다…</div>
        </div>
      </div>
    );
  }

  const user = state.currentUserId
    ? (state.participants.find(p => p.id === state.currentUserId)
        || (state.currentRole === 'coordinator' ? { id: state.currentUserId, name: '한가은', type: 'coordinator' } : null))
    : null;
  const role = state.currentRole;

  return (
    <div style={{ textAlign: 'left' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; }
        #root { text-align: left; }
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
          <RoleSelect state={state} onSelectRole={handleSelectRole} onShowApplication={() => setShowApplication(true)} />
          {showApplication && <ApplicationForm onClose={() => setShowApplication(false)} onSubmit={handleSubmitApplication} />}
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

class EumErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('이음 렌더 오류:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: FONT_STACK, padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', display: 'flex' }}><EumLogo size={52} /></div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, marginBottom: 8 }}>일시적인 오류가 발생했어요</div>
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 20 }}>화면을 불러오는 중 문제가 생겼습니다. 다시 시도해 주세요.</div>
            <button onClick={() => { this.setState({ error: null }); window.location.reload(); }} style={{ background: C.brand, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT_STACK }}>처음으로 돌아가기</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppWithBoundary() {
  return (
    <EumErrorBoundary>
      <App />
    </EumErrorBoundary>
  );
}

export default AppWithBoundary;
