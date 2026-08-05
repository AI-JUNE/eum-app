// ============================================================================
// 코디네이터(CoordinatorApp) 콘솔 화면군 — EumApp.jsx 단일파일 분해 4단계 (2026-08-06)
//   값·로직은 EumApp.jsx 원본과 100% 동일(이동만). 상태·리듀서는 EumApp에 유지.
// ============================================================================
import { useMemo, useState } from 'react';
import { Activity, AlertCircle, AlertTriangle, ArrowRight, Award, Bell, Calendar, Camera, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock, FileText, GraduationCap, Hash, Heart, Info, Loader2, Phone, Printer, Send, ShieldAlert, ShieldCheck, Smile, Sparkles, Star, Trash2, TrendingUp, UserPlus, Users, Wallet, X } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { C, FONT_STACK, PERSONA, SERIF_STACK, SHADOW } from '../theme.js';
import { TODAY, fmtDate, krw, uid } from '../utils.js';
import { callClaude } from '../api.js';
import { aiAutoTrios, aiDong, aiTrioScore, aiWelfare } from '../matching.js';
import { Avatar } from '../avatar.jsx';
import { Badge, Button, Card, Checkbox, CountUp, Empty, Field, Input, KpiStrip, Modal, PageHeader, Panel, Ring, SearchBar, Select, Skeleton, Tabs, Textarea, TrustBadge, useIsMobile } from '../ui.jsx';
import { Layout, trustStatus } from '../chrome.jsx';
import { EUM_API } from '../eumApi.js';

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
        right={<span className="eum-noprint" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Select value={period} onChange={setPeriod}
            options={['2027-05', '2027-06', '2027-07'].map(m => ({ value: m, label: m + '월' }))}
            style={{ width: 140 }} />
          {/* 인쇄·PDF — 지자체 제출용 지면 산출. window.print()만 호출(순수 표현), 브라우저 '대상: PDF 저장'으로 파일화 */}
          <Button variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()}>인쇄 · PDF</Button>
          <Button variant="brand" icon={<Sparkles size={16} />} onClick={generateAiSummary} disabled={aiLoading}>{aiLoading ? '생성 중…' : 'AI 요약 생성'}</Button>
        </span>} />

      {/* 인쇄 전용 레터헤드 — 화면에는 숨김(.eum-printonly). 제출 지면의 첫인상: 발행 주체·기간·발행일 명기 */}
      <div className="eum-printonly" style={{ display: 'none' }}>
        <div style={{ borderBottom: `2.5px solid ${C.brand}`, paddingBottom: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.brand, letterSpacing: '0.1em', marginBottom: 6 }}>이음 — 3세대 상생 품앗이</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.headline, letterSpacing: '-0.03em' }}>월간 운영 리포트 · {period.split('-')[0]}년 {period.split('-')[1]}월</div>
          <div style={{ fontSize: 12, color: C.navMute, marginTop: 6 }}>발행일 {fmtDate(TODAY)} · 광주광역시 광산구 · 담당 코디네이터</div>
        </div>
      </div>

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
          {/* 640px 이하 1열 스택(.eum-survey-grid) — 모바일에서 인용문 글줄 부러짐 해소 */}
          <div className="eum-survey-grid">
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

export { CoordinatorApp };
