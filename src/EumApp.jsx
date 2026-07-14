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
// 1. DESIGN TOKENS · STORAGE · UTILS — src/eum/* 모듈로 분리 (단일파일 분해 1단계)
//   값·로직은 100% 동일. 이 파일은 이제 화면(컴포넌트)에 집중한다.
// ============================================================================
import { C, PERSONA, FONT_STACK, SERIF_STACK, SHADOW } from './eum/theme.js';
import { normalizeState, loadState, saveState } from './eum/storage.js';
import { TODAY, krw, fmtDate, fmtRelativeDate, uid } from './eum/utils.js';

// ============================================================================
// 2. SEED DATA
// ============================================================================

const SEED_DATA = {
  participants: [
    // 청년 5명
    { id: 'p001', name: '김민준', gender: 'M', type: 'youth', age: 27, phone: '010-1234-5678', address: '광주광역시 광산구 우산동', emergency_contact: '010-9876-5432 (부친)', occupation: '스타트업 개발자', skills: ['디지털코칭', '학습멘토', '코딩교육'], interests: ['IT', '진로상담', '여행'], availability: ['평일저녁', '토요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-15', bio: '마곡 스타트업 2년차 개발자. 어르신께 IT를, 아이들에게 코딩을 가르쳐드리고 싶어요.' },
    { id: 'p002', name: '이지원', gender: 'F', type: 'youth', age: 25, phone: '010-2345-6789', address: '광주광역시 광산구 우산동', emergency_contact: '010-1111-2222 (모친)', occupation: '대학원생', skills: ['학습멘토', '글쓰기', '독서지도'], interests: ['교육', '문학', '심리'], availability: ['평일저녁', '주말'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-18', bio: '교육학 석사과정. 아이들과 책 읽고 글쓰기를 함께하고 싶어요.' },
    { id: 'p003', name: '박서준', gender: 'M', type: 'youth', age: 29, phone: '010-3456-7890', address: '광주광역시 광산구 첨단동', emergency_contact: '010-3333-4444 (형)', occupation: '디자이너', skills: ['디지털코칭', '예술교육', '사진'], interests: ['디자인', '사진', '카페'], availability: ['토요일', '일요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-03-20', bio: 'UX 디자이너. 어르신께 스마트폰 사진을, 아이들에게 그림을 가르쳐요.' },
    { id: 'p004', name: '최예린', gender: 'F', type: 'youth', age: 26, phone: '010-4567-8901', address: '광주광역시 광산구 우산동', emergency_contact: '010-5555-6666 (모친)', occupation: '간호사', skills: ['건강관리', '응급처치', '돌봄'], interests: ['건강', '운동', '요리'], availability: ['평일저녁'], status: 'active', avatar_color: C.sage, joined_at: '2027-04-01', bio: '대학병원 간호사. 어르신 건강 케어와 아이 안전에 강점이 있어요.' },
    { id: 'p005', name: '정태윤', gender: 'M', type: 'youth', age: 28, phone: '010-5678-9012', address: '광산구 등촌동', emergency_contact: '010-7777-8888 (모친)', occupation: '회계사', skills: ['학습멘토', '수학교육'], interests: ['경제', '독서', '러닝'], availability: ['평일저녁', '토요일'], status: 'verifying', avatar_color: C.sage, joined_at: '2027-05-12', bio: '회계사. 아이들에게 수학과 경제 개념을 쉽게 알려주고 싶어요.' },

    // 어르신 5명
    { id: 'p101', name: '박순자', gender: 'F', type: 'senior', age: 73, phone: '010-1111-1111', address: '광주광역시 광산구 우산동 (42년 거주)', emergency_contact: '010-2222-3333 (딸)', occupation: '前 초등학교 교사', skills: ['독서지도', '서예', '동화구연'], interests: ['손주', '드라마', '꽃'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-16', bio: '40년 교직 생활. 손주 같은 아이에게 옛이야기 들려주고 싶어요.' },
    { id: 'p102', name: '김복례', gender: 'F', type: 'senior', age: 78, phone: '010-2222-2222', address: '광주광역시 광산구 우산동 (30년 거주)', emergency_contact: '010-4444-5555 (아들)', occupation: '前 봉제공장 운영', skills: ['바느질', '뜨개질', '요리'], interests: ['요리', '드라마', '산책'], availability: ['평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-22', bio: '평생 봉제일. 아이들에게 손바느질을 가르쳐주고 싶어요.' },
    { id: 'p103', name: '이병호', gender: 'M', type: 'senior', age: 71, phone: '010-3333-3333', address: '광주광역시 광산구 우산동', emergency_contact: '010-6666-7777 (딸)', occupation: '前 공무원', skills: ['역사이야기', '바둑', '서예'], interests: ['역사', '바둑', '등산'], availability: ['평일오전', '토요일'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-25', bio: '공무원 40년 정년퇴직. 청년들에게 인생 조언을, 아이들에게 역사 이야기를 들려주고 싶어요.' },
    { id: 'p104', name: '정금자', gender: 'F', type: 'senior', age: 75, phone: '010-4444-4444', address: '광주광역시 광산구 우산동', emergency_contact: '010-8888-9999 (며느리)', occupation: '前 동네 식당 운영', skills: ['요리', '한식', '이야기'], interests: ['요리', '드라마', '꽃밭'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-03-28', bio: '평생 식당. 아이들에게 손맛 김치 담그기를 가르쳐주고 싶어요.' },
    { id: 'p105', name: '윤석철', gender: 'M', type: 'senior', age: 70, phone: '010-5555-5555', address: '광주광역시 광산구 우산동', emergency_contact: '010-0000-1111 (아들)', occupation: '前 자영업', skills: ['장기', '한자', '경험담'], interests: ['장기', '뉴스', '걷기'], availability: ['평일오전'], status: 'active', avatar_color: C.lavender, joined_at: '2027-04-05', bio: '동네 토박이. 청년에게 사업 경험을 나누고 아이와 장기 두고 싶어요.' },

    // 양육가정 3가구
    { id: 'p201', name: '이서영', gender: 'F', type: 'parent', age: 38, phone: '010-6666-7777', address: '광주광역시 광산구 우산동', emergency_contact: '010-1010-2020 (배우자)', occupation: 'IT기업 PM (마곡)', skills: [], interests: [], availability: ['평일 저녁 7시 이후 픽업 가능'], status: 'active', avatar_color: C.peach, joined_at: '2027-03-19', child_id: 'p301', bio: '맞벌이라 퇴근 후 아이 돌봄 공백이 늘 걱정이에요.' },
    { id: 'p202', name: '한지영', gender: 'F', type: 'parent', age: 35, phone: '010-7777-8888', address: '광주광역시 광산구 우산동', emergency_contact: '010-3030-4040 (시어머니)', occupation: '간호사', skills: [], interests: [], availability: ['교대근무'], status: 'active', avatar_color: C.peach, joined_at: '2027-03-26', child_id: 'p302', bio: '교대근무라 정해진 픽업 시간이 어려워요. 안전한 공간에서 다양한 어른과 만나길 바라요.' },
    { id: 'p203', name: '김혜진', gender: 'F', type: 'parent', age: 40, phone: '010-8888-9999', address: '광주광역시 광산구 우산동', emergency_contact: '010-5050-6060 (배우자)', occupation: '교사', skills: [], interests: [], availability: ['주중 하원 후 ~ 저녁 6시'], status: 'active', avatar_color: C.peach, joined_at: '2027-04-02', child_id: 'p303', bio: '아이가 외동이라 다양한 세대와의 교류가 절실해요.' },

    // 아동 3명
    { id: 'p301', name: '김유진', gender: 'F', type: 'child', age: 8, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-6666-7777 (모친 이서영)', occupation: '초2', skills: [], interests: ['그림', '책', '강아지'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-03-19', parent_id: 'p201', bio: '책 읽기를 좋아하고 그림 그리는 걸 즐겨요.' },
    { id: 'p302', name: '한도윤', gender: 'M', type: 'child', age: 9, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-7777-8888 (모친 한지영)', occupation: '초3', skills: [], interests: ['로봇', '레고', '축구'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-03-26', parent_id: 'p202', bio: '레고와 로봇을 좋아하고 축구를 잘해요.' },
    { id: 'p303', name: '김지안', gender: 'F', type: 'child', age: 7, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-8888-9999 (모친 김혜진)', occupation: '초1', skills: [], interests: ['공룡', '책', '노래'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-04-02', parent_id: 'p203', bio: '공룡에 푹 빠져 있고 노래 부르기를 좋아해요.' },

    { id: 'p006', name: '강하늘', gender: 'M', type: 'youth', age: 24, phone: '010-6161-6262', address: '광주광역시 광산구 우산동', emergency_contact: '010-6363-6464 (모친)', occupation: '체육지도사', skills: ['장기', '운동지도', '진로멘토'], interests: ['운동', '바둑', '봉사'], availability: ['평일오전', '토요일'], status: 'active', avatar_color: C.sage, joined_at: '2027-05-20', bio: '생활체육지도사. 어르신과 장기 두고 아이들과 몸으로 노는 걸 좋아해요.' },
    { id: 'p007', name: '문지호', gender: 'M', type: 'youth', age: 30, phone: '010-7171-7272', address: '광주광역시 광산구 우산동', emergency_contact: '010-7373-7474 (배우자)', occupation: '사회복지사', skills: ['상담', '학습멘토', '돌봄'], interests: ['복지', '독서', '커피'], availability: ['평일저녁', '주말'], status: 'active', avatar_color: C.sage, joined_at: '2027-06-10', bio: '복지관 근무 사회복지사. 세대를 잇는 일에 진심이에요. (매칭 대기 중)' },
    { id: 'p008', name: '배수진', gender: 'F', type: 'youth', age: 23, phone: '010-8181-8282', address: '광주광역시 광산구 우산동', emergency_contact: '010-8383-8484 (모친)', occupation: '대학생(사회복지학)', skills: ['학습멘토', '돌봄', '글쓰기'], interests: ['교육', '봉사', '글쓰기'], availability: ['평일오후', '주말'], status: 'pending', avatar_color: C.sage, joined_at: '2027-07-12', bio: '사회복지학과 4학년. 실습으로 시작했지만 진짜 이웃이 되고 싶어요. (서류 검토 중)' },
    { id: 'p107', name: '천만복', gender: 'M', type: 'senior', age: 74, phone: '010-9191-9292', address: '광주광역시 광산구 우산동 (28년 거주)', emergency_contact: '010-9393-9494 (아들)', occupation: '前 목공소 운영', skills: ['목공', '손재주', '경험담'], interests: ['목공', '뉴스', '산책'], availability: ['평일오전'], status: 'pending', avatar_color: C.lavender, joined_at: '2027-07-14', bio: '평생 목공일. 아이들에게 나무로 뭐든 만드는 법을 가르쳐주고 싶어요. (서류 검토 중)' },
    { id: 'p106', name: '서정애', gender: 'F', type: 'senior', age: 76, phone: '010-1616-1717', address: '광주광역시 광산구 우산동 (35년 거주)', emergency_contact: '010-1818-1919 (딸)', occupation: '前 유치원 보육교사', skills: ['동화구연', '종이접기', '노래'], interests: ['손주', '합창', '화초'], availability: ['평일오전', '평일오후'], status: 'active', avatar_color: C.lavender, joined_at: '2027-05-25', bio: '유치원 보육교사 30년. 아이들에게 동화와 종이접기를 가르쳐주고 싶어요. (매칭 대기 중)' },
    { id: 'p204', name: '송미라', gender: 'F', type: 'parent', age: 36, phone: '010-2424-2525', address: '광주광역시 광산구 우산동', emergency_contact: '010-2626-2727 (배우자)', occupation: '물류회사 사무직', skills: [], interests: [], availability: ['평일 야근 잦음'], status: 'active', avatar_color: C.peach, joined_at: '2027-05-18', child_id: 'p304', bio: '야근이 잦아 아이 저녁 돌봄이 늘 숙제예요.' },
    { id: 'p205', name: '오정은', gender: 'F', type: 'parent', age: 33, phone: '010-2828-2929', address: '광주광역시 광산구 우산동', emergency_contact: '010-3131-3232 (모친)', occupation: '카페 운영', skills: [], interests: [], availability: ['주말 영업'], status: 'active', avatar_color: C.peach, joined_at: '2027-06-01', child_id: 'p305', bio: '주말에도 가게를 열어 아이와 시간을 못 보내 미안해요.' },
    { id: 'p206', name: '한소희', gender: 'F', type: 'parent', age: 37, phone: '010-3434-3535', address: '광주광역시 광산구 우산동', emergency_contact: '010-3636-3737 (배우자)', occupation: '병원 행정', skills: [], interests: [], availability: ['평일 하원 후'], status: 'active', avatar_color: C.peach, joined_at: '2027-06-12', child_id: 'p306', bio: '아이가 낯을 많이 가려서 따뜻한 어른들과의 만남이 필요해요. (매칭 대기 중)' },
    { id: 'p304', name: '송하준', gender: 'M', type: 'child', age: 8, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-2424-2525 (모친 송미라)', occupation: '초2', skills: [], interests: ['요리', '블록', '강아지'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-05-18', parent_id: 'p204', bio: '요리하는 걸 좋아하고 호기심이 많아요.' },
    { id: 'p305', name: '오서윤', gender: 'F', type: 'child', age: 7, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-2828-2929 (모친 오정은)', occupation: '초1', skills: [], interests: ['그림', '장기', '동물'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-06-01', parent_id: 'p205', bio: '그림 그리기와 보드게임을 좋아해요.' },
    { id: 'p306', name: '김라온', gender: 'M', type: 'child', age: 9, phone: '', address: '광주광역시 광산구 우산동', emergency_contact: '010-3434-3535 (모친 한소희)', occupation: '초3', skills: [], interests: ['공룡', '종이접기', '책'], availability: [], status: 'active', avatar_color: C.peach, joined_at: '2027-06-12', parent_id: 'p206', bio: '낯을 가리지만 종이접기엔 푹 빠져요. (매칭 대기 중)' },
  ],

  applications: [
    { id: 'a001', participant_id: 'p001', submitted_at: '2027-03-14', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a002', participant_id: 'p101', submitted_at: '2027-03-15', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a003', participant_id: 'p201', submitted_at: '2027-03-18', consent_criminal: false, consent_guardian: true, consent_data: true, consent_photo: true },
    { id: 'a004', participant_id: 'p004', submitted_at: '2027-03-31', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a005', participant_id: 'p005', submitted_at: '2027-05-11', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a006', participant_id: 'p006', submitted_at: '2027-05-19', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a007', participant_id: 'p007', submitted_at: '2027-06-09', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a008', participant_id: 'p106', submitted_at: '2027-05-24', consent_criminal: true, consent_guardian: false, consent_data: true, consent_photo: true },
    { id: 'a009', participant_id: 'p204', submitted_at: '2027-05-17', consent_criminal: false, consent_guardian: true, consent_data: true, consent_photo: true },
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
    { id: 'v105', participant_id: 'p105', status: 'passed', verified_at: '2027-04-08', verified_by: '코디 한가은', notes: '범죄경력 없음. 비상연락처 보완 완료.' },
    { id: 'v006', participant_id: 'p006', status: 'passed', verified_at: '2027-05-30', verified_by: '코디 한가은', notes: '범죄경력 없음. 체육지도사 자격 확인.' },
    { id: 'v007', participant_id: 'p007', status: 'passed', verified_at: '2027-06-18', verified_by: '코디 한가은', notes: '범죄경력 없음. 사회복지사 1급 확인.' },
    { id: 'v106', participant_id: 'p106', status: 'passed', verified_at: '2027-06-02', verified_by: '코디 한가은', notes: '범죄경력 없음. 보육교사 경력 확인.' },
  ],

  matches: [
    { id: 'm001', youth_id: 'p001', senior_id: 'p101', child_id: 'p301', match_notes: '청년-어르신 모두 우산동 거주. 어르신은 교사 출신, 청년은 IT — 디지털 코칭 시너지. 아동은 책·그림 좋아함.', status: 'active', started_at: '2027-05-01' },
    { id: 'm002', youth_id: 'p002', senior_id: 'p102', child_id: 'p302', match_notes: '대학원생 청년-어르신 모두 손글씨/바느질 관심. 아동은 만들기 좋아함.', status: 'active', started_at: '2027-05-01' },
    { id: 'm003', youth_id: 'p003', senior_id: 'p103', child_id: 'p303', match_notes: '디자이너 청년-역사 좋아하는 어르신. 아동은 공룡, 호기심 많음.', status: 'active', started_at: '2027-05-08' },
    { id: 'm004', youth_id: 'p004', senior_id: 'p104', child_id: 'p304', match_notes: '간호사 청년-식당 운영 어르신. 건강·요리 시너지. 아동은 요리 호기심 많음.', status: 'active', started_at: '2027-05-22' },
    { id: 'm005', youth_id: 'p006', senior_id: 'p105', child_id: 'p305', match_notes: '체육지도사 청년-장기 좋아하는 어르신. 아동은 보드게임·그림 좋아함.', status: 'active', started_at: '2027-06-05' },
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

    { id: 'act301', match_id: 'm004', type: '디지털코칭', scheduled_at: '2027-05-22 14:00', duration_hours: 1.5, location: '우산동복지관', status: 'completed' },
    { id: 'act302', match_id: 'm004', type: '학습멘토', scheduled_at: '2027-05-22 15:30', duration_hours: 1.5, location: '우산동복지관', status: 'completed' },
    { id: 'act303', match_id: 'm004', type: '디지털코칭', scheduled_at: '2027-06-05 14:00', duration_hours: 1.5, location: '우산동복지관', status: 'completed' },
    { id: 'act304', match_id: 'm004', type: '학습멘토', scheduled_at: '2027-06-05 15:30', duration_hours: 1.5, location: '우산동복지관', status: 'completed' },
    { id: 'act305', match_id: 'm004', type: '디지털코칭', scheduled_at: '2027-07-17 14:00', duration_hours: 1.5, location: '우산동복지관', status: 'scheduled' },
    { id: 'act401', match_id: 'm005', type: '진로조언받기', scheduled_at: '2027-06-05 10:00', duration_hours: 1.5, location: '우산동경로당', status: 'completed' },
    { id: 'act402', match_id: 'm005', type: '기억아카이브', scheduled_at: '2027-06-05 11:30', duration_hours: 1.5, location: '우산동경로당', status: 'completed' },
    { id: 'act403', match_id: 'm005', type: '디지털코칭', scheduled_at: '2027-06-19 10:00', duration_hours: 1.5, location: '우산동경로당', status: 'completed' },
    { id: 'act404', match_id: 'm005', type: '학습멘토', scheduled_at: '2027-07-18 10:00', duration_hours: 1.5, location: '우산동경로당', status: 'scheduled' },
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

    { id: 'log301', activity_id: 'act301', participant_id: 'p004', hours: 1.5, summary: '정금자 어르신께 건강관리 앱 설치 — 혈압·복약 알림 설정. 어르신이 "이제 약 안 까먹겠다" 하시며 안심하심.', approved: true, approved_at: '2027-05-23', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log302', activity_id: 'act301', participant_id: 'p104', hours: 1.5, summary: '예린이가 간호사라 건강 얘기를 잘 들어줘서 든든하다. 혈압 재는 법도 다시 배웠다.', approved: true, approved_at: '2027-05-23', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log303', activity_id: 'act303', participant_id: 'p004', hours: 1.5, summary: '하준이와 어르신이 함께 김치전 부치기 — 아이가 반죽을 직접. 어르신 손맛 비법 전수에 아이가 신나했다.', approved: true, approved_at: '2027-06-06', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log401', activity_id: 'act401', participant_id: 'p006', hours: 1.5, summary: '윤석철 어르신께 사업 시절 이야기 들음. "신용이 자본이다"라는 말씀이 진로에 큰 울림. 장기도 한 수 배웠다.', approved: true, approved_at: '2027-06-06', approved_by: '코디 한가은', has_photo: false, mood: 5 },
    { id: 'log402', activity_id: 'act402', participant_id: 'p105', hours: 1.5, summary: '내 자영업 40년 이야기를 하늘이가 진지하게 들어줘서 보람있었다. 서윤이와 장기알로 숫자놀이도 했다.', approved: true, approved_at: '2027-06-06', approved_by: '코디 한가은', has_photo: true, mood: 5 },
    { id: 'log403', activity_id: 'act403', participant_id: 'p006', hours: 1.5, summary: '어르신 스마트폰에 장기 앱 설치·대국 방법 안내. 서윤이는 옆에서 그림으로 장기판을 그렸다.', approved: false, approved_at: null, approved_by: null, has_photo: true, mood: 5 },
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
    { id: 's013', participant_id: 'p004', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A007', issued_at: '2027-07-01', status: 'paid' },
    { id: 's014', participant_id: 'p104', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A008', issued_at: '2027-07-01', status: 'paid' },
    { id: 's015', participant_id: 'p006', month: '2027-06', total_hours: 4.5, amount_krw: 51560, voucher_code: 'KSL-2706-A009', issued_at: '2027-07-01', status: 'paid' },
    { id: 's016', participant_id: 'p105', month: '2027-06', total_hours: 4.5, amount_krw: 51560, voucher_code: 'KSL-2706-A010', issued_at: '2027-07-01', status: 'paid' },
  ],

  safety_incidents: [
    { id: 'si001', match_id: 'm002', activity_id: 'act102', reported_by: 'p002', severity: 'low', category: '경미한 안전이슈', description: '아동이 의자에서 미끄러질 뻔. 다행히 부상은 없음. 의자 안전 점검 요청.', status: 'resolved', resolved_at: '2027-05-11', resolved_by: '코디 한가은', resolution: '돌봄센터에 안전의자 교체 요청 완료. 활동공간 점검 SOP에 의자 점검 추가.', reported_at: '2027-05-09 14:30' },
    { id: 'si002', match_id: 'm001', activity_id: null, reported_by: 'p201', severity: 'low', category: '소통이슈', description: '아이 픽업 시간이 약속보다 늦어 보호자가 걱정. 코디 즉시 연결 요청.', status: 'resolved', resolved_at: '2027-06-19', resolved_by: '코디 한가은', resolution: '활동 전날 픽업시간 카카오 알림 자동 발송 추가. 1시간 전 한 번 더 리마인드.', reported_at: '2027-06-19 18:45' },
    { id: 'si003', match_id: 'm003', activity_id: 'act205', reported_by: 'p103', severity: 'low', category: '건강이슈', description: '어르신이 활동 중 어지럼증 호소. 청년이 즉시 휴식·수분 보충 안내. 큰 문제 없이 회복.', status: 'resolved', resolved_at: '2027-06-13', resolved_by: '코디 한가은', resolution: '활동 시작 전 어르신 컨디션 체크리스트 도입. 여름철 활동 시 수분·휴식 가이드 배포.', reported_at: '2027-06-12 13:40' },
  ],

  surveys: [
    { id: 'sv001', participant_id: 'p001', month: '2027-06', satisfaction: 5, would_continue: true, comment: '어르신께 받는 진로 조언이 진짜 도움 돼요. 단순 봉사가 아니라 제가 더 배우는 느낌.' },
    { id: 'sv002', participant_id: 'p101', month: '2027-06', satisfaction: 5, would_continue: true, comment: '손녀처럼 따뜻한 청년을 만나서 매번 기다려져요.' },
    { id: 'sv003', participant_id: 'p201', month: '2027-06', satisfaction: 5, would_continue: true, comment: '학원만 다니던 아이가 박순자 할머니 얘기 자주 해요. 아이 정서에 큰 영향.' },
    { id: 'sv004', participant_id: 'p002', month: '2027-06', satisfaction: 4, would_continue: true, comment: '활동 시간이 좀 더 길었으면 좋겠어요.' },
    { id: 'sv005', participant_id: 'p102', month: '2027-06', satisfaction: 5, would_continue: true, comment: '집에만 있던 내가 매주 외출하니 활기가 생겼어요.' },
    { id: 'sv006', participant_id: 'p202', month: '2027-06', satisfaction: 5, would_continue: true, comment: '교대근무에도 안심하고 맡길 수 있어 마음이 가벼워요.' },
    { id: 'sv007', participant_id: 'p004', month: '2027-06', satisfaction: 5, would_continue: true, comment: '간호 일과도 연결되고, 어르신께 배우는 게 더 많아요.' },
    { id: 'sv008', participant_id: 'p104', month: '2027-06', satisfaction: 5, would_continue: true, comment: '손주뻘 아이와 김치 담그니 사는 재미가 생겼어요.' },
    { id: 'sv009', participant_id: 'p006', month: '2027-06', satisfaction: 4, would_continue: true, comment: '어르신 인생 이야기가 진로에 큰 도움이 됐어요. 횟수가 더 늘면 좋겠어요.' },
  ],
};

// ============================================================================
// 3. STORAGE · 4. UTILS — src/eum/storage.js · src/eum/utils.js 로 이동 (상단 import)
// ============================================================================

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
  // 상태 칩 — 알약(999) 대신 소프트 사각(7~8px). 콘솔 데이터 라벨의 표준 문법.
  const pad = size === 'sm' ? '3px 8px' : '5px 11px';
  const fs = size === 'sm' ? 11.5 : 12.5;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: soft, color, padding: pad, borderRadius: size === 'sm' ? 7 : 8,
      border: 'none',
      fontSize: fs, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.45,
      whiteSpace: 'nowrap', flexShrink: 0, maxWidth: '100%',
    }}>{children}</span>
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
    </span>
  );
}

function Button({ children, onClick, variant = 'primary', size = 'md', disabled, icon, iconRight, fullWidth, type = 'button', style = {} }) {
  const variants = {
    primary: { bg: C.headline, fg: '#fff', border: C.headline, hoverBg: '#000' },
    brand: { bg: C.brand, fg: '#fff', border: C.brand, hoverBg: C.brandDark },
    secondary: { bg: C.panel, fg: C.ink, border: C.line, hoverBg: C.hover },
    ghost: { bg: 'transparent', fg: C.inkSoft, border: 'transparent', hoverBg: C.hover },
    danger: { bg: C.red, fg: '#fff', border: C.red, hoverBg: '#A03838' },
    success: { bg: C.sage, fg: '#fff', border: C.sage, hoverBg: '#4D6B45' },
  };
  const v = variants[variant];
  const sizes = {
    sm: { pad: '6px 12px', fs: 12.5, h: 32 },
    md: { pad: '9px 16px', fs: 13.5, h: 38 },
    lg: { pad: '13px 24px', fs: 15.5, h: 48 },
  };
  const s = sizes[size];
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const isSolid = ['primary', 'brand', 'danger', 'success'].includes(variant);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerCancel={() => setPress(false)}
      onBlur={() => setPress(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        background: hover && !disabled ? v.hoverBg : v.bg,
        color: v.fg, border: `1px solid ${v.border}`,
        padding: s.pad, fontSize: s.fs, fontWeight: 700,
        borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
        // 컬러 글로우(광원 없는 색번짐)는 아마추어 신호 — 얕고 중성적인 그림자만 쓴다
        boxShadow: !disabled && isSolid ? (press ? 'none' : SHADOW.xs) : 'none',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.16s ease, box-shadow 0.18s ease, transform 0.12s cubic-bezier(0.22,1,0.36,1)',
        transform: disabled ? 'none' : press ? 'scale(0.975)' : 'none',
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
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: C.panel,
        border: `1px solid ${hover ? '#DCDFE5' : C.line}`,
        borderRadius: 16,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: hover ? SHADOW.md : SHADOW.xs,
        transform: hover ? 'translateY(-2px)' : 'none',
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
        aria-label={placeholder}
        disabled={disabled}
        style={{
          width: '100%', padding: icon ? '10px 14px 10px 38px' : '10px 14px',
          border: `1px solid ${C.line}`, borderRadius: 10,
          fontSize: 13.5, fontFamily: FONT_STACK, color: C.ink,
          background: disabled ? C.lineSoft : C.panel, outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}1f`; }}
        onBlur={(e) => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
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
      aria-label={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '11px 14px',
        border: `1px solid ${C.border}`, borderRadius: 12,
        fontSize: 14, fontFamily: FONT_STACK, color: C.ink,
        background: C.card, outline: 'none', resize: 'vertical',
        lineHeight: 1.6, transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
      onFocus={(e) => { e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}22`; }}
      onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function Select({ value, onChange, options, placeholder, style = {} }) {
  return (
    <select
      value={value || ''}
      aria-label={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={(e) => { e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}1f`; }}
      onBlur={(e) => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
      style={{
        width: '100%', padding: '9px 14px',
        border: `1px solid ${C.line}`, borderRadius: 10,
        fontSize: 13.5, fontFamily: FONT_STACK, color: C.ink, fontWeight: 600,
        background: C.panel, outline: 'none', cursor: 'pointer',
        appearance: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8B93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
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

// 오버레이가 열려 있는 동안 배경 스크롤 잠금 (열린 오버레이 수를 세어 중첩 안전)
let __eumLockCount = 0;
function useBodyScrollLock(open) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const body = document.body;
    if (__eumLockCount === 0) {
      body.dataset.eumPrevOverflow = body.style.overflow || '';
      body.style.overflow = 'hidden';
    }
    __eumLockCount += 1;
    return () => {
      __eumLockCount = Math.max(0, __eumLockCount - 1);
      if (__eumLockCount === 0) {
        body.style.overflow = body.dataset.eumPrevOverflow || '';
        delete body.dataset.eumPrevOverflow;
      }
    };
  }, [open]);
}

// 다이얼로그 내부에서만 Tab 순환(포커스 트랩) + 닫힐 때 이전 포커스 복원
const FOCUSABLE_SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function useFocusTrap(open, panelRef) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll(FOCUSABLE_SEL))
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) { e.preventDefault(); panelRef.current.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [open, panelRef]);
}

function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const panelRef = useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(open, panelRef);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  // 열릴 때 포커스를 다이얼로그로 이동 (스크린리더·키보드 사용자)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => { if (panelRef.current) panelRef.current.focus(); }, 0);
    return () => clearTimeout(t);
  }, [open]);
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
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: 16, maxWidth: widths[size], width: '100%',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s ease',
          outline: 'none',
        }}
      >
        {title && (
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>{title}</div>
            <button onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 4, display: 'flex' }}>
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
    <div role="status" aria-live={toast.type === 'error' ? 'assertive' : 'polite'} style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      background: c.bg, color: '#fff', padding: '13px 18px',
      borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 10px 30px rgba(0,0,0,0.32)', maxWidth: 380,
      fontSize: 14, fontWeight: 600, animation: 'slideInRight 0.2s ease',
      fontFamily: FONT_STACK,
    }}>
      {c.icon}
      {toast.message}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.ink, icon, trend }) {
  // 콘솔 KPI — 컬러 상단선 제거. 라벨·수치·보조설명의 3단 리듬 + 톤다운 아이콘 칩.
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
      padding: '18px 20px 16px', boxShadow: SHADOW.xs, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        {icon && (
          <span style={{ width: 28, height: 28, borderRadius: 9, background: color + '14', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <span style={{ fontSize: 12.5, color: C.navMute, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: C.headline, letterSpacing: '-0.035em', lineHeight: 1.04, fontVariantNumeric: 'tabular-nums' }}>
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: trend === 'up' ? C.sage : trend === 'down' ? C.red : C.mute, marginTop: 9, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, lineHeight: 1.45 }}>
          {trend === 'up' && <TrendingUp size={12} />}
          {sub}
        </div>
      )}
    </div>
  );
}

// ── 모션 · 인포그래픽 툴킷 ────────────────────────────────────────────────
function useCountUp(target, duration = 950) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, '')) || 0;
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(num); return; }
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
  // 숫자는 tabular-nums로 고정폭 — 카운트업 중 흔들림 방지·금액 열 정렬(디자인 시스템)
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{n}{suffix}</span>;
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
        {label != null && <div style={{ fontSize: Math.round(size * 0.27), fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{label}</div>}
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
function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    let timer;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { timer = setTimeout(() => setShown(true), delay); io.unobserve(el); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer); };
  }, [delay]);
  return (
    <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : `translateY(${y}px)`, transition: 'opacity 0.7s ease, transform 0.85s cubic-bezier(0.22,1,0.36,1)', willChange: 'opacity, transform', ...style }}>
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
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        onFocus={(e) => { e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}1f`; }}
        onBlur={(e) => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
        style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel, fontSize: 13.5, color: C.ink, fontFamily: FONT_STACK, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}
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
  useBodyScrollLock(feedbackOpen);
  useEffect(() => {
    if (!feedbackOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setFeedbackOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feedbackOpen]);

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
          <div role="dialog" aria-modal="true" aria-label="활동 후기 작성" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 440, width: '100%', padding: 28, boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease', textAlign: 'left' }}>
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
  const [hoverId, setHoverId] = useState(null);
  return (
    // 세그먼티드 컨트롤 — 밑줄 탭 대신 트랙 위 화이트 필. 상태가 한눈에 잡히고 밀도가 높다.
    <div role="tablist" style={{
      display: 'inline-flex', gap: 2, padding: 4,
      background: C.lineSoft, borderRadius: 12, border: `1px solid ${C.line}`,
      maxWidth: '100%', overflowX: 'auto', ...style,
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        const isHover = hoverId === t.id && !isActive;
        return (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(t.id)}
          onMouseEnter={() => setHoverId(t.id)}
          onMouseLeave={() => setHoverId((p) => (p === t.id ? null : p))}
          style={{
            padding: '8px 14px',
            background: isActive ? C.panel : isHover ? 'rgba(255,255,255,0.6)' : 'transparent',
            border: 'none', borderRadius: 9,
            boxShadow: isActive ? SHADOW.sm : 'none',
            color: isActive ? C.headline : C.navMute,
            fontWeight: isActive ? 700 : 600,
            fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: FONT_STACK, transition: 'color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {t.label}
          {t.count !== undefined && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: isActive ? C.brandSoft : 'rgba(0,0,0,0.05)',
              color: isActive ? C.brand : C.navMute,
              padding: '1px 6px', borderRadius: 6,
              fontVariantNumeric: 'tabular-nums',
              transition: 'background 0.16s ease, color 0.16s ease',
            }}>{t.count}</span>
          )}
        </button>
        );
      })}
    </div>
  );
}

function Empty({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: C.mute }}>
      {icon && (
        <div aria-hidden="true" style={{
          width: 64, height: 64, borderRadius: 18,
          background: C.lineSoft,
          color: C.muteLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          border: `1px solid ${C.line}`,
        }}>{icon}</div>
      )}
      <div style={{ fontSize: 15.5, fontWeight: 700, color: C.headline, marginBottom: 6, letterSpacing: '-0.02em' }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, marginBottom: 20, lineHeight: 1.65, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto', color: C.navMute }}>{sub}</div>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// 스켈레톤 — 로딩 시 콘텐츠 형태를 미리 보여주는 회색 블록(디자인 시스템: 스켈레톤 우선, 스피너 보조)
function Skeleton({ w = '100%', h = 14, r = 8, style = {} }) {
  return (
    <div
      aria-hidden="true"
      className="eum-skeleton"
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  );
}


// ============================================================================
// 6. LAYOUT — SIDEBAR + HEADER
// ============================================================================

// 이음 공식 로고 마크 (브랜드 가이드) — 세 세대가 손을 잇는 형상
const EUM_MARK_D = "M73.92,53.01c-.39,2.89-1.77,5.44-4.06,7.16-2.63,1.98-6.02,2.48-9.18,1.52-2.76-.84-4.87-2.92-6.02-5.55-2.76-6.31.48-13.43,4.62-18.77-4.81-3.43-9.95-3.44-14.89-.02,2.95,3.92,5.56,8.47,5.65,13.47.12,6.27-4.1,11.48-10.41,11.34-3.8-.09-7.11-2.14-8.8-5.54-3.43-6.92.84-14.26,5.84-19.43-4.61-4.22-10.66-7.27-16.93-6.78-3.62.29-7.06,1.67-9.59,4.3-3.03,3.14-4.24,7.51-3.75,11.8.98,8.62,8.74,13.5,17.13,12.74.54-.05,1.07.12,1.42.52,1.16,1.34.87,3.29-.64,4.26-.82.53-1.8.77-2.83.81-8.38.3-16.45-3.86-19.76-11.7-3.85-9.12-1.19-20.44,7.51-25.61,3.02-1.79,6.29-2.63,9.85-2.93-7.31-2.08-11.11-9.72-8.46-16.65C12.18,3.87,15.98.73,20.54.11c7.35-.99,13.84,4.54,14.02,11.98.15,6.03-3.91,11.33-9.94,12.68,6.52,1.21,11.73,4.22,16.36,8.76,2.37-1.74,4.92-2.86,7.86-3.35-2.47-.81-4.54-2.39-5.82-4.68-2.96-5.27-.82-12.02,4.69-14.48,5.41-2.41,11.65.2,13.75,5.62,2.11,5.45-.69,11.64-6.49,13.52,2.76.57,5.34,1.6,7.76,3.36,4.66-4.58,9.8-7.61,16.35-8.75-5.06-1.16-8.74-4.97-9.72-9.94-.82-4.14.5-8.28,3.41-11.21,2.94-2.95,7.15-4.21,11.33-3.35,5.06,1.03,8.99,5.33,9.66,10.42.84,6.35-3.04,12.19-9.15,13.89,7.4.59,13.8,4.12,16.99,10.82,2.36,4.97,2.65,10.75.97,15.99-2.87,8.93-11.55,13.91-20.69,13.44-.86-.04-1.64-.27-2.35-.65-1.43-.76-1.92-2.35-1.26-3.8.37-.81,1.01-1.19,1.92-1.12,6.35.5,12.75-2.12,15.63-7.95,2.39-4.85,2.02-10.71-1.1-15.15-1.61-2.29-3.89-3.86-6.51-4.82-7.44-2.74-15.52.58-21.19,5.85,4.03,4.25,7.72,9.77,6.91,15.83ZM29.02,12.49c0-3.77-3.06-6.82-6.82-6.82s-6.82,3.06-6.82,6.82,3.06,6.82,6.82,6.82,6.82-3.06,6.82-6.82ZM88.34,12.49c0-3.76-3.05-6.81-6.81-6.81s-6.81,3.05-6.81,6.81,3.05,6.81,6.81,6.81,6.81-3.05,6.81-6.81ZM57.06,20.43c0-2.83-2.3-5.13-5.13-5.13s-5.13,2.3-5.13,5.13,2.3,5.13,5.13,5.13,5.13-2.3,5.13-5.13ZM37.05,55.12c1.25,1.05,2.82,1.31,4.41.8,1.19-.38,2.37-1.43,2.88-2.86,1.43-3.91-1.59-8.78-4.12-12.01-2.32,2.61-4.66,6.02-4.96,9.36-.16,1.77.37,3.53,1.77,4.72ZM68.24,49.18c-.81-3.07-2.66-5.69-4.78-8.16-2.46,3.13-5.29,7.72-4.22,11.62.55,2.03,2.25,3.43,4.23,3.53,2.03.11,3.83-1.06,4.6-2.99.5-1.26.47-2.6.18-4Z";

function EumLogo({ size = 32, variant = 'badge' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 105 105" style={{ display: 'block', flexShrink: 0 }} role="img" aria-label="이음 로고">
      <g transform="translate(0,19.5)">
        <path fill="#FC5028" d={EUM_MARK_D} />
      </g>
    </svg>
  );
}

function Sidebar({ role, currentView, onNavigate, onLogout, userName, dataCount }) {
  const navByRole = {
    coordinator: [
      { id: 'overview', label: '대시보드', icon: <Home size={17} />, group: '운영' },
      { id: 'applicants', label: '신청자 관리', icon: <UserPlus size={17} />, count: dataCount?.applicants, group: '운영' },
      { id: 'matching', label: '매칭 보드', icon: <Heart size={17} />, count: dataCount?.matches, group: '운영' },
      { id: 'activities', label: '활동 승인', icon: <ClipboardCheck size={17} />, count: dataCount?.pendingLogs, group: '운영' },
      { id: 'settlements', label: '정산', icon: <Wallet size={17} />, group: '운영' },
      { id: 'safety', label: '안전 이슈', icon: <ShieldAlert size={17} />, count: dataCount?.openIncidents, danger: dataCount?.openIncidents > 0, group: '운영' },
      { id: 'reports', label: '리포트', icon: <FileText size={17} />, group: '성과·납품' },
      { id: 'b2g', label: '공공 성과·납품', icon: <TrendingUp size={17} />, group: '성과·납품' },
      { id: 'b2b', label: '기업·기관 복지', icon: <Award size={17} />, group: '성과·납품' },
      { id: 'ai-advisor', label: '복지 어드바이저', icon: <Sparkles size={17} />, group: 'AI 어시스트' },
      { id: 'ai-match', label: 'AI 자동·선택 매칭', icon: <Users size={17} />, group: 'AI 어시스트' },
      { id: 'ai-copilot', label: 'AI 코파일럿', icon: <ClipboardCheck size={17} />, group: 'AI 어시스트' },
      { id: 'ai-chaperone', label: 'AI 안전 채퍼론', icon: <ShieldCheck size={17} />, group: 'AI 어시스트' },
      { id: 'roadmap', label: '서비스 로드맵', icon: <Sparkles size={17} />, group: 'AI 어시스트' },
    ],
    youth: [
      { id: 'dashboard', label: '홈', icon: <Home size={18} /> },
      { id: 'discover', label: '활동 찾기', icon: <Search size={18} /> },
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

  // 그룹 라벨이 있는 항목만 섹션으로 묶는다(코디네이터). 그 외 역할은 단일 목록.
  const groups = [];
  items.forEach((it) => {
    const g = it.group || '';
    const last = groups[groups.length - 1];
    if (last && last.name === g) last.items.push(it);
    else groups.push({ name: g, items: [it] });
  });

  return (
    <div style={{
      width: isSenior ? 244 : 248, height: '100vh', background: C.panel,
      borderRight: `1px solid ${C.line}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0,
    }}>
      {/* 브랜드 */}
      <div style={{ height: 64, padding: '0 18px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.lineSoft}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }} onClick={() => onNavigate('overview')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('overview'); } }} role="button" tabIndex={0} aria-label="대시보드로">
          <EumLogo size={28} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1 }}>이음</span>
            <span style={{ fontSize: 11, color: C.navMute, fontWeight: 600, letterSpacing: '-0.01em' }}>{persona.label}</span>
          </div>
        </div>
      </div>

      {/* 내비게이션 */}
      <div className="eum-scroll" style={{ flex: 1, padding: '12px 10px 8px', overflowY: 'auto' }}>
        {groups.map((g, gi) => (
          <div key={g.name || gi} style={{ marginBottom: 6 }}>
            {g.name && (
              <div style={{ fontSize: 10.5, color: C.muteLight, fontWeight: 700, letterSpacing: '0.09em', padding: gi === 0 ? '2px 12px 7px' : '14px 12px 7px', textTransform: 'uppercase' }}>
                {g.name}
              </div>
            )}
            {g.items.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: isSenior ? '13px 12px' : '9px 12px', marginBottom: 1,
                    background: active ? C.brandSoft : 'transparent',
                    color: active ? C.brand : C.inkSoft,
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontWeight: active ? 700 : 500,
                    fontSize: isSenior ? 16 : 13.5, textAlign: 'left',
                    letterSpacing: '-0.015em',
                    fontFamily: FONT_STACK,
                    transition: 'background 0.14s ease, color 0.14s ease',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.hover; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: active ? C.brand : C.muteLight, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      background: item.danger ? C.red : 'transparent',
                      color: item.danger ? '#fff' : (active ? C.brand : C.muteLight),
                      padding: item.danger ? '1px 6px' : '1px 2px', borderRadius: 6,
                      minWidth: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums',
                    }}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 계정 */}
      <div style={{ padding: 10, borderTop: `1px solid ${C.lineSoft}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10 }}>
          <Avatar type={role} name={userName} color={persona.color} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{userName}</div>
            <div style={{ fontSize: 11, color: C.muteLight, fontWeight: 500 }}>{persona.label}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', color: C.muteLight, padding: 6, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
            title="로그아웃"
            onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.inkSoft; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muteLight; }}
          >
            <LogOut size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.lineSoft}` }}>
          <span style={{ fontSize: 9.5, color: C.muteLight, fontWeight: 600 }}>운영</span>
          <img src="/logos/gowon.png" alt="고원 GOWON" loading="lazy" decoding="async" style={{ height: 14, objectFit: 'contain', opacity: 0.7 }} onError={(e) => { e.currentTarget.style.display = 'none'; const n = e.currentTarget.nextElementSibling; if (n) n.style.display = 'inline'; }} />
          <span style={{ display: 'none', fontSize: 9.5, color: C.muteLight, fontWeight: 700 }}>고원(GOWON)</span>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, right }) {
  // 컬러 바 제거 — 타이포 위계(28/800 + 13.5 뮤트)와 여백만으로 헤더를 세운다.
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13.5, color: C.navMute, marginTop: 7, lineHeight: 1.55, fontWeight: 500 }}>{subtitle}</div>}
      </div>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// 섹션 패널 — 콘솔 화면의 기본 구획 단위(헤더 + 본문). 카드 남용을 줄이고 위계를 만든다.
function Panel({ title, sub, right, children, padding = 20, style = {} }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.xs, overflow: 'hidden', ...style }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '15px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
          <div style={{ minWidth: 0 }}>
            {title && <div style={{ fontSize: 15, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{title}</div>}
            {sub && <div style={{ fontSize: 12.5, color: C.navMute, marginTop: 3, fontWeight: 500 }}>{sub}</div>}
          </div>
          {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{right}</div>}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
    </div>
  );
}

// ============================================================================
// 7. ROLE SELECT (랜딩 페이지)
// ============================================================================

function RoleSelect({ state, onSelectRole, onShowApplication }) {
  // 시드된 페르소나 fixed assignments
  const personas = [
    { role: 'youth', id: 'p001', gender: 'M', name: '김민준', subtitle: '27세 · 스타트업 개발자', desc: '어르신께 디지털을 알려드리고, 진로 조언을 받습니다.', color: C.sage, soft: C.sageSoft, gradient: 'linear-gradient(135deg, #6B8E5A 0%, #8FB47E 100%)' },
    { role: 'senior', id: 'p101', gender: 'F', name: '박순자', subtitle: '73세 · 前 교사', desc: '청년과 디지털을 익히고, 아이에게 옛이야기를 들려드려요.', color: C.lavender, soft: C.lavenderSoft, gradient: 'linear-gradient(135deg, #7F6FA0 0%, #A797C0 100%)' },
    { role: 'parent', id: 'p201', gender: 'F', name: '이서영', subtitle: '38세 · IT기업 PM (유진 8세 보호자)', desc: '아이가 어르신·청년과 만나는 안전한 공간을 신뢰해요.', color: C.peach, soft: C.peachSoft, gradient: 'linear-gradient(135deg, #D89368 0%, #E8B58F 100%)' },
    { role: 'coordinator', id: 'cdn001', gender: 'F', name: '한가은', subtitle: '코디네이터 · 광주 광산구', desc: '신청·검증·매칭·정산을 한눈에 관리합니다.', color: C.ink, soft: '#EDEAE5', gradient: 'linear-gradient(135deg, #1A1814 0%, #3A352F 100%)' },
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
            청년·어르신·아동 3세대가 서로 돕고 모두 보상받는<br />
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

        {/* 데모 로그인 안내 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ background: C.amberSoft, padding: 9, borderRadius: 10, display: 'flex' }}>
            <Sparkles size={20} color={C.amber} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>2027 광주 광산구 우산동 파일럿 · 데모 모드</div>
            <div style={{ fontSize: 13, color: C.mute }}>실제 운영 중인 15쌍의 데이터가 시드되어 있습니다. 역할 선택 후 모든 기능을 체험할 수 있어요.</div>
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
              <div style={{ fontSize: 13, color: C.mute, lineHeight: 1.55 }}>광주광역시 광산구 우산동에 거주하시면 <strong style={{ color: C.inkSoft }}>청소년부터 어르신까지 누구나</strong> 신청 가능합니다. 약 5분 소요.</div>
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
  useBodyScrollLock(true);

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
        <div role="dialog" aria-modal="true" aria-label="신청 접수 완료" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 460, width: '100%', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease' }}>
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
    { id: 'teen', label: '청소년', age: '만 15~18세', icon: GraduationCap, color: C.blue, soft: C.blueSoft, desc: '어르신·아동과 교류 + 봉사시간 인정 + 진로 탐색' },
    { id: 'youth', label: '청년', age: '만 19~39세', icon: Sparkles, color: C.sage, soft: C.sageSoft, desc: '월 27.5만 상품권 + 어르신 멘토 + 동네 정착' },
    { id: 'adult', label: '중년·서포터', age: '만 40~64세', icon: Heart, color: C.gold, soft: C.goldSoft, desc: '활동비 + 이웃 돌봄 참여 + 세대 잇기 서포터' },
    { id: 'senior', label: '어르신', age: '만 65세 이상', icon: Coffee, color: C.lavender, soft: C.lavenderSoft, desc: '월 27.5만 상품권 + 디지털 자립 + 효능감 회복' },
    { id: 'parent', label: '양육가정', age: '자녀와 함께', icon: Users, color: C.peach, soft: C.peachSoft, desc: '안전한 공간 + 3세대 교류 + 무료 참여' },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease' }}>
      <div role="dialog" aria-modal="true" aria-label="참여 신청" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 600, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease' }}>
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
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {React.createElement(t.icon, { size: 22 })}
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
        <label style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}</label>
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
      <PageHeader title="활동 일정" subtitle="매칭 트리오와의 격주 활동 일정입니다" />
      <Card padding={14} style={{ marginBottom: 18, background: C.successSoft, border: `1px solid ${C.success}33`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <InsuranceBadge size="md" />
        <span style={{ fontSize: 12.5, color: C.inkSoft }}>모든 대면 활동은 1365 자원봉사 보험 및 지자체 돌봄 특약 책임보험으로 자동 보장됩니다.</span>
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
      <PageHeader title="활동 기록" subtitle="작성한 기록은 코디네이터 승인 후 정산에 반영됩니다"
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
      <PageHeader title="동네 기억 아카이브" subtitle="광주 우산동의 옛이야기를 어르신께 듣고 기록합니다" />
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

// 참여자(소비자) 하단 탭 네비
const PARTICIPANT_NAV = {
  youth: [
    { id: 'dashboard', label: '홈', icon: Home }, { id: 'schedule', label: '일정', icon: Calendar },
    { id: 'discover', label: '찾기', icon: Search }, { id: 'logs', label: '기록', icon: PenLine }, { id: 'mentor', label: '멘토', icon: GraduationCap },
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
  const isNarrow = useIsMobile(760);
  const surface = isNarrow ? {} : {
    border: `1px solid ${C.line}`, borderRadius: 24,
    boxShadow: '0 32px 80px -40px rgba(16,24,40,0.28), 0 4px 16px -8px rgba(16,24,40,0.08)',
    overflow: 'hidden', margin: '28px 0 36px', minHeight: 'calc(100vh - 64px)',
  };
  return (
    <div style={{
      minHeight: '100vh', fontFamily: FONT_STACK, color: C.ink,
      display: 'flex', justifyContent: 'center',
      background: C.appBg,
      backgroundImage: `radial-gradient(1100px 420px at 50% -8%, ${persona.soft} 0%, rgba(0,0,0,0) 70%)`,
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        width: '100%', maxWidth: isSenior ? 860 : 720,
        display: 'flex', flexDirection: 'column',
        background: C.panel, position: 'relative',
        ...surface,
        ...(isNarrow ? { minHeight: '100vh' } : {}),
      }}>
        {/* 상단 앱바 — 정체(누구로 접속했는지)와 이탈(나가기)만 남긴다 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isSenior ? '14px 22px' : '12px 18px',
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: `1px solid ${C.lineSoft}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setView(items[0]?.id || 'dashboard')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView(items[0]?.id || 'dashboard'); } }} role="button" tabIndex={0} aria-label="홈으로">
            <EumLogo size={isSenior ? 32 : 27} />
            <div>
              <div style={{ fontSize: isSenior ? 17 : 15, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1.15 }}>이음</div>
              <div style={{ fontSize: isSenior ? 13 : 11, color: C.navMute, fontWeight: 600, marginTop: 1 }}>
                <span style={{ color: persona.color, fontWeight: 700 }}>{persona.label}</span> · {user?.name}님
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationBell state={state} role={role} user={user} onNavigate={setView} />
            <button onClick={handleLogout} aria-label="로그아웃" style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.line}`, background: C.panel, color: C.inkSoft, borderRadius: 10, padding: isSenior ? '9px 14px' : '7px 10px', fontSize: isSenior ? 14 : 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_STACK }}>
              <LogOut size={isSenior ? 18 : 15} />{isSenior && ' 나가기'}
            </button>
          </div>
        </div>

        {/* 본문 (탭 전환 시 부드러운 진입) */}
        <div key={view} id="eum-main" role="main" tabIndex={-1} style={{ flex: 1, padding: isSenior ? '24px 22px 116px' : '20px 18px 104px', overflowX: 'hidden', outline: 'none', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)', background: C.appBg }}>
          {children}
        </div>

        {/* 하단 탭 — 플로팅 아일랜드 + 활성 필. 손가락이 닿는 곳을 명확히 한다. */}
        <div style={{ position: 'sticky', bottom: 0, zIndex: 50, padding: isSenior ? '10px 16px 16px' : '8px 14px 14px', background: `linear-gradient(180deg, rgba(244,245,247,0) 0%, ${C.appBg} 55%)` }}>
          <div style={{
            display: 'flex', gap: 4, padding: 6,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)',
            border: `1px solid ${C.line}`, borderRadius: 18,
            boxShadow: '0 12px 32px -14px rgba(16,24,40,0.22)',
          }}>
            {items.map((it) => {
              const active = view === it.id;
              const Icon = it.icon;
              return (
                <button key={it.id} onClick={() => setView(it.id)} style={{
                  position: 'relative', flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: isSenior ? 5 : 4,
                  padding: isSenior ? '11px 2px' : '8px 2px',
                  minHeight: isSenior ? 62 : 52,
                  border: 'none', borderRadius: 13,
                  background: active ? persona.soft : 'transparent',
                  cursor: 'pointer', color: active ? persona.color : C.navMute,
                  fontFamily: FONT_STACK, transition: 'color 0.16s ease, background 0.16s ease',
                }}>
                  <Icon size={isSenior ? 25 : 20} strokeWidth={active ? 2.4 : 1.9} />
                  <span style={{ fontSize: isSenior ? 12.5 : 10.5, fontWeight: active ? 700 : 600, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{it.label}</span>
                </button>
              );
            })}
          </div>
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
  const drawerRef = useRef(null);
  useBodyScrollLock(drawer);
  useFocusTrap(drawer, drawerRef);
  // 화면 전환 시 상단으로 복귀 — 이전 화면의 스크롤 위치가 남아 "중간부터 시작"하는 문제 방지
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);
  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => { if (drawerRef.current) drawerRef.current.focus(); }, 0);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [drawer]);

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, color: C.ink }}>
        {/* 모바일 상단바 */}
        <div style={{ position: 'sticky', top: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setDrawer(true)} aria-label="메뉴" style={{ display: 'flex', border: `1px solid ${C.border}`, background: C.card, borderRadius: 10, padding: 8, cursor: 'pointer', color: C.ink }}><Menu size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setView('overview')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView('overview'); } }} role="button" tabIndex={0} aria-label="대시보드로">
              <EumLogo size={26} />
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: SERIF_STACK, color: C.ink }}>이음 <span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>관리자</span></span>
            </div>
          </div>
          <NotificationBell state={state} role="coordinator" user={user} onNavigate={setView} />
        </div>
        {/* 드로어 */}
        {drawer && (
          <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.45)', zIndex: 70, animation: 'fadeIn 0.15s ease' }}>
            <div ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="메뉴" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, outline: 'none', animation: 'slideInLeft 0.22s ease' }}>
              <Sidebar role={role} currentView={view} onNavigate={(v) => { setView(v); setDrawer(false); }} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
            </div>
          </div>
        )}
        {/* 본문 (화면 전환 시 부드러운 진입 — 소비자 앱과 동일한 모션 언어) */}
        <div key={view} id="eum-main" role="main" tabIndex={-1} style={{ padding: '18px 16px 40px', overflowX: 'hidden', outline: 'none', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)' }}>{children}</div>
      </div>
    );
  }

  const crumb = COORD_VIEW_LABEL[view] || '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.appBg, fontFamily: FONT_STACK, color: C.ink }}>
      <Sidebar role={role} currentView={view} onNavigate={setView} onLogout={handleLogout} userName={user?.name} dataCount={dataCount} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* 상단바 — 브레드크럼 + 알림. 사이드바와 같은 64px 높이로 시각적 기준선을 맞춘다. */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: 64, flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 32px',
          background: 'rgba(255,255,255,0.86)', backdropFilter: 'saturate(180%) blur(12px)',
          borderBottom: `1px solid ${C.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, minWidth: 0 }}>
            <span style={{ color: C.muteLight, fontWeight: 500 }}>코디네이터 콘솔</span>
            {crumb && <><span style={{ color: '#D4D7DD' }}>/</span><span style={{ color: C.headline, fontWeight: 700, letterSpacing: '-0.02em' }}>{crumb}</span></>}
          </div>
          <NotificationBell state={state} role="coordinator" user={user} onNavigate={setView} />
        </div>
        <div style={{ flex: 1, padding: '28px 32px 56px' }}>
          {/* 화면 전환 시 부드러운 진입 — 관리자 콘솔도 동일 모션 언어 */}
          <div key={view} id="eum-main" role="main" tabIndex={-1} style={{ maxWidth: 1280, margin: '0 auto', outline: 'none', animation: 'fadeUp 0.42s cubic-bezier(0.22,1,0.36,1)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const COORD_VIEW_LABEL = {
  overview: '대시보드', applicants: '신청자 관리', matching: '매칭 보드', activities: '활동 승인',
  settlements: '정산', safety: '안전 이슈', reports: '리포트', b2g: '공공 성과·납품', b2b: '기업·기관 복지',
  'ai-advisor': '복지 어드바이저', 'ai-match': 'AI 자동·선택 매칭', 'ai-copilot': 'AI 코파일럿',
  'ai-chaperone': 'AI 안전 채퍼론', roadmap: '서비스 로드맵',
};

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
      <TrustRow />
      <ConsumerPricing />
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
      {view === 'overview' && <CoordOverview state={state} setView={setView} dispatch={dispatch} />}
      {view === 'applicants' && <CoordApplicants state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'matching' && <CoordMatching state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'activities' && <CoordActivities state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'settlements' && <CoordSettlements state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'safety' && <CoordSafety state={state} dispatch={dispatch} showToast={showToast} user={user} />}
      {view === 'reports' && <CoordReports state={state} dispatch={dispatch} showToast={showToast} />}
      {view === 'b2g' && <CoordB2G state={state} showToast={showToast} />}
      {view === 'b2b' && <CoordB2B state={state} showToast={showToast} />}
      {view === 'ai-advisor' && <CoordAdvisor state={state} showToast={showToast} />}
      {view === 'ai-match' && <CoordAIMatch state={state} showToast={showToast} />}
      {view === 'ai-copilot' && <CoordCopilot state={state} showToast={showToast} />}
      {view === 'ai-chaperone' && <CoordChaperone state={state} showToast={showToast} />}
      {view === 'roadmap' && <CoordRoadmap />}
    </Layout>
  );
}

// --- 11.1 Overview (KPI dashboard) ---

// ============================================================================
// AI 고도화 모듈 (2026-06 추가 · 코디네이터 전용 · 기존 화면 무손상=롤백 안전)
//  ① 복지 어드바이저 ② 자동+선택형 하이브리드 매칭 ③ AI 코파일럿 ④ AI 안전 채퍼론
// ============================================================================
const AI_RATE = (typeof RATE_PER_HOUR !== 'undefined' ? RATE_PER_HOUR : 11460);
const AI_W = { proximity: 24, schedule: 20, synergy: 30, safety: 16, complement: 10 };
const AI_LBL = { proximity: '근접도', schedule: '시간적합', synergy: '관심·역량 시너지', safety: '안전·검증', complement: '세대보완' };
const AI_THES = { '책': ['독서지도','학습멘토','한자','동화구연','글쓰기'], '그림': ['예술교육','사진','디자인'], '공룡': ['역사이야기','동화구연'], '로봇': ['코딩교육','수학교육','디지털코칭'], '레고': ['수학교육','코딩교육','예술교육'], '강아지': ['돌봄','건강관리'], '축구': ['건강관리','돌봄'], '노래': ['동화구연','이야기'] };
function aiDong(a){ const m = String(a||'').match(/([가-힣]{1,4}동)/); return m ? m[1] : ''; }
function aiOverlap(a,b){ const B = new Set(b||[]); return [...new Set((a||[]).filter(x=>B.has(x)))]; }
function aiClamp(x){ return Math.max(0, Math.min(1, x)); }
function aiTrioScore(y,s,c){
  const p={}, tags=[];
  if(!y||!s||!c) return { total:0, parts:[], tags:[] };
  const dY=aiDong(y.address), dS=aiDong(s.address), dC=aiDong(c.address);
  if(dY&&dY===dS&&dS===dC){ p.proximity=1; tags.push(['근접도', '같은 '+dY+' 생활권']); }
  else if(dS&&dS===dC){ p.proximity=0.78; tags.push(['근접도','어르신·아이 같은 '+dS]); }
  else if(String(y.address).includes('광산구')&&String(s.address).includes('광산구')){ p.proximity=0.5; }
  else p.proximity=0.3;
  const ov=aiOverlap(y.availability,s.availability);
  p.schedule = ov.length>=2?1:ov.length===1?0.72:0.34;
  if(ov.length) tags.push(['시간','겹치는 시간 '+ov.join(', ')]);
  const pool=[...(y.skills||[]),...(s.skills||[]),...(s.interests||[])];
  let sg=0;
  (c.interests||[]).forEach(ci=>{ const f=AI_THES[ci]||[]; if(pool.find(sk=>f.includes(sk)||sk===ci)){ sg+=0.34; tags.push(['시너지',"아이 '"+ci+"' 관심 ↔ 멘토 역량"]); } });
  const peer=aiOverlap(y.interests,s.interests);
  p.synergy=aiClamp(0.2+sg+peer.length*0.12);
  const st=x=>x.status==='active'?1:x.status==='pending_match'?0.8:x.status==='verifying'?0.5:0.4;
  p.safety=aiClamp((st(y)+st(s)+1)/3);
  tags.push((y.status==='active'&&s.status==='active')?['안전','3인 모두 안전검증 완료']:['안전','검증 진행 중 — 활성화 전 완료']);
  let cp=0.25; const occ=s.occupation||'';
  if(/교사|교직/.test(occ)&&(c.interests||[]).includes('책')) cp+=0.5;
  if(/식당|요리|봉제/.test(occ)) cp+=0.2;
  if(/개발|디자이너|회계|간호/.test(y.occupation||'')) cp+=0.2;
  p.complement=aiClamp(cp);
  let tot=0, ws=0; Object.keys(AI_W).forEach(k=>{ tot+=(p[k]||0)*AI_W[k]; ws+=AI_W[k]; });
  const parts=Object.keys(AI_W).map(k=>({ k, label:AI_LBL[k], w:AI_W[k], v:Math.round((p[k]||0)*100) }));
  const seen=new Set(); const ut=tags.filter(t=>{ if(seen.has(t[1]))return false; seen.add(t[1]); return true; });
  return { total: Math.round(aiClamp(tot/ws)*100), parts, tags: ut };
}
function aiAutoTrios(ys, ss, cs, max){
  const cb=[];
  (ys||[]).forEach(y=>(ss||[]).forEach(s=>(cs||[]).forEach(c=>{ const sc=aiTrioScore(y,s,c); cb.push({ y,s,c, ...sc }); })));
  cb.sort((a,b)=>b.total-a.total);
  const uy=new Set(), us=new Set(), uc=new Set(), out=[];
  for(const x of cb){ if(out.length>=(max||3))break; if(uy.has(x.y.id)||us.has(x.s.id)||uc.has(x.c.id))continue; uy.add(x.y.id); us.add(x.s.id); uc.add(x.c.id); out.push(x); }
  return out;
}
function aiWelfare(pf){
  const r=[]; const add=(name,why,benefit,where,gap)=>r.push({name,why,benefit,where,gap});
  if(pf.age>=65){
    add('노인맞춤돌봄서비스','65세 이상 안부·생활지원 대상 추정','월 16시간 내외 방문·안부','읍면동 행정복지센터', !(pf.gets||[]).includes('노인맞춤돌봄'));
    add('통합돌봄(일상생활돌봄·가족지원)','2026.3 시행 — 65세+ 재가 통합지원','개인별지원계획','시군구 통합지원전담조직', true);
    if(pf.alone) add('응급안전안심서비스','독거노인 응급·안전 모니터링','댁내 센서·응급호출','읍면동·지역센터', true);
    if(pf.income!=='일반') add('기초연금','65세+ 소득 하위 70% 추정','월 최대 약 34만원','국민연금공단·복지로', !(pf.gets||[]).includes('기초연금'));
  }
  if(pf.digitalWeak) add('디지털 배움터·에이징테크','디지털 취약 어르신 교육','무료 교육·기기 지원','과기정통부·지자체', true);
  if(pf.careNeed && pf.age<65) add('일상돌봄 서비스','질병·고립 청·중장년 재가돌봄','재가·가사·심리 바우처','읍면동 신청', true);
  if(pf.familyCareYouth) add('가족돌봄청년 지원','가족 돌보는 9~39세 청년','자기돌봄비·서비스 연계','지자체 복지포털', true);
  if(pf.income==='저소득') add('맞춤형 생계·의료급여 점검','소득·재산 기준 충족 시','급여·의료비 경감','복지로 모의계산', true);
  return r;
}
function AIWrap({ label, children, color }){
  const c = color || C.lavender;
  return (
    <div style={{ position:'relative', border:'1.5px solid '+c, borderRadius:14, background:C.lavenderSoft, padding:'18px 18px 15px', marginTop:14 }}>
      <span style={{ position:'absolute', top:-10, left:14, background:c, color:'#fff', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:999 }}>{label}</span>
      {children}
    </div>
  );
}
function AIBars({ parts }){
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:8 }}>
      {parts.map(p=>(
        <div key={p.k} style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ flex:'0 0 118px', fontSize:11, color:C.inkSoft, fontWeight:600 }}>{p.label}<span style={{ color:C.mute, fontWeight:500 }}> ·{p.w}</span></div>
          <div style={{ flex:1, height:9, borderRadius:6, background:C.bg, overflow:'hidden' }}><div style={{ width:p.v+'%', height:'100%', background:'linear-gradient(90deg,#9db4dd,'+C.blue+')' }} /></div>
          <div style={{ flex:'0 0 28px', textAlign:'right', fontSize:12, fontWeight:800, color:C.blue }}>{p.v}</div>
        </div>
      ))}
    </div>
  );
}

// ① 복지 어드바이저 -----------------------------------------------------------
function CoordAdvisor({ state, showToast }){
  const people = (state.participants||[]).filter(p=>['senior','youth','parent'].includes(p.type));
  const [pid, setPid] = useState((people.find(p=>p.type==='senior')||people[0]||{}).id);
  const person = people.find(p=>p.id===pid) || {};
  const [flags, setFlags] = useState({ alone:true, digitalWeak:true, lowIncome:true, careNeed:false, familyCareYouth:false });
  const [run, setRun] = useState(false); const [busy, setBusy] = useState(false);
  const pf = useMemo(()=>({ age:+person.age||0, alone:flags.alone, income:flags.lowIncome?'저소득':'기초연금', digitalWeak:flags.digitalWeak, careNeed:flags.careNeed, familyCareYouth:flags.familyCareYouth, gets:[] }), [person, flags]);
  const res = useMemo(()=>aiWelfare(pf), [pf, run]);
  const go = ()=>{ setBusy(true); setRun(false); setTimeout(()=>{ setBusy(false); setRun(true); }, 600); };
  const cks = [['alone','1인가구(독거)'],['digitalWeak','디지털 취약'],['lowIncome','저소득'],['careNeed','질병·고립으로 돌봄 필요'],['familyCareYouth','가족 돌보는 청년(9~39세)']];
  return (
    <div>
      <PageHeader title="복지 어드바이저" subtitle="참여자가 받을 수 있는 복지서비스를 AI가 찾아 추천하고 신청처를 안내합니다 — ‘몰라서 못 받는’ 사각지대를 먼저 발굴합니다." right={<Badge color={C.lavender} soft={C.lavenderSoft}>AI · 사각지대 발굴</Badge>} />
      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:16 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>참여자 선택</div>
          <select value={pid} onChange={e=>{ setPid(e.target.value); setRun(false); }} style={{ width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid '+C.border, fontFamily:FONT_STACK, fontSize:13 }}>
            {people.map(p=><option key={p.id} value={p.id}>{p.name} · {PERSONA[p.type]?.label} · {p.age}세</option>)}
          </select>
          <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:9 }}>
            {cks.map(([k,t])=>(
              <label key={k} style={{ fontSize:12.5, display:'flex', gap:8, alignItems:'center', cursor:'pointer', color:C.inkSoft }}>
                <input type="checkbox" checked={flags[k]} onChange={e=>{ setFlags({ ...flags, [k]:e.target.checked }); setRun(false); }} />{t}
              </label>
            ))}
          </div>
          <Button variant="brand" fullWidth style={{ marginTop:16 }} disabled={busy} onClick={go}>{busy ? '분석 중…' : '복지 추천 받기'}</Button>
        </Card>
        <div>
          {!run && !busy && <Card style={{ textAlign:'center', color:C.mute, padding:30 }}>참여자와 상황을 선택하고 ‘복지 추천 받기’를 누르세요.</Card>}
          {run && (
            <AIWrap label="AI 복지 어드바이저">
              <div style={{ fontSize:13, color:C.inkSoft, marginBottom:12 }}><b>{person.name}</b>님이 받을 수 있는 복지서비스 <b style={{ color:C.lavender }}>{res.length}건</b>을 찾았습니다.</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {res.map((x,i)=>(
                  <div key={i} style={{ border:'1px solid '+(x.gap?'#E0B9A6':C.border), borderRadius:11, padding:'12px 14px', background:C.card }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700 }}>{x.name}</span>
                      {x.gap ? <Badge color={C.brand} soft={C.brandSoft}>사각지대 발굴</Badge> : <Badge color={C.sage} soft={C.sageSoft}>수급 중</Badge>}
                    </div>
                    <div style={{ fontSize:12, color:C.inkSoft, marginTop:5, lineHeight:1.5 }}>{x.why}</div>
                    <div style={{ display:'flex', gap:14, marginTop:7, flexWrap:'wrap', fontSize:11.5, color:C.inkSoft }}><span><b style={{ color:C.gold }}>혜택</b> {x.benefit}</span><span><b style={{ color:C.blue }}>신청</b> {x.where}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}><Button variant="brand" size="sm" onClick={async()=>{ await EUM_API.notify.alimtalk(); showToast && showToast('신청 동행 등록 + 알림톡 발송(API)','success'); }}>신청 동행 등록</Button></div>
              <div style={{ fontSize:10.5, color:C.mute, marginTop:9, lineHeight:1.5 }}>※ 규칙기반 추정이며 실제 수급 자격은 신청·심사로 확정됩니다. 코디가 최종 확인 후 신청을 동행합니다.</div>
            </AIWrap>
          )}
        </div>
      </div>
    </div>
  );
}

// ② 자동 + 선택형 하이브리드 매칭 ----------------------------------------------
function CoordAIMatch({ state, showToast }){
  const ps = state.participants||[];
  const youths = ps.filter(p=>p.type==='youth');
  const seniors = ps.filter(p=>p.type==='senior');
  const children = ps.filter(p=>p.type==='child');
  const [mode, setMode] = useState('auto');
  const [busy, setBusy] = useState(false); const [autoRes, setAutoRes] = useState(null);
  const runAuto = ()=>{ setBusy(true); setAutoRes(null); setTimeout(()=>{ setAutoRes(aiAutoTrios(youths,seniors,children,3)); setBusy(false); }, 650); };
  const [yId,setY]=useState((youths[0]||{}).id); const [sId,setS]=useState((seniors[0]||{}).id); const [cId,setC]=useState((children[0]||{}).id);
  const y=youths.find(x=>x.id===yId), se=seniors.find(x=>x.id===sId), ch=children.find(x=>x.id===cId);
  const sc=useMemo(()=>aiTrioScore(y,se,ch),[yId,sId,cId]);
  return (
    <div>
      <PageHeader title="AI 자동 · 선택형 하이브리드 매칭" subtitle="AI가 청년·어르신·아동 세 명을 한 조로 묶어 최적 조합을 자동 추천하고, 직접 골라 구성할 수도 있습니다. 두 방식 모두 같은 점수 엔진·안전 가드레일 위에서 작동합니다."
        right={<div style={{ display:'flex', gap:6, background:C.bg, padding:4, borderRadius:9 }}>{[['auto','AI 자동추천'],['self','직접 선택']].map(([m,t])=><button key={m} onClick={()=>setMode(m)} style={{ border:'none', cursor:'pointer', fontFamily:FONT_STACK, fontWeight:700, fontSize:12.5, padding:'6px 12px', borderRadius:7, background:mode===m?C.card:'transparent', color:mode===m?C.ink:C.mute, boxShadow:mode===m?'0 1px 3px rgba(0,0,0,.1)':'none' }}>{t}</button>)}</div>} />
      {mode==='auto' && (
        <div>
          <Button variant="brand" disabled={busy} onClick={runAuto}>{busy ? '조합 계산 중…' : 'AI 자동매칭 실행'}</Button>
          {autoRes && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:13, marginTop:14 }}>
              {autoRes.map((t,i)=>(
                <Card key={i}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}><Badge color={C.blue} soft={C.blueSoft}>추천 #{i+1}</Badge><span style={{ fontSize:22, fontWeight:800, color:C.blue }}>{t.total}<span style={{ fontSize:12, color:C.mute }}>점</span></span></div>
                  <div style={{ display:'flex', gap:6, margin:'11px 0', flexWrap:'wrap' }}><Badge color={C.sage} soft={C.sageSoft}>{t.y.name}</Badge><Badge color={C.lavender} soft={C.lavenderSoft}>{t.s.name}</Badge><Badge color={C.peach} soft={C.peachSoft}>{t.c.name}</Badge></div>
                  <AIBars parts={t.parts} />
                  <div style={{ marginTop:9, display:'flex', flexDirection:'column', gap:3 }}>{t.tags.slice(0,3).map((tg,j)=><div key={j} style={{ fontSize:11, color:C.inkSoft }}>· <b>{tg[0]}</b> {tg[1]}</div>)}</div>
                  <Button variant="secondary" size="sm" fullWidth style={{ marginTop:11 }} onClick={()=>showToast && showToast('코디 확정 대기열에 담았습니다','success')}>코디 확정 검토</Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {mode==='self' && (
        <div>
          <div style={{ fontSize:12.5, color:C.inkSoft, marginBottom:12 }}>직접 상대를 골라 조를 구성하세요. <Badge color={C.gold} soft={C.goldSoft}>안전·거리 가드레일 통과 후보만</Badge></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[['청년',youths,yId,setY],['어르신',seniors,sId,setS],['아동',children,cId,setC]].map(([t,arr,val,set])=>(
              <Card key={t} padding={13}>
                <div style={{ fontSize:11, fontWeight:800, color:C.mute, marginBottom:8 }}>{t} 선택</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {arr.map(o=><button key={o.id} onClick={()=>set(o.id)} style={{ textAlign:'left', cursor:'pointer', fontFamily:FONT_STACK, fontSize:12.5, padding:'7px 9px', borderRadius:8, background:val===o.id?C.brandSoft:C.card, border:'1px solid '+(val===o.id?C.brand:C.border), color:C.ink }}>{o.name} <span style={{ fontSize:10, color:C.mute }}>{o.age}·{aiDong(o.address)}</span></button>)}
                </div>
              </Card>
            ))}
          </div>
          <AIWrap label="선택 조합 적합도" color={C.blue}>
            <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
              <div><span style={{ fontSize:30, fontWeight:800, color:sc.total>=80?C.sage:sc.total>=65?C.gold:C.red }}>{sc.total}</span><span style={{ color:C.mute }}>/100</span></div>
              <div style={{ flex:1, minWidth:240 }}><AIBars parts={sc.parts} /></div>
            </div>
            <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>{sc.tags.map((tg,j)=><Badge key={j} color={C.inkSoft} soft={C.bg}>{tg[0]}: {tg[1]}</Badge>)}</div>
            <Button variant="brand" style={{ marginTop:12 }} disabled={sc.total<60} onClick={()=>showToast && showToast('선택 조합을 코디 승인 대기로 신청했습니다','success')}>{sc.total<60?'점수 60점 미만 — 다른 조합을 시도':'이 조합으로 신청(코디 승인 대기)'}</Button>
          </AIWrap>
        </div>
      )}
    </div>
  );
}

// ③ AI 코디 코파일럿 ----------------------------------------------------------
function CoordCopilot({ state, showToast }){
  const acts = state.activities||[]; const logs = (state.activity_logs||[]);
  const [busy,setBusy]=useState(false); const [out,setOut]=useState(null);
  const compute = ()=>{
    const parts = state.participants || [];
    const nm = id => (parts.find(p=>p.id===id)||{}).name || '—';
    const approved = logs.filter(l=>l.approved);
    const pending = logs.filter(l=>!l.approved).length;
    let hrs=0; const byMatch={};
    approved.forEach(l=>{
      const a = acts.find(x=>x.id===l.activity_id) || {};
      const h = (l.hours!=null ? l.hours : (a.duration_hours||0)); hrs += h;
      const m = a.match_id || 'm0'; byMatch[m] = (byMatch[m]||0) + h;
    });
    const cnt = approved.length;
    const settle = Math.round(hrs*AI_RATE);
    // 실제 트리오별 활동 시간 라인
    const trioLines = Object.entries(byMatch).sort((a,b)=>b[1]-a[1]).map(([mid,h])=>{
      const m = (state.matches||[]).find(x=>x.id===mid);
      if(!m) return null;
      return '· '+nm(m.youth_id)+'·'+nm(m.senior_id)+'·'+nm(m.child_id)+' 트리오: '+h+'시간';
    }).filter(Boolean).slice(0,6).join('\n');
    // 대표 활동 코멘트(승인·사진 포함 우선)
    const standout = approved.filter(l=>l.has_photo && l.summary).slice(0,2)
      .map(l=>'· "'+String(l.summary).replace(/\s+/g,' ').slice(0,60)+'…" ('+nm(l.participant_id)+')').join('\n');
    const text = '[광산구 우산동 3세대 상생 품앗이 · 월간 운영보고 초안]\n'
      + '■ 활동 실적: 승인 '+cnt+'회 · 총 '+hrs+'시간 · 참여 트리오 '+Object.keys(byMatch).length+'개 (승인 대기 '+pending+'건)\n'
      + '■ 트리오별 활동시간\n'+(trioLines||'· (데이터 없음)')+'\n'
      + '■ 대표 활동 기록\n'+(standout||'· (사진 포함 기록 없음)')+'\n'
      + '■ 특이사항: 일부 어르신 건강·경제 부담 호소 → 복지 어드바이저 연계 권고. 안전 이슈 전건 해결.\n'
      + '■ 정산 예정: '+settle.toLocaleString('ko-KR')+'원 (지역상생카드, '+hrs+'h × '+AI_RATE.toLocaleString('ko-KR')+'원/h).';
    return { hrs, cnt, trios:Object.keys(byMatch).length, settle, text };
  };
  const go = ()=>{ setBusy(true); setOut(null); setTimeout(()=>{ setOut(compute()); setBusy(false); }, 700); };
  return (
    <div>
      <PageHeader title="AI 코디 코파일럿" subtitle="흩어진 활동기록을 요약하고, 정산을 자동 합산하고, 지자체 제출용 운영보고서 초안까지 한 번에 만들어 코디네이터를 보조합니다." right={<Badge color={C.lavender} soft={C.lavenderSoft}>AI · 운영 자동화</Badge>} />
      <Button variant="brand" disabled={busy} onClick={go}>{busy ? '요약·정산·보고서 생성 중…' : '코파일럿 실행'}</Button>
      {out && (
        <div style={{ marginTop:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
            {[['총 활동',out.cnt+'회'],['총 시간',out.hrs+'h'],['참여 조',out.trios+'개'],['정산 예정','₩'+out.settle.toLocaleString('ko-KR')]].map(([l,v])=>(
              <Card key={l} padding={14}><div style={{ fontSize:11, color:C.mute, fontWeight:700 }}>{l}</div><div style={{ fontSize:18, fontWeight:800, marginTop:3 }}>{v}</div></Card>
            ))}
          </div>
          <AIWrap label="AI 생성 — 지자체 운영보고서 초안">
            <pre style={{ whiteSpace:'pre-wrap', fontSize:12, color:C.inkSoft, lineHeight:1.65, fontFamily:FONT_STACK, margin:0 }}>{out.text}</pre>
            <div style={{ display:'flex', gap:8, marginTop:11 }}><Button variant="secondary" size="sm" onClick={()=>showToast && showToast('보고서 초안을 복사했습니다','success')}>복사</Button><Button variant="brand" size="sm" onClick={()=>showToast && showToast('정산 승인 — 상생카드 발급 대기','success')}>정산 승인·상품권 발급</Button></div>
          </AIWrap>
        </div>
      )}
    </div>
  );
}

// ④ AI 안전 채퍼론 ------------------------------------------------------------
const AI_TRANSCRIPT = [
  { sp:'어르신', t:'민준이 덕분에 사진 보내는 법을 다 배웠어. 고마워.' },
  { sp:'청년', t:'별말씀을요. 어르신, 요즘 다리는 좀 어떠세요?' },
  { sp:'어르신', t:'사실 며칠째 무릎이 너무 아파서 잠을 못 자. 병원 갈 돈도 빠듯하고.' },
  { sp:'아동', t:'할머니 안 아팠으면 좋겠어요.' },
  { sp:'어르신', t:'혼자 있으면 가끔 무섭기도 하고… 그래도 너희 오는 날만 기다린다.' },
];
const AI_RISK = [ {w:'아파',risk:'건강',sev:2},{w:'무릎',risk:'건강',sev:1},{w:'잠을 못',risk:'건강',sev:2},{w:'돈도',risk:'경제',sev:2},{w:'빠듯',risk:'경제',sev:1},{w:'혼자',risk:'고립',sev:1},{w:'무섭',risk:'정서',sev:2} ];
function CoordChaperone({ state, showToast }){
  const [busy,setBusy]=useState(false); const [done,setDone]=useState(false);
  const flags = useMemo(()=>{ const f=[]; AI_TRANSCRIPT.forEach((u,i)=>AI_RISK.forEach(k=>{ if(u.t.includes(k.w)) f.push({ i, sp:u.sp, risk:k.risk, sev:k.sev, w:k.w }); })); return f; }, []);
  const score = Math.min(100, flags.reduce((a,f)=>a+f.sev*12, 0));
  const go = ()=>{ setBusy(true); setDone(false); setTimeout(()=>{ setBusy(false); setDone(true); }, 700); };
  const rc = score>=60?C.red:score>=30?C.gold:C.sage;
  return (
    <div>
      <PageHeader title="AI 안전 채퍼론" subtitle="활동 중 대화를 음성인식(STT)·텍스트분석(TA)해 건강·경제·정서·고립 위험 신호를 자동 감지합니다. 위험이 쌓이면 코디에게 알리고, 누적 시 매칭을 자동 중단합니다." right={<Badge color={C.lavender} soft={C.lavenderSoft}>AI · STT·TA</Badge>} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>활동 대화 (STT 전사)</div>
          {AI_TRANSCRIPT.map((u,i)=>{ const hit = done && flags.some(f=>f.i===i); return (
            <div key={i} style={{ fontSize:13, padding:'7px 0', color:C.inkSoft, background:hit?C.redSoft:'transparent', borderRadius:8, paddingLeft:hit?8:0, transition:'.3s' }}><b style={{ color:C.ink }}>{u.sp}</b> · {u.t} {hit && <Badge color={C.red} soft={C.redSoft}>위험신호</Badge>}</div>
          ); })}
          <Button variant="brand" style={{ marginTop:12 }} disabled={busy} onClick={go}>{busy ? '음성·텍스트 분석 중…' : 'AI 안전 분석 실행'}</Button>
        </Card>
        <div>
          {!done && !busy && <Card style={{ textAlign:'center', color:C.mute, padding:28 }}>분석을 실행하면 위험신호가 표시됩니다.</Card>}
          {done && (
            <AIWrap label="AI 안전 채퍼론">
              <div style={{ textAlign:'center', margin:'2px 0 12px' }}><div style={{ fontSize:34, fontWeight:800, color:rc }}>{score}</div><div style={{ fontSize:11, color:C.mute }}>위험 점수 / 100</div></div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>{flags.map((f,j)=><div key={j} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}><Badge color={f.sev>=2?C.red:C.gold} soft={f.sev>=2?C.redSoft:C.goldSoft}>{f.risk}</Badge><span style={{ color:C.inkSoft }}>“…{f.w}…” ({f.sp})</span></div>)}</div>
              <div style={{ marginTop:12, padding:'11px 13px', background:C.brandSoft, border:'1px solid #E0B9A6', borderRadius:10 }}><div style={{ fontSize:12, fontWeight:800, color:C.brand, marginBottom:4 }}>권고 조치</div><div style={{ fontSize:11.5, color:C.inkSoft, lineHeight:1.55 }}>① 건강(무릎)·경제 부담 → 복지 어드바이저 연계 ② 고립·정서 신호 → 다음 방문 우선 ③ 위험 누적 시 매칭 일시중단.</div></div>
              <Button variant="brand" size="sm" fullWidth style={{ marginTop:11 }} onClick={()=>showToast && showToast('안전 이슈 등록 + 복지 어드바이저 연계 완료','success')}>안전 이슈 등록 + 어드바이저 연계</Button>
            </AIWrap>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 전면개편 모듈 (2026-06 · B2G·B2B 강화 + 복지 어드바이저 전역 노출 + UX)
//  케어닥/행복이음 벤치마킹 — 큰 카드·플로팅·신뢰배지·쉬운 UX
// ============================================================================

// 코디 대시보드 상단 — AI·공공 도구 빠른 접근(발견성 개선)
function QuickAccessStrip({ setView }) {
  const items = [
    { id: 'b2g', t: '공공 성과·납품', d: '도입효과·ROI·연계', c: C.blue, ic: <TrendingUp size={18} /> },
    { id: 'b2b', t: '기업·기관 복지', d: 'ESG·임직원 돌봄', c: C.sage, ic: <Award size={18} /> },
    { id: 'ai-advisor', t: '복지 어드바이저', d: '사각지대 발굴', c: C.lavender, ic: <Sparkles size={18} /> },
    { id: 'ai-match', t: 'AI 매칭', d: '자동+선택형', c: C.peach, ic: <Users size={18} /> },
  ];
  return (
    // 바로가기 — 카드 4개가 KPI와 경쟁하지 않도록 톤을 낮추고, 아이콘·라벨만 남긴다.
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 20 }}>
      {items.map(it => (
        <button key={it.id} onClick={() => setView(it.id)} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: FONT_STACK, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '12px 14px', boxShadow: SHADOW.xs, display: 'flex', alignItems: 'center', gap: 11, transition: 'border-color .16s ease, background .16s ease' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D7DAE0'; e.currentTarget.style.background = C.hover; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.panel; }}>
          <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: it.c + '14', color: it.c, flexShrink: 0 }}>{it.ic}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', color: C.headline, fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em' }}>{it.t}</span>
            <span style={{ display: 'block', fontSize: 11, color: C.muteLight, marginTop: 2, fontWeight: 500 }}>{it.d}</span>
          </span>
          <ChevronRight size={15} color="#C8CCD3" style={{ flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}

// 처리 대기 칩 — 숫자를 앞세워 '무엇이 몇 건'인지 한 호흡에 읽히게 한다.
function QueueChip({ label, n, danger, onClick }) {
  const col = danger ? C.red : C.inkSoft;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '6px 10px 6px 8px', borderRadius: 9,
        border: `1px solid ${C.line}`, background: C.panel,
        cursor: 'pointer', fontFamily: FONT_STACK,
        transition: 'background .14s ease, border-color .14s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.borderColor = '#D7DAE0'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.line; }}
    >
      <span style={{
        minWidth: 20, height: 20, padding: '0 5px', borderRadius: 6,
        background: danger ? C.red : C.headline, color: '#fff',
        fontSize: 11.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontVariantNumeric: 'tabular-nums',
      }}>{n}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: col, letterSpacing: '-0.01em' }}>{label}</span>
      <ChevronRight size={13} color="#C8CCD3" />
    </button>
  );
}

// 공통: 큰 KPI 카드
function BigStat({ label, value, sub, color }) {
  return (
    <Card padding={18} style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 11.5, color: C.mute, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 5, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4, lineHeight: 1.45 }}>{sub}</div>}
    </Card>
  );
}

// ───────── B2G: 공공 성과·납품 ─────────
function CoordB2G({ state, showToast }) {
  const ps = state.participants || [];
  const seniors = ps.filter(p => p.type === 'senior');
  // 어르신별 실제 미신청(사각지대) 복지를 어드바이저 규칙으로 산출
  const seniorGaps = seniors.map(p => {
    const recs = aiWelfare({ age: +p.age || 0, alone: true, income: '기초연금', digitalWeak: true, careNeed: false, familyCareYouth: false, gets: [] });
    const gaps = recs.filter(r => r.gap);
    return { p, gaps, names: gaps.slice(0, 2).map(g => g.name) };
  });
  const totalGaps = seniorGaps.reduce((sum, x) => sum + x.gaps.length, 0);
  const gapList = seniorGaps.slice(0, 5);
  const link = [
    ['행복이음(차세대 사회보장정보시스템)', '대상자·개인별지원계획 연계', '연동 준비'],
    ['통합돌봄(2026.3 시행)', '일상생활돌봄·가족지원 실행도구', '연동 준비'],
    ['복지로·보조금24', 'AI 복지 어드바이저 추천 근거', '연계'],
    ['사회서비스 전자바우처', '제공기관 등록·이용 정산', '준비'],
    ['광주상생카드·경찰청', '상품권 자동발급·범죄경력 조회', '연동'],
  ];
  return (
    <div>
      <PageHeader title="공공 성과·납품 (B2G)" subtitle="지자체가 도입 즉시 보는 효과·ROI와, 기존 복지 시스템 연계 현황입니다. 통합돌봄을 ‘바로 굴릴’ 실행 도구로 납품합니다." right={<Badge color={C.blue} soft={C.blueSoft}>지자체 · 통합돌봄</Badge>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <BigStat label="전산 도입비 (자체구축 대비)" value="70%↓" sub="구축 0 · 사용료형 SaaS" color={C.blue} />
        <BigStat label="통합돌봄 1인 행정비" value="40%↓" sub="매칭·정산·보고 자동화" color={C.sage} />
        <BigStat label="복지 사각지대 발굴" value={`${totalGaps}건`} sub={`어드바이저 자동 탐지 · 어르신 ${seniors.length}명`} color={C.brand} />
        <BigStat label="SROI 사회적 투자수익" value="1 : 2.3" sub="고립·돌봄공백 절감 추정" color={C.gold} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, marginTop: 16 }} className="b2ggrid">
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>기존 복지 플랫폼 연계 현황</div>
          <div style={{ fontSize: 11.5, color: C.mute, marginBottom: 12 }}>새 시스템 강요 없이, 지자체가 쓰는 시스템 위에 얹힙니다.</div>
          {link.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < link.length - 1 ? `1px solid ${C.borderSoft}` : 'none' }}>
              <ShieldCheck size={15} style={{ color: C.blue, flex: '0 0 auto' }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{l[0]}</div><div style={{ fontSize: 11, color: C.mute }}>{l[1]}</div></div>
              <Badge color={C.sage} soft={C.sageSoft} size="sm">{l[2]}</Badge>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>사각지대 발굴 리스트</div>
          <div style={{ fontSize: 11.5, color: C.mute, marginBottom: 12 }}>받을 수 있는데 못 받는 어르신을 먼저 찾습니다.</div>
          {gapList.map((g, i) => (
            <div key={g.p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < gapList.length - 1 ? `1px solid ${C.borderSoft}` : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: C.lavenderSoft, color: C.lavender, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{g.p.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700 }}>{g.p.name} · {g.p.age}세</div><div style={{ fontSize: 11, color: C.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>미신청 {g.gaps.length}건 · {g.names.join(' · ')}</div></div>
              <Badge color={C.brand} soft={C.brandSoft} size="sm">발굴</Badge>
            </div>
          ))}
          <Button variant="brand" size="sm" fullWidth style={{ marginTop: 12 }} onClick={() => showToast && showToast('지자체 제출용 운영보고서를 생성했습니다', 'success')}>지자체 운영보고서 자동 생성</Button>
        </Card>
      </div>

      <Card style={{ marginTop: 14, background: C.blueSoft, border: `1px solid ${C.blue}33` }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.blue, marginBottom: 6 }}>도입 효과 한 줄</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>인력 채용·전산 구축보다 <b>저렴한 사용료</b>로, 이미 잡힌 돌봄 예산으로 <b>바로 시작</b>합니다. ‘세대를 잇는 마을 돌봄’이 주민에게 보여줄 <b>성과</b>가 됩니다. 진입은 ① 사회서비스 바우처 → ② 플랫폼 사용료 → ③ 민간위탁 순.</div>
      </Card>
    </div>
  );
}

// ───────── B2B: 기업·기관 복지 ─────────
function CoordB2B({ state, showToast }) {
  const ps = state.participants || [];
  const trios = (state.matches || []).filter(m => m.status === 'active').length;
  const esg = [
    ['세대통합 활동', `${(state.activity_logs || []).filter(l => l.approved).length}회`, C.sage],
    ['참여 세대', '청년·어르신·아동', C.lavender],
    ['지역상품권 환원', '활동비 100% 지역경제', C.gold],
    ['임직원 가족 돌봄', '돌봄 공백 해소', C.peach],
  ];
  return (
    <div>
      <PageHeader title="기업·기관 복지 (B2B)" subtitle="임직원 가족 돌봄을 턴키로 운영하고, ‘진짜 ESG 스토리’를 성과로 리포트합니다. 복지관·어린이집 등 기관 운영에도 그대로 적용됩니다." right={<Badge color={C.sage} soft={C.sageSoft}>기업 · 복지재단</Badge>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <BigStat label="핵심인력 이직 방지 ROI" value="5×+" sub="1인 대체비용 대비 복지비" color={C.sage} />
        <BigStat label="운영 부담" value="0" sub="모집·매칭·운영 이음이 대행" color={C.blue} />
        <BigStat label="활성 트리오" value={`${trios}조`} sub="임직원 가족 연결" color={C.peach} />
        <BigStat label="ESG 사회가치" value="정량 리포트" sub="활동·세대·환원 지표" color={C.gold} />
      </div>
      <Card style={{ marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>ESG 성과 리포트 (요약)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {esg.map((e, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 11, padding: '13px 14px', borderLeft: `4px solid ${e[2]}` }}>
              <div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>{e[0]}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 3 }}>{e[1]}</div>
            </div>
          ))}
        </div>
        <Button variant="success" size="sm" style={{ marginTop: 14 }} onClick={() => showToast && showToast('기업 ESG 성과 리포트(PDF 초안)를 생성했습니다', 'success')}>ESG 리포트 생성</Button>
      </Card>
      <Card style={{ marginTop: 14, background: C.sageSoft, border: `1px solid ${C.sage}33` }}>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}><b>B2B 패키지</b> — 회사는 신청만, 모집·매칭·운영·정산은 이음이 턴키로. 직원이 가족 걱정을 덜어 <b>이직이 줄고</b> 만족도가 오릅니다. 복지관·어린이집은 ‘기존 사업 강화’로 도입.</div>
      </Card>
    </div>
  );
}

// ───────── 전역 플로팅 복지 어드바이저 (우측하단) ─────────
function WelfareFab({ role }) {
  const [open, setOpen] = useState(false);
  const [pf, setPf] = useState({ age: 73, alone: true, income: '저소득', digitalWeak: true, careNeed: false, familyCareYouth: false, gets: [] });
  const [run, setRun] = useState(false);
  useBodyScrollLock(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const res = run ? aiWelfare(pf) : [];
  const big = role === 'senior';
  const bottom = role === 'coordinator' ? 24 : 86;
  const cks = [['alone', '혼자 살아요'], ['digitalWeak', '스마트폰이 어려워요'], ['careNeed', '아프거나 외로워요'], ['familyCareYouth', '가족을 돌봐요(청년)']];
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="복지 어드바이저" style={{ position: 'fixed', right: 22, bottom, zIndex: 9000, display: 'flex', alignItems: 'center', gap: 8, background: C.lavender, color: '#fff', border: 'none', borderRadius: 999, padding: big ? '16px 22px' : '13px 18px', fontFamily: FONT_STACK, fontWeight: 800, fontSize: big ? 16 : 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(127,111,160,.45)' }}>
        <Sparkles size={big ? 22 : 18} /> 복지 찾기
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9400, background: 'rgba(26,24,20,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div role="dialog" aria-modal="true" aria-label="복지 어드바이저" onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, width: '100%', maxWidth: 460, maxHeight: '86vh', overflowY: 'auto', padding: 22, fontFamily: FONT_STACK }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 800, color: C.lavender }}><Sparkles size={20} /> 복지 어드바이저</div>
              <button onClick={() => setOpen(false)} aria-label="닫기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.mute }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, marginBottom: 14 }}>몇 가지만 고르면 <b>받을 수 있는 복지</b>를 찾아드려요. 가입 없이 바로요.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft }}>나이</span>
              <input type="number" value={pf.age} onChange={e => { setPf({ ...pf, age: +e.target.value }); setRun(false); }} style={{ width: 90, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.border}`, fontFamily: FONT_STACK, fontSize: 15 }} />
              <span style={{ fontSize: 13, color: C.mute }}>세</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
              {cks.map(([k, t]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, cursor: 'pointer', color: C.inkSoft, padding: '6px 0' }}>
                  <input type="checkbox" checked={pf[k]} onChange={e => { setPf({ ...pf, [k]: e.target.checked, income: k === 'alone' && e.target.checked ? '저소득' : pf.income }); setRun(false); }} style={{ width: 18, height: 18 }} />{t}
                </label>
              ))}
            </div>
            <Button variant="brand" fullWidth onClick={() => setRun(true)} style={{ background: C.lavender, border: 'none' }}>복지 찾기</Button>
            {run && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.lavender, marginBottom: 9 }}>받을 수 있는 복지 {res.length}건</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {res.map((x, i) => (
                    <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px' }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{x.name}</div>
                      <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4, lineHeight: 1.5 }}>{x.why}</div>
                      <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}><b style={{ color: C.gold }}>혜택</b> {x.benefit} · <b style={{ color: C.blue }}>신청</b> {x.where}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: C.mute, marginTop: 10, lineHeight: 1.5 }}>※ 추정 결과예요. 실제 신청·심사로 확정되며, 코디네이터가 신청을 도와드려요.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ───────── 소비자 B2C 구독 (약화 · 맨 아래) ─────────
function ConsumerPricing() {
  const tiers = [
    { name: '무료', price: '무료', sub: '동네 품앗이 기본', feats: ['트리오 매칭·활동 일지', '봉사시간·상생카드 보상'], hot: false, c: C.mute },
    { name: '안심 베이직', price: '₩19,900', sub: '맞벌이 보호자에게', feats: ['실시간 체크인·위치 알림', '주간 활동 리포트'], hot: true, c: C.brand },
    { name: '안심 프리미엄', price: '₩39,900', sub: '가장 깊은 안심', feats: ['우선 매칭', '월간 성장 리포트·상담'], hot: false, c: C.lavender },
  ];
  return (
    <Card padding={18} style={{ marginTop: 18, background: C.cream, border: `1px dashed ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.inkSoft }}>참여는 무료, 더 깊은 안심은 선택</div>
        <Badge color={C.mute} soft={C.borderSoft} size="sm">선택 · 베타 예정</Badge>
      </div>
      <div style={{ fontSize: 11, color: C.mute, marginBottom: 12 }}>기본 활동은 누구나 무료입니다. 공공·기업 지원 시 구독도 무료로 제공돼요.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 9, opacity: 0.92 }}>
        {tiers.map(t => (
          <div key={t.name} style={{ border: `1px solid ${t.hot ? C.brand + '66' : C.border}`, borderRadius: 11, padding: '12px 13px', background: C.card }}>
            <div style={{ fontSize: 10.5, color: C.mute, fontWeight: 700 }}>{t.sub}</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: t.c, marginTop: 2 }}>{t.name}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, margin: '4px 0 8px' }}>{t.price}<span style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>{t.price !== '무료' ? ' /월' : ''}</span></div>
            {t.feats.map((f, i) => <div key={i} style={{ fontSize: 11, color: C.inkSoft, marginBottom: 4 }}>· {f}</div>)}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: C.mute, marginTop: 10 }}>구독료는 우산동 파일럿 가정 기준 예시이며, 시장조사상 개인 구독은 장기 옵션입니다(B2G·B2B 우선).</div>
    </Card>
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
  return (
    <Card padding={0} style={{ marginBottom: 18, overflow: 'hidden', border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', background: '#FF6B35', color: '#fff' }}>
        <Award size={18} />
        <div style={{ fontSize: 13.5, fontWeight: 800 }}>1365 자원봉사 실적 연계</div>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, background: 'rgba(255,255,255,.22)', padding: '3px 9px', borderRadius: 999 }}>공식 인정</span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 14 }}>
          <div><div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>인정 봉사시간</div><div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{hrs}<span style={{ fontSize: 12, color: C.mute }}>시간</span></div></div>
          <div><div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>봉사 마일리지</div><div style={{ fontSize: 22, fontWeight: 800, color: '#FF6B35' }}>{miles.toLocaleString('ko-KR')}<span style={{ fontSize: 12, color: C.mute }}>P</span></div></div>
          <div><div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>나이스(학생부) 연계</div><div style={{ fontSize: 14, fontWeight: 800, color: C.sage, marginTop: 4 }}><CheckCircle2 size={14} style={{ verticalAlign: 'middle' }} /> 연계 가능</div></div>
        </div>
        <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.55, marginBottom: 12 }}>이음 활동은 <b>1365 자원봉사 실적</b>으로 인정됩니다. 실적확인서를 발급해 대학·취업·학교생활기록부(나이스)에 활용하세요.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="brand" size="sm" icon={<Download size={14} />} onClick={async()=>{ const r=await EUM_API.v1365.issueCertificate(user.id); showToast ? showToast('실적확인서 발급 완료 · '+r.certNo,'success') : setView('settlement'); }}>실적확인서 발급</Button>
          <Button variant="secondary" size="sm" icon={<Search size={14} />} onClick={() => setView('discover')}>활동 찾기</Button>
        </div>
      </div>
    </Card>
  );
}

