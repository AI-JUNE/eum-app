// ============================================================================
// AI 매칭·복지추천 순수 로직 — EumApp 단일파일에서 분리 (단일파일 분해 · 로직 100% 동일)
//   aiTrioScore: 청년·어르신·아동 3인 조합 적합도 점수(근접도·시간·시너지·안전·세대보완).
//   aiAutoTrios: 후보 전수 조합 후 상위 매칭(중복 인원 배제) 산출.
//   aiWelfare:   참여자 프로필 기반 복지서비스 사각지대 추천.
//   aiDong:      주소에서 '○○동' 생활권 추출 헬퍼(선택형 매칭 UI에서도 사용).
// 기존 EumApp.jsx 내부 정의를 그대로 이동만 했다(동작·반환값 불변). 호출부는 import 로 연결.
// React·테마(C/PERSONA)·상태에 의존하지 않는 순수 함수만 담는다.
//
// 주의: AI_RATE(정산단가)는 컴포넌트(정산 메시지 생성)에서만 쓰이고 이 순수 로직과 무관하여
//       EumApp.jsx 에 그대로 남겨두었다.
// ============================================================================

const AI_W = { proximity: 24, schedule: 20, synergy: 30, safety: 16, complement: 10 };
const AI_LBL = { proximity: '근접도', schedule: '시간적합', synergy: '관심·역량 시너지', safety: '안전·검증', complement: '세대보완' };
const AI_THES = { '책': ['독서지도','학습멘토','한자','동화구연','글쓰기'], '그림': ['예술교육','사진','디자인'], '공룡': ['역사이야기','동화구연'], '로봇': ['코딩교육','수학교육','디지털코칭'], '레고': ['수학교육','코딩교육','예술교육'], '강아지': ['돌봄','건강관리'], '축구': ['건강관리','돌봄'], '노래': ['동화구연','이야기'] };

export function aiDong(a){ const m = String(a||'').match(/([가-힣]{1,4}동)/); return m ? m[1] : ''; }
function aiOverlap(a,b){ const B = new Set(b||[]); return [...new Set((a||[]).filter(x=>B.has(x)))]; }
function aiClamp(x){ return Math.max(0, Math.min(1, x)); }
export function aiTrioScore(y,s,c){
  const p={}, tags=[];
  if(!y||!s||!c) return { total:0, parts:[], tags:[] };
  const dY=aiDong(y.address), dS=aiDong(s.address), dC=aiDong(c.address);
  if(dY&&dY===dS&&dS===dC){ p.proximity=1; tags.push(['근접도', '같은 '+dY+' 생활권']); }
  else if(dS&&dS===dC){ p.proximity=0.78; tags.push(['근접도','어르신·아이 같은 '+dS]); }
  else if(String(y.address).includes('광산구')&&String(s.address).includes('광산구')){ p.proximity=0.5; }
  else p.proximity=0.3;
  const ov=aiOverlap(y.availability,s.availability);
  p.schedule = ov.length>=2?1:ov.length===1?0.72:0.34;
  if(ov.length) tags.push(['시간','겹치는 시간 '+ov.join(', ')]);
  const pool=[...(y.skills||[]),...(s.skills||[]),...(s.interests||[])];
  let sg=0;
  (c.interests||[]).forEach(ci=>{ const f=AI_THES[ci]||[]; if(pool.find(sk=>f.includes(sk)||sk===ci)){ sg+=0.34; tags.push(['시너지',"아이 '"+ci+"' 관심 ↔ 멘토 역량"]); } });
  const peer=aiOverlap(y.interests,s.interests);
  p.synergy=aiClamp(0.2+sg+peer.length*0.12);
  const st=x=>x.status==='active'?1:x.status==='pending_match'?0.8:x.status==='verifying'?0.5:0.4;
  p.safety=aiClamp((st(y)+st(s)+1)/3);
  tags.push((y.status==='active'&&s.status==='active')?['안전','3인 모두 안전검증 완료']:['안전','검증 진행 중 — 활성화 전 완료']);
  let cp=0.25; const occ=s.occupation||'';
  if(/교사|교직/.test(occ)&&(c.interests||[]).includes('책')) cp+=0.5;
  if(/식당|요리|봉제/.test(occ)) cp+=0.2;
  if(/개발|디자이너|회계|간호/.test(y.occupation||'')) cp+=0.2;
  p.complement=aiClamp(cp);
  let tot=0, ws=0; Object.keys(AI_W).forEach(k=>{ tot+=(p[k]||0)*AI_W[k]; ws+=AI_W[k]; });
  const parts=Object.keys(AI_W).map(k=>({ k, label:AI_LBL[k], w:AI_W[k], v:Math.round((p[k]||0)*100) }));
  const seen=new Set(); const ut=tags.filter(t=>{ if(seen.has(t[1]))return false; seen.add(t[1]); return true; });
  return { total: Math.round(aiClamp(tot/ws)*100), parts, tags: ut };
}
export function aiAutoTrios(ys, ss, cs, max){
  const cb=[];
  (ys||[]).forEach(y=>(ss||[]).forEach(s=>(cs||[]).forEach(c=>{ const sc=aiTrioScore(y,s,c); cb.push({ y,s,c, ...sc }); })));
  cb.sort((a,b)=>b.total-a.total);
  const uy=new Set(), us=new Set(), uc=new Set(), out=[];
  for(const x of cb){ if(out.length>=(max||3))break; if(uy.has(x.y.id)||us.has(x.s.id)||uc.has(x.c.id))continue; uy.add(x.y.id); us.add(x.s.id); uc.add(x.c.id); out.push(x); }
  return out;
}
export function aiWelfare(pf){
  const r=[]; const add=(name,why,benefit,where,gap)=>r.push({name,why,benefit,where,gap});
  if(pf.age>=65){
    add('노인맞춤돌봄서비스','65세 이상 안부·생활지원 대상 추정','월 16시간 내외 방문·안부','읍면동 행정복지센터', !(pf.gets||[]).includes('노인맞춤돌봄'));
    add('통합돌봄(일상생활돌봄·가족지원)','2026.3 시행 — 65세+ 재가 통합지원','개인별지원계획','시군구 통합지원전담조직', true);
    if(pf.alone) add('응급안전안심서비스','독거노인 응급·안전 모니터링','댁내 센서·응급호출','읍면동·지역센터', true);
    if(pf.income!=='일반') add('기초연금','65세+ 소득 하위 70% 추정','월 최대 약 34만원','국민연금공단·복지로', !(pf.gets||[]).includes('기초연금'));
  }
  if(pf.digitalWeak) add('디지털 배움터·에이징테크','디지털 취약 어르신 교육','무료 교육·기기 지원','과기정통부·지자체', true);
  if(pf.careNeed && pf.age<65) add('일상돌봄 서비스','질병·고립 청·중장년 재가돌봄','재가·가사·심리 바우처','읍면동 신청', true);
  if(pf.familyCareYouth) add('가족돌봄청년 지원','가족 돌보는 9~39세 청년','자기돌봄비·서비스 연계','지자체 복지포털', true);
  if(pf.income==='저소득') add('맞춤형 생계·의료급여 점검','소득·재산 기준 충족 시','급여·의료비 경감','복지로 모의계산', true);
  return r;
}
