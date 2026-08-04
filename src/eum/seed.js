// ============================================================================
// SEED DATA — EumApp.jsx 에서 분리 (단일파일 분해 2단계). 값·구조 100% 동일.
// avatar_color 등에서 디자인 토큰 C 를 참조하므로 theme.js 에서 가져온다.
// ============================================================================
import { C } from './theme.js';

export const SEED_DATA = {
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
    { id: 's010', participant_id: 'p003', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A005', issued_at: '2027-07-01', status: 'paid', dispute: { status: 'received', reason: '6월에 활동기록을 8건 작성했는데 정산 시간이 6시간으로 집계된 것 같습니다. 미승인 기록 2건이 빠졌는지 확인 부탁드립니다.', raised_at: '2027-07-02', raised_by: 'p003', resolution: null, resolved_at: null, resolved_by: null } },
    { id: 's011', participant_id: 'p103', month: '2027-05', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2705-A006', issued_at: '2027-06-01', status: 'paid' },
    { id: 's012', participant_id: 'p103', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A006', issued_at: '2027-07-01', status: 'paid' },
    { id: 's013', participant_id: 'p004', month: '2027-06', total_hours: 6, amount_krw: 68750, voucher_code: 'KSL-2706-A007', issued_at: '2027-07-01', status: 'paid', dispute: { status: 'accepted', reason: '상생카드 발급 안내 문자를 받지 못했습니다.', raised_at: '2027-07-01', raised_by: 'p004', resolution: '발급 코드 재전송 완료, 수신 확인함. 알림톡 미전달 시 문자 자동 대체 발송을 SOP에 추가.', resolved_at: '2027-07-02', resolved_by: '코디 한가은' } },
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
