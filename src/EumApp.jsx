import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users, UserCheck, Calendar, Award, AlertTriangle, Heart, ShieldCheck,
  Sparkles, ChevronRight, ChevronLeft, ChevronDown, Check, X, Plus, Search,
  Bell, MapPin, Clock, FileText, LogOut, Home, BookOpen, Coffee,
  GraduationCap, Camera, Phone, Send, Trash2, Download, ArrowRight, Star,
  TrendingUp, Loader2, CheckCircle2, AlertCircle, Menu, Smile, Activity,
  ClipboardCheck, Wallet, ShieldAlert, Info, ChevronUp, UserPlus, PenLine,
  Hash, BellOff, WifiOff
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// ============================================================================
// 1. DESIGN TOKENS · STORAGE · UTILS — src/eum/* 모듈로 분리 (단일파일 분해 1단계)
//   값·로직은 100% 동일. 이 파일은 이제 화면(컴포넌트)에 집중한다.
// ============================================================================
import { C, PERSONA, FONT_STACK, SERIF_STACK, SHADOW } from './eum/theme.js';
import { normalizeState, loadState, saveState } from './eum/storage.js';
import { TODAY, krw, fmtDate, fmtRelativeDate, uid } from './eum/utils.js';
import { callClaude } from './eum/api.js';
import { aiDong, aiTrioScore, aiAutoTrios, aiWelfare } from './eum/matching.js';
import { SEED_DATA } from './eum/seed.js';
import { Avatar } from './eum/avatar.jsx';
import { TERMS_SECTIONS, PRIVACY_SECTIONS, LEGAL_META } from './eum/legal.js';
import { PLANS, formatKRW, isPaidPlan, requestSubscription, BILLING_ENABLED } from './eum/billing.js';
import { captureError } from './eum/telemetry.js';
import {
  Badge,
  OfficialSenderBadge,
  InsuranceBadge,
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Checkbox,
  useBodyScrollLock,
  useFocusTrap,
  Modal,
  Toast,
  KpiStrip,
  CountUp,
  Ring,
  AnimatedBar,
  Reveal,
  TrustBadge,
  useIsMobile,
  SearchBar,
  Tabs,
  Empty,
  Skeleton,
  EumLogo,
  PageHeader,
  Panel,
  Field,
  ChipSelect,
  prefersReducedMotion,
} from './eum/ui.jsx';
import { trustStatus, NotificationBell, CheckInOutCard, Sidebar, ConsumerLayout, Layout, TrustRow, HomeHub } from './eum/chrome.jsx';
import { EUM_API } from './eum/eumApi.js';
import { YouthApp } from './eum/apps/YouthApp.jsx';
import { SeniorApp } from './eum/apps/SeniorApp.jsx';
import { ParentApp, ConsumerPricing } from './eum/apps/ParentApp.jsx';

// ============================================================================
// 2. SEED DATA — src/eum/seed.js 로 이동 (상단 import)
// ============================================================================


// ============================================================================
// 3. STORAGE · 4. UTILS — src/eum/storage.js · src/eum/utils.js 로 이동 (상단 import)
// ============================================================================

// ============================================================================
// 5. UI PRIMITIVES — src/eum/ui.jsx 로 분리 (단일파일 분해 2단계, 상단 import)
// ============================================================================



// PersonaGlyph · Avatar — src/eum/avatar.jsx 로 분리 (상단 import { Avatar })


// 멘토 피드백① — 어르신 '첫 신뢰의 허들' 대응: 지자체 공인 인증 발신 표시

// 멘토 피드백② — 오프라인 활동 안전: 지자체 돌봄 책임보험 자동적용 표시







// 스크롤 잠금 카운터·포커스 트랩 셀렉터 — src/eum/ui.jsx 로 이동




// KPI 스트립 — 지표 카드를 흩뿌리지 않고 한 패널에 구획선으로 나눈다.
// 수치가 같은 베이스라인에 놓여야 서로 비교된다(대시보드·정산·안전이슈 공통).

// ── 모션 · 인포그래픽 툴킷 ────────────────────────────────────────────────
// prefers-reduced-motion 대응은 공용 헬퍼 prefersReducedMotion() 사용(아래 RL 섹션에 정의, 호이스팅).


// 애니메이션 진행 도넛(링)

// 애니메이션 막대

// 진입 애니메이션 래퍼 (마운트 시 fade + slide)

// 신뢰 배지 (Care.com식 검증 표시)

// trustStatus·NotificationBell·CheckInOutCard·Sidebar — src/eum/chrome.jsx 로 분리 (3단계)
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

// 휴대폰 번호 입력 자동 하이픈(010-1234-5678). 숫자만 남겨 최대 11자리로 포맷 —
// placeholder 형식과 일치시켜 검증(/^010-?\d{4}-?\d{4}$/) 통과를 돕는다.
function formatKoPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
  return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
}

// 신청 유형별 허용 연령대(만 나이). parent(양육가정) 신청자는 성인 보호자로 간주한다.
const AGE_RANGE = {
  teen: [15, 18], youth: [19, 39], adult: [40, 64], senior: [65, 120], parent: [19, 120],
};
// 나이 입력 검증: 비면 null(‘필수’는 별도), 숫자 아님/범위 위반 시 안내 문구 반환.
function ageErrorFor(type, ageRaw) {
  const s = String(ageRaw == null ? '' : ageRaw).trim();
  if (!s) return null;
  if (!/^\d{1,3}$/.test(s)) return '숫자로만 입력해 주세요.';
  const n = Number(s);
  const [min, max] = AGE_RANGE[type] || [14, 120];
  if (n < min || n > max) return `이 유형은 만 ${min}${max >= 120 ? '세 이상' : `~${max}세`}가 신청할 수 있어요.`;
  return null;
}

