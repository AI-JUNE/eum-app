// 정산 헬퍼 — 상태/금액/발급코드 단일 소스
import { C } from './theme.js';

// ── 정산 헬퍼 (인앱 일원화: 상태·금액·발급코드 단일 소스) ──────────────────
// 라이프사이클: 산정(calculated) → 발급(issued, 상생카드 코드생성) → 지급완료(delivered)
const SETTLE_DONE = new Set(['issued', 'paid', 'delivered']);
export const isSettled = (s) => !!s && SETTLE_DONE.has(s.status);
export const settleAmount = (s) => (s && (s.amount != null ? s.amount : s.amount_krw)) || 0;
export const settleHours = (s) => (s && (s.hours != null ? s.hours : s.total_hours)) || 0;
export const SETTLE_STATUS = {
  calculated: { label: '산정', color: C.mute, soft: C.muteSoft },
  pending: { label: '발급대기', color: C.amber, soft: C.amberSoft },
  issued: { label: '발급완료', color: C.sage, soft: C.sageSoft },
  paid: { label: '발급완료', color: C.sage, soft: C.sageSoft },
  delivered: { label: '지급완료', color: C.success, soft: C.successSoft },
};
export const settleStatusOf = (st) => SETTLE_STATUS[st] || SETTLE_STATUS.calculated;
// 광주상생카드 발급코드 (GSC-YYMM-XXXX)
export function genVoucherCode(period, seed) {
  const ym = String(period || '').replace('-', '').slice(2, 6) || '0000';
  const base = (String(seed || '') + Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `GSC-${ym}-${base.slice(-4).padStart(4, '0')}`;
}