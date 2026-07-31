// ============================================================================
// 이음 공용 UI 프리미티브 — EumApp.jsx 단일파일 분해 2단계 (2026-08-01)
//   순수 표현 컴포넌트/훅만 모음. 앱 상태(state/dispatch)·SEED·리듀서 의존 없음.
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만).
// ============================================================================
import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Check, X, Search, Clock, TrendingUp, Loader2, CheckCircle2, AlertCircle, ShieldAlert, Info } from 'lucide-react';
import { C, FONT_STACK, SERIF_STACK, SHADOW } from './theme.js';

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

function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, icon, iconRight, fullWidth, type = 'button', style = {} }) {
  // loading: 디자인 시스템 §5 "로딩 시 스피너+비활성" — 스피너가 아이콘 자리를 대체하고
  // 클릭이 차단되며 aria-busy로 보조기술에 진행 상태를 알린다. 선택적 prop이라 하위호환.
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
  const isOff = disabled || loading;
  const spinnerSize = size === 'lg' ? 16 : size === 'sm' ? 13 : 14;
  return (
    <button
      type={type}
      className="eum-btn"
      onClick={onClick}
      disabled={isOff}
      aria-busy={loading || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerCancel={() => setPress(false)}
      onBlur={() => setPress(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        background: hover && !isOff ? v.hoverBg : v.bg,
        color: v.fg, border: `1px solid ${v.border}`,
        padding: s.pad, fontSize: s.fs, fontWeight: 700,
        borderRadius: 10, cursor: loading ? 'progress' : disabled ? 'not-allowed' : 'pointer',
        // 컬러 글로우(광원 없는 색번짐)는 아마추어 신호 — 얕고 중성적인 그림자만 쓴다.
        // 호버 시 1px 리프트+그림자 심화로 프리미엄 촉감(토스/에어비앤비 문법). transform이라 리플로우 없음.
        boxShadow: !isOff && isSolid ? (press ? 'none' : (hover ? SHADOW.sm : SHADOW.xs)) : 'none',
        opacity: disabled ? 0.5 : loading ? 0.85 : 1,
        transition: 'background 0.16s ease, box-shadow 0.18s ease, transform 0.12s cubic-bezier(0.22,1,0.36,1)',
        transform: isOff ? 'none' : press ? 'scale(0.975)' : (hover ? 'translateY(-1px)' : 'none'),
        height: s.h, width: fullWidth ? '100%' : 'auto',
        fontFamily: FONT_STACK, letterSpacing: '-0.01em',
        ...style
      }}
    >
      {loading ? <Loader2 size={spinnerSize} aria-hidden="true" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} /> : icon}
      {children}
      {iconRight}
    </button>
  );
}

