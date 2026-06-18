// 포맷 헬퍼 — 통화/날짜/상대시간/ID
import { TODAY } from './constants.js';

export const krw = (n) => '₩' + (n || 0).toLocaleString('ko-KR');
export const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};
export const fmtDateTime = (s) => {
  if (!s) return '—';
  const d = new Date(s.replace(' ', 'T'));
  if (isNaN(d)) return s;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const fmtRelativeDate = (s) => {
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
export const initials = (name) => (name || '?').slice(0, 1);
export const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
