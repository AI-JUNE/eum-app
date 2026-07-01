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
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts-vendor': ['recharts', '@reduxjs/toolkit', 'react-redux'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
})