function Card({ children, padding = 20, style = {}, onClick, hoverable }) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      onFocus={clickable ? () => setFocused(true) : undefined}
      onBlur={clickable ? () => setFocused(false) : undefined}
      style={{
        background: C.panel,
        border: `1px solid ${hover ? '#DCDFE5' : C.line}`,
        borderRadius: 16,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: hover ? SHADOW.md : SHADOW.xs,
        transform: hover ? 'translateY(-2px)' : 'none',
        // 키보드 포커스 가시성(WCAG 2.4.7): 클릭 가능한 카드에 Tab으로 접근 시 브랜드 포커스 링 표시
        outline: clickable && focused ? `2px solid ${C.brand}` : 'none',
        outlineOffset: 2,
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', icon, style = {}, disabled, autoComplete, inputMode, min, max, maxLength, error, describedBy }) {
  // error(truthy) 시 위험색 경계·아이콘 표시를 표준화(디자인 시스템: 에러=danger+아이콘).
  // blur 후에도 오류 경계를 유지하고, aria-invalid로 스크린리더에 오류를 전달한다.
  const hasErr = !!error;
  const restColor = hasErr ? C.red : C.line;
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: hasErr ? C.red : C.mute, display: 'flex' }}>{icon}</div>}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-invalid={hasErr || undefined}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        maxLength={maxLength}
        disabled={disabled}
        style={{
          width: '100%', padding: icon ? '10px 14px 10px 38px' : '10px 14px',
          border: `1px solid ${restColor}`, borderRadius: 10,
          fontSize: 13.5, fontFamily: FONT_STACK, color: C.ink,
          background: disabled ? C.lineSoft : C.panel, outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = hasErr ? C.red : C.brand; e.target.style.boxShadow = `0 0 0 3px ${hasErr ? C.red : C.brand}1f`; }}
        onBlur={(e) => { e.target.style.borderColor = restColor; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, style = {}, maxLength, showCount, error, describedBy }) {
  // maxLength: 입력 상한(네이티브 강제) · showCount: 하단 글자 수 카운터 표시(자유서술 입력 피드백).
  // error: 위험색 경계·aria-invalid로 오류 상태 표준화(Input과 동일 문법). 둘 다 선택적 — 하위호환.
  const hasErr = !!error;
  const restColor = hasErr ? C.red : C.line;
  const ta = (
    <textarea
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      aria-invalid={hasErr || undefined}
      aria-describedby={describedBy}
      rows={rows}
      maxLength={maxLength}
      style={{
        width: '100%', padding: '11px 14px',
        border: `1px solid ${restColor}`, borderRadius: 10,
        fontSize: 13.5, fontFamily: FONT_STACK, color: C.ink,
        background: C.panel, outline: 'none', resize: 'vertical',
        lineHeight: 1.6, transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...style
      }}
      onFocus={(e) => { e.target.style.borderColor = hasErr ? C.red : C.brand; e.target.style.boxShadow = `0 0 0 3px ${hasErr ? C.red : C.brand}1f`; }}
      onBlur={(e) => { e.target.style.borderColor = restColor; e.target.style.boxShadow = 'none'; }}
    />
  );
  if (!showCount) return ta;
  const len = (value || '').length;
  const near = maxLength != null && len >= maxLength;
  return (
    <div style={{ width: '100%' }}>
      {ta}
      <div aria-hidden="true" style={{ marginTop: 5, textAlign: 'right', fontSize: 11.5, fontWeight: 600, color: near ? C.red : C.muteLight, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
        {len.toLocaleString('ko-KR')}{maxLength != null ? ` / ${maxLength.toLocaleString('ko-KR')}` : ''}
      </div>
    </div>
  );
}

function Select({ value, onChange, options, placeholder, style = {}, disabled, error, describedBy }) {
  // Input·Textarea와 일관: 오류 시 위험색 경계+aria-invalid, 비활성 시 흐림·클릭 차단. 모두 선택적이라 하위호환.
  const baseBorder = error ? C.red : C.line;
  return (
    <select
      value={value || ''}
      aria-label={placeholder}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={(e) => { e.target.style.borderColor = error ? C.red : C.brand; e.target.style.boxShadow = `0 0 0 3px ${(error ? C.red : C.brand)}1f`; }}
      onBlur={(e) => { e.target.style.borderColor = baseBorder; e.target.style.boxShadow = 'none'; }}
      style={{
        width: '100%', padding: '9px 14px',
        border: `1px solid ${baseBorder}`, borderRadius: 10,
        fontSize: 13.5, fontFamily: FONT_STACK, color: C.ink, fontWeight: 600,
        background: disabled ? C.lineSoft : C.panel, outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        appearance: 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237C828C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
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
  // 키보드 접근성: 체크박스 input을 display:none 대신 화면에서만 숨기고(포커스 가능 유지)
  // Tab 이동·Space 토글이 동작하도록 함. 포커스 시 시각적 박스에 포커스 링 표시.
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: 10, borderRadius: 8, border: `1px solid ${focused ? C.brand : C.borderSoft}`, background: checked ? C.brandBg : C.card, transition: 'all 0.15s' }}>
      <div
        style={{
          flexShrink: 0, marginTop: 1,
          width: 18, height: 18, borderRadius: 5,
          border: `1px solid ${checked ? C.brand : '#CBD0D8'}`,
          background: checked ? C.brand : C.panel,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease',
          boxShadow: focused ? `0 0 0 3px ${C.brand}33` : 'none',
        }}
      >
        {checked && <Check size={12} color="#fff" strokeWidth={3.2} />}
      </div>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, margin: 0, pointerEvents: 'none' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>
          {label}
          {required && <><span aria-hidden="true" style={{ color: C.red, marginLeft: 4 }}>*</span><span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}> (필수)</span></>}
        </div>
        {sublabel && <div style={{ fontSize: 12, color: C.mute, marginTop: 3, lineHeight: 1.5 }}>{sublabel}</div>}
      </div>
    </label>
  );
}

// 오버레이가 열려 있는 동안 배경 스크롤 잠금 (열린 오버레이 수를 세어 중첩 안전)
let __eumLockCount = 0;

// 다이얼로그 내부에서만 Tab 순환(포커스 트랩) + 닫힐 때 이전 포커스 복원
const FOCUSABLE_SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
      className="eum-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.45)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.15s ease',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        ref={panelRef}
        className="eum-modal-panel eum-sheet-grab"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.panel, borderRadius: 18, maxWidth: widths[size], width: '100%',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          border: `1px solid ${C.line}`,
          boxShadow: SHADOW.lg,
          animation: 'slideUp 0.2s ease',
          outline: 'none', overflow: 'hidden',
        }}
      >
        {title && (
          <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.headline, letterSpacing: '-0.025em' }}>{title}</div>
            <button onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muteLight, padding: 5, borderRadius: 8, display: 'flex' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.inkSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muteLight; }}>
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '13px 22px', borderTop: `1px solid ${C.lineSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 8, background: C.appBg, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  // 자동 사라짐 타이머 — 남은 시간을 추적해 마우스 오버/포커스 시 일시정지, 벗어나면 재개.
  // (긴 안내문을 읽는 도중 사라지는 문제 방지 · 접근성)
  const timerRef = useRef(null);
  const endRef = useRef(0);
  const remainRef = useRef(0);
  useEffect(() => {
    if (!toast) return undefined;
    // 자동 사라짐 시간을 메시지 길이에 맞춰 확장(3~8초). 마우스 오버가 불가한 키보드·터치
    // 사용자도 긴 안내문을 끝까지 읽을 수 있게 함(가독성·접근성). 명시적 duration은 그대로 존중.
    const msgLen = toast.message ? String(toast.message).length : 0;
    remainRef.current = toast.duration || Math.min(8000, Math.max(3000, msgLen * 90));
    endRef.current = Date.now() + remainRef.current;
    timerRef.current = setTimeout(onClose, remainRef.current);
    return () => clearTimeout(timerRef.current);
  }, [toast, onClose]);
  if (!toast) return null;
  const pause = () => {
    clearTimeout(timerRef.current);
    remainRef.current = Math.max(0, endRef.current - Date.now());
  };
  const resume = () => {
    endRef.current = Date.now() + remainRef.current;
    timerRef.current = setTimeout(onClose, remainRef.current);
  };
  // 토스트 — 어두운 알약을 걷어내고 화이트 서피스 + 좌측 상태 아이콘 칩으로.
  // 콘솔 전반의 화이트 카드 언어와 일관되게, 상태는 아이콘 색으로만 전달한다.
  const colors = {
    success: { c: C.sage, soft: C.sageSoft, icon: <CheckCircle2 size={16} /> },
    error: { c: C.red, soft: C.redSoft, icon: <AlertCircle size={16} /> },
    info: { c: C.brand, soft: C.brandSoft, icon: <Info size={16} /> },
  };
  const c = colors[toast.type || 'info'];
  return (
    <div className="eum-noprint" role="status" aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume}
      style={{
      // 위치는 App 하단의 토스트 컨테이너(fixed 우하단 flex 스택)가 잡는다.
      // 이전엔 여기서도 fixed(bottom 24)를 걸어 토스트가 여러 개일 때 같은 자리에 겹쳤다.
      background: C.panel, color: C.headline, padding: '12px 10px 12px 12px',
      border: `1px solid ${C.line}`, borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 11,
      boxShadow: SHADOW.lg, maxWidth: 400,
      fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em',
      animation: 'slideInRight 0.2s cubic-bezier(0.22,1,0.36,1)',
      fontFamily: FONT_STACK,
    }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: c.soft, color: c.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {c.icon}
      </span>
      <span style={{ lineHeight: 1.45 }}>{toast.message}</span>
      <button onClick={onClose} aria-label="알림 닫기" style={{ flexShrink: 0, marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer', color: C.muteLight, padding: 5, borderRadius: 8, display: 'flex', alignSelf: 'flex-start', transition: 'background 0.15s ease, color 0.15s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.inkSoft; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muteLight; }}>
        <X size={15} />
      </button>
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

function KpiStrip({ items, style = {} }) {
  return (
    <div style={{
      // 헤어라인 그리드 — 셀 사이 1px 간격에 배경(구분선색)이 비쳐 행·열 모두 정확히 나뉜다.
      // borderLeft 방식은 2행으로 접힐 때(모바일) 좌측 구분선이 잘못 남고 행 사이 선이 사라졌다.
      display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
      gap: 1, background: C.lineSoft, border: `1px solid ${C.line}`, borderRadius: 16,
      boxShadow: SHADOW.xs, overflow: 'hidden', ...style,
    }}>
      {items.map((k, i) => (
        <div key={k.label} style={{ padding: '16px 20px 18px', background: C.panel }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
            {k.icon && (
              <span style={{ width: 24, height: 24, borderRadius: 7, background: (k.color || C.ink) + '14', color: k.color || C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</span>
            )}
            <span style={{ fontSize: 12.5, color: C.navMute, fontWeight: 600 }}>{k.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 27, fontWeight: 800, color: C.headline, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {typeof k.value === 'number' ? <CountUp value={k.value} /> : k.value}
            </span>
            {k.unit && <span style={{ fontSize: 13.5, fontWeight: 700, color: C.muteLight }}>{k.unit}</span>}
          </div>
          {k.sub && <div style={{ fontSize: 12, color: C.muteLight, marginTop: 10, fontWeight: 500, lineHeight: 1.45 }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function useCountUp(target, duration = 950) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, '')) || 0;
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
  }, [target, duration]);
  return val;
}

function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 950 }) {
  const v = useCountUp(value, duration);
  const n = (decimals > 0 ? v : Math.round(v)).toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  // 숫자는 tabular-nums로 고정폭 — 카운트업 중 흔들림 방지·금액 열 정렬(디자인 시스템)
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{n}{suffix}</span>;
}

function Ring({ value, max = 100, size = 96, stroke = 9, color = C.brand, track = C.borderSoft, label, sublabel, duration = 1100 }) {
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
        {label != null && <div style={{ fontSize: Math.round(size * 0.27), fontWeight: 800, color: C.ink, fontFamily: SERIF_STACK, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{label}</div>}
        {sublabel && <div style={{ fontSize: Math.max(10, Math.round(size * 0.12)), color: C.mute, marginTop: 3, fontWeight: 600 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function AnimatedBar({ value, max = 100, color = C.brand, height = 8, track = C.borderSoft, duration = 850, delay = 0 }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const reduce = prefersReducedMotion();
  const [w, setW] = useState(reduce ? pct : 0);
  useEffect(() => {
    if (reduce) { setW(pct); return undefined; }
    const id = setTimeout(() => setW(pct), delay + 30);
    return () => clearTimeout(id);
  }, [pct, delay, reduce]);
  return (
    <div style={{ height, background: track, borderRadius: height, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${w * 100}%`, height: '100%', background: color, borderRadius: height, transition: reduce ? 'none' : `width ${duration}ms cubic-bezier(0.22,1,0.36,1)` }} />
    </div>
  );
}

