// ============================================================================
// AuditLog.jsx — 코디네이터 감사 로그 화면 (런치 공통 P0 · additive, 2026-08-13)
//   세션 중 발생한 접근·운영 행위(audit.js 링버퍼)를 최신순으로 보여준다.
//   기존 SEED·리듀서·코디 로직 변경 없음 — 조회 전용 화면.
// ============================================================================
import { useMemo, useState } from 'react';
import { Download, ScrollText } from 'lucide-react';
import { C, FONT_STACK, SHADOW } from '../theme.js';
import { Badge, Button, Empty, PageHeader } from '../ui.jsx';
import { AUDIT_CATEGORY_LABEL, auditCounts, auditToCsv, getAuditLog } from '../audit.js';

const ROLE_LABEL = { youth: '청년', senior: '어르신', parent: '학부모', coordinator: '코디네이터' };
const CAT_COLOR = {
  access: C.blue, settlement: C.gold, notice: C.brand, safety: C.red,
  matching: C.lavender, activity: C.sage, data: C.peach,
};

function fmtTs(ts) {
  // ISO → "8/13 19:24:05" (로컬 시각) — 감사 추적은 초 단위까지 보여준다.
  try {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}:${ss}`;
  } catch { return ts; }
}

function CoordAudit({ state }) {
  const [cat, setCat] = useState('all');
  // dispatch → 상태 변경 → 리렌더 시점에 링버퍼 스냅샷을 다시 읽는다.
  const all = getAuditLog();
  const counts = useMemo(() => auditCounts(all), [all]);
  const list = cat === 'all' ? all : all.filter((e) => e.category === cat);
  const nameOf = (id) => {
    if (!id) return '—';
    const p = (state.participants || []).find((x) => x.id === id);
    return p ? p.name : id;
  };

  const downloadCsv = () => {
    const blob = new Blob(['\ufeff' + auditToCsv(list)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `이음_감사로그_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chips = [['all', `전체 ${all.length}`], ...Object.keys(AUDIT_CATEGORY_LABEL)
    .filter((k) => counts[k])
    .map((k) => [k, `${AUDIT_CATEGORY_LABEL[k]} ${counts[k]}`])];

  return (
    <div>
      <PageHeader
        title="감사 로그"
        subtitle="이 세션에서 일어난 접근·운영 행위 기록입니다 (서버 영구 보관은 상용 전환 시 활성화)"
        right={list.length > 0 ? (
          <Button variant="ghost" size="sm" icon={<Download size={15} />} onClick={downloadCsv}>CSV</Button>
        ) : null}
      />

      {/* 분류 필터 칩 */}
      <div role="group" aria-label="감사 로그 분류 필터" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '2px 0 16px' }}>
        {chips.map(([k, label]) => {
          const on = cat === k;
          return (
            <button key={k} type="button" onClick={() => setCat(k)} aria-pressed={on}
              style={{
                border: `1px solid ${on ? C.brand : C.line}`, cursor: 'pointer', fontFamily: FONT_STACK,
                fontSize: 12.5, fontWeight: on ? 700 : 600, padding: '6px 12px', borderRadius: 999,
                background: on ? C.brand + '14' : C.panel, color: on ? C.brand : C.navMute,
                minHeight: 32, transition: 'border-color .15s ease, background .15s ease, color .15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.outline = `2px solid ${C.brand}`; e.currentTarget.style.outlineOffset = '2px'; }}
              onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
            >{label}</button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <Empty icon={<ScrollText size={28} />} title="기록된 행위가 없습니다"
          sub="로그인·정산 이의·공지 발송 등 운영 행위가 생기면 이곳에 시간순으로 남습니다." />
      ) : (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW.sm, overflow: 'hidden' }}>
          {list.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 18px',
              borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
            }}>
              <span aria-hidden="true" style={{
                width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0,
                background: CAT_COLOR[e.category] || C.mute,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.headline, letterSpacing: '-0.02em' }}>{e.label}</span>
                  <Badge color={CAT_COLOR[e.category] || C.mute} soft={(CAT_COLOR[e.category] || C.mute) + '14'} size="sm">
                    {AUDIT_CATEGORY_LABEL[e.category] || e.category}
                  </Badge>
                </div>
                <div style={{ fontSize: 12, color: C.navMute, marginTop: 3, fontWeight: 600 }}>
                  {nameOf(e.actor_id)}{e.actor_role ? ` · ${ROLE_LABEL[e.actor_role] || e.actor_role}` : ''}{e.target ? ` · ${e.target}` : ''}
                </div>
              </div>
              <span style={{ fontSize: 11.5, color: C.muteLight, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginTop: 2 }}>
                {fmtTs(e.ts)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11.5, color: C.muteLight, lineHeight: 1.6 }}>
        개인정보 보호: 이의 사유·공지 본문 등 자유 입력 내용은 기록하지 않으며, 식별자·상태값 수준만 남깁니다.
        기록은 이 세션(메모리)에만 보관됩니다 — 서버측 영구 감사 로그는 [승인 필요] 트랙입니다.
      </div>
    </div>
  );
}

export default CoordAudit;
