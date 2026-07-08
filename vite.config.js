import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