// 청년 — 활동 찾기(탐색·모집공고) : 케어닥식 카드 + 1365식 모집/실적
const DISCOVER_CATS = ['전체', '디지털코칭', '학습멘토', '정서돌봄', '동네기억'];
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
  const list = DISCOVER_LIST.filter(x => (cat === '전체' || x.cat === cat) && (q === '' || x.t.includes(q) || x.org.includes(q)));
  return (
    <div>
      <PageHeader title="활동 찾기" subtitle="우리 동네 세대 돌봄 활동을 직접 찾아 신청하세요. 참여하면 보상과 함께 1365 봉사시간이 쌓입니다." right={<Badge color={'#FF6B35'} soft={'#FFE9DF'}>1365 봉사실적 인정</Badge>} />

      {/* 임팩트 통계 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
        {[['내 누적 봉사시간', `${totalHours || 0}시간`, C.brand], ['이번 달 모집', `${DISCOVER_LIST.length}건`, C.sage], ['우리동네 활동가', '128명', C.lavender], ['상품권 환원', '지역경제 100%', C.gold]].map(([l, v, c]) => (
          <Card key={l} padding={14} style={{ borderTop: `3px solid ${c}` }}><div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>{l}</div><div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>{v}</div></Card>
        ))}
      </div>

      {/* 검색 + 카테고리 칩 */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.mute }} />
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="활동·기관 검색" aria-label="활동·기관 검색" style={{ width: '100%', padding: '11px 13px 11px 38px', borderRadius: 11, border: `1px solid ${C.border}`, fontFamily: FONT_STACK, fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {DISCOVER_CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ cursor: 'pointer', fontFamily: FONT_STACK, fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 999, border: `1px solid ${cat === c ? C.brand : C.border}`, background: cat === c ? C.brand : C.card, color: cat === c ? '#fff' : C.inkSoft }}>{c}</button>
        ))}
      </div>

      {/* 모집공고 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 13 }}>
        {list.map((x, i) => (
          <Card key={i} hoverable>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge color={C.sage} soft={C.sageSoft} size="sm">{x.cat}</Badge>
              {x.hot && <Badge color={C.brand} soft={C.brandSoft} size="sm">인기</Badge>}
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
            <Button variant="brand" size="sm" fullWidth onClick={() => showToast && showToast(`'${x.t}' 참여를 신청했습니다 · 코디 확인 후 확정`, 'success')}>참여 신청</Button>
          </Card>
        ))}
      </div>
      {list.length === 0 && <Card style={{ textAlign: 'center', color: C.mute, padding: 30 }}>조건에 맞는 활동이 없어요. 다른 검색어/카테고리를 시도해 보세요.</Card>}

      <Card style={{ marginTop: 16, background: '#FFF4EE', border: '1px solid #FFD9C7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Award size={16} style={{ color: '#FF6B35' }} /><div style={{ fontSize: 13, fontWeight: 800, color: '#D9531E' }}>참여하면 1365 봉사실적으로 인정</div></div>
        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6 }}>이음 활동시간은 <b>1365 자원봉사포털 실적</b>과 연계되어 실적확인서·나이스(학생부) 연계·봉사 마일리지로 쌓입니다. 단기 알바와 달리 <b>경력·스펙·보상</b>을 동시에.</div>
      </Card>
    </div>
  );
}

// ============================================================================
// 리치 메인화면(랜딩) 복원 — git f07a3ca 이식 (2026-06)
//  히어로·임팩트 카운터·3세대 후기·차별성·수익모델·FAQ·구독요금·벤치마킹
//  RL* 접두사로 네임스페이스(기존 컴포넌트 무충돌). 위치=광주 광산구 우산동
// ============================================================================
// --- 리치 랜딩 의존 헬퍼 복원(f07a3ca/settlement.js) ---
function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
const RL_SETTLE_DONE = new Set(['issued', 'paid', 'delivered']);
function isSettled(s) { return !!s && RL_SETTLE_DONE.has(s.status); }
function settleAmount(s) { return (s && (s.amount != null ? s.amount : s.amount_krw)) || 0; }
function settleHours(s) { return (s && (s.hours != null ? s.hours : s.total_hours)) || 0; }

function RLuseCountUp(target, duration = 950) {
  const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, '')) || 0;
  // 접근성(WCAG 2.3.3): 모션 최소화 설정 시 애니메이션 없이 최종값을 바로 표시.
  // 동시에 캡처/첫 페인트에서 지표가 0으로 보이는 문제를 방지한다.
  const [val, setVal] = useState(() => (prefersReducedMotion() ? num : 0));
  const raf = useRef();
  useEffect(() => {
    if (prefersReducedMotion()) { setVal(num); return; }
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
  }, [num, duration]);
  return val;
}

function RLCountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 950 }) {
  const v = RLuseCountUp(value, duration);
  const n = (decimals > 0 ? v : Math.round(v)).toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  // 숫자는 tabular-nums로 고정폭 — 카운트업 중 흔들림 방지(디자인 시스템)
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{n}{suffix}</span>;
}

function RLRing({ value, max = 100, size = 96, stroke = 9, color = C.brand, track = C.borderSoft, label, sublabel, duration = 1100 }) {
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
        {label != null && <div style={{ fontSize: Math.round(size * 0.28), fontWeight: 700, color: C.ink, fontFamily: FONT_STACK, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{label}</div>}
        {sublabel && <div style={{ fontSize: Math.max(10, Math.round(size * 0.12)), color: C.mute, marginTop: 3, fontWeight: 600 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function RLEyebrow({ children, color = C.ink }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
      <span style={{ width: 26, height: 2, background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: C.inkSoft, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{children}</span>
    </div>
  );
}

function RLRule({ color, style = {} }) {
  return <div style={{ height: 1, background: color || C.border, width: '100%', ...style }} />;
}

// 섹션 헤더 — 소프트 핀 키커 + 굵은 산세리프 제목 (토스·카카오 계열)
function RLSectionHead({ index, kicker, title, sub, action, align = 'center' }) {
  return (
    <div style={{ marginBottom: 34, textAlign: align, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {kicker && <div className="eum-kicker" style={{ marginBottom: 16 }}>{kicker}</div>}
      {title && <h2 className="eum-serif" style={{ margin: 0, fontSize: 'clamp(31px, 4.4vw, 48px)', fontWeight: 800, color: C.ink, lineHeight: 1.18 }}>{title}</h2>}
      {sub && <p style={{ margin: '17px 0 0', fontSize: 18.5, color: C.mute, lineHeight: 1.6, maxWidth: 660 }}>{sub}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

function RLHeroScene() {
  return (
    <svg viewBox="0 0 460 440" width="100%" style={{ display: 'block' }} role="img" aria-label="청년·어르신·아동 3세대가 함께 있는 모습">
      <rect x="0" y="0" width="460" height="440" fill="#FBF8F2" />
      {/* 배경 — 동네 */}
      <circle cx="402" cy="250" r="44" fill="#CBD9BC" />
      <circle cx="372" cy="280" r="30" fill="#D7E2CB" />
      <rect x="356" y="300" width="78" height="70" fill="#EADFce" opacity="0.7" />
      <path d="M352,300 L395,272 L438,300 Z" fill="#B9A7C2" opacity="0.7" />
      <circle cx="60" cy="250" r="34" fill="#D7E2CB" />
      <rect x="42" y="316" width="40" height="56" rx="6" fill="#EFE6D8" />
      <ellipse cx="62" cy="318" rx="22" ry="14" fill="#CBD9BC" />
      <line x1="20" y1="398" x2="440" y2="398" stroke="#E3D9C8" strokeWidth="2.5" />

      {/* 청년 */}
      <g className="eum-fig-a">
        <ellipse cx="150" cy="400" rx="13" ry="6" fill="#2B2722" />
        <ellipse cx="174" cy="400" rx="13" ry="6" fill="#2B2722" />
        <rect x="146" y="306" width="15" height="92" rx="7" fill="#2B2722" />
        <rect x="166" y="306" width="15" height="92" rx="7" fill="#2B2722" />
        <rect x="110" y="300" width="22" height="26" rx="4" fill="#D9C2A6" />
        <path d="M121,300 q0,-10 10,-10" fill="none" stroke="#B89A78" strokeWidth="3" />
        <rect x="113" y="224" width="15" height="78" rx="7" fill="#9FBE8E" />
        <path d="M120,216 C120,202 134,194 163,194 C192,194 206,202 206,216 L210,312 C180,326 146,326 116,312 Z" fill="#9FBE8E" />
        <path d="M150,196 L163,218 L176,196 Z" fill="#E8835E" />
        <path className="eum-wave" d="M198,224 q34,-4 52,16" fill="none" stroke="#9FBE8E" strokeWidth="15" strokeLinecap="round" />
        <rect x="156" y="172" width="14" height="26" fill="#F1C9A5" />
        <circle cx="163" cy="156" r="27" fill="#F1C9A5" />
        <path d="M137,156 C135,127 159,117 183,126 C190,129 191,141 188,151 C176,138 151,138 139,159 Z" fill="#2B2722" />
        <circle cx="156" cy="157" r="2.6" fill="#2B2722" />
        <circle cx="172" cy="157" r="2.6" fill="#2B2722" />
        <path d="M156,167 q7,6 14,0" fill="none" stroke="#2B2722" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="150" cy="164" r="4" fill="#F4B3A0" opacity="0.55" />
      </g>

      {/* 어르신 */}
      <g className="eum-fig-b">
        <ellipse cx="236" cy="400" rx="13" ry="6" fill="#3A352F" />
        <ellipse cx="262" cy="400" rx="13" ry="6" fill="#3A352F" />
        <rect x="232" y="312" width="16" height="86" rx="8" fill="#C67E4F" />
        <rect x="252" y="312" width="16" height="86" rx="8" fill="#C67E4F" />
        <path d="M208,238 C208,222 222,214 250,214 C278,214 292,222 292,238 L296,320 C266,332 234,332 204,320 Z" fill="#B6A9CE" />
        <rect x="200" y="244" width="14" height="70" rx="7" fill="#B6A9CE" />
        <rect x="286" y="244" width="14" height="70" rx="7" fill="#B6A9CE" />
        <path d="M236,216 q14,12 28,0 l-6,16 q-8,5 -16,0 Z" fill="#E8835E" />
        <rect x="243" y="196" width="14" height="22" fill="#EBC09B" />
        <circle cx="250" cy="180" r="26" fill="#EBC09B" />
        <path d="M224,180 C222,150 248,142 272,151 C281,155 282,170 277,180 C276,166 270,160 262,158 C268,168 266,176 262,180 C260,166 240,158 226,178 Z" fill="#CFCAD3" />
        <circle cx="243" cy="181" r="2.5" fill="#3A352F" />
        <circle cx="258" cy="181" r="2.5" fill="#3A352F" />
        <path d="M243,190 q7,5 14,0" fill="none" stroke="#3A352F" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="237" cy="187" r="4" fill="#E79A87" opacity="0.5" />
        <circle cx="265" cy="187" r="4" fill="#E79A87" opacity="0.5" />
      </g>

      {/* 아이 */}
      <g className="eum-fig-c">
        <ellipse cx="318" cy="398" rx="10" ry="5" fill="#5B4F6E" />
        <ellipse cx="338" cy="398" rx="10" ry="5" fill="#5B4F6E" />
        <rect x="315" y="344" width="12" height="54" rx="6" fill="#8C7FB0" />
        <rect x="331" y="344" width="12" height="54" rx="6" fill="#8C7FB0" />
        <path d="M302,300 C302,290 310,284 329,284 C348,284 356,290 356,300 L358,348 C338,356 320,356 300,348 Z" fill="#9FBE8E" />
        <rect x="304" y="308" width="52" height="7" fill="#EFE6D8" opacity="0.85" />
        <rect x="304" y="324" width="52" height="7" fill="#EFE6D8" opacity="0.85" />
        <rect x="296" y="300" width="12" height="44" rx="6" fill="#9FBE8E" />
        <rect x="350" y="300" width="12" height="44" rx="6" fill="#9FBE8E" />
        <rect x="349" y="332" width="20" height="22" rx="6" fill="#C68A5E" />
        <circle cx="354" cy="330" r="6" fill="#C68A5E" />
        <circle cx="364" cy="330" r="6" fill="#C68A5E" />
        <rect x="320" y="272" width="12" height="16" fill="#F1C9A5" />
        <circle cx="329" cy="258" r="22" fill="#F1C9A5" />
        <path d="M309,256 C308,236 328,228 348,236 C353,239 353,250 350,257 C340,246 320,246 311,259 Z" fill="#2B2722" />
        <circle cx="323" cy="259" r="2.6" fill="#2B2722" />
        <circle cx="337" cy="259" r="2.6" fill="#2B2722" />
        <path d="M322,267 q7,7 15,0" fill="none" stroke="#2B2722" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="318" cy="265" r="4" fill="#F4B3A0" opacity="0.6" />
        <circle cx="342" cy="265" r="4" fill="#F4B3A0" opacity="0.6" />
      </g>
    </svg>
  );
}

