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
