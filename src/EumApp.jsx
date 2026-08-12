import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users, UserCheck, Calendar, Award, AlertTriangle, Heart, ShieldCheck,
  Sparkles, ChevronRight, ChevronLeft, ChevronDown, Check, X, Plus, Search,
  Bell, MapPin, Clock, FileText, LogOut, Home, BookOpen, Coffee,
  GraduationCap, Camera, Phone, Send, Trash2, Download, ArrowRight, Star,
  TrendingUp, Loader2, CheckCircle2, AlertCircle, Menu, Smile, Activity,
  ClipboardCheck, Wallet, ShieldAlert, Info, ChevronUp, UserPlus, PenLine,
  Hash, BellOff, WifiOff, Printer
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
import { CoordinatorApp } from './eum/apps/CoordinatorApp.jsx';
import { RLLanding, LegalModal } from './eum/landing.jsx';

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
    { role: 'youth', id: 'p001', gender: 'M', name: '김민준', subtitle: '27세 · 스타트업 개발자', desc: '어르신께 디지털을 알려드리고, 진로 조언을 받습니다.', color: C.sage, soft: C.sageSoft, gradient: 'linear-gradient(135deg, #2FA37A 0%, #55BD97 100%)' },
    { role: 'senior', id: 'p101', gender: 'F', name: '박순자', subtitle: '73세 · 前 교사', desc: '청년과 디지털을 익히고, 아이에게 옛이야기를 들려드려요.', color: C.lavender, soft: C.lavenderSoft, gradient: 'linear-gradient(135deg, #6C5CE7 0%, #8F82EF 100%)' },
    { role: 'parent', id: 'p201', gender: 'F', name: '이서영', subtitle: '38세 · IT기업 PM (유진 8세 보호자)', desc: '아이가 어르신·청년과 만나는 안전한 공간을 신뢰해요.', color: C.peach, soft: C.peachSoft, gradient: 'linear-gradient(135deg, #2D8C9E 0%, #63C2D0 100%)' },
    { role: 'coordinator', id: 'cdn001', gender: 'F', name: '한가은', subtitle: '코디네이터 · 광주 광산구', desc: '신청·검증·매칭·정산을 한눈에 관리합니다.', color: C.ink, soft: '#EAEDF4', gradient: 'linear-gradient(135deg, #0E1A30 0%, #1E355C 100%)' },
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

// CoordinatorApp·AI 화면(어드바이저/매칭/코파일럿/채퍼론)·CoordB2G/B2B — src/eum/apps/CoordinatorApp.jsx 로 분리 (4단계)

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
// ============================================================================
// 랜딩(RL* 섹션군)·LegalModal — src/eum/landing.jsx 로 분리 (단일파일 분해 5단계, 상단 import)
// ============================================================================

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
// CoordOverview~CoordNotices 코디 콘솔 화면군 — src/eum/apps/CoordinatorApp.jsx 로 분리 (4단계)

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
    case 'MARK_NOTICE_READ': {
      // 참여자 공지 읽음(additive) — 해당 공지의 read_by 배열에 참여자 id를 1회만 추가.
      // 기존 공지 필드(채널·전달결과·재발송 이력)는 그대로 보존한다.
      return {
        ...state,
        notices: (state.notices || []).map(n => (n.id === action.payload.id && !(n.read_by || []).includes(action.payload.participant_id))
          ? { ...n, read_by: [...(n.read_by || []), action.payload.participant_id] }
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
        /* 만족도 응답 그리드 — 데스크톱 2열, 640px 이하 1열(모바일 인용문 가독) */
        .eum-survey-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .eum-survey-grid { grid-template-columns: 1fr; } }
        /* 인쇄 — 리포트·정산 등 지면 제출용. 내비·FAB·토스트 등 화면 크롬을 숨기고 본문만 흰 배경으로 */
        @media print {
          @page { margin: 16mm 14mm; }
          .eum-noprint, .eum-skip { display: none !important; }
          .eum-printonly { display: block !important; }
          body { background: #fff !important; }
          #eum-main { animation: none !important; }
          * { box-shadow: none !important; }
          /* 카드가 페이지 경계에서 두 동강 나지 않게 */
          #eum-main > div { break-inside: avoid; }
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
