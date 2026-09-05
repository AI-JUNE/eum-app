// ============================================================================
// BackupPanel.jsx — 데이터 백업·무결성 확인 (상용 필수 · additive, 2026-09-05)
//   운영자가 RUNBOOK 의 백업 절차를 화면에서 그대로 수행할 수 있게 한다.
//     · 백업 파일 만들기: 현재 상태 스냅샷을 클라이언트 Blob 으로 저장(외부 전송 없음)
//     · 반출용 마스킹본: 개인정보를 가린 사본(점검·공유용, 복원 불가)
//     · 무결성 확인: 보관 중인 파일을 불러 체크섬·건수 검증(상태를 바꾸지 않음)
//   ⚠️ 실제 "복원"은 화면에서 실행하지 않는다 — 운영 데이터를 덮어쓰는 되돌리기 어려운
//      작업이므로 RUNBOOK 절차 + 승인 후 수행한다. 복원 로직은 backup.js 에 구현되어 있다.
//   기존 SEED·리듀서·코디 로직 변경 없음 — 읽기 전용 화면.
// ============================================================================
import { useRef, useState } from 'react';
import { Download, ShieldCheck, Upload } from 'lucide-react';
import { C, SHADOW } from '../theme.js';
import { Button } from '../ui.jsx';
import {
  createSnapshot, serializeSnapshot, parseSnapshot, snapshotFilename,
  verifySnapshot, redactSnapshot, countTables, BACKUP_TABLES,
} from '../backup.js';

function saveJson(snapshot) {
  const blob = new Blob([serializeSnapshot(snapshot)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = snapshotFilename(snapshot);
  a.click();
  URL.revokeObjectURL(url);
}

function BackupPanel({ state }) {
  const [msg, setMsg] = useState(null); // { ok, text, detail }
  const fileRef = useRef(null);

  const counts = countTables(
    BACKUP_TABLES.reduce((acc, t) => { acc[t] = state?.[t] || []; return acc; }, {})
  );
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const doBackup = (redact) => {
    try {
      const snap = createSnapshot(state, { source: 'coordinator' });
      const out = redact ? redactSnapshot(snap) : snap;
      saveJson(out);
      setMsg({
        ok: true,
        text: redact ? '마스킹본을 저장했습니다' : '백업 파일을 저장했습니다',
        detail: `${snapshotFilename(out)} · 레코드 ${total}건 · 체크섬 ${out.checksum}`
          + (redact ? ' · 이 파일은 복원에 사용할 수 없습니다' : ''),
      });
    } catch (e) {
      setMsg({ ok: false, text: '백업 파일을 만들지 못했습니다', detail: String((e && e.message) || e) });
    }
  };

  const onPick = (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const snap = parseSnapshot(reader.result);
      if (!snap) { setMsg({ ok: false, text: '파일을 읽지 못했습니다', detail: 'JSON 형식이 아닙니다' }); return; }
      const r = verifySnapshot(snap);
      const c = countTables(snap.tables || {});
      const n = Object.values(c).reduce((a, b) => a + b, 0);
      setMsg(r.ok
        ? { ok: true, text: '무결성 확인 완료 — 복원 가능한 백업입니다', detail: `${file.name} · 생성 ${String(snap.created_at || '').slice(0, 16).replace('T', ' ')} · 레코드 ${n}건` }
        : { ok: false, text: '이 파일은 복원에 사용할 수 없습니다', detail: r.errors.join(' / ') });
    };
    reader.onerror = () => setMsg({ ok: false, text: '파일을 읽지 못했습니다', detail: '읽기 오류' });
    reader.readAsText(file);
  };

  return (
    <section
      aria-label="데이터 백업"
      style={{
        marginTop: 22, background: C.panel, border: `1px solid ${C.line}`,
        borderRadius: 16, boxShadow: SHADOW.sm, padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck size={16} color={C.brand} aria-hidden="true" />
        <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.headline, letterSpacing: '-0.02em' }}>
          데이터 백업·무결성 확인
        </h3>
      </div>
      <p style={{ margin: '7px 0 0', fontSize: 12.5, color: C.navMute, fontWeight: 600, lineHeight: 1.6 }}>
        현재 데이터 {total.toLocaleString()}건을 파일 한 개로 내려받습니다. 파일은 이 기기에서만 만들어지며 외부로 전송되지 않습니다.
        복원 절차와 보관 주기는 <span style={{ color: C.ink, fontWeight: 700 }}>RUNBOOK.md</span> 를 따릅니다.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <Button icon={<Download size={16} />} onClick={() => doBackup(false)}>백업 파일 만들기</Button>
        <Button variant="secondary" icon={<Download size={16} />} onClick={() => doBackup(true)}>반출용 마스킹본</Button>
        <Button variant="secondary" icon={<Upload size={16} />} onClick={() => fileRef.current && fileRef.current.click()}>
          백업 파일 무결성 확인
        </Button>
        <input
          ref={fileRef} type="file" accept="application/json,.json"
          onChange={onPick} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1}
        />
      </div>

      {msg && (
        <div
          role="status"
          style={{
            marginTop: 12, padding: '10px 13px', borderRadius: 12,
            background: msg.ok ? C.sageSoft || C.brandBg : C.redSoft || C.brandBg,
            border: `1px solid ${msg.ok ? C.sage || C.line : C.red || C.line}33`,
            fontSize: 12.5, fontWeight: 700, color: msg.ok ? C.ink : C.red || C.ink, lineHeight: 1.6,
          }}
        >
          {msg.text}
          {msg.detail && (
            <div style={{ fontSize: 11.5, fontWeight: 600, color: C.navMute, marginTop: 3, wordBreak: 'break-all' }}>
              {msg.detail}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11.5, color: C.muteLight, lineHeight: 1.6 }}>
        백업 원본에는 개인정보가 포함됩니다 — 잠금 보관하고, 공유가 필요하면 마스킹본을 쓰세요.
        <br />
        데이터 되돌리기(복원)는 화면에서 실행하지 않습니다. 운영 데이터를 덮어쓰는 작업이라 RUNBOOK 절차와 승인이 필요합니다 — <span style={{ fontWeight: 700 }}>[승인 필요]</span>
      </div>
    </section>
  );
}

export default BackupPanel;
