import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './EumApp.jsx'
import { installGlobalHandlers } from './eum/telemetry.js'

// 전역 오류·미처리 프라미스 거부를 텔레메트리로 연결(원격 전송은 플래그 OFF·[승인 필요]).
installGlobalHandlers()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
