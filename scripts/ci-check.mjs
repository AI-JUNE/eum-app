#!/usr/bin/env node
// ============================================================================
// scripts/ci-check.mjs — 통합 검증 게이트(로컬·CI 공용)
//   1) 번들 빌드(esbuild) 성공  2) 테스트 전건 통과  3) 복구 리허설 PASS
//   실행: npm run ci
//   종료코드: 전부 통과 0 / 하나라도 실패 1
//
//   ※ GitHub Actions 워크플로 파일(.github/workflows/*)은 푸시 토큰에 `workflow`
//      스코프가 없으면 AutoPush 전체가 막히므로 저장소에 넣지 않았다.
//      템플릿은 scripts/ci/github-workflow.yml.example 에 두었고,
//      실제 배치·활성화는 [승인 필요].
// ============================================================================
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT_DIR = mkdtempSync(join(tmpdir(), 'eum-ci-'));

// 셸 글로브에 기대지 않고 테스트 파일을 직접 나열한다(OS·셸 차이 방지)
const TEST_FILES = readdirSync('tests').filter((f) => f.endsWith('.test.mjs')).sort().map((f) => join('tests', f));
if (TEST_FILES.length === 0) { console.error('테스트 파일이 없습니다 (tests/*.test.mjs)'); process.exit(1); }

const STEPS = [
  {
    name: '빌드(esbuild 번들)',
    cmd: 'npx',
    args: ['--yes', 'esbuild@0.23.0', 'src/EumApp.jsx', '--bundle', '--format=esm', '--jsx=automatic',
      '--external:react', '--external:react-dom', '--external:lucide-react', '--external:recharts',
      '--loader:.jsx=jsx', '--outfile=' + join(OUT_DIR, 'eumcheck.js')],
  },
  { name: `테스트(node --test, ${TEST_FILES.length}개 파일)`, cmd: process.execPath, args: ['--test', ...TEST_FILES] },
  { name: '복구 리허설', cmd: process.execPath, args: ['scripts/rehearse-restore.mjs'] },
];

let failed = 0;
const results = [];
for (const s of STEPS) {
  const t0 = Date.now();
  const r = spawnSync(s.cmd, s.args, { stdio: 'inherit', shell: process.platform === 'win32' });
  const ok = r.status === 0;
  if (!ok) failed += 1;
  results.push({ name: s.name, ok, ms: Date.now() - t0, code: r.status });
}

rmSync(OUT_DIR, { recursive: true, force: true });

console.log('\n===== CI 검증 요약 =====');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  (${r.ms}ms, exit ${r.code})`);
console.log(failed === 0 ? '전체 통과' : `실패 ${failed}건`);
process.exit(failed === 0 ? 0 : 1);