function ApplicationForm({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [legalDoc, setLegalDoc] = useState(null); // 'terms' | 'privacy' | null — 동의 단계 전문 보기
  const [form, setForm] = useState({
    type: '', name: '', age: '', phone: '', address: '광산구 ', emergency_contact: '',
    occupation: '', bio: '', skills: [], interests: [], availability: [],
    child_name: '', child_age: '', child_interests: '',
    consent_data: false, consent_photo: false, consent_criminal: false, consent_guardian: false,
  });
  const [submitted, setSubmitted] = useState(false);
  useBodyScrollLock(true);
  // 공용 Modal과 동일한 접근성: ESC 닫기 · 포커스 트랩 · 열릴 때 다이얼로그로 포커스 이동
  const panelRef = useRef(null);
  useFocusTrap(true, panelRef);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (legalDoc) { setLegalDoc(null); return; } // 전문 모달만 닫기
      if (onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, legalDoc]);
  useEffect(() => {
    const t = setTimeout(() => { if (panelRef.current) panelRef.current.focus(); }, 0);
    return () => clearTimeout(t);
  }, [submitted]);

  const SKILL_OPTIONS = ['디지털코칭', '학습멘토', '코딩교육', '예술교육', '건강관리', '독서지도', '글쓰기', '수학교육', '돌봄', '바느질', '뜨개질', '요리', '서예', '동화구연', '역사이야기', '바둑', '장기', '한자', '경험담', '응급처치'];
  const INTEREST_OPTIONS = ['IT', '진로상담', '여행', '교육', '문학', '심리', '디자인', '사진', '카페', '건강', '운동', '요리', '경제', '독서', '러닝', '손주', '드라마', '꽃', '산책', '역사', '등산', '뉴스', '걷기'];
  const TIME_OPTIONS = ['평일오전', '평일오후', '평일저녁', '토요일', '일요일'];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const canProceed = useMemo(() => {
    if (step === 1) return !!form.type;
    if (step === 2) return !!form.name && !!form.age && !ageErrorFor(form.type, form.age) && /^010-?\d{4}-?\d{4}$/.test(form.phone) && !!form.address && !!form.emergency_contact;
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
  const ageErr = useMemo(() => ageErrorFor(form.type, form.age), [form.type, form.age]);
  // 연락처: 입력이 있는데 형식이 안 맞을 때만 안내(빈 값은 '필수'로 별도 처리). 표준 오류 문법 사용.
  const phoneErr = useMemo(() => {
    const s = String(form.phone || '').trim();
    if (!s) return null;
    return /^010-?\d{4}-?\d{4}$/.test(s) ? null : '010-0000-0000 형식으로 입력해 주세요.';
  }, [form.phone]);

  const submit = () => {
    onSubmit(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="eum-modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease' }}>
        <div ref={panelRef} className="eum-modal-panel eum-sheet-grab" tabIndex={-1} role="dialog" aria-modal="true" aria-label="신청 접수 완료" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 460, width: '100%', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease', outline: 'none' }}>
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
    <div className="eum-modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.15s ease' }}>
      <div ref={panelRef} className="eum-modal-panel eum-sheet-grab" tabIndex={-1} role="dialog" aria-modal="true" aria-label="참여 신청" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, maxWidth: 600, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.28)', animation: 'slideUp 0.22s ease', outline: 'none' }}>
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
          <div role="group" aria-label={`신청 단계 ${step}/4`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 2px' }}>
        {['신청유형', '기본정보', form.type === 'parent' ? '자녀정보' : '경험·가능시간', '동의·제출'].map((label, i) => {
          const sNum = i + 1;
          const active = step === sNum;
          const done = step > sNum;
          return (
            <React.Fragment key={i}>
              <div aria-current={active ? 'step' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
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
          <div style={{ fontSize: 18, fontWeight: 800, color: C.headline, marginBottom: 6, letterSpacing: '-0.03em' }}>어떤 자격으로 참여하시나요?</div>
          <div style={{ fontSize: 13, color: C.navMute, marginBottom: 18, lineHeight: 1.55 }}>광산구에 거주하시면 <strong style={{ color: C.inkSoft }}>청소년부터 어르신까지 누구나</strong> 신청할 수 있어요. 연령 구간은 안내용 가이드이며, 유형에 따라 절차가 조금씩 다릅니다.</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {TYPES.map((t) => {
              const on = form.type === t.id;
              return (
              <div key={t.id} role="button" tabIndex={0} onClick={() => set('type', t.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set('type', t.id); } }}
                style={{ cursor: 'pointer', borderRadius: 14, padding: 16, border: `1.5px solid ${on ? t.color : C.line}`, background: on ? t.soft : C.panel, transition: 'border-color .15s ease, background .15s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: on ? t.color : t.color + '16', color: on ? '#fff' : t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s ease, color .15s ease' }}>
                    {React.createElement(t.icon, { size: 22 })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{t.label} <span style={{ fontSize: 12, color: C.muteLight, fontWeight: 500 }}>({t.age})</span></div>
                    <div style={{ fontSize: 13, color: C.navMute, marginTop: 3 }}>{t.desc}</div>
                  </div>
                  {on && <Check size={20} color={t.color} strokeWidth={3} />}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Basic info */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="성함" required>
            <Input value={form.name} onChange={(v) => set('name', v)} placeholder="홍길동" autoComplete="name" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <Field label="나이" required error={ageErr} errorId="app-age-error">
              <Input value={form.age} onChange={(v) => set('age', v)} placeholder="27" type="number" inputMode="numeric" min={14} max={120} error={ageErr} describedBy={ageErr ? 'app-age-error' : undefined} />
            </Field>
            <Field label="연락처" required error={phoneErr} errorId="app-phone-error">
              <Input value={form.phone} onChange={(v) => set('phone', formatKoPhone(v))} placeholder="010-1234-5678" type="tel" autoComplete="tel" inputMode="numeric" maxLength={13} error={phoneErr} describedBy={phoneErr ? 'app-phone-error' : undefined} />
            </Field>
          </div>
          <Field label="거주지" required>
            <Input value={form.address} onChange={(v) => set('address', v)} placeholder="광주광역시 광산구 우산동 ..." icon={<MapPin size={15} />} autoComplete="street-address" />
          </Field>
          <Field label="비상연락처" required sub="가족/지인 연락처와 관계 (예: 010-1234-5678 (모친))">
            <Input value={form.emergency_contact} onChange={(v) => set('emergency_contact', v)} placeholder="010-0000-0000 (관계)" icon={<Phone size={15} />} autoComplete="off" />
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
              <Input value={form.child_age} onChange={(v) => set('child_age', v)} placeholder="8" type="number" inputMode="numeric" min={1} max={18} />
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
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>법적 동의 사항</div>
            <div style={{ fontSize: 12.5, display: 'flex', gap: 10 }}>
              <span role="button" tabIndex={0} onClick={() => setLegalDoc('terms')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLegalDoc('terms'); } }} style={{ color: C.inkSoft, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>이용약관 전문</span>
              <span role="button" tabIndex={0} onClick={() => setLegalDoc('privacy')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLegalDoc('privacy'); } }} style={{ color: C.ink, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>개인정보처리방침 전문</span>
            </div>
          </div>
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
          {/* 파일럿 안내 — 실수집 OFF: 서버 전송 없이 이 브라우저에만 저장 */}
          <div role="note" style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: C.amberSoft, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Info size={15} style={{ color: C.gold, flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>
              현재는 <b>파일럿(시연) 단계</b>입니다. 제출하신 내용은 서버로 전송되지 않고 <b>이 기기(브라우저)에만 저장</b>되며, 정식 수집 시작 시 별도 고지와 동의 절차를 거칩니다.
            </div>
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
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}




// YouthApp·SeniorApp·ConsumerLayout·Layout·ParentApp — src/eum/apps/*·chrome.jsx 로 분리 (3단계)
// ============================================================================
// 10. CLAUDE API HELPER — src/eum/api.js 로 이동 (상단 import { callClaude })
//   AI 매칭 추천 & 월간 리포트 요약용 외부 API 헬퍼. 동작·값 100% 동일.
// ============================================================================

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
      {view === 'notices' && <CoordNotices state={state} dispatch={dispatch} showToast={showToast} user={user} />}
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
// aiDong · aiTrioScore · aiAutoTrios · aiWelfare(및 내부 헬퍼 aiOverlap/aiClamp,
// 가중치 상수 AI_W/AI_LBL/AI_THES)는 순수 로직이라 ./eum/matching.js 로 분리했다(동작 불변).
// 상단 import 로 연결되어 있으며, AI_RATE(정산단가)는 컴포넌트 전용이라 여기 남겨둔다.
function AIWrap({ label, children, color }){
  // AI 생성 결과 블록 — 컬러 보더+파스텔 배경을 걷어내고, 흰 패널 + 상단 라벨 스트립으로.
  // 'AI가 만든 영역'임은 Sparkles 아이콘과 라벨로 알리고, 색은 절제한다.
  const c = color || C.brand;
  return (
    <div style={{ border:`1px solid ${C.line}`, borderRadius:14, background:C.panel, boxShadow:SHADOW.xs, marginTop:14, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px', borderBottom:`1px solid ${C.lineSoft}`, background:C.lineSoft }}>
        <Sparkles size={13} style={{ color:c }} />
        <span style={{ fontSize:12, fontWeight:700, color:C.headline, letterSpacing:'-0.01em' }}>{label}</span>
        <span style={{ marginLeft:'auto', fontSize:10.5, fontWeight:700, color:c, background:c+'14', padding:'2px 7px', borderRadius:6 }}>AI 생성</span>
      </div>
      <div style={{ padding:'16px 18px' }}>{children}</div>
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
      <div className="eum-ai-cols" style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:16 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:C.headline, marginBottom:10, letterSpacing:'-0.02em' }}>참여자 선택</div>
          <select value={pid} onChange={e=>{ setPid(e.target.value); setRun(false); }}
            onFocus={e=>{ e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}1f`; }}
            onBlur={e=>{ e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
            style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid '+C.line, background:C.panel, fontFamily:FONT_STACK, fontSize:13, fontWeight:600, color:C.ink, cursor:'pointer', outline:'none', transition:'border-color 0.15s ease, box-shadow 0.15s ease' }}>
            {people.map(p=><option key={p.id} value={p.id}>{p.name} · {PERSONA[p.type]?.label} · {p.age}세</option>)}
          </select>
          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:11 }}>
            {cks.map(([k,t])=>(
              <label key={k} style={{ fontSize:12.5, display:'flex', gap:9, alignItems:'center', cursor:'pointer', color:C.inkSoft, fontWeight:500 }}>
                <input type="checkbox" checked={flags[k]} onChange={e=>{ setFlags({ ...flags, [k]:e.target.checked }); setRun(false); }} style={{ accentColor:C.brand, width:15, height:15 }} />{t}
              </label>
            ))}
          </div>
          <Button variant="brand" fullWidth style={{ marginTop:16 }} loading={busy} onClick={go}>{busy ? '분석 중…' : '복지 추천 받기'}</Button>
        </Card>
        <div>
          {!run && !busy && <Card padding={0}><Empty icon={<Sparkles size={26} />} title="아직 추천 결과가 없습니다" sub="왼쪽에서 참여자와 상황을 선택하고 ‘복지 추천 받기’를 누르면 결과가 이곳에 표시돼요" /></Card>}
          {run && (
            <AIWrap label="AI 복지 어드바이저" color={C.lavender}>
              <div style={{ fontSize:13, color:C.inkSoft, marginBottom:14 }}><b style={{ color:C.headline }}>{person.name}</b>님이 받을 수 있는 복지서비스 <b style={{ color:C.lavender }}>{res.length}건</b>을 찾았습니다.</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {res.map((x,i)=>(
                  <div key={i} style={{ border:`1px solid ${C.line}`, borderLeft:`3px solid ${x.gap?C.brand:C.sage}`, borderRadius:11, padding:'13px 15px', background:C.panel }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:C.headline, letterSpacing:'-0.02em' }}>{x.name}</span>
                      {x.gap ? <Badge color={C.brand} soft={C.brandSoft} size="sm">사각지대 발굴</Badge> : <Badge color={C.sage} soft={C.sageSoft} size="sm">수급 중</Badge>}
                    </div>
                    <div style={{ fontSize:12.5, color:C.navMute, marginTop:6, lineHeight:1.55 }}>{x.why}</div>
                    <div style={{ display:'flex', gap:14, marginTop:9, flexWrap:'wrap', fontSize:11.5, color:C.inkSoft }}><span><b style={{ color:C.gold }}>혜택</b> {x.benefit}</span><span><b style={{ color:C.blue }}>신청</b> {x.where}</span></div>
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
        right={<div style={{ display:'inline-flex', gap:2, background:C.lineSoft, padding:4, borderRadius:12, border:`1px solid ${C.line}` }}>{[['auto','AI 자동추천'],['self','직접 선택']].map(([m,t])=><button key={m} onClick={()=>setMode(m)} style={{ border:'none', cursor:'pointer', fontFamily:FONT_STACK, fontWeight:mode===m?700:600, fontSize:13, padding:'7px 13px', borderRadius:9, background:mode===m?C.panel:'transparent', color:mode===m?C.headline:C.navMute, boxShadow:mode===m?SHADOW.sm:'none', transition:'background .16s ease, color .16s ease' }}>{t}</button>)}</div>} />
      {mode==='auto' && (
        <div>
          <Button variant="brand" loading={busy} onClick={runAuto}>{busy ? '조합 계산 중…' : 'AI 자동매칭 실행'}</Button>
          {autoRes && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:13, marginTop:14 }}>
              {autoRes.map((t,i)=>(
                <Card key={i}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}><Badge color={C.blue} soft={C.blueSoft} size="sm">추천 #{i+1}</Badge><span style={{ fontSize:22, fontWeight:800, color:C.headline, letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums' }}>{t.total}<span style={{ fontSize:12, color:C.muteLight, fontWeight:600 }}>점</span></span></div>
                  <div style={{ display:'flex', gap:6, margin:'11px 0', flexWrap:'wrap' }}><Badge color={C.sage} soft={C.sageSoft} size="sm">{t.y.name}</Badge><Badge color={C.lavender} soft={C.lavenderSoft} size="sm">{t.s.name}</Badge><Badge color={C.peach} soft={C.peachSoft} size="sm">{t.c.name}</Badge></div>
                  <AIBars parts={t.parts} />
                  <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:3 }}>{t.tags.slice(0,3).map((tg,j)=><div key={j} style={{ fontSize:11.5, color:C.navMute }}>· <b style={{ color:C.inkSoft }}>{tg[0]}</b> {tg[1]}</div>)}</div>
                  <Button variant="secondary" size="sm" fullWidth style={{ marginTop:12 }} onClick={()=>showToast && showToast('코디 확정 대기열에 담았습니다','success')}>코디 확정 검토</Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {mode==='self' && (
        <div>
          <div style={{ fontSize:12.5, color:C.inkSoft, marginBottom:12 }}>직접 상대를 골라 조를 구성하세요. <Badge color={C.gold} soft={C.goldSoft}>안전·거리 가드레일 통과 후보만</Badge></div>
          <div className="eum-ai-cols" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[['청년',youths,yId,setY],['어르신',seniors,sId,setS],['아동',children,cId,setC]].map(([t,arr,val,set])=>(
              <Card key={t} padding={13}>
                <div style={{ fontSize:11.5, fontWeight:700, color:C.navMute, marginBottom:9 }}>{t} 선택</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {arr.map(o=><button key={o.id} onClick={()=>set(o.id)} style={{ textAlign:'left', cursor:'pointer', fontFamily:FONT_STACK, fontSize:12.5, fontWeight:val===o.id?700:500, padding:'8px 10px', borderRadius:9, background:val===o.id?C.brandSoft:C.panel, border:'1px solid '+(val===o.id?'transparent':C.line), color:val===o.id?C.brand:C.ink, transition:'background .14s ease' }}>{o.name} <span style={{ fontSize:10.5, color:C.muteLight, fontWeight:500 }}>{o.age}·{aiDong(o.address)}</span></button>)}
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
      <Button variant="brand" loading={busy} onClick={go}>{busy ? '요약·정산·보고서 생성 중…' : '코파일럿 실행'}</Button>
      {out && (
        <div style={{ marginTop:16 }}>
          <KpiStrip items={[
            { label:'총 활동', value: out.cnt, unit:'회', color:C.brand, icon:<Activity size={15} /> },
            { label:'총 시간', value: out.hrs, unit:'h', color:C.sage, icon:<Clock size={15} /> },
            { label:'참여 조', value: out.trios, unit:'개', color:C.lavender, icon:<Users size={15} /> },
            { label:'정산 예정', value:'₩'+out.settle.toLocaleString('ko-KR'), color:C.gold, icon:<Wallet size={15} /> },
          ]} />
          <AIWrap label="지자체 운영보고서 초안" color={C.lavender}>
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
      <div className="eum-ai-cols" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:12, color:C.headline, letterSpacing:'-0.02em' }}>활동 대화 (STT 전사)</div>
          {AI_TRANSCRIPT.map((u,i)=>{ const hit = done && flags.some(f=>f.i===i); return (
            <div key={i} style={{ fontSize:13, padding: hit?'8px 10px':'8px 0', color:C.inkSoft, background:hit?C.redSoft:'transparent', borderRadius:8, marginBottom:2, lineHeight:1.5, transition:'.3s', display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}><b style={{ color:C.headline }}>{u.sp}</b> · {u.t} {hit && <Badge color={C.red} soft={C.redSoft} size="sm">위험신호</Badge>}</div>
          ); })}
          <Button variant="brand" style={{ marginTop:12 }} loading={busy} onClick={go}>{busy ? '음성·텍스트 분석 중…' : 'AI 안전 분석 실행'}</Button>
        </Card>
        <div>
          {!done && !busy && <Card padding={0}><Empty icon={<ShieldCheck size={26} />} title="아직 분석 전입니다" sub="왼쪽에서 ‘AI 안전 분석 실행’을 누르면 위험신호와 권고 조치가 이곳에 표시돼요" /></Card>}
          {done && (
            <AIWrap label="AI 안전 채퍼론" color={C.lavender}>
              <div style={{ textAlign:'center', margin:'2px 0 14px' }}><div style={{ fontSize:36, fontWeight:800, color:rc, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>{score}</div><div style={{ fontSize:11.5, color:C.navMute, fontWeight:500 }}>위험 점수 / 100</div></div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{flags.map((f,j)=><div key={j} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5 }}><Badge color={f.sev>=2?C.red:C.gold} soft={f.sev>=2?C.redSoft:C.goldSoft} size="sm">{f.risk}</Badge><span style={{ color:C.inkSoft }}>“…{f.w}…” ({f.sp})</span></div>)}</div>
              <div style={{ marginTop:14, padding:'12px 14px', background:C.brandBg, borderLeft:`3px solid ${C.brand}`, borderRadius:10 }}><div style={{ fontSize:12, fontWeight:700, color:C.brand, marginBottom:5 }}>권고 조치</div><div style={{ fontSize:12, color:C.inkSoft, lineHeight:1.6 }}>① 건강(무릎)·경제 부담 → 복지 어드바이저 연계 ② 고립·정서 신호 → 다음 방문 우선 ③ 위험 누적 시 매칭 일시중단.</div></div>
              <Button variant="brand" size="sm" fullWidth style={{ marginTop:12 }} onClick={()=>showToast && showToast('안전 이슈 등록 + 복지 어드바이저 연계 완료','success')}>안전 이슈 등록 + 어드바이저 연계</Button>
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
        <button key={it.id} onClick={() => setView(it.id)} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: FONT_STACK, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '12px 14px', boxShadow: SHADOW.xs, display: 'flex', alignItems: 'center', gap: 11, transition: 'border-color .16s ease, background .16s ease, transform .2s cubic-bezier(0.22,1,0.36,1), box-shadow .2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D7DAE0'; e.currentTarget.style.background = C.hover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = SHADOW.md; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.panel; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW.xs; }}>
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
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${color}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: '16px 18px' }}>
      <div style={{ fontSize: 12, color: C.navMute, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.headline, marginTop: 6, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.muteLight, marginTop: 5, lineHeight: 1.45, fontWeight: 500 }}>{sub}</div>}
    </div>
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
        <Panel title="기존 복지 플랫폼 연계 현황" sub="새 시스템 강요 없이, 지자체가 쓰는 시스템 위에 얹힙니다.">
          {link.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
              <ShieldCheck size={15} style={{ color: C.blue, flex: '0 0 auto' }} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{l[0]}</div><div style={{ fontSize: 11.5, color: C.navMute, marginTop: 1 }}>{l[1]}</div></div>
              <Badge color={C.sage} soft={C.sageSoft} size="sm">{l[2]}</Badge>
            </div>
          ))}
        </Panel>
        <Panel title="사각지대 발굴 리스트" sub="받을 수 있는데 못 받는 어르신을 먼저 찾습니다.">
          {gapList.map((g, i) => (
            <div key={g.p.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
              <Avatar type="senior" name={g.p.name} size={30} color={C.lavender} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.headline }}>{g.p.name} · {g.p.age}세</div><div style={{ fontSize: 11.5, color: C.navMute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>미신청 {g.gaps.length}건 · {g.names.join(' · ')}</div></div>
              <Badge color={C.brand} soft={C.brandSoft} size="sm">발굴</Badge>
            </div>
          ))}
          <Button variant="brand" size="sm" fullWidth style={{ marginTop: 14 }} onClick={() => showToast && showToast({ type: 'success', message: '지자체 제출용 운영보고서를 생성했습니다' })}>지자체 운영보고서 자동 생성</Button>
        </Panel>
      </div>

      <div style={{ marginTop: 14, background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.blue}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 7 }}>도입 효과 한 줄</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.65 }}>인력 채용·전산 구축보다 <b>저렴한 사용료</b>로, 이미 잡힌 돌봄 예산으로 <b>바로 시작</b>합니다. ‘세대를 잇는 마을 돌봄’이 주민에게 보여줄 <b>성과</b>가 됩니다. 진입은 ① 사회서비스 바우처 → ② 플랫폼 사용료 → ③ 민간위탁 순.</div>
      </div>
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
      <Panel title="ESG 성과 리포트 (요약)" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {esg.map((e, i) => (
            <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: '13px 15px', borderLeft: `3px solid ${e[2]}`, background: C.panel }}>
              <div style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600 }}>{e[0]}</div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: C.headline, marginTop: 4, letterSpacing: '-0.02em' }}>{e[1]}</div>
            </div>
          ))}
        </div>
        <Button variant="success" size="sm" style={{ marginTop: 14 }} onClick={() => showToast && showToast('기업 ESG 성과 리포트(PDF 초안)를 생성했습니다', 'success')}>ESG 리포트 생성</Button>
      </Panel>
      <div style={{ marginTop: 14, background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.sage}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: '16px 18px' }}>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.65 }}><b>B2B 패키지</b> — 회사는 신청만, 모집·매칭·운영·정산은 이음이 턴키로. 직원이 가족 걱정을 덜어 <b>이직이 줄고</b> 만족도가 오릅니다. 복지관·어린이집은 ‘기존 사업 강화’로 도입.</div>
      </div>
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
      <button className="eum-noprint" onClick={() => setOpen(true)} aria-label="복지 어드바이저" style={{ position: 'fixed', right: 22, bottom, marginBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 9000, display: 'flex', alignItems: 'center', gap: 8, background: C.lavender, color: '#fff', border: 'none', borderRadius: 999, padding: big ? '16px 22px' : '13px 18px', fontFamily: FONT_STACK, fontWeight: 800, fontSize: big ? 16 : 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(127,111,160,.45)' }}>
        <Sparkles size={big ? 22 : 18} /> 복지 찾기
      </button>
      {open && (
        <div className="eum-modal-overlay" onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9400, background: 'rgba(26,24,20,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="eum-modal-panel" role="dialog" aria-modal="true" aria-label="복지 어드바이저" onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, width: '100%', maxWidth: 460, maxHeight: '86vh', overflowY: 'auto', padding: 22, fontFamily: FONT_STACK }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 800, color: C.lavender }}><Sparkles size={20} /> 복지 어드바이저</div>
              <button onClick={() => setOpen(false)} aria-label="닫기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.mute }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, marginBottom: 14 }}>몇 가지만 고르면 <b>받을 수 있는 복지</b>를 찾아드려요. 가입 없이 바로요.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft }}>나이</span>
              <input type="number" value={pf.age} onChange={e => { setPf({ ...pf, age: +e.target.value }); setRun(false); }} inputMode="numeric" aria-label="나이(세)" min={0} max={120} style={{ width: 90, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.border}`, fontFamily: FONT_STACK, fontSize: 15 }} />
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

// ConsumerPricing·VolunteerHub·YouthDiscover — src/eum/apps/* 로 분리 (3단계)
// ============================================================================
// 리치 메인화면(랜딩) 복원 — git f07a3ca 이식 (2026-06)
//  히어로·임팩트 카운터·3세대 후기·차별성·수익모델·FAQ·구독요금·벤치마킹
//  RL* 접두사로 네임스페이스(기존 컴포넌트 무충돌). 위치=광주 광산구 우산동
// ============================================================================
// --- 리치 랜딩 의존 헬퍼 복원(f07a3ca/settlement.js) ---
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
  const reduce = prefersReducedMotion();
  const [draw, setDraw] = useState(reduce ? pct : 0);
  useEffect(() => {
    if (reduce) { setDraw(pct); return undefined; }
    const id = requestAnimationFrame(() => setDraw(pct));
    return () => cancelAnimationFrame(id);
  }, [pct, reduce]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)}
          style={{ transition: reduce ? 'none' : `stroke-dashoffset ${duration}ms cubic-bezier(0.22,1,0.36,1)` }} />
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
const TOBE_CSS = `.eum-tobe{--ink:#241d17;--paper:#fff;--cream:#fbf7f2;--cream2:#f4ede4;--coral:#BE5535;--coral-d:#9E4329;--coral-soft:#F4E7E0;--green:#4b7a52;--green-soft:#e9f1e7;--purple:#6a5aa0;--purple-soft:#efeaf6;--clay:#9a6a52;--sub:#5f564d;--mut:#9b9186;--line:#eee6dc;word-break:keep-all;-webkit-font-smoothing:antialiased;}
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
        <img src="/safety-3gen.jpg" alt="어르신이 공식 알림톡을 안심하고 확인하는 모습" style={{ width: '100%', display: 'block', aspectRatio: '4 / 4.5', objectFit: 'cover', objectPosition: 'center 28%' }} loading="lazy" decoding="async" />
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
          <button onClick={onShowApplication} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, borderRadius: 15, padding: '16px 28px', fontSize: 16, cursor: 'pointer', border: '1.5px solid transparent', background: C.brand, color: '#fff', boxShadow: '0 8px 20px rgba(190,85,53,.24)', fontFamily: 'inherit' }}>카카오톡으로 시작하기</button>
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

// 법적 고지 모달 — 이용약관 · 개인정보처리방침 (src/eum/legal.js 초안)
function LegalModal({ doc, onClose }) {
  const isTerms = doc === 'terms';
  const isPrivacy = doc === 'privacy';
  if (!isTerms && !isPrivacy) return null;
  const title = isTerms ? '이용약관' : '개인정보처리방침';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  return (
    <Modal open={!!doc} onClose={onClose} title={title} size="lg">
      <div style={{ fontSize: 12.5, color: C.mute, marginBottom: 16, lineHeight: 1.6 }}>
        {LEGAL_META.service} · 운영 {LEGAL_META.operator} · 시행(예정)일 {LEGAL_META.effectiveDate}
        {LEGAL_META.status === 'draft' && (
          <span style={{ display: 'inline-block', marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: C.amberSoft, color: C.gold, fontSize: 11, fontWeight: 700 }}>초안 · 법무 검토 전</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {sections.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{s.h}</div>
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{s.body}</div>
          </div>
        ))}
      </div>
    </Modal>
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
  const [legalDoc, setLegalDoc] = useState(null); // 'terms' | 'privacy' | null
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
                <img className="eum-hero-img" src="/hero-3gen.jpg" alt="어르신·엄마·아이 3세대가 함께 웃는 모습" style={{ width: '100%', display: 'block', aspectRatio: '4 / 3.4', objectFit: 'cover', objectPosition: 'center 32%' }} loading="eager" decoding="async" fetchPriority="high" />
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
                {/* 세대 글리프가 또렷하게 보이도록 흰 원 위에 페르소나 색으로 표시 */}
                <div style={{ transform: 'translateY(50%)', width: 54, height: 54, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px -6px rgba(0,0,0,0.25)' }}>
                  <Avatar type={p.role} gender={p.gender} name={p.name} color={p.color} size={48} />
                </div>
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
                <span role="button" tabIndex={0} onClick={() => { const el = document.getElementById('eum-demo'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const el = document.getElementById('eum-demo'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }} style={{ fontSize: 13.5, color: C.inkSoft, fontWeight: 500, cursor: 'pointer' }}>둘러보기 · 데모 체험</span>
                <span role="button" tabIndex={0} onClick={onShowApplication} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onShowApplication(); } }} style={{ fontSize: 13.5, color: C.inkSoft, fontWeight: 500, cursor: 'pointer' }}>5분 참여 신청</span>
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span>© 2027 이음 · 운영 주식회사 고원(GOWON)</span>
              <span role="button" tabIndex={0} onClick={() => setLegalDoc('terms')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLegalDoc('terms'); } }} style={{ color: C.inkSoft, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>이용약관</span>
              <span role="button" tabIndex={0} onClick={() => setLegalDoc('privacy')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLegalDoc('privacy'); } }} style={{ color: C.ink, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>개인정보처리방침</span>
            </span>
            <span>광주 광산구 우산동 3세대 상생 품앗이 파일럿 · 데모 모드</span>
          </div>
        </div>
      </div>
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60, width: 46, height: 46, borderRadius: '50%', background: C.ink, color: '#fff', border: 'none', boxShadow: '0 10px 28px -8px rgba(26,26,30,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeUp 0.3s ease' }}>
          <ChevronUp size={22} />
        </button>
      )}
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}

// EUM_API — src/eum/eumApi.js · TrustRow — src/eum/chrome.jsx 로 분리 (3단계)
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
    <button className="eum-noprint" onClick={toggle} aria-label="큰 글씨 전환" title="큰 글씨 전환" style={{ position: 'fixed', left: 22, bottom: 24, marginBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 9000, display: 'flex', alignItems: 'center', gap: 7, background: big ? C.ink : C.card, color: big ? '#fff' : C.ink, border: `1.5px solid ${C.ink}`, borderRadius: 999, padding: '11px 16px', fontFamily: FONT_STACK, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 18px rgba(26,24,20,.2)' }}>
      <span style={{ fontSize: 17 }}>가</span>{big ? '기본 글씨' : '큰 글씨'}
    </button>
  );
}

// HomeHub — src/eum/chrome.jsx 로 분리 (3단계)
function CoordOverview({ state, setView, dispatch }) {
  // 데모 초기화 확인 — 네이티브 confirm 대신 디자인시스템 Modal(포커스트랩·ESC·바텀시트) 사용
  const [resetOpen, setResetOpen] = useState(false);
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
      <PageHeader title="대시보드" subtitle={`${fmtDate(TODAY)} · 광주 광산구 우산동 1차 파일럿`} right={<Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => setResetOpen(true)}>데모 초기화</Button>} />
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="데모 데이터 초기화"
        size="sm"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>취소</Button>
            <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => { setResetOpen(false); dispatch && dispatch({ type: 'RESET_DATA' }); }}>초기화</Button>
          </>
        )}
      >
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.7 }}>
          데모 데이터를 처음 상태로 되돌릴까요?<br />
          지금까지 화면에서 변경한 내용은 모두 사라집니다.
        </div>
      </Modal>
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
          {monthlyChart.length === 0 ? <Empty icon={<TrendingUp size={28} />} title="아직 활동 기록이 없습니다" sub="활동이 승인되면 시간 추이가 이곳에 그려져요" /> : (
            /* 차트 접근성 — SVG 차트는 스크린리더에 비어 보이므로, 데이터 요약을 role=img 라벨로 제공 */
            <div
              role="img"
              aria-label={`누적 활동시간 추이 차트. ${monthlyChart[0].month}부터 ${monthlyChart[monthlyChart.length - 1].month}까지, 현재 누적 ${monthlyChart[monthlyChart.length - 1].cumulative}시간.`}
            >
              <div aria-hidden="true">
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
              </div>
            </div>
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* 세대 구성 — 개별 막대 4개는 값이 비슷하면 전부 꽉 차 보여서 의미가 없다.
              전체 대비 '몫'을 보여주는 스택 바 하나 + 값 목록이 정직하다. */}
          <Panel title="세대 구성" sub={`전체 ${kpis.totalParticipants}명`}>
            {(() => {
              const rows = [['청년', kpis.youthCount, C.sage], ['어르신', kpis.seniorCount, C.lavender], ['양육가정', kpis.parentCount, C.peach], ['아동', kpis.childCount, C.gold]];
              const sum = rows.reduce((s, r) => s + r[1], 0) || 1;
              return (
                <>
                  <div
                    role="img"
                    aria-label={`세대 구성 비율 막대. ${rows.map(([lab, val]) => `${lab} ${val}명`).join(', ')}.`}
                    style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', background: C.lineSoft, marginBottom: 16 }}
                  >
                    {rows.map(([lab, val, col]) => val > 0 && (
                      <div key={lab} title={`${lab} ${val}명`} style={{ width: `${(val / sum) * 100}%`, background: col, transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)' }} />
                    ))}
                  </div>
                  {rows.map(([lab, val, col], i) => (
                    <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: col, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12.5, color: C.inkSoft, fontWeight: 500 }}>{lab}</span>
                      <span style={{ fontSize: 12, color: C.muteLight, fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'right' }}>{Math.round((val / sum) * 100)}%</span>
                      <span style={{ fontSize: 13, color: C.headline, fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 30, textAlign: 'right' }}>{val}</span>
                    </div>
                  ))}
                </>
              );
            })()}
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
          {typeChart.length === 0 ? <Empty icon={<Activity size={28} />} title="아직 활동이 없습니다" sub="활동을 시작하면 유형별로 모아 보여드려요" /> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div
                role="img"
                aria-label={`활동 유형 분포 도넛 차트. ${typeChart.map((t) => `${t.name} ${t.value}건`).join(', ')}.`}
                style={{ width: 168, height: 168, flexShrink: 0 }}
              >
                <div aria-hidden="true" style={{ width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeChart} dataKey="value" cx="50%" cy="50%" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none" isAnimationActive={false}>
                      {typeChart.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: SHADOW.md, fontFamily: FONT_STACK, fontSize: 12.5, padding: '8px 12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                </div>
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
            <Empty icon={<Calendar size={24} />} title="오늘은 예정된 활동이 없습니다" sub="여유로운 하루예요. 다음 일정을 미리 확인해보세요" />
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
        ariaLabel="신청자 상태 필터"
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

      {filtered.length === 0 ? <Empty icon={<UserPlus size={32} />} title={query || typeFilter !== 'all' ? '조건에 맞는 신청자가 없습니다' : `${activeTab === 'screening' ? '검토 대기' : activeTab === 'verified' ? '검증 중인' : activeTab === 'completed' ? '활동 중인' : '반려된'} 신청자가 없습니다`} sub={query || typeFilter !== 'all' ? '검색어나 필터 조건을 조정해보세요' : '새 신청이 접수되면 이곳에 표시됩니다'} /> : (
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
              <div style={{ display: 'flex', gap: 16, padding: 16, background: C.lineSoft, borderRadius: 10, marginBottom: 20 }}>
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

              <div style={{ fontSize: 12, fontWeight: 700, color: C.navMute, letterSpacing: '-0.01em', marginBottom: 10 }}>지원 동기 · 소개</div>
              <div style={{ padding: 14, background: C.lineSoft, borderRadius: 8, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 16 }}>
                {p?.bio || '특별한 소개글이 없습니다.'}
              </div>

              {p?.skills?.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.navMute, letterSpacing: '-0.01em', marginBottom: 10 }}>잘하는 것</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {p.skills.map((s, i) => <span key={i} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, background: C.brandSoft, color: C.brand, fontWeight: 600 }}>{s}</span>)}
                  </div>
                </>
              )}

              <div style={{ fontSize: 12, fontWeight: 700, color: C.navMute, letterSpacing: '-0.01em', marginBottom: 10 }}>검증 단계</div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}><span style={{ width: 7, height: 7, borderRadius: 3, background: C.amber }} /><span style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>제안된 매칭</span><span style={{ fontSize: 12, color: C.muteLight, fontWeight: 500 }}>동의 대기 중</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14, marginBottom: 24 }}>
            {proposedMatches.map(match => <MatchCard key={match.id} match={match} state={state} onClick={() => setSelectedMatch(match)} accent={C.amber} />)}
          </div>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}><span style={{ width: 7, height: 7, borderRadius: 3, background: C.success }} /><span style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>활동 중 매칭</span></div>
      {activeMatches.length === 0 ? <Empty icon={<Heart size={32} />} title="활성 매칭이 없습니다" sub="AI 추천을 받아 새 매칭을 시작해보세요" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
          {activeMatches.map(match => <MatchCard key={match.id} match={match} state={state} onClick={() => setSelectedMatch(match)} accent={C.success} />)}
        </div>
      )}

      {(availableYouth.length + availableSenior.length + availableChild.length) > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 7, height: 7, borderRadius: 3, background: C.amber }} /><span style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>매칭 대기</span><span style={{ fontSize: 12, color: C.muteLight, fontWeight: 500 }}>미배정 {availableYouth.length + availableSenior.length + availableChild.length}명</span></div>
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
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: C.lineSoft, borderRadius: 9 }}>
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
                  <div key={p.id} style={{ padding: 14, background: C.lineSoft, borderRadius: 10, textAlign: 'center' }}>
                    <Avatar type={p?.type} gender={p?.gender} name={p.name} size={56} color={color} />
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 8, fontFamily: SERIF_STACK }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: color, fontWeight: 700, marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                {[
                  ['누적 활동시간', `${hours}시간`],
                  ['활동 횟수', `${logs.length}회`],
                  ['시작일', fmtDate(selectedMatch.started_at)],
                ].map(([lab, val]) => (
                  <div key={lab} style={{ padding: '12px 14px', background: C.lineSoft, borderRadius: 10 }}>
                    <div style={{ fontSize: 11.5, color: C.navMute, fontWeight: 600 }}>{lab}</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navMute, marginBottom: 8 }}>매칭 사유</div>
              <div style={{ padding: '12px 14px', background: C.lineSoft, borderRadius: 10, fontSize: 13, color: C.inkSoft, lineHeight: 1.65, marginBottom: 16 }}>{selectedMatch.match_notes || '기록 없음'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navMute, marginBottom: 8 }}>코디 메모</div>
              <div style={{ padding: '12px 14px', background: C.lineSoft, borderRadius: 10, fontSize: 13, color: C.inkSoft, lineHeight: 1.65 }}>{selectedMatch.coordinator_note || '메모 없음'}</div>
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
  // 적합도(score)는 시드 데이터에 존재하지 않는 필드였다 — 없는 지표를 0으로 그리는 대신,
  // 실제로 존재하는 '매칭 사유(match_notes)'를 보여준다. 코디네이터가 판단에 쓰는 정보다.
  const note = (match.match_notes || '').trim();

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

        {/* 매칭 사유 — 2줄 클램프. 카드 높이를 고르게 유지한다. */}
        {note && (
          <div style={{
            marginBottom: 14, padding: '10px 12px',
            background: C.lineSoft, borderRadius: 10,
            fontSize: 12.5, color: C.navMute, lineHeight: 1.55, fontWeight: 500,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {note}
          </div>
        )}

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
        ariaLabel="활동 기록 승인 상태 필터"
        tabs={[
          { id: 'pending', label: '승인 대기', count: pendingLogs.length },
          { id: 'approved', label: '승인됨', count: approvedLogs.length },
        ]}
        active={activeTab}
        onChange={(t) => { setActiveTab(t); setSelected(new Set()); }}
        style={{ marginBottom: 16 }}
      />

      {list.length === 0 ? <Empty icon={<ClipboardCheck size={32} />} title={activeTab === 'pending' ? '승인 대기 중인 기록이 없습니다' : '승인된 기록이 없습니다'} sub={activeTab === 'pending' ? '활동 로그가 제출되면 여기에서 검토·승인하세요' : '승인을 마친 기록이 이곳에 모입니다'} /> : (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.xs, overflow: 'hidden' }}>
          {/* 선택 바 — 선택 건수와 총 시간을 함께 보여준다. 승인은 곧 정산 금액이므로 '몇 시간'이 중요하다. */}
          {activeTab === 'pending' && (
            <div style={{ padding: '11px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 12, background: C.lineSoft }}>
              <Checkbox checked={selected.size === list.length && list.length > 0} onChange={toggleAll} />
              <span style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600 }}>
                {selected.size > 0
                  ? `${selected.size}건 선택 · ${list.filter(l => selected.has(l.id)).reduce((s, l) => s + (l.hours || 0), 0)}시간`
                  : `전체 선택 (${list.length}건)`}
              </span>
            </div>
          )}
          {list.map((log, i) => {
            const author = state.participants.find(p => p.id === log.participant_id);
            const act = state.activities.find(a => a.id === log.activity_id);
            const match = act && state.matches.find(m => m.id === act.match_id);
            const on = selected.has(log.id);
            return (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
                background: on ? C.brandBg : 'transparent', transition: 'background .13s ease',
              }}>
                {activeTab === 'pending' && <Checkbox checked={on} onChange={() => toggleSelect(log.id)} />}
                <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={36} color={PERSONA[author?.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{author?.name}</span>
                    <span style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtDate(log.date)}</span>
                    <span style={{ color: '#D4D7DD' }}>·</span>
                    <span style={{ fontSize: 11.5, color: C.navMute, fontWeight: 500 }}>{act?.title}</span>
                    {log.has_photo && <Camera size={12} style={{ color: C.muteLight }} />}
                    {log.mood && <span role="img" aria-label={`기분 ${moodLabel(log.mood)}`} style={{ fontSize: 12 }}>{moodEmoji(log.mood)}</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{log.summary}</div>
                  <div style={{ fontSize: 11.5, color: C.muteLight, marginTop: 5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{log.hours}시간 · 매칭 {match?.id?.toUpperCase()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Button variant="secondary" size="sm" onClick={() => setDetailLog(log)}>상세</Button>
                  {activeTab === 'pending' && (
                    <Button variant="success" size="sm" icon={<Check size={14} />}
                      onClick={() => { dispatch({ type: 'APPROVE_LOG', payload: { id: log.id, approved_by: user.id } }); showToast({ type: 'success', message: '승인되었습니다.' }); }}>승인</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!detailLog} onClose={() => setDetailLog(null)} title="활동 기록 상세" size="md">
        {detailLog && (() => {
          const author = state.participants.find(p => p.id === detailLog.participant_id);
          const act = state.activities.find(a => a.id === detailLog.activity_id);
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <Avatar type={author?.type} gender={author?.gender} name={author?.name} size={44} color={PERSONA[author?.type]?.color || C.brand} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{author?.name}</div>
                  <div style={{ fontSize: 12.5, color: C.navMute, fontWeight: 500, marginTop: 1 }}>{PERSONA[author?.type]?.label}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: '12px 14px', background: C.cardWarm, border: `1px solid ${C.line}`, borderRadius: 12 }}><div style={{ fontSize: 12, color: C.navMute, fontWeight: 600 }}>활동</div><div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, marginTop: 3, letterSpacing: '-0.01em' }}>{act?.title}</div></div>
                <div style={{ padding: '12px 14px', background: C.cardWarm, border: `1px solid ${C.line}`, borderRadius: 12 }}><div style={{ fontSize: 12, color: C.navMute, fontWeight: 600 }}>날짜·시간</div><div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, marginTop: 3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{fmtDate(detailLog.date)} · {detailLog.hours}시간</div></div>
              </div>
              <div style={{ fontSize: 12, color: C.navMute, fontWeight: 700, marginBottom: 7, letterSpacing: '0.01em' }}>활동 내용</div>
              <div style={{ padding: 16, background: C.cardWarm, border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.75, marginBottom: detailLog.mood ? 14 : 0 }}>{detailLog.summary}</div>
              {detailLog.mood && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: C.cardWarm, border: `1px solid ${C.line}`, borderRadius: 12 }}>
                  <span style={{ fontSize: 12, color: C.navMute, fontWeight: 600 }}>오늘 기분</span>
                  <span role="img" aria-label={`기분 ${moodLabel(detailLog.mood)}`} style={{ fontSize: 20 }}>{moodEmoji(detailLog.mood)}</span>
                  <span style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{detailLog.mood}/5</span>
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
// 스크린리더용 기분 라벨 — 이모지만으로는 의미가 전달되지 않아 함께 사용(접근성)
function moodLabel(m) { return ['힘들어요', '그저 그래요', '괜찮아요', '좋아요', '아주 좋아요'][Math.max(0, Math.min(4, m - 1))]; }

// --- 11.5 Settlements (정산 처리) ---

// 정산 이의 상태 라벨 — 참여자 화면과 동일 어휘 (received=이의접수 / accepted=승인 / rejected=반려)
const SETTLE_DISPUTE_LABEL = {
  received: { label: '이의접수', color: C.amber, soft: C.amberSoft },
  accepted: { label: '승인 처리', color: C.sage, soft: C.sageSoft },
  rejected: { label: '반려 처리', color: C.red, soft: C.redSoft },
};

function CoordSettlements({ state, dispatch, showToast, user }) {
  // 반응형: 720px 이하에서 명세 표를 카드형으로 전환(디자인 시스템 §5 "모바일에선 카드형").
  const isMobile = useIsMobile(720);
  const [monthFilter, setMonthFilter] = useState(TODAY.slice(0, 7));
  const [generating, setGenerating] = useState(false);
  // 정산 이의신청 검토 (백로그 #1, additive) — 이의 목록·검토 모달·처리 메모
  const [disputeSel, setDisputeSel] = useState(null);
  const [disputeMemo, setDisputeMemo] = useState('');
  const disputes = state.settlements.filter(s => s.dispute);
  const openDisputes = disputes.filter(s => s.dispute.status === 'received');
  const resolveDispute = (result) => {
    if (!disputeMemo.trim()) { showToast({ type: 'error', message: '처리 메모를 입력해주세요.' }); return; }
    dispatch({
      type: 'RESOLVE_SETTLEMENT_DISPUTE',
      payload: { id: disputeSel.id, result, resolution: disputeMemo.trim(), resolved_at: new Date().toISOString().slice(0, 10), resolved_by: user.name || user.id },
    });
    showToast({ type: 'success', message: result === 'accepted' ? '이의를 승인 처리했습니다. 참여자 화면에 반영됩니다.' : '이의를 반려 처리했습니다. 참여자 화면에 반영됩니다.' });
    setDisputeSel(null); setDisputeMemo('');
  };

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

      <KpiStrip
        style={{ marginBottom: 16 }}
        items={[
          { label: '이번 달 산정액', value: krw(totalAmount), sub: `대상 ${calculatedSettlements.length}명`, color: C.brand, icon: <Wallet size={15} /> },
          { label: '발급 완료', value: krw(issuedAmount), sub: `${issued.length}건 발급`, color: C.success, icon: <CheckCircle2 size={15} /> },
          { label: '발급 대기', value: krw(totalAmount - issuedAmount), sub: `${pending.length}건 대기`, color: C.amber, icon: <Clock size={15} /> },
          { label: '누적 지급', value: krw(state.settlements.filter(s => s.status === 'issued' || s.status === 'paid').reduce((sum, s) => sum + (s.amount || 0), 0)), sub: `${state.settlements.filter(s => s.status === 'issued' || s.status === 'paid').length}건 누적`, color: C.gold, icon: <Award size={15} /> },
        ]}
      />

      {/* 정산 월 선택 */}

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
        {!isMobile && (
          <div style={{ padding: '11px 20px', borderBottom: `1px solid ${C.line}`, display: 'grid', gridTemplateColumns: '1fr 84px 84px 130px 120px 92px', gap: 12, fontSize: 11.5, color: C.navMute, fontWeight: 700, background: C.lineSoft }}>
            <div>참여자</div><div>활동</div><div>시간</div><div style={{ textAlign: 'right' }}>금액</div><div>지급 방법</div><div style={{ textAlign: 'right' }}>상태</div>
          </div>
        )}
        {calculatedSettlements.length === 0 ? <Empty icon={<Wallet size={28} />} title="이번 달 산정 대상이 없습니다" sub="활동이 승인되면 매월 정산 대상에 자동으로 포함됩니다" /> : calculatedSettlements.map((calc, i) => (
          isMobile ? (
            /* 모바일 카드형 행 — 6열 고정 그리드는 좁은 화면에서 잘리므로 카드 문법으로 전환 */
            <div key={calc.participant.id} style={{ padding: '16px 18px', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar type={calc.participant?.type} gender={calc.participant?.gender} name={calc.participant.name} size={36} color={PERSONA[calc.participant.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{calc.participant.name}</div>
                  <div style={{ fontSize: 12, color: C.muteLight, fontWeight: 500 }}>{PERSONA[calc.participant.type]?.label} · {calc.participant.type === 'youth' ? '계좌이체' : '온누리상품권'}</div>
                </div>
                {(calc.existing?.status === 'issued' || calc.existing?.status === 'paid') ? <Badge color={C.success} soft={C.successSoft} size="sm">발급 완료</Badge> :
                  <Button variant="brand" size="sm" onClick={() => { issueOne(calc); showToast({ type: 'success', message: `${calc.participant.name}님께 발급되었습니다.` }); }}>발급</Button>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.lineSoft}` }}>
                <span style={{ fontSize: 12.5, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>활동 {calc.count}회 · {calc.hours}시간</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: C.headline, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{krw(calc.amount)}</span>
              </div>
            </div>
          ) : (
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
          )
        ))}
      </Panel>

      {/* 정산 이의신청 — 참여자가 접수한 이의를 검토·기록 (백로그 #1) */}
      {disputes.length > 0 && (
        <Panel
          title={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              정산 이의신청
              {openDisputes.length > 0 && (
                <span aria-label={`검토 대기 ${openDisputes.length}건`} style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: C.amber, borderRadius: 999, padding: '2px 8px', lineHeight: 1.4 }}>{openDisputes.length}건 대기</span>
              )}
            </span>
          }
          sub="참여자가 접수한 정산 이의를 검토하고 처리 이력을 남깁니다"
          padding={0}
          style={{ marginTop: 16 }}
        >
          {disputes.map((s, i) => {
            const p = state.participants.find(pp => pp.id === s.participant_id);
            const d = s.dispute;
            const lb = SETTLE_DISPUTE_LABEL[d.status] || SETTLE_DISPUTE_LABEL.received;
            const periodLabel = (s.month || s.period || '').replace('-', '년 ') + '월';
            return (
              <div key={s.id} style={{ padding: '14px 20px', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <Avatar type={p?.type} gender={p?.gender} name={p?.name} size={34} color={PERSONA[p?.type]?.color || C.brand} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.headline }}>{p?.name || s.participant_id}</span>
                    <span style={{ fontSize: 12, color: C.muteLight, fontVariantNumeric: 'tabular-nums' }}>{periodLabel} · {krw(s.amount_krw ?? s.amount ?? 0)}</span>
                    <Badge color={lb.color} soft={lb.soft} size="sm">{lb.label}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 5, lineHeight: 1.6 }}>"{d.reason}"</div>
                  <div style={{ fontSize: 11.5, color: C.navMute, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{fmtDate(d.raised_at)} 접수{d.resolved_at ? ` · ${fmtDate(d.resolved_at)} ${d.resolved_by} 처리` : ''}</div>
                  {d.resolution && (
                    <div style={{ fontSize: 12, color: C.ink, marginTop: 6, padding: '9px 12px', background: C.lineSoft, borderRadius: 8, lineHeight: 1.55 }}>처리 메모: {d.resolution}</div>
                  )}
                </div>
                {d.status === 'received' && (
                  <Button variant="secondary" size="sm" onClick={() => { setDisputeSel(s); setDisputeMemo(''); }} style={{ flexShrink: 0 }}>검토</Button>
                )}
              </div>
            );
          })}
        </Panel>
      )}

      {/* 이의 검토 모달 — 처리 메모 필수, 승인/반려 기록 */}
      <Modal
        open={!!disputeSel}
        onClose={() => setDisputeSel(null)}
        title="정산 이의 검토"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDisputeSel(null)}>취소</Button>
            <Button variant="danger" onClick={() => resolveDispute('rejected')}>반려</Button>
            <Button variant="brand" onClick={() => resolveDispute('accepted')}>승인</Button>
          </>
        }
      >
        {disputeSel && (
          <>
            <div style={{ padding: '12px 14px', background: C.lineSoft, borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.headline }}>
                {state.participants.find(pp => pp.id === disputeSel.participant_id)?.name || disputeSel.participant_id} · {(disputeSel.month || disputeSel.period || '').replace('-', '년 ')}월 · {krw(disputeSel.amount_krw ?? disputeSel.amount ?? 0)}
              </div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, lineHeight: 1.6 }}>"{disputeSel.dispute?.reason}"</div>
              <div style={{ fontSize: 11.5, color: C.navMute, marginTop: 4 }}>{fmtDate(disputeSel.dispute?.raised_at)} 접수</div>
            </div>
            <Field label="처리 메모" required>
              <Textarea value={disputeMemo} onChange={setDisputeMemo} rows={4} placeholder="예) 미승인 활동기록 2건 확인 후 승인 — 차월 정산에 합산 반영 예정." />
            </Field>
            <div style={{ fontSize: 12, color: C.navMute, marginTop: 10, lineHeight: 1.6 }}>승인/반려와 처리 메모는 이력으로 남고 참여자 정산 화면에 표시됩니다.</div>
          </>
        )}
      </Modal>
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

      <KpiStrip
        style={{ marginBottom: 16 }}
        items={[
          { label: '전체 신고', value: state.safety_incidents.length, unit: '건', color: C.ink, icon: <ShieldAlert size={15} /> },
          { label: '처리 중', value: state.safety_incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length, unit: '건', color: C.amber, icon: <AlertTriangle size={15} /> },
          { label: '해결 완료', value: state.safety_incidents.filter(i => i.status === 'resolved').length, unit: '건', color: C.success, icon: <CheckCircle2 size={15} /> },
          { label: '심각도 높음', value: state.safety_incidents.filter(i => i.severity === 'high').length, unit: '건', color: C.red, icon: <AlertCircle size={15} /> },
        ]}
      />

      <Tabs
        ariaLabel="안전 이슈 상태 필터"
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
        // 이슈 목록 — 심각도는 좌측 색 레일로, 상태는 우측 칩으로 분리한다.
        // 안전 화면은 '무엇이 급한가'가 스캔 한 번에 잡혀야 한다.
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.xs, overflow: 'hidden' }}>
          {filtered.map((inc, i) => {
            const reporter = state.participants.find(p => p.id === inc.reported_by);
            const sev = inc.severity === 'high' ? { c: C.red, s: C.redSoft, t: '높음' }
              : inc.severity === 'medium' ? { c: C.amber, s: C.amberSoft, t: '중간' }
                : { c: C.success, s: C.successSoft, t: '낮음' };
            const st = inc.status === 'resolved' ? { c: C.success, s: C.successSoft, t: '해결됨' }
              : inc.status === 'in_progress' ? { c: C.amber, s: C.amberSoft, t: '처리 중' }
                : { c: C.red, s: C.redSoft, t: '접수' };
            return (
              <div
                key={inc.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(inc)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(inc); } }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{
                  display: 'flex', gap: 14, padding: '15px 20px 15px 17px', cursor: 'pointer',
                  borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
                  borderLeft: `3px solid ${sev.c}`, transition: 'background .13s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <Badge color={sev.c} soft={sev.s} size="sm">{sev.t}</Badge>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{inc.category}</span>
                    <Badge color={st.c} soft={st.s} size="sm">{st.t}</Badge>
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{inc.description}</div>
                  <div style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 500 }}>
                    신고자 {reporter?.name || '익명'} · 매칭 {inc.match_id?.toUpperCase() || '-'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
                  <span style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{inc.reported_at}</span>
                  <ChevronRight size={16} style={{ color: C.muteLight }} />
                </div>
              </div>
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
            <div style={{ fontSize: 16, fontWeight: 800, color: C.headline, marginBottom: 10, letterSpacing: '-0.02em' }}>{selected.category}</div>
            <div style={{ padding: '13px 14px', background: C.lineSoft, borderRadius: 10, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 14 }}>{selected.description}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, fontSize: 12.5, color: C.inkSoft }}>
              <div><strong style={{ color: C.navMute, fontWeight: 600 }}>신고자</strong> {state.participants.find(p => p.id === selected.reported_by)?.name}</div>
              <div><strong style={{ color: C.navMute, fontWeight: 600 }}>매칭</strong> {selected.match_id?.toUpperCase()}</div>
              <div style={{ fontVariantNumeric: 'tabular-nums' }}><strong style={{ color: C.navMute, fontWeight: 600 }}>접수</strong> {selected.reported_at}</div>
              {selected.resolved_at && <div style={{ fontVariantNumeric: 'tabular-nums' }}><strong style={{ color: C.navMute, fontWeight: 600 }}>해결</strong> {selected.resolved_at}</div>}
            </div>
            {selected.status === 'resolved' && selected.resolution ? (
              <div style={{ padding: '13px 14px', background: C.successSoft, borderRadius: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.success, marginBottom: 6 }}>처리 내용</div>
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
      <div style={{ marginBottom: 18, background: C.panel, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.brand}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: '15px 18px' }}>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.65 }}>
          광주창조경제혁신센터 <strong>이복은 멘토</strong>님이 제안한 <strong>공인 인증 발신</strong>과 <strong>돌봄 책임보험</strong>을 핵심 로드맵에 반영했습니다. 아래 항목은 광주광역시 통합돌봄 인프라와 연계해 단계적으로 도입할 예정입니다.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: SHADOW.xs, padding: 18 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: it.soft, color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={19} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.headline, letterSpacing: '-0.02em' }}>{it.title}</span>
                    {it.mentor && <Badge color={C.brand} soft={C.brandSoft} size="sm">멘토 제안</Badge>}
                    <Badge color={it.color} soft={it.soft} size="sm">{it.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.navMute, lineHeight: 1.6 }}>{it.desc}</div>
                </div>
              </div>
            </div>
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

      <KpiStrip
        style={{ marginBottom: 16 }}
        items={[
          { label: '활동시간', value: stats.totalHours, unit: '시간', sub: `${stats.approvedLogs.length}회 승인`, color: C.brand, icon: <Clock size={15} /> },
          { label: '정산 지급', value: krw(stats.settlementAmount), sub: `${stats.settlements.length}건 지급`, color: C.gold, icon: <Wallet size={15} /> },
          { label: '안전 이슈', value: stats.incidents.length, unit: '건', sub: `해결 ${stats.incidents.filter(i => i.status === 'resolved').length}건`, color: stats.incidents.length > 0 ? C.amber : C.success, icon: <ShieldCheck size={15} /> },
          { label: '만족도', value: stats.avgScore, sub: `설문 ${stats.surveys.length}건 응답`, color: C.lavender, icon: <Smile size={15} /> },
        ]}
      />

      {aiLoading && (
        <Card padding={24} style={{ marginBottom: 16, borderLeft: `3px solid ${C.brand}` }}>
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
        <Card padding={24} style={{ marginBottom: 16, borderLeft: `3px solid ${C.brand}` }}>
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
        {Object.entries(stats.matchHours).length === 0 ? <Empty icon={<Activity size={28} />} title="이달의 활동이 없습니다" sub="활동 로그가 쌓이면 매칭별 활동 현황이 표시됩니다" /> : (
          /* 차트 접근성 — 매칭별 시간 요약을 role=img 라벨로 제공(스크린리더) */
          <div
            role="img"
            aria-label={`매칭별 활동 현황 막대 차트. ${Object.entries(stats.matchHours).map(([mid, h]) => {
              const m = state.matches.find(mm => mm.id === mid);
              const y = state.participants.find(p => p.id === m?.youth_id);
              return `${y?.name || mid} ${h}시간`;
            }).join(', ')}.`}
          >
          <div aria-hidden="true">
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
          </div>
          </div>
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
                <div key={sv.id} style={{ padding: 14, background: C.lineSoft, borderRadius: 10 }}>
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

// --- 11.x 공지 발송 (백로그 #2, additive) — 채널 선택·수신자별 전달 결과·미전달 재발송 (데모 시뮬레이션, 실채널 연동 아님) ---

const NOTICE_CHANNELS = [
  { id: 'kakao', label: '카카오 알림톡' },
  { id: 'sms', label: '문자(SMS)' },
  { id: 'app', label: '앱 알림' },
];
const NOTICE_AUDIENCES = [
  { value: 'all', label: '전체 (청년·어르신·보호자)' },
  { value: 'youth', label: '청년' },
  { value: 'senior', label: '어르신' },
  { value: 'parent', label: '보호자' },
];
const noticeChannelLabel = (id) => NOTICE_CHANNELS.find(c => c.id === id)?.label || id;
const noticeAudienceLabel = (v) => NOTICE_AUDIENCES.find(a => a.value === v)?.label || v;

function CoordNotices({ state, dispatch, showToast, user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channels, setChannels] = useState(['kakao']);
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [resendingId, setResendingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const notices = state.notices || [];
  const pById = useMemo(() => { const m = {}; state.participants.forEach(p => { m[p.id] = p; }); return m; }, [state.participants]);
  const recipientsFor = (aud) => state.participants.filter(p =>
    p.type !== 'child' && p.status === 'active' && (aud === 'all' || p.type === aud));

  const toggleChannel = (id) => setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const nowStamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  const send = async () => {
    if (!title.trim() || !body.trim()) { showToast({ type: 'error', message: '제목과 내용을 입력해주세요.' }); return; }
    if (channels.length === 0) { showToast({ type: 'error', message: '발송 채널을 1개 이상 선택해주세요.' }); return; }
    const recips = recipientsFor(audience);
    if (recips.length === 0) { showToast({ type: 'error', message: '발송 대상이 없습니다.' }); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 700)); // 발송 시뮬레이션 지연
    const at = nowStamp();
    const delivery = recips.map((p, i) => ({
      participant_id: p.id,
      channel: channels[i % channels.length],
      status: Math.random() < 0.85 ? 'delivered' : 'failed', // 데모: 일부 미전달 시뮬레이션
      at,
    }));
    const payload = {
      id: uid('n'), title: title.trim(), body: body.trim(),
      channels: [...channels], audience, sent_at: at, sent_by: user.name || user.id,
      resend_count: 0, last_resend_at: null, delivery,
    };
    dispatch({ type: 'SEND_NOTICE', payload });
    setSending(false);
    const failed = delivery.filter(d => d.status === 'failed').length;
    showToast({ type: failed > 0 ? 'info' : 'success', message: `공지 발송 완료 — 전달 ${delivery.length - failed}건 · 미전달 ${failed}건 (시뮬레이션)` });
    setTitle(''); setBody(''); setExpandedId(payload.id);
  };

  const resend = async (n) => {
    const failed = (n.delivery || []).filter(d => d.status === 'failed');
    if (failed.length === 0) return;
    setResendingId(n.id);
    await new Promise(r => setTimeout(r, 700));
    const at = nowStamp();
    const results = {};
    failed.forEach(d => { results[d.participant_id] = Math.random() < 0.9 ? 'delivered' : 'failed'; });
    dispatch({ type: 'RESEND_UNDELIVERED', payload: { id: n.id, at, results } });
    setResendingId(null);
    const ok = Object.values(results).filter(v => v === 'delivered').length;
    showToast({ type: 'success', message: `미전달 ${failed.length}건 재발송 — ${ok}건 전달 완료 (시뮬레이션)` });
  };

  const totalSent = notices.reduce((sum, n) => sum + (n.delivery || []).length, 0);
  const totalFailed = notices.reduce((sum, n) => sum + (n.delivery || []).filter(d => d.status === 'failed').length, 0);

  return (
    <>
      <PageHeader title="공지 발송"
        subtitle="채널(카카오 알림톡·문자·앱)을 선택해 공지를 보내고, 수신자별 전달 결과를 확인한 뒤 미전달만 재발송합니다." />

      <div role="note" style={{ marginBottom: 16, padding: '10px 14px', fontSize: 12, lineHeight: 1.6, color: C.inkSoft, background: C.brandSoft, border: `1px solid ${C.border}`, borderRadius: 10 }}>
        데모 시뮬레이션 — 실제 카카오·문자 채널로 발송되지 않으며, 전달 결과는 화면 안에서만 기록됩니다.
      </div>

      <KpiStrip
        style={{ marginBottom: 16 }}
        items={[
          { label: '발송한 공지', value: String(notices.length), sub: '누적', color: C.brand, icon: <Send size={15} /> },
          { label: '발송 시도', value: String(totalSent), sub: '수신자 × 채널', color: C.sage, icon: <Bell size={15} /> },
          { label: '미전달', value: String(totalFailed), sub: totalFailed > 0 ? '재발송 필요' : '없음', color: totalFailed > 0 ? C.amber : C.success, icon: totalFailed > 0 ? <AlertCircle size={15} /> : <CheckCircle2 size={15} /> },
        ]}
      />

      {/* 공지 작성 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 12 }}>새 공지 작성</div>
        <Field label="제목">
          <Input value={title} onChange={setTitle} placeholder="예) 8월 정산 발급 안내" />
        </Field>
        <Field label="내용">
          <Textarea value={body} onChange={setBody} rows={4} placeholder="수신자에게 전달할 공지 내용을 입력하세요." />
        </Field>
        <Field label="발송 채널" sub="여러 채널을 함께 선택할 수 있어요">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {NOTICE_CHANNELS.map(ch => (
              <Checkbox key={ch.id} checked={channels.includes(ch.id)} onChange={() => toggleChannel(ch.id)} label={ch.label} />
            ))}
          </div>
        </Field>
        <Field label="발송 대상">
          <Select value={audience} onChange={setAudience} options={NOTICE_AUDIENCES} />
        </Field>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <Button variant="brand" icon={<Send size={15} />} onClick={send} disabled={sending}>{sending ? '발송 중…' : `발송 (대상 ${recipientsFor(audience).length}명)`}</Button>
          <span style={{ fontSize: 11.5, color: C.mute }}>아동은 보호자를 통해 전달되어 발송 대상에서 제외됩니다.</span>
        </div>
      </Card>

      {/* 발송 내역 + 전달 결과 */}
      <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, margin: '4px 0 10px' }}>발송 내역</div>
      {notices.length === 0 && <Empty icon={<Send size={22} />} title="발송한 공지가 없습니다" sub="위에서 첫 공지를 작성해 보세요." />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notices.map(n => {
          const delv = n.delivery || [];
          const failed = delv.filter(d => d.status === 'failed');
          const open = expandedId === n.id;
          return (
            <Card key={n.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{n.title}</span>
                    {n.channels.map(c => <Badge key={c} color={C.sage} soft={C.sageSoft}>{noticeChannelLabel(c)}</Badge>)}
                    <Badge color={C.lavender} soft={C.lavenderSoft}>{noticeAudienceLabel(n.audience)}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6, marginTop: 6 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: C.mute, marginTop: 6 }}>
                    {n.sent_at} · {n.sent_by}{n.resend_count > 0 ? ` · 재발송 ${n.resend_count}회 (최근 ${n.last_resend_at})` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Badge color={C.success} soft={C.successSoft}>전달 {delv.length - failed.length}</Badge>
                  <Badge color={failed.length > 0 ? C.amber : C.mute} soft={failed.length > 0 ? C.amberSoft : C.lineSoft}>미전달 {failed.length}</Badge>
                  {failed.length > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => resend(n)} disabled={resendingId === n.id}>
                      {resendingId === n.id ? '재발송 중…' : `미전달 ${failed.length}건 재발송`}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setExpandedId(open ? null : n.id)} aria-expanded={open}>
                    {open ? '결과 접기' : '수신자별 결과'}
                  </Button>
                </div>
              </div>
              {open && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {delv.map(d => {
                    const p = pById[d.participant_id];
                    const ok = d.status === 'delivered';
                    return (
                      <div key={d.participant_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: C.lineSoft, borderRadius: 8, flexWrap: 'wrap' }}>
                        <Avatar type={p?.type} gender={p?.gender} name={p?.name} size={24} color={PERSONA[p?.type]?.color || C.brand} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{p?.name || d.participant_id}</span>
                        <span style={{ fontSize: 11, color: C.mute }}>{noticeChannelLabel(d.channel)}</span>
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {d.resent && <span style={{ fontSize: 10.5, color: C.mute }}>재발송</span>}
                          <Badge color={ok ? C.success : C.amber} soft={ok ? C.successSoft : C.amberSoft}>{ok ? '전달' : '미전달'}</Badge>
                          <span style={{ fontSize: 10.5, color: C.mute }}>{d.at}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
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
    case 'RAISE_SETTLEMENT_DISPUTE': {
      // 참여자 정산 이의신청 — 해당 정산 항목에 dispute 객체를 추가(상태 '이의접수')
      return {
        ...state,
        settlements: state.settlements.map(s => s.id === action.payload.id
          ? { ...s, dispute: { status: 'received', reason: action.payload.reason, raised_at: action.payload.raised_at, raised_by: action.payload.raised_by, resolution: null, resolved_at: null, resolved_by: null } }
          : s)
      };
    }
    case 'RESOLVE_SETTLEMENT_DISPUTE': {
      // 코디네이터 이의 검토 — 승인(accepted)/반려(rejected) + 처리 메모·이력 기록
      return {
        ...state,
        settlements: state.settlements.map(s => (s.id === action.payload.id && s.dispute)
          ? { ...s, dispute: { ...s.dispute, status: action.payload.result, resolution: action.payload.resolution, resolved_at: action.payload.resolved_at, resolved_by: action.payload.resolved_by } }
          : s)
      };
    }
    case 'SEND_NOTICE': {
      // 공지 발송(백로그 #2, additive) — 채널·대상·수신자별 전달결과(시뮬레이션)를 포함한 공지 추가
      return { ...state, notices: [action.payload, ...(state.notices || [])] };
    }
    case 'RESEND_UNDELIVERED': {
      // 미전달 재발송(백로그 #2, additive) — 해당 공지의 미전달 수신자만 결과 갱신, 재발송 이력 기록
      return {
        ...state,
        notices: (state.notices || []).map(n => n.id === action.payload.id
          ? {
              ...n,
              resend_count: (n.resend_count || 0) + 1,
              last_resend_at: action.payload.at,
              delivery: (n.delivery || []).map(d => (d.status === 'failed' && action.payload.results[d.participant_id])
                ? { ...d, status: action.payload.results[d.participant_id], at: action.payload.at, resent: true }
                : d),
            }
          : n)
      };
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

  const showToast = useCallback((toast, maybeType) => {
    // 두 가지 호출 서명 허용: showToast({ type, title, message, duration }) 또는 showToast('메시지', 'success').
    // 문자열 호출 시 스프레드가 글자 단위로 퍼져 빈 토스트가 뜨던 결함 방지(정규화 후 표시).
    const t = typeof toast === 'string' ? { message: toast, type: maybeType || 'info' } : (toast || {});
    const id = uid('toast');
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, t.duration || 3500);
  }, []);

  // 오프라인 감지 — 연결이 끊기면 상단 배너로 즉시 알리고, 복구되면 토스트로 안내.
  // 모바일 현장(활동 체크인·신고 등)에서 "왜 안 되지"를 어르신·보호자도 바로 알 수 있게 한다.
  // 순수 표현: 네트워크 상태 표시만 하며 리듀서·저장 로직에는 관여하지 않는다.
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => { setOffline(false); showToast({ type: 'success', message: '인터넷에 다시 연결되었습니다.' }); };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => { window.removeEventListener('offline', onOffline); window.removeEventListener('online', onOnline); };
  }, [showToast]);

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
      consented_at: new Date().toISOString(), // 동의 시각 기록(분쟁 대비)
      legal_version: LEGAL_META.effectiveDate + '/' + LEGAL_META.status, // 동의한 약관·방침 버전
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
      <div role="status" aria-live="polite" aria-label="이음을 불러오는 중" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: FONT_STACK, padding: 24 }}>
        {/* 초기 로딩 스플래시 — 전역 스타일 블록이 아직 마운트되기 전이라 키프레임을 자체 포함한다 */}
        <style>{`
          @keyframes eumSplashIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes eumSplashBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.055); } }
          @keyframes eumSplashHalo { 0%, 100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.16); } }
          @keyframes eumSplashBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(330%); } }
          .eum-splash-in { animation: eumSplashIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
          .eum-splash-mark { animation: eumSplashBreath 2.4s ease-in-out infinite; }
          .eum-splash-halo { animation: eumSplashHalo 2.4s ease-in-out infinite; }
          .eum-splash-track { position: relative; width: 132px; height: 4px; margin: 22px auto 0; border-radius: 999px; background: ${C.border}; overflow: hidden; }
          .eum-splash-track::after { content: ''; position: absolute; top: 0; left: 0; width: 38%; height: 100%; border-radius: 999px; background: ${C.brand}; animation: eumSplashBar 1.25s cubic-bezier(0.5,0,0.2,1) infinite; }
          @media (prefers-reduced-motion: reduce) {
            .eum-splash-in { animation: none; }
            .eum-splash-mark, .eum-splash-halo { animation: none; }
            .eum-splash-track::after { animation: none; width: 100%; opacity: 0.8; }
          }
        `}</style>
        <div className="eum-splash-in" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px' }}>
            <div className="eum-splash-halo" aria-hidden="true" style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: `radial-gradient(circle, ${C.brand}38, transparent 68%)`, filter: 'blur(7px)' }} />
            <div className="eum-splash-mark" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72 }}>
              <EumLogo size={60} />
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.headline, letterSpacing: '-0.02em' }}>이음을 불러오고 있습니다</div>
          <div style={{ fontSize: 13, color: C.navMute, marginTop: 5 }}>세대를 잇는 준비를 하고 있어요</div>
          <div className="eum-splash-track" aria-hidden="true" />
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
        @keyframes eumSheetUp { from { opacity: 0.5; transform: translateY(48px); } to { opacity: 1; transform: translateY(0); } }
        /* 모달 → 모바일 바텀시트 (디자인시스템 §5: 모바일은 바텀시트, 데스크톱은 중앙 모달).
           좁은 터치 화면에서 다이얼로그를 하단에 붙여 엄지 도달 거리를 줄이고,
           위 라운드+그래버 핸들로 토스식 시트 문법을 따른다. 표현만 바꾸므로 로직 무관. */
        @media (max-width: 640px) {
          .eum-modal-overlay { align-items: flex-end !important; padding: 0 !important; }
          .eum-modal-panel {
            max-width: none !important; width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 92vh !important; max-height: 92dvh !important;
            animation: eumSheetUp 0.32s cubic-bezier(0.22,1,0.36,1) !important;
            /* iPhone 홈 인디케이터 — 시트가 화면 하단에 붙으므로 안전영역만큼 띄운다
               (인라인 padding을 가진 패널은 자체 여백 유지) */
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
          /* 그래버 핸들 — 상단이 플러시한 패널(표준 Modal·참여신청·접수완료)에만 */
          .eum-sheet-grab::before { content: ''; display: block; flex-shrink: 0; width: 44px; height: 5px; border-radius: 999px; background: ${C.border}; margin: 9px auto 1px; }
        }
        /* 콘솔 리스트 — 좁은 폭에서 보조 컬럼을 접어 핵심 정보만 남긴다 */
        @media (max-width: 1180px) { .eum-col-md { display: none !important; } }
        /* 대시보드 2단 그리드 — 좁아지면 세로로 쌓는다 */
        @media (max-width: 1080px) { .eum-dash-grid { grid-template-columns: 1fr !important; } }
        /* AI 모듈 고정폭 그리드(어드바이저·직접매칭·채퍼론) — 좁은 화면에선 한 열로 쌓아 오버플로 방지 */
        @media (max-width: 880px) { .eum-ai-cols { grid-template-columns: 1fr !important; } }
        /* 모바일 입력 확대 방지 — iOS 사파리는 글꼴 16px 미만 입력에 포커스하면 화면을 강제 확대한다.
           터치 기기 좁은 화면에서만 16px로 올린다(핀치 줌 차단 없이 해결 · 어르신 가독성에도 이득).
           체크박스·라디오는 크기 규격이 달라 제외. 인라인 style보다 우선해야 하므로 !important. */
        @media (max-width: 640px) and (pointer: coarse) {
          input:not([type="checkbox"]):not([type="radio"]), select, textarea { font-size: 16px !important; }
        }
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
        /* 키보드 포커스 링 — 버튼 표준화(입력·카드와 동일한 접근성 문법). 마우스 클릭엔 나타나지 않음(:focus-visible), 레이아웃 영향 없음(outline). */
        .eum-btn:focus-visible { outline: 2.5px solid ${C.brand}; outline-offset: 2px; }
        .eum-btn:focus:not(:focus-visible) { outline: none; }
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
        .eum-kicker { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; letter-spacing: 0.04em; padding: 5px 12px; border-radius: 999px; background: ${C.brandSoft}; color: ${C.brand}; }
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
        /* 인쇄 — 리포트·정산 등 지면 제출용. 내비·FAB·토스트 등 화면 크롬을 숨기고 본문만 흰 배경으로 */
        @media print {
          .eum-noprint, .eum-skip { display: none !important; }
          body { background: #fff !important; }
          #eum-main { animation: none !important; }
          * { box-shadow: none !important; }
        }
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

      {/* 오프라인 배너 — 네트워크 단절을 상단에서 즉시 안내 (인쇄 제외, 안전영역 대응) */}
      {offline && (
        <div className="eum-noprint" role="status" aria-live="assertive" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))', background: C.ink, color: '#fff', fontSize: 13.5, fontWeight: 700, fontFamily: FONT_STACK, letterSpacing: '-0.01em', lineHeight: 1.5, textAlign: 'center' }}>
          <WifiOff size={15} aria-hidden="true" style={{ flexShrink: 0 }} />
          인터넷 연결이 끊겼습니다 — 연결을 확인해 주세요.
        </div>
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

      {/* 복지 찾기 FAB — 콘솔에는 사이드바 '복지 어드바이저'가 이미 있어 중복이고,
          본문 우하단을 가린다. 사용자 앱에서만 띄운다. */}
      {role && user && role !== 'coordinator' && <WelfareFab role={role} />}
      {/* 큰 글씨 토글은 어르신·양육가정 등 사용자 앱과 랜딩에서만.
          관리자 콘솔에서는 사이드바 계정 영역과 겹치고, 운영자에게 필요한 기능도 아니다. */}
      {role !== 'coordinator' && <AccessibilityFab />}

      {/* Toast 컨테이너 — 우하단 스택. 개별 Toast의 fixed를 걷어내고 여기서 위치·간격을 잡아
          여러 알림이 겹치지 않고 위로 쌓이게 한다. iPhone 홈 인디케이터 대응(safe-area). */}
      <div role="region" aria-live="polite" aria-atomic="false" aria-label="알림" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, marginBottom: 'env(safe-area-inset-bottom, 0px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, pointerEvents: 'none' }}>
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
  componentDidCatch(error, info) {
    console.error('이음 렌더 오류:', error, info);
    try { captureError(error, { kind: 'react.errorBoundary', componentStack: info && info.componentStack ? String(info.componentStack).slice(0, 2000) : '' }); } catch { /* noop */ }
  }
  render() {
    if (this.state.error) {
      return (
        <div role="alert" aria-live="assertive" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: FONT_STACK, padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', display: 'flex' }}><EumLogo size={52} /></div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, marginBottom: 8 }}>일시적인 오류가 발생했어요</div>
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 20 }}>화면을 불러오는 중 문제가 생겼습니다. 다시 시도해 주세요.</div>
            <button type="button" onClick={() => { this.setState({ error: null }); window.location.reload(); }} style={{ background: C.brand, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT_STACK }}>처음으로 돌아가기</button>
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