function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  const reduce = prefersReducedMotion();
  const [shown, setShown] = useState(reduce);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    let timer;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { timer = setTimeout(() => setShown(true), delay); io.unobserve(el); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer); };
  }, [delay, reduce]);
  return (
    <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : `translateY(${y}px)`, transition: reduce ? 'none' : 'opacity 0.7s ease, transform 0.85s cubic-bezier(0.22,1,0.36,1)', willChange: 'opacity, transform', ...style }}>
      {children}
    </div>
  );
}

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
  const inputRef = useRef();
  return (
    <div style={{ position: 'relative', ...style }}>
      <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mute, pointerEvents: 'none' }} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onFocus={(e) => { e.target.style.borderColor = C.brand; e.target.style.boxShadow = `0 0 0 3px ${C.brand}1f`; }}
        onBlur={(e) => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
        style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, border: `1px solid ${C.line}`, background: C.panel, fontSize: 13.5, color: C.ink, fontFamily: FONT_STACK, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }}
      />
      {value && (
        <button onClick={() => { onChange(''); if (inputRef.current) inputRef.current.focus(); }} aria-label="검색어 지우기" style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.mute, display: 'flex', padding: 3, borderRadius: 7, transition: 'background 0.14s ease, color 0.14s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.inkSoft; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.mute; }}>
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function Tabs({ tabs, active, onChange, style = {}, ariaLabel }) {
  const [hoverId, setHoverId] = useState(null);
  return (
    // 세그먼티드 컨트롤 — 밑줄 탭 대신 트랙 위 화이트 필. 상태가 한눈에 잡히고 밀도가 높다.
    <div role="tablist" aria-label={ariaLabel} style={{
      display: 'inline-flex', gap: 2, padding: 4,
      background: C.lineSoft, borderRadius: 12, border: `1px solid ${C.line}`,
      maxWidth: '100%', overflowX: 'auto', ...style,
    }}>
      {tabs.map((t, i) => {
        const isActive = active === t.id;
        const isHover = hoverId === t.id && !isActive;
        return (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          tabIndex={isActive ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            // WAI-ARIA 탭 패턴 — 좌우 화살표로 탭 이동, Home/End로 처음·끝
            let ni = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (i + 1) % tabs.length;
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ni = (i - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') ni = 0;
            else if (e.key === 'End') ni = tabs.length - 1;
            if (ni === null) return;
            e.preventDefault();
            onChange(tabs[ni].id);
            const btns = e.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
            if (btns && btns[ni]) btns[ni].focus();
          }}
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

function Skeleton({ w = '100%', h = 14, r = 8, style = {} }) {
  return (
    <div
      aria-hidden="true"
      className="eum-skeleton"
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  );
}

const EUM_MARK_D = "M73.92,53.01c-.39,2.89-1.77,5.44-4.06,7.16-2.63,1.98-6.02,2.48-9.18,1.52-2.76-.84-4.87-2.92-6.02-5.55-2.76-6.31.48-13.43,4.62-18.77-4.81-3.43-9.95-3.44-14.89-.02,2.95,3.92,5.56,8.47,5.65,13.47.12,6.27-4.1,11.48-10.41,11.34-3.8-.09-7.11-2.14-8.8-5.54-3.43-6.92.84-14.26,5.84-19.43-4.61-4.22-10.66-7.27-16.93-6.78-3.62.29-7.06,1.67-9.59,4.3-3.03,3.14-4.24,7.51-3.75,11.8.98,8.62,8.74,13.5,17.13,12.74.54-.05,1.07.12,1.42.52,1.16,1.34.87,3.29-.64,4.26-.82.53-1.8.77-2.83.81-8.38.3-16.45-3.86-19.76-11.7-3.85-9.12-1.19-20.44,7.51-25.61,3.02-1.79,6.29-2.63,9.85-2.93-7.31-2.08-11.11-9.72-8.46-16.65C12.18,3.87,15.98.73,20.54.11c7.35-.99,13.84,4.54,14.02,11.98.15,6.03-3.91,11.33-9.94,12.68,6.52,1.21,11.73,4.22,16.36,8.76,2.37-1.74,4.92-2.86,7.86-3.35-2.47-.81-4.54-2.39-5.82-4.68-2.96-5.27-.82-12.02,4.69-14.48,5.41-2.41,11.65.2,13.75,5.62,2.11,5.45-.69,11.64-6.49,13.52,2.76.57,5.34,1.6,7.76,3.36,4.66-4.58,9.8-7.61,16.35-8.75-5.06-1.16-8.74-4.97-9.72-9.94-.82-4.14.5-8.28,3.41-11.21,2.94-2.95,7.15-4.21,11.33-3.35,5.06,1.03,8.99,5.33,9.66,10.42.84,6.35-3.04,12.19-9.15,13.89,7.4.59,13.8,4.12,16.99,10.82,2.36,4.97,2.65,10.75.97,15.99-2.87,8.93-11.55,13.91-20.69,13.44-.86-.04-1.64-.27-2.35-.65-1.43-.76-1.92-2.35-1.26-3.8.37-.81,1.01-1.19,1.92-1.12,6.35.5,12.75-2.12,15.63-7.95,2.39-4.85,2.02-10.71-1.1-15.15-1.61-2.29-3.89-3.86-6.51-4.82-7.44-2.74-15.52.58-21.19,5.85,4.03,4.25,7.72,9.77,6.91,15.83ZM29.02,12.49c0-3.77-3.06-6.82-6.82-6.82s-6.82,3.06-6.82,6.82,3.06,6.82,6.82,6.82,6.82-3.06,6.82-6.82ZM88.34,12.49c0-3.76-3.05-6.81-6.81-6.81s-6.81,3.05-6.81,6.81,3.05,6.81,6.81,6.81,6.81-3.05,6.81-6.81ZM57.06,20.43c0-2.83-2.3-5.13-5.13-5.13s-5.13,2.3-5.13,5.13,2.3,5.13,5.13,5.13,5.13-2.3,5.13-5.13ZM37.05,55.12c1.25,1.05,2.82,1.31,4.41.8,1.19-.38,2.37-1.43,2.88-2.86,1.43-3.91-1.59-8.78-4.12-12.01-2.32,2.61-4.66,6.02-4.96,9.36-.16,1.77.37,3.53,1.77,4.72ZM68.24,49.18c-.81-3.07-2.66-5.69-4.78-8.16-2.46,3.13-5.29,7.72-4.22,11.62.55,2.03,2.25,3.43,4.23,3.53,2.03.11,3.83-1.06,4.6-2.99.5-1.26.47-2.6.18-4Z";

function EumLogo({ size = 32, variant = 'badge' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 105 105" style={{ display: 'block', flexShrink: 0 }} role="img" aria-label="이음 로고">
      <g transform="translate(0,19.5)">
        <path fill={C.brand} d={EUM_MARK_D} />
      </g>
    </svg>
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

function Field({ label, required, sub, error, errorId, children }) {
  // error(문자열) 시 입력 아래에 위험색 안내 + 아이콘을 표준 노출(디자인 시스템: 에러=danger+아이콘, 아래 배치).
  // errorId를 Input/Textarea의 describedBy와 연결하면 스크린리더가 오류 문구를 함께 읽는다.
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{label}{required && <><span aria-hidden="true" style={{ color: C.red, marginLeft: 3 }}>*</span><span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}> (필수)</span></>}</label>
      </div>
      {sub && <div style={{ fontSize: 12, color: C.navMute, marginBottom: 7, lineHeight: 1.5 }}>{sub}</div>}
      {children}
      {error && (
        <div id={errorId} role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginTop: 6, fontSize: 12, color: C.red, lineHeight: 1.45 }}>
          <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1.5 }} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
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
            aria-pressed={isSel}
            onClick={() => !disabled && onToggle(o)}
            disabled={disabled}
            style={{
              padding: '6px 12px', borderRadius: 16,
              border: `1.5px solid ${isSel ? color : C.line}`,
              background: isSel ? color : C.panel,
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

function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export {
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
  StatCard,
  KpiStrip,
  useCountUp,
  CountUp,
  Ring,
  AnimatedBar,
  Reveal,
  TRUST_META,
  TrustBadge,
  useIsMobile,
  SearchBar,
  Tabs,
  Empty,
  Skeleton,
  EUM_MARK_D,
  EumLogo,
  PageHeader,
  Panel,
  Field,
  ChipSelect,
  prefersReducedMotion,
};
