import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildHealth, findSecretLeaks, dependencySummary, withDependencies } from './src/eum/health.js'
import { LEGAL_META } from './src/eum/legal.js'

// ── 배포 헬스체크(공통 P0-5) ────────────────────────────────────────────────
// 빌드 산출물 루트에 health.json 을 생성한다. 배포 후 /health.json 으로
// "어떤 커밋이 떠 있고 어떤 게이트가 켜져 있는지"를 즉시 확인할 수 있다.
// 시크릿은 값이 아니라 존재 여부(boolean)만 담기며, 유출 감지 시 빌드를 실패시킨다.
function healthJson() {
  let env = {}
  let mode = 'production'
  return {
    name: 'eum-health-json',
    apply: 'build',
    configResolved(c) {
      // CI/호스팅이 주입하는 빌드 식별 값은 VITE_ 접두사가 없어 c.env 에 안 담긴다.
      // health.json 의 커밋·브랜치 표기를 위해 화이트리스트로만 끌어온다(시크릿 제외).
      const p = (typeof process !== 'undefined' && process.env) || {}
      const ci = {}
      for (const k of ['VERCEL_GIT_COMMIT_SHA', 'VERCEL_GIT_COMMIT_REF', 'VERCEL_ENV', 'GITHUB_SHA']) {
        if (p[k]) ci[k] = p[k]
      }
      env = { ...ci, ...(c.env || {}), MODE: c.mode }
      mode = c.mode
    },
    generateBundle() {
      const now = new Date().toISOString()
      const payload = withDependencies(
        buildHealth(env, {
          now,
          legal: { status: LEGAL_META.status, effectiveDate: LEGAL_META.effectiveDate },
        }),
        dependencySummary(env),
        { checkedAt: null },
      )
      const leaks = findSecretLeaks(payload)
      if (leaks.length) {
        // 방어선: 시크릿이 섞이면 조용히 배포되지 않도록 빌드를 중단한다.
        this.error(`health.json 에 시크릿으로 보이는 값이 포함됨: ${leaks.join(', ')}`)
      }
      this.emitFile({
        type: 'asset',
        fileName: 'health.json',
        source: JSON.stringify(payload, null, 2) + '\n',
      })
      if (mode !== 'production') console.log('[health] emitted health.json (mode=%s)', mode)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), healthJson()],
  optimizeDeps: {
    include: ['@reduxjs/toolkit', 'react-redux', 'recharts'],
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // 무거운 벤더를 별도 청크로 분리 — 병렬 다운로드 + 캐싱으로 초기 로딩 최적화
        // Vite 8(rolldown)에서는 manualChunks가 반드시 함수여야 함 (객체 형태 미지원)
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/lucide-react/')) return 'icons-vendor'
          if (
            id.includes('/recharts/') ||
            id.includes('/@reduxjs/toolkit/') ||
            id.includes('/react-redux/')
          )
            return 'charts-vendor'
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/'))
            return 'react-vendor'
        },
      },
    },
  },
})