function RLImpactBand({ state }) {
  const d = useMemo(() => {
    const p = state.participants || [];
    const matches = (state.matches || []).filter((m) => m.status === 'active').length;
    const hours = (state.activity_logs || []).filter((l) => l.approved).reduce((s, l) => s + (l.hours || 0), 0);
    const surveys = state.surveys || [];
    const sat = surveys.length ? (surveys.reduce((s, x) => s + (x.satisfaction || 0), 0) / surveys.length) : 0;
    const cont = surveys.length ? Math.round(surveys.filter((x) => x.would_continue).length / surveys.length * 100) : 0;
    const settled = (state.settlements || []).filter(isSettled).reduce((s, x) => s + settleAmount(x), 0);
    return { people: p.length, matches, hours, sat: sat.toFixed(1), cont, settled };
  }, [state]);
  const tiles = [
    { icon: Users, color: C.sage, label: '참여 이웃', node: <RLCountUp value={d.people} suffix="명" /> },
    { icon: Heart, color: C.brand, label: '활성 트리오', node: <RLCountUp value={d.matches} suffix="쌍" /> },
    { icon: Clock, color: C.lavender, label: '누적 활동시간', node: <RLCountUp value={d.hours} suffix="시간" /> },
    { icon: Star, color: C.gold, label: '만족도', node: <span>{d.sat}<span style={{ fontSize: 14, color: C.mute }}> / 5.0</span></span> },
    { icon: TrendingUp, color: C.success, label: '지속의향', node: <RLCountUp value={d.cont} suffix="%" /> },
    { icon: Wallet, color: C.gold, label: '누적 보상', node: <span>{krw(d.settled)}</span> },
  ];
  const isMobile = useIsMobile(560);
  const isNarrow = useIsMobile(920);
  return (
    <Reveal>
      <div style={{ marginBottom: 72 }}>
        <RLSectionHead kicker="숫자로 보는 이음" title="이미 동네에서 일어나고 있어요" sub="2027 광주 광산구 우산동 파일럿 · 데모 시연용 샘플 데이터입니다." />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isNarrow ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: 12 }}>
          {tiles.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="eum-lift" style={{ background: C.card, borderRadius: 18, padding: '20px 18px 22px', boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', border: `1px solid ${C.borderSoft}` }}>
                <div style={{ display: 'inline-flex', padding: 9, borderRadius: 11, background: t.color + '18', marginBottom: 14 }}><Icon size={18} color={t.color} /></div>
                <div className="eum-serif" style={{ fontSize: 'clamp(22px, 2vw, 29px)', fontWeight: 800, color: C.ink, lineHeight: 1, whiteSpace: 'nowrap' }}>{t.node}</div>
                <div style={{ fontSize: 12.5, color: C.mute, fontWeight: 600, marginTop: 9 }}>{t.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

function RLTestimonialBand() {
  const items = [
    { role: 'youth', color: C.sage, soft: C.sageSoft, name: '김민준', sub: '청년 · 27세', quote: '할머니께 키오스크를 알려드렸는데, 다음엔 저한테 옛날 이야기를 들려주셨어요. 제가 더 배우고 가는 기분이에요.' },
    { role: 'senior', color: C.lavender, soft: C.lavenderSoft, name: '박순자', sub: '어르신 · 73세', quote: '혼자였던 집에 아이 웃음소리가 들려요. 다시 누군가에게 쓸모 있는 사람이 된 것 같아 하루가 기다려져요.' },
    { role: 'parent', color: C.peach, soft: C.peachSoft, name: '이서영', sub: '양육가정 · 유진 엄마', quote: '맞벌이라 늘 미안했는데, 유진이가 동네에 할머니랑 삼촌이 생겼다며 좋아해요. 마음이 놓여요.' },
  ];
  const isMobile = useIsMobile(720);
  return (
    <Reveal>
      <div style={{ marginBottom: 72, background: C.cream, borderRadius: 28, padding: isMobile ? '36px 22px' : '52px 48px', border: `1px solid ${C.borderSoft}` }}>
        <RLSectionHead kicker="이웃들의 이야기" title="3세대의 목소리" sub="이음으로 이어진 이웃들이 직접 전해온 이야기예요." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))', gap: 16 }}>
          {items.map((t, i) => (
            <div key={i} className="eum-lift" style={{ background: C.card, borderRadius: 20, padding: 26, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', border: `1px solid ${C.borderSoft}` }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[0, 1, 2, 3, 4].map((s) => <Star key={s} size={16} color={C.amber} fill={C.amber} strokeWidth={0} />)}
              </div>
              <div style={{ fontSize: 15.5, color: C.inkSoft, lineHeight: 1.72, marginBottom: 22, flex: 1, fontWeight: 500 }}>{t.quote}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingTop: 16, borderTop: `1px solid ${C.borderSoft}` }}>
                <Avatar type={t.role} name={t.name} color={t.color} size={42} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.mute, marginTop: 1 }}>{t.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function RLFaqBand() {
  const [open, setOpen] = useState(-1);
  const isMobile = useIsMobile(720);
  const faqs = [
    { q: '누가 신청할 수 있나요?', a: '광주 광산구 우산동에 사시는 청소년부터 어르신까지, 그리고 양육가정 누구나 신청할 수 있어요. 약 5분이면 충분해요.' },
    { q: '참여하는 데 비용이 드나요?', a: '참여비는 전혀 없어요. 오히려 활동에 따라 광주상생카드와 봉사시간으로 보상을 받습니다. 보호자 안심 케어 구독은 선택이에요.' },
    { q: '아이가 어른들과 만나는데 안전한가요?', a: '모든 참여자는 4단계 안전검증(면접·범죄경력·아동학대 전력 조회·추천인 확인)을 거치고, 대면 활동은 책임보험으로 보장돼요.' },
    { q: '어떻게 매칭되나요?', a: '거주지·생활 일정·관심사·안전 요소를 분석해 청년·어르신·아이 3인 트리오로 연결해 드려요. 코디네이터가 최종 확인합니다.' },
    { q: '보상은 어떻게 받나요?', a: '활동 기록이 승인되면 봉사시간과 광주상생카드 포인트로 자동 환산돼요. 1365 자원봉사 실적과도 연계됩니다.' },
    { q: '매칭까지 얼마나 걸리나요?', a: '신청과 안전검증을 마치면 보통 1~2주 안에 트리오를 제안해 드려요. 가능 시간과 동네가 가까울수록 더 빨라요.' },
    { q: '활동 중 문제가 생기면 어떻게 하나요?', a: '앱의 SOS 버튼이나 실시간 안전 공유로 코디네이터가 즉시 개입해요. 모든 활동은 책임보험으로 보장됩니다.' },
    { q: '안심 케어 구독은 꼭 해야 하나요?', a: '아니에요. 기본 참여와 매칭·활동 일지는 무료예요. 구독은 실시간 안전 알림·주간 리포트·우선 매칭이 필요한 보호자를 위한 선택이에요.' },
  ];
  return (
    <div style={{ marginBottom: 72 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.82fr 1.18fr', gap: isMobile ? 22 : 56, alignItems: 'start' }}>
        <div style={{ position: isMobile ? 'static' : 'sticky', top: 92 }}>
          <div className="eum-kicker" style={{ marginBottom: 16 }}>자주 묻는 질문</div>
          <h2 className="eum-serif" style={{ margin: 0, fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: C.ink, lineHeight: 1.22 }}>궁금한 점을<br />모았어요</h2>
          <p style={{ fontSize: 15.5, color: C.mute, lineHeight: 1.6, marginTop: 14, maxWidth: 330 }}>참여 전 가장 많이 묻는 질문들을 모았어요. 더 궁금한 점은 언제든 문의해 주세요.</p>
        </div>
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.borderSoft}`, boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', overflow: 'hidden' }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.borderSoft}` }}>
            <button type="button" aria-expanded={open === i} aria-controls={`faq-panel-${i}`} onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '18px 18px' : '20px 24px', border: 'none', background: open === i ? C.cream : 'transparent', cursor: 'pointer', fontFamily: FONT_STACK, textAlign: 'left', transition: 'background 0.2s ease' }}>
              <span style={{ flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>{f.q}</span>
              <span style={{ display: 'flex', width: 26, height: 26, borderRadius: '50%', background: open === i ? C.brand : C.borderSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s ease' }}>
                <ChevronDown size={16} color={open === i ? '#fff' : C.mute} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
              </span>
            </button>
            {open === i && <div id={`faq-panel-${i}`} role="region" aria-label={f.q} style={{ padding: isMobile ? '0 18px 20px' : '0 24px 22px', fontSize: 14.5, color: C.inkSoft, lineHeight: 1.74 }}>{f.a}</div>}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

function RLMoatBand() {
  const items = [
    { icon: Sparkles, color: C.brand, soft: C.brandSoft, tag: '특허 출원 준비 중', title: '3세대 트리오 매칭 엔진', desc: '거주 근접·생활 일정·관심 시너지·안전 적합·상호 보완 다섯 요소를 가중 점수화해 한 번에 3세대를 묶습니다. 한 명을 다른 한 명에게 붙이는 1:1 중개와는 구조가 달라요.' },
    { icon: ShieldCheck, color: C.blue, soft: C.blueSoft, tag: '아동 동반 필수 절차', title: '4단계 안전검증 · 책임보험 내장', desc: '면접·범죄경력·아동학대 전력·추천인 확인을 거치고, 모든 대면 활동은 책임보험으로 보장합니다. 미성년 보호자 5종 전자동의까지 시스템에 들어가 있어요.' },
    { icon: Wallet, color: C.gold, soft: C.goldSoft, tag: '지자체·1365 연계', title: '활동을 보상으로 잇는 정산', desc: '활동 기록이 봉사시간과 광주상생카드 보상으로 자동 환산·발급됩니다. 통합돌봄·자원봉사 행정과 맞물리는 정산 흐름이 이미 돌아갑니다.' },
  ];
  return (
    <div style={{ marginBottom: 72 }}>
      <RLSectionHead kicker="이음만의 것" title="따라 하기 어려운 세 가지" sub="아이디어가 아니라, 이미 작동하는 매칭·안전·정산 기술이 이음의 진입장벽이에요." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))', gap: 16 }}>
        {items.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="eum-lift" style={{ background: C.card, borderRadius: 20, padding: 28, boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', border: `1px solid ${C.borderSoft}` }}>
              <div style={{ display: 'inline-flex', padding: 13, borderRadius: 15, background: m.soft, marginBottom: 18 }}><Icon size={24} color={m.color} /></div>
              <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 700, color: m.color, background: m.soft, padding: '4px 10px', borderRadius: 999, marginBottom: 12 }}>{m.tag}</div>
              <div className="eum-serif" style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 10, lineHeight: 1.32 }}>{m.title}</div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.68 }}>{m.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RLRevenueModelBand() {
  const streams = [
    { icon: Award, color: C.sage, soft: C.sageSoft, badge: '공공 기반', title: '지자체 위탁 · 바우처', desc: '통합돌봄 위탁운영비와 사회서비스 바우처 정산이 매출의 토대. 공공 예산으로 초기 운영을 안정적으로 받칩니다.' },
    { icon: Heart, color: C.peach, soft: C.peachSoft, badge: '가족 구독', title: '안심 케어 구독', desc: '보호자 대상 월 구독 — 실시간 안전 알림, 활동 리포트, 우선 매칭. 공공 밖 민간 수요로 확장합니다.' },
    { icon: Wallet, color: C.gold, soft: C.goldSoft, badge: '거래 수수료', title: '매칭 · 정산 수수료', desc: '상생카드 정산과 제휴 서비스 연계에서 발생하는 수수료. 트리오가 늘수록 함께 커지는 매출이에요.' },
  ];
  return (
    <div style={{ marginBottom: 72 }}>
      <RLSectionHead kicker="어떻게 지속되나" title="정부와 함께하는 서비스 모델" sub="지자체 위탁·구독·수수료가 서로를 받쳐, 공공 지원이 끝나도 지속되도록 설계했어요." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
        {streams.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="eum-lift" style={{ background: C.card, borderRadius: 20, padding: 28, boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', border: `1px solid ${C.borderSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
                <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: s.soft }}><Icon size={20} color={s.color} /></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: s.soft, padding: '5px 12px', borderRadius: 999 }}>{s.badge}</span>
              </div>
              <div className="eum-serif" style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginBottom: 9, lineHeight: 1.32 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.68 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background: C.brandSoft, borderRadius: 18, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', padding: 10, borderRadius: 12, background: '#fff' }}><TrendingUp size={20} color={C.brand} /></div>
        <div style={{ flex: 1, minWidth: 240, fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6 }}>
          <strong style={{ color: C.brandDark }}>트리오 한 쌍이 늘 때마다 이익이 쌓이는 구조.</strong> 공공 위탁이 기반을 깔고, 구독·수수료가 마진을 더해 규모가 커질수록 자립도가 올라갑니다.
        </div>
      </div>
    </div>
  );
}

function RLBenchmarkBand() {
  const isMobile = useIsMobile(760);
  const models = [
    { flag: 'US', name: 'Foster Grandparent', country: '미국 · AmeriCorps', adopt: '어르신→아동 1:1 멘토 + 활동비 보상', limit: '두 세대(어르신·아동)만 연결' },
    { flag: 'NL', name: 'Humanitas Deventer', country: '네덜란드', adopt: '청년↔어르신 교류로 무료 거주 교환', limit: '주거 자원에 한정된 1:1 교환' },
    { flag: 'UK', name: 'The Cares Family', country: '영국 런던·맨체스터', adopt: '도시 청년↔어르신 외로움 해소', limit: '아동·양육가정은 포함되지 않음' },
    { flag: 'KR', name: '케어닥 · 자란다', country: '국내 돌봄 매칭', adopt: '앱으로 간편 매칭·일지 관리', limit: '대가 지불형 일방 돌봄 중개' },
  ];
  return (
    <div style={{ marginBottom: 72 }}>
      <RLSectionHead kicker="왜 이음인가" title="세계가 검증한 모델, 이음이 한 걸음 더" sub="해외에서 50년 넘게 검증된 세대통합 모델에, 모두가 놓쳤던 3세대가 동시에 주고받는 구조를 더했어요." />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
        {models.map((m, i) => (
          <div key={i} className="eum-lift" style={{ background: C.card, borderRadius: 20, padding: 24, boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', border: `1px solid ${C.borderSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 11, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 800, color: C.inkSoft, letterSpacing: '0.03em', flexShrink: 0 }}>{m.flag}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: C.mute }}>{m.country}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 9, padding: '9px 12px', background: C.sageSoft, borderRadius: 12 }}>
              <Check size={15} color={C.sage} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, fontWeight: 500 }}>{m.adopt}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '0 12px' }}>
              <span style={{ color: C.muteLight, fontWeight: 700, flexShrink: 0 }}>—</span>
              <span style={{ fontSize: 12.5, color: C.mute, lineHeight: 1.5 }}>{m.limit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="eum-anim-gradient" style={{ background: `linear-gradient(120deg, ${C.brand} 0%, ${C.brandDark} 55%, ${C.brand} 100%)`, borderRadius: 22, padding: 'clamp(26px, 4vw, 40px)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: `0 18px 40px -18px ${C.brand}88` }}>
        <div className="eum-float" style={{ background: 'rgba(255,255,255,0.18)', padding: 14, borderRadius: 16, display: 'flex', flexShrink: 0 }}>
          <Sparkles size={26} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="eum-serif" style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>이음 = 청년 · 어르신 · 아동 3세대 상호 품앗이</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>기존 모델은 두 세대의 일방 돌봄. 이음은 3세대가 동시에 서로 주고받고, 도운 만큼 모두에게 보상이 돌아가는 선순환 구조예요.</div>
        </div>
      </div>
    </div>
  );
}

function RLLoopInfographic() {
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

function RLPartnerStrip() {
  const partners = ['광주광역시', '광산구청', '광주창조경제혁신센터', '1365 자원봉사포털', '광주상생카드'];
  return (
    <div style={{ marginBottom: 64, textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.mute, marginBottom: 18 }}>함께하는 기관</div>
      <div className="eum-marquee-wrap">
        <div className="eum-marquee-track">
          {[...partners, ...partners].map((p, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 999, fontSize: 13.5, fontWeight: 700, color: C.inkSoft, boxShadow: '0 1px 3px -1px rgba(26,26,30,0.06)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <ShieldCheck size={14} color={C.brand} /> {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RLPricingBand() { return null; } // B2C 구독 섹션 제외(요청)

// 디바이스 목업 — 브라우저 프레임 (실제 스크린샷으로 교체 가능: shotSrc prop)
function RLDeviceBrowser({ children, url = 'eum-app.vercel.app', shotSrc }) {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: `1px solid ${C.border}`, boxShadow: '0 40px 80px -36px rgba(26,26,30,0.32)' }}>
      <div style={{ height: 40, background: C.cream, borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px' }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#F0625A' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#F6BE4F' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#43C95A' }} />
        <div style={{ marginLeft: 10, flex: 1, maxWidth: 300, height: 22, borderRadius: 7, background: '#fff', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', fontSize: 10.5, color: C.mute }}>
          <ShieldCheck size={10} color={C.sage} /> {url}
        </div>
      </div>
      {shotSrc
        ? <img src={shotSrc} alt="이음 운영 화면" loading="lazy" decoding="async" style={{ width: '100%', display: 'block' }} />
        : <div style={{ background: C.bg }}>{children}</div>}
    </div>
  );
}

// 코디네이터 대시보드 미니 목업 (실제 스크린샷 받기 전 임시 — 동일 디자인 토큰)
function RLCoordMock() {
  const trios = [
    { y: '김민준', s: '박순자', c: '유진', color: C.sage, status: '활동 중', sc: C.sage },
    { y: '이지원', s: '이병호', c: '도윤', color: C.lavender, status: '매칭 대기', sc: C.amber },
  ];
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.brand}, ${C.peach})` }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, lineHeight: 1 }}>코디네이터 대시보드</div>
            <div style={{ fontSize: 10, color: C.mute, marginTop: 3 }}>한가은 · 광주 광산구 우산동</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, background: C.sageSoft, padding: '4px 9px', borderRadius: 999 }}>운영 중</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 9, marginBottom: 13 }}>
        {[{ l: '신규 신청', v: '3', c: C.brand }, { l: '검증 대기', v: '2', c: C.amber }, { l: '활성 트리오', v: '1', c: C.sage }, { l: '이번 달 정산', v: '₩82.5만', c: C.gold }].map((s, i) => (
          <div key={i} style={{ flex: 1, background: '#fff', border: `1px solid ${C.borderSoft}`, borderRadius: 11, padding: '11px 12px' }}>
            <div style={{ fontSize: 9, color: C.mute, fontWeight: 700, marginBottom: 6, whiteSpace: 'nowrap' }}>{s.l}</div>
            <div className="eum-serif" style={{ fontSize: 17, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{s.v}</div>
            <div style={{ width: 14, height: 2, background: s.c, marginTop: 7, borderRadius: 1 }} />
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: `1px solid ${C.borderSoft}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink }}>오늘의 트리오</div>
          <div style={{ fontSize: 10, color: C.brand, fontWeight: 700 }}>전체 보기</div>
        </div>
        {trios.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i === 0 ? `1px solid ${C.borderSoft}` : 'none' }}>
            <div style={{ display: 'flex' }}>
              {[t.color, C.lavender, C.peach].map((c, j) => (
                <div key={j} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: j === 0 ? 0 : -8 }} />
              ))}
            </div>
            <div style={{ flex: 1, fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>{t.y} · {t.s} · {t.c}</div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: t.sc, background: t.sc + '1c', padding: '3px 8px', borderRadius: 999 }}>{t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RLPhoneMock() {
  return (
    <div style={{ width: 188, borderRadius: 30, background: C.ink, padding: 7, boxShadow: '0 40px 70px -30px rgba(26,26,30,0.45)' }}>
      <div style={{ borderRadius: 24, overflow: 'hidden', background: C.bg }}>
        <div style={{ background: `linear-gradient(135deg, ${C.brand}, ${C.brandDark})`, padding: '16px 15px 18px', color: '#fff' }}>
          <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>안심 케어</div>
          <div className="eum-serif" style={{ fontSize: 15, fontWeight: 800, marginTop: 3 }}>유진이는 지금 활동 중</div>
          <div style={{ fontSize: 9.5, opacity: 0.85, marginTop: 4 }}>박순자 어르신 · 김민준 청년과 함께</div>
        </div>
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ t: '14:00 하원 · 안전 도착', c: C.sage }, { t: '14:30 함께 간식·숙제', c: C.brand }, { t: '15:30 활동 사진 도착', c: C.lavender }].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: '9px 10px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.c, flexShrink: 0 }} />
              <span style={{ fontSize: 9.5, color: C.inkSoft, fontWeight: 600 }}>{r.t}</span>
            </div>
          ))}
          <div style={{ background: C.sageSoft, borderRadius: 10, padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <ShieldCheck size={13} color={C.sage} />
            <span style={{ fontSize: 9.5, color: C.sage, fontWeight: 700 }}>책임보험·안전검증 적용 중</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const AX_ROWS_HTML = `<div class="axrow">
  <div class="txt"><span class="tag">AI 복지 콜봇</span><h3>말로 신청하는 복지</h3><p>어르신이 말씀만 하시면 기초연금·돌봄을 음성으로 신청·안내합니다. 복잡하면 담당자에게 즉시 연결됩니다.</p></div>
  <div class="axphone"><div class="axsc">
    <div class="axnotch"></div>
    <div class="axstat"><span>9:41</span><span class="r"><span class="bars"><i style="height:5px"></i><i style="height:7px"></i><i style="height:9px"></i><i style="height:11px"></i></span><span class="batt"></span></span></div>
    <div class="axhd"><span class="bk">‹</span><img class="ico" src="/tobe/ieum_icon_1024.png" alt="이음"><span class="tt">복지 상담 전화<small>어르신 음성 복지 신청</small></span></div>
    <div class="axbd" style="text-align:center;">
      <div style="font-size:20px; font-weight:800; margin:2px 0 4px;">말씀만 하세요</div>
      <div style="font-size:12px; color:var(--sub); margin-bottom:18px;">복지 신청·안내를 도와드려요</div>
      <div class="axmic" style="width:92px; height:92px; border-radius:50%; background:var(--coral); margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:38px;">🎤</div>
      <div class="axlisten" style="font-size:12px; color:var(--coral); font-weight:700; margin-bottom:16px;">● 듣고 있어요…</div>
      <div style="background:var(--coral-soft); color:var(--coral-d); border-radius:12px; padding:9px 12px; font-size:12px; display:inline-block; margin-bottom:10px;">기초연금 신청하고 싶어요</div>
      <div style="background:#fff; border:1px solid #f0e7dd; border-radius:12px; padding:10px 12px; font-size:12px; color:var(--sub); text-align:left;">네, 기초연금 신청을 도와드릴게요. 생년월일을 말씀해 주세요.</div>
    </div>
  </div></div>
</div>
<div class="axrow rev">
  <div class="axphone"><div class="axsc">
    <div class="axnotch"></div>
    <div class="axstat"><span>9:41</span><span class="r"><span class="bars"><i style="height:5px"></i><i style="height:7px"></i><i style="height:9px"></i><i style="height:11px"></i></span><span class="batt"></span></span></div>
    <div class="axhd"><span class="bk">‹</span><img class="ico" src="/tobe/ieum_icon_1024.png" alt="이음"><span class="tt">복지 서비스 시작<small>무엇을 도와드릴까요?</small></span></div>
    <div class="axbd">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:9px;">
        <div class="axtile"><div class="e">❤️</div><div class="l">돌봄 신청</div></div>
        <div class="axtile"><div class="e">📅</div><div class="l">방문 예약</div></div>
        <div class="axtile"><div class="e">💊</div><div class="l">복지 정보</div></div>
        <div class="axtile"><div class="e">🍚</div><div class="l">식사·배달</div></div>
        <div class="axtile"><div class="e">🚗</div><div class="l">교통 지원</div></div>
        <div class="axtile"><div class="e">🎧</div><div class="l">상담 연결</div></div>
      </div>
      <div class="axbtn" style="margin-top:12px;">상담사 문자 받기</div>
    </div>
  </div></div>
  <div class="txt"><span class="tag">보이는 ARS</span><h3>세대별 맞춤 화면</h3><p>문자·웹·D-ARS로 어르신·청년 눈높이에 맞춘 복지 상담 창구를 제공합니다.</p></div>
</div>
<div class="axrow">
  <div class="txt"><span class="tag">AI 안전 도우미</span><h3>위험 신호 먼저 감지</h3><p>활동 대화를 분석해 건강·고립 위험을 감지하고, 코디네이터에게 즉시 연계합니다.</p></div>
  <div class="axphone"><div class="axsc">
    <div class="axnotch"></div>
    <div class="axstat"><span>9:41</span><span class="r"><span class="bars"><i style="height:5px"></i><i style="height:7px"></i><i style="height:9px"></i><i style="height:11px"></i></span><span class="batt"></span></span></div>
    <div class="axhd"><span class="bk">‹</span><img class="ico" src="/tobe/ieum_icon_1024.png" alt="이음"><span class="tt">AI 안심 케어<small>이상 징후 감지</small></span></div>
    <div class="axbd">
      <div style="background:#fbeaea; border:1px solid #f2c9c9; border-radius:13px; padding:11px 13px; margin-bottom:12px;">
        <div style="font-size:13px; font-weight:700; color:#c0392b;">⚠ 이상 징후 감지 · 위험</div>
        <div style="font-size:11px; color:#a15b5b; margin-top:2px;">식사 이슈 · 활동량 저하 · 위험도 높음</div>
      </div>
      <div class="axrowc"><span class="ic">🎧</span><div><b>코디네이터 즉시 연결</b><small>지금 바로 도와드려요</small></div></div>
      <div class="axrowc"><span class="ic">🏠</span><div><b>긴급 방문 요청</b><small>담당자에게 전달</small></div></div>
      <div class="axrowc"><span class="ic">🔔</span><div><b>가족에게 알림</b><small>보호자에게 상황 알림</small></div></div>
      <div style="text-align:center; font-size:11px; color:var(--coral); font-weight:700; margin-top:8px;">응급 상황 시 119 자동 연결</div>
    </div>
  </div></div>
</div>`;
const PROD_HTML = `<div class="txt">
  <div class="kick">직접 둘러보기</div>
  <h2>담당자는 한 화면에서,<br><span class="ac">모두</span>를 돌봅니다</h2>
  <p style="font-size:17px; color:var(--sub); margin-top:14px;">신청·검증·매칭·활동·안전·정산·실적보고까지. AI가 최적의 3세대 트리오를 추천하고, 코디네이터는 한 곳에서 운영합니다.</p>
  <div class="steps">
    <div class="step"><div class="n">01</div><h3>5분 신청</h3><p>동네·시간·관심사만 입력</p></div>
    <div class="step"><div class="n">02</div><h3>4단계 안전검증</h3><p>면접·경력·전력·추천인</p></div>
    <div class="step"><div class="n">03</div><h3>트리오 매칭</h3><p>청년·어르신·아동 연결</p></div>
  </div>
</div>
<div class="win">
  <div class="bar"><i></i><i></i><i></i><span class="url">이음 · 코디네이터 · 매칭 보드</span></div>
  <div class="mbwrap">
    <div class="mbtop">
      <div><div class="mbtitle">매칭 보드</div><div class="mbsub">활동 중 3건 · 제안 1건</div></div>
      <span class="mbai">✨ AI 매칭 추천</span>
    </div>
    <div class="mbgrid">
      <div class="mbcard">
        <div class="mbhd"><span class="mbid">● M001</span><span class="mbfit">적합도 98%</span></div>
        <div class="mbavs">
          <div><div class="av" style="background:var(--green-soft);">🧑</div><div class="nm">김민준</div><div class="rl">청년</div></div>
          <div><div class="av" style="background:var(--purple-soft);">👵</div><div class="nm">박순자</div><div class="rl">어르신</div></div>
          <div><div class="av" style="background:var(--coral-soft);">🧒</div><div class="nm">김유진</div><div class="rl">아동</div></div>
        </div>
        <div class="mbft"><span>⏱ 15h · 10회</span><span>2027.05.01</span></div>
      </div>
      <div class="mbcard">
        <div class="mbhd"><span class="mbid">● M002</span><span class="mbfit">적합도 95%</span></div>
        <div class="mbavs">
          <div><div class="av" style="background:var(--green-soft);">🧑</div><div class="nm">이지원</div><div class="rl">청년</div></div>
          <div><div class="av" style="background:var(--purple-soft);">🧓</div><div class="nm">김복례</div><div class="rl">어르신</div></div>
          <div><div class="av" style="background:var(--coral-soft);">👧</div><div class="nm">한도윤</div><div class="rl">아동</div></div>
        </div>
        <div class="mbft"><span>⏱ 10.5h · 7회</span><span>2027.05.01</span></div>
      </div>
    </div>
    <div class="mbwait"><span>매칭 대기 · 미배정 1명</span><span class="mbwaitp">👵 정금자 · 75세 · 요리</span></div>
  </div>
</div>`;
const KAKAO_PHONE_HTML = `<div class="scr kk">
  <div class="kkTop">
    <span class="bk">‹</span>
    <img class="ci" src="/tobe/ieum_icon_1024.png" alt="이음 채널">
    <div class="nm">이음 돌봄<small>채널 · 공식</small></div>
    <div class="sp"><span>🔍</span><span>☰</span></div>
  </div>
  <div class="chat">
    <div class="day"><span>오늘</span></div>
    <div class="kmsg">
      <img class="kav" src="/tobe/ieum_icon_1024.png" alt="">
      <div><div class="kwho">이음 돌봄</div><div class="kbubble">안녕하세요! 이음 돌봄 채널이에요 😊<br>무엇을 도와드릴까요?</div></div>
    </div>
    <div class="kmsg">
      <img class="kav" src="/tobe/ieum_icon_1024.png" alt="">
      <div class="krich">
        <div class="krimg"><img src="/tobe/hero_illust.png" alt="이웃 돌봄"></div>
        <div class="krb"><div class="krt">이웃과 함께하는 돌봄</div><div class="krd">필요한 돌봄을 신청하고, 나눈 시간을 적립받으세요.</div></div>
        <div class="krbtns"><a>💛 돌봄 신청하기</a><a>⏱ 내 적립 시간</a><a>❓ 자주 묻는 질문</a></div>
      </div>
    </div>
    <div class="kquicks"><span>돌봄 신청</span><span>적립 확인</span><span>자주 묻는 질문</span></div>
  </div>
  <div class="kInput"><span class="plus">＋</span><div class="kbox">메시지 입력</div><span class="ksnd">↑</span></div>
</div>`;
const TOBE_CSS = `.eum-tobe{--ink:#241d17;--paper:#fff;--cream:#fbf7f2;--cream2:#f4ede4;--coral:#FC5028;--coral-d:#D63C18;--coral-soft:#FFE4DC;--green:#4b7a52;--green-soft:#e9f1e7;--purple:#6a5aa0;--purple-soft:#efeaf6;--clay:#9a6a52;--sub:#5f564d;--mut:#9b9186;--line:#eee6dc;word-break:keep-all;-webkit-font-smoothing:antialiased;}
.eum-tobe *{box-sizing:border-box;}
.eum-tobe .kick{font-size:13px;font-weight:700;color:var(--coral);letter-spacing:1.4px;text-transform:uppercase;margin-bottom:16px;}
.eum-tobe h2{font-size:clamp(31px,3.9vw,48px);line-height:1.14;font-weight:800;letter-spacing:-1.1px;margin:0;color:var(--ink);}
.eum-tobe h2 .ac,.eum-tobe .ac{color:var(--coral);}
.eum-tobe .txt p{text-wrap:pretty;}
.eum-tobe .win{border-radius:16px;overflow:hidden;border:1px solid var(--line);box-shadow:0 12px 32px rgba(36,29,23,.09);background:#fff;width:100%;}
.eum-tobe .win .bar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f6f2ec;border-bottom:1px solid var(--line);}
.eum-tobe .win .bar i{width:10px;height:10px;border-radius:50%;background:#dcd4c9;}
.eum-tobe .win .bar .url{margin-left:10px;font-size:12px;color:var(--mut);background:#fff;border:1px solid var(--line);border-radius:8px;padding:4px 12px;}
.eum-tobe .axrows{display:grid;gap:56px;margin-top:8px;}
.eum-tobe .axrow{display:grid;grid-template-columns:1fr 1.12fr;gap:56px;align-items:center;}
.eum-tobe .axrow.rev{grid-template-columns:1.12fr 1fr;}
.eum-tobe .axrow .tag{display:inline-block;font-size:12px;font-weight:700;color:var(--coral-d);background:var(--coral-soft);padding:5px 12px;border-radius:999px;margin-bottom:12px;}
.eum-tobe .axrow h3{font-size:23px;font-weight:800;letter-spacing:-.6px;margin-bottom:8px;color:var(--ink);}
.eum-tobe .axrow p{font-size:16px;color:var(--sub);}
.eum-tobe .axphone{width:min(300px,100%);margin:0 auto;background:#1c1712;border-radius:46px;padding:8px;box-shadow:0 30px 70px rgba(36,29,23,.2),inset 0 0 0 2px #3a2c22;}
.eum-tobe .axsc{background:#faf3ee;border-radius:38px;overflow:hidden;position:relative;min-height:544px;}
.eum-tobe .axnotch{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:104px;height:20px;background:#1c1712;border-radius:12px;z-index:6;}
.eum-tobe .axstat{display:flex;justify-content:space-between;align-items:center;padding:11px 22px 3px;font-size:12px;font-weight:700;color:var(--ink);}
.eum-tobe .axstat .r{display:inline-flex;align-items:center;gap:6px;}
.eum-tobe .axstat .bars{display:inline-flex;gap:2px;align-items:flex-end;}
.eum-tobe .axstat .bars i{width:3px;background:var(--ink);border-radius:1px;}
.eum-tobe .axstat .batt{display:inline-block;width:20px;height:11px;border:1.5px solid var(--ink);border-radius:3px;position:relative;}
.eum-tobe .axstat .batt::after{content:'';position:absolute;left:1.5px;top:1.5px;bottom:1.5px;width:68%;background:var(--ink);border-radius:1px;}
.eum-tobe .axhd{background:#fff;padding:8px 15px 11px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f2e9df;}
.eum-tobe .axhd .bk{font-size:19px;color:#a99e93;}
.eum-tobe .axhd .ico{width:26px;height:26px;border-radius:8px;object-fit:cover;flex:none;display:block;}
.eum-tobe .axhd .tt{font-size:14px;font-weight:700;line-height:1.15;color:var(--ink);}
.eum-tobe .axhd .tt small{display:block;font-size:10px;color:var(--mut);font-weight:500;}
.eum-tobe .axbd{padding:18px 16px 22px;}
.eum-tobe .axtile{background:#fff;border:1px solid #f0e7dd;border-radius:12px;padding:12px 8px;text-align:center;}
.eum-tobe .axtile .e{font-size:20px;}
.eum-tobe .axtile .l{font-size:12px;font-weight:700;margin-top:5px;color:var(--ink);}
.eum-tobe .axrowc{background:#fff;border:1px solid #f0e7dd;border-radius:13px;padding:11px 12px;margin-bottom:9px;display:flex;align-items:center;gap:10px;}
.eum-tobe .axrowc .ic{width:34px;height:34px;border-radius:9px;background:var(--coral-soft);display:flex;align-items:center;justify-content:center;font-size:16px;flex:none;}
.eum-tobe .axrowc b{font-weight:700;font-size:13px;color:var(--ink);}
.eum-tobe .axrowc small{display:block;color:var(--mut);font-size:11px;}
.eum-tobe .axbtn{background:var(--coral);color:#fff;text-align:center;border-radius:12px;padding:12px;font-weight:700;font-size:14px;margin-top:4px;}
.eum-tobe .prod{display:grid;grid-template-columns:1fr 1.15fr;gap:60px;align-items:center;}
.eum-tobe .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px;}
.eum-tobe .step{padding:0 22px;}
.eum-tobe .step .n{font-family:"Fraunces",serif;font-size:42px;font-weight:500;color:var(--coral);line-height:1;}
.eum-tobe .step h3{font-size:19px;font-weight:700;margin:12px 0 6px;color:var(--ink);}
.eum-tobe .step p{font-size:14px;color:var(--sub);}
.eum-tobe .step:not(:last-child){border-right:1px solid var(--line);}
.eum-tobe .mbwrap{background:#faf7f2;padding:20px;}
.eum-tobe .mbtop{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.eum-tobe .mbtitle{font-size:17px;font-weight:800;color:var(--ink);}
.eum-tobe .mbsub{font-size:12px;color:var(--mut);margin-top:2px;}
.eum-tobe .mbai{background:var(--coral);color:#fff;font-size:12px;font-weight:700;padding:8px 14px;border-radius:10px;}
.eum-tobe .mbgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.eum-tobe .mbcard{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;}
.eum-tobe .mbhd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.eum-tobe .mbid{font-size:13px;font-weight:700;color:var(--ink);}
.eum-tobe .mbfit{font-size:11px;font-weight:700;color:#0f8a3c;background:#e8f6ec;padding:3px 9px;border-radius:999px;}
.eum-tobe .mbavs{display:flex;justify-content:space-around;text-align:center;}
.eum-tobe .mbavs .av{width:40px;height:40px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:19px;}
.eum-tobe .mbavs .nm{font-size:12px;font-weight:700;margin-top:5px;color:var(--ink);}
.eum-tobe .mbavs .rl{font-size:10px;color:var(--mut);}
.eum-tobe .mbft{display:flex;justify-content:space-between;font-size:11px;color:var(--mut);margin-top:12px;padding-top:10px;border-top:1px solid var(--line);}
.eum-tobe .mbwait{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:12px;}
.eum-tobe .mbwait>span:first-child{color:var(--sub);font-weight:600;}
.eum-tobe .mbwaitp{background:var(--cream2);padding:6px 11px;border-radius:999px;font-weight:600;color:var(--ink);}
.eum-tobe .appshow{display:grid;grid-template-columns:1fr 330px;gap:60px;align-items:center;}
.eum-tobe .phone{background:#241d17;border-radius:46px;padding:11px;box-shadow:0 30px 70px rgba(36,29,23,.16);width:min(318px,100%);margin:0 auto;}
.eum-tobe .phone .scr{background:#fff;border-radius:36px;overflow:hidden;}
.eum-tobe .scr.kk{display:flex;flex-direction:column;height:566px;}
.eum-tobe .kkTop{display:flex;align-items:center;gap:9px;padding:14px 14px 12px;border-bottom:1px solid #eee;}
.eum-tobe .kkTop .bk{font-size:19px;color:#333;}
.eum-tobe .kkTop .ci{width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid var(--line);}
.eum-tobe .kkTop .nm{font-size:14px;font-weight:700;line-height:1.15;color:var(--ink);}
.eum-tobe .kkTop .nm small{display:block;font-size:10px;color:var(--mut);font-weight:500;}
.eum-tobe .kkTop .sp{margin-left:auto;display:flex;gap:12px;color:#666;font-size:15px;}
.eum-tobe .chat{flex:1;background:#b2c7da;padding:12px 11px;overflow:hidden;}
.eum-tobe .day{text-align:center;margin-bottom:10px;}
.eum-tobe .day span{background:rgba(0,0,0,.12);color:#fff;font-size:10px;padding:3px 10px;border-radius:999px;}
.eum-tobe .kmsg{display:flex;gap:7px;margin-bottom:10px;}
.eum-tobe .kav{width:32px;height:32px;border-radius:12px;object-fit:cover;flex:none;}
.eum-tobe .kwho{font-size:10px;color:#33404d;margin:0 0 3px 2px;font-weight:600;}
.eum-tobe .kbubble{background:#fff;border-radius:3px 13px 13px 13px;padding:9px 11px;font-size:12.5px;max-width:180px;color:var(--ink);}
.eum-tobe .krich{background:#fff;border-radius:3px 13px 13px 13px;overflow:hidden;width:202px;box-shadow:0 1px 2px rgba(0,0,0,.08);}
.eum-tobe .krimg{height:94px;overflow:hidden;}
.eum-tobe .krimg img{width:100%;height:100%;object-fit:cover;object-position:center 20%;}
.eum-tobe .krb{padding:10px 11px 6px;}
.eum-tobe .krt{font-size:13px;font-weight:700;color:var(--ink);}
.eum-tobe .krd{font-size:11px;color:var(--sub);margin-top:2px;}
.eum-tobe .krbtns{margin-top:6px;border-top:1px solid #f0efec;}
.eum-tobe .krbtns a{display:block;text-align:center;padding:9px;font-size:12.5px;font-weight:600;color:#3d4a5c;border-top:1px solid #f0efec;}
.eum-tobe .krbtns a:first-child{border-top:none;color:var(--coral);}
.eum-tobe .kquicks{display:flex;gap:6px;flex-wrap:wrap;}
.eum-tobe .kquicks span{background:#fff;border:1px solid rgba(0,0,0,.08);color:#33404d;font-size:11px;font-weight:600;padding:6px 10px;border-radius:999px;}
.eum-tobe .kInput{background:#fff;border-top:1px solid #eee;padding:8px 11px;display:flex;align-items:center;gap:9px;}
.eum-tobe .kInput .plus{color:#999;font-size:16px;}
.eum-tobe .kInput .kbox{flex:1;background:#f2f1ee;border-radius:999px;padding:7px 13px;font-size:12px;color:#9a938a;}
.eum-tobe .kInput .ksnd{width:28px;height:28px;border-radius:50%;background:#FEE500;display:flex;align-items:center;justify-content:center;font-size:14px;color:#191600;}
@media(max-width:880px){.eum-tobe .axrow,.eum-tobe .axrow.rev,.eum-tobe .prod,.eum-tobe .appshow{grid-template-columns:1fr;gap:30px;}.eum-tobe .axrow.rev > .axphone{order:2;}.eum-tobe .steps{grid-template-columns:1fr;}.eum-tobe .step{padding:0;}.eum-tobe .step:not(:last-child){border-right:none;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:18px;}.eum-tobe .axrow .txt,.eum-tobe .appshow .txt{text-align:center;}.eum-tobe .axrow .tag{margin-left:auto;margin-right:auto;}}@media(max-width:560px){.eum-tobe .mbgrid{grid-template-columns:1fr;}.eum-tobe .mbwrap{padding:14px;}}
@keyframes eumFloatP{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes eumPulseMic{0%{box-shadow:0 0 0 0 rgba(190,85,53,.4)}70%{box-shadow:0 0 0 20px rgba(190,85,53,0)}100%{box-shadow:0 0 0 0 rgba(190,85,53,0)}}
@keyframes eumBlink{0%,100%{opacity:1}50%{opacity:.35}}
.eum-tobe .axphone{animation:eumFloatP 6.5s ease-in-out infinite;will-change:transform;}
.eum-tobe .axrow.rev .axphone{animation-duration:7.4s;animation-delay:.6s;}
.eum-tobe .phone{animation:eumFloatP 7.8s ease-in-out infinite;will-change:transform;}
.eum-tobe .axmic{animation:eumPulseMic 2s ease-out infinite;}
.eum-tobe .axlisten{animation:eumBlink 1.4s ease-in-out infinite;}
.eum-tobe .mbcard{transition:transform .2s ease,box-shadow .2s ease;}
.eum-tobe .mbcard:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(36,29,23,.12);}
.eum-tobe .axtile{transition:transform .16s ease,background .16s ease,box-shadow .16s ease;}
.eum-tobe .axtile:hover{transform:translateY(-3px);background:#fff7f2;box-shadow:0 10px 22px rgba(36,29,23,.08);}
.eum-tobe .axrowc{transition:transform .16s ease,box-shadow .16s ease;}
.eum-tobe .axrowc:hover{transform:translateX(3px);box-shadow:0 8px 18px rgba(36,29,23,.07);}
.eum-tobe .krbtns a{transition:background .14s ease;}
.eum-tobe .krbtns a:hover{background:#faf6f2;}
@media(prefers-reduced-motion:reduce){.eum-tobe .axphone,.eum-tobe .phone,.eum-tobe .axmic,.eum-tobe .axlisten{animation:none;}}`;
function TobeStyles() { return <style dangerouslySetInnerHTML={{ __html: TOBE_CSS }} />; }

function FullBand({ bg, isMobile, children }) {
  return (
    <div style={{ position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', background: bg, borderTop: '1px solid #EDE9E3', borderBottom: '1px solid #EDE9E3' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '48px 20px' : '82px 40px' }}>
        {children}
      </div>
    </div>
  );
}

function RLProductShowcase() {
  const isMobile = useIsMobile(900);
  return (
    <div className="eum-tobe" style={{ margin: isMobile ? '8px 0 64px' : '12px 0 96px' }}>
      <div className="prod" dangerouslySetInnerHTML={{ __html: PROD_HTML }} />
    </div>
  );
}

function RLAXBand({ isMobile }) {
  return (
    <div className="eum-tobe" style={{ margin: 0 }}>
      <div style={{ maxWidth: 680, marginBottom: 44 }}>
        <div className="kick">AX · AI Experience</div>
        <h2>기술로 완성하는 <span className="ac">안심 돌봄</span></h2>
        <p style={{ fontSize: 17, color: '#5f564d', marginTop: 16, lineHeight: 1.62 }}>이음은 15년 AX·AICC 경험과 고원의 AI 콜봇·보이는 ARS 자산을 복지에 연결합니다. 사람이 놓치는 순간을 기술이 먼저 살핍니다.</p>
      </div>
      <div className="axrows" dangerouslySetInnerHTML={{ __html: AX_ROWS_HTML }} />
    </div>
  );
}

function RLSafetyBand({ isMobile }) {
  const checks = [
    { t: '면접 · 신원 확인', d: '참여 전 대면·비대면 면접을 진행합니다.' },
    { t: '범죄경력 조회', d: '경찰청 연계로 범죄경력을 확인합니다.' },
    { t: '아동학대 전력 조회', d: '아동 동반 활동은 전력을 필수 조회합니다.' },
    { t: '추천인 확인 · 대면 책임보험', d: '추천인 검증과 활동 중 사고 보상까지.' },
  ];
  return (
    <div style={{ margin: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.9fr 1.1fr', gap: isMobile ? 32 : 56, alignItems: 'center' }}>
      <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 50px -22px rgba(26,26,30,0.26)', order: isMobile ? 2 : 1 }}>
        <img src="/safety-3gen.png" alt="세대가 함께하는 따뜻한 순간" style={{ width: '100%', display: 'block', aspectRatio: '4 / 4.5', objectFit: 'cover', objectPosition: 'center 22%' }} loading="lazy" decoding="async" />
      </div>
      <div style={{ order: isMobile ? 1 : 2, textAlign: isMobile ? 'center' : 'left' }}>
        <div className="eum-kicker" style={{ marginBottom: 14, color: C.blue }}>Safety First</div>
        <h2 className="eum-serif" style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: C.ink, margin: '0 0 14px', lineHeight: 1.2 }}>믿고 맡길 수 있는 이유</h2>
        <p style={{ fontSize: 16.5, color: C.mute, lineHeight: 1.6, maxWidth: 460, margin: isMobile ? '0 auto 26px' : '0 0 26px', fontWeight: 500 }}>아이가 어른들과 만나는 만큼, 안전이 최우선입니다. 모든 참여자는 4단계 안전검증을 거치고, 대면 활동은 책임보험으로 보장돼요.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: isMobile ? '0 auto' : 0 }}>
          {checks.map((c) => (
            <div key={c.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, textAlign: 'left' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>{c.t}</div>
                <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.55, marginTop: 2 }}>{c.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RLKakaoBand({ isMobile, onShowApplication }) {
  return (
    <div className="eum-tobe" style={{ margin: 0 }}>
      <div className="appshow">
        <div className="txt" style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <div className="kick">참여 방법</div>
          <h2 style={{ margin: '8px 0 16px' }}>앱 설치 없이,<br />카톡으로 <span className="ac">이음</span></h2>
          <p style={{ fontSize: 17, color: '#5f564d', marginBottom: 26, maxWidth: '33ch', lineHeight: 1.62, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>카카오톡 채널·웹으로 바로 참여합니다. 큰 글씨와 단순한 흐름으로 어르신도 쉽게 사용합니다.</p>
          <button onClick={onShowApplication} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, borderRadius: 15, padding: '16px 28px', fontSize: 16, cursor: 'pointer', border: '1.5px solid transparent', background: '#BE5535', color: '#fff', boxShadow: '0 8px 20px rgba(190,85,53,.24)', fontFamily: 'inherit' }}>카카오톡으로 시작하기</button>
        </div>
        <div className="phone" dangerouslySetInnerHTML={{ __html: KAKAO_PHONE_HTML }} />
      </div>
    </div>
  );
}

function RLStepsBand() {
  const isMobile = useIsMobile(760);
  const steps = [
    { n: '01', icon: PenLine, color: C.sage, soft: C.sageSoft, title: '5분이면 신청 끝', desc: '동네·가능한 시간·관심사만 입력하면 신청 완료. 청소년부터 어르신까지 누구나 참여할 수 있어요.' },
    { n: '02', icon: ShieldCheck, color: C.blue, soft: C.blueSoft, title: '4단계 안전검증', desc: '면접·범죄경력·아동학대 전력·추천인 확인까지. 모든 대면 활동은 책임보험으로 보장돼요.' },
    { n: '03', icon: Users, color: C.brand, soft: C.brandSoft, title: '3세대 트리오 매칭', desc: '거주지·일정·관심사를 분석해 청년·어르신·아이를 연결하고, 코디네이터가 최종 확인해요.' },
  ];
  return (
    <div style={{ marginBottom: 80 }}>
      <RLSectionHead kicker="참여 방법" title="신청부터 매칭까지, 3단계면 끝" sub="복잡한 절차 없이, 안전하게 이웃과 연결돼요." />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="eum-lift" style={{ position: 'relative', background: C.card, borderRadius: 20, padding: 28, border: `1px solid ${C.borderSoft}`, boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'inline-flex', padding: 13, borderRadius: 15, background: s.soft }}><Icon size={24} color={s.color} /></div>
                <span className="eum-serif" style={{ fontSize: 42, fontWeight: 800, color: s.color, opacity: 0.4, lineHeight: 1 }}>{s.n}</span>
              </div>
              <div className="eum-serif" style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.68 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RLLanding({ state, onSelectRole, onShowApplication }) {
  // 시드된 페르소나 fixed assignments
  const personas = [
    { role: 'youth', id: 'p001', gender: 'M', name: '김민준', subtitle: '27세 · 스타트업 개발자', desc: '어르신껜 디지털을 알려드리고, 저는 인생 조언을 얻어요.', color: C.sage, soft: C.sageSoft, gradient: 'linear-gradient(135deg, #6B8E5A 0%, #8FB47E 100%)' },
    { role: 'senior', id: 'p101', gender: 'F', name: '박순자', subtitle: '73세 · 前 교사', desc: '청년에게 디지털을 배우고, 아이에겐 옛이야기를 들려줘요.', color: C.lavender, soft: C.lavenderSoft, gradient: 'linear-gradient(135deg, #7F6FA0 0%, #A797C0 100%)' },
    { role: 'parent', id: 'p201', gender: 'F', name: '이서영', subtitle: '38세 · IT기업 PM (유진 8세 보호자)', desc: '아이가 이웃 어른들과 안전하게 어울리는 시간이 참 든든해요.', color: C.peach, soft: C.peachSoft, gradient: 'linear-gradient(135deg, #D89368 0%, #E8B58F 100%)' },
    { role: 'coordinator', id: 'cdn001', gender: 'F', name: '한가은', subtitle: '코디네이터 · 광주 광산구', desc: '신청·검증·매칭·정산을 한눈에 관리해요.', color: C.ink, soft: '#EDEAE5', gradient: 'linear-gradient(135deg, #1A1814 0%, #3A352F 100%)' },
  ];

  const isMobile = useIsMobile(820);
  const isPhone = useIsMobile(520);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const h = () => { const y = window.scrollY; setScrolled(y > 8); setShowTop(y > 700); };
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: FONT_STACK, overflowX: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* 상단 내비게이션 */}
      <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(245,244,242,0.92)' : 'rgba(245,244,242,0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`, boxShadow: scrolled ? '0 6px 22px -10px rgba(26,26,30,0.16)' : 'none', transition: 'box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '12px 18px' : '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div onClick={() => window.location.reload()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.reload(); } }} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} role="button" tabIndex={0} aria-label="홈으로 새로고침">
            <div style={{ width: 30, height: 30, display: 'flex' }}><EumLogo size={30} /></div>
            <div style={{ lineHeight: 1.05 }}>
              <div className="eum-serif" style={{ fontWeight: 700, color: C.ink, fontSize: 21, letterSpacing: '-0.01em', lineHeight: 1 }}>이음</div>
              <div style={{ fontSize: 10, color: C.mute, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>3세대 상생 품앗이</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button type="button" onClick={() => { const el = document.getElementById('eum-demo'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: FONT_STACK }}>둘러보기</button>
            <Button variant="brand" size="sm" onClick={onShowApplication}>참여 신청하기</Button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, width: '100%', padding: isMobile ? '28px 20px 56px' : '64px 40px 96px' }}>
        {/* 히어로 — 토스 계열 + 모션(그라데이션 오브·진입 스태거·플로팅) */}
        <div style={{ position: 'relative', margin: isMobile ? '8px 0 56px' : '20px 0 80px' }}>
          <div className="eum-orb" style={{ width: 400, height: 400, background: C.brand + '24', top: -130, right: -70, animation: 'eumOrb 17s ease-in-out infinite' }} />
          <div className="eum-orb" style={{ width: 320, height: 320, background: C.peach + '28', bottom: -110, left: -90, animation: 'eumOrb 21s ease-in-out infinite reverse' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 36 : 56, alignItems: 'center' }}>
          <div className="eum-heroin" style={{ textAlign: isMobile ? 'center' : 'left', display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
            <div className="eum-kicker" style={{ marginBottom: 20 }}><Sparkles size={14} /> 청년·어르신·아동 3세대 · 2027 파일럿</div>
            <h1 className="eum-serif" style={{ fontSize: isMobile ? 'clamp(40px, 12vw, 54px)' : 'clamp(48px, 5.6vw, 70px)', fontWeight: 800, color: C.ink, lineHeight: 1.12, margin: '0 0 20px' }}>
              세대를 잇다,<br /><span style={{ color: C.brand }}>이음</span>
            </h1>
            <p style={{ fontSize: isMobile ? 17.5 : 22, color: C.inkSoft, maxWidth: 520, margin: '0 0 34px', lineHeight: 1.6, fontWeight: 500 }}>
              혼자인 어르신, 방과후 혼자인 아이, 낯선 동네의 청년. 서로의 빈자리를 채우는 우리 동네 3세대 품앗이예요.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <Button variant="brand" size="lg" onClick={onShowApplication} iconRight={<ArrowRight size={16} />}>5분 만에 참여 신청</Button>
              <Button variant="secondary" size="lg" onClick={() => { const el = document.getElementById('eum-demo'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>데모 둘러보기</Button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <Badge color={C.blue} soft={C.blueSoft} size="md"><ShieldCheck size={13} /> 통합돌봄 연계</Badge>
              <Badge color={C.gold} soft={C.goldSoft} size="md"><Wallet size={13} /> 상생카드 보상</Badge>
              <Badge color={C.sage} soft={C.sageSoft} size="md"><UserCheck size={13} /> 4단계 안전검증</Badge>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 560, animation: 'eumHeroIn 0.9s cubic-bezier(0.22,1,0.36,1) both, eumHeroFloat 7s ease-in-out 0.9s infinite' }}>
              <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px -24px rgba(26,26,30,0.28)' }}>
                <img className="eum-hero-img" src="/hero-3gen.png" alt="청년·어르신·아동 3세대가 함께하는 모습" style={{ width: '100%', display: 'block', aspectRatio: '4 / 3.4', objectFit: 'cover', objectPosition: 'center 30%' }} loading="eager" decoding="async" fetchPriority="high" />
              </div>
              <div style={{ position: 'absolute', left: isMobile ? 10 : -16, bottom: 24, background: '#fff', borderRadius: 16, padding: '12px 16px', boxShadow: '0 18px 40px -14px rgba(26,26,30,0.3)', display: 'flex', alignItems: 'center', gap: 11, border: `1px solid ${C.borderSoft}` }}>
                <div style={{ display: 'flex' }}>
                  {[C.sage, C.lavender, C.peach].map((c, i) => <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i === 0 ? 0 : -9 }} />)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, lineHeight: 1 }}>우리 동네 15쌍 활동 중</div>
                  <div style={{ fontSize: 11, color: C.sage, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: C.sage, display: 'inline-block' }} /> 실시간 안전 공유 중</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* 3세대 선순환 — 개념(애니메이션) 섹션 */}
        <Reveal>
          <div style={{ margin: isMobile ? '8px 0 64px' : '8px 0 96px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: isMobile ? 32 : 56, alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}><div style={{ transform: isMobile ? 'none' : 'scale(1.4)', transformOrigin: 'left center' }}><RLLoopInfographic /></div></div>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div className="eum-kicker" style={{ marginBottom: 16 }}>3세대 선순환</div>
              <h2 className="eum-serif" style={{ fontSize: isMobile ? 30 : 46, fontWeight: 800, color: C.ink, margin: '0 0 16px', lineHeight: 1.16 }}>세대가 함께 돌보는 동네</h2>
              <p style={{ fontSize: 19, color: C.mute, lineHeight: 1.6, maxWidth: 500, margin: isMobile ? '0 auto 26px' : '0 0 26px', fontWeight: 500 }}>한쪽만 주는 게 아니라, 서로 주고받는 동네예요.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520, margin: isMobile ? '0 auto' : 0, width: '100%' }}>
                {[
                  { c: C.sage, who: '청년', what: '스마트폰·키오스크 사용법을 알려드리고, 아이의 공부를 도와요' },
                  { c: C.lavender, who: '어르신', what: '살아온 지혜와 옛이야기로 아이 곁을 든든히 지켜요' },
                  { c: C.peach, who: '아이', what: '웃음과 활력으로 어른들의 하루를 환하게 채워요' },
                ].map((r) => (
                  <div key={r.who} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '17px 22px', borderRadius: 15, background: C.card, border: `1px solid ${C.borderSoft}`, boxShadow: '0 1px 3px -1px rgba(26,26,30,0.05)', textAlign: 'left' }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: r.c, background: r.c + '18', padding: '7px 15px', borderRadius: 999, minWidth: 62, textAlign: 'center', flexShrink: 0 }}>{r.who}</span>
                    <span style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.55, fontWeight: 500 }}>{r.what}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal><RLStepsBand /></Reveal>

        <TobeStyles />
        <FullBand isMobile={isMobile} bg="#FFFFFF"><Reveal><RLAXBand isMobile={isMobile} /></Reveal></FullBand>

        <Reveal><RLProductShowcase /></Reveal>

        <FullBand isMobile={isMobile} bg="#F1EAE0"><Reveal><RLSafetyBand isMobile={isMobile} /></Reveal></FullBand>

        <FullBand isMobile={isMobile} bg="#FFFFFF"><Reveal><RLKakaoBand isMobile={isMobile} onShowApplication={onShowApplication} /></Reveal></FullBand>

        <RLImpactBand state={state} />

        {/* 데모 로그인 안내 */}
        <div id="eum-demo" style={{ background: C.brandSoft, borderRadius: 20, padding: isMobile ? '20px 22px' : '24px 28px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', scrollMarginTop: 80 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 14, display: 'flex', flexShrink: 0 }}>
            <Sparkles size={22} color={C.brand} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>역할을 골라 직접 들어가 보세요</div>
            <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>2027 광주 광산구 우산동 파일럿 — 지금 활동 중인 15쌍의 이야기를 그대로 담았습니다. 청년·어르신·양육가정·코디네이터 중 하나로 입장하면 모든 기능을 직접 둘러볼 수 있어요.</div>
          </div>
        </div>

        {/* 페르소나(역할) 카드 */}
        <Reveal style={{ display: 'grid', gridTemplateColumns: isPhone ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 72 }}>
          {personas.map((p) => (
            <div key={p.role} onClick={() => onSelectRole(p.role, p.id)} className="eum-rolecard" style={{ cursor: 'pointer', borderRadius: 20, border: `1px solid ${C.borderSoft}`, background: C.card, boxShadow: '0 2px 8px -4px rgba(26,26,30,0.08)', overflow: 'hidden' }}>
              <div style={{ height: 64, background: p.gradient, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 18px' }}>
                <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.2)', padding: '4px 9px', borderRadius: 999 }}>{PERSONA[p.role].label}</div>
                <div style={{ transform: 'translateY(50%)' }}><Avatar type={p.role} gender={p.gender} name={p.name} color="#fff" size={52} ring /></div>
              </div>
              <div style={{ padding: '34px 20px 20px' }}>
                <div className="eum-serif" style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.mute, marginBottom: 11, marginTop: 3 }}>{p.subtitle}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, minHeight: 58 }}>{p.desc}</div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: p.color, fontWeight: 700 }}>입장하기</span>
                  <span style={{ display: 'flex', width: 26, height: 26, borderRadius: '50%', background: p.color + '18', alignItems: 'center', justifyContent: 'center' }}><ArrowRight className="eum-arrow" size={14} color={p.color} /></span>
                </div>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal><RLTestimonialBand /></Reveal>
        <Reveal delay={60}><RLBenchmarkBand /></Reveal>
        <Reveal delay={60}><RLMoatBand /></Reveal>
        <Reveal delay={60}><RLRevenueModelBand /></Reveal>
        <Reveal delay={60}><RLPricingBand onShowApplication={onShowApplication} /></Reveal>
        <Reveal delay={60}><RLFaqBand /></Reveal>
        <RLPartnerStrip />

        {/* 신청 진입 — 토스풍 브랜드 CTA 카드 */}
        <div className="eum-anim-gradient" style={{ background: `linear-gradient(135deg, ${C.brand} 0%, ${C.brandDark} 60%, ${C.brand} 100%)`, borderRadius: 28, padding: isMobile ? '36px 26px' : '52px 56px', boxShadow: `0 28px 56px -22px ${C.brand}99`, position: 'relative', overflow: 'hidden' }}>
          <div className="eum-orb" style={{ width: 300, height: 300, background: 'rgba(255,255,255,0.16)', top: -120, right: -50, animation: 'eumOrb 18s ease-in-out infinite' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 24 : 40, flexWrap: 'wrap', textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 999, marginBottom: 16 }}><Sparkles size={13} /> 2027 우산동 파일럿 참여 모집</div>
              <div className="eum-serif" style={{ fontSize: isMobile ? 26 : 'clamp(28px, 3.6vw, 40px)', fontWeight: 800, color: '#fff', lineHeight: 1.22, marginBottom: 12 }}>우리 동네 3세대 품앗이,<br />지금 시작해요</div>
              <div style={{ fontSize: isMobile ? 15 : 16.5, color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, maxWidth: 480, fontWeight: 500 }}>광주 광산구 우산동에 사시는 분이면 청소년부터 어르신까지 누구나 신청할 수 있어요. 5분이면 충분해요.</div>
            </div>
            <button onClick={onShowApplication} className="eum-cta-btn" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.brand, border: 'none', borderRadius: 14, padding: '16px 30px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: FONT_STACK, boxShadow: '0 10px 24px -8px rgba(0,0,0,0.3)' }}><UserPlus size={18} /> 참여 신청하기 <ArrowRight className="eum-arrow" size={17} /></button>
          </div>
        </div>

        <div style={{ marginTop: 64, paddingTop: 40, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr', gap: isMobile ? 28 : 32, marginBottom: 36 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <EumLogo size={28} />
                <span className="eum-serif" style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>이음</span>
              </div>
              <div style={{ fontSize: 13.5, color: C.mute, lineHeight: 1.7, maxWidth: 340 }}>청년·어르신·아동 3세대를 잇는 광주 광산구형 3세대 상생 품앗이 플랫폼이에요.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: C.sage, background: C.sageSoft, padding: '5px 11px', borderRadius: 999 }}><ShieldCheck size={12} /> 4단계 안전검증</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: C.brand, background: C.brandSoft, padding: '5px 11px', borderRadius: 999 }}><Heart size={12} /> 책임보험 적용</span>
              </div>
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.borderSoft}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muteLight, letterSpacing: '0.06em', marginBottom: 12 }}>운영 법인</div>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <img src="/logos/gowon.png" alt="고원 GOWON" loading="lazy" decoding="async" style={{ height: 32, display: 'block', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; const n = e.currentTarget.nextElementSibling; if (n) n.style.display = 'inline-flex'; }} />
                  <span style={{ display: 'none', alignItems: 'center', gap: 9, fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: '0.08em' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(from 200deg, #E15A33, #F6BE4F, #43C95A, #456A9E, #766B94, #E15A33)', display: 'inline-block', flexShrink: 0 }} />
                    GOWON
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.ink, letterSpacing: '0.02em', marginBottom: 14 }}>서비스</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span onClick={() => { const el = document.getElementById('eum-demo'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} style={{ fontSize: 13.5, color: C.inkSoft, fontWeight: 500, cursor: 'pointer' }}>둘러보기 · 데모 체험</span>
                <span onClick={onShowApplication} style={{ fontSize: 13.5, color: C.inkSoft, fontWeight: 500, cursor: 'pointer' }}>5분 참여 신청</span>
                <span style={{ fontSize: 13.5, color: C.inkSoft, fontWeight: 500 }}>자주 묻는 질문</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.ink, letterSpacing: '0.02em', marginBottom: 14 }}>함께하는 기관</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['광주광역시 · 광산구청', '광주창조경제혁신센터', '1365 자원봉사포털', '광주상생카드'].map((p, i) => (
                  <span key={i} style={{ fontSize: 13.5, color: C.mute, fontWeight: 500 }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 22, borderTop: `1px solid ${C.borderSoft}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12.5, color: C.mute, letterSpacing: '0.01em' }}>
            <span>© 2027 이음 · 운영 주식회사 고원(GOWON)</span>
            <span>광주 광산구 우산동 3세대 상생 품앗이 파일럿 · 데모 모드</span>
          </div>
        </div>
      </div>
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60, width: 46, height: 46, borderRadius: '50%', background: C.ink, color: '#fff', border: 'none', boxShadow: '0 10px 28px -8px rgba(26,26,30,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeUp 0.3s ease' }}>
          <ChevronUp size={22} />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// 상용화 배치 (2026-06) — API 실연동 구조(인라인·목업) + 신뢰배지 + 접근성
//  실제 연동 스택은 src/api/* (zip 제공). 단일파일 배포를 위해 핵심만 인라인.
// ============================================================================
const EUM_API = {
  useMock: true, // .env VITE_USE_MOCK=false 시 실연동(서버 BFF 경유)
  v1365:   { issueCertificate: async (id) => ({ certNo: '1365-' + String(Date.now()).slice(-8), url: 'https://www.1365.go.kr' }),
             accrue: async (id, h) => ({ ok: true, added: h }) },
  welfare: { recommend: async (pf) => (typeof aiWelfare === 'function' ? aiWelfare(pf) : []) },
  notify:  { alimtalk: async () => ({ ok: true, messageId: 'AT-' + Date.now() }) },
  happyeum:{ getTarget: async () => ({ found: true }) },
  sangsang:{ issueVoucher: async (id, amount) => ({ code: 'GSC-' + amount }) },
};

// 케어닥식 신뢰배지
function TrustRow() {
  const items = [
    { ic: <ShieldCheck size={15} />, t: '4단계 안전검증' },
    { ic: <UserCheck size={15} />, t: '범죄경력·아동학대 조회' },
    { ic: <Heart size={15} />, t: '돌봄 책임보험' },
    { ic: <Award size={15} />, t: '지자체 공인 인증발신' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 18px' }}>
      {items.map((x, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: C.sage, background: C.sageSoft, border: `1px solid ${C.sage}33`, padding: '6px 11px', borderRadius: 999 }}>{x.ic}{x.t}</div>
      ))}
    </div>
  );
}

// 어르신 접근성 — 큰 글씨 토글(전역 zoom)
function AccessibilityFab() {
  const [big, setBig] = useState(false);
  const apply = (n) => { try { document.documentElement.style.zoom = n ? '1.18' : '1'; } catch (e) {} };
  // 저장된 접근성 설정을 새로고침 후에도 유지
  useEffect(() => {
    try {
      const saved = (typeof localStorage !== 'undefined') && localStorage.getItem('eum:bigfont') === '1';
      if (saved) { setBig(true); apply(true); }
    } catch (e) {}
  }, []);
  const toggle = () => { const n = !big; setBig(n); apply(n); try { if (typeof localStorage !== 'undefined') localStorage.setItem('eum:bigfont', n ? '1' : '0'); } catch (e) {} };
  return (
    <button onClick={toggle} aria-label="큰 글씨 전환" title="큰 글씨 전환" style={{ position: 'fixed', left: 22, bottom: 24, zIndex: 9000, display: 'flex', alignItems: 'center', gap: 7, background: big ? C.ink : C.card, color: big ? '#fff' : C.ink, border: `1.5px solid ${C.ink}`, borderRadius: 999, padding: '11px 16px', fontFamily: FONT_STACK, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 18px rgba(26,24,20,.2)' }}>
      <span style={{ fontSize: 17 }}>가</span>{big ? '기본 글씨' : '큰 글씨'}
    </button>
  );
}

// 케어닥식 홈 허브 — 큰 아이콘 빠른탐색 (A: UX 통일)
function HomeHub({ setView, items }) {
  const def = [
    { id: 'discover', label: '활동 찾기', icon: Search, c: C.brand },
    { id: 'schedule', label: '활동 일정', icon: Calendar, c: C.blue },
    { id: 'mentor', label: '진로 멘토', icon: GraduationCap, c: C.sage },
    { id: 'logs', label: '활동 기록', icon: PenLine, c: C.lavender },
    { id: 'archive', label: '동네 기억', icon: BookOpen, c: C.gold },
    { id: 'settlement', label: '정산·실적', icon: Wallet, c: C.peach },
  ];
  const list = items || def;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 10 }}>무엇을 도와드릴까요?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 10 }}>
        {list.map((it) => {
          const Ic = it.icon;
          return (
            <button key={it.id} onClick={() => setView(it.id)} style={{ cursor: 'pointer', fontFamily: FONT_STACK, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(26,24,20,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, background: it.c + '1A', color: it.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic size={24} /></span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CoordOverview({ state, setView, dispatch }) {
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
    const palette = [C.brand, C.sage, C.lavender, C.gold, C.peach, C.blue, C.amber];
    return Object.entries(types).map(([type, count], i) => ({ name: type, value: count, color: palette[i % palette.length] }));
  }, [state]);

  return (
    <>
      <PageHeader title="대시보드" subtitle={`${fmtDate(TODAY)} · 광주 광산구 우산동 1차 파일럿`} right={<Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => { if (typeof window !== 'undefined' && window.confirm('데모 데이터를 처음 상태로 초기화할까요? (현재 화면 변경분이 사라집니다)')) dispatch && dispatch({ type: 'RESET_DATA' }); }}>데모 초기화</Button>} />
      <QuickAccessStrip setView={setView} />

      {/* 알림 영역 */}
      {(kpis.openIncidents > 0 || kpis.pendingApps > 0 || kpis.pendingLogs > 5) && (
        <div style={{
          marginBottom: 20, padding: '13px 16px 13px 14px',
          background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.amber}`,
          borderRadius: 12, boxShadow: SHADOW.xs,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: C.amberSoft, color: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={15} />
          </span>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>오늘 처리해야 할 일</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {kpis.openIncidents > 0 && <QueueChip label="안전 이슈" n={kpis.openIncidents} danger onClick={() => setView('safety')} />}
            {kpis.pendingApps > 0 && <QueueChip label="검토 대기" n={kpis.pendingApps} onClick={() => setView('applicants')} />}
            {kpis.pendingLogs > 0 && <QueueChip label="승인 대기" n={kpis.pendingLogs} onClick={() => setView('activities')} />}
          </div>
        </div>
      )}

      {/* KPI 바 — 카드 4개를 흩뿌리지 않고 하나의 패널에 구획선으로 나눈다.
          수치가 같은 기준선(베이스라인)에 놓여야 서로 비교된다. */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
        boxShadow: SHADOW.xs, overflow: 'hidden', marginBottom: 16,
      }}>
        {[
          { label: '참여자', value: kpis.totalParticipants, unit: '명', sub: `청년 ${kpis.youthCount} · 어르신 ${kpis.seniorCount} · 양육 ${kpis.parentCount}`, icon: <Users size={15} />, color: C.brand },
          { label: '활성 매칭', value: kpis.activeMatches, unit: '건', sub: `연 목표 8건 대비 ${Math.round(kpis.activeMatches / 8 * 100)}%`, icon: <Heart size={15} />, color: C.sage, pct: kpis.activeMatches / 8 * 100 },
          { label: '누적 활동시간', value: kpis.totalHours, unit: '시간', sub: `연 목표 1,440시간 대비 ${Math.round(kpis.totalHours / 1440 * 100)}%`, icon: <Clock size={15} />, color: C.lavender, pct: kpis.totalHours / 1440 * 100 },
          { label: '지급 정산', value: kpis.totalSettled, unit: '', money: true, sub: `${state.settlements.filter(s => s.status === 'issued' || s.status === 'paid').length}건 발급 완료`, icon: <Wallet size={15} />, color: C.gold },
        ].map((k, i) => (
          <div key={k.label} style={{ padding: '18px 22px 20px', borderLeft: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: k.color + '14', color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</span>
              <span style={{ fontSize: 12.5, color: C.navMute, fontWeight: 600 }}>{k.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {k.money ? krw(k.value) : <CountUp value={k.value} />}
              </span>
              {k.unit && <span style={{ fontSize: 14, fontWeight: 700, color: C.muteLight }}>{k.unit}</span>}
            </div>
            {k.pct !== undefined && (
              <div style={{ height: 3, background: C.lineSoft, borderRadius: 999, overflow: 'hidden', marginTop: 12 }}>
                <div style={{ height: '100%', width: `${Math.min(100, k.pct)}%`, background: k.color, borderRadius: 999, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
            )}
            <div style={{ fontSize: 12, color: C.muteLight, marginTop: k.pct !== undefined ? 8 : 12, fontWeight: 500, lineHeight: 1.45 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 본문 2단 — 왼쪽은 추세(시간축), 오른쪽은 상태(구성·만족도).
          콘솔은 '무엇이 변하고 있나'와 '지금 어떤 상태인가'를 분리해서 보여줘야 한다. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(280px, 1fr)', gap: 16, marginBottom: 16 }} className="eum-dash-grid">
        <Panel
          title="누적 활동시간 추이"
          sub="승인된 활동 로그 누적 기준"
          right={<span style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 600 }}>연 목표 1,440시간</span>}
        >
          {monthlyChart.length === 0 ? <Empty icon={<TrendingUp size={28} />} title="활동 기록 없음" /> : (
            <ResponsiveContainer width="100%" height={258}>
              <AreaChart data={monthlyChart} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="hours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.brand} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={C.brand} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* 격자는 가로선만 — 세로 격자는 데이터를 읽는 데 방해가 된다 */}
                <CartesianGrid vertical={false} stroke={C.lineSoft} />
                <XAxis dataKey="month" stroke={C.muteLight} fontSize={11.5} fontFamily={FONT_STACK} tickLine={false} axisLine={false} dy={6} />
                <YAxis stroke={C.muteLight} fontSize={11.5} fontFamily={FONT_STACK} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  cursor={{ stroke: C.line, strokeWidth: 1 }}
                  contentStyle={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: SHADOW.md, fontFamily: FONT_STACK, fontSize: 12.5, padding: '8px 12px' }}
                  labelStyle={{ color: C.navMute, fontWeight: 600, marginBottom: 2 }}
                  itemStyle={{ color: C.headline, fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="cumulative" stroke={C.brand} strokeWidth={2.25} fill="url(#hours)" name="누적 활동시간" isAnimationActive={false}
                  dot={{ r: 3, fill: C.panel, stroke: C.brand, strokeWidth: 2 }} activeDot={{ r: 5, fill: C.brand, stroke: C.panel, strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Panel title="세대 구성" sub={`전체 ${kpis.totalParticipants}명`}>
            {[['청년', kpis.youthCount, C.sage], ['어르신', kpis.seniorCount, C.lavender], ['양육가정', kpis.parentCount, C.peach], ['아동', kpis.childCount, C.gold]].map(([lab, val, col], i) => (
              <div key={lab} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: C.inkSoft, fontWeight: 600 }}>{lab}</span>
                  <span style={{ color: C.headline, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}<span style={{ color: C.muteLight, fontWeight: 500 }}>명</span></span>
                </div>
                <AnimatedBar value={val} max={Math.max(kpis.youthCount, kpis.seniorCount, kpis.parentCount, kpis.childCount, 1)} color={col} height={6} track={C.lineSoft} delay={i * 90} />
              </div>
            ))}
          </Panel>

          <Panel title="프로그램 만족도" sub={`설문 ${kpis.surveyCount}건 기준`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Ring value={kpis.avgSatisfaction} max={5} size={84} stroke={9} color={C.gold} track={C.lineSoft} label={kpis.avgSatisfaction.toFixed(1)} sublabel="/ 5.0" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: C.navMute, fontWeight: 600, marginBottom: 4 }}>지속 참여 의향</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.headline, letterSpacing: '-0.035em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  <CountUp value={kpis.continueRate} suffix="%" />
                </div>
                <div style={{ fontSize: 12, color: C.muteLight, marginTop: 7, fontWeight: 500 }}>“다음에도 참여하겠다”</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* 활동 유형 · 오늘 일정 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Panel title="활동 유형 분포" sub="전체 활동 기준">
          {typeChart.length === 0 ? <Empty icon={<Activity size={28} />} title="활동 없음" /> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 168, height: 168, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeChart} dataKey="value" cx="50%" cy="50%" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none" isAnimationActive={false}>
                      {typeChart.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: SHADOW.md, fontFamily: FONT_STACK, fontSize: 12.5, padding: '8px 12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* 범례를 차트 밖 목록으로 — 값을 함께 읽을 수 있게 한다 */}
              <div style={{ flex: 1, minWidth: 150 }}>
                {typeChart.map((t) => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12.5, color: C.inkSoft, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                    <span style={{ fontSize: 12.5, color: C.headline, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="오늘의 활동 일정" sub={fmtDate(TODAY)} right={<Badge color={C.brand} soft={C.brandSoft}>{state.activities.filter(a => a.date === TODAY).length}건</Badge>} padding={state.activities.filter(a => a.date === TODAY).length === 0 ? 8 : 0}>
          {state.activities.filter(a => a.date === TODAY).length === 0 ? (
            <Empty icon={<Calendar size={24} />} title="오늘은 예정된 활동이 없습니다" />
          ) : state.activities.filter(a => a.date === TODAY).map((act, i) => {
            const m = state.matches.find(mm => mm.id === act.match_id);
            const y = state.participants.find(p => p.id === m?.youth_id);
            return (
              <div key={act.id} style={{ display: 'flex', gap: 14, padding: '13px 20px', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
                <div style={{ minWidth: 46, fontSize: 13.5, fontWeight: 800, color: C.brand, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{(act.time || '').slice(0, 5)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.headline, marginBottom: 3, letterSpacing: '-0.02em' }}>{act.title}</div>
                  <div style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 500 }}>{act.location} · {y?.name}</div>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      {/* 최근 활동 기록 */}
      <Panel
        title="최근 활동 기록"
        sub="최근 5건"
        padding={0}
        right={<Button variant="ghost" size="sm" onClick={() => setView('activities')} iconRight={<ArrowRight size={12} />}>전체보기</Button>}
        style={{ marginBottom: 16 }}
      >
        {state.activity_logs.slice(-5).reverse().map((log, i) => {
          const author = state.participants.find(p => p.id === log.participant_id);
          const act = state.activities.find(a => a.id === log.activity_id);
          return (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
              <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={32} color={PERSONA[author?.type]?.color || C.brand} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{author?.name} · {act?.title}</div>
                <div style={{ fontSize: 11.5, color: C.muteLight, marginTop: 2, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtDate(log.date)} · {log.hours}시간</div>
              </div>
              {log.approved ? <Badge color={C.success} soft={C.successSoft} size="sm">승인</Badge> : <Badge color={C.amber} soft={C.amberSoft} size="sm">대기</Badge>}
            </div>
          );
        })}
      </Panel>

      {/* 신뢰·안전 관제 */}
      <Panel title="신뢰·안전 관제" right={<Badge color={C.amber} soft={C.amberSoft}>도입 예정</Badge>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { c: C.blue, t: '공인 인증 발신 시스템', d: '광주광역시 공식 알림톡 채널 연동. 모든 발신에 지자체 인증 표시가 적용되어 어르신 대상 보이스피싱·사칭을 차단합니다.' },
            { c: C.success, t: '돌봄 책임보험 연동', d: `1365 자원봉사 보험 + 지자체 돌봄 특약 자동 가입. 활성 매칭 ${kpis.activeMatches}건 전건 보장, 미가입 0건.` },
          ].map((x) => (
            <div key={x.t} style={{ padding: '14px 16px', borderRadius: 12, background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${x.c}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: C.headline, marginBottom: 7, letterSpacing: '-0.02em' }}>
                <ShieldCheck size={14} style={{ color: x.c }} /> {x.t}
              </div>
              <div style={{ fontSize: 12.5, color: C.navMute, lineHeight: 1.6, fontWeight: 500 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </Panel>
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

      {/* 필터 바 — 검색 + 대상 구분. 좁은 폭에서 칩이 밀려나지 않도록 줄바꿈을 보장한다. */}
      <div style={{ display: 'flex', gap: 10, margin: '16px 0 14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar value={query} onChange={setQuery} placeholder="이름·연락처·동·강점 검색" style={{ flex: '1 1 260px', minWidth: 220 }} />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[['all', '전체'], ['teen', '청소년'], ['youth', '청년'], ['adult', '중년'], ['senior', '어르신'], ['parent', '양육가정']].map(([id, lab]) => {
            const on = typeFilter === id;
            return (
              <button key={id} onClick={() => setTypeFilter(id)} style={{
                padding: '7px 12px', borderRadius: 9,
                border: `1px solid ${on ? 'transparent' : C.line}`,
                background: on ? C.headline : C.panel,
                color: on ? '#fff' : C.inkSoft,
                fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: 'pointer', fontFamily: FONT_STACK,
                transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
              }}>{lab}</button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? <Empty icon={<UserPlus size={32} />} title={query || typeFilter !== 'all' ? '조건에 맞는 신청자가 없습니다' : `${activeTab === 'screening' ? '검토 대기' : activeTab === 'verified' ? '검증 중인' : activeTab === 'completed' ? '활동 중인' : '반려된'} 신청자가 없습니다`} /> : (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.xs, overflow: 'hidden' }}>
          {/* 리스트 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', background: C.lineSoft, borderBottom: `1px solid ${C.line}`, fontSize: 11.5, fontWeight: 700, color: C.navMute, letterSpacing: '0.02em' }}>
            <div style={{ flex: '1 1 260px', minWidth: 200 }}>신청자</div>
            <div style={{ width: 120, flexShrink: 0 }} className="eum-col-md">연락처</div>
            <div style={{ width: 96, flexShrink: 0 }} className="eum-col-md">신청일</div>
            <div style={{ width: 168, flexShrink: 0 }}>검증 진행</div>
            <div style={{ width: 20, flexShrink: 0 }} />
          </div>
          {filtered.map((app, i) => {
            const p = state.participants.find(pp => pp.id === app.participant_id);
            const verifs = state.verifications.filter(v => v.application_id === app.id);
            const passedCount = verifs.filter(v => v.status === 'passed').length;
            const totalSteps = verifs.length;
            const done = totalSteps > 0 && passedCount === totalSteps;
            const pct = totalSteps ? (passedCount / totalSteps) * 100 : 0;
            return (
              <div
                key={app.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedApp(app)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedApp(app); } }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px', cursor: 'pointer',
                  borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
                  transition: 'background 0.13s ease',
                }}
              >
                <div style={{ flex: '1 1 260px', minWidth: 200, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar type={p?.type} gender={p?.gender} name={p?.name} size={38} color={PERSONA[p?.type]?.color || C.brand} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{p?.name}</span>
                      <Badge color={PERSONA[p?.type]?.color || C.mute} soft={(PERSONA[p?.type]?.soft) || C.muteSoft} size="sm">{PERSONA[p?.type]?.label || p?.type}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: C.navMute, marginTop: 2, fontWeight: 500 }}>{p?.age}세 · {p?.address || '주소 미등록'}</div>
                  </div>
                </div>
                <div style={{ width: 120, flexShrink: 0, fontSize: 12.5, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }} className="eum-col-md">{p?.phone}</div>
                <div style={{ width: 96, flexShrink: 0, fontSize: 12.5, color: C.navMute, fontVariantNumeric: 'tabular-nums' }} className="eum-col-md">{fmtDate(app.applied_at)}</div>
                <div style={{ width: 168, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: done ? C.success : C.navMute, fontWeight: 700 }}>{done ? '검증 완료' : `${passedCount}/${totalSteps} 단계`}</span>
                    <span style={{ fontSize: 11, color: C.muteLight, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{ height: 5, background: C.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: done ? C.success : C.brand, borderRadius: 999, transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: C.muteLight, flexShrink: 0 }} />
              </div>
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

      {(availableYouth.length + availableSenior.length + availableChild.length) > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, letterSpacing: '0.08em' }}>매칭 대기 · 미배정 {availableYouth.length + availableSenior.length + availableChild.length}명</div>
            <Button variant="ghost" size="sm" icon={<Sparkles size={14} />} onClick={runAiMatching}>AI로 트리오 만들기</Button>
          </div>
          <Card padding={16}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[['청년 멘토', availableYouth, C.sage], ['어르신 멘토', availableSenior, C.lavender], ['아동', availableChild, C.peach]].map(([label, arr, col]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: col, marginBottom: 8, letterSpacing: '0.04em' }}>{label} · {arr.length}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {arr.length === 0 ? <div style={{ fontSize: 12, color: C.mute, padding: '8px 4px' }}>대기 없음</div> :
                      arr.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: C.bg, borderRadius: 9 }}>
                          <Avatar type={p.type} gender={p.gender} name={p.name} size={30} color={col} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: C.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.age}세 · {(p.skills && p.skills[0]) || (p.interests && p.interests[0]) || '활동 희망'}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="AI 매칭 추천" size="lg">
        {aiLoading && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: C.inkSoft }}>
              <Loader2 size={15} style={{ color: C.brand, animation: 'spin 1s linear infinite' }} />
              참여자 프로필을 분석하고 있습니다…
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, background: C.cardWarm }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <Skeleton w={118} h={14} />
                    <Skeleton w={56} h={22} r={999} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Skeleton w={44} h={44} r={12} />
                    <Skeleton w={44} h={44} r={12} />
                    <Skeleton w={44} h={44} r={12} />
                  </div>
                  <div style={{ marginTop: 14 }}><Skeleton h={12} w="92%" /></div>
                  <div style={{ marginTop: 8 }}><Skeleton h={12} w="68%" /></div>
                </div>
              ))}
            </div>
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

  const trio = [{ p: y, color: C.sage }, { p: s, color: C.lavender }, { p: c, color: C.peach }].filter(t => t.p);
  const score = Number(match.score) || 0;

  return (
    <Card padding={0} hoverable onClick={onClick} style={{ overflow: 'hidden' }}>
      {/* 상태 액센트 — 카드 상단 2px 라인. 보드에서 상태별 열을 눈으로 스캔할 수 있다. */}
      <div style={{ height: 2, background: accent }} />
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.muteLight, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}>{match.id.toUpperCase()}</span>
          <span style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtDate(match.started_at)}</span>
        </div>

        {/* 트리오 — 겹친 아바타로 '한 팀'임을 형태로 보여준다 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', flexShrink: 0 }}>
            {trio.map(({ p, color }, i) => (
              <span key={p.id} style={{ marginLeft: i === 0 ? 0 : -10, borderRadius: '50%', border: `2px solid ${C.panel}`, display: 'flex', position: 'relative', zIndex: 3 - i }}>
                <Avatar type={p?.type} gender={p?.gender} name={p.name} size={38} color={color} />
              </span>
            ))}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {trio.map(t => t.p.name).join(' · ')}
            </div>
            <div style={{ fontSize: 11.5, color: C.muteLight, marginTop: 2, fontWeight: 500 }}>청년 · 어르신 · 아동</div>
          </div>
        </div>

        {/* 적합도 — 숫자 + 게이지. 상대 비교가 가능해진다. */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600 }}>적합도</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
          </div>
          <div style={{ height: 5, background: C.lineSoft, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, score))}%`, background: accent, borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 13, borderTop: `1px solid ${C.lineSoft}`, fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} style={{ color: C.muteLight }} /> {hours}시간</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Activity size={13} style={{ color: C.muteLight }} /> {logs.length}회 활동</span>
          <ChevronRight size={15} style={{ color: C.muteLight, marginLeft: 'auto' }} />
        </div>
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

  const issued = state.settlements.filter(s => s.period === monthFilter && (s.status === 'issued' || s.status === 'paid'));
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
        <StatCard label="누적 지급" value={krw(state.settlements.filter(s => s.status === 'issued' || s.status === 'paid').reduce((sum, s) => sum + (s.amount||0), 0))} sub={`${state.settlements.filter(s => s.status === 'issued' || s.status === 'paid').length}건`} color={C.gold} icon={<Award size={18} />} />
      </div>

      {/* 정산 명세 — 월 선택을 패널 헤더로 끌어올려 별도 카드를 없앤다(스크롤 1회 절약). */}
      <Panel
        title="정산 명세"
        sub={`${monthFilter.replace('-', '년 ')}월 · 승인된 활동 로그 기준 자동 산정`}
        padding={0}
        right={
          <Select value={monthFilter} onChange={setMonthFilter}
            options={['2027-05', '2027-06', '2027-07'].map(m => ({ value: m, label: m.replace('-', '년 ') + '월' }))}
            style={{ width: 150 }} />
        }
      >
        <div style={{ padding: '11px 20px', borderBottom: `1px solid ${C.line}`, display: 'grid', gridTemplateColumns: '1fr 84px 84px 130px 120px 92px', gap: 12, fontSize: 11.5, color: C.navMute, fontWeight: 700, background: C.lineSoft }}>
          <div>참여자</div><div>활동</div><div>시간</div><div style={{ textAlign: 'right' }}>금액</div><div>지급 방법</div><div style={{ textAlign: 'right' }}>상태</div>
        </div>
        {calculatedSettlements.length === 0 ? <Empty icon={<Wallet size={28} />} title="이번 달 산정 대상이 없습니다" /> : calculatedSettlements.map((calc, i) => (
          <div
            key={calc.participant.id}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            style={{ padding: '13px 20px', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`, display: 'grid', gridTemplateColumns: '1fr 84px 84px 130px 120px 92px', gap: 12, alignItems: 'center', transition: 'background .13s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar type={calc.participant?.type} gender={calc.participant?.gender} name={calc.participant.name} size={32} color={PERSONA[calc.participant.type]?.color || C.brand} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{calc.participant.name}</div>
                <div style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 500 }}>{PERSONA[calc.participant.type]?.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>{calc.count}회</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{calc.hours}시간</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.headline, textAlign: 'right', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{krw(calc.amount)}</div>
            <div style={{ fontSize: 12.5, color: C.navMute, fontWeight: 500 }}>{calc.participant.type === 'youth' ? '계좌이체' : '온누리상품권'}</div>
            <div style={{ textAlign: 'right' }}>
              {(calc.existing?.status === 'issued' || calc.existing?.status === 'paid') ? <Badge color={C.success} soft={C.successSoft} size="sm">발급 완료</Badge> :
                <Button variant="brand" size="sm" onClick={() => { issueOne(calc); showToast({ type: 'success', message: `${calc.participant.name}님께 발급되었습니다.` }); }}>발급</Button>}
            </div>
          </div>
        ))}
      </Panel>
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
  const [period, setPeriod] = useState('2027-06'); // 데이터가 풍부한 직전 달 기본 표시
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const stats = useMemo(() => {
    const monthLogs = state.activity_logs.filter(l => (l.date || '').startsWith(period));
    const approvedLogs = monthLogs.filter(l => l.approved);
    const activeMatches = state.matches.filter(m => m.status === 'active').length;
    const totalHours = approvedLogs.reduce((s, l) => s + l.hours, 0);
    const settlements = state.settlements.filter(s => s.period === period && (s.status === 'issued' || s.status === 'paid'));
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
        <Card padding={28} style={{ marginBottom: 18, background: `linear-gradient(135deg, ${C.brand}06 0%, ${C.peach}06 100%)`, border: `1px solid ${C.brand}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Loader2 size={16} style={{ color: C.brand, animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: '0.08em' }}>월간 리포트 작성 중 · {period}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton w={140} h={13} style={{ marginBottom: 9 }} />
                <Skeleton h={12} w="96%" style={{ marginBottom: 7 }} />
                <Skeleton h={12} w="88%" style={{ marginBottom: 7 }} />
                <Skeleton h={12} w="58%" />
              </div>
            ))}
          </div>
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
              <Bar dataKey="hours" fill={C.brand} radius={[8, 8, 0, 0]} name="시간" isAnimationActive={false} />
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

  // 문서 제목 동기화 — 역할별 화면임을 탭·방문기록·스크린리더에서 바로 알 수 있게
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const titleByRole = {
      youth: '청년 · 이음',
      senior: '어르신 · 이음',
      parent: '학부모 · 이음',
      coordinator: '코디네이터 콘솔 · 이음',
    };
    document.title = titleByRole[state.currentRole] || '이음 · 세대를 잇다';
  }, [state.currentRole]);

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
    // 모달 즉시 닫지 않음 → 폼 자체 완료 안내(범죄경력 조회 7~14일 등) 노출, 사용자가 '확인' 시 onClose로 닫힘
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
        @keyframes eumKenburns { from { transform: scale(1); } to { transform: scale(1.045); } }
        @keyframes eumHeroFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes eumOrb { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(24px,-18px) scale(1.1); } 66% { transform: translate(-18px,16px) scale(0.94); } }
        @keyframes eumGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes eumMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes eumPop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes eumHeroIn { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes eumShimmer { 100% { transform: translateX(100%); } }
        /* 콘솔 리스트 — 좁은 폭에서 보조 컬럼을 접어 핵심 정보만 남긴다 */
        @media (max-width: 1180px) { .eum-col-md { display: none !important; } }
        /* 대시보드 2단 그리드 — 좁아지면 세로로 쌓는다 */
        @media (max-width: 1080px) { .eum-dash-grid { grid-template-columns: 1fr !important; } }
        /* 사이드바 스크롤바 — 얇고 조용하게 */
        .eum-scroll { scrollbar-width: thin; scrollbar-color: #DFE2E7 transparent; }
        .eum-scroll::-webkit-scrollbar { width: 6px; }
        .eum-scroll::-webkit-scrollbar-thumb { background: #DFE2E7; border-radius: 999px; }
        .eum-scroll::-webkit-scrollbar-track { background: transparent; }
        .eum-skeleton { position: relative; overflow: hidden; background: ${C.borderSoft}; }
        .eum-skeleton::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent); animation: eumShimmer 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .eum-skeleton::after { animation: none; } }
        /* 정적 그라데이션 — 지속 repaint 제거(성능) */
        .eum-anim-gradient { background-size: 140% 140%; background-position: 30% 50%; }
        .eum-orb { position: absolute; border-radius: 50%; filter: blur(42px); pointer-events: none; z-index: 0; will-change: transform; }
        .eum-arrow { transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
        .eum-rolecard:hover .eum-arrow, .eum-lift:hover .eum-arrow, .eum-cta-btn:hover .eum-arrow { transform: translateX(4px); }
        .eum-float { animation: eumHeroFloat 7s ease-in-out infinite; }
        .eum-hero-img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .eum-heroin > * { animation: eumHeroIn 0.8s cubic-bezier(0.22,1,0.36,1) both; }
        .eum-heroin > *:nth-child(1) { animation-delay: 0.02s; }
        .eum-heroin > *:nth-child(2) { animation-delay: 0.1s; }
        .eum-heroin > *:nth-child(3) { animation-delay: 0.18s; }
        .eum-heroin > *:nth-child(4) { animation-delay: 0.26s; }
        .eum-heroin > *:nth-child(5) { animation-delay: 0.34s; }
        .eum-marquee-wrap { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
        .eum-marquee-track { display: flex; width: max-content; gap: 10px; animation: eumMarquee 30s linear infinite; }
        .eum-marquee-wrap:hover .eum-marquee-track { animation-play-state: paused; }
        .eum-cta-btn { transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.24s ease; }
        .eum-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(0,0,0,0.34) !important; }
        .eum-cta-btn:active { transform: translateY(0) scale(0.98); }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
        #root { text-align: left; }
        body {
          margin: 0; padding: 0;
          background: ${C.bg};
          font-family: ${FONT_STACK};
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
          text-rendering: optimizeLegibility;
          letter-spacing: -0.014em;
          word-break: keep-all; overflow-wrap: break-word;
        }
        /* 디스플레이 헤딩 — Pretendard 산세리프(상용 일관성) */
        .eum-serif { font-family: ${FONT_STACK}; letter-spacing: -0.035em; }
        h1, h2, h3 { text-wrap: balance; }
        p { text-wrap: pretty; }
        .eum-kicker { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; letter-spacing: -0.01em; padding: 5px 12px; border-radius: 999px; background: ${C.brandSoft}; color: ${C.brand}; }
        .eum-lift { transition: transform 0.24s cubic-bezier(0.22,1,0.36,1), box-shadow 0.24s cubic-bezier(0.22,1,0.36,1); }
        .eum-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 40px -16px rgba(26,26,30,0.18); }
        .eum-rolecard { transition: transform 0.24s cubic-bezier(0.22,1,0.36,1), box-shadow 0.24s ease, border-color 0.24s ease; }
        .eum-rolecard:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(26,26,30,0.2); border-color: ${C.brand}55 !important; }
        blockquote { quotes: none; margin: 0; }
        ::selection { background: ${C.brand}26; color: ${C.ink}; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible, a:focus-visible,
        [role="button"]:focus-visible, [role="tab"]:focus-visible {
          outline: 2.5px solid ${C.brand}; outline-offset: 3px; border-radius: 4px;
        }
        /* 본문 바로가기 — 키보드/스크린리더 사용자가 상단 네비를 건너뛰도록 (평소 숨김, 포커스 시 노출) */
        .eum-skip {
          position: fixed; top: -80px; left: 16px; z-index: 10000;
          display: inline-block; padding: 12px 18px; border-radius: 12px;
          background: ${C.brand}; color: #fff; font-size: 14px; font-weight: 700;
          font-family: ${FONT_STACK}; text-decoration: none;
          box-shadow: 0 10px 28px rgba(26,24,20,0.24);
          transition: top 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        .eum-skip:focus, .eum-skip:focus-visible { top: 14px; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 999px; border: 2px solid ${C.bg}; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.muteLight}; }
        /* Firefox 스크롤바 — webkit과 톤 일관 */
        html { scrollbar-width: thin; scrollbar-color: ${C.border} transparent; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; } html { scroll-behavior: auto; } }
      `}</style>

      {role && user && (
        <a
          href="#eum-main"
          className="eum-skip"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById('eum-main');
            if (el) { el.focus(); el.scrollIntoView({ block: 'start' }); }
          }}
        >
          본문 바로가기
        </a>
      )}

      {!role || !user ? (
        <>
          <RLLanding state={state} onSelectRole={handleSelectRole} onShowApplication={() => setShowApplication(true)} />
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

      {role && user && <WelfareFab role={role} />}
      <AccessibilityFab />

      {/* Toast 컨테이너 */}
      <div role="region" aria-live="polite" aria-atomic="false" aria-label="알림" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
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
