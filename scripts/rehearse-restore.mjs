#!/usr/bin/env node
// ============================================================================
// scripts/rehearse-restore.mjs — 복구 리허설 실행기
//   RUNBOOK.md 의 "분기 복구 리허설" 절차를 코드로 수행하고, 문서에 붙여넣을
//   결과표를 출력한다. 상태를 바꾸지 않으며 네트워크도 쓰지 않는다.
//
//   실행: npm run rehearse:restore
//   종료코드: 통과 0 / 실패 1 (CI 에서 그대로 게이트로 쓸 수 있다)
// ============================================================================
import { runRestoreRehearsal, rehearsalSummary, createSnapshot, serializeSnapshot } from '../src/eum/backup.js';
import { SEED_DATA } from '../src/eum/seed.js';
import { normalizeState } from '../src/eum/storage.js';

const rec = runRestoreRehearsal(SEED_DATA, { normalize: normalizeState, source: 'runbook-rehearsal' });

console.log(rehearsalSummary(rec));
console.log('');
console.log('| 단계 | 결과 | 비고 |');
console.log('| --- | --- | --- |');
rec.steps.forEach((s) => console.log(`| ${s.step} | ${s.ok ? 'PASS' : 'FAIL'} | ${s.detail} |`));
console.log('');
console.log('컬렉션별 건수: ' + JSON.stringify(rec.counts));
console.log('스냅샷 크기: ' + serializeSnapshot(createSnapshot(SEED_DATA)).length + ' bytes');
console.log('실행 환경: node ' + process.version);

process.exit(rec.ok ? 0 : 1);
